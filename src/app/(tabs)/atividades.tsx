import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { ActivityCard } from "../../components/ActivityCard";
import { OptionSelector } from "../../components/OptionSelector";
import { Screen } from "../../components/Screen";
import { durationOptions } from "../../constants/profile";
import { cores, fontes } from "../../constants/theme";
import { useZenStore } from "../../stores/useZenStore";

export default function ActivitiesScreen() {
  // O seletor acompanha a preferência salva no Perfil. O padrão inicial é 60 s.
  const duracaoPadrao = useZenStore(
    (estado) => estado.profile?.duration ?? "60",
  );
  const [duracao, definirDuracao] = useState(duracaoPadrao);
  useFocusEffect(
    useCallback(() => {
      definirDuracao(duracaoPadrao);
    }, [duracaoPadrao]),
  );

  function abrirSessao(duracao: number) {
    // O nome da atividade e a duração são enviados para a próxima tela.
    router.push({
      pathname: "/sessao/[atividade]",
      params: {
        atividade: "equilibrio-zen",
        duracao: String(duracao),
      },
    });
  }

  return (
    <Screen>
      <View style={estilos.cabecalhoSecao}>
        <Text style={estilos.titulo}>Atividades</Text>
        <Text style={estilos.descricao}>
          Uma pausa para encontrar seu equilíbrio.
        </Text>
      </View>
      <OptionSelector
        label="Duração da sessão"
        options={durationOptions}
        value={duracao}
        onChange={definirDuracao}
        variant="segmented"
      />
      <ActivityCard
        large
        duration={Number(duracao)}
        onPress={() => abrirSessao(Number(duracao))}
      />
      <View style={estilos.instrucoes}>
        <Text style={estilos.tituloSecao}>Como praticar</Text>
        <View style={estilos.passo}>
          <Ionicons
            name="phone-portrait-outline"
            color={cores.roxo}
            size={23}
            accessible={false}
            aria-hidden
          />
          <Text style={estilos.textoPasso}>
            Segure o celular deitado, com a tela para cima.
          </Text>
        </View>
        <View style={estilos.passo}>
          <Ionicons
            name="compass-outline"
            color={cores.primaria}
            size={23}
            accessible={false}
            aria-hidden
          />
          <Text style={estilos.textoPasso}>
            Ajuste a inclinação e mantenha a esfera no centro.
          </Text>
        </View>
        <View style={estilos.passo}>
          <Ionicons
            name="leaf-outline"
            color={cores.sucesso}
            size={23}
            accessible={false}
            aria-hidden
          />
          <Text style={estilos.textoPasso}>
            Movimente-se devagar. Você pode pausar quando quiser.
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const estilos = StyleSheet.create({
  cabecalhoSecao: {
    gap: 6,
  },
  titulo: {
    color: cores.texto,
    fontSize: 34,
    fontFamily: fontes.titulo,
  },
  descricao: {
    color: cores.textoSecundario,
    fontSize: 16,
    fontFamily: fontes.regular,
    lineHeight: 24,
  },
  instrucoes: {
    padding: 22,
    borderRadius: 24,
    backgroundColor: cores.superficie,
    gap: 20,
  },
  tituloSecao: {
    color: cores.texto,
    fontFamily: fontes.negrito,
    fontSize: 20,
  },
  passo: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
  },
  textoPasso: {
    flex: 1,
    color: "#C9C3DE",
    fontFamily: fontes.regular,
    fontSize: 15,
    lineHeight: 22,
  },
});
