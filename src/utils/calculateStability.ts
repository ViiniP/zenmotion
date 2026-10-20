import { motionSettings } from "../constants/motion";
import type { StabilityReading, Vector3 } from "../types/session";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function calculateStability(
  acceleration: Vector3,
  rotation: Vector3,
  displayAcceleration: Vector3 = acceleration,
): StabilityReading {
  const magnitude = Math.hypot(acceleration.x, acceleration.y, acceleration.z);
  const speed = Math.hypot(rotation.x, rotation.y, rotation.z);

  if (
    !Number.isFinite(magnitude) ||
    !Number.isFinite(speed) ||
    magnitude < 0.1
  ) {
    return {
      stability: 0,
      inRange: false,
      offsetX: 0,
      offsetY: 0,
    };
  }

  // Deitado: X e Y próximos de zero; Z recebe a gravidade (aproximadamente 1 g).
  const tiltDegrees =
    (Math.atan2(
      Math.hypot(acceleration.x, acceleration.y),
      Math.abs(acceleration.z),
    ) *
      180) /
    Math.PI;
  const accelerationChange = Math.abs(magnitude - 1);

  // A pontuação usa as leituras reais; a suavização afeta apenas a esfera.
  const tiltScore = clamp(
    1 - tiltDegrees / motionSettings.maxTiltDegrees,
    0,
    1,
  );
  const rotationScore = clamp(
    1 - speed / motionSettings.maxRotationRadPerSecond,
    0,
    1,
  );
  const accelerationScore = clamp(
    1 - accelerationChange / motionSettings.maxAccelerationChangeG,
    0,
    1,
  );
  const displayMagnitude = Math.hypot(
    displayAcceleration.x,
    displayAcceleration.y,
    displayAcceleration.z,
  );
  const validDisplay =
    Number.isFinite(displayMagnitude) && displayMagnitude >= 0.1;
  const offsetX = validDisplay
    ? (displayAcceleration.x / displayMagnitude) * 2
    : 0;
  const offsetY = validDisplay
    ? (-displayAcceleration.y / displayMagnitude) * 2
    : 0;
  const offsetScale = Math.max(1, Math.hypot(offsetX, offsetY));

  return {
    stability: Math.round(100 * tiltScore * rotationScore * accelerationScore),
    inRange:
      tiltDegrees <= motionSettings.targetTiltDegrees &&
      speed <= motionSettings.targetRotationRadPerSecond &&
      accelerationChange <= motionSettings.targetAccelerationChangeG,
    offsetX: offsetX / offsetScale,
    offsetY: offsetY / offsetScale,
  };
}
