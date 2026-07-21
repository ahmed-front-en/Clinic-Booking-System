import bcrypt from "bcrypt";
import { pool } from "./src/services/database.service.js";

const hash = await bcrypt.hash("AdminPass123!", 12);

await pool.query(
  `INSERT INTO users (email, password_hash, role, is_verified) VALUES ($1, $2, 'admin', true) ON CONFLICT (email) DO UPDATE SET password_hash = $2`,
  ["admin@clinic.com", hash]
);

const r = await pool.query("SELECT id, email, role FROM users WHERE email = $1", ["admin@clinic.com"]);
console.log("User:", r.rows[0]);

await pool.end();
