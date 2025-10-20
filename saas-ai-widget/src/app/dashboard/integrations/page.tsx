import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { encryptToBase64 } from '@/lib/crypto';

export default async function IntegrationsPage() {
  const session = await getServerSession(authConfig);
  const userId = (session as any)?.user?.id as string | undefined;
  if (!userId) return <div>Unauthorized</div>;
  const lang = cookies().get('lang')?.value || 'ru';
  const t = (k: string) => {
    const ru = { title: 'Интеграции', openai: 'OpenAI ключ', save: 'Сохранить', telegram: 'Telegram-бот', connect: 'Подключить бота', disconnect: 'Отключить', keyPH: 'sk-...'};
    const en = { title: 'Integrations', openai: 'OpenAI key', save: 'Save', telegram: 'Telegram bot', connect: 'Connect bot', disconnect: 'Disconnect', keyPH: 'sk-...'};
    return (lang === 'ru' ? ru : en)[k as keyof typeof ru];
  };
  const company = await prisma.company.findFirst({ where: { ownerId: userId } });
  const bot = await prisma.telegramBot.findUnique({ where: { userId } }).catch(() => null);

  async function saveOpenAI(formData: FormData) {
    'use server';
    const key = String(formData.get('openaiKey') || '');
    const c = await prisma.company.findFirst({ where: { ownerId: userId } });
    if (!c) return;
    await prisma.user.update({ where: { id: userId }, data: { openaiKeyEncrypted: key ? encryptToBase64(key) : null } });
  }

  async function connectTelegram(formData: FormData) {
    'use server';
    const botToken = String(formData.get('botToken') || '');
    if (!botToken) return;
    const secret = (Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)).slice(0, 24);
    const base = process.env.TELEGRAM_BOT_WEBHOOK_BASE || process.env.NEXT_PUBLIC_APP_URL || '';
    const url = `${base}/api/telegram/webhook?secret=${secret}`;
    // Set webhook
    try {
      await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });
    } catch {}
    await prisma.telegramBot.upsert({ where: { userId: userId! }, update: { tokenEncrypted: encryptToBase64(botToken), secretToken: secret }, create: { userId: userId!, tokenEncrypted: encryptToBase64(botToken), secretToken: secret } });
  }

  async function disconnectTelegram() {
    'use server';
    await prisma.telegramBot.delete({ where: { userId } }).catch(() => {});
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t('title')}</h1>
      <form action={saveOpenAI} className="space-y-2 max-w-md">
        <label className="text-sm">{t('openai')}</label>
        <input name="openaiKey" placeholder={t('keyPH')} className="mt-1 w-full rounded border p-2 text-sm" />
        <button className="rounded bg-black px-4 py-2 text-white">{t('save')}</button>
      </form>
      <div className="space-y-2">
        <div className="text-sm">{t('telegram')}</div>
        {!bot ? (
          <form action={connectTelegram} className="flex max-w-lg gap-2">
            <input name="botToken" placeholder="123456:ABC-DEF..." className="flex-1 rounded border p-2 text-sm" />
            <button className="rounded border px-4 py-2">{t('connect')}</button>
          </form>
        ) : (
          <form action={disconnectTelegram}>
            <button className="rounded border px-4 py-2">{t('disconnect')}</button>
          </form>
        )}
      </div>
    </div>
  );
}
