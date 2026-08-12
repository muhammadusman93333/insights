import React, { useMemo } from 'react';
import { CompositionProps } from './types';
import { calculateVideoTiming } from './utils/timing';
import { resolveUrduFont } from './utils/fontSelector';
import { resolveQalamConfig } from './utils/qalamSelector';
import { resolveAudioTrack } from './utils/audioSelector';
import { NatureBackdrop } from './components/NatureBackdrop';
import { NatureCanvas } from './components/NatureCanvas';
import { NatureHeader } from './components/NatureHeader';
import { NatureFooter } from './components/NatureFooter';
import { HandwrittenUrduText } from './components/HandwrittenUrduText';
import { AudioLayer } from './components/AudioLayer';

export const QuranNatureShort: React.FC<CompositionProps> = (props) => {
  const {
    title = 'سکونِ قلب',
    authorOrSource,
    backgroundImage = 'nature/nature_sample.jpg',
    primaryColor = '#2d4a22',
    accentColor = '#1fdceaff',
    overlayOpacity = 0.42,
    showGlassCard = true,
    showGodRays = true,
    showNatureParticles = true,
    kenBurnsZoom = 1.08,
    qalam = 'random',
    qalamScale = 6,
    fontFamily = 'random',
    showPenAnimation = true,
    bgMusic = 'random',
    penScratchSound = true,
    penSoundSrc = 'audio/qalam_sound.mp3',
  } = props;

  const timing = calculateVideoTiming(props);

  // Resolve Qalam calligraphy pen
  const activeQalam = useMemo(() => {
    return resolveQalamConfig(qalam);
  }, [qalam]);

  // Resolve dynamic calligraphy font
  const selectedFont = useMemo(() => {
    return resolveUrduFont(fontFamily);
  }, [fontFamily]);

  // Resolve dynamic background soundtrack
  const resolvedBgMusic = useMemo(() => {
    return resolveAudioTrack(bgMusic);
  }, [bgMusic]);

  // Mock paper config for dark nature theme compatibility
  const naturePaperConfig = useMemo(() => {
    return {
      id: 'nature',
      name: 'Serene Nature Canvas',
      paperBgColor: '#0b1e12',
      paperGradient: 'transparent',
      burntShadow: 'none',
      scorchedBorderColor: accentColor,
      goldAccent: accentColor,
      textColor: '#fffbf0',
      isDark: true,
      sootIntensity: 0.2,
    };
  }, [accentColor]);

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
    <div
      style={{
        width: 1080,
        height: 1920,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#071008',
      }}
    >
      {/* 1. Fullscreen 9:16 Nature Backdrop with Ken Burns zoom, God Rays, & Firefly motes */}
      <NatureBackdrop
        backgroundImage={backgroundImage}
        primaryColor={primaryColor}
        overlayOpacity={overlayOpacity}
        showGodRays={showGodRays}
        showNatureParticles={showNatureParticles}
        kenBurnsZoom={kenBurnsZoom}
      />

      {/* 2. Frosted Nature Glassmorphism Card Canvas */}
      <NatureCanvas
        primaryColor={primaryColor}
        accentColor={accentColor}
        showGlassCard={showGlassCard}
      >
        {/* 3. Header: Nature / Reflection Title Badge */}
        <NatureHeader
          title={title}
          primaryColor={primaryColor}
          accentColor={accentColor}
          fontFamily={selectedFont}
          shiftStartFrame={timing.shiftStartFrame}
          shiftEndFrame={timing.shiftEndFrame}
          shouldShift={timing.shouldShift}
          centerOffsetY={520}
        />

        {/* 4. Synchronized Handwritten Calligraphy Text (Hook + Insight Body) */}
        <HandwrittenUrduText
          hookLines={timing.hookLines}
          hookStartFrame={timing.hookStartFrame}
          hookEndFrame={timing.hookEndFrame}
          bodyLines={timing.bodyLines}
          bodyStartFrame={timing.bodyStartFrame}
          bodyEndFrame={timing.bodyEndFrame}
          shiftStartFrame={timing.shiftStartFrame}
          shiftEndFrame={timing.shiftEndFrame}
          shouldShift={timing.shouldShift}
          centerOffsetY={520}
          urduLines={timing.urduLines}
          urduStartFrame={timing.urduStartFrame}
          urduEndFrame={timing.urduEndFrame}
          paper={naturePaperConfig}
          qalam={activeQalam}
          qalamScale={qalamScale}
          fontFamily={selectedFont}
          showPenAnimation={showPenAnimation}
        />
      </NatureCanvas>

      {/* 5. Ambient Background Audio + Qalam Writing Sound FX */}
      <AudioLayer
        bgMusic={resolvedBgMusic}
        penScratchSound={penScratchSound}
        penSoundSrc={penSoundSrc}
        writingIntervals={writingIntervals}
      />
    </div>
  );
};
