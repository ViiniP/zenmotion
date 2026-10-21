import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text } from "react-native";

import { AppButton } from "../../components/AppButton";
import { ZenSession } from "../../components/ZenSession";
import { Screen } from "../../components/Screen";
import { cores, fontes } from "../../constants/theme";

export default function SessionScreen() {
  // Os nomes correspondem aos parâmetros enviados em abrirSessao.
  const { atividade, duracao } = useLocalSearchParams<{
    atividade: string;
    duracao?: string;
  }>();

  const sessaoValida =
    atividade === "equilibrio-zen" &&
    (duracao === "30" || duracao === "45" || duracao === "60");

  function voltar() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/atividades");
    }
  }

  if (sessaoValida) {
    return (
      <ZenSession
        key={`${atividade}-${duracao}`}
        duration={Number(duracao)}
        onExit={voltar}
        onSaved={(id) =>
          router.replace({
            pathname: "/resultado/[id]",
            params: {
              id,
            },
          })
        }
      />
    );
  }

  return (
    <Screen edges={["top", "left", "right", "bottom"]}>
      <Text style={estilos.titulo}>Sessão indisponível</Text>
      <Text style={estilos.descricao}>
        Escolha uma atividade e uma duração válidas para continuar.
      </Text>
      <AppButton
        title="Voltar"
        onPress={voltar}
      />
    </Screen>
  );
}

const estilos = StyleSheet.create({
  conteiner: {
    padding: 24,
    gap: 20,
  },
  titulo: {
    color: cores.texto,
    fontSize: 28,
    fontFamily: fontes.titulo,
  },
  descricao: {
    color: cores.textoSecundario,
    fontSize: 18,
    lineHeight: 26,
    fontFamily: fontes.regular,
  },
});
