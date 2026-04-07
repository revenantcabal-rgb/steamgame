/**
 * Generate a 1920x1080 post-apocalyptic background image for Wasteland Grind.
 * Design philosophy: "Irradiated Decay" — layered atmospheric composition,
 * ruined cityscape silhouettes, cracked earth, toxic haze, radiation clouds.
 */
import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

const W = 1920;
const H = 1080;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

// ── Utility ──────────────────────────────────────────
function rand(min, max) { return Math.random() * (max - min) + min; }
function randInt(min, max) { return Math.floor(rand(min, max)); }
function hexAlpha(hex, a) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

// ── 1. Sky gradient (top → horizon) ─────────────────
function drawSky() {
  // Deep charcoal top → blood-red/orange at horizon
  const grad = ctx.createLinearGradient(0, 0, 0, H * 0.55);
  grad.addColorStop(0, '#07060E');
  grad.addColorStop(0.15, '#0C0A14');
  grad.addColorStop(0.35, '#1A0F1C');
  grad.addColorStop(0.55, '#2D1118');
  grad.addColorStop(0.72, '#4A1510');
  grad.addColorStop(0.85, '#6B1E0A');
  grad.addColorStop(0.93, '#8B3008');
  grad.addColorStop(1, '#A84010');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H * 0.55);
}

// ── 2. Sun / dying light source ─────────────────────
function drawSun() {
  const cx = W * 0.52;
  const cy = H * 0.42;

  // Outer glow - large diffuse
  for (let i = 6; i >= 0; i--) {
    const r = 90 + i * 35;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    const alpha = 0.04 + (6 - i) * 0.015;
    grad.addColorStop(0, hexAlpha('#FF6030', alpha * 2.5));
    grad.addColorStop(0.5, hexAlpha('#CC3010', alpha));
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }

  // Core sun disc
  const sunGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 45);
  sunGrad.addColorStop(0, '#FFD080');
  sunGrad.addColorStop(0.3, '#FF8040');
  sunGrad.addColorStop(0.7, '#CC4020');
  sunGrad.addColorStop(1, 'rgba(139,0,0,0)');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 55, 0, Math.PI * 2);
  ctx.fill();

  // Horizontal light streak across horizon
  const streakGrad = ctx.createLinearGradient(0, cy - 10, 0, cy + 60);
  streakGrad.addColorStop(0, 'rgba(255,100,30,0)');
  streakGrad.addColorStop(0.4, 'rgba(255,80,20,0.06)');
  streakGrad.addColorStop(0.6, 'rgba(200,50,10,0.04)');
  streakGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = streakGrad;
  ctx.fillRect(0, cy - 10, W, 70);
}

// ── 3. Radiation clouds ─────────────────────────────
function drawClouds() {
  // Wispy, layered clouds with toxic coloring
  const cloudLayers = [
    { y: H * 0.08, count: 12, scale: 1.5, alpha: 0.06, color: '#2A1525' },
    { y: H * 0.15, count: 15, scale: 1.2, alpha: 0.08, color: '#351520' },
    { y: H * 0.22, count: 18, scale: 1.0, alpha: 0.10, color: '#451518' },
    { y: H * 0.30, count: 14, scale: 0.8, alpha: 0.12, color: '#552015' },
    { y: H * 0.38, count: 10, scale: 0.6, alpha: 0.15, color: '#6B2510' },
  ];

  for (const layer of cloudLayers) {
    for (let i = 0; i < layer.count; i++) {
      const cx = rand(0, W);
      const cy = layer.y + rand(-30, 30);
      const rw = rand(80, 250) * layer.scale;
      const rh = rand(15, 40) * layer.scale;

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rw);
      grad.addColorStop(0, hexAlpha(layer.color, layer.alpha));
      grad.addColorStop(0.6, hexAlpha(layer.color, layer.alpha * 0.5));
      grad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = grad;
      ctx.save();
      ctx.scale(1, rh / rw);
      ctx.beginPath();
      ctx.arc(cx, cy * (rw / rh), rw, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Add a few brighter toxic-tinged wisps
  for (let i = 0; i < 6; i++) {
    const cx = rand(W * 0.2, W * 0.8);
    const cy = rand(H * 0.10, H * 0.35);
    const r = rand(40, 120);
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, 'rgba(100,40,20,0.08)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── 4. Ruined cityscape silhouette ──────────────────
function drawRuins() {
  const horizonY = H * 0.50;

  // Background ruins layer (distant, lighter)
  ctx.fillStyle = '#0E0A12';
  drawRuinLayer(horizonY + 10, 0.5, 0.7);

  // Midground ruins (darker)
  ctx.fillStyle = '#0A0710';
  drawRuinLayer(horizonY, 0.8, 1.0);

  // Foreground ruins (darkest, nearest)
  ctx.fillStyle = '#06050C';
  drawRuinLayer(horizonY - 5, 1.0, 1.3);
}

function drawRuinLayer(baseY, minScale, maxScale) {
  let x = -20;
  while (x < W + 50) {
    const bType = randInt(0, 8);
    const scale = rand(minScale, maxScale);

    if (bType === 0) {
      // Tall narrow tower (broken)
      const w = rand(25, 45) * scale;
      const h = rand(80, 200) * scale;
      const breakH = h * rand(0.5, 0.85);
      ctx.beginPath();
      ctx.moveTo(x, baseY);
      ctx.lineTo(x, baseY - breakH);
      // Jagged top
      ctx.lineTo(x + w * 0.2, baseY - breakH - rand(5, 15));
      ctx.lineTo(x + w * 0.4, baseY - h);
      ctx.lineTo(x + w * 0.6, baseY - h + rand(5, 20));
      ctx.lineTo(x + w * 0.8, baseY - breakH - rand(0, 10));
      ctx.lineTo(x + w, baseY - breakH + rand(0, 15));
      ctx.lineTo(x + w, baseY);
      ctx.closePath();
      ctx.fill();
      x += w + rand(5, 30);
    } else if (bType === 1) {
      // Wide low building
      const w = rand(60, 130) * scale;
      const h = rand(30, 70) * scale;
      ctx.beginPath();
      ctx.moveTo(x, baseY);
      ctx.lineTo(x, baseY - h);
      // Damaged roofline
      for (let rx = 0; rx < w; rx += rand(8, 20)) {
        ctx.lineTo(x + rx, baseY - h + rand(-8, 12));
      }
      ctx.lineTo(x + w, baseY - h + rand(-5, 10));
      ctx.lineTo(x + w, baseY);
      ctx.closePath();
      ctx.fill();
      x += w + rand(10, 40);
    } else if (bType === 2) {
      // Antenna / radio tower
      const h = rand(100, 250) * scale;
      const w = 4 * scale;
      ctx.fillRect(x, baseY - h, w, h);
      // Cross beams
      for (let y = 0; y < h; y += rand(20, 40)) {
        ctx.fillRect(x - 8 * scale, baseY - h + y, 20 * scale, 2);
      }
      x += 30 + rand(10, 40);
    } else if (bType === 3) {
      // Dome (cracked)
      const r = rand(25, 50) * scale;
      ctx.beginPath();
      ctx.arc(x + r, baseY, r, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      x += r * 2 + rand(10, 30);
    } else if (bType === 4) {
      // Tilted building
      const w = rand(30, 55) * scale;
      const h = rand(60, 140) * scale;
      const tilt = rand(3, 12) * (Math.random() > 0.5 ? 1 : -1);
      ctx.beginPath();
      ctx.moveTo(x, baseY);
      ctx.lineTo(x + tilt, baseY - h);
      ctx.lineTo(x + tilt + w, baseY - h + rand(-5, 5));
      ctx.lineTo(x + w, baseY);
      ctx.closePath();
      ctx.fill();
      x += w + rand(10, 35);
    } else if (bType === 5) {
      // Chimney/smokestack
      const w = rand(12, 22) * scale;
      const h = rand(100, 180) * scale;
      ctx.fillRect(x, baseY - h, w, h);
      // Wider top rim
      ctx.fillRect(x - 3, baseY - h, w + 6, 6);
      x += w + rand(15, 50);
    } else if (bType === 6) {
      // Crumbled wall segment
      const w = rand(40, 80) * scale;
      const h = rand(15, 40) * scale;
      ctx.beginPath();
      ctx.moveTo(x, baseY);
      ctx.lineTo(x, baseY - h);
      ctx.lineTo(x + w * 0.3, baseY - h - rand(3, 10));
      ctx.lineTo(x + w * 0.5, baseY - h + rand(0, 8));
      ctx.lineTo(x + w * 0.7, baseY - h - rand(2, 8));
      ctx.lineTo(x + w, baseY - h + rand(5, 15));
      ctx.lineTo(x + w, baseY);
      ctx.closePath();
      ctx.fill();
      x += w + rand(5, 25);
    } else {
      // Gap / empty space
      x += rand(20, 60);
    }
  }
}

// ── 5. Ground / cracked earth ───────────────────────
function drawGround() {
  const groundTop = H * 0.50;

  // Base ground gradient
  const groundGrad = ctx.createLinearGradient(0, groundTop, 0, H);
  groundGrad.addColorStop(0, '#1A1210');
  groundGrad.addColorStop(0.2, '#151010');
  groundGrad.addColorStop(0.5, '#100C0A');
  groundGrad.addColorStop(1, '#0A0808');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, groundTop, W, H - groundTop);

  // Warm horizon reflection on upper ground
  const groundGlow = ctx.createLinearGradient(0, groundTop, 0, groundTop + 80);
  groundGlow.addColorStop(0, 'rgba(80,35,15,0.12)');
  groundGlow.addColorStop(0.5, 'rgba(50,20,10,0.05)');
  groundGlow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = groundGlow;
  ctx.fillRect(0, groundTop, W, 80);

  // Terrain texture — subtle noise
  for (let i = 0; i < 5000; i++) {
    const x = rand(0, W);
    const y = rand(groundTop, H);
    const size = rand(1, 3);
    const alpha = rand(0.02, 0.06);
    ctx.fillStyle = `rgba(${randInt(20, 40)},${randInt(15, 30)},${randInt(10, 25)},${alpha})`;
    ctx.fillRect(x, y, size, size);
  }

  // Cracks in the ground
  ctx.strokeStyle = '#1E1510';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 35; i++) {
    let cx = rand(0, W);
    let cy = rand(groundTop + 30, H - 20);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    const segs = randInt(4, 12);
    for (let s = 0; s < segs; s++) {
      cx += rand(-40, 40);
      cy += rand(-10, 20);
      ctx.lineTo(cx, cy);
      // Branch cracks
      if (Math.random() > 0.6) {
        const bx = cx + rand(-25, 25);
        const by = cy + rand(-8, 15);
        ctx.moveTo(cx, cy);
        ctx.lineTo(bx, by);
        ctx.moveTo(cx, cy);
      }
    }
    ctx.stroke();
  }

  // Wider fissures
  ctx.strokeStyle = '#150E08';
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 12; i++) {
    let cx = rand(0, W);
    let cy = rand(groundTop + 60, H - 50);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    const segs = randInt(3, 7);
    for (let s = 0; s < segs; s++) {
      cx += rand(-60, 60);
      cy += rand(-5, 25);
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }

  // Subtle warm edge-light on ground cracks
  for (let i = 0; i < 12; i++) {
    const cx = rand(100, W - 100);
    const cy = rand(groundTop + 40, H - 40);
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rand(30, 80));
    grad.addColorStop(0, 'rgba(80,30,10,0.04)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(cx - 80, cy - 80, 160, 160);
  }
}

// ── 6. Toxic green ground haze ──────────────────────
function drawToxicHaze() {
  const hazeY = H * 0.48;

  // Wide atmospheric haze band at horizon
  const hazeBandGrad = ctx.createLinearGradient(0, hazeY - 20, 0, hazeY + 80);
  hazeBandGrad.addColorStop(0, 'rgba(0,0,0,0)');
  hazeBandGrad.addColorStop(0.3, 'rgba(50,120,30,0.04)');
  hazeBandGrad.addColorStop(0.5, 'rgba(60,140,35,0.07)');
  hazeBandGrad.addColorStop(0.7, 'rgba(50,120,30,0.04)');
  hazeBandGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = hazeBandGrad;
  ctx.fillRect(0, hazeY - 20, W, 100);

  // Clustered haze clouds
  for (let i = 0; i < 45; i++) {
    const cx = rand(-100, W + 100);
    const cy = hazeY + rand(-15, 50);
    const rw = rand(100, 400);
    const rh = rand(15, 45);
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rw);
    const alpha = rand(0.03, 0.09);
    grad.addColorStop(0, `rgba(70,150,35,${alpha})`);
    grad.addColorStop(0.4, `rgba(55,120,28,${alpha * 0.6})`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.save();
    ctx.scale(1, rh / rw);
    ctx.beginPath();
    ctx.arc(cx, cy * (rw / rh), rw, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Brighter toxic pools on ground
  for (let i = 0; i < 12; i++) {
    const cx = rand(50, W - 50);
    const cy = rand(H * 0.53, H * 0.82);
    const r = rand(20, 65);
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, 'rgba(55,140,20,0.08)');
    grad.addColorStop(0.5, 'rgba(40,100,15,0.04)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Faint toxic glow reflection on ruins base
  for (let i = 0; i < 8; i++) {
    const cx = rand(100, W - 100);
    const cy = hazeY + rand(5, 25);
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rand(30, 70));
    grad.addColorStop(0, 'rgba(60,130,25,0.05)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(cx - 70, cy - 70, 140, 140);
  }
}

// ── 7. Debris silhouettes (foreground) ──────────────
function drawDebris() {
  // Scattered rubble along the bottom
  ctx.fillStyle = '#080607';
  for (let i = 0; i < 40; i++) {
    const x = rand(0, W);
    const y = rand(H * 0.75, H);
    const w = rand(3, 15);
    const h = rand(2, 10);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rand(-0.5, 0.5));
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.restore();
  }

  // Larger debris pieces (rebar, concrete chunks)
  for (let i = 0; i < 12; i++) {
    const x = rand(0, W);
    const y = rand(H * 0.6, H * 0.95);
    const size = rand(5, 20);
    ctx.fillStyle = `rgba(${randInt(8, 18)},${randInt(6, 14)},${randInt(5, 12)},0.8)`;
    ctx.beginPath();
    const pts = randInt(3, 6);
    for (let p = 0; p < pts; p++) {
      const angle = (p / pts) * Math.PI * 2;
      const r = size * rand(0.5, 1);
      const px = x + Math.cos(angle) * r;
      const py = y + Math.sin(angle) * r * 0.6;
      p === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }

  // Foreground corner debris/rocks (silhouette framing)
  drawCornerDebris();
}

function drawCornerDebris() {
  // Bottom-left rocks
  ctx.fillStyle = '#050405';
  ctx.beginPath();
  ctx.moveTo(0, H);
  ctx.lineTo(0, H - 80);
  ctx.lineTo(30, H - 90);
  ctx.lineTo(60, H - 60);
  ctx.lineTo(100, H - 70);
  ctx.lineTo(140, H - 40);
  ctx.lineTo(170, H - 50);
  ctx.lineTo(200, H - 20);
  ctx.lineTo(220, H);
  ctx.closePath();
  ctx.fill();

  // Bottom-right rocks
  ctx.beginPath();
  ctx.moveTo(W, H);
  ctx.lineTo(W, H - 60);
  ctx.lineTo(W - 40, H - 75);
  ctx.lineTo(W - 80, H - 50);
  ctx.lineTo(W - 120, H - 65);
  ctx.lineTo(W - 150, H - 30);
  ctx.lineTo(W - 180, H);
  ctx.closePath();
  ctx.fill();
}

// ── 8. Particle systems (dust, ash, spores) ─────────
function drawParticles() {
  // Floating ash/dust motes
  for (let i = 0; i < 120; i++) {
    const x = rand(0, W);
    const y = rand(0, H);
    const size = rand(0.5, 2.5);
    const distFromHorizon = Math.abs(y - H * 0.48);
    const maxDist = H * 0.48;
    const brightness = 1 - (distFromHorizon / maxDist) * 0.7;

    // Near horizon: warmer, brighter. Far: cooler, dimmer
    if (y < H * 0.48) {
      // Sky particles — warm ash
      const alpha = rand(0.03, 0.12) * brightness;
      ctx.fillStyle = `rgba(${randInt(150, 220)},${randInt(80, 140)},${randInt(40, 80)},${alpha})`;
    } else {
      // Ground particles — cooler dust
      const alpha = rand(0.04, 0.10);
      ctx.fillStyle = `rgba(${randInt(60, 100)},${randInt(80, 120)},${randInt(40, 60)},${alpha})`;
    }
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Luminescent spores (toxic green, rare)
  for (let i = 0; i < 15; i++) {
    const x = rand(0, W);
    const y = rand(H * 0.40, H * 0.70);
    const r = rand(1, 3);
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
    grad.addColorStop(0, 'rgba(100,200,60,0.15)');
    grad.addColorStop(0.5, 'rgba(80,160,40,0.05)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r * 4, 0, Math.PI * 2);
    ctx.fill();

    // Core dot
    ctx.fillStyle = 'rgba(120,220,80,0.2)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Ember-like sparks near horizon
  for (let i = 0; i < 20; i++) {
    const x = rand(W * 0.2, W * 0.8);
    const y = rand(H * 0.35, H * 0.55);
    const r = rand(0.5, 1.5);
    ctx.fillStyle = `rgba(255,${randInt(120, 200)},${randInt(40, 80)},${rand(0.08, 0.25)})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── 9. Vignette overlay ─────────────────────────────
function drawVignette() {
  // Radial vignette from center
  const grad = ctx.createRadialGradient(W / 2, H / 2, W * 0.25, W / 2, H / 2, W * 0.75);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(0.6, 'rgba(0,0,0,0.15)');
  grad.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Extra darkening at edges for UI overlay comfort
  const edgeGrad = ctx.createLinearGradient(0, 0, 0, H);
  edgeGrad.addColorStop(0, 'rgba(0,0,0,0.3)');
  edgeGrad.addColorStop(0.15, 'rgba(0,0,0,0.05)');
  edgeGrad.addColorStop(0.5, 'rgba(0,0,0,0)');
  edgeGrad.addColorStop(0.85, 'rgba(0,0,0,0.05)');
  edgeGrad.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = edgeGrad;
  ctx.fillRect(0, 0, W, H);
}

// ── 10. Subtle film grain ───────────────────────────
function drawGrain() {
  for (let i = 0; i < 8000; i++) {
    const x = rand(0, W);
    const y = rand(0, H);
    const v = randInt(0, 30);
    ctx.fillStyle = `rgba(${v},${v},${v},${rand(0.02, 0.06)})`;
    ctx.fillRect(x, y, 1, 1);
  }
}

// ── Compose ─────────────────────────────────────────
console.log('Generating background...');
drawSky();
drawSun();
drawClouds();
drawGround();
drawRuins();
drawToxicHaze();
drawDebris();
drawParticles();
drawVignette();
drawGrain();

// ── Save ────────────────────────────────────────────
const outDir = path.join(process.cwd(), 'public', 'assets');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'background.png');
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(outPath, buffer);
console.log(`Saved: ${outPath} (${(buffer.length / 1024).toFixed(0)} KB)`);
