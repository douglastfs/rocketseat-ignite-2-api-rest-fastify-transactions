import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { randomUUID } from "node:crypto";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";

// Cookies -> são formas de manter contexto entre requisições HTTP

export async function transactionsRoutes(app: FastifyInstance) {
  app.addHook("preHandler", async (request, reply) => {
    console.log(`[${request.method}] ${request.url}`);
  });

  // Lista todas as transações
  app.get(
    "/",
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const { sessionId } = request.cookies;
      const transactions = await knex("transactions")
        .where("session_id", sessionId)
        .select();

      return { transactions };
    }
  );

  // Retorna uma transação específica
  app.get(
    "/:id",
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const { sessionId } = request.cookies;

      const getTransactionParamsSchema = z.object({
        id: z.uuid(),
      });

      const { id } = getTransactionParamsSchema.parse(request.params);

      const transaction = await knex("transactions")
        .where("session_id", sessionId)
        .andWhere({ id })
        .first();

      return { transaction };
    }
  );

  // Retorna a soma do valor total de transações
  app.get(
    "/summary",
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const { sessionId } = request.cookies;

      const [summary] = await knex("transactions")
        .where("session_id", sessionId)
        .sum("amount", {
          as: "amount",
        });

      return { summary };
    }
  );

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

    let sessionId = request.cookies.sessionId;

    if (!sessionId) {
      sessionId = randomUUID();

      reply.cookie("sessionId", sessionId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    await knex("transactions").insert({
      id: randomUUID(),
      title,
      amount: type === "credit" ? amount : amount * -1,
      session_id: sessionId,
    });

    reply.status(201).send();
  });
}
