/**
 * gen-missing-equip-1.mjs
 * Generate Job2 weapons (basic + t1/t2/t3) and missing armor set icons.
 * 128x128 PNG, smooth rendering, dark bg with tier-colored vignette.
 */
import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

const SIZE = 128;
const outDir = path.join(process.cwd(), 'public', 'assets', 'equipment-128');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

let generated = 0;

function save(canvas, name) {
  fs.writeFileSync(path.join(outDir, `${name}.png`), canvas.toBuffer('image/png'));
  generated++;
}

// ── Color helpers ──────────────────────────────────

function lighten(hex, amt) {
  if (!hex || hex.startsWith('rgb')) return hex;
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amt);
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amt);
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amt);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function darken(hex, amt) {
  if (!hex || hex.startsWith('rgb')) return hex;
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amt);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amt);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amt);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ── Shared drawing helpers ──────────────────────────

function makeBg(ctx, tierColor) {
  ctx.fillStyle = '#0D0D0D';
  ctx.fillRect(0, 0, SIZE, SIZE);
  const g = ctx.createRadialGradient(64, 64, 10, 64, 64, 80);
  g.addColorStop(0, tierColor + '30');
  g.addColorStop(1, 'transparent');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SIZE, SIZE);
}

function addSetBadge(ctx, letters, bgColor) {
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.arc(108, 108, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = lighten(bgColor, 40);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(108, 108, 14, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(letters, 108, 109);
}

function addSheen(ctx, x, y, w, h, color) {
  const sg = ctx.createLinearGradient(x, y, x + w * 0.5, y + h);
  sg.addColorStop(0, hexToRgba(color, 0.3));
  sg.addColorStop(1, 'transparent');
  ctx.fillStyle = sg;
  ctx.fillRect(x, y, w, h);
}

// ══════════════════════════════════════════════════════
//  WEAPON DRAWING FUNCTIONS
// ══════════════════════════════════════════════════════

function drawSword(ctx, mc, ac) {
  // Blade
  const bladeG = ctx.createLinearGradient(54, 10, 74, 10);
  bladeG.addColorStop(0, lighten(mc, 40));
  bladeG.addColorStop(0.5, mc);
  bladeG.addColorStop(1, darken(mc, 20));
  ctx.fillStyle = bladeG;
  ctx.beginPath();
  ctx.moveTo(64, 8);
  ctx.lineTo(72, 16);
  ctx.lineTo(70, 72);
  ctx.lineTo(64, 78);
  ctx.lineTo(58, 72);
  ctx.lineTo(56, 16);
  ctx.closePath();
  ctx.fill();
  // Fuller (center groove)
  ctx.strokeStyle = darken(mc, 30);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(64, 18);
  ctx.lineTo(64, 68);
  ctx.stroke();
  // Edge highlight
  ctx.strokeStyle = lighten(mc, 60) + '44';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(57, 16);
  ctx.lineTo(59, 72);
  ctx.stroke();
  // Cross guard
  ctx.fillStyle = ac;
  ctx.beginPath();
  ctx.moveTo(42, 76);
  ctx.lineTo(86, 76);
  ctx.lineTo(88, 82);
  ctx.lineTo(40, 82);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = lighten(ac, 30);
  ctx.beginPath();
  ctx.arc(42, 79, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(86, 79, 3, 0, Math.PI * 2);
  ctx.fill();
  // Grip
  ctx.fillStyle = '#3A2A1A';
  ctx.fillRect(60, 82, 8, 24);
  // Grip wrap
  ctx.strokeStyle = '#5A4A3A';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(60, 85 + i * 4);
    ctx.lineTo(68, 87 + i * 4);
    ctx.stroke();
  }
  // Pommel
  ctx.fillStyle = ac;
  ctx.beginPath();
  ctx.arc(64, 110, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawShieldWeapon(ctx, mc, ac) {
  // Kite shield
  ctx.fillStyle = mc;
  ctx.beginPath();
  ctx.moveTo(64, 10);
  ctx.lineTo(100, 30);
  ctx.lineTo(96, 70);
  ctx.lineTo(64, 110);
  ctx.lineTo(32, 70);
  ctx.lineTo(28, 30);
  ctx.closePath();
  ctx.fill();
  // Rim
  ctx.strokeStyle = lighten(mc, 30);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(64, 14);
  ctx.lineTo(96, 32);
  ctx.lineTo(92, 68);
  ctx.lineTo(64, 106);
  ctx.lineTo(36, 68);
  ctx.lineTo(32, 32);
  ctx.closePath();
  ctx.stroke();
  // Center emblem
  ctx.fillStyle = ac;
  ctx.beginPath();
  ctx.arc(64, 54, 14, 0, Math.PI * 2);
  ctx.fill();
  // Emblem cross
  ctx.strokeStyle = lighten(ac, 40);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(64, 42);
  ctx.lineTo(64, 66);
  ctx.moveTo(52, 54);
  ctx.lineTo(76, 54);
  ctx.stroke();
  // Rivets
  ctx.fillStyle = lighten(mc, 50);
  [[64, 22], [40, 40], [88, 40], [64, 86]].forEach(([x, y]) => {
    ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill();
  });
  // Sheen
  addSheen(ctx, 32, 14, 24, 50, lighten(mc, 40));
}

function drawFists(ctx, mc, ac) {
  // Gauntlet shape - armored fist
  ctx.fillStyle = mc;
  ctx.beginPath();
  ctx.moveTo(28, 30);
  ctx.lineTo(24, 55);
  ctx.lineTo(22, 70);
  ctx.lineTo(28, 82);
  ctx.lineTo(34, 92);
  ctx.lineTo(42, 98);
  ctx.lineTo(52, 102);
  ctx.lineTo(62, 100);
  ctx.lineTo(72, 94);
  ctx.lineTo(98, 80);
  ctx.lineTo(102, 72);
  ctx.lineTo(96, 66);
  ctx.lineTo(78, 72);
  ctx.lineTo(72, 62);
  ctx.lineTo(68, 46);
  ctx.lineTo(66, 30);
  ctx.closePath();
  ctx.fill();
  // Knuckle plates
  ctx.fillStyle = ac;
  ctx.beginPath();
  ctx.ellipse(52, 86, 22, 8, -0.2, 0, Math.PI * 2);
  ctx.fill();
  // Individual knuckle bumps
  ctx.fillStyle = lighten(ac, 20);
  [[36, 90], [46, 94], [56, 96], [66, 92]].forEach(([x, y]) => {
    ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
  });
  // Spikes on knuckles
  ctx.fillStyle = lighten(mc, 50);
  [[38, 84], [48, 88], [58, 90], [68, 86]].forEach(([x, y]) => {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 3, y - 10);
    ctx.lineTo(x + 3, y - 10);
    ctx.closePath();
    ctx.fill();
  });
  // Wrist guard
  ctx.fillStyle = darken(mc, 30);
  ctx.fillRect(26, 30, 42, 6);
  // Sheen
  addSheen(ctx, 28, 30, 20, 50, lighten(mc, 30));
}

function drawMaul(ctx, mc, ac) {
  // Handle
  ctx.fillStyle = '#4A3A2A';
  ctx.fillRect(60, 40, 8, 78);
  ctx.strokeStyle = '#6A5A4A';
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo(60, 50 + i * 8);
    ctx.lineTo(68, 52 + i * 8);
    ctx.stroke();
  }
  // Hammer head
  const hg = ctx.createLinearGradient(30, 8, 98, 8);
  hg.addColorStop(0, darken(mc, 20));
  hg.addColorStop(0.5, lighten(mc, 20));
  hg.addColorStop(1, darken(mc, 10));
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.moveTo(30, 8);
  ctx.lineTo(98, 8);
  ctx.lineTo(102, 16);
  ctx.lineTo(100, 40);
  ctx.lineTo(28, 40);
  ctx.lineTo(26, 16);
  ctx.closePath();
  ctx.fill();
  // Face plates
  ctx.fillStyle = ac;
  ctx.fillRect(30, 12, 12, 24);
  ctx.fillRect(86, 12, 12, 24);
  // Rivets
  ctx.fillStyle = lighten(mc, 50);
  [[36, 16], [36, 32], [92, 16], [92, 32]].forEach(([x, y]) => {
    ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
  });
  // Head edge highlight
  ctx.strokeStyle = lighten(mc, 40) + '66';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(30, 8);
  ctx.lineTo(98, 8);
  ctx.stroke();
  // Pommel
  ctx.fillStyle = ac;
  ctx.beginPath();
  ctx.arc(64, 118, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawRifle(ctx, mc, ac) {
  // Stock
  ctx.fillStyle = '#4A3520';
  ctx.beginPath();
  ctx.moveTo(8, 72);
  ctx.lineTo(30, 62);
  ctx.lineTo(36, 60);
  ctx.lineTo(36, 68);
  ctx.lineTo(14, 80);
  ctx.lineTo(8, 78);
  ctx.closePath();
  ctx.fill();
  // Barrel - long
  const bg = ctx.createLinearGradient(36, 58, 36, 68);
  bg.addColorStop(0, lighten(mc, 20));
  bg.addColorStop(1, darken(mc, 10));
  ctx.fillStyle = bg;
  ctx.fillRect(36, 58, 78, 10);
  // Muzzle
  ctx.fillStyle = darken(mc, 30);
  ctx.fillRect(112, 56, 8, 14);
  // Scope
  ctx.fillStyle = ac;
  ctx.beginPath();
  ctx.ellipse(70, 50, 14, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = darken(ac, 20);
  ctx.beginPath();
  ctx.ellipse(70, 50, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  // Scope mount
  ctx.fillStyle = mc;
  ctx.fillRect(66, 54, 8, 4);
  // Scope lens
  ctx.fillStyle = '#88CCFF';
  ctx.beginPath();
  ctx.arc(56, 50, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.arc(55, 49, 1.5, 0, Math.PI * 2);
  ctx.fill();
  // Trigger guard
  ctx.strokeStyle = mc;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(44, 72, 6, 0, Math.PI);
  ctx.stroke();
  // Bolt
  ctx.fillStyle = lighten(mc, 30);
  ctx.fillRect(54, 54, 6, 4);
}

function drawPistols(ctx, mc, ac) {
  // Left pistol
  _drawRevolver(ctx, mc, ac, 18, 20, false);
  // Right pistol (mirrored)
  _drawRevolver(ctx, mc, ac, 58, 50, true);
}

function _drawRevolver(ctx, mc, ac, ox, oy, flip) {
  ctx.save();
  ctx.translate(ox, oy);
  if (flip) ctx.scale(-1, 1);
  const sx = flip ? -1 : 1;
  // Barrel
  const bg = ctx.createLinearGradient(0, 4, 0, 14);
  bg.addColorStop(0, lighten(mc, 20));
  bg.addColorStop(1, mc);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 4, 48, 10);
  // Muzzle
  ctx.fillStyle = darken(mc, 30);
  ctx.fillRect(46, 2, 6, 14);
  // Cylinder
  ctx.fillStyle = ac;
  ctx.beginPath();
  ctx.ellipse(18, 14, 8, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = darken(ac, 30);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(18, 14, 8, 10, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Grip
  ctx.fillStyle = '#4A3520';
  ctx.beginPath();
  ctx.moveTo(6, 14);
  ctx.lineTo(2, 40);
  ctx.lineTo(10, 44);
  ctx.lineTo(18, 40);
  ctx.lineTo(16, 14);
  ctx.closePath();
  ctx.fill();
  // Trigger guard
  ctx.strokeStyle = mc;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(20, 22, 5, 0, Math.PI);
  ctx.stroke();
  // Hammer
  ctx.fillStyle = lighten(mc, 20);
  ctx.beginPath();
  ctx.moveTo(4, 4);
  ctx.lineTo(2, -4);
  ctx.lineTo(8, -2);
  ctx.lineTo(8, 4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawBow(ctx, mc, ac) {
  // Bow limb
  ctx.strokeStyle = mc;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(36, 10);
  ctx.bezierCurveTo(16, 30, 16, 90, 36, 112);
  ctx.stroke();
  // Bow inner edge highlight
  ctx.strokeStyle = lighten(mc, 30);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(38, 14);
  ctx.bezierCurveTo(20, 32, 20, 88, 38, 108);
  ctx.stroke();
  // Limb tips
  ctx.fillStyle = ac;
  ctx.beginPath();
  ctx.arc(36, 10, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(36, 112, 4, 0, Math.PI * 2);
  ctx.fill();
  // String
  ctx.strokeStyle = '#CCCCAA';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(38, 10);
  ctx.lineTo(38, 112);
  ctx.stroke();
  // Arrow
  ctx.strokeStyle = '#8B7355';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(40, 60);
  ctx.lineTo(110, 60);
  ctx.stroke();
  // Arrowhead
  ctx.fillStyle = lighten(mc, 40);
  ctx.beginPath();
  ctx.moveTo(110, 60);
  ctx.lineTo(102, 54);
  ctx.lineTo(104, 60);
  ctx.lineTo(102, 66);
  ctx.closePath();
  ctx.fill();
  // Fletching
  ctx.fillStyle = ac;
  ctx.beginPath();
  ctx.moveTo(42, 60);
  ctx.lineTo(48, 54);
  ctx.lineTo(52, 58);
  ctx.lineTo(48, 60);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(42, 60);
  ctx.lineTo(48, 66);
  ctx.lineTo(52, 62);
  ctx.lineTo(48, 60);
  ctx.closePath();
  ctx.fill();
  // Grip wrap
  ctx.fillStyle = '#5A4A3A';
  ctx.fillRect(24, 54, 10, 14);
}

function drawLauncher(ctx, mc, ac) {
  // Tube body
  const tg = ctx.createLinearGradient(20, 42, 20, 72);
  tg.addColorStop(0, lighten(mc, 15));
  tg.addColorStop(0.5, mc);
  tg.addColorStop(1, darken(mc, 15));
  ctx.fillStyle = tg;
  ctx.beginPath();
  ctx.moveTo(12, 42);
  ctx.lineTo(108, 42);
  ctx.quadraticCurveTo(116, 57, 108, 72);
  ctx.lineTo(12, 72);
  ctx.quadraticCurveTo(4, 57, 12, 42);
  ctx.closePath();
  ctx.fill();
  // Front opening
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.ellipse(110, 57, 6, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  // Rear opening
  ctx.fillStyle = '#1A1A1A';
  ctx.beginPath();
  ctx.ellipse(12, 57, 4, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  // Sight
  ctx.fillStyle = ac;
  ctx.beginPath();
  ctx.moveTo(72, 42);
  ctx.lineTo(70, 30);
  ctx.lineTo(78, 30);
  ctx.lineTo(76, 42);
  ctx.closePath();
  ctx.fill();
  // Grip
  ctx.fillStyle = '#4A3520';
  ctx.beginPath();
  ctx.moveTo(42, 72);
  ctx.lineTo(38, 98);
  ctx.lineTo(50, 98);
  ctx.lineTo(52, 72);
  ctx.closePath();
  ctx.fill();
  // Trigger guard
  ctx.strokeStyle = mc;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(48, 82, 5, 0, Math.PI);
  ctx.stroke();
  // Band
  ctx.fillStyle = ac;
  ctx.fillRect(28, 42, 4, 30);
  ctx.fillRect(86, 42, 4, 30);
}

function drawFlame(ctx, mc, ac) {
  // Nozzle body
  const ng = ctx.createLinearGradient(14, 60, 14, 80);
  ng.addColorStop(0, lighten(mc, 10));
  ng.addColorStop(1, darken(mc, 20));
  ctx.fillStyle = ng;
  ctx.beginPath();
  ctx.moveTo(14, 60);
  ctx.lineTo(72, 58);
  ctx.lineTo(74, 68);
  ctx.lineTo(76, 78);
  ctx.lineTo(72, 82);
  ctx.lineTo(14, 80);
  ctx.closePath();
  ctx.fill();
  // Nozzle tip
  ctx.fillStyle = darken(mc, 30);
  ctx.beginPath();
  ctx.moveTo(72, 56);
  ctx.lineTo(82, 54);
  ctx.lineTo(84, 60);
  ctx.lineTo(84, 78);
  ctx.lineTo(82, 84);
  ctx.lineTo(72, 84);
  ctx.closePath();
  ctx.fill();
  // Fire - outer
  const fg = ctx.createRadialGradient(100, 60, 4, 100, 60, 30);
  fg.addColorStop(0, '#FFFF44');
  fg.addColorStop(0.3, '#FF8800');
  fg.addColorStop(0.6, ac);
  fg.addColorStop(1, 'transparent');
  ctx.fillStyle = fg;
  ctx.beginPath();
  ctx.moveTo(84, 56);
  ctx.bezierCurveTo(100, 40, 118, 30, 120, 46);
  ctx.bezierCurveTo(124, 36, 116, 22, 108, 34);
  ctx.bezierCurveTo(112, 26, 104, 24, 102, 38);
  ctx.bezierCurveTo(108, 48, 110, 68, 102, 78);
  ctx.bezierCurveTo(106, 88, 112, 92, 108, 82);
  ctx.bezierCurveTo(118, 86, 122, 76, 118, 70);
  ctx.bezierCurveTo(124, 78, 116, 88, 106, 80);
  ctx.bezierCurveTo(100, 86, 90, 78, 84, 82);
  ctx.closePath();
  ctx.fill();
  // Fire inner glow
  const ig = ctx.createRadialGradient(92, 62, 2, 92, 62, 14);
  ig.addColorStop(0, '#FFFFFF');
  ig.addColorStop(0.4, '#FFFF88');
  ig.addColorStop(1, 'transparent');
  ctx.fillStyle = ig;
  ctx.beginPath();
  ctx.arc(92, 62, 14, 0, Math.PI * 2);
  ctx.fill();
  // Grip
  ctx.fillStyle = '#4A3520';
  ctx.beginPath();
  ctx.moveTo(18, 80);
  ctx.lineTo(14, 102);
  ctx.lineTo(26, 102);
  ctx.lineTo(28, 80);
  ctx.closePath();
  ctx.fill();
  // Tank hint
  ctx.fillStyle = ac;
  ctx.beginPath();
  ctx.ellipse(32, 90, 8, 4, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawFlask(ctx, mc, ac) {
  // Neck
  ctx.fillStyle = lighten(mc, 30);
  ctx.fillRect(58, 14, 12, 20);
  // Cork
  ctx.fillStyle = '#8B6B4A';
  ctx.fillRect(56, 8, 16, 8);
  // Flask body - round bottom
  const fg = ctx.createRadialGradient(60, 68, 4, 64, 72, 32);
  fg.addColorStop(0, lighten(mc, 40));
  fg.addColorStop(0.5, mc);
  fg.addColorStop(1, darken(mc, 20));
  ctx.fillStyle = fg;
  ctx.beginPath();
  ctx.moveTo(58, 34);
  ctx.bezierCurveTo(30, 44, 22, 64, 26, 88);
  ctx.bezierCurveTo(30, 106, 50, 114, 64, 114);
  ctx.bezierCurveTo(78, 114, 98, 106, 102, 88);
  ctx.bezierCurveTo(106, 64, 98, 44, 70, 34);
  ctx.closePath();
  ctx.fill();
  // Liquid level
  ctx.fillStyle = ac;
  ctx.beginPath();
  ctx.moveTo(30, 78);
  ctx.bezierCurveTo(40, 74, 88, 74, 98, 78);
  ctx.bezierCurveTo(100, 96, 88, 112, 64, 112);
  ctx.bezierCurveTo(40, 112, 28, 96, 30, 78);
  ctx.closePath();
  ctx.fill();
  // Liquid glow
  const lg = ctx.createRadialGradient(58, 90, 2, 64, 92, 20);
  lg.addColorStop(0, lighten(ac, 50) + '88');
  lg.addColorStop(1, 'transparent');
  ctx.fillStyle = lg;
  ctx.beginPath();
  ctx.arc(64, 92, 20, 0, Math.PI * 2);
  ctx.fill();
  // Bubbles
  ctx.fillStyle = lighten(ac, 60) + '88';
  [[54, 86, 3], [70, 94, 2], [62, 100, 2.5]].forEach(([x, y, r]) => {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  });
  // Glass highlight
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.bezierCurveTo(36, 50, 30, 70, 34, 90);
  ctx.stroke();
}

function drawSatchel(ctx, mc, ac) {
  // Bandolier strap - diagonal
  ctx.fillStyle = '#5A3A20';
  ctx.save();
  ctx.translate(64, 64);
  ctx.rotate(-0.3);
  ctx.fillRect(-50, -8, 100, 16);
  ctx.restore();
  // Strap stitch
  ctx.strokeStyle = '#7A5A40';
  ctx.lineWidth = 1;
  ctx.save();
  ctx.translate(64, 64);
  ctx.rotate(-0.3);
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(-48, -5);
  ctx.lineTo(48, -5);
  ctx.moveTo(-48, 5);
  ctx.lineTo(48, 5);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
  // Vial loops
  const vialPositions = [
    [30, 40], [46, 36], [62, 34], [78, 36], [94, 42]
  ];
  vialPositions.forEach(([x, y], i) => {
    // Vial body
    const vg = ctx.createLinearGradient(x - 4, y, x + 4, y);
    vg.addColorStop(0, lighten(mc, 20));
    vg.addColorStop(0.5, mc);
    vg.addColorStop(1, darken(mc, 10));
    ctx.fillStyle = vg;
    ctx.beginPath();
    ctx.moveTo(x - 5, y);
    ctx.lineTo(x - 6, y + 22);
    ctx.quadraticCurveTo(x, y + 28, x + 6, y + 22);
    ctx.lineTo(x + 5, y);
    ctx.closePath();
    ctx.fill();
    // Cork
    ctx.fillStyle = '#8B6B4A';
    ctx.fillRect(x - 4, y - 4, 8, 5);
    // Liquid
    const liqColor = i % 2 === 0 ? ac : lighten(ac, 20);
    ctx.fillStyle = liqColor;
    ctx.beginPath();
    ctx.moveTo(x - 5, y + 10);
    ctx.lineTo(x - 6, y + 22);
    ctx.quadraticCurveTo(x, y + 26, x + 6, y + 22);
    ctx.lineTo(x + 5, y + 10);
    ctx.closePath();
    ctx.fill();
  });
  // Buckle
  ctx.fillStyle = mc;
  ctx.fillRect(18, 68, 10, 10);
  ctx.fillStyle = '#0D0D0D';
  ctx.fillRect(21, 71, 4, 4);
}

function drawBook(ctx, mc, ac) {
  // Book body
  const bg = ctx.createLinearGradient(22, 20, 102, 20);
  bg.addColorStop(0, darken(mc, 20));
  bg.addColorStop(0.05, mc);
  bg.addColorStop(0.95, mc);
  bg.addColorStop(1, darken(mc, 30));
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.moveTo(22, 18);
  ctx.lineTo(102, 18);
  ctx.lineTo(106, 22);
  ctx.lineTo(106, 106);
  ctx.lineTo(102, 110);
  ctx.lineTo(22, 110);
  ctx.lineTo(18, 106);
  ctx.lineTo(18, 22);
  ctx.closePath();
  ctx.fill();
  // Spine
  ctx.fillStyle = darken(mc, 30);
  ctx.fillRect(18, 18, 8, 92);
  // Pages (edge visible)
  ctx.fillStyle = '#E8E0D0';
  ctx.fillRect(26, 22, 76, 3);
  ctx.fillRect(26, 103, 76, 3);
  // Spine bands
  ctx.fillStyle = ac;
  ctx.fillRect(18, 34, 8, 3);
  ctx.fillRect(18, 54, 8, 3);
  ctx.fillRect(18, 74, 8, 3);
  ctx.fillRect(18, 94, 8, 3);
  // Cross emblem
  ctx.fillStyle = ac;
  ctx.beginPath();
  ctx.arc(66, 64, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = lighten(ac, 50);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(66, 50);
  ctx.lineTo(66, 78);
  ctx.moveTo(52, 64);
  ctx.lineTo(80, 64);
  ctx.stroke();
  // Corner accents
  ctx.fillStyle = ac;
  [[30, 22], [98, 22], [30, 106], [98, 106]].forEach(([x, y]) => {
    ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
  });
  // Title lines
  ctx.fillStyle = lighten(mc, 40);
  ctx.fillRect(38, 30, 52, 2);
  ctx.fillRect(44, 36, 40, 2);
}

function drawFlag(ctx, mc, ac) {
  // Pole
  ctx.fillStyle = '#6A5A4A';
  ctx.fillRect(28, 6, 6, 116);
  // Pole cap
  ctx.fillStyle = ac;
  ctx.beginPath();
  ctx.moveTo(31, 6);
  ctx.lineTo(26, 2);
  ctx.lineTo(36, 2);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(31, 2, 4, 0, Math.PI * 2);
  ctx.fill();
  // Banner
  const fg = ctx.createLinearGradient(36, 14, 110, 14);
  fg.addColorStop(0, mc);
  fg.addColorStop(1, darken(mc, 20));
  ctx.fillStyle = fg;
  ctx.beginPath();
  ctx.moveTo(34, 10);
  ctx.bezierCurveTo(60, 16, 80, 8, 108, 14);
  ctx.bezierCurveTo(80, 30, 60, 50, 108, 68);
  ctx.bezierCurveTo(80, 62, 60, 70, 34, 66);
  ctx.closePath();
  ctx.fill();
  // Banner edge
  ctx.strokeStyle = ac;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(34, 10);
  ctx.bezierCurveTo(60, 16, 80, 8, 108, 14);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(34, 66);
  ctx.bezierCurveTo(60, 70, 80, 62, 108, 68);
  ctx.stroke();
  // Emblem on banner
  ctx.fillStyle = ac;
  ctx.beginPath();
  ctx.arc(68, 40, 12, 0, Math.PI * 2);
  ctx.fill();
  // Star in emblem
  ctx.fillStyle = lighten(ac, 60);
  _drawStar(ctx, 68, 40, 5, 8, 4);
  // Tassels
  ctx.strokeStyle = ac;
  ctx.lineWidth = 2;
  [[34, 66], [40, 67], [46, 68]].forEach(([x, y]) => {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 2, y + 12);
    ctx.stroke();
  });
}

function _drawStar(ctx, cx, cy, points, outerR, innerR) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = (Math.PI * i) / points - Math.PI / 2;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

function drawTechGun(ctx, mc, ac) {
  // Body
  const bg = ctx.createLinearGradient(20, 40, 20, 72);
  bg.addColorStop(0, lighten(mc, 15));
  bg.addColorStop(1, darken(mc, 10));
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.moveTo(20, 44);
  ctx.lineTo(96, 40);
  ctx.lineTo(100, 44);
  ctx.lineTo(100, 64);
  ctx.lineTo(96, 68);
  ctx.lineTo(20, 72);
  ctx.lineTo(16, 68);
  ctx.lineTo(16, 48);
  ctx.closePath();
  ctx.fill();
  // Barrel
  ctx.fillStyle = darken(mc, 30);
  ctx.fillRect(96, 48, 22, 12);
  // Muzzle glow
  const mg = ctx.createRadialGradient(118, 54, 1, 118, 54, 8);
  mg.addColorStop(0, ac);
  mg.addColorStop(1, 'transparent');
  ctx.fillStyle = mg;
  ctx.beginPath();
  ctx.arc(118, 54, 8, 0, Math.PI * 2);
  ctx.fill();
  // Energy cell
  ctx.fillStyle = ac;
  ctx.fillRect(50, 44, 16, 6);
  const eg = ctx.createLinearGradient(50, 44, 66, 44);
  eg.addColorStop(0, lighten(ac, 40));
  eg.addColorStop(1, ac);
  ctx.fillStyle = eg;
  ctx.fillRect(52, 45, 12, 4);
  // Grip
  ctx.fillStyle = '#3A3A3A';
  ctx.beginPath();
  ctx.moveTo(34, 68);
  ctx.lineTo(30, 100);
  ctx.lineTo(46, 102);
  ctx.lineTo(48, 68);
  ctx.closePath();
  ctx.fill();
  // Trigger guard
  ctx.strokeStyle = mc;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(52, 76, 6, 0, Math.PI);
  ctx.stroke();
  // Panel lines
  ctx.strokeStyle = darken(mc, 20);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, 48);
  ctx.lineTo(40, 68);
  ctx.moveTo(76, 44);
  ctx.lineTo(76, 66);
  ctx.stroke();
  // Dots
  ctx.fillStyle = ac;
  [[28, 52], [28, 60]].forEach(([x, y]) => {
    ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
  });
}

function drawDrone(ctx, mc, ac) {
  // Central body
  const bg = ctx.createRadialGradient(64, 64, 4, 64, 64, 18);
  bg.addColorStop(0, lighten(mc, 20));
  bg.addColorStop(1, mc);
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.ellipse(64, 64, 18, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  // Body detail
  ctx.strokeStyle = darken(mc, 30);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(64, 64, 18, 14, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Eye/sensor
  ctx.fillStyle = ac;
  ctx.beginPath();
  ctx.ellipse(64, 60, 6, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = lighten(ac, 50);
  ctx.beginPath();
  ctx.arc(62, 59, 1.5, 0, Math.PI * 2);
  ctx.fill();
  // Arms
  ctx.strokeStyle = mc;
  ctx.lineWidth = 3;
  // Top-left
  ctx.beginPath(); ctx.moveTo(50, 54); ctx.lineTo(24, 28); ctx.stroke();
  // Top-right
  ctx.beginPath(); ctx.moveTo(78, 54); ctx.lineTo(104, 28); ctx.stroke();
  // Bottom-left
  ctx.beginPath(); ctx.moveTo(50, 74); ctx.lineTo(24, 100); ctx.stroke();
  // Bottom-right
  ctx.beginPath(); ctx.moveTo(78, 74); ctx.lineTo(104, 100); ctx.stroke();
  // Propellers
  const propPositions = [[24, 28], [104, 28], [24, 100], [104, 100]];
  propPositions.forEach(([px, py]) => {
    // Motor hub
    ctx.fillStyle = darken(mc, 20);
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fill();
    // Blades
    ctx.fillStyle = ac + '88';
    ctx.beginPath();
    ctx.ellipse(px, py, 14, 3, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(px, py, 14, 3, -0.5, 0, Math.PI * 2);
    ctx.fill();
    // Motion blur ring
    ctx.strokeStyle = ac + '33';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(px, py, 13, 0, Math.PI * 2);
    ctx.stroke();
  });
  // Bottom lights
  ctx.fillStyle = '#FF4444';
  ctx.beginPath();
  ctx.arc(58, 72, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#44FF44';
  ctx.beginPath();
  ctx.arc(70, 72, 2, 0, Math.PI * 2);
  ctx.fill();
}

// ══════════════════════════════════════════════════════
//  ARMOR PIECE DRAWING FUNCTIONS
// ══════════════════════════════════════════════════════

function drawChestArmor(ctx, mainColor, accentColor, details) {
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
  addSheen(ctx, 30, 24, 20, 16, lighten(mainColor, 30));
  // Accent lines
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
    [[40, 40], [88, 40], [40, 60], [88, 60], [40, 80], [88, 80]].forEach(([x, y]) => {
      ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
    });
  }
}

function drawLegs(ctx, mainColor, accentColor) {
  ctx.fillStyle = mainColor;
  // Left leg
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
  addSheen(ctx, 30, 16, 28, 80, lighten(mainColor, 20));
}

function drawGloves(ctx, mainColor, accentColor) {
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
  [[44, 96], [52, 100], [60, 96], [68, 88]].forEach(([x, y]) => {
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
  addSheen(ctx, 30, 20, 20, 50, lighten(mainColor, 30));
}

function drawBoots(ctx, mainColor, accentColor) {
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
  addSheen(ctx, 30, 14, 18, 60, lighten(mainColor, 25));
}

function drawArmorShield(ctx, mainColor, emblemColor, shape) {
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
    ctx.strokeStyle = lighten(mainColor, 30);
    ctx.lineWidth = 3;
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
    ctx.arc(64, 60, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = lighten(mainColor, 30);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(64, 60, 37, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Center emblem
  ctx.fillStyle = emblemColor;
  ctx.beginPath();
  ctx.arc(64, 56, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = lighten(emblemColor, 40);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(64, 46); ctx.lineTo(64, 66);
  ctx.moveTo(54, 56); ctx.lineTo(74, 56);
  ctx.stroke();
  // Rivets
  ctx.fillStyle = '#CCC';
  const cy = shape === 'kite' ? 56 : 60;
  [[64, cy - 30], [36, cy], [92, cy], [64, cy + 30]].forEach(([x, y]) => {
    ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill();
  });
}

function drawRing(ctx, bandColor, gemColor, glowColor) {
  ctx.lineWidth = 5;
  ctx.strokeStyle = bandColor;
  ctx.beginPath();
  ctx.ellipse(64, 68, 24, 30, 0, 0, Math.PI * 2);
  ctx.stroke();
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
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath();
  ctx.arc(62, 36, 2, 0, Math.PI * 2);
  ctx.fill();
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
  ctx.lineWidth = 3;
  ctx.strokeStyle = metalColor;
  ctx.beginPath();
  ctx.arc(64, 34, 8, Math.PI * 0.5, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(72, 34);
  ctx.lineTo(72, 56);
  ctx.stroke();
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
  ctx.lineWidth = 2;
  ctx.strokeStyle = chainColor;
  ctx.beginPath();
  ctx.moveTo(24, 20);
  ctx.quadraticCurveTo(64, 8, 104, 20);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(64, 12);
  ctx.lineTo(64, 44);
  ctx.stroke();
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

// ══════════════════════════════════════════════════════
//  TIER COLOR PALETTES
// ══════════════════════════════════════════════════════

const TIER_COLORS = {
  basic: { mc: '#8B5A2B', ac: '#AA6A3B', bg: '#3A2A1A' },   // rusty brown
  t1:    { mc: '#7A8899', ac: '#99AABB', bg: '#2A3344' },    // steel grey
  t2:    { mc: '#4477BB', ac: '#6699DD', bg: '#1A2A44' },    // blue
  t3:    { mc: '#BB8800', ac: '#AA66CC', bg: '#3A2A10' },    // gold/purple
};

// ══════════════════════════════════════════════════════
//  WEAPON TYPE REGISTRY
// ══════════════════════════════════════════════════════

const WEAPON_TYPES = {
  sword:    drawSword,
  shield:   drawShieldWeapon,
  fists:    drawFists,
  maul:     drawMaul,
  rifle:    drawRifle,
  pistols:  drawPistols,
  bow:      drawBow,
  launcher: drawLauncher,
  flame:    drawFlame,
  flask:    drawFlask,
  satchel:  drawSatchel,
  book:     drawBook,
  flag:     drawFlag,
  gun:      drawTechGun,
  drone:    drawDrone,
};

// Map from job2 weapon prefix to weapon drawing type
const JOB2_WEAPONS = [
  ['arsonist_flame',      'flame'],
  ['bombardier_launcher', 'launcher'],
  ['bruiser_fists',       'fists'],
  ['chemist_flask',       'flask'],
  ['chemist_satchel',     'satchel'],
  ['crusher_maul',        'maul'],
  ['engineer_drone',      'drone'],
  ['engineer_gun',        'gun'],
  ['gunslinger_pistols',  'pistols'],
  ['hunter_bow',          'bow'],
  ['medic_book',          'book'],
  ['sentinel_shield',     'shield'],
  ['sentinel_sword',      'sword'],
  ['sniper_rifle',        'rifle'],
  ['tactician_flag',      'flag'],
];

const TIERS = ['basic', 't1', 't2', 't3'];

// ══════════════════════════════════════════════════════
//  GENERATE JOB2 WEAPONS
// ══════════════════════════════════════════════════════

console.log('Generating Job2 weapons...');

for (const [prefix, weaponType] of JOB2_WEAPONS) {
  for (const tier of TIERS) {
    const name = `${prefix}_${tier}`;
    const colors = TIER_COLORS[tier];
    const canvas = createCanvas(SIZE, SIZE);
    const ctx = canvas.getContext('2d');
    makeBg(ctx, colors.bg);
    WEAPON_TYPES[weaponType](ctx, colors.mc, colors.ac);
    save(canvas, name);
  }
}

console.log(`  ${JOB2_WEAPONS.length * TIERS.length} Job2 weapons done.`);

// ══════════════════════════════════════════════════════
//  ARMOR SET DEFINITIONS
// ══════════════════════════════════════════════════════

const ARMOR_SETS = {
  watchman: {
    main: '#557788', accent: '#7799AA', badge: '#557788', letter: 'Wm', bg: '#1A2A33',
    tier: 'T2',
  },
  ironclad: {
    main: '#667788', accent: '#8899AA', badge: '#667788', letter: 'Ic', bg: '#1A2233',
    tier: 'T4',
  },
  alchemist: {
    main: '#558855', accent: '#77AA77', badge: '#558855', letter: 'Al', bg: '#1A2A1A',
    tier: 'T4',
  },
  triage: {
    main: '#AA5555', accent: '#CC7777', badge: '#AA5555', letter: 'Tr', bg: '#2A1A1A',
    tier: 'T4',
  },
  citadel: {
    main: '#778899', accent: '#99AABB', badge: '#778899', letter: 'Ct', bg: '#1A2233',
    tier: 'T7',
  },
  lifeline: {
    main: '#55AA77', accent: '#77CC99', badge: '#55AA77', letter: 'Ll', bg: '#1A2A22',
    tier: 'T7',
  },
  catalyst: {
    main: '#8855AA', accent: '#AA77CC', badge: '#8855AA', letter: 'Ca', bg: '#221A2A',
    tier: 'T7',
  },
};

const ARMOR_ITEMS = [
  // Watchman (T2)
  ['watchman_vest',      'watchman', 'chest'],
  ['watchman_pants',     'watchman', 'legs'],
  ['watchman_gloves',    'watchman', 'gloves'],
  ['watchman_boots',     'watchman', 'boots'],
  ['watchman_ring',      'watchman', 'ring'],
  ['watchman_earring',   'watchman', 'earring'],

  // Ironclad (T4)
  ['ironclad_plate',     'ironclad', 'chest'],
  ['ironclad_legguards', 'ironclad', 'legs'],
  ['ironclad_gauntlets', 'ironclad', 'gloves'],
  ['ironclad_boots',     'ironclad', 'boots'],
  ['ironclad_shield',    'ironclad', 'shield'],
  ['ironclad_pendant',   'ironclad', 'pendant'],

  // Alchemist (T4)
  ['alchemist_coat',     'alchemist', 'chest'],
  ['alchemist_pants',    'alchemist', 'legs'],
  ['alchemist_gloves',   'alchemist', 'gloves'],
  ['alchemist_boots',    'alchemist', 'boots'],
  ['alchemist_ring',     'alchemist', 'ring'],
  ['alchemist_earring',  'alchemist', 'earring'],

  // Triage (T4)
  ['triage_vest',        'triage', 'chest'],
  ['triage_pants',       'triage', 'legs'],
  ['triage_gloves',      'triage', 'gloves'],
  ['triage_boots',       'triage', 'boots'],
  ['triage_earring',     'triage', 'earring'],
  ['triage_pendant',     'triage', 'pendant'],

  // Citadel (T7)
  ['citadel_plate',      'citadel', 'chest'],
  ['citadel_legguards',  'citadel', 'legs'],
  ['citadel_gauntlets',  'citadel', 'gloves'],
  ['citadel_boots',      'citadel', 'boots'],
  ['citadel_shield',     'citadel', 'shield'],
  ['citadel_ring',       'citadel', 'ring'],
  ['citadel_pendant',    'citadel', 'pendant'],

  // Lifeline (T7)
  ['lifeline_vest',      'lifeline', 'chest'],
  ['lifeline_pants',     'lifeline', 'legs'],
  ['lifeline_gloves',    'lifeline', 'gloves'],
  ['lifeline_boots',     'lifeline', 'boots'],
  ['lifeline_ring',      'lifeline', 'ring'],
  ['lifeline_earring',   'lifeline', 'earring'],
  ['lifeline_pendant',   'lifeline', 'pendant'],

  // Catalyst (T7)
  ['catalyst_harness',   'catalyst', 'chest'],
  ['catalyst_pants',     'catalyst', 'legs'],
  ['catalyst_gloves',    'catalyst', 'gloves'],
  ['catalyst_boots',     'catalyst', 'boots'],
  ['catalyst_ring',      'catalyst', 'ring'],
  ['catalyst_earring',   'catalyst', 'earring'],
  ['catalyst_pendant',   'catalyst', 'pendant'],
];

// ══════════════════════════════════════════════════════
//  GENERATE ARMOR SETS
// ══════════════════════════════════════════════════════

console.log('Generating armor set pieces...');

for (const [name, setKey, slotType] of ARMOR_ITEMS) {
  const set = ARMOR_SETS[setKey];
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  makeBg(ctx, set.bg);

  switch (slotType) {
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
      drawArmorShield(ctx, set.main, set.accent, 'kite');
      break;
    case 'ring':
      drawRing(ctx, set.main, set.accent, set.accent);
      break;
    case 'earring':
      drawEarring(ctx, set.main, set.accent);
      break;
    case 'pendant':
      drawPendant(ctx, set.main, set.accent, 'diamond');
      break;
  }

  addSetBadge(ctx, set.letter, set.badge);
  save(canvas, name);
}

console.log(`  ${ARMOR_ITEMS.length} armor set pieces done.`);

// ══════════════════════════════════════════════════════
//  SUMMARY
// ══════════════════════════════════════════════════════

console.log(`\nTotal icons generated: ${generated}`);
console.log(`Output directory: ${outDir}`);
