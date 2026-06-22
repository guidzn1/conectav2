"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DashboardLayout, Sidebar } from "@/components/layout";
import {
  Card,
  Badge,
  Loading,
  ErrorMessage,
  EmptyState,
  Button,
} from "@/components/ui";
import {
  agendamentoService,
  especialidadeService,
  usuarioService,
} from "@/services";
import type {
  Agendamento,
  Especialidade,
  FinalizarConsultaDTO,
  Usuario,
} from "@/types";
import { formatCPF, formatDate, statusLabel } from "@/utils";
import { useRequireAuth } from "@/hooks/useAuth";

const MEDICO_LINKS = [
  { href: "/medico", label: "Minha Agenda", icon: "📅" },
  { href: "/medico/consultas", label: "Consultas", icon: "👥" },
  { href: "/medico/horarios", label: "Meus Horários", icon: "🕐" },
];

type StatusFiltro = "todos" | Agendamento["status"];
type BadgeVariant = "info" | "success" | "warning" | "error" | "neutral";

const STATUS_OPTIONS: { value: StatusFiltro; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "pendente", label: "Pendente" },
  { value: "confirmado", label: "Confirmado" },
  { value: "concluido", label: "Concluído" },
  { value: "cancelado", label: "Cancelado" },
];

const EMPTY_FORM: FinalizarConsultaDTO = {
  queixaPrincipal: "",
  diagnostico: "",
  conduta: "",
  prescricao: "",
  observacoes: "",
};

function getHojeISO() {
  return new Date().toISOString().split("T")[0];
}

function getStatusVariant(status: Agendamento["status"]): BadgeVariant {
  if (status === "confirmado") return "success";
  if (status === "cancelado") return "error";
  if (status === "concluido") return "info";
  return "warning";
}

export default function MedicoConsultasPage() {
  const { user, carregando } = useRequireAuth(["profissionalSaude"]);

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [pacientes, setPacientes] = useState<Record<string, Usuario>>({});
  const [especialidades, setEspecialidades] = useState<Record<string, Especialidade>>({});

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const [dataFiltro, setDataFiltro] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>("todos");

  const [consultaSelecionada, setConsultaSelecionada] = useState<Agendamento | null>(null);
  const [formLaudo, setFormLaudo] = useState<FinalizarConsultaDTO>(EMPTY_FORM);
  const [salvandoLaudo, setSalvandoLaudo] = useState(false);

  useEffect(() => {
    if (!user) return;

    async function load() {
      try {
        setLoading(true);
        setErro(null);

        const [ages, esps] = await Promise.all([
          agendamentoService.getPacientesAgendados(user!.id, dataFiltro || undefined),
          especialidadeService.getEspecialidades(),
        ]);

        const pacienteIds = Array.from(new Set(ages.map((a) => a.pacienteId)));
        const pacientesLista = await Promise.all(
          pacienteIds.map(async (id) => usuarioService.getUsuarioById(id))
        );

        setAgendamentos(ages);
        setPacientes(Object.fromEntries(pacientesLista.map((p) => [p.id, p])));
        setEspecialidades(Object.fromEntries(esps.map((e) => [e.id, e])));
      } catch {
        setErro("Erro ao carregar consultas. Tente novamente.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user, dataFiltro]);

  const consultasFiltradas = useMemo(() => {
    if (statusFiltro === "todos") return agendamentos;
    return agendamentos.filter((a) => a.status === statusFiltro);
  }, [agendamentos, statusFiltro]);

  const resumo = useMemo(() => {
    return {
      total: consultasFiltradas.length,
      confirmadas: consultasFiltradas.filter((a) => a.status === "confirmado").length,
      pendentes: consultasFiltradas.filter((a) => a.status === "pendente").length,
      concluidas: consultasFiltradas.filter((a) => a.status === "concluido").length,
    };
  }, [consultasFiltradas]);

  function abrirFinalizacao(agendamento: Agendamento) {
    setSucesso(null);
    setErro(null);
    setConsultaSelecionada(agendamento);
    setFormLaudo({
      queixaPrincipal: agendamento.laudo?.queixaPrincipal ?? "",
      diagnostico: agendamento.laudo?.diagnostico ?? "",
      conduta: agendamento.laudo?.conduta ?? "",
      prescricao: agendamento.laudo?.prescricao ?? "",
      observacoes: agendamento.laudo?.observacoes ?? "",
    });
  }

  function fecharFinalizacao() {
    if (salvandoLaudo) return;
    setConsultaSelecionada(null);
    setFormLaudo(EMPTY_FORM);
  }

  function atualizarCampo(campo: keyof FinalizarConsultaDTO, valor: string) {
    setFormLaudo((prev) => ({ ...prev, [campo]: valor }));
  }

  async function salvarLaudo() {
    if (!consultaSelecionada) return;

    const temConteudo = Object.values(formLaudo).some(
      (valor) => String(valor ?? "").trim().length > 0
    );

    if (!temConteudo) {
      setErro("Preencha pelo menos um campo do atendimento antes de finalizar.");
      return;
    }

    try {
      setSalvandoLaudo(true);
      setErro(null);
      setSucesso(null);

      const atualizado = await agendamentoService.finalizarConsulta(
        consultaSelecionada.id,
        formLaudo
      );

      setAgendamentos((prev) =>
        prev.map((item) => (item.id === atualizado.id ? atualizado : item))
      );

      setSucesso("Consulta finalizada e laudo salvo com sucesso.");
      fecharFinalizacao();
    } catch (error: any) {
      setErro(error?.message ?? "Erro ao finalizar consulta. Tente novamente.");
    } finally {
      setSalvandoLaudo(false);
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

      <DashboardLayout sidebar={<Sidebar links={MEDICO_LINKS} />}>
        <div className="flex flex-col gap-6">
          <section className="bg-white border border-neutral-100 shadow-card rounded-cardLg p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-brand-700 mb-2">
                  Área do médico
                </p>

                <h1 className="font-poppins text-3xl font-bold text-brand-800 leading-tight">
                  Consultas
                </h1>

                <p className="text-neutral-500 text-sm mt-1">
                  Dr(a). {user.nome} — visualize os dados do paciente e finalize atendimentos.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="filtro-data" className="text-xs font-bold text-neutral-700">
                    Filtrar por data
                  </label>

                  <input
                    id="filtro-data"
                    type="date"
                    value={dataFiltro}
                    onChange={(e) => setDataFiltro(e.target.value)}
                    className="h-10 border border-neutral-300 rounded-input px-3 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-brand-700"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="filtro-status" className="text-xs font-bold text-neutral-700">
                    Status
                  </label>

                  <select
                    id="filtro-status"
                    value={statusFiltro}
                    onChange={(e) => setStatusFiltro(e.target.value as StatusFiltro)}
                    className="h-10 border border-neutral-300 rounded-input px-3 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-brand-700"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setDataFiltro(getHojeISO())}>
                    Hoje
                  </Button>

                  {(dataFiltro || statusFiltro !== "todos") && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDataFiltro("");
                        setStatusFiltro("todos");
                      }}
                    >
                      Limpar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section aria-label="Resumo de consultas">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <ResumoCard label="Consultas" value={resumo.total} description="no filtro atual" />
              <ResumoCard label="Confirmadas" value={resumo.confirmadas} description="prontas para atendimento" />
              <ResumoCard label="Pendentes" value={resumo.pendentes} description="aguardando confirmação" />
              <ResumoCard label="Concluídas" value={resumo.concluidas} description="com laudo salvo" />
            </div>
          </section>

          {erro && <ErrorMessage message={erro} />}
          {sucesso && (
            <div role="status" className="rounded-card border border-green-200 bg-green-50 text-green-800 px-4 py-3 text-sm font-semibold">
              {sucesso}
            </div>
          )}

          <section className="bg-white border border-neutral-100 shadow-card rounded-cardLg p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
              <div>
                <h2 className="font-poppins text-xl font-bold text-brand-800">
                  Lista de consultas
                </h2>

                <p className="text-sm text-neutral-500">
                  {consultasFiltradas.length} {consultasFiltradas.length === 1 ? "consulta encontrada" : "consultas encontradas"}
                </p>
              </div>
            </div>

            {loading ? (
              <Loading text="Carregando consultas..." />
            ) : consultasFiltradas.length === 0 ? (
              <EmptyState
                title="Nenhuma consulta encontrada"
                description="Não há consultas para os filtros selecionados."
                icon="📭"
              />
            ) : (
              <ul role="list" className="flex flex-col gap-3">
                {consultasFiltradas.map((a) => {
                  const paciente = pacientes[a.pacienteId];
                  const especialidade = especialidades[a.especialidadeId];
                  const podeFinalizar = a.status === "confirmado" || a.status === "pendente";

                  return (
                    <li key={a.id}>
                      <Card padding="md" className="border-neutral-200 hover:border-brand-200 transition-colors">
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <div
                                className="w-12 h-12 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center font-bold shrink-0"
                                aria-hidden="true"
                              >
                                {paciente?.nome?.charAt(0).toUpperCase() ?? "P"}
                              </div>

                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-poppins font-semibold text-brand-800 text-sm">
                                    {paciente?.nome ?? `Paciente #${a.pacienteId.slice(-4)}`}
                                  </p>

                                  <Badge variant={getStatusVariant(a.status)}>
                                    {statusLabel(a.status)}
                                  </Badge>
                                </div>

                                <p className="text-sm text-neutral-600 mt-1">
                                  {especialidade?.nome ?? "Especialidade não informada"}
                                </p>

                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-neutral-500">
                                  <span>Data: {formatDate(a.data)}</span>
                                  <span>Horário: {a.horario}</span>
                                  <span>CPF: {paciente?.cpf ? formatCPF(paciente.cpf) : "—"}</span>
                                  <span>Tipo: {a.tipoVisita === "telemedicina" ? "Telemedicina" : "Presencial"}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap justify-start md:justify-end gap-2">
                              {a.status === "concluido" && <Badge variant="info">Laudo salvo</Badge>}

                              {podeFinalizar && (
                                <Button size="sm" onClick={() => abrirFinalizacao(a)}>
                                  Finalizar consulta
                                </Button>
                              )}
                            </div>
                          </div>

                          {a.status === "concluido" && a.laudo && (
                            <div className="border-t border-neutral-100 pt-4">
                              <p className="text-xs font-bold uppercase tracking-wide text-neutral-400 mb-2">
                                Registro salvo
                              </p>
                              <p className="text-sm text-neutral-600 line-clamp-2">
                                {a.laudo.diagnostico || a.laudo.conduta || a.laudo.observacoes || "Consulta finalizada com registro clínico."}
                              </p>
                            </div>
                          )}
                        </div>
                      </Card>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </DashboardLayout>

      {consultaSelecionada && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4 py-6" role="dialog" aria-modal="true">
          <div className="bg-white rounded-cardLg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="border-b border-neutral-100 p-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-brand-700 mb-2">
                  Finalizar atendimento
                </p>

                <h2 className="font-poppins text-2xl font-bold text-brand-800">
                  {pacientes[consultaSelecionada.pacienteId]?.nome ?? "Paciente"}
                </h2>

                <p className="text-sm text-neutral-500 mt-1">
                  {formatDate(consultaSelecionada.data)} às {consultaSelecionada.horario} • {especialidades[consultaSelecionada.especialidadeId]?.nome ?? "Especialidade"}
                </p>
              </div>

              <button
                type="button"
                onClick={fecharFinalizacao}
                className="w-9 h-9 rounded-full hover:bg-neutral-100 text-neutral-500 text-xl"
                aria-label="Fechar janela de finalização"
              >
                ×
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-brand-50 border border-brand-100 rounded-card p-4">
                <InfoPaciente label="CPF" value={formatCPF(pacientes[consultaSelecionada.pacienteId]?.cpf ?? "")} />
                <InfoPaciente label="E-mail" value={pacientes[consultaSelecionada.pacienteId]?.email ?? "—"} />
                <InfoPaciente label="Telefone" value={pacientes[consultaSelecionada.pacienteId]?.telefone ?? "—"} />
              </div>

              <CampoLaudo
                label="Queixa principal"
                value={formLaudo.queixaPrincipal ?? ""}
                placeholder="Ex.: dor de cabeça há três dias, febre, retorno de exame..."
                onChange={(valor) => atualizarCampo("queixaPrincipal", valor)}
              />

              <CampoLaudo
                label="Diagnóstico / hipótese diagnóstica"
                value={formLaudo.diagnostico ?? ""}
                placeholder="Registre o diagnóstico ou hipótese principal."
                onChange={(valor) => atualizarCampo("diagnostico", valor)}
              />

              <CampoLaudo
                label="Conduta"
                value={formLaudo.conduta ?? ""}
                placeholder="Informe a conduta adotada, orientações e encaminhamentos."
                onChange={(valor) => atualizarCampo("conduta", valor)}
              />

              <CampoLaudo
                label="Prescrição"
                value={formLaudo.prescricao ?? ""}
                placeholder="Registre a prescrição, quando houver."
                onChange={(valor) => atualizarCampo("prescricao", valor)}
              />

              <CampoLaudo
                label="Observações"
                value={formLaudo.observacoes ?? ""}
                placeholder="Anotações complementares do atendimento."
                onChange={(valor) => atualizarCampo("observacoes", valor)}
              />

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={fecharFinalizacao} disabled={salvandoLaudo}>
                  Cancelar
                </Button>

                <Button type="button" loading={salvandoLaudo} onClick={salvarLaudo}>
                  Salvar laudo e concluir
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

function ResumoCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <Card padding="md" className="border-neutral-200">
      <div className="flex flex-col gap-1">
        <span className="text-3xl font-poppins font-bold text-brand-800">
          {value}
        </span>

        <span className="text-sm font-bold text-neutral-700">{label}</span>

        <span className="text-xs text-neutral-500">{description}</span>
      </div>
    </Card>
  );
}

function InfoPaciente({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-brand-700">{label}</p>
      <p className="text-sm text-neutral-700 break-words">{value || "—"}</p>
    </div>
  );
}

function CampoLaudo({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (valor: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-bold text-neutral-700">{label}</span>
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full border border-neutral-300 rounded-input bg-white px-4 py-3 text-sm text-neutral-700 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-brand-700 focus:border-brand-700 resize-y"
      />
    </label>
  );
}
