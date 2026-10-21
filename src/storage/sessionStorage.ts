import AsyncStorage from "@react-native-async-storage/async-storage";

import type { SessionRecord } from "../types/session";

const CHAVE_SESSOES = "@zenmotion/sessions";

export async function readSessions(): Promise<SessionRecord[]> {
  const textoSalvo = await AsyncStorage.getItem(CHAVE_SESSOES);
  if (textoSalvo === null) return [];
  const sessoes: SessionRecord[] = JSON.parse(textoSalvo);
  if (!Array.isArray(sessoes)) {
    throw new Error("Não foi possível ler a lista de sessões.");
  }
  return sessoes.sort(
    (a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt),
  );
}

export async function writeSessions(sessoes: SessionRecord[]): Promise<void> {
  await AsyncStorage.setItem(CHAVE_SESSOES, JSON.stringify(sessoes));
}
