import Link from 'next/link';
import { cookies } from 'next/headers';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function SignUpPage() {
  const lang = cookies().get('lang')?.value || 'ru';
  const t = (k: string) => {
    const ru = { title: 'Регистрация', oauth: 'Используйте OAuth либо позже добавим email/password.', have: 'Уже есть аккаунт?', login: 'Войти' };
    const en = { title: 'Sign up', oauth: 'Use OAuth for now; email/password coming soon.', have: 'Already have an account?', login: 'Sign in' };
    return (lang === 'ru' ? ru : en)[k as keyof typeof ru];
  };
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-xl font-semibold">{t('title')}</h1>
      <p className="mt-2 text-sm text-neutral-600">{t('oauth')}</p>
      <div className="mt-4 space-y-2 text-sm text-neutral-600">
        <a href="/api/auth/signin/google" className="underline">Google</a><br/>
        <a href="/api/auth/signin/github" className="underline">GitHub</a>
      </div>
      {/* Register with email/password */}
      <RegisterForm lang={lang as any} />
      <p className="mt-6 text-sm">
        {t('have')} <Link href="/signin" className="underline">{t('login')}</Link>
      </p>
    </div>
  );
}
