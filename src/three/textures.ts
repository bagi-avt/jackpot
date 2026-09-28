import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';
import { DIGITS, TAU } from '../lib/reelMath';

const FONT = '"Russo One", Impact, "Arial Black", sans-serif';
const CAP = 0.72;
const ADVANCE = 0.62;

export interface ReelTextureSet {
  sharp: CanvasTexture;
  blur: CanvasTexture;
}

function drawReel(radius: number, width: number, blur: boolean): CanvasTexture {
  const W = 2048;
  const circumference = TAU * radius;
  const ppu = W / circumference;
  const H = Math.max(64, Math.round(width * ppu));

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas unavailable');

  const edge = ctx.createLinearGradient(0, 0, 0, H);
  edge.addColorStop(0, '#d9ccb0');
  edge.addColorStop(0.08, '#f7eed8');
  edge.addColorStop(0.92, '#f7eed8');
  edge.addColorStop(1, '#d9ccb0');
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, W, H);

  const cell = W / DIGITS;

  ctx.fillStyle = 'rgba(80, 50, 30, 0.18)';
  for (let k = 0; k < DIGITS; k++) {
    ctx.fillRect(Math.round((k + 0.5) * cell) - 1, 0, 2, H);
  }

  const cellWorld = circumference / DIGITS;
  const glyphH = Math.min(0.6 * cellWorld, (0.78 * width * CAP) / ADVANCE);
  const fontPx = (glyphH / CAP) * ppu;
  ctx.font = `${fontPx}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  const drawDigit = (d: number, cx: number) => {
    ctx.save();
    ctx.translate(cx, H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = d === 7 ? '#b3121f' : '#1b0c08';
    const baseline = (fontPx * CAP) / 2;
    if (blur) {
      ctx.globalAlpha = 0.16;
      const spread = fontPx * 0.09;
      for (let s = -6; s <= 6; s++) ctx.fillText(String(d), 0, baseline + s * spread);
    } else {
      ctx.fillText(String(d), 0, baseline);
    }
    ctx.restore();
  };

  for (let d = 0; d < DIGITS; d++) {
    const u = ((DIGITS - d) % DIGITS) / DIGITS;
    drawDigit(d, u * W);
    if (u === 0) drawDigit(d, W);
  }

  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  tex.wrapS = RepeatWrapping;
  tex.anisotropy = 8;
  return tex;
}

export function createReelTextures(radius: number, width: number): ReelTextureSet {
  return { sharp: drawReel(radius, width, false), blur: drawReel(radius, width, true) };
}

export function createSignTexture(text: string): CanvasTexture {
  const W = 1024;
  const H = 288;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas unavailable');

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  let size = 190;
  ctx.font = `${size}px ${FONT}`;
  while (ctx.measureText(text).width > W * 0.9 && size > 40) {
    size -= 6;
    ctx.font = `${size}px ${FONT}`;
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const grad = ctx.createLinearGradient(0, H * 0.2, 0, H * 0.8);
  grad.addColorStop(0, '#fff6d0');
  grad.addColorStop(0.5, '#ffc94d');
  grad.addColorStop(1, '#d88a1c');
  ctx.fillStyle = grad;
  ctx.fillText(text, W / 2, H / 2 + size * 0.04);

  ctx.lineWidth = 3;
  ctx.strokeStyle = '#fffbe8';
  ctx.strokeText(text, W / 2, H / 2 + size * 0.04);

  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}
