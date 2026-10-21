import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { ActivityCard } from "../../components/ActivityCard";
import { IconButton } from "../../components/IconButton";
import { LandscapeHeader } from "../../components/LandscapeHeader";
import { StatRow } from "../../components/StatRow";
import { cores, fontes } from "../../constants/theme";
import { useSessionStore } from "../../stores/useSessionStore";
import { useZenStore } from "../../stores/useZenStore";
import { sessionStats } from "../../utils/sessionStats";

export default function HomeScreen() {
  const perfil = useZenStore((estado) => estado.profile);
  const sessoes = useSessionStore((estado) => estado.sessions);
  const estadoCarregamento = useSessionStore((estado) => estado.loadStatus);
  const margensSeguras = useSafeAreaInsets();
  const estatisticas = sessionStats(sessoes);
  const agora = new Date();
  const saudacao =
    agora.getHours() < 12
      ? "Bom dia"
      : agora.getHours() < 18
        ? "Boa tarde"
        : "Boa noite";
  const dataFormatada = agora.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
  const data = dataFormatada[0].toUpperCase() + dataFormatada.slice(1);
  const duracao = Number(perfil?.duration ?? "60");

  return (
    <SafeAreaView
      edges={["left", "right"]}
      style={estilos.tela}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={estilos.conteudoRolagem}
      >
        <LandscapeHeader>
          <View
            style={[
              estilos.saudacao,
              {
                paddingTop: Math.max(margensSeguras.top + 20, 54),
              },
            ]}
          >
            <View style={estilos.textosSaudacao}>
              <Text style={estilos.data}>{data}</Text>
              <Text style={estilos.titulo}>{saudacao}</Text>
              {perfil && (
                <Text style={estilos.nome}>
                  {perfil.name.split(" ")[0]}, esse momento é seu.
                </Text>
              )}
            </View>
            <IconButton
              name="person-outline"
              label="Abrir perfil"
              onPress={() => router.navigate("/(tabs)/perfil")}
            />
          </View>
        </LandscapeHeader>
        <View style={estilos.conteudo}>
          <StatRow
            items={[
              {
                value: estadoCarregamento === "ready" ? estatisticas.points : "—",
                label: "pontos",
              },
              {
                value: estadoCarregamento === "ready" ? estatisticas.count : "—",
                label: "sessões",
              },
              {
                value: estadoCarregamento === "ready" ? estatisticas.minutes : "—",
                label: "minutos",
              },
            ]}
          />
          <Text style={estilos.tituloSecao}>Para agora</Text>
          <ActivityCard
            duration={duracao}
            onPress={() =>
              router.push({
                pathname: "/sessao/[atividade]",
                params: {
                  atividade: "equilibrio-zen",
                  duracao: String(duracao),
                },
              })
            }
          />
          <View style={estilos.atalhos}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.navigate("/(tabs)/historico")}
              style={({ pressed: pressionado }) => [
                estilos.atalho,
                estilos.azul,
                pressionado && estilos.pressionado,
              ]}
            >
              <Ionicons
                name="time-outline"
                size={28}
                color="#B9C5FF"
                accessible={false}
                aria-hidden
              />
              <Text style={estilos.tituloAtalho}>Seu histórico</Text>
              <Text style={estilos.descricaoAtalho}>Cada sessão conta</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.navigate("/(tabs)/perfil")}
              style={({ pressed: pressionado }) => [
                estilos.atalho,
                estilos.rosa,
                pressionado && estilos.pressionado,
              ]}
            >
              <Ionicons
                name="person-outline"
                size={28}
                color="#E8B0D0"
                accessible={false}
                aria-hidden
              />
              <Text style={estilos.tituloAtalho}>Seu perfil</Text>
              <Text style={estilos.descricaoAtalho}>No seu ritmo</Text>
            </Pressable>
          </View>
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
  conteudoRolagem: {
    paddingBottom: 28,
  },
  saudacao: {
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },
  textosSaudacao: {
    flex: 1,
    gap: 3,
  },
  data: {
    color: "#D6CDEF",
    fontFamily: fontes.seminegrito,
    fontSize: 15,
  },
  titulo: {
    color: cores.texto,
    fontFamily: fontes.titulo,
    fontSize: 36,
    lineHeight: 46,
  },
  nome: {
    color: "#D6CDEF",
    fontFamily: fontes.regular,
    fontSize: 14,
    marginTop: 5,
  },
  conteudo: {
    paddingHorizontal: 20,
    gap: 20,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },
  tituloSecao: {
    color: cores.texto,
    fontFamily: fontes.titulo,
    fontSize: 23,
    marginTop: 6,
  },
  atalhos: {
    flexDirection: "row",
    gap: 12,
  },
  atalho: {
    flex: 1,
    minHeight: 116,
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 7,
  },
  azul: {
    backgroundColor: cores.superficieAzul,
    borderColor: "#394372",
  },
  rosa: {
    backgroundColor: cores.superficiePessego,
    borderColor: "#60415F",
  },
  tituloAtalho: {
    color: cores.texto,
    fontFamily: fontes.negrito,
    fontSize: 17,
    marginTop: 5,
  },
  descricaoAtalho: {
    color: "#C3BED9",
    fontFamily: fontes.regular,
    fontSize: 12,
  },
  pressionado: {
    opacity: 0.75,
  },
});
