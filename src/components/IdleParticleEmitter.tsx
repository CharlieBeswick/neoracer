import React, { useState, useEffect, useCallback, useRef } from 'react';
import Particle from './Particle';
import './Particles.css'; // Share the CSS for now, we'll add new animation

interface IdleParticleEmitterProps {
  carSpeed: number;
  isEngineOn: boolean;
  isPaused?: boolean;
}

interface ParticleState {
  id: number;
  style: React.CSSProperties;
}

let idleParticleIdCounter = 0; // Separate counter

const IdleParticleEmitter: React.FC<IdleParticleEmitterProps> = ({ carSpeed, isEngineOn, isPaused = false }) => {
  const [particles, setParticles] = useState<ParticleState[]>([]);
  const emitterRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const removeParticle = useCallback((idToRemove: number) => {
    setParticles(prev => prev.filter(p => p.id !== idToRemove));
  }, []);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Emit only when engine is on AND speed is low (including 0)
    if (!isPaused && isEngineOn && carSpeed < 60) {
      // Slower emission rate for idle smoke compared to speed dust
      const emissionInterval = 150; // Longer interval = fewer particles
      const maxParticles = 50; // Fewer max particles

      intervalRef.current = setInterval(() => {
        if (particles.length >= maxParticles) return;

        const newParticleId = idleParticleIdCounter++;
        // Bigger base size, less influenced by speed
        const particleSize = Math.max(5, 6 + carSpeed * 0.01);
        // Longer duration for slower upward drift
        const animationDuration = Math.max(1.5, 2.5 - carSpeed * 0.01);
        
        const emitterWidth = emitterRef.current?.offsetWidth || 50; 
        // Reduce horizontal spread significantly
        const offsetX = Math.random() * (emitterWidth * 0.3) - (emitterWidth * 0.15);
        
        // Keep random factors for animation variations
        const randomX = Math.random(); 
        const randomY = Math.random();

        const newParticle: ParticleState = {
          id: newParticleId,
          style: {
            '--random-x': randomX,
            '--random-y': randomY,
            width: `${particleSize}px`,
            height: `${particleSize}px`,
            left: `calc(50% + ${offsetX}px)`,
            bottom: `${Math.random() * 5}px`, // Start closer to bottom
            // Lighter grey/white for smoke?
            backgroundColor: Math.random() > 0.4 ? 'rgba(200, 200, 200, 0.4)' : 'rgba(150, 150, 150, 0.3)', 
            animationName: 'idleParticleAnimation', // Use NEW animation
            animationDuration: `${animationDuration}s`,
            animationTimingFunction: 'ease-out',
            animationFillMode: 'forwards',
            borderRadius: '50%',
            position: 'absolute',
          } as React.CSSProperties // Using type assertion for custom props
        };

        setParticles(prev => [...prev, newParticle]);

      }, emissionInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [carSpeed, particles.length, isPaused, isEngineOn]);

  return (
    // Use same positioning class for now
    <div ref={emitterRef} className="particle-emitter"> 
      {particles.map(p => (
        <Particle 
          key={p.id} 
          id={p.id} 
          style={p.style} 
          onAnimationEnd={removeParticle} 
        />
      ))}
    </div>
  );
};

export default IdleParticleEmitter; 