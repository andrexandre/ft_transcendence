// // tsconfig.json
// {
//     "compilerOptions": {
//         "outDir": "./",
//         "rootDir": "./",
//         "allowJs": true,
//         "target": "es6",
//         "module": "commonjs",
//         "strict": true
//     },
//     "include": ["server.ts", "public/script.ts"], 
//     "exclude": ["node_modules"]
// }

// // package.json
// {
//     "name": "Pongify FTW",
//     "version": "1.0.0",
//     "description": "you got to get Ponging...",
//     "main": "server.js",
//     "scripts": {
//       "start": "tsc && node server.js",
//       "dev": "ts-node server.ts"
//     },
//     "dependencies": {
//       "@fastify/static": "^8.1.0",
//       "@fastify/websocket": "^11.0.2",
//       "fastify": "latest"
//     },
//     "devDependencies": {
//       "ts-node": "latest",
//       "typescript": "latest"
//     }
// }

// // server.ts
// import Fastify from "fastify";
// import fastifyWebsocket from "@fastify/websocket";
// import * as path from "path";
// import fastifyStatic from "@fastify/static";

// const fastify = Fastify({ logger: true });

// // Register WebSocket Plugin
// fastify.register(fastifyWebsocket);

// // Register Static Files
// fastify.register(fastifyStatic, {
//   root: path.join(__dirname, "public"),
//   prefix: "/",
// });

// // WebSocket Route
// fastify.get("/ws", { websocket: true }, (connection, req) => {
//   console.log("Player connected");

//   connection.socket.on("message", (message: string) => {
//     console.log("Received:", message);
//     connection.socket.send("Pong: " + message);
//   });

//   connection.socket.on("close", () => {
//     console.log("Player disconnected");
//   });
// });

// // Serve index.html
// fastify.get("/", async (request, reply) => {
//   return reply.sendFile("index.html");
// });

// // Start the server
// const start = async () => {
//   try {
//     await fastify.listen({ port: 3000, host: "0.0.0.0" });
//     console.log("Server running at http://localhost:3000");
//   } catch (err) {
//     fastify.log.error(err);
//     process.exit(1);
//   }
// };

// start();

// // public/index.html
// <!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>PONGIFY</title>
//     <link rel="stylesheet" href="style.css">
// </head>
// <body>
//     <div id="menu">
//         <h1 id="title">PONGIFY</h1>
//         <button id="single">Single Player</button>
//         <button id="multi">Multi</button>
//         <button id="coop">Co-Op</button>
//         <button id="settings">Settings</button>
//         <div id="ball"></div>
//     </div>
//     <canvas id="gameCanvas" class="hidden"></canvas>
//     <script src="script.js"></script>
// </body>
// </html>

// // public/script.ts
// const singleButton = document.getElementById("single") as HTMLButtonElement;
// const menu = document.getElementById("menu") as HTMLDivElement;
// const gameCanvas = document.getElementById("gameCanvas") as HTMLCanvasElement;

// const ws = new WebSocket("ws://localhost:3000/ws");
// ws.onopen = () => {
//     ws.send("Hello WebSocket!");
// };
// ws.onmessage = (event) => console.log("Received:", event.data);

// singleButton.addEventListener("click", () => {
//     menu.classList.add("hidden");
//     gameCanvas.classList.remove("hidden");
//     startSinglePlayerGame();
// });

// function startSinglePlayerGame() {
//     const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
//     const ctx = canvas.getContext("2d");

//     if (!ctx) {
//         console.error("Canvas context is null.");
//         return;
//     }

//     canvas.width = 800;
//     canvas.height = 400;

//     let playerY = canvas.height / 2 - 40;
//     let aiY = canvas.height / 2 - 40;
//     let ballX = canvas.width / 2;
//     let ballY = canvas.height / 2;
//     let ballSpeedX = 5;
//     let ballSpeedY = 3;

//     function draw() {
//         ctx.fillStyle = "black";
//         ctx.fillRect(0, 0, canvas.width, canvas.height);
        
//         ctx.fillStyle = "white";
//         ctx.fillRect(10, playerY, 10, 80);
//         ctx.fillRect(canvas.width - 20, aiY, 10, 80);
//         ctx.beginPath();
//         ctx.arc(ballX, ballY, 10, 0, Math.PI * 2);
//         ctx.fill();
//     }

//     function update() {
//         ballX += ballSpeedX;
//         ballY += ballSpeedY;

//         if (ballY <= 0 || ballY >= canvas.height) ballSpeedY *= -1;
//         if (ballX <= 20 && ballY > playerY && ballY < playerY + 80) ballSpeedX *= -1;
//         if (ballX >= canvas.width - 20 && ballY > aiY && ballY < aiY + 80) ballSpeedX *= -1;
//         if (ballX < 0 || ballX > canvas.width) resetGame();

//         aiY = ballY - 40;
//     }

//     function resetGame() {
//         ballX = canvas.width / 2;
//         ballY = canvas.height / 2;
//         ballSpeedX = 5;
//         ballSpeedY = 3;
//     }

//     function gameLoop() {
//         update();
//         draw();
//         requestAnimationFrame(gameLoop);
//     }

//     gameLoop();
// }
