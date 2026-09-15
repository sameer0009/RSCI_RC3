import { ownsResource, classroomAccess, readableProblem } from '../access.middleware';
import prisma from '../../config/database';
jest.mock('../../config/database', () => ({ problem: { findUnique: jest.fn(), findFirst: jest.fn() }, classroom: { findUnique: jest.fn() }, classroomMember: { findUnique: jest.fn() } }));
const res = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn() } as any);
beforeEach(() => jest.resetAllMocks());
test('instructor cannot modify another author problem', async () => {
  (prisma.problem.findUnique as jest.Mock).mockResolvedValue({ createdBy: 'other' });
  const response = res(), next = jest.fn(); await ownsResource('problem')({ params: { id: 'p' }, user: { id: 'me', role: 'INSTRUCTOR' } } as any, response, next);
  expect(response.status).toHaveBeenCalledWith(403); expect(next).not.toHaveBeenCalled();
});
test('owner can manage own problem', async () => {
  (prisma.problem.findUnique as jest.Mock).mockResolvedValue({ createdBy: 'me' });
  const next = jest.fn(); await ownsResource('problem')({ params: { id: 'p' }, user: { id: 'me', role: 'INSTRUCTOR' } } as any, res(), next); expect(next).toHaveBeenCalledWith();
});
test('nonmember cannot inspect a classroom', async () => {
  (prisma.classroom.findUnique as jest.Mock).mockResolvedValue({ instructorId: 'teacher' });
  (prisma.classroomMember.findUnique as jest.Mock).mockResolvedValue(null);
  const response = res(); await classroomAccess()({ params: { id: 'class' }, user: { id: 'stranger', role: 'STUDENT' } } as any, response, jest.fn()); expect(response.status).toHaveBeenCalledWith(403);
});
test('student member cannot inspect instructor analytics', async () => {
  (prisma.classroom.findUnique as jest.Mock).mockResolvedValue({ instructorId: 'teacher' });
  (prisma.classroomMember.findUnique as jest.Mock).mockResolvedValue({ id: 'membership' });
  const response = res(); await classroomAccess(false, true)({ params: { id: 'class' }, user: { id: 'student', role: 'STUDENT' } } as any, response, jest.fn()); expect(response.status).toHaveBeenCalledWith(403);
});
test('unreadable problem fails before controller', async () => {
  (prisma.problem.findFirst as jest.Mock).mockResolvedValue(null);
  const response = res(); await readableProblem()({ params: { id: 'private' } } as any, response, jest.fn()); expect(response.status).toHaveBeenCalledWith(404);
});
