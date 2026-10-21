import { motionSettings } from "../constants/motion";
import type { StabilityReading, Vector3 } from "../types/session";

function limitar(valor: number, minimo: number, maximo: number) {
  return Math.max(minimo, Math.min(maximo, valor));
}

export function calculateStability(
  aceleracao: Vector3,
  rotacao: Vector3,
  aceleracaoVisual: Vector3 = aceleracao,
): StabilityReading {
  const intensidadeAceleracao = Math.hypot(
    aceleracao.x,
    aceleracao.y,
    aceleracao.z,
  );
  const velocidadeRotacao = Math.hypot(rotacao.x, rotacao.y, rotacao.z);

  if (
    !Number.isFinite(intensidadeAceleracao) ||
    !Number.isFinite(velocidadeRotacao) ||
    intensidadeAceleracao < 0.1
  ) {
    return {
      stability: 0,
      inRange: false,
      offsetX: 0,
      offsetY: 0,
    };
  }

  // Deitado: X e Y próximos de zero; Z recebe a gravidade (aproximadamente 1 g).
  const inclinacaoGraus =
    (Math.atan2(
      Math.hypot(aceleracao.x, aceleracao.y),
      Math.abs(aceleracao.z),
    ) *
      180) /
    Math.PI;
  const variacaoAceleracao = Math.abs(intensidadeAceleracao - 1);

  // A pontuação usa as leituras reais; a suavização afeta apenas a esfera.
  const fatorInclinacao = limitar(
    1 - inclinacaoGraus / motionSettings.maxTiltDegrees,
    0,
    1,
  );
  const fatorRotacao = limitar(
    1 - velocidadeRotacao / motionSettings.maxRotationRadPerSecond,
    0,
    1,
  );
  const fatorAceleracao = limitar(
    1 - variacaoAceleracao / motionSettings.maxAccelerationChangeG,
    0,
    1,
  );
  const intensidadeVisual = Math.hypot(
    aceleracaoVisual.x,
    aceleracaoVisual.y,
    aceleracaoVisual.z,
  );
  const posicaoValida =
    Number.isFinite(intensidadeVisual) && intensidadeVisual >= 0.1;
  const offsetX = posicaoValida
    ? (aceleracaoVisual.x / intensidadeVisual) * 2
    : 0;
  const offsetY = posicaoValida
    ? (-aceleracaoVisual.y / intensidadeVisual) * 2
    : 0;
  const escalaDeslocamento = Math.max(1, Math.hypot(offsetX, offsetY));

  return {
    stability: Math.round(100 * fatorInclinacao * fatorRotacao * fatorAceleracao),
    inRange:
      inclinacaoGraus <= motionSettings.targetTiltDegrees &&
      velocidadeRotacao <= motionSettings.targetRotationRadPerSecond &&
      variacaoAceleracao <= motionSettings.targetAccelerationChangeG,
    offsetX: offsetX / escalaDeslocamento,
    offsetY: offsetY / escalaDeslocamento,
  };
}
