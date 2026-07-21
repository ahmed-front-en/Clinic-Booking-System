import bcrypt from "bcrypt";
import pg from "pg";

const pool = new pg.Pool({
  host: "localhost",
  port: 5432,
  database: "clinic_booking",
  user: "postgres",
  password: "postgres",
});

const hash = await bcrypt.hash("AdminPass123!", 12);
await pool.query(
  "INSERT INTO users (email, password_hash, role, is_verified) VALUES ($1, $2, 'admin', true)",
  ["admin@clinic.com", hash]
);
const r = await pool.query("SELECT id, email, role FROM users WHERE email = $1", ["admin@clinic.com"]);
console.log("Admin user ID:", r.rows[0].id);
await pool.end();
