# ONG SSVP

Aplicação web desenvolvida para a ONG SSVP, utilizando Vite+ no frontend e Node.js com Express no backend.

## Pré-requisitos

- Node.js instalado
- pnpm instalado
- Git instalado

## Instalação

1. Clone o repositório:

```bash
git clone https://github.com/PedroRocha0501/ong-ssvp.git
```

2. Acesse a pasta:

```bash
cd ong-ssvp
```

3. Instale as dependências:

```bash
pnpm install
```

4. Crie o arquivo `.env` na raiz do projeto, utilizando o `.env.example` como referência. Configure a porta:

```env
PORT=3001
```

## Como executar

Abra dois terminais na pasta do projeto.

**Terminal 1 — Backend (API):**

```bash
pnpm run api
```

**Terminal 2 — Frontend:**

```bash
pnpm run dev
```

Acesse o endereço apresentado pelo Vite+ no navegador, normalmente:

http://localhost:5173

## Teste da API

Acesse:

http://localhost:3001/api/health

A resposta esperada é semelhante a:

```json
{
  "status": "ok",
  "app": "ONG SSVP",
  "hora": "2026-11-17T00:02:21.298Z"
}
```

## Tecnologias utilizadas

- Vite+
- HTML
- CSS
- JavaScript
- Node.js
- Express
- dotenv
- Git e GitHub
