import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Simplified YooKassa callback handler placeholder
export async function POST(req: Request) {
  const body = await req.json().catch(() => null) as any;
  const paymentId = body?.object?.id as string | undefined;
  const companyId = body?.object?.metadata?.companyId as string | undefined;
  const planId = body?.object?.metadata?.planId as string | undefined;

  if (paymentId && companyId) {
    await prisma.subscription.create({
      data: {
        companyId,
        planId: planId ?? undefined,
        status: 'ACTIVE',
        provider: 'YOOKASSA',
        yookassaPaymentId: paymentId,
        payments: { create: { provider: 'YOOKASSA', amountCents: body?.object?.amount?.value ? Math.round(Number(body.object.amount.value) * 100) : 0, currency: body?.object?.amount?.currency ?? 'RUB', status: body?.object?.status ?? 'succeeded', externalId: paymentId } },
      },
    });
  }

  return NextResponse.json({ ok: true });
}
