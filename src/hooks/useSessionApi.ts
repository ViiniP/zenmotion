import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getRemoteSessions, sendSessions } from "../services/sessionsApi";

const remoteSessionsKey = ["sessions", "remote"] as const;

export function useSessionApi() {
  const queryClient = useQueryClient();
  const remoteQuery = useQuery({
    queryKey: remoteSessionsKey,
    queryFn: ({ signal }) => getRemoteSessions(signal),
  });

  const sendMutation = useMutation({
    mutationFn: sendSessions,
    // Também atualiza após falha: parte do lote pode ter chegado ao servidor.
    onSettled: () => queryClient.invalidateQueries({ queryKey: remoteSessionsKey }),
  });

  return { remoteQuery, sendMutation };
}
