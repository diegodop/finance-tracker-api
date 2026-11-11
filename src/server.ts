import { createApp } from "./app.js";
import { env } from "./env.js";
import { prisma } from "./lib/prisma-client.js";
import { logger } from "./observability/logger.js";

const app = createApp(prisma);

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, "server_started");
});

async function shutdown(): Promise<void> {
  logger.info("shutting_down");
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
