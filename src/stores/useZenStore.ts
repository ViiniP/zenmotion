import { create } from "zustand";

import { readProfile, writeProfile } from "../storage/profileStorage";
import type { ProfileForm } from "../types/profile";

type ZenState = {
  profile: ProfileForm | null;
  loadStatus: "idle" | "loading" | "ready" | "error";
  isSaving: boolean;
  storageError: string | null;
  loadProfile: () => Promise<void>;
  saveProfile: (profile: ProfileForm) => Promise<boolean>;
};

export const useZenStore = create<ZenState>()((set, get) => ({
  profile: null,
  loadStatus: "idle",
  isSaving: false,
  storageError: null,

  loadProfile: async () => {
    // Evita leituras duplicadas quando o layout é montado novamente.
    if (get().loadStatus === "loading" || get().loadStatus === "ready") {
      return;
    }

    set({
      loadStatus: "loading",
      storageError: null,
    });
    try {
      const perfil = await readProfile();
      set({
        profile: perfil,
        loadStatus: "ready",
      });
    } catch {
      set({
        loadStatus: "error",
        storageError: "Não foi possível carregar seu perfil. Tente novamente.",
      });
    }
  },

  saveProfile: async (perfil) => {
    if (get().isSaving || get().loadStatus !== "ready") {
      return false;
    }

    set({
      isSaving: true,
      storageError: null,
    });
    try {
      await writeProfile(perfil);
      // Só compartilha o novo perfil depois de confirmar a gravação local.
      set({
        profile: perfil,
        isSaving: false,
      });
      return true;
    } catch {
      set({
        isSaving: false,
        storageError: "Não foi possível salvar seu perfil. Tente novamente.",
      });
      return false;
    }
  },
}));
