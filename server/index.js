import "dotenv/config";
import express from "express";
import { db } from "./db.js";
import voluntariosRoutes from "./routes/voluntarios.js";
import familiasRoutes from "./routes/familias.js";
import categoriasRoutes from "./routes/categorias.js";
import itensRoutes from "./routes/itens.js";
import doacoesRoutes from "./routes/doacoes.js";

const app = express();
app.use(express.json());
app.use("/api/doacoes", doacoesRoutes);
// Rotas dos itens
app.use("/api/itens", itensRoutes);
// Rotas dos voluntários
app.use("/api/voluntarios", voluntariosRoutes);
// Rotas das famílias assistidas
app.use("/api/familias", familiasRoutes);
// Rotas das categorias
app.use("/api/categorias", categoriasRoutes);
// Teste de funcionamento da API
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "ONG SSVP",
    hora: new Date().toISOString(),
  });
});

// Teste de conexão com o MySQL
app.get("/api/db-test", async (req, res) => {
  try {
    const [resultado] = await db.query("SELECT VERSION() AS versao");

    res.json({
      status: "conectado",
      banco: "ong_ssvp",
      versao_mysql: resultado[0].versao,
    });
  } catch (erro) {
    console.error("Erro na conexão com MySQL:", erro.message);

    res.status(500).json({
      status: "erro",
      mensagem: "Não foi possível conectar ao banco de dados.",
    });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
