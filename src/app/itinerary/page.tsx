import type { Metadata } from "next";
import { headers } from "next/headers";
import { ArrowRight, CalendarDays, Compass, MapPin, Sparkles } from "lucide-react";
import {
  EditorialHeading,
  PrimaryButton,
  SecondaryButton,
  SectionContainer,
  SectionLabel,
} from "@/components/design-system";
import { Itinerary, type ItineraryItem } from "@/components/itinerary";
import { getHomepageData, type FeaturedRetreat } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Retreat Itinerary | Five-Day Elemental Rhythm | Bhraman",
  description:
    "Discover the five-day elemental journey through the Himalayas — Earth, Water, Fire, Air and Space. Movement, ritual, and stillness.",
};

async function origin() {
  const incomingHeaders = await headers();
  const host = incomingHeaders.get("x-forwarded-host") ?? incomingHeaders.get("host") ?? "localhost:3000";
  const protocol = incomingHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

export default async function ItineraryPage() {
  const currentOrigin = await origin();
  const { retreat, content, elements } = await getHomepageData(currentOrigin);

  const itineraryItems: ItineraryItem[] = (retreat?.itinerary || []).map((day) => ({
    day: `DAY 0${day.dayNumber}`,
    element: day.element.toUpperCase(),
    title: day.title,
    activities: day.sections.flatMap((section) => section.activities.map((act) => act.title)),
  }));

  const fallbackItems: ItineraryItem[] = [
    {
      day: "DAY 01",
      element: "EARTH",
      title: "Arrive, ground and slow down",
      activities: [
        "Traditional Ladakhi welcome and herbal tea ceremony",
        "Gentle restorative yoga for high-altitude acclimatization",
        "Prithvi (Earth) grounding walking meditation on monastery grounds",
        "Nourishing sattvic dinner and opening circle under the stars",
      ],
    },
    {
      day: "DAY 02",
      element: "WATER",
      title: "Release emotional tension and soften",
      activities: [
        "Sunrise Jala (Water) breathwork and somatic fluid movement",
        "Silent meditative hike along mountain glacial streams",
        "Vocal toning and nervous system down-regulation workshop",
        "Evening reflective tea gathering and sound bath",
      ],
    },
    {
      day: "DAY 03",
      element: "FIRE",
      title: "Transform and kindle inner vitality",
      activities: [
        "Agni (Fire) solar yoga practice and core energy activation",
        "Ancient Trātaka (candle flame gazing) concentration ritual",
        "Mindful nature immersion and Himalayan wisdom discourse",
        "Sacred fire ceremony (Havan) to release mental burdens",
      ],
    },
    {
      day: "DAY 04",
      element: "AIR",
      title: "Expand awareness and invite lightness",
      activities: [
        "Morning Vāyu (Air) prāṇāyāma atop the moonland ridge",
        "Monastery prayer chant observation and spiritual reflection",
        "Spacious creative journaling and restorative bodywork",
        "Community storytelling circle with warm herbal chai",
      ],
    },
    {
      day: "DAY 05",
      element: "SPACE",
      title: "Integrate, observe and carry home",
      activities: [
        "Dawn Ākāśa (Space) silent meditation overlooking the valley",
        "Closing gratitude ceremony and intention integration",
        "Shared farewell breakfast and personal takeaway journals",
        "Departure with renewed clarity and inner silence",
      ],
    },
  ];

  const itemsToRender = itineraryItems.length > 0 ? itineraryItems : fallbackItems;

  return (
    <main className="itinerary-page">
      {/* Hero Header */}
      <section className="tv-hero">
        <div className="tv-hero-overlay" />
        <div className="tv-hero-content">
          <SectionLabel>THE FIVE-DAY JOURNEY</SectionLabel>
          <EditorialHeading as="h1" className="tv-hero-title">
            Your retreat rhythm. <br />
            <em>A journey that unfolds slowly.</em>
          </EditorialHeading>
          <p className="tv-hero-lead">
            Every day is devoted to one great element — experienced through movement, traditional practice, conscious nourishment, and profound stillness.
          </p>
        </div>
      </section>

      {/* Main Itinerary Walkthrough */}
      <section className="itinerary-section section" id="itinerary">
        <SectionContainer className="section-heading compact">
          <div>
            <SectionLabel>{content.itineraryLabel || "YOUR FIVE-DAY RHYTHM"}</SectionLabel>
            <EditorialHeading>
              {content.itineraryTitle || "A journey that"} <em>{content.itineraryEmphasis || "unfolds slowly."}</em>
            </EditorialHeading>
          </div>
          <p>{content.itineraryIntro || "Every day honours one element through movement, traditional practice, conscious nourishment and reflection."}</p>
        </SectionContainer>

        <SectionContainer>
          <Itinerary
            items={itemsToRender}
            scheduleNote={content.itineraryNote || "The complete time-by-time schedule becomes available after your place is confirmed."}
          />
        </SectionContainer>
      </section>

      {/* Element Breakdown Cards */}
      {elements.length > 0 && (
        <section className="elements-section section" style={{ paddingTop: 0 }}>
          <SectionContainer className="section-heading compact">
            <div>
              <SectionLabel>THE 5 PILLARS</SectionLabel>
              <EditorialHeading>Elemental Medicine</EditorialHeading>
            </div>
            <p>How each sacred element heals and recalibrates your nervous system.</p>
          </SectionContainer>
          <SectionContainer>
            <div className="elements-grid">
              {elements.map((el) => (
                <div key={el.key} className="element-card">
                  <span className="element-num">{el.symbol}</span>
                  <h3 className="element-name">{el.name} <small>({el.sanskrit})</small></h3>
                  <p className="element-verb"><strong>Action:</strong> {el.verb}</p>
                  <p className="element-practice"><strong>Practice:</strong> {el.practice}</p>
                  <p className="element-detail">{el.detail}</p>
                </div>
              ))}
            </div>
          </SectionContainer>
        </section>
      )}

      {/* Bridge to Moments Carried Home & Booking */}
      <section className="section itinerary-bridge-section" style={{ background: "var(--color-surface-sunken, #111a14)", padding: "80px 0" }}>
        <SectionContainer style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto" }}>
          <SectionLabel>WITNESS THE EXPERIENCE</SectionLabel>
          <EditorialHeading as="h2" style={{ marginBottom: "20px" }}>
            See how past journeys <em>came alive.</em>
          </EditorialHeading>
          <p style={{ color: "var(--color-text-muted, #9eb3a8)", fontSize: "18px", lineHeight: "1.7", marginBottom: "36px" }}>
            Explore visual memories, community moments, and authentic stories from travellers who walked the five-element Himalayan path with us.
          </p>

          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <PrimaryButton href="/moments">
              Explore Moments Carried Home
            </PrimaryButton>
            <SecondaryButton href="/#enquiry">
              Begin your conversation
            </SecondaryButton>
          </div>
        </SectionContainer>
      </section>
    </main>
  );
}
