import React, { useState, useEffect, useRef } from 'react';
import './MountainLayer.css';

interface MountainLayerProps {
  scrollSpeed: number;
  isPaused?: boolean;
}

const MountainLayer: React.FC<MountainLayerProps> = ({ scrollSpeed, isPaused = false }) => {
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
      const deltaTime = (timestamp - lastTimestamp.current) / 1000; // Time in seconds
      lastTimestamp.current = timestamp;

      // Pause check
      if (!isPaused) {
        // Update background position based on speed and time
        setBackgroundPositionX(prevPos => (prevPos - scrollSpeed * deltaTime));
      }

      animationFrameId.current = requestAnimationFrame(animate);
    };

    lastTimestamp.current = null; // Reset timestamp for new effect cycle
    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      lastTimestamp.current = null;
    };
  }, [scrollSpeed, isPaused]); // Rerun effect if scrollSpeed changes

  const layerStyle = {
    backgroundPosition: `${backgroundPositionX}px 0%`,
  };

  return <div className="mountain-layer" style={layerStyle}></div>;
};

export default MountainLayer; 