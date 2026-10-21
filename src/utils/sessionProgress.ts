import { motionSettings } from "../constants/motion";
import type { SessionProgress, StabilityReading } from "../types/session";

export const INITIAL_PROGRESS: SessionProgress = {
  elapsedMs: 0,
  stableMs: 0,
  weightedScore: 0,
};

export function advanceProgress(
  progresso: SessionProgress,
  leitura: StabilityReading,
  intervaloMs: number,
  duracaoMs: number,
): SessionProgress {
  // Uma lacuna nas leituras não pode gerar tempo ou pontos automaticamente.
  if (
    !Number.isFinite(intervaloMs) ||
    intervaloMs <= 0 ||
    intervaloMs > motionSettings.maxReadingGapMs
  ) {
    return progresso;
  }

  const intervaloAceito = Math.max(
    0,
    Math.min(intervaloMs, duracaoMs - progresso.elapsedMs),
  );
  return {
    elapsedMs: progresso.elapsedMs + intervaloAceito,
    stableMs: progresso.stableMs + (leitura.inRange ? intervaloAceito : 0),
    weightedScore: progresso.weightedScore + leitura.stability * intervaloAceito,
  };
}

export function averageStability(progresso: SessionProgress) {
  return progresso.elapsedMs > 0
    ? Math.round(progresso.weightedScore / progresso.elapsedMs)
    : 0;
}
