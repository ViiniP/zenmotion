# Hardware do Equilíbrio Zen

O acelerômetro fornece aceleração em g nos eixos X, Y e Z. Deitado e parado, o módulo do vetor fica próximo de 1 g. A inclinação é estimada pela relação entre X/Y e Z. O giroscópio fornece a velocidade de rotação em radianos por segundo e identifica mudanças de orientação rápidas.

## Como o código funciona

1. `src/services/motionSensors.ts` solicita permissão quando aplicável e verifica se os dois sensores estão disponíveis antes de registrar os listeners. Cada sensor é solicitado a cada 100 ms, aproximadamente 10 leituras por segundo.
2. A aceleração original é usada na pontuação. Uma cópia suavizada é usada na posição da esfera. Assim, o movimento da esfera fica suave e movimentos bruscos continuam prejudicando a nota imediatamente.
3. `src/utils/calculateStability.ts` combina inclinação, rotação e desvio da aceleração em relação a 1 g em uma nota entre 0 e 100. Os limites são parâmetros do jogo e ficam em `src/constants/motion.ts`.
4. `src/utils/sessionProgress.ts` acumula tempo com leituras válidas e calcula a média ponderada pelo tempo. Lacunas maiores que 500 ms não geram pontos nem tempo de atividade.
5. `src/hooks/useZenSession.ts` controla início, pausa, retomada, reinício e conclusão. A pausa remove os listeners e descarta a referência de tempo anterior, para não contar a pausa ao retomar. Sair da tela ou colocar o app em segundo plano também pausa a atividade.
6. O serviço verifica a chegada de dados. Se não houver um par de leituras recentes por mais de 1,5 segundo, interrompe a coleta e informa o erro. O relógio usado para intervalos é `performance.now()`, que mede tempo decorrido. A data do resultado continua sendo a data real da conclusão.

Os testes simulam os sensores e as falhas. Não substituem a conferência em um aparelho físico.

## Validação confirmada no iOS em 20/10/2026

Após os ajustes, o usuário confirmou no seu aparelho:

- A esfera responde aos movimentos.
- Pausar por 5 segundos e retomar mantém o cronômetro no ponto anterior.
- Trocar de app e voltar deixa a atividade pausada.
- Inclinações e movimentos rápidos reduzem a estabilidade.
- A sessão de 30 segundos conclui e pode ser salva, com o resultado disponível no histórico.

Esses passos encerram a validação física do fluxo principal do Equilíbrio Zen nesta etapa. Permissão negada, ausência de sensor e falhas de leitura foram cobertas por simulação. As durações de 45 e 60 segundos também foram cobertas nos testes automatizados.

## Rodada de conferência no iOS

Use Equilíbrio Zen com duração de 30 segundos. A API não é necessária para realizar a atividade e salvar o resultado no aparelho.

| Ação | Comportamento esperado |
| --- | --- |
| Começar com a tela para cima e o aparelho apoiado em superfície plana | Esfera próxima do centro e estabilidade alta. Pequenas oscilações são normais. |
| Inclinar para os lados e para frente/trás | A esfera acompanha a inclinação; fora do limite, a estabilidade cai e o tempo na faixa deixa de aumentar. |
| Girar ou movimentar o aparelho rapidamente, segurando-o normalmente | A estabilidade diminui, mesmo que a esfera ainda esteja perto do centro durante a suavização. |
| Pausar, esperar 5 segundos e retomar | Cronômetro e métricas ficam congelados durante a pausa. A sessão continua do ponto anterior. |
| Voltar à tela anterior e abrir a atividade novamente | A nova sessão começa zerada, sem leituras ou tempo da sessão anterior. |
| Trocar de app ou bloquear a tela durante a atividade | Ao voltar, a sessão está pausada. A retomada exige tocar em Retomar. |
| Recomeçar durante a pausa | Tempo, pontuação e tempo na faixa voltam ao início. |
| Completar os 30 segundos de atividade | A coleta termina, o cronômetro zera e aparece Salvar e ver resultado. As métricas finais não continuam mudando. |
| Salvar, consultar o resultado e reabrir o app | A mesma sessão aparece no histórico com os valores finais. |

Se algo divergir, registre a ação, o comportamento observado e a estabilidade aproximada mostrada na tela. Ajustes de sensibilidade devem usar esse resultado do aparelho real.

## Testes automatizados

```bash
npm run test:hardware
npx expo lint
npx tsc --noEmit
```

Os testes cobrem cálculo, limites de posição e nota, movimentos bruscos, permissão negada, sensor ausente, falha no registro de listeners, cancelamento do início, remoção e retomada de listeners, perda de leituras, mudanças no relógio e durações de 30, 45 e 60 segundos. A confirmação física registrada acima complementa esses testes.

Referências: [acelerômetro no Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/accelerometer/), [giroscópio no Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/gyroscope/) e [AppState no React Native 0.86](https://reactnative.dev/docs/0.86/appstate).
