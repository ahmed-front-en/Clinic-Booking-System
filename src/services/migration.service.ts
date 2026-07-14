import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATIONS_DIR = path.resolve(__dirname, "..", "database", "migrations");
const MIGRATION_FILE_PATTERN = /^\d+_.+\.sql$/;

async function ensureSchemaMigrationsTable(
  client: pg.PoolClient
): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      version VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

async function getExecutedMigrations(
  client: pg.PoolClient
): Promise<Set<string>> {
  const result = await client.query<{ version: string }>(
    "SELECT version FROM schema_migrations ORDER BY version"
  );
  return new Set(result.rows.map((row) => row.version));
}

export async function runMigrations(pool: pg.Pool): Promise<void> {
  try {
    await fs.access(MIGRATIONS_DIR);
  } catch {
    console.log("[Migration] No migrations directory found, skipping.");
    return;
  }

  const entries = await fs.readdir(MIGRATIONS_DIR);

  const files = entries
    .filter((f) => MIGRATION_FILE_PATTERN.test(f))
    .sort();

  if (files.length === 0) {
    console.log("[Migration] No migration files found, skipping.");
    return;
  }

  const client = await pool.connect();

  let appliedCount = 0;

  try {
    await ensureSchemaMigrationsTable(client);

    const executed = await getExecutedMigrations(client);

    for (const file of files) {
      if (executed.has(file)) {
        console.log(`[Migration] Skipped ${file}`);
        continue;
      }

      const content = await fs.readFile(
        path.join(MIGRATIONS_DIR, file),
        "utf-8"
      );

      if (content.trim().length === 0) {
        console.log(`[Migration] Warning: ${file} is empty, skipping.`);
        continue;
      }

      console.log(`[Migration] Running ${file}`);

      try {
        await client.query("BEGIN");
        await client.query(content);
        await client.query(
          "INSERT INTO schema_migrations (version) VALUES ($1)",
          [file]
        );
        await client.query("COMMIT");
        console.log(`[Migration] Completed ${file}`);
        appliedCount++;
      } catch (err) {
        await client.query("ROLLBACK");
        throw new Error(
          `Migration ${file} failed: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }
  } finally {
    client.release();
  }

  console.log(`Applied ${appliedCount} migration(s).`);
}
