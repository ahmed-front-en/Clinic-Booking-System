import express from "express";
import { errorMiddleware } from "./shared/middlewares/error.middleware.js";

const app = express();

app.use(express.json());

app.use(errorMiddleware);

export default app;
