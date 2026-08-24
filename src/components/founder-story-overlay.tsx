"use client";

import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { EditorialHeading, ResponsiveMedia } from "@/components/design-system";
import type { FounderContent, FounderStoryChapter, MediaContent } from "@/lib/content";
import { defaultFounderChapters } from "@/lib/content";

interface FounderStoryOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  founder?: FounderContent | null;
  media?: MediaContent[];
  mediaSlots?: Record<string, string>;
}

export function FounderStoryOverlay({
  isOpen,
  onClose,
  founder,
  media = [],
  mediaSlots = {},
}: FounderStoryOverlayProps) {
  const chapters: FounderStoryChapter[] = founder?.chapters && founder.chapters.length > 0
    ? founder.chapters
    : defaultFounderChapters;

  const [activeChapter, setActiveChapter] = useState(0);
  const overlayRef = useRef<HTMLDivElement>(null);
  const chapterRefs = useRef<Array<HTMLElement | null>>([]);

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Scroll spy for chapters
  useEffect(() => {
    if (!isOpen) return;

    const observers: IntersectionObserver[] = [];

    chapterRefs.current.forEach((el, index) => {
      if (!el) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveChapter(index);
            }
          });
        },
        {
          root: overlayRef.current,
          threshold: 0.35,
          rootMargin: "-10% 0px -20% 0px",
        }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, [isOpen, chapters.length]);

  if (!isOpen) return null;

  const handleRetreatNav = () => {
    onClose();
    setTimeout(() => {
      const retreatEl = document.getElementById("retreat");
      if (retreatEl) {
        retreatEl.scrollIntoView({ behavior: "smooth" });
      }
    }, 120);
  };

  // Helper to resolve chapter images
  const getChapterImage = (chapter: FounderStoryChapter, index: number) => {
    if (chapter.imageSlot && (chapter.imageSlot.startsWith("/") || chapter.imageSlot.startsWith("http"))) {
      return chapter.imageSlot;
    }
    if (index === 0 && founder?.imageUrl) {
      return founder.imageUrl;
    }
    const found = media.find((m) => m.folder === chapter.imageSlot || m.url.includes(chapter.imageSlot));
    if (found?.url) return found.url;
    if (mediaSlots[chapter.imageSlot]) return mediaSlots[chapter.imageSlot];
    if (index === 0) return mediaSlots.founder || founder?.imageUrl || "/hero-yoga-lamayuru.jpg";
    if (index === 1) return mediaSlots["retreat/ladakh/hero"] || "/hero-himalayan-dawn.png";
    if (index === 2) return mediaSlots["founder/practice"] || "/uploads/images/background/upcoming-retreats.jpg";
    return mediaSlots["memories/ladakh/community"] || "/uploads/images/background/testimonials.jpg";
  };

  return (
    <div
      ref={overlayRef}
      className="founder-story-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="The Story Behind Bhraman — Dr. Pratiksha Shekhawat"
    >
      {/* Top sticky navigation bar */}
      <header className="founder-story-topbar">
        <div className="founder-story-progress-indicator">
          <span className="story-step-badge">
            0{activeChapter + 1} / 0{chapters.length}
          </span>
          <span className="story-step-title">{chapters[activeChapter]?.label || "FOUNDER STORY"}</span>
        </div>
        <button
          type="button"
          className="founder-story-close-btn"
          onClick={onClose}
          aria-label="Return to the journey"
        >
          <span className="close-text">Return to the journey</span>
          <X size={18} aria-hidden="true" />
        </button>
      </header>

      {/* Main split-screen container */}
      <div className="founder-story-container">
        {/* Sticky Visual Column (Desktop) */}
        <aside className="founder-story-visual-column" aria-hidden="true">
          <div className="founder-story-visual-frame">
            {chapters.map((chapter, idx) => {
              const imgSrc = getChapterImage(chapter, idx);
              const isActive = activeChapter === idx;
              return (
                <div
                  key={chapter.number}
                  className={`story-visual-layer ${isActive ? "active" : ""}`}
                >
                  <ResponsiveMedia
                    src={imgSrc}
                    alt={chapter.imageAlt}
                    fallbackTitle={chapter.label}
                    fallbackHint="Bhraman sanctuary imagery"
                  />
                  <div className="story-visual-overlay" />
                  <div className="story-visual-caption">
                    <span>{chapter.label}</span>
                    <p>{chapter.imageAlt}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Narrative Scroll Column */}
        <main className="founder-story-narrative-column">
          {/* Introductory Chapter Header */}
          <div className="founder-story-intro-meta">
            <span className="eyebrow">— THE STORY BEHIND BHRAMAN</span>
            <h1 className="founder-story-main-title">
              Dr. Pratiksha Shekhawat
              <small>Founder · Bhraman Retreats</small>
            </h1>
            <blockquote className="founder-story-quote">
              “Nature holds everything we need to heal. We only have to learn how to listen again.”
            </blockquote>
          </div>

          {/* Chapters */}
          {chapters.map((chapter, index) => {
            const imgSrc = getChapterImage(chapter, index);
            return (
              <section
                key={chapter.number}
                ref={(el) => {
                  chapterRefs.current[index] = el;
                }}
                className="story-chapter-section"
                id={`chapter-${chapter.number}`}
              >
                {/* Mobile image reveal */}
                <div className="story-chapter-mobile-media" aria-hidden="true">
                  <ResponsiveMedia
                    src={imgSrc}
                    alt={chapter.imageAlt}
                    fallbackTitle={chapter.label}
                    fallbackHint="Bhraman retreat imagery"
                  />
                </div>

                <div className="story-chapter-header">
                  <span className="story-chapter-number">{chapter.number} / {chapter.label}</span>
                  <EditorialHeading className="story-chapter-title">
                    {chapter.headlineTitle}
                    <br />
                    <em>{chapter.headlineEmphasis}</em>
                  </EditorialHeading>
                </div>

                <div className="story-chapter-body">
                  {chapter.paragraphs.map((p, pIdx) => (
                    <p key={pIdx}>{p}</p>
                  ))}
                </div>

                {/* Chapter 3 Credentials / Qualifications */}
                {chapter.credentials && chapter.credentials.length > 0 && (
                  <div className="story-credentials-grid">
                    {chapter.credentials.map((item, cIdx) => (
                      <div className="credential-card" key={cIdx}>
                        <span className="credential-label">{item.label}</span>
                        <strong className="credential-val">{item.value}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}

          {/* Ending Epilogue & CTAs */}
          <section className="founder-story-epilogue">
            <div className="epilogue-line" />
            <EditorialHeading className="epilogue-heading">
              This isn&apos;t a retreat
              <br />
              <em>you simply attend.</em>
              <br />
              It&apos;s one you experience.
            </EditorialHeading>

            <div className="epilogue-actions">
              <button
                type="button"
                className="button button-primary epilogue-cta"
                onClick={handleRetreatNav}
              >
                Explore the next retreat <ArrowRight aria-hidden="true" size={16} />
              </button>
              <button
                type="button"
                className="button button-secondary epilogue-return"
                onClick={onClose}
              >
                <ArrowLeft aria-hidden="true" size={16} /> Return to the journey
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
