import app from "./app.js";
import { connectDatabase, pool } from "./services/database.service.js";
import { runMigrations } from "./services/migration.service.js";

const PORT = Number(process.env.PORT) || 3000;

async function main() {
  await connectDatabase();
  await runMigrations(pool);

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

main();
