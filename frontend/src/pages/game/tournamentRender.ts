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

export const tournamentState: TournamentState = {
	rounds: [],
	currentRound: 0,
};


export const tournamentTree = {
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
}

export function renderTournamentBracket() {
	chooseView('tree');
	tournamentTree.updateTree(tournamentState);
}


export function addRound(matches: TournamentMatch[]) {
	tournamentState.rounds.push(matches);
	renderTournamentBracket();
}

export function updateWinner(roundIndex: number, matchIndex: number, winner: string) {
	const match = tournamentState.rounds[roundIndex]?.[matchIndex];
	if (!match) return;
	match.winner = winner;
	renderTournamentBracket();
}

export function resetTournament() {
	tournamentState.rounds = [];
	tournamentState.currentRound = 0;
}

export function handleEndTournament(winner: string) {
	chooseView('tree');
	drawGameMessage(true, `🏆 Torneio vencido por ${winner}!`, "gold");

	setTimeout(() => {
		chooseView('menu');
		drawGameMessage(false, '');
	}, 5000);
}

