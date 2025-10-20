import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export default async function AdminUsersPage({ searchParams }: { searchParams: { q?: string } }) {
  const session = await getServerSession(authConfig);
  const userId = (session as any)?.user?.id as string | undefined;
  if (!userId) return <div>Unauthorized</div>;
  const me = await prisma.user.findUnique({ where: { id: userId } });
  if (me?.role !== 'ADMIN') return <div>Forbidden</div>;
  const q = searchParams?.q || '';
  const users = await prisma.user.findMany({ where: q ? { email: { contains: q, mode: 'insensitive' } } : {}, orderBy: { createdAt: 'desc' } });
  const lang = cookies().get('lang')?.value || 'ru';
  const t = (k: string) => {
    const ru = { title: 'Пользователи', search: 'Поиск', email: 'Email', role: 'Роль', created: 'Создан', stats: 'Статистика', dialogs: 'Диалоги', leads: 'Заявки' };
    const en = { title: 'Users', search: 'Search', email: 'Email', role: 'Role', created: 'Created', stats: 'Stats', dialogs: 'Dialogs', leads: 'Leads' };
    return (lang === 'ru' ? ru : en)[k as keyof typeof ru];
  };
  const stats = await Promise.all(users.map(async u => {
    const companies = await prisma.company.findMany({ where: { ownerId: u.id } });
    const companyIds = companies.map(c => c.id);
    const dialogs = await prisma.chatSession.count({ where: { companyId: { in: companyIds } } });
    const leads = await prisma.lead.count({ where: { companyId: { in: companyIds } } });
    return { userId: u.id, dialogs, leads };
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{t('title')}</h1>
      <form className="max-w-sm">
        <input name="q" defaultValue={q} placeholder={t('search')} className="w-full rounded border p-2 text-sm" />
      </form>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-2">{t('email')}</th>
              <th className="p-2">{t('role')}</th>
              <th className="p-2">{t('created')}</th>
              <th className="p-2">{t('stats')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const s = stats.find(x => x.userId === u.id);
              return (
                <tr key={u.id} className="border-t">
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.role}</td>
                  <td className="p-2">{u.createdAt?.toISOString?.() || ''}</td>
                  <td className="p-2">{t('dialogs')}: {s?.dialogs ?? 0}, {t('leads')}: {s?.leads ?? 0}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
