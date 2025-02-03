const initializeGame = () => {
    return {
      ball: { x: 0, y: 0 },
      paddles: [
        { player: 1, position: 0 },
        { player: 2, position: 0 }
      ],
      score: { player1: 0, player2: 0 }
    };
  };
  
  const updateGameState = (gameState, playerAction) => {
    return gameState;
  };
  
  module.exports = { initializeGame, updateGameState };
  