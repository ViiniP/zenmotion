import { StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "../constants/theme";

export function StatRow({ items }: { items: { value: string | number; label: string }[] }) {
  return (
    <View style={styles.card}>
      {items.map((item, index) => (
        <View key={item.label} style={[styles.item, index > 0 && styles.divider]}>
          <Text style={styles.value}>{item.value}</Text>
          <Text style={styles.label}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", borderRadius: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingVertical: 17 },
  item: { flex: 1, paddingHorizontal: 6, gap: 4, alignItems: "center", justifyContent: "center" },
  divider: { borderLeftWidth: 1, borderLeftColor: colors.border },
  value: { color: colors.text, fontFamily: fonts.heading, fontSize: 28 },
  label: { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 14, textAlign: "center" },
});
