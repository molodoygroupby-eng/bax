import Link from 'next/link';
import { cookies } from 'next/headers';
import { CredentialForm } from '@/components/auth/CredentialForm';

export default function SignInPage() {
  const lang = cookies().get('lang')?.value || 'ru';
  const t = (k: string) => {
    const ru = { title: 'Вход', no: 'Нет аккаунта?', signUp: 'Зарегистрируйтесь', g: 'Войти через Google', gh: 'Войти через GitHub' };
    const en = { title: 'Sign in', no: "Don't have an account?", signUp: 'Sign up', g: 'Sign in with Google', gh: 'Sign in with GitHub' };
    return (lang === 'ru' ? ru : en)[k as keyof typeof ru];
  };
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-xl font-semibold">{t('title')}</h1>
      <div className="mt-4 space-y-2 text-sm text-neutral-600">
        <a href="/api/auth/signin/google" className="underline">{t('g')}</a><br/>
        <a href="/api/auth/signin/github" className="underline">{t('gh')}</a>
      </div>
      <CredentialForm lang={lang as any} />
      <p className="mt-6 text-sm">
        {t('no')} <Link href="/signup" className="underline">{t('signUp')}</Link>
      </p>
    </div>
  );
}
