import React from 'react';
import { interpolate, useCurrentFrame, staticFile, Img } from 'remotion';
import { PaperConfig } from '../utils/paperSelector';

interface ParchmentCanvasProps {
  paper: PaperConfig;
  children: React.ReactNode;
}

export const ParchmentCanvas: React.FC<ParchmentCanvasProps> = ({
  paper,
  children,
}) => {
  const frame = useCurrentFrame();

  // Organic candlelight flicker & breathing pulse
  const candleFlicker = interpolate(
    Math.sin(frame * 0.08) * Math.cos(frame * 0.05) + Math.sin(frame * 0.15) * 0.4,
    [-1.4, 1.4],
    [0.94, 1.06]
  );

  const candleGlowOpacity = interpolate(
    Math.sin(frame * 0.06),
    [-1, 1],
    [0.28, 0.42]
  );

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#0c0805',
        fontFamily: "'Jameel Noori Nastaleeq', 'Jameel Noori Nastaleeq Kasheeda', serif",
      }}
    >
      {/* 0. SVG Filter Definitions for Burnt Deckle Edges & Paper Texture */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
        <defs>
          {/* Organic burnt / torn deckle edge displacement */}
          <filter id="parchment-deckle" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.035"
              numOctaves={4}
              seed={5}
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={16}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          {/* Micro paper fiber texture grain */}
          <filter id="paper-fiber" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.75"
              numOctaves={3}
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.12  0 0 0 0 0.08  0 0 0 0 0.04  0 0 0 0 0.09 0"
            />
          </filter>
        </defs>
      </svg>
      {/* 1. Atmospheric Dark Antique Desk / Hearth Backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at 50% 45%, #1f140c 0%, #120b06 50%, #080402 100%)',
          zIndex: 1,
        }}
      />
      {/* 2. Main Centered Burnt Parchment Page */}
      <div
        style={{
          position: 'absolute',
          left: 55,
          top: 60,
          width: 970,
          height: 1800,
          filter: 'url(#parchment-deckle)',
          zIndex: 2,
        }}
      >
        {/* Parchment Base Sheet with Organic Gradient & Charred Outer Soot */}
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 18,
            backgroundColor: paper.paperBgColor,
            background: paper.paperGradient,
            boxShadow: paper.burntShadow,
            border: `3px solid ${paper.scorchedBorderColor}`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Real High-Resolution Parchment Texture from public/papers/main.jpg */}
          <Img
            src={staticFile('papers/main.jpg')}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              opacity: paper.isDark ? 0.35 : 0.65,
              mixBlendMode: paper.isDark ? 'screen' : 'multiply',
              pointerEvents: 'none',
              filter: 'contrast(1.08) brightness(1.02)',
              scale: "1.079 1.518",
              translate: "-16.9px 0px"
            }}
            from={-55} />
          {/* Scorched Perimeter Singe Gradient (Heavy Burnt Border) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 15,
              background: paper.isDark
                ? 'radial-gradient(ellipse at 50% 48%, transparent 55%, rgba(0, 0, 0, 0.75) 85%, rgba(0, 0, 0, 0.98) 100%)'
                : 'radial-gradient(ellipse at 50% 48%, transparent 52%, rgba(70, 30, 8, 0.25) 75%, rgba(26, 9, 2, 0.88) 96%, rgba(12, 3, 1, 0.98) 100%)',
              pointerEvents: 'none',
              mixBlendMode: 'multiply',
            }}
          />

          {/* Aged Manuscript Watermark / Tea Stain Imperfections */}
          <div
            style={{
              position: 'absolute',
              top: '18%',
              right: '10%',
              width: 380,
              height: 420,
              borderRadius: '60% 40% 70% 30% / 40% 50% 60% 50%',
              background: paper.isDark
                ? 'radial-gradient(circle, rgba(220, 160, 60, 0.06) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(160, 100, 40, 0.12) 0%, rgba(180, 120, 50, 0.05) 50%, transparent 75%)',
              pointerEvents: 'none',
              filter: 'blur(35px)',
            }}
          />

          <div
            style={{
              position: 'absolute',
              bottom: '22%',
              left: '8%',
              width: 440,
              height: 360,
              borderRadius: '45% 55% 35% 65% / 55% 45% 60% 40%',
              background: paper.isDark
                ? 'radial-gradient(circle, rgba(200, 140, 50, 0.05) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(140, 80, 25, 0.1) 0%, rgba(170, 110, 45, 0.04) 50%, transparent 75%)',
              pointerEvents: 'none',
              filter: 'blur(40px)',
            }}
          />

          {/* Micro Paper Texture Grain */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              filter: 'url(#paper-fiber)',
              opacity: 0.65,
              pointerEvents: 'none',
              mixBlendMode: 'overlay',
            }}
          />
        </div>
      </div>
      {/* 3. Ambient Candlelight Flame Warmth & Breathing Glow */}
      <div
        style={{
          position: 'absolute',
          top: '2%',
          left: '18%',
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: paper.isDark
            ? 'radial-gradient(circle, rgba(255, 180, 70, 0.22) 0%, rgba(255, 150, 40, 0.08) 45%, transparent 70%)'
            : 'radial-gradient(circle, rgba(255, 230, 160, 0.38) 0%, rgba(255, 200, 100, 0.15) 50%, transparent 70%)',
          transform: `scale(${candleFlicker})`,
          opacity: candleGlowOpacity,
          pointerEvents: 'none',
          filter: 'blur(60px)',
          zIndex: 3,
        }}
      />
      {/* 4. Cinematic Outer Viewport Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          boxShadow: 'inset 0 0 160px 50px rgba(4, 2, 1, 0.88)',
          pointerEvents: 'none',
          zIndex: 4,
        }}
      />
      {/* 5. Primary Video Content Layer (Header, Urdu Text, Qalam Nib, Footer) */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          zIndex: 10,
        }}
      >
        {children}
      </div>
    </div>
  );
};
