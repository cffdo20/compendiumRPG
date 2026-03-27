import { Router } from "express";
import * as controller from "./sistema.controller.js";
import { autenticar } from "../../middlewares/auth.middleware.js";

const router = Router();

// criar sistema (precisa estar logado)
router.post("/", autenticar, controller.criar);

// listar sistemas (pode deixar aberto ou protegido)
router.get("/", autenticar, controller.listar);

// buscar sistema
router.get("/:id", autenticar, controller.buscarPorId);

// atualizar (depois você pode restringir pra admin)
router.put("/:id", autenticar, controller.atualizar);

// remover (ideal: só admin futuramente)
router.delete("/:id", autenticar, controller.remover);

export default router;