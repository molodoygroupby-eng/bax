import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { cookies } from 'next/headers';

export default async function DashboardPage() {
  const lang = cookies().get('lang')?.value || 'ru';
  const t = (k: string) => {
    const ru = {
      please: 'Пожалуйста, войдите в аккаунт.',
      signIn: 'Войти',
      cabinet: 'Личный кабинет',
      company: 'Компания',
      insert: 'Вставьте скрипт на сайт:',
      noCompany: 'У вас еще нет компании.',
      create: 'Создать и настроить',
    };
    const en = {
      please: 'Please sign in.',
      signIn: 'Sign in',
      cabinet: 'Dashboard',
      company: 'Company',
      insert: 'Insert this script on your site:',
      noCompany: 'You do not have a company yet.',
      create: 'Create and configure',
    };
    return (lang === 'ru' ? ru : en)[k as keyof typeof ru];
  };
  const session = await getServerSession(authConfig);
  const userId = (session as any)?.user?.id as string | undefined;
  if (!userId) {
    return (
      <div>
        <p>{t('please')}</p>
        <Link href="/api/auth/signin" className="underline">{t('signIn')}</Link>
      </div>
    );
  }
  const company = await prisma.company.findFirst({ where: { ownerId: userId }, include: { widget: true, subscriptions: true } });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t('cabinet')}</h1>
      {company ? (
        <div className="space-y-2">
          <div className="text-sm text-neutral-600">{t('company')}: {company.name}</div>
          {company.widget && (
            <div className="rounded-md bg-neutral-50 p-3 text-sm">
              {t('insert')}
              <pre className="mt-2 overflow-x-auto rounded bg-white p-2">
{`<script src="${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/widget.js?id=${company.widget.publicId}"></script>`}
              </pre>
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-3">
            <a href="/dashboard/analytics" className="rounded border p-3 hover:bg-neutral-50">{lang==='ru'?'Аналитика':'Analytics'}</a>
            <a href="/dashboard/referrals" className="rounded border p-3 hover:bg-neutral-50">{lang==='ru'?'Рефералы':'Referrals'}</a>
            <a href="/dashboard/chats" className="rounded border p-3 hover:bg-neutral-50">{lang==='ru'?'Диалоги':'Dialogs'}</a>
            <a href="/dashboard/integrations" className="rounded border p-3 hover:bg-neutral-50">{lang==='ru'?'Интеграции':'Integrations'}</a>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm text-neutral-600">{t('noCompany')}</p>
          <Link href="/dashboard/settings" className="underline">{t('create')}</Link>
        </div>
      )}
    </div>
  );
}
