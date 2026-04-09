const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Updating database Enums and Roles...');
  try {
    // 1. Add new variants to Postgres Enum (this is required to avoid invalid input errors)
    // NOTE: In Postgres, ADD VALUE cannot run inside a transaction block. 
    // Prisma's raw queries might run inside one depending on the environment, so we try anyway.
    await prisma.$executeRawUnsafe('ALTER TYPE "Role" ADD VALUE IF NOT EXISTS \'STUDENT\'');
    await prisma.$executeRawUnsafe('ALTER TYPE "Role" ADD VALUE IF NOT EXISTS \'CONTEST_MANAGER\'');
    console.log('✅ Added STUDENT and CONTEST_MANAGER variants to Role Enum');

    // 2. Update existing data
    const r1 = await prisma.$executeRawUnsafe('UPDATE "User" SET role = \'STUDENT\' WHERE role = \'USER\'');
    const r2 = await prisma.$executeRawUnsafe('UPDATE "User" SET role = \'CONTEST_MANAGER\' WHERE role = \'INSTRUCTOR\'');
    console.log(`✅ Migrated ${r1} USERS and ${r2} INSTRUCTORS`);
  } catch (error) {
    console.error('❌ Migration logic error:', error.message);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
