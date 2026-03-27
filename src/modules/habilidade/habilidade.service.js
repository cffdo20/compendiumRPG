import { pool } from "../../db/connection.js";
import { v4 as uuidv4 } from "uuid";
import { registrarHistorico } from "../../utils/historico.js";

const TIPOS_VALIDOS = ["atributo", "nivel", "classe", "habilidade"];
const OPERADORES_VALIDOS = [">=", ">", "=", "<=", "<"];
const TIPOS_HABILIDADE = ["ativa", "passiva"];

function validarPrerequisitos(prerequisitos = []) {
  for (const p of prerequisitos) {
    if (!TIPOS_VALIDOS.includes(p.tipo)) {
      throw new Error(`Tipo inválido: ${p.tipo}`);
    }

    if (p.operador && !OPERADORES_VALIDOS.includes(p.operador)) {
      throw new Error(`Operador inválido: ${p.operador}`);
    }

    if (
      ["atributo", "nivel"].includes(p.tipo) &&
      (p.valor === undefined || p.valor === null)
    ) {
      throw new Error("Valor obrigatório para este tipo de prerequisito");
    }
  }
}

// =========================
// CRIAR
// =========================
export async function criar(data) {
  const id = uuidv4();

  const {
    sistema_id,
    nome,
    descricao,
    tipo,
    custo,
    classe_id,
    prerequisitos = [],
    usuario_id
  } = data;

  if (!TIPOS_HABILIDADE.includes(tipo)) {
    throw new Error("Tipo de habilidade inválido");
  }

  validarPrerequisitos(prerequisitos);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `INSERT INTO habilidades
       (id, sistema_id, nome, descricao, tipo, custo, classe_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [id, sistema_id, nome, descricao, tipo, custo, classe_id]
    );

    for (const p of prerequisitos) {
      await client.query(
        `INSERT INTO habilidade_prerequisitos
         (id, habilidade_id, tipo, referencia_id, valor, operador, grupo)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          uuidv4(),
          id,
          p.tipo,
          p.referencia_id,
          p.valor,
          p.operador,
          p.group
        ]
      );
    }

    await client.query("COMMIT");

    const habilidade = result.rows[0];

    // 🔥 histórico
    await registrarHistorico({
      sistema_id,
      entidade: "habilidade",
      entidade_id: id,
      usuario_id,
      mudancas: {
        depois: habilidade
      }
    });

    return habilidade;

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// =========================
// LISTAR
// =========================
export async function listar(sistema_id) {
  const result = await pool.query(
    "SELECT * FROM habilidades WHERE sistema_id = $1",
    [sistema_id]
  );

  return result.rows;
}

// =========================
// BUSCAR
// =========================
export async function buscarPorId(id, sistema_id) {
  const habilidade = await pool.query(
    `SELECT * FROM habilidades
     WHERE id = $1 AND sistema_id = $2`,
    [id, sistema_id]
  );

  const prerequisitos = await pool.query(
    `SELECT * FROM habilidade_prerequisitos
     WHERE habilidade_id = $1`,
    [id]
  );

  return {
    ...habilidade.rows[0],
    prerequisitos: prerequisitos.rows
  };
}

// =========================
// ATUALIZAR
// =========================
export async function atualizar(id, sistema_id, data) {
  const {
    nome,
    descricao,
    tipo,
    custo,
    classe_id,
    prerequisitos,
    usuario_id
  } = data;

  if (tipo && !TIPOS_HABILIDADE.includes(tipo)) {
    throw new Error("Tipo de habilidade inválido");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 🔥 pegar antes
    const antesResult = await client.query(
      `SELECT * FROM habilidades
       WHERE id = $1 AND sistema_id = $2`,
      [id, sistema_id]
    );

    const antes = antesResult.rows[0];

    const result = await client.query(
      `UPDATE habilidades
       SET nome = $1,
           descricao = $2,
           tipo = $3,
           custo = $4,
           classe_id = $5
       WHERE id = $6 AND sistema_id = $7
       RETURNING *`,
      [nome, descricao, tipo, custo, classe_id, id, sistema_id]
    );

    if (!result.rows.length) {
      throw new Error("Habilidade não encontrada");
    }

    if (prerequisitos) {
      validarPrerequisitos(prerequisitos);

      await client.query(
        `DELETE FROM habilidade_prerequisitos
         WHERE habilidade_id = $1`,
        [id]
      );

      for (const p of prerequisitos) {
        await client.query(
          `INSERT INTO habilidade_prerequisitos
           (id, habilidade_id, tipo, referencia_id, valor, operador, grupo)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            uuidv4(),
            id,
            p.tipo,
            p.referencia_id,
            p.valor,
            p.operador,
            p.grupo
          ]
        );
      }
    }

    await client.query("COMMIT");

    const depois = result.rows[0];

    // 🔥 histórico
    await registrarHistorico({
      sistema_id,
      entidade: "habilidade",
      entidade_id: id,
      usuario_id,
      mudancas: {
        antes,
        depois
      }
    });

    return depois;

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// =========================
// REMOVER
// =========================
export async function remover(id, sistema_id, usuario_id) {
  // 🔥 pegar antes
  const antesResult = await pool.query(
    `SELECT * FROM habilidades
     WHERE id = $1 AND sistema_id = $2`,
    [id, sistema_id]
  );

  const antes = antesResult.rows[0];

  const result = await pool.query(
    `DELETE FROM habilidades
     WHERE id = $1 AND sistema_id = $2`,
    [id, sistema_id]
  );

  if (!result.rowCount) {
    throw new Error("Habilidade não encontrada");
  }

  // 🔥 histórico
  await registrarHistorico({
    sistema_id,
    entidade: "habilidade",
    entidade_id: id,
    usuario_id,
    mudancas: {
      antes
    }
  });

  return { sucesso: true };
}