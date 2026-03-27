import * as service from "./sistema.service.js";

export async function listar(req, res) {
  try {
    const usuario_id = req.usuario.id;

    res.json(await service.listar(usuario_id));
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

export async function buscarPorId(req, res) {
  try {
    res.json(await service.buscarPorId(req.params.id));
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

export async function criar(req, res) {
  try {
    const sistema = await service.criar(req.body);
    res.status(201).json(sistema);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

export async function atualizar(req, res) {
  try {
    res.json(await service.atualizar(req.params.id, req.body));
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

export async function remover(req, res) {
  try {
    await service.remover(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}