import { CalendarDays, MapPin, Sparkles } from "lucide-react";
import { headers } from "next/headers";
import { BrandLogo } from "@/components/brand-logo";
import { CinematicHero } from "@/components/cinematic-hero";
import {
  EditorialHeading,
  ElementBadge,
  PrimaryButton,
  QuoteBlock,
  ResponsiveMedia,
  RetreatDateBadge,
  SecondaryButton,
  SectionContainer,
  SectionLabel,
} from "@/components/design-system";
import { EnquiryForm } from "@/components/enquiry-form";
import { PhilosophyParagraphs } from "@/components/philosophy-paragraphs";
import { ExperienceBhraman } from "@/components/experiences/experience-bhraman";
import { Itinerary, type ItineraryItem } from "@/components/itinerary";
import { Fireflies } from "@/components/nature-effects";
import { FounderStorySection } from "@/components/founder-story-section";
import { RetreatMemories } from "@/components/retreat-memories";
import { ScrollReveal } from "@/components/scroll-reveal";
import { formatDateRange, getHomepageData, type MediaContent } from "@/lib/content";

export const dynamic = "force-dynamic";

function mediaIn(media: MediaContent[], folders: string[]) {
  return media.filter((asset) => folders.some((folder) => asset.folder === folder || asset.folder.startsWith(`${folder}/`)));
}

function ContentNotice({ label }: { label: string }) {
  return <p className="content-notice" role="status">{label} is temporarily unavailable. The rest of the journey remains available.</p>;
}

export default async function Home() {
  const incomingHeaders = await headers();
  const host = incomingHeaders.get("x-forwarded-host") ?? incomingHeaders.get("host") ?? "localhost:3000";
  const protocol = incomingHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const data = await getHomepageData(`${protocol}://${host}`);
  const { content, retreat, upcomingRetreats, completedRetreats, founder, elements, testimonials, blog, quotes, media, mediaSlots, unavailable } = data;

  // The soonest upcoming retreat is featured large above; show up to two more as cards.
  const moreRetreats = upcomingRetreats.filter((item) => item.slug !== retreat?.slug).slice(0, 2);

  const itinerary: ItineraryItem[] = (retreat?.itinerary ?? []).map((day) => ({
    day: `Day ${day.dayNumber}`,
    element: day.element,
    title: day.title,
    activities: day.sections.flatMap((section) => section.activities.map((activity) => activity.title)),
  }));
  const founderQuote = quotes.find((quote) => quote.context === "Founder philosophy") ?? quotes[0];
  const retreatMedia = mediaIn(media, ["retreats/ladakh-edition-2/cover", "retreats/uttarakhand-december/cover"])[0];
  const heroMedia = media.find((asset) => asset.url === mediaSlots.hero) ?? retreatMedia;
  const founderMedia = mediaIn(media, ["founder/profile"])[0];
  const memoryMedia = mediaIn(media, [
    "retreats/ladakh-edition-1/gallery",
    "retreats/ladakh-edition-1/participants",
    "retreats/ladakh-edition-1/monastery",
  ]).slice(0, 3);
  const philosophyMedia = media.find((asset) => asset.url === mediaSlots["bg.philosophy"]);
  const philosophyImageUrl = mediaSlots["bg.philosophy"] ?? philosophyMedia?.url;
  const blogMedia = mediaIn(media, ["blog/why-choose-bhraman/cover"])[0];

  return (
    <main id="top">
      <ScrollReveal />

      <CinematicHero
        founderName={founder?.name}
        content={content}
        backgroundImageUrl={heroMedia?.url ?? mediaSlots.hero}
      />

      <section className="manifesto section" id="philosophy">
        {philosophyImageUrl ? (
          <div className="manifesto-art">
            <ResponsiveMedia
              src={philosophyImageUrl}
              alt={philosophyMedia?.altText ?? "Philosophy of Bhraman"}
              fallbackTitle="Philosophy"
              fallbackHint="Philosophy image"
            />
          </div>
        ) : (
          <div><SectionLabel>{content.philosophyLabel}</SectionLabel><span className="botanical" aria-hidden="true">❦</span></div>
        )}
        <div className="manifesto-content">
          <SectionLabel className="manifesto-eyebrow">{content.philosophyLabel}</SectionLabel>
          <EditorialHeading className="manifesto-heading">
            <span className="manifesto-title">{content.philosophyTitle}</span>
            <em className="manifesto-tagline">{content.philosophyEmphasis}</em>
          </EditorialHeading>
          <PhilosophyParagraphs paragraphs={content.philosophyParagraphs} />
          <SecondaryButton href="#elements" showArrow>{content.philosophyCta}</SecondaryButton>
        </div>
      </section>

      <section className="elements-section" id="elements">
        <SectionContainer className="section-heading">
          <div>
            <SectionLabel>{content.elementsLabel}</SectionLabel>
            <EditorialHeading className="journey-title">
              {content.elementsTitle.includes("\n") ? (
                content.elementsTitle.split("\n").map((line, idx) => (
                  <span key={idx}>
                    {line}
                    <br />
                  </span>
                ))
              ) : (
                <>
                  {content.elementsTitle}
                  <br />
                </>
              )}
              <em>{content.elementsEmphasis}</em>
            </EditorialHeading>
          </div>
          <p>{content.elementsIntro}</p>
        </SectionContainer>
        {elements.length > 0 ? (
          <SectionContainer className="element-grid">
            {elements.map((element, index) => (
              <a
                href={`#day-${element.key}`}
                className={`element-card ${element.key}`}
                key={element.key}
                aria-label={`Explore Day ${index + 1} — ${element.name}`}
              >
                <ElementBadge number={element.symbol} label={element.sanskrit} />
                <h3>{element.name}</h3><strong>{element.verb}</strong>
                <div className="element-reveal"><p>{element.detail}</p></div>
              </a>
            ))}
          </SectionContainer>
        ) : (
          <SectionContainer className="empty-content"><p>The five elemental pathways are being prepared for this journey.</p></SectionContainer>
        )}
        {unavailable.includes("settings") && <ContentNotice label="Element details" />}
      </section>

      <section className="experience-teaser section" id="experience">
        <ExperienceBhraman label={content.experienceLabel} title={content.experienceTitle} copy={content.experienceCopy} />
      </section>

      <section className="retreat-section" id="retreat">
        {retreat ? (
          <>
            <div className="retreat-art">
              <ResponsiveMedia
                src={retreat.heroImageUrl ?? retreatMedia?.url ?? mediaSlots.retreat}
                alt={retreatMedia?.altText ?? retreat.title}
                fallbackTitle={retreat.title}
                fallbackHint="Retreat imagery is being prepared"
                priority
              />
              <RetreatDateBadge start={new Date(retreat.startDate)} end={new Date(retreat.endDate)} />
            </div>
            <div className="retreat-copy">
              <SectionLabel>{content.retreatLabel}</SectionLabel>
              <EditorialHeading>{retreat.title}</EditorialHeading>
              <p className="lead">{retreat.summary}</p>
              {retreat.highlight && <p className="retreat-highlight"><Sparkles size={16} aria-hidden="true" /> Highlight · {retreat.highlight}</p>}
              <div className="retreat-meta">
                <span><MapPin /> {retreat.location}</span>
                <span><CalendarDays /> {formatDateRange(new Date(retreat.startDate), new Date(retreat.endDate))}</span>
              </div>
              <div className="price-row">
                <div><small>All-inclusive retreat</small><strong>₹{(retreat.priceInPaise / 100).toLocaleString("en-IN")} <i>/ person</i></strong></div>
                <span>Limited to an intimate circle</span>
              </div>
              <div className="retreat-cta-row">
                <PrimaryButton href="#enquiry">Enquire about this retreat</PrimaryButton>
                {moreRetreats.length > 0 && (
                  <SecondaryButton href="/upcoming-retreats" showArrow>See all upcoming retreats</SecondaryButton>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="section-empty-wide">
            <SectionLabel>{content.retreatLabel}</SectionLabel>
            <EditorialHeading>The next Bhraman journey is taking shape.</EditorialHeading>
            <p>Leave an enquiry and we will share the details as soon as they are ready.</p>
            <PrimaryButton href="#enquiry">Stay informed</PrimaryButton>
            {unavailable.includes("retreat") && <ContentNotice label="Retreat details" />}
          </div>
        )}
      </section>

      <FounderStorySection
        content={content}
        founder={founder}
        founderQuote={founderQuote}
        founderMedia={founderMedia}
        mediaSlots={mediaSlots}
        media={media}
      />

      <section className="itinerary-section section" id="itinerary">
        <SectionContainer className="section-heading compact">
          <div><SectionLabel>{content.itineraryLabel}</SectionLabel><EditorialHeading>{content.itineraryTitle}<br /><em>{content.itineraryEmphasis}</em></EditorialHeading></div>
          <p>{content.itineraryIntro}</p>
        </SectionContainer>
        {itinerary.length > 0 ? <Itinerary items={itinerary} scheduleNote={content.itineraryNote} /> : <SectionContainer className="empty-content"><p>The detailed five-day rhythm will appear when the featured retreat itinerary is published.</p></SectionContainer>}
      </section>

      <RetreatMemories
        content={content}
        completedRetreats={completedRetreats}
        quotes={quotes}
      />

      <section className="testimonials-section section" id="testimonials">
        <SectionContainer className="section-heading compact">
          <div><SectionLabel>{content.testimonialsLabel}</SectionLabel><EditorialHeading>{content.testimonialsTitle}<br /><em>{content.testimonialsEmphasis}</em></EditorialHeading></div>
        </SectionContainer>
        {testimonials.length > 0 ? (
          <div className="testimonial-grid">
            {testimonials.map((testimonial) => {
              const avatar = testimonial.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={testimonial.imageUrl}
                  alt={testimonial.name}
                  className="tv-card-photo"
                  loading="lazy"
                  decoding="async"
                  style={{ width: "48px", height: "48px" }}
                />
              ) : (
                <div
                  className="tv-card-avatar"
                  aria-hidden="true"
                  style={{ width: "48px", height: "48px", font: "700 18px/48px var(--font-display)" }}
                >
                  {testimonial.name.charAt(0).toUpperCase()}
                </div>
              );

              return (
                <QuoteBlock
                  className="testimonial-card"
                  key={testimonial.id}
                  attribution={
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "16px" }}>
                      {avatar}
                      <div>
                        <strong>{testimonial.name}</strong>
                        {testimonial.location && <span>{testimonial.location}</span>}
                      </div>
                    </div>
                  }
                >
                  {testimonial.quote}
                </QuoteBlock>
              );
            })}
          </div>
        ) : (
          <SectionContainer className="empty-content"><p>Guest reflections will appear here once they are approved for publication.</p></SectionContainer>
        )}
        {unavailable.includes("testimonials") && <ContentNotice label="Guest reflections" />}
      </section>

      <section className="blog-section section" id="journal">
        <SectionContainer className="section-heading compact">
          <div><SectionLabel>{content.blogLabel}</SectionLabel><EditorialHeading>{content.blogTitle}</EditorialHeading></div>
        </SectionContainer>
        {blog ? (
          <SectionContainer className="featured-blog">
            <ResponsiveMedia src={blog.coverImageUrl ?? blogMedia?.url} alt={blogMedia?.altText ?? blog.title} fallbackTitle={blog.title} fallbackHint="Journal cover is being prepared" />
            <div><p className="eyebrow">{blog.authorName ?? "Bhraman Retreats"}</p><h3>{blog.title}</h3><p>{blog.excerpt}</p><SecondaryButton href={`/blog/${blog.slug}`} showArrow>Read the journal</SecondaryButton></div>
          </SectionContainer>
        ) : (
          <SectionContainer className="empty-content"><p>The next journal story is being prepared.</p></SectionContainer>
        )}
      </section>

      <section className="closing" id="enquiry">
        <SectionLabel>{content.enquiryLabel}</SectionLabel>
        <EditorialHeading>{content.enquiryTitle}<br /><em>{content.enquiryEmphasis}</em></EditorialHeading>
        <p>{content.enquiryCopy}</p>
        <EnquiryForm retreatId={retreat?.id} />
      </section>

      <footer className="site-footer">
        <a className="brand footer-brand" href="#top"><BrandLogo tone="light" /></a>
        <p>{content.footerTagline}</p>
        <div><a href="#retreat">Retreats</a><a href="#itinerary">Itinerary</a><a href="#journal">Journal</a><a href="#enquiry">Contact</a></div>
        <small>© 2026 Bhraman Retreats. All rights reserved.</small>
      </footer>
    </main>
  );
}
