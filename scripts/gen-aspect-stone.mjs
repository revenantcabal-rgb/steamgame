/**
 * Generate aspect_stone resource icon (128x128) and clean up orphaned assets.
 */
import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

const SIZE = 128;

// ── Generate aspect_stone ───────────────────────────
const canvas = createCanvas(SIZE, SIZE);
const ctx = canvas.getContext('2d');

// Dark bg with purple radial
const bg = ctx.createRadialGradient(64, 64, 10, 64, 64, 80);
bg.addColorStop(0, '#2A1A3A');
bg.addColorStop(1, '#0D0D14');
ctx.fillStyle = bg;
ctx.fillRect(0, 0, SIZE, SIZE);

// Outer glow
const glow = ctx.createRadialGradient(64, 60, 10, 64, 60, 50);
glow.addColorStop(0, '#8844CC44');
glow.addColorStop(1, 'transparent');
ctx.fillStyle = glow;
ctx.beginPath(); ctx.arc(64, 60, 50, 0, Math.PI * 2); ctx.fill();

// Gem facets — pentagon shape
const cx = 64, cy = 58;
const points = [];
for (let i = 0; i < 5; i++) {
  const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
  points.push([cx + Math.cos(a) * 28, cy + Math.sin(a) * 28]);
}

// Main gem body
const gemGrad = ctx.createLinearGradient(36, 30, 92, 86);
gemGrad.addColorStop(0, '#CC88FF');
gemGrad.addColorStop(0.3, '#9955DD');
gemGrad.addColorStop(0.6, '#7733BB');
gemGrad.addColorStop(1, '#553399');
ctx.fillStyle = gemGrad;
ctx.beginPath();
points.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
ctx.closePath();
ctx.fill();

// Inner facet lines
ctx.strokeStyle = '#AA77DD66';
ctx.lineWidth = 1;
for (let i = 0; i < 5; i++) {
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(points[i][0], points[i][1]);
  ctx.stroke();
}

// Highlight facet
ctx.fillStyle = '#DDAAFF44';
ctx.beginPath();
ctx.moveTo(cx, cy);
ctx.lineTo(points[0][0], points[0][1]);
ctx.lineTo(points[1][0], points[1][1]);
ctx.closePath();
ctx.fill();

// Core sparkle
const sparkle = ctx.createRadialGradient(58, 50, 0, 58, 50, 8);
sparkle.addColorStop(0, '#FFFFFF88');
sparkle.addColorStop(1, 'transparent');
ctx.fillStyle = sparkle;
ctx.beginPath(); ctx.arc(58, 50, 8, 0, Math.PI * 2); ctx.fill();

// Small sparkle dots
ctx.fillStyle = '#FFFFFF66';
[[50, 44], [72, 52], [56, 72]].forEach(([x, y]) => {
  ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill();
});

// "A" badge for Aspect
ctx.fillStyle = '#8844CC';
ctx.beginPath(); ctx.arc(104, 104, 14, 0, Math.PI * 2); ctx.fill();
ctx.fillStyle = '#FFF';
ctx.font = 'bold 14px sans-serif';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('A', 104, 105);

// Save
const outDir = path.join(process.cwd(), 'public', 'assets', 'resources-128');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'aspect_stone.png'), canvas.toBuffer('image/png'));
console.log('Generated: resources-128/aspect_stone.png');

// ── Clean up orphaned old hero images ───────────────
const orphanedHeroes = [
  'blade_dancer', 'sharpshooter', 'sapper', 'warden', 'trapper',
  'bombardier', 'guardian', 'field_medic', 'chemist', 'berserker',
  'deadeye', 'demolisher', 'scavenger', 'ranger', 'prospector', 'artificer'
];
const heroDir = path.join(process.cwd(), 'public', 'assets', 'heroes');
let cleaned = 0;
for (const name of orphanedHeroes) {
  const fp = path.join(heroDir, `${name}.png`);
  if (fs.existsSync(fp)) {
    fs.unlinkSync(fp);
    console.log(`  Removed orphan: heroes/${name}.png`);
    cleaned++;
  }
}

// Remove orphaned consumable icons
const consumDir = path.join(process.cwd(), 'public', 'assets', 'consumables-128');
for (const name of ['facet_stone', 'enhancement_shard']) {
  const fp = path.join(consumDir, `${name}.png`);
  if (fs.existsSync(fp)) {
    fs.unlinkSync(fp);
    console.log(`  Removed orphan: consumables-128/${name}.png`);
    cleaned++;
  }
}

console.log(`\nDone! 1 icon generated, ${cleaned} orphans cleaned.`);
