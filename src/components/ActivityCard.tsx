import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { cores, fontes } from "../constants/theme";

export function ActivityCard({
  duration,
  onPress,
  large = false,
}: {
  duration: number;
  onPress: () => void;
  large?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Começar Equilíbrio Zen, ${duration} segundos`}
      onPress={onPress}
      style={({ pressed: pressionado }) => [estilos.cartao, pressionado && estilos.pressionado]}
    >
      <LinearGradient
        colors={["#513C91", "#332B6A"]}
        start={{
          x: 0,
          y: 0,
        }}
        end={{
          x: 1,
          y: 1,
        }}
        style={[estilos.conteudo, large && estilos.grande]}
      >
        <Image
          source={require("../../assets/images/zen-orb.png")}
          style={large ? estilos.esferaGrande : estilos.esfera}
          accessible={false}
        />
        <View style={large ? estilos.textosGrandes : estilos.textos}>
          <Text style={large ? estilos.tituloGrande : estilos.titulo}>
            Equilíbrio Zen
          </Text>
          <Text style={estilos.descricao}>
            {large
              ? "Mantenha o celular estável"
              : `${duration} segundos de calma`}
          </Text>
          {large && (
            <Text style={estilos.duracao}>
              {duration} s · Sensores de movimento
            </Text>
          )}
        </View>
        <View style={[estilos.botaoIniciar, large && estilos.botaoIniciarGrande]}>
          <Ionicons
            name="play"
            size={22}
            color={cores.fundo}
            accessible={false}
            aria-hidden
          />
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    borderRadius: 26,
    overflow: "hidden",
  },
  pressionado: {
    opacity: 0.8,
  },
  conteudo: {
    minHeight: 112,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  grande: {
    minHeight: 264,
    alignItems: "flex-start",
    justifyContent: "flex-end",
    flexDirection: "column",
    padding: 24,
  },
  esfera: {
    width: 62,
    height: 62,
  },
  esferaGrande: {
    width: 100,
    height: 100,
    position: "absolute",
    right: 18,
    top: 12,
  },
  textos: {
    flex: 1,
    gap: 3,
  },
  textosGrandes: {
    width: "100%",
    gap: 3,
    paddingRight: 40,
  },
  botaoIniciarGrande: {
    position: "absolute",
    right: 22,
    bottom: 24,
  },
  titulo: {
    fontFamily: fontes.titulo,
    fontSize: 20,
    color: cores.texto,
  },
  tituloGrande: {
    fontFamily: fontes.titulo,
    fontSize: 27,
    color: cores.texto,
  },
  descricao: {
    color: "#DFD7FF",
    fontFamily: fontes.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  duracao: {
    color: "#E3D5FF",
    fontFamily: fontes.seminegrito,
    fontSize: 13,
    marginTop: 8,
  },
  botaoIniciar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: cores.primaria,
  },
});
