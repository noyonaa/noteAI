import { loadConfig } from '../config/env';
import { openDatabase } from './connection';
import { runMigrations } from './migrate';

const config = loadConfig();
const db = openDatabase(config.databasePath);
const ran = runMigrations(db);
console.log(ran.length ? `Applied: ${ran.join(', ')}` : 'Database is up to date.');
db.close();
