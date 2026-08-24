export type HomeContent = {
  heroEyebrow: string;
  heroTitle: string;
  heroEmphasis: string;
  heroCopy: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  introTagline: string;
  philosophyLabel: string;
  philosophyTitle: string;
  philosophyEmphasis: string;
  philosophyParagraphs: string[];
  philosophyCta: string;
  elementsLabel: string;
  elementsTitle: string;
  elementsEmphasis: string;
  elementsIntro: string;
  experienceLabel: string;
  experienceTitle: string;
  experienceCopy: string;
  retreatLabel: string;
  itineraryLabel: string;
  itineraryTitle: string;
  itineraryEmphasis: string;
  itineraryIntro: string;
  itineraryNote: string;
  founderLabel: string;
  founderTitle: string;
  founderEmphasis: string;
  memoriesLabel: string;
  memoriesTitle: string;
  memoriesCopy: string;
  testimonialsLabel: string;
  testimonialsTitle: string;
  testimonialsEmphasis: string;
  blogLabel: string;
  blogTitle: string;
  enquiryLabel: string;
  enquiryTitle: string;
  enquiryEmphasis: string;
  enquiryCopy: string;
  footerTagline: string;
};

export type ElementContent = {
  key: string;
  symbol: string;
  name: string;
  sanskrit: string;
  verb: string;
  practice: string;
  detail: string;
};

export type RetreatDayContent = {
  id: string;
  dayNumber: number;
  element: string;
  title: string;
  description?: string | null;
  sections: Array<{
    id: string;
    title: string;
    description?: string | null;
    activities: Array<{ id: string; title: string; description?: string | null; startTime?: string | null }>;
  }>;
};

export type FeaturedRetreat = {
  id: string;
  slug: string;
  title: string;
  edition?: string | null;
  summary: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  priceInPaise: number;
  capacity: number;
  status: string;
  heroImageUrl?: string | null;
  highlight?: string | null;
  itinerary: RetreatDayContent[];
};

// Lightweight retreat shape (no itinerary) used for the upcoming-retreats list.
export type RetreatSummary = Omit<FeaturedRetreat, "itinerary">;

export type RetreatMediaItem = {
  id: string;
  url: string;
  kind: string;
  folder: string;
  title?: string | null;
  altText: string;
  caption?: string | null;
  credit?: string | null;
  category?: string | null;
  displayOrder: number;
  isCover: boolean;
  isFeatured: boolean;
  width?: number | null;
  height?: number | null;
  durationSeconds?: number | null;
  posterUrl?: string | null;
  thumbnailUrl?: string | null;
};

export type CompletedRetreat = {
  id: string;
  slug: string;
  title: string;
  edition?: string | null;
  summary: string;
  description: string;
  location: string;
  venue?: string | null;
  startDate: string;
  endDate: string;
  priceInPaise: number;
  capacity: number;
  status: string;
  heroImageUrl?: string | null;
  highlight?: string | null;
  storyTitle?: string | null;
  storyBody?: string | null;
  participantCount?: number | null;
  displayOrder: number;
  coverMediaId?: string | null;
  publishedAt?: string | null;
  media: RetreatMediaItem[];
};

export type FounderStoryChapter = {
  number: string;
  label: string;
  headlineTitle: string;
  headlineEmphasis: string;
  paragraphs: string[];
  imageSlot: string;
  imageAlt: string;
  credentials?: Array<{ label: string; value: string }>;
};

export type FounderContent = {
  id: string;
  slug: string;
  name: string;
  title: string;
  bio: string;
  imageUrl?: string | null;
  credentials?: string | null;
  chapters?: FounderStoryChapter[];
};

export type TestimonialContent = {
  id: string;
  slug: string;
  name: string;
  location?: string | null;
  imageUrl?: string | null;
  quote: string;
  sortOrder: number;
};

export type BlogContent = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl?: string | null;
  authorName?: string | null;
  publishedAt?: string | null;
};

export type BlogDetailContent = BlogContent & {
  content: string;
  updatedAt?: string | null;
};

export type QuoteContent = {
  id: string;
  slug: string;
  text: string;
  attribution?: string | null;
  context?: string | null;
  sortOrder: number;
};

export type MediaContent = {
  id: string;
  url: string;
  kind: string;
  folder: string;
  title?: string | null;
  altText: string;
  caption?: string | null;
  mimeType: string;
  width?: number | null;
  height?: number | null;
};

type ApiEnvelope<T> = { data: T };
type SettingsPayload = Record<string, unknown>;

export type HomepageData = {
  content: HomeContent;
  elements: ElementContent[];
  retreat: FeaturedRetreat | null;
  upcomingRetreats: RetreatSummary[];
  completedRetreats: CompletedRetreat[];
  founder: FounderContent | null;
  testimonials: TestimonialContent[];
  blog: BlogContent | null;
  quotes: QuoteContent[];
  media: MediaContent[];
  mediaSlots: Record<string, string>;
  unavailable: string[];
};

export const defaultHomeContent: HomeContent = {
  heroEyebrow: "Elemental therapy retreats · Himalayas, India",
  heroTitle: "Remember your",
  heroEmphasis: "natural rhythm.",
  heroCopy: "Five elements. Five days. One quiet return to the part of you that never forgot how to be whole.",
  heroPrimaryCta: "Explore the retreat",
  heroSecondaryCta: "Discover our philosophy",
  introTagline: "Breathe in · Return within",
  philosophyLabel: "Come back to what you’re made of !",
  philosophyTitle: "Elemental Therapy",
  philosophyEmphasis: "Healing through the 5 great elements",
  philosophyParagraphs: [
    "In the heart of the Himalayas, every sound of the forest, every breath of air, and every grain of soil whispers an ancient truth — that all life arises from the Panch Mahābhūta: Earth, Water, Fire, Air, and Space. These five elements are not just outside us — they are the very fabric of our being",
    "When these elements are in balance, the body’s natural intelligence flourishes — digestion strengthens, sleep deepens, hormones align, and the nervous system returns to its natural rhythm of rest and renewal. Through elemental therapy, the senses awaken, pranic flow becomes unobstructed, and the mind begins to mirror the quiet order of nature itself. Each day of this retreat is devoted to one element — allowing you to experience its medicine through carefully curated practices, yogic techniques, and sensory experiences that bring harmony to body, mind, and spirit.",
  ],
  philosophyCta: "Walk through the five elements",
  elementsLabel: "THE FIVE-DAY JOURNEY",
  elementsTitle: "Five elements.\nFive days.",
  elementsEmphasis: "One journey inward.",
  elementsIntro: "Each day is devoted to one element — experienced through movement, breath, ritual, nature and stillness. Together, they unfold as one journey back to yourself.",
  experienceLabel: "Experience Bhraman",
  experienceTitle: "A slower way to travel within.",
  experienceCopy: "Small circles, elemental practice and meaningful Himalayan immersion create room for genuine rest.",
  retreatLabel: "Next Bhraman journey",
  itineraryLabel: "Your five-day rhythm",
  itineraryTitle: "A journey that",
  itineraryEmphasis: "unfolds slowly.",
  itineraryIntro: "Every day honours one element through movement, traditional practice, conscious nourishment and reflection.",
  itineraryNote: "The complete time-by-time schedule becomes available after your place is confirmed.",
  founderLabel: "THE STORY BEHIND BHRAMAN",
  founderTitle: "Rooted in medicine.",
  founderEmphasis: "Guided by nature.",
  memoriesLabel: "Previous retreat memories",
  memoriesTitle: "Moments carried home.",
  memoriesCopy: "A glimpse into earlier Bhraman journeys, shared with care by our retreat community.",
  testimonialsLabel: "Voices from the journey",
  testimonialsTitle: "What guests",
  testimonialsEmphasis: "carry home.",
  blogLabel: "From the journal",
  blogTitle: "Thoughts for the journey within.",
  enquiryLabel: "Begin a conversation",
  enquiryTitle: "Your next journey",
  enquiryEmphasis: "starts here.",
  enquiryCopy: "Tell us what is drawing you toward Bhraman. Our team will respond with thoughtful guidance.",
  footerTagline: "Silence as teacher · Element as medicine · Nature as guide",
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;

function mapContent(value: unknown): HomeContent {
  if (!isRecord(value)) return defaultHomeContent;
  const mapped = { ...defaultHomeContent };
  for (const key of Object.keys(defaultHomeContent) as Array<keyof HomeContent>) {
    const candidate = value[key];
    if (key === "philosophyParagraphs") {
      if (Array.isArray(candidate) && candidate.every(isString)) mapped[key] = candidate;
    } else if (isString(candidate)) {
      (mapped as unknown as Record<string, unknown>)[key] = candidate;
    }
  }
  return mapped;
}

function mapElements(value: unknown): ElementContent[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isRecord(item)) return [];
    const keys: Array<keyof ElementContent> = ["key", "symbol", "name", "sanskrit", "verb", "practice", "detail"];
    if (!keys.every((key) => isString(item[key]))) return [];
    return [{ key: item.key, symbol: item.symbol, name: item.name, sanskrit: item.sanskrit, verb: item.verb, practice: item.practice, detail: item.detail } as ElementContent];
  }).slice(0, 5);
}

function mapMediaSlots(value: unknown): Record<string, string> {
  if (!isRecord(value)) return {};
  return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, string] => isString(entry[1])));
}

function envelopeData<T>(result?: PromiseSettledResult<ApiEnvelope<T>>): T | null {
  return result && result.status === "fulfilled" ? result.value.data : null;
}

export function mapHomepageResponses(results: {
  retreat: PromiseSettledResult<ApiEnvelope<FeaturedRetreat>>;
  upcoming: PromiseSettledResult<ApiEnvelope<RetreatSummary[]>>;
  completed: PromiseSettledResult<ApiEnvelope<CompletedRetreat[]>>;
  settings: PromiseSettledResult<ApiEnvelope<SettingsPayload>>;
  founder: PromiseSettledResult<ApiEnvelope<FounderContent>>;
  testimonials: PromiseSettledResult<ApiEnvelope<TestimonialContent[]>>;
  blogs: PromiseSettledResult<ApiEnvelope<BlogContent[]>>;
  quotes: PromiseSettledResult<ApiEnvelope<QuoteContent[]>>;
  media: PromiseSettledResult<ApiEnvelope<MediaContent[]>>;
}): HomepageData {
  const settings = envelopeData(results.settings) ?? {};
  const unavailable = Object.entries(results)
    .filter(([, result]) => result.status === "rejected")
    .map(([key]) => key);

  return {
    content: mapContent(settings["home.content"]),
    elements: mapElements(settings["home.elements"]),
    retreat: envelopeData(results.retreat),
    upcomingRetreats: envelopeData(results.upcoming) ?? [],
    completedRetreats: (envelopeData(results.completed) ?? []).map((cr) => ({
      ...cr,
      heroImageUrl:
        cr.heroImageUrl &&
        !cr.heroImageUrl.includes("hero-himalayan-dawn.jpg") &&
        !cr.heroImageUrl.includes("rish-agarwal")
          ? cr.heroImageUrl
          : "/hero-himalayan-dawn.png",
      media: (cr.media || []).filter(
        (m) =>
          m.url &&
          !m.url.includes("rish-agarwal") &&
          !m.url.includes("hero-himalayan-dawn.jpg")
      ),
    })),
    founder: envelopeData(results.founder),
    testimonials: (envelopeData(results.testimonials) ?? []).slice(0, 3),
    blog: (envelopeData(results.blogs) ?? [])[0] ?? null,
    quotes: (envelopeData(results.quotes) ?? []).slice(0, 6),
    media: (envelopeData(results.media) ?? [])
      .filter(
        (asset) =>
          (asset.kind === "IMAGE" || asset.mimeType.startsWith("image/")) &&
          !asset.url.includes("rish-agarwal") &&
          !asset.url.includes("hero-himalayan-dawn.jpg")
      ),
    mediaSlots: mapMediaSlots(settings["media.slots"]),
    unavailable,
  };
}

async function fetchApi<T>(origin: string, path: string): Promise<ApiEnvelope<T>> {
  const response = await fetch(new URL(path, origin), {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`${path} returned ${response.status}`);
  return response.json() as Promise<ApiEnvelope<T>>;
}

export async function getHomepageData(origin: string): Promise<HomepageData> {
  const [retreat, upcoming, completed, settings, founder, testimonials, blogs, quotes, media] = await Promise.allSettled([
    fetchApi<FeaturedRetreat>(origin, "/api/public/retreats/featured"),
    fetchApi<RetreatSummary[]>(origin, "/api/public/retreats/upcoming"),
    fetchApi<CompletedRetreat[]>(origin, "/api/public/retreats/completed"),
    fetchApi<SettingsPayload>(origin, "/api/public/site-settings"),
    fetchApi<FounderContent>(origin, "/api/public/founder"),
    fetchApi<TestimonialContent[]>(origin, "/api/public/testimonials?page=1&pageSize=3&sort=sortOrder&order=asc"),
    fetchApi<BlogContent[]>(origin, "/api/public/blogs?page=1&pageSize=1&sort=publishedAt&order=desc"),
    fetchApi<QuoteContent[]>(origin, "/api/public/quotes?page=1&pageSize=6&sort=sortOrder&order=asc"),
    fetchApi<MediaContent[]>(origin, "/api/public/media?page=1&pageSize=100"),
  ]);
  return mapHomepageResponses({ retreat, upcoming, completed, settings, founder, testimonials, blogs, quotes, media });
}

export async function getUpcomingRetreats(origin: string): Promise<RetreatSummary[]> {
  try {
    const response = await fetchApi<RetreatSummary[]>(origin, "/api/public/retreats/upcoming");
    return response.data ?? [];
  } catch {
    return [];
  }
}

export type VideoEntry = {
  title: string;
  url: string;
};

export type TestimonialsPageData = {
  testimonials: TestimonialContent[];
  videos: VideoEntry[];
  mediaSlots: Record<string, string>;
};

export async function getTestimonialsPageData(origin: string): Promise<TestimonialsPageData> {
  const [testimonials, settings] = await Promise.allSettled([
    fetchApi<TestimonialContent[]>(origin, "/api/public/testimonials?page=1&pageSize=100&sort=sortOrder&order=asc"),
    fetchApi<Record<string, unknown>>(origin, "/api/public/site-settings"),
  ]);

  const rawVideos = settings.status === "fulfilled"
    ? (settings.value.data as Record<string, unknown>)?.["testimonials.videos"]
    : null;

  const mediaSlotsRaw = settings.status === "fulfilled"
    ? (settings.value.data as Record<string, unknown>)?.["media.slots"]
    : null;

  return {
    testimonials: testimonials.status === "fulfilled" ? testimonials.value.data : [],
    videos: Array.isArray(rawVideos)
      ? (rawVideos as VideoEntry[]).filter((v) => typeof v?.url === "string" && v.url.trim())
      : [],
    mediaSlots: mapMediaSlots(mediaSlotsRaw),
  };
}

export async function getBlogPost(origin: string, slug: string): Promise<BlogDetailContent | null> {
  try {
    const response = await fetchApi<BlogDetailContent>(origin, `/api/public/blogs/${encodeURIComponent(slug)}`);
    return response.data;
  } catch {
    return null;
  }
}

export const defaultFounderChapters: FounderStoryChapter[] = [
  {
    number: "01",
    label: "THE BEGINNING",
    headlineTitle: "Before Bhraman,",
    headlineEmphasis: "there was a search for another way.",
    paragraphs: [
      "In medical practice, we are trained to treat the symptom, to measure what is broken, and to intervene when balance has already been lost. But through years of listening to patients, one truth became impossible to ignore: true healing does not begin in a clinic — it begins when the nervous system finally feels safe enough to rest.",
      "That realization sparked a deeply personal search for a slower, more profound way of healing — one that reunites medical understanding with ancient wisdom, stillness, and the raw medicine of nature.",
    ],
    imageSlot: "founder/profile",
    imageAlt: "Dr. Pratiksha Shekhawat — Founder of Bhraman Retreats",
  },
  {
    number: "02",
    label: "THE BELIEF",
    headlineTitle: "Healing was never meant",
    headlineEmphasis: "to happen away from nature.",
    paragraphs: [
      "The human body is an extension of the earth, water, fire, air, and space that form our world. When we detach ourselves from these elemental rhythms — breathing artificial air, rushing through screens, and suppressing natural cycles — the body's innate intelligence becomes clouded.",
      "Elemental therapy is not an escape; it is a return. By grounding in the soil, flowing with breath, reigniting inner fire, expanding with prāṇāyāma, and resting in spacious silence, the nervous system recalibrates naturally.",
    ],
    imageSlot: "retreat/ladakh/hero",
    imageAlt: "Himalayan landscape — Nature as the foundation of healing",
  },
  {
    number: "03",
    label: "THE PRACTICE",
    headlineTitle: "Ancient wisdom.",
    headlineEmphasis: "Practised with intention.",
    paragraphs: [
      "Every practice at Bhraman is grounded in medical safety and classical yogic lineage. There are no generic routines or superficial trends — only mindful, evidence-backed elemental immersion designed to create genuine restoration.",
    ],
    imageSlot: "founder/practice",
    imageAlt: "Yogic and elemental therapeutic practice",
    credentials: [
      { label: "Background", value: "Medical & Therapeutic Practice" },
      { label: "Focus", value: "Yoga & Elemental Therapy" },
      { label: "Lineage", value: "Traditional Himalayan & Yogic Sciences" },
      { label: "Approach", value: "Somatic, Mindful & Nature-guided" },
    ],
  },
  {
    number: "04",
    label: "BHRAMAN",
    headlineTitle: "And eventually,",
    headlineEmphasis: "Bhraman became the answer.",
    paragraphs: [
      "Bhraman was born out of a desire to create intimate, unhurried sanctuaries in the high Himalayas — spaces where small circles of seekers could step out of daily noise and experience the profound medicine of the five elements.",
      "From mindful walks in Ladakh to evening fire rituals under starlit Himalayan skies, each retreat is a living container for deep rest, heartfelt connection, and inner renewal.",
    ],
    imageSlot: "memories/ladakh/community",
    imageAlt: "Bhraman Retreats community in the Himalayas",
  },
];

export function formatDateRange(start: Date, end: Date) {
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  const month = end.toLocaleDateString("en-GB", { month: "long" });
  const year = end.getFullYear();
  if (sameMonth) return `${start.getDate()}–${end.getDate()} ${month} ${year}`;
  return `${start.getDate()} ${start.toLocaleDateString("en-GB", { month: "short" })} – ${end.getDate()} ${end.toLocaleDateString("en-GB", { month: "short" })} ${year}`;
}
