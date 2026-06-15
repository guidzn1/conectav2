import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Usuario } from "../models";

const router = Router();
const JWT_SECRET  = () => process.env.JWT_SECRET  ?? "secret";
const JWT_EXPIRES = () => process.env.JWT_EXPIRES_IN ?? "7d";

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { nome, cpf, email, telefone, senha, tipoUsuario,
            nivelAcesso, registroProfissional, especialidadeId } = req.body;

    if (!nome || !cpf || !email || !senha || !tipoUsuario) {
      return res.status(400).json({ error: "Campos obrigatórios faltando." });
    }

    if (tipoUsuario !== "paciente") {
      return res.status(400).json({ error: "Apenas pacientes podem se cadastrar publicamente." });
    }

    const cleanedCpf = cpf.replace(/\D/g, "");
    const existe = await Usuario.findOne({ $or: [{ cpf: cleanedCpf }, { email }] });
    if (existe) return res.status(409).json({ error: "CPF ou e-mail já cadastrado." });

    const senhaHash = await bcrypt.hash(senha, 10);
    const usuario = await Usuario.create({
      nome, cpf: cleanedCpf, email, telefone: telefone ?? "", senhaHash, tipoUsuario,
      nivelAcesso, registroProfissional, especialidadeId,
    });

    const token = jwt.sign(
      { userId: usuario._id.toString(), tipoUsuario: usuario.tipoUsuario },
      JWT_SECRET(), { expiresIn: JWT_EXPIRES() } as jwt.SignOptions
    );

    return res.status(201).json({
      token,
      user: { id: usuario._id, nome: usuario.nome, email: usuario.email, tipoUsuario: usuario.tipoUsuario },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { cpf, senha } = req.body;
    if (!cpf || !senha) return res.status(400).json({ error: "CPF e senha obrigatórios." });

    const usuario = await Usuario.findOne({ cpf: cpf.replace(/\D/g, "") });
    if (!usuario) return res.status(401).json({ error: "CPF ou senha inválidos." });

    const ok = await bcrypt.compare(senha, usuario.senhaHash);
    if (!ok) return res.status(401).json({ error: "CPF ou senha inválidos." });

    const token = jwt.sign(
      { userId: usuario._id.toString(), tipoUsuario: usuario.tipoUsuario },
      JWT_SECRET(), { expiresIn: JWT_EXPIRES() } as jwt.SignOptions
    );

    return res.json({
      token,
      user: { id: usuario._id, nome: usuario.nome, email: usuario.email,
              cpf: usuario.cpf, telefone: usuario.telefone, tipoUsuario: usuario.tipoUsuario },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
});

// GET /api/auth/me
router.get("/me", async (req: Request, res: Response) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "Não autenticado." });
    const payload = jwt.verify(header.split(" ")[1], JWT_SECRET()) as { userId: string };
    const usuario = await Usuario.findById(payload.userId).select("-senhaHash");
    if (!usuario) return res.status(404).json({ error: "Usuário não encontrado." });
    return res.json(usuario);
  } catch {
    return res.status(401).json({ error: "Token inválido." });
  }
});

export default router;
