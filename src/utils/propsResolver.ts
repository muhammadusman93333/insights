import { UrduInsightPayload } from '../types';
import { getRandomPaperId } from './paperSelector';
import { getRandomQalamId } from './qalamSelector';
import { getRandomUrduFont } from './fontSelector';
import { getRandomAudioTrack } from './audioSelector';

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

  return resolved;
}
