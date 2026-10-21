import { durationOptions, goalOptions } from "../constants/profile";
import type { ProfileErrors, ProfileForm } from "../types/profile";

export function validateProfile(form: ProfileForm): ProfileErrors {
  const erros: ProfileErrors = {};
  const nome = form.name.trim();
  const email = form.email.trim();

  if (!nome) {
    erros.name = "Informe seu nome.";
  }

  if (!email) {
    erros.email = "Informe seu e-mail.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    erros.email = "Digite um e-mail válido.";
  }

  if (!goalOptions.some((option) => option.value === form.goal)) {
    erros.goal = "Selecione um objetivo.";
  }

  if (!durationOptions.some((option) => option.value === form.duration)) {
    erros.duration = "Selecione uma duração válida.";
  }

  return erros;
}
