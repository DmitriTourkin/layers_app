import express from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import { authRouter } from "./auth/auth.routes";
import { projectRouter } from "./projects/project.routes";
import { Request, Response, NextFunction } from "express";

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";
import { shapeRouter } from "./shapes/shape.routes";
import { setupWebSocket } from "./ws";

dotenv.config();

const app = express();
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/auth", authRouter);
app.use("/projects", projectRouter);
app.use(shapeRouter)

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  res.status(400).json({ error: "INVALID_REQUEST"});
})

const server = createServer(app);
setupWebSocket(server);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`server on :${PORT}`));
