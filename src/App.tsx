import React, { useState, useEffect, useRef, useCallback } from 'react';
import Menu from './components/Menu';
import Game from './components/Game'; // Import the Game component
import ModeSelection from './components/ModeSelection'; // Import the new component
import Garage from './components/Garage'; // Import the Garage component

const MENU_MUSIC_SRC = '/assets/IVOXYGEN_-_plateau_angst_Techno_Remix_Extended (1).mp3'; // Updated music path

// Define possible game states
type GameState = 'menu' | 'modeSelection' | 'garage' | 'playing' | 'gameover'; // Added garage

function App() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const menuAudioRef = useRef<HTMLAudioElement | null>(null); // Ref for menu music
  const [isFullscreen, setIsFullscreen] = useState(false); // Moved from Game.tsx

  // --- Fullscreen Logic (Moved from Game.tsx) ---
  const checkFullscreenStatus = useCallback(() => {
    setIsFullscreen(!!document.fullscreenElement);
  }, []);

  useEffect(() => {
    document.addEventListener('fullscreenchange', checkFullscreenStatus);
    checkFullscreenStatus(); // Initial check
    return () => document.removeEventListener('fullscreenchange', checkFullscreenStatus);
  }, [checkFullscreenStatus]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };
  // --- End Fullscreen Logic ---

  // Initialize and cleanup menu audio
  useEffect(() => {
    console.log('Creating menu audio element');
    menuAudioRef.current = new Audio(MENU_MUSIC_SRC);
    menuAudioRef.current.loop = true;

    // Cleanup function on component unmount
    return () => {
      console.log('Cleaning up menu audio element');
      menuAudioRef.current?.pause(); // Pause audio
      menuAudioRef.current = null; // Release reference
    };
  }, []); // Empty dependency array: runs only once on mount

  // Control menu audio playback based on game state
  useEffect(() => {
    const audio = menuAudioRef.current;
    if (!audio) return; // Exit if audio element not ready

    // Play if we are on a menu or garage screen
    if (gameState === 'menu' || gameState === 'modeSelection' || gameState === 'garage') { 
      if (audio.paused) {
        audio.play().catch(e => console.warn("Menu audio play failed:", e));
      }
    } else {
      // Pause if we are not on a menu screen (e.g., playing)
      if (!audio.paused) {
        audio.pause();
      }
    }
  }, [gameState]); // Re-run this effect when gameState changes

  const startGame = () => {
    console.log("Showing mode selection...");
    setGameState('modeSelection'); // Go to mode selection first
  };

  // Renamed: This now leads to the garage
  const goToGarage = () => {
    console.log("Going to Garage...");
    setGameState('garage'); // Go to garage screen
  };

  // New function to start the actual race from the garage
  const startRace = () => {
    console.log("Initializing single player game loop from garage...");
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
        // Pass fullscreen props to Menu
        return <Menu 
                 onPlay={startGame} 
                 onQuit={quitGame} 
                 isFullscreen={isFullscreen} 
                 toggleFullscreen={toggleFullscreen} 
               />;
      case 'modeSelection':
        return <ModeSelection onStartSinglePlayer={goToGarage} onBackToMenu={quitGame} />;
      case 'garage':
        return <Garage onStartRace={startRace} onBackToMenu={quitGame} />;
      case 'playing':
        // Pass fullscreen props to Game
        return <Game 
                 onBackToMenu={() => setGameState('menu')} 
                 isFullscreen={isFullscreen} 
                 toggleFullscreen={toggleFullscreen} 
               />;
      // case 'gameover':
      //   return <GameOver onRestart={startGame} onMenu={() => setGameState('menu')} />;
      default:
        // Pass fullscreen props to default Menu as well
        return <Menu 
                 onPlay={startGame} 
                 onQuit={quitGame} 
                 isFullscreen={isFullscreen} 
                 toggleFullscreen={toggleFullscreen} 
               />; // Default to menu
    }
  };

  return <div className="App">{renderGameState()}</div>;
}

export default App; 