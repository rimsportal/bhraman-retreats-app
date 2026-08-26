import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  HeartHandshake,
  Mail,
  Phone,
  RefreshCw,
  Scale,
  ShieldAlert,
  Users,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

export const metadata: Metadata = {
  title: "Terms & Conditions | Bhraman Retreats",
  description:
    "Review the terms, participant responsibilities, cancellation rules, code of conduct, and refund guidelines for Bhraman Retreats Himalayan journeys.",
  alternates: {
    canonical: "/terms-and-conditions",
  },
};

export default function TermsAndConditionsPage() {
  const lastUpdated = "August 26, 2026";

  return (
    <main className="privacy-page">
      {/* Top Header / Breadcrumb */}
      <header className="privacy-page-header">
        <Link className="brand" href="/" aria-label="Bhraman Retreats Home">
          <BrandLogo />
        </Link>
        <Link href="/" className="privacy-back-link">
          <ArrowLeft size={14} /> Back to Sanctuary Home
        </Link>
      </header>

      {/* Hero Header */}
      <section className="privacy-hero">
        <div className="privacy-hero-content">
          <div className="privacy-badge">
            <Scale size={13} className="privacy-badge-icon" />
            <span>Sanctuary Agreement &amp; Policies</span>
          </div>
          <h1 className="privacy-title">Terms &amp; Conditions</h1>
          <p className="privacy-lead">
            Clear, transparent principles governing your enrollment, high-altitude participant responsibilities, cancellation policies, and circle code of conduct.
          </p>
          <div className="privacy-meta-bar">
            <span>Last Updated: {lastUpdated}</span>
            <span className="meta-dot">·</span>
            <span>Effective Date: June 1, 2026</span>
            <span className="meta-dot">·</span>
            <span>Version 2.0</span>
          </div>
        </div>
      </section>

      {/* Content Container */}
      <div className="privacy-container">
        <article className="privacy-card">
          {/* Section 1: Commitment to Self-Transformation */}
          <section className="policy-section">
            <div className="policy-section-header">
              <span className="policy-num">01</span>
              <h2>Commitment to Self-Transformation</h2>
            </div>
            <p>
              Participation in a Bhraman retreat signifies your conscious commitment to your personal self-transformation journey. This is not merely a conventional vacation or commercial sightseeing holiday; it is an intimate, doctor-led container for profound personal growth, contemplative silence, and elemental healing.
            </p>
            <p>
              Every participant joins with an open mind, ready to engage with the five sacred elements (&Amacron;k&amacron;&sacute;a, V&amacron;yu, Agni, Jala, Prithvi), mindful silence periods, and daily holistic practices guided by <strong>Dr. Pratiksha Shekhawat</strong>.
            </p>
          </section>

          {/* Section 2: Participant Responsibility & Health */}
          <section className="policy-section highlight-box">
            <div className="policy-section-header">
              <HeartHandshake size={20} className="section-icon" />
              <h2>Participant Responsibility &amp; Health Declarations</h2>
            </div>
            <p>
              Because our retreats take place in high-altitude Himalayan regions (11,500 to 14,000+ feet in Ladakh and Spiti), conscious personal responsibility is vital:
            </p>
            <ul className="policy-check-list">
              <li>
                <CheckCircle2 size={16} />
                <span>
                  <strong>Mandatory Health Disclosure:</strong> All participants must inform us of any pre-existing medical conditions, cardiovascular/respiratory history, chronic illnesses, or severe dietary allergies during intake prior to attending.
                </span>
              </li>
              <li>
                <CheckCircle2 size={16} />
                <span>
                  <strong>Individual Well-Being:</strong> Participants are responsible for their own health, hydration, acclimatization pacing, and physical safety during yoga sessions, walks, and monastery visits.
                </span>
              </li>
              <li>
                <CheckCircle2 size={16} />
                <span>
                  <strong>Doctor Guidance:</strong> Dr. Pratiksha Shekhawat provides elemental therapeutic guidance and high-altitude health supervision; however, participation in specific physical flows remains at your own comfort and discretion.
                </span>
              </li>
            </ul>
          </section>

          {/* Section 3: Code of Conduct & Circle Harmony */}
          <section className="policy-section">
            <div className="policy-section-header">
              <span className="policy-num">02</span>
              <h2>Code of Conduct &amp; Circle Reverence</h2>
            </div>
            <p>
              Each Bhraman edition is strictly limited to an intimate circle of <strong>12 travellers</strong> to foster safety, deep connection, and undisturbed tranquility.
            </p>
            <ul className="policy-bullet-list">
              <li>
                <strong>Mutual Respect:</strong> We expect all participants to treat fellow attendees, sanctuary facilitators, local Ladakhi staff, and monastery elders with dignity, patience, and reverence.
              </li>
              <li>
                <strong>Respect for Sacred Spaces:</strong> Photography restrictions in monastery prayer halls and silent morning meditation hours must be respected at all times.
              </li>
              <li>
                <strong>Zero Tolerance for Disruption:</strong> Disruptive, aggressive, discriminatory, or disrespectful behavior will not be tolerated. We reserve the right to dismiss any participant whose conduct compromises the emotional or physical safety of the group, with immediate forfeiture of retreat fees and no refund.
              </li>
            </ul>
          </section>

          {/* Section 4: Cancellation Policy */}
          <section className="policy-section">
            <div className="policy-section-header">
              <span className="policy-num">03</span>
              <h2>Cancellation &amp; Registration Policy</h2>
            </div>
            <p>
              By completing your registration and transferring the retreat fee, you confirm that you have carefully read and understood all retreat details, including the daily itinerary, elevation factors, inclusions, and accommodation styles.
            </p>
            <div className="policy-grid-cards">
              <div className="policy-subcard">
                <h3>Participant Cancellations</h3>
                <p>
                  Because places are strictly limited to 12 travellers and bespoke high-altitude logistics (monastery permits, boutique accommodations, private transport) are booked months in advance, <strong>once your booking is confirmed, cancellations are not permitted, and your enrollment cannot be withdrawn</strong>. We encourage you to review your schedule and travel readiness thoroughly before making a commitment.
                </p>
              </div>

              <div className="policy-subcard">
                <h3>Organizer Cancellations</h3>
                <p>
                  We reserve the right to cancel any retreat edition due to exceptional circumstances. In the rare event that Bhraman Retreats cancels an edition, you will receive a <strong>100% full refund of your registration fee</strong>. Please note that we cannot be held responsible for external expenses (such as non-refundable personal flight tickets) incurred.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5: Refund & Spot Transfer Policy */}
          <section className="policy-section">
            <div className="policy-section-header">
              <span className="policy-num">04</span>
              <h2>Refund Policy &amp; Genuine Spot Transfers</h2>
            </div>
            <p>
              <strong>The retreat fee is non-refundable.</strong> However, we understand that unforeseen and extraordinary life events can arise.
            </p>
            <div className="policy-security-pills">
              <div className="security-pill">
                <RefreshCw size={15} />
                <div>
                  <strong>Genuine Spot Transfers</strong>
                  <p>In rare, genuine cases, we may consider transferring your registration to a future retreat edition, evaluated on seat availability and group compatibility.</p>
                </div>
              </div>
              <div className="security-pill">
                <FileText size={15} />
                <div>
                  <strong>Supporting Documentation</strong>
                  <p>Supporting medical or emergency documentation may be requested by Dr. Pratiksha Shekhawat to process any spot transfer consideration.</p>
                </div>
              </div>
              <div className="security-pill">
                <Mail size={15} />
                <div>
                  <strong>Transfer Requests</strong>
                  <p>To request a transfer review, please write to us directly at <strong>bhramanretreats@gmail.com</strong> or message on WhatsApp at <strong>+91 87004 02837</strong>.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6: Natural Disasters & Force Majeure */}
          <section className="policy-section">
            <div className="policy-section-header">
              <span className="policy-num">05</span>
              <h2>Natural Disasters &amp; Force Majeure</h2>
            </div>
            <p>
              If a retreat edition is postponed or interrupted due to high-altitude natural phenomena (landslides, road blockages, severe unseasonal snowfall), government border restrictions, or national health emergencies (such as COVID-19 directives), <strong>100% of your paid fees will be safely preserved and adjusted toward the rescheduled edition or a future available retreat date</strong>.
            </p>
          </section>

          {/* Section 7: No-Show Policy */}
          <section className="policy-section">
            <div className="policy-section-header">
              <span className="policy-num">06</span>
              <h2>No-Show Policy</h2>
            </div>
            <p>
              If a participant fails to arrive at the designated meeting point in Leh on Day 1 without prior formal transfer approval from our team, it will be deemed a <strong>No-Show</strong>. In such cases, all fees are permanently forfeited, and no refunds, future transfers, or credits will be issued.
            </p>
          </section>

          {/* Section 8: Inquiries & Contact */}
          <section className="policy-section policy-contact-section">
            <div className="policy-section-header">
              <span className="policy-num">07</span>
              <h2>Questions Regarding Our Terms</h2>
            </div>
            <p>
              If you have any questions or require clarification on these Terms &amp; Conditions before registering, please reach out to us:
            </p>

            <div className="privacy-contact-grid">
              <a href="mailto:bhramanretreats@gmail.com" className="privacy-contact-card">
                <Mail size={18} className="contact-card-icon" />
                <div>
                  <span className="contact-card-label">Email Legal &amp; Booking Team</span>
                  <strong className="contact-card-val">bhramanretreats@gmail.com</strong>
                </div>
              </a>

              <a href="https://wa.me/918700402837" target="_blank" rel="noopener noreferrer" className="privacy-contact-card">
                <Phone size={18} className="contact-card-icon" />
                <div>
                  <span className="contact-card-label">WhatsApp Concierge</span>
                  <strong className="contact-card-val">+91 87004 02837</strong>
                </div>
              </a>
            </div>

            <div className="privacy-founder-signoff">
              <p>In service of your inner journey,</p>
              <strong>Dr. Pratiksha Shekhawat</strong>
              <span>Founder &amp; Sanctuary Guide · Bhraman Retreats</span>
            </div>
          </section>
        </article>
      </div>
    </main>
  );
}
