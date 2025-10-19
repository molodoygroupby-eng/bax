import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-xl font-semibold">Регистрация</h1>
      <p className="mt-2 text-sm text-neutral-600">Используйте OAuth либо позже добавим email/password.</p>
      <div className="mt-4 space-y-2 text-sm text-neutral-600">
        <a href="/api/auth/signin/google" className="underline">Google</a><br/>
        <a href="/api/auth/signin/github" className="underline">GitHub</a>
      </div>
      <p className="mt-6 text-sm">
        Уже есть аккаунт? <Link href="/signin" className="underline">Войти</Link>
      </p>
    </div>
  );
}
