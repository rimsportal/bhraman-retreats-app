import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";

const ENQUIRY_STATUSES = ["NEW", "CONTACTED", "IN_PROGRESS", "CONVERTED", "CLOSED"];

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const enquiries = await prisma.enquiry.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        retreat: {
          select: { id: true, title: true, slug: true, edition: true },
        },
      },
    });

    return NextResponse.json({ enquiries });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch enquiries" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, status } = await request.json().catch(() => ({}));
    if (typeof id !== "string") {
      return NextResponse.json({ error: "Enquiry id required" }, { status: 400 });
    }

    if (!status || !ENQUIRY_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const updated = await prisma.enquiry.update({
      where: { id },
      data: { status },
      include: {
        retreat: {
          select: { id: true, title: true, slug: true, edition: true },
        },
      },
    });

    return NextResponse.json({ enquiry: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update enquiry" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Enquiry id required" }, { status: 400 });
    }

    await prisma.enquiry.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete enquiry" }, { status: 500 });
  }
}
