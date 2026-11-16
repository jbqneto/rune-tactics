# Sistema de turnos — especificação V2.1

## Status e precedência

Este documento especifica o comportamento-alvo solicitado no brief V2.1, não uma implementação concluída. O diagnóstico refere-se à leitura inicial; outros agentes alteraram src/tests durante esta tarefa, exigindo reconciliação posterior à integração. A inspeção encontrou ativações individuais com escolha manual antes da primeira ação, já implementadas em `TurnSystem` e `GameEngine`. A antiga indicação de que todo o time ainda agia junto estava desatualizada.

`AGENTS.md` e `game-design.md` chamam a base atual de V2.2 e descrevem escolha livre e cadáveres dos dois times. O brief V2.1 exige ordem fixa e desaparecimento visual dos inimigos. Para esta migração, os requisitos abaixo são o alvo explícito; a numeração não demonstra o estado de implementação. Os demais documentos não foram alterados fora do escopo.

## Ordem fixa antes da partida

A sequência padrão é definida na configuração antes de iniciar/resetar a batalha, nunca por clique, velocidade, proximidade ou reordenação após mortes:

| Posição | Unidade | ID |
|---|---|---|
| 1 | Guerreiro | `knight-1` |
| 2 | Goblin Scout | `goblin-scout-1` |
| 3 | Arqueira | `archer-1` |
| 4 | Melee Skeleton 1 | `melee-skeleton-1` |
| 5 | Mago | `mage-1` |
| 6 | Melee Skeleton 2 | `melee-skeleton-2` |
| 7 | Clérigo | `cleric-1` |
| 8 | Armored Skeleton | `armored-skeleton-1` |
| 9 | Skeleton Archer | `skeleton-archer-1` |
| 10 | Cultist Mage | `cultist-mage-1` |

Intercalada não significa alternância obrigatória entre times: as posições 8–10 são inimigas consecutivas. Não usar a ordem bruta atual de `INITIAL_UNITS`, que agrupa os quatro heróis antes dos inimigos. Manter a sequência em `gameConfig.ts` como fonte única, com contrato aprovado pelo coordenador.

## Estrutura TurnScheduler (proposta, não exportada hoje)

| Campo | Tipo | Invariante |
|---|---|---|
| `turnOrder` | `string[]` | Cópia da ordem inicial, estável durante toda a partida |
| `currentIndex` | `number` | Índice na lista original, não em uma lista filtrada de vivos |
| `round` | `number` | Começa em 1; incrementa uma vez por travessia completa |
| `activeUnitId` | `string \| null` | ID vivo em `turnOrder[currentIndex]`, ou null em estado terminal |
| `hasMoved` | `boolean` | Movimento consumido da unidade ativa |
| `hasAttacked` | `boolean` | Ataque básico OU habilidade consumido da unidade ativa |

`TurnScheduler` é um modelo de responsabilidade; pode ser implementado dentro do `TurnSystem`, sem exigir arquivo/classe adicional. Os flags já existem em `UnitState`: não criar duas fontes graváveis. Os campos do agendador devem refletir o estado da ativa por acesso derivado, ou ser sincronizados atomicamente com uma única autoridade aprovada. `hasActivatedThisRound` continua útil ao HUD e aos testes, mas não escolhe o próximo ID.

### Início, comandos e seleção

1. Validar IDs únicos, existência das entradas e cobertura das unidades do cenário. Cenários de teste com outros IDs precisam de ordem própria definida antes do início; não presumir os dez IDs padrão.
2. Inicializar rodada 1 e buscar a primeira entrada viva; verificar fim de batalha antes de agendar se faltar um time.
3. Fixar `activeUnitId` imediatamente, antes da primeira ação, e emitir `activationStarted` uma vez. Aliado entra em `player_unit_active`; inimigo, em `enemy_activation`. Não existe janela jogável de `awaiting_player_choice`.
4. Todo comando de movimento/ataque/habilidade deve validar a identidade ativa no motor, não só no mouse ou HUD. `selectedUnitId` não concede direito de ação.
5. Na opção mínima, `selectUnit` recusa outro aliado e `null` durante a ativação. Inspeção de outro aliado é opcional e pode ser foco local do HUD; nunca altera `activeUnitId`, índice, flags, eventos ou o autor de comandos. Se houver seleção de inspeção compartilhada, revisar o contrato antes de implementar.
6. `endPlayerTurn()` encerra apenas a ativação aliada atual, mesmo sem ações. Fora da fase aliada é recusado.
7. Ação inválida não altera estado, não gasta flags e não emite eventos.

`activationLocked` deve valer desde o início da ativação aliada, não somente após a primeira ação. `phase` e `activationTeam` derivam da unidade agendada; estados terminais têm `activeUnitId = null`.

## Encerramento automático: cenários A–E

| Cenário | Sequência | Flags após ação | Resultado |
|---|---|---|---|
| A | mover → atacar | true / true | Encerra automaticamente após o ataque |
| B | atacar → mover | false / true, depois true / true | Mantém a mesma ativa após atacar; encerra após mover |
| C | apenas mover | true / false | Permanece ativa até atacar/usar habilidade ou encerrar manualmente |
| D | apenas atacar | false / true | Permanece ativa até mover ou encerrar manualmente |
| E | nenhuma ação → encerrar | false / false | Passe válido; avança uma posição elegível |

Habilidade, incluindo `Healing Light`, consome `hasAttacked`. Não encerrar automaticamente por ausência de alvo de ataque ou de destino de movimento para o jogador: usar encerramento manual. A IA sem ação possível encerra sua própria ativação para evitar travamento.

### Checagem pós-ação e eventos

1. Aplicar a ação e seus eventos (`unitMoved`, ou `unitAttacked`/`unitDied`, ou `skillUsed` e efeitos).
2. Verificar vitória/derrota primeiro. O golpe final termina em `battleEnded`, sem nova ativação nem rodada.
3. Se a ativa morreu ou `hasMoved && hasAttacked`, concluir sua ativação uma vez. Caso contrário, conservar ID e índice.
4. Ao concluir: marcar `hasActivatedThisRound`, emitir `activationEnded`, avançar o cursor e pular mortos.
5. Se atravessou o fim da lista: incrementar rodada, restaurar ações/ativação e reduzir recargas dos vivos em 1 com piso 0; emitir `roundStarted` uma única vez.
6. Fixar próxima unidade viva e emitir `activationStarted`. Manter `turnChanged` para mudança de equipe ou rodada; ele não substitui `activationStarted` em inimigos consecutivos.

A interface anima fatos já aplicados. O motor permanece síncrono; a animação bloqueia comandos externos sem atrasar o estado lógico.

## Mortes e passagem de rodada

A unidade morta permanece em `units`, com `alive: false`, `hp: 0` e posição da queda. Também mantém sua posição original em `turnOrder`: não remover, compactar, ordenar nem reconstruir a lista.

O cursor avança sobre entradas mortas sem emitir `activationStarted` para elas. Uma morte antes da vez apenas faz essa entrada ser pulada; uma morte após a vez não devolve ativações. Inimigos desaparecem somente na apresentação; aliados permanecem deitados. Nenhum cadáver bloqueia movimento ou linha de visão, nem pode receber ataque, seleção operacional ou cura.

Uma rodada corresponde à travessia de toda a ordem original, processando cada vivo no máximo uma vez. Mortos no final da lista também precisam ser atravessados antes da virada. A próxima rodada começa na primeira entrada viva da mesma lista, mesmo se o Guerreiro morreu. Não aumentar a rodada quando apenas o time muda, nem quando a animação acaba.

## Casos extremos e proteção

- Mortos no começo, meio e fim: preservar ordem relativa dos sobreviventes e índices originais.
- Último inimigo/aliado morto: estado terminal imediato, sem avanço ou loop vazio.
- Ambos os times ausentes em cenário artificial: definir precedência explícita em revisão; a base atual prioriza derrota. Não inventar empate fora do contrato.
- Ativa morta: concluir e procurar próxima, após checar fim de batalha; hoje não há contra-ataque nem dano de terreno.
- Todos os slots mortos ou IDs inválidos: busca limitada ao tamanho da lista; nunca usar loop infinito. Rejeitar configuração inválida antes da partida.
- Comandos duplicados: não assumir que um segundo passe sempre será recusado; após virada pode haver outro aliado vivo consecutivo. UI bloqueia durante animação e o motor valida a ativa corrente. Tokens de ativação seriam extensão de contrato, não implementação implícita.
- Reset durante animação: cancelar filas/VFX, restaurar flags/visibilidade, cursor e rodada; estabelecer novamente a primeira ativa. Revisar o contrato atual que emite apenas `gameReset` para incluir/sincronizar a ativação inicial sem duplicação.
- `executeNextEnemyAction()` fora de `enemy_activation` não faz nada. `false` significa nenhum passo executado, não necessariamente fim da fase: inimigos podem ser consecutivos.

## Estratégia de testes

- Tabela do agendador: ordem exata dos dez IDs por duas rodadas, incluindo as três ativações inimigas finais; verificar unicidade e cursor.
- Cenários A–E e variantes com habilidade/cura; apenas flags true/true provocam encerramento automático normal.
- Cliques/`selectUnit` antes e depois da primeira ação, limpeza da seleção e tentativa de comandar não ativa: nunca mudam a ativa nem liberam outra unidade.
- Mortes em cada posição, múltiplos mortos consecutivos e último slot morto; recarga só cai na virada, nunca por slot pulado.
- Ordem dos eventos, ação inválida sem efeitos, passe, reset, IA bloqueada e golpe final.
- Invariantes em simulações limitadas: nenhuma ativa morta, nenhuma repetição na rodada, progresso finito, snapshot isolado e listas estáveis.
- Preservar regressões de grade, LoS, dano, cura, habilidades e IA; substituir expectativas da escolha livre, não apagar testes sem equivalente.

Plano de integração e responsáveis: [implementation-plan.md](implementation-plan.md). Diagnóstico da base: [architecture.md](architecture.md).
