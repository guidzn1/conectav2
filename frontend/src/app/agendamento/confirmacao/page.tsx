"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { PageContainer, StepIndicator } from "@/components/layout";
import { Card, Button, ErrorMessage, Badge, Loading } from "@/components/ui";
import { agendamentoService } from "@/services";
import type { Especialidade, UnidadeSaude, ProfissionalSaude, Agendamento } from "@/types";
import { formatDate } from "@/utils";
import { useRequireAuth } from "@/hooks/useAuth";

const WIZARD_STEPS = ["Especialidade", "Unidade", "Profissional", "Data e Horário", "Confirmação"];

export default function ConfirmacaoPage() {
  const router = useRouter();
  const { user, carregando } = useRequireAuth(["paciente"]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [confirmado, setConfirmado] = useState<Agendamento | null>(null);
  const [primeiraConsulta, setPrimeiraConsulta] = useState(true);
  const [tipoVisita, setTipoVisita] = useState<"presencial" | "telemedicina">("presencial");

  const [esp, setEsp]   = useState<Especialidade | null>(null);
  const [uni, setUni]   = useState<UnidadeSaude | null>(null);
  const [pro, setPro]   = useState<ProfissionalSaude | null>(null);
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");

  useEffect(() => {
    try {
      setEsp(JSON.parse(sessionStorage.getItem("wizard_especialidade") ?? "null"));
      setUni(JSON.parse(sessionStorage.getItem("wizard_unidade") ?? "null"));
      setPro(JSON.parse(sessionStorage.getItem("wizard_profissional") ?? "null"));
      setData(sessionStorage.getItem("wizard_data") ?? "");
      setHora(sessionStorage.getItem("wizard_horario") ?? "");
    } catch {
      router.replace("/agendamento/especialidade");
    }
  }, [router]);

  async function handleConfirmar() {
    if (!esp || !uni || !pro || !data || !hora || !user) {
      setErro("Dados incompletos. Reinicie o agendamento.");
      return;
    }
    setLoading(true);
    setErro(null);
    try {
      const result = await agendamentoService.criarAgendamento({
        pacienteId: user.id,
        especialidadeId: esp.id,
        unidadeId: uni.id,
        profissionalId: pro.id,
        data, horario: hora, primeiraConsulta, tipoVisita,
      });
      // Limpa sessão
      ["wizard_especialidade","wizard_unidade","wizard_profissional","wizard_data","wizard_horario"]
        .forEach((k) => sessionStorage.removeItem(k));
      setConfirmado(result);
    } catch {
      setErro("Erro ao confirmar agendamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
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

  // ── Tela de sucesso ──────────────────────────────────────
  if (confirmado) {
    return (
      <>
        <Header />
        <main id="main-content">
          <PageContainer narrow>
            <div className="flex flex-col items-center text-center gap-6 py-12">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-4xl">
                ✅
              </div>
              <h1 className="font-poppins text-2xl font-bold text-brand-800">
                Consulta agendada com sucesso!
              </h1>
              <p className="text-neutral-500">
                Sua consulta foi confirmada. Lembre-se de comparecer com antecedência.
              </p>

              <Card className="w-full max-w-sm text-left">
                <dl className="flex flex-col gap-3">
                  <Row label="Especialidade" value={esp?.nome} />
                  <Row label="Profissional"  value={`Dr(a). ${pro?.nome}`} />
                  <Row label="Unidade"       value={uni?.nome} />
                  <Row label="Data"          value={formatDate(confirmado.data)} />
                  <Row label="Horário"       value={confirmado.horario} />
                  <Row label="Status"        value={
                    <Badge variant="success">Confirmado</Badge>
                  } />
                </dl>
              </Card>

              <div className="flex gap-3">
                <Link href="/dashboard">
                  <Button variant="outline">Ver meus agendamentos</Button>
                </Link>
                <Link href="/agendamento/especialidade">
                  <Button>Agendar outra consulta</Button>
                </Link>
              </div>
            </div>
          </PageContainer>
        </main>
      </>
    );
  }

  // ── Tela de revisão ──────────────────────────────────────
  return (
    <>
      <Header />
      <main id="main-content">
        <PageContainer>
          <StepIndicator steps={WIZARD_STEPS} current={4} />

          <div className="max-w-xl mx-auto">
            <h1 className="font-poppins text-2xl font-bold text-brand-800 mb-1">
              Confirme seu agendamento
            </h1>
            <p className="text-neutral-500 text-sm mb-6">Revise os dados antes de confirmar.</p>

            {erro && <ErrorMessage message={erro} />}

            <Card className="mb-6">
              <dl className="flex flex-col gap-4">
                <Row label="Especialidade" value={esp?.nome} />
                <Row label="Unidade"       value={uni?.nome} />
                <Row label="Endereço"      value={uni?.endereco} />
                <Row label="Profissional"  value={`Dr(a). ${pro?.nome}`} />
                <Row label="Registro"      value={pro?.registroProfissional} />
                <Row label="Data"          value={data ? formatDate(data) : ""} />
                <Row label="Horário"       value={hora} />
              </dl>
            </Card>

            {/* Opções extras */}
            <Card className="mb-6 flex flex-col gap-4">
              <fieldset>
                <legend className="font-semibold text-neutral-700 mb-2">Tipo de visita</legend>
                <div className="flex gap-4">
                  {(["presencial", "telemedicina"] as const).map((tipo) => (
                    <label key={tipo} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="tipoVisita"
                        value={tipo}
                        checked={tipoVisita === tipo}
                        onChange={() => setTipoVisita(tipo)}
                        className="accent-brand-700"
                      />
                      <span className="text-sm capitalize">{tipo}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={primeiraConsulta}
                  onChange={(e) => setPrimeiraConsulta(e.target.checked)}
                  className="accent-brand-700 w-4 h-4"
                />
                <span className="text-sm text-neutral-700">Esta é minha primeira consulta com este profissional</span>
              </label>
            </Card>

            <div className="flex gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>← Voltar</Button>
              <Button fullWidth loading={loading} onClick={handleConfirmar}>
                ✅ Confirmar agendamento
              </Button>
            </div>
          </div>
        </PageContainer>
      </main>
    </>
  );
}

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-4 border-b border-neutral-50 last:border-0 pb-3 last:pb-0">
      <dt className="text-sm text-neutral-500 shrink-0">{label}</dt>
      <dd className="text-sm font-semibold text-brand-800 text-right">{value ?? "—"}</dd>
    </div>
  );
}
