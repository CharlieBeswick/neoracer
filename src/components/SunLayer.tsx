import React from 'react';
import './SunLayer.css';

interface SunLayerProps {
  translateX: number; // Accept X offset directly
}

const SunLayer: React.FC<SunLayerProps> = ({ translateX }) => {
  // No internal state or effects needed

  // Apply transform for parallax, keep other CSS positioning
  const layerStyle = {
    transform: `translateX(${translateX}px)`,
  };

  return (
    <div className="sun-layer-container" style={layerStyle}>
      <div className="sun-body">
        {/* Stripes will be handled by CSS background */}
      </div>
    </div>
  );
};

export default SunLayer; 