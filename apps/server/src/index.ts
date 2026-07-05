import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import dotenv from "dotenv";
import { authRouter } from "./auth/auth.routes";

dotenv.config();

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use('/auth', authRouter);

const server = createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  ws.on("message", (data) => {
    console.log("received:", data.toString());
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`server on :${PORT}`));
