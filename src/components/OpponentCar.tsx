import React from 'react';
import ParticleEmitter from './ParticleEmitter'; // Import ParticleEmitter
import HeadlightGlow from './HeadlightGlow'; // Import HeadlightGlow
// Note: Opponent car doesn't need HeadlightGlow for now
// import HeadlightGlow from './HeadlightGlow'; 
import './OpponentCar.css'; // Use a separate CSS file

interface OpponentCarProps {
  opponentSpeed: number; // Use a specific prop name
}

// Keep tyre image consistent for now
const TYRE_IMAGE_SRC = '/assets/tyre1.png'; 
const OPPONENT_CAR_BODY_SRC = '/assets/orangecar1nowheels.png'; // Use the orange car

const OpponentCar: React.FC<OpponentCarProps> = ({ opponentSpeed }) => {
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

  return (
    // Use the opponent-car class
    <div className={carClassName} style={carBodyStyle}>
      <HeadlightGlow />
      {/* Wrap ParticleEmitter in a div for specific styling */}
      <div className="opponent-particle-wrapper">
        <ParticleEmitter carSpeed={opponentSpeed} />
      </div>
      <div className="headlight-source"></div>
      <div className="rear-wheel" style={wheelAnimationStyle}></div>
      <div className="front-wheel" style={wheelAnimationStyle}></div>
    </div>
  );
};

export default OpponentCar; 