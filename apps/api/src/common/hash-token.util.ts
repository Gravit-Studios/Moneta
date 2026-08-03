import { createHash } from 'crypto';

// Refresh tokens and password-reset tokens are opaque random strings handed to
// the client; only their SHA-256 digest is ever persisted, so a stolen DB dump
// never yields a usable token (unlike the password hash, these don't need
// Argon2 — there's nothing to brute-force offline, the secret is high-entropy
// random, not a human-chosen password).
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
