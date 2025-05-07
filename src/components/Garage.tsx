import React from 'react';
import './Garage.css'; // We'll create this CSS file next
import PlayerCar from './PlayerCar'; // Import PlayerCar

interface GarageProps {
  onStartRace: () => void;
  onBackToMenu: () => void;
  showRotationOverlay: boolean;
}

const Garage: React.FC<GarageProps> = ({ 
  onStartRace, 
  onBackToMenu,
  showRotationOverlay
}) => {

  // Add explicit handlers with logging
  const handleBackClick = () => {
    console.log("Garage: Back button clicked, calling onBackToMenu...");
    onBackToMenu();
  };

  const handleStartClick = () => {
    console.log("Garage: Start Race button clicked, calling onStartRace...");
    onStartRace();
  };

  return (
    <div className="garage-container">
      {/* Conditionally render rotation overlay */}
      {showRotationOverlay && (
        <div className="rotation-overlay">
          <p>Please rotate your device to landscape mode.</p>
        </div>
      )}

      {/* Back Button - Positioned top-left */}
      <button onClick={handleBackClick} className="garage-button back-button">
        &lt; Back to Menu
      </button>

      {/* Left Column Buttons */}
      <div className="left-button-column">
        <button className="garage-button left-column-button" disabled>
          Garage
        </button>
        <button onClick={() => console.log('Not yet implemented')} className="garage-button left-column-button">
          Profile
        </button>
        <button onClick={() => console.log('Not yet implemented')} className="garage-button left-column-button">
          Store
        </button>
        <button onClick={() => console.log('Not yet implemented')} className="garage-button left-column-button">
          Upgrades
        </button>
        <button onClick={() => console.log('Not yet implemented')} className="garage-button left-column-button">
          Tune
        </button>
      </div>

      {/* Center Area for Car */}
      <div className="garage-car-display-area">
        <PlayerCar 
          currentSpeed={0} 
          isEngineOn={true}
          isPaused={true} // Treat garage as paused to prevent particle effects? Or handle differently?
        />
      </div>

      {/* Placeholder for future garage content */}
      <h1 className="garage-title">Garage</h1>
      <p className="garage-info">Customize your ride, view stats, and start the race!</p>

      {/* Start Race Button - Positioned lower-center or similar */}
      <button onClick={handleStartClick} className="garage-button start-race-button">
        Start<br />Race
      </button>
    </div>
  );
};

export default Garage; 