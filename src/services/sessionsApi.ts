import type { SessionRecord } from "../types/session";
import { isSessionRecord, sameSession } from "../utils/sessionRecord";
import { api } from "./api";

export async function getRemoteSessions(signal?: AbortSignal): Promise<SessionRecord[]> {
  const { data } = await api.get<unknown>("/sessions", { signal });
  if (
    !Array.isArray(data) ||
    !data.every(isSessionRecord) ||
    new Set(data.map((session) => session.id)).size !== data.length
  ) {
    throw new Error("O servidor retornou um histórico inválido.");
  }
  return data.sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt));
}

export async function sendSessions(sessions: SessionRecord[]): Promise<number> {
  // Consulta novamente antes do envio. O cache da tela pode estar desatualizado.
  const remoteSessions = await getRemoteSessions();
  const existing = new Map(remoteSessions.map((session) => [session.id, session]));
  let sentCount = 0;

  for (const session of sessions) {
    if (!isSessionRecord(session)) throw new Error("Há uma sessão local inválida.");
    const saved = existing.get(session.id);
    if (saved) {
      if (!sameSession(saved, session)) {
        throw new Error("Uma sessão com este identificador possui dados diferentes no servidor.");
      }
      continue;
    }
    const { data } = await api.post<unknown>("/sessions", session);
    if (!isSessionRecord(data) || !sameSession(data, session)) {
      throw new Error("O servidor não confirmou os dados da sessão enviada.");
    }
    existing.set(data.id, data);
    sentCount++;
  }
  // Os registros locais permanecem no aparelho, mesmo após o envio.
  return sentCount;
}
