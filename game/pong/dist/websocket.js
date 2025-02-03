"use strict";
const socket = new WebSocket("ws://localhost:8080");
socket.onopen = () => {
    console.log("✅ Connected to WebSocket");
    socket.send("Hello Server!");
};
socket.onmessage = (event) => {
    console.log("📩 Server response:", event.data);
};
socket.onerror = (error) => {
    console.error("❌ WebSocket error:", error);
};
socket.onclose = () => {
    console.log("🔴 WebSocket closed");
};
