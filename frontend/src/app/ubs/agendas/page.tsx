"use client";
import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DashboardLayout, Sidebar } from "@/components/layout";
import { Card, Button, Select, ErrorMessage, Loading } from "@/components/ui";
import { api } from "@/services/api";
import type { ProfissionalSaude, Horario } from "@/types";
import { cn } from "@/utils";
import { useRequireAuth } from "@/hooks/useAuth";

const UBS_LINKS = [
  { href: "/ubs",         label: "Dashboard",    icon: "📊" },
  { href: "/ubs/medicos", label: "Médicos",      icon: "👨‍⚕️" },
  { href: "/ubs/agendas", label: "Agendas",      icon: "📅" },
];

const HORAS = ["07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"];

export default function UbsAgendasPage() {
  const { user, carregando } = useRequireAuth(["ubs"]);
  const [profissionais, setProfissionais] = useState<ProfissionalSaude[]>([]);
  const [profId, setProfId] = useState("");
  const [data, setData]     = useState("");
  const [horarios, setHorarios] = useState<Horario[]>(
    HORAS.map((hora) => ({ hora, disponivel: true }))
  );
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro]       = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    api.get<ProfissionalSaude[]>("/ubs/medicos").then(setProfissionais).catch(() => {});
  }, [user]);

  function toggleHorario(hora: string) {
    setHorarios((hs) => hs.map((h) => h.hora === hora ? { ...h, disponivel: !h.disponivel } : h));
  }

  async function handleSalvar() {
    if (!profId || !data) { setErro("Selecione profissional e data."); return; }
    setLoading(true); setErro(null); setSucesso(false);
    try {
      await api.post("/ubs/agendas", { profissionalId: profId, data, horarios });
      setSucesso(true);
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally { setLoading(false); }
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
      <DashboardLayout sidebar={<Sidebar links={UBS_LINKS} />}>
        <div className="flex flex-col gap-6">
          <h1 className="font-poppins text-2xl font-bold text-brand-800">Organizar Agendas</h1>
          {erro    && <ErrorMessage message={erro} />}
          {sucesso && <div className="bg-green-50 border border-green-200 text-green-700 rounded-card px-4 py-3 text-sm">✅ Agenda salva!</div>}

          <Card>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Select label="Profissional" value={profId} onChange={(e) => setProfId(e.target.value)}
                placeholder="Selecione o profissional"
                options={profissionais.map((p) => ({ value: p.id, label: p.nome }))}
                className="flex-1" />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-neutral-700">Data</label>
                <input type="date" value={data} onChange={(e) => setData(e.target.value)}
                  className="border border-neutral-300 rounded-input px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700" />
              </div>
            </div>

            <p className="text-sm font-semibold text-neutral-700 mb-3">
              Clique nos horários para ativar/desativar:
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-6">
              {horarios.map(({ hora, disponivel }) => (
                <button
                  key={hora}
                  onClick={() => toggleHorario(hora)}
                  className={cn(
                    "py-2 px-3 rounded-card border text-sm font-semibold transition-all focus-visible:outline-brand-700",
                    disponivel
                      ? "bg-brand-700 border-brand-700 text-white"
                      : "bg-neutral-100 border-neutral-200 text-neutral-400"
                  )}
                  aria-pressed={disponivel}
                >
                  {hora}
                </button>
              ))}
            </div>
            <Button fullWidth loading={loading} onClick={handleSalvar}>
              💾 Salvar Agenda
            </Button>
          </Card>
        </div>
      </DashboardLayout>
      <Footer />
    </>
  );
}
