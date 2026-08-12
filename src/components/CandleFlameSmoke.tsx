import React, { useMemo } from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

interface CandleFlameSmokeProps {
  /** X coordinate of candle flame base on 1080x1920 canvas (default: ~139px) */
  flameX?: number;
  /** Y coordinate of candle flame base on 1080x1920 canvas (default: ~1200px) */
  flameY?: number;
  /** Global scale of flame & smoke (default: 1) */
  scale?: number;
  /** Whether to render the animated burning flame & inner core */
  showFlame?: boolean;
  /** Whether to render the rising curling smoke */
  showSmoke?: boolean;
  /** Whether to render tiny rising ember sparks */
  showSparks?: boolean;
  /** Dark theme adjustments */
  isDarkTheme?: boolean;
}

interface SmokePuff {
  id: number;
  lifeDuration: number;
  phaseOffset: number;
  speedY: number;
  driftX: number;
  driftFrequency: number;
  wobblePhase: number;
  startSize: number;
  endSize: number;
  maxOpacity: number;
  rotateSpeed: number;
  initialOffsetX: number;
}

interface Spark {
  id: number;
  lifeDuration: number;
  phaseOffset: number;
  speedY: number;
  driftX: number;
  wobbleSpeed: number;
  size: number;
}

export const CandleFlameSmoke: React.FC<CandleFlameSmokeProps> = ({
  flameX = 133,
  flameY = 1530,
  scale = 1.35,
  showFlame = true,
  showSmoke = true,
  showSparks = true,
  isDarkTheme = false,
}) => {
  const frame = useCurrentFrame();

  // 1. Organic Multi-Frequency Flame Flicker & Sway
  const flameFlicker =
    Math.sin(frame * 0.18) * 0.45 +
    Math.sin(frame * 0.35 + 1.2) * 0.35 +
    Math.sin(frame * 0.77 + 2.5) * 0.2;

  const flameHeightScale = interpolate(flameFlicker, [-1, 1], [0.92, 1.09]);
  const flameWidthScale = interpolate(flameFlicker, [-1, 1], [1.05, 0.94]);
  const flameSwayDeg =
    Math.sin(frame * 0.12) * 3.5 + Math.sin(frame * 0.28 + 0.8) * 2.0;
  const flameGlowPulse = interpolate(flameFlicker, [-1, 1], [0.82, 1.15]);

  // 2. Generate Static Seeds for Organic Smoke Puffs (Optimized count for fast rendering)
  const smokeParticles: SmokePuff[] = useMemo(() => {
    const list: SmokePuff[] = [];
    const count = 10;
    for (let i = 0; i < count; i++) {
      list.push({
        id: i,
        lifeDuration: 90 + ((i * 19) % 50),
        phaseOffset: (i * 35) % 130,
        speedY: 2.8 + ((i * 7) % 1.6),
        driftX: 45 + ((i * 13) % 45),
        driftFrequency: 0.02 + ((i * 3) % 0.025),
        wobblePhase: (i * 1.7) % (Math.PI * 2),
        startSize: 14 + ((i * 5) % 10),
        endSize: 100 + ((i * 17) % 50),
        maxOpacity: 0.22 + ((i * 7) % 0.14),
        rotateSpeed: (((i % 2 === 0 ? 1 : -1) * (0.4 + (i % 5) * 0.2))),
        initialOffsetX: ((i * 11) % 14) - 7,
      });
    }
    return list;
  }, []);

  // 3. Generate Micro Sparks / Floating Fiery Embers
  const sparks: Spark[] = useMemo(() => {
    const list: Spark[] = [];
    const count = 5;
    for (let i = 0; i < count; i++) {
      list.push({
        id: i,
        lifeDuration: 38 + ((i * 11) % 25),
        phaseOffset: (i * 17) % 55,
        speedY: 4.2 + ((i * 5) % 2.5),
        driftX: 30 + ((i * 9) % 35),
        wobbleSpeed: 0.08 + ((i * 3) % 0.06),
        size: 1.8 + ((i * 3) % 2.2),
      });
    }
    return list;
  }, []);

  // Smoke start origin (just at the tip of the flame)
  const smokeOriginX = flameX;
  const smokeOriginY = flameY - 56 * scale;

  // Animated Wispy Ribbon Smoke Points (Smooth flowing tendril)
  const ribbonWobble1 = Math.sin(frame * 0.09) * 14;
  const ribbonWobble2 = Math.sin(frame * 0.07 + 1.2) * 28;
  const ribbonWobble3 = Math.sin(frame * 0.05 + 2.4) * 45;

  const ribbonP0 = { x: smokeOriginX, y: smokeOriginY };
  const ribbonP1 = { x: smokeOriginX + 6 + ribbonWobble1, y: smokeOriginY - 80 * scale };
  const ribbonP2 = { x: smokeOriginX + 18 + ribbonWobble2, y: smokeOriginY - 170 * scale };
  const ribbonP3 = { x: smokeOriginX + 35 + ribbonWobble3, y: smokeOriginY - 270 * scale };

  const ribbonPath = `M ${ribbonP0.x} ${ribbonP0.y} C ${ribbonP1.x} ${ribbonP1.y}, ${ribbonP2.x} ${ribbonP2.y}, ${ribbonP3.x} ${ribbonP3.y}`;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 12,
      }}
    >
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: 1080,
          height: 1920,
          pointerEvents: 'none',
        }}
      >
        <defs>
          {/* Flame Ambient Radial Gradients with built-in smooth falloff */}
          <radialGradient id="candle-wide-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff9514" stopOpacity={0.6 * flameGlowPulse} />
            <stop offset="25%" stopColor="#ff7500" stopOpacity={0.35 * flameGlowPulse} />
            <stop offset="50%" stopColor="#ff5500" stopOpacity={0.15 * flameGlowPulse} />
            <stop offset="75%" stopColor="#ff3a00" stopOpacity={0.04 * flameGlowPulse} />
            <stop offset="100%" stopColor="#ff2200" stopOpacity={0} />
          </radialGradient>

          <radialGradient id="candle-core-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff6d2" stopOpacity={0.95 * flameGlowPulse} />
            <stop offset="30%" stopColor="#ffb834" stopOpacity={0.75 * flameGlowPulse} />
            <stop offset="70%" stopColor="#ff7700" stopOpacity={0.25 * flameGlowPulse} />
            <stop offset="100%" stopColor="#ff5500" stopOpacity={0} />
          </radialGradient>

          {/* Smoke Ribbon Gradient */}
          <linearGradient id="smoke-ribbon-grad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ffd899" stopOpacity={0.45} />
            <stop offset="25%" stopColor="#e8cfb0" stopOpacity={0.32} />
            <stop offset="60%" stopColor="#cfc4b6" stopOpacity={0.16} />
            <stop offset="100%" stopColor="#b8aba0" stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* 1. Large Ambient Candle Glow Illuminating Corner & Canvas */}
        <circle
          cx={flameX}
          cy={flameY}
          r={260 * scale}
          fill="url(#candle-wide-halo)"
          style={{ mixBlendMode: 'screen' }}
        />

        {/* 2. Concentrated Near-Field Flame Core Glow */}
        <circle
          cx={flameX}
          cy={flameY - 10 * scale}
          r={95 * scale}
          fill="url(#candle-core-halo)"
          style={{ mixBlendMode: 'screen' }}
        />

        {/* 3. Wispy Smoke Tendril / Ribbon */}
        {showSmoke && (
          <path
            d={ribbonPath}
            fill="none"
            stroke="url(#smoke-ribbon-grad)"
            strokeWidth={5 * scale}
            strokeLinecap="round"
            style={{
              mixBlendMode: isDarkTheme ? 'screen' : 'multiply',
              opacity: 0.75,
            }}
          />
        )}
      </svg>

      {/* 4. Organic Volumetric Smoke Puffs */}
      {showSmoke && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
          }}
        >
          {smokeParticles.map((p) => {
            const age = (frame + p.phaseOffset) % p.lifeDuration;
            const progress = age / p.lifeDuration; // 0.0 to 1.0

            // Physics calculation: smooth deceleration upwards + natural curling draft
            const easeY = 1 - Math.pow(1 - progress, 1.4);
            const currentY = smokeOriginY - easeY * (520 * scale);
            
            // Horizontal drifting with gentle wind and turbulence
            const driftProgress = Math.sin(progress * Math.PI * 1.5 + p.wobblePhase);
            const currentX =
              smokeOriginX +
              p.initialOffsetX +
              progress * (p.driftX * scale) +
              driftProgress * (18 * scale);

            // Expansion & Dissipation
            const currentSize =
              (p.startSize + (p.endSize - p.startSize) * Math.pow(progress, 0.8)) * scale;

            // Opacity curve: soft fade in at wick, strong body, gradual vanishing
            let currentOpacity = 0;
            if (progress < 0.15) {
              currentOpacity = interpolate(progress, [0, 0.15], [0, p.maxOpacity]);
            } else {
              currentOpacity = interpolate(
                progress,
                [0.15, 0.65, 1.0],
                [p.maxOpacity, p.maxOpacity * 0.6, 0]
              );
            }

            // Warm golden illuminated smoke near candle, cooling to parchment incense smoke higher up
            const isNearFlame = progress < 0.28;
            const smokeColor = isNearFlame
              ? isDarkTheme
                ? `rgba(255, 205, 130, ${currentOpacity * 1.2})`
                : `rgba(215, 160, 95, ${currentOpacity * 1.1})`
              : isDarkTheme
              ? `rgba(210, 195, 180, ${currentOpacity * 0.85})`
              : `rgba(140, 125, 110, ${currentOpacity * 0.9})`;

            const rotation = frame * p.rotateSpeed + p.id * 30;

            return (
              <div
                key={p.id}
                style={{
                  position: 'absolute',
                  left: currentX - currentSize / 2,
                  top: currentY - currentSize / 2,
                  width: currentSize,
                  height: currentSize,
                  borderRadius: '50%',
                  background: `radial-gradient(circle at center, ${smokeColor} 0%, ${smokeColor.replace(
                    /[\d\.]+\)$/,
                    '0.2)'
                  )} 40%, transparent 70%)`,
                  transform: `rotate(${rotation}deg) scale(${1 + progress * 0.3})`,
                  mixBlendMode: isDarkTheme ? 'screen' : 'multiply',
                  pointerEvents: 'none',
                }}
              />
            );
          })}
        </div>
      )}

      {/* 5. Animated Procedural Candle Flame (Realistic Dancing Multi-Layer Flame) */}
      {showFlame && (
        <div
          style={{
            position: 'absolute',
            left: flameX,
            top: flameY,
            transform: `translate(-50%, -100%) scale(${scale})`,
            pointerEvents: 'none',
            transformOrigin: 'bottom center',
          }}
        >
          {/* Flame Base Container with Organic Sway and Height/Width Breathing */}
          <div
            style={{
              position: 'relative',
              width: 32,
              height: 72,
              transformOrigin: 'bottom center',
              transform: `scale(${flameWidthScale}, ${flameHeightScale}) rotate(${flameSwayDeg}deg)`,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
          >
            {/* A. Outer Fiery Orange/Gold Teardrop Flame Body */}
            <div
              style={{
                position: 'absolute',
                bottom: 2,
                width: 24,
                height: 58,
                borderRadius: '50% 50% 35% 35% / 60% 60% 40% 40%',
                background:
                  'linear-gradient(to top, rgba(255, 60, 0, 0.95) 0%, rgba(255, 140, 0, 0.95) 30%, rgba(255, 215, 20, 0.98) 70%, rgba(255, 250, 210, 1) 100%)',
                boxShadow:
                  '0 0 14px 4px rgba(255, 140, 0, 0.85), 0 0 28px 10px rgba(255, 80, 0, 0.45)',
                filter: 'url(#flame-blur)',
                mixBlendMode: 'screen',
              }}
            />

            {/* B. Inner Brilliant White-Hot Teardrop Core */}
            <div
              style={{
                position: 'absolute',
                bottom: 4,
                width: 12,
                height: 32,
                borderRadius: '50% 50% 35% 35% / 60% 60% 40% 40%',
                background:
                  'linear-gradient(to top, rgba(255, 230, 140, 0.8) 0%, rgba(255, 255, 255, 1) 50%, #ffffff 100%)',
                boxShadow: '0 0 8px 3px rgba(255, 255, 255, 0.9)',
                filter: 'blur(0.6px)',
                mixBlendMode: 'screen',
              }}
            />

            {/* C. Physical Blue Flame Base (Oxygen rich combustion zone at wick) */}
            <div
              style={{
                position: 'absolute',
                bottom: -2,
                width: 14,
                height: 10,
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, rgba(70, 140, 255, 0.85) 0%, rgba(30, 80, 220, 0.4) 60%, transparent 100%)',
                filter: 'blur(0.8px)',
                mixBlendMode: 'screen',
              }}
            />
          </div>
        </div>
      )}

      {/* 6. Rising Fiery Sparks / Floating Glowing Embers */}
      {showSparks && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
          }}
        >
          {sparks.map((s) => {
            const age = (frame + s.phaseOffset) % s.lifeDuration;
            const progress = age / s.lifeDuration;

            const sparkY = flameY - 30 * scale - progress * (220 * scale + s.id * 15);
            const sparkDrift =
              Math.sin(frame * s.wobbleSpeed + s.id * 2) * (14 * scale) +
              progress * (s.driftX * scale);
            const sparkX = flameX + sparkDrift;

            // Spark cools from yellow-white to red-orange to transparent
            let sparkColor = '#fff5a0';
            let sparkGlow = 'rgba(255, 200, 50, 0.8)';
            if (progress > 0.4) {
              sparkColor = '#ff9922';
              sparkGlow = 'rgba(255, 120, 20, 0.6)';
            }
            if (progress > 0.75) {
              sparkColor = '#ff4411';
              sparkGlow = 'rgba(255, 50, 0, 0.3)';
            }

            const sparkOpacity = interpolate(
              progress,
              [0, 0.2, 0.7, 1.0],
              [0, 1, 0.8, 0]
            );

            return (
              <div
                key={s.id}
                style={{
                  position: 'absolute',
                  left: sparkX,
                  top: sparkY,
                  width: s.size * scale,
                  height: s.size * scale * (1 + (1 - progress) * 0.8), // slight vertical stretch while moving fast
                  borderRadius: '50%',
                  backgroundColor: sparkColor,
                  boxShadow: `0 0 ${s.size * 3}px ${sparkGlow}`,
                  opacity: sparkOpacity,
                  filter: 'blur(0.3px)',
                  mixBlendMode: 'screen',
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
