import { staticFile } from 'remotion';
import { loadFont as loadLocalFont } from '@remotion/fonts';

export const URDU_CALLIGRAPHY_FONTS = [
  'Jameel Noori Nastaleeq',
  'Jameel Noori Nastaleeq Kasheeda',
] as const;

export type UrduFontFamily = (typeof URDU_CALLIGRAPHY_FONTS)[number];

const loadedFonts = new Set<string>();

/**
 * Loads the local font dynamically into the browser if not already loaded
 */
export function ensureFontLoaded(family: string): void {
  if (typeof window === 'undefined' || typeof FontFace === 'undefined') {
    return;
  }
  if (loadedFonts.has(family)) {
    return;
  }
  loadedFonts.add(family);

  if (family === 'Jameel Noori Nastaleeq') {
    loadLocalFont({
      family: 'Jameel Noori Nastaleeq',
      url: staticFile('fonts/Jameel Noori Nastaleeq Regular.ttf'),
    });
  } else if (family === 'Jameel Noori Nastaleeq Kasheeda') {
    loadLocalFont({
      family: 'Jameel Noori Nastaleeq Kasheeda',
      url: staticFile('fonts/Jameel Noori Nastaleeq Kasheeda.ttf'),
    });
  }
}

/**
 * Returns a randomly chosen Urdu calligraphy font
 */
export function getRandomUrduFont(): string {
  const randomIndex = Math.floor(Math.random() * URDU_CALLIGRAPHY_FONTS.length);
  return URDU_CALLIGRAPHY_FONTS[randomIndex];
}

/**
 * Resolves a specific calligraphy font or returns a stable default font
 */
export function resolveUrduFont(fontFamily?: string): string {
  if (!fontFamily || fontFamily === 'random') {
    const font = URDU_CALLIGRAPHY_FONTS[0];
    ensureFontLoaded(font);
    return font;
  }
  const lower = fontFamily.trim().toLowerCase();
  let resolved: string = URDU_CALLIGRAPHY_FONTS[0];
  if (lower.includes('kasheeda')) {
    resolved = 'Jameel Noori Nastaleeq Kasheeda';
  } else if (lower.includes('nastaleeq') || lower.includes('jameel')) {
    resolved = 'Jameel Noori Nastaleeq';
  } else if (URDU_CALLIGRAPHY_FONTS.includes(fontFamily as any)) {
    resolved = fontFamily;
  }
  ensureFontLoaded(resolved);
  return resolved;
}

