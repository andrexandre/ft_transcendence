"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = require("fastify");
const websocket_1 = require("@fastify/websocket");
const static_1 = require("@fastify/static");
const path = require("path");
const fastify = (0, fastify_1.default)({ logger: true });
// ✅ Register WebSocket Plugin
fastify.register(websocket_1.default);
// ✅ Register Static File Serving
fastify.register(static_1.default, {
    root: path.join(__dirname, "public"),
    prefix: "/",
});
// ✅ WebSocket Route (MUST be registered before starting server)
fastify.get("/ws", { websocket: true }, (connection, req) => {
    console.log("Player connected");
    connection.socket.on("message", (message) => {
        console.log("Received:", message);
        connection.socket.send("Pong: " + message);
    });
    connection.socket.on("close", () => {
        console.log("Player disconnected");
    });
});
// ✅ Serve index.html
fastify.get("/", (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    return reply.sendFile("index.html");
}));
// ✅ Start Server (Only start once!)
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield fastify.listen({ port: 3000, host: "0.0.0.0" });
        console.log("Server running at http://localhost:3000");
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
});
start();
