import React from 'react';
import './Road.css';

interface RoadProps {
  bgPositionX: string; // Accept position string directly
}

const Road: React.FC<RoadProps> = ({ bgPositionX }) => {
  // No internal state or effects needed
  
  const roadStyle = {
    backgroundPosition: bgPositionX,
  };

  return <div className="road-layer" style={roadStyle}></div>;
};

export default Road; 