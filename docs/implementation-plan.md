# Plano de implementação — V2.1

## Estado e limites

Plano proposto a partir da base inspecionada; nada aqui declara código novo concluído. O brief pede mudanças apenas em `turn-system.md`, `architecture.md` e este plano nesta etapa. A base usa o rótulo V2.2, mas conserva escolha manual e cadáveres de ambos os times: a correção pretendida é a descrita em `turn-system.md`. Sem escopo V3/V4.

Baseline inicial: `npm run typecheck` e `npm test` passaram; 113 testes em 4 arquivos. Na verificação final, durante edições concorrentes de outros agentes em src/tests, typecheck passou e a suíte retornou 101 aprovados e 12 falhas em `engine.test.ts` (expectativas antigas de escolha livre, ativa nula e instante de eventos). Esse resultado é transitório, não valida a integração nem constitui diagnóstico final das mudanças concorrentes. Os testes iniciais são baseline da base lida, não evidência de conformidade com a proposta.

## Responsáveis e propriedade

| Agente | Responsabilidade | Limites |
|---|---|---|
| t16 — Codex | Raciocínio, revisão de contratos e invariantes, integração lógica e revisão final | Aprovação de coordenação necessária antes de alterar contrato compartilhado |
| t18 — Engine + Testes | Configuração da ordem, scheduler, ações, consultas de alcance e testes de motor/regressão | Sem alterações visuais; coordena `types.ts` com t16/t1b |
| t1b — Rendering + UI + QA | Input, `main.ts`, tabuleiro, unidades, HUD, QA visual e interação | Consome `IGameEngine`; não implementa regras no renderer |
| t1c — Docs/suporte | Documentos, esclarecimento de dependências, suporte a revisão e reconciliação pós-QA | Nesta etapa só os três documentos solicitados |

`src/shared/types.ts` tem um único editor após aprovação do contrato (proposta: t18); t1b não o edita em paralelo. t1b é responsável único por `src/main.ts` e seus arquivos visuais. Se houver conflito de escopo, interromper e coordenar em vez de sobrescrever trabalho alheio. Não editar `AGENTS.md` nem `game-design.md` sem autorização adicional, apesar da inconsistência de nomenclatura e regras.

## Sequência, dependências e critérios de aceite

### 0. Decisão de contrato — t16 + coordenação; apoio t18/t1b/t1c

- [ ] Aprovar ordem padrão exata e modelo de ordem explícita para cenários de teste customizados, garantindo IDs únicos e existentes.
- [ ] Aprovar semântica de `activeUnitId`, `selectedUnitId`, `activationLocked` e eventual remoção de `awaiting_player_choice`.
- [ ] Aprovar `getAttackRangeCells`, incluindo LoS, célula de obstáculo, ocupação, situação sem ação disponível e separação de `getAttackableTargets`.
- [ ] Aprovar `GRID_HIGHLIGHTS` (configuração visual sem dependência de Three.js), prioridade de sobreposição e se ordem/índice entram no snapshot.
- [ ] Definir eventos de ativação inicial/reset, tratamento de setup vazio/inválido e compatibilidade de testes/consumidores.

Aceite: contratos documentados em `architecture.md`/`turn-system.md` e acordados antes de implementar. Divergência de versão com documentos fora do escopo fica registrada, não escondida.

### 1. Núcleo de turnos — t18; revisão t16

Depende de 0. TDD: escrever primeiro testes da ordem fixa, observar falha pertinente e implementar o mínimo.

- [ ] Introduzir uma fonte da verdade da ordem na configuração e `TurnScheduler` ou responsabilidade equivalente em `TurnSystem`, sem duplicar flags graváveis.
- [ ] Agendar ID vivo imediatamente no início e depois de cada ativação, percorrendo a lista original sem reordenação, inclusive três inimigos consecutivos.
- [ ] Validar que apenas a ativa pode executar ações; rejeitar troca/limpeza de seleção operacional. Se existir inspeção, isolá-la da identidade que age.
- [ ] Encerrar automaticamente só ao gastar movimento e ataque, e manualmente no passe; preservar prioridade de vitória/derrota.
- [ ] Pular mortos sem removê-los da lista; nova rodada só após o fim da travessia, com recarga uma vez por rodada.
- [ ] Ajustar passos da IA, eventos e reset; garantir busca limitada e não estagnar com inimigo sem ação.
- [ ] Adaptar testes existentes de escolha livre para testar rejeição, preservando demais coberturas.

Aceite: duas rodadas seguem os IDs definidos, mortos são pulados sem alteração da ordem, nenhuma unidade age duas vezes por rodada, sequência de eventos correta e cenários A–E passam. Configurações customizadas e terminais são determinísticas e não entram em loop.

### 2. Alcance e contrato — t18; revisão t16

Depende de 0; pode avançar em paralelo com 1 desde que um único editor integre `GameEngine.ts` e `types.ts`.

- [ ] Implementar consulta pura `getAttackRangeCells` com regras acordadas; manter `getAttackableTargets` para unidades válidas.
- [ ] Revisar também consultas existentes com IDs explícitos: fase, ativa, morte e consumo devem ser consistentes com o contrato operacional aprovado.
- [ ] Criar testes de borda, Manhattan, LoS, obstáculos altos/baixos, células vazias/ocupadas, ausência de alvo, ataque usado e snapshot terminal.

Aceite: grade destacável independe de haver alvo; uma célula destacada não transforma aliado/cadáver em alvo legal. Ataques e habilidades continuam usando validação do motor, sem cálculo de regra na interface.

### 3. Interface, renderização e QA — t1b

Depende do contrato de 0; integração final depende de 1 e 2. Preparação visual pode ocorrer em paralelo com engine sem inventar APIs.

- [ ] Adaptar clique no tabuleiro e roster: outro aliado não altera ativa; inspeção, se feita, é somente leitura e não redireciona comandos.
- [ ] Ajustar HUD para `EM TURNO`, `AGUARDANDO`, `CONCLUÍDO`, `DERROTADO` derivados do snapshot; bloquear ações por fase, ativa e animação.
- [ ] Unificar cores/opacidades em `GRID_HIGHLIGHTS`, adicionar camada de alcance básico distinta de alvo atacável e conectar consulta pelo `main.ts`.
- [ ] Morte: aliados deitam e permanecem; inimigos desaparecem após animação, inclusive após novo `syncUnits`; ambos sem hitbox operacional. Reset restaura visual.
- [ ] Verificar troca de modo, hover, filas de animação, mudança de rodada, vitória/derrota, resize e reset sem destaques/poses residuais.

Aceite: alcance aparece em células vazias no modo acordado e não substitui alvo válido; inimigo não reaparece após sync; aliado morto continua deitado; roster/controles acompanham a ativa correta. Evidência visual de antes/depois e passos de reprodução para cada caso.

### 4. Revisão e integração — t16; todos

Depende de 1–3. Revisar limites de camadas, autoridade dos flags, IDs/índices estáveis, API e eventos, corrida entre animação/snapshot, cleanup/reset e qualidade dos testes. t1c atualiza documentação conforme evidências e aponta discrepâncias remanescentes para coordenação.

Aceite: nenhum contrato/documento afirma comportamento ainda não implementado; não há mudança de regras na UI; sem regressões conhecidas abertas sem registro. Coordenador decide reconciliação de `game-design.md` e `AGENTS.md` fora deste brief.

## Estratégia de testes de regressão

1. **Unitário de turnos:** sequência de 10 IDs por 2 rodadas; morte antes/depois da vez, mortos consecutivos e último slot morto; avanço de rodada/recarga; eventos e estado terminal; reset; busca limitada.
2. **Engine:** A–E, habilidade no lugar de ataque, cliques/seleção de outro aliado antes e depois da primeira ação, comandos inválidos sem mutação/evento, IA sem passos, três inimigos consecutivos, vitória/derrota imediata.
3. **Alcance:** conjuntos esperados por célula, LoS e limites; comparar alvos válidos à região, sem considerar toda região um alvo. Testar IDs inválidos, não ativos e ação já consumida.
4. **Regressões existentes:** `grid.test.ts`, `combat-turns.test.ts`, `engine.test.ts`, `ai.test.ts`: manter testes de dano, cura, cooldown, área, caminho, ocupação, LoS e decisão de IA. Mudar apenas pressupostos incompatíveis da ordem antiga, com substitutos equivalentes.
5. **Visual/interação no navegador:** registrar método e evidências de clique em outro aliado antes da primeira ação, alcance em vazio/atrás de cobertura, morte de cada equipe, reset durante/depois da animação e ativações inimigas consecutivas. Validar HUD e ausência de hitbox indevida.
6. **Gates:** `npm run typecheck`, `npm test`, `npm run build` e QA manual. Registrar comandos, totais e falhas reais; não inferir aprovação visual a partir de testes Node. Se houver teste visual automatizado disponível, executá-lo além do QA manual, sem adicionar dependência sem acordo.

## Riscos de integração

- Contrato compartilhado ou `main.ts` editado por dois agentes: usar propriedade única e revisão do diff.
- Agendar antes do primeiro clique muda instante de `activationStarted`; testes e consumidores de eventos devem migrar juntos.
- Reinicialização de visuais após evento de morte pode fazer inimigo reaparecer: política deve valer na sincronização e na conclusão da animação.
- Ordem dos spawns atual não é a ordem desejada: configurar explicitamente e validar cenários de teste.
- Flags duplicadas entre unidade e agendador divergem: usar uma fonte canônica.
- O projeto não possui `.git` no diretório inspecionado; antes de qualquer commit/diff, confirmar localização do repositório com a coordenação, sem inicializar Git nem alterar histórico.

# Plano de implementação — V2.2 (interface)

## Estado e limites

Plano proposto; nada aqui está implementado. O diagnóstico e o desenho de cada objetivo estão em `architecture.md`, na seção "V2.2 (interface)".

Os três objetivos são: (1) rotação horizontal de 360° da câmera com botão direito + arraste, (2) seleção de células livres encobertas por personagens sem atravessar obstáculos sólidos, (3) orientação automática dos aliados para o inimigo vivo mais próximo depois de andar.

Nenhum deles altera `src/game/`, `src/shared/types.ts` ou `src/config/`. Se alguma tarefa parecer exigir isso, pare e avise a coordenação.

## Responsáveis

Os papéis seguem a tabela da V2.1 acima. A atribuição abaixo é uma proposta para a coordenação confirmar.

| Agente | Responsabilidade na V2.2 |
|---|---|
| t1b — Rendering + UI + QA | Implementa os três objetivos em `src/rendering/`, `src/input/` e `src/main.ts`, e faz o QA no navegador |
| t18 — Engine + Testes | Escreve os testes em Node dos três módulos puros; confirma que a suíte do motor segue intacta |
| t16 — Codex | Revisa limites de camada, o resolvedor de seleção e a convivência do gesto com o clique direito |
| t19 — Arquitetura | Diagnóstico e desenho (esta entrega); tira dúvidas de desenho durante a implementação |
| t1c — Docs | Reconcilia `architecture.md`, `game-design.md` e `README.md` com o que for entregue |

`src/main.ts` e `src/input/InputManager.ts` são tocados pelos objetivos 1 e 2. Eles têm um único editor (t1b), e as tarefas que os alteram são feitas em sequência.

## Ordem e dependências

```
A1 ─┬─> A2 ──> A3 ──> A4
    │
B1 ─┴─> B2 ──────────────┐
                         ├──> D1 ──> D2
C1 ───> C2 ──────────────┘
```

- Os módulos puros (A1, B1, C1) não dependem uns dos outros e podem ser feitos em paralelo, cada um com seus testes.
- O objetivo 3 (C1, C2) só toca `UnitRenderer.ts` e pode andar em paralelo com os outros dois.
- B2 vem depois de A3, porque os dois alteram `InputManager.ts`.
- O QA do objetivo 2 depende do objetivo 1: a seleção precisa ser conferida com a câmera girada.

## Tarefas

### Objetivo 1: câmera

**A1. Módulo puro de órbita** (`src/rendering/cameraOrbit.ts`) — t1b, testes t18

- [ ] Normalizar ângulo para `[0, 2π)`.
- [ ] Calcular a posição da câmera a partir de azimute, raio e altura.
- [ ] Converter deslocamento horizontal em pixels para radianos.
- [ ] Decidir clique ou arraste a partir do deslocamento acumulado e de um limiar.

Aceite: o azimute `π/4` devolve a posição atual `(17, 18.5, 17)`; uma volta completa retorna ao ponto de partida; ângulos negativos e acima de `2π` são normalizados; o módulo não importa Three.js.

**A2. Órbita em `SceneManager`** — t1b. Depende de A1.

- [ ] Guardar `azimuth`, expor `rotateAzimuth(deltaRad)` e o getter.
- [ ] Reposicionar a câmera, refazer o `lookAt` e atualizar a matriz de mundo.

Aceite: sem nenhuma rotação, a imagem é idêntica à atual; `resize` continua funcionando em qualquer azimute; o tabuleiro inteiro cabe na tela a 0°, 45°, 90° e 180°.

**A3. Gesto em `InputManager` e ligação em `main.ts`** — t1b. Depende de A2.

- [ ] Arraste com o botão direito emite `onRotateCamera(deltaRad)`, com captura do ponteiro.
- [ ] Clique direito sem arraste continua cancelando o modo de ataque ou habilidade; o cancelamento sai do `contextmenu` e vai para o `pointerup`.
- [ ] A rotação funciona durante o turno inimigo e durante animações.
- [ ] Hover e clique ficam suspensos durante o arraste.

Aceite: arrastar gira nos dois sentidos, sem limite e sem salto; o menu de contexto do navegador nunca abre sobre o canvas; soltar o botão fora do canvas ou sobre o HUD encerra a rotação; um arraste não cancela o modo, e um clique direito parado cancela.

**A4. Perímetro conforme a câmera** (`BoardRenderer.setCameraAzimuth`) — t1b. Depende de A2.

- [ ] Esconder muros e postes altos do lado da câmera; mostrar os do lado oposto.

Aceite: em nenhum azimute uma peça do perímetro cobre uma célula do tabuleiro; a 45° a cena é igual à atual.

### Objetivo 2: seleção

**B1. Resolvedor puro** (`src/input/pickResolver.ts`) — t1b, testes t18

- [ ] Receber os acertos classificados (`unit`, `tile`, `obstacle`) em ordem de distância e o contexto do modo.
- [ ] Aplicar a tabela de preferência de `architecture.md`.

Aceite, um teste para cada caso:

- célula alcançável atrás de um aliado é escolhida;
- célula alcançável atrás de um inimigo que não é alvo é escolhida;
- inimigo atacável ganha da célula atrás dele;
- nada atrás de um obstáculo é escolhido, seja tile ou unidade;
- duas unidades em fila: vale a da frente como candidata;
- raio que não acerta nada devolve vazio;
- modo `skill`: célula alvo atrás de uma unidade é escolhida;
- modo `attack`: célula de chão nunca é escolhida.

**B2. Integração em `InputManager` e marcas em `BoardRenderer`/`UnitRenderer`** — t1b. Depende de B1 e de A3.

- [ ] Marcar hitboxes, tiles e malhas de obstáculo em `userData`.
- [ ] Converter os acertos do raio para a lista do resolvedor e usar o mesmo caminho no hover e no clique.

Aceite: o destaque de hover sempre coincide com o resultado do clique; os cliques que já funcionavam (atacar unidade visível, mover para célula descoberta) continuam iguais; caixote, barril, parede e pilar bloqueiam a seleção do que está atrás.

### Objetivo 3: orientação

**C1. Módulo puro de orientação** (`src/rendering/facing.ts`) — t1b, testes t18

- [ ] Escolher o inimigo vivo mais próximo: Manhattan, depois distância em linha reta, depois ordem da lista.
- [ ] Calcular o ângulo a partir da diferença de células.
- [ ] Calcular o menor arco entre dois ângulos.

Aceite: inimigos mortos são ignorados; empates são determinísticos; sem inimigo vivo o resultado é nulo; os quatro sentidos cardeais dão os ângulos esperados; o menor arco nunca passa de 180°.

**C2. Orientação em `UnitRenderer`** — t1b. Depende de C1.

- [ ] `UnitVisual.facingY`, aplicado em `syncUnits` no lugar da rotação zerada.
- [ ] Gravar `facingY` nas animações de movimento, ataque e habilidade.
- [ ] Ao fim do movimento de um aliado, girar para o inimigo vivo mais próximo.
- [ ] `gameReset` restaura a orientação inicial; cadáveres mantêm a pose atual.

Aceite: depois de andar, o aliado termina virado para o inimigo vivo mais próximo; depois de atacar, a unidade continua virada para o alvo; nenhuma unidade volta sozinha à pose padrão entre ações; inimigos mantêm a direção do último passo; a orientação não muda quando a câmera gira.

### Integração

**D1. Revisão** — t16. Depende de A4, B2 e C2.

- [ ] Nenhuma importação de `src/game/` em rendering, input ou ui.
- [ ] Nenhum cálculo de alcance, caminho ou linha de visão fora do motor.
- [ ] Os três módulos puros sem Three.js e sem DOM.
- [ ] Ouvintes de ponteiro removidos em `dispose()`.

**D2. QA no navegador e documentação** — t1b e t1c. Depende de D1.

- [ ] Roteiro de QA abaixo, com evidência de cada item.
- [ ] `architecture.md` passa a descrever o que foi entregue, e não mais o plano.

## Verificação

1. **Testes em Node** dos três módulos puros, na mesma suíte Vitest.
2. **Regressão:** `npm run typecheck`, `npm test` e `npm run build`. A suíte do motor não deve mudar de resultado, porque o motor não é tocado.
3. **Roteiro de QA no navegador**, repetido com a câmera a 45° (vista inicial), 135°, 225° e 315°:
   - mover para uma célula descoberta e para uma célula atrás de um aliado;
   - atacar um inimigo visível e um inimigo parcialmente coberto por outro;
   - lançar habilidade em área com a célula alvo atrás de uma unidade;
   - tentar selecionar uma célula atrás de parede, pilar, caixote e barril;
   - conferir que as barras de HP acompanham as unidades;
   - conferir que nenhuma peça do perímetro cobre o tabuleiro;
   - girar durante o turno inimigo e durante uma animação;
   - clique direito parado no modo de ataque e no modo de habilidade;
   - andar com cada herói e conferir para onde ele se vira; repetir depois de matar o inimigo mais próximo;
   - reiniciar a partida e conferir que a câmera fica onde estava e que as unidades voltam à orientação inicial.

Testes em Node não validam o que aparece na tela. Só o roteiro acima fecha os critérios visuais.

## Decisões para a coordenação

- **Orientação inicial.** Os aliados nascem virados para o inimigo mais próximo ou só se viram depois do primeiro movimento? A recomendação é que já nasçam virados.
- **Unidade atacável na frente de célula alcançável.** No modo padrão, a unidade ganha, e o jogador gira a câmera para escolher a célula. Confirmar se isso é aceitável ou se a decisão pela altura do ponto de impacto entra nesta entrega.
- **Sensibilidade da rotação.** Proposta inicial: arrastar a largura do canvas equivale a uma volta completa. O valor final sai do QA.

## Riscos

- **Clique direito com dois significados.** Cancelar o modo e girar a câmera usam o mesmo botão. O limiar de arraste separa os dois; um limiar grande demais deixa a rotação dura, e um pequeno demais faz cliques tremidos girarem a câmera.
- **Perímetro e tochas na frente da câmera.** Sem a tarefa A4, a rotação cobre parte do tabuleiro e o clique atravessa o muro.
- **Edições concorrentes em `InputManager.ts` e `main.ts`.** Os objetivos 1 e 2 mexem nos dois arquivos; por isso a ordem A3 antes de B2 e o editor único.
- **Hover e clique divergentes.** Se só um dos dois passar a usar o resolvedor, o destaque engana o jogador.
- **Orientação e fila de animação.** O giro ao fim do movimento usa o snapshot mais recente. Uma ação enfileirada logo depois pode sobrescrever a orientação no meio do giro; a animação de ataque deve partir da orientação já gravada.
- **Entrada sem botão direito.** Trackpads e telas de toque não têm o gesto. Fica fora desta entrega, mas a rotação não deve ser o único jeito de alcançar uma célula: o objetivo 2 cobre o caso comum sem girar.
- **Gestos do navegador.** Algumas extensões e navegadores usam o arraste com o botão direito. O `preventDefault` no `contextmenu` e a captura do ponteiro reduzem o problema, mas ele precisa ser conferido no QA.
