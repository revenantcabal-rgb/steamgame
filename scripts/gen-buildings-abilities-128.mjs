/**
 * Wasteland Grind - 128x128 Building, Skill & Ability Icon Generator
 * Generates smooth, anti-aliased PNG icons using canvas arcs, gradients, and bezier curves.
 *
 * PART 1: 20 encampment building icons  -> public/assets/buildings-128/
 * PART 2: 11 skill icons                -> public/assets/skills-128/
 * PART 3: 78 ability icons              -> public/assets/abilities-128/
 *
 * Run: node scripts/gen-buildings-abilities-128.mjs
 */
import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

const SIZE = 128;
const CX = SIZE / 2;
const CY = SIZE / 2;
const OUT = path.resolve('public/assets');

// ──────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────
function makeCanvas() {
  const c = createCanvas(SIZE, SIZE);
  const ctx = c.getContext('2d');
  ctx.antialias = 'subpixel';
  ctx.quality = 'best';
  return { c, ctx };
}

function save(canvas, folder, filename) {
  const dir = path.join(OUT, folder);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${filename}.png`), canvas.toBuffer('image/png'));
}

/** Rounded-rect fill + optional stroke */
function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
}

/** Radial gradient background with vignette */
function drawBg(ctx, bgColor, accentColor) {
  const g = ctx.createRadialGradient(CX, CY, 10, CX, CY, 90);
  g.addColorStop(0, accentColor || lighten(bgColor, 30));
  g.addColorStop(1, bgColor);
  ctx.fillStyle = g;
  roundRect(ctx, 0, 0, SIZE, SIZE, 12, null, null);
  ctx.fill();
  // border
  ctx.strokeStyle = lighten(bgColor, 50);
  ctx.lineWidth = 2.5;
  roundRect(ctx, 1, 1, SIZE - 2, SIZE - 2, 12, null, null);
  ctx.stroke();
}

/** Lighten a hex color */
function lighten(hex, amt) {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  r = Math.min(255, r + amt);
  g = Math.min(255, g + amt);
  b = Math.min(255, b + amt);
  return `rgb(${r},${g},${b})`;
}

/** Darken a hex color */
function darken(hex, amt) {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  r = Math.max(0, r - amt);
  g = Math.max(0, g - amt);
  b = Math.max(0, b - amt);
  return `rgb(${r},${g},${b})`;
}

/** Draw a simple star shape */
function drawStar(ctx, cx, cy, outerR, innerR, points, fill) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI * i) / points - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

/** Draw a simple triangle */
function drawTriangle(ctx, x1, y1, x2, y2, x3, y3, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
}

/** Glow effect behind shapes */
function drawGlow(ctx, cx, cy, radius, color) {
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  g.addColorStop(0, color);
  g.addColorStop(1, 'transparent');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
}

// ══════════════════════════════════════════════════
// PART 1: BUILDING ICONS (20)
// ══════════════════════════════════════════════════
const BUILDING_CATEGORIES = {
  gathering: { bg: '#0A2A0A', accent: '#1A4A1A', border: '#2E7D32' },
  production: { bg: '#2A1A0A', accent: '#4A2A0A', border: '#E65100' },
  combat: { bg: '#2A0A0A', accent: '#4A1A1A', border: '#C62828' },
  worker: { bg: '#2A1A0A', accent: '#3A2A1A', border: '#6D4C41' },
  hero: { bg: '#2A2200', accent: '#3A3200', border: '#FFB300' },
  economy: { bg: '#0A2A2A', accent: '#1A3A3A', border: '#00897B' },
  special: { bg: '#1A0A2A', accent: '#2A1A3A', border: '#7B1FA2' },
};

function buildingBg(ctx, cat) {
  const c = BUILDING_CATEGORIES[cat];
  drawBg(ctx, c.bg, c.accent);
  ctx.strokeStyle = c.border;
  ctx.lineWidth = 2.5;
  roundRect(ctx, 1, 1, SIZE - 2, SIZE - 2, 12, null, null);
  ctx.stroke();
}

function drawBuildings() {
  const folder = 'buildings-128';
  let count = 0;

  // --- scrap_forge: anvil with hammer, orange glow ---
  {
    const { c, ctx } = makeCanvas();
    buildingBg(ctx, 'gathering');
    drawGlow(ctx, CX, CY + 10, 40, 'rgba(255,140,0,0.25)');
    // anvil body
    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.moveTo(35, 85); ctx.lineTo(45, 60); ctx.lineTo(83, 60); ctx.lineTo(93, 85);
    ctx.closePath();
    ctx.fill();
    // anvil top
    roundRect(ctx, 40, 52, 48, 12, 3, '#666', '#444');
    // anvil horn
    ctx.beginPath();
    ctx.moveTo(40, 58); ctx.quadraticCurveTo(28, 58, 25, 65);
    ctx.lineTo(28, 68); ctx.lineTo(40, 65);
    ctx.closePath();
    ctx.fillStyle = '#777';
    ctx.fill();
    // hammer handle
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(80, 30); ctx.lineTo(55, 55);
    ctx.stroke();
    // hammer head
    ctx.fillStyle = '#888';
    ctx.save();
    ctx.translate(80, 30);
    ctx.rotate(-0.8);
    roundRect(ctx, -12, -6, 24, 12, 2, '#888', '#555');
    ctx.restore();
    // sparks
    for (let i = 0; i < 5; i++) {
      const sx = 55 + Math.cos(i * 1.2) * (8 + i * 4);
      const sy = 50 - Math.sin(i * 1.2) * (5 + i * 3);
      ctx.fillStyle = `rgba(255,${180 + i * 15},0,${0.9 - i * 0.15})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 2 - i * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    save(c, folder, 'scrap_forge');
    count++;
  }

  // --- greenhouse_dome: glass dome with plants ---
  {
    const { c, ctx } = makeCanvas();
    buildingBg(ctx, 'gathering');
    // dome
    ctx.beginPath();
    ctx.arc(CX, 72, 38, Math.PI, 0);
    ctx.lineTo(CX + 38, 85);
    ctx.lineTo(CX - 38, 85);
    ctx.closePath();
    const dg = ctx.createLinearGradient(CX, 30, CX, 85);
    dg.addColorStop(0, 'rgba(180,230,255,0.45)');
    dg.addColorStop(1, 'rgba(100,200,180,0.25)');
    ctx.fillStyle = dg;
    ctx.fill();
    ctx.strokeStyle = 'rgba(200,240,255,0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
    // dome ribs
    ctx.strokeStyle = 'rgba(200,240,255,0.3)';
    ctx.lineWidth = 1;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(CX + i * 12, 85);
      ctx.quadraticCurveTo(CX + i * 6, 40, CX + i * 12, 34 + Math.abs(i) * 4);
      ctx.stroke();
    }
    // plants inside
    const plantColors = ['#2E7D32', '#388E3C', '#43A047', '#66BB6A'];
    for (let i = 0; i < 6; i++) {
      const px = 38 + i * 10;
      const py = 80;
      ctx.fillStyle = plantColors[i % plantColors.length];
      ctx.beginPath();
      ctx.ellipse(px, py - 8, 5, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#33691E';
      ctx.fillRect(px - 1, py - 2, 2, 6);
    }
    // base
    roundRect(ctx, CX - 40, 83, 80, 8, 2, '#5D4037', '#3E2723');
    save(c, folder, 'greenhouse_dome');
    count++;
  }

  // --- salvage_workshop: workbench with tools ---
  {
    const { c, ctx } = makeCanvas();
    buildingBg(ctx, 'gathering');
    // workbench top
    roundRect(ctx, 20, 60, 88, 8, 2, '#6D4C41', '#4E342E');
    // legs
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(28, 68, 6, 25);
    ctx.fillRect(94, 68, 6, 25);
    // wrench
    ctx.strokeStyle = '#9E9E9E';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(40, 55); ctx.lineTo(40, 38);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(40, 34, 6, 0, Math.PI * 2);
    ctx.strokeStyle = '#9E9E9E';
    ctx.lineWidth = 3;
    ctx.stroke();
    // saw
    ctx.strokeStyle = '#BDBDBD';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(58, 56); ctx.lineTo(75, 30);
    ctx.stroke();
    // saw teeth
    for (let i = 0; i < 5; i++) {
      const t = i / 5;
      const bx = 58 + (75 - 58) * t;
      const by = 56 + (30 - 56) * t;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + 3, by - 3);
      ctx.lineTo(bx + 6, by);
      ctx.stroke();
    }
    // pliers
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(88, 55); ctx.lineTo(85, 38);
    ctx.moveTo(88, 55); ctx.lineTo(91, 38);
    ctx.stroke();
    // gear on bench
    ctx.strokeStyle = '#FF8F00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(64, 56, 6, 0, Math.PI * 2);
    ctx.stroke();
    save(c, folder, 'salvage_workshop');
    count++;
  }

  // --- water_cistern: water tank with pipes ---
  {
    const { c, ctx } = makeCanvas();
    buildingBg(ctx, 'gathering');
    // tank body
    const tg = ctx.createLinearGradient(35, 30, 93, 30);
    tg.addColorStop(0, '#546E7A');
    tg.addColorStop(0.5, '#78909C');
    tg.addColorStop(1, '#546E7A');
    roundRect(ctx, 35, 30, 58, 55, 6, null, null);
    ctx.fillStyle = tg;
    ctx.fill();
    ctx.strokeStyle = '#37474F';
    ctx.lineWidth = 2;
    ctx.stroke();
    // water level inside
    const wg = ctx.createLinearGradient(CX, 50, CX, 85);
    wg.addColorStop(0, 'rgba(33,150,243,0.5)');
    wg.addColorStop(1, 'rgba(21,101,192,0.7)');
    roundRect(ctx, 37, 50, 54, 33, 4, null, null);
    ctx.fillStyle = wg;
    ctx.fill();
    // rivets
    ctx.fillStyle = '#90A4AE';
    for (const rx of [42, 55, 68, 81]) {
      ctx.beginPath(); ctx.arc(rx, 34, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(rx, 82, 2, 0, Math.PI * 2); ctx.fill();
    }
    // pipe right
    ctx.strokeStyle = '#607D8B';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(93, 55); ctx.lineTo(108, 55); ctx.lineTo(108, 75);
    ctx.stroke();
    // pipe left
    ctx.beginPath();
    ctx.moveTo(35, 45); ctx.lineTo(20, 45); ctx.lineTo(20, 30);
    ctx.stroke();
    // valve
    ctx.strokeStyle = '#F44336';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(105, 65); ctx.lineTo(111, 65);
    ctx.stroke();
    save(c, folder, 'water_cistern');
    count++;
  }

  // --- mine_shaft: mine entrance with cart tracks ---
  {
    const { c, ctx } = makeCanvas();
    buildingBg(ctx, 'gathering');
    // mountain/rock face
    ctx.fillStyle = '#4E342E';
    ctx.beginPath();
    ctx.moveTo(15, 90); ctx.lineTo(40, 25); ctx.lineTo(64, 15); ctx.lineTo(88, 25); ctx.lineTo(113, 90);
    ctx.closePath();
    ctx.fill();
    // mine entrance (arch)
    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath();
    ctx.arc(CX, 70, 22, Math.PI, 0);
    ctx.lineTo(CX + 22, 90);
    ctx.lineTo(CX - 22, 90);
    ctx.closePath();
    ctx.fill();
    // wooden supports
    ctx.fillStyle = '#6D4C41';
    ctx.fillRect(CX - 24, 45, 5, 45);
    ctx.fillRect(CX + 19, 45, 5, 45);
    roundRect(ctx, CX - 25, 44, 50, 6, 2, '#795548', null);
    // cart tracks
    ctx.strokeStyle = '#9E9E9E';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(CX - 12, 90); ctx.lineTo(CX - 8, 72);
    ctx.moveTo(CX + 12, 90); ctx.lineTo(CX + 8, 72);
    ctx.stroke();
    // cart
    roundRect(ctx, CX - 10, 80, 20, 10, 2, '#795548', '#4E342E');
    // ore in cart
    ctx.fillStyle = '#FF8F00';
    ctx.beginPath();
    ctx.arc(CX - 3, 79, 3, 0, Math.PI * 2);
    ctx.arc(CX + 4, 78, 3.5, 0, Math.PI * 2);
    ctx.fill();
    // lantern
    drawGlow(ctx, CX, 55, 12, 'rgba(255,200,50,0.3)');
    ctx.fillStyle = '#FFC107';
    ctx.beginPath();
    ctx.arc(CX, 55, 3, 0, Math.PI * 2);
    ctx.fill();
    save(c, folder, 'mine_shaft');
    count++;
  }

  // --- assembly_line: conveyor belt with gears ---
  {
    const { c, ctx } = makeCanvas();
    buildingBg(ctx, 'production');
    // conveyor belt
    roundRect(ctx, 15, 65, 98, 12, 4, '#616161', '#424242');
    // belt segments
    ctx.strokeStyle = '#757575';
    ctx.lineWidth = 1;
    for (let bx = 22; bx < 110; bx += 10) {
      ctx.beginPath(); ctx.moveTo(bx, 65); ctx.lineTo(bx, 77); ctx.stroke();
    }
    // rollers
    ctx.fillStyle = '#9E9E9E';
    ctx.beginPath(); ctx.arc(22, 71, 6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(106, 71, 6, 0, Math.PI * 2); ctx.fill();
    // items on belt
    roundRect(ctx, 38, 55, 12, 10, 2, '#FF8F00', '#E65100');
    roundRect(ctx, 60, 53, 14, 12, 2, '#42A5F5', '#1565C0');
    roundRect(ctx, 84, 56, 10, 9, 2, '#66BB6A', '#2E7D32');
    // gear top-left
    ctx.strokeStyle = '#EF6C00';
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(30, 38, 12, 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI * i) / 3;
      ctx.beginPath();
      ctx.moveTo(30 + 10 * Math.cos(a), 38 + 10 * Math.sin(a));
      ctx.lineTo(30 + 16 * Math.cos(a), 38 + 16 * Math.sin(a));
      ctx.stroke();
    }
    // gear top-right
    ctx.strokeStyle = '#EF6C00';
    ctx.beginPath(); ctx.arc(96, 38, 10, 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI * i) / 3 + 0.3;
      ctx.beginPath();
      ctx.moveTo(96 + 8 * Math.cos(a), 38 + 8 * Math.sin(a));
      ctx.lineTo(96 + 13 * Math.cos(a), 38 + 13 * Math.sin(a));
      ctx.stroke();
    }
    // legs
    ctx.fillStyle = '#424242';
    ctx.fillRect(20, 77, 4, 16);
    ctx.fillRect(104, 77, 4, 16);
    save(c, folder, 'assembly_line');
    count++;
  }

  // --- alchemists_lab: bubbling flasks and tubes ---
  {
    const { c, ctx } = makeCanvas();
    buildingBg(ctx, 'production');
    // table
    roundRect(ctx, 18, 75, 92, 6, 2, '#5D4037', '#3E2723');
    // flask left (round bottom)
    ctx.strokeStyle = 'rgba(200,230,255,0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(38, 45); ctx.lineTo(38, 55);
    ctx.arc(40, 65, 12, Math.PI * 0.9, Math.PI * 0.1);
    ctx.lineTo(42, 45);
    ctx.closePath();
    ctx.stroke();
    // liquid in flask
    const fg = ctx.createLinearGradient(40, 58, 40, 75);
    fg.addColorStop(0, 'rgba(76,175,80,0.6)');
    fg.addColorStop(1, 'rgba(27,94,32,0.8)');
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.arc(40, 65, 10, 0.2, Math.PI - 0.2);
    ctx.closePath();
    ctx.fill();
    // bubbles
    ctx.fillStyle = 'rgba(129,199,132,0.6)';
    ctx.beginPath(); ctx.arc(37, 62, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(43, 59, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(40, 56, 1, 0, Math.PI * 2); ctx.fill();
    // beaker right (tall)
    ctx.strokeStyle = 'rgba(200,230,255,0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(72, 40); ctx.lineTo(68, 75); ctx.lineTo(82, 75); ctx.lineTo(78, 40);
    ctx.closePath();
    ctx.stroke();
    // liquid in beaker
    const bg2 = ctx.createLinearGradient(75, 55, 75, 75);
    bg2.addColorStop(0, 'rgba(156,39,176,0.5)');
    bg2.addColorStop(1, 'rgba(74,20,140,0.8)');
    ctx.fillStyle = bg2;
    ctx.beginPath();
    ctx.moveTo(70, 55); ctx.lineTo(68, 75); ctx.lineTo(82, 75); ctx.lineTo(80, 55);
    ctx.closePath();
    ctx.fill();
    // tube connecting
    ctx.strokeStyle = 'rgba(200,230,255,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(42, 45); ctx.bezierCurveTo(50, 30, 65, 30, 72, 40);
    ctx.stroke();
    // steam/vapor
    ctx.strokeStyle = 'rgba(200,200,200,0.3)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(40 + i * 3, 44);
      ctx.bezierCurveTo(38 + i * 3, 36, 42 + i * 3, 30, 39 + i * 4, 22);
      ctx.stroke();
    }
    // small test tube
    ctx.strokeStyle = 'rgba(200,230,255,0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(95, 50); ctx.lineTo(95, 70); ctx.arc(95, 71, 3, 0, Math.PI); ctx.lineTo(89, 50);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,152,0,0.6)';
    ctx.beginPath();
    ctx.arc(92, 71, 2.5, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
    save(c, folder, 'alchemists_lab');
    count++;
  }

  // --- armory: rack of weapons ---
  {
    const { c, ctx } = makeCanvas();
    buildingBg(ctx, 'combat');
    // weapon rack (wooden frame)
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(25, 25, 6, 68);
    ctx.fillRect(97, 25, 6, 68);
    roundRect(ctx, 22, 40, 84, 5, 2, '#6D4C41', null);
    roundRect(ctx, 22, 65, 84, 5, 2, '#6D4C41', null);
    // sword
    ctx.strokeStyle = '#B0BEC5';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(42, 28); ctx.lineTo(42, 60); ctx.stroke();
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(38, 56, 8, 4);
    ctx.strokeStyle = '#FFD54F';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(36, 56); ctx.lineTo(48, 56); ctx.stroke();
    // axe
    ctx.strokeStyle = '#8D6E63';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(64, 28); ctx.lineTo(64, 62); ctx.stroke();
    ctx.fillStyle = '#78909C';
    ctx.beginPath();
    ctx.moveTo(64, 30); ctx.quadraticCurveTo(78, 36, 64, 45);
    ctx.closePath();
    ctx.fill();
    // spear
    ctx.strokeStyle = '#8D6E63';
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(86, 28); ctx.lineTo(86, 62); ctx.stroke();
    drawTriangle(ctx, 86, 28, 80, 38, 92, 38, '#B0BEC5', null);
    // shield below
    ctx.fillStyle = '#C62828';
    ctx.beginPath();
    ctx.arc(54, 80, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFD54F';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(54, 80, 14, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(54, 80, 8, 0, Math.PI * 2); ctx.stroke();
    // shield boss
    ctx.fillStyle = '#FFD54F';
    ctx.beginPath(); ctx.arc(54, 80, 3, 0, Math.PI * 2); ctx.fill();
    save(c, folder, 'armory');
    count++;
  }

  // --- fortified_wall: stone wall with battlements ---
  {
    const { c, ctx } = makeCanvas();
    buildingBg(ctx, 'combat');
    // main wall
    const wg2 = ctx.createLinearGradient(CX, 40, CX, 95);
    wg2.addColorStop(0, '#757575');
    wg2.addColorStop(1, '#616161');
    ctx.fillStyle = wg2;
    ctx.fillRect(15, 50, 98, 42);
    // battlements (merlons)
    ctx.fillStyle = '#757575';
    for (let bx = 15; bx < 113; bx += 16) {
      ctx.fillRect(bx, 38, 10, 14);
    }
    // stone lines
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    for (let sy = 55; sy < 90; sy += 10) {
      ctx.beginPath(); ctx.moveTo(15, sy); ctx.lineTo(113, sy); ctx.stroke();
    }
    for (let sx = 30; sx < 113; sx += 18) {
      ctx.beginPath(); ctx.moveTo(sx, 50); ctx.lineTo(sx, 92); ctx.stroke();
    }
    // arrow slit
    ctx.fillStyle = '#1A1A1A';
    ctx.fillRect(CX - 2, 60, 4, 16);
    ctx.fillRect(CX - 6, 66, 12, 4);
    // torch on wall
    drawGlow(ctx, 85, 55, 10, 'rgba(255,180,50,0.35)');
    ctx.fillStyle = '#FFC107';
    ctx.beginPath(); ctx.arc(85, 55, 3, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(85, 58); ctx.lineTo(85, 68); ctx.stroke();
    save(c, folder, 'fortified_wall');
    count++;
  }

  // --- medic_tent: tent with red cross ---
  {
    const { c, ctx } = makeCanvas();
    buildingBg(ctx, 'combat');
    // tent body
    const tentGrad = ctx.createLinearGradient(CX, 25, CX, 90);
    tentGrad.addColorStop(0, '#E8E8E8');
    tentGrad.addColorStop(1, '#BDBDBD');
    ctx.fillStyle = tentGrad;
    ctx.beginPath();
    ctx.moveTo(CX, 25);
    ctx.lineTo(100, 85);
    ctx.lineTo(28, 85);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#9E9E9E';
    ctx.lineWidth = 2;
    ctx.stroke();
    // tent opening
    ctx.fillStyle = '#424242';
    ctx.beginPath();
    ctx.moveTo(CX, 55);
    ctx.lineTo(CX + 12, 85);
    ctx.lineTo(CX - 12, 85);
    ctx.closePath();
    ctx.fill();
    // red cross
    ctx.fillStyle = '#F44336';
    ctx.fillRect(CX - 3, 35, 6, 18);
    ctx.fillRect(CX - 9, 41, 18, 6);
    // pole
    ctx.strokeStyle = '#795548';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(CX, 22); ctx.lineTo(CX, 28); ctx.stroke();
    // flag
    ctx.fillStyle = '#F44336';
    ctx.beginPath();
    ctx.moveTo(CX, 22); ctx.lineTo(CX + 14, 25); ctx.lineTo(CX, 28);
    ctx.closePath();
    ctx.fill();
    save(c, folder, 'medic_tent');
    count++;
  }

  // --- barracks: barracks building with bunk beds ---
  {
    const { c, ctx } = makeCanvas();
    buildingBg(ctx, 'worker');
    // building
    const bg3 = ctx.createLinearGradient(CX, 30, CX, 90);
    bg3.addColorStop(0, '#6D4C41');
    bg3.addColorStop(1, '#4E342E');
    roundRect(ctx, 22, 35, 84, 55, 4, null, null);
    ctx.fillStyle = bg3;
    ctx.fill();
    // roof
    ctx.fillStyle = '#3E2723';
    ctx.beginPath();
    ctx.moveTo(18, 38); ctx.lineTo(CX, 18); ctx.lineTo(110, 38);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 2;
    ctx.stroke();
    // door
    roundRect(ctx, CX - 8, 65, 16, 25, 3, '#3E2723', '#5D4037');
    // doorknob
    ctx.fillStyle = '#FFD54F';
    ctx.beginPath(); ctx.arc(CX + 4, 78, 2, 0, Math.PI * 2); ctx.fill();
    // windows (2)
    roundRect(ctx, 30, 48, 16, 14, 2, '#90CAF9', '#5D4037');
    ctx.strokeStyle = '#5D4037'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(38, 48); ctx.lineTo(38, 62); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(30, 55); ctx.lineTo(46, 55); ctx.stroke();
    roundRect(ctx, 82, 48, 16, 14, 2, '#90CAF9', '#5D4037');
    ctx.strokeStyle = '#5D4037'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(90, 48); ctx.lineTo(90, 62); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(82, 55); ctx.lineTo(98, 55); ctx.stroke();
    // window glow
    drawGlow(ctx, 38, 55, 8, 'rgba(255,235,59,0.15)');
    drawGlow(ctx, 90, 55, 8, 'rgba(255,235,59,0.15)');
    save(c, folder, 'barracks');
    count++;
  }

  // --- training_ground: target dummies ---
  {
    const { c, ctx } = makeCanvas();
    buildingBg(ctx, 'worker');
    // ground
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(10, 85, 108, 8);
    // target dummy 1 (center)
    ctx.strokeStyle = '#8D6E63'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(CX, 85); ctx.lineTo(CX, 50); ctx.stroke();
    // crossbar
    ctx.beginPath(); ctx.moveTo(CX - 15, 55); ctx.lineTo(CX + 15, 55); ctx.stroke();
    // head
    ctx.fillStyle = '#D7CCC8';
    ctx.beginPath(); ctx.arc(CX, 42, 8, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#8D6E63'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(CX, 42, 8, 0, Math.PI * 2); ctx.stroke();
    // target on body
    ctx.strokeStyle = '#F44336'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(CX, 68, 8, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#F44336';
    ctx.beginPath(); ctx.arc(CX, 68, 3, 0, Math.PI * 2); ctx.fill();
    // dummy 2 (left, smaller)
    ctx.strokeStyle = '#8D6E63'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(35, 85); ctx.lineTo(35, 58); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(25, 63); ctx.lineTo(45, 63); ctx.stroke();
    ctx.fillStyle = '#D7CCC8';
    ctx.beginPath(); ctx.arc(35, 52, 6, 0, Math.PI * 2); ctx.fill();
    // dummy 3 (right, smaller)
    ctx.strokeStyle = '#8D6E63'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(93, 85); ctx.lineTo(93, 58); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(83, 63); ctx.lineTo(103, 63); ctx.stroke();
    ctx.fillStyle = '#D7CCC8';
    ctx.beginPath(); ctx.arc(93, 52, 6, 0, Math.PI * 2); ctx.fill();
    // arrow stuck in dummy 2
    ctx.strokeStyle = '#FFD54F'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(20, 70); ctx.lineTo(35, 65); ctx.stroke();
    drawTriangle(ctx, 35, 63, 35, 67, 38, 65, '#B0BEC5', null);
    save(c, folder, 'training_ground');
    count++;
  }

  // --- bunkhouse: housing building ---
  {
    const { c, ctx } = makeCanvas();
    buildingBg(ctx, 'worker');
    // building body
    const bh = ctx.createLinearGradient(CX, 35, CX, 92);
    bh.addColorStop(0, '#795548');
    bh.addColorStop(1, '#5D4037');
    roundRect(ctx, 20, 40, 88, 50, 3, null, null);
    ctx.fillStyle = bh;
    ctx.fill();
    // roof
    ctx.fillStyle = '#4E342E';
    ctx.beginPath();
    ctx.moveTo(16, 43); ctx.lineTo(CX, 20); ctx.lineTo(112, 43);
    ctx.closePath();
    ctx.fill();
    // chimney
    ctx.fillStyle = '#616161';
    ctx.fillRect(85, 18, 10, 20);
    // smoke
    ctx.strokeStyle = 'rgba(180,180,180,0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(90, 18);
    ctx.bezierCurveTo(88, 12, 93, 8, 90, 2);
    ctx.stroke();
    // windows (3)
    for (let wx = 28; wx <= 82; wx += 27) {
      roundRect(ctx, wx, 52, 14, 12, 2, '#FFF9C4', '#4E342E');
      ctx.strokeStyle = '#4E342E'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(wx + 7, 52); ctx.lineTo(wx + 7, 64); ctx.stroke();
    }
    // door
    roundRect(ctx, CX - 7, 72, 14, 18, 2, '#3E2723', '#5D4037');
    ctx.fillStyle = '#FFD54F';
    ctx.beginPath(); ctx.arc(CX + 3, 82, 1.5, 0, Math.PI * 2); ctx.fill();
    save(c, folder, 'bunkhouse');
    count++;
  }

  // --- war_room: table with map/strategy ---
  {
    const { c, ctx } = makeCanvas();
    buildingBg(ctx, 'hero');
    // table
    const tbl = ctx.createLinearGradient(CX, 50, CX, 75);
    tbl.addColorStop(0, '#5D4037');
    tbl.addColorStop(1, '#4E342E');
    ctx.save();
    ctx.transform(1, 0, -0.3, 0.6, 20, 30);
    roundRect(ctx, 10, 50, 100, 60, 4, null, null);
    ctx.fillStyle = tbl;
    ctx.fill();
    ctx.restore();
    // simpler table
    ctx.fillStyle = '#5D4037';
    ctx.beginPath();
    ctx.moveTo(25, 55); ctx.lineTo(103, 55); ctx.lineTo(95, 80); ctx.lineTo(33, 80);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#4E342E'; ctx.lineWidth = 2;
    ctx.stroke();
    // map on table
    ctx.fillStyle = '#E8D5B7';
    ctx.beginPath();
    ctx.moveTo(35, 58); ctx.lineTo(93, 58); ctx.lineTo(88, 76); ctx.lineTo(40, 76);
    ctx.closePath();
    ctx.fill();
    // map markings
    ctx.strokeStyle = '#8D6E63'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(45, 62); ctx.bezierCurveTo(55, 60, 65, 68, 80, 64);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(50, 70); ctx.bezierCurveTo(60, 74, 70, 68, 85, 72);
    ctx.stroke();
    // strategy markers
    ctx.fillStyle = '#F44336';
    ctx.beginPath(); ctx.arc(52, 65, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2196F3';
    ctx.beginPath(); ctx.arc(72, 68, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFC107';
    ctx.beginPath(); ctx.arc(62, 72, 3, 0, Math.PI * 2); ctx.fill();
    // table legs
    ctx.fillStyle = '#3E2723';
    ctx.fillRect(30, 80, 5, 14);
    ctx.fillRect(93, 80, 5, 14);
    // candle
    ctx.fillStyle = '#FFF9C4';
    ctx.fillRect(CX - 2, 42, 4, 14);
    drawGlow(ctx, CX, 40, 10, 'rgba(255,200,50,0.35)');
    ctx.fillStyle = '#FF9800';
    ctx.beginPath();
    ctx.moveTo(CX, 36); ctx.quadraticCurveTo(CX + 4, 40, CX, 43);
    ctx.quadraticCurveTo(CX - 4, 40, CX, 36);
    ctx.fill();
    save(c, folder, 'war_room');
    count++;
  }

  // --- sparring_ring: arena/ring ---
  {
    const { c, ctx } = makeCanvas();
    buildingBg(ctx, 'hero');
    // arena floor (ellipse)
    ctx.fillStyle = '#5D4037';
    ctx.beginPath();
    ctx.ellipse(CX, 70, 48, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    // ring ropes (ellipse outlines)
    ctx.strokeStyle = '#FFD54F'; ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(CX, 68, 45, 20, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#FFA000'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(CX, 65, 42, 18, 0, 0, Math.PI * 2);
    ctx.stroke();
    // corner posts
    const posts = [[CX - 40, 68], [CX + 40, 68], [CX - 30, 50], [CX + 30, 50]];
    for (const [px, py] of posts) {
      ctx.fillStyle = '#8D6E63';
      ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
    }
    // crossed swords in center
    ctx.strokeStyle = '#B0BEC5'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(CX - 12, 55); ctx.lineTo(CX + 12, 75); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(CX + 12, 55); ctx.lineTo(CX - 12, 75); ctx.stroke();
    // star burst (gold glow center)
    drawGlow(ctx, CX, 65, 15, 'rgba(255,215,0,0.2)');
    save(c, folder, 'sparring_ring');
    count++;
  }

  // --- trading_post: market stall with goods ---
  {
    const { c, ctx } = makeCanvas();
    buildingBg(ctx, 'economy');
    // awning/canopy
    const aw = ctx.createLinearGradient(CX, 20, CX, 45);
    aw.addColorStop(0, '#EF6C00');
    aw.addColorStop(1, '#E65100');
    ctx.fillStyle = aw;
    ctx.beginPath();
    ctx.moveTo(18, 45); ctx.lineTo(25, 22); ctx.lineTo(103, 22); ctx.lineTo(110, 45);
    ctx.closePath();
    ctx.fill();
    // awning stripes
    ctx.fillStyle = '#FF8F00';
    for (let sx = 25; sx < 103; sx += 16) {
      ctx.beginPath();
      ctx.moveTo(sx, 22); ctx.lineTo(sx + 8, 22);
      const bx1 = sx - 1; const bx2 = sx + 9;
      ctx.lineTo(bx2, 45); ctx.lineTo(bx1, 45);
      ctx.closePath();
      ctx.fill();
    }
    // counter
    roundRect(ctx, 22, 45, 84, 10, 2, '#795548', '#4E342E');
    // goods on counter
    // crate
    roundRect(ctx, 30, 35, 12, 10, 1, '#8D6E63', '#5D4037');
    // bottle
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(55, 32, 6, 13);
    ctx.fillRect(57, 28, 2, 5);
    // bag
    ctx.fillStyle = '#FFD54F';
    ctx.beginPath();
    ctx.arc(80, 40, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#F9A825'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(80, 40, 7, 0, Math.PI * 2); ctx.stroke();
    // poles
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(22, 22, 4, 68);
    ctx.fillRect(102, 22, 4, 68);
    // shelves below
    roundRect(ctx, 22, 65, 84, 4, 1, '#6D4C41', null);
    // items on shelf
    ctx.fillStyle = '#90CAF9';
    ctx.beginPath(); ctx.arc(40, 62, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#EF5350';
    ctx.beginPath(); ctx.arc(60, 62, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#AB47BC';
    ctx.beginPath(); ctx.arc(80, 62, 4, 0, Math.PI * 2); ctx.fill();
    save(c, folder, 'trading_post');
    count++;
  }

  // --- supply_depot: warehouse crates ---
  {
    const { c, ctx } = makeCanvas();
    buildingBg(ctx, 'economy');
    // warehouse structure
    ctx.fillStyle = '#546E7A';
    ctx.fillRect(20, 38, 88, 52);
    // roof
    ctx.fillStyle = '#37474F';
    ctx.beginPath();
    ctx.moveTo(16, 40); ctx.lineTo(CX, 20); ctx.lineTo(112, 40);
    ctx.closePath();
    ctx.fill();
    // bay door
    ctx.fillStyle = '#263238';
    ctx.fillRect(35, 55, 58, 35);
    // rolling door lines
    ctx.strokeStyle = '#37474F'; ctx.lineWidth = 1;
    for (let dy = 60; dy < 90; dy += 5) {
      ctx.beginPath(); ctx.moveTo(35, dy); ctx.lineTo(93, dy); ctx.stroke();
    }
    // crates inside
    roundRect(ctx, 42, 68, 16, 16, 2, '#8D6E63', '#5D4037');
    roundRect(ctx, 62, 68, 16, 16, 2, '#795548', '#4E342E');
    roundRect(ctx, 50, 54, 18, 14, 2, '#A1887F', '#6D4C41');
    // crate markings
    ctx.strokeStyle = '#4E342E'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(42, 68); ctx.lineTo(58, 84); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(58, 68); ctx.lineTo(42, 84); ctx.stroke();
    // forklift marks on ground
    ctx.strokeStyle = '#455A64'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(40, 90); ctx.lineTo(55, 90); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(65, 90); ctx.lineTo(80, 90); ctx.stroke();
    save(c, folder, 'supply_depot');
    count++;
  }

  // --- radio_tower: tall antenna tower ---
  {
    const { c, ctx } = makeCanvas();
    buildingBg(ctx, 'special');
    // tower legs (triangular lattice)
    ctx.strokeStyle = '#78909C'; ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(CX, 12); ctx.lineTo(CX - 25, 92);
    ctx.moveTo(CX, 12); ctx.lineTo(CX + 25, 92);
    ctx.stroke();
    // cross braces
    ctx.strokeStyle = '#607D8B'; ctx.lineWidth = 1.5;
    for (let i = 1; i <= 5; i++) {
      const t = i / 6;
      const lx = CX - 25 * t, rx = CX + 25 * t;
      const y = 12 + 80 * t;
      ctx.beginPath(); ctx.moveTo(lx, y); ctx.lineTo(rx, y); ctx.stroke();
      if (i < 5) {
        const t2 = (i + 1) / 6;
        const lx2 = CX - 25 * t2, rx2 = CX + 25 * t2;
        const y2 = 12 + 80 * t2;
        ctx.beginPath(); ctx.moveTo(lx, y); ctx.lineTo(rx2, y2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(rx, y); ctx.lineTo(lx2, y2); ctx.stroke();
      }
    }
    // antenna tip
    ctx.fillStyle = '#F44336';
    ctx.beginPath(); ctx.arc(CX, 12, 4, 0, Math.PI * 2); ctx.fill();
    drawGlow(ctx, CX, 12, 10, 'rgba(244,67,54,0.3)');
    // radio waves
    ctx.strokeStyle = 'rgba(129,212,250,0.4)'; ctx.lineWidth = 1.5;
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(CX, 12, 8 + i * 8, -Math.PI * 0.6, -Math.PI * 0.1);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(CX, 12, 8 + i * 8, Math.PI * 0.1 + Math.PI, Math.PI * 0.6 + Math.PI);
      ctx.stroke();
    }
    // base platform
    roundRect(ctx, CX - 30, 90, 60, 6, 2, '#546E7A', '#37474F');
    save(c, folder, 'radio_tower');
    count++;
  }

  // --- infirmary: hospital building with cross ---
  {
    const { c, ctx } = makeCanvas();
    buildingBg(ctx, 'special');
    // building
    const inf = ctx.createLinearGradient(CX, 30, CX, 92);
    inf.addColorStop(0, '#E0E0E0');
    inf.addColorStop(1, '#BDBDBD');
    roundRect(ctx, 22, 35, 84, 55, 4, null, null);
    ctx.fillStyle = inf;
    ctx.fill();
    ctx.strokeStyle = '#9E9E9E'; ctx.lineWidth = 2;
    ctx.stroke();
    // roof
    ctx.fillStyle = '#7B1FA2';
    ctx.beginPath();
    ctx.moveTo(18, 38); ctx.lineTo(CX, 18); ctx.lineTo(110, 38);
    ctx.closePath();
    ctx.fill();
    // red cross
    ctx.fillStyle = '#F44336';
    ctx.fillRect(CX - 4, 22, 8, 14);
    ctx.fillRect(CX - 8, 26, 16, 6);
    // door
    roundRect(ctx, CX - 10, 65, 20, 25, 3, '#7B1FA2', '#4A148C');
    // windows
    roundRect(ctx, 28, 48, 16, 14, 2, '#E3F2FD', '#9E9E9E');
    roundRect(ctx, 84, 48, 16, 14, 2, '#E3F2FD', '#9E9E9E');
    // heartbeat line in window
    ctx.strokeStyle = '#4CAF50'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(30, 55); ctx.lineTo(33, 55); ctx.lineTo(35, 50); ctx.lineTo(37, 58);
    ctx.lineTo(39, 52); ctx.lineTo(42, 55);
    ctx.stroke();
    save(c, folder, 'infirmary');
    count++;
  }

  // --- watchtower: tall observation tower ---
  {
    const { c, ctx } = makeCanvas();
    buildingBg(ctx, 'special');
    // tower body
    const tw = ctx.createLinearGradient(CX, 15, CX, 92);
    tw.addColorStop(0, '#6D4C41');
    tw.addColorStop(1, '#4E342E');
    ctx.fillStyle = tw;
    ctx.fillRect(CX - 14, 30, 28, 62);
    // observation platform
    roundRect(ctx, CX - 22, 28, 44, 8, 2, '#5D4037', '#3E2723');
    // roof
    ctx.fillStyle = '#3E2723';
    ctx.beginPath();
    ctx.moveTo(CX - 24, 30); ctx.lineTo(CX, 12); ctx.lineTo(CX + 24, 30);
    ctx.closePath();
    ctx.fill();
    // railing
    ctx.strokeStyle = '#8D6E63'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(CX - 22, 28); ctx.lineTo(CX - 22, 22);
    ctx.moveTo(CX + 22, 28); ctx.lineTo(CX + 22, 22);
    ctx.moveTo(CX - 22, 22); ctx.lineTo(CX + 22, 22);
    ctx.stroke();
    // window
    roundRect(ctx, CX - 6, 42, 12, 14, 2, '#FFF9C4', '#5D4037');
    drawGlow(ctx, CX, 49, 8, 'rgba(255,235,59,0.15)');
    // window lower
    roundRect(ctx, CX - 6, 65, 12, 10, 2, '#FFF9C4', '#5D4037');
    // spotlight beam
    ctx.fillStyle = 'rgba(255,235,150,0.08)';
    ctx.beginPath();
    ctx.moveTo(CX - 4, 22);
    ctx.lineTo(CX - 35, 0);
    ctx.lineTo(CX + 15, 0);
    ctx.lineTo(CX + 4, 22);
    ctx.closePath();
    ctx.fill();
    // base
    roundRect(ctx, CX - 18, 88, 36, 6, 2, '#3E2723', null);
    save(c, folder, 'watchtower');
    count++;
  }

  console.log(`  Buildings: ${count} icons generated.`);
  return count;
}


// ══════════════════════════════════════════════════
// PART 2: SKILL ICONS (11)
// ══════════════════════════════════════════════════
const SKILL_CATEGORIES = {
  gathering: { bg: '#0A2A0A', accent: '#1A4A1A', ring: '#4CAF50' },
  production: { bg: '#2A1A0A', accent: '#4A2A0A', ring: '#FF9800' },
  combat: { bg: '#2A0A0A', accent: '#4A1A1A', ring: '#F44336' },
};

function skillBg(ctx, cat) {
  const c = SKILL_CATEGORIES[cat];
  drawBg(ctx, c.bg, c.accent);
  // circular ring
  ctx.strokeStyle = c.ring;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(CX, CY, 50, 0, Math.PI * 2);
  ctx.stroke();
}

function drawSkills() {
  const folder = 'skills-128';
  let count = 0;

  // --- scavenging: hand grabbing scrap ---
  {
    const { c, ctx } = makeCanvas();
    skillBg(ctx, 'gathering');
    // hand (open palm grabbing)
    ctx.strokeStyle = '#D7CCC8'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    // palm
    ctx.fillStyle = '#BCAAA4';
    ctx.beginPath();
    ctx.moveTo(50, 80); ctx.quadraticCurveTo(45, 60, 50, 50);
    ctx.lineTo(78, 50); ctx.quadraticCurveTo(83, 60, 78, 80);
    ctx.closePath();
    ctx.fill();
    // fingers
    ctx.strokeStyle = '#BCAAA4'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(52, 52); ctx.quadraticCurveTo(48, 38, 45, 30); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(58, 50); ctx.quadraticCurveTo(56, 35, 54, 28); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(66, 50); ctx.quadraticCurveTo(66, 34, 66, 26); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(74, 52); ctx.quadraticCurveTo(78, 38, 80, 32); ctx.stroke();
    // scrap pieces
    ctx.fillStyle = '#FF8F00';
    ctx.save(); ctx.translate(62, 62); ctx.rotate(0.3);
    ctx.fillRect(-5, -3, 10, 6);
    ctx.restore();
    ctx.fillStyle = '#9E9E9E';
    ctx.beginPath(); ctx.arc(55, 68, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#795548';
    ctx.save(); ctx.translate(70, 66); ctx.rotate(-0.4);
    ctx.fillRect(-4, -4, 8, 8);
    ctx.restore();
    save(c, folder, 'scavenging');
    count++;
  }

  // --- foraging: basket with herbs ---
  {
    const { c, ctx } = makeCanvas();
    skillBg(ctx, 'gathering');
    // basket body
    ctx.fillStyle = '#8D6E63';
    ctx.beginPath();
    ctx.moveTo(38, 55); ctx.quadraticCurveTo(35, 85, 40, 88);
    ctx.lineTo(88, 88); ctx.quadraticCurveTo(93, 85, 90, 55);
    ctx.closePath();
    ctx.fill();
    // basket weave lines
    ctx.strokeStyle = '#6D4C41'; ctx.lineWidth = 1;
    for (let by = 60; by < 88; by += 6) {
      ctx.beginPath(); ctx.moveTo(38, by); ctx.lineTo(90, by); ctx.stroke();
    }
    // basket handle
    ctx.strokeStyle = '#795548'; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(CX, 48, 22, Math.PI, 0);
    ctx.stroke();
    // herbs/plants sticking out
    ctx.strokeStyle = '#4CAF50'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(48, 55); ctx.quadraticCurveTo(45, 38, 42, 30); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(55, 55); ctx.quadraticCurveTo(55, 35, 52, 25); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(70, 55); ctx.quadraticCurveTo(72, 38, 78, 28); ctx.stroke();
    // leaves
    ctx.fillStyle = '#66BB6A';
    ctx.beginPath(); ctx.ellipse(42, 30, 5, 3, -0.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#81C784';
    ctx.beginPath(); ctx.ellipse(52, 25, 4, 3, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#43A047';
    ctx.beginPath(); ctx.ellipse(78, 28, 5, 3, 0.5, 0, Math.PI * 2); ctx.fill();
    // berries
    ctx.fillStyle = '#E53935';
    ctx.beginPath(); ctx.arc(62, 52, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(66, 50, 2.5, 0, Math.PI * 2); ctx.fill();
    save(c, folder, 'foraging');
    count++;
  }

  // --- salvage_hunting: magnifying glass over scrap ---
  {
    const { c, ctx } = makeCanvas();
    skillBg(ctx, 'gathering');
    // scrap pile
    ctx.fillStyle = '#757575';
    ctx.beginPath();
    ctx.moveTo(30, 90); ctx.lineTo(35, 65); ctx.lineTo(55, 60); ctx.lineTo(75, 65);
    ctx.lineTo(98, 70); ctx.lineTo(98, 90);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#8D6E63';
    ctx.save(); ctx.translate(50, 72); ctx.rotate(0.2);
    ctx.fillRect(-8, -4, 16, 8);
    ctx.restore();
    ctx.fillStyle = '#FF8F00';
    ctx.save(); ctx.translate(70, 75); ctx.rotate(-0.3);
    ctx.fillRect(-6, -5, 12, 10);
    ctx.restore();
    // magnifying glass
    ctx.strokeStyle = '#FDD835'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(55, 45, 18, 0, Math.PI * 2); ctx.stroke();
    // glass fill
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath(); ctx.arc(55, 45, 16, 0, Math.PI * 2); ctx.fill();
    // handle
    ctx.strokeStyle = '#5D4037'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(68, 58); ctx.lineTo(82, 72); ctx.stroke();
    // lens glint
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(50, 40, 10, -1.2, -0.5); ctx.stroke();
    save(c, folder, 'salvage_hunting');
    count++;
  }

  // --- water_reclamation: water drops + filter ---
  {
    const { c, ctx } = makeCanvas();
    skillBg(ctx, 'gathering');
    // funnel/filter
    ctx.fillStyle = '#78909C';
    ctx.beginPath();
    ctx.moveTo(40, 35); ctx.lineTo(88, 35); ctx.lineTo(70, 65); ctx.lineTo(58, 65);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#546E7A'; ctx.lineWidth = 2;
    ctx.stroke();
    // filter lines
    ctx.strokeStyle = '#607D8B'; ctx.lineWidth = 1;
    for (let fy = 40; fy < 62; fy += 5) {
      const left = 40 + (58 - 40) * ((fy - 35) / 30);
      const right = 88 - (88 - 70) * ((fy - 35) / 30);
      ctx.beginPath(); ctx.moveTo(left, fy); ctx.lineTo(right, fy); ctx.stroke();
    }
    // pipe below
    ctx.fillStyle = '#607D8B';
    ctx.fillRect(CX - 3, 65, 6, 10);
    // water drops falling
    for (let i = 0; i < 3; i++) {
      const dy = 80 + i * 8;
      const dx = CX + (i - 1) * 5;
      const dg = ctx.createRadialGradient(dx, dy, 0, dx, dy, 5);
      dg.addColorStop(0, '#42A5F5');
      dg.addColorStop(1, '#1565C0');
      ctx.fillStyle = dg;
      ctx.beginPath();
      ctx.moveTo(dx, dy - 5);
      ctx.quadraticCurveTo(dx + 5, dy, dx, dy + 5);
      ctx.quadraticCurveTo(dx - 5, dy, dx, dy - 5);
      ctx.fill();
    }
    // dirty water going in
    ctx.fillStyle = 'rgba(139,119,101,0.5)';
    ctx.beginPath(); ctx.arc(55, 30, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(68, 28, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(121,85,72,0.5)';
    ctx.beginPath(); ctx.arc(75, 32, 3.5, 0, Math.PI * 2); ctx.fill();
    save(c, folder, 'water_reclamation');
    count++;
  }

  // --- prospecting: pickaxe + gems ---
  {
    const { c, ctx } = makeCanvas();
    skillBg(ctx, 'gathering');
    // pickaxe handle
    ctx.strokeStyle = '#8D6E63'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(35, 88); ctx.lineTo(80, 35); ctx.stroke();
    // pickaxe head
    ctx.fillStyle = '#78909C';
    ctx.beginPath();
    ctx.moveTo(80, 35); ctx.quadraticCurveTo(95, 25, 98, 30);
    ctx.lineTo(88, 40);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(80, 35); ctx.quadraticCurveTo(68, 22, 65, 25);
    ctx.lineTo(72, 38);
    ctx.closePath();
    ctx.fill();
    // gems/crystals
    ctx.fillStyle = '#7C4DFF';
    ctx.beginPath();
    ctx.moveTo(42, 60); ctx.lineTo(48, 50); ctx.lineTo(54, 60); ctx.lineTo(48, 65);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#00E5FF';
    ctx.beginPath();
    ctx.moveTo(55, 72); ctx.lineTo(59, 65); ctx.lineTo(63, 72); ctx.lineTo(59, 76);
    ctx.closePath();
    ctx.fill();
    // sparkle
    drawStar(ctx, 50, 48, 4, 2, 4, '#FFFFFF');
    save(c, folder, 'prospecting');
    count++;
  }

  // --- cooking: pot with steam ---
  {
    const { c, ctx } = makeCanvas();
    skillBg(ctx, 'production');
    // pot body
    const pg = ctx.createLinearGradient(38, 50, 90, 50);
    pg.addColorStop(0, '#546E7A');
    pg.addColorStop(0.5, '#78909C');
    pg.addColorStop(1, '#546E7A');
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.moveTo(38, 50); ctx.lineTo(35, 85); ctx.quadraticCurveTo(CX, 92, 93, 85);
    ctx.lineTo(90, 50);
    ctx.closePath();
    ctx.fill();
    // pot rim
    roundRect(ctx, 34, 48, 60, 6, 3, '#607D8B', '#455A64');
    // handles
    ctx.strokeStyle = '#455A64'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(34, 58, 6, Math.PI * 0.5, Math.PI * 1.5); ctx.stroke();
    ctx.beginPath(); ctx.arc(94, 58, 6, -Math.PI * 0.5, Math.PI * 0.5); ctx.stroke();
    // fire beneath
    for (let i = 0; i < 4; i++) {
      const fx = 45 + i * 12;
      const fh = 8 + Math.sin(i * 1.5) * 4;
      const fg2 = ctx.createLinearGradient(fx, 92, fx, 92 - fh);
      fg2.addColorStop(0, '#FF6F00');
      fg2.addColorStop(1, '#FFC107');
      ctx.fillStyle = fg2;
      ctx.beginPath();
      ctx.moveTo(fx - 4, 92);
      ctx.quadraticCurveTo(fx, 92 - fh, fx + 4, 92);
      ctx.fill();
    }
    // steam wisps
    ctx.strokeStyle = 'rgba(200,200,200,0.35)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const sx = 48 + i * 14;
      ctx.beginPath();
      ctx.moveTo(sx, 46);
      ctx.bezierCurveTo(sx - 4, 38, sx + 4, 30, sx - 2, 22);
      ctx.stroke();
    }
    save(c, folder, 'cooking');
    count++;
  }

  // --- tinkering: gears + wrench ---
  {
    const { c, ctx } = makeCanvas();
    skillBg(ctx, 'production');
    // large gear
    function drawGear(ctx2, cx2, cy2, outerR, innerR, teeth, color) {
      ctx2.strokeStyle = color; ctx2.lineWidth = 2.5;
      ctx2.beginPath(); ctx2.arc(cx2, cy2, innerR, 0, Math.PI * 2); ctx2.stroke();
      for (let i = 0; i < teeth; i++) {
        const a = (Math.PI * 2 * i) / teeth;
        ctx2.beginPath();
        ctx2.moveTo(cx2 + innerR * Math.cos(a), cy2 + innerR * Math.sin(a));
        ctx2.lineTo(cx2 + outerR * Math.cos(a), cy2 + outerR * Math.sin(a));
        ctx2.stroke();
      }
    }
    drawGear(ctx, 50, 55, 22, 15, 8, '#FF9800');
    drawGear(ctx, 82, 48, 16, 10, 6, '#FFA726');
    drawGear(ctx, 70, 78, 12, 8, 6, '#FFB74D');
    // center dots
    ctx.fillStyle = '#E65100';
    ctx.beginPath(); ctx.arc(50, 55, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(82, 48, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(70, 78, 2.5, 0, Math.PI * 2); ctx.fill();
    // wrench
    ctx.strokeStyle = '#BDBDBD'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(30, 85); ctx.lineTo(50, 55); ctx.stroke();
    ctx.strokeStyle = '#9E9E9E'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(27, 88, 5, 0, Math.PI * 2); ctx.stroke();
    save(c, folder, 'tinkering');
    count++;
  }

  // --- weaponsmithing: forge + sword ---
  {
    const { c, ctx } = makeCanvas();
    skillBg(ctx, 'production');
    // anvil
    ctx.fillStyle = '#616161';
    ctx.beginPath();
    ctx.moveTo(30, 90); ctx.lineTo(38, 70); ctx.lineTo(90, 70); ctx.lineTo(98, 90);
    ctx.closePath();
    ctx.fill();
    roundRect(ctx, 35, 64, 58, 8, 3, '#757575', '#424242');
    // sword on anvil (glowing)
    drawGlow(ctx, CX, 62, 20, 'rgba(255,140,0,0.25)');
    ctx.strokeStyle = '#FF8F00'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(40, 62); ctx.lineTo(88, 62); ctx.stroke();
    // sword guard
    ctx.strokeStyle = '#FFD54F'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(85, 56); ctx.lineTo(85, 68); ctx.stroke();
    // sword handle
    ctx.strokeStyle = '#8D6E63'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(88, 62); ctx.lineTo(98, 62); ctx.stroke();
    // flames beneath
    for (let i = 0; i < 5; i++) {
      const fx = 40 + i * 12;
      const fg2 = ctx.createLinearGradient(fx, 92, fx, 78);
      fg2.addColorStop(0, '#BF360C');
      fg2.addColorStop(0.5, '#FF6F00');
      fg2.addColorStop(1, '#FFCA28');
      ctx.fillStyle = fg2;
      ctx.beginPath();
      ctx.moveTo(fx - 5, 92);
      ctx.quadraticCurveTo(fx, 78 + Math.sin(i) * 4, fx + 5, 92);
      ctx.fill();
    }
    // sparks
    ctx.fillStyle = '#FFCA28';
    for (let i = 0; i < 6; i++) {
      const sx2 = CX + Math.cos(i * 1.1) * (10 + i * 5);
      const sy2 = 55 - Math.sin(i * 1.1) * (5 + i * 4);
      ctx.beginPath(); ctx.arc(sx2, sy2, 1.5, 0, Math.PI * 2); ctx.fill();
    }
    // hammer
    ctx.strokeStyle = '#6D4C41'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(55, 50); ctx.lineTo(42, 35); ctx.stroke();
    ctx.fillStyle = '#78909C';
    ctx.save(); ctx.translate(42, 35); ctx.rotate(-0.7);
    roundRect(ctx, -8, -5, 16, 10, 2, '#78909C', null);
    ctx.restore();
    save(c, folder, 'weaponsmithing');
    count++;
  }

  // --- armorcrafting: shield + leather ---
  {
    const { c, ctx } = makeCanvas();
    skillBg(ctx, 'production');
    // shield shape
    ctx.fillStyle = '#607D8B';
    ctx.beginPath();
    ctx.moveTo(CX, 25);
    ctx.quadraticCurveTo(CX + 35, 28, CX + 35, 50);
    ctx.quadraticCurveTo(CX + 30, 80, CX, 95);
    ctx.quadraticCurveTo(CX - 30, 80, CX - 35, 50);
    ctx.quadraticCurveTo(CX - 35, 28, CX, 25);
    ctx.closePath();
    ctx.fill();
    // shield trim
    ctx.strokeStyle = '#FFB300'; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(CX, 28);
    ctx.quadraticCurveTo(CX + 32, 30, CX + 32, 50);
    ctx.quadraticCurveTo(CX + 27, 78, CX, 92);
    ctx.quadraticCurveTo(CX - 27, 78, CX - 32, 50);
    ctx.quadraticCurveTo(CX - 32, 30, CX, 28);
    ctx.stroke();
    // center cross
    ctx.strokeStyle = '#FFD54F'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(CX, 35); ctx.lineTo(CX, 85); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(CX - 25, 55); ctx.lineTo(CX + 25, 55); ctx.stroke();
    // rivets
    ctx.fillStyle = '#FFCA28';
    const rivets = [[CX, 35], [CX, 85], [CX - 25, 55], [CX + 25, 55]];
    for (const [rx, ry] of rivets) {
      ctx.beginPath(); ctx.arc(rx, ry, 3, 0, Math.PI * 2); ctx.fill();
    }
    // needle + thread (stitching)
    ctx.strokeStyle = '#D7CCC8'; ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(CX + 30, 40); ctx.lineTo(CX + 38, 32);
    ctx.stroke();
    ctx.setLineDash([]);
    // needle
    ctx.strokeStyle = '#E0E0E0'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(CX + 38, 32); ctx.lineTo(CX + 42, 28); ctx.stroke();
    save(c, folder, 'armorcrafting');
    count++;
  }

  // --- biochemistry: DNA helix + flask ---
  {
    const { c, ctx } = makeCanvas();
    skillBg(ctx, 'production');
    // DNA helix
    ctx.strokeStyle = '#4CAF50'; ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let t = 0; t < 60; t++) {
      const y = 25 + t;
      const x = CX - 10 + Math.sin(t * 0.15) * 18;
      if (t === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.strokeStyle = '#81C784'; ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let t = 0; t < 60; t++) {
      const y = 25 + t;
      const x = CX - 10 - Math.sin(t * 0.15) * 18;
      if (t === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    // rungs
    ctx.strokeStyle = 'rgba(165,214,167,0.5)'; ctx.lineWidth = 1.5;
    for (let t = 5; t < 60; t += 8) {
      const y = 25 + t;
      const x1 = CX - 10 + Math.sin(t * 0.15) * 18;
      const x2 = CX - 10 - Math.sin(t * 0.15) * 18;
      ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
    }
    // flask on right
    ctx.strokeStyle = 'rgba(200,230,255,0.6)'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(88, 45); ctx.lineTo(88, 55);
    ctx.quadraticCurveTo(88, 75, 78, 80);
    ctx.lineTo(98, 80);
    ctx.quadraticCurveTo(108, 75, 98, 55);
    ctx.lineTo(98, 45);
    ctx.closePath();
    ctx.stroke();
    // liquid
    ctx.fillStyle = 'rgba(76,175,80,0.4)';
    ctx.beginPath();
    ctx.moveTo(82, 65);
    ctx.quadraticCurveTo(82, 78, 78, 80);
    ctx.lineTo(98, 80);
    ctx.quadraticCurveTo(104, 78, 104, 65);
    ctx.closePath();
    ctx.fill();
    save(c, folder, 'biochemistry');
    count++;
  }

  // --- close_combat: fist ---
  {
    const { c, ctx } = makeCanvas();
    skillBg(ctx, 'combat');
    drawGlow(ctx, CX, CY, 30, 'rgba(244,67,54,0.15)');
    // fist (clenched, from front)
    ctx.fillStyle = '#BCAAA4';
    // main fist block
    roundRect(ctx, 42, 45, 44, 35, 8, '#BCAAA4', null);
    // thumb
    ctx.beginPath();
    ctx.moveTo(42, 58); ctx.quadraticCurveTo(35, 55, 35, 62);
    ctx.quadraticCurveTo(35, 70, 42, 68);
    ctx.closePath();
    ctx.fillStyle = '#D7CCC8';
    ctx.fill();
    // finger lines
    ctx.strokeStyle = '#8D6E63'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(52, 45); ctx.lineTo(52, 55); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(60, 45); ctx.lineTo(60, 55); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(68, 45); ctx.lineTo(68, 55); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(76, 45); ctx.lineTo(76, 55); ctx.stroke();
    // knuckle highlights
    ctx.fillStyle = '#D7CCC8';
    for (let kx = 48; kx <= 80; kx += 10) {
      ctx.beginPath(); ctx.ellipse(kx, 46, 4, 3, 0, 0, Math.PI); ctx.fill();
    }
    // wrist
    ctx.fillStyle = '#BCAAA4';
    ctx.fillRect(48, 80, 32, 15);
    // impact lines
    ctx.strokeStyle = 'rgba(244,67,54,0.5)'; ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const a = -0.8 + i * 0.4;
      ctx.beginPath();
      ctx.moveTo(CX + 28 * Math.cos(a), 50 + 28 * Math.sin(a));
      ctx.lineTo(CX + 38 * Math.cos(a), 50 + 38 * Math.sin(a));
      ctx.stroke();
    }
    save(c, folder, 'close_combat');
    count++;
  }

  console.log(`  Skills: ${count} icons generated.`);
  return count;
}


// ══════════════════════════════════════════════════
// PART 3: ABILITY ICONS (78)
// ══════════════════════════════════════════════════
const ABILITY_COLORS = {
  r: { bg: '#2A0A0A', accent: '#4A1A1A', ring: '#F44336', glow: 'rgba(244,67,54,0.2)' },
  g: { bg: '#0A2A0A', accent: '#1A4A1A', ring: '#4CAF50', glow: 'rgba(76,175,80,0.2)' },
  b: { bg: '#0A0A2A', accent: '#1A1A4A', ring: '#2196F3', glow: 'rgba(33,150,243,0.2)' },
  w: { bg: '#1A1A1A', accent: '#2A2A2A', ring: '#E0E0E0', glow: 'rgba(224,224,224,0.15)' },
  o: { bg: '#2A1A0A', accent: '#4A2A0A', ring: '#FF9800', glow: 'rgba(255,152,0,0.2)' },
  p: { bg: '#1A0A2A', accent: '#2A1A4A', ring: '#AB47BC', glow: 'rgba(171,71,188,0.2)' },
};

function abilityBg(ctx, colorKey) {
  const c = ABILITY_COLORS[colorKey];
  drawBg(ctx, c.bg, c.accent);
  drawGlow(ctx, CX, CY, 40, c.glow);
  // diamond frame
  ctx.strokeStyle = c.ring; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(CX, 8); ctx.lineTo(SIZE - 8, CY); ctx.lineTo(CX, SIZE - 8); ctx.lineTo(8, CY);
  ctx.closePath();
  ctx.stroke();
}

/** Generic symbol drawers for abilities */
const sym = {
  sword(ctx, cx2, cy2, len, angle, color) {
    ctx.save(); ctx.translate(cx2, cy2); ctx.rotate(angle);
    ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, -len / 2); ctx.lineTo(0, len / 2); ctx.stroke();
    ctx.strokeStyle = '#FFD54F'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-6, len / 2 - 6); ctx.lineTo(6, len / 2 - 6); ctx.stroke();
    ctx.restore();
  },
  fist(ctx, cx2, cy2, size, color) {
    ctx.fillStyle = color;
    roundRect(ctx, cx2 - size / 2, cy2 - size / 2, size, size * 0.8, size / 4, color, null);
    ctx.strokeStyle = darken(color.replace('rgb', '').replace('(', '#').slice(0, 7) || '#555', 30);
  },
  shield(ctx, cx2, cy2, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx2, cy2 - size);
    ctx.quadraticCurveTo(cx2 + size, cy2 - size * 0.8, cx2 + size, cy2);
    ctx.quadraticCurveTo(cx2 + size * 0.7, cy2 + size, cx2, cy2 + size * 1.2);
    ctx.quadraticCurveTo(cx2 - size * 0.7, cy2 + size, cx2 - size, cy2);
    ctx.quadraticCurveTo(cx2 - size, cy2 - size * 0.8, cx2, cy2 - size);
    ctx.closePath();
    ctx.fill();
  },
  explosion(ctx, cx2, cy2, size, color) {
    const pts = 8;
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < pts * 2; i++) {
      const r = i % 2 === 0 ? size : size * 0.5;
      const angle = (Math.PI * i) / pts;
      const x = cx2 + r * Math.cos(angle);
      const y = cy2 + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  },
  arrow(ctx, cx2, cy2, len, angle, color) {
    ctx.save(); ctx.translate(cx2, cy2); ctx.rotate(angle);
    ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, len / 2); ctx.lineTo(0, -len / 2); ctx.stroke();
    // arrowhead
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -len / 2 - 4); ctx.lineTo(-5, -len / 2 + 4); ctx.lineTo(5, -len / 2 + 4);
    ctx.closePath();
    ctx.fill();
    // fletching
    ctx.beginPath();
    ctx.moveTo(-3, len / 2); ctx.lineTo(0, len / 2 - 4); ctx.lineTo(3, len / 2);
    ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.stroke();
    ctx.restore();
  },
  cross(ctx, cx2, cy2, size, color) {
    ctx.fillStyle = color;
    ctx.fillRect(cx2 - size * 0.2, cy2 - size, size * 0.4, size * 2);
    ctx.fillRect(cx2 - size, cy2 - size * 0.2, size * 2, size * 0.4);
  },
  heart(ctx, cx2, cy2, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx2, cy2 + size * 0.6);
    ctx.bezierCurveTo(cx2 - size * 1.2, cy2 - size * 0.2, cx2 - size * 0.5, cy2 - size, cx2, cy2 - size * 0.4);
    ctx.bezierCurveTo(cx2 + size * 0.5, cy2 - size, cx2 + size * 1.2, cy2 - size * 0.2, cx2, cy2 + size * 0.6);
    ctx.closePath();
    ctx.fill();
  },
  circle(ctx, cx2, cy2, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(cx2, cy2, r, 0, Math.PI * 2); ctx.fill();
  },
  skull(ctx, cx2, cy2, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx2, cy2 - size * 0.15, size * 0.7, 0, Math.PI * 2);
    ctx.fill();
    // jaw
    ctx.beginPath();
    ctx.moveTo(cx2 - size * 0.45, cy2 + size * 0.2);
    ctx.quadraticCurveTo(cx2, cy2 + size * 0.8, cx2 + size * 0.45, cy2 + size * 0.2);
    ctx.fill();
    // eye sockets
    ctx.fillStyle = ABILITY_COLORS.r.bg;
    ctx.beginPath(); ctx.arc(cx2 - size * 0.22, cy2 - size * 0.15, size * 0.15, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx2 + size * 0.22, cy2 - size * 0.15, size * 0.15, 0, Math.PI * 2); ctx.fill();
  },
  crown(ctx, cx2, cy2, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx2 - size, cy2 + size * 0.4);
    ctx.lineTo(cx2 - size, cy2 - size * 0.2);
    ctx.lineTo(cx2 - size * 0.5, cy2 + size * 0.1);
    ctx.lineTo(cx2, cy2 - size * 0.5);
    ctx.lineTo(cx2 + size * 0.5, cy2 + size * 0.1);
    ctx.lineTo(cx2 + size, cy2 - size * 0.2);
    ctx.lineTo(cx2 + size, cy2 + size * 0.4);
    ctx.closePath();
    ctx.fill();
    // jewels
    ctx.fillStyle = '#E0E0E0';
    ctx.beginPath(); ctx.arc(cx2, cy2 - size * 0.35, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx2 - size * 0.5, cy2, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx2 + size * 0.5, cy2, 2, 0, Math.PI * 2); ctx.fill();
  },
  bomb(ctx, cx2, cy2, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(cx2, cy2, size, 0, Math.PI * 2); ctx.fill();
    // fuse
    ctx.strokeStyle = '#8D6E63'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx2 + size * 0.5, cy2 - size * 0.7);
    ctx.quadraticCurveTo(cx2 + size, cy2 - size * 1.2, cx2 + size * 0.3, cy2 - size * 1.3);
    ctx.stroke();
    // spark at fuse end
    ctx.fillStyle = '#FFC107';
    ctx.beginPath(); ctx.arc(cx2 + size * 0.3, cy2 - size * 1.3, 3, 0, Math.PI * 2); ctx.fill();
  },
  eye(ctx, cx2, cy2, size, color) {
    // eye outline
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx2 - size, cy2);
    ctx.quadraticCurveTo(cx2, cy2 - size * 0.7, cx2 + size, cy2);
    ctx.quadraticCurveTo(cx2, cy2 + size * 0.7, cx2 - size, cy2);
    ctx.closePath();
    ctx.fill();
    // iris
    ctx.fillStyle = '#263238';
    ctx.beginPath(); ctx.arc(cx2, cy2, size * 0.35, 0, Math.PI * 2); ctx.fill();
    // pupil
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(cx2, cy2, size * 0.15, 0, Math.PI * 2); ctx.fill();
    // glint
    ctx.fillStyle = '#FFF';
    ctx.beginPath(); ctx.arc(cx2 + size * 0.1, cy2 - size * 0.1, size * 0.08, 0, Math.PI * 2); ctx.fill();
  },
  crosshair(ctx, cx2, cy2, size, color) {
    ctx.strokeStyle = color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx2, cy2, size, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx2, cy2, size * 0.5, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx2, cy2 - size * 1.3); ctx.lineTo(cx2, cy2 - size * 0.6);
    ctx.moveTo(cx2, cy2 + size * 0.6); ctx.lineTo(cx2, cy2 + size * 1.3);
    ctx.moveTo(cx2 - size * 1.3, cy2); ctx.lineTo(cx2 - size * 0.6, cy2);
    ctx.moveTo(cx2 + size * 0.6, cy2); ctx.lineTo(cx2 + size * 1.3, cy2);
    ctx.stroke();
  },
  lightning(ctx, cx2, cy2, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx2 + size * 0.2, cy2 - size);
    ctx.lineTo(cx2 - size * 0.3, cy2 - size * 0.1);
    ctx.lineTo(cx2 + size * 0.1, cy2 - size * 0.1);
    ctx.lineTo(cx2 - size * 0.2, cy2 + size);
    ctx.lineTo(cx2 + size * 0.3, cy2 + size * 0.1);
    ctx.lineTo(cx2 - size * 0.1, cy2 + size * 0.1);
    ctx.closePath();
    ctx.fill();
  },
  waves(ctx, cx2, cy2, size, color) {
    ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const r = size * 0.5 + i * size * 0.3;
      ctx.beginPath();
      ctx.arc(cx2, cy2, r, -Math.PI * 0.5, Math.PI * 0.5);
      ctx.stroke();
    }
  },
};

function drawAbilities() {
  const folder = 'abilities-128';
  let count = 0;

  function make(colorKey, name, drawFn) {
    const { c, ctx } = makeCanvas();
    abilityBg(ctx, colorKey);
    drawFn(ctx);
    save(c, folder, name);
    count++;
  }

  // ── RED (Melee) ──
  make('r', 'r_crushing_blow', ctx => {
    sym.fist(ctx, CX, CY - 5, 36, '#E57373');
    // impact
    sym.explosion(ctx, CX, CY + 18, 18, 'rgba(244,67,54,0.3)');
    // cracks
    ctx.strokeStyle = '#FFCDD2'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(CX, CY + 18); ctx.lineTo(CX - 15, CY + 35); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(CX, CY + 18); ctx.lineTo(CX + 12, CY + 38); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(CX, CY + 18); ctx.lineTo(CX + 2, CY + 40); ctx.stroke();
  });

  make('r', 'r_rending_slash', ctx => {
    // three slash marks
    ctx.strokeStyle = '#EF5350'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(CX + i * 14 - 15, 30); ctx.lineTo(CX + i * 14 + 15, 98);
      ctx.stroke();
    }
    // blood drops
    ctx.fillStyle = '#C62828';
    ctx.beginPath(); ctx.arc(CX - 20, 80, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(CX + 22, 85, 3, 0, Math.PI * 2); ctx.fill();
  });

  make('r', 'r_shield_breaker', ctx => {
    sym.shield(ctx, CX, CY, 25, '#78909C');
    // crack through shield
    ctx.strokeStyle = '#F44336'; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(CX - 5, CY - 25);
    ctx.lineTo(CX + 3, CY - 8);
    ctx.lineTo(CX - 4, CY + 5);
    ctx.lineTo(CX + 5, CY + 25);
    ctx.stroke();
    // shards flying
    ctx.fillStyle = '#90A4AE';
    ctx.save(); ctx.translate(CX + 20, CY - 10); ctx.rotate(0.5);
    ctx.fillRect(-4, -3, 8, 6); ctx.restore();
    ctx.save(); ctx.translate(CX - 18, CY + 8); ctx.rotate(-0.3);
    ctx.fillRect(-3, -4, 6, 8); ctx.restore();
  });

  make('r', 'r_double_strike', ctx => {
    sym.sword(ctx, CX - 12, CY, 50, -0.3, '#E57373');
    sym.sword(ctx, CX + 12, CY, 50, 0.3, '#EF5350');
    // X-slash effect
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(35, 30); ctx.lineTo(93, 98); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(93, 30); ctx.lineTo(35, 98); ctx.stroke();
  });

  make('r', 'r_battle_cry', ctx => {
    // mouth shape
    ctx.fillStyle = '#E57373';
    ctx.beginPath();
    ctx.ellipse(CX, CY, 18, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#B71C1C';
    ctx.beginPath();
    ctx.ellipse(CX, CY, 14, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    // sound waves
    ctx.strokeStyle = '#FFCDD2'; ctx.lineWidth = 2.5;
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath();
      ctx.arc(CX, CY, 22 + i * 10, -0.5, 0.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(CX, CY, 22 + i * 10, Math.PI - 0.5, Math.PI + 0.5);
      ctx.stroke();
    }
  });

  make('r', 'r_whirlwind_strike', ctx => {
    // spiral slashes
    ctx.strokeStyle = '#EF5350'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const startAngle = i * (Math.PI * 2 / 3);
      ctx.beginPath();
      ctx.arc(CX, CY, 25 + i * 6, startAngle, startAngle + Math.PI * 1.2);
      ctx.stroke();
    }
    // center blade
    sym.sword(ctx, CX, CY, 30, 0, '#FFCDD2');
  });

  make('r', 'r_execution', ctx => {
    // axe blade (large)
    ctx.fillStyle = '#B0BEC5';
    ctx.beginPath();
    ctx.moveTo(CX, 25);
    ctx.quadraticCurveTo(CX + 35, 45, CX + 30, 70);
    ctx.lineTo(CX, 55);
    ctx.closePath();
    ctx.fill();
    // handle
    ctx.strokeStyle = '#5D4037'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(CX, 55); ctx.lineTo(CX - 20, 100); ctx.stroke();
    // blood drip
    ctx.fillStyle = '#C62828';
    ctx.beginPath();
    ctx.moveTo(CX + 28, 70); ctx.quadraticCurveTo(CX + 32, 78, CX + 28, 82);
    ctx.quadraticCurveTo(CX + 24, 78, CX + 28, 70);
    ctx.fill();
  });

  make('r', 'r_iron_fortress', ctx => {
    sym.shield(ctx, CX, CY, 30, '#78909C');
    // iron rivets
    ctx.fillStyle = '#B0BEC5';
    const pos = [[CX, CY - 18], [CX - 14, CY], [CX + 14, CY], [CX, CY + 15]];
    for (const [x, y] of pos) {
      ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
    }
    // glow
    drawGlow(ctx, CX, CY, 30, 'rgba(244,67,54,0.15)');
  });

  make('r', 'r_berserker_rush', ctx => {
    // charging figure silhouette
    ctx.fillStyle = '#E57373';
    // body
    ctx.beginPath(); ctx.arc(CX + 5, 38, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(CX - 2, 48, 14, 22);
    // legs in running pose
    ctx.strokeStyle = '#E57373'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(CX + 5, 70); ctx.lineTo(CX - 10, 88); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(CX + 5, 70); ctx.lineTo(CX + 20, 85); ctx.stroke();
    // arms
    ctx.beginPath(); ctx.moveTo(CX, 52); ctx.lineTo(CX - 18, 45); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(CX + 10, 52); ctx.lineTo(CX + 25, 40); ctx.stroke();
    // speed lines
    ctx.strokeStyle = 'rgba(255,205,210,0.4)'; ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const ly = 35 + i * 12;
      ctx.beginPath(); ctx.moveTo(15, ly); ctx.lineTo(35, ly); ctx.stroke();
    }
  });

  make('r', 'r_titan_strike', ctx => {
    // giant fist from above
    sym.fist(ctx, CX, 35, 40, '#EF5350');
    // ground impact
    ctx.strokeStyle = '#FFCDD2'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(CX, 90, 35, 8, 0, 0, Math.PI * 2);
    ctx.stroke();
    // debris
    ctx.fillStyle = '#795548';
    for (let i = 0; i < 6; i++) {
      const dx2 = CX - 25 + i * 10;
      const dy2 = 78 - Math.abs(i - 2.5) * 4;
      ctx.beginPath(); ctx.arc(dx2, dy2, 3, 0, Math.PI * 2); ctx.fill();
    }
  });

  make('r', 'r_blood_fury', ctx => {
    sym.skull(ctx, CX, CY - 5, 28, '#E57373');
    // blood drips from eyes
    ctx.fillStyle = '#C62828';
    for (const dx of [-6, 6]) {
      ctx.beginPath();
      ctx.moveTo(CX + dx, CY + 5);
      ctx.quadraticCurveTo(CX + dx + 2, CY + 15, CX + dx, CY + 20);
      ctx.quadraticCurveTo(CX + dx - 2, CY + 15, CX + dx, CY + 5);
      ctx.fill();
    }
    // rage aura
    ctx.strokeStyle = 'rgba(183,28,28,0.4)'; ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(CX, CY, 32 + i * 8, 0, Math.PI * 2);
      ctx.stroke();
    }
  });

  make('r', 'r_annihilate', ctx => {
    sym.explosion(ctx, CX, CY, 35, '#E53935');
    sym.explosion(ctx, CX, CY, 22, '#FF8A65');
    sym.circle(ctx, CX, CY, 8, '#FFCC80');
    // debris lines
    ctx.strokeStyle = '#FFCDD2'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI * i) / 4;
      ctx.beginPath();
      ctx.moveTo(CX + 30 * Math.cos(a), CY + 30 * Math.sin(a));
      ctx.lineTo(CX + 45 * Math.cos(a), CY + 45 * Math.sin(a));
      ctx.stroke();
    }
  });

  make('r', 'r_undying_rage', ctx => {
    sym.skull(ctx, CX, CY - 8, 24, '#FFCDD2');
    // fire around skull
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI * i) / 3 - Math.PI / 2;
      const fx2 = CX + 28 * Math.cos(a);
      const fy2 = CY - 8 + 28 * Math.sin(a);
      const fg2 = ctx.createRadialGradient(fx2, fy2, 0, fx2, fy2, 10);
      fg2.addColorStop(0, '#FF6F00');
      fg2.addColorStop(1, 'transparent');
      ctx.fillStyle = fg2;
      ctx.beginPath(); ctx.arc(fx2, fy2, 10, 0, Math.PI * 2); ctx.fill();
    }
    // red glow eyes
    ctx.fillStyle = '#F44336';
    ctx.beginPath(); ctx.arc(CX - 6, CY - 12, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(CX + 6, CY - 12, 4, 0, Math.PI * 2); ctx.fill();
  });

  // ── GREEN (Ranged) ──
  make('g', 'g_quick_shot', ctx => {
    sym.arrow(ctx, CX, CY, 50, -0.3, '#81C784');
    // speed lines
    ctx.strokeStyle = 'rgba(165,214,167,0.4)'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.moveTo(CX + 15 + i * 8, CY - 5 + i * 8); ctx.lineTo(CX + 30 + i * 8, CY + 5 + i * 8); ctx.stroke();
    }
  });

  make('g', 'g_aimed_shot', ctx => {
    sym.crosshair(ctx, CX, CY, 25, '#66BB6A');
    ctx.fillStyle = '#F44336';
    ctx.beginPath(); ctx.arc(CX, CY, 3, 0, Math.PI * 2); ctx.fill();
  });

  make('g', 'g_double_tap', ctx => {
    sym.arrow(ctx, CX - 10, CY - 5, 40, -0.15, '#81C784');
    sym.arrow(ctx, CX + 10, CY + 5, 40, -0.15, '#66BB6A');
  });

  make('g', 'g_crippling_shot', ctx => {
    sym.arrow(ctx, CX, CY - 10, 40, 0, '#81C784');
    // chain/shackle at bottom
    ctx.strokeStyle = '#9E9E9E'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(CX - 8, CY + 25, 6, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(CX + 8, CY + 25, 6, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(CX - 2, CY + 25); ctx.lineTo(CX + 2, CY + 25); ctx.stroke();
  });

  make('g', 'g_piercing_arrow', ctx => {
    sym.arrow(ctx, CX, CY, 55, 0, '#A5D6A7');
    // armor being pierced
    ctx.strokeStyle = '#78909C'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(CX - 20, CY - 5); ctx.lineTo(CX - 5, CY - 5);
    ctx.moveTo(CX + 5, CY - 5); ctx.lineTo(CX + 20, CY - 5);
    ctx.stroke();
    // shatter particles
    ctx.fillStyle = '#B0BEC5';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath(); ctx.arc(CX - 15 + i * 10, CY - 15 + i * 3, 2, 0, Math.PI * 2); ctx.fill();
    }
  });

  make('g', 'g_triple_strafe', ctx => {
    sym.arrow(ctx, CX - 15, CY, 45, -0.2, '#A5D6A7');
    sym.arrow(ctx, CX, CY, 45, 0, '#81C784');
    sym.arrow(ctx, CX + 15, CY, 45, 0.2, '#66BB6A');
  });

  make('g', 'g_headshot', ctx => {
    sym.crosshair(ctx, CX, CY, 28, '#66BB6A');
    // skull in center
    sym.skull(ctx, CX, CY, 14, '#E0E0E0');
  });

  make('g', 'g_smoke_retreat', ctx => {
    // smoke cloud
    for (let i = 0; i < 5; i++) {
      const sx2 = CX - 15 + i * 8;
      const sy2 = CY + 5 + Math.sin(i) * 8;
      const sg = ctx.createRadialGradient(sx2, sy2, 0, sx2, sy2, 15);
      sg.addColorStop(0, 'rgba(158,158,158,0.4)');
      sg.addColorStop(1, 'transparent');
      ctx.fillStyle = sg;
      ctx.beginPath(); ctx.arc(sx2, sy2, 15, 0, Math.PI * 2); ctx.fill();
    }
    // footprints retreating
    ctx.fillStyle = 'rgba(76,175,80,0.4)';
    ctx.beginPath(); ctx.ellipse(CX + 20, CY + 20, 4, 6, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(CX + 30, CY + 28, 4, 6, 0.3, 0, Math.PI * 2); ctx.fill();
  });

  make('g', 'g_barrage', ctx => {
    for (let i = 0; i < 5; i++) {
      sym.arrow(ctx, CX - 20 + i * 10, CY + i * 3, 40, -0.1 + i * 0.05, '#81C784');
    }
  });

  make('g', 'g_snipers_mark', ctx => {
    sym.crosshair(ctx, CX, CY, 30, '#4CAF50');
    // X mark
    ctx.strokeStyle = '#F44336'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(CX - 8, CY - 8); ctx.lineTo(CX + 8, CY + 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(CX + 8, CY - 8); ctx.lineTo(CX - 8, CY + 8); ctx.stroke();
  });

  make('g', 'g_kill_confirm', ctx => {
    sym.crosshair(ctx, CX, CY - 5, 22, '#66BB6A');
    // checkmark
    ctx.strokeStyle = '#4CAF50'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(CX - 15, CY + 20); ctx.lineTo(CX - 3, CY + 32); ctx.lineTo(CX + 18, CY + 10); ctx.stroke();
  });

  make('g', 'g_ghost_walk', ctx => {
    // ghostly silhouette
    ctx.fillStyle = 'rgba(165,214,167,0.3)';
    ctx.beginPath();
    ctx.arc(CX, CY - 10, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(CX - 10, CY + 4, 20, 25);
    // dashed outline
    ctx.strokeStyle = 'rgba(76,175,80,0.5)'; ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(CX, CY - 10, 16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeRect(CX - 12, CY + 2, 24, 28);
    ctx.setLineDash([]);
    // fade particles
    ctx.fillStyle = 'rgba(129,199,132,0.3)';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath(); ctx.arc(CX - 20 + i * 10, CY + 35 + i * 2, 3 - i * 0.4, 0, Math.PI * 2); ctx.fill();
    }
  });

  make('g', 'g_oblivion_volley', ctx => {
    // rain of arrows
    for (let i = 0; i < 7; i++) {
      const ax = 25 + i * 14;
      const ay = 20 + (i % 3) * 8;
      sym.arrow(ctx, ax, ay + 20, 30, 0.4, '#81C784');
    }
    // impact area
    ctx.strokeStyle = 'rgba(76,175,80,0.3)'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(CX, 95, 40, 10, 0, 0, Math.PI * 2);
    ctx.stroke();
  });

  // ── BLUE (Demolitions) ──
  make('b', 'b_firebomb', ctx => {
    sym.bomb(ctx, CX, CY + 5, 18, '#42A5F5');
    // fire around
    drawGlow(ctx, CX, CY - 10, 20, 'rgba(255,152,0,0.3)');
    ctx.fillStyle = '#FF9800';
    ctx.beginPath();
    ctx.moveTo(CX - 8, CY - 12); ctx.quadraticCurveTo(CX, CY - 28, CX + 8, CY - 12);
    ctx.fill();
  });

  make('b', 'b_frag_toss', ctx => {
    // grenade body
    ctx.fillStyle = '#546E7A';
    roundRect(ctx, CX - 12, CY - 10, 24, 28, 5, '#546E7A', '#37474F');
    // top
    ctx.fillStyle = '#78909C';
    ctx.fillRect(CX - 4, CY - 16, 8, 8);
    // pin ring
    ctx.strokeStyle = '#FFD54F'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(CX + 8, CY - 16, 4, 0, Math.PI * 2); ctx.stroke();
    // frag lines
    ctx.strokeStyle = '#37474F'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(CX - 12, CY); ctx.lineTo(CX + 12, CY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(CX - 12, CY + 8); ctx.lineTo(CX + 12, CY + 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(CX, CY - 10); ctx.lineTo(CX, CY + 18); ctx.stroke();
    // trajectory arc
    ctx.strokeStyle = 'rgba(144,202,249,0.3)'; ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(CX - 30, CY + 40, 50, -1.2, -0.3);
    ctx.stroke();
    ctx.setLineDash([]);
  });

  make('b', 'b_concussion_grenade', ctx => {
    sym.bomb(ctx, CX, CY, 16, '#64B5F6');
    // concussion waves
    ctx.strokeStyle = '#BBDEFB'; ctx.lineWidth = 2;
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath(); ctx.arc(CX, CY, 20 + i * 10, 0, Math.PI * 2); ctx.stroke();
    }
    // stars (dazed)
    drawStar(ctx, CX - 25, CY - 25, 6, 3, 4, '#FFC107');
    drawStar(ctx, CX + 28, CY - 20, 5, 2.5, 4, '#FFD54F');
  });

  make('b', 'b_smoke_bomb', ctx => {
    // smoke cloud (layered circles)
    for (let i = 0; i < 7; i++) {
      const sx2 = CX - 20 + i * 7 + Math.sin(i) * 5;
      const sy2 = CY - 5 + Math.cos(i) * 8;
      const sg = ctx.createRadialGradient(sx2, sy2, 0, sx2, sy2, 18);
      sg.addColorStop(0, 'rgba(144,202,249,0.35)');
      sg.addColorStop(1, 'transparent');
      ctx.fillStyle = sg;
      ctx.beginPath(); ctx.arc(sx2, sy2, 18, 0, Math.PI * 2); ctx.fill();
    }
    // canister at bottom
    ctx.fillStyle = '#455A64';
    roundRect(ctx, CX - 6, CY + 20, 12, 18, 3, '#455A64', '#263238');
  });

  make('b', 'b_trip_mine', ctx => {
    // mine body (disc)
    ctx.fillStyle = '#546E7A';
    ctx.beginPath(); ctx.ellipse(CX, CY + 5, 25, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#37474F'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(CX, CY + 5, 25, 12, 0, 0, Math.PI * 2); ctx.stroke();
    // trigger
    ctx.fillStyle = '#F44336';
    ctx.beginPath(); ctx.arc(CX, CY + 3, 5, 0, Math.PI * 2); ctx.fill();
    // tripwire
    ctx.strokeStyle = 'rgba(224,224,224,0.4)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(15, CY + 5); ctx.lineTo(CX - 25, CY + 5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(CX + 25, CY + 5); ctx.lineTo(113, CY + 5); ctx.stroke();
    // warning sign
    drawTriangle(ctx, CX, CY - 30, CX - 12, CY - 10, CX + 12, CY - 10, '#FFC107', null);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('!', CX, CY - 14);
  });

  make('b', 'b_napalm_flask', ctx => {
    // flask
    ctx.strokeStyle = 'rgba(200,230,255,0.5)'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(CX - 4, CY - 15); ctx.lineTo(CX - 12, CY + 10);
    ctx.quadraticCurveTo(CX, CY + 20, CX + 12, CY + 10);
    ctx.lineTo(CX + 4, CY - 15);
    ctx.closePath();
    ctx.stroke();
    // napalm liquid
    const ng = ctx.createLinearGradient(CX, CY, CX, CY + 20);
    ng.addColorStop(0, '#FF6F00');
    ng.addColorStop(1, '#BF360C');
    ctx.fillStyle = ng;
    ctx.beginPath();
    ctx.moveTo(CX - 10, CY); ctx.lineTo(CX - 12, CY + 10);
    ctx.quadraticCurveTo(CX, CY + 20, CX + 12, CY + 10);
    ctx.lineTo(CX + 10, CY);
    ctx.closePath();
    ctx.fill();
    // fire on top
    ctx.fillStyle = '#FFCA28';
    ctx.beginPath();
    ctx.moveTo(CX - 6, CY - 15); ctx.quadraticCurveTo(CX, CY - 30, CX + 6, CY - 15);
    ctx.fill();
  });

  make('b', 'b_cluster_bomb', ctx => {
    // main bomb
    sym.bomb(ctx, CX, CY - 5, 14, '#42A5F5');
    // sub-bombs scattered
    const subs = [[-22, 18], [0, 25], [22, 18], [-15, -20], [15, -22]];
    for (const [dx, dy] of subs) {
      ctx.fillStyle = '#64B5F6';
      ctx.beginPath(); ctx.arc(CX + dx, CY + dy, 6, 0, Math.PI * 2); ctx.fill();
    }
    // connecting lines
    ctx.strokeStyle = 'rgba(144,202,249,0.3)'; ctx.lineWidth = 1;
    for (const [dx, dy] of subs) {
      ctx.beginPath(); ctx.moveTo(CX, CY - 5); ctx.lineTo(CX + dx, CY + dy); ctx.stroke();
    }
  });

  make('b', 'b_emp_blast', ctx => {
    // lightning bolt center
    sym.lightning(ctx, CX, CY, 28, '#42A5F5');
    // EMP waves
    ctx.strokeStyle = 'rgba(33,150,243,0.3)'; ctx.lineWidth = 2;
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath(); ctx.arc(CX, CY, 25 + i * 10, 0, Math.PI * 2); ctx.stroke();
    }
    // sparks
    ctx.fillStyle = '#BBDEFB';
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI * i) / 3;
      ctx.beginPath();
      ctx.arc(CX + 40 * Math.cos(a), CY + 40 * Math.sin(a), 2, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  make('b', 'b_toxic_cloud', ctx => {
    // toxic cloud
    for (let i = 0; i < 6; i++) {
      const sx2 = CX - 18 + i * 7;
      const sy2 = CY - 3 + Math.sin(i * 1.2) * 10;
      const sg = ctx.createRadialGradient(sx2, sy2, 0, sx2, sy2, 18);
      sg.addColorStop(0, 'rgba(76,175,80,0.35)');
      sg.addColorStop(1, 'transparent');
      ctx.fillStyle = sg;
      ctx.beginPath(); ctx.arc(sx2, sy2, 18, 0, Math.PI * 2); ctx.fill();
    }
    // skull in cloud
    sym.skull(ctx, CX, CY, 16, 'rgba(129,199,132,0.6)');
  });

  make('b', 'b_plasma_lance', ctx => {
    // plasma beam
    const pg2 = ctx.createLinearGradient(30, CY, 98, CY);
    pg2.addColorStop(0, '#00BCD4');
    pg2.addColorStop(0.5, '#E1F5FE');
    pg2.addColorStop(1, '#00BCD4');
    ctx.fillStyle = pg2;
    ctx.fillRect(25, CY - 4, 78, 8);
    // glow around beam
    drawGlow(ctx, CX, CY, 30, 'rgba(0,188,212,0.2)');
    // tip
    ctx.fillStyle = '#E1F5FE';
    ctx.beginPath();
    ctx.moveTo(103, CY); ctx.lineTo(113, CY - 8); ctx.lineTo(113, CY + 8);
    ctx.closePath();
    ctx.fill();
  });

  make('b', 'b_radiation_burst', ctx => {
    // radiation symbol
    ctx.fillStyle = '#42A5F5';
    for (let i = 0; i < 3; i++) {
      const a = (Math.PI * 2 * i) / 3 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.arc(CX, CY, 30, a - 0.4, a + 0.4);
      ctx.closePath();
      ctx.fill();
    }
    // center circle
    ctx.fillStyle = ABILITY_COLORS.b.bg;
    ctx.beginPath(); ctx.arc(CX, CY, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#42A5F5';
    ctx.beginPath(); ctx.arc(CX, CY, 5, 0, Math.PI * 2); ctx.fill();
    // burst rays
    ctx.strokeStyle = 'rgba(144,202,249,0.3)'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI * i) / 4;
      ctx.beginPath();
      ctx.moveTo(CX + 32 * Math.cos(a), CY + 32 * Math.sin(a));
      ctx.lineTo(CX + 45 * Math.cos(a), CY + 45 * Math.sin(a));
      ctx.stroke();
    }
  });

  make('b', 'b_carpet_bomb', ctx => {
    // row of explosions
    for (let i = 0; i < 4; i++) {
      const bx = 25 + i * 25;
      const by = CY + 10 + Math.sin(i) * 5;
      sym.explosion(ctx, bx, by, 14 + i * 2, `rgba(66,165,245,${0.3 + i * 0.1})`);
    }
    // bomber silhouette
    ctx.fillStyle = '#37474F';
    ctx.beginPath();
    ctx.moveTo(CX - 20, 25); ctx.lineTo(CX + 25, 30); ctx.lineTo(CX + 20, 35);
    ctx.lineTo(CX - 15, 30);
    ctx.closePath();
    ctx.fill();
    // wings
    ctx.beginPath();
    ctx.moveTo(CX - 5, 28); ctx.lineTo(CX - 25, 22); ctx.lineTo(CX - 5, 32);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(CX + 10, 30); ctx.lineTo(CX + 30, 25); ctx.lineTo(CX + 10, 33);
    ctx.fill();
  });

  make('b', 'b_singularity', ctx => {
    // black hole center
    const sg2 = ctx.createRadialGradient(CX, CY, 0, CX, CY, 35);
    sg2.addColorStop(0, '#000');
    sg2.addColorStop(0.4, '#0D47A1');
    sg2.addColorStop(0.7, '#1565C0');
    sg2.addColorStop(1, 'transparent');
    ctx.fillStyle = sg2;
    ctx.beginPath(); ctx.arc(CX, CY, 35, 0, Math.PI * 2); ctx.fill();
    // accretion disc
    ctx.strokeStyle = '#42A5F5'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(CX, CY, 38, 14, 0.3, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#90CAF9'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(CX, CY, 42, 16, 0.3, 0, Math.PI * 2); ctx.stroke();
    // particles being sucked in
    ctx.fillStyle = '#BBDEFB';
    for (let i = 0; i < 6; i++) {
      const a = i * 1.05;
      const r2 = 30 + i * 4;
      ctx.beginPath();
      ctx.arc(CX + r2 * Math.cos(a), CY + r2 * Math.sin(a) * 0.4, 2 - i * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // ── WHITE (Support) ──
  make('w', 'w_first_aid', ctx => {
    sym.cross(ctx, CX, CY, 22, '#E0E0E0');
    // slight red tint
    drawGlow(ctx, CX, CY, 30, 'rgba(244,67,54,0.1)');
  });

  make('w', 'w_mending_salve', ctx => {
    // jar/bottle
    ctx.fillStyle = '#A5D6A7';
    roundRect(ctx, CX - 14, CY - 10, 28, 30, 6, '#A5D6A7', '#66BB6A');
    ctx.fillStyle = '#795548';
    ctx.fillRect(CX - 8, CY - 16, 16, 8);
    // sparkles
    drawStar(ctx, CX - 18, CY - 20, 5, 2, 4, '#FFF');
    drawStar(ctx, CX + 20, CY + 15, 4, 2, 4, '#E0E0E0');
    // healing aura
    drawGlow(ctx, CX, CY + 5, 25, 'rgba(165,214,167,0.2)');
  });

  make('w', 'w_rally_cry', ctx => {
    // banner
    ctx.strokeStyle = '#8D6E63'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(CX, 20); ctx.lineTo(CX, 95); ctx.stroke();
    ctx.fillStyle = '#E0E0E0';
    ctx.beginPath();
    ctx.moveTo(CX, 22); ctx.lineTo(CX + 28, 32);
    ctx.lineTo(CX + 25, 42); ctx.lineTo(CX, 35);
    ctx.closePath();
    ctx.fill();
    // star on banner
    drawStar(ctx, CX + 14, 32, 5, 2, 5, '#FFC107');
    // sound waves
    ctx.strokeStyle = 'rgba(224,224,224,0.3)'; ctx.lineWidth = 2;
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(CX, 55, 10 + i * 10, -0.6, 0.6);
      ctx.stroke();
    }
  });

  make('w', 'w_suppressive_smoke', ctx => {
    // smoke clouds
    for (let i = 0; i < 6; i++) {
      const sx2 = CX - 22 + i * 9;
      const sy2 = CY + Math.sin(i * 1.3) * 10;
      const sg = ctx.createRadialGradient(sx2, sy2, 0, sx2, sy2, 16);
      sg.addColorStop(0, 'rgba(224,224,224,0.3)');
      sg.addColorStop(1, 'transparent');
      ctx.fillStyle = sg;
      ctx.beginPath(); ctx.arc(sx2, sy2, 16, 0, Math.PI * 2); ctx.fill();
    }
    // shield silhouette in smoke
    sym.shield(ctx, CX, CY, 18, 'rgba(224,224,224,0.25)');
  });

  make('w', 'w_fortify', ctx => {
    sym.shield(ctx, CX, CY, 28, '#BDBDBD');
    // up arrow on shield
    ctx.fillStyle = '#E0E0E0';
    ctx.beginPath();
    ctx.moveTo(CX, CY - 15); ctx.lineTo(CX + 10, CY); ctx.lineTo(CX + 4, CY);
    ctx.lineTo(CX + 4, CY + 12); ctx.lineTo(CX - 4, CY + 12);
    ctx.lineTo(CX - 4, CY); ctx.lineTo(CX - 10, CY);
    ctx.closePath();
    ctx.fill();
  });

  make('w', 'w_adrenaline_shot', ctx => {
    // syringe
    ctx.fillStyle = '#BDBDBD';
    ctx.save(); ctx.translate(CX, CY); ctx.rotate(-0.5);
    ctx.fillRect(-4, -30, 8, 50);
    // plunger
    ctx.fillStyle = '#9E9E9E';
    ctx.fillRect(-6, -35, 12, 8);
    // needle
    ctx.fillStyle = '#E0E0E0';
    ctx.fillRect(-1, 20, 2, 14);
    // liquid
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(-2, -5, 4, 20);
    ctx.restore();
  });

  make('w', 'w_triage', ctx => {
    sym.cross(ctx, CX, CY - 10, 16, '#F44336');
    // three figures below
    for (let i = -1; i <= 1; i++) {
      const fx2 = CX + i * 22;
      ctx.fillStyle = '#BDBDBD';
      ctx.beginPath(); ctx.arc(fx2, CY + 18, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(fx2 - 3, CY + 23, 6, 12);
    }
    // priority marks
    ctx.fillStyle = '#F44336'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('1', CX - 22, CY + 42);
    ctx.fillStyle = '#FF9800';
    ctx.fillText('2', CX, CY + 42);
    ctx.fillStyle = '#4CAF50';
    ctx.fillText('3', CX + 22, CY + 42);
  });

  make('w', 'w_iron_guard', ctx => {
    sym.shield(ctx, CX, CY, 30, '#9E9E9E');
    // iron texture (rivets)
    ctx.fillStyle = '#BDBDBD';
    for (const [rx, ry] of [[CX, CY - 18], [CX - 15, CY], [CX + 15, CY], [CX - 8, CY + 15], [CX + 8, CY + 15]]) {
      ctx.beginPath(); ctx.arc(rx, ry, 3, 0, Math.PI * 2); ctx.fill();
    }
    // cross on shield
    ctx.strokeStyle = '#CFD8DC'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(CX, CY - 22); ctx.lineTo(CX, CY + 22); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(CX - 18, CY); ctx.lineTo(CX + 18, CY); ctx.stroke();
  });

  make('w', 'w_purifying_light', ctx => {
    // light rays
    drawGlow(ctx, CX, CY, 40, 'rgba(255,255,224,0.2)');
    // central light
    ctx.fillStyle = '#FFF9C4';
    ctx.beginPath(); ctx.arc(CX, CY, 12, 0, Math.PI * 2); ctx.fill();
    drawGlow(ctx, CX, CY, 18, 'rgba(255,255,224,0.4)');
    // rays
    ctx.strokeStyle = 'rgba(255,255,200,0.4)'; ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI * i) / 4;
      ctx.beginPath();
      ctx.moveTo(CX + 15 * Math.cos(a), CY + 15 * Math.sin(a));
      ctx.lineTo(CX + 40 * Math.cos(a), CY + 40 * Math.sin(a));
      ctx.stroke();
    }
  });

  make('w', 'w_battlefield_command', ctx => {
    // command table map
    ctx.fillStyle = '#5D4037';
    ctx.beginPath();
    ctx.moveTo(30, 60); ctx.lineTo(98, 60); ctx.lineTo(93, 85); ctx.lineTo(35, 85);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#E8D5B7';
    ctx.beginPath();
    ctx.moveTo(33, 62); ctx.lineTo(95, 62); ctx.lineTo(91, 83); ctx.lineTo(37, 83);
    ctx.closePath();
    ctx.fill();
    // tactical arrows on map
    ctx.strokeStyle = '#F44336'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(45, 75); ctx.lineTo(65, 68); ctx.stroke();
    drawTriangle(ctx, 65, 66, 65, 70, 70, 68, '#F44336', null);
    ctx.strokeStyle = '#2196F3';
    ctx.beginPath(); ctx.moveTo(70, 78); ctx.lineTo(85, 70); ctx.stroke();
    drawTriangle(ctx, 85, 68, 85, 72, 90, 70, '#2196F3', null);
    // crown above
    sym.crown(ctx, CX, 38, 18, '#E0E0E0');
  });

  make('w', 'w_shield_wall', ctx => {
    // row of overlapping shields
    for (let i = 0; i < 3; i++) {
      sym.shield(ctx, CX - 20 + i * 20, CY, 22, `rgba(${180 + i * 20},${180 + i * 20},${180 + i * 20},0.8)`);
    }
    // connecting line at top
    ctx.strokeStyle = '#E0E0E0'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(CX - 38, CY - 20); ctx.lineTo(CX + 38, CY - 20); ctx.stroke();
  });

  make('w', 'w_lifeblood_surge', ctx => {
    sym.heart(ctx, CX, CY, 25, '#EF5350');
    // pulse waves
    ctx.strokeStyle = 'rgba(229,115,115,0.4)'; ctx.lineWidth = 2;
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath(); ctx.arc(CX, CY, 28 + i * 8, 0, Math.PI * 2); ctx.stroke();
    }
    // up arrows
    ctx.fillStyle = '#FFCDD2';
    for (const dx of [-15, 0, 15]) {
      ctx.beginPath();
      ctx.moveTo(CX + dx, CY - 35); ctx.lineTo(CX + dx - 4, CY - 28); ctx.lineTo(CX + dx + 4, CY - 28);
      ctx.closePath();
      ctx.fill();
    }
  });

  make('w', 'w_undying_covenant', ctx => {
    // two hands clasping
    ctx.strokeStyle = '#E0E0E0'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    // left hand
    ctx.beginPath();
    ctx.moveTo(30, CY + 10); ctx.quadraticCurveTo(45, CY - 5, CX, CY);
    ctx.stroke();
    // right hand
    ctx.beginPath();
    ctx.moveTo(98, CY + 10); ctx.quadraticCurveTo(83, CY - 5, CX, CY);
    ctx.stroke();
    // halo/ring above
    ctx.strokeStyle = '#FFD54F'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(CX, CY - 25, 18, 6, 0, 0, Math.PI * 2);
    ctx.stroke();
    // glow
    drawGlow(ctx, CX, CY - 25, 20, 'rgba(255,213,79,0.15)');
    // chain below
    ctx.strokeStyle = '#BDBDBD'; ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(CX - 15 + i * 10, CY + 28, 5, 0, Math.PI * 2);
      ctx.stroke();
    }
  });

  // ── ORANGE (Passive) ──
  make('o', 'o_thick_skin', ctx => {
    // layered skin/armor
    ctx.fillStyle = '#FFB74D';
    ctx.beginPath();
    ctx.moveTo(CX - 25, 30); ctx.quadraticCurveTo(CX, 20, CX + 25, 30);
    ctx.lineTo(CX + 30, 90); ctx.lineTo(CX - 30, 90);
    ctx.closePath();
    ctx.fill();
    // texture lines
    ctx.strokeStyle = '#F57C00'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 5; i++) {
      const ly = 40 + i * 12;
      ctx.beginPath();
      ctx.moveTo(CX - 25 + i * 2, ly);
      ctx.bezierCurveTo(CX - 10, ly - 3, CX + 10, ly + 3, CX + 25 - i * 2, ly);
      ctx.stroke();
    }
    // shield icon overlay
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(CX, 35); ctx.quadraticCurveTo(CX + 18, 38, CX + 18, 55);
    ctx.quadraticCurveTo(CX + 15, 70, CX, 80);
    ctx.quadraticCurveTo(CX - 15, 70, CX - 18, 55);
    ctx.quadraticCurveTo(CX - 18, 38, CX, 35);
    ctx.stroke();
  });

  make('o', 'o_scavengers_luck', ctx => {
    // four-leaf clover
    ctx.fillStyle = '#66BB6A';
    for (let i = 0; i < 4; i++) {
      const a = (Math.PI * i) / 2;
      ctx.beginPath();
      ctx.arc(CX + 12 * Math.cos(a), CY + 12 * Math.sin(a), 12, 0, Math.PI * 2);
      ctx.fill();
    }
    // stem
    ctx.strokeStyle = '#2E7D32'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(CX, CY + 12); ctx.quadraticCurveTo(CX + 5, CY + 30, CX, CY + 40); ctx.stroke();
    // sparkle
    drawStar(ctx, CX + 22, CY - 22, 6, 3, 4, '#FFD54F');
  });

  make('o', 'o_quick_reflexes', ctx => {
    sym.lightning(ctx, CX, CY, 30, '#FFB74D');
    // speed lines around
    ctx.strokeStyle = 'rgba(255,183,77,0.3)'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI * i) / 3;
      ctx.beginPath();
      ctx.moveTo(CX + 35 * Math.cos(a), CY + 35 * Math.sin(a));
      ctx.lineTo(CX + 48 * Math.cos(a), CY + 48 * Math.sin(a));
      ctx.stroke();
    }
  });

  make('o', 'o_keen_eyes', ctx => {
    sym.eye(ctx, CX, CY, 28, '#FFB74D');
    // glowing pupil
    drawGlow(ctx, CX, CY, 10, 'rgba(255,152,0,0.3)');
  });

  make('o', 'o_regeneration', ctx => {
    sym.heart(ctx, CX, CY - 5, 20, '#66BB6A');
    // circular arrows (regen)
    ctx.strokeStyle = '#A5D6A7'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(CX, CY, 32, -1.5, 1); ctx.stroke();
    // arrowhead
    ctx.fillStyle = '#A5D6A7';
    ctx.beginPath();
    ctx.moveTo(CX + 32 * Math.cos(1), CY + 32 * Math.sin(1));
    ctx.lineTo(CX + 26 * Math.cos(1.3), CY + 26 * Math.sin(1.3));
    ctx.lineTo(CX + 38 * Math.cos(1.1), CY + 38 * Math.sin(1.1));
    ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(CX, CY, 32, Math.PI - 1.5, Math.PI + 1); ctx.stroke();
  });

  make('o', 'o_critical_mastery', ctx => {
    // exclamation in crosshair
    sym.crosshair(ctx, CX, CY, 25, '#FFB74D');
    ctx.fillStyle = '#FF9800'; ctx.font = 'bold 30px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('!!', CX, CY + 10);
  });

  make('o', 'o_last_breath', ctx => {
    sym.skull(ctx, CX, CY - 5, 22, '#FFB74D');
    // breath wisps
    ctx.strokeStyle = 'rgba(255,183,77,0.3)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(CX - 5 + i * 5, CY + 18);
      ctx.bezierCurveTo(CX - 8 + i * 5, CY + 28, CX + i * 5, CY + 35, CX - 5 + i * 6, CY + 45);
      ctx.stroke();
    }
  });

  make('o', 'o_bloodthirst', ctx => {
    // fang/teeth
    ctx.fillStyle = '#FFB74D';
    ctx.beginPath();
    ctx.moveTo(CX - 15, CY - 10); ctx.lineTo(CX - 8, CY + 15); ctx.lineTo(CX - 1, CY - 10);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(CX + 1, CY - 10); ctx.lineTo(CX + 8, CY + 15); ctx.lineTo(CX + 15, CY - 10);
    ctx.closePath(); ctx.fill();
    // blood drop
    ctx.fillStyle = '#C62828';
    ctx.beginPath();
    ctx.moveTo(CX, CY + 20); ctx.quadraticCurveTo(CX + 8, CY + 30, CX, CY + 38);
    ctx.quadraticCurveTo(CX - 8, CY + 30, CX, CY + 20);
    ctx.fill();
  });

  make('o', 'o_iron_will', ctx => {
    // brain/head silhouette
    ctx.fillStyle = '#FFB74D';
    ctx.beginPath(); ctx.arc(CX, CY - 5, 22, 0, Math.PI * 2); ctx.fill();
    // iron cross inside
    sym.cross(ctx, CX, CY - 5, 12, '#E65100');
    // aura
    ctx.strokeStyle = 'rgba(255,152,0,0.3)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(CX, CY - 5, 30, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(CX, CY - 5, 36, 0, Math.PI * 2); ctx.stroke();
  });

  make('o', 'o_precision_strikes', ctx => {
    sym.crosshair(ctx, CX, CY, 22, '#FFB74D');
    // sword through center
    sym.sword(ctx, CX, CY, 45, 0, '#E0E0E0');
  });

  make('o', 'o_combat_veteran', ctx => {
    // medal/star
    drawStar(ctx, CX, CY - 5, 25, 12, 5, '#FFB74D');
    drawStar(ctx, CX, CY - 5, 15, 8, 5, '#FF9800');
    // ribbon below
    ctx.fillStyle = '#F44336';
    ctx.beginPath();
    ctx.moveTo(CX - 12, CY + 18); ctx.lineTo(CX - 18, CY + 38);
    ctx.lineTo(CX - 8, CY + 32); ctx.lineTo(CX, CY + 38);
    ctx.lineTo(CX + 8, CY + 32); ctx.lineTo(CX + 18, CY + 38);
    ctx.lineTo(CX + 12, CY + 18);
    ctx.closePath();
    ctx.fill();
  });

  make('o', 'o_ghost_protocol', ctx => {
    // figure fading
    ctx.fillStyle = 'rgba(255,183,77,0.2)';
    ctx.beginPath(); ctx.arc(CX - 15, CY - 10, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(CX - 22, CY, 14, 20);
    ctx.fillStyle = 'rgba(255,183,77,0.4)';
    ctx.beginPath(); ctx.arc(CX + 5, CY - 10, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(CX - 2, CY, 14, 20);
    ctx.fillStyle = 'rgba(255,183,77,0.7)';
    ctx.beginPath(); ctx.arc(CX + 25, CY - 10, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(CX + 18, CY, 14, 20);
    // stealth eye
    sym.eye(ctx, CX, CY + 32, 16, 'rgba(255,152,0,0.5)');
  });

  make('o', 'o_apex_predator', ctx => {
    // beast eye (predator)
    sym.eye(ctx, CX, CY - 10, 30, '#FFB74D');
    // claw marks below
    ctx.strokeStyle = '#E65100'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(CX + i * 12 - 5, CY + 15);
      ctx.lineTo(CX + i * 12 + 5, CY + 40);
      ctx.stroke();
    }
  });

  // ── PURPLE (Decree) ──
  make('p', 'p_decree_fury', ctx => {
    sym.crown(ctx, CX, CY - 15, 22, '#CE93D8');
    // fury flames
    ctx.fillStyle = '#F44336';
    ctx.beginPath();
    ctx.moveTo(CX - 15, CY + 10); ctx.quadraticCurveTo(CX, CY - 5, CX + 15, CY + 10);
    ctx.quadraticCurveTo(CX, CY + 25, CX - 15, CY + 10);
    ctx.fill();
    sym.explosion(ctx, CX, CY + 15, 12, 'rgba(244,67,54,0.3)');
  });

  make('p', 'p_decree_resolve', ctx => {
    sym.crown(ctx, CX, CY - 18, 22, '#CE93D8');
    sym.shield(ctx, CX, CY + 12, 20, '#BA68C8');
    // iron trim
    ctx.strokeStyle = '#E1BEE7'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(CX, CY - 5); ctx.quadraticCurveTo(CX + 18, CY - 2, CX + 18, CY + 12);
    ctx.quadraticCurveTo(CX + 14, CY + 28, CX, CY + 32);
    ctx.quadraticCurveTo(CX - 14, CY + 28, CX - 18, CY + 12);
    ctx.quadraticCurveTo(CX - 18, CY - 2, CX, CY - 5);
    ctx.stroke();
  });

  make('p', 'p_decree_instinct', ctx => {
    sym.crown(ctx, CX, CY - 18, 22, '#CE93D8');
    sym.eye(ctx, CX, CY + 10, 22, '#BA68C8');
  });

  make('p', 'p_decree_speed', ctx => {
    sym.crown(ctx, CX, CY - 18, 22, '#CE93D8');
    sym.lightning(ctx, CX, CY + 12, 22, '#BA68C8');
  });

  make('p', 'p_decree_vitality', ctx => {
    sym.crown(ctx, CX, CY - 18, 22, '#CE93D8');
    sym.heart(ctx, CX, CY + 12, 18, '#BA68C8');
  });

  make('p', 'p_decree_fortune', ctx => {
    sym.crown(ctx, CX, CY - 18, 22, '#CE93D8');
    drawStar(ctx, CX, CY + 12, 18, 8, 4, '#BA68C8');
    // coins
    ctx.fillStyle = '#FFD54F';
    ctx.beginPath(); ctx.arc(CX - 12, CY + 28, 5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(CX + 12, CY + 28, 5, 0, Math.PI * 2); ctx.fill();
  });

  make('p', 'p_decree_undying', ctx => {
    sym.crown(ctx, CX, CY - 18, 22, '#CE93D8');
    // infinity symbol
    ctx.strokeStyle = '#BA68C8'; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(CX - 12, CY + 12, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(CX + 12, CY + 12, 10, 0, Math.PI * 2);
    ctx.stroke();
  });

  make('p', 'p_decree_war', ctx => {
    sym.crown(ctx, CX, CY - 18, 22, '#CE93D8');
    // crossed swords
    sym.sword(ctx, CX - 10, CY + 10, 35, -0.4, '#BA68C8');
    sym.sword(ctx, CX + 10, CY + 10, 35, 0.4, '#CE93D8');
  });

  make('p', 'p_decree_null', ctx => {
    sym.crown(ctx, CX, CY - 18, 22, '#CE93D8');
    // null/void circle
    ctx.strokeStyle = '#BA68C8'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(CX, CY + 12, 16, 0, Math.PI * 2); ctx.stroke();
    // slash through
    ctx.beginPath(); ctx.moveTo(CX - 12, CY + 24); ctx.lineTo(CX + 12, CY); ctx.stroke();
  });

  make('p', 'p_decree_cataclysm', ctx => {
    sym.crown(ctx, CX, CY - 22, 20, '#CE93D8');
    sym.explosion(ctx, CX, CY + 10, 28, '#BA68C8');
    sym.explosion(ctx, CX, CY + 10, 16, '#CE93D8');
    sym.circle(ctx, CX, CY + 10, 6, '#E1BEE7');
  });

  make('p', 'p_decree_harvest', ctx => {
    sym.crown(ctx, CX, CY - 18, 22, '#CE93D8');
    // scythe
    ctx.strokeStyle = '#BA68C8'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(CX - 5, CY + 35); ctx.lineTo(CX + 5, CY - 2); ctx.stroke();
    // blade
    ctx.strokeStyle = '#E1BEE7'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(CX + 5, CY - 2);
    ctx.quadraticCurveTo(CX + 25, CY - 5, CX + 20, CY + 10);
    ctx.stroke();
  });

  make('p', 'p_decree_accuracy', ctx => {
    sym.crown(ctx, CX, CY - 18, 22, '#CE93D8');
    sym.crosshair(ctx, CX, CY + 12, 18, '#BA68C8');
    // bullseye
    ctx.fillStyle = '#E1BEE7';
    ctx.beginPath(); ctx.arc(CX, CY + 12, 3, 0, Math.PI * 2); ctx.fill();
  });

  make('p', 'p_decree_shield', ctx => {
    sym.crown(ctx, CX, CY - 18, 22, '#CE93D8');
    sym.shield(ctx, CX, CY + 12, 22, '#BA68C8');
    // crown emblem on shield
    sym.crown(ctx, CX, CY + 8, 10, '#E1BEE7');
  });

  console.log(`  Abilities: ${count} icons generated.`);
  return count;
}


// ══════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════
console.log('Generating 128x128 icons...\n');
const t0 = Date.now();

const b = drawBuildings();
const s = drawSkills();
const a = drawAbilities();

const total = b + s + a;
const elapsed = ((Date.now() - t0) / 1000).toFixed(2);
console.log(`\nDone! ${total} icons generated in ${elapsed}s.`);
console.log(`  Output: ${path.resolve(OUT)}`);
