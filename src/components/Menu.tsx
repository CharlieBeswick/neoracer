import React from 'react';
import './Menu.css'; // We'll create this next

interface MenuProps {
  onPlay: () => void;
  onQuit: () => void;
}

const Menu: React.FC<MenuProps> = ({ onPlay, onQuit }) => {
  return (
    <div className="menu-container">
      <h1 className="menu-title">Neo Racer</h1>
      <div className="menu-options">
        <button onClick={onPlay}>Play</button>
        <button onClick={onQuit}>Quit</button>
      </div>
    </div>
  );
};

export default Menu; 