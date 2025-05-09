// src/pages/game/tournamentRender.ts
type TournamentMatch = {
    player1: string;
    player2: string;
    winner?: string;
};

export type TournamentState = {
    rounds: TournamentMatch[][];
    currentRound: number;
};

export function renderTournamentBracket() {
    const container = document.getElementById("tournament-bracket");
    console.log("🎨 Re-renderizando bracket...", JSON.stringify(state.rounds, null, 2));
    if (!container) return;


    container.classList.remove("hidden");  
    container.innerHTML = "<h2 class='text-xl mb-4'>🏆 Tournament Bracket</h2>";

    state.rounds.forEach((round, roundIndex) => {
        const roundDiv = document.createElement("div");
        roundDiv.className = "mb-4";

        const roundTitle = document.createElement("h3");
        roundTitle.className = "font-bold underline mb-2";
        roundTitle.textContent = `Round ${roundIndex + 1}`;
        roundDiv.appendChild(roundTitle);

        round.forEach((match) => {
        const matchDiv = document.createElement("div");
        matchDiv.className = "ml-4";
        matchDiv.innerHTML = `🎮 ${match.player1} vs ${match.player2} ${match.winner ? `→ 🏅 ${match.winner}` : ""}`;
        roundDiv.appendChild(matchDiv);
        });

        container.appendChild(roundDiv);
    });
}


const rawState: TournamentState = {
    rounds: [],
    currentRound: 0,
};

export const state: TournamentState = new Proxy(rawState, {
    set(target, prop, value) {
        // @ts-ignore
        target[prop] = value;
        renderTournamentBracket();
        return true;
    },
});


export function addRound(matches: TournamentMatch[]) {
    state.rounds.push(matches);
    renderTournamentBracket();
}

export function updateWinner(roundIndex: number, matchIndex: number, winner: string) {
    const match = state.rounds[roundIndex]?.[matchIndex];
    if (!match) return;
    match.winner = winner;
    renderTournamentBracket();
}

export function resetTournament() {
    state.rounds = [];
    state.currentRound = 0;
}

export function handleEndTournament(winner: string) {
	const bracket = document.getElementById("tournament-bracket");
	const msg = document.getElementById("game-message");

	if (bracket) bracket.classList.add("hidden");

	if (msg) {
		msg.classList.remove("hidden");
		msg.textContent = `🏆 Torneio vencido por ${winner}!`;
		msg.style.color = "gold";
	}

	setTimeout(() => {
		msg?.classList.add("hidden");
		msg!.textContent = "";
		document.getElementById("game-main-menu")?.classList.remove("hidden");
	}, 5000);
}

export function showRoundTransition(roundNumber: number) {
	const el = document.getElementById("game-message");
	if (!el) return;

	let count = 3;
	el.classList.remove("hidden");
	const interval = setInterval(() => {
		el.textContent = `Round ${roundNumber} starts in ${count}...`;
		el.style.color = "white";
		count--;
		if (count < 0) {
			clearInterval(interval);
			el.classList.add("hidden");
			el.textContent = "";
		}
	}, 1000);
}
