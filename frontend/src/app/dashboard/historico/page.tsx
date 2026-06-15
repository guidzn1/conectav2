"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DashboardLayout, Sidebar } from "@/components/layout";
import { Card, Badge, Button, Loading, EmptyState, ErrorMessage } from "@/components/ui";
import { agendamentoService, profissionalService, especialidadeService } from "@/services";
import type { Agendamento, ProfissionalSaude, Especialidade } from "@/types";
import { formatDate, statusLabel } from "@/utils";
import { useRequireAuth } from "@/hooks/useAuth";

const PACIENTE_LINKS = [
  { href: "/dashboard",                  label: "Meus Agendamentos", icon: "📅" },
  { href: "/agendamento/especialidade",  label: "Agendar Consulta",  icon: "➕" },
  { href: "/dashboard/historico",        label: "Histórico",         icon: "📋" },
  { href: "/dashboard/perfil",           label: "Meu Perfil",        icon: "👤" },
];

export default function HistoricoPage() {
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

  const anteriores = agendamentos.filter((a) => a.status === "concluido" || a.status === "cancelado");

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
          <div>
            <h1 className="font-poppins text-2xl font-bold text-brand-800">
              Histórico de Consultas 📋
            </h1>
            <p className="text-neutral-500 text-sm">Consulte suas consultas passadas e cancelamentos.</p>
          </div>

          {erro && <ErrorMessage message={erro} />}
          {loading ? <Loading /> : (
            <section aria-labelledby="historico-title">
              <h2 id="historico-title" className="visually-hidden">Consultas Anteriores</h2>
              {anteriores.length === 0 ? (
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
                  {anteriores.map((a) => (
                    <li key={a.id}>
                      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-poppins font-semibold text-brand-800">
                              {especialidades[a.especialidadeId]?.nome ?? "Especialidade"}
                            </span>
                            <Badge variant={
                              a.status === "concluido" ? "info" : "error"
                            }>
                              {statusLabel(a.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-neutral-600">
                            Dr(a). {profissionais[a.profissionalId]?.nome ?? "Profissional"}
                          </p>
                          <p className="text-xs text-neutral-400">
                            📅 {formatDate(a.data)} às {a.horario}
                          </p>
                        </div>
                      </Card>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>
      </DashboardLayout>
      <Footer />
    </>
  );
}
