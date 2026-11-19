import type { GameCommand, LegalActionsSnapshot, ObservableMatchState, PvPTeam } from '../../../src/shared/pvpTypes.js';

export interface BotPolicy { readonly name: string; selectCommand(state: ObservableMatchState, legal: LegalActionsSnapshot): GameCommand }

export class HeuristicBot implements BotPolicy {
  readonly name = 'heuristic';
  selectCommand(state: ObservableMatchState, legal: LegalActionsSnapshot): GameCommand {
    const allAttacks = [...legal.attacks.map((action) => ({ ...action, steps: 0 })), ...legal.smartAttacks];
    const kills = allAttacks.filter((action) => action.wouldKill);
    if (kills.length) return kills.sort((a, b) => a.steps - b.steps || a.targetId.localeCompare(b.targetId))[0].command;
    const attacks = allAttacks.sort((a, b) => b.estimatedDamage - a.estimatedDamage || a.steps - b.steps || a.targetId.localeCompare(b.targetId));
    if (attacks.length) return attacks[0].command;
    const skills = [...legal.skills, ...legal.smartSkills].sort((a, b) => b.affectedUnitIds.length - a.affectedUnitIds.length || a.targetCell.y - b.targetCell.y || a.targetCell.x - b.targetCell.x);
    if (skills.length) return skills[0].command;
    if (legal.moves.length) {
      const enemies = state.units.filter((unit) => unit.alive && unit.team !== legal.actorTeam);
      const distance = (x: number, y: number, team: PvPTeam) => Math.min(...enemies.filter((e) => e.team === team).map((e) => Math.abs(x - e.pos.x) + Math.abs(y - e.pos.y)));
      const current = state.units.find((unit) => unit.id === legal.activeUnitId);
      if (current && legal.canMove && !current.hasMoved) {
        const best = [...legal.moves].sort((a, b) => distance(a.to.x, a.to.y, legal.actorTeam) - distance(b.to.x, b.to.y, legal.actorTeam) || a.to.y - b.to.y || a.to.x - b.to.x)[0];
        if (best) return best.command;
      }
    }
    if (legal.defendCommand && legal.canDefend) return legal.defendCommand;
    if (legal.endTurnCommand) return legal.endTurnCommand;
    throw new Error('No legal action is available');
  }
}
