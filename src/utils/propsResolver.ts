import { UrduInsightPayload } from '../types';
import { getRandomPaperId } from './paperSelector';
import { getRandomQalamId } from './qalamSelector';
import { getRandomUrduFont } from './fontSelector';
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

  // 3. Pick a single random Urdu calligraphy font once
  if (!resolved.fontFamily || resolved.fontFamily === 'random') {
    resolved.fontFamily = getRandomUrduFont() as any;
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

  return resolved;
}

