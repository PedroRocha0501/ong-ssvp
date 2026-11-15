import express from "express";

const app = express();
const PORT = process.env.PORT || 3001;

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toLocaleString("pt-BR"),
  });
});

app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});
