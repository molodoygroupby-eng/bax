import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export default async function PricingPage() {
  const plans = await prisma.plan.findMany({ where: { active: true }, orderBy: { durationDays: 'asc' } });
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold">Тарифы</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((p) => (
          <form key={p.id} action={async () => { 'use server'; revalidatePath('/pricing'); }} className="rounded-lg border p-4">
            <div className="text-sm font-semibold">{p.name}</div>
            <div className="mt-1 text-sm text-neutral-600">{p.durationDays} дней</div>
            <div className="mt-4 text-lg font-bold">${(p.priceUsd / 100).toFixed(0)}</div>
            <input type="hidden" name="planId" value={p.id} />
            <button formAction="/api/billing/checkout" className="mt-4 h-9 w-full rounded-md bg-black text-white">Оформить</button>
          </form>
        ))}
      </div>
    </div>
  );
}
