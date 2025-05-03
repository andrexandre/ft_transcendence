// src/tournamentManager.ts
import { createLobby, startGame, getLobbyByUserId } from './lobbyManager.js';

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
}

interface Tournament {
  id: string;
  players: TournamentPlayer[];
  matches: TournamentMatch[][]; // Rounds -> Matches
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
  startNextRound(id);
}

function startNextRound(tournamentId: string) {
  const tournament = tournaments.get(tournamentId);
  if (!tournament) return;

  const round = tournament.matches[tournament.currentRound];

  round.forEach((match) => {
    const lobbyId = createLobby(match.player1.socket, {
      userId: match.player1.userId,
      username: match.player1.username
    }, "Tournament", 2);

    // Entra o segundo jogador
    getLobbyByUserId(match.player1.userId)?.players.push({
      userId: match.player2.userId,
      username: match.player2.username,
      socket: match.player2.socket,
      isHost: false
    });

    match.lobbyId = lobbyId;
    const started = startGame(lobbyId, match.player1.userId);
    if (started.success) match.gameId = started.gameId;
  });
}

export function handleMatchEndFromTournament(gameId: string, winnerId: number) {
  for (const tournament of tournaments.values()) {
    const round = tournament.matches[tournament.currentRound];
    const match = round.find(m => m.gameId === gameId);
    if (!match) continue;

    match.winnerId = winnerId;

    // Check if round is finished
    if (round.every(m => m.winnerId !== undefined)) {
      const nextPlayers = round.map(m => {
        return m.winnerId === m.player1.userId ? m.player1 : m.player2;
      });

      if (nextPlayers.length === 1) {
        console.log(`🏆 Torneio ${tournament.id} vencido por ${nextPlayers[0].username}`);
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
      startNextRound(tournament.id);
    }
    break;
  }
}
