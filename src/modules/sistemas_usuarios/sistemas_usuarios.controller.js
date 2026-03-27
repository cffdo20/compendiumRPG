import * as service from "./sistema_usuario.service.js";

export async function adicionar(req, res) {
  try {
    res.status(201).json(await service.adicionar(req.body));
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
}

export async function listarPorSistema(req, res) {
  try {
    res.json(await service.listarPorSistema(req.params.sistemaId));
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

export async function listarPorUsuario(req, res) {
  try {
    res.json(await service.listarPorUsuario(req.params.usuarioId));
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

export async function atualizar(req, res) {
  try {
    res.json(await service.atualizar(req.body));
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
}

export async function remover(req, res) {
  try {
    res.json(await service.remover(req.body));
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
}