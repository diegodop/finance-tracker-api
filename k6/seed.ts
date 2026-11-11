import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CATEGORIES = ["salario", "freela", "mercado", "transporte", "lazer", "casa", "saude"];
const SEED_COUNT = 1000;

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

async function main(): Promise<void> {
  console.log(`Removendo transacoes existentes...`);
  await prisma.transaction.deleteMany();

  console.log(`Inserindo ${SEED_COUNT} transacoes sinteticas...`);
  const data = Array.from({ length: SEED_COUNT }, (_, index) => {
    const isIncome = index % 4 === 0;
    const daysAgo = Math.floor(Math.random() * 180);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    return {
      description: isIncome ? "Receita sintetica" : "Despesa sintetica",
      amount: Math.round((Math.random() * (isIncome ? 3000 : 400) + 10) * 100) / 100,
      type: isIncome ? ("income" as const) : ("expense" as const),
      category: randomItem(CATEGORIES),
      date,
    };
  });

  await prisma.transaction.createMany({ data });
  console.log("Seed concluido.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
