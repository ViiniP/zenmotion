import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { ActivityCard } from "../../components/ActivityCard";
import { IconButton } from "../../components/IconButton";
import { LandscapeHeader } from "../../components/LandscapeHeader";
import { StatRow } from "../../components/StatRow";
import { colors, fonts } from "../../constants/theme";
import { useSessionStore } from "../../stores/useSessionStore";
import { useZenStore } from "../../stores/useZenStore";
import { sessionStats } from "../../utils/sessionStats";

export default function HomeScreen() {
  const profile = useZenStore((state) => state.profile);
  const sessions = useSessionStore((state) => state.sessions);
  const loadStatus = useSessionStore((state) => state.loadStatus);
  const insets = useSafeAreaInsets();
  const stats = sessionStats(sessions);
  const now = new Date();
  const greeting =
    now.getHours() < 12
      ? "Bom dia"
      : now.getHours() < 18
        ? "Boa tarde"
        : "Boa noite";
  const formattedDate = now.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
  const date = formattedDate[0].toUpperCase() + formattedDate.slice(1);
  const duration = Number(profile?.duration ?? "60");

  return (
    <SafeAreaView
      edges={["left", "right"]}
      style={styles.screen}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <LandscapeHeader>
          <View
            style={[
              styles.greeting,
              {
                paddingTop: Math.max(insets.top + 20, 54),
              },
            ]}
          >
            <View style={styles.greetingCopy}>
              <Text style={styles.date}>{date}</Text>
              <Text style={styles.title}>{greeting}</Text>
              {profile && (
                <Text style={styles.name}>
                  {profile.name.split(" ")[0]}, esse momento é seu.
                </Text>
              )}
            </View>
            <IconButton
              name="person-outline"
              label="Abrir perfil"
              onPress={() => router.navigate("/(tabs)/perfil")}
            />
          </View>
        </LandscapeHeader>
        <View style={styles.content}>
          <StatRow
            items={[
              {
                value: loadStatus === "ready" ? stats.points : "—",
                label: "pontos",
              },
              {
                value: loadStatus === "ready" ? stats.count : "—",
                label: "sessões",
              },
              {
                value: loadStatus === "ready" ? stats.minutes : "—",
                label: "minutos",
              },
            ]}
          />
          <Text style={styles.sectionTitle}>Para agora</Text>
          <ActivityCard
            duration={duration}
            onPress={() =>
              router.push({
                pathname: "/sessao/[atividade]",
                params: {
                  atividade: "equilibrio-zen",
                  duracao: String(duration),
                },
              })
            }
          />
          <View style={styles.shortcuts}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.navigate("/(tabs)/historico")}
              style={({ pressed }) => [
                styles.shortcut,
                styles.blue,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="time-outline"
                size={28}
                color="#B9C5FF"
                accessible={false}
                aria-hidden
              />
              <Text style={styles.shortcutTitle}>Seu histórico</Text>
              <Text style={styles.shortcutDescription}>Cada sessão conta</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.navigate("/(tabs)/perfil")}
              style={({ pressed }) => [
                styles.shortcut,
                styles.pink,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="person-outline"
                size={28}
                color="#E8B0D0"
                accessible={false}
                aria-hidden
              />
              <Text style={styles.shortcutTitle}>Seu perfil</Text>
              <Text style={styles.shortcutDescription}>No seu ritmo</Text>
            </Pressable>
          </View>
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
  scroll: {
    paddingBottom: 28,
  },
  greeting: {
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },
  greetingCopy: {
    flex: 1,
    gap: 3,
  },
  date: {
    color: "#D6CDEF",
    fontFamily: fonts.medium,
    fontSize: 15,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 36,
    lineHeight: 46,
  },
  name: {
    color: "#D6CDEF",
    fontFamily: fonts.regular,
    fontSize: 14,
    marginTop: 5,
  },
  content: {
    paddingHorizontal: 20,
    gap: 20,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 23,
    marginTop: 6,
  },
  shortcuts: {
    flexDirection: "row",
    gap: 12,
  },
  shortcut: {
    flex: 1,
    minHeight: 116,
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 7,
  },
  blue: {
    backgroundColor: colors.blueSurface,
    borderColor: "#394372",
  },
  pink: {
    backgroundColor: colors.peachSurface,
    borderColor: "#60415F",
  },
  shortcutTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 17,
    marginTop: 5,
  },
  shortcutDescription: {
    color: "#C3BED9",
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  pressed: {
    opacity: 0.75,
  },
});
