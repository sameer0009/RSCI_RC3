import crypto from 'crypto';

export function signingSecret(name: string): string {
  const value = process.env[name];
  if (value && value.length >= 32 && !/your-|change.?me|replace/i.test(value)) return value;
  if (process.env.NODE_ENV === 'production') throw new Error(`${name} must be an independent random secret of at least 32 characters`);
  // Development gets an ephemeral key rather than a publicly known signing key.
  return crypto.randomBytes(48).toString('hex');
}
