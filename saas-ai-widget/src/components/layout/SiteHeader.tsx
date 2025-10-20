import Link from 'next/link';
import { cookies } from 'next/headers';

export function SiteHeader() {
  const cookieStore = cookies();
  const lang = cookieStore.get('lang')?.value || 'ru';
  const t = (key: string) => {
    const dict: Record<string, Record<string, string>> = {
      ru: { pricing: 'Тарифы', dashboard: 'Кабинет', brand: 'BAX AI' },
      en: { pricing: 'Pricing', dashboard: 'Dashboard', brand: 'BAX AI' },
    };
    return (dict as any)[lang]?.[key] ?? key;
  };
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="font-semibold">
          {t('brand')}
        </Link>
        <nav className="space-x-4 text-sm">
          <Link href="/pricing">{t('pricing')}</Link>
          <Link href="/dashboard">{t('dashboard')}</Link>
          <form action="/api/i18n/switch" method="post" className="inline">
            <input type="hidden" name="next" value="/" />
            <button name="lang" value={lang === 'ru' ? 'en' : 'ru'} className="ml-2 rounded border px-2 py-1">
              {lang === 'ru' ? 'EN' : 'RU'}
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
