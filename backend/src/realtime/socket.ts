import jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import authService from '../services/auth.service';
import prisma from '../config/database';

export async function authenticateSocket(socket: Socket, next: (error?: Error) => void) {
  try {
    const cookies = Object.fromEntries((socket.handshake.headers.cookie || '').split(';').filter(Boolean).map(part => {
      const index = part.indexOf('=');
      return [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1))];
    }));
    const token = cookies.accessToken || socket.handshake.auth?.token;
    if (typeof token !== 'string') throw new Error('Missing token');
    const payload = authService.verifyAccessToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.id }, select: { id: true, role: true } });
    if (!user) throw new Error('Unknown user');
    socket.data.user = user;
    socket.data.expiresAt = (jwt.decode(token) as jwt.JwtPayload | null)?.exp;
    next();
  } catch { next(new Error('Authentication required')); }
}

export function configureSockets(io: Server) {
  io.use(authenticateSocket);
  io.on('connection', socket => {
    socket.join(socket.data.user.id);
    const expiresAt = socket.data.expiresAt;
    if (typeof expiresAt === 'number') {
      const timer = setTimeout(() => socket.disconnect(true), Math.max(0, expiresAt * 1000 - Date.now()));
      socket.on('disconnect', () => clearTimeout(timer));
    }
    // Recheck ownership for every subscription; never accept arbitrary room names.
    socket.on('subscribeToSubmission', async (id: unknown) => {
      if (typeof id !== 'string' || id.length > 100) return;
      try {
        const submission = await prisma.submission.findUnique({ where: { id }, select: { userId: true } });
        if (submission && (submission.userId === socket.data.user.id || socket.data.user.role === 'ADMIN')) await socket.join(id);
      } catch { socket.emit('subscriptionError', { message: 'Unable to subscribe' }); }
    });
  });
}
