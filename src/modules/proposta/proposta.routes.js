import { Router } from "express";
import * as controller from "./proposta.controller.js";

import {
  autenticar,
  autorizarSistema,
  autorizarPapel,
  verificarPropostaDoSistema
} from "../../middlewares/auth.middleware.js";

const router = Router();

// 🔐 Criar proposta
// ✔ Usuário autenticado
// ✔ Pertence ao sistema
// ✔ Papel: admin ou editor
router.post(
  "/sistemas/:sistemaId/propostas",
  autenticar,
  autorizarSistema,
  autorizarPapel(["admin", "editor"]),
  controller.criar
);

// 🔐 Listar propostas
// ✔ Usuário autenticado
// ✔ Pertence ao sistema (qualquer papel: admin, editor, viewer)
router.get(
  "/sistemas/:sistemaId/propostas",
  autenticar,
  autorizarSistema,
  controller.listar
);

// 🔐 Buscar proposta específica
// ✔ Usuário autenticado
// ✔ Pertence ao sistema
// ✔ Proposta pertence ao sistema
router.get(
  "/sistemas/:sistemaId/propostas/:id",
  autenticar,
  autorizarSistema,
  verificarPropostaDoSistema,
  controller.buscarPorId
);

// 🔐 Atualizar proposta
// ✔ Usuário autenticado
// ✔ Pertence ao sistema
// ✔ Proposta pertence ao sistema
// ✔ Papel: admin ou editor
router.put(
  "/sistemas/:sistemaId/propostas/:id",
  autenticar,
  autorizarSistema,
  verificarPropostaDoSistema,
  autorizarPapel(["admin", "editor"]),
  controller.atualizar
);

// 🔐 Remover proposta
// ✔ Usuário autenticado
// ✔ Pertence ao sistema
// ✔ Proposta pertence ao sistema
// ✔ Papel: admin
router.delete(
  "/sistemas/:sistemaId/propostas/:id",
  autenticar,
  autorizarSistema,
  verificarPropostaDoSistema,
  autorizarPapel(["admin"]),
  controller.remover
);

export default router;