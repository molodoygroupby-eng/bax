import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  const { filename, type } = await req.json();
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
  const bucket = process.env.SUPABASE_BUCKET || 'logos';
  const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(filename);
  if (error) return new NextResponse(error.message, { status: 500 });
  return NextResponse.json(data);
}
