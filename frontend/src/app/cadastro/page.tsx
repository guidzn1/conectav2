"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button, Input, ErrorMessage } from "@/components/ui";
import { FormContainer } from "@/components/layout";
import { register } from "@/services/authService";
import { formatCPF, formatPhone } from "@/utils";
import { useAuth } from "@/hooks/useAuth";

export default function CadastroPacientePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [apiErro, setApiErro] = useState<string | null>(null);
  const [form, setForm] = useState({
    nome: "", cpf: "", telefone: "", email: "", senha: "", confirmarSenha: "",
  });
  const [erros, setErros] = useState<Partial<typeof form>>({});

  useEffect(() => {
    if (user) {
      if (user.tipoUsuario === "paciente") router.replace("/dashboard");
      else if (user.tipoUsuario === "profissionalSaude") router.replace("/medico");
      else if (user.tipoUsuario === "administrador") router.replace("/admin");
    }
  }, [user, router]);

  function set(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validate(): boolean {
    const e: Partial<typeof form> = {};
    if (!form.nome.trim())               e.nome  = "Nome obrigatório.";
    if (form.cpf.replace(/\D/g,"").length !== 11) e.cpf = "CPF inválido.";
    if (!form.email.includes("@"))       e.email = "E-mail inválido.";
    if (form.senha.length < 6)           e.senha = "Mínimo 6 caracteres.";
    if (form.senha !== form.confirmarSenha) e.confirmarSenha = "Senhas não coincidem.";
    setErros(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register({
        nome: form.nome, cpf: form.cpf.replace(/\D/g,""),
        telefone: form.telefone, email: form.email,
        senha: form.senha, tipoUsuario: "paciente",
      });
      router.push("/login?cadastro=ok");
    } catch {
      setApiErro("Erro ao cadastrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen bg-neutral-50 py-12">
        <div className="container-app max-w-lg">
          <FormContainer
            title="Cadastro de Paciente"
            description="Crie sua conta para agendar consultas no SUS"
          >
            {apiErro && <ErrorMessage message={apiErro} />}

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 mt-4">
              <Input label="Nome completo" required
                value={form.nome} onChange={(e) => set("nome", e.target.value)}
                erro={erros.nome} placeholder="Seu nome completo"
              />
              <Input label="CPF" required inputMode="numeric"
                value={formatCPF(form.cpf)} onChange={(e) => set("cpf", e.target.value)}
                erro={erros.cpf} placeholder="000.000.000-00" maxLength={14}
              />
              <Input label="Telefone" inputMode="tel"
                value={formatPhone(form.telefone)} onChange={(e) => set("telefone", e.target.value)}
                placeholder="(94) 99999-0000" maxLength={15}
              />
              <Input label="E-mail" type="email" required
                value={form.email} onChange={(e) => set("email", e.target.value)}
                erro={erros.email} placeholder="seu@email.com"
              />
              <Input label="Senha" type="password" required
                value={form.senha} onChange={(e) => set("senha", e.target.value)}
                erro={erros.senha} placeholder="Mínimo 6 caracteres"
              />
              <Input label="Confirmar senha" type="password" required
                value={form.confirmarSenha} onChange={(e) => set("confirmarSenha", e.target.value)}
                erro={erros.confirmarSenha} placeholder="Repita a senha"
              />

              <Button type="submit" fullWidth loading={loading} size="lg" className="mt-2">
                Criar conta
              </Button>
            </form>

            <p className="text-center text-sm mt-4 text-neutral-500">
              Já tem conta?{" "}
              <Link href="/login" className="text-brand-700 hover:underline font-semibold">
                Faça login
              </Link>
            </p>
          </FormContainer>
        </div>
      </main>
    </>
  );
}
