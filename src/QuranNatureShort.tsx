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
import { staticFile, CanvasImage } from "remotion";
import { brightness } from "@remotion/effects/brightness";
import { contrast } from "@remotion/effects/contrast";
import { getSeededNatureConfig, resolveNatureConfig, NATURE_COLLECTION } from './utils/natureSelector';

export const QuranNatureShort: React.FC<CompositionProps> = (props) => {
  // Resolve props deterministically if they are raw (e.g. in Studio preview)
  const resolvedProps = useMemo(() => {
    const p = { ...props };
    const hasDefaultOrEmptyBg = !p.backgroundImage ||
      p.backgroundImage === 'nature/nature_sample.jpg' ||
      p.backgroundImage === 'random';

    // If we don't have overrides resolved yet (meaning resolveConcretePayload wasn't called, e.g. in Studio preview)
    if (!p.urduTextColor) {
      const seed = (p.title || '') + (p.hook || '') + (p.urduText || '');
      const config = hasDefaultOrEmptyBg
        ? getSeededNatureConfig(seed)
        : resolveNatureConfig(p.backgroundImage) || NATURE_COLLECTION[0];

      p.backgroundImage = config.backgroundImage;

      // Apply tuned primary/accent colors and overlay opacity if defaults are active
      if (!p.primaryColor || p.primaryColor === '#2d4a22') {
        p.primaryColor = config.primaryColor;
      }
      if (!p.accentColor || p.accentColor === '#dfb76c' || p.accentColor === '#1fdceaff') {
        p.accentColor = config.accentColor;
      }
      if (p.overlayOpacity === undefined || p.overlayOpacity === 0.42) {
        p.overlayOpacity = config.overlayOpacity;
      }

      p.urduTextColor = config.urduTextColor;
      p.hookTextColor = config.hookTextColor;
      p.inkShadow = config.inkShadow;
      p.hookShadow = config.hookShadow;
      p.dividerColor = config.dividerColor;
      p.titleTextColor = config.titleTextColor;
      p.titleTextShadow = config.titleTextShadow;
      p.headerBadgeBgColor = config.headerBadgeBgColor;
      p.headerBadgeBorderColor = config.headerBadgeBorderColor;
      p.footerTextColor = config.footerTextColor;
      p.footerTextShadow = config.footerTextShadow;
      p.footerBadgeBgColor = config.footerBadgeBgColor;
      p.footerBadgeBorderColor = config.footerBadgeBorderColor;
      p.glassCardBg = config.glassCardBg;
      p.glassCardBorder = config.glassCardBorder;
    }
    return p;
  }, [props]);

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
    urduTextColor,
    hookTextColor,
    inkShadow,
    hookShadow,
    dividerColor,
    titleTextColor,
    titleTextShadow,
    headerBadgeBgColor,
    headerBadgeBorderColor,
    footerTextColor,
    footerTextShadow,
    footerBadgeBgColor,
    footerBadgeBorderColor,
    glassCardBg,
    glassCardBorder,
  } = resolvedProps;

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

  // Writing intervals for Qalam pen sound synchronization (one interval per section)
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
    } else if (timing.hookLines.length === 0 && timing.urduLines.length > 0 && timing.urduEndFrame > timing.urduStartFrame) {
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
        glassCardBg={glassCardBg}
        glassCardBorder={glassCardBorder}
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
          titleTextColor={titleTextColor}
          titleTextShadow={titleTextShadow}
          badgeBgColor={headerBadgeBgColor}
          badgeBorderColor={headerBadgeBorderColor}
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
          urduTextColor={urduTextColor}
          hookTextColor={hookTextColor}
          inkShadow={inkShadow}
          hookShadow={hookShadow}
          dividerColor={dividerColor}
        />

        {/* 5. Footer: Author/Source Credit Badge */}
        {authorOrSource && (
          <NatureFooter
            authorOrSource={authorOrSource}
            footerStartFrame={timing.footerStartFrame}
            accentColor={accentColor}
            primaryColor={primaryColor}
            fontFamily={selectedFont}
            footerTextColor={footerTextColor}
            footerTextShadow={footerTextShadow}
            badgeBgColor={footerBadgeBgColor}
            badgeBorderColor={footerBadgeBorderColor}
          />
        )}
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
