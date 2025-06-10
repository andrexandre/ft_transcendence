// src/pages/game/tournamentRender.ts
// import { userInfo } from './utils';
import { showToast, userInfo } from '../../utils';
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
	updateTree: () => {
		const rounds = tournamentState.rounds;
		const winnerEl = document.getElementById("winner");

		tournamentTree.updateMatch('top-bracket', {
			p1name: rounds?.[0]?.[0]?.player1 ?? "---",
			p1score: String(rounds?.[0]?.[0]?.score1 ?? "-"),
			p2name: rounds?.[0]?.[0]?.player2 ?? "---",
			p2score: String(rounds?.[0]?.[0]?.score2 ?? "-"),
		});

		tournamentTree.updateMatch('bot-bracket', {
			p1name: rounds?.[0]?.[1]?.player1 ?? "---",
			p1score: String(rounds?.[0]?.[1]?.score1 ?? "-"),
			p2name: rounds?.[0]?.[1]?.player2 ?? "---",
			p2score: String(rounds?.[0]?.[1]?.score2 ?? "-"),
		});

		tournamentTree.updateMatch('next-bracket', {
			p1name: rounds?.[1]?.[0]?.player1 ?? "---",
			p1score: String(rounds?.[1]?.[0]?.score1 ?? "-"),
			p2name: rounds?.[1]?.[0]?.player2 ?? "---",
			p2score: String(rounds?.[1]?.[0]?.score2 ?? "-"),
		});

		if (winnerEl)
			winnerEl.innerText = rounds?.[1]?.[0]?.winner ?? "---";
	
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

export function notifyChat(message: string) {
	if (userInfo.chat_sock?.readyState === WebSocket.OPEN) {
		userInfo.chat_sock.send(JSON.stringify({
			type: "add-notification",
			msg: message
		}));
	}
}

const notifiedMatches = new Set<string>();
export function renderTournamentBracket() {
	chooseView('tree');
	tournamentTree.updateTree();

	const round = tournamentState.rounds[tournamentState.currentRound];
	if (!round) return;

	for (const match of round) {
		const matchKey = `${match.player1}-${match.player2}-${tournamentState.currentRound}`;
		const isUserInMatch = match.player1 === userInfo.username || match.player2 === userInfo.username;

		if (isUserInMatch && !notifiedMatches.has(matchKey)) {
			notifiedMatches.add(matchKey);
			showToast.green(`🆕 Teu jogo: ${match.player1} vs ${match.player2}`);
			notifyTournamentMatchOnce(tournamentState.currentRound, match.player1, match.player2);
		}
	}
}

let lastNotifiedRound = -1;
export function notifyTournamentMatchOnce(round: number, player1: string, player2: string) {
	if (round === lastNotifiedRound) return;
	
	lastNotifiedRound = round;
	notifyChat(`🎮 New Tournament Game: ${player1} vs ${player2}`);
}
