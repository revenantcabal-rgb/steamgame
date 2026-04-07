/**
 * gen-monsters-128.mjs
 * Generate smooth (anti-aliased) PNG monster icons.
 *   - Regular monsters: 128x128
 *   - Bosses: 256x256  (gold/silver/etc ornate frame + BOSS badge)
 *
 * Uses ctx.arc(), gradients, bezier curves — no pixel-art.
 *
 * Run:  node scripts/gen-monsters-128.mjs
 */
import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

const REG = 128;
const BOSS = 256;
const OUT_DIR = path.join(process.cwd(), 'public', 'assets', 'monsters-128');

// ── helpers ───────────────────────────────────────────
function ensure(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function save(canvas, name) {
  ensure(OUT_DIR);
  const p = path.join(OUT_DIR, `${name}.png`);
  fs.writeFileSync(p, canvas.toBuffer('image/png'));
  return p;
}

function make(size) {
  const c = createCanvas(size, size);
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  return { c, ctx, S: size };
}

// ── colour / gradient utilities ──────────────────────
function hexToRgb(hex) {
  const v = parseInt(hex.replace('#', ''), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

function lighter(hex, pct = 0.3) {
  const [r, g, b] = hexToRgb(hex);
  const l = (v) => Math.min(255, Math.round(v + (255 - v) * pct));
  return `rgb(${l(r)},${l(g)},${l(b)})`;
}

function darker(hex, pct = 0.3) {
  const [r, g, b] = hexToRgb(hex);
  const d = (v) => Math.max(0, Math.round(v * (1 - pct)));
  return `rgb(${d(r)},${d(g)},${d(b)})`;
}

function alpha(hex, a) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

// ── background with radial lighting ──────────────────
function drawBg(ctx, S, bgHex) {
  const g = ctx.createRadialGradient(S * 0.5, S * 0.45, S * 0.05, S * 0.5, S * 0.5, S * 0.75);
  g.addColorStop(0, lighter(bgHex, 0.2));
  g.addColorStop(1, bgHex);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
}

// ── glowing eyes ─────────────────────────────────────
function glowEye(ctx, x, y, r, color) {
  // outer glow
  const g1 = ctx.createRadialGradient(x, y, 0, x, y, r * 2.5);
  g1.addColorStop(0, alpha(color, 0.5));
  g1.addColorStop(1, 'transparent');
  ctx.fillStyle = g1;
  ctx.beginPath();
  ctx.arc(x, y, r * 2.5, 0, Math.PI * 2);
  ctx.fill();
  // bright core
  const g2 = ctx.createRadialGradient(x, y, 0, x, y, r);
  g2.addColorStop(0, '#ffffff');
  g2.addColorStop(0.3, color);
  g2.addColorStop(1, darker(color, 0.4));
  ctx.fillStyle = g2;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  // pupil
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(x + r * 0.15, y + r * 0.1, r * 0.35, 0, Math.PI * 2);
  ctx.fill();
}

// ── gradient body fill (vertical) ────────────────────
function bodyGrad(ctx, S, topColor, botColor) {
  const g = ctx.createLinearGradient(0, S * 0.2, 0, S * 0.9);
  g.addColorStop(0, topColor);
  g.addColorStop(1, botColor);
  return g;
}

// ── boss ornate frame ────────────────────────────────
function bossFrame(ctx, S, frameColor) {
  const W = 8;
  ctx.strokeStyle = frameColor;
  ctx.lineWidth = W;
  ctx.strokeRect(W / 2, W / 2, S - W, S - W);
  // inner highlight
  ctx.strokeStyle = lighter(frameColor, 0.4);
  ctx.lineWidth = 2;
  ctx.strokeRect(W + 2, W + 2, S - W * 2 - 4, S - W * 2 - 4);
  // corner dots
  const corners = [[W, W], [S - W, W], [W, S - W], [S - W, S - W]];
  ctx.fillStyle = lighter(frameColor, 0.5);
  for (const [x, y] of corners) {
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── boss badge ───────────────────────────────────────
function bossBadge(ctx, S) {
  const bx = S - 50, by = 14, bw = 42, bh = 20;
  ctx.fillStyle = '#c00';
  roundRect(ctx, bx, by, bw, bh, 4);
  ctx.fill();
  ctx.strokeStyle = '#ff4444';
  ctx.lineWidth = 1;
  roundRect(ctx, bx, by, bw, bh, 4);
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('BOSS', bx + bw / 2, by + bh / 2 + 1);
}

// ── boss energy aura ─────────────────────────────────
function bossAura(ctx, S, color) {
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const cx = S / 2 + Math.cos(angle) * S * 0.38;
    const cy = S / 2 + Math.sin(angle) * S * 0.38;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, S * 0.12);
    g.addColorStop(0, alpha(color, 0.3));
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, S * 0.12, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── rounded rect path ────────────────────────────────
function roundRect(ctx, x, y, w, h, r) {
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

// ── sharp tooth row ──────────────────────────────────
function teeth(ctx, x, y, w, count, h, color = '#ddd') {
  ctx.fillStyle = color;
  const tw = w / count;
  for (let i = 0; i < count; i++) {
    ctx.beginPath();
    ctx.moveTo(x + i * tw, y);
    ctx.lineTo(x + i * tw + tw / 2, y + h);
    ctx.lineTo(x + (i + 1) * tw, y);
    ctx.closePath();
    ctx.fill();
  }
}

// ── mutation pustules ────────────────────────────────
function pustules(ctx, cx, cy, count, spread, maxR, color) {
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + 0.3;
    const d = spread * (0.5 + Math.random() * 0.5);
    const px = cx + Math.cos(a) * d;
    const py = cy + Math.sin(a) * d;
    const r = maxR * (0.4 + Math.random() * 0.6);
    const g = ctx.createRadialGradient(px, py, 0, px, py, r);
    g.addColorStop(0, lighter(color, 0.5));
    g.addColorStop(0.6, color);
    g.addColorStop(1, darker(color, 0.3));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── spiky outline ────────────────────────────────────
function spikyCircle(ctx, cx, cy, r, spikes, depth, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i <= spikes * 2; i++) {
    const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r - depth;
    const x = cx + Math.cos(a) * rad;
    const y = cy + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

// ── leg pair helper ──────────────────────────────────
function drawLegs(ctx, cx, baseY, spread, len, color, count = 2) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < count; i++) {
      const ox = side * (spread + i * 8);
      const kneeX = cx + ox * 1.3;
      const kneeY = baseY + len * 0.4;
      const footX = cx + ox * 1.1;
      const footY = baseY + len;
      ctx.beginPath();
      ctx.moveTo(cx + ox * 0.5, baseY);
      ctx.quadraticCurveTo(kneeX, kneeY, footX, footY);
      ctx.stroke();
    }
  }
}

// ── wing pair ────────────────────────────────────────
function drawWings(ctx, cx, cy, span, h, color) {
  ctx.fillStyle = alpha(color, 0.5);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.bezierCurveTo(cx + side * span * 0.3, cy - h * 0.8,
                       cx + side * span * 0.9, cy - h * 0.4,
                       cx + side * span, cy + h * 0.1);
    ctx.bezierCurveTo(cx + side * span * 0.7, cy + h * 0.3,
                       cx + side * span * 0.3, cy + h * 0.2,
                       cx, cy);
    ctx.fill();
    ctx.stroke();
  }
}

// ── tentacle ─────────────────────────────────────────
function tentacle(ctx, x, y, len, angle, color, width = 4) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  const ex = x + Math.cos(angle) * len;
  const ey = y + Math.sin(angle) * len;
  const cpx = x + Math.cos(angle + 0.4) * len * 0.6;
  const cpy = y + Math.sin(angle + 0.4) * len * 0.6;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(cpx, cpy, ex, ey);
  ctx.stroke();
}

// ── claw / horn ──────────────────────────────────────
function drawHorn(ctx, x, y, len, angle, color) {
  const g = ctx.createLinearGradient(x, y, x + Math.cos(angle) * len, y + Math.sin(angle) * len);
  g.addColorStop(0, color);
  g.addColorStop(1, lighter(color, 0.5));
  ctx.fillStyle = g;
  const tipX = x + Math.cos(angle) * len;
  const tipY = y + Math.sin(angle) * len;
  const perpAngle = angle + Math.PI / 2;
  const bw = len * 0.25;
  ctx.beginPath();
  ctx.moveTo(x + Math.cos(perpAngle) * bw, y + Math.sin(perpAngle) * bw);
  ctx.lineTo(tipX, tipY);
  ctx.lineTo(x - Math.cos(perpAngle) * bw, y - Math.sin(perpAngle) * bw);
  ctx.closePath();
  ctx.fill();
}

// ── mechanical rivet dots ────────────────────────────
function rivets(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  const positions = [[x, y], [x + w, y], [x, y + h], [x + w, y + h], [x + w / 2, y], [x + w / 2, y + h]];
  for (const [px, py] of positions) {
    ctx.beginPath();
    ctx.arc(px, py, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ══════════════════════════════════════════════════════
//  ZONE DEFINITIONS
// ══════════════════════════════════════════════════════
const zones = [
  {
    name: 'Zone 1 - The Outskirts',
    bg: '#1A2618',
    monsters: ['mutated_mosquito', 'mutated_frog', 'mutated_centipede', 'wasteland_vermin'],
    boss: { name: 'giant_roach', frameColor: '#FFD700' },
  },
  {
    name: 'Zone 2 - Ruined Suburbs',
    bg: '#1E1A22',
    monsters: ['feral_dog_pack', 'mutant_hawk', 'rad_rat_swarm', 'suburb_dweller'],
    boss: { name: 'alpha_wolf', frameColor: '#C0C0C0' },
  },
  {
    name: 'Zone 3 - Toxic Industrial',
    bg: '#1A1E14',
    monsters: ['slime_crawler', 'rogue_drone', 'sewer_beast', 'factory_mutant'],
    boss: { name: 'factory_overseer', frameColor: '#FF8C00' },
  },
  {
    name: 'Zone 4 - The Deadlands',
    bg: '#221A14',
    monsters: ['sandworm', 'raider_gang', 'glowing_ghoul', 'deadlands_dweller'],
    boss: { name: 'raider_warlord', frameColor: '#CC2200' },
  },
  {
    name: 'Zone 5 - Military Zone',
    bg: '#14181E',
    monsters: ['turret_array', 'bio_soldier', 'escaped_experiment', 'military_hazard'],
    boss: { name: 'commander_mech', frameColor: '#4488FF' },
  },
  {
    name: 'Zone 6 - The Core',
    bg: '#201418',
    monsters: ['radiation_elemental', 'mutant_abomination', 'fusion_golem', 'core_abomination'],
    boss: { name: 'the_source', frameColor: '#44FF44' },
  },
  {
    name: 'Zone 7 - Ground Zero',
    bg: '#0E0A18',
    monsters: ['phase_walker', 'reality_breaker', 'apocalypse_herald', 'void_entity'],
    boss: { name: 'the_cataclysm', frameColor: '#AA44FF' },
  },
];

// ══════════════════════════════════════════════════════
//  INDIVIDUAL MONSTER DRAW FUNCTIONS
// ══════════════════════════════════════════════════════

const drawFuncs = {};

// ── ZONE 1 ───────────────────────────────────────────

drawFuncs.mutated_mosquito = (ctx, S, bg) => {
  drawBg(ctx, S, bg);
  const cx = S / 2, cy = S * 0.5;
  // body - elongated oval
  ctx.fillStyle = bodyGrad(ctx, S, '#4a6040', '#2a3520');
  ctx.beginPath();
  ctx.ellipse(cx, cy, S * 0.12, S * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  // wings
  drawWings(ctx, cx, cy - S * 0.08, S * 0.35, S * 0.2, '#88aa77');
  // proboscis (long curved needle)
  ctx.strokeStyle = '#8a7a60';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy - S * 0.28);
  ctx.bezierCurveTo(cx - 4, cy - S * 0.38, cx + 2, cy - S * 0.42, cx - 1, cy - S * 0.48);
  ctx.stroke();
  // legs (6 thin legs)
  ctx.strokeStyle = '#5a7050';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) {
    for (const side of [-1, 1]) {
      const ay = cy + S * 0.05 + i * S * 0.08;
      ctx.beginPath();
      ctx.moveTo(cx, ay);
      ctx.quadraticCurveTo(cx + side * S * 0.2, ay + S * 0.05, cx + side * S * 0.28, ay + S * 0.15);
      ctx.stroke();
    }
  }
  // eyes
  glowEye(ctx, cx - S * 0.06, cy - S * 0.2, S * 0.04, '#ff4444');
  glowEye(ctx, cx + S * 0.06, cy - S * 0.2, S * 0.04, '#ff4444');
  // mutation bumps
  pustules(ctx, cx, cy + S * 0.1, 4, S * 0.1, S * 0.025, '#6a8a50');
};

drawFuncs.mutated_frog = (ctx, S, bg) => {
  drawBg(ctx, S, bg);
  const cx = S / 2, cy = S * 0.55;
  // body - wide squat oval
  const bg1 = bodyGrad(ctx, S, '#4a7a30', '#2a4a18');
  ctx.fillStyle = bg1;
  ctx.beginPath();
  ctx.ellipse(cx, cy, S * 0.32, S * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  // belly
  ctx.fillStyle = '#5a8a40';
  ctx.beginPath();
  ctx.ellipse(cx, cy + S * 0.06, S * 0.2, S * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  // back legs
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#3a6a20';
    ctx.beginPath();
    ctx.ellipse(cx + side * S * 0.28, cy + S * 0.12, S * 0.1, S * 0.06, side * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  // front legs
  for (const side of [-1, 1]) {
    ctx.strokeStyle = '#3a6a20';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx + side * S * 0.22, cy + S * 0.08);
    ctx.quadraticCurveTo(cx + side * S * 0.32, cy + S * 0.2, cx + side * S * 0.26, cy + S * 0.28);
    ctx.stroke();
  }
  // big bulging eyes
  glowEye(ctx, cx - S * 0.15, cy - S * 0.2, S * 0.07, '#aaff00');
  glowEye(ctx, cx + S * 0.15, cy - S * 0.2, S * 0.07, '#aaff00');
  // wide mouth line
  ctx.strokeStyle = '#1a3a08';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - S * 0.2, cy + S * 0.02);
  ctx.quadraticCurveTo(cx, cy + S * 0.08, cx + S * 0.2, cy + S * 0.02);
  ctx.stroke();
  // mutation warts
  pustules(ctx, cx, cy - S * 0.05, 6, S * 0.22, S * 0.03, '#7aaa40');
};

drawFuncs.mutated_centipede = (ctx, S, bg) => {
  drawBg(ctx, S, bg);
  const cx = S / 2;
  // segmented body curving through the frame
  const segments = 9;
  ctx.lineCap = 'round';
  for (let i = 0; i < segments; i++) {
    const t = i / (segments - 1);
    const sx = cx + Math.sin(t * Math.PI * 2.5) * S * 0.18;
    const sy = S * 0.12 + t * S * 0.72;
    const r = S * 0.08 - i * 0.5;
    // segment body
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
    g.addColorStop(0, '#8a6040');
    g.addColorStop(1, '#4a3020');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();
    // legs on each segment
    if (i < segments - 1) {
      for (const side of [-1, 1]) {
        ctx.strokeStyle = '#6a5030';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + side * S * 0.15, sy + S * 0.04);
        ctx.stroke();
      }
    }
  }
  // head (first segment)
  const hx = cx + Math.sin(0) * S * 0.18;
  const hy = S * 0.12;
  // pincers
  for (const side of [-1, 1]) {
    drawHorn(ctx, hx + side * S * 0.04, hy + S * 0.02, S * 0.1, Math.PI / 2 + side * 0.6, '#aa4420');
  }
  // eyes
  glowEye(ctx, hx - S * 0.04, hy - S * 0.02, S * 0.03, '#ff6600');
  glowEye(ctx, hx + S * 0.04, hy - S * 0.02, S * 0.03, '#ff6600');
};

drawFuncs.wasteland_vermin = (ctx, S, bg) => {
  drawBg(ctx, S, bg);
  const cx = S / 2, cy = S * 0.5;
  // rat-like body
  ctx.fillStyle = bodyGrad(ctx, S, '#6a5a4a', '#3a2a1a');
  ctx.beginPath();
  ctx.ellipse(cx, cy, S * 0.22, S * 0.16, 0.15, 0, Math.PI * 2);
  ctx.fill();
  // pointed snout
  ctx.fillStyle = '#5a4a3a';
  ctx.beginPath();
  ctx.moveTo(cx + S * 0.22, cy - S * 0.02);
  ctx.lineTo(cx + S * 0.35, cy + S * 0.02);
  ctx.lineTo(cx + S * 0.22, cy + S * 0.06);
  ctx.closePath();
  ctx.fill();
  // nose
  ctx.fillStyle = '#aa6688';
  ctx.beginPath();
  ctx.arc(cx + S * 0.35, cy + S * 0.02, S * 0.02, 0, Math.PI * 2);
  ctx.fill();
  // ears
  for (const dy of [-0.06, -0.1]) {
    ctx.fillStyle = '#7a6a5a';
    ctx.beginPath();
    ctx.ellipse(cx + S * 0.12, cy + dy * S, S * 0.05, S * 0.07, -0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  // tail
  ctx.strokeStyle = '#8a6a5a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - S * 0.22, cy + S * 0.04);
  ctx.bezierCurveTo(cx - S * 0.35, cy - S * 0.1, cx - S * 0.4, cy + S * 0.2, cx - S * 0.32, cy + S * 0.3);
  ctx.stroke();
  // legs
  drawLegs(ctx, cx, cy + S * 0.14, S * 0.12, S * 0.16, '#5a4a3a', 2);
  // eyes
  glowEye(ctx, cx + S * 0.14, cy - S * 0.08, S * 0.035, '#ff3333');
  // mutation sores
  pustules(ctx, cx - S * 0.05, cy, 3, S * 0.12, S * 0.025, '#88aa44');
};

drawFuncs.giant_roach = (ctx, S, bg) => {
  drawBg(ctx, S, bg);
  bossAura(ctx, S, '#88aa44');
  const cx = S / 2, cy = S * 0.52;
  // large oval carapace
  const g = ctx.createRadialGradient(cx, cy - S * 0.05, S * 0.05, cx, cy, S * 0.28);
  g.addColorStop(0, '#6a5030');
  g.addColorStop(0.5, '#4a3520');
  g.addColorStop(1, '#2a1a0a');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(cx, cy, S * 0.28, S * 0.24, 0, 0, Math.PI * 2);
  ctx.fill();
  // shell line
  ctx.strokeStyle = '#3a2510';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - S * 0.24);
  ctx.lineTo(cx, cy + S * 0.2);
  ctx.stroke();
  // 6 legs
  for (let i = 0; i < 3; i++) {
    for (const side of [-1, 1]) {
      const baseY = cy - S * 0.05 + i * S * 0.1;
      ctx.strokeStyle = '#5a4020';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx + side * S * 0.15, baseY);
      ctx.quadraticCurveTo(cx + side * S * 0.32, baseY - S * 0.02, cx + side * S * 0.38, baseY + S * 0.12);
      ctx.stroke();
    }
  }
  // antennae
  for (const side of [-1, 1]) {
    ctx.strokeStyle = '#6a5040';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx + side * S * 0.06, cy - S * 0.24);
    ctx.bezierCurveTo(cx + side * S * 0.15, cy - S * 0.38, cx + side * S * 0.25, cy - S * 0.35, cx + side * S * 0.3, cy - S * 0.42);
    ctx.stroke();
  }
  // head
  ctx.fillStyle = '#5a4030';
  ctx.beginPath();
  ctx.ellipse(cx, cy - S * 0.24, S * 0.1, S * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();
  // eyes
  glowEye(ctx, cx - S * 0.06, cy - S * 0.26, S * 0.04, '#ffaa00');
  glowEye(ctx, cx + S * 0.06, cy - S * 0.26, S * 0.04, '#ffaa00');
  // mandibles
  teeth(ctx, cx - S * 0.06, cy - S * 0.18, S * 0.12, 4, S * 0.04, '#aa8844');
  bossFrame(ctx, S, '#FFD700');
  bossBadge(ctx, S);
};

// ── ZONE 2 ───────────────────────────────────────────

drawFuncs.feral_dog_pack = (ctx, S, bg) => {
  drawBg(ctx, S, bg);
  const cx = S / 2, cy = S * 0.55;
  // draw 3 overlapping dog silhouettes
  for (let d = 0; d < 3; d++) {
    const ox = (d - 1) * S * 0.2;
    const oy = d === 1 ? -S * 0.05 : S * 0.02;
    const shade = d === 1 ? '#6a5a4a' : '#4a3a2a';
    // body
    ctx.fillStyle = shade;
    ctx.beginPath();
    ctx.ellipse(cx + ox, cy + oy, S * 0.14, S * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    // head
    ctx.fillStyle = lighter(shade, 0.1);
    ctx.beginPath();
    ctx.ellipse(cx + ox + S * 0.1, cy + oy - S * 0.1, S * 0.08, S * 0.07, 0.2, 0, Math.PI * 2);
    ctx.fill();
    // ear
    ctx.fillStyle = darker(shade, 0.2);
    ctx.beginPath();
    ctx.moveTo(cx + ox + S * 0.14, cy + oy - S * 0.16);
    ctx.lineTo(cx + ox + S * 0.18, cy + oy - S * 0.25);
    ctx.lineTo(cx + ox + S * 0.22, cy + oy - S * 0.15);
    ctx.closePath();
    ctx.fill();
    // eye
    glowEye(ctx, cx + ox + S * 0.12, cy + oy - S * 0.12, S * 0.025, '#ff4400');
    // mouth / snarl
    ctx.strokeStyle = '#2a1a0a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx + ox + S * 0.14, cy + oy - S * 0.04);
    ctx.lineTo(cx + ox + S * 0.2, cy + oy - S * 0.02);
    ctx.stroke();
    // legs
    ctx.strokeStyle = shade;
    ctx.lineWidth = 3;
    for (const lx of [-0.06, 0.06]) {
      ctx.beginPath();
      ctx.moveTo(cx + ox + lx * S, cy + oy + S * 0.1);
      ctx.lineTo(cx + ox + lx * S, cy + oy + S * 0.22);
      ctx.stroke();
    }
  }
};

drawFuncs.mutant_hawk = (ctx, S, bg) => {
  drawBg(ctx, S, bg);
  const cx = S / 2, cy = S * 0.5;
  // wings spread wide
  drawWings(ctx, cx, cy, S * 0.42, S * 0.25, '#6a4a3a');
  // body
  ctx.fillStyle = bodyGrad(ctx, S, '#7a5a4a', '#3a2a1a');
  ctx.beginPath();
  ctx.ellipse(cx, cy, S * 0.1, S * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  // head
  ctx.fillStyle = '#5a3a2a';
  ctx.beginPath();
  ctx.arc(cx, cy - S * 0.22, S * 0.08, 0, Math.PI * 2);
  ctx.fill();
  // beak
  ctx.fillStyle = '#aa8833';
  ctx.beginPath();
  ctx.moveTo(cx - S * 0.03, cy - S * 0.24);
  ctx.lineTo(cx, cy - S * 0.32);
  ctx.lineTo(cx + S * 0.03, cy - S * 0.24);
  ctx.closePath();
  ctx.fill();
  // talons
  for (const side of [-1, 1]) {
    ctx.strokeStyle = '#aa8833';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx + side * S * 0.04, cy + S * 0.2);
    ctx.lineTo(cx + side * S * 0.06, cy + S * 0.32);
    ctx.lineTo(cx + side * S * 0.02, cy + S * 0.34);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + side * S * 0.06, cy + S * 0.32);
    ctx.lineTo(cx + side * S * 0.1, cy + S * 0.34);
    ctx.stroke();
  }
  // eyes
  glowEye(ctx, cx - S * 0.04, cy - S * 0.24, S * 0.03, '#ffcc00');
  glowEye(ctx, cx + S * 0.04, cy - S * 0.24, S * 0.03, '#ffcc00');
  // mutation: extra eye
  glowEye(ctx, cx, cy - S * 0.18, S * 0.02, '#ff4400');
};

drawFuncs.rad_rat_swarm = (ctx, S, bg) => {
  drawBg(ctx, S, bg);
  // multiple small rats
  for (let i = 0; i < 7; i++) {
    const rx = S * 0.15 + (i % 3) * S * 0.28 + (Math.random() - 0.5) * S * 0.1;
    const ry = S * 0.25 + Math.floor(i / 3) * S * 0.25 + (Math.random() - 0.5) * S * 0.1;
    const sc = 0.12 + Math.random() * 0.04;
    // body
    ctx.fillStyle = `rgb(${80 + i * 10},${60 + i * 5},${50 + i * 5})`;
    ctx.beginPath();
    ctx.ellipse(rx, ry, S * sc, S * sc * 0.6, 0.3 * (i % 2 === 0 ? 1 : -1), 0, Math.PI * 2);
    ctx.fill();
    // tail
    ctx.strokeStyle = '#8a6a5a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rx - S * sc * 0.8, ry);
    ctx.quadraticCurveTo(rx - S * sc * 1.5, ry - S * 0.05, rx - S * sc * 1.8, ry + S * 0.04);
    ctx.stroke();
    // eye
    glowEye(ctx, rx + S * sc * 0.5, ry - S * sc * 0.3, S * 0.015, '#44ff44');
  }
  // radiation glow overlay
  const rg = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S * 0.5);
  rg.addColorStop(0, 'rgba(100,255,50,0.08)');
  rg.addColorStop(1, 'transparent');
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, S, S);
};

drawFuncs.suburb_dweller = (ctx, S, bg) => {
  drawBg(ctx, S, bg);
  const cx = S / 2, cy = S * 0.5;
  // hunched humanoid
  ctx.fillStyle = bodyGrad(ctx, S, '#5a4a5a', '#2a1a2a');
  ctx.beginPath();
  ctx.ellipse(cx, cy + S * 0.05, S * 0.18, S * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();
  // head - slightly deformed
  ctx.fillStyle = '#6a5a5a';
  ctx.beginPath();
  ctx.ellipse(cx + S * 0.02, cy - S * 0.22, S * 0.1, S * 0.09, 0.1, 0, Math.PI * 2);
  ctx.fill();
  // tattered clothing remnant
  ctx.fillStyle = alpha('#4a3a4a', 0.6);
  ctx.beginPath();
  ctx.moveTo(cx - S * 0.15, cy - S * 0.1);
  ctx.lineTo(cx + S * 0.15, cy - S * 0.08);
  ctx.lineTo(cx + S * 0.18, cy + S * 0.25);
  ctx.lineTo(cx - S * 0.18, cy + S * 0.25);
  ctx.closePath();
  ctx.fill();
  // arms
  ctx.strokeStyle = '#6a5a5a';
  ctx.lineWidth = 5;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx + side * S * 0.15, cy - S * 0.05);
    ctx.quadraticCurveTo(cx + side * S * 0.28, cy + S * 0.1, cx + side * S * 0.22, cy + S * 0.25);
    ctx.stroke();
  }
  // eyes (one bigger than other - mutated)
  glowEye(ctx, cx - S * 0.04, cy - S * 0.24, S * 0.03, '#ff6666');
  glowEye(ctx, cx + S * 0.06, cy - S * 0.23, S * 0.04, '#ff6666');
  // legs
  drawLegs(ctx, cx, cy + S * 0.25, S * 0.1, S * 0.18, '#4a3a4a');
};

drawFuncs.alpha_wolf = (ctx, S, bg) => {
  drawBg(ctx, S, bg);
  bossAura(ctx, S, '#aaaacc');
  const cx = S / 2, cy = S * 0.52;
  // large muscular body
  ctx.fillStyle = bodyGrad(ctx, S, '#7a7a8a', '#3a3a4a');
  ctx.beginPath();
  ctx.ellipse(cx, cy, S * 0.26, S * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  // head
  ctx.fillStyle = '#6a6a7a';
  ctx.beginPath();
  ctx.ellipse(cx + S * 0.15, cy - S * 0.18, S * 0.12, S * 0.1, 0.2, 0, Math.PI * 2);
  ctx.fill();
  // snout
  ctx.fillStyle = '#5a5a6a';
  ctx.beginPath();
  ctx.moveTo(cx + S * 0.24, cy - S * 0.2);
  ctx.lineTo(cx + S * 0.36, cy - S * 0.16);
  ctx.lineTo(cx + S * 0.24, cy - S * 0.12);
  ctx.closePath();
  ctx.fill();
  // ears
  for (const ox of [0.08, 0.18]) {
    ctx.fillStyle = '#5a5a6a';
    ctx.beginPath();
    ctx.moveTo(cx + ox * S, cy - S * 0.26);
    ctx.lineTo(cx + (ox + 0.04) * S, cy - S * 0.36);
    ctx.lineTo(cx + (ox + 0.08) * S, cy - S * 0.26);
    ctx.closePath();
    ctx.fill();
  }
  // eyes
  glowEye(ctx, cx + S * 0.18, cy - S * 0.2, S * 0.04, '#ffcc00');
  // teeth / snarl
  teeth(ctx, cx + S * 0.24, cy - S * 0.14, S * 0.1, 5, S * 0.03);
  // powerful legs
  ctx.strokeStyle = '#5a5a6a';
  ctx.lineWidth = 5;
  const legPositions = [[-0.15, 0], [0.1, 0], [-0.1, 0.08], [0.15, 0.08]];
  for (const [lx, ly] of legPositions) {
    ctx.beginPath();
    ctx.moveTo(cx + lx * S, cy + S * 0.18 + ly * S);
    ctx.lineTo(cx + lx * S + S * 0.02, cy + S * 0.38);
    ctx.stroke();
  }
  // scars
  ctx.strokeStyle = alpha('#ff4444', 0.5);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx + S * 0.08, cy - S * 0.05);
  ctx.lineTo(cx + S * 0.2, cy + S * 0.05);
  ctx.stroke();
  bossFrame(ctx, S, '#C0C0C0');
  bossBadge(ctx, S);
};

// ── ZONE 3 ───────────────────────────────────────────

drawFuncs.slime_crawler = (ctx, S, bg) => {
  drawBg(ctx, S, bg);
  const cx = S / 2, cy = S * 0.6;
  // amorphous blob body
  const g = ctx.createRadialGradient(cx, cy - S * 0.05, S * 0.05, cx, cy, S * 0.28);
  g.addColorStop(0, '#88cc44');
  g.addColorStop(0.6, '#447722');
  g.addColorStop(1, '#224411');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(cx - S * 0.3, cy + S * 0.15);
  ctx.bezierCurveTo(cx - S * 0.35, cy - S * 0.1, cx - S * 0.15, cy - S * 0.3, cx, cy - S * 0.25);
  ctx.bezierCurveTo(cx + S * 0.15, cy - S * 0.3, cx + S * 0.35, cy - S * 0.1, cx + S * 0.3, cy + S * 0.15);
  ctx.quadraticCurveTo(cx, cy + S * 0.25, cx - S * 0.3, cy + S * 0.15);
  ctx.fill();
  // drip tentacles
  for (let i = 0; i < 4; i++) {
    const tx = cx - S * 0.2 + i * S * 0.13;
    ctx.fillStyle = '#55aa33';
    ctx.beginPath();
    ctx.moveTo(tx - S * 0.03, cy + S * 0.15);
    ctx.quadraticCurveTo(tx, cy + S * 0.35, tx + S * 0.03, cy + S * 0.15);
    ctx.fill();
  }
  // eyes floating in slime
  glowEye(ctx, cx - S * 0.1, cy - S * 0.08, S * 0.04, '#ffff44');
  glowEye(ctx, cx + S * 0.08, cy - S * 0.12, S * 0.035, '#ffff44');
  // bubbles
  for (let i = 0; i < 5; i++) {
    const bx = cx + (Math.random() - 0.5) * S * 0.4;
    const by = cy + (Math.random() - 0.5) * S * 0.2;
    ctx.strokeStyle = alpha('#aaffaa', 0.4);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(bx, by, S * 0.015 + Math.random() * S * 0.01, 0, Math.PI * 2);
    ctx.stroke();
  }
};

drawFuncs.rogue_drone = (ctx, S, bg) => {
  drawBg(ctx, S, bg);
  const cx = S / 2, cy = S * 0.5;
  // angular mechanical body
  ctx.fillStyle = '#4a4a55';
  ctx.beginPath();
  ctx.moveTo(cx, cy - S * 0.2);
  ctx.lineTo(cx + S * 0.18, cy);
  ctx.lineTo(cx + S * 0.12, cy + S * 0.18);
  ctx.lineTo(cx - S * 0.12, cy + S * 0.18);
  ctx.lineTo(cx - S * 0.18, cy);
  ctx.closePath();
  ctx.fill();
  // sensor dome
  const dg = ctx.createRadialGradient(cx, cy - S * 0.1, 0, cx, cy - S * 0.1, S * 0.08);
  dg.addColorStop(0, '#8888aa');
  dg.addColorStop(1, '#3a3a4a');
  ctx.fillStyle = dg;
  ctx.beginPath();
  ctx.arc(cx, cy - S * 0.1, S * 0.08, 0, Math.PI * 2);
  ctx.fill();
  // propeller arms
  for (const side of [-1, 1]) {
    ctx.strokeStyle = '#5a5a65';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx + side * S * 0.12, cy - S * 0.05);
    ctx.lineTo(cx + side * S * 0.32, cy - S * 0.15);
    ctx.stroke();
    // rotor blur
    ctx.strokeStyle = alpha('#88aacc', 0.3);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx + side * S * 0.32, cy - S * 0.15, S * 0.1, S * 0.03, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  // red targeting eye
  glowEye(ctx, cx, cy - S * 0.1, S * 0.04, '#ff0000');
  // gun barrel
  ctx.fillStyle = '#3a3a44';
  ctx.fillRect(cx - S * 0.02, cy + S * 0.18, S * 0.04, S * 0.12);
  rivets(ctx, cx - S * 0.12, cy - S * 0.02, S * 0.24, S * 0.16, '#6a6a7a');
};

drawFuncs.sewer_beast = (ctx, S, bg) => {
  drawBg(ctx, S, bg);
  const cx = S / 2, cy = S * 0.55;
  // crocodilian body
  ctx.fillStyle = bodyGrad(ctx, S, '#4a6a3a', '#1a3a1a');
  ctx.beginPath();
  ctx.ellipse(cx, cy, S * 0.28, S * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();
  // armoured scales (ridge)
  ctx.fillStyle = '#3a5a2a';
  for (let i = 0; i < 6; i++) {
    const sx = cx - S * 0.2 + i * S * 0.08;
    ctx.beginPath();
    ctx.moveTo(sx, cy - S * 0.14);
    ctx.lineTo(sx + S * 0.03, cy - S * 0.2);
    ctx.lineTo(sx + S * 0.06, cy - S * 0.14);
    ctx.closePath();
    ctx.fill();
  }
  // jaw / snout
  ctx.fillStyle = '#3a5a2a';
  ctx.beginPath();
  ctx.moveTo(cx + S * 0.26, cy - S * 0.06);
  ctx.lineTo(cx + S * 0.42, cy);
  ctx.lineTo(cx + S * 0.26, cy + S * 0.06);
  ctx.closePath();
  ctx.fill();
  // teeth
  teeth(ctx, cx + S * 0.26, cy - S * 0.04, S * 0.14, 6, S * 0.03);
  teeth(ctx, cx + S * 0.26, cy + S * 0.01, S * 0.14, 6, -S * 0.03);
  // eyes
  glowEye(ctx, cx + S * 0.18, cy - S * 0.1, S * 0.035, '#aaff00');
  // tail
  ctx.strokeStyle = '#3a5a2a';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(cx - S * 0.28, cy);
  ctx.bezierCurveTo(cx - S * 0.38, cy - S * 0.08, cx - S * 0.42, cy + S * 0.05, cx - S * 0.38, cy + S * 0.15);
  ctx.stroke();
  // slime drips
  ctx.fillStyle = alpha('#88cc44', 0.4);
  for (let i = 0; i < 3; i++) {
    const dx = cx - S * 0.1 + i * S * 0.12;
    ctx.beginPath();
    ctx.ellipse(dx, cy + S * 0.18, S * 0.03, S * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();
  }
};

drawFuncs.factory_mutant = (ctx, S, bg) => {
  drawBg(ctx, S, bg);
  const cx = S / 2, cy = S * 0.5;
  // hulking deformed humanoid
  ctx.fillStyle = bodyGrad(ctx, S, '#6a7a4a', '#2a3a1a');
  ctx.beginPath();
  ctx.ellipse(cx, cy + S * 0.05, S * 0.22, S * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  // one arm much bigger than the other
  ctx.strokeStyle = '#5a6a3a';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(cx - S * 0.2, cy - S * 0.05);
  ctx.quadraticCurveTo(cx - S * 0.38, cy + S * 0.1, cx - S * 0.32, cy + S * 0.28);
  ctx.stroke();
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(cx + S * 0.2, cy - S * 0.05);
  ctx.quadraticCurveTo(cx + S * 0.3, cy + S * 0.1, cx + S * 0.24, cy + S * 0.25);
  ctx.stroke();
  // head (small relative to body)
  ctx.fillStyle = '#5a6a3a';
  ctx.beginPath();
  ctx.arc(cx + S * 0.02, cy - S * 0.26, S * 0.08, 0, Math.PI * 2);
  ctx.fill();
  // eyes
  glowEye(ctx, cx - S * 0.02, cy - S * 0.28, S * 0.03, '#ff8800');
  glowEye(ctx, cx + S * 0.06, cy - S * 0.27, S * 0.025, '#ff8800');
  // toxic veins
  ctx.strokeStyle = alpha('#88ff44', 0.5);
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 4; i++) {
    const a = i * 0.8 + 0.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.bezierCurveTo(cx + Math.cos(a) * S * 0.15, cy + Math.sin(a) * S * 0.1,
                       cx + Math.cos(a) * S * 0.2, cy + Math.sin(a) * S * 0.2,
                       cx + Math.cos(a) * S * 0.25, cy + Math.sin(a) * S * 0.28);
    ctx.stroke();
  }
  // legs
  drawLegs(ctx, cx, cy + S * 0.3, S * 0.1, S * 0.14, '#4a5a2a');
  pustules(ctx, cx + S * 0.05, cy + S * 0.1, 5, S * 0.15, S * 0.03, '#aacc44');
};

drawFuncs.factory_overseer = (ctx, S, bg) => {
  drawBg(ctx, S, bg);
  bossAura(ctx, S, '#FF8C00');
  const cx = S / 2, cy = S * 0.5;
  // massive industrial mech body
  ctx.fillStyle = '#4a4a40';
  roundRect(ctx, cx - S * 0.22, cy - S * 0.15, S * 0.44, S * 0.38, 8);
  ctx.fill();
  // armour plates
  ctx.fillStyle = '#5a5a50';
  roundRect(ctx, cx - S * 0.18, cy - S * 0.12, S * 0.36, S * 0.1, 4);
  ctx.fill();
  roundRect(ctx, cx - S * 0.18, cy + S * 0.02, S * 0.36, S * 0.1, 4);
  ctx.fill();
  // head / cockpit
  const hg = ctx.createRadialGradient(cx, cy - S * 0.22, 0, cx, cy - S * 0.22, S * 0.1);
  hg.addColorStop(0, '#6a6a60');
  hg.addColorStop(1, '#3a3a30');
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.arc(cx, cy - S * 0.22, S * 0.1, 0, Math.PI * 2);
  ctx.fill();
  // visor
  ctx.fillStyle = alpha('#ff8800', 0.7);
  ctx.beginPath();
  ctx.ellipse(cx, cy - S * 0.22, S * 0.08, S * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();
  // hydraulic arms
  for (const side of [-1, 1]) {
    ctx.strokeStyle = '#5a5a50';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(cx + side * S * 0.22, cy - S * 0.05);
    ctx.lineTo(cx + side * S * 0.35, cy + S * 0.05);
    ctx.lineTo(cx + side * S * 0.32, cy + S * 0.22);
    ctx.stroke();
    // claw
    ctx.strokeStyle = '#aa7733';
    ctx.lineWidth = 3;
    for (const da of [-0.3, 0, 0.3]) {
      ctx.beginPath();
      ctx.moveTo(cx + side * S * 0.32, cy + S * 0.22);
      ctx.lineTo(cx + side * S * 0.36 + Math.cos(da) * S * 0.06, cy + S * 0.28 + Math.sin(da) * S * 0.03);
      ctx.stroke();
    }
  }
  // legs (thick pistons)
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#4a4a40';
    ctx.fillRect(cx + side * S * 0.1 - S * 0.04, cy + S * 0.22, S * 0.08, S * 0.18);
    ctx.fillStyle = '#3a3a30';
    ctx.fillRect(cx + side * S * 0.1 - S * 0.05, cy + S * 0.38, S * 0.1, S * 0.04);
  }
  rivets(ctx, cx - S * 0.2, cy - S * 0.14, S * 0.4, S * 0.36, '#7a7a70');
  glowEye(ctx, cx, cy - S * 0.22, S * 0.04, '#ff4400');
  bossFrame(ctx, S, '#FF8C00');
  bossBadge(ctx, S);
};

// ── ZONE 4 ───────────────────────────────────────────

drawFuncs.sandworm = (ctx, S, bg) => {
  drawBg(ctx, S, bg);
  const cx = S / 2, cy = S * 0.5;
  // worm body emerging from ground
  ctx.fillStyle = bodyGrad(ctx, S, '#8a7050', '#4a3520');
  ctx.beginPath();
  ctx.moveTo(cx - S * 0.15, S);
  ctx.bezierCurveTo(cx - S * 0.2, cy + S * 0.1, cx - S * 0.25, cy - S * 0.1, cx, cy - S * 0.3);
  ctx.bezierCurveTo(cx + S * 0.25, cy - S * 0.1, cx + S * 0.2, cy + S * 0.1, cx + S * 0.15, S);
  ctx.closePath();
  ctx.fill();
  // segments
  ctx.strokeStyle = alpha('#6a5030', 0.5);
  ctx.lineWidth = 1;
  for (let i = 1; i < 8; i++) {
    const sy = cy - S * 0.25 + i * S * 0.1;
    ctx.beginPath();
    ctx.moveTo(cx - S * 0.18, sy);
    ctx.quadraticCurveTo(cx, sy - S * 0.02, cx + S * 0.18, sy);
    ctx.stroke();
  }
  // mouth (circular with teeth)
  ctx.fillStyle = '#2a1a0a';
  ctx.beginPath();
  ctx.arc(cx, cy - S * 0.28, S * 0.1, 0, Math.PI * 2);
  ctx.fill();
  // ring of teeth
  const toothCount = 10;
  ctx.fillStyle = '#ccaa88';
  for (let i = 0; i < toothCount; i++) {
    const a = (i / toothCount) * Math.PI * 2;
    const tx = cx + Math.cos(a) * S * 0.1;
    const ty = (cy - S * 0.28) + Math.sin(a) * S * 0.1;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(cx + Math.cos(a) * S * 0.05, (cy - S * 0.28) + Math.sin(a) * S * 0.05);
    ctx.lineTo(tx + Math.cos(a + 0.15) * S * 0.02, ty + Math.sin(a + 0.15) * S * 0.02);
    ctx.closePath();
    ctx.fill();
  }
  // sand particles
  ctx.fillStyle = alpha('#aa9060', 0.3);
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.arc(cx + (Math.random() - 0.5) * S * 0.6, S * 0.7 + Math.random() * S * 0.2, S * 0.01 + Math.random() * S * 0.015, 0, Math.PI * 2);
    ctx.fill();
  }
};

drawFuncs.raider_gang = (ctx, S, bg) => {
  drawBg(ctx, S, bg);
  // 3 raider silhouettes
  for (let i = 0; i < 3; i++) {
    const rx = S * 0.2 + i * S * 0.28;
    const ry = S * 0.5 + (i === 1 ? -S * 0.08 : 0);
    const shade = ['#5a4030', '#6a4a38', '#4a3828'][i];
    // body
    ctx.fillStyle = shade;
    ctx.beginPath();
    ctx.ellipse(rx, ry + S * 0.05, S * 0.08, S * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    // head
    ctx.fillStyle = lighter(shade, 0.15);
    ctx.beginPath();
    ctx.arc(rx, ry - S * 0.14, S * 0.06, 0, Math.PI * 2);
    ctx.fill();
    // mask / bandana
    ctx.fillStyle = '#2a1a1a';
    ctx.fillRect(rx - S * 0.06, ry - S * 0.16, S * 0.12, S * 0.04);
    // weapon (spear or club)
    ctx.strokeStyle = '#8a7a6a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(rx + S * 0.05, ry - S * 0.1);
    ctx.lineTo(rx + S * 0.08, ry + S * 0.2);
    ctx.stroke();
    // eye slit
    glowEye(ctx, rx, ry - S * 0.15, S * 0.02, '#ff4400');
  }
};

drawFuncs.glowing_ghoul = (ctx, S, bg) => {
  drawBg(ctx, S, bg);
  const cx = S / 2, cy = S * 0.5;
  // ghostly glow
  const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, S * 0.35);
  gg.addColorStop(0, alpha('#44ff88', 0.2));
  gg.addColorStop(1, 'transparent');
  ctx.fillStyle = gg;
  ctx.fillRect(0, 0, S, S);
  // emaciated body
  ctx.fillStyle = bodyGrad(ctx, S, '#4a6a4a', '#1a3a1a');
  ctx.beginPath();
  ctx.ellipse(cx, cy + S * 0.05, S * 0.14, S * 0.26, 0, 0, Math.PI * 2);
  ctx.fill();
  // skull-like head
  ctx.fillStyle = '#5a7a5a';
  ctx.beginPath();
  ctx.arc(cx, cy - S * 0.24, S * 0.1, 0, Math.PI * 2);
  ctx.fill();
  // hollow eye sockets
  ctx.fillStyle = '#1a2a1a';
  ctx.beginPath();
  ctx.ellipse(cx - S * 0.04, cy - S * 0.26, S * 0.035, S * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + S * 0.04, cy - S * 0.26, S * 0.035, S * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();
  // glowing cores in sockets
  glowEye(ctx, cx - S * 0.04, cy - S * 0.26, S * 0.02, '#44ff88');
  glowEye(ctx, cx + S * 0.04, cy - S * 0.26, S * 0.02, '#44ff88');
  // jaw / mouth
  ctx.strokeStyle = '#1a2a1a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - S * 0.06, cy - S * 0.18);
  ctx.lineTo(cx + S * 0.06, cy - S * 0.18);
  ctx.stroke();
  teeth(ctx, cx - S * 0.06, cy - S * 0.18, S * 0.12, 5, S * 0.025, '#aaccaa');
  // bony arms reaching forward
  ctx.strokeStyle = '#4a6a4a';
  ctx.lineWidth = 3;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx + side * S * 0.12, cy - S * 0.05);
    ctx.quadraticCurveTo(cx + side * S * 0.3, cy + S * 0.05, cx + side * S * 0.28, cy + S * 0.2);
    ctx.stroke();
    // claw fingers
    for (const da of [-0.2, 0, 0.2]) {
      ctx.beginPath();
      ctx.moveTo(cx + side * S * 0.28, cy + S * 0.2);
      ctx.lineTo(cx + side * S * 0.32, cy + S * 0.26 + da * S * 0.1);
      ctx.stroke();
    }
  }
};

drawFuncs.deadlands_dweller = (ctx, S, bg) => {
  drawBg(ctx, S, bg);
  const cx = S / 2, cy = S * 0.5;
  // stocky hunched figure with desert cloak
  ctx.fillStyle = bodyGrad(ctx, S, '#7a6a50', '#3a2a18');
  ctx.beginPath();
  ctx.moveTo(cx - S * 0.2, cy - S * 0.15);
  ctx.bezierCurveTo(cx - S * 0.25, cy + S * 0.1, cx - S * 0.2, cy + S * 0.3, cx, cy + S * 0.35);
  ctx.bezierCurveTo(cx + S * 0.2, cy + S * 0.3, cx + S * 0.25, cy + S * 0.1, cx + S * 0.2, cy - S * 0.15);
  ctx.closePath();
  ctx.fill();
  // hooded head
  ctx.fillStyle = '#5a4a38';
  ctx.beginPath();
  ctx.arc(cx, cy - S * 0.2, S * 0.12, 0, Math.PI * 2);
  ctx.fill();
  // hood
  ctx.fillStyle = '#4a3a28';
  ctx.beginPath();
  ctx.arc(cx, cy - S * 0.22, S * 0.14, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  // glowing eyes under hood
  glowEye(ctx, cx - S * 0.04, cy - S * 0.22, S * 0.025, '#ffaa00');
  glowEye(ctx, cx + S * 0.04, cy - S * 0.22, S * 0.025, '#ffaa00');
  // makeshift weapon (bone club)
  ctx.strokeStyle = '#aaa088';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx + S * 0.15, cy - S * 0.1);
  ctx.lineTo(cx + S * 0.3, cy - S * 0.3);
  ctx.stroke();
  ctx.fillStyle = '#ccbb99';
  ctx.beginPath();
  ctx.arc(cx + S * 0.3, cy - S * 0.32, S * 0.04, 0, Math.PI * 2);
  ctx.fill();
};

drawFuncs.raider_warlord = (ctx, S, bg) => {
  drawBg(ctx, S, bg);
  bossAura(ctx, S, '#ff4400');
  const cx = S / 2, cy = S * 0.5;
  // massive armoured figure
  ctx.fillStyle = bodyGrad(ctx, S, '#6a4030', '#2a1a0a');
  ctx.beginPath();
  ctx.ellipse(cx, cy + S * 0.02, S * 0.24, S * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  // shoulder pauldrons
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#5a3a2a';
    ctx.beginPath();
    ctx.ellipse(cx + side * S * 0.22, cy - S * 0.15, S * 0.08, S * 0.06, side * 0.3, 0, Math.PI * 2);
    ctx.fill();
    // spikes on pauldrons
    for (let i = 0; i < 3; i++) {
      drawHorn(ctx, cx + side * S * 0.22 + (i - 1) * S * 0.04, cy - S * 0.2, S * 0.06, -Math.PI / 2, '#8a6a4a');
    }
  }
  // head with war helmet
  ctx.fillStyle = '#5a4030';
  ctx.beginPath();
  ctx.arc(cx, cy - S * 0.25, S * 0.1, 0, Math.PI * 2);
  ctx.fill();
  // helmet ridge
  ctx.fillStyle = '#7a5a40';
  ctx.beginPath();
  ctx.moveTo(cx - S * 0.04, cy - S * 0.36);
  ctx.lineTo(cx, cy - S * 0.4);
  ctx.lineTo(cx + S * 0.04, cy - S * 0.36);
  ctx.lineTo(cx + S * 0.06, cy - S * 0.2);
  ctx.lineTo(cx - S * 0.06, cy - S * 0.2);
  ctx.closePath();
  ctx.fill();
  // visor glow
  ctx.fillStyle = alpha('#ff2200', 0.8);
  ctx.beginPath();
  ctx.ellipse(cx, cy - S * 0.26, S * 0.07, S * 0.02, 0, 0, Math.PI * 2);
  ctx.fill();
  // massive axe
  ctx.strokeStyle = '#8a7a6a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx + S * 0.2, cy);
  ctx.lineTo(cx + S * 0.38, cy - S * 0.35);
  ctx.stroke();
  // axe head
  ctx.fillStyle = '#aaa';
  ctx.beginPath();
  ctx.moveTo(cx + S * 0.35, cy - S * 0.35);
  ctx.bezierCurveTo(cx + S * 0.42, cy - S * 0.4, cx + S * 0.45, cy - S * 0.32, cx + S * 0.4, cy - S * 0.28);
  ctx.lineTo(cx + S * 0.35, cy - S * 0.35);
  ctx.fill();
  // legs
  drawLegs(ctx, cx, cy + S * 0.28, S * 0.12, S * 0.14, '#4a2a1a');
  bossFrame(ctx, S, '#CC2200');
  bossBadge(ctx, S);
};

// ── ZONE 5 ───────────────────────────────────────────

drawFuncs.turret_array = (ctx, S, bg) => {
  drawBg(ctx, S, bg);
  const cx = S / 2, cy = S * 0.55;
  // base platform
  ctx.fillStyle = '#3a4050';
  roundRect(ctx, cx - S * 0.25, cy + S * 0.1, S * 0.5, S * 0.12, 4);
  ctx.fill();
  // tripod legs
  ctx.strokeStyle = '#4a5060';
  ctx.lineWidth = 3;
  for (const ox of [-0.2, 0, 0.2]) {
    ctx.beginPath();
    ctx.moveTo(cx + ox * S, cy + S * 0.22);
    ctx.lineTo(cx + ox * S * 1.3, cy + S * 0.38);
    ctx.stroke();
  }
  // rotating turret body
  ctx.fillStyle = '#4a5565';
  ctx.beginPath();
  ctx.arc(cx, cy, S * 0.15, 0, Math.PI * 2);
  ctx.fill();
  // gun barrels (3)
  for (let i = -1; i <= 1; i++) {
    ctx.fillStyle = '#3a4050';
    const bx = cx + i * S * 0.06;
    ctx.fillRect(bx - S * 0.015, cy - S * 0.35, S * 0.03, S * 0.22);
    // muzzle flash hint
    const mg = ctx.createRadialGradient(bx, cy - S * 0.36, 0, bx, cy - S * 0.36, S * 0.03);
    mg.addColorStop(0, alpha('#ff4400', 0.5));
    mg.addColorStop(1, 'transparent');
    ctx.fillStyle = mg;
    ctx.beginPath();
    ctx.arc(bx, cy - S * 0.36, S * 0.03, 0, Math.PI * 2);
    ctx.fill();
  }
  // sensor
  glowEye(ctx, cx, cy, S * 0.04, '#ff0000');
  rivets(ctx, cx - S * 0.12, cy - S * 0.08, S * 0.24, S * 0.16, '#6a7080');
};

drawFuncs.bio_soldier = (ctx, S, bg) => {
  drawBg(ctx, S, bg);
  const cx = S / 2, cy = S * 0.5;
  // armoured humanoid
  ctx.fillStyle = bodyGrad(ctx, S, '#3a5060', '#1a2a30');
  ctx.beginPath();
  ctx.ellipse(cx, cy + S * 0.02, S * 0.16, S * 0.24, 0, 0, Math.PI * 2);
  ctx.fill();
  // tactical vest
  ctx.fillStyle = '#2a4050';
  roundRect(ctx, cx - S * 0.14, cy - S * 0.12, S * 0.28, S * 0.2, 4);
  ctx.fill();
  // helmet
  ctx.fillStyle = '#3a5060';
  ctx.beginPath();
  ctx.arc(cx, cy - S * 0.22, S * 0.1, 0, Math.PI * 2);
  ctx.fill();
  // visor
  ctx.fillStyle = alpha('#44aaff', 0.7);
  ctx.beginPath();
  ctx.ellipse(cx, cy - S * 0.22, S * 0.08, S * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();
  // bio-organic arm (mutated)
  ctx.strokeStyle = '#5a4a5a';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(cx - S * 0.16, cy - S * 0.05);
  ctx.quadraticCurveTo(cx - S * 0.28, cy + S * 0.05, cx - S * 0.25, cy + S * 0.2);
  ctx.stroke();
  // normal arm with gun
  ctx.strokeStyle = '#3a5060';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx + S * 0.16, cy - S * 0.05);
  ctx.lineTo(cx + S * 0.22, cy + S * 0.08);
  ctx.stroke();
  ctx.fillStyle = '#2a2a30';
  ctx.fillRect(cx + S * 0.18, cy + S * 0.04, S * 0.15, S * 0.03);
  // mutation veins on arm
  ctx.strokeStyle = alpha('#ff44aa', 0.4);
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(cx - S * 0.2, cy + i * S * 0.06);
    ctx.quadraticCurveTo(cx - S * 0.25 - S * 0.02, cy + i * S * 0.06 + S * 0.04, cx - S * 0.24, cy + i * S * 0.06 + S * 0.08);
    ctx.stroke();
  }
  // legs
  drawLegs(ctx, cx, cy + S * 0.24, S * 0.08, S * 0.16, '#2a3a40');
  pustules(ctx, cx - S * 0.22, cy + S * 0.1, 3, S * 0.06, S * 0.02, '#aa44aa');
};

drawFuncs.escaped_experiment = (ctx, S, bg) => {
  drawBg(ctx, S, bg);
  const cx = S / 2, cy = S * 0.5;
  // deformed multi-limbed creature
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, S * 0.3);
  g.addColorStop(0, '#7a5a7a');
  g.addColorStop(0.5, '#4a2a4a');
  g.addColorStop(1, '#2a1a2a');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(cx, cy, S * 0.2, S * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  // extra limbs (6 tentacle-arms)
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    tentacle(ctx, cx + Math.cos(a) * S * 0.18, cy + Math.sin(a) * S * 0.2, S * 0.18, a, '#6a3a6a', 3);
  }
  // multiple eyes (5)
  const eyePositions = [[0, -0.12], [-0.08, -0.05], [0.08, -0.05], [-0.05, 0.06], [0.05, 0.06]];
  for (const [ex, ey] of eyePositions) {
    glowEye(ctx, cx + ex * S, cy + ey * S, S * 0.025, '#ff44ff');
  }
  // containment collar (broken)
  ctx.strokeStyle = '#8a8a8a';
  ctx.lineWidth = 3;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.arc(cx, cy, S * 0.23, 0, Math.PI * 1.5);
  ctx.stroke();
  ctx.setLineDash([]);
  // sparks from broken collar
  ctx.strokeStyle = '#ffff44';
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const sx = cx + S * 0.22 + Math.random() * S * 0.05;
    const sy = cy - S * 0.05 + Math.random() * S * 0.1;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + S * 0.04, sy + S * 0.02);
    ctx.stroke();
  }
};

drawFuncs.military_hazard = (ctx, S, bg) => {
  drawBg(ctx, S, bg);
  const cx = S / 2, cy = S * 0.5;
  // floating mine-like sphere with spikes
  spikyCircle(ctx, cx, cy, S * 0.2, 12, S * 0.06, '#4a5565');
  // inner sphere gradient
  const mg = ctx.createRadialGradient(cx - S * 0.04, cy - S * 0.04, 0, cx, cy, S * 0.15);
  mg.addColorStop(0, '#6a7585');
  mg.addColorStop(1, '#3a4555');
  ctx.fillStyle = mg;
  ctx.beginPath();
  ctx.arc(cx, cy, S * 0.15, 0, Math.PI * 2);
  ctx.fill();
  // hazard symbol
  ctx.strokeStyle = '#ffaa00';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - S * 0.06);
  ctx.lineTo(cx - S * 0.05, cy + S * 0.04);
  ctx.lineTo(cx + S * 0.05, cy + S * 0.04);
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = '#ffaa00';
  ctx.font = `bold ${S * 0.06}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('!', cx, cy + S * 0.01);
  // pulsing danger glow
  const dg = ctx.createRadialGradient(cx, cy, S * 0.15, cx, cy, S * 0.35);
  dg.addColorStop(0, alpha('#ff4400', 0.15));
  dg.addColorStop(1, 'transparent');
  ctx.fillStyle = dg;
  ctx.beginPath();
  ctx.arc(cx, cy, S * 0.35, 0, Math.PI * 2);
  ctx.fill();
  // antenna
  ctx.strokeStyle = '#6a7585';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy - S * 0.2);
  ctx.lineTo(cx, cy - S * 0.35);
  ctx.stroke();
  ctx.fillStyle = '#ff0000';
  ctx.beginPath();
  ctx.arc(cx, cy - S * 0.35, S * 0.02, 0, Math.PI * 2);
  ctx.fill();
};

drawFuncs.commander_mech = (ctx, S, bg) => {
  drawBg(ctx, S, bg);
  bossAura(ctx, S, '#4488FF');
  const cx = S / 2, cy = S * 0.48;
  // massive bipedal mech
  // torso
  ctx.fillStyle = '#3a4a5a';
  roundRect(ctx, cx - S * 0.18, cy - S * 0.15, S * 0.36, S * 0.3, 6);
  ctx.fill();
  // chest plate detail
  ctx.fillStyle = '#4a5a6a';
  roundRect(ctx, cx - S * 0.14, cy - S * 0.1, S * 0.28, S * 0.12, 4);
  ctx.fill();
  // cockpit head
  ctx.fillStyle = '#2a3a4a';
  roundRect(ctx, cx - S * 0.08, cy - S * 0.28, S * 0.16, S * 0.14, 4);
  ctx.fill();
  // visor
  ctx.fillStyle = alpha('#4488ff', 0.8);
  ctx.beginPath();
  ctx.ellipse(cx, cy - S * 0.22, S * 0.06, S * 0.025, 0, 0, Math.PI * 2);
  ctx.fill();
  // shoulder cannons
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#4a5a6a';
    ctx.beginPath();
    ctx.arc(cx + side * S * 0.22, cy - S * 0.12, S * 0.06, 0, Math.PI * 2);
    ctx.fill();
    // barrel
    ctx.fillStyle = '#3a4a5a';
    ctx.fillRect(cx + side * S * 0.19, cy - S * 0.3, S * 0.06, S * 0.14);
    // muzzle glow
    const fg = ctx.createRadialGradient(cx + side * S * 0.22, cy - S * 0.31, 0, cx + side * S * 0.22, cy - S * 0.31, S * 0.04);
    fg.addColorStop(0, alpha('#4488ff', 0.6));
    fg.addColorStop(1, 'transparent');
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.arc(cx + side * S * 0.22, cy - S * 0.31, S * 0.04, 0, Math.PI * 2);
    ctx.fill();
  }
  // arms (heavy)
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#3a4a5a';
    ctx.fillRect(cx + side * S * 0.18 - S * 0.03, cy - S * 0.08, S * 0.06, S * 0.22);
    // fist
    ctx.fillStyle = '#4a5a6a';
    ctx.beginPath();
    ctx.arc(cx + side * S * 0.18, cy + S * 0.16, S * 0.05, 0, Math.PI * 2);
    ctx.fill();
  }
  // legs (thick)
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#3a4a5a';
    ctx.fillRect(cx + side * S * 0.1 - S * 0.04, cy + S * 0.15, S * 0.08, S * 0.2);
    // foot
    ctx.fillStyle = '#4a5a6a';
    roundRect(ctx, cx + side * S * 0.1 - S * 0.06, cy + S * 0.34, S * 0.12, S * 0.05, 3);
    ctx.fill();
  }
  rivets(ctx, cx - S * 0.16, cy - S * 0.13, S * 0.32, S * 0.28, '#6a7a8a');
  glowEye(ctx, cx, cy - S * 0.22, S * 0.03, '#4488ff');
  bossFrame(ctx, S, '#4488FF');
  bossBadge(ctx, S);
};

// ── ZONE 6 ───────────────────────────────────────────

drawFuncs.radiation_elemental = (ctx, S, bg) => {
  drawBg(ctx, S, bg);
  const cx = S / 2, cy = S * 0.5;
  // swirling energy form
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, S * 0.32);
  g.addColorStop(0, '#ffff44');
  g.addColorStop(0.3, '#aaff00');
  g.addColorStop(0.7, '#44aa00');
  g.addColorStop(1, alpha('#228800', 0.3));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, S * 0.28, 0, Math.PI * 2);
  ctx.fill();
  // inner core
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, cy, S * 0.06, 0, Math.PI * 2);
  ctx.fill();
  // radiation arcs
  ctx.strokeStyle = alpha('#ffff00', 0.6);
  ctx.lineWidth = 2;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * S * 0.08, cy + Math.sin(a) * S * 0.08);
    const ca = a + 0.5;
    ctx.bezierCurveTo(
      cx + Math.cos(ca) * S * 0.18, cy + Math.sin(ca) * S * 0.18,
      cx + Math.cos(a) * S * 0.25, cy + Math.sin(a) * S * 0.2,
      cx + Math.cos(a + 0.2) * S * 0.3, cy + Math.sin(a + 0.2) * S * 0.3
    );
    ctx.stroke();
  }
  // trefoil radiation symbol silhouette
  ctx.fillStyle = alpha('#000000', 0.3);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * S * 0.08, cy + Math.sin(a) * S * 0.08, S * 0.06, 0, Math.PI * 2);
    ctx.fill();
  }
  // face suggestion
  glowEye(ctx, cx - S * 0.06, cy - S * 0.04, S * 0.03, '#ffffff');
  glowEye(ctx, cx + S * 0.06, cy - S * 0.04, S * 0.03, '#ffffff');
};

drawFuncs.mutant_abomination = (ctx, S, bg) => {
  drawBg(ctx, S, bg);
  const cx = S / 2, cy = S * 0.5;
  // massive misshapen body
  ctx.fillStyle = bodyGrad(ctx, S, '#6a3a3a', '#3a1a1a');
  ctx.beginPath();
  ctx.moveTo(cx - S * 0.28, cy + S * 0.2);
  ctx.bezierCurveTo(cx - S * 0.35, cy - S * 0.1, cx - S * 0.1, cy - S * 0.32, cx + S * 0.05, cy - S * 0.28);
  ctx.bezierCurveTo(cx + S * 0.3, cy - S * 0.2, cx + S * 0.35, cy + S * 0.1, cx + S * 0.25, cy + S * 0.25);
  ctx.quadraticCurveTo(cx, cy + S * 0.35, cx - S * 0.28, cy + S * 0.2);
  ctx.fill();
  // multiple heads / faces
  for (const [hx, hy, r] of [[0, -0.2, 0.08], [-0.15, -0.1, 0.06], [0.12, -0.15, 0.07]]) {
    ctx.fillStyle = '#5a2a2a';
    ctx.beginPath();
    ctx.arc(cx + hx * S, cy + hy * S, r * S, 0, Math.PI * 2);
    ctx.fill();
    glowEye(ctx, cx + hx * S - r * S * 0.3, cy + hy * S, r * S * 0.35, '#ff0044');
    glowEye(ctx, cx + hx * S + r * S * 0.3, cy + hy * S, r * S * 0.35, '#ff0044');
  }
  // tentacles and extra limbs
  for (let i = 0; i < 5; i++) {
    const a = 0.5 + i * 1.0;
    tentacle(ctx, cx + Math.cos(a) * S * 0.2, cy + Math.sin(a) * S * 0.22, S * 0.16, a + 0.3, '#5a2a2a', 4);
  }
  pustules(ctx, cx, cy + S * 0.05, 8, S * 0.2, S * 0.03, '#aa3344');
};

drawFuncs.fusion_golem = (ctx, S, bg) => {
  drawBg(ctx, S, bg);
  const cx = S / 2, cy = S * 0.5;
  // rocky angular body with glowing cracks
  ctx.fillStyle = '#4a4040';
  ctx.beginPath();
  ctx.moveTo(cx - S * 0.2, cy - S * 0.2);
  ctx.lineTo(cx + S * 0.2, cy - S * 0.22);
  ctx.lineTo(cx + S * 0.24, cy + S * 0.15);
  ctx.lineTo(cx + S * 0.15, cy + S * 0.28);
  ctx.lineTo(cx - S * 0.15, cy + S * 0.28);
  ctx.lineTo(cx - S * 0.24, cy + S * 0.15);
  ctx.closePath();
  ctx.fill();
  // head
  ctx.fillStyle = '#5a5050';
  ctx.beginPath();
  ctx.moveTo(cx - S * 0.08, cy - S * 0.2);
  ctx.lineTo(cx, cy - S * 0.32);
  ctx.lineTo(cx + S * 0.08, cy - S * 0.2);
  ctx.closePath();
  ctx.fill();
  // glowing energy cracks
  ctx.strokeStyle = '#ff6600';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#ff6600';
  ctx.shadowBlur = 6;
  const cracks = [
    [[cx - S * 0.15, cy - S * 0.15], [cx - S * 0.05, cy], [cx - S * 0.1, cy + S * 0.15]],
    [[cx + S * 0.12, cy - S * 0.1], [cx + S * 0.05, cy + S * 0.05], [cx + S * 0.15, cy + S * 0.2]],
    [[cx - S * 0.02, cy - S * 0.18], [cx + S * 0.02, cy - S * 0.05]],
  ];
  for (const crack of cracks) {
    ctx.beginPath();
    ctx.moveTo(crack[0][0], crack[0][1]);
    for (let i = 1; i < crack.length; i++) {
      ctx.lineTo(crack[i][0], crack[i][1]);
    }
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
  // arms
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#4a4040';
    ctx.fillRect(cx + side * S * 0.24 - S * 0.03, cy - S * 0.1, S * 0.06, S * 0.22);
    // fist
    ctx.beginPath();
    ctx.arc(cx + side * S * 0.24, cy + S * 0.14, S * 0.05, 0, Math.PI * 2);
    ctx.fill();
  }
  // eyes
  glowEye(ctx, cx - S * 0.04, cy - S * 0.26, S * 0.025, '#ff8800');
  glowEye(ctx, cx + S * 0.04, cy - S * 0.26, S * 0.025, '#ff8800');
  // legs
  drawLegs(ctx, cx, cy + S * 0.28, S * 0.1, S * 0.12, '#3a3030');
};

drawFuncs.core_abomination = (ctx, S, bg) => {
  drawBg(ctx, S, bg);
  const cx = S / 2, cy = S * 0.5;
  // central mass with radiation
  const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, S * 0.35);
  rg.addColorStop(0, alpha('#ff4444', 0.3));
  rg.addColorStop(1, 'transparent');
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, S, S);
  // amorphous horror
  ctx.fillStyle = bodyGrad(ctx, S, '#5a2020', '#2a0808');
  ctx.beginPath();
  for (let i = 0; i <= 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    const r = S * 0.2 + Math.sin(i * 3.7) * S * 0.06;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  // many eyes
  const eyes = [[0, -0.1], [-0.1, 0], [0.1, 0], [0, 0.08], [-0.08, -0.06], [0.08, -0.06], [0, 0.02]];
  for (const [ex, ey] of eyes) {
    glowEye(ctx, cx + ex * S, cy + ey * S, S * 0.02, '#ff2222');
  }
  // grasping appendages
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    tentacle(ctx, cx + Math.cos(a) * S * 0.22, cy + Math.sin(a) * S * 0.22, S * 0.14, a, '#4a1818', 3);
  }
  // central maw
  ctx.fillStyle = '#100000';
  ctx.beginPath();
  ctx.ellipse(cx, cy + S * 0.15, S * 0.08, S * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();
  teeth(ctx, cx - S * 0.08, cy + S * 0.13, S * 0.16, 7, S * 0.03, '#aa4444');
};

drawFuncs.the_source = (ctx, S, bg) => {
  drawBg(ctx, S, bg);
  bossAura(ctx, S, '#44ff44');
  const cx = S / 2, cy = S * 0.5;
  // massive pulsing energy core
  const rg1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, S * 0.35);
  rg1.addColorStop(0, '#ffffff');
  rg1.addColorStop(0.15, '#ffff44');
  rg1.addColorStop(0.4, '#ff6600');
  rg1.addColorStop(0.7, '#aa2200');
  rg1.addColorStop(1, alpha('#440000', 0.5));
  ctx.fillStyle = rg1;
  ctx.beginPath();
  ctx.arc(cx, cy, S * 0.3, 0, Math.PI * 2);
  ctx.fill();
  // energy tendrils
  ctx.strokeStyle = alpha('#ffaa00', 0.6);
  ctx.lineWidth = 3;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * S * 0.15, cy + Math.sin(a) * S * 0.15);
    ctx.bezierCurveTo(
      cx + Math.cos(a + 0.3) * S * 0.25, cy + Math.sin(a + 0.3) * S * 0.25,
      cx + Math.cos(a - 0.2) * S * 0.35, cy + Math.sin(a - 0.2) * S * 0.35,
      cx + Math.cos(a) * S * 0.42, cy + Math.sin(a) * S * 0.42
    );
    ctx.stroke();
  }
  // face in the core
  glowEye(ctx, cx - S * 0.06, cy - S * 0.04, S * 0.04, '#ffffff');
  glowEye(ctx, cx + S * 0.06, cy - S * 0.04, S * 0.04, '#ffffff');
  // mouth
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy + S * 0.06, S * 0.06, 0, Math.PI);
  ctx.stroke();
  bossFrame(ctx, S, '#44FF44');
  bossBadge(ctx, S);
};

// ── ZONE 7 ───────────────────────────────────────────

drawFuncs.phase_walker = (ctx, S, bg) => {
  drawBg(ctx, S, bg);
  const cx = S / 2, cy = S * 0.5;
  // ethereal shifting figure
  // ghost copies (fading)
  for (let g = 2; g >= 0; g--) {
    const ox = (g - 1) * S * 0.06;
    ctx.fillStyle = alpha('#8844cc', 0.15 + g * 0.1);
    ctx.beginPath();
    ctx.ellipse(cx + ox, cy, S * 0.12, S * 0.26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + ox, cy - S * 0.28, S * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }
  // main body
  ctx.fillStyle = bodyGrad(ctx, S, '#aa66ee', '#4a1a6a');
  ctx.beginPath();
  ctx.ellipse(cx, cy, S * 0.14, S * 0.26, 0, 0, Math.PI * 2);
  ctx.fill();
  // head
  ctx.fillStyle = '#8844cc';
  ctx.beginPath();
  ctx.arc(cx, cy - S * 0.28, S * 0.09, 0, Math.PI * 2);
  ctx.fill();
  // void eyes
  glowEye(ctx, cx - S * 0.04, cy - S * 0.3, S * 0.03, '#cc88ff');
  glowEye(ctx, cx + S * 0.04, cy - S * 0.3, S * 0.03, '#cc88ff');
  // phase distortion rings
  ctx.strokeStyle = alpha('#aa66ff', 0.3);
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, S * (0.2 + i * 0.06), S * (0.3 + i * 0.06), 0.2, 0, Math.PI * 2);
    ctx.stroke();
  }
};

drawFuncs.reality_breaker = (ctx, S, bg) => {
  drawBg(ctx, S, bg);
  const cx = S / 2, cy = S * 0.5;
  // geometric impossible shape
  ctx.strokeStyle = '#aa44ff';
  ctx.lineWidth = 3;
  // impossible triangle outline
  const triR = S * 0.25;
  for (let i = 0; i < 3; i++) {
    const a1 = (i / 3) * Math.PI * 2 - Math.PI / 2;
    const a2 = ((i + 1) / 3) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a1) * triR, cy + Math.sin(a1) * triR);
    ctx.lineTo(cx + Math.cos(a2) * triR, cy + Math.sin(a2) * triR);
    ctx.stroke();
  }
  // fill with fractal-like void
  const vg = ctx.createRadialGradient(cx, cy, 0, cx, cy, S * 0.2);
  vg.addColorStop(0, '#1a0a2a');
  vg.addColorStop(0.5, '#2a1a4a');
  vg.addColorStop(1, alpha('#4a2a6a', 0.5));
  ctx.fillStyle = vg;
  ctx.beginPath();
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(a) * triR * 0.8;
    const y = cy + Math.sin(a) * triR * 0.8;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  // reality crack lines
  ctx.strokeStyle = '#ff44ff';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 6; i++) {
    const a = Math.random() * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * S * 0.3, cy + Math.sin(a) * S * 0.3);
    ctx.stroke();
  }
  // central eye
  glowEye(ctx, cx, cy, S * 0.06, '#ff00ff');
  // floating fragments
  ctx.fillStyle = alpha('#aa44ff', 0.4);
  for (let i = 0; i < 6; i++) {
    const fx = cx + (Math.random() - 0.5) * S * 0.5;
    const fy = cy + (Math.random() - 0.5) * S * 0.5;
    ctx.beginPath();
    ctx.moveTo(fx, fy - S * 0.02);
    ctx.lineTo(fx + S * 0.015, fy);
    ctx.lineTo(fx, fy + S * 0.02);
    ctx.lineTo(fx - S * 0.015, fy);
    ctx.closePath();
    ctx.fill();
  }
};

drawFuncs.apocalypse_herald = (ctx, S, bg) => {
  drawBg(ctx, S, bg);
  const cx = S / 2, cy = S * 0.5;
  // winged demonic figure
  // dark wings spread wide
  ctx.fillStyle = alpha('#2a1a3a', 0.8);
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx, cy - S * 0.1);
    ctx.bezierCurveTo(cx + side * S * 0.15, cy - S * 0.35, cx + side * S * 0.4, cy - S * 0.3, cx + side * S * 0.45, cy - S * 0.15);
    ctx.bezierCurveTo(cx + side * S * 0.42, cy, cx + side * S * 0.25, cy + S * 0.05, cx, cy);
    ctx.fill();
    // wing membrane lines
    ctx.strokeStyle = alpha('#4a2a5a', 0.5);
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const t = (i + 1) / 5;
      ctx.beginPath();
      ctx.moveTo(cx, cy - S * 0.05);
      ctx.lineTo(cx + side * S * 0.42 * t, cy - S * 0.25 * t);
      ctx.stroke();
    }
  }
  // body
  ctx.fillStyle = bodyGrad(ctx, S, '#4a2a4a', '#1a0a1a');
  ctx.beginPath();
  ctx.ellipse(cx, cy + S * 0.05, S * 0.12, S * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  // head with horns
  ctx.fillStyle = '#3a1a3a';
  ctx.beginPath();
  ctx.arc(cx, cy - S * 0.2, S * 0.08, 0, Math.PI * 2);
  ctx.fill();
  // horns
  drawHorn(ctx, cx - S * 0.06, cy - S * 0.26, S * 0.12, -Math.PI / 2 - 0.4, '#5a3a4a');
  drawHorn(ctx, cx + S * 0.06, cy - S * 0.26, S * 0.12, -Math.PI / 2 + 0.4, '#5a3a4a');
  // burning eyes
  glowEye(ctx, cx - S * 0.04, cy - S * 0.22, S * 0.03, '#ff00ff');
  glowEye(ctx, cx + S * 0.04, cy - S * 0.22, S * 0.03, '#ff00ff');
  // void energy at hands
  for (const side of [-1, 1]) {
    const hx = cx + side * S * 0.15;
    const hy = cy + S * 0.15;
    const eg = ctx.createRadialGradient(hx, hy, 0, hx, hy, S * 0.06);
    eg.addColorStop(0, '#ff44ff');
    eg.addColorStop(1, 'transparent');
    ctx.fillStyle = eg;
    ctx.beginPath();
    ctx.arc(hx, hy, S * 0.06, 0, Math.PI * 2);
    ctx.fill();
  }
};

drawFuncs.void_entity = (ctx, S, bg) => {
  drawBg(ctx, S, bg);
  const cx = S / 2, cy = S * 0.5;
  // pure darkness with eyes
  const vg = ctx.createRadialGradient(cx, cy, S * 0.05, cx, cy, S * 0.35);
  vg.addColorStop(0, '#000000');
  vg.addColorStop(0.6, '#0a0518');
  vg.addColorStop(1, alpha('#1a0a30', 0.5));
  ctx.fillStyle = vg;
  ctx.beginPath();
  // irregular dark shape
  for (let i = 0; i <= 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const r = S * 0.25 + Math.sin(i * 2.3) * S * 0.08;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  // many faintly glowing eyes scattered
  const eyeData = [
    [0, -0.12, 0.03], [-0.1, -0.04, 0.025], [0.1, -0.04, 0.025],
    [-0.06, 0.06, 0.02], [0.06, 0.06, 0.02], [0, 0.14, 0.015],
    [-0.14, 0.02, 0.015], [0.14, 0.02, 0.015],
  ];
  for (const [ex, ey, er] of eyeData) {
    glowEye(ctx, cx + ex * S, cy + ey * S, er * S, '#aa00ff');
  }
  // void tendrils
  ctx.strokeStyle = alpha('#6600aa', 0.4);
  ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * S * 0.25, cy + Math.sin(a) * S * 0.25);
    ctx.bezierCurveTo(
      cx + Math.cos(a + 0.3) * S * 0.35, cy + Math.sin(a + 0.3) * S * 0.35,
      cx + Math.cos(a - 0.2) * S * 0.4, cy + Math.sin(a - 0.2) * S * 0.4,
      cx + Math.cos(a) * S * 0.45, cy + Math.sin(a) * S * 0.45
    );
    ctx.stroke();
  }
};

drawFuncs.the_cataclysm = (ctx, S, bg) => {
  drawBg(ctx, S, bg);
  bossAura(ctx, S, '#AA44FF');
  const cx = S / 2, cy = S * 0.48;
  // massive swirling void portal with entity emerging
  // portal ring
  ctx.strokeStyle = '#aa44ff';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(cx, cy, S * 0.3, S * 0.3, 0, 0, Math.PI * 2);
  ctx.stroke();
  // inner void
  const pg = ctx.createRadialGradient(cx, cy, 0, cx, cy, S * 0.28);
  pg.addColorStop(0, '#000000');
  pg.addColorStop(0.5, '#0a0020');
  pg.addColorStop(1, '#2a0a4a');
  ctx.fillStyle = pg;
  ctx.beginPath();
  ctx.arc(cx, cy, S * 0.28, 0, Math.PI * 2);
  ctx.fill();
  // spiral arms
  ctx.strokeStyle = alpha('#cc66ff', 0.5);
  ctx.lineWidth = 2;
  for (let arm = 0; arm < 4; arm++) {
    ctx.beginPath();
    for (let t = 0; t < 30; t++) {
      const a = arm * Math.PI / 2 + t * 0.15;
      const r = t * S * 0.008;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      if (t === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  // entity form emerging
  ctx.fillStyle = alpha('#4a1a6a', 0.7);
  ctx.beginPath();
  ctx.ellipse(cx, cy - S * 0.05, S * 0.12, S * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
  // crown of horns
  for (let i = 0; i < 5; i++) {
    const ha = -Math.PI / 2 + (i - 2) * 0.35;
    drawHorn(ctx, cx + Math.cos(ha) * S * 0.08, cy - S * 0.2 + Math.sin(ha) * S * 0.04, S * 0.1, ha - 0.3, '#6a2a8a');
  }
  // many eyes in the void
  const voidEyes = [
    [0, -0.1, 0.04], [-0.06, -0.02, 0.03], [0.06, -0.02, 0.03],
    [0, 0.06, 0.025], [-0.1, 0.08, 0.02], [0.1, 0.08, 0.02],
  ];
  for (const [ex, ey, er] of voidEyes) {
    glowEye(ctx, cx + ex * S, cy + ey * S, er * S, '#ff00ff');
  }
  // reality-breaking cracks extending beyond the portal
  ctx.strokeStyle = alpha('#ff44ff', 0.4);
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * S * 0.28, cy + Math.sin(a) * S * 0.28);
    ctx.lineTo(cx + Math.cos(a) * S * 0.42, cy + Math.sin(a) * S * 0.42);
    ctx.stroke();
  }
  bossFrame(ctx, S, '#AA44FF');
  bossBadge(ctx, S);
};

// ══════════════════════════════════════════════════════
//  MAIN GENERATION
// ══════════════════════════════════════════════════════

let count = 0;

for (const zone of zones) {
  console.log(`\n${zone.name} (bg ${zone.bg}):`);

  // Regular monsters
  for (const name of zone.monsters) {
    const { c, ctx, S } = make(REG);
    const fn = drawFuncs[name];
    if (!fn) {
      console.log(`  [SKIP] No draw function for "${name}"`);
      continue;
    }
    fn(ctx, S, zone.bg);
    save(c, name);
    console.log(`  [OK] ${name} (${REG}x${REG})`);
    count++;
  }

  // Boss
  const { c, ctx, S } = make(BOSS);
  const bfn = drawFuncs[zone.boss.name];
  if (!bfn) {
    console.log(`  [SKIP] No draw function for boss "${zone.boss.name}"`);
    continue;
  }
  bfn(ctx, S, zone.bg);
  save(c, zone.boss.name);
  console.log(`  [OK] ${zone.boss.name} (${BOSS}x${BOSS}) [BOSS]`);
  count++;
}

console.log(`\nDone! Generated ${count} monster icons in ${OUT_DIR}`);
