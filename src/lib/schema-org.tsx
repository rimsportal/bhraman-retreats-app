import React from "react";
import { FaqItem, PREDEFINED_FAQS } from "@/lib/faqs-data";
import { JournalPost } from "@/lib/journal-data";

export function OrganizationSchema({ baseUrl }: { baseUrl: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "name": "Bhraman Retreats",
    "alternateName": "Bhraman",
    "url": baseUrl,
    "logo": `${baseUrl}/logo-512.png`,
    "image": `${baseUrl}/hero-yoga-lamayuru.jpg`,
    "description": "An intimate, doctor-led 5-day elemental healing sanctuary in Ladakh, India, rooted in the Panch Mahābhūta: Earth, Water, Fire, Air, and Space.",
    "telephone": "+918700402837",
    "email": "bhramanretreats@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Leh",
      "addressRegion": "Ladakh",
      "addressCountry": "IN"
    },
    "founder": {
      "@type": "Person",
      "name": "Dr. Pratiksha Shekhawat",
      "jobTitle": "Founder & Elemental Therapist",
      "description": "Medical doctor, yogic practitioner, and elemental therapist devoted to restorative Himalayan retreats in Ladakh.",
      "telephone": "+918700402837",
      "email": "bhramanretreats@gmail.com",
      "image": `${baseUrl}/hero-yoga-lamayuru.jpg`,
      "sameAs": [
        "https://instagram.com/bhramanretreats"
      ]
    },
    "sameAs": [
      "https://instagram.com/bhramanretreats"
    ],
    "priceRange": "₹₹₹₹"
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FaqPageSchema({ faqs = PREDEFINED_FAQS }: { faqs?: FaqItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function RetreatEventSchema({
  baseUrl,
  title = "Ladakh Edition 2.0 — Five Elements Himalayan Retreat",
  description = "A 5-day immersive elemental therapy retreat in Ladakh with Dr. Pratiksha Shekhawat. Strictly capped at 12 travellers.",
  startDate = "2026-09-12T00:00:00+05:30",
  endDate = "2026-09-16T23:59:59+05:30",
  price = "29999",
  currency = "INR",
}: {
  baseUrl: string;
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  price?: string;
  currency?: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": title,
    "description": description,
    "startDate": startDate,
    "endDate": endDate,
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "location": {
      "@type": "Place",
      "name": "Lamayuru Monastery Sanctuary & Sham Valley",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Lamayuru",
        "addressRegion": "Ladakh",
        "addressCountry": "IN"
      }
    },
    "image": [
      `${baseUrl}/hero-yoga-lamayuru.jpg`,
      `${baseUrl}/hero-himalayan-dawn.png`
    ],
    "organizer": {
      "@type": "Organization",
      "name": "Bhraman Retreats",
      "url": baseUrl
    },
    "performer": {
      "@type": "Person",
      "name": "Dr. Pratiksha Shekhawat"
    },
    "offers": {
      "@type": "Offer",
      "url": `${baseUrl}/#enquiry`,
      "price": price,
      "priceCurrency": currency,
      "availability": "https://schema.org/LimitedAvailability",
      "validFrom": "2026-01-01T00:00:00+05:30"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BlogPostSchema({
  baseUrl,
  post,
}: {
  baseUrl: string;
  post: {
    slug: string;
    title: string;
    excerpt: string;
    coverImageUrl?: string | null;
    authorName?: string | null;
    publishedAt?: string | null;
  };
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.coverImageUrl ? (post.coverImageUrl.startsWith("http") ? post.coverImageUrl : `${baseUrl}${post.coverImageUrl}`) : `${baseUrl}/hero-yoga-lamayuru.jpg`,
    "author": {
      "@type": "Person",
      "name": post.authorName ?? "Dr. Pratiksha Shekhawat",
      "url": `${baseUrl}/#philosophy`
    },
    "publisher": {
      "@type": "Organization",
      "name": "Bhraman Retreats",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo-512.png`
      }
    },
    "datePublished": post.publishedAt ?? "2026-03-01T00:00:00+05:30",
    "dateModified": post.publishedAt ?? "2026-03-01T00:00:00+05:30",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/blog/${post.slug}`
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
