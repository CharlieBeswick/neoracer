import React, { useState } from 'react';
import Menu from './components/Menu';
import Game from './components/Game'; // Import the Game component
import ModeSelection from './components/ModeSelection'; // Import the new component

// Define possible game states
type GameState = 'menu' | 'modeSelection' | 'playing' | 'gameover'; // Added modeSelection

function App() {
  const [gameState, setGameState] = useState<GameState>('menu');

  const startGame = () => {
    console.log("Showing mode selection...");
    setGameState('modeSelection'); // Go to mode selection first
  };

  // New function to start the actual game (single player)
  const startSinglePlayer = () => {
    console.log("Initializing single player game loop...");
    setGameState('playing');
  };

  const quitGame = () => {
    console.log("Quitting game...");
    // In a web context, "quitting" might mean returning to menu or just logging
    // Closing the tab/window is up to the user
    setGameState('menu'); // Example: return to menu
  };

  const renderGameState = () => {
    switch (gameState) {
      case 'menu':
        return <Menu onPlay={startGame} onQuit={quitGame} />;
      case 'modeSelection':
        return <ModeSelection onStartSinglePlayer={startSinglePlayer} />;
      case 'playing':
        // Render the actual Game component
        return <Game onBackToMenu={() => setGameState('menu')} />;
      // case 'gameover':
      //   return <GameOver onRestart={startGame} onMenu={() => setGameState('menu')} />;
      default:
        return <Menu onPlay={startGame} onQuit={quitGame} />; // Default to menu
    }
  };

  return <div className="App">{renderGameState()}</div>;
}

export default App; 