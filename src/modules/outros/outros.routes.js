import { Router } from "express";
import * as controller from "./outros.controller.js";

import {
  autenticar,
  autorizarSistema,
  autorizarPapel
} from "../../middlewares/auth.middleware.js";

const router = Router();

// 🔐 criar → admin/editor
router.post(
  "/sistemas/:sistemaId/outros",
  autenticar,
  autorizarSistema,
  autorizarPapel(["admin", "editor"]),
  controller.criar
);

// 🔐 listar → membro
router.get(
  "/sistemas/:sistemaId/outros",
  autenticar,
  autorizarSistema,
  controller.listar
);

// 🔐 buscar
router.get(
  "/sistemas/:sistemaId/outros/:id",
  autenticar,
  autorizarSistema,
  controller.buscar
);

// 🔐 atualizar → admin/editor
router.put(
  "/sistemas/:sistemaId/outros/:id",
  autenticar,
  autorizarSistema,
  autorizarPapel(["admin", "editor"]),
  controller.atualizar
);

// 🔐 remover → admin
router.delete(
  "/sistemas/:sistemaId/outros/:id",
  autenticar,
  autorizarSistema,
  autorizarPapel(["admin"]),
  controller.remover
);

export default router;