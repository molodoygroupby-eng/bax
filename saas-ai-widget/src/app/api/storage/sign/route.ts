import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  const { filename } = await req.json();
  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabase = createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY!);
  const bucket = process.env.SUPABASE_BUCKET || 'logos';

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(filename, 60); // 60s validity

  if (error || !data) return new NextResponse(error?.message || 'Failed to sign', { status: 500 });

  const publicUrl = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${bucket}/${data.path}`;
  return NextResponse.json({ ...data, publicUrl });
}
