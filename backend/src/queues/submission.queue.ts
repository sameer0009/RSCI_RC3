import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const submissionQueue = new Queue('submissionQueue', { connection });

export const addSubmissionJob = async (submissionId: string) => {
  await submissionQueue.add('evaluate', { submissionId }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  });
};
