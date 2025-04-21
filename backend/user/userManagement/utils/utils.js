import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url));
export const uploadDirectory = path.join(__dirname, '../uploads');
			
export const sampleBios = [
	"Former ping-pong prodigy turned digital paddle warrior.",
	"Sharp reflexes. Unstoppable ball. You lose.",
	"I don’t play for fun. I play for revenge.",
	"Chasing pixels since 1972.",
	"Pong playground champ since 7th grade. Still undefeated.",
	"Addicted to dramatic losses since 2023.",
	"Pong is like chess… if chess had a bouncing ball and zero strategy.",
	"8-bit soul, world-class moves.",
	"Shows up when the ball bounces. Vanishes when the score hits max.",
	"The player. The myth. The pixel.",
	"Back when two paddles and a ball were all you needed.",
	"No one knows where they came from. Only that they never miss.",
]