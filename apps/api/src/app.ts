import cors from 'cors';
import express from 'express';
import type { Config } from './config/env';
import type { Db } from './db/connection';
import { errorHandler, notFound } from './middleware/error';
import { healthRouter } from './routes/health';

export function createApp(db: Db, config: Pick<Config, 'webOrigin'>) {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({ origin: config.webOrigin }));
  app.use(express.json({ limit: '1mb' }));

  app.use('/api/health', healthRouter(db));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
