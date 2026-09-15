import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import passport from './config/passport';
import { testDatabaseConnection } from './config/database';
import { connectRedis } from './config/redis';
import './workers/email.worker'; // Import to start the worker
import './workers/submission.worker'; // Start the submission worker
import './workers/contest.worker'; // Start the contest worker
import { configureSockets } from './realtime/socket';
import { csrfProtection } from './middleware/security.middleware';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "http://localhost:5000", "https://*"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: ["'self'", "http://localhost:5000", "ws://localhost:5000"],
      },
    },
  })
);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(csrfProtection);
app.use(passport.initialize());

// Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

const submissionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 submissions per minute
  message: 'Slow down! You can only submit code 30 times per minute.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', generalLimiter);
app.use('/api/submissions', submissionLimiter);

configureSockets(io);

// Export io for services to use
export { io };

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Import routes
import routes from './routes';

// Mount API routes
app.use('/api', routes);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Root redirect to documentation
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

import { errorHandler } from './middleware/error.middleware';
app.use(errorHandler);

// Initialize connections and start server
async function startServer() {
  try {
    // Test database connection
    if (!await testDatabaseConnection()) throw new Error('Database is unavailable');

    // Connect to Redis
    await connectRedis();

    // Start server
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 API available at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
