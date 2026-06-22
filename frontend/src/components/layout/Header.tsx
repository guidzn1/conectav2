"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const { user, sair } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const medicoHref =
    user?.tipoUsuario === "profissionalSaude" ? "/medico" : "/medico/login";

  return (
    <header className="bg-white shadow-header sticky top-0 z-40" role="banner">
      {/* Barra superior */}
      <div className="h-[66px] bg-white border-b border-neutral-100">
        <div className="container-app h-full flex items-center justify-between">
          {/* Logo + Governo Federal */}
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

          {/* Área direita */}
          <div className="flex items-center gap-5">
            <Link
              href={medicoHref}
              className="hidden sm:block text-[12px] text-brand-700 underline underline-offset-2"
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
                className="h-[30px] px-5 rounded-full bg-brand-700 text-white text-xs font-bold no-underline flex items-center gap-2 hover:bg-brand-800 transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5 text-white" />
                Entrar com gov.br
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="h-[58px] bg-white border-b border-neutral-100">
        <div className="container-app h-full flex items-center justify-between gap-6">
          {/* Menu + título */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center text-brand-700"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>

            <Link href="/" className="flex flex-col leading-tight no-underline">
              <span className="font-poppins text-[20px] font-normal text-neutral-900">
                Conecta Sus+
              </span>
              <span className="text-[12px] text-neutral-400">
                Agendamento de consultas
              </span>
            </Link>
          </div>

          {/* Busca */}
          <div className="hidden md:flex flex-1 justify-end">
            <div className="relative w-full max-w-[340px]">
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
          <ul className="container-app flex flex-col md:flex-row md:gap-8 py-3">
            <li>
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-sm text-neutral-700 no-underline hover:text-brand-700"
              >
                Início
              </Link>
            </li>

            <li>
              <Link
                href="/agendamento/especialidade"
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-sm text-neutral-700 no-underline hover:text-brand-700"
              >
                Agendar Consulta
              </Link>
            </li>

            <li>
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-sm text-neutral-700 no-underline hover:text-brand-700"
              >
                Meus Agendamentos
              </Link>
            </li>

            <li>
              <Link
                href={medicoHref}
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-sm text-neutral-700 no-underline hover:text-brand-700"
              >
                Área do médico
              </Link>
            </li>
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