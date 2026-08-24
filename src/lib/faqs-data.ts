export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: "The Journey" | "Ladakh & Altitude" | "Inclusions & Comfort" | "Booking & Preparation";
  order: number;
}

export const PREDEFINED_FAQS: FaqItem[] = [
  {
    id: "faq-1",
    question: "What is the Five Elements healing journey at Bhraman?",
    answer: "Bhraman Retreats is a cinematic 5-day immersive sanctuary curated by Dr. Pratiksha Shekhawat in Ladakh. Each day is dedicated to aligning with one elemental rhythm: Prithvi (Earth grounding), Jala (Water flow & emotional release), Agni (Fire transformation & vitality), Vāyu (Air breathwork & expansion), and Ākāśa (Space stillness & meditation).",
    category: "The Journey",
    order: 1,
  },
  {
    id: "faq-2",
    question: "Do I need prior yoga or meditation experience to join?",
    answer: "No prior experience is required. All elemental movement sessions, somatic breathwork, and guided meditations are designed for both beginners and experienced practitioners. Dr. Pratiksha customizes the practices to honor every participant's individual pace and comfort.",
    category: "The Journey",
    order: 2,
  },
  {
    id: "faq-3",
    question: "How large are the retreat circles?",
    answer: "Every retreat circle is intentionally strictly capped at 12 travellers to preserve depth, personalized attention, silent reflection, and an intimate sanctuary environment.",
    category: "The Journey",
    order: 3,
  },
  {
    id: "faq-4",
    question: "How does Bhraman handle high altitude and acclimatization in Ladakh?",
    answer: "The itinerary is scientifically structured for gradual acclimatization. Day 1 is dedicated entirely to Earth (Prithvi) grounding, rest, hydration, and gentle breathing in Leh (11,500 ft) with no strenuous travel. Dr. Pratiksha monitors oxygen levels and wellness throughout the journey, and oxygen support is available at all times.",
    category: "Ladakh & Altitude",
    order: 4,
  },
  {
    id: "faq-5",
    question: "When is the best time to visit Ladakh for this retreat?",
    answer: "Our Himalayan retreats operate during the prime Ladakh season from June through September when mountain passes are open, weather is clear and pleasant (15°C to 25°C daytime), and high-altitude monasteries are vibrant with summer energy.",
    category: "Ladakh & Altitude",
    order: 5,
  },
  {
    id: "faq-6",
    question: "What is included in the retreat package?",
    answer: "The retreat includes boutique eco-luxury accommodations in Leh and Nubra Valley, all three daily organic farm-to-table sattvic meals, daily elemental therapy sessions with Dr. Pratiksha, guided monastery and nature excursions, Inner Line Permits, private luxury transport within Ladakh, airport transfers, and retreat welcome kits.",
    category: "Inclusions & Comfort",
    order: 6,
  },
  {
    id: "faq-7",
    question: "What kind of food is served during the retreat?",
    answer: "We serve wholesome, organic, farm-fresh vegetarian and sattvic meals prepared specifically to balance bodily doshas, aid digestion at high altitude, and nourish energy levels. Vegan, gluten-free, and specific dietary needs are happily accommodated with prior notice.",
    category: "Inclusions & Comfort",
    order: 7,
  },
  {
    id: "faq-8",
    question: "What should I pack for the Ladakh retreat?",
    answer: "We recommend comfortable layered clothing (warm fleece/jacket for evenings and mornings, light breathable cottons for daytime), comfortable walking or hiking shoes, sunglasses with UV protection, high-SPF sunscreen, lip balm, a reusable water bottle, and personal medications. A detailed packing checklist is shared upon booking.",
    category: "Booking & Preparation",
    order: 8,
  },
  {
    id: "faq-9",
    question: "How do I reserve my place in the upcoming circle?",
    answer: "You can submit an enquiry via our website or reach out directly to Dr. Pratiksha via WhatsApp/Call at +91 87004 02837. Once we confirm availability in the circle, a 30% advance deposit secures your spot, with the remaining balance due 15 days before the journey.",
    category: "Booking & Preparation",
    order: 9,
  },
];
