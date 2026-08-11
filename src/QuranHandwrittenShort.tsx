import { Solid, staticFile, CanvasImage } from 'remotion';
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
    if (intervals.length === 0) {
      intervals.push({
        startFrame: timing.urduStartFrame,
        endFrame: timing.urduEndFrame,
      });
    }
    return intervals;
  }, [timing]);

  return (
    <ParchmentCanvas paper={paper}>
      {/* 1. Ornate Islamic borders & gold filigree */}
      <IslamicBorders isDark={paper.isDark} />
      {/* 2. Big Prominent Title Header */}
      <BismillahHeader
        title={title}
        isDark={paper.isDark}
        fontFamily={selectedFont}
        shiftStartFrame={timing.shiftStartFrame}
        shiftEndFrame={timing.shiftEndFrame}
        shouldShift={timing.shouldShift}
      />
      {/* 3. Real-time handwritten Urdu text engine with Hook and Body sequence */}
      <HandwrittenUrduText
        hookLines={timing.hookLines}
        hookStartFrame={timing.hookStartFrame}
        hookEndFrame={timing.hookEndFrame}
        shiftStartFrame={timing.shiftStartFrame}
        shiftEndFrame={timing.shiftEndFrame}
        shouldShift={timing.shouldShift}
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
      {/* 4. Subtle floating golden light motes / dust particles */}
      <DustParticles count={26} isDarkTheme={paper.isDark} />
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
      <CanvasImage
        src={staticFile("images/ancient_candle.png")}
        style={{
          position: "absolute",
          translate: "-365.4px 865.3px",
          width: 1024,
          height: 1024,
          scale: "0.628 0.641"
        }} /><CanvasImage
                              src={staticFile("images/dawaat.png")}
                              style={{
                                position: "absolute",
                                translate: "431.7px -718.2px",
                                width: 1024,
                                height: 1024,
                                scale: "0.475 0.536"
                              }} /></ParchmentCanvas>
  );
};
