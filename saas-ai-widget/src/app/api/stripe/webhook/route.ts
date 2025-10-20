import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma';

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) return new NextResponse('Bad config', { status: 500 });
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });
  const buf = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, secret);
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const s = event.data.object as Stripe.Checkout.Session;
    const companyId = s.metadata?.companyId as string | undefined;
    const planId = s.metadata?.planId as string | undefined;
    if (companyId) {
      const sub = await prisma.subscription.create({
        data: {
          companyId,
          planId: planId ?? undefined,
          status: 'ACTIVE',
          provider: 'STRIPE',
          stripeCustomerId: s.customer as string | undefined,
          stripeSubscriptionId: s.subscription as string | undefined,
          currentPeriodEnd: s.expires_at ? new Date(s.expires_at * 1000) : null,
          payments: {
            create: {
              provider: 'STRIPE',
              amountCents: (s.amount_total ?? 0),
              currency: (s.currency ?? 'usd'),
              status: (s.payment_status ?? 'paid'),
              externalId: s.id,
            },
          },
        },
      });
      // Referral 10% bonus to referrer if any
      const company = await prisma.company.findUnique({ where: { id: companyId } });
      if (company) {
        const user = await prisma.user.findUnique({ where: { id: company.ownerId } });
        if (user) {
          const referral = await prisma.referral.findFirst({ where: { invitedId: user.id } });
          if (referral && s.amount_total) {
            const bonus = Math.floor(s.amount_total * 0.10);
            await prisma.user.update({ where: { id: referral.referrerId }, data: { bonusBalanceCents: { increment: bonus } } });
            await prisma.referral.update({ where: { id: referral.id }, data: { bonusCents: { increment: bonus } as any } });
          }
        }
      }
    }
  }

  return NextResponse.json({ ok: true });
}
