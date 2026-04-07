/**
 * Wasteland Grind — Resource Icon Generator
 * Generates 64×64 pixel-art-style icons for all 15 gathering resources.
 * Run: node scripts/generate-resource-icons.mjs
 */
import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

const SIZE = 64;
const OUT = path.resolve('public/assets/resources');
fs.mkdirSync(OUT, { recursive: true });

// ════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════
function save(canvas, filename) {
  fs.writeFileSync(path.join(OUT, `${filename}.png`), canvas.toBuffer('image/png'));
}

function pixel(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function circle(ctx, cx, cy, r, color, fill = true) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = color; ctx.fill(); }
  else { ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); }
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

function line(ctx, x1, y1, x2, y2, color, width = 2) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// Skill category background colors
const SKILL_BG = {
  scavenging:       { bg: '#1A1A14', border: '#5C4D3C' },
  foraging:         { bg: '#141A14', border: '#3C5C3C' },
  salvage_hunting:  { bg: '#1A1A1E', border: '#4A4A5C' },
  water_reclamation:{ bg: '#141820', border: '#3C4A5C' },
  prospecting:      { bg: '#1A1816', border: '#5C5040' },
};

function drawBg(ctx, skillId) {
  const c = SKILL_BG[skillId];
  ctx.fillStyle = c.bg;
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.strokeStyle = c.border;
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, SIZE - 2, SIZE - 2);
}

// ════════════════════════════════════════════════
// SCAVENGING RESOURCES
// ════════════════════════════════════════════════
function drawScrapMetal(ctx) {
  drawBg(ctx, 'scavenging');
  // Bent metal sheets stacked
  ctx.fillStyle = '#808080';
  ctx.save();
  ctx.translate(32, 30);
  ctx.rotate(-0.15);
  ctx.fillRect(-16, -4, 32, 8);
  ctx.restore();
  ctx.fillStyle = '#6A6A6A';
  ctx.save();
  ctx.translate(32, 36);
  ctx.rotate(0.1);
  ctx.fillRect(-14, -3, 28, 6);
  ctx.restore();
  // Rust spots
  circle(ctx, 22, 28, 3, '#8B4513');
  circle(ctx, 40, 34, 2, '#A0522D');
  circle(ctx, 34, 30, 2, '#8B4513');
  // Bent edge
  ctx.strokeStyle = '#999';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(16, 26);
  ctx.quadraticCurveTo(14, 20, 18, 16);
  ctx.stroke();
  // Shine
  pixel(ctx, 26, 28, 8, 1, '#FFFFFF33');
}

function drawSalvagedWood(ctx) {
  drawBg(ctx, 'scavenging');
  // Lumber planks
  const woodColor = '#5C4033';
  const woodLight = '#7B5B4A';
  const woodDark = '#3E2A1E';
  // Plank 1 (angled)
  ctx.fillStyle = woodColor;
  ctx.save();
  ctx.translate(32, 28);
  ctx.rotate(-0.2);
  ctx.fillRect(-18, -5, 36, 10);
  // Wood grain
  ctx.strokeStyle = woodDark;
  ctx.lineWidth = 1;
  for (let i = -14; i < 16; i += 4) {
    ctx.beginPath();
    ctx.moveTo(i, -4);
    ctx.lineTo(i + 2, 4);
    ctx.stroke();
  }
  ctx.restore();
  // Plank 2
  ctx.fillStyle = woodLight;
  ctx.save();
  ctx.translate(30, 38);
  ctx.rotate(0.15);
  ctx.fillRect(-14, -4, 28, 8);
  ctx.strokeStyle = woodDark;
  ctx.lineWidth = 1;
  for (let i = -10; i < 14; i += 5) {
    ctx.beginPath();
    ctx.moveTo(i, -3);
    ctx.lineTo(i + 1, 3);
    ctx.stroke();
  }
  ctx.restore();
  // Char marks
  pixel(ctx, 20, 26, 5, 3, '#222');
  pixel(ctx, 38, 36, 4, 2, '#1A1A1A');
  // Nail
  circle(ctx, 42, 28, 1.5, '#888');
}

function drawRustedPipes(ctx) {
  drawBg(ctx, 'scavenging');
  // Pipe 1 (horizontal)
  roundRect(ctx, 8, 22, 48, 8, 4, '#6B6B6B');
  // Pipe highlight
  pixel(ctx, 10, 23, 44, 2, '#88888855');
  // Pipe 2 (angled)
  ctx.fillStyle = '#5A5A5A';
  ctx.save();
  ctx.translate(32, 38);
  ctx.rotate(0.3);
  ctx.fillRect(-20, -4, 40, 7);
  ctx.restore();
  // Rust patches
  circle(ctx, 18, 25, 3, '#8B4513');
  circle(ctx, 36, 25, 4, '#A0522D');
  circle(ctx, 28, 38, 3, '#8B4513');
  // Joint ring
  ctx.strokeStyle = '#777';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(30, 26, 3, 5, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Drip
  ctx.fillStyle = '#4A6A4A';
  ctx.beginPath();
  ctx.moveTo(44, 30);
  ctx.quadraticCurveTo(46, 36, 44, 40);
  ctx.quadraticCurveTo(42, 36, 44, 30);
  ctx.fill();
}

// ════════════════════════════════════════════════
// FORAGING RESOURCES
// ════════════════════════════════════════════════
function drawWildHerbs(ctx) {
  drawBg(ctx, 'foraging');
  // Stems
  ctx.strokeStyle = '#2E7D32';
  ctx.lineWidth = 2;
  // Center stem
  ctx.beginPath(); ctx.moveTo(32, 54); ctx.quadraticCurveTo(30, 40, 32, 22); ctx.stroke();
  // Left stem
  ctx.beginPath(); ctx.moveTo(28, 50); ctx.quadraticCurveTo(22, 38, 18, 24); ctx.stroke();
  // Right stem
  ctx.beginPath(); ctx.moveTo(36, 50); ctx.quadraticCurveTo(42, 38, 46, 24); ctx.stroke();

  // Leaves
  const drawLeaf = (cx, cy, angle, size) => {
    ctx.fillStyle = '#4CAF50';
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.ellipse(0, 0, size, size * 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Vein
    ctx.strokeStyle = '#2E7D3266';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -size * 2);
    ctx.lineTo(0, size * 2);
    ctx.stroke();
    ctx.restore();
  };
  drawLeaf(18, 22, -0.3, 4);
  drawLeaf(14, 30, 0.2, 3);
  drawLeaf(32, 20, 0, 4);
  drawLeaf(36, 28, -0.4, 3);
  drawLeaf(46, 22, 0.3, 4);
  drawLeaf(42, 32, -0.2, 3);

  // Small flowers
  circle(ctx, 32, 16, 3, '#E8F5E9');
  circle(ctx, 32, 16, 1.5, '#FFF9C4');
  circle(ctx, 18, 20, 2, '#C8E6C9');
  circle(ctx, 46, 20, 2, '#C8E6C9');
}

function drawWastelandBerries(ctx) {
  drawBg(ctx, 'foraging');
  // Branch
  ctx.strokeStyle = '#5D4037';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(12, 16);
  ctx.quadraticCurveTo(32, 20, 52, 14);
  ctx.stroke();
  // Small branches down
  line(ctx, 20, 18, 18, 30, '#5D4037', 1.5);
  line(ctx, 32, 20, 30, 34, '#5D4037', 1.5);
  line(ctx, 32, 20, 36, 32, '#5D4037', 1.5);
  line(ctx, 44, 16, 44, 28, '#5D4037', 1.5);

  // Berries (purple-ish, slightly glowing = irradiated)
  const berryColor = '#9C27B0';
  const berryHl = '#CE93D8';
  const drawBerry = (cx, cy) => {
    circle(ctx, cx, cy, 5, berryColor);
    circle(ctx, cx - 1, cy - 1, 2, berryHl);
    // Glow
    circle(ctx, cx, cy, 6, '#9C27B022');
  };
  drawBerry(18, 36);
  drawBerry(28, 38);
  drawBerry(36, 36);
  drawBerry(44, 34);
  // Cluster extras
  circle(ctx, 23, 40, 4, '#7B1FA2');
  circle(ctx, 22, 39, 1.5, berryHl);
  circle(ctx, 40, 38, 4, '#7B1FA2');
  circle(ctx, 39, 37, 1.5, berryHl);

  // Small leaves
  ctx.fillStyle = '#388E3C';
  ctx.beginPath();
  ctx.ellipse(16, 16, 3, 6, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(48, 14, 3, 6, 0.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawMutantRoots(ctx) {
  drawBg(ctx, 'foraging');
  // Main root (thick, gnarly)
  ctx.fillStyle = '#8D6E63';
  ctx.beginPath();
  ctx.moveTo(26, 12);
  ctx.quadraticCurveTo(20, 20, 22, 32);
  ctx.quadraticCurveTo(24, 44, 20, 54);
  ctx.lineTo(28, 54);
  ctx.quadraticCurveTo(32, 44, 30, 32);
  ctx.quadraticCurveTo(32, 20, 34, 12);
  ctx.closePath();
  ctx.fill();
  // Second root
  ctx.fillStyle = '#795548';
  ctx.beginPath();
  ctx.moveTo(36, 14);
  ctx.quadraticCurveTo(42, 24, 40, 36);
  ctx.quadraticCurveTo(44, 48, 42, 56);
  ctx.lineTo(48, 54);
  ctx.quadraticCurveTo(48, 44, 46, 36);
  ctx.quadraticCurveTo(48, 24, 44, 14);
  ctx.closePath();
  ctx.fill();
  // Knobby bumps (mutated)
  circle(ctx, 22, 28, 4, '#A1887F');
  circle(ctx, 42, 32, 3, '#A1887F');
  circle(ctx, 26, 42, 3, '#8D6E63');
  // Radiation glow spots
  circle(ctx, 24, 30, 2, '#7CFC0066');
  circle(ctx, 40, 34, 1.5, '#7CFC0066');
  // Root hairs
  ctx.strokeStyle = '#6D4C41';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(20, 48); ctx.lineTo(14, 52); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(24, 52); ctx.lineTo(18, 58); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(44, 50); ctx.lineTo(50, 54); ctx.stroke();
  // Top greens
  triangle(ctx, 28, 12, 32, 4, 36, 12, '#4CAF50');
  triangle(ctx, 38, 14, 42, 6, 46, 14, '#388E3C');
}

// ════════════════════════════════════════════════
// SALVAGE HUNTING RESOURCES
// ════════════════════════════════════════════════
function drawMechanicalParts(ctx) {
  drawBg(ctx, 'salvage_hunting');
  // Large gear
  ctx.strokeStyle = '#78909C';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(26, 30, 12, 0, Math.PI * 2);
  ctx.stroke();
  // Gear teeth
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const x1 = 26 + Math.cos(angle) * 11;
    const y1 = 30 + Math.sin(angle) * 11;
    const x2 = 26 + Math.cos(angle) * 15;
    const y2 = 30 + Math.sin(angle) * 15;
    line(ctx, x1, y1, x2, y2, '#78909C', 3);
  }
  // Center hole
  circle(ctx, 26, 30, 3, '#263238');
  circle(ctx, 26, 30, 2, '#37474F');

  // Small gear
  ctx.strokeStyle = '#90A4AE';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(44, 38, 8, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const x1 = 44 + Math.cos(angle) * 7;
    const y1 = 38 + Math.sin(angle) * 7;
    const x2 = 44 + Math.cos(angle) * 10;
    const y2 = 38 + Math.sin(angle) * 10;
    line(ctx, x1, y1, x2, y2, '#90A4AE', 2);
  }
  circle(ctx, 44, 38, 2, '#263238');

  // Bolts scattered
  circle(ctx, 46, 18, 2, '#B0BEC5');
  circle(ctx, 46, 18, 1, '#78909C');
  circle(ctx, 14, 48, 2, '#B0BEC5');
  circle(ctx, 14, 48, 1, '#78909C');

  // Spring
  ctx.strokeStyle = '#90A4AE';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(38, 16 + i * 3, 3, 0, Math.PI);
    ctx.stroke();
  }
}

function drawElectronicComponents(ctx) {
  drawBg(ctx, 'salvage_hunting');
  // Circuit board
  roundRect(ctx, 12, 14, 40, 28, 2, '#1B5E20');
  // Traces
  ctx.strokeStyle = '#4CAF5088';
  ctx.lineWidth = 1;
  line(ctx, 16, 18, 30, 18, '#FFD74066', 1);
  line(ctx, 30, 18, 30, 30, '#FFD74066', 1);
  line(ctx, 30, 30, 48, 30, '#FFD74066', 1);
  line(ctx, 20, 24, 40, 24, '#FFD74066', 1);
  line(ctx, 20, 24, 20, 38, '#FFD74066', 1);
  line(ctx, 36, 18, 36, 36, '#FFD74066', 1);

  // Chips
  roundRect(ctx, 24, 20, 10, 8, 1, '#212121');
  // Chip pins
  for (let i = 0; i < 4; i++) {
    pixel(ctx, 22, 21 + i * 2, 2, 1, '#90A4AE');
    pixel(ctx, 34, 21 + i * 2, 2, 1, '#90A4AE');
  }

  // Capacitor
  roundRect(ctx, 40, 18, 6, 10, 1, '#455A64');
  pixel(ctx, 41, 16, 2, 3, '#90A4AE');
  pixel(ctx, 44, 16, 2, 3, '#90A4AE');

  // LED
  circle(ctx, 18, 32, 2, '#F44336');
  circle(ctx, 18, 32, 1, '#FF8A80');

  // Loose wires at bottom
  ctx.strokeStyle = '#F44336';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(20, 42); ctx.quadraticCurveTo(24, 50, 22, 56); ctx.stroke();
  ctx.strokeStyle = '#2196F3';
  ctx.beginPath(); ctx.moveTo(32, 42); ctx.quadraticCurveTo(36, 48, 34, 56); ctx.stroke();
  ctx.strokeStyle = '#FFC107';
  ctx.beginPath(); ctx.moveTo(44, 42); ctx.quadraticCurveTo(40, 50, 42, 56); ctx.stroke();
}

function drawChemicalFluids(ctx) {
  drawBg(ctx, 'salvage_hunting');
  // Flask/container
  // Neck
  roundRect(ctx, 26, 10, 12, 12, 2, '#FFFFFF22');
  ctx.strokeStyle = '#FFFFFF33';
  ctx.lineWidth = 1;
  ctx.strokeRect(26, 10, 12, 12);
  // Body
  ctx.fillStyle = '#FFFFFF15';
  ctx.beginPath();
  ctx.moveTo(24, 22);
  ctx.lineTo(14, 50);
  ctx.quadraticCurveTo(14, 56, 20, 56);
  ctx.lineTo(44, 56);
  ctx.quadraticCurveTo(50, 56, 50, 50);
  ctx.lineTo(40, 22);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF33';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Fluid (yellow-green, toxic)
  ctx.fillStyle = '#CDDC3988';
  ctx.beginPath();
  ctx.moveTo(18, 36);
  ctx.lineTo(14, 50);
  ctx.quadraticCurveTo(14, 56, 20, 56);
  ctx.lineTo(44, 56);
  ctx.quadraticCurveTo(50, 56, 50, 50);
  ctx.lineTo(46, 36);
  // Liquid surface wave
  ctx.quadraticCurveTo(38, 32, 32, 36);
  ctx.quadraticCurveTo(26, 40, 18, 36);
  ctx.closePath();
  ctx.fill();

  // Bubbles
  circle(ctx, 24, 44, 2, '#CDDC3944');
  circle(ctx, 38, 48, 3, '#CDDC3944');
  circle(ctx, 30, 42, 1.5, '#CDDC3944');
  circle(ctx, 42, 42, 1, '#CDDC3944');

  // Cap
  roundRect(ctx, 24, 8, 16, 5, 2, '#455A64');

  // Hazard symbol hint
  triangle(ctx, 32, 26, 26, 34, 38, 34, '#FFC10744');
}

// ════════════════════════════════════════════════
// WATER RECLAMATION RESOURCES
// ════════════════════════════════════════════════
function drawRainwater(ctx) {
  drawBg(ctx, 'water_reclamation');
  // Bucket/container
  ctx.fillStyle = '#546E7A';
  ctx.beginPath();
  ctx.moveTo(16, 26);
  ctx.lineTo(12, 54);
  ctx.lineTo(52, 54);
  ctx.lineTo(48, 26);
  ctx.closePath();
  ctx.fill();
  // Rim
  roundRect(ctx, 14, 24, 36, 4, 1, '#607D8B');
  // Water inside
  ctx.fillStyle = '#81D4FA88';
  ctx.beginPath();
  ctx.moveTo(16, 32);
  ctx.quadraticCurveTo(24, 30, 32, 32);
  ctx.quadraticCurveTo(40, 34, 48, 32);
  ctx.lineTo(50, 52);
  ctx.lineTo(14, 52);
  ctx.closePath();
  ctx.fill();
  // Water surface reflection
  pixel(ctx, 20, 34, 10, 1, '#FFFFFF33');

  // Rain drops falling
  const dropColor = '#81D4FA';
  for (const [x, y, sz] of [[20, 8, 3], [36, 6, 4], [50, 10, 2], [10, 14, 3], [44, 16, 2]]) {
    ctx.fillStyle = dropColor;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + sz, y + sz * 2, x, y + sz * 3);
    ctx.quadraticCurveTo(x - sz, y + sz * 2, x, y);
    ctx.fill();
  }
}

function drawWellWater(ctx) {
  drawBg(ctx, 'water_reclamation');
  // Well structure (stone circle, top-down view)
  ctx.strokeStyle = '#795548';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(32, 32, 18, 0, Math.PI * 2);
  ctx.stroke();
  // Stone texture on rim
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const x = 32 + Math.cos(angle) * 18;
    const y = 32 + Math.sin(angle) * 18;
    circle(ctx, x, y, 3, i % 2 === 0 ? '#6D4C41' : '#8D6E63');
  }
  // Water inside (dark, deep)
  circle(ctx, 32, 32, 14, '#0D47A1');
  // Water shimmer
  ctx.strokeStyle = '#1565C044';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(32, 30, 10, 4, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(32, 34, 8, 3, 0.3, 0, Math.PI * 2);
  ctx.stroke();
  // Sparkle
  pixel(ctx, 28, 28, 2, 2, '#FFFFFF44');
  pixel(ctx, 36, 32, 1, 1, '#FFFFFF44');
  // Bucket rope hint
  line(ctx, 32, 14, 32, 8, '#8D6E63', 1.5);
  line(ctx, 30, 8, 34, 8, '#795548', 2);
}

function drawRiverWater(ctx) {
  drawBg(ctx, 'water_reclamation');
  // River flowing (horizontal waves)
  const drawWave = (y, color, amplitude) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= SIZE; x += 2) {
      ctx.lineTo(x, y + Math.sin(x * 0.15 + y * 0.1) * amplitude);
    }
    ctx.lineTo(SIZE, SIZE);
    ctx.lineTo(0, SIZE);
    ctx.closePath();
    ctx.fill();
  };
  // River bank top
  roundRect(ctx, 0, 8, SIZE, 8, 0, '#5D4037');
  pixel(ctx, 0, 14, SIZE, 2, '#4E342E');
  // Water layers
  drawWave(16, '#1565C0', 2);
  drawWave(22, '#1976D2', 3);
  drawWave(30, '#1E88E5', 2);
  drawWave(38, '#2196F3', 3);
  // Surface reflections
  pixel(ctx, 10, 24, 12, 1, '#FFFFFF22');
  pixel(ctx, 30, 32, 16, 1, '#FFFFFF22');
  pixel(ctx, 8, 40, 10, 1, '#FFFFFF22');
  pixel(ctx, 40, 20, 8, 1, '#FFFFFF22');
  // Foam
  circle(ctx, 14, 20, 2, '#FFFFFF33');
  circle(ctx, 38, 28, 2, '#FFFFFF33');
  circle(ctx, 50, 36, 1.5, '#FFFFFF33');
  // River bank bottom
  roundRect(ctx, 0, 48, SIZE, 16, 0, '#5D4037');
  pixel(ctx, 0, 48, SIZE, 2, '#6D4C41');
  // Pebbles on bank
  circle(ctx, 12, 52, 2, '#8D6E63');
  circle(ctx, 24, 54, 3, '#795548');
  circle(ctx, 40, 52, 2, '#6D4C41');
  circle(ctx, 52, 54, 2, '#8D6E63');
}

// ════════════════════════════════════════════════
// PROSPECTING RESOURCES
// ════════════════════════════════════════════════
function drawIronOre(ctx) {
  drawBg(ctx, 'prospecting');
  // Rock base
  ctx.fillStyle = '#5D4037';
  ctx.beginPath();
  ctx.moveTo(10, 44);
  ctx.lineTo(16, 22);
  ctx.lineTo(28, 16);
  ctx.lineTo(42, 18);
  ctx.lineTo(52, 28);
  ctx.lineTo(54, 46);
  ctx.lineTo(46, 52);
  ctx.lineTo(18, 52);
  ctx.closePath();
  ctx.fill();
  // Iron veins (darker metallic)
  ctx.fillStyle = '#434343';
  ctx.beginPath();
  ctx.moveTo(20, 28);
  ctx.lineTo(26, 22);
  ctx.lineTo(36, 24);
  ctx.lineTo(32, 34);
  ctx.lineTo(22, 36);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#3E3E3E';
  ctx.beginPath();
  ctx.moveTo(38, 32);
  ctx.lineTo(46, 28);
  ctx.lineTo(50, 38);
  ctx.lineTo(44, 44);
  ctx.lineTo(36, 40);
  ctx.closePath();
  ctx.fill();
  // Metallic shine
  pixel(ctx, 24, 26, 4, 2, '#6A6A6A');
  pixel(ctx, 42, 32, 3, 2, '#6A6A6A');
  // Crack lines
  line(ctx, 30, 16, 28, 30, '#4E342E', 1);
  line(ctx, 42, 20, 40, 38, '#4E342E', 1);
}

function drawCopperOre(ctx) {
  drawBg(ctx, 'prospecting');
  // Rock base
  ctx.fillStyle = '#5D4037';
  ctx.beginPath();
  ctx.moveTo(8, 46);
  ctx.lineTo(14, 20);
  ctx.lineTo(30, 14);
  ctx.lineTo(46, 16);
  ctx.lineTo(54, 30);
  ctx.lineTo(52, 48);
  ctx.lineTo(40, 54);
  ctx.lineTo(14, 52);
  ctx.closePath();
  ctx.fill();
  // Copper veins (orange-brown metallic)
  ctx.fillStyle = '#B87333';
  ctx.beginPath();
  ctx.moveTo(18, 26);
  ctx.lineTo(28, 20);
  ctx.lineTo(36, 24);
  ctx.lineTo(30, 36);
  ctx.lineTo(20, 34);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#CD7F32';
  ctx.beginPath();
  ctx.moveTo(36, 34);
  ctx.lineTo(48, 30);
  ctx.lineTo(50, 42);
  ctx.lineTo(42, 46);
  ctx.lineTo(34, 42);
  ctx.closePath();
  ctx.fill();
  // Oxidation (green patina spots)
  circle(ctx, 22, 30, 3, '#2E7D3266');
  circle(ctx, 44, 38, 2, '#2E7D3244');
  // Metallic shine
  pixel(ctx, 26, 24, 4, 2, '#DFA06888');
  pixel(ctx, 40, 34, 3, 2, '#DFA06888');
  // Crack
  line(ctx, 32, 14, 30, 32, '#4E342E', 1);
}

function drawRawStone(ctx) {
  drawBg(ctx, 'prospecting');
  // Main stone chunk
  ctx.fillStyle = '#757575';
  ctx.beginPath();
  ctx.moveTo(12, 42);
  ctx.lineTo(18, 20);
  ctx.lineTo(32, 14);
  ctx.lineTo(46, 18);
  ctx.lineTo(52, 32);
  ctx.lineTo(48, 48);
  ctx.lineTo(32, 52);
  ctx.lineTo(16, 50);
  ctx.closePath();
  ctx.fill();
  // Facets (lighter/darker faces)
  ctx.fillStyle = '#8A8A8A';
  ctx.beginPath();
  ctx.moveTo(18, 20);
  ctx.lineTo(32, 14);
  ctx.lineTo(36, 28);
  ctx.lineTo(24, 32);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#616161';
  ctx.beginPath();
  ctx.moveTo(36, 28);
  ctx.lineTo(46, 18);
  ctx.lineTo(52, 32);
  ctx.lineTo(44, 40);
  ctx.closePath();
  ctx.fill();
  // Mineral specks
  circle(ctx, 22, 28, 1.5, '#B0BEC5');
  circle(ctx, 38, 36, 1, '#CFD8DC');
  circle(ctx, 28, 42, 1, '#B0BEC5');
  circle(ctx, 44, 28, 1.5, '#CFD8DC');
  // Chip fragments around
  ctx.fillStyle = '#9E9E9E';
  ctx.beginPath();
  ctx.moveTo(8, 48);
  ctx.lineTo(10, 44);
  ctx.lineTo(14, 46);
  ctx.lineTo(12, 50);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(50, 46);
  ctx.lineTo(54, 42);
  ctx.lineTo(56, 46);
  ctx.lineTo(52, 48);
  ctx.closePath();
  ctx.fill();
}

// ════════════════════════════════════════════════
// GENERATE ALL
// ════════════════════════════════════════════════
const RESOURCE_MAP = {
  scrap_metal: drawScrapMetal,
  salvaged_wood: drawSalvagedWood,
  rusted_pipes: drawRustedPipes,
  wild_herbs: drawWildHerbs,
  wasteland_berries: drawWastelandBerries,
  mutant_roots: drawMutantRoots,
  mechanical_parts: drawMechanicalParts,
  electronic_components: drawElectronicComponents,
  chemical_fluids: drawChemicalFluids,
  rainwater: drawRainwater,
  well_water: drawWellWater,
  river_water: drawRiverWater,
  iron_ore: drawIronOre,
  copper_ore: drawCopperOre,
  raw_stone: drawRawStone,
};

let count = 0;
for (const [id, drawFn] of Object.entries(RESOURCE_MAP)) {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  drawFn(ctx);
  save(canvas, id);
  count++;
  console.log(`  ${id}.png`);
}

console.log(`\nDone! Generated ${count} resource icons in public/assets/resources/`);
