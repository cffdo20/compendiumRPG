import { Router } from "express";
import * as controller from "./item.controller.js";

import {
  autenticar,
  autorizarSistema,
  autorizarPapel
} from "../../middlewares/auth.middleware.js";

const router = Router();

// 🔐 Criar → admin/editor
router.post(
  "/sistemas/:sistemaId/itens",
  autenticar,
  autorizarSistema,
  autorizarPapel(["admin", "editor"]),
  controller.criar
);

// 🔐 Listar → membro
router.get(
  "/sistemas/:sistemaId/itens",
  autenticar,
  autorizarSistema,
  controller.listar
);

// 🔐 Buscar
router.get(
  "/sistemas/:sistemaId/itens/:id",
  autenticar,
  autorizarSistema,
  controller.buscar
);

// 🔐 Atualizar → admin/editor
router.put(
  "/sistemas/:sistemaId/itens/:id",
  autenticar,
  autorizarSistema,
  autorizarPapel(["admin", "editor"]),
  controller.atualizar
);

// 🔐 Remover → admin
router.delete(
  "/sistemas/:sistemaId/itens/:id",
  autenticar,
  autorizarSistema,
  autorizarPapel(["admin"]),
  controller.remover
);

export default router;