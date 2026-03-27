import { Router } from "express";
import * as controller from "./tags.controller.js";

import {
  autenticar,
  autorizarSistema,
  autorizarPapel
} from "../../middlewares/auth.middleware.js";

const router = Router();

// 🔐 Criar tag → admin/editor
router.post(
  "/sistemas/:sistemaId/tags",
  autenticar,
  autorizarSistema,
  autorizarPapel(["admin", "editor"]),
  controller.criar
);

// 🔐 Listar tags → membro
router.get(
  "/sistemas/:sistemaId/tags",
  autenticar,
  autorizarSistema,
  controller.listar
);

// 🔐 Buscar tag
router.get(
  "/sistemas/:sistemaId/tags/:id",
  autenticar,
  autorizarSistema,
  controller.buscar
);

// 🔐 Atualizar tag → admin/editor
router.put(
  "/sistemas/:sistemaId/tags/:id",
  autenticar,
  autorizarSistema,
  autorizarPapel(["admin", "editor"]),
  controller.atualizar
);

// 🔐 Remover tag → admin
router.delete(
  "/sistemas/:sistemaId/tags/:id",
  autenticar,
  autorizarSistema,
  autorizarPapel(["admin"]),
  controller.remover
);

export default router;