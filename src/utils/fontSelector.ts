export const URDU_CALLIGRAPHY_FONTS = [
  'Jameel Noori Nastaleeq',
  'Jameel Noori Nastaleeq Kasheeda',
] as const;

export type UrduFontFamily = (typeof URDU_CALLIGRAPHY_FONTS)[number];

/**
 * Returns a truly random calligraphy font every time 'random' is passed (or on page refresh)
 */
export function resolveUrduFont(fontFamily?: string): string {
  if (fontFamily && fontFamily !== 'random' && URDU_CALLIGRAPHY_FONTS.includes(fontFamily as any)) {
    return fontFamily;
  }

  // Pure random selection from the 5 calligraphy fonts
  const randomIndex = Math.floor(Math.random() * URDU_CALLIGRAPHY_FONTS.length);
  return URDU_CALLIGRAPHY_FONTS[randomIndex];
}
