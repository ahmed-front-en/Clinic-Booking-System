import { env } from "./env.js";

export const server = {
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
} as const;
