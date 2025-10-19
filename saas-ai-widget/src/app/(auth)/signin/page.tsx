import Link from 'next/link';

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-xl font-semibold">Вход</h1>
      <div className="mt-4 space-y-2 text-sm text-neutral-600">
        <a href="/api/auth/signin/google" className="underline">Войти через Google</a><br/>
        <a href="/api/auth/signin/github" className="underline">Войти через GitHub</a><br/>
        <a href="/api/auth/signin/auth0" className="underline">Войти через Auth0</a><br/>
        <a href="/api/auth/signin/email" className="underline">Войти по email</a>
      </div>
      <p className="mt-6 text-sm">
        Нет аккаунта? <Link href="/signup" className="underline">Зарегистрируйтесь</Link>
      </p>
    </div>
  );
}
