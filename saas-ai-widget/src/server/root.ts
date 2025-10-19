import { router } from './trpc';
import { companyRouter } from './routers/company';

export const appRouter = router({
  company: companyRouter,
});

export type AppRouter = typeof appRouter;
