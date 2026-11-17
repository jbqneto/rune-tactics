# Análise Visual de Cenários e Arquitetura Modular (V4)

Este documento consolida a **Entrega 1** da melhoria visual dos cenários **Pântano Esquecido (`forgotten-swamp`)** e **Fortaleza dos Ossos (`fortress`)** do Rune Tactics V4, preservando integralmente o contrato do motor (`IGameEngine`), a malha plana 12×12 (`GridSystem`), a câmera orbital de 360° (`CameraController`), o raycasting (`InputManager`) e a identidade low-poly estilizada definida em `docs/art-direction.md`.

---

## 1. Mapeamento Explícito das Imagens de Referência

> [!IMPORTANT]
> **ATENÇÃO PARA OS AGENTES DE IMPLEMENTAÇÃO:** Os nomes numéricos dos arquivos em `references/scenarios/` estão invertidos em relação à ordem das fases da campanha (`stage-2-swamp` e `stage-3-fortress`). Utilize exclusivamente o mapeamento validado abaixo:

| Arquivo de Referência | Cenário Correspondente | `mapId` (`gameConfig.ts`) | Fase na Campanha (`CAMPAIGN_STAGES`) |
|---|---|---|---|
| `references/scenarios/scenario_02.png` | **Fortaleza dos Ossos** | `'fortress'` (`"Fortaleza Abandonada"`) | **Fase 3** (`stage-3-fortress` — *"Muralha de Escudos"*) |
| `references/scenarios/scenario_03.png` | **Pântano Esquecido** | `'forgotten-swamp'` (`"Pântano Esquecido"`) | **Fase 2** (`stage-2-swamp` — *"As Três Pontes da Névoa"*) |

---

## 2. Diagnóstico Técnico Atual (Código & Restrições)

A inspeção de `src/game/grid/GridSystem.ts`, `src/config/gameConfig.ts`, `src/rendering/BoardRenderer.ts`, `src/rendering/SceneManager.ts`, `src/rendering/CameraController.ts` e `src/input/InputManager.ts` revelou os seguintes fatos e invariantes:

### 2.1 `GridSystem` e Mapeamento de Coordenadas
- **`GridSystem` (`src/game/grid/GridSystem.ts`) é estritamente plano 2D (12×12):** não há campo de elevação/altura em `GridCoord`, `ObstacleDef` ou `UnitState`. Todas as 144 células jogáveis têm exatamente a mesma altura lógica (`y = 0` no mundo 3D).
- **`BoardRenderer.gridToWorld(coord, y = 0)`** (`src/rendering/BoardRenderer.ts:177-184`):
  - `CELL_SIZE = 1`, `TILE_HEIGHT = 0.16`, `half = 5.5`.
  - `worldX = coord.x - 5.5` → `x = 0` fica em `-5.5` (Oeste); `x = 11` fica em `+5.5` (Leste).
  - `worldZ = 5.5 - coord.y` → `y = 0` (spawn dos heróis, Sul) fica em `+5.5`; `y = 11` (spawn dos inimigos, Norte) fica em `-5.5`.
  - Portanto, a área útil do tabuleiro ocupa `[-6.0, +6.0] × [-6.0, +6.0]` no plano `XZ`, com topo dos pisos secos em `y = 0.0` (`tile.position.y = -0.08`).
- **Projeção da Câmera Inicial (`CameraController.ts` + `SceneManager.ts`):**
  - `INITIAL_AZIMUTH = Math.PI / 4`, `CAMERA_RADIUS = 20.0`, `CAMERA_HEIGHT_Y = 12.8`, `target = (0, 0.35, 0)`, `frustumSize = 14.8`, `near = 0.1`, `far = 100`.
  - A câmera inicial fica no quadrante **Sudeste (`+X, +Z`)** olhando para **Noroeste (`-X, -Z`)**, com inclinação vertical `tan(pitch) = (12.8 - 0.35) / 20.0 = 0.6225` (`~31.9°`).
  - Na tela inicial (16:9, largura útil de frustum ~`26.3` unidades × altura `14.8`):
    - **Aresta superior-esquerda** = borda Oeste (`x = -6`, `coord.x = 0`).
    - **Aresta superior-direita** = borda Norte (`z = -6`, `coord.y = 11`, lado dos inimigos).
    - **Aresta inferior-esquerda** = borda Sul (`z = +6`, `coord.y = 0`, lado dos heróis).
    - **Aresta inferior-direita** = borda Leste (`x = +6`, `coord.x = 11`).
    - **Margens ao redor do losango 12×12:** sobram ~`4.6` unidades laterais e ~`2.9` unidades verticais em projeção ortográfica (alcance de mundo até `r ≈ 25–38` dentro de `far = 100`), espaço ideal para plataformas externas, torres, portões, penhascos, cachoeira e horizonte sem invadir o grid.

### 2.2 Estratégia de Elevação e Profundidade sem Quebrar o Grid
1. **Dentro da grade 12×12 (`|x| ≤ 6.0`, `|z| ≤ 6.0`):**
   - **Proibido sugerir desnível jogável ou degraus dentro das 144 células:** todas as unidades (`UnitRenderer.gridToWorld(pos, 0)`), destaques (`BoardHighlights`) e trajetórias (`pathGroup`) permanecem rigorosamente no plano `y = 0`.
   - **Obstáculos internos em 3D rico:** evoluir as geometrias de `wall`, `pillar`, `crate`, `barrel` e `water` respeitando rigorosamente o envelope visual da regra (`AGENTS.md` / `art-direction.md`):
     - `wall` e `pillar` (`blocksLos: true`): altura entre **`1.15` e `1.45`**, base contida na célula (`≤ 0.90 × 0.90`).
     - `crate` e `barrel` (`blocksLos: false`): altura **`≤ 0.68`**, visualmente abaixo da linha de tiro.
     - `water` (`blocksLos: false`): rebaixada (`y = -0.045` plano d'água, leito em `-0.22`), nunca entra em `obstacleMeshes`.
   - **Bug identificado em `buildBridgeCell` (`BoardRenderer.ts:678-685`):** hoje as tábuas da ponte estão em `y = 0.005` com altura `0.05` (topo em **`+0.030`**), acima dos planos de `BoardHighlights` (`y = 0.010` a `0.024`) — o que encobre destaques de alcance, movimento, perigo e hover nas `bridgeCells`!
     - **Correção obrigatória:** posicionar o deck das tábuas da ponte com **topo em `y = -0.003`** (e vigas inferiores mergulhadas em `y < -0.02`), mantendo corrimãos apenas nas bordas externas adjacentes a `'water'` (`x ± 0.44`).
2. **Fora da grade 12×12 (`|x| > 6.15` ou `|z| > 6.15`, ou `y < -0.16`):**
   - **Plataformas elevadas, terraços de borda e escadarias decorativas:** ficam **exclusivamente fora das células jogáveis** (por exemplo, a partir de `±6.35`), conectando visualmente o pátio 12×12 a terraços elevados ao Norte/Oeste (como o terraço do Portal Gótico com medalhão no Pântano e o terraço da Torre de Vigia/Portão na Fortaleza), com degraus de pedra descendo ao nível da borda do tabuleiro ou para fora do penhasco.
   - **Terreno envolvente e horizonte:** penhascos escarpados (`y` de `-0.16` até `-12`), espelhos d'água estendidos no pântano, cachoeira, pinheiros/árvores distantes e silhuetas de castelo/aqueduto no horizonte, além de um anel cilíndrico de céu/horizonte 360° (`r = 38`, `BackSide`, `fog: false`, `raycast = () => {}`).

### 2.3 Raycasting, `userData` e Oclusão de Câmera 360°
1. **Inspeção de `InputManager.ts:259-263` e `BoardRenderer.ts:578-669`:**
   - `InputManager` lança o raycaster **com `recursive = false`** apenas sobre três listas: `unitRenderer.getUnitHitboxes()`, `board.getObstacleMeshes()` e `board.getTileMeshes()`.
   - **Problema atual encontrado:** em `BoardRenderer.ts`, os meshes de `pillar`, `wall`, `crate` e `barrel` adicionados a `this.obstacleMeshes` **não possuem `userData`**. Isso viola o princípio de `AGENTS.md` (*"Objetos que entram no raycast levam uma marca explícita em `userData`"*).
   - **Correção obrigatória:**
     - Todo `tile` em `tileMeshes`: `tile.userData = { kind: 'tile', gridCoord: { x, y } }`.
     - Todo mesh sólido em `obstacleMeshes`: `mesh.userData = { kind: 'obstacle', obstacleKind: obs.kind, gridCoord: obs.pos }`.
     - Ornamentos menores presos a obstáculos ou células de água (musgo pendente, folhas de vitória-régia, flores, juncos, pregos/detalhes finos) recebem `mesh.raycast = () => {}` e **não** entram em `obstacleMeshes`, garantindo que a silhueta sólida da regra bloqueie cliques atrás de obstáculos internos sem falsos bloqueios por folhagem.
     - Objetos do perímetro e do terreno externo **nunca** entram em `obstacleMeshes` nem em `tileMeshes`, e seus filhos podem receber `raycast = () => {}`.
2. **Problema atual de oclusão na câmera 360°:**
   - **Hoje NÃO existe nenhum sistema de ocultação dinâmica por azimute em `BoardRenderer.ts` ou `SceneManager.ts`.** Em `fortress` (`BoardRenderer.ts:455-497`), os muros do lado `+X` e `+Z` foram simplesmente modelados mais baixos (`0.7`) presumindo a câmera inicial em `π/4`. Ao girar a câmera 180°, os muros altos do lado `-Z` (`1.9`) encobrem visualmente o tabuleiro.
   - **Solução arquitetural (Corte Isométrico Automático em 2 Partes):**
     - Toda peça alta fora da grade (muralha, portão, torre de vigia, tenda, arcos góticos, árvore ancestral, pinheiros próximos, pilares de borda e braseiros altos com topo `height > 0.55`) é dividida em:
       1. **Base/Embasamento baixo (`y ≤ 0.45`)**: sempre visível, preservando a leitura do perímetro e o contorno da maquete em 360°.
       2. **Superestrutura alta (`y > 0.45`)**: agrupada em um `THREE.Group` registrado em `PerimeterOccluder[]`.
     - A lógica geométrica pura fica isolada em `src/rendering/scenarioOcclusion.ts` (sem Three.js e sem DOM, 100% testável em Vitest Node).
     - A cada frame (`BoardRenderer.update(dt, cameraAzimuth)`), calcula-se `isPerimeterOccluderBlocking(bounds, azimuth)` usando a projeção ortográfica real ao longo de `-camDir = (-sin(az), -cos(az))` com inclinação `tanPitch = 12.45 / 20.0 = 0.6225`. Se a peça estiver do lado da câmera (`dot(center, camDir) > 0`) e sua projeção entre `y = 0.45` e `y = height` interceptar o quadrado do tabuleiro `[-6.2, +6.2]²`, a superestrutura recebe `visible = false` automaticamente.

---

## 3. Análise Visual Detalhada dos Cenários

### 3.1 Cenário A: Fortaleza dos Ossos — `fortress` (`references/scenarios/scenario_02.png`)

#### A. Composição e Leitura Espacial
- **Conceito:** Bastilha fronteiriça em platô rochoso escarpado ao entardecer, sobrelevada acima de um vale nevoado com rio, ponte distante e castelo no horizonte.
- **Mapeamento para o layout de `fortress` em `src/config/gameConfig.ts`:**
  - Tabuleiro 12×12: pátio empedrado com lajotas desgastadas, tufos de grama/musgo nas bordas e cobertura tática interna:
    - `wall` (10 células): `[2..4, 5]`, `[7..9, 5]`, `[2..3, 7]`, `[8..9, 7]` — duas linhas de muralhas arruinadas internas que formam um gargalo central (`x = 5, 6`) e corredores laterais (`x = 0..1`, `x = 10..11`).
    - `pillar` (4 células): `[5, 3]`, `[6, 3]`, `[5, 8]`, `[6, 8]` — contrafortes duplos nos pátios Sul e Norte.
    - `crate` (4 células): `[0, 5]`, `[11, 5]`, `[4, 8]`, `[7, 8]`.
    - `barrel` (2 células): `[1, 3]`, `[10, 3]`.
  - **Perímetro Norte (`z < -6.3`, atrás dos inimigos):** Muralha defensiva fortificada com ameias/merlões intercalados, trepadeiras/heras descendo pelas juntas e **Portão Principal em Arco de Pedra** centralizado (`x ≈ 0, z ≈ -7.1`) com **grade levadiça de ferro (portcullis)** semiaberta, duas torres laterais creneladas, **dois grandes Braseiros com fogo vivo** em pedestais e **dois Estandartes Carmim** (emblema de espada dourada com louros), revelando uma estrada de pedra que continua além do portão.
  - **Perímetro Oeste (`x < -6.3`, lateral esquerda):** **Torre de Vigia de Madeira** de dois andares com treliças em X, telhado piramidal em telha terracota, lanterna suspensa brilhante, estandarte carmim vertical, paliçada de estacas pontiagudas na base, além de pilhas de caixotes/barris e uma **Tenda Militar Carmim** apoiada em armação de madeira junto à muralha Noroeste.
  - **Perímetro Sul (`z > +6.3`) e Leste (`x > +6.3`):** Muretas baixas em ruínas, um **pequeno arco em ruína** decorativo na borda externa Leste/Sul, **escadarias de pedra** externas descendo para os terraços inferiores da escarpa, tufos de grama e pequenas flores vermelhas/brancas entre as pedras.
  - **Camada de Penhascos e Profundidade Externa:**
    - Paredes de penhasco rochoso facetado caindo abaixo da laje (`y = -0.16` até `-9.5`) em todos os quatro lados.
    - **Cachoeira no penhasco Leste (`+X`):** filetes escalonados de água translúcida animada caindo por entre as rochas para nuvens de névoa na base.
    - **Horizonte:** grupos de pinheiros escuros ao redor das bordas externas do platô; vale abaixo com fita sinuosa de rio, arco de ponte distante, colinas em camadas e **silhueta de castelo distante** no topo de um penhasco; anel de céu crepuscular 360° ao fundo.

#### B. Materiais, Iluminação e Paleta (`fortress`)
- **Iluminação e Atmosfera:**
  - Céu/fundo crepuscular azul-ardósia (`#24324d`) com névoa suave (`FogExp2`, `#2a3650`, densidade `0.0085`).
  - Luz direcional quente de fim de tarde (`#ffe6bf`, intensidade `1.55`) posicionada para projetar sombras nítidas pelas muralhas e torres através do pátio.
  - Luz hemisférica (`#8ec5e8` / `#2c353d`, intensidade `0.68`) + ambiente (`#94a3b8`, `0.45`) + contra-luz azulada (`#7dd3fc`, `0.50`) para manter leitura 360° sem faces pretas.
  - `PointLight`s quentes nos dois braseiros do Portão Norte e na lanterna da Torre Oeste (`#fb923c`, flicker suave).
- **Paleta Estruturada:**
  - Pedra clara do piso/muros: `#8b887e` / `#737067` (tom mais quente e envelhecido que a ardósia fria de `ruins`).
  - Junta/musgo entre lajotas e muretas: `#4e6936` / `#38522b`.
  - Penhasco rochoso: `#4b5059` / `#323741`.
  - Madeira (torre, paliçada, caixotes, barris): `#6e4728` / `#4f311b`.
  - Telhado terracota da torre: `#9a3e2e` / `#7c2d22`.
  - Tecido dos estandartes e tenda: carmim `#8f1d22` com borda/emblema dourado `#d4a24c` (fora do grid jogável!).
  - Ferro (grade do portão, aros, braseiros): `#2b2f38`.
  - Flores de acento na borda: `#c84b31` / `#e2e8f0` (sempre fora das células de combate).

---

### 3.2 Cenário B: Pântano Esquecido — `forgotten-swamp` (`references/scenarios/scenario_03.png`)

#### A. Composição e Leitura Espacial
- **Conceito:** Ruínas góticas antigas parcialmente submersas em lagoa turva e névoa espessa de brejo, interligadas por pontes de madeira e iluminadas por braseiros rúnicos.
- **Mapeamento exato para `forgotten-swamp` em `src/config/gameConfig.ts`:**
  - Tabuleiro 12×12: lajotas de pedra cinza-esverdeada cobertas de musgo úmido nas bordas, divididas horizontalmente ao centro pelas linhas `y = 5` e `y = 6`:
    - `water` (16 células, `blocksLos: false`): `[0..1, 5..6]`, `[3..4, 5..6]`, `[7..8, 5..6]`, `[10..11, 5..6]`.
    - `bridgeCells` (8 células, passagens livres): ponte esquerda (`x=2, y=5..6`), **ponte dupla central** (`x=5..6, y=5..6`), ponte direita (`x=9, y=5..6`).
    - `pillar` (4 células, `blocksLos: true`): `[2, 2]`, `[9, 2]`, `[2, 9]`, `[9, 9]` — pilares góticos quebrados com musgo.
    - `crate` (4 células, `blocksLos: false`): `[4, 3]`, `[7, 3]`, `[4, 8]`, `[7, 8]`.
    - `barrel` (4 células, `blocksLos: false`): `[1, 3]`, `[10, 3]`, `[1, 8]`, `[10, 8]`.
  - **Pontes Adaptativas (`bridgeCells`):**
    - Tábuas de madeira envelhecida alinhadas na direção Norte–Sul com deck rebaixado (`y_top = -0.003`) e travessas/estacas cravadas na água.
    - **Regra de corrimão por vizinhança:** postes curtos e corrimão lateral são gerados **somente nas arestas laterais (`±X`) adjacentes a células de `'water'`**. Assim, a ponte dupla central (`x = 5..6`) forma uma passarela única e larga com corrimãos apenas na esquerda de `x = 5` e direita de `x = 6`, fiel à ponte central da imagem `scenario_03.png` e sem barreiras no meio do caminho!
  - **Perímetro Norte (`z < -6.3`, lado dos inimigos):**
    - **Portal Gótico Principal em Ruínas** com arco ogival pontiagudo, janelas laterais em arco menor, blocos quebrados com musgo denso e vinhas pendentes.
    - Terraço elevado na borda Norte com **Medalhão Circular / Rosácea Rúnica gravada** no piso (`CanvasTexture`), **dois Estandartes Carmim** com emblema de árvore clara, **dois Braseiros acesos** e uma **escadaria larga de pedra** descendo para a borda do tabuleiro (decorativa, fora do grid).
  - **Perímetro Noroeste (`-X, -Z`):**
    - **Árvore Ancestral Retorcida do Pântano** de grande porte, com raízes espessas abraçando os blocos de pedra musgosa, copa tortuosa e cortinas de musgo pendente (*Spanish moss*), acompanhada de um braseiro e escadaria lateral externa.
  - **Perímetro Sudoeste (`-X, +Z`) e Sudeste (`+X, +Z`):**
    - Arco ogival menor em ruínas + braseiro no setor Sudoeste; colunas góticas quebradas e muretas musgosas nos cantos frontais/Leste; galhos/raízes sinuosos nos cantos extremos da escarpa.
  - **Água Contínua e Vegetação Aquática:**
    - Sob as 16 células de `'water'` e estendendo-se para além das bordas do grid (`[-18, +18]`), uma **bacia contínua de água pantanosa** (`y = -0.045`, semitransparente com textura animada e leito escuro em `-0.24`), de modo que o canal de água pareça natural e contínuo ao redor da maquete.
    - Vitórias-régias verdes, flores de lótus branco-rosadas e touceiras de juncos/taboas de pontas avermelhadas espalhadas nas bordas das células de água (com `raycast = () => {}`) e na lagoa externa.
  - **Camada de Profundidade Externa e Bruma:**
    - Arcos de aqueduto antigo meio submersos e pequena ponte em ruína ao fundo (`-Z / -X`).
    - Árvores retorcidas em silhueta envoltas por névoa.
    - Camadas sutis de bruma rasteira animada flutuando sobre a lagoa externa (`y ≈ 0.08`, planos suaves com gradiente radial em `CanvasTexture`, `raycast = () => {}`, `depthWrite = false`, sem invadir o tabuleiro jogável).

#### B. Materiais, Iluminação e Paleta (`forgotten-swamp`)
- **Iluminação e Atmosfera:**
  - Fundo/névoa crepuscular de pântano (`#132128`, `FogExp2` com densidade `0.015`).
  - Luz direcional fria filtrada pela neblina (`#d6e6f2`, intensidade `1.18`), equilibrada pela luz hemisférica (`#6b9aa8` / `#182924`, `0.62`) e rim light (`#67e8f9`, `0.40`).
  - Forte contraste quente localizado pelos **4 `PointLight`s âmbar-alaranjados** dos braseiros (`#f97316`, flicker orgânico), criando reflexos quentes nas pedras úmidas e na água ao redor das margens.
- **Paleta Estruturada:**
  - Pedra gótica desgastada: `#6c7877` / `#525e5f`.
  - Musgo espesso (topos de ruínas, juntas e margens): `#4a6b2f` / `#355022`.
  - Madeira úmida (pontes, caixotes, barris): `#5e412c` / `#402b1c`.
  - Água pantanosa: `#1b3b3a` (superfície), `#0f2424` (leito fundo), reflexo especular suave (`roughness: 0.14`, `metalness: 0.18`).
  - Vitórias-régias e lótus: `#3f6e34` (folha), `#f1e4eb` / `#f9a8d4` (flor).
  - Taboas / juncos: haste `#3d592a`, ponta ferrugem `#8c3b2b`.
  - Troncos e raízes ancestrais: `#42352c`, barba-de-velho `#5c6e49`.
  - Estandartes da árvore: tecido carmim `#7f1d24`, emblema branco-marfim `#e7dfd1`.

---

## 4. Inventário do Kit Modular Reutilizável (`src/rendering/scenarios/ScenarioKit.ts`)

Todo elemento estrutural e textura compartilhada entre `SwampScenario.ts`, `FortressScenario.ts` (e futuros upgrades nos demais 6 mapas) será fornecido por `src/rendering/scenarios/ScenarioKit.ts`.

### 4.1 Gerenciamento de Recursos (`ScenarioResourceTracker`)
- `trackGeometry(geo)`, `trackMaterial(mat)`, `trackTexture(tex)`: registra todo recurso alocado dinamicamente durante o `build`.
- `dispose()`: percorre e descarta 100% de geometrias, materiais e texturas registrados, evitando qualquer vazamento em `reset()` ou troca de fase.
- `markNoRaycast(obj)`: aplica `child.raycast = () => {}` recursivamente para decorações não interativas (folhagem, flores, juncos, chamas, bruma, horizonte).
- `applyObstacleMetadata(obj, kind, coord, targetList)`: atribui `userData = { kind: 'obstacle', obstacleKind: kind, gridCoord: coord }` e inclui os meshes sólidos em `obstacleMeshes`.

### 4.2 Texturas Procedurais em Canvas (`CanvasTexture`, determinísticas por semente)
Todas usam `THREE.SRGBColorSpace`, `RepeatWrapping` (quando tileáveis), estilo low-poly pintado à mão sem sombra direcional embutida:
1. **`createWeatheredStoneTexture(opts)`**: blocos irregulares de pedra/lajota com argamassa rachada, biséis sutis e pontuações opcionais de musgo/líquen (`variant: 'floor' | 'masonry'`).
2. **`createMossTexture(opts)`**: manchas orgânicas de musgo/grama em camadas com variação tonal e micro-folhas para topos de ruínas e platôs.
3. **`createWoodPlankTexture(opts)`**: tábuas longitudinais com veios, nós de madeira, frestas entre tábuas e cabeças de pregos.
4. **`createBannerTexture(opts)`**: estandarte têxtil com dobra sutil de tecido, franja inferior chanfrada em V, borda dourada/marfim e emblema vetorial em Canvas (`emblem: 'sword' | 'tree' | 'rune'`).
5. **`createWaterTexture(opts)`**: ondulações suaves estilizadas e variação orgânica de profundidade/algas para animação por `offset.x/y`.
6. **`createTerracottaRoofTexture(opts)`**: telhas curvas sobrepostas em fileiras para o telhado da torre de vigia.
7. **`createMedallionTexture(opts)`**: rosácea/selo rúnico circular gravado em pedra para o terraço do Portal Gótico do pântano.
8. **`createMistSpriteTexture()` / `createHorizonSkyTexture(palette)`**: gradiente radial suave para bruma baixa do pântano e faixa panorâmica contínua de horizonte 360° (pôr do sol na fortaleza / névoa crepuscular no pântano).

### 4.3 Blocos Arquitetônicos e Naturais Reutilizáveis

| Categoria | Fábrica / Bloco em `ScenarioKit.ts` | Parâmetros Principais | Suporte a Oclusão 360° |
|---|---|---|---|
| **Base / Plinto** | `createDioramaBase(opts)` | Largura, camadas de degraus, cores, material rochoso lateral | Não (`y < 0`) |
| **Escadaria** | `createStoneStairs(opts)` | Largura, nº de degraus, altura, cor de pedra + bordas laterais | Não se `height ≤ 0.55`, senão sim |
| **Muralha & Ameias** | `createWallSegment(opts)` | Comprimento, altura, merlões opcionais, musgo/vinhas, modo cutaway | Sim (`baseGroup` + `upperGroup`) |
| **Portão com Grade** | `createPortcullisGate(opts)` | Largura do vão, altura do arco, grade levadiça de ferro, torres laterais | Sim (base dos pilares fixa; arco/torres ocultáveis) |
| **Arco em Ruínas** | `createRuinedArch(opts)` | Estilo (`'roman' | 'gothic'`), largura, altura, musgo/vinhas pendentes | Sim (pedestais fixos; arco superior ocultável) |
| **Coluna Quebrada** | `createBrokenColumn(opts)` | Altura, base escalonada, topo fraturado, cobertura de musgo | Sim se perimetral e `h > 0.75` |
| **Torre de Vigia** | `createWatchtower(opts)` | Estrutura de vigas em X, guarda-corpo, telhado terracota, lanterna | Sim (paliçada/base fixa; torre/telhado ocultável) |
| **Tenda de Campanha** | `createCampTent(opts)` | Lona inclinada carmim, postes de madeira, pilhas de suprimentos | Sim (suprimentos baixos fixos; cobertura ocultável) |
| **Estandarte** | `createBannerStand(opts)` | Mastro, travessa horizontal, tecido com `createBannerTexture` | Sim (junto ao muro/torre ou isolado) |
| **Braseiro / Tocha** | `createBrazier(opts)` | Pedestal de pedra, tigela de ferro, chama animada multi-camada | Sim se pedestal alto (`h > 0.75`) |
| **Ponte de Madeira** | `createBridgeSegment(opts)` | Tábuas em `y_top = -0.003`, vigas submersas, corrimão seletivo L/R | Não (`y_top ≤ 0.32`) |
| **Obstáculos Internos** | `createStyledObstacle(obs, theme)` | `wall`, `pillar`, `crate`, `barrel` em low-poly rico mantendo limites de LoS | Não (regra interna no grid) |
| **Árvore Ancestral** | `createGnarledTree(opts)` | Tronco retorcido, raízes expostas, copa orgânica, barba-de-velho | Sim (raízes/toco fixos; tronco alto/copa ocultáveis) |
| **Pinheiro** | `createPineTree(opts)` | Cones escalonados assimétricos em camadas de verde escuro | Sim se próximo do tabuleiro |
| **Vegetação Aquática** | `createAquaticCluster(opts)` | Vitórias-régias (discos recortados), flores de lótus, tufos de juncos | Não (`raycast = () => {}`) |
| **Penhasco / Rocha** | `createCliffPerimeter(opts)` | Blocos facetados irregulares escalonados descendo abaixo da laje | Não (`y ≤ 0`) |
| **Cachoeira** | `createWaterfall(opts)` | Planos escalonados com UV animada + névoa na base | Não (`y ≤ 0`) |
| **Horizonte e Névoa** | `createHorizonRing(opts)` / `createDistantSilhouette(...)` / `createMistLayer(...)` | Anel 360° (`r=38`), silhuetas de castelo/aqueduto e planos de bruma animados | Sim para silhuetas altas próximas se entrarem na projeção |

---

## 5. Arquitetura Modular e Ciclo de Vida

### 5.1 Fronteiras e Fluxo de Dependências

```
src/config/gameConfig.ts (MAPS, obstacles, bridgeCells, theme)
         │
         ▼
    src/main.ts
         ├──▶ SceneManager.applyAtmosphere(boardRenderer.getAtmosphere())
         ├──▶ BoardRenderer.buildBoard(gridSize, obstacleDefs, options)
         │         ├──▶ src/rendering/scenarios/SwampScenario.ts    (mapId === 'forgotten-swamp')
         │         ├──▶ src/rendering/scenarios/FortressScenario.ts (mapId === 'fortress')
         │         ├──▶ Fallback clássico (demais 6 mapas)
         │         └──▶ ScenarioKit.ts (texturas, blocos, tracker de dispose)
         └──▶ BoardRenderer.update(dt, cameraController.currentAzimuth)
                   ├──▶ scenarioOcclusion.ts (cálculo puro 360°, testável em Node)
                   └──▶ animação de chamas, água, cachoeira e bruma
```

### 5.2 Regras Estritas de Separação
- **`src/rendering/BoardRenderer.ts`** cuida exclusivamente de:
  - Manter `tileMeshes`, `obstacleMeshes`, `gridToWorld()`, `highlightGroup` e `pathGroup` (`BoardHighlights` intactos).
  - Orquestrar `buildBoard()` e `disposeBoardChildren()`, chamando `activeScenario?.dispose()` antes de construir o novo mapa.
  - Manter o fallback de renderização para os 6 mapas que ainda não possuem módulo dedicado (`ruins`, `courtyard`, `catacombs`, `sanctuary`, `gauntlet`), corrigindo desde já o `userData` explícito em `obstacleMeshes` e `tileMeshes`.
  - Atualizar a visibilidade dos `PerimeterOccluder`s via `update(dt, azimuth)` (sem alocar objetos por frame).
- **`src/rendering/scenarios/SwampScenario.ts`** e **`FortressScenario.ts`** cuidam exclusivamente de:
  - Montar o ambiente visual temático (piso, obstáculos estilizados, água/pontes, perímetro 3D, terreno externo, horizonte, atmosfera e `PerimeterOccluder[]`) usando `ScenarioKit.ts`.
  - Implementar `update(dt, elapsed)` para animação de chamas, UV de água/cachoeira e flutuação de névoa.
  - Implementar `dispose()` chamando `tracker.dispose()`.
- **`src/rendering/SceneManager.ts`**:
  - Mantém um pool fixo de 4 `PointLight`s já existentes na cena (evitando recompilação de shaders ao trocar de mapa) e adiciona `applyAtmosphere(atmosphere?: ScenarioAtmosphere)` para ajustar cor de fundo, `FogExp2`, luz direcional, hemisférica, ambiente, rim light e posições/cores/intensidades das `PointLight`s nos braseiros e lanternas.
- **Limites de camada (`AGENTS.md`):**
  - Nenhum arquivo em `src/rendering/` importa `src/game/` nem duplica constantes de `gameConfig.ts`.
  - `src/rendering/scenarioOcclusion.ts` não importa `three` nem acessa DOM, permitindo testes diretos em Vitest (`tests/scenario-occlusion.test.ts`).

---

## 6. Plano de Delegação — Entregas 2 a 6

Cada entrega abaixo deve ser executada em sequência limpa, mantendo `npm run typecheck`, `npm test` e `npm run build` verdes ao final de cada etapa.

### Entrega 2 — Fundação Modular, Oclusão 360° e `ScenarioKit.ts`
- **Arquivos alvo:**
  - `src/rendering/scenarioOcclusion.ts` *(novo — puro)*
  - `tests/scenario-occlusion.test.ts` *(novo — testes Node)*
  - `src/rendering/scenarios/ScenarioTypes.ts` *(novo)*
  - `src/rendering/scenarios/ScenarioKit.ts` *(novo)*
  - `src/rendering/SceneManager.ts` *(edição pontual para `applyAtmosphere` com pool fixo de `PointLight`s)*
- **Escopo:**
  - Implementar e testar em Node `isPerimeterOccluderBlocking` cobrindo os 4 quadrantes (0°, 45°, 90°, 180°, 270°, 315°), peças no lado da câmera vs lado oposto, alturas variadas e objetos próximos vs distantes.
  - Implementar `ScenarioResourceTracker`, os 8 geradores de `CanvasTexture` procedurais e todos os construtores modulares listados na Seção 4.3.
  - Garantir `userData` explícito em obstáculos e `raycast = () => {}` em ornamentos/vegetação/efeitos.
- **Critério de aceite:** `typecheck`, `test` (incluindo `scenario-occlusion.test.ts`) e `build` passando sem avisos.

### Entrega 3 — Cenário Pântano Esquecido (`SwampScenario.ts`)
- **Arquivos alvo:**
  - `src/rendering/scenarios/SwampScenario.ts` *(novo)*
- **Escopo:**
  - Reproduzir a atmosfera e composição de `references/scenarios/scenario_03.png` usando `ScenarioKit.ts`:
    - Piso musgoso + 16 células `'water'` + 3 pontes (`bridgeCells`) com deck em `y_top = -0.003` e corrimão apenas nas bordas com água vizinha (`x=5..6` unificada!).
    - Obstáculos internos (`pillar`, `crate`, `barrel`) no estilo ruína gótica úmida com `userData` explícito.
    - Perímetro: Portal Gótico Norte + medalhão rúnico + estandartes da árvore + escadaria + 2 braseiros; Árvore Ancestral Noroeste + raízes + barba-de-velho + braseiro + escadaria; Arco Sudoeste + braseiro; colunas quebradas; espelho d'água contínuo externo, vitórias-régias, lótus, taboas/juncos, aquedutos distantes, névoa baixa animada e anel de horizonte 360°.
    - Registro completo de `PerimeterOccluder`s (Portal Norte, Árvore Noroeste, Arco Sudoeste, colunas/árvores altas de borda).
- **Critério de aceite:** `typecheck`, `test` e `build` verdes; `dispose()` completo de todos os recursos alocados.

### Entrega 4 — Cenário Fortaleza dos Ossos (`FortressScenario.ts`)
- **Arquivos alvo:**
  - `src/rendering/scenarios/FortressScenario.ts` *(novo)*
- **Escopo:**
  - Reproduzir a atmosfera e composição de `references/scenarios/scenario_02.png` usando `ScenarioKit.ts`:
    - Piso de lajotas quentes/desgastadas com juntas de musgo + obstáculos internos (`wall` em ruínas, `pillar` com contraforte, `crate` com travessas, `barrel` com ferro) e `userData` explícito.
    - Perímetro: Muralha Norte com ameias, vinhas e Portão Principal em arco com grade levadiça de ferro + torres laterais + 2 braseiros + 2 estandartes da espada; Torre de Vigia Oeste com telhado terracota, lanterna, estandarte e paliçada + Tenda Carmim de suprimentos; muretas baixas, pequeno arco decorativo e escadarias externas nas bordas frontais; penhascos escarpados em múltiplos níveis com cachoeira animada à direita; vale distante com rio, ponte, castelo silhuetado, pinheiros e anel de horizonte 360° de crepúsculo.
    - Registro completo de `PerimeterOccluder`s (Portão/Muralha Norte, Torre Oeste, Tenda, pinheiros/arcos altos de borda).
- **Critério de aceite:** `typecheck`, `test` e `build` verdes; `dispose()` completo de todos os recursos alocados.

### Entrega 5 — Integração em `BoardRenderer.ts` e `main.ts`
- **Arquivos alvo:**
  - `src/rendering/BoardRenderer.ts` *(refatoração limpa para usar `SwampScenario` / `FortressScenario` + oclusão 360° + `userData` no fallback)*
  - `src/main.ts` *(chamar `boardRenderer.update(dt, sceneManager.cameraController.currentAzimuth)` no tick e `sceneManager.applyAtmosphere(boardRenderer.getAtmosphere())` em `rebuildBoardForState`)*
- **Escopo:**
  - Ligar `'forgotten-swamp'` a `buildSwampScenario` e `'fortress'` a `buildFortressScenario`.
  - Corrigir `userData` em `tileMeshes` (`kind: 'tile'`) e `obstacleMeshes` (`kind: 'obstacle'`) no fallback clássico e corrigir altura de `buildBridgeCell`.
  - Garantir atualização imediata da oclusão logo após `buildBoard` e continuamente durante a órbita da câmera.
  - Garantir que `reset()` e trocas entre Batalha Rápida e Campanha chamam `dispose()` do cenário anterior sem vazamento.
- **Critério de aceite:** `typecheck`, `test` e `build` verdes; zero erros ao alternar entre todos os 8 mapas.

### Entrega 6 — QA Visual no Navegador, Validação 360° e Regressão
- **Escopo de verificação:**
  - Executar `npm run typecheck`, `npm test` e `npm run build`.
  - Abrir no navegador em `forgotten-swamp` (Fase 2) e `fortress` (Fase 3):
    - Inspecionar visualmente com câmera orbital em `45°`, `135°`, `225°`, `315°` e vista inicial, confirmando corte limpo das peças altas entre câmera e tabuleiro.
    - Confirmar legibilidade total dos `BoardHighlights` (movimento, alcance, ataque, área de habilidade, perigo de chefe e caminho) inclusive sobre as `bridgeCells` do Pântano.
    - Testar raycasting/clique: seleção de células atrás de unidades, bloqueio de cliques atrás de obstáculos sólidos internos (`wall`, `pillar`, `crate`, `barrel`) e seleção livre através de `'water'`.
    - Executar 10 reinícios/trocas de mapa verificando ausência de erros de console/WebGL e consistência visual.
