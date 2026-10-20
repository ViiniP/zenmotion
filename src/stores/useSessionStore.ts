import { create } from "zustand";

import { readSessions, writeSessions } from "../storage/sessionStorage";
import type { SessionRecord } from "../types/session";

type SessionState = {
  sessions: SessionRecord[];
  loadStatus: "idle" | "loading" | "ready" | "error";
  loadError: string | null;
  isSaving: boolean;
  saveError: string | null;
  loadSessions: () => Promise<boolean>;
  saveSession: (session: SessionRecord) => Promise<boolean>;
};

export const useSessionStore = create<SessionState>()((set, get) => {
  // Quem precisar do histórico durante a leitura aguarda a mesma operação.
  let loadPromise: Promise<boolean> | null = null;

  return {
    sessions: [],
    loadStatus: "idle",
    loadError: null,
    isSaving: false,
    saveError: null,

    loadSessions: async () => {
      if (get().loadStatus === "ready") return true;
      if (loadPromise) return loadPromise;
      set({
        loadStatus: "loading",
        loadError: null,
      });
      loadPromise = (async () => {
        try {
          const sessions = await readSessions();
          set({
            sessions,
            loadStatus: "ready",
          });
          return true;
        } catch {
          set({
            loadStatus: "error",
            loadError:
              "Não foi possível carregar o histórico. Tente novamente.",
          });
          return false;
        }
      })();
      try {
        return await loadPromise;
      } finally {
        loadPromise = null;
      }
    },

    saveSession: async (session) => {
      if (get().isSaving) return false;
      const record = {
        ...session,
      };
      set({
        isSaving: true,
        saveError: null,
      });
      try {
        // Nunca sobrescreve um histórico que ainda não conseguimos recuperar.
        if (!(await get().loadSessions())) throw new Error("Falha na leitura.");
        if (get().sessions.some((saved) => saved.id === record.id)) return true;
        const sessions = [record, ...get().sessions].sort(
          (a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt),
        );
        await writeSessions(sessions);
        // Resultado e histórico só recebem o registro após a gravação.
        set({
          sessions,
        });
        return true;
      } catch {
        set({
          saveError:
            "Não foi possível salvar a sessão. Seu resultado continua nesta tela. Tente novamente.",
        });
        return false;
      } finally {
        set({
          isSaving: false,
        });
      }
    },
  };
});
