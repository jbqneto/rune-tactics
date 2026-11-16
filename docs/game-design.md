# Game design

Este documento descreve as regras da V2.2, a versão atual. Os números vêm de `src/config/gameConfig.ts`; se houver diferença, vale o arquivo de config. O sistema de ativações alternadas está detalhado em `docs/turn-system.md`.

## Visão geral

Quatro heróis enfrentam seis inimigos de cinco tipos distintos em uma arena medieval de 12×12 células. Os times alternam **ativações individuais**: uma unidade age por vez (movimento e ataque/habilidade, em qualquer ordem), uma vez por rodada. Vence quem eliminar o outro lado.

## Tabuleiro e obstáculos

- Grade de 12×12 células. As colunas vão de A a L (`x` 0..11) e as linhas de 1 a 12 (`y` 0..11).
- Uma célula comporta no máximo uma unidade **viva**. Cadáveres e células livres permitem passagem.
- Todo obstáculo bloqueia movimento. Só parede (`wall`) e pilar (`pillar`) bloqueiam a linha de visão.
- A arena possui uma muralha central na linha 7 (`y = 6`) com duas passagens (portão oeste em C7–D7 e passagem leste em I7), pilares de cobertura total e caixotes/barris como barreiras baixas (veja `OBSTACLES` em `src/config/gameConfig.ts`).

## Heróis

| Classe | HP | Movimento | Dano | Alcance | Habilidade | Posição inicial |
|---|---|---|---|---|---|---|
| Guerreiro (`knight`) | 10 | 3 | 2 | 1 | Runic Strike | E2 (`4,1`) |
| Arqueira (`archer`) | 8 | 3 | 2 | 3 | Marked Shot | C1 (`2,0`) |
| Mago (`mage`) | 7 | 2 | 1 | 2 | Arcane Burst | H1 (`7,0`) |
| Clérigo (`cleric`) | 9 | 2 | 2 | 1 | Healing Light | G2 (`6,1`) |

## Habilidades

| Habilidade | Alvo | Efeito | Alcance | Área | Recarga |
|---|---|---|---|---|---|
| Runic Strike | Inimigo | 3 de dano | 1 | um alvo | 2 rodadas |
| Marked Shot | Inimigo | 3 de dano | 3 | um alvo | 2 rodadas |
| Arcane Burst | Inimigo | 2 de dano | 3 | célula alvo + 4 ortogonalmente adjacentes | 3 rodadas |
| Healing Light | Aliado | Cura 3 HP (até `maxHp`) | 3 | um alvo (inclui o lançador) | 2 rodadas |

- A habilidade ocupa o lugar do ataque básico: cada herói faz um ou outro por ativação.
- Habilidades de dano ferem só inimigos; `Arcane Burst` não atinge aliados na área.
- `Healing Light` cura apenas aliados vivos com `HP < maxHp` (inclusive o próprio Clérigo) e não revive mortos.
- Habilidades com alcance acima de 1 exigem linha de visão até a célula alvo.
- Ao usar, a habilidade entra em recarga. A recarga cai 1 no início de cada nova rodada (quando todas as unidades vivas já ativaram).

## Inimigos

| Tipo | HP | Movimento | Dano | Alcance | Posição inicial |
|---|---|---|---|---|---|
| Goblin Scout (`goblin-scout`) | 4 | 4 | 1 | 1 | K10 (`10,9`) |
| Melee Skeleton (`melee-skeleton`) | 5 | 2 | 1 | 1 | D11 (`3,10`) e I11 (`8,10`) |
| Armored Skeleton (`armored-skeleton`) | 8 | 2 | 2 | 1 | F11 (`5,10`) |
| Skeleton Archer (`skeleton-archer`) | 4 | 2 | 1 | 3 | C12 (`2,11`) |
| Cultist Mage (`cultist-mage`) | 5 | 2 | 2 | 3 | G12 (`6,11`) |

Inimigos não têm habilidade.

## Turnos e ativações alternadas

- A partida começa em `awaiting_player_choice`, na rodada 1, com `knight-1` selecionado.
- Cada unidade viva tem direito a **1 ativação por rodada** (`hasActivatedThisRound`).
- Em `awaiting_player_choice`, o jogador escolhe qualquer aliado vivo elegível. Ao executar a primeira ação (mover, atacar ou usar habilidade), a unidade é travada (`player_unit_active`, `activationLocked = true`) até gastar movimento e ataque ou até o jogador encerrar a ativação (`endPlayerTurn()`).
- Ao encerrar uma ativação, a vez passa para a equipe adversária se ela tiver alguma unidade viva elegível; caso contrário, continua com a equipe que ainda tiver unidades elegíveis (sobra).
- Quando nenhuma unidade viva de ambos os times for elegível, inicia-se uma nova rodada (`round += 1`), todas as ações são restauradas e a recarga das habilidades cai em 1.

## Movimento, combate e cadáveres

- O movimento é ortogonal, sem diagonais. A unidade não atravessa obstáculos nem outras unidades vivas.
- O alcance de ataque é medido em distância de Manhattan; ataques com alcance acima de 1 exigem linha de visão (só `wall` e `pillar` bloqueiam LoS; unidades e cadáveres não).
- Quando o HP chega a 0, a unidade morre (`alive: false`, `hp: 0`), mas **permanece na lista e no grid como cadáver persistente** na célula onde caiu. Cadáveres não bloqueiam movimento nem LoS, são ignorados pelo agendador de turnos e não podem ser selecionados, atacados ou curados.

## IA dos inimigos

Todo inimigo vivo segue o fluxo: ataca se tiver alvo válido ao alcance; senão, move-se até `moveRange` passos em direção a uma posição de ataque (ou aproxima-se se não houver caminho de ataque).

| Tipo | Ao escolher o alvo | Ao andar |
|---|---|---|
| `melee-skeleton` | Bate no herói de menor HP ao alcance | Vai pelo caminho mais curto até o herói mais próximo |
| `armored-skeleton` | Bate no herói mais próximo | Entre células igualmente próximas, escolhe a que engaja mais heróis |
| `goblin-scout` | Bate no herói de menor HP ao alcance | Rápido (`moveRange: 4`), prioriza alcançar o herói vivo mais vulnerável (menor HP) |
| `skeleton-archer` | Atira no herói de menor HP ao alcance (LoS) | Busca célula com tiro (LoS), preferindo distância ≥ 2 dos heróis |
| `cultist-mage` | Dispara no herói de menor HP ao alcance (LoS) | Busca célula com tiro (LoS), preferindo distância ≥ 2 dos heróis |

## Fim da batalha

- Vitória: todos os inimigos morrem.
- Derrota: todos os heróis morrem.
- Vitória ou derrota têm prioridade imediata no golpe final: o turno não avança e nenhuma ativação adicional começa.
