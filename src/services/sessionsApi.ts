import type { SessionRecord } from "../types/session";
import { api } from "./api";

export async function getRemoteSessions(): Promise<SessionRecord[]> {
  const resposta = await api.get<SessionRecord[]>("/sessions");
  return resposta.data;
}

export async function sendSessions(sessoes: SessionRecord[]): Promise<number> {
  // Busca a lista atual para não depender de uma consulta antiga da tela.
  const sessoesServidor = await getRemoteSessions();
  let quantidadeEnviada = 0;

  for (const sessao of sessoes) {
    const jaEnviada = sessoesServidor.some(
      (sessaoServidor) => sessaoServidor.id === sessao.id,
    );

    if (!jaEnviada) {
      await api.post("/sessions", sessao);
      quantidadeEnviada++;
    }
  }

  return quantidadeEnviada;
}
