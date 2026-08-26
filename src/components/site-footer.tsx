"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Instagram, Mail, Phone, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

export function SiteFooter() {
  const pathname = usePathname();

  // Hide footer on admin pages
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="site-footer-v2" aria-label="Footer">
      <div className="footer-gradient-bar" />

      <div className="footer-content-wrap">
        {/* Column 1: Brand & Philosophy */}
        <div className="footer-col footer-col-brand">
          <Link className="brand footer-brand" href="/" aria-label="Bhraman Retreats Home">
            <BrandLogo tone="light" />
          </Link>
          <p className="footer-tagline">
            Silence as teacher · Element as medicine · Nature as guide
          </p>
          <p className="footer-summary">
            Immersive Himalayan journeys curated around the five sacred elements — Prithvi (Earth), Jala (Water), Agni (Fire), Vāyu (Air), and Ākāśa (Space).
          </p>
          <div className="footer-edition-chip">
            <span>Ladakh Edition 2.0</span>
            <span className="edition-divider">·</span>
            <span>June – Sept 2026</span>
          </div>
        </div>

        {/* Column 2: Founder & Direct Contact */}
        <div className="footer-col footer-col-contact">
          <div className="footer-eyebrow-wrap">
            <Sparkles size={12} className="footer-eyebrow-icon" />
            <span className="footer-eyebrow-text">Founder &amp; Sanctuary Inquiries</span>
          </div>

          {/* Luxury Founder Card */}
          <div className="founder-sanctuary-card">
            <div className="founder-avatar-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hero-yoga-lamayuru.jpg"
                alt="Dr. Pratiksha Shekhawat"
                className="founder-avatar-img"
              />
              <span className="founder-avatar-status" title="Active Sanctuary Guide" />
            </div>

            <div className="founder-info-block">
              <h4 className="founder-name">Dr. Pratiksha Shekhawat</h4>
              <p className="founder-title">Founder · Elemental Therapist &amp; Medical Doctor</p>
              <div className="founder-badge">
                <span className="badge-dot" />
                <span>Intimate Circles of 12 Travellers</span>
              </div>
            </div>
          </div>

          {/* Luxury Interactive Contact Channels */}
          <div className="luxury-contact-grid">
            <a
              href="https://wa.me/918700402837"
              target="_blank"
              rel="noopener noreferrer"
              className="luxury-contact-card card-phone"
              aria-label="WhatsApp or Call Dr. Pratiksha Shekhawat"
            >
              <div className="contact-icon-pill icon-wa">
                <Phone size={13} />
              </div>
              <div className="contact-meta">
                <span className="contact-label">Direct &amp; WhatsApp</span>
                <span className="contact-value">+91 87004 02837</span>
              </div>
              <span className="contact-action-arrow">
                Chat <ArrowUpRight size={12} />
              </span>
            </a>

            <a
              href="mailto:bhramanretreats@gmail.com"
              className="luxury-contact-card card-email"
              aria-label="Email Bhraman Retreats"
            >
              <div className="contact-icon-pill icon-email">
                <Mail size={13} />
              </div>
              <div className="contact-meta">
                <span className="contact-label">Email Inquiries</span>
                <span className="contact-value">bhramanretreats@gmail.com</span>
              </div>
              <span className="contact-action-arrow">
                Write <ArrowUpRight size={12} />
              </span>
            </a>

            <a
              href="https://instagram.com/bhramanretreats"
              target="_blank"
              rel="noopener noreferrer"
              className="luxury-contact-card card-instagram"
              aria-label="Follow Bhraman Retreats on Instagram"
            >
              <div className="contact-icon-pill icon-ig">
                <Instagram size={13} />
              </div>
              <div className="contact-meta">
                <span className="contact-label">Himalayan Stories</span>
                <span className="contact-value">@bhramanretreats</span>
              </div>
              <span className="contact-action-arrow">
                Follow <ArrowUpRight size={12} />
              </span>
            </a>
          </div>
        </div>

        {/* Column 3: Navigation Links */}
        <div className="footer-col footer-col-nav">
          <div className="footer-eyebrow-wrap">
            <span className="footer-eyebrow-text">Retreat Journeys</span>
          </div>
          <nav className="footer-links-grid" aria-label="Footer navigation">
            <Link href="/#philosophy">Our Story &amp; Philosophy</Link>
            <Link href="/#elements">The 5 Sacred Elements</Link>
            <Link href="/itinerary">5-Day Daily Itinerary</Link>
            <Link href="/moments">Moments Carried Home</Link>
            <Link href="/upcoming-retreats">Upcoming Retreat Editions</Link>
            <Link href="/testimonials">Guest Voices &amp; Films</Link>
            <Link href="/#enquiry">Request a Himalayan Place</Link>
            <Link href="/privacy-policy">Privacy Policy</Link>
          </nav>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom-bar">
        <small>© 2026 Bhraman Retreats. All rights reserved.</small>
        <div className="footer-legal-links">
          <Link href="/privacy-policy" className="footer-legal-link">Privacy Policy</Link>
        </div>
        <small className="footer-motto">Curated with stillness &amp; presence in the Himalayas.</small>
      </div>
    </footer>
  );
}
