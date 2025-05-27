import { element, showToast } from "../../utils";

// src/game/renderUtils.ts
export function drawGameMessage(msg: string, color?: string) {
	const el = document.getElementById("game-message") as HTMLDivElement;
	el.textContent = msg;
	if (color) el.style.color = color;
	el.classList.remove("hidden");
}

export function toggleGameMessage(show: boolean) {
	const el = document.getElementById("game-message") as HTMLDivElement;
	el.classList.toggle("hidden", !show);
}

export function updateScoreboard(players: any[]) {
	const el = document.getElementById("scoreboard") as HTMLDivElement;
	if (players.length < 2) return;

	if (players.length === 4) {
		const teamA = players.slice(0, 2);
		const teamB = players.slice(2, 4);
		const scoreA = teamA.reduce((acc, p) => acc + p.score, 0);
		const scoreB = teamB.reduce((acc, p) => acc + p.score, 0);
		el.innerHTML = `
			<div class="grid grid-cols-[1fr_15rem_1fr] space-y-1">
				<div class="text-right truncate" style='color: blue;'>Team 1</div>
				<div class="text-center">${scoreA} vs ${scoreB}</div>
				<div class="text-left truncate" style='color: red;'>Team 2</div>
				<div class="text-right text-sm">${teamA.map(p => p.username).join(', ')}</div>
				<div class="text-center"></div>
				<div class="text-left text-sm">${teamB.map(p => p.username).join(', ')}</div>
			</div>
		`;
	} else {
		const [p1, p2] = players;
		el.innerHTML = `
			<div class="grid grid-cols-[1fr_15rem_1fr]">
				<div class="text-right truncate" style='color: blue;'>${p1.username}</div>
				<div class="text-center">${p1.score} vs ${p2.score}</div>
				<div class="text-left truncate" style='color: red;'>${p2.username}</div>
			</div>
		`;
	}
}

export function chooseView(type: string) {
	if (type == 'menu') {
		element('sidebar', 'hidden', true);
		element('sidebar', 'hidden', false);
		element('game-main-menu', 'hidden', false);
		element('gameCanvas', 'hidden', true);
		element('scoreboard', 'hidden', true);
	} else if (type == 'game') {
		element('sidebar', 'hidden', true);
		element('game-main-menu', 'hidden', true);
		element('gameCanvas', 'hidden', false);
		element('scoreboard', 'hidden', false);
		element('tournament-bracket', 'hidden', true);
	} else if (type == 'tree') {
		element('game-main-menu', 'hidden', true);
		element('gameCanvas', 'hidden', true);
		element('scoreboard', 'hidden', true);
		element('tournament-bracket', 'hidden', false);
	} else
		showToast.red('What?');
}

export function drawGameMessageNew(show: boolean, msg?: string, color?: string) {
	const gameMessage = document.getElementById('game-message')!;
	gameMessage.classList.toggle('hidden', !show);

	if (msg) gameMessage.textContent = msg;
	if (color) gameMessage.style.color = color;
}
