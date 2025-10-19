import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { companySchema } from '@/lib/validators';

export default async function SettingsPage() {
  const session = await getServerSession(authConfig);
  if (!session?.user) return <div>Unauthorized</div>;
  const userId = (session.user as any).id as string;
  const company = await prisma.company.findFirst({ where: { ownerId: userId } });

  return (
    <form className="mx-auto max-w-2xl space-y-4" action={async (formData: FormData) => {
      'use server';
      const data = Object.fromEntries(formData) as any;
      const parsed = companySchema.safeParse({
        name: String(data.name || ''),
        description: String(data.description || ''),
        industry: String(data.industry || ''),
        widgetName: String(data.widgetName || ''),
        systemPrompt: String(data.systemPrompt || ''),
        primaryColor: String(data.primaryColor || ''),
        bubbleStyle: (String(data.bubbleStyle || 'round') as any),
      });
      if (!parsed.success) return;
      if (company) {
        await prisma.company.update({ where: { id: company.id }, data: parsed.data });
      } else {
        await prisma.company.create({ data: { ...parsed.data, ownerId: userId, widget: { create: {} } } });
      }
    }}>
      <h1 className="text-2xl font-semibold">Настройки компании</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm">Название</label>
          <input name="name" defaultValue={company?.name ?? ''} className="mt-1 w-full rounded border p-2 text-sm" />
        </div>
        <div>
          <label className="text-sm">Сфера</label>
          <input name="industry" defaultValue={company?.industry ?? ''} className="mt-1 w-full rounded border p-2 text-sm" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm">Описание</label>
          <textarea name="description" defaultValue={company?.description ?? ''} className="mt-1 w-full rounded border p-2 text-sm" rows={3} />
        </div>
        <div>
          <label className="text-sm">Имя виджета</label>
          <input name="widgetName" defaultValue={company?.widgetName ?? 'AI Assistant'} className="mt-1 w-full rounded border p-2 text-sm" />
        </div>
        <div>
          <label className="text-sm">Основной цвет</label>
          <input name="primaryColor" defaultValue={company?.primaryColor ?? '#111827'} className="mt-1 w-full rounded border p-2 text-sm" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm">Системный промпт</label>
          <textarea name="systemPrompt" defaultValue={company?.systemPrompt ?? ''} className="mt-1 w-full rounded border p-2 text-sm" rows={5} />
        </div>
        <div>
          <label className="text-sm">Стиль баббла</label>
          <select name="bubbleStyle" defaultValue={company?.bubbleStyle ?? 'round'} className="mt-1 w-full rounded border p-2 text-sm">
            <option value="round">Круглый</option>
            <option value="square">Квадратный</option>
          </select>
        </div>
      </div>
      <button className="mt-6 rounded-md bg-black px-4 py-2 text-white">Сохранить</button>
    </form>
  );
}
