export const sounds = {
	countdown: new Audio("../../components/sounds/countdown.wav"),
	gameMusic: new Audio("../../components/sounds/inGame.mp3"),
	menuMusic: new Audio("../../components/sounds/menu-calm.mp3"),
	paddleHit: new Audio("../../components/sounds/paddle.wav"),
};


export function initSounds() {
    sounds.menuMusic.loop = true;
    sounds.menuMusic.volume = 1;
    }

    export function playSound(name: keyof typeof sounds) {
        const sound = sounds[name];
        if (sound) {
        sound.currentTime = 0;
        sound.play().catch(() => {});
        }
}
  