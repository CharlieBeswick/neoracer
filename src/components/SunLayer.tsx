import React, { useState, useEffect, useRef } from 'react';
import './SunLayer.css';

interface SunLayerProps {
  scrollSpeed: number;
  isPaused?: boolean;
}

const SunLayer: React.FC<SunLayerProps> = ({ scrollSpeed, isPaused = false }) => {
  const [positionX, setPositionX] = useState(0);
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
        setPositionX(prevPos => (prevPos - scrollSpeed * deltaTime));
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

  // Apply transform for parallax, keep other CSS positioning
  const layerStyle = {
    transform: `translateX(${positionX}px)`,
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