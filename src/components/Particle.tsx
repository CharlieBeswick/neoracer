import React from 'react';
import './Particles.css';

interface ParticleProps {
  id: number;
  style: React.CSSProperties;
  onAnimationEnd: (id: number) => void;
}

// Simple component for a single particle
const Particle: React.FC<ParticleProps> = ({ id, style, onAnimationEnd }) => {
  return (
    <div 
      className="particle" 
      style={style} 
      onAnimationEnd={() => onAnimationEnd(id)}
    />
  );
};

export default Particle; 