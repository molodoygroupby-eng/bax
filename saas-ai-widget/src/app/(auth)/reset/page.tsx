export default function ResetPage() {
  return (
    <form className="mx-auto max-w-sm space-y-3" action={async (formData: FormData) => {
      'use server';
      const email = String(formData.get('email') || '');
      const password = String(formData.get('password') || '');
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/reset`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    }}>
      <h1 className="text-xl font-semibold">Сброс пароля</h1>
      <input name="email" placeholder="Email" className="w-full rounded border p-2 text-sm" />
      <input name="password" placeholder="Новый пароль" type="password" className="w-full rounded border p-2 text-sm" />
      <button className="rounded-md bg-black px-4 py-2 text-white">Сохранить</button>
    </form>
  );
}
