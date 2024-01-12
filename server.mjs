import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { Kysely, PostgresDialect, sql } from "kysely";
import pg from "pg";
const { Pool } = pg;

const app = new Hono();

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: "postgres://postgres:postgres@localhost:5432/postgres",
    max: 2,
  }),
});

const db = new Kysely({ dialect });

app.get("/:id", async ({ req, text }) => {
  const v = req.param("id");

  await db.executeQuery({
    query: {
      kind: "RawNode",
      sqlFragments: [`SET app.user_id = ${v}`],
      parameters: [],
    },
    sql: `SET app.user_id = ${v}`,
    parameters: [],
  });

  const res = await sql`SELECT current_setting('app.user_id') as uid`.execute(
    db
  );

  return text(`set: ${v}, got: ${res.rows[0].uid}`);
});

serve(app);
