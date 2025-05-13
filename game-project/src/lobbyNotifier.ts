import type { WebSocket } from "ws";

const userLobbySockets = new Map<number, WebSocket>();

export function registerLobbySocket(userId: number, socket: WebSocket) {
    userLobbySockets.set(userId, socket);

    socket.on("close", () => {
        userLobbySockets.delete(userId);
        console.log(`❌ Lobby socket fechado: userId=${userId}`);
    });
}

export function notifyLobbyPlayersStart(playerIds: number[], gameId: string) {
    for (const userId of playerIds) {
        const socket = userLobbySockets.get(userId);
        if (socket && socket.readyState === socket.OPEN) {
            socket.send(JSON.stringify({ type: "start", gameId }));
            console.log(`📨 Notificação enviada ao jogador ${userId} (gameId=${gameId})`);
        } else {
            console.warn(`⚠️ Socket não encontrado ou fechado para userId=${userId}`);
        }
    }
}
