# Guia de estudo do código do ZenMotion

Base: código do projeto em 20/10/2026, com Expo SDK 57.0.0, validações concentradas no formulário e nomes locais em português. Público: integrantes do grupo que precisam entender, demonstrar e explicar o aplicativo.

Este guia explica os arquivos escritos para o projeto e como eles trabalham juntos. Não é necessário estudar o código interno das bibliotecas em `node_modules`. Os links para arquivos usam caminhos relativos para continuar funcionando quando o projeto for levado para outro computador.

## Como estudar

Estudem com o aplicativo aberto e o código ao lado. Para cada função, respondam: quem a chama, quais dados recebe, o que faz e quem usa seu resultado. Leiam primeiro o fluxo comum; depois, as proteções contra falhas.

Uma ordem possível para quatro encontros:

| Encontro | Leitura | Prática |
| --- | --- | --- |
| 1 | Seções 1 a 6 | Navegar, editar e salvar o perfil |
| 2 | Seções 7 a 10 | Executar, pausar, retomar e salvar uma atividade |
| 3 | Seções 11 a 13 | Consultar e enviar dados; desligar a API |
| 4 | Seções 14 a 18 | Executar testes e ensaiar a explicação completa |

## Índice

1. [O que o aplicativo faz](#1-o-que-o-aplicativo-faz)
2. [Mapa das responsabilidades](#2-mapa-das-responsabilidades)
3. [Conceitos para ler o código](#3-conceitos-para-ler-o-código)
4. [Inicialização e navegação](#4-inicialização-e-navegação)
5. [Perfil e validação](#5-perfil-e-validação)
6. [Zustand e armazenamento local](#6-zustand-e-armazenamento-local)
7. [Da escolha da atividade até a sessão](#7-da-escolha-da-atividade-até-a-sessão)
8. [Estados e controle da sessão](#8-estados-e-controle-da-sessão)
9. [Sensores e cálculo da estabilidade](#9-sensores-e-cálculo-da-estabilidade)
10. [Tempo, média, resultado e histórico](#10-tempo-média-resultado-e-histórico)
11. [API simplificada](#11-api-simplificada)
12. [Componentes e aparência](#12-componentes-e-aparência)
13. [Percurso completo de uma operação](#13-percurso-completo-de-uma-operação)
14. [Configuração, dependências e execução](#14-configuração-dependências-e-execução)
15. [Testes e falhas](#15-testes-e-falhas)
16. [Critérios da avaliação](#16-critérios-da-avaliação)
17. [Roteiro e perguntas para apresentação](#17-roteiro-e-perguntas-para-apresentação)
18. [Exercícios e conferência de entendimento](#18-exercícios-e-conferência-de-entendimento)

## 1. O que o aplicativo faz

ZenMotion oferece a atividade **Equilíbrio Zen**. O usuário tenta manter o celular deitado e com pouco movimento durante 30, 45 ou 60 segundos. A esfera mostra a inclinação; a pontuação considera inclinação, rotação e alteração da aceleração.

O usuário pode salvar preferências, concluir uma sessão, guardar o resultado, consultar o histórico e enviar os resumos a uma API. `session` ou `sessão` significa uma rodada da atividade; não significa sessão de login.

O MVP atual tem seis telas: Início, Atividades, Perfil, Histórico, Sessão e Resultado. Login, cadastro, outros modos, notificações e gráficos do protótipo não estão implementados. O perfil é local e não autentica uma conta. A pontuação é uma regra do jogo, não uma medida clínica.

Existem quatro lugares diferentes para dados:

| Lugar | Exemplo | Sobrevive ao fechamento do app? |
| --- | --- | --- |
| Estado local do componente/hook | Texto ainda não salvo; atividade em andamento | Não há persistência implementada para esses rascunhos |
| Store Zustand, em memória | Perfil carregado; lista de sessões carregada | Não por si só; precisa ser recuperada do armazenamento |
| AsyncStorage do aparelho | Perfil salvo e histórico salvo | Sim, enquanto os dados do app forem preservados |
| API no computador | Sessões que o usuário enviou | Sim, no arquivo do servidor |

O cache do TanStack Query também fica em memória: guarda a última resposta da API durante o uso. Ele não substitui o histórico local.

## 2. Mapa das responsabilidades

```text
src/app/         telas e regras de navegação
src/components/  partes reutilizáveis da interface
src/hooks/       lógica que se conecta ao ciclo de vida do React
src/stores/      estado global compartilhado, com Zustand
src/storage/     leitura e escrita no AsyncStorage
src/services/    comunicação com API e sensores
src/utils/       cálculos, validações e formatações
src/types/       formatos dos dados no TypeScript
src/constants/   opções, limites e identidade visual
src/providers/   contexto compartilhado do TanStack Query
server/         armazenamento da API de desenvolvimento
tests/          testes executados no computador
assets/         imagens, ícones e outros recursos locais
```

Uma tela recebe ações e exibe resultados. Um serviço acessa um recurso externo, como HTTP ou sensor. Uma função utilitária transforma dados. Separar essas tarefas permite encontrar e explicar cada responsabilidade.

Exemplo: o botão de salvar está em uma tela; a store controla o salvamento; o arquivo de storage escreve no aparelho. Não há três salvamentos diferentes: são três partes da mesma operação.

## 3. Conceitos para ler o código

### Componentes, props e renderização

Um componente é uma função que retorna JSX, a descrição da interface. `View` agrupa conteúdo, `Text` mostra texto, `TextInput` recebe texto, `Pressable` recebe toques, `ScrollView` permite rolar e `FlatList` apresenta listas.

**Props** são entradas recebidas pelo componente. Em `<AppButton title="Salvar" onPress={handleSave} />`, `title` define o texto e `onPress` recebe a função que será chamada no toque. `onPress={handleSave}` passa a função; escrever `handleSave()` ali a executaria durante a renderização.

Quando um estado muda, React executa novamente o componente para atualizar a interface. Isso não significa reiniciar o aplicativo nem apagar automaticamente o estado já mantido pelo React.

### Hooks utilizados

| Recurso | Responsabilidade no nosso código |
| --- | --- |
| `useState` | Guarda dados que alteram a interface, como formulário e status da atividade |
| `useEffect` | Inicia operações e registra recursos após a renderização; pode devolver uma função de limpeza |
| `useRef` | Mantém um valor entre renderizações sem, por si só, redesenhar a tela; acessado por `.current` |
| `useCallback` | Mantém a identidade de uma função enquanto suas dependências não mudam; não a executa |
| `useFocusEffect` | Executa lógica associada ao foco da tela; a limpeza ocorre quando ela perde foco |
| `useLocalSearchParams` | Lê parâmetros da rota |
| Hooks das stores | Selecionam dados e ações do Zustand e acompanham alterações |
| `useQuery` e `useMutation` | Gerenciam consulta e envio para a API |

Nos efeitos, o array de dependências informa quais valores exigem atualizar aquela configuração. A função retornada por um efeito remove listeners e outros recursos antigos. Essa limpeza é especialmente importante nos sensores.

### Sintaxe que aparece com frequência

| Sintaxe | Leitura prática |
| --- | --- |
| `type`, `string`, `number`, `boolean` | Descrevem formatos esperados pelo TypeScript |
| `SessionRecord[]` | Lista de registros de sessão |
| `ProfileForm \| null` | Pode haver um perfil ou ausência de perfil |
| `campo?: string` | Campo opcional |
| `import type` | Importação usada para tipos, sem trazer lógica de execução |
| `async` / `await` | A função trabalha com uma operação assíncrona; espera seu resultado sem bloquear a interface |
| `Promise<boolean>` | A função entregará futuramente `true` ou `false`, ou poderá falhar |
| `try` / `catch` / `finally` | Tentar a operação, tratar erro e executar a finalização |
| `{ ...objeto }` / `[...lista]` | Criar uma cópia superficial, evitando alterar diretamente o valor compartilhado |
| `objeto?.campo` | Só acessar o campo se o objeto existir |
| `valor ?? padrão` | Usar o padrão se o valor for `null` ou `undefined` |
| `condição ? a : b` | Escolher entre dois valores |
| `condição && <Text />` | Mostrar o elemento quando a condição permitir |
| `void operação()` | Ignorar o valor retornado; não é tratamento de erro |
| `return` | Encerrar a função; pode entregar um valor |

TypeScript verifica o código durante o desenvolvimento. Ele não transforma automaticamente dados vindos de JSON em dados válidos. Nesta versão mais simples, validamos o perfil na tela e esperamos que os registros armazenados e recebidos sigam o formato do aplicativo. Não verificamos cada campo novamente ao ler ou gravar. JSON malformado ainda gera erro no `JSON.parse`, e o histórico mantém uma verificação de lista.

### Operações com listas

| Operação | Uso no projeto |
| --- | --- |
| `map` | Criar os elementos visuais de cada opção |
| `find` | Buscar uma sessão pelo ID ou uma opção pelo valor |
| `some` | Perguntar se já existe uma sessão com o ID |
| `every` | Verificar se os três eixos de uma leitura de sensor têm valores finitos |
| `filter` | Remover palavras vazias ao formar iniciais do nome |
| `reduce` | Acumular pontos, duração total e melhor nota |
| `sort` | Ordenar as sessões por data |
| `for...of` | Percorrer as sessões para enviá-las, aguardando cada POST |

### Nomes em português nesta versão

Os nomes locais descrevem o que o valor representa. As funções exportadas, os campos de tipos/JSON e as chaves do AsyncStorage mantêm seus nomes para não exigir mudanças em todas as telas nem nos dados já salvos.

| Nome no código | Significado |
| --- | --- |
| `textoSalvo` | JSON recuperado do AsyncStorage |
| `perfil`, `sessao`, `sessoes` | Dados que estão sendo lidos ou gravados |
| `historicoCarregado` | Resultado da tentativa de recuperar o histórico antes de salvar |
| `erros`, `nome` | Mensagens do formulário e texto do nome sem espaços externos |
| `sessoesServidor`, `jaEnviada`, `quantidadeEnviada` | Lista remota, resultado da comparação de ID e contador do envio |
| `aceleracao`, `rotacao`, `aceleracaoVisual` | Sinais usados na nota e na exibição |
| `inclinacaoGraus`, `velocidadeRotacao`, `variacaoAceleracao` | Medidas extraídas dos sensores |
| `fatorInclinacao`, `fatorRotacao`, `fatorAceleracao` | Fatores entre 0 e 1 multiplicados para gerar a nota |
| `progresso`, `leitura`, `intervaloAceito`, `duracaoMs` | Dados usados para acumular o tempo da atividade |
| `pontos`, `segundos` | Totais derivados do histórico |

## 4. Inicialização e navegação

### Entrada: `package.json` e `src/app/_layout.tsx`

`main: "expo-router/entry"` entrega ao Expo Router a entrada do app. Ele encontra as rotas em `src/app`.

Em [src/app/_layout.tsx](../src/app/_layout.tsx), `RootLayout` envolve o conteúdo com `SafeAreaProvider`. Esse provider disponibiliza as medidas de áreas ocupadas por recortes e barras do aparelho.

`RootContent`:

1. Solicita o carregamento das quatro fontes Nunito e da fonte dos ícones.
2. Seleciona ações das stores e dispara `loadProfile()` e `loadSessions()` em efeitos independentes.
3. Aguarda o perfil estar pronto e o carregamento das fontes terminar, ou ocorrer um erro de fonte.
4. Se a leitura do perfil falhar, mostra mensagem e botão para tentar novamente.
5. Monta `ApiProvider`, a barra de status e a pilha `Stack` de navegação.

**Detalhe:** o bloqueio inicial considera o perfil e as fontes. O histórico carrega separadamente; Histórico e Resultado usam `HistoryStatus` para aguardar ou tratar erro de sua leitura. Ausência de perfil salvo é normal: a leitura retorna `null` e fica pronta.

### As abas

[src/app/(tabs)/_layout.tsx](../src/app/%28tabs%29/_layout.tsx) define `Tabs` com Início, Atividades, Histórico e Perfil. O grupo `(tabs)` organiza as rotas; os parênteses não viram um segmento público da URL. `_layout.tsx` organiza navegação, não é uma tela de conteúdo comum. Essa é a convenção do [Expo Router](https://docs.expo.dev/router/basics/notation/).

As cores ativa/inativa indicam a aba selecionada. O espaço inferior considera `insets.bottom` para não sobrepor a área do gesto de início no iPhone.

| Arquivo | Rota e responsabilidade |
| --- | --- |
| [index.tsx](../src/app/%28tabs%29/index.tsx) | `/`: saudação, estatísticas locais e atalhos |
| [atividades.tsx](../src/app/%28tabs%29/atividades.tsx) | `/atividades`: seletor de duração e início da atividade |
| [perfil.tsx](../src/app/%28tabs%29/perfil.tsx) | `/perfil`: formulário local de preferências |
| [historico.tsx](../src/app/%28tabs%29/historico.tsx) | `/historico`: lista local, resumos e painel da API |
| [sessao/[atividade].tsx](../src/app/sessao/%5Batividade%5D.tsx) | `/sessao/equilibrio-zen?duracao=30`: valida parâmetros e monta a atividade |
| [resultado/[id].tsx](../src/app/resultado/%5Bid%5D.tsx) | `/resultado/ID`: procura no histórico local o ID recebido |

`[atividade]` e `[id]` são segmentos dinâmicos. `duracao` é um parâmetro adicional. A duração trafega como texto e depois é convertida com `Number`.

### Comandos de navegação encontrados

- `router.push`: abre outra entrada na pilha; usado para iniciar atividade ou abrir resultado do histórico.
- `router.replace`: substitui a entrada atual; ao salvar, impede que Voltar reabra a sessão finalizada que acabou de ser substituída.
- `router.navigate`: navega para destinos como as abas.
- `router.back`: volta na pilha, quando `canGoBack()` permite; há uma rota alternativa se não existir entrada anterior.

## 5. Perfil e validação

### Dados e opções

[types/profile.ts](../src/types/profile.ts) declara `ProfileForm`, com `name`, `email`, `goal` e `duration`. Todos são textos durante a edição. `ProfileErrors` permite uma mensagem opcional para cada campo.

[constants/profile.ts](../src/constants/profile.ts) declara os valores aceitos e seus rótulos. Exemplo: o usuário lê `Coordenação`, mas o valor salvo é `coordenacao`. As durações são `"30"`, `"45"` e `"60"`.

### O rascunho do formulário

Em `perfil.tsx`, `savedProfile` vem da store e `form` é a cópia local em edição. Digitar não altera imediatamente o perfil compartilhado. `useState` cria o rascunho inicial com os dados já carregados ou campos vazios e duração padrão de 60 s.

| Função/estado | O que faz |
| --- | --- |
| `updateField(field, value)` | Atualiza um campo usando `[field]`, marca-o como tocado e esconde a confirmação anterior |
| `markTouched(field)` | Marca que houve interação, inclusive ao sair do campo |
| `touched` | Controla quais mensagens de validação podem aparecer |
| `errors` | Resultado de validar o rascunho a cada renderização |
| `showConfirmation` | Controla a mensagem de salvamento bem-sucedido |
| `handleSave()` | Mostra todos os erros, interrompe se houver algum e solicita o salvamento válido |

O botão Salvar fica bloqueado durante a gravação. Dados inválidos são impedidos dentro de `handleSave`; não dependemos de desabilitar o botão pela validade.

### Regras: `utils/validators.ts`

[validateProfile](../src/utils/validators.ts) começa com o objeto `erros` vazio. Exige nome preenchido após `trim`, e-mail com formato básico, objetivo da lista e duração da lista. A expressão regular do e-mail verifica a estrutura; não consulta se a caixa existe. Não há tamanho mínimo adicional para o nome.

`Object.keys(errors).length > 0` significa que há pelo menos uma mensagem. Sem erros, `handleSave` remove espaços externos de nome/e-mail e aguarda `saveProfile`. Somente se receber `true`, confirma o salvamento e fecha o teclado.

O cabeçalho mostra o perfil salvo, as iniciais e os pontos derivados das sessões. `KeyboardAvoidingView` ajusta a área de conteúdo no iOS; `ScrollView` permite acessar os campos e botões com rolagem.

## 6. Zustand e armazenamento local

### Store não é arquivo gravado

`create` do Zustand cria um estado global. `set` altera esse estado e notifica os componentes inscritos; `get` consulta seu valor atual dentro das ações.

```ts
const profile = useZenStore((state) => state.profile);
```

Esse seletor entrega o perfil à tela. Quando a ação de salvar altera o perfil da store, os componentes que o utilizam podem atualizar a interface. Não precisamos passar o perfil manualmente entre todas as telas.

### `stores/useZenStore.ts`

[useZenStore](../src/stores/useZenStore.ts) guarda `profile`, `loadStatus`, `isSaving` e `storageError`.

- `loadProfile` evita iniciar leituras se já está carregando ou pronto. Muda o status para `loading`, aguarda `readProfile`, e publica o perfil com `ready`. Em falha, publica `error` e uma mensagem.
- `saveProfile` recebe `perfil`, evita gravações simultâneas ou antes da leitura, ativa `isSaving`, aguarda `writeProfile` e somente depois troca o perfil global. Retorna `true` no sucesso e `false` no erro.

Escrever primeiro e publicar depois evita mostrar como salvo um dado que falhou ao gravar.

### `storage/profileStorage.ts`

[profileStorage](../src/storage/profileStorage.ts) usa a chave `@zenmotion/profile`.

`writeProfile` recebe o perfil já validado pela tela, transforma o objeto em texto com `JSON.stringify` e usa `AsyncStorage.setItem`. `readProfile` usa `getItem`, retorna `null` se não há dado e, se houver, usa `JSON.parse`. `CHAVE_PERFIL` mantém o mesmo texto de chave usado antes; `textoSalvo` é o valor recuperado. Não repetimos a validação do formulário no storage.

AsyncStorage guarda valores de texto. `JSON.stringify` converte objeto em texto; `JSON.parse` faz o caminho de volta. JSON inválido lança erro, que chega ao `catch` da store.

### `stores/useSessionStore.ts`

[useSessionStore](../src/stores/useSessionStore.ts) guarda a lista `sessions`, status/erro de leitura e status/erro de gravação.

- `loadSessions`: se já está pronto, retorna `true`. Se uma leitura está em andamento, retorna `false` sem iniciar outra. Caso contrário, lê o storage, publica a lista e retorna sucesso. Em falha, registra a mensagem e retorna `false`.
- `saveSession`: recebe `sessao`, bloqueia gravações simultâneas e chama `loadSessions`. Se o histórico ainda não estiver disponível, mostra uma mensagem para tentar novamente, sem sobrescrever a lista. Se o ID já existe, considera o registro salvo. Caso contrário, acrescenta o resultado, ordena por data, grava a lista e depois atualiza a store.
- `finally` desativa `isSaving` tanto em sucesso quanto em falha, inclusive quando houve um retorno antecipado dentro do `try`.

O fluxo agora usa apenas funções `async`, `try/catch` e o status de leitura. Não há promessa compartilhada ou função assíncrona aninhada. Se tentar salvar enquanto a leitura inicial ainda estiver em andamento, aguarde e toque em salvar novamente; o resultado permanece na tela.

### `storage/sessionStorage.ts`

[sessionStorage](../src/storage/sessionStorage.ts) usa a constante `CHAVE_SESSOES`, com o texto `@zenmotion/sessions`. `readSessions` retorna lista vazia se não existe histórico; caso contrário, interpreta o JSON, verifica com `Array.isArray` se é uma lista e ordena pela data. `writeSessions` grava a lista inteira.

A verificação detalhada de cada registro e o `Set` de IDs foram removidos. O resultado nasce no próprio aplicativo e a store já evita acrescentar novamente um ID salvo. O formato de cada registro lido é assumido; edições externas ou dados antigos com outro formato podem exigir tratamento que esta versão não implementa.

Perfil e histórico usam chaves separadas. Uma falha de rede não altera essas chaves. Limpar os dados do aplicativo pode apagar o armazenamento local; apenas fechar e reabrir normalmente não o apaga.

## 7. Da escolha da atividade até a sessão

No Início, a duração vem do perfil ou assume 60 s. A saudação usa a hora local quando a tela renderiza; não há um relógio periódico atualizando o cumprimento. Os números de sessões, pontos e minutos vêm de `sessionStats`.

Em Atividades, o seletor possui estado local. `useFocusEffect` recoloca a preferência salva sempre que a tela recebe foco. Alterar apenas esse seletor muda a próxima atividade; não grava a preferência do Perfil.

`openSession` envia `atividade: "equilibrio-zen"` e `duracao: String(duration)`. Na rota dinâmica, `SessionScreen` lê os parâmetros e só aceita esse nome de atividade e as três durações. Valor inválido mostra uma mensagem, sem iniciar sensores.

Com valores válidos, monta `ZenSession`. A `key` contém atividade e duração: se esses parâmetros mudarem, React pode montar uma nova instância, com estado inicial próprio.

`ZenSession` recebe três props: `duration`, `onExit` e `onSaved`. A rota define o que fazer ao sair e ao salvar; o componente cuida da interface da atividade e usa `useZenSession` para a lógica.

## 8. Estados e controle da sessão

### `types/session.ts`

[session.ts](../src/types/session.ts) descreve cinco formatos:

| Tipo | Significado |
| --- | --- |
| `Vector3` | Um vetor com eixos `x`, `y`, `z` |
| `StabilityReading` | Nota atual, booleano de faixa e posição normalizada da esfera |
| `SessionStatus` | Uma das cinco fases da atividade |
| `SessionProgress` | Tempo acumulado, tempo na faixa e soma ponderada |
| `SessionRecord` | Resumo final persistido e enviado à API |

### `hooks/useZenSession.ts`

[useZenSession](../src/hooks/useZenSession.ts) é o controlador da atividade. Ele não faz POST nem grava no AsyncStorage.

```text
ready --Começar--> checking --sensores disponíveis--> running
running --Pausar / sair do foco / segundo plano--> paused
checking --erro ou interrupção--> paused
paused --Retomar--> checking --> running
paused --Recomeçar--> ready
running --tempo completo--> finished
```

`checking` representa uma operação assíncrona de permissão e disponibilidade. `finished` representa a conclusão da atividade, ainda sem garantir gravação local.

| Estado/ref | Responsabilidade |
| --- | --- |
| `status` | Fase que a interface mostra |
| `reading` | Última leitura para a esfera e o indicador atual |
| `progress` | Acumuladores que aparecem na tela |
| `message` | Mensagem de falha dos sensores |
| `result` | Registro final criado ao concluir |
| `statusRef` / `progressRef` | Versões imediatamente acessíveis nos callbacks dos sensores |
| `lastReadingAt` | Momento da leitura anterior usada para calcular o intervalo |
| `sensorsRef` | Referência ao objeto que permite iniciar/parar sensores |

Precisamos de refs porque callbacks podem continuar sendo chamados entre renderizações. `setState` agenda uma atualização da interface; a ref é alterada imediatamente. `changeStatus` mantém status visual e ref alinhados.

### Funções do controlador

- `handleReading(value, timestamp)`: só aceita progresso em `running`; atualiza a leitura, calcula o intervalo desde a anterior e chama `advanceProgress`. Na primeira leitura não há intervalo anterior, então só estabelece a referência. Ao alcançar a duração, para os sensores, cria um único registro e entra em `finished`.
- `handleError(error)`: limpa a referência temporal, apresenta a mensagem e coloca em pausa. O serviço de sensores já interrompe a coleta ao relatar a falha.
- `pause()`: se está rodando ou verificando, para a coleta, limpa o instante anterior e entra em pausa. Não apaga o progresso.
- `start()`: permite começar ou retomar, limpa a leitura/mensagem anterior e passa por `checking`. Aguarda `sensors.start()` e só entra em `running` se aquela verificação ainda estiver vigente.
- `reset()`: para a coleta e limpa progresso, leitura, mensagem e resultado, voltando a `ready`. Não apaga o histórico de sessões já salvas.

O efeito principal cria o serviço e escuta `AppState`. `background` pausa a atividade; `inactive` também pausa quando já estava rodando. A exceção durante a verificação evita interpretar o próprio diálogo de permissão como uma pausa indevida.

A limpeza remove listeners do app e sensores. A limpeza de `useFocusEffect` também chama `pause` quando a rota perde foco. O usuário precisa retomar explicitamente; voltar ao app não reinicia a atividade sozinho.

**Cronômetro:** o progresso é movido pelas leituras aceitas, não por um `setInterval` que desconta segundos independentemente do hardware. O intervalo periódico do serviço é para detectar perda de dados, não para pontuar.

## 9. Sensores e cálculo da estabilidade

### As unidades

O [acelerômetro do Expo](https://docs.expo.dev/versions/v57.0.0/sdk/accelerometer/) fornece aceleração nos três eixos em unidades de gravidade, `g`. O [giroscópio](https://docs.expo.dev/versions/v57.0.0/sdk/gyroscope/) fornece velocidade de rotação em radianos por segundo. O aparelho deitado e parado tem X/Y próximos de zero e módulo da aceleração próximo de 1 g.

Não é preciso memorizar todas as fórmulas para começar, mas cada integrante deve conseguir explicar a origem dos dados, as três penalidades da nota e a diferença entre nota e tempo na faixa.

### `constants/motion.ts`: limites do jogo

[motionSettings](../src/constants/motion.ts) concentra parâmetros ajustáveis:

| Parâmetro | Valor | Uso |
| --- | --- | --- |
| `sampleIntervalMs` | 100 ms | Intervalo solicitado aos sensores; aproximadamente 10 leituras/s, sem garantia exata |
| `smoothingFactor` | 0,25 | Peso da leitura nova na suavização visual |
| `maxReadingGapMs` | 500 ms | Limite de idade do acelerômetro e de intervalo aceito no progresso |
| `sensorTimeoutMs` | 1500 ms | Tempo sem leitura combinada até relatar falha |
| `watchdogIntervalMs` | 250 ms | Frequência de verificação dessa falta de dados |
| `targetTiltDegrees` | 12 graus | Inclinação máxima para contar tempo na faixa |
| `maxTiltDegrees` | 30 graus | Inclinação que reduz seu fator de nota a zero |
| `targetRotationRadPerSecond` | 0,35 rad/s | Rotação máxima para contar tempo na faixa |
| `maxRotationRadPerSecond` | 1,5 rad/s | Rotação que zera seu fator de nota |
| `targetAccelerationChangeG` | 0,2 g | Desvio de 1 g aceito para tempo na faixa |
| `maxAccelerationChangeG` | 0,5 g | Desvio que zera seu fator de nota |

São escolhas de sensibilidade da atividade. Não são valores prescritos pelo professor ou uma calibração médica.

### `services/motionSensors.ts`: conversar com o aparelho

[createMotionSensors(onReading, onError)](../src/services/motionSensors.ts) cria um objeto com `start` e `stop`. Os argumentos são callbacks: funções que o serviço chama quando chega uma leitura ou ocorre uma falha.

`start`:

1. Remove qualquer coleta anterior com `stop`.
2. Registra o número da tentativa atual.
3. Recusa a plataforma web, pois o fluxo foi implementado para os sensores nativos do celular.
4. Solicita permissões dos dois sensores e verifica os resultados.
5. Confere disponibilidade dos dois sensores.
6. Solicita atualizações a cada 100 ms.
7. Registra um listener para aceleração e outro para rotação.
8. Ativa a verificação periódica de perda de dados e retorna `true`.

`Promise.all` aguarda as duas solicitações da etapa. Uma permissão retornada pela API pode já estar concedida; não significa que toda chamada abrirá um novo diálogo no sistema.

O acelerômetro atualiza três informações: leitura original, leitura suavizada e instante da atualização. O callback do giroscópio combina a rotação com a aceleração recente e chama `calculateStability`. Sem aceleração recente ou com valores não finitos, não entrega progresso válido.

`stop` remove as subscriptions criadas pelo próprio serviço e encerra o intervalo periódico. `fail` faz essa limpeza e chama `onError`. Não usamos `removeAllListeners`, pois isso poderia remover listeners de outro consumidor.

### Por que há `revision` e `attempt`?

Um pedido de permissão pode demorar. Se o usuário sair antes da resposta, não queremos iniciar sensores depois que a tela foi abandonada.

`revision` é um contador aumentado por `stop`. `attempt` guarda a revisão do início daquela tentativa. Depois de esperar uma operação, o código confere se ainda são iguais. Se diferem, a tentativa ficou antiga. Os callbacks também fazem essa conferência para descartar eventos atrasados.

### A suavização da esfera

Para cada eixo:

```text
valor suavizado = anterior × 0,75 + leitura nova × 0,25
```

Se o anterior era 0 e o novo é 0,4, a versão visual vira 0,1 naquela atualização. Isso reduz tremulação. A leitura original continua sendo usada para pontuar, para que um movimento brusco prejudique a nota imediatamente.

`performance.now()` mede tempo decorrido. `Date.now()` mede o relógio civil do aparelho. Usamos o primeiro para intervalos e a data real para identificar quando o resultado foi concluído.

### `utils/calculateStability.ts`: dos vetores à nota

[calculateStability](../src/utils/calculateStability.ts) recebe aceleração original, rotação e, opcionalmente, a aceleração suavizada de exibição. Retorna `stability`, `inRange`, `offsetX` e `offsetY`.

As etapas são:

1. `Math.hypot(x, y, z)` calcula o comprimento do vetor. Para a rotação, esse comprimento representa intensidade total de giro.
2. Dados não finitos ou aceleração de módulo menor que 0,1 retornam nota zero e fora da faixa. Não reutilizamos uma leitura estável antiga.
3. `atan2` estima a inclinação pela relação entre aceleração lateral e eixo Z. Multiplicar por `180 / Math.PI` converte radianos em graus. O valor absoluto de Z permite os dois sinais de gravidade.
4. `Math.abs(magnitude - 1)` calcula quanto o módulo da aceleração se afastou de 1 g.
5. `limitar` mantém cada fator entre 0 e 1.
6. A pontuação multiplica os três fatores e converte para um inteiro de 0 a 100.

```text
fator inclinação = limitar(1 - inclinação / 30, 0, 1)
fator rotação = limitar(1 - velocidade / 1,5, 0, 1)
fator aceleração = limitar(1 - desvio / 0,5, 0, 1)
nota = arredondar(100 × os três fatores)
```

Exemplo didático: inclinação de 6 graus, rotação de 0,15 rad/s e desvio de 0,05 g produzem fatores 0,8, 0,9 e 0,9. A nota é `round(100 × 0,8 × 0,9 × 0,9) = 65`.

`inRange` é outra regra: os três limites-alvo precisam ser atendidos ao mesmo tempo. No exemplo acima, todos são atendidos, embora a nota seja 65. Portanto, nota 87 **não significa** ficar 87% do tempo na faixa.

Para a esfera, a função usa o vetor visual normalizado, inverte o sentido de Y para a tela e limita o deslocamento ao círculo unitário. Não integra o giroscópio para descobrir uma posição; a esfera é orientada pela aceleração.

## 10. Tempo, média, resultado e histórico

### `utils/sessionProgress.ts`

[INITIAL_PROGRESS](../src/utils/sessionProgress.ts) começa com `elapsedMs`, `stableMs` e `weightedScore` em zero.

`advanceProgress` recebe o progresso anterior, uma leitura, o intervalo desde a leitura anterior e a duração-alvo em milissegundos. Recusa intervalos não finitos, negativos, zero ou maiores que 500 ms. Limita o intervalo aceito ao tempo que ainda falta para terminar.

```text
tempo total += intervalo aceito
tempo na faixa += intervalo, somente se inRange for true
soma ponderada += nota atual × intervalo
```

Um intervalo fora da faixa ainda conta para a duração e para a média. Apenas não aumenta o tempo na faixa. Uma lacuna inválida não conta para nenhum dos três.

`averageStability` divide a soma ponderada pelo tempo acumulado e arredonda; sem tempo acumulado, retorna zero.

Exemplo: nota 100 por 100 ms e nota 50 por 300 ms:

```text
(100 × 100 + 50 × 300) / 400 = 62,5 → média 63
```

A leitura com mais tempo pesa mais. Fazer apenas `(100 + 50) / 2` daria 75 e não corresponderia a essa regra.

### `components/ZenSession.tsx`

[ZenSession](../src/components/ZenSession.tsx) liga o controlador à interface:

- `remaining` converte os milissegundos acumulados em segundos restantes usando `Math.ceil` e evita valores negativos.
- `clock` divide por 60, usa o resto `% 60` e preenche zeros com `padStart`: `00:30`, por exemplo.
- A esfera usa `translateX`/`translateY`: deslocamento normalizado × 90, menos 14 para centralizar o elemento de 28 px. Não é um novo cálculo da nota.
- A instrução e os botões mudam com `status`: Começar, Verificando, Pausar, Retomar, Recomeçar ou Salvar.
- `hasTriedSaving` evita exibir como erro desta tentativa uma mensagem anterior da store antes de tocar em Salvar.
- `mounted` indica se o componente continua montado. Se ele saiu durante uma gravação, o término da promessa não deve abrir outra tela.

`saveResult` só atua se existe `session.result`, aguarda `saveSession` e chama `onSaved(id)` apenas no sucesso e enquanto montado. Concluir a duração não envia dados à API e não salva automaticamente no histórico.

### `utils/sessionRecord.ts`

[sessionRecord](../src/utils/sessionRecord.ts) reúne:

| Função | Responsabilidade |
| --- | --- |
| `createSessionRecord` | Receber `progresso` e `duracaoSegundos`, exigir duração concluída, gerar ID/data, calcular média e produzir diretamente o resumo final |
| `formatSessionDate` | Mostrar data/hora em formato brasileiro no fuso do aparelho |
| `formatStableTime` | Converter milissegundos em segundos, com uma casa decimal e vírgula |

O ID combina `Date.now().toString(36)` com texto de `Math.random()`. É um identificador simples do projeto; não é token de autenticação, UUID ou garantia matemática de unicidade. A data é ISO, com `toISOString`. Só o resumo é salvo, sem a série de leituras individuais.

O registro final é criado uma vez ao terminar a atividade. Se o armazenamento falhar e o usuário repetir o salvamento, reutiliza o mesmo ID.

### Resultado e Histórico

`resultado/[id].tsx` lê o ID e usa `find` na store local. Enquanto o histórico carrega, mostra `HistoryStatus`. Se não encontra o ID, explica que esse resultado não está neste aparelho. Não tenta buscá-lo na API.

A nota define o título: 80 ou mais, “Muito estável”; 60 ou mais, “Bom equilíbrio”; abaixo disso, “Um passo de cada vez”. O aro visual enquadra a nota e não desenha uma porcentagem proporcional. Concluir/fechar navega ao Histórico; Repetir substitui a rota por uma nova sessão com a mesma atividade e duração.

`historico.tsx` usa `FlatList`, ID como chave e dados da store. O cabeçalho reúne resumos e `SessionSync`. A lista vazia oferece Escolher atividade. Tocar em um registro abre Resultado passando apenas seu ID.

### `utils/sessionStats.ts`

[sessionStats](../src/utils/sessionStats.ts) calcula dados derivados, sem criar outra store:

| Campo | Cálculo |
| --- | --- |
| `count` | Quantidade de registros |
| `points` | Soma das notas médias das sessões |
| `minutes` | Duração total em segundos dividida por 60, arredondada |
| `average` | Média simples das notas finais das sessões, arredondada |
| `best` | Maior nota final; zero para lista vazia |

Três sessões com notas 80, 90 e 70 geram 240 pontos e média 80. Se cada uma dura 30 s, o total é 90 s e o indicador arredondado mostra 2 minutos. A média do histórico dá o mesmo peso a cada sessão; a média interna de uma sessão é ponderada pelo tempo.

## 11. API simplificada

### O que roda no computador

O projeto ainda usa **JSON Server 0.17.4**, não MockAPI. `npm run api` inicia o comando definido no `package.json`: observa `server/db.json`, escuta nas interfaces do computador e usa a porta 3001. A coleção `sessions` no JSON origina as rotas. GET consulta; POST acrescenta um registro. O arquivo é o armazenamento do servidor, não o AsyncStorage do celular. O comportamento é fornecido pela [biblioteca JSON Server](https://github.com/typicode/json-server/tree/v0.17.4).

Não implementamos login, regras de autorização, validações próprias do backend ou isolamento de dados por usuário. O servidor local é destinado à demonstração em rede local.

### `services/api.ts`

[api.ts](../src/services/api.ts) cria uma instância do Axios com:

- `baseURL`: variável `EXPO_PUBLIC_API_URL`, removendo espaços externos, ou `http://localhost:3001` como padrão.
- `timeout`: 8000 ms, para não esperar indefinidamente.
- Header `Content-Type: application/json`, para enviar JSON.

`apiErrorMessage` verifica se o erro é do Axios. Sem resposta HTTP, apresenta falha de conexão; com resposta, falha do servidor. Outros erros usam sua mensagem ou uma mensagem genérica.

No celular, `localhost` aponta para o celular. Para a API no computador, usamos `http://IP_DO_COMPUTADOR:3001`. O endereço precisa ser revisto ao mudar de computador/rede. Variáveis `EXPO_PUBLIC_` fazem parte da configuração acessível ao app, não são local para segredos. Veja a [documentação de variáveis do Expo](https://docs.expo.dev/guides/environment-variables/).

### `services/sessionsApi.ts`: duas funções

[getRemoteSessions](../src/services/sessionsApi.ts) faz `api.get<SessionRecord[]>("/sessions")` e retorna `response.data`. O tipo informa ao TypeScript qual resposta esperamos; não valida cada registro em execução.

`sendSessions(sessions)`:

1. Faz GET para conhecer a lista atual.
2. Inicia `quantidadeEnviada` em zero.
3. Percorre a lista local com `for...of`.
4. `sessoesServidor.some(sessaoServidor => sessaoServidor.id === sessao.id)` verifica se o ID já existe.
5. Se não existe, aguarda `api.post("/sessions", session)` e soma um ao contador.
6. Retorna o total enviado nessa tentativa.

Exemplo: aparelho tem A, B e C; servidor tem A. O código envia B e C e retorna 2. Ao repetir com os três no servidor, retorna 0. A lista local não é apagada.

Essa proteção simples depende de o servidor manter o ID fornecido e do histórico local ter IDs únicos. Não compara conteúdo de registros com o mesmo ID nem resolve concorrência entre aparelhos. Se futuramente o serviço gerar seus próprios IDs, essa integração precisará de adaptação.

Se um POST falhar, a função termina com erro; os anteriores podem ter sido recebidos. Uma nova tentativa faz outro GET e pula os que já chegaram.

### `providers/ApiProvider.tsx`

[ApiProvider](../src/providers/ApiProvider.tsx) cria um `QueryClient` em inicialização preguiçosa do `useState`: a função `() => new QueryClient(...)` cria uma instância estável para aquele provider, sem recriar o cache em toda renderização. Não usamos o setter porque não trocamos essa instância.

O provider envolve as telas para que os hooks compartilhem o cliente. `children` é o conteúdo envolvido.

| Opção | Efeito |
| --- | --- |
| `staleTime: 60_000` | Considera a resposta recente durante um minuto; não apaga o cache ao terminar esse minuto |
| `retry: false` | Não repete automaticamente uma operação que falhou |
| `networkMode: "always"` | Permite tentar mesmo sem indicação prévia de conexão; não cria internet nem faz a API responder offline |

Não há integração própria com `AppState` neste provider após a simplificação. O botão Atualizar permite nova consulta manual. O cache não está persistido no disco.

### `hooks/useSessionApi.ts`

[useSessionApi](../src/hooks/useSessionApi.ts) conecta as operações ao TanStack Query:

- `useQuery`: chave `["sessions"]`, função `getRemoteSessions`, resultado e estados de consulta em `remoteQuery`.
- `useMutation`: função `sendSessions`, disparada manualmente; resultado e estados em `sendMutation`.
- `useQueryClient`: acesso ao cliente compartilhado.
- `onSettled`: invalida `["sessions"]` depois de sucesso ou erro, pois um envio parcial também pode ter alterado o servidor.

Invalidar marca a consulta como desatualizada; uma consulta ativa normalmente é refeita em segundo plano. Não significa apagar as sessões do aparelho. Essa distinção segue o [funcionamento do TanStack Query](https://tanstack.com/query/v5/docs/framework/react/guides/query-invalidation).

### `components/SessionSync.tsx`

[SessionSync](../src/components/SessionSync.tsx) recebe a lista local por props e usa o hook acima. `desabilitado` combina consulta em andamento e envio em andamento para bloquear ações concorrentes na interface.

| Propriedade/ação | O que a tela faz |
| --- | --- |
| `isLoading` | Indicador do carregamento inicial |
| `isFetching` | Mensagem de consulta em andamento, inclusive atualização |
| `remoteQuery.data.length` | Quantidade de registros na última resposta do servidor |
| `remoteQuery.isError` | Mensagem de erro da consulta, se não há erro de envio já em destaque |
| `sendMutation.isPending` | Texto Enviando e bloqueio do botão |
| `sendMutation.isError` | Mensagem de falha de envio |
| `sendMutation.isSuccess` | Quantidade enviada, ou aviso de que já estavam no servidor |
| `remoteQuery.refetch()` | Atualização manual |
| `sendMutation.mutate([...sessions])` | Envio de uma cópia da lista local |

Abrir o painel inicia a consulta conforme as regras de cache, mas não envia sessões automaticamente. O botão de envio fica indisponível se a lista local está vazia.

**Limite funcional:** a resposta do GET alimenta o painel da API. Ela não substitui nem recupera automaticamente o histórico local. A quantidade no servidor pode incluir registros que não existem neste aparelho.

## 12. Componentes e aparência

Todos os arquivos de componente são reaproveitáveis ou separam um bloco da tela para facilitar sua leitura. Usam StyleSheet para aparência; não gravam dados por existir um estilo.

| Arquivo | Entradas principais | Responsabilidade |
| --- | --- | --- |
| [AppButton.tsx](../src/components/AppButton.tsx) | `title`, `onPress`, `disabled`, `variant` | Botão principal, secundário ou de texto; feedback de toque e estado desabilitado |
| [IconButton.tsx](../src/components/IconButton.tsx) | Nome do ícone, rótulo, ação, bloqueio | Botão circular acessível; `ComponentProps` reaproveita os nomes válidos do Ionicons |
| [FormField.tsx](../src/components/FormField.tsx) | `label`, `error` e props do TextInput | Rótulo, entrada controlada, borda e mensagem de erro; `...inputProps` repassa configurações do campo |
| [OptionSelector.tsx](../src/components/OptionSelector.tsx) | Opções, valor, `onChange`, erro, variante | Grupo de escolha única; `map` desenha as opções e o valor selecionado define o destaque |
| [Screen.tsx](../src/components/Screen.tsx) | `children`, `contentStyle`, `edges` | Área segura, rolagem e espaçamento compartilhado; exporta `screenContent` |
| [ActivityCard.tsx](../src/components/ActivityCard.tsx) | Duração, ação, `large` | Cartão grande/compacto da atividade; só chama a ação recebida |
| [LandscapeHeader.tsx](../src/components/LandscapeHeader.tsx) | `children` | Paisagem e transição visual para o fundo; o degradê decorativo não intercepta toques |
| [StatRow.tsx](../src/components/StatRow.tsx) | Lista de valores e rótulos | Mostra indicadores e divisórias; não calcula as estatísticas |
| [HistoryStatus.tsx](../src/components/HistoryStatus.tsx) | Lê a store | Mostra carregamento ou erro da leitura local e permite tentar novamente |
| [ZenSession.tsx](../src/components/ZenSession.tsx) | Duração, saída e callback de salvamento | Interface da atividade, ligada ao controlador e à store |
| [SessionSync.tsx](../src/components/SessionSync.tsx) | Lista de sessões locais | Interface da consulta e envio à API |

`constants/theme.ts` centraliza cores, famílias de fonte e escalas de espaçamento/raios. Alguns estilos ainda usam medidas e cores específicas diretamente; nem todo valor visual vem dessas escalas.

### Como interpretar um StyleSheet

- `flex: 1` permite ocupar espaço disponível; `flexDirection: "row"` organiza filhos na horizontal.
- `padding` é espaço interno; `margin`, externo; `gap`, distância entre filhos.
- `width: "100%"` acompanha o contêiner; `maxWidth: 600` limita a largura de leitura nas telas maiores.
- `alignItems` e `justifyContent` alinham nos eixos do contêiner.
- `borderRadius` arredonda; `overflow: "hidden"` recorta conteúdo nas bordas.
- `position: "absolute"` posiciona em relação ao contêiner, como a esfera e elementos decorativos.
- Arrays como `[styles.input, error && styles.inputError]` combinam estilos; um estilo posterior pode sobrescrever o anterior.

As labels, papéis de botão/radio e mensagens de alerta ajudam leitores de tela. Ícones decorativos usam ocultação acessível porque o controle pai já fornece um rótulo compreensível.

### Imagens e fontes

`assets/images/zen-landscape.png` e `zen-orb.png` são as artes locais usadas no app; não são o protótipo inteiro como captura de fundo. Os textos e controles continuam componentes. Os demais PNGs configuram ícones, favicon e splash. `assets/expo.icon/icon.json` descreve a composição do ícone iOS e referencia suas camadas. A pasta `assets/expo.icon/Assets` contém esses recursos.

As fontes Nunito são carregadas de pacotes locais por `expo-font`. A geração e a origem das artes estão documentadas em [visual-assets.md](visual-assets.md). Nenhuma geração de imagem é executada ao usar o aplicativo.

## 13. Percurso completo de uma operação

### Exemplo A: salvar o perfil

```text
Toque no campo → onChangeText → updateField → form local
                                      ↓
                             validateProfile → erros visuais
Toque em Salvar → handleSave → saveProfile (Zustand)
                                      ↓
                     writeProfile → stringify → AsyncStorage
                                      ↓ sucesso
                        set(profile) → outras telas atualizam
```

A API não participa. O nome no Início e a duração padrão passam a refletir o perfil salvo.

### Exemplo B: iniciar, concluir e salvar uma atividade

```text
Atividades: openSession(30)
 → router.push com atividade/duração
 → SessionScreen valida a rota
 → ZenSession chama useZenSession(30)
 → Começar chama start do hook
 → start do serviço pede permissão e registra sensores
 → acelerômetro atualiza aceleração
 → giroscópio combina os sinais e chama calculateStability
 → onReading entrega nota, faixa e posição ao hook
 → handleReading chama advanceProgress
 → React atualiza esfera, cronômetro e indicadores
 → ao completar: stop + createSessionRecord + finished
 → usuário toca Salvar e ver resultado
 → saveResult chama saveSession da store
 → writeSessions grava a lista no AsyncStorage
 → store recebe a lista atualizada
 → onSaved(id) substitui a rota por Resultado
 → Resultado encontra o registro pelo ID
```

Pausar remove a coleta e zera a referência do último instante. Retomar preserva o progresso, verifica sensores novamente e estabelece uma nova referência; os cinco segundos de uma pausa não entram no tempo da atividade.

### Exemplo C: enviar o histórico

```text
Histórico lê sessões locais da store
 → SessionSync recebe a lista
 → consulta GET pode exibir a quantidade remota
 → usuário toca Enviar sessões salvas
 → mutate chama sendSessions
 → GET atualiza a lista usada na comparação de IDs
 → POST de cada sessão ainda ausente
 → contador informa o total enviado
 → onSettled invalida a consulta
 → nova resposta atualiza o painel
```

Com erro no meio, não é correto afirmar que nada chegou ao servidor. Por isso a tentativa seguinte verifica os IDs novamente. A lista local permanece disponível em ambos os casos.

## 14. Configuração, dependências e execução

### Arquivos da raiz e material auxiliar

| Arquivo/pasta | Responsabilidade |
| --- | --- |
| [package.json](../package.json) | Entrada do Router, versões das dependências e scripts |
| [package-lock.json](../package-lock.json) | Registra as versões resolvidas para reproduzir a instalação |
| [app.json](../app.json) | Nome, orientação retrato, scheme, ícones, plugins e mensagem de permissão de movimento |
| [tsconfig.json](../tsconfig.json) | Configuração TypeScript, modo estrito e aliases `@/` e `@/assets/` |
| [eslint.config.js](../eslint.config.js) | Regras de análise do código com a base do Expo |
| [.prettierrc.json](../.prettierrc.json) | Preferências de formatação: dois espaços, aspas duplas, ponto e vírgula e atributos separados |
| [.prettierignore](../.prettierignore) | Pastas/arquivos excluídos da formatação |
| [.gitignore](../.gitignore) | Exclui dependências, caches, builds e arquivos locais do versionamento |
| [.env.example](../.env.example) | Modelo da configuração pública de endereço da API |
| `.env.local` | Configuração de endereço de cada computador, ignorada pelo Git |
| [server/db.json](../server/db.json) | Coleção remota de sessões usada pelo JSON Server |
| [AGENTS.md](../AGENTS.md) | Instruções para ferramentas que colaboram no repositório; não roda dentro do aplicativo |
| [README.md](../README.md) | Execução e links de documentação |
| [LICENSE](../LICENSE) | Informações de licença do projeto |
| [design-qa.md](../design-qa.md) | Registro da conferência visual já realizada |
| [hardware.md](hardware.md), [api.md](api.md), [visual-assets.md](visual-assets.md) | Guias específicos dos subsistemas |
| `.expo`, `expo-env.d.ts`, `dist` | Dados/arquivos gerados por ferramentas e exportações; não concentram regras de negócio |
| `.git`, `.vscode`, `.claude` | Metadados de versionamento/editor/ferramentas; não são telas ou serviços do app |
| `node_modules` | Código instalado das bibliotecas |
| `public` | Recursos públicos web, caso adicionados; não controla a atividade nativa |

`app.json` declara `typedRoutes` e React Compiler como experimentos. A tipagem das rotas ajuda durante o desenvolvimento, mas não substitui a verificação dos parâmetros em execução. `userInterfaceStyle: "automatic"` não implementa por si só dois temas: nossas cores visuais são definidas no tema do código.

Os plugins configuram recursos nativos nos builds; alterar a mensagem do plugin no projeto não altera o texto interno de uma instalação já existente do Expo Go. Não criamos nem editamos manualmente pastas nativas `ios/` e `android/`.

### Dependências por responsabilidade

| Grupo | Pacotes |
| --- | --- |
| Base | `expo`, `react`, `react-native` |
| Navegação e área segura | `expo-router`, `expo-linking`, `react-native-screens`, `react-native-safe-area-context` |
| Estado e persistência | `zustand`, `@react-native-async-storage/async-storage` |
| API | `axios`, `@tanstack/react-query`, `json-server` |
| Hardware | `expo-sensors` |
| Fonte e aparência | `expo-font`, `@expo-google-fonts/nunito`, `@expo/vector-icons`, `expo-linear-gradient` |
| Web | `react-dom`, `react-native-web` |
| Gestos/animação e suporte | `react-native-gesture-handler`, `react-native-reanimated`, `react-native-worklets` |
| Outros módulos presentes na base/configuração | `@expo/ui`, `expo-constants`, `expo-device`, `expo-glass-effect`, `expo-image`, `expo-splash-screen`, `expo-status-bar`, `expo-symbols`, `expo-system-ui`, `expo-web-browser` |
| Ferramentas de desenvolvimento | `typescript`, `@types/react`, `eslint`, `eslint-config-expo` |

Nem todo pacote declarado é importado diretamente por nossas telas. Estudem primeiro os utilizados no fluxo; não confundam ter uma biblioteca instalada com ter implementado uma funcionalidade dela.

### Executar

Levem `package.json`, `package-lock.json`, fontes, imagens e servidor junto com o projeto. Com Node/npm instalados, usem na raiz:

```bash
npm ci
```

Preparem `.env.local` com o endereço correto da API. Depois abram dois terminais:

```bash
# Terminal 1
npm run api
```

```bash
# Terminal 2
npm start
```

`npm run web` abre o ambiente web; `npm run android` e `npm run ios` solicitam abertura na respectiva plataforma a partir do Expo. Esses scripts não são comandos de publicar na loja. A atividade exige celular físico no nosso código.

**Script remanescente:** `reset-project` ainda aponta para `scripts/reset-project.js`, arquivo ausente. Não faz parte do fluxo de execução ou estudo e não deve ser usado para iniciar o app. Este guia não altera essa configuração.

No computador da revisão estavam Node 24.14.0 e npm 11.9.0. O projeto está fixado em Expo 57.0.0; a checagem online anterior recomendou `~57.0.30`. É um aviso conhecido, não corrigido por este guia. Não atualizem dependências na hora da apresentação sem testar.

No laboratório, confiram o IPv4, o acesso à rede e as portas da API/Expo. `localhost` no iPhone não aponta para o computador. Estar na mesma rede não garante que a rede institucional permita comunicação entre aparelhos. O túnel do Expo não publica automaticamente a API local.

## 15. Testes e falhas

### Comandos

```bash
npx expo lint
npx tsc --noEmit
npm run test:hardware
```

Lint procura problemas nas regras de código; TypeScript verifica tipos; os testes executam comportamentos com entradas conhecidas. Nenhum dos três, sozinho, prova a aparência correta no iPhone ou a conexão na rede da faculdade.

### `tests/hardware.test.mjs`

[hardware.test.mjs](../tests/hardware.test.mjs) usa `node:test` e `assert`. Asserções como `assert.equal` fazem o teste falhar se o resultado divergir do esperado. A fixture cria sensores, relógio e intervalos controlados para simular os eventos.

Os 15 cenários cobrem aparelho estável com dois sinais de Z, inclinação/rotação, limites de nota/posição, movimento brusco mesmo com suavização, aceleração próxima de zero, permissão negada, sensor ausente, registro de listener com falha, cancelamento durante permissão, callbacks atrasados, retomada sem duplicar listeners, acelerômetro desatualizado/perda de sinais, recusa do navegador, alteração de relógio, preservação de listeners de outros consumidores e progresso/resultado nas durações aceitas. Alguns testes agrupam mais de uma dessas condições.

### `tests/helpers/loadTs.mjs`

[createTsLoader](../tests/helpers/loadTs.mjs) permite testar arquivos TypeScript sem abrir o Expo. Lê o fonte, usa `typescript.transpileModule` para convertê-lo em JavaScript e executa em um contexto `vm`, fornecendo versões simuladas dos módulos/relógios.

O `Map` desse helper guarda módulos já carregados. `createRequire` resolve bibliotecas do ambiente Node; importações relativas passam pelo carregador. `mocks` substituem sensores e outros módulos nos testes; `globals` substituem relógio e intervalos. Esse helper é infraestrutura de teste e não participa do aplicativo instalado.

### Quem responde a cada falha?

| Situação | Responsável e resposta |
| --- | --- |
| Nome/e-mail inválido | `validateProfile` + tela: mensagem e interrupção do salvamento |
| JSON do perfil malformado ou falha de leitura | Store muda status; layout oferece nova tentativa |
| JSON do histórico malformado, valor que não é lista ou falha de leitura | Store registra erro; `HistoryStatus` oferece nova tentativa |
| Gravação local falha | Store retorna `false`; interface mostra erro e não confirma como salvo |
| Permissão negada/sensor ausente | Serviço remove recursos; hook pausa e mostra mensagem |
| Sensor deixa de emitir | Watchdog detecta; serviço para; hook pausa |
| Troca de app | `AppState` + hook pausam a atividade |
| Rota inválida | Tela de sessão/resultado apresenta alternativa de navegação |
| API indisponível | Axios falha; TanStack Query registra erro; painel mostra mensagem |
| Envio parcial | Nova consulta após tentativa; repetição pula IDs já existentes |

O usuário já confirmou no iOS movimento da esfera, pausa/retomada, segundo plano, penalidade por movimentos e salvamento no histórico. Essa validação não significa testar fisicamente todos os modelos de aparelho nem todos os diálogos de falha. O registro detalhado está em `hardware.md`.

## 16. Critérios da avaliação

Esta tabela relaciona a implementação aos critérios já conferidos do trabalho; não antecipa a nota do professor.

| Critério | Peso | Código para mostrar | Demonstração |
| --- | --- | --- | --- |
| Estrutura e interface | 1,0 | `components`, `theme.ts`, StyleSheet das telas | Mostrar componentes compartilhados e adaptação com rolagem |
| Navegação | 0,5 | Dois layouts, `router`, rotas dinâmicas | Abrir atividade com duração e resultado pelo ID |
| Formulário | 0,5 | `perfil.tsx`, `validators.ts`, `FormField`, `OptionSelector` | Quatro campos e erro imediato após interação |
| Zustand | 1,0 | As duas stores | Salvar preferência e vê-la em outra tela |
| Persistência | 1,0 | Dois arquivos de storage | Fechar/reabrir e recuperar perfil/histórico |
| API | 1,5 | Axios, provider, hook e `SessionSync` | GET, POST, carregamento, erro e invalidação |
| Hardware | 1,5 | Serviço, hook e cálculos | Inclinar/girar, pausar, concluir e salvar |
| Apresentação | 3,0 | Domínio do fluxo por todos | Explicar a proposta e demonstrar no aparelho |

O foco de estudo é conseguir ligar a ação visível ao arquivo responsável. Um integrante pode conduzir cada bloco, mas todos devem conhecer o percurso completo para responder perguntas fora da sua parte.

## 17. Roteiro e perguntas para apresentação

### Demonstração sugerida

1. Explicar que a proposta é uma atividade curta de equilíbrio e movimento controlado usando os sensores como interação central.
2. Abrir Perfil, mostrar os quatro campos e produzir um erro de e-mail; corrigir e salvar.
3. Abrir Atividades e apontar a duração recuperada da preferência global.
4. Iniciar 30 s, mostrar aparelho estável e depois inclinar/girar. Explicar que aceleração orienta a esfera e que a nota também considera rotação e desvio da aceleração.
5. Pausar, esperar e retomar; mostrar que a pausa não consumiu a duração. Concluir e salvar.
6. Mostrar Resultado e Histórico; explicar a gravação no AsyncStorage e os parâmetros da rota.
7. Consultar/enviar pela API; repetir o envio para demonstrar a comparação simples de IDs.
8. Se houver tempo, desligar a API e atualizar: a mensagem de erro aparece e o histórico local continua disponível. Religar e atualizar novamente.

### Perguntas com respostas de referência

**Por que não usar só Zustand?** Porque a store mantém os dados em memória durante o uso. Recuperamos do AsyncStorage para sobreviver ao fechamento do app.

**Por que guardar o rascunho do perfil com useState?** Para editar sem publicar cada tecla como preferência global já salva. Só confirmamos depois de validar e gravar.

**Quem calcula a nota?** `calculateStability` calcula a nota instantânea; `advanceProgress` acumula nota × tempo; `averageStability` calcula a média final.

**A esfera e a pontuação usam a mesma leitura?** Compartilham a origem, mas a esfera usa aceleração suavizada. A pontuação usa aceleração original e rotação.

**Por que precisamos do giroscópio?** Para reduzir a nota quando há rotação rápida, mesmo que o aparelho esteja momentaneamente próximo de deitado.

**Como sabemos que uma sessão terminou?** O progresso aceito atinge a duração em milissegundos; o hook para sensores e cria o registro final.

**Como a pausa funciona?** Remove listeners, preserva progresso e limpa a referência de tempo. Retomar cria nova coleta sem contar o intervalo da pausa.

**Por que a rota recebe só o ID no resultado?** O registro já está na store carregada do armazenamento. O ID indica qual item mostrar, sem duplicar o objeto inteiro nos parâmetros.

**O que a API recebe?** ID, atividade, duração, data, média e tempo na faixa; não recebe perfil nem todas as leituras.

**O que Axios faz e o que TanStack Query faz?** Axios realiza HTTP. TanStack Query gerencia estados, resposta em cache e invalidação da consulta.

**Invalidar cache apaga histórico?** Não. Marca a consulta remota para atualização. Histórico é outro dado, salvo no aparelho.

**Por que onSettled em vez de somente onSuccess?** Porque um envio pode falhar depois de alguns POSTs terem chegado. Atualizar a consulta também no erro reflete esse caso.

**Repetir envio duplica?** No fluxo atual de um aparelho, a função faz GET e pula IDs já presentes. Não implementamos um protocolo completo para concorrência entre vários aparelhos.

**Um minuto de staleTime significa uma consulta a cada minuto?** Não. É o período em que a resposta é considerada recente; não configura polling periódico.

**O histórico vem da API?** A lista principal vem do armazenamento local. O painel mostra separadamente a quantidade remota.

**Por que há dois JSONs/conjuntos de dados?** O AsyncStorage é o armazenamento do aparelho e usa texto JSON por chave. `server/db.json` pertence ao computador que executa a API. Eles só se relacionam quando há envio.

**Quais partes são de bibliotecas?** Expo fornece acesso ao sistema/sensores, Router fornece navegação, Zustand fornece a store, AsyncStorage fornece armazenamento, Axios fornece HTTP, TanStack Query fornece gerenciamento de requisições e JSON Server fornece o servidor. As telas e as regras que ligam esses recursos estão no nosso código.

## 18. Exercícios e conferência de entendimento

### Exercícios em dupla

1. Sem editar o código: salve 45 s no Perfil, vá a Atividades, escolha 30 s e saia/volte. Explique por que a preferência reaparece.
2. Digite um nome válido mas e-mail inválido. Identifique onde a mensagem é criada, onde é exibida e onde o salvamento é interrompido.
3. Encontre as duas chamadas que gravam no AsyncStorage e as ações que as aguardam antes de atualizar a store.
4. Faça uma sessão com a API desligada. Explique por que ainda pode ser salva e onde consultar o registro.
5. Em `advanceProgress`, considere 100 ms com nota 80 e `inRange: true`. Quais acumuladores aumentam e de quanto?
6. Considere 800 ms entre duas leituras. O código atual deve somar esse intervalo? Qual constante participa da decisão?
7. Se o servidor tem A e o aparelho tem A/B/C, quantos POSTs o envio executa? E ao repetir depois do sucesso?
8. Ache o arquivo onde mudaria a cor principal e o arquivo onde mudaria o limite de inclinação. Explique por que são responsabilidades diferentes.
9. Localize a limpeza que impede sensores ativos após sair da tela e a proteção que impede iniciar depois de uma permissão atrasada.
10. Explique, apontando o código, por que concluir uma sessão, salvar no histórico e enviar para API são três momentos diferentes.

### Respostas para conferir depois

1. O seletor é local; ao receber foco, `useFocusEffect` copia novamente a preferência salva de 45 s. Selecionar 30 s ali não grava o Perfil.
2. `validators.ts` cria; `FormField` apresenta quando a tela entrega `error`; `handleSave` interrompe se há erros.
3. `profileStorage.writeProfile` e `sessionStorage.writeSessions`, aguardadas por `saveProfile` e `saveSession`.
4. A gravação usa o aparelho, sem depender do Axios; o Histórico lê a store carregada do AsyncStorage.
5. `elapsedMs` +100; `stableMs` +100; `weightedScore` +8000. Esses valores são acrescidos ao progresso anterior, respeitando o tempo restante.
6. Não. É maior que `maxReadingGapMs: 500`; o intervalo não gera progresso.
7. Dois POSTs, para B/C; depois, zero se os três IDs estiverem no servidor.
8. `theme.ts` para cor e `motion.ts` para sensibilidade do jogo.
9. Limpeza do efeito e `pause` no hook; comparação `attempt !== revision` no serviço.
10. `handleReading` gera resultado; `saveResult`/store gravam; `SessionSync`/mutation enviam.

### Checklist individual

- [ ] Consigo dizer qual pasta procurar para tela, cálculo, sensor, storage e API.
- [ ] Explico `useState`, `useRef`, efeitos e limpeza com um exemplo real do app.
- [ ] Explico a diferença entre rascunho do formulário e perfil salvo.
- [ ] Sigo o caminho inteiro desde Começar até Resultado sem pular o salvamento.
- [ ] Diferencio nota atual, média, tempo na faixa e pontos acumulados.
- [ ] Explico pausa e retorno do segundo plano.
- [ ] Diferencio estado em memória, armazenamento local e servidor.
- [ ] Leio as duas funções de `sessionsApi.ts` e explico cada etapa.
- [ ] Consigo mostrar GET, POST, erro, carregamento, cache e invalidação.
- [ ] Sei quais limitações existem hoje e não apresento extras do protótipo como concluídos.
- [ ] Consigo executar o projeto em outro computador seguindo os comandos.
- [ ] Consigo demonstrar um critério que outro integrante normalmente apresenta.

Ao surgir uma dúvida, registrem o nome do arquivo e a função. Depois percorram as chamadas para trás (quem chamou?) e para frente (quem usa o resultado?). Esse hábito ajuda a entender o projeto sem depender de decorar um discurso.
