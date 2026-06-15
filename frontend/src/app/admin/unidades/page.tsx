"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DashboardLayout, Sidebar, FormContainer } from "@/components/layout";
import { Button, Input, TextArea, ErrorMessage, Loading } from "@/components/ui";
import { unidadeSaudeService } from "@/services";
import { useRequireAuth } from "@/hooks/useAuth";

const ADMIN_LINKS = [
  { href: "/admin",                label: "Dashboard",         icon: "📊" },
  { href: "/admin/unidades",       label: "Unidades de Saúde", icon: "🏥" },
  { href: "/admin/especialidades", label: "Especialidades",    icon: "🩺" },
  { href: "/admin/profissionais",  label: "Profissionais",     icon: "👨‍⚕️" },
];

export default function AdminUnidadesPage() {
  const { user, carregando } = useRequireAuth(["administrador"]);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [form, setForm] = useState({
    nome: "", endereco: "", telefone: "", latitude: "", longitude: "",
  });

  function set(f: keyof typeof form, v: string) {
    setForm((p) => ({ ...p, [f]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome.trim() || !form.endereco.trim()) {
      setErro("Nome e endereço são obrigatórios.");
      return;
    }
    setLoading(true);
    setErro(null);
    try {
      await unidadeSaudeService.cadastrarUnidade({
        nome: form.nome, endereco: form.endereco, telefone: form.telefone,
        especialidadeIds: [],
        latitude:  form.latitude  ? parseFloat(form.latitude)  : undefined,
        longitude: form.longitude ? parseFloat(form.longitude) : undefined,
      });
      setSucesso(true);
      setTimeout(() => router.push("/admin"), 1500);
    } catch {
      setErro("Erro ao cadastrar unidade.");
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

  return (
    <>
      <Header />
      <DashboardLayout sidebar={<Sidebar links={ADMIN_LINKS} />}>
        <FormContainer
          title="Cadastrar Unidade de Saúde"
          description="Preencha os dados da nova unidade."
        >
          {erro     && <ErrorMessage message={erro} />}
          {sucesso  && (
            <div role="status" className="bg-green-50 border border-green-200 text-green-700 rounded-card px-4 py-3 text-sm mb-4">
              ✅ Unidade cadastrada com sucesso!
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 mt-4">
            <Input label="Nome da unidade" required
              value={form.nome} onChange={(e) => set("nome", e.target.value)}
              placeholder="Ex: UBS Família Pedro Cavalcante"
            />
            <TextArea label="Endereço completo" required
              value={form.endereco} onChange={(e) => set("endereco", e.target.value)}
              placeholder="Rua, número, bairro, cidade - UF"
            />
            <Input label="Telefone"
              value={form.telefone} onChange={(e) => set("telefone", e.target.value)}
              placeholder="(94) 3322-0000"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Latitude (opcional)"
                value={form.latitude} onChange={(e) => set("latitude", e.target.value)}
                placeholder="-5.3652" type="number" step="0.0001"
              />
              <Input label="Longitude (opcional)"
                value={form.longitude} onChange={(e) => set("longitude", e.target.value)}
                placeholder="-49.1182" type="number" step="0.0001"
              />
            </div>
            <Button type="submit" fullWidth loading={loading} size="lg" className="mt-2">
              Cadastrar Unidade
            </Button>
          </form>
        </FormContainer>
      </DashboardLayout>
      <Footer />
    </>
  );
}
