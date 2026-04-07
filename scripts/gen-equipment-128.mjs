/**
 * Wasteland Grind - 128x128 Smooth Equipment Icon Generator
 * Generates smooth (non-pixelated) PNG icons using arc(), gradients, bezier curves.
 * Run: node scripts/gen-equipment-128.mjs
 */
import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

const SIZE = 128;
const CX = SIZE / 2;
const CY = SIZE / 2;
const OUT = path.resolve('public/assets/equipment-128');
fs.mkdirSync(OUT, { recursive: true });

let totalCount = 0;

// ════════════════════════════════════════════════════════
// TIER COLOR SYSTEM
// ════════════════════════════════════════════════════════
// Tiers go from 1 (rusty/brown) to 9 (legendary gold/purple)
const TIERS = {
  1: { primary: '#8B6B45', accent: '#A08050', glow: '#6B4F30', vignette: '#3D2B15' },
  2: { primary: '#6B7B55', accent: '#8B9B6B', glow: '#4B5B35', vignette: '#2B3B15' },
  3: { primary: '#5B7B8B', accent: '#7B9BAB', glow: '#3B5B6B', vignette: '#1B3B4B' },
  4: { primary: '#6B6B9B', accent: '#8B8BBB', glow: '#4B4B7B', vignette: '#2B2B5B' },
  5: { primary: '#8B5B8B', accent: '#AB7BAB', glow: '#6B3B6B', vignette: '#4B1B4B' },
  6: { primary: '#9B4B4B', accent: '#BB6B6B', glow: '#7B2B2B', vignette: '#5B1515' },
  7: { primary: '#2BA5A5', accent: '#4BC5C5', glow: '#1B8585', vignette: '#0B4545' },
  8: { primary: '#DAA520', accent: '#FFD700', glow: '#B8860B', vignette: '#5B4500' },
  9: { primary: '#C080FF', accent: '#E0B0FF', glow: '#9050DD', vignette: '#4B1B7B' },
};

function getTier(index, total) {
  const t = Math.floor((index / total) * 9) + 1;
  return Math.min(t, 9);
}

// ════════════════════════════════════════════════════════
// CANVAS UTILITIES
// ════════════════════════════════════════════════════════
function makeCanvas() {
  const c = createCanvas(SIZE, SIZE);
  const ctx = c.getContext('2d');
  ctx.antialias = 'subpixel';
  ctx.quality = 'best';
  return { canvas: c, ctx };
}

function drawBackground(ctx, tier) {
  const t = TIERS[tier] || TIERS[1];
  // Dark base
  ctx.fillStyle = '#0D0D0D';
  ctx.fillRect(0, 0, SIZE, SIZE);
  // Radial vignette
  const vg = ctx.createRadialGradient(CX, CY, 10, CX, CY, 80);
  vg.addColorStop(0, t.vignette + '60');
  vg.addColorStop(0.6, t.vignette + '30');
  vg.addColorStop(1, 'transparent');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, SIZE, SIZE);
}

function metalGrad(ctx, x1, y1, x2, y2, baseColor, highlightColor) {
  const g = ctx.createLinearGradient(x1, y1, x2, y2);
  g.addColorStop(0, highlightColor || lighten(baseColor, 40));
  g.addColorStop(0.3, baseColor);
  g.addColorStop(0.6, darken(baseColor, 30));
  g.addColorStop(0.85, baseColor);
  g.addColorStop(1, lighten(baseColor, 20));
  return g;
}

function lighten(hex, amt) {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  r = Math.min(255, r + amt);
  g = Math.min(255, g + amt);
  b = Math.min(255, b + amt);
  return `rgb(${r},${g},${b})`;
}

function darken(hex, amt) {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  r = Math.max(0, r - amt);
  g = Math.max(0, g - amt);
  b = Math.max(0, b - amt);
  return `rgb(${r},${g},${b})`;
}

function addGlow(ctx, x, y, radius, color, alpha = 0.4) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
  g.addColorStop(0, color + Math.round(alpha * 255).toString(16).padStart(2, '0'));
  g.addColorStop(1, 'transparent');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawRivet(ctx, x, y, r = 2) {
  const g = ctx.createRadialGradient(x - 0.5, y - 0.5, 0, x, y, r);
  g.addColorStop(0, '#AAAAAA');
  g.addColorStop(0.5, '#666666');
  g.addColorStop(1, '#333333');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function saveIcon(canvas, filename) {
  const buf = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(OUT, `${filename}.png`), buf);
  totalCount++;
}

// ════════════════════════════════════════════════════════
// WEAPON DRAWING FUNCTIONS
// ════════════════════════════════════════════════════════

function drawSword(ctx, tier, variant = 'standard') {
  const t = TIERS[tier];
  const bladeColor = tier <= 3 ? '#9B9B9B' : tier <= 6 ? '#C0C8D8' : '#E8D8C0';
  const gripColor = tier <= 3 ? '#5C3A1E' : tier <= 6 ? '#3B2B4B' : '#2B1B3B';

  // Blade
  ctx.save();
  ctx.translate(CX, CY);
  ctx.rotate(-Math.PI / 4);

  const bladeGrad = metalGrad(ctx, -6, -45, 6, -45, bladeColor);
  ctx.fillStyle = bladeGrad;
  ctx.beginPath();
  if (variant === 'serrated') {
    ctx.moveTo(0, -50);
    ctx.lineTo(6, -40);
    for (let i = -35; i < 10; i += 8) {
      ctx.lineTo(8, i);
      ctx.lineTo(5, i + 4);
    }
    ctx.lineTo(5, 10);
    ctx.lineTo(-5, 10);
    ctx.lineTo(-5, -40);
    ctx.lineTo(0, -50);
  } else if (variant === 'curved') {
    ctx.moveTo(0, -50);
    ctx.quadraticCurveTo(12, -30, 8, -5);
    ctx.lineTo(5, 10);
    ctx.lineTo(-3, 10);
    ctx.quadraticCurveTo(-4, -25, 0, -50);
  } else {
    ctx.moveTo(0, -50);
    ctx.lineTo(7, -40);
    ctx.lineTo(6, 10);
    ctx.lineTo(-6, 10);
    ctx.lineTo(-7, -40);
    ctx.closePath();
  }
  ctx.fill();
  ctx.strokeStyle = lighten(bladeColor, 30);
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // Edge highlight
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-1, -48);
  ctx.lineTo(-1, 8);
  ctx.stroke();

  // Guard
  ctx.fillStyle = metalGrad(ctx, -15, 10, 15, 14, t.primary);
  ctx.beginPath();
  roundedRect(ctx, -15, 8, 30, 6, 2);
  ctx.fill();

  // Grip
  ctx.fillStyle = gripColor;
  ctx.fillRect(-4, 14, 8, 22);
  // Grip wrapping
  ctx.strokeStyle = lighten(gripColor, 20);
  ctx.lineWidth = 1.5;
  for (let i = 16; i < 34; i += 4) {
    ctx.beginPath();
    ctx.moveTo(-4, i);
    ctx.lineTo(4, i + 2);
    ctx.stroke();
  }

  // Pommel
  ctx.fillStyle = t.accent;
  ctx.beginPath();
  ctx.arc(0, 38, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawAxe(ctx, tier) {
  const t = TIERS[tier];
  const headColor = tier <= 3 ? '#7B7B7B' : tier <= 6 ? '#A0A8B8' : '#D0C0A0';

  ctx.save();
  ctx.translate(CX, CY);

  // Handle
  ctx.fillStyle = '#5C3A1E';
  ctx.fillRect(-3, -10, 6, 55);
  ctx.strokeStyle = '#3D2510';
  ctx.lineWidth = 1;
  ctx.strokeRect(-3, -10, 6, 55);

  // Axe head
  ctx.fillStyle = metalGrad(ctx, -30, -35, 5, -35, headColor);
  ctx.beginPath();
  ctx.moveTo(-3, -30);
  ctx.quadraticCurveTo(-35, -40, -30, -10);
  ctx.quadraticCurveTo(-28, 5, -3, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = lighten(headColor, 20);
  ctx.lineWidth = 1;
  ctx.stroke();

  // Edge highlight
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-30, -38);
  ctx.quadraticCurveTo(-33, -15, -28, 3);
  ctx.stroke();

  // Glow on edge for high tiers
  if (tier >= 6) {
    addGlow(ctx, -25, -15, 20, t.accent, 0.2);
  }

  ctx.restore();
}

function drawBow(ctx, tier) {
  const t = TIERS[tier];
  const bowColor = tier <= 3 ? '#6B4520' : tier <= 6 ? '#4B3530' : t.primary;

  ctx.save();
  ctx.translate(CX, CY);

  // Bow limb
  ctx.strokeStyle = bowColor;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-5, 40);
  ctx.bezierCurveTo(-30, 20, -30, -20, -5, -40);
  ctx.stroke();

  // String
  ctx.strokeStyle = '#C0C0C0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-5, -40);
  ctx.lineTo(5, 0);
  ctx.lineTo(-5, 40);
  ctx.stroke();

  // Arrow
  ctx.strokeStyle = '#8B7B55';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(5, 0);
  ctx.lineTo(35, 0);
  ctx.stroke();

  // Arrowhead
  ctx.fillStyle = '#A0A0A0';
  ctx.beginPath();
  ctx.moveTo(40, 0);
  ctx.lineTo(33, -4);
  ctx.lineTo(33, 4);
  ctx.closePath();
  ctx.fill();

  // Fletching
  ctx.fillStyle = '#BB3333';
  ctx.beginPath();
  ctx.moveTo(8, 0);
  ctx.lineTo(5, -5);
  ctx.lineTo(12, 0);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(8, 0);
  ctx.lineTo(5, 5);
  ctx.lineTo(12, 0);
  ctx.closePath();
  ctx.fill();

  if (tier >= 7) addGlow(ctx, 0, 0, 25, t.accent, 0.2);
  ctx.restore();
}

function drawGun(ctx, tier, variant = 'pistol') {
  const t = TIERS[tier];
  const bodyColor = tier <= 3 ? '#4A4A4A' : tier <= 6 ? '#3A3A4A' : '#2A2A3A';

  ctx.save();
  ctx.translate(CX, CY);

  if (variant === 'rifle') {
    // Stock
    ctx.fillStyle = '#5C3A1E';
    ctx.beginPath();
    ctx.moveTo(-40, 5);
    ctx.lineTo(-25, 5);
    ctx.lineTo(-25, -3);
    ctx.lineTo(-35, -3);
    ctx.quadraticCurveTo(-42, 0, -40, 5);
    ctx.fill();

    // Body
    ctx.fillStyle = metalGrad(ctx, -25, -8, 30, -8, bodyColor);
    roundedRect(ctx, -25, -8, 55, 12, 2);
    ctx.fill();

    // Barrel
    ctx.fillStyle = metalGrad(ctx, 30, -5, 30, 0, '#5A5A6A');
    ctx.fillRect(30, -4, 20, 6);

    // Scope
    if (variant === 'rifle' && tier >= 4) {
      ctx.fillStyle = '#333344';
      roundedRect(ctx, -10, -16, 30, 8, 3);
      ctx.fill();
      ctx.fillStyle = '#5588CC';
      ctx.beginPath();
      ctx.arc(15, -12, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Trigger
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-5, 4);
    ctx.lineTo(-5, 14);
    ctx.lineTo(0, 14);
    ctx.stroke();
  } else {
    // Pistol body
    ctx.fillStyle = metalGrad(ctx, -15, -10, 20, -10, bodyColor);
    roundedRect(ctx, -15, -10, 35, 14, 3);
    ctx.fill();

    // Barrel
    ctx.fillStyle = metalGrad(ctx, 20, -7, 20, 0, '#5A5A6A');
    ctx.fillRect(20, -7, 15, 8);

    // Grip
    ctx.fillStyle = '#4A3020';
    ctx.beginPath();
    ctx.moveTo(-10, 4);
    ctx.lineTo(-15, 25);
    ctx.lineTo(-5, 27);
    ctx.lineTo(0, 4);
    ctx.closePath();
    ctx.fill();
    // Grip texture
    ctx.strokeStyle = '#3A2010';
    ctx.lineWidth = 0.8;
    for (let i = 8; i < 24; i += 3) {
      ctx.beginPath();
      ctx.moveTo(-13, i);
      ctx.lineTo(-3, i + 1);
      ctx.stroke();
    }

    // Trigger guard
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(-2, 10, 6, 0, Math.PI, false);
    ctx.stroke();
  }

  if (tier >= 7) addGlow(ctx, 10, -3, 20, t.accent, 0.15);
  ctx.restore();
}

function drawExplosive(ctx, tier, variant = 'bomb') {
  const t = TIERS[tier];

  ctx.save();
  ctx.translate(CX, CY);

  if (variant === 'grenade') {
    // Body
    const bodyGrad = ctx.createRadialGradient(-3, -5, 2, 0, 0, 22);
    bodyGrad.addColorStop(0, '#5A6A3A');
    bodyGrad.addColorStop(0.7, '#3A4A2A');
    bodyGrad.addColorStop(1, '#2A3A1A');
    ctx.fillStyle = bodyGrad;
    roundedRect(ctx, -16, -12, 32, 30, 6);
    ctx.fill();

    // Grid pattern
    ctx.strokeStyle = '#2A3A1A';
    ctx.lineWidth = 0.5;
    for (let i = -10; i < 16; i += 4) {
      ctx.beginPath(); ctx.moveTo(-14, i); ctx.lineTo(14, i); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(i - 2, -10); ctx.lineTo(i - 2, 16); ctx.stroke();
    }

    // Lever
    ctx.fillStyle = '#888';
    ctx.fillRect(-3, -20, 6, 10);
    // Spoon
    ctx.strokeStyle = '#AAA';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(3, -20);
    ctx.quadraticCurveTo(12, -25, 10, -15);
    ctx.stroke();

    // Pin ring
    ctx.strokeStyle = '#CCC';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(-8, -18, 4, 0, Math.PI * 2);
    ctx.stroke();
  } else if (variant === 'mine') {
    // Disc body
    const mineGrad = ctx.createRadialGradient(0, 0, 3, 0, 0, 28);
    mineGrad.addColorStop(0, '#6A6A6A');
    mineGrad.addColorStop(0.6, '#4A4A4A');
    mineGrad.addColorStop(1, '#2A2A2A');
    ctx.fillStyle = mineGrad;
    ctx.beginPath();
    ctx.ellipse(0, 5, 28, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Top plate
    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.ellipse(0, -2, 22, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pressure plate
    ctx.fillStyle = tier >= 5 ? t.accent : '#777';
    ctx.beginPath();
    ctx.ellipse(0, -3, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rivets
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      drawRivet(ctx, Math.cos(a) * 18, -2 + Math.sin(a) * 8, 1.5);
    }
  } else if (variant === 'molotov') {
    // Bottle
    ctx.fillStyle = '#3A5A2A';
    ctx.beginPath();
    ctx.moveTo(-3, -25);
    ctx.lineTo(-3, -15);
    ctx.quadraticCurveTo(-14, -10, -12, 15);
    ctx.quadraticCurveTo(-10, 25, 0, 25);
    ctx.quadraticCurveTo(10, 25, 12, 15);
    ctx.quadraticCurveTo(14, -10, 3, -15);
    ctx.lineTo(3, -25);
    ctx.closePath();
    ctx.fill();

    // Liquid
    ctx.fillStyle = '#CC6600';
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(-10, 5);
    ctx.quadraticCurveTo(-8, 0, 0, 2);
    ctx.quadraticCurveTo(8, 0, 10, 5);
    ctx.quadraticCurveTo(10, 23, 0, 23);
    ctx.quadraticCurveTo(-10, 23, -10, 5);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Rag
    ctx.strokeStyle = '#AA9955';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -25);
    ctx.quadraticCurveTo(5, -35, -3, -40);
    ctx.stroke();

    // Flame
    const flameGrad = ctx.createRadialGradient(-2, -42, 1, -2, -42, 8);
    flameGrad.addColorStop(0, '#FFFF00');
    flameGrad.addColorStop(0.4, '#FF8800');
    flameGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.arc(-2, -42, 8, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Generic bomb
    const bombGrad = ctx.createRadialGradient(-5, -8, 3, 0, 0, 25);
    bombGrad.addColorStop(0, '#5A5A5A');
    bombGrad.addColorStop(0.7, '#3A3A3A');
    bombGrad.addColorStop(1, '#1A1A1A');
    ctx.fillStyle = bombGrad;
    ctx.beginPath();
    ctx.arc(0, 5, 25, 0, Math.PI * 2);
    ctx.fill();

    // Fuse
    ctx.strokeStyle = '#8B7355';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(5, -18);
    ctx.quadraticCurveTo(15, -30, 10, -35);
    ctx.stroke();

    // Spark
    addGlow(ctx, 10, -35, 6, '#FFAA00', 0.6);

    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath();
    ctx.arc(-8, -5, 14, 0, Math.PI * 2);
    ctx.fill();
  }

  if (tier >= 6) addGlow(ctx, 0, 0, 30, t.accent, 0.15);
  ctx.restore();
}

function drawClub(ctx, tier) {
  const t = TIERS[tier];
  ctx.save();
  ctx.translate(CX, CY);
  ctx.rotate(-Math.PI / 6);

  // Handle
  ctx.fillStyle = '#5C3A1E';
  ctx.fillRect(-4, -5, 8, 50);

  // Head
  const headGrad = metalGrad(ctx, -12, -35, 12, -35, tier <= 3 ? '#6B6B6B' : t.primary);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.moveTo(-5, -5);
  ctx.quadraticCurveTo(-15, -15, -12, -30);
  ctx.quadraticCurveTo(-8, -40, 0, -40);
  ctx.quadraticCurveTo(8, -40, 12, -30);
  ctx.quadraticCurveTo(15, -15, 5, -5);
  ctx.closePath();
  ctx.fill();

  // Spikes
  ctx.fillStyle = '#AAA';
  const spikeAngles = [-2.5, -1.8, -1.2, -0.5, 0.2];
  for (const a of spikeAngles) {
    const sx = Math.cos(a) * 12;
    const sy = -22 + Math.sin(a) * 10;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + Math.cos(a) * 8, sy + Math.sin(a) * 8);
    ctx.lineTo(sx + Math.cos(a + 0.4) * 3, sy + Math.sin(a + 0.4) * 3);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

function drawMace(ctx, tier) {
  const t = TIERS[tier];
  ctx.save();
  ctx.translate(CX, CY);
  ctx.rotate(-Math.PI / 5);

  // Handle
  ctx.fillStyle = '#5C3A1E';
  ctx.fillRect(-3, 0, 6, 45);
  // Grip wrapping
  ctx.strokeStyle = '#8B6B45';
  ctx.lineWidth = 1;
  for (let i = 20; i < 42; i += 3) {
    ctx.beginPath(); ctx.moveTo(-3, i); ctx.lineTo(3, i + 1.5); ctx.stroke();
  }

  // Mace head
  const headGrad = ctx.createRadialGradient(-2, -12, 2, 0, -8, 18);
  headGrad.addColorStop(0, lighten(t.primary, 30));
  headGrad.addColorStop(0.6, t.primary);
  headGrad.addColorStop(1, darken(t.primary, 40));
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(0, -10, 16, 0, Math.PI * 2);
  ctx.fill();

  // Flanges
  ctx.fillStyle = metalGrad(ctx, -20, -10, 20, -10, tier <= 4 ? '#888' : t.accent);
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 14, -10 + Math.sin(a) * 14);
    ctx.lineTo(Math.cos(a) * 22, -10 + Math.sin(a) * 22);
    ctx.lineTo(Math.cos(a + 0.3) * 14, -10 + Math.sin(a + 0.3) * 14);
    ctx.closePath();
    ctx.fill();
  }

  if (tier >= 7) addGlow(ctx, 0, -10, 22, t.accent, 0.25);
  ctx.restore();
}

function drawDagger(ctx, tier) {
  const t = TIERS[tier];
  const bladeColor = tier <= 3 ? '#999' : tier <= 6 ? '#B0B8C8' : '#D8D0C0';
  ctx.save();
  ctx.translate(CX, CY);
  ctx.rotate(-Math.PI / 4);

  // Blade
  ctx.fillStyle = metalGrad(ctx, -4, -35, 4, -35, bladeColor);
  ctx.beginPath();
  ctx.moveTo(0, -40);
  ctx.lineTo(5, -25);
  ctx.lineTo(4, 5);
  ctx.lineTo(-4, 5);
  ctx.lineTo(-5, -25);
  ctx.closePath();
  ctx.fill();

  // Edge highlight
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(0, -38);
  ctx.lineTo(-4, 3);
  ctx.stroke();

  // Guard
  ctx.fillStyle = t.primary;
  ctx.beginPath();
  ctx.ellipse(0, 7, 10, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Grip
  ctx.fillStyle = '#3A2515';
  ctx.fillRect(-3, 9, 6, 18);

  // Pommel
  ctx.fillStyle = t.accent;
  ctx.beginPath();
  ctx.arc(0, 29, 4, 0, Math.PI * 2);
  ctx.fill();

  if (tier >= 7) addGlow(ctx, 0, -15, 18, t.accent, 0.2);
  ctx.restore();
}

function drawHammer(ctx, tier) {
  const t = TIERS[tier];
  ctx.save();
  ctx.translate(CX, CY);

  // Handle
  ctx.fillStyle = '#5C3A1E';
  ctx.fillRect(-3, -5, 6, 52);

  // Head block
  const hColor = tier <= 3 ? '#6B6B6B' : tier <= 6 ? '#8888AA' : t.primary;
  ctx.fillStyle = metalGrad(ctx, -22, -35, 22, -35, hColor);
  roundedRect(ctx, -22, -30, 44, 26, 3);
  ctx.fill();

  // Face highlight
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(-20, -28, 18, 22);

  // Rivets
  drawRivet(ctx, -18, -25, 2);
  drawRivet(ctx, 18, -25, 2);
  drawRivet(ctx, -18, -8, 2);
  drawRivet(ctx, 18, -8, 2);

  if (tier >= 7) addGlow(ctx, 0, -17, 28, t.accent, 0.2);
  ctx.restore();
}

function drawLauncher(ctx, tier) {
  const t = TIERS[tier];
  ctx.save();
  ctx.translate(CX, CY);

  // Tube
  const tubeColor = tier <= 4 ? '#4A4A3A' : '#3A3A4A';
  ctx.fillStyle = metalGrad(ctx, -35, -8, 35, -8, tubeColor);
  roundedRect(ctx, -35, -10, 70, 18, 5);
  ctx.fill();

  // Muzzle opening
  ctx.fillStyle = '#1A1A1A';
  ctx.beginPath();
  ctx.ellipse(35, -1, 6, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Grip
  ctx.fillStyle = '#4A3020';
  ctx.beginPath();
  ctx.moveTo(-5, 8);
  ctx.lineTo(-10, 28);
  ctx.lineTo(0, 30);
  ctx.lineTo(5, 8);
  ctx.closePath();
  ctx.fill();

  // Sight
  ctx.fillStyle = '#555';
  ctx.fillRect(10, -18, 4, 8);

  // Scope glow for high tier
  if (tier >= 6) {
    ctx.fillStyle = t.accent;
    ctx.beginPath();
    ctx.arc(12, -18, 2, 0, Math.PI * 2);
    ctx.fill();
    addGlow(ctx, 12, -18, 6, t.accent, 0.4);
  }

  if (tier >= 7) addGlow(ctx, 35, -1, 10, t.accent, 0.3);
  ctx.restore();
}

function drawSlingshot(ctx, tier) {
  const t = TIERS[tier];
  ctx.save();
  ctx.translate(CX, CY);

  // Y-frame
  ctx.strokeStyle = '#5C3A1E';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 35);
  ctx.lineTo(0, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-5, -10, -15, -30);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(5, -10, 15, -30);
  ctx.stroke();

  // Bands
  ctx.strokeStyle = '#AA6633';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-15, -30);
  ctx.quadraticCurveTo(0, -10, 0, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(15, -30);
  ctx.quadraticCurveTo(0, -10, 0, 0);
  ctx.stroke();

  // Pouch
  ctx.fillStyle = '#8B6B45';
  ctx.beginPath();
  ctx.ellipse(0, -2, 6, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawCrossbow(ctx, tier) {
  const t = TIERS[tier];
  ctx.save();
  ctx.translate(CX, CY);

  // Stock
  ctx.fillStyle = '#5C3A1E';
  ctx.beginPath();
  ctx.moveTo(-30, 0);
  ctx.lineTo(20, 0);
  ctx.lineTo(20, 8);
  ctx.lineTo(-25, 8);
  ctx.quadraticCurveTo(-32, 5, -30, 0);
  ctx.fill();

  // Limbs
  ctx.strokeStyle = tier <= 4 ? '#6B6B6B' : t.primary;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-25, 0);
  ctx.quadraticCurveTo(-28, -25, -15, -35);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-25, 8);
  ctx.quadraticCurveTo(-28, 33, -15, 43);
  ctx.stroke();

  // String
  ctx.strokeStyle = '#C0C0C0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-15, -35);
  ctx.lineTo(-5, 4);
  ctx.lineTo(-15, 43);
  ctx.stroke();

  // Bolt
  ctx.strokeStyle = '#AAA';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-5, 4);
  ctx.lineTo(35, 4);
  ctx.stroke();
  ctx.fillStyle = '#CCC';
  ctx.beginPath();
  ctx.moveTo(40, 4);
  ctx.lineTo(35, 1);
  ctx.lineTo(35, 7);
  ctx.closePath();
  ctx.fill();

  if (tier >= 6) addGlow(ctx, 0, 4, 18, t.accent, 0.15);
  ctx.restore();
}

function drawCanister(ctx, tier) {
  const t = TIERS[tier];
  ctx.save();
  ctx.translate(CX, CY);

  // Cylinder
  const cylGrad = ctx.createLinearGradient(-12, 0, 12, 0);
  cylGrad.addColorStop(0, darken(t.primary, 20));
  cylGrad.addColorStop(0.3, t.primary);
  cylGrad.addColorStop(0.7, t.accent);
  cylGrad.addColorStop(1, darken(t.primary, 30));
  ctx.fillStyle = cylGrad;
  roundedRect(ctx, -12, -25, 24, 50, 6);
  ctx.fill();

  // Top cap
  ctx.fillStyle = '#666';
  ctx.beginPath();
  ctx.ellipse(0, -25, 12, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hazard stripes
  ctx.fillStyle = '#DDAA00';
  for (let i = -15; i < 15; i += 8) {
    ctx.fillRect(-10, i, 20, 3);
  }

  // Nozzle
  ctx.fillStyle = '#888';
  ctx.fillRect(-3, -33, 6, 8);
  ctx.beginPath();
  ctx.arc(0, -33, 4, 0, Math.PI, true);
  ctx.fill();

  // Vapor glow
  if (tier >= 5) addGlow(ctx, 0, -35, 12, t.accent, 0.3);

  ctx.restore();
}

function drawBeacon(ctx, tier) {
  const t = TIERS[tier];
  ctx.save();
  ctx.translate(CX, CY);

  // Base
  ctx.fillStyle = '#4A4A5A';
  ctx.beginPath();
  ctx.moveTo(-20, 20);
  ctx.lineTo(20, 20);
  ctx.lineTo(15, 28);
  ctx.lineTo(-15, 28);
  ctx.closePath();
  ctx.fill();

  // Body
  const bodyGrad = ctx.createLinearGradient(-10, -20, 10, -20);
  bodyGrad.addColorStop(0, '#3A3A4A');
  bodyGrad.addColorStop(0.5, '#5A5A6A');
  bodyGrad.addColorStop(1, '#3A3A4A');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(-12, 20);
  ctx.lineTo(-8, -20);
  ctx.lineTo(8, -20);
  ctx.lineTo(12, 20);
  ctx.closePath();
  ctx.fill();

  // Antenna
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(0, -40);
  ctx.stroke();

  // Signal rings
  ctx.strokeStyle = t.accent;
  ctx.lineWidth = 1.5;
  for (let r = 6; r <= 18; r += 6) {
    ctx.globalAlpha = 1 - (r / 24);
    ctx.beginPath();
    ctx.arc(0, -40, r, -Math.PI * 0.8, -Math.PI * 0.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -40, r, Math.PI * 0.2, Math.PI * 0.8);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Top light
  addGlow(ctx, 0, -40, 8, t.accent, 0.6);

  ctx.restore();
}

function drawRailgun(ctx, tier) {
  const t = TIERS[tier];
  ctx.save();
  ctx.translate(CX, CY);

  // Rails (two parallel bars)
  ctx.fillStyle = metalGrad(ctx, -35, -8, 40, -8, '#5A6A8A');
  roundedRect(ctx, -35, -12, 75, 6, 2);
  ctx.fill();
  ctx.fillStyle = metalGrad(ctx, -35, 6, 40, 6, '#5A6A8A');
  roundedRect(ctx, -35, 6, 75, 6, 2);
  ctx.fill();

  // Coils
  ctx.strokeStyle = '#BB8833';
  ctx.lineWidth = 2;
  for (let x = -25; x < 30; x += 10) {
    ctx.beginPath();
    ctx.moveTo(x, -12);
    ctx.lineTo(x, 12);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 2, -12);
    ctx.lineTo(x + 2, 12);
    ctx.stroke();
  }

  // Energy core
  addGlow(ctx, 0, 0, 12, '#00BBFF', 0.4);
  ctx.fillStyle = '#00DDFF';
  ctx.beginPath();
  ctx.arc(0, 0, 4, 0, Math.PI * 2);
  ctx.fill();

  // Muzzle flash
  addGlow(ctx, 40, 0, 10, t.accent, 0.5);

  // Handle
  ctx.fillStyle = '#3A3030';
  ctx.beginPath();
  ctx.moveTo(-10, 12);
  ctx.lineTo(-15, 30);
  ctx.lineTo(-5, 32);
  ctx.lineTo(0, 12);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// ════════════════════════════════════════════════════════
// ARMOR DRAWING FUNCTIONS
// ════════════════════════════════════════════════════════

function drawChestArmor(ctx, tier, material = 'plate') {
  const t = TIERS[tier];

  ctx.save();
  ctx.translate(CX, CY);

  if (material === 'cloth') {
    // Cloth/vest shape
    const clothColor = tier <= 3 ? '#6B5B4B' : t.primary;
    ctx.fillStyle = clothColor;
    ctx.beginPath();
    ctx.moveTo(-25, -30);
    ctx.quadraticCurveTo(-30, -10, -28, 30);
    ctx.lineTo(-10, 35);
    ctx.lineTo(10, 35);
    ctx.lineTo(28, 30);
    ctx.quadraticCurveTo(30, -10, 25, -30);
    ctx.lineTo(10, -35);
    ctx.lineTo(-10, -35);
    ctx.closePath();
    ctx.fill();

    // Collar
    ctx.strokeStyle = darken(clothColor, 20);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-10, -35);
    ctx.quadraticCurveTo(0, -28, 10, -35);
    ctx.stroke();

    // Stitch lines
    ctx.strokeStyle = lighten(clothColor, 15);
    ctx.lineWidth = 0.8;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(0, -30);
    ctx.lineTo(0, 30);
    ctx.stroke();
    ctx.setLineDash([]);
  } else if (material === 'leather') {
    const leatherColor = tier <= 3 ? '#654321' : tier <= 5 ? '#5A3A25' : t.primary;
    ctx.fillStyle = leatherColor;
    ctx.beginPath();
    ctx.moveTo(-25, -28);
    ctx.quadraticCurveTo(-32, 0, -28, 30);
    ctx.lineTo(-8, 35);
    ctx.lineTo(8, 35);
    ctx.lineTo(28, 30);
    ctx.quadraticCurveTo(32, 0, 25, -28);
    ctx.lineTo(8, -32);
    ctx.lineTo(-8, -32);
    ctx.closePath();
    ctx.fill();

    // Straps
    ctx.strokeStyle = darken(leatherColor, 15);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-20, -20);
    ctx.lineTo(-20, 25);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(20, -20);
    ctx.lineTo(20, 25);
    ctx.stroke();

    // Buckles
    ctx.fillStyle = '#AAA';
    ctx.fillRect(-22, -5, 5, 6);
    ctx.fillRect(17, -5, 5, 6);
  } else {
    // Plate armor
    const plateColor = tier <= 3 ? '#7B7B7B' : tier <= 5 ? '#8888AA' : t.primary;
    const plateGrad = metalGrad(ctx, -25, -30, 25, 30, plateColor);
    ctx.fillStyle = plateGrad;
    ctx.beginPath();
    ctx.moveTo(-22, -30);
    ctx.quadraticCurveTo(-30, -5, -25, 25);
    ctx.lineTo(-12, 32);
    ctx.quadraticCurveTo(0, 35, 12, 32);
    ctx.lineTo(25, 25);
    ctx.quadraticCurveTo(30, -5, 22, -30);
    ctx.lineTo(8, -33);
    ctx.quadraticCurveTo(0, -28, -8, -33);
    ctx.closePath();
    ctx.fill();

    // Center ridge
    ctx.strokeStyle = lighten(plateColor, 20);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -28);
    ctx.quadraticCurveTo(-2, 0, 0, 30);
    ctx.stroke();

    // Shoulder pauldron hints
    ctx.fillStyle = darken(plateColor, 10);
    ctx.beginPath();
    ctx.ellipse(-22, -28, 10, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(22, -28, 10, 5, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Rivets
    drawRivet(ctx, -15, -15);
    drawRivet(ctx, 15, -15);
    drawRivet(ctx, -12, 10);
    drawRivet(ctx, 12, 10);
    drawRivet(ctx, -8, 25);
    drawRivet(ctx, 8, 25);
  }

  // Tier glow for high tier
  if (tier >= 7) {
    addGlow(ctx, 0, 0, 35, t.accent, 0.15);
    // Rune lines
    ctx.strokeStyle = t.accent + '60';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-10, -10);
    ctx.lineTo(0, -20);
    ctx.lineTo(10, -10);
    ctx.lineTo(0, 5);
    ctx.closePath();
    ctx.stroke();
  }

  ctx.restore();
}

function drawHazmatSuit(ctx, tier) {
  const t = TIERS[tier];
  ctx.save();
  ctx.translate(CX, CY);

  // Body suit
  ctx.fillStyle = '#AAA830';
  ctx.beginPath();
  ctx.moveTo(-22, -25);
  ctx.quadraticCurveTo(-28, 0, -25, 30);
  ctx.lineTo(-10, 35);
  ctx.lineTo(10, 35);
  ctx.lineTo(25, 30);
  ctx.quadraticCurveTo(28, 0, 22, -25);
  ctx.closePath();
  ctx.fill();

  // Hood/visor
  ctx.fillStyle = '#888820';
  ctx.beginPath();
  ctx.arc(0, -28, 16, 0, Math.PI * 2);
  ctx.fill();

  // Visor
  ctx.fillStyle = '#335588';
  ctx.beginPath();
  ctx.ellipse(0, -28, 10, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  // Visor reflection
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.beginPath();
  ctx.ellipse(-3, -30, 5, 3, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Hazard symbol
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(0, 5, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#DDAA00';
  for (let a = 0; a < 3; a++) {
    ctx.beginPath();
    const angle = (a * Math.PI * 2) / 3 - Math.PI / 2;
    ctx.arc(0, 5, 6, angle - 0.4, angle + 0.4);
    ctx.lineTo(0, 5);
    ctx.fill();
  }

  ctx.restore();
}

// ════════════════════════════════════════════════════════
// LEGS DRAWING
// ════════════════════════════════════════════════════════

function drawLegs(ctx, tier) {
  const t = TIERS[tier];
  const plateColor = tier <= 3 ? '#7B7B7B' : tier <= 5 ? '#8888AA' : t.primary;

  ctx.save();
  ctx.translate(CX, CY);

  // Left leg
  ctx.fillStyle = metalGrad(ctx, -22, -25, -5, 35, plateColor);
  ctx.beginPath();
  ctx.moveTo(-20, -25);
  ctx.quadraticCurveTo(-24, 0, -22, 20);
  ctx.lineTo(-18, 35);
  ctx.lineTo(-5, 35);
  ctx.lineTo(-5, -25);
  ctx.closePath();
  ctx.fill();

  // Right leg
  ctx.fillStyle = metalGrad(ctx, 5, -25, 22, 35, plateColor);
  ctx.beginPath();
  ctx.moveTo(5, -25);
  ctx.lineTo(5, 35);
  ctx.lineTo(18, 35);
  ctx.lineTo(22, 20);
  ctx.quadraticCurveTo(24, 0, 20, -25);
  ctx.closePath();
  ctx.fill();

  // Belt/waist
  ctx.fillStyle = darken(plateColor, 20);
  ctx.fillRect(-22, -28, 44, 6);

  // Belt buckle
  ctx.fillStyle = tier >= 5 ? t.accent : '#AAA';
  ctx.beginPath();
  ctx.arc(0, -25, 4, 0, Math.PI * 2);
  ctx.fill();

  // Knee guards
  ctx.fillStyle = lighten(plateColor, 10);
  ctx.beginPath();
  ctx.ellipse(-13, 5, 7, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(13, 5, 7, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Knee rivets
  drawRivet(ctx, -13, 5, 2);
  drawRivet(ctx, 13, 5, 2);

  // Segment lines
  ctx.strokeStyle = darken(plateColor, 15);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-20, -10);
  ctx.lineTo(-5, -10);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(5, -10);
  ctx.lineTo(20, -10);
  ctx.stroke();

  if (tier >= 7) addGlow(ctx, 0, 5, 25, t.accent, 0.15);

  ctx.restore();
}

// ════════════════════════════════════════════════════════
// GLOVES DRAWING
// ════════════════════════════════════════════════════════

function drawGloves(ctx, tier) {
  const t = TIERS[tier];
  const gloveColor = tier <= 3 ? '#6B5540' : tier <= 5 ? '#5A5A7A' : t.primary;

  ctx.save();
  ctx.translate(CX, CY);

  // Gauntlet body
  ctx.fillStyle = metalGrad(ctx, -20, -15, 20, 25, gloveColor);
  ctx.beginPath();
  ctx.moveTo(-18, -5);
  ctx.quadraticCurveTo(-22, 10, -18, 25);
  ctx.lineTo(-10, 30);
  ctx.lineTo(10, 30);
  ctx.lineTo(18, 25);
  ctx.quadraticCurveTo(22, 10, 18, -5);
  ctx.closePath();
  ctx.fill();

  // Wrist cuff
  ctx.fillStyle = darken(gloveColor, 15);
  ctx.beginPath();
  ctx.moveTo(-20, 22);
  ctx.quadraticCurveTo(-22, 32, -15, 38);
  ctx.lineTo(15, 38);
  ctx.quadraticCurveTo(22, 32, 20, 22);
  ctx.closePath();
  ctx.fill();

  // Fingers
  const fingerW = 6;
  const fingerPositions = [-12, -4, 4, 12];
  for (let i = 0; i < fingerPositions.length; i++) {
    const fx = fingerPositions[i];
    const fLen = i === 0 || i === 3 ? 16 : 22;
    ctx.fillStyle = metalGrad(ctx, fx - 3, -5, fx + 3, -5, gloveColor);
    roundedRect(ctx, fx - fingerW / 2, -5 - fLen, fingerW, fLen, 3);
    ctx.fill();
    // Knuckle plate
    ctx.fillStyle = lighten(gloveColor, 15);
    ctx.beginPath();
    ctx.arc(fx, -6, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Thumb
  ctx.fillStyle = metalGrad(ctx, -20, 0, -14, 0, gloveColor);
  ctx.beginPath();
  ctx.moveTo(-18, 0);
  ctx.quadraticCurveTo(-28, -5, -26, -15);
  ctx.quadraticCurveTo(-24, -18, -20, -12);
  ctx.lineTo(-18, 0);
  ctx.fill();

  // Knuckle guard ridge
  ctx.strokeStyle = lighten(gloveColor, 20);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-16, -5);
  ctx.quadraticCurveTo(0, -8, 16, -5);
  ctx.stroke();

  // Rivets on cuff
  drawRivet(ctx, -12, 30, 1.5);
  drawRivet(ctx, 0, 30, 1.5);
  drawRivet(ctx, 12, 30, 1.5);

  if (tier >= 7) addGlow(ctx, 0, 0, 25, t.accent, 0.15);

  ctx.restore();
}

// ════════════════════════════════════════════════════════
// BOOTS DRAWING
// ════════════════════════════════════════════════════════

function drawBoots(ctx, tier) {
  const t = TIERS[tier];
  const bootColor = tier <= 3 ? '#5A4530' : tier <= 5 ? '#5A5A6A' : t.primary;

  ctx.save();
  ctx.translate(CX, CY);

  // Boot shaft
  ctx.fillStyle = metalGrad(ctx, -15, -35, 15, 10, bootColor);
  ctx.beginPath();
  ctx.moveTo(-15, -30);
  ctx.lineTo(-17, 10);
  ctx.quadraticCurveTo(-18, 18, -15, 20);
  ctx.lineTo(20, 20);
  ctx.quadraticCurveTo(25, 18, 25, 12);
  ctx.lineTo(17, 10);
  ctx.lineTo(15, -30);
  ctx.closePath();
  ctx.fill();

  // Sole
  ctx.fillStyle = '#2A2A2A';
  ctx.beginPath();
  ctx.moveTo(-17, 18);
  ctx.lineTo(-15, 25);
  ctx.lineTo(23, 25);
  ctx.lineTo(25, 18);
  ctx.closePath();
  ctx.fill();

  // Toe cap
  ctx.fillStyle = lighten(bootColor, 10);
  ctx.beginPath();
  ctx.moveTo(10, 10);
  ctx.quadraticCurveTo(22, 10, 23, 15);
  ctx.lineTo(22, 20);
  ctx.lineTo(10, 20);
  ctx.lineTo(10, 10);
  ctx.fill();

  // Ankle guard
  ctx.fillStyle = darken(bootColor, 10);
  ctx.beginPath();
  ctx.ellipse(0, -5, 18, 8, 0, -Math.PI * 0.1, Math.PI * 1.1);
  ctx.fill();

  // Top cuff
  ctx.fillStyle = darken(bootColor, 15);
  ctx.fillRect(-16, -32, 32, 5);

  // Straps
  ctx.strokeStyle = darken(bootColor, 20);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-15, -15);
  ctx.lineTo(15, -15);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-15, 0);
  ctx.lineTo(15, 0);
  ctx.stroke();

  // Buckle
  ctx.fillStyle = '#AAA';
  ctx.fillRect(12, -17, 4, 5);
  ctx.fillRect(12, -2, 4, 5);

  // Armor plating for high tiers
  if (tier >= 5) {
    ctx.fillStyle = lighten(bootColor, 15) + '80';
    ctx.beginPath();
    ctx.moveTo(-10, -25);
    ctx.lineTo(-12, -10);
    ctx.lineTo(12, -10);
    ctx.lineTo(10, -25);
    ctx.closePath();
    ctx.fill();
  }

  if (tier >= 7) addGlow(ctx, 5, 0, 25, t.accent, 0.15);

  ctx.restore();
}

// ════════════════════════════════════════════════════════
// SHIELD DRAWING
// ════════════════════════════════════════════════════════

function drawShield(ctx, tier, shape = 'kite') {
  const t = TIERS[tier];
  const shieldColor = tier <= 3 ? '#7B7B7B' : tier <= 5 ? '#6A6A8A' : t.primary;

  ctx.save();
  ctx.translate(CX, CY);

  if (shape === 'buckler') {
    // Small round shield
    const sGrad = ctx.createRadialGradient(-5, -5, 3, 0, 0, 28);
    sGrad.addColorStop(0, lighten(shieldColor, 25));
    sGrad.addColorStop(0.5, shieldColor);
    sGrad.addColorStop(1, darken(shieldColor, 30));
    ctx.fillStyle = sGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2);
    ctx.fill();

    // Boss
    ctx.fillStyle = metalGrad(ctx, -8, -8, 8, 8, lighten(shieldColor, 15));
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    // Rim
    ctx.strokeStyle = darken(shieldColor, 15);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 27, 0, Math.PI * 2);
    ctx.stroke();

    // Rivets on rim
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      drawRivet(ctx, Math.cos(a) * 24, Math.sin(a) * 24, 1.5);
    }
  } else if (shape === 'tower') {
    // Tall rectangular tower shield
    ctx.fillStyle = metalGrad(ctx, -22, -38, 22, 38, shieldColor);
    roundedRect(ctx, -22, -38, 44, 76, 5);
    ctx.fill();

    // Border
    ctx.strokeStyle = darken(shieldColor, 20);
    ctx.lineWidth = 3;
    roundedRect(ctx, -22, -38, 44, 76, 5);
    ctx.stroke();

    // Cross emblem
    ctx.fillStyle = tier >= 5 ? t.accent : lighten(shieldColor, 20);
    ctx.fillRect(-3, -25, 6, 50);
    ctx.fillRect(-18, -3, 36, 6);

    // Rivets
    drawRivet(ctx, -17, -33);
    drawRivet(ctx, 17, -33);
    drawRivet(ctx, -17, 33);
    drawRivet(ctx, 17, 33);
  } else {
    // Kite/heater shield
    ctx.fillStyle = metalGrad(ctx, -25, -30, 25, 35, shieldColor);
    ctx.beginPath();
    ctx.moveTo(0, -35);
    ctx.quadraticCurveTo(28, -30, 25, -5);
    ctx.quadraticCurveTo(22, 20, 0, 38);
    ctx.quadraticCurveTo(-22, 20, -25, -5);
    ctx.quadraticCurveTo(-28, -30, 0, -35);
    ctx.closePath();
    ctx.fill();

    // Border
    ctx.strokeStyle = darken(shieldColor, 20);
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Chevron emblem
    ctx.strokeStyle = tier >= 5 ? t.accent : lighten(shieldColor, 25);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-15, -10);
    ctx.lineTo(0, 5);
    ctx.lineTo(15, -10);
    ctx.stroke();

    // Rivets
    drawRivet(ctx, 0, -28);
    drawRivet(ctx, -18, -8);
    drawRivet(ctx, 18, -8);
    drawRivet(ctx, 0, 30);
  }

  if (tier >= 7) addGlow(ctx, 0, 0, 35, t.accent, 0.15);

  ctx.restore();
}

// ════════════════════════════════════════════════════════
// RING DRAWING
// ════════════════════════════════════════════════════════

function drawRing(ctx, tier, gemColor = '#DD3333') {
  const t = TIERS[tier];
  const bandColor = tier <= 3 ? '#B8860B' : tier <= 6 ? '#C0C0C0' : t.primary;

  ctx.save();
  ctx.translate(CX, CY);

  // Ring band (perspective oval)
  ctx.strokeStyle = metalGrad(ctx, -22, 0, 22, 0, bandColor);
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(0, 5, 22, 28, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Inner highlight
  ctx.strokeStyle = lighten(bandColor, 25);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(0, 5, 19, 25, 0, -0.5, 0.5);
  ctx.stroke();

  // Gem setting
  ctx.fillStyle = darken(bandColor, 10);
  ctx.beginPath();
  ctx.arc(0, -23, 10, 0, Math.PI * 2);
  ctx.fill();

  // Gem
  const gemGrad = ctx.createRadialGradient(-2, -25, 1, 0, -23, 8);
  gemGrad.addColorStop(0, lighten(gemColor, 60));
  gemGrad.addColorStop(0.4, gemColor);
  gemGrad.addColorStop(1, darken(gemColor, 40));
  ctx.fillStyle = gemGrad;
  ctx.beginPath();
  // Faceted gem shape
  ctx.moveTo(0, -30);
  ctx.lineTo(7, -25);
  ctx.lineTo(5, -18);
  ctx.lineTo(-5, -18);
  ctx.lineTo(-7, -25);
  ctx.closePath();
  ctx.fill();

  // Gem sparkle
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath();
  ctx.arc(-2, -26, 1.5, 0, Math.PI * 2);
  ctx.fill();

  if (tier >= 7) addGlow(ctx, 0, -23, 14, gemColor, 0.3);

  ctx.restore();
}

// ════════════════════════════════════════════════════════
// EARRING DRAWING
// ════════════════════════════════════════════════════════

function drawEarring(ctx, tier, gemColor = '#8855CC') {
  const t = TIERS[tier];
  const metalColor = tier <= 3 ? '#B8860B' : tier <= 6 ? '#C0C0C0' : t.primary;

  ctx.save();
  ctx.translate(CX, CY);

  // Hook/clasp
  ctx.strokeStyle = metalColor;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, -20, 8, -Math.PI * 0.8, Math.PI * 0.3);
  ctx.stroke();

  // Chain/connector
  ctx.strokeStyle = metalColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(5, -14);
  ctx.lineTo(3, 0);
  ctx.stroke();

  // Dangling gem/crystal
  const cGrad = ctx.createLinearGradient(-8, 0, 8, 25);
  cGrad.addColorStop(0, lighten(gemColor, 30));
  cGrad.addColorStop(0.5, gemColor);
  cGrad.addColorStop(1, darken(gemColor, 30));
  ctx.fillStyle = cGrad;

  // Crystal shape
  ctx.beginPath();
  ctx.moveTo(3, 0);
  ctx.lineTo(10, 8);
  ctx.lineTo(8, 22);
  ctx.lineTo(3, 28);
  ctx.lineTo(-2, 22);
  ctx.lineTo(-4, 8);
  ctx.closePath();
  ctx.fill();

  // Crystal facet line
  ctx.strokeStyle = lighten(gemColor, 40);
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(3, 0);
  ctx.lineTo(3, 28);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-4, 8);
  ctx.lineTo(10, 8);
  ctx.stroke();

  // Sparkle
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.arc(1, 5, 1.5, 0, Math.PI * 2);
  ctx.fill();

  if (tier >= 7) addGlow(ctx, 3, 14, 16, gemColor, 0.25);

  ctx.restore();
}

// ════════════════════════════════════════════════════════
// NECKLACE DRAWING
// ════════════════════════════════════════════════════════

function drawNecklace(ctx, tier, gemColor = '#3388CC') {
  const t = TIERS[tier];
  const chainColor = tier <= 3 ? '#B8860B' : tier <= 6 ? '#C0C0C0' : t.primary;

  ctx.save();
  ctx.translate(CX, CY);

  // Chain arc
  ctx.strokeStyle = chainColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-35, -25);
  ctx.quadraticCurveTo(-30, -10, -20, 5);
  ctx.quadraticCurveTo(0, 18, 20, 5);
  ctx.quadraticCurveTo(30, -10, 35, -25);
  ctx.stroke();

  // Chain links detail
  ctx.lineWidth = 1;
  for (let t2 = 0; t2 <= 1; t2 += 0.08) {
    const x = -35 + t2 * 70;
    const y = -25 + Math.sin(t2 * Math.PI) * 43;
    ctx.strokeStyle = lighten(chainColor, 15);
    ctx.beginPath();
    ctx.ellipse(x, y, 2, 1.5, t2 * Math.PI, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Pendant setting
  ctx.fillStyle = darken(chainColor, 10);
  ctx.beginPath();
  ctx.moveTo(-8, 10);
  ctx.lineTo(0, 5);
  ctx.lineTo(8, 10);
  ctx.lineTo(6, 12);
  ctx.lineTo(-6, 12);
  ctx.closePath();
  ctx.fill();

  // Pendant gem
  const pGrad = ctx.createRadialGradient(-1, 18, 2, 0, 20, 14);
  pGrad.addColorStop(0, lighten(gemColor, 40));
  pGrad.addColorStop(0.4, gemColor);
  pGrad.addColorStop(1, darken(gemColor, 40));
  ctx.fillStyle = pGrad;

  // Gem shape (varies by tier)
  if (tier <= 3) {
    // Simple circle pendant
    ctx.beginPath();
    ctx.arc(0, 22, 10, 0, Math.PI * 2);
    ctx.fill();
  } else if (tier <= 6) {
    // Teardrop
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.quadraticCurveTo(12, 20, 0, 34);
    ctx.quadraticCurveTo(-12, 20, 0, 10);
    ctx.fill();
  } else {
    // Star/diamond
    ctx.beginPath();
    ctx.moveTo(0, 8);
    ctx.lineTo(10, 20);
    ctx.lineTo(0, 35);
    ctx.lineTo(-10, 20);
    ctx.closePath();
    ctx.fill();
  }

  // Gem sparkle
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.arc(-2, 18, 2, 0, Math.PI * 2);
  ctx.fill();

  if (tier >= 7) addGlow(ctx, 0, 22, 16, gemColor, 0.3);

  ctx.restore();
}

// ════════════════════════════════════════════════════════
// ITEM DEFINITIONS
// ════════════════════════════════════════════════════════

const WEAPONS = [
  { id: 'sharpened_pipe', draw: (ctx, t) => { drawSword(ctx, t, 'standard'); } },
  { id: 'rusty_machete', draw: (ctx, t) => { drawSword(ctx, t, 'curved'); } },
  { id: 'scrap_bow', draw: (ctx, t) => { drawBow(ctx, t); } },
  { id: 'pipe_bomb', draw: (ctx, t) => { drawExplosive(ctx, t, 'bomb'); } },
  { id: 'slingshot', draw: (ctx, t) => { drawSlingshot(ctx, t); } },
  { id: 'molotov', draw: (ctx, t) => { drawExplosive(ctx, t, 'molotov'); } },
  { id: 'spiked_club', draw: (ctx, t) => { drawClub(ctx, t); } },
  { id: 'raiders_cleaver', draw: (ctx, t) => { drawSword(ctx, t, 'curved'); } },
  { id: 'pipe_pistol', draw: (ctx, t) => { drawGun(ctx, t, 'pistol'); } },
  { id: 'hunting_crossbow', draw: (ctx, t) => { drawCrossbow(ctx, t); } },
  { id: 'frag_grenade', draw: (ctx, t) => { drawExplosive(ctx, t, 'grenade'); } },
  { id: 'incendiary_mine', draw: (ctx, t) => { drawExplosive(ctx, t, 'mine'); } },
  { id: 'war_axe', draw: (ctx, t) => { drawAxe(ctx, t); } },
  { id: 'serrated_blade', draw: (ctx, t) => { drawSword(ctx, t, 'serrated'); } },
  { id: 'bolt_action_rifle', draw: (ctx, t) => { drawGun(ctx, t, 'rifle'); } },
  { id: 'twin_pistols', draw: (ctx, t) => {
    ctx.save(); ctx.translate(-10, 5); drawGun(ctx, t, 'pistol'); ctx.restore();
    ctx.save(); ctx.translate(10, -5); drawGun(ctx, t, 'pistol'); ctx.restore();
  }},
  { id: 'concussion_launcher', draw: (ctx, t) => { drawLauncher(ctx, t); } },
  { id: 'cluster_mine', draw: (ctx, t) => { drawExplosive(ctx, t, 'mine'); } },
  { id: 'reinforced_mace', draw: (ctx, t) => { drawMace(ctx, t); } },
  { id: 'assassins_dirk', draw: (ctx, t) => { drawDagger(ctx, t); } },
  { id: 'scoped_carbine', draw: (ctx, t) => { drawGun(ctx, t, 'rifle'); } },
  { id: 'repeater_crossbow', draw: (ctx, t) => { drawCrossbow(ctx, t); } },
  { id: 'rocket_launcher', draw: (ctx, t) => { drawLauncher(ctx, t); } },
  { id: 'toxic_gas_canister', draw: (ctx, t) => { drawCanister(ctx, t); } },
  { id: 'warlords_hammer', draw: (ctx, t) => { drawHammer(ctx, t); } },
  { id: 'shadow_fang', draw: (ctx, t) => { drawDagger(ctx, t); } },
  { id: 'marksmans_rifle', draw: (ctx, t) => { drawGun(ctx, t, 'rifle'); } },
  { id: 'dual_revolvers', draw: (ctx, t) => {
    ctx.save(); ctx.translate(-10, 5); drawGun(ctx, t, 'pistol'); ctx.restore();
    ctx.save(); ctx.translate(10, -5); drawGun(ctx, t, 'pistol'); ctx.restore();
  }},
  { id: 'siege_mortar', draw: (ctx, t) => { drawLauncher(ctx, t); } },
  { id: 'napalm_launcher', draw: (ctx, t) => { drawLauncher(ctx, t); } },
  { id: 'titan_cleaver', draw: (ctx, t) => { drawSword(ctx, t, 'curved'); } },
  { id: 'phantom_blade', draw: (ctx, t) => { drawSword(ctx, t, 'standard'); } },
  { id: 'anti_material_rifle', draw: (ctx, t) => { drawGun(ctx, t, 'rifle'); } },
  { id: 'storm_repeater', draw: (ctx, t) => { drawCrossbow(ctx, t); } },
  { id: 'plasma_bombard', draw: (ctx, t) => { drawLauncher(ctx, t); } },
  { id: 'radiation_emitter', draw: (ctx, t) => { drawCanister(ctx, t); } },
  { id: 'apocalypse_edge', draw: (ctx, t) => { drawSword(ctx, t, 'serrated'); } },
  { id: 'railgun', draw: (ctx, t) => { drawRailgun(ctx, t); } },
  { id: 'orbital_beacon', draw: (ctx, t) => { drawBeacon(ctx, t); } },
  { id: 'doomsday_maul', draw: (ctx, t) => { drawHammer(ctx, t); } },
  { id: 'oblivion_cannon', draw: (ctx, t) => { drawLauncher(ctx, t); } },
  { id: 'apocalypse_device', draw: (ctx, t) => { drawBeacon(ctx, t); } },
];

const ARMOR = [
  { id: 'patched_vest', draw: (ctx, t) => drawChestArmor(ctx, t, 'cloth') },
  { id: 'cloth_wrappings', draw: (ctx, t) => drawChestArmor(ctx, t, 'cloth') },
  { id: 'scrap_plate_chest', draw: (ctx, t) => drawChestArmor(ctx, t, 'plate') },
  { id: 'leather_duster', draw: (ctx, t) => drawChestArmor(ctx, t, 'leather') },
  { id: 'padded_lab_coat', draw: (ctx, t) => drawChestArmor(ctx, t, 'cloth') },
  { id: 'iron_breastplate', draw: (ctx, t) => drawChestArmor(ctx, t, 'plate') },
  { id: 'shadow_leathers', draw: (ctx, t) => drawChestArmor(ctx, t, 'leather') },
  { id: 'insulated_vest', draw: (ctx, t) => drawChestArmor(ctx, t, 'cloth') },
  { id: 'plated_war_armor', draw: (ctx, t) => drawChestArmor(ctx, t, 'plate') },
  { id: 'ranger_hide', draw: (ctx, t) => drawChestArmor(ctx, t, 'leather') },
  { id: 'hazmat_suit', draw: (ctx, t) => drawHazmatSuit(ctx, t) },
  { id: 'fortress_plate', draw: (ctx, t) => drawChestArmor(ctx, t, 'plate') },
  { id: 'nightstalker_suit', draw: (ctx, t) => drawChestArmor(ctx, t, 'leather') },
  { id: 'reactor_vest', draw: (ctx, t) => drawChestArmor(ctx, t, 'plate') },
  { id: 'siege_bulwark', draw: (ctx, t) => drawChestArmor(ctx, t, 'plate') },
  { id: 'wraith_armor', draw: (ctx, t) => drawChestArmor(ctx, t, 'leather') },
  { id: 'fusion_core_suit', draw: (ctx, t) => drawChestArmor(ctx, t, 'plate') },
  { id: 'void_walker_suit', draw: (ctx, t) => drawChestArmor(ctx, t, 'plate') },
  { id: 'singularity_frame', draw: (ctx, t) => drawChestArmor(ctx, t, 'plate') },
  { id: 'eternity_shell', draw: (ctx, t) => drawChestArmor(ctx, t, 'plate') },
  { id: 'apocalypse_aegis', draw: (ctx, t) => drawChestArmor(ctx, t, 'plate') },
  { id: 'dreadnought_plate', draw: (ctx, t) => drawChestArmor(ctx, t, 'plate') },
  { id: 'phantom_shroud', draw: (ctx, t) => drawChestArmor(ctx, t, 'leather') },
  { id: 'quantum_harness', draw: (ctx, t) => drawChestArmor(ctx, t, 'plate') },
];

const LEGS = [
  { id: 'scrap_greaves' },
  { id: 'scout_pants' },
  { id: 'iron_legguards' },
  { id: 'iron_legplates' },
  { id: 'plated_legguards' },
  { id: 'fortress_legplates' },
  { id: 'titan_legplates' },
  { id: 'doomsday_legplates' },
  { id: 'dreadnought_legplates' },
];

const GLOVES_LIST = [
  { id: 'worn_gloves' },
  { id: 'iron_gauntlets' },
  { id: 'combat_gauntlets' },
  { id: 'precision_gauntlets' },
  { id: 'deadeye_gloves' },
  { id: 'marksman_gloves' },
  { id: 'assassin_gloves' },
  { id: 'godhand_gloves' },
  { id: 'apex_gloves' },
];

const BOOTS_LIST = [
  { id: 'wasteland_boots' },
  { id: 'iron_boots' },
  { id: 'strider_boots' },
  { id: 'scout_boots' },
  { id: 'plated_boots' },
  { id: 'fortress_boots' },
  { id: 'titan_boots' },
  { id: 'godstep_boots' },
  { id: 'apex_boots' },
];

const SHIELDS = [
  { id: 'scrap_buckler', shape: 'buckler' },
  { id: 'iron_shield', shape: 'kite' },
  { id: 'tower_shield', shape: 'tower' },
  { id: 'bulwark_shield', shape: 'kite' },
  { id: 'siege_shield', shape: 'tower' },
  { id: 'dreadnought_shield', shape: 'tower' },
  { id: 'world_shield', shape: 'kite' },
  { id: 'omega_shield', shape: 'kite' },
];

const RINGS = [
  { id: 'ring_of_str', gem: '#DD3333' },
  { id: 'ring_of_dex', gem: '#33BB33' },
  { id: 'ring_of_int', gem: '#3355DD' },
  { id: 'ring_of_con', gem: '#DD8833' },
  { id: 'ring_of_per', gem: '#DDDD33' },
  { id: 'ring_of_luk', gem: '#33DDDD' },
  { id: 'ring_of_providence', gem: '#FFFFFF' },
  { id: 'ring_of_precision', gem: '#88BBFF' },
  { id: 'ring_of_destruction', gem: '#FF3355' },
];

const EARRINGS = [
  { id: 'bone_earring', gem: '#D2B48C' },
  { id: 'wire_earring', gem: '#AAAAAA' },
  { id: 'circuit_earring', gem: '#33CC55' },
  { id: 'hydraulic_earring', gem: '#5588CC' },
  { id: 'resonance_earring', gem: '#CC55CC' },
  { id: 'void_earring', gem: '#5533AA' },
  { id: 'void_earring_t8', gem: '#7744CC' },
  { id: 'anomaly_earring', gem: '#FF55AA' },
];

const NECKLACES = [
  { id: 'scrap_pendant', gem: '#8B7355' },
  { id: 'gear_pendant', gem: '#AAAAAA' },
  { id: 'motor_pendant', gem: '#BB8833' },
  { id: 'fusion_pendant', gem: '#33AADD' },
  { id: 'core_pendant', gem: '#DD5533' },
  { id: 'stellar_pendant', gem: '#FFDD33' },
  { id: 'eternity_pendant', gem: '#BB66FF' },
  { id: 'eternity_amulet', gem: '#FFD700' },
];

// ════════════════════════════════════════════════════════
// GENERATION
// ════════════════════════════════════════════════════════

function generateSlot(items, drawFn, label) {
  const total = items.length;
  for (let i = 0; i < total; i++) {
    const item = items[i];
    const tier = getTier(i, total);
    const { canvas, ctx } = makeCanvas();
    drawBackground(ctx, tier);
    if (item.draw) {
      item.draw(ctx, tier);
    } else {
      drawFn(ctx, tier, item);
    }
    saveIcon(canvas, item.id);
  }
  console.log(`  ${label}: ${total} icons`);
}

// Weapons
console.log('Generating 128x128 equipment icons...\n');

generateSlot(WEAPONS, null, 'Weapons');

generateSlot(ARMOR, null, 'Armor');

generateSlot(LEGS, (ctx, tier) => drawLegs(ctx, tier), 'Legs');

generateSlot(GLOVES_LIST, (ctx, tier) => drawGloves(ctx, tier), 'Gloves');

generateSlot(BOOTS_LIST, (ctx, tier) => drawBoots(ctx, tier), 'Boots');

generateSlot(SHIELDS, (ctx, tier, item) => drawShield(ctx, tier, item.shape), 'Shields');

generateSlot(RINGS, (ctx, tier, item) => drawRing(ctx, tier, item.gem), 'Rings');

generateSlot(EARRINGS, (ctx, tier, item) => drawEarring(ctx, tier, item.gem), 'Earrings');

generateSlot(NECKLACES, (ctx, tier, item) => drawNecklace(ctx, tier, item.gem), 'Necklaces');

console.log(`\nDone! Generated ${totalCount} icons in ${OUT}`);
