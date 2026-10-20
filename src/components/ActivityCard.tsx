import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "../constants/theme";

export function ActivityCard({ duration, onPress, large = false }: { duration: number; onPress: () => void; large?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Começar Equilíbrio Zen, ${duration} segundos`}
      onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <LinearGradient colors={["#513C91", "#332B6A"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.content, large && styles.large]}>
        <Image source={require("../../assets/images/zen-orb.png")} style={large ? styles.largeOrb : styles.orb} accessible={false} />
        <View style={large ? styles.largeCopy : styles.copy}>
          <Text style={large ? styles.largeTitle : styles.title}>Equilíbrio Zen</Text>
          <Text style={styles.description}>{large ? "Mantenha o celular estável" : `${duration} segundos de calma`}</Text>
          {large && <Text style={styles.duration}>{duration} s · Sensores de movimento</Text>}
        </View>
        <View style={[styles.play, large && styles.largePlay]}><Ionicons name="play" size={22} color={colors.background} accessible={false} aria-hidden /></View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 26, overflow: "hidden" },
  pressed: { opacity: 0.8 },
  content: { minHeight: 112, padding: 20, flexDirection: "row", alignItems: "center", gap: 12 },
  large: { minHeight: 264, alignItems: "flex-start", justifyContent: "flex-end", flexDirection: "column", padding: 24 },
  orb: { width: 62, height: 62 },
  largeOrb: { width: 100, height: 100, position: "absolute", right: 18, top: 12 },
  copy: { flex: 1, gap: 3 },
  largeCopy: { width: "100%", gap: 3, paddingRight: 40 },
  largePlay: { position: "absolute", right: 22, bottom: 24 },
  title: { fontFamily: fonts.heading, fontSize: 20, color: colors.text },
  largeTitle: { fontFamily: fonts.heading, fontSize: 27, color: colors.text },
  description: { color: "#DFD7FF", fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  duration: { color: "#E3D5FF", fontFamily: fonts.medium, fontSize: 13, marginTop: 8 },
  play: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary },
});
