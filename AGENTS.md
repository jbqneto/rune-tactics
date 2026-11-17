# Instruções para agentes

Rune Tactics é um jogo tático por turnos para navegador, em TypeScript com Three.js. Leia `docs/architecture.md`, `docs/game-design.md` e os documentos da V4 (`docs/attribute-system.md`, `docs/combat-system.md`, `docs/campaign-design.md`, `docs/enemy-design.md`, `docs/balance-config.md`) antes de escrever código.

## Escopo

A **V4 — The Ashen Campaign** está implementada sobre a base V2.2/V2.3:
- **Base tática (V2.2 / V2.3)**: ativações individuais alternadas (`docs/turn-system.md`), cadáveres persistentes no chão, quatro classes de herói (`knight`, `archer`, `mage`, `cleric`), linha de visão, câmera orbital de 360°, seleção de células encobertas por personagens, orientação automática de aliados, `Arcane Burst` em área com projétil único, atalho `E`, opacidade da unidade ativa, `smartAttack` / `smartUseSkill`, `undoMove`, sorteio determinístico por semente e `MAPS` em `gameConfig.ts` (atualmente 8 mapas 12×12).
- **Sistemas da V4**:
  - Sistema de atributos (`STR`, `DEX`, `INT`, `FORT`) com teto `MAX_ATTRIBUTE = 12` e dano/cura centralizados (`AttributeSystem` + `CombatSystem`);
  - Postura defensiva unificada (`defend()`, atalho `G`, mitigação de 50% até a próxima ativação da unidade);
  - Quatro novos inimigos (`goblin-stalker`, `skeleton-shieldbearer`, `necromancer-acolyte`, chefe `ashen-guardian` em 2 fases) e habilidade inimiga `dark-mend`;
  - Ataques anunciados em área (`PendingAttack`) com telegráfe visual (`dangerCells`), cancelamento na morte do conjurador e resolução no início da próxima ativação;
  - Campanha de 5 fases (`CAMPAIGN_STAGES`), novos mapas `forgotten-swamp` (obstáculos `water` com `blocksLos: false` e `bridgeCells`) e `corrupted-sanctuary`, tela de Acampamento & Evolução, checkpoint de fase e persistência versionada (`CampaignSystem` + `SaveSystem`), isolados do modo **Batalha Rápida** (`quick-battle`).

Trabalho novo é correção, ajuste ou balanceamento dentro desse escopo, a menos que quem coordena peça outra coisa.

## Limites entre camadas

- `src/shared/`, `src/config/` e `src/game/` não importam Three.js nem acessam `window`, `document`, `localStorage` ou qualquer API de DOM.
- `src/rendering/`, `src/input/` e `src/ui/` não importam nada de `src/game/`. Eles usam o motor apenas pela interface `IGameEngine` e recebem callbacks/estado de campanha injetados por `src/main.ts`.
- Regras de jogo (dano, atributos, alcance, linha de visão, caminho, recarga, turno, IA, campanha, validação de save) ficam somente em `src/game/`. A interface pergunta ao motor/sistema de campanha; ela não recalcula.
- Números da partida (tamanho da grade, obstáculos, stats base das classes, atributos iniciais, habilidades, inimigos, fases da campanha, constantes de evolução/save) ficam somente em `src/config/gameConfig.ts`. Não os repita em outro arquivo.

## Contratos

`src/shared/types.ts` é o contrato entre o motor e a interface. Quem implementa um dos lados não o altera por conta própria: se o contrato não atende, pare e avise quem coordena, porque a mudança afeta o outro lado.

## Câmera, seleção e orientação

- Só `SceneManager` move a câmera. `InputManager` detecta o gesto e emite um callback; `main.ts` faz a ligação.
- O azimute da câmera é estado de vista. Ele não vai para o motor nem para o snapshot, e `reset()` não o altera.
- A rotação da câmera vale em qualquer estado de turno e durante animações. Hover e clique no tabuleiro continuam bloqueados fora da vez do jogador.
- Clique direito parado cancela o modo de ataque ou habilidade; arraste com o botão direito gira a câmera. Um gesto novo não pode quebrar um dos dois.
- Hover e clique usam o mesmo resolvedor de seleção, para o destaque mostrar o que o clique vai escolher.
- Todo obstáculo interno bloqueia a seleção do que está atrás dele, inclusive caixote e barril. Personagens não bloqueiam a seleção do chão atrás deles.
- Objetos que entram no raycast levam uma marca explícita em `userData`. Não dependa da ausência de um campo para classificar um acerto.
- Nada no cenário pode pressupor a vista inicial: uma peça alta fora do tabuleiro precisa ser escondida quando fica entre a câmera e as células.
- A orientação das unidades é só apresentação e fica no renderer (`facingY`). `syncUnits` não zera a rotação. Se uma regra passar a depender de orientação, ela vai para o motor e para o contrato.
- Lógica de interface que não precisa de Three.js nem do DOM (órbita, resolvedor de seleção, orientação) fica em módulo próprio, sem essas importações, com teste em `tests/`.

## Regras da V2.3 (Batalha Rápida e Motor)

- **Sorteio só com semente.** O motor não usa `Math.random` nas regras. Mapa e posições iniciais saem do gerador com semente de `src/game/maps/MapSystem.ts`, e a mesma semente repete a batalha.
- **Teste que usa a batalha padrão fixa a semente.** Teste de regra monta o cenário com posições explícitas (`randomizeSpawns` desabilitado automaticamente quando `units` é informado), que não passam pelo sorteio.
- **Mapas ficam em `MAPS`, em `gameConfig.ts`.** Todo mapa é 12×12, não tem obstáculo nas linhas de nascimento e tem todas as células livres ligadas (verificado por BFS). Um mapa novo entra com o teste dessas restrições. Obstáculos `'water'` têm `blocksLos: false`.
- **Ação inteligente é atômica e fica no motor.** `smartAttack` e `smartUseSkill` andam e agem, ou não fazem nada. A interface não escolhe a célula nem calcula caminho: ela mostra a prévia a partir de `getSmartAttackPlan` e `getSmartSkillPlan`.
- **Toda ação que anda e age em um clique tem prévia no hover**, igual ao que o clique vai executar.
- **Desfazer é decisão do motor.** A interface habilita o botão por `canUndoMove` e não guarda posição anterior por conta própria.
- **Os eventos de uma habilidade ou ataque anunciado são contíguos e chegam no mesmo lote**: `skillUsed` (ou `pendingAttackResolved`), depois o `unitAttacked` ou `unitHealed` de cada atingido, e depois `unitDied`/`bossPhaseChanged`. O renderer agrupa esses eventos em uma animação; não transforme cada evento em uma animação separada.
- **Atalho de teclado chama o mesmo caminho do botão.** Não duplique as travas de vez do jogador e de animação.
- **`reset()` pode trocar o mapa.** Quem trata `gameReset` ou troca de fase reconstrói o tabuleiro a partir do snapshot e libera geometrias e materiais antigos.
- **A unidade ativa vem de `activeUnitId`**, não de `selectedUnitId`, que é nulo na vez dos inimigos.

## Regras da V4

- **`AttributeSystem` (`src/game/attributes/AttributeSystem.ts`)**: única fonte das fórmulas puras (`offensiveBonus`, `calcMaxHp`, `fortitudeResistance`, `getAttributeForAttack`, `computeUnitDamage`, `computeUnitArmor`, `applyAttributePoint`). O escalonamento de dano e cura vem sempre do `attackKind` explícito (`'melee' -> str`, `'ranged' -> dex`, `'magic' -> int`, cura -> `int`) — nunca infira por `attackRange`. Ao evoluir `fort`, some ao `hp` atual apenas o incremento positivo de `maxHp` (nunca cure dano prévio). Respeite `[MIN_ATTRIBUTE, MAX_ATTRIBUTE]` (`1..12`).
- **Dano centralizado e `defend()` unificado (`src/game/combat/CombatSystem.ts`)**: todo dano (ataque básico, habilidade e `PendingAttack`) passa por `computeDamage` (`max(1, attackPower - totalDefense)`, reduzido por `Math.ceil(damageBeforeGuard * 0.5)` quando `isGuarding`), garantindo piso mínimo `1`. `defend()` apenas ativa `isGuarding = true` (sem escudo numérico), consome `hasAttacked`, funciona antes ou depois de mover e expira no início da próxima ativação da própria unidade.
- **`PendingAttack` e Chefe (`ashen-guardian`)**: `prepareAttack` cria um `PendingAttack` com `targetCells` fixas e emite `attackPrepared`. Se o conjurador morrer antes de sua próxima ativação, o motor remove seus ataques pendentes e emite `attackCancelled` (`reason: 'caster_died'`) imediatamente após `unitDied`. Se vivo no início da sua próxima ativação, `GameEngine` resolve seus `PendingAttack` (contra alvos vivos adversários) antes de `checkBattleEnd` e antes das novas ações do turno. `ashen-guardian` transiciona irreversivelmente para Fase 2 ao atingir `hp <= Math.floor(maxHp * 0.5)` sem restaurar HP, ganha `+1 moveRange` e emite `bossPhaseChanged`.
- **`CampaignSystem` (`src/game/campaign/CampaignSystem.ts`)**: gerencia as 5 fases de `CAMPAIGN_STAGES` mantendo o modo `quick-battle` isolado. Pós-vitória (Fases 1–4) aplica recuperação (`+35%` ceil vivos, revive `25%` ceil caídos) e concede `+1` ponto por herói antes do Acampamento; `advanceToNextStage()` exige `unspentPoints === 0` (exceto herói com todos os atributos em `MAX_ATTRIBUTE`) e grava novo `checkpoint`. `restartCurrentStage()` restaura exatamente `checkpoint.heroes`.
- **`SaveSystem` (`src/game/campaign/SaveSystem.ts`)**: usa sempre um `StorageAdapter` injetado (em navegador, `src/main.ts` injeta `window.localStorage`; nos testes Node, usa-se adapter em memória). Persiste sob `CAMPAIGN_SAVE_KEY` (`'rune_tactics_v4_save'`) com `version: 4` e validação estrita (`validateCampaignState`), devolvendo `null` em saves inválidos/corrompidos sem quebrar a inicialização. `quick-battle` nunca lê, altera ou apaga o save de campanha.

## Assets

- Os arquivos ficam em `public/assets/`, nas pastas `portraits/`, `icons/`, `models/` e `textures/`, e são referenciados pela raiz do site (`/assets/...`).
- O retrato de cada classe/inimigo e o ícone de cada habilidade são declarados em `gameConfig.ts` (`portraitPath` e `icon`). A interface lê esses campos em vez de montar o caminho.
- Um asset novo segue `docs/art-direction.md` e é registrado em `docs/asset-generation.md`.

## Convenções

- Coordenadas: `x` é a coluna e `y` é a linha, ambas de 0 a `gridSize - 1` (0 a 11).
- O motor é síncrono e sem temporizadores. Animações e esperas ficam na renderização.
- Uma ação inválida devolve `{ ok: false, reason }`, não altera o estado e não emite eventos.
- Mudança em regra do motor vem com teste em `tests/`. Rode `npm run typecheck`, `npm test` e `npm run build` antes de entregar.
- Cada agente cria e edita apenas os arquivos da tarefa que recebeu.
