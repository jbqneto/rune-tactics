import { describe, expect, it } from 'vitest';
import { MatchService, type CreateMatchInput } from '../src/game/pvp/MatchService';
import type { ActorContext, CommandEnvelope, GameCommand, PvPHeroClass, PvPTeam } from '../src/shared/pvpTypes';

const classesA: [PvPHeroClass, PvPHeroClass, PvPHeroClass] = ['knight', 'archer', 'mage'];
const classesB: [PvPHeroClass, PvPHeroClass, PvPHeroClass] = ['cleric', 'knight', 'archer'];
const input = (matchId = 'match-1'): CreateMatchInput => ({ matchId, seed: 13, seatA: { actorId: 'actor-a', displayName: 'A', classes: classesA }, seatB: { actorId: 'actor-b', displayName: 'B', classes: classesB } });
const actor = (seat: 'A' | 'B'): ActorContext => ({ actorId: seat === 'A' ? 'actor-a' : 'actor-b', seat, team: seat === 'A' ? 'teamA' : 'teamB', type: 'human' });
let nextId = 0;
function submit(service: MatchService, id: string, player: ActorContext, command: GameCommand, expectedRevision?: number) {
  const state = service.getMatchState(id)!;
  return service.submitAction(id, player, { commandId: `cmd-${++nextId}`, matchId: id, expectedRevision: expectedRevision ?? state.revision, issuedAtMs: 0, command });
}
function commandFor(service: MatchService, id: string, team: PvPTeam): GameCommand {
  const legal = service.getLegalActions(id, actor(team === 'teamA' ? 'A' : 'B'))!;
  const unitId = legal.activeUnitId!;
  if (legal.smartAttacks[0]) return legal.smartAttacks[0].command;
  if (legal.attacks[0]) return legal.attacks[0].command;
  if (legal.smartSkills[0]) return legal.smartSkills[0].command;
  if (legal.skills[0]) return legal.skills[0].command;
  if (legal.canMove && legal.moves[0]) return legal.moves[0].command;
  if (legal.canDefend) return { type: 'Defend', unitId };
  return { type: 'EndTurn', unitId };
}

describe('MatchService', () => {
  it('runs a deterministic headless 3v3 match through elimination', () => {
    let now = 1000;
    const service = new MatchService(() => now);
    service.createMatch(input());
    for (let i = 0; i < 1800 && service.getMatchState('match-1')!.phase !== 'FINISHED'; i++) {
      const state = service.getMatchState('match-1')!;
      const command = commandFor(service, 'match-1', state.activeTeam!);
      const player = actor(state.activeSeat!);
      const result = submit(service, 'match-1', player, command);
      expect(result.ok, result.ok ? '' : result.message).toBe(true);
      now += 1;
    }
    const finished = service.getMatchState('match-1')!;
    expect(finished.phase).toBe('FINISHED');
    expect(finished.winnerSeat).not.toBeNull();
    expect(finished.units.filter((unit) => unit.alive)).toHaveLength(0 + finished.units.filter((unit) => unit.alive && unit.team === finished.winnerTeam).length);
    expect(finished.units.some((unit) => !unit.alive)).toBe(true);
  });

  it('replays accepted command IDs before revision checks and rejects payload conflicts', () => {
    const service = new MatchService(() => 0);
    service.createMatch(input());
    const legal = service.getLegalActions('match-1', actor('A'))!;
    const first = legal.moves[0].command;
    const envelope: CommandEnvelope = { commandId: 'same-id', matchId: 'match-1', expectedRevision: 0, issuedAtMs: 10, command: first };
    const applied = service.submitAction('match-1', actor('A'), envelope);
    expect(applied.ok).toBe(true);
    expect(service.getMatchState('match-1')!.revision).toBe(1);
    const replay = service.submitAction('match-1', actor('A'), envelope);
    expect(replay).toMatchObject({ ok: true, revision: 1, idempotentReplay: true });
    const conflict = service.submitAction('match-1', actor('A'), { ...envelope, command: { ...first, to: { x: 0, y: 0 } } });
    expect(conflict).toMatchObject({ ok: false, code: 'COMMAND_CONFLICT', currentRevision: 1 });
  });

  it('rejects stale, wrong-turn, wrong-unit, unauthorized and paused commands without tactical mutation', () => {
    let now = 10_000;
    const service = new MatchService(() => now);
    service.createMatch(input());
    const state = service.getMatchState('match-1')!;
    const command: GameCommand = { type: 'EndTurn', unitId: state.activeUnitId! };
    const invalidActor = { ...actor('A'), actorId: 'intruder' };
    const wrongUnit = { ...command, unitId: 'B1' };
    const cases: Array<[ActorContext, GameCommand, number | undefined, string]> = [
      [actor('A'), command, -1, 'STALE_REVISION'],
      [actor('B'), command, 0, 'NOT_YOUR_TURN'],
      [actor('A'), wrongUnit, 0, 'UNIT_NOT_ACTIVE'],
      [invalidActor, command, 0, 'UNAUTHORIZED_ACTOR'],
    ];
    for (const [who, cmd, revision, expected] of cases) {
      const before = service.getMatchState('match-1')!;
      const result = submit(service, 'match-1', who, cmd, revision);
      expect(result).toMatchObject({ ok: false, code: expected });
      expect(service.getMatchState('match-1')).toEqual(before);
    }
    service.pauseMatch('match-1');
    const paused = service.getMatchState('match-1')!;
    const result = submit(service, 'match-1', actor('A'), command, paused.revision);
    expect(result).toMatchObject({ ok: false, code: 'MATCH_PAUSED' });
    expect(service.getMatchState('match-1')).toEqual(paused);
  });

  it('keeps the same activation deadline across partial moves and preserves pause time on resume', () => {
    let now = 50_000;
    const service = new MatchService(() => now);
    service.createMatch(input());
    const deadline = service.getMatchState('match-1')!.turnDeadlineMs;
    const legal = service.getLegalActions('match-1', actor('A'))!;
    expect(submit(service, 'match-1', actor('A'), legal.moves[0].command).ok).toBe(true);
    expect(service.getMatchState('match-1')!.turnDeadlineMs).toBe(deadline);
    now += 20_000;
    const paused = service.pauseMatch('match-1')!;
    expect(paused.pausedRemainingTurnMs).toBe(40_000);
    expect(paused.turnDeadlineMs).toBeNull();
    now += 5_000;
    const resumed = service.resumeMatch('match-1')!;
    expect(resumed.turnDeadlineMs).toBe(now + 40_000);
    expect(resumed.pausedRemainingTurnMs).toBeNull();
    expect(service.handleTurnTimeout('match-1', resumed.turnDeadlineMs! - 1)).toBeNull();
    now = resumed.turnDeadlineMs!;
    const timeout = service.handleTurnTimeout('match-1', resumed.turnDeadlineMs!);
    expect(timeout?.ok).toBe(true);
    if (timeout?.ok) expect(timeout.events[0]).toMatchObject({ type: 'turnTimedOut', unitId: 'A1', team: 'teamA' });
    expect(service.getMatchState('match-1')!.turnDeadlineMs).toBe(now + 60_000);
  });
});
