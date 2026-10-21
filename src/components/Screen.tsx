import type { PropsWithChildren } from "react";
import {
  ScrollView,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

import { cores } from "../constants/theme";

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
      style={estilos.tela}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[estilos.conteudo, contentStyle]}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export const conteudoTela = {
  width: "100%",
  maxWidth: 600,
  alignSelf: "center",
  padding: 20,
  paddingTop: 18,
  paddingBottom: 32,
} as const;

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  conteudo: {
    ...conteudoTela,
    gap: 24,
  },
});
