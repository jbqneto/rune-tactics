# Rune Tactics V5 — MatchService Design (`src/game/pvp/MatchService.ts`)

## 1. Purpose

`MatchService` is the **authoritative, headless, transport-agnostic coordinator** for PvP matches in `src/game/pvp/`. It owns match creation, seat authorization, command deduplication (`commandId`), optimistic concurrency (`revision`), deterministic turn timeouts, forfeit handling, and rematch transitions.

`MatchService` imports **only** `src/shared/`, `src/config/gameConfig.ts`, and `src/game/pvp/PvPMatchEngine.ts` (never Colyseus, Express, Three.js, or DOM APIs).

---

## 2. Dependencies and Injected Primitives

```ts
export type ClockFn = () => number; // Defaults to () => Date.now()

export interface CreateMatchInput {
  matchId: string;
  seed: number;
  mapId?: string; // Defaults to PVP_DEFAULT_MAP_ID ('forgotten-swamp')
  startingTeam?: PvPTeam; // Defaults to 'teamA'; alternates on rematch
  seatA: {
    actorId: string;
    displayName: string;
    classes: [PvPHeroClass, PvPHeroClass, PvPHeroClass];
  };
  seatB: {
    actorId: string;
    displayName: string;
    classes: [PvPHeroClass, PvPHeroClass, PvPHeroClass];
  };
}
```

Injecting `clock: ClockFn` allows Vitest suites to test 60-second timeouts, pause/resume remaining turn time, and revision transitions instantaneously and deterministically without wall-clock sleeps.

---

## 3. Public API

| Method | Signature | Behavior |
|---|---|---|
| `createMatch` | `(input: CreateMatchInput) => ObservableMatchState` | Validates unique 3-class drafts per team, creates `PvPMatchEngine`, initializes `revision = 0`, sets `turnDeadlineMs = clock() + PVP_TURN_DURATION_MS`, returns initial state. |
| `getMatchState` | `(matchId: string, actor?: ActorContext) => ObservableMatchState \| null` | Returns deep copy of canonical state; if `actor` is provided, populates `viewer` perspective block (`myTeam`, `opponentTeam`, `isMyTurn`). |
| `getLegalActions` | `(matchId: string, actor: ActorContext) => LegalActionsSnapshot \| null` | Verifies `actor` belongs to match; returns full `LegalActionsSnapshot` if `actor.team === activeTeam` and match is `IN_PROGRESS`, or empty options with `isYourTurn: false` otherwise. |
| `submitAction` | `(matchId: string, actor: ActorContext, envelope: CommandEnvelope) => CommandResult` | Executes the strict 6-step validation pipeline (idempotency -> active status -> authorization -> revision -> engine rule -> commit). |
| `pauseMatch` | `(matchId: string) => ObservableMatchState \| null` | Transitions `IN_PROGRESS -> PAUSED_DISCONNECTED`, freezing remaining turn clock into `pausedRemainingTurnMs` and setting `turnDeadlineMs = null`. |
| `resumeMatch` | `(matchId: string) => ObservableMatchState \| null` | Transitions `PAUSED_DISCONNECTED -> IN_PROGRESS`, restoring `turnDeadlineMs = clock() + pausedRemainingTurnMs`. |
| `handleTurnTimeout` | `(matchId: string, nowMs?: number) => CommandResult \| null` | If `IN_PROGRESS` and `nowMs >= turnDeadlineMs`, deterministically ends active unit's activation (`timeout`), clears undo state, increments `revision`, emits `turnTimedOut` + turn-advance events, and sets next `turnDeadlineMs`. |
| `forfeitMatch` | `(matchId: string, losingSeat: PlayerSeat, reason: 'forfeit' \| 'disconnect_timeout') => PvPGameplayEvent[]` | Ends match immediately in `FINISHED`, assigns winner to opposing seat, increments `revision`, clears `turnDeadlineMs`, emits `battleEnded`. |
| `deleteMatch` | `(matchId: string) => void` | Cleans up memory when room disposes. |

---

## 4. `submitAction` Validation Pipeline (Exact Order)

Order matters—especially checking **idempotency before revision**—to guarantee safe retries over lossy networks:

```text
submitAction(matchId, actor, envelope)
  │
  ├── 1. Lookup matchId ───────────────────────────► missing?  -> fail('MATCH_NOT_FOUND')
  ├── 2. Verify ActorContext matches seat A/B ─────► mismatch? -> fail('UNAUTHORIZED_ACTOR')
  ├── 3. Check Idempotency Cache (actorId+cmdId) ──► hit?
  │       ├── same command hash ───────────────────► return cached CommandResult (idempotentReplay: true)
  │       └── different command payload ───────────► fail('COMMAND_CONFLICT')
  ├── 4. Check Match Phase:
  │       ├── PAUSED_DISCONNECTED ─────────────────► fail('MATCH_PAUSED')
  │       └── not IN_PROGRESS ─────────────────────► fail('MATCH_NOT_ACTIVE')
  ├── 5. Check Turn Ownership & Unit Identity:
  │       ├── actor.team !== activeTeam ───────────► fail('NOT_YOUR_TURN')
  │       └── command.unitId !== activeUnitId ─────► fail('UNIT_NOT_ACTIVE')
  ├── 6. Check Optimistic Revision:
  │       └── envelope.expectedRevision !== rev ───► fail('STALE_REVISION')
  └── 7. Execute on PvPMatchEngine:
          ├── invalid tactical rule ───────────────► fail('ILLEGAL_ACTION') [no revision bump]
          └── valid ───────────────────────────────► revision += 1, update turnDeadlineMs if
                                                     activeUnit/turn changed (or null if ended),
                                                     cache CommandResult, return ok: true
```

### Idempotency Cache Policy
- Keyed by `${actor.actorId}:${envelope.commandId}` alongside a canonical payload fingerprint (`JSON.stringify(envelope.command)` + `envelope.expectedRevision`).
- Retains all accepted (`ok: true`) results for the lifetime of the match (typically 20–80 commands per 3v3 match, capped at e.g. 512 entries via FIFO/LRU if needed).
- Transient rejections (`MATCH_PAUSED`, `STALE_REVISION`, `NOT_YOUR_TURN`) are **not** cached so a caller/client can retry once the transient condition clears—though standard callers should generate a fresh `commandId` after a failure and only reuse the same `commandId` when retrying an unacknowledged request.

---

## 5. Turn Clock (60s Deterministic Timeout)

1. **Activation Start**: Whenever a match begins (`createMatch`) or an activation advances to a new unit (`activationStarted`), `turnDeadlineMs = clock() + PVP_TURN_DURATION_MS` (`60_000`).
2. **Same-Unit Mid-Activation Action**: If the active unit performs only 1 of its 2 actions (e.g., `Move`, `UndoMove`, `Attack` before moving), `activeUnitId` stays the same and **`turnDeadlineMs` is NOT reset** (prevents infinite stalling via move/undo loops).
3. **Timeout Execution**:
   - `PvPRoom` schedules a timer via Colyseus `this.clock.setTimeout(...)` for `Math.max(0, turnDeadlineMs - Date.now())`.
   - When the timer fires, `PvPRoom` enqueues `handleTurnTimeout` on the room's serialized command queue.
   - Inside `MatchService.handleTurnTimeout`, it re-checks `phase === 'IN_PROGRESS' && nowMs >= turnDeadlineMs` (so a command that arrived 1ms earlier and already advanced the turn makes the timer callback a safe no-op!).
   - Timeout emits `{ type: 'turnTimedOut', unitId, team, round }`, clears `undoSnapshot`, ends activation (`reason: 'timeout'`), advances to the next living unit in `turnOrder`, increments `revision`, and resets `turnDeadlineMs = clock() + 60_000`.
4. **Disconnect Pause**:
   - `pauseMatch` stores `pausedRemainingTurnMs = Math.max(0, turnDeadlineMs - clock())` and clears `turnDeadlineMs = null`.
   - `resumeMatch` sets `turnDeadlineMs = clock() + Math.max(1000, pausedRemainingTurnMs)` (giving a 1s minimum grace floor on reconnect).

---

## 6. Authorization Invariants

- The server adapter (`PvPRoom` or future `MCPAdapter`) constructs `ActorContext` from **authenticated identity**, never from client-supplied `seat`/`team` fields.
- A player in Seat A can **only** execute commands when `activeTeam === 'teamA'`; Seat B can **only** execute when `activeTeam === 'teamB'`.
- `getLegalActions(matchId, actor)` returns empty action lists (`isYourTurn: false`) when called by the non-active seat.
- `getMatchState(matchId, actor)` returns full board visibility (perfect information tactical game—no fog of war in V5), while stamping `viewer` relative to `actor.seat`.

---

## 7. Rematch Handling

Rematch state is coordinated at the room/lobby layer (`PvPRoom`), which then calls `MatchService.createMatch` with a new `matchId` and `seed`:
1. When a match reaches `FINISHED`, `PvPRoom` initializes `rematchVotes = { A: false, B: false }`.
2. Either seat can send `RequestRematch` (or `CancelRematch`).
3. When both `A && B` are `true`:
   - `MatchService.deleteMatch(previousMatchId)` cleans up the completed match.
   - `PvPRoom` alternates `startingTeam` (`'teamA'` <-> `'teamB'`) to neutralize first-mover advantage across games while keeping physical seats (`A` / `B`) and cameras stable.
   - Room resets to `CHARACTER_SELECTION` so both players can select/reorder their 3 heroes and ready up for the next match.
4. If either player leaves or times out during `FINISHED`, rematch is aborted and the remaining player is notified (`Opponent left`).
