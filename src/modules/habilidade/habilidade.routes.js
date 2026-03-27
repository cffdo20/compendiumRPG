import { Router } from "express";
import * as controller from "./habilidade.controller.js";

import {
  autenticar,
  autorizarSistema,
  autorizarPapel,
  verificarHabilidadeDoSistema
} from "../../middlewares/auth.middleware.js";

const router = Router();

// 🔐 Criar habilidade → admin/editor
router.post(
  "/sistemas/:sistemaId/habilidades",
  autenticar,
  autorizarSistema,
  autorizarPapel(["admin", "editor"]),
  controller.criar
);

// 🔐 Listar → membro
router.get(
  "/sistemas/:sistemaId/habilidades",
  autenticar,
  autorizarSistema,
  controller.listar
);

// buscar
router.get(
  "/sistemas/:sistemaId/habilidades/:id",
  autenticar,
  autorizarSistema,
  verificarHabilidadeDoSistema,
  controller.buscarPorId
);

// atualizar
router.put(
  "/sistemas/:sistemaId/habilidades/:id",
  autenticar,
  autorizarSistema,
  verificarHabilidadeDoSistema,
  autorizarPapel(["admin", "editor"]),
  controller.atualizar
);

// remover
router.delete(
  "/sistemas/:sistemaId/habilidades/:id",
  autenticar,
  autorizarSistema,
  verificarHabilidadeDoSistema,
  autorizarPapel(["admin"]),
  controller.remover
);

export default router;