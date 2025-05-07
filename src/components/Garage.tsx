import React, { useState, useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import * as style from '@dicebear/avataaars';
import './Garage.css'; // We'll create this CSS file next
import PlayerCar from './PlayerCar'; // Import PlayerCar
import { type AvatarConfig } from '../App'; // Import the AvatarConfig type

interface GarageProps {
  playerAvatarOptions: AvatarConfig; // Use the specific type
  playerName: string; // Added prop for player name
  onStartRace: () => void;
  onBackToMenu: () => void;
  showRotationOverlay: boolean;
}

// Define types for the active view
type GarageView = 'Garage' | 'Profile' | 'Store' | 'Upgrades' | 'Tune';

const Garage: React.FC<GarageProps> = ({ 
  playerAvatarOptions, 
  playerName, 
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
        return `Viewing profile for ${playerName}`; // Use player name
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

  // Generate Avatar SVG for Profile View using saved options
  const profileAvatarSvg = useMemo(() => {
    if (activeView !== 'Profile' || !playerAvatarOptions) return ''; 
    console.log("Generating profile avatar with options:", playerAvatarOptions);
    // Use type assertion for now, acknowledging potential rendering issues
    // if the AvatarCreator bugs persist. Conditional logic similar to
    // AvatarCreator might be needed here too for perfect rendering.
    try {
      return createAvatar(style, playerAvatarOptions as any).toString(); 
    } catch (error) {
      console.error("Error generating profile avatar SVG:", error);
      return ''; // Return empty string on error
    }
  }, [activeView, playerAvatarOptions]);

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
          {/* Render content based on view */}
          {activeView === 'Profile' && (
            <div className="profile-content"> {/* Added wrapper for layout */}
              <h2>{playerName}</h2> {/* Display player name */}
              {profileAvatarSvg ? (
                  <div 
                    className="profile-avatar-display" 
                    dangerouslySetInnerHTML={{ __html: profileAvatarSvg }} 
                  />
              ) : (
                  <p>Could not load avatar.</p> // Fallback message
              )}
              {/* Add other profile info here (stats, etc.) */}
            </div>
          )}
          {activeView === 'Store' && (
            <p>Store Content Goes Here</p>
          )}
          {activeView === 'Upgrades' && (
            <p>Upgrades Content Goes Here</p>
          )}
           {activeView === 'Tune' && (
            <p>Tune Content Goes Here</p>
          )}
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