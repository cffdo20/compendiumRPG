import * as service from "./historico.service.js";

export async function listarPorEntidade(req, res) {
  try {
    const { sistemaId, entidade, entidadeId } = req.params;

    const result = await service.listarPorEntidade(
      sistemaId,
      entidade,
      entidadeId
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}