import React from 'react';
import './Menu.css'; // We'll create this next

interface MenuProps {
  onPlay: () => void;
  onQuit: () => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  onGoToDevLog: () => void;
  isMuted: boolean;
  toggleMute: () => void;
}

const Menu: React.FC<MenuProps> = ({ 
  onPlay, 
  onQuit,
  isFullscreen,
  toggleFullscreen,
  onGoToDevLog,
  isMuted,
  toggleMute
}) => {
  return (
    <div className="menu-container">
      {/* Container for top-left controls */}
      <div className="menu-top-left-controls">
        <button 
          onClick={toggleFullscreen} 
          className="menu-button menu-control-button"
        >
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
        <button 
          onClick={toggleMute} 
          className="menu-button menu-control-button"
        >
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
      </div>

      <h1 className="menu-title">NEORACER</h1>
      <div className="menu-options">
        <button onClick={onPlay}>Play</button>
        <button onClick={onGoToDevLog}>Dev Log</button>
        <button onClick={onQuit}>Quit</button>
      </div>

      {/* Credits Text */}
      <div className="credits-text">
        Credits: IVOXYGEN Music
        <br />
        Game Designed by C.Beswick
      </div>
    </div>
  );
};

export default Menu; 