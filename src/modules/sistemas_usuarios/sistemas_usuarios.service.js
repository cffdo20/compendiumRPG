import { pool } from "../../db/connection.js";
import { registrarHistorico } from "../../utils/historico.js";

// =========================
// ADICIONAR USUÁRIO AO SISTEMA
// =========================
export async function adicionar(data) {
  const { sistema_id, usuario_id, papel, autor_id } = data;

  await pool.query(
    `INSERT INTO sistema_usuarios (sistema_id, usuario_id, papel)
     VALUES ($1, $2, $3)
     ON CONFLICT DO NOTHING`,
    [sistema_id, usuario_id, papel]
  );

  // 🔥 histórico
  await registrarHistorico({
    sistema_id,
    entidade: "sistema_usuario",
    entidade_id: `${sistema_id}_${usuario_id}`,
    usuario_id: autor_id,
    mudancas: {
      depois: { sistema_id, usuario_id, papel }
    }
  });

  return { sucesso: true };
}

// =========================
// LISTAR POR SISTEMA
// =========================
export async function listarPorSistema(sistema_id) {
  const result = await pool.query(
    `SELECT * FROM sistema_usuarios WHERE sistema_id = $1`,
    [sistema_id]
  );

  return result.rows;
}

// =========================
// LISTAR POR USUÁRIO
// =========================
export async function listarPorUsuario(usuario_id) {
  const result = await pool.query(
    `SELECT * FROM sistema_usuarios WHERE usuario_id = $1`,
    [usuario_id]
  );

  return result.rows;
}

// =========================
// ATUALIZAR PAPEL
// =========================
export async function atualizar(data) {
  const { sistema_id, usuario_id, papel, autor_id } = data;

  // pegar estado anterior
  const antesResult = await pool.query(
    `SELECT * FROM sistema_usuarios
     WHERE sistema_id = $1 AND usuario_id = $2`,
    [sistema_id, usuario_id]
  );

  const antes = antesResult.rows[0];

  const result = await pool.query(
    `UPDATE sistema_usuarios
     SET papel = $1
     WHERE sistema_id = $2 AND usuario_id = $3
     RETURNING *`,
    [papel, sistema_id, usuario_id]
  );

  const depois = result.rows[0];

  // 🔥 histórico
  await registrarHistorico({
    sistema_id,
    entidade: "sistema_usuario",
    entidade_id: `${sistema_id}_${usuario_id}`,
    usuario_id: autor_id,
    mudancas: {
      antes,
      depois
    }
  });

  return depois;
}

// =========================
// REMOVER USUÁRIO DO SISTEMA
// =========================
export async function remover(data) {
  const { sistema_id, usuario_id, autor_id } = data;

  // pegar estado anterior
  const antesResult = await pool.query(
    `SELECT * FROM sistema_usuarios
     WHERE sistema_id = $1 AND usuario_id = $2`,
    [sistema_id, usuario_id]
  );

  const antes = antesResult.rows[0];

  // 🔥 regra: não remover último admin
  const adminCount = await pool.query(
    `SELECT COUNT(*) FROM sistema_usuarios
     WHERE sistema_id = $1 AND papel = 'admin'`,
    [sistema_id]
  );

  if (
    antes?.papel === "admin" &&
    parseInt(adminCount.rows[0].count) <= 1
  ) {
    throw new Error("Não é possível remover o último admin");
  }

  await pool.query(
    `DELETE FROM sistema_usuarios
     WHERE sistema_id = $1 AND usuario_id = $2`,
    [sistema_id, usuario_id]
  );

  // 🔥 histórico
  await registrarHistorico({
    sistema_id,
    entidade: "sistema_usuario",
    entidade_id: `${sistema_id}_${usuario_id}`,
    usuario_id: autor_id,
    mudancas: {
      antes
    }
  });

  return { sucesso: true };
}