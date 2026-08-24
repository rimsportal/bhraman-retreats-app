import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/api-response";
import { PREDEFINED_JOURNAL_POSTS } from "@/lib/journal-data";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;

  try {
    const post = await prisma.blogPost.findFirst({
      where: { slug, publicationStatus: "PUBLISHED" },
      select: {
        id: true, slug: true, title: true, excerpt: true, content: true,
        coverImageUrl: true, authorName: true, publishedAt: true, updatedAt: true,
      },
    });

    if (post) {
      return apiSuccess(post);
    }
  } catch (error) {
    console.error("DB error in public blog slug route, checking predefined:", error);
  }

  // Fallback to predefined posts
  const predefined = PREDEFINED_JOURNAL_POSTS.find((p) => p.slug === slug);
  if (predefined) {
    return apiSuccess({
      id: predefined.id,
      slug: predefined.slug,
      title: predefined.title,
      excerpt: predefined.excerpt,
      content: predefined.content,
      coverImageUrl: predefined.coverImageUrl,
      authorName: predefined.authorName,
      publishedAt: predefined.publishedAt,
      updatedAt: predefined.publishedAt,
    });
  }

  return apiError(404, "NOT_FOUND", "Journal story not found.");
}
