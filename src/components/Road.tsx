import React, { useState, useEffect, useRef } from 'react';
import './Road.css';

interface RoadProps {
  scrollSpeed: number; // Pixels per second
}

const Road: React.FC<RoadProps> = ({ scrollSpeed }) => {
  const [scrollPos, setScrollPos] = useState(0);
  const animationFrameId = useRef<number | null>(null);
  const lastTimestamp = useRef<number | null>(null);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (lastTimestamp.current === null) {
        lastTimestamp.current = timestamp;
        animationFrameId.current = requestAnimationFrame(animate);
        return;
      }

      const deltaTime = (timestamp - lastTimestamp.current) / 1000; // seconds
      lastTimestamp.current = timestamp;

      setScrollPos(prevPos => {
        const newPos = prevPos - scrollSpeed * deltaTime;
        return newPos; // CSS handles the wrap-around
      });

      animationFrameId.current = requestAnimationFrame(animate);
    };

    // Reset timestamp when speed changes (or on initial mount)
    lastTimestamp.current = null; 
    animationFrameId.current = requestAnimationFrame(animate);

    // Cleanup function
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      lastTimestamp.current = null;
    };
    // Rerun effect if scrollSpeed changes
  }, [scrollSpeed]); 

  const roadStyle = {
    backgroundPosition: `${scrollPos}px 0%`,
  };

  return <div className="road-layer" style={roadStyle}></div>;
};

export default Road; 