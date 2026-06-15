"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PageContainer, StepIndicator } from "@/components/layout";
import { Card, Button, Loading, ErrorMessage, Badge } from "@/components/ui";
import { profissionalService, especialidadeService } from "@/services";
import type { Especialidade, ProfissionalSaude, UnidadeSaude } from "@/types";

import { useRequireAuth } from "@/hooks/useAuth";

const WIZARD_STEPS = ["Especialidade", "Unidade", "Profissional", "Data e Horário", "Confirmação"];

export default function MedicoPage() {
  const { user, carregando } = useRequireAuth(["paciente"]);
  const router = useRouter();
  const [profissionais, setProfissionais] = useState<ProfissionalSaude[]>([]);
  const [especialidade, setEspecialidade] = useState<Especialidade | null>(null);
  const [unidade, setUnidade] = useState<UnidadeSaude | null>(null);
  const [especialidades, setEspecialidades] = useState<Record<string, Especialidade>>({});
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const rawEsp = sessionStorage.getItem("wizard_especialidade");
    const rawUni = sessionStorage.getItem("wizard_unidade");
    if (!rawEsp || !rawUni) { router.replace("/agendamento/especialidade"); return; }
    const esp: Especialidade = JSON.parse(rawEsp);
    setEspecialidade(esp);
    setUnidade(JSON.parse(rawUni));

    Promise.all([
      profissionalService.getProfissionaisPorEspecialidade(esp.id),
      especialidadeService.getEspecialidades(),
    ])
      .then(([pros, esps]) => {
        setProfissionais(pros);
        setEspecialidades(Object.fromEntries(esps.map((e) => [e.id, e])));
      })
      .catch(() => setErro("Erro ao carregar profissionais."))
      .finally(() => setLoading(false));
  }, [router, user]);

  function handleSelect(pro: ProfissionalSaude) {
    sessionStorage.setItem("wizard_profissional", JSON.stringify(pro));
    router.push("/agendamento/horario");
  }

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
      <main id="main-content">
        <PageContainer>
          <StepIndicator steps={WIZARD_STEPS} current={2} />

          <div className="max-w-3xl mx-auto">
            <h1 className="font-poppins text-2xl font-bold text-brand-800 mb-1">
              Escolha o profissional
            </h1>
            <p className="text-neutral-500 text-sm mb-6">
              {especialidade?.nome} · {unidade?.nome}
            </p>

            {erro    && <ErrorMessage message={erro} />}
            {loading ? <Loading /> : profissionais.length === 0 ? (
              <p className="text-center text-neutral-400 py-12">
                Nenhum profissional disponível para esta especialidade nesta unidade.
              </p>
            ) : (
              <ul role="list" className="flex flex-col gap-4">
                {profissionais.map((pro) => (
                  <li key={pro.id}>
                    <Card hover onClick={() => handleSelect(pro)} className="cursor-pointer">
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center text-2xl font-bold text-brand-700 shrink-0">
                          {pro.nome.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-brand-800 truncate">{pro.nome}</h3>
                            <Badge variant="info">
                              {especialidades[pro.especialidadeId]?.nome ?? ""}
                            </Badge>
                          </div>
                          <p className="text-xs text-neutral-500 mt-0.5">{pro.registroProfissional}</p>
                          {pro.bio && <p className="text-sm text-neutral-600 mt-1 line-clamp-2">{pro.bio}</p>}
                        </div>
                        <span className="text-brand-300 text-xl shrink-0" aria-hidden="true">›</span>
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>← Voltar</Button>
            </div>
          </div>
        </PageContainer>
      </main>
    </>
  );
}
