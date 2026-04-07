/**
 * Wasteland Grind -- 128x128 Hero Class Portraits & Avatar Generator
 * Generates smooth, anti-aliased hero class icons and player avatars.
 * Run: node scripts/gen-heroes-128.mjs
 */
import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

const SIZE = 128;
const HERO_OUT = path.resolve('public/assets/heroes-128');
const AVATAR_OUT = path.resolve('public/assets/avatars-128');

fs.mkdirSync(HERO_OUT, { recursive: true });
fs.mkdirSync(AVATAR_OUT, { recursive: true });

// ════════════════════════════════════════════════
// CATEGORY COLORS
// ════════════════════════════════════════════════
const CAT_COLORS = {
  assault:    { border: '#CC2222', bgDark: '#1A0808', bgMid: '#3A1010', accent: '#FF4444' },
  skirmisher: { border: '#22AA44', bgDark: '#081A0C', bgMid: '#103A18', accent: '#44FF66' },
  control:    { border: '#2266CC', bgDark: '#08101A', bgMid: '#10203A', accent: '#4488FF' },
  support:    { border: '#CCAA22', bgDark: '#1A1808', bgMid: '#3A3010', accent: '#FFDD44' },
  artisan:    { border: '#8B6533', bgDark: '#1A1408', bgMid: '#3A2A10', accent: '#CC9944' },
};

// ════════════════════════════════════════════════
// HERO DEFINITIONS
// ════════════════════════════════════════════════
const HEROES = [
  // Assault
  { name: 'berserker',    cat: 'assault',    draw: drawBerserker },
  { name: 'deadeye',      cat: 'assault',    draw: drawDeadeye },
  { name: 'demolisher',   cat: 'assault',    draw: drawDemolisher },
  // Skirmisher
  { name: 'blade_dancer', cat: 'skirmisher', draw: drawBladeDancer },
  { name: 'sharpshooter', cat: 'skirmisher', draw: drawSharpshooter },
  { name: 'sapper',       cat: 'skirmisher', draw: drawSapper },
  // Control
  { name: 'warden',       cat: 'control',    draw: drawWarden },
  { name: 'trapper',      cat: 'control',    draw: drawTrapper },
  { name: 'bombardier',   cat: 'control',    draw: drawBombardier },
  // Support
  { name: 'guardian',      cat: 'support',    draw: drawGuardian },
  { name: 'field_medic',   cat: 'support',    draw: drawFieldMedic },
  { name: 'chemist',       cat: 'support',    draw: drawChemist },
  // Artisan
  { name: 'scavenger',    cat: 'artisan',    draw: drawScavenger },
  { name: 'ranger',       cat: 'artisan',    draw: drawRanger },
  { name: 'prospector',   cat: 'artisan',    draw: drawProspector },
  { name: 'artificer',    cat: 'artisan',    draw: drawArtificer },
];

// ════════════════════════════════════════════════
// SHARED DRAWING HELPERS
// ════════════════════════════════════════════════
function makeCanvas() {
  const c = createCanvas(SIZE, SIZE);
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  return { c, ctx };
}

/** Radial background gradient with two color stops. */
function drawBackground(ctx, c1, c2) {
  const g = ctx.createRadialGradient(64, 58, 8, 64, 64, 72);
  g.addColorStop(0, c2);
  g.addColorStop(1, c1);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SIZE, SIZE);
}

/** Circular clip mask and outer border ring. */
function drawPortraitFrame(ctx, borderColor) {
  // clip to circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(64, 64, 61, 0, Math.PI * 2);
  ctx.clip();
}

function drawBorderRing(ctx, borderColor) {
  ctx.restore();
  ctx.lineWidth = 3;
  ctx.strokeStyle = borderColor;
  ctx.beginPath();
  ctx.arc(64, 64, 62, 0, Math.PI * 2);
  ctx.stroke();
  // inner glow
  ctx.lineWidth = 1;
  ctx.strokeStyle = borderColor + '66';
  ctx.beginPath();
  ctx.arc(64, 64, 59, 0, Math.PI * 2);
  ctx.stroke();
}

/** Smooth oval head with gradient skin. */
function drawHead(ctx, x, y, w, h, skinBase, skinHighlight) {
  const g = ctx.createRadialGradient(x, y - h * 0.15, 2, x, y, Math.max(w, h));
  g.addColorStop(0, skinHighlight);
  g.addColorStop(1, skinBase);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** Draw two eyes with optional glow color. */
function drawEyes(ctx, cx, cy, spacing, eyeColor, glowColor) {
  const lx = cx - spacing;
  const rx = cx + spacing;
  for (const ex of [lx, rx]) {
    if (glowColor) {
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 6;
    }
    // eye white
    ctx.fillStyle = '#E8E8E0';
    ctx.beginPath();
    ctx.ellipse(ex, cy, 5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // iris
    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.arc(ex, cy, 2.5, 0, Math.PI * 2);
    ctx.fill();
    // pupil
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(ex, cy, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

/** Neck and shoulders silhouette. */
function drawShoulders(ctx, color, armorHighlight) {
  const g = ctx.createLinearGradient(20, 80, 108, 110);
  g.addColorStop(0, armorHighlight || color);
  g.addColorStop(1, color);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(44, 78);
  ctx.bezierCurveTo(44, 85, 40, 88, 20, 100);
  ctx.lineTo(10, 128);
  ctx.lineTo(118, 128);
  ctx.lineTo(108, 100);
  ctx.bezierCurveTo(88, 88, 84, 85, 84, 78);
  ctx.closePath();
  ctx.fill();
}

/** Neck connector. */
function drawNeck(ctx, skinBase) {
  ctx.fillStyle = skinBase;
  ctx.beginPath();
  ctx.moveTo(54, 72);
  ctx.lineTo(74, 72);
  ctx.lineTo(78, 85);
  ctx.lineTo(50, 85);
  ctx.closePath();
  ctx.fill();
}

/** Simple metallic plate shape. */
function drawMetallicPlate(ctx, x, y, w, h, metalBase, metalHi) {
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, metalHi);
  g.addColorStop(0.5, metalBase);
  g.addColorStop(1, metalHi);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x, y + 4);
  ctx.bezierCurveTo(x, y, x + w, y, x + w, y + 4);
  ctx.lineTo(x + w, y + h - 4);
  ctx.bezierCurveTo(x + w, y + h, x, y + h, x, y + h - 4);
  ctx.closePath();
  ctx.fill();
}

/** Draw a simple nose. */
function drawNose(ctx, cx, cy, skinShadow) {
  ctx.strokeStyle = skinShadow;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 4);
  ctx.bezierCurveTo(cx + 3, cy, cx + 2, cy + 4, cx, cy + 4);
  ctx.stroke();
}

/** Draw a mouth line. */
function drawMouth(ctx, cx, cy, color, width) {
  ctx.strokeStyle = color || '#5A3030';
  ctx.lineWidth = width || 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy);
  ctx.bezierCurveTo(cx - 3, cy + 3, cx + 3, cy + 3, cx + 6, cy);
  ctx.stroke();
}

/** Glowing eye effect for a single eye. */
function drawGlowingEye(ctx, ex, ey, color) {
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(ex, ey, 5, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.arc(ex, ey, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

// ════════════════════════════════════════════════
// HERO DRAWING FUNCTIONS
// ════════════════════════════════════════════════

// --- ASSAULT ---

function drawBerserker(ctx, cat) {
  const c = CAT_COLORS[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx, c.border);

  drawNeck(ctx, '#9B7044');
  drawShoulders(ctx, '#4A2020', '#6A3030');

  // spiked pauldrons
  ctx.fillStyle = '#5A3333';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(64 + side * 30, 92);
    ctx.lineTo(64 + side * 48, 80);
    ctx.lineTo(64 + side * 52, 72);
    ctx.lineTo(64 + side * 44, 86);
    ctx.closePath();
    ctx.fill();
  }

  drawHead(ctx, 64, 48, 22, 26, '#8B6B3A', '#C49B60');

  // mohawk
  const mg = ctx.createLinearGradient(54, 15, 74, 15);
  mg.addColorStop(0, '#CC2222');
  mg.addColorStop(1, '#FF4444');
  ctx.fillStyle = mg;
  ctx.beginPath();
  ctx.moveTo(54, 40);
  ctx.bezierCurveTo(56, 18, 60, 10, 64, 8);
  ctx.bezierCurveTo(68, 10, 72, 18, 74, 40);
  ctx.bezierCurveTo(70, 34, 58, 34, 54, 40);
  ctx.fill();

  // war paint stripes
  ctx.strokeStyle = '#CC2222';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(48, 44);
  ctx.lineTo(44, 56);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(80, 44);
  ctx.lineTo(84, 56);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(52, 58);
  ctx.lineTo(48, 66);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(76, 58);
  ctx.lineTo(80, 66);
  ctx.stroke();

  drawEyes(ctx, 64, 48, 9, '#CC3333', '#FF4444');
  drawNose(ctx, 64, 54, '#6A4A2A');
  drawMouth(ctx, 64, 62, '#5A2020', 2);

  drawBorderRing(ctx, c.border);
}

function drawDeadeye(ctx, cat) {
  const c = CAT_COLORS[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx, c.border);

  drawNeck(ctx, '#A07848');
  drawShoulders(ctx, '#3A3A3A', '#555555');

  drawHead(ctx, 64, 48, 21, 25, '#A07848', '#C8A070');

  // hood/bandana
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.ellipse(64, 38, 24, 16, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  // left eye normal
  ctx.fillStyle = '#E8E8E0';
  ctx.beginPath();
  ctx.ellipse(55, 48, 5, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#558833';
  ctx.beginPath();
  ctx.arc(55, 48, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(55, 48, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // right eye = scope lens
  const sg = ctx.createRadialGradient(73, 48, 1, 73, 48, 8);
  sg.addColorStop(0, '#FF2222');
  sg.addColorStop(0.4, '#CC1111');
  sg.addColorStop(1, '#330000');
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.arc(73, 48, 7, 0, Math.PI * 2);
  ctx.fill();
  // scope ring
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(73, 48, 8, 0, Math.PI * 2);
  ctx.stroke();
  // crosshair
  ctx.strokeStyle = '#FF4444';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(73, 41);
  ctx.lineTo(73, 55);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(66, 48);
  ctx.lineTo(80, 48);
  ctx.stroke();
  // scope glow
  ctx.shadowColor = '#FF2222';
  ctx.shadowBlur = 8;
  ctx.fillStyle = '#FF4444';
  ctx.beginPath();
  ctx.arc(73, 48, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  drawNose(ctx, 62, 54, '#7A5838');
  drawMouth(ctx, 63, 62, '#5A3A2A');

  drawBorderRing(ctx, c.border);
}

function drawDemolisher(ctx, cat) {
  const c = CAT_COLORS[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx, c.border);

  drawNeck(ctx, '#8B6B3A');
  drawShoulders(ctx, '#444', '#666');

  drawHead(ctx, 64, 50, 22, 24, '#8B6B3A', '#B89060');

  // blast visor
  const vg = ctx.createLinearGradient(38, 42, 90, 42);
  vg.addColorStop(0, '#333');
  vg.addColorStop(0.3, '#555');
  vg.addColorStop(0.7, '#555');
  vg.addColorStop(1, '#333');
  ctx.fillStyle = vg;
  ctx.beginPath();
  ctx.moveTo(40, 40);
  ctx.bezierCurveTo(42, 36, 86, 36, 88, 40);
  ctx.lineTo(88, 52);
  ctx.bezierCurveTo(86, 56, 42, 56, 40, 52);
  ctx.closePath();
  ctx.fill();

  // visor slit with glow
  const slg = ctx.createLinearGradient(44, 46, 84, 46);
  slg.addColorStop(0, '#FF6600');
  slg.addColorStop(0.5, '#FFAA00');
  slg.addColorStop(1, '#FF6600');
  ctx.shadowColor = '#FF8800';
  ctx.shadowBlur = 8;
  ctx.fillStyle = slg;
  ctx.beginPath();
  ctx.moveTo(44, 44);
  ctx.lineTo(84, 44);
  ctx.lineTo(82, 50);
  ctx.lineTo(46, 50);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // helmet top
  const hg = ctx.createLinearGradient(38, 24, 90, 24);
  hg.addColorStop(0, '#444');
  hg.addColorStop(0.5, '#666');
  hg.addColorStop(1, '#444');
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.moveTo(40, 42);
  ctx.bezierCurveTo(38, 28, 50, 18, 64, 16);
  ctx.bezierCurveTo(78, 18, 90, 28, 88, 42);
  ctx.closePath();
  ctx.fill();

  // chinstrap
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(42, 52);
  ctx.bezierCurveTo(48, 68, 80, 68, 86, 52);
  ctx.stroke();

  // danger stripes on shoulders
  ctx.fillStyle = '#CCAA00';
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(20 + i * 6, 100 + i * 2, 4, 8);
    ctx.fillRect(98 - i * 6, 100 + i * 2, 4, 8);
  }

  drawBorderRing(ctx, c.border);
}

// --- SKIRMISHER ---

function drawBladeDancer(ctx, cat) {
  const c = CAT_COLORS[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx, c.border);

  drawNeck(ctx, '#9B7B50');
  drawShoulders(ctx, '#2A3A2A', '#3A4A3A');

  drawHead(ctx, 64, 48, 20, 24, '#9B7B50', '#C4A478');

  // flowing hair
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.moveTo(42, 42);
  ctx.bezierCurveTo(40, 24, 56, 16, 64, 14);
  ctx.bezierCurveTo(72, 16, 88, 24, 86, 42);
  ctx.bezierCurveTo(90, 50, 92, 62, 88, 72);
  ctx.lineTo(84, 60);
  ctx.bezierCurveTo(86, 40, 80, 30, 64, 28);
  ctx.bezierCurveTo(48, 30, 42, 40, 44, 60);
  ctx.lineTo(40, 72);
  ctx.bezierCurveTo(36, 62, 38, 50, 42, 42);
  ctx.fill();

  drawEyes(ctx, 64, 48, 8, '#33AA55', '#44FF66');
  drawNose(ctx, 64, 54, '#7A5B38');
  drawMouth(ctx, 64, 62, '#5A3A2A');

  // dual blade silhouettes
  for (const side of [-1, 1]) {
    const bg = ctx.createLinearGradient(64 + side * 30, 30, 64 + side * 50, 90);
    bg.addColorStop(0, '#AAC0AA');
    bg.addColorStop(1, '#668866');
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.moveTo(64 + side * 30, 86);
    ctx.lineTo(64 + side * 34, 84);
    ctx.lineTo(64 + side * 48, 28);
    ctx.lineTo(64 + side * 46, 26);
    ctx.closePath();
    ctx.fill();
    // blade edge shine
    ctx.strokeStyle = '#CCDDCC';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(64 + side * 31, 85);
    ctx.lineTo(64 + side * 47, 27);
    ctx.stroke();
  }

  drawBorderRing(ctx, c.border);
}

function drawSharpshooter(ctx, cat) {
  const c = CAT_COLORS[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx, c.border);

  drawNeck(ctx, '#A08050');
  drawShoulders(ctx, '#2A3A28', '#3A5A38');

  drawHead(ctx, 64, 48, 20, 24, '#A08050', '#C8A878');

  // beret/cap
  ctx.fillStyle = '#2A4A2A';
  ctx.beginPath();
  ctx.moveTo(40, 42);
  ctx.bezierCurveTo(40, 28, 88, 28, 88, 42);
  ctx.bezierCurveTo(84, 38, 44, 38, 40, 42);
  ctx.fill();
  ctx.fillStyle = '#1A3A1A';
  ctx.beginPath();
  ctx.ellipse(64, 28, 28, 10, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  // crosshair eyes
  for (const ex of [55, 73]) {
    ctx.fillStyle = '#E8E8E0';
    ctx.beginPath();
    ctx.ellipse(ex, 48, 5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // crosshair pattern
    ctx.strokeStyle = '#44CC44';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(ex, 44);
    ctx.lineTo(ex, 52);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ex - 4, 48);
    ctx.lineTo(ex + 4, 48);
    ctx.stroke();
    ctx.shadowColor = '#44FF44';
    ctx.shadowBlur = 4;
    ctx.fillStyle = '#44CC44';
    ctx.beginPath();
    ctx.arc(ex, 48, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  drawNose(ctx, 64, 54, '#7A5A38');
  drawMouth(ctx, 64, 62, '#5A3A2A');

  drawBorderRing(ctx, c.border);
}

function drawSapper(ctx, cat) {
  const c = CAT_COLORS[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx, c.border);

  drawNeck(ctx, '#8B6B3A');
  drawShoulders(ctx, '#3A3A2A', '#4A4A3A');

  drawHead(ctx, 64, 52, 20, 23, '#8B6B3A', '#B89060');

  // mining helmet
  const mhg = ctx.createLinearGradient(36, 26, 92, 26);
  mhg.addColorStop(0, '#CCAA22');
  mhg.addColorStop(0.5, '#FFDD44');
  mhg.addColorStop(1, '#CCAA22');
  ctx.fillStyle = mhg;
  ctx.beginPath();
  ctx.moveTo(38, 48);
  ctx.bezierCurveTo(36, 32, 50, 22, 64, 20);
  ctx.bezierCurveTo(78, 22, 92, 32, 90, 48);
  ctx.closePath();
  ctx.fill();
  // helmet brim
  ctx.fillStyle = '#AA8811';
  ctx.beginPath();
  ctx.ellipse(64, 47, 30, 5, 0, 0, Math.PI);
  ctx.fill();
  // headlamp
  ctx.shadowColor = '#FFFF88';
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#FFFFAA';
  ctx.beginPath();
  ctx.arc(64, 30, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#FFDD44';
  ctx.beginPath();
  ctx.arc(64, 30, 3, 0, Math.PI * 2);
  ctx.fill();

  drawEyes(ctx, 64, 52, 8, '#887744', null);
  drawNose(ctx, 64, 58, '#6A4A2A');
  drawMouth(ctx, 64, 64, '#5A3A2A');

  // chin strap
  ctx.strokeStyle = '#886622';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(42, 47);
  ctx.bezierCurveTo(44, 64, 84, 64, 86, 47);
  ctx.stroke();

  drawBorderRing(ctx, c.border);
}

// --- CONTROL ---

function drawWarden(ctx, cat) {
  const c = CAT_COLORS[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx, c.border);

  drawNeck(ctx, '#888');
  drawShoulders(ctx, '#3A4A5A', '#5A6A7A');

  // heavy helmet (covers most of head)
  const whg = ctx.createLinearGradient(34, 18, 94, 18);
  whg.addColorStop(0, '#5A6A7A');
  whg.addColorStop(0.3, '#8A9AAA');
  whg.addColorStop(0.7, '#8A9AAA');
  whg.addColorStop(1, '#5A6A7A');
  ctx.fillStyle = whg;
  ctx.beginPath();
  ctx.moveTo(36, 56);
  ctx.bezierCurveTo(34, 30, 48, 14, 64, 12);
  ctx.bezierCurveTo(80, 14, 94, 30, 92, 56);
  ctx.lineTo(88, 68);
  ctx.bezierCurveTo(82, 72, 46, 72, 40, 68);
  ctx.closePath();
  ctx.fill();

  // T-visor slit
  ctx.fillStyle = '#1A2A3A';
  ctx.beginPath();
  ctx.moveTo(42, 42);
  ctx.lineTo(86, 42);
  ctx.lineTo(86, 50);
  ctx.lineTo(68, 50);
  ctx.lineTo(68, 64);
  ctx.lineTo(60, 64);
  ctx.lineTo(60, 50);
  ctx.lineTo(42, 50);
  ctx.closePath();
  ctx.fill();
  // eye glow through visor
  drawGlowingEye(ctx, 52, 46, '#4488FF');
  drawGlowingEye(ctx, 76, 46, '#4488FF');

  // helmet crest
  ctx.fillStyle = '#4466AA';
  ctx.beginPath();
  ctx.moveTo(60, 12);
  ctx.lineTo(64, 4);
  ctx.lineTo(68, 12);
  ctx.closePath();
  ctx.fill();

  // shield on left shoulder
  const sg = ctx.createLinearGradient(10, 88, 40, 120);
  sg.addColorStop(0, '#6688BB');
  sg.addColorStop(1, '#334466');
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.moveTo(14, 88);
  ctx.lineTo(38, 88);
  ctx.lineTo(38, 110);
  ctx.lineTo(26, 122);
  ctx.lineTo(14, 110);
  ctx.closePath();
  ctx.fill();
  // shield emblem
  ctx.strokeStyle = '#AABBDD';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(26, 102, 6, 0, Math.PI * 2);
  ctx.stroke();

  drawBorderRing(ctx, c.border);
}

function drawTrapper(ctx, cat) {
  const c = CAT_COLORS[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx, c.border);

  drawNeck(ctx, '#9B7B50');
  drawShoulders(ctx, '#3A3A44', '#4A4A55');

  drawHead(ctx, 64, 48, 20, 24, '#9B7B50', '#C4A478');

  // hood
  ctx.fillStyle = '#2A2A3A';
  ctx.beginPath();
  ctx.moveTo(36, 52);
  ctx.bezierCurveTo(34, 30, 48, 14, 64, 12);
  ctx.bezierCurveTo(80, 14, 94, 30, 92, 52);
  ctx.bezierCurveTo(88, 44, 78, 34, 64, 32);
  ctx.bezierCurveTo(50, 34, 40, 44, 36, 52);
  ctx.fill();

  drawEyes(ctx, 64, 48, 8, '#4488CC', '#4488FF');
  drawNose(ctx, 64, 54, '#7A5B38');
  drawMouth(ctx, 64, 62, '#5A3A2A');

  // net/rope draped over shoulder
  ctx.strokeStyle = '#8B7355';
  ctx.lineWidth = 1.5;
  // rope mesh
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(78 + i * 4, 72);
    ctx.bezierCurveTo(82 + i * 3, 90, 86 + i * 2, 105, 90 + i, 128);
    ctx.stroke();
  }
  for (let j = 0; j < 5; j++) {
    ctx.beginPath();
    ctx.moveTo(76, 78 + j * 10);
    ctx.bezierCurveTo(84, 76 + j * 10, 92, 80 + j * 10, 100, 82 + j * 10);
    ctx.stroke();
  }

  // rope coil on other shoulder
  ctx.strokeStyle = '#7A6345';
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.ellipse(28, 94 + i * 4, 12, 4, -0.3, 0, Math.PI * 2);
    ctx.stroke();
  }

  drawBorderRing(ctx, c.border);
}

function drawBombardier(ctx, cat) {
  const c = CAT_COLORS[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx, c.border);

  drawNeck(ctx, '#9B7044');
  drawShoulders(ctx, '#3A3A44', '#555');

  drawHead(ctx, 64, 48, 21, 25, '#9B7044', '#C49A68');

  // military cap
  ctx.fillStyle = '#2A2A44';
  ctx.beginPath();
  ctx.moveTo(38, 44);
  ctx.bezierCurveTo(36, 30, 50, 20, 64, 18);
  ctx.bezierCurveTo(78, 20, 92, 30, 90, 44);
  ctx.closePath();
  ctx.fill();
  // cap brim
  ctx.fillStyle = '#222244';
  ctx.beginPath();
  ctx.ellipse(64, 44, 30, 5, 0, 0, Math.PI);
  ctx.fill();

  drawEyes(ctx, 64, 48, 9, '#5566AA', null);
  drawNose(ctx, 64, 55, '#7A5034');
  drawMouth(ctx, 64, 63, '#5A3030');

  // stubble
  ctx.fillStyle = '#6A5034';
  for (let sx = 50; sx < 78; sx += 3) {
    for (let sy = 60; sy < 70; sy += 3) {
      if (Math.abs(sx - 64) + Math.abs(sy - 65) < 14) {
        ctx.beginPath();
        ctx.arc(sx, sy, 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // ammo bandolier across chest
  ctx.strokeStyle = '#5A4A3A';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(20, 78);
  ctx.bezierCurveTo(40, 90, 88, 100, 108, 128);
  ctx.stroke();
  // individual rounds
  ctx.fillStyle = '#AA8844';
  for (let t = 0; t < 10; t++) {
    const bx = 24 + t * 8.5;
    const by = 80 + t * 4.5;
    ctx.beginPath();
    ctx.ellipse(bx, by, 2.5, 4, 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  // brass tips
  ctx.fillStyle = '#DDBB55';
  for (let t = 0; t < 10; t++) {
    const bx = 24 + t * 8.5;
    const by = 78 + t * 4.5;
    ctx.beginPath();
    ctx.arc(bx - 1, by, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  drawBorderRing(ctx, c.border);
}

// --- SUPPORT ---

function drawGuardian(ctx, cat) {
  const c = CAT_COLORS[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx, c.border);

  // full plate shoulders
  const psg = ctx.createLinearGradient(10, 80, 118, 80);
  psg.addColorStop(0, '#8A8030');
  psg.addColorStop(0.5, '#CCBB55');
  psg.addColorStop(1, '#8A8030');
  ctx.fillStyle = psg;
  ctx.beginPath();
  ctx.moveTo(40, 74);
  ctx.bezierCurveTo(30, 78, 16, 86, 8, 100);
  ctx.lineTo(8, 128);
  ctx.lineTo(120, 128);
  ctx.lineTo(120, 100);
  ctx.bezierCurveTo(112, 86, 98, 78, 88, 74);
  ctx.closePath();
  ctx.fill();

  // gorget
  ctx.fillStyle = '#9A9040';
  ctx.beginPath();
  ctx.ellipse(64, 78, 22, 8, 0, 0, Math.PI);
  ctx.fill();

  // full plate helm
  const fhg = ctx.createLinearGradient(32, 14, 96, 14);
  fhg.addColorStop(0, '#8A8030');
  fhg.addColorStop(0.3, '#CCBB55');
  fhg.addColorStop(0.7, '#CCBB55');
  fhg.addColorStop(1, '#8A8030');
  ctx.fillStyle = fhg;
  ctx.beginPath();
  ctx.moveTo(36, 58);
  ctx.bezierCurveTo(32, 30, 46, 12, 64, 10);
  ctx.bezierCurveTo(82, 12, 96, 30, 92, 58);
  ctx.lineTo(88, 70);
  ctx.bezierCurveTo(82, 74, 46, 74, 40, 70);
  ctx.closePath();
  ctx.fill();

  // visor slit
  ctx.fillStyle = '#1A1808';
  ctx.beginPath();
  ctx.moveTo(42, 42);
  ctx.lineTo(86, 42);
  ctx.lineTo(84, 52);
  ctx.lineTo(44, 52);
  ctx.closePath();
  ctx.fill();
  // golden eyes
  drawGlowingEye(ctx, 54, 47, '#FFDD44');
  drawGlowingEye(ctx, 74, 47, '#FFDD44');

  // crown/plume
  ctx.fillStyle = '#DDCC44';
  ctx.beginPath();
  ctx.moveTo(56, 10);
  ctx.lineTo(58, 2);
  ctx.lineTo(64, 6);
  ctx.lineTo(70, 2);
  ctx.lineTo(72, 10);
  ctx.closePath();
  ctx.fill();

  // tower shield right
  const tsg = ctx.createLinearGradient(86, 80, 120, 128);
  tsg.addColorStop(0, '#BBAA44');
  tsg.addColorStop(1, '#6A6020');
  ctx.fillStyle = tsg;
  ctx.beginPath();
  ctx.moveTo(88, 82);
  ctx.lineTo(118, 82);
  ctx.lineTo(118, 118);
  ctx.lineTo(103, 126);
  ctx.lineTo(88, 118);
  ctx.closePath();
  ctx.fill();
  // shield cross
  ctx.strokeStyle = '#EEDD66';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(103, 86);
  ctx.lineTo(103, 120);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(92, 100);
  ctx.lineTo(114, 100);
  ctx.stroke();

  drawBorderRing(ctx, c.border);
}

function drawFieldMedic(ctx, cat) {
  const c = CAT_COLORS[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx, c.border);

  drawNeck(ctx, '#A08050');
  drawShoulders(ctx, '#444A3A', '#556648');

  drawHead(ctx, 64, 48, 20, 24, '#A08050', '#C8A878');

  // medic helmet
  const mhg = ctx.createLinearGradient(36, 20, 92, 20);
  mhg.addColorStop(0, '#DDD');
  mhg.addColorStop(0.5, '#FFF');
  mhg.addColorStop(1, '#DDD');
  ctx.fillStyle = mhg;
  ctx.beginPath();
  ctx.moveTo(38, 46);
  ctx.bezierCurveTo(36, 28, 50, 18, 64, 16);
  ctx.bezierCurveTo(78, 18, 92, 28, 90, 46);
  ctx.closePath();
  ctx.fill();

  // red cross on helmet
  ctx.fillStyle = '#DD2222';
  ctx.fillRect(60, 22, 8, 20);
  ctx.fillRect(54, 28, 20, 8);

  drawEyes(ctx, 64, 48, 8, '#558833', null);
  drawNose(ctx, 64, 55, '#7A5838');
  drawMouth(ctx, 64, 63, '#5A3A2A');

  // bandage wrap around jaw
  ctx.strokeStyle = '#EEE';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(44, 56);
  ctx.bezierCurveTo(48, 70, 80, 70, 84, 56);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(46, 62);
  ctx.bezierCurveTo(50, 72, 78, 72, 82, 62);
  ctx.stroke();

  // medical bag/pouch
  ctx.fillStyle = '#667755';
  ctx.beginPath();
  ctx.moveTo(82, 88);
  ctx.lineTo(108, 88);
  ctx.lineTo(112, 118);
  ctx.lineTo(78, 118);
  ctx.closePath();
  ctx.fill();
  // small red cross on bag
  ctx.fillStyle = '#CC2222';
  ctx.fillRect(92, 96, 4, 12);
  ctx.fillRect(89, 100, 10, 4);

  drawBorderRing(ctx, c.border);
}

function drawChemist(ctx, cat) {
  const c = CAT_COLORS[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx, c.border);

  drawNeck(ctx, '#555');
  drawShoulders(ctx, '#3A3A2A', '#4A4A3A');

  // gas mask covers entire face
  const gmg = ctx.createLinearGradient(36, 30, 92, 70);
  gmg.addColorStop(0, '#555');
  gmg.addColorStop(0.5, '#777');
  gmg.addColorStop(1, '#444');
  ctx.fillStyle = gmg;
  ctx.beginPath();
  ctx.moveTo(40, 42);
  ctx.bezierCurveTo(38, 28, 50, 18, 64, 16);
  ctx.bezierCurveTo(78, 18, 90, 28, 88, 42);
  ctx.lineTo(90, 60);
  ctx.bezierCurveTo(88, 72, 40, 72, 38, 60);
  ctx.closePath();
  ctx.fill();

  // goggles
  for (const ex of [52, 76]) {
    // goggle rim
    ctx.strokeStyle = '#8B8B00';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(ex, 40, 10, 0, Math.PI * 2);
    ctx.stroke();
    // goggle lens
    const lg = ctx.createRadialGradient(ex, 40, 1, ex, 40, 9);
    lg.addColorStop(0, '#AAFF44');
    lg.addColorStop(0.6, '#88CC22');
    lg.addColorStop(1, '#446600');
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.arc(ex, 40, 8, 0, Math.PI * 2);
    ctx.fill();
    // lens glint
    ctx.fillStyle = '#DDFF88';
    ctx.beginPath();
    ctx.arc(ex - 3, 38, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  // goggle bridge
  ctx.strokeStyle = '#8B8B00';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(62, 40);
  ctx.lineTo(66, 40);
  ctx.stroke();

  // snout filter
  ctx.fillStyle = '#666';
  ctx.beginPath();
  ctx.ellipse(64, 58, 10, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  // filter grate lines
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 1;
  for (let i = -3; i <= 3; i++) {
    ctx.beginPath();
    ctx.moveTo(56 + i, 54);
    ctx.lineTo(56 + i, 62);
    ctx.stroke();
  }

  // side canisters
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.ellipse(64 + side * 34, 56, 6, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#777';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(64 + side * 34, 56, 6, 10, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // hood
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.moveTo(36, 44);
  ctx.bezierCurveTo(32, 24, 48, 10, 64, 8);
  ctx.bezierCurveTo(80, 10, 96, 24, 92, 44);
  ctx.bezierCurveTo(88, 34, 78, 26, 64, 24);
  ctx.bezierCurveTo(50, 26, 40, 34, 36, 44);
  ctx.fill();

  drawBorderRing(ctx, c.border);
}

// --- ARTISAN ---

function drawScavenger(ctx, cat) {
  const c = CAT_COLORS[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx, c.border);

  drawNeck(ctx, '#8B7040');
  drawShoulders(ctx, '#4A3A2A', '#5A4A3A');

  drawHead(ctx, 64, 48, 20, 24, '#8B7040', '#B89868');

  // messy hair
  ctx.fillStyle = '#4A3020';
  ctx.beginPath();
  ctx.moveTo(42, 44);
  ctx.bezierCurveTo(38, 28, 52, 18, 64, 16);
  ctx.bezierCurveTo(76, 18, 90, 28, 86, 44);
  ctx.bezierCurveTo(82, 36, 76, 30, 64, 28);
  ctx.bezierCurveTo(52, 30, 46, 36, 42, 44);
  ctx.fill();
  // wild strands
  ctx.strokeStyle = '#5A4030';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(48 + i * 6, 26 + (i % 2) * 4);
    ctx.bezierCurveTo(46 + i * 7, 18, 50 + i * 5, 14 + i, 52 + i * 4, 20);
    ctx.stroke();
  }

  // goggles pushed up on forehead
  for (const ex of [52, 76]) {
    ctx.strokeStyle = '#886633';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ex, 34, 7, 0, Math.PI * 2);
    ctx.stroke();
    const lg = ctx.createRadialGradient(ex, 34, 1, ex, 34, 6);
    lg.addColorStop(0, '#88CCEE');
    lg.addColorStop(1, '#446688');
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.arc(ex, 34, 5.5, 0, Math.PI * 2);
    ctx.fill();
  }
  // goggle strap
  ctx.strokeStyle = '#886633';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(59, 34);
  ctx.lineTo(69, 34);
  ctx.stroke();

  drawEyes(ctx, 64, 50, 8, '#887744', null);
  drawNose(ctx, 64, 56, '#6A5030');
  drawMouth(ctx, 64, 64, '#5A3A2A');

  // backpack visible over shoulders
  ctx.fillStyle = '#5A4A3A';
  ctx.beginPath();
  ctx.moveTo(86, 78);
  ctx.lineTo(106, 78);
  ctx.bezierCurveTo(112, 80, 114, 88, 114, 100);
  ctx.lineTo(114, 128);
  ctx.lineTo(86, 128);
  ctx.lineTo(86, 86);
  ctx.closePath();
  ctx.fill();
  // pack straps
  ctx.strokeStyle = '#7A6A5A';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(90, 78);
  ctx.lineTo(78, 94);
  ctx.stroke();
  // dangling pouches
  ctx.fillStyle = '#6A5A4A';
  ctx.fillRect(88, 100, 10, 8);
  ctx.fillRect(100, 96, 10, 12);

  drawBorderRing(ctx, c.border);
}

function drawRanger(ctx, cat) {
  const c = CAT_COLORS[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx, c.border);

  drawNeck(ctx, '#9B7B50');
  drawShoulders(ctx, '#3A3020', '#4A4030');

  drawHead(ctx, 64, 50, 20, 23, '#9B7B50', '#C4A478');

  // hood
  ctx.fillStyle = '#3A3020';
  ctx.beginPath();
  ctx.moveTo(32, 56);
  ctx.bezierCurveTo(28, 28, 46, 10, 64, 8);
  ctx.bezierCurveTo(82, 10, 100, 28, 96, 56);
  ctx.bezierCurveTo(92, 42, 78, 28, 64, 26);
  ctx.bezierCurveTo(50, 28, 36, 42, 32, 56);
  ctx.fill();

  drawEyes(ctx, 64, 50, 8, '#558844', null);
  drawNose(ctx, 64, 56, '#7A5B38');

  // cloth mask over lower face
  ctx.fillStyle = '#4A4030';
  ctx.beginPath();
  ctx.moveTo(44, 56);
  ctx.lineTo(84, 56);
  ctx.lineTo(82, 72);
  ctx.bezierCurveTo(78, 76, 50, 76, 46, 72);
  ctx.closePath();
  ctx.fill();

  // bow visible behind left shoulder
  ctx.strokeStyle = '#7A5A3A';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(22, 40);
  ctx.bezierCurveTo(10, 60, 10, 90, 22, 110);
  ctx.stroke();
  // bowstring
  ctx.strokeStyle = '#AAA';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(22, 40);
  ctx.lineTo(22, 110);
  ctx.stroke();

  // quiver behind right shoulder
  ctx.fillStyle = '#5A4A3A';
  ctx.beginPath();
  ctx.moveTo(92, 60);
  ctx.lineTo(100, 58);
  ctx.lineTo(104, 110);
  ctx.lineTo(96, 112);
  ctx.closePath();
  ctx.fill();
  // arrow fletchings
  ctx.fillStyle = '#CC9944';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(94 + i * 2, 58);
    ctx.lineTo(96 + i * 2, 52);
    ctx.lineTo(98 + i * 2, 58);
    ctx.closePath();
    ctx.fill();
  }

  drawBorderRing(ctx, c.border);
}

function drawProspector(ctx, cat) {
  const c = CAT_COLORS[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx, c.border);

  drawNeck(ctx, '#8B6B3A');
  drawShoulders(ctx, '#4A3A2A', '#5A4A3A');

  drawHead(ctx, 64, 50, 21, 24, '#8B6B3A', '#B89060');

  // hardhat
  const hhg = ctx.createLinearGradient(34, 20, 94, 20);
  hhg.addColorStop(0, '#DD8800');
  hhg.addColorStop(0.5, '#FFAA22');
  hhg.addColorStop(1, '#DD8800');
  ctx.fillStyle = hhg;
  ctx.beginPath();
  ctx.moveTo(36, 46);
  ctx.bezierCurveTo(34, 28, 48, 16, 64, 14);
  ctx.bezierCurveTo(80, 16, 94, 28, 92, 46);
  ctx.closePath();
  ctx.fill();
  // hardhat brim
  ctx.fillStyle = '#CC7700';
  ctx.beginPath();
  ctx.ellipse(64, 45, 32, 5, 0, 0, Math.PI);
  ctx.fill();

  // bushy beard
  ctx.fillStyle = '#5A4020';
  ctx.beginPath();
  ctx.moveTo(46, 58);
  ctx.bezierCurveTo(44, 66, 44, 78, 52, 82);
  ctx.bezierCurveTo(58, 84, 70, 84, 76, 82);
  ctx.bezierCurveTo(84, 78, 84, 66, 82, 58);
  ctx.closePath();
  ctx.fill();

  drawEyes(ctx, 64, 50, 9, '#887744', null);
  drawNose(ctx, 64, 56, '#6A4A2A');

  // pickaxe over right shoulder
  // handle
  ctx.strokeStyle = '#7A5A3A';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(88, 68);
  ctx.lineTo(108, 28);
  ctx.stroke();
  // pick head
  const pkg = ctx.createLinearGradient(98, 22, 118, 34);
  pkg.addColorStop(0, '#888');
  pkg.addColorStop(1, '#AAA');
  ctx.fillStyle = pkg;
  ctx.beginPath();
  ctx.moveTo(104, 30);
  ctx.lineTo(118, 20);
  ctx.lineTo(120, 24);
  ctx.lineTo(108, 34);
  ctx.closePath();
  ctx.fill();
  // flat end
  ctx.fillStyle = '#777';
  ctx.beginPath();
  ctx.moveTo(104, 30);
  ctx.lineTo(98, 22);
  ctx.lineTo(100, 20);
  ctx.lineTo(108, 26);
  ctx.closePath();
  ctx.fill();

  drawBorderRing(ctx, c.border);
}

function drawArtificer(ctx, cat) {
  const c = CAT_COLORS[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx, c.border);

  drawNeck(ctx, '#555');
  drawShoulders(ctx, '#3A3020', '#4A4030');

  // welding mask
  const wmg = ctx.createLinearGradient(34, 18, 94, 18);
  wmg.addColorStop(0, '#444');
  wmg.addColorStop(0.5, '#666');
  wmg.addColorStop(1, '#444');
  ctx.fillStyle = wmg;
  ctx.beginPath();
  ctx.moveTo(36, 62);
  ctx.bezierCurveTo(32, 30, 46, 12, 64, 10);
  ctx.bezierCurveTo(82, 12, 96, 30, 92, 62);
  ctx.lineTo(90, 72);
  ctx.bezierCurveTo(84, 76, 44, 76, 38, 72);
  ctx.closePath();
  ctx.fill();

  // welding visor (dark rectangle with glow)
  ctx.fillStyle = '#1A1A1A';
  ctx.beginPath();
  ctx.moveTo(42, 36);
  ctx.lineTo(86, 36);
  ctx.lineTo(84, 54);
  ctx.lineTo(44, 54);
  ctx.closePath();
  ctx.fill();

  // visor glow
  const vgg = ctx.createLinearGradient(44, 40, 84, 50);
  vgg.addColorStop(0, '#CC8800' + '44');
  vgg.addColorStop(0.5, '#FFAA22' + '66');
  vgg.addColorStop(1, '#CC8800' + '44');
  ctx.fillStyle = vgg;
  ctx.beginPath();
  ctx.moveTo(44, 38);
  ctx.lineTo(84, 38);
  ctx.lineTo(82, 52);
  ctx.lineTo(46, 52);
  ctx.closePath();
  ctx.fill();

  // mask rivets
  ctx.fillStyle = '#888';
  for (const pos of [[42, 34], [86, 34], [42, 56], [86, 56]]) {
    ctx.beginPath();
    ctx.arc(pos[0], pos[1], 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // tools on belt / shoulder
  // wrench
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(92, 80);
  ctx.lineTo(108, 110);
  ctx.stroke();
  ctx.fillStyle = '#999';
  ctx.beginPath();
  ctx.arc(108, 112, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3A3020';
  ctx.beginPath();
  ctx.arc(108, 112, 2, 0, Math.PI * 2);
  ctx.fill();

  // gear/cog on other side
  ctx.strokeStyle = '#AA8833';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(24, 100, 8, 0, Math.PI * 2);
  ctx.stroke();
  // gear teeth
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
    ctx.beginPath();
    ctx.moveTo(24 + Math.cos(a) * 8, 100 + Math.sin(a) * 8);
    ctx.lineTo(24 + Math.cos(a) * 11, 100 + Math.sin(a) * 11);
    ctx.stroke();
  }

  // sparks
  ctx.shadowColor = '#FFAA22';
  ctx.shadowBlur = 4;
  ctx.fillStyle = '#FFCC44';
  for (const sp of [[50, 28], [78, 30], [44, 24], [82, 26]]) {
    ctx.beginPath();
    ctx.arc(sp[0], sp[1], 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  drawBorderRing(ctx, c.border);
}

// ════════════════════════════════════════════════
// AVATAR GENERATION
// ════════════════════════════════════════════════

const SKIN_TONES = [
  { base: '#F5D0A9', hi: '#FFE4C4' },
  { base: '#D2A679', hi: '#E8C8A0' },
  { base: '#A07848', hi: '#C49A68' },
  { base: '#8B6B3A', hi: '#B89060' },
  { base: '#6B4A2A', hi: '#8B6A4A' },
  { base: '#4A3420', hi: '#6A5440' },
  { base: '#C09870', hi: '#DDB890' },
  { base: '#B88860', hi: '#D8A880' },
  { base: '#9B7044', hi: '#BB9064' },
  { base: '#7A5530', hi: '#9A7550' },
];

const HAIR_STYLES = [
  { color: '#222', type: 'short' },
  { color: '#4A3020', type: 'mohawk' },
  { color: '#888', type: 'bald' },
  { color: '#663322', type: 'long' },
  { color: '#AA6633', type: 'short' },
  { color: '#222', type: 'buzz' },
  { color: '#555', type: 'mohawk' },
  { color: '#8B4513', type: 'long' },
  { color: '#333', type: 'short' },
  { color: '#666', type: 'bald' },
  { color: '#994422', type: 'buzz' },
  { color: '#2A2A2A', type: 'short' },
  { color: '#777', type: 'mohawk' },
  { color: '#443322', type: 'long' },
  { color: '#555', type: 'short' },
  { color: '#222', type: 'bald' },
  { color: '#7A5533', type: 'buzz' },
  { color: '#333', type: 'long' },
  { color: '#888', type: 'short' },
  { color: '#4A3A2A', type: 'mohawk' },
];

const OUTFIT_COLORS = [
  { main: '#4A4A4A', accent: '#666' },
  { main: '#3A5A3A', accent: '#4A6A4A' },
  { main: '#5A3A2A', accent: '#6A4A3A' },
  { main: '#3A3A5A', accent: '#4A4A6A' },
  { main: '#5A4A3A', accent: '#6A5A4A' },
  { main: '#444', accent: '#5A5A5A' },
  { main: '#3A4A3A', accent: '#4A5A4A' },
  { main: '#553A2A', accent: '#654A3A' },
  { main: '#2A3A4A', accent: '#3A4A5A' },
  { main: '#4A3A3A', accent: '#5A4A4A' },
  { main: '#3A4A4A', accent: '#4A5A5A' },
  { main: '#5A3A3A', accent: '#6A4A4A' },
  { main: '#333', accent: '#4A4A4A' },
  { main: '#4A4A3A', accent: '#5A5A4A' },
  { main: '#3A3A3A', accent: '#555' },
  { main: '#444A3A', accent: '#556648' },
  { main: '#4A3A4A', accent: '#5A4A5A' },
  { main: '#3A4438', accent: '#4A5448' },
  { main: '#504030', accent: '#605040' },
  { main: '#383838', accent: '#505050' },
];

const ACCESSORIES = [
  'scar_left', 'scar_right', 'eyepatch_left', 'eyepatch_right',
  'bandana', 'goggles_up', 'gas_mask_half', 'tattoo_face',
  'visor', 'none', 'scar_left', 'bandana',
  'goggles_up', 'eyepatch_right', 'tattoo_face', 'visor',
  'gas_mask_half', 'scar_right', 'none', 'bandana',
];

const EYE_COLORS = [
  '#558833', '#887744', '#4488CC', '#885533', '#667788',
  '#448855', '#886644', '#5577AA', '#775544', '#669977',
  '#557766', '#886655', '#5588BB', '#774433', '#668888',
  '#448866', '#887755', '#4477AA', '#885544', '#557799',
];

function drawHair(ctx, style, color, headX, headY) {
  ctx.fillStyle = color;
  switch (style) {
    case 'short':
      ctx.beginPath();
      ctx.moveTo(headX - 22, headY + 2);
      ctx.bezierCurveTo(headX - 24, headY - 16, headX - 10, headY - 28, headX, headY - 30);
      ctx.bezierCurveTo(headX + 10, headY - 28, headX + 24, headY - 16, headX + 22, headY + 2);
      ctx.bezierCurveTo(headX + 18, headY - 8, headX - 18, headY - 8, headX - 22, headY + 2);
      ctx.fill();
      break;
    case 'mohawk':
      ctx.beginPath();
      ctx.moveTo(headX - 6, headY - 2);
      ctx.bezierCurveTo(headX - 4, headY - 24, headX - 2, headY - 36, headX, headY - 38);
      ctx.bezierCurveTo(headX + 2, headY - 36, headX + 4, headY - 24, headX + 6, headY - 2);
      ctx.closePath();
      ctx.fill();
      break;
    case 'long':
      ctx.beginPath();
      ctx.moveTo(headX - 24, headY + 4);
      ctx.bezierCurveTo(headX - 26, headY - 16, headX - 12, headY - 30, headX, headY - 32);
      ctx.bezierCurveTo(headX + 12, headY - 30, headX + 26, headY - 16, headX + 24, headY + 4);
      ctx.lineTo(headX + 26, headY + 24);
      ctx.bezierCurveTo(headX + 22, headY + 16, headX + 20, headY + 6, headX + 18, headY);
      ctx.bezierCurveTo(headX + 14, headY - 8, headX - 14, headY - 8, headX - 18, headY);
      ctx.lineTo(headX - 24, headY + 24);
      ctx.closePath();
      ctx.fill();
      break;
    case 'buzz':
      ctx.beginPath();
      ctx.moveTo(headX - 20, headY);
      ctx.bezierCurveTo(headX - 22, headY - 12, headX - 8, headY - 24, headX, headY - 26);
      ctx.bezierCurveTo(headX + 8, headY - 24, headX + 22, headY - 12, headX + 20, headY);
      ctx.bezierCurveTo(headX + 16, headY - 6, headX - 16, headY - 6, headX - 20, headY);
      ctx.fill();
      break;
    case 'bald':
    default:
      break;
  }
}

function drawAccessory(ctx, type, headX, headY) {
  switch (type) {
    case 'scar_left':
      ctx.strokeStyle = '#CC8888';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(headX - 14, headY - 8);
      ctx.bezierCurveTo(headX - 10, headY - 2, headX - 8, headY + 6, headX - 12, headY + 12);
      ctx.stroke();
      break;
    case 'scar_right':
      ctx.strokeStyle = '#CC8888';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(headX + 14, headY - 8);
      ctx.bezierCurveTo(headX + 10, headY - 2, headX + 8, headY + 6, headX + 12, headY + 12);
      ctx.stroke();
      break;
    case 'eyepatch_left':
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.ellipse(headX - 8, headY, 7, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(headX - 15, headY - 2);
      ctx.lineTo(headX - 20, headY - 10);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(headX - 1, headY - 2);
      ctx.lineTo(headX + 8, headY - 12);
      ctx.stroke();
      break;
    case 'eyepatch_right':
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.ellipse(headX + 8, headY, 7, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(headX + 15, headY - 2);
      ctx.lineTo(headX + 20, headY - 10);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(headX + 1, headY - 2);
      ctx.lineTo(headX - 8, headY - 12);
      ctx.stroke();
      break;
    case 'bandana':
      ctx.fillStyle = '#8B2222';
      ctx.beginPath();
      ctx.moveTo(headX - 24, headY - 6);
      ctx.bezierCurveTo(headX - 22, headY - 14, headX + 22, headY - 14, headX + 24, headY - 6);
      ctx.lineTo(headX + 22, headY - 2);
      ctx.bezierCurveTo(headX + 20, headY - 10, headX - 20, headY - 10, headX - 22, headY - 2);
      ctx.closePath();
      ctx.fill();
      // knot tail
      ctx.beginPath();
      ctx.moveTo(headX + 22, headY - 6);
      ctx.bezierCurveTo(headX + 28, headY - 4, headX + 30, headY + 2, headX + 26, headY + 6);
      ctx.lineTo(headX + 24, headY + 4);
      ctx.stroke();
      break;
    case 'goggles_up':
      for (const ex of [headX - 10, headX + 10]) {
        ctx.strokeStyle = '#886633';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ex, headY - 14, 6, 0, Math.PI * 2);
        ctx.stroke();
        const lg = ctx.createRadialGradient(ex, headY - 14, 1, ex, headY - 14, 5);
        lg.addColorStop(0, '#88CCEE');
        lg.addColorStop(1, '#446688');
        ctx.fillStyle = lg;
        ctx.beginPath();
        ctx.arc(ex, headY - 14, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = '#886633';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(headX - 4, headY - 14);
      ctx.lineTo(headX + 4, headY - 14);
      ctx.stroke();
      break;
    case 'gas_mask_half':
      ctx.fillStyle = '#555';
      ctx.beginPath();
      ctx.moveTo(headX - 14, headY + 4);
      ctx.lineTo(headX + 14, headY + 4);
      ctx.lineTo(headX + 12, headY + 18);
      ctx.bezierCurveTo(headX + 8, headY + 22, headX - 8, headY + 22, headX - 12, headY + 18);
      ctx.closePath();
      ctx.fill();
      // filter
      ctx.fillStyle = '#444';
      ctx.beginPath();
      ctx.ellipse(headX, headY + 12, 6, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'tattoo_face':
      ctx.strokeStyle = '#44668888';
      ctx.lineWidth = 1.5;
      // tribal lines
      ctx.beginPath();
      ctx.moveTo(headX - 16, headY - 4);
      ctx.bezierCurveTo(headX - 12, headY, headX - 8, headY - 2, headX - 6, headY + 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(headX + 16, headY - 4);
      ctx.bezierCurveTo(headX + 12, headY, headX + 8, headY - 2, headX + 6, headY + 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(headX - 4, headY + 8);
      ctx.lineTo(headX, headY + 14);
      ctx.lineTo(headX + 4, headY + 8);
      ctx.stroke();
      break;
    case 'visor':
      const vg = ctx.createLinearGradient(headX - 20, headY - 2, headX + 20, headY - 2);
      vg.addColorStop(0, '#333');
      vg.addColorStop(0.5, '#555');
      vg.addColorStop(1, '#333');
      ctx.fillStyle = vg;
      ctx.beginPath();
      ctx.moveTo(headX - 20, headY - 4);
      ctx.lineTo(headX + 20, headY - 4);
      ctx.lineTo(headX + 18, headY + 4);
      ctx.lineTo(headX - 18, headY + 4);
      ctx.closePath();
      ctx.fill();
      // visor glow
      const slg = ctx.createLinearGradient(headX - 16, headY, headX + 16, headY);
      slg.addColorStop(0, '#44AAFF33');
      slg.addColorStop(0.5, '#44AAFF88');
      slg.addColorStop(1, '#44AAFF33');
      ctx.fillStyle = slg;
      ctx.fillRect(headX - 16, headY - 2, 32, 4);
      break;
    case 'none':
    default:
      break;
  }
}

function drawAvatar(index) {
  const { c, ctx } = makeCanvas();
  const skinIdx = index % SKIN_TONES.length;
  const skin = SKIN_TONES[skinIdx];
  const hair = HAIR_STYLES[index];
  const outfit = OUTFIT_COLORS[index];
  const accessory = ACCESSORIES[index];
  const eyeColor = EYE_COLORS[index];

  // dark wasteland background
  const bgColors = [
    ['#1A1A1A', '#2A2A2A'],
    ['#1A1A18', '#2A2A28'],
    ['#1A181A', '#2A282A'],
    ['#181A1A', '#282A2A'],
  ];
  const bg = bgColors[index % bgColors.length];
  drawBackground(ctx, bg[0], bg[1]);
  drawPortraitFrame(ctx, '#777');

  // neck
  drawNeck(ctx, skin.base);

  // shoulders/outfit
  const osg = ctx.createLinearGradient(20, 82, 108, 120);
  osg.addColorStop(0, outfit.accent);
  osg.addColorStop(1, outfit.main);
  ctx.fillStyle = osg;
  ctx.beginPath();
  ctx.moveTo(44, 78);
  ctx.bezierCurveTo(44, 85, 38, 90, 18, 102);
  ctx.lineTo(8, 128);
  ctx.lineTo(120, 128);
  ctx.lineTo(110, 102);
  ctx.bezierCurveTo(90, 90, 84, 85, 84, 78);
  ctx.closePath();
  ctx.fill();

  // collar
  ctx.strokeStyle = outfit.accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(48, 80);
  ctx.bezierCurveTo(52, 86, 76, 86, 80, 80);
  ctx.stroke();

  const headX = 64;
  const headY = 48;

  // head
  drawHead(ctx, headX, headY, 21, 25, skin.base, skin.hi);

  // hair
  drawHair(ctx, hair.type, hair.color, headX, headY);

  // draw eyes (unless eyepatch covers them)
  const hasLeftPatch = accessory === 'eyepatch_left';
  const hasRightPatch = accessory === 'eyepatch_right';
  const hasVisor = accessory === 'visor';
  const hasGasMask = accessory === 'gas_mask_half';

  if (!hasVisor) {
    if (!hasLeftPatch) {
      ctx.fillStyle = '#E8E8E0';
      ctx.beginPath();
      ctx.ellipse(headX - 8, headY, 5, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = eyeColor;
      ctx.beginPath();
      ctx.arc(headX - 8, headY, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(headX - 8, headY, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
    if (!hasRightPatch) {
      ctx.fillStyle = '#E8E8E0';
      ctx.beginPath();
      ctx.ellipse(headX + 8, headY, 5, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = eyeColor;
      ctx.beginPath();
      ctx.arc(headX + 8, headY, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(headX + 8, headY, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // nose and mouth (skip if gas mask covers lower face)
  if (!hasGasMask) {
    const skinShadow = skin.base.replace(/[0-9A-F]{2}$/i, (m) => {
      const v = Math.max(0, parseInt(m, 16) - 40);
      return v.toString(16).padStart(2, '0');
    });
    drawNose(ctx, headX, headY + 6, skinShadow);
    drawMouth(ctx, headX, headY + 14, '#5A3A2A');
  }

  // accessory
  drawAccessory(ctx, accessory, headX, headY);

  // border
  drawBorderRing(ctx, '#777');

  return c;
}

// ════════════════════════════════════════════════
// MAIN GENERATION
// ════════════════════════════════════════════════

let count = 0;

// Generate hero portraits
for (const hero of HEROES) {
  const { c, ctx } = makeCanvas();
  hero.draw(ctx, hero.cat);
  const buf = c.toBuffer('image/png');
  const outPath = path.join(HERO_OUT, `${hero.name}.png`);
  fs.writeFileSync(outPath, buf);
  count++;
}

// Generate avatars
for (let i = 0; i < 20; i++) {
  const c = drawAvatar(i);
  const buf = c.toBuffer('image/png');
  const num = String(i + 1).padStart(2, '0');
  const outPath = path.join(AVATAR_OUT, `wastelander_${num}.png`);
  fs.writeFileSync(outPath, buf);
  count++;
}

console.log(`Generated ${count} icons (${HEROES.length} heroes + 20 avatars)`);
