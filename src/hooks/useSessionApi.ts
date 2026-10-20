import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getRemoteSessions, sendSessions } from "../services/sessionsApi";

export function useSessionApi() {
  const queryClient = useQueryClient();
  const remoteQuery = useQuery({
    queryKey: ["sessions"],
    queryFn: getRemoteSessions,
  });

  const sendMutation = useMutation({
    mutationFn: sendSessions,
    // Também atualiza após falha: parte do lote pode ter chegado ao servidor.
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: ["sessions"],
      }),
  });

  return {
    remoteQuery,
    sendMutation,
  };
}
