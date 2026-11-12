import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

function resolveFromRoot(p: string): string {
  return path.isAbsolute(p) ? p : path.resolve(root, p);
}

export interface Config {
  port: number;
  host: string;
  webOrigin: string;
  databasePath: string;
  filesDir: string;
}

/** Reads configuration from the environment. Paths resolve from the repo root, not the cwd. */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return {
    port: Number(env.API_PORT ?? 4000),
    host: env.API_HOST ?? '127.0.0.1',
    webOrigin: env.WEB_ORIGIN ?? 'http://localhost:5173',
    databasePath: resolveFromRoot(env.DATABASE_PATH ?? './data/nayanote.db'),
    filesDir: resolveFromRoot(env.FILES_DIR ?? './data/files'),
  };
}
