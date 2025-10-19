import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  // Seed plans
  const plans = [
    { name: '1 month', durationDays: 30, priceUsd: 400, priceRub: 4000 },
    { name: '3 months', durationDays: 90, priceUsd: 1000, priceRub: 10000 },
    { name: '6 months', durationDays: 180, priceUsd: 1800, priceRub: 18000 },
    { name: '12 months', durationDays: 365, priceUsd: 3000, priceRub: 30000 },
  ];

  for (const p of plans) {
    await prisma.plan.upsert({
      where: { name: p.name },
      update: p,
      create: p,
    });
  }

  if (process.env.SEED_ADMIN_EMAIL && process.env.SEED_ADMIN_PASSWORD) {
    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD, 10);
    await prisma.user.upsert({
      where: { email: process.env.SEED_ADMIN_EMAIL },
      update: { role: 'ADMIN', hashedPassword },
      create: { email: process.env.SEED_ADMIN_EMAIL, role: 'ADMIN', hashedPassword, name: 'Admin' },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
