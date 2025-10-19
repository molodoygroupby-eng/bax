import { NextResponse } from 'next/server';

// Placeholder for rate limiting (implement with Upstash or KV later)
export async function GET() {
  return NextResponse.json({ ok: true });
}
