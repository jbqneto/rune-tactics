import { MatchService } from '../../../src/game/pvp/MatchService.js';
import type { ClockFn } from '../../../src/game/pvp/MatchService.js';
import type { CommandEnvelope, GameCommand, PvPGameplayEvent, PvPHeroClass, PvPTeam, PlayerSeat } from '../../../src/shared/pvpTypes.js';
import { HeuristicBot, type BotPolicy } from './HeuristicBot.js';

export interface RunHeadlessMatchInput { matchId?: string; seed: number; mapId?: string; startingTeam?: PvPTeam; classesA?: [PvPHeroClass, PvPHeroClass, PvPHeroClass]; classesB?: [PvPHeroClass, PvPHeroClass, PvPHeroClass]; botA?: BotPolicy; botB?: BotPolicy; maxCommands?: number }
export interface ReplayLogEntry { step: number; commandId: string; seat: PlayerSeat; team: PvPTeam; revision: number; command: GameCommand; events: PvPGameplayEvent[] }
export interface HeadlessMatchResult { winnerTeam: PvPTeam; rounds: number; totalCommands: number; replayLog: ReplayLogEntry[] }

export function runHeadlessMatch(input: RunHeadlessMatchInput): HeadlessMatchResult {
  let now = 1;
  const clock: ClockFn = () => now;
  const matches = new MatchService(clock);
  const matchId = input.matchId ?? `headless-${input.seed}`;
  const state = matches.createMatch({ matchId, seed: input.seed, mapId: input.mapId, startingTeam: input.startingTeam, seatA: { actorId: 'agent-a', displayName: 'Agent A', actorType: 'mcp-agent', classes: input.classesA ?? ['knight', 'archer', 'mage'] }, seatB: { actorId: 'agent-b', displayName: 'Agent B', actorType: 'mcp-agent', classes: input.classesB ?? ['knight', 'archer', 'cleric'] } });
  const bots = { A: input.botA ?? new HeuristicBot(), B: input.botB ?? new HeuristicBot() };
  const actors = { A: { actorId: 'agent-a', seat: 'A' as const, team: 'teamA' as const, type: 'mcp-agent' as const }, B: { actorId: 'agent-b', seat: 'B' as const, team: 'teamB' as const, type: 'mcp-agent' as const } };
  const replayLog: ReplayLogEntry[] = [];
  let current = state;
  for (let step = 0; step < (input.maxCommands ?? 1000) && current.phase !== 'FINISHED'; step++) {
    const seat = current.activeSeat!; const actor = actors[seat];
    const legal = matches.getLegalActions(matchId, actor)!;
    const command = bots[seat].selectCommand(current, legal);
    const envelope: CommandEnvelope = { commandId: `step-${step}`, matchId, expectedRevision: current.revision, issuedAtMs: now, command };
    const result = matches.submitAction(matchId, actor, envelope);
    if (!result.ok) throw new Error(`Bot submitted illegal action: ${result.code}`);
    replayLog.push({ step, commandId: envelope.commandId, seat, team: actor.team, revision: result.revision, command, events: result.events });
    current = result.state; now += 1;
  }
  if (current.phase !== 'FINISHED' || !current.winnerTeam) throw new Error(`Headless match did not finish within ${input.maxCommands ?? 1000} commands`);
  return { winnerTeam: current.winnerTeam, rounds: current.round, totalCommands: replayLog.length, replayLog };
}
