"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { ErrorMessage } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/services/authService";
import { formatCPF } from "@/utils";

export default function LoginMedicoPage() {
  const router = useRouter();
  const { user, entrar, carregando, erro } = useAuth();

  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loginErro, setLoginErro] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    if (user.tipoUsuario === "paciente") {
      router.replace("/dashboard");
    } else if (user.tipoUsuario === "profissionalSaude") {
      router.replace("/medico");
    } else if (user.tipoUsuario === "administrador") {
      router.replace("/admin");
    } else if (user.tipoUsuario === "ubs") {
      router.replace("/ubs");
    }
  }, [user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoginErro(null);

    try {
      const usuarioLogado = await entrar(cpf.replace(/\D/g, ""), senha);

      if (usuarioLogado.tipoUsuario !== "profissionalSaude") {
        await logout();
        setLoginErro("Esta área é exclusiva para profissionais de saúde.");
        return;
      }

      router.push("/medico");
    } catch {
      // erro tratado pelo hook
    }
  }

  return (
    <>
      <Header />

      <main
        id="main-content"
        className="min-h-[calc(100vh-124px)] bg-white flex items-center justify-center px-6 py-12"
      >
        <div className="w-full max-w-[1080px] grid grid-cols-1 lg:grid-cols-[1.35fr_0.9fr] gap-14 items-center">
          <section
            className="hidden lg:block relative w-full h-[355px] overflow-hidden"
            aria-label="Imagem informativa gov.br"
          >
            <Image
              src="/images/govbr-login.png"
              alt="Uma conta gov.br garante a identificação de cada cidadão que acessa os serviços digitais do governo"
              fill
              priority
              className="object-contain"
            />
          </section>

          <section className="w-full max-w-[360px] mx-auto">
            <div className="bg-white rounded-[8px] shadow-[0_16px_35px_rgba(0,0,0,0.20)] px-8 pt-8 pb-9">
              <div className="flex flex-col items-center">
                <Image
                  src="/images/logo-conecta.png"
                  alt="Conecta SUS+"
                  width={142}
                  height={58}
                  priority
                  className="object-contain mb-7"
                />

                <h1 className="font-poppins text-[30px] leading-none text-brand-800 font-normal text-center">
                  Login do <span className="font-extrabold">Médico</span>
                </h1>

                <p className="mt-2 mb-5 text-[12px] leading-tight font-semibold text-brand-800 text-center">
                  Acesse sua conta para visualizar consultas
                </p>
              </div>

              {erro && <ErrorMessage message={erro} />}
              {loginErro && <ErrorMessage message={loginErro} />}

              <form onSubmit={handleSubmit} noValidate className="flex flex-col">
                <label
                  htmlFor="cpf"
                  className="text-[12px] font-semibold text-neutral-800 mb-1"
                >
                  Número do CPF
                </label>

                <div className="relative mb-4">
                  <UserInputIcon />

                  <input
                    id="cpf"
                    type="text"
                    inputMode="numeric"
                    placeholder="Digite seu CPF"
                    value={formatCPF(cpf)}
                    onChange={(e) => setCpf(e.target.value)}
                    maxLength={14}
                    autoComplete="username"
                    required
                    className="w-full h-[34px] border border-neutral-500 bg-white pl-9 pr-3 text-[12px] italic text-neutral-700 placeholder:text-neutral-500 outline-none focus:ring-1 focus:ring-brand-700 focus:border-brand-700"
                  />
                </div>

                <label
                  htmlFor="senha"
                  className="text-[12px] font-semibold text-neutral-800 mb-1"
                >
                  Digite sua senha
                </label>

                <div className="relative">
                  <LockInputIcon />

                  <input
                    id="senha"
                    type={showPwd ? "text" : "password"}
                    placeholder="Digite sua senha atual"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="w-full h-[34px] border border-neutral-500 bg-white pl-9 pr-10 text-[12px] italic text-neutral-700 placeholder:text-neutral-500 outline-none focus:ring-1 focus:ring-brand-700 focus:border-brand-700"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    aria-label="Alternar visibilidade da senha"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-700"
                  >
                    <EyeIcon />
                  </button>
                </div>

                <div className="text-right mt-2 mb-8">
                  <Link
                    href="#"
                    className="text-[12px] text-brand-600 hover:underline"
                  >
                    Esqueci minha senha
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={carregando}
                  className="w-full h-[28px] rounded-full bg-brand-700 text-white text-[12px] font-bold flex items-center justify-center gap-2 hover:bg-brand-800 disabled:opacity-60"
                >
                  {carregando ? (
                    "Entrando..."
                  ) : (
                    <>
                      <SmallUserIcon />
                      Entrar
                    </>
                  )}
                </button>
              </form>

              <div className="text-center mt-5">
                <Link
                  href="#"
                  className="text-[12px] text-brand-700 underline underline-offset-2"
                >
                  Termo de Uso e Aviso de Privacidade
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function UserInputIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 12c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4Zm-7 8c.45-3.4 3.4-6 7-6s6.55 2.6 7 6H5Z" />
    </svg>
  );
}

function LockInputIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2Zm-7 0V7a2 2 0 1 1 4 0v2h-4Z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function SmallUserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-3 h-3"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 12c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4Zm-7 8c.45-3.4 3.4-6 7-6s6.55 2.6 7 6H5Z" />
    </svg>
  );
}