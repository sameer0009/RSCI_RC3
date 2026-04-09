const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function check() {
  const email = 'admin@example.com';
  const pass = 'admin123';
  
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log('❌ User not found');
    const all = await prisma.user.findMany({ select: { email: true } });
    console.log('Existing emails:', all.map(u => u.email));
    return;
  }

  console.log('✅ User found:', user.email);
  const isValid = await bcrypt.compare(pass, user.passwordHash);
  console.log('🔑 Password valid:', isValid);
  if (!isValid) {
    console.log('Current hash:', user.passwordHash);
    const newHash = await bcrypt.hash(pass, 10);
    console.log('Re-hashed password (for comparison):', newHash);
  }
}

check().finally(() => prisma.$disconnect());
