import type { PropsWithChildren } from "react";
import {
  ScrollView,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

import { colors } from "../constants/theme";

type ScreenProps = PropsWithChildren<{
  contentStyle?: StyleProp<ViewStyle>;
  edges?: Edge[];
}>;

export function Screen({
  children,
  contentStyle,
  edges = ["top", "left", "right"],
}: ScreenProps) {
  return (
    <SafeAreaView
      edges={edges}
      style={styles.screen}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, contentStyle]}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export const screenContent = {
  width: "100%",
  maxWidth: 600,
  alignSelf: "center",
  padding: 20,
  paddingTop: 18,
  paddingBottom: 32,
} as const;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    ...screenContent,
    gap: 24,
  },
});
