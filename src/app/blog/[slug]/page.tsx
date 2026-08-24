import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, MessageCircle, Sparkles, User } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { ResponsiveMedia } from "@/components/design-system";
import { getBlogPost } from "@/lib/content";

async function origin() {
  const incomingHeaders = await headers();
  const host = incomingHeaders.get("x-forwarded-host") ?? incomingHeaders.get("host") ?? "localhost:3000";
  const protocol = incomingHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(await origin(), slug);
  return post ? { title: `${post.title} | Bhraman Retreats Himalayan Journal`, description: post.excerpt } : {};
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPost(await origin(), slug);
  if (!post) notFound();

  return (
    <main className="journal-page">
      <header className="journal-page-header">
        <Link className="brand" href="/" aria-label="Bhraman Retreats home">
          <BrandLogo />
        </Link>
        <Link href="/#journal" className="journal-back-link">
          <ArrowLeft size={14} /> Back to Journal Stories
        </Link>
      </header>

      <article className="journal-article">
        {/* Article Meta Top */}
        <div className="article-header-meta">
          <div className="article-author-pill">
            <span className="author-dot" />
            <span>Essay by {post.authorName ?? "Dr. Pratiksha Shekhawat"}</span>
          </div>
          <div className="article-meta-tags">
            <span className="meta-item">
              <Calendar size={13} /> {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "March 2026"}
            </span>
            <span className="meta-divider">·</span>
            <span className="meta-item">
              <Clock size={13} /> 6 min read
            </span>
          </div>
        </div>

        {/* Article Headline & Excerpt */}
        <h1 className="article-headline">{post.title}</h1>
        <p className="journal-excerpt">{post.excerpt}</p>

        {/* Cover Hero Media */}
        <div className="article-cover-frame">
          <ResponsiveMedia
            src={post.coverImageUrl ?? "/hero-yoga-lamayuru.jpg"}
            alt={post.title}
            fallbackTitle={post.title}
            fallbackHint="Journal cover is being prepared"
          />
          <span className="article-cover-caption">Himalayan Sanctuary Series · Ladakh, India</span>
        </div>

        {/* Rich Journal Content */}
        <div className="journal-content" dangerouslySetInnerHTML={{ __html: post.content }} />

        {/* Founder Bio Card at Article Foot */}
        <div className="article-founder-bio-card">
          <div className="founder-bio-avatar-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero-yoga-lamayuru.jpg"
              alt="Dr. Pratiksha Shekhawat"
              className="founder-bio-img"
            />
          </div>

          <div className="founder-bio-text">
            <span className="founder-bio-eyebrow">Written by the Founder</span>
            <h4 className="founder-bio-name">Dr. Pratiksha Shekhawat</h4>
            <p className="founder-bio-desc">
              Medical doctor, yogic practitioner, and elemental therapist dedicated to curating intimate, high-altitude healing sanctuaries in Ladakh.
            </p>
            <div className="founder-bio-actions">
              <a
                href="https://wa.me/918700402837"
                target="_blank"
                rel="noopener noreferrer"
                className="bio-btn-wa"
              >
                <MessageCircle size={14} /> Consult on WhatsApp
              </a>
              <Link href="/#enquiry" className="bio-btn-enquire">
                <Sparkles size={14} /> Join Upcoming Circle
              </Link>
            </div>
          </div>
        </div>

        {/* Back to Home & Journal Footer */}
        <div className="article-bottom-nav">
          <Link href="/#journal" className="bottom-nav-link">
            <ArrowLeft size={14} /> Return to Journal Collection
          </Link>
          <Link href="/upcoming-retreats" className="bottom-nav-retreats">
            Explore 2026 Retreat Dates →
          </Link>
        </div>
      </article>
    </main>
  );
}
