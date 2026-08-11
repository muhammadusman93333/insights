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
 * Returns a truly random calligraphy font every time 'random' is passed (or on page refresh)
 */
export function resolveUrduFont(fontFamily?: string): string {
  let resolved = fontFamily;
  if (!resolved || resolved === 'random' || !URDU_CALLIGRAPHY_FONTS.includes(resolved as any)) {
    const randomIndex = Math.floor(Math.random() * URDU_CALLIGRAPHY_FONTS.length);
    resolved = URDU_CALLIGRAPHY_FONTS[randomIndex];
  }
  ensureFontLoaded(resolved);
  return resolved;
}
