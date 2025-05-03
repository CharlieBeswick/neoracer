import React from 'react';
import './HeadlightGlow.css';

interface HeadlightGlowProps {
  beamClassName?: string; // Optional class name for the beam div
}

const HeadlightGlow: React.FC<HeadlightGlowProps> = ({ beamClassName }) => {
  // Use the provided class name, or default to 'headlight-glow'
  const classNameToUse = beamClassName || 'headlight-glow';
  return (
    <div className={classNameToUse}>
      {/* Source element moved to PlayerCar/OpponentCar */}
    </div>
  );
};

export default HeadlightGlow; 