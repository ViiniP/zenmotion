import { Accelerometer, Gyroscope } from "expo-sensors";
import { Platform } from "react-native";

import { motionSettings } from "../constants/motion";
import type { StabilityReading, Vector3 } from "../types/session";
import { calculateStability } from "../utils/calculateStability";

function isFiniteVector(vector: Vector3) {
  return [vector.x, vector.y, vector.z].every(Number.isFinite);
}

export function createMotionSensors(
  onReading: (reading: StabilityReading, timestamp: number) => void,
  onError: (message: string) => void,
) {
  let revision = 0;
  let subscriptions: {
    remove: () => void;
  }[] = [];
  let watchdog: ReturnType<typeof setInterval> | null = null;

  function stop() {
    // Invalida também uma solicitação de permissão que ainda está pendente.
    revision += 1;
    subscriptions.forEach((subscription) => subscription.remove());
    subscriptions = [];
    if (watchdog !== null) {
      clearInterval(watchdog);
      watchdog = null;
    }
  }

  function fail(message: string) {
    stop();
    onError(message);
  }

  async function start() {
    stop();
    const attempt = revision;

    // As unidades dos sensores na implementação web diferem das APIs nativas.
    if (Platform.OS === "web") {
      fail(
        "Esta atividade precisa dos sensores do celular. Abra o projeto no Expo Go em um aparelho físico.",
      );
      return false;
    }

    try {
      // Solicita acesso antes das leituras, quando a plataforma exige permissão.
      const permissions = await Promise.all([
        Accelerometer.requestPermissionsAsync(),
        Gyroscope.requestPermissionsAsync(),
      ]);
      if (attempt !== revision) return false;
      if (permissions.some((permission) => !permission.granted)) {
        fail(
          "Acesso ao movimento negado. Verifique a permissão nas configurações e tente novamente.",
        );
        return false;
      }

      const available = await Promise.all([
        Accelerometer.isAvailableAsync(),
        Gyroscope.isAvailableAsync(),
      ]);
      if (attempt !== revision) return false;
      if (available.some((value) => !value)) {
        fail(
          "Acelerômetro ou giroscópio indisponível. Use um celular com os dois sensores.",
        );
        return false;
      }

      Accelerometer.setUpdateInterval(motionSettings.sampleIntervalMs);
      Gyroscope.setUpdateInterval(motionSettings.sampleIntervalMs);
      let rawAcceleration: Vector3 | null = null;
      let acceleration: Vector3 | null = null;
      let accelerationAt = 0;
      // Tempo decorrido não depende de ajustes no relógio do celular.
      let lastReadingAt = performance.now();

      subscriptions.push(
        Accelerometer.addListener((value) => {
          if (attempt !== revision || !isFiniteVector(value)) return;
          rawAcceleration = {
            x: value.x,
            y: value.y,
            z: value.z,
          };
          const factor = motionSettings.smoothingFactor;

          // Suaviza pequenas oscilações do acelerômetro para posicionar a esfera.
          acceleration =
            acceleration === null
              ? rawAcceleration
              : {
                  x: acceleration.x * (1 - factor) + value.x * factor,
                  y: acceleration.y * (1 - factor) + value.y * factor,
                  z: acceleration.z * (1 - factor) + value.z * factor,
                };
          accelerationAt = performance.now();
        }),
      );

      subscriptions.push(
        Gyroscope.addListener((rotation) => {
          const now = performance.now();
          if (
            attempt !== revision ||
            !acceleration ||
            !rawAcceleration ||
            !isFiniteVector(rotation)
          )
            return;
          if (now - accelerationAt > motionSettings.maxReadingGapMs) return;

          lastReadingAt = now;
          onReading(
            calculateStability(rawAcceleration, rotation, acceleration),
            now,
          );
        }),
      );

      watchdog = setInterval(() => {
        if (
          attempt === revision &&
          performance.now() - lastReadingAt > motionSettings.sensorTimeoutMs
        ) {
          fail(
            "Os sensores pararam de enviar leituras. A sessão foi pausada; tente novamente.",
          );
        }
      }, motionSettings.watchdogIntervalMs);
      return true;
    } catch {
      if (attempt === revision) {
        fail(
          "Não foi possível iniciar os sensores. Verifique o aparelho e tente novamente.",
        );
      }
      return false;
    }
  }

  return {
    start,
    stop,
  };
}
