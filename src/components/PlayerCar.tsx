import React, { useState, useEffect, CSSProperties } from 'react';
import ParticleEmitter from './ParticleEmitter';
import IdleParticleEmitter from './IdleParticleEmitter';
import HeadlightGlow from './HeadlightGlow';
import './PlayerCar.css';

interface PlayerCarProps {
  currentSpeed: number;
  isEngineOn: boolean;
  isPaused?: boolean;
}

const PlayerCar: React.FC<PlayerCarProps> = ({ currentSpeed, isEngineOn, isPaused = false }) => {
  const [isCentered, setIsCentered] = useState(false);

  useEffect(() => {
    // Center the car once the player starts accelerating
    if (currentSpeed > 0 && !isCentered) {
      setIsCentered(true);
    }
    // Optional: Reset if speed goes back to 0? 
    // else if (currentSpeed === 0 && isCentered) {
    //   setIsCentered(false);
    // }
  }, [currentSpeed, isCentered]);

  const carClassName = `player-car ${isCentered ? 'centered' : ''}`.trim();

  // Calculate animation duration based on speed
  // Lower duration = faster spin. Pause if speed is very low.
  const wheelAnimationDuration = currentSpeed > 5 ? Math.max(0.05, 1 / (currentSpeed * 0.05)) : 0;
  const wheelAnimationStyle = {
    animationDuration: wheelAnimationDuration > 0 ? `${wheelAnimationDuration}s` : 'none',
    animationPlayState: wheelAnimationDuration > 0 ? 'running' : 'paused',
  };

  // --- Define interface allowing custom properties ---
  interface StyleWithCustomProps extends CSSProperties {
    '--trail-width'?: string;
    '--trail-opacity'?: string;
  }

  // --- Calculate Trail Style --- 
  const calculateTrailStyle = (speed: number): StyleWithCustomProps => {
    const minSpeedForTrail = 20;
    if (speed < minSpeedForTrail) {
      return { 
          '--trail-width': '0px', 
          '--trail-opacity': '0' 
      }; // No trail at low speed
    }
    // Increase width with speed. Adjust factors as needed.
    const trailWidth = Math.min(250, speed * 1.0); // Trail gets longer, max 250px
    const trailOpacity = Math.max(0.2, 0.7 - speed * 0.0015); // Fade slightly at high speed

    return {
      '--trail-width': `${trailWidth}px`,
      '--trail-opacity': `${trailOpacity}`,
    };
  };

  const rearLightSourceStyle = calculateTrailStyle(currentSpeed);

  return (
    <div className={carClassName}>
      {/* Front Lights */}
      <HeadlightGlow />
      <div className="headlight-source"></div> {/* Source */}
      
      {/* Rear Lights (Source Only) */}
      <div className="rear-light-source" style={rearLightSourceStyle}></div> {/* Rear Source with Trail */}

      {/* Emitters */}
      <ParticleEmitter carSpeed={currentSpeed} isPaused={isPaused} />
      <IdleParticleEmitter carSpeed={currentSpeed} isEngineOn={isEngineOn} isPaused={isPaused} />

      <div className="rear-wheel" style={wheelAnimationStyle}></div>
      <div className="front-wheel" style={wheelAnimationStyle}></div>
    </div>
  );
};

export default PlayerCar; 