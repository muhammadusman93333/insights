import { staticFile, CanvasImage } from 'remotion';
import React, { useMemo } from 'react';
import { CompositionProps } from './types';
import { calculateVideoTiming } from './utils/timing';
import { resolveUrduFont } from './utils/fontSelector';
import { resolvePaperConfig } from './utils/paperSelector';
import { resolveQalamConfig } from './utils/qalamSelector';
import { resolveAudioTrack } from './utils/audioSelector';
import { ParchmentCanvas } from './components/ParchmentCanvas';
import { IslamicBorders } from './components/IslamicBorders';
import { BismillahHeader } from './components/BismillahHeader';
import { HandwrittenUrduText } from './components/HandwrittenUrduText';
import { DustParticles } from './components/DustParticles';
import { AudioLayer } from './components/AudioLayer';
import { FooterCredits } from './components/FooterCredits';
import { CandleFlameSmoke } from './components/CandleFlameSmoke';

export const QuranHandwrittenShort: React.FC<CompositionProps> = (props) => {
  const {
    title,
    urduText,
    authorOrSource,
    bgTheme = 'random',
    qalam = 'random',
    qalamScale = 6,
    fontFamily = 'random',
    showPenAnimation = true,
    bgMusic = 'random',
    penScratchSound = true,
    penSoundSrc = 'audio/qalam_sound.mp3',
  } = props;

  const timing = calculateVideoTiming(props);

  // Resolve background paper texture (1-8 or random)
  const paper = useMemo(() => {
    return resolvePaperConfig(bgTheme);
  }, [bgTheme]);

  // Resolve Qalam calligraphy pen (1-6 or random)
  const activeQalam = useMemo(() => {
    return resolveQalamConfig(qalam);
  }, [qalam]);

  // Resolve dynamic calligraphy font (1 of 5 fonts or random)
  const selectedFont = useMemo(() => {
    return resolveUrduFont(fontFamily);
  }, [fontFamily]);

  // Resolve dynamic background soundtrack (1-8 or random)
  const resolvedBgMusic = useMemo(() => {
    return resolveAudioTrack(bgMusic);
  }, [bgMusic]);

  // Writing intervals for Qalam pen sound synchronization
  const writingIntervals = useMemo(() => {
    const intervals: { startFrame: number; endFrame: number }[] = [];
    if (timing.hookLines.length > 0 && timing.hookEndFrame > timing.hookStartFrame) {
      intervals.push({
        startFrame: timing.hookStartFrame,
        endFrame: timing.hookEndFrame,
      });
    }
    if (timing.bodyLines.length > 0 && timing.bodyEndFrame > timing.bodyStartFrame) {
      intervals.push({
        startFrame: timing.bodyStartFrame,
        endFrame: timing.bodyEndFrame,
      });
    }
    if (timing.urduLines.length > 0 && timing.urduEndFrame > timing.urduStartFrame) {
      intervals.push({
        startFrame: timing.urduStartFrame,
        endFrame: timing.urduEndFrame,
      });
    }
    return intervals;
  }, [
    timing.hookLines,
    timing.hookStartFrame,
    timing.hookEndFrame,
    timing.bodyLines,
    timing.bodyStartFrame,
    timing.bodyEndFrame,
    timing.urduLines,
    timing.urduStartFrame,
    timing.urduEndFrame,
  ]);

  return (
    <ParchmentCanvas paper={paper}>
      {/* 0. Ancient Islamic Geometric Borders & Corner Filigrees */}
      <IslamicBorders isDark={paper.isDark} />

      {/* 1. Header: Calligraphic Bismillah + Category / Theme Title */}
      <BismillahHeader
        title={title}
        isDark={paper.isDark}
      />

      {/* 2 & 3. Synchronized Handwritten Calligraphy Text (Hook + Insight Body) */}
      <HandwrittenUrduText
        hookLines={timing.hookLines}
        hookStartFrame={timing.hookStartFrame}
        hookEndFrame={timing.hookEndFrame}
        bodyLines={timing.bodyLines}
        bodyStartFrame={timing.bodyStartFrame}
        bodyEndFrame={timing.bodyEndFrame}
        urduLines={timing.urduLines}
        urduStartFrame={timing.urduStartFrame}
        urduEndFrame={timing.urduEndFrame}
        paper={paper}
        qalam={activeQalam}
        qalamScale={qalamScale}
        fontFamily={selectedFont}
        showPenAnimation={showPenAnimation}
      />

      {/* 4. Subtle floating golden light motes / bokeh & dust particles */}
      <DustParticles count={34} isDarkTheme={paper.isDark} />

      {/* 5. Ambient Background Audio + Qalam Writing Sound FX */}
      <AudioLayer
        bgMusic={resolvedBgMusic}
        penScratchSound={penScratchSound}
        penSoundSrc={penSoundSrc}
        writingIntervals={writingIntervals}
      />

      {/* 6. Bottom Source / Author stamp */}
      {authorOrSource && (
        <FooterCredits
          authorOrSource={authorOrSource}
          footerStartFrame={timing.footerStartFrame}
          isDark={paper.isDark}
        />
      )}

      {/* 7. Bottom-Left Ancient Candle Holder */}
      <CanvasImage
        src={staticFile("images/ancient_candle.png")}
        style={{
          position: "absolute",
          translate: "-365.4px 865.3px",
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
        isDarkTheme={paper.isDark}
      />

      {/* 9. Top-Right Dawaat (Ink Pot) */}
      <CanvasImage
        src={staticFile("images/dawaat.png")}
        style={{
          position: "absolute",
          translate: "431.7px -718.2px",
          width: 1024,
          height: 1024,
          scale: "0.475 0.536",
          pointerEvents: "none",
        }}
      />
    </ParchmentCanvas>
  );
};