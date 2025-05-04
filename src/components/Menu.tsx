import React from 'react';
import './Menu.css'; // We'll create this next

interface MenuProps {
  onPlay: () => void;
  onQuit: () => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}

const Menu: React.FC<MenuProps> = ({ 
  onPlay, 
  onQuit,
  isFullscreen,
  toggleFullscreen
}) => {
  return (
    <div className="menu-container">
      {/* Fullscreen Button - Top Left */}
      <button onClick={toggleFullscreen} className="menu-button fullscreen-button">
        {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
      </button>

      <h1 className="menu-title">NEORACER</h1>
      <div className="menu-options">
        <button onClick={onPlay}>Play</button>
        <button onClick={onQuit}>Quit</button>
      </div>

      {/* Credits Text */}
      <div className="credits-text">Credits: IVOXYGEN Music</div>
    </div>
  );
};

export default Menu; 