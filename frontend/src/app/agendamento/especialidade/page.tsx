"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PageContainer, StepIndicator } from "@/components/layout";
import { Card, Loading, ErrorMessage, Input } from "@/components/ui";
import { especialidadeService } from "@/services";
import type { Especialidade } from "@/types";

import { useRequireAuth } from "@/hooks/useAuth";

const WIZARD_STEPS = ["Especialidade", "Unidade", "Profissional", "Data e Horário", "Confirmação"];

const ICONS: Record<string, string> = {
  "Clínico Geral":"🩺","Ginecologista":"🌸","Pediatria":"👶","Ortopedia":"🦴",
  "Cardiologia":"❤️","Dermatologia":"🧴","Oftalmologia":"👁️","Odontologia":"🦷",
  "Neurologia":"🧠","Psiquiatria":"💭","Endocrinologia":"⚗️","Urologia":"💧",
  "Gastroenterologia":"🫁","Otorrinolaringologia":"👂","Reumatologia":"🔩",
};

export default function EspecialidadePage() {
  const { user, carregando } = useRequireAuth(["paciente"]);
  const router = useRouter();
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    especialidadeService.getEspecialidades()
      .then(setEspecialidades)
      .catch(() => setErro("Erro ao carregar especialidades."))
      .finally(() => setLoading(false));
  }, [user]);

  function handleSelect(esp: Especialidade) {
    sessionStorage.setItem("wizard_especialidade", JSON.stringify(esp));
    router.push("/agendamento/unidade");
  }

  const filtradas = especialidades.filter((e) =>
    e.nome.toLowerCase().includes(filtro.toLowerCase())
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
      <main id="main-content">
        <PageContainer>
          <StepIndicator steps={WIZARD_STEPS} current={0} />

          <div className="max-w-3xl mx-auto">
            <h1 className="font-poppins text-2xl font-bold text-brand-800 mb-1">
              Qual especialidade você precisa?
            </h1>
            <p className="text-neutral-500 text-sm mb-6">Selecione a especialidade para continuar.</p>

            <Input
              placeholder="Buscar especialidade..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              aria-label="Filtrar especialidades"
              className="mb-6"
            />

            {erro    && <ErrorMessage message={erro} />}
            {loading ? <Loading /> : (
              <ul
                role="list"
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                aria-label="Especialidades disponíveis"
              >
                {filtradas.map((esp) => (
                  <li key={esp.id}>
                    <Card
                      hover

                      padding="sm"
                      onClick={() => handleSelect(esp)}
                      className="w-full text-center flex flex-col items-center gap-2 p-5 focus-visible:ring-2 focus-visible:ring-brand-700"
                      role="button"
                      aria-label={`Selecionar especialidade ${esp.nome}`}
                    >
                      <span className="text-3xl" aria-hidden="true">
                        {ICONS[esp.nome] ?? "🏥"}
                      </span>
                      <span className="text-sm font-semibold text-brand-800">{esp.nome}</span>
                    </Card>
                  </li>
                ))}
              </ul>
            )}

            {!loading && filtradas.length === 0 && (
              <p className="text-center text-neutral-400 mt-8">
                Nenhuma especialidade encontrada para "{filtro}".
              </p>
            )}
          </div>
        </PageContainer>
      </main>
    </>
  );
}
