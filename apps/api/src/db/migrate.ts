import { readdir } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";
import { env } from "../env";

const sql = postgres(env.databaseUrl, { max: 1 });

await sql`CREATE TABLE IF NOT EXISTS schema_migrations (
	id text PRIMARY KEY,
	applied_at timestamptz NOT NULL DEFAULT now()
)`;

const dir = path.join(import.meta.dir, "../../drizzle");
const files = (await readdir(dir)).filter((name) => name.endsWith(".sql")).sort();

for (const file of files) {
  const already = await sql<{ id: string }[]>`
		SELECT id FROM schema_migrations WHERE id = ${file}
	`;
  if (already.length > 0) continue;
  const contents = await Bun.file(path.join(dir, file)).text();
  await sql.unsafe(contents);
  await sql`INSERT INTO schema_migrations (id) VALUES (${file})`;
  console.log(`applied ${file}`);
}

await sql.end();
console.log("migrations complete");
