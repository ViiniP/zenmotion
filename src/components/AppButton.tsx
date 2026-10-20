import { Pressable, StyleSheet, Text } from "react-native";

import { colors, fonts } from "../constants/theme";

type AppButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "text";
};

export function AppButton({
  title,
  onPress,
  disabled = false,
  variant = "primary",
}: AppButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      aria-disabled={disabled}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === "secondary" && styles.secondary,
        variant === "text" && styles.textButton,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.label, variant === "secondary" && styles.secondaryLabel, variant === "text" && styles.textLabel]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    minHeight: 52,
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.75,
  },
  disabled: { opacity: 0.5 },
  label: {
    color: colors.background,
    fontSize: 17,
    fontFamily: fonts.bold,
  },
  secondary: { backgroundColor: colors.surfaceSoft },
  textButton: { backgroundColor: "transparent", paddingVertical: 10 },
  secondaryLabel: { color: colors.text },
  textLabel: { color: colors.primary },
});
