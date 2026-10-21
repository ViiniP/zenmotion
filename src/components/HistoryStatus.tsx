import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { cores, fontes } from "../constants/theme";
import { useSessionStore } from "../stores/useSessionStore";
import { AppButton } from "./AppButton";
import { Screen } from "./Screen";

export function HistoryStatus() {
  const estadoCarregamento = useSessionStore((estado) => estado.loadStatus);
  const erroCarregamento = useSessionStore((estado) => estado.loadError);
  const carregarSessoes = useSessionStore((estado) => estado.loadSessions);

  return (
    <Screen>
      <View style={estilos.conteiner}>
        {estadoCarregamento === "error" ? (
          <>
            <Text
              accessibilityRole="alert"
              style={estilos.erro}
            >
              {erroCarregamento}
            </Text>
            <AppButton
              title="Tentar carregar novamente"
              onPress={carregarSessoes}
            />
          </>
        ) : (
          <>
            <ActivityIndicator color={cores.primaria} />
            <Text style={estilos.descricao}>Carregando histórico...</Text>
          </>
        )}
      </View>
    </Screen>
  );
}

const estilos = StyleSheet.create({
  conteiner: {
    padding: 24,
    gap: 20,
  },
  descricao: {
    color: cores.textoSecundario,
    fontSize: 18,
    fontFamily: fontes.regular,
  },
  erro: {
    color: cores.erro,
    fontSize: 18,
    lineHeight: 26,
    fontFamily: fontes.regular,
  },
});
