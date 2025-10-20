import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export default async function AnalyticsPage() {
  const session = await getServerSession(authConfig);
  const userId = (session as any)?.user?.id as string | undefined;
  if (!userId) return <div>Unauthorized</div>;
  const lang = cookies().get('lang')?.value || 'ru';
  const t = (k: string) => {
    const ru = { title: 'Аналитика', dialogs: 'Диалоги', leads: 'Заявки', avg: 'Среднее время ответа' };
    const en = { title: 'Analytics', dialogs: 'Dialogs', leads: 'Leads', avg: 'Average response time' };
    return (lang === 'ru' ? ru : en)[k as keyof typeof ru];
  };
  const company = await prisma.company.findFirst({ where: { ownerId: userId } });
  if (!company) return <div>No company</div>;
  const [dialogs, leads] = await Promise.all([
    prisma.chatSession.count({ where: { companyId: company.id } }),
    prisma.lead.count({ where: { companyId: company.id } }),
  ]);
  // naive avg response: time between first user message and first assistant reply
  const sessions = await prisma.chatSession.findMany({ where: { companyId: company.id }, include: { messages: true }, take: 50, orderBy: { startedAt: 'desc' } });
  const avgs: number[] = [];
  for (const s of sessions) {
    const userMsg = s.messages.find(m => m.role === 'user');
    const aiMsg = s.messages.find(m => m.role === 'assistant');
    if (userMsg && aiMsg) avgs.push(Math.max(0, aiMsg.createdAt.getTime() - userMsg.createdAt.getTime()));
  }
  const avgMs = avgs.length ? Math.round(avgs.reduce((a, b) => a + b, 0) / avgs.length) : 0;
  const avgSec = Math.round(avgMs / 1000);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{t('title')}</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-4"><div className="text-xs text-neutral-500">{t('dialogs')}</div><div className="text-2xl font-bold">{dialogs}</div></div>
        <div className="rounded-lg border p-4"><div className="text-xs text-neutral-500">{t('leads')}</div><div className="text-2xl font-bold">{leads}</div></div>
        <div className="rounded-lg border p-4"><div className="text-xs text-neutral-500">{t('avg')}</div><div className="text-2xl font-bold">{avgSec}s</div></div>
      </div>
    </div>
  );
}
