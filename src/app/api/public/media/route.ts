import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { isAllowedMediaFolder } from "@/lib/media-validation.mjs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const folder = url.searchParams.get("folder");
  const page = Math.max(1, Number.parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(url.searchParams.get("pageSize") ?? "25", 10) || 25));

  if (folder && !isAllowedMediaFolder(folder)) {
    return apiError(422, "VALIDATION_ERROR", "folder is not an approved media folder.");
  }

  try {
    const where = {
      publicationStatus: "PUBLISHED",
      uploadStatus: "CONFIRMED",
      ...(folder ? { folder } : {}),
      NOT: [
        { url: { contains: "rish-agarwal" } },
        { url: { contains: "hero-himalayan-dawn.jpg" } },
      ],
    };
    const [items, total] = await prisma.$transaction([
      prisma.mediaAsset.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          url: true,
          kind: true,
          folder: true,
          title: true,
          altText: true,
          caption: true,
          credit: true,
          mimeType: true,
          sizeBytes: true,
          width: true,
          height: true,
          durationSeconds: true,
          publishedAt: true,
        },
      }),
      prisma.mediaAsset.count({ where }),
    ]);
    return apiSuccess(items, { meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
  } catch (error) {
    return handleApiError(error);
  }
}
