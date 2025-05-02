import React, { useState, useEffect } from 'react';
import ParticleEmitter from './ParticleEmitter';
import HeadlightGlow from './HeadlightGlow';
import './PlayerCar.css';

interface PlayerCarProps {
  currentSpeed: number;
}

const PlayerCar: React.FC<PlayerCarProps> = ({ currentSpeed }) => {
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

  return (
    <div className={carClassName}>
      <HeadlightGlow />
      <ParticleEmitter carSpeed={currentSpeed} />
      <div className="headlight-source"></div>
      <div className="rear-wheel" style={wheelAnimationStyle}></div>
      <div className="front-wheel" style={wheelAnimationStyle}></div>
    </div>
  );
};

export default PlayerCar; 