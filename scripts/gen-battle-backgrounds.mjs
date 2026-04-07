/**
 * Generate 7 battle scene backgrounds (1920x400) for combat zones.
 * Smooth painting style with gradients, atmospheric depth, layered composition.
 * Output: public/assets/battle-backgrounds/
 */
import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

const W = 1920;
const H = 400;

// ── Utilities ──────────────────────────────────────────
function rand(min, max) { return Math.random() * (max - min) + min; }
function randInt(min, max) { return Math.floor(rand(min, max)); }
function rgba(r, g, b, a) { return `rgba(${r},${g},${b},${a})`; }
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}
function hexA(hex, a) {
  const { r, g, b } = hexToRgb(hex);
  return rgba(r, g, b, a);
}

function lerpColor(hex1, hex2, t) {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  const r = Math.round(c1.r + (c2.r - c1.r) * t);
  const g = Math.round(c1.g + (c2.g - c1.g) * t);
  const b = Math.round(c1.b + (c2.b - c1.b) * t);
  return `rgb(${r},${g},${b})`;
}

// ── Shared drawing helpers ─────────────────────────────

function applyVignette(ctx) {
  // Corner vignette using radial gradient
  const cx = W / 2, cy = H / 2;
  const maxR = Math.sqrt(cx * cx + cy * cy);
  const grad = ctx.createRadialGradient(cx, cy, maxR * 0.35, cx, cy, maxR);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(0.6, 'rgba(0,0,0,0.15)');
  grad.addColorStop(0.85, 'rgba(0,0,0,0.45)');
  grad.addColorStop(1, 'rgba(0,0,0,0.75)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
}

function drawParticles(ctx, count, color, minSize, maxSize, yMin, yMax, alphaMin, alphaMax) {
  for (let i = 0; i < count; i++) {
    const x = rand(0, W);
    const y = rand(yMin || 0, yMax || H);
    const r = rand(minSize, maxSize);
    const a = rand(alphaMin || 0.1, alphaMax || 0.5);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = hexA(color, a);
    ctx.fill();
  }
}

function drawMountainRange(ctx, baseY, peakHeight, color, segments) {
  ctx.beginPath();
  ctx.moveTo(0, H);
  ctx.lineTo(0, baseY);
  const segW = W / segments;
  for (let i = 0; i <= segments; i++) {
    const x = i * segW;
    const peakY = baseY - rand(peakHeight * 0.3, peakHeight);
    if (i === 0) {
      ctx.lineTo(x, peakY);
    } else {
      const cpX = x - segW / 2;
      const cpY = baseY - rand(peakHeight * 0.5, peakHeight * 0.9);
      ctx.quadraticCurveTo(cpX, cpY, x, peakY);
    }
  }
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawSmoothHills(ctx, baseY, amplitude, color, waves) {
  ctx.beginPath();
  ctx.moveTo(0, H);
  for (let x = 0; x <= W; x += 2) {
    let y = baseY;
    for (let w = 0; w < waves.length; w++) {
      y += Math.sin((x / W) * Math.PI * waves[w].freq + waves[w].phase) * waves[w].amp;
    }
    ctx.lineTo(x, y);
  }
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawTreeSilhouette(ctx, x, baseY, trunkW, trunkH, canopyR, color) {
  // Trunk
  ctx.fillStyle = color;
  ctx.fillRect(x - trunkW / 2, baseY - trunkH, trunkW, trunkH);
  // Dead branches
  for (let i = 0; i < 4; i++) {
    const branchY = baseY - trunkH * rand(0.3, 0.9);
    const dir = i % 2 === 0 ? 1 : -1;
    const branchLen = rand(trunkW * 2, trunkW * 5);
    ctx.beginPath();
    ctx.moveTo(x, branchY);
    ctx.lineTo(x + dir * branchLen, branchY - rand(5, 20));
    ctx.lineWidth = rand(1, 3);
    ctx.strokeStyle = color;
    ctx.stroke();
    // Sub-branches
    if (Math.random() > 0.4) {
      const subX = x + dir * branchLen * 0.6;
      ctx.beginPath();
      ctx.moveTo(subX, branchY - rand(0, 10));
      ctx.lineTo(subX + dir * rand(5, 15), branchY - rand(10, 25));
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}

function drawFogLayer(ctx, y, height, color, alpha) {
  const grad = ctx.createLinearGradient(0, y, 0, y + height);
  grad.addColorStop(0, hexA(color, 0));
  grad.addColorStop(0.3, hexA(color, alpha));
  grad.addColorStop(0.5, hexA(color, alpha * 1.2));
  grad.addColorStop(0.7, hexA(color, alpha));
  grad.addColorStop(1, hexA(color, 0));
  ctx.fillStyle = grad;
  ctx.fillRect(0, y, W, height);
}

function drawBuildingSilhouette(ctx, x, baseY, w, h, color, hasWindows) {
  ctx.fillStyle = color;
  ctx.fillRect(x, baseY - h, w, h + 5);
  // Damaged top
  const chunks = randInt(3, 6);
  const chunkW = w / chunks;
  for (let i = 0; i < chunks; i++) {
    if (Math.random() > 0.5) {
      const cH = rand(5, h * 0.25);
      ctx.fillRect(x + i * chunkW, baseY - h - cH, chunkW, cH);
    }
  }
  // Windows
  if (hasWindows) {
    const rows = Math.floor(h / 20);
    const cols = Math.floor(w / 18);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (Math.random() > 0.6) {
          const wx = x + 6 + c * 18;
          const wy = baseY - h + 8 + r * 20;
          const ww = 8, wh = 10;
          ctx.fillStyle = Math.random() > 0.7
            ? hexA('#FFD700', rand(0.05, 0.2))
            : hexA('#000000', rand(0.3, 0.6));
          ctx.fillRect(wx, wy, ww, wh);
        }
      }
    }
  }
}

// ====================================================================
// 1. OUTSKIRTS — Murky swamp/marshland
// ====================================================================
function generateOutskirts() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Sky: overcast grey-green
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.5);
  sky.addColorStop(0, '#1a1f1a');
  sky.addColorStop(0.3, '#2a332a');
  sky.addColorStop(0.6, '#3a4535');
  sky.addColorStop(1, '#4a5540');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H * 0.5);

  // Overcast clouds
  for (let i = 0; i < 8; i++) {
    const cx = rand(0, W);
    const cy = rand(10, H * 0.35);
    const rw = rand(150, 400);
    const rh = rand(20, 50);
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rw);
    grad.addColorStop(0, hexA('#556B4A', 0.15));
    grad.addColorStop(0.5, hexA('#4A5F40', 0.08));
    grad.addColorStop(1, hexA('#3A4A30', 0));
    ctx.fillStyle = grad;
    ctx.fillRect(cx - rw, cy - rh, rw * 2, rh * 2);
  }

  // Distant treeline
  drawSmoothHills(ctx, H * 0.45, 15, hexA('#1a2118', 0.9), [
    { freq: 12, amp: 8, phase: 0 },
    { freq: 25, amp: 4, phase: 1.5 },
    { freq: 40, amp: 2, phase: 3.0 }
  ]);

  // Stagnant water / swamp ground
  const ground = ctx.createLinearGradient(0, H * 0.5, 0, H);
  ground.addColorStop(0, '#2A3328');
  ground.addColorStop(0.2, '#1E2A1C');
  ground.addColorStop(0.5, '#1A251A');
  ground.addColorStop(0.7, '#1C2818');
  ground.addColorStop(1, '#0F1A0D');
  ctx.fillStyle = ground;
  ctx.fillRect(0, H * 0.45, W, H * 0.55);

  // Water reflections
  for (let i = 0; i < 30; i++) {
    const x = rand(0, W);
    const y = rand(H * 0.6, H * 0.9);
    const w = rand(40, 200);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y + rand(-2, 2));
    ctx.lineWidth = rand(0.5, 2);
    ctx.strokeStyle = hexA('#5A7A5A', rand(0.05, 0.15));
    ctx.stroke();
  }

  // Midground: dead trees
  const treePositions = [120, 350, 580, 900, 1100, 1350, 1550, 1750];
  for (const tx of treePositions) {
    const baseY = H * rand(0.55, 0.7);
    const trunkH = rand(60, 130);
    const offset = rand(-30, 30);
    drawTreeSilhouette(ctx, tx + offset, baseY, rand(3, 7), trunkH, 0, hexA('#0D140D', rand(0.7, 0.95)));
  }

  // Foreground: twisted roots / vegetation
  drawSmoothHills(ctx, H * 0.85, 20, '#0F1A0D', [
    { freq: 8, amp: 10, phase: 2 },
    { freq: 15, amp: 5, phase: 0.5 }
  ]);

  // Scattered bones
  for (let i = 0; i < 12; i++) {
    const bx = rand(50, W - 50);
    const by = rand(H * 0.75, H * 0.95);
    const bLen = rand(8, 20);
    const angle = rand(0, Math.PI);
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + Math.cos(angle) * bLen, by + Math.sin(angle) * bLen * 0.3);
    ctx.lineWidth = rand(1.5, 3);
    ctx.strokeStyle = hexA('#C8BFA0', rand(0.15, 0.35));
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // Fog layers
  drawFogLayer(ctx, H * 0.35, H * 0.2, '#5A6B50', 0.2);
  drawFogLayer(ctx, H * 0.55, H * 0.15, '#4A5A40', 0.25);
  drawFogLayer(ctx, H * 0.7, H * 0.15, '#3A4A30', 0.15);

  // Particles: spores/mist
  drawParticles(ctx, 60, '#8BA878', 0.5, 2, H * 0.3, H * 0.8, 0.1, 0.3);
  drawParticles(ctx, 30, '#A0B890', 1, 3, H * 0.4, H * 0.7, 0.05, 0.15);

  applyVignette(ctx);
  return canvas;
}

// ====================================================================
// 2. SUBURBS — Ruined suburban neighborhood
// ====================================================================
function generateSuburbs() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Sky: dusk purple-orange
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.55);
  sky.addColorStop(0, '#1A0F2E');
  sky.addColorStop(0.2, '#2D1B3D');
  sky.addColorStop(0.45, '#4A2545');
  sky.addColorStop(0.65, '#6B3040');
  sky.addColorStop(0.8, '#8B4030');
  sky.addColorStop(1, '#A85525');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H * 0.55);

  // Sunset glow
  const glow = ctx.createRadialGradient(W * 0.7, H * 0.45, 0, W * 0.7, H * 0.45, 400);
  glow.addColorStop(0, hexA('#FF8844', 0.2));
  glow.addColorStop(0.4, hexA('#CC5533', 0.1));
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H * 0.6);

  // Ground
  const ground = ctx.createLinearGradient(0, H * 0.5, 0, H);
  ground.addColorStop(0, '#2A1F2E');
  ground.addColorStop(0.3, '#221A26');
  ground.addColorStop(0.6, '#1A1420');
  ground.addColorStop(1, '#0E0A14');
  ctx.fillStyle = ground;
  ctx.fillRect(0, H * 0.5, W, H * 0.5);

  // Distant buildings silhouette
  const distColor = hexA('#1A1025', 0.95);
  for (let x = 0; x < W; x += rand(80, 160)) {
    const bw = rand(50, 120);
    const bh = rand(30, 80);
    const by = H * 0.45;
    drawBuildingSilhouette(ctx, x, by, bw, bh, distColor, false);
  }

  // Midground: ruined houses
  const housePositions = [100, 300, 520, 700, 950, 1150, 1400, 1600, 1800];
  for (const hx of housePositions) {
    const baseY = H * 0.6 + rand(-10, 10);
    const hw = rand(80, 140);
    const hh = rand(50, 90);
    const houseColor = hexA('#16101E', rand(0.8, 0.95));

    // House body
    ctx.fillStyle = houseColor;
    ctx.fillRect(hx, baseY - hh, hw, hh + 5);

    // Roof (triangle, partially collapsed)
    ctx.beginPath();
    ctx.moveTo(hx - 5, baseY - hh);
    ctx.lineTo(hx + hw * rand(0.3, 0.6), baseY - hh - rand(20, 40));
    ctx.lineTo(hx + hw + 5, baseY - hh + rand(0, 10));
    ctx.closePath();
    ctx.fillStyle = houseColor;
    ctx.fill();

    // Windows with faint light
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 3; c++) {
        if (Math.random() > 0.4) {
          const wx = hx + 10 + c * (hw / 3.5);
          const wy = baseY - hh + 12 + r * 25;
          ctx.fillStyle = Math.random() > 0.75
            ? hexA('#FFaa44', rand(0.08, 0.2))
            : hexA('#000000', 0.5);
          ctx.fillRect(wx, wy, 12, 14);
          // Window glow
          if (Math.random() > 0.8) {
            const wGlow = ctx.createRadialGradient(wx + 6, wy + 7, 0, wx + 6, wy + 7, 25);
            wGlow.addColorStop(0, hexA('#FFaa44', 0.1));
            wGlow.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = wGlow;
            ctx.fillRect(wx - 15, wy - 15, 42, 44);
          }
        }
      }
    }
  }

  // Broken fences
  for (let i = 0; i < 20; i++) {
    const fx = rand(50, W - 50);
    const fy = H * 0.65 + rand(-5, 15);
    const fh = rand(15, 30);
    const angle = rand(-0.3, 0.3);
    ctx.save();
    ctx.translate(fx, fy);
    ctx.rotate(angle);
    ctx.fillStyle = hexA('#1A1220', rand(0.5, 0.8));
    ctx.fillRect(-1.5, -fh, 3, fh);
    ctx.restore();
  }

  // Overgrown vegetation
  for (let i = 0; i < 40; i++) {
    const vx = rand(0, W);
    const vy = rand(H * 0.6, H * 0.95);
    ctx.beginPath();
    ctx.moveTo(vx, vy);
    ctx.quadraticCurveTo(vx + rand(-10, 10), vy - rand(10, 30), vx + rand(-5, 5), vy - rand(15, 40));
    ctx.lineWidth = rand(0.5, 2);
    ctx.strokeStyle = hexA('#2A4020', rand(0.3, 0.6));
    ctx.stroke();
  }

  // Foreground ground layer
  drawSmoothHills(ctx, H * 0.88, 8, '#0E0A14', [
    { freq: 6, amp: 6, phase: 1 },
    { freq: 14, amp: 3, phase: 3 }
  ]);

  // Dust particles
  drawParticles(ctx, 40, '#C8A080', 0.5, 2, H * 0.3, H * 0.8, 0.1, 0.25);
  drawParticles(ctx, 20, '#FFaa44', 0.3, 1, H * 0.2, H * 0.5, 0.05, 0.15);

  // Fog
  drawFogLayer(ctx, H * 0.4, H * 0.15, '#4A2545', 0.15);

  applyVignette(ctx);
  return canvas;
}

// ====================================================================
// 3. INDUSTRIAL — Toxic factory district
// ====================================================================
function generateIndustrial() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Sky: sickly yellow-green haze
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.5);
  sky.addColorStop(0, '#1A1A0A');
  sky.addColorStop(0.25, '#2A2A10');
  sky.addColorStop(0.5, '#3A3A15');
  sky.addColorStop(0.75, '#4A4820');
  sky.addColorStop(1, '#5A5528');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H * 0.5);

  // Toxic haze glow
  for (let i = 0; i < 5; i++) {
    const cx = rand(200, W - 200);
    const cy = rand(H * 0.1, H * 0.4);
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, rand(100, 250));
    glow.addColorStop(0, hexA('#88AA33', 0.12));
    glow.addColorStop(0.5, hexA('#669922', 0.06));
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(cx - 300, cy - 200, 600, 400);
  }

  // Ground
  const ground = ctx.createLinearGradient(0, H * 0.5, 0, H);
  ground.addColorStop(0, '#2A2518');
  ground.addColorStop(0.3, '#222015');
  ground.addColorStop(0.6, '#1A1A10');
  ground.addColorStop(1, '#0E0E08');
  ctx.fillStyle = ground;
  ctx.fillRect(0, H * 0.48, W, H * 0.52);

  // Factory buildings in background
  const factoryColor = '#141210';
  for (let x = 0; x < W; x += rand(120, 220)) {
    const bw = rand(80, 160);
    const bh = rand(60, 120);
    const by = H * 0.52;
    ctx.fillStyle = hexA(factoryColor, 0.9);
    ctx.fillRect(x, by - bh, bw, bh + 5);

    // Smokestacks
    if (Math.random() > 0.4) {
      const sw = rand(8, 16);
      const sh = rand(40, 80);
      const sx = x + rand(10, bw - 20);
      ctx.fillStyle = hexA('#1A1815', 0.95);
      ctx.fillRect(sx, by - bh - sh, sw, sh + 5);

      // Toxic smoke plumes
      for (let p = 0; p < 8; p++) {
        const px = sx + sw / 2 + rand(-30, 30) * (p / 8);
        const py = by - bh - sh - rand(10, 60) - p * 8;
        const pr = rand(8, 25 + p * 3);
        const smokeGrad = ctx.createRadialGradient(px, py, 0, px, py, pr);
        smokeGrad.addColorStop(0, hexA('#66AA22', 0.12 - p * 0.01));
        smokeGrad.addColorStop(0.6, hexA('#558818', 0.06));
        smokeGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = smokeGrad;
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Pipes and machinery silhouettes
  for (let i = 0; i < 15; i++) {
    const px = rand(0, W);
    const py = H * 0.5 + rand(-20, 40);
    const pw = rand(50, 200);
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + pw, py + rand(-10, 10));
    ctx.lineWidth = rand(2, 6);
    ctx.strokeStyle = hexA('#1A1815', rand(0.5, 0.8));
    ctx.stroke();
    // Joints
    if (Math.random() > 0.5) {
      ctx.beginPath();
      ctx.arc(px + pw * 0.5, py + rand(-5, 5), rand(3, 8), 0, Math.PI * 2);
      ctx.fillStyle = hexA('#1A1815', 0.7);
      ctx.fill();
    }
  }

  // Chemical vats
  for (let i = 0; i < 6; i++) {
    const vx = rand(100, W - 100);
    const vy = H * 0.6 + rand(-10, 20);
    const vw = rand(30, 50);
    const vh = rand(25, 40);
    ctx.fillStyle = hexA('#1A1815', 0.8);
    // Cylindrical shape
    ctx.beginPath();
    ctx.ellipse(vx, vy - vh, vw, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(vx - vw, vy - vh, vw * 2, vh);
    ctx.beginPath();
    ctx.ellipse(vx, vy, vw, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Glowing green puddles
  for (let i = 0; i < 10; i++) {
    const px = rand(50, W - 50);
    const py = rand(H * 0.7, H * 0.92);
    const pw = rand(20, 60);
    const ph = rand(4, 10);
    const puddleGlow = ctx.createRadialGradient(px, py, 0, px, py, pw);
    puddleGlow.addColorStop(0, hexA('#44CC22', 0.2));
    puddleGlow.addColorStop(0.4, hexA('#33AA18', 0.12));
    puddleGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = puddleGlow;
    ctx.beginPath();
    ctx.ellipse(px, py, pw, ph, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Foreground
  drawSmoothHills(ctx, H * 0.88, 8, '#0E0E08', [
    { freq: 10, amp: 5, phase: 0 },
    { freq: 20, amp: 3, phase: 2 }
  ]);

  // Fog
  drawFogLayer(ctx, H * 0.3, H * 0.2, '#5A5528', 0.18);
  drawFogLayer(ctx, H * 0.55, H * 0.12, '#4A4820', 0.12);

  // Particles: ash, toxic spores
  drawParticles(ctx, 50, '#88AA33', 0.5, 1.5, H * 0.1, H * 0.6, 0.08, 0.2);
  drawParticles(ctx, 30, '#AABB77', 0.3, 1, H * 0.4, H * 0.85, 0.05, 0.15);

  applyVignette(ctx);
  return canvas;
}

// ====================================================================
// 4. DEADLANDS — Irradiated desert
// ====================================================================
function generateDeadlands() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Sky: blood orange sunset
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.5);
  sky.addColorStop(0, '#1A0A05');
  sky.addColorStop(0.15, '#2D1208');
  sky.addColorStop(0.35, '#5A2010');
  sky.addColorStop(0.55, '#8B3510');
  sky.addColorStop(0.75, '#B85018');
  sky.addColorStop(0.9, '#CC6620');
  sky.addColorStop(1, '#DD7828');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H * 0.5);

  // Sun glow
  const sunGlow = ctx.createRadialGradient(W * 0.35, H * 0.35, 10, W * 0.35, H * 0.35, 200);
  sunGlow.addColorStop(0, hexA('#FFAA44', 0.3));
  sunGlow.addColorStop(0.3, hexA('#FF7722', 0.15));
  sunGlow.addColorStop(0.7, hexA('#CC4400', 0.05));
  sunGlow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sunGlow;
  ctx.fillRect(0, 0, W, H * 0.6);

  // Distant mesa formations
  const mesaColor = '#3A2010';
  const mesaPositions = [
    { x: 200, w: 250, h: 60 },
    { x: 600, w: 180, h: 45 },
    { x: 1100, w: 300, h: 70 },
    { x: 1500, w: 200, h: 50 }
  ];
  for (const m of mesaPositions) {
    const my = H * 0.42;
    ctx.fillStyle = hexA(mesaColor, 0.85);
    // Flat-topped mesa shape
    ctx.beginPath();
    ctx.moveTo(m.x, my);
    ctx.lineTo(m.x + 15, my - m.h);
    ctx.lineTo(m.x + m.w - 15, my - m.h);
    ctx.lineTo(m.x + m.w, my);
    ctx.closePath();
    ctx.fill();
    // Mesa detail layers
    ctx.fillStyle = hexA('#4A2A15', 0.3);
    ctx.fillRect(m.x + 15, my - m.h + m.h * 0.3, m.w - 30, 3);
    ctx.fillRect(m.x + 15, my - m.h + m.h * 0.6, m.w - 30, 2);
  }

  // Desert ground with sand dunes
  const ground = ctx.createLinearGradient(0, H * 0.45, 0, H);
  ground.addColorStop(0, '#8B5520');
  ground.addColorStop(0.15, '#7A4A1A');
  ground.addColorStop(0.3, '#6A4018');
  ground.addColorStop(0.5, '#5A3515');
  ground.addColorStop(0.7, '#4A2A10');
  ground.addColorStop(1, '#2A1A08');
  ctx.fillStyle = ground;
  ctx.fillRect(0, H * 0.45, W, H * 0.55);

  // Sand dune waves
  drawSmoothHills(ctx, H * 0.52, 15, hexA('#7A4A1A', 0.6), [
    { freq: 4, amp: 12, phase: 0 },
    { freq: 8, amp: 6, phase: 2 }
  ]);

  // Cracked earth pattern
  for (let i = 0; i < 50; i++) {
    const cx = rand(0, W);
    const cy = rand(H * 0.55, H * 0.95);
    const len = rand(15, 50);
    const angle = rand(0, Math.PI * 2);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    const ex = cx + Math.cos(angle) * len;
    const ey = cy + Math.sin(angle) * len * 0.3;
    ctx.lineTo(ex, ey);
    // Branch cracks
    if (Math.random() > 0.5) {
      const brAngle = angle + rand(-0.8, 0.8);
      ctx.moveTo(cx + Math.cos(angle) * len * 0.5, cy + Math.sin(angle) * len * 0.15);
      ctx.lineTo(
        cx + Math.cos(angle) * len * 0.5 + Math.cos(brAngle) * len * 0.4,
        cy + Math.sin(angle) * len * 0.15 + Math.sin(brAngle) * len * 0.12
      );
    }
    ctx.lineWidth = rand(0.5, 2);
    ctx.strokeStyle = hexA('#2A1A08', rand(0.3, 0.6));
    ctx.stroke();
  }

  // Raider camp: tents and flags
  const campX = W * 0.6;
  const campY = H * 0.62;
  // Tents
  for (let i = 0; i < 3; i++) {
    const tx = campX + i * rand(60, 100);
    const ty = campY + rand(-5, 5);
    const tw = rand(30, 50);
    const th = rand(20, 35);
    ctx.fillStyle = hexA('#3A2515', 0.8);
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx + tw / 2, ty - th);
    ctx.lineTo(tx + tw, ty);
    ctx.closePath();
    ctx.fill();
  }
  // Flags
  for (let i = 0; i < 2; i++) {
    const fx = campX + rand(0, 200);
    const fy = campY - 5;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx, fy - rand(30, 50));
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = hexA('#2A1A08', 0.8);
    ctx.stroke();
    // Flag cloth
    ctx.beginPath();
    ctx.moveTo(fx, fy - rand(35, 50));
    ctx.lineTo(fx + rand(10, 20), fy - rand(30, 45));
    ctx.lineTo(fx, fy - rand(25, 35));
    ctx.fillStyle = hexA('#8B2020', 0.6);
    ctx.fill();
  }

  // Heat shimmer effect
  for (let x = 0; x < W; x += 3) {
    const shimY = H * 0.47 + Math.sin(x * 0.02) * 2;
    ctx.beginPath();
    ctx.moveTo(x, shimY);
    ctx.lineTo(x + 3, shimY + Math.sin(x * 0.05) * 1.5);
    ctx.lineWidth = 1;
    ctx.strokeStyle = hexA('#FFCC88', 0.06);
    ctx.stroke();
  }

  // Foreground
  drawSmoothHills(ctx, H * 0.9, 6, '#2A1A08', [
    { freq: 5, amp: 5, phase: 0 },
    { freq: 12, amp: 3, phase: 1.5 }
  ]);

  // Dust particles
  drawParticles(ctx, 60, '#DDAA66', 0.5, 2, H * 0.2, H * 0.8, 0.08, 0.25);
  drawParticles(ctx, 25, '#FFCC88', 0.3, 1.2, H * 0.35, H * 0.55, 0.05, 0.12);

  // Haze
  drawFogLayer(ctx, H * 0.38, H * 0.15, '#CC6620', 0.1);

  applyVignette(ctx);
  return canvas;
}

// ====================================================================
// 5. MILITARY — Military installation
// ====================================================================
function generateMilitary() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Sky: cold grey with searchlight beams
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.5);
  sky.addColorStop(0, '#0A0E14');
  sky.addColorStop(0.3, '#141C28');
  sky.addColorStop(0.5, '#1E2838');
  sky.addColorStop(0.75, '#283545');
  sky.addColorStop(1, '#354555');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H * 0.5);

  // Searchlight beams
  const searchlights = [
    { x: W * 0.2, angle: -0.3 },
    { x: W * 0.6, angle: 0.15 },
    { x: W * 0.85, angle: -0.1 }
  ];
  for (const sl of searchlights) {
    ctx.save();
    ctx.translate(sl.x, H * 0.5);
    ctx.rotate(sl.angle);
    const beam = ctx.createLinearGradient(0, 0, 0, -H * 0.5);
    beam.addColorStop(0, hexA('#AABBCC', 0.12));
    beam.addColorStop(0.3, hexA('#8899AA', 0.06));
    beam.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(-80, -H * 0.5);
    ctx.lineTo(80, -H * 0.5);
    ctx.lineTo(5, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Ground
  const ground = ctx.createLinearGradient(0, H * 0.48, 0, H);
  ground.addColorStop(0, '#283540');
  ground.addColorStop(0.3, '#1E2830');
  ground.addColorStop(0.6, '#151E28');
  ground.addColorStop(1, '#0A1018');
  ctx.fillStyle = ground;
  ctx.fillRect(0, H * 0.48, W, H * 0.52);

  // Concrete bunkers
  const bunkerPositions = [200, 600, 1000, 1400, 1700];
  for (const bx of bunkerPositions) {
    const by = H * 0.55 + rand(-5, 10);
    const bw = rand(100, 180);
    const bh = rand(35, 55);
    ctx.fillStyle = hexA('#2A3040', 0.9);
    ctx.fillRect(bx, by - bh, bw, bh);
    // Flat roof edge
    ctx.fillStyle = hexA('#354050', 0.8);
    ctx.fillRect(bx - 3, by - bh, bw + 6, 5);
    // Dark slit windows
    for (let w = 0; w < 3; w++) {
      ctx.fillStyle = hexA('#0A0E14', 0.9);
      ctx.fillRect(bx + 15 + w * (bw / 3.5), by - bh + 15, bw * 0.15, 5);
    }
  }

  // Guard towers
  const towerPositions = [400, 900, 1550];
  for (const tx of towerPositions) {
    const ty = H * 0.55;
    const tw = 20;
    const th = rand(80, 120);
    // Tower legs
    ctx.fillStyle = hexA('#1E2830', 0.9);
    ctx.fillRect(tx - tw / 2, ty - th, 4, th);
    ctx.fillRect(tx + tw / 2 - 4, ty - th, 4, th);
    // Cross braces
    ctx.beginPath();
    ctx.moveTo(tx - tw / 2, ty - th * 0.3);
    ctx.lineTo(tx + tw / 2, ty - th * 0.6);
    ctx.moveTo(tx - tw / 2, ty - th * 0.6);
    ctx.lineTo(tx + tw / 2, ty - th * 0.3);
    ctx.lineWidth = 2;
    ctx.strokeStyle = hexA('#1E2830', 0.8);
    ctx.stroke();
    // Platform
    ctx.fillStyle = hexA('#283540', 0.9);
    ctx.fillRect(tx - tw, ty - th - 5, tw * 2, 25);
  }

  // Barbed wire fences
  for (let fx = 0; fx < W; fx += rand(3, 8)) {
    const fy = H * 0.62 + Math.sin(fx * 0.1) * 2;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx + 4, fy - 2);
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = hexA('#556677', rand(0.3, 0.5));
    ctx.stroke();
  }
  // Fence posts
  for (let fx = 50; fx < W; fx += rand(80, 140)) {
    ctx.fillStyle = hexA('#2A3040', 0.7);
    ctx.fillRect(fx, H * 0.58, 3, 20);
  }

  // Radar dishes
  for (let i = 0; i < 2; i++) {
    const dx = rand(200, W - 200);
    const dy = H * 0.48;
    const ds = rand(15, 25);
    // Dish
    ctx.beginPath();
    ctx.arc(dx, dy, ds, Math.PI * 0.8, Math.PI * 0.2);
    ctx.lineWidth = 3;
    ctx.strokeStyle = hexA('#4A5A6A', 0.7);
    ctx.stroke();
    // Stand
    ctx.beginPath();
    ctx.moveTo(dx, dy);
    ctx.lineTo(dx, dy + 15);
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Armored vehicles
  for (let i = 0; i < 3; i++) {
    const vx = rand(100, W - 100);
    const vy = H * 0.7 + rand(-5, 10);
    const vw = rand(35, 55);
    const vh = rand(12, 20);
    ctx.fillStyle = hexA('#1E2830', 0.8);
    // Body
    ctx.fillRect(vx, vy - vh, vw, vh);
    // Turret
    ctx.fillRect(vx + vw * 0.3, vy - vh - 8, vw * 0.3, 8);
    // Barrel
    ctx.fillRect(vx + vw * 0.6, vy - vh - 6, vw * 0.3, 3);
    // Wheels
    ctx.fillStyle = hexA('#141C28', 0.8);
    for (let w = 0; w < 3; w++) {
      ctx.beginPath();
      ctx.arc(vx + 8 + w * (vw / 3), vy, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Foreground
  drawSmoothHills(ctx, H * 0.88, 6, '#0A1018', [
    { freq: 8, amp: 4, phase: 0 },
    { freq: 16, amp: 2, phase: 2 }
  ]);

  // Particles: light rain/ash
  drawParticles(ctx, 40, '#8899AA', 0.3, 1.2, 0, H, 0.08, 0.2);

  // Fog
  drawFogLayer(ctx, H * 0.42, H * 0.12, '#354555', 0.12);

  applyVignette(ctx);
  return canvas;
}

// ====================================================================
// 6. CORE — Reactor core area
// ====================================================================
function generateCore() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Sky: ominous red with green radiation clouds
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.5);
  sky.addColorStop(0, '#0A0505');
  sky.addColorStop(0.2, '#1A0808');
  sky.addColorStop(0.4, '#2D0A0A');
  sky.addColorStop(0.6, '#451010');
  sky.addColorStop(0.8, '#5A1515');
  sky.addColorStop(1, '#6B1A1A');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H * 0.5);

  // Green radiation clouds
  for (let i = 0; i < 8; i++) {
    const cx = rand(0, W);
    const cy = rand(10, H * 0.35);
    const cr = rand(60, 180);
    const cloud = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr);
    cloud.addColorStop(0, hexA('#33CC22', 0.1));
    cloud.addColorStop(0.4, hexA('#22AA15', 0.05));
    cloud.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = cloud;
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Ground
  const ground = ctx.createLinearGradient(0, H * 0.45, 0, H);
  ground.addColorStop(0, '#2A1010');
  ground.addColorStop(0.3, '#221010');
  ground.addColorStop(0.5, '#1A0C0C');
  ground.addColorStop(0.7, '#140A0A');
  ground.addColorStop(1, '#0A0505');
  ctx.fillStyle = ground;
  ctx.fillRect(0, H * 0.45, W, H * 0.55);

  // Reactor containment structure (center)
  const rcx = W * 0.5;
  const rcy = H * 0.5;
  const rcw = 250;
  const rch = 160;
  // Main structure
  ctx.fillStyle = hexA('#1A1218', 0.95);
  ctx.fillRect(rcx - rcw / 2, rcy - rch, rcw, rch + 10);
  // Dome top
  ctx.beginPath();
  ctx.arc(rcx, rcy - rch, rcw / 2.5, Math.PI, 0);
  ctx.fillStyle = hexA('#1A1218', 0.95);
  ctx.fill();
  // Cracks in containment
  const crackPaths = [
    [{ x: -40, y: -80 }, { x: -20, y: -50 }, { x: -35, y: -20 }, { x: -15, y: 10 }],
    [{ x: 30, y: -100 }, { x: 50, y: -70 }, { x: 35, y: -40 }, { x: 55, y: -10 }],
    [{ x: -60, y: -40 }, { x: -30, y: -30 }, { x: -50, y: -10 }]
  ];
  for (const cpath of crackPaths) {
    ctx.beginPath();
    ctx.moveTo(rcx + cpath[0].x, rcy + cpath[0].y);
    for (let i = 1; i < cpath.length; i++) {
      ctx.lineTo(rcx + cpath[i].x, rcy + cpath[i].y);
    }
    ctx.lineWidth = rand(1.5, 3);
    ctx.strokeStyle = hexA('#44FF22', rand(0.4, 0.7));
    ctx.stroke();
    // Crack glow
    ctx.lineWidth = rand(6, 12);
    ctx.strokeStyle = hexA('#33CC18', 0.1);
    ctx.stroke();
  }

  // Reactor glow from inside
  const reactorGlow = ctx.createRadialGradient(rcx, rcy - rch * 0.3, 10, rcx, rcy - rch * 0.3, 200);
  reactorGlow.addColorStop(0, hexA('#44FF22', 0.15));
  reactorGlow.addColorStop(0.3, hexA('#33CC18', 0.08));
  reactorGlow.addColorStop(0.6, hexA('#FF2200', 0.05));
  reactorGlow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = reactorGlow;
  ctx.fillRect(rcx - 250, rcy - rch - 100, 500, 350);

  // Radiation warning signs
  for (let i = 0; i < 4; i++) {
    const sx = rand(100, W - 100);
    const sy = H * 0.6 + rand(-5, 15);
    // Post
    ctx.fillStyle = hexA('#2A1A1A', 0.8);
    ctx.fillRect(sx - 1.5, sy - 25, 3, 25);
    // Sign diamond
    ctx.fillStyle = hexA('#CC8800', 0.6);
    ctx.beginPath();
    ctx.moveTo(sx, sy - 30);
    ctx.lineTo(sx + 8, sy - 22);
    ctx.lineTo(sx, sy - 14);
    ctx.lineTo(sx - 8, sy - 22);
    ctx.closePath();
    ctx.fill();
  }

  // Glowing cracks in ground
  for (let i = 0; i < 25; i++) {
    const gx = rand(0, W);
    const gy = rand(H * 0.55, H * 0.95);
    const glen = rand(20, 80);
    const gAngle = rand(-0.3, 0.3);
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx + Math.cos(gAngle) * glen, gy + Math.sin(gAngle) * glen * 0.15);
    ctx.lineWidth = rand(1, 3);
    ctx.strokeStyle = hexA('#44FF22', rand(0.15, 0.4));
    ctx.stroke();
    // Glow around crack
    ctx.lineWidth = rand(6, 14);
    ctx.strokeStyle = hexA('#33CC18', 0.04);
    ctx.stroke();
  }

  // Floating debris
  for (let i = 0; i < 15; i++) {
    const dx = rand(rcx - 200, rcx + 200);
    const dy = rand(H * 0.2, H * 0.5);
    const ds = rand(3, 10);
    ctx.fillStyle = hexA('#2A1A1A', rand(0.5, 0.8));
    ctx.fillRect(dx, dy, ds, ds * rand(0.5, 1.5));
  }

  // Energy arcs
  for (let i = 0; i < 5; i++) {
    const ax = rcx + rand(-120, 120);
    const ay = rcy - rch * 0.5 + rand(-30, 30);
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    const segments = randInt(4, 8);
    for (let s = 0; s < segments; s++) {
      ctx.lineTo(ax + rand(-30, 30), ay + rand(-20, 20));
    }
    ctx.lineWidth = rand(0.5, 2);
    ctx.strokeStyle = hexA('#44FF88', rand(0.2, 0.5));
    ctx.stroke();
  }

  // Side structures
  for (let side = -1; side <= 1; side += 2) {
    const sx = rcx + side * rand(250, 400);
    const sy = H * 0.55;
    const sw = rand(80, 120);
    const sh = rand(50, 80);
    ctx.fillStyle = hexA('#1A1218', 0.85);
    ctx.fillRect(sx - sw / 2, sy - sh, sw, sh + 5);
  }

  // Foreground
  drawSmoothHills(ctx, H * 0.88, 8, '#0A0505', [
    { freq: 6, amp: 5, phase: 0.5 },
    { freq: 14, amp: 3, phase: 2 }
  ]);

  // Particles: radiation sparks
  drawParticles(ctx, 40, '#44FF22', 0.5, 2, H * 0.1, H * 0.7, 0.1, 0.35);
  drawParticles(ctx, 30, '#FF4422', 0.3, 1.5, H * 0.3, H * 0.6, 0.08, 0.2);

  // Fog
  drawFogLayer(ctx, H * 0.4, H * 0.12, '#5A1515', 0.12);

  applyVignette(ctx);
  return canvas;
}

// ====================================================================
// 7. GROUND ZERO — Reality-warped epicenter
// ====================================================================
function generateGroundZero() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Sky: deep void purple with cosmic elements
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.55);
  sky.addColorStop(0, '#050008');
  sky.addColorStop(0.2, '#0A0015');
  sky.addColorStop(0.4, '#140022');
  sky.addColorStop(0.6, '#1E0035');
  sky.addColorStop(0.8, '#280045');
  sky.addColorStop(1, '#320055');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H * 0.55);

  // Stars / void particles
  for (let i = 0; i < 120; i++) {
    const sx = rand(0, W);
    const sy = rand(0, H * 0.5);
    const sr = rand(0.3, 1.5);
    const colors = ['#FFFFFF', '#AABBFF', '#CC88FF', '#FF88CC', '#88FFCC'];
    const c = colors[randInt(0, colors.length)];
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fillStyle = hexA(c, rand(0.2, 0.7));
    ctx.fill();
    // Star glow
    if (sr > 1) {
      const sGlow = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 4);
      sGlow.addColorStop(0, hexA(c, 0.15));
      sGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = sGlow;
      ctx.beginPath();
      ctx.arc(sx, sy, sr * 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Cosmic nebula swirls
  for (let i = 0; i < 6; i++) {
    const nx = rand(0, W);
    const ny = rand(10, H * 0.4);
    const nr = rand(80, 200);
    const nebColors = ['#6600AA', '#AA0066', '#0066AA', '#00AA66'];
    const nc = nebColors[i % nebColors.length];
    const neb = ctx.createRadialGradient(nx, ny, 0, nx + rand(-30, 30), ny + rand(-20, 20), nr);
    neb.addColorStop(0, hexA(nc, 0.1));
    neb.addColorStop(0.5, hexA(nc, 0.04));
    neb.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = neb;
    ctx.beginPath();
    ctx.ellipse(nx, ny, nr * 1.5, nr * 0.7, rand(0, Math.PI), 0, Math.PI * 2);
    ctx.fill();
  }

  // Ground: warped landscape
  const ground = ctx.createLinearGradient(0, H * 0.45, 0, H);
  ground.addColorStop(0, '#1A0030');
  ground.addColorStop(0.2, '#150028');
  ground.addColorStop(0.4, '#100020');
  ground.addColorStop(0.6, '#0C0018');
  ground.addColorStop(1, '#050008');
  ctx.fillStyle = ground;
  ctx.fillRect(0, H * 0.45, W, H * 0.55);

  // Inverted / warped terrain line
  drawSmoothHills(ctx, H * 0.5, 20, hexA('#1A0030', 0.8), [
    { freq: 5, amp: 15, phase: 0 },
    { freq: 10, amp: 8, phase: 1 },
    { freq: 20, amp: 4, phase: 3 }
  ]);

  // Floating rock fragments
  for (let i = 0; i < 20; i++) {
    const fx = rand(100, W - 100);
    const fy = rand(H * 0.25, H * 0.7);
    const fs = rand(5, 25);
    ctx.save();
    ctx.translate(fx, fy);
    ctx.rotate(rand(0, Math.PI * 2));
    // Irregular rock shape
    ctx.beginPath();
    ctx.moveTo(0, -fs);
    ctx.lineTo(fs * 0.7, -fs * 0.3);
    ctx.lineTo(fs * 0.5, fs * 0.5);
    ctx.lineTo(-fs * 0.3, fs * 0.4);
    ctx.lineTo(-fs * 0.6, -fs * 0.2);
    ctx.closePath();
    ctx.fillStyle = hexA('#2A1845', rand(0.5, 0.85));
    ctx.fill();
    // Edge highlight
    ctx.strokeStyle = hexA('#8855CC', rand(0.1, 0.3));
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
    // Shadow underneath
    if (fs > 12) {
      const shadow = ctx.createRadialGradient(fx, fy + fs, 0, fx, fy + fs, fs * 1.5);
      shadow.addColorStop(0, hexA('#6600AA', 0.08));
      shadow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = shadow;
      ctx.beginPath();
      ctx.ellipse(fx, fy + fs, fs * 1.5, fs * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Reality tears (glitch-like vertical distortion lines)
  for (let i = 0; i < 12; i++) {
    const tx = rand(50, W - 50);
    const ty = rand(H * 0.15, H * 0.75);
    const tLen = rand(30, 100);
    const tWidth = rand(1, 4);
    // Main tear line
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    const segments = randInt(5, 10);
    for (let s = 1; s <= segments; s++) {
      ctx.lineTo(tx + rand(-8, 8), ty + (tLen / segments) * s);
    }
    ctx.lineWidth = tWidth;
    const tearColors = ['#FF44FF', '#44FFFF', '#FFFF44', '#FF4488'];
    ctx.strokeStyle = hexA(tearColors[i % tearColors.length], rand(0.3, 0.6));
    ctx.stroke();
    // Tear glow
    ctx.lineWidth = tWidth + 6;
    ctx.strokeStyle = hexA(tearColors[i % tearColors.length], 0.08);
    ctx.stroke();
  }

  // Dimensional rifts (larger portal-like openings)
  for (let i = 0; i < 3; i++) {
    const rx = rand(200, W - 200);
    const ry = rand(H * 0.3, H * 0.6);
    const rw = rand(30, 70);
    const rh = rand(50, 100);

    // Rift glow
    const riftGlow = ctx.createRadialGradient(rx, ry, 0, rx, ry, rw * 2);
    riftGlow.addColorStop(0, hexA('#8800FF', 0.15));
    riftGlow.addColorStop(0.5, hexA('#6600CC', 0.06));
    riftGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = riftGlow;
    ctx.beginPath();
    ctx.ellipse(rx, ry, rw * 2, rh, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rift outline
    ctx.beginPath();
    ctx.ellipse(rx, ry, rw, rh * 0.3, rand(-0.3, 0.3), 0, Math.PI * 2);
    ctx.strokeStyle = hexA('#CC44FF', 0.4);
    ctx.lineWidth = 2;
    ctx.stroke();
    // Inner void
    ctx.fillStyle = hexA('#050008', 0.6);
    ctx.beginPath();
    ctx.ellipse(rx, ry, rw * 0.7, rh * 0.2, rand(-0.3, 0.3), 0, Math.PI * 2);
    ctx.fill();
  }

  // Glitch effect strips (horizontal displacement)
  for (let i = 0; i < 8; i++) {
    const gy = rand(H * 0.1, H * 0.9);
    const gw = rand(50, 300);
    const gx = rand(0, W - gw);
    const gh = rand(1, 4);
    ctx.fillStyle = hexA('#CC44FF', rand(0.05, 0.15));
    ctx.fillRect(gx, gy, gw, gh);
    // Offset duplicate
    ctx.fillStyle = hexA('#44CCFF', rand(0.03, 0.08));
    ctx.fillRect(gx + rand(5, 20), gy + rand(2, 6), gw * 0.8, gh);
  }

  // Foreground
  drawSmoothHills(ctx, H * 0.9, 8, '#050008', [
    { freq: 7, amp: 6, phase: 1 },
    { freq: 15, amp: 3, phase: 0 }
  ]);

  // Void particles
  drawParticles(ctx, 50, '#CC88FF', 0.3, 1.5, 0, H, 0.1, 0.35);
  drawParticles(ctx, 30, '#88CCFF', 0.5, 2, H * 0.2, H * 0.7, 0.08, 0.25);
  drawParticles(ctx, 20, '#FFFFFF', 0.3, 0.8, 0, H * 0.5, 0.15, 0.5);

  // Energy fog
  drawFogLayer(ctx, H * 0.35, H * 0.15, '#320055', 0.15);

  applyVignette(ctx);
  return canvas;
}

// ====================================================================
// MAIN — Generate all backgrounds
// ====================================================================
const backgrounds = [
  { name: 'outskirts', generator: generateOutskirts },
  { name: 'suburbs', generator: generateSuburbs },
  { name: 'industrial', generator: generateIndustrial },
  { name: 'deadlands', generator: generateDeadlands },
  { name: 'military', generator: generateMilitary },
  { name: 'core', generator: generateCore },
  { name: 'ground_zero', generator: generateGroundZero },
];

const outDir = path.resolve('public/assets/battle-backgrounds');
fs.mkdirSync(outDir, { recursive: true });

let count = 0;
for (const bg of backgrounds) {
  const canvas = bg.generator();
  const buf = canvas.toBuffer('image/png');
  const filePath = path.join(outDir, `${bg.name}.png`);
  fs.writeFileSync(filePath, buf);
  const kb = (buf.length / 1024).toFixed(1);
  console.log(`  [${count + 1}/7] ${bg.name}.png (${kb} KB)`);
  count++;
}

console.log(`\nDone! Generated ${count} battle backgrounds in ${outDir}`);
