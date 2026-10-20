import { create, isAxiosError } from "axios";

export const api = create({
  baseURL: process.env.EXPO_PUBLIC_API_URL?.trim() || "http://localhost:3001",
  timeout: 8000,
  headers: {
    "Content-Type": "application/json",
  },
});

export function apiErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    if (!error.response) {
      return "Não foi possível conectar ao servidor. Tente novamente quando ele estiver disponível.";
    }
    return "O servidor não conseguiu concluir a operação. Tente novamente.";
  }
  return error instanceof Error ? error.message : "Ocorreu um erro inesperado.";
}
