# Sistema de Combate — Rune Tactics V4 (The Ashen Campaign)

Este documento especifica a fórmula centralizada de dano, a unificação da ação **Defender**, a fórmula de cura escalada por atributo e o ciclo completo de **Ataques Anunciados (`PendingAttack`)**. Toda lógica reside em `src/game/combat/CombatSystem.ts`, `src/game/turns/TurnSystem.ts` e `src/game/GameEngine.ts`.

---

## 1. Fórmula Centralizada de Dano

Todo dano causado em combate — seja ataque básico (`resolveAttack`), habilidade ofensiva (`resolveSkill`) ou ataque anunciado (`resolvePendingAttack`) — passa por uma única função pura centralizada em `CombatSystem.ts` (`computeDamage`).

### Equação Completa

```ts
const mainAttr = getAttributeForAttack(attacker.attributes, attackKind);
const attackPower = basePower + offensiveBonus(mainAttr);
const totalDefense = target.baseArmor + fortitudeResistance(target.attributes.fort);
const damageBeforeGuard = Math.max(1, attackPower - totalDefense);
const finalDamage = target.isGuarding
  ? Math.max(1, Math.ceil(damageBeforeGuard * 0.5))
  : damageBeforeGuard;
```

### Parâmetros por Origem

| Origem do golpe | `basePower` | `attackKind` |
|---|---|---|
| Ataque básico (`resolveAttack`) | `attacker.basePower` | `attacker.attackKind` |
| Habilidade ofensiva (`resolveSkill`) | `skill.damage` | `skill.attackKind` |
| Ataque anunciado (`PendingAttack`) | `pending.basePower` | `pending.attackKind` |

### Garantias e Casos de Borda

- **Piso mínimo de dano = 1**: mesmo que `totalDefense >= attackPower`, `damageBeforeGuard` é no mínimo `1`, e mesmo que `target.isGuarding` esteja ativo com `damageBeforeGuard === 1`, `Math.max(1, Math.ceil(1 * 0.5)) === 1`. Todo ataque que acerta causa ao menos `1` de dano.
- **Arredondamento de defesa**: `Math.ceil(damageBeforeGuard * 0.5)` arredonda metade para cima (`3 -> 2`, `4 -> 2`, `5 -> 3`).
- **HP resultante**: `target.hp = Math.max(0, target.hp - finalDamage)`. Se `target.hp === 0`, `target.alive = false`, `target.isGuarding = false` e emite `unitDied`.

---

## 2. Ação Defender (`defend()`) — Unificação na V4

Na V3 existia um protótipo de `defend()` que somava escudo numérico (`GUARD_SHIELD = 2` e `SHIELD_WALL_BONUS = 1`). **Na V4, `defend()` é unificado na postura defensiva pura de 50% de mitigação**, sem escudo numérico absorvedor (`shield`) nem bônus de Muralha em adjacentes.

### Regras da Ação Defender

1. **Consumo de ação**: `defend()` substitui o ataque básico ou habilidade na ativação (`unit.hasAttacked = true`).
2. **Ordem livre no turno**:
   - Pode ser usada **antes de mover** (`hasMoved === false`, `hasAttacked === false`): ativa a postura defensiva e mantém a ativação aberta para que a unidade ainda possa se mover ou encerrar manualmente.
   - Pode ser usada **depois de mover** (`hasMoved === true`, `hasAttacked === false`): ativa a postura defensiva e encerra automaticamente a ativação (`hasMoved && hasAttacked`), passando a vez adiante.
   - Se `unit.hasAttacked === true`, é recusada com `{ ok: false, reason }` sem mutar o estado nem emitir eventos.
3. **Efeito**: define `unit.isGuarding = true` e emite `{ type: 'unitGuarded', unitId: unit.id }`.
4. **Duração exata**:
   - Permanece ativa durante todo o restante da rodada atual e início da próxima rodada **até o início da próxima ativação da própria unidade** (ou até sua morte).
   - Quando `TurnSystem.advanceTurn` seleciona `nextUnit` para iniciar sua nova ativação, define `nextUnit.isGuarding = false` antes de emitir `activationStarted` (e antes de resolver qualquer ação do novo turno).
   - Nota de caso extremo: se `nextUnit` havia preparado um `PendingAttack` e usou Defender antes? Não é possível no mesmo turno porque preparar e defender consomem `hasAttacked`; porém, se uma unidade estiver defendendo e sofrer um ataque anunciado de um inimigo antes de sua próxima ativação, sua `isGuarding === true` reduz o dano do ataque anunciado em 50%!
5. **Desfazer movimento (`undoMove`)**: assim como atacar ou usar habilidade, executar `defend()` após mover limpa `undoSnapshot` (`canUndoMove` passa a `false`), pois a ação tática já foi tomada.
6. **Compatibilidade e limpeza do protótipo V3**:
   - Remover `GUARD_SHIELD` e `SHIELD_WALL_BONUS` de `src/config/gameConfig.ts`.
   - Remover `shield` de `UnitState` e `shieldAbsorbed` de `unitAttacked` em `src/shared/types.ts`, simplificando `unitGuarded` para `{ type: 'unitGuarded'; unitId: string }` (e adicionando `wasGuarded?: boolean` opcional em `unitAttacked` para feedback de mitigação no HUD/renderer).
   - Atualizar `tests/defend.test.ts`, `UnitRenderer.ts` (exibir `shieldAura` quando `unit.alive && unit.isGuarding`) e `HudManager.ts` (badge `🛡 Defesa (-50%)` quando `unit.isGuarding`).

---

## 3. Cura (`Healing Light` e `Dark Mend`)

Habilidades com `targetTeam === 'ally'` aplicam a fórmula de cura escalada por `INT`:

```ts
const healPower = skill.heal + offensiveBonus(caster.attributes.int);
const actualHeal = Math.min(healPower, target.maxHp - target.hp);
target.hp += actualHeal;
```

### Regras de Cura

- Só é válida para alvos **vivos** (`target.alive === true`), da **mesma equipe** do conjurador (`target.team === caster.team`) e com `target.hp < target.maxHp`.
- **Nunca cura unidades mortas** (`!target.alive`).
- O conjurador pode curar a si mesmo (`manhattan === 0`).
- A cura nunca ultrapassa `target.maxHp`.
- Se `skill.range > 1`, exige linha de visão (`hasLineOfSight`) do conjurador até a célula alvo.
- `isGuarding` no alvo **não** reduz cura recebida.
- Consome `hasAttacked = true` e aplica `skillCooldown = skill.cooldown`.

---

## 4. Ataques Anunciados (`PendingAttack`)

Para criar leitura tática em encontros avançados e no combate de chefe (`ashen-guardian`), ataques de alto impacto em área usam um ciclo em dois turnos chamado **Ataque Anunciado (`PendingAttack`)**.

### Estrutura de Dados (`src/shared/types.ts`)

```ts
export interface PendingAttack {
  id: string;
  casterId: string;
  skillName: string;
  targetCells: GridCoord[];
  basePower: number;
  attackKind: AttackKind;
  preparedRound: number;
}
```

### Ciclo de Vida Completo

1. **Preparação (Ativação $N$ do conjurador)**:
   - O conjurador (via decisão da IA) escolhe preparar o ataque em um conjunto fixo de células válidas dentro da grade (`targetCells`).
   - A preparação **consome a ação tática do turno** (`caster.hasAttacked = true`) e aplica a recarga da habilidade (`caster.skillCooldown = cooldown`).
   - Cria um `PendingAttack` com ID determinístico (ex.: `${caster.id}-pending-${round}-${counter}`) e o insere em `pendingAttacks`.
   - Emite `{ type: 'attackPrepared', pendingAttack }` (cópia imutável das coordenadas).
   - `GameStateSnapshot.pendingAttacks` expõe cópia da lista para que `BoardRenderer` destaque todas as `targetCells` como **células perigosas** durante toda a rodada até a resolução ou cancelamento.

2. **Reação do Jogador (entre a Ativação $N$ e a Ativação $N+1$ do conjurador)**:
   - O jogador vê exatamente quais células estão marcadas e sabe qual conjurador está canalizando o golpe.
   - O jogador possui três respostas táticas reais:
     1. **Sair da área** com `moveSelectedUnit` ou `smartAttack`;
     2. **Usar `Defend`** para cortar o dano do impacto pela metade (`-50%`);
     3. **Abater o conjurador** antes de sua próxima ativação para cancelar o golpe!

3. **Cancelamento por Morte do Conjurador**:
   - Se o conjurador morrer (`alive` virar `false`) antes do início de sua próxima ativação:
   - Todos os `PendingAttack` com `casterId === deadUnit.id` são removidos imediatamente de `pendingAttacks` na própria ação que causou a morte.
   - Para cada um, emite `{ type: 'attackCancelled', pendingAttackId, casterId, reason: 'caster_died' }` logo após `unitDied`.
   - As células perigosas desaparecem do tabuleiro na mesma hora.

4. **Resolução (Início da próxima ativação do conjurador vivo)**:
   - No exato momento em que `TurnSystem.advanceTurn` avança o cursor para o conjurador e ele está vivo (`nextUnit.alive === true`), após limpar `nextUnit.isGuarding = false` e emitir `activationStarted`:
   - O motor (`GameEngine` delegando a `CombatSystem.resolvePendingAttacksForUnit`) localiza os `PendingAttack` com `casterId === nextUnit.id`, remove-os de `pendingAttacks` e os resolve **antes** de `nextUnit` executar as novas ações da ativação recém-iniciada.
   - Para cada `PendingAttack`:
     - Filtra todas as unidades **vivas da equipe adversária** (`u.alive && u.team !== caster.team`) cuja `pos` esteja em `pending.targetCells` (ataque anunciado inimigo **não** fere outros inimigos; preserva consistência com `Arcane Burst`).
     - Emite primeiro o evento agrupador `{ type: 'pendingAttackResolved', pendingAttackId, casterId, skillName, targetCells, affectedUnitIds }`.
     - Em seguida, para cada vítima afetada, aplica `computeDamage` com `pending.basePower` e `pending.attackKind` contra a defesa e `isGuarding` atuais da vítima, emitindo `unitAttacked` (com `pendingAttackId`, `wasGuarded` se aplicável) e, se `hp === 0`, `unitDied`.
   - Imediatamente após resolver os ataques pendentes, verifica fim de batalha (`checkBattleEnd`). Se todos os heróis caíram no impacto, emite `battleEnded` (`winner: 'enemy'`) e o conjurador **não** inicia nenhuma ação adicional.
   - Se a batalha continuar, a ativação normal do conjurador prossegue com `hasMoved = false` e `hasAttacked = false`.

### Garantia de Contiguidade de Eventos

Assim como nas habilidades (`skillUsed` seguido de `unitAttacked`), os eventos de um `PendingAttack` resolvido chegam sempre contíguos no mesmo lote de `consumeEvents()`:
`pendingAttackResolved` → `unitAttacked` (para cada atingido) → `unitDied` (para cada morto), permitindo que `UnitRenderer` anime uma única explosão/impacto simultâneo em toda a zona marcada.
