import { motionSettings } from "../constants/motion";
import type { SessionProgress, StabilityReading } from "../types/session";

export const INITIAL_PROGRESS: SessionProgress = {
  elapsedMs: 0,
  stableMs: 0,
  weightedScore: 0,
};

export function advanceProgress(
  progress: SessionProgress,
  reading: StabilityReading,
  deltaMs: number,
  durationMs: number,
): SessionProgress {
  // Uma lacuna nas leituras não pode gerar tempo ou pontos automaticamente.
  if (
    !Number.isFinite(deltaMs) ||
    deltaMs <= 0 ||
    deltaMs > motionSettings.maxReadingGapMs
  ) {
    return progress;
  }

  const interval = Math.max(
    0,
    Math.min(deltaMs, durationMs - progress.elapsedMs),
  );
  return {
    elapsedMs: progress.elapsedMs + interval,
    stableMs: progress.stableMs + (reading.inRange ? interval : 0),
    weightedScore: progress.weightedScore + reading.stability * interval,
  };
}

export function averageStability(progress: SessionProgress) {
  return progress.elapsedMs > 0
    ? Math.round(progress.weightedScore / progress.elapsedMs)
    : 0;
}
