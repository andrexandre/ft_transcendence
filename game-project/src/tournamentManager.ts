// src/tournamentManager.ts
import { createLobby, startGame, joinLobby, removeLobbyByGameId } from './lobbyManager.js';
import { Logger } from './utils.js';

interface TournamentPlayer {
	userId: number;
	username: string;
	socket: WebSocket;
}

interface TournamentMatch {
	player1: TournamentPlayer;
	player2: TournamentPlayer;
	lobbyId?: string;
	gameId?: string;
	winnerId?: number;
	score1?: number;
	score2?: number;
}

interface Tournament {
	id: string;
	players: TournamentPlayer[];
	matches: TournamentMatch[][];
	currentRound: number;
	inProgress: boolean;
}

const tournaments = new Map<string, Tournament>();

function shuffle<T>(array: T[]): T[] {
	const copy = [...array];
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
}

export function createTournament(id: string, players: TournamentPlayer[]) {
	if (players.length % 2 !== 0) {
		Logger.warn("❌ Número ímpar de jogadores detectado. Remover o último jogador.");
		players = players.slice(0, players.length - 1);
	}
	const shuffled = shuffle(players);
	const matches: TournamentMatch[][] = [];
	const firstRound: TournamentMatch[] = [];

	for (let i = 0; i < shuffled.length; i += 2) {
		firstRound.push({
			player1: shuffled[i],
			player2: shuffled[i + 1]
		});
	}
	matches.push(firstRound);

	const tournament: Tournament = {
		id,
		players,
		matches,
		currentRound: 0,
		inProgress: true
	};
	tournaments.set(id, tournament);

	for (const round of tournament.matches) {
		for (const match of round) {
			for (const player of [match.player1, match.player2]) {
				if (player.socket.readyState === WebSocket.OPEN) {
					broadcastBracket(tournament);
				}
			}
		}
		Logger.log(`📊 Bracket iniplayer1.usernamecial gerada para Torneio ${id}`);
		setTimeout(() => startNextRound(id), 7000);
	}
}

function startNextRound(tournamentId: string) {
	const tournament = tournaments.get(tournamentId);
	if (!tournament) return;

	const round = tournament.matches[tournament.currentRound];
	Logger.log(`📣 ▶️ Iniciando Ronda ${tournament.currentRound + 1} do Torneio ${tournament.id}`);
	Logger.log(`📦 Ronda contém ${round.length} jogo(s)`);

	for (const round of tournament.matches) {
		for (const match of round) {
			for (const player of [match.player1, match.player2]) {
				if (player?.socket?.readyState === WebSocket.OPEN) {
					broadcastBracket(tournament);
				}
			}
		}
	}

	for (let index = 0; index < round.length; index++) {
		const match = round[index];
		const { player1, player2 } = match;

		if (player1.socket.readyState !== WebSocket.OPEN || player2.socket.readyState !== WebSocket.OPEN) {
		Logger.warn("❌ Um dos sockets está fechado. Match inored.");
		continue;
		}

		const lobbyId = createLobby(player1.socket, {
			userId: player1.userId,
			username: player1.username,
		}, "TNT", 2, undefined, true);

		if (!lobbyId) {
			Logger.error(`❌ Falha ao criar lobby para ${player1.username}`);
			continue;
		}
		Logger.log(`🆕 Lobby ${lobbyId} criado com sucesso.`);

		const joined = joinLobby(lobbyId, player2.socket, {
			userId: player2.userId,
			username: player2.username,
		}, true);

		if (!joined) {
			Logger.error(`❌ ${player2.username} não conseguiu entrar no lobby ${lobbyId}`);
			continue;
		}
		match.lobbyId = lobbyId;

		for (const sock of [player1.socket, player2.socket]) {
			if (sock.readyState === WebSocket.OPEN) {
				sock.send(JSON.stringify({
				type: "start-round",
				round: tournament.currentRound
				}));
			}
		}

		const result = startGame(lobbyId, player1.userId);
		if (!result.success || !result.gameId) {
			Logger.error(`❌ Falha ao iniciar o jogo no lobby ${lobbyId}`);
			continue;
		}
		match.gameId = result.gameId;
		Logger.log(`🚀 Jogo iniciado com sucesso: ${result.gameId}`);
	}
}

export function handleMatchEndFromTournament( gameId: string, winnerId: number, score1: number, score2: number): { 
	roundIndex: number; matchIndex: number; winnerUsername: string; isFinal: boolean;} | void {
	for (const tournament of tournaments.values()) {
		const round = tournament.matches[tournament.currentRound];
		const matchIndex = round.findIndex(m => m.gameId === gameId);
		if (matchIndex === -1) continue;

		const match = round[matchIndex];
		match.winnerId = winnerId;
		match.score1 = score1;
		match.score2 = score2;
		removeLobbyByGameId(gameId);
		broadcastBracket(tournament);

		const winner = winnerId === match.player1.userId ? match.player1 : match.player2;
		const roundFinished = round.every(m => m.winnerId !== undefined);

    if (roundFinished) {
		const nextPlayers = round.map(m => m.winnerId === m.player1.userId ? m.player1 : m.player2);
		if (nextPlayers.length === 1) {
			broadcastBracket(tournament);
			Logger.log(`🏆 Torneio ${tournament.id} vencido por ${nextPlayers[0].username}`);
			tournament.inProgress = false;

			return;
		}

		const nextRound: TournamentMatch[] = [];
		for (let i = 0; i < nextPlayers.length; i += 2) {
			nextRound.push({
			player1: nextPlayers[i],
			player2: nextPlayers[i + 1]
			});
		}
		tournament.matches.push(nextRound);
		tournament.currentRound++;

		Logger.log("⏳ W8 7 secs...");
		setTimeout(() => startNextRound(tournament.id), 7000);
    }
	broadcastBracket(tournament);

	return { roundIndex: tournament.currentRound, matchIndex,
	winnerUsername: winner.username, isFinal: false	};
	}
}

function broadcastBracket(tournament: Tournament) {
	for (const player of tournament.players) {
		if (player.socket.readyState === WebSocket.OPEN) {
			player.socket.send(JSON.stringify({
				type: "show-bracket",
				state: {
					currentRound: tournament.currentRound,
					rounds: tournament.matches.map(round => 
						round.map(match => ({
							player1: match.player1.username,
							player2: match.player2.username,
							winner: match.winnerId 
								? (match.winnerId === match.player1.userId ? match.player1.username : match.player2.username) 
								: undefined,
							score1: match.score1,
							score2: match.score2
						}))
					)
				}
			}));
		}
	}
}
