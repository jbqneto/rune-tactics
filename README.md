# Rune Tactics

Jogo tático por turnos para navegador, em TypeScript com Three.js.

Na **V4 — The Ashen Campaign**, o jogo conta com dois modos separados: uma **Campanha** sequencial de 5 fases (com progressão de atributos, acampamento entre fases, checkpoint e persistência em `localStorage`) e o modo **Batalha Rápida** (partidas avulsas com sorteio de mapas e posições iniciais por semente).

## Novidades da V4

### Sistema de Atributos (`STR`, `DEX`, `INT`, `FORT`) e Dano Centralizado
- Toda unidade possui quatro atributos inteiros (piso `1`, teto `12`):
  - **`STR` (Força)**: escala ataques básicos e habilidades corpo a corpo (`melee`, como `Runic Strike` e o golpe básico do Clérigo).
  - **`DEX` (Destreza)**: escala ataques físicos e habilidades à distância (`ranged`, como `Marked Shot`).
  - **`INT` (Intelecto)**: escala ataques mágicos (`magic`, como `Arcane Burst`) e potência de cura (`Healing Light` / `Dark Mend`).
  - **`FORT` (Fortitude)**: aumenta o HP máximo (`+2` por ponto acima de 4, sem curar dano prévio ao evoluir) e concede resistência passiva à defesa (`+1 DEF` a cada 4 pontos acima de 4).
- Todo dano (ataque básico, habilidade ou ataque anunciado) passa por uma fórmula única com **piso mínimo de 1 de dano**: `max(1, attackPower - totalDefense)`.

### Postura Defensiva Unificada (`Defender`)
- A ação **Defender (`G`)** substitui o ataque/habilidade na ativação (podendo ser usada antes ou depois de mover) e ativa postura defensiva até o início da próxima ativação da própria unidade.
- Reduz todo dano recebido em **50%** (arredondado para cima, mantendo mínimo `1` de dano), inclusive contra **Ataques Anunciados**.

### Campanha de 5 Fases, Acampamento e Save
1. **Fase 1 — Posto Avançado** (`ruins`): 2 Goblin Scouts + 1 Melee Skeleton.
2. **Fase 2 — Pântano Esquecido** (`forgotten-swamp`): terreno pantanoso com obstáculos de água (`water`, bloqueiam movimento sem bloquear linha de visão) e 3 pontes estreitas; 2 Goblin Stalkers, 2 Goblin Scouts e 1 Skeleton Archer.
3. **Fase 3 — Fortaleza dos Ossos** (`fortress`): 2 Skeleton Shieldbearers, 2 Melee Skeletons, 1 Armored Skeleton e 1 Skeleton Archer.
4. **Fase 4 — Catacumbas Arcanas** (`catacombs`): 2 Armored Skeletons, 2 Cultist Mages e 2 Necromancer Acolytes.
5. **Fase 5 — Santuário Corrompido** (`corrupted-sanctuary`): **Guardião das Cinzas** (Chefe), 1 Skeleton Shieldbearer e 1 Necromancer Acolyte.

- **Recuperação e Evolução entre Fases (Fases 1–4)**: heróis sobreviventes recuperam `+35%` do `maxHp` (ceil), heróis caídos revivem com `25%` do `maxHp` (ceil), e cada herói recebe `+1` ponto de atributo para distribuir na tela de **Acampamento & Evolução**.
- **Checkpoint e Persistência**: o progresso da campanha é salvo automaticamente em `localStorage` sob a chave `rune_tactics_v4_save` (versão `4`). Em caso de derrota ou reinício em campanha, o botão **Reiniciar fase (Checkpoint)** restaura exatamente o estado de entrada da fase atual.
- **Batalha Rápida**: sorteia um dos 8 mapas de `MAPS` sem repetição consecutiva e posições iniciais com semente (`seed`), sem ler nem alterar o save da campanha.

### Novos Inimigos e Chefe em 2 Fases
- **Goblin Stalker (`goblin-stalker`)**: alta mobilidade (`4` células), prioriza abater os heróis mais frágeis.
- **Skeleton Shieldbearer (`skeleton-shieldbearer`)**: defensivo, entra em postura **Defender (`-50%` dano)** quando cercado ou com HP `<= 50%`.
- **Necromancer Acolyte (`necromancer-acolyte`)**: conjurador à distância com `Dark Mend` (cura aliados feridos, priorizando o chefe).
- **Guardião das Cinzas (`ashen-guardian`)**: chefe com `28 HP`, `5 ATK` e `2 DEF` que utiliza **Ataques Anunciados (`PendingAttack`)** com telegráfe de células perigosas no tabuleiro:
  - **Fase 1**: prepara `Golpe das Cinzas` (cruz, poder base `4`), resolvido no início da sua próxima ativação (ou cancelado imediatamente se o chefe morrer antes).
  - **Fase 2 (`<= 50%` HP — Fúria das Cinzas)**: transição irreversível sem restaurar HP, ganha `+1` de movimento (`2 -> 3`) e passa a preparar `Erupção das Cinzas` (área `3×3`, poder base `5`).

## Como jogar e controles

- **Seletor de Modo**: ao abrir o jogo, escolha **Nova Campanha**, **Continuar Campanha** (quando houver save válido) ou **Batalha Rápida**.
- **Ordem de ativação alternada**: cada unidade viva age uma vez por rodada, alternando entre os times conforme a fila fixa exibida no topo do HUD.
- **Clique esquerdo**:
  - Em modo padrão: clique em célula alcançável para mover, ou clique em um inimigo para **ataque inteligente** (move até o melhor alcance válido e ataca automaticamente).
  - Em modo de ataque/habilidade: clique no alvo ou célula válida (com prévia de caminho e área no hover).
- **Botão direito + arrastar**: girar a câmera 360° ao redor da arena.
- **Botão direito (clique parado)**: cancelar modo de ataque ou habilidade.
- **Atalho `G` ou botão `Defender (G)`**: assumir postura defensiva (`-50%` de dano até a próxima ativação).
- **Atalho `E` ou botão `Encerrar turno (E)`**: encerrar a ativação atual.
- **Botão `Desfazer movimento`**: desfaz o último deslocamento manual na ativação atual antes de atacar, defender ou usar habilidade.
- **Botões `Reiniciar` / `Menu`**: reinicia a fase pelo checkpoint (em Campanha) / sorteia novo mapa (em Batalha Rápida) ou retorna ao seletor de modo.

As regras completas estão em [docs/game-design.md](docs/game-design.md), [docs/campaign-design.md](docs/campaign-design.md) e [docs/turn-system.md](docs/turn-system.md).

## Estado

A **V4 — The Ashen Campaign** está implementada e jogável no navegador com `npm run dev`, com cobertura de testes automatizados do motor, campanha, atributos, inimigos/chefe e simulação de balanceamento em `tests/`.

## Comandos

```
npm install
npm run dev        servidor de desenvolvimento
npm run typecheck  checagem de tipos
npm test           testes (Vitest)
npm run build      checagem de tipos e build de produção
```

## Estrutura

```
src/shared/types.ts              contratos entre o motor e a interface
src/config/gameConfig.ts         grade, 8 mapas, stats, atributos, habilidades, inimigos e 5 fases
src/game/attributes/             fórmulas puras de atributos e evolução (AttributeSystem)
src/game/campaign/               máquina de estado da campanha e persistência (CampaignSystem, SaveSystem)
src/game/combat/                 cálculo centralizado de dano, cura, Defender e PendingAttack
src/game/ai/                     IA determinística dos inimigos e chefe em 2 fases
src/game/                        motor principal, grade, mapas, turnos e fábrica de unidades
src/rendering/                   cena Three.js: arena, água/pontes, telegráfe, modelos e animações
src/input/                       mouse, seleção 3D e modos de ação
src/ui/                          HUD de batalha, seletor de modo e tela de acampamento
public/assets/                   modelos, retratos, ícones e texturas
tests/                           testes unitários e simulação de balanceamento (Vitest)
docs/                            documentação de design, arquitetura e implementação
```

## Documentação

- [Game design](docs/game-design.md): regras gerais, classes, habilidades e inimigos
- [Sistema de atributos](docs/attribute-system.md): `STR`, `DEX`, `INT`, `FORT` e fórmulas
- [Sistema de combate](docs/combat-system.md): dano centralizado, `Defender` e `PendingAttack`
- [Design da campanha](docs/campaign-design.md): 5 fases, mapas novos, recuperação e `SaveSystem`
- [Design de inimigos](docs/enemy-design.md): comportamento determinístico e chefe `Guardião das Cinzas`
- [Tabela de balanceamento](docs/balance-config.md): parâmetros base e curva de progressão
- [Arquitetura](docs/architecture.md): camadas, contratos e fluxo de eventos
- [Direção de arte](docs/art-direction.md) e [geração de assets](docs/asset-generation.md)
- [Instruções para agentes](AGENTS.md)
