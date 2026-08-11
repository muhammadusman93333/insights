import React, { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';

interface DustParticlesProps {
  count?: number;
  isDarkTheme?: boolean;
}

interface Particle {
  id: number;
  initialX: number;
  initialY: number;
  size: number;
  speedY: number;
  speedX: number;
  wobbleSpeed: number;
  opacity: number;
}

export const DustParticles: React.FC<DustParticlesProps> = ({
  count = 28,
  isDarkTheme = false,
}) => {
  const frame = useCurrentFrame();

  const particles: Particle[] = useMemo(() => {
    const list: Particle[] = [];
    for (let i = 0; i < count; i++) {
      list.push({
        id: i,
        initialX: (i * 39 + 77) % 1000,
        initialY: (i * 71 + 130) % 1800,
        size: 1.5 + ((i * 13) % 4.5),
        speedY: 0.35 + ((i * 7) % 0.6),
        speedX: 0.15 + ((i * 11) % 0.4),
        wobbleSpeed: 0.02 + ((i * 3) % 0.04),
        opacity: 0.25 + ((i * 17) % 0.45),
      });
    }
    return list;
  }, [count]);

  const particleColor = isDarkTheme
    ? 'rgba(235, 200, 120, '
    : 'rgba(160, 115, 45, ';

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 14,
      }}
    >
      {particles.map((p) => {
        const yPos = (p.initialY - frame * p.speedY + 1920) % 1920;
        const xOffset = Math.sin(frame * p.wobbleSpeed + p.id) * 35;
        const xPos = (p.initialX + xOffset + 1080) % 1080;
        const flicker =
          p.opacity * (0.7 + 0.3 * Math.sin(frame * 0.08 + p.id * 2));

        return (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: xPos,
              top: yPos,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              backgroundColor: `${particleColor}${flicker})`,
              boxShadow: `0 0 ${p.size * 3}px ${particleColor}${flicker * 0.8})`,
              filter: 'blur(0.5px)',
            }}
          />
        );
      })}
    </div>
  );
};
