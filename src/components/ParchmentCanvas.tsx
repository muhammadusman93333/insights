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
          zIndex: 2,
        }}
      >
        {/* Parchment Base Sheet with Organic Gradient & Charred Outer Soot */}
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 22,
            backgroundColor: paper.paperBgColor,
            background: paper.paperGradient,
            boxShadow: paper.burntShadow || '0 25px 60px rgba(0, 0, 0, 0.75)',
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
              borderRadius: 20,
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
                ? 'radial-gradient(circle at center, rgba(220, 160, 60, 0.08) 0%, rgba(220, 160, 60, 0.03) 40%, transparent 70%)'
                : 'radial-gradient(circle at center, rgba(160, 100, 40, 0.14) 0%, rgba(180, 120, 50, 0.06) 45%, transparent 75%)',
              pointerEvents: 'none',
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
                ? 'radial-gradient(circle at center, rgba(200, 140, 50, 0.07) 0%, rgba(200, 140, 50, 0.02) 45%, transparent 70%)'
                : 'radial-gradient(circle at center, rgba(140, 80, 25, 0.12) 0%, rgba(170, 110, 45, 0.05) 45%, transparent 75%)',
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>
      {/* 3. Ambient Candlelight Flame Warmth & Breathing Glow */}
      <div
        style={{
          position: 'absolute',
          bottom: '22%',
          left: '-5%',
          width: 800,
          height: 800,
          borderRadius: '50%',
          background: paper.isDark
            ? 'radial-gradient(circle, rgba(255, 170, 60, 0.28) 0%, rgba(255, 150, 45, 0.16) 25%, rgba(255, 130, 30, 0.07) 50%, transparent 70%)'
            : 'radial-gradient(circle, rgba(255, 210, 140, 0.35) 0%, rgba(255, 190, 110, 0.2) 30%, rgba(255, 170, 80, 0.08) 55%, transparent 70%)',
          transform: `scale(${candleFlicker})`,
          opacity: candleGlowOpacity,
          pointerEvents: 'none',
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
