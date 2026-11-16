# Roadmap

A V2 é a versão atual e está concluída. A V3 e a V4 estão aqui apenas como direção: nada delas foi implementado, e nenhum código deve ser escrito para antecipá-las sem um pedido explícito.

## V1: protótipo de sistemas (concluída)

Referência: `references/ref-v1.png`.

- Tabuleiro 8x8 com obstáculos, um guerreiro contra dois esqueletos.
- Movimento ortogonal, ataque corpo a corpo, turnos, vitória e derrota.
- Na V1.1, movimento e ataque passaram a valer em qualquer ordem, e o turno passou a terminar sozinho quando não sobra ação.

## V2: RPG tático (concluída)

Referência: `references/ref-v2.png`. As regras estão em `docs/game-design.md`.

- Três classes de herói: guerreiro, arqueira e mago.
- Uma habilidade com recarga por classe: Runic Strike, Marked Shot e Arcane Burst, esta em área.
- Ataque à distância com linha de visão. Paredes e pilares bloqueiam a visão; caixotes e barris bloqueiam só o movimento.
- Três tipos de esqueleto, cada um com comportamento próprio: Melee Skeleton, Skeleton Archer e Armored Skeleton.
- Várias unidades por lado, com seleção livre entre os heróis.
- Arena medieval com piso e muros de pedra, ruínas e tochas.
- HUD com retratos, barra de ações e ícones, com os assets em `public/assets/`.

Estes itens apareciam na referência da V2 e não entraram. Passam para a V3:

- Chefe (War Chief).
- Objetivos de missão, como manter o altar rúnico por 3 rodadas.
- Ordem de turno por unidade, exibida em uma barra.
- Nível dos heróis.
- Habilidade defensiva (Guard).
- Tipos de terreno com custo de movimento e efeito.

## V3: campos maiores e táticas mais profundas (planejada, não implementada)

Referência: `references/ref-v3.png`.

- Os itens adiados da V2, listados acima.
- Mapas maiores, com terreno em vários níveis. Terreno alto custa mais movimento e dá bônus de ataque e defesa.
- Mais classes (clérigo anão) e mais tipos de inimigo (goblin, mago inimigo).
- Atributo de defesa e mais habilidades (Shield Wall).
- Efeitos de célula, como o campo arcano que causa dano e aplica fraqueza.
- Itens, relíquias e baús.
- Progressão dos heróis entre batalhas.

## V4: a definir (planejada, não implementada)

Não há referência para a V4. As ideias abaixo são provisórias e precisam ser confirmadas antes de qualquer planejamento:

- Campanha com várias missões encadeadas.
- Partidas salvas.
- Som e música.
