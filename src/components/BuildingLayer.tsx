import React from 'react';
import './BuildingLayer.css';

interface BuildingLayerProps {
  bgPositionX: string; // Accept position string directly
  isGlowLayer?: boolean;
}

const BuildingLayer: React.FC<BuildingLayerProps> = ({ bgPositionX, isGlowLayer = false }) => {
  // No internal state or effects needed
  
  const layerStyle = {
    backgroundPosition: bgPositionX,
  };

  const layerClassName = `building-layer ${isGlowLayer ? 'glow' : ''}`.trim();

  return <div className={layerClassName} style={layerStyle}></div>;
};

export default BuildingLayer; 