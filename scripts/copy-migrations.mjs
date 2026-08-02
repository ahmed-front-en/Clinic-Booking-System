import { cpSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = resolve(root, "src", "database", "migrations");
const dest = resolve(root, "dist", "database", "migrations");

cpSync(src, dest, { recursive: true });

console.log(`[build] Copied migrations from ${src} to ${dest}`);
