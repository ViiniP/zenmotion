import { durationOptions, goalOptions } from "../constants/profile";
import type { ProfileErrors, ProfileForm } from "../types/profile";

export function validateProfile(form: ProfileForm): ProfileErrors {
  const errors: ProfileErrors = {};
  const name = form.name.trim();
  const email = form.email.trim();

  if (!name) {
    errors.name = "Informe seu nome.";
  } else if (name.length < 3) {
    errors.name = "O nome deve ter pelo menos 3 caracteres.";
  }

  if (!email) {
    errors.email = "Informe seu e-mail.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Digite um e-mail válido.";
  }

  if (!goalOptions.some((option) => option.value === form.goal)) {
    errors.goal = "Selecione um objetivo.";
  }

  if (!durationOptions.some((option) => option.value === form.duration)) {
    errors.duration = "Selecione uma duração válida.";
  }

  return errors;
}
