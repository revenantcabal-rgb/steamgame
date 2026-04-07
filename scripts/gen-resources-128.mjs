#!/usr/bin/env node
/**
 * gen-resources-128.mjs
 * Generates 128x128 PNG icons for all game resources, tools, and consumables.
 * Uses smooth anti-aliased rendering with ctx.arc(), gradients, bezier curves.
 * Fully self-contained. Creates output directories. Prints count when done.
 */
import { createCanvas, createImageData } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const S = 128; // icon size

// Output directories
const DIRS = {
  resources: path.join(ROOT, 'public/assets/resources-128'),
  tools: path.join(ROOT, 'public/assets/tools-128'),
  consumables: path.join(ROOT, 'public/assets/consumables-128'),
};

for (const d of Object.values(DIRS)) {
  fs.mkdirSync(d, { recursive: true });
}

// ─── Color Palettes ───────────────────────────────────────────
const CATEGORY_COLORS = {
  scavenging:   { bg1: '#8B6914', bg2: '#5C4033', accent: '#D4A853' },
  foraging:     { bg1: '#2E7D32', bg2: '#1B5E20', accent: '#81C784' },
  salvage:      { bg1: '#546E7A', bg2: '#37474F', accent: '#B0BEC5' },
  water:        { bg1: '#1565C0', bg2: '#0D47A1', accent: '#64B5F6' },
  prospecting:  { bg1: '#6D4C41', bg2: '#4E342E', accent: '#BCAAA4' },
};
const TIER_COLORS = {
  1: { mult: 1.0, badge: null,    badgeColor: null },
  2: { mult: 1.2, badge: 'II',   badgeColor: '#2196F3' },
  3: { mult: 1.4, badge: 'III',  badgeColor: '#9C27B0' },
};

// ─── Helper Drawing Functions ─────────────────────────────────

function drawRadialBg(ctx, c1, c2) {
  const g = ctx.createRadialGradient(S/2, S/2, 10, S/2, S/2, S*0.72);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(S/2, S/2, S/2, 0, Math.PI*2);
  ctx.fill();
}

function drawRoundedRect(ctx, x, y, w, h, r) {
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

function drawTierBadge(ctx, tier) {
  const tc = TIER_COLORS[tier];
  if (!tc.badge) return;
  const bw = 28, bh = 18, bx = S - bw - 4, by = 4, br = 5;
  // Shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;
  drawRoundedRect(ctx, bx, by, bw, bh, br);
  ctx.fillStyle = tc.badgeColor;
  ctx.fill();
  ctx.restore();
  // Border
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, bx, by, bw, bh, br);
  ctx.stroke();
  // Text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(tc.badge, bx + bw/2, by + bh/2 + 1);
}

function drawOuterRing(ctx, color, lineWidth = 2) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.arc(S/2, S/2, S/2 - lineWidth/2 - 1, 0, Math.PI*2);
  ctx.stroke();
}

function drawGlow(ctx, x, y, radius, color) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI*2);
  ctx.fill();
}

function drawMetallicChunk(ctx, cx, cy, size, baseColor, highlightColor) {
  // Irregular polygon for metal/ore chunks
  ctx.save();
  ctx.translate(cx, cy);
  const pts = [];
  const sides = 6;
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI*2/sides)*i - Math.PI/2;
    const r = size * (0.7 + Math.random()*0.3);
    pts.push([Math.cos(angle)*r, Math.sin(angle)*r]);
  }
  // Body gradient
  const g = ctx.createLinearGradient(-size, -size, size, size);
  g.addColorStop(0, highlightColor);
  g.addColorStop(0.5, baseColor);
  g.addColorStop(1, darken(baseColor, 0.4));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i-1];
    const cur = pts[i];
    const cpx = (prev[0]+cur[0])/2 + (Math.random()-0.5)*size*0.3;
    const cpy = (prev[1]+cur[1])/2 + (Math.random()-0.5)*size*0.3;
    ctx.quadraticCurveTo(cpx, cpy, cur[0], cur[1]);
  }
  ctx.closePath();
  ctx.fill();
  // Highlight arc
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(-size*0.15, -size*0.2, size*0.4, Math.PI*0.8, Math.PI*1.5);
  ctx.stroke();
  ctx.restore();
}

function darken(hex, amount) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgb(${Math.floor(r*(1-amount))},${Math.floor(g*(1-amount))},${Math.floor(b*(1-amount))})`;
}

function lighten(hex, amount) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgb(${Math.min(255,Math.floor(r+(255-r)*amount))},${Math.min(255,Math.floor(g+(255-g)*amount))},${Math.min(255,Math.floor(b+(255-b)*amount))})`;
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─── Item Drawing Functions ──────────────────────────────────

// Scrap metal: jagged metal chunks
function drawScrapMetal(ctx, tier) {
  // Seed a deterministic random for consistency
  const sr = seedRand(42);
  for (let i = 0; i < 3; i++) {
    const cx = 38 + i*24 + (sr()-0.5)*8;
    const cy = 60 + (sr()-0.5)*12;
    const sz = 16 + tier*3;
    drawMetallicChunkSeeded(ctx, cx, cy, sz, '#888888', '#CCCCCC', sr);
  }
  // Sparks
  if (tier >= 2) {
    for (let i = 0; i < 4; i++) {
      drawGlow(ctx, 40+sr()*48, 40+sr()*48, 4+tier, hexToRgba('#FFD700', 0.5));
    }
  }
}

function drawMetallicChunkSeeded(ctx, cx, cy, size, baseColor, highlightColor, sr) {
  ctx.save();
  ctx.translate(cx, cy);
  const sides = 6;
  const pts = [];
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI*2/sides)*i - Math.PI/2;
    const r = size * (0.7 + sr()*0.3);
    pts.push([Math.cos(angle)*r, Math.sin(angle)*r]);
  }
  const g = ctx.createLinearGradient(-size, -size, size, size);
  g.addColorStop(0, highlightColor);
  g.addColorStop(0.5, baseColor);
  g.addColorStop(1, darken(baseColor, 0.4));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i-1];
    const cur = pts[i];
    const cpx = (prev[0]+cur[0])/2 + (sr()-0.5)*size*0.3;
    const cpy = (prev[1]+cur[1])/2 + (sr()-0.5)*size*0.3;
    ctx.quadraticCurveTo(cpx, cpy, cur[0], cur[1]);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(-size*0.15, -size*0.2, size*0.35, Math.PI*0.8, Math.PI*1.5);
  ctx.stroke();
  ctx.restore();
}

function seedRand(seed) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}

// Salvaged wood: stacked planks
function drawSalvagedWood(ctx, tier) {
  const colors = ['#A0522D','#8B4513','#7A3B10'];
  for (let i = 0; i < 3; i++) {
    const y = 42 + i*16;
    const g = ctx.createLinearGradient(28, y, 100, y+12);
    g.addColorStop(0, lighten(colors[i%3], tier*0.1));
    g.addColorStop(0.5, colors[i%3]);
    g.addColorStop(1, darken(colors[i%3], 0.3));
    ctx.fillStyle = g;
    drawRoundedRect(ctx, 28, y, 72, 12, 3);
    ctx.fill();
    // Wood grain lines
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 0.5;
    for (let j = 0; j < 3; j++) {
      ctx.beginPath();
      ctx.moveTo(30, y + 3 + j*3);
      ctx.bezierCurveTo(50, y+2+j*3, 70, y+4+j*3, 98, y+3+j*3);
      ctx.stroke();
    }
  }
}

// Rusted pipes: cylindrical tubes
function drawRustedPipes(ctx, tier) {
  for (let i = 0; i < 2; i++) {
    const cx = 50 + i*20;
    const y1 = 34, y2 = 94;
    const r = 8 + tier*2;
    // Pipe body
    const g = ctx.createLinearGradient(cx-r, 0, cx+r, 0);
    g.addColorStop(0, '#6D4C41');
    g.addColorStop(0.3, '#A1887F');
    g.addColorStop(0.7, '#8D6E63');
    g.addColorStop(1, '#4E342E');
    ctx.fillStyle = g;
    drawRoundedRect(ctx, cx-r, y1, r*2, y2-y1, r);
    ctx.fill();
    // Rust spots
    ctx.fillStyle = 'rgba(180,80,30,0.4)';
    ctx.beginPath();
    ctx.ellipse(cx-2, 55+i*15, 5, 4, 0.3, 0, Math.PI*2);
    ctx.fill();
    // Highlight
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx-r+3, y1+5);
    ctx.lineTo(cx-r+3, y2-5);
    ctx.stroke();
  }
}

// Herbs: leaf sprigs
function drawHerbs(ctx, tier, hue) {
  const baseGreen = hue || '#4CAF50';
  // Stem
  ctx.strokeStyle = '#5D4037';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(64, 90);
  ctx.bezierCurveTo(64, 70, 60, 55, 58, 40);
  ctx.stroke();
  // Leaves
  const leafPositions = [[58,40,-0.4],[55,52,0.3],[62,48,-0.6],[50,60,0.5],[66,56,-0.3]];
  for (const [lx,ly,angle] of leafPositions) {
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(angle);
    const lg = ctx.createLinearGradient(0, -8, 0, 8);
    lg.addColorStop(0, lighten(baseGreen, 0.3 + tier*0.1));
    lg.addColorStop(1, baseGreen);
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-10, -6, -16, -2, -18, 4);
    ctx.bezierCurveTo(-14, 6, -6, 4, 0, 0);
    ctx.fill();
    // Vein
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-12, 1);
    ctx.stroke();
    ctx.restore();
  }
  if (tier >= 3) {
    drawGlow(ctx, 58, 50, 20, hexToRgba(baseGreen, 0.3));
  }
}

// Berries: cluster of round berries
function drawBerries(ctx, tier, color) {
  const positions = [[54,55],[64,50],[74,57],[58,68],[68,65],[62,78]];
  for (const [bx,by] of positions) {
    const r = 7 + tier;
    const g = ctx.createRadialGradient(bx-2, by-2, 1, bx, by, r);
    g.addColorStop(0, lighten(color, 0.5));
    g.addColorStop(0.6, color);
    g.addColorStop(1, darken(color, 0.3));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(bx, by, r, 0, Math.PI*2);
    ctx.fill();
    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.arc(bx-2, by-3, r*0.3, 0, Math.PI*2);
    ctx.fill();
  }
  // Stem
  ctx.strokeStyle = '#33691E';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(64, 42);
  ctx.bezierCurveTo(64, 48, 62, 52, 60, 55);
  ctx.stroke();
  // Small leaf
  ctx.fillStyle = '#4CAF50';
  ctx.beginPath();
  ctx.ellipse(66, 42, 8, 4, -0.3, 0, Math.PI*2);
  ctx.fill();
}

// Roots: twisted root forms
function drawRoots(ctx, tier, color) {
  const rootColor = color || '#8D6E63';
  ctx.lineWidth = 5 + tier;
  ctx.lineCap = 'round';
  // Main root
  const rg = ctx.createLinearGradient(40, 40, 90, 90);
  rg.addColorStop(0, lighten(rootColor, 0.3));
  rg.addColorStop(1, darken(rootColor, 0.3));
  ctx.strokeStyle = rg;
  ctx.beginPath();
  ctx.moveTo(64, 35);
  ctx.bezierCurveTo(55, 50, 50, 65, 45, 85);
  ctx.stroke();
  // Branch roots
  ctx.lineWidth = 3 + tier*0.5;
  ctx.beginPath();
  ctx.moveTo(58, 55);
  ctx.bezierCurveTo(70, 60, 78, 70, 85, 82);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(52, 65);
  ctx.bezierCurveTo(42, 72, 38, 78, 35, 88);
  ctx.stroke();
  // Tendrils
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = darken(rootColor, 0.1);
  ctx.beginPath();
  ctx.moveTo(85, 82);
  ctx.bezierCurveTo(88, 86, 92, 88, 95, 92);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(35, 88);
  ctx.bezierCurveTo(32, 90, 30, 93, 30, 96);
  ctx.stroke();
  // Top nub
  ctx.fillStyle = lighten(rootColor, 0.2);
  ctx.beginPath();
  ctx.ellipse(64, 35, 8, 5, 0, 0, Math.PI*2);
  ctx.fill();
}

// Mechanical parts: gear shapes
function drawMechanicalParts(ctx, tier) {
  // Large gear
  drawGear(ctx, 56, 60, 22 + tier*2, 8, '#78909C', '#B0BEC5');
  // Small gear
  drawGear(ctx, 80, 74, 12 + tier, 6, '#607D8B', '#90A4AE');
  // Axle
  ctx.fillStyle = '#455A64';
  ctx.beginPath();
  ctx.arc(56, 60, 5, 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = '#455A64';
  ctx.beginPath();
  ctx.arc(80, 74, 3, 0, Math.PI*2);
  ctx.fill();
}

function drawGear(ctx, cx, cy, outerR, teeth, baseColor, lightColor) {
  const innerR = outerR * 0.72;
  const toothDepth = outerR - innerR;
  ctx.save();
  ctx.translate(cx, cy);
  const g = ctx.createRadialGradient(0, 0, innerR*0.3, 0, 0, outerR);
  g.addColorStop(0, lightColor);
  g.addColorStop(1, baseColor);
  ctx.fillStyle = g;
  ctx.beginPath();
  for (let i = 0; i < teeth; i++) {
    const a1 = (Math.PI*2/teeth)*i;
    const a2 = a1 + Math.PI/teeth * 0.4;
    const a3 = a1 + Math.PI/teeth * 0.6;
    const a4 = a1 + Math.PI/teeth;
    ctx.lineTo(Math.cos(a1)*outerR, Math.sin(a1)*outerR);
    ctx.lineTo(Math.cos(a2)*outerR, Math.sin(a2)*outerR);
    ctx.lineTo(Math.cos(a3)*innerR, Math.sin(a3)*innerR);
    ctx.lineTo(Math.cos(a4)*innerR, Math.sin(a4)*innerR);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

// Electronic components: circuit board chip
function drawElectronicComponents(ctx, tier) {
  // Chip body
  const g = ctx.createLinearGradient(38, 40, 90, 88);
  g.addColorStop(0, '#263238');
  g.addColorStop(0.5, '#37474F');
  g.addColorStop(1, '#263238');
  ctx.fillStyle = g;
  drawRoundedRect(ctx, 42, 44, 44, 40, 4);
  ctx.fill();
  // Chip label
  ctx.fillStyle = '#4DB6AC';
  ctx.font = 'bold 8px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('IC', 64, 66);
  // Pins
  ctx.strokeStyle = '#B0BEC5';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    // Top pins
    const x = 48 + i*8;
    ctx.beginPath(); ctx.moveTo(x, 44); ctx.lineTo(x, 36); ctx.stroke();
    // Bottom pins
    ctx.beginPath(); ctx.moveTo(x, 84); ctx.lineTo(x, 92); ctx.stroke();
  }
  // Left/right pins
  for (let i = 0; i < 3; i++) {
    const y = 50 + i*10;
    ctx.beginPath(); ctx.moveTo(42, y); ctx.lineTo(34, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(86, y); ctx.lineTo(94, y); ctx.stroke();
  }
  // Trace lines
  if (tier >= 2) {
    ctx.strokeStyle = hexToRgba('#4DB6AC', 0.3);
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(48+i*8, 36);
      ctx.bezierCurveTo(48+i*8, 30, 55+i*5, 28, 64, 26);
      ctx.stroke();
    }
  }
}

// Chemical fluids: flask/vial
function drawChemicalFluids(ctx, tier, fluidColor) {
  const color = fluidColor || '#76FF03';
  // Flask body
  ctx.save();
  // Neck
  ctx.fillStyle = 'rgba(200,220,240,0.4)';
  drawRoundedRect(ctx, 58, 32, 12, 18, 3);
  ctx.fill();
  // Bulb (conical flask)
  ctx.beginPath();
  ctx.moveTo(58, 50);
  ctx.lineTo(38, 90);
  ctx.quadraticCurveTo(38, 96, 44, 96);
  ctx.lineTo(84, 96);
  ctx.quadraticCurveTo(90, 96, 90, 90);
  ctx.lineTo(70, 50);
  ctx.closePath();
  ctx.fillStyle = 'rgba(200,220,240,0.25)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(200,220,240,0.5)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Fluid
  const fg = ctx.createLinearGradient(40, 65, 88, 96);
  fg.addColorStop(0, hexToRgba(color, 0.7));
  fg.addColorStop(1, hexToRgba(color, 0.9));
  ctx.fillStyle = fg;
  ctx.beginPath();
  ctx.moveTo(48, 70);
  // Wavy surface
  ctx.bezierCurveTo(54, 67, 62, 73, 68, 68);
  ctx.bezierCurveTo(74, 73, 78, 69, 80, 70);
  ctx.lineTo(88, 92);
  ctx.quadraticCurveTo(88, 96, 84, 96);
  ctx.lineTo(44, 96);
  ctx.quadraticCurveTo(40, 96, 40, 92);
  ctx.closePath();
  ctx.fill();
  // Bubbles
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath(); ctx.arc(55, 82, 3, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(70, 78, 2, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(62, 86, 2.5, 0, Math.PI*2); ctx.fill();
  // Cork
  ctx.fillStyle = '#A1887F';
  drawRoundedRect(ctx, 56, 28, 16, 8, 3);
  ctx.fill();
  ctx.restore();
  if (tier >= 3) {
    drawGlow(ctx, 64, 80, 25, hexToRgba(color, 0.25));
  }
}

// Water drops
function drawWaterDrop(ctx, tier, tint) {
  const baseBlue = tint || '#2196F3';
  // Large central drop
  const cx = 64, cy = 62, r = 24 + tier*2;
  ctx.save();
  // Drop shape (teardrop)
  ctx.beginPath();
  ctx.moveTo(cx, cy - r*1.3);
  ctx.bezierCurveTo(cx + r*0.4, cy - r*0.5, cx + r, cy, cx + r*0.8, cy + r*0.5);
  ctx.bezierCurveTo(cx + r*0.5, cy + r, cx - r*0.5, cy + r, cx - r*0.8, cy + r*0.5);
  ctx.bezierCurveTo(cx - r, cy, cx - r*0.4, cy - r*0.5, cx, cy - r*1.3);
  ctx.closePath();
  const wg = ctx.createRadialGradient(cx-5, cy-5, 2, cx, cy+5, r);
  wg.addColorStop(0, lighten(baseBlue, 0.5));
  wg.addColorStop(0.5, baseBlue);
  wg.addColorStop(1, darken(baseBlue, 0.3));
  ctx.fillStyle = wg;
  ctx.fill();
  // Specular highlight
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.ellipse(cx - 6, cy - 8, 6, 10, -0.3, 0, Math.PI*2);
  ctx.fill();
  // Small secondary drops
  ctx.fillStyle = hexToRgba(baseBlue, 0.6);
  ctx.beginPath(); ctx.arc(cx+22, cy+14, 5, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx-20, cy+18, 4, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

// Ore chunks
function drawOreChunk(ctx, tier, oreColor, sparkleColor) {
  const sr = seedRand(137);
  // Main rock body
  drawMetallicChunkSeeded(ctx, 58, 62, 26+tier*2, '#5D4037', '#8D6E63', sr);
  // Ore veins/crystals
  for (let i = 0; i < 4+tier; i++) {
    const ox = 42 + sr()*44;
    const oy = 46 + sr()*36;
    const os = 4 + sr()*5 + tier;
    const og = ctx.createRadialGradient(ox, oy, 0, ox, oy, os);
    og.addColorStop(0, lighten(oreColor, 0.5));
    og.addColorStop(0.5, oreColor);
    og.addColorStop(1, darken(oreColor, 0.3));
    ctx.fillStyle = og;
    ctx.beginPath();
    ctx.ellipse(ox, oy, os, os*0.7, sr()*Math.PI, 0, Math.PI*2);
    ctx.fill();
  }
  // Sparkles for higher tiers
  if (tier >= 2) {
    for (let i = 0; i < 3; i++) {
      drawStar(ctx, 38+sr()*52, 42+sr()*44, 3, sparkleColor || '#FFFFFF');
    }
  }
}

function drawStar(ctx, x, y, size, color) {
  ctx.fillStyle = color;
  ctx.save();
  ctx.translate(x, y);
  // Four-pointed star
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.bezierCurveTo(size*0.15, -size*0.15, size*0.15, -size*0.15, size, 0);
  ctx.bezierCurveTo(size*0.15, size*0.15, size*0.15, size*0.15, 0, size);
  ctx.bezierCurveTo(-size*0.15, size*0.15, -size*0.15, size*0.15, -size, 0);
  ctx.bezierCurveTo(-size*0.15, -size*0.15, -size*0.15, -size*0.15, 0, -size);
  ctx.fill();
  ctx.restore();
}

// ─── Tool Drawing Functions ──────────────────────────────────

function drawPrybar(ctx, tier) {
  const color = tier === 3 ? '#546E7A' : '#795548';
  const accent = tier === 3 ? '#B0BEC5' : '#A1887F';
  ctx.save();
  ctx.translate(64, 64);
  ctx.rotate(-0.5);
  // Shaft
  const sg = ctx.createLinearGradient(-6, -40, 6, 40);
  sg.addColorStop(0, accent);
  sg.addColorStop(0.5, color);
  sg.addColorStop(1, darken(color, 0.3));
  ctx.fillStyle = sg;
  drawRoundedRect(ctx, -5, -38, 10, 76, 3);
  ctx.fill();
  // Curved claw end
  ctx.strokeStyle = accent;
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -38);
  ctx.bezierCurveTo(-10, -44, -18, -40, -20, -30);
  ctx.stroke();
  // Flat end
  ctx.fillStyle = darken(color, 0.2);
  drawRoundedRect(ctx, -8, 34, 16, 6, 2);
  ctx.fill();
  // Highlight
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-3, -30);
  ctx.lineTo(-3, 30);
  ctx.stroke();
  ctx.restore();
}

function drawSickle(ctx, tier) {
  const bladeColor = tier === 3 ? '#37474F' : '#607D8B';
  const handleColor = tier === 3 ? '#3E2723' : '#5D4037';
  ctx.save();
  ctx.translate(64, 64);
  // Handle
  const hg = ctx.createLinearGradient(-4, 10, 4, 10);
  hg.addColorStop(0, lighten(handleColor, 0.2));
  hg.addColorStop(0.5, handleColor);
  hg.addColorStop(1, darken(handleColor, 0.2));
  ctx.fillStyle = hg;
  drawRoundedRect(ctx, -4, 5, 8, 35, 3);
  ctx.fill();
  // Blade (curved)
  const bg = ctx.createLinearGradient(-30, -30, 10, 10);
  bg.addColorStop(0, lighten(bladeColor, 0.4));
  bg.addColorStop(0.5, bladeColor);
  bg.addColorStop(1, darken(bladeColor, 0.3));
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.moveTo(0, 8);
  ctx.bezierCurveTo(-5, -5, -25, -20, -32, -28);
  ctx.bezierCurveTo(-35, -32, -30, -36, -25, -33);
  ctx.bezierCurveTo(-15, -28, 5, -10, 6, 5);
  ctx.closePath();
  ctx.fill();
  // Blade edge highlight
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.bezierCurveTo(-5, -5, -25, -20, -32, -28);
  ctx.stroke();
  ctx.restore();
}

function drawScanner(ctx, tier) {
  const bodyColor = tier === 3 ? '#1A237E' : '#37474F';
  ctx.save();
  ctx.translate(64, 64);
  // Body
  const bg = ctx.createLinearGradient(-20, -25, 20, 25);
  bg.addColorStop(0, lighten(bodyColor, 0.2));
  bg.addColorStop(1, bodyColor);
  ctx.fillStyle = bg;
  drawRoundedRect(ctx, -20, -28, 40, 52, 6);
  ctx.fill();
  // Screen
  const sg = ctx.createLinearGradient(-14, -22, 14, 2);
  sg.addColorStop(0, '#1B5E20');
  sg.addColorStop(1, '#4CAF50');
  ctx.fillStyle = sg;
  drawRoundedRect(ctx, -14, -22, 28, 28, 3);
  ctx.fill();
  // Scan line
  ctx.strokeStyle = '#76FF03';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-10, -8);
  ctx.lineTo(10, -8);
  ctx.stroke();
  // Blip dots
  ctx.fillStyle = '#76FF03';
  ctx.beginPath(); ctx.arc(-4, -14, 2, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(6, -10, 1.5, 0, Math.PI*2); ctx.fill();
  // Antenna
  ctx.strokeStyle = '#90A4AE';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(12, -28);
  ctx.lineTo(16, -38);
  ctx.stroke();
  ctx.fillStyle = '#F44336';
  ctx.beginPath(); ctx.arc(16, -38, 3, 0, Math.PI*2); ctx.fill();
  // Buttons
  ctx.fillStyle = '#78909C';
  ctx.beginPath(); ctx.arc(-6, 14, 4, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(6, 14, 4, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

function drawWaterFilter(ctx, tier) {
  const tubeColor = tier === 3 ? '#1565C0' : '#546E7A';
  ctx.save();
  ctx.translate(64, 64);
  // Top funnel
  ctx.fillStyle = 'rgba(200,220,240,0.35)';
  ctx.beginPath();
  ctx.moveTo(-22, -30);
  ctx.lineTo(22, -30);
  ctx.lineTo(8, -8);
  ctx.lineTo(-8, -8);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(200,220,240,0.5)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  // Central tube
  const tg = ctx.createLinearGradient(-6, -8, 6, -8);
  tg.addColorStop(0, lighten(tubeColor, 0.3));
  tg.addColorStop(0.5, tubeColor);
  tg.addColorStop(1, darken(tubeColor, 0.2));
  ctx.fillStyle = tg;
  drawRoundedRect(ctx, -6, -8, 12, 30, 3);
  ctx.fill();
  // Filter layers inside tube
  const layerColors = ['#BCAAA4','#78909C','#4DB6AC'];
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = hexToRgba(layerColors[i], 0.5);
    ctx.fillRect(-5, -4 + i*8, 10, 6);
  }
  // Bottom container
  const cg = ctx.createLinearGradient(-16, 22, 16, 22);
  cg.addColorStop(0, 'rgba(200,220,240,0.3)');
  cg.addColorStop(0.5, 'rgba(200,220,240,0.15)');
  cg.addColorStop(1, 'rgba(200,220,240,0.3)');
  ctx.fillStyle = cg;
  drawRoundedRect(ctx, -16, 22, 32, 20, 5);
  ctx.fill();
  ctx.strokeStyle = 'rgba(200,220,240,0.4)';
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, -16, 22, 32, 20, 5);
  ctx.stroke();
  // Clean water in container
  ctx.fillStyle = 'rgba(100,181,246,0.5)';
  drawRoundedRect(ctx, -14, 30, 28, 10, 3);
  ctx.fill();
  // Drip
  ctx.fillStyle = '#64B5F6';
  ctx.beginPath();
  ctx.moveTo(0, 22);
  ctx.bezierCurveTo(-2, 24, -3, 27, 0, 29);
  ctx.bezierCurveTo(3, 27, 2, 24, 0, 22);
  ctx.fill();
  ctx.restore();
}

function drawPickaxe(ctx, tier) {
  const headColor = tier === 3 ? '#455A64' : '#78909C';
  const handleColor = tier === 3 ? '#3E2723' : '#6D4C41';
  ctx.save();
  ctx.translate(64, 64);
  ctx.rotate(0.5);
  // Handle
  const hg = ctx.createLinearGradient(-3, -5, 3, -5);
  hg.addColorStop(0, lighten(handleColor, 0.2));
  hg.addColorStop(0.5, handleColor);
  hg.addColorStop(1, darken(handleColor, 0.2));
  ctx.fillStyle = hg;
  drawRoundedRect(ctx, -3, -5, 6, 45, 2);
  ctx.fill();
  // Pick head
  const pg = ctx.createLinearGradient(-30, -12, 30, -12);
  pg.addColorStop(0, lighten(headColor, 0.4));
  pg.addColorStop(0.3, headColor);
  pg.addColorStop(1, darken(headColor, 0.3));
  ctx.fillStyle = pg;
  ctx.beginPath();
  // Right pick point
  ctx.moveTo(5, -8);
  ctx.bezierCurveTo(15, -14, 28, -22, 32, -28);
  ctx.bezierCurveTo(34, -30, 32, -32, 30, -30);
  ctx.bezierCurveTo(26, -24, 14, -16, 5, -14);
  // Left pick point
  ctx.moveTo(-5, -8);
  ctx.bezierCurveTo(-15, -14, -28, -22, -32, -28);
  ctx.bezierCurveTo(-34, -30, -32, -32, -30, -30);
  ctx.bezierCurveTo(-26, -24, -14, -16, -5, -14);
  ctx.closePath();
  ctx.fill();
  // Head block
  ctx.fillStyle = headColor;
  drawRoundedRect(ctx, -8, -16, 16, 12, 3);
  ctx.fill();
  // Highlight on head
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-6, -14);
  ctx.lineTo(6, -14);
  ctx.stroke();
  ctx.restore();
}

// ─── Consumable Drawing Functions ────────────────────────────

function drawBowl(ctx, stewColor, steamColor) {
  const color = stewColor || '#8D6E63';
  ctx.save();
  ctx.translate(64, 64);
  // Bowl body
  ctx.beginPath();
  ctx.moveTo(-28, 0);
  ctx.bezierCurveTo(-28, 20, -18, 28, 0, 28);
  ctx.bezierCurveTo(18, 28, 28, 20, 28, 0);
  ctx.lineTo(28, 0);
  ctx.lineTo(-28, 0);
  ctx.closePath();
  const bg = ctx.createLinearGradient(-28, 0, 28, 28);
  bg.addColorStop(0, '#BCAAA4');
  bg.addColorStop(0.5, '#A1887F');
  bg.addColorStop(1, '#8D6E63');
  ctx.fillStyle = bg;
  ctx.fill();
  // Food surface (ellipse)
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, 26, 8, 0, 0, Math.PI*2);
  ctx.fill();
  // Chunks in stew
  ctx.fillStyle = darken(color, 0.2);
  ctx.beginPath(); ctx.ellipse(-8, -2, 5, 3, 0.3, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(10, 1, 4, 3, -0.2, 0, Math.PI*2); ctx.fill();
  // Steam wisps
  const sc = steamColor || 'rgba(255,255,255,0.3)';
  ctx.strokeStyle = sc;
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    const sx = -10 + i*10;
    ctx.moveTo(sx, -4);
    ctx.bezierCurveTo(sx-3, -12, sx+3, -18, sx-2, -26);
    ctx.stroke();
  }
  ctx.restore();
}

function drawMeatJerky(ctx) {
  ctx.save();
  ctx.translate(64, 64);
  // Multiple strips
  for (let i = 0; i < 3; i++) {
    const ox = -16 + i*14;
    const g = ctx.createLinearGradient(ox, -20, ox+12, 20);
    g.addColorStop(0, '#6D4C41');
    g.addColorStop(0.3, '#8D6E63');
    g.addColorStop(0.7, '#5D4037');
    g.addColorStop(1, '#4E342E');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(ox, -20);
    ctx.bezierCurveTo(ox+4, -18, ox+10, -16, ox+12, -20);
    ctx.lineTo(ox+12, 20);
    ctx.bezierCurveTo(ox+8, 22, ox+4, 18, ox, 20);
    ctx.closePath();
    ctx.fill();
    // Texture lines
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 0.5;
    for (let j = -14; j < 16; j += 4) {
      ctx.beginPath();
      ctx.moveTo(ox+1, j);
      ctx.lineTo(ox+11, j);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawTeaCup(ctx, teaColor) {
  const color = teaColor || '#4CAF50';
  ctx.save();
  ctx.translate(64, 64);
  // Cup body
  const cg = ctx.createLinearGradient(-20, -14, 20, 20);
  cg.addColorStop(0, '#EFEBE9');
  cg.addColorStop(1, '#D7CCC8');
  ctx.fillStyle = cg;
  ctx.beginPath();
  ctx.moveTo(-20, -14);
  ctx.lineTo(-16, 20);
  ctx.quadraticCurveTo(-16, 24, -12, 24);
  ctx.lineTo(12, 24);
  ctx.quadraticCurveTo(16, 24, 16, 20);
  ctx.lineTo(20, -14);
  ctx.closePath();
  ctx.fill();
  // Tea liquid
  ctx.fillStyle = hexToRgba(color, 0.7);
  ctx.beginPath();
  ctx.ellipse(0, -8, 18, 6, 0, 0, Math.PI*2);
  ctx.fill();
  // Handle
  ctx.strokeStyle = '#D7CCC8';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(24, 4, 10, -Math.PI/2, Math.PI/2);
  ctx.stroke();
  // Steam
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  for (let i = 0; i < 2; i++) {
    ctx.beginPath();
    ctx.moveTo(-6+i*12, -14);
    ctx.bezierCurveTo(-8+i*12, -22, -4+i*12, -28, -6+i*12, -34);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPotionBottle(ctx, liquidColor, size) {
  const sz = size || 1.0;
  ctx.save();
  ctx.translate(64, 64);
  ctx.scale(sz, sz);
  // Bottle body (round bottom)
  ctx.fillStyle = 'rgba(200,220,240,0.3)';
  ctx.beginPath();
  ctx.moveTo(-6, -22);
  ctx.lineTo(-6, -10);
  ctx.bezierCurveTo(-20, -6, -20, 20, 0, 24);
  ctx.bezierCurveTo(20, 20, 20, -6, 6, -10);
  ctx.lineTo(6, -22);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(200,220,240,0.5)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  // Liquid fill
  const lg = ctx.createLinearGradient(0, -2, 0, 22);
  lg.addColorStop(0, hexToRgba(liquidColor, 0.6));
  lg.addColorStop(1, hexToRgba(liquidColor, 0.9));
  ctx.fillStyle = lg;
  ctx.beginPath();
  ctx.moveTo(-16, 4);
  ctx.bezierCurveTo(-18, 18, -12, 22, 0, 24);
  ctx.bezierCurveTo(12, 22, 18, 18, 16, 4);
  // Wavy top
  ctx.bezierCurveTo(10, 2, 4, 6, -2, 3);
  ctx.bezierCurveTo(-8, 1, -12, 5, -16, 4);
  ctx.fill();
  // Cork
  ctx.fillStyle = '#A1887F';
  drawRoundedRect(ctx, -7, -28, 14, 8, 3);
  ctx.fill();
  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.beginPath();
  ctx.ellipse(-8, 4, 3, 10, -0.2, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();
}

function drawSyringe(ctx, liquidColor) {
  ctx.save();
  ctx.translate(64, 64);
  ctx.rotate(-0.4);
  // Barrel
  ctx.fillStyle = 'rgba(200,220,240,0.35)';
  drawRoundedRect(ctx, -6, -24, 12, 38, 3);
  ctx.fill();
  ctx.strokeStyle = 'rgba(200,220,240,0.5)';
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, -6, -24, 12, 38, 3);
  ctx.stroke();
  // Liquid inside
  ctx.fillStyle = hexToRgba(liquidColor, 0.6);
  drawRoundedRect(ctx, -4, -4, 8, 16, 2);
  ctx.fill();
  // Plunger top
  ctx.fillStyle = '#78909C';
  drawRoundedRect(ctx, -8, -32, 16, 10, 2);
  ctx.fill();
  // Plunger rod
  ctx.fillStyle = '#90A4AE';
  ctx.fillRect(-2, -24, 4, 6);
  // Needle
  ctx.strokeStyle = '#B0BEC5';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 14);
  ctx.lineTo(0, 28);
  ctx.stroke();
  // Needle tip
  ctx.strokeStyle = '#CFD8DC';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 28);
  ctx.lineTo(0, 34);
  ctx.stroke();
  // Measurement lines
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 0.5;
  for (let i = -20; i < 12; i += 6) {
    ctx.beginPath();
    ctx.moveTo(-4, i);
    ctx.lineTo(-2, i);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPill(ctx, color1, color2) {
  ctx.save();
  ctx.translate(64, 64);
  ctx.rotate(0.3);
  // Left half
  const lg = ctx.createLinearGradient(-18, -8, -18, 8);
  lg.addColorStop(0, lighten(color1, 0.3));
  lg.addColorStop(0.5, color1);
  lg.addColorStop(1, darken(color1, 0.2));
  ctx.fillStyle = lg;
  ctx.beginPath();
  ctx.arc(-8, 0, 10, Math.PI/2, Math.PI*3/2);
  ctx.lineTo(0, -10);
  ctx.lineTo(0, 10);
  ctx.closePath();
  ctx.fill();
  // Right half
  const rg = ctx.createLinearGradient(0, -8, 0, 8);
  rg.addColorStop(0, lighten(color2, 0.3));
  rg.addColorStop(0.5, color2);
  rg.addColorStop(1, darken(color2, 0.2));
  ctx.fillStyle = rg;
  ctx.beginPath();
  ctx.arc(8, 0, 10, -Math.PI/2, Math.PI/2);
  ctx.lineTo(0, 10);
  ctx.lineTo(0, -10);
  ctx.closePath();
  ctx.fill();
  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath();
  ctx.ellipse(-4, -5, 12, 3, -0.1, 0, Math.PI*2);
  ctx.fill();
  // Dividing line
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(0, 10);
  ctx.stroke();
  ctx.restore();
}

function drawVial(ctx, liquidColor) {
  ctx.save();
  ctx.translate(64, 64);
  // Vial body (thin cylinder)
  ctx.fillStyle = 'rgba(200,220,240,0.3)';
  drawRoundedRect(ctx, -8, -20, 16, 42, 6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(200,220,240,0.5)';
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, -8, -20, 16, 42, 6);
  ctx.stroke();
  // Liquid
  const lg = ctx.createLinearGradient(0, 0, 0, 20);
  lg.addColorStop(0, hexToRgba(liquidColor, 0.6));
  lg.addColorStop(1, hexToRgba(liquidColor, 0.9));
  ctx.fillStyle = lg;
  drawRoundedRect(ctx, -6, 0, 12, 20, 4);
  ctx.fill();
  // Cap
  ctx.fillStyle = '#78909C';
  drawRoundedRect(ctx, -9, -26, 18, 8, 3);
  ctx.fill();
  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.beginPath();
  ctx.ellipse(-3, 0, 2, 14, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();
}

function drawFlask(ctx, liquidColor) {
  ctx.save();
  ctx.translate(64, 64);
  // Erlenmeyer flask
  ctx.beginPath();
  ctx.moveTo(-4, -24);
  ctx.lineTo(-4, -8);
  ctx.lineTo(-22, 20);
  ctx.quadraticCurveTo(-22, 26, -16, 26);
  ctx.lineTo(16, 26);
  ctx.quadraticCurveTo(22, 26, 22, 20);
  ctx.lineTo(4, -8);
  ctx.lineTo(4, -24);
  ctx.closePath();
  ctx.fillStyle = 'rgba(200,220,240,0.25)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(200,220,240,0.5)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  // Liquid
  const lg = ctx.createLinearGradient(0, 4, 0, 24);
  lg.addColorStop(0, hexToRgba(liquidColor, 0.5));
  lg.addColorStop(1, hexToRgba(liquidColor, 0.85));
  ctx.fillStyle = lg;
  ctx.beginPath();
  ctx.moveTo(-14, 8);
  ctx.bezierCurveTo(-8, 6, 0, 10, 8, 7);
  ctx.bezierCurveTo(12, 6, 14, 8, 14, 8);
  ctx.lineTo(20, 20);
  ctx.quadraticCurveTo(20, 24, 16, 24);
  ctx.lineTo(-16, 24);
  ctx.quadraticCurveTo(-20, 24, -20, 20);
  ctx.closePath();
  ctx.fill();
  // Cork
  ctx.fillStyle = '#A1887F';
  drawRoundedRect(ctx, -5, -30, 10, 8, 3);
  ctx.fill();
  ctx.restore();
}

function drawGemstone(ctx, color, glowColor) {
  ctx.save();
  ctx.translate(64, 64);
  // Faceted gem shape
  const g = ctx.createLinearGradient(-16, -16, 16, 16);
  g.addColorStop(0, lighten(color, 0.5));
  g.addColorStop(0.4, color);
  g.addColorStop(1, darken(color, 0.3));
  ctx.fillStyle = g;
  // Diamond shape
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(18, -4);
  ctx.lineTo(12, 18);
  ctx.lineTo(-12, 18);
  ctx.lineTo(-18, -4);
  ctx.closePath();
  ctx.fill();
  // Inner facet lines
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(0, -20); ctx.lineTo(-5, 4); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -20); ctx.lineTo(5, 4); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-18, -4); ctx.lineTo(-5, 4); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(18, -4); ctx.lineTo(5, 4); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-5, 4); ctx.lineTo(-12, 18); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(5, 4); ctx.lineTo(12, 18); ctx.stroke();
  // Glow
  if (glowColor) {
    drawGlow(ctx, 0, 0, 30, hexToRgba(glowColor, 0.2));
  }
  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(-10, -6);
  ctx.lineTo(-2, 0);
  ctx.lineTo(0, -20);
  ctx.fill();
  ctx.restore();
}

function drawChessPiece(ctx) {
  ctx.save();
  ctx.translate(64, 64);
  // Purple glow background
  drawGlow(ctx, 0, 0, 50, 'rgba(156,39,176,0.3)');
  // Base
  const bg = ctx.createLinearGradient(-18, 24, 18, 24);
  bg.addColorStop(0, '#B8860B');
  bg.addColorStop(0.5, '#FFD700');
  bg.addColorStop(1, '#B8860B');
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.ellipse(0, 24, 18, 6, 0, 0, Math.PI*2);
  ctx.fill();
  // Body (king piece silhouette)
  const kg = ctx.createLinearGradient(-12, -30, 12, 24);
  kg.addColorStop(0, '#FFD700');
  kg.addColorStop(0.3, '#FFC107');
  kg.addColorStop(0.7, '#F9A825');
  kg.addColorStop(1, '#B8860B');
  ctx.fillStyle = kg;
  ctx.beginPath();
  ctx.moveTo(-14, 22);
  ctx.lineTo(-16, 18);
  ctx.lineTo(-12, 14);
  ctx.lineTo(-8, 8);
  ctx.bezierCurveTo(-10, 0, -10, -8, -6, -14);
  ctx.lineTo(-8, -18);
  ctx.bezierCurveTo(-8, -22, -4, -24, 0, -24);
  ctx.bezierCurveTo(4, -24, 8, -22, 8, -18);
  ctx.lineTo(6, -14);
  ctx.bezierCurveTo(10, -8, 10, 0, 8, 8);
  ctx.lineTo(12, 14);
  ctx.lineTo(16, 18);
  ctx.lineTo(14, 22);
  ctx.closePath();
  ctx.fill();
  // Cross on top
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(-2, -34, 4, 12);
  ctx.fillRect(-5, -30, 10, 4);
  // Gold highlight
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-6, 16);
  ctx.bezierCurveTo(-6, 2, -4, -12, 0, -22);
  ctx.stroke();
  // Purple gems embedded
  ctx.fillStyle = '#CE93D8';
  ctx.beginPath(); ctx.arc(0, 4, 3, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#AB47BC';
  ctx.beginPath(); ctx.arc(0, 4, 1.5, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

function drawRoastedRoot(ctx) {
  ctx.save();
  ctx.translate(64, 64);
  // Root body
  for (let i = 0; i < 2; i++) {
    const ox = -12 + i*14;
    const g = ctx.createLinearGradient(ox, -15, ox+14, 15);
    g.addColorStop(0, '#A1887F');
    g.addColorStop(0.3, '#6D4C41');
    g.addColorStop(0.7, '#5D4037');
    g.addColorStop(1, '#3E2723');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(ox, -16);
    ctx.bezierCurveTo(ox+6, -18, ox+12, -14, ox+14, -10);
    ctx.bezierCurveTo(ox+16, 0, ox+12, 14, ox+8, 20);
    ctx.bezierCurveTo(ox+4, 22, ox-2, 18, ox-2, 10);
    ctx.bezierCurveTo(ox-4, 0, ox-2, -10, ox, -16);
    ctx.fill();
  }
  // Char marks
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(-8 + i*8, -10);
    ctx.lineTo(-6 + i*8, 10);
    ctx.stroke();
  }
  // Heat shimmer
  ctx.strokeStyle = 'rgba(255,140,0,0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-4, -20);
  ctx.bezierCurveTo(-6, -26, -2, -30, -4, -36);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(10, -18);
  ctx.bezierCurveTo(8, -24, 12, -28, 10, -34);
  ctx.stroke();
  ctx.restore();
}

function drawFortifiedRations(ctx) {
  // Wrapped bar / MRE pack
  ctx.save();
  ctx.translate(64, 64);
  // Package
  const pg = ctx.createLinearGradient(-22, -14, 22, 14);
  pg.addColorStop(0, '#6D4C41');
  pg.addColorStop(0.5, '#795548');
  pg.addColorStop(1, '#5D4037');
  ctx.fillStyle = pg;
  drawRoundedRect(ctx, -22, -14, 44, 28, 4);
  ctx.fill();
  // Label stripe
  ctx.fillStyle = '#4E342E';
  ctx.fillRect(-20, -4, 40, 8);
  // Text on label
  ctx.fillStyle = '#BCAAA4';
  ctx.font = 'bold 7px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('RATIONS', 0, 2);
  // Seal
  ctx.fillStyle = '#8D6E63';
  ctx.beginPath();
  ctx.arc(16, -8, 4, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();
}

// ─── Master Item Definitions ────────────────────────────────

const RESOURCES = [
  // T1 Scavenging
  { name: 'scrap_metal', tier: 1, category: 'scavenging', draw: (ctx) => drawScrapMetal(ctx, 1) },
  { name: 'salvaged_wood', tier: 1, category: 'scavenging', draw: (ctx) => drawSalvagedWood(ctx, 1) },
  { name: 'rusted_pipes', tier: 1, category: 'scavenging', draw: (ctx) => drawRustedPipes(ctx, 1) },
  // T1 Foraging
  { name: 'wild_herbs', tier: 1, category: 'foraging', draw: (ctx) => drawHerbs(ctx, 1, '#4CAF50') },
  { name: 'wasteland_berries', tier: 1, category: 'foraging', draw: (ctx) => drawBerries(ctx, 1, '#E91E63') },
  { name: 'mutant_roots', tier: 1, category: 'foraging', draw: (ctx) => drawRoots(ctx, 1, '#8D6E63') },
  // T1 Salvage
  { name: 'mechanical_parts', tier: 1, category: 'salvage', draw: (ctx) => drawMechanicalParts(ctx, 1) },
  { name: 'electronic_components', tier: 1, category: 'salvage', draw: (ctx) => drawElectronicComponents(ctx, 1) },
  { name: 'chemical_fluids', tier: 1, category: 'salvage', draw: (ctx) => drawChemicalFluids(ctx, 1, '#76FF03') },
  // T1 Water
  { name: 'rainwater', tier: 1, category: 'water', draw: (ctx) => drawWaterDrop(ctx, 1, '#90CAF9') },
  { name: 'well_water', tier: 1, category: 'water', draw: (ctx) => drawWaterDrop(ctx, 1, '#42A5F5') },
  { name: 'river_water', tier: 1, category: 'water', draw: (ctx) => drawWaterDrop(ctx, 1, '#1E88E5') },
  // T1 Prospecting
  { name: 'iron_ore', tier: 1, category: 'prospecting', draw: (ctx) => drawOreChunk(ctx, 1, '#B0BEC5', '#FFFFFF') },
  { name: 'copper_ore', tier: 1, category: 'prospecting', draw: (ctx) => drawOreChunk(ctx, 1, '#FF8A65', '#FFD54F') },
  { name: 'raw_stone', tier: 1, category: 'prospecting', draw: (ctx) => drawOreChunk(ctx, 1, '#9E9E9E', '#E0E0E0') },

  // T2 Scavenging
  { name: 'tempered_steel', tier: 2, category: 'scavenging', draw: (ctx) => drawScrapMetal(ctx, 2) },
  { name: 'refined_lumber', tier: 2, category: 'scavenging', draw: (ctx) => drawSalvagedWood(ctx, 2) },
  { name: 'chrome_pipes', tier: 2, category: 'scavenging', draw: (ctx) => drawRustedPipes(ctx, 2) },
  // T2 Foraging
  { name: 'irradiated_moss', tier: 2, category: 'foraging', draw: (ctx) => drawHerbs(ctx, 2, '#66BB6A') },
  { name: 'glow_berries', tier: 2, category: 'foraging', draw: (ctx) => drawBerries(ctx, 2, '#AB47BC') },
  { name: 'deep_roots', tier: 2, category: 'foraging', draw: (ctx) => drawRoots(ctx, 2, '#6D4C41') },
  // T2 Salvage
  { name: 'precision_gears', tier: 2, category: 'salvage', draw: (ctx) => drawMechanicalParts(ctx, 2) },
  { name: 'quantum_chips', tier: 2, category: 'salvage', draw: (ctx) => drawElectronicComponents(ctx, 2) },
  { name: 'volatile_compounds', tier: 2, category: 'salvage', draw: (ctx) => drawChemicalFluids(ctx, 2, '#FF9800') },
  // T2 Water
  { name: 'purified_water', tier: 2, category: 'water', draw: (ctx) => drawWaterDrop(ctx, 2, '#42A5F5') },
  { name: 'mineral_water', tier: 2, category: 'water', draw: (ctx) => drawWaterDrop(ctx, 2, '#26C6DA') },
  { name: 'distilled_water', tier: 2, category: 'water', draw: (ctx) => drawWaterDrop(ctx, 2, '#80DEEA') },
  // T2 Prospecting
  { name: 'steel_ore', tier: 2, category: 'prospecting', draw: (ctx) => drawOreChunk(ctx, 2, '#78909C', '#B0BEC5') },
  { name: 'titanium_ore', tier: 2, category: 'prospecting', draw: (ctx) => drawOreChunk(ctx, 2, '#90A4AE', '#CFD8DC') },
  { name: 'crystal_stone', tier: 2, category: 'prospecting', draw: (ctx) => drawOreChunk(ctx, 2, '#4FC3F7', '#E1F5FE') },

  // T3 Scavenging
  { name: 'reinforced_alloy', tier: 3, category: 'scavenging', draw: (ctx) => drawScrapMetal(ctx, 3) },
  { name: 'hardened_timber', tier: 3, category: 'scavenging', draw: (ctx) => drawSalvagedWood(ctx, 3) },
  { name: 'plasma_conduits', tier: 3, category: 'scavenging', draw: (ctx) => drawRustedPipes(ctx, 3) },
  // T3 Foraging
  { name: 'reactor_bloom', tier: 3, category: 'foraging', draw: (ctx) => drawHerbs(ctx, 3, '#00E676') },
  { name: 'void_berries', tier: 3, category: 'foraging', draw: (ctx) => drawBerries(ctx, 3, '#7C4DFF') },
  { name: 'titan_roots', tier: 3, category: 'foraging', draw: (ctx) => drawRoots(ctx, 3, '#4E342E') },
  // T3 Salvage
  { name: 'fusion_cores', tier: 3, category: 'salvage', draw: (ctx) => drawMechanicalParts(ctx, 3) },
  { name: 'neural_circuits', tier: 3, category: 'salvage', draw: (ctx) => drawElectronicComponents(ctx, 3) },
  { name: 'dark_matter_fluid', tier: 3, category: 'salvage', draw: (ctx) => drawChemicalFluids(ctx, 3, '#7C4DFF') },
  // T3 Water
  { name: 'reactor_coolant', tier: 3, category: 'water', draw: (ctx) => drawWaterDrop(ctx, 3, '#00E5FF') },
  { name: 'bio_solution', tier: 3, category: 'water', draw: (ctx) => drawWaterDrop(ctx, 3, '#69F0AE') },
  { name: 'void_extract', tier: 3, category: 'water', draw: (ctx) => drawWaterDrop(ctx, 3, '#B388FF') },
  // T3 Prospecting
  { name: 'mythril_ore', tier: 3, category: 'prospecting', draw: (ctx) => drawOreChunk(ctx, 3, '#4FC3F7', '#E1F5FE') },
  { name: 'obsidian_ore', tier: 3, category: 'prospecting', draw: (ctx) => drawOreChunk(ctx, 3, '#263238', '#546E7A') },
  { name: 'void_crystal', tier: 3, category: 'prospecting', draw: (ctx) => {
    drawOreChunk(ctx, 3, '#9C27B0', '#E1BEE7');
    drawGlow(ctx, 64, 64, 30, 'rgba(156,39,176,0.2)');
  }},

  // Special
  { name: 'icqor_chess_piece', tier: 0, category: null, draw: (ctx) => drawChessPiece(ctx) },
];

const TOOLS = [
  // T1
  { name: 'salvage_prybar', tier: 1, draw: (ctx) => drawPrybar(ctx, 1) },
  { name: 'foraging_sickle', tier: 1, draw: (ctx) => drawSickle(ctx, 1) },
  { name: 'salvage_scanner', tier: 1, draw: (ctx) => drawScanner(ctx, 1) },
  { name: 'water_filter', tier: 1, draw: (ctx) => drawWaterFilter(ctx, 1) },
  { name: 'mining_pickaxe', tier: 1, draw: (ctx) => drawPickaxe(ctx, 1) },
  // T3
  { name: 'reinforced_prybar', tier: 3, draw: (ctx) => drawPrybar(ctx, 3) },
  { name: 'carbon_sickle', tier: 3, draw: (ctx) => drawSickle(ctx, 3) },
  { name: 'advanced_scanner', tier: 3, draw: (ctx) => drawScanner(ctx, 3) },
  { name: 'purification_system', tier: 3, draw: (ctx) => drawWaterFilter(ctx, 3) },
  { name: 'sonic_drill', tier: 3, draw: (ctx) => drawPickaxe(ctx, 3) },
];

const CONSUMABLES = [
  // Food
  { name: 'wasteland_stew', tier: 1, draw: (ctx) => drawBowl(ctx, '#8D6E63') },
  { name: 'irradiated_jerky', tier: 1, draw: (ctx) => drawMeatJerky(ctx) },
  { name: 'herbal_tea', tier: 1, draw: (ctx) => drawTeaCup(ctx, '#81C784') },
  { name: 'fire_roasted_root', tier: 1, draw: (ctx) => drawRoastedRoot(ctx) },
  { name: 'fortified_rations', tier: 1, draw: (ctx) => drawFortifiedRations(ctx) },
  { name: 'scavengers_meal', tier: 1, draw: (ctx) => drawBowl(ctx, '#A1887F', 'rgba(200,200,200,0.2)') },
  { name: 'commanders_feast', tier: 2, draw: (ctx) => drawBowl(ctx, '#D4A853', 'rgba(255,215,0,0.15)') },
  { name: 'vitality_soup', tier: 1, draw: (ctx) => drawBowl(ctx, '#66BB6A', 'rgba(200,255,200,0.25)') },
  { name: 'spirit_broth', tier: 1, draw: (ctx) => drawBowl(ctx, '#7E57C2', 'rgba(200,180,255,0.25)') },
  { name: 'warriors_ration', tier: 1, draw: (ctx) => drawFortifiedRations(ctx) },
  { name: 'marksmans_snack', tier: 1, draw: (ctx) => drawMeatJerky(ctx) },
  { name: 'demolitions_mix', tier: 1, draw: (ctx) => drawBowl(ctx, '#FF7043') },
  { name: 'endurance_meal', tier: 1, draw: (ctx) => drawBowl(ctx, '#FFA726') },
  { name: 'spirit_feast', tier: 2, draw: (ctx) => drawBowl(ctx, '#AB47BC', 'rgba(200,150,255,0.25)') },
  // Tonics
  { name: 'sp_tonic', tier: 1, draw: (ctx) => drawPotionBottle(ctx, '#7E57C2') },
  // Medicine
  { name: 'stimpak', tier: 1, draw: (ctx) => drawSyringe(ctx, '#F44336') },
  { name: 'antidote', tier: 1, draw: (ctx) => drawSyringe(ctx, '#4CAF50') },
  { name: 'rad_shield_pill', tier: 1, draw: (ctx) => drawPill(ctx, '#FFC107', '#FF9800') },
  { name: 'cleansing_agent', tier: 1, draw: (ctx) => drawVial(ctx, '#81D4FA') },
  { name: 'minor_sp_potion', tier: 1, draw: (ctx) => drawPotionBottle(ctx, '#B39DDB', 0.85) },
  { name: 'hp_potion', tier: 1, draw: (ctx) => drawPotionBottle(ctx, '#EF5350') },
  { name: 'sp_potion', tier: 1, draw: (ctx) => drawPotionBottle(ctx, '#7E57C2') },
  { name: 'greater_hp_potion', tier: 2, draw: (ctx) => drawPotionBottle(ctx, '#C62828', 1.1) },
  { name: 'greater_sp_potion', tier: 2, draw: (ctx) => drawPotionBottle(ctx, '#4A148C', 1.1) },
  { name: 'full_restore', tier: 3, draw: (ctx) => {
    drawPotionBottle(ctx, '#FFD700', 1.15);
    drawGlow(ctx, 64, 64, 30, 'rgba(255,215,0,0.2)');
  }},
  // Chemical
  { name: 'combat_serum', tier: 1, draw: (ctx) => drawVial(ctx, '#F44336') },
  { name: 'adrenaline_shot', tier: 1, draw: (ctx) => drawSyringe(ctx, '#FF9800') },
  { name: 'berserker_compound', tier: 2, draw: (ctx) => drawFlask(ctx, '#D32F2F') },
  { name: 'berserk_injection', tier: 2, draw: (ctx) => drawSyringe(ctx, '#B71C1C') },
  // Special
  { name: 'facet_stone', tier: 2, draw: (ctx) => drawGemstone(ctx, '#7E57C2', '#B388FF') },
  { name: 'enhancement_shard', tier: 2, draw: (ctx) => drawGemstone(ctx, '#26A69A', '#80CBC4') },
];

// ─── Generation Pipeline ─────────────────────────────────────

function generateIcon(item, outDir) {
  const canvas = createCanvas(S, S);
  const ctx = canvas.getContext('2d');

  // Enable anti-aliasing (default in canvas, but ensure no imageSmoothingEnabled = false)
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Background
  if (item.category && CATEGORY_COLORS[item.category]) {
    const cc = CATEGORY_COLORS[item.category];
    // Brighten for higher tiers
    const mult = item.tier >= 2 ? 1 + (item.tier - 1) * 0.15 : 1;
    drawRadialBg(ctx, lighten(cc.bg1, (mult-1)*0.3), cc.bg2);
    drawOuterRing(ctx, hexToRgba(cc.accent, 0.5), 2);
  } else if (item.name === 'icqor_chess_piece') {
    drawRadialBg(ctx, '#4A148C', '#1A0533');
    drawOuterRing(ctx, 'rgba(255,215,0,0.5)', 2);
  } else {
    // Default dark bg for tools/consumables
    drawRadialBg(ctx, '#37474F', '#1A1A2E');
    drawOuterRing(ctx, 'rgba(176,190,197,0.3)', 2);
  }

  // T3 outer glow ring
  if (item.tier === 3) {
    ctx.save();
    ctx.shadowColor = '#9C27B0';
    ctx.shadowBlur = 12;
    ctx.strokeStyle = 'rgba(156,39,176,0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(S/2, S/2, S/2 - 4, 0, Math.PI*2);
    ctx.stroke();
    ctx.restore();
  }

  // Draw the item
  item.draw(ctx);

  // Tier badge
  if (item.tier >= 2) {
    drawTierBadge(ctx, item.tier);
  }

  // Save
  const buf = canvas.toBuffer('image/png');
  const filePath = path.join(outDir, `${item.name}.png`);
  fs.writeFileSync(filePath, buf);
  return filePath;
}

// ─── Main ────────────────────────────────────────────────────

let count = 0;

console.log('Generating resource icons...');
for (const item of RESOURCES) {
  generateIcon(item, DIRS.resources);
  count++;
}

console.log('Generating tool icons...');
for (const item of TOOLS) {
  generateIcon(item, DIRS.tools);
  count++;
}

console.log('Generating consumable icons...');
for (const item of CONSUMABLES) {
  generateIcon(item, DIRS.consumables);
  count++;
}

console.log(`\nDone! Generated ${count} icons total.`);
console.log(`  Resources: ${RESOURCES.length} -> ${DIRS.resources}`);
console.log(`  Tools:     ${TOOLS.length} -> ${DIRS.tools}`);
console.log(`  Consumables: ${CONSUMABLES.length} -> ${DIRS.consumables}`);
