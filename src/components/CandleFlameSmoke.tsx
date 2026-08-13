import React, { useMemo } from 'react';
import { interpolate, useCurrentFrame, Img, staticFile } from 'remotion';
import { createGlowDot, createFlameImage } from '../utils/canvasGlow';
import { brightness } from "@remotion/effects/brightness";

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

// Pre-render static glows once at startup to avoid runtime CPU filter blurs
const CANDLE_GLOW_WIDE = createGlowDot('rgba(255, 149, 20, 0.45)', 512);
const CANDLE_GLOW_CORE = createGlowDot('rgba(255, 240, 200, 0.85)', 256);
const SMOKE_PUFF_LIGHT = createGlowDot('rgba(215, 160, 95, 0.35)', 128);
const SMOKE_PUFF_DARK = createGlowDot('rgba(210, 195, 180, 0.3)', 128);
const SMOKE_PUFF_COOL_LIGHT = createGlowDot('rgba(140, 125, 110, 0.25)', 128);
const SMOKE_PUFF_COOL_DARK = createGlowDot('rgba(140, 125, 110, 0.2)', 128);
const FLAME_IMAGE = createFlameImage();

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
      {/* 1. Large Ambient Candle Glow (drawn using pre-rendered texture for high performance) */}
      <div
        style={{
          position: 'absolute',
          left: flameX,
          top: flameY,
          width: 520 * scale,
          height: 520 * scale,
          transform: 'translate(-50%, -50%)',
          backgroundImage: `url(${CANDLE_GLOW_WIDE})`,
          backgroundSize: 'cover',
          opacity: flameGlowPulse,
          pointerEvents: 'none',
        }}
      />
      {/* 2. Concentrated Near-Field Flame Core Glow */}
      <div
        style={{
          position: 'absolute',
          left: flameX,
          top: flameY - 10 * scale,
          width: 190 * scale,
          height: 190 * scale,
          transform: 'translate(-50%, -50%)',
          backgroundImage: `url(${CANDLE_GLOW_CORE})`,
          backgroundSize: 'cover',
          opacity: flameGlowPulse,
          pointerEvents: 'none',
        }}
      />
      {/* 3. Wispy Smoke Tendril / Ribbon */}
      {showSmoke && (
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
            <linearGradient id="smoke-ribbon-grad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#ffd899" stopOpacity={0.45} />
              <stop offset="25%" stopColor="#e8cfb0" stopOpacity={0.32} />
              <stop offset="60%" stopColor="#cfc4b6" stopOpacity={0.16} />
              <stop offset="100%" stopColor="#b8aba0" stopOpacity={0} />
            </linearGradient>
          </defs>
          <path
            d={ribbonPath}
            fill="none"
            stroke="url(#smoke-ribbon-grad)"
            strokeWidth={5 * scale}
            strokeLinecap="round"
            style={{
              opacity: 0.75,
            }}
          />
        </svg>
      )}
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
            const progress = age / p.lifeDuration;

            const easeY = 1 - Math.pow(1 - progress, 1.4);
            const currentY = smokeOriginY - easeY * (520 * scale);

            const driftProgress = Math.sin(progress * Math.PI * 1.5 + p.wobblePhase);
            const currentX =
              smokeOriginX +
              p.initialOffsetX +
              progress * (p.driftX * scale) +
              driftProgress * (18 * scale);

            const currentSize =
              (p.startSize + (p.endSize - p.startSize) * Math.pow(progress, 0.8)) * scale;

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

            const isNearFlame = progress < 0.28;
            const smokeImage = isNearFlame
              ? isDarkTheme
                ? SMOKE_PUFF_DARK
                : SMOKE_PUFF_LIGHT
              : isDarkTheme
                ? SMOKE_PUFF_COOL_DARK
                : SMOKE_PUFF_COOL_LIGHT;

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
                  backgroundImage: `url(${smokeImage})`,
                  backgroundSize: 'cover',
                  opacity: currentOpacity,
                  transform: `rotate(${rotation}deg) scale(${1 + progress * 0.3})`,
                  pointerEvents: 'none',
                }}
              />
            );
          })}
        </div>
      )}
      {/* 5. Animated Procedural Candle Flame (Pre-rendered single image for maximum speed) */}
      {showFlame && (
        <div
          style={{
            position: 'absolute',
            left: flameX,
            top: flameY,
            width: 64 * scale,
            height: 128 * scale,
            transform: `translate(-50%, -100%) scale(${flameWidthScale}, ${flameHeightScale}) rotate(${flameSwayDeg}deg)`,
            transformOrigin: 'bottom center',
            pointerEvents: 'none',
          }}
        >
          <Img
            src={FLAME_IMAGE}
            style={{
              width: '100%',
              height: '100%',
              translate: "4px 73.1px",
              scale: "0.878 0.97",
              rotate: "-4.9deg"
            }} />
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

            let sparkColor = '#fff5a0';
            if (progress > 0.4) sparkColor = '#ff9922';
            if (progress > 0.75) sparkColor = '#ff4411';

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
                  height: s.size * scale * (1 + (1 - progress) * 0.8),
                  borderRadius: '50%',
                  backgroundColor: sparkColor,
                  opacity: sparkOpacity,
                  pointerEvents: 'none',
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
