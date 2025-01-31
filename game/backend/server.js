const WebSocket = require("ws");
const express = require("express");

const PORT = 8080;
const app = express();
const server = app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
    console.log("🔌 New WebSocket connection");

    ws.on("message", (message) => {
        console.log("📩 Received:", message);
        ws.send(`Echo: ${message}`); // Echo back for testing
    });

    ws.on("close", () => console.log("🔴 WebSocket connection closed"));
});
