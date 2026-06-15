"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DashboardLayout, Sidebar, FormContainer } from "@/components/layout";
import { Button, Input, Select, ErrorMessage, Loading } from "@/components/ui";
import { api } from "@/services/api";
import type { Especialidade } from "@/types";
import { useRequireAuth } from "@/hooks/useAuth";

const UBS_LINKS = [
  { href: "/ubs",         label: "Dashboard",    icon: "📊" },
  { href: "/ubs/medicos", label: "Médicos",      icon: "👨‍⚕️" },
  { href: "/ubs/agendas", label: "Agendas",      icon: "📅" },
];

export default function UbsMedicosPage() {
  const { user, carregando } = useRequireAuth(["ubs"]);
  const router = useRouter();
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [form, setForm] = useState({
    nome: "", cpf: "", email: "", telefone: "",
    senha: "senha123", registroProfissional: "", especialidadeId: "",
  });

  useEffect(() => {
    if (!user) return;
    api.get<Especialidade[]>("/especialidades").then(setEspecialidades).catch(() => {});
  }, [user]);

  function set(f: keyof typeof form, v: string) {
    setForm((p) => ({ ...p, [f]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome || !form.cpf || !form.email || !form.especialidadeId) {
      setErro("Preencha todos os campos obrigatórios."); return;
    }
    setLoading(true); setErro(null);
    try {
      await api.post("/ubs/medicos", { ...form, tipoUsuario: "profissionalSaude" });
      setSucesso(true);
      setTimeout(() => router.push("/ubs"), 1500);
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro ao cadastrar.");
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
        <FormContainer title="Cadastrar Médico" description="Adicione um novo profissional à sua unidade.">
          {erro    && <ErrorMessage message={erro} />}
          {sucesso && <div className="bg-green-50 border border-green-200 text-green-700 rounded-card px-4 py-3 text-sm mb-4">✅ Médico cadastrado com sucesso!</div>}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 mt-4">
            <Input label="Nome completo" required value={form.nome} onChange={(e) => set("nome", e.target.value)} placeholder="Dr(a). Nome Completo" />
            <Input label="CPF (só números)" required value={form.cpf} onChange={(e) => set("cpf", e.target.value)} placeholder="00000000000" maxLength={11} />
            <Input label="E-mail" type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="email@hospital.com" />
            <Input label="Telefone" value={form.telefone} onChange={(e) => set("telefone", e.target.value)} placeholder="(94) 99999-0000" />
            <Input label="Registro Profissional" required value={form.registroProfissional} onChange={(e) => set("registroProfissional", e.target.value)} placeholder="CRM/PA 12345" />
            <Select label="Especialidade" required
              value={form.especialidadeId} onChange={(e) => set("especialidadeId", e.target.value)}
              placeholder="Selecione uma especialidade"
              options={especialidades.map((e) => ({ value: e.id, label: e.nome }))} />
            <Input label="Senha inicial" type="password" value={form.senha} onChange={(e) => set("senha", e.target.value)} />
            <Button type="submit" fullWidth loading={loading} size="lg" className="mt-2">Cadastrar Médico</Button>
          </form>
        </FormContainer>
      </DashboardLayout>
      <Footer />
    </>
  );
}
