import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import YooKassa from 'yookassa';

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });
  const { amount, companyId, planId } = await req.json();

  const shopId = process.env.YOOKASSA_SHOP_ID!;
  const secret = process.env.YOOKASSA_SECRET_KEY!;
  const yoo = new YooKassa({ shopId, secretKey: secret });

  const payment = await yoo.createPayment({
    amount: { value: String((amount / 100).toFixed(2)), currency: 'RUB' },
    capture: true,
    confirmation: { type: 'redirect', return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?paid=1` },
    metadata: { companyId, planId },
    description: 'Widget subscription',
  });

  return NextResponse.json({ confirmation_url: payment.confirmation?.confirmation_url });
}
