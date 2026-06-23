import { Schema, model, Document } from "mongoose";

const toJSONOption = {
  virtuals: true,
  versionKey: false,
  transform: (doc: any, ret: any) => {
    if (ret._id) {
      ret.id = ret._id.toString();
      delete ret._id;
    }
    return ret;
  }
};

// ── USUARIO ──────────────────────────────────────────────────
export interface IUsuario extends Document {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  senhaHash: string;
  tipoUsuario: "paciente" | "administrador" | "profissionalSaude" | "ubs";
  nivelAcesso?: string;
  registroProfissional?: string;
  especialidadeId?: string;
  unidadeId?: string;
  criadoEm: Date;
}

const UsuarioSchema = new Schema<IUsuario>({
  nome:                 { type: String, required: true, trim: true },
  cpf:                  { type: String, required: true, unique: true, trim: true },
  telefone:             { type: String, default: "" },
  email:                { type: String, required: true, unique: true, lowercase: true },
  senhaHash:            { type: String, required: true },
  tipoUsuario:          { type: String, enum: ["paciente", "administrador", "profissionalSaude", "ubs"], required: true },
  nivelAcesso:          { type: String },
  registroProfissional: { type: String },
  especialidadeId:      { type: String },
  unidadeId:            { type: String },
  criadoEm:             { type: Date, default: Date.now },
}, { toJSON: toJSONOption, toObject: toJSONOption });

export const Usuario = model<IUsuario>("Usuario", UsuarioSchema);

// ── UNIDADE SAÚDE ─────────────────────────────────────────────
export interface IUnidadeSaude extends Document {
  nome: string;
  endereco: string;
  telefone: string;
  especialidadeIds: string[];
  latitude?: number;
  longitude?: number;
}

const UnidadeSchema = new Schema<IUnidadeSaude>({
  nome:             { type: String, required: true },
  endereco:         { type: String, required: true },
  telefone:         { type: String, default: "" },
  especialidadeIds: { type: [String], default: [] },
  latitude:         { type: Number },
  longitude:        { type: Number },
}, { toJSON: toJSONOption, toObject: toJSONOption });

export const UnidadeSaude = model<IUnidadeSaude>("UnidadeSaude", UnidadeSchema);

// ── ESPECIALIDADE ─────────────────────────────────────────────
export interface IEspecialidade extends Document {
  nome: string;
  descricao: string;
  icone?: string;
}

const EspecialidadeSchema = new Schema<IEspecialidade>({
  nome:      { type: String, required: true, unique: true },
  descricao: { type: String, default: "" },
  icone:     { type: String },
}, { toJSON: toJSONOption, toObject: toJSONOption });

export const Especialidade = model<IEspecialidade>("Especialidade", EspecialidadeSchema);

// ── AGENDA ────────────────────────────────────────────────────
export interface IHorario {
  hora: string;
  disponivel: boolean;
}

export interface IAgenda extends Document {
  profissionalId: string;
  unidadeId: string;
  data: string;
  horarios: IHorario[];
}

const AgendaSchema = new Schema<IAgenda>({
  profissionalId: { type: String, required: true },
  unidadeId:      { type: String, required: true },
  data:           { type: String, required: true },
  horarios: [{
    hora:       { type: String, required: true },
    disponivel: { type: Boolean, default: true },
  }],
}, { toJSON: toJSONOption, toObject: toJSONOption });

export const Agenda = model<IAgenda>("Agenda", AgendaSchema);

// ── AGENDAMENTO / LAUDO ───────────────────────────────────────
export interface ILaudoConsulta {
  queixaPrincipal?: string;
  diagnostico?: string;
  conduta?: string;
  prescricao?: string;
  observacoes?: string;
  profissionalId?: string;
  criadoEm?: Date;
  atualizadoEm?: Date;
}

export interface IAgendamento extends Document {
  pacienteId: string;
  profissionalId: string;
  unidadeId: string;
  especialidadeId: string;
  data: string;
  horario: string;
  status: "pendente" | "confirmado" | "cancelado" | "concluido";
  primeiraConsulta: boolean;
  tipoVisita: "presencial" | "telemedicina";
  laudo?: ILaudoConsulta;
  finalizadoEm?: Date;
  criadoEm: Date;
}

const AgendamentoSchema = new Schema<IAgendamento>({
  pacienteId:       { type: String, required: true },
  profissionalId:   { type: String, required: true },
  unidadeId:        { type: String, required: true },
  especialidadeId:  { type: String, required: true },
  data:             { type: String, required: true },
  horario:          { type: String, required: true },
  status:           { type: String, enum: ["pendente", "confirmado", "cancelado", "concluido"], default: "confirmado" },
  primeiraConsulta: { type: Boolean, default: false },
  tipoVisita:       { type: String, enum: ["presencial", "telemedicina"], default: "presencial" },

  laudo: {
    queixaPrincipal: { type: String, default: "" },
    diagnostico:     { type: String, default: "" },
    conduta:         { type: String, default: "" },
    prescricao:      { type: String, default: "" },
    observacoes:     { type: String, default: "" },
    profissionalId:  { type: String },
    criadoEm:        { type: Date },
    atualizadoEm:    { type: Date },
  },

  finalizadoEm: { type: Date },
  criadoEm:     { type: Date, default: Date.now },
}, { toJSON: toJSONOption, toObject: toJSONOption });

// Observação: não usamos índice único aqui porque consultas canceladas liberam o horário novamente.
// A reserva real é controlada atomicamente no array horarios da coleção Agenda.
export const Agendamento = model<IAgendamento>("Agendamento", AgendamentoSchema);
