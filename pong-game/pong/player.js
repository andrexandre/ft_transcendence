export let leftPlayerScore = 0;
export let rightPlayerScore = 0;
export let leftPlayerName = "Player 1";
export let rightPlayerName = "Player 2";

// Reset scores
export function resetScores() {
  leftPlayerScore = 0;
  rightPlayerScore = 0;
}

// Draw scores
export function drawScores(context, canvasWidth) {
  context.fillStyle = "white";
  context.font = "30px Arial";
  context.fillText(leftPlayerScore, canvasWidth / 4, 50);
  context.fillText(rightPlayerScore, (3 * canvasWidth) / 4, 50);
}

