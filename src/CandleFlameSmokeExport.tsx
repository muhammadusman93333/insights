import React from 'react';
import { AbsoluteFill, staticFile, CanvasImage } from 'remotion';
import { CandleFlameSmoke } from './components/CandleFlameSmoke';
import { DustParticles } from './components/DustParticles';

export const CandleFlameSmokeExport: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: 'transparent' }}>
      {/* 4. Subtle floating golden light motes / bokeh & dust particles (rendered directly into video) */}
      <DustParticles count={34} isDarkTheme={false} />

      {/* 6. Bottom-Left Ancient Candle Holder */}
      <CanvasImage
        src={staticFile("images/ancient_candle.png")}
        style={{
          position: "absolute",
          translate: "-377.6px 1159.7px",
          width: 1024,
          height: 1024,
          scale: "0.628 0.641",
          pointerEvents: "none",
        }}
      />
      {/* 8. Flaming, Flickering Light Corona, Floating Embers & Rising Smoke from Candle */}
      <CandleFlameSmoke
        flameX={133}
        flameY={1530}
        scale={1.35}
        showFlame={true}
        showSmoke={true}
        showSparks={true}
        isDarkTheme={false}
      />
    </AbsoluteFill>
  );
};

