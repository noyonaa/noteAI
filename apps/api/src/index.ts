import fs from 'node:fs';
import { createApp } from './app';
import { loadConfig } from './config/env';
import { openDatabase } from './db/connection';
import { runMigrations } from './db/migrate';

const config = loadConfig();
fs.mkdirSync(config.filesDir, { recursive: true });
const db = openDatabase(config.databasePath);
const applied = runMigrations(db);
if (applied.length) console.log(`Applied migrations: ${applied.join(', ')}`);

const app = createApp(db, config);
app.listen(config.port, config.host, () => {
  console.log(`Nayanote API listening on http://${config.host}:${config.port}`);
});
