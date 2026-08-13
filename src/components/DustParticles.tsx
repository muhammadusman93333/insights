import React, { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';
import { createGlowDot } from '../utils/canvasGlow';

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

// Pre-render blurred dots once at startup to avoid runtime CPU blurs
const BOKEH_LIGHT_MOTE = createGlowDot('rgba(255, 215, 130, 0.45)', 128);
const BOKEH_DARK_MOTE = createGlowDot('rgba(255, 200, 100, 0.5)', 128);
const STANDARD_LIGHT_MOTE = createGlowDot('rgba(255, 210, 110, 0.8)', 64);
const STANDARD_DARK_MOTE = createGlowDot('rgba(230, 160, 60, 0.8)', 64);

export const DustParticles: React.FC<DustParticlesProps> = ({
  count = 16,
  isDarkTheme = false,
}) => {
  const frame = useCurrentFrame();

  const particles: Particle[] = useMemo(() => {
    const list: Particle[] = [];
    for (let i = 0; i < count; i++) {
      let type: 'bokeh' | 'mote' | 'sparkle' = 'mote';
      let size = 0;
      let blur = 0;
      let haloScale = 2;
      let baseOpacity = 0.5;

      if (i % 5 === 0) {
        type = 'bokeh';
        size = 36 + ((i * 19) % 28);
        blur = 0;
        haloScale = 2.5;
        baseOpacity = 0.18 + ((i * 7) % 0.12);
      } else if (i % 6 === 1) {
        type = 'sparkle';
        size = 14 + ((i * 11) % 8);
        blur = 0;
        haloScale = 3;
        baseOpacity = 0.55 + ((i * 13) % 0.25);
      } else {
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
        const yPos = (p.initialY - frame * p.speedY * 1.5 + 1920) % 1920;
        const xOffset =
          Math.sin(frame * p.wobbleSpeed + p.id * 1.4) * p.wobbleRadius +
          Math.sin(frame * (p.wobbleSpeed * 0.5) + p.id) * 10;
        const xPos = (p.initialX + xOffset + 1080) % 1080;

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
                backgroundImage: `url(${isDarkTheme ? BOKEH_DARK_MOTE : BOKEH_LIGHT_MOTE})`,
                backgroundSize: 'cover',
                opacity: currentOpacity,
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
              }}
            >
              {/* Central Intense Light Core using static glow dot instead of dynamic boxShadow */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${isDarkTheme ? STANDARD_DARK_MOTE : STANDARD_LIGHT_MOTE})`,
                  backgroundSize: 'cover',
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
        return (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: xPos - p.size / 2,
              top: yPos - p.size / 2,
              width: p.size,
              height: p.size,
              backgroundImage: `url(${isDarkTheme ? STANDARD_DARK_MOTE : STANDARD_LIGHT_MOTE})`,
              backgroundSize: 'cover',
              opacity: currentOpacity,
              pointerEvents: 'none',
            }}
          />
        );
      })}
    </div>
  );
};
