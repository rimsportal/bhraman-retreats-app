import { createHmac, randomBytes, pbkdf2Sync, timingSafeEqual } from "crypto";

// Base32 alphabet for RFC 3548 / RFC 4648
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function generateRandomBase32(length = 20): string {
  const bytes = randomBytes(length);
  let bits = 0;
  let value = 0;
  let output = "";

  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

export function base32Decode(input: string): Buffer {
  const cleaned = input.toUpperCase().replace(/=+$/, "").replace(/[\s-]/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < cleaned.length; i++) {
    const val = BASE32_ALPHABET.indexOf(cleaned[i]);
    if (val === -1) continue;

    value = (value << 5) | val;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

/**
 * Generates a 6-digit TOTP token according to RFC 6238 (HMAC-SHA1, 30-sec window).
 * Compatible with Microsoft Authenticator, Google Authenticator, Authy, Apple Keychain.
 */
export function generateTotp(secretBase32: string, counter?: number): string {
  const key = base32Decode(secretBase32);
  const timeStep = counter !== undefined ? counter : Math.floor(Date.now() / 1000 / 30);

  const buffer = Buffer.alloc(8);
  buffer.writeBigInt64BE(BigInt(timeStep));

  const hmac = createHmac("sha1", key).update(buffer).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = (binary % 1_000_000).toString().padStart(6, "0");
  return otp;
}

/**
 * Verifies a 6-digit TOTP token against secret with ±1 time step tolerance (30-second window).
 */
export function verifyTotp(token: string, secretBase32: string, window = 1): boolean {
  if (!token || typeof token !== "string" || !secretBase32) return false;
  const cleanToken = token.trim().replace(/\s/g, "");
  if (!/^\d{6}$/.test(cleanToken)) return false;

  const currentCounter = Math.floor(Date.now() / 1000 / 30);
  for (let offset = -window; offset <= window; offset++) {
    const expectedOtp = generateTotp(secretBase32, currentCounter + offset);
    if (timingSafeEqual(Buffer.from(cleanToken), Buffer.from(expectedOtp))) {
      return true;
    }
  }
  return false;
}

/**
 * Builds the standard `otpauth://` URI recognized by Microsoft Authenticator.
 */
export function buildTotpUri(username: string, secret: string, issuer = "Bhraman Retreats"): string {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedAccount = encodeURIComponent(username);
  return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}

// ── Password Hashing (PBKDF2 SHA-512, 100,000 iterations) ──

export function hashPassword(password: string, providedSalt?: string): { hash: string; salt: string } {
  const salt = providedSalt ?? randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 100_000, 64, "sha512").toString("hex");
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const { hash: computedHash } = hashPassword(password, salt);
  try {
    return timingSafeEqual(Buffer.from(computedHash, "hex"), Buffer.from(hash, "hex"));
  } catch {
    return false;
  }
}
