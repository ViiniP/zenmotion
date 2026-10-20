import AsyncStorage from "@react-native-async-storage/async-storage";

import type { SessionRecord } from "../types/session";
import { isSessionRecord } from "../utils/sessionRecord";

const SESSIONS_KEY = "@zenmotion/sessions";

function validateSessions(value: unknown): asserts value is SessionRecord[] {
  if (
    !Array.isArray(value) ||
    !value.every(isSessionRecord) ||
    new Set(value.map((session) => session.id)).size !== value.length
  ) {
    throw new Error("O histórico contém dados inválidos.");
  }
}

export async function readSessions(): Promise<SessionRecord[]> {
  const stored = await AsyncStorage.getItem(SESSIONS_KEY);
  if (stored === null) return [];
  const data: unknown = JSON.parse(stored);
  validateSessions(data);
  return data.sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt));
}

export async function writeSessions(sessions: SessionRecord[]): Promise<void> {
  validateSessions(sessions);
  await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}
