import React, { useState, useEffect, useRef } from 'react';
import './Background.css';

// Configuration
// const SCROLL_SPEED_PIXELS_PER_SECOND = 50; // Speed now passed as prop
// const TRACK_LENGTH_IN_IMAGE_WIDTHS = 200; // Deprecated
const TRACK_LENGTH_PIXELS = 600 * 200; // Define track length directly in pixels (120,000px)

interface BackgroundProps {
  scrollSpeed: number; // Pixels per second
  isPaused?: boolean; // Add prop
}

const Background: React.FC<BackgroundProps> = ({ scrollSpeed, isPaused = false }) => {
  const [scrollPos, setScrollPos] = useState(0);
  const animationFrameId = useRef<number | null>(null);
  const lastTimestamp = useRef<number | null>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);

  // TODO: Get actual image width for precise calculations if needed,
  // or ensure background-size is set appropriately in CSS.
  // For now, CSS tiling handles the visual repetition.

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (lastTimestamp.current === null) {
        lastTimestamp.current = timestamp;
        animationFrameId.current = requestAnimationFrame(animate);
        return;
      }

      const deltaTime = (timestamp - lastTimestamp.current) / 1000; // seconds
      lastTimestamp.current = timestamp;

      // Pause check
      if (!isPaused) {
        setScrollPos(prevPos => {
          const newPos = prevPos - scrollSpeed * deltaTime;
          return newPos; // CSS handles the wrap-around
        });
      }

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
  }, [scrollSpeed, isPaused]);

  const backgroundStyle = {
    backgroundPosition: `${scrollPos}px 0%`,
  };

  return (
    <div
      ref={backgroundRef}
      className="background-layer"
      style={backgroundStyle}
    >
      {/* This div uses CSS for the repeating background */}
    </div>
  );
};

export default Background; 