import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
  connectTimeout: 5000,
});

export const submissionQueue = new Queue('submissionQueue', { connection });

export const addSubmissionJob = async (submissionId: string) => {
  await submissionQueue.add('evaluate', { submissionId }, {
    jobId: submissionId,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  });
};
