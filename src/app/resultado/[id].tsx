import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { AppButton } from "../../components/AppButton";
import { HistoryStatus } from "../../components/HistoryStatus";
import { IconButton } from "../../components/IconButton";
import { LandscapeHeader } from "../../components/LandscapeHeader";
import { Screen } from "../../components/Screen";
import { cores, fontes } from "../../constants/theme";
import { useSessionStore } from "../../stores/useSessionStore";
import { formatSessionDate, formatStableTime } from "../../utils/sessionRecord";

export default function ResultScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();
  const estadoCarregamento = useSessionStore((estado) => estado.loadStatus);
  const margensSeguras = useSafeAreaInsets();
  // A rota transporta só o ID; os dados vêm do histórico salvo no Zustand.
  const sessao = useSessionStore((estado) =>
    estado.sessions.find((item) => item.id === id),
  );

  if (estadoCarregamento !== "ready") return <HistoryStatus />;

  if (!sessao) {
    return (
      <Screen edges={["top", "left", "right", "bottom"]}>
        <Text style={estilos.titulo}>Resultado não encontrado</Text>
        <Text style={estilos.descricao}>
          Esta sessão não está no histórico deste aparelho.
        </Text>
        <AppButton
          title="Ir para o histórico"
          onPress={() => router.navigate("/(tabs)/historico")}
        />
      </Screen>
    );
  }

  return (
    <SafeAreaView
      edges={["left", "right", "bottom"]}
      style={estilos.tela}
    >
      <ScrollView
        contentContainerStyle={estilos.pagina}
        showsVerticalScrollIndicator={false}
      >
        <LandscapeHeader>
          <View
            style={[
              estilos.fechar,
              {
                top: Math.max(margensSeguras.top + 8, 16),
              },
            ]}
          >
            <IconButton
              name="close-outline"
              label="Fechar resultado"
              onPress={() => router.navigate("/(tabs)/historico")}
            />
          </View>
          <View
            style={[
              estilos.cartaoPontuacao,
              {
                marginTop: Math.max(margensSeguras.top + 30, 60),
              },
            ]}
          >
            <Text style={estilos.pontuacao}>{sessao.averageStability}</Text>
            <Text style={estilos.rotuloPontuacao}>pontos de 100</Text>
          </View>
        </LandscapeHeader>
        <View style={estilos.conteiner}>
          <Text style={estilos.titulo}>
            {sessao.averageStability >= 80
              ? "Muito estável"
              : sessao.averageStability >= 60
                ? "Bom equilíbrio"
                : "Um passo de cada vez"}
          </Text>
          <Text style={estilos.subtitulo}>
            Equilíbrio Zen · {sessao.durationSeconds} s
          </Text>
          <View style={estilos.metricas}>
            <View style={estilos.linhaMetrica}>
              <Text style={estilos.metrica}>Estabilidade média</Text>
              <Text style={estilos.valor}>{sessao.averageStability}%</Text>
            </View>
            <View style={estilos.linhaMetrica}>
              <Text style={estilos.metrica}>Tempo na faixa</Text>
              <Text style={estilos.valor}>
                {formatStableTime(sessao.stableMs)}
              </Text>
            </View>
            <View style={estilos.linhaSituacao}>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={cores.sucesso}
                accessible={false}
                aria-hidden
              />
              <Text style={estilos.salvo}>Salvo no aparelho</Text>
            </View>
          </View>
          <AppButton
            title="Concluir"
            onPress={() => router.navigate("/(tabs)/historico")}
          />
          <AppButton
            title="Repetir atividade"
            variant="secondary"
            onPress={() =>
              router.replace({
                pathname: "/sessao/[atividade]",
                params: {
                  atividade: sessao.activity,
                  duracao: String(sessao.durationSeconds),
                },
              })
            }
          />
          <Text style={estilos.data}>
            {formatSessionDate(sessao.completedAt)}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  pagina: {
    paddingBottom: 20,
  },
  conteiner: {
    padding: 20,
    gap: 14,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },
  titulo: {
    color: cores.texto,
    fontSize: 30,
    fontFamily: fontes.titulo,
    textAlign: "center",
  },
  subtitulo: {
    color: cores.textoSecundario,
    fontSize: 17,
    fontFamily: fontes.regular,
    textAlign: "center",
    marginBottom: 10,
  },
  descricao: {
    color: cores.textoSecundario,
    fontSize: 16,
    fontFamily: fontes.regular,
    lineHeight: 24,
  },
  cartaoPontuacao: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 7,
    borderColor: "#C49EDE",
    backgroundColor: "#28204B88",
  },
  pontuacao: {
    color: cores.texto,
    fontSize: 68,
    fontFamily: fontes.titulo,
    lineHeight: 82,
  },
  rotuloPontuacao: {
    color: "#D8CCEC",
    fontSize: 16,
    fontFamily: fontes.regular,
  },
  metricas: {
    backgroundColor: cores.superficie,
    borderRadius: 24,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  linhaMetrica: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },
  metrica: {
    flex: 1,
    color: cores.texto,
    fontSize: 16,
    fontFamily: fontes.regular,
  },
  valor: {
    color: cores.textoSecundario,
    fontSize: 18,
    fontFamily: fontes.seminegrito,
  },
  linhaSituacao: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 18,
  },
  salvo: {
    color: cores.sucesso,
    fontSize: 16,
    fontFamily: fontes.seminegrito,
  },
  data: {
    color: cores.textoSecundario,
    fontSize: 12,
    fontFamily: fontes.regular,
    textAlign: "center",
    marginTop: 6,
  },
  fechar: {
    position: "absolute",
    right: 20,
    zIndex: 1,
  },
});
