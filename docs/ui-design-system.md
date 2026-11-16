# Design system da interface

Este documento define os tokens, os componentes e o layout do HUD da V3 visual. O clima vem de `references/ref-v3.png`; as cores e a tipografia base vêm de `art-direction.md`. Ele descreve o alvo: `src/style.css` e `src/ui/HudManager.ts` ainda não o seguem.

O HUD só apresenta o estado do motor. Ele não decide regras: todo rótulo, contagem e estado de botão sai do `GameStateSnapshot`.

## Estado atual

- `src/style.css` não tem variáveis: cerca de 25 cores e uma dúzia de tamanhos estão escritos direto nas regras.
- A fonte é a do sistema.
- Não existe barra de ordem de turno.
- O painel de aliados, o card da unidade, a barra de ações e o painel do canto superior direito já existem e são reaproveitados com o visual novo.
- O botão de desfazer movimento não tem ícone.

A migração começa por criar os tokens abaixo em `:root` e trocar os valores fixos por eles, sem mudar o layout. O layout novo vem depois.

## Tokens

### Cor

| Token | Valor | Uso |
|---|---|---|
| `--color-bg` | `#0f172a` | fundo da página |
| `--color-surface` | `rgba(15, 23, 42, 0.86)` | painéis |
| `--color-surface-raised` | `rgba(30, 41, 59, 0.92)` | botões, itens de lista |
| `--color-surface-hover` | `rgba(51, 65, 85, 0.95)` | item sob o cursor |
| `--color-border` | `rgba(148, 163, 184, 0.35)` | borda neutra |
| `--color-border-strong` | `rgba(203, 166, 98, 0.45)` | borda de painel, ouro velho |
| `--color-text` | `#f8fafc` | texto principal |
| `--color-text-muted` | `#94a3b8` | rótulos, texto secundário |
| `--color-text-disabled` | `#64748b` | texto desabilitado |
| `--color-gold` | `#facc15` | unidade ativa, ação principal |
| `--color-gold-soft` | `#cba662` | filetes e títulos |
| `--color-player` | `#3b82f6` | time do jogador, movimento |
| `--color-player-soft` | `#60a5fa` | realce do jogador |
| `--color-enemy` | `#ef4444` | time inimigo, ataque |
| `--color-enemy-soft` | `#f87171` | realce inimigo |
| `--color-skill` | `#a855f7` | habilidade |
| `--color-skill-soft` | `#c084fc` | realce de habilidade |
| `--color-heal` | `#4ade80` | cura, HP aliado |
| `--color-hp-low` | `#f59e0b` | HP abaixo de 35% |
| `--color-success` | `#22c55e` | vitória, confirmação |
| `--color-danger` | `#ef4444` | derrota, erro |
| `--color-overlay` | `rgba(9, 13, 20, 0.72)` | fundo de modal |
| `--color-focus` | `#93c5fd` | anel de foco do teclado |

Cores de classe, usadas na moldura do retrato e no acento do card:

| Token | Valor |
|---|---|
| `--color-class-knight` | `#3b82f6` |
| `--color-class-archer` | `#22c55e` |
| `--color-class-mage` | `#a855f7` |
| `--color-class-cleric` | `#eab308` |

### Tipografia

| Token | Valor |
|---|---|
| `--font-display` | `'Cinzel', Georgia, serif` |
| `--font-ui` | `'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif` |

| Token | Tamanho e altura de linha | Peso | Uso |
|---|---|---|---|
| `--text-display` | 28 / 34 px | 700 | título do resultado |
| `--text-title` | 18 / 24 px | 700 | nome do jogo, nome do mapa |
| `--text-heading` | 14 / 20 px | 600 | nome da unidade, título de painel |
| `--text-body` | 13 / 18 px | 500 | botões, texto corrido |
| `--text-label` | 12 / 16 px | 500 | rótulos, valores secundários |
| `--text-caption` | 11 / 14 px | 600 | badges, contadores |

- `--text-display`, `--text-title` e `--text-heading` usam `--font-display`. Os demais usam `--font-ui`.
- Títulos de painel e badges em caixa alta, com espaçamento de 0,06 em.
- Números com `font-variant-numeric: tabular-nums`.
- O menor texto da interface tem 11 px.

### Espaçamento

Base de 4 px.

| Token | Valor | Uso |
|---|---|---|
| `--space-1` | 4 px | entre ícone e texto pequeno |
| `--space-2` | 8 px | dentro de botões, entre itens de lista |
| `--space-3` | 12 px | preenchimento de painel compacto |
| `--space-4` | 16 px | preenchimento de painel, margem da tela |
| `--space-5` | 24 px | entre grupos |
| `--space-6` | 32 px | preenchimento de modal |

### Bordas, raios e sombras

| Token | Valor | Uso |
|---|---|---|
| `--radius-sm` | 4 px | badges, barras |
| `--radius-md` | 8 px | painéis, botões |
| `--radius-lg` | 12 px | modal |
| `--radius-pill` | 999 px | contadores |
| `--border-width` | 1 px | padrão |
| `--border-width-strong` | 2 px | ativo, selecionado, foco |
| `--shadow-panel` | `0 6px 20px rgba(0, 0, 0, 0.45)` | painéis |
| `--shadow-raised` | `0 2px 6px rgba(0, 0, 0, 0.35)` | botões |
| `--glow-gold` | `0 0 0 1px rgba(250, 204, 21, 0.6), 0 0 12px rgba(250, 204, 21, 0.35)` | unidade ativa |
| `--glow-player` | `0 0 0 1px rgba(96, 165, 250, 0.5)` | modo de ação selecionado |
| `--glow-skill` | `0 0 0 1px rgba(192, 132, 252, 0.5)` | modo de habilidade selecionado |

### Movimento e camadas

| Token | Valor | Uso |
|---|---|---|
| `--duration-fast` | 120 ms | hover, pressionar |
| `--duration-base` | 180 ms | troca de estado, badges |
| `--duration-slow` | 280 ms | entrada de modal e de aviso |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | todas as transições |

| Token | Valor | Uso |
|---|---|---|
| `--z-healthbars` | 1 | barras de HP sobre o tabuleiro |
| `--z-hud` | 5 | painéis |
| `--z-toast` | 8 | aviso de combate |
| `--z-modal` | 10 | resultado da batalha |

Com `prefers-reduced-motion`, as durações caem para zero e nada desliza nem pulsa.

## Estados

Os mesmos estados valem para todo componente interativo.

| Estado | Quando | Tratamento |
|---|---|---|
| padrão | repouso | superfície `--color-surface-raised`, borda `--color-border` |
| `hover` | cursor sobre um elemento habilitado | superfície `--color-surface-hover`, borda na cor da função |
| pressionado | durante o clique | desloca 1 px para baixo, sem sombra |
| `selected` | modo de ação escolhido (mover, atacar, habilidade) | fundo tingido com a cor da função a 35%, borda forte, brilho correspondente |
| `active` | a unidade que está em turno | borda dourada de 2 px e `--glow-gold` |
| `disabled` | ação indisponível | opacidade 0,45, texto `--color-text-disabled`, cursor padrão, sem hover |
| foco | navegação por teclado | anel de 2 px em `--color-focus`, afastado 2 px |

Regras:

- `selected` é escolha do jogador; `active` é estado do jogo. Os dois nunca usam a mesma cor: `selected` usa a cor da função, `active` usa dourado.
- `disabled` não muda de aparência com o cursor e não responde ao teclado.
- Um botão desabilitado explica o motivo no `title`: "Já se moveu", "Em recarga: 2 rodadas", "Vez dos inimigos".
- O estado nunca é comunicado só por cor: há sempre um rótulo, um ícone ou uma borda diferente.

## Componentes

### Painel

Superfície `--color-surface`, borda `--border-width` em `--color-border-strong`, raio `--radius-md`, sombra `--shadow-panel`, preenchimento `--space-3` por `--space-4`, desfoque de fundo de 6 px. O título do painel usa `--text-caption` em `--color-gold-soft`, caixa alta.

### Retrato

| Tamanho | Lado | Uso |
|---|---|---|
| pequeno | 28 px | lista de inimigos |
| médio | 40 px | painel de aliados, ordem de turno |
| grande | 72 px | card da unidade ativa |

Quadrado, raio `--radius-sm`, borda de 2 px na cor do time: `--color-player` ou `--color-enemy`. O card da unidade ativa usa a cor da classe. Unidade ativa: borda dourada e `--glow-gold`. Unidade derrotada: imagem em tons de cinza a 50% de opacidade.

### Barra de HP

Trilho de 6 px de altura, raio `--radius-sm`, fundo `rgba(0, 0, 0, 0.5)`. Preenchimento em `--color-heal` para aliados e `--color-enemy` para inimigos; abaixo de 35% do máximo, `--color-hp-low` para aliados. Ao lado, o valor `atual / máximo` em `--text-label`, com algarismos tabulares. A largura muda em `--duration-base`.

### Badge de estado

`--text-caption`, caixa alta, raio `--radius-sm`, preenchimento de 2 por 6 px.

| Badge | Regra, nesta ordem | Cor |
|---|---|---|
| `DERROTADO` | a unidade não está viva | texto `--color-text-disabled`, fundo cinza escuro |
| `EM TURNO` | o id é `activeUnitId` | texto escuro sobre `--color-gold` |
| `CONCLUÍDO` | `hasActivatedThisRound` | texto `--color-text-muted`, borda `--color-border` |
| `AGUARDANDO` | os demais casos | texto `--color-player-soft`, borda `--color-player` |

O badge é derivado do snapshot a cada atualização. O HUD não guarda estado próprio.

### Botão

Altura de 36 px, raio `--radius-md`, `--text-body` com peso 600.

| Variante | Uso | Aparência |
|---|---|---|
| primário | "Jogar novamente" | fundo `--color-player`, texto branco |
| secundário | "Reiniciar" | fundo `--color-surface-raised`, borda `--color-border` |

### Botão de ação

Usado na barra de ações. Ícone de 24 px e rótulo em `--text-body`; altura de 48 px; largura mínima de 96 px.

| Ação | Ícone | Cor da função | Atalho |
|---|---|---|---|
| Mover | bota | `--color-player` | — |
| Atacar | espada | `--color-enemy` | — |
| Habilidade | ícone da habilidade da unidade | `--color-skill`; `--color-heal` para cura | — |
| Desfazer movimento | seta em curva | `--color-text-muted` | — |
| Encerrar turno (E) | ampulheta | `--color-gold` | `E` |

- O botão de habilidade mostra o nome da habilidade da unidade ativa. Em recarga, um contador circular no canto mostra as rodadas restantes.
- O atalho aparece entre parênteses no rótulo e em `aria-keyshortcuts`.
- "Encerrar turno (E)" fica separado dos outros por um espaço maior, para não ser clicado por engano.

### Item de ordem de turno

Retrato médio com borda na cor do time. O item ativo é 20% maior, tem borda dourada, `--glow-gold` e um marcador triangular acima. Não é clicável e não tem estado de hover.

### Linha de estatística

Rótulo em `--text-label` e `--color-text-muted`; valor em `--text-heading` com algarismos tabulares. Usada para ATK, MOV e ALC.

### Indicador de ação

Pílula com ponto e rótulo, para "Movimento" e "Ataque": disponível em `--color-heal`, usado em `--color-text-disabled` com o texto riscado.

### Aviso de combate

Faixa curta no topo central, abaixo da ordem de turno: `--color-surface`, `--text-body`, raio `--radius-pill`. Entra e sai em `--duration-slow` e some sozinha em 2 s. Não recebe cliques.

### Modal de resultado

Fundo `--color-overlay` com desfoque. Caixa central com raio `--radius-lg` e preenchimento `--space-6`. Título em `--text-display`: `--color-success` na vitória, `--color-danger` na derrota. O modal só aparece depois que a animação do golpe final termina.

### Dica

`title` nativo nos botões, com a ação e o motivo quando desabilitado. Sem componente próprio nesta versão.

## Layout

### Regiões

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ┌──────────┐     ┌────────────────────────────────────────┐    ┌────────────┐ │
│ │ Título   │     │   ORDEM DE TURNO  ▼                    │    │ Mapa       │ │
│ └──────────┘     │  [▣] [▢] [▢] [▢] [▢] [▢] [▢] [▢]      │    │ Turno      │ │
│ ┌──────────┐     └────────────────────────────────────────┘    │ Round      │ │
│ │ ALIADOS  │              ( aviso de combate )                 │ [Reiniciar]│ │
│ │ ▢ nome   │                                                   │ Inimigos   │ │
│ │   HP ▬▬  │                                                   │ vivos 5/6  │ │
│ │   badge  │                                                   └────────────┘ │
│ │ ▢ ...    │                    TABULEIRO                                     │
│ │ ▢ ...    │                 (zona livre central)                             │
│ │ ▢ ...    │                                                                  │
│ └──────────┘                                                                  │
│ ┌────────────────┐                                                            │
│ │ UNIDADE ATIVA  │   ┌──────────────────────────────────────────────────┐     │
│ │ ▣  nome  HP    │   │ [Mover] [Atacar] [Habilidade] [Desfazer]  [Encerrar turno (E)] │
│ │ ATK MOV ALC    │   └──────────────────────────────────────────────────┘     │
│ └────────────────┘                                                            │
└──────────────────────────────────────────────────────────────────────────────┘
```

| Região | Âncora | Tamanho de referência |
|---|---|---|
| Título | canto superior esquerdo | 248 px de largura |
| Painel de aliados | esquerda, abaixo do título | 248 px de largura |
| Ordem de turno | topo, centro | até 560 px de largura, 72 px de altura |
| Painel de partida | canto superior direito | 232 px de largura |
| Card da unidade ativa | canto inferior esquerdo | 300 px de largura |
| Barra de ações | base, centro | largura do conteúdo, 64 px de altura |

A margem da tela é `--space-4`. O espaço entre painéis da mesma coluna é `--space-2`.

### Ordem de turno

- **Fonte dos dados:** `turnOrder`, `turnIndex`, `units` e `round` do snapshot.
- **Conteúdo:** a unidade ativa em primeiro lugar e as próximas na ordem em que vão agir, até oito itens.
- **Unidades mortas** não aparecem.
- **Virada de rodada:** quando a lista passa do fim de `turnOrder`, um separador fino com "Round N+1" marca o ponto.
- **Ativa:** destaque descrito no componente; é a única com marcador.
- **Time:** borda azul para aliados e vermelha para inimigos.
- **Sem interação:** os itens não são botões. Passar o cursor mostra o nome da unidade no `title`.
- **Atualização:** a cada mudança de ativação, os itens deslizam para a esquerda em `--duration-base`.

### Painel de aliados

- Um item por herói, na ordem da lista de unidades: retrato médio, nome, classe, barra de HP com valor e badge de estado.
- O herói em turno tem o item com borda dourada.
- O herói derrotado tem o retrato em cinza e a barra vazia.
- **Não há troca manual de turno.** Os itens não são clicáveis, não mudam o cursor e não têm estado `selected`. A unidade que age é sempre a definida pela ordem de turno.

### Card da unidade ativa

- Retrato grande com a borda na cor da classe.
- Nome em `--text-heading` e a classe em `--text-label`.
- Barra de HP com valor.
- Três estatísticas: ATK (dano), MOV (movimento) e ALC (alcance).
- Dois indicadores de ação: Movimento e Ataque, disponível ou usado.
- Linha da habilidade: ícone, nome e situação ("Pronta" ou "Recarga: N rodadas").
- Na vez dos inimigos, o card mostra o inimigo que está agindo, com a borda vermelha e sem indicadores de ação.
- Depois do fim da batalha, o card fica vazio.

### Barra de ações

- Cinco botões de ação, na ordem: Mover, Atacar, Habilidade, Desfazer movimento, Encerrar turno (E).
- O modo escolhido fica em `selected`. Só um por vez.
- Condições de `disabled`:

| Botão | Desabilitado quando |
|---|---|
| Mover | a unidade já se moveu |
| Atacar | a unidade já atacou |
| Habilidade | já atacou, está em recarga ou não há alvo possível |
| Desfazer movimento | `canUndoMove` é falso |
| Encerrar turno (E) | nunca, na vez do jogador |

- Todos ficam desabilitados na vez dos inimigos, durante animações e depois do fim da batalha. Nesses casos, uma faixa acima da barra diz o motivo: "Vez dos inimigos".

### Painel de partida

Compacto, no canto superior direito:

| Linha | Conteúdo | Fonte |
|---|---|---|
| Mapa | nome do mapa | `mapName` |
| Turno | "Jogador" ou "Inimigos", com a cor do time | `phase` |
| Round | número | `round` |
| Reiniciar | botão secundário | — |
| Inimigos vivos | contador "5 / 6" e uma fileira de retratos pequenos | `units` |

Na fileira de inimigos, os mortos ficam em cinza. O inimigo em turno tem a borda dourada.

## Zona livre do tabuleiro

O tabuleiro precisa ficar visível e clicável. A zona livre é o retângulo entre os painéis:

- começa à direita da coluna esquerda e termina à esquerda da coluna direita;
- começa abaixo da ordem de turno e termina acima da barra de ações.

Regras:

- **Nenhum painel entra na zona livre.** Só as barras de HP das unidades e o aviso de combate aparecem sobre ela, e nenhum dos dois recebe cliques.
- **O tabuleiro é centrado na zona livre,** não na janela. Quando as colunas laterais têm larguras diferentes, o enquadramento da câmera compensa.
- **A zona livre tem no mínimo 640 × 480 px.** Abaixo disso, os painéis encolhem conforme a tabela de responsividade.
- **O contêiner do HUD não recebe cliques;** só os painéis e botões recebem. Um clique no espaço vazio entre painéis chega ao tabuleiro.
- **A rotação da câmera com o botão direito** começa só sobre o tabuleiro e continua mesmo que o cursor passe sobre um painel.

## Responsividade (desktop)

O jogo é para desktop. Abaixo de 1024 px de largura, ele mostra um aviso pedindo uma janela maior, em vez de um layout quebrado.

| Largura da janela | Ajuste |
|---|---|
| 1600 px ou mais | layout de referência |
| 1280 a 1599 px | coluna esquerda com 216 px; card da unidade com 264 px; ordem de turno com até seis itens |
| 1024 a 1279 px | painel de aliados só com retrato, barra de HP e badge, com 160 px; fileira de retratos de inimigos some e fica o contador; botões de ação só com ícone; ordem de turno com até cinco itens |

| Altura da janela | Ajuste |
|---|---|
| 800 px ou mais | layout de referência |
| 640 a 799 px | cartão de título some; card da unidade em uma linha só; preenchimento dos painéis em `--space-2` |
| abaixo de 640 px | aviso pedindo uma janela maior |

- Os painéis nunca passam de 30% da largura nem de 30% da altura da janela, somados por lado.
- Nada tem barra de rolagem. Se o conteúdo não cabe, ele é resumido conforme a tabela.
- Os tamanhos de fonte não diminuem com a janela.
- Ao redimensionar, o enquadramento do tabuleiro é recalculado junto.

## Acessibilidade

- Contraste mínimo de 4,5:1 entre texto e fundo; 3:1 para ícones e bordas de estado.
- Todo botão é alcançável por teclado, na ordem visual, com o anel de foco visível.
- `E` encerra o turno. O atalho é ignorado com o botão desabilitado, com a tecla repetindo, com Ctrl, Alt ou Meta pressionados e com o foco em um campo de texto.
- Retratos decorativos têm `alt` vazio quando o nome está ao lado; sozinhos, levam o nome da unidade.
- A mudança de turno e o resultado da batalha são anunciados em uma região `aria-live`.
- Nenhuma informação depende só de cor: time, estado e modo têm rótulo, ícone ou forma diferente.

## Correspondência com o código atual

| Região | Elemento hoje em `HudManager` | Mudança |
|---|---|---|
| Título | `.hud-title-card` | fonte de título |
| Painel de aliados | `#hud-hero-roster` | badge e classe; deixa de ser interativo |
| Ordem de turno | não existe | componente novo, no topo central |
| Aviso de combate | `#hud-combat-feedback` | desce para baixo da ordem de turno |
| Painel de partida | `.hud-turn-card` e `.hud-enemies-card` | unidos em um painel compacto, com contador de vivos |
| Card da unidade | `#hud-unit-card` | estatística ALC e linha da habilidade |
| Barra de ações | `.hud-action-bar` | ícone para desfazer; estados pelos tokens |
| Resultado | `#hud-result-overlay` | só aparece depois da animação final |

## Lista de verificação

- [ ] Nenhuma cor, tamanho de fonte ou raio escrito fora dos tokens.
- [ ] Os cinco estados aplicados a todo componente interativo.
- [ ] A ordem de turno confere com `turnOrder` e `turnIndex` em toda mudança de ativação.
- [ ] Os badges conferem com o snapshot nos quatro casos.
- [ ] Nenhum clique no painel de aliados ou na ordem de turno muda quem age.
- [ ] Nenhum painel cobre o tabuleiro nas larguras de 1024, 1280, 1600 e 1920 px.
- [ ] Clique no espaço entre painéis chega ao tabuleiro.
- [ ] Navegação por teclado completa, com foco visível.
- [ ] Movimento reduzido respeitado.
