import * as service from "./votacao.service.js";

export async function criar(req, res) {
  try {
    res.status(201).json(await service.criar({
      sistema_id: req.params.sistemaId,
      proposta_id: req.params.propostaId
    }));
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
}

export async function votar(req, res) {
  try {
    res.json(await service.votar({
      votacao_id: req.params.id,
      usuario_id: req.usuario.id,
      opcao_id: req.body.opcao_id
    }));
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
}

export async function buscar(req, res) {
  try {
    res.json(await service.buscar(req.params.id));
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

export async function finalizar(req, res) {
  try {
    res.json(await service.finalizar(req.params.id));
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
}