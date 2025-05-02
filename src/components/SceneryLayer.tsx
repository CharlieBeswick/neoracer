import React, { useState, useEffect, useRef, CSSProperties } from 'react';
import './SceneryLayer.css';

interface SceneryLayerProps {
  scrollSpeed: number;
  tileWidth: number; // Base average spacing
  spriteSrc: string;
  spriteWidth: number; // Base width
  spriteHeight: number; // Base height
  verticalPosition: string | number; // Base vertical position
  zIndex: number;
  spriteClassName?: string;
  spriteStyle?: CSSProperties;
  trackLengthPixels: number;
}

// Define a fixed array of variations
const PREDEFINED_VARIATIONS = [
  { scale: 0.85, flip: false }, { scale: 1.1, flip: true },  { scale: 1.0, flip: false }, 
  { scale: 0.7, flip: true },  { scale: 1.2, flip: false }, { scale: 0.9, flip: true }, 
  { scale: 1.15, flip: true }, { scale: 0.95, flip: false },{ scale: 1.3, flip: false },
  { scale: 0.8, flip: true },  { scale: 1.05, flip: false },{ scale: 0.75, flip: true },
  { scale: 1.25, flip: false },{ scale: 0.88, flip: true }, { scale: 0.98, flip: false },
  { scale: 1.18, flip: true }, { scale: 0.72, flip: false },{ scale: 1.08, flip: true },
  { scale: 0.92, flip: false },{ scale: 1.22, flip: true }, 
];
const NUM_VARIATIONS = PREDEFINED_VARIATIONS.length;

const SceneryLayer: React.FC<SceneryLayerProps> = ({
  scrollSpeed,
  tileWidth, // Base average spacing
  spriteSrc,
  spriteWidth,
  spriteHeight,
  verticalPosition = '0%',
  zIndex = 1,
  spriteClassName = '',
  spriteStyle = {},
  trackLengthPixels,
}) => {
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
      const deltaTime = (timestamp - lastTimestamp.current) / 1000;
      lastTimestamp.current = timestamp;
      setScrollPos(prevPos => prevPos - scrollSpeed * deltaTime);
      animationFrameId.current = requestAnimationFrame(animate);
    };
    lastTimestamp.current = null;
    animationFrameId.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      lastTimestamp.current = null;
    };
  }, [scrollSpeed]);

  const renderSprites = () => {
    // No need for containerRef or screenWidth if rendering all sprites
    if (tileWidth <= 0) return null;

    // Calculate the maximum logical index based on track length
    const maxLogicalIndex = Math.ceil(trackLengthPixels / tileWidth);

    const sprites = [];
    // Loop through ALL logical indices for the entire track length
    for (let logicalIndex = 0; logicalIndex <= maxLogicalIndex; logicalIndex++) {
      
      // Determine the variation using the logical index
      const variationIndex = (logicalIndex % NUM_VARIATIONS + NUM_VARIATIONS) % NUM_VARIATIONS;
      const variation = PREDEFINED_VARIATIONS[variationIndex];

      // 1. Size (Based on stable variation)
      const currentSpriteWidth = spriteWidth * variation.scale;
      const currentSpriteHeight = spriteHeight * variation.scale;

      // 2. Vertical Position Adjustment (Based on stable variation)
      let currentVerticalPosition = verticalPosition;
      if (typeof verticalPosition === 'string' && verticalPosition.endsWith('%')) {
         const basePercentage = parseFloat(verticalPosition);
         // Adjust slightly more for smaller items to prevent floating too high
         const adjustmentFactor = variation.scale < 1.0 ? (1.0 - variation.scale) * 5 : 0;
         currentVerticalPosition = `${basePercentage - adjustmentFactor}%`;
      }

      // 3. Horizontal Position (Absolute position within the conceptual infinite world)
      const absoluteCenterPos = logicalIndex * tileWidth + (tileWidth / 2);
      const absoluteLeftPos = absoluteCenterPos - (currentSpriteWidth / 2);

      // 4. Flip (Based on stable variation)
      const transform = variation.flip ? 'scaleX(-1)' : 'none';

      sprites.push(
        <img
          key={logicalIndex}
          src={spriteSrc}
          className={`scenery-sprite ${spriteClassName}`.trim()}
          style={{
            position: 'absolute',
            left: `${absoluteLeftPos}px`,
            bottom: currentVerticalPosition,
            width: `${currentSpriteWidth}px`,
            height: `${currentSpriteHeight}px`,
            zIndex: zIndex,
            transform: transform,
            ...spriteStyle,
          }}
          alt=""
        />
      );
    }
    return sprites;
  };

  // Apply the scroll position to the container using transform
  const containerStyle = {
    transform: `translateX(${scrollPos}px)`
  };

  return (
    // Remove ref from container - no longer needed for width calculation
    <div 
      className="scenery-layer-container" 
      style={containerStyle} 
    >
      {renderSprites()}
    </div>
  );
};

export default SceneryLayer; 