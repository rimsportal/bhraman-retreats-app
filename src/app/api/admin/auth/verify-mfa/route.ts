import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ADMIN_COOKIE,
  makeToken,
  verifyMfaPendingToken,
  AdminRole,
} from "@/lib/admin-auth";
import { verifyTotp, hashPassword } from "@/lib/totp";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { pendingToken, otp, newPassword } = body;

  if (!pendingToken || !otp) {
    return NextResponse.json({ error: "Missing verification parameters" }, { status: 400 });
  }

  const pending = verifyMfaPendingToken(pendingToken);
  if (!pending) {
    return NextResponse.json({ error: "MFA session expired. Please sign in again." }, { status: 401 });
  }

  const user = await prisma.adminUser.findUnique({
    where: { id: pending.userId },
  });

  if (!user) {
    return NextResponse.json({ error: "Admin user not found" }, { status: 404 });
  }

  const secret = pending.isSetup ? pending.secretBase32 : user.mfaSecret;
  if (!secret) {
    return NextResponse.json({ error: "MFA secret is missing. Please restart login." }, { status: 400 });
  }

  const isValidOtp = verifyTotp(otp, secret, 1);
  if (!isValidOtp) {
    return NextResponse.json({ error: "Invalid 6-digit code. Please check your Microsoft Authenticator app." }, { status: 401 });
  }

  // Handle First-Time Login / Password Change
  if (pending.isSetup || user.mustChangePassword) {
    if (!newPassword || typeof newPassword !== "string" || newPassword.trim().length < 8) {
      return NextResponse.json({ error: "Please enter a new password (minimum 8 characters)." }, { status: 400 });
    }

    const { hash, salt } = hashPassword(newPassword.trim());
    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        passwordHash: hash,
        salt: salt,
        mfaSecret: secret,
        mfaEnabled: true,
        mustChangePassword: false,
        lastLoginAt: new Date(),
      },
    });
  } else {
    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
      },
    });
  }

  const response = NextResponse.json({
    ok: true,
    user: {
      username: user.username,
      role: user.role,
    },
  });

  response.cookies.set(ADMIN_COOKIE, makeToken(7, user.role as AdminRole, user.username, user.id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 86400,
  });

  return response;
}
