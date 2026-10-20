import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "../constants/theme";
import { useSessionStore } from "../stores/useSessionStore";
import { AppButton } from "./AppButton";
import { Screen } from "./Screen";

export function HistoryStatus() {
  const loadStatus = useSessionStore((state) => state.loadStatus);
  const loadError = useSessionStore((state) => state.loadError);
  const loadSessions = useSessionStore((state) => state.loadSessions);

  return (
    <Screen><View style={styles.container}>
      {loadStatus === "error" ? (
        <>
          <Text accessibilityRole="alert" style={styles.error}>{loadError}</Text>
          <AppButton title="Tentar carregar novamente" onPress={loadSessions} />
        </>
      ) : (
        <>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.description}>Carregando histórico...</Text>
        </>
      )}
    </View></Screen>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 20 },
  description: { color: colors.textSecondary, fontSize: 18, fontFamily: fonts.regular },
  error: { color: colors.error, fontSize: 18, lineHeight: 26, fontFamily: fonts.regular },
});
