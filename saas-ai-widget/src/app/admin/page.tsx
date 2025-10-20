import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export default async function AdminPage() {
  const lang = cookies().get('lang')?.value || 'ru';
  const t = (k: string) => {
    const ru = { title: 'Админ-панель', users: 'Пользователи', companies: 'Компании', active: 'Активные подписки', messages: 'Сообщения' };
    const en = { title: 'Admin panel', users: 'Users', companies: 'Companies', active: 'Active subscriptions', messages: 'Messages' };
    return (lang === 'ru' ? ru : en)[k as keyof typeof ru];
  };
  const session = await getServerSession(authConfig);
  const userId = (session as any)?.user?.id as string | undefined;
  if (!userId) return <div>Unauthorized</div>;
  const me = await prisma.user.findUnique({ where: { id: userId } });
  if (me?.role !== 'ADMIN') return <div>Forbidden</div>;

  const [users, companies, subscriptions, messages] = await Promise.all([
    prisma.user.count(),
    prisma.company.count(),
    prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    prisma.chatMessage.count(),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{t('title')}</h1>
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border p-4"><div className="text-xs text-neutral-500">{t('users')}</div><div className="text-2xl font-bold">{users}</div></div>
        <div className="rounded-lg border p-4"><div className="text-xs text-neutral-500">{t('companies')}</div><div className="text-2xl font-bold">{companies}</div></div>
        <div className="rounded-lg border p-4"><div className="text-xs text-neutral-500">{t('active')}</div><div className="text-2xl font-bold">{subscriptions}</div></div>
        <div className="rounded-lg border p-4"><div className="text-xs text-neutral-500">{t('messages')}</div><div className="text-2xl font-bold">{messages}</div></div>
      </div>
      <div><a href="/admin/users" className="underline text-sm">Users list</a></div>
    </div>
  );
}
