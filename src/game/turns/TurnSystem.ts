import type { GameEvent, Phase, Team, TurnState, UnitState } from '../../shared/types';

export function isEligible(unit: Pick<UnitState, 'alive' | 'hasActivatedThisRound'>): boolean {
  return unit.alive && !unit.hasActivatedThisRound;
}

/**
 * Constrói a ordem fixa intercalada de ativações:
 * aliado[0], inimigo[0], aliado[1], inimigo[1], ..., sobrando o restante da equipe maior no final.
 */
export function buildTurnOrder(units: readonly UnitState[]): string[] {
  const players = units.filter((u) => u.team === 'player').map((u) => u.id);
  const enemies = units.filter((u) => u.team === 'enemy').map((u) => u.id);
  const order: string[] = [];
  const maxLen = Math.max(players.length, enemies.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < players.length) order.push(players[i]);
    if (i < enemies.length) order.push(enemies[i]);
  }
  return order;
}

export class TurnSystem {
  turnState: TurnState = 'player_unit_active';
  turnOrder: string[] = [];
  turnIndex = 0;
  round = 1;
  activeUnitId: string | null = null;
  winner: Team | null = null;

  get phase(): Phase {
    if (this.turnState === 'victory' || this.turnState === 'defeat') return this.turnState;
    return this.turnState === 'enemy_activation' ? 'enemy' : 'player';
  }

  get activationLocked(): boolean {
    return this.turnState === 'player_unit_active';
  }

  get activationTeam(): Team | null {
    if (this.isOver) return null;
    return this.turnState === 'enemy_activation' ? 'enemy' : 'player';
  }

  get isOver(): boolean {
    return this.turnState === 'victory' || this.turnState === 'defeat';
  }

  reset(units: UnitState[]): void {
    this.round = 1;
    this.winner = null;
    this.turnOrder = buildTurnOrder(units);
    this.turnIndex = 0;
    this.activeUnitId = null;

    for (const unit of units) {
      unit.hasMoved = false;
      unit.hasAttacked = false;
      unit.hasActivatedThisRound = false;
      unit.skillCooldown = 0;
    }

    const firstIndex = this.turnOrder.findIndex((id) => units.find((u) => u.id === id)?.alive);
    if (firstIndex === -1) {
      this.turnState = 'defeat';
      this.winner = 'enemy';
      return;
    }

    this.turnIndex = firstIndex;
    const firstUnit = units.find((u) => u.id === this.turnOrder[firstIndex])!;
    this.activeUnitId = firstUnit.id;
    this.turnState = firstUnit.team === 'player' ? 'player_unit_active' : 'enemy_activation';
  }

  /** Encerra a ativação atual e avança deterministicamente para a próxima unidade viva na `turnOrder`. */
  advanceTurn(activeUnit: UnitState, units: UnitState[]): GameEvent[] {
    if (this.isOver || this.turnOrder.length === 0) return [];

    activeUnit.hasActivatedThisRound = true;
    const prevTeam = activeUnit.team;
    const events: GameEvent[] = [{ type: 'activationEnded', unitId: activeUnit.id }];

    let wrappedNewRound = false;
    let nextIdx = -1;

    // 1. Procura a próxima unidade viva após turnIndex até o fim da turnOrder
    for (let i = this.turnIndex + 1; i < this.turnOrder.length; i++) {
      const candidate = units.find((u) => u.id === this.turnOrder[i]);
      if (candidate?.alive) {
        nextIdx = i;
        break;
      }
    }

    // 2. Se chegou ao fim da turnOrder, vira a rodada e procura do índice 0
    if (nextIdx === -1) {
      wrappedNewRound = true;
      this.round += 1;
      for (const unit of units) {
        unit.hasMoved = false;
        unit.hasAttacked = false;
        unit.hasActivatedThisRound = false;
        if (unit.alive && unit.skillCooldown > 0) {
          unit.skillCooldown = Math.max(0, unit.skillCooldown - 1);
        }
      }
      events.push({ type: 'roundStarted', round: this.round });

      for (let i = 0; i < this.turnOrder.length; i++) {
        const candidate = units.find((u) => u.id === this.turnOrder[i]);
        if (candidate?.alive) {
          nextIdx = i;
          break;
        }
      }
    }

    if (nextIdx === -1) {
      this.activeUnitId = null;
      return events;
    }

    this.turnIndex = nextIdx;
    const nextUnit = units.find((u) => u.id === this.turnOrder[nextIdx])!;
    this.activeUnitId = nextUnit.id;
    this.turnState = nextUnit.team === 'player' ? 'player_unit_active' : 'enemy_activation';

    if (wrappedNewRound || nextUnit.team !== prevTeam) {
      events.push({ type: 'turnChanged', phase: this.phase, round: this.round });
    }
    events.push({
      type: 'activationStarted',
      unitId: nextUnit.id,
      team: nextUnit.team,
      round: this.round,
    });

    return events;
  }

  /** Encerra a batalha imediatamente se um dos times não tem mais unidades vivas. */
  checkBattleEnd(units: readonly UnitState[]): GameEvent[] {
    if (this.isOver) return [];
    const hasAlive = (team: Team) => units.some((u) => u.team === team && u.alive);
    if (!hasAlive('player')) {
      this.turnState = 'defeat';
      this.winner = 'enemy';
      this.activeUnitId = null;
    } else if (!hasAlive('enemy')) {
      this.turnState = 'victory';
      this.winner = 'player';
      this.activeUnitId = null;
    } else {
      return [];
    }
    return [{ type: 'battleEnded', winner: this.winner }];
  }
}
