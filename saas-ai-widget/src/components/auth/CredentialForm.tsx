"use client";
import { useState } from 'react';
import { signIn } from 'next-auth/react';

export function CredentialForm({ lang = 'ru' }: { lang?: 'ru'|'en' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|undefined>();
  const t = (k: string) => {
    const ru = { email: 'Email', pass: 'Пароль', login: 'Войти', or: 'или', oauth: 'войдите через OAuth выше', err: 'Ошибка входа' };
    const en = { email: 'Email', pass: 'Password', login: 'Sign in', or: 'or', oauth: 'sign in with OAuth above', err: 'Sign-in error' };
    return (lang === 'ru' ? ru : en)[k as keyof typeof ru];
  };
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(undefined);
    const res = await signIn('credentials', { email, password, redirect: true, callbackUrl: '/dashboard' });
    if (res?.error) setError(res.error);
    setLoading(false);
  };
  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-2">
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder={t('email')} className="w-full rounded border p-2 text-sm" />
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder={t('pass')} className="w-full rounded border p-2 text-sm" />
      <button disabled={loading} className="rounded bg-black px-4 py-2 text-white disabled:opacity-50">{t('login')}</button>
      {error && <div className="text-sm text-red-600">{t('err')}: {error}</div>}
      <div className="text-xs text-neutral-500">{t('or')} {t('oauth')}</div>
    </form>
  );
}
