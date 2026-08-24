import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const itinerary = [
  {
    dayNumber: 1,
    element: "Earth",
    title: "Ground & arrive",
    description: "Arrive gently, meet the circle and reconnect with the steadiness of the body.",
    activities: ["Opening circle", "Clay therapy", "Herb walk", "Rooted yoga", "Inner silence"],
  },
  {
    dayNumber: 2,
    element: "Water",
    title: "Flow & release",
    description: "Explore softness, rhythm and release through breath, movement and nourishment.",
    activities: ["Chandra Namaskar", "Breathwork and sound", "Ayurvedic kitchen", "Ashram visit", "Yoga Nidra"],
  },
  {
    dayNumber: 3,
    element: "Fire",
    title: "Transform & awaken",
    description: "Cultivate clear energy through solar practice, ritual and focused awareness.",
    activities: ["Surya Arghya", "Dynamic yoga", "Agni kriyas", "Trataka", "Kirtan circle"],
  },
  {
    dayNumber: 4,
    element: "Air",
    title: "Expand & express",
    description: "Create space around the heart and voice with breath, sound and restorative touch.",
    activities: ["Prāṇāyāma", "Heart-opening flow", "Abhyanga", "Herbal tea circle", "Bīja mantra"],
  },
  {
    dayNumber: 5,
    element: "Space",
    title: "Integrate & return",
    description: "Rest in spacious awareness and carry the elemental journey into daily life.",
    activities: ["Sky gazing", "Yoga Nidra", "Inner silence", "Closing ritual", "Sharing circle"],
  },
];

const retreats = [
  {
    slug: "ladakh-edition-1-sep-2025",
    title: "Ladakh Elemental Retreat",
    edition: "Ladakh Edition 1.0",
    summary: "The inaugural five-day journey through the high-altitude silence, ancient monasteries, and elemental landscapes of Ladakh.",
    description: "Our inaugural five-element journey through Ladakh brought together 18 mindful travellers for deep restoration.",
    location: "Sham Valley, Ladakh",
    venue: "Lamayuru Monastery",
    startDate: new Date("2025-09-12T00:00:00.000Z"),
    endDate: new Date("2025-09-16T00:00:00.000Z"),
    priceInPaise: 2999900,
    capacity: 18,
    participantCount: 18,
    status: "COMPLETED",
    displayOrder: 1,
    publicationStatus: "PUBLISHED",
    highlight: "The mountains became our classroom, silence became our practice, and five days became a memory carried home.",
    storyTitle: "Five days in the mountains. A thousand small moments.",
    storyBody: "In September 2025, eighteen travellers gathered in the ancient valley of Lamayuru to experience the five elements in their purest Himalayan forms.\n\nFrom early morning Earth grounding amidst cold desert sands to evening Fire ceremonies under star-filled skies, each day allowed the nervous system to settle into silence and deep restoration.",
    heroImageUrl: "/uploads/images/background/hero-himalayan-dawn.jpg",
    publishedAt: new Date(),
  },
  {
    slug: "ladakh-edition-2-sep-2026",
    title: "Ladakh Edition 2.0",
    edition: "Edition 2.0",
    summary: "Five elemental days shaped by high-altitude stillness, monastery rhythms and the vast landscapes of Ladakh.",
    description: "A five-element Bhraman retreat through the silence, culture and mountain wisdom of Ladakh.",
    location: "Sham Valley, Ladakh",
    venue: "Lamayuru Monastery",
    startDate: new Date("2026-09-12T00:00:00.000Z"),
    endDate: new Date("2026-09-16T00:00:00.000Z"),
    priceInPaise: 2999900,
    capacity: 12,
    status: "BOOKING_OPEN",
    publicationStatus: "PUBLISHED",
    highlight: "Stay at Lamayuru Monastery",
    publishedAt: new Date(),
  },
  {
    slug: "uttarakhand-retreat-dec-2026",
    title: "Uttarakhand Retreat",
    edition: null,
    summary: "Five restorative days of elemental practice, conscious nourishment and quiet immersion in the Himalayan foothills.",
    description: "An intimate five-element Bhraman retreat rooted in the natural rhythms of Uttarakhand.",
    location: "Uttarakhand, India",
    venue: "Rishikesh Foothills Sanctuary",
    startDate: new Date("2026-12-25T00:00:00.000Z"),
    endDate: new Date("2026-12-29T00:00:00.000Z"),
    priceInPaise: 2999900,
    capacity: 12,
    status: "UPCOMING",
    publicationStatus: "PUBLISHED",
    highlight: null,
    publishedAt: new Date(),
  },
];

function dayCreate(day) {
  return {
    dayNumber: day.dayNumber,
    element: day.element,
    title: day.title,
    description: day.description,
    publicationStatus: "PUBLISHED",
    sections: {
      create: [{
        title: `${day.element} practices`,
        description: `The day unfolds through ${day.element.toLowerCase()}-led practices and reflection.`,
        sortOrder: 1,
        publicationStatus: "PUBLISHED",
        activities: {
          create: day.activities.map((title, index) => ({
            title,
            sortOrder: index + 1,
            publicationStatus: "PUBLISHED",
          })),
        },
      }],
    },
  };
}

async function seedRetreat(definition) {
  const retreat = await prisma.retreat.upsert({
    where: { slug: definition.slug },
    update: definition,
    create: definition,
  });

  await prisma.$transaction(async (tx) => {
    await tx.retreatDay.deleteMany({ where: { retreatId: retreat.id } });
    for (const day of itinerary) {
      await tx.retreatDay.create({
        data: {
          retreatId: retreat.id,
          ...dayCreate(day),
        },
      });
    }
  });
}

async function main() {
  for (const retreat of retreats) await seedRetreat(retreat);

  const testimonials = [
    {
      name: "Vineeta Garg",
      location: "Lucknow",
      imageUrl: "",
      quote: "Everyone needs to experience this, get rejuvenated and go back to their lives. I had done retreats earlier also but this was different, it was magical, beautiful, calming, comforting and I felt at home. Dr. Pratiksha's approach towards the participants is different, they make you feel like a friend and at home, here I learnt that I need to take the charge of my own life and become so emotionally strong that nothing can waiver me."
    },
    {
      name: "Kabir Mehta",
      location: "New Delhi",
      imageUrl: "",
      quote: "The high-altitude silence of Ladakh combined with the elemental daily structure was profound. I arrived feeling incredibly scattered and left with a deep, grounded sense of clarity. The clay therapy on Day 1 was a revelation. I have never felt so connected to the Earth."
    },
    {
      name: "Ananya Sen",
      location: "Kolkata",
      imageUrl: "",
      quote: "A truly transformative five days. Dr. Pratiksha's guidance during the Fire element meditation (Trataka) helped me release years of accumulated mental tension. The food was nourishing, the monastery visits were serene, and the small circle felt like family."
    },
    {
      name: "Dr. Rohan Deshmukh",
      location: "Mumbai",
      imageUrl: "",
      quote: "As a medical practitioner, I was thoroughly impressed by how scientifically and soulfully the Panch Mahabhuta philosophy was integrated. Every movement, every breathwork session had a clear physiological and energetic purpose. Highly recommended for complete rejuvenation."
    },
    {
      name: "Meera Nair",
      location: "Bengaluru",
      imageUrl: "",
      quote: "I came to Bhraman seeking stillness, and I found so much more. Sky-gazing during the Space element day opened up a sense of inner expansiveness I hadn't felt in decades. Sleeping at the monastery and waking up to the chants was an unforgettable experience."
    },
    {
      name: "Vikram Rathore",
      location: "Jaipur",
      imageUrl: "",
      quote: "The perfect antidote to modern burnout. The Air element day, with heart-opening flows and sound healing, was my favorite. It felt like shedding a heavy armor I didn't even know I was carrying. The attention to detail in every aspect of the retreat is luxury at its finest."
    },
    {
      name: "Pooja Hegde",
      location: "Hyderabad",
      imageUrl: "",
      quote: "Bhraman is not just a holiday; it's a recalibration of the self. The water breathwork session by the stream allowed me to release old emotional blocks. The local Ladakhi hospitality, combined with Dr. Pratiksha's wisdom, makes this a rare gem."
    },
    {
      name: "Arjun Banerjee",
      location: "Pune",
      imageUrl: "",
      quote: "From the very first evening circle, I felt completely supported. The ayurvedic meals were delicious and gentle on the body. We spent five days moving with the elements, sleeping deeply, and laughing often. I am going back to my city life with a renewed spirit."
    },
    {
      name: "Tara D’Souza",
      location: "Goa",
      imageUrl: "",
      quote: "The absolute beauty of the Sham Valley, the silence of the mountains, and the intentional structure of the five days created the perfect container. It has been three weeks since I returned, and the sense of peace I carried back is still completely intact."
    }
  ];

  await prisma.$transaction(async (tx) => {
    await tx.testimonial.deleteMany({});
    await tx.testimonial.createMany({
      data: testimonials.map((t, index) => ({
        slug: `guest-${index + 1}-${t.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
        name: t.name,
        location: t.location,
        imageUrl: t.imageUrl,
        quote: t.quote,
        sortOrder: index,
        publicationStatus: "PUBLISHED",
        publishedAt: new Date()
      }))
    });
  });

  await prisma.blogPost.upsert({
    where: { slug: "why-choose-bhraman-retreats" },
    update: {},
    create: {
      slug: "why-choose-bhraman-retreats",
      title: "Why Choose Bhraman Retreats?",
      excerpt: "A considered approach to elemental wellbeing, intimate groups and meaningful Himalayan journeys.",
      content: "<p>Bhraman Retreats brings together the five elements, thoughtful guidance and unhurried travel. This draft is ready for the client’s complete editorial copy.</p>",
      authorName: "Bhraman Retreats",
      publicationStatus: "DRAFT",
    },
  });

  await prisma.founderProfile.upsert({
    where: { slug: "founder" },
    update: {
      name: "Dr. Pratiksha Shekhawat",
      title: "Founder · Bhraman Retreats",
      publicationStatus: "PUBLISHED",
      publishedAt: new Date(),
    },
    create: {
      slug: "founder",
      name: "Dr. Pratiksha Shekhawat",
      title: "Founder · Bhraman Retreats",
      bio: "<p>Doctor, yoga and elemental therapist devoted to restorative Himalayan retreats.</p>",
      publicationStatus: "PUBLISHED",
      publishedAt: new Date(),
    },
  });

  await prisma.quote.upsert({
    where: { slug: "nature-as-guide" },
    update: {},
    create: {
      slug: "nature-as-guide",
      text: "Nature holds everything we need to heal. We only have to learn how to listen again.",
      attribution: "Dr. Pratiksha Shekhawat",
      context: "Founder philosophy",
      sortOrder: 1,
      publicationStatus: "PUBLISHED",
      publishedAt: new Date(),
    },
  });

  const pastRetreat = await prisma.retreat.findUnique({
    where: { slug: "ladakh-edition-1-sep-2025" },
  });

  if (pastRetreat) {
    const memoryMedia = [
      {
        blobName: "retreats/ladakh-edition-1/cover/cover.jpg",
        url: "/uploads/images/background/hero-himalayan-dawn.jpg",
        altText: "Sham Valley and Lamayuru landscape in Ladakh",
        title: "Sham Valley, Ladakh",
        caption: "Our sacred sanctuary amidst the moonland valleys of Lamayuru.",
        category: "Nature",
        kind: "IMAGE",
        isCover: true,
        displayOrder: 1,
        retreatId: pastRetreat.id,
        publicationStatus: "PUBLISHED",
        mimeType: "image/jpeg",
      },
      {
        blobName: "retreats/ladakh-edition-1/gallery/monastery-morning.jpg",
        url: "/hero-yoga-lamayuru.jpg",
        altText: "Morning prayer and meditation at Lamayuru Monastery",
        title: "Morning Monastery Chants",
        caption: "Early morning chants echoing through the ancient prayer halls.",
        category: "Monastery",
        kind: "IMAGE",
        displayOrder: 2,
        retreatId: pastRetreat.id,
        publicationStatus: "PUBLISHED",
        mimeType: "image/jpeg",
      },
      {
        blobName: "retreats/ladakh-edition-1/gallery/yoga-practice.jpg",
        url: "/uploads/images/background/upcoming-retreats.jpg",
        altText: "Elemental grounding yoga and somatic alignment in Ladakh",
        title: "Earth Element Grounding",
        caption: "Conscious somatic flow and prāṇāyāma under the open Himalayan sky.",
        category: "Practice",
        kind: "IMAGE",
        displayOrder: 3,
        retreatId: pastRetreat.id,
        publicationStatus: "PUBLISHED",
        mimeType: "image/jpeg",
      },
      {
        blobName: "retreats/ladakh-edition-1/gallery/community-circle.jpg",
        url: "/uploads/images/background/testimonials.jpg",
        altText: "The 18 retreat participants gathering for tea and reflection",
        title: "Community Sharing Circle",
        caption: "Deep conversations and warm herbal chai as the sun sets over the peaks.",
        category: "Community",
        kind: "IMAGE",
        displayOrder: 4,
        retreatId: pastRetreat.id,
        publicationStatus: "PUBLISHED",
        mimeType: "image/jpeg",
      },
      {
        blobName: "retreats/ladakh-edition-1/videos/retreat-film.mp4",
        url: "/media/videos/ladakh-edition-1.mp4",
        posterUrl: "/uploads/images/background/hero-himalayan-dawn.jpg",
        altText: "Ladakh Edition 1.0 — A Journey Lived (Short Film)",
        title: "Ladakh Edition 1.0 — A Journey Lived",
        caption: "Five elemental days of stillness, mountain wisdom and heartfelt community.",
        category: "Ceremony",
        kind: "VIDEO",
        durationSeconds: 194,
        displayOrder: 6,
        retreatId: pastRetreat.id,
        publicationStatus: "PUBLISHED",
        mimeType: "video/mp4",
      },
    ];

    for (const item of memoryMedia) {
      await prisma.mediaAsset.upsert({
        where: { blobName: item.blobName },
        update: item,
        create: item,
      });
    }
  }

  await prisma.siteSetting.upsert({
    where: { key: "brand.identity" },
    update: {},
    create: {
      key: "brand.identity",
      value: {
        name: "Bhraman Retreats",
        positioning: "Elemental retreats in the Himalayas",
      },
      description: "Public brand identity settings.",
      publicationStatus: "PUBLISHED",
      publishedAt: new Date(),
    },
  });

  await prisma.siteSetting.upsert({
    where: { key: "home.content" },
    update: {},
    create: {
      key: "home.content",
      value: {
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
          "When these elements are in balance, the body’s natural intelligence flourishes — digestion strengthens, sleep deepens, hormones align, and the nervous system returns to its natural rhythm of rest and renewal. Through elemental therapy, the senses awaken, pranic flow becomes unobstructed, and the mind begins to mirror the quiet order of nature itself. Each day of this retreat is devoted to one element — allowing you to experience its medicine through carefully curated practices, yogic techniques, and sensory experiences that bring harmony to body, mind, and spirit."
        ],
        philosophyCta: "Walk through the five elements",
        elementsLabel: "THE FIVE-DAY JOURNEY",
        elementsTitle: "Five elements.\nFive days.",
        elementsEmphasis: "One journey inward.",
        elementsIntro: "Each day is devoted to one element — experienced through movement, breath, ritual, nature and stillness. Together, they unfold as one journey back to yourself.",
        itineraryLabel: "Your five-day rhythm",
        itineraryTitle: "A journey that",
        itineraryEmphasis: "unfolds slowly.",
        itineraryIntro: "Every day honours one element through movement, traditional practice, conscious nourishment and reflection.",
        itineraryNote: "The complete time-by-time schedule becomes available in your retreat account after booking.",
        founderLabel: "THE STORY BEHIND BHRAMAN",
        founderTitle: "Rooted in medicine.",
        founderEmphasis: "Guided by nature.",
        testimonialsLabel: "Voices from the journey",
        testimonialsTitle: "What guests",
        testimonialsEmphasis: "carry home.",
        closingLabel: "Your next journey awaits",
        closingTitle: "Come back to what",
        closingEmphasis: "feels essential.",
        closingCopy: "Join the next Bhraman retreat and experience life in its natural rhythm.",
        footerTagline: "Silence as teacher · Element as medicine · Nature as guide"
      },
      description: "Editable homepage copy.",
      publicationStatus: "PUBLISHED",
      publishedAt: new Date(),
    },
  });

  await prisma.siteSetting.upsert({
    where: { key: "home.elements" },
    update: {},
    create: {
      key: "home.elements",
      value: [
        { key: "earth", symbol: "01", name: "Earth", sanskrit: "Prithvi", verb: "Root", practice: "Mud therapy", detail: "Grounding yoga, barefoot nature walks and the healing touch of soil." },
        { key: "water", symbol: "02", name: "Water", sanskrit: "Jala", verb: "Release", practice: "Breathwork", detail: "Fluid movement, sound and breath rituals to soften what you are holding." },
        { key: "fire", symbol: "03", name: "Fire", sanskrit: "Agni", verb: "Transform", practice: "Trataka", detail: "Solar practice, candle gazing and expression to rekindle inner clarity." },
        { key: "air", symbol: "04", name: "Air", sanskrit: "Vāyu", verb: "Expand", practice: "Sound healing", detail: "Prāṇāyāma, mantra and spacious movement to invite lightness." },
        { key: "space", symbol: "05", name: "Space", sanskrit: "Ākāśa", verb: "Observe", practice: "Meditation", detail: "Sky gazing, inner silence and deep rest to return to awareness." }
      ],
      description: "Editable five-element homepage cards.",
      publicationStatus: "PUBLISHED",
      publishedAt: new Date(),
    },
  });
}

main()
  .then(() => console.info("Bhraman CMS seed completed."))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
