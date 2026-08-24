"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { EditorialHeading, QuoteBlock, ResponsiveMedia, SectionLabel } from "@/components/design-system";
import { Fireflies } from "@/components/nature-effects";
import type { FounderContent, HomeContent, MediaContent, QuoteContent } from "@/lib/content";

const FounderStoryOverlay = dynamic(
  () => import("@/components/founder-story-overlay").then((mod) => mod.FounderStoryOverlay),
  { ssr: false }
);

interface FounderStorySectionProps {
  content: HomeContent;
  founder?: FounderContent | null;
  founderQuote?: QuoteContent;
  founderMedia?: MediaContent;
  mediaSlots?: Record<string, string>;
  media?: MediaContent[];
}

export function FounderStorySection({
  content,
  founder,
  founderQuote,
  founderMedia,
  mediaSlots = {},
  media = [],
}: FounderStorySectionProps) {
  const [isStoryOpen, setIsStoryOpen] = useState(false);

  return (
    <>
      <section className="founder-section" id="founder">
        <Fireflies />
        <div className="founder-copy">
          <Sparkles size={28} />
          <SectionLabel className="light">{content.founderLabel}</SectionLabel>
          <EditorialHeading>
            {content.founderTitle}
            <br />
            <em>{content.founderEmphasis}</em>
          </EditorialHeading>

          {founderQuote && (
            <QuoteBlock attribution={founderQuote.attribution}>
              {founderQuote.text}
            </QuoteBlock>
          )}

          <div className="founder-meta">
            <p className="founder-name">Dr. Pratiksha Shekhawat</p>
            <p className="founder-role">Founder · Bhraman Retreats</p>
          </div>

          <button
            type="button"
            className="button button-light founder-story-trigger"
            onClick={() => setIsStoryOpen(true)}
            aria-haspopup="dialog"
          >
            Discover her journey <ArrowRight aria-hidden="true" size={16} />
          </button>
        </div>

        <div className="founder-image">
          <ResponsiveMedia
            src={founder?.imageUrl ?? founderMedia?.url ?? mediaSlots.founder}
            alt={founderMedia?.altText ?? founder?.name ?? "Dr. Pratiksha Shekhawat — Founder, Bhraman Retreats"}
            fallbackTitle="Dr. Pratiksha Shekhawat"
            fallbackHint="Founder portrait"
          />
        </div>
      </section>

      {isStoryOpen && (
        <FounderStoryOverlay
          isOpen={isStoryOpen}
          onClose={() => setIsStoryOpen(false)}
          founder={founder}
          media={media}
          mediaSlots={mediaSlots}
        />
      )}
    </>
  );
}
