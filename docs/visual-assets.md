# Visual do ZenMotion

As telas fornecidas são a referência de cores, tipografia, espaçamentos e linguagem visual. A implementação mantém apenas os fluxos já funcionais do MVP.

## Estrutura

- `src/constants/theme.ts`: cores, famílias da fonte Nunito, escala de espaçamentos e raios.
- `src/components/Screen.tsx`: área segura, rolagem e largura máxima do conteúdo.
- `AppButton`, `IconButton`, `FormField` e `OptionSelector`: aparência compartilhada dos controles e seus estados.
- `StatRow`, `ActivityCard` e `LandscapeHeader`: elementos visuais reutilizados nas telas.
- `src/utils/sessionStats.ts`: resumos derivados do histórico, sem valores de demonstração fixos no aplicativo.

As fontes e imagens são empacotadas com o aplicativo. Não dependem de baixar recursos visuais durante uma sessão. As regras dos sensores, do perfil e do armazenamento permanecem nos arquivos de lógica já existentes.

## Artes do projeto

Método: ferramenta integrada de geração de imagens, usando os arquivos do protótipo como referência visual. Os prompts abaixo documentam a produção. Não há chamadas de geração de imagem em tempo de execução do aplicativo.

### `assets/images/zen-landscape.png`

Arquivo opaco, 1448 × 1086 px. Referência: `Início.png`.

Prompt: “Recreate only the reference’s upper landscape illustration as an opaque 4:3 mobile header background. Dark navy-purple sky, six sparse white stars, open upper-left sky, peach sun at x72%/y70% mostly hidden behind smooth layered purple hills occupying the bottom 35%. Solid #14132B foreground lower edge. Minimal flat illustration. Exclude every word, icon, card, navigation element, border, and watermark.”

Usado no cabeçalho do Início, resultado e identidade do perfil. A imagem contém só a paisagem; textos e botões são componentes nativos. Uma sobreposição de cor na borda inferior faz a transição para o fundo.

### `assets/images/zen-orb.png`

Arquivo PNG com transparência, 1024 × 1024 px. Referência: `Sessão — Equilíbrio Zen.png`.

Prompt: “Recreate only the reference’s central luminous circular orb, cream upper-left highlight, #FFB38A peach body, rosy pink lower edge, subtle glow, centered at roughly 80% canvas; genuine transparency; no rings, UI, text, shadow, ground, or checkerboard.”

Usado na esfera da atividade e nos cartões. A posição da esfera continua sendo calculada pelas leituras dos sensores.

Ícones de interface: Ionicons via `@expo/vector-icons`. Tipografia: Nunito via `@expo-google-fonts/nunito`, carregada com `expo-font`. Fundos de componentes usam `expo-linear-gradient` e os layouts usam StyleSheet.
