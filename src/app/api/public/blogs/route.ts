import { prisma } from "@/lib/prisma";
import { apiSuccess } from "@/lib/api-response";
import { paginationMeta, parseListQuery } from "@/lib/cms-query";
import { PREDEFINED_JOURNAL_POSTS } from "@/lib/journal-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const query = parseListQuery(request, {
    defaultSort: "publishedAt",
    allowedSorts: ["publishedAt", "createdAt", "updatedAt", "title"],
  });

  try {
    const where = {
      publicationStatus: "PUBLISHED",
      ...(query.search ? {
        OR: [
          { title: { contains: query.search, mode: "insensitive" as const } },
          { excerpt: { contains: query.search, mode: "insensitive" as const } },
        ],
      } : {}),
    };
    const [items, total] = await prisma.$transaction([
      prisma.blogPost.findMany({
        where,
        select: {
          id: true, slug: true, title: true, excerpt: true, coverImageUrl: true,
          authorName: true, publishedAt: true, updatedAt: true,
        },
        skip: query.skip,
        take: query.pageSize,
        orderBy: { [query.sort]: query.order },
      }),
      prisma.blogPost.count({ where }),
    ]);

    if (items.length > 0) {
      return apiSuccess(items, { meta: paginationMeta(total, query) });
    }

    // Fallback to curated predefined journal posts
    const fallbackItems = PREDEFINED_JOURNAL_POSTS.map(({ id, slug, title, excerpt, coverImageUrl, authorName, publishedAt }) => ({
      id, slug, title, excerpt, coverImageUrl, authorName, publishedAt, updatedAt: publishedAt,
    }));
    return apiSuccess(fallbackItems, { meta: paginationMeta(fallbackItems.length, query) });
  } catch (error) {
    console.error("Failed to query DB blogs, returning predefined:", error);
    const fallbackItems = PREDEFINED_JOURNAL_POSTS.map(({ id, slug, title, excerpt, coverImageUrl, authorName, publishedAt }) => ({
      id, slug, title, excerpt, coverImageUrl, authorName, publishedAt, updatedAt: publishedAt,
    }));
    return apiSuccess(fallbackItems, { meta: paginationMeta(fallbackItems.length, query) });
  }
}
