import type { SessionRecord } from "../types/session";
import { api } from "./api";

export async function getRemoteSessions(): Promise<SessionRecord[]> {
  const response = await api.get<SessionRecord[]>("/sessions");
  return response.data;
}

export async function sendSessions(sessions: SessionRecord[]): Promise<number> {
  // Busca a lista atual para não depender de uma consulta antiga da tela.
  const remoteSessions = await getRemoteSessions();
  let sentCount = 0;

  for (const session of sessions) {
    const alreadySent = remoteSessions.some(
      (remote) => remote.id === session.id,
    );

    if (!alreadySent) {
      await api.post("/sessions", session);
      sentCount++;
    }
  }

  return sentCount;
}
