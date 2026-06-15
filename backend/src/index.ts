import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./database";
import authRouter from "./routes/auth";
import {
  especialidadesRouter,
  unidadesRouter,
  profissionaisRouter,
  agendasRouter,
  agendamentosRouter,
  adminRouter,
  ubsRouter,
  medicoRouter,
} from "./routes";

const app  = express();
const PORT = process.env.PORT ?? 4000;

// ── Middlewares ───────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:3000", credentials: true }));
app.use(express.json());

// ── Rotas ─────────────────────────────────────────────────────
app.use("/api/auth",          authRouter);
app.use("/api/especialidades", especialidadesRouter);
app.use("/api/unidades",       unidadesRouter);
app.use("/api/profissionais",  profissionaisRouter);
app.use("/api/agendas",        agendasRouter);
app.use("/api/agendamentos",   agendamentosRouter);
app.use("/api/admin",          adminRouter);
app.use("/api/ubs",           ubsRouter);
app.use("/api/medico",        medicoRouter);

// ── Health check ──────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── 404 ───────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: "Rota não encontrada." }));

// ── Start ─────────────────────────────────────────────────────
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
      console.log(`📋 Health: http://localhost:${PORT}/health`);
    });
  })
  .catch((err) => {
    console.error("❌ Falha ao conectar ao banco:", err);
    process.exit(1);
  });
