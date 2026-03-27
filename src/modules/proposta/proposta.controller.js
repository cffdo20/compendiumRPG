import * as service from "./proposta.service.js";

export async function criar(req, res) {
  try {
    const data = {
      ...req.body,
      autor_id: req.usuario.id
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
    const proposta = await service.buscarPorId(
      req.params.id,
      req.params.sistemaId
    );

    res.json(proposta);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

export async function atualizar(req, res) {
  try {
    const proposta = await service.atualizar(
      req.params.id,
      req.params.sistemaId,
      req.body
    );

    res.json(proposta);
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