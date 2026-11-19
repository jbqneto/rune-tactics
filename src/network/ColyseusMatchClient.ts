import { Client, Room, getStateCallbacks } from '@colyseus/sdk';
import type {
  CommandEnvelope,
  CommandResult,
  LegalActionsSnapshot,
  ObservableMatchState,
  PlayerSeat,
  PvPHeroClass,
  PvPGameplayEvent,
  PvPRoomPhase,
} from '../shared/pvpTypes';

export const PVP_SESSION_STORAGE_KEY = 'rune_tactics_pvp_session';
export const PVP_RECONNECT_STORAGE_KEY = 'rune_tactics_pvp_reconnect';

export interface SessionData {
  sessionToken: string;
  actorId: string;
  displayName: string;
  actorType?: 'human' | 'mcp-agent';
  expiresAt: number;
}

export interface RoomMetaResponse {
  roomId: string;
  inviteCode: string;
  phase?: PvPRoomPhase;
  playersCount?: number;
}

export interface MatchInitPayload {
  mySeat: PlayerSeat;
  state: ObservableMatchState;
  legalActions: LegalActionsSnapshot;
}

export interface MatchEventsPayload {
  revision: number;
  events: PvPGameplayEvent[];
  state: ObservableMatchState;
}

export interface LobbySeatPayload {
  seat: PlayerSeat;
  connected: boolean;
  ready: boolean;
  selectedClasses: PvPHeroClass[];
  rematchRequested: boolean;
  displayName: string;
  actorType?: 'human' | 'mcp-agent' | string;
}

export interface LobbyStatePayload {
  phase: PvPRoomPhase;
  seats: {
    A: LobbySeatPayload;
    B: LobbySeatPayload;
  };
  startingTeam: string;
}

export function parseActorType(raw?: unknown): 'human' | 'mcp-agent' {
  return raw === 'mcp-agent' ? 'mcp-agent' : 'human';
}

/** Turns a failed /api/pvp/session response into a message a player can act on. */
export function describeSessionError(status: number, detail: string): string {
  if (status === 403) {
    return 'The PvP server rejected this page\'s address. Open the game from the same address as the server, or add this address to ALLOWED_ORIGINS on the server.';
  }
  if (status >= 500) {
    return `The PvP server is unavailable right now (error ${status}). Try again in a moment.`;
  }
  return `Failed to acquire PvP session (${status}): ${detail}`;
}

export function resolveServerUrl(): string {
  try {
    const envUrl = typeof import.meta !== 'undefined' && import.meta.env
      ? (import.meta.env.VITE_PVP_SERVER_URL as string | undefined)
      : undefined;

    if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
      return envUrl.trim();
    }
  } catch {
    // Ignore in non-vite / non-meta environments
  }

  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return window.location.origin;
  }

  return 'http://localhost:2567';
}

export function toHttpUrl(url: string): string {
  const normalized = url.trim().replace(/\/+$/, '');
  if (normalized.startsWith('ws://')) {
    return 'http://' + normalized.slice(5);
  }
  if (normalized.startsWith('wss://')) {
    return 'https://' + normalized.slice(6);
  }
  return normalized;
}

type Listener<T> = (data: T) => void;
type Unsubscribe = () => void;

export class ColyseusMatchClient {
  private readonly serverUrl: string;
  private readonly colyseusClient: Client;
  private room: Room<any> | null = null;

  private matchInitListeners: Set<Listener<MatchInitPayload>> = new Set();
  private matchEventsListeners: Set<Listener<MatchEventsPayload>> = new Set();
  private legalActionsListeners: Set<Listener<LegalActionsSnapshot>> = new Set();
  private commandResultListeners: Set<Listener<CommandResult>> = new Set();
  private roomPhaseListeners: Set<Listener<PvPRoomPhase>> = new Set();
  private lobbyStateListeners: Set<Listener<LobbyStatePayload>> = new Set();
  private stateChangeListeners: Set<Listener<any>> = new Set();
  private dropListeners: Set<Listener<number>> = new Set();
  private reconnectListeners: Set<() => void> = new Set();
  private leaveListeners: Set<Listener<number>> = new Set();
  private errorListeners: Set<(code: number, message?: string) => void> = new Set();

  constructor(serverUrl: string = resolveServerUrl()) {
    this.serverUrl = serverUrl;
    this.colyseusClient = new Client(serverUrl);
  }

  getServerUrl(): string {
    return this.serverUrl;
  }

  getColyseusClient(): Client {
    return this.colyseusClient;
  }

  getRoom(): Room<any> | null {
    return this.room;
  }

  getStoredSession(): SessionData | null {
    if (typeof sessionStorage === 'undefined') return null;
    try {
      const raw = sessionStorage.getItem(PVP_SESSION_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as SessionData;
      if (!parsed.sessionToken || !parsed.expiresAt) return null;
      if (Date.now() >= parsed.expiresAt - 60_000) {
        sessionStorage.removeItem(PVP_SESSION_STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  clearStoredSession(): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(PVP_SESSION_STORAGE_KEY);
    }
  }

  getStoredReconnectionToken(): string | null {
    if (typeof sessionStorage === 'undefined') return null;
    try {
      return sessionStorage.getItem(PVP_RECONNECT_STORAGE_KEY);
    } catch {
      return null;
    }
  }

  clearStoredReconnectionToken(): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(PVP_RECONNECT_STORAGE_KEY);
    }
  }

  async acquireSession(displayName?: string, actorType?: 'human' | 'mcp-agent'): Promise<SessionData> {
    const existing = this.getStoredSession();
    if (
      existing &&
      (!displayName || existing.displayName === displayName.trim()) &&
      (!actorType || (existing.actorType ?? 'human') === actorType)
    ) {
      return existing;
    }

    const httpUrl = toHttpUrl(this.serverUrl);
    const response = await fetch(`${httpUrl}/api/pvp/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        displayName: displayName?.trim() || undefined,
        actorType: actorType || undefined,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(describeSessionError(response.status, errText));
    }

    const sessionData = (await response.json()) as SessionData;
    if (typeof sessionStorage !== 'undefined') {
      try {
        sessionStorage.setItem(PVP_SESSION_STORAGE_KEY, JSON.stringify(sessionData));
      } catch (err) {
        console.warn('[ColyseusMatchClient] Unable to write session to sessionStorage:', err);
      }
    }
    return sessionData;
  }

  async createRoom(sessionToken: string): Promise<RoomMetaResponse> {
    const httpUrl = toHttpUrl(this.serverUrl);
    const response = await fetch(`${httpUrl}/api/pvp/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({ sessionToken }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`Failed to create PvP room (${response.status}): ${errText}`);
    }

    return (await response.json()) as RoomMetaResponse;
  }

  async lookupRoom(inviteCode: string, sessionToken: string): Promise<RoomMetaResponse> {
    const httpUrl = toHttpUrl(this.serverUrl);
    const normalized = inviteCode.trim().toUpperCase();
    const response = await fetch(`${httpUrl}/api/pvp/rooms/${encodeURIComponent(normalized)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`Failed to find PvP room with code ${normalized} (${response.status}): ${errText}`);
    }

    return (await response.json()) as RoomMetaResponse;
  }

  async joinRoom(roomId: string, sessionToken: string, inviteCode?: string): Promise<Room<any>> {
    const room = await this.colyseusClient.joinById(roomId, {
      sessionToken,
      inviteCode: inviteCode?.trim().toUpperCase(),
    });

    this.bindRoom(room);
    return room;
  }

  async reconnect(reconnectionToken?: string): Promise<Room<any>> {
    const token = reconnectionToken ?? this.getStoredReconnectionToken();
    if (!token) {
      throw new Error('No reconnection token available in sessionStorage or arguments.');
    }

    try {
      const room = await this.colyseusClient.reconnect(token);
      this.bindRoom(room);
      return room;
    } catch (err) {
      this.clearStoredReconnectionToken();
      throw err;
    }
  }

  private bindRoom(room: Room<any>): void {
    this.room = room;

    if (room.reconnection) {
      room.reconnection.maxRetries = 10;
      room.reconnection.maxDelay = 5000;
    }

    if (room.reconnectionToken && typeof sessionStorage !== 'undefined') {
      try {
        sessionStorage.setItem(PVP_RECONNECT_STORAGE_KEY, room.reconnectionToken);
      } catch (err) {
        console.warn('[ColyseusMatchClient] Unable to store reconnection token:', err);
      }
    }

    room.onDrop((code) => {
      this.dropListeners.forEach((fn) => fn(code));
    });

    room.onReconnect(() => {
      if (room.reconnectionToken && typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(PVP_RECONNECT_STORAGE_KEY, room.reconnectionToken);
      }
      this.reconnectListeners.forEach((fn) => fn());
    });

    room.onLeave((code) => {
      this.clearStoredReconnectionToken();
      this.leaveListeners.forEach((fn) => fn(code));
    });

    room.onError((code, message) => {
      this.errorListeners.forEach((fn) => fn(code, message));
    });

    // Colyseus 0.18 state callbacks registration
    try {
      getStateCallbacks(room);
    } catch (err) {
      console.warn('[ColyseusMatchClient] getStateCallbacks warning:', err);
    }

    room.onStateChange((state) => {
      this.stateChangeListeners.forEach((fn) => fn(state));
    });

    // Message bindings
    room.onMessage('matchInit', (data: MatchInitPayload) => {
      this.matchInitListeners.forEach((fn) => fn(data));
    });

    room.onMessage('matchEvents', (data: MatchEventsPayload) => {
      this.matchEventsListeners.forEach((fn) => fn(data));
    });

    room.onMessage('legalActions', (data: LegalActionsSnapshot) => {
      this.legalActionsListeners.forEach((fn) => fn(data));
    });

    room.onMessage('commandResult', (data: CommandResult) => {
      this.commandResultListeners.forEach((fn) => fn(data));
    });

    room.onMessage('roomPhase', (data: PvPRoomPhase) => {
      this.roomPhaseListeners.forEach((fn) => fn(data));
    });

    room.onMessage('lobbyState', (data: any) => {
      if (data && data.seats) {
        const normalized: LobbyStatePayload = {
          phase: data.phase,
          startingTeam: data.startingTeam,
          seats: {
            A: {
              ...data.seats.A,
              actorType: parseActorType(data.seats.A?.actorType),
            },
            B: {
              ...data.seats.B,
              actorType: parseActorType(data.seats.B?.actorType),
            },
          },
        };
        this.lobbyStateListeners.forEach((fn) => fn(normalized));
      }
    });
  }

  getSeatActorType(seat: PlayerSeat): 'human' | 'mcp-agent' {
    if (!this.room || !this.room.state || !this.room.state.seats) return 'human';
    const seatObj = this.room.state.seats[seat] ?? this.room.state.seats.get?.(seat);
    return parseActorType(seatObj?.actorType);
  }

  sendCommand(envelope: CommandEnvelope): void {
    if (!this.room) {
      throw new Error('Cannot send command: not connected to a room.');
    }
    this.room.send('command', envelope);
  }

  selectClasses(classes: PvPHeroClass[]): void {
    if (!this.room) {
      throw new Error('Cannot select classes: not connected to a room.');
    }
    this.room.send('selectClasses', classes);
  }

  setReady(ready: boolean): void {
    if (!this.room) {
      throw new Error('Cannot set ready: not connected to a room.');
    }
    this.room.send('setReady', ready);
  }

  requestRematch(): void {
    if (!this.room) {
      throw new Error('Cannot request rematch: not connected to a room.');
    }
    this.room.send('requestRematch', {});
  }

  cancelRematch(): void {
    if (!this.room) {
      throw new Error('Cannot cancel rematch: not connected to a room.');
    }
    this.room.send('cancelRematch', {});
  }

  forfeit(): void {
    if (!this.room) {
      throw new Error('Cannot forfeit: not connected to a room.');
    }
    this.room.send('forfeit', {});
  }

  leave(): void {
    if (this.room) {
      this.clearStoredReconnectionToken();
      this.room.leave();
      this.room = null;
    }
  }

  onMatchInit(callback: Listener<MatchInitPayload>): Unsubscribe {
    this.matchInitListeners.add(callback);
    return () => this.matchInitListeners.delete(callback);
  }

  onMatchEvents(callback: Listener<MatchEventsPayload>): Unsubscribe {
    this.matchEventsListeners.add(callback);
    return () => this.matchEventsListeners.delete(callback);
  }

  onLegalActions(callback: Listener<LegalActionsSnapshot>): Unsubscribe {
    this.legalActionsListeners.add(callback);
    return () => this.legalActionsListeners.delete(callback);
  }

  onCommandResult(callback: Listener<CommandResult>): Unsubscribe {
    this.commandResultListeners.add(callback);
    return () => this.commandResultListeners.delete(callback);
  }

  onRoomPhase(callback: Listener<PvPRoomPhase>): Unsubscribe {
    this.roomPhaseListeners.add(callback);
    return () => this.roomPhaseListeners.delete(callback);
  }

  onLobbyState(callback: Listener<LobbyStatePayload>): Unsubscribe {
    this.lobbyStateListeners.add(callback);
    return () => this.lobbyStateListeners.delete(callback);
  }

  onRoomStateChange(callback: Listener<any>): Unsubscribe {
    this.stateChangeListeners.add(callback);
    return () => this.stateChangeListeners.delete(callback);
  }

  onDrop(callback: Listener<number>): Unsubscribe {
    this.dropListeners.add(callback);
    return () => this.dropListeners.delete(callback);
  }

  onReconnect(callback: () => void): Unsubscribe {
    this.reconnectListeners.add(callback);
    return () => this.reconnectListeners.delete(callback);
  }

  onLeave(callback: Listener<number>): Unsubscribe {
    this.leaveListeners.add(callback);
    return () => this.leaveListeners.delete(callback);
  }

  onError(callback: (code: number, message?: string) => void): Unsubscribe {
    this.errorListeners.add(callback);
    return () => this.errorListeners.delete(callback);
  }
}
