# tea-cuidar

TCC — aplicativo de apoio a pais e responsáveis de crianças com deficiência (foco em autismo): fórum por diagnóstico, agenda de consultas e lembretes, registro de medicamentos, cofre de documentos da criança e assistente de IA.

## Estrutura

```
apps/
  api/   backend — NestJS + Drizzle ORM + MySQL
  web/   frontend — Next.js
docs/    contrato da API, roteiro de testes, coleção do Postman
```

Sem ferramenta de monorepo: cada app tem o próprio `package.json` e `node_modules`. Rode `npm install` **dentro** da pasta do app.

## Rodando a API

Requisitos: Node **22.12 ou maior** e MySQL/MariaDB (XAMPP serve).

```bash
cd apps/api
npm install
cp .env.example .env        # preencha DATABASE_URL, JWT_SECRET e GEMINI_API_KEY
# crie o banco vazio:  CREATE DATABASE tea_cuidar;
npx tsx src/db/migrate.ts   # aplica as migrations
npx tsx src/db/seed.ts      # popula os catálogos (parentesco, diagnósticos, ...)
npm run start:dev           # API em http://localhost:3001
```

O front roda em `http://localhost:3000`.

## Documentação

- [`docs/contrato-api.md`](docs/contrato-api.md) — todas as rotas, corpos e respostas (para o time do front)
- [`docs/roteiro-teste-manual.md`](docs/roteiro-teste-manual.md) — roteiro de testes
- [`docs/tea-cuidar.postman_collection.json`](docs/tea-cuidar.postman_collection.json) — coleção do Postman
