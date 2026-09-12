import { UrduInsightPayload } from '../types';
import { getRandomPaperId } from './paperSelector';
import { getRandomQalamId } from './qalamSelector';
import { getRandomUrduFont, resolveUrduFont } from './fontSelector';
import { getRandomAudioTrack } from './audioSelector';
import { getRandomNatureConfig, resolveNatureConfig } from './natureSelector';

/**
 * Resolves any 'random' or unassigned visual/audio assets into a single
 * deterministic concrete selection for the entire duration of the video.
 * This prevents per-frame recalculation during Remotion rendering.
 */
export function resolveConcretePayload(payload: UrduInsightPayload): UrduInsightPayload {
  const resolved = { ...payload };

  // 1. Pick a single random background paper theme once
  if (!resolved.bgTheme || resolved.bgTheme === 'random') {
    resolved.bgTheme = getRandomPaperId() as any;
  }

  // 2. Pick a single random qalam calligraphy pen once
  if (!resolved.qalam || resolved.qalam === 'random') {
    resolved.qalam = getRandomQalamId() as any;
  }

  // 3. Pick a single random Urdu calligraphy font once or normalize provided font
  if (!resolved.fontFamily || resolved.fontFamily === 'random') {
    resolved.fontFamily = getRandomUrduFont() as any;
  } else {
    resolved.fontFamily = resolveUrduFont(resolved.fontFamily) as any;
  }

  // 4. Pick a single random background music track once
  if (!resolved.bgMusic || resolved.bgMusic === 'random') {
    resolved.bgMusic = getRandomAudioTrack() as any;
  }

  // 5. Select a random nature background or resolve styled overrides for the nature background
  const isNatureTemplate = resolved.template === 'nature' || resolved.template === 'QuranNatureShort';
  const hasDefaultOrEmptyBg = !resolved.backgroundImage ||
    resolved.backgroundImage === 'nature/nature_sample.jpg' ||
    resolved.backgroundImage === 'random';

  if (isNatureTemplate) {
    let natureConfig = null;
    if (hasDefaultOrEmptyBg) {
      natureConfig = getRandomNatureConfig();
    } else {
      natureConfig = resolveNatureConfig(resolved.backgroundImage);
    }

    if (natureConfig) {
      resolved.backgroundImage = natureConfig.backgroundImage;

      // Apply tuned primary/accent colors and overlay opacity if defaults are active
      if (!resolved.primaryColor || resolved.primaryColor === '#2d4a22') {
        resolved.primaryColor = natureConfig.primaryColor;
      }
      if (!resolved.accentColor || resolved.accentColor === '#dfb76c' || resolved.accentColor === '#1fdceaff') {
        resolved.accentColor = natureConfig.accentColor;
      }
      if (resolved.overlayOpacity === undefined || resolved.overlayOpacity === 0.42) {
        resolved.overlayOpacity = natureConfig.overlayOpacity;
      }

      // Inject text visibility overrides if not explicitly specified by incoming payload
      resolved.urduTextColor = resolved.urduTextColor || natureConfig.urduTextColor;
      resolved.hookTextColor = resolved.hookTextColor || natureConfig.hookTextColor;
      resolved.inkShadow = resolved.inkShadow || natureConfig.inkShadow;
      resolved.hookShadow = resolved.hookShadow || natureConfig.hookShadow;
      resolved.dividerColor = resolved.dividerColor || natureConfig.dividerColor;
      resolved.titleTextColor = resolved.titleTextColor || natureConfig.titleTextColor;
      resolved.titleTextShadow = resolved.titleTextShadow || natureConfig.titleTextShadow;
      resolved.headerBadgeBgColor = resolved.headerBadgeBgColor || natureConfig.headerBadgeBgColor;
      resolved.headerBadgeBorderColor = resolved.headerBadgeBorderColor || natureConfig.headerBadgeBorderColor;
      resolved.footerTextColor = resolved.footerTextColor || natureConfig.footerTextColor;
      resolved.footerTextShadow = resolved.footerTextShadow || natureConfig.footerTextShadow;
      resolved.footerBadgeBgColor = resolved.footerBadgeBgColor || natureConfig.footerBadgeBgColor;
      resolved.footerBadgeBorderColor = resolved.footerBadgeBorderColor || natureConfig.footerBadgeBorderColor;
      resolved.glassCardBg = resolved.glassCardBg || natureConfig.glassCardBg;
      resolved.glassCardBorder = resolved.glassCardBorder || natureConfig.glassCardBorder;
    }
  }

  // 6. Provide high-contrast cinematic dark defaults for CinematicPexelsShort
  if (resolved.template === 'CinematicPexelsShort' || resolved.template === 'pexels') {
    resolved.template = 'CinematicPexelsShort';
    if (!resolved.primaryColor || resolved.primaryColor === '#2d4a22') {
      resolved.primaryColor = '#0f172a';
    }
    if (!resolved.accentColor || resolved.accentColor === '#dfb76c' || resolved.accentColor === '#1fdceaff') {
      resolved.accentColor = '#dfb76c';
    }
    if (resolved.overlayOpacity === undefined || resolved.overlayOpacity === 0.42) {
      resolved.overlayOpacity = 0.58;
    }
    resolved.urduTextColor = resolved.urduTextColor || '#ffffff';
    resolved.hookTextColor = resolved.hookTextColor || '#fffdf5';
    resolved.titleTextColor = resolved.titleTextColor || '#ffffff';
    resolved.titleTextShadow = resolved.titleTextShadow || '0 2px 10px rgba(0,0,0,0.85)';
    resolved.inkShadow = resolved.inkShadow || '0 3px 18px rgba(0,0,0,0.95), 0 0 35px rgba(0,0,0,0.85)';
    resolved.hookShadow = resolved.hookShadow || '0 3px 18px rgba(0,0,0,0.95), 0 0 35px rgba(0,0,0,0.85)';
    resolved.dividerColor = resolved.dividerColor || resolved.accentColor;
    resolved.headerBadgeBgColor = resolved.headerBadgeBgColor || 'rgba(10, 15, 20, 0.75)';
    resolved.headerBadgeBorderColor = resolved.headerBadgeBorderColor || resolved.accentColor;
  }

  return resolved;
}

