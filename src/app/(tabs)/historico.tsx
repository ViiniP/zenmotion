import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton } from "../../components/AppButton";
import { HistoryStatus } from "../../components/HistoryStatus";
import { SessionSync } from "../../components/SessionSync";
import { conteudoTela } from "../../components/Screen";
import { StatRow } from "../../components/StatRow";
import { cores, fontes } from "../../constants/theme";
import { useSessionStore } from "../../stores/useSessionStore";
import { formatSessionDate, formatStableTime } from "../../utils/sessionRecord";
import { sessionStats } from "../../utils/sessionStats";

export default function HistoryScreen() {
  const sessoes = useSessionStore((estado) => estado.sessions);
  const estadoCarregamento = useSessionStore((estado) => estado.loadStatus);
  const estatisticas = sessionStats(sessoes);

  if (estadoCarregamento !== "ready") return <HistoryStatus />;

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={estilos.tela}
    >
      <FlatList
        data={sessoes}
        keyExtractor={(sessao) => sessao.id}
        contentContainerStyle={estilos.conteiner}
        ListHeaderComponent={
          <View style={estilos.cabecalho}>
            <Text style={estilos.titulo}>Histórico</Text>
            <Text style={estilos.descricao}> Seu progresso, uma pausa de cada vez.</Text>
            {sessoes.length > 0 && (
              <>
                <View style={estilos.destaques}>
                  <LinearGradient
                    colors={["#47357E", "#302663"]}
                    style={estilos.destaque}
                  >
                    <Text style={estilos.rotuloDestaque}>
                      Estabilidade média
                    </Text>
                    <Text style={estilos.valorDestaque}>{estatisticas.average}%</Text>
                  </LinearGradient>
                  <LinearGradient
                    colors={["#68448D", "#3D2A67"]}
                    style={estilos.destaque}
                  >
                    <Text style={estilos.rotuloDestaque}>Melhor pontuação</Text>
                    <Text style={estilos.valorDestaque}>{estatisticas.best}</Text>
                  </LinearGradient>
                </View>
                <StatRow
                  items={[
                    {
                      value: estatisticas.count,
                      label: "sessões",
                    },
                    {
                      value: estatisticas.minutes,
                      label: "minutos",
                    },
                    {
                      value: estatisticas.points,
                      label: "pontos",
                    },
                  ]}
                />
              </>
            )}
            {/* Zustand */}
            <SessionSync sessions={sessoes} />
            {sessoes.length > 0 && (
              <Text style={estilos.rotuloSecao}>SESSÕES RECENTES</Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={estilos.estadoVazio}>
            <Image
              source={require("../../../assets/images/zen-orb.png")}
              style={estilos.esferaEstadoVazio}
              accessible={false}
            />
            <Text style={estilos.tituloEstadoVazio}>Seu ritmo começa aqui</Text>
            <Text style={estilos.descricaoEstadoVazio}>
              Conclua sua primeira sessão para acompanhar cada conquista.
            </Text>
            <AppButton
              title="Escolher atividade"
              onPress={() => router.navigate("/(tabs)/atividades")}
            />
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Equilíbrio Zen, ${formatSessionDate(item.completedAt)}, ${item.averageStability} pontos. Ver resultado`}
            onPress={() =>
              router.push({
                pathname: "/resultado/[id]",
                params: {
                  id: item.id,
                },
              })
            }
            style={({ pressed: pressionado }) => [estilos.cartao, pressionado && estilos.pressionado]}
          >
            <Image
              source={require("../../../assets/images/zen-orb.png")}
              style={estilos.esfera}
              accessible={false}
            />
            <View style={estilos.textosCartao}>
              <Text style={estilos.tituloCartao}>Equilíbrio Zen</Text>
              <Text style={estilos.data}>
                {formatSessionDate(item.completedAt)}
              </Text>
              <Text style={estilos.detalhes}>
                {item.durationSeconds} s · {formatStableTime(item.stableMs)} na
                faixa
              </Text>
            </View>
            <Text style={estilos.pontos}>{item.averageStability}</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  conteiner: {
    ...conteudoTela,
    gap: 12,
  },
  titulo: {
    color: cores.texto,
    fontSize: 34,
    fontFamily: fontes.titulo,
  },
  descricao: {
    color: cores.textoSecundario,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fontes.regular,
  },
  cabecalho: {
    gap: 16,
  },
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: 22,
    padding: 18,
    gap: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  pressionado: {
    opacity: 0.75,
  },
  tituloCartao: {
    color: cores.texto,
    fontSize: 16,
    fontFamily: fontes.negrito,
  },
  pontos: {
    color: cores.texto,
    fontSize: 25,
    fontFamily: fontes.titulo,
  },
  data: {
    color: cores.textoSecundario,
    fontSize: 12,
    fontFamily: fontes.regular,
  },
  detalhes: {
    color: "#BFB6D4",
    fontSize: 12,
    lineHeight: 18,
    fontFamily: fontes.regular,
  },
  textosCartao: {
    flex: 1,
    gap: 3,
  },
  esfera: {
    width: 40,
    height: 40,
  },
  destaques: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  destaque: {
    flex: 1,
    borderRadius: 24,
    padding: 18,
    gap: 8,
    justifyContent: "space-between",
  },
  rotuloDestaque: {
    fontSize: 14,
    lineHeight: 20,
    color: "#DED3F1",
    fontFamily: fontes.regular,
  },
  valorDestaque: {
    color: cores.texto,
    fontSize: 34,
    fontFamily: fontes.titulo,
  },
  rotuloSecao: {
    color: cores.textoSecundario,
    fontSize: 12,
    letterSpacing: 1,
    fontFamily: fontes.negrito,
    marginTop: 8,
  },
  estadoVazio: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: cores.superficie,
    gap: 16,
  },
  esferaEstadoVazio: {
    width: 76,
    height: 76,
    alignSelf: "center",
  },
  tituloEstadoVazio: {
    color: cores.texto,
    fontSize: 22,
    fontFamily: fontes.titulo,
    textAlign: "center",
  },
  descricaoEstadoVazio: {
    color: cores.textoSecundario,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fontes.regular,
    textAlign: "center",
  },
});
