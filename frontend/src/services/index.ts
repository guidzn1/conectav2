import { api } from "./api";
import type {
  UnidadeSaude,
  Especialidade,
  ProfissionalSaude,
  Agenda,
  Horario,
  Agendamento,
  CriarAgendamentoDTO,
  FinalizarConsultaDTO,
  Usuario,
} from "@/types";


// ── USUÁRIOS ─────────────────────────────────────────────────
export const usuarioService = {
  getUsuarioById: (id: string) => api.get<Usuario>(`/usuarios/${id}`),
};

// ── ESPECIALIDADES ────────────────────────────────────────────
export const especialidadeService = {
  getEspecialidades: () => api.get<Especialidade[]>("/especialidades"),

  getEspecialidadeById: (id: string) =>
    api.get<Especialidade>(`/especialidades/${id}`),

  cadastrarEspecialidade: (data: Omit<Especialidade, "id">) =>
    api.post<Especialidade>("/especialidades", data),
};

// ── UNIDADES ──────────────────────────────────────────────────
export const unidadeSaudeService = {
  getUnidades: () => api.get<UnidadeSaude[]>("/unidades"),

  getUnidadesPorEspecialidade: (especialidadeId: string) =>
    api.get<UnidadeSaude[]>(`/unidades?especialidadeId=${especialidadeId}`),

  getUnidadeById: (id: string) =>
    api.get<UnidadeSaude>(`/unidades/${id}`),

  cadastrarUnidade: (data: Omit<UnidadeSaude, "id">) =>
    api.post<UnidadeSaude>("/unidades", data),
};

// ── PROFISSIONAIS ─────────────────────────────────────────────
export const profissionalService = {
  getProfissionais: () => api.get<ProfissionalSaude[]>("/profissionais"),

  getProfissionaisPorEspecialidade: (especialidadeId: string) =>
    api.get<ProfissionalSaude[]>(`/profissionais?especialidadeId=${especialidadeId}`),

  getProfissionalById: (id: string) =>
    api.get<ProfissionalSaude>(`/profissionais/${id}`),

  cadastrarProfissional: (data: Omit<ProfissionalSaude, "id" | "criadoEm">) =>
    api.post<ProfissionalSaude>("/profissionais", data),
};

// ── AGENDAS ───────────────────────────────────────────────────
export const agendaService = {
  getAgendas: (profissionalId: string) =>
    api.get<Agenda[]>(`/agendas?profissionalId=${profissionalId}`),

  getHorariosDisponiveis: (profissionalId: string, data: string) =>
    api.get<Horario[]>(`/agendas/horarios?profissionalId=${profissionalId}&data=${data}`),

  organizarHorarios: (agendaId: string, body: Partial<Agenda>) => {
    if (agendaId === "novo") {
      return api.post<Agenda>("/agendas", body);
    }

    return api.put<Agenda>(`/agendas/${agendaId}`, body);
  },
};

// ── AGENDAMENTOS ──────────────────────────────────────────────
export const agendamentoService = {
  getAgendamentoById: (id: string) =>
    api.get<Agendamento>(`/agendamentos/${id}`),

  getMeusAgendamentos: (pacienteId: string) =>
    api.get<Agendamento[]>(`/agendamentos?pacienteId=${pacienteId}`),

  getPacientesAgendados: (profissionalId: string, data?: string) =>
    api.get<Agendamento[]>(
      `/agendamentos?profissionalId=${profissionalId}${data ? `&data=${data}` : ""}`
    ),

  criarAgendamento: (dto: CriarAgendamentoDTO & { pacienteId?: string }) =>
    api.post<Agendamento>("/agendamentos", dto),

  cancelarAgendamento: (id: string) =>
    api.patch<Agendamento>(`/agendamentos/${id}/cancelar`),

  finalizarConsulta: (id: string, dto: FinalizarConsultaDTO) =>
    api.patch<Agendamento>(`/agendamentos/${id}/finalizar`, dto),
};

// ── ADMIN ─────────────────────────────────────────────────────
export const adminService = {
  getDashboardStats: () =>
    api.get<{
      totalAgendamentos: number;
      agendamentosHoje: number;
      totalPacientes: number;
      totalProfissionais: number;
      totalUnidades: number;
    }>("/admin/stats"),
};

// ── LOCATION ─────────────────────────────────────────────────
export const locationService = {
  salvarLocalizacao: (lat: number, lng: number): void => {
    localStorage.setItem("conectasus_location", JSON.stringify({ lat, lng }));
  },

  calcularDistancia(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  },
};

// ── ACCESSIBILITY ─────────────────────────────────────────────
export interface AccessibilityPreferences {
  altoContraste: boolean;
  tamanhoFonte: "pequeno" | "normal" | "grande" | "muito-grande";
  reduzirAnimacoes: boolean;
}

export const accessibilityService = {
  savePreferences(p: AccessibilityPreferences) {
    localStorage.setItem("conectasus_a11y", JSON.stringify(p));
  },

  loadPreferences(): AccessibilityPreferences {
    try {
      const raw = localStorage.getItem("conectasus_a11y");
      if (raw) return JSON.parse(raw);
    } catch {}

    return {
      altoContraste: false,
      tamanhoFonte: "normal",
      reduzirAnimacoes: false,
    };
  },
};
