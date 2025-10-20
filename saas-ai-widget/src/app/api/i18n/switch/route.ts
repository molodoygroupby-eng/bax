import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const form = await req.formData();
  const lang = String(form.get('lang') || 'ru');
  const next = String(form.get('next') || '/');
  if (!['ru', 'en'].includes(lang)) return new NextResponse('Bad lang', { status: 400 });
  const res = NextResponse.redirect(new URL(next, req.url));
  res.cookies.set('lang', lang, { httpOnly: false, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 365 });
  return res;
}
