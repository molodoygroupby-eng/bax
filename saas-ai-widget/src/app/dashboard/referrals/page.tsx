import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export default async function ReferralsPage() {
  const session = await getServerSession(authConfig);
  const userId = (session as any)?.user?.id as string | undefined;
  if (!userId) return <div>Unauthorized</div>;
  const lang = cookies().get('lang')?.value || 'ru';
  const t = (k: string) => {
    const ru = { title: 'Реферальная программа', link: 'Ваша ссылка', stats: 'Статистика', invited: 'Приглашено', bonus: 'Бонусный баланс' };
    const en = { title: 'Referral program', link: 'Your link', stats: 'Stats', invited: 'Invited', bonus: 'Bonus balance' };
    return (lang === 'ru' ? ru : en)[k as keyof typeof ru];
  };
  const me = await prisma.user.findUnique({ where: { id: userId } });
  const code = me?.referralCode ?? (await prisma.user.update({ where: { id: userId }, data: { referralCode: (Math.random().toString(36).slice(2, 10)).toUpperCase() } })).referralCode!;
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/signup?ref=${code}`;
  const referrals = await prisma.referral.findMany({ where: { referrerId: userId } });
  const invited = referrals.length;
  const bonus = (me?.bonusBalanceCents ?? 0) / 100;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{t('title')}</h1>
      <div className="rounded border p-4">
        <div className="text-sm text-neutral-600">{t('link')}</div>
        <div className="mt-1 break-all text-sm">{url}</div>
      </div>
      <div className="rounded border p-4">
        <div className="text-sm text-neutral-600">{t('stats')}</div>
        <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-neutral-500">{t('invited')}</div>
            <div className="text-xl font-semibold">{invited}</div>
          </div>
          <div>
            <div className="text-neutral-500">{t('bonus')}</div>
            <div className="text-xl font-semibold">{bonus.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
