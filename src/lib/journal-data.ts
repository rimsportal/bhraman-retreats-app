export interface JournalPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  authorName: string;
  readingTime: string;
  publishedAt: string;
  category: string;
  publicationStatus?: "PUBLISHED" | "DRAFT";
}

export const PREDEFINED_JOURNAL_POSTS: JournalPost[] = [
  {
    id: "journal-1",
    slug: "the-medicine-of-stillness-ladakh",
    title: "The Medicine of Stillness: Returning to the Five Elements in Ladakh",
    excerpt: "Why true restoration does not occur in clinical rush, but in high-altitude silence where Prithvi, Jala, Agni, Vāyu, and Ākāśa recalibrate the human nervous system.",
    authorName: "Dr. Pratiksha Shekhawat",
    readingTime: "6 min read",
    coverImageUrl: "/hero-yoga-lamayuru.jpg",
    publishedAt: "2026-03-15T09:00:00.000Z",
    category: "Elemental Medicine",
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
    id: "journal-2",
    slug: "sattvic-mountain-nourishment-ladakh",
    title: "Sattvic Mountain Nourishment: Healing the Body at 11,500 Feet",
    excerpt: "How mindful digestion, organic Ladakhi barley (Tsampa), wild herbs, and warm infusions sustain vitality across high Himalayan passes.",
    authorName: "Dr. Pratiksha Shekhawat",
    readingTime: "4 min read",
    coverImageUrl: "/hero-himalayan-dawn.png",
    publishedAt: "2026-03-01T10:30:00.000Z",
    category: "Sacred Food & Ayurveda",
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
    id: "journal-3",
    slug: "earth-as-anchor-somatic-grounding",
    title: "Earth as Anchor: Somatic Grounding in the Cold Desert Sands",
    excerpt: "In an overstimulated world, placing bare feet upon high-altitude earth grounds the electrical rhythms of the body and dissolves chronic fatigue.",
    authorName: "Dr. Pratiksha Shekhawat",
    readingTime: "5 min read",
    coverImageUrl: "/hero-yoga-lamayuru.webp",
    publishedAt: "2026-02-18T14:15:00.000Z",
    category: "Somatic Healing",
    content: `
      <p class="lead-paragraph">Most modern humans live almost entirely insulated from the Earth’s surface — separated by synthetic rubber soles, concrete pavements, and multi-storey high-rises. In medical terms, this chronic disconnect contributes to unchecked free-radical accumulation and sub-clinical inflammation.</p>
      
      <h2>The Prithvi Ritual in Ladakh</h2>
      <p>On Day 1 of our retreat, before any strenuous trek or mountain excursion, we gather on the mineral-rich earth of Lamayuru for our grounding ceremony. Feeling the raw, unpaved sand and cool slate beneath bare soles creates an instantaneous parasympathetic shift.</p>
      
      <h2>What Happens When We Ground?</h2>
      <p>Studies in biophysics demonstrate that direct contact with the Earth allows free electrons to migrate into the body, neutralizing positive electrostatic charges and stabilizing autonomic cardiac rhythms. In our participants, we observe an immediate deepening of inhalation, a release in jaw tension, and a profound sense of safety.</p>
      
      <p>To ground is not to sink; it is to remember that you are supported by an unbreakable foundation. Once the roots are deep, the spirit is free to reach into the mountain sky.</p>
    `,
  },
];
