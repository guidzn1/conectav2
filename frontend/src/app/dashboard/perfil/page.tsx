"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DashboardLayout, Sidebar, FormContainer } from "@/components/layout";
import { Loading, Badge } from "@/components/ui";
import { useRequireAuth } from "@/hooks/useAuth";
import { formatCPF, formatPhone } from "@/utils";

const PACIENTE_LINKS = [
  { href: "/dashboard",                  label: "Meus Agendamentos", icon: "📅" },
  { href: "/agendamento/especialidade",  label: "Agendar Consulta",  icon: "➕" },
  { href: "/dashboard/historico",        label: "Histórico",         icon: "📋" },
  { href: "/dashboard/perfil",           label: "Meu Perfil",        icon: "👤" },
];

export default function PerfilPage() {
  const { user, carregando } = useRequireAuth(["paciente"]);

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
      <DashboardLayout sidebar={<Sidebar links={PACIENTE_LINKS} />}>
        <div className="flex flex-col gap-6 max-w-xl">
          <div>
            <h1 className="font-poppins text-2xl font-bold text-brand-800">
              Meu Perfil 👤
            </h1>
            <p className="text-neutral-500 text-sm">Seus dados cadastrados no Conecta SUS.</p>
          </div>

          <FormContainer className="border border-neutral-100">
            <div className="flex items-center gap-4 border-b border-neutral-100 pb-6 mb-6">
              <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center text-brand-800 text-2xl font-bold">
                {user.nome.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="font-poppins text-lg font-bold text-brand-800">{user.nome}</h2>
                <Badge variant="info">Cidadão / Paciente</Badge>
              </div>
            </div>

            <dl className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <dt className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Nome Completo</dt>
                <dd className="text-sm font-medium text-neutral-700">{user.nome}</dd>
              </div>

              <div className="flex flex-col gap-1 border-t border-neutral-50 pt-3">
                <dt className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">CPF</dt>
                <dd className="text-sm font-medium text-neutral-700">{formatCPF(user.cpf)}</dd>
              </div>

              <div className="flex flex-col gap-1 border-t border-neutral-50 pt-3">
                <dt className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">E-mail</dt>
                <dd className="text-sm font-medium text-neutral-700">{user.email}</dd>
              </div>

              <div className="flex flex-col gap-1 border-t border-neutral-50 pt-3">
                <dt className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Telefone</dt>
                <dd className="text-sm font-medium text-neutral-700">{user.telefone ? formatPhone(user.telefone) : "Não informado"}</dd>
              </div>
            </dl>
          </FormContainer>
        </div>
      </DashboardLayout>
      <Footer />
    </>
  );
}
