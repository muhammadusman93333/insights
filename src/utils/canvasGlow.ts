/**
 * Programmatically generates high-performance image data URLs for blurred glows and flames.
 * This runs once at script load time, converting heavy runtime CSS blurs and gradients
 * into fast, browser-cached static images.
 */

export function createGlowDot(color: string, size: number): string {
  if (typeof document === 'undefined') {
    return ''; // Node SSR fallback
  }

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const center = size / 2;
  const grad = ctx.createRadialGradient(center, center, 0, center, center, center);
  grad.addColorStop(0, color);
  grad.addColorStop(0.2, color);
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(center, center, center, 0, Math.PI * 2);
  ctx.fill();

  return canvas.toDataURL();
}

export function createFlameImage(): string {
  if (typeof document === 'undefined') {
    return ''; // Node SSR fallback
  }

  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // 1. Outer Fiery Orange/Gold Teardrop Body
  const gradOuter = ctx.createLinearGradient(32, 120, 32, 20);
  gradOuter.addColorStop(0, 'rgba(255, 253, 226, 0.95)');
  gradOuter.addColorStop(0.3, 'rgba(252, 239, 222, 0.95)');
  gradOuter.addColorStop(0.7, 'rgba(253, 248, 223, 0.98)');
  gradOuter.addColorStop(1, 'rgba(255, 250, 210, 1)');

  ctx.fillStyle = gradOuter;
  ctx.beginPath();
  ctx.moveTo(32, 20);
  ctx.bezierCurveTo(10, 60, 10, 110, 32, 120);
  ctx.bezierCurveTo(54, 110, 54, 60, 32, 20);
  ctx.fill();

  // 2. Inner Brilliant White-Hot Teardrop Core
  const gradInner = ctx.createLinearGradient(32, 110, 32, 50);
  gradInner.addColorStop(0, 'rgba(255, 230, 140, 0.8)');
  gradInner.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
  gradInner.addColorStop(1, 'rgba(255, 255, 255, 1)');

  ctx.fillStyle = gradInner;
  ctx.beginPath();
  ctx.moveTo(32, 50);
  ctx.bezierCurveTo(20, 70, 20, 105, 32, 110);
  ctx.bezierCurveTo(44, 105, 44, 70, 32, 50);
  ctx.fill();

  // 3. Physical Blue Flame Base
  const gradBase = ctx.createRadialGradient(32, 116, 0, 32, 116, 14);
  gradBase.addColorStop(0, 'rgba(70, 140, 255, 0.9)');
  gradBase.addColorStop(0.5, 'rgba(30, 80, 220, 0.55)');
  gradBase.addColorStop(1, 'rgba(30, 80, 220, 0)');

  ctx.fillStyle = gradBase;
  ctx.beginPath();
  ctx.arc(32, 116, 14, 0, Math.PI * 2);
  ctx.fill();

  return canvas.toDataURL();
}
