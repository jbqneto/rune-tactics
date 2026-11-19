import { describe, expect, it } from 'vitest';
import { PvPMatchEngine } from '../src/game/pvp/PvPMatchEngine';

describe('PvPMatchEngine', () => {
  const teams = { teamA: ['knight', 'archer', 'mage'] as const, teamB: ['cleric', 'knight', 'archer'] as const };
  it('creates mirrored 3v3 spawns and interleaved order', () => {
    const engine = new PvPMatchEngine({ ...teams, seed: 42 });
    const state = engine.getState();
    const a = state.units.filter((u) => u.team === 'player');
    const b = state.units.filter((u) => u.team === 'enemy');
    expect(state.turnOrder).toEqual(['A1', 'B1', 'A2', 'B2', 'A3', 'B3']);
    a.forEach((u, i) => expect(b[i].pos).toEqual({ x: 11 - u.pos.x, y: 11 - u.pos.y }));
  });
  it('offers legal movement, smart actions and undo, then supports defend and skills', () => {
    const engine = new PvPMatchEngine({ ...teams, seed: 7 });
    const legal = engine.getLegalActions('teamA');
    expect(legal.canMove).toBe(true);
    expect(legal.moves.length).toBeGreaterThan(0);
    expect(legal.smartAttacks).toBeDefined();
    const move = legal.moves[0];
    expect(engine.move(move.to).ok).toBe(true);
    expect(engine.getLegalActions('teamA').canUndoMove).toBe(true);
    expect(engine.undoMove().ok).toBe(true);
    expect(engine.defend().ok).toBe(true);
    expect(engine.getState().units[0].isGuarding).toBe(true);
  });
  it('rejects duplicate classes and leaves defeated units as corpses in state', () => {
    expect(() => new PvPMatchEngine({ seed: 1, teamA: ['knight', 'knight', 'mage'], teamB: teams.teamB })).toThrow();
    const engine = new PvPMatchEngine({ ...teams, seed: 11 });
    expect(engine.getState().units).toHaveLength(6);
    expect(engine.getLegalActions('teamB').isYourTurn).toBe(false);
  });
});
