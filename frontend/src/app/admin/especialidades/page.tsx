"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DashboardLayout, Sidebar, FormContainer } from "@/components/layout";
import { Button, Input, TextArea, ErrorMessage, Loading } from "@/components/ui";
import { especialidadeService } from "@/services";
import { useRequireAuth } from "@/hooks/useAuth";

const ADMIN_LINKS = [
  { href: "/admin",                label: "Dashboard",         icon: "📊" },
  { href: "/admin/unidades",       label: "Unidades de Saúde", icon: "🏥" },
  { href: "/admin/especialidades", label: "Especialidades",    icon: "🩺" },
  { href: "/admin/profissionais",  label: "Profissionais",     icon: "👨‍⚕️" },
  { href: "/admin/agendas",        label: "Agendas",           icon: "📅" },
];

export default function AdminEspecialidadesPage() {
  const { user, carregando } = useRequireAuth(["administrador"]);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [form, setForm] = useState({ nome: "", descricao: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome.trim()) { setErro("Nome obrigatório."); return; }
    setLoading(true); setErro(null);
    try {
      await especialidadeService.cadastrarEspecialidade(form);
      setSucesso(true);
      setForm({ nome: "", descricao: "" });
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
        <FormContainer title="Cadastrar Especialidade" description="Adicione uma nova especialidade médica.">
          {erro    && <ErrorMessage message={erro} />}
          {sucesso && <div className="bg-green-50 border border-green-200 text-green-700 rounded-card px-4 py-3 text-sm mb-4">✅ Especialidade cadastrada!</div>}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 mt-4">
            <Input label="Nome da especialidade" required
              value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
              placeholder="Ex: Cardiologia" />
            <TextArea label="Descrição"
              value={form.descricao} onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))}
              placeholder="Breve descrição da especialidade" />
            <Button type="submit" fullWidth loading={loading} size="lg" className="mt-2">
              Cadastrar Especialidade
            </Button>
          </form>
        </FormContainer>
      </DashboardLayout>
      <Footer />
    </>
  );
}
