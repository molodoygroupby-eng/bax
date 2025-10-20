import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decryptFromBase64 } from '@/lib/crypto';
import { sendTelegramMessage } from '@/lib/telegram';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null) as { id?: string; name?: string; email?: string; phone?: string; message?: string } | null;
  if (!body?.id) return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  const widget = await prisma.widget.findUnique({ where: { publicId: body.id }, include: { company: true } });
  if (!widget?.company) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const lead = await prisma.lead.create({ data: { widgetId: widget.id, companyId: widget.companyId, name: body.name, email: body.email, phone: body.phone, message: body.message } });
  // Notify Telegram if connected
  const bot = await prisma.telegramBot.findUnique({ where: { userId: widget.company.ownerId } }).catch(() => null);
  if (bot?.chatId && bot.tokenEncrypted) {
    const token = decryptFromBase64(bot.tokenEncrypted);
    const lines = [
      `New lead from widget ${widget.company.widgetName}:`,
      body.name ? `Name: ${body.name}` : '',
      body.email ? `Email: ${body.email}` : '',
      body.phone ? `Phone: ${body.phone}` : '',
      body.message ? `Message: ${body.message}` : '',
    ].filter(Boolean).join('\n');
    try { await sendTelegramMessage(token, bot.chatId, lines); } catch {}
  }
  return NextResponse.json({ ok: true, leadId: lead.id });
}
