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
import type { Agendamento, Especialidade, ProfissionalSaude } from "@/types";
import { formatCPF, formatPhone, formatDate, statusLabel } from "@/utils";
import { useRequireAuth } from "@/hooks/useAuth";

const PACIENTE_LINKS = [
  { href: "/dashboard", label: "Meus Agendamentos", icon: "📅" },
  { href: "/agendamento/especialidade", label: "Agendar Consulta", icon: "➕" },
  { href: "/dashboard/historico", label: "Histórico", icon: "📋" },
  { href: "/dashboard/perfil", label: "Meu Perfil", icon: "👤" },
];

function ordenarMaisRecentes(a: Agendamento, b: Agendamento) {
  const dataA = new Date(`${a.data}T${a.horario ?? "00:00"}`).getTime();
  const dataB = new Date(`${b.data}T${b.horario ?? "00:00"}`).getTime();
  return dataB - dataA;
}

export default function PerfilPage() {
  const { user, carregando } = useRequireAuth(["paciente"]);

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [profissionais, setProfissionais] = useState<Record<string, ProfissionalSaude>>({});
  const [especialidades, setEspecialidades] = useState<Record<string, Especialidade>>({});
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

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
        setErro("Não foi possível carregar os dados do perfil.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user]);

  const resumo = useMemo(() => {
    return {
      total: agendamentos.length,
      proximas: agendamentos.filter((a) => a.status !== "cancelado" && a.status !== "concluido").length,
      concluidas: agendamentos.filter((a) => a.status === "concluido").length,
      laudos: agendamentos.filter((a) => a.status === "concluido" && a.laudo).length,
    };
  }, [agendamentos]);

  const ultimosLaudos = useMemo(() => {
    return agendamentos
      .filter((a) => a.status === "concluido" && a.laudo)
      .sort(ordenarMaisRecentes)
      .slice(0, 3);
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

      <DashboardLayout sidebar={<Sidebar links={PACIENTE_LINKS} />}>
        <div className="flex flex-col gap-6">
          <section className="bg-white border border-neutral-100 shadow-card rounded-cardLg p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-brand-700 text-white flex items-center justify-center text-2xl font-bold shrink-0">
                  {user.nome.charAt(0).toUpperCase()}
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-brand-700 mb-2">
                    Perfil do paciente
                  </p>

                  <h1 className="font-poppins text-3xl font-bold text-brand-800 leading-tight">
                    {user.nome}
                  </h1>

                  <p className="text-neutral-500 text-sm mt-1">
                    Seus dados cadastrais, consultas e registros disponíveis no Conecta SUS+.
                  </p>
                </div>
              </div>

              <Link href="/agendamento/especialidade">
                <Button size="sm">+ Agendar consulta</Button>
              </Link>
            </div>
          </section>

          {erro && <ErrorMessage message={erro} />}

          <section aria-label="Resumo do perfil">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <ResumoCard label="Consultas" value={resumo.total} description="registradas" />
              <ResumoCard label="Próximas" value={resumo.proximas} description="agendadas" />
              <ResumoCard label="Concluídas" value={resumo.concluidas} description="atendimentos finalizados" />
              <ResumoCard label="Laudos" value={resumo.laudos} description="disponíveis" />
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6">
            <Card className="border-neutral-200">
              <div className="flex flex-col gap-5">
                <div>
                  <h2 className="font-poppins text-xl font-bold text-brand-800">
                    Dados pessoais
                  </h2>
                  <p className="text-sm text-neutral-500">
                    Informações usadas para identificação no sistema.
                  </p>
                </div>

                <dl className="flex flex-col gap-4">
                  <InfoRow label="Nome completo" value={user.nome} />
                  <InfoRow label="CPF" value={formatCPF(user.cpf)} />
                  <InfoRow label="E-mail" value={user.email} />
                  <InfoRow label="Telefone" value={user.telefone ? formatPhone(user.telefone) : "Não informado"} />
                  <InfoRow label="Perfil" value="Cidadão / Paciente" />
                </dl>
              </div>
            </Card>

            <Card className="border-neutral-200">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <h2 className="font-poppins text-xl font-bold text-brand-800">
                      Últimos laudos
                    </h2>
                    <p className="text-sm text-neutral-500">
                      Registros salvos pelos profissionais de saúde.
                    </p>
                  </div>

                  <Link href="/dashboard/historico">
                    <Button variant="outline" size="sm">Ver histórico</Button>
                  </Link>
                </div>

                {loading ? (
                  <Loading text="Carregando registros..." />
                ) : ultimosLaudos.length === 0 ? (
                  <EmptyState
                    title="Nenhum laudo disponível"
                    description="Quando uma consulta for finalizada pelo médico, o registro aparecerá aqui."
                    icon="📋"
                  />
                ) : (
                  <ul role="list" className="flex flex-col gap-3">
                    {ultimosLaudos.map((a) => (
                      <li key={a.id} className="border border-neutral-100 rounded-card p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-poppins font-semibold text-brand-800 text-sm">
                                {especialidades[a.especialidadeId]?.nome ?? "Especialidade"}
                              </p>
                              <Badge variant="info">{statusLabel(a.status)}</Badge>
                            </div>

                            <p className="text-sm text-neutral-600 mt-1">
                              Dr(a). {profissionais[a.profissionalId]?.nome ?? "Profissional"}
                            </p>

                            <p className="text-xs text-neutral-400 mt-1">
                              {formatDate(a.data)} às {a.horario}
                            </p>
                          </div>
                        </div>

                        <p className="text-sm text-neutral-600 mt-3">
                          {a.laudo?.diagnostico || a.laudo?.conduta || a.laudo?.observacoes || "Registro clínico salvo."}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>
          </section>
        </div>
      </DashboardLayout>

      <Footer />
    </>
  );
}

function ResumoCard({ label, value, description }: { label: string; value: number; description: string }) {
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-neutral-50 last:border-0 pb-3 last:pb-0">
      <dt className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">{label}</dt>
      <dd className="text-sm font-medium text-neutral-700 break-words">{value}</dd>
    </div>
  );
}
