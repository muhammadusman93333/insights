export interface QalamConfig {
  id: string;
  imageFileName: string;
  name: string;
  width: number;
  height: number;
}

export const QALAM_COLLECTION: QalamConfig[] = [
  {
    id: '1',
    imageFileName: '1.png',
    name: '1. Classic Bamboo Reed Qalam',
    width: 75,
    height: 240,
  },
  {
    id: '2',
    imageFileName: '2.png',
    name: '2. Golden Peacock Feather Quill',
    width: 100,
    height: 270,
  },
  {
    id: '3',
    imageFileName: '3.png',
    name: '3. Carved Bamboo Calligraphy Pen',
    width: 80,
    height: 240,
  },
  {
    id: '4',
    imageFileName: '4.png',
    name: '4. Rosewood Brass Dip Pen',
    width: 80,
    height: 250,
  },
  {
    id: '5',
    imageFileName: '5.png',
    name: '5. Royal Peacock Calligraphy Nib',
    width: 95,
    height: 265,
  },
  {
    id: '6',
    imageFileName: '6.png',
    name: '6. Vintage Antique Qalam Nib',
    width: 85,
    height: 250,
  },
];

/**
 * Returns a randomly chosen qalam pen ID from the available collection
 */
export function getRandomQalamId(): string {
  const randomIndex = Math.floor(Math.random() * QALAM_COLLECTION.length);
  return QALAM_COLLECTION[randomIndex].id;
}

/**
 * Resolves a specific qalam or returns a stable default when 'random' is passed.
 */
export function resolveQalamConfig(qalamId?: string): QalamConfig {
  if (qalamId && qalamId !== 'random') {
    const found = QALAM_COLLECTION.find(
      (q) => q.id === qalamId || q.imageFileName === qalamId || q.imageFileName === `${qalamId}.png`
    );
    if (found) return found;
  }

  // Stable default (prevent frame-by-frame flickering)
  return QALAM_COLLECTION[0];
}

