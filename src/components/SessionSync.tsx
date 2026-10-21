import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { cores, fontes } from "../constants/theme";
import { useSessionApi } from "../hooks/useSessionApi";
import { apiErrorMessage } from "../services/api";
import type { SessionRecord } from "../types/session";
import { AppButton } from "./AppButton";
import { IconButton } from "./IconButton";

export function SessionSync({ sessions }: { sessions: SessionRecord[] }) {
  const { remoteQuery: consultaRemota, sendMutation: envioSessoes } = useSessionApi();
  const desabilitado = consultaRemota.isFetching || envioSessoes.isPending;

  return (
    <View style={estilos.cartao}>
      <View style={estilos.cabecalhoSecao}>
        <Text style={estilos.titulo}>Envio de sessões</Text>
        <IconButton
          name="refresh-outline"
          label="Atualizar consulta"
          disabled={desabilitado}
          onPress={() => {
            void consultaRemota.refetch();
          }}
        />
      </View>
      <Text style={estilos.descricao}>
        Seu histórico fica salvo no aparelho e pode ser consultado sem conexão.
      </Text>
      {consultaRemota.isLoading && <ActivityIndicator color={cores.primaria} />}
      {consultaRemota.isFetching && (
        <Text style={estilos.descricao}>
          Consultando sessões no servidor...
        </Text>
      )}
      {consultaRemota.data && (
        <Text style={estilos.descricao}>
          Última consulta: {consultaRemota.data.length} sessões no servidor.
        </Text>
      )}
      {consultaRemota.isError && !envioSessoes.isError && (
        <Text
          accessibilityRole="alert"
          style={estilos.erro}
        >
          {apiErrorMessage(consultaRemota.error)} Seus registros locais continuam
          disponíveis.
        </Text>
      )}
      {envioSessoes.isError && (
        <Text
          accessibilityRole="alert"
          style={estilos.erro}
        >
          {apiErrorMessage(envioSessoes.error)} Seus registros estão salvos no
          aparelho. Você pode repetir o envio.
        </Text>
      )}
      {envioSessoes.isSuccess && (
        <Text
          accessibilityLiveRegion="polite"
          style={estilos.sucesso}
        >
          {envioSessoes.data === 0
            ? "As sessões selecionadas já estavam no servidor."
            : `${envioSessoes.data} sessões enviadas nesta tentativa.`}
        </Text>
      )}
      <AppButton
        title={envioSessoes.isPending ? "Enviando..." : "Enviar sessões salvas"}
        onPress={() => envioSessoes.mutate([...sessions])}
        disabled={desabilitado || sessions.length === 0}
        variant="secondary"
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    backgroundColor: "#292336",
    borderWidth: 1,
    borderColor: "#594253",
    borderRadius: 24,
    padding: 18,
    gap: 12,
  },
  cabecalhoSecao: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  titulo: {
    color: "#F1C2AA",
    fontSize: 18,
    fontFamily: fontes.negrito,
    flex: 1,
  },
  descricao: {
    color: "#C5BBD1",
    fontSize: 14,
    lineHeight: 21,
    fontFamily: fontes.regular,
  },
  erro: {
    color: cores.erro,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: fontes.regular,
  },
  sucesso: {
    color: cores.sucesso,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: fontes.seminegrito,
  },
});
