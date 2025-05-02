import React, { useState, useEffect, useCallback, useRef } from 'react';
import Background from './Background';
import MountainLayer from './MountainLayer';
import BuildingLayer from './BuildingLayer';
import SunLayer from './SunLayer';
import Road from './Road';
import PlayerCar from './PlayerCar';
// import LightingOverlay from './LightingOverlay'; // Removed
import './Game.css';

interface GameProps {
  onBackToMenu: () => void; // Function to go back to the menu
}

// Constants for parallax effect
const BASE_SCROLL_SPEED = 0; // Initial speed (will be linked to car speed later)
const BACKGROUND_SPEED_FACTOR = 0.3; // Background scrolls slower than the road
const MOUNTAIN_SPEED_FACTOR = 0.1; // Mountains scroll very slowly
const BUILDING_SPEED_FACTOR = 0.25; // Was 0.5 - Reduced speed
const SUN_SPEED_FACTOR = 0.05; // Sun scrolls very, very slowly
// const ROAD_TILE_WIDTH = 512; // Removed - Was for lighting overlay
const TRACK_LENGTH_PIXELS = 120000; // Define total track length here

const Game: React.FC<GameProps> = ({ onBackToMenu }) => {
  // State to manage the current scrolling speed (linked to car speed in the future)
  const [currentSpeed, setCurrentSpeed] = useState(BASE_SCROLL_SPEED);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLandscape, setIsLandscape] = useState(true); // Assume landscape initially
  const [showRotationOverlay, setShowRotationOverlay] = useState(false);

  // TODO: Add logic to update currentSpeed based on car acceleration/state

  // --- Fullscreen Logic --- 
  const checkFullscreenStatus = () => {
    setIsFullscreen(!!document.fullscreenElement);
  };

  useEffect(() => {
    document.addEventListener('fullscreenchange', checkFullscreenStatus);
    return () => document.removeEventListener('fullscreenchange', checkFullscreenStatus);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };
  
  // --- Orientation Logic --- 
  const checkOrientation = useCallback(() => {
    // Use screen.orientation if available, fallback to width/height ratio
    const landscape = 
      screen.orientation?.type?.includes('landscape') ?? 
      window.innerWidth > window.innerHeight;
    setIsLandscape(landscape);
    setShowRotationOverlay(!landscape);
  }, []);

  useEffect(() => {
    // Check orientation on mount
    checkOrientation();

    // Attempt to lock orientation (best effort)
    const orientation = screen.orientation as any; // Cast to any here
    orientation?.lock?.('landscape').catch((err: Error) => { 
      console.warn('Screen orientation lock failed:', err.message);
      // Locking might fail, rely on manual rotation + overlay
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
      // Optional: Unlock orientation on exit?
      // screen.orientation?.unlock?.(); 
    };
  }, [checkOrientation]);

  // --- Pause Logic ---
  const isPaused = showRotationOverlay; // Pause game if overlay is shown

  // Calculate speeds for different layers
  const roadScrollSpeed = currentSpeed;
  const backgroundScrollSpeed = currentSpeed * BACKGROUND_SPEED_FACTOR;
  const mountainScrollSpeed = currentSpeed * MOUNTAIN_SPEED_FACTOR; // Calculate mountain speed
  const buildingScrollSpeed = currentSpeed * BUILDING_SPEED_FACTOR; // Calculate building speed
  const sunScrollSpeed = currentSpeed * SUN_SPEED_FACTOR; // Calculate sun speed

  return (
    <div className="game-container">
      {/* Conditionally render rotation overlay */}
      {showRotationOverlay && (
        <div className="rotation-overlay">
          <p>Please rotate your device to landscape mode.</p>
        </div>
      )}

      {/* Layer 0: Background Gradient */}
      <Background scrollSpeed={backgroundScrollSpeed} isPaused={isPaused} />

      {/* Layer 1: Sun */}
      <SunLayer scrollSpeed={sunScrollSpeed} isPaused={isPaused} />

      {/* Layer 2: Mountains */}
      <MountainLayer scrollSpeed={mountainScrollSpeed} isPaused={isPaused} />

      {/* Layer 3: Building Glow */} 
      <BuildingLayer scrollSpeed={buildingScrollSpeed} isGlowLayer={true} isPaused={isPaused} />

      {/* Layer 4: Buildings (Main) */} 
      <BuildingLayer scrollSpeed={buildingScrollSpeed} isPaused={isPaused} />

      {/* Layer 5: Road */}
      <Road scrollSpeed={roadScrollSpeed} isPaused={isPaused} />

      {/* Layer 6: Road Overlay */}
      {/* The ::before pseudo-element is styled in Road.css */} 

      {/* Layer 100: Player Car */} 
      <PlayerCar currentSpeed={currentSpeed} />

      {/* Layer 10: UI Overlay (Note: Car z-index is higher) */}
      <div className="game-overlay">
        {/* Temporary: Display game status or score */}
        <p>Game Running... (Speed: {currentSpeed.toFixed(0)})</p>
        {/* Temp buttons to test speed change */} 
        <button onClick={() => setCurrentSpeed(prev => prev + 50)}>Accelerate</button>
        <button onClick={() => setCurrentSpeed(prev => Math.max(0, prev - 50))}>Decelerate</button>
        <button onClick={toggleFullscreen} style={{marginLeft: '10px'}}>
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
        <button onClick={onBackToMenu} style={{marginLeft: '10px'}}>Back to Menu</button>
      </div>
    </div>
  );
};

export default Game; 