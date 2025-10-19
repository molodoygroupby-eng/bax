import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { companySchema } from '@/lib/validators';
import { prisma } from '@/lib/prisma';

export const companyRouter = router({
  upsert: protectedProcedure
    .input(companySchema)
    .mutation(async ({ input, ctx }) => {
      const userId = (ctx as any).userId as string;
      const existing = await prisma.company.findFirst({ where: { ownerId: userId } });
      if (existing) {
        const updated = await prisma.company.update({ where: { id: existing.id }, data: input });
        return updated;
      }
      const created = await prisma.company.create({ data: { ...input, ownerId: userId, widget: { create: {} } } });
      return created;
    }),
  getMine: protectedProcedure.query(async ({ ctx }) => {
    const userId = (ctx as any).userId as string;
    return prisma.company.findFirst({ where: { ownerId: userId }, include: { widget: true, subscriptions: true } });
  }),
});
