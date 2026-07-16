import express from "express";
import { errorMiddleware } from "./shared/middlewares/error.middleware.js";
import routes from "./routes/index.js";

const app = express();

app.use(express.json());
app.use("/api/v1", routes);
app.use(errorMiddleware);

export default app;
