import type { SessionRecord } from "../types/session";

// Os resumos visuais são derivados do histórico, sem outro estado para sincronizar.
export function sessionStats(sessions: SessionRecord[]) {
  const points = sessions.reduce(
    (total, session) => total + session.averageStability,
    0,
  );
  const seconds = sessions.reduce(
    (total, session) => total + session.durationSeconds,
    0,
  );
  return {
    count: sessions.length,
    points,
    minutes: Math.round(seconds / 60),
    average: sessions.length ? Math.round(points / sessions.length) : 0,
    best: sessions.reduce(
      (best, session) => Math.max(best, session.averageStability),
      0,
    ),
  };
}
