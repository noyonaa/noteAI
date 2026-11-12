import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from './app';
import { openDatabase } from './db/connection';
import { runMigrations } from './db/migrate';

function setup() {
  const db = openDatabase(':memory:');
  runMigrations(db);
  return { db, app: createApp(db, { webOrigin: 'http://localhost:5173' }) };
}

describe('migrations', () => {
  it('applies once and is idempotent', () => {
    const db = openDatabase(':memory:');
    expect(runMigrations(db)).toEqual(['001_init.sql']);
    expect(runMigrations(db)).toEqual([]);
  });

  it('lets a note be saved with only a title (no task fields forced)', () => {
    const { db } = setup();
    db.prepare("INSERT INTO resources (id, type, title) VALUES ('a','note','Idea')").run();
    const row = db.prepare('SELECT priority, deadline FROM resources WHERE id = ?').get('a') as any;
    expect(row.priority).toBeNull();
    expect(row.deadline).toBeNull();
  });

  it('rejects invalid resource types and blank titles at the DB level', () => {
    const { db } = setup();
    expect(() =>
      db.prepare("INSERT INTO resources (id, type, title) VALUES ('b','spaceship','x')").run(),
    ).toThrow();
    expect(() =>
      db.prepare("INSERT INTO resources (id, type, title) VALUES ('c','task','   ')").run(),
    ).toThrow();
  });

  it('cascades subtasks when a parent is deleted', () => {
    const { db } = setup();
    db.prepare("INSERT INTO resources (id, type, title) VALUES ('p','task','Parent')").run();
    db.prepare("INSERT INTO resources (id, type, title, parent_id) VALUES ('s','task','Sub','p')").run();
    db.prepare("DELETE FROM resources WHERE id = 'p'").run();
    expect(db.prepare('SELECT COUNT(*) AS n FROM resources').get()).toEqual({ n: 0 });
  });
});

describe('API', () => {
  it('reports health and that AI is optional', async () => {
    const { app } = setup();
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.ai.available).toBe(false);
  });

  it('returns structured JSON for unknown routes', async () => {
    const { app } = setup();
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('not_found');
  });
});
