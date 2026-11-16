# Arquitetura atual e migração V2.1

## Escopo e status

Diagnóstico por leitura dos arquivos no início da tarefa e execução de typecheck/testes. Outros agentes alteraram código e testes simultaneamente durante a documentação; referências ao comportamento da base abaixo descrevem a leitura inicial e precisam ser revalidadas após integração. A V2.1 deste brief é uma especificação de correção: ordem fixa, morte visual diferenciada por equipe e quadrados de alcance. Não é uma afirmação de que essas mudanças já existem.

A base se apresenta como V2.2 em `AGENTS.md` e `game-design.md`, mas ainda permite escolha manual de aliado e cadáveres de ambos os times. Esses comportamentos conflitam com o brief; a migração segue o pedido explícito sem introduzir funcionalidades V3/V4. `turn-system.md` detalha o alvo; `implementation-plan.md` organiza sua implementação. A observação antiga de que o motor ainda agia por time inteiro era incorreta: ativações individuais já estão implementadas.

## Camadas e dependências

| Camada | Responsabilidade | Dependências permitidas |
|---|---|---|
| `src/shared/` | Tipos, snapshots, comandos e eventos | Nenhuma dependência de runtime |
| `src/config/` | Grade, obstáculos, stats, habilidades, spawns e futura ordem fixa | `shared` |
| `src/game/` | Regras síncronas sem DOM/Three.js | `shared`, `config` |
| `src/rendering/` | Cena Three.js, animações, unidades e quadrados | `shared`, Three.js; configuração visual aprovada |
| `src/input/` | Raycast, mouse e modo de interação | `shared`, `rendering`, Three.js |
| `src/ui/` | HUD, botões, retratos e feedback | `shared`, `config`, `input` |
| `src/main.ts` | Composição, consumo de eventos e condução temporal da IA | Todas as camadas |

Renderização, input e UI não importam `src/game/`; recebem apenas `IGameEngine`. Dano, movimento, alcance, LoS, recarga e agendamento pertencem ao motor. Os números de partida ficam em `gameConfig.ts`, sem cópias no HUD.

### Módulos existentes

- `GameEngine.ts`: fachada, validação, cópia do snapshot, seleção e fila de eventos.
- `turns/TurnSystem.ts`: elegibilidade, ativações individuais alternadas, rodada, recarga e fim de batalha; ainda não possui cursor de ordem fixa.
- `grid/GridSystem.ts`: limites, obstáculos, ocupação dos vivos, Manhattan, BFS e LoS.
- `combat/CombatSystem.ts`: ataques, alvos/áreas de habilidades, cura e morte.
- `ai/EnemyAI.ts`: decisão de um passo, sem mutar estado.
- `entities/UnitFactory.ts`: unidades a partir da configuração.
- `BoardRenderer.ts`: tabuleiro e camadas de destaque.
- `UnitRenderer.ts`: modelos, barras de HP, animações e sincronização dos vivos/mortos.
- `HudManager.ts` e `InputManager.ts`: seleção, comandos e apresentação.

## Fluxo de ação preservado

1. Input/HUD solicita uma ação ao `IGameEngine`.
2. O motor valida antes de mutar. Ação recusada retorna `{ ok: false, reason }`, sem eventos.
3. Ação aceita aplica estado imediatamente e acumula fatos em `GameEvent[]`.
4. `main.ts` consome os eventos, enfileira animações e sincroniza o snapshot; a interface bloqueia controles durante animação.
5. A interface conduz a IA por `executeNextEnemyAction()` enquanto `turnState === 'enemy_activation'`, não pelo booleano retornado isoladamente.

O snapshot é uma cópia; eventos não comandam regras. `path` inclui origem e destino. `obstacleDefs` traz tipo/LoS; `obstacles` replica posições por compatibilidade. Coordenadas são coluna `x`, linha `y`, ambas 0 até `gridSize - 1`; só rendering converte para 3D.

## Diagnóstico com evidências

### 1. Escolha manual de aliado e ordem não fixa

- `TurnSystem.ts:8` e `:31–50`: início/reset em `awaiting_player_choice`, ativa nula até a primeira ação.
- `GameEngine.ts:67–82`: `selectUnit` aceita qualquer aliado vivo quando não há trava.
- `GameEngine.ts:273–276`: trava começa na primeira ação válida, não no início da vez.
- `TurnSystem.ts:70–90`: próximo time é decidido por elegibilidade; não existe `turnOrder/currentIndex`.
- `GameEngine.ts:190–192`: inimigo é o primeiro elegível da lista de unidades.
- `gameConfig.ts:224–235`: spawns agrupam heróis antes dos inimigos; não são a ordem intercalada exigida.
- `InputManager.ts:168–171`, `:244–248` e `HudManager.ts:193–195`: permitem trocar aliado antes da trava, seguindo o contrato antigo.

Não é apenas erro visual: motor, contrato e UI concordam entre si, mas não com o alvo V2.1. A correção precisa fixar a ativa antes do primeiro clique e validar identidade ativa em todo comando/consulta operacional. A checagem atual `canUnitActNow` (`GameEngine.ts:254–259`) valida elegibilidade e trava, mas não fase/equipe quando destravado; revisar também consultas com `unitId` explícito durante vez inimiga e estado terminal.

### 2. Morte sem distinção por equipe

- `UnitRenderer.ts:126–141`: sincronização define `root.visible = true` e deita todo morto, sem condição de equipe.
- `UnitRenderer.ts:239–245`: `unitDied` produz a mesma animação `die` para qualquer unidade.
- `HudManager.ts:200–206`: rótulos atuais são `Caído`, `Ativo`, `Ativado`, `Pronto`; não os quatro estados pedidos.

Inimigos mortos visíveis são comportamento explícito da base, não evidência de `alive` incorreto no motor. Aliados mortos já são deitados e perdem anel/HP; não afirmar que estão sempre visualmente idênticos aos vivos. O problema confirmado é a ausência de política visual por equipe e a nomenclatura/status de ativação divergentes. Legibilidade em câmera real ainda requer QA visual.

Alvo: aliado morto permanece deitado na posição da queda, sem barra/anel/hitbox operacional; inimigo desaparece ao concluir a animação e continua invisível nos próximos `syncUnits`. Ambos permanecem em `units` e na ordem original para integridade lógica, sem bloquear movimento/LoS ou receber cura/ataque. Não filtrar inimigos mortos do estado para resolver apresentação. Reset deve restaurar pose, escala, visibilidade, HP e hitboxes; sincronização inicial de snapshot já morto deve aplicar a mesma política sem depender de `unitDied` recente.

### 3. Não há quadrados de alcance básico em células vazias

- `types.ts:168–172` e `GameEngine.ts:95–99`: `getAttackableTargets` retorna unidades, não região.
- `main.ts:113–127`: alimenta `attackable` apenas com posições dos alvos existentes.
- `BoardRenderer.ts:4–11` e `:373–379`: desenha essa lista; não calcula nem recebe alcance completo.

Logo, o material vermelho já existe; faltam consulta de células e ligação dessa consulta à renderização. Não resolver duplicando Manhattan/LoS no renderer.

## Contratos-alvo a aprovar antes do código

`shared/types.ts` é compartilhado: t16 revisa e a coordenação aprova; t18 integra alterações do contrato do motor, t1b consome. Os nomes abaixo são propostas explícitas, não APIs já disponíveis.

### Agendamento e seleção

- Ordem fixa em configuração; `TurnScheduler` com `turnOrder`, `currentIndex`, `round`, `activeUnitId`, `hasMoved`, `hasAttacked`, conforme `turn-system.md`.
- Snapshot pode expor cópias de `turnOrder/currentIndex` se a UI precisar; não expor arrays mutáveis internos. Não tornar essa extensão obrigatória sem necessidade aprovada.
- `activeUnitId` é definido desde a abertura da ativação. `activationLocked` é verdadeiro durante toda ativação aliada. `awaiting_player_choice` deixa de ser estado operacional; remover ou manter só por compatibilidade requer atualização conjunta dos comentários e consumidores.
- `selectedUnitId` acompanha a ativa para comandos. Inspeção opcional deve ficar separada e nunca autorizar ações da unidade inspecionada.
- `activationStarted` passa a ocorrer na abertura da vez, inclusive início/reset, não na primeira ação. Evitar duplicação em `endPlayerTurn` e `ensurePlayerActivationStarted`.

### Consultas de alcance e GRID_HIGHLIGHTS

Proposta: `getAttackRangeCells(unitId?: string): GridCoord[]` em `IGameEngine`, separada de `getAttackableTargets`.

Contrato recomendado para aprovação:

- Consulta operacional pura, sem mutação/eventos; ID omitido usa a ativa aliada. Retorna vazio para ID inexistente, morto, não ativo, fase não aliada/terminal ou ataque já consumido.
- Retorna células dentro da grade, distintas da origem, com distância Manhattan de 1 até `attackRange` e LoS quando alcance > 1.
- Exclui células de obstáculos, inclusive obstáculos baixos; obstáculos baixos não impedem destacar células além deles. Não exige célula vazia: aliados, inimigos e cadáveres podem estar na região, sem virarem automaticamente alvos válidos.
- `getAttackableTargets` continua filtrando inimigos vivos atacáveis. Preservar distinção entre região informativa e autorização de ataque.
- Habilidades continuam usando `getSkillTargetCells` e `getSkillAreaCells`; não substituir sua semântica por alcance básico.

`GRID_HIGHLIGHTS` ainda não existe na base: é proposta de configuração visual centralizada em `gameConfig.ts`, com cores/opacidades de movimento, alcance de ataque, alvo atacável, habilidade, cura, área e hover. Não guardar Three.js/DOM na config. `BoardHighlights` deve receber um campo de células de alcance separado de `attackable`; `main.ts` consulta o motor e repassa ambos. Proposta visual: alcance discreto abaixo do alvo atacável, habilidade/área e hover com prioridade explícita e sem z-fighting; cores finais são responsabilidade de t1b.

Ao trocar modo, ativa, rodada, reset ou terminar animação, limpar destaques obsoletos e recomputar por consulta. Não deixar a região da unidade anterior habilitar cliques.

### Estados da interface

Derivar do snapshot, nesta prioridade, sem novo estado gravável no HUD:

| Estado | Regra |
|---|---|
| `DERROTADO` | `!unit.alive`, independentemente de flags anteriores |
| `EM TURNO` | Unidade viva cujo ID é `activeUnitId` |
| `CONCLUÍDO` | Viva, não ativa e `hasActivatedThisRound` |
| `AGUARDANDO` | Viva, não ativa e ainda não processada na rodada |

Aplicar a heróis e lista inimiga quando pertinente. Estado final da batalha é separado desses rótulos. Botões dependem da ativa, flags, recarga, fase e bloqueio de animação, nunca apenas de seleção/elegibilidade. Clique em outro aliado não muda quem age.

### Eventos preservados

Manter `unitMoved`, `skillUsed`, `unitAttacked`, `unitHealed`, `unitDied`, `activationStarted`, `activationEnded`, `roundStarted`, `turnChanged`, `battleEnded`, `gameReset`. Dano fatal emite ataque e morte; golpe final encerra em `battleEnded` antes de qualquer avanço. Mortos pulados não emitem ativação. Inimigos consecutivos precisam de `activationStarted` mesmo sem mudança de `phase`.

## Migração e verificação

1. Aprovar diferenças de contrato e a política de cenários customizados, sem inferir ordem a partir de cliques.
2. t18 implementa configuração/agendador e testes; depois consultas de alcance e sua validação.
3. t1b adapta input, HUD, morte visual, `BoardHighlights` e composição em `main.ts`; a integração deste arquivo tem um único responsável.
4. t16 revisa identidade ativa, fontes de verdade, eventos, limites de camadas e casos de morte/virada.
5. t1c reconcilia documentação com a entrega efetivamente verificada, inclusive divergências de versão em arquivos fora deste escopo mediante autorização.

Baseline executada nesta análise: `npm run typecheck` passou; `npm test` passou com 113 testes em 4 arquivos. Isso valida a base, não os requisitos novos: os testes atuais inclusive exigem escolha livre (`tests/engine.test.ts:83`) e precisam ser migrados com equivalentes de ordem fixa. Na verificação final, com edições concorrentes em src/tests, typecheck passou, mas a suíte retornou 101 aprovados e 12 falhas em `engine.test.ts`, envolvendo expectativas antigas de estado inicial, seleção e eventos. Os próprios arquivos mudaram durante a execução; é necessária nova validação integrada por t18/t16 quando estabilizados. Este agente editou somente os três documentos. Não houve QA de navegador nesta tarefa documental. O diretório não é um repositório Git, portanto não há diff/status Git local disponível.

Assets permanecem em `public/assets/`, referenciados por retratos/ícones da configuração. Nenhum asset novo é necessário para esta migração; regras de arte continuam em `art-direction.md` e registro em `asset-generation.md`.

# V2.2 (interface): câmera orbital, seleção sob personagens e orientação

## Escopo e status

Esta seção é um diagnóstico e um desenho técnico; nada dela está implementado. Ela foi escrita a partir da leitura de `SceneManager.ts`, `InputManager.ts`, `UnitRenderer.ts`, `BoardRenderer.ts` e `main.ts`, sem rodar o jogo no navegador. As linhas citadas valem para os arquivos no momento da leitura.

Os três objetivos são só de interface. O motor (`src/game/`), os contratos (`src/shared/types.ts`) e a config não mudam, então os testes do motor não são afetados. O plano de tarefas está em `implementation-plan.md`.

| Objetivo | Arquivos afetados |
|---|---|
| 1. Rotação horizontal de 360° da câmera com botão direito + arraste | `SceneManager.ts`, `InputManager.ts`, `BoardRenderer.ts`, `main.ts` |
| 2. Selecionar células livres encobertas por personagens, sem atravessar obstáculos sólidos | `InputManager.ts`, `BoardRenderer.ts` |
| 3. Aliados se viram para o inimigo vivo mais próximo depois de andar | `UnitRenderer.ts` |

## Objetivo 1: rotação da câmera

### Diagnóstico

- **A câmera é fixa.** `SceneManager.ts:33-34` posiciona a câmera ortográfica em `(17, 18.5, 17)` olhando para `(0, 0.25, 0)` e nunca mais a move. Isso equivale a um azimute de 45°, uma elevação de cerca de 37° e uma distância horizontal de `17·√2 ≈ 24`. Não existe estado de órbita.
- **O botão direito já tem uso.** `InputManager.ts:59-66` trata `contextmenu` como "cancelar o modo de ataque ou habilidade". `onPointerDown` ignora qualquer botão que não seja o esquerdo (`:184`). Um arraste com o botão direito hoje dispara o cancelamento ao soltar.
- **O cenário foi montado para uma única vista.** `BoardRenderer.ts:233-246` cria os muros do perímetro com até 1,8 de altura nos lados `-x` e `-z`, com o comentário de que ficam "atrás do tabuleiro". Com a câmera do outro lado, eles passam à frente e cobrem as primeiras fileiras. Os postes das tochas (`:252-275`, 1,35 de altura) têm o mesmo problema nos cantos.
- **O perímetro não entra no raycast.** `pickTarget` (`InputManager.ts:89-93`) só considera hitboxes de unidade, obstáculos internos e tiles. Um muro de perímetro que cubra o tabuleiro deixaria o clique atravessá-lo.
- **O que já acompanha a câmera sem mudança:** as barras de HP são reprojetadas a cada quadro (`UnitRenderer.ts:717-742`); o raycast usa a câmera recebida; luzes, sombras, destaques, caminho e animações estão em coordenadas de mundo. O enquadramento ortográfico (`frustumSize = 17.5`) comporta o tabuleiro em qualquer azimute, porque a pior largura é a diagonal de 12 células, cerca de 17.

### Desenho

- **Estado de órbita em `SceneManager`.** Guardar `azimuth` em radianos e derivar a posição: `x = R·sin(azimuth)`, `z = R·cos(azimuth)`, `y = 18.5`, com `R = 17·√2`, seguido de `lookAt` no mesmo alvo. O valor inicial `π/4` reproduz a vista atual. A elevação e a distância não mudam: a rotação é só horizontal.
- **API:** `rotateAzimuth(deltaRad)` e `get azimuth`. O ângulo é normalizado para `[0, 2π)`, sem limite, o que dá os 360° contínuos. Depois de mover a câmera, chamar `camera.updateMatrixWorld()`, para que um raycast feito antes do próximo quadro não use a matriz antiga.
- **Gesto em `InputManager`.** Botão direito pressionado inicia um arraste candidato. Passado um limiar de poucos pixels, vira rotação: cada `pointermove` converte o deslocamento horizontal em ângulo e chama um callback novo, `onRotateCamera(deltaRad)`. Soltar sem ter passado do limiar mantém o comportamento atual de cancelar o modo. `contextmenu` continua com `preventDefault`, mas deixa de cancelar o modo: o cancelamento passa para o `pointerup` do clique sem arraste.
- **Captura do ponteiro.** Usar `setPointerCapture` no início do arraste e encerrar em `pointerup`, `pointercancel` e `lostpointercapture`, para a rotação não ficar presa quando o cursor passa sobre o HUD ou sai da janela.
- **A rotação não depende da vez.** Ela é só visualização, então vale durante o turno inimigo e durante animações. O tratamento do arraste vem antes de `isInputBlocked()`. Enquanto o arraste está ativo, hover e clique ficam suspensos e o destaque de hover é limpo.
- **Quem move a câmera.** `InputManager` não altera a câmera: ele emite o callback, e `main.ts` o liga a `sceneManager.rotateAzimuth`. A câmera continua sendo passada ao `InputManager` só para o raycast.
- **Perímetro.** `BoardRenderer` ganha `setCameraAzimuth(azimuth)`, que esconde as peças altas do perímetro (muros e postes) que estão do lado da câmera e mostra as do lado oposto. Com isso elas não cobrem o tabuleiro nem precisam entrar no raycast. `main.ts` chama esse método depois de cada rotação e uma vez no início.
- **Estado de vista, não de jogo.** O azimute não vai para o motor nem para o snapshot, e `reset()` não o altera.

### Parte pura e testável

A matemática da órbita (normalização do ângulo, posição a partir do azimute, pixels para radianos) e a decisão "clique ou arraste" não dependem de Three.js nem do DOM. Elas ficam em um módulo sem essas importações, por exemplo `src/rendering/cameraOrbit.ts`, e são testadas em Node.

## Objetivo 2: seleção de células encobertas

### Diagnóstico

- **O primeiro objeto atingido decide tudo.** `pickTarget` lança o raio contra hitboxes, obstáculos e tiles e usa só `hits[0]` (`InputManager.ts:94-99`). Se o primeiro é uma hitbox, o resultado é a unidade e a célula dela (`:101-107`).
- **A hitbox cobre as células de trás.** Ela é uma caixa de `0.75 × 1.25 × 0.75` (`UnitRenderer.ts:768-772`). Com a câmera a 37° de elevação, uma caixa de 1,25 de altura cobre na tela cerca de 1,6 célula de chão atrás da unidade. Essas células não podem ser escolhidas como destino, e o problema cresce quando as unidades se agrupam.
- **Obstáculos já bloqueiam o clique, mas por omissão.** As malhas de obstáculo estão na lista de alvos (`BoardRenderer.ts:374`), sem `userData`. Quando uma é o primeiro acerto, `pickTarget` não acha unidade nem célula e devolve nulo (`:114`). O comportamento é o desejado, só que depende de um campo ausente.
- **Cadáveres não atrapalham.** `getUnitHitboxes` só devolve unidades vivas e visíveis (`UnitRenderer.ts:376-384`).

### Desenho

O raio já devolve todos os acertos em ordem de distância. A mudança é percorrer a lista em vez de parar no primeiro:

1. Percorrer os acertos do mais próximo ao mais distante.
2. A primeira hitbox encontrada vira a **unidade candidata**. As hitboxes seguintes são ignoradas.
3. O primeiro tile encontrado vira a **célula de chão** e encerra a busca.
4. Um obstáculo encerra a busca na hora. O que está atrás dele não é selecionável.

O resultado é um par (unidade candidata, célula de chão), e qualquer um dos dois pode faltar. A escolha entre eles depende do modo e usa só as consultas que o `InputManager` já faz ao motor:

| Modo | Preferência |
|---|---|
| `attack` | A unidade candidata, se for alvo atacável. Senão, nada |
| `skill` | A célula da unidade candidata, se for alvo válido da habilidade. Senão a célula de chão, se for alvo válido |
| `default` | A unidade candidata, se for alvo atacável. Senão a célula de chão, se for alcançável. Senão a unidade candidata, para hover e inspeção |

Regras complementares:

- **Hover e clique usam o mesmo resolvedor.** O destaque sob o cursor mostra exatamente o que o clique vai escolher.
- **Todo obstáculo interno bloqueia a seleção**, inclusive caixote e barril: são sólidos na tela, mesmo sem bloquear a linha de visão das regras. As malhas passam a levar uma marca explícita em `userData` (por exemplo `kind: 'obstacle'`), e as hitboxes e os tiles ganham marcas equivalentes.
- **Ambiguidade conhecida.** No modo `default`, se a unidade sob o cursor é atacável e a célula atrás dela é alcançável, a unidade ganha. Para escolher a célula, o jogador gira a câmera (objetivo 1). Se o QA mostrar que isso incomoda, o refinamento é decidir pela altura do ponto de impacto na hitbox; ele não faz parte desta entrega.
- **Sem regra de jogo na interface.** O resolvedor compara ids e células com as listas vindas do motor (`getAttackableTargets`, `getReachableCells`, `getSkillTargetCells`). Ele não calcula alcance, caminho nem linha de visão.

### Parte pura e testável

O resolvedor recebe uma lista de acertos já classificados (`unit`, `tile`, `obstacle`) e o contexto do modo, e devolve a escolha. Ele não precisa de Three.js: a conversão de `THREE.Intersection` para essa lista fica no `InputManager`, e o resolvedor vai para um módulo próprio, por exemplo `src/input/pickResolver.ts`, testado em Node.

## Objetivo 3: orientação dos aliados

### Diagnóstico

- **Não existe estado de orientação.** Nem `UnitState` nem `UnitVisual` guardam para onde a unidade olha.
- **A orientação só existe durante a animação.** O movimento vira o corpo para a direção do passo (`UnitRenderer.ts:417`) e os ataques viram o atacante para o alvo (`:428`, `:472`, `:520`).
- **Toda sincronização a desfaz.** `syncUnits` zera a rotação de cada unidade viva que não está animando (`UnitRenderer.ts:133`), e é chamado depois de toda ação e ao fim de cada fila de animação (`:631-635`). Por isso as unidades voltam sempre à pose padrão.
- **A pose padrão olha para `+Z`**, que é o lado sul do tabuleiro. Os heróis começam no sul, então ficam de costas para os inimigos.

### Desenho

- **Orientação é apresentação.** Nenhuma regra depende dela (não há ataque pelas costas), então ela fica no renderer: `UnitVisual` ganha `facingY`. O contrato do motor não muda.
- **`syncUnits` passa a aplicar `facingY`** em vez de zerar a rotação. Isso corrige a perda de orientação para todas as unidades.
- **Toda animação que vira o corpo grava `facingY`.** Assim a unidade continua virada para onde andou ou para quem atacou.
- **Depois de andar, o aliado se vira para o inimigo vivo mais próximo.** Ao fim da animação de movimento de uma unidade do jogador, o renderer calcula o alvo no snapshot mais recente e gira o corpo pelo menor arco, em uma transição curta.
- **Critério de "mais próximo":** distância de Manhattan na grade, como nas regras; no empate, a menor distância em linha reta; persistindo o empate, a ordem da lista de unidades. O resultado é determinístico.
- **Ângulo:** com `dx = alvo.x − unidade.x` e `dy = alvo.y − unidade.y` em células, `facingY = atan2(dx, −dy)`. O sinal de `dy` é invertido porque a linha da grade cresce no sentido `−Z` (`BoardRenderer.gridToWorld`).
- **Sem inimigo vivo**, a orientação atual é mantida.
- **Inimigos** não se reorientam sozinhos: mantêm a direção do último passo ou ataque, o que já vem de gravar `facingY`.
- **Cadáveres** continuam com a pose deitada atual. **`gameReset`** devolve `facingY` ao valor inicial.
- **Independente da câmera.** A orientação é em coordenadas de mundo e não muda com o azimute.

### Decisão em aberto

O pedido cobre a orientação depois de andar. Fica para a coordenação decidir se os aliados também nascem virados para o inimigo mais próximo; sem isso, eles começam a batalha de costas até o primeiro movimento. A recomendação é aplicar a mesma função na criação do visual.

### Parte pura e testável

A escolha do inimigo mais próximo e o cálculo do ângulo usam só `UnitState` e aritmética. Elas ficam em um módulo sem Three.js, por exemplo `src/rendering/facing.ts`, testado em Node.

## Limites de camada na V2.2

- `SceneManager` é o único que move a câmera. `InputManager` detecta o gesto e emite um callback.
- `InputManager` não importa `src/game/`. A seleção compara os acertos do raio com respostas do motor.
- O critério de "inimigo mais próximo" para a orientação é cosmético e pode ficar no renderer. Se uma regra futura depender de orientação, ela passa para o motor e para o contrato.
- Os três módulos puros novos não importam Three.js nem acessam o DOM, para poderem ser testados em Node junto com o motor.
