/**
 * Seed — popula o banco com dados iniciais para teste
 * Uso: npx ts-node src/seed.ts
 */
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { Usuario, UnidadeSaude, Especialidade, Agenda, Agendamento } from "./models";

const MONGO_URI = process.env.MONGO_URI ?? "mongodb://localhost:27017/conectasus";

const ESPECIALIDADES = [
  { nome: "Clínico Geral",          descricao: "Atendimento geral de saúde" },
  { nome: "Ginecologista",           descricao: "Saúde feminina" },
  { nome: "Pediatria",               descricao: "Saúde infantil" },
  { nome: "Ortopedia",               descricao: "Ossos e articulações" },
  { nome: "Cardiologia",             descricao: "Saúde cardíaca" },
  { nome: "Dermatologia",            descricao: "Pele, cabelo e unhas" },
  { nome: "Oftalmologia",            descricao: "Saúde ocular" },
  { nome: "Odontologia",             descricao: "Saúde bucal" },
  { nome: "Neurologia",              descricao: "Sistema nervoso" },
  { nome: "Psiquiatria",             descricao: "Saúde mental" },
  { nome: "Endocrinologia",          descricao: "Sistema hormonal" },
  { nome: "Urologia",                descricao: "Sistema urinário" },
  { nome: "Gastroenterologia",       descricao: "Aparelho digestivo" },
  { nome: "Otorrinolaringologia",    descricao: "Ouvido, nariz e garganta" },
  { nome: "Reumatologia",            descricao: "Articulações e tecidos" },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Conectado ao MongoDB");

  // Limpa collections
  await Promise.all([
    Especialidade.deleteMany({}),
    UnidadeSaude.deleteMany({}),
    Usuario.deleteMany({}),
    Agenda.deleteMany({}),
    Agendamento.deleteMany({}),
  ]);

  // Especialidades
  const esps = await Especialidade.insertMany(ESPECIALIDADES);
  console.log(`✅ ${esps.length} especialidades criadas`);

  const espMap: Record<string, string> = Object.fromEntries(esps.map((e) => [e.nome, e._id.toString()]));

  // Unidades
  const unidades = await UnidadeSaude.insertMany([
    {
      nome: "UBS Família Pedro Cavalcante",
      endereco: "Av. Transamazônica, 332 - Amapá, Marabá - PA",
      telefone: "(94) 3322-1001",
      especialidadeIds: [espMap["Clínico Geral"], espMap["Ginecologista"], espMap["Pediatria"]],
      latitude: -5.3652, longitude: -49.1182,
    },
    {
      nome: "UBS Bairro da Paz",
      endereco: "Rua das Palmeiras, 100 - Bairro da Paz, Marabá - PA",
      telefone: "(94) 3322-2002",
      especialidadeIds: [espMap["Clínico Geral"], espMap["Ortopedia"], espMap["Cardiologia"]],
      latitude: -5.37, longitude: -49.12,
    },
    {
      nome: "UPA 24h Marabá",
      endereco: "Folha 32, Quadra 8, Marabá - PA",
      telefone: "(94) 3322-3003",
      especialidadeIds: [espMap["Clínico Geral"], espMap["Dermatologia"], espMap["Oftalmologia"]],
      latitude: -5.36, longitude: -49.13,
    },
  ]);
  console.log(`✅ ${unidades.length} unidades criadas`);

  // Usuários
  const hash = await bcrypt.hash("senha123", 10);

  const [admin, pro1, pro2, ubs, paciente] = await Promise.all([
    Usuario.create({
      nome: "Admin Sistema", cpf: "00000000001", email: "admin@conectasus.com",
      telefone: "", senhaHash: hash, tipoUsuario: "administrador", nivelAcesso: "total",
    }),
    Usuario.create({
      nome: "Dra. Joana da Silva", cpf: "00000000002", email: "joana@conectasus.com",
      telefone: "(94) 99999-0002", senhaHash: hash, tipoUsuario: "profissionalSaude",
      registroProfissional: "CRM/PA 12345", especialidadeId: espMap["Clínico Geral"],
      unidadeId: unidades[0]._id.toString(),
    }),
    Usuario.create({
      nome: "Dr. Carlos Mendes", cpf: "00000000003", email: "carlos@conectasus.com",
      telefone: "(94) 99999-0003", senhaHash: hash, tipoUsuario: "profissionalSaude",
      registroProfissional: "CRM/PA 54321", especialidadeId: espMap["Cardiologia"],
      unidadeId: unidades[0]._id.toString(),
    }),
    Usuario.create({
      nome: "UBS Central", cpf: "00000000000100", email: "ubs@conectasus.com",
      telefone: "(94) 3322-9999", senhaHash: hash, tipoUsuario: "ubs",
      unidadeId: unidades[0]._id.toString(),
    }),
    Usuario.create({
      nome: "Maria da Silva", cpf: "12345678900", email: "maria@email.com",
      telefone: "(94) 99999-0001", senhaHash: hash, tipoUsuario: "paciente",
    }),
  ]);
  console.log("✅ Usuários criados");

  // Agenda do profissional para os próximos 7 dias
  const horariosPadrao = ["08:00","09:00","10:00","11:00","13:00","14:00","15:00","16:00"]
    .map((hora) => ({ hora, disponivel: true }));

  for (let i = 1; i <= 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const data = d.toISOString().split("T")[0];
    await Agenda.create({
      profissionalId: pro1._id.toString(),
      unidadeId: unidades[0]._id.toString(),
      data, horarios: horariosPadrao,
    });
  }
  for (let i = 1; i <= 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const data = d.toISOString().split("T")[0];
    await Agenda.create({
      profissionalId: pro2._id.toString(),
      unidadeId: unidades[1]._id.toString(),
      data, horarios: horariosPadrao,
    });
  }
  console.log("✅ Agendas criadas");

  console.log("\n📋 Credenciais de teste:");
  console.log("  Paciente:       CPF 123.456.789-00 / senha: senha123");
  console.log("  Médico:         CPF 000.000.000-02 / senha: senha123");
  console.log("  Administrador:  CPF 000.000.000-01 / senha: senha123");
  console.log("  UBS:            CNPJ 00.000.000/0001-00 / senha: senha123");

  await mongoose.disconnect();
  console.log("\n✅ Seed concluído!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Erro no seed:", err);
  process.exit(1);
});
