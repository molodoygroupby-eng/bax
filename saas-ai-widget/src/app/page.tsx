import Link from "next/link";
import { cookies } from 'next/headers';

export default function Home() {
  const cookieStore = cookies();
  const lang = cookieStore.get('lang')?.value || 'ru';
  const t = (k: string) => {
    const ru = {
      title: 'Виджет ИИ-консультанта для вашего сайта',
      sub: 'Добавьте умный чат-баббл на сайт: отвечает на вопросы клиентов с учетом контекста вашей компании.',
      try: 'Попробовать бесплатно',
      pricing: 'Тарифы',
      f1: 'Быстрый старт',
      f1d: 'Вставьте один скрипт на сайт.',
      f2: 'Гибкая настройка',
      f2d: 'Цвета, логотип, приветствие, поведение ИИ.',
      f3: 'Оплата и статистика',
      f3d: 'Подписки, история чатов, трафик.',
    };
    const en = {
      title: 'AI Assistant widget for your website',
      sub: 'Add a smart chat bubble that answers customer questions with your company context.',
      try: 'Try for free',
      pricing: 'Pricing',
      f1: 'Fast start',
      f1d: 'Insert a single script on your site.',
      f2: 'Flexible setup',
      f2d: 'Colors, logo, greeting, AI behavior.',
      f3: 'Payments & analytics',
      f3d: 'Subscriptions, chat history, traffic.',
    };
    return (lang === 'ru' ? ru : en)[k as keyof typeof ru];
  };
  return (
    <div className="mx-auto max-w-4xl text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t('title')}</h1>
      <p className="mt-4 text-neutral-600">{t('sub')}</p>
      <div className="mt-8 flex items-center justify-center gap-3">
        <Link
          href="/signup"
          className="inline-flex h-10 items-center rounded-md bg-black px-6 text-sm font-medium text-white hover:bg-neutral-800"
        >
          {t('try')}
        </Link>
        <Link
          href="/pricing"
          className="inline-flex h-10 items-center rounded-md border px-6 text-sm font-medium hover:bg-neutral-50"
        >
          {t('pricing')}
        </Link>
      </div>
      <div className="mt-12 grid gap-6 text-left sm:grid-cols-3">
        <div className="rounded-lg border p-4">
          <div className="text-sm font-semibold">{t('f1')}</div>
          <div className="mt-1 text-sm text-neutral-600">{t('f1d')}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-semibold">{t('f2')}</div>
          <div className="mt-1 text-sm text-neutral-600">{t('f2d')}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-semibold">{t('f3')}</div>
          <div className="mt-1 text-sm text-neutral-600">{t('f3d')}</div>
        </div>
      </div>
    </div>
  );
}
