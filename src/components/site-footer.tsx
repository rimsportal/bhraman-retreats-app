"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Instagram, Mail, Phone, Sparkles, User } from "lucide-react";
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
        </div>

        {/* Column 2: Founder & Direct Contact */}
        <div className="footer-col footer-col-contact">
          <h4 className="footer-heading">
            <Sparkles size={14} className="footer-heading-icon" /> Founder &amp; Inquiries
          </h4>

          <div className="footer-founder-card">
            <div className="footer-founder-name">
              <User size={14} /> Dr. Pratiksha Shekhawat
            </div>
            <span className="footer-founder-role">Founder &amp; Elemental Therapist</span>
          </div>

          <ul className="footer-contact-list">
            <li>
              <a
                href="tel:+918700402837"
                className="footer-contact-link"
                aria-label="Call Dr. Pratiksha Shekhawat"
              >
                <Phone size={14} />
                <span>+91 87004 02837</span>
              </a>
            </li>

            <li>
              <a
                href="mailto:bhramanretreats@gmail.com"
                className="footer-contact-link"
                aria-label="Email Bhraman Retreats"
              >
                <Mail size={14} />
                <span>bhramanretreats@gmail.com</span>
              </a>
            </li>

            <li>
              <a
                href="https://instagram.com/bhramanretreats"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-contact-link"
                aria-label="Follow Bhraman Retreats on Instagram"
              >
                <Instagram size={14} />
                <span>@bhramanretreats</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3: Navigation Links */}
        <div className="footer-col footer-col-nav">
          <h4 className="footer-heading">Retreat Journeys</h4>
          <nav className="footer-links-grid" aria-label="Footer navigation">
            <Link href="/#philosophy">Our Story</Link>
            <Link href="/#elements">The 5 Elements</Link>
            <Link href="/itinerary">Daily Itinerary</Link>
            <Link href="/moments">Moments Carried Home</Link>
            <Link href="/upcoming-retreats">Upcoming Retreats</Link>
            <Link href="/testimonials">Guest Voices</Link>
            <Link href="/#enquiry">Request a Place</Link>
          </nav>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom-bar">
        <small>© 2026 Bhraman Retreats. All rights reserved.</small>
        <small className="footer-motto">Curated with stillness &amp; presence in the Himalayas.</small>
      </div>
    </footer>
  );
}
