import { pool } from "../../db/connection.js";

export async function listarPorEntidade(
  sistema_id,
  entidade,
  entidade_id
) {
  const result = await pool.query(
    `SELECT *
     FROM historico
     WHERE sistema_id = $1
       AND entidade = $2
       AND entidade_id = $3
     ORDER BY versao DESC`,
    [sistema_id, entidade, entidade_id]
  );

  return result.rows;
}