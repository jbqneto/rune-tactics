import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

export interface LoadEnvResult {
  path: string | null;
  loaded: boolean;
  error?: Error;
}

let cachedEnvPath: string | null = null;
let envLoaded = false;

function isRepoRoot(dir: string): boolean {
  const pkgPath = resolve(dir, 'package.json');
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      if (pkg.name === 'rune-tactics') return true;
    } catch {
      // ignore JSON parse error
    }
  }
  return existsSync(resolve(dir, 'server')) && existsSync(resolve(dir, 'src'));
}

/**
 * Searches upward from a starting directory to find the repository root .env file.
 * Evaluates module location, cwd, and standard directory offsets.
 */
export function findRootEnvPath(startDir?: string): string | null {
  // 1. Explicit override via environment variables
  if (process.env.RUNE_TACTICS_ENV_PATH && existsSync(process.env.RUNE_TACTICS_ENV_PATH)) {
    return resolve(process.env.RUNE_TACTICS_ENV_PATH);
  }
  if (process.env.DOTENV_CONFIG_PATH && existsSync(process.env.DOTENV_CONFIG_PATH)) {
    return resolve(process.env.DOTENV_CONFIG_PATH);
  }

  // 2. Upward traversal from current module location
  try {
    let dir = startDir ?? dirname(fileURLToPath(import.meta.url));
    while (dir && dir !== dirname(dir)) {
      const candidate = resolve(dir, '.env');
      if (existsSync(candidate) && isRepoRoot(dir)) {
        return candidate;
      }
      dir = dirname(dir);
    }
  } catch {
    // ignore URL/path resolution errors
  }

  // 3. Upward traversal from process.cwd()
  try {
    let cwdDir = process.cwd();
    while (cwdDir && cwdDir !== dirname(cwdDir)) {
      const candidate = resolve(cwdDir, '.env');
      if (existsSync(candidate) && isRepoRoot(cwdDir)) {
        return candidate;
      }
      cwdDir = dirname(cwdDir);
    }
  } catch {
    // ignore
  }

  // 4. Fallback relative candidates based on known build/source layout
  try {
    const moduleDir = dirname(fileURLToPath(import.meta.url));
    const fallbackCandidates = [
      resolve(moduleDir, '../../.env'),       // from server/src or server/dist
      resolve(moduleDir, '../../../.env'),    // from server/src/config or server/dist/mcp
      resolve(process.cwd(), '.env'),
      resolve(process.cwd(), '../.env'),
    ];
    for (const candidate of fallbackCandidates) {
      if (existsSync(candidate)) {
        return candidate;
      }
    }
  } catch {
    // ignore
  }

  return null;
}

/**
 * Pure parser fallback for .env format.
 * Preserves existing process.env variables unless override is true.
 */
export function parseAndApplyEnv(filePath: string, override = false): Record<string, string> {
  const applied: Record<string, string> = {};
  if (!existsSync(filePath)) return applied;

  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const match = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;

    const key = match[1];
    let val = match[2].trim();

    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      const quote = val[0];
      val = val.slice(1, -1);
      if (quote === '"') {
        val = val.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t');
      }
    } else {
      const commentIdx = val.indexOf('#');
      if (commentIdx > 0) {
        val = val.slice(0, commentIdx).trim();
      }
    }

    if (override || process.env[key] === undefined) {
      process.env[key] = val;
      applied[key] = val;
    }
  }

  return applied;
}

/**
 * Automatically loads the repository root .env file.
 * Existing host environment variables take precedence unless override: true.
 * Safe to call multiple times (cached).
 */
export function loadRootEnv(options: { override?: boolean; force?: boolean; path?: string } = {}): LoadEnvResult {
  if (envLoaded && !options.force && !options.override && !options.path) {
    return { path: cachedEnvPath, loaded: cachedEnvPath !== null };
  }

  const envPath = options.path ?? findRootEnvPath();
  if (!envPath || !existsSync(envPath)) {
    if (options.force) {
      cachedEnvPath = null;
      envLoaded = true;
    }
    return { path: null, loaded: false };
  }

  try {
    const dotenvResult = dotenv.config({ path: envPath, override: options.override ?? false });
    if (!dotenvResult.error) {
      cachedEnvPath = envPath;
      envLoaded = true;
      return { path: envPath, loaded: true };
    }

    if (!options.override && typeof process.loadEnvFile === 'function') {
      try {
        process.loadEnvFile(envPath);
        cachedEnvPath = envPath;
        envLoaded = true;
        return { path: envPath, loaded: true };
      } catch {
        // Fall back to built-in parser
      }
    }

    parseAndApplyEnv(envPath, options.override ?? false);
    cachedEnvPath = envPath;
    envLoaded = true;
    return { path: envPath, loaded: true };
  } catch (error) {
    return {
      path: envPath,
      loaded: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

export function getLoadedEnvPath(): string | null {
  return cachedEnvPath;
}

// Auto-load on module evaluation
loadRootEnv();
