import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db';
import router from './routes';
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();
const PORT = process.env.PORT || 4000;

async function start() {
  await connectDB();
  const app = express();
  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*', credentials: true }));

  const limiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
    max: Number(process.env.RATE_LIMIT_MAX) || 100,
  });
  app.use(limiter);

  app.use('/uploads', express.static(process.env.UPLOAD_DIR || 'uploads'));

  app.use('/api', router);

  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
