import React, { useState, useEffect } from 'react';
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

  return <div className={carClassName}></div>;
};

export default PlayerCar; 