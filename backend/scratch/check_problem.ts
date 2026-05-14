import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const id = 'dbed63a7-6674-4003-becc-552120ae5937';
  console.log(`Searching for problem with ID: ${id}`);
  
  const problem = await prisma.problem.findUnique({
    where: { id },
    select: { id: true, title: true, slug: true, status: true }
  });
  
  if (problem) {
    console.log('Problem found:');
    console.log(JSON.stringify(problem, null, 2));
  } else {
    console.log('Problem NOT found in database.');
    
    // Search all problems to see what's there
    const allProblems = await prisma.problem.findMany({
      select: { id: true, title: true, slug: true }
    });
    console.log('Available problems:');
    console.log(JSON.stringify(allProblems, null, 2));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
