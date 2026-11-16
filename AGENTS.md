# Instruções para agentes

Rune Tactics é um jogo tático por turnos para navegador, em TypeScript com Three.js. Leia `docs/architecture.md` e `docs/game-design.md` antes de escrever código.

## Escopo

A V2.2 está implementada: ativações individuais alternadas (`docs/turn-system.md`), cadáveres persistentes no chão, quatro classes de herói (Guerreiro, Arqueira, Mago e Clérigo), habilidades com recarga (incluindo `Healing Light`), linha de visão, cinco tipos de inimigos (`melee-skeleton`, `skeleton-archer`, `armored-skeleton`, `goblin-scout`, `cultist-mage`) e arena medieval 12×12. Trabalho novo é correção ou ajuste dentro desse escopo, a menos que quem coordena peça outra coisa.

Em planejamento, ainda não implementado: três melhorias de interface, chamadas pela coordenação de "V2.2 (interface)". São a rotação horizontal de 360° da câmera com botão direito + arraste, a seleção de células livres encobertas por personagens e a orientação automática dos aliados para o inimigo vivo mais próximo depois de andar. O diagnóstico e o desenho estão em `docs/architecture.md`, e as tarefas em `docs/implementation-plan.md`. Elas não alteram `src/game/`, `src/shared/types.ts` nem `src/config/`.

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
