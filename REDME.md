# ONG SSVP

Aplicação web desenvolvida para a ONG SSVP, composta por frontend em Vite+ e backend API em Node.js com Express.

## Pré-requisitos

- Node.js instalado
- Gerenciador de pacotes `pnpm`

## Instalação

1. Clone o repositório e acesse a pasta do projeto:

   ```bash
   git clone https://github.com
   cd ong-ssvp
   ```

2. Instale as dependências:

   ```bash
   pnpm install
   ```

3. Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:
   ```env
   PORT=3001
   ```

## Como executar

Abra dois terminais na pasta raiz do projeto:

1. **Inicie a API (backend):**

   ```bash
   pnpm api
   ```

2. **Inicie o servidor frontend:**
   ```bash
   pnpm dev
   ```

Acesse `http://localhost:5173` no navegador para visualizar a aplicação e o status da API.
