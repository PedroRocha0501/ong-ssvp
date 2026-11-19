import express from "express";
import { db } from "../db.js";
import { validarCadastroCategoria } from "../validacao.js";

const router = express.Router();

// Consultar categoria por ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        mensagem: "Informe um ID válido.",
      });
    }

    const [categorias] = await db.query(
      `SELECT
        id_categoria,
        nome,
        descricao
       FROM CATEGORIA
       WHERE id_categoria = ?`,
      [id],
    );

    if (categorias.length === 0) {
      return res.status(404).json({
        mensagem: "Categoria não encontrada.",
      });
    }

    return res.status(200).json(categorias[0]);
  } catch (erro) {
    console.error("Erro ao consultar categoria:", erro.message);

    return res.status(500).json({
      mensagem: "Não foi possível consultar a categoria.",
    });
  }
});

// Listar categorias
router.get("/", async (req, res) => {
  try {
    const [categorias] = await db.query(
      `SELECT
        id_categoria,
        nome,
        descricao
       FROM CATEGORIA
       ORDER BY nome ASC`,
    );

    return res.status(200).json(categorias);
  } catch (erro) {
    console.error("Erro ao listar categorias:", erro.message);

    return res.status(500).json({
      mensagem: "Não foi possível consultar as categorias.",
    });
  }
});
// Cadastrar categoria
router.post("/", async (req, res) => {
  try {
    const validacao = validarCadastroCategoria(req.body);

    if (!validacao.valido) {
      return res.status(400).json({
        mensagem: validacao.mensagem,
      });
    }

    const { nome, descricao } = req.body;

    const [resultado] = await db.query(
      `INSERT INTO CATEGORIA (nome, descricao)
       VALUES (?, ?)`,
      [nome.trim(), descricao?.trim() || null],
    );

    return res.status(201).json({
      mensagem: "Categoria cadastrada com sucesso.",
      id_categoria: resultado.insertId,
    });
  } catch (erro) {
    console.error("Erro ao cadastrar categoria:", erro.message);

    if (erro.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        mensagem: "Já existe uma categoria com esse nome.",
      });
    }

    return res.status(500).json({
      mensagem: "Não foi possível cadastrar a categoria.",
    });
  }
}); // Atualizar categoria
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        mensagem: "Informe um ID válido.",
      });
    }

    const validacao = validarCadastroCategoria(req.body);

    if (!validacao.valido) {
      return res.status(400).json({
        mensagem: validacao.mensagem,
      });
    }

    const { nome, descricao } = req.body;

    const [categorias] = await db.query(
      `SELECT id_categoria
       FROM CATEGORIA
       WHERE id_categoria = ?`,
      [id],
    );

    if (categorias.length === 0) {
      return res.status(404).json({
        mensagem: "Categoria não encontrada.",
      });
    }

    await db.query(
      `UPDATE CATEGORIA
       SET nome = ?, descricao = ?
       WHERE id_categoria = ?`,
      [nome.trim(), descricao?.trim() || null, id],
    );

    return res.status(200).json({
      mensagem: "Categoria atualizada com sucesso.",
    });
  } catch (erro) {
    console.error("Erro ao atualizar categoria:", erro.message);

    if (erro.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        mensagem: "Já existe uma categoria com esse nome.",
      });
    }

    return res.status(500).json({
      mensagem: "Não foi possível atualizar a categoria.",
    });
  }
});
export default router;
