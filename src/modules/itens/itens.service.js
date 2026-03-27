import { pool } from "../../db/connection.js";
import { v4 as uuidv4 } from "uuid";
import { registrarHistorico } from "../../utils/historico.js";

const TIPOS_ITEM = ["arma", "armadura", "consumivel", "outro"];

function normalizarNome(nome) {
  return nome.trim();
}

// =========================
// CRIAR
// =========================
export async function criar({ sistema_id, nome, descricao, tipo, usuario_id }) {
  const id = uuidv4();
  const nomeNormalizado = normalizarNome(nome);

  if (tipo && !TIPOS_ITEM.includes(tipo)) {
    throw new Error("Tipo de item inválido");
  }

  try {
    const result = await pool.query(
      `INSERT INTO itens (id, sistema_id, nome, descricao, tipo)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, sistema_id, nomeNormalizado, descricao, tipo]
    );

    const item = result.rows[0];

    // 🔥 histórico
    await registrarHistorico({
      sistema_id,
      entidade: "item",
      entidade_id: id,
      usuario_id,
      mudancas: {
        depois: item
      }
    });

    return item;

  } catch (err) {
    if (err.code === "23505") {
      throw new Error("Já existe um item com esse nome");
    }
    throw err;
  }
}

// =========================
// LISTAR
// =========================
export async function listar(sistema_id) {
  const result = await pool.query(
    "SELECT * FROM itens WHERE sistema_id = $1 ORDER BY nome",
    [sistema_id]
  );

  return result.rows;
}

// =========================
// BUSCAR
// =========================
export async function buscar(id, sistema_id) {
  const result = await pool.query(
    "SELECT * FROM itens WHERE id = $1 AND sistema_id = $2",
    [id, sistema_id]
  );

  return result.rows[0];
}

// =========================
// ATUALIZAR
// =========================
export async function atualizar(id, sistema_id, data) {
  const nomeNormalizado = data.nome?.trim();

  if (data.tipo && !TIPOS_ITEM.includes(data.tipo)) {
    throw new Error("Tipo de item inválido");
  }

  // 🔥 pegar antes
  const antesResult = await pool.query(
    "SELECT * FROM itens WHERE id = $1 AND sistema_id = $2",
    [id, sistema_id]
  );

  const antes = antesResult.rows[0];

  try {
    const result = await pool.query(
      `UPDATE itens
       SET nome = COALESCE($1, nome),
           descricao = COALESCE($2, descricao),
           tipo = COALESCE($3, tipo)
       WHERE id = $4 AND sistema_id = $5
       RETURNING *`,
      [nomeNormalizado, data.descricao, data.tipo, id, sistema_id]
    );

    const depois = result.rows[0];

    // 🔥 histórico
    await registrarHistorico({
      sistema_id,
      entidade: "item",
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
      throw new Error("Já existe um item com esse nome");
    }
    throw err;
  }
}

// =========================
// REMOVER
// =========================
export async function remover(id, sistema_id, usuario_id) {
  // 🔥 pegar antes
  const antesResult = await pool.query(
    "SELECT * FROM itens WHERE id = $1 AND sistema_id = $2",
    [id, sistema_id]
  );

  const antes = antesResult.rows[0];

  await pool.query(
    "DELETE FROM itens WHERE id = $1 AND sistema_id = $2",
    [id, sistema_id]
  );

  // 🔥 histórico
  await registrarHistorico({
    sistema_id,
    entidade: "item",
    entidade_id: id,
    usuario_id,
    mudancas: {
      antes
    }
  });

  return { sucesso: true };
}