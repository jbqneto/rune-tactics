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

## V2.3 (planejada, ainda não implementada)

As regras abaixo descrevem a V2.3. Só os contratos em `src/shared/types.ts` existem; o motor e a interface ainda seguem as seções acima. O desenho técnico está em `docs/architecture.md` e as tarefas em `docs/implementation-plan.md`.

Quando a V2.3 for implementada, duas partes das seções acima deixam de valer: as posições iniciais fixas das tabelas de heróis e inimigos, e a muralha central como único traçado da arena.

### Ataque inteligente

- Clicar em um inimigo ataca de onde o herói está, se o alvo já está ao alcance e, para ataque à distância, com linha de visão. O movimento não é gasto.
- Se o alvo está fora de alcance e o herói ainda não se moveu, ele anda sozinho até uma célula de onde o ataque vale e ataca em seguida.
- A célula escolhida é a de menor custo de movimento. No empate, a mais próxima do alvo. Persistindo o empate, a de menor linha e depois a de menor coluna.
- Se nenhuma célula ao alcance do movimento serve, nada acontece.
- Antes do clique, o jogo mostra o caminho e a célula de destino.
- O movimento feito por um ataque inteligente não pode ser desfeito, porque o ataque já aconteceu.
- Movimento e ataque gastos encerram a ativação, como sempre.
- A mesma regra vale para as habilidades: o herói anda até a célula mais barata de onde a célula alvo passa a ser válida e lança.

### Desfazer movimento

- Depois de mover um herói, o jogador pode desfazer o movimento: o herói volta à célula de origem e pode se mover de novo.
- Só vale uma vez por ativação. O movimento feito depois de desfazer é definitivo.
- Só vale enquanto o herói não atacou nem usou habilidade depois de se mover.
- Desfazer não encerra a ativação e não gasta o ataque.

### Encerrar o turno pelo teclado

- A tecla `E` encerra a ativação do herói ativo, como o botão "Encerrar turno (E)".
- Ela não faz nada na vez dos inimigos, durante animações nem depois do fim da batalha.

### Destaque da unidade ativa

- A unidade que está agindo aparece com opacidade total. As outras unidades vivas, dos dois times, aparecem a 75%.
- Depois do fim da batalha, todas as unidades vivas voltam à opacidade total.

### Arcane Burst na tela

- O mago dispara um único projétil até a célula alvo.
- No impacto, uma explosão cobre a célula alvo e as quatro adjacentes.
- Todos os inimigos atingidos recebem o dano ao mesmo tempo.
- A regra não muda: 2 de dano, alcance 3, área em cruz, sem ferir aliados.

### Posições iniciais sorteadas

- Os heróis nascem em células sorteadas das duas linhas do sul (linhas 1 e 2). Os inimigos, nas duas linhas do norte (linhas 11 e 12).
- Nenhuma unidade nasce em obstáculo nem na célula de outra.
- O sorteio usa uma semente. A mesma semente repete o mesmo mapa e as mesmas posições, o que serve para testes e para reproduzir um problema.
- A ordem de turno não depende da posição.

### Mapas

- Há três mapas, todos de 12×12. A cada batalha nova o jogo sorteia um, nunca o mesmo da batalha anterior.
- Em todos, as duas linhas do sul e as duas do norte não têm obstáculos, e toda célula livre é alcançável.
- O nome do mapa aparece no HUD.

Legenda dos traçados: `#` parede e `O` pilar (bloqueiam movimento e visão); `c` caixote e `b` barril (bloqueiam só o movimento). A linha 12 está no topo e a coluna A à esquerda.

**Ruínas Atuais** (`ruinas-atuais`). É o mapa da V2.2: uma muralha central com um portão largo a oeste e uma passagem estreita a leste.

```
12  . . . . . . . . . . . .
11  . . . . . . . . . . . .
10  . . . O . . c . O . . .
 9  . b . . . . . . . . c .
 8  . . . . . . . . . . . .
 7  # # . . # # # # . # # #
 6  . . . . . . . . . . . .
 5  . . . . . c c . . . . .
 4  . . . O . . . . O . . .
 3  . . . . . . . . . . b .
 2  . . . . . . . . . . . .
 1  . . . . . . . . . . . .
    A B C D E F G H I J K L
```

**Fortaleza Abandonada** (`fortaleza-abandonada`). Um corredor central largo entre duas alas muradas. As alas dão cobertura total, mas só se entra nelas pelo corredor. Dois pilares dividem o centro.

```
12  . . . . . . . . . . . .
11  . . . . . . . . . . . .
10  . . # # . . . . # # . .
 9  . . . . . . . . . . . .
 8  # # # . . . . . . # # #
 7  . . . . c . . c . . . .
 6  . . . . . O O . . . . .
 5  # # # . . . . . . # # #
 4  . . . . b . . b . . . .
 3  . . # # . . . . # # . .
 2  . . . . . . . . . . . .
 1  . . . . . . . . . . . .
    A B C D E F G H I J K L
```

**Pátio das Ruínas** (`patio-das-ruinas`). Um pátio aberto, com trechos de muro e pilares espalhados. Há muitas rotas e pouca cobertura contínua, o que favorece ataques à distância e flanqueio.

```
12  . . . . . . . . . . . .
11  . . . . . . . . . . . .
10  . O . . . c . . . . O .
 9  . . . . . . . . # . . .
 8  . . . # # . . . # . . .
 7  . . . . . . O . . . . b
 6  b . . . . O . . . . . .
 5  . . . # . . . # # . . .
 4  . . . # . . . . . . . .
 3  . O . . . . c . . . O .
 2  . . . . . . . . . . . .
 1  . . . . . . . . . . . .
    A B C D E F G H I J K L
```

Os dois traçados novos são propostas. Foram conferidos por script: nenhum obstáculo nas linhas de nascimento e todas as células livres ligadas entre si. O equilíbrio de cada mapa ainda precisa ser medido em partidas simuladas.
