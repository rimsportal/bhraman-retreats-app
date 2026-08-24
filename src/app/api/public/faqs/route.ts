import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PREDEFINED_FAQS } from "@/lib/faqs-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "faq_items" },
    });

    if (setting && setting.value && Array.isArray(setting.value)) {
      return NextResponse.json({
        faqs: setting.value,
        source: "database",
      });
    }

    return NextResponse.json({
      faqs: PREDEFINED_FAQS,
      source: "predefined",
    });
  } catch (err) {
    console.error("Failed to load FAQs from DB, falling back to predefined:", err);
    return NextResponse.json({
      faqs: PREDEFINED_FAQS,
      source: "fallback",
    });
  }
}
