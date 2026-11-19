import express from "express";
import bcrypt from "bcryptjs";
import { db } from "../db.js";
import { validarCadastroVoluntario } from "../validacao.js";

const router = express.Router();

// Listar voluntários

// Consultar voluntário por ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        mensagem: "Informe um ID válido.",
      });
    }

    const [voluntarios] = await db.query(
      `SELECT
        id_voluntario,
        nome,
        telefone,
        email,
        situacao
       FROM VOLUNTARIO
       WHERE id_voluntario = ?`,
      [id],
    );

    if (voluntarios.length === 0) {
      return res.status(404).json({
        mensagem: "Voluntário não encontrado.",
      });
    }

    return res.status(200).json(voluntarios[0]);
  } catch (erro) {
    console.error("Erro ao consultar voluntário:", erro.message);

    return res.status(500).json({
      mensagem: "Não foi possível consultar o voluntário.",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const [voluntarios] = await db.query(
      `SELECT
        id_voluntario,
        nome,
        telefone,
        email,
        situacao
       FROM VOLUNTARIO
       ORDER BY nome ASC`,
    );

    return res.status(200).json(voluntarios);
  } catch (erro) {
    console.error("Erro ao listar voluntários:", erro.message);

    return res.status(500).json({
      mensagem: "Não foi possível consultar os voluntários.",
    });
  }
});

// Atualizar voluntário
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({
        mensagem: "Informe os dados do voluntário em formato válido.",
      });
    }

    const { nome, telefone, email, situacao } = req.body;
    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        mensagem: "Informe um ID válido.",
      });
    }

    if (
      typeof nome !== "string" ||
      typeof telefone !== "string" ||
      typeof email !== "string" ||
      !["ATIVO", "INATIVO"].includes(situacao)
    ) {
      return res.status(400).json({
        mensagem: "Informe dados válidos para atualização.",
      });
    }

    if (nome.trim() === "" || telefone.trim() === "" || email.trim() === "") {
      return res.status(400).json({
        mensagem: "Nome, telefone e e-mail não podem ficar vazios.",
      });
    }

    const [resultado] = await db.query(
      `UPDATE VOLUNTARIO
       SET nome = ?, telefone = ?, email = ?, situacao = ?
       WHERE id_voluntario = ?`,
      [nome.trim(), telefone.trim(), email.trim().toLowerCase(), situacao, id],
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensagem: "Voluntário não encontrado.",
      });
    }

    return res.status(200).json({
      mensagem: "Voluntário atualizado com sucesso.",
    });
  } catch (erro) {
    console.error("Erro ao atualizar voluntário:", erro.message);

    if (erro.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        mensagem: "Este e-mail já está cadastrado para outro voluntário.",
      });
    }

    return res.status(500).json({
      mensagem: "Não foi possível atualizar o voluntário.",
    });
  }
});

// Desativar voluntário
router.patch("/:id/desativar", async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        mensagem: "Informe um ID válido.",
      });
    }
    const [resultado] = await db.query(
      `UPDATE VOLUNTARIO
       SET situacao = 'INATIVO'
       WHERE id_voluntario = ?`,
      [id],
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensagem: "Voluntário não encontrado ou já está inativo.",
      });
    }

    return res.status(200).json({
      mensagem: "Voluntário desativado com sucesso.",
    });
  } catch (erro) {
    console.error("Erro ao desativar voluntário:", erro.message);

    return res.status(500).json({
      mensagem: "Não foi possível desativar o voluntário.",
    });
  }
});

// Cadastro de voluntários
router.post("/", async (req, res) => {
  try {
    const validacao = validarCadastroVoluntario(req.body);

    if (!validacao.valido) {
      return res.status(400).json({
        mensagem: validacao.mensagem,
      });
    }

    const { nome, telefone, email, senha } = req.body;

    const senhaHash = await bcrypt.hash(senha, 12);

    const [resultado] = await db.query(
      `INSERT INTO VOLUNTARIO
       (nome, telefone, email, senha_hash)
       VALUES (?, ?, ?, ?)`,
      [nome.trim(), telefone.trim(), email.trim().toLowerCase(), senhaHash],
    );

    return res.status(201).json({
      mensagem: "Voluntário cadastrado com sucesso.",
      id_voluntario: resultado.insertId,
    });
  } catch (erro) {
    console.error("Erro ao cadastrar voluntário:", erro.message);

    if (erro.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        mensagem: "Este e-mail já está cadastrado.",
      });
    }

    return res.status(500).json({
      mensagem: "Não foi possível cadastrar o voluntário.",
    });
  }
});

export default router;
