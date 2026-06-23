// ============================================================
// CONECTA SUS — Tipos TypeScript baseados no UML
// ============================================================

export interface Usuario {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  tipoUsuario: "paciente" | "administrador" | "profissionalSaude" | "ubs";
  criadoEm?: string;
}

export interface Paciente extends Usuario {
  tipoUsuario: "paciente";
  meusAgendamentos?: Agendamento[];
}

export interface Administrador extends Usuario {
  tipoUsuario: "administrador";
  nivelAcesso: string;
}

export interface Ubs extends Usuario {
  tipoUsuario: "ubs";
  unidadeId?: string;
}

export interface ProfissionalSaude extends Usuario {
  tipoUsuario: "profissionalSaude";
  registroProfissional: string;
  especialidadeId: string;
  unidadeId?: string;
  agendas?: Agenda[];
  foto?: string;
  bio?: string;
}

export interface UnidadeSaude {
  id: string;
  nome: string;
  endereco: string;
  telefone: string;
  especialidadeIds: string[];
  latitude?: number;
  longitude?: number;
  distancia?: number;
}

export interface Especialidade {
  id: string;
  nome: string;
  descricao: string;
  icone?: string;
}

export interface Agenda {
  id: string;
  profissionalId: string;
  unidadeId: string;
  data: string;
  horarios: Horario[];
}

export interface Horario {
  hora: string;
  disponivel: boolean;
}

export interface LaudoConsulta {
  queixaPrincipal?: string;
  diagnostico?: string;
  conduta?: string;
  prescricao?: string;
  observacoes?: string;
  profissionalId?: string;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface FinalizarConsultaDTO {
  queixaPrincipal?: string;
  diagnostico?: string;
  conduta?: string;
  prescricao?: string;
  observacoes?: string;
}

export interface Agendamento {
  id: string;
  pacienteId: string;
  profissionalId: string;
  unidadeId: string;
  especialidadeId: string;
  data: string;
  horario: string;
  status: "pendente" | "confirmado" | "cancelado" | "concluido";
  criadoEm: string;
  primeiraConsulta?: boolean;
  primeivaConsulta?: boolean;
  tipoVisita?: "presencial" | "telemedicina";
  laudo?: LaudoConsulta;
  finalizadoEm?: string;
}

export interface CriarAgendamentoDTO {
  profissionalId: string;
  unidadeId: string;
  especialidadeId: string;
  data: string;
  horario: string;
  primeiraConsulta: boolean;
  tipoVisita: "presencial" | "telemedicina";
}

export type StatusAgendamento = Agendamento["status"];

export type TipoUsuario = Usuario["tipoUsuario"];

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
