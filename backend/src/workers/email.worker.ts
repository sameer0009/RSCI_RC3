import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import emailService from '../services/email.service';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true; // Reconnect on READONLY error
    }
    return false;
  },
  retryStrategy: (times) => {
    // Exponential backoff with a cap of 10 seconds
    const delay = Math.min(times * 100, 10000);
    return delay;
  },
});

connection.on('error', (error) => {
  console.error('Redis connection error in email worker:', error);
});

const worker = new Worker(
  'emailQueue',
  async (job: Job) => {
    const { to, subject, templateName, context } = job.data;
    console.log(`Processing email job ${job.id}: Sending to ${to}...`);
    await emailService.sendEmail(to, subject, templateName, context);
  },
  { connection }
);

worker.on('completed', (job: Job) => {
  console.log(`Email job ${job.id} completed successfully.`);
});

worker.on('failed', (job: Job | undefined, err: Error) => {
  console.error(`Email job ${job?.id} failed with error:`, err);
});

export default worker;
