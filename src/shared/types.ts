// Contratos compartilhados entre o motor (src/game) e a interface (src/rendering, src/input, src/ui).
// Este arquivo não importa nada: nem Three.js, nem DOM, nem config.
// As regras do sistema de turnos estão em docs/turn-system.md.

/** Célula do tabuleiro. x = coluna, y = linha, ambas de 0 a `gridSize - 1`. */
export interface GridCoord {
  x: number;
  y: number;
}

export type Team = 'player' | 'enemy';

export type UnitType =
  | 'knight'
  | 'archer'
  | 'mage'
  | 'cleric'
  | 'melee-skeleton'
  | 'skeleton-archer'
  | 'armored-skeleton'
  | 'goblin-scout'
  | 'cultist-mage';

export type SkillId = 'runic-strike' | 'marked-shot' | 'arcane-burst' | 'healing-light';

export type ObstacleKind = 'wall' | 'pillar' | 'crate' | 'barrel';

/** Todo obstáculo bloqueia movimento. Só `wall` e `pillar` bloqueiam linha de visão. */
export interface ObstacleDef {
  pos: GridCoord;
  kind: ObstacleKind;
  blocksLos: boolean;
}

/**
 * De quem é a vez, em resumo. É derivado de `TurnState`:
 * 'player' cobre `awaiting_player_choice` e `player_unit_active`; 'enemy' é `enemy_activation`.
 */
export type Phase = 'player' | 'enemy' | 'victory' | 'defeat';

/**
 * Estado da máquina de turnos (V2.1 — ordem fixa automática).
 * - `player_unit_active`: a unidade do jogador determinada pelo `turnOrder` está ativa.
 * - `enemy_activation`: um inimigo determinado pelo `turnOrder` está agindo via `executeNextEnemyAction`.
 * - `victory` e `defeat`: finais.
 */
export type TurnState = 'player_unit_active' | 'enemy_activation' | 'victory' | 'defeat';

export interface UnitState {
  id: string;
  name: string;
  type: UnitType;
  team: Team;
  /** Para uma unidade morta, é a célula onde ela caiu: o cadáver fica ali e não bloqueia nada. */
  pos: GridCoord;
  hp: number;
  maxHp: number;
  damage: number;
  /** Passos ortogonais por ativação. */
  moveRange: number;
  /** Distância de Manhattan máxima até o alvo. Acima de 1, o ataque exige linha de visão. */
  attackRange: number;
  /** Unidades mortas continuam na lista, com `alive: false` e `hp: 0`. Nunca são removidas. */
  alive: boolean;
  /** Zerados no início de cada rodada. */
  hasMoved: boolean;
  /** Ataque básico e habilidade consomem a mesma ação. */
  hasAttacked: boolean;
  /** A unidade já teve sua ativação nesta rodada. Zerado no início de cada rodada. */
  hasActivatedThisRound: boolean;
  /** `null` para unidades sem habilidade (os inimigos). */
  skillId: SkillId | null;
  skillName: string | null;
  /** 0 = pronta. Ao usar, vai para a recarga da habilidade; cai 1 no início de cada rodada. */
  skillCooldown: number;
  /** Caminho do retrato para o HUD, relativo à raiz do site. */
  portraitPath?: string;
}

/** Fatos já ocorridos no motor, na ordem em que ocorreram. A interface só os anima. */
export type GameEvent =
  /** `path` inclui a célula de origem e a de destino. */
  | { type: 'unitMoved'; unitId: string; path: GridCoord[] }
  /**
   * Dano aplicado a um alvo. `isRanged` indica projétil (alcance acima de 1).
   * `skillId` vem preenchido quando o dano é de uma habilidade; nesse caso há um `skillUsed` logo antes.
   */
  | {
      type: 'unitAttacked';
      attackerId: string;
      targetId: string;
      damage: number;
      targetHpRemaining: number;
      isRanged?: boolean;
      skillId?: SkillId;
    }
  /** Uma habilidade foi lançada. Vem antes do `unitAttacked` ou `unitHealed` de cada unidade em `affectedUnitIds`. */
  | { type: 'skillUsed'; casterId: string; skillId: SkillId; targetCell: GridCoord; affectedUnitIds: string[] }
  /** Cura aplicada. `amount` é o HP de fato recuperado, já limitado por `maxHp`. */
  | { type: 'unitHealed'; casterId: string; targetId: string; amount: number; targetHpAfter: number }
  | { type: 'unitDied'; unitId: string }
  /** Uma unidade começou sua ativação. Para o jogador, sai junto com a primeira ação ou com o passe. */
  | { type: 'activationStarted'; unitId: string; team: Team; round: number }
  /** A ativação terminou: por gastar as duas ações, por encerramento manual, por falta de ação ou por morte. */
  | { type: 'activationEnded'; unitId: string }
  /** Todas as unidades vivas já ativaram e uma nova rodada começou. */
  | { type: 'roundStarted'; round: number }
  /** A vez passou para o outro time, ou uma nova rodada começou. */
  | { type: 'turnChanged'; phase: Phase; round: number }
  | { type: 'battleEnded'; winner: Team }
  | { type: 'gameReset' };

/** Cópia do estado: alterá-la não afeta o motor. */
export interface GameStateSnapshot {
  gridSize: number;
  /** Só as posições de `obstacleDefs`, na mesma ordem. */
  obstacles: GridCoord[];
  obstacleDefs: ObstacleDef[];
  /** Inclui as unidades mortas (`alive: false`), que ficam como cadáveres na célula onde caíram. */
  units: UnitState[];
  phase: Phase;
  turnState: TurnState;
  /** Ordem fixa intercalada de IDs das unidades definida no início da partida. */
  turnOrder: string[];
  /** Índice atual dentro de `turnOrder`. */
  turnIndex: number;
  /** Começa em 1 e sobe quando todas as unidades vivas já ativaram. */
  round: number;
  /**
   * Unidade com a ativação aberta: o aliado travado em `player_unit_active` ou o inimigo que está agindo
   * em `enemy_activation`. `null` nos demais estados.
   */
  activeUnitId: string | null;
  /** `true` em `player_unit_active`: o jogador não pode trocar de aliado até a ativação terminar. */
  activationLocked: boolean;
  /** Time da ativação atual. `null` depois do fim da batalha. */
  activationTeam: Team | null;
  /** Unidade em foco no HUD. Em `player_unit_active` é sempre igual a `activeUnitId`. */
  selectedUnitId: string | null;
  winner: Team | null;
}

export type ActionResult = { ok: true } | { ok: false; reason: string };

/**
 * Único ponto de contato da interface com as regras.
 * Onde `unitId` é opcional, o padrão é a unidade selecionada; sem unidade, a lista vem vazia.
 * Uma unidade é "elegível" quando está viva e ainda não ativou nesta rodada.
 */
export interface IGameEngine {
  getState(): GameStateSnapshot;

  /**
   * Põe uma unidade viva do jogador em foco. Só vale na vez do jogador.
   * - Em `awaiting_player_choice`: aceita qualquer aliado vivo. Um elegível pode agir; um que já ativou
   *   fica só para inspeção. `null` limpa a seleção.
   * - Em `player_unit_active`: recusa qualquer unidade que não seja a ativa, e recusa `null`.
   */
  selectUnit(unitId: string | null): ActionResult;

  /** Células onde a unidade pode parar agora. Vazio se ela já se moveu ou não pode agir nesta ativação. */
  getReachableCells(unitId?: string): GridCoord[];

  /**
   * Menor caminho ortogonal entre duas células, com origem e destino incluídos.
   * Não considera `moveRange`. `null` se não houver caminho.
   */
  getPath(from: GridCoord, to: GridCoord): GridCoord[] | null;

  /**
   * Inimigos vivos ao alcance e, para alcance acima de 1, com linha de visão.
   * Vazio se a unidade já atacou ou não pode agir nesta ativação.
   */
  getAttackableTargets(unitId?: string): UnitState[];

  /**
   * Linha de visão entre os centros de duas células. Só obstáculos com `blocksLos` a interrompem;
   * unidades e cadáveres não. Origem e destino nunca bloqueiam, e a linha passa entre dois obstáculos
   * que só se tocam pelo canto.
   */
  hasLineOfSight(from: GridCoord, to: GridCoord): boolean;

  /**
   * Todas as células dentro do alcance de ataque básico da unidade (respeitando obstáculos e linha de visão).
   * Vazio se a unidade já atacou ou não é a unidade ativa.
   */
  getAttackRangeCells(unitId?: string): GridCoord[];

  /**
   * Todas as células dentro do alcance da habilidade da unidade (respeitando obstáculos e linha de visão).
   * Vazio se a unidade já atacou, está em recarga, não tem habilidade ou não é a unidade ativa.
   */
  getSkillRangeCells(unitId?: string): GridCoord[];

  /**
   * Células onde a unidade pode lançar a habilidade agora: ao alcance e com linha de visão (alcance acima de 1).
   * - Habilidade de dano: a área de efeito precisa pegar ao menos um inimigo vivo.
   * - Habilidade de cura: a célula precisa ter um aliado vivo abaixo do HP máximo; pode ser a do próprio lançador.
   * Vazio se a unidade já atacou, está em recarga, não tem habilidade ou não pode agir nesta ativação.
   */
  getSkillTargetCells(unitId?: string): GridCoord[];

  /**
   * Células atingidas se a habilidade da unidade for lançada em `targetCell`: a própria célula ou,
   * para `arcane-burst`, ela e as ortogonalmente adjacentes dentro da grade. Não valida alcance.
   */
  getSkillAreaCells(targetCell: GridCoord, unitId?: string): GridCoord[];

  /**
   * Move a unidade selecionada, que precisa ser elegível. Movimento e ataque valem em qualquer ordem.
   * A primeira ação bem-sucedida abre a ativação e trava a unidade (`player_unit_active`).
   * Quando a unidade ativa já moveu e atacou, a ativação termina sozinha e a vez passa adiante.
   */
  moveSelectedUnit(to: GridCoord): ActionResult;

  /** Ataque básico com a unidade selecionada. Abre e encerra a ativação como `moveSelectedUnit`. */
  attackTarget(targetId: string): ActionResult;

  /**
   * Lança a habilidade da unidade selecionada em uma célula de `getSkillTargetCells`.
   * Consome o ataque da ativação. Abre e encerra a ativação como `moveSelectedUnit`.
   */
  useSkill(targetCell: GridCoord): ActionResult;

  /**
   * Encerra a ativação atual do jogador e passa a vez adiante. O nome é o da versão anterior:
   * não encerra mais o turno do time inteiro.
   * - Em `player_unit_active`: encerra a ativação da unidade ativa, mesmo com ações sobrando.
   * - Em `awaiting_player_choice`: a unidade selecionada, se elegível, passa a vez sem agir.
   *   Sem unidade elegível selecionada, é recusado.
   */
  endPlayerTurn(): ActionResult;

  /**
   * Avança a ativação inimiga em um passo. Só faz algo em `enemy_activation`.
   * Escolhe o próximo inimigo elegível se nenhum está ativo e executa uma ação dele (um movimento ou um ataque).
   * Quando o inimigo ativo não tem mais o que fazer, a mesma chamada encerra a ativação e passa a vez adiante.
   * Retorna `true` se executou uma ação. Um retorno `false` não significa que a vez do inimigo acabou:
   * a interface deve seguir chamando enquanto `turnState` for `enemy_activation`.
   */
  executeNextEnemyAction(): boolean;

  /** Volta ao estado inicial e emite `gameReset`. */
  reset(): void;

  /** Devolve os eventos acumulados desde a última chamada e esvazia a fila. */
  consumeEvents(): GameEvent[];
}
