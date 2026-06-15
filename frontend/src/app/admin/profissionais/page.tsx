"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DashboardLayout, Sidebar, FormContainer } from "@/components/layout";
import { Button, Input, Select, ErrorMessage, Loading } from "@/components/ui";
import { profissionalService, especialidadeService } from "@/services";
import type { Especialidade } from "@/types";
import { useRequireAuth } from "@/hooks/useAuth";

const ADMIN_LINKS = [
  { href: "/admin",                label: "Dashboard",         icon: "📊" },
  { href: "/admin/unidades",       label: "Unidades de Saúde", icon: "🏥" },
  { href: "/admin/especialidades", label: "Especialidades",    icon: "🩺" },
  { href: "/admin/profissionais",  label: "Profissionais",     icon: "👨‍⚕️" },
  { href: "/admin/agendas",        label: "Agendas",           icon: "📅" },
];

export default function AdminProfissionaisPage() {
  const { user, carregando } = useRequireAuth(["administrador"]);
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
    especialidadeService.getEspecialidades().then(setEspecialidades).catch(() => {});
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
      await profissionalService.cadastrarProfissional({ ...form, tipoUsuario: "profissionalSaude" });
      setSucesso(true);
      setTimeout(() => router.push("/admin"), 1500);
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
      <DashboardLayout sidebar={<Sidebar links={ADMIN_LINKS} />}>
        <FormContainer title="Cadastrar Profissional" description="Adicione um novo profissional de saúde.">
          {erro    && <ErrorMessage message={erro} />}
          {sucesso && <div className="bg-green-50 border border-green-200 text-green-700 rounded-card px-4 py-3 text-sm mb-4">✅ Profissional cadastrado!</div>}
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
            <Button type="submit" fullWidth loading={loading} size="lg" className="mt-2">Cadastrar Profissional</Button>
          </form>
        </FormContainer>
      </DashboardLayout>
      <Footer />
    </>
  );
}
