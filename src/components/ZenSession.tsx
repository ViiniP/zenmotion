import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, fonts } from "../constants/theme";
import { useZenSession } from "../hooks/useZenSession";
import { useSessionStore } from "../stores/useSessionStore";
import { averageStability } from "../utils/sessionProgress";
import { AppButton } from "./AppButton";
import { IconButton } from "./IconButton";
import { screenContent } from "./Screen";
import { StatRow } from "./StatRow";

type ZenSessionProps = {
  duration: number;
  onExit: () => void;
  onSaved: (id: string) => void;
};

export function ZenSession({ duration, onExit, onSaved }: ZenSessionProps) {
  const session = useZenSession(duration);
  const saveSession = useSessionStore((state) => state.saveSession);
  const isSaving = useSessionStore((state) => state.isSaving);
  const saveError = useSessionStore((state) => state.saveError);
  const [hasTriedSaving, setHasTriedSaving] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  async function saveResult() {
    if (!session.result) return;
    setHasTriedSaving(true);
    const saved = await saveSession(session.result);
    // Voltar pelo botão do sistema durante a gravação não deve abrir outra tela.
    if (saved && mounted.current) onSaved(session.result.id);
  }
  const remaining = Math.max(
    0,
    Math.ceil(duration - session.progress.elapsedMs / 1000),
  );
  const clock = `${Math.floor(remaining / 60)
    .toString()
    .padStart(2, "0")}:${(remaining % 60).toString().padStart(2, "0")}`;
  const average = averageStability(session.progress);
  const finished = session.status === "finished";

  let instruction =
    "Segure o celular deitado, com a tela para cima, e mantenha a esfera no centro.";
  if (session.status === "checking")
    instruction = "Verificando permissão e disponibilidade dos sensores...";
  if (session.status === "running") {
    instruction = !session.reading
      ? "Aguardando leituras dos sensores..."
      : session.reading.inRange
        ? "Na faixa! Mantenha a posição."
        : "Ajuste a inclinação e mova o aparelho devagar.";
  }
  if (session.status === "paused")
    instruction = "Sessão pausada. Retome quando estiver pronto.";
  if (finished) instruction = "Sessão concluída!";

  return (
    <LinearGradient
      colors={["#191630", "#332766", "#78508A"]}
      style={styles.screen}
    >
      <Image
        source={require("../../assets/images/zen-landscape.png")}
        style={styles.landscape}
        accessible={false}
      />
      <SafeAreaView
        style={styles.screen}
        edges={["top", "left", "right", "bottom"]}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <IconButton
              name="close-outline"
              label={finished ? "Sair sem salvar" : "Voltar às atividades"}
              onPress={onExit}
              disabled={isSaving}
            />
            <Text style={styles.title}>Equilíbrio Zen</Text>
            <View style={styles.headerSpace} />
          </View>
          <Text
            accessibilityLiveRegion="polite"
            style={styles.description}
          >
            {instruction}
          </Text>

          <View
            accessible={false}
            style={styles.board}
          >
            <View style={styles.innerRing} />
            <View style={styles.target} />
            <View
              style={[
                styles.sphere,
                session.reading && !session.reading.inRange && styles.outside,
                {
                  transform: [
                    {
                      translateX: (session.reading?.offsetX ?? 0) * 90 - 14,
                    },
                    {
                      translateY: (session.reading?.offsetY ?? 0) * 90 - 14,
                    },
                  ],
                },
              ]}
            >
              <Image
                source={require("../../assets/images/zen-orb.png")}
                style={styles.sphereImage}
                accessible={false}
              />
            </View>
          </View>

          <Text
            accessibilityLabel={`Tempo restante: ${remaining} segundos`}
            style={styles.clock}
          >
            {clock}
          </Text>
          <Text style={styles.duration}>de {duration} segundos</Text>

          <StatRow
            items={[
              {
                value: session.reading ? `${session.reading.stability}%` : "—",
                label: "estabilidade agora",
              },
              {
                value: `${(session.progress.stableMs / 1000).toFixed(1).replace(".", ",")} s`,
                label: "na faixa",
              },
            ]}
          />
          <Text style={styles.average}>
            {finished
              ? `Pontuação: ${average} de 100`
              : `Média: ${session.progress.elapsedMs > 0 ? `${average}%` : "—"}`}
          </Text>

          {session.message && (
            <Text
              accessibilityRole="alert"
              style={styles.error}
            >
              {session.message}
            </Text>
          )}
          {finished && hasTriedSaving && saveError && (
            <Text
              accessibilityRole="alert"
              style={styles.error}
            >
              {saveError}
            </Text>
          )}

          {session.status === "running" ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Pausar"
              onPress={session.pause}
              style={({ pressed }) => [styles.pause, pressed && styles.pressed]}
            >
              <Ionicons
                name="pause"
                size={30}
                color={colors.background}
                accessible={false}
                aria-hidden
              />
            </Pressable>
          ) : finished ? (
            <AppButton
              title={isSaving ? "Salvando..." : "Salvar e ver resultado"}
              onPress={saveResult}
              disabled={isSaving}
            />
          ) : (
            <AppButton
              title={
                session.status === "checking"
                  ? "Verificando..."
                  : session.message
                    ? "Tentar novamente"
                    : session.status === "paused"
                      ? "Retomar"
                      : "Começar"
              }
              onPress={session.start}
              disabled={session.status === "checking"}
            />
          )}
          {session.status === "paused" && (
            <AppButton
              title="Recomeçar"
              variant="secondary"
              onPress={session.reset}
            />
          )}
          {session.status !== "running" && (
            <AppButton
              title={finished ? "Sair sem salvar" : "Voltar às atividades"}
              onPress={onExit}
              disabled={isSaving}
              variant="text"
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    ...screenContent,
    paddingTop: 12,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  headerSpace: {
    width: 48,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 19,
    fontFamily: fonts.heading,
    textAlign: "center",
  },
  description: {
    color: "#D7CFE9",
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    minHeight: 44,
  },
  duration: {
    color: "#C8BDDE",
    fontFamily: fonts.regular,
    fontSize: 15,
    textAlign: "center",
    marginTop: -8,
  },
  landscape: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 220,
    opacity: 0.24,
  },
  innerRing: {
    width: "72%",
    aspectRatio: 1,
    position: "absolute",
    borderWidth: 1,
    borderColor: "#FFFFFF16",
    borderRadius: 999,
  },
  board: {
    width: "100%",
    maxWidth: 220,
    aspectRatio: 1,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#FFFFFF20",
    borderRadius: 130,
    backgroundColor: "#FFFFFF06",
    justifyContent: "center",
    alignItems: "center",
  },
  target: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: "dashed",
  },
  sphere: {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "transparent",
  },
  sphereImage: {
    width: 36,
    height: 36,
    left: -4,
    top: -4,
  },
  outside: {
    backgroundColor: "#FF8C9666",
  },
  clock: {
    color: colors.text,
    fontSize: 56,
    fontFamily: fonts.regular,
    textAlign: "center",
  },
  average: {
    color: "#E2D7EF",
    fontFamily: fonts.medium,
    fontSize: 14,
    textAlign: "center",
  },
  error: {
    color: "#FFBBC2",
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  pause: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primary,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  pressed: {
    opacity: 0.75,
  },
});
