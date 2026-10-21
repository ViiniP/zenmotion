import { LinearGradient } from "expo-linear-gradient";
import type { PropsWithChildren } from "react";
import { ImageBackground, StyleSheet } from "react-native";

import { cores } from "../constants/theme";

export function LandscapeHeader({ children }: PropsWithChildren) {
  return (
    <ImageBackground
      source={require("../../assets/images/zen-landscape.png")}
      resizeMode="cover"
      style={estilos.cabecalho}
    >
      <LinearGradient
        colors={["transparent", cores.fundo]}
        style={estilos.degradeRodape}
        pointerEvents="none"
      />
      {children}
    </ImageBackground>
  );
}

const estilos = StyleSheet.create({
  cabecalho: {
    width: "100%",
    height: 300,
  },
  degradeRodape: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 38,
  },
});
