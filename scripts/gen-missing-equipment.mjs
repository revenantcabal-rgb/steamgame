/**
 * Generate 39 missing equipment icons at 128x128.
 * Smooth rendering — gradients, arcs, bezier curves. No pixel art.
 */
import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

const SIZE = 128;
const outDir = path.join(process.cwd(), 'public', 'assets', 'equipment-128');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function save(canvas, name) {
  fs.writeFileSync(path.join(outDir, `${name}.png`), canvas.toBuffer('image/png'));
}

// ── Shared helpers ──────────────────────────────────

function makeBg(ctx, tierColor) {
  // Dark bg with colored radial vignette
  ctx.fillStyle = '#0D0D0D';
  ctx.fillRect(0, 0, SIZE, SIZE);
  const g = ctx.createRadialGradient(64, 64, 10, 64, 64, 80);
  g.addColorStop(0, tierColor + '30');
  g.addColorStop(1, 'transparent');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SIZE, SIZE);
}

function drawRing(ctx, bandColor, gemColor, glowColor) {
  // Ring band — ellipse
  ctx.lineWidth = 5;
  ctx.strokeStyle = bandColor;
  ctx.beginPath();
  ctx.ellipse(64, 68, 24, 30, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Inner sheen
  ctx.lineWidth = 2;
  ctx.strokeStyle = lighten(bandColor, 40);
  ctx.beginPath();
  ctx.ellipse(64, 68, 20, 26, 0, Math.PI * 0.8, Math.PI * 1.5);
  ctx.stroke();
  // Gem mount
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(64, 38, 10, 0, Math.PI * 2);
  ctx.fill();
  // Gem
  const gg = ctx.createRadialGradient(62, 36, 1, 64, 38, 8);
  gg.addColorStop(0, lighten(gemColor, 60));
  gg.addColorStop(0.5, gemColor);
  gg.addColorStop(1, darken(gemColor, 40));
  ctx.fillStyle = gg;
  ctx.beginPath();
  ctx.arc(64, 38, 7, 0, Math.PI * 2);
  ctx.fill();
  // Gem highlight
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath();
  ctx.arc(62, 36, 2, 0, Math.PI * 2);
  ctx.fill();
  // Glow
  if (glowColor) {
    const gl = ctx.createRadialGradient(64, 38, 2, 64, 38, 18);
    gl.addColorStop(0, glowColor + '66');
    gl.addColorStop(1, 'transparent');
    ctx.fillStyle = gl;
    ctx.beginPath();
    ctx.arc(64, 38, 18, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawEarring(ctx, metalColor, gemColor) {
  // Hook
  ctx.lineWidth = 3;
  ctx.strokeStyle = metalColor;
  ctx.beginPath();
  ctx.arc(64, 34, 8, Math.PI * 0.5, Math.PI * 2);
  ctx.stroke();
  // Dangle chain
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(72, 34);
  ctx.lineTo(72, 56);
  ctx.stroke();
  // Gem drop
  const gg = ctx.createRadialGradient(71, 64, 1, 72, 66, 10);
  gg.addColorStop(0, lighten(gemColor, 50));
  gg.addColorStop(1, darken(gemColor, 30));
  ctx.fillStyle = gg;
  ctx.beginPath();
  ctx.moveTo(72, 56);
  ctx.lineTo(80, 68);
  ctx.lineTo(72, 80);
  ctx.lineTo(64, 68);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.arc(70, 64, 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawPendant(ctx, chainColor, gemColor, gemShape) {
  // Chain arc
  ctx.lineWidth = 2;
  ctx.strokeStyle = chainColor;
  ctx.beginPath();
  ctx.moveTo(24, 20);
  ctx.quadraticCurveTo(64, 8, 104, 20);
  ctx.stroke();
  // Chain down
  ctx.beginPath();
  ctx.moveTo(64, 12);
  ctx.lineTo(64, 44);
  ctx.stroke();
  // Pendant
  const pg = ctx.createRadialGradient(63, 62, 2, 64, 64, 16);
  pg.addColorStop(0, lighten(gemColor, 60));
  pg.addColorStop(0.5, gemColor);
  pg.addColorStop(1, darken(gemColor, 50));
  ctx.fillStyle = pg;
  if (gemShape === 'circle') {
    ctx.beginPath();
    ctx.arc(64, 64, 14, 0, Math.PI * 2);
    ctx.fill();
  } else if (gemShape === 'diamond') {
    ctx.beginPath();
    ctx.moveTo(64, 44);
    ctx.lineTo(78, 64);
    ctx.lineTo(64, 84);
    ctx.lineTo(50, 64);
    ctx.closePath();
    ctx.fill();
  } else {
    // Teardrop
    ctx.beginPath();
    ctx.moveTo(64, 44);
    ctx.bezierCurveTo(80, 56, 80, 78, 64, 84);
    ctx.bezierCurveTo(48, 78, 48, 56, 64, 44);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.arc(60, 58, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawChestArmor(ctx, mainColor, accentColor, details) {
  // Torso shape
  ctx.fillStyle = mainColor;
  ctx.beginPath();
  ctx.moveTo(30, 24);
  ctx.lineTo(24, 30);
  ctx.lineTo(20, 50);
  ctx.lineTo(22, 90);
  ctx.lineTo(42, 100);
  ctx.lineTo(64, 104);
  ctx.lineTo(86, 100);
  ctx.lineTo(106, 90);
  ctx.lineTo(108, 50);
  ctx.lineTo(104, 30);
  ctx.lineTo(98, 24);
  ctx.lineTo(80, 20);
  ctx.lineTo(64, 22);
  ctx.lineTo(48, 20);
  ctx.closePath();
  ctx.fill();
  // Neck opening
  ctx.fillStyle = '#0D0D0D';
  ctx.beginPath();
  ctx.ellipse(64, 22, 16, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  // Center line
  ctx.strokeStyle = darken(mainColor, 30);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(64, 28);
  ctx.lineTo(64, 100);
  ctx.stroke();
  // Shoulder highlights
  const sh = ctx.createLinearGradient(30, 24, 50, 40);
  sh.addColorStop(0, lighten(mainColor, 30));
  sh.addColorStop(1, 'transparent');
  ctx.fillStyle = sh;
  ctx.fillRect(30, 24, 20, 16);
  // Accent
  if (accentColor) {
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(34, 50);
    ctx.lineTo(94, 50);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(36, 70);
    ctx.lineTo(92, 70);
    ctx.stroke();
  }
  if (details === 'rivets') {
    ctx.fillStyle = '#AAA';
    [[40,40],[88,40],[40,60],[88,60],[40,80],[88,80]].forEach(([x,y]) => {
      ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
    });
  }
}

function drawLegs(ctx, mainColor, accentColor) {
  // Left leg
  ctx.fillStyle = mainColor;
  ctx.beginPath();
  ctx.moveTo(30, 16);
  ctx.lineTo(26, 50);
  ctx.lineTo(28, 100);
  ctx.lineTo(56, 104);
  ctx.lineTo(60, 50);
  ctx.lineTo(58, 16);
  ctx.closePath();
  ctx.fill();
  // Right leg
  ctx.beginPath();
  ctx.moveTo(70, 16);
  ctx.lineTo(68, 50);
  ctx.lineTo(72, 104);
  ctx.lineTo(100, 100);
  ctx.lineTo(102, 50);
  ctx.lineTo(98, 16);
  ctx.closePath();
  ctx.fill();
  // Knee guards
  ctx.fillStyle = accentColor || lighten(mainColor, 20);
  ctx.beginPath();
  ctx.ellipse(44, 56, 12, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(84, 56, 12, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  // Belt
  ctx.fillStyle = darken(mainColor, 30);
  ctx.fillRect(28, 16, 72, 6);
  // Sheen
  const lg = ctx.createLinearGradient(30, 16, 50, 60);
  lg.addColorStop(0, lighten(mainColor, 20) + '44');
  lg.addColorStop(1, 'transparent');
  ctx.fillStyle = lg;
  ctx.fillRect(30, 16, 28, 80);
}

function drawGloves(ctx, mainColor, accentColor) {
  // Gauntlet body
  ctx.fillStyle = mainColor;
  ctx.beginPath();
  ctx.moveTo(30, 20);
  ctx.lineTo(26, 50);
  ctx.lineTo(24, 70);
  ctx.lineTo(30, 80);
  ctx.lineTo(44, 100);
  ctx.lineTo(52, 102);
  ctx.lineTo(60, 98);
  ctx.lineTo(68, 90);
  ctx.lineTo(100, 78);
  ctx.lineTo(104, 70);
  ctx.lineTo(98, 64);
  ctx.lineTo(76, 70);
  ctx.lineTo(70, 60);
  ctx.lineTo(66, 44);
  ctx.lineTo(64, 20);
  ctx.closePath();
  ctx.fill();
  // Finger plates
  ctx.fillStyle = accentColor || lighten(mainColor, 15);
  [[44,96],[52,100],[60,96],[68,88]].forEach(([x,y]) => {
    ctx.beginPath(); ctx.ellipse(x, y, 5, 3, -0.3, 0, Math.PI * 2); ctx.fill();
  });
  // Knuckle guard
  ctx.fillStyle = accentColor || lighten(mainColor, 25);
  ctx.beginPath();
  ctx.ellipse(56, 82, 18, 6, -0.2, 0, Math.PI * 2);
  ctx.fill();
  // Wrist band
  ctx.fillStyle = darken(mainColor, 30);
  ctx.fillRect(28, 20, 38, 6);
  // Sheen
  const sg = ctx.createLinearGradient(30, 20, 50, 60);
  sg.addColorStop(0, lighten(mainColor, 30) + '44');
  sg.addColorStop(1, 'transparent');
  ctx.fillStyle = sg;
  ctx.fillRect(30, 20, 20, 50);
}

function drawBoots(ctx, mainColor, accentColor) {
  // Boot shape
  ctx.fillStyle = mainColor;
  ctx.beginPath();
  ctx.moveTo(30, 14);
  ctx.lineTo(28, 60);
  ctx.lineTo(24, 80);
  ctx.lineTo(18, 96);
  ctx.lineTo(20, 102);
  ctx.lineTo(80, 106);
  ctx.lineTo(84, 98);
  ctx.lineTo(74, 80);
  ctx.lineTo(72, 60);
  ctx.lineTo(70, 14);
  ctx.closePath();
  ctx.fill();
  // Sole
  ctx.fillStyle = darken(mainColor, 40);
  ctx.beginPath();
  ctx.moveTo(18, 98);
  ctx.lineTo(20, 106);
  ctx.lineTo(82, 110);
  ctx.lineTo(84, 100);
  ctx.closePath();
  ctx.fill();
  // Toe cap
  ctx.fillStyle = accentColor || lighten(mainColor, 15);
  ctx.beginPath();
  ctx.ellipse(50, 100, 28, 8, 0, Math.PI, 0);
  ctx.fill();
  // Ankle guard
  ctx.fillStyle = accentColor || lighten(mainColor, 10);
  ctx.fillRect(28, 44, 44, 8);
  // Top rim
  ctx.fillStyle = darken(mainColor, 20);
  ctx.fillRect(28, 14, 44, 6);
  // Sheen
  const sg = ctx.createLinearGradient(30, 14, 50, 50);
  sg.addColorStop(0, lighten(mainColor, 25) + '44');
  sg.addColorStop(1, 'transparent');
  ctx.fillStyle = sg;
  ctx.fillRect(30, 14, 18, 60);
}

function drawShield(ctx, mainColor, emblemColor, shape) {
  ctx.fillStyle = mainColor;
  if (shape === 'kite') {
    ctx.beginPath();
    ctx.moveTo(64, 10);
    ctx.lineTo(100, 30);
    ctx.lineTo(96, 70);
    ctx.lineTo(64, 110);
    ctx.lineTo(32, 70);
    ctx.lineTo(28, 30);
    ctx.closePath();
    ctx.fill();
  } else {
    // Round
    ctx.beginPath();
    ctx.arc(64, 60, 40, 0, Math.PI * 2);
    ctx.fill();
  }
  // Rim
  ctx.strokeStyle = lighten(mainColor, 30);
  ctx.lineWidth = 3;
  if (shape === 'kite') {
    ctx.beginPath();
    ctx.moveTo(64, 14);
    ctx.lineTo(96, 32);
    ctx.lineTo(92, 68);
    ctx.lineTo(64, 106);
    ctx.lineTo(36, 68);
    ctx.lineTo(32, 32);
    ctx.closePath();
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(64, 60, 37, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Center emblem
  ctx.fillStyle = emblemColor;
  ctx.beginPath();
  ctx.arc(64, 56, 12, 0, Math.PI * 2);
  ctx.fill();
  // Cross on emblem
  ctx.strokeStyle = lighten(emblemColor, 40);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(64, 46); ctx.lineTo(64, 66);
  ctx.moveTo(54, 56); ctx.lineTo(74, 56);
  ctx.stroke();
  // Metal rivets
  ctx.fillStyle = '#CCC';
  const cx = 64, cy = shape === 'kite' ? 56 : 60;
  [[cx,cy-30],[cx-28,cy],[cx+28,cy],[cx,cy+30]].forEach(([x,y]) => {
    ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill();
  });
}

function lighten(hex, amt) {
  if (hex.startsWith('rgb')) return hex;
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amt);
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amt);
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amt);
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

function darken(hex, amt) {
  if (hex.startsWith('rgb')) return hex;
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amt);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amt);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amt);
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

function addSetBadge(ctx, letter, color) {
  // Set piece badge bottom-right
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(108, 108, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(letter, 108, 109);
}

// ══════════════════════════════════════════════════════
//  TIER-PROGRESSION RINGS (8)
// ══════════════════════════════════════════════════════

const TIER_RINGS = [
  ['rusty_ring',       '#8B5A2B', '#AA6633', null,       '#5A3A1A'],
  ['copper_band',      '#B87333', '#CC8844', null,       '#6B4A22'],
  ['alloy_ring',       '#8899AA', '#6688AA', null,       '#3A4A5A'],
  ['titanium_ring',    '#99AABB', '#88BBDD', '#88BBDD',  '#4A5A6A'],
  ['plasma_ring',      '#6688CC', '#4488FF', '#4488FF',  '#223366'],
  ['quantum_ring',     '#8866CC', '#AA44FF', '#AA44FF',  '#332255'],
  ['singularity_ring', '#AA44CC', '#FF44FF', '#FF44FF',  '#441155'],
  ['infinity_ring',    '#FFD700', '#FFAA00', '#FFD700',  '#4A3A00'],
];

console.log('Generating tier-progression rings...');
for (const [name, band, gem, glow, bg] of TIER_RINGS) {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  makeBg(ctx, bg);
  drawRing(ctx, band, gem, glow);
  save(canvas, name);
}
console.log(`  ${TIER_RINGS.length} rings done.`);

// ══════════════════════════════════════════════════════
//  SET PIECES
// ══════════════════════════════════════════════════════

// Set color palettes
const SETS = {
  survivor: { main: '#5A7A5A', accent: '#88AA88', badge: '#27ae60', letter: 'S', bg: '#1A2A1A' },
  forager:  { main: '#6B8B3A', accent: '#8BAB5A', badge: '#6B8B3A', letter: 'F', bg: '#1A2A14' },
  raider:   { main: '#8B4A3A', accent: '#AA6A5A', badge: '#CC4433', letter: 'R', bg: '#2A1414' },
  warlord:  { main: '#6A5A7A', accent: '#8A7A9A', badge: '#8844AA', letter: 'W', bg: '#1A142A' },
  artisan:  { main: '#8B7B5A', accent: '#ABAB7A', badge: '#CC9933', letter: 'A', bg: '#2A2414' },
};

const SET_ITEMS = [
  // Survivor set (6)
  ['survivor_vest',    'survivor', 'chest'],
  ['survivor_pants',   'survivor', 'legs'],
  ['survivor_gloves',  'survivor', 'gloves'],
  ['survivor_boots',   'survivor', 'boots'],
  ['survivor_ring',    'survivor', 'ring'],
  ['survivor_earring', 'survivor', 'earring'],
  // Forager set (7)
  ['forager_vest',     'forager', 'chest'],
  ['forager_pants',    'forager', 'legs'],
  ['forager_gloves',   'forager', 'gloves'],
  ['forager_boots',    'forager', 'boots'],
  ['forager_earring',  'forager', 'earring'],
  ['forager_pendant',  'forager', 'pendant'],
  // Raider set (6)
  ['raider_plate',      'raider', 'chest'],
  ['raider_legguards',  'raider', 'legs'],
  ['raider_gauntlets',  'raider', 'gloves'],
  ['raider_boots',      'raider', 'boots'],
  ['raider_shield',     'raider', 'shield'],
  ['raider_ring',       'raider', 'ring'],
  // Warlord set (7)
  ['warlord_breastplate', 'warlord', 'chest'],
  ['warlord_legplates',   'warlord', 'legs'],
  ['warlord_gauntlets',   'warlord', 'gloves'],
  ['warlord_boots',       'warlord', 'boots'],
  ['warlord_shield',      'warlord', 'shield'],
  ['warlord_ring',        'warlord', 'ring'],
  ['warlord_pendant',     'warlord', 'pendant'],
  // Artisan set (6)
  ['artisan_vest',     'artisan', 'chest'],
  ['artisan_pants',    'artisan', 'legs'],
  ['artisan_gloves',   'artisan', 'gloves'],
  ['artisan_boots',    'artisan', 'boots'],
  ['artisan_earring',  'artisan', 'earring'],
  ['artisan_pendant',  'artisan', 'pendant'],
];

console.log('Generating set pieces...');
for (const [name, setId, slot] of SET_ITEMS) {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  const set = SETS[setId];
  makeBg(ctx, set.bg);

  switch (slot) {
    case 'chest':
      drawChestArmor(ctx, set.main, set.accent, 'rivets');
      break;
    case 'legs':
      drawLegs(ctx, set.main, set.accent);
      break;
    case 'gloves':
      drawGloves(ctx, set.main, set.accent);
      break;
    case 'boots':
      drawBoots(ctx, set.main, set.accent);
      break;
    case 'shield':
      drawShield(ctx, set.main, set.accent, setId === 'warlord' ? 'kite' : 'round');
      break;
    case 'ring':
      drawRing(ctx, set.main, set.accent, null);
      break;
    case 'earring':
      drawEarring(ctx, set.main, set.accent);
      break;
    case 'pendant':
      drawPendant(ctx, set.main, set.accent, setId === 'warlord' ? 'diamond' : 'teardrop');
      break;
  }

  addSetBadge(ctx, set.letter, set.badge);
  save(canvas, name);
}
console.log(`  ${SET_ITEMS.length} set pieces done.`);

const total = TIER_RINGS.length + SET_ITEMS.length;
console.log(`\nDone! Generated ${total} missing equipment icons.`);
