"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";

export function Navigation() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isItineraryPage = pathname === "/itinerary";
  const isMomentsPage = pathname === "/moments";
  const isUpcomingPage = pathname === "/upcoming-retreats";
  const isTestimonialsPage = pathname === "/testimonials";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  function linkClass(active: boolean) {
    return active ? "nav-link nav-link-active" : "nav-link";
  }

  return (
    <header
      className={`nav-wrap${scrolled ? " nav-scrolled" : ""}`}
      aria-label="Site navigation"
    >
      <a className="brand" href="/" aria-label="Bhraman Retreats home">
        <BrandLogo tone="light" />
      </a>

      <nav className={open ? "nav-links open" : "nav-links"} aria-label="Main navigation">
        <a
          href={isHome ? "#philosophy" : "/#philosophy"}
          className={linkClass(isHome)}
          onClick={() => setOpen(false)}
        >
          Our story
        </a>
        <a
          href={isHome ? "#elements" : "/#elements"}
          className={linkClass(false)}
          onClick={() => setOpen(false)}
        >
          The elements
        </a>
        <a
          href="/itinerary"
          className={linkClass(isItineraryPage)}
          onClick={() => setOpen(false)}
          aria-current={isItineraryPage ? "page" : undefined}
        >
          Itinerary
        </a>
        <a
          href="/moments"
          className={linkClass(isMomentsPage)}
          onClick={() => setOpen(false)}
          aria-current={isMomentsPage ? "page" : undefined}
        >
          Moments
        </a>
        <a
          href="/upcoming-retreats"
          className={linkClass(isUpcomingPage)}
          onClick={() => setOpen(false)}
          aria-current={isUpcomingPage ? "page" : undefined}
        >
          Upcoming Retreats
        </a>
        <a
          href="/testimonials"
          className={linkClass(isTestimonialsPage)}
          onClick={() => setOpen(false)}
          aria-current={isTestimonialsPage ? "page" : undefined}
        >
          Guest voices
        </a>
      </nav>

      <button
        className="menu-button"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
        aria-expanded={open}
      >
        {open ? <X /> : <Menu />}
      </button>
    </header>
  );
}
