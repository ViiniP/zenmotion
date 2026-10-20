import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

import { createMotionSensors } from "../services/motionSensors";
import type {
  SessionRecord,
  SessionStatus,
  StabilityReading,
} from "../types/session";
import { advanceProgress, INITIAL_PROGRESS } from "../utils/sessionProgress";
import { createSessionRecord } from "../utils/sessionRecord";

export function useZenSession(durationSeconds: number) {
  const [status, setStatus] = useState<SessionStatus>("ready");
  const [reading, setReading] = useState<StabilityReading | null>(null);
  const [progress, setProgress] = useState({
    ...INITIAL_PROGRESS,
  });
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<SessionRecord | null>(null);

  // Refs mantêm os acumuladores disponíveis nos callbacks dos sensores.
  const statusRef = useRef<SessionStatus>("ready");
  const progressRef = useRef({
    ...INITIAL_PROGRESS,
  });
  const lastReadingAt = useRef<number | null>(null);
  const sensorsRef = useRef<ReturnType<typeof createMotionSensors> | null>(
    null,
  );

  const changeStatus = useCallback((next: SessionStatus) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  const handleReading = useCallback(
    (value: StabilityReading, timestamp: number) => {
      if (statusRef.current !== "running") return;
      setReading(value);
      const previous = lastReadingAt.current;
      lastReadingAt.current = timestamp;
      if (previous === null) return;

      const next = advanceProgress(
        progressRef.current,
        value,
        timestamp - previous,
        durationSeconds * 1000,
      );
      progressRef.current = next;
      setProgress(next);
      if (next.elapsedMs >= durationSeconds * 1000) {
        sensorsRef.current?.stop();
        // O mesmo registro é reutilizado se a gravação precisar ser repetida.
        setResult(createSessionRecord(next, durationSeconds));
        changeStatus("finished");
      }
    },
    [changeStatus, durationSeconds],
  );

  const handleError = useCallback(
    (error: string) => {
      lastReadingAt.current = null;
      setMessage(error);
      changeStatus("paused");
    },
    [changeStatus],
  );

  const pause = useCallback(() => {
    if (statusRef.current !== "running" && statusRef.current !== "checking")
      return;
    sensorsRef.current?.stop();
    lastReadingAt.current = null;
    changeStatus("paused");
  }, [changeStatus]);

  useEffect(() => {
    const sensors = createMotionSensors(handleReading, handleError);
    sensorsRef.current = sensors;
    const appState = AppState.addEventListener("change", (next) => {
      // O diálogo de permissão pode deixar o iOS inativo enquanto verificamos.
      if (
        next === "background" ||
        (next === "inactive" && statusRef.current === "running")
      ) {
        pause();
      }
    });
    return () => {
      sensors.stop();
      appState.remove();
      sensorsRef.current = null;
      statusRef.current = "paused";
    };
  }, [handleError, handleReading, pause]);

  useFocusEffect(useCallback(() => () => pause(), [pause]));

  const start = useCallback(async () => {
    const currentStatus = statusRef.current;
    if (
      currentStatus === "running" ||
      currentStatus === "checking" ||
      currentStatus === "finished"
    )
      return;
    const sensors = sensorsRef.current;
    if (!sensors) return;
    setMessage(null);
    setReading(null);
    lastReadingAt.current = null;
    changeStatus("checking");
    const started = await sensors.start();
    if (statusRef.current !== "checking") return;
    if (started) changeStatus("running");
  }, [changeStatus]);

  const reset = useCallback(() => {
    sensorsRef.current?.stop();
    progressRef.current = {
      ...INITIAL_PROGRESS,
    };
    lastReadingAt.current = null;
    setProgress({
      ...INITIAL_PROGRESS,
    });
    setReading(null);
    setMessage(null);
    changeStatus("ready");
    setResult(null);
  }, [changeStatus]);

  return {
    status,
    reading,
    progress,
    message,
    result,
    start,
    pause,
    reset,
  };
}
