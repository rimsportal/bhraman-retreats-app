import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Lock, Mail, Phone, Shield, Sparkles, UserCheck } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

export const metadata: Metadata = {
  title: "Privacy Policy | Bhraman Retreats",
  description:
    "Learn how Bhraman Retreats safeguards your personal information, health reflections, booking details, and privacy for our Himalayan wellness sanctuaries.",
  alternates: {
    canonical: "/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
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
            <Shield size={13} className="privacy-badge-icon" />
            <span>Guest Trust &amp; Data Protection</span>
          </div>
          <h1 className="privacy-title">Privacy Policy</h1>
          <p className="privacy-lead">
            At Bhraman Retreats, we hold your trust, personal reflections, and peace of mind with the utmost reverence. This policy outlines how we protect and respectfully handle your information.
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

      {/* Policy Content Container */}
      <div className="privacy-container">
        <article className="privacy-card">
          {/* Section 1: Overview & Philosophy */}
          <section className="policy-section">
            <div className="policy-section-header">
              <span className="policy-num">01</span>
              <h2>Our Commitment to Sanctuary Privacy</h2>
            </div>
            <p>
              Bhraman Retreats (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;), curated and led by <strong>Dr. Pratiksha Shekhawat</strong>, offers intimate, doctor-led elemental wellness journeys in high-altitude Himalayan regions (Ladakh, Spiti, and Uttarakhand).
            </p>
            <p>
              We believe that true healing requires absolute confidentiality. We practice strict data minimization: we collect only what is essential to design a safe, deeply restorative, and personalized retreat experience for each of our twelve participants per edition.
            </p>
          </section>

          {/* Section 2: Information We Collect */}
          <section className="policy-section">
            <div className="policy-section-header">
              <span className="policy-num">02</span>
              <h2>Information We Collect</h2>
            </div>
            <p>We may collect and process the following categories of information when you interact with our sanctuary portal, submit an application, or join a retreat:</p>
            
            <div className="policy-grid-cards">
              <div className="policy-subcard">
                <h3>A. Contact &amp; Identity Details</h3>
                <ul>
                  <li>Full name and preferred name</li>
                  <li>Email address</li>
                  <li>Phone number / WhatsApp contact</li>
                  <li>City and country of residence</li>
                  <li>Government identification / passport details (strictly when required for high-altitude Inner Line Permits in Ladakh/Spiti)</li>
                </ul>
              </div>

              <div className="policy-subcard">
                <h3>B. Booking &amp; Travel Preferences</h3>
                <ul>
                  <li>Chosen retreat edition, dates, and package tier</li>
                  <li>Room and accommodation preferences</li>
                  <li>Emergency contact information (name, relationship, phone)</li>
                  <li>Flight arrival and departure timings for Leh airport transfers</li>
                </ul>
              </div>

              <div className="policy-subcard">
                <h3>C. Health &amp; Dietary Reflections</h3>
                <ul>
                  <li>Dietary preferences (Sattvic, vegetarian, vegan, allergies, gluten sensitivities)</li>
                  <li>Previous high-altitude experience and physical readiness</li>
                  <li>Voluntary medical notes or health considerations (e.g., respiratory, cardiovascular, or physical mobility reflections) shared during private intake</li>
                </ul>
              </div>

              <div className="policy-subcard">
                <h3>D. Technical &amp; Device Data</h3>
                <ul>
                  <li>Anonymized browser type, device category, and screen resolution</li>
                  <li>Website interaction metrics (e.g., elemental questionnaire completion, pages visited) to ensure optimal digital performance</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3: Health & Medical Confidentiality */}
          <section className="policy-section highlight-box">
            <div className="policy-section-header">
              <UserCheck size={20} className="section-icon" />
              <h2>Doctor-Led Health &amp; Medical Safeguards</h2>
            </div>
            <p>
              High-altitude Himalayan environments (11,500+ feet) require careful physiological acclimatization. Any medical history, physical limitations, or health disclosures you share with us are treated with strict clinical confidentiality overseen directly by Dr. Pratiksha Shekhawat.
            </p>
            <ul className="policy-check-list">
              <li>
                <CheckCircle2 size={16} />
                <span>Health disclosures are never used for commercial profiling, advertising, or shared with external parties.</span>
              </li>
              <li>
                <CheckCircle2 size={16} />
                <span>Information is utilized solely to ensure your physical safety, tailor daily yoga/breathwork practices, and prepare bespoke nourishment.</span>
              </li>
              <li>
                <CheckCircle2 size={16} />
                <span>In the rare event of an altitude emergency, relevant medical information will only be shared with licensed medical rescue professionals in Ladakh.</span>
              </li>
            </ul>
          </section>

          {/* Section 4: How We Use Your Data */}
          <section className="policy-section">
            <div className="policy-section-header">
              <span className="policy-num">03</span>
              <h2>How We Use Your Information</h2>
            </div>
            <p>We use your information exclusively for the following lawful and legitimate purposes:</p>
            <ul className="policy-bullet-list">
              <li><strong>Facilitating Sanctuary Inquiries:</strong> Scheduling one-on-one discovery calls with Dr. Pratiksha Shekhawat and addressing retreat inquiries.</li>
              <li><strong>Retreat Logistics &amp; Permits:</strong> Securing protected area permits (e.g., Sham Valley, Lamayuru, Pangong Tso) and arranging private luxury ground transit.</li>
              <li><strong>Bespoke Meal Preparation:</strong> Coordinating with our organic Himalayan kitchen teams to cater to your specific allergies and dietary constitution.</li>
              <li><strong>Essential Communications:</strong> Sending preparation guides, altitude acclimatization advisories, packing checklists, and payment receipts.</li>
              <li><strong>Optional Updates:</strong> Notifying you of new retreat announcements only if you have explicitly opted in. You can unsubscribe at any time.</li>
            </ul>
          </section>

          {/* Section 5: Data Security & Storage */}
          <section className="policy-section">
            <div className="policy-section-header">
              <span className="policy-num">04</span>
              <h2>Data Security &amp; Encryption</h2>
            </div>
            <p>
              We implement industry-standard technical and organizational security measures to protect your personal data from unauthorized access, alteration, disclosure, or destruction:
            </p>
            <div className="policy-security-pills">
              <div className="security-pill">
                <Lock size={15} />
                <div>
                  <strong>End-to-End Encryption</strong>
                  <p>All data in transit is encrypted using modern TLS/SSL cryptographic protocols.</p>
                </div>
              </div>
              <div className="security-pill">
                <Shield size={15} />
                <div>
                  <strong>Multi-Factor Authentication (MFA)</strong>
                  <p>All administrative access to our database is protected by Microsoft Authenticator MFA.</p>
                </div>
              </div>
              <div className="security-pill">
                <Sparkles size={15} />
                <div>
                  <strong>Secure Cloud Infrastructure</strong>
                  <p>Hosted on enterprise Azure cloud databases with isolated virtual networks and automated backups.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6: Third-Party Disclosures */}
          <section className="policy-section">
            <div className="policy-section-header">
              <span className="policy-num">05</span>
              <h2>No Sale of Personal Data &amp; Third Parties</h2>
            </div>
            <p>
              <strong>We do not sell, rent, monetize, or trade your personal data to any third party or marketing agency.</strong>
            </p>
            <p>We share limited information only with trusted service partners strictly necessary to operate our retreats:</p>
            <ul className="policy-bullet-list">
              <li><strong>Local Heritage &amp; Transport Partners:</strong> Guest names and identification for monastery permits and luxury transfer drivers in Ladakh.</li>
              <li><strong>Secure Payment Processors:</strong> Standard banking/UPI payment gateways (we do not store or process raw credit card numbers directly).</li>
              <li><strong>Legal Compliance:</strong> When required by Indian law, law enforcement, or regulatory directives.</li>
            </ul>
          </section>

          {/* Section 7: Cookies & Tracking */}
          <section className="policy-section">
            <div className="policy-section-header">
              <span className="policy-num">06</span>
              <h2>Cookies &amp; Digital Preferences</h2>
            </div>
            <p>
              Our website uses minimal, privacy-respecting cookies and browser local storage strictly necessary to:
            </p>
            <ul className="policy-bullet-list">
              <li>Remember your preference to skip intro animations upon return visits.</li>
              <li>Save temporary questionnaire state so your responses are not lost.</li>
              <li>Maintain secure authenticated sessions for administrative staff.</li>
            </ul>
            <p>
              We do not employ intrusive cross-site tracking cookies, third-party advertising pixels, or invasive surveillance tools.
            </p>
          </section>

          {/* Section 8: Your Rights */}
          <section className="policy-section">
            <div className="policy-section-header">
              <span className="policy-num">07</span>
              <h2>Your Privacy Rights &amp; Choices</h2>
            </div>
            <p>You possess full autonomy over your personal information. At any time, you have the right to:</p>
            <ul className="policy-bullet-list">
              <li><strong>Request Access:</strong> Obtain a copy of the personal data we hold about you.</li>
              <li><strong>Request Rectification:</strong> Ask us to update or correct inaccurate or incomplete details.</li>
              <li><strong>Request Erasure (&ldquo;Right to be Forgotten&rdquo;):</strong> Ask us to securely delete your personal records, subject to legal tax and accounting retention obligations.</li>
              <li><strong>Withdraw Consent:</strong> Opt out of future sanctuary communications with a single email or message.</li>
            </ul>
          </section>

          {/* Section 9: Contact & Inquiries */}
          <section className="policy-section policy-contact-section">
            <div className="policy-section-header">
              <span className="policy-num">08</span>
              <h2>Contact Our Privacy Team</h2>
            </div>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or how your personal information is handled, please reach out to us directly:
            </p>

            <div className="privacy-contact-grid">
              <a href="mailto:bhramanretreats@gmail.com" className="privacy-contact-card">
                <Mail size={18} className="contact-card-icon" />
                <div>
                  <span className="contact-card-label">Email Data Inquiries</span>
                  <strong className="contact-card-val">bhramanretreats@gmail.com</strong>
                </div>
              </a>

              <a href="https://wa.me/918700402837" target="_blank" rel="noopener noreferrer" className="privacy-contact-card">
                <Phone size={18} className="contact-card-icon" />
                <div>
                  <span className="contact-card-label">Direct &amp; WhatsApp Concierge</span>
                  <strong className="contact-card-val">+91 87004 02837</strong>
                </div>
              </a>
            </div>

            <div className="privacy-founder-signoff">
              <p>With reverence and care,</p>
              <strong>Dr. Pratiksha Shekhawat</strong>
              <span>Founder &amp; Sanctuary Lead · Bhraman Retreats</span>
            </div>
          </section>
        </article>
      </div>
    </main>
  );
}
