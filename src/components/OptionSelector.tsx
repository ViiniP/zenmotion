import { Pressable, StyleSheet, Text, View } from "react-native";

import { cores, fontes } from "../constants/theme";

type OptionSelectorProps = {
  label: string;
  options: {
    label: string;
    value: string;
  }[];
  value: string;
  onChange: (valor: string) => void;
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
    <View style={estilos.conteiner}>
      <Text style={estilos.rotulo}>{label}</Text>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={label}
        style={[estilos.opcoes, variant === "segmented" && estilos.segmentado]}
      >
        {options.map((opcao) => (
          <Pressable
            key={opcao.value}
            accessibilityRole="radio"
            accessibilityState={{
              checked: opcao.value === value,
              disabled,
            }}
            aria-checked={opcao.value === value}
            aria-disabled={disabled}
            disabled={disabled}
            onPress={() => onChange(opcao.value)}
            style={[
              estilos.opcao,
              variant === "segmented" && estilos.segmento,
              error && estilos.opcaoComErro,
              opcao.value === value && estilos.opcaoSelecionada,
              disabled && estilos.desabilitado,
            ]}
          >
            <Text
              style={[
                estilos.textoOpcao,
                opcao.value === value && estilos.textoSelecionado,
              ]}
            >
              {opcao.label}
            </Text>
          </Pressable>
        ))}
      </View>
      {error && (
        <Text
          accessibilityRole="alert"
          style={estilos.erro}
        >
          {error}
        </Text>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  conteiner: {
    gap: 8,
  },
  rotulo: {
    color: cores.textoSecundario,
    fontSize: 14,
    fontFamily: fontes.negrito,
  },
  opcoes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  opcao: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 24,
    backgroundColor: cores.superficie,
    paddingHorizontal: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  opcaoComErro: {
    borderColor: cores.erro,
  },
  opcaoSelecionada: {
    backgroundColor: "#6F688D",
    borderColor: cores.primaria,
  },
  textoOpcao: {
    color: "#D8D2EB",
    fontSize: 14,
    fontFamily: fontes.seminegrito,
    textAlign: "center",
  },
  textoSelecionado: {
    color: cores.texto,
    fontFamily: fontes.negrito,
  },
  segmentado: {
    flexWrap: "nowrap",
    backgroundColor: cores.superficieSuave,
    borderRadius: 18,
    padding: 4,
    gap: 4,
  },
  segmento: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 0,
    minHeight: 44,
    backgroundColor: "transparent",
    paddingHorizontal: 8,
  },
  desabilitado: {
    opacity: 0.5,
  },
  erro: {
    color: cores.erro,
    fontSize: 14,
    lineHeight: 20,
  },
});
