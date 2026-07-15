import app from "./app.js";
import { server } from "./config/index.js";
import { connectDatabase, pool } from "./services/database.service.js";
import { runMigrations } from "./services/migration.service.js";

async function main() {
  await connectDatabase();
  await runMigrations(pool);

  app.listen(server.port, () => {
    console.log(`Server listening on port ${server.port}`);
  });
}

main();
