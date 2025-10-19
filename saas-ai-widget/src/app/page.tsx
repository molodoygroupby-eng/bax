import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto max-w-4xl text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Виджет ИИ-консультанта для вашего сайта
      </h1>
      <p className="mt-4 text-neutral-600">
        Добавьте умный чат-баббл на сайт: отвечает на вопросы клиентов с учетом
        контекста вашей компании.
      </p>
      <div className="mt-8 flex items-center justify-center gap-3">
        <Link
          href="/signup"
          className="inline-flex h-10 items-center rounded-md bg-black px-6 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Попробовать бесплатно
        </Link>
        <Link
          href="/pricing"
          className="inline-flex h-10 items-center rounded-md border px-6 text-sm font-medium hover:bg-neutral-50"
        >
          Тарифы
        </Link>
      </div>
      <div className="mt-12 grid gap-6 text-left sm:grid-cols-3">
        <div className="rounded-lg border p-4">
          <div className="text-sm font-semibold">Быстрый старт</div>
          <div className="mt-1 text-sm text-neutral-600">Вставьте один скрипт на сайт.</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-semibold">Гибкая настройка</div>
          <div className="mt-1 text-sm text-neutral-600">Цвета, логотип, приветствие, поведение ИИ.</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-semibold">Оплата и статистика</div>
          <div className="mt-1 text-sm text-neutral-600">Подписки, история чатов, трафик.</div>
        </div>
      </div>
    </div>
  );
}
