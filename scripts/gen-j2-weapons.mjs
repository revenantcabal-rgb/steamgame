/**
 * Dead City Directive - Job2 Signature Weapon Icon Generator
 * Generates 60 smooth 128x128 PNG icons for J2 class weapons.
 * Run: node scripts/gen-j2-weapons.mjs
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
// TIER COLOR SYSTEM (T1-T4 progression)
// ════════════════════════════════════════════════════════
const TIERS = {
  1: { primary: '#8B6B45', accent: '#A08050', glow: '#6B4F30', vignette: '#3D2B15', name: 'rusty' },
  2: { primary: '#8898A8', accent: '#A0B0C0', glow: '#607080', vignette: '#2B3545', name: 'steel' },
  3: { primary: '#4488CC', accent: '#66AAEE', glow: '#2266AA', vignette: '#152B4B', name: 'blue' },
  4: { primary: '#DAA520', accent: '#C080FF', glow: '#B8860B', vignette: '#4B2B5B', name: 'gold' },
};

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
  const t = TIERS[tier];
  ctx.fillStyle = '#0D0D0D';
  ctx.fillRect(0, 0, SIZE, SIZE);
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
  let [r, g, b] = parseColor(hex);
  return `rgb(${Math.min(255, r + amt)},${Math.min(255, g + amt)},${Math.min(255, b + amt)})`;
}

function darken(hex, amt) {
  let [r, g, b] = parseColor(hex);
  return `rgb(${Math.max(0, r - amt)},${Math.max(0, g - amt)},${Math.max(0, b - amt)})`;
}

function parseColor(hex) {
  if (hex.startsWith('rgb')) {
    const m = hex.match(/(\d+)/g);
    return m ? m.map(Number) : [128, 128, 128];
  }
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function addGlow(ctx, x, y, radius, color, alpha = 0.4) {
  const a = Math.round(alpha * 255).toString(16).padStart(2, '0');
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
  g.addColorStop(0, color + a);
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
// 1. SENTINEL SWORDS
// ════════════════════════════════════════════════════════
function drawSentinelSword(tier) {
  const { canvas, ctx } = makeCanvas();
  const t = TIERS[tier];
  drawBackground(ctx, tier);

  ctx.save();
  ctx.translate(CX, CY);
  ctx.rotate(-Math.PI / 4);

  // Blade
  const bladeGrad = metalGrad(ctx, -6, -48, 6, -48, t.primary, t.accent);
  ctx.fillStyle = bladeGrad;
  ctx.beginPath();
  ctx.moveTo(0, -52);
  ctx.lineTo(7, -38);
  ctx.lineTo(7, 8);
  ctx.lineTo(-7, 8);
  ctx.lineTo(-7, -38);
  ctx.closePath();
  ctx.fill();

  // Blade edge highlight
  ctx.strokeStyle = lighten(t.accent, 50);
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(0, -52);
  ctx.lineTo(0, 8);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Cross guard
  const guardGrad = metalGrad(ctx, -18, 8, 18, 8, '#666666', '#999999');
  ctx.fillStyle = guardGrad;
  ctx.beginPath();
  ctx.moveTo(-18, 6);
  ctx.lineTo(18, 6);
  ctx.lineTo(16, 13);
  ctx.lineTo(-16, 13);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Grip
  ctx.fillStyle = '#3C2415';
  roundedRect(ctx, -4, 13, 8, 24, 2);
  ctx.fill();
  // Grip wrapping
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = i % 2 === 0 ? '#5C3A1E' : '#4A2D16';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-4, 15 + i * 4.5);
    ctx.lineTo(4, 17 + i * 4.5);
    ctx.stroke();
  }

  // Pommel (pointed)
  ctx.fillStyle = metalGrad(ctx, -4, 37, 4, 37, t.primary);
  ctx.beginPath();
  ctx.moveTo(-5, 37);
  ctx.lineTo(5, 37);
  ctx.lineTo(0, 45);
  ctx.closePath();
  ctx.fill();

  // Blade glow for higher tiers
  if (tier >= 3) {
    addGlow(ctx, 0, -20, 25, t.glow, 0.25);
  }

  ctx.restore();
  saveIcon(canvas, `j2_sentinel_sword_t${tier}`);
}

// ════════════════════════════════════════════════════════
// 2. SENTINEL SHIELDS
// ════════════════════════════════════════════════════════
function drawSentinelShield(tier) {
  const { canvas, ctx } = makeCanvas();
  const t = TIERS[tier];
  drawBackground(ctx, tier);

  // Shield body (kite shape)
  const shieldGrad = ctx.createLinearGradient(CX - 30, 15, CX + 30, 110);
  shieldGrad.addColorStop(0, lighten(t.primary, 30));
  shieldGrad.addColorStop(0.4, t.primary);
  shieldGrad.addColorStop(0.7, darken(t.primary, 20));
  shieldGrad.addColorStop(1, darken(t.primary, 40));
  ctx.fillStyle = shieldGrad;
  ctx.beginPath();
  ctx.moveTo(CX, 14);
  ctx.quadraticCurveTo(CX + 38, 18, CX + 36, 50);
  ctx.quadraticCurveTo(CX + 34, 80, CX, 112);
  ctx.quadraticCurveTo(CX - 34, 80, CX - 36, 50);
  ctx.quadraticCurveTo(CX - 38, 18, CX, 14);
  ctx.closePath();
  ctx.fill();

  // Border
  ctx.strokeStyle = darken(t.primary, 30);
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Inner border
  ctx.beginPath();
  ctx.moveTo(CX, 22);
  ctx.quadraticCurveTo(CX + 30, 25, CX + 28, 50);
  ctx.quadraticCurveTo(CX + 26, 75, CX, 104);
  ctx.quadraticCurveTo(CX - 26, 75, CX - 28, 50);
  ctx.quadraticCurveTo(CX - 30, 25, CX, 22);
  ctx.closePath();
  ctx.strokeStyle = lighten(t.primary, 20);
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Cross emblem
  ctx.fillStyle = lighten(t.accent, 30);
  ctx.globalAlpha = 0.8;
  // Vertical bar
  roundedRect(ctx, CX - 4, 34, 8, 48, 2);
  ctx.fill();
  // Horizontal bar
  roundedRect(ctx, CX - 18, 48, 36, 8, 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Rivets
  drawRivet(ctx, CX - 24, 34, 2.5);
  drawRivet(ctx, CX + 24, 34, 2.5);
  drawRivet(ctx, CX, 98, 2.5);
  drawRivet(ctx, CX, 20, 2.5);

  if (tier >= 3) {
    addGlow(ctx, CX, CY, 35, t.glow, 0.15);
  }

  saveIcon(canvas, `j2_sentinel_shield_t${tier}`);
}

// ════════════════════════════════════════════════════════
// 3. BRUISER FISTS
// ════════════════════════════════════════════════════════
function drawBruiserFist(tier) {
  const { canvas, ctx } = makeCanvas();
  const t = TIERS[tier];
  drawBackground(ctx, tier);

  // Gauntlet body
  const gauntletGrad = metalGrad(ctx, 25, 30, 100, 100, t.primary, t.accent);
  ctx.fillStyle = gauntletGrad;

  // Main fist shape
  ctx.beginPath();
  ctx.moveTo(32, 45);
  ctx.quadraticCurveTo(30, 35, 42, 30);
  ctx.lineTo(90, 30);
  ctx.quadraticCurveTo(100, 30, 100, 42);
  ctx.lineTo(100, 70);
  ctx.quadraticCurveTo(100, 82, 88, 82);
  ctx.lineTo(42, 82);
  ctx.quadraticCurveTo(30, 82, 30, 70);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = darken(t.primary, 30);
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Knuckle segments
  for (let i = 0; i < 4; i++) {
    const kx = 46 + i * 14;
    ctx.beginPath();
    ctx.arc(kx, 32, 8, Math.PI, 0);
    ctx.fillStyle = metalGrad(ctx, kx - 8, 24, kx + 8, 32, t.primary);
    ctx.fill();
    ctx.strokeStyle = darken(t.primary, 25);
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Knuckle guard plate
  ctx.fillStyle = metalGrad(ctx, 38, 28, 96, 42, darken(t.primary, 10));
  roundedRect(ctx, 38, 33, 58, 10, 3);
  ctx.fill();
  ctx.strokeStyle = darken(t.primary, 30);
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Spikes on knuckles
  for (let i = 0; i < 4; i++) {
    const sx = 46 + i * 14;
    ctx.fillStyle = lighten(t.accent, 20);
    ctx.beginPath();
    ctx.moveTo(sx - 3, 26);
    ctx.lineTo(sx, 16);
    ctx.lineTo(sx + 3, 26);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = darken(t.primary, 20);
    ctx.lineWidth = 0.6;
    ctx.stroke();
  }

  // Wrist guard
  ctx.fillStyle = metalGrad(ctx, 28, 82, 50, 105, darken(t.primary, 15));
  ctx.beginPath();
  ctx.moveTo(30, 82);
  ctx.lineTo(50, 82);
  ctx.lineTo(52, 108);
  ctx.lineTo(28, 108);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = darken(t.primary, 30);
  ctx.lineWidth = 1;
  ctx.stroke();

  // Finger lines
  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = darken(t.primary, 20);
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(55 + i * 14, 43);
    ctx.lineTo(55 + i * 14, 80);
    ctx.stroke();
  }

  // Rivets on guard
  drawRivet(ctx, 42, 38, 1.5);
  drawRivet(ctx, 56, 38, 1.5);
  drawRivet(ctx, 70, 38, 1.5);
  drawRivet(ctx, 84, 38, 1.5);

  if (tier >= 3) addGlow(ctx, 65, 40, 30, t.glow, 0.2);
  saveIcon(canvas, `j2_bruiser_fist_t${tier}`);
}

// ════════════════════════════════════════════════════════
// 4. CRUSHER MAULS
// ════════════════════════════════════════════════════════
function drawCrusherMaul(tier) {
  const { canvas, ctx } = makeCanvas();
  const t = TIERS[tier];
  drawBackground(ctx, tier);

  ctx.save();
  ctx.translate(CX, CY);
  ctx.rotate(-Math.PI / 5);

  // Handle (thick)
  ctx.fillStyle = '#3C2415';
  roundedRect(ctx, -4, -8, 8, 62, 3);
  ctx.fill();
  ctx.strokeStyle = '#2A1A0D';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Handle wrapping
  for (let i = 0; i < 8; i++) {
    ctx.strokeStyle = i % 2 === 0 ? '#5C3A1E' : '#4A2D16';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-4, 10 + i * 6);
    ctx.lineTo(4, 12 + i * 6);
    ctx.stroke();
  }

  // Maul head
  const headGrad = metalGrad(ctx, -22, -50, 22, -8, t.primary, t.accent);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.moveTo(-20, -10);
  ctx.lineTo(-24, -42);
  ctx.quadraticCurveTo(-24, -50, -18, -50);
  ctx.lineTo(18, -50);
  ctx.quadraticCurveTo(24, -50, 24, -42);
  ctx.lineTo(20, -10);
  ctx.quadraticCurveTo(18, -6, -18, -6);
  ctx.quadraticCurveTo(-22, -6, -20, -10);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = darken(t.primary, 30);
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Impact face details
  ctx.fillStyle = darken(t.primary, 15);
  roundedRect(ctx, -18, -46, 36, 8, 2);
  ctx.fill();

  // Metal bands
  ctx.fillStyle = metalGrad(ctx, -22, -26, 22, -26, '#666');
  ctx.fillRect(-22, -28, 44, 5);
  ctx.fillRect(-22, -15, 44, 5);

  // Rivets
  drawRivet(ctx, -16, -26, 2);
  drawRivet(ctx, 16, -26, 2);
  drawRivet(ctx, -16, -12, 2);
  drawRivet(ctx, 16, -12, 2);

  // Pommel
  ctx.fillStyle = metalGrad(ctx, -5, 52, 5, 58, t.primary);
  ctx.beginPath();
  ctx.arc(0, 56, 6, 0, Math.PI * 2);
  ctx.fill();

  if (tier >= 3) addGlow(ctx, 0, -30, 28, t.glow, 0.25);
  ctx.restore();
  saveIcon(canvas, `j2_crusher_maul_t${tier}`);
}

// ════════════════════════════════════════════════════════
// 5. SNIPER RIFLES
// ════════════════════════════════════════════════════════
function drawSniperRifle(tier) {
  const { canvas, ctx } = makeCanvas();
  const t = TIERS[tier];
  drawBackground(ctx, tier);

  ctx.save();
  ctx.translate(CX, CY);
  ctx.rotate(-Math.PI / 6);

  const bodyColor = tier <= 2 ? '#4A4A4A' : t.primary;

  // Long barrel
  ctx.fillStyle = metalGrad(ctx, -3, -55, 3, -55, bodyColor);
  roundedRect(ctx, -3, -58, 6, 60, 2);
  ctx.fill();
  ctx.strokeStyle = darken(bodyColor, 20);
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Muzzle brake
  ctx.fillStyle = metalGrad(ctx, -5, -62, 5, -58, '#555');
  roundedRect(ctx, -5, -64, 10, 8, 1);
  ctx.fill();

  // Receiver body
  ctx.fillStyle = metalGrad(ctx, -8, 0, 8, 20, bodyColor, t.accent);
  roundedRect(ctx, -8, -2, 16, 28, 3);
  ctx.fill();
  ctx.strokeStyle = darken(bodyColor, 25);
  ctx.lineWidth = 1;
  ctx.stroke();

  // Scope mount rail
  ctx.fillStyle = '#333';
  ctx.fillRect(-3, -40, 6, 35);

  // Scope
  const scopeGrad = metalGrad(ctx, -4, -45, 4, -20, '#3A3A3A', '#555');
  ctx.fillStyle = scopeGrad;
  roundedRect(ctx, -4, -45, 8, 30, 3);
  ctx.fill();
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Scope lens
  ctx.fillStyle = ctx.createRadialGradient(-0, -44, 0, 0, -44, 3.5);
  ctx.fillStyle.addColorStop(0, tier >= 3 ? lighten(t.accent, 40) : '#88AACC');
  ctx.fillStyle.addColorStop(0.6, tier >= 3 ? t.accent : '#446688');
  ctx.fillStyle.addColorStop(1, '#222');
  ctx.beginPath();
  ctx.arc(0, -44, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Stock
  ctx.fillStyle = '#3C2415';
  ctx.beginPath();
  ctx.moveTo(-6, 26);
  ctx.lineTo(8, 26);
  ctx.lineTo(12, 52);
  ctx.lineTo(-2, 56);
  ctx.lineTo(-8, 42);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#2A1A0D';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Bipod legs
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-3, -8);
  ctx.lineTo(-16, 18);
  ctx.moveTo(3, -8);
  ctx.lineTo(16, 18);
  ctx.stroke();
  // Bipod feet
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-18, 17);
  ctx.lineTo(-14, 19);
  ctx.moveTo(14, 17);
  ctx.lineTo(18, 19);
  ctx.stroke();

  // Trigger guard
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(1, 8);
  ctx.quadraticCurveTo(6, 18, 1, 22);
  ctx.stroke();

  if (tier >= 3) addGlow(ctx, 0, -44, 8, t.glow, 0.5);
  ctx.restore();
  saveIcon(canvas, `j2_sniper_rifle_t${tier}`);
}

// ════════════════════════════════════════════════════════
// 6. GUNSLINGER PISTOLS
// ════════════════════════════════════════════════════════
function drawGunslingerPistol(tier) {
  const { canvas, ctx } = makeCanvas();
  const t = TIERS[tier];
  drawBackground(ctx, tier);

  const bodyColor = tier <= 2 ? '#555' : t.primary;

  // Barrel
  ctx.fillStyle = metalGrad(ctx, 30, 38, 105, 38, bodyColor);
  roundedRect(ctx, 30, 34, 75, 10, 3);
  ctx.fill();
  ctx.strokeStyle = darken(bodyColor, 25);
  ctx.lineWidth = 1;
  ctx.stroke();

  // Muzzle
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(105, 39, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1A1A1A';
  ctx.beginPath();
  ctx.arc(105, 39, 3, 0, Math.PI * 2);
  ctx.fill();

  // Frame/body
  ctx.fillStyle = metalGrad(ctx, 28, 38, 80, 55, bodyColor, t.accent);
  ctx.beginPath();
  ctx.moveTo(30, 44);
  ctx.lineTo(80, 44);
  ctx.lineTo(80, 58);
  ctx.lineTo(55, 58);
  ctx.lineTo(50, 62);
  ctx.lineTo(35, 62);
  ctx.lineTo(30, 58);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = darken(bodyColor, 25);
  ctx.lineWidth = 1;
  ctx.stroke();

  // Cylinder
  ctx.fillStyle = metalGrad(ctx, 48, 36, 68, 52, '#666', '#888');
  ctx.beginPath();
  ctx.arc(58, 44, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Cylinder chambers
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const cx = 58 + Math.cos(a) * 6;
    const cy = 44 + Math.sin(a) * 6;
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Grip
  ctx.fillStyle = '#3C2415';
  ctx.beginPath();
  ctx.moveTo(35, 58);
  ctx.lineTo(50, 58);
  ctx.lineTo(52, 62);
  ctx.quadraticCurveTo(54, 90, 42, 95);
  ctx.quadraticCurveTo(30, 92, 28, 70);
  ctx.lineTo(30, 62);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#2A1A0D';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Grip texture lines
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = '#5C3A1E';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(33, 66 + i * 5);
    ctx.lineTo(47, 68 + i * 5);
    ctx.stroke();
  }

  // Trigger guard
  ctx.strokeStyle = metalGrad(ctx, 42, 58, 56, 72, bodyColor);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(45, 58);
  ctx.quadraticCurveTo(56, 68, 52, 58);
  ctx.stroke();

  // Trigger
  ctx.fillStyle = '#444';
  ctx.fillRect(48, 58, 2, 8);

  // Hammer
  ctx.fillStyle = metalGrad(ctx, 30, 30, 38, 38, '#555');
  ctx.beginPath();
  ctx.moveTo(33, 38);
  ctx.lineTo(30, 28);
  ctx.lineTo(36, 28);
  ctx.lineTo(38, 35);
  ctx.closePath();
  ctx.fill();

  if (tier >= 3) addGlow(ctx, 58, 44, 15, t.glow, 0.2);
  saveIcon(canvas, `j2_gunslinger_pistol_t${tier}`);
}

// ════════════════════════════════════════════════════════
// 7. HUNTER BOWS
// ════════════════════════════════════════════════════════
function drawHunterBow(tier) {
  const { canvas, ctx } = makeCanvas();
  const t = TIERS[tier];
  drawBackground(ctx, tier);

  const limbColor = tier <= 2 ? '#5C3A1E' : t.primary;

  // Bow limbs (recurve)
  ctx.strokeStyle = metalGrad(ctx, CX - 5, 14, CX + 5, 114, limbColor, t.accent);
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';

  // Upper limb
  ctx.beginPath();
  ctx.moveTo(CX + 2, CY);
  ctx.bezierCurveTo(CX + 28, CY - 16, CX + 30, CY - 38, CX + 18, CY - 48);
  ctx.bezierCurveTo(CX + 12, CY - 52, CX + 8, CY - 50, CX + 14, CY - 54);
  ctx.stroke();

  // Lower limb
  ctx.beginPath();
  ctx.moveTo(CX + 2, CY);
  ctx.bezierCurveTo(CX + 28, CY + 16, CX + 30, CY + 38, CX + 18, CY + 48);
  ctx.bezierCurveTo(CX + 12, CY + 52, CX + 8, CY + 50, CX + 14, CY + 54);
  ctx.stroke();

  // Grip wrap
  ctx.fillStyle = '#2A1A0D';
  ctx.beginPath();
  ctx.arc(CX + 4, CY, 6, -0.6, 0.6);
  ctx.arc(CX + 4, CY, 3, 0.6, -0.6, true);
  ctx.closePath();
  ctx.fill();

  // Bowstring
  ctx.strokeStyle = '#AAAAAA';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(CX + 14, CY - 54);
  ctx.lineTo(CX - 18, CY);
  ctx.lineTo(CX + 14, CY + 54);
  ctx.stroke();

  // Arrow shaft
  ctx.strokeStyle = '#8B7355';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(CX - 18, CY);
  ctx.lineTo(CX + 50, CY);
  ctx.stroke();

  // Arrowhead
  ctx.fillStyle = metalGrad(ctx, CX + 44, CY - 5, CX + 56, CY + 5, '#888');
  ctx.beginPath();
  ctx.moveTo(CX + 56, CY);
  ctx.lineTo(CX + 46, CY - 5);
  ctx.lineTo(CX + 48, CY);
  ctx.lineTo(CX + 46, CY + 5);
  ctx.closePath();
  ctx.fill();

  // Fletching
  ctx.fillStyle = '#AA3333';
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.moveTo(CX - 14, CY);
  ctx.lineTo(CX - 20, CY - 5);
  ctx.lineTo(CX - 8, CY);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(CX - 14, CY);
  ctx.lineTo(CX - 20, CY + 5);
  ctx.lineTo(CX - 8, CY);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  if (tier >= 3) addGlow(ctx, CX + 10, CY, 30, t.glow, 0.15);
  saveIcon(canvas, `j2_hunter_bow_t${tier}`);
}

// ════════════════════════════════════════════════════════
// 8. BOMBARDIER LAUNCHERS
// ════════════════════════════════════════════════════════
function drawBombardierLauncher(tier) {
  const { canvas, ctx } = makeCanvas();
  const t = TIERS[tier];
  drawBackground(ctx, tier);

  ctx.save();
  ctx.translate(CX, CY);
  ctx.rotate(-Math.PI / 8);

  const bodyColor = tier <= 2 ? '#4A5A4A' : t.primary;

  // Main tube
  ctx.fillStyle = metalGrad(ctx, -8, -44, 8, -44, bodyColor, t.accent);
  roundedRect(ctx, -10, -48, 20, 72, 6);
  ctx.fill();
  ctx.strokeStyle = darken(bodyColor, 25);
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Muzzle ring
  ctx.strokeStyle = lighten(bodyColor, 20);
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, -48, 10, 0, Math.PI, true);
  ctx.stroke();

  // Muzzle bore
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.ellipse(0, -48, 7, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Sight post
  ctx.fillStyle = '#555';
  ctx.fillRect(-1, -54, 2, 8);
  ctx.fillStyle = tier >= 3 ? t.accent : '#888';
  ctx.beginPath();
  ctx.arc(0, -56, 2, 0, Math.PI * 2);
  ctx.fill();

  // Grip / pistol grip
  ctx.fillStyle = '#3C2415';
  ctx.beginPath();
  ctx.moveTo(-4, 10);
  ctx.lineTo(4, 10);
  ctx.lineTo(8, 32);
  ctx.quadraticCurveTo(8, 38, 2, 38);
  ctx.lineTo(-2, 38);
  ctx.quadraticCurveTo(-8, 38, -8, 32);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#2A1A0D';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Shoulder rest
  ctx.fillStyle = metalGrad(ctx, -12, 22, 12, 50, darken(bodyColor, 10));
  ctx.beginPath();
  ctx.moveTo(-6, 24);
  ctx.lineTo(6, 24);
  ctx.quadraticCurveTo(14, 36, 12, 52);
  ctx.lineTo(-12, 52);
  ctx.quadraticCurveTo(-14, 36, -6, 24);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = darken(bodyColor, 25);
  ctx.lineWidth = 1;
  ctx.stroke();

  // Exhaust vents at back
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = '#222';
    ctx.fillRect(-7, 18 + i * 4, 14, 1.5);
  }

  // Metal band details
  ctx.strokeStyle = lighten(bodyColor, 15);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-10, -20);
  ctx.lineTo(10, -20);
  ctx.moveTo(-10, 0);
  ctx.lineTo(10, 0);
  ctx.stroke();

  if (tier >= 3) addGlow(ctx, 0, -48, 14, t.glow, 0.3);
  ctx.restore();
  saveIcon(canvas, `j2_bombardier_launcher_t${tier}`);
}

// ════════════════════════════════════════════════════════
// 9. ARSONIST FLAMETHROWERS
// ════════════════════════════════════════════════════════
function drawArsonistFlame(tier) {
  const { canvas, ctx } = makeCanvas();
  const t = TIERS[tier];
  drawBackground(ctx, tier);

  ctx.save();
  ctx.translate(CX, CY);
  ctx.rotate(-Math.PI / 7);

  const bodyColor = tier <= 2 ? '#555' : t.primary;

  // Fuel tank (cylinder on back)
  ctx.fillStyle = metalGrad(ctx, -14, 18, 6, 52, darken(bodyColor, 15));
  roundedRect(ctx, -12, 14, 16, 40, 5);
  ctx.fill();
  ctx.strokeStyle = darken(bodyColor, 30);
  ctx.lineWidth = 1;
  ctx.stroke();

  // Fuel line
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-4, 14);
  ctx.bezierCurveTo(-4, 4, 0, -2, 0, -8);
  ctx.stroke();

  // Main nozzle body
  ctx.fillStyle = metalGrad(ctx, -6, -42, 6, -8, bodyColor, t.accent);
  roundedRect(ctx, -6, -42, 12, 38, 4);
  ctx.fill();
  ctx.strokeStyle = darken(bodyColor, 25);
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Nozzle flare
  ctx.fillStyle = metalGrad(ctx, -10, -48, 10, -42, bodyColor);
  ctx.beginPath();
  ctx.moveTo(-10, -42);
  ctx.lineTo(-8, -50);
  ctx.lineTo(8, -50);
  ctx.lineTo(10, -42);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = darken(bodyColor, 20);
  ctx.lineWidth = 1;
  ctx.stroke();

  // Grip
  ctx.fillStyle = '#3C2415';
  ctx.beginPath();
  ctx.moveTo(2, -4);
  ctx.lineTo(8, -4);
  ctx.lineTo(14, 18);
  ctx.lineTo(6, 22);
  ctx.closePath();
  ctx.fill();

  // Pilot flame
  const flameIntensity = 0.4 + tier * 0.15;
  const flameSize = 8 + tier * 4;

  // Outer flame
  const fg1 = ctx.createRadialGradient(0, -54, 0, 0, -54, flameSize);
  fg1.addColorStop(0, `rgba(255,200,50,${flameIntensity})`);
  fg1.addColorStop(0.4, `rgba(255,120,20,${flameIntensity * 0.7})`);
  fg1.addColorStop(0.7, `rgba(255,50,10,${flameIntensity * 0.4})`);
  fg1.addColorStop(1, 'transparent');
  ctx.fillStyle = fg1;
  ctx.beginPath();
  ctx.moveTo(-5, -50);
  ctx.bezierCurveTo(-flameSize * 0.8, -50 - flameSize, 0, -50 - flameSize * 1.4, 0, -50 - flameSize);
  ctx.bezierCurveTo(0, -50 - flameSize * 1.4, flameSize * 0.8, -50 - flameSize, 5, -50);
  ctx.closePath();
  ctx.fill();

  // Inner flame
  const fg2 = ctx.createRadialGradient(0, -54, 0, 0, -56, flameSize * 0.5);
  fg2.addColorStop(0, `rgba(255,255,200,${flameIntensity})`);
  fg2.addColorStop(0.5, `rgba(255,220,100,${flameIntensity * 0.6})`);
  fg2.addColorStop(1, 'transparent');
  ctx.fillStyle = fg2;
  ctx.beginPath();
  ctx.arc(0, -54, flameSize * 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Flame glow halo
  addGlow(ctx, 0, -56, flameSize * 1.5, '#FF6600', 0.1 + tier * 0.05);

  // Pressure gauge on tank
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(-4, 28, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = tier >= 3 ? '#44FF44' : '#888';
  ctx.beginPath();
  ctx.arc(-4, 28, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
  saveIcon(canvas, `j2_arsonist_flame_t${tier}`);
}

// ════════════════════════════════════════════════════════
// 10. CHEMIST FLASKS
// ════════════════════════════════════════════════════════
function drawChemistFlask(tier) {
  const { canvas, ctx } = makeCanvas();
  const t = TIERS[tier];
  drawBackground(ctx, tier);

  const glassColor = tier <= 2 ? '#445544' : t.primary;

  // Flask body (round bottom)
  ctx.fillStyle = metalGrad(ctx, CX - 22, 40, CX + 22, 100, glassColor, lighten(glassColor, 30));
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.moveTo(CX - 8, 35);
  ctx.lineTo(CX - 8, 50);
  ctx.bezierCurveTo(CX - 30, 58, CX - 32, 90, CX - 20, 102);
  ctx.quadraticCurveTo(CX, 114, CX + 20, 102);
  ctx.bezierCurveTo(CX + 32, 90, CX + 30, 58, CX + 8, 50);
  ctx.lineTo(CX + 8, 35);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = lighten(glassColor, 40);
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Liquid (green)
  const liquidGrad = ctx.createLinearGradient(CX, 68, CX, 108);
  liquidGrad.addColorStop(0, '#33CC55');
  liquidGrad.addColorStop(0.5, '#228B22');
  liquidGrad.addColorStop(1, '#1A6B1A');
  ctx.fillStyle = liquidGrad;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.moveTo(CX - 24, 72);
  // Liquid surface wave
  ctx.bezierCurveTo(CX - 12, 68, CX + 12, 76, CX + 24, 72);
  ctx.bezierCurveTo(CX + 32, 90, CX + 22, 100, CX + 20, 102);
  ctx.quadraticCurveTo(CX, 114, CX - 20, 102);
  ctx.bezierCurveTo(CX - 32, 90, CX - 28, 80, CX - 24, 72);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  // Bubbles
  const bubbles = [[CX - 8, 88, 3], [CX + 5, 82, 2.5], [CX - 2, 96, 2], [CX + 10, 92, 1.8], [CX - 12, 78, 1.5]];
  bubbles.forEach(([bx, by, br]) => {
    ctx.fillStyle = 'rgba(150,255,150,0.4)';
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(200,255,200,0.6)';
    ctx.beginPath();
    ctx.arc(bx - br * 0.3, by - br * 0.3, br * 0.4, 0, Math.PI * 2);
    ctx.fill();
  });

  // Flask neck
  ctx.fillStyle = metalGrad(ctx, CX - 6, 22, CX + 6, 38, glassColor);
  ctx.globalAlpha = 0.6;
  roundedRect(ctx, CX - 7, 24, 14, 14, 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = lighten(glassColor, 40);
  ctx.lineWidth = 1;
  ctx.stroke();

  // Cork
  ctx.fillStyle = '#B8945A';
  roundedRect(ctx, CX - 6, 16, 12, 10, 3);
  ctx.fill();
  ctx.strokeStyle = '#8B7040';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  // Cork lines
  ctx.strokeStyle = '#A0804A';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(CX - 4, 19);
  ctx.lineTo(CX + 4, 19);
  ctx.moveTo(CX - 3, 22);
  ctx.lineTo(CX + 3, 22);
  ctx.stroke();

  // Glass highlight
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(CX - 18, 60);
  ctx.bezierCurveTo(CX - 22, 75, CX - 20, 90, CX - 14, 100);
  ctx.stroke();

  if (tier >= 3) addGlow(ctx, CX, 85, 25, '#33CC55', 0.15 + tier * 0.05);
  saveIcon(canvas, `j2_chemist_flask_t${tier}`);
}

// ════════════════════════════════════════════════════════
// 11. CHEMIST SATCHELS
// ════════════════════════════════════════════════════════
function drawChemistSatchel(tier) {
  const { canvas, ctx } = makeCanvas();
  const t = TIERS[tier];
  drawBackground(ctx, tier);

  const leatherColor = tier <= 2 ? '#5C3A1E' : t.primary;

  // Main satchel body
  ctx.fillStyle = metalGrad(ctx, 20, 30, 108, 100, leatherColor, lighten(leatherColor, 20));
  roundedRect(ctx, 22, 32, 84, 62, 8);
  ctx.fill();
  ctx.strokeStyle = darken(leatherColor, 25);
  ctx.lineWidth = 2;
  ctx.stroke();

  // Flap
  ctx.fillStyle = metalGrad(ctx, 22, 24, 106, 52, darken(leatherColor, 10));
  ctx.beginPath();
  ctx.moveTo(24, 32);
  ctx.lineTo(104, 32);
  ctx.lineTo(104, 52);
  ctx.quadraticCurveTo(104, 58, 98, 58);
  ctx.lineTo(30, 58);
  ctx.quadraticCurveTo(24, 58, 24, 52);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = darken(leatherColor, 25);
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Buckle
  ctx.fillStyle = metalGrad(ctx, CX - 5, 52, CX + 5, 62, '#888');
  roundedRect(ctx, CX - 6, 53, 12, 8, 2);
  ctx.fill();
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Strap across
  ctx.strokeStyle = darken(leatherColor, 15);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(22, 25);
  ctx.bezierCurveTo(40, 18, 88, 18, 106, 25);
  ctx.stroke();

  // Potion vials peeking out
  const vialColors = ['#33CC55', '#CC3355', '#3355CC', '#CCCC33'];
  for (let i = 0; i < 4; i++) {
    const vx = 36 + i * 18;
    // Vial body
    ctx.fillStyle = vialColors[i];
    ctx.globalAlpha = 0.7;
    roundedRect(ctx, vx - 3, 64, 6, 18, 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = lighten(vialColors[i], 30);
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Vial cork
    ctx.fillStyle = '#B8945A';
    roundedRect(ctx, vx - 2.5, 62, 5, 4, 1);
    ctx.fill();
  }

  // Stitching detail
  ctx.strokeStyle = lighten(leatherColor, 25);
  ctx.lineWidth = 0.6;
  ctx.setLineDash([3, 3]);
  roundedRect(ctx, 26, 36, 76, 54, 6);
  ctx.stroke();
  ctx.setLineDash([]);

  if (tier >= 3) addGlow(ctx, CX, CY + 8, 30, t.glow, 0.15);
  saveIcon(canvas, `j2_chemist_satchel_t${tier}`);
}

// ════════════════════════════════════════════════════════
// 12. MEDIC BOOKS
// ════════════════════════════════════════════════════════
function drawMedicBook(tier) {
  const { canvas, ctx } = makeCanvas();
  const t = TIERS[tier];
  drawBackground(ctx, tier);

  const bindColor = tier <= 2 ? '#5C3A1E' : t.primary;

  // Book body (thick tome)
  // Pages (white edge)
  ctx.fillStyle = '#D8D0C0';
  roundedRect(ctx, 34, 22, 62, 84, 4);
  ctx.fill();

  // Front cover
  ctx.fillStyle = metalGrad(ctx, 30, 20, 94, 108, bindColor, lighten(bindColor, 20));
  roundedRect(ctx, 30, 20, 60, 86, 5);
  ctx.fill();
  ctx.strokeStyle = darken(bindColor, 30);
  ctx.lineWidth = 2;
  ctx.stroke();

  // Spine
  ctx.fillStyle = darken(bindColor, 15);
  roundedRect(ctx, 28, 20, 8, 86, 3);
  ctx.fill();
  ctx.strokeStyle = darken(bindColor, 30);
  ctx.lineWidth = 1;
  ctx.stroke();

  // Spine ridges
  for (let i = 0; i < 4; i++) {
    ctx.strokeStyle = lighten(bindColor, 10);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(28, 35 + i * 18);
    ctx.lineTo(36, 35 + i * 18);
    ctx.stroke();
  }

  // Inner border on cover
  ctx.strokeStyle = lighten(bindColor, 25);
  ctx.lineWidth = 1;
  roundedRect(ctx, 36, 28, 48, 70, 3);
  ctx.stroke();

  // Medical cross on cover
  const crossColor = tier <= 2 ? '#CC4444' : lighten(t.accent, 20);
  ctx.fillStyle = crossColor;
  // Vertical bar
  roundedRect(ctx, CX + 1 - 6, 42, 12, 36, 2);
  ctx.fill();
  // Horizontal bar
  roundedRect(ctx, CX + 1 - 16, 52, 32, 12, 2);
  ctx.fill();
  ctx.strokeStyle = darken(crossColor, 20);
  ctx.lineWidth = 0.8;
  // Re-stroke cross
  roundedRect(ctx, CX + 1 - 6, 42, 12, 36, 2);
  ctx.stroke();
  roundedRect(ctx, CX + 1 - 16, 52, 32, 12, 2);
  ctx.stroke();

  // Bookmark ribbon
  ctx.fillStyle = '#CC3333';
  ctx.beginPath();
  ctx.moveTo(78, 20);
  ctx.lineTo(78, 112);
  ctx.lineTo(75, 106);
  ctx.lineTo(72, 112);
  ctx.lineTo(72, 20);
  ctx.closePath();
  ctx.fill();

  // Page edges visible at bottom
  ctx.strokeStyle = '#C8C0B0';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(92 + i, 24);
    ctx.lineTo(92 + i, 102);
    ctx.stroke();
  }

  // Corner decorations
  if (tier >= 3) {
    ctx.fillStyle = t.accent;
    ctx.globalAlpha = 0.5;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(36, 28);
    ctx.lineTo(46, 28);
    ctx.lineTo(36, 38);
    ctx.closePath();
    ctx.fill();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(84, 98);
    ctx.lineTo(74, 98);
    ctx.lineTo(84, 88);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    addGlow(ctx, CX + 1, 58, 22, t.glow, 0.15);
  }

  saveIcon(canvas, `j2_medic_book_t${tier}`);
}

// ════════════════════════════════════════════════════════
// 13. TACTICIAN FLAGS
// ════════════════════════════════════════════════════════
function drawTacticianFlag(tier) {
  const { canvas, ctx } = makeCanvas();
  const t = TIERS[tier];
  drawBackground(ctx, tier);

  const flagColor = t.primary;

  // Pole
  ctx.fillStyle = metalGrad(ctx, 38, 10, 44, 118, '#777', '#AAA');
  roundedRect(ctx, 39, 10, 5, 108, 2);
  ctx.fill();
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Pole tip (spear point)
  ctx.fillStyle = metalGrad(ctx, 39, 4, 44, 14, '#AAA');
  ctx.beginPath();
  ctx.moveTo(41.5, 4);
  ctx.lineTo(45, 14);
  ctx.lineTo(38, 14);
  ctx.closePath();
  ctx.fill();

  // Flag pennant (waving)
  ctx.fillStyle = metalGrad(ctx, 44, 18, 108, 60, flagColor, lighten(flagColor, 25));
  ctx.beginPath();
  ctx.moveTo(44, 18);
  ctx.bezierCurveTo(70, 14, 88, 22, 108, 18);
  ctx.bezierCurveTo(108, 30, 104, 42, 108, 54);
  ctx.bezierCurveTo(88, 50, 70, 58, 44, 56);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = darken(flagColor, 25);
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Flag inner design -- chevron
  ctx.strokeStyle = lighten(flagColor, 40);
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.moveTo(60, 24);
  ctx.lineTo(76, 36);
  ctx.lineTo(60, 48);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(72, 24);
  ctx.lineTo(88, 36);
  ctx.lineTo(72, 48);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Flag wave shadow
  ctx.strokeStyle = darken(flagColor, 15);
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.moveTo(44, 36);
  ctx.bezierCurveTo(70, 32, 88, 40, 108, 36);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Pole base
  ctx.fillStyle = '#555';
  ctx.beginPath();
  ctx.arc(41.5, 118, 5, 0, Math.PI, true);
  ctx.fill();

  // Decorative ring where flag attaches
  ctx.strokeStyle = lighten(t.accent, 20);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(38, 18);
  ctx.lineTo(45, 18);
  ctx.moveTo(38, 56);
  ctx.lineTo(45, 56);
  ctx.stroke();

  if (tier >= 3) addGlow(ctx, 76, 36, 30, t.glow, 0.15);
  saveIcon(canvas, `j2_tactician_flag_t${tier}`);
}

// ════════════════════════════════════════════════════════
// 14. ENGINEER GUNS
// ════════════════════════════════════════════════════════
function drawEngineerGun(tier) {
  const { canvas, ctx } = makeCanvas();
  const t = TIERS[tier];
  drawBackground(ctx, tier);

  const bodyColor = tier <= 2 ? '#4A4A5A' : t.primary;

  // Barrel (angular/tech)
  ctx.fillStyle = metalGrad(ctx, 55, 36, 112, 48, bodyColor, t.accent);
  ctx.beginPath();
  ctx.moveTo(55, 36);
  ctx.lineTo(110, 34);
  ctx.lineTo(112, 40);
  ctx.lineTo(112, 48);
  ctx.lineTo(110, 52);
  ctx.lineTo(55, 52);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = darken(bodyColor, 25);
  ctx.lineWidth = 1;
  ctx.stroke();

  // Barrel glow channel
  ctx.strokeStyle = tier >= 3 ? t.accent : '#668899';
  ctx.lineWidth = 1.5;
  ctx.shadowColor = tier >= 3 ? t.accent : '#668899';
  ctx.shadowBlur = tier >= 3 ? 6 : 2;
  ctx.beginPath();
  ctx.moveTo(60, 44);
  ctx.lineTo(108, 44);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Muzzle glow
  const muzzleGlow = ctx.createRadialGradient(112, 44, 0, 112, 44, 8);
  muzzleGlow.addColorStop(0, tier >= 3 ? lighten(t.accent, 40) : '#AACCDD');
  muzzleGlow.addColorStop(0.5, tier >= 3 ? t.accent + '80' : '#66889980');
  muzzleGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = muzzleGlow;
  ctx.beginPath();
  ctx.arc(112, 44, 8, 0, Math.PI * 2);
  ctx.fill();

  // Receiver body
  ctx.fillStyle = metalGrad(ctx, 30, 34, 60, 60, bodyColor);
  roundedRect(ctx, 30, 34, 30, 24, 4);
  ctx.fill();
  ctx.strokeStyle = darken(bodyColor, 25);
  ctx.lineWidth = 1;
  ctx.stroke();

  // Circuit patterns on body
  ctx.strokeStyle = tier >= 3 ? t.accent : '#557788';
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.7;
  // Horizontal lines
  ctx.beginPath();
  ctx.moveTo(34, 40);
  ctx.lineTo(50, 40);
  ctx.lineTo(50, 46);
  ctx.lineTo(56, 46);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(34, 50);
  ctx.lineTo(42, 50);
  ctx.lineTo(42, 54);
  ctx.stroke();
  // Circuit nodes
  ctx.fillStyle = tier >= 3 ? t.accent : '#557788';
  ctx.beginPath();
  ctx.arc(50, 40, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(42, 50, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Grip
  ctx.fillStyle = '#2A2A35';
  ctx.beginPath();
  ctx.moveTo(36, 58);
  ctx.lineTo(52, 58);
  ctx.lineTo(54, 64);
  ctx.quadraticCurveTo(56, 92, 44, 96);
  ctx.quadraticCurveTo(32, 94, 30, 70);
  ctx.lineTo(32, 62);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#1A1A22';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Trigger
  ctx.fillStyle = '#444';
  ctx.fillRect(44, 60, 2, 8);

  // Top sight rail
  ctx.fillStyle = darken(bodyColor, 10);
  ctx.fillRect(55, 32, 40, 3);
  // Sight dot
  ctx.fillStyle = tier >= 3 ? t.accent : '#88AACC';
  ctx.beginPath();
  ctx.arc(90, 33, 2, 0, Math.PI * 2);
  ctx.fill();

  if (tier >= 3) addGlow(ctx, 112, 44, 12, t.glow, 0.3);
  saveIcon(canvas, `j2_engineer_gun_t${tier}`);
}

// ════════════════════════════════════════════════════════
// 15. ENGINEER DRONES
// ════════════════════════════════════════════════════════
function drawEngineerDrone(tier) {
  const { canvas, ctx } = makeCanvas();
  const t = TIERS[tier];
  drawBackground(ctx, tier);

  const hullColor = tier <= 2 ? '#4A4A5A' : t.primary;

  // Drone body (rounded hexagonal)
  ctx.fillStyle = metalGrad(ctx, CX - 22, CY - 14, CX + 22, CY + 14, hullColor, t.accent);
  ctx.beginPath();
  ctx.moveTo(CX - 16, CY - 14);
  ctx.lineTo(CX + 16, CY - 14);
  ctx.quadraticCurveTo(CX + 24, CY - 14, CX + 24, CY - 6);
  ctx.lineTo(CX + 24, CY + 6);
  ctx.quadraticCurveTo(CX + 24, CY + 14, CX + 16, CY + 14);
  ctx.lineTo(CX - 16, CY + 14);
  ctx.quadraticCurveTo(CX - 24, CY + 14, CX - 24, CY + 6);
  ctx.lineTo(CX - 24, CY - 6);
  ctx.quadraticCurveTo(CX - 24, CY - 14, CX - 16, CY - 14);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = darken(hullColor, 25);
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Propeller arms (4 arms)
  const armAngle = Math.PI / 4;
  const armLen = 30;
  ctx.strokeStyle = metalGrad(ctx, CX - 35, CY - 35, CX + 35, CY + 35, '#555');
  ctx.lineWidth = 3;
  for (let i = 0; i < 4; i++) {
    const a = armAngle + (i * Math.PI) / 2;
    const ex = CX + Math.cos(a) * armLen;
    const ey = CY + Math.sin(a) * armLen;
    ctx.beginPath();
    ctx.moveTo(CX + Math.cos(a) * 18, CY + Math.sin(a) * 10);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    // Propeller disc (motion blur)
    const pg = ctx.createRadialGradient(ex, ey, 0, ex, ey, 12);
    pg.addColorStop(0, 'rgba(150,150,150,0.1)');
    pg.addColorStop(0.3, 'rgba(150,150,150,0.2)');
    pg.addColorStop(0.7, 'rgba(150,150,150,0.1)');
    pg.addColorStop(1, 'transparent');
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.arc(ex, ey, 12, 0, Math.PI * 2);
    ctx.fill();

    // Propeller hub
    ctx.fillStyle = '#444';
    ctx.beginPath();
    ctx.arc(ex, ey, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Sensor eye (center)
  const eyeGrad = ctx.createRadialGradient(CX, CY, 0, CX, CY, 8);
  eyeGrad.addColorStop(0, tier >= 3 ? lighten(t.accent, 50) : '#FFFFFF');
  eyeGrad.addColorStop(0.3, tier >= 3 ? t.accent : '#88AACC');
  eyeGrad.addColorStop(0.7, tier >= 3 ? darken(t.accent, 20) : '#446688');
  eyeGrad.addColorStop(1, '#111');
  ctx.fillStyle = eyeGrad;
  ctx.beginPath();
  ctx.arc(CX, CY, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Eye glow
  addGlow(ctx, CX, CY, 14, tier >= 3 ? t.accent : '#88AACC', 0.2);

  // Panel lines on hull
  ctx.strokeStyle = darken(hullColor, 15);
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(CX - 12, CY - 14);
  ctx.lineTo(CX - 12, CY + 14);
  ctx.moveTo(CX + 12, CY - 14);
  ctx.lineTo(CX + 12, CY + 14);
  ctx.stroke();

  // Status lights
  ctx.fillStyle = '#33FF33';
  ctx.beginPath();
  ctx.arc(CX - 8, CY - 8, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = tier >= 3 ? t.accent : '#FF3333';
  ctx.beginPath();
  ctx.arc(CX + 8, CY - 8, 2, 0, Math.PI * 2);
  ctx.fill();

  // Landing skids (below)
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(CX - 14, CY + 14);
  ctx.lineTo(CX - 18, CY + 22);
  ctx.lineTo(CX - 24, CY + 22);
  ctx.moveTo(CX + 14, CY + 14);
  ctx.lineTo(CX + 18, CY + 22);
  ctx.lineTo(CX + 24, CY + 22);
  ctx.stroke();

  if (tier >= 3) addGlow(ctx, CX, CY, 20, t.glow, 0.15);
  saveIcon(canvas, `j2_engineer_drone_t${tier}`);
}

// ════════════════════════════════════════════════════════
// GENERATE ALL ICONS
// ════════════════════════════════════════════════════════
const generators = [
  { name: 'Sentinel Swords', fn: drawSentinelSword },
  { name: 'Sentinel Shields', fn: drawSentinelShield },
  { name: 'Bruiser Fists', fn: drawBruiserFist },
  { name: 'Crusher Mauls', fn: drawCrusherMaul },
  { name: 'Sniper Rifles', fn: drawSniperRifle },
  { name: 'Gunslinger Pistols', fn: drawGunslingerPistol },
  { name: 'Hunter Bows', fn: drawHunterBow },
  { name: 'Bombardier Launchers', fn: drawBombardierLauncher },
  { name: 'Arsonist Flamethrowers', fn: drawArsonistFlame },
  { name: 'Chemist Flasks', fn: drawChemistFlask },
  { name: 'Chemist Satchels', fn: drawChemistSatchel },
  { name: 'Medic Books', fn: drawMedicBook },
  { name: 'Tactician Flags', fn: drawTacticianFlag },
  { name: 'Engineer Guns', fn: drawEngineerGun },
  { name: 'Engineer Drones', fn: drawEngineerDrone },
];

for (const { name, fn } of generators) {
  for (let tier = 1; tier <= 4; tier++) {
    fn(tier);
  }
  console.log(`  [OK] ${name} (4 tiers)`);
}

console.log(`\nDone! Generated ${totalCount} J2 weapon icons -> ${OUT}`);
