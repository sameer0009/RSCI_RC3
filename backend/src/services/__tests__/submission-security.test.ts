import { SubmissionService } from '../submission.service';
import { SubmissionController } from '../../controllers/submission.controller';
import prisma from '../../config/database';
import { addSubmissionJob } from '../../queues/submission.queue';
jest.mock('../../index', () => ({ io: { to: jest.fn().mockReturnValue({ emit: jest.fn() }) } }));
jest.mock('../../queues/submission.queue', () => ({ addSubmissionJob: jest.fn(), submissionQueue: { getJob: jest.fn() } }));
jest.mock('../../config/database', () => ({ problem: { findUnique: jest.fn() }, submission: { findUnique: jest.fn(), create: jest.fn(), delete: jest.fn() }, contest: { findUnique: jest.fn() }, contestParticipant: { findUnique: jest.fn() }, testCase: { findMany: jest.fn() } }));
const service = new SubmissionService();
const data = { userId: 'me', problemId: 'p', code: 'print(42)', language: '71', contestId: 'c' };
beforeEach(() => { jest.resetAllMocks(); (prisma.problem.findUnique as jest.Mock).mockResolvedValue({ _count: { testCases: 1 }, maxSourceSize: 65536, allowedLanguages: [] }); });
test.each(['future', 'ended', 'foreign'])('rejects %s contest submission', async kind => {
  (prisma.contest.findUnique as jest.Mock).mockResolvedValue({ startTime: new Date(Date.now() + (kind === 'future' ? 60000 : -60000)), endTime: new Date(Date.now() + (kind === 'ended' ? -1 : 60000)), problems: [{ id: kind === 'foreign' ? 'other' : 'p' }] });
  await expect(service.createSubmission(data)).rejects.toThrow(); expect(prisma.submission.create).not.toHaveBeenCalled();
});
test('queue outage does not create an orphaned pending submission', async () => {
  (prisma.submission.create as jest.Mock).mockResolvedValue({ id: 's' }); (addSubmissionJob as jest.Mock).mockRejectedValue(new Error('offline'));
  await expect(service.createSubmission({ ...data, contestId: undefined })).rejects.toThrow('Grading is unavailable'); expect(prisma.submission.delete).toHaveBeenCalledWith({ where: { id: 's' } });
});
test('HTTP controller does not return another student source code', async () => {
  (prisma.submission.findUnique as jest.Mock).mockResolvedValue({ id: 's', userId: 'other', problemId: 'p', code: 'secret', testCaseResults: [] }); (prisma.testCase.findMany as jest.Mock).mockResolvedValue([]);
  const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  await new SubmissionController().getSubmission({ params: { id: 's' }, user: { id: 'me', role: 'STUDENT' } } as any, res);
  expect(res.status).toHaveBeenCalledWith(404); expect(JSON.stringify(res.json.mock.calls)).not.toContain('secret');
});
