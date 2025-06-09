// src/game/renderUtils.ts
import { showToast } from "../../utils";

export let gameCanvas: HTMLCanvasElement;
export let ctx: CanvasRenderingContext2D;

export function initGameCanvas() {
	gameCanvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
	ctx = gameCanvas.getContext("2d")!;
	gameCanvas.width = 800;
	gameCanvas.height = 600;
}

export function updateScoreboard(players: any[]) {
	const el = document.getElementById("scoreboard") as HTMLDivElement;
	if (players.length < 2) return;

	if (players.length === 4) {
		const teamA = players.slice(0, 2);
		const teamB = players.slice(2, 4);
		const scoreA = teamA.reduce((acc, p) => acc + p.score, 0);
		const scoreB = teamB.reduce((acc, p) => acc + p.score, 0);
		el.innerHTML = /*html*/`
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
		el.innerHTML = /*html*/`
			<div class="grid grid-cols-[1fr_15rem_1fr]">
				<div class="text-right truncate" style='color: blue;'>${p1.username}</div>
				<div class="text-center">${p1.score} vs ${p2.score}</div>
				<div class="text-left truncate" style='color: red;'>${p2.username}</div>
			</div>
		`;
	}
}

function elem(elementId: string, className: string, addClassToElement: boolean) {
	if (addClassToElement)
		document.getElementById(elementId)!.classList.add(className);
	else
		document.getElementById(elementId)!.classList.remove(className);
}

export function chooseView(type: string) {
	if (type == 'menu') {
		elem('sidebar', 'hidden', false);
		elem('game-main-menu', 'hidden', false);
		elem('gameCanvas', 'hidden', true);
		elem('scoreboard', 'hidden', true);
		elem('tournament-bracket', 'hidden', true);
	} else if (type == 'game') {
		elem('sidebar', 'hidden', true);
		elem('game-main-menu', 'hidden', true);
		elem('gameCanvas', 'hidden', false);
		elem('scoreboard', 'hidden', false);
		elem('tournament-bracket', 'hidden', true);
	} else if (type == 'tree') {
		elem('game-main-menu', 'hidden', true);
		elem('gameCanvas', 'hidden', true);
		elem('scoreboard', 'hidden', true);
		elem('tournament-bracket', 'hidden', false);
	} else
		showToast.red('What?');
}

export function drawGameMessage(show: boolean, msg?: string, color?: string) {
	const gameMessage = document.getElementById('game-message')!;
	gameMessage.classList.toggle('hidden', !show);

	if (msg) gameMessage.textContent = msg;
	if (color) gameMessage.style.color = color;
}
