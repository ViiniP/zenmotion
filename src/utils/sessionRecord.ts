import type { SessionProgress, SessionRecord } from "../types/session";
import { averageStability } from "./sessionProgress";

export function createSessionRecord(
  progresso: SessionProgress,
  duracaoSegundos: number,
): SessionRecord {
  if (progresso.elapsedMs !== duracaoSegundos * 1000) {
    throw new Error("Somente sessões concluídas podem ser registradas.");
  }
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
    activity: "equilibrio-zen",
    durationSeconds: duracaoSegundos,
    completedAt: new Date().toISOString(),
    averageStability: averageStability(progresso),
    stableMs: progresso.stableMs,
  };
}

export function formatSessionDate(completedAt: string) {
  return new Date(completedAt).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatStableTime(stableMs: number) {
  return `${(stableMs / 1000).toFixed(1).replace(".", ",")} s`;
}
