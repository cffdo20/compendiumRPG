import { pool } from "../../db/connection.js";
import { v4 as uuidv4 } from "uuid";
import { registrarHistorico } from "../../utils/historico.js";

export async function listar(usuario_id) {
  const result = await pool.query(
    `SELECT s.*
     FROM sistemas s
     JOIN sistema_usuarios su ON su.sistema_id = s.id
     WHERE su.usuario_id = $1`,
    [usuario_id]
  );

  return result.rows;
}

export async function buscarPorId(id) {
  const result = await pool.query(
    "SELECT * FROM sistemas WHERE id = $1",
    [id]
  );
  return result.rows[0];
}

export async function criar(data) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const id = uuidv4();
    const { nome, descricao, autor_id } = data;

    // cria sistema
    await client.query(
      `INSERT INTO sistemas (id, nome, descricao, autor_id)
       VALUES ($1, $2, $3, $4)`,
      [id, nome, descricao, autor_id]
    );

    // 🔥 REGRA DE NEGÓCIO CRÍTICA
    await client.query(
      `INSERT INTO sistema_usuarios (sistema_id, usuario_id, papel)
       VALUES ($1, $2, 'admin')`,
      [id, autor_id]
    );

    await client.query("COMMIT");

    const sistema = { id, ...data };

    // 🔥 histórico
    await registrarHistorico({
      sistema_id: id,
      entidade: "sistema",
      entidade_id: id,
      usuario_id: autor_id,
      mudancas: {
        depois: sistema
      }
    });

    return sistema;

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function atualizar(id, data) {
  const { nome, descricao, usuario_id } = data;

  // 🔥 pegar antes
  const antesResult = await pool.query(
    "SELECT * FROM sistemas WHERE id = $1",
    [id]
  );

  const antes = antesResult.rows[0];

  await pool.query(
    `UPDATE sistemas 
     SET nome = $1, descricao = $2
     WHERE id = $3`,
    [nome, descricao, id]
  );

  const depois = { id, ...data };

  // 🔥 histórico
  await registrarHistorico({
    sistema_id: id,
    entidade: "sistema",
    entidade_id: id,
    usuario_id,
    mudancas: {
      antes,
      depois
    }
  });

  return { id, ...data };
}

export async function remover(id, usuario_id) {
  // 🔥 pegar antes
  const antesResult = await pool.query(
    "SELECT * FROM sistemas WHERE id = $1",
    [id]
  );

  const antes = antesResult.rows[0];

  await pool.query("DELETE FROM sistemas WHERE id = $1", [id]);

  // 🔥 histórico
  await registrarHistorico({
    sistema_id: id,
    entidade: "sistema",
    entidade_id: id,
    usuario_id,
    mudancas: {
      antes
    }
  });
}