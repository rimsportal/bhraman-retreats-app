import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import {
  ADMIN_COOKIE,
  makeToken,
  makeMfaPendingToken,
} from "@/lib/admin-auth";
import {
  verifyPassword,
  generateRandomBase32,
  buildTotpUri,
} from "@/lib/totp";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { username, password } = body;

  // Handle single password legacy fallback if username is omitted or "admin"
  if ((!username || username === "admin") && process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD) {
    const res = NextResponse.json({ ok: true, legacy: true });
    res.cookies.set(ADMIN_COOKIE, makeToken(7, "SUPER_ADMIN", "admin", "legacy-admin"), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 86400,
    });
    return res;
  }

  if (!username || !password || typeof username !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
  }

  const cleanUsername = username.trim().toLowerCase();
  const user = await prisma.adminUser.findUnique({
    where: { username: cleanUsername },
  });

  if (!user || !verifyPassword(password, user.passwordHash, user.salt)) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  // If user has not enabled MFA yet (First login flow)
  if (!user.mfaEnabled || !user.mfaSecret) {
    const tempSecret = generateRandomBase32(20);
    const otpauthUri = buildTotpUri(user.username, tempSecret);
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUri, {
      margin: 2,
      width: 240,
      color: {
        dark: "#0F172A",
        light: "#FFFFFF",
      },
    });

    const pendingToken = makeMfaPendingToken(user.id, user.username, true, tempSecret);

    return NextResponse.json({
      status: "SETUP_REQUIRED",
      pendingToken,
      qrCode: qrCodeDataUrl,
      secret: tempSecret,
      mustChangePassword: user.mustChangePassword,
      username: user.username,
    });
  }

  // User has active MFA: Prompt for 6-digit OTP code
  const pendingToken = makeMfaPendingToken(user.id, user.username, false, user.mfaSecret);
  return NextResponse.json({
    status: "MFA_REQUIRED",
    pendingToken,
    mustChangePassword: user.mustChangePassword,
    username: user.username,
  });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
