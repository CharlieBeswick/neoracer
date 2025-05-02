import React, { useState, useEffect, useRef } from 'react';
import './BuildingLayer.css';

interface BuildingLayerProps {
  scrollSpeed: number;
  isGlowLayer?: boolean;
  isPaused?: boolean;
}

const BuildingLayer: React.FC<BuildingLayerProps> = ({ scrollSpeed, isGlowLayer = false, isPaused = false }) => {
  const [backgroundPositionX, setBackgroundPositionX] = useState(0);
  const animationFrameId = useRef<number | null>(null);
  const lastTimestamp = useRef<number | null>(null);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (lastTimestamp.current === null) {
        lastTimestamp.current = timestamp;
        animationFrameId.current = requestAnimationFrame(animate);
        return;
      }
      const deltaTime = (timestamp - lastTimestamp.current) / 1000;
      lastTimestamp.current = timestamp;

      if (!isPaused) {
        setBackgroundPositionX(prevPos => (prevPos - scrollSpeed * deltaTime));
      }

      animationFrameId.current = requestAnimationFrame(animate);
    };

    lastTimestamp.current = null;
    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      lastTimestamp.current = null;
    };
  }, [scrollSpeed, isPaused]);

  const layerStyle = {
    backgroundPosition: `${backgroundPositionX}px 0%`,
  };

  const layerClassName = `building-layer ${isGlowLayer ? 'glow' : ''}`.trim();

  return <div className={layerClassName} style={layerStyle}></div>;
};

export default BuildingLayer; 