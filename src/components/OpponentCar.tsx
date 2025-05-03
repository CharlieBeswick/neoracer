import React, { CSSProperties } from 'react';
import ParticleEmitter from './ParticleEmitter'; // Import ParticleEmitter
import IdleParticleEmitter from './IdleParticleEmitter'; // Import Idle Emitter
import HeadlightGlow from './HeadlightGlow'; // Import HeadlightGlow
// Note: Opponent car doesn't need HeadlightGlow for now
// import HeadlightGlow from './HeadlightGlow'; 
import './OpponentCar.css'; // Use a separate CSS file

interface OpponentCarProps {
  opponentSpeed: number; // Use a specific prop name
  relativeX: number; // Add prop for relative horizontal offset
  isEngineOn: boolean; // Add engine state prop
  isPaused?: boolean; // Add isPaused prop
}

// Keep tyre image consistent for now
const TYRE_IMAGE_SRC = '/assets/tyre1.png'; 
const OPPONENT_CAR_BODY_SRC = '/assets/orangecar1nowheels.png'; // Use the orange car

// --- Define interface allowing custom properties ---
interface StyleWithCustomProps extends CSSProperties {
  '--trail-width'?: string;
  '--trail-opacity'?: string;
}

const OpponentCar: React.FC<OpponentCarProps> = ({ opponentSpeed, relativeX, isEngineOn, isPaused = false }) => {
  // Opponent car might not need centering logic, remove if not needed
  // const [isCentered, setIsCentered] = useState(false);
  // useEffect(() => { ... centering logic }, [opponentSpeed]);

  // Apply opponent-specific class
  const carClassName = `opponent-car`; 

  // Calculate animation duration based on opponent speed
  const wheelAnimationDuration = opponentSpeed > 5 ? Math.max(0.05, 1 / (opponentSpeed * 0.05)) : 0;
  const wheelAnimationStyle = {
    animationDuration: wheelAnimationDuration > 0 ? `${wheelAnimationDuration}s` : 'none',
    animationPlayState: wheelAnimationDuration > 0 ? 'running' : 'paused',
    backgroundImage: `url(${TYRE_IMAGE_SRC})` // Ensure tyre image is set
  };

  const carBodyStyle = {
    backgroundImage: `url(${OPPONENT_CAR_BODY_SRC})`
  };

  // --- Calculate Trail Style (Reusing logic) --- 
  const calculateTrailStyle = (speed: number): StyleWithCustomProps => { // Use extended interface
    const minSpeedForTrail = 20;
    if (speed < minSpeedForTrail) {
      return { 
          '--trail-width': '0px', 
          '--trail-opacity': '0' 
      }; // No trail at low speed
    }
    const trailWidth = Math.min(250, speed * 1.0); 
    const trailOpacity = Math.max(0.2, 0.7 - speed * 0.0015); 

    return {
      '--trail-width': `${trailWidth}px`,
      '--trail-opacity': `${trailOpacity}`,
    };
  };

  const rearLightSourceStyle = calculateTrailStyle(opponentSpeed);
  const engineOffClass = !isEngineOn ? 'engine-off' : '';

  // Apply dynamic position using transform: translateX()
  // Base position (left: 14%) comes from OpponentCar.css
  const carPositionStyle = {
      transform: `translateX(${relativeX}px)`,
      // Ensure left isn't set inline, use CSS default
      left: undefined, 
  };

  return (
    // Apply positioning style and background style
    <div className={carClassName} style={{ ...carPositionStyle, ...carBodyStyle }}>
      {/* Front Lights */}
      <HeadlightGlow beamClassName={`headlight-glow ${engineOffClass}`.trim()} /> 
      <div className={`headlight-source ${engineOffClass}`.trim()}></div>

      {/* Rear Lights (Source Only) */}
      {/* <HeadlightGlow beamClassName="rear-light-glow" /> REMOVED */}
      <div className={`rear-light-source ${engineOffClass}`.trim()} style={rearLightSourceStyle}></div> {/* Rear Source with Trail */}

      {/* Wrap ParticleEmitter in a div for specific styling */}
      <div className="opponent-particle-wrapper">
        <ParticleEmitter carSpeed={opponentSpeed} isPaused={isPaused} />
        <IdleParticleEmitter carSpeed={opponentSpeed} isEngineOn={isEngineOn} isPaused={isPaused} />
      </div>
      <div className="rear-wheel" style={wheelAnimationStyle}></div>
      <div className="front-wheel" style={wheelAnimationStyle}></div>
    </div>
  );
};

export default OpponentCar; 