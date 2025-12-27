import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { randomUUID } from "node:crypto";

export async function transactionsRoutes(app: FastifyInstance) {
  // Lista todas as transações
  app.get("/", async () => {
    const transactions = await knex("transactions").select();

    return { transactions };
  });

  // Retorna uma transação específica
  app.get("/:id", async (request) => {
    const getTransactionParamsSchema = z.object({
      id: z.uuid(),
    });

    const { id } = getTransactionParamsSchema.parse(request.params);

    const transaction = await knex("transactions").where({ id }).first();

    return { transaction };
  });

  // Retorna a soma do valor total de transações
  app.get("/summary", async () => {
    const [summary] = await knex("transactions").sum("amount", {
      as: "amount",
    });

    return { summary };
  });

  // Cria uma transação
  app.post("/", async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(["credit", "debit"]),
    });

    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body
    );

    await knex("transactions").insert({
      id: randomUUID(),
      title,
      amount: type === "credit" ? amount : amount * -1,
    });

    reply.status(201).send();
  });
}
