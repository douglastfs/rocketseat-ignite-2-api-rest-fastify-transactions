import fastify from "fastify";
import cookie from "@fastify/cookie";

import { transactionsRoutes } from "./routes/transactions";

// Cria o servidor Fastify
export const app = fastify();

app.register(cookie);

// Rotas transactions
app.register(transactionsRoutes, {
  prefix: "transactions",
});
