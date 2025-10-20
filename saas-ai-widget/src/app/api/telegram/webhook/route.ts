import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decryptFromBase64 } from '@/lib/crypto';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null) as any;
  const secret = new URL(req.url).searchParams.get('secret') || '';
  const bot = await prisma.telegramBot.findFirst({ where: { secretToken: secret } });
  if (!bot) return new NextResponse('Forbidden', { status: 403 });
  // Minimal webhook: store chat id for replies
  const chatId = body?.message?.chat?.id?.toString();
  if (chatId && !bot.chatId) {
    await prisma.telegramBot.update({ where: { userId: bot.userId }, data: { chatId } });
  }
  return NextResponse.json({ ok: true });
}
