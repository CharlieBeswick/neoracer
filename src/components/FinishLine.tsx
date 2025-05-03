import React from 'react';
import './FinishLine.css';

interface FinishLineProps {
  leftPosition: number; // Position calculated in Game.tsx
}

const FinishLine: React.FC<FinishLineProps> = ({ leftPosition }) => {
  const style = {
    left: `${leftPosition}px`,
  };

  return <div className="finish-line" style={style}></div>;
};

export default FinishLine; 