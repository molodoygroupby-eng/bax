import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Simplified YooKassa callback handler placeholder
export async function POST(req: Request) {
  const body = await req.json().catch(() => null) as any;
  const paymentId = body?.object?.id as string | undefined;
  const companyId = body?.object?.metadata?.companyId as string | undefined;
  const planId = body?.object?.metadata?.planId as string | undefined;

  if (paymentId && companyId) {
    const amountCents = body?.object?.amount?.value ? Math.round(Number(body.object.amount.value) * 100) : 0;
    await prisma.subscription.create({
      data: {
        companyId,
        planId: planId ?? undefined,
        status: 'ACTIVE',
        provider: 'YOOKASSA',
        yookassaPaymentId: paymentId,
        payments: { create: { provider: 'YOOKASSA', amountCents, currency: body?.object?.amount?.currency ?? 'RUB', status: body?.object?.status ?? 'succeeded', externalId: paymentId } },
      },
    });
    // Referral 10% bonus for referrer
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (company) {
      const user = await prisma.user.findUnique({ where: { id: company.ownerId } });
      if (user) {
        const referral = await prisma.referral.findFirst({ where: { invitedId: user.id } });
        if (referral && amountCents) {
          const bonus = Math.floor(amountCents * 0.10);
          await prisma.user.update({ where: { id: referral.referrerId }, data: { bonusBalanceCents: { increment: bonus } } });
          await prisma.referral.update({ where: { id: referral.id }, data: { bonusCents: { increment: bonus } } });
        }
      }
    }
  }

  return NextResponse.json({ ok: true });
}
