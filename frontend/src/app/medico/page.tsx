"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DashboardLayout, Sidebar } from "@/components/layout";
import { Card, Badge, Loading, ErrorMessage, EmptyState } from "@/components/ui";
import { agendamentoService, especialidadeService } from "@/services";
import type { Agendamento, Especialidade } from "@/types";
import { formatDate, statusLabel } from "@/utils";
import { useRequireAuth } from "@/hooks/useAuth";

const MEDICO_LINKS = [
  { href: "/medico",           label: "Minha Agenda",  icon: "📅" },
  { href: "/medico/consultas", label: "Consultas",     icon: "👥" },
  { href: "/medico/horarios",  label: "Meus Horários", icon: "🕐" },
];

export default function MedicoDashboardPage() {
  const { user, carregando } = useRequireAuth(["profissionalSaude"]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [especialidades, setEspecialidades] = useState<Record<string, Especialidade>>({});
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [dataFiltro, setDataFiltro] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const [ages, esps] = await Promise.all([
          agendamentoService.getPacientesAgendados(user!.id, dataFiltro),
          especialidadeService.getEspecialidades(),
        ]);
        setAgendamentos(ages);
        setEspecialidades(Object.fromEntries(esps.map((e) => [e.id, e])));
      } catch {
        setErro("Erro ao carregar agenda.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, dataFiltro]);

  const hoje = agendamentos.filter((a) => a.data === dataFiltro);

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
      <DashboardLayout sidebar={<Sidebar links={MEDICO_LINKS} />}>
        <div className="flex flex-col gap-6">
          {/* Cabeçalho */}
          <div>
            <h1 className="font-poppins text-2xl font-bold text-brand-800">
              Minha Agenda 📋
            </h1>
            <p className="text-neutral-500 text-sm">
              Dr(a). {user?.nome}
            </p>
          </div>

          {/* Filtro de data */}
          <div className="flex items-center gap-3">
            <label htmlFor="filtro-data" className="text-sm font-semibold text-neutral-700">
              Data:
            </label>
            <input
              id="filtro-data"
              type="date"
              value={dataFiltro}
              onChange={(e) => setDataFiltro(e.target.value)}
              className="border border-neutral-300 rounded-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
            />
            <span className="text-sm text-neutral-500">
              {hoje.length} {hoje.length === 1 ? "paciente" : "pacientes"} agendados
            </span>
          </div>

          {/* Stats rápidos */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "Hoje",        value: agendamentos.filter((a) => a.data === dataFiltro).length, color: "bg-brand-50 text-brand-700" },
              { label: "Confirmados", value: agendamentos.filter((a) => a.status === "confirmado").length, color: "bg-green-50 text-green-700" },
              { label: "Pendentes",   value: agendamentos.filter((a) => a.status === "pendente").length, color: "bg-yellow-50 text-yellow-700" },
            ].map(({ label, value, color }) => (
              <Card key={label} padding="sm" className={`flex flex-col items-center text-center ${color}`}>
                <span className="text-3xl font-bold font-poppins">{value}</span>
                <span className="text-xs font-semibold">{label}</span>
              </Card>
            ))}
          </div>

          {/* Lista de pacientes do dia */}
          <section aria-labelledby="pacientes-dia-title">
            <h2 id="pacientes-dia-title" className="font-poppins font-bold text-lg text-brand-700 mb-4">
              Pacientes — {formatDate(dataFiltro)}
            </h2>

            {erro    && <ErrorMessage message={erro} />}
            {loading ? <Loading /> : hoje.length === 0 ? (
              <EmptyState
                title="Nenhum paciente agendado"
                description="Sem agendamentos para esta data."
                icon="📭"
              />
            ) : (
              <ul role="list" className="flex flex-col gap-3">
                {hoje.map((a) => (
                  <li key={a.id}>
                    <Card>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm">
                            {a.pacienteId.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-brand-800 text-sm">
                              Paciente #{a.pacienteId.slice(-4)}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {especialidades[a.especialidadeId]?.nome} · {a.horario}
                            </p>
                          </div>
                        </div>
                        <Badge variant={
                          a.status === "confirmado" ? "success" :
                          a.status === "cancelado"  ? "error"   : "warning"
                        }>
                          {statusLabel(a.status)}
                        </Badge>
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </DashboardLayout>
      <Footer />
    </>
  );
}
