"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button, Input, ErrorMessage } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/services/authService";
import { formatCPF } from "@/utils";

export default function LoginMedicoPage() {
  const router = useRouter();
  const { user, entrar, carregando, erro } = useAuth();
  const [cpf, setCpf]       = useState("");
  const [senha, setSenha]   = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loginErro, setLoginErro] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      if (user.tipoUsuario === "paciente") router.replace("/dashboard");
      else if (user.tipoUsuario === "profissionalSaude") router.replace("/medico");
      else if (user.tipoUsuario === "administrador") router.replace("/admin");
      else if (user.tipoUsuario === "ubs") router.replace("/ubs");
    }
  }, [user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const u = await entrar(cpf.replace(/\D/g, ""), senha);
      if (u.tipoUsuario !== "profissionalSaude") {
        await logout();
        setLoginErro("Esta área é exclusiva para profissionais de saúde.");
        return;
      }
      router.push("/medico");
    } catch { /* erro no hook */ }
  }

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen bg-neutral-50 flex items-center py-12">
        <div className="container-app grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

          {/* Banner */}
          <div className="hidden md:flex flex-col justify-center bg-brand-700 rounded-cardLg p-10 h-80 gap-4">
            <p className="text-white/60 text-sm font-semibold uppercase tracking-wider">gov.br</p>
            <p className="text-white text-2xl font-poppins font-bold leading-snug">
              Acesse sua agenda<br />e gerencie seus<br />pacientes com<br />facilidade.
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-cardLg shadow-modal p-8 w-full max-w-md mx-auto">
            <div className="flex flex-col items-center mb-6">
              <div className="bg-brand-700 text-white font-poppins font-black rounded-card px-4 py-2 text-xl mb-2">
                CONECTA <span className="text-brand-300">SUS+</span>
              </div>
              <h1 className="font-poppins text-2xl font-bold text-brand-800 mt-3">
                Login do <strong>Médico</strong>
              </h1>
              <p className="text-brand-500 text-sm">Acesse sua conta profissional</p>
            </div>

            {erro && <ErrorMessage message={erro} />}
            {loginErro && <ErrorMessage message={loginErro} />}

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 mt-4">
              <Input
                label="Número do CPF"
                type="text" inputMode="numeric"
                placeholder="Digite seu CPF"
                value={formatCPF(cpf)}
                onChange={(e) => setCpf(e.target.value)}
                maxLength={14} required
                leftIcon={<span>👤</span>}
              />
              <Input
                label="Senha"
                type={showPwd ? "text" : "password"}
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                leftIcon={<span>🔒</span>}
                rightIcon={<span>{showPwd ? "🙈" : "👁"}</span>}
                onRightIconClick={() => setShowPwd((v) => !v)}
              />
              <Button type="submit" fullWidth loading={carregando} size="lg">Entrar</Button>
            </form>

            <p className="text-center mt-4">
              <Link href="#" className="text-xs text-neutral-400 hover:underline">
                Termo de Uso e Aviso de Privacidade
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
