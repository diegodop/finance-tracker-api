# Finance Tracker API

**Nível B** — Projeto Final, Módulo 4, Full Cycle.

API de controle de gastos pessoais (receitas e despesas): registrar transações e consultar um
resumo financeiro (saldo total e totais por categoria). Trabalho individual.

O foco é um único domínio com um fluxo completo e bem testado, como pede o Nível B. Autenticação/
multiusuário real, orçamentos/metas, recorrência, múltiplas moedas e frontend não fazem parte
deste projeto — ficam fora do escopo por decisão explícita.

## Stack

Node.js 22 + TypeScript, Express, Prisma + PostgreSQL (Repository Pattern), Zod, pino (logs
estruturados), prom-client (métricas Prometheus), Vitest + Supertest (testes), k6 (smoke test de
desempenho).

## Como subir a aplicação

Requer Docker e Docker Compose.

```bash
docker compose up -d --build
```

Isso sobe a API (porta `3000`) e o Postgres (porta `5432`), roda as migrations automaticamente e
inicia o servidor.

```bash
curl http://localhost:3000/health
# {"status":"ok"}
```

## Como testar

Os testes de integração precisam de um Postgres acessível em `localhost:5432` (o do próprio
`docker compose up -d db` serve).

```bash
cp .env.example .env     # ajuste se necessário
npm install
npm run prisma:migrate:dev   # só na primeira vez, se o banco estiver vazio

npm run test              # testes unitários (dominio, sem banco)
npm run test:integration  # testes de integracao (fluxo completo via HTTP + Postgres)
npm run test:coverage -- tests  # ambos, com relatorio de coverage
npm run lint
```

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/transactions` | Cria uma transação (`description`, `amount`, `type`: `income`\|`expense`, `category`, `date`) |
| `GET` | `/transactions` | Lista transações (filtros opcionais: `type`, `category`, `from`, `to`) |
| `GET` | `/transactions/summary` | **Endpoint principal.** Saldo total, receitas, despesas e totais por categoria |
| `DELETE` | `/transactions/:id` | Remove uma transação |
| `GET` | `/health` | Liveness check |
| `GET` | `/metrics` | Métricas no formato Prometheus |

Especificação completa em [`docs/openapi.yaml`](docs/openapi.yaml).

## Smoke test de desempenho (k6)

```bash
docker compose up -d --build
npm run seed               # popula o banco com 1.000 transacoes sinteticas
k6 run k6/smoke-summary.js
```

SLO declarado, resultado medido e diagnóstico de gargalo em [`docs/desempenho.md`](docs/desempenho.md).

## Documentação

- [ADR 0001 — Repository Pattern + Prisma/PostgreSQL](docs/adr/0001-repository-pattern-prisma.md)
- [OpenAPI](docs/openapi.yaml)
- [Desempenho (SLO, k6, gargalo)](docs/desempenho.md)
- [Uso de IA](docs/ia.md)
- [Contribuidores](CONTRIBUTORS.md)
