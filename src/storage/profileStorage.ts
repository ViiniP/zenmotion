import AsyncStorage from "@react-native-async-storage/async-storage";

import type { ProfileForm } from "../types/profile";

const CHAVE_PERFIL = "@zenmotion/profile";

export async function readProfile(): Promise<ProfileForm | null> {
  const textoSalvo = await AsyncStorage.getItem(CHAVE_PERFIL);

  if (textoSalvo === null) {
    return null;
  }

  return JSON.parse(textoSalvo);
}

export async function writeProfile(perfil: ProfileForm): Promise<void> {
  // O formulário já foi validado na tela antes de chegar aqui.
  await AsyncStorage.setItem(CHAVE_PERFIL, JSON.stringify(perfil));
}
