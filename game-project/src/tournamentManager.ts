// src/tournamentManager.ts
import { createLobby, startGame, getLobbyByUserId, joinLobby } from './lobbyManager.js';

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
  //[round/games][players de cada game]
  matches: TournamentMatch[][]; // Rounds
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
    console.warn("⚠️ Número ímpar de jogadores. O último jogador será ignorado ou deverá avançar automaticamente.");
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
  startNextRound(id);
}

function startNextRound(tournamentId: string) {
  const tournament = tournaments.get(tournamentId);
  if (!tournament) {
    console.error(`❌ Torneio ${tournamentId} não encontrado`);
    return;
  }

  const round = tournament.matches[tournament.currentRound];
  console.log(`📣 ▶️ Iniciando Ronda ${tournament.currentRound + 1} do Torneio ${tournament.id}`);
  console.log(`📦 Ronda contém ${round.length} jogo(s)`);

  round.forEach((match, index) => {
    console.log(`🎮 Preparando Jogo ${index + 1}: ${match.player1.username} vs ${match.player2.username}`);

    // Verifica se os sockets ainda estão válidos
    if (
      match.player1.socket.readyState !== WebSocket.OPEN ||
      match.player2.socket.readyState !== WebSocket.OPEN
    ) {
      console.warn("⚠️ Um dos sockets está fechado. Match será ignorado.");
      return;
    }

    // Cria o lobby com o jogador 1 (host)
    const lobbyId = createLobby(match.player1.socket, {
      userId: match.player1.userId,
      username: match.player1.username,
    }, "TNT", 2);

    if (!lobbyId) {
      console.error(`❌ Falha ao criar lobby para ${match.player1.username}`);
      return;
    }

    console.log(`🆕 Lobby ${lobbyId} criado com sucesso.`);

    // Tenta juntar o jogador 2 ao lobby
    const joined = joinLobby(lobbyId, match.player2.socket, {
      userId: match.player2.userId,
      username: match.player2.username,
    });

    if (!joined) {
      console.error(`❌ ${match.player2.username} não conseguiu entrar no lobby ${lobbyId}`);
      return;
    }

    console.log(`✅ ${match.player2.username} entrou no lobby ${lobbyId}`);

    // Guarda o lobbyId
    match.lobbyId = lobbyId;

    // Tenta iniciar o jogo
    const result = startGame(lobbyId, match.player1.userId);
    if (!result.success || !result.gameId) {
      console.error(`❌ Falha ao iniciar o jogo no lobby ${lobbyId}`);
      return;
    }

    match.gameId = result.gameId;
    console.log(`🚀 Jogo iniciado com sucesso: ${result.gameId}`);
  });
}


export function handleMatchEndFromTournament(gameId: string, winnerId: number) {
  for (const tournament of tournaments.values()) {
    const round = tournament.matches[tournament.currentRound];
    const match = round.find(m => m.gameId === gameId); // check id
    console.log("🏆🏆🏆🏆", match);
    if (!match) continue;

    match.winnerId = winnerId;

    const roundFinished = round.every(m => m.winnerId !== undefined);
    if (!roundFinished) return;

    const nextPlayers = round.map(m =>
      m.winnerId === m.player1.userId ? m.player1 : m.player2
    );

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
    return;
  }
}
