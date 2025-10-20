"use client";
import { useState } from 'react';

export function RegisterForm({ refCode, lang = 'ru' }: { refCode?: string; lang?: 'ru'|'en' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string|undefined>();
  const t = (k: string) => {
    const ru = { email: 'Email', pass: 'Пароль', register: 'Зарегистрироваться', done: 'Готово! Теперь войдите.' };
    const en = { email: 'Email', pass: 'Password', register: 'Sign up', done: 'Done! Now sign in.' };
    return (lang === 'ru' ? ru : en)[k as keyof typeof ru];
  };
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(undefined);
    const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, ref: refCode }) });
    if (res.ok) setOk(true); else setErr((await res.json().catch(()=>({error:'err'}))).error || 'err');
  };
  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-2">
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder={t('email')} className="w-full rounded border p-2 text-sm" />
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder={t('pass')} className="w-full rounded border p-2 text-sm" />
      <button className="rounded bg-black px-4 py-2 text-white">{t('register')}</button>
      {ok && <div className="text-sm text-green-600">{t('done')}</div>}
      {err && <div className="text-sm text-red-600">{err}</div>}
    </form>
  );
}
