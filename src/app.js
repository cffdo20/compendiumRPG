import express from "express";
import cors from "cors";

// =========================
// IMPORTAÇÃO DE ROTAS
// =========================
import sistemaRoutes from "./modules/sistema/sistema.routes.js";
import usuarioRoutes from "./modules/usuario/usuario.routes.js";
import propostaRoutes from "./modules/proposta/proposta.routes.js";
import votacaoRoutes from "./modules/votacao/votacao.routes.js";
import habilidadeRoutes from "./modules/habilidade/habilidade.routes.js";
import classeRoutes from "./modules/classe/classe.routes.js";
import regraRoutes from "./modules/regra/regra.routes.js";
import outrosRoutes from "./modules/outros/outros.routes.js";

const app = express();

// =========================
// MIDDLEWARES
// =========================
app.use(cors());
app.use(express.json());

// =========================
// HEALTH CHECK
// =========================
app.get("/", (req, res) => {
  res.send("API RPG funcionando 🚀");
});

// =========================
// ROTAS
// =========================
app.use("/sistemas", sistemaRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/propostas", propostaRoutes);
app.use("/votacoes", votacaoRoutes);
app.use("/habilidades", habilidadeRoutes);
app.use("/classes", classeRoutes);
app.use("/regras", regraRoutes);
app.use("/outros", outrosRoutes);

// =========================
// 404 HANDLER
// =========================
app.use((req, res) => {
  res.status(404).json({ erro: "Rota não encontrada" });
});

// =========================
// ERROR HANDLER GLOBAL
// =========================
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ erro: "Erro interno do servidor" });
});

// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});