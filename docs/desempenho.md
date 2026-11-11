# Desempenho

## SLO declarado

**p95 < 200ms em `GET /transactions/summary`, com ~1.000 transações no banco, ambiente local
(Docker Compose).**

Métrica correspondente exposta em `/metrics` (Prometheus): histograma
`http_request_duration_seconds`, label `route="/summary"` (ver `src/observability/metrics.ts`).

## Setup da medição

1. `docker compose up -d --build` (API + Postgres).
2. `npm run seed` — popula o banco com 1.000 transações sintéticas (`k6/seed.ts`).
3. `k6 run k6/smoke-summary.js` — carga em 3 estágios contra `GET /transactions/summary`:
   - 10s subindo até 10 VUs
   - 20s sustentando 10 VUs
   - 5s descendo a 0

## Resultado medido (k6, 2026-11-11)

```
checks_succeeded...: 100.00% 820 out of 820
http_req_duration..: avg=185.02ms min=6.5ms med=216.64ms max=456.59ms p(90)=311.82ms p(95)=319.42ms
http_req_failed....: 0.00%
http_reqs..........: 410 (11.57 req/s)

THRESHOLDS
  checks: 'rate>0.99'            ✓ PASS (100%)
  http_req_duration: 'p(95)<200' ✗ FAIL (p95 medido = 319.42ms)
```

**SLO não atingido sob carga concorrente de 10 VUs.** Em requisição isolada (sem concorrência), a
mesma rota responde em 11–22ms (medido com `curl`) — o problema só aparece com múltiplas
requisições simultâneas.

## Gargalo identificado

Com `docker stats` durante o teste de carga, o container da API salta de ~0.5% para **300–600% de
CPU** (o container tem 10 CPUs disponíveis), enquanto o container do Postgres fica praticamente
ocioso (<4% CPU). O `EXPLAIN ANALYZE` da query equivalente no Postgres roda em menos de 1ms:

```sql
EXPLAIN ANALYZE SELECT * FROM transactions ORDER BY date DESC;
-- Execution Time: 0.252 ms
```

Ou seja: **o banco não é o gargalo.** O custo está no processo Node/Prisma, não na query em si:

- `GET /transactions/summary` busca todas as 1.000 linhas via `findMany` e só depois calcula o
  resumo em memória, em JavaScript (`calculateSummary`, em `src/domain/summary.ts`).
- Cada linha retornada pelo Prisma passa por conversão `Decimal.toNumber()`
  (`prisma-transaction-repository.ts`), e o payload completo (1.000 objetos) é serializado em JSON
  a cada requisição.
- Sob concorrência (10 VUs simultâneos), esse trabalho de desserialização/conversão/serialização
  compete pela mesma CPU do container e degrada não-linearmente — daí o salto de 11ms (1
  requisição) para 319ms de p95 (10 requisições simultâneas).

## O que eu faria diferente (fora do escopo obrigatório do Nível B, mas é o próximo passo natural)

1. **Mover a agregação para o banco**: trocar `findMany` + `calculateSummary` em JS por uma query
   SQL com `GROUP BY category, type` (via `$queryRaw` ou `groupBy` do Prisma). O Postgres já prova,
   pelo `EXPLAIN ANALYZE`, que consegue fazer esse trabalho em menos de 1ms — tirar a agregação do
   Node remove o gargalo de CPU identificado acima.
2. **Cache do endpoint de summary** (Redis, TTL curto), já que ele não muda a cada requisição e é o
   endpoint mais acessado em um dashboard financeiro típico.
3. Validar o mesmo teste fora do Docker Desktop (que roda em uma VM com overhead de virtualização no
   macOS) para confirmar se parte da degradação é específica do ambiente local.

## Como reproduzir

```bash
docker compose up -d --build
npm run seed
k6 run k6/smoke-summary.js
```
