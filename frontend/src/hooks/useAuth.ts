"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login, logout, getCurrentUser, type AuthUser } from "@/services/authService";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .finally(() => setCarregando(false));
  }, []);

  const entrar = useCallback(async (cpf: string, senha: string) => {
    setCarregando(true);
    setErro(null);
    try {
      const u = await login(cpf, senha);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("conectasus_user", JSON.stringify(u));
      }
      setUser(u);
      return u;
    } catch (e) {
      setErro("CPF ou senha inválidos.");
      throw e;
    } finally {
      setCarregando(false);
    }
  }, []);

  const router = useRouter();
  const sair = useCallback(async () => {
    await logout();
    if (typeof window !== "undefined") {
      sessionStorage.clear();
      // Clear cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    }
    setUser(null);
    router.push("/");
  }, [router]);

  return { user, carregando, erro, entrar, sair, autenticado: !!user };
}

export function useRequireAuth(allowedTypes: ("paciente" | "administrador" | "profissionalSaude" | "ubs")[]) {
  const { user, carregando, sair } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!carregando) {
      if (!user) {
        router.replace("/login");
      } else if (!allowedTypes.includes(user.tipoUsuario)) {
        if (user.tipoUsuario === "paciente") router.replace("/dashboard");
        else if (user.tipoUsuario === "profissionalSaude") router.replace("/medico");
        else if (user.tipoUsuario === "administrador") router.replace("/admin");
        else if (user.tipoUsuario === "ubs") router.replace("/ubs");
      }
    }
  }, [user, carregando, router, allowedTypes]);

  return { user, carregando, sair };
}
