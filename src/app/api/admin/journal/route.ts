import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import { PREDEFINED_JOURNAL_POSTS, JournalPost } from "@/lib/journal-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [homeContentRow, posts] = await Promise.all([
      prisma.siteSetting.findUnique({ where: { key: "home.content" } }),
      prisma.blogPost.findMany({ orderBy: { publishedAt: "desc" } }),
    ]);

    const homeContentVal =
      homeContentRow?.value && typeof homeContentRow.value === "object" && !Array.isArray(homeContentRow.value)
        ? (homeContentRow.value as Record<string, unknown>)
        : {};

    const settings = {
      showBlogSection: homeContentVal.showBlogSection !== false,
      blogLabel: (homeContentVal.blogLabel as string) || "FROM THE JOURNAL",
      blogTitle: (homeContentVal.blogTitle as string) || "Thoughts for the journey within.",
      blogIntro:
        (homeContentVal.blogIntro as string) ||
        "Reflections on high-altitude medicine, elemental healing, and the transformative power of silence curated by Dr. Pratiksha Shekhawat.",
    };

    const formattedPosts =
      posts.length > 0
        ? posts.map((p) => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
            excerpt: p.excerpt,
            content: p.content,
            coverImageUrl: p.coverImageUrl || "/hero-yoga-lamayuru.jpg",
            authorName: p.authorName || "Dr. Pratiksha Shekhawat",
            readingTime: "5 min read",
            category: "Himalayan Wisdom",
            publicationStatus: p.publicationStatus,
            publishedAt: p.publishedAt ? p.publishedAt.toISOString() : new Date().toISOString(),
          }))
        : PREDEFINED_JOURNAL_POSTS.map((p) => ({
            ...p,
            publicationStatus: "PUBLISHED",
          }));

    return NextResponse.json({ settings, posts: formattedPosts });
  } catch (err: any) {
    console.error("Failed to load journal data in admin:", err);
    return NextResponse.json({
      settings: {
        showBlogSection: true,
        blogLabel: "FROM THE JOURNAL",
        blogTitle: "Thoughts for the journey within.",
        blogIntro:
          "Reflections on high-altitude medicine, elemental healing, and the transformative power of silence curated by Dr. Pratiksha Shekhawat.",
      },
      posts: PREDEFINED_JOURNAL_POSTS.map((p) => ({ ...p, publicationStatus: "PUBLISHED" })),
    });
  }
}

export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { settings, posts } = body;

    // 1. Update settings if provided
    if (settings && typeof settings === "object") {
      const existing = await prisma.siteSetting.findUnique({ where: { key: "home.content" } });
      const currentVal =
        existing?.value && typeof existing.value === "object" && !Array.isArray(existing.value)
          ? (existing.value as Record<string, unknown>)
          : {};

      const updatedVal = {
        ...currentVal,
        showBlogSection: settings.showBlogSection !== false,
        blogLabel: settings.blogLabel || "FROM THE JOURNAL",
        blogTitle: settings.blogTitle || "Thoughts for the journey within.",
        blogIntro: settings.blogIntro || "",
      };

      await prisma.siteSetting.upsert({
        where: { key: "home.content" },
        update: {
          value: updatedVal as any,
          publicationStatus: "PUBLISHED",
          publishedAt: new Date(),
        },
        create: {
          key: "home.content",
          value: updatedVal as any,
          description: "Homepage editorial and journal configuration",
          publicationStatus: "PUBLISHED",
          publishedAt: new Date(),
        },
      });
    }

    // 2. Update individual or bulk posts if provided
    if (Array.isArray(posts)) {
      for (const p of posts) {
        if (!p.slug || !p.title) continue;
        await prisma.blogPost.upsert({
          where: { slug: p.slug },
          update: {
            title: p.title,
            excerpt: p.excerpt || "",
            content: p.content || "",
            coverImageUrl: p.coverImageUrl || null,
            authorName: p.authorName || "Dr. Pratiksha Shekhawat",
            publicationStatus: p.publicationStatus === "DRAFT" ? "DRAFT" : "PUBLISHED",
            publishedAt: p.publishedAt ? new Date(p.publishedAt) : new Date(),
          },
          create: {
            slug: p.slug,
            title: p.title,
            excerpt: p.excerpt || "",
            content: p.content || "",
            coverImageUrl: p.coverImageUrl || null,
            authorName: p.authorName || "Dr. Pratiksha Shekhawat",
            publicationStatus: p.publicationStatus === "DRAFT" ? "DRAFT" : "PUBLISHED",
            publishedAt: p.publishedAt ? new Date(p.publishedAt) : new Date(),
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Failed to update journal settings:", err);
    return NextResponse.json({ error: err.message || "Failed to update journal" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const id = searchParams.get("id");

    if (!slug && !id) {
      return NextResponse.json({ error: "slug or id required" }, { status: 400 });
    }

    if (id) {
      await prisma.blogPost.delete({ where: { id } });
    } else if (slug) {
      await prisma.blogPost.delete({ where: { slug } });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Failed to delete journal post:", err);
    return NextResponse.json({ error: err.message || "Failed to delete post" }, { status: 500 });
  }
}
