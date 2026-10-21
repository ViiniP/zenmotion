import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { cores, fontes } from "../constants/theme";
import { useZenSession } from "../hooks/useZenSession";
import { useSessionStore } from "../stores/useSessionStore";
import { averageStability } from "../utils/sessionProgress";
import { AppButton } from "./AppButton";
import { IconButton } from "./IconButton";
import { conteudoTela } from "./Screen";
import { StatRow } from "./StatRow";

type ZenSessionProps = {
  duration: number;
  onExit: () => void;
  onSaved: (id: string) => void;
};

export function ZenSession({ duration, onExit, onSaved }: ZenSessionProps) {
  const sessao = useZenSession(duration);
  const salvarSessao = useSessionStore((estado) => estado.saveSession);
  const salvando = useSessionStore((estado) => estado.isSaving);
  const erroSalvamento = useSessionStore((estado) => estado.saveError);
  const [tentouSalvar, definirTentouSalvar] = useState(false);
  const componenteMontado = useRef(true);

  useEffect(() => {
    componenteMontado.current = true;
    return () => {
      componenteMontado.current = false;
    };
  }, []);

  async function salvarResultado() {
    if (!sessao.result) return;
    definirTentouSalvar(true);
    const salvo = await salvarSessao(sessao.result);
    // Voltar pelo botão do sistema durante a gravação não deve abrir outra tela.
    if (salvo && componenteMontado.current) onSaved(sessao.result.id);
  }
  const segundosRestantes = Math.max(
    0,
    Math.ceil(duration - sessao.progress.elapsedMs / 1000),
  );
  const cronometro = `${Math.floor(segundosRestantes / 60)
    .toString()
    .padStart(2, "0")}:${(segundosRestantes % 60).toString().padStart(2, "0")}`;
  const media = averageStability(sessao.progress);
  const finalizada = sessao.status === "finished";
  const verificando = sessao.status === "checking";

  let textoBotao = "Começar";
  if (sessao.status === "paused") textoBotao = "Retomar";
  if (sessao.message) textoBotao = "Tentar novamente";
  if (verificando) textoBotao = "Verificando...";
  if (finalizada)
    textoBotao = salvando ? "Salvando..." : "Salvar e ver resultado";

  let instrucao =
    "Segure o celular deitado, com a tela para cima, e mantenha a esfera no centro.";
  if (sessao.status === "checking")
    instrucao = "Verificando permissão e disponibilidade dos sensores...";
  if (sessao.status === "running") {
    instrucao = !sessao.reading
      ? "Aguardando leituras dos sensores..."
      : sessao.reading.inRange
        ? "Na faixa! Mantenha a posição."
        : "Ajuste a inclinação e mova o aparelho devagar.";
  }
  if (sessao.status === "paused")
    instrucao = "Sessão pausada. Retome quando estiver pronto.";
  if (finalizada) instrucao = "Sessão concluída!";

  return (
    <LinearGradient
      colors={["#191630", "#332766", "#78508A"]}
      style={estilos.tela}
    >
      <Image
        source={require("../../assets/images/zen-landscape.png")}
        style={estilos.paisagem}
        accessible={false}
      />
      <SafeAreaView
        style={estilos.tela}
        edges={["top", "left", "right", "bottom"]}
      >
        <ScrollView
          contentContainerStyle={estilos.conteiner}
          showsVerticalScrollIndicator={false}
        >
          <View style={estilos.cabecalho}>
            <IconButton
              name="close-outline"
              label={finalizada ? "Sair sem salvar" : "Voltar às atividades"}
              onPress={onExit}
              disabled={salvando}
            />
            <Text style={estilos.titulo}>Equilíbrio Zen</Text>
            <View style={estilos.espacoCabecalho} />
          </View>
          <Text
            accessibilityLiveRegion="polite"
            style={estilos.descricao}
          >
            {instrucao}
          </Text>

          <View
            accessible={false}
            style={estilos.areaEquilibrio}
          >
            <View style={estilos.anelInterno} />
            <View style={estilos.alvo} />
            <View
              style={[
                estilos.esfera,
                sessao.reading && !sessao.reading.inRange && estilos.foraDaFaixa,
                {
                  transform: [
                    {
                      translateX: (sessao.reading?.offsetX ?? 0) * 90 - 14,
                    },
                    {
                      translateY: (sessao.reading?.offsetY ?? 0) * 90 - 14,
                    },
                  ],
                },
              ]}
            >
              <Image
                source={require("../../assets/images/zen-orb.png")}
                style={estilos.imagemEsfera}
                accessible={false}
              />
            </View>
          </View>

          <Text
            accessibilityLabel={`Tempo restante: ${segundosRestantes} segundos`}
            style={estilos.cronometro}
          >
            {cronometro}
          </Text>
          <Text style={estilos.duracao}>de {duration} segundos</Text>

          <StatRow
            items={[
              {
                value: sessao.reading ? `${sessao.reading.stability}%` : "—",
                label: "estabilidade agora",
              },
              {
                value: `${(sessao.progress.stableMs / 1000).toFixed(1).replace(".", ",")} s`,
                label: "na faixa",
              },
            ]}
          />
          <Text style={estilos.media}>
            {finalizada
              ? `Pontuação: ${media} de 100`
              : `Média: ${sessao.progress.elapsedMs > 0 ? `${media}%` : "—"}`}
          </Text>

          {sessao.message && (
            <Text
              accessibilityRole="alert"
              style={estilos.erro}
            >
              {sessao.message}
            </Text>
          )}
          {finalizada && tentouSalvar && erroSalvamento && (
            <Text
              accessibilityRole="alert"
              style={estilos.erro}
            >
              {erroSalvamento}
            </Text>
          )}

          {sessao.status === "running" ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Pausar"
              onPress={sessao.pause}
              style={({ pressed: pressionado }) => [
                estilos.pausar,
                pressionado && estilos.pressionado,
              ]}
            >
              <Ionicons
                name="pause"
                size={30}
                color={cores.fundo}
                accessible={false}
                aria-hidden
              />
            </Pressable>
          ) : (
            <AppButton
              title={textoBotao}
              onPress={finalizada ? salvarResultado : sessao.start}
              disabled={salvando || verificando}
            />
          )}
          {sessao.status === "paused" && (
            <AppButton
              title="Recomeçar"
              variant="secondary"
              onPress={sessao.reset}
            />
          )}
          {sessao.status !== "running" && (
            <AppButton
              title={finalizada ? "Sair sem salvar" : "Voltar às atividades"}
              onPress={onExit}
              disabled={salvando}
              variant="text"
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
  },
  conteiner: {
    ...conteudoTela,
    paddingTop: 12,
    gap: 12,
  },
  cabecalho: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  espacoCabecalho: {
    width: 48,
  },
  titulo: {
    flex: 1,
    color: cores.texto,
    fontSize: 19,
    fontFamily: fontes.titulo,
    textAlign: "center",
  },
  descricao: {
    color: "#D7CFE9",
    fontFamily: fontes.regular,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    minHeight: 44,
  },
  duracao: {
    color: "#C8BDDE",
    fontFamily: fontes.regular,
    fontSize: 15,
    textAlign: "center",
    marginTop: -8,
  },
  paisagem: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 220,
    opacity: 0.24,
  },
  anelInterno: {
    width: "72%",
    aspectRatio: 1,
    position: "absolute",
    borderWidth: 1,
    borderColor: "#FFFFFF16",
    borderRadius: 999,
  },
  areaEquilibrio: {
    width: "100%",
    maxWidth: 220,
    aspectRatio: 1,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#FFFFFF20",
    borderRadius: 130,
    backgroundColor: "#FFFFFF06",
    justifyContent: "center",
    alignItems: "center",
  },
  alvo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: cores.primaria,
    borderStyle: "dashed",
  },
  esfera: {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "transparent",
  },
  imagemEsfera: {
    width: 36,
    height: 36,
    left: -4,
    top: -4,
  },
  foraDaFaixa: {
    backgroundColor: "#FF8C9666",
  },
  cronometro: {
    color: cores.texto,
    fontSize: 56,
    fontFamily: fontes.regular,
    textAlign: "center",
  },
  media: {
    color: "#E2D7EF",
    fontFamily: fontes.seminegrito,
    fontSize: 14,
    textAlign: "center",
  },
  erro: {
    color: "#FFBBC2",
    fontFamily: fontes.seminegrito,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  pausar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: cores.primaria,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  pressionado: {
    opacity: 0.75,
  },
});
