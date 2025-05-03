// frontend/src/pages/game/tournamentRender.ts
type FrontendTournamentMatch = {
    player1: string;
    player2: string;
    winner?: string;
  };
  
type FrontendTournament = {
    rounds: FrontendTournamentMatch[][];
    currentRound: number;
};

export const tournamentState: FrontendTournament = {
    rounds: [],
    currentRound: 0,
};

export function renderTournamentBracket() {
    const container = document.getElementById("tournament-bracket");
    if (!container) return;

    container.classList.remove("hidden");
    container.innerHTML = "<h2 class='text-xl mb-4'>🏆 Tournament Bracket</h2>";

    tournamentState.rounds.forEach((round, roundIndex) => {
        const roundDiv = document.createElement("div");
        roundDiv.className = "mb-4";

        const roundTitle = document.createElement("h3");
        roundTitle.className = "font-bold underline mb-2";
        roundTitle.textContent = `Round ${roundIndex + 1}`;
        roundDiv.appendChild(roundTitle);

        round.forEach((match, matchIndex) => {
        const matchDiv = document.createElement("div");
        matchDiv.className = "ml-4";

        const p1 = match.player1;
        const p2 = match.player2;
        const win = match.winner;

        matchDiv.innerHTML = `🎮 ${p1} vs ${p2} ${win ? `→ 🏅 ${win}` : ""}`;
        roundDiv.appendChild(matchDiv);
        });

        container.appendChild(roundDiv);
    });
}
