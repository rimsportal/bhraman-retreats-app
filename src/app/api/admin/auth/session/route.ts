import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ authed: false, user: null });
  }

  return NextResponse.json({
    authed: true,
    user: {
      username: session.username,
      role: session.role,
    },
  });
}
