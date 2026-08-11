export interface PaperConfig {
  id: string;
  name: string;
  isDark: boolean;
  textColor: string;
  goldAccent: string;
  paperBgColor: string;
  paperGradient: string;
  scorchedBorderColor: string;
  burntShadow: string;
  sootIntensity: number;
}

export const PAPER_COLLECTION: PaperConfig[] = [
  {
    id: '1',
    name: '1. Ancient Scorched Parchment (Classic)',
    isDark: false,
    textColor: '#140c06',
    goldAccent: '#9c6d28',
    paperBgColor: '#f4e5cb',
    paperGradient: 'radial-gradient(ellipse at 50% 45%, #faf0dc 0%, #f3e2c4 45%, #e6cb9f 75%, #cca56d 100%)',
    scorchedBorderColor: 'rgba(28, 12, 4, 0.95)',
    burntShadow: 'inset 0 0 70px 22px rgba(22, 9, 3, 0.94), inset 0 0 30px 8px rgba(10, 3, 1, 0.98), 0 20px 50px rgba(0,0,0,0.85)',
    sootIntensity: 0.85,
  },
  {
    id: '2',
    name: '2. Burnt Amber Papyrus',
    isDark: false,
    textColor: '#100803',
    goldAccent: '#ab7b2b',
    paperBgColor: '#edd0a4',
    paperGradient: 'radial-gradient(ellipse at 50% 40%, #f8e5c8 0%, #ecd0a4 45%, #dbb67e 75%, #be8e4c 100%)',
    scorchedBorderColor: 'rgba(38, 15, 4, 0.95)',
    burntShadow: 'inset 0 0 85px 28px rgba(32, 11, 3, 0.96), inset 0 0 35px 12px rgba(12, 3, 1, 0.99), 0 22px 55px rgba(0,0,0,0.88)',
    sootIntensity: 0.95,
  },
  {
    id: '3',
    name: '3. Imperial Gold-Trimmed Vellum',
    isDark: false,
    textColor: '#160e07',
    goldAccent: '#b88636',
    paperBgColor: '#f7eedb',
    paperGradient: 'radial-gradient(ellipse at 50% 50%, #fdf6ea 0%, #f7eedb 50%, #eadbc0 80%, #d8be96 100%)',
    scorchedBorderColor: 'rgba(26, 11, 4, 0.92)',
    burntShadow: 'inset 0 0 60px 18px rgba(20, 8, 2, 0.9), inset 0 0 24px 6px rgba(8, 2, 0, 0.95), 0 18px 45px rgba(0,0,0,0.8)',
    sootIntensity: 0.75,
  },
  {
    id: '4',
    name: '4. Weathered Monastery Manuscript',
    isDark: false,
    textColor: '#0e0703',
    goldAccent: '#8e5f20',
    paperBgColor: '#ebd6b5',
    paperGradient: 'radial-gradient(ellipse at 50% 45%, #f4e3c9 0%, #ebd6b5 45%, #d8bc91 75%, #b9935e 100%)',
    scorchedBorderColor: 'rgba(22, 8, 2, 0.98)',
    burntShadow: 'inset 0 0 95px 32px rgba(22, 7, 2, 0.98), inset 0 0 40px 15px rgba(6, 1, 0, 1), 0 25px 60px rgba(0,0,0,0.92)',
    sootIntensity: 1.0,
  },
  {
    id: '5',
    name: '5. Rosewood Sepia Burnt Scroll',
    isDark: false,
    textColor: '#180b06',
    goldAccent: '#a8712e',
    paperBgColor: '#f3e2d6',
    paperGradient: 'radial-gradient(ellipse at 50% 45%, #faeee5 0%, #f3e2d6 45%, #e2c7b5 75%, #c89f87 100%)',
    scorchedBorderColor: 'rgba(34, 12, 6, 0.94)',
    burntShadow: 'inset 0 0 75px 24px rgba(30, 9, 4, 0.94), inset 0 0 28px 9px rgba(10, 2, 1, 0.97), 0 20px 50px rgba(0,0,0,0.85)',
    sootIntensity: 0.82,
  },
  {
    id: '6',
    name: '6. Desert Hearth Sun-Baked Papyrus',
    isDark: false,
    textColor: '#120a04',
    goldAccent: '#996825',
    paperBgColor: '#f1dec2',
    paperGradient: 'radial-gradient(ellipse at 50% 40%, #faecd7 0%, #f1dec2 45%, #dfbe93 75%, #bf925c 100%)',
    scorchedBorderColor: 'rgba(30, 13, 4, 0.95)',
    burntShadow: 'inset 0 0 80px 25px rgba(28, 10, 3, 0.95), inset 0 0 32px 10px rgba(10, 2, 1, 0.98), 0 22px 52px rgba(0,0,0,0.88)',
    sootIntensity: 0.9,
  },
  {
    id: '7',
    name: '7. Ottoman Antiquity Illuminated Page',
    isDark: false,
    textColor: '#140c06',
    goldAccent: '#b08032',
    paperBgColor: '#f6ebd7',
    paperGradient: 'radial-gradient(ellipse at 50% 50%, #fdf7ec 0%, #f6ebd7 50%, #e8d3b4 80%, #d4b58b 100%)',
    scorchedBorderColor: 'rgba(25, 11, 4, 0.92)',
    burntShadow: 'inset 0 0 65px 20px rgba(20, 7, 2, 0.92), inset 0 0 25px 7px rgba(8, 2, 0, 0.96), 0 18px 46px rgba(0,0,0,0.82)',
    sootIntensity: 0.78,
  },
  {
    id: '8',
    name: '8. Midnight Celestial Charred Vellum (Dark)',
    isDark: true,
    textColor: '#faeed5',
    goldAccent: '#e5be70',
    paperBgColor: '#16110d',
    paperGradient: 'radial-gradient(ellipse at 50% 45%, #251d16 0%, #16110d 50%, #0d0906 80%, #050302 100%)',
    scorchedBorderColor: 'rgba(217, 155, 56, 0.75)',
    burntShadow: 'inset 0 0 90px 30px rgba(2, 1, 0, 0.98), inset 0 0 35px 10px rgba(200, 130, 40, 0.35), 0 25px 65px rgba(0,0,0,0.95)',
    sootIntensity: 1.0,
  },
];

/**
 * Returns a randomly chosen paper ID from the available collection
 */
export function getRandomPaperId(): string {
  const randomIndex = Math.floor(Math.random() * PAPER_COLLECTION.length);
  return PAPER_COLLECTION[randomIndex].id;
}

/**
 * Resolves a specific background paper config.
 * Uses stable default if 'random' is passed to avoid per-frame randomness.
 */
export function resolvePaperConfig(theme?: string): PaperConfig {
  if (theme && theme !== 'random') {
    const found = PAPER_COLLECTION.find(
      (p) => p.id === theme || p.name.toLowerCase().includes(theme.toLowerCase())
    );
    if (found) return found;
  }

  // Stable default (prevent frame-by-frame flickering)
  return PAPER_COLLECTION[0];
}

