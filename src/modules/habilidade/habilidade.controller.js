import * as service from "./habilidade.service.js";

export async function criar(req, res) {
  try {
    const data = {
      ...req.body,
      sistema_id: req.params.sistemaId
    };

    res.status(201).json(await service.criar(data));
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
}

export async function listar(req, res) {
  try {
    res.json(await service.listar(req.params.sistemaId));
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

export async function buscarPorId(req, res) {
  try {
    res.json(await service.buscarPorId(
      req.params.id,
      req.params.sistemaId
    ));
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

export async function atualizar(req, res) {
  try {
    res.json(await service.atualizar(
      req.params.id,
      req.params.sistemaId,
      req.body
    ));
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
}

export async function remover(req, res) {
  try {
    await service.remover(
      req.params.id,
      req.params.sistemaId
    );
    res.sendStatus(204);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
}