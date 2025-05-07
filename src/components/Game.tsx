import React, { useState, useEffect, useCallback, useRef, CSSProperties } from 'react';
import Background from './Background';
import MountainLayer from './MountainLayer';
import BuildingLayer from './BuildingLayer';
import SunLayer from './SunLayer';
import Road from './Road';
import PlayerCar from './PlayerCar';
import OpponentCar from './OpponentCar';
import FinishLine from './FinishLine';
// import LightingOverlay from './LightingOverlay'; // Removed
import './Game.css';

// Assuming sounds are in public/assets/
const IDLE_SOUND_SRC = '/assets/idlesound.mp3';
const RACE_SOUND_SRC = '/assets/racesound.mp3';

interface GameProps {
  onBackToMenu: () => void; // Function to go back to the menu
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  isMuted: boolean; // Add prop
  toggleMute: () => void; // Add prop
  showRotationOverlay: boolean; // Add prop
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

// Define constants for physics
const ACCELERATION_RATE = 150; // Player acceleration rate (Increased from 120)
const DECELERATION_RATE = ACCELERATION_RATE / 3; 
const ENGINE_OFF_DECELERATION_RATE = ACCELERATION_RATE; 
const BRAKING_RATE = ACCELERATION_RATE * 2; 
const MAX_SPEED = 1200; // Player max speed
const OPPONENT_MAX_SPEED = 1400; 
const OPPONENT_ACCELERATION_RATE_SIMPLE = ACCELERATION_RATE * 0.8; // Opponent accelerates 20% slower than player (was 0.9)
const RACE_DISTANCE_PIXELS = 20000; // Define race length

const Game: React.FC<GameProps> = ({ 
  onBackToMenu,
  isFullscreen,
  toggleFullscreen,
  isMuted, // Destructure prop
  toggleMute, // Destructure prop
  showRotationOverlay // Destructure prop
}) => {
  // State to manage the player's current scrolling speed
  const [currentSpeed, setCurrentSpeed] = useState(BASE_SCROLL_SPEED);
  const [isEngineOn, setIsEngineOn] = useState(false); // Engine state, starts OFF
  const [isAccelerating, setIsAccelerating] = useState(false); // State for acceleration button press
  const [isBraking, setIsBraking] = useState(false); // State for braking button press
  const [scrollPos, setScrollPos] = useState(0); // State for main scroll position (Road)

  // Opponent State
  const [opponentCurrentSpeed, setOpponentCurrentSpeed] = useState(BASE_SCROLL_SPEED); 
  const [targetRelativeDistance, setTargetRelativeDistance] = useState(0); // Target offset based on physics (used for lerping visual offset)
  const [opponentVisualOffsetX, setOpponentVisualOffsetX] = useState(0); // Smoothed visual offset
  const [opponentScrollPos, setOpponentScrollPos] = useState(0); // Track opponent's absolute scroll position

  // Race State
  const [countdown, setCountdown] = useState<number | null>(null); // 3, 2, 1, null
  const [raceStarted, setRaceStarted] = useState(false);
  type RaceOutcome = 'win' | 'lose' | null;
  const [raceOutcome, setRaceOutcome] = useState<RaceOutcome>(null); // Track win/loss

  // --- Pause Logic ---
  const isPaused = showRotationOverlay; // Pause game if overlay is shown

  // Audio state Refs
  const idleAudioRef1 = useRef<HTMLAudioElement | null>(null);
  const idleAudioRef2 = useRef<HTMLAudioElement | null>(null);
  const raceAudioRef = useRef<HTMLAudioElement | null>(null);
  const idleStartTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref for the 2-second delay timeout
  const [raceSoundPlayed, setRaceSoundPlayed] = useState(false); // Track if race sound played in current high-speed phase
  const lastFrameTimeRef = useRef<number | null>(null); // Ref for game loop timing
  const animationFrameIdRef = useRef<number | null>(null); // Ref for animation frame ID
  const scrollPosRef = useRef<number>(0); // Ref to hold current scrollPos for interval

  // --- Burger Menu State ---
  const [isBurgerMenuOpen, setIsBurgerMenuOpen] = useState(false); // State for burger menu

  // --- Toggle Burger Menu --- 
  const toggleBurgerMenu = () => {
    setIsBurgerMenuOpen(prev => !prev);
  };

  // --- Toggle Engine Function ---
  const toggleEngine = () => {
    if (isEngineOn && currentSpeed > 0) {
      console.warn("Cannot turn off engine while moving.");
      return;
    }
    const turningOn = !isEngineOn;
    setIsEngineOn(turningOn);

    if (turningOn) {
        // Reset race state and start countdown when turning engine ON
        setRaceStarted(false);
        setCountdown(3); 
        // Reset speeds and positions?
        setCurrentSpeed(0);
        setOpponentCurrentSpeed(0);
        setTargetRelativeDistance(0);
        setOpponentVisualOffsetX(0);
        setScrollPos(0); // Reset background scroll too
        setOpponentScrollPos(0); // Reset opponent scroll position
        setRaceOutcome(null); // Reset race outcome
    } else {
        // If turning off, cancel countdown
        setCountdown(null);
        setRaceStarted(false); // Ensure race stops if engine turned off
        setRaceOutcome(null); // Reset race outcome
    }
  };

  // --- Audio Loading ---
  useEffect(() => {
    // Preload audio files
    idleAudioRef1.current = new Audio(IDLE_SOUND_SRC);
    idleAudioRef1.current.loop = true; // Loop this instance
    idleAudioRef1.current.volume = 1.0; // Set volume to max
    idleAudioRef2.current = new Audio(IDLE_SOUND_SRC); // Second instance
    idleAudioRef2.current.loop = true; // Loop this instance too
    idleAudioRef2.current.volume = 1.0; // Set volume to max
    raceAudioRef.current = new Audio(RACE_SOUND_SRC);
    raceAudioRef.current.loop = false;
    raceAudioRef.current.volume = 1.0; // Set volume to max

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
    if (isPaused || !idleAudio1 || !idleAudio2 || !raceAudio) {
      idleAudio1?.pause();
      idleAudio2?.pause();
      raceAudio?.pause();
      return; // Stop further processing
    }

    // Apply App.tsx mute state (needed if sounds are managed here)
    if(idleAudio1) idleAudio1.muted = isMuted;
    if(idleAudio2) idleAudio2.muted = isMuted;
    if(raceAudio) raceAudio.muted = isMuted;

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
               if (isEngineOn && !isPaused && currentSpeed < 110) { // Re-check state
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
  }, [currentSpeed, isPaused, isEngineOn, raceSoundPlayed, isMuted]);

  // --- Countdown Timer Logic ---
  useEffect(() => {
      if (countdown === null || countdown <= 0) {
          return; // No countdown active or finished
      }

      const timerId = setTimeout(() => {
          setCountdown(prev => (prev !== null ? prev - 1 : null));
      }, 1000); // 1 second interval

      // Cleanup timeout if countdown changes or component unmounts
      return () => clearTimeout(timerId);
  }, [countdown]);

  // --- Start Race Effect ---
  useEffect(() => {
      if (countdown === 0) {
          console.log("Race START!"); // Debug log
          setRaceStarted(true);
          setCountdown(null); // Clear countdown display
      }
  }, [countdown]);

  // --- Distance Logging Timer ---
  useEffect(() => {
    // Only set up interval when the engine is on
    if (!isEngineOn) {
        return;
    }

    console.log('Starting distance log interval...'); // Debug log
    const logInterval = setInterval(() => {
        // Access current scrollPos via ref
        const distanceTraveled = Math.abs(scrollPosRef.current);
        console.log(`Distance Traveled: ${distanceTraveled.toFixed(0)} pixels`);
    }, 2000); 

    // Cleanup interval on component unmount or when engine turns off
    return () => {
        console.log('Clearing distance log interval.'); // Debug log
        clearInterval(logInterval);
    };

  }, [isEngineOn]); // Only depend on engine state to setup/cleanup interval

  // --- Game Loop for Speed and Scroll Position Update --- 
  useEffect(() => {
    const gameLoop = (timestamp: number) => {
      if (lastFrameTimeRef.current === null) {
        lastFrameTimeRef.current = timestamp; // Initialize on first frame
        animationFrameIdRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      const deltaTime = (timestamp - lastFrameTimeRef.current) / 1000; // Time delta in seconds
      lastFrameTimeRef.current = timestamp;

      let updatedSpeed = currentSpeed; 
      let updatedOpponentSpeed = opponentCurrentSpeed;

      if (!isPaused) { 
        let speedChange = 0;
        if (isBraking) { 
            speedChange = -BRAKING_RATE * deltaTime;
        } else if (isEngineOn) { 
          if (isAccelerating) {
            speedChange = ACCELERATION_RATE * deltaTime;
          } else {
            speedChange = -DECELERATION_RATE * deltaTime;
          }
        } else { 
          speedChange = -ENGINE_OFF_DECELERATION_RATE * deltaTime;
        }
        setCurrentSpeed(prevSpeed => {
          const newSpeed = prevSpeed + speedChange;
          updatedSpeed = Math.max(0, Math.min(newSpeed, MAX_SPEED));
          return updatedSpeed;
        });

        // --- Player Scroll Position Update ---
        if (updatedSpeed > 0 || speedChange !== 0) { 
          setScrollPos(prevPos => prevPos - updatedSpeed * deltaTime); 
        }

        // --- Opponent Scroll Position Update ---
        if (updatedOpponentSpeed > 0) {
          setOpponentScrollPos(prevPos => prevPos - updatedOpponentSpeed * deltaTime);
        }

        // --- Opponent Speed Update Logic --- 
        setOpponentCurrentSpeed(prevOpponentSpeed => {
            let newOpponentSpeed = prevOpponentSpeed;

            // Opponent accelerates only if engine is on AND race has started
            if (isEngineOn && raceStarted) { 
                const opponentSpeedChange = OPPONENT_ACCELERATION_RATE_SIMPLE * deltaTime;
                newOpponentSpeed += opponentSpeedChange;
            } else if (!isEngineOn) { // Ensure opponent stops if engine is turned off 
                newOpponentSpeed = 0;
            } 
            // (Else: Engine is on but race hasn't started - speed stays the same or decelerates? 
            //  Let's keep it simple: speed only increases if raceStarted)

            const finalOpponentSpeed = Math.max(0, Math.min(newOpponentSpeed, OPPONENT_MAX_SPEED));
            updatedOpponentSpeed = finalOpponentSpeed; 
            return finalOpponentSpeed;
        });

        // --- Target Relative Distance Update ---
        const speedDifference = updatedOpponentSpeed - updatedSpeed;
        setTargetRelativeDistance(prevTarget => prevTarget + speedDifference * deltaTime);

        // --- Smoothed Visual Offset Update (Lerp) ---
        const LERP_FACTOR = 0.1; // Adjust for more/less smoothing (lower = smoother, slower)
        setOpponentVisualOffsetX(prevVisualOffset => 
             prevVisualOffset + (targetRelativeDistance - prevVisualOffset) * LERP_FACTOR
        );
        // Note: Using LERP_FACTOR directly is frame-rate dependent smoothing.
        // For frame-rate independence: adjustFactor = 1 - Math.exp(-deltaTime * SMOOTHING_CONSTANT)
        // Example: const SMOOTHING = 5; const lerpFactor = 1 - Math.exp(-deltaTime * SMOOTHING);

        // --- Check Race Finish Condition ---
        if (raceOutcome === null) { // Only check if race hasn't already ended
            const playerDistance = Math.abs(scrollPos); // Use current state value
            const opponentDistance = Math.abs(opponentScrollPos); // Use the opponent's absolute scroll position

            if (playerDistance >= RACE_DISTANCE_PIXELS && opponentDistance < RACE_DISTANCE_PIXELS) {
                console.log("Player Wins!");
                setRaceOutcome('win');
                setRaceStarted(false); // Stop further race logic/opponent accel
                setIsBraking(true); // Apply player brakes
                setIsAccelerating(false); // Stop player acceleration
            } else if (opponentDistance >= RACE_DISTANCE_PIXELS && playerDistance < RACE_DISTANCE_PIXELS) {
                console.log("Opponent Wins!");
                setRaceOutcome('lose');
                setRaceStarted(false); // Stop further race logic
                setIsBraking(true); // Apply player brakes
                setIsAccelerating(false); // Stop player acceleration
            }
        }

      }
      animationFrameIdRef.current = requestAnimationFrame(gameLoop);
    };

    // Start the loop
    animationFrameIdRef.current = requestAnimationFrame(gameLoop);

    // Cleanup function: cancel the animation frame when component unmounts or dependencies change
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      lastFrameTimeRef.current = null; // Reset ref
    };
  // isAccelerating and isBraking are derived from events, not needed as dependency directly
  // isEngineOn, isPaused trigger state updates which cause re-render anyway,
  // but including them ensures loop logic always has latest state if needed for complex conditions.
  }, [isEngineOn, isPaused, isAccelerating, isBraking, targetRelativeDistance, scrollPos, raceOutcome]); // Add targetRelativeDistance dependency for lerp

  // --- Event Handlers for Acceleration --- 
  const handleAccelerationStart = () => {
      if (isEngineOn && !isPaused) { // Only accelerate if engine on and not paused
          setIsAccelerating(true);
      }
  };

  const handleAccelerationEnd = () => {
      setIsAccelerating(false);
  };

  // --- Event Handlers for Braking --- 
  const handleBrakeStart = () => {
      // Allow braking even if engine is off, but not if paused
      if (!isPaused) {
          setIsBraking(true);
      }
  };

  const handleBrakeEnd = () => {
      setIsBraking(false);
  };

  // Calculate background positions for layers based on scrollPos
  const roadBgPosition = `${scrollPos}px 0%`;
  const backgroundBgPosition = `${scrollPos * BACKGROUND_SPEED_FACTOR}px 0%`;
  const mountainBgPosition = `${scrollPos * MOUNTAIN_SPEED_FACTOR}px 0%`;
  const buildingBgPosition = `${scrollPos * BUILDING_SPEED_FACTOR}px 0%`;
  // Sun uses transform, so calculate the X offset
  const sunTranslateX = scrollPos * SUN_SPEED_FACTOR;

  // Use the SMOOTHED opponentVisualOffsetX for the transform
  const relativeOpponentX = opponentVisualOffsetX;

  // Calculate finish line position relative to viewport
  // Starts at RACE_DISTANCE + scrollPos (which is negative)
  const finishLineLeft = RACE_DISTANCE_PIXELS + scrollPos;

  // --- Keep scrollPosRef updated ---
  useEffect(() => {
    scrollPosRef.current = scrollPos;
  }, [scrollPos]);

  return (
    <div className="game-container">
      {/* Conditionally render rotation overlay */}
      {showRotationOverlay && (
        <div className="rotation-overlay">
          <p>Please rotate your device to landscape mode.</p>
        </div>
      )}

      {/* Conditionally render countdown */} 
      {countdown !== null && countdown > 0 && (
          <div className="countdown-display">{countdown}</div>
      )}
      {countdown === 0 && (
          <div className="countdown-display go">GO!</div>
      ) }

      {/* Conditionally render race outcome */} 
      {raceOutcome === 'win' && (
          <div className="race-outcome win">YOU WIN!</div>
      )}
      {raceOutcome === 'lose' && (
          <div className="race-outcome lose">ENEMY WINS!</div>
      )}

      {/* Layer 0: Background Gradient */}
      <Background bgPositionX={backgroundBgPosition} />

      {/* Layer 1: Sun */}
      <SunLayer translateX={sunTranslateX} />

      {/* Layer 2: Mountains */}
      <MountainLayer bgPositionX={mountainBgPosition} />

      {/* Layer 3: Building Glow */}
      <BuildingLayer bgPositionX={buildingBgPosition} isGlowLayer={true} />

      {/* Layer 4: Buildings (Main) */}
      <BuildingLayer bgPositionX={buildingBgPosition} />

      {/* Layer 5: Road */}
      <Road bgPositionX={roadBgPosition} />

      {/* Render finish line if it's potentially visible */} 
      {finishLineLeft > -50 && finishLineLeft < window.innerWidth + 50 && (
         <FinishLine leftPosition={finishLineLeft} />
      )}

      {/* Layer 100: Player Car */}
      <PlayerCar currentSpeed={currentSpeed} isEngineOn={isEngineOn} isPaused={isPaused} />

      {/* Layer 99: Opponent Car */}
      <OpponentCar 
        opponentSpeed={opponentCurrentSpeed} 
        relativeX={relativeOpponentX} // Pass the calculated visual offset
        isEngineOn={isEngineOn} 
        isPaused={isPaused} 
      />

      {/* --- Game Controls (Individual Pedals) --- */}

      {/* Clutch Pedal Image Button (Placeholder) */}
      <img 
        src="/assets/gaspedal.png" // Using same image for now
        alt="Clutch"
        className="game-control-pedal clutch-pedal disabled" // Placeholder - always disabled for now
        onClick={() => console.log("Clutch pressed - Not implemented")}
        onDragStart={(e) => e.preventDefault()} 
        onContextMenu={(e) => e.preventDefault()} // Prevent context menu on long press
      />
        
      {/* Gas Pedal Image Button */}
      <img 
        src="/assets/gaspedal.png"
        alt="Accelerate"
        className={`game-control-pedal accelerate-pedal ${(!isEngineOn || isPaused || isBraking) ? 'disabled' : ''}`.trim()} 
        onMouseDown={handleAccelerationStart}
        onMouseUp={handleAccelerationEnd}
        onMouseLeave={handleAccelerationEnd} 
        onTouchStart={handleAccelerationStart} 
        onTouchEnd={handleAccelerationEnd}
        onDragStart={(e) => e.preventDefault()} 
        onContextMenu={(e) => e.preventDefault()} // Prevent context menu on long press
      />

      {/* Brake Pedal Image Button */}
      <img 
        src="/assets/gaspedal.png" // Using same image for now
        alt="Brake"
        className={`game-control-pedal brake-pedal ${isPaused ? 'disabled' : ''}`.trim()} 
        onMouseDown={handleBrakeStart}
        onMouseUp={handleBrakeEnd}
        onMouseLeave={handleBrakeEnd}
        onTouchStart={handleBrakeStart}
        onTouchEnd={handleBrakeEnd}
        onDragStart={(e) => e.preventDefault()} 
        onContextMenu={(e) => e.preventDefault()} // Prevent context menu on long press
      />

      {/* --- Burger Menu Button --- */}
      <button onClick={toggleBurgerMenu} className="burger-menu-button">
        &#9776; {/* Unicode Burger Icon */}
      </button>

      {/* --- Burger Dropdown Menu --- */}
      {isBurgerMenuOpen && (
        <div className="burger-dropdown-menu">
          <button onClick={toggleFullscreen} className="menu-button dropdown-button">
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
          <button onClick={toggleMute} className="menu-button dropdown-button">
            {isMuted ? 'Unmute' : 'Mute'}
          </button>
          <button onClick={onBackToMenu} className="menu-button dropdown-button">
            Back to Menu
          </button>
        </div>
      )}

      {/* Layer 10: UI Overlay (Info only) */}
      <div className="game-overlay grid-overlay">
        {/* Row 1: Speed */} 
        <div className="overlay-row">
          <span>Player Speed: {(currentSpeed / 10).toFixed(0)}</span>
          <span className="separator">|</span>
          <span>Opponent Speed: {(opponentCurrentSpeed / 10).toFixed(0)}</span>
        </div>

        {/* Row 2: Gear */} 
        <div className="overlay-row">
          <span>Player Gear: 1</span>
          <span className="separator">|</span>
          <span>Opponent Gear: 1</span>
        </div>

        {/* Row 3: Distance */} 
        <div className="overlay-row">
          <span>Player Distance: {Math.abs(scrollPos).toFixed(0)} px</span>
          <span className="separator">|</span>
          <span>Opponent Distance: {Math.abs(opponentScrollPos).toFixed(0)} px</span>
        </div>
      </div>

      {/* --- Start Engine Prompt & Button (Conditionally Rendered) --- */}
      {!isEngineOn && (
        <div className="start-engine-container">
          <p className="start-engine-prompt">Start your engine to begin</p>
          <button 
            className="start-engine-button" 
            onClick={toggleEngine} 
            aria-label="Start Engine"
          >
            <div className="start-button-circle">
              <div className="start-button-line"></div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default Game; 