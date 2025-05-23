import React from 'react';
import './ModeSelection.css'; // We'll create this CSS file next

interface ModeSelectionProps {
  onStartSinglePlayer: () => void;
  onBackToMenu: () => void;
  showRotationOverlay: boolean;
}

const ModeSelection: React.FC<ModeSelectionProps> = ({ 
  onStartSinglePlayer, 
  onBackToMenu,
  showRotationOverlay
}) => {
  // Placeholder for multiplayer - does nothing for now
  const handleMultiplayerClick = () => {
    console.log("Multiplayer clicked - not implemented yet.");
    // Optionally disable the button visually or via the disabled prop
  };

  return (
    <div className="mode-selection-container"> {/* Reuse menu background style */}
      {/* Conditionally render rotation overlay */}
      {showRotationOverlay && (
        <div className="rotation-overlay">
          <p>Please rotate your device to landscape mode.</p>
        </div>
      )}

      {/* Back Button */}
      <button onClick={onBackToMenu} className="mode-button back-button">
        &lt; Back
      </button>

      <h1 className="menu-title">Select Mode</h1> {/* Reuse menu title style */}
      <div className="mode-options"> {/* New class for button layout */}
        {/* Single Player Option */}
        <div className="mode-option">
          <img 
            src="/assets/singleplayer.png" 
            alt="Single Player" 
            className="mode-image" 
            onClick={onStartSinglePlayer}
          />
          <button onClick={onStartSinglePlayer} className="mode-button">
            Singleplayer
          </button>
        </div>

        {/* Multiplayer Option */}
        <div className="mode-option">
           <img 
             src="/assets/multiplayer.png" 
             alt="Multi Player" 
             className="mode-image" 
             onClick={handleMultiplayerClick}
           />
          <button onClick={handleMultiplayerClick} className="mode-button" disabled>
            Multiplayer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModeSelection; 