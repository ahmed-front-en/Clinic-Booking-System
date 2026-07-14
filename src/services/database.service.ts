import pg from "pg";


export const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL pool error:", err);
});

export async function connectDatabase(): Promise<void> {
  try {
    const client = await pool.connect();

    try {
      const result = await client.query<{
        current_time: Date;
      }>("SELECT NOW() AS current_time");

      console.log("✓ Database connected");
      console.log("Database Time :", result.rows[0].current_time);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }
}