import React, { useState } from 'react';
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

  // TODO: Add logic to update currentSpeed based on car acceleration/state

  // Calculate speeds for different layers
  const roadScrollSpeed = currentSpeed;
  const backgroundScrollSpeed = currentSpeed * BACKGROUND_SPEED_FACTOR;
  const mountainScrollSpeed = currentSpeed * MOUNTAIN_SPEED_FACTOR; // Calculate mountain speed
  const buildingScrollSpeed = currentSpeed * BUILDING_SPEED_FACTOR; // Calculate building speed
  const sunScrollSpeed = currentSpeed * SUN_SPEED_FACTOR; // Calculate sun speed

  return (
    <div className="game-container">
      {/* Layer 0: Background Gradient */}
      <Background scrollSpeed={backgroundScrollSpeed} />

      {/* Layer 1: Sun */}
      <SunLayer scrollSpeed={sunScrollSpeed} />

      {/* Layer 2: Mountains */}
      <MountainLayer scrollSpeed={mountainScrollSpeed} />

      {/* Layer 3: Building Glow */} 
      <BuildingLayer scrollSpeed={buildingScrollSpeed} isGlowLayer={true} />

      {/* Layer 4: Buildings (Main) */} 
      <BuildingLayer scrollSpeed={buildingScrollSpeed} />

      {/* Layer 5: Road */}
      <Road scrollSpeed={roadScrollSpeed} />

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
        <button onClick={onBackToMenu} style={{marginLeft: '10px'}}>Back to Menu</button>
      </div>
    </div>
  );
};

export default Game; 