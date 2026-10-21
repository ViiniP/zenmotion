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

export const useSessionStore = create<SessionState>()((set, get) => ({
  sessions: [],
  loadStatus: "idle",
  loadError: null,
  isSaving: false,
  saveError: null,

  loadSessions: async () => {
    if (get().loadStatus === "ready") return true;
    if (get().loadStatus === "loading") return false;
    set({
      loadStatus: "loading",
      loadError: null,
    });
    try {
      const sessoes = await readSessions();
      set({
        sessions: sessoes,
        loadStatus: "ready",
      });
      return true;
    } catch {
      set({
        loadStatus: "error",
        loadError: "Não foi possível carregar o histórico. Tente novamente.",
      });
      return false;
    }
  },

  saveSession: async (sessao) => {
    if (get().isSaving) return false;
    set({
      isSaving: true,
      saveError: null,
    });
    try {
      const historicoCarregado = await get().loadSessions();
      if (!historicoCarregado) {
        set({
          saveError: "Aguarde o histórico carregar e tente salvar novamente.",
        });
        return false;
      }
      if (get().sessions.some((salva) => salva.id === sessao.id)) return true;
      const sessoes = [sessao, ...get().sessions].sort(
        (a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt),
      );
      await writeSessions(sessoes);
      // Resultado e histórico só recebem o registro após a gravação.
      set({
        sessions: sessoes,
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
}));
