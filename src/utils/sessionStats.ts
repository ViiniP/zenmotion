import type { SessionRecord } from "../types/session";

// Os resumos visuais são derivados do histórico, sem outro estado para sincronizar.
export function sessionStats(sessoes: SessionRecord[]) {
  const pontos = sessoes.reduce(
    (total, sessao) => total + sessao.averageStability,
    0,
  );
  const segundos = sessoes.reduce(
    (total, sessao) => total + sessao.durationSeconds,
    0,
  );
  return {
    count: sessoes.length,
    points: pontos,
    minutes: Math.round(segundos / 60),
    average: sessoes.length ? Math.round(pontos / sessoes.length) : 0,
    best: sessoes.reduce(
      (best, sessao) => Math.max(best, sessao.averageStability),
      0,
    ),
  };
}
