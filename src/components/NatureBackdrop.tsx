import React, { useMemo } from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, Img } from 'remotion';
import { resolveImageSrc } from '../utils/imageResolver';

interface NatureBackdropProps {
  backgroundImage?: string;
  primaryColor?: string;
  overlayOpacity?: number;
  showGodRays?: boolean;
  showNatureParticles?: boolean;
  kenBurnsZoom?: number;
}

export const NatureBackdrop: React.FC<NatureBackdropProps> = ({
  backgroundImage = 'nature/nature_sample.jpg',
  primaryColor = '#2d4a22',
  overlayOpacity = 0.42,
  showGodRays = true,
  showNatureParticles = true,
  kenBurnsZoom = 1.08,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const imageSrc = useMemo(() => {
    return resolveImageSrc(backgroundImage);
  }, [backgroundImage]);

  // Smooth Ken Burns zoom & slight cinematic vertical drift
  const scale = interpolate(frame, [0, durationInFrames], [1.02, kenBurnsZoom], {
    extrapolateRight: 'clamp',
  });

  const translateY = interpolate(frame, [0, durationInFrames], [0, -25], {
    extrapolateRight: 'clamp',
  });

  const translateX = interpolate(frame, [0, durationInFrames], [0, 8], {
    extrapolateRight: 'clamp',
  });

  // God rays shimmering light intensity
  const godRaysOpacity = interpolate(
    Math.sin(frame * 0.035) * Math.cos(frame * 0.02),
    [-1, 1],
    [0.15, 0.32]
  );

  // Light motes / golden sun dust particles
  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 28; i++) {
      const seed1 = ((i * 137.5) % 100) / 100;
      const seed2 = ((i * 293.7) % 100) / 100;
      const seed3 = ((i * 419.1) % 100) / 100;

      const size = 3 + Math.floor(seed1 * 7);
      const startX = 60 + seed2 * 960;
      const startY = 200 + seed3 * 1500;
      const speed = 0.4 + seed1 * 0.8;
      const sway = 25 + seed2 * 45;
      const freq = 0.02 + seed3 * 0.03;
      const opacity = 0.35 + seed1 * 0.45;

      arr.push({ id: i, size, startX, startY, speed, sway, freq, opacity });
    }
    return arr;
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: 1080,
        height: 1920,
        overflow: 'hidden',
        backgroundColor: '#071008',
      }}
    >
      {/* 1. Main Background Nature Image with Ken Burns camera movement */}
      <div
        style={{
          position: 'absolute',
          inset: -40,
          transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
          transformOrigin: 'center center',
          filter: 'contrast(1.04) brightness(0.95)',
        }}
      >
        <Img
          src={imageSrc}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
          from={-53} />
      </div>
      {/* 2. Primary Color Harmonizing Wash & Gradient Tint */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 50% 50%, transparent 20%, ${primaryColor} 120%)`,
          opacity: overlayOpacity * 0.7,
          mixBlendMode: 'multiply',
          pointerEvents: 'none',
        }}
      />
      {/* 3. Deep Cinematic Top and Bottom Readability Gradients */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg, rgba(6, 14, 8, 0.75) 0%, rgba(6, 14, 8, 0.2) 25%, rgba(6, 14, 8, 0.35) 60%, rgba(5, 12, 6, 0.85) 100%)`,
          pointerEvents: 'none',
        }}
      />
      {/* 4. Volumetric Sunlight God Rays */}
      {showGodRays && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: godRaysOpacity,
            pointerEvents: 'none',
            background: `linear-gradient(135deg, rgba(255, 245, 200, 0.45) 0%, rgba(255, 235, 170, 0.25) 20%, rgba(255, 230, 160, 0.1) 40%, transparent 70%),
                         linear-gradient(115deg, transparent 20%, rgba(255, 250, 220, 0.25) 45%, transparent 65%)`,
            mixBlendMode: 'screen',
          }}
        />
      )}
      {/* 5. Ambient Golden Sun Motes / Forest Dust / Fireflies */}
      {showNatureParticles && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 3,
          }}
        >
          {particles.map((p) => {
            const currentY = (p.startY - frame * p.speed + 1920) % 1920;
            const currentX = p.startX + Math.sin(frame * p.freq + p.id) * p.sway;
            const pulse = p.opacity * (0.7 + 0.3 * Math.sin(frame * 0.08 + p.id * 1.5));

            return (
              <div
                key={p.id}
                style={{
                  position: 'absolute',
                  left: currentX,
                  top: currentY,
                  width: p.size,
                  height: p.size,
                  borderRadius: '50%',
                  backgroundColor: '#fff3b0',
                  boxShadow: `0 0 ${p.size * 2}px rgba(255, 225, 130, 0.85)`,
                  opacity: pulse,
                }}
              />
            );
          })}
        </div>
      )}
      {/* 6. Cinematic Outer Frame Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          boxShadow: 'inset 0 0 180px 60px rgba(2, 6, 3, 0.75)',
          pointerEvents: 'none',
          zIndex: 4,
        }}
      />
    </div>
  );
};
