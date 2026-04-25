import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const submission = await prisma.submission.findUnique({
    where: { id: '991002ba-a86c-4e07-aaa6-fdd9aff045e3' },
    include: {
      testCaseResults: true
    }
  });
  console.log(JSON.stringify(submission, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
