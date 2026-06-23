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
import { agendaService } from "@/services";
import type { Agenda } from "@/types";
import { formatDate } from "@/utils";
import { useRequireAuth } from "@/hooks/useAuth";

const MEDICO_LINKS = [
  { href: "/medico", label: "Minha Agenda", icon: "📅" },
  { href: "/medico/consultas", label: "Consultas", icon: "👥" },
  { href: "/medico/horarios", label: "Meus Horários", icon: "🕐" },
];

type FiltroDisponibilidade = "todos" | "disponiveis" | "ocupados";

const FILTROS_DISPONIBILIDADE: {
  value: FiltroDisponibilidade;
  label: string;
}[] = [
  { value: "todos", label: "Todos" },
  { value: "disponiveis", label: "Disponíveis" },
  { value: "ocupados", label: "Ocupados" },
];

function getHojeISO() {
  return new Date().toISOString().split("T")[0];
}

export default function MedicoHorariosPage() {
  const { user, carregando } = useRequireAuth(["profissionalSaude"]);

  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [dataFiltro, setDataFiltro] = useState("");
  const [disponibilidadeFiltro, setDisponibilidadeFiltro] =
    useState<FiltroDisponibilidade>("todos");

  useEffect(() => {
    if (!user) return;

    async function load() {
      try {
        setLoading(true);
        setErro(null);

        const dados = await agendaService.getAgendas(user!.id);
        setAgendas(dados);
      } catch {
        setErro("Erro ao carregar horários. Tente novamente.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user]);

  const agendasFiltradas = useMemo(() => {
    let lista = [...agendas].sort((a, b) => a.data.localeCompare(b.data));

    if (dataFiltro) {
      lista = lista.filter((agenda) => agenda.data === dataFiltro);
    }

    if (disponibilidadeFiltro === "disponiveis") {
      lista = lista.filter((agenda) =>
        agenda.horarios.some((h) => h.disponivel)
      );
    }

    if (disponibilidadeFiltro === "ocupados") {
      lista = lista.filter((agenda) =>
        agenda.horarios.some((h) => !h.disponivel)
      );
    }

    return lista;
  }, [agendas, dataFiltro, disponibilidadeFiltro]);

  const resumo = useMemo(() => {
    const totalDias = agendas.length;
    const totalHorarios = agendas.reduce(
      (acc, agenda) => acc + agenda.horarios.length,
      0
    );
    const disponiveis = agendas.reduce(
      (acc, agenda) =>
        acc + agenda.horarios.filter((h) => h.disponivel).length,
      0
    );
    const ocupados = totalHorarios - disponiveis;

    return {
      totalDias,
      totalHorarios,
      disponiveis,
      ocupados,
    };
  }, [agendas]);

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
          <section className="bg-white border border-neutral-100 shadow-card rounded-cardLg p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-brand-700 mb-2">
                  Área do médico
                </p>

                <h1 className="font-poppins text-3xl font-bold text-brand-800 leading-tight">
                  Meus Horários
                </h1>

                <p className="text-neutral-500 text-sm mt-1">
                  Dr(a). {user.nome} — consulte os dias de atendimento e os
                  horários disponíveis.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="filtro-data"
                    className="text-xs font-bold text-neutral-700"
                  >
                    Filtrar por data
                  </label>

                  <input
                    id="filtro-data"
                    type="date"
                    value={dataFiltro}
                    onChange={(e) => setDataFiltro(e.target.value)}
                    className="h-10 border border-neutral-300 rounded-input px-3 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-brand-700"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="filtro-disponibilidade"
                    className="text-xs font-bold text-neutral-700"
                  >
                    Disponibilidade
                  </label>

                  <select
                    id="filtro-disponibilidade"
                    value={disponibilidadeFiltro}
                    onChange={(e) =>
                      setDisponibilidadeFiltro(
                        e.target.value as FiltroDisponibilidade
                      )
                    }
                    className="h-10 border border-neutral-300 rounded-input px-3 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-brand-700"
                  >
                    {FILTROS_DISPONIBILIDADE.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {(dataFiltro || disponibilidadeFiltro !== "todos") && (
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDataFiltro("");
                        setDisponibilidadeFiltro("todos");
                      }}
                    >
                      Limpar
                    </Button>
                  </div>
                )}

                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setDataFiltro(getHojeISO())}
                  >
                    Hoje
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Resumo */}
          <section aria-label="Resumo dos horários">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <ResumoCard
                label="Dias"
                value={resumo.totalDias}
                description="com agenda criada"
              />

              <ResumoCard
                label="Horários"
                value={resumo.totalHorarios}
                description="registrados no total"
              />

              <ResumoCard
                label="Disponíveis"
                value={resumo.disponiveis}
                description="livres para agendamento"
              />

              <ResumoCard
                label="Ocupados"
                value={resumo.ocupados}
                description="já reservados"
              />
            </div>
          </section>

          {erro && <ErrorMessage message={erro} />}

          {/* Lista */}
          <section className="bg-white border border-neutral-100 shadow-card rounded-cardLg p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
              <div>
                <h2 className="font-poppins text-xl font-bold text-brand-800">
                  Grade de horários
                </h2>

                <p className="text-sm text-neutral-500">
                  {agendasFiltradas.length}{" "}
                  {agendasFiltradas.length === 1
                    ? "dia encontrado"
                    : "dias encontrados"}
                </p>
              </div>
            </div>

            {loading ? (
              <Loading text="Carregando horários..." />
            ) : agendasFiltradas.length === 0 ? (
              <EmptyState
                title="Nenhuma agenda encontrada"
                description="Não há horários cadastrados para os filtros selecionados."
                icon="📭"
              />
            ) : (
              <ul role="list" className="flex flex-col gap-4">
                {agendasFiltradas.map((agenda) => {
                  const disponiveis = agenda.horarios.filter(
                    (h) => h.disponivel
                  ).length;

                  const ocupados = agenda.horarios.length - disponiveis;

                  return (
                    <li key={agenda.id}>
                      <Card
                        padding="md"
                        className="border-neutral-200 hover:border-brand-200 transition-colors"
                      >
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                              <h3 className="font-poppins font-bold text-lg text-brand-800">
                                {formatDate(agenda.data)}
                              </h3>

                              <p className="text-sm text-neutral-500">
                                {agenda.horarios.length} horários cadastrados
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <Badge variant="success">
                                {disponiveis} disponíveis
                              </Badge>

                              <Badge variant={ocupados > 0 ? "warning" : "neutral"}>
                                {ocupados} ocupados
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                            {agenda.horarios.map(({ hora, disponivel }) => (
                              <div
                                key={hora}
                                className={`h-10 px-3 rounded-input border text-sm font-semibold flex items-center justify-center ${
                                  disponivel
                                    ? "bg-brand-50 border-brand-200 text-brand-700"
                                    : "bg-neutral-100 border-neutral-200 text-neutral-400 line-through"
                                }`}
                                aria-label={`${hora} ${
                                  disponivel ? "disponível" : "ocupado"
                                }`}
                                title={disponivel ? "Disponível" : "Ocupado"}
                              >
                                {hora}
                              </div>
                            ))}
                          </div>
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
        <span className="text-3xl font-poppins font-bold text-brand-800">
          {value}
        </span>

        <span className="text-sm font-bold text-neutral-700">{label}</span>

        <span className="text-xs text-neutral-500">{description}</span>
      </div>
    </Card>
  );
}