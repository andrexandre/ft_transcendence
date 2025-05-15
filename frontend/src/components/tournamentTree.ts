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

// * TEMP
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
	// * TEMP
	,generateRandomString: (maxLength: number = 15, minLength: number = 3) => {
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

// export default tournamentTree;
