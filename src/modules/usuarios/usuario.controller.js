import * as service from "./usuario.service.js";

export async function criar(req, res) {
  try {
    const usuario = await service.criar(req.body);
    res.status(201).json(usuario);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
}

export async function login(req, res) {
  try {
    const data = await service.login(req.body);
    res.json(data);
  } catch (err) {
    res.status(401).json({ erro: err.message });
  }
}

export async function listar(req, res) {
  try {
    res.json(await service.listar());
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

export async function buscarPorId(req, res) {
  try {
    res.json(await service.buscarPorId(req.params.id));
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

export async function alterarSenha(req, res) {
  try {
    const { senhaNova } = req.body;
    const id = req.params.id;

    res.json(await service.alterarSenha(id, senhaNova));
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

export async function logout(req, res) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    res.json(await service.logout(token));
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}