import * as service from "./atributo.service.js";

// =========================
// CRIAR
// =========================
export async function criar(req, res) {
  try {
    const data = {
      sistema_id: req.params.sistemaId,
      nome: req.body.nome,
      descricao: req.body.descricao
    };

    if (!data.nome) {
      return res.status(400).json({ erro: "Nome é obrigatório" });
    }

    const result = await service.criar(data);

    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
}

// =========================
// LISTAR
// =========================
export async function listar(req, res) {
  try {
    const result = await service.listar(req.params.sistemaId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

// =========================
// BUSCAR
// =========================
export async function buscar(req, res) {
  try {
    const result = await service.buscar(
      req.params.id,
      req.params.sistemaId
    );

    if (!result) {
      return res.status(404).json({ erro: "Atributo não encontrado" });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

// =========================
// ATUALIZAR
// =========================
export async function atualizar(req, res) {
  try {
    const result = await service.atualizar(
      req.params.id,
      req.params.sistemaId,
      req.body
    );

    if (!result) {
      return res.status(404).json({ erro: "Atributo não encontrado" });
    }

    res.json(result);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
}

// =========================
// REMOVER
// =========================
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