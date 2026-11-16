# Direção de arte

Este documento define a aparência do Rune Tactics a partir da V3 visual. Ele descreve o alvo; o código em `src/rendering/`, `src/ui/` e `src/style.css` ainda está no visual anterior. As medidas e formatos de cada asset estão em `visual-asset-specification.md`, e a interface em `ui-design-system.md`.

## Escopo

A referência é `references/ref-v3.png`. Dela vêm o clima, a paleta, a luz e a organização da interface. Dela **não** vêm mecânicas: terreno em vários níveis, pontes, baús, relíquias, objetivos, níveis de herói, chefes e efeitos de célula continuam fora do jogo.

Consequências práticas:

- O tabuleiro continua plano, com 12×12 células. Nenhum elemento de arte sugere altura jogável dentro da grade.
- Escadas, pontes, cachoeiras, altar e estandartes podem existir só como cenário, fora das células.
- Nenhum inimigo é desenhado como chefe: não há unidade maior que o Armored Skeleton.

## Pilares

1. **Leitura tática antes de beleza.** A qualquer ângulo da câmera, o jogador identifica em um relance o time, a classe e a unidade ativa. Se um detalhe bonito atrapalha isso, ele sai.
2. **Miniatura de mesa.** O campo de batalha parece uma maquete sobre uma laje flutuante: formas robustas, proporções de boneco, poucos materiais.
3. **Facetas, não texturas.** A forma é dada por planos chapados que pegam a luz. Textura só no piso e nos muros.
4. **Paleta curta.** Pedra fria, luz quente de tocha, e uma cor forte por classe. Vermelho pertence aos inimigos.
5. **Um só conjunto.** Modelos, retratos, ícones e interface usam as mesmas cores e as mesmas formas-assinatura.

## Estilo visual

- **Gênero:** RPG tático medieval de fantasia, low-poly, visto de cima em três quartos com câmera ortográfica.
- **Low-poly de verdade:** poucas faces, grandes e legíveis. Sombreamento chapado em todas as faces. Sem suavização, sem normal map, sem microdetalhe.
- **Forma antes de detalhe:** cada objeto se resolve com três a oito volumes simples. Um detalhe só entra se muda a silhueta.
- **Pequenas imperfeições:** vértices levemente deslocados e variação sutil de tom entre faces vizinhas, para a pedra e a madeira não parecerem plástico.
- **Sem realismo:** nada de fotorrealismo, ruído fino, gradientes suaves em superfícies, texto embutido em textura ou sprites 2D no lugar de unidades 3D.

## Paleta

### Ambiente

| Uso | Cor | Hex |
|---|---|---|
| Fundo e névoa | azul-noite | `#0f172a` |
| Pedra do piso, clara | ardósia | `#64748b` |
| Pedra do piso, escura | ardósia funda | `#475569` |
| Muros e pilares | ardósia azulada | `#55627a` |
| Laje e corte lateral | pedra escura | `#334155` |
| Madeira de caixote e barril | castanho | `#8b5a2b` |
| Ferragens | ferro escuro | `#3f3f46` |
| Musgo e folhagem | verde fechado | `#2d5a3c` |
| Chama e luz de tocha | âmbar | `#f59e0b`, `#fb923c` |
| Estandarte aliado | azul real | `#2563eb` |
| Estandarte inimigo | carmim | `#b91c1c` |

### Heróis

Cada herói tem uma cor de classe, usada em pelo menos 40% da superfície visível do modelo, no retrato e no acento do card.

| Classe | Cor de classe | Secundária | Acento |
|---|---|---|---|
| Guerreiro | azul real `#3b82f6` | aço `#cbd5e1` | ouro velho `#cba662` |
| Arqueira | verde floresta `#22c55e` | couro `#8b5a2b` | madeira clara `#d6a86a` |
| Mago | púrpura `#a855f7` | índigo `#4338ca` | cristal ciano `#22d3ee` |
| Clérigo | marfim `#f1f5f9` | ouro `#eab308` | azul celeste `#7dd3fc` |

### Inimigos

Todos os inimigos compartilham osso e ferro, dessaturados, com carmim como única cor forte.

| Tipo | Base | Secundária | Acento |
|---|---|---|---|
| Melee Skeleton | osso `#e5e7eb` | ferro `#57534e` | carmim `#ef4444` |
| Skeleton Archer | osso `#e5e7eb` | pano escuro `#44403c` | carmim `#ef4444` |
| Armored Skeleton | ferro `#57534e` | osso `#d6d3d1` | carmim `#dc2626`, bronze `#a16207` |
| Goblin Scout | pele oliva `#6b8e23` | couro escuro `#422006` | lenço carmim `#ef4444` |
| Cultist Mage | manto vinho `#4a0d1f` | preto `#18181b` | brilho magenta `#f43f5e` |

O goblin é oliva fosco, nunca o verde vivo da Arqueira. O cultista é vinho e preto, nunca o púrpura do Mago.

### Destaques no tabuleiro

| Significado | Cor | Hex |
|---|---|---|
| Células alcançáveis | azul | `#3b82f6` |
| Caminho e seleção | amarelo | `#facc15` |
| Destino sob o cursor | verde | `#22c55e` |
| Alcance de ataque | vermelho suave | `#f87171` |
| Alvo atacável | vermelho | `#ef4444` |
| Alcance e área de habilidade | púrpura | `#a855f7` |
| Alvo de cura | verde claro | `#4ade80` |

Essas cores não são usadas em modelos nem em cenário dentro da grade, para o destaque nunca se confundir com um objeto.

## Tratamento visual das equipes

O time é lido por quatro sinais redundantes, para funcionar mesmo com a câmera girada e para quem não distingue bem cores:

| Sinal | Aliados | Inimigos |
|---|---|---|
| Temperatura | cores frias e de joia, saturadas | osso e ferro dessaturados, com carmim |
| Anel na base | azul `#3b82f6`; dourado `#facc15` quando ativo | vermelho `#ef4444` |
| Barra de HP | verde | vermelha |
| Moldura do retrato | azul ou dourada | vermelha |

A unidade com a ativação aberta aparece com opacidade total e o anel dourado ou vermelho mais intenso. As demais vivas ficam a 75%.

## Proporções dos personagens

- **Boneco de três cabeças.** A cabeça ocupa cerca de um terço da altura. Mãos e armas são exageradas em cerca de 30%.
- **Altura de referência:** 1,05 unidade para um herói, em uma célula de 1,0. Cada unidade cabe em um cilindro de 0,6 de diâmetro, para nunca invadir a célula vizinha.
- **Pés firmes:** base larga e pernas curtas. Nada de membros finos que somem a distância.
- **Arma sempre visível de cima:** ela fica ao lado ou acima do corpo, nunca escondida atrás dele.

| Unidade | Altura | Largura | Postura |
|---|---|---|---|
| Guerreiro | 1,05 | larga | ereto, ombros largos |
| Arqueira | 1,05 | estreita | leve, um pé à frente |
| Mago | 1,10 com o chapéu | média, em cone | ereto, cajado ao lado |
| Clérigo | 0,95 | larga | atarracado |
| Goblin Scout | 0,80 | estreita | curvado para a frente |
| Melee Skeleton | 1,00 | estreita | levemente curvado |
| Skeleton Archer | 1,00 | estreita | ereto |
| Armored Skeleton | 1,25 | muito larga | pesado, ombreiras |
| Cultist Mage | 1,05 | média, em cone | curvado, braços recolhidos |

## Formas e silhuetas

Cada unidade tem uma forma-assinatura, reconhecível em preto chapado e repetida no retrato.

| Unidade | Forma-assinatura | Arma | Detalhe que não pode faltar |
|---|---|---|---|
| Guerreiro | trapézio de ombros largos com escudo em pipa | espada reta | crista azul no elmo e viseira escura |
| Arqueira | capuz pontudo e arco longo na vertical | arco e aljava em diagonal nas costas | capuz verde cobrindo os ombros |
| Mago | cone alto: chapéu ou capuz pontudo e manto até o chão | cajado mais alto que a cabeça | cristal ciano aceso na ponta do cajado |
| Clérigo | bloco baixo e largo, com tabardo | maça ou martelo curto | símbolo dourado no peito e capuz marfim |
| Goblin Scout | corpo pequeno, curvado, com orelhas pontudas na horizontal | adaga | lenço carmim no pescoço |
| Melee Skeleton | corpo magro com costelas aparentes | espada curta e escudo redondo | órbitas escuras e escudo com faixa carmim |
| Skeleton Archer | corpo magro, sem escudo | arco | capuz de pano rasgado |
| Armored Skeleton | o maior volume do tabuleiro: ombreiras e elmo com chifres | machado de duas mãos | placas de ferro com rebites de bronze |
| Cultist Mage | cone com capuz fechado, sem rosto | orbe flutuando à frente das mãos | dois olhos acesos em magenta dentro do capuz |

Pares que precisam se distinguir de longe:

- **Mago e Cultist Mage:** o Mago é claro, ereto, com cajado alto; o cultista é escuro, curvado, sem cajado.
- **Arqueira e Skeleton Archer:** capuz cheio e verde contra corpo magro e osso.
- **Guerreiro e Armored Skeleton:** escudo e azul contra chifres, ferro e tamanho maior.
- **Clérigo e Guerreiro:** o Clérigo é mais baixo, marfim, sem escudo.

## Cenário

- **Laje flutuante.** O tabuleiro fica sobre um bloco de pedra com a lateral visível, como uma maquete. O corte mostra camadas de pedra em dois tons.
- **Pátio de ruínas.** Piso de lajotas irregulares, muros quebrados, arcos e pilares. Musgo nas juntas e no pé dos muros.
- **Obstáculos lidos pela altura.** Parede e pilar são altos, 1,2 ou mais, e bloqueiam a visão. Caixote e barril são baixos, 0,7 ou menos, e não bloqueiam. A altura é a pista visual da regra, e isso não pode ser quebrado por decoração.
- **Moldura fora da grade.** Estandartes, tochas, ruínas altas e vegetação ficam fora das 144 células. Como a câmera gira 360°, toda peça alta do perímetro é escondida quando fica entre a câmera e o tabuleiro.
- **Três mapas, um só kit.** Os três traçados usam as mesmas peças. A diferença entre eles está no arranjo, em um tom de pedra e na cor dos estandartes.

## Iluminação

O clima é de noite clara em ruínas: luz fria de cima, calor das tochas embaixo.

| Luz | Papel | Cor | Observação |
|---|---|---|---|
| Direcional principal | luar, define os planos e projeta sombra | branco frio `#eef4ff` | alta, de lado; sombra suave |
| Ambiente e hemisférica | preenchimento | azul acinzentado `#9fb4d4` | nenhuma face fica preta |
| Tochas, quatro pontos | calor e foco nos cantos | âmbar `#f59e0b` | oscilação leve, nunca pulsante |
| Emissivos | magia e olhos | por classe | pequenos, pontuais |

Regras:

- **Contraste quente e frio.** Toda face lê como iluminada pelo luar ou aquecida por tocha. É isso que dá volume às facetas.
- **Legível em qualquer ângulo.** A câmera gira, então o preenchimento precisa manter visível o lado oposto à luz principal.
- **Sombra como âncora.** Toda unidade projeta sombra no piso. Sem sombra, o boneco parece flutuar.
- **Névoa só na distância.** Ela esconde a borda do mundo, nunca o tabuleiro.
- **Cores fiéis.** Mapeamento de tom neutro, sem estouro de brilho. O brilho de magia vem de materiais emissivos, sem pós-processamento pesado.

## Materiais

O material padrão é `MeshStandardMaterial` com `flatShading: true`.

| Superfície | Rugosidade | Metal | Textura | Emissivo |
|---|---|---|---|---|
| Pano, couro, pele | 0,85 a 0,95 | 0 | não | não |
| Osso | 0,75 | 0 | não | não |
| Madeira | 0,85 | 0 | não | não |
| Pedra de muro e pilar | 0,90 | 0 | `stone-wall.png` | não |
| Piso | 0,85 a 0,90 | 0,05 | `stone-floor.png` | não |
| Aço e ferro | 0,40 a 0,55 | 0,45 a 0,60 | não | não |
| Ouro e bronze | 0,45 | 0,60 | não | não |
| Cristal, orbe, olhos | 0,30 | 0 | não | sim, intensidade 1,0 a 2,0 |
| Chama | — | — | não | cor plena, sem iluminação |

Regras:

- **Sombreamento chapado em tudo** que é personagem ou objeto. O piso também, apesar da textura.
- **Cor por material, não por textura.** Personagens não usam textura pintada. Um modelo importado pode trazer um atlas de cores chapadas, desde que sem sombra pintada.
- **Variação de tom por face** de até 4% de luminosidade em pedra, madeira e pano, para quebrar a uniformidade. Sem variação em metal e em cor de classe.
- **Emissivo só com significado:** cristal do Mago, olhos e orbe do cultista, símbolo do Clérigo ao curar, chamas, efeitos de habilidade.
- **Sem transparência em modelos,** exceto a regra de 75% das unidades inativas e os efeitos.
- **Texturas** são só duas, tileáveis, sem sombra pintada e com iluminação uniforme.

## Tipografia

| Papel | Família | Uso |
|---|---|---|
| Título e destaque | Cinzel, com serifa | nome do jogo, nome do mapa, nome da unidade, resultado da batalha |
| Interface | Inter, sem serifa | rótulos, botões, números, texto corrido |

- As fontes são servidas pelo próprio projeto, com a pilha do sistema como reserva. Nenhuma requisição externa em tempo de jogo.
- Números de HP, dano e recarga usam algarismos tabulares, para não dançarem ao mudar.
- Títulos em caixa alta com espaçamento largo. Texto de interface em caixa normal.
- Nenhum texto com menos de 11 px. Nenhum texto dentro de imagem.

## Estilo da interface

- **Painéis de pedra escura e metal.** Fundo azul-noite quase opaco, borda fina em ouro velho, cantos pouco arredondados. Lembram placas de ferro e madeira escura, sem textura fotográfica.
- **A interface emoldura, não cobre.** Os painéis ficam nas bordas. O centro da tela é do tabuleiro.
- **Cor com função.** Azul para o jogador e para movimento, vermelho para inimigos e ataque, púrpura para habilidade, dourado para a unidade ativa e para a ação principal.
- **Retratos como identidade.** Toda menção a uma unidade vem com o retrato dela.
- **Movimento discreto.** Transições curtas, sem quicar e sem brilho pulsando sem motivo.

## Ícones

- **Uma só família.** Todos os ícones de ação e de habilidade têm o mesmo tratamento. Hoje há ícones pintados e ícones vetoriais chapados misturados; a V3 unifica.
- **Silhueta única e centrada,** legível a 24 px, ocupando cerca de 70% do quadro.
- **Dois tons mais um acento.** A cor do acento segue a função: azul para mover, vermelho para atacar, a cor da classe para a habilidade, cinza para desfazer, dourado para encerrar o turno.
- **Sem texto, sem moldura e sem fundo próprio.** A moldura é do botão.
- **Mesmo ângulo e mesma luz** em todos: de frente, luz de cima à esquerda.
- **Vocabulário:** bota para mover, espada para atacar, seta em curva para desfazer, ampulheta para encerrar o turno, e o gesto de cada habilidade (lâmina com runa, flecha com mira, explosão em cruz, luz com cruz).

## Retratos

- Busto em três quartos, olhando para o centro da tela.
- Mesma luz dos modelos: principal fria de um lado, contraluz quente do outro.
- Fundo ardósia escuro e liso, sem cenário.
- A forma-assinatura e a cor de classe aparecem inteiras no quadro.
- Mesmo estilo low-poly estilizado dos modelos. Os três retratos que hoje são provisórios (Clérigo, Goblin Scout e Cultist Mage) são refeitos nesse padrão.

## Animação

| Regra | Valor |
|---|---|
| Passo de movimento | 0,12 s por célula, com leve salto |
| Golpe corpo a corpo | 0,34 s: recuo, avanço, retorno |
| Disparo | 0,34 s, com o impacto perto de 60% do tempo |
| Habilidade | 0,3 a 0,6 s, com o efeito no impacto |
| Reação a dano | 0,15 s: clarão branco e pequeno recuo |
| Morte | 0,3 a 0,5 s |
| Giro de orientação | pelo menor arco, em cerca de 0,2 s |

- **Antecipação e peso.** Todo golpe tem um recuo curto antes e um assentamento depois.
- **Uma ação por vez.** As animações de combate entram em fila; os controles ficam travados enquanto ela toca.
- **Nada demora.** Nenhuma ação isolada passa de 1,2 s. O jogo é tático, e o jogador não espera animação.
- **Repouso vivo, mas discreto.** Respiração de baixa amplitude em todas as unidades; um pouco mais marcada na ativa.
- **O dano aparece no impacto,** nunca antes: barra de HP, clarão e número caem juntos.
- **Morte por time.** Aliado cai e permanece deitado no chão. Inimigo cai, encolhe e desaparece.
- **Sem tremor de câmera** e sem câmera lenta.
- **Movimento reduzido.** Com a preferência do sistema ativa, saltos e clarões são atenuados, sem mudar a duração das ações.

## Efeitos

- Formas geométricas simples: anéis, estilhaços, esferas, cruzes. Sem partículas fotográficas.
- A cor do efeito é a da classe ou a da função: ciano e púrpura para o Mago, verde para a Arqueira, azul claro para o Guerreiro, verde e dourado para a cura, vermelho para ataques inimigos.
- Todo efeito some em menos de 0,6 s e não deixa resíduo no tabuleiro.

## Consistência entre assets

Um asset novo só entra se passar em todos os itens:

- [ ] Usa só cores das tabelas deste documento.
- [ ] A silhueta em preto chapado identifica a unidade ou o objeto.
- [ ] Lê bem a 45° e com a câmera girada para os outros três lados.
- [ ] Tem a mesma densidade de faces e o mesmo nível de detalhe dos vizinhos.
- [ ] Usa sombreamento chapado e os valores de material da tabela.
- [ ] Não traz textura com sombra pintada, texto ou marca.
- [ ] Modelo, retrato e ícone da mesma unidade mostram a mesma forma-assinatura e a mesma cor.
- [ ] Não sugere uma mecânica que o jogo não tem.
- [ ] Segue `visual-asset-specification.md` e está registrado em `asset-generation.md`, com origem e licença.

## O que evitar

- Fotorrealismo, ruído fino, sombreamento suave e brilho especular forte.
- Vermelho em herói ou em cenário dentro da grade.
- Verde vivo no goblin e púrpura no cultista.
- Decoração alta dentro da grade que não seja obstáculo de verdade.
- Elementos que sugiram desnível, objetivo ou chefe.
- Ícones de famílias diferentes lado a lado.
- Texto dentro de imagens.
