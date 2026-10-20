// Limites do Equilíbrio Zen. Ajustes de sensibilidade ficam concentrados aqui.
export const motionSettings = {
  sampleIntervalMs: 100,
  smoothingFactor: 0.25,
  maxReadingGapMs: 500,
  sensorTimeoutMs: 1500,
  watchdogIntervalMs: 250,
  targetTiltDegrees: 12,
  maxTiltDegrees: 30,
  targetRotationRadPerSecond: 0.35,
  maxRotationRadPerSecond: 1.5,
  targetAccelerationChangeG: 0.2,
  maxAccelerationChangeG: 0.5,
};
