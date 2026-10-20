import type { SessionProgress, SessionRecord } from "../types/session";
import { averageStability } from "./sessionProgress";

export function isSessionRecord(value: unknown): value is SessionRecord {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Partial<SessionRecord>;
  return (
    typeof record.id === "string" &&
    record.id.length > 0 &&
    record.activity === "equilibrio-zen" &&
    (record.durationSeconds === 30 ||
      record.durationSeconds === 45 ||
      record.durationSeconds === 60) &&
    typeof record.completedAt === "string" &&
    Number.isFinite(Date.parse(record.completedAt)) &&
    typeof record.averageStability === "number" &&
    Number.isInteger(record.averageStability) &&
    record.averageStability >= 0 &&
    record.averageStability <= 100 &&
    typeof record.stableMs === "number" &&
    Number.isFinite(record.stableMs) &&
    record.stableMs >= 0 &&
    record.stableMs <= record.durationSeconds * 1000
  );
}

export function createSessionRecord(
  progress: SessionProgress,
  durationSeconds: number,
): SessionRecord {
  if (progress.elapsedMs !== durationSeconds * 1000) {
    throw new Error("Somente sessões concluídas podem ser registradas.");
  }
  const record: SessionRecord = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
    activity: "equilibrio-zen",
    durationSeconds,
    completedAt: new Date().toISOString(),
    averageStability: averageStability(progress),
    stableMs: progress.stableMs,
  };
  if (!isSessionRecord(record))
    throw new Error("Resultado de sessão inválido.");
  return record;
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
