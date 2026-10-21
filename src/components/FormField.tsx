import { StyleSheet, Text, TextInput, View } from "react-native";
import type { TextInputProps } from "react-native";

import { cores, fontes } from "../constants/theme";

type FormFieldProps = TextInputProps & {
  label: string;
  error?: string;
};

export function FormField({ label, error, ...inputProps }: FormFieldProps) {
  return (
    <View style={estilos.conteiner}>
      <Text style={estilos.rotulo}>{label}</Text>
      <TextInput
        {...inputProps}
        accessibilityLabel={label}
        placeholderTextColor={cores.textoSecundario}
        selectionColor={cores.primaria}
        style={[estilos.campo, error && estilos.campoComErro]}
      />
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
  campo: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 18,
    backgroundColor: cores.superficie,
    color: cores.texto,
    fontSize: 16,
    fontFamily: fontes.regular,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  campoComErro: {
    borderColor: cores.erro,
    backgroundColor: "#302034",
  },
  erro: {
    color: cores.erro,
    fontFamily: fontes.regular,
    fontSize: 13,
    lineHeight: 20,
  },
});
