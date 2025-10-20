import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);
  const userId = (session as any)?.user?.id as string | undefined;
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });
  let planId: string | undefined;
  const contentType = req.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const body = await req.json();
    planId = body.planId;
  } else {
    const form = await req.formData();
    planId = String(form.get('planId') || '');
  }
  const company = await prisma.company.findFirst({ where: { ownerId: userId } });
  if (!company) return new NextResponse('No company', { status: 400 });

  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) return new NextResponse('Plan not found', { status: 400 });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

  const priceMap: Record<number, string | undefined> = {
    30: process.env.STRIPE_PRICE_1M,
    90: process.env.STRIPE_PRICE_3M,
    180: process.env.STRIPE_PRICE_6M,
    365: process.env.STRIPE_PRICE_12M,
  };
  const priceId = priceMap[plan.durationDays];
  if (!priceId) return new NextResponse('Pricing missing', { status: 500 });

  const checkout = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=1`,
    metadata: { companyId: company.id, planId: plan.id },
  });

  return NextResponse.json({ url: checkout.url });
}
