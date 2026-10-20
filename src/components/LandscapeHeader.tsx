import { LinearGradient } from "expo-linear-gradient";
import type { PropsWithChildren } from "react";
import { ImageBackground, StyleSheet } from "react-native";

import { colors } from "../constants/theme";

export function LandscapeHeader({ children }: PropsWithChildren) {
  return (
    <ImageBackground source={require("../../assets/images/zen-landscape.png")} resizeMode="cover" style={styles.header}>
      <LinearGradient colors={["transparent", colors.background]} style={styles.blend} pointerEvents="none" />
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  header: { width: "100%", height: 300 },
  blend: { position: "absolute", left: 0, right: 0, bottom: 0, height: 38 },
});
