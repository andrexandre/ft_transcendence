// /frontend/src/game/client.ts
const SERVER_URL = "ws://localhost:5000/ws";

interface PlayerMessage {
	type: string;
	playerId?: string;
	username?: string;
	userId?: number;
	direction?: "up" | "down";
	state?: any;
}

export function startMultiplayerClient() {
	console.log("📡 Attempting WebSocket connection...");
	
	const username = sessionStorage.getItem("username") || "Guest";
	const userId = Number(sessionStorage.getItem("user_id")) || 0;
	console.log("👤 Player ID:", userId, username);
	
	const socket = new WebSocket(SERVER_URL);
	console.log("📡 Socket readyState after creation:", socket.readyState);

	socket.onopen = () => {
		console.log("✅ Connected to game server");
		const username = sessionStorage.getItem("username");
		const userId = sessionStorage.getItem("user_id");
		console.log("👤 Player ID:", userId, username);
	
		const joinPayload = {
			type: "join",
			username,
			userId,
		};
		socket.send(JSON.stringify(joinPayload));
	};

	socket.onmessage = (event) => {
		console.log("📩 Message from server:", event.data);
		const data: PlayerMessage = JSON.parse(event.data);
		if (data.type === "welcome") {
			console.log(`🎮 Welcome Player ID: ${data.playerId}`);
		} else if (data.type === "update") {
			console.log("🟢 Game state update:", data.state);
		}
	};

	socket.onerror = (event) => {
		console.warn("❌ WebSocket closed", event);
	};

	socket.onclose = () => {
		console.warn("❌ Connection closed. Reconnecting in 2s...");
		setTimeout(() => startMultiplayerClient(), 2000);
	};

	document.addEventListener("keydown", (e) => {
		const payload: PlayerMessage = {
			type: "move",
		};

		if (e.key === "ArrowUp" || e.key === "w") {
			payload.direction = "up";
			socket.send(JSON.stringify(payload));
		} else if (e.key === "ArrowDown" || e.key === "s") {
			payload.direction = "down";
			socket.send(JSON.stringify(payload));
		}
	});
}
