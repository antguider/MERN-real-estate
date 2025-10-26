import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import middleware
import {
  limiter,
  securityMiddleware,
  compressionMiddleware,
  loggingMiddleware,
  errorHandler,
  notFound,
} from './middleware/index.js';

// Import routes
import authRoute from './routes/auth.route.js';
import userRoute from './routes/user.route.js';
import propertyRoute from './routes/property.route.js';
import postRoute from './routes/post.route.js';

// Import utilities
import logger from './lib/logger.js';

// Load environment variables
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(securityMiddleware);

// Rate limiting
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Compression middleware
app.use(compressionMiddleware);

// Logging middleware
app.use(loggingMiddleware);

// Static files
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes
app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/properties', propertyRoute);
app.use('/api/posts', postRoute);

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    message: 'API Documentation',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      properties: '/api/properties',
      posts: '/api/posts',
    },
    documentation: 'Swagger UI will be available at /api/docs/swagger',
  });
});

// 404 handler
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Unhandled promise rejection
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Uncaught exception
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

const PORT = process.env.PORT || 8800;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});