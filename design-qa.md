# QA visual do ZenMotion

Escopo: estilização do app Expo existente a partir das telas fornecidas, preservando o MVP e seus dados reais. Não é uma reprodução das funcionalidades extras do protótipo. Sem novas telas de login, configurações ou modos de atividade.

## Evidências e normalização

- Referências: `C:/Users/Mmms2/Downloads/ZenMotion — Telas do app-png/` (Início, Atividades, Perfil, Resultado, Sessão — Equilíbrio Zen e Histórico e evolução).
- Referências principais: 780 × 1688 px, normalizadas para 390 × 844 px (densidade 2:1).
- Implementação: Expo Web no navegador interno, viewport 390 × 844 CSS px, capturas de 390 × 844 px. O navegador não simula a área de status e os insets nativos do iOS; estes são tratados com SafeAreaView no app.
- Estado de teste: Ana Luz, três sessões persistidas de 60 s e 240 pontos. Datas, saudação e indicadores são derivados dos dados e do relógio, e podem diferir dos números estáticos do protótipo.
- Diretório de evidências: `C:/Users/Mmms2/.codex/visualizations/2026/10/20/01a156aa-804d-77c1-8ecc-538cc1431b9c/`.
- Comparações abertas lado a lado: `qa-activities-v1.png`, `qa-profile-v1.png` e `qa-navigation-v1.png`. Em cada uma, a referência está à esquerda e a implementação à direita.

## Primeira comparação

- [P1] O cartão grande da atividade corta título, descrição e duração.
  - Evidência: `qa-activities-v1.png`. A referência mostra o conteúdo integral; o contêiner flex do texto na implementação tem altura insuficiente.
  - Correção: separar layout compacto e grande, deixar o texto com altura natural e posicionar a ilustração fora do fluxo.
- [P2] As legendas das abas estão com altura insuficiente e ícones decorativos aparecem no nome acessível.
  - Evidência: `qa-navigation-v1.png` e árvore de acessibilidade do navegador.
  - Correção: definir lineHeight da legenda, reservar altura adequada e ocultar os glifos decorativos da árvore acessível.
- [P2] No perfil de 390 px, o terceiro objetivo quebra linha e aumenta a rolagem desnecessariamente.
  - Evidência: `qa-profile-v1.png`.
  - Correção: reduzir espaços e preenchimento dos chips, mantendo alvo mínimo de 48 px; manter quebra natural em aparelhos menores.
- [P2] A capitalização automática transforma a data em “Terça-Feira, 20 De Out.”.
  - Correção: capitalizar somente o primeiro caractere do texto localizado.

## Restrições intencionais do produto

- Os dois atalhos do Início levam ao Histórico e Perfil, que já funcionam, em lugar dos modos extras ainda não implementados.
- Atividades mostra Equilíbrio Zen e suas instruções, mantendo as três durações reais. Não apresenta cartões de atividades indisponíveis.
- O formulário mantém nome, e-mail, objetivo e duração. Não adiciona notificações, autenticação ou configurações apenas para imitar a imagem.
- O Histórico usa indicadores reais, lista de sessões e envio manual. Gráficos e filtros adicionais do protótipo ficam fora desta etapa.
- O resultado usa um aro simples em StyleSheet; ele enquadra a nota e não representa um gráfico de progresso percentual.

## Segunda comparação e validação final

- Reabertas lado a lado: `qa-home-final.png`, `qa-activities-final.png`, `qa-profile-final.png` e `qa-result-final.png`. Sessão em execução comparada em `qa-session-active.png`.
- O título, a descrição e a duração do cartão grande estão completos. A arte fica fora do fluxo do texto; o botão de iniciar mantém seu alvo de toque.
- As quatro legendas das abas estão legíveis, com lineHeight explícito, e os ícones decorativos não aparecem nos nomes acessíveis.
- Os três objetivos cabem em uma linha a 390 px. A 320 px, o terceiro objetivo quebra naturalmente; o formulário continua rolável e o botão Salvar acessível.
- Data localizada capitaliza somente o primeiro caractere.
- Tipografia Nunito, hierarquia de títulos, fundos, contraste de texto, botões em pêssego, raios e espaçamentos foram revistos em conjunto. Paisagem e esfera usam arquivos locais; cópia e indicadores usam valores reais. As diferenças em quantidade de cartões e campos correspondem ao escopo funcional documentado acima.
- Conferidas larguras de 390 e 320 px: cartões sem cortes, navegação visível, campos e controles com rolagem quando necessário. A captura `zenmotion-activities-320.png` registra a largura menor.
- Fluxos conferidos no navegador: abas, duração de 30 s abrindo a rota correta, erro de e-mail, salvamento e recuperação do perfil após recarregar, duração de 45 s propagada para Atividades, histórico preenchido e vazio, resultado salvo e consulta/envio manual de quatro sessões em API isolada.
- Para inspecionar a sessão ativa, foram usadas leituras temporárias somente no navegador: pausa e retomada, conclusão, salvamento e retorno ao histórico funcionaram. O arquivo temporário foi removido, os dados anteriores foram restaurados e a proteção que exige celular físico foi verificada novamente. Nenhum dado fictício ficou no aplicativo ou na API real.
- Console sem erros de execução. O aviso de desconexão do Metro corresponde ao reinício intencional do servidor para remover o módulo temporário.
- `npx expo lint`, `npx tsc --noEmit` e os 15 testes de `npm run test:hardware`: aprovados. Exportação iOS concluída com as fontes e imagens locais. SDK mantido em 57.0.0.
- Limite da conferência: o novo visual foi inspecionado no navegador; notch, teclado e áreas seguras precisam da conferência visual no iPhone. Os testes físicos dos sensores já haviam sido confirmados pelo usuário antes desta etapa.

Nenhum achado P0, P1 ou P2 permanece aberto no escopo desta etapa.

final result: passed
