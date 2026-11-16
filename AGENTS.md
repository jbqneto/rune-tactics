# Instruções para agentes

Rune Tactics é um jogo tático por turnos para navegador, em TypeScript com Three.js. Leia `docs/architecture.md` e `docs/game-design.md` antes de escrever código.

## Escopo

A V2.2 está implementada: ativações individuais alternadas (`docs/turn-system.md`), cadáveres persistentes no chão, quatro classes de herói (Guerreiro, Arqueira, Mago e Clérigo), habilidades com recarga (incluindo `Healing Light`), linha de visão, cinco tipos de inimigos (`melee-skeleton`, `skeleton-archer`, `armored-skeleton`, `goblin-scout`, `cultist-mage`) e arena medieval 12×12. Trabalho novo é correção ou ajuste dentro desse escopo, a menos que quem coordena peça outra coisa.

Em planejamento, ainda não implementado: três melhorias de interface, chamadas pela coordenação de "V2.2 (interface)". São a rotação horizontal de 360° da câmera com botão direito + arraste, a seleção de células livres encobertas por personagens e a orientação automática dos aliados para o inimigo vivo mais próximo depois de andar. O diagnóstico e o desenho estão em `docs/architecture.md`, e as tarefas em `docs/implementation-plan.md`. Elas não alteram `src/game/`, `src/shared/types.ts` nem `src/config/`.

Em andamento: a V2.3, com sete melhorias. São o Arcane Burst com um projétil e uma explosão, o atalho `E` para encerrar o turno, a opacidade da unidade ativa, o ataque inteligente, o desfazer movimento, as posições iniciais sorteadas com semente e três mapas sorteados sem repetição consecutiva. Só os contratos em `src/shared/types.ts` já foram alterados, então `npm run typecheck` falha em `GameEngine.ts` e `main.ts` até a tarefa M0 do plano ser feita. O desenho está em `docs/architecture.md`, as regras em `docs/game-design.md` e as tarefas em `docs/implementation-plan.md`.

A V3 e a V4 estão descritas em `docs/roadmap.md` só como plano. Não implemente nada delas nem prepare o código para elas sem um pedido explícito.

## Limites entre camadas

- `src/shared/`, `src/config/` e `src/game/` não importam Three.js nem acessam o DOM.
- `src/rendering/`, `src/input/` e `src/ui/` não importam nada de `src/game/`. Eles usam o motor apenas pela interface `IGameEngine`.
- Regras de jogo (dano, alcance, linha de visão, caminho, recarga, turno, IA) ficam somente em `src/game/`. A interface pergunta ao motor; ela não recalcula.
- Números da partida (tamanho da grade, obstáculos, stats das classes, habilidades, posições) ficam somente em `src/config/gameConfig.ts`. Não os repita em outro arquivo.

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

## Regras da V2.3

- **Sorteio só com semente.** O motor não usa `Math.random` nas regras. Mapa e posições iniciais saem do gerador com semente de `src/game/`, e a mesma semente repete a batalha. A ordem em que o gerador é consumido (mapa, heróis, inimigos) não muda sem atualizar os testes.
- **Teste que usa a batalha padrão fixa a semente.** Teste de regra monta o cenário com posições explícitas, que não passam pelo sorteio.
- **Mapas ficam em `MAPS`, em `gameConfig.ts`.** Todo mapa é 12×12, não tem obstáculo nas linhas de nascimento e tem todas as células livres ligadas. Um mapa novo entra com o teste dessas restrições.
- **Ação inteligente é atômica e fica no motor.** `smartAttack` e `smartUseSkill` andam e agem, ou não fazem nada. A interface não escolhe a célula nem calcula caminho: ela mostra a prévia a partir de `getSmartAttackPlan` e `getSmartSkillPlan`.
- **Toda ação que anda e age em um clique tem prévia no hover**, igual ao que o clique vai executar.
- **Desfazer é decisão do motor.** A interface habilita o botão por `canUndoMove` e não guarda posição anterior por conta própria.
- **Os eventos de uma habilidade são contíguos e chegam no mesmo lote**: `skillUsed`, depois o `unitAttacked` ou `unitHealed` de cada atingido. O renderer agrupa esses eventos em uma animação; não transforme cada evento de habilidade em uma animação separada.
- **Atalho de teclado chama o mesmo caminho do botão.** Não duplique as travas de vez do jogador e de animação.
- **`reset()` pode trocar o mapa.** Quem trata `gameReset` reconstrói o tabuleiro a partir do snapshot e libera geometrias e materiais antigos.
- **A unidade ativa vem de `activeUnitId`**, não de `selectedUnitId`, que é nulo na vez dos inimigos.

## Assets

- Os arquivos ficam em `public/assets/`, nas pastas `portraits/`, `icons/` e `textures/`, e são referenciados pela raiz do site (`/assets/...`).
- O retrato de cada classe e o ícone de cada habilidade são declarados em `gameConfig.ts` (`portraitPath` e `icon`). A interface lê esses campos em vez de montar o caminho.
- Um asset novo segue `docs/art-direction.md` e é registrado em `docs/asset-generation.md`.

## Convenções

- Coordenadas: `x` é a coluna e `y` é a linha, ambas de 0 a `gridSize - 1` (0 a 11 na V2.2).
- O motor é síncrono e sem temporizadores. Animações e esperas ficam na renderização.
- Uma ação inválida devolve `{ ok: false, reason }`, não altera o estado e não emite eventos.
- Mudança em regra do motor vem com teste em `tests/`. Rode `npm run typecheck` e `npm test` antes de entregar.
- Cada agente cria e edita apenas os arquivos da tarefa que recebeu.
