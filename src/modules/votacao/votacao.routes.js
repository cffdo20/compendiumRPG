import { Router } from "express";
import * as controller from "./votacao.controller.js";

import {
  autenticar,
  autorizarSistema,
  autorizarPapel,
  verificarVotacaoDoSistema
} from "../../middlewares/auth.middleware.js";

const router = Router();

// 🔐 Criar votação → admin/editor
router.post(
  "/sistemas/:sistemaId/propostas/:propostaId/votacoes",
  autenticar,
  autorizarSistema,
  autorizarPapel(["admin", "editor"]),
  controller.criar
);

// 🔐 Votar → qualquer membro
router.post(
  "/sistemas/:sistemaId/votacoes/:id/votar",
  autenticar,
  autorizarSistema,
  verificarVotacaoDoSistema,
  controller.votar
);

// 🔐 Ver votação → membro
router.get(
  "/sistemas/:sistemaId/votacoes/:id",
  autenticar,
  autorizarSistema,
  verificarVotacaoDoSistema,
  controller.buscar
);

// 🔐 Finalizar votação → admin
router.post(
  "/sistemas/:sistemaId/votacoes/:id/finalizar",
  autenticar,
  autorizarSistema,
  verificarVotacaoDoSistema,
  autorizarPapel(["admin"]),
  controller.finalizar
);

export default router;