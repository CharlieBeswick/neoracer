import React, { useState, useEffect, useRef, useCallback } from 'react';
import Menu from './components/Menu';
import Game from './components/Game'; // Import the Game component
import ModeSelection from './components/ModeSelection'; // Import the new component
import Garage from './components/Garage'; // Import the Garage component
import DevLog from './components/DevLog'; // Import the DevLog component

const MENU_MUSIC_SRC = '/assets/IVOXYGEN_-_plateau_angst_Techno_Remix_Extended (1).mp3'; // Updated music path

// Define possible game states
type GameState = 'menu' | 'modeSelection' | 'garage' | 'playing' | 'devlog' | 'gameover'; // Added devlog

function App() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const menuAudioRef = useRef<HTMLAudioElement | null>(null); // Ref for menu music
  const [isFullscreen, setIsFullscreen] = useState(false); // Moved from Game.tsx
  const [isMuted, setIsMuted] = useState(false); // Add mute state here
  const [isLandscape, setIsLandscape] = useState(true); // Assume landscape initially
  const [showRotationOverlay, setShowRotationOverlay] = useState(false);

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

  // --- Mute Logic ---
  const toggleMute = () => {
    setIsMuted(prevMuted => !prevMuted);
    // We also need to apply mute to the audio element directly
    if (menuAudioRef.current) {
      menuAudioRef.current.muted = !isMuted;
    }
  };
  // Apply mute state when it changes or audio loads
  useEffect(() => {
    if (menuAudioRef.current) {
      menuAudioRef.current.muted = isMuted;
    }
  }, [isMuted, menuAudioRef.current]); // Re-run if isMuted changes or audio loads
  // --- End Mute Logic ---

  // --- Orientation Logic (Moved from Game.tsx) ---
  const checkOrientation = useCallback(() => {
    const landscape =
      screen.orientation?.type?.includes('landscape') ??
      window.innerWidth > window.innerHeight;
    setIsLandscape(landscape);
    // Show overlay only if NOT landscape AND game state requires it
    const requiresLandscape = ['modeSelection', 'garage', 'playing'].includes(gameState);
    setShowRotationOverlay(!landscape && requiresLandscape);
  }, [gameState]); // Add gameState dependency

  useEffect(() => {
    // Check orientation on mount
    checkOrientation();

    // Attempt to lock orientation (best effort)
    const orientation = screen.orientation as any; // Cast to any here
    orientation?.lock?.('landscape').catch((err: Error) => {
      console.warn('Screen orientation lock failed:', err.message);
    });

    // Listen for changes
    window.addEventListener('resize', checkOrientation);
    if (screen.orientation) {
      screen.orientation.addEventListener('change', checkOrientation);
    }

    return () => {
      window.removeEventListener('resize', checkOrientation);
      if (screen.orientation) {
        screen.orientation.removeEventListener('change', checkOrientation);
      }
    };
  }, [checkOrientation]); // Dependency remains checkOrientation
  // --- End Orientation Logic ---

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

    // Play if we are on a menu, garage, or devlog screen
    if (gameState === 'menu' || gameState === 'modeSelection' || gameState === 'garage' || gameState === 'devlog') { 
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

  // Function to navigate to Dev Log
  const goToDevLog = () => {
    console.log("Going to Dev Log...");
    setGameState('devlog');
  };

  // Function to navigate back to the main menu (can be reused)
  const goToMenu = () => {
    console.log("Returning to Menu...");
    setGameState('menu'); 
  };

  const renderGameState = () => {
    switch (gameState) {
      case 'menu':
        // Pass fullscreen & mute props to Menu
        return <Menu 
                 onPlay={startGame} 
                 onQuit={quitGame} 
                 isFullscreen={isFullscreen} 
                 toggleFullscreen={toggleFullscreen} 
                 onGoToDevLog={goToDevLog}
                 isMuted={isMuted} // Pass mute state
                 toggleMute={toggleMute} // Pass mute function
               />;
      case 'modeSelection':
        // Pass orientation props
        return <ModeSelection 
                 onStartSinglePlayer={goToGarage} 
                 onBackToMenu={goToMenu} 
                 showRotationOverlay={showRotationOverlay}
               />;
      case 'garage':
        // Pass orientation props
        return <Garage 
                 onStartRace={startRace} 
                 onBackToMenu={goToMenu} 
                 showRotationOverlay={showRotationOverlay}
               />;
      case 'playing':
        // Pass fullscreen, mute & orientation props to Game
        return <Game 
                 onBackToMenu={goToMenu}
                 isFullscreen={isFullscreen} 
                 toggleFullscreen={toggleFullscreen} 
                 isMuted={isMuted}
                 toggleMute={toggleMute}
                 showRotationOverlay={showRotationOverlay} // Pass orientation prop
               />;
      case 'devlog':
        // Dev log does NOT need orientation check
        return <DevLog onBackToMenu={goToMenu} />;
      // case 'gameover':
      //   return <GameOver onRestart={startGame} onMenu={goToMenu} />;
      default:
        // Pass fullscreen & mute props to default Menu as well
        return <Menu 
                 onPlay={startGame} 
                 onQuit={quitGame} 
                 isFullscreen={isFullscreen} 
                 toggleFullscreen={toggleFullscreen} 
                 onGoToDevLog={goToDevLog}
                 isMuted={isMuted} // Pass mute state
                 toggleMute={toggleMute} // Pass mute function
               />; // Default to menu
    }
  };

  return <div className="App">{renderGameState()}</div>;
}

export default App; 