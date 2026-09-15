import { authenticateSocket, configureSockets } from '../socket';
import prisma from '../../config/database';
import authService from '../../services/auth.service';
jest.mock('../../config/database', () => ({ user: { findUnique: jest.fn() }, submission: { findUnique: jest.fn() } }));
jest.mock('../../services/auth.service', () => ({ __esModule: true, default: { verifyAccessToken: jest.fn() } }));
beforeEach(() => jest.resetAllMocks());
test('anonymous sockets are rejected', async () => {
 const next = jest.fn(); await authenticateSocket({ handshake: { headers: {}, auth: {} }, data: {} } as any, next); expect(next).toHaveBeenCalledWith(expect.any(Error));
});
test('valid cookie uses current database identity', async () => {
 (authService.verifyAccessToken as jest.Mock).mockReturnValue({ id: 'me' }); (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'me', role: 'STUDENT' });
 const socket: any = { handshake: { headers: { cookie: 'accessToken=valid' }, auth: {} }, data: {} }, next = jest.fn(); await authenticateSocket(socket, next); expect(socket.data.user.id).toBe('me'); expect(next).toHaveBeenCalledWith();
});
test('socket cannot subscribe to foreign submissions or arbitrary rooms', async () => {
 const handlers: Record<string, any> = {}; const socket: any = { data: { user: { id: 'me', role: 'STUDENT' } }, join: jest.fn(), on: (event: string, fn: any) => { handlers[event] = fn; } };
 configureSockets({ use: jest.fn(), on: (_event: string, fn: any) => fn(socket) } as any);
 (prisma.submission.findUnique as jest.Mock).mockResolvedValue({ userId: 'other' }); await handlers.subscribeToSubmission('secret');
 expect(socket.join).toHaveBeenCalledTimes(1); expect(socket.join).toHaveBeenCalledWith('me'); expect(handlers.join).toBeUndefined();
});
