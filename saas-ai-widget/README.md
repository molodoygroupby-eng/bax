# AI Widget SaaS

Next.js 14 + TypeScript + Prisma + PostgreSQL + NextAuth + Stripe/YooKassa + OpenAI.

## Quick start
1. Copy `.env.example` to `.env` and fill values (DB, auth, OpenAI, billing).
2. Run `npm i`.
3. Run database and `npm run db:push` (or `db:migrate`).
4. Seed plans: `npm run db:seed`.
5. Start dev: `npm run dev`.

## Widget embed
```html
<script src="https://your-domain.com/widget.js?id=PUBLIC_WIDGET_ID"></script>
```

The script calls `/api/widget/chat` with the message and returns an AI reply using OpenAI API. Subscriptions are required.
