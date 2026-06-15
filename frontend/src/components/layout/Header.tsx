"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/utils";
import { Button } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const { user, sair } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-header sticky top-0 z-40" role="banner">
      {/* Barra gov.br topo */}
      <div className="bg-brand-800 text-white text-xs py-1">
        <div className="container-app flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Logo Conecta SUS compacto */}
            <span className="font-poppins font-bold tracking-wide text-xs">CONECTA SUS+</span>
            <span className="opacity-50">|</span>
            <span className="opacity-75">Governo Federal</span>
          </div>
          <nav aria-label="Links do governo" className="hidden sm:flex gap-4 text-xs">
            {user ? (
              user.tipoUsuario === "profissionalSaude" ? (
                <Link href="/medico" className="hover:underline opacity-90">Área do médico</Link>
              ) : user.tipoUsuario === "administrador" ? (
                <Link href="/admin" className="hover:underline opacity-90">Área administrativa</Link>
              ) : user.tipoUsuario === "ubs" ? (
                <Link href="/ubs" className="hover:underline opacity-90">Área da UBS</Link>
              ) : null
            ) : null}
          </nav>
        </div>
      </div>

      {/* Barra principal */}
      <div className="container-app flex items-center justify-between h-16 gap-4">
        {/* Logo */}
        <Link href="/" className="flex flex-col leading-tight no-underline" aria-label="Conecta SUS - Página inicial">
          <span className="font-poppins font-bold text-brand-700 text-lg leading-none">Conecta Sus+</span>
          <span className="text-neutral-400 text-xs">Agendamento de consultas</span>
        </Link>

        {/* Busca */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <input
              type="search"
              placeholder="O que você procura?"
              aria-label="Buscar especialidade ou unidade"
              className={cn(
                "w-full border border-neutral-200 rounded-pill py-2 pl-4 pr-10 text-sm",
                "focus:outline-none focus:ring-2 focus:ring-brand-700"
              )}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" aria-hidden="true">
              🔍
            </span>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-sm text-neutral-600 font-semibold">
                {user.nome.split(" ")[0]}
              </span>
              <Button variant="outline" size="sm" onClick={sair}>Sair</Button>
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm">Entrar com gov.br</Button>
            </Link>
          )}

          {/* Hamburger mobile */}
          <button
            className="md:hidden p-2 text-neutral-600 hover:text-brand-700"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav aria-label="Menu mobile" className="md:hidden border-t border-neutral-100 bg-white">
          <ul className="flex flex-col py-2">
            {[
              { href: "/", label: "Início" },
              { href: "/agendamento/especialidade", label: "Agendar Consulta" },
              { href: "/dashboard", label: "Meus Agendamentos" },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="block px-6 py-3 text-sm text-neutral-700 hover:bg-neutral-50 no-underline"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
