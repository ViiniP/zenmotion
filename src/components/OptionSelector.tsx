import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "../constants/theme";

type OptionSelectorProps = {
  label: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  variant?: "chips" | "segmented";
};

export function OptionSelector({
  label,
  options,
  value,
  onChange,
  error,
  disabled = false,
  variant = "chips",
}: OptionSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={label}
        style={[styles.options, variant === "segmented" && styles.segmented]}
      >
        {options.map((option) => (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: option.value === value, disabled }}
            aria-checked={option.value === value}
            aria-disabled={disabled}
            disabled={disabled}
            onPress={() => onChange(option.value)}
            style={[
              styles.option,
              variant === "segmented" && styles.segment,
              error && styles.optionError,
              option.value === value && styles.selectedOption,
              disabled && styles.disabled,
            ]}
          >
            <Text
              style={[
                styles.optionText,
                option.value === value && styles.selectedText,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
      {error && (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  label: { color: colors.textSecondary, fontSize: 14, fontFamily: fonts.bold },
  options: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  option: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  optionError: { borderColor: colors.error },
  selectedOption: {
    backgroundColor: "#6F688D",
    borderColor: colors.primary,
  },
  optionText: { color: "#D8D2EB", fontSize: 14, fontFamily: fonts.medium, textAlign: "center" },
  selectedText: { color: colors.text, fontFamily: fonts.bold },
  segmented: { flexWrap: "nowrap", backgroundColor: colors.surfaceSoft, borderRadius: 18, padding: 4, gap: 4 },
  segment: { flex: 1, borderRadius: 14, borderWidth: 0, minHeight: 44, backgroundColor: "transparent", paddingHorizontal: 8 },
  disabled: { opacity: 0.5 },
  error: { color: colors.error, fontSize: 14, lineHeight: 20 },
});
