import { PrismaClient } from "@prisma/client";

const oldDbUrl = "postgresql://bhraman_admin:BRPass%401234%24@psql-bhr-ret-dev-cin.postgres.database.azure.com:5432/bhraman?sslmode=require";
const newDbUrl = "postgresql://bhramandbadmin:bh8r8m8na99r3t36t5bhroko@rims-designstool-dev-pg.postgres.database.azure.com:5432/bhramandb?sslmode=require";

const oldPrisma = new PrismaClient({
  datasources: { db: { url: oldDbUrl } },
});

const newPrisma = new PrismaClient({
  datasources: { db: { url: newDbUrl } },
});

async function copyData() {
  console.log("Connecting to old database and new database...");

  // Clean placeholder seed data in new database
  console.log("Clearing placeholder seed tables in new database...");
  await newPrisma.mediaAsset.deleteMany();
  await newPrisma.itineraryActivity.deleteMany();
  await newPrisma.itinerarySection.deleteMany();
  await newPrisma.retreatDay.deleteMany();
  await newPrisma.booking.deleteMany();
  await newPrisma.enquiry.deleteMany();
  await newPrisma.retreat.deleteMany();
  await newPrisma.siteSetting.deleteMany();
  await newPrisma.founderProfile.deleteMany();
  await newPrisma.testimonial.deleteMany();
  await newPrisma.blogPost.deleteMany();
  await newPrisma.user.deleteMany();

  // 1. Users
  console.log("Transferring Users...");
  const users = await oldPrisma.user.findMany();
  for (const u of users) {
    await newPrisma.user.create({ data: u });
  }
  console.log(`✓ Transferred ${users.length} Users.`);

  // 2. Retreats & Itineraries (First so foreign keys resolve)
  console.log("Transferring Retreats & Itineraries...");
  const retreats = await oldPrisma.retreat.findMany({
    include: {
      itinerary: {
        include: {
          sections: {
            include: {
              activities: true,
            },
          },
        },
      },
    },
  });

  for (const r of retreats) {
    const { itinerary, ...retreatData } = r;
    await newPrisma.retreat.create({ data: retreatData });

    if (itinerary && itinerary.length > 0) {
      for (const day of itinerary) {
        const { sections, ...dayData } = day;
        await newPrisma.retreatDay.create({ data: dayData });

        if (sections && sections.length > 0) {
          for (const sec of sections) {
            const { activities, ...secData } = sec;
            await newPrisma.itinerarySection.create({ data: secData });

            if (activities && activities.length > 0) {
              for (const act of activities) {
                await newPrisma.itineraryActivity.create({ data: act });
              }
            }
          }
        }
      }
    }
  }
  console.log(`✓ Transferred ${retreats.length} Retreats with Itineraries.`);

  // 3. Media Assets
  console.log("Transferring MediaAssets...");
  const media = await oldPrisma.mediaAsset.findMany();
  for (const m of media) {
    await newPrisma.mediaAsset.create({ data: m });
  }
  console.log(`✓ Transferred ${media.length} MediaAssets.`);

  // 4. Site Settings (Admin configurations, background slots, hero text)
  console.log("Transferring SiteSettings...");
  const settings = await oldPrisma.siteSetting.findMany();
  for (const s of settings) {
    await newPrisma.siteSetting.create({ data: s });
  }
  console.log(`✓ Transferred ${settings.length} SiteSettings.`);

  // 5. Founder Profile
  console.log("Transferring FounderProfiles...");
  const founders = await oldPrisma.founderProfile.findMany();
  for (const f of founders) {
    await newPrisma.founderProfile.create({ data: f });
  }
  console.log(`✓ Transferred ${founders.length} FounderProfiles.`);

  // 6. Testimonials
  console.log("Transferring Testimonials...");
  const testimonials = await oldPrisma.testimonial.findMany();
  for (const t of testimonials) {
    await newPrisma.testimonial.create({ data: t });
  }
  console.log(`✓ Transferred ${testimonials.length} Testimonials.`);

  // 7. Blog Posts (Journals)
  console.log("Transferring BlogPosts (Journals)...");
  const blogs = await oldPrisma.blogPost.findMany();
  for (const b of blogs) {
    await newPrisma.blogPost.create({ data: b });
  }
  console.log(`✓ Transferred ${blogs.length} BlogPosts.`);

  // 8. Enquiries & Bookings
  console.log("Transferring Enquiries & Bookings...");
  const enquiries = await oldPrisma.enquiry.findMany();
  for (const e of enquiries) {
    await newPrisma.enquiry.create({ data: e });
  }
  console.log(`✓ Transferred ${enquiries.length} Enquiries.`);

  const bookings = await oldPrisma.booking.findMany();
  for (const bk of bookings) {
    await newPrisma.booking.create({ data: bk });
  }
  console.log(`✓ Transferred ${bookings.length} Bookings.`);

  console.log("\n🎉 ALL ADMIN PANEL DATA, MEDIA ASSETS, JOURNALS & SETTINGS HAVE BEEN TRANSFERRED TO BHRAMANDB!");
}

copyData()
  .catch((e) => {
    console.error("Migration transfer error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await oldPrisma.$disconnect();
    await newPrisma.$disconnect();
  });
