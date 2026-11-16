# Rune Tactics

Jogo tático por turnos para navegador, em TypeScript com Three.js.

Na V2.2, quatro heróis (guerreiro, arqueira, mago e clérigo) enfrentam seis inimigos de cinco tipos (`melee-skeleton`, `skeleton-archer`, `armored-skeleton`, `goblin-scout` e `cultist-mage`) em uma arena medieval de 12×12 células. O combate usa **ativações individuais alternadas** (cada unidade viva age uma vez por rodada, alternando entre os times) e cadáveres persistentes no chão. Cada herói tem um ataque básico e uma habilidade com recarga (incluindo `Healing Light` para cura). Ataques à distância dependem de linha de visão, que paredes e pilares bloqueiam. A batalha termina quando um dos lados é eliminado.

## Como jogar

- Botão direito + arrastar: girar a câmera 360° ao redor da arena.
- Em `awaiting_player_choice`, clique em qualquer herói vivo elegível para selecioná-lo.
- Ao executar a primeira ação (mover, atacar ou usar habilidade), o herói fica travado até gastar movimento e ataque (em qualquer ordem) ou até você clicar em **Encerrar Turno** para finalizar a ativação dele.
- Ao fim de cada ativação, a vez alterna para um inimigo elegível (ou para o próximo aliado se o outro time já esgotou suas ativações na rodada). Quando todas as unidades vivas ativarem, inicia-se uma nova rodada.
- Unidades derrotadas permanecem no chão como cadáveres visuais e não bloqueiam passagem nem linha de visão.

As regras completas estão em [docs/game-design.md](docs/game-design.md) e o fluxo de ativações em [docs/turn-system.md](docs/turn-system.md).

## Estado

A V2.2 está concluída e é jogável no navegador com `npm run dev`. O motor de regras tem testes unitários em `tests/`. As versões V3 e V4 existem só como plano, em [docs/roadmap.md](docs/roadmap.md).

## Comandos

```
npm install
npm run dev        servidor de desenvolvimento
npm run typecheck  checagem de tipos
npm test           testes (Vitest)
npm run build      checagem de tipos e build de produção
```

## Estrutura

```
src/shared/types.ts       contratos entre o motor e a interface
src/config/gameConfig.ts  grade, obstáculos, classes, habilidades e posições iniciais
src/game/                 motor de regras: grade, combate, turnos e IA
src/rendering/            cena Three.js: arena, unidades e animações
src/input/                mouse, seleção e modos de ação
src/ui/                   HUD
public/assets/            retratos, ícones e texturas
tests/                    testes do motor (Vitest)
docs/                     documentação
references/               imagens de referência
```

## Documentação

- [Game design](docs/game-design.md): regras, classes, habilidades e inimigos
- [Arquitetura](docs/architecture.md): camadas, contratos e fluxo de eventos
- [Direção de arte](docs/art-direction.md) e [geração de assets](docs/asset-generation.md)
- [Roadmap](docs/roadmap.md): V3 e V4
- [Instruções para agentes](AGENTS.md)
