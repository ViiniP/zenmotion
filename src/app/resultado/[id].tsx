import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { AppButton } from "../../components/AppButton";
import { HistoryStatus } from "../../components/HistoryStatus";
import { IconButton } from "../../components/IconButton";
import { LandscapeHeader } from "../../components/LandscapeHeader";
import { Screen } from "../../components/Screen";
import { colors, fonts } from "../../constants/theme";
import { useSessionStore } from "../../stores/useSessionStore";
import { formatSessionDate, formatStableTime } from "../../utils/sessionRecord";

export default function ResultScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();
  const loadStatus = useSessionStore((state) => state.loadStatus);
  const insets = useSafeAreaInsets();
  // A rota transporta só o ID; os dados vêm do histórico salvo no Zustand.
  const session = useSessionStore((state) =>
    state.sessions.find((item) => item.id === id),
  );

  if (loadStatus !== "ready") return <HistoryStatus />;

  if (!session) {
    return (
      <Screen edges={["top", "left", "right", "bottom"]}>
        <Text style={styles.title}>Resultado não encontrado</Text>
        <Text style={styles.description}>
          Esta sessão não está no histórico deste aparelho.
        </Text>
        <AppButton
          title="Ir para o histórico"
          onPress={() => router.navigate("/(tabs)/historico")}
        />
      </Screen>
    );
  }

  return (
    <SafeAreaView
      edges={["left", "right", "bottom"]}
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={styles.page}
        showsVerticalScrollIndicator={false}
      >
        <LandscapeHeader>
          <View
            style={[
              styles.close,
              {
                top: Math.max(insets.top + 8, 16),
              },
            ]}
          >
            <IconButton
              name="close-outline"
              label="Fechar resultado"
              onPress={() => router.navigate("/(tabs)/historico")}
            />
          </View>
          <View
            style={[
              styles.scoreCard,
              {
                marginTop: Math.max(insets.top + 30, 60),
              },
            ]}
          >
            <Text style={styles.score}>{session.averageStability}</Text>
            <Text style={styles.scoreLabel}>pontos de 100</Text>
          </View>
        </LandscapeHeader>
        <View style={styles.container}>
          <Text style={styles.title}>
            {session.averageStability >= 80
              ? "Muito estável"
              : session.averageStability >= 60
                ? "Bom equilíbrio"
                : "Um passo de cada vez"}
          </Text>
          <Text style={styles.subtitle}>
            Equilíbrio Zen · {session.durationSeconds} s
          </Text>
          <View style={styles.metrics}>
            <View style={styles.metricRow}>
              <Text style={styles.metric}>Estabilidade média</Text>
              <Text style={styles.value}>{session.averageStability}%</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metric}>Tempo na faixa</Text>
              <Text style={styles.value}>
                {formatStableTime(session.stableMs)}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={colors.success}
                accessible={false}
                aria-hidden
              />
              <Text style={styles.saved}>Salvo no aparelho</Text>
            </View>
          </View>
          <AppButton
            title="Concluir"
            onPress={() => router.navigate("/(tabs)/historico")}
          />
          <AppButton
            title="Repetir atividade"
            variant="secondary"
            onPress={() =>
              router.replace({
                pathname: "/sessao/[atividade]",
                params: {
                  atividade: session.activity,
                  duracao: String(session.durationSeconds),
                },
              })
            }
          />
          <Text style={styles.date}>
            {formatSessionDate(session.completedAt)}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  page: {
    paddingBottom: 20,
  },
  container: {
    padding: 20,
    gap: 14,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontFamily: fonts.heading,
    textAlign: "center",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 17,
    fontFamily: fonts.regular,
    textAlign: "center",
    marginBottom: 10,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 16,
    fontFamily: fonts.regular,
    lineHeight: 24,
  },
  scoreCard: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 7,
    borderColor: "#C49EDE",
    backgroundColor: "#28204B88",
  },
  score: {
    color: colors.text,
    fontSize: 68,
    fontFamily: fonts.heading,
    lineHeight: 82,
  },
  scoreLabel: {
    color: "#D8CCEC",
    fontSize: 16,
    fontFamily: fonts.regular,
  },
  metrics: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  metric: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontFamily: fonts.regular,
  },
  value: {
    color: colors.textSecondary,
    fontSize: 18,
    fontFamily: fonts.medium,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 18,
  },
  saved: {
    color: colors.success,
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  date: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: fonts.regular,
    textAlign: "center",
    marginTop: 6,
  },
  close: {
    position: "absolute",
    right: 20,
    zIndex: 1,
  },
});
