import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

interface NatureCanvasProps {
  primaryColor?: string;
  accentColor?: string;
  showGlassCard?: boolean;
  children: React.ReactNode;
}

export const NatureCanvas: React.FC<NatureCanvasProps> = ({
  primaryColor = '#2d4a22',
  accentColor = '#dfb76c',
  showGlassCard = true,
  children,
}) => {
  const frame = useCurrentFrame();

  // Subtle breathing pulse on the glass card border
  const glowPulse = interpolate(
    Math.sin(frame * 0.05),
    [-1, 1],
    [0.35, 0.7]
  );

  return (
    <div
      style={{
        position: 'relative',
        width: 1080,
        height: 1920,
        overflow: 'hidden',
        fontFamily: "'Jameel Noori Nastaleeq', 'Jameel Noori Nastaleeq Kasheeda', serif",
        zIndex: 10,
      }}
    >
      {/* Optional Frosted Nature Glassmorphism Card */}
      {showGlassCard && (
        <div
          style={{
            position: 'absolute',
            left: 55,
            top: 70,
            width: 970,
            height: 1780,
            borderRadius: 24,
            backgroundColor: 'rgba(10, 24, 14, 0.45)',
            border: `1.5px solid rgba(223, 183, 108, ${glowPulse * 0.5})`,
            boxShadow: `
              0 20px 50px rgba(0, 0, 0, 0.5),
              inset 0 0 60px rgba(0, 0, 0, 0.4),
              inset 0 1px 2px rgba(255, 255, 255, 0.15)
            `,
            pointerEvents: 'none',
            zIndex: 1,
            overflow: 'hidden',
          }}
        >
          {/* Subtle Primary Color Glow Tint inside Card */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(ellipse at 50% 30%, ${primaryColor} 0%, transparent 75%)`,
              opacity: 0.28,
              mixBlendMode: 'screen',
            }}
          />

          {/* Elegant Corner Filigree Leaf/Floral Ornaments */}
          {/* Top-Left */}
          <svg
            style={{
              position: 'absolute',
              top: 14,
              left: 14,
              width: 50,
              height: 50,
              opacity: 0.75,
            }}
            viewBox="0 0 50 50"
            fill="none"
          >
            <path
              d="M2 48 V 14 C 2 7.37 7.37 2 14 2 H 48"
              stroke={accentColor}
              strokeWidth="1.5"
            />
            <circle cx="14" cy="14" r="3" fill={accentColor} />
            <path
              d="M14 2 Q 26 14 38 2 Q 26 26 2 38"
              stroke={accentColor}
              strokeWidth="0.8"
              opacity="0.6"
            />
          </svg>

          {/* Top-Right */}
          <svg
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              width: 50,
              height: 50,
              opacity: 0.75,
              transform: 'scaleX(-1)',
            }}
            viewBox="0 0 50 50"
            fill="none"
          >
            <path
              d="M2 48 V 14 C 2 7.37 7.37 2 14 2 H 48"
              stroke={accentColor}
              strokeWidth="1.5"
            />
            <circle cx="14" cy="14" r="3" fill={accentColor} />
            <path
              d="M14 2 Q 26 14 38 2 Q 26 26 2 38"
              stroke={accentColor}
              strokeWidth="0.8"
              opacity="0.6"
            />
          </svg>

          {/* Bottom-Left */}
          <svg
            style={{
              position: 'absolute',
              bottom: 14,
              left: 14,
              width: 50,
              height: 50,
              opacity: 0.75,
              transform: 'scaleY(-1)',
            }}
            viewBox="0 0 50 50"
            fill="none"
          >
            <path
              d="M2 48 V 14 C 2 7.37 7.37 2 14 2 H 48"
              stroke={accentColor}
              strokeWidth="1.5"
            />
            <circle cx="14" cy="14" r="3" fill={accentColor} />
            <path
              d="M14 2 Q 26 14 38 2 Q 26 26 2 38"
              stroke={accentColor}
              strokeWidth="0.8"
              opacity="0.6"
            />
          </svg>

          {/* Bottom-Right */}
          <svg
            style={{
              position: 'absolute',
              bottom: 14,
              right: 14,
              width: 50,
              height: 50,
              opacity: 0.75,
              transform: 'scale(-1, -1)',
            }}
            viewBox="0 0 50 50"
            fill="none"
          >
            <path
              d="M2 48 V 14 C 2 7.37 7.37 2 14 2 H 48"
              stroke={accentColor}
              strokeWidth="1.5"
            />
            <circle cx="14" cy="14" r="3" fill={accentColor} />
            <path
              d="M14 2 Q 26 14 38 2 Q 26 26 2 38"
              stroke={accentColor}
              strokeWidth="0.8"
              opacity="0.6"
            />
          </svg>
        </div>
      )}

      {/* Main Content Layer */}
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
