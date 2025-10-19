import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function AdminPage() {
  const session = await getServerSession(authConfig);
  if (!session?.user) return <div>Unauthorized</div>;
  const me = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
  if (me?.role !== 'ADMIN') return <div>Forbidden</div>;

  const [users, companies, subscriptions, messages] = await Promise.all([
    prisma.user.count(),
    prisma.company.count(),
    prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    prisma.chatMessage.count(),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Админ-панель</h1>
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border p-4"><div className="text-xs text-neutral-500">Пользователи</div><div className="text-2xl font-bold">{users}</div></div>
        <div className="rounded-lg border p-4"><div className="text-xs text-neutral-500">Компании</div><div className="text-2xl font-bold">{companies}</div></div>
        <div className="rounded-lg border p-4"><div className="text-xs text-neutral-500">Активные подписки</div><div className="text-2xl font-bold">{subscriptions}</div></div>
        <div className="rounded-lg border p-4"><div className="text-xs text-neutral-500">Сообщения</div><div className="text-2xl font-bold">{messages}</div></div>
      </div>
    </div>
  );
}
