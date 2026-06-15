"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DashboardLayout, Sidebar } from "@/components/layout";
import { Card, Badge, Loading, ErrorMessage, EmptyState } from "@/components/ui";
import { api } from "@/services/api";
import type { Agendamento, Especialidade } from "@/types";
import { statusLabel } from "@/utils";
import { useRequireAuth } from "@/hooks/useAuth";

const MEDICO_LINKS = [
  { href: "/medico",           label: "Minha Agenda",  icon: "📅" },
  { href: "/medico/consultas", label: "Consultas",     icon: "👥" },
  { href: "/medico/horarios",  label: "Meus Horários", icon: "🕐" },
];

export default function MedicoConsultasPage() {
  const { user, carregando } = useRequireAuth(["profissionalSaude"]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [especialidades, setEspecialidades] = useState<Record<string, Especialidade>>({});
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [data, setData] = useState("");

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const [ages, esps] = await Promise.all([
          api.get<Agendamento[]>("/medico/consultas" + (data ? "?data=" + data : "")),
          api.get<Especialidade[]>("/especialidades"),
        ]);
        setAgendamentos(ages);
        setEspecialidades(Object.fromEntries(esps.map((e) => [e.id, e])));
      } catch {
        setErro("Erro ao carregar consultas.");
      } finally {
        setLoading(false);
      }
    }
    setLoading(true);
    load();
  }, [user, data]);

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
          <div>
            <h1 className="font-poppins text-2xl font-bold text-brand-800">
              Consultas 👥
            </h1>
            <p className="text-neutral-500 text-sm">
              Dr(a). {user?.nome} — visualize suas consultas agendadas.
            </p>
          </div>

          {/* Filtro de data */}
          <div className="flex items-center gap-3">
            <label htmlFor="filtro-data" className="text-sm font-semibold text-neutral-700">
              Filtrar por data:
            </label>
            <input
              id="filtro-data"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="border border-neutral-300 rounded-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
            />
            {data && (
              <button
                onClick={() => setData("")}
                className="text-xs text-brand-700 hover:underline"
              >
                Limpar filtro
              </button>
            )}
            <span className="text-sm text-neutral-500 ml-auto">
              {agendamentos.length} {agendamentos.length === 1 ? "consulta" : "consultas"}
            </span>
          </div>

          {/* Lista de consultas */}
          <section aria-labelledby="consultas-title">
            <h2 id="consultas-title" className="font-poppins font-bold text-lg text-brand-700 mb-4">
              Lista de Consultas
            </h2>

            {erro    && <ErrorMessage message={erro} />}
            {loading ? <Loading /> : agendamentos.length === 0 ? (
              <EmptyState
                title="Nenhuma consulta encontrada"
                description="Não há consultas para o filtro selecionado."
                icon="📭"
              />
            ) : (
              <ul role="list" className="flex flex-col gap-3">
                {agendamentos.map((a) => (
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
