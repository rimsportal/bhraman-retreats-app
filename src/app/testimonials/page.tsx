import type { Metadata } from "next";
import { headers } from "next/headers";
import { Star } from "lucide-react";
import { PrimaryButton, SectionLabel } from "@/components/design-system";
import { getTestimonialsPageData } from "@/lib/content";
import type { VideoEntry } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Guest Voices | Bhraman Retreats",
  description: "Hear from those who have walked the Bhraman path — stories of transformation, stillness and elemental awakening in the Himalayas.",
};

async function origin() {
  const incomingHeaders = await headers();
  const host = incomingHeaders.get("x-forwarded-host") ?? incomingHeaders.get("host") ?? "localhost:3000";
  const protocol = incomingHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

function StarRating() {
  return (
    <div className="tv-stars" aria-label="5 out of 5 stars">
      {[0, 1, 2, 3, 4].map(i => (
        <Star key={i} size={13} fill="currentColor" aria-hidden="true" />
      ))}
    </div>
  );
}

function toEmbedUrl(raw: string): string {
  try {
    const url = raw.trim();
    // YouTube Shorts: /shorts/ID → /embed/ID
    if (url.includes("/shorts/")) {
      const id = url.split("/shorts/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${id}?rel=0`;
    }
    // youtu.be/ID
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${id}?rel=0`;
    }
    // watch?v=ID
    if (url.includes("watch?v=")) {
      const id = new URL(url).searchParams.get("v");
      return `https://www.youtube.com/embed/${id}?rel=0`;
    }
    // already an embed URL
    if (url.includes("/embed/")) return url;
    return url;
  } catch {
    return raw;
  }
}

function YoutubeShortCard({ video, index }: { video: VideoEntry; index: number }) {
  const embedUrl = toEmbedUrl(video.url);
  return (
    <div className="tv-short-card" style={{ "--si": index } as React.CSSProperties}>
      <div className="tv-short-frame">
        <iframe
          src={embedUrl}
          title={video.title || `Testimonial video ${index + 1}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
      {video.title && <p className="tv-short-title">{video.title}</p>}
    </div>
  );
}

export default async function TestimonialsPage() {
  const { testimonials, videos, mediaSlots } = await getTestimonialsPageData(await origin());
  const bgUrl = mediaSlots["bg.testimonials"];

  return (
    <main className="tv-page">

      {/* ── HERO ── */}
      <section
        className="tv-hero"
        style={bgUrl ? {
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,.45) 0%, rgba(10,30,10,.75) 100%), url('${bgUrl}')`
        } : undefined}
      >
        <div className="tv-hero-overlay" aria-hidden="true" />
        <div className="tv-hero-body">
          <SectionLabel className="light">Voices from the journey</SectionLabel>
          <h1 className="tv-hero-heading">
            Guest<br /><em>Testimonials</em>
          </h1>
          <p className="tv-hero-sub">
            Unscripted reflections from those who experienced our retreats —
            their transformations, discoveries and moments carried home from the Himalayas.
          </p>
          <div className="tv-hero-actions">
            <PrimaryButton href="/#enquiry">Share your story</PrimaryButton>
          </div>
        </div>
        <div className="tv-hero-line" aria-hidden="true"><span /></div>
      </section>

      {/* ── VIDEO SHORTS SECTION ── */}
      {videos.length > 0 && (
        <section className="tv-shorts-section">
          <div className="tv-shorts-header">
            <SectionLabel className="light">Watch &amp; listen</SectionLabel>
            <h2 className="tv-section-title">
              Discover the Transformative Experiences<br />of Our <em>Participants</em>
            </h2>
          </div>
          <div className="tv-shorts-grid">
            {videos.slice(0, 9).map((v, i) => (
              <YoutubeShortCard key={i} video={v} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* ── WRITTEN TESTIMONIALS ── */}
      <section className="tv-written-section">
        <div className="tv-written-header">
          <h2 className="tv-written-title">What our guests say</h2>
          <p className="tv-written-sub">
            {testimonials.length > 0
              ? `${testimonials.length} heartfelt stories from our retreat community`
              : "Stories from our retreat community"}
          </p>
        </div>

        {testimonials.length > 0 ? (
          <div className="tv-grid">
            {testimonials.slice(0, 12).map((t, i) => (
              <article
                key={t.id}
                className="tv-card"
                style={{ "--ci": i } as React.CSSProperties}
              >
                <blockquote className="tv-card-quote">{t.quote}</blockquote>
                <footer className="tv-card-foot">
                  {t.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={t.imageUrl}
                      alt={t.name}
                      className="tv-card-photo"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="tv-card-avatar" aria-hidden="true">
                      {t.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="tv-card-who">
                    <cite className="tv-card-name">{t.name}</cite>
                    {t.location && (
                      <span className="tv-card-loc">{t.location}</span>
                    )}
                  </div>
                </footer>
              </article>
            ))}
          </div>
        ) : (
          <div className="tv-empty">
            <p>Guest reflections are being gathered. Please check back soon.</p>
          </div>
        )}
      </section>

      {/* ── CTA STRIP ── */}
      <section className="tv-cta">
        <div className="tv-cta-inner">
          <h2 className="tv-cta-heading">
            Ready to experience Bhraman yourself?
          </h2>
          <p>
            Every journey is limited to an intimate circle. Leave an enquiry and we&apos;ll
            reach out with thoughtful guidance.
          </p>
          <div className="tv-cta-row">
            <PrimaryButton href="/#enquiry">Enquire about a retreat</PrimaryButton>
            <a href="/upcoming-retreats" className="tv-cta-link">
              See upcoming retreats →
            </a>
          </div>
        </div>
      </section>

    </main>
  );
}
