import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/root';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: async () => {
      const session = await getServerSession(authConfig);
      return { userId: session?.user && (session.user as any).id };
    },
    onError({ error }) {
      console.error(error);
    },
  });

export { handler as GET, handler as POST };
