import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import submissionService from '../services/submission.service';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  'submissionQueue',
  async (job: Job) => {
    const { submissionId } = job.data;
    console.log(`Processing submission job ${job.id} for submission ${submissionId}...`);
    await submissionService.evaluateSubmission(submissionId);
  },
  { connection }
);

worker.on('completed', (job: Job) => {
  console.log(`Submission job ${job.id} completed successfully.`);
});

worker.on('failed', (job: Job | undefined, err: Error) => {
  console.error(`Submission job ${job?.id} failed with error:`, err);
});

export default worker;
