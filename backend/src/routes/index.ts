import { Router, Request, Response } from "express";
import { Especialidade, UnidadeSaude, Usuario, Agenda, Agendamento } from "../models";
import { authMiddleware, adminOnly, role, AuthRequest } from "../middleware/auth";


// ── USUÁRIOS ─────────────────────────────────────────────────
export const usuariosRouter = Router();

usuariosRouter.get("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const usuario = await Usuario.findById(req.params.id).select("-senhaHash");

    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    const isSelf = req.userId === usuario.id;
    const isMedico = req.tipoUsuario === "profissionalSaude";
    const isAdmin = req.tipoUsuario === "administrador";
    const isUbs = req.tipoUsuario === "ubs";

    if (!isSelf && !isMedico && !isAdmin && !isUbs) {
      return res.status(403).json({ error: "Você não tem permissão para acessar este usuário." });
    }

    return res.json(usuario);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// ── ESPECIALIDADES ────────────────────────────────────────────
export const especialidadesRouter = Router();

especialidadesRouter.get("/", async (_req, res) => {
  const dados = await Especialidade.find();
  res.json(dados);
});

especialidadesRouter.post("/", authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const esp = await Especialidade.create(req.body);
    res.status(201).json(esp);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

especialidadesRouter.delete("/:id", authMiddleware, adminOnly, async (req, res) => {
  await Especialidade.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

// ── UNIDADES ──────────────────────────────────────────────────
export const unidadesRouter = Router();

unidadesRouter.get("/", async (req: Request, res: Response) => {
  const { especialidadeId } = req.query;
  const filtro = especialidadeId
    ? { especialidadeIds: { $in: [especialidadeId as string] } }
    : {};

  const dados = await UnidadeSaude.find(filtro);
  res.json(dados);
});

unidadesRouter.get("/:id", async (req, res) => {
  const uni = await UnidadeSaude.findById(req.params.id);
  if (!uni) return res.status(404).json({ error: "Unidade não encontrada." });
  return res.json(uni);
});

unidadesRouter.post("/", authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const uni = await UnidadeSaude.create(req.body);
    res.status(201).json(uni);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

unidadesRouter.put("/:id", authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
  const uni = await UnidadeSaude.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(uni);
});

unidadesRouter.delete("/:id", authMiddleware, adminOnly, async (req, res) => {
  await UnidadeSaude.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

// ── PROFISSIONAIS ─────────────────────────────────────────────
export const profissionaisRouter = Router();

profissionaisRouter.get("/", async (req: Request, res: Response) => {
  const { especialidadeId } = req.query;
  const filtro: Record<string, unknown> = { tipoUsuario: "profissionalSaude" };

  if (especialidadeId) filtro.especialidadeId = especialidadeId;

  const dados = await Usuario.find(filtro).select("-senhaHash");
  res.json(dados);
});

profissionaisRouter.get("/:id", async (req, res) => {
  const pro = await Usuario.findById(req.params.id).select("-senhaHash");
  if (!pro) return res.status(404).json({ error: "Profissional não encontrado." });
  return res.json(pro);
});

profissionaisRouter.post("/", authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { senha, cpf, ...resto } = req.body;
    const cleanedCpf = cpf ? cpf.replace(/\D/g, "") : "";

    if (!cleanedCpf) {
      return res.status(400).json({ error: "CPF é obrigatório." });
    }

    const existe = await Usuario.findOne({ cpf: cleanedCpf });
    if (existe) return res.status(409).json({ error: "CPF já cadastrado." });

    const bcrypt = await import("bcryptjs");
    const senhaHash = await bcrypt.hash(senha ?? "senha123", 10);

    const pro = await Usuario.create({
      ...resto,
      cpf: cleanedCpf,
      senhaHash,
      tipoUsuario: "profissionalSaude",
    });

    const { senhaHash: _, ...proSafe } = pro.toObject();
    res.status(201).json(proSafe);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ── AGENDAS ───────────────────────────────────────────────────
export const agendasRouter = Router();

agendasRouter.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  const { profissionalId, data } = req.query;
  const filtro: Record<string, unknown> = {};

  if (profissionalId) filtro.profissionalId = profissionalId;
  if (data) filtro.data = data;

  const dados = await Agenda.find(filtro).sort({ data: 1 });
  res.json(dados);
});

agendasRouter.get("/horarios", authMiddleware, async (req: AuthRequest, res: Response) => {
  const { profissionalId, data } = req.query;
  const agenda = await Agenda.findOne({ profissionalId, data });

  if (!agenda) {
    return res.status(404).json({ error: "Médico não atende neste dia." });
  }

  return res.json(agenda.horarios);
});

agendasRouter.post("/", authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { profissionalId, data } = req.body;
    let agenda = await Agenda.findOne({ profissionalId, data });

    if (agenda) {
      agenda.horarios = req.body.horarios;
      agenda.unidadeId = req.body.unidadeId || agenda.unidadeId;
      await agenda.save();
    } else {
      agenda = await Agenda.create(req.body);
    }

    res.status(201).json(agenda);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

agendasRouter.put("/:id", authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
  const agenda = await Agenda.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(agenda);
});

// ── AGENDAMENTOS ──────────────────────────────────────────────
export const agendamentosRouter = Router();

agendamentosRouter.get("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const age = await Agendamento.findById(req.params.id);

    if (!age) {
      return res.status(404).json({ error: "Agendamento não encontrado." });
    }

    const podeVer =
      req.tipoUsuario === "administrador" ||
      req.tipoUsuario === "ubs" ||
      age.pacienteId === req.userId ||
      age.profissionalId === req.userId;

    if (!podeVer) {
      return res.status(403).json({ error: "Você não tem permissão para acessar este agendamento." });
    }

    return res.json(age);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

agendamentosRouter.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  const { pacienteId, profissionalId, data } = req.query;
  const filtro: Record<string, unknown> = {};

  if (pacienteId) filtro.pacienteId = pacienteId;
  if (profissionalId) filtro.profissionalId = profissionalId;
  if (data) filtro.data = data;

  const dados = await Agendamento.find(filtro).sort({ data: 1, horario: 1 });
  res.json(dados);
});

agendamentosRouter.post("/", authMiddleware, role("paciente"), async (req: AuthRequest, res: Response) => {
  try {
    const { profissionalId, data, horario } = req.body;

    if (!profissionalId || !data || !horario) {
      return res.status(400).json({
        error: "Campos profissionalId, data e horario são obrigatórios.",
      });
    }

    const agenda = await Agenda.findOne({ profissionalId, data });
    if (!agenda) {
      return res.status(400).json({ error: "Médico não atende neste dia." });
    }

    const slot = agenda.horarios.find((h) => h.hora === horario);
    if (!slot) {
      return res.status(400).json({ error: "Médico não atende nesse horário." });
    }

    if (!slot.disponivel) {
      return res.status(400).json({ error: "Horário indisponível/reservado." });
    }

    const agendaAtualizada = await Agenda.findOneAndUpdate(
      {
        profissionalId,
        data,
        "horarios.hora": horario,
        "horarios.disponivel": true,
      },
      {
        $set: { "horarios.$.disponivel": false },
      },
      { new: true }
    );

    if (!agendaAtualizada) {
      return res.status(409).json({ error: "Horário indisponível/reservado." });
    }

    const age = await Agendamento.create({
      ...req.body,
      pacienteId: req.userId,
      status: "confirmado",
    });

    return res.status(201).json(age);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

agendamentosRouter.patch("/:id/cancelar", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const age = await Agendamento.findById(req.params.id);

    if (!age) {
      return res.status(404).json({ error: "Agendamento não encontrado." });
    }

    const podeCancelar =
      req.tipoUsuario === "administrador" ||
      req.tipoUsuario === "ubs" ||
      age.pacienteId === req.userId ||
      age.profissionalId === req.userId;

    if (!podeCancelar) {
      return res.status(403).json({ error: "Você não tem permissão para cancelar esta consulta." });
    }

    if (age.status === "concluido") {
      return res.status(400).json({ error: "Consulta concluída não pode ser cancelada." });
    }

    if (age.status === "cancelado") {
      return res.json(age);
    }

    age.status = "cancelado";
    await age.save();

    await Agenda.findOneAndUpdate(
      {
        profissionalId: age.profissionalId,
        data: age.data,
        "horarios.hora": age.horario,
      },
      {
        $set: { "horarios.$.disponivel": true },
      }
    );

    return res.json(age);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

agendamentosRouter.patch(
  "/:id/finalizar",
  authMiddleware,
  role("profissionalSaude"),
  async (req: AuthRequest, res: Response) => {
    try {
      const age = await Agendamento.findById(req.params.id);

      if (!age) {
        return res.status(404).json({ error: "Agendamento não encontrado." });
      }

      if (age.profissionalId !== req.userId) {
        return res.status(403).json({
          error: "Você não tem permissão para finalizar esta consulta.",
        });
      }

      if (age.status === "cancelado") {
        return res.status(400).json({
          error: "Não é possível finalizar uma consulta cancelada.",
        });
      }

      const {
        queixaPrincipal,
        diagnostico,
        conduta,
        prescricao,
        observacoes,
      } = req.body;

      const temLaudo = [
        queixaPrincipal,
        diagnostico,
        conduta,
        prescricao,
        observacoes,
      ].some((campo) => String(campo ?? "").trim().length > 0);

      if (!temLaudo) {
        return res.status(400).json({
          error: "Informe pelo menos um dado do atendimento.",
        });
      }

      const agora = new Date();

      age.status = "concluido";
      age.finalizadoEm = agora;
      age.laudo = {
        queixaPrincipal: String(queixaPrincipal ?? "").trim(),
        diagnostico: String(diagnostico ?? "").trim(),
        conduta: String(conduta ?? "").trim(),
        prescricao: String(prescricao ?? "").trim(),
        observacoes: String(observacoes ?? "").trim(),
        profissionalId: req.userId,
        criadoEm: age.laudo?.criadoEm ?? agora,
        atualizadoEm: agora,
      };

      await age.save();

      return res.json(age);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
);

// ── ADMIN STATS ───────────────────────────────────────────────
export const adminRouter = Router();

adminRouter.get("/stats", authMiddleware, adminOnly, async (_req, res) => {
  const hoje = new Date().toISOString().split("T")[0];

  const [
    totalAgendamentos,
    agendamentosHoje,
    totalPacientes,
    totalProfissionais,
    totalUnidades,
  ] = await Promise.all([
    Agendamento.countDocuments(),
    Agendamento.countDocuments({ data: hoje }),
    Usuario.countDocuments({ tipoUsuario: "paciente" }),
    Usuario.countDocuments({ tipoUsuario: "profissionalSaude" }),
    UnidadeSaude.countDocuments(),
  ]);

  res.json({
    totalAgendamentos,
    agendamentosHoje,
    totalPacientes,
    totalProfissionais,
    totalUnidades,
  });
});

// ── UBS ───────────────────────────────────────────────────────
export const ubsRouter = Router();

ubsRouter.get("/stats", authMiddleware, role("ubs"), async (req: AuthRequest, res: Response) => {
  const unidadeId = req.body.unidadeId || (await Usuario.findById(req.userId))?.unidadeId;

  if (!unidadeId) {
    return res.status(400).json({ error: "UBS sem unidade vinculada." });
  }

  const hoje = new Date().toISOString().split("T")[0];

  const [totalAgendamentos, agendamentosHoje, totalProfissionais] = await Promise.all([
    Agendamento.countDocuments({ unidadeId }),
    Agendamento.countDocuments({ unidadeId, data: hoje }),
    Usuario.countDocuments({ tipoUsuario: "profissionalSaude", unidadeId }),
  ]);

  res.json({ totalAgendamentos, agendamentosHoje, totalProfissionais, unidadeId });
});

ubsRouter.get("/medicos", authMiddleware, role("ubs"), async (req: AuthRequest, res: Response) => {
  const ubsUser = await Usuario.findById(req.userId);

  if (!ubsUser?.unidadeId) {
    return res.status(400).json({ error: "UBS sem unidade vinculada." });
  }

  const medicos = await Usuario.find({
    tipoUsuario: "profissionalSaude",
    unidadeId: ubsUser.unidadeId,
  }).select("-senhaHash");

  res.json(medicos);
});

ubsRouter.post("/medicos", authMiddleware, role("ubs"), async (req: AuthRequest, res: Response) => {
  try {
    const ubsUser = await Usuario.findById(req.userId);

    if (!ubsUser?.unidadeId) {
      return res.status(400).json({ error: "UBS sem unidade vinculada." });
    }

    const { senha, cpf, ...resto } = req.body;
    const cleanedCpf = cpf ? cpf.replace(/\D/g, "") : "";

    if (!cleanedCpf) {
      return res.status(400).json({ error: "CPF é obrigatório." });
    }

    const existe = await Usuario.findOne({ cpf: cleanedCpf });
    if (existe) return res.status(409).json({ error: "CPF já cadastrado." });

    const bcrypt = await import("bcryptjs");
    const senhaHash = await bcrypt.hash(senha ?? "senha123", 10);

    const pro = await Usuario.create({
      ...resto,
      cpf: cleanedCpf,
      senhaHash,
      tipoUsuario: "profissionalSaude",
      unidadeId: ubsUser.unidadeId,
    });

    const { senhaHash: _, ...proSafe } = pro.toObject();
    res.status(201).json(proSafe);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

ubsRouter.post("/agendas", authMiddleware, role("ubs"), async (req: AuthRequest, res: Response) => {
  try {
    const ubsUser = await Usuario.findById(req.userId);

    if (!ubsUser?.unidadeId) {
      return res.status(400).json({ error: "UBS sem unidade vinculada." });
    }

    const { profissionalId, data } = req.body;
    let agenda = await Agenda.findOne({ profissionalId, data });

    if (agenda) {
      agenda.horarios = req.body.horarios;
      agenda.unidadeId = ubsUser.unidadeId;
      await agenda.save();
    } else {
      agenda = await Agenda.create({ ...req.body, unidadeId: ubsUser.unidadeId });
    }

    res.status(201).json(agenda);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

ubsRouter.get("/agendamentos", authMiddleware, role("ubs"), async (req: AuthRequest, res: Response) => {
  const ubsUser = await Usuario.findById(req.userId);

  if (!ubsUser?.unidadeId) {
    return res.status(400).json({ error: "UBS sem unidade vinculada." });
  }

  const { data } = req.query;
  const filtro: Record<string, unknown> = { unidadeId: ubsUser.unidadeId };

  if (data) filtro.data = data;

  const dados = await Agendamento.find(filtro).sort({ data: 1, horario: 1 });
  res.json(dados);
});

// ── MÉDICO ────────────────────────────────────────────────────
export const medicoRouter = Router();

medicoRouter.get("/consultas", authMiddleware, role("profissionalSaude"), async (req: AuthRequest, res: Response) => {
  const { data } = req.query;
  const filtro: Record<string, unknown> = { profissionalId: req.userId };

  if (data) filtro.data = data;

  const dados = await Agendamento.find(filtro).sort({ data: 1, horario: 1 });
  res.json(dados);
});

medicoRouter.get("/horarios", authMiddleware, role("profissionalSaude"), async (req: AuthRequest, res: Response) => {
  const { data } = req.query;
  const filtro: Record<string, unknown> = { profissionalId: req.userId };

  if (data) filtro.data = data;

  const dados = await Agenda.find(filtro).sort({ data: 1 });
  res.json(dados);
});
