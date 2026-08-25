import { PrismaClient } from "@prisma/client";
import { pbkdf2Sync, randomBytes } from "crypto";

const dbUrl = process.env.DATABASE_URL || "postgresql://bhramandbadmin:bh8r8m8na99r3t36t5bhroko@rims-designstool-dev-pg.postgres.database.azure.com:5432/bhramandb?sslmode=require";

const prisma = new PrismaClient({
  datasources: { db: { url: dbUrl } },
});

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 100_000, 64, "sha512").toString("hex");
  return { hash, salt };
}

const adminAccounts = [
  {
    username: "bhraman-sharad-admin",
    initialPassword: "Bhraman#Rims$2026!k9Wx",
    role: "SUPER_ADMIN",
    mustChangePassword: true,
  },
  {
    username: "admin-pratiksha-shekhawat",
    initialPassword: "Pratiksha#Bhraman$2026!m7Vp",
    role: "SUPER_ADMIN",
    mustChangePassword: true,
  },
];

async function seedAdmins() {
  console.log("Seeding admin user accounts to bhramandb...");
  for (const account of adminAccounts) {
    const { hash, salt } = hashPassword(account.initialPassword);
    const existing = await prisma.adminUser.findUnique({
      where: { username: account.username },
    });

    if (!existing) {
      const user = await prisma.adminUser.create({
        data: {
          username: account.username,
          passwordHash: hash,
          salt: salt,
          role: account.role,
          mustChangePassword: account.mustChangePassword,
          mfaEnabled: false,
        },
      });
      console.log(`✓ Created Admin User: "${user.username}" (Role: ${user.role})`);
    } else {
      console.log(`ℹ Admin User "${account.username}" already exists.`);
    }
  }
  console.log("\n🎉 Admin users provisioned successfully!");
}

seedAdmins()
  .catch((err) => {
    console.error("Error provisioning admin accounts:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
