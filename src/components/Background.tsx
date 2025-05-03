import React from 'react';
import './Background.css';

// Configuration
// const SCROLL_SPEED_PIXELS_PER_SECOND = 50; // Speed now passed as prop
// const TRACK_LENGTH_IN_IMAGE_WIDTHS = 200; // Deprecated
const TRACK_LENGTH_PIXELS = 600 * 200; // Define track length directly in pixels (120,000px)

interface BackgroundProps {
  bgPositionX: string; // Accept position string directly
}

const Background: React.FC<BackgroundProps> = ({ bgPositionX }) => {
  // No internal state or effects needed

  const backgroundStyle = {
    backgroundPosition: bgPositionX,
  };

  return (
    <div
      className="background-layer"
      style={backgroundStyle}
    >
      {/* This div uses CSS for the repeating background */}
    </div>
  );
};

export default Background; 