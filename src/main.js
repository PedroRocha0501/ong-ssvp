import "./style.css";

async function carregarStatus() {
  const app = document.querySelector("#app");

  try {
    const resposta = await fetch("/api/health");
    const dados = await resposta.json();

    app.innerHTML = `
      <main style="font-family: sans-serif; padding: 2rem;">
        <h1>ONG SSVP</h1>
        <p><strong>Status da API: ${dados.status}</strong></p>
        <p>Data e hora: ${dados.hora}</p>
      </main>
    `;
  } catch (erro) {
    console.error("Erro ao conectar com a API:", erro);
    app.innerHTML = `
      <main style="font-family: sans-serif; padding: 2rem;">
        <h1>ONG SSVP</h1>
        <p>Erro ao conectar com a API. Verifique se o servidor está rodando.</p>
      </main>
    `;
  }
}

void carregarStatus();
