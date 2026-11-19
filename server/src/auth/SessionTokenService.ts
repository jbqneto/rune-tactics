import '../config/env.js';
import { createHmac, randomInt, randomUUID, timingSafeEqual } from 'node:crypto';
import { PVP_INVITE_CODE_LENGTH } from '../../../src/config/gameConfig.js';

export type SessionActorType = 'human' | 'mcp-agent';
export interface SessionIdentity { actorId: string; displayName: string; actorType: SessionActorType; issuedAt: number; expiresAt: number }
export interface InviteRoom { roomId: string; phase: string; playersCount: number }
const INVITE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
export const DEV_FALLBACK_SECRET = 'rune-tactics-dev-fallback-secret-pvp-v6';

export function resolveSessionSecret(secret?: string): string {
  if (secret) return secret;
  if (process.env.PVP_SESSION_SECRET) return process.env.PVP_SESSION_SECRET;
  const isProduction = process.env.NODE_ENV === 'production' || process.env.ENVIRONMENT === 'production';
  if (isProduction) {
    throw new Error('[SessionTokenService] PVP_SESSION_SECRET must be configured in production environment.');
  }
  return DEV_FALLBACK_SECRET;
}

export class SessionTokenService {
  private readonly secret: string;
  private readonly roomsByInvite = new Map<string, InviteRoom>();
  constructor(secret?: string) { this.secret = resolveSessionSecret(secret); }

  createSession(displayName?: unknown, actorType?: unknown, now = Date.now()): { sessionToken: string; actorId: string; displayName: string; actorType: SessionActorType; expiresAt: number } {
    if (actorType !== undefined && actorType !== 'human' && actorType !== 'mcp-agent') throw new Error('Invalid actorType');
    const safeName = typeof displayName === 'string' ? displayName.trim().replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 20) : '';
    const identity: SessionIdentity = { actorId: randomUUID(), displayName: safeName.length >= 2 ? safeName : 'Commander', actorType: actorType ?? 'human', issuedAt: now, expiresAt: now + SESSION_TTL_MS };
    const payload = Buffer.from(JSON.stringify(identity)).toString('base64url');
    return { sessionToken: `${payload}.${this.sign(payload)}`, actorId: identity.actorId, displayName: identity.displayName, actorType: identity.actorType, expiresAt: identity.expiresAt };
  }

  verifyToken(token: unknown, now = Date.now()): SessionIdentity | null {
    if (typeof token !== 'string') return null;
    const [payload, signature, extra] = token.split('.');
    if (!payload || !signature || extra !== undefined) return null;
    const expected = Buffer.from(this.sign(payload));
    const supplied = Buffer.from(signature);
    if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return null;
    try {
      const identity = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as SessionIdentity;
      if (typeof identity.actorId !== 'string' || typeof identity.displayName !== 'string' || (identity.actorType !== 'human' && identity.actorType !== 'mcp-agent') || !Number.isFinite(identity.expiresAt) || identity.expiresAt <= now) return null;
      return identity;
    } catch { return null; }
  }

  generateInviteCode(): string {
    let code: string;
    do { code = `RT-${Array.from({ length: PVP_INVITE_CODE_LENGTH }, () => INVITE_ALPHABET[randomInt(INVITE_ALPHABET.length)]).join('')}`; } while (this.roomsByInvite.has(code));
    return code;
  }

  registerRoom(inviteCode: string, room: InviteRoom): void { this.roomsByInvite.set(this.normalizeInviteCode(inviteCode), { ...room }); }
  updateRoom(inviteCode: string, updates: Partial<InviteRoom>): void {
    const code = this.normalizeInviteCode(inviteCode); const current = this.roomsByInvite.get(code);
    if (current) this.roomsByInvite.set(code, { ...current, ...updates });
  }
  lookupRoom(inviteCode: string): InviteRoom | null { return this.roomsByInvite.get(this.normalizeInviteCode(inviteCode)) ?? null; }
  removeRoom(inviteCode: string): void { this.roomsByInvite.delete(this.normalizeInviteCode(inviteCode)); }
  private normalizeInviteCode(code: string): string { return code.trim().toUpperCase(); }
  private sign(payload: string): string { return createHmac('sha256', this.secret).update(payload).digest('base64url'); }
}

export const sessionTokens = new SessionTokenService();
