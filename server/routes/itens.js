import express from "express";
import { db } from "../db.js";
import { validarCadastroItem } from "../validacao.js";

const router = express.Router();
// Consultar item por ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        mensagem: "Informe um ID válido.",
      });
    }

    const [itens] = await db.query(
      `SELECT
        i.id_item,
        i.id_categoria,
        c.nome AS categoria,
        i.nome,
        i.descricao,
        i.unidade_medida
       FROM ITEM i
       INNER JOIN CATEGORIA c
         ON i.id_categoria = c.id_categoria
       WHERE i.id_item = ?`,
      [id],
    );

    if (itens.length === 0) {
      return res.status(404).json({
        mensagem: "Item não encontrado.",
      });
    }

    return res.status(200).json(itens[0]);
  } catch (erro) {
    console.error("Erro ao consultar item:", erro.message);

    return res.status(500).json({
      mensagem: "Não foi possível consultar o item.",
    });
  }
});
// Listar itens
router.get("/", async (req, res) => {
  try {
    const [itens] = await db.query(
      `SELECT
        i.id_item,
        i.id_categoria,
        c.nome AS categoria,
        i.nome,
        i.descricao,
        i.unidade_medida
       FROM ITEM i
       INNER JOIN CATEGORIA c
         ON i.id_categoria = c.id_categoria
       ORDER BY i.nome ASC`,
    );

    return res.status(200).json(itens);
  } catch (erro) {
    console.error("Erro ao listar itens:", erro.message);

    return res.status(500).json({
      mensagem: "Não foi possível consultar os itens.",
    });
  }
});
// Cadastrar item
router.post("/", async (req, res) => {
  try {
    const validacao = validarCadastroItem(req.body);

    if (!validacao.valido) {
      return res.status(400).json({
        mensagem: validacao.mensagem,
      });
    }

    const { id_categoria, nome, descricao, unidade_medida } = req.body;

    const [categorias] = await db.query(
      `SELECT id_categoria
       FROM CATEGORIA
       WHERE id_categoria = ?`,
      [id_categoria],
    );

    if (categorias.length === 0) {
      return res.status(404).json({
        mensagem: "Categoria não encontrada.",
      });
    }

    const [resultado] = await db.query(
      `INSERT INTO ITEM (
        id_categoria,
        nome,
        descricao,
        unidade_medida
      ) VALUES (?, ?, ?, ?)`,
      [id_categoria, nome.trim(), descricao?.trim() || null, unidade_medida.trim()],
    );

    return res.status(201).json({
      mensagem: "Item cadastrado com sucesso.",
      id_item: resultado.insertId,
    });
  } catch (erro) {
    console.error("Erro ao cadastrar item:", erro.message);

    return res.status(500).json({
      mensagem: "Não foi possível cadastrar o item.",
    });
  }
});

// Atualizar item
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        mensagem: "Informe um ID válido.",
      });
    }

    const validacao = validarCadastroItem(req.body);

    if (!validacao.valido) {
      return res.status(400).json({
        mensagem: validacao.mensagem,
      });
    }

    const { id_categoria, nome, descricao, unidade_medida } = req.body;

    const [itens] = await db.query(
      `SELECT id_item
       FROM ITEM
       WHERE id_item = ?`,
      [id],
    );

    if (itens.length === 0) {
      return res.status(404).json({
        mensagem: "Item não encontrado.",
      });
    }

    const [categorias] = await db.query(
      `SELECT id_categoria
       FROM CATEGORIA
       WHERE id_categoria = ?`,
      [id_categoria],
    );

    if (categorias.length === 0) {
      return res.status(404).json({
        mensagem: "Categoria não encontrada.",
      });
    }

    await db.query(
      `UPDATE ITEM
       SET id_categoria = ?,
           nome = ?,
           descricao = ?,
           unidade_medida = ?
       WHERE id_item = ?`,
      [id_categoria, nome.trim(), descricao?.trim() || null, unidade_medida.trim(), id],
    );

    return res.status(200).json({
      mensagem: "Item atualizado com sucesso.",
    });
  } catch (erro) {
    console.error("Erro ao atualizar item:", erro.message);

    return res.status(500).json({
      mensagem: "Não foi possível atualizar o item.",
    });
  }
});
export default router;
