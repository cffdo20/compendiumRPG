import { Router } from "express";
import * as controller from "./historico.controller.js";

import {
  autenticar,
  autorizarSistema
} from "../../middlewares/auth.middleware.js";

const router = Router();

// 🔐 listar histórico de uma entidade
router.get(
  "/sistemas/:sistemaId/historico/:entidade/:entidadeId",
  autenticar,
  autorizarSistema,
  controller.listarPorEntidade
);

export default router;