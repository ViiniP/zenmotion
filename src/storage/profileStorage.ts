import AsyncStorage from "@react-native-async-storage/async-storage";

import type { ProfileForm } from "../types/profile";
import { validateProfile } from "../utils/validators";

const PROFILE_KEY = "@zenmotion/profile";

export async function readProfile(): Promise<ProfileForm | null> {
  const stored = await AsyncStorage.getItem(PROFILE_KEY);

  if (stored === null) {
    return null;
  }

  // O armazenamento guarda texto. Depois do parse, verificamos sua estrutura.
  const data: unknown = JSON.parse(stored);
  if (
    typeof data !== "object" ||
    data === null ||
    !("name" in data) ||
    typeof data.name !== "string" ||
    !("email" in data) ||
    typeof data.email !== "string" ||
    !("goal" in data) ||
    typeof data.goal !== "string" ||
    !("duration" in data) ||
    typeof data.duration !== "string"
  ) {
    throw new Error("O perfil armazenado tem uma estrutura inválida.");
  }

  const profile = {
    name: data.name,
    email: data.email,
    goal: data.goal,
    duration: data.duration,
  };

  if (Object.keys(validateProfile(profile)).length > 0) {
    throw new Error("O perfil armazenado contém dados inválidos.");
  }

  return profile;
}

export async function writeProfile(profile: ProfileForm): Promise<void> {
  if (Object.keys(validateProfile(profile)).length > 0) {
    throw new Error("O perfil contém dados inválidos.");
  }

  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}
