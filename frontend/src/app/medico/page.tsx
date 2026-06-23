"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DashboardLayout, Sidebar } from "@/components/layout";
import {
  Card,
  Badge,
  Loading,
  ErrorMessage,
  EmptyState,
  Button,
} from "@/components/ui";
import { agendamentoService, especialidadeService } from "@/services";
import type { Agendamento, Especialidade } from "@/types";
import { formatDate, statusLabel } from "@/utils";
import { useRequireAuth } from "@/hooks/useAuth";

const MEDICO_LINKS = [
  { href: "/medico", label: "Minha Agenda", icon: "📅" },
  { href: "/medico/consultas", label: "Consultas", icon: "👥" },
  { href: "/medico/horarios", label: "Meus Horários", icon: "🕐" },
];

type BadgeVariant = "info" | "success" | "warning" | "error" | "neutral";

function getHojeISO() {
  return new Date().toISOString().split("T")[0];
}

function getStatusVariant(status: Agendamento["status"]): BadgeVariant {
  if (status === "confirmado") return "success";
  if (status === "cancelado") return "error";
  if (status === "concluido") return "info";
  return "warning";
}

export default function MedicoDashboardPage() {
  const { user, carregando } = useRequireAuth(["profissionalSaude"]);

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [especialidades, setEspecialidades] = useState<
    Record<string, Especialidade>
  >({});

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [dataFiltro, setDataFiltro] = useState(getHojeISO());

  useEffect(() => {
    if (!user) return;

    async function load() {
      try {
        setLoading(true);
        setErro(null);

        const [ages, esps] = await Promise.all([
          agendamentoService.getPacientesAgendados(user!.id, dataFiltro),
          especialidadeService.getEspecialidades(),
        ]);

        setAgendamentos(ages);
        setEspecialidades(Object.fromEntries(esps.map((e) => [e.id, e])));
      } catch {
        setErro("Não foi possível carregar a agenda. Tente novamente.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user, dataFiltro]);

  const indicadores = useMemo(() => {
    return {
      total: agendamentos.length,
      confirmados: agendamentos.filter((a) => a.status === "confirmado").length,
      pendentes: agendamentos.filter((a) => a.status === "pendente").length,
      cancelados: agendamentos.filter((a) => a.status === "cancelado").length,
    };
  }, [agendamentos]);

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
          {/* Cabeçalho da página */}
          <section
            aria-labelledby="agenda-title"
            className="bg-white border border-neutral-100 shadow-card rounded-cardLg p-6"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-brand-700 mb-2">
                  Área do médico
                </p>

                <h1
                  id="agenda-title"
                  className="font-poppins text-3xl font-bold text-brand-800 leading-tight"
                >
                  Minha Agenda
                </h1>

                <p className="text-neutral-500 text-sm mt-1">
                  Dr(a). {user.nome} — acompanhe os pacientes agendados por dia.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="filtro-data"
                    className="text-xs font-bold text-neutral-700"
                  >
                    Data da agenda
                  </label>

                  <input
                    id="filtro-data"
                    type="date"
                    value={dataFiltro}
                    onChange={(e) => setDataFiltro(e.target.value)}
                    className="h-10 border border-neutral-300 rounded-input px-3 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-brand-700"
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDataFiltro(getHojeISO())}
                  aria-label="Voltar filtro para a data de hoje"
                >
                  Hoje
                </Button>
              </div>
            </div>
          </section>

          {/* Indicadores */}
          <section aria-label="Resumo da agenda">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <IndicadorCard
                label="Agendados"
                value={indicadores.total}
                description="na data selecionada"
              />

              <IndicadorCard
                label="Confirmados"
                value={indicadores.confirmados}
                description="consultas confirmadas"
              />

              <IndicadorCard
                label="Pendentes"
                value={indicadores.pendentes}
                description="aguardando confirmação"
              />

              <IndicadorCard
                label="Cancelados"
                value={indicadores.cancelados}
                description="consultas canceladas"
              />
            </div>
          </section>

          {erro && <ErrorMessage message={erro} />}

          {/* Lista do dia */}
          <section
            aria-labelledby="pacientes-dia-title"
            className="bg-white border border-neutral-100 shadow-card rounded-cardLg p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
              <div>
                <h2
                  id="pacientes-dia-title"
                  className="font-poppins text-xl font-bold text-brand-800"
                >
                  Pacientes — {formatDate(dataFiltro)}
                </h2>

                <p className="text-sm text-neutral-500">
                  {indicadores.total}{" "}
                  {indicadores.total === 1
                    ? "paciente encontrado"
                    : "pacientes encontrados"}
                </p>
              </div>
            </div>

            {loading ? (
              <Loading text="Carregando pacientes..." />
            ) : agendamentos.length === 0 ? (
              <EmptyState
                title="Nenhum paciente agendado"
                description="Não há consultas marcadas para esta data."
                icon="📭"
              />
            ) : (
              <ul role="list" className="flex flex-col gap-3">
                {agendamentos.map((a) => (
                  <li key={a.id}>
                    <Card
                      padding="md"
                      className="border-neutral-200 hover:border-brand-200 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div
                            className="w-11 h-11 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center font-bold shrink-0"
                            aria-hidden="true"
                          >
                            P
                          </div>

                          <div>
                            <p className="font-poppins font-semibold text-brand-800 text-sm">
                              Paciente #{a.pacienteId.slice(-4)}
                            </p>

                            <p className="text-sm text-neutral-600 mt-1">
                              {especialidades[a.especialidadeId]?.nome ??
                                "Especialidade não informada"}
                            </p>

                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-neutral-500">
                              <span>Horário: {a.horario}</span>
                              <span>
                                Tipo:{" "}
                                {a.tipoVisita === "telemedicina"
                                  ? "Telemedicina"
                                  : "Presencial"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex md:flex-col items-start md:items-end gap-2">
                          <Badge variant={getStatusVariant(a.status)}>
                            {statusLabel(a.status)}
                          </Badge>

                          <span className="text-xs text-neutral-400">
                            ID: {a.id.slice(-6)}
                          </span>
                        </div>
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

function IndicadorCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <Card padding="md" className="border-neutral-200">
      <div className="flex flex-col gap-1">
        <span className="text-3xl font-poppins font-bold text-brand-800">
          {value}
        </span>

        <span className="text-sm font-bold text-neutral-700">{label}</span>

        <span className="text-xs text-neutral-500">{description}</span>
      </div>
    </Card>
  );
}