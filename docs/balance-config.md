# Tabela de Balanceamento e Parâmetros Iniciais — Rune Tactics V4

Todos os números abaixo são a fonte única para `src/config/gameConfig.ts`. As estatísticas derivadas (`maxHp`, `atk`, `def`) são calculadas dinamicamente em `AttributeSystem` e `CombatSystem` pelas fórmulas de `docs/attribute-system.md` e `docs/combat-system.md`.

---

## 1. Constantes Globais

| Constante | Valor | Uso |
|---|---|---|
| `GRID_SIZE` | `12` | Tamanho padrão das arenas (`12×12`) |
| `MIN_ATTRIBUTE` | `1` | Piso mínimo de atributo |
| `MAX_ATTRIBUTE` | `12` | Teto máximo de atributo |
| `CAMPAIGN_ALIVE_HEAL_RATIO` | `0.35` | Cura pós-fase para heróis vivos (`ceil(maxHp * 0.35)`) |
| `CAMPAIGN_REVIVE_HP_RATIO` | `0.25` | HP ao reviver heróis caídos após vitória (`ceil(maxHp * 0.25)`) |
| `CAMPAIGN_POINTS_PER_VICTORY` | `1` | Pontos de atributo por herói ao vencer cada fase |
| `CAMPAIGN_SAVE_KEY` | `'rune_tactics_v4_save'` | Chave em `localStorage` |
| `CAMPAIGN_SAVE_VERSION` | `4` | Versão do formato de save |

---

## 2. Parâmetros Iniciais dos Heróis

| `UnitType` | Nome | `baseHp` | `baseArmor` | `basePower` | `str` | `dex` | `int` | `fort` | **Derivado Nv.0 (`maxHp` / `ATK` / `DEF`)** | `moveRange` | `attackRange` | `attackKind` | `skillId` |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|---:|---:|---|---|
| `knight` | Guerreiro | `8` | `1` | `2` | `6` | `4` | `3` | `6` | **12 HP / 2 ATK / 1 DEF** | `3` | `1` | `melee` | `runic-strike` |
| `archer` | Arqueira | `8` | `0` | `2` | `4` | `6` | `3` | `4` | **8 HP / 2 ATK / 0 DEF** | `3` | `3` | `ranged` | `marked-shot` |
| `mage` | Mago | `7` | `0` | `2` | `3` | `4` | `6` | `4` | **7 HP / 2 ATK / 0 DEF** | `2` | `2` | `magic` | `arcane-burst` |
| `cleric` | Clérigo | `7` | `1` | `2` | `5` | `3` | `6` | `5` | **9 HP / 2 ATK / 1 DEF** | `2` | `1` | `melee` | `healing-light` |

### Marcos de Progressão dos Heróis (Campanha: +4 pontos totais por herói)

- Todos os heróis iniciam com seu atributo principal em **`6`**:
  - Com o **1º ponto** (pós-Fase 1 → valor `7`), desbloqueiam imediatamente `+1` de `offensiveBonus`, subindo seu `ATK` (ou `Cura`) em `+1`.
  - Investindo os **4 pontos** no atributo principal (`6 → 10`), alcançam `+2` de `offensiveBonus` na Fase 5 (`ATK 4`, skills `5–6`).
- O Guerreiro inicia com `fort: 6` (`12 HP`), podendo chegar a `fort: 8` (`16 HP` e `+1 fortitudeResistance` → `DEF 2`) com apenas `+2` pontos em `fort`.
- O Clérigo inicia com `fort: 5` (`9 HP`) e `baseArmor: 1`, funcionando como off-tank/suporte na segunda linha.

---

## 3. Habilidades (`SKILLS`)

| `SkillId` | Nome | `targetTeam` | `damage` / `heal` (base) | `attackKind` | `range` | `cooldown` | `area` | Escala com |
|---|---|---|---|---|---:|---:|---|---|
| `runic-strike` | Runic Strike | `enemy` | `damage: 4` | `melee` | `1` | `2` | `single` | `str` (`4` → `5` → `6`) |
| `marked-shot` | Marked Shot | `enemy` | `damage: 3` | `ranged` | `3` | `2` | `single` | `dex` (`3` → `4` → `5`) |
| `arcane-burst` | Arcane Burst | `enemy` | `damage: 2` | `magic` | `3` | `3` | `cross` | `int` (`2` → `3` → `4`) |
| `healing-light` | Healing Light | `ally` | `heal: 3` | — | `3` | `2` | `single` | `int` (`3` → `4` → `5`) |
| `dark-mend` *(inimigo)* | Dark Mend | `ally` | `heal: 2` | — | `3` | `2` | `single` | `int` (`2` + `1` = `3`) |

---

## 4. Parâmetros dos Inimigos e Chefe

| `UnitType` | Nome | `baseHp` | `baseArmor` | `basePower` | `str` | `dex` | `int` | `fort` | **Derivado (`maxHp` / `ATK` / `DEF`)** | `moveRange` | `attackRange` | `attackKind` | Habilidade / Especial |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|---:|---:|---|---|
| `goblin-scout` | Goblin Scout | `4` | `0` | `2` | `4` | `6` | `3` | `4` | **4 HP / 2 ATK / 0 DEF** | `4` | `1` | `melee` | — |
| `melee-skeleton` | Melee Skeleton | `5` | `0` | `2` | `5` | `4` | `2` | `4` | **5 HP / 2 ATK / 0 DEF** | `2` | `1` | `melee` | — |
| `skeleton-archer` | Skeleton Archer | `4` | `0` | `2` | `4` | `6` | `2` | `4` | **4 HP / 2 ATK / 0 DEF** | `2` | `3` | `ranged` | — |
| `goblin-stalker` | Goblin Stalker | `6` | `0` | `2` | `7` | `7` | `3` | `4` | **6 HP / 3 ATK / 0 DEF** | `4` | `1` | `melee` | Foca herói mais frágil |
| `skeleton-shieldbearer` | Skeleton Shieldbearer | `7` | `1` | `2` | `5` | `4` | `2` | `6` | **11 HP / 2 ATK / 1 DEF** | `2` | `1` | `melee` | Usa `defend` (-50% dano) |
| `armored-skeleton` | Armored Skeleton | `7` | `2` | `2` | `7` | `4` | `2` | `6` | **11 HP / 3 ATK / 2 DEF** | `2` | `1` | `melee` | Engaja múltiplos heróis |
| `cultist-mage` | Cultist Mage | `6` | `0` | `2` | `3` | `4` | `7` | `4` | **6 HP / 3 ATK / 0 DEF** | `2` | `3` | `magic` | Kiter mágico (`dist >= 2`) |
| `necromancer-acolyte` | Necromancer Acolyte | `5` | `0` | `2` | `3` | `4` | `7` | `5` | **7 HP / 3 ATK / 0 DEF** | `2` | `3` | `magic` | `dark-mend` (cura 3, cd 2) |
| `ashen-guardian` | Guardião das Cinzas | `20` | `1` | `4` | `7` | `4` | `7` | `8` | **28 HP / 5 ATK / 2 DEF** | `2` *(F2: `3`)* | `1` | `melee` | `Golpe das Cinzas` (cruz, pwr 4, cd 2) / `Erupção das Cinzas` (3×3, pwr 5, cd 2) |

---

## 5. Verificação Matemática da Curva de Dificuldade (Fases 1 a 5)

| Fase | Inimigos (Qtd) | Soma HP Inimigo | Dano Máx. Potencial / Turno Inimigo | Pontos Acumulados por Herói | Leitura Tática Esperada |
|---|---|---|---|---|---|
| **1 — Posto Avançado** | 2 Goblin Scouts + 1 Melee Skeleton (3) | **13 HP** | 6 bruto (`3–4` após armadura) | `0` (base) | **Acessível**: cada herói precisa de 2 golpes (ou 1 skill `Runic Strike`/`Marked Shot` no goblin). Permite aprender cobertura, LoS e `Defend` sem risco de derrota injusta. |
| **2 — Pântano Esquecido** | 2 Goblin Stalkers + 2 Goblin Scouts + 1 Skeleton Archer (5) | **24 HP** | 12 bruto | `+1` | **Tática de gargalo**: `Goblin Stalker` (`6 HP, 3 ATK`) derruba o Mago (`7 HP`) em 3 golpes (ou 2 se somar Archer). Segurar as pontes estreitas com Guerreiro defendendo (`3-1=2 → 1` dano) protege a retaguarda. |
| **3 — Fortaleza dos Ossos** | 2 Shieldbearers + 2 Melee + 1 Archer + 1 Armored (6) | **47 HP** | 13 bruto | `+2` | **Foco e quebra de postura**: Shieldbearers (`11 HP, 1 DEF`) que entram em `Defend` reduzem ataques básicos de `3` para `1`. Exige contornar com `Arcane Burst` (mágico em área), flanquear pelas alas da fortaleza e usar `Runic Strike` (`4–5` bruto). |
| **4 — Catacumbas Arcanas** | 2 Cultist Mages + 2 Necromancer Acolytes + 2 Armored Skeletons (6) | **48 HP** | 18 bruto | `+3` | **Prioridade de alvos e LoS**: Acólitos curam `3 HP` nos Armored Skeletons (`11 HP, 2 DEF`) se ignorados. Usar as paredes das catacumbas para quebrar a LoS dos Cultists enquanto Arqueira/Mago eliminam os Acólitos. |
| **5 — Santuário Corrompido** | Guardião das Cinzas + 1 Shieldbearer + 1 Acolyte (3) | **46 HP** *(28 Chefe)* | `5–6` bruto por golpe + AoE anunciado | `+4` | **Luta de chefe**: `Golpe das Cinzas` (`5` mágico) e `Erupção das Cinzas` (`6` mágico, `3×3`) causam `5–6` em alvos sem armadura (`3` se usar `Defend`). Eliminar o Acólito primeiro impede curas no chefe; evitar a zona vermelha ou usar `Defend` e curar (`4–5 HP`) com o Clérigo garante a vitória em ~6–8 rodadas. |
