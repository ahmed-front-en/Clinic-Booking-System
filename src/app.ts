import express from "express";
import cors from "cors";
import { errorMiddleware } from "./shared/middlewares/error.middleware.js";
import routes from "./routes/index.js";

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use("/api/v1", routes);
app.use(errorMiddleware);

export default app;