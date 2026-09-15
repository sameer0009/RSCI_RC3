import { EnhancedJudgeService } from '../enhancedJudge.service';
import prisma from '../../config/database';
jest.mock('../../config/database', () => ({ problem: { findUnique: jest.fn() }, $transaction: jest.fn() }));
const judge = new EnhancedJudgeService();
const testCase = (id: string, visibility = 'HIDDEN', points = 10) => ({ id, visibility, points, input: '', expectedOutput: '42', groupId: null });
const problem = (testCases: any[]) => ({ testCases, testCaseGroups: [], timeLimit: 2000, memoryLimit: 256, problemType: 'STANDARD', validationStrategy: 'EXACT_MATCH', enablePartialScoring: false });
const tx = { testCaseResult: { deleteMany: jest.fn(), createMany: jest.fn() }, submission: { update: jest.fn() } };
beforeEach(() => { jest.clearAllMocks(); (prisma.$transaction as jest.Mock).mockImplementation(fn => fn(tx)); });
test.each([
  ['1  2\n3', '1\t2 3', 'TOKEN_BASED', true],
  ['1garbage', '1', 'FLOATING_POINT', false],
  ['Infinity', '1', 'FLOATING_POINT', false],
  ['1.0000001', '1', 'FLOATING_POINT', true],
  ['', '', 'EXACT_MATCH', true],
  ['42', '43', 'EXACT_MATCH', false],
])('comparison %s vs %s (%s)', (actual, expected, strategy, correct) => expect(judge.compareOutput(actual as string, expected as string, strategy as string)).toBe(correct));
test('empty scoring suite cannot accept a solution', async () => {
  (prisma.problem.findUnique as jest.Mock).mockResolvedValue(problem([]));
  await expect(judge.evaluateSubmission('s', 'code', 'python', 'p')).rejects.toThrow('No scoring test cases');
});
test('stress cases are excluded; hidden stderr is not persisted', async () => {
  (prisma.problem.findUnique as jest.Mock).mockResolvedValue(problem([testCase('h'), testCase('stress', 'STRESS')]));
  jest.spyOn(judge, 'executeCode').mockResolvedValue({ stdout: '42', stderr: 'secret input', compile_output: null, status: { id: 3, description: 'Accepted' }, time: '0.1', memory: 10 });
  const result = await judge.evaluateSubmission('s', 'code', 'python', 'p');
  expect(result.totalTestCases).toBe(1); expect(result.score).toBe(100); expect(judge.executeCode).toHaveBeenCalledTimes(1);
  expect(tx.testCaseResult.createMany.mock.calls[0][0].data[0].errorMessage).toBeUndefined();
});
test('judge outage propagates without persisting a student failure', async () => {
  (prisma.problem.findUnique as jest.Mock).mockResolvedValue(problem([testCase('h')]));
  jest.spyOn(judge, 'executeCode').mockRejectedValue(new Error('unavailable'));
  await expect(judge.evaluateSubmission('s', 'code', 'python', 'p')).rejects.toThrow('unavailable'); expect(tx.submission.update).not.toHaveBeenCalled();
});
test('disabled partial scoring gives zero for an incomplete solution', async () => {
  (prisma.problem.findUnique as jest.Mock).mockResolvedValue(problem([testCase('a'), testCase('b')]));
  jest.spyOn(judge, 'executeCode').mockResolvedValueOnce({ stdout: '42', stderr: null, compile_output: null, status: { id: 3, description: '' }, time: '0', memory: 0 }).mockResolvedValueOnce({ stdout: '0', stderr: null, compile_output: null, status: { id: 3, description: '' }, time: '0', memory: 0 });
  const result = await judge.evaluateSubmission('s', '', 'python', 'p'); expect(result.score).toBe(0); expect(result.testCasesPassed).toBe(1);
});
