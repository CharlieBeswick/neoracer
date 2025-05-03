import React from 'react';
import './MountainLayer.css';

interface MountainLayerProps {
  bgPositionX: string; // Accept position string directly
}

const MountainLayer: React.FC<MountainLayerProps> = ({ bgPositionX }) => {
  // No internal state or effects needed

  const layerStyle = {
    backgroundPosition: bgPositionX,
  };

  return <div className="mountain-layer" style={layerStyle}></div>;
};

export default MountainLayer; 