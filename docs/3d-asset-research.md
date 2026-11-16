# Rune Tactics V3 — Pesquisa Comparativa de Produção de Assets 3D

## 1. Descoberta do Ambiente Local
- **Blender:** não instalado no ambiente (`blender: comando não encontrado`), inviabilizando pipeline local de rigging/conversão `.blend`/`.fbx` → `.glb` via Blender CLI.
- **Ferramentas 3D IA (Meshy / Tripo / Hyper3D Rodin):** sem acesso/chaves configuradas no ambiente; exigem assinatura paga (~$20–$30/mês) para uso comercial sem restrição CC BY.
- **Three.js + `GLTFLoader` + `AnimationMixer`:** já disponíveis via pacote `three` instalado no projeto.
- **Geração 2D (`image-generator`):** disponível via Gemini no Antigravity (com cota limitada no `gemini-3.1-flash-image`), já utilizada para retratos, texturas e ícones em `public/assets/`.

---

## 2. Tabela Comparativa das Estratégias

| Ferramenta / Biblioteca | Tipo de Asset | Qualidade | Compatibilidade Three.js | Animações Disponíveis | Licença | Custo | Esforço de Integração | Vantagens | Limitações | Recomendação |
|---|---|---|---|---|---|---|---|---|---|---|
| **KayKit (GitHub CC0)** (`Adventurers 1.0`, `Skeletons 1.0`, `Dungeon Remastered 1.0`) | Personagens rigged + props/cenário low-poly | Alta (estilo coeso, ideal p/ RPG tático isométrico) | Nativo `.glb` / `.gltf` (`GLTFLoader`) | Sim (embutidas no `.glb`, compatível com `AnimationMixer`) | **CC0 1.0** (uso comercial livre, sem atribuição) | Gratuito | Baixo–Médio | Mesmo estilo entre heróis/esqueletos/cenário; textura atlas leve; `.glb` pronto para web | Não possui Goblin ou Clérigo nativo com mesmo nome (adaptável via variantes/acessórios ou fallback Three.js) | **Recomendado (Principal)** |
| **Quaternius** | Personagens e criaturas low-poly | Alta | Requer conversão (`.fbx`/`.blend` → `.glb` ou fontes de terceiros) | Sim (Universal Animation Library) | **CC0 1.0** | Gratuito | Médio–Alto (sem Blender local) | Grande variedade de classes e monstros | Distribuição oficial em `.fbx`/`.blend` | Secundário (caso precise de `.glb` convertido) |
| **Kenney.nl** | Kits modulares de cenário e personagens básicos | Média–Alta (clean/toy-like) | `.glb`/`.fbx`/`.obj` | Limitadas nos packs antigos | **CC0 1.0** | Gratuito | Baixo | Ótima modularidade para props/dungeon | Menos expressivo para heróis rigged | Opcional para props |
| **Poly Pizza / Sketchfab** | Modelos avulsos da comunidade | Variável (inconsistente) | `.glb`/`.gltf` | Variável | Mista (CC-BY, CC0, não-comercial — exige checagem item a item) | Gratuito / Pago | Alto (padronização de escala/estilo/licença) | Grande catálogo | Estilo inconsistente entre autores; risco de licença | Evitar para elenco principal |
| **Blender (Procedural / Scripting)** | Malhas e rigs customizados | Média (se gerado por script) | Exporta `.glb` | Manual | Própria | Gratuito | Muito Alto | Controle total | **Indisponível no ambiente** (`blender` não instalado) | Descartado na V3 |
| **Meshy / Tripo / Hyper3D Rodin** | Text-to-3D / Image-to-3D | Média–Alta (topologia variável) | Exporta `.glb` | Auto-rigging experimental | Free = CC BY 4.0 / Não-comercial; Pro = ~$20–$30/mês | Pago para uso comercial | Médio–Alto | Rápido para props únicos | Sem acesso no ambiente; custo pago; topologia/rig inconsistentes | Descartado na V3 |
| **Solução Híbrida (Estratégia D)** | **GLB CC0 (KayKit)** + **Fallback/Acessórios/Cenário Three.js** + **Assets 2D IA** | Alta e consistente | Nativa (`GLTFLoader` + `AnimationMixer` + Three.js) | `Idle`, `Walk`, `Attack`, `Hit`, `Death`, `Cast` | **CC0 1.0** + Própria | Gratuito | Médio | Combina personagens rigged animados, fallback seguro se GLB falhar, iluminação/VFX Three.js e HUD com retratos/ícones 2D | Exige `CharacterVisualController` para normalizar escala/pivô/clipes | **ESTRATÉGIA ESCOLHIDA** |

---

## 3. Decisão Arquitetural
Adotar a **Estratégia D (Solução Híbrida)**:
1. **Personagens 3D principais em `.glb` CC0 (KayKit Adventurers & Skeletons)** carregados via `GLTFLoader` + `AnimationMixer` através de `CharacterVisualController`.
2. **Fallback procedural automático** (mantendo os modelos low-poly Three.js da V2) caso qualquer `.glb` falhe no carregamento ou para variantes específicas (ex.: `goblin-scout`, `cleric` se usarem base adaptada com acessórios/cores distintas).
3. **Cenários e VFX em Three.js modular** utilizando as texturas `stone-floor.png` e `stone-wall.png` já geradas, tochas com luz quente, arcos/pilares/caixas/barris e partículas nativas.
4. **Interface (HUD V3)** utilizando retratos e ícones 2D já existentes + melhoria completa do layout e design system (`docs/ui-design-system.md`).
