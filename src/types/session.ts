export type Vector3 = { x: number; y: number; z: number };

export type StabilityReading = {
  stability: number;
  inRange: boolean;
  offsetX: number;
  offsetY: number;
};

export type SessionStatus =
  | "ready"
  | "checking"
  | "running"
  | "paused"
  | "finished";

export type SessionProgress = {
  elapsedMs: number;
  stableMs: number;
  weightedScore: number;
};

// Guardamos apenas o resumo final, sem salvar cada leitura dos sensores.
export type SessionRecord = {
  id: string;
  activity: "equilibrio-zen";
  durationSeconds: number;
  completedAt: string;
  averageStability: number;
  stableMs: number;
};
