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
  count = 36,
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

      if (i % 6 === 0) {
        // Large dreamy out-of-focus bokeh light orbs (foreground/depth)
        type = 'bokeh';
        size = 32 + ((i * 19) % 36); // 32px to 68px
        blur = 4 + ((i * 3) % 6); // 4px to 10px blur
        haloScale = 2.5;
        baseOpacity = 0.18 + ((i * 7) % 0.15); // soft translucent glow
      } else if (i % 7 === 1) {
        // Occasional diamond / star twinkling light specks
        type = 'sparkle';
        size = 12 + ((i * 11) % 10); // 12px to 22px
        blur = 0.5;
        haloScale = 3.5;
        baseOpacity = 0.55 + ((i * 13) % 0.35);
      } else {
        // Medium luminous golden light motes
        type = 'mote';
        size = 8 + ((i * 17) % 18); // 8px to 26px
        blur = 1.2 + ((i * 5) % 2.5);
        haloScale = 2.8;
        baseOpacity = 0.4 + ((i * 11) % 0.35);
      }

      list.push({
        id: i,
        type,
        initialX: (i * 37 + 45) % 1080,
        initialY: (i * 61 + 110) % 1920,
        size,
        blur,
        haloScale,
        speedY: 0.25 + ((i * 7) % 0.55),
        speedX: 0.1 + ((i * 11) % 0.3),
        wobbleSpeed: 0.015 + ((i * 5) % 0.03),
        wobbleRadius: 20 + ((i * 13) % 35),
        baseOpacity,
        twinkleSpeed: 0.04 + ((i * 7) % 0.08),
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
          Math.sin(frame * (p.wobbleSpeed * 0.5) + p.id) * 12;
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
                  ? `radial-gradient(circle, rgba(255, 215, 130, ${currentOpacity}) 0%, rgba(255, 175, 70, ${currentOpacity * 0.4}) 50%, transparent 75%)`
                  : `radial-gradient(circle, rgba(255, 200, 100, ${currentOpacity * 1.1}) 0%, rgba(220, 150, 50, ${currentOpacity * 0.45}) 50%, transparent 75%)`,
                filter: `blur(${p.blur}px)`,
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
                  boxShadow: `0 0 ${p.size * 1.5}px rgba(255, 220, 120, ${starGlow}), 0 0 ${p.size * 3}px rgba(255, 170, 40, ${starGlow * 0.7})`,
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
                  filter: 'blur(0.4px)',
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
                  filter: 'blur(0.4px)',
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
              background: `radial-gradient(circle, rgba(${coreColor}, ${currentOpacity * 1.1}) 0%, rgba(${glowColor}, ${currentOpacity * 0.8}) 40%, rgba(${glowColor}, 0) 75%)`,
              boxShadow: `0 0 ${p.size * 1.8}px rgba(${glowColor}, ${currentOpacity * 0.85}), 0 0 ${p.size * 3.5}px rgba(255, 140, 30, ${currentOpacity * 0.45})`,
              filter: `blur(${p.blur}px)`,
              mixBlendMode: isDarkTheme ? 'screen' : 'screen',
              pointerEvents: 'none',
            }}
          />
        );
      })}
    </div>
  );
};
