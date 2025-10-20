import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export default async function ChatsPage() {
  const session = await getServerSession(authConfig);
  const userId = (session as any)?.user?.id as string | undefined;
  if (!userId) return <div>Unauthorized</div>;
  const lang = cookies().get('lang')?.value || 'ru';
  const t = (k: string) => {
    const ru = { title: 'Диалоги', open: 'Открыть', close: 'Закрыть', say: 'Сказать от имени оператора', send: 'Отправить' };
    const en = { title: 'Dialogs', open: 'Open', close: 'Close', say: 'Say as operator', send: 'Send' };
    return (lang === 'ru' ? ru : en)[k as keyof typeof ru];
  };
  const company = await prisma.company.findFirst({ where: { ownerId: userId } });
  if (!company) return <div>No company</div>;
  const sessions = await prisma.chatSession.findMany({ where: { companyId: company.id }, orderBy: { startedAt: 'desc' }, include: { messages: { orderBy: { createdAt: 'asc' } } } });

  async function closeSession(formData: FormData) {
    'use server';
    const id = String(formData.get('id'));
    await prisma.chatSession.update({ where: { id }, data: { status: 'CLOSED', endedAt: new Date() } });
  }

  async function sayAsOperator(formData: FormData) {
    'use server';
    const id = String(formData.get('id'));
    const text = String(formData.get('text') || '');
    if (!text) return;
    await prisma.chatMessage.create({ data: { sessionId: id, role: 'assistant', content: text } });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{t('title')}</h1>
      <div className="space-y-4">
        {sessions.map(s => (
          <div key={s.id} className="rounded border p-3">
            <div className="mb-2 text-xs text-neutral-500">{new Date(s.startedAt).toLocaleString()} • {s.status}</div>
            <div className="space-y-1 text-sm">
              {s.messages.map(m => (
                <div key={m.id} className={m.role === 'user' ? '' : 'text-blue-700'}>
                  <span className="font-medium">{m.role}: </span>{m.content}
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2">
              {s.status === 'OPEN' && (
                <form action={closeSession}><input type="hidden" name="id" value={s.id} /><button className="rounded border px-2 py-1 text-xs">{t('close')}</button></form>
              )}
            </div>
            <form action={sayAsOperator} className="mt-2 flex gap-2">
              <input name="id" type="hidden" value={s.id} />
              <input name="text" placeholder={t('say')} className="flex-1 rounded border p-2 text-sm" />
              <button className="rounded bg-black px-3 py-2 text-xs text-white">{t('send')}</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
