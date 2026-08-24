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
    heroImageUrl: "/hero-himalayan-dawn.png",
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

  await prisma.$transaction(
    async (tx) => {
      await tx.retreatDay.deleteMany({ where: { retreatId: retreat.id } });
      for (const day of itinerary) {
        await tx.retreatDay.create({
          data: {
            retreatId: retreat.id,
            ...dayCreate(day),
          },
        });
      }
    },
    { timeout: 30000, maxWait: 10000 }
  );
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

  const blogPosts = [
    {
      slug: "the-medicine-of-stillness-ladakh",
      title: "The Medicine of Stillness: Returning to the Five Elements in Ladakh",
      excerpt: "Why true restoration does not occur in clinical rush, but in high-altitude silence where Prithvi, Jala, Agni, Vāyu, and Ākāśa recalibrate the human nervous system.",
      authorName: "Dr. Pratiksha Shekhawat",
      coverImageUrl: "/hero-yoga-lamayuru.jpg",
      publicationStatus: "PUBLISHED",
      publishedAt: new Date("2026-03-15T09:00:00.000Z"),
      content: `
        <p class="lead-paragraph">In modern medical practice, we are trained to measure what is broken — heart rate variability, elevated cortisol, chronic inflammation. But through years of clinical and yogic observation, one truth became undeniable: the human body does not need another quick intervention. It needs the medicine of unhurried stillness.</p>
        
        <h2>The Physiology of Sacred Silence</h2>
        <p>At 11,500 feet in the Sham Valley of Ladakh, the atmosphere holds a pristine, crystalline clarity. The ambient noise of the urban world — constant digital notifications, traffic rumble, artificial lighting — dissolves completely into mountain silence. In this profound quietude, the sympathetic nervous system ('fight or flight') gently relinquishes its grip, allowing the parasympathetic vagal tone to restore deep cellular equilibrium.</p>
        
        <blockquote>“Silence is not the absence of sound; it is the presence of an ancient intelligence that was here long before our thoughts began.”</blockquote>
        
        <h2>Aligning with the Panch Mahābhūta</h2>
        <p>Our 5-day sanctuary is structured around the five primal building blocks of Ayurvedic and yogic science:</p>
        <ul>
          <li><strong>Prithvi (Earth):</strong> Day 1 begins with grounded somatic anchoring into the soil, stabilising the Muladhara chakra and calming high-altitude disorientation.</li>
          <li><strong>Jala (Water):</strong> Day 2 invites emotional fluidity through lunar movement (Chandra Namaskar) and restorative soundscapes along glacier-fed streams.</li>
          <li><strong>Agni (Fire):</strong> Day 3 kindles internal transformation and metabolic vitality through solar rituals and focused Trataka candle contemplation.</li>
          <li><strong>Vāyu (Air):</strong> Day 4 opens thoracic space with heart-centred Prāṇāyāma, dispelling accumulated grief and fatigue.</li>
          <li><strong>Ākāśa (Space):</strong> Day 5 culminates in vast sky-gazing at ancient monasteries, dissolving self-limiting boundaries into spacious awareness.</li>
        </ul>
        
        <h2>Carrying Stillness Beyond the Mountain</h2>
        <p>When our circle of twelve travellers completes their journey, the transformation is palpable — softened facial tension, steady breathing, radiant eyes, and renewed clarity of purpose. You do not leave the mountain behind; you carry its silence within you as a permanent inner sanctuary.</p>
      `,
    },
    {
      slug: "sattvic-mountain-nourishment-ladakh",
      title: "Sattvic Mountain Nourishment: Healing the Body at 11,500 Feet",
      excerpt: "How mindful digestion, organic Ladakhi barley (Tsampa), wild herbs, and warm infusions sustain vitality across high Himalayan passes.",
      authorName: "Dr. Pratiksha Shekhawat",
      coverImageUrl: "/hero-himalayan-dawn.png",
      publicationStatus: "PUBLISHED",
      publishedAt: new Date("2026-03-01T10:30:00.000Z"),
      content: `
        <p class="lead-paragraph">At high altitudes, the body’s metabolic fire (Agni) undergoes a delicate shift. Digestion slows, oxygen concentration decreases, and the cellular demand for clean, easily assimilable prana becomes paramount.</p>
        
        <h2>The Wisdom of Himalayan Sattvic Cooking</h2>
        <p>Our kitchen at Bhraman is guided by ancient Ayurvedic culinary principles tailored specifically for the cold desert climate of Ladakh. We avoid processed sugars, heavy oils, and refined grains, relying instead on seasonal, farm-fresh ingredients grown in high-altitude mineral-rich glacial soils.</p>
        
        <h2>The Sacred Staples of Our Table</h2>
        <ul>
          <li><strong>Roasted Ladakhi Tsampa:</strong> Sun-ripened organic barley, slowly roasted and stone-ground. Tsampa provides sustained complex carbohydrates without creating digestive sluggishness or glycemic spikes.</li>
          <li><strong>Wild Seabuckthorn & Apricot Elixirs:</strong> Rich in Vitamin C, flavonoids, and essential omegas, protecting cellular membranes against oxidative stress and mountain sun.</li>
          <li><strong>Digestive Herbal Infusions:</strong> Fresh ginger, whole cumin, fennel, and local mint brewed in pure mountain spring water to keep the inner flame luminous and hydrated.</li>
        </ul>
        
        <blockquote>“When food is prepared with reverence and eaten with mindfulness, every meal becomes a therapeutic treatment.”</blockquote>
        
        <p>Every meal during the retreat is enjoyed in silent gratitude before gentle conversations unfold, allowing travellers to truly taste the earth that sustains them.</p>
      `,
    },
    {
      slug: "earth-as-anchor-somatic-grounding",
      title: "Earth as Anchor: Somatic Grounding in the Cold Desert Sands",
      excerpt: "In an overstimulated world, placing bare feet upon high-altitude earth grounds the electrical rhythms of the body and dissolves chronic fatigue.",
      authorName: "Dr. Pratiksha Shekhawat",
      coverImageUrl: "/hero-yoga-lamayuru.webp",
      publicationStatus: "PUBLISHED",
      publishedAt: new Date("2026-02-18T14:15:00.000Z"),
      content: `
        <p class="lead-paragraph">Most modern humans live almost entirely insulated from the Earth’s surface — separated by synthetic rubber soles, concrete pavements, and multi-storey high-rises. In medical terms, this chronic disconnect contributes to unchecked free-radical accumulation and sub-clinical inflammation.</p>
        
        <h2>The Prithvi Ritual in Ladakh</h2>
        <p>On Day 1 of our retreat, before any strenuous trek or mountain excursion, we gather on the mineral-rich earth of Lamayuru for our grounding ceremony. Feeling the raw, unpaved sand and cool slate beneath bare soles creates an instantaneous parasympathetic shift.</p>
        
        <h2>What Happens When We Ground?</h2>
        <p>Studies in biophysics demonstrate that direct contact with the Earth allows free electrons to migrate into the body, neutralizing positive electrostatic charges and stabilizing autonomic cardiac rhythms. In our participants, we observe an immediate deepening of inhalation, a release in jaw tension, and a profound sense of safety.</p>
        
        <p>To ground is not to sink; it is to remember that you are supported by an unbreakable foundation. Once the roots are deep, the spirit is free to reach into the mountain sky.</p>
      `,
    },
    {
      slug: "vayu-prana-art-of-conscious-breathing",
      title: "Vāyu & Prāṇa: The Art of Conscious Breathing in the High Himalayas",
      excerpt: "How high-altitude breathwork transforms the autonomic nervous system, clears thoracic constriction, and restores natural vitality.",
      authorName: "Dr. Pratiksha Shekhawat",
      coverImageUrl: "/images/gallery/IMG_9160.JPG",
      publicationStatus: "PUBLISHED",
      publishedAt: new Date("2026-04-10T10:00:00.000Z"),
      content: `
        <p class="lead-paragraph">In the rush of modern urban living, our breath becomes shallow, rapid, and defensive — trapped in the upper chest. In the high Himalayas, where the air is thin and sacredly pure, every conscious inhalation becomes an act of intentional healing.</p>

        <h2>The Principle of Vāyu (Air) in Elemental Medicine</h2>
        <p>In Ayurvedic science, Vāyu governs all biological movement — from the circulation of blood and neural impulses to the rhythm of our breath and the flow of thoughts. When Vāyu is aggravated by stress, overstimulation, and constant multitasking, it manifests as anxiety, insomnia, racing thoughts, and digestive irregularity.</p>
        
        <blockquote>“The breath is the bridge between the visible body and the invisible mind. When the breath slows, the nervous system remembers safety.”</blockquote>

        <h2>High-Altitude Prāṇāyāma: Cellular Adaptation</h2>
        <p>At high altitudes, the body naturally enhances its oxygen efficiency and red blood cell oxygen-carrying capacity. When combined with slow, rhythmic 4-2-6 breathing and Nadi Shodhana (alternate nostril breathing), the parasympathetic nervous system is stimulated directly through the vagus nerve.</p>

        <h2>Three Daily Practices to Recalibrate Your Breath</h2>
        <ul>
          <li><strong>Morning Diaphragmatic Breath:</strong> 5 minutes before checking digital devices, feeling the abdomen expand on inhale and soften on exhale.</li>
          <li><strong>Bhrāmarī (Humming Bee Breath):</strong> Producing a gentle vibrating hum on exhalation to soothe the cranial nerves and release mental chatter.</li>
          <li><strong>Evening Extended Exhale (4-2-6 Ratio):</strong> Inhale for 4 counts, hold gently for 2, and exhale slowly for 6 counts to induce deep, restorative sleep.</li>
        </ul>

        <h2>Carrying the Mountain Breath Home</h2>
        <p>You do not need to be in the Himalayas to reclaim your breath. By pausing three times a day to take five conscious, unhurried breaths, you bring the spacious stillness of Ladakh into your daily life.</p>
      `,
    },
    {
      slug: "sacred-nourishment-ayurvedic-kitchen-elemental-digestion",
      title: "Sacred Nourishment: The Ayurvedic Kitchen and Elemental Digestion",
      excerpt: "Exploring how local Himalayan grains, warming digestive herbs, and mindful seasonal eating restore Agni (digestive fire) and gut health.",
      authorName: "Dr. Pratiksha Shekhawat",
      coverImageUrl: "/images/gallery/IMG_9210.JPG",
      publicationStatus: "PUBLISHED",
      publishedAt: new Date("2026-05-02T10:00:00.000Z"),
      content: `
        <p class="lead-paragraph">Food in our modern culture has become complicated — counted in calories, restricted by trends, and eaten in a hurry while staring at screens. In the Ayurvedic tradition, food is Ahara: sacred fuel that builds our physical tissues (Dhatus) and sustains our subtle life energy (Ojas).</p>

        <h2>Igniting Jatharāgni (The Digestive Fire)</h2>
        <p>According to Ayurveda, health is not simply what you eat, but what you are able to digest, assimilate, and eliminate. When Agni (the inner fire) is strong, digestion is smooth, energy is steady, and the mind is clear. When Agni is dampened by cold foods, irregular meal times, and stress, toxins (Ama) accumulate.</p>

        <blockquote>“When diet is wrong, medicine is of no use. When diet is correct, medicine is of no need.” — Ancient Ayurvedic Proverb</blockquote>

        <h2>The Wisdom of Himalayan Nourishment</h2>
        <p>During our retreats in Ladakh and Spiti, we prepare meals that honour the high-altitude climate and the body's elemental needs:</p>
        <ul>
          <li><strong>Warming Herbs:</strong> Ginger, black pepper, cumin, and carom seeds to stimulate micro-circulation and ease high-altitude digestion.</li>
          <li><strong>Himalayan Roasted Barley (Tsampa):</strong> A slow-burning, deeply grounding grain that sustains endurance and stabilises blood sugar.</li>
          <li><strong>Golden Herbal Decoctions:</strong> Infusions of local sea buckthorn, tulsi, and saffron to boost immunity and calm inflammation.</li>
        </ul>

        <h2>The Four Pillars of Mindful Eating</h2>
        <p>To restore your relationship with nourishment in urban life, begin with these simple rituals:</p>
        <ol>
          <li>Eat in a calm, seated environment without digital screens.</li>
          <li>Favor warm, freshly cooked meals with a teaspoon of pure ghee or sesame oil.</li>
          <li>Leave one-third of the stomach capacity empty to allow digestive juices to circulate freely.</li>
          <li>Sip warm ginger water throughout the day rather than iced beverages with meals.</li>
        </ol>
      `,
    },
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: post,
      create: post,
    });
  }

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
        url: "/hero-himalayan-dawn.png",
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
        posterUrl: "/hero-himalayan-dawn.png",
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
