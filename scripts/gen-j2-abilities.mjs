/**
 * Job2 Ability Icon Generator — 72 icons at 128x128 PNG
 * Diamond-shaped frame with colored class glow, dark radial gradient backgrounds.
 * Smooth rendering via ctx.arc(), gradients, bezier curves.
 *
 * Run: node scripts/gen-j2-abilities.mjs
 */
import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

const SIZE = 128;
const CX = SIZE / 2;
const CY = SIZE / 2;
const OUT_DIR = path.resolve('public/assets/abilities-128');

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

function save(canvas, filename) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, `${filename}.png`), canvas.toBuffer('image/png'));
}

function hexToRgb(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

function rgb(r, g, b) { return `rgb(${r},${g},${b})`; }
function rgba(r, g, b, a) { return `rgba(${r},${g},${b},${a})`; }

function lighten(hex, amt) {
  const c = hexToRgb(hex);
  return rgb(Math.min(255, c.r + amt), Math.min(255, c.g + amt), Math.min(255, c.b + amt));
}

function darken(hex, amt) {
  const c = hexToRgb(hex);
  return rgb(Math.max(0, c.r - amt), Math.max(0, c.g - amt), Math.max(0, c.b - amt));
}

function glowColor(hex, alpha) {
  const c = hexToRgb(hex);
  return rgba(c.r, c.g, c.b, alpha);
}

// ──────────────────────────────────────────────
// BACKGROUND: dark radial gradient
// ──────────────────────────────────────────────

function drawBackground(ctx, bgHex) {
  const g = ctx.createRadialGradient(CX, CY, 5, CX, CY, 90);
  g.addColorStop(0, lighten(bgHex, 20));
  g.addColorStop(0.6, bgHex);
  g.addColorStop(1, darken(bgHex, 15));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SIZE, SIZE);
}

// ──────────────────────────────────────────────
// DIAMOND FRAME with outer glow
// ──────────────────────────────────────────────

function diamondPath(ctx, cx, cy, halfW, halfH) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - halfH);       // top
  ctx.lineTo(cx + halfW, cy);       // right
  ctx.lineTo(cx, cy + halfH);       // bottom
  ctx.lineTo(cx - halfW, cy);       // left
  ctx.closePath();
}

function drawDiamondFrame(ctx, glowHex) {
  const gc = hexToRgb(glowHex);
  // outer glow layers
  for (let i = 5; i >= 1; i--) {
    const s = 46 + i * 4;
    ctx.save();
    ctx.shadowColor = rgba(gc.r, gc.g, gc.b, 0.15 + i * 0.06);
    ctx.shadowBlur = 8 + i * 4;
    diamondPath(ctx, CX, CY, s, s);
    ctx.strokeStyle = glowColor(glowHex, 0.05);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  // diamond fill — dark translucent interior
  diamondPath(ctx, CX, CY, 44, 44);
  const ig = ctx.createRadialGradient(CX, CY, 5, CX, CY, 44);
  ig.addColorStop(0, 'rgba(30,30,40,0.6)');
  ig.addColorStop(1, 'rgba(10,10,15,0.85)');
  ctx.fillStyle = ig;
  ctx.fill();

  // diamond border — two layers for depth
  diamondPath(ctx, CX, CY, 44, 44);
  ctx.strokeStyle = glowColor(glowHex, 0.5);
  ctx.lineWidth = 2.5;
  ctx.stroke();

  diamondPath(ctx, CX, CY, 42, 42);
  ctx.strokeStyle = glowColor(glowHex, 0.2);
  ctx.lineWidth = 1;
  ctx.stroke();

  // corner accents — small dots at diamond vertices
  const dots = [
    [CX, CY - 44], [CX + 44, CY], [CX, CY + 44], [CX - 44, CY],
  ];
  for (const [dx, dy] of dots) {
    ctx.beginPath();
    ctx.arc(dx, dy, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = glowColor(glowHex, 0.7);
    ctx.fill();
  }
}

// ──────────────────────────────────────────────
// SYMBOL DRAWING HELPERS
// ──────────────────────────────────────────────

function setSymbolStyle(ctx, glowHex, lineW = 2.5) {
  ctx.strokeStyle = lighten(glowHex, 80);
  ctx.fillStyle = lighten(glowHex, 60);
  ctx.lineWidth = lineW;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
}

function drawCircle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

function drawStar(ctx, cx, cy, spikes, outerR, innerR) {
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = (Math.PI * i) / spikes - Math.PI / 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawTriangle(ctx, cx, cy, size, pointUp = true) {
  const h = size * 0.866;
  ctx.beginPath();
  if (pointUp) {
    ctx.moveTo(cx, cy - h * 0.6);
    ctx.lineTo(cx + size / 2, cy + h * 0.4);
    ctx.lineTo(cx - size / 2, cy + h * 0.4);
  } else {
    ctx.moveTo(cx, cy + h * 0.6);
    ctx.lineTo(cx + size / 2, cy - h * 0.4);
    ctx.lineTo(cx - size / 2, cy - h * 0.4);
  }
  ctx.closePath();
}

function drawArrow(ctx, x1, y1, x2, y2, headLen = 6) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(angle - 0.5), y2 - headLen * Math.sin(angle - 0.5));
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(angle + 0.5), y2 - headLen * Math.sin(angle + 0.5));
  ctx.stroke();
}

function drawShield(ctx, cx, cy, w, h) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - h / 2);
  ctx.quadraticCurveTo(cx + w / 2, cy - h / 2, cx + w / 2, cy - h / 6);
  ctx.quadraticCurveTo(cx + w / 2, cy + h / 3, cx, cy + h / 2);
  ctx.quadraticCurveTo(cx - w / 2, cy + h / 3, cx - w / 2, cy - h / 6);
  ctx.quadraticCurveTo(cx - w / 2, cy - h / 2, cx, cy - h / 2);
  ctx.closePath();
}

function drawLightning(ctx, cx, cy, s) {
  ctx.beginPath();
  ctx.moveTo(cx + 2, cy - s);
  ctx.lineTo(cx - 4, cy - 1);
  ctx.lineTo(cx + 1, cy);
  ctx.lineTo(cx - 3, cy + s);
  ctx.lineTo(cx + 4, cy + 1);
  ctx.lineTo(cx - 1, cy);
  ctx.closePath();
}

function drawCross(ctx, cx, cy, armW, armH) {
  ctx.beginPath();
  ctx.moveTo(cx - armW, cy - armH * 3);
  ctx.lineTo(cx + armW, cy - armH * 3);
  ctx.lineTo(cx + armW, cy - armW);
  ctx.lineTo(cx + armH * 3, cy - armW);
  ctx.lineTo(cx + armH * 3, cy + armW);
  ctx.lineTo(cx + armW, cy + armW);
  ctx.lineTo(cx + armW, cy + armH * 3);
  ctx.lineTo(cx - armW, cy + armH * 3);
  ctx.lineTo(cx - armW, cy + armW);
  ctx.lineTo(cx - armH * 3, cy + armW);
  ctx.lineTo(cx - armH * 3, cy - armW);
  ctx.lineTo(cx - armW, cy - armW);
  ctx.closePath();
}

function drawGear(ctx, cx, cy, outerR, innerR, teeth) {
  ctx.beginPath();
  for (let i = 0; i < teeth; i++) {
    const a1 = (Math.PI * 2 * i) / teeth;
    const a2 = (Math.PI * 2 * (i + 0.35)) / teeth;
    const a3 = (Math.PI * 2 * (i + 0.5)) / teeth;
    const a4 = (Math.PI * 2 * (i + 0.85)) / teeth;
    if (i === 0) ctx.moveTo(cx + Math.cos(a1) * innerR, cy + Math.sin(a1) * innerR);
    ctx.lineTo(cx + Math.cos(a2) * innerR, cy + Math.sin(a2) * innerR);
    ctx.lineTo(cx + Math.cos(a2) * outerR, cy + Math.sin(a2) * outerR);
    ctx.lineTo(cx + Math.cos(a3) * outerR, cy + Math.sin(a3) * outerR);
    ctx.lineTo(cx + Math.cos(a4) * innerR, cy + Math.sin(a4) * innerR);
  }
  ctx.closePath();
}

function drawFlame(ctx, cx, cy, w, h) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - h / 2);
  ctx.bezierCurveTo(cx + w * 0.6, cy - h * 0.3, cx + w * 0.5, cy + h * 0.1, cx + w * 0.2, cy + h * 0.3);
  ctx.quadraticCurveTo(cx + w * 0.05, cy + h * 0.5, cx, cy + h * 0.35);
  ctx.quadraticCurveTo(cx - w * 0.05, cy + h * 0.5, cx - w * 0.2, cy + h * 0.3);
  ctx.bezierCurveTo(cx - w * 0.5, cy + h * 0.1, cx - w * 0.6, cy - h * 0.3, cx, cy - h / 2);
  ctx.closePath();
}

function drawExplosion(ctx, cx, cy, r, spikes) {
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const rad = i % 2 === 0 ? r : r * 0.5;
    const angle = (Math.PI * i) / spikes - Math.PI / 2;
    const x = cx + Math.cos(angle) * rad;
    const y = cy + Math.sin(angle) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawWaves(ctx, cx, cy, count, radius, arcLen) {
  for (let i = 0; i < count; i++) {
    const r = radius + i * 5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, -arcLen / 2, arcLen / 2);
    ctx.stroke();
  }
}

function drawDrop(ctx, cx, cy, r) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - r * 1.4);
  ctx.bezierCurveTo(cx + r * 0.6, cy - r * 0.5, cx + r, cy + r * 0.2, cx, cy + r);
  ctx.bezierCurveTo(cx - r, cy + r * 0.2, cx - r * 0.6, cy - r * 0.5, cx, cy - r * 1.4);
  ctx.closePath();
}

// ──────────────────────────────────────────────
// SYMBOL DRAW FUNCTIONS — one per ability
// ──────────────────────────────────────────────

const SYMBOLS = {

  // === SENTINEL === (shield wall, defensive stance, taunt roar, counter-strike, fortress aura, last stand)
  sentinel_1(ctx, g) {  // shield wall
    setSymbolStyle(ctx, g);
    // Three overlapping shields
    for (let i = -1; i <= 1; i++) {
      drawShield(ctx, CX + i * 10, CY + Math.abs(i) * 3, 18, 22);
      ctx.stroke();
    }
  },
  sentinel_2(ctx, g) {  // defensive stance
    setSymbolStyle(ctx, g);
    // figure behind shield
    drawShield(ctx, CX, CY + 4, 26, 30);
    ctx.fillStyle = glowColor(g, 0.3);
    ctx.fill();
    ctx.stroke();
    // crossed arms above
    ctx.beginPath();
    ctx.moveTo(CX - 10, CY - 14);
    ctx.lineTo(CX + 10, CY - 6);
    ctx.moveTo(CX + 10, CY - 14);
    ctx.lineTo(CX - 10, CY - 6);
    ctx.stroke();
  },
  sentinel_3(ctx, g) {  // taunt roar
    setSymbolStyle(ctx, g);
    // open mouth / roar waves
    ctx.beginPath();
    ctx.arc(CX, CY, 10, 0.3, Math.PI - 0.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(CX, CY, 10, Math.PI + 0.3, -0.3);
    ctx.stroke();
    // sound waves
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(CX, CY, 10 + i * 6, -0.6, 0.6);
      ctx.stroke();
    }
  },
  sentinel_4(ctx, g) {  // counter-strike
    setSymbolStyle(ctx, g);
    drawShield(ctx, CX - 6, CY, 18, 22);
    ctx.stroke();
    // sword coming from behind
    ctx.beginPath();
    ctx.moveTo(CX + 4, CY - 18);
    ctx.lineTo(CX + 14, CY + 14);
    ctx.stroke();
    // blade edges
    ctx.beginPath();
    ctx.moveTo(CX + 10, CY + 10);
    ctx.lineTo(CX + 18, CY + 8);
    ctx.moveTo(CX + 10, CY + 10);
    ctx.lineTo(CX + 8, CY + 18);
    ctx.stroke();
  },
  sentinel_5(ctx, g) {  // fortress aura
    setSymbolStyle(ctx, g);
    // central tower
    ctx.fillStyle = glowColor(g, 0.3);
    ctx.fillRect(CX - 4, CY - 12, 8, 20);
    ctx.strokeRect(CX - 4, CY - 12, 8, 20);
    // battlements
    ctx.fillRect(CX - 10, CY - 8, 6, 14);
    ctx.strokeRect(CX - 10, CY - 8, 6, 14);
    ctx.fillRect(CX + 4, CY - 8, 6, 14);
    ctx.strokeRect(CX + 4, CY - 8, 6, 14);
    // aura rings
    ctx.setLineDash([3, 3]);
    drawCircle(ctx, CX, CY, 22);
    ctx.stroke();
    ctx.setLineDash([]);
  },
  sentinel_6(ctx, g) {  // last stand
    setSymbolStyle(ctx, g);
    drawShield(ctx, CX, CY, 22, 28);
    ctx.fillStyle = glowColor(g, 0.25);
    ctx.fill();
    ctx.stroke();
    // cross / emblem on shield
    ctx.beginPath();
    ctx.moveTo(CX, CY - 10);
    ctx.lineTo(CX, CY + 10);
    ctx.moveTo(CX - 8, CY - 2);
    ctx.lineTo(CX + 8, CY - 2);
    ctx.stroke();
    // cracks radiating outward
    ctx.lineWidth = 1.5;
    for (let a = 0; a < 6; a++) {
      const ang = (Math.PI * 2 * a) / 6;
      ctx.beginPath();
      ctx.moveTo(CX + Math.cos(ang) * 24, CY + Math.sin(ang) * 24);
      ctx.lineTo(CX + Math.cos(ang) * 30, CY + Math.sin(ang) * 30);
      ctx.stroke();
    }
  },

  // === BRUISER === (haymaker fist, ground pound, rage burst, body slam, iron skin, unstoppable charge)
  bruiser_1(ctx, g) {  // haymaker fist
    setSymbolStyle(ctx, g);
    // clenched fist
    ctx.beginPath();
    ctx.moveTo(CX - 8, CY + 10);
    ctx.quadraticCurveTo(CX - 12, CY - 2, CX - 6, CY - 10);
    ctx.lineTo(CX + 6, CY - 12);
    ctx.quadraticCurveTo(CX + 12, CY - 8, CX + 10, CY + 2);
    ctx.lineTo(CX + 8, CY + 10);
    ctx.closePath();
    ctx.fillStyle = glowColor(g, 0.3);
    ctx.fill();
    ctx.stroke();
    // knuckle lines
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.arc(CX + i * 5, CY - 10, 3, Math.PI, 0);
      ctx.stroke();
    }
    // impact lines
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) {
      const a = -0.8 + i * 0.4;
      ctx.beginPath();
      ctx.moveTo(CX + Math.cos(a) * 14, CY - 12 + Math.sin(a) * 6);
      ctx.lineTo(CX + Math.cos(a) * 20, CY - 14 + Math.sin(a) * 8);
      ctx.stroke();
    }
  },
  bruiser_2(ctx, g) {  // ground pound
    setSymbolStyle(ctx, g);
    // fist going down
    ctx.beginPath();
    ctx.moveTo(CX - 7, CY - 4);
    ctx.lineTo(CX - 7, CY - 14);
    ctx.quadraticCurveTo(CX, CY - 18, CX + 7, CY - 14);
    ctx.lineTo(CX + 7, CY - 4);
    ctx.closePath();
    ctx.fillStyle = glowColor(g, 0.3);
    ctx.fill();
    ctx.stroke();
    // ground crack lines
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(CX - 22, CY + 6);
    ctx.lineTo(CX + 22, CY + 6);
    ctx.stroke();
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(CX + i * 8, CY + 6);
      ctx.lineTo(CX + i * 12, CY + 16);
      ctx.stroke();
    }
  },
  bruiser_3(ctx, g) {  // rage burst
    setSymbolStyle(ctx, g);
    drawExplosion(ctx, CX, CY, 18, 8);
    ctx.fillStyle = glowColor(g, 0.25);
    ctx.fill();
    ctx.stroke();
    // inner rage symbol
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(CX - 5, CY - 5);
    ctx.lineTo(CX + 5, CY + 5);
    ctx.moveTo(CX + 5, CY - 5);
    ctx.lineTo(CX - 5, CY + 5);
    ctx.stroke();
  },
  bruiser_4(ctx, g) {  // body slam
    setSymbolStyle(ctx, g);
    // body arc
    ctx.beginPath();
    ctx.arc(CX, CY - 8, 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(CX, CY - 2);
    ctx.quadraticCurveTo(CX + 14, CY + 4, CX + 8, CY + 14);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(CX, CY - 2);
    ctx.quadraticCurveTo(CX - 14, CY + 4, CX - 8, CY + 14);
    ctx.stroke();
    // impact at bottom
    ctx.beginPath();
    ctx.moveTo(CX - 16, CY + 14);
    ctx.lineTo(CX + 16, CY + 14);
    ctx.stroke();
    drawExplosion(ctx, CX, CY + 14, 8, 5);
    ctx.stroke();
  },
  bruiser_5(ctx, g) {  // iron skin
    setSymbolStyle(ctx, g);
    // body outline with plate segments
    ctx.beginPath();
    ctx.arc(CX, CY - 8, 7, 0, Math.PI * 2);
    ctx.stroke();
    // torso plates
    ctx.beginPath();
    ctx.moveTo(CX - 10, CY);
    ctx.lineTo(CX - 12, CY + 14);
    ctx.lineTo(CX + 12, CY + 14);
    ctx.lineTo(CX + 10, CY);
    ctx.closePath();
    ctx.fillStyle = glowColor(g, 0.2);
    ctx.fill();
    ctx.stroke();
    // plate rivets
    for (const [px, py] of [[CX - 6, CY + 4], [CX + 6, CY + 4], [CX, CY + 10]]) {
      ctx.beginPath();
      ctx.arc(px, py, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  bruiser_6(ctx, g) {  // unstoppable charge
    setSymbolStyle(ctx, g);
    // charging figure with motion lines
    drawTriangle(ctx, CX + 4, CY, 22, true);
    ctx.fillStyle = glowColor(g, 0.25);
    ctx.fill();
    ctx.stroke();
    // motion lines behind
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(CX - 16, CY - 8 + i * 5);
      ctx.lineTo(CX - 24, CY - 8 + i * 5);
      ctx.stroke();
    }
  },

  // === CRUSHER === (overhead smash, earthquake stomp, spinning maul, armor break, titan's grip, cataclysm)
  crusher_1(ctx, g) {  // overhead smash
    setSymbolStyle(ctx, g);
    // hammer head
    ctx.fillStyle = glowColor(g, 0.3);
    ctx.fillRect(CX - 12, CY - 16, 24, 10);
    ctx.strokeRect(CX - 12, CY - 16, 24, 10);
    // handle
    ctx.beginPath();
    ctx.moveTo(CX, CY - 6);
    ctx.lineTo(CX, CY + 16);
    ctx.lineWidth = 3;
    ctx.stroke();
    // impact sparks
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      const a = -0.8 + i * 0.8;
      ctx.beginPath();
      ctx.moveTo(CX + Math.cos(a) * 14, CY - 18 + Math.sin(a) * 4);
      ctx.lineTo(CX + Math.cos(a) * 20, CY - 22 + Math.sin(a) * 6);
      ctx.stroke();
    }
  },
  crusher_2(ctx, g) {  // earthquake stomp
    setSymbolStyle(ctx, g);
    // boot shape
    ctx.beginPath();
    ctx.moveTo(CX - 6, CY - 14);
    ctx.lineTo(CX - 6, CY + 2);
    ctx.lineTo(CX - 12, CY + 4);
    ctx.lineTo(CX - 12, CY + 8);
    ctx.lineTo(CX + 10, CY + 8);
    ctx.lineTo(CX + 10, CY + 2);
    ctx.lineTo(CX + 6, CY - 14);
    ctx.closePath();
    ctx.fillStyle = glowColor(g, 0.25);
    ctx.fill();
    ctx.stroke();
    // crack lines below
    ctx.lineWidth = 1.5;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(CX + i * 5, CY + 8);
      ctx.lineTo(CX + i * 7, CY + 16);
      ctx.stroke();
    }
  },
  crusher_3(ctx, g) {  // spinning maul
    setSymbolStyle(ctx, g);
    // spinning motion arc
    ctx.beginPath();
    ctx.arc(CX, CY, 16, 0, Math.PI * 1.5);
    ctx.stroke();
    // arrowhead at end
    drawArrow(ctx, CX, CY - 16, CX + 5, CY - 14, 5);
    // maul head
    ctx.fillStyle = glowColor(g, 0.3);
    ctx.fillRect(CX - 4, CY - 6, 8, 12);
    ctx.strokeRect(CX - 4, CY - 6, 8, 12);
  },
  crusher_4(ctx, g) {  // armor break
    setSymbolStyle(ctx, g);
    // broken armor pieces
    ctx.beginPath();
    ctx.moveTo(CX - 2, CY - 16);
    ctx.lineTo(CX - 14, CY);
    ctx.lineTo(CX - 6, CY + 14);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(CX + 2, CY - 16);
    ctx.lineTo(CX + 14, CY);
    ctx.lineTo(CX + 6, CY + 14);
    ctx.stroke();
    // crack in middle
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(CX, CY - 10);
    ctx.lineTo(CX - 2, CY - 4);
    ctx.lineTo(CX + 2, CY + 2);
    ctx.lineTo(CX - 1, CY + 8);
    ctx.stroke();
  },
  crusher_5(ctx, g) {  // titan's grip
    setSymbolStyle(ctx, g);
    // oversized gauntlet
    ctx.beginPath();
    ctx.moveTo(CX - 12, CY + 12);
    ctx.quadraticCurveTo(CX - 16, CY - 4, CX - 8, CY - 14);
    ctx.lineTo(CX + 8, CY - 14);
    ctx.quadraticCurveTo(CX + 16, CY - 4, CX + 12, CY + 12);
    ctx.closePath();
    ctx.fillStyle = glowColor(g, 0.25);
    ctx.fill();
    ctx.stroke();
    // finger segments
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(CX + i * 6, CY - 14);
      ctx.lineTo(CX + i * 6, CY - 6);
      ctx.stroke();
    }
  },
  crusher_6(ctx, g) {  // cataclysm
    setSymbolStyle(ctx, g);
    drawExplosion(ctx, CX, CY, 22, 10);
    ctx.fillStyle = glowColor(g, 0.2);
    ctx.fill();
    ctx.stroke();
    // inner explosion
    drawExplosion(ctx, CX, CY, 12, 6);
    ctx.fillStyle = glowColor(g, 0.35);
    ctx.fill();
    ctx.stroke();
  },

  // === SNIPER === (aimed shot crosshair, camouflage eye, piercing round, headshot, spotter mark, kill zone)
  sniper_1(ctx, g) {  // aimed shot crosshair
    setSymbolStyle(ctx, g);
    drawCircle(ctx, CX, CY, 14);
    ctx.stroke();
    drawCircle(ctx, CX, CY, 6);
    ctx.stroke();
    // crosshairs
    ctx.beginPath();
    ctx.moveTo(CX, CY - 20);
    ctx.lineTo(CX, CY - 8);
    ctx.moveTo(CX, CY + 8);
    ctx.lineTo(CX, CY + 20);
    ctx.moveTo(CX - 20, CY);
    ctx.lineTo(CX - 8, CY);
    ctx.moveTo(CX + 8, CY);
    ctx.lineTo(CX + 20, CY);
    ctx.stroke();
    // center dot
    ctx.beginPath();
    ctx.arc(CX, CY, 2, 0, Math.PI * 2);
    ctx.fill();
  },
  sniper_2(ctx, g) {  // camouflage eye
    setSymbolStyle(ctx, g);
    // eye shape
    ctx.beginPath();
    ctx.moveTo(CX - 18, CY);
    ctx.quadraticCurveTo(CX, CY - 14, CX + 18, CY);
    ctx.quadraticCurveTo(CX, CY + 14, CX - 18, CY);
    ctx.closePath();
    ctx.fillStyle = glowColor(g, 0.15);
    ctx.fill();
    ctx.stroke();
    // iris
    drawCircle(ctx, CX, CY, 6);
    ctx.fillStyle = glowColor(g, 0.4);
    ctx.fill();
    ctx.stroke();
    // pupil
    ctx.beginPath();
    ctx.arc(CX, CY, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = lighten(g, 80);
    ctx.fill();
  },
  sniper_3(ctx, g) {  // piercing round
    setSymbolStyle(ctx, g);
    // bullet shape
    ctx.beginPath();
    ctx.moveTo(CX + 16, CY);
    ctx.quadraticCurveTo(CX + 10, CY - 4, CX - 4, CY - 4);
    ctx.lineTo(CX - 14, CY - 4);
    ctx.lineTo(CX - 14, CY + 4);
    ctx.lineTo(CX - 4, CY + 4);
    ctx.quadraticCurveTo(CX + 10, CY + 4, CX + 16, CY);
    ctx.closePath();
    ctx.fillStyle = glowColor(g, 0.35);
    ctx.fill();
    ctx.stroke();
    // motion lines
    ctx.lineWidth = 1.5;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(CX - 16, CY + i * 6);
      ctx.lineTo(CX - 24, CY + i * 6);
      ctx.stroke();
    }
  },
  sniper_4(ctx, g) {  // headshot
    setSymbolStyle(ctx, g);
    // head circle
    drawCircle(ctx, CX, CY, 12);
    ctx.stroke();
    // crosshair on head
    ctx.beginPath();
    ctx.moveTo(CX - 18, CY);
    ctx.lineTo(CX + 18, CY);
    ctx.moveTo(CX, CY - 18);
    ctx.lineTo(CX, CY + 18);
    ctx.stroke();
    // X mark
    ctx.strokeStyle = lighten(g, 100);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(CX - 6, CY - 6);
    ctx.lineTo(CX + 6, CY + 6);
    ctx.moveTo(CX + 6, CY - 6);
    ctx.lineTo(CX - 6, CY + 6);
    ctx.stroke();
  },
  sniper_5(ctx, g) {  // spotter mark
    setSymbolStyle(ctx, g);
    // target diamond
    diamondPath(ctx, CX, CY, 14, 14);
    ctx.stroke();
    // inner dot
    ctx.beginPath();
    ctx.arc(CX, CY, 3, 0, Math.PI * 2);
    ctx.fill();
    // tick marks at cardinal points
    const ticks = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    for (const [dx, dy] of ticks) {
      ctx.beginPath();
      ctx.moveTo(CX + dx * 16, CY + dy * 16);
      ctx.lineTo(CX + dx * 22, CY + dy * 22);
      ctx.stroke();
    }
  },
  sniper_6(ctx, g) {  // kill zone
    setSymbolStyle(ctx, g);
    // circle with skull-like marking
    drawCircle(ctx, CX, CY, 18);
    ctx.strokeStyle = glowColor(g, 0.4);
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = lighten(g, 80);
    // danger zone X
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(CX - 12, CY - 12);
    ctx.lineTo(CX + 12, CY + 12);
    ctx.moveTo(CX + 12, CY - 12);
    ctx.lineTo(CX - 12, CY + 12);
    ctx.stroke();
    drawCircle(ctx, CX, CY, 5);
    ctx.fillStyle = glowColor(g, 0.5);
    ctx.fill();
    ctx.stroke();
  },

  // === GUNSLINGER === (quick draw, fan the hammer, ricochet, smoke roll, dead eye, bullet storm)
  gunslinger_1(ctx, g) {  // quick draw
    setSymbolStyle(ctx, g);
    // revolver shape
    ctx.beginPath();
    ctx.moveTo(CX - 14, CY - 2);
    ctx.lineTo(CX + 12, CY - 2);
    ctx.quadraticCurveTo(CX + 16, CY - 2, CX + 16, CY + 2);
    ctx.lineTo(CX - 14, CY + 2);
    ctx.closePath();
    ctx.fillStyle = glowColor(g, 0.3);
    ctx.fill();
    ctx.stroke();
    // handle
    ctx.beginPath();
    ctx.moveTo(CX - 4, CY + 2);
    ctx.lineTo(CX - 8, CY + 14);
    ctx.lineTo(CX - 2, CY + 14);
    ctx.lineTo(CX + 2, CY + 2);
    ctx.stroke();
    // speed lines
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(CX + 18, CY - 6 + i * 4);
      ctx.lineTo(CX + 24, CY - 6 + i * 4);
      ctx.stroke();
    }
  },
  gunslinger_2(ctx, g) {  // fan the hammer
    setSymbolStyle(ctx, g);
    // multiple bullet trails fanning out
    for (let i = -2; i <= 2; i++) {
      const angle = (i * 0.3);
      ctx.beginPath();
      ctx.moveTo(CX - 10, CY + 6);
      ctx.lineTo(CX + 16 * Math.cos(angle), CY - 16 + 6 * Math.abs(i));
      ctx.stroke();
      // bullet dot at end
      ctx.beginPath();
      ctx.arc(CX + 16 * Math.cos(angle), CY - 16 + 6 * Math.abs(i), 2, 0, Math.PI * 2);
      ctx.fill();
    }
    // cylinder circle
    drawCircle(ctx, CX - 10, CY + 6, 5);
    ctx.fillStyle = glowColor(g, 0.3);
    ctx.fill();
    ctx.stroke();
  },
  gunslinger_3(ctx, g) {  // ricochet
    setSymbolStyle(ctx, g);
    // bouncing bullet path
    ctx.beginPath();
    ctx.moveTo(CX - 18, CY - 10);
    ctx.lineTo(CX - 4, CY + 6);
    ctx.lineTo(CX + 10, CY - 8);
    ctx.lineTo(CX + 20, CY + 4);
    ctx.stroke();
    // spark at bounce points
    for (const [bx, by] of [[CX - 4, CY + 6], [CX + 10, CY - 8]]) {
      drawStar(ctx, bx, by, 4, 5, 2);
      ctx.fillStyle = lighten(g, 80);
      ctx.fill();
    }
  },
  gunslinger_4(ctx, g) {  // smoke roll
    setSymbolStyle(ctx, g);
    // smoke clouds
    for (const [sx, sy, sr] of [[CX - 8, CY - 4, 8], [CX + 4, CY - 6, 7], [CX - 2, CY + 4, 9], [CX + 10, CY + 2, 6]]) {
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fillStyle = glowColor(g, 0.15);
      ctx.fill();
      ctx.strokeStyle = glowColor(g, 0.4);
      ctx.stroke();
    }
    // rolling figure silhouette
    ctx.strokeStyle = lighten(g, 80);
    ctx.beginPath();
    ctx.arc(CX, CY + 8, 4, 0, Math.PI * 2);
    ctx.stroke();
  },
  gunslinger_5(ctx, g) {  // dead eye
    setSymbolStyle(ctx, g);
    // eye with crosshair
    ctx.beginPath();
    ctx.moveTo(CX - 16, CY);
    ctx.quadraticCurveTo(CX, CY - 12, CX + 16, CY);
    ctx.quadraticCurveTo(CX, CY + 12, CX - 16, CY);
    ctx.closePath();
    ctx.fillStyle = glowColor(g, 0.2);
    ctx.fill();
    ctx.stroke();
    // pupil crosshair
    drawCircle(ctx, CX, CY, 4);
    ctx.fillStyle = lighten(g, 80);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(CX - 8, CY);
    ctx.lineTo(CX + 8, CY);
    ctx.moveTo(CX, CY - 8);
    ctx.lineTo(CX, CY + 8);
    ctx.lineWidth = 1;
    ctx.stroke();
  },
  gunslinger_6(ctx, g) {  // bullet storm
    setSymbolStyle(ctx, g);
    // many bullet trails radiating out
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI * 2 * i) / 8;
      const r1 = 6, r2 = 20;
      ctx.beginPath();
      ctx.moveTo(CX + Math.cos(a) * r1, CY + Math.sin(a) * r1);
      ctx.lineTo(CX + Math.cos(a) * r2, CY + Math.sin(a) * r2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(CX + Math.cos(a) * r2, CY + Math.sin(a) * r2, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    // center muzzle flash
    drawStar(ctx, CX, CY, 4, 7, 3);
    ctx.fillStyle = lighten(g, 80);
    ctx.fill();
  },

  // === HUNTER === (snare trap, rain of arrows, beast companion, tracking mark, nature's wrath, predator instinct)
  hunter_1(ctx, g) {  // snare trap
    setSymbolStyle(ctx, g);
    // jaw trap - two arcs with teeth
    ctx.beginPath();
    ctx.arc(CX, CY + 4, 14, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(CX, CY - 2, 14, 0, Math.PI);
    ctx.stroke();
    // teeth
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(CX + i * 6, CY - 2);
      ctx.lineTo(CX + i * 6 + 2, CY + 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(CX + i * 6, CY + 4);
      ctx.lineTo(CX + i * 6 - 2, CY - 2);
      ctx.stroke();
    }
  },
  hunter_2(ctx, g) {  // rain of arrows
    setSymbolStyle(ctx, g);
    // multiple arrows falling
    for (let i = -2; i <= 2; i++) {
      const ax = CX + i * 8;
      const ay = CY - 6 + Math.abs(i) * 4;
      ctx.beginPath();
      ctx.moveTo(ax, ay - 12);
      ctx.lineTo(ax, ay + 8);
      ctx.stroke();
      // arrowhead
      ctx.beginPath();
      ctx.moveTo(ax, ay + 8);
      ctx.lineTo(ax - 3, ay + 4);
      ctx.moveTo(ax, ay + 8);
      ctx.lineTo(ax + 3, ay + 4);
      ctx.stroke();
    }
  },
  hunter_3(ctx, g) {  // beast companion
    setSymbolStyle(ctx, g);
    // wolf / beast head
    ctx.beginPath();
    // ears
    ctx.moveTo(CX - 10, CY - 14);
    ctx.lineTo(CX - 6, CY - 4);
    ctx.moveTo(CX + 10, CY - 14);
    ctx.lineTo(CX + 6, CY - 4);
    ctx.stroke();
    // head shape
    ctx.beginPath();
    ctx.moveTo(CX - 10, CY - 10);
    ctx.quadraticCurveTo(CX - 12, CY, CX - 8, CY + 6);
    ctx.quadraticCurveTo(CX, CY + 14, CX + 8, CY + 6);
    ctx.quadraticCurveTo(CX + 12, CY, CX + 10, CY - 10);
    ctx.stroke();
    // eyes
    ctx.beginPath();
    ctx.arc(CX - 4, CY - 2, 2, 0, Math.PI * 2);
    ctx.arc(CX + 4, CY - 2, 2, 0, Math.PI * 2);
    ctx.fill();
    // snout
    ctx.beginPath();
    ctx.moveTo(CX, CY + 2);
    ctx.lineTo(CX, CY + 6);
    ctx.stroke();
  },
  hunter_4(ctx, g) {  // tracking mark
    setSymbolStyle(ctx, g);
    // paw print
    // main pad
    ctx.beginPath();
    ctx.ellipse(CX, CY + 4, 8, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = glowColor(g, 0.35);
    ctx.fill();
    ctx.stroke();
    // toe pads
    for (const [tx, ty] of [[CX - 7, CY - 6], [CX - 2, CY - 10], [CX + 3, CY - 10], [CX + 8, CY - 6]]) {
      ctx.beginPath();
      ctx.arc(tx, ty, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  },
  hunter_5(ctx, g) {  // nature's wrath
    setSymbolStyle(ctx, g);
    // vine / thorns curling
    ctx.beginPath();
    ctx.moveTo(CX - 14, CY + 14);
    ctx.bezierCurveTo(CX - 14, CY - 6, CX - 4, CY - 14, CX + 6, CY - 14);
    ctx.bezierCurveTo(CX + 14, CY - 14, CX + 16, CY, CX + 10, CY + 8);
    ctx.stroke();
    // thorns
    for (let t = 0.2; t < 0.9; t += 0.2) {
      const x = CX - 14 + t * 28;
      const y = CY + 14 - t * 28;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 4, y - 6);
      ctx.stroke();
    }
    // leaf at end
    ctx.beginPath();
    ctx.ellipse(CX + 10, CY + 8, 5, 3, 0.5, 0, Math.PI * 2);
    ctx.fillStyle = glowColor(g, 0.3);
    ctx.fill();
    ctx.stroke();
  },
  hunter_6(ctx, g) {  // predator instinct
    setSymbolStyle(ctx, g);
    // slit eye with glow
    ctx.beginPath();
    ctx.moveTo(CX - 18, CY);
    ctx.quadraticCurveTo(CX, CY - 10, CX + 18, CY);
    ctx.quadraticCurveTo(CX, CY + 10, CX - 18, CY);
    ctx.closePath();
    ctx.fillStyle = glowColor(g, 0.2);
    ctx.fill();
    ctx.stroke();
    // slit pupil
    ctx.beginPath();
    ctx.moveTo(CX, CY - 8);
    ctx.bezierCurveTo(CX + 3, CY - 3, CX + 3, CY + 3, CX, CY + 8);
    ctx.bezierCurveTo(CX - 3, CY + 3, CX - 3, CY - 3, CX, CY - 8);
    ctx.fillStyle = lighten(g, 80);
    ctx.fill();
    // claw marks around
    ctx.lineWidth = 1.5;
    for (const s of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(CX + s * (22 + i * 2), CY - 8 + i * 3);
        ctx.lineTo(CX + s * (18 + i * 2), CY - 4 + i * 3);
        ctx.stroke();
      }
    }
  },

  // === BOMBARDIER === (frag grenade, cluster bomb, smoke screen, mine field, rocket barrage, scorched earth)
  bombardier_1(ctx, g) {  // frag grenade
    setSymbolStyle(ctx, g);
    // grenade body
    drawCircle(ctx, CX, CY + 2, 12);
    ctx.fillStyle = glowColor(g, 0.25);
    ctx.fill();
    ctx.stroke();
    // top cap
    ctx.fillRect(CX - 4, CY - 12, 8, 5);
    ctx.strokeRect(CX - 4, CY - 12, 8, 5);
    // pin ring
    ctx.beginPath();
    ctx.arc(CX + 6, CY - 14, 4, 0, Math.PI * 2);
    ctx.stroke();
    // frag pattern
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(CX - 12, CY + 2);
    ctx.lineTo(CX + 12, CY + 2);
    ctx.moveTo(CX, CY - 10);
    ctx.lineTo(CX, CY + 14);
    ctx.stroke();
  },
  bombardier_2(ctx, g) {  // cluster bomb
    setSymbolStyle(ctx, g);
    // main bomb
    drawCircle(ctx, CX, CY - 4, 8);
    ctx.fillStyle = glowColor(g, 0.3);
    ctx.fill();
    ctx.stroke();
    // sub-munitions spreading out
    const subs = [[CX - 12, CY + 8], [CX, CY + 12], [CX + 12, CY + 8], [CX - 8, CY + 14], [CX + 8, CY + 14]];
    for (const [sx, sy] of subs) {
      drawCircle(ctx, sx, sy, 4);
      ctx.fillStyle = glowColor(g, 0.25);
      ctx.fill();
      ctx.stroke();
    }
    // lines from main to subs
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    for (const [sx, sy] of subs) {
      ctx.beginPath();
      ctx.moveTo(CX, CY - 4);
      ctx.lineTo(sx, sy);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  },
  bombardier_3(ctx, g) {  // smoke screen
    setSymbolStyle(ctx, g);
    // overlapping smoke clouds
    const clouds = [[CX - 10, CY - 2, 10], [CX + 6, CY - 6, 9], [CX, CY + 4, 12], [CX + 12, CY + 4, 8], [CX - 6, CY + 8, 7]];
    for (const [cx, cy, r] of clouds) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = glowColor(g, 0.12);
      ctx.fill();
      ctx.strokeStyle = glowColor(g, 0.3);
      ctx.stroke();
    }
    // canister at bottom
    ctx.strokeStyle = lighten(g, 80);
    ctx.fillStyle = glowColor(g, 0.3);
    ctx.fillRect(CX - 3, CY + 10, 6, 8);
    ctx.strokeRect(CX - 3, CY + 10, 6, 8);
  },
  bombardier_4(ctx, g) {  // mine field
    setSymbolStyle(ctx, g);
    // grid of mines
    const mines = [
      [CX - 12, CY - 8], [CX + 4, CY - 10], [CX + 14, CY - 2],
      [CX - 8, CY + 4], [CX + 8, CY + 6], [CX - 2, CY + 12],
    ];
    for (const [mx, my] of mines) {
      // mine body
      ctx.beginPath();
      ctx.arc(mx, my, 4, 0, Math.PI * 2);
      ctx.fillStyle = glowColor(g, 0.3);
      ctx.fill();
      ctx.stroke();
      // prongs
      for (let p = 0; p < 4; p++) {
        const pa = (Math.PI * 2 * p) / 4 + Math.PI / 4;
        ctx.beginPath();
        ctx.moveTo(mx + Math.cos(pa) * 4, my + Math.sin(pa) * 4);
        ctx.lineTo(mx + Math.cos(pa) * 6, my + Math.sin(pa) * 6);
        ctx.stroke();
      }
    }
  },
  bombardier_5(ctx, g) {  // rocket barrage
    setSymbolStyle(ctx, g);
    // rockets going upward
    for (let i = -1; i <= 1; i++) {
      const rx = CX + i * 10;
      // rocket body
      ctx.beginPath();
      ctx.moveTo(rx, CY - 16);
      ctx.lineTo(rx - 3, CY);
      ctx.lineTo(rx + 3, CY);
      ctx.closePath();
      ctx.fillStyle = glowColor(g, 0.3);
      ctx.fill();
      ctx.stroke();
      // fins
      ctx.beginPath();
      ctx.moveTo(rx - 3, CY);
      ctx.lineTo(rx - 6, CY + 4);
      ctx.lineTo(rx - 3, CY - 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(rx + 3, CY);
      ctx.lineTo(rx + 6, CY + 4);
      ctx.lineTo(rx + 3, CY - 2);
      ctx.stroke();
      // exhaust
      ctx.beginPath();
      ctx.moveTo(rx - 2, CY + 2);
      ctx.quadraticCurveTo(rx, CY + 10, rx + 2, CY + 2);
      ctx.strokeStyle = glowColor(g, 0.5);
      ctx.stroke();
      ctx.strokeStyle = lighten(g, 80);
    }
  },
  bombardier_6(ctx, g) {  // scorched earth
    setSymbolStyle(ctx, g);
    // ground with fire and craters
    ctx.beginPath();
    ctx.moveTo(CX - 24, CY + 6);
    ctx.lineTo(CX + 24, CY + 6);
    ctx.stroke();
    // craters
    for (const cx of [CX - 10, CX + 8]) {
      ctx.beginPath();
      ctx.ellipse(cx, CY + 8, 6, 3, 0, 0, Math.PI);
      ctx.stroke();
    }
    // flames rising
    for (const [fx, fy] of [[CX - 14, CY], [CX, CY - 6], [CX + 12, CY - 2]]) {
      drawFlame(ctx, fx, fy, 10, 16);
      ctx.fillStyle = glowColor(g, 0.2);
      ctx.fill();
      ctx.stroke();
    }
  },

  // === ARSONIST === (flame jet, fire wall, molten splash, ignite, inferno, phoenix rise)
  arsonist_1(ctx, g) {  // flame jet
    setSymbolStyle(ctx, g);
    // nozzle
    ctx.fillStyle = glowColor(g, 0.3);
    ctx.fillRect(CX - 16, CY - 2, 10, 4);
    ctx.strokeRect(CX - 16, CY - 2, 10, 4);
    // flame jet
    ctx.beginPath();
    ctx.moveTo(CX - 6, CY - 4);
    ctx.bezierCurveTo(CX + 4, CY - 10, CX + 14, CY - 8, CX + 20, CY);
    ctx.bezierCurveTo(CX + 14, CY + 8, CX + 4, CY + 10, CX - 6, CY + 4);
    ctx.closePath();
    const fg = ctx.createLinearGradient(CX - 6, CY, CX + 20, CY);
    fg.addColorStop(0, lighten(g, 80));
    fg.addColorStop(0.5, glowColor(g, 0.6));
    fg.addColorStop(1, glowColor(g, 0.1));
    ctx.fillStyle = fg;
    ctx.fill();
    ctx.stroke();
  },
  arsonist_2(ctx, g) {  // fire wall
    setSymbolStyle(ctx, g);
    // wall of flames
    for (let i = -2; i <= 2; i++) {
      const fx = CX + i * 9;
      drawFlame(ctx, fx, CY - 2, 12, 20 + Math.abs(i) * -2);
      const fg = ctx.createLinearGradient(fx, CY - 14, fx, CY + 8);
      fg.addColorStop(0, glowColor(g, 0.1));
      fg.addColorStop(1, glowColor(g, 0.4));
      ctx.fillStyle = fg;
      ctx.fill();
      ctx.stroke();
    }
    // base line
    ctx.beginPath();
    ctx.moveTo(CX - 22, CY + 8);
    ctx.lineTo(CX + 22, CY + 8);
    ctx.lineWidth = 2;
    ctx.stroke();
  },
  arsonist_3(ctx, g) {  // molten splash
    setSymbolStyle(ctx, g);
    // central splash
    drawDrop(ctx, CX, CY - 4, 10);
    ctx.fillStyle = glowColor(g, 0.4);
    ctx.fill();
    ctx.stroke();
    // splatter drops
    for (let i = 0; i < 5; i++) {
      const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const d = 16 + (i % 2) * 4;
      drawDrop(ctx, CX + Math.cos(a) * d, CY + Math.sin(a) * d, 4);
      ctx.fillStyle = glowColor(g, 0.3);
      ctx.fill();
      ctx.stroke();
    }
  },
  arsonist_4(ctx, g) {  // ignite
    setSymbolStyle(ctx, g);
    // match / spark
    ctx.beginPath();
    ctx.moveTo(CX + 2, CY + 16);
    ctx.lineTo(CX, CY - 2);
    ctx.lineWidth = 3;
    ctx.stroke();
    // flame at tip
    drawFlame(ctx, CX, CY - 10, 14, 18);
    const fg = ctx.createRadialGradient(CX, CY - 10, 2, CX, CY - 10, 12);
    fg.addColorStop(0, lighten(g, 100));
    fg.addColorStop(1, glowColor(g, 0.3));
    ctx.fillStyle = fg;
    ctx.fill();
    ctx.stroke();
  },
  arsonist_5(ctx, g) {  // inferno
    setSymbolStyle(ctx, g);
    // large multi-layered fire
    drawFlame(ctx, CX, CY, 28, 36);
    ctx.fillStyle = glowColor(g, 0.15);
    ctx.fill();
    ctx.stroke();
    drawFlame(ctx, CX, CY + 2, 18, 26);
    ctx.fillStyle = glowColor(g, 0.3);
    ctx.fill();
    ctx.stroke();
    drawFlame(ctx, CX, CY + 4, 10, 16);
    ctx.fillStyle = lighten(g, 60);
    ctx.globalAlpha = 0.5;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.stroke();
  },
  arsonist_6(ctx, g) {  // phoenix rise
    setSymbolStyle(ctx, g);
    // bird silhouette rising from flames
    // wings
    ctx.beginPath();
    ctx.moveTo(CX, CY - 4);
    ctx.bezierCurveTo(CX - 8, CY - 10, CX - 22, CY - 8, CX - 20, CY - 18);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(CX, CY - 4);
    ctx.bezierCurveTo(CX + 8, CY - 10, CX + 22, CY - 8, CX + 20, CY - 18);
    ctx.stroke();
    // body
    ctx.beginPath();
    ctx.arc(CX, CY - 6, 4, 0, Math.PI * 2);
    ctx.fillStyle = glowColor(g, 0.4);
    ctx.fill();
    ctx.stroke();
    // tail feathers
    ctx.beginPath();
    ctx.moveTo(CX, CY);
    ctx.quadraticCurveTo(CX - 4, CY + 10, CX - 8, CY + 16);
    ctx.moveTo(CX, CY);
    ctx.quadraticCurveTo(CX, CY + 12, CX, CY + 18);
    ctx.moveTo(CX, CY);
    ctx.quadraticCurveTo(CX + 4, CY + 10, CX + 8, CY + 16);
    ctx.stroke();
    // flames at base
    drawFlame(ctx, CX, CY + 12, 16, 12);
    ctx.fillStyle = glowColor(g, 0.2);
    ctx.fill();
  },

  // === CHEMIST === (acid vial, poison cloud, mutagenic serum, corrosion, plague bomb, transmutation)
  chemist_1(ctx, g) {  // acid vial
    setSymbolStyle(ctx, g);
    // flask shape
    ctx.beginPath();
    ctx.moveTo(CX - 4, CY - 16);
    ctx.lineTo(CX - 4, CY - 8);
    ctx.lineTo(CX - 12, CY + 8);
    ctx.quadraticCurveTo(CX - 12, CY + 16, CX, CY + 16);
    ctx.quadraticCurveTo(CX + 12, CY + 16, CX + 12, CY + 8);
    ctx.lineTo(CX + 4, CY - 8);
    ctx.lineTo(CX + 4, CY - 16);
    ctx.closePath();
    ctx.fillStyle = glowColor(g, 0.2);
    ctx.fill();
    ctx.stroke();
    // liquid level
    ctx.beginPath();
    ctx.moveTo(CX - 10, CY + 2);
    ctx.quadraticCurveTo(CX, CY + 6, CX + 10, CY + 2);
    ctx.lineTo(CX + 12, CY + 8);
    ctx.quadraticCurveTo(CX + 12, CY + 16, CX, CY + 16);
    ctx.quadraticCurveTo(CX - 12, CY + 16, CX - 12, CY + 8);
    ctx.closePath();
    ctx.fillStyle = glowColor(g, 0.4);
    ctx.fill();
    // bubbles
    for (const [bx, by] of [[CX - 4, CY + 6], [CX + 3, CY + 10], [CX - 2, CY + 12]]) {
      ctx.beginPath();
      ctx.arc(bx, by, 2, 0, Math.PI * 2);
      ctx.stroke();
    }
  },
  chemist_2(ctx, g) {  // poison cloud
    setSymbolStyle(ctx, g);
    // toxic cloud puffs
    const puffs = [[CX - 8, CY - 4, 9], [CX + 6, CY - 8, 8], [CX, CY + 2, 11], [CX + 12, CY, 7], [CX - 12, CY + 4, 7]];
    for (const [px, py, pr] of puffs) {
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fillStyle = glowColor(g, 0.15);
      ctx.fill();
      ctx.stroke();
    }
    // skull in center
    ctx.beginPath();
    ctx.arc(CX, CY - 2, 5, 0, Math.PI * 2);
    ctx.fillStyle = glowColor(g, 0.4);
    ctx.fill();
    ctx.stroke();
    // skull eyes
    ctx.beginPath();
    ctx.arc(CX - 2, CY - 3, 1.5, 0, Math.PI * 2);
    ctx.arc(CX + 2, CY - 3, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = darken(g, 40);
    ctx.fill();
  },
  chemist_3(ctx, g) {  // mutagenic serum
    setSymbolStyle(ctx, g);
    // syringe
    ctx.beginPath();
    ctx.moveTo(CX - 14, CY + 14);
    ctx.lineTo(CX + 8, CY - 8);
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.lineWidth = 2.5;
    // needle
    ctx.beginPath();
    ctx.moveTo(CX + 8, CY - 8);
    ctx.lineTo(CX + 16, CY - 16);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // plunger
    ctx.beginPath();
    ctx.moveTo(CX - 16, CY + 16);
    ctx.lineTo(CX - 12, CY + 12);
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.lineWidth = 2.5;
    // DNA helix near tip
    ctx.lineWidth = 1.5;
    for (let t = 0; t < 4; t++) {
      const tx = CX + 10 + t;
      const ty = CY - 10 - t;
      ctx.beginPath();
      ctx.arc(tx + 4, ty - 4, 2, 0, Math.PI * 2);
      ctx.stroke();
    }
  },
  chemist_4(ctx, g) {  // corrosion
    setSymbolStyle(ctx, g);
    // dripping acid
    for (let i = -2; i <= 2; i++) {
      const dx = CX + i * 8;
      ctx.beginPath();
      ctx.moveTo(dx, CY - 14);
      ctx.lineTo(dx, CY + 4 + Math.abs(i) * 3);
      ctx.lineWidth = 2 + Math.random();
      ctx.stroke();
      // drop at bottom
      drawDrop(ctx, dx, CY + 8 + Math.abs(i) * 3, 3);
      ctx.fillStyle = glowColor(g, 0.5);
      ctx.fill();
    }
    // corroded surface
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(CX - 22, CY - 14);
    ctx.bezierCurveTo(CX - 14, CY - 12, CX - 6, CY - 16, CX, CY - 14);
    ctx.bezierCurveTo(CX + 6, CY - 12, CX + 14, CY - 16, CX + 22, CY - 14);
    ctx.stroke();
  },
  chemist_5(ctx, g) {  // plague bomb
    setSymbolStyle(ctx, g);
    // round bomb
    drawCircle(ctx, CX, CY + 2, 12);
    ctx.fillStyle = glowColor(g, 0.25);
    ctx.fill();
    ctx.stroke();
    // skull on bomb
    ctx.beginPath();
    ctx.arc(CX, CY, 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(CX - 2, CY - 1, 1.5, 0, Math.PI * 2);
    ctx.arc(CX + 2, CY - 1, 1.5, 0, Math.PI * 2);
    ctx.fill();
    // fuse
    ctx.beginPath();
    ctx.moveTo(CX + 4, CY - 10);
    ctx.quadraticCurveTo(CX + 10, CY - 18, CX + 14, CY - 14);
    ctx.stroke();
    // spark at fuse
    drawStar(ctx, CX + 14, CY - 14, 4, 4, 2);
    ctx.fillStyle = lighten(g, 80);
    ctx.fill();
  },
  chemist_6(ctx, g) {  // transmutation
    setSymbolStyle(ctx, g);
    // alchemical circle
    drawCircle(ctx, CX, CY, 18);
    ctx.stroke();
    // inner triangle
    drawTriangle(ctx, CX, CY, 24, true);
    ctx.stroke();
    // inverted triangle inside
    drawTriangle(ctx, CX, CY, 16, false);
    ctx.stroke();
    // center dot
    ctx.beginPath();
    ctx.arc(CX, CY, 3, 0, Math.PI * 2);
    ctx.fillStyle = lighten(g, 80);
    ctx.fill();
  },

  // === MEDIC === (heal pulse, revive, barrier shield, cleanse, mass heal, divine protection)
  medic_1(ctx, g) {  // heal pulse
    setSymbolStyle(ctx, g);
    drawCross(ctx, CX, CY, 4, 4);
    ctx.fillStyle = glowColor(g, 0.35);
    ctx.fill();
    ctx.stroke();
    // pulse waves
    drawWaves(ctx, CX, CY, 3, 16, 1.2);
  },
  medic_2(ctx, g) {  // revive
    setSymbolStyle(ctx, g);
    // upward arrow with cross
    ctx.beginPath();
    ctx.moveTo(CX, CY - 18);
    ctx.lineTo(CX - 10, CY - 6);
    ctx.lineTo(CX - 4, CY - 6);
    ctx.lineTo(CX - 4, CY + 6);
    ctx.lineTo(CX + 4, CY + 6);
    ctx.lineTo(CX + 4, CY - 6);
    ctx.lineTo(CX + 10, CY - 6);
    ctx.closePath();
    ctx.fillStyle = glowColor(g, 0.3);
    ctx.fill();
    ctx.stroke();
    // sparkles
    for (const [sx, sy] of [[CX - 14, CY + 8], [CX + 14, CY + 10], [CX, CY + 14]]) {
      drawStar(ctx, sx, sy, 4, 3, 1.5);
      ctx.fill();
    }
  },
  medic_3(ctx, g) {  // barrier shield
    setSymbolStyle(ctx, g);
    // dome / barrier arc
    ctx.beginPath();
    ctx.arc(CX, CY + 6, 20, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(CX, CY + 6, 16, Math.PI, 0);
    ctx.strokeStyle = glowColor(g, 0.4);
    ctx.stroke();
    ctx.strokeStyle = lighten(g, 80);
    // cross inside
    drawCross(ctx, CX, CY, 3, 3);
    ctx.fillStyle = glowColor(g, 0.3);
    ctx.fill();
    ctx.stroke();
    // base line
    ctx.beginPath();
    ctx.moveTo(CX - 22, CY + 6);
    ctx.lineTo(CX + 22, CY + 6);
    ctx.stroke();
  },
  medic_4(ctx, g) {  // cleanse
    setSymbolStyle(ctx, g);
    // water droplet with sparkle
    drawDrop(ctx, CX, CY, 14);
    ctx.fillStyle = glowColor(g, 0.2);
    ctx.fill();
    ctx.stroke();
    // sparkles inside
    drawStar(ctx, CX - 3, CY - 2, 4, 5, 2);
    ctx.fillStyle = lighten(g, 80);
    ctx.fill();
    drawStar(ctx, CX + 4, CY + 4, 4, 3, 1.5);
    ctx.fill();
  },
  medic_5(ctx, g) {  // mass heal
    setSymbolStyle(ctx, g);
    // large cross
    drawCross(ctx, CX, CY, 5, 4);
    ctx.fillStyle = glowColor(g, 0.3);
    ctx.fill();
    ctx.stroke();
    // radiating heal waves
    ctx.setLineDash([3, 3]);
    for (let r = 18; r <= 24; r += 6) {
      drawCircle(ctx, CX, CY, r);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  },
  medic_6(ctx, g) {  // divine protection
    setSymbolStyle(ctx, g);
    // angelic shield with wings
    drawShield(ctx, CX, CY, 20, 24);
    ctx.fillStyle = glowColor(g, 0.2);
    ctx.fill();
    ctx.stroke();
    // cross on shield
    drawCross(ctx, CX, CY + 1, 3, 3);
    ctx.fillStyle = lighten(g, 80);
    ctx.fill();
    // small wings
    ctx.beginPath();
    ctx.moveTo(CX - 14, CY - 6);
    ctx.quadraticCurveTo(CX - 24, CY - 14, CX - 20, CY - 20);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(CX + 14, CY - 6);
    ctx.quadraticCurveTo(CX + 24, CY - 14, CX + 20, CY - 20);
    ctx.stroke();
  },

  // === TACTICIAN === (rally flag, formation shift, flanking order, war horn, command aura, total war decree)
  tactician_1(ctx, g) {  // rally flag
    setSymbolStyle(ctx, g);
    // flag pole
    ctx.beginPath();
    ctx.moveTo(CX - 6, CY + 18);
    ctx.lineTo(CX - 6, CY - 16);
    ctx.lineWidth = 2.5;
    ctx.stroke();
    // flag
    ctx.beginPath();
    ctx.moveTo(CX - 6, CY - 16);
    ctx.quadraticCurveTo(CX + 6, CY - 12, CX + 14, CY - 14);
    ctx.lineTo(CX + 14, CY - 4);
    ctx.quadraticCurveTo(CX + 6, CY - 2, CX - 6, CY - 6);
    ctx.closePath();
    ctx.fillStyle = glowColor(g, 0.35);
    ctx.fill();
    ctx.stroke();
    // star emblem on flag
    drawStar(ctx, CX + 4, CY - 10, 5, 5, 2);
    ctx.fillStyle = lighten(g, 80);
    ctx.fill();
  },
  tactician_2(ctx, g) {  // formation shift
    setSymbolStyle(ctx, g);
    // arrow formation dots
    const formation = [
      [CX, CY - 12],
      [CX - 8, CY - 4], [CX + 8, CY - 4],
      [CX - 16, CY + 4], [CX, CY + 4], [CX + 16, CY + 4],
    ];
    for (const [fx, fy] of formation) {
      ctx.beginPath();
      ctx.arc(fx, fy, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = glowColor(g, 0.5);
      ctx.fill();
      ctx.stroke();
    }
    // arrows showing movement
    ctx.lineWidth = 1.5;
    drawArrow(ctx, CX + 16, CY + 4, CX + 10, CY + 10, 4);
    drawArrow(ctx, CX - 16, CY + 4, CX - 10, CY + 10, 4);
  },
  tactician_3(ctx, g) {  // flanking order
    setSymbolStyle(ctx, g);
    // enemy dot in center
    ctx.beginPath();
    ctx.arc(CX, CY, 5, 0, Math.PI * 2);
    ctx.fillStyle = glowColor(g, 0.5);
    ctx.fill();
    ctx.stroke();
    // flanking arrows from sides
    ctx.lineWidth = 2;
    // left flank
    ctx.beginPath();
    ctx.moveTo(CX - 22, CY + 10);
    ctx.quadraticCurveTo(CX - 20, CY, CX - 8, CY);
    ctx.stroke();
    drawArrow(ctx, CX - 12, CY, CX - 8, CY, 5);
    // right flank
    ctx.beginPath();
    ctx.moveTo(CX + 22, CY + 10);
    ctx.quadraticCurveTo(CX + 20, CY, CX + 8, CY);
    ctx.stroke();
    drawArrow(ctx, CX + 12, CY, CX + 8, CY, 5);
    // top attack
    drawArrow(ctx, CX, CY - 18, CX, CY - 8, 5);
  },
  tactician_4(ctx, g) {  // war horn
    setSymbolStyle(ctx, g);
    // horn shape
    ctx.beginPath();
    ctx.moveTo(CX - 14, CY + 4);
    ctx.quadraticCurveTo(CX - 10, CY - 2, CX - 4, CY - 2);
    ctx.bezierCurveTo(CX + 4, CY - 4, CX + 12, CY - 8, CX + 16, CY - 2);
    ctx.quadraticCurveTo(CX + 18, CY + 2, CX + 16, CY + 6);
    ctx.bezierCurveTo(CX + 12, CY + 12, CX + 4, CY + 8, CX - 4, CY + 6);
    ctx.quadraticCurveTo(CX - 10, CY + 6, CX - 14, CY + 4);
    ctx.closePath();
    ctx.fillStyle = glowColor(g, 0.25);
    ctx.fill();
    ctx.stroke();
    // sound waves from bell
    ctx.lineWidth = 1.5;
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(CX + 18, CY + 2, i * 5, -0.6, 0.6);
      ctx.stroke();
    }
  },
  tactician_5(ctx, g) {  // command aura
    setSymbolStyle(ctx, g);
    // central commander icon
    ctx.beginPath();
    ctx.arc(CX, CY - 4, 6, 0, Math.PI * 2);
    ctx.fillStyle = glowColor(g, 0.4);
    ctx.fill();
    ctx.stroke();
    // chevron
    ctx.beginPath();
    ctx.moveTo(CX - 8, CY + 4);
    ctx.lineTo(CX, CY + 10);
    ctx.lineTo(CX + 8, CY + 4);
    ctx.stroke();
    // aura circles
    ctx.setLineDash([3, 3]);
    drawCircle(ctx, CX, CY, 18);
    ctx.stroke();
    drawCircle(ctx, CX, CY, 24);
    ctx.strokeStyle = glowColor(g, 0.3);
    ctx.stroke();
    ctx.setLineDash([]);
  },
  tactician_6(ctx, g) {  // total war decree
    setSymbolStyle(ctx, g);
    // crossed swords behind scroll
    ctx.beginPath();
    ctx.moveTo(CX - 16, CY - 16);
    ctx.lineTo(CX + 16, CY + 16);
    ctx.moveTo(CX + 16, CY - 16);
    ctx.lineTo(CX - 16, CY + 16);
    ctx.lineWidth = 2;
    ctx.stroke();
    // scroll in center
    ctx.beginPath();
    ctx.moveTo(CX - 10, CY - 10);
    ctx.lineTo(CX + 10, CY - 10);
    ctx.quadraticCurveTo(CX + 14, CY - 10, CX + 14, CY - 6);
    ctx.lineTo(CX + 14, CY + 6);
    ctx.quadraticCurveTo(CX + 14, CY + 10, CX + 10, CY + 10);
    ctx.lineTo(CX - 10, CY + 10);
    ctx.quadraticCurveTo(CX - 14, CY + 10, CX - 14, CY + 6);
    ctx.lineTo(CX - 14, CY - 6);
    ctx.quadraticCurveTo(CX - 14, CY - 10, CX - 10, CY - 10);
    ctx.closePath();
    ctx.fillStyle = glowColor(g, 0.3);
    ctx.fill();
    ctx.stroke();
    // text lines on scroll
    ctx.lineWidth = 1;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(CX - 8, CY + i * 4);
      ctx.lineTo(CX + 8, CY + i * 4);
      ctx.stroke();
    }
  },

  // === ENGINEER === (deploy turret, repair drone, energy shield, overclock, EMP pulse, mech suit)
  engineer_1(ctx, g) {  // deploy turret
    setSymbolStyle(ctx, g);
    // turret base
    ctx.fillStyle = glowColor(g, 0.25);
    ctx.fillRect(CX - 10, CY + 4, 20, 8);
    ctx.strokeRect(CX - 10, CY + 4, 20, 8);
    // turret barrel
    ctx.beginPath();
    ctx.moveTo(CX - 3, CY + 4);
    ctx.lineTo(CX - 3, CY - 6);
    ctx.lineTo(CX + 3, CY - 6);
    ctx.lineTo(CX + 3, CY + 4);
    ctx.stroke();
    // gun barrel
    ctx.beginPath();
    ctx.moveTo(CX, CY - 6);
    ctx.lineTo(CX, CY - 18);
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.lineWidth = 2.5;
    // legs
    ctx.beginPath();
    ctx.moveTo(CX - 10, CY + 12);
    ctx.lineTo(CX - 16, CY + 18);
    ctx.moveTo(CX + 10, CY + 12);
    ctx.lineTo(CX + 16, CY + 18);
    ctx.stroke();
  },
  engineer_2(ctx, g) {  // repair drone
    setSymbolStyle(ctx, g);
    // drone body
    ctx.beginPath();
    ctx.ellipse(CX, CY, 10, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = glowColor(g, 0.25);
    ctx.fill();
    ctx.stroke();
    // propellers
    ctx.beginPath();
    ctx.moveTo(CX - 14, CY - 4);
    ctx.lineTo(CX - 22, CY - 8);
    ctx.moveTo(CX + 14, CY - 4);
    ctx.lineTo(CX + 22, CY - 8);
    ctx.stroke();
    // rotor arcs
    ctx.beginPath();
    ctx.arc(CX - 18, CY - 6, 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(CX + 18, CY - 6, 5, 0, Math.PI * 2);
    ctx.stroke();
    // wrench beam
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(CX, CY + 6);
    ctx.lineTo(CX, CY + 16);
    ctx.stroke();
    ctx.setLineDash([]);
    drawStar(ctx, CX, CY + 16, 4, 3, 1.5);
    ctx.fillStyle = lighten(g, 80);
    ctx.fill();
  },
  engineer_3(ctx, g) {  // energy shield
    setSymbolStyle(ctx, g);
    // hexagonal shield
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
      const x = CX + Math.cos(a) * 18;
      const y = CY + Math.sin(a) * 18;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = glowColor(g, 0.15);
    ctx.fill();
    ctx.stroke();
    // energy grid inside
    ctx.lineWidth = 1;
    ctx.strokeStyle = glowColor(g, 0.3);
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.lineTo(CX + Math.cos(a) * 18, CY + Math.sin(a) * 18);
      ctx.stroke();
    }
    // center glow
    ctx.strokeStyle = lighten(g, 80);
    drawCircle(ctx, CX, CY, 5);
    ctx.fillStyle = glowColor(g, 0.5);
    ctx.fill();
    ctx.stroke();
  },
  engineer_4(ctx, g) {  // overclock
    setSymbolStyle(ctx, g);
    // gear
    drawGear(ctx, CX, CY, 18, 12, 8);
    ctx.fillStyle = glowColor(g, 0.2);
    ctx.fill();
    ctx.stroke();
    // lightning bolt in center
    drawLightning(ctx, CX, CY, 8);
    ctx.fillStyle = lighten(g, 80);
    ctx.fill();
    ctx.stroke();
  },
  engineer_5(ctx, g) {  // EMP pulse
    setSymbolStyle(ctx, g);
    // central EMP source
    drawCircle(ctx, CX, CY, 6);
    ctx.fillStyle = glowColor(g, 0.5);
    ctx.fill();
    ctx.stroke();
    // EMP wave rings
    ctx.setLineDash([4, 3]);
    for (let r = 12; r <= 24; r += 6) {
      drawCircle(ctx, CX, CY, r);
      ctx.strokeStyle = glowColor(g, 0.6 - (r - 12) * 0.015);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    // small lightning arcs
    ctx.strokeStyle = lighten(g, 80);
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) {
      const a = (Math.PI * 2 * i) / 4;
      ctx.beginPath();
      ctx.moveTo(CX + Math.cos(a) * 6, CY + Math.sin(a) * 6);
      ctx.lineTo(CX + Math.cos(a + 0.2) * 12, CY + Math.sin(a + 0.2) * 12);
      ctx.lineTo(CX + Math.cos(a) * 18, CY + Math.sin(a) * 18);
      ctx.stroke();
    }
  },
  engineer_6(ctx, g) {  // mech suit
    setSymbolStyle(ctx, g);
    // mech body outline
    // head
    ctx.beginPath();
    ctx.arc(CX, CY - 12, 5, 0, Math.PI * 2);
    ctx.stroke();
    // visor
    ctx.beginPath();
    ctx.moveTo(CX - 4, CY - 12);
    ctx.lineTo(CX + 4, CY - 12);
    ctx.lineWidth = 2;
    ctx.strokeStyle = lighten(g, 80);
    ctx.stroke();
    ctx.strokeStyle = lighten(g, 60);
    // torso
    ctx.beginPath();
    ctx.moveTo(CX - 10, CY - 6);
    ctx.lineTo(CX - 12, CY + 8);
    ctx.lineTo(CX + 12, CY + 8);
    ctx.lineTo(CX + 10, CY - 6);
    ctx.closePath();
    ctx.fillStyle = glowColor(g, 0.2);
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.stroke();
    // arms
    ctx.beginPath();
    ctx.moveTo(CX - 12, CY - 4);
    ctx.lineTo(CX - 20, CY + 4);
    ctx.lineTo(CX - 18, CY + 10);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(CX + 12, CY - 4);
    ctx.lineTo(CX + 20, CY + 4);
    ctx.lineTo(CX + 18, CY + 10);
    ctx.stroke();
    // legs
    ctx.beginPath();
    ctx.moveTo(CX - 6, CY + 8);
    ctx.lineTo(CX - 8, CY + 18);
    ctx.moveTo(CX + 6, CY + 8);
    ctx.lineTo(CX + 8, CY + 18);
    ctx.stroke();
    // chest reactor
    drawCircle(ctx, CX, CY + 1, 3);
    ctx.fillStyle = lighten(g, 80);
    ctx.fill();
  },
};

// ──────────────────────────────────────────────
// CLASS DEFINITIONS
// ──────────────────────────────────────────────

const CLASSES = [
  { name: 'sentinel',   bg: '#0A0A2A', glow: '#4466FF', count: 6 },
  { name: 'bruiser',    bg: '#2A0A0A', glow: '#FF4444', count: 6 },
  { name: 'crusher',    bg: '#2A1408', glow: '#FF8833', count: 6 },
  { name: 'sniper',     bg: '#0A1A0A', glow: '#44DD44', count: 6 },
  { name: 'gunslinger', bg: '#1A140A', glow: '#DDBB33', count: 6 },
  { name: 'hunter',     bg: '#0A2A14', glow: '#33CC55', count: 6 },
  { name: 'bombardier', bg: '#14141E', glow: '#8899BB', count: 6 },
  { name: 'arsonist',   bg: '#2A1400', glow: '#FF6622', count: 6 },
  { name: 'chemist',    bg: '#0A1A0A', glow: '#55FF33', count: 6 },
  { name: 'medic',      bg: '#141820', glow: '#DDEEFF', count: 6 },
  { name: 'tactician',  bg: '#1A0A1A', glow: '#BB55DD', count: 6 },
  { name: 'engineer',   bg: '#141418', glow: '#33DDEE', count: 6 },
];

// ──────────────────────────────────────────────
// MAIN GENERATION
// ──────────────────────────────────────────────

let total = 0;

for (const cls of CLASSES) {
  for (let i = 1; i <= cls.count; i++) {
    const key = `${cls.name}_${i}`;
    const filename = `j2_${cls.name}_${i}`;
    const drawSymbol = SYMBOLS[key];

    if (!drawSymbol) {
      console.warn(`  MISSING symbol function: ${key}`);
      continue;
    }

    const { c, ctx } = makeCanvas();

    // 1. Dark radial gradient background
    drawBackground(ctx, cls.bg);

    // 2. Diamond frame with colored glow
    drawDiamondFrame(ctx, cls.glow);

    // 3. Clip to diamond for symbol drawing
    ctx.save();
    diamondPath(ctx, CX, CY, 40, 40);
    ctx.clip();

    // 4. Draw the ability symbol
    drawSymbol(ctx, cls.glow);

    ctx.restore();

    // 5. Save
    save(c, filename);
    total++;
  }
}

console.log(`Generated ${total} Job2 ability icons in ${OUT_DIR}`);
