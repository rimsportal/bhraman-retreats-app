"use client";

import { useEffect } from "react";

const SELECTORS = ".manifesto,.elements-section,.experience-teaser,.retreat-section,.founder-section,.itinerary-section,.memories-section,.testimonials-section,.blog-section,.closing";

export function ScrollReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const sections = Array.from(document.querySelectorAll<HTMLElement>(SELECTORS));
    sections.forEach((el) => el.classList.add("will-reveal"));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.01, rootMargin: "0px 0px -40px 0px" },
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return null;
}
