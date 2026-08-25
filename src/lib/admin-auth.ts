import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { isRoleAllowed } from "@/lib/cms-validation.mjs";

export const ADMIN_COOKIE = "bhraman_admin";
export type AdminRole = "CONTENT_EDITOR" | "BOOKING_MANAGER" | "SUPER_ADMIN";

export interface AdminSession {
  userId: string;
  username: string;
  role: AdminRole;
}

function secret() {
  return process.env.ADMIN_SECRET ?? process.env.ADMIN_PASSWORD ?? "bhraman-dev-secret-super-key-2026";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function makeToken(
  days = 7,
  role: AdminRole = "SUPER_ADMIN",
  username = "admin",
  userId = "admin"
) {
  const exp = Date.now() + days * 86400_000;
  const payload = `${exp}.${role}.${encodeURIComponent(username)}.${encodeURIComponent(userId)}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string | undefined): AdminSession | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  
  // Format: [exp, role, username, userId, sig] or legacy [exp, role, sig] / [exp, sig]
  if (parts.length === 5) {
    const [expStr, role, rawUsername, rawUserId, sig] = parts;
    const exp = Number(expStr);
    if (!exp || exp < Date.now() || !sig) return null;
    if (!isRoleAllowed(role, ["CONTENT_EDITOR", "BOOKING_MANAGER", "SUPER_ADMIN"])) return null;
    const payload = `${expStr}.${role}.${rawUsername}.${rawUserId}`;
    const expected = sign(payload);
    try {
      if (timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
        return {
          userId: decodeURIComponent(rawUserId),
          username: decodeURIComponent(rawUsername),
          role: role as AdminRole,
        };
      }
    } catch {
      return null;
    }
  } else if (parts.length === 3) {
    // Legacy [exp, role, sig]
    const [expStr, role, sig] = parts;
    const exp = Number(expStr);
    if (!exp || exp < Date.now() || !sig) return null;
    if (!isRoleAllowed(role, ["CONTENT_EDITOR", "BOOKING_MANAGER", "SUPER_ADMIN"])) return null;
    const payload = `${expStr}.${role}`;
    const expected = sign(payload);
    try {
      if (timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
        return {
          userId: "legacy-admin",
          username: "admin",
          role: role as AdminRole,
        };
      }
    } catch {
      return null;
    }
  } else if (parts.length === 2) {
    // Legacy [exp, sig]
    const [expStr, sig] = parts;
    const exp = Number(expStr);
    if (!exp || exp < Date.now() || !sig) return null;
    const expected = sign(expStr);
    try {
      if (timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
        return {
          userId: "legacy-admin",
          username: "admin",
          role: "SUPER_ADMIN",
        };
      }
    } catch {
      return null;
    }
  }
  return null;
}

export function makeMfaPendingToken(userId: string, username: string, isSetup: boolean, secretBase32 = ""): string {
  const exp = Date.now() + 10 * 60_000; // 10 minutes expiry
  const payload = `mfa.${exp}.${encodeURIComponent(userId)}.${encodeURIComponent(username)}.${isSetup ? "1" : "0"}.${encodeURIComponent(secretBase32)}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyMfaPendingToken(token: string | undefined): { userId: string; username: string; isSetup: boolean; secretBase32: string } | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 7 || parts[0] !== "mfa") return null;

  const [, expStr, rawUserId, rawUsername, setupStr, rawSecret, sig] = parts;
  const exp = Number(expStr);
  if (!exp || exp < Date.now() || !sig) return null;

  const payload = `mfa.${expStr}.${rawUserId}.${rawUsername}.${setupStr}.${rawSecret}`;
  const expected = sign(payload);
  try {
    if (timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      return {
        userId: decodeURIComponent(rawUserId),
        username: decodeURIComponent(rawUsername),
        isSetup: setupStr === "1",
        secretBase32: decodeURIComponent(rawSecret),
      };
    }
  } catch {
    return null;
  }
  return null;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  return verifyToken(token);
}

export async function hasAdminRole(allowedRoles: AdminRole[]) {
  const session = await getAdminSession();
  return Boolean(session && isRoleAllowed(session.role, allowedRoles));
}

export async function isAdmin() {
  return Boolean(await getAdminSession());
}
