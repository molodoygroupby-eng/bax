import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  const { email, password, ref } = await req.json().catch(() => ({} as any));
  if (!email || !password) return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: 'User exists' }, { status: 409 });
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, hashedPassword } });
  if (ref) {
    const referrer = await prisma.user.findFirst({ where: { referralCode: ref } });
    if (referrer && referrer.id !== user.id) {
      await prisma.referral.upsert({
        where: { referrerId_invitedId: { referrerId: referrer.id, invitedId: user.id } },
        update: {},
        create: { referrerId: referrer.id, invitedId: user.id },
      });
    }
  }
  return NextResponse.json({ ok: true });
}
