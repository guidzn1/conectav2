"use client";

import { useEffect, useState } from "react";
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
import type {
  Agendamento,
  ProfissionalSaude,
  Especialidade,
} from "@/types";
import { formatDate, statusLabel } from "@/utils";
import { useRequireAuth } from "@/hooks/useAuth";

const PACIENTE_LINKS = [
  {
    href: "/dashboard",
    label: "Meus Agendamentos",
    icon: "📅",
  },
  {
    href: "/agendamento/especialidade",
    label: "Agendar Consulta",
    icon: "➕",
  },
  {
    href: "/dashboard/historico",
    label: "Histórico",
    icon: "📋",
  },
  {
    href: "/dashboard/perfil",
    label: "Meu Perfil",
    icon: "👤",
  },
];

export default function DashboardPage() {
  const { user, carregando } = useRequireAuth(["paciente"]);

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [profissionais, setProfissionais] = useState<
    Record<string, ProfissionalSaude>
  >({});
  const [especialidades, setEspecialidades] = useState<
    Record<string, Especialidade>
  >({});

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
        setErro("Erro ao carregar agendamentos.");
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

  const proximos = agendamentos.filter(
    (a) => a.status !== "cancelado" && a.status !== "concluido"
  );

  const anteriores = agendamentos.filter(
    (a) => a.status === "concluido" || a.status === "cancelado"
  );

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
          {/* Boas-vindas */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-poppins text-2xl font-bold text-brand-800">
                Olá, {user.nome.split(" ")[0]} 👋
              </h1>

              <p className="text-neutral-500 text-sm">
                Gerencie suas consultas aqui.
              </p>
            </div>

            <Link href="/agendamento/especialidade">
              <Button>+ Agendar consulta</Button>
            </Link>
          </div>

          {erro && <ErrorMessage message={erro} />}

          {loading ? (
            <Loading />
          ) : (
            <>
              {/* Próximas consultas */}
              <section aria-labelledby="proximas-title">
                <h2
                  id="proximas-title"
                  className="font-poppins font-bold text-lg text-brand-700 mb-4"
                >
                  Próximas consultas
                </h2>

                {proximos.length === 0 ? (
                  <EmptyState
                    title="Nenhuma consulta agendada"
                    description="Clique em 'Agendar consulta' para marcar sua primeira consulta."
                    icon="📅"
                    action={
                      <Link href="/agendamento/especialidade">
                        <Button size="sm">Agendar agora</Button>
                      </Link>
                    }
                  />
                ) : (
                  <ul role="list" className="flex flex-col gap-4">
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

              {/* Histórico */}
              {anteriores.length > 0 && (
                <section aria-labelledby="historico-title">
                  <h2
                    id="historico-title"
                    className="font-poppins font-bold text-lg text-neutral-500 mb-4"
                  >
                    Histórico
                  </h2>

                  <ul role="list" className="flex flex-col gap-3">
                    {anteriores.map((a) => (
                      <AgendamentoCard
                        key={a.id}
                        agendamento={a}
                        profissional={profissionais[a.profissionalId]}
                        especialidade={especialidades[a.especialidadeId]}
                        readOnly
                      />
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </div>
      </DashboardLayout>

      <Footer />
    </>
  );
}

interface AgendamentoCardProps {
  agendamento: Agendamento;
  profissional?: ProfissionalSaude;
  especialidade?: Especialidade;
  onCancelar?: () => void;
  cancelando?: boolean;
  readOnly?: boolean;
}

function AgendamentoCard({
  agendamento,
  profissional,
  especialidade,
  onCancelar,
  cancelando,
  readOnly,
}: AgendamentoCardProps) {
  const canCancel = !readOnly && agendamento.status === "confirmado";

  const badgeVariant =
    agendamento.status === "confirmado"
      ? "success"
      : agendamento.status === "cancelado"
      ? "error"
      : agendamento.status === "concluido"
      ? "info"
      : "warning";

  return (
    <li>
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-poppins font-semibold text-brand-800">
              {especialidade?.nome ?? "Especialidade"}
            </span>

            <Badge variant={badgeVariant}>
              {statusLabel(agendamento.status)}
            </Badge>
          </div>

          <p className="text-sm text-neutral-600">
            Dr(a). {profissional?.nome ?? "Profissional"}
          </p>

          <p className="text-xs text-neutral-400">
            📅 {formatDate(agendamento.data)} às {agendamento.horario}
          </p>
        </div>

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
      </Card>
    </li>
  );
}