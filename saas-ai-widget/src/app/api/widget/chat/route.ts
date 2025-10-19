import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const memory: Record<string, { count: number; resetAt: number }> = {};

export async function POST(req: Request) {
  const body = await req.json().catch(() => null) as { id?: string; message?: string } | null;
  if (!body?.id || !body?.message) return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0] || 'ip';
  const key = `${body.id}:${ip}`;
  const now = Date.now();
  const windowMs = 60_000; // 1 min
  const limit = 20;
  const slot = memory[key] && memory[key].resetAt > now ? memory[key] : { count: 0, resetAt: now + windowMs };
  slot.count += 1; memory[key] = slot;
  if (slot.count > limit) return NextResponse.json({ error: 'Rate limit' }, { status: 429 });

  const widget = await prisma.widget.findUnique({ where: { publicId: body.id }, include: { company: true } });
  if (!widget?.company) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Basic subscription check (can be improved later)
  const activeSub = await prisma.subscription.findFirst({ where: { companyId: widget.companyId, status: 'ACTIVE' } });
  if (!activeSub) return NextResponse.json({ error: 'Subscription required' }, { status: 402 });

  const session = await prisma.chatSession.create({ data: { widgetId: widget.id, companyId: widget.companyId } });
  await prisma.chatMessage.create({ data: { sessionId: session.id, role: 'user', content: body.message } });

  const systemPrompt = widget.company.systemPrompt || `Ты вежливый ИИ-помощник компании ${widget.company.name}. Отвечай кратко.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: body.message },
    ],
    temperature: 0.7,
  });

  const reply = completion.choices?.[0]?.message?.content ?? '';
  await prisma.chatMessage.create({ data: { sessionId: session.id, role: 'assistant', content: reply } });

  return NextResponse.json({ reply });
}
