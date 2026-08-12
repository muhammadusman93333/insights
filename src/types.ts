import { z } from 'zod';

export const bgThemeSchema = z.enum([
  'random',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
]);

export type BgThemeType = z.infer<typeof bgThemeSchema>;

export const qalamSchema = z.enum([
  'random',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
]);

export type QalamType = z.infer<typeof qalamSchema>;

export const bgMusicSchema = z.enum([
  'random',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
]);

export type BgMusicType = z.infer<typeof bgMusicSchema>;

export const urduFontFamilySchema = z.enum([
  'random',
  'Jameel Noori Nastaleeq',
  'Jameel Noori Nastaleeq Kasheeda',
]);

export type UrduFontFamilyType = z.infer<typeof urduFontFamilySchema>;

export const templateSchema = z.enum([
  'parchment',
  'nature',
  'QuranHandwrittenShort',
  'QuranNatureShort',
]);

export type TemplateType = z.infer<typeof templateSchema>;

export const urduInsightSchema = z.object({
  template: templateSchema.optional().default('parchment'),
  backgroundImage: z.string().optional().default('nature/nature_sample.jpg'),
  primaryColor: z.string().optional().default('#2d4a22'),
  accentColor: z.string().optional().default('#dfb76c'),
  overlayOpacity: z.number().min(0).max(1).optional().default(0.42),
  showGlassCard: z.boolean().optional().default(true),
  showGodRays: z.boolean().optional().default(true),
  showNatureParticles: z.boolean().optional().default(true),
  kenBurnsZoom: z.number().optional().default(1.08),
  title: z.string().optional(),
  hook: z.string().optional(),
  body: z.string().optional(),
  bodyText: z.string().optional(),
  urduText: z.string().optional().default(''),
  surahReference: z.string().optional(),
  arabicAyah: z.string().optional(),
  authorOrSource: z.string().optional(),
  bgTheme: bgThemeSchema.optional().default('random'),
  qalam: qalamSchema.optional().default('random'),
  qalamScale: z.number().min(0.1).max(10.0).step(0.1).optional().default(6),
  fontFamily: urduFontFamilySchema.optional().default('random'),
  showPenAnimation: z.boolean().optional().default(true),
  bgMusic: bgMusicSchema.optional().default('random'),
  penScratchSound: z.boolean().optional().default(true),
  penSoundSrc: z.string().optional().default('audio/qalam_sound.mp3'),
  readingPauseSeconds: z.number().optional().default(4.5),
});

export type UrduInsightPayload = z.infer<typeof urduInsightSchema>;
export type CompositionProps = UrduInsightPayload;

export const defaultProps: UrduInsightPayload = {
  template: 'parchment',
  backgroundImage: 'nature/nature_sample.jpg',
  primaryColor: '#2d4a22',
  accentColor: '#dfb76c',
  overlayOpacity: 0.42,
  showGlassCard: true,
  showGodRays: true,
  showNatureParticles: true,
  kenBurnsZoom: 1.08,
  title: 'خاموش پکار',
  hook: 'کیا آپ کو بھی لگتا ہے کہ جب دکھ کی شدت سے لفظ ساتھ چھوڑ دیں، تو کوئی آپ کے اندر کے شور کو نہیں سن پاتا؟',
  urduText:
    'اے ایمان والو! صبر اور نماز کے ذریعے مدد طلب کرو۔ یقیناً اللہ صبر کرنے والوں کے ساتھ ہے۔',
  authorOrSource: 'سورۃ البقرہ - ۱۵۳',
  bgTheme: 'random',
  qalam: 'random',
  qalamScale: 6,
  fontFamily: 'random',
  showPenAnimation: true,
  bgMusic: 'random',
  penScratchSound: true,
  penSoundSrc: 'audio/qalam_sound.mp3',
  readingPauseSeconds: 4.5,
};

export { resolveConcretePayload } from './utils/propsResolver';

