/**
 * Generate 9 hub location icons at 128x128.
 * Smooth rendering — gradients, arcs, bezier curves.
 */
import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

const SIZE = 128;
const outDir = path.join(process.cwd(), 'public', 'assets', 'hub-128');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function save(canvas, name) {
  fs.writeFileSync(path.join(outDir, `${name}.png`), canvas.toBuffer('image/png'));
}

function lighten(hex, amt) {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amt);
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amt);
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amt);
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

function darken(hex, amt) {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amt);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amt);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amt);
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

function makeBg(ctx, baseColor) {
  const g = ctx.createRadialGradient(64, 64, 10, 64, 64, 90);
  g.addColorStop(0, lighten(baseColor, 15));
  g.addColorStop(1, darken(baseColor, 20));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SIZE, SIZE);
  // Subtle border
  ctx.strokeStyle = lighten(baseColor, 40) + '66';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(2, 2, 124, 124, 8);
  ctx.stroke();
}

function drawGround(ctx, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(0, y, SIZE, SIZE - y);
  ctx.fillStyle = darken(color, 15);
  ctx.fillRect(0, y, SIZE, 2);
}

// ── 1. Scan Tower ───────────────────────────────────
// Tall observation tower with radar dish and scanning beam
function drawScanTower(ctx) {
  makeBg(ctx, '#141828');
  drawGround(ctx, 100, '#1A1A2A');

  // Tower base
  ctx.fillStyle = '#4A5068';
  ctx.fillRect(48, 50, 32, 52);
  ctx.fillStyle = '#3A4058';
  ctx.fillRect(52, 50, 24, 52);

  // Tower segments
  ctx.strokeStyle = '#5A6078';
  ctx.lineWidth = 1;
  for (let y = 55; y < 100; y += 8) {
    ctx.beginPath(); ctx.moveTo(48, y); ctx.lineTo(80, y); ctx.stroke();
  }

  // Windows
  ctx.fillStyle = '#66AAFF44';
  ctx.fillRect(56, 58, 6, 4);
  ctx.fillRect(66, 58, 6, 4);
  ctx.fillRect(56, 70, 6, 4);
  ctx.fillRect(66, 70, 6, 4);

  // Observation deck
  ctx.fillStyle = '#5A6878';
  ctx.fillRect(40, 44, 48, 8);
  ctx.fillStyle = '#6A7888';
  ctx.fillRect(42, 42, 44, 4);

  // Antenna mast
  ctx.fillStyle = '#7A8898';
  ctx.fillRect(62, 14, 4, 30);

  // Radar dish
  ctx.strokeStyle = '#8899AA';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(64, 22, 16, Math.PI * 0.8, Math.PI * 0.2);
  ctx.stroke();

  // Dish inner
  ctx.strokeStyle = '#99AABB';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(64, 24, 10, Math.PI * 0.85, Math.PI * 0.15);
  ctx.stroke();

  // Scanning beam effect
  const beam = ctx.createLinearGradient(64, 22, 110, 10);
  beam.addColorStop(0, '#44AAFF88');
  beam.addColorStop(0.5, '#44AAFF33');
  beam.addColorStop(1, 'transparent');
  ctx.fillStyle = beam;
  ctx.beginPath();
  ctx.moveTo(72, 18);
  ctx.lineTo(118, 4);
  ctx.lineTo(118, 24);
  ctx.lineTo(72, 26);
  ctx.closePath();
  ctx.fill();

  // Scan pulse circles
  ctx.strokeStyle = '#44AAFF22';
  ctx.lineWidth = 1;
  for (let r = 20; r < 50; r += 12) {
    ctx.beginPath(); ctx.arc(64, 22, r, 0, Math.PI * 2); ctx.stroke();
  }

  // Blinking light on top
  const blink = ctx.createRadialGradient(64, 14, 0, 64, 14, 6);
  blink.addColorStop(0, '#FF3333');
  blink.addColorStop(0.5, '#FF333388');
  blink.addColorStop(1, 'transparent');
  ctx.fillStyle = blink;
  ctx.beginPath(); ctx.arc(64, 14, 6, 0, Math.PI * 2); ctx.fill();
}

// ── 2. Firecamp ─────────────────────────────────────
// Central campfire with warm glow, sitting logs, community hub
function drawFirecamp(ctx) {
  makeBg(ctx, '#1E1410');
  drawGround(ctx, 90, '#2A1E14');

  // Dirt circle around fire
  const dirt = ctx.createRadialGradient(64, 88, 5, 64, 88, 45);
  dirt.addColorStop(0, '#3A2A1A');
  dirt.addColorStop(1, 'transparent');
  ctx.fillStyle = dirt;
  ctx.beginPath(); ctx.ellipse(64, 92, 50, 20, 0, 0, Math.PI * 2); ctx.fill();

  // Log seats
  ctx.fillStyle = '#5A4030';
  ctx.beginPath(); ctx.ellipse(24, 92, 16, 6, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#4A3020';
  ctx.beginPath(); ctx.ellipse(104, 90, 14, 5, -0.15, 0, Math.PI * 2); ctx.fill();

  // Fire ring (stones)
  ctx.fillStyle = '#555';
  const stones = 10;
  for (let i = 0; i < stones; i++) {
    const a = (i / stones) * Math.PI * 2;
    const sx = 64 + Math.cos(a) * 18;
    const sy = 82 + Math.sin(a) * 8;
    ctx.beginPath(); ctx.arc(sx, sy, 4, 0, Math.PI * 2); ctx.fill();
  }

  // Fire glow on ground
  const groundGlow = ctx.createRadialGradient(64, 82, 5, 64, 82, 40);
  groundGlow.addColorStop(0, '#FF660033');
  groundGlow.addColorStop(0.5, '#FF330011');
  groundGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = groundGlow;
  ctx.fillRect(0, 60, SIZE, SIZE);

  // Fire — layered flames
  // Outer flame
  const outerFlame = ctx.createLinearGradient(64, 30, 64, 82);
  outerFlame.addColorStop(0, '#FF220000');
  outerFlame.addColorStop(0.3, '#FF4400CC');
  outerFlame.addColorStop(0.7, '#FF8800');
  outerFlame.addColorStop(1, '#FFAA22');
  ctx.fillStyle = outerFlame;
  ctx.beginPath();
  ctx.moveTo(46, 82);
  ctx.bezierCurveTo(42, 60, 52, 38, 58, 28);
  ctx.bezierCurveTo(60, 24, 62, 30, 64, 26);
  ctx.bezierCurveTo(66, 30, 68, 24, 70, 28);
  ctx.bezierCurveTo(76, 38, 86, 60, 82, 82);
  ctx.closePath();
  ctx.fill();

  // Inner flame (brighter)
  const innerFlame = ctx.createLinearGradient(64, 42, 64, 80);
  innerFlame.addColorStop(0, '#FFDD4400');
  innerFlame.addColorStop(0.3, '#FFCC22CC');
  innerFlame.addColorStop(1, '#FFEE66');
  ctx.fillStyle = innerFlame;
  ctx.beginPath();
  ctx.moveTo(54, 80);
  ctx.bezierCurveTo(52, 64, 56, 48, 60, 40);
  ctx.bezierCurveTo(62, 36, 64, 42, 66, 38);
  ctx.bezierCurveTo(70, 46, 76, 64, 74, 80);
  ctx.closePath();
  ctx.fill();

  // Ember core
  const core = ctx.createRadialGradient(64, 76, 2, 64, 76, 10);
  core.addColorStop(0, '#FFFFFF');
  core.addColorStop(0.3, '#FFEE88');
  core.addColorStop(1, '#FF880000');
  ctx.fillStyle = core;
  ctx.beginPath(); ctx.ellipse(64, 78, 10, 5, 0, 0, Math.PI * 2); ctx.fill();

  // Sparks floating up
  ctx.fillStyle = '#FFAA33';
  [[56, 22], [68, 18], [60, 14], [72, 20], [52, 16], [76, 14]].forEach(([x, y]) => {
    ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill();
  });

  // Ambient glow dome
  const ambGlow = ctx.createRadialGradient(64, 60, 5, 64, 60, 60);
  ambGlow.addColorStop(0, '#FF880022');
  ambGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = ambGlow;
  ctx.beginPath(); ctx.arc(64, 60, 60, 0, Math.PI * 2); ctx.fill();
}

// ── 3. The Gate ─────────────────────────────────────
// Fortified entrance gate with metal doors and guard posts
function drawGate(ctx) {
  makeBg(ctx, '#181818');
  drawGround(ctx, 102, '#222');

  // Wall extending left and right
  ctx.fillStyle = '#555';
  ctx.fillRect(0, 40, 28, 64);
  ctx.fillRect(100, 40, 28, 64);
  // Wall top
  ctx.fillStyle = '#666';
  ctx.fillRect(0, 36, 28, 6);
  ctx.fillRect(100, 36, 28, 6);
  // Battlements
  ctx.fillStyle = '#666';
  for (let x = 0; x < 28; x += 8) {
    ctx.fillRect(x, 30, 5, 8);
    ctx.fillRect(100 + x, 30, 5, 8);
  }

  // Gate pillars
  ctx.fillStyle = '#5A5A5A';
  ctx.fillRect(28, 22, 16, 82);
  ctx.fillRect(84, 22, 16, 82);
  // Pillar highlights
  const ph = ctx.createLinearGradient(28, 22, 44, 22);
  ph.addColorStop(0, '#6A6A6A44');
  ph.addColorStop(1, 'transparent');
  ctx.fillStyle = ph;
  ctx.fillRect(28, 22, 8, 82);

  const ph2 = ctx.createLinearGradient(84, 22, 100, 22);
  ph2.addColorStop(0, '#6A6A6A44');
  ph2.addColorStop(1, 'transparent');
  ctx.fillStyle = ph2;
  ctx.fillRect(84, 22, 8, 82);

  // Arch
  ctx.fillStyle = '#666';
  ctx.beginPath();
  ctx.moveTo(28, 30);
  ctx.lineTo(28, 24);
  ctx.bezierCurveTo(28, 10, 100, 10, 100, 24);
  ctx.lineTo(100, 30);
  ctx.bezierCurveTo(96, 18, 32, 18, 28, 30);
  ctx.closePath();
  ctx.fill();

  // Gate opening (dark)
  ctx.fillStyle = '#0A0A0A';
  ctx.beginPath();
  ctx.moveTo(44, 102);
  ctx.lineTo(44, 40);
  ctx.bezierCurveTo(44, 26, 84, 26, 84, 40);
  ctx.lineTo(84, 102);
  ctx.closePath();
  ctx.fill();

  // Metal gate doors (partially open)
  ctx.fillStyle = '#4A4A50';
  // Left door
  ctx.fillRect(44, 38, 12, 64);
  ctx.strokeStyle = '#3A3A40';
  ctx.lineWidth = 1;
  for (let y = 44; y < 100; y += 10) {
    ctx.beginPath(); ctx.moveTo(44, y); ctx.lineTo(56, y); ctx.stroke();
  }
  // Right door
  ctx.fillRect(72, 38, 12, 64);
  for (let y = 44; y < 100; y += 10) {
    ctx.beginPath(); ctx.moveTo(72, y); ctx.lineTo(84, y); ctx.stroke();
  }
  // Door rivets
  ctx.fillStyle = '#888';
  [[48, 60], [48, 80], [76, 60], [76, 80]].forEach(([x, y]) => {
    ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
  });

  // Torch lights on pillars
  [[36, 36], [92, 36]].forEach(([x, y]) => {
    const tg = ctx.createRadialGradient(x, y, 1, x, y, 12);
    tg.addColorStop(0, '#FFAA3388');
    tg.addColorStop(0.5, '#FF660033');
    tg.addColorStop(1, 'transparent');
    ctx.fillStyle = tg;
    ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFAA33';
    ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
  });
}

// ── 4. Trade Post ───────────────────────────────────
// Market stall with awning, goods, and barter signs
function drawTradePost(ctx) {
  makeBg(ctx, '#1A1814');
  drawGround(ctx, 96, '#2A2418');

  // Stall structure
  ctx.fillStyle = '#5A4A3A';
  ctx.fillRect(20, 50, 88, 48);
  // Front counter
  ctx.fillStyle = '#6A5A4A';
  ctx.fillRect(18, 70, 92, 8);

  // Awning supports
  ctx.fillStyle = '#6A5A3A';
  ctx.fillRect(22, 28, 4, 44);
  ctx.fillRect(102, 28, 4, 44);

  // Striped awning
  const stripeColors = ['#CC4433', '#CCAA33'];
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = stripeColors[i % 2];
    ctx.beginPath();
    ctx.moveTo(16 + i * 12, 28);
    ctx.lineTo(16 + (i + 1) * 12, 28);
    ctx.lineTo(14 + (i + 1) * 12, 42);
    ctx.lineTo(14 + i * 12, 42);
    ctx.closePath();
    ctx.fill();
  }
  // Awning scallop edge
  ctx.fillStyle = '#CC4433';
  for (let x = 14; x < 110; x += 12) {
    ctx.beginPath();
    ctx.arc(x + 6, 42, 6, 0, Math.PI);
    ctx.fill();
  }

  // Goods on counter
  // Crates
  ctx.fillStyle = '#8B7355';
  ctx.fillRect(26, 58, 14, 12);
  ctx.fillRect(26, 62, 14, 2);
  ctx.fillRect(32, 56, 2, 14);
  // Bottles
  ctx.fillStyle = '#557755';
  [[50, 56], [56, 54], [62, 56]].forEach(([x, y]) => {
    ctx.beginPath();
    ctx.moveTo(x - 3, 70);
    ctx.lineTo(x - 3, y + 6);
    ctx.lineTo(x - 1, y);
    ctx.lineTo(x + 1, y);
    ctx.lineTo(x + 3, y + 6);
    ctx.lineTo(x + 3, 70);
    ctx.closePath();
    ctx.fill();
  });
  // Fabric rolls
  ctx.fillStyle = '#8866AA';
  ctx.beginPath(); ctx.ellipse(82, 64, 8, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#AA8866';
  ctx.beginPath(); ctx.ellipse(94, 64, 6, 5, 0, 0, Math.PI * 2); ctx.fill();

  // Sign hanging from awning
  ctx.fillStyle = '#6A5A3A';
  ctx.fillRect(54, 14, 20, 14);
  ctx.strokeStyle = '#8A7A5A';
  ctx.lineWidth = 1;
  ctx.strokeRect(54, 14, 20, 14);
  // WC (wasteland currency) on sign
  ctx.fillStyle = '#CCAA44';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('WC', 64, 25);
  // Chains
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(56, 14); ctx.lineTo(56, 8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(72, 14); ctx.lineTo(72, 8); ctx.stroke();

  // Warm interior glow
  const intGlow = ctx.createRadialGradient(64, 72, 5, 64, 72, 30);
  intGlow.addColorStop(0, '#FFAA3322');
  intGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = intGlow;
  ctx.fillRect(20, 50, 88, 48);
}

// ── 5. Workshop ─────────────────────────────────────
// Crafting workshop with anvil, workbench, sparks, tools on wall
function drawWorkshop(ctx) {
  makeBg(ctx, '#1A1410');
  drawGround(ctx, 98, '#2A2218');

  // Building structure
  ctx.fillStyle = '#4A4038';
  ctx.fillRect(14, 32, 100, 68);
  // Roof
  ctx.fillStyle = '#5A4A3A';
  ctx.beginPath();
  ctx.moveTo(8, 36);
  ctx.lineTo(64, 10);
  ctx.lineTo(120, 36);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#6A5A4A';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Door opening
  ctx.fillStyle = '#1A1008';
  ctx.fillRect(48, 56, 28, 44);

  // Workbench inside
  ctx.fillStyle = '#6A5A4A';
  ctx.fillRect(52, 74, 20, 4);
  ctx.fillRect(54, 78, 2, 12);
  ctx.fillRect(68, 78, 2, 12);

  // Anvil
  ctx.fillStyle = '#666';
  ctx.beginPath();
  ctx.moveTo(58, 78);
  ctx.lineTo(56, 72);
  ctx.lineTo(54, 70);
  ctx.lineTo(70, 70);
  ctx.lineTo(68, 72);
  ctx.lineTo(66, 78);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#555';
  ctx.fillRect(60, 78, 4, 6);

  // Tools on wall (inside doorway)
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 2;
  // Hammer
  ctx.beginPath(); ctx.moveTo(52, 60); ctx.lineTo(52, 68); ctx.stroke();
  ctx.fillStyle = '#777';
  ctx.fillRect(49, 58, 6, 4);
  // Wrench
  ctx.beginPath(); ctx.moveTo(72, 60); ctx.lineTo(72, 68); ctx.stroke();
  ctx.beginPath(); ctx.arc(72, 59, 3, 0, Math.PI * 2); ctx.stroke();

  // Forge glow from inside
  const forgeGlow = ctx.createRadialGradient(62, 72, 2, 62, 72, 20);
  forgeGlow.addColorStop(0, '#FF660044');
  forgeGlow.addColorStop(0.5, '#FF440022');
  forgeGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = forgeGlow;
  ctx.fillRect(48, 56, 28, 44);

  // Sparks
  ctx.fillStyle = '#FFAA33';
  [[58, 64], [66, 62], [62, 58], [54, 66], [68, 66]].forEach(([x, y]) => {
    ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill();
  });

  // Chimney with smoke
  ctx.fillStyle = '#5A4A3A';
  ctx.fillRect(86, 8, 12, 28);
  // Smoke wisps
  ctx.strokeStyle = '#66666644';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(92, 8);
  ctx.bezierCurveTo(88, -2, 96, -6, 90, -12);
  ctx.stroke();
  ctx.strokeStyle = '#66666633';
  ctx.beginPath();
  ctx.moveTo(90, 6);
  ctx.bezierCurveTo(94, -4, 86, -8, 94, -14);
  ctx.stroke();

  // Window
  ctx.fillStyle = '#FFAA3344';
  ctx.fillRect(22, 46, 14, 12);
  ctx.strokeStyle = '#5A4A3A';
  ctx.lineWidth = 2;
  ctx.strokeRect(22, 46, 14, 12);
  ctx.beginPath(); ctx.moveTo(29, 46); ctx.lineTo(29, 58); ctx.stroke();
}

// ── 6. Hero Quarters ────────────────────────────────
// Barracks/living quarters with hero silhouettes, training dummy
function drawHeroQuarters(ctx) {
  makeBg(ctx, '#141822');
  drawGround(ctx, 96, '#1A2028');

  // Building
  ctx.fillStyle = '#3A4050';
  ctx.fillRect(12, 34, 104, 64);
  // Flat roof with parapet
  ctx.fillStyle = '#4A5060';
  ctx.fillRect(10, 30, 108, 6);
  for (let x = 10; x < 118; x += 12) {
    ctx.fillRect(x, 24, 8, 8);
  }

  // Double door
  ctx.fillStyle = '#2A3040';
  ctx.fillRect(46, 54, 36, 44);
  // Door frames
  ctx.strokeStyle = '#5A6070';
  ctx.lineWidth = 2;
  ctx.strokeRect(46, 54, 18, 44);
  ctx.strokeRect(64, 54, 18, 44);
  // Door handles
  ctx.fillStyle = '#CCAA44';
  ctx.beginPath(); ctx.arc(60, 78, 2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(68, 78, 2, 0, Math.PI * 2); ctx.fill();

  // Banner above door — hero emblem
  ctx.fillStyle = '#CC4433';
  ctx.fillRect(52, 40, 24, 14);
  ctx.fillStyle = '#FFCC44';
  // Star emblem
  ctx.beginPath();
  const cx = 64, cy = 47;
  for (let i = 0; i < 5; i++) {
    const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const x = cx + Math.cos(a) * 5;
    const y = cy + Math.sin(a) * 5;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  // Windows with warm light
  [[18, 46], [32, 46], [88, 46], [102, 46]].forEach(([x, y]) => {
    ctx.fillStyle = '#FFCC6633';
    ctx.fillRect(x, y, 10, 10);
    ctx.strokeStyle = '#4A5060';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, 10, 10);
    ctx.beginPath(); ctx.moveTo(x + 5, y); ctx.lineTo(x + 5, y + 10); ctx.stroke();
  });

  // Training dummy outside
  ctx.fillStyle = '#8B7355';
  ctx.fillRect(108, 72, 3, 24);
  ctx.fillStyle = '#7A6345';
  ctx.fillRect(102, 76, 14, 4);
  ctx.beginPath(); ctx.arc(109, 70, 5, 0, Math.PI * 2); ctx.fill();

  // Warm light spilling from door
  const doorGlow = ctx.createRadialGradient(64, 80, 3, 64, 80, 30);
  doorGlow.addColorStop(0, '#FFCC6622');
  doorGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = doorGlow;
  ctx.fillRect(40, 54, 48, 48);
}

// ── 7. Command Post ─────────────────────────────────
// Military-style tent with antenna array and maps
function drawCommandPost(ctx) {
  makeBg(ctx, '#141820');
  drawGround(ctx, 94, '#1A2028');

  // Large tent
  ctx.fillStyle = '#4A5548';
  ctx.beginPath();
  ctx.moveTo(16, 96);
  ctx.lineTo(16, 50);
  ctx.lineTo(64, 24);
  ctx.lineTo(112, 50);
  ctx.lineTo(112, 96);
  ctx.closePath();
  ctx.fill();

  // Tent flap lines
  ctx.strokeStyle = '#3A4538';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(64, 24); ctx.lineTo(40, 96); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(64, 24); ctx.lineTo(88, 96); ctx.stroke();

  // Tent entrance
  ctx.fillStyle = '#1A2018';
  ctx.beginPath();
  ctx.moveTo(48, 96);
  ctx.lineTo(56, 58);
  ctx.lineTo(72, 58);
  ctx.lineTo(80, 96);
  ctx.closePath();
  ctx.fill();

  // Map table visible inside
  ctx.fillStyle = '#8B7355';
  ctx.fillRect(54, 76, 20, 3);
  ctx.fillStyle = '#DDCC99';
  ctx.fillRect(56, 72, 16, 4);

  // Antenna array on top
  ctx.fillStyle = '#778899';
  ctx.fillRect(62, 8, 4, 18);
  // Cross antennas
  ctx.strokeStyle = '#889AAA';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(52, 12); ctx.lineTo(76, 12); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(56, 8); ctx.lineTo(72, 8); ctx.stroke();
  // Antenna tips (dots)
  ctx.fillStyle = '#FF3333';
  ctx.beginPath(); ctx.arc(52, 12, 2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(76, 12, 2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#33FF33';
  ctx.beginPath(); ctx.arc(64, 8, 2, 0, Math.PI * 2); ctx.fill();

  // Signal waves
  ctx.strokeStyle = '#44AAFF33';
  ctx.lineWidth = 1;
  for (let r = 8; r < 30; r += 8) {
    ctx.beginPath();
    ctx.arc(64, 10, r, Math.PI * 1.2, Math.PI * 1.8);
    ctx.stroke();
  }

  // Sandbags at entrance
  ctx.fillStyle = '#7A7055';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(42 + i * 6, 94, 6, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(80 + i * 6, 94, 6, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Tactical light inside
  const tacGlow = ctx.createRadialGradient(64, 70, 3, 64, 70, 20);
  tacGlow.addColorStop(0, '#FFCC6622');
  tacGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = tacGlow;
  ctx.fillRect(48, 58, 32, 38);
}

// ── 8. Guild Hall (Faction HQ) ──────────────────────
// Grand faction building with banner and emblem
function drawGuildHall(ctx) {
  makeBg(ctx, '#1A1420');
  drawGround(ctx, 98, '#221828');

  // Grand building
  ctx.fillStyle = '#4A3A54';
  ctx.fillRect(16, 36, 96, 64);
  // Columns
  ctx.fillStyle = '#5A4A64';
  ctx.fillRect(18, 36, 8, 64);
  ctx.fillRect(42, 36, 6, 64);
  ctx.fillRect(80, 36, 6, 64);
  ctx.fillRect(102, 36, 8, 64);

  // Triangular pediment
  ctx.fillStyle = '#5A4A64';
  ctx.beginPath();
  ctx.moveTo(12, 38);
  ctx.lineTo(64, 12);
  ctx.lineTo(116, 38);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#6A5A74';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Faction emblem in pediment
  ctx.fillStyle = '#CCAA44';
  ctx.beginPath();
  ctx.arc(64, 28, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#4A3A54';
  ctx.beginPath();
  ctx.arc(64, 28, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#CCAA44';
  ctx.beginPath();
  ctx.arc(64, 28, 2, 0, Math.PI * 2);
  ctx.fill();

  // Grand entrance
  ctx.fillStyle = '#1A1020';
  ctx.beginPath();
  ctx.moveTo(50, 100);
  ctx.lineTo(50, 56);
  ctx.bezierCurveTo(50, 44, 78, 44, 78, 56);
  ctx.lineTo(78, 100);
  ctx.closePath();
  ctx.fill();

  // Steps
  ctx.fillStyle = '#5A4A64';
  ctx.fillRect(44, 98, 40, 4);
  ctx.fillRect(48, 94, 32, 4);

  // Banners on columns
  [[22, 40], [104, 40]].forEach(([x, y]) => {
    ctx.fillStyle = '#8844AA';
    ctx.fillRect(x - 2, y, 6, 20);
    ctx.fillStyle = '#CCAA44';
    ctx.beginPath();
    ctx.moveTo(x - 2, y + 20);
    ctx.lineTo(x + 1, y + 26);
    ctx.lineTo(x + 4, y + 20);
    ctx.closePath();
    ctx.fill();
  });

  // Purple glow from entrance
  const entrGlow = ctx.createRadialGradient(64, 72, 3, 64, 72, 25);
  entrGlow.addColorStop(0, '#8844AA33');
  entrGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = entrGlow;
  ctx.fillRect(46, 44, 36, 56);
}

// ── 9. Arena ────────────────────────────────────────
// Colosseum-style arena with combatants
function drawArena(ctx) {
  makeBg(ctx, '#201414');
  drawGround(ctx, 96, '#2A1A1A');

  // Arena outer wall (elliptical)
  ctx.fillStyle = '#5A4444';
  ctx.beginPath();
  ctx.ellipse(64, 70, 56, 34, 0, 0, Math.PI * 2);
  ctx.fill();

  // Arena inner (darker)
  ctx.fillStyle = '#2A1818';
  ctx.beginPath();
  ctx.ellipse(64, 70, 44, 24, 0, 0, Math.PI * 2);
  ctx.fill();

  // Sand floor
  const sand = ctx.createRadialGradient(64, 72, 5, 64, 72, 40);
  sand.addColorStop(0, '#8B7B55');
  sand.addColorStop(1, '#6A5A3A');
  ctx.fillStyle = sand;
  ctx.beginPath();
  ctx.ellipse(64, 72, 40, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tiered seating (arcs)
  ctx.strokeStyle = '#6A5454';
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.ellipse(64, 70, 46 + i * 3, 26 + i * 2, 0, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
  }

  // Arch entrances
  ctx.fillStyle = '#1A0A0A';
  ctx.beginPath();
  ctx.ellipse(20, 66, 8, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(108, 66, 8, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wall details — pillars on top
  ctx.fillStyle = '#6A5454';
  for (let a = 0.15; a < 0.85; a += 0.14) {
    const x = 64 + Math.cos(Math.PI + a * Math.PI) * 54;
    const y = 70 + Math.sin(Math.PI + a * Math.PI) * 32 - 4;
    ctx.fillRect(x - 2, y - 8, 4, 12);
  }

  // Combatant silhouettes in arena
  // Fighter 1
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(48, 68, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(46, 72, 4, 8);
  ctx.fillRect(42, 74, 4, 2);
  ctx.fillRect(50, 74, 4, 2);
  // Sword
  ctx.strokeStyle = '#AAA';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(52, 73); ctx.lineTo(58, 68); ctx.stroke();

  // Fighter 2
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(80, 70, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(78, 74, 4, 8);
  ctx.fillRect(74, 76, 4, 2);
  ctx.fillRect(82, 76, 4, 2);
  // Shield
  ctx.fillStyle = '#666';
  ctx.beginPath(); ctx.arc(74, 76, 4, 0, Math.PI * 2); ctx.fill();

  // Dramatic top lighting
  const topLight = ctx.createLinearGradient(64, 0, 64, 50);
  topLight.addColorStop(0, '#FF884422');
  topLight.addColorStop(1, 'transparent');
  ctx.fillStyle = topLight;
  ctx.fillRect(30, 0, 68, 50);

  // Crowd noise sparkles
  ctx.fillStyle = '#FFCC6633';
  [[30, 44], [50, 40], [74, 38], [96, 42], [40, 48], [86, 46]].forEach(([x, y]) => {
    ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill();
  });
}

// ══════════════════════════════════════════════════════
//  GENERATE ALL
// ══════════════════════════════════════════════════════

const ICONS = [
  ['scan_tower', drawScanTower],
  ['firecamp', drawFirecamp],
  ['gate', drawGate],
  ['trade_post', drawTradePost],
  ['workshop', drawWorkshop],
  ['hero_quarters', drawHeroQuarters],
  ['command_post', drawCommandPost],
  ['guild_hall', drawGuildHall],
  ['arena', drawArena],
];

console.log('Generating hub location icons...');
for (const [name, drawFn] of ICONS) {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  drawFn(ctx);
  save(canvas, name);
  console.log(`  [OK] ${name}.png`);
}
console.log(`\nDone! Generated ${ICONS.length} hub icons in ${outDir}`);
