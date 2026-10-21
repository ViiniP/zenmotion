import { StyleSheet, Text, View } from "react-native";

import { cores, fontes } from "../constants/theme";

export function StatRow({
  items,
}: {
  items: {
    value: string | number;
    label: string;
  }[];
}) {
  return (
    <View style={estilos.cartao}>
      {items.map((item, indice) => (
        <View
          key={item.label}
          style={[estilos.item, indice > 0 && estilos.divisor]}
        >
          <Text style={estilos.valor}>{item.value}</Text>
          <Text style={estilos.rotulo}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    flexDirection: "row",
    borderRadius: 24,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    paddingVertical: 17,
  },
  item: {
    flex: 1,
    paddingHorizontal: 6,
    gap: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  divisor: {
    borderLeftWidth: 1,
    borderLeftColor: cores.borda,
  },
  valor: {
    color: cores.texto,
    fontFamily: fontes.titulo,
    fontSize: 28,
  },
  rotulo: {
    color: cores.textoSecundario,
    fontFamily: fontes.regular,
    fontSize: 14,
    textAlign: "center",
  },
});
