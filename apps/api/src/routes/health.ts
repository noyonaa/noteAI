import { Router } from 'express';
import type { Db } from '../db/connection';

export function healthRouter(db: Db): Router {
  const router = Router();
  router.get('/', (_req, res) => {
    const row = db.prepare('SELECT COUNT(*) AS n FROM schema_migrations').get() as { n: number };
    res.json({
      status: 'ok',
      migrations: row.n,
      // AI is optional by design; Milestone 3 fills this in.
      ai: { available: false, reason: 'not_configured' },
    });
  });
  return router;
}
