# ZenMotion

Aplicativo de Mobile II com Expo SDK 57, sensores de movimento e histórico local.

## Executar o app e a API local

Depois de instalar as dependências com `npm install`, abra dois terminais na pasta do projeto:

```bash
# Terminal 1: API de desenvolvimento
npm run api

# Terminal 2: aplicativo
npm start
```

O JSON Server usa `server/db.json` como armazenamento persistente e expõe `GET /sessions` e `POST /sessions` na porta 3001. Os registros permanecem nesse arquivo após reiniciar a API.

Para testar pelo navegador no mesmo computador, o endereço padrão é `http://localhost:3001`.

Para testar em um celular físico:

1. Copie `.env.example` para `.env.local`.
2. Use `ipconfig` para localizar o IPv4 do computador na rede Wi-Fi.
3. Configure `EXPO_PUBLIC_API_URL=http://IP_DO_COMPUTADOR:3001` no arquivo. `localhost` no celular aponta para o próprio celular.
4. Mantenha celular e computador na mesma rede, com a porta 3001 acessível. Recarregue o aplicativo após alterar a variável.

No emulador Android padrão, o endereço do computador é `http://10.0.2.2:3001`.

Essa API local serve para desenvolvimento e demonstração em rede local. Não possui contas de usuário nem fica disponível pela internet por iniciar um túnel do Expo.

## Consultas e envio

- `src/services/api.ts`: instância do Axios, endereço e tempo limite.
- `src/services/sessionsApi.ts`: GET e POST, validação das respostas e comparação de IDs para evitar reenvio de sessões já recebidas.
- `src/providers/ApiProvider.tsx`: cache do TanStack Query compartilhado entre as telas, com consultas consideradas recentes por 60 segundos.
- `src/hooks/useSessionApi.ts`: `useQuery`, `useMutation` e invalidação da consulta após cada tentativa de envio, inclusive se só parte do lote tiver sido enviada.
- `src/components/SessionSync.tsx`: consulta, envio manual e mensagens de carregamento, sucesso e erro no Histórico.

O histórico do aparelho continua no AsyncStorage. A API e o cache em memória não substituem esse armazenamento. A falha de rede não apaga as sessões locais. Ao repetir o envio, uma nova consulta verifica quais IDs já chegaram ao servidor.

## Conferência desta etapa

A revisão e o roteiro de teste dos sensores estão em [docs/hardware.md](docs/hardware.md). Para executar os testes de hardware simulados, use `npm run test:hardware`.

A organização do visual e a origem das imagens estão em [docs/visual-assets.md](docs/visual-assets.md). A conferência das telas está em [design-qa.md](design-qa.md).

1. Inicie API e app e abra Histórico: confira a consulta ao servidor.
2. Conclua e salve uma sessão real no celular.
3. No Histórico, toque em **Enviar sessões salvas**. Confira a mensagem de envio e a nova consulta, que deve mostrar o registro no servidor.
4. Repita o envio: não deve criar outra cópia da mesma sessão.
5. Pare a API e atualize a consulta: o app deve mostrar erro e manter o histórico local disponível.
6. Salve uma sessão com a API desligada, reinicie o app e confirme que ela continua no histórico. Reinicie a API e faça o envio manual.

Validação do código:

```bash
npx expo lint
npx tsc --noEmit
```
