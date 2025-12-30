import fastify from "fastify";
import cookie from "@fastify/cookie";

import { env } from "./env";
import { transactionsRoutes } from "./routes/transactions";

// Cria o servidor Fastify
const app = fastify();

app.register(cookie);

// Rotas transactions
app.register(transactionsRoutes, {
  prefix: "transactions",
});

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log("HTTP server is Running!!");
  });
