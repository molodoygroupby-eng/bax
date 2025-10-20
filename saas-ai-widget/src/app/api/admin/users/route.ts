import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authConfig);
  const userId = (session as any)?.user?.id as string | undefined;
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });
  const me = await prisma.user.findUnique({ where: { id: userId } });
  if (me?.role !== 'ADMIN') return new NextResponse('Forbidden', { status: 403 });
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(users);
}
