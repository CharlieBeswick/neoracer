import React, { useState, useEffect, useCallback, useRef } from 'react';
import Background from './Background';
import MountainLayer from './MountainLayer';
import BuildingLayer from './BuildingLayer';
import SunLayer from './SunLayer';
import Road from './Road';
import PlayerCar from './PlayerCar';
import OpponentCar from './OpponentCar';
// import LightingOverlay from './LightingOverlay'; // Removed
import './Game.css';

// Assuming sounds are in public/assets/
const IDLE_SOUND_SRC = '/assets/idlesound.mp3';
const RACE_SOUND_SRC = '/assets/racesound - 1746226597946.mp3';

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
const OPPONENT_TARGET_SPEED = 150; // Example: Define opponent's eventual target speed

const Game: React.FC<GameProps> = ({ onBackToMenu }) => {
  // State to manage the player's current scrolling speed
  const [currentSpeed, setCurrentSpeed] = useState(BASE_SCROLL_SPEED);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLandscape, setIsLandscape] = useState(true); // Assume landscape initially
  const [showRotationOverlay, setShowRotationOverlay] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // Mute state
  const [isEngineOn, setIsEngineOn] = useState(false); // Engine state, starts OFF

  // --- Pause Logic ---
  const isPaused = showRotationOverlay; // Pause game if overlay is shown

  // Audio state Refs
  const idleAudioRef1 = useRef<HTMLAudioElement | null>(null);
  const idleAudioRef2 = useRef<HTMLAudioElement | null>(null);
  const raceAudioRef = useRef<HTMLAudioElement | null>(null);
  const idleStartTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref for the 2-second delay timeout
  const [raceSoundPlayed, setRaceSoundPlayed] = useState(false); // Track if race sound played in current high-speed phase

  // --- Toggle Mute Function ---
  const toggleMute = () => {
    setIsMuted(prevMuted => !prevMuted);
  };

  // --- Toggle Engine Function ---
  const toggleEngine = () => {
    // Prevent turning off if moving
    if (isEngineOn && currentSpeed > 0) {
      console.warn("Cannot turn off engine while moving.");
      // Optionally provide user feedback here (e.g., visual cue)
      return;
    }
    setIsEngineOn(prev => !prev);
  };

  // --- Audio Loading ---
  useEffect(() => {
    // Preload audio files
    idleAudioRef1.current = new Audio(IDLE_SOUND_SRC);
    idleAudioRef1.current.loop = true; // Loop this instance
    idleAudioRef2.current = new Audio(IDLE_SOUND_SRC); // Second instance
    idleAudioRef2.current.loop = true; // Loop this instance too
    raceAudioRef.current = new Audio(RACE_SOUND_SRC);
    raceAudioRef.current.loop = false;

    // Cleanup audio elements on component unmount
    return () => {
      if (idleStartTimeoutRef.current) {
        clearTimeout(idleStartTimeoutRef.current); // Clear timeout on unmount
      }
      idleAudioRef1.current?.pause();
      idleAudioRef2.current?.pause();
      raceAudioRef.current?.pause();
      idleAudioRef1.current = null;
      idleAudioRef2.current = null;
      raceAudioRef.current = null;
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // --- Audio Playback Logic ---
  useEffect(() => {
    const idleAudio1 = idleAudioRef1.current;
    const idleAudio2 = idleAudioRef2.current;
    const raceAudio = raceAudioRef.current;

    // --- Clear previous timeout ---
    if (idleStartTimeoutRef.current) {
        clearTimeout(idleStartTimeoutRef.current);
        idleStartTimeoutRef.current = null;
    }

    // --- Handle Paused/Muted/AudioNotReady State ---
    if (isMuted || isPaused || !idleAudio1 || !idleAudio2 || !raceAudio) {
      idleAudio1?.pause();
      idleAudio2?.pause();
      raceAudio?.pause();
      return; // Stop further processing
    }

    // --- Handle Engine OFF State ---
    if (!isEngineOn) {
      idleAudio1.pause();
      idleAudio2.pause();
      // Ensure race sound is also stopped/reset if engine turns off mid-race sound?
      // Optional: raceAudio.pause(); raceAudio.currentTime = 0; setRaceSoundPlayed(false);
      return; // Stop further processing
    }

    // --- Handle Engine ON State (and Speed Interaction) ---
    if (currentSpeed < 110) {
      // LOW SPEED & ENGINE ON

      // Stop race sound if it was playing
      if (raceAudio.currentTime > 0 && !raceAudio.paused) {
        raceAudio.pause();
        raceAudio.currentTime = 0; // Reset race sound
      }
      setRaceSoundPlayed(false); // Reset race sound flag

      // Play first idle sound if not already playing
      if (idleAudio1.paused) {
        idleAudio1.play().catch(e => console.warn("Idle audio 1 play failed:", e));
      }

      // Schedule or play second idle sound
      if (idleAudio2.paused) {
          // Check if it has ever been played - simple check
          // A more robust way might involve tracking if the timeout completed
          if (idleAudio2.currentTime === 0) {
             // Schedule it for the first time
             idleStartTimeoutRef.current = setTimeout(() => {
               if (isEngineOn && !isPaused && !isMuted && currentSpeed < 110) { // Re-check state
                   idleAudio2.play().catch(e => console.warn("Idle audio 2 play failed:", e));
               }
               idleStartTimeoutRef.current = null;
             }, 2000); // 2-second delay
          } else {
             // If it was paused previously (e.g., speed went high), resume it
             idleAudio2.play().catch(e => console.warn("Idle audio 2 resume failed:", e));
          }
      }

    } else {
      // HIGH SPEED & ENGINE ON

      // Stop both idle sounds
      if (!idleAudio1.paused) {
        idleAudio1.pause();
      }
      if (!idleAudio2.paused) {
        idleAudio2.pause();
      }
      // Clear timeout if speed increases before 2s delay finishes
      if (idleStartTimeoutRef.current) {
        clearTimeout(idleStartTimeoutRef.current);
        idleStartTimeoutRef.current = null;
      }


      // Play race sound (once)
      if (!raceSoundPlayed && raceAudio.paused) {
        raceAudio.play().catch(e => console.warn("Race audio play failed:", e));
        setRaceSoundPlayed(true); // Set flag
      }
    }

    // Add all relevant dependencies
  }, [currentSpeed, isPaused, isMuted, isEngineOn, raceSoundPlayed]);


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


  // Calculate speeds for different layers
  const roadScrollSpeed = currentSpeed;
  const backgroundScrollSpeed = currentSpeed * BACKGROUND_SPEED_FACTOR;
  const mountainScrollSpeed = currentSpeed * MOUNTAIN_SPEED_FACTOR; // Calculate mountain speed
  const buildingScrollSpeed = currentSpeed * BUILDING_SPEED_FACTOR; // Calculate building speed
  const sunScrollSpeed = currentSpeed * SUN_SPEED_FACTOR; // Calculate sun speed

  // --- Handle Accelerate ---
  const handleAccelerate = () => {
    if (isEngineOn) { // Only accelerate if engine is on
        setCurrentSpeed(prev => prev + 50);
    } else {
        console.log("Engine is off, cannot accelerate.");
        // Optional: visual feedback
    }
  };

  // --- Handle Decelerate ---
  const handleDecelerate = () => {
      setCurrentSpeed(prev => Math.max(0, prev - 50));
  };

  // --- Calculate Derived Opponent Speed --- 
  // Opponent speed is set to 90% of the player's current speed.
  const opponentSpeed = Math.max(0, currentSpeed * 0.9); 

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

      {/* Layer 99: Opponent Car */}
      <OpponentCar opponentSpeed={opponentSpeed} />

      {/* Layer 10: UI Overlay (Note: Car z-index is higher) */}
      <div className="game-overlay">
        {/* Temporary: Display game status or score */}
        <p>Game Running... (Speed: {currentSpeed.toFixed(0)}) Engine: {isEngineOn ? 'ON' : 'OFF'}</p>
        {/* Control buttons */}
        <button onClick={handleAccelerate} disabled={!isEngineOn}>Accelerate</button> {/* Disable button if engine off */}
        <button onClick={handleDecelerate}>Decelerate</button>
        <button onClick={toggleEngine} disabled={isEngineOn && currentSpeed > 0}> {/* Disable turning off if moving */}
            {isEngineOn ? 'Engine Stop' : 'Engine Start'}
        </button>
        <button onClick={toggleFullscreen} style={{marginLeft: '10px'}}>
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
        <button onClick={toggleMute} style={{marginLeft: '10px'}}>
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
        <button onClick={onBackToMenu} style={{marginLeft: '10px'}}>Back to Menu</button>
      </div>
    </div>
  );
};

export default Game; 