"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DashboardLayout, Sidebar } from "@/components/layout";
import {
  Card,
  Badge,
  Button,
  Loading,
  EmptyState,
  ErrorMessage,
} from "@/components/ui";
import {
  agendamentoService,
  profissionalService,
  especialidadeService,
} from "@/services";
import type { Agendamento, ProfissionalSaude, Especialidade } from "@/types";
import { formatDate, statusLabel } from "@/utils";
import { useRequireAuth } from "@/hooks/useAuth";

const PACIENTE_LINKS = [
  { href: "/dashboard", label: "Meus Agendamentos", icon: "📅" },
  { href: "/agendamento/especialidade", label: "Agendar Consulta", icon: "➕" },
  { href: "/dashboard/historico", label: "Histórico", icon: "📋" },
  { href: "/dashboard/perfil", label: "Meu Perfil", icon: "👤" },
];

type FiltroHistorico = "todos" | "concluido" | "cancelado";

function ordenarMaisRecentes(a: Agendamento, b: Agendamento) {
  const dataA = new Date(`${a.data}T${a.horario ?? "00:00"}`).getTime();
  const dataB = new Date(`${b.data}T${b.horario ?? "00:00"}`).getTime();

  return dataB - dataA;
}

export default function HistoricoPage() {
  const { user, carregando } = useRequireAuth(["paciente"]);

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [profissionais, setProfissionais] = useState<Record<string, ProfissionalSaude>>({});
  const [especialidades, setEspecialidades] = useState<Record<string, Especialidade>>({});

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<FiltroHistorico>("todos");
  const [consultaAberta, setConsultaAberta] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    async function load() {
      try {
        setLoading(true);
        setErro(null);

        const [ages, pros, esps] = await Promise.all([
          agendamentoService.getMeusAgendamentos(user!.id),
          profissionalService.getProfissionais(),
          especialidadeService.getEspecialidades(),
        ]);

        setAgendamentos(ages);
        setProfissionais(Object.fromEntries(pros.map((p) => [p.id, p])));
        setEspecialidades(Object.fromEntries(esps.map((e) => [e.id, e])));
      } catch {
        setErro("Erro ao carregar histórico de consultas.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user]);

  const anteriores = useMemo(() => {
    return agendamentos
      .filter((a) => a.status === "concluido" || a.status === "cancelado")
      .filter((a) => (filtro === "todos" ? true : a.status === filtro))
      .sort(ordenarMaisRecentes);
  }, [agendamentos, filtro]);

  const totalConcluidas = agendamentos.filter((a) => a.status === "concluido").length;
  const totalCanceladas = agendamentos.filter((a) => a.status === "cancelado").length;
  const totalComLaudo = agendamentos.filter((a) => a.status === "concluido" && a.laudo).length;

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

      <DashboardLayout sidebar={<Sidebar links={PACIENTE_LINKS} />}>
        <div className="flex flex-col gap-6">
          <section className="bg-white border border-neutral-100 shadow-card rounded-cardLg p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-brand-700 mb-2">
                  Painel do paciente
                </p>

                <h1 className="font-poppins text-3xl font-bold text-brand-800">
                  Histórico de consultas
                </h1>

                <p className="text-neutral-500 text-sm mt-1">
                  Consulte atendimentos concluídos, cancelamentos e laudos salvos pelo médico.
                </p>
              </div>

              <Link href="/agendamento/especialidade">
                <Button size="sm">+ Agendar nova consulta</Button>
              </Link>
            </div>
          </section>

          <section aria-label="Resumo do histórico">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ResumoCard label="Concluídas" value={totalConcluidas} description="consultas finalizadas" />
              <ResumoCard label="Com laudo" value={totalComLaudo} description="registros disponíveis" />
              <ResumoCard label="Canceladas" value={totalCanceladas} description="consultas canceladas" />
            </div>
          </section>

          {erro && <ErrorMessage message={erro} />}

          <section className="bg-white border border-neutral-100 shadow-card rounded-cardLg p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <div>
                <h2 className="font-poppins text-xl font-bold text-brand-800">
                  Registros do histórico
                </h2>

                <p className="text-sm text-neutral-500">
                  {anteriores.length} {anteriores.length === 1 ? "registro encontrado" : "registros encontrados"}
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="filtro-historico" className="text-xs font-bold text-neutral-700">
                  Filtrar
                </label>

                <select
                  id="filtro-historico"
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value as FiltroHistorico)}
                  className="h-10 border border-neutral-300 rounded-input px-3 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-brand-700"
                >
                  <option value="todos">Todos</option>
                  <option value="concluido">Concluídos</option>
                  <option value="cancelado">Cancelados</option>
                </select>
              </div>
            </div>

            {loading ? (
              <Loading text="Carregando histórico..." />
            ) : anteriores.length === 0 ? (
              <EmptyState
                title="Histórico vazio"
                description="Você ainda não tem consultas concluídas ou canceladas."
                icon="📋"
                action={
                  <Link href="/agendamento/especialidade">
                    <Button size="sm">Agendar consulta</Button>
                  </Link>
                }
              />
            ) : (
              <ul role="list" className="flex flex-col gap-3">
                {anteriores.map((a) => {
                  const aberto = consultaAberta === a.id;
                  const temLaudo = a.status === "concluido" && !!a.laudo;

                  return (
                    <li key={a.id}>
                      <Card className="border-neutral-200">
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <div
                                className="w-11 h-11 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center text-xl shrink-0"
                                aria-hidden="true"
                              >
                                📋
                              </div>

                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-poppins font-semibold text-brand-800">
                                    {especialidades[a.especialidadeId]?.nome ?? "Especialidade"}
                                  </span>

                                  <Badge variant={a.status === "concluido" ? "info" : "error"}>
                                    {statusLabel(a.status)}
                                  </Badge>

                                  {temLaudo && <Badge variant="success">Laudo disponível</Badge>}
                                </div>

                                <p className="text-sm text-neutral-600 mt-1">
                                  Dr(a). {profissionais[a.profissionalId]?.nome ?? "Profissional"}
                                </p>

                                <p className="text-xs text-neutral-400 mt-1">
                                  📅 {formatDate(a.data)} às {a.horario}
                                </p>
                              </div>
                            </div>

                            {temLaudo && (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => setConsultaAberta(aberto ? null : a.id)}
                              >
                                {aberto ? "Ocultar laudo" : "Ver laudo"}
                              </Button>
                            )}
                          </div>

                          {aberto && temLaudo && (
                            <div className="border-t border-neutral-100 pt-4">
                              <h3 className="font-poppins font-bold text-brand-800 mb-3">
                                Laudo / registro do atendimento
                              </h3>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <LaudoItem titulo="Queixa principal" texto={a.laudo?.queixaPrincipal} />
                                <LaudoItem titulo="Diagnóstico" texto={a.laudo?.diagnostico} />
                                <LaudoItem titulo="Conduta" texto={a.laudo?.conduta} />
                                <LaudoItem titulo="Prescrição / recomendações" texto={a.laudo?.prescricao} />
                                <LaudoItem titulo="Observações" texto={a.laudo?.observacoes} full />
                              </div>

                              {a.finalizadoEm && (
                                <p className="mt-4 text-xs text-neutral-400">
                                  Finalizado em {new Date(a.finalizadoEm).toLocaleString("pt-BR")}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </Card>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </DashboardLayout>

      <Footer />
    </>
  );
}

function ResumoCard({
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
        <span className="text-3xl font-poppins font-bold text-brand-800">{value}</span>
        <span className="text-sm font-bold text-neutral-700">{label}</span>
        <span className="text-xs text-neutral-500">{description}</span>
      </div>
    </Card>
  );
}

function LaudoItem({
  titulo,
  texto,
  full,
}: {
  titulo: string;
  texto?: string;
  full?: boolean;
}) {
  return (
    <div className={`rounded-input border border-neutral-100 bg-neutral-50 p-4 ${full ? "md:col-span-2" : ""}`}>
      <p className="text-xs font-bold uppercase tracking-wide text-brand-700 mb-2">
        {titulo}
      </p>

      <p className="text-sm text-neutral-700 whitespace-pre-wrap">
        {texto?.trim() || "Não informado."}
      </p>
    </div>
  );
}
