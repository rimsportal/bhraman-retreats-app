import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import { PREDEFINED_FAQS, FaqItem } from "@/lib/faqs-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "faq_items" },
    });

    if (setting && setting.value && Array.isArray(setting.value)) {
      return NextResponse.json({ faqs: setting.value });
    }

    return NextResponse.json({ faqs: PREDEFINED_FAQS });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load FAQs" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const faqs: FaqItem[] = body.faqs;

    if (!Array.isArray(faqs)) {
      return NextResponse.json({ error: "Invalid faqs array" }, { status: 400 });
    }

    const updated = await prisma.siteSetting.upsert({
      where: { key: "faq_items" },
      update: {
        value: faqs as any,
        publicationStatus: "PUBLISHED",
        publishedAt: new Date(),
      },
      create: {
        key: "faq_items",
        value: faqs as any,
        description: "Frequently Asked Questions for Bhraman Retreats",
        publicationStatus: "PUBLISHED",
        publishedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      faqs: updated.value,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save FAQs" }, { status: 500 });
  }
}
