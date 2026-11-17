# Sistema de Atributos — Rune Tactics V4 (The Ashen Campaign)

Este documento especifica os quatro atributos das unidades, o teto configurável, as fórmulas puras derivadas, o mapeamento por tipo de ação e a regra de evolução de Fortitude entre fases. Todas as regras deste sistema vivem em `src/game/attributes/AttributeSystem.ts`, sem acesso a Three.js ou DOM.

---

## 1. Os Quatro Atributos

Toda unidade (herói, inimigo regular e chefe) possui exatamente quatro atributos inteiros positivos definidos na estrutura `UnitAttributes`:

| Chave | Nome | Papel principal | Impacto nas fórmulas |
|---|---|---|---|
| `str` | **Força (STR)** | Combate corpo a corpo físico | Aumenta o dano de ataques básicos e habilidades corpo a corpo (`attackKind: 'melee'`). |
| `dex` | **Destreza (DEX)** | Combate à distância físico | Aumenta o dano de ataques básicos e habilidades à distância físicos (`attackKind: 'ranged'`). |
| `int` | **Intelecto (INT)** | Magia ofensiva e cura | Aumenta o dano mágico (`attackKind: 'magic'`) e a potência de habilidades de cura (`targetTeam: 'ally'`). |
| `fort` | **Fortitude (FORT)** | Vitalidade e resistência | Aumenta o `maxHp` da unidade e soma resistência passiva à defesa total. |

### Constantes de Configuração (`src/config/gameConfig.ts`)

- `MIN_ATTRIBUTE = 1`
- `MAX_ATTRIBUTE = 12` (teto configurável; nenhum atributo pode exceder `MAX_ATTRIBUTE` via evolução).
- `ATTRIBUTE_BASE_THRESHOLD = 4` (valor neutro de referência nas fórmulas).

---

## 2. Fórmulas Puras Exatas

As fórmulas abaixo devem ser implementadas como funções puras exportadas em `src/game/attributes/AttributeSystem.ts` e importadas pelo `CombatSystem`, `UnitFactory` e `CampaignSystem`.

### 2.1 Bônus Ofensivo / Mágico

```ts
export function offensiveBonus(attr: number): number {
  return Math.floor(Math.max(0, attr - 4) / 3);
}
```

Tabela de valores (para referência rápida e testes unitários):

| Valor de `attr` (`str`, `dex` ou `int`) | `Math.max(0, attr - 4)` | `offensiveBonus(attr)` |
|---|---|---|
| `1` a `4` | `0` | `+0` |
| `5` | `1` | `+0` |
| `6` | `2` | `+0` |
| `7` | `3` | `+1` |
| `8` | `4` | `+1` |
| `9` | `5` | `+1` |
| `10` | `6` | `+2` |
| `11` | `7` | `+2` |
| `12` (`MAX_ATTRIBUTE`) | `8` | `+2` |

### 2.2 HP Máximo (`calcMaxHp`)

```ts
export function calcMaxHp(baseHp: number, fort: number): number {
  return baseHp + 2 * Math.max(0, fort - 4);
}
```

Tabela de incremento acima de `baseHp`:

| Valor de `fort` | Bônus sobre `baseHp` |
|---|---|
| `1` a `4` | `+0` |
| `5` | `+2` |
| `6` | `+4` |
| `7` | `+6` |
| `8` | `+8` |
| `9` | `+10` |
| `10` | `+12` |
| `11` | `+14` |
| `12` (`MAX_ATTRIBUTE`) | `+16` |

### 2.3 Resistência de Fortitude (`fortitudeResistance`)

```ts
export function fortitudeResistance(fort: number): number {
  return Math.floor(Math.max(0, fort - 4) / 4);
}
```

Tabela de valores:

| Valor de `fort` | `Math.max(0, fort - 4)` | `fortitudeResistance(fort)` |
|---|---|---|
| `1` a `7` | `0` a `3` | `+0` |
| `8` a `11` | `4` a `7` | `+1` |
| `12` (`MAX_ATTRIBUTE`) | `8` | `+2` |

A defesa total da unidade em combate é:

```ts
totalDefense = target.baseArmor + fortitudeResistance(target.attributes.fort);
```

---

## 3. Mapeamento por Tipo de Ataque e Habilidade

O escalonamento de dano ou cura **não é inferido por alcance (`attackRange`)** — porque unidades mágicas como o `mage` (`attackRange: 2`) e o `cultist-mage` (`attackRange: 3`) têm alcance maior que 1, mas usam `int`, não `dex`. Em vez disso, toda unidade e toda habilidade ofensiva declaram explicitamente seu `attackKind`:

```ts
export type AttackKind = 'melee' | 'ranged' | 'magic';
```

### Regra Canônica de Mapeamento

| Tipo de ação | Condição / Campo | Atributo usado em `offensiveBonus(attr)` |
|---|---|---|
| Ataque corpo a corpo físico | `attackKind === 'melee'` | `str` |
| Ataque à distância físico | `attackKind === 'ranged'` | `dex` |
| Ataque mágico (básico, skill ou anunciado) | `attackKind === 'magic'` | `int` |
| Habilidade de cura | `skill.targetTeam === 'ally'` (`skill.heal > 0`) | `int` |

### Mapeamento Explícito das Unidades e Habilidades

- **Guerreiro (`knight`)**: ataque básico `'melee'` (`str`), `Runic Strike` `'melee'` (`str`).
- **Arqueira (`archer`)**: ataque básico `'ranged'` (`dex`), `Marked Shot` `'ranged'` (`dex`).
- **Mago (`mage`)**: ataque básico `'magic'` (`int`), `Arcane Burst` `'magic'` (`int`).
- **Clérigo (`cleric`)**: ataque básico `'melee'` (`str`), `Healing Light` cura (`int`).
- **Inimigos físicos corpo a corpo** (`goblin-scout`, `goblin-stalker`, `melee-skeleton`, `armored-skeleton`, `skeleton-shieldbearer`): `'melee'` (`str`).
- **Inimigo físico à distância** (`skeleton-archer`): `'ranged'` (`dex`).
- **Inimigos mágicos** (`cultist-mage`, `necromancer-acolyte`): ataque básico `'magic'` (`int`); habilidade `Dark Mend` do acólito cura por (`int`).
- **Chefe (`ashen-guardian`)**: ataque básico `'melee'` (`str`); ataques anunciados (`Golpe das Cinzas` e `Erupção das Cinzas`) `'magic'` (`int`).

Função auxiliar pura em `AttributeSystem.ts`:

```ts
export function getAttributeForAttack(
  attributes: UnitAttributes,
  attackKind: AttackKind,
): number {
  switch (attackKind) {
    case 'melee':
      return attributes.str;
    case 'ranged':
      return attributes.dex;
    case 'magic':
      return attributes.int;
  }
}
```

---

## 4. Regra de Aumento de `FORT` Entre Fases

Durante a fase de acampamento/evolução da campanha (descrita em `docs/campaign-design.md`), o jogador pode investir pontos de atributo ganhos após cada vitória. Quando um ponto é aplicado em **`fort`**, a regra obrigatória é:

1. Validar que `hero.attributes.fort < MAX_ATTRIBUTE` e `hero.unspentPoints > 0`. Se falso, recusar sem mutar o estado.
2. Guardar `oldMaxHp = hero.maxHp` (equivalente a `calcMaxHp(baseHp, oldFort)`).
3. Incrementar `newFort = hero.attributes.fort + 1`.
4. Recalcular `newMaxHp = calcMaxHp(baseHp, newFort)`.
5. Calcular a diferença positiva: `hpGain = Math.max(0, newMaxHp - oldMaxHp)`.
6. Atualizar `hero.maxHp = newMaxHp`.
7. Somar apenas `hpGain` ao `hp` atual (limitado a `newMaxHp`):
   ```ts
   hero.hp = Math.min(newMaxHp, hero.hp + hpGain);
   ```

### Invariantes da Regra de `FORT`

- **Nunca cura dano anterior**: se o herói entrou no acampamento com `7 / 12` de HP após a recuperação pós-batalha (`fort = 6`) e ganha `+1` em `fort` (`6 -> 7`, `newMaxHp = 14`, `hpGain = 2`), seu HP passa para **`9 / 14`** (e não `14 / 14`).
- Se `fort` for incrementado de um valor `< 4` para `<= 4` (ex.: `3 -> 4`), `oldMaxHp === newMaxHp`, logo `hpGain = 0` e o HP atual não muda.
- Se `fort` passar de `7 -> 8`, além de `+2` de `maxHp` e `+2` de `hp` atual, `fortitudeResistance(8)` passa de `0` para `1`, aumentando a defesa total da unidade em `+1`.
- Como a recuperação pós-vitória (+35% vivos / revive 25%) ocorre **antes** da abertura da tela de distribuição de pontos, os ganhos de `FORT` sempre se somam após a recuperação, de forma determinística e sem dupla contagem.
