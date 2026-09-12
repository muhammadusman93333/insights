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
  enableLivingBackground?: boolean;
  waveMotion?: boolean;
  showLightLeaks?: boolean;
  showMist?: boolean;
}

export const NatureBackdrop: React.FC<NatureBackdropProps> = ({
  backgroundImage = 'nature/nature_sample.jpg',
  primaryColor = '#2d4a22',
  overlayOpacity = 0.42,
  showGodRays = true,
  showNatureParticles = true,
  kenBurnsZoom = 1.08,
  enableLivingBackground = true,
  waveMotion = true,
  showLightLeaks = true,
  showMist = true,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const imageSrc = useMemo(() => {
    return resolveImageSrc(backgroundImage);
  }, [backgroundImage]);

  // 1. Organic Multi-Axis Camera Motion (Cinematic Handheld / Drone Glide)
  const baseScale = interpolate(frame, [0, durationInFrames], [1.04, kenBurnsZoom], {
    extrapolateRight: 'clamp',
  });
  // Subtle camera breathing (expansion/contraction like a drone gliding)
  const cameraBreathing = Math.sin(frame * 0.016) * 0.008;
  const currentScale = baseScale + cameraBreathing;

  // Multi-frequency Lissajous camera pan
  const translateX =
    interpolate(frame, [0, durationInFrames], [-8, 14], { extrapolateRight: 'clamp' }) +
    Math.sin(frame * 0.022) * 7 +
    Math.cos(frame * 0.038) * 3;

  const translateY =
    interpolate(frame, [0, durationInFrames], [0, -32], { extrapolateRight: 'clamp' }) +
    Math.cos(frame * 0.019) * 6;

  // Micro camera roll tilt (operator or gimbal tilt ±0.3deg)
  const cameraRoll = Math.sin(frame * 0.015) * 0.32;

  // 2. Dynamic Exposure Breathing (Simulates sunlight filtering through swaying trees & moving clouds)
  const dynamicBrightness = 0.98 + Math.sin(frame * 0.022) * 0.032;
  const dynamicContrast = 1.04 + Math.cos(frame * 0.018) * 0.03;

  // 3. Volumetric Sunlight God Rays Shimmer
  const godRaysOpacity = interpolate(
    Math.sin(frame * 0.032) * Math.cos(frame * 0.018),
    [-1, 1],
    [0.16, 0.34]
  );
  const godRaysAngle = 135 + Math.sin(frame * 0.012) * 3.5;

  // 4. Multi-Tier Living Atmosphere Particles (Bokeh, Midground Spores, Twinkling Motes)
  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 34; i++) {
      const seed1 = ((i * 137.5) % 100) / 100;
      const seed2 = ((i * 293.7) % 100) / 100;
      const seed3 = ((i * 419.1) % 100) / 100;

      // Tier: 0 = foreground blurry bokeh (large, fast), 1 = midground pollen/firefly, 2 = background mote
      const tier = i % 7 === 0 ? 0 : i % 3 === 0 ? 1 : 2;

      const size = tier === 0 ? 14 + seed1 * 12 : tier === 1 ? 5 + seed1 * 4 : 2 + seed1 * 2;
      const blur = tier === 0 ? 5 : tier === 1 ? 0 : 0.5;
      const startX = 40 + seed2 * 1000;
      const startY = 150 + seed3 * 1600;
      const speed = tier === 0 ? 0.8 + seed1 * 0.6 : tier === 1 ? 0.4 + seed1 * 0.5 : 0.2 + seed1 * 0.3;
      const sway = tier === 0 ? 40 + seed2 * 30 : 20 + seed2 * 35;
      const freq = 0.018 + seed3 * 0.025;
      const opacity = tier === 0 ? 0.18 + seed1 * 0.15 : tier === 1 ? 0.45 + seed1 * 0.4 : 0.3 + seed1 * 0.35;

      arr.push({ id: i, tier, size, blur, startX, startY, speed, sway, freq, opacity });
    }
    return arr;
  }, []);

  // 5. Volumetric Drifting Mist Coordinates
  const mist1Offset = ((frame * 0.55) % 1400) - 200;
  const mist2Offset = ((-frame * 0.38) % 1400) + 100;
  const mistPulse = 0.16 + Math.sin(frame * 0.02) * 0.04;

  // 6. Cinematic Procedural Light Leak (Safe, Universal CSS/SVG Blend - No WebGL2 Crash)
  const leakProgress = interpolate(frame, [0, durationInFrames], [0.15, 0.85], {
    extrapolateRight: 'clamp',
  });
  const leakX = interpolate(leakProgress, [0, 1], [-150, 450]);
  const leakY = interpolate(leakProgress, [0, 1], [-100, 300]);
  const leakOpacity = interpolate(
    Math.sin(leakProgress * Math.PI),
    [0, 1],
    [0.18, 0.46]
  );

  // 7. Organic Water & Foliage Wave Distortion (Driven by SVG Turbulence)
  // Base frequency gently oscillates to simulate continuous fluid ripples
  const freqY = 0.015 + Math.sin(frame * 0.025) * 0.003;
  const freqX = 0.008 + Math.cos(frame * 0.02) * 0.002;
  const displacementScale = enableLivingBackground && waveMotion ? 6.5 + Math.sin(frame * 0.035) * 2.5 : 0;

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
      {/* Universal SVG Turbulence & Displacement Filter for Living Nature Wave Motion */}
      {enableLivingBackground && waveMotion && (
        <svg
          width="0"
          height="0"
          style={{ position: 'absolute', pointerEvents: 'none', opacity: 0 }}
        >
          <defs>
            <filter
              id="nature-wave-filter"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
              colorInterpolationFilters="sRGB"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency={`${freqX} ${freqY}`}
                numOctaves="2"
                seed={(Math.floor(frame * 0.08) % 60) + 1}
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale={displacementScale}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
      )}

      {/* 1. Main Background Nature Canvas with Living Wave Motion & Compound Camera Glide */}
      <div
        style={{
          position: 'absolute',
          inset: -70,
          transform: `scale(${currentScale}) translate(${translateX}px, ${translateY}px) rotate(${cameraRoll}deg)`,
          transformOrigin: '50% 50%',
          filter: enableLivingBackground && waveMotion
            ? `url(#nature-wave-filter) contrast(${dynamicContrast}) brightness(${dynamicBrightness})`
            : `contrast(${dynamicContrast}) brightness(${dynamicBrightness})`,
          willChange: 'transform',
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
        />
      </div>

      {/* 2. Primary Color Harmonizing Wash */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 50% 50%, transparent 20%, ${primaryColor} 120%)`,
          opacity: overlayOpacity * 0.65,
          mixBlendMode: 'multiply',
          pointerEvents: 'none',
        }}
      />

      {/* 3. Deep Cinematic Gradients for Calligraphy Readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg, rgba(5, 12, 6, 0.72) 0%, rgba(5, 12, 6, 0.18) 25%, rgba(5, 12, 6, 0.32) 60%, rgba(4, 10, 5, 0.85) 100%)`,
          pointerEvents: 'none',
        }}
      />

      {/* 4. Volumetric Drifting Mist & Fog Planes */}
      {showMist && (
        <>
          {/* Lower Valley / Forest Mist */}
          <div
            style={{
              position: 'absolute',
              left: -300,
              bottom: 120,
              width: 1680,
              height: 480,
              transform: `translateX(${mist1Offset}px)`,
              background: 'radial-gradient(ellipse 65% 50% at 50% 50%, rgba(220, 245, 230, 0.32) 0%, rgba(180, 220, 195, 0.15) 50%, transparent 80%)',
              filter: 'blur(35px)',
              opacity: mistPulse,
              mixBlendMode: 'screen',
              pointerEvents: 'none',
            }}
          />
          {/* Midground Atmospheric Haze */}
          <div
            style={{
              position: 'absolute',
              left: -200,
              top: 500,
              width: 1500,
              height: 400,
              transform: `translateX(${mist2Offset}px)`,
              background: 'radial-gradient(ellipse 70% 45% at 50% 50%, rgba(240, 250, 235, 0.22) 0%, rgba(200, 230, 210, 0.08) 55%, transparent 75%)',
              filter: 'blur(45px)',
              opacity: mistPulse * 0.85,
              mixBlendMode: 'screen',
              pointerEvents: 'none',
            }}
          />
        </>
      )}

      {/* 5. Volumetric Sunlight God Rays */}
      {showGodRays && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: godRaysOpacity,
            pointerEvents: 'none',
            background: `linear-gradient(${godRaysAngle}deg, rgba(255, 245, 205, 0.45) 0%, rgba(255, 235, 175, 0.25) 20%, rgba(255, 230, 160, 0.1) 40%, transparent 70%),
                         linear-gradient(${godRaysAngle - 20}deg, transparent 20%, rgba(255, 250, 225, 0.25) 45%, transparent 65%)`,
            mixBlendMode: 'screen',
          }}
        />
      )}

      {/* 6. Cinematic Sun Light Leak Overlay (Safe High-End Optical Sweep) */}
      {showLightLeaks && (
        <div
          style={{
            position: 'absolute',
            inset: -100,
            opacity: leakOpacity,
            pointerEvents: 'none',
            mixBlendMode: 'screen',
            zIndex: 2,
            background: `radial-gradient(circle 600px at ${leakX}px ${leakY}px, rgba(255, 215, 130, 0.7) 0%, rgba(255, 170, 70, 0.35) 40%, rgba(240, 110, 30, 0.12) 65%, transparent 80%),
                         radial-gradient(circle 800px at ${leakX + 200}px ${leakY - 80}px, rgba(255, 240, 190, 0.5) 0%, rgba(255, 200, 110, 0.25) 45%, transparent 75%)`,
          }}
        />
      )}

      {/* 7. Multi-Tier Living Nature Particles (Bokeh, Fireflies, Spores) */}
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
            const pulse =
              p.opacity *
              (0.75 + 0.25 * Math.sin(frame * 0.08 + p.id * 1.4));

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
                  backgroundColor: p.tier === 0 ? 'rgba(255, 248, 210, 0.6)' : '#fff3b0',
                  boxShadow:
                    p.tier === 0
                      ? '0 0 16px rgba(255, 235, 150, 0.4)'
                      : `0 0 ${p.size * 2.5}px rgba(255, 225, 130, 0.85)`,
                  filter: p.blur > 0 ? `blur(${p.blur}px)` : undefined,
                  opacity: pulse,
                }}
              />
            );
          })}
        </div>
      )}

      {/* 8. Dynamic Sensor Film Micro-Grain (Breathing Living Pixels) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.038,
          mixBlendMode: 'overlay',
          zIndex: 4,
          backgroundImage: `radial-gradient(rgba(255,255,255,0.8) 1px, transparent 0)`,
          backgroundSize: '3px 3px',
          transform: `translate(${(frame % 5) * 1.5}px, ${(frame % 7) * 1.5}px)`,
        }}
      />

      {/* 9. Cinematic Outer Frame Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          boxShadow: 'inset 0 0 190px 65px rgba(2, 6, 3, 0.8)',
          pointerEvents: 'none',
          zIndex: 5,
        }}
      />
    </div>
  );
};
