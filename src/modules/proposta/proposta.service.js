import { pool } from "../../db/connection.js";
import { v4 as uuidv4 } from "uuid";

const STATUS_VALIDOS = [
  "em_votacao",
  "aprovada",
  "rejeitada",
  "arquivada"
];

// =========================
// CRIAR
// =========================
export async function criar(data) {
  const id = uuidv4();

  const {
    sistema_id,
    titulo,
    descricao,
    autor_id,
    tipo = "geral",
    status = "em_votacao"
  } = data;

  if (!STATUS_VALIDOS.includes(status)) {
    throw new Error("Status inválido");
  }

  const result = await pool.query(
    `INSERT INTO propostas
     (id, sistema_id, titulo, descricao, autor_id, tipo, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [id, sistema_id, titulo, descricao, autor_id, tipo, status]
  );

  return result.rows[0];
}

// =========================
// LISTAR
// =========================
export async function listar(sistema_id) {
  const result = await pool.query(
    "SELECT * FROM propostas WHERE sistema_id = $1",
    [sistema_id]
  );

  return result.rows;
}

// =========================
// BUSCAR PROPOSTAS POR TAG
// =========================

export async function listarComFiltro(sistema_id, tag) {
  if (!tag) {
    return listar(sistema_id);
  }

  const result = await pool.query(
    `
    SELECT DISTINCT p.*
    FROM propostas p
    JOIN proposta_tags pt ON pt.proposta_id = p.id
    JOIN tags t ON t.id = pt.tag_id
    WHERE p.sistema_id = $1
      AND t.nome = $2
    `,
    [sistema_id, tag.toLowerCase()]
  );

  return result.rows;
}

// =========================
// BUSCAR POR ID
// =========================
export async function buscarPorId(id, sistema_id) {
  const proposta = await pool.query(
    `SELECT * FROM propostas
     WHERE id = $1 AND sistema_id = $2`,
    [id, sistema_id]
  );

  if (!proposta.rows.length) return null;

  const tags = await pool.query(
    `
    SELECT t.*
    FROM tags t
    JOIN proposta_tags pt ON pt.tag_id = t.id
    WHERE pt.proposta_id = $1
    `,
    [id]
  );

  return {
    ...proposta.rows[0],
    tags: tags.rows
  };
}

// =========================
// ATUALIZAR
// =========================
export async function atualizar(id, sistema_id, data) {
  const { titulo, descricao, status } = data;

  if (status && !STATUS_VALIDOS.includes(status)) {
    throw new Error("Status inválido");
  }

  const result = await pool.query(
    `UPDATE propostas
     SET titulo = $1,
         descricao = $2,
         status = COALESCE($3, status)
     WHERE id = $4 AND sistema_id = $5
     RETURNING *`,
    [titulo, descricao, status, id, sistema_id]
  );

  if (!result.rows.length) {
    throw new Error("Proposta não encontrada no sistema");
  }

  return result.rows[0];
}

// =========================
// REMOVER
// =========================
export async function remover(id, sistema_id) {
  const result = await pool.query(
    `DELETE FROM propostas
     WHERE id = $1 AND sistema_id = $2
     RETURNING *`,
    [id, sistema_id]
  );

  if (!result.rows.length) {
    throw new Error("Proposta não encontrada no sistema");
  }

  return { sucesso: true };
}