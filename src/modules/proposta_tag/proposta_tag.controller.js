import * as service from "./proposta_tag.service.js";

// =========================
// ADICIONAR
// =========================
export async function adicionar(req, res) {
  try {
    const data = {
      sistema_id: req.params.sistemaId,
      proposta_id: req.params.propostaId,
      tag_id: req.body.tag_id
    };

    res.status(201).json(await service.adicionar(data));
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
}

// =========================
// LISTAR
// =========================
export async function listar(req, res) {
  try {
    res.json(await service.listar(
      req.params.propostaId,
      req.params.sistemaId
    ));
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

// =========================
// REMOVER
// =========================
export async function remover(req, res) {
  try {
    await service.remover(
      req.params.propostaId,
      req.params.tagId,
      req.params.sistemaId
    );

    res.sendStatus(204);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
}