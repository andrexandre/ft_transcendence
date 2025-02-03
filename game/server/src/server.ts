import { WebSocketServer, WebSocket } from "ws";
import express from "express";

const app = express();
const PORT = 8080;
const server = app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));

const wss = new WebSocketServer({ server });

wss.on("connection", (ws: WebSocket) => {
    console.log("🔌 WebSocket connection established");

    ws.on("message", (message) => {
        console.log("📩 Received:", message.toString());
        ws.send(`Echo: ${message}`);
    });

    ws.on("close", () => console.log("🔴 WebSocket closed"));
});
