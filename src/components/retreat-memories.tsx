"use client";

import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Film,
  Maximize2,
  Play,
  Sparkles,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EditorialHeading, ResponsiveMedia, SectionContainer, SectionLabel } from "@/components/design-system";
import type { CompletedRetreat, HomeContent, QuoteContent, RetreatMediaItem } from "@/lib/content";

interface RetreatMemoriesProps {
  content: HomeContent;
  completedRetreats: CompletedRetreat[];
  quotes?: QuoteContent[];
}

export function RetreatMemories({
  content,
  completedRetreats = [],
  quotes = [],
}: RetreatMemoriesProps) {
  const [selectedSlug, setSelectedSlug] = useState<string>(() => {
    return completedRetreats[0]?.slug || "";
  });

  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeVideo, setActiveVideo] = useState<RetreatMediaItem | null>(null);

  // Sync selected retreat if list changes
  useEffect(() => {
    if (completedRetreats.length > 0 && !completedRetreats.some((r) => r.slug === selectedSlug)) {
      setSelectedSlug(completedRetreats[0].slug);
    }
  }, [completedRetreats, selectedSlug]);

  const activeRetreat = useMemo(() => {
    return completedRetreats.find((r) => r.slug === selectedSlug) || completedRetreats[0] || null;
  }, [completedRetreats, selectedSlug]);

  const allMedia = useMemo(() => {
    return (activeRetreat?.media || []).filter(
      (m) =>
        m.url &&
        !m.url.includes("rish-agarwal") &&
        !m.url.includes("hero-himalayan-dawn.jpg")
    );
  }, [activeRetreat]);

  const imageMedia = useMemo(() => {
    return allMedia.filter((m) => m.kind === "IMAGE" || !m.kind || m.kind.toLowerCase().includes("image"));
  }, [allMedia]);

  const videoMedia = useMemo(() => {
    return allMedia.filter((m) => m.kind === "VIDEO" || m.kind.toLowerCase().includes("video"));
  }, [allMedia]);

  // Categories extracted from retreat images
  const categories = useMemo(() => {
    const set = new Set<string>();
    imageMedia.forEach((m) => {
      if (m.category && m.category.trim()) {
        set.add(m.category.trim().toUpperCase());
      }
    });
    return Array.from(set);
  }, [imageMedia]);

  const filteredImages = useMemo(() => {
    if (activeCategory === "ALL") return imageMedia;
    return imageMedia.filter((m) => m.category?.trim().toUpperCase() === activeCategory);
  }, [imageMedia, activeCategory]);

  // Lightbox keyboard navigation
  const handlePrevImage = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! > 0 ? prev! - 1 : filteredImages.length - 1));
  }, [lightboxIndex, filteredImages.length]);

  const handleNextImage = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! < filteredImages.length - 1 ? prev! + 1 : 0));
  }, [lightboxIndex, filteredImages.length]);

  useEffect(() => {
    if (lightboxIndex === null && !activeVideo) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxIndex(null);
        setActiveVideo(null);
      } else if (e.key === "ArrowLeft") {
        handlePrevImage();
      } else if (e.key === "ArrowRight") {
        handleNextImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, activeVideo, handlePrevImage, handleNextImage]);

  const handleExploreNext = () => {
    const el = document.getElementById("retreat");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Format dates helper
  const formatDateSpan = (startIso: string, endIso: string) => {
    try {
      const s = new Date(startIso);
      const e = new Date(endIso);
      const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
      const month = e.toLocaleDateString("en-GB", { month: "long" });
      const year = e.getFullYear();
      if (sameMonth) return `${s.getDate()}–${e.getDate()} ${month} ${year}`;
      return `${s.getDate()} ${s.toLocaleDateString("en-GB", { month: "short" })} – ${e.getDate()} ${month} ${year}`;
    } catch {
      return "";
    }
  };

  if (!completedRetreats || completedRetreats.length === 0) {
    return (
      <section className="memories-section section" id="memories">
        <SectionContainer className="section-heading compact">
          <div>
            <SectionLabel>{content.memoriesLabel || "PREVIOUS RETREAT MEMORIES"}</SectionLabel>
            <EditorialHeading>{content.memoriesTitle || "Moments carried home."}</EditorialHeading>
          </div>
          <p>{content.memoriesCopy || "A glimpse into earlier Bhraman journeys, shared with care by our retreat community."}</p>
        </SectionContainer>
        <SectionContainer className="empty-content">
          <p>More Bhraman stories will arrive here soon.</p>
        </SectionContainer>
      </section>
    );
  }

  const coverImage = activeRetreat?.heroImageUrl || imageMedia.find((m) => m.isCover)?.url || imageMedia[0]?.url;

  return (
    <section className="memories-section section" id="memories">
      {/* Introduction */}
      <SectionContainer className="section-heading compact">
        <div>
          <SectionLabel>{content.memoriesLabel || "PREVIOUS RETREAT MEMORIES"}</SectionLabel>
          <EditorialHeading>{content.memoriesTitle || "Moments carried home."}</EditorialHeading>
        </div>
        <p>{content.memoriesCopy || "A glimpse into earlier Bhraman journeys, shared with care by our retreat community."}</p>
      </SectionContainer>

      {/* Past Retreat Selector (Pills) */}
      {completedRetreats.length > 1 && (
        <SectionContainer className="memories-selector-container">
          <nav className="memories-retreat-selector" aria-label="Select previous retreat">
            {completedRetreats.map((r) => {
              const isSelected = r.slug === activeRetreat?.slug;
              return (
                <button
                  key={r.id}
                  type="button"
                  className={`memories-retreat-pill ${isSelected ? "active" : ""}`}
                  onClick={() => {
                    setSelectedSlug(r.slug);
                    setActiveCategory("ALL");
                  }}
                  aria-pressed={isSelected}
                >
                  <span>{r.edition || r.title}</span>
                  {r.location && <small>{r.location}</small>}
                </button>
              );
            })}
          </nav>
        </SectionContainer>
      )}

      {/* Selected Retreat Hero & Overview Card */}
      {activeRetreat && (
        <SectionContainer className="memories-hero-section">
          <div className="memories-hero-card">
            {coverImage && (
              <div className="memories-hero-media">
                <ResponsiveMedia
                  src={coverImage}
                  alt={`${activeRetreat.title} cover`}
                  fallbackTitle={activeRetreat.title}
                  fallbackHint="Bhraman retreat memory"
                />
                <div className="memories-hero-overlay" />
              </div>
            )}

            <div className="memories-hero-info">
              <span className="memories-badge-edition">
                {activeRetreat.edition || "PREVIOUS RETREAT"}
              </span>
              <h3 className="memories-hero-title">{activeRetreat.title}</h3>

              <div className="memories-meta-row">
                <div className="meta-item">
                  <span className="meta-label">Location</span>
                  <strong className="meta-val">{activeRetreat.location}</strong>
                </div>
                {activeRetreat.venue && (
                  <div className="meta-item">
                    <span className="meta-label">Venue</span>
                    <strong className="meta-val">{activeRetreat.venue}</strong>
                  </div>
                )}
                <div className="meta-item">
                  <span className="meta-label">Dates</span>
                  <strong className="meta-val">
                    {formatDateSpan(activeRetreat.startDate, activeRetreat.endDate)}
                  </strong>
                </div>
                {activeRetreat.participantCount && (
                  <div className="meta-item">
                    <span className="meta-label">Circle</span>
                    <strong className="meta-val">{activeRetreat.participantCount} travellers</strong>
                  </div>
                )}
              </div>

              {activeRetreat.highlight && (
                <blockquote className="memories-hero-highlight">
                  “{activeRetreat.highlight}”
                </blockquote>
              )}
            </div>
          </div>
        </SectionContainer>
      )}

      {/* Retreat Story Narrative */}
      {activeRetreat?.storyTitle && (
        <SectionContainer className="memories-story-block">
          <div className="story-content-inner">
            <span className="story-eyebrow">— RETREAT JOURNAL</span>
            <EditorialHeading className="story-heading">
              {activeRetreat.storyTitle}
            </EditorialHeading>
            {activeRetreat.storyBody && (
              <div className="story-body-paragraphs">
                {activeRetreat.storyBody.split("\n\n").map((para, pIdx) => (
                  <p key={pIdx}>{para}</p>
                ))}
              </div>
            )}
          </div>
        </SectionContainer>
      )}

      {/* Category Filter Chips */}
      {categories.length > 0 && (
        <SectionContainer className="memories-categories-container">
          <div className="memories-category-filters" role="tablist" aria-label="Filter memories by category">
            <button
              type="button"
              className={`category-chip ${activeCategory === "ALL" ? "active" : ""}`}
              onClick={() => setActiveCategory("ALL")}
            >
              All Moments ({imageMedia.length})
            </button>
            {categories.map((cat) => {
              const count = imageMedia.filter((m) => m.category?.toUpperCase() === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  className={`category-chip ${activeCategory === cat ? "active" : ""}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat.charAt(0) + cat.slice(1).toLowerCase()} ({count})
                </button>
              );
            })}
          </div>
        </SectionContainer>
      )}

      {/* Visual Memory Journal (Asymmetrical Editorial Grid) */}
      <SectionContainer className="memories-journal-container">
        <div className="memories-editorial-grid">
          {filteredImages.map((asset, index) => {
            const isFullWidth = index % 5 === 0 && index !== 0;
            const isPortrait = index % 3 === 1;

            return (
              <figure
                key={asset.id}
                className={`memory-card ${isFullWidth ? "card-full-width" : isPortrait ? "card-portrait" : "card-landscape"}`}
                onClick={() => setLightboxIndex(index)}
              >
                <div className="memory-card-media">
                  <ResponsiveMedia
                    src={asset.thumbnailUrl || asset.url}
                    alt={asset.altText || asset.title || "Retreat moment"}
                    fallbackTitle={asset.title ?? "Bhraman memory"}
                  />
                  <div className="memory-card-hover-overlay">
                    <span className="view-btn">
                      <Maximize2 size={16} /> View moment
                    </span>
                  </div>
                </div>

                {(asset.category || asset.caption) && (
                  <figcaption className="memory-card-caption">
                    {asset.category && (
                      <span className="card-category-badge">{asset.category}</span>
                    )}
                    {asset.caption && <p>{asset.caption}</p>}
                  </figcaption>
                )}
              </figure>
            );
          })}
        </div>
      </SectionContainer>

      {/* Interspersed Quote / Participant Reflection */}
      {quotes.length > 0 && (
        <SectionContainer className="memories-interspersed-quote">
          <blockquote className="quote-block-inner">
            <p>“{quotes[0].text}”</p>
            {quotes[0].attribution && (
              <cite>— {quotes[0].attribution}</cite>
            )}
          </blockquote>
        </SectionContainer>
      )}

      {/* Video Memories Section */}
      {videoMedia.length > 0 && (
        <SectionContainer className="memories-video-section">
          <div className="video-section-header">
            <Film size={20} className="video-icon" />
            <EditorialHeading className="video-section-title">
              Films &amp; Reflections
            </EditorialHeading>
          </div>

          <div className="memories-video-grid">
            {videoMedia.map((vid) => (
              <div
                key={vid.id}
                className="video-memory-card"
                onClick={() => setActiveVideo(vid)}
              >
                <div className="video-poster-wrapper">
                  <ResponsiveMedia
                    src={vid.posterUrl || vid.thumbnailUrl || coverImage || "/media/retreats/ladakh/hero.jpg"}
                    alt={vid.title || "Retreat film"}
                    fallbackTitle={vid.title ?? "Retreat film"}
                  />
                  <div className="video-play-btn" aria-label="Play video">
                    <Play size={22} fill="currentColor" />
                  </div>
                  {vid.durationSeconds && (
                    <span className="video-duration-badge">
                      {Math.floor(vid.durationSeconds / 60)}:{(vid.durationSeconds % 60).toString().padStart(2, "0")}
                    </span>
                  )}
                </div>
                <div className="video-card-info">
                  <h4>{vid.title || "Retreat Film"}</h4>
                  {vid.caption && <p>{vid.caption}</p>}
                </div>
              </div>
            ))}
          </div>
        </SectionContainer>
      )}

      {/* End of Retreat Story & CTA */}
      <SectionContainer className="memories-closing-cta">
        <div className="closing-cta-inner">
          <Sparkles size={24} className="closing-sparkle" />
          <EditorialHeading className="closing-heading">
            Some journeys end.
            <br />
            <em>Some stay with you.</em>
          </EditorialHeading>
          <p className="closing-sub">
            Join the circle for our upcoming elemental immersion in the Himalayas.
          </p>
          <button
            type="button"
            className="button button-dark closing-button"
            onClick={handleExploreNext}
          >
            Explore the next retreat <ArrowRight aria-hidden="true" size={16} />
          </button>
        </div>
      </SectionContainer>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && filteredImages[lightboxIndex] && (
        <div
          className="memories-lightbox-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Image Lightbox"
        >
          <div className="lightbox-backdrop" onClick={() => setLightboxIndex(null)} />

          <header className="lightbox-topbar">
            <span className="lightbox-counter">
              {lightboxIndex + 1} / {filteredImages.length}
            </span>
            <button
              type="button"
              className="lightbox-close-btn"
              onClick={() => setLightboxIndex(null)}
              aria-label="Close lightbox"
            >
              <X size={20} />
            </button>
          </header>

          <div className="lightbox-stage">
            <button
              type="button"
              className="lightbox-nav-btn prev"
              onClick={handlePrevImage}
              aria-label="Previous moment"
            >
              <ChevronLeft size={28} />
            </button>

            <div className="lightbox-image-container">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={filteredImages[lightboxIndex].url}
                alt={filteredImages[lightboxIndex].altText || "Retreat memory"}
                className="lightbox-main-image"
                decoding="async"
              />
              <div className="lightbox-info-bar">
                {filteredImages[lightboxIndex].category && (
                  <span className="lightbox-category-tag">
                    {filteredImages[lightboxIndex].category}
                  </span>
                )}
                {filteredImages[lightboxIndex].caption && (
                  <p className="lightbox-caption">
                    {filteredImages[lightboxIndex].caption}
                  </p>
                )}
                {filteredImages[lightboxIndex].credit && (
                  <span className="lightbox-credit">
                    Photo: {filteredImages[lightboxIndex].credit}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              className="lightbox-nav-btn next"
              onClick={handleNextImage}
              aria-label="Next moment"
            >
              <ChevronRight size={28} />
            </button>
          </div>
        </div>
      )}

      {/* Video Modal Player */}
      {activeVideo && (
        <div
          className="memories-video-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={activeVideo.title || "Retreat video player"}
        >
          <div className="video-modal-backdrop" onClick={() => setActiveVideo(null)} />
          <div className="video-modal-container">
            <header className="video-modal-header">
              <h3>{activeVideo.title || "Retreat Film"}</h3>
              <button
                type="button"
                className="video-modal-close"
                onClick={() => setActiveVideo(null)}
                aria-label="Close video"
              >
                <X size={20} />
              </button>
            </header>
            <div className="video-player-wrapper">
              <video
                src={activeVideo.url}
                controls
                autoPlay
                playsInline
                poster={activeVideo.posterUrl || undefined}
                className="video-element"
              />
            </div>
            {activeVideo.caption && (
              <p className="video-modal-caption">{activeVideo.caption}</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
