// src/pages/game/tournamentRender.ts
import { chooseView, drawGameMessage } from './renderUtils';
type TournamentMatch = {
	player1: string;
	player2: string;
	winner?: string;
};

export type TournamentState = {
	rounds: TournamentMatch[][];
	currentRound: number;
};

// * TEMP
export const tournamentTree = {
	getHtmlNew: () => /*html*/`
		<div class="flex flex-col items-center justify-center">
			<p id="winner" class="card t-dashed rounded-2xl h-30 w-70"></p>
			<!-- <div class="t-border w-10 h-30 border-l-0"></div> -->
			<div class="t-border h-10 w-0 border-l-0"></div>
			<div class="flex items-center justify-center">
				<div id="left-bracket" class="card t-dashed"></div>
				<div class="t-border h-0 w-10 border-t-0"></div>
				<div id="center-bracket" class="card t-dashed"></div>
				<div class="t-border h-0 w-10 border-t-0"></div>
				<div id="right-bracket" class="card t-dashed"></div>
			</div>
		</div>
	`,
	getHtml: () => /*html*/`
		<div class="flex items-center justify-center">
			<div>
				<div id="top-bracket" class="card t-dashed"></div>
				<div id="bot-bracket" class="card t-dashed"></div>
			</div>
			<div class="t-border w-10 h-30 border-l-0"></div>
			<div class="t-border h-0 w-10 border-t-0"></div>
			<div id="next-bracket" class="card t-dashed"></div>
			<div class="t-border h-0 w-10 border-t-0"></div>
			<p id="winner" class="card t-dashed rounded-2xl"></p>
		</div>
	`,
	updateTreeNew: (tState: TournamentState) => {
		const tRounds = tState.rounds;
		tournamentTree.updateMatch('left-bracket', {
			p1name: tRounds[0][0].player1,
			p1score: 'X',
			p2name: tRounds[0][0].player2,
			p2score: 'X'
		});
		tournamentTree.updateMatch('right-bracket', {
			p1name: tRounds[0][1].player1,
			p1score: 'X',
			p2name: tRounds[0][1].player2,
			p2score: 'X'
		});
		tournamentTree.updateMatch('center-bracket', {
			p1name: tRounds[0][0].winner || "---",
			p1score: 'X',
			p2name: tRounds[0][1].winner || "---",
			p2score: 'X'
		});
		document.getElementById("winner")!.innerHTML = tRounds[1][0].winner || "---";
	},
	updateTree: (tState: TournamentState) => {
		const tRounds = tState.rounds;
		tournamentTree.updateMatch('top-bracket', {
			p1name: tRounds[0][0].player1,
			p1score: 'X',
			p2name: tRounds[0][0].player2,
			p2score: 'X'
		});
		tournamentTree.updateMatch('bot-bracket', {
			p1name: tRounds[0][1].player1,
			p1score: 'X',
			p2name: tRounds[0][1].player2,
			p2score: 'X'
		});
		tournamentTree.updateMatch('next-bracket', {
			p1name: tRounds[0][0].winner || "---",
			p1score: 'X',
			p2name: tRounds[0][1].winner || "---",
			p2score: 'X'
		});
		document.getElementById("winner")!.innerHTML = tRounds[1][0].winner || "---";
	},
	// updatePerson: (nodeId: string, match: { p1name: string, p1score: string, p2name: string, p2score: string }) => {},
	updateMatch: (nodeId: string, match: { p1name: string, p1score: string, p2name: string, p2score: string }) => {
		let nodeClasses = 'gap-2 grid grid-cols-[auto_1rem]';
		document.getElementById(nodeId)!.innerHTML = /*html*/`
			<div class="${nodeClasses}">
				<p>${match.p1name}</p>
				<p>${match.p1score}</p>
			</div>
			<div class="${nodeClasses}">
				<p>${match.p2name}</p>
				<p>${match.p2score}</p>
			</div>
		`;
	}
	// * TEMP
	, generateRandomString: (maxLength: number = 6, minLength: number = 3) => {
		const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
		const characters = 'AEIOUabcdefghijklmnopqrstuvwxyz0123456789';
		let result = '';
		for (let i = 0; i < length; i++)
			result += characters.charAt(Math.floor(Math.random() * characters.length));
		return result;
	}
}

// * TEMP
export let tournamentSample: TournamentState = {
	rounds: [
		[
			{ player1: tournamentTree.generateRandomString(), player2: tournamentTree.generateRandomString(), winner: "---" },
			{ player1: tournamentTree.generateRandomString(), player2: tournamentTree.generateRandomString(), winner: "---" }
		],
		[
			{ player1: "---", player2: "---", winner: "---" }
		]
	],
	currentRound: 1
}



export function renderTournamentBracket() {
	const container = document.getElementById("tournament-bracket");
	console.log("🎨 Re-renderizando bracket...", JSON.stringify(state.rounds, null, 2));
	if (!container) return;

	container.classList.remove("hidden");
	container.style.display = "block";
	container.innerHTML = "<h2 class='text-xl mb-4'>🏆 Tournament Bracket</h2>";

	// chooseView('tree');
	state.rounds.forEach((round, roundIndex) => {
		// tournamentTree.updateTree(state);
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
	chooseView('tree');
	drawGameMessage(true, `🏆 Torneio vencido por ${winner}!`, "gold");

	setTimeout(() => {
		chooseView('menu');
		drawGameMessage(false, '');
	}, 5000);
}

export function showRoundTransition(roundNumber: number) {
	let count = 3;
	const interval = setInterval(() => {
		drawGameMessage(true, `Round ${roundNumber} starts in ${count}...`, "white");
		if (count < 0) {
			clearInterval(interval);
			drawGameMessage(false, '');
		}
	}, 1000);
}
