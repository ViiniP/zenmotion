import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton } from "../../components/AppButton";
import { HistoryStatus } from "../../components/HistoryStatus";
import { SessionSync } from "../../components/SessionSync";
import { screenContent } from "../../components/Screen";
import { StatRow } from "../../components/StatRow";
import { colors, fonts } from "../../constants/theme";
import { useSessionStore } from "../../stores/useSessionStore";
import { formatSessionDate, formatStableTime } from "../../utils/sessionRecord";
import { sessionStats } from "../../utils/sessionStats";

export default function HistoryScreen() {
  const sessions = useSessionStore((state) => state.sessions);
  const loadStatus = useSessionStore((state) => state.loadStatus);
  const stats = sessionStats(sessions);

  if (loadStatus !== "ready") return <HistoryStatus />;

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={styles.screen}
    >
      <FlatList
        data={sessions}
        keyExtractor={(session) => session.id}
        contentContainerStyle={styles.container}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Histórico</Text>
            <Text style={styles.description}>
              Seu progresso, uma pausa de cada vez.
            </Text>
            {sessions.length > 0 && (
              <>
                <View style={styles.highlights}>
                  <LinearGradient
                    colors={["#47357E", "#302663"]}
                    style={styles.highlight}
                  >
                    <Text style={styles.highlightLabel}>
                      Estabilidade média
                    </Text>
                    <Text style={styles.highlightValue}>{stats.average}%</Text>
                  </LinearGradient>
                  <LinearGradient
                    colors={["#68448D", "#3D2A67"]}
                    style={styles.highlight}
                  >
                    <Text style={styles.highlightLabel}>Melhor pontuação</Text>
                    <Text style={styles.highlightValue}>{stats.best}</Text>
                  </LinearGradient>
                </View>
                <StatRow
                  items={[
                    {
                      value: stats.count,
                      label: "sessões",
                    },
                    {
                      value: stats.minutes,
                      label: "minutos",
                    },
                    {
                      value: stats.points,
                      label: "pontos",
                    },
                  ]}
                />
              </>
            )}
            <SessionSync sessions={sessions} />
            {sessions.length > 0 && (
              <Text style={styles.sectionLabel}>SESSÕES RECENTES</Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Image
              source={require("../../../assets/images/zen-orb.png")}
              style={styles.emptyOrb}
              accessible={false}
            />
            <Text style={styles.emptyTitle}>Seu ritmo começa aqui</Text>
            <Text style={styles.emptyDescription}>
              Conclua sua primeira sessão para acompanhar cada conquista.
            </Text>
            <AppButton
              title="Escolher atividade"
              onPress={() => router.navigate("/(tabs)/atividades")}
            />
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Equilíbrio Zen, ${formatSessionDate(item.completedAt)}, ${item.averageStability} pontos. Ver resultado`}
            onPress={() =>
              router.push({
                pathname: "/resultado/[id]",
                params: {
                  id: item.id,
                },
              })
            }
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          >
            <Image
              source={require("../../../assets/images/zen-orb.png")}
              style={styles.orb}
              accessible={false}
            />
            <View style={styles.cardCopy}>
              <Text style={styles.cardTitle}>Equilíbrio Zen</Text>
              <Text style={styles.date}>
                {formatSessionDate(item.completedAt)}
              </Text>
              <Text style={styles.details}>
                {item.durationSeconds} s · {formatStableTime(item.stableMs)} na
                faixa
              </Text>
            </View>
            <Text style={styles.points}>{item.averageStability}</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    ...screenContent,
    gap: 12,
  },
  title: {
    color: colors.text,
    fontSize: 34,
    fontFamily: fonts.heading,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.regular,
  },
  header: {
    gap: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 18,
    gap: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  pressed: {
    opacity: 0.75,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontFamily: fonts.bold,
  },
  points: {
    color: colors.text,
    fontSize: 25,
    fontFamily: fonts.heading,
  },
  date: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: fonts.regular,
  },
  details: {
    color: "#BFB6D4",
    fontSize: 12,
    lineHeight: 18,
    fontFamily: fonts.regular,
  },
  cardCopy: {
    flex: 1,
    gap: 3,
  },
  orb: {
    width: 40,
    height: 40,
  },
  highlights: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  highlight: {
    flex: 1,
    borderRadius: 24,
    padding: 18,
    gap: 8,
    justifyContent: "space-between",
  },
  highlightLabel: {
    fontSize: 14,
    lineHeight: 20,
    color: "#DED3F1",
    fontFamily: fonts.regular,
  },
  highlightValue: {
    color: colors.text,
    fontSize: 34,
    fontFamily: fonts.heading,
  },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    letterSpacing: 1,
    fontFamily: fonts.bold,
    marginTop: 8,
  },
  empty: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: colors.surface,
    gap: 16,
  },
  emptyOrb: {
    width: 76,
    height: 76,
    alignSelf: "center",
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 22,
    fontFamily: fonts.heading,
    textAlign: "center",
  },
  emptyDescription: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.regular,
    textAlign: "center",
  },
});
