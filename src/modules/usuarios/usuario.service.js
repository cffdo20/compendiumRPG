import { pool } from "../../db/connection.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { registrarHistorico } from "../../utils/historico.js";

const JWT_SECRET = process.env.JWT_SECRET || "segredo_dev";

// =========================
// CRIAR USUÁRIO
// =========================
export async function criar({ nome, senha }) {
  const id = uuidv4();

  const senha_hash = await bcrypt.hash(senha, 10);

  await pool.query(
    `INSERT INTO usuarios (id, nome, senha_hash)
     VALUES ($1, $2, $3)`,
    [id, nome, senha_hash]
  );

  // 🔥 histórico
  await registrarHistorico({
    sistema_id: null,
    entidade: "usuario",
    entidade_id: id,
    usuario_id: id,
    mudancas: {
      depois: { id, nome }
    }
  });

  return { id, nome };
}

// =========================
// LOGIN
// =========================
export async function login({ nome, senha }) {
  const result = await pool.query(
    "SELECT * FROM usuarios WHERE nome = $1",
    [nome]
  );

  const usuario = result.rows[0];

  if (!usuario) throw new Error("Usuário não encontrado");

  const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
  if (!senhaValida) throw new Error("Senha inválida");

  const token = jwt.sign(
    { id: usuario.id, nome: usuario.nome },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  // 🔥 salvar sessão
  await pool.query(
    `INSERT INTO sessoes (id, usuario_id, token)
     VALUES ($1, $2, $3)`,
    [uuidv4(), usuario.id, token]
  );

  // 🔥 histórico (opcional)
  await registrarHistorico({
    sistema_id: null,
    entidade: "usuario_login",
    entidade_id: usuario.id,
    usuario_id: usuario.id,
    mudancas: {
      depois: { acao: "login" }
    }
  });

  return {
    token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome
    }
  };
}

// =========================
// LISTAR
// =========================
export async function listar() {
  const result = await pool.query("SELECT id, nome FROM usuarios");
  return result.rows;
}

// =========================
// BUSCAR POR ID
// =========================
export async function buscarPorId(id) {
  const result = await pool.query(
    "SELECT id, nome FROM usuarios WHERE id = $1",
    [id]
  );

  return result.rows[0];
}

// =========================
// ALTERAR SENHA
// =========================
export async function alterarSenha(id, senhaNova) {
  const senha_hash = await bcrypt.hash(senhaNova, 10);

  await pool.query(
    `UPDATE usuarios SET senha_hash = $1 WHERE id = $2`,
    [senha_hash, id]
  );

  // 🔥 histórico
  await registrarHistorico({
    sistema_id: null,
    entidade: "usuario",
    entidade_id: id,
    usuario_id: id,
    mudancas: {
      depois: { acao: "alteracao_senha" }
    }
  });

  return { sucesso: true };
}

// =========================
// LOGOUT
// =========================
export async function logout(token) {
  // desativa sessão
  await pool.query(
    `UPDATE sessoes SET ativo = FALSE WHERE token = $1`,
    [token]
  );

  // adiciona na blacklist
  await pool.query(
    `INSERT INTO tokens_revogados (token)
     VALUES ($1)
     ON CONFLICT DO NOTHING`,
    [token]
  );

  // 🔥 histórico (opcional)
  await registrarHistorico({
    sistema_id: null,
    entidade: "usuario_logout",
    entidade_id: token,
    usuario_id: null,
    mudancas: {
      depois: { acao: "logout" }
    }
  });

  return { sucesso: true };
}