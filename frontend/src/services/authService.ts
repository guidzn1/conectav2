import { api } from "./api";
import type { Paciente, ProfissionalSaude, Administrador, Ubs } from "@/types";

export type AuthUser = Paciente | ProfissionalSaude | Administrador | Ubs;

interface LoginResponse { token: string; user: AuthUser; }

export async function login(cpf: string, senha: string): Promise<AuthUser> {
  const data = await api.post<LoginResponse>("/auth/login", { cpf, senha });
  localStorage.setItem("conectasus_token", data.token);
  localStorage.setItem("conectasus_user",  JSON.stringify(data.user));
  return data.user;
}

export async function register(
  dados: Omit<AuthUser, "id" | "criadoEm"> & { senha: string }
): Promise<AuthUser> {
  const data = await api.post<LoginResponse>("/auth/register", dados);
  localStorage.setItem("conectasus_token", data.token);
  localStorage.setItem("conectasus_user",  JSON.stringify(data.user));
  return data.user;
}

export async function logout(): Promise<void> {
  localStorage.removeItem("conectasus_token");
  localStorage.removeItem("conectasus_user");
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = localStorage.getItem("conectasus_token");
  if (!token) return null;
  try {
    return await api.get<AuthUser>("/auth/me");
  } catch {
    localStorage.removeItem("conectasus_token");
    localStorage.removeItem("conectasus_user");
    return null;
  }
}

export async function forgotPassword(_cpf: string): Promise<void> {
  // TODO: POST /api/auth/forgot-password
}
