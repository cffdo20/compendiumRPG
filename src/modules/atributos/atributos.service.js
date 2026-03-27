import { pool } from "../../db/connection.js";
import { v4 as uuidv4 } from "uuid";

function normalizarNome(nome) {
  return nome.trim();
}

// =========================
// CRIAR
// =========================
export async function criar({ sistema_id, nome, descricao }) {
  const id = uuidv4();
  const nomeNormalizado = normalizarNome(nome);

  try {
    const result = await pool.query(
      `INSERT INTO atributos (id, sistema_id, nome, descricao)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, sistema_id, nomeNormalizado, descricao]
    );

    return result.rows[0];

  } catch (err) {
    if (err.code === "23505") {
      throw new Error("Já existe um atributo com esse nome");
    }
    throw err;
  }
}

// =========================
// LISTAR
// =========================
export async function listar(sistema_id) {
  const result = await pool.query(
    "SELECT * FROM atributos WHERE sistema_id = $1 ORDER BY nome",
    [sistema_id]
  );

  return result.rows;
}

// =========================
// BUSCAR
// =========================
export async function buscar(id, sistema_id) {
  const result = await pool.query(
    "SELECT * FROM atributos WHERE id = $1 AND sistema_id = $2",
    [id, sistema_id]
  );

  return result.rows[0];
}

// =========================
// ATUALIZAR
// =========================
export async function atualizar(id, sistema_id, data) {
  const nomeNormalizado = data.nome?.trim();

  try {
    const result = await pool.query(
      `UPDATE atributos
       SET nome = COALESCE($1, nome),
           descricao = COALESCE($2, descricao)
       WHERE id = $3 AND sistema_id = $4
       RETURNING *`,
      [nomeNormalizado, data.descricao, id, sistema_id]
    );

    return result.rows[0];

  } catch (err) {
    if (err.code === "23505") {
      throw new Error("Já existe um atributo com esse nome");
    }
    throw err;
  }
}

// =========================
// REMOVER
// =========================
export async function remover(id, sistema_id) {
  await pool.query(
    "DELETE FROM atributos WHERE id = $1 AND sistema_id = $2",
    [id, sistema_id]
  );

  return { sucesso: true };
}