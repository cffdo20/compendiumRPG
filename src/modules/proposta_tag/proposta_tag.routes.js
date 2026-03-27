import { Router } from "express";
import * as controller from "./proposta_tag.controller.js";

import {
  autenticar,
  autorizarSistema,
  autorizarPapel
} from "../../middlewares/auth.middleware.js";

const router = Router();

// 🔐 adicionar tag → editor/admin
router.post(
  "/sistemas/:sistemaId/propostas/:propostaId/tags",
  autenticar,
  autorizarSistema,
  autorizarPapel(["admin", "editor"]),
  controller.adicionar
);

// 🔐 listar tags da proposta → membro
router.get(
  "/sistemas/:sistemaId/propostas/:propostaId/tags",
  autenticar,
  autorizarSistema,
  controller.listar
);

// 🔐 remover tag → editor/admin
router.delete(
  "/sistemas/:sistemaId/propostas/:propostaId/tags/:tagId",
  autenticar,
  autorizarSistema,
  autorizarPapel(["admin", "editor"]),
  controller.remover
);

export default router;