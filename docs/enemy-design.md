# Design dos Inimigos, Chefe e Reuso de Modelos 3D — Rune Tactics V4

Este documento define os templates de atributos/armadura, os perfis determinísticos de IA (`src/game/ai/EnemyAI.ts`) para todos os inimigos da V4 (5 existentes + 3 novos + chefe `ashen-guardian`) e o mapeamento exato de reutilização dos modelos `.glb` KayKit CC0 existentes em `public/assets/models/`.

---

## 1. Regras Gerais da IA (`EnemyAI.ts`)

- Toda decisão de IA permanece **100% determinística** (sem `Math.random`), executada em passos via `executeNextEnemyAction()` (1 movimento ou 1 ação tática por chamada).
- A função `minBy(items, score)` desempata estritamente pela ordem da lista (e as células de `GridSystem` mantêm ordem fixa de BFS `STEPS`), garantindo resultados reproduzíveis em testes Node.
- A partir da V4, `EnemyAI` retorna quatro possíveis ações (`EnemyAction`):
  ```ts
  export type EnemyAction =
    | { type: 'attack'; target: UnitState }
    | { type: 'move'; path: GridCoord[] }
    | { type: 'defend' }
    | { type: 'skill'; skillId: SkillId; targetCell: GridCoord }
    | { type: 'prepareAttack'; skillName: string; targetCells: GridCoord[]; basePower: number; attackKind: AttackKind; cooldown: number };
  ```
- **Nota de dano na IA**: para avaliar finalizações (`canKill`), a IA consulta a função pura `computeDamage(...)` do `CombatSystem` em vez de ler `attacker.damage` cru — respeitando armadura, Fortitude e postura defensiva (`isGuarding`) do alvo!

---

## 2. Inimigos Existentes (Adaptados aos Atributos V4)

Os cinco tipos clássicos mantêm sua identidade tática da V2.2, agora parametrizados com atributos V4, `baseArmor`, `basePower` e `attackKind`:

| Tipo (`UnitType`) | Nome em jogo | `attackKind` | Comportamento determinístico preservado |
|---|---|---|---|
| `melee-skeleton` | Esqueleto | `melee` (`str`) | Ataca o herói ao alcance com menor `hp` (empate: menor Manhattan); fora de alcance, anda pelo menor caminho até a célula de ataque mais próxima. |
| `skeleton-archer` | Arqueiro Esqueleto | `ranged` (`dex`) | Ataca o herói ao alcance com LoS de menor `hp`; ao mover, busca célula com LoS preferindo distância `>= 2` (`RANGED_SAFE_DISTANCE`) de qualquer herói. |
| `armored-skeleton` | Esqueleto Blindado | `melee` (`str`) | Ataca o herói mais próximo (empate: menor `hp`); ao mover, entre células de ataque de menor custo em passos, escolhe a que fica adjacente ao maior número de heróis. |
| `goblin-scout` | Batedor Goblin | `melee` (`str`) | Alta mobilidade (`moveRange: 4`). Prioriza alcançar e atacar o herói vivo de menor `hp` atual. |
| `cultist-mage` | Mago Cultista | `magic` (`int`) | Dispara magia (`attackRange: 3`, LoS) no herói de menor `hp`; ao mover, busca célula com LoS mantendo distância `>= 2`. |

---

## 3. Novos Inimigos da V4

### 3.1 `goblin-stalker` — Espreitador Goblin (Flanqueador Letal)

- **Identidade**: Versão agressiva e mortal do goblin batedor. Não usa escudo nem postura defensiva; foi feito para punir retaguardas mal protegidas (Mago e Arqueira) atravessando pontes ou flancos.
- **Atributos / Perfil**: `moveRange: 4`, `attackRange: 1`, `attackKind: 'melee'` (`str: 7`, que concede `+1` de bônus ofensivo -> `attackPower = 3`, `baseArmor: 0`).
- **IA Determinística**:
  1. **Alvo prioritário** (`stalkerScore(target)`): ordena heróis vivos pelo menor `hp` atual; no empate, pelo menor `totalDefense` (`baseArmor + fortitudeResistance(fort)`); no empate, menor Manhattan; no empate, ordem da lista.
  2. **Se já há heróis ao alcance (`inRange.length > 0`)**: ataca o de menor `stalkerScore` (se algum golpe for fatal pelo `computeDamage`, escolhe o alvo abatível de maior `attackPower` potencial primeiro).
  3. **Se fora de alcance e `!hasMoved`**: busca entre todas as células alcançáveis com ataque disponível (`firingCells`, até `moveRange` se possível, senão todas alcançáveis via BFS) a que ataca o herói de menor `stalkerScore`, desempatando por menor número de passos e depois por células que tenham **menos outros heróis adjacentes** (tende a evitar ser cercado pelo Guerreiro+Clérigo quando há espaço para flanquear). Se não houver célula de ataque possível no mapa, aproxima-se do herói de menor `stalkerScore`.

### 3.2 `skeleton-shieldbearer` — Escudeiro Esqueleto (Tanque Defensivo)

- **Identidade**: Vanguarda disciplinada que segura gargalos (`fortress`, `corrupted-sanctuary`) usando a postura **Defender (`-50%` dano)** para proteger arqueiros, acólitos e o chefe atrás dele.
- **Atributos / Perfil**: `moveRange: 2`, `attackRange: 1`, `attackKind: 'melee'`, `baseArmor: 1`, `fort: 6` (`maxHp: 11`), `basePower: 2`.
- **IA Determinística**:
  1. **Quando há herói adjacente (`inRange.length > 0`)**:
     - Se algum golpe básico mata um alvo adjacente (`computeDamage >= target.hp`), **ataca** esse alvo imediatamente (`{ type: 'attack', target }`).
     - Senão, se `!enemy.isGuarding` **E** (`enemy.hp <= Math.floor(enemy.maxHp * 0.5)` **OU** `inRange.length >= 2`), usa **Defender** (`{ type: 'defend' }`).
     - Caso contrário, **ataca** o herói adjacente mais próximo (empate: menor `hp`).
  2. **Quando não há herói adjacente (`inRange.length === 0`)**:
     - Se `!enemy.hasMoved`: avança até `moveRange` buscando células de ataque que engajem o máximo de heróis (como `armored-skeleton`, preferindo ficar entre heróis e aliados à distância quando empatado).
     - Se `!enemy.hasMoved` não tem caminho ou já moveu (`enemy.hasMoved === true`) e continua sem alvo adjacente: se houver algum herói vivo a distância Manhattan `<= 4` e `!enemy.isGuarding`, usa **Defender** (`{ type: 'defend' }`) para absorver tiros de Arqueira/Mago na rodada seguinte; caso contrário retorna `null`.

### 3.3 `necromancer-acolyte` — Acólito Necromante (Suporte Sombrio e Magia)

- **Identidade**: Conjurador sombrio de retaguarda que sustenta a linha de frente morta-viva com a habilidade **`dark-mend`** (cura mágica escalada por `int`) e dispara rajadas arcanas sombrias quando nenhum aliado precisa de cura.
- **Atributos / Perfil**: `moveRange: 2`, `attackRange: 3`, `attackKind: 'magic'`, `int: 7` (`+1` bônus), `basePower: 2` (`attackPower = 3`), `skillId: 'dark-mend'` (`heal: 2` → cura total `2 + 1 = 3 HP`, `range: 3`, `cooldown: 2`, `targetTeam: 'ally'`).
- **IA Determinística**:
  1. **Prioridade 1 — Cura (`dark-mend`)**:
     - Só considera curar se `enemy.skillCooldown === 0` e existir algum aliado inimigo vivo com `hp < maxHp` e `hp <= Math.floor(maxHp * 0.75)` (ou o chefe `ashen-guardian` abaixo de `maxHp`).
     - Ordena candidatos à cura por: (a) ser chefe (`ashen-guardian`) antes dos demais; (b) menor razão `hp / maxHp`; (c) menor distância até o acólito; (d) ordem da lista.
     - Se o alvo prioritário está dentro de `range 3` e com LoS da posição atual, retorna `{ type: 'skill', skillId: 'dark-mend', targetCell: ally.pos }`.
     - Se ainda `!enemy.hasMoved` e há célula dentro de `moveRange` de onde a cura alcança o aliado ferido (preferindo a célula mais distante dos heróis `distanceToNearest >= 2`), move-se para lá.
  2. **Prioridade 2 — Ataque Mágico Básico**:
     - Se não há alvo elegível de cura (ou `skillCooldown > 0`), comporta-se como `cultist-mage`: dispara magia (`attackRange: 3`, LoS) no herói de menor `hp` ao alcance; se fora de alcance e `!hasMoved`, busca célula com LoS mantendo distância segura `>= 2`.

---

## 4. Chefe da Fase 5: `ashen-guardian` — Guardião das Cinzas

### 4.1 Conceito e Mecânica de 2 Fases

- **Identidade**: Senhor corrompido do Santuário, imponente e metódico. Combina golpes corpo a corpo devastadores com ataques de área telegrafados (`PendingAttack`), forçando o time do jogador a alternar reposicionamento, foco de dano e `Defend`.
- **Estado de Fase (`bossPhase: 1 | 2`)**:
  - Inicia a batalha com `bossPhase = 1`.
  - **Gatilho da Fase 2**: imediatamente quando seu HP cai para **`<= Math.floor(maxHp * 0.5)`** (`<= 14 HP` de `28 HP` máximos) e continua vivo (`alive === true`).
  - **Regra obrigatória**: **não restaura nenhum ponto de HP na transição**.
  - A transição é uma **trava irreversível** (*one-way latch*): `bossPhase` muda de `1` para `2`, `moveRange` sobe de `2` para `3` e o motor emite `{ type: 'bossPhaseChanged', unitId: boss.id, phase: 2, newMoveRange: 3 }`. Mesmo se o `necromancer-acolyte` curar o chefe acima de 50% depois, o chefe **permanece** em Fase 2 e o evento não repete.
  - Um `PendingAttack` já preparado na Fase 1 **preserva** suas `targetCells` originais até resolver ou o chefe morrer.

### 4.2 Perfil Comparativo das Fases do Chefe

| Aspecto | Fase 1 (`hp > 50% maxHp`) | Fase 2 — Fúria das Cinzas (`hp <= 50% maxHp`) |
|---|---|---|
| `moveRange` | `2` | **`3`** (`+1`) |
| Ataque básico | `melee` (`str: 7`, `basePower: 4` → **`5` ATK**) | Mesmo (`melee`, `5` ATK) |
| Ataque Anunciado | **`Golpe das Cinzas`** | **`Erupção das Cinzas`** |
| Forma das `targetCells` | **Cruz de 5 células** (centro + 4 ortogonais dentro da grade) | **Área `3×3` (até 9 células)** (centro + 8 adjacentes ortogonais e diagonais dentro da grade) |
| Alcance de centro | Até `3` células (Manhattan) do chefe | Até `3` células (Manhattan) do chefe |
| Potência / Tipo | `basePower: 4`, `attackKind: 'magic'` (`int: 7` → **`5` ATK**) | `basePower: 5`, `attackKind: 'magic'` (`int: 7` → **`6` ATK**) |
| Recarga (`cooldown`) | `2` rodadas | `2` rodadas |

### 4.3 Árvore de Decisão Determinística do Chefe

Em cada chamada de `executeNextEnemyAction()` durante a ativação do `ashen-guardian` (lembrando que qualquer `PendingAttack` preparado no turno anterior já foi resolvido no início da ativação atual):

1. **Se ainda não agiu (`!hasAttacked`) e `skillCooldown === 0`**:
   - Avalia todas as células livres ou ocupadas dentro da grade a distância Manhattan `<= 3` da posição atual do chefe (excluindo células de obstáculo sólido `wall`/`pillar` como centro? Melhor: qualquer célula válida da grade `isInBounds`, filtrando obstáculos das `targetCells` afetadas apenas se desejado — como obstáculos não têm unidades, manter `inBounds` é limpo e simples; ou centrar apenas em células sem obstáculo que atinjam **pelo menos 1 herói vivo**).
   - Para cada célula candidata de centro `c`: calcula `area = getBossAttackArea(c, bossPhase)` (`cross` na Fase 1, `3×3` na Fase 2) e conta `hits = livingHeroes.filter(h => area.some(a => sameCell(a, h.pos)))`.
   - Se existe pelo menos uma célula com `hits.length >= 1`:
     - Escolhe a célula que maximiza `hits.length`; no empate, menor soma de HP dos heróis atingidos; no empate, menor distância Manhattan até o chefe; no empate, menor `y`, depois menor `x`.
     - Retorna `{ type: 'prepareAttack', skillName, targetCells: area, basePower, attackKind: 'magic', cooldown: 2 }`.
     - *(Nota: como `prepareAttack` consome `hasAttacked = true`, se o chefe ainda não moveu, ele encerra a preparação parado? Não — na V4, se a IA decidir preparar antes de mover, para evitar que o chefe se afaste de forma estranha depois de telegrafar, estabelecemos que o chefe **move primeiro se estiver fora de alcance de ataque básico e sem bom alvo de preparação**, ou prepara de onde está e **não move depois de preparar**, encerrando a ativação ou mantendo `hasMoved = true`! Regra mais limpa para `EnemyAI`: se existe herói adjacente (`manhattan === 1`) OU preparação atinge `>= 1` herói de onde está, prepara sem precisar andar; na segunda chamada de `executeNextEnemyAction()`, se o chefe já preparou um `PendingAttack` neste turno, não precisa fugir — retorna `null` e encerra a ativação!)*
2. **Se `skillCooldown > 0` (ou nenhum herói ao alcance de preparação)**:
   - Se há herói adjacente (`attackRange: 1`), retorna `{ type: 'attack', target }` no herói adjacente de menor `hp` (empate: quem pode ser morto por `computeDamage`, depois ordem da lista).
   - Senão, se `!hasMoved`, move-se até `moveRange` (`2` na Fase 1, `3` na Fase 2) pelo menor caminho até o herói vivo mais próximo (ou até ficar dentro de alcance `3` quando `skillCooldown === 0` para preparar o ataque anunciado logo em seguida!).

---

## 5. Reutilização dos Modelos `.glb` KayKit CC0 Existentes

Abaixo está o mapeamento completo em `src/rendering/CharacterVisualController.ts` (`MODEL_SPECS`) e `src/rendering/UnitRenderer.ts`, utilizando exclusivamente os 8 arquivos `.glb` já presentes em `public/assets/models/`:

### Unidades Existentes (Preservadas)

| `UnitType` | Arquivo `.glb` | `targetHeight` | Tint (`tintHex` / `tintStrength`) |
|---|---|---|---|
| `knight` | `Knight.glb` | `1.02` | — |
| `archer` | `Rogue_Hooded.glb` | `0.98` | — |
| `mage` | `Mage.glb` | `1.05` | — |
| `cleric` | `Rogue.glb` | `0.96` | `0xfef08a` / `0.38` |
| `melee-skeleton` | `Skeleton_Minion.glb` | `0.96` | — |
| `skeleton-archer` | `Skeleton_Rogue.glb` | `0.96` | — |
| `armored-skeleton` | `Skeleton_Warrior.glb` | `1.16` | — |
| `cultist-mage` | `Skeleton_Mage.glb` | `1.02` | — |
| `goblin-scout` | `Rogue.glb` | `0.82` | `0x6b8e23` / `0.55` |

### Novas Unidades V4 (Reuso com Tint, Altura e Silhueta Distinta)

| `UnitType` | Arquivo `.glb` reutilizado | `targetHeight` | `tintHex` | `tintStrength` | Diferenciação visual e silhueta |
|---|---|---|---|---|---|
| `goblin-stalker` | `/assets/models/Rogue_Hooded.glb` | `0.88` | `0x365314` (oliva sombrio) | `0.65` | Capuz pontudo distinto do `goblin-scout` (`Rogue.glb` sem capuz), estatura agachada menor que a `archer` (`0.98`), verde-musgo escuro + anel vermelho inimigo. |
| `skeleton-shieldbearer` | `/assets/models/Skeleton_Warrior.glb` | `1.04` | `0x64748b` (ferro ardósia frio) | `0.50` | Menor que o `armored-skeleton` (`1.16`), tom metálico ardósia contrastando com ferro escuro/bronze; quando `isGuarding === true`, ativa o anel pulsante de defesa e badge `🛡`. |
| `necromancer-acolyte` | `/assets/models/Skeleton_Mage.glb` | `1.00` | `0x0d9488` (esmeralda necrótico) | `0.55` | Contrasta imediatamente com o manto vinho do `cultist-mage` e com o púrpura do `mage` aliado; efeito verde-espectral ao lançar `dark-mend`. |
| `ashen-guardian` | `/assets/models/Skeleton_Warrior.glb` | `1.42` | `0x7f1d1d` (cinza-carvão & brasa carmim) | `0.55` | ~40% mais alto que heróis padrão (`1.42` vs `1.02`), hitbox `0.85 × 1.55 × 0.85`, barra de HP com destaque de chefe (`👑`), aura de brasa intensa (`0xf97316`) ativada ao entrar na Fase 2 (`bossPhase === 2`). |

*(Para o fallback procedural em `UnitRenderer.ts` — caso um `.glb` falhe ao carregar — cada novo tipo recebe um construtor procedural simples reaproveitando as primitivas existentes com as cores/alturas acima, e um escudo frontal destacado no `skeleton-shieldbearer` e ombreiras/coroa de brasas no `ashen-guardian`.)*
