import crypto from 'crypto';

const getKey = (): Buffer => {
  const key = process.env.APP_ENCRYPTION_KEY || '';
  if (!key) throw new Error('APP_ENCRYPTION_KEY not set');
  // Allow hex or base64 or plain string; normalize to 32 bytes
  let buf: Buffer;
  if (/^[0-9a-fA-F]{64}$/.test(key)) buf = Buffer.from(key, 'hex');
  else if (/^[A-Za-z0-9+/=]+$/.test(key) && key.length >= 44) buf = Buffer.from(key, 'base64');
  else buf = crypto.createHash('sha256').update(key).digest();
  if (buf.length !== 32) buf = crypto.createHash('sha256').update(buf).digest();
  return buf;
};

export function encryptToBase64(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const key = getKey();
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

export function decryptFromBase64(payload: string): string {
  const raw = Buffer.from(payload, 'base64');
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const enc = raw.subarray(28);
  const key = getKey();
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
  return dec.toString('utf8');
}
