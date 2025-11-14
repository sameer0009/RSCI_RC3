import { exec } from 'child_process';
import { promisify } from 'util';
import * as readline from 'readline';

const execAsync = promisify(exec);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function resetDatabase() {
  console.log('⚠️  WARNING: This will delete all data in the database!');
  
  const answer = await question('Are you sure you want to continue? (yes/no): ');
  
  if (answer.toLowerCase() !== 'yes') {
    console.log('❌ Database reset cancelled');
    rl.close();
    return;
  }

  try {
    console.log('🗑️  Resetting database...');
    
    // Reset database
    await execAsync('npx prisma migrate reset --force');
    
    console.log('✅ Database reset completed');
    console.log('💡 Run "npm run prisma:seed" to populate with sample data');
  } catch (error: any) {
    console.error('❌ Database reset failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

resetDatabase();
