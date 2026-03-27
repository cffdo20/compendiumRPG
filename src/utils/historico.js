import { pool } from "../db/connection.js";
import { v4 as uuidv4 } from "uuid";

export async function registrarHistorico({
  sistema_id,
  entidade,
  entidade_id,
  usuario_id,
  mudancas
}) {
  // 🔥 calcular próxima versão
  const versaoResult = await pool.query(
    `SELECT COALESCE(MAX(versao), 0) + 1 AS versao
     FROM historico
     WHERE entidade_id = $1 AND entidade = $2`,
    [entidade_id, entidade]
  );

  const versao = versaoResult.rows[0].versao;

  await pool.query(
    `INSERT INTO historico
     (id, sistema_id, entidade, entidade_id, versao, mudancas, autor_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      uuidv4(),
      sistema_id,
      entidade,
      entidade_id,
      versao,
      mudancas,
      usuario_id
    ]
  );
}