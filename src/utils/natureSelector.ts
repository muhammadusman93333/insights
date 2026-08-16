export interface NatureOverrideConfig {
  backgroundImage: string;
  primaryColor: string;
  accentColor: string;
  overlayOpacity: number;
  urduTextColor: string;
  hookTextColor: string;
  inkShadow: string;
  hookShadow: string;
  dividerColor: string;
  titleTextColor: string;
  titleTextShadow: string;
  headerBadgeBgColor: string;
  headerBadgeBorderColor: string;
  footerTextColor: string;
  footerTextShadow: string;
  footerBadgeBgColor: string;
  footerBadgeBorderColor: string;
  glassCardBg: string;
  glassCardBorder: string;
}

export const NATURE_COLLECTION: NatureOverrideConfig[] = [
  {
    backgroundImage: 'nature/enchanted_forest_pond.jpg',
    primaryColor: '#0b1e12',
    accentColor: '#dfb76c',
    overlayOpacity: 0.3,
    // Center text is placed against bright golden mist -> dark text for high visibility
    urduTextColor: '#1E3F20', // Deep Forest Green
    hookTextColor: '#2C3E50', // Charcoal
    inkShadow: '0 1px 3px rgba(255, 255, 255, 0.45)', // subtle light drop shadow to pop against golden mist
    hookShadow: '0 1px 3px rgba(255, 255, 255, 0.45)',
    dividerColor: '#dfb76c',
    // Glass card becomes a beautiful ivory/cream translucent card so dark text pops inside it
    glassCardBg: 'rgba(255, 250, 240, 0.35)',
    glassCardBorder: '1.5px solid rgba(223, 183, 108, 0.4)',
    // Outer edges (top/bottom) are dark mossy wood -> light text
    titleTextColor: '#FDF5E6', // Cream
    titleTextShadow: '0 2px 8px rgba(0, 0, 0, 0.75)',
    headerBadgeBgColor: 'rgba(11, 26, 16, 0.85)',
    headerBadgeBorderColor: '#dfb76c',
    footerTextColor: '#FDF5E6',
    footerTextShadow: '0 2px 8px rgba(0, 0, 0, 0.75)',
    footerBadgeBgColor: 'rgba(10, 24, 14, 0.88)',
    footerBadgeBorderColor: '#dfb76c',
  },
  {
    backgroundImage: 'nature/autumn_waterfall_canyon.jpg',
    primaryColor: '#3e160e', // Autumn Crimson / Dark Orange
    accentColor: '#e67e22', // Autumn Orange
    overlayOpacity: 0.45,
    // Vibrant / highly saturated background -> crisp white text with strong dark drop shadows
    urduTextColor: '#FFFFFF',
    hookTextColor: '#FFFFFF',
    inkShadow: '2px 2px 4px rgba(0, 0, 0, 0.85)',
    hookShadow: '2px 2px 4px rgba(0, 0, 0, 0.85)',
    dividerColor: '#e67e22',
    glassCardBg: 'rgba(15, 8, 5, 0.55)', // dark crimson tinted glass
    glassCardBorder: '1.5px solid rgba(230, 126, 34, 0.4)',
    titleTextColor: '#FFFFFF',
    titleTextShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
    headerBadgeBgColor: 'rgba(20, 8, 5, 0.85)',
    headerBadgeBorderColor: '#e67e22',
    footerTextColor: '#FFFFFF',
    footerTextShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
    footerBadgeBgColor: 'rgba(20, 8, 5, 0.88)',
    footerBadgeBorderColor: '#e67e22',
  },
  {
    backgroundImage: 'nature/mystic_mountain_meadow.jpg',
    primaryColor: '#20063b', // Deep lavender purple/indigo
    accentColor: '#ffd97d', // light yellow/gold
    overlayOpacity: 0.35,
    // Center/meadow text (bottom/moderately dark lavender) -> White & Light Gold text
    urduTextColor: '#FFFFFF',
    hookTextColor: '#FFF59D', // Light Gold/Yellow
    inkShadow: '0 2px 8px rgba(46, 8, 84, 0.7)',
    hookShadow: '0 2px 8px rgba(46, 8, 84, 0.7)',
    dividerColor: '#ffd97d',
    glassCardBg: 'rgba(20, 10, 35, 0.35)', // indigo tinted glass
    glassCardBorder: '1.5px solid rgba(255, 217, 125, 0.45)',
    // Sky text at the top (very light pink/purple) -> dark indigo text on translucent pastel pink badge
    titleTextColor: '#2E0854',
    titleTextShadow: '0 1px 2px rgba(255, 255, 255, 0.7)',
    headerBadgeBgColor: 'rgba(255, 240, 245, 0.45)',
    headerBadgeBorderColor: '#2E0854',
    // Bottom edge text -> moderately dark field, white text with dark purple badge
    footerTextColor: '#FFFFFF',
    footerTextShadow: '0 2px 6px rgba(46, 8, 84, 0.8)',
    footerBadgeBgColor: 'rgba(46, 8, 84, 0.75)',
    footerBadgeBorderColor: '#ffd97d',
  },
  {
    backgroundImage: 'nature/whispering_bamboo_grove.jpg',
    primaryColor: '#061208', // Deep forest dark green
    accentColor: '#a8e6cf', // mint green / pale cream
    overlayOpacity: 0.4,
    // Misty green overall -> White/Pale Cream text pops against green & dark forest
    urduTextColor: '#FAFAFA',
    hookTextColor: '#FFFFFF',
    inkShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
    hookShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
    dividerColor: '#a8e6cf',
    glassCardBg: 'rgba(8, 20, 12, 0.5)',
    glassCardBorder: '1.5px solid rgba(168, 230, 207, 0.4)',
    titleTextColor: '#FAFAFA',
    titleTextShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
    headerBadgeBgColor: 'rgba(8, 20, 12, 0.85)',
    headerBadgeBorderColor: '#a8e6cf',
    footerTextColor: '#FAFAFA',
    footerTextShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
    footerBadgeBgColor: 'rgba(8, 20, 12, 0.88)',
    footerBadgeBorderColor: '#a8e6cf',
  },
  {
    backgroundImage: 'nature/coastal_cliffside_cove.jpg',
    primaryColor: '#040410', // Deep coastal indigo
    accentColor: '#80DEEA', // glowing cyan
    overlayOpacity: 0.35,
    // High contrast dark image -> White or soft glowing cyan text against dark rocks
    urduTextColor: '#E0F7FA', // soft glowing cyan
    hookTextColor: '#80DEEA', // glowing cyan
    inkShadow: '0 0 12px rgba(128, 222, 234, 0.65)',
    hookShadow: '0 0 16px rgba(128, 222, 234, 0.75)',
    dividerColor: '#80DEEA',
    glassCardBg: 'rgba(5, 5, 20, 0.45)', // dark magic blue glass
    glassCardBorder: '1.5px solid rgba(128, 222, 234, 0.5)',
    titleTextColor: '#E0F7FA',
    titleTextShadow: '0 0 10px rgba(128, 222, 234, 0.75)',
    headerBadgeBgColor: 'rgba(5, 5, 20, 0.85)',
    headerBadgeBorderColor: '#80DEEA',
    footerTextColor: '#E0F7FA',
    footerTextShadow: '0 0 10px rgba(128, 222, 234, 0.75)',
    footerBadgeBgColor: 'rgba(5, 5, 20, 0.88)',
    footerBadgeBorderColor: '#80DEEA',
  },
];

export function getRandomNatureConfig(): NatureOverrideConfig {
  const index = Math.floor(Math.random() * NATURE_COLLECTION.length);
  return NATURE_COLLECTION[index];
}

export function resolveNatureConfig(bgPath?: string): NatureOverrideConfig | null {
  if (!bgPath) return null;
  const normalized = bgPath.replace(/\\/g, '/');
  // Check if current background path matches any in our collection (e.g. ends with or contains)
  const found = NATURE_COLLECTION.find((c) =>
    normalized.includes(c.backgroundImage) || c.backgroundImage.includes(normalized)
  );
  return found || null;
}

function getSeededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
}

export function getSeededNatureConfig(seed: string): NatureOverrideConfig {
  const r = getSeededRandom(seed);
  const index = Math.floor(r * NATURE_COLLECTION.length);
  return NATURE_COLLECTION[index];
}

