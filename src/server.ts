import fastify from "fastify";
import crypto from "node:crypto";
import { knex } from "./database";
import { env } from "./env";

// Cria o servidor Fastify
const app = fastify();

// GET, POST, PUT, PATCH, DELETE
app.get("/hello", async () => {
  const transactions = await knex("transactions").select("*");

  return transactions;
});

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log("HTTP server is Running!!");
  });
