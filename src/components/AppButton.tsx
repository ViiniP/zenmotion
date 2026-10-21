import { Pressable, StyleSheet, Text } from "react-native";

import { cores, fontes } from "../constants/theme";

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
      accessibilityState={{
        disabled,
      }}
      aria-disabled={disabled}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed: pressionado }) => [
        estilos.botao,
        variant === "secondary" && estilos.secundario,
        variant === "text" && estilos.botaoTexto,
        pressionado && estilos.pressionado,
        disabled && estilos.desabilitado,
      ]}
    >
      <Text
        style={[
          estilos.rotulo,
          variant === "secondary" && estilos.rotuloSecundario,
          variant === "text" && estilos.rotuloBotaoTexto,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  botao: {
    backgroundColor: cores.primaria,
    borderRadius: 20,
    minHeight: 52,
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  pressionado: {
    opacity: 0.75,
  },
  desabilitado: {
    opacity: 0.5,
  },
  rotulo: {
    color: cores.fundo,
    fontSize: 17,
    fontFamily: fontes.negrito,
  },
  secundario: {
    backgroundColor: cores.superficieSuave,
  },
  botaoTexto: {
    backgroundColor: "transparent",
    paddingVertical: 10,
  },
  rotuloSecundario: {
    color: cores.texto,
  },
  rotuloBotaoTexto: {
    color: cores.primaria,
  },
});
