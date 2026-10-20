import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "../constants/theme";
import { useSessionApi } from "../hooks/useSessionApi";
import { apiErrorMessage } from "../services/api";
import type { SessionRecord } from "../types/session";
import { sameSession } from "../utils/sessionRecord";
import { AppButton } from "./AppButton";
import { IconButton } from "./IconButton";

export function SessionSync({ sessions }: { sessions: SessionRecord[] }) {
  const { remoteQuery, sendMutation } = useSessionApi();
  const remoteSessions = new Map(remoteQuery.data?.map((session) => [session.id, session]));
  const pendingCount = sessions.filter((session) => {
    const remote = remoteSessions.get(session.id);
    return !remote || !sameSession(session, remote);
  }).length;
  const busy = remoteQuery.isFetching || sendMutation.isPending;

  return (
    <View style={styles.card}>
      <View style={styles.heading}>
        <Text style={styles.title}>Envio de sessões</Text>
        <IconButton name="refresh-outline" label="Atualizar consulta" disabled={busy} onPress={() => { void remoteQuery.refetch(); }} />
      </View>
      <Text style={styles.description}>
        Seu histórico fica salvo no aparelho e pode ser consultado sem conexão.
      </Text>
      {remoteQuery.isLoading && <ActivityIndicator color={colors.primary} />}
      {remoteQuery.isFetching && (
        <Text style={styles.description}>Consultando sessões no servidor...</Text>
      )}
      {remoteQuery.data && (
        <Text style={styles.description}>
          Última consulta: {remoteQuery.data.length} sessões no servidor.
          {"\n"}{pendingCount} deste aparelho ainda não confirmadas nessa consulta.
        </Text>
      )}
      {remoteQuery.isError && !sendMutation.isError && (
        <Text accessibilityRole="alert" style={styles.error}>
          {apiErrorMessage(remoteQuery.error)} Seus registros locais continuam disponíveis.
        </Text>
      )}
      {sendMutation.isError && (
        <Text accessibilityRole="alert" style={styles.error}>
          {apiErrorMessage(sendMutation.error)} Seus registros estão salvos no aparelho. Você pode repetir o envio.
        </Text>
      )}
      {sendMutation.isSuccess && (
        <Text accessibilityLiveRegion="polite" style={styles.success}>
          {sendMutation.data === 0
            ? "As sessões selecionadas já estavam no servidor."
            : `${sendMutation.data} sessões enviadas nesta tentativa.`}
        </Text>
      )}
      <AppButton
        title={sendMutation.isPending ? "Enviando..." : "Enviar sessões salvas"}
        onPress={() => sendMutation.mutate([...sessions])}
        disabled={busy || sessions.length === 0}
        variant="secondary"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#292336", borderWidth: 1, borderColor: "#594253", borderRadius: 24, padding: 18, gap: 12 },
  heading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  title: { color: "#F1C2AA", fontSize: 18, fontFamily: fonts.bold, flex: 1 },
  description: { color: "#C5BBD1", fontSize: 14, lineHeight: 21, fontFamily: fonts.regular },
  error: { color: colors.error, fontSize: 14, lineHeight: 21, fontFamily: fonts.regular },
  success: { color: colors.success, fontSize: 14, lineHeight: 21, fontFamily: fonts.medium },
});
