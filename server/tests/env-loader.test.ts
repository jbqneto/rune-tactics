import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolve } from 'node:path';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { findRootEnvPath, parseAndApplyEnv, loadRootEnv } from '../src/config/env.js';
import { SessionTokenService, resolveSessionSecret, DEV_FALLBACK_SECRET } from '../src/auth/SessionTokenService.js';

describe('Root .env loader and session secret alignment', () => {
  const originalEnv = { ...process.env };
  let tempDir: string | null = null;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    if (tempDir) {
      try {
        rmSync(tempDir, { recursive: true, force: true });
      } catch {
        // ignore cleanup error
      }
      tempDir = null;
    }
  });

  describe('findRootEnvPath', () => {
    it('locates the root .env from server/src/config', () => {
      const srcConfigDir = resolve(__dirname, '../src/config');
      const found = findRootEnvPath(srcConfigDir);
      expect(found).not.toBeNull();
      expect(found).toMatch(/\.env$/);
      expect(found).toContain('rune-tactics');
    });

    it('locates the root .env from server/dist and server/dist/mcp simulation', () => {
      const distDir = resolve(__dirname, '../dist');
      const distMcpDir = resolve(__dirname, '../dist/mcp');

      const fromDist = findRootEnvPath(distDir);
      const fromDistMcp = findRootEnvPath(distMcpDir);

      expect(fromDist).not.toBeNull();
      expect(fromDistMcp).not.toBeNull();
      expect(fromDist).toBe(fromDistMcp);
    });

    it('respects RUNE_TACTICS_ENV_PATH override when set', () => {
      tempDir = mkdtempSync(resolve(tmpdir(), 'rt-test-env-'));
      const customEnvPath = resolve(tempDir, 'custom.env');
      writeFileSync(customEnvPath, 'PVP_SESSION_SECRET=custom-override-secret\n');

      process.env.RUNE_TACTICS_ENV_PATH = customEnvPath;
      const found = findRootEnvPath('/completely/unrelated/path');
      expect(found).toBe(customEnvPath);
    });
  });

  describe('parseAndApplyEnv', () => {
    it('parses assignments, strips quotes, and ignores comments', () => {
      tempDir = mkdtempSync(resolve(tmpdir(), 'rt-test-parse-'));
      const fakeEnvPath = resolve(tempDir, '.env');
      writeFileSync(
        fakeEnvPath,
        [
          '# Top level comment',
          'TEST_VAR_PLAIN=hello_world',
          'TEST_VAR_QUOTED="quoted with spaces"',
          "TEST_VAR_SINGLE='single quoted'",
          'TEST_VAR_COMMENTED=unquoted_val # trailing comment',
          '# Empty lines and invalid lines below',
          '',
          '   ',
          'INVALID LINE WITHOUT EQUALS',
        ].join('\n')
      );

      delete process.env.TEST_VAR_PLAIN;
      delete process.env.TEST_VAR_QUOTED;
      delete process.env.TEST_VAR_SINGLE;
      delete process.env.TEST_VAR_COMMENTED;

      const applied = parseAndApplyEnv(fakeEnvPath);

      expect(applied.TEST_VAR_PLAIN).toBe('hello_world');
      expect(applied.TEST_VAR_QUOTED).toBe('quoted with spaces');
      expect(applied.TEST_VAR_SINGLE).toBe('single quoted');
      expect(applied.TEST_VAR_COMMENTED).toBe('unquoted_val');

      expect(process.env.TEST_VAR_PLAIN).toBe('hello_world');
      expect(process.env.TEST_VAR_QUOTED).toBe('quoted with spaces');
      expect(process.env.TEST_VAR_SINGLE).toBe('single quoted');
      expect(process.env.TEST_VAR_COMMENTED).toBe('unquoted_val');
    });

    it('preserves existing process.env variables (host precedence)', () => {
      tempDir = mkdtempSync(resolve(tmpdir(), 'rt-test-precedence-'));
      const fakeEnvPath = resolve(tempDir, '.env');
      writeFileSync(fakeEnvPath, 'EXISTING_HOST_VAR=file_value\nNEW_FILE_VAR=file_value2\n');

      process.env.EXISTING_HOST_VAR = 'host_original';
      delete process.env.NEW_FILE_VAR;

      parseAndApplyEnv(fakeEnvPath, false);

      expect(process.env.EXISTING_HOST_VAR).toBe('host_original');
      expect(process.env.NEW_FILE_VAR).toBe('file_value2');
    });
  });

  describe('loadRootEnv', () => {
    it('returns loaded true when root .env exists', () => {
      const res = loadRootEnv();
      expect(res.loaded).toBe(true);
      expect(res.path).not.toBeNull();
    });

    it('handles non-existent env paths without throwing', () => {
      const res = loadRootEnv({ path: '/non/existent/path/.env', force: true });
      expect(res.loaded).toBe(false);
      expect(res.path).toBeNull();
    });
  });

  describe('MCP and Colyseus backend token verification with shared secret', () => {
    const TEST_SECRET = 'shared-test-secret-colyseus-mcp-98765';

    it('authenticates MCP agent token against Colyseus backend when PVP_SESSION_SECRET matches', () => {
      // Simulate both processes having PVP_SESSION_SECRET loaded from root .env
      process.env.PVP_SESSION_SECRET = TEST_SECRET;

      // Colyseus backend session service
      const backendAuth = new SessionTokenService();

      // MCP client session service (constructed in separate module/process)
      const mcpAuth = new SessionTokenService();

      // MCP signs token for agent
      const session = mcpAuth.createSession('Nexus-Agent-1', 'mcp-agent');
      expect(session.actorType).toBe('mcp-agent');
      expect(session.displayName).toBe('Nexus-Agent-1');

      // Colyseus backend verifies token
      const verified = backendAuth.verifyToken(session.sessionToken);
      expect(verified).not.toBeNull();
      expect(verified?.actorId).toBe(session.actorId);
      expect(verified?.displayName).toBe('Nexus-Agent-1');
      expect(verified?.actorType).toBe('mcp-agent');
    });

    it('fails verification with null (triggering 401) if secrets do not match', () => {
      // Backend with one secret
      const backendAuth = new SessionTokenService('backend-secret-A');

      // MCP with a different secret (e.g. before fix when each used randomUUID())
      const mcpAuth = new SessionTokenService('mcp-secret-B');

      const session = mcpAuth.createSession('Nexus-Agent-1', 'mcp-agent');
      const verified = backendAuth.verifyToken(session.sessionToken);

      // Must be null, which Colyseus translates to 401 Unauthorized
      expect(verified).toBeNull();
    });

    it('preserves development fallback when PVP_SESSION_SECRET is unset in dev', () => {
      delete process.env.PVP_SESSION_SECRET;
      process.env.NODE_ENV = 'development';
      delete process.env.ENVIRONMENT;

      const secret = resolveSessionSecret();
      expect(secret).toBe(DEV_FALLBACK_SECRET);

      // Both instances without secret get the same dev fallback secret
      const backendAuth = new SessionTokenService();
      const mcpAuth = new SessionTokenService();
      const session = mcpAuth.createSession('Dev-Agent', 'mcp-agent');
      expect(backendAuth.verifyToken(session.sessionToken)).not.toBeNull();
    });

    it('throws clear validation error in production if PVP_SESSION_SECRET is missing', () => {
      delete process.env.PVP_SESSION_SECRET;
      process.env.NODE_ENV = 'production';

      expect(() => resolveSessionSecret()).toThrow(
        /PVP_SESSION_SECRET must be configured in production environment/
      );
      expect(() => new SessionTokenService()).toThrow(
        /PVP_SESSION_SECRET must be configured in production environment/
      );
    });

    it('accepts explicit secret argument even in production', () => {
      delete process.env.PVP_SESSION_SECRET;
      process.env.NODE_ENV = 'production';

      const explicit = resolveSessionSecret('production-passed-secret');
      expect(explicit).toBe('production-passed-secret');
      expect(() => new SessionTokenService('explicit-secret')).not.toThrow();
    });
  });
});
