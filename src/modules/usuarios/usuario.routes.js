import { Router } from "express";
import * as controller from "./usuario.controller.js";
import { autenticar } from "../../middlewares/auth.middleware.js";

const router = Router();

// auth
router.post("/register", controller.criar);
router.post("/login", controller.login);

// protegidas
router.get("/", autenticar, controller.listar);
router.get("/:id", autenticar, controller.buscarPorId);
router.put("/:id/senha", autenticar, controller.alterarSenha);

export default router;