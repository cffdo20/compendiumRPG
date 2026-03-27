import { pool } from "../../db/connection.js";
import { v4 as uuidv4 } from "uuid";
import { registrarHistorico } from "../../utils/historico.js";

export async function criar(data) {
  const id = uuidv4();

  const result = await pool.query(
    `INSERT INTO outros (id, sistema_id, nome, descricao, categoria)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [id, data.sistema_id, data.nome, data.descricao, data.categoria]
  );

  const registro = result.rows[0];

  // 🔥 histórico
  await registrarHistorico({
    sistema_id: data.sistema_id,
    entidade: "outro",
    entidade_id: id,
    usuario_id: data.usuario_id,
    mudancas: {
      depois: registro
    }
  });

  return registro;
}

export async function listar(sistema_id) {
  const result = await pool.query(
    "SELECT * FROM outros WHERE sistema_id = $1",
    [sistema_id]
  );

  return result.rows;
}

export async function buscar(id, sistema_id) {
  const result = await pool.query(
    "SELECT * FROM outros WHERE id = $1 AND sistema_id = $2",
    [id, sistema_id]
  );

  return result.rows[0];
}

export async function atualizar(id, sistema_id, data) {
  // 🔥 pegar antes
  const antesResult = await pool.query(
    "SELECT * FROM outros WHERE id = $1 AND sistema_id = $2",
    [id, sistema_id]
  );

  const antes = antesResult.rows[0];

  const result = await pool.query(
    `UPDATE outros
     SET nome = $1, descricao = $2, categoria = $3
     WHERE id = $4 AND sistema_id = $5
     RETURNING *`,
    [data.nome, data.descricao, data.categoria, id, sistema_id]
  );

  const depois = result.rows[0];

  // 🔥 histórico
  await registrarHistorico({
    sistema_id,
    entidade: "outro",
    entidade_id: id,
    usuario_id: data.usuario_id,
    mudancas: {
      antes,
      depois
    }
  });

  return depois;
}

export async function remover(id, sistema_id, usuario_id) {
  // 🔥 pegar antes
  const antesResult = await pool.query(
    "SELECT * FROM outros WHERE id = $1 AND sistema_id = $2",
    [id, sistema_id]
  );

  const antes = antesResult.rows[0];

  await pool.query(
    "DELETE FROM outros WHERE id = $1 AND sistema_id = $2",
    [id, sistema_id]
  );

  // 🔥 histórico
  await registrarHistorico({
    sistema_id,
    entidade: "outro",
    entidade_id: id,
    usuario_id,
    mudancas: {
      antes
    }
  });
}