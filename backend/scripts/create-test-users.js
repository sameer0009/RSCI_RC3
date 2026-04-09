const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Creating test users...');

  // Create admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      username: 'admin',
      passwordHash: adminPassword,
      role: 'ADMIN',
      fullName: 'Platform Admin',
    },
  });
  console.log('✅ Admin user ready: admin@example.com / admin123');

  // Create student
  const studentPassword = await bcrypt.hash('test123', 10);
  await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      email: 'student@example.com',
      username: 'student',
      passwordHash: studentPassword,
      role: 'STUDENT',
      fullName: 'Test Student',
    },
  });
  console.log('✅ Student user ready: student@example.com / test123');

  console.log('🎉 Done!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
