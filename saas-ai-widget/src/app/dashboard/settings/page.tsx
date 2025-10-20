import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { companySchema } from '@/lib/validators';
import { cookies } from 'next/headers';

export default async function SettingsPage() {
  const lang = cookies().get('lang')?.value || 'ru';
  const t = (k: string) => {
    const ru = {
      title: 'Настройки компании',
      name: 'Название',
      industry: 'Сфера',
      description: 'Описание',
      widgetName: 'Имя виджета',
      primaryColor: 'Основной цвет',
      systemPrompt: 'Системный промпт',
      bubbleStyle: 'Стиль баббла',
      round: 'Круглый',
      square: 'Квадратный',
      save: 'Сохранить',
    };
    const en = {
      title: 'Company settings',
      name: 'Name',
      industry: 'Industry',
      description: 'Description',
      widgetName: 'Widget name',
      primaryColor: 'Primary color',
      systemPrompt: 'System prompt',
      bubbleStyle: 'Bubble style',
      round: 'Round',
      square: 'Square',
      save: 'Save',
    };
    return (lang === 'ru' ? ru : en)[k as keyof typeof ru];
  };
  const session = await getServerSession(authConfig);
  const userId = (session as any)?.user?.id as string | undefined;
  if (!userId) return <div>Unauthorized</div>;
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
      <h1 className="text-2xl font-semibold">{t('title')}</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm">{t('name')}</label>
          <input name="name" defaultValue={company?.name ?? ''} className="mt-1 w-full rounded border p-2 text-sm" />
        </div>
        <div>
          <label className="text-sm">{t('industry')}</label>
          <input name="industry" defaultValue={company?.industry ?? ''} className="mt-1 w-full rounded border p-2 text-sm" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm">{t('description')}</label>
          <textarea name="description" defaultValue={company?.description ?? ''} className="mt-1 w-full rounded border p-2 text-sm" rows={3} />
        </div>
        <div>
          <label className="text-sm">{t('widgetName')}</label>
          <input name="widgetName" defaultValue={company?.widgetName ?? 'AI Assistant'} className="mt-1 w-full rounded border p-2 text-sm" />
        </div>
        <div>
          <label className="text-sm">{t('primaryColor')}</label>
          <input name="primaryColor" defaultValue={company?.primaryColor ?? '#111827'} className="mt-1 w-full rounded border p-2 text-sm" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm">{t('systemPrompt')}</label>
          <textarea name="systemPrompt" defaultValue={company?.systemPrompt ?? ''} className="mt-1 w-full rounded border p-2 text-sm" rows={5} />
        </div>
        <div>
          <label className="text-sm">{t('bubbleStyle')}</label>
          <select name="bubbleStyle" defaultValue={company?.bubbleStyle ?? 'round'} className="mt-1 w-full rounded border p-2 text-sm">
            <option value="round">{t('round')}</option>
            <option value="square">{t('square')}</option>
          </select>
        </div>
      </div>
      <button className="mt-6 rounded-md bg-black px-4 py-2 text-white">{t('save')}</button>
    </form>
  );
}
