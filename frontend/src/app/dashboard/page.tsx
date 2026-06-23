"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import type {
  Agendamento,
  ProfissionalSaude,
  Especialidade,
} from "@/types";
import { formatDate, statusLabel } from "@/utils";
import { useRequireAuth } from "@/hooks/useAuth";

const PACIENTE_LINKS = [
  { href: "/dashboard", label: "Meus Agendamentos", icon: "📅" },
  { href: "/agendamento/especialidade", label: "Agendar Consulta", icon: "➕" },
  { href: "/dashboard/historico", label: "Histórico", icon: "📋" },
  { href: "/dashboard/perfil", label: "Meu Perfil", icon: "👤" },
];

type BadgeVariant = "info" | "success" | "warning" | "error" | "neutral";

function getStatusVariant(status: Agendamento["status"]): BadgeVariant {
  if (status === "confirmado") return "success";
  if (status === "cancelado") return "error";
  if (status === "concluido") return "info";
  return "warning";
}

function ordenarPorData(a: Agendamento, b: Agendamento) {
  const dataA = new Date(`${a.data}T${a.horario ?? "00:00"}`).getTime();
  const dataB = new Date(`${b.data}T${b.horario ?? "00:00"}`).getTime();

  return dataA - dataB;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, carregando } = useRequireAuth(["paciente"]);

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [profissionais, setProfissionais] = useState<
    Record<string, ProfissionalSaude>
  >({});
  const [especialidades, setEspecialidades] = useState<
    Record<string, Especialidade>
  >({});

  const [especialidadeSelecionada, setEspecialidadeSelecionada] = useState("");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [cancelandoId, setCancelandoId] = useState<string | null>(null);

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
        setErro("Erro ao carregar seus agendamentos.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user]);

  async function handleCancelar(id: string) {
    if (!confirm("Deseja cancelar este agendamento?")) return;

    setCancelandoId(id);

    try {
      await agendamentoService.cancelarAgendamento(id);

      setAgendamentos((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status: "cancelado" } : a
        )
      );
    } catch {
      setErro("Erro ao cancelar. Tente novamente.");
    } finally {
      setCancelandoId(null);
    }
  }

  function handleBuscarConsulta() {
    const url = especialidadeSelecionada
      ? `/agendamento/especialidade?especialidadeId=${especialidadeSelecionada}`
      : "/agendamento/especialidade";

    router.push(url);
  }

  const proximos = useMemo(() => {
    return agendamentos
      .filter((a) => a.status !== "cancelado" && a.status !== "concluido")
      .sort(ordenarPorData);
  }, [agendamentos]);

  const anteriores = useMemo(() => {
    return agendamentos
      .filter((a) => a.status === "concluido" || a.status === "cancelado")
      .sort(ordenarPorData)
      .reverse();
  }, [agendamentos]);

  const proximaConsulta = proximos[0];

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
          {/* Hero de agendamento */}
          <section className="bg-[#eef7ff] border border-brand-100 rounded-cardLg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] items-center gap-6 p-6 lg:p-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-brand-700 mb-2">
                  Painel do paciente
                </p>

                <h1 className="font-poppins text-[34px] sm:text-[42px] leading-[1.05] text-brand-800 mb-2">
                  Agende agora
                  <br />
                  <span className="font-normal">sua consulta</span>
                </h1>

                <p className="text-sm text-neutral-600 mb-5 max-w-[500px]">
                  Escolha uma especialidade e acompanhe seus atendimentos de
                  forma simples, segura e organizada.
                </p>

                <div className="bg-brand-700 rounded-[4px] p-3 max-w-[620px]">
                  <p className="text-white text-xs font-bold mb-2">
                    Escolha sua especialidade
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
                    <select
                      value={especialidadeSelecionada}
                      onChange={(e) =>
                        setEspecialidadeSelecionada(e.target.value)
                      }
                      className="h-11 rounded-[3px] border-0 px-3 text-sm text-neutral-600 outline-none focus:ring-2 focus:ring-white"
                      aria-label="Selecionar especialidade"
                    >
                      <option value="">Especialidade médica</option>

                      {Object.values(especialidades).map((especialidade) => (
                        <option key={especialidade.id} value={especialidade.id}>
                          {especialidade.nome}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={handleBuscarConsulta}
                      className="h-11 px-5 rounded-[3px] bg-brand-800 text-white font-bold text-sm hover:bg-brand-900 transition-colors"
                    >
                      Buscar
                    </button>
                  </div>
                </div>
              </div>

              <div
                className="hidden lg:flex items-center justify-center"
                aria-hidden="true"
              >
                <div className="relative w-[280px] h-[250px]">
                  <div className="absolute left-10 top-4 w-32 h-52 rounded-[28px] bg-white border-[8px] border-brand-800 shadow-card" />
                  <div className="absolute left-[74px] top-12 w-16 h-3 rounded-full bg-neutral-200" />
                  <div className="absolute left-[64px] top-78 w-24 h-3 rounded-full bg-neutral-100" />
                  <div className="absolute left-[66px] top-[88px] w-20 h-6 rounded-md bg-brand-100" />
                  <div className="absolute left-[66px] top-[124px] w-28 h-3 rounded-full bg-neutral-200" />
                  <div className="absolute left-[66px] top-[148px] w-24 h-3 rounded-full bg-neutral-200" />

                  <div className="absolute right-8 bottom-4 w-16 h-16 rounded-[10px] bg-red-400 flex items-center justify-center text-white text-3xl font-bold">
                    +
                  </div>

                  <div className="absolute right-0 top-16 w-20 h-28 rounded-full bg-brand-200" />
                </div>
              </div>
            </div>
          </section>

          {erro && <ErrorMessage message={erro} />}

          {loading ? (
            <Loading text="Carregando suas consultas..." />
          ) : (
            <>
              {/* Resumo principal */}
              <section className="grid grid-cols-1 lg:grid-cols-[1fr_0.9fr] gap-5">
                <Card className="border-brand-200 overflow-hidden">
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h2 className="font-poppins text-2xl font-bold text-brand-800">
                          Minha consulta
                        </h2>
                        <p className="text-sm text-neutral-500">
                          Sua próxima consulta agendada.
                        </p>
                      </div>

                      <Badge variant="info">
                        {proximos.length} próximas
                      </Badge>
                    </div>

                    {proximaConsulta ? (
                      <ConsultaDestaque
                        agendamento={proximaConsulta}
                        profissional={profissionais[proximaConsulta.profissionalId]}
                        especialidade={
                          especialidades[proximaConsulta.especialidadeId]
                        }
                        onCancelar={() => handleCancelar(proximaConsulta.id)}
                        cancelando={cancelandoId === proximaConsulta.id}
                      />
                    ) : (
                      <EmptyState
                        title="Nenhuma consulta marcada"
                        description="Você ainda não possui consultas futuras."
                        icon="📅"
                        action={
                          <Link href="/agendamento/especialidade">
                            <Button size="sm">Agendar consulta</Button>
                          </Link>
                        }
                      />
                    )}
                  </div>
                </Card>

                <Card className="bg-brand-700 border-brand-700 text-white">
                  <div className="flex flex-col h-full justify-between gap-6">
                    <div>
                      <h2 className="font-poppins text-2xl font-bold text-white">
                        Histórico de consultas
                      </h2>

                      <p className="text-brand-100 text-sm mt-2 max-w-[330px]">
                        Acesse suas consultas anteriores, canceladas ou
                        concluídas.
                      </p>
                    </div>

                    <div className="border border-white/30 rounded-[8px] p-5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-[10px] bg-white text-brand-700 flex items-center justify-center text-3xl">
                          📄
                        </div>

                        <div>
                          <p className="font-bold text-white">
                            {anteriores.length} registros
                          </p>
                          <p className="text-xs text-brand-100">
                            Consultas no histórico
                          </p>
                        </div>
                      </div>

                      <Link href="/dashboard/historico">
                        <Button variant="outline" size="sm">
                          Ver histórico
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </section>

              {/* Próximas consultas */}
              <section className="bg-white border border-neutral-100 shadow-card rounded-cardLg p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                  <div>
                    <h2 className="font-poppins text-xl font-bold text-brand-800">
                      Próximas consultas
                    </h2>
                    <p className="text-sm text-neutral-500">
                      Acompanhe seus atendimentos marcados.
                    </p>
                  </div>

                  <Link href="/agendamento/especialidade">
                    <Button size="sm">+ Agendar nova</Button>
                  </Link>
                </div>

                {proximos.length === 0 ? (
                  <EmptyState
                    title="Nenhuma consulta agendada"
                    description="Clique em agendar nova para marcar sua primeira consulta."
                    icon="📅"
                  />
                ) : (
                  <ul role="list" className="flex flex-col gap-3">
                    {proximos.map((a) => (
                      <AgendamentoCard
                        key={a.id}
                        agendamento={a}
                        profissional={profissionais[a.profissionalId]}
                        especialidade={especialidades[a.especialidadeId]}
                        onCancelar={() => handleCancelar(a.id)}
                        cancelando={cancelandoId === a.id}
                      />
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </div>
      </DashboardLayout>

      <Footer />
    </>
  );
}

interface ConsultaProps {
  agendamento: Agendamento;
  profissional?: ProfissionalSaude;
  especialidade?: Especialidade;
  onCancelar?: () => void;
  cancelando?: boolean;
}

function ConsultaDestaque({
  agendamento,
  profissional,
  especialidade,
  onCancelar,
  cancelando,
}: ConsultaProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] border border-brand-300 rounded-[8px] overflow-hidden">
      <div className="bg-brand-100 flex items-center justify-center py-8">
        <div className="w-20 h-20 rounded-full bg-brand-700 text-white flex items-center justify-center text-4xl">
          🩺
        </div>
      </div>

      <div className="p-5 flex flex-col justify-center">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <h3 className="font-poppins text-xl font-bold text-brand-800">
            Dr(a). {profissional?.nome ?? "Profissional"}
          </h3>

          <Badge variant={getStatusVariant(agendamento.status)}>
            {statusLabel(agendamento.status)}
          </Badge>
        </div>

        <p className="text-sm text-brand-700 font-semibold">
          {especialidade?.nome ?? "Especialidade"}
        </p>

        <p className="text-xs text-neutral-500 mt-1">
          {formatDate(agendamento.data)} às {agendamento.horario}
        </p>

        <div className="flex flex-wrap gap-2 mt-4">
          <Link href={`/agendamento/especialidade?remarcar=${agendamento.id}`}>
            <Button size="sm">Remarcar</Button>
          </Link>

          {agendamento.status === "confirmado" && (
            <Button
              variant="danger"
              size="sm"
              loading={cancelando}
              onClick={onCancelar}
            >
              Cancelar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

interface AgendamentoCardProps {
  agendamento: Agendamento;
  profissional?: ProfissionalSaude;
  especialidade?: Especialidade;
  onCancelar?: () => void;
  cancelando?: boolean;
}

function AgendamentoCard({
  agendamento,
  profissional,
  especialidade,
  onCancelar,
  cancelando,
}: AgendamentoCardProps) {
  const canCancel = agendamento.status === "confirmado";

  return (
    <li>
      <Card className="border-neutral-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className="w-11 h-11 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center text-xl shrink-0"
              aria-hidden="true"
            >
              🩺
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-poppins font-semibold text-brand-800">
                  {especialidade?.nome ?? "Especialidade"}
                </span>

                <Badge variant={getStatusVariant(agendamento.status)}>
                  {statusLabel(agendamento.status)}
                </Badge>
              </div>

              <p className="text-sm text-neutral-600 mt-1">
                Dr(a). {profissional?.nome ?? "Profissional"}
              </p>

              <p className="text-xs text-neutral-400 mt-1">
                📅 {formatDate(agendamento.data)} às {agendamento.horario}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href={`/agendamento/especialidade?remarcar=${agendamento.id}`}>
              <Button variant="outline" size="sm">
                Remarcar
              </Button>
            </Link>

            {canCancel && (
              <Button
                variant="danger"
                size="sm"
                loading={cancelando}
                onClick={onCancelar}
                aria-label={`Cancelar consulta de ${
                  especialidade?.nome ?? "especialidade"
                }`}
              >
                Cancelar
              </Button>
            )}
          </div>
        </div>
      </Card>
    </li>
  );
}