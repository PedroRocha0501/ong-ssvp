import express from "express";
import { db } from "../db.js";
import { validarCadastroFamilia } from "../validacao.js";

const router = express.Router();

// Consultar família por ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        mensagem: "Informe um ID válido.",
      });
    }

    const [familias] = await db.query(
      `SELECT
        id_familia,
        nome_responsavel,
        telefone,
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        quantidade_pessoas,
        data_cadastro,
        situacao
       FROM FAMILIA
       WHERE id_familia = ?`,
      [id],
    );

    if (familias.length === 0) {
      return res.status(404).json({
        mensagem: "Família não encontrada.",
      });
    }

    return res.status(200).json(familias[0]);
  } catch (erro) {
    console.error("Erro ao consultar família:", erro.message);

    return res.status(500).json({
      mensagem: "Não foi possível consultar a família.",
    });
  }
});

// Listar famílias assistidas
router.get("/", async (req, res) => {
  try {
    const [familias] = await db.query(
      `SELECT
        id_familia,
        nome_responsavel,
        telefone,
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        quantidade_pessoas,
        data_cadastro,
        situacao
       FROM FAMILIA
       ORDER BY nome_responsavel ASC`,
    );

    return res.status(200).json(familias);
  } catch (erro) {
    console.error("Erro ao listar famílias:", erro.message);

    return res.status(500).json({
      mensagem: "Não foi possível consultar as famílias.",
    });
  }
});

// Cadastrar família assistida
router.post("/", async (req, res) => {
  try {
    const validacao = validarCadastroFamilia(req.body);

    if (!validacao.valido) {
      return res.status(400).json({
        mensagem: validacao.mensagem,
      });
    }

    const {
      nome_responsavel,
      telefone,
      cep,
      logradouro,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      quantidade_pessoas,
    } = req.body;

    const [resultado] = await db.query(
      `INSERT INTO FAMILIA (
        nome_responsavel,
        telefone,
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        quantidade_pessoas
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nome_responsavel.trim(),
        telefone?.trim() || null,
        cep?.trim() || null,
        logradouro.trim(),
        numero.trim(),
        complemento?.trim() || null,
        bairro.trim(),
        cidade.trim(),
        estado.trim().toUpperCase(),
        quantidade_pessoas,
      ],
    );

    return res.status(201).json({
      mensagem: "Família cadastrada com sucesso.",
      id_familia: resultado.insertId,
    });
  } catch (erro) {
    console.error("Erro ao cadastrar família:", erro.message);

    return res.status(500).json({
      mensagem: "Não foi possível cadastrar a família.",
    });
  }
});

// Desativar família assistida
router.patch("/:id/desativar", async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        mensagem: "Informe um ID válido.",
      });
    }

    const [resultado] = await db.query(
      `UPDATE FAMILIA
       SET situacao = 'INATIVA'
       WHERE id_familia = ?
       AND situacao = 'ATIVA'`,
      [id],
    );

    if (resultado.affectedRows === 0) {
      const [familias] = await db.query(
        `SELECT id_familia
         FROM FAMILIA
         WHERE id_familia = ?`,
        [id],
      );

      if (familias.length === 0) {
        return res.status(404).json({
          mensagem: "Família não encontrada.",
        });
      }

      return res.status(409).json({
        mensagem: "Esta família já está inativa.",
      });
    }

    return res.status(200).json({
      mensagem: "Família desativada com sucesso.",
    });
  } catch (erro) {
    console.error("Erro ao desativar família:", erro.message);

    return res.status(500).json({
      mensagem: "Não foi possível desativar a família.",
    });
  }
});

// Atualizar família assistida
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        mensagem: "Informe um ID válido.",
      });
    }

    const validacao = validarCadastroFamilia(req.body);

    if (!validacao.valido) {
      return res.status(400).json({
        mensagem: validacao.mensagem,
      });
    }

    const {
      nome_responsavel,
      telefone,
      cep,
      logradouro,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      quantidade_pessoas,
    } = req.body;

    const [familias] = await db.query(
      `SELECT id_familia
       FROM FAMILIA
       WHERE id_familia = ?`,
      [id],
    );

    if (familias.length === 0) {
      return res.status(404).json({
        mensagem: "Família não encontrada.",
      });
    }

    await db.query(
      `UPDATE FAMILIA
       SET nome_responsavel = ?,
           telefone = ?,
           cep = ?,
           logradouro = ?,
           numero = ?,
           complemento = ?,
           bairro = ?,
           cidade = ?,
           estado = ?,
           quantidade_pessoas = ?
       WHERE id_familia = ?`,
      [
        nome_responsavel.trim(),
        telefone?.trim() || null,
        cep?.trim() || null,
        logradouro.trim(),
        numero.trim(),
        complemento?.trim() || null,
        bairro.trim(),
        cidade.trim(),
        estado.trim().toUpperCase(),
        quantidade_pessoas,
        id,
      ],
    );

    return res.status(200).json({
      mensagem: "Família atualizada com sucesso.",
    });
  } catch (erro) {
    console.error("Erro ao atualizar família:", erro.message);

    return res.status(500).json({
      mensagem: "Não foi possível atualizar a família.",
    });
  }
});
export default router;
