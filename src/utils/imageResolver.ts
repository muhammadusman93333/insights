import { staticFile } from 'remotion';

/**
 * Resolves local public/ paths or external HTTP URLs to valid Remotion image sources
 */
export function resolveImageSrc(src?: string): string {
  if (!src || src.trim().length === 0) {
    return staticFile('nature/nature_sample.jpg');
  }

  const trimmed = src.trim();

  // If already a full URL or data URI, return directly
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }

  // Normalize relative path in public/
  let cleanPath = trimmed.replace(/\\/g, '/');
  if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.slice(1);
  }
  if (cleanPath.startsWith('public/')) {
    cleanPath = cleanPath.slice(7);
  }

  return staticFile(cleanPath);
}
