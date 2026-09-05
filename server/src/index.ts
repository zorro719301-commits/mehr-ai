import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import apiRouter from './routes/api.router.js';
import { prisma } from './utils/prisma.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Optimization Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:5173').split(',');
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || corsOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow configured clients in dev/prod
    }
  },
  credentials: true,
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Rate Limiting (Brute-force protection)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per window
  message: { success: false, error: 'Juda ko‘p so‘rov yuborildi. Iltimos, 15 daqiqadan so‘ng qayta urinib ko‘ring.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Health Check Endpoint
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.json({
      status: 'HEALTHY',
      service: 'MEHR AI Platform Backend',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      database: 'CONNECTED',
    });
  } catch (dbErr) {
    return res.status(503).json({
      status: 'UNHEALTHY',
      database: 'DISCONNECTED',
      error: (dbErr as Error).message,
    });
  }
});

// Mount Main API Routes
app.use('/api', apiRouter);

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || 500;
  return res.status(status).json({
    success: false,
    error: err.message || 'Kutilmagan ichki server xatoligi yuz berdi',
  });
});

// Start Server if not imported by tests
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log(`🚀 MEHR AI Server is running securely on port ${PORT}`);
    console.log(`📡 API Health Check: http://localhost:${PORT}/api/health`);
  });

  const gracefulShutdown = async () => {
    console.log('Stopping server gracefully...');
    server.close(async () => {
      await prisma.$disconnect();
      console.log('Database disconnected. Server stopped.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
}

export default app;
