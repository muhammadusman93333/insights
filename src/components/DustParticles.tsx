import React, { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';

interface DustParticlesProps {
  count?: number;
  isDarkTheme?: boolean;
}

interface Particle {
  id: number;
  type: 'bokeh' | 'mote' | 'sparkle';
  initialX: number;
  initialY: number;
  size: number;
  speedY: number;
  speedX: number;
  wobbleSpeed: number;
  wobbleRadius: number;
  baseOpacity: number;
  twinkleSpeed: number;
  blur: number;
  haloScale: number;
}

export const DustParticles: React.FC<DustParticlesProps> = ({
  count = 16,
  isDarkTheme = false,
}) => {
  const frame = useCurrentFrame();

  const particles: Particle[] = useMemo(() => {
    const list: Particle[] = [];
    for (let i = 0; i < count; i++) {
      // Divide particles into 3 layers: large soft bokeh orbs, glowing golden motes, and twinkling sparkles
      let type: 'bokeh' | 'mote' | 'sparkle' = 'mote';
      let size = 0;
      let blur = 0;
      let haloScale = 2;
      let baseOpacity = 0.5;

      if (i % 5 === 0) {
        // Large dreamy bokeh light orbs
        type = 'bokeh';
        size = 36 + ((i * 19) % 28);
        blur = 0;
        haloScale = 2.5;
        baseOpacity = 0.18 + ((i * 7) % 0.12);
      } else if (i % 6 === 1) {
        // Occasional diamond / star twinkling light specks
        type = 'sparkle';
        size = 14 + ((i * 11) % 8);
        blur = 0;
        haloScale = 3;
        baseOpacity = 0.55 + ((i * 13) % 0.25);
      } else {
        // Medium luminous golden light motes
        type = 'mote';
        size = 8 + ((i * 17) % 14);
        blur = 0;
        haloScale = 2.5;
        baseOpacity = 0.4 + ((i * 11) % 0.25);
      }

      list.push({
        id: i,
        type,
        initialX: (i * 73 + 45) % 1080,
        initialY: (i * 113 + 110) % 1920,
        size,
        blur,
        haloScale,
        speedY: 0.25 + ((i * 7) % 0.45),
        speedX: 0.1 + ((i * 11) % 0.25),
        wobbleSpeed: 0.015 + ((i * 5) % 0.025),
        wobbleRadius: 18 + ((i * 13) % 25),
        baseOpacity,
        twinkleSpeed: 0.04 + ((i * 7) % 0.06),
      });
    }
    return list;
  }, [count]);

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
        // Smooth continuous looping vertical ascent
        const yPos = (p.initialY - frame * p.speedY * 1.5 + 1920) % 1920;

        // Multi-frequency organic wandering & drifting
        const xOffset =
          Math.sin(frame * p.wobbleSpeed + p.id * 1.4) * p.wobbleRadius +
          Math.sin(frame * (p.wobbleSpeed * 0.5) + p.id) * 10;
        const xPos = (p.initialX + xOffset + 1080) % 1080;

        // Twinkle / shimmer pulsation
        const pulse =
          0.65 +
          0.35 *
            Math.sin(frame * p.twinkleSpeed + p.id * 2.1) *
            Math.cos(frame * (p.twinkleSpeed * 0.6) + p.id);

        const currentOpacity = p.baseOpacity * pulse;

        if (p.type === 'bokeh') {
          // Large soft atmospheric bokeh orb
          return (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                left: xPos - p.size / 2,
                top: yPos - p.size / 2,
                width: p.size,
                height: p.size,
                borderRadius: '50%',
                background: isDarkTheme
                  ? `radial-gradient(circle at center, rgba(255, 215, 130, ${currentOpacity}) 0%, rgba(255, 175, 70, ${currentOpacity * 0.35}) 45%, transparent 70%)`
                  : `radial-gradient(circle at center, rgba(255, 200, 100, ${currentOpacity * 1.1}) 0%, rgba(220, 150, 50, ${currentOpacity * 0.4}) 45%, transparent 70%)`,
                mixBlendMode: isDarkTheme ? 'screen' : 'multiply',
                pointerEvents: 'none',
              }}
            />
          );
        }

        if (p.type === 'sparkle') {
          // Twinkling Diamond Flare / Star Sparkle
          const rotateDeg = frame * 0.8 + p.id * 45;
          const starGlow = currentOpacity * 0.9;

          return (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                left: xPos - p.size / 2,
                top: yPos - p.size / 2,
                width: p.size,
                height: p.size,
                transform: `rotate(${rotateDeg}deg)`,
                pointerEvents: 'none',
                mixBlendMode: 'screen',
              }}
            >
              {/* Central Intense Light Core */}
              <div
                style={{
                  position: 'absolute',
                  inset: '25%',
                  borderRadius: '50%',
                  background: '#ffffff',
                  boxShadow: `0 0 ${p.size}px rgba(255, 220, 120, ${starGlow})`,
                  opacity: starGlow,
                }}
              />
              {/* Horizontal Ray */}
              <div
                style={{
                  position: 'absolute',
                  top: '44%',
                  left: 0,
                  right: 0,
                  height: '12%',
                  background: `linear-gradient(90deg, transparent 0%, rgba(255, 245, 200, ${starGlow * 0.95}) 50%, transparent 100%)`,
                  borderRadius: '50%',
                }}
              />
              {/* Vertical Ray */}
              <div
                style={{
                  position: 'absolute',
                  left: '44%',
                  top: 0,
                  bottom: 0,
                  width: '12%',
                  background: `linear-gradient(180deg, transparent 0%, rgba(255, 245, 200, ${starGlow * 0.95}) 50%, transparent 100%)`,
                  borderRadius: '50%',
                }}
              />
            </div>
          );
        }

        // Standard Glowing Luminous Mote with Halo
        const glowColor = isDarkTheme ? '255, 210, 110' : '230, 160, 60';
        const coreColor = isDarkTheme ? '255, 255, 230' : '255, 240, 200';

        return (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: xPos - p.size / 2,
              top: yPos - p.size / 2,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: `radial-gradient(circle at center, rgba(${coreColor}, ${currentOpacity * 1.1}) 0%, rgba(${glowColor}, ${currentOpacity * 0.7}) 40%, transparent 70%)`,
              mixBlendMode: 'screen',
              pointerEvents: 'none',
            }}
          />
        );
      })}
    </div>
  );
};
