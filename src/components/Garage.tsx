import React, { useState } from 'react';
import './Garage.css'; // We'll create this CSS file next
import PlayerCar from './PlayerCar'; // Import PlayerCar

interface GarageProps {
  onStartRace: () => void;
  onBackToMenu: () => void;
  showRotationOverlay: boolean;
}

// Define types for the active view
type GarageView = 'Garage' | 'Profile' | 'Store' | 'Upgrades' | 'Tune';

const Garage: React.FC<GarageProps> = ({ 
  onStartRace, 
  onBackToMenu,
  showRotationOverlay
}) => {
  const [activeView, setActiveView] = useState<GarageView>('Garage');

  // Add explicit handlers with logging
  const handleBackClick = () => {
    console.log("Garage: Back button clicked, calling onBackToMenu...");
    onBackToMenu();
  };

  const handleStartClick = () => {
    console.log("Garage: Start Race button clicked, calling onStartRace...");
    onStartRace();
  };

  const getSubtitle = () => {
    switch (activeView) {
      case 'Garage':
        return "Select your car";
      case 'Profile':
        return "Player Profile"; // Placeholder
      case 'Store':
        return "Item Store"; // Placeholder
      case 'Upgrades':
        return "Car Upgrades"; // Placeholder
      case 'Tune':
        return "Tune Your Ride"; // Placeholder
      default:
        return "Select your car";
    }
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
        &lt; Back to<br />Menu
      </button>

      {/* Left Column Buttons */}
      <div className="left-button-column">
        <button 
          onClick={() => setActiveView('Garage')} 
          className={`garage-button left-column-button ${activeView === 'Garage' ? 'active' : ''}`}
        >
          Garage
        </button>
        <button 
          onClick={() => { setActiveView('Profile'); console.log('Profile clicked'); }} 
          className={`garage-button left-column-button ${activeView === 'Profile' ? 'active' : ''}`}
        >
          Profile
        </button>
        <button 
          onClick={() => { setActiveView('Store'); console.log('Store clicked'); }} 
          className={`garage-button left-column-button ${activeView === 'Store' ? 'active' : ''}`}
        >
          Store
        </button>
        <button 
          onClick={() => { setActiveView('Upgrades'); console.log('Upgrades clicked'); }} 
          className={`garage-button left-column-button ${activeView === 'Upgrades' ? 'active' : ''}`}
        >
          Upgrades
        </button>
        <button 
          onClick={() => { setActiveView('Tune'); console.log('Tune clicked'); }} 
          className={`garage-button left-column-button ${activeView === 'Tune' ? 'active' : ''}`}
        >
          Tune
        </button>
      </div>

      {/* Conditionally render Car Wrapper OR Content Panel */} 
      {activeView === 'Garage' && (
        <div className="garage-car-wrapper"> {/* Wrapper for car positioning/sizing */} 
          <PlayerCar 
            currentSpeed={0} 
            isEngineOn={true}
            isPaused={true} 
          />
        </div>
      )}

      {activeView !== 'Garage' && (
        <div className="garage-content-panel"> 
          {/* Placeholder for content of Profile, Store, etc. */} 
          <p style={{color: 'white', fontSize: '2rem'}}> 
            {activeView} Content Goes Here 
          </p>
        </div>
      )}

      {/* Header for Title and Subtitle */} 
      <div className="garage-header"> 
        <h1 className="garage-title">{activeView}</h1> 
        <p className="garage-info">{getSubtitle()}</p>
      </div>

      {/* Start Race Button - Render only on Garage view */} 
      {activeView === 'Garage' && (
        <button onClick={handleStartClick} className="garage-button start-race-button">
          Start<br />Race
        </button>
      )}
    </div>
  );
};

export default Garage; 