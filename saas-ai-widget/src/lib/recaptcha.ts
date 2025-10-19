export async function verifyRecaptcha(token: string): Promise<boolean> {
  if (!process.env.RECAPTCHA_SECRET_KEY) return true; // allow if not configured
  try {
    const resp = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: process.env.RECAPTCHA_SECRET_KEY, response: token }),
    });
    const data = (await resp.json()) as { success?: boolean; score?: number };
    if (!data.success) return false;
    if (typeof data.score === 'number' && data.score < 0.3) return false;
    return true;
  } catch {
    return false;
  }
}
