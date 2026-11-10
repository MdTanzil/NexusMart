import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = (process.argv[2] || "owner@nexusmart.com.bd").toLowerCase();
  const name = process.argv[3] || "Platform Superuser";
  const password = process.argv[4] || "SuperAdmin123!";
  const phone = process.argv[5] || "+8801700000000";

  console.log(`Configuring Superuser (SUPER_ADMIN) for: ${email}...`);

  const superAdminRole = await prisma.role.upsert({
    where: { slug: "SUPER_ADMIN" },
    update: {},
    create: {
      name: "Super Admin",
      slug: "SUPER_ADMIN",
      description: "Full unrestricted system access",
      isSystem: true,
    },
  });

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      isStaff: true,
      status: "ACTIVE",
      passwordHash,
    },
    create: {
      name,
      email,
      phone,
      passwordHash,
      isStaff: true,
      status: "ACTIVE",
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: user.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      roleId: superAdminRole.id,
    },
  });

  await prisma.staffProfile.upsert({
    where: { userId: user.id },
    update: {
      designation: "Superuser / Platform Owner",
      department: "Executive Board",
    },
    create: {
      userId: user.id,
      employeeCode: `SU-${Date.now().toString().slice(-4)}`,
      department: "Executive Board",
      designation: "Superuser / Platform Owner",
    },
  });

  console.log("==========================================");
  console.log("SUPERUSER CONFIGURED SUCCESSFULLY!");
  console.log(`Email:    ${email}`);
  console.log(`Password: ${password}`);
  console.log(`Role:     SUPER_ADMIN (Full Access)`);
  console.log("==========================================");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
