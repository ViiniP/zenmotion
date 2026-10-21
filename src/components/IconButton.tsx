import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet } from "react-native";

import { cores } from "../constants/theme";

type IconButtonProps = {
  name: ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export function IconButton({
  name,
  label,
  onPress,
  disabled,
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      accessibilityState={{
        disabled: !!disabled,
      }}
      aria-disabled={!!disabled}
      onPress={onPress}
      style={({ pressed: pressionado }) => [
        estilos.botao,
        pressionado && estilos.pressionado,
        disabled && estilos.desabilitado,
      ]}
    >
      <Ionicons
        name={name}
        size={25}
        color={cores.texto}
        accessible={false}
        aria-hidden
      />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  botao: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF18",
    alignItems: "center",
    justifyContent: "center",
  },
  pressionado: {
    opacity: 0.65,
  },
  desabilitado: {
    opacity: 0.4,
  },
});
