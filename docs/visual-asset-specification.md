# Especificação dos assets visuais

Este documento diz o que cada asset precisa cumprir para entrar no jogo: formato, medidas, orçamento, nomes e critérios de aceite. A aparência está em `art-direction.md`. Ele descreve o alvo da V3 visual; nada aqui altera `src/`.

## Estratégia de produção

A decisão está em `3d-asset-research.md`: solução híbrida.

| Via | O que é | Quando usar |
|---|---|---|
| Modelo importado | arquivo `.glb` com esqueleto e animações, de pacote com licença livre (CC0) | personagens que existem em um pacote de estilo compatível |
| Kit modular em Three.js | modelo montado em código com primitivas | reserva para quando o `.glb` falha ao carregar; unidades sem modelo importado; todo o cenário e todos os efeitos |

As duas vias cumprem o mesmo contrato deste documento: mesma escala, mesmo pivô, mesma orientação e os mesmos nomes de animação. Quem consome o modelo não precisa saber de qual via ele veio.

Ferramentas que não estão disponíveis no ambiente (Blender, geradores de modelo 3D pagos) não fazem parte do processo. Um `.glb` precisa chegar pronto, sem etapa de conversão.

## Sistema de coordenadas

| Regra | Valor |
|---|---|
| Unidade | 1 célula do tabuleiro = 1 unidade do Three.js |
| Eixo vertical | `+Y` |
| Pivô | no chão, no centro da base: `(0, 0, 0)` |
| Frente do modelo | `+Z` |
| Pose de repouso | em pé, centrada no pivô, sem deslocamento |
| Escala no arquivo | 1,0. Nenhuma escala escondida nos nós |

O renderer gira o modelo em torno de `Y` para orientá-lo e o posiciona pelo pivô no centro da célula. Um modelo com pivô fora do chão ou com a frente em outro eixo é corrigido no arquivo, não no código.

Um modelo importado em outra escala é normalizado uma única vez, na carga, por um fator declarado ao lado do caminho do arquivo. Esse fator é a única correção permitida fora do arquivo.

## Personagens

### Volume

Cada personagem cabe em um cilindro de 0,6 de diâmetro. A arma pode sair do cilindro para cima ou para a frente, nunca mais de 0,2 para os lados.

| Unidade (`UnitType`) | Altura | Diâmetro da base | Arquivo |
|---|---|---|---|
| `knight` | 1,05 | 0,55 | `knight.glb` |
| `archer` | 1,05 | 0,45 | `archer.glb` |
| `mage` | 1,10 | 0,50 | `mage.glb` |
| `cleric` | 0,95 | 0,55 | `cleric.glb` |
| `goblin-scout` | 0,80 | 0,45 | `goblin-scout.glb` |
| `melee-skeleton` | 1,00 | 0,45 | `melee-skeleton.glb` |
| `skeleton-archer` | 1,00 | 0,45 | `skeleton-archer.glb` |
| `armored-skeleton` | 1,25 | 0,60 | `armored-skeleton.glb` |
| `cultist-mage` | 1,05 | 0,50 | `cultist-mage.glb` |

O nome do arquivo é o `UnitType`, em `public/assets/models/characters/`.

### Orçamento

| Item | Modelo importado | Kit em Three.js |
|---|---|---|
| Triângulos por personagem | até 1.500; `armored-skeleton` até 1.800 | até 400 |
| Materiais por personagem | até 3 | até 6 |
| Textura | um atlas de cores chapadas, até 512×512, compartilhado quando possível | nenhuma |
| Ossos | até 30 | não se aplica |
| Tamanho do arquivo | até 400 KB | não se aplica |
| Compressão | nenhuma que exija decodificador extra | não se aplica |

O `GLTFLoader` do pacote `three` já instalado é o único carregador. Arquivos com Draco, Meshopt ou KTX2 não entram, porque exigiriam decodificadores adicionais.

### Estrutura do modelo importado

- Um único nó raiz, sem transformações além da identidade.
- Uma malha com pele ou poucas malhas rígidas presas a ossos.
- A arma é um nó separado, preso ao osso da mão, com nome previsível (`Weapon`), para o renderer poder trocá-la ou escondê-la.
- Nenhuma luz, câmera ou cena extra dentro do arquivo.
- Materiais padrão do glTF, sem extensões.

### Estrutura do kit em Three.js

- Grupo raiz no pivô; um grupo de corpo dentro dele, que recebe a orientação e as animações de pose.
- Um pivô de arma separado, para o golpe.
- Um material por cor, criado por unidade e não compartilhado entre unidades, porque a opacidade e o clarão de dano variam por unidade.
- Sombreamento chapado em todos os materiais.
- Caixa de colisão invisível para o clique, de `0,75 × 1,25 × 0,75`, marcada em `userData` com o id da unidade. Ela existe nas duas vias.

### Elementos comuns às duas vias

| Elemento | Especificação |
|---|---|
| Anel de base | anel plano a 0,02 do chão, diâmetro externo 0,82; azul, dourado ou vermelho conforme `art-direction.md` |
| Sombra | o modelo projeta sombra; o anel e os efeitos não |
| Barra de HP | elemento HTML sobre o tabuleiro, 0,25 acima do topo do modelo |
| Opacidade | 1,0 na unidade ativa e 0,75 nas demais vivas |

A opacidade de 75% exige cuidado em modelo importado: ao tornar um material translúcido depois da primeira renderização, é preciso marcar o material para recompilar, e manter a gravação de profundidade ligada para o modelo não se desenhar fora de ordem.

## Animações

### Nomes normalizados

Todo personagem expõe exatamente estes seis clipes, com estes nomes:

| Clipe | Repete | Duração no jogo | Conteúdo |
|---|---|---|---|
| `Idle` | sim | livre, 2 a 3 s por ciclo | respiração leve, pés parados |
| `Walk` | sim | um ciclo a cada duas células | passo no lugar |
| `Attack` | não | 0,34 s | recuo, golpe ou disparo, retorno |
| `Hit` | não | 0,15 s | recuo curto ao receber dano |
| `Death` | não | 0,3 a 0,5 s | queda até ficar deitado |
| `Cast` | não | 0,3 a 0,6 s | gesto de lançar habilidade |

Regras:

- **Sem deslocamento de raiz.** Todas as animações acontecem no lugar. Quem move a unidade pelo tabuleiro é o renderer.
- **O nome é o contrato.** Um pacote que usa outros nomes é mapeado uma vez, na carga, por uma tabela ao lado do caminho do arquivo. O resto do código só conhece os seis nomes.
- **Duração controlada pelo jogo.** O clipe é acelerado ou desacelerado para caber na duração da tabela. O momento do impacto de `Attack` fica perto de 60% do clipe.
- **`Death` termina na pose final** e fica parada nela.
- **Transições** entre clipes com mistura curta, de 0,08 a 0,12 s.

### Reserva quando falta um clipe

| Clipe ausente | O que usar |
|---|---|
| `Cast` | `Attack` |
| `Hit` | clarão branco e recuo de pose feitos em código |
| `Walk` | `Idle` com o salto de passo feito em código |
| `Death` | rotação até deitar feita em código |
| `Idle` | pose de repouso parada |

No kit em Three.js, os seis nomes correspondem a animações de pose feitas em código, com as mesmas durações.

### Evento do motor e clipe

| Evento | Unidade | Clipe |
|---|---|---|
| `unitMoved` | quem andou | `Walk` durante o percurso, depois `Idle` |
| `moveUndone` | quem voltou | `Walk`, mais rápido |
| `unitAttacked` sem `skillId` | atacante | `Attack` |
| `unitAttacked` | alvo | `Hit`, no impacto |
| `skillUsed` | lançador | `Cast` |
| `unitHealed` | alvo | brilho verde e dourado, sem clipe |
| `unitDied` | quem morreu | `Death` |
| nenhum | todas as vivas | `Idle` |

## Regra obrigatória de morte

| Time | Depois de `Death` | Anel e barra de HP | Caixa de clique |
|---|---|---|---|
| Aliado | permanece deitado no chão, na célula onde caiu, até o fim da batalha | escondidos | removida |
| Inimigo | encolhe e desaparece ao fim do clipe | escondidos | removida |

- A regra vale nas duas vias de produção.
- Ela vale também quando o estado já chega com a unidade morta, sem o evento de morte: aliado morto aparece deitado, inimigo morto não aparece.
- Um inimigo morto nunca reaparece em uma sincronização posterior.
- O cadáver do aliado não bloqueia movimento, visão nem clique, e outra unidade pode parar na mesma célula.
- A pose deitada respeita a direção em que a unidade estava virada.
- O reinício da partida restaura pose, escala, visibilidade e caixa de clique de todas as unidades.

## Cenário

Todo o cenário é kit modular em Three.js. Peças e medidas:

| Peça | Medidas (L × A × P) | Triângulos | Material | Bloqueia visão |
|---|---|---|---|---|
| Lajota do piso | 0,93 × 0,14 × 0,93 | 12 | `stone-floor.png`, dois tons | — |
| Laje do tabuleiro | grade + 0,6 de borda, 0,5 de altura | até 200 | pedra escura, corte lateral em dois tons | — |
| Parede (`wall`) | 0,86 × 1,20 × 0,86 | até 60 | `stone-wall.png` | sim |
| Pilar (`pillar`) | base 0,84, fuste 0,56, 1,60 de altura | até 120 | `stone-wall.png` | sim |
| Caixote (`crate`) | 0,70 × 0,60 × 0,70 | até 60 | madeira | não |
| Barril (`barrel`) | diâmetro 0,60, altura 0,70 | até 120 | madeira e ferro | não |
| Tocha | poste 0,42 × 1,35, braseiro e chama | até 80 | pedra, chama emissiva | fora da grade |
| Estandarte | 0,5 × 1,4, em haste | até 30 | pano azul ou carmim | fora da grade |
| Ruína de perímetro | até 1,8 de altura | até 60 por trecho | `stone-wall.png` | fora da grade |

Regras:

- **A altura codifica a regra.** Obstáculo que bloqueia a visão tem 1,2 ou mais de altura. Obstáculo que só bloqueia movimento tem 0,7 ou menos. Nenhuma peça fica entre esses valores.
- **Um obstáculo por célula,** centrado, sem invadir a célula vizinha.
- **Toda malha que entra no clique leva marca em `userData`:** lajota com a coordenada da célula, obstáculo com a marca de obstáculo.
- **Peças altas do perímetro** são escondidas quando ficam entre a câmera e o tabuleiro.
- **Ao trocar de mapa,** as peças antigas são removidas e suas geometrias e materiais liberados.
- **Geometria e material compartilhados** entre peças iguais.

## Efeitos

| Efeito | Forma | Cor | Duração |
|---|---|---|---|
| Projétil de ataque à distância | esfera de 0,11 | por time e classe | voo em 60% de 0,34 s |
| Runic Strike | arco em anel no alvo | azul claro `#38bdf8` | 0,3 s |
| Marked Shot | flecha, depois mira em losango no alvo | verde `#4ade80` | 0,34 s |
| Arcane Burst | um projétil de 0,15 até a célula alvo, depois explosão em cruz | ciano `#22d3ee` e púrpura `#a855f7` | 0,62 s, impacto a 45% |
| Healing Light | anel no chão e halo sobre o alvo | verde `#4ade80` e dourado `#facc15` | 0,42 s |
| Reação a dano | clarão emissivo branco no alvo | branco | 0,15 s |

- Materiais sem iluminação, translúcidos, sem gravar profundidade.
- Todo efeito remove suas malhas e libera geometria e material ao terminar.
- Uma habilidade é uma animação só: o projétil, o efeito no impacto e o dano de todos os atingidos ao mesmo tempo.

## Destaques do tabuleiro

| Destaque | Forma | Altura sobre o piso |
|---|---|---|
| Célula alcançável, de alcance, de alvo | plano de 0,9 × 0,9, translúcido | 0,012 a 0,02 |
| Caminho | faixa de 0,14 de largura com ponta em seta | 0,035 |
| Área de habilidade | plano translúcido púrpura | 0,02 |

As cores estão em `art-direction.md`. Os planos ficam em alturas diferentes para não piscarem uns sobre os outros.

## Assets 2D

### Retratos

| Regra | Valor |
|---|---|
| Tamanho | 256×256 px |
| Formato | PNG, sem transparência |
| Pasta e nome | `public/assets/portraits/<UnitType>.png` |
| Conteúdo | busto em três quartos, fundo ardósia escuro, sem texto e sem moldura |
| Peso | até 120 KB |

Situação atual: seis retratos em PNG de 256×256. Os de `cleric`, `goblin-scout` e `cultist-mage` são SVG provisórios e precisam ser refeitos em PNG no padrão dos demais.

### Ícones

| Regra | Valor |
|---|---|
| Tamanho | 128×128 px, exibidos entre 22 e 56 px |
| Formato | PNG com fundo transparente, ou SVG com caixa de 128 |
| Pasta e nome | `public/assets/icons/<nome>.<ext>` |
| Conteúdo | silhueta única, dois tons e um acento, sem texto e sem moldura |
| Peso | até 30 KB por PNG; até 4 KB por SVG |

| Ícone | Arquivo | Situação |
|---|---|---|
| Mover | `move` | existe em SVG |
| Atacar | `basic-attack` | existe em SVG |
| Desfazer movimento | `undo-move` | **não existe** |
| Encerrar turno | `end-turn` | existe em PNG |
| Runic Strike | `runic-strike` | existe em PNG |
| Marked Shot | `marked-shot` | existe em SVG |
| Arcane Burst | `arcane-burst` | existe em SVG |
| Healing Light | `healing-light` | existe em SVG |

Os ícones hoje misturam dois estilos: pintados em PNG e vetoriais chapados em SVG. A V3 unifica todos em uma só família, conforme `art-direction.md`.

### Texturas

| Regra | Valor |
|---|---|
| Tamanho | 512×512 px |
| Formato | PNG |
| Pasta e nome | `public/assets/textures/<nome>.png` |
| Conteúdo | tileável nas quatro bordas, vista de cima, luz uniforme, sem sombra pintada |
| Uso | repetição ajustada para uma lajota ter cerca de uma célula |

Existem `stone-floor.png` e `stone-wall.png`, as duas em 512×512. Nenhuma textura nova é necessária.

### Fontes

Arquivos WOFF2 em `public/assets/fonts/`, das famílias definidas em `art-direction.md`, com licença livre. Só os pesos usados.

## Orçamento da cena

| Item | Limite |
|---|---|
| Triângulos na tela | 60.000 |
| Chamadas de desenho | 150 |
| Luzes com sombra | 1 |
| Luzes pontuais | 4 |
| Mapa de sombra | 2048×2048 |
| Total de modelos importados | 4 MB |
| Total de assets 2D | 2 MB |

## Carga

- Todos os modelos são carregados antes do primeiro quadro da batalha. Não há troca de modelo com a batalha em andamento.
- Se um `.glb` falha ao carregar, a unidade usa o kit em Three.js, e o problema é registrado no console. O jogo nunca fica sem modelo.
- O caminho do modelo, o fator de escala e a tabela de nomes de clipes são declarados em um só lugar, junto dos dados visuais da unidade.

## Nomes e pastas

```
public/assets/
  models/characters/<UnitType>.glb
  portraits/<UnitType>.png
  icons/<nome>.png | .svg
  textures/<nome>.png
  fonts/<família>-<peso>.woff2
```

- Nomes em minúsculas com hífen, iguais aos identificadores do código (`UnitType`, `SkillId`).
- Sem número de versão no nome do arquivo.

## Critérios de aceite

Para todo asset:

- [ ] Origem e licença registradas em `asset-generation.md`.
- [ ] Nome e pasta conforme esta especificação.
- [ ] Dentro do orçamento de tamanho e de triângulos.
- [ ] Passa na lista de consistência de `art-direction.md`.

Para personagens, além disso:

- [ ] Pivô no chão em `(0, 0, 0)`, frente em `+Z`, altura da tabela.
- [ ] Os seis clipes existem com os nomes normalizados, ou têm a reserva definida.
- [ ] Nenhum clipe desloca a raiz.
- [ ] A regra de morte do time é cumprida, inclusive depois de sincronizar o estado e depois do reinício.
- [ ] Opacidade de 75% sem artefatos de ordem de desenho.
- [ ] A caixa de clique existe enquanto a unidade vive e some quando ela morre.
- [ ] Legível com a câmera nos quatro lados.

## Lacunas conhecidas

- Não há ainda nenhum arquivo `.glb` no projeto; `public/assets/models/` não existe.
- Os pacotes livres avaliados não trazem um goblin nem um clérigo prontos. Essas duas unidades começam no kit em Three.js ou em uma variante de outro modelo com acessórios e cores próprias.
- Falta o ícone de desfazer movimento.
- Três retratos são provisórios.
