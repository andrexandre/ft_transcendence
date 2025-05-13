export const sounds = {
	countdown: new Audio("/src/components/sounds/countdown.wav"),
	gameMusic: new Audio("/src/components/sounds/inGame.mp3"),
	menuMusic: new Audio("/src/components/sounds/menu-calm.mp3"),
	paddleHit: new Audio("/src/components/sounds/paddle.wav"),
};

export function initSounds() {
	sounds.menuMusic.loop = true;
	sounds.menuMusic.volume = 0.3;

	sounds.gameMusic.loop = true;
	sounds.gameMusic.volume = 0.3;
}

export function playSound(name: keyof typeof sounds) {
	const sound = sounds[name];
	if (!sound) return;

	sound.currentTime = 0;
	sound.play().catch(() => {});
}

export function stopSound(name: keyof typeof sounds) {
	const sound = sounds[name];
	if (!sound) return;
	sound.pause();
	sound.currentTime = 0;
}
