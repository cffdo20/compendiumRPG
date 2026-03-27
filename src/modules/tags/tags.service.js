import { pool } from "../../db/connection.js";
import { v4 as uuidv4 } from "uuid";
import { registrarHistorico } from "../../utils/historico.js";

function normalizarNome(nome) {
  return nome.trim().toLowerCase();
}

// =========================
// CRIAR
// =========================
export async function criar({ sistema_id, nome, usuario_id }) {
  const id = uuidv4();
  const nomeNormalizado = normalizarNome(nome);

  try {
    const result = await pool.query(
      `INSERT INTO tags (id, sistema_id, nome)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id, sistema_id, nomeNormalizado]
    );

    // 🔥 histórico
    await registrarHistorico({
      sistema_id,
      entidade: "tag",
      entidade_id: id,
      usuario_id,
      mudancas: {
        depois: result.rows[0]
      }
    });

    return result.rows[0];

  } catch (err) {
    if (err.code === "23505") {
      throw new Error("Tag já existe neste sistema");
    }
    throw err;
  }
}

// =========================
// ATUALIZAR
// =========================
export async function atualizar(id, sistema_id, data) {
  const nomeNormalizado = normalizarNome(data.nome);

  // 🔥 pegar antes
  const antesResult = await pool.query(
    "SELECT * FROM tags WHERE id = $1 AND sistema_id = $2",
    [id, sistema_id]
  );

  const antes = antesResult.rows[0];

  try {
    const result = await pool.query(
      `UPDATE tags
       SET nome = $1
       WHERE id = $2 AND sistema_id = $3
       RETURNING *`,
      [nomeNormalizado, id, sistema_id]
    );

    const depois = result.rows[0];

    // 🔥 histórico
    await registrarHistorico({
      sistema_id,
      entidade: "tag",
      entidade_id: id,
      usuario_id: data.usuario_id,
      mudancas: {
        antes,
        depois
      }
    });

    return depois;

  } catch (err) {
    if (err.code === "23505") {
      throw new Error("Já existe uma tag com esse nome");
    }
    throw err;
  }
}

// =========================
// LISTAR
// =========================
export async function listar(sistema_id) {
  const result = await pool.query(
    "SELECT * FROM tags WHERE sistema_id = $1 ORDER BY nome",
    [sistema_id]
  );

  return result.rows;
}

// =========================
// BUSCAR
// =========================
export async function buscar(id, sistema_id) {
  const result = await pool.query(
    "SELECT * FROM tags WHERE id = $1 AND sistema_id = $2",
    [id, sistema_id]
  );

  return result.rows[0];
}

// =========================
// REMOVER
// =========================
export async function remover(id, sistema_id, usuario_id) {
  // 🔥 pegar antes
  const antesResult = await pool.query(
    "SELECT * FROM tags WHERE id = $1 AND sistema_id = $2",
    [id, sistema_id]
  );

  const antes = antesResult.rows[0];

  await pool.query(
    "DELETE FROM tags WHERE id = $1 AND sistema_id = $2",
    [id, sistema_id]
  );

  // 🔥 histórico
  await registrarHistorico({
    sistema_id,
    entidade: "tag",
    entidade_id: id,
    usuario_id,
    mudancas: {
      antes
    }
  });

  return { sucesso: true };
}