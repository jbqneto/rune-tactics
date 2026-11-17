# Design da Campanha — Rune Tactics V4 (The Ashen Campaign)

Este documento especifica a estrutura das 5 fases sequenciais (`StageConfig`), os dois mapas novos (`forgotten-swamp` e `corrupted-sanctuary`), o fluxo completo de campanha, recuperação entre fases, evolução dos heróis, checkpoint, persistência versionada em `localStorage` e separação do modo **Batalha Rápida**.

---

## 1. Separação de Modos: Campanha vs. Batalha Rápida

O jogo oferece dois modos explícitos (`GameMode = 'campaign' | 'quick-battle'`):

1. **Campanha (`The Ashen Campaign`)**:
   - Sequência fixa de 5 fases (`StageConfig[]` em `src/config/gameConfig.ts`).
   - Heróis persistem atributos (`str`, `dex`, `int`, `fort`) e `hp`/`maxHp` entre as fases, recuperam parcialmente após vitórias, evoluem `+1` ponto por herói por fase vencida e contam com checkpoint por fase e save automático em `localStorage`.
   - As formações inimigas de cada fase são fixas/curadas em `StageConfig` (ou com spawns determinísticos fixos da fase) para garantir ritmo tático progressivo.
2. **Batalha Rápida (`quick-battle`)**:
   - Preserva integralmente o comportamento da V2.3: sorteio de mapa em `MAPS` sem repetição consecutiva e sorteio das posições iniciais com semente (`seed`).
   - Os 4 heróis entram com os atributos iniciais padrão da tabela de classes, utilizando as fórmulas de atributo e defesa da V4.
   - Não lê, não altera e não apaga o save de campanha em `localStorage`.

---

## 2. Estrutura das 5 Fases (`CAMPAIGN_STAGES: StageConfig[]`)

Cada fase é declarada em `src/config/gameConfig.ts` pela interface `StageConfig`:

```ts
export interface StageEnemySpawn {
  id: string;
  type: UnitType;
  pos: GridCoord;
}

export interface StageHeroSpawn {
  id: string;
  type: 'knight' | 'archer' | 'mage' | 'cleric';
  pos: GridCoord;
}

export interface StageConfig {
  stageNumber: number; // 1..5
  id: string;
  name: string;
  subtitle: string;
  mapId: string;
  isBossStage: boolean;
  heroSpawns: StageHeroSpawn[];
  enemies: StageEnemySpawn[];
}
```

### Formação Canônica dos Heróis nas Fases

Para consistência visual e clareza tática em todas as 5 fases, os 4 heróis nascem nas duas linhas do sul (`playerSpawnRows: [0, 1]`):

- `knight-1` (`knight`): `{ x: 4, y: 1 }` (vanguarda centro-esquerda)
- `cleric-1` (`cleric`): `{ x: 7, y: 1 }` (vanguarda centro-direita / suporte próximo)
- `archer-1` (`archer`): `{ x: 2, y: 0 }` (retaguarda oeste)
- `mage-1` (`mage`): `{ x: 9, y: 0 }` (retaguarda leste)

*(Todas as células acima são garantidamente livres de obstáculos em todos os mapas da campanha; caso algum mapa futuro altere spawns, cada `StageConfig` permite `heroSpawns` próprio.)*

---

### Fase 1: Posto Avançado (`stage-1-outpost`)
- **Mapa**: `ruins` ("Ruínas Atuais")
- **Objetivo**: Introduzir combate tático, linha de visão através da muralha central e postura **Defender**.
- **Inimigos (3)**:
  - `goblin-scout-1` (`goblin-scout`): `{ x: 2, y: 10 }` (flanco oeste, portão largo)
  - `melee-skeleton-1` (`melee-skeleton`): `{ x: 5, y: 10 }` (centro)
  - `goblin-scout-2` (`goblin-scout`): `{ x: 9, y: 10 }` (flanco leste, passagem estreita)
- **Ordem de turno intercalada (`buildTurnOrder`)**: `knight-1`, `goblin-scout-1`, `cleric-1`, `melee-skeleton-1`, `archer-1`, `goblin-scout-2`, `mage-1`.

---

### Fase 2: Pântano Esquecido (`stage-2-swamp`)
- **Mapa**: `forgotten-swamp` ("Pântano Esquecido" — **novo mapa**)
- **Objetivo**: Controlar os 3 gargalos/pontes estreitas contra flanqueadores rápidos e pressão de arqueiro atrás da água.
- **Inimigos (5)**:
  - `goblin-stalker-1` (`goblin-stalker`): `{ x: 2, y: 10 }` (alinhado à ponte oeste `x=2`)
  - `goblin-scout-1` (`goblin-scout`): `{ x: 5, y: 10 }` (ponte central)
  - `goblin-scout-2` (`goblin-scout`): `{ x: 6, y: 10 }` (ponte central)
  - `goblin-stalker-2` (`goblin-stalker`): `{ x: 9, y: 10 }` (alinhado à ponte leste `x=9`)
  - `skeleton-archer-1` (`skeleton-archer`): `{ x: 5, y: 11 }` (retaguarda atirando sobre o pântano)

---

### Fase 3: Fortaleza dos Ossos (`stage-3-fortress`)
- **Mapa**: `fortress` ("Fortaleza Abandonada")
- **Objetivo**: Quebrar uma linha de frente defensiva de escudeiros e armadura pesada que bloqueia o corredor central enquanto o arqueiro dispara da retaguarda.
- **Inimigos (6)**:
  - `skeleton-shieldbearer-1` (`skeleton-shieldbearer`): `{ x: 4, y: 10 }`
  - `skeleton-shieldbearer-2` (`skeleton-shieldbearer`): `{ x: 7, y: 10 }`
  - `melee-skeleton-1` (`melee-skeleton`): `{ x: 2, y: 10 }`
  - `melee-skeleton-2` (`melee-skeleton`): `{ x: 9, y: 10 }`
  - `armored-skeleton-1` (`armored-skeleton`): `{ x: 5, y: 10 }`
  - `skeleton-archer-1` (`skeleton-archer`): `{ x: 6, y: 11 }`

---

### Fase 4: Catacumbas Arcanas (`stage-4-catacombs`)
- **Mapa**: `catacombs` ("Catacumbas Cruzadas")
- **Objetivo**: Romper as muralhas internas das catacumbas e neutralizar conjuradores (`cultist-mage`) e sustentadores (`necromancer-acolyte`) protegidos por esqueletos blindados.
- **Inimigos (6)**:
  - `armored-skeleton-1` (`armored-skeleton`): `{ x: 4, y: 10 }`
  - `armored-skeleton-2` (`armored-skeleton`): `{ x: 7, y: 10 }`
  - `cultist-mage-1` (`cultist-mage`): `{ x: 1, y: 11 }`
  - `cultist-mage-2` (`cultist-mage`): `{ x: 10, y: 11 }`
  - `necromancer-acolyte-1` (`necromancer-acolyte`): `{ x: 4, y: 11 }`
  - `necromancer-acolyte-2` (`necromancer-acolyte`): `{ x: 7, y: 11 }`

---

### Fase 5: Santuário Corrompido (`stage-5-sanctuary`)
- **Mapa**: `corrupted-sanctuary` ("Santuário Corrompido" — **novo mapa**)
- **Objetivo**: Derrotar o chefe **Guardião das Cinzas (`ashen-guardian`)** e seus dois guardiões de apoio, evitando ou defendendo seus ataques anunciados (`Golpe das Cinzas` e `Erupção das Cinzas`).
- **`isBossStage`**: `true`
- **Inimigos (3)**:
  - `skeleton-shieldbearer-1` (`skeleton-shieldbearer`): `{ x: 4, y: 10 }` (vanguarda protetora)
  - `ashen-guardian-1` (`ashen-guardian`): `{ x: 6, y: 10 }` (chefe centralizado no altar norte)
  - `necromancer-acolyte-1` (`necromancer-acolyte`): `{ x: 8, y: 11 }` (suporte sombrio na retaguarda)

---

## 3. Novos Mapas 12×12 (`MAPS`)

Todos os mapas continuam 12×12 planos (`gridSize: 12`), com linhas de spawn `playerSpawnRows: [0, 1]` e `enemySpawnRows: [10, 11]` sem obstáculos e **100% das células livres conectadas entre si** (verificado por BFS).

Para o pântano, adiciona-se o tipo de obstáculo `'water'` em `ObstacleKind` com **`blocksLos: false`** (bloqueia movimento, permite tiros e magias atravessarem por cima da água). As passagens entre blocos de água podem levar `bridgeCells?: GridCoord[]` em `MapConfig` (campo puramente visual para o `BoardRenderer` desenhar tábuas de madeira sobre o piso da ponte, sem alterar regras de caminho ou altura).

### 3.1 `forgotten-swamp` ("Pântano Esquecido")

Legenda: `~` água (`water`, `blocksLos: false`); `O` pilar (`blocksLos: true`); `c` caixote (`blocksLos: false`); `b` barril (`blocksLos: false`); `.` célula livre (com tábuas visuais de ponte nas colunas C, F–G e J nas linhas 6 e 7).

```
12 (y=11)  . . . . . . . . . . . .   (spawn inimigo)
11 (y=10)  . . . . . . . . . . . .   (spawn inimigo)
10 (y=9)   . . O . . . . . . O . .   pilares: (2,9), (9,9)
 9 (y=8)   . b . . c . . c . . b .   barris: (1,8),(10,8); caixotes: (4,8),(7,8)
 8 (y=7)   . . . . . . . . . . . .
 7 (y=6)   ~ ~ . ~ ~ . . ~ ~ . ~ ~   pontes em x=2, x=5..6, x=9
 6 (y=5)   ~ ~ . ~ ~ . . ~ ~ . ~ ~   pontes em x=2, x=5..6, x=9
 5 (y=4)   . . . . . . . . . . . .
 4 (y=3)   . b . . c . . c . . b .   barris: (1,3),(10,3); caixotes: (4,3),(7,3)
 3 (y=2)   . . O . . . . . . O . .   pilares: (2,2), (9,2)
 2 (y=1)   . . . . . . . . . . . .   (spawn herói)
 1 (y=0)   . . . . . . . . . . . .   (spawn herói)
           A B C D E F G H I J K L
           0 1 2 3 4 5 6 7 8 9 10 11
```

- **Total de obstáculos**: 28 (`16 water`, `4 pillar`, `4 crate`, `4 barrel`).
- **Células livres**: `144 - 28 = 116`, todas conectadas em um único componente.
- **`bridgeCells` (visuais)**: `{x:2,y:5}, {x:5,y:5}, {x:6,y:5}, {x:9,y:5}, {x:2,y:6}, {x:5,y:6}, {x:6,y:6}, {x:9,y:6}`.

### 3.2 `corrupted-sanctuary` ("Santuário Corrompido")

Legenda: `#` parede (`blocksLos: true`); `O` pilar (`blocksLos: true`); `c` caixote (`blocksLos: false`); `b` barril (`blocksLos: false`).

```
12 (y=11)  . . . . . . . . . . . .   (spawn inimigo)
11 (y=10)  . . . . . . . . . . . .   (spawn inimigo)
10 (y=9)   . O . . . . . . . . O .   pilares: (1,9), (10,9)
 9 (y=8)   . . . # . . . . # . . .   paredes: (3,8), (8,8)
 8 (y=7)   . . . . . O O . . . . .   pilares centrais do altar: (5,7), (6,7)
 7 (y=6)   # . . . c . . c . . . #   paredes: (0,6),(11,6); caixotes: (4,6),(7,6)
 6 (y=5)   # . . . . . . . . . . #   paredes: (0,5),(11,5)
 5 (y=4)   . . b . . . . . . b . .   barris: (2,4), (9,4)
 4 (y=3)   . . . # . . . . # . . .   paredes: (3,3), (8,3)
 3 (y=2)   . O . . c . . c . . O .   pilares: (1,2),(10,2); caixotes: (4,2),(7,2)
 2 (y=1)   . . . . . . . . . . . .   (spawn herói)
 1 (y=0)   . . . . . . . . . . . .   (spawn herói)
           A B C D E F G H I J K L
           0 1 2 3 4 5 6 7 8 9 10 11
```

- **Total de obstáculos**: 20 (`8 wall`, `6 pillar`, `4 crate`, `2 barrel`).
- **Células livres**: `144 - 20 = 124`, todas conectadas em um único componente.
- Nota: `MAPS` em `gameConfig.ts` passa a incluir esses dois mapas junto aos 6 existentes (ou `QUICK_BATTLE_MAP_IDS` continua podendo sortear todos os mapas de `MAPS`, atualizando o teste de lista em `tests/v23-features.test.ts`).

---

## 4. Fluxo de Campanha, Recuperação, Evolução e Checkpoint

```
[Nova Campanha] ──▶ Cria 4 heróis base ──▶ Grava Checkpoint Fase 1 ──▶ [Batalha Fase 1]
                                                                              │
                 ┌────────────────── Derrota ─────────────────────────────────┤
                 ▼                                                            ▼ Vitória
      [Modal de Derrota]                                           É a Fase 5 (Chefe)?
       ├─ Reiniciar Fase ──▶ Restaura Checkpoint da Fase N               ├─ Sim ──▶ [Vitória da Campanha!]
       └─ Nova Campanha  ──▶ Reseta save e volta à Fase 1                └─ Não ──▶ [Recuperação Pós-Vitória]
                                                                                       │
                                                                                       ▼
                                                                             +1 Ponto / Herói
                                                                                       │
                                                                                       ▼
                                                                           [Tela de Acampamento]
                                                                           (Distribui atributos)
                                                                                       │
                                                                                       ▼ Confirmar
                                                                        Grava Checkpoint Fase N+1
                                                                                       │
                                                                                       ▼
                                                                             [Batalha Fase N+1]
```

### 4.1 Recuperação Entre Fases (Fases 1 → 4)

Constantes em `src/config/gameConfig.ts`:
- `CAMPAIGN_ALIVE_HEAL_RATIO = 0.35`
- `CAMPAIGN_REVIVE_HP_RATIO = 0.25`
- `CAMPAIGN_POINTS_PER_VICTORY = 1`

Ao vencer a fase `N` (`N < 5`), captura-se o `hp` e `alive` finais de cada herói no `GameStateSnapshot` e aplica-se nesta ordem exata:
1. **Heróis vivos (`hero.alive && hero.hp > 0`)**:
   ```ts
   const heal = Math.ceil(hero.maxHp * CAMPAIGN_ALIVE_HEAL_RATIO);
   hero.hp = Math.min(hero.maxHp, hero.hp + heal);
   ```
2. **Heróis caídos (`!hero.alive || hero.hp === 0`)**:
   ```ts
   hero.alive = true;
   hero.hp = Math.max(1, Math.ceil(hero.maxHp * CAMPAIGN_REVIVE_HP_RATIO));
   ```
3. **Concessão de pontos**: cada um dos 4 heróis recebe `unspentPoints += CAMPAIGN_POINTS_PER_VICTORY` (`+1`), inclusive quem foi revivido.

### 4.2 Evolução no Acampamento

- Enquanto `status === 'between_stages'`, o jogador distribui os pontos pendentes de cada herói nos 4 atributos (`str`, `dex`, `int`, `fort`), respeitando `MAX_ATTRIBUTE = 12`.
- Ao investir em `fort`, aplica-se imediatamente a regra da seção 4 de `docs/attribute-system.md`: recalcula `newMaxHp = calcMaxHp(baseHp, newFort)` e soma `delta = Math.max(0, newMaxHp - oldMaxHp)` ao `hp` atual (sem curar dano anterior).
- Todos os `unspentPoints` devem ser gastos (`totalUnspent === 0`, exceto no caso teórico de todos os atributos já estarem em `MAX_ATTRIBUTE`) antes de habilitar o botão **"Iniciar Fase N+1"**.
- Ao clicar em **"Iniciar Fase N+1"**, `currentStage` avança para `N + 1`, `status` muda para `'in_stage'`, grava-se o **novo checkpoint** da fase `N + 1` e salva-se no `localStorage`.

### 4.3 Checkpoint, Reinício e Persistência (`localStorage`)

- **Chave**: `CAMPAIGN_SAVE_KEY = 'rune_tactics_v4_save'`
- **Versão**: `CAMPAIGN_SAVE_VERSION = 4`
- **Momentos de gravação automática**:
  1. Ao iniciar uma Nova Campanha (checkpoint da Fase 1, `status: 'in_stage'`).
  2. Ao vencer uma fase 1..4 (estado já recuperado + pontos concedidos, `status: 'between_stages'`).
  3. A cada ponto alocado no Acampamento (mantém `status: 'between_stages'`).
  4. Ao confirmar avanço para a Fase `N+1` (novo `checkpoint` da Fase `N+1`, `status: 'in_stage'`).
  5. Ao vencer a Fase 5 (`status: 'completed'`).
- **Reiniciar fase**: disponível tanto na tela de Derrota quanto durante a batalha (botão "Reiniciar fase" no painel de partida quando em campanha). Restaura `heroes` a partir de `campaign.checkpoint.heroes` (atributos e HP de entrada na fase) e reinicia o `GameEngine` na mesma fase, descartando dano e mortes ocorridos na tentativa falha.
- **Nova campanha**: limpa `rune_tactics_v4_save` e começa a Fase 1 com os 4 heróis base e HP cheio.
- **Recarregamento da página**:
  - Se houver save válido com `status === 'in_stage'`, o botão **"Continuar Campanha"** retoma exatamente no **checkpoint do início da fase atual** (`currentStage`).
  - Se `status === 'between_stages'`, retoma diretamente na **tela de Acampamento/Evolução** antes da fase `currentStage + 1`, preservando `hp` recuperado e `unspentPoints`.
  - Se `status === 'completed'`, permite iniciar Nova Campanha ou visualizar conclusão.
- **Validação estrita ao carregar (`SaveSystem.ts`)**: rejeita JSON malformado, `version !== 4`, `currentStage` fora de `1..5`, ausência de qualquer um dos 4 heróis canônicos, atributos fora de `[MIN_ATTRIBUTE, MAX_ATTRIBUTE]`, ou `hp <= 0` / `hp > calcMaxHp(baseHp, fort)`, retornando `null` sem quebrar o jogo.
