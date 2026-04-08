/**
 * Generate class-specific accessory equipment icons at 128x128.
 * Smooth rendering — gradients, arcs, bezier curves. No pixel art.
 * 12 distinct accessory types: bands, hoops, studs, signets, seals,
 * pendants, amulets, lockets, charms, chains, loops, drops.
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

// ── Color helpers ──────────────────────────────────

function lighten(hex, amt) {
  if (!hex || hex.startsWith('rgb')) return hex || '#FFF';
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amt);
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amt);
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amt);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function darken(hex, amt) {
  if (!hex || hex.startsWith('rgb')) return hex || '#000';
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amt);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amt);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amt);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// ── Shared draw helpers ────────────────────────────

function makeBg(ctx, vignetteColor) {
  ctx.fillStyle = '#0D0D0D';
  ctx.fillRect(0, 0, SIZE, SIZE);
  const g = ctx.createRadialGradient(64, 64, 10, 64, 64, 80);
  g.addColorStop(0, vignetteColor + '30');
  g.addColorStop(1, 'transparent');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SIZE, SIZE);
}

function gemGradient(ctx, cx, cy, r, gemColor) {
  const gg = ctx.createRadialGradient(cx - 1, cy - 2, 1, cx, cy, r);
  gg.addColorStop(0, lighten(gemColor, 60));
  gg.addColorStop(0.45, gemColor);
  gg.addColorStop(1, darken(gemColor, 50));
  return gg;
}

function gemHighlight(ctx, cx, cy, r) {
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath();
  ctx.arc(cx - r * 0.3, cy - r * 0.3, r * 0.3, 0, Math.PI * 2);
  ctx.fill();
}

function metalSheen(ctx, x, y, w, h, color) {
  const sh = ctx.createLinearGradient(x, y, x + w * 0.6, y + h);
  sh.addColorStop(0, lighten(color, 40) + '55');
  sh.addColorStop(1, 'transparent');
  ctx.fillStyle = sh;
  ctx.fillRect(x, y, w, h);
}

// ── RING / BAND (metallic band ellipse + colored gem) ──

function drawBand(ctx, bandColor, gemColor) {
  // Band body — ellipse
  ctx.lineWidth = 6;
  ctx.strokeStyle = bandColor;
  ctx.beginPath();
  ctx.ellipse(64, 70, 24, 30, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Inner sheen
  ctx.lineWidth = 2;
  ctx.strokeStyle = lighten(bandColor, 45);
  ctx.beginPath();
  ctx.ellipse(64, 70, 19, 25, 0, Math.PI * 0.7, Math.PI * 1.4);
  ctx.stroke();
  // Gem mount (prong setting)
  ctx.fillStyle = darken(bandColor, 20);
  ctx.beginPath();
  ctx.moveTo(54, 42);
  ctx.lineTo(64, 34);
  ctx.lineTo(74, 42);
  ctx.closePath();
  ctx.fill();
  // Gem
  ctx.fillStyle = gemGradient(ctx, 64, 38, 9, gemColor);
  ctx.beginPath();
  ctx.arc(64, 38, 8, 0, Math.PI * 2);
  ctx.fill();
  gemHighlight(ctx, 64, 38, 8);
  // Gem glow
  const gl = ctx.createRadialGradient(64, 38, 2, 64, 38, 20);
  gl.addColorStop(0, gemColor + '55');
  gl.addColorStop(1, 'transparent');
  ctx.fillStyle = gl;
  ctx.beginPath();
  ctx.arc(64, 38, 20, 0, Math.PI * 2);
  ctx.fill();
}

// ── HOOP (smaller wire ring, scout-style) ──

function drawHoop(ctx, hoopColor) {
  // Outer hoop
  ctx.lineWidth = 4;
  ctx.strokeStyle = hoopColor;
  ctx.beginPath();
  ctx.ellipse(64, 66, 18, 22, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Inner hoop
  ctx.lineWidth = 2;
  ctx.strokeStyle = lighten(hoopColor, 30);
  ctx.beginPath();
  ctx.ellipse(64, 66, 13, 17, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Wire twist detail at top
  ctx.lineWidth = 3;
  ctx.strokeStyle = lighten(hoopColor, 20);
  ctx.beginPath();
  ctx.arc(64, 44, 5, 0, Math.PI * 2);
  ctx.stroke();
  // Sheen line
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = lighten(hoopColor, 50) + '66';
  ctx.beginPath();
  ctx.ellipse(58, 62, 10, 18, -0.15, Math.PI * 1.2, Math.PI * 1.8);
  ctx.stroke();
}

// ── STUD (small post with gem face, earring stud) ──

function drawStud(ctx, gemColor) {
  const metalColor = '#888888';
  // Post
  ctx.lineWidth = 3;
  ctx.strokeStyle = metalColor;
  ctx.beginPath();
  ctx.moveTo(64, 82);
  ctx.lineTo(64, 58);
  ctx.stroke();
  // Post back (butterfly clasp)
  ctx.fillStyle = darken(metalColor, 20);
  ctx.beginPath();
  ctx.moveTo(56, 82);
  ctx.lineTo(64, 78);
  ctx.lineTo(72, 82);
  ctx.lineTo(72, 88);
  ctx.lineTo(56, 88);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = lighten(metalColor, 20);
  ctx.lineWidth = 1;
  ctx.stroke();
  // Bezel setting
  ctx.fillStyle = darken(metalColor, 10);
  ctx.beginPath();
  ctx.arc(64, 50, 16, 0, Math.PI * 2);
  ctx.fill();
  // Gem face
  ctx.fillStyle = gemGradient(ctx, 64, 48, 13, gemColor);
  ctx.beginPath();
  ctx.arc(64, 48, 13, 0, Math.PI * 2);
  ctx.fill();
  // Facet lines
  ctx.strokeStyle = lighten(gemColor, 30) + '44';
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI * 2 * i) / 6;
    ctx.beginPath();
    ctx.moveTo(64, 48);
    ctx.lineTo(64 + Math.cos(a) * 12, 48 + Math.sin(a) * 12);
    ctx.stroke();
  }
  gemHighlight(ctx, 64, 48, 13);
  // Gem glow
  const gl = ctx.createRadialGradient(64, 48, 3, 64, 48, 22);
  gl.addColorStop(0, gemColor + '44');
  gl.addColorStop(1, 'transparent');
  ctx.fillStyle = gl;
  ctx.beginPath();
  ctx.arc(64, 48, 22, 0, Math.PI * 2);
  ctx.fill();
}

// ── SIGNET (thick band with flat face / emblem) ──

function drawSignet(ctx, bandColor, faceColor) {
  // Thick band
  ctx.lineWidth = 8;
  ctx.strokeStyle = bandColor;
  ctx.beginPath();
  ctx.ellipse(64, 72, 22, 28, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Inner sheen
  ctx.lineWidth = 2;
  ctx.strokeStyle = lighten(bandColor, 35);
  ctx.beginPath();
  ctx.ellipse(64, 72, 15, 20, 0, Math.PI * 0.8, Math.PI * 1.5);
  ctx.stroke();
  // Flat signet face
  ctx.fillStyle = darken(bandColor, 15);
  ctx.beginPath();
  ctx.roundRect(48, 30, 32, 24, 4);
  ctx.fill();
  // Face plate
  ctx.fillStyle = faceColor;
  ctx.beginPath();
  ctx.roundRect(51, 33, 26, 18, 3);
  ctx.fill();
  // Emblem — shield shape on face
  ctx.fillStyle = darken(faceColor, 40);
  ctx.beginPath();
  ctx.moveTo(64, 36);
  ctx.lineTo(72, 40);
  ctx.lineTo(70, 48);
  ctx.lineTo(64, 50);
  ctx.lineTo(58, 48);
  ctx.lineTo(56, 40);
  ctx.closePath();
  ctx.fill();
  // Emblem cross
  ctx.strokeStyle = lighten(faceColor, 50);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(64, 37);
  ctx.lineTo(64, 49);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(58, 43);
  ctx.lineTo(70, 43);
  ctx.stroke();
}

// ── SEAL (heavy ornate ring with emblem) ──

function drawSeal(ctx, bandColor, emblemColor) {
  // Heavy outer band
  ctx.lineWidth = 10;
  ctx.strokeStyle = bandColor;
  ctx.beginPath();
  ctx.ellipse(64, 70, 26, 32, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Ornate dots around band
  ctx.fillStyle = lighten(bandColor, 30);
  for (let i = 0; i < 12; i++) {
    const a = (Math.PI * 2 * i) / 12;
    const rx = 26, ry = 32;
    const px = 64 + rx * Math.cos(a);
    const py = 70 + ry * Math.sin(a);
    ctx.beginPath();
    ctx.arc(px, py, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  // Inner sheen
  ctx.lineWidth = 2;
  ctx.strokeStyle = lighten(bandColor, 25);
  ctx.beginPath();
  ctx.ellipse(64, 70, 17, 22, 0, Math.PI * 0.6, Math.PI * 1.4);
  ctx.stroke();
  // Seal face — large circular
  ctx.fillStyle = darken(bandColor, 10);
  ctx.beginPath();
  ctx.arc(64, 36, 16, 0, Math.PI * 2);
  ctx.fill();
  // Emblem circle
  ctx.fillStyle = emblemColor;
  ctx.beginPath();
  ctx.arc(64, 36, 12, 0, Math.PI * 2);
  ctx.fill();
  // Wax seal pattern — star
  ctx.strokeStyle = darken(emblemColor, 40);
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 5; i++) {
    const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(64, 36);
    ctx.lineTo(64 + Math.cos(a) * 10, 36 + Math.sin(a) * 10);
    ctx.stroke();
  }
  gemHighlight(ctx, 64, 36, 10);
}

// ── PENDANT (chain arc + gem pendant) ──

function drawPendant(ctx, chainColor, gemColor) {
  // Chain arc
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = chainColor;
  ctx.beginPath();
  ctx.moveTo(20, 18);
  ctx.quadraticCurveTo(64, 6, 108, 18);
  ctx.stroke();
  // Chain links detail
  ctx.lineWidth = 1;
  ctx.strokeStyle = lighten(chainColor, 30);
  for (let t = 0.1; t < 0.9; t += 0.08) {
    const x = 20 + (108 - 20) * t;
    const y = 18 - 12 * Math.sin(t * Math.PI) + 6;
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Drop chain to pendant
  ctx.lineWidth = 2;
  ctx.strokeStyle = chainColor;
  ctx.beginPath();
  ctx.moveTo(64, 10);
  ctx.lineTo(64, 48);
  ctx.stroke();
  // Pendant — teardrop gem
  ctx.fillStyle = gemGradient(ctx, 64, 68, 18, gemColor);
  ctx.beginPath();
  ctx.moveTo(64, 48);
  ctx.bezierCurveTo(82, 60, 82, 84, 64, 92);
  ctx.bezierCurveTo(46, 84, 46, 60, 64, 48);
  ctx.fill();
  // Pendant highlight
  gemHighlight(ctx, 64, 64, 14);
  // Pendant glow
  const gl = ctx.createRadialGradient(64, 68, 4, 64, 68, 28);
  gl.addColorStop(0, gemColor + '33');
  gl.addColorStop(1, 'transparent');
  ctx.fillStyle = gl;
  ctx.beginPath();
  ctx.arc(64, 68, 28, 0, Math.PI * 2);
  ctx.fill();
}

// ── AMULET (ornate chain + large pendant) ──

function drawAmulet(ctx, chainColor, gemColor) {
  // Ornate chain — double arc
  ctx.lineWidth = 3;
  ctx.strokeStyle = chainColor;
  ctx.beginPath();
  ctx.moveTo(16, 22);
  ctx.quadraticCurveTo(64, 4, 112, 22);
  ctx.stroke();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = lighten(chainColor, 20);
  ctx.beginPath();
  ctx.moveTo(18, 26);
  ctx.quadraticCurveTo(64, 10, 110, 26);
  ctx.stroke();
  // Decorative chain segments
  ctx.fillStyle = lighten(chainColor, 30);
  for (let t = 0.05; t < 0.95; t += 0.06) {
    const x = 16 + (112 - 16) * t;
    const y = 22 - 18 * Math.sin(t * Math.PI) + 6;
    ctx.beginPath();
    ctx.arc(x, y, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  // Bail (connector)
  ctx.fillStyle = chainColor;
  ctx.beginPath();
  ctx.arc(64, 14, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0D0D0D';
  ctx.beginPath();
  ctx.arc(64, 14, 2.5, 0, Math.PI * 2);
  ctx.fill();
  // Drop chain
  ctx.lineWidth = 2;
  ctx.strokeStyle = chainColor;
  ctx.beginPath();
  ctx.moveTo(64, 19);
  ctx.lineTo(64, 38);
  ctx.stroke();
  // Large ornate pendant frame
  ctx.fillStyle = darken(chainColor, 15);
  ctx.beginPath();
  ctx.arc(64, 66, 24, 0, Math.PI * 2);
  ctx.fill();
  // Inner frame ring
  ctx.strokeStyle = lighten(chainColor, 25);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(64, 66, 21, 0, Math.PI * 2);
  ctx.stroke();
  // Frame filigree points
  ctx.fillStyle = lighten(chainColor, 35);
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI * 2 * i) / 8;
    ctx.beginPath();
    ctx.arc(64 + Math.cos(a) * 24, 66 + Math.sin(a) * 24, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  // Large gem center
  ctx.fillStyle = gemGradient(ctx, 64, 66, 16, gemColor);
  ctx.beginPath();
  ctx.arc(64, 66, 16, 0, Math.PI * 2);
  ctx.fill();
  // Gem facet lines
  ctx.strokeStyle = lighten(gemColor, 30) + '33';
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI * 2 * i) / 8;
    ctx.beginPath();
    ctx.moveTo(64, 66);
    ctx.lineTo(64 + Math.cos(a) * 15, 66 + Math.sin(a) * 15);
    ctx.stroke();
  }
  gemHighlight(ctx, 64, 64, 16);
  // Amulet glow
  const gl = ctx.createRadialGradient(64, 66, 5, 64, 66, 36);
  gl.addColorStop(0, gemColor + '44');
  gl.addColorStop(1, 'transparent');
  ctx.fillStyle = gl;
  ctx.beginPath();
  ctx.arc(64, 66, 36, 0, Math.PI * 2);
  ctx.fill();
}

// ── LOCKET (chain + small round hinged case) ──

function drawLocket(ctx, chainColor, caseColor) {
  // Chain arc
  ctx.lineWidth = 2;
  ctx.strokeStyle = chainColor;
  ctx.beginPath();
  ctx.moveTo(22, 20);
  ctx.quadraticCurveTo(64, 6, 106, 20);
  ctx.stroke();
  // Chain links
  ctx.strokeStyle = lighten(chainColor, 25);
  ctx.lineWidth = 1;
  for (let t = 0.12; t < 0.88; t += 0.1) {
    const x = 22 + (106 - 22) * t;
    const y = 20 - 14 * Math.sin(t * Math.PI) + 4;
    ctx.beginPath();
    ctx.ellipse(x, y, 2.5, 1.5, t * 0.5, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Drop chain
  ctx.lineWidth = 2;
  ctx.strokeStyle = chainColor;
  ctx.beginPath();
  ctx.moveTo(64, 10);
  ctx.lineTo(64, 42);
  ctx.stroke();
  // Locket body — round case
  ctx.fillStyle = caseColor;
  ctx.beginPath();
  ctx.arc(64, 66, 20, 0, Math.PI * 2);
  ctx.fill();
  // Locket rim
  ctx.strokeStyle = lighten(caseColor, 30);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(64, 66, 20, 0, Math.PI * 2);
  ctx.stroke();
  // Hinge line (divides case in half)
  ctx.strokeStyle = darken(caseColor, 30);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(44, 66);
  ctx.lineTo(84, 66);
  ctx.stroke();
  // Hinge detail on left
  ctx.fillStyle = darken(caseColor, 20);
  ctx.beginPath();
  ctx.arc(44, 66, 3, 0, Math.PI * 2);
  ctx.fill();
  // Clasp on right
  ctx.fillStyle = lighten(caseColor, 20);
  ctx.beginPath();
  ctx.arc(84, 66, 3, 0, Math.PI * 2);
  ctx.fill();
  // Decorative circle on front
  ctx.strokeStyle = lighten(caseColor, 40);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(64, 58, 8, 0, Math.PI * 2);
  ctx.stroke();
  // Center dot
  ctx.fillStyle = lighten(caseColor, 50);
  ctx.beginPath();
  ctx.arc(64, 58, 2, 0, Math.PI * 2);
  ctx.fill();
  // Sheen
  const sh = ctx.createLinearGradient(50, 50, 70, 60);
  sh.addColorStop(0, lighten(caseColor, 40) + '44');
  sh.addColorStop(1, 'transparent');
  ctx.fillStyle = sh;
  ctx.beginPath();
  ctx.arc(64, 66, 18, Math.PI * 1.1, Math.PI * 1.7);
  ctx.fill();
}

// ── CHARM (chain + small dangling ornament) ──

function drawCharm(ctx, chainColor, charmColor) {
  // Chain arc
  ctx.lineWidth = 2;
  ctx.strokeStyle = chainColor;
  ctx.beginPath();
  ctx.moveTo(24, 20);
  ctx.quadraticCurveTo(64, 6, 104, 20);
  ctx.stroke();
  // Chain links
  ctx.strokeStyle = lighten(chainColor, 20);
  ctx.lineWidth = 1;
  for (let t = 0.1; t < 0.9; t += 0.09) {
    const x = 24 + (104 - 24) * t;
    const y = 20 - 14 * Math.sin(t * Math.PI) + 4;
    ctx.beginPath();
    ctx.arc(x, y, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  // Drop chain
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = chainColor;
  ctx.beginPath();
  ctx.moveTo(64, 10);
  ctx.lineTo(64, 44);
  ctx.stroke();
  // Small ring connector
  ctx.strokeStyle = lighten(chainColor, 25);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(64, 46, 4, 0, Math.PI * 2);
  ctx.stroke();
  // Charm body — diamond/kite shape
  ctx.fillStyle = charmColor;
  ctx.beginPath();
  ctx.moveTo(64, 52);
  ctx.lineTo(76, 68);
  ctx.lineTo(64, 92);
  ctx.lineTo(52, 68);
  ctx.closePath();
  ctx.fill();
  // Charm inner glow
  const cg = ctx.createRadialGradient(63, 70, 2, 64, 72, 14);
  cg.addColorStop(0, lighten(charmColor, 50));
  cg.addColorStop(0.5, charmColor);
  cg.addColorStop(1, darken(charmColor, 40));
  ctx.fillStyle = cg;
  ctx.beginPath();
  ctx.moveTo(64, 56);
  ctx.lineTo(73, 68);
  ctx.lineTo(64, 88);
  ctx.lineTo(55, 68);
  ctx.closePath();
  ctx.fill();
  // Charm edge highlight
  ctx.strokeStyle = lighten(charmColor, 40) + '66';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(64, 54);
  ctx.lineTo(54, 68);
  ctx.stroke();
  gemHighlight(ctx, 62, 66, 10);
  // Glow
  const gl = ctx.createRadialGradient(64, 72, 3, 64, 72, 26);
  gl.addColorStop(0, charmColor + '44');
  gl.addColorStop(1, 'transparent');
  ctx.fillStyle = gl;
  ctx.beginPath();
  ctx.arc(64, 72, 26, 0, Math.PI * 2);
  ctx.fill();
}

// ── CHAIN (thick chain necklace) ──

function drawChain(ctx, chainColor) {
  // Main chain — thick double arc
  ctx.lineWidth = 6;
  ctx.strokeStyle = chainColor;
  ctx.beginPath();
  ctx.moveTo(10, 30);
  ctx.quadraticCurveTo(64, 8, 118, 30);
  ctx.stroke();
  // Chain links — interlocking ovals
  ctx.lineWidth = 3;
  ctx.strokeStyle = lighten(chainColor, 20);
  const steps = 14;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = 10 + (118 - 10) * t;
    const y = 30 - 22 * Math.sin(t * Math.PI) + 8;
    ctx.beginPath();
    ctx.ellipse(x, y, 5, 3.5, t * Math.PI * 0.4, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Lower drape
  ctx.lineWidth = 5;
  ctx.strokeStyle = chainColor;
  ctx.beginPath();
  ctx.moveTo(24, 26);
  ctx.quadraticCurveTo(64, 100, 104, 26);
  ctx.stroke();
  // Lower chain links
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = lighten(chainColor, 15);
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    const x = 24 + (104 - 24) * t;
    const droop = 74 * Math.sin(t * Math.PI);
    const y = 26 + droop;
    ctx.beginPath();
    ctx.ellipse(x, y, 4, 3, t * 0.8, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Sheen highlights
  ctx.strokeStyle = lighten(chainColor, 45) + '44';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(30, 22);
  ctx.quadraticCurveTo(64, 8, 98, 22);
  ctx.stroke();
  // Center weight/clasp
  ctx.fillStyle = lighten(chainColor, 25);
  ctx.beginPath();
  ctx.arc(64, 94, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = darken(chainColor, 20);
  ctx.beginPath();
  ctx.arc(64, 94, 3, 0, Math.PI * 2);
  ctx.fill();
}

// ── LOOP (wire earring loop) ──

function drawLoop(ctx, wireColor) {
  // Ear hook
  ctx.lineWidth = 3;
  ctx.strokeStyle = lighten(wireColor, 15);
  ctx.beginPath();
  ctx.arc(64, 26, 8, Math.PI * 0.3, Math.PI * 2.2);
  ctx.stroke();
  // Main loop wire — teardrop shape
  ctx.lineWidth = 3;
  ctx.strokeStyle = wireColor;
  ctx.beginPath();
  ctx.moveTo(64, 34);
  ctx.bezierCurveTo(88, 46, 88, 86, 64, 96);
  ctx.bezierCurveTo(40, 86, 40, 46, 64, 34);
  ctx.stroke();
  // Inner loop
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = lighten(wireColor, 25);
  ctx.beginPath();
  ctx.moveTo(64, 42);
  ctx.bezierCurveTo(80, 52, 80, 80, 64, 88);
  ctx.bezierCurveTo(48, 80, 48, 52, 64, 42);
  ctx.stroke();
  // Sheen dot
  ctx.fillStyle = lighten(wireColor, 50) + '66';
  ctx.beginPath();
  ctx.arc(56, 56, 3, 0, Math.PI * 2);
  ctx.fill();
  // Wire glow
  const gl = ctx.createRadialGradient(64, 66, 5, 64, 66, 35);
  gl.addColorStop(0, wireColor + '33');
  gl.addColorStop(1, 'transparent');
  ctx.fillStyle = gl;
  ctx.beginPath();
  ctx.arc(64, 66, 35, 0, Math.PI * 2);
  ctx.fill();
}

// ── DROP (hook + dangling teardrop gem earring) ──

function drawDrop(ctx, metalColor, gemColor) {
  // Ear hook
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = metalColor;
  ctx.beginPath();
  ctx.arc(64, 26, 8, Math.PI * 0.4, Math.PI * 2.1);
  ctx.stroke();
  // Connector chain
  ctx.lineWidth = 2;
  ctx.strokeStyle = metalColor;
  ctx.beginPath();
  ctx.moveTo(72, 26);
  ctx.lineTo(72, 40);
  ctx.stroke();
  // Small connecting links
  ctx.strokeStyle = lighten(metalColor, 20);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(72, 34, 2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(72, 40, 2, 0, Math.PI * 2);
  ctx.stroke();
  // Drop stem
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = metalColor;
  ctx.beginPath();
  ctx.moveTo(72, 42);
  ctx.lineTo(64, 50);
  ctx.stroke();
  // Teardrop gem
  ctx.fillStyle = gemGradient(ctx, 64, 72, 16, gemColor);
  ctx.beginPath();
  ctx.moveTo(64, 50);
  ctx.bezierCurveTo(80, 60, 82, 84, 64, 96);
  ctx.bezierCurveTo(46, 84, 48, 60, 64, 50);
  ctx.fill();
  // Facet lines on drop
  ctx.strokeStyle = lighten(gemColor, 20) + '33';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(64, 52);
  ctx.lineTo(56, 74);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(64, 52);
  ctx.lineTo(72, 74);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(56, 74);
  ctx.lineTo(72, 74);
  ctx.stroke();
  gemHighlight(ctx, 60, 66, 12);
  // Drop glow
  const gl = ctx.createRadialGradient(64, 74, 3, 64, 74, 24);
  gl.addColorStop(0, gemColor + '44');
  gl.addColorStop(1, 'transparent');
  ctx.fillStyle = gl;
  ctx.beginPath();
  ctx.arc(64, 74, 24, 0, Math.PI * 2);
  ctx.fill();
}

// ══════════════════════════════════════════════════
// ITEM DEFINITIONS
// ══════════════════════════════════════════════════

const ITEMS = [
  // ── RINGS / BANDS (metallic band + colored gem) ──
  { name: 'brawlers_band',       type: 'band',    gem: '#CC2222', band: '#8B7355' },
  { name: 'swiftblade_band',     type: 'band',    gem: '#33AA33', band: '#8B7355' },
  { name: 'demolishers_band',    type: 'band',    gem: '#3366CC', band: '#8B7355' },
  { name: 'detonators_band',     type: 'band',    gem: '#DD8822', band: '#8B7355' },
  { name: 'annihilators_band',   type: 'band',    gem: '#8833CC', band: '#8B7355' },
  { name: 'vanguards_ring',      type: 'band',    gem: '#CCAA22', band: '#999999' },
  { name: 'wanderers_ring',      type: 'band',    gem: '#22AA99', band: '#999999' },
  { name: 'champions_ring',      type: 'band',    gem: '#DDCC22', band: '#AAAAAA' },
  { name: 'legends_ring',        type: 'band',    gem: '#DDDDDD', band: '#BBBBBB' },
  { name: 'deadeyes_ring',       type: 'band',    gem: '#33BB33', band: '#777777' },
  { name: 'sharpshooters_ring',  type: 'band',    gem: '#22BBCC', band: '#888888' },
  { name: 'hawkstrike_ring',     type: 'band',    gem: '#88CC22', band: '#888888' },

  // ── HOOPS (smaller round band) ──
  { name: 'scouts_hoop',         type: 'hoop',    color: '#33AA33' },
  { name: 'snipers_hoop',        type: 'hoop',    color: '#226633' },
  { name: 'trackers_hoop',       type: 'hoop',    color: '#808020' },
  { name: 'aces_hoop',           type: 'hoop',    color: '#CCAA22' },

  // ── STUDS (earring studs) ──
  { name: 'berserkers_stud',     type: 'stud',    gem: '#CC2222' },
  { name: 'gladiators_stud',     type: 'stud',    gem: '#DD8822' },
  { name: 'warriors_stud',       type: 'stud',    gem: '#AA1122' },
  { name: 'survivors_stud',      type: 'stud',    gem: '#33AA33' },
  { name: 'sages_stud',          type: 'stud',    gem: '#3366CC' },
  { name: 'veterans_stud',       type: 'stud',    gem: '#8833CC' },
  { name: 'elders_stud',         type: 'stud',    gem: '#CCAA22' },
  { name: 'medics_stud',         type: 'stud',    gem: '#DDDDDD' },
  { name: 'warlords_stud',       type: 'stud',    gem: '#881122' },

  // ── SIGNETS (thick band + flat face) ──
  { name: 'wardens_signet',      type: 'signet',  face: '#3366CC', band: '#777777' },
  { name: 'restorers_signet',    type: 'signet',  face: '#CCAA22', band: '#888888' },
  { name: 'archons_signet',      type: 'signet',  face: '#8833CC', band: '#999999' },
  { name: 'chemists_signet',     type: 'signet',  face: '#33AA44', band: '#777777' },

  // ── SEALS (heavy ornate ring) ──
  { name: 'crushers_seal',       type: 'seal',    emblem: '#8B6B3E', band: '#665544' },
  { name: 'juggernauts_seal',    type: 'seal',    emblem: '#AAAAAA', band: '#888888' },
  { name: 'colossus_seal',       type: 'seal',    emblem: '#CCAA22', band: '#999966' },

  // ── PENDANTS (chain + pendant gem) ──
  { name: 'bloodthorn_pendant',  type: 'pendant', gem: '#881122', chain: '#777777' },
  { name: 'razorwire_pendant',   type: 'pendant', gem: '#AAAAAA', chain: '#888888' },
  { name: 'thorned_pendant',     type: 'pendant', gem: '#8B6B3E', chain: '#666655' },
  { name: 'briarwall_pendant',   type: 'pendant', gem: '#33AA33', chain: '#777766' },
  { name: 'predators_pendant',   type: 'pendant', gem: '#AA1122', chain: '#777777' },
  { name: 'eagles_pendant',      type: 'pendant', gem: '#CCAA22', chain: '#999977' },
  { name: 'falcons_pendant',     type: 'pendant', gem: '#66AADD', chain: '#888888' },
  { name: 'hawkeyes_pendant',    type: 'pendant', gem: '#33AA44', chain: '#777766' },

  // ── AMULETS (ornate chain + large pendant) ──
  { name: 'guardians_amulet',    type: 'amulet',  gem: '#CCAA22', chain: '#999977' },
  { name: 'lifebinder_amulet',   type: 'amulet',  gem: '#33BB44', chain: '#777766' },
  { name: 'sanctum_amulet',      type: 'amulet',  gem: '#DDCC88', chain: '#AAAAAA' },
  { name: 'divines_amulet',      type: 'amulet',  gem: '#EEEEEE', chain: '#BBBBAA' },

  // ── LOCKETS (chain + small round locket) ──
  { name: 'nomads_locket',       type: 'locket',  caseColor: '#8B6B3E', chain: '#666655' },
  { name: 'travelers_locket',    type: 'locket',  caseColor: '#22AA99', chain: '#777777' },
  { name: 'pathfinders_locket',  type: 'locket',  caseColor: '#33AA44', chain: '#777766' },
  { name: 'sovereigns_locket',   type: 'locket',  caseColor: '#CCAA22', chain: '#999977' },

  // ── CHARMS (small dangling charm on chain) ──
  { name: 'ignition_charm',      type: 'charm',   color: '#DD7722', chain: '#777766' },
  { name: 'meltdown_charm',      type: 'charm',   color: '#CC2222', chain: '#777766' },
  { name: 'volatile_charm',      type: 'charm',   color: '#AACC22', chain: '#777766' },
  { name: 'cataclysm_charm',     type: 'charm',   color: '#8833CC', chain: '#777766' },

  // ── CHAINS (thick chain necklace) ──
  { name: 'fortress_chain',      type: 'chain',   color: '#AAAAAA' },
  { name: 'ironheart_chain',     type: 'chain',   color: '#666677' },
  { name: 'warhorns_chain',      type: 'chain',   color: '#AA8844' },
  { name: 'titans_chain',        type: 'chain',   color: '#CCAA22' },

  // ── LOOPS (wire earring loops) ──
  { name: 'marksmans_loop',      type: 'loop',    color: '#33AA33' },
  { name: 'phantoms_loop',       type: 'loop',    color: '#8833CC' },
  { name: 'specters_loop',       type: 'loop',    color: '#6688CC' },
  { name: 'wraiths_loop',        type: 'loop',    color: '#553388' },
  { name: 'healers_circle',      type: 'loop',    color: '#88CC88' },

  // ── DROPS (dangling drop earrings) ──
  { name: 'vampires_drop',       type: 'drop',    gem: '#CC2222', metal: '#888888' },
  { name: 'leeches_drop',        type: 'drop',    gem: '#881122', metal: '#777777' },
  { name: 'parasites_drop',      type: 'drop',    gem: '#33AA33', metal: '#777777' },
  { name: 'venoms_drop',         type: 'drop',    gem: '#66CC22', metal: '#777777' },
];

// ══════════════════════════════════════════════════
// GENERATION
// ══════════════════════════════════════════════════

let count = 0;

for (const item of ITEMS) {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');

  // Pick vignette color based on dominant color
  const vignetteColor = item.gem || item.color || item.face || item.emblem || item.caseColor || '#555555';
  makeBg(ctx, vignetteColor);

  switch (item.type) {
    case 'band':
      drawBand(ctx, item.band, item.gem);
      break;
    case 'hoop':
      drawHoop(ctx, item.color);
      break;
    case 'stud':
      drawStud(ctx, item.gem);
      break;
    case 'signet':
      drawSignet(ctx, item.band, item.face);
      break;
    case 'seal':
      drawSeal(ctx, item.band, item.emblem);
      break;
    case 'pendant':
      drawPendant(ctx, item.chain, item.gem);
      break;
    case 'amulet':
      drawAmulet(ctx, item.chain, item.gem);
      break;
    case 'locket':
      drawLocket(ctx, item.chain, item.caseColor);
      break;
    case 'charm':
      drawCharm(ctx, item.chain, item.color);
      break;
    case 'chain':
      drawChain(ctx, item.color);
      break;
    case 'loop':
      drawLoop(ctx, item.color);
      break;
    case 'drop':
      drawDrop(ctx, item.metal, item.gem);
      break;
  }

  save(canvas, item.name);
  count++;
}

console.log(`Done! Generated ${count} accessory equipment icons.`);
