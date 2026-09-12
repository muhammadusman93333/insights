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
  'handwritten',
  'pexels',
  'QuranHandwrittenShort',
  'QuranNatureShort',
  'CinematicPexelsShort',
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
  enableLivingBackground: z.boolean().optional().default(true),
  waveMotion: z.boolean().optional().default(true),
  showLightLeaks: z.boolean().optional().default(true),
  showMist: z.boolean().optional().default(true),
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
  // Voiceover TTS options
  enableVoiceover: z.boolean().optional().default(true),
  hookAudioSrc: z.string().optional(),
  hookAudioDuration: z.number().optional(),
  bodyAudioSrc: z.string().optional(),
  bodyAudioDuration: z.number().optional(),
  voiceoverAudio: z.string().optional(),
  voiceoverVolume: z.number().min(0).max(2).optional().default(1.0),
  bgMusicVolume: z.number().min(0).max(1).optional(),
  penVolume: z.number().min(0).max(1).optional(),
  voiceoverVoice: z.string().optional().default('ur-PK-AsadNeural'),
  voiceoverRate: z.string().optional().default('-5%'),
  voiceoverPitch: z.string().optional().default('-1Hz'),
  // Remotion Captions synchronization
  hookCaptions: z.array(z.object({
    text: z.string(),
    startMs: z.number(),
    endMs: z.number(),
    timestampMs: z.number().nullable().optional(),
    confidence: z.number().nullable().optional(),
  })).optional(),
  bodyCaptions: z.array(z.object({
    text: z.string(),
    startMs: z.number(),
    endMs: z.number(),
    timestampMs: z.number().nullable().optional(),
    confidence: z.number().nullable().optional(),
  })).optional(),
  hookSrt: z.string().optional(),
  bodySrt: z.string().optional(),
  // Styling overrides for background/text visibility
  urduTextColor: z.string().optional(),
  hookTextColor: z.string().optional(),
  inkShadow: z.string().optional(),
  hookShadow: z.string().optional(),
  dividerColor: z.string().optional(),
  titleTextColor: z.string().optional(),
  titleTextShadow: z.string().optional(),
  headerBadgeBgColor: z.string().optional(),
  headerBadgeBorderColor: z.string().optional(),
  footerTextColor: z.string().optional(),
  footerTextShadow: z.string().optional(),
  footerBadgeBgColor: z.string().optional(),
  footerBadgeBorderColor: z.string().optional(),
  glassCardBg: z.string().optional(),
  glassCardBorder: z.string().optional(),
  // Pexels Vertical Video Background
  pexelsQuery: z.string().optional(),
  pexelsApiKey: z.string().optional(),
  backgroundVideoUrl: z.string().optional(),
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
  enableLivingBackground: true,
  waveMotion: true,
  showLightLeaks: true,
  showMist: true,
  title: 'خاموش پکار',
  hook: 'کیا آپ کو بھی لگتا ہے کہ جب دکھ کی شدت سے لفظ ساتھ چھوڑ دیں، تو کوئی آپ کے اندر کے شور کو نہیں سن پاتا؟',
  urduText: '',
  bgTheme: 'random',
  qalam: 'random',
  qalamScale: 6,
  fontFamily: 'random',
  showPenAnimation: true,
  bgMusic: 'random',
  penScratchSound: true,
  penSoundSrc: 'audio/qalam_sound.mp3',
  readingPauseSeconds: 4.5,
  enableVoiceover: true,
  voiceoverVolume: 1.0,
  voiceoverVoice: 'ur-PK-AsadNeural',
  voiceoverRate: '-5%',
  voiceoverPitch: '-1Hz',
};

export { resolveConcretePayload } from './utils/propsResolver';

