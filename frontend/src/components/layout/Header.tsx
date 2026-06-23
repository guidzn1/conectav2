"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

type HeaderLink = {
  href: string;
  label: string;
};

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, sair } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isHome = pathname === "/";
  const isMedicoArea = pathname.startsWith("/medico");
  const isPacienteArea =
    pathname.startsWith("/dashboard") || pathname.startsWith("/agendamento");
  const isLoginPaciente = pathname === "/login";
  const isLoginMedico = pathname === "/medico/login";

  const medicoHref =
    user?.tipoUsuario === "profissionalSaude" ? "/medico" : "/medico/login";

  const pageInfo = useMemo(() => {
    if (pathname === "/") {
      return {
        title: "Conecta Sus+",
        subtitle: "Agendamento de consultas",
      };
    }

    if (pathname === "/login") {
      return {
        title: "Login do Paciente",
        subtitle: "Acesse sua conta para agendar consultas",
      };
    }

    if (pathname === "/medico/login") {
      return {
        title: "Login do Médico",
        subtitle: "Acesse sua conta para visualizar consultas",
      };
    }

    if (pathname === "/dashboard") {
      return {
        title: "Meu Painel",
        subtitle: "Gerencie suas consultas",
      };
    }

    if (pathname === "/dashboard/historico") {
      return {
        title: "Histórico",
        subtitle: "Consultas anteriores e canceladas",
      };
    }

    if (pathname === "/dashboard/perfil") {
      return {
        title: "Meu Perfil",
        subtitle: "Dados da sua conta",
      };
    }

    if (pathname.startsWith("/agendamento")) {
      return {
        title: "Agendamento",
        subtitle: "Escolha especialidade, unidade e horário",
      };
    }

    if (pathname === "/medico") {
      return {
        title: "Minha Agenda",
        subtitle: "Pacientes agendados por data",
      };
    }

    if (pathname === "/medico/consultas") {
      return {
        title: "Consultas",
        subtitle: "Acompanhe seus atendimentos",
      };
    }

    if (pathname === "/medico/horarios") {
      return {
        title: "Meus Horários",
        subtitle: "Grade de disponibilidade",
      };
    }

    return {
      title: "Conecta Sus+",
      subtitle: "Agendamento de consultas",
    };
  }, [pathname]);

  const menuLinks = useMemo<HeaderLink[]>(() => {
    if (isMedicoArea) {
      return [
        { href: "/medico", label: "Minha Agenda" },
        { href: "/medico/consultas", label: "Consultas" },
        { href: "/medico/horarios", label: "Meus Horários" },
        { href: "/", label: "Início" },
      ];
    }

    if (isPacienteArea) {
      return [
        { href: "/dashboard", label: "Meu Painel" },
        { href: "/agendamento/especialidade", label: "Agendar Consulta" },
        { href: "/dashboard/historico", label: "Histórico" },
        { href: "/dashboard/perfil", label: "Meu Perfil" },
        { href: "/", label: "Início" },
      ];
    }

    return [
      { href: "/", label: "Início" },
      { href: "/agendamento/especialidade", label: "Agendar Consulta" },
      { href: "/login", label: "Login do Paciente" },
      { href: medicoHref, label: "Área do Médico" },
    ];
  }, [isMedicoArea, isPacienteArea, medicoHref]);

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    if (isMedicoArea) {
      router.push("/medico");
      return;
    }

    if (isPacienteArea) {
      router.push("/dashboard");
      return;
    }

    router.push("/");
  }

  function isActiveLink(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="bg-white shadow-header sticky top-0 z-40" role="banner">
      {/* Barra superior */}
      <div className="h-[66px] bg-white border-b border-neutral-100">
        <div className="container-app h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center no-underline">
              <Image
                src="/images/logo-conecta.png"
                alt="Conecta SUS+"
                width={114}
                height={42}
                priority
                className="object-contain"
              />
            </Link>

            <div className="h-8 w-px bg-neutral-300" />

            <span className="text-sm text-neutral-800">Governo Federal</span>
          </div>

          <div className="flex items-center gap-5">
            <Link
              href={medicoHref}
              className={`hidden sm:block text-[12px] underline underline-offset-2 ${
                isMedicoArea
                  ? "text-brand-800 font-bold"
                  : "text-brand-700"
              }`}
            >
              Área do médico
            </Link>

            <div className="hidden sm:block h-8 w-px bg-neutral-200" />

            <div className="hidden md:flex items-center gap-5 text-brand-700">
              <HeaderIconButton label="Indicadores">
                <ChartIcon />
              </HeaderIconButton>

              <HeaderIconButton label="Ouvidoria">
                <HeadsetIcon />
              </HeaderIconButton>

              <HeaderIconButton label="Mensagens">
                <ChatIcon />
              </HeaderIconButton>

              <HeaderIconButton label="Alterar contraste">
                <ContrastIcon />
              </HeaderIconButton>
            </div>

            {user ? (
              <button
                type="button"
                onClick={sair}
                className="h-[30px] px-5 rounded-full bg-brand-700 text-white text-xs font-bold hover:bg-brand-800 transition-colors"
              >
                Sair
              </button>
            ) : (
              <Link
                href="/login"
                className={`h-[30px] px-5 rounded-full text-xs font-bold no-underline flex items-center gap-2 transition-colors ${
                  isLoginPaciente
                    ? "bg-brand-800 text-white"
                    : "bg-brand-700 text-white hover:bg-brand-800"
                }`}
              >
                <UserIcon className="w-3.5 h-3.5 text-white" />
                Entrar com gov.br
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="min-h-[58px] bg-white border-b border-neutral-100">
        <div className="container-app min-h-[58px] flex items-center justify-between gap-6 py-2">
          <div className="flex items-center gap-3 min-w-0">
            {!isHome && (
              <button
                type="button"
                onClick={handleBack}
                className="hidden sm:flex h-8 px-3 rounded-full border border-neutral-200 items-center gap-2 text-xs font-bold text-brand-700 hover:bg-brand-50 transition-colors"
                aria-label="Voltar para a página anterior"
              >
                <ArrowLeftIcon />
                Voltar
              </button>
            )}

            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center text-brand-700 shrink-0"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>

            <Link
              href="/"
              className="flex flex-col leading-tight no-underline min-w-0"
            >
              <span className="font-poppins text-[20px] font-normal text-neutral-900 truncate">
                {pageInfo.title}
              </span>
              <span className="text-[12px] text-neutral-400 truncate">
                {pageInfo.subtitle}
              </span>
            </Link>
          </div>

          <nav
            className="hidden lg:flex items-center gap-1"
            aria-label="Menu principal"
          >
            {menuLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-full text-xs font-bold no-underline transition-colors ${
                  isActiveLink(link.href)
                    ? "bg-brand-700 text-white"
                    : "text-brand-700 hover:bg-brand-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex flex-1 justify-end max-w-[340px]">
            <div className="relative w-full">
              <input
                type="search"
                placeholder="O que você procura?"
                aria-label="Buscar especialidade ou unidade"
                className="w-full h-[42px] bg-neutral-50 border-0 rounded-md pl-5 pr-12 text-xs italic text-neutral-700 outline-none focus:ring-2 focus:ring-brand-700"
              />

              <button
                type="button"
                aria-label="Buscar"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-brand-700"
              >
                <SearchIcon />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menu aberto */}
      {menuOpen && (
        <nav className="bg-white border-b border-neutral-100">
          <ul className="container-app flex flex-col md:flex-row md:gap-3 py-3">
            {!isHome && (
              <li className="md:hidden">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    handleBack();
                  }}
                  className="w-full text-left flex items-center gap-2 py-2 text-sm font-bold text-brand-700"
                >
                  <ArrowLeftIcon />
                  Voltar
                </button>
              </li>
            )}

            {menuLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block py-2 px-3 rounded-full text-sm no-underline transition-colors ${
                    isActiveLink(link.href)
                      ? "bg-brand-700 text-white font-bold"
                      : "text-neutral-700 hover:text-brand-700 hover:bg-brand-50"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

function HeaderIconButton({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="w-5 h-5 flex items-center justify-center text-brand-700 hover:text-brand-800 transition-colors"
    >
      {children}
    </button>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M16 16l5 5" />
    </svg>
  );
}

function UserIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 12c2.35 0 4.25-1.9 4.25-4.25S14.35 3.5 12 3.5s-4.25 1.9-4.25 4.25S9.65 12 12 12Z" />
      <path d="M4.5 20.5c.55-3.45 3.7-6 7.5-6s6.95 2.55 7.5 6H4.5Z" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M5 20h14v-2H5v2Zm1-4h3V8H6v8Zm5 0h3V4h-3v12Zm5 0h3v-6h-3v6Z" />
    </svg>
  );
}

function HeadsetIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 13a8 8 0 0 1 16 0" />
      <path d="M4 13v4a2 2 0 0 0 2 2h2v-8H6a2 2 0 0 0-2 2Z" />
      <path d="M20 13v4a2 2 0 0 1-2 2h-2v-8h2a2 2 0 0 1 2 2Z" />
      <path d="M16 19c0 1.1-.9 2-2 2h-2" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M4 5.5C4 4.12 5.12 3 6.5 3h11C18.88 3 20 4.12 20 5.5v7c0 1.38-1.12 2.5-2.5 2.5H10l-5.2 4.2c-.32.26-.8.03-.8-.39V5.5Z" />
    </svg>
  );
}

function ContrastIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2a10 10 0 1 0 0 20V2Zm0 2.2v15.6a7.8 7.8 0 0 1 0-15.6Z" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}