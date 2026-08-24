import { promises as fs } from "fs";
import path from "path";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hasAdminRole } from "@/lib/admin-auth";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { getMediaBlobProperties, isBlobConfigured } from "@/lib/azure-storage";

const SITE_SLOTS = new Set([
  "retreat",
  "founder",
  "hero",
  "bg.upcoming-retreats",
  "bg.testimonials",
  "bg.philosophy",
  "bg.itinerary",
  "bg.moments",
]);

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await hasAdminRole(["CONTENT_EDITOR", "SUPER_ADMIN"]))) {
    return apiError(403, "FORBIDDEN", "Content editor access is required.");
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const slot = typeof body.slot === "string" && body.slot ? body.slot : null;
  if (slot && !SITE_SLOTS.has(slot)) {
    return apiError(422, "VALIDATION_ERROR", "slot must be retreat, founder, hero, bg.upcoming-retreats, bg.testimonials, bg.philosophy, bg.itinerary or bg.moments.");
  }

  try {
    const asset = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!asset) return apiError(404, "NOT_FOUND", "Media asset not found.");
    if (asset.uploadStatus !== "CONFIRMED") {
      return apiError(409, "UPLOAD_NOT_CONFIRMED", "Confirm the Blob upload before publishing.");
    }

    const isLocal = !isBlobConfigured();
    if (isLocal) {
      const relativePath = asset.url.replace(/^\//, "");
      const absolutePath = path.join(process.cwd(), "public", relativePath);
      try {
        await fs.stat(absolutePath);
      } catch (error) {
        return apiError(409, "BLOB_NOT_FOUND", "The uploaded local file no longer exists.");
      }
    } else {
      await getMediaBlobProperties(asset.blobName);
    }

    const published = await prisma.$transaction(async (tx) => {
      const updated = await tx.mediaAsset.update({
        where: { id },
        data: { publicationStatus: "PUBLISHED", publishedAt: new Date() },
      });

      if (slot) {
        const current = await tx.siteSetting.findUnique({ where: { key: "media.slots" } });
        const slots = current?.value && typeof current.value === "object" && !Array.isArray(current.value)
          ? { ...(current.value as Record<string, unknown>) }
          : {};
        slots[slot] = updated.url;
        const value = slots as Prisma.InputJsonObject;
        await tx.siteSetting.upsert({
          where: { key: "media.slots" },
          update: { value, publicationStatus: "PUBLISHED", publishedAt: new Date() },
          create: {
            key: "media.slots",
            value,
            description: "Homepage media slot references.",
            publicationStatus: "PUBLISHED",
            publishedAt: new Date(),
          },
        });
      }
      return updated;
    });

    return apiSuccess(published);
  } catch (error) {
    if ((error as { statusCode?: number }).statusCode === 404) {
      return apiError(409, "BLOB_NOT_FOUND", "The uploaded Blob no longer exists.");
    }
    return handleApiError(error);
  }
}
