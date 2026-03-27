import { pool } from "../../db/connection.js";
import { registrarHistorico } from "../../utils/historico.js";

// =========================
// VALIDAR RELAÇÃO
// =========================
async function validarSistema(proposta_id, tag_id, sistema_id) {
  const result = await pool.query(
    `
    SELECT 1
    FROM propostas p
    JOIN tags t ON t.sistema_id = p.sistema_id
    WHERE p.id = $1
      AND t.id = $2
      AND p.sistema_id = $3
    `,
    [proposta_id, tag_id, sistema_id]
  );

  if (!result.rows.length) {
    throw new Error("Proposta ou tag não pertencem ao sistema");
  }
}

// =========================
// ADICIONAR
// =========================
export async function adicionar({ proposta_id, tag_id, sistema_id, usuario_id }) {
  await validarSistema(proposta_id, tag_id, sistema_id);

  await pool.query(
    `INSERT INTO proposta_tags (proposta_id, tag_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [proposta_id, tag_id]
  );

  // 🔥 histórico
  await registrarHistorico({
    sistema_id,
    entidade: "proposta_tag",
    entidade_id: `${proposta_id}_${tag_id}`,
    usuario_id,
    mudancas: {
      depois: { proposta_id, tag_id }
    }
  });

  return { sucesso: true };
}

// =========================
// LISTAR
// =========================
export async function listar(proposta_id, sistema_id) {
  const result = await pool.query(
    `
    SELECT t.*
    FROM tags t
    JOIN proposta_tags pt ON pt.tag_id = t.id
    JOIN propostas p ON p.id = pt.proposta_id
    WHERE pt.proposta_id = $1
      AND p.sistema_id = $2
    ORDER BY t.nome
    `,
    [proposta_id, sistema_id]
  );

  return result.rows;
}

// =========================
// REMOVER
// =========================
export async function remover(proposta_id, tag_id, sistema_id, usuario_id) {
  await validarSistema(proposta_id, tag_id, sistema_id);

  // 🔥 pegar antes
  const antes = { proposta_id, tag_id };

  await pool.query(
    `DELETE FROM proposta_tags
     WHERE proposta_id = $1 AND tag_id = $2`,
    [proposta_id, tag_id]
  );

  // 🔥 histórico
  await registrarHistorico({
    sistema_id,
    entidade: "proposta_tag",
    entidade_id: `${proposta_id}_${tag_id}`,
    usuario_id,
    mudancas: {
      antes
    }
  });

  return { sucesso: true };
}