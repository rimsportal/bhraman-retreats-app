import type { Metadata } from "next";
import { headers } from "next/headers";
import { EditorialHeading, PrimaryButton, SecondaryButton, SectionContainer, SectionLabel } from "@/components/design-system";
import { RetreatMemories } from "@/components/retreat-memories";
import { getHomepageData } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Moments Carried Home | Previous Retreat Memories | Bhraman",
  description:
    "Glimpses into earlier Bhraman Himalayan retreat editions — visual journals, participant reflections, sacred ceremonies and stillness.",
};

async function origin() {
  const incomingHeaders = await headers();
  const host = incomingHeaders.get("x-forwarded-host") ?? incomingHeaders.get("host") ?? "localhost:3000";
  const protocol = incomingHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

export default async function MomentsPage() {
  const currentOrigin = await origin();
  const { content, completedRetreats, quotes } = await getHomepageData(currentOrigin);

  return (
    <main className="moments-page">
      {/* Hero Header */}
      <section className="tv-hero">
        <div className="tv-hero-overlay" />
        <div className="tv-hero-content">
          <SectionLabel>PREVIOUS RETREAT ARCHIVE</SectionLabel>
          <EditorialHeading as="h1" className="tv-hero-title">
            Moments carried home. <br />
            <em>Five days in the mountains. A thousand small moments.</em>
          </EditorialHeading>
          <p className="tv-hero-lead">
            Authentic visual memories, participant reflections, and journal stories from past Bhraman Himalayan retreat editions.
          </p>
        </div>
      </section>

      {/* Main Retreat Memories Component */}
      <RetreatMemories
        content={content}
        completedRetreats={completedRetreats}
        quotes={quotes}
      />

      {/* Footer Navigation Bridge */}
      <section className="section moments-bridge-section" style={{ background: "var(--color-surface-sunken, #111a14)", padding: "80px 0" }}>
        <SectionContainer style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto" }}>
          <SectionLabel>READY TO WALK THE PATH?</SectionLabel>
          <EditorialHeading as="h2" style={{ marginBottom: "20px" }}>
            Join the next <em>Himalayan circle.</em>
          </EditorialHeading>
          <p style={{ color: "var(--color-text-muted, #9eb3a8)", fontSize: "18px", lineHeight: "1.7", marginBottom: "36px" }}>
            Explore the five-day daily rhythm or check upcoming dates and places for our next intimate journey.
          </p>

          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <PrimaryButton href="/itinerary">
              View Retreat Itinerary
            </PrimaryButton>
            <SecondaryButton href="/upcoming-retreats">
              Explore Upcoming Retreats
            </SecondaryButton>
          </div>
        </SectionContainer>
      </section>
    </main>
  );
}
