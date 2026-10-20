import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet } from "react-native";

import { colors } from "../constants/theme";

type IconButtonProps = {
  name: ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export function IconButton({ name, label, onPress, disabled }: IconButtonProps) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label}
      disabled={disabled} accessibilityState={{ disabled: !!disabled }} aria-disabled={!!disabled}
      onPress={onPress} style={({ pressed }) => [styles.button, pressed && styles.pressed, disabled && styles.disabled]}>
      <Ionicons name={name} size={25} color={colors.text} accessible={false} aria-hidden />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#FFFFFF18", alignItems: "center", justifyContent: "center" },
  pressed: { opacity: 0.65 },
  disabled: { opacity: 0.4 },
});
