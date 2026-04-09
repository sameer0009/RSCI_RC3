const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Migrating user roles...');
  try {
    const result1 = await prisma.$executeRawUnsafe('UPDATE "User" SET role = \'STUDENT\' WHERE role = \'USER\'');
    console.log(`✅ Migrated ${result1} USERS to STUDENTS`);
    
    const result2 = await prisma.$executeRawUnsafe('UPDATE "User" SET role = \'CONTEST_MANAGER\' WHERE role = \'INSTRUCTOR\'');
    console.log(`✅ Migrated ${result2} INSTRUCTORS to CONTEST_MANAGERS`);
  } catch (error) {
    console.error('❌ Migration failed (User table may not exist yet or roles already migrated):', error.message);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
