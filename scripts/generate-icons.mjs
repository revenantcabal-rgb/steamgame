/**
 * Wasteland Grind — Asset Icon Generator
 * Generates 64×64 pixel-art-style icons for all equipment, tools, consumables, and heroes.
 * Run: node scripts/generate-icons.mjs
 */
import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

const SIZE = 64;
const OUT = path.resolve('public/assets');

// ════════════════════════════════════════════════
// TIER / RARITY COLOR PALETTE
// ════════════════════════════════════════════════
const TIER_COLORS = {
  1: { primary: '#8B7355', accent: '#A08868', bg: '#2A2218', border: '#5C4D3C', label: 'T1' },
  2: { primary: '#4A8B4A', accent: '#5CA65C', bg: '#1A2A1A', border: '#3C6B3C', label: 'T2' },
  3: { primary: '#4A6A9B', accent: '#5C82B5', bg: '#1A2030', border: '#3C5878', label: 'T3' },
  4: { primary: '#8B4A9B', accent: '#A85CC0', bg: '#2A1A30', border: '#6B3C78', label: 'T4' },
  5: { primary: '#B8860B', accent: '#DAA520', bg: '#2A2210', border: '#8B6508', label: 'T5' },
  6: { primary: '#CD3333', accent: '#EE4444', bg: '#2A1414', border: '#8B2222', label: 'T6' },
  7: { primary: '#00CED1', accent: '#40E0D0', bg: '#0A2A2A', border: '#008B8B', label: 'T7' },
  8: { primary: '#FFD700', accent: '#FFF44F', bg: '#2A2500', border: '#B8860B', label: 'T8' },
};

// Post-apocalyptic palette
const PAL = {
  rust: '#8B4513', steel: '#708090', leather: '#654321', bone: '#D2B48C',
  toxic: '#7CFC00', blood: '#8B0000', copper: '#B87333', iron: '#434343',
  gold: '#FFD700', energy: '#00BFFF', shadow: '#1a1a2e', flesh: '#D2A679',
  cloth: '#6B5B4B', wood: '#5C4033', gunmetal: '#2C3539', brass: '#B5A642',
  glass: '#88CCEE', crystal: '#E0B0FF', plasma: '#FF1493', void: '#191970',
};

// ════════════════════════════════════════════════
// CANVAS HELPERS
// ════════════════════════════════════════════════
function createIcon() {
  return createCanvas(SIZE, SIZE);
}

function save(canvas, folder, filename) {
  const dir = path.join(OUT, folder);
  fs.mkdirSync(dir, { recursive: true });
  const buf = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(dir, `${filename}.png`), buf);
}

function drawBg(ctx, tier) {
  const c = TIER_COLORS[tier] || TIER_COLORS[1];
  // Dark background
  ctx.fillStyle = c.bg;
  ctx.fillRect(0, 0, SIZE, SIZE);
  // Border
  ctx.strokeStyle = c.border;
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, SIZE - 2, SIZE - 2);
}

function drawTierBadge(ctx, tier) {
  const c = TIER_COLORS[tier] || TIER_COLORS[1];
  ctx.fillStyle = c.primary;
  ctx.fillRect(SIZE - 16, 0, 16, 12);
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 8px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`T${tier}`, SIZE - 8, 9);
}

function pixel(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function line(ctx, x1, y1, x2, y2, color, width = 2) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function circle(ctx, cx, cy, r, color, fill = true) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = color; ctx.fill(); }
  else { ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); }
}

function diamond(ctx, cx, cy, size, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy - size);
  ctx.lineTo(cx + size, cy);
  ctx.lineTo(cx, cy + size);
  ctx.lineTo(cx - size, cy);
  ctx.closePath();
  ctx.fill();
}

function roundRect(ctx, x, y, w, h, r, color) {
  ctx.fillStyle = color;
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
  ctx.fill();
}

function triangle(ctx, x1, y1, x2, y2, x3, y3, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.closePath();
  ctx.fill();
}

// ════════════════════════════════════════════════
// WEAPON DRAWING FUNCTIONS
// ════════════════════════════════════════════════
function drawSword(ctx, tier) {
  const c = TIER_COLORS[tier] || TIER_COLORS[1];
  // Blade
  pixel(ctx, 30, 10, 4, 30, c.accent);
  pixel(ctx, 29, 10, 6, 3, c.primary); // tip highlight
  // Edge highlight
  pixel(ctx, 31, 12, 1, 26, '#FFFFFF44');
  // Crossguard
  pixel(ctx, 22, 40, 20, 4, PAL.brass);
  // Grip
  pixel(ctx, 29, 44, 6, 12, PAL.leather);
  // Pommel
  circle(ctx, 32, 58, 3, c.primary);
}

function drawAxe(ctx, tier) {
  const c = TIER_COLORS[tier] || TIER_COLORS[1];
  // Handle
  pixel(ctx, 30, 14, 4, 42, PAL.wood);
  // Axe head
  ctx.fillStyle = c.accent;
  ctx.beginPath();
  ctx.moveTo(34, 14);
  ctx.lineTo(48, 20);
  ctx.lineTo(48, 32);
  ctx.lineTo(34, 36);
  ctx.closePath();
  ctx.fill();
  // Edge
  line(ctx, 48, 20, 48, 32, c.primary, 2);
}

function drawClub(ctx, tier) {
  const c = TIER_COLORS[tier] || TIER_COLORS[1];
  // Handle
  pixel(ctx, 29, 30, 5, 28, PAL.wood);
  // Club head
  roundRect(ctx, 22, 10, 20, 22, 4, c.accent);
  // Spikes
  triangle(ctx, 22, 14, 16, 18, 22, 22, c.primary);
  triangle(ctx, 42, 14, 48, 18, 42, 22, c.primary);
  triangle(ctx, 28, 10, 32, 4, 36, 10, c.primary);
}

function drawDagger(ctx, tier) {
  const c = TIER_COLORS[tier] || TIER_COLORS[1];
  // Blade
  triangle(ctx, 32, 8, 26, 34, 38, 34, c.accent);
  // Edge highlight
  line(ctx, 32, 10, 32, 32, '#FFFFFF44', 1);
  // Guard
  pixel(ctx, 22, 34, 20, 3, PAL.brass);
  // Grip
  pixel(ctx, 28, 37, 8, 14, PAL.leather);
  // Pommel
  circle(ctx, 32, 54, 3, c.primary);
}

function drawBow(ctx, tier) {
  const c = TIER_COLORS[tier] || TIER_COLORS[1];
  // Bow limb
  ctx.strokeStyle = PAL.wood;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(38, 32, 22, Math.PI * 0.7, Math.PI * 1.3, false);
  ctx.stroke();
  // Bow tips
  circle(ctx, 22, 14, 2, c.primary);
  circle(ctx, 22, 50, 2, c.primary);
  // String
  line(ctx, 22, 14, 22, 50, PAL.bone, 1);
  // Arrow
  line(ctx, 22, 32, 50, 32, c.accent, 2);
  triangle(ctx, 50, 28, 58, 32, 50, 36, c.primary);
}

function drawPistol(ctx, tier) {
  const c = TIER_COLORS[tier] || TIER_COLORS[1];
  // Barrel
  roundRect(ctx, 12, 20, 32, 8, 2, PAL.gunmetal);
  pixel(ctx, 10, 22, 4, 4, c.accent); // muzzle
  // Body
  roundRect(ctx, 24, 20, 20, 14, 3, c.primary);
  // Trigger guard
  ctx.strokeStyle = PAL.gunmetal;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(34, 38, 6, 0, Math.PI, false);
  ctx.stroke();
  // Grip
  ctx.fillStyle = PAL.leather;
  ctx.beginPath();
  ctx.moveTo(36, 34);
  ctx.lineTo(42, 52);
  ctx.lineTo(48, 50);
  ctx.lineTo(44, 34);
  ctx.closePath();
  ctx.fill();
}

function drawRifle(ctx, tier) {
  const c = TIER_COLORS[tier] || TIER_COLORS[1];
  // Barrel
  roundRect(ctx, 6, 22, 38, 6, 1, PAL.gunmetal);
  pixel(ctx, 4, 23, 4, 4, c.accent); // muzzle flash
  // Body/receiver
  roundRect(ctx, 28, 18, 16, 14, 2, c.primary);
  // Scope
  roundRect(ctx, 20, 14, 18, 5, 2, PAL.iron);
  circle(ctx, 22, 16, 2, PAL.glass);
  // Stock
  ctx.fillStyle = PAL.wood;
  ctx.beginPath();
  ctx.moveTo(44, 20);
  ctx.lineTo(58, 24);
  ctx.lineTo(58, 30);
  ctx.lineTo(44, 32);
  ctx.closePath();
  ctx.fill();
  // Grip
  pixel(ctx, 36, 32, 6, 12, PAL.leather);
}

function drawBomb(ctx, tier) {
  const c = TIER_COLORS[tier] || TIER_COLORS[1];
  // Body
  circle(ctx, 32, 34, 14, c.primary);
  circle(ctx, 32, 34, 11, c.accent);
  // Highlights
  circle(ctx, 28, 30, 3, '#FFFFFF22');
  // Fuse
  line(ctx, 32, 20, 38, 10, PAL.bone, 2);
  // Spark
  circle(ctx, 38, 10, 3, PAL.toxic);
  circle(ctx, 38, 10, 2, '#FFFF00');
}

function drawLauncher(ctx, tier) {
  const c = TIER_COLORS[tier] || TIER_COLORS[1];
  // Tube
  roundRect(ctx, 8, 20, 40, 12, 4, PAL.gunmetal);
  // Muzzle
  circle(ctx, 10, 26, 5, PAL.iron);
  circle(ctx, 10, 26, 3, '#111');
  // Warhead visible
  circle(ctx, 14, 26, 3, c.accent);
  // Grip
  pixel(ctx, 34, 32, 6, 14, PAL.leather);
  // Shoulder rest
  roundRect(ctx, 44, 18, 14, 16, 3, c.primary);
  // Sight
  pixel(ctx, 22, 16, 3, 5, c.primary);
}

function drawMine(ctx, tier) {
  const c = TIER_COLORS[tier] || TIER_COLORS[1];
  // Base disc
  ctx.fillStyle = c.primary;
  ctx.beginPath();
  ctx.ellipse(32, 38, 18, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  // Top disc
  ctx.fillStyle = c.accent;
  ctx.beginPath();
  ctx.ellipse(32, 34, 16, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  // Trigger
  circle(ctx, 32, 32, 4, PAL.blood);
  circle(ctx, 32, 32, 2, '#FF4444');
  // Warning marks
  pixel(ctx, 20, 33, 3, 2, '#FFD700');
  pixel(ctx, 41, 33, 3, 2, '#FFD700');
}

function drawSlingshot(ctx, tier) {
  const c = TIER_COLORS[tier] || TIER_COLORS[1];
  // Fork prongs
  pixel(ctx, 20, 12, 4, 22, PAL.wood);
  pixel(ctx, 40, 12, 4, 22, PAL.wood);
  // Handle
  pixel(ctx, 28, 34, 8, 20, PAL.wood);
  roundRect(ctx, 26, 34, 12, 4, 1, c.primary);
  // Band
  line(ctx, 22, 12, 32, 28, c.accent, 2);
  line(ctx, 42, 12, 32, 28, c.accent, 2);
  // Projectile
  circle(ctx, 32, 28, 3, PAL.iron);
}

// ════════════════════════════════════════════════
// ARMOR DRAWING FUNCTIONS
// ════════════════════════════════════════════════
function drawChestArmor(ctx, tier) {
  const c = TIER_COLORS[tier] || TIER_COLORS[1];
  // Main body
  ctx.fillStyle = c.primary;
  ctx.beginPath();
  ctx.moveTo(16, 16);
  ctx.lineTo(48, 16);
  ctx.lineTo(50, 50);
  ctx.lineTo(40, 54);
  ctx.lineTo(32, 52);
  ctx.lineTo(24, 54);
  ctx.lineTo(14, 50);
  ctx.closePath();
  ctx.fill();
  // Collar
  pixel(ctx, 20, 14, 24, 4, c.accent);
  // Center line
  line(ctx, 32, 18, 32, 52, c.bg, 2);
  // Shoulder pads
  roundRect(ctx, 10, 14, 12, 8, 2, c.accent);
  roundRect(ctx, 42, 14, 12, 8, 2, c.accent);
  // Chest plate highlight
  pixel(ctx, 24, 24, 6, 8, '#FFFFFF15');
}

function drawLightArmor(ctx, tier) {
  const c = TIER_COLORS[tier] || TIER_COLORS[1];
  // Coat shape
  ctx.fillStyle = PAL.leather;
  ctx.beginPath();
  ctx.moveTo(18, 16);
  ctx.lineTo(46, 16);
  ctx.lineTo(48, 54);
  ctx.lineTo(34, 56);
  ctx.lineTo(32, 52);
  ctx.lineTo(30, 56);
  ctx.lineTo(16, 54);
  ctx.closePath();
  ctx.fill();
  // Collar
  pixel(ctx, 22, 14, 20, 4, c.accent);
  // Belt
  pixel(ctx, 18, 36, 28, 3, c.primary);
  // Buckle
  pixel(ctx, 30, 35, 4, 5, PAL.brass);
  // Lapel lines
  line(ctx, 32, 18, 26, 36, c.accent, 1);
  line(ctx, 32, 18, 38, 36, c.accent, 1);
}

function drawLegs(ctx, tier) {
  const c = TIER_COLORS[tier] || TIER_COLORS[1];
  // Left leg
  ctx.fillStyle = c.primary;
  ctx.beginPath();
  ctx.moveTo(16, 10);
  ctx.lineTo(30, 10);
  ctx.lineTo(28, 54);
  ctx.lineTo(14, 54);
  ctx.closePath();
  ctx.fill();
  // Right leg
  ctx.beginPath();
  ctx.moveTo(34, 10);
  ctx.lineTo(48, 10);
  ctx.lineTo(50, 54);
  ctx.lineTo(36, 54);
  ctx.closePath();
  ctx.fill();
  // Belt/waist
  pixel(ctx, 14, 8, 36, 4, c.accent);
  // Knee pads
  roundRect(ctx, 16, 32, 10, 6, 2, c.accent);
  roundRect(ctx, 38, 32, 10, 6, 2, c.accent);
  // Belt buckle
  pixel(ctx, 30, 8, 4, 4, PAL.brass);
}

function drawGloves(ctx, tier) {
  const c = TIER_COLORS[tier] || TIER_COLORS[1];
  // Left glove
  roundRect(ctx, 8, 20, 16, 24, 4, c.primary);
  // Fingers
  roundRect(ctx, 8, 12, 4, 12, 2, c.primary);
  roundRect(ctx, 13, 10, 4, 14, 2, c.primary);
  roundRect(ctx, 18, 12, 4, 12, 2, c.primary);
  // Thumb
  roundRect(ctx, 4, 26, 6, 10, 2, c.primary);
  // Knuckle guard
  roundRect(ctx, 8, 20, 16, 4, 1, c.accent);

  // Right glove
  roundRect(ctx, 36, 20, 16, 24, 4, c.primary);
  roundRect(ctx, 38, 12, 4, 12, 2, c.primary);
  roundRect(ctx, 43, 10, 4, 14, 2, c.primary);
  roundRect(ctx, 48, 12, 4, 12, 2, c.primary);
  roundRect(ctx, 50, 26, 6, 10, 2, c.primary);
  roundRect(ctx, 36, 20, 16, 4, 1, c.accent);
}

function drawBoots(ctx, tier) {
  const c = TIER_COLORS[tier] || TIER_COLORS[1];
  // Left boot
  roundRect(ctx, 6, 14, 16, 30, 3, c.primary);
  roundRect(ctx, 4, 44, 22, 8, 2, PAL.leather); // sole
  pixel(ctx, 6, 14, 16, 4, c.accent); // top trim
  pixel(ctx, 4, 48, 22, 4, PAL.iron); // tread

  // Right boot
  roundRect(ctx, 36, 14, 16, 30, 3, c.primary);
  roundRect(ctx, 34, 44, 22, 8, 2, PAL.leather);
  pixel(ctx, 36, 14, 16, 4, c.accent);
  pixel(ctx, 34, 48, 22, 4, PAL.iron);
}

function drawShield(ctx, tier) {
  const c = TIER_COLORS[tier] || TIER_COLORS[1];
  // Shield body
  ctx.fillStyle = c.primary;
  ctx.beginPath();
  ctx.moveTo(32, 8);
  ctx.lineTo(52, 14);
  ctx.lineTo(54, 36);
  ctx.lineTo(32, 56);
  ctx.lineTo(10, 36);
  ctx.lineTo(12, 14);
  ctx.closePath();
  ctx.fill();
  // Inner border
  ctx.strokeStyle = c.accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(32, 14);
  ctx.lineTo(46, 18);
  ctx.lineTo(48, 34);
  ctx.lineTo(32, 48);
  ctx.lineTo(16, 34);
  ctx.lineTo(18, 18);
  ctx.closePath();
  ctx.stroke();
  // Center emblem
  diamond(ctx, 32, 30, 6, c.accent);
  // Rivets
  circle(ctx, 20, 16, 2, PAL.brass);
  circle(ctx, 44, 16, 2, PAL.brass);
  circle(ctx, 14, 34, 2, PAL.brass);
  circle(ctx, 50, 34, 2, PAL.brass);
}

// ════════════════════════════════════════════════
// ACCESSORY DRAWING FUNCTIONS
// ════════════════════════════════════════════════
function drawRing(ctx, tier) {
  const c = TIER_COLORS[tier] || TIER_COLORS[1];
  // Ring band
  ctx.strokeStyle = c.primary;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(32, 34, 14, 0, Math.PI * 2);
  ctx.stroke();
  // Inner highlight
  ctx.strokeStyle = c.accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(32, 34, 14, -0.3, 0.8);
  ctx.stroke();
  // Gem
  diamond(ctx, 32, 18, 6, tier >= 5 ? PAL.crystal : PAL.glass);
  circle(ctx, 32, 18, 2, '#FFFFFF88');
}

function drawEarring(ctx, tier) {
  const c = TIER_COLORS[tier] || TIER_COLORS[1];
  // Hook
  ctx.strokeStyle = c.primary;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(32, 18, 6, 0, Math.PI);
  ctx.stroke();
  // Chain
  line(ctx, 32, 24, 32, 36, c.accent, 2);
  // Pendant gem
  diamond(ctx, 32, 42, 8, c.accent);
  diamond(ctx, 32, 42, 5, tier >= 5 ? PAL.crystal : c.primary);
  circle(ctx, 32, 42, 2, '#FFFFFF44');
}

function drawNecklace(ctx, tier) {
  const c = TIER_COLORS[tier] || TIER_COLORS[1];
  // Chain arc
  ctx.strokeStyle = c.primary;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(32, 8, 22, 0.3, Math.PI - 0.3);
  ctx.stroke();
  // Pendant
  ctx.fillStyle = c.accent;
  ctx.beginPath();
  ctx.moveTo(32, 30);
  ctx.lineTo(24, 40);
  ctx.lineTo(32, 52);
  ctx.lineTo(40, 40);
  ctx.closePath();
  ctx.fill();
  // Inner gem
  diamond(ctx, 32, 42, 4, tier >= 5 ? PAL.crystal : PAL.glass);
  circle(ctx, 32, 40, 2, '#FFFFFF66');
}

// ════════════════════════════════════════════════
// TOOL DRAWING FUNCTIONS
// ════════════════════════════════════════════════
function drawPrybar(ctx, tier) {
  const c = TIER_COLORS[tier] || TIER_COLORS[1];
  // Bar shaft
  ctx.fillStyle = c.primary;
  ctx.save();
  ctx.translate(32, 32);
  ctx.rotate(-0.5);
  ctx.fillRect(-3, -24, 6, 48);
  // Forked end
  ctx.fillRect(-8, -26, 6, 8);
  ctx.fillRect(2, -26, 6, 8);
  ctx.restore();
  // Grip wrapping
  pixel(ctx, 30, 40, 6, 3, PAL.leather);
  pixel(ctx, 30, 46, 6, 3, PAL.leather);
}

function drawSickle(ctx, tier) {
  const c = TIER_COLORS[tier] || TIER_COLORS[1];
  // Handle
  pixel(ctx, 28, 32, 6, 24, PAL.wood);
  // Blade curve
  ctx.strokeStyle = c.accent;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(32, 30, 18, -Math.PI * 0.8, -Math.PI * 0.1);
  ctx.stroke();
}

function drawScanner(ctx, tier) {
  const c = TIER_COLORS[tier] || TIER_COLORS[1];
  // Body
  roundRect(ctx, 16, 14, 32, 36, 4, PAL.gunmetal);
  // Screen
  roundRect(ctx, 20, 18, 24, 16, 2, '#003300');
  // Scan lines
  for (let i = 0; i < 4; i++) {
    pixel(ctx, 22, 20 + i * 4, 20, 1, c.accent);
  }
  // Blip
  circle(ctx, 36, 26, 2, PAL.toxic);
  // Antenna
  line(ctx, 44, 20, 52, 10, c.primary, 2);
  circle(ctx, 52, 10, 2, c.accent);
  // Buttons
  pixel(ctx, 22, 38, 4, 4, c.primary);
  pixel(ctx, 28, 38, 4, 4, PAL.blood);
  pixel(ctx, 34, 38, 4, 4, c.accent);
}

function drawFilter(ctx, tier) {
  const c = TIER_COLORS[tier] || TIER_COLORS[1];
  // Cylinder body
  roundRect(ctx, 18, 12, 28, 40, 4, c.primary);
  // Top cap
  roundRect(ctx, 16, 10, 32, 6, 2, c.accent);
  // Bottom cap
  roundRect(ctx, 16, 48, 32, 6, 2, c.accent);
  // Filter lines
  for (let i = 0; i < 5; i++) {
    pixel(ctx, 20, 20 + i * 6, 24, 2, c.bg);
  }
  // Water drop
  ctx.fillStyle = PAL.glass;
  ctx.beginPath();
  ctx.moveTo(32, 36);
  ctx.quadraticCurveTo(38, 44, 32, 48);
  ctx.quadraticCurveTo(26, 44, 32, 36);
  ctx.fill();
}

function drawPickaxe(ctx, tier) {
  const c = TIER_COLORS[tier] || TIER_COLORS[1];
  // Handle (diagonal)
  ctx.save();
  ctx.translate(32, 32);
  ctx.rotate(0.7);
  ctx.fillStyle = PAL.wood;
  ctx.fillRect(-3, -6, 6, 36);
  ctx.restore();
  // Pick head
  ctx.fillStyle = c.accent;
  ctx.beginPath();
  ctx.moveTo(14, 18);
  ctx.lineTo(32, 24);
  ctx.lineTo(50, 14);
  ctx.lineTo(48, 18);
  ctx.lineTo(32, 28);
  ctx.lineTo(16, 22);
  ctx.closePath();
  ctx.fill();
  // Point
  triangle(ctx, 50, 14, 56, 12, 52, 18, c.primary);
}

// ════════════════════════════════════════════════
// CONSUMABLE DRAWING FUNCTIONS
// ════════════════════════════════════════════════
function drawFoodBowl(ctx, color1, color2) {
  // Bowl
  ctx.fillStyle = PAL.bone;
  ctx.beginPath();
  ctx.ellipse(32, 42, 18, 8, 0, 0, Math.PI);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(32, 42, 18, 8, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  // Food
  ctx.fillStyle = color1;
  ctx.beginPath();
  ctx.ellipse(32, 40, 15, 6, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  // Steam
  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = '#FFFFFF44';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(24 + i * 8, 34);
    ctx.quadraticCurveTo(22 + i * 8, 24, 26 + i * 8, 16);
    ctx.stroke();
  }
}

function drawPotion(ctx, liquidColor, capColor) {
  // Bottle body
  roundRect(ctx, 22, 28, 20, 22, 4, '#FFFFFF22');
  ctx.strokeStyle = '#FFFFFF44';
  ctx.lineWidth = 1;
  ctx.strokeRect(22, 28, 20, 22);
  // Liquid
  roundRect(ctx, 24, 34, 16, 14, 3, liquidColor);
  // Neck
  pixel(ctx, 28, 18, 8, 12, '#FFFFFF22');
  ctx.strokeStyle = '#FFFFFF33';
  ctx.lineWidth = 1;
  ctx.strokeRect(28, 18, 8, 12);
  // Cap
  roundRect(ctx, 26, 14, 12, 6, 2, capColor);
  // Highlight
  pixel(ctx, 26, 30, 3, 8, '#FFFFFF22');
}

function drawSyringe(ctx, liquidColor) {
  // Barrel
  roundRect(ctx, 24, 14, 16, 32, 3, '#DDDDDD');
  // Liquid
  roundRect(ctx, 26, 22, 12, 20, 2, liquidColor);
  // Plunger
  pixel(ctx, 28, 10, 8, 6, PAL.gunmetal);
  pixel(ctx, 30, 6, 4, 6, PAL.gunmetal);
  // Needle
  line(ctx, 32, 46, 32, 58, PAL.steel, 2);
  // Markings
  for (let i = 0; i < 4; i++) {
    pixel(ctx, 24, 24 + i * 6, 3, 1, '#555');
  }
}

// ════════════════════════════════════════════════
// HERO DRAWING FUNCTIONS
// ════════════════════════════════════════════════
function drawHeroPortrait(ctx, bodyColor, helmetColor, weaponType, accentColor) {
  // Background glow
  const grad = ctx.createRadialGradient(32, 32, 5, 32, 32, 30);
  grad.addColorStop(0, accentColor + '33');
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Body/torso
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(16, 38);
  ctx.lineTo(48, 38);
  ctx.lineTo(52, 60);
  ctx.lineTo(12, 60);
  ctx.closePath();
  ctx.fill();
  // Shoulders
  roundRect(ctx, 10, 36, 14, 8, 3, bodyColor);
  roundRect(ctx, 40, 36, 14, 8, 3, bodyColor);

  // Head
  circle(ctx, 32, 24, 10, PAL.flesh);
  // Helmet/hat
  ctx.fillStyle = helmetColor;
  ctx.beginPath();
  ctx.arc(32, 22, 11, Math.PI, 0);
  ctx.closePath();
  ctx.fill();

  // Eyes
  pixel(ctx, 27, 23, 3, 2, '#FFF');
  pixel(ctx, 35, 23, 3, 2, '#FFF');
  pixel(ctx, 28, 23, 2, 2, '#222');
  pixel(ctx, 36, 23, 2, 2, '#222');

  // Weapon indicator (small)
  if (weaponType === 'melee') {
    line(ctx, 50, 28, 56, 42, PAL.steel, 2); // sword
    pixel(ctx, 48, 42, 6, 2, PAL.brass); // guard
  } else if (weaponType === 'ranged') {
    pixel(ctx, 50, 30, 10, 3, PAL.gunmetal); // barrel
    pixel(ctx, 52, 33, 4, 8, PAL.wood); // grip
  } else if (weaponType === 'demolitions') {
    circle(ctx, 54, 34, 5, PAL.iron); // bomb
    circle(ctx, 54, 34, 3, accentColor); // fuse glow
  } else if (weaponType === 'support') {
    // Shield
    ctx.fillStyle = PAL.steel;
    ctx.beginPath();
    ctx.moveTo(54, 28);
    ctx.lineTo(60, 32);
    ctx.lineTo(54, 44);
    ctx.lineTo(48, 32);
    ctx.closePath();
    ctx.fill();
  }

  // Accent trim on shoulders
  pixel(ctx, 10, 36, 14, 2, accentColor);
  pixel(ctx, 40, 36, 14, 2, accentColor);
}

// ════════════════════════════════════════════════
// RESOURCE DRAWING FUNCTIONS
// ════════════════════════════════════════════════
function drawMetalScrap(ctx) {
  // Jagged metal sheet
  ctx.fillStyle = PAL.steel;
  ctx.beginPath();
  ctx.moveTo(14, 20); ctx.lineTo(28, 16); ctx.lineTo(42, 22);
  ctx.lineTo(50, 18); ctx.lineTo(48, 36); ctx.lineTo(34, 42);
  ctx.lineTo(18, 38); ctx.lineTo(12, 30);
  ctx.closePath();
  ctx.fill();
  // Rust spots
  pixel(ctx, 20, 24, 6, 4, PAL.rust);
  pixel(ctx, 36, 28, 5, 3, PAL.rust);
  // Edge highlight
  line(ctx, 14, 20, 42, 22, '#FFFFFF33', 1);
}

function drawWoodPlank(ctx) {
  // Wooden plank
  roundRect(ctx, 12, 18, 40, 10, 2, PAL.wood);
  roundRect(ctx, 16, 32, 36, 10, 2, '#6B4423');
  // Wood grain
  line(ctx, 14, 22, 50, 22, '#4A3020', 1);
  line(ctx, 14, 25, 50, 25, '#4A3020', 1);
  line(ctx, 18, 36, 50, 36, '#4A3020', 1);
  // Charred edge
  pixel(ctx, 12, 18, 3, 10, '#222');
}

function drawPipe(ctx) {
  // Pipe sections
  roundRect(ctx, 10, 26, 44, 8, 3, PAL.iron);
  // Rust
  pixel(ctx, 18, 27, 8, 3, PAL.rust);
  pixel(ctx, 38, 28, 6, 3, PAL.rust);
  // Pipe joint
  roundRect(ctx, 28, 24, 6, 12, 1, PAL.steel);
  // Highlight
  line(ctx, 12, 27, 52, 27, '#FFFFFF22', 1);
}

function drawHerbs(ctx) {
  // Stems
  line(ctx, 24, 48, 24, 24, '#2d5a1e', 2);
  line(ctx, 32, 48, 32, 20, '#2d5a1e', 2);
  line(ctx, 40, 48, 40, 26, '#2d5a1e', 2);
  // Leaves
  ctx.fillStyle = '#4a8b2d';
  ctx.beginPath(); ctx.ellipse(24, 22, 6, 4, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(32, 18, 7, 5, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(40, 24, 5, 4, 0.4, 0, Math.PI * 2); ctx.fill();
  // Flower dots
  circle(ctx, 24, 18, 2, '#e8d44d');
  circle(ctx, 32, 14, 2, '#e8d44d');
}

function drawBerries(ctx) {
  // Bush shape
  ctx.fillStyle = '#3a5a2a';
  ctx.beginPath(); ctx.ellipse(32, 34, 18, 12, 0, 0, Math.PI * 2); ctx.fill();
  // Berries
  circle(ctx, 22, 28, 4, '#8b2252');
  circle(ctx, 30, 24, 4, '#9b3262');
  circle(ctx, 38, 30, 4, '#8b2252');
  circle(ctx, 26, 36, 3, '#7b1242');
  circle(ctx, 34, 38, 3, '#9b3262');
  // Highlights
  circle(ctx, 21, 26, 1, '#cc6699');
  circle(ctx, 29, 22, 1, '#cc6699');
  circle(ctx, 37, 28, 1, '#cc6699');
}

function drawRoots(ctx) {
  // Thick mutant root
  ctx.fillStyle = '#7a5a3a';
  ctx.beginPath();
  ctx.moveTo(20, 14); ctx.quadraticCurveTo(32, 20, 28, 40);
  ctx.lineTo(36, 42); ctx.quadraticCurveTo(38, 22, 44, 16);
  ctx.lineTo(40, 14); ctx.lineTo(20, 14);
  ctx.closePath();
  ctx.fill();
  // Tendrils
  line(ctx, 24, 36, 16, 50, '#6a4a2a', 3);
  line(ctx, 34, 38, 42, 52, '#6a4a2a', 3);
  // Glow (mutation)
  circle(ctx, 30, 26, 3, '#7CFC0044');
  circle(ctx, 36, 20, 2, '#7CFC0044');
}

function drawGears(ctx) {
  // Big gear
  circle(ctx, 26, 28, 12, PAL.iron);
  circle(ctx, 26, 28, 6, PAL.steel);
  circle(ctx, 26, 28, 3, '#222');
  // Gear teeth (simplified)
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const x = 26 + Math.cos(angle) * 12;
    const y = 28 + Math.sin(angle) * 12;
    pixel(ctx, x - 2, y - 2, 4, 4, PAL.iron);
  }
  // Small gear
  circle(ctx, 42, 38, 7, PAL.steel);
  circle(ctx, 42, 38, 3, '#222');
  // Spring
  line(ctx, 14, 46, 22, 46, PAL.copper, 2);
  line(ctx, 22, 46, 18, 50, PAL.copper, 2);
  line(ctx, 18, 50, 24, 50, PAL.copper, 2);
}

function drawCircuitBoard(ctx) {
  // Board
  roundRect(ctx, 12, 16, 40, 32, 2, '#1a4a1a');
  // Traces
  line(ctx, 16, 24, 32, 24, PAL.copper, 1);
  line(ctx, 32, 24, 32, 38, PAL.copper, 1);
  line(ctx, 20, 30, 44, 30, PAL.copper, 1);
  line(ctx, 24, 20, 24, 40, PAL.copper, 1);
  // Components
  pixel(ctx, 30, 22, 4, 4, '#222');
  pixel(ctx, 22, 28, 4, 4, '#333');
  pixel(ctx, 36, 32, 6, 3, '#444');
  // LED
  circle(ctx, 40, 22, 2, '#FF0000');
  circle(ctx, 18, 36, 2, PAL.energy);
}

function drawChemicalFlask(ctx) {
  // Flask body
  ctx.fillStyle = '#334';
  ctx.beginPath();
  ctx.moveTo(24, 18); ctx.lineTo(40, 18);
  ctx.lineTo(46, 42); ctx.lineTo(18, 42);
  ctx.closePath();
  ctx.fill();
  // Fluid
  ctx.fillStyle = PAL.toxic;
  ctx.beginPath();
  ctx.moveTo(20, 30); ctx.lineTo(44, 30);
  ctx.lineTo(46, 42); ctx.lineTo(18, 42);
  ctx.closePath();
  ctx.fill();
  // Neck
  roundRect(ctx, 28, 12, 8, 8, 1, '#445');
  // Bubbles
  circle(ctx, 28, 36, 2, '#9dff5088');
  circle(ctx, 36, 34, 1.5, '#9dff5088');
}

function drawWaterDrop(ctx, tint) {
  // Water drop shape
  ctx.fillStyle = tint;
  ctx.beginPath();
  ctx.moveTo(32, 12);
  ctx.quadraticCurveTo(48, 32, 40, 44);
  ctx.quadraticCurveTo(32, 54, 24, 44);
  ctx.quadraticCurveTo(16, 32, 32, 12);
  ctx.closePath();
  ctx.fill();
  // Highlight
  ctx.fillStyle = '#FFFFFF44';
  ctx.beginPath();
  ctx.ellipse(28, 28, 4, 8, -0.3, 0, Math.PI * 2);
  ctx.fill();
}

function drawOreChunk(ctx, color, speckleColor) {
  // Rocky shape
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(16, 38); ctx.lineTo(22, 18); ctx.lineTo(36, 14);
  ctx.lineTo(48, 22); ctx.lineTo(50, 38); ctx.lineTo(40, 48);
  ctx.lineTo(24, 46);
  ctx.closePath();
  ctx.fill();
  // Facets
  line(ctx, 36, 14, 34, 36, color + '88', 1);
  line(ctx, 22, 18, 40, 36, color + '88', 1);
  // Ore veins/speckles
  circle(ctx, 28, 28, 3, speckleColor);
  circle(ctx, 38, 22, 2, speckleColor);
  circle(ctx, 34, 38, 2.5, speckleColor);
  circle(ctx, 24, 36, 2, speckleColor);
  // Shadow edge
  line(ctx, 16, 38, 24, 46, '#00000044', 2);
}

function drawRawStone(ctx) {
  drawOreChunk(ctx, '#6B6B6B', '#8a8a8a');
  // Extra cracks
  line(ctx, 20, 24, 32, 30, '#55555588', 1);
  line(ctx, 38, 28, 44, 40, '#55555588', 1);
}

// ════════════════════════════════════════════════
// RESOURCE DEFINITIONS
// ════════════════════════════════════════════════
const RESOURCE_ITEMS = {
  // Scavenging
  scrap_metal:    { category: 'scavenging', color: PAL.steel,  draw: drawMetalScrap },
  salvaged_wood:  { category: 'scavenging', color: PAL.wood,   draw: drawWoodPlank },
  rusted_pipes:   { category: 'scavenging', color: PAL.rust,   draw: drawPipe },
  // Foraging
  wild_herbs:         { category: 'foraging', color: '#4a8b2d', draw: drawHerbs },
  wasteland_berries:  { category: 'foraging', color: '#8b2252', draw: drawBerries },
  mutant_roots:       { category: 'foraging', color: '#7a5a3a', draw: drawRoots },
  // Salvage hunting
  mechanical_parts:       { category: 'salvage', color: PAL.iron,   draw: drawGears },
  electronic_components:  { category: 'salvage', color: PAL.copper, draw: drawCircuitBoard },
  chemical_fluids:        { category: 'salvage', color: PAL.toxic,  draw: drawChemicalFlask },
  // Water
  rainwater:    { category: 'water', color: '#5599cc', draw: (ctx) => drawWaterDrop(ctx, '#5599cc') },
  well_water:   { category: 'water', color: '#447799', draw: (ctx) => drawWaterDrop(ctx, '#447799') },
  river_water:  { category: 'water', color: '#6699aa', draw: (ctx) => drawWaterDrop(ctx, '#6699aa') },
  // Prospecting
  iron_ore:   { category: 'prospecting', color: PAL.iron,   draw: (ctx) => drawOreChunk(ctx, '#5a5a5a', '#888888') },
  copper_ore: { category: 'prospecting', color: PAL.copper, draw: (ctx) => drawOreChunk(ctx, '#6a4a2a', PAL.copper) },
  raw_stone:  { category: 'prospecting', color: '#6B6B6B',  draw: drawRawStone },

  // ── T2 RESOURCES ──
  // Scavenging T2
  tempered_steel:  { category: 'scavenging', color: '#A0A0B0', draw: drawMetalScrap },
  refined_lumber:  { category: 'scavenging', color: '#7A5A3A', draw: drawWoodPlank },
  chrome_pipes:    { category: 'scavenging', color: '#C0C0D0', draw: drawPipe },
  // Foraging T2
  irradiated_moss: { category: 'foraging', color: '#5ADB3A', draw: drawHerbs },
  glow_berries:    { category: 'foraging', color: '#CCFF00', draw: drawBerries },
  deep_roots:      { category: 'foraging', color: '#5A3A1A', draw: drawRoots },
  // Salvage Hunting T2
  precision_gears:    { category: 'salvage', color: PAL.steel,  draw: drawGears },
  quantum_chips:      { category: 'salvage', color: PAL.energy, draw: drawCircuitBoard },
  volatile_compounds: { category: 'salvage', color: '#FF4500',  draw: drawChemicalFlask },
  // Water Reclamation T2
  purified_water:  { category: 'water', color: '#77BBEE', draw: (ctx) => drawWaterDrop(ctx, '#77BBEE') },
  mineral_water:   { category: 'water', color: '#55AACC', draw: (ctx) => drawWaterDrop(ctx, '#55AACC') },
  distilled_water: { category: 'water', color: '#99DDFF', draw: (ctx) => drawWaterDrop(ctx, '#99DDFF') },
  // Prospecting T2
  steel_ore:    { category: 'prospecting', color: '#7A7A8A', draw: (ctx) => drawOreChunk(ctx, '#6A6A7A', '#9A9AAA') },
  titanium_ore: { category: 'prospecting', color: '#B0B0C0', draw: (ctx) => drawOreChunk(ctx, '#8A8A9A', '#C0C0D0') },
  crystal_stone: { category: 'prospecting', color: PAL.crystal, draw: (ctx) => drawOreChunk(ctx, '#C0A0E0', '#E0C0FF') },

  // ── T3 RESOURCES ──
  // Scavenging T3
  reinforced_alloy: { category: 'scavenging', color: '#6080A0', draw: drawMetalScrap },
  hardened_timber:  { category: 'scavenging', color: '#4A3020', draw: drawWoodPlank },
  plasma_conduits:  { category: 'scavenging', color: PAL.plasma, draw: drawPipe },
  // Foraging T3
  reactor_bloom: { category: 'foraging', color: '#FF6090', draw: drawHerbs },
  void_berries:  { category: 'foraging', color: '#301050', draw: drawBerries },
  titan_roots:   { category: 'foraging', color: '#3A2A0A', draw: drawRoots },
  // Salvage Hunting T3
  fusion_cores:      { category: 'salvage', color: PAL.energy, draw: drawGears },
  neural_circuits:   { category: 'salvage', color: '#00DDAA', draw: drawCircuitBoard },
  dark_matter_fluid: { category: 'salvage', color: PAL.void,   draw: drawChemicalFlask },
  // Water Reclamation T3
  reactor_coolant: { category: 'water', color: '#00FFCC', draw: (ctx) => drawWaterDrop(ctx, '#00FFCC') },
  bio_solution:    { category: 'water', color: '#88DD44', draw: (ctx) => drawWaterDrop(ctx, '#88DD44') },
  void_extract:    { category: 'water', color: '#2A1A4A', draw: (ctx) => drawWaterDrop(ctx, '#2A1A4A') },
  // Prospecting T3
  mythril_ore:  { category: 'prospecting', color: '#A0D0F0', draw: (ctx) => drawOreChunk(ctx, '#80B0D0', '#C0E0FF') },
  obsidian_ore: { category: 'prospecting', color: '#1A1A2A', draw: (ctx) => drawOreChunk(ctx, '#0A0A1A', '#3A3A5A') },
  void_crystal: { category: 'prospecting', color: '#4A2080', draw: (ctx) => drawOreChunk(ctx, '#3A1070', '#6A40A0') },

  // ── SPECIAL ──
  icqor_chess_piece: { category: 'special', color: PAL.gold, draw: (ctx) => drawOreChunk(ctx, '#DAA520', '#FFD700') },
};

// ════════════════════════════════════════════════
// WEAPON DEFINITIONS — maps to draw functions
// ════════════════════════════════════════════════
const WEAPONS = {
  // T1
  sharpened_pipe: { tier: 1, draw: drawSword, type: 'melee' },
  rusty_machete: { tier: 1, draw: drawDagger, type: 'melee' },
  scrap_bow: { tier: 1, draw: drawBow, type: 'ranged' },
  slingshot: { tier: 1, draw: drawSlingshot, type: 'ranged' },
  pipe_bomb: { tier: 1, draw: drawBomb, type: 'demolitions' },
  molotov: { tier: 1, draw: drawBomb, type: 'demolitions' },
  // T2
  spiked_club: { tier: 2, draw: drawClub, type: 'melee' },
  raiders_cleaver: { tier: 2, draw: drawDagger, type: 'melee' },
  pipe_pistol: { tier: 2, draw: drawPistol, type: 'ranged' },
  hunting_crossbow: { tier: 2, draw: drawBow, type: 'ranged' },
  frag_grenade: { tier: 2, draw: drawBomb, type: 'demolitions' },
  incendiary_mine: { tier: 2, draw: drawMine, type: 'demolitions' },
  // T3
  war_axe: { tier: 3, draw: drawAxe, type: 'melee' },
  serrated_blade: { tier: 3, draw: drawDagger, type: 'melee' },
  bolt_action_rifle: { tier: 3, draw: drawRifle, type: 'ranged' },
  twin_pistols: { tier: 3, draw: drawPistol, type: 'ranged' },
  concussion_launcher: { tier: 3, draw: drawLauncher, type: 'demolitions' },
  cluster_mine: { tier: 3, draw: drawMine, type: 'demolitions' },
  // T4
  reinforced_mace: { tier: 4, draw: drawClub, type: 'melee' },
  assassins_dirk: { tier: 4, draw: drawDagger, type: 'melee' },
  scoped_carbine: { tier: 4, draw: drawRifle, type: 'ranged' },
  repeater_crossbow: { tier: 4, draw: drawBow, type: 'ranged' },
  rocket_launcher: { tier: 4, draw: drawLauncher, type: 'demolitions' },
  toxic_gas_canister: { tier: 4, draw: drawBomb, type: 'demolitions' },
  // T5
  warlords_hammer: { tier: 5, draw: drawAxe, type: 'melee' },
  shadow_fang: { tier: 5, draw: drawDagger, type: 'melee' },
  marksmans_rifle: { tier: 5, draw: drawRifle, type: 'ranged' },
  dual_revolvers: { tier: 5, draw: drawPistol, type: 'ranged' },
  siege_mortar: { tier: 5, draw: drawLauncher, type: 'demolitions' },
  napalm_launcher: { tier: 5, draw: drawLauncher, type: 'demolitions' },
  // T6
  titan_cleaver: { tier: 6, draw: drawAxe, type: 'melee' },
  phantom_blade: { tier: 6, draw: drawSword, type: 'melee' },
  anti_material_rifle: { tier: 6, draw: drawRifle, type: 'ranged' },
  storm_repeater: { tier: 6, draw: drawPistol, type: 'ranged' },
  plasma_bombard: { tier: 6, draw: drawLauncher, type: 'demolitions' },
  radiation_emitter: { tier: 6, draw: drawLauncher, type: 'demolitions' },
  // T7
  apocalypse_edge: { tier: 7, draw: drawSword, type: 'melee' },
  railgun: { tier: 7, draw: drawRifle, type: 'ranged' },
  orbital_beacon: { tier: 7, draw: drawBomb, type: 'demolitions' },
  // T8
  doomsday_maul: { tier: 8, draw: drawAxe, type: 'melee' },
  oblivion_cannon: { tier: 8, draw: drawRifle, type: 'ranged' },
  apocalypse_device: { tier: 8, draw: drawBomb, type: 'demolitions' },
};

// ════════════════════════════════════════════════
// ARMOR DEFINITIONS
// ════════════════════════════════════════════════
const ARMOR_ITEMS = {
  // T1
  patched_vest: { tier: 1, slot: 'armor' }, cloth_wrappings: { tier: 1, slot: 'armor_light' },
  scrap_greaves: { tier: 1, slot: 'legs' }, worn_gloves: { tier: 1, slot: 'gloves' },
  wasteland_boots: { tier: 1, slot: 'boots' }, scrap_buckler: { tier: 1, slot: 'shield' },
  // T2
  scrap_plate_chest: { tier: 2, slot: 'armor' }, leather_duster: { tier: 2, slot: 'armor_light' },
  padded_lab_coat: { tier: 2, slot: 'armor_light' },
  iron_legguards: { tier: 2, slot: 'legs' }, scout_pants: { tier: 2, slot: 'legs' },
  iron_gauntlets: { tier: 2, slot: 'gloves' }, marksman_gloves: { tier: 2, slot: 'gloves' },
  iron_boots: { tier: 2, slot: 'boots' }, scout_boots: { tier: 2, slot: 'boots' },
  iron_shield: { tier: 2, slot: 'shield' },
  // T3
  iron_breastplate: { tier: 3, slot: 'armor' }, rangers_hide: { tier: 3, slot: 'armor_light' },
  insulated_vest: { tier: 3, slot: 'armor_light' },
  iron_legplates: { tier: 3, slot: 'legs' },
  combat_gauntlets: { tier: 3, slot: 'gloves' },
  strider_boots: { tier: 3, slot: 'boots' },
  tower_shield: { tier: 3, slot: 'shield' },
  // T4
  plated_war_armor: { tier: 4, slot: 'armor' }, shadow_leathers: { tier: 4, slot: 'armor_light' },
  hazmat_suit: { tier: 4, slot: 'armor_light' },
  plated_legguards: { tier: 4, slot: 'legs' },
  precision_gauntlets: { tier: 4, slot: 'gloves' },
  plated_boots: { tier: 4, slot: 'boots' },
  bulwark_shield: { tier: 4, slot: 'shield' },
  // T5
  fortress_plate: { tier: 5, slot: 'armor' }, nightstalker_suit: { tier: 5, slot: 'armor_light' },
  reactor_vest: { tier: 5, slot: 'armor_light' },
  fortress_legplates: { tier: 5, slot: 'legs' },
  deadeye_gloves: { tier: 5, slot: 'gloves' },
  fortress_boots: { tier: 5, slot: 'boots' },
  siege_shield: { tier: 5, slot: 'shield' },
  // T6
  siege_bulwark: { tier: 6, slot: 'armor' }, wraith_armor: { tier: 6, slot: 'armor_light' },
  fusion_core_suit: { tier: 6, slot: 'armor_light' },
  titan_legplates: { tier: 6, slot: 'legs' },
  assassin_gloves: { tier: 6, slot: 'gloves' },
  titan_boots: { tier: 6, slot: 'boots' },
  dreadnought_shield: { tier: 6, slot: 'shield' },
  // T7
  dreadnought_plate: { tier: 7, slot: 'armor' }, phantom_shroud: { tier: 7, slot: 'armor_light' },
  quantum_harness: { tier: 7, slot: 'armor_light' },
  dreadnought_legplates: { tier: 7, slot: 'legs' },
  apex_gloves: { tier: 7, slot: 'gloves' },
  apex_boots: { tier: 7, slot: 'boots' },
  omega_shield: { tier: 7, slot: 'shield' },
  // T8
  apocalypse_aegis: { tier: 8, slot: 'armor' }, void_walker_suit: { tier: 8, slot: 'armor_light' },
  singularity_frame: { tier: 8, slot: 'armor_light' }, eternity_shell: { tier: 8, slot: 'armor' },
  doomsday_legplates: { tier: 8, slot: 'legs' },
  godhand_gloves: { tier: 8, slot: 'gloves' },
  godstep_boots: { tier: 8, slot: 'boots' },
  world_shield: { tier: 8, slot: 'shield' },
  // SET: Survivor's Outfit (T1)
  survivor_vest: { tier: 1, slot: 'armor', set: true }, survivor_pants: { tier: 1, slot: 'legs', set: true },
  survivor_gloves: { tier: 1, slot: 'gloves', set: true }, survivor_boots: { tier: 1, slot: 'boots', set: true },
  // SET: Raider's Armor (T3)
  raider_plate: { tier: 3, slot: 'armor', set: true }, raider_legguards: { tier: 3, slot: 'legs', set: true },
  raider_gauntlets: { tier: 3, slot: 'gloves', set: true }, raider_boots: { tier: 3, slot: 'boots', set: true },
  raider_shield: { tier: 3, slot: 'shield', set: true },
  // SET: Forager's Garb (T3)
  forager_vest: { tier: 3, slot: 'armor_light', set: true }, forager_pants: { tier: 3, slot: 'legs', set: true },
  forager_gloves: { tier: 3, slot: 'gloves', set: true }, forager_boots: { tier: 3, slot: 'boots', set: true },
  // SET: Warlord's Regalia (T6)
  warlord_breastplate: { tier: 6, slot: 'armor', set: true }, warlord_legplates: { tier: 6, slot: 'legs', set: true },
  warlord_gauntlets: { tier: 6, slot: 'gloves', set: true }, warlord_boots: { tier: 6, slot: 'boots', set: true },
  warlord_shield: { tier: 6, slot: 'shield', set: true },
  // SET: Artisan's Ensemble (T6)
  artisan_vest: { tier: 6, slot: 'armor_light', set: true }, artisan_pants: { tier: 6, slot: 'legs', set: true },
  artisan_gloves: { tier: 6, slot: 'gloves', set: true }, artisan_boots: { tier: 6, slot: 'boots', set: true },
};

// ════════════════════════════════════════════════
// ACCESSORY DEFINITIONS (from gear.ts)
// ════════════════════════════════════════════════
const ACCESSORIES = {
  // Regular per-tier
  rusty_ring: { tier: 1, slot: 'ring' }, bone_earring: { tier: 1, slot: 'earring' }, scrap_pendant: { tier: 1, slot: 'necklace' },
  copper_band: { tier: 2, slot: 'ring' }, wire_earring: { tier: 2, slot: 'earring' }, gear_pendant: { tier: 2, slot: 'necklace' },
  alloy_ring: { tier: 3, slot: 'ring' }, circuit_earring: { tier: 3, slot: 'earring' }, motor_pendant: { tier: 3, slot: 'necklace' },
  titanium_ring: { tier: 4, slot: 'ring' }, hydraulic_earring: { tier: 4, slot: 'earring' }, fusion_pendant: { tier: 4, slot: 'necklace' },
  plasma_ring: { tier: 5, slot: 'ring' }, resonance_earring: { tier: 5, slot: 'earring' }, core_pendant: { tier: 5, slot: 'necklace' },
  quantum_ring: { tier: 6, slot: 'ring' }, void_earring: { tier: 6, slot: 'earring' }, stellar_pendant: { tier: 6, slot: 'necklace' },
  singularity_ring: { tier: 7, slot: 'ring' }, anomaly_earring: { tier: 7, slot: 'earring' }, eternity_pendant: { tier: 7, slot: 'necklace' },
  infinity_ring: { tier: 8, slot: 'ring' }, void_earring_t8: { tier: 8, slot: 'earring' }, eternity_amulet: { tier: 8, slot: 'necklace' },
  // Stat Focus Rings
  ring_of_str: { tier: 1, slot: 'ring' }, ring_of_dex: { tier: 1, slot: 'ring' }, ring_of_int: { tier: 1, slot: 'ring' },
  ring_of_con: { tier: 1, slot: 'ring' }, ring_of_per: { tier: 1, slot: 'ring' }, ring_of_luk: { tier: 1, slot: 'ring' },
  ring_of_providence: { tier: 2, slot: 'ring' }, ring_of_precision: { tier: 2, slot: 'ring' }, ring_of_destruction: { tier: 2, slot: 'ring' },
  // Set accessories
  survivor_ring: { tier: 1, slot: 'ring', set: true }, survivor_earring: { tier: 1, slot: 'earring', set: true },
  raider_ring: { tier: 3, slot: 'ring', set: true },
  forager_pendant: { tier: 3, slot: 'necklace', set: true }, forager_earring: { tier: 3, slot: 'earring', set: true },
  warlord_ring: { tier: 6, slot: 'ring', set: true }, warlord_pendant: { tier: 6, slot: 'necklace', set: true },
  artisan_earring: { tier: 6, slot: 'earring', set: true }, artisan_pendant: { tier: 6, slot: 'necklace', set: true },
};

// ════════════════════════════════════════════════
// TOOL & CONSUMABLE DEFINITIONS
// ════════════════════════════════════════════════
const TOOL_ITEMS = {
  salvage_prybar: { tier: 1, draw: drawPrybar }, foraging_sickle: { tier: 1, draw: drawSickle },
  salvage_scanner: { tier: 1, draw: drawScanner }, water_filter: { tier: 1, draw: drawFilter },
  mining_pickaxe: { tier: 1, draw: drawPickaxe },
  reinforced_prybar: { tier: 2, draw: drawPrybar }, carbon_sickle: { tier: 2, draw: drawSickle },
  advanced_scanner: { tier: 2, draw: drawScanner }, purification_system: { tier: 2, draw: drawFilter },
  sonic_drill: { tier: 2, draw: drawPickaxe },
};

const CONSUMABLE_ITEMS = {
  wasteland_stew: { type: 'food', color: '#8B4513' }, irradiated_jerky: { type: 'food', color: '#CD853F' },
  herbal_tea: { type: 'food', color: '#228B22' }, fire_roasted_root: { type: 'food', color: '#B22222' },
  fortified_rations: { type: 'food', color: '#DAA520' }, scavengers_meal: { type: 'food', color: '#D2691E' },
  commanders_feast: { type: 'food', color: '#FFD700' },
  stimpak: { type: 'syringe', color: '#FF4444' }, antidote: { type: 'potion', color: '#00FF7F' },
  combat_serum: { type: 'syringe', color: '#FF6600' }, adrenaline_shot: { type: 'syringe', color: '#FFFF00' },
  rad_shield_pill: { type: 'potion', color: '#00CED1' }, berserker_compound: { type: 'potion', color: '#FF1493' },
  cleansing_agent: { type: 'potion', color: '#E0E0FF' },
};

// ════════════════════════════════════════════════
// HERO CLASS DEFINITIONS
// ════════════════════════════════════════════════
const HERO_CLASSES = {
  berserker:      { body: '#8B4513', helmet: '#CD3333', weapon: 'melee',      accent: '#FF4444' },
  vanguard:       { body: '#4A4A5A', helmet: '#708090', weapon: 'melee',      accent: '#AAB8C2' },
  blade_dancer:   { body: '#2E2E3E', helmet: '#483D8B', weapon: 'melee',      accent: '#9370DB' },
  gladiator:      { body: '#654321', helmet: '#B8860B', weapon: 'melee',      accent: '#DAA520' },
  sharpshooter:   { body: '#2F4F4F', helmet: '#556B2F', weapon: 'ranged',     accent: '#7FFF00' },
  gunslinger:     { body: '#654321', helmet: '#8B6914', weapon: 'ranged',     accent: '#FFD700' },
  scout:          { body: '#3B5323', helmet: '#4A7A4A', weapon: 'ranged',     accent: '#00FF7F' },
  sniper:         { body: '#2C3539', helmet: '#4A6A8B', weapon: 'ranged',     accent: '#87CEEB' },
  pyromaniac:     { body: '#4A2020', helmet: '#8B0000', weapon: 'demolitions', accent: '#FF4500' },
  mad_bomber:     { body: '#3A3A2A', helmet: '#6B6B00', weapon: 'demolitions', accent: '#FFFF00' },
  sapper:         { body: '#2E4A2E', helmet: '#3C6B3C', weapon: 'demolitions', accent: '#7CFC00' },
  demolitionist:  { body: '#3A3A3A', helmet: '#555555', weapon: 'demolitions', accent: '#FF6347' },
  guardian:       { body: '#4A5568', helmet: '#708090', weapon: 'support',     accent: '#87CEEB' },
  field_medic:    { body: '#F0F0F0', helmet: '#CCCCCC', weapon: 'support',     accent: '#FF0000' },
  chemist:        { body: '#2A4A2A', helmet: '#3C8B3C', weapon: 'support',     accent: '#7CFC00' },
  war_engineer:   { body: '#5A4A3A', helmet: '#8B7355', weapon: 'support',     accent: '#B8860B' },
};

// ════════════════════════════════════════════════
// GENERATE ALL ICONS
// ════════════════════════════════════════════════
let count = 0;

console.log('Generating weapon icons...');
for (const [id, wpn] of Object.entries(WEAPONS)) {
  const canvas = createIcon();
  const ctx = canvas.getContext('2d');
  drawBg(ctx, wpn.tier);
  wpn.draw(ctx, wpn.tier);
  drawTierBadge(ctx, wpn.tier);
  save(canvas, 'weapons', id);
  count++;
}
console.log(`  ${count} weapons`);

const armorCount = count;
console.log('Generating armor icons...');
for (const [id, item] of Object.entries(ARMOR_ITEMS)) {
  const canvas = createIcon();
  const ctx = canvas.getContext('2d');
  drawBg(ctx, item.tier);

  const slotDrawMap = {
    armor: drawChestArmor,
    armor_light: drawLightArmor,
    legs: drawLegs,
    gloves: drawGloves,
    boots: drawBoots,
    shield: drawShield,
  };
  const drawFn = slotDrawMap[item.slot] || drawChestArmor;
  drawFn(ctx, item.tier);

  // Set piece indicator
  if (item.set) {
    circle(ctx, 8, 8, 4, '#22c55e');
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 6px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('S', 8, 10);
  }

  drawTierBadge(ctx, item.tier);
  save(canvas, 'armor', id);
  count++;
}
console.log(`  ${count - armorCount} armor pieces`);

const accCount = count;
console.log('Generating accessory icons...');
for (const [id, item] of Object.entries(ACCESSORIES)) {
  const canvas = createIcon();
  const ctx = canvas.getContext('2d');
  drawBg(ctx, item.tier);

  if (item.slot === 'ring') drawRing(ctx, item.tier);
  else if (item.slot === 'earring') drawEarring(ctx, item.tier);
  else drawNecklace(ctx, item.tier);

  if (item.set) {
    circle(ctx, 8, 8, 4, '#22c55e');
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 6px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('S', 8, 10);
  }

  drawTierBadge(ctx, item.tier);
  save(canvas, 'accessories', id);
  count++;
}
console.log(`  ${count - accCount} accessories`);

const toolCount = count;
console.log('Generating tool icons...');
for (const [id, item] of Object.entries(TOOL_ITEMS)) {
  const canvas = createIcon();
  const ctx = canvas.getContext('2d');
  drawBg(ctx, item.tier);
  item.draw(ctx, item.tier);
  drawTierBadge(ctx, item.tier);
  save(canvas, 'tools', id);
  count++;
}
console.log(`  ${count - toolCount} tools`);

const conCount = count;
console.log('Generating consumable icons...');
for (const [id, item] of Object.entries(CONSUMABLE_ITEMS)) {
  const canvas = createIcon();
  const ctx = canvas.getContext('2d');
  drawBg(ctx, 1); // consumables don't have tiers, use T1 bg

  if (item.type === 'food') drawFoodBowl(ctx, item.color, PAL.bone);
  else if (item.type === 'syringe') drawSyringe(ctx, item.color);
  else drawPotion(ctx, item.color, PAL.brass);

  save(canvas, 'consumables', id);
  count++;
}
console.log(`  ${count - conCount} consumables`);

const heroCount = count;
console.log('Generating hero class portraits...');
for (const [id, hero] of Object.entries(HERO_CLASSES)) {
  const canvas = createIcon();
  const ctx = canvas.getContext('2d');
  // Dark bg for heroes
  ctx.fillStyle = '#0F0F1A';
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.strokeStyle = hero.accent + '88';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, SIZE - 2, SIZE - 2);

  drawHeroPortrait(ctx, hero.body, hero.helmet, hero.weapon, hero.accent);

  save(canvas, 'heroes', id);
  count++;
}
console.log(`  ${count - heroCount} hero classes`);

const resCount = count;
console.log('Generating resource icons...');
for (const [id, item] of Object.entries(RESOURCE_ITEMS)) {
  const canvas = createIcon();
  const ctx = canvas.getContext('2d');
  // Dark background with earthy border
  ctx.fillStyle = '#1a1a18';
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.strokeStyle = '#4a4a38';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, SIZE - 2, SIZE - 2);

  item.draw(ctx);
  save(canvas, 'resources', id);
  count++;
}
console.log(`  ${count - resCount} resources`);

console.log(`\nDone! Generated ${count} icons total in public/assets/`);
