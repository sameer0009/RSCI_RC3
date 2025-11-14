import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runMigrations() {
  console.log('🔄 Running database migrations...');

  try {
    // Generate Prisma Client
    console.log('📦 Generating Prisma Client...');
    await execAsync('npx prisma generate');
    console.log('✅ Prisma Client generated');

    // Run migrations
    console.log('🗄️  Applying migrations...');
    const { stdout, stderr } = await execAsync('npx prisma migrate deploy');
    
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);

    console.log('✅ Migrations completed successfully');
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigrations();
