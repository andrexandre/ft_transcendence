import * as lib from "../utils"

type TournamentMatch = {
    player1: string;
    player2: string;
    winner?: string;
};

type TournamentState = {
    rounds: TournamentMatch[][];
    currentRound: number;
};

const tournamentTree = {
	classes: 'flex gap-2',
	getHtml: () => /*html*/`
			<div class="bg-gray-800/50 size-200 flex items-center justify-center">
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
	updateTree: (tState?: TournamentState) => {
		if (tState) {
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
				p1name: tRounds[0][0].winner || "TBD",
				p1score: 'X',
				p2name: tRounds[0][1].winner || "TBD",
				p2score: 'X'
			});
			document.getElementById("winner")!.innerHTML = tRounds[1][0].winner || "TBD";
		} else {
			tournamentTree.updateMatch('top-bracket', {
				p1name: 'person 1',
				p1score: 'X',
				p2name: 'person 2',
				p2score: 'X'
			});
			tournamentTree.updateMatch('bot-bracket', {
				p1name: 'person 3',
				p1score: 'X',
				p2name: 'person 4',
				p2score: 'X'
			});
			tournamentTree.updateMatch('next-bracket', {
				p1name: 'TBD',
				p1score: 'X',
				p2name: 'TBD',
				p2score: 'X'
			});
			document.getElementById("winner")!.innerHTML = 'person 4';
		}
	},
	updateMatch: (nodeId: string, match: { p1name: string, p1score: string, p2name: string, p2score: string }) => {
		document.getElementById(nodeId)!.innerHTML = /*html*/`
			<div class="${tournamentTree.classes}">
				<p>${match.p1name}</p>
				<p>${match.p1score}</p>
			</div>
			<div class="${tournamentTree.classes}">
				<p>${match.p2name}</p>
				<p>${match.p2score}</p>
			</div>
		`;
	}
}

export default tournamentTree;
