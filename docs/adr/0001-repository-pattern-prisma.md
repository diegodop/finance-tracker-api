# ADR 0001: Repository Pattern com Prisma/PostgreSQL

## Status

Aceita

## Contexto

A API precisa persistir e consultar transações financeiras (receitas e despesas) e calcular
agregações sobre elas (`GET /transactions/summary`). É preciso decidir como a camada de domínio
acessa o banco de dados, de forma que:

- a lógica de cálculo do summary possa ser testada por unidade, sem depender de um banco real;
- a troca de ORM/banco no futuro não exija reescrever a lógica de negócio;
- o esforço de implementação caiba no prazo de 2 dias do projeto (Nível B).

## Decisão

Usar **PostgreSQL** como banco relacional e **Prisma** como ORM, acessado através de uma camada de
**Repository Pattern**: uma interface `TransactionRepository` (`src/repositories/transaction-repository.ts`)
define o contrato (`create`, `findMany`, `delete`), e `PrismaTransactionRepository`
(`src/repositories/prisma-transaction-repository.ts`) implementa esse contrato usando o Prisma Client.

A lógica de domínio (`calculateSummary`, em `src/domain/summary.ts`) é uma função pura que recebe uma
lista de `Transaction` já carregada e não depende do Prisma nem de nenhuma infraestrutura — o que
permite testá-la isoladamente com Vitest, sem subir banco.

## Alternativas descartadas

1. **Acesso direto ao Prisma Client dentro dos handlers HTTP** (sem camada de repositório).
   Descartada porque acoplaria a lógica de negócio diretamente ao Prisma, dificultando testes
   unitários do cálculo de summary e qualquer troca futura de ORM/banco.
2. **SQLite como banco local**, para simplificar o setup.
   Descartada porque PostgreSQL já é citado como ferramenta sugerida pela rubrica do projeto, é o
   banco mais próximo de um cenário de produção real, e o Docker Compose remove a fricção de setup
   (sobe com um comando).

## Consequências

- Positivo: lógica de domínio testável sem banco; troca de implementação do repositório (ex.: para
  testes com um repositório em memória) é trivial.
- Positivo: camada de persistência isolada, aderente a SOLID (Dependency Inversion: o domínio depende
  da interface, não da implementação concreta).
- Negativo: uma camada extra de indireção (interface + implementação) para um projeto deste tamanho,
  que um CRUD simples não exigiria — aceito como custo do pattern exigido pela rubrica (M1).
