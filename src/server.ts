import app from "./app.js";
import { env, server } from "./config/index.js";
import { connectDatabase, pool } from "./services/database.service.js";
import { runMigrations } from "./services/migration.service.js";
import { seedService } from "./seed/seed.service.js";

async function main() {
  await connectDatabase();
  await runMigrations(pool);

  if (env.NODE_ENV === "development") {
    await seedService.seedAdmin();
  }

  app.listen(server.port, () => {
    console.log(`Server listening on port ${server.port}`);
  });
}

main();
