import { pool } from "../../db/connection.js";
import { v4 as uuidv4 } from "uuid";
import { registrarHistorico } from "../../utils/historico.js";

// =========================
// CRIAR VOTAÇÃO
// =========================
export async function criar({ sistema_id, proposta_id, usuario_id }) {
  const id = uuidv4();

  // 🔥 garantir que proposta pertence ao sistema
  const proposta = await pool.query(
    `SELECT * FROM propostas
     WHERE id = $1 AND sistema_id = $2`,
    [proposta_id, sistema_id]
  );

  if (!proposta.rows.length) {
    throw new Error("Proposta não pertence ao sistema");
  }

  const result = await pool.query(
    `INSERT INTO votacoes (id, sistema_id, proposta_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [id, sistema_id, proposta_id]
  );

  // 🔥 histórico
  await registrarHistorico({
    sistema_id,
    entidade: "votacao",
    entidade_id: id,
    usuario_id,
    mudancas: {
      depois: result.rows[0]
    }
  });

  return result.rows[0];
}

// =========================
// VOTAR
// =========================
export async function votar({ votacao_id, usuario_id, opcao_id }) {
  const id = uuidv4();

  // 🔥 validar opção contra tabela opcoes_voto
  const opcao = await pool.query(
    `SELECT * FROM opcoes_voto WHERE id = $1`,
    [opcao_id]
  );

  if (!opcao.rows.length) {
    throw new Error("Opção de voto inválida");
  }

  try {
    await pool.query(
      `INSERT INTO votos (id, votacao_id, usuario_id, opcao_id)
       VALUES ($1, $2, $3, $4)`,
      [id, votacao_id, usuario_id, opcao_id]
    );
  } catch (err) {
    // 🔥 tratar voto duplicado
    if (err.code === "23505") {
      throw new Error("Usuário já votou nesta votação");
    }
    throw err;
  }

  // 🔥 histórico
  await registrarHistorico({
    sistema_id: null, // votação não recebe sistema_id aqui diretamente
    entidade: "voto",
    entidade_id: id,
    usuario_id,
    mudancas: {
      depois: { votacao_id, usuario_id, opcao_id }
    }
  });

  return { sucesso: true };
}

// =========================
// BUSCAR VOTAÇÃO + VOTOS
// =========================
export async function buscar(id) {
  const result = await pool.query(
    `SELECT v.id,
            v.proposta_id,
            vt.usuario_id,
            vt.opcao_id
     FROM votacoes v
     LEFT JOIN votos vt ON vt.votacao_id = v.id
     WHERE v.id = $1`,
    [id]
  );

  return result.rows;
}

// =========================
// CALCULAR RESULTADO
// =========================
export async function calcularResultado(votacao_id) {
  const result = await pool.query(
    `SELECT opcao_id, COUNT(*) as total
     FROM votos
     WHERE votacao_id = $1
     GROUP BY opcao_id`,
    [votacao_id]
  );

  return result.rows;
}

// =========================
// FINALIZAR VOTAÇÃO
// =========================
export async function finalizar(votacao_id, usuario_id) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 🔥 contar votos
    const votos = await client.query(
      `SELECT opcao_id, COUNT(*) as total
       FROM votos
       WHERE votacao_id = $1
       GROUP BY opcao_id`,
      [votacao_id]
    );

    if (!votos.rows.length) {
      throw new Error("Nenhum voto registrado");
    }

    // 🔥 encontrar vencedor
    const vencedor = votos.rows.reduce((prev, curr) =>
      parseInt(curr.total) > parseInt(prev.total) ? curr : prev
    );

    // 🔥 buscar votação
    const votacao = await client.query(
      `SELECT * FROM votacoes WHERE id = $1`,
      [votacao_id]
    );

    const proposta_id = votacao.rows[0].proposta_id;
    const sistema_id = votacao.rows[0].sistema_id;

    // 🔥 definir status da proposta
    let status = "rejeitada";

    if (vencedor.opcao_id === "favor") {
      status = "aprovada";
    }

    // 🔥 atualizar proposta
    await client.query(
      `UPDATE propostas SET status = $1 WHERE id = $2`,
      [status, proposta_id]
    );

    // 🔥 marcar votação como finalizada
    await client.query(
      `UPDATE votacoes
       SET resultado = $1, data_fim = NOW()
       WHERE id = $2`,
      [vencedor.opcao_id, votacao_id]
    );

    await client.query("COMMIT");

    // 🔥 histórico
    await registrarHistorico({
      sistema_id,
      entidade: "votacao",
      entidade_id: votacao_id,
      usuario_id,
      mudancas: {
        depois: {
          resultado: vencedor.opcao_id,
          proposta_id,
          status
        }
      }
    });

    return {
      resultado: vencedor.opcao_id,
      total: votos.rows
    };

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}