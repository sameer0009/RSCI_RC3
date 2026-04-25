import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import contestService from '../services/contest.service';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const contestQueue = new Queue('contestQueue', { connection });

// Add repeatable job to run every minute to check for contest statuses
contestQueue.add(
  'updateStatuses',
  {},
  {
    repeat: {
      pattern: '* * * * *', // Every minute
    },
  }
);

const worker = new Worker(
  'contestQueue',
  async (job: Job) => {
    if (job.name === 'updateStatuses') {
      console.log('🔄 Running contest status update job...');
      await contestService.updateContestStatus();
    }
  },
  { connection }
);

worker.on('completed', (job: Job) => {
  if (job.name !== 'updateStatuses') {
    console.log(`Contest job ${job.id} completed successfully.`);
  }
});

worker.on('failed', (job: Job | undefined, err: Error) => {
  console.error(`Contest job ${job?.id} failed with error:`, err);
});

export default worker;
