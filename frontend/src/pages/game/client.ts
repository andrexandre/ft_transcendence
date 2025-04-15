// import { showToast } from "../../utils";
// import { initGameCanvas } from "./rendering";

// let socket: WebSocket | null = null;

// export function connectToServer() {
// 	socket = new WebSocket("ws://localhost:5000/ws");

// 	socket.onopen = () => {
// 		console.log("✅ WebSocket connected");
// 	};

// 	socket.onmessage = (event) => {
// 		const data = JSON.parse(event.data);
// 		console.log("📨 Message from server:", data);

// 		switch (data.type) {
// 			case "lobby-created":
// 				showToast.green(`✅ Lobby created: ${data.lobbyId}`);
// 				break;
// 			case "lobby-joined":
// 				showToast.green(`✅ Joined lobby!`);
// 				break;
// 			case "game-start":
// 				showToast.green(`🎮 Game started! You are: ${data.player}`);
// 				document.getElementById('sidebar')?.classList.add('hidden');
// 				// initGameCanvas();
// 				break;
// 			case "error":
// 				showToast.red(`❌ ${data.message}`);
// 				break;
// 		}
// 	};

// 	socket.onerror = () => showToast.red("❌ WebSocket connection error");
// 	socket.onclose = () => showToast.red("🔌 Disconnected from game server");
// }

// connectToServer(); // Call it early when your app starts
