import { Router } from "express";
import * as controller from "./sistema_usuario.controller.js";

import {
  autenticar,
  autorizarSistema,
  autorizarPapel
} from "../../middlewares/auth.middleware.js";

const router = Router();

// adicionar usuário → só admin
router.post(
  "/",
  autenticar,
  autorizarSistema,
  autorizarPapel(["admin"]),
  controller.adicionar
);

// listar usuários do sistema → membro
router.get(
  "/sistema/:sistemaId",
  autenticar,
  autorizarSistema,
  controller.listarPorSistema
);

// listar sistemas do usuário → autenticado
router.get(
  "/usuario/:usuarioId",
  autenticar,
  controller.listarPorUsuario
);

// atualizar papel → admin
router.put(
  "/",
  autenticar,
  autorizarSistema,
  autorizarPapel(["admin"]),
  controller.atualizar
);

// remover usuário → admin
router.delete(
  "/",
  autenticar,
  autorizarSistema,
  autorizarPapel(["admin"]),
  controller.remover
);

export default router;