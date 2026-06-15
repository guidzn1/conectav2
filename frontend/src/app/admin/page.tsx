"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DashboardLayout, Sidebar } from "@/components/layout";
import { Card, Loading, ErrorMessage, Button } from "@/components/ui";
import { adminService } from "@/services";
import { useRequireAuth } from "@/hooks/useAuth";

const ADMIN_LINKS = [
  { href: "/admin",                    label: "Dashboard",            icon: "📊" },
  { href: "/admin/unidades",           label: "Unidades de Saúde",    icon: "🏥" },
  { href: "/admin/especialidades",     label: "Especialidades",       icon: "🩺" },
  { href: "/admin/profissionais",      label: "Profissionais",        icon: "👨‍⚕️" },
  { href: "/admin/agendas",            label: "Agendas / Horários",   icon: "📅" },
];

interface Stats {
  totalAgendamentos: number;
  agendamentosHoje: number;
  totalPacientes: number;
  totalProfissionais: number;
  totalUnidades: number;
}

export default function AdminDashboardPage() {
  const { user, carregando } = useRequireAuth(["administrador"]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro]  = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    adminService.getDashboardStats()
      .then(setStats)
      .catch(() => setErro("Erro ao carregar dados."))
      .finally(() => setLoading(false));
  }, [user]);

  if (carregando || !user) {
    return (
      <>
        <Header />
        <main id="main-content">
          <Loading text="Verificando acesso..." />
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <DashboardLayout sidebar={<Sidebar links={ADMIN_LINKS} />}>
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="font-poppins text-2xl font-bold text-brand-800">Painel do Administrador</h1>
            <p className="text-neutral-500 text-sm">Visão geral do sistema Conecta SUS.</p>
          </div>

          {erro    && <ErrorMessage message={erro} />}
          {loading ? <Loading /> : stats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <StatCard label="Agendamentos hoje"  value={stats.agendamentosHoje}   color="brand" />
              <StatCard label="Total agendamentos"  value={stats.totalAgendamentos}   color="green" />
              <StatCard label="Pacientes"          value={stats.totalPacientes}      color="blue" />
              <StatCard label="Profissionais"      value={stats.totalProfissionais}  color="purple" />
              <StatCard label="Unidades de Saúde"  value={stats.totalUnidades}       color="orange" />
            </div>
          )}

          {/* Ações rápidas */}
          <section aria-labelledby="acoes-title">
            <h2 id="acoes-title" className="font-poppins font-bold text-lg text-brand-700 mb-4">
              Ações rápidas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ADMIN_LINKS.slice(1).map(({ href, label, icon }) => (
                <Link key={href} href={href}>
                  <Card hover padding="sm">
                    <div className="flex items-center gap-3 p-2">
                      <span className="text-2xl" aria-hidden="true">{icon}</span>
                      <span className="font-semibold text-brand-700">{label}</span>
                      <span className="ml-auto text-neutral-300" aria-hidden="true">›</span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </DashboardLayout>
      <Footer />
    </>
  );
}

function StatCard({
  label, value, color,
}: { label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    brand:  "bg-brand-50  text-brand-700",
    green:  "bg-green-50  text-green-700",
    blue:   "bg-blue-50   text-blue-700",
    purple: "bg-purple-50 text-purple-700",
    orange: "bg-orange-50 text-orange-700",
  };
  return (
    <Card padding="sm" className={`flex flex-col items-center text-center py-5 ${colorMap[color]}`}>
      <span className="text-4xl font-black font-poppins">{value}</span>
      <span className="text-xs font-semibold mt-1">{label}</span>
    </Card>
  );
}
