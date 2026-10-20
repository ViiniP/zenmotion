# Integração simples com a API

A API atual é fornecida pelo JSON Server. O aplicativo usa Axios para fazer as requisições e TanStack Query para controlar cache, carregamento, sucesso e erro.

## Ordem de estudo

1. `src/services/api.ts`: configura o endereço, o limite de espera e o formato JSON no Axios.
2. `src/services/sessionsApi.ts`: contém as duas operações HTTP.
3. `src/providers/ApiProvider.tsx`: disponibiliza um único cache para as telas.
4. `src/hooks/useSessionApi.ts`: conecta as operações ao TanStack Query.
5. `src/components/SessionSync.tsx`: apresenta os dados, os botões e as mensagens no Histórico.

## Consultar: GET

```ts
export async function getRemoteSessions(): Promise<SessionRecord[]> {
  const response = await api.get<SessionRecord[]>("/sessions");
  return response.data;
}
```

- `async` permite usar `await` dentro da função.
- `await` espera a resposta da requisição sem bloquear a interface.
- `api.get` consulta o endereço base configurado, acrescentando `/sessions`.
- `response.data` é o corpo da resposta: a lista de sessões.
- `SessionRecord[]` descreve essa lista para o TypeScript. Não faz uma validação dos dados em tempo de execução.

## Enviar: POST

A função `sendSessions` recebe a lista salva no celular:

1. Faz GET para obter a lista atual do servidor.
2. Começa o contador `sentCount` em zero.
3. Percorre as sessões locais com `for...of`.
4. Usa `some` para perguntar se já existe um registro remoto com o mesmo ID.
5. Se não existe, faz POST e incrementa o contador.
6. Retorna quantas sessões foram enviadas nessa tentativa.

`some` retorna `true` quando encontra um item que atende à condição. `!alreadySent` significa “ainda não enviada”. `sentCount++` aumenta o contador em um.

Essa verificação básica evita repetir uma sessão em envios sucessivos do aparelho. A função depende de a API manter o ID enviado. Ela não compara o conteúdo de dois registros com o mesmo ID.

Se uma requisição falhar, o Axios lança um erro e a função para. As sessões enviadas anteriormente continuam no servidor. Ao tentar de novo, um novo GET permite pular seus IDs. O histórico do celular não é apagado.

## Cache e atualização

- `useQuery` chama a consulta e guarda a resposta sob a chave `["sessions"]`.
- `useMutation` executa o envio quando o usuário toca no botão.
- `onSettled` executa ao terminar o envio, tanto em sucesso quanto em erro. Invalida a consulta para atualizar a tela, pois parte do envio pode ter sido concluída antes de uma falha.
- `staleTime: 60_000` considera os dados recentes por um minuto. Não apaga o cache ao completar esse tempo.
- `retry: false` evita tentativas automáticas. O usuário pode atualizar ou enviar novamente pelos botões.
- `networkMode: "always"` permite tentar a requisição sem depender de uma indicação prévia de conectividade. Não faz a API funcionar sem rede.
- O cache fica em memória durante o uso do aplicativo. AsyncStorage mantém o histórico local entre aberturas.

Não há integração própria com eventos de retorno do app ao primeiro plano. O usuário pode atualizar a consulta manualmente.

## Estados apresentados na tela

| Código | O que representa |
| --- | --- |
| `remoteQuery.data` | Lista retornada na consulta |
| `remoteQuery.isLoading` | Primeiro carregamento em andamento |
| `remoteQuery.isFetching` | Consulta em andamento, inclusive atualização |
| `remoteQuery.isError` | Falha ao consultar |
| `sendMutation.isPending` | Envio em andamento |
| `sendMutation.isError` | Falha ao enviar |
| `sendMutation.isSuccess` | Envio concluído; o retorno informa a quantidade enviada |

O botão de atualizar chama `refetch()`. O botão de enviar chama `mutate([...sessions])`, passando uma cópia da lista local. Os botões ficam bloqueados durante consulta ou envio.

## O que continua local

O perfil, a atividade, o resultado e o histórico usam as stores e o AsyncStorage. Consultar a API não substitui o histórico local pelo remoto. O aplicativo envia somente os resumos das sessões, não as leituras individuais dos sensores.

## Conferência

1. Iniciar API e app: o Histórico deve mostrar a quantidade no servidor.
2. Salvar uma sessão no celular e enviar: a quantidade remota deve aumentar.
3. Repetir o envio: a sessão com o mesmo ID deve ser pulada.
4. Desligar a API e atualizar: deve aparecer erro, mantendo o histórico local.
5. Religar a API e atualizar: a consulta deve voltar a funcionar.
