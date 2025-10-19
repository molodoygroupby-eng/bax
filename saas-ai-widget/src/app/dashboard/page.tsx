import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await getServerSession(authConfig);
  if (!session?.user) {
    return (
      <div>
        <p>Пожалуйста, войдите в аккаунт.</p>
        <Link href="/api/auth/signin" className="underline">Sign in</Link>
      </div>
    );
  }
  const company = await prisma.company.findFirst({ where: { ownerId: (session.user as any).id }, include: { widget: true, subscriptions: true } });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Личный кабинет</h1>
      {company ? (
        <div className="space-y-2">
          <div className="text-sm text-neutral-600">Компания: {company.name}</div>
          {company.widget && (
            <div className="rounded-md bg-neutral-50 p-3 text-sm">
              Вставьте скрипт на сайт:
              <pre className="mt-2 overflow-x-auto rounded bg-white p-2">
{`<script src="${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/widget.js?id=${company.widget.publicId}"></script>`}
              </pre>
            </div>
          )}
        </div>
      ) : (
        <div>
          <p className="text-sm text-neutral-600">У вас еще нет компании.</p>
          <Link href="/dashboard/settings" className="underline">Создать и настроить</Link>
        </div>
      )}
    </div>
  );
}
