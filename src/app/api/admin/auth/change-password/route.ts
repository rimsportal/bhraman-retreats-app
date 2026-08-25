import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import { verifyPassword, hashPassword } from "@/lib/totp";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { currentPassword, newPassword } = await request.json().catch(() => ({}));
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Current password and new password are required" }, { status: 400 });
  }

  if (typeof newPassword !== "string" || newPassword.trim().length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters long" }, { status: 400 });
  }

  const user = await prisma.adminUser.findUnique({
    where: { username: session.username },
  });

  if (!user) {
    return NextResponse.json({ error: "Admin user not found" }, { status: 404 });
  }

  const isCurrentValid = verifyPassword(currentPassword, user.passwordHash, user.salt);
  if (!isCurrentValid) {
    return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
  }

  const { hash, salt } = hashPassword(newPassword.trim());
  await prisma.adminUser.update({
    where: { id: user.id },
    data: {
      passwordHash: hash,
      salt: salt,
      mustChangePassword: false,
    },
  });

  return NextResponse.json({ ok: true, message: "Password updated successfully" });
}
