"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DashboardLayout, Sidebar } from "@/components/layout";
import { Card, Badge, Loading, ErrorMessage, EmptyState } from "@/components/ui";
import { api } from "@/services/api";
import type { Agenda } from "@/types";
import { formatDate } from "@/utils";
import { useRequireAuth } from "@/hooks/useAuth";

const MEDICO_LINKS = [
  { href: "/medico",           label: "Minha Agenda",  icon: "📅" },
  { href: "/medico/consultas", label: "Consultas",     icon: "👥" },
  { href: "/medico/horarios",  label: "Meus Horários", icon: "🕐" },
];

export default function MedicoHorariosPage() {
  const { user, carregando } = useRequireAuth(["profissionalSaude"]);
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    api.get<Agenda[]>("/medico/horarios")
      .then(setAgendas)
      .catch(() => setErro("Erro ao carregar horários."))
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
      <DashboardLayout sidebar={<Sidebar links={MEDICO_LINKS} />}>
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="font-poppins text-2xl font-bold text-brand-800">
              Meus Horários 🕐
            </h1>
            <p className="text-neutral-500 text-sm">
              Dr(a). {user?.nome} — visualize suas agendas e horários disponíveis.
            </p>
          </div>

          {erro    && <ErrorMessage message={erro} />}
          {loading ? <Loading /> : agendas.length === 0 ? (
            <EmptyState
              title="Nenhuma agenda cadastrada"
              description="Você ainda não possui horários configurados."
              icon="📭"
            />
          ) : (
            <ul role="list" className="flex flex-col gap-4">
              {agendas.map((agenda) => (
                <li key={agenda.id}>
                  <Card>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <h2 className="font-poppins font-bold text-lg text-brand-700">
                          📅 {formatDate(agenda.data)}
                        </h2>
                        <Badge variant="info">
                          {agenda.horarios.filter((h) => h.disponivel).length} disponíveis
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {agenda.horarios.map(({ hora, disponivel }) => (
                          <div
                            key={hora}
                            className={`py-2 px-3 rounded-card border text-sm font-semibold text-center ${
                              disponivel
                                ? "bg-brand-50 border-brand-200 text-brand-700"
                                : "bg-neutral-100 border-neutral-200 text-neutral-400 line-through"
                            }`}
                          >
                            {hora}
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DashboardLayout>
      <Footer />
    </>
  );
}
