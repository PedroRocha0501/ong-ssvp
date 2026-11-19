import express from "express";
import { db } from "../db.js";
import { validarCadastroDoacao } from "../validacao.js";

const router = express.Router();

// Listar todas as doações
router.get("/", async (req, res) => {
  try {
    const [doacoes] = await db.query(
      `SELECT
        d.id_doacao,
        d.id_voluntario,
        v.nome AS nome_voluntario,
        d.data_recebimento,
        d.observacao
       FROM DOACAO d
       INNER JOIN VOLUNTARIO v
         ON d.id_voluntario = v.id_voluntario
       ORDER BY d.data_recebimento DESC`,
    );

    return res.status(200).json(doacoes);
  } catch (erro) {
    console.error("Erro ao listar doações:", erro);
    return res.status(500).json({
      mensagem: "Erro interno ao listar doações.",
    });
  }
});

// Consultar uma doação pelo ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        mensagem: "ID da doação inválido.",
      });
    }

    const [doacoes] = await db.query(
      `SELECT
        d.id_doacao,
        d.id_voluntario,
        v.nome AS nome_voluntario,
        d.data_recebimento,
        d.observacao
       FROM DOACAO d
       INNER JOIN VOLUNTARIO v
         ON d.id_voluntario = v.id_voluntario
       WHERE d.id_doacao = ?`,
      [id],
    );

    if (doacoes.length === 0) {
      return res.status(404).json({
        mensagem: "Doação não encontrada.",
      });
    }

    return res.status(200).json(doacoes[0]);
  } catch (erro) {
    console.error("Erro ao consultar doação:", erro);
    return res.status(500).json({
      mensagem: "Erro interno ao consultar doação.",
    });
  }
});

// Cadastrar uma doação
router.post("/", async (req, res) => {
  try {
    const validacao = validarCadastroDoacao(req.body);

    if (!validacao.valido) {
      return res.status(400).json({
        mensagem: validacao.mensagem,
      });
    }

    const { id_voluntario, observacao } = req.body;

    const [voluntarios] = await db.query(
      `SELECT id_voluntario, situacao
       FROM VOLUNTARIO
       WHERE id_voluntario = ?`,
      [id_voluntario],
    );

    if (voluntarios.length === 0) {
      return res.status(404).json({
        mensagem: "Voluntário não encontrado.",
      });
    }

    if (voluntarios[0].situacao !== "ATIVO") {
      return res.status(409).json({
        mensagem: "Não é possível registrar doação com voluntário inativo.",
      });
    }

    const [resultado] = await db.query(
      `INSERT INTO DOACAO
        (id_voluntario, observacao)
       VALUES (?, ?)`,
      [id_voluntario, observacao || null],
    );

    return res.status(201).json({
      mensagem: "Doação registrada com sucesso.",
      id_doacao: resultado.insertId,
    });
  } catch (erro) {
    console.error("Erro ao cadastrar doação:", erro);
    return res.status(500).json({
      mensagem: "Erro interno ao cadastrar doação.",
    });
  }
});

export default router;
