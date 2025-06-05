// src/pages/game/tournamentRender.ts
import { chooseView } from './renderUtils';

export type TournamentMatch = {
	player1: string;
	player2: string;
	winner?: string;
	score1?: number;
	score2?: number;
};


export const tournamentState = {
	rounds: [] as TournamentMatch[][],
	currentRound: 0
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
	updateTree: () => {
		const [round1, round2] = tournamentState.rounds;

		tournamentTree.updateMatch('top-bracket', {
			p1name: round1?.[0]?.player1 || "---",
			p1score: String(round1?.[0]?.score1 ?? "-"),
			p2name: round1?.[0]?.player2 || "---",
			p2score: String(round1?.[0]?.score2 ?? "-"),
		});

		tournamentTree.updateMatch('bot-bracket', {
			p1name: round1?.[1]?.player1 || "---",
			p1score: String(round1?.[1]?.score1 ?? "-"),
			p2name: round1?.[1]?.player2 || "---",
			p2score: String(round1?.[1]?.score2 ?? "-"),
		});

		tournamentTree.updateMatch('next-bracket', {
			p1name: round1?.[0]?.winner || "---",
			p1score: "-",
			p2name: round1?.[1]?.winner || "---",
			p2score: "-",
		});

		document.getElementById("winner")!.innerHTML = round2?.[0]?.winner || "---";
	},

	updateMatch: (nodeId: string, match: {
		p1name: string, p1score: string, p2name: string, p2score: string
	}) => {
		const node = document.getElementById(nodeId);
		if (!node) return;

		const nodeClasses = 'gap-2 grid grid-cols-[auto_1rem]';
		node.innerHTML = /*html*/`
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
};

export function renderTournamentBracket() {
	chooseView('tree');
	tournamentTree.updateTree();
}

