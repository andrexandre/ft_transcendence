let soundEnabled = sessionStorage.getItem("user_set_sound") === "1";

const sounds = {
	paddleHit: new Audio("../../components/sounds/paddle.wav"),
	countdown: new Audio("../../components/sounds/countdown.wav"),
	menuMusic: new Audio("../../components/sounds/menu-calm.mp3"),
	gameMusic: new Audio("/home/migca/ft_transc/frontend/src/components/sounds/paddle.wav"),
};

sounds.menuMusic.loop = true;
sounds.gameMusic.loop = true;

export function setSoundEnabled(enabled: boolean) {
	soundEnabled = enabled;
	sessionStorage.setItem("user_set_sound", enabled ? "1" : "0");
}

export function playSound(name: keyof typeof sounds) {
	if (!soundEnabled) return;
	sounds[name].currentTime = 0;
	sounds[name].play();
}

export function playMusic(name: "menuMusic" | "gameMusic") {
	if (!soundEnabled) return;
	stopAllMusic();
	sounds[name].play();
}

export function stopAllMusic() {
	sounds.menuMusic.pause();
	sounds.gameMusic.pause();
}
