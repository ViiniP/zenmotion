import assert from "node:assert/strict";
import test from "node:test";

import { createTsLoader } from "./helpers/loadTs.mjs";

const load = createTsLoader();
const { calculateStability } = load("src/utils/calculateStability.ts");
const { advanceProgress, INITIAL_PROGRESS, averageStability } = load("src/utils/sessionProgress.ts");
const { createSessionRecord } = load("src/utils/sessionRecord.ts");
const flat = { x: 0, y: 0, z: 1 };
const still = { x: 0, y: 0, z: 0 };

function sensorFixture(platform = "ios") {
  const readings = [], errors = [], timers = new Set();
  const clock = { now: 1000, wallOffset: 0 };
  function mockSensor() {
    const listeners = new Set();
    return {
      available: true, granted: true, interval: null, listeners,
      async requestPermissionsAsync() { return { granted: this.granted }; },
      async isAvailableAsync() { return this.available; },
      setUpdateInterval(ms) { this.interval = ms; },
      addListener(callback) {
        listeners.add(callback);
        return { remove: () => listeners.delete(callback) };
      },
      emit(value) { for (const listener of [...listeners]) listener(value); },
    };
  }
  const accelerometer = mockSensor(), gyroscope = mockSensor();
  const fixtureLoad = createTsLoader({
    "expo-sensors": { Accelerometer: accelerometer, Gyroscope: gyroscope },
    "react-native": { Platform: { OS: platform } },
  }, {
    Date: { now: () => clock.now + clock.wallOffset },
    performance: { now: () => clock.now },
    setInterval: (callback) => { timers.add(callback); return callback; },
    clearInterval: (callback) => timers.delete(callback),
  });
  const { createMotionSensors } = fixtureLoad("src/services/motionSensors.ts");
  const sensors = createMotionSensors((reading, at) => readings.push({ reading, at }), (error) => errors.push(error));
  return {
    accelerometer, gyroscope, readings, errors, timers, sensors, clock,
    tick(ms) { clock.now += ms; for (const timer of [...timers]) timer(); },
    emit(acceleration = flat, rotation = still) {
      accelerometer.emit(acceleration);
      gyroscope.emit(rotation);
    },
  };
}

test("aparelho deitado fica estável com os dois sinais de gravidade", () => {
  for (const z of [-1, 1]) {
    const reading = calculateStability({ x: 0, y: 0, z }, still);
    assert.equal(reading.stability, 100);
    assert.equal(reading.inRange, true);
  }
});

test("inclinação e rotação retiram o aparelho da faixa", () => {
  assert.equal(calculateStability({ x: 0.5, y: 0, z: Math.sqrt(0.75) }, still).inRange, false);
  assert.equal(calculateStability(flat, { x: 0, y: 0, z: 1 }).inRange, false);
  assert.equal(calculateStability(flat, { x: 0, y: 0, z: 1.5 }).stability, 0);
});

test("pontuação e posição da esfera permanecem limitadas", () => {
  for (let x = -2; x <= 2; x += 0.25) {
    for (let y = -2; y <= 2; y += 0.25) {
      const reading = calculateStability({ x, y, z: 1 }, still);
      assert.ok(reading.stability >= 0 && reading.stability <= 100);
      assert.ok(Math.hypot(reading.offsetX, reading.offsetY) <= 1 + 1e-12);
    }
  }
  assert.equal(calculateStability({ x: NaN, y: 0, z: 1 }, still).inRange, false);
  assert.equal(calculateStability(still, still).stability, 0);
});

test("suavização da esfera não esconde um movimento brusco na pontuação", async () => {
  const f = sensorFixture();
  await f.sensors.start();
  f.emit();
  f.tick(100);
  f.emit({ x: 0, y: 0, z: 1.6 });
  assert.equal(f.readings.at(-1).reading.inRange, false);
  assert.equal(f.readings.at(-1).reading.stability, 0);
  f.sensors.stop();
});

test("aceleração próxima de zero não reutiliza uma leitura estável anterior", async () => {
  const f = sensorFixture();
  await f.sensors.start();
  f.emit(); f.tick(100); f.emit(still);
  assert.equal(f.readings.at(-1).reading.inRange, false);
  assert.equal(f.readings.at(-1).reading.stability, 0);
  f.sensors.stop();
});

test("permissão negada e sensor ausente impedem a coleta", async () => {
  for (const failure of ["permission", "availability"]) {
    const f = sensorFixture();
    if (failure === "permission") f.accelerometer.granted = false;
    else f.gyroscope.available = false;
    assert.equal(await f.sensors.start(), false);
    assert.equal(f.errors.length, 1);
    assert.equal(f.accelerometer.listeners.size + f.gyroscope.listeners.size, 0);
    assert.equal(f.timers.size, 0);
  }
});

test("falha de registro remove o listener que já tinha sido criado", async () => {
  const f = sensorFixture();
  f.gyroscope.addListener = () => { throw new Error("sensor failure"); };
  assert.equal(await f.sensors.start(), false);
  assert.equal(f.accelerometer.listeners.size, 0);
  assert.equal(f.timers.size, 0);
});

test("parar durante a permissão cancela o início pendente", async () => {
  const f = sensorFixture();
  let grant;
  f.accelerometer.requestPermissionsAsync = () => new Promise((resolve) => { grant = resolve; });
  const starting = f.sensors.start();
  f.sensors.stop();
  grant({ granted: true });
  assert.equal(await starting, false);
  assert.equal(f.accelerometer.listeners.size + f.gyroscope.listeners.size, 0);
});

test("parada descarta callbacks atrasados e retomada cria somente dois listeners", async () => {
  const f = sensorFixture();
  await f.sensors.start(); f.emit();
  assert.equal(f.accelerometer.interval, 100);
  assert.equal(f.gyroscope.interval, 100);
  const queuedGyro = [...f.gyroscope.listeners][0];
  const count = f.readings.length;
  f.sensors.stop();
  queuedGyro(still);
  assert.equal(f.readings.length, count);
  assert.equal(f.timers.size, 0);
  await f.sensors.start();
  assert.equal(f.accelerometer.listeners.size, 1);
  assert.equal(f.gyroscope.listeners.size, 1);
  f.sensors.stop();
});

test("não pontua com acelerômetro desatualizado e pausa após perda das leituras", async () => {
  const f = sensorFixture();
  await f.sensors.start(); f.emit();
  const count = f.readings.length;
  f.tick(600); f.gyroscope.emit(still);
  assert.equal(f.readings.length, count);
  f.tick(1000);
  assert.equal(f.errors.length, 1);
  assert.equal(f.accelerometer.listeners.size + f.gyroscope.listeners.size, 0);
  assert.equal(f.timers.size, 0);
});

test("navegador não simula sensores de um celular", async () => {
  const f = sensorFixture("web");
  assert.equal(await f.sensors.start(), false);
  assert.match(f.errors[0], /aparelho físico/);
});

test("ajuste do relógio do aparelho não altera o tempo das leituras", async () => {
  const f = sensorFixture();
  await f.sensors.start(); f.emit();
  f.clock.wallOffset = 3_600_000;
  f.tick(100); f.emit();
  assert.equal(f.errors.length, 0);
  assert.equal(f.readings[1].at - f.readings[0].at, 100);
  f.sensors.stop();
});

test("parar a sessão preserva listeners pertencentes a outros consumidores", async () => {
  const f = sensorFixture();
  const external = f.accelerometer.addListener(() => {});
  await f.sensors.start(); f.sensors.stop();
  assert.equal(f.accelerometer.listeners.size, 1);
  assert.equal(f.gyroscope.listeners.size, 0);
  external.remove();
});

test("sessão termina na duração escolhida e gera um resultado válido", () => {
  for (const seconds of [30, 45, 60]) {
    let progress = { ...INITIAL_PROGRESS };
    const reading = { stability: 87, inRange: true };
    for (let elapsed = 0; elapsed < seconds * 1000 + 100; elapsed += 100) {
      progress = advanceProgress(progress, reading, 100, seconds * 1000);
    }
    assert.equal(progress.elapsedMs, seconds * 1000);
    assert.equal(progress.stableMs, seconds * 1000);
    assert.equal(averageStability(progress), 87);
    assert.equal(createSessionRecord(progress, seconds).averageStability, 87);
  }
});

test("lacunas, tempo negativo e tempo sem leitura não geram pontos", () => {
  const progress = { elapsedMs: 1000, stableMs: 500, weightedScore: 75000 };
  for (const delta of [0, -100, 501, 5000, NaN]) {
    assert.equal(advanceProgress(progress, { stability: 100, inRange: true }, delta, 30000), progress);
  }
  const next = advanceProgress(progress, { stability: 0, inRange: false }, 100, 30000);
  assert.equal(next.elapsedMs, 1100);
  assert.equal(next.stableMs, 500);
  assert.equal(next.weightedScore, 75000);
});
