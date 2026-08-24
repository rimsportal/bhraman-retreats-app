import { PrismaClient } from "@prisma/client";

const newDbUrl = "postgresql://bhramandbadmin:bh8r8m8na99r3t36t5bhroko@rims-designstool-dev-pg.postgres.database.azure.com:5432/bhramandb?sslmode=require";

const prisma = new PrismaClient({
  datasources: { db: { url: newDbUrl } },
});

const newJournals = [
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

async function addJournals() {
  console.log("Adding 2 new journal articles to bhramandb...");
  for (const j of newJournals) {
    const post = await prisma.blogPost.upsert({
      where: { slug: j.slug },
      update: j,
      create: j,
    });
    console.log(`✓ Added/Updated Journal: "${post.title}" (slug: ${post.slug})`);
  }
  console.log("\n🎉 Both journals are now live in bhramandb!");
}

addJournals()
  .catch((e) => {
    console.error("Error adding journals:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
