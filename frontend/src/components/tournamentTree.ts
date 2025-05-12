import * as lib from "../utils"

interface TournamentMatch {
	p1name: string;
	p1score: string;
	p2name: string;
	p2score: string;
}

const tournamentTree = {
	classes: 'flex gap-2',
	getHtml: () => /*html*/`
			<div class="bg-gray-800/50 size-200 flex items-center justify-center">
			<div>
				<div id="top-bracket" class="card t-dashed">
					<div class="${tournamentTree.classes}">
						<p>person 1</p>
						<p>O</p>
					</div>
					<div class="${tournamentTree.classes}">
						<p>person 2</p>
						<p>O</p>
					</div>
				</div>
				<div id="bot-bracket" class="card t-dashed">
					<div class="${tournamentTree.classes}">
						<p>person 3</p>
						<p>O</p>
					</div>
					<div class="${tournamentTree.classes}">
						<p>person 4</p>
						<p>O</p>
					</div>
				</div>
			</div>
			<div class="t-border w-10 h-30 border-l-0"></div>
			<div class="t-border h-0 w-10 border-t-0"></div>
			<div id="next-bracket" class="card t-dashed">
				<div class="${tournamentTree.classes}">
					<p>person 2</p>
					<p>O</p>
				</div>
				<div class="${tournamentTree.classes}">
					<p>person 4</p>
					<p>O</p>
				</div>
			</div>
			<div class="t-border h-0 w-10 border-t-0"></div>
			<p class="card t-dashed rounded-2xl">person 4</p>
		</div>
	`,
	updateTree: () => {
		tournamentTree.updateMatch('top-bracket', {
			p1name: 'person 1',
			p1score: 'O',
			p2name: 'person 2',
			p2score: 'O'
		});
	},
	updateMatch: (nodeId: string, match: TournamentMatch) => {
		const node = document.getElementById(nodeId);
		if (node) {
			node.innerHTML = /*html*/`
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
}

export default tournamentTree;
