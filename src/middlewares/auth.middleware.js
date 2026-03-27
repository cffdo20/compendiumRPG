import jwt from "jsonwebtoken";
import { pool } from "../db/connection.js";


const JWT_SECRET = process.env.JWT_SECRET;

export function autenticar(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ erro: "Token não informado" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    // 🔥 injeta usuário na requisição
    req.usuario = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ erro: "Token inválido" });
  }
}

// verifica se usuário pertence ao sistema
export async function autorizarSistema(req, res, next) {
  try {
    const usuario_id = req.usuario.id;
    const sistema_id = req.params.sistemaId || req.body.sistema_id;

    if (!sistema_id) {
      return res.status(400).json({ erro: "sistema_id não informado" });
    }

    const result = await pool.query(
      `SELECT * FROM sistema_usuarios
       WHERE sistema_id = $1 AND usuario_id = $2`,
      [sistema_id, usuario_id]
    );

    if (!result.rows.length) {
      return res.status(403).json({ erro: "Acesso negado ao sistema" });
    }

    // 🔥 guarda papel do usuário
    req.usuarioSistema = result.rows[0];

    next();
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

export function autorizarPapel(papeisPermitidos) {
  return (req, res, next) => {
    const papel = req.usuarioSistema?.papel;

    if (!papeisPermitidos.includes(papel)) {
      return res.status(403).json({ erro: "Permissão insuficiente" });
    }

    next();
  };
}

// 🔥 verifica se proposta pertence ao sistema
export async function verificarPropostaDoSistema(req, res, next) {
  try {
    const propostaId = req.params.id;
    const sistema_id = req.params.sistemaId || req.body.sistema_id;

    if (!propostaId) {
      return res.status(400).json({ erro: "ID da proposta não informado" });
    }

    const result = await pool.query(
      `SELECT * FROM propostas
       WHERE id = $1 AND sistema_id = $2`,
      [propostaId, sistema_id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        erro: "Proposta não pertence a este sistema"
      });
    }

    // opcional: guardar proposta
    req.proposta = result.rows[0];

    next();
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// 🔥 verificar se votação pertence ao sistema
export async function verificarVotacaoDoSistema(req, res, next) {
  try {
    const votacaoId = req.params.id;
    const sistema_id = req.params.sistemaId;

    const result = await pool.query(
      `SELECT * FROM votacoes
       WHERE id = $1 AND sistema_id = $2`,
      [votacaoId, sistema_id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        erro: "Votação não pertence a este sistema"
      });
    }

    req.votacao = result.rows[0];

    next();
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

export async function verificarHabilidadeDoSistema(req, res, next) {
  try {
    const { id, sistemaId } = req.params;

    const result = await pool.query(
      `SELECT * FROM habilidades
       WHERE id = $1 AND sistema_id = $2`,
      [id, sistemaId]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        erro: "Habilidade não pertence ao sistema"
      });
    }

    req.habilidade = result.rows[0];

    next();
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}