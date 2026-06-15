"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button, Input, ErrorMessage } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { formatCPF } from "@/utils";

export default function LoginPage() {
  const router = useRouter();
  const { user, entrar, carregando, erro } = useAuth();
  const [cpf, setCpf]       = useState("");
  const [senha, setSenha]   = useState("");
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.tipoUsuario === "paciente") router.replace("/dashboard");
      else if (user.tipoUsuario === "profissionalSaude") router.replace("/medico");
      else if (user.tipoUsuario === "administrador") router.replace("/admin");
      else if (user.tipoUsuario === "ubs") router.replace("/ubs");
    }
  }, [user, router]);
  const [erros, setErros]   = useState<{ cpf?: string; senha?: string }>({});

  function validate(): boolean {
    const e: typeof erros = {};
    if (cpf.replace(/\D/g, "").length !== 11) e.cpf = "Informe um CPF válido com 11 dígitos.";
    if (senha.length < 6) e.senha = "A senha deve ter ao menos 6 caracteres.";
    setErros(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    try {
      const u = await entrar(cpf.replace(/\D/g, ""), senha);
      if (u.tipoUsuario === "profissionalSaude") router.push("/medico");
      else if (u.tipoUsuario === "administrador") router.push("/admin");
      else if (u.tipoUsuario === "ubs") router.push("/ubs");
      else router.push("/dashboard");
    } catch { /* erro tratado no hook */ }
  }

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen bg-neutral-50 flex items-center py-12">
        <div className="container-app grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

          {/* Lado esquerdo — gov.br banner */}
          <div
            className="hidden md:flex flex-col justify-center items-start bg-brand-700 rounded-cardLg p-10 h-80 gap-4"
            aria-hidden="true"
          >
            <p className="text-white/60 text-sm font-semibold uppercase tracking-wider">gov.br</p>
            <p className="text-white text-2xl font-poppins font-bold leading-snug">
              Uma <span className="underline">conta gov.br</span><br />
              garante a identificação<br />
              de cada cidadão que acessa<br />
              os serviços digitais do governo
            </p>
          </div>

          {/* Formulário */}
          <div className="bg-white rounded-cardLg shadow-modal p-8 w-full max-w-md mx-auto">
            {/* Logo */}
            <div className="flex flex-col items-center mb-6">
              <div className="bg-brand-700 text-white font-poppins font-black rounded-card px-4 py-2 text-xl mb-2">
                CONECTA <span className="text-brand-300">SUS+</span>
              </div>
              <h1 className="font-poppins text-2xl font-bold text-brand-800 mt-3">
                Login do <strong>Paciente</strong>
              </h1>
              <p className="text-brand-500 text-sm">Acesse sua conta para agendar consultas</p>
            </div>

            {erro && <ErrorMessage message={erro} />}

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 mt-4">
              <Input
                label="Número do CPF"
                type="text"
                inputMode="numeric"
                placeholder="Digite seu CPF"
                value={formatCPF(cpf)}
                onChange={(e) => setCpf(e.target.value)}
                erro={erros.cpf}
                maxLength={14}
                autoComplete="username"
                required
                leftIcon={<span aria-hidden="true">👤</span>}
              />

              <Input
                label="Digite sua senha"
                type={showPwd ? "text" : "password"}
                placeholder="Digite sua senha atual"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                erro={erros.senha}
                autoComplete="current-password"
                required
                leftIcon={<span aria-hidden="true">🔒</span>}
                rightIcon={<span aria-hidden="true">{showPwd ? "🙈" : "👁"}</span>}
                onRightIconClick={() => setShowPwd((v) => !v)}
              />

              <div className="text-right -mt-2">
                <Link href="/login/esqueci-senha" className="text-brand-500 text-xs hover:underline">
                  Esqueci minha senha
                </Link>
              </div>

              <Button type="submit" fullWidth loading={carregando} size="lg">
                Entrar
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Link href="/cadastro" className="text-sm text-brand-600 hover:underline">
                Não tem conta? Cadastre-se
              </Link>
            </div>

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
