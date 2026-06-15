"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PageContainer, StepIndicator } from "@/components/layout";
import { Card, Button, Loading, ErrorMessage } from "@/components/ui";
import { unidadeSaudeService } from "@/services";
import type { Especialidade, UnidadeSaude } from "@/types";
import { useGeolocation } from "@/hooks/useGeolocation";
import { locationService } from "@/services";

import { useRequireAuth } from "@/hooks/useAuth";

const WIZARD_STEPS = ["Especialidade", "Unidade", "Profissional", "Data e Horário", "Confirmação"];

export default function UnidadePage() {
  const { user, carregando } = useRequireAuth(["paciente"]);
  const router = useRouter();
  const { latitude, longitude, carregando: geoCarregando, solicitar } = useGeolocation();
  const [unidades, setUnidades] = useState<UnidadeSaude[]>([]);
  const [especialidade, setEspecialidade] = useState<Especialidade | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const raw = sessionStorage.getItem("wizard_especialidade");
    if (!raw) { router.replace("/agendamento/especialidade"); return; }
    const esp: Especialidade = JSON.parse(raw);
    setEspecialidade(esp);

    unidadeSaudeService.getUnidadesPorEspecialidade(esp.id)
      .then((unis) => {
        // Calcula distância se tiver coords
        if (latitude && longitude) {
          return unis.map((u) => ({
            ...u,
            distancia: u.latitude && u.longitude
              ? locationService.calcularDistancia(latitude, longitude, u.latitude, u.longitude)
              : undefined,
          })).sort((a, b) => (a.distancia ?? 99) - (b.distancia ?? 99));
        }
        return unis;
      })
      .then(setUnidades)
      .catch(() => setErro("Erro ao carregar unidades."))
      .finally(() => setLoading(false));
  }, [latitude, longitude, router, user]);

  function handleSelect(unidade: UnidadeSaude) {
    sessionStorage.setItem("wizard_unidade", JSON.stringify(unidade));
    router.push("/agendamento/medico");
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
          <StepIndicator steps={WIZARD_STEPS} current={1} />

          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
              <div>
                <h1 className="font-poppins text-2xl font-bold text-brand-800">
                  Escolha uma unidade de saúde
                </h1>
                {especialidade && (
                  <p className="text-neutral-500 text-sm">
                    Especialidade: <strong>{especialidade.nome}</strong>
                  </p>
                )}
              </div>
              <Button
                variant="outline" size="sm"
                onClick={solicitar}
                loading={geoCarregando}
                aria-label="Usar minha localização para ordenar por proximidade"
              >
                📍 Usar localização
              </Button>
            </div>

            {latitude && (
              <p className="text-xs text-success mb-4">
                ✅ Unidades ordenadas por proximidade à sua localização.
              </p>
            )}

            {erro    && <ErrorMessage message={erro} />}
            {loading ? <Loading /> : (
              <ul role="list" className="flex flex-col gap-4">
                {unidades.map((u) => (
                  <li key={u.id}>
                    <Card
                      hover
                      onClick={() => handleSelect(u)}
                      className="cursor-pointer"
                      role="button"
                      aria-label={`Selecionar ${u.nome}`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="font-semibold text-brand-800">{u.nome}</h3>
                          <p className="text-sm text-neutral-500 mt-1">📍 {u.endereco}</p>
                          <p className="text-sm text-neutral-500">📞 {u.telefone}</p>
                        </div>
                        {u.distancia != null && (
                          <span className="text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded-full font-semibold shrink-0">
                            {u.distancia.toFixed(1)} km
                          </span>
                        )}
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                ← Voltar
              </Button>
            </div>
          </div>
        </PageContainer>
      </main>
    </>
  );
}
