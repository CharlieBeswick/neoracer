import React, { useState, useEffect, useCallback, useRef } from 'react';
import Particle from './Particle';
import './Particles.css';

interface ParticleEmitterProps {
  carSpeed: number;
  isPaused?: boolean;
}

interface ParticleState {
  id: number;
  style: React.CSSProperties;
}

let particleIdCounter = 0;

const ParticleEmitter: React.FC<ParticleEmitterProps> = ({ carSpeed, isPaused = false }) => {
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

    if (!isPaused && carSpeed > 10) {
      const emissionInterval = Math.max(5, 100 - carSpeed * 0.6);
      const maxParticles = 150;

      intervalRef.current = setInterval(() => {
        if (particles.length >= maxParticles) return;

        const newParticleId = particleIdCounter++;
        const particleSize = Math.max(2, 2 + carSpeed * 0.02);
        const animationDuration = Math.max(0.5, 1.5 - carSpeed * 0.002);
        
        const emitterWidth = emitterRef.current?.offsetWidth || 50; 
        const offsetX = Math.random() * emitterWidth - (emitterWidth / 2);
        
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
            bottom: `${Math.random() * 10}px`, 
            backgroundColor: Math.random() > 0.3 ? 'rgba(180, 180, 180, 0.5)' : 'rgba(80, 80, 80, 0.4)', 
            animationName: 'particleAnimation',
            animationDuration: `${animationDuration}s`,
            animationTimingFunction: 'ease-out',
            animationFillMode: 'forwards',
            borderRadius: '50%',
            position: 'absolute',
          } as React.CSSProperties
        };

        setParticles(prev => [...prev, newParticle]);

      }, emissionInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [carSpeed, particles.length, isPaused]);

  return (
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

export default ParticleEmitter; 