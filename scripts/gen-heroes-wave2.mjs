/**
 * Wasteland Grind -- Wave 2 Hero Portraits (128x128)
 * Generates 46 unique hero portraits with smooth rendering.
 * Run: node scripts/gen-heroes-wave2.mjs
 */
import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

const SIZE = 128;
const OUT = path.resolve('public/assets/heroes-128');
fs.mkdirSync(OUT, { recursive: true });

// ════════════════════════════════════════════════
// CATEGORY COLORS
// ════════════════════════════════════════════════
const CAT = {
  melee:      { border: '#CC3333', bgDark: '#2A0A0A', bgMid: '#4A1515', accent: '#FF4444' },
  ranger:     { border: '#33AA33', bgDark: '#0A2A0A', bgMid: '#154A15', accent: '#55FF55' },
  demolition: { border: '#3366CC', bgDark: '#0A0A2A', bgMid: '#15154A', accent: '#5588FF' },
  support:    { border: '#CCAA33', bgDark: '#2A2A0A', bgMid: '#4A4A15', accent: '#FFDD44' },
  job2:       { border: '#8844AA', bgDark: '#1A0A2A', bgMid: '#30154A', accent: '#BB66DD' },
};

// ════════════════════════════════════════════════
// HERO DEFINITIONS
// ════════════════════════════════════════════════
const HEROES = [
  // MELEE (9)
  { name: 'iron_fist',      cat: 'melee', draw: drawIronFist },
  { name: 'scrap_knight',   cat: 'melee', draw: drawScrapKnight },
  { name: 'rust_blade',     cat: 'melee', draw: drawRustBlade },
  { name: 'slag_breaker',   cat: 'melee', draw: drawSlagBreaker },
  { name: 'ash_warden',     cat: 'melee', draw: drawAshWarden },
  { name: 'bone_crusher',   cat: 'melee', draw: drawBoneCrusher },
  { name: 'chain_runner',   cat: 'melee', draw: drawChainRunner },
  { name: 'vault_guard',    cat: 'melee', draw: drawVaultGuard },
  { name: 'wasteland_edge', cat: 'melee', draw: drawWastelandEdge },
  // RANGER (9)
  { name: 'dead_shot',      cat: 'ranger', draw: drawDeadShot },
  { name: 'dust_hawk',      cat: 'ranger', draw: drawDustHawk },
  { name: 'scrap_archer',   cat: 'ranger', draw: drawScrapArcher },
  { name: 'neon_trigger',   cat: 'ranger', draw: drawNeonTrigger },
  { name: 'wind_stalker',   cat: 'ranger', draw: drawWindStalker },
  { name: 'iron_sight',     cat: 'ranger', draw: drawIronSight },
  { name: 'flash_bang',     cat: 'ranger', draw: drawFlashBang },
  { name: 'longbow_jack',   cat: 'ranger', draw: drawLongbowJack },
  { name: 'ruin_scout',     cat: 'ranger', draw: drawRuinScout },
  // DEMOLITION (9)
  { name: 'blast_core',     cat: 'demolition', draw: drawBlastCore },
  { name: 'cinder_maw',     cat: 'demolition', draw: drawCinderMaw },
  { name: 'fuse_wire',      cat: 'demolition', draw: drawFuseWire },
  { name: 'acid_rain',      cat: 'demolition', draw: drawAcidRain },
  { name: 'smoke_stack',    cat: 'demolition', draw: drawSmokeStack },
  { name: 'volt_crash',     cat: 'demolition', draw: drawVoltCrash },
  { name: 'shard_bomb',     cat: 'demolition', draw: drawShardBomb },
  { name: 'rad_flask',      cat: 'demolition', draw: drawRadFlask },
  { name: 'scorch_mark',    cat: 'demolition', draw: drawScorchMark },
  // SUPPORT (9)
  { name: 'patch_work',     cat: 'support', draw: drawPatchWork },
  { name: 'iron_will',      cat: 'support', draw: drawIronWill },
  { name: 'signal_flare',   cat: 'support', draw: drawSignalFlare },
  { name: 'haven_keeper',   cat: 'support', draw: drawHavenKeeper },
  { name: 'war_drum',       cat: 'support', draw: drawWarDrum },
  { name: 'spark_plug',     cat: 'support', draw: drawSparkPlug },
  { name: 'life_line',      cat: 'support', draw: drawLifeLine },
  { name: 'grid_lock',      cat: 'support', draw: drawGridLock },
  { name: 'supply_run',     cat: 'support', draw: drawSupplyRun },
  // JOB2 (10)
  { name: 'sentinel',       cat: 'job2', draw: drawSentinel },
  { name: 'bruiser',        cat: 'job2', draw: drawBruiser },
  { name: 'crusher',        cat: 'job2', draw: drawCrusher },
  { name: 'sniper',         cat: 'job2', draw: drawSniper },
  { name: 'gunslinger',     cat: 'job2', draw: drawGunslinger },
  { name: 'hunter',         cat: 'job2', draw: drawHunter },
  { name: 'arsonist',       cat: 'job2', draw: drawArsonist },
  { name: 'medic',          cat: 'job2', draw: drawMedic },
  { name: 'tactician',      cat: 'job2', draw: drawTactician },
  { name: 'engineer',       cat: 'job2', draw: drawEngineer },
];

// ════════════════════════════════════════════════
// SHARED DRAWING HELPERS
// ════════════════════════════════════════════════
function makeCanvas() {
  const c = createCanvas(SIZE, SIZE);
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  return { c, ctx };
}

function drawBackground(ctx, c1, c2) {
  const g = ctx.createRadialGradient(64, 58, 8, 64, 64, 72);
  g.addColorStop(0, c2);
  g.addColorStop(1, c1);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SIZE, SIZE);
}

function drawPortraitFrame(ctx) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(64, 64, 61, 0, Math.PI * 2);
  ctx.clip();
}

function drawBorderRing(ctx, borderColor) {
  ctx.restore();
  ctx.lineWidth = 3;
  ctx.strokeStyle = borderColor;
  ctx.beginPath();
  ctx.arc(64, 64, 62, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.strokeStyle = borderColor + '66';
  ctx.beginPath();
  ctx.arc(64, 64, 59, 0, Math.PI * 2);
  ctx.stroke();
}

function drawHead(ctx, x, y, w, h, skinBase, skinHi) {
  const g = ctx.createRadialGradient(x, y - h * 0.15, 2, x, y, Math.max(w, h));
  g.addColorStop(0, skinHi);
  g.addColorStop(1, skinBase);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawEyes(ctx, cx, cy, spacing, eyeColor, glowColor) {
  for (const ex of [cx - spacing, cx + spacing]) {
    if (glowColor) { ctx.shadowColor = glowColor; ctx.shadowBlur = 6; }
    ctx.fillStyle = '#E8E8E0';
    ctx.beginPath();
    ctx.ellipse(ex, cy, 5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.arc(ex, cy, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(ex, cy, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function drawGlowEyes(ctx, cx, cy, spacing, color) {
  for (const ex of [cx - spacing, cx + spacing]) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(ex, cy, 5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(ex, cy, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function drawShoulders(ctx, color, hiColor) {
  const g = ctx.createLinearGradient(20, 80, 108, 110);
  g.addColorStop(0, hiColor || color);
  g.addColorStop(1, color);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(44, 78);
  ctx.bezierCurveTo(44, 85, 40, 88, 20, 100);
  ctx.lineTo(10, 128);
  ctx.lineTo(118, 128);
  ctx.lineTo(108, 100);
  ctx.bezierCurveTo(88, 88, 84, 85, 84, 78);
  ctx.closePath();
  ctx.fill();
}

function drawNeck(ctx, skinBase) {
  ctx.fillStyle = skinBase;
  ctx.beginPath();
  ctx.moveTo(54, 72);
  ctx.lineTo(74, 72);
  ctx.lineTo(78, 85);
  ctx.lineTo(50, 85);
  ctx.closePath();
  ctx.fill();
}

function drawNose(ctx, cx, cy, shadow) {
  ctx.strokeStyle = shadow;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 4);
  ctx.bezierCurveTo(cx + 3, cy, cx + 2, cy + 4, cx, cy + 4);
  ctx.stroke();
}

function drawMouth(ctx, cx, cy, color, w) {
  ctx.strokeStyle = color || '#5A3030';
  ctx.lineWidth = w || 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy);
  ctx.bezierCurveTo(cx - 3, cy + 3, cx + 3, cy + 3, cx + 6, cy);
  ctx.stroke();
}

function drawHood(ctx, color, x, y, w, h) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x || 64, y || 36, w || 26, h || 18, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  // side drapes
  ctx.beginPath();
  ctx.moveTo((x||64) - (w||26), (y||36));
  ctx.bezierCurveTo((x||64) - (w||26) - 2, (y||36) + 20, (x||64) - (w||26) + 6, (y||36) + 30, (x||64) - 8, (y||36) + 34);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo((x||64) + (w||26), (y||36));
  ctx.bezierCurveTo((x||64) + (w||26) + 2, (y||36) + 20, (x||64) + (w||26) - 6, (y||36) + 30, (x||64) + 8, (y||36) + 34);
  ctx.fill();
}

function drawHelmet(ctx, color, hiColor) {
  const g = ctx.createLinearGradient(40, 20, 88, 50);
  g.addColorStop(0, hiColor || '#888');
  g.addColorStop(0.5, color);
  g.addColorStop(1, hiColor || '#888');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(64, 38, 24, 20, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  // brim
  ctx.beginPath();
  ctx.ellipse(64, 38, 26, 6, 0, 0, Math.PI);
  ctx.fill();
}

function drawBandana(ctx, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(38, 40);
  ctx.bezierCurveTo(38, 28, 90, 28, 90, 40);
  ctx.lineTo(86, 44);
  ctx.bezierCurveTo(86, 36, 42, 36, 42, 44);
  ctx.closePath();
  ctx.fill();
}

function drawGoggles(ctx, cx, cy, lensColor, frameColor) {
  const fc = frameColor || '#555';
  // strap
  ctx.strokeStyle = fc;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - 22, cy);
  ctx.lineTo(cx + 22, cy);
  ctx.stroke();
  // lenses
  for (const side of [-1, 1]) {
    const ex = cx + side * 9;
    ctx.fillStyle = fc;
    ctx.beginPath();
    ctx.ellipse(ex, cy, 9, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    const lg = ctx.createRadialGradient(ex - 1, cy - 1, 1, ex, cy, 7);
    lg.addColorStop(0, '#FFF');
    lg.addColorStop(0.3, lensColor);
    lg.addColorStop(1, '#111');
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.ellipse(ex, cy, 7, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawGasMask(ctx, color, canisterColor) {
  // mask body
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(64, 56, 18, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  // eye holes
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.ellipse(64 + side * 8, 50, 6, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    const lg = ctx.createRadialGradient(64 + side * 8, 50, 1, 64 + side * 8, 50, 5);
    lg.addColorStop(0, '#334');
    lg.addColorStop(1, '#111');
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.ellipse(64 + side * 8, 50, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // breather
  ctx.fillStyle = canisterColor || '#555';
  ctx.beginPath();
  ctx.ellipse(64, 64, 8, 6, 0, 0, Math.PI);
  ctx.fill();
  // filter canister
  ctx.fillStyle = canisterColor || '#555';
  ctx.beginPath();
  ctx.arc(64, 68, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawScar(ctx, x1, y1, x2, y2, color) {
  ctx.strokeStyle = color || '#AA5555';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.bezierCurveTo(x1 + 2, y1 + (y2 - y1) * 0.3, x2 - 2, y1 + (y2 - y1) * 0.7, x2, y2);
  ctx.stroke();
}

function drawBeard(ctx, cx, cy, color, w, h) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx - (w || 12), cy - 2);
  ctx.bezierCurveTo(cx - (w || 12), cy + (h || 14), cx + (w || 12), cy + (h || 14), cx + (w || 12), cy - 2);
  ctx.fill();
}

function drawFaceWrap(ctx, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(40, 54);
  ctx.lineTo(88, 54);
  ctx.lineTo(88, 72);
  ctx.bezierCurveTo(88, 78, 40, 78, 40, 72);
  ctx.closePath();
  ctx.fill();
  // wrap lines
  ctx.strokeStyle = '#00000033';
  ctx.lineWidth = 1;
  for (let y = 56; y < 72; y += 3) {
    ctx.beginPath();
    ctx.moveTo(42, y);
    ctx.lineTo(86, y);
    ctx.stroke();
  }
}

function drawCross(ctx, cx, cy, size, color) {
  ctx.fillStyle = color;
  const s = size || 6;
  ctx.fillRect(cx - s / 6, cy - s / 2, s / 3, s);
  ctx.fillRect(cx - s / 2, cy - s / 6, s, s / 3);
}

// ════════════════════════════════════════════════
// MELEE HEROES (RED)
// ════════════════════════════════════════════════

function drawIronFist(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  drawNeck(ctx, '#9B7044');
  drawShoulders(ctx, '#4A2A2A', '#6A3A3A');

  drawHead(ctx, 64, 48, 22, 26, '#8B6B3A', '#C49B60');

  // bald head highlight
  const hg = ctx.createRadialGradient(60, 32, 2, 64, 40, 20);
  hg.addColorStop(0, '#D4A870');
  hg.addColorStop(1, '#8B6B3A00');
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.ellipse(64, 38, 20, 14, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  // scars on face
  drawScar(ctx, 52, 38, 48, 56, '#AA5555');
  drawScar(ctx, 76, 42, 80, 58, '#AA5555');

  drawEyes(ctx, 64, 48, 9, '#886633', null);
  drawNose(ctx, 64, 54, '#6A4A2A');
  // fierce mouth - gritted teeth
  ctx.strokeStyle = '#5A2020';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(56, 62);
  ctx.lineTo(72, 62);
  ctx.stroke();
  ctx.strokeStyle = '#EEE';
  ctx.lineWidth = 1;
  for (let x = 57; x < 72; x += 3) {
    ctx.beginPath();
    ctx.moveTo(x, 61);
    ctx.lineTo(x, 63);
    ctx.stroke();
  }

  // metal wrappings on hands/shoulders
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 2;
  for (const sx of [26, 30, 98, 102]) {
    ctx.beginPath();
    ctx.moveTo(sx, 100);
    ctx.lineTo(sx, 115);
    ctx.stroke();
  }

  drawBorderRing(ctx, c.border);
}

function drawScrapKnight(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  drawNeck(ctx, '#8A6838');
  drawShoulders(ctx, '#555', '#777');

  // pauldrons
  for (const side of [-1, 1]) {
    const pg = ctx.createLinearGradient(64 + side * 30, 82, 64 + side * 50, 96);
    pg.addColorStop(0, '#888');
    pg.addColorStop(0.5, '#555');
    pg.addColorStop(1, '#777');
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.ellipse(64 + side * 40, 92, 16, 10, side * 0.3, 0, Math.PI * 2);
    ctx.fill();
    // rivets
    ctx.fillStyle = '#AAA';
    ctx.beginPath();
    ctx.arc(64 + side * 36, 88, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(64 + side * 44, 92, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  drawHead(ctx, 64, 48, 20, 24, '#8A6838', '#B89060');

  // plate helmet
  const hg = ctx.createLinearGradient(40, 18, 88, 48);
  hg.addColorStop(0, '#999');
  hg.addColorStop(0.4, '#666');
  hg.addColorStop(0.6, '#888');
  hg.addColorStop(1, '#555');
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.ellipse(64, 36, 24, 20, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  // visor slit
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.moveTo(44, 46);
  ctx.lineTo(84, 46);
  ctx.lineTo(82, 50);
  ctx.lineTo(46, 50);
  ctx.closePath();
  ctx.fill();
  // eye glints behind visor
  for (const ex of [55, 73]) {
    ctx.fillStyle = '#CCDDFF';
    ctx.beginPath();
    ctx.arc(ex, 48, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  // nose guard
  ctx.strokeStyle = '#777';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(64, 40);
  ctx.lineTo(64, 52);
  ctx.stroke();

  drawNose(ctx, 64, 55, '#6A4A2A');
  drawMouth(ctx, 64, 63, '#5A3030');
  drawBorderRing(ctx, c.border);
}

function drawRustBlade(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  drawNeck(ctx, '#A07848');
  drawShoulders(ctx, '#4A3A2A', '#6A5A3A');

  // rusted sword resting on right shoulder
  const sg = ctx.createLinearGradient(78, 20, 95, 100);
  sg.addColorStop(0, '#AA7733');
  sg.addColorStop(0.3, '#886633');
  sg.addColorStop(0.6, '#664422');
  sg.addColorStop(1, '#553311');
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.moveTo(85, 22);
  ctx.lineTo(89, 24);
  ctx.lineTo(92, 95);
  ctx.lineTo(88, 95);
  ctx.closePath();
  ctx.fill();
  // crossguard
  ctx.fillStyle = '#665544';
  ctx.fillRect(82, 90, 16, 4);

  drawHead(ctx, 64, 48, 21, 25, '#A07848', '#C8A070');

  // bandana
  drawBandana(ctx, '#993333');
  // bandana tail
  ctx.fillStyle = '#993333';
  ctx.beginPath();
  ctx.moveTo(86, 34);
  ctx.bezierCurveTo(92, 40, 96, 50, 94, 58);
  ctx.lineTo(90, 56);
  ctx.bezierCurveTo(90, 48, 88, 40, 84, 36);
  ctx.closePath();
  ctx.fill();

  drawEyes(ctx, 64, 48, 9, '#776633');
  drawNose(ctx, 64, 54, '#7A5838');
  drawMouth(ctx, 64, 62, '#5A3A2A');
  drawBorderRing(ctx, c.border);
}

function drawSlagBreaker(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  // thick neck
  ctx.fillStyle = '#8B6B3A';
  ctx.beginPath();
  ctx.moveTo(48, 70);
  ctx.lineTo(80, 70);
  ctx.lineTo(84, 88);
  ctx.lineTo(44, 88);
  ctx.closePath();
  ctx.fill();

  drawShoulders(ctx, '#555', '#777');
  drawHead(ctx, 64, 46, 24, 28, '#8B6B3A', '#B89060');

  // heavy jaw guard
  const jg = ctx.createLinearGradient(42, 56, 86, 72);
  jg.addColorStop(0, '#888');
  jg.addColorStop(0.5, '#666');
  jg.addColorStop(1, '#888');
  ctx.fillStyle = jg;
  ctx.beginPath();
  ctx.moveTo(42, 58);
  ctx.bezierCurveTo(42, 74, 86, 74, 86, 58);
  ctx.lineTo(84, 56);
  ctx.bezierCurveTo(84, 68, 44, 68, 44, 56);
  ctx.closePath();
  ctx.fill();

  // molten orange eyes
  drawGlowEyes(ctx, 64, 48, 10, '#FF8833');
  drawBorderRing(ctx, c.border);
}

function drawAshWarden(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  drawNeck(ctx, '#7A5A34');
  drawShoulders(ctx, '#333', '#444');

  drawHead(ctx, 64, 50, 21, 25, '#7A5A34', '#A08050');

  // ash coating on face
  ctx.fillStyle = '#44444466';
  ctx.beginPath();
  ctx.ellipse(64, 50, 21, 25, 0, 0, Math.PI * 2);
  ctx.fill();

  // dark hood
  drawHood(ctx, '#222', 64, 36, 27, 20);

  // glowing ember eyes
  drawGlowEyes(ctx, 64, 50, 9, '#FF4422');
  drawNose(ctx, 64, 56, '#5A3A1A');
  drawMouth(ctx, 64, 64, '#444', 1.5);
  drawBorderRing(ctx, c.border);
}

function drawBoneCrusher(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  drawNeck(ctx, '#9B7044');
  drawShoulders(ctx, '#3A2020', '#5A3030');

  drawHead(ctx, 64, 50, 24, 28, '#9B7044', '#C49B60');

  // skull face paint
  ctx.fillStyle = '#EEE';
  ctx.beginPath();
  ctx.ellipse(64, 52, 18, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  // dark eye sockets
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.ellipse(64 + side * 8, 48, 6, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    // eye inside socket
    ctx.fillStyle = '#CC2222';
    ctx.beginPath();
    ctx.arc(64 + side * 8, 48, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  // nose hole
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.moveTo(62, 56);
  ctx.lineTo(66, 56);
  ctx.lineTo(64, 59);
  ctx.closePath();
  ctx.fill();
  // teeth line
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(54, 64);
  ctx.lineTo(74, 64);
  ctx.stroke();
  for (let x = 55; x < 74; x += 4) {
    ctx.beginPath();
    ctx.moveTo(x, 62);
    ctx.lineTo(x, 66);
    ctx.stroke();
  }

  // mohawk
  const mg = ctx.createLinearGradient(56, 10, 72, 10);
  mg.addColorStop(0, '#333');
  mg.addColorStop(1, '#555');
  ctx.fillStyle = mg;
  ctx.beginPath();
  ctx.moveTo(54, 38);
  ctx.bezierCurveTo(56, 14, 60, 6, 64, 4);
  ctx.bezierCurveTo(68, 6, 72, 14, 74, 38);
  ctx.bezierCurveTo(70, 30, 58, 30, 54, 38);
  ctx.fill();

  drawBorderRing(ctx, c.border);
}

function drawChainRunner(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  drawNeck(ctx, '#8B6B3A');
  drawShoulders(ctx, '#444', '#666');

  // chains around neck/shoulders
  ctx.strokeStyle = '#999';
  ctx.lineWidth = 3;
  for (let i = 0; i < 3; i++) {
    const y = 78 + i * 6;
    ctx.beginPath();
    ctx.moveTo(30, y);
    ctx.bezierCurveTo(50, y + 4, 78, y + 4, 98, y);
    ctx.stroke();
  }
  // chain links
  ctx.strokeStyle = '#AAA';
  ctx.lineWidth = 1.5;
  for (let x = 32; x < 98; x += 8) {
    ctx.beginPath();
    ctx.ellipse(x, 82, 3, 2, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  drawHead(ctx, 64, 48, 21, 25, '#8B6B3A', '#B89060');

  // wild hair
  ctx.fillStyle = '#444';
  ctx.beginPath();
  ctx.moveTo(38, 50);
  ctx.bezierCurveTo(36, 30, 44, 18, 54, 16);
  ctx.bezierCurveTo(58, 14, 70, 14, 74, 16);
  ctx.bezierCurveTo(84, 18, 92, 30, 90, 50);
  ctx.bezierCurveTo(86, 38, 42, 38, 38, 50);
  ctx.fill();
  // wild spikes
  for (const sx of [-16, -8, 0, 8, 16]) {
    ctx.beginPath();
    ctx.moveTo(64 + sx - 3, 24);
    ctx.lineTo(64 + sx, 12 + Math.abs(sx) * 0.3);
    ctx.lineTo(64 + sx + 3, 24);
    ctx.fill();
  }

  drawEyes(ctx, 64, 48, 9, '#997744');
  drawNose(ctx, 64, 54, '#6A4A2A');
  drawMouth(ctx, 64, 62, '#5A3030');
  drawBorderRing(ctx, c.border);
}

function drawVaultGuard(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  drawNeck(ctx, '#8A6838');
  drawShoulders(ctx, '#444', '#666');

  // armored collar
  const cg = ctx.createLinearGradient(36, 74, 92, 88);
  cg.addColorStop(0, '#777');
  cg.addColorStop(0.5, '#555');
  cg.addColorStop(1, '#777');
  ctx.fillStyle = cg;
  ctx.beginPath();
  ctx.moveTo(36, 76);
  ctx.lineTo(92, 76);
  ctx.lineTo(96, 90);
  ctx.lineTo(32, 90);
  ctx.closePath();
  ctx.fill();

  drawHead(ctx, 64, 48, 21, 25, '#8A6838', '#B89060');

  // riot helmet
  const hg = ctx.createLinearGradient(38, 16, 90, 50);
  hg.addColorStop(0, '#666');
  hg.addColorStop(0.3, '#444');
  hg.addColorStop(0.6, '#555');
  hg.addColorStop(1, '#333');
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.ellipse(64, 34, 26, 22, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  // face shield (visor)
  const vg = ctx.createLinearGradient(42, 42, 86, 58);
  vg.addColorStop(0, '#33557788');
  vg.addColorStop(0.5, '#22446688');
  vg.addColorStop(1, '#33557788');
  ctx.fillStyle = vg;
  ctx.beginPath();
  ctx.moveTo(42, 42);
  ctx.lineTo(86, 42);
  ctx.lineTo(84, 56);
  ctx.bezierCurveTo(84, 60, 44, 60, 44, 56);
  ctx.closePath();
  ctx.fill();
  // visor glint
  ctx.strokeStyle = '#FFFFFF44';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(50, 46);
  ctx.lineTo(78, 44);
  ctx.stroke();

  // eyes behind visor
  for (const ex of [55, 73]) {
    ctx.fillStyle = '#AACCFF';
    ctx.beginPath();
    ctx.arc(ex, 50, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  drawBorderRing(ctx, c.border);
}

function drawWastelandEdge(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  drawNeck(ctx, '#A07848');
  drawShoulders(ctx, '#3A3A3A', '#555');

  drawHead(ctx, 64, 48, 20, 24, '#A07848', '#C8A070');

  // lean angular face - sharper jaw
  ctx.fillStyle = '#A07848';
  ctx.beginPath();
  ctx.moveTo(44, 50);
  ctx.lineTo(64, 74);
  ctx.lineTo(84, 50);
  ctx.closePath();
  ctx.fill();

  // short dark hair
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.ellipse(64, 36, 22, 14, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  // knife scar across left eye
  ctx.strokeStyle = '#CC6666';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(48, 38);
  ctx.bezierCurveTo(52, 44, 54, 52, 50, 60);
  ctx.stroke();

  drawEyes(ctx, 64, 48, 9, '#8899AA');
  // scarred left eye has whitish tint
  ctx.fillStyle = '#BBAAAA44';
  ctx.beginPath();
  ctx.ellipse(55, 48, 5, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  drawNose(ctx, 64, 54, '#7A5838');
  drawMouth(ctx, 64, 62, '#5A3A2A', 1);
  drawBorderRing(ctx, c.border);
}

// ════════════════════════════════════════════════
// RANGER HEROES (GREEN)
// ════════════════════════════════════════════════

function drawDeadShot(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  drawNeck(ctx, '#A07848');
  drawShoulders(ctx, '#3A3A3A', '#4A4A4A');

  drawHead(ctx, 64, 50, 21, 25, '#A07848', '#C8A070');

  // hood
  drawHood(ctx, '#3A4A3A');

  // calm normal left eye
  ctx.fillStyle = '#E8E8E0';
  ctx.beginPath();
  ctx.ellipse(55, 50, 5, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#556644';
  ctx.beginPath();
  ctx.arc(55, 50, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(55, 50, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // sniper scope over right eye
  const sg = ctx.createRadialGradient(73, 50, 1, 73, 50, 8);
  sg.addColorStop(0, '#44FF44');
  sg.addColorStop(0.5, '#228822');
  sg.addColorStop(1, '#113311');
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.arc(73, 50, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(73, 50, 9, 0, Math.PI * 2);
  ctx.stroke();
  // crosshair
  ctx.strokeStyle = '#44FF44';
  ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(73, 43); ctx.lineTo(73, 57); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(65, 50); ctx.lineTo(81, 50); ctx.stroke();

  drawNose(ctx, 63, 56, '#7A5838');
  drawMouth(ctx, 63, 64, '#5A3A2A');
  drawBorderRing(ctx, c.border);
}

function drawDustHawk(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  drawNeck(ctx, '#9B7044');
  drawShoulders(ctx, '#554433', '#776655');

  drawHead(ctx, 64, 50, 21, 25, '#9B7044', '#C49B60');

  // windswept hair
  ctx.fillStyle = '#665533';
  ctx.beginPath();
  ctx.moveTo(38, 46);
  ctx.bezierCurveTo(36, 26, 48, 16, 64, 18);
  ctx.bezierCurveTo(80, 16, 96, 22, 100, 36);
  ctx.bezierCurveTo(102, 44, 98, 48, 94, 44);
  ctx.bezierCurveTo(90, 38, 42, 36, 38, 46);
  ctx.fill();

  // aviator goggles pushed up on forehead
  drawGoggles(ctx, 64, 34, '#AACC88', '#665544');

  drawEyes(ctx, 64, 50, 9, '#778844');
  drawNose(ctx, 64, 56, '#7A5838');
  drawMouth(ctx, 64, 64, '#5A3A2A');
  drawBorderRing(ctx, c.border);
}

function drawScrapArcher(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  drawNeck(ctx, '#8A6838');
  drawShoulders(ctx, '#444', '#555');

  // quiver visible over right shoulder
  ctx.fillStyle = '#664422';
  ctx.beginPath();
  ctx.moveTo(90, 78);
  ctx.lineTo(94, 30);
  ctx.lineTo(98, 32);
  ctx.lineTo(96, 80);
  ctx.closePath();
  ctx.fill();
  // arrow tips
  for (let y = 32; y < 42; y += 4) {
    ctx.fillStyle = '#AAA';
    ctx.beginPath();
    ctx.moveTo(92, y);
    ctx.lineTo(96, y - 3);
    ctx.lineTo(96, y + 1);
    ctx.closePath();
    ctx.fill();
  }

  drawHead(ctx, 64, 50, 21, 25, '#8A6838', '#B89060');

  // hood with face wrap
  drawHood(ctx, '#556644');
  drawFaceWrap(ctx, '#667755');

  // only eyes visible
  drawEyes(ctx, 64, 48, 9, '#558833');
  drawBorderRing(ctx, c.border);
}

function drawNeonTrigger(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  drawNeck(ctx, '#8A6838');
  drawShoulders(ctx, '#333', '#444');

  drawHead(ctx, 64, 50, 20, 24, '#8A6838', '#B89060');

  // sleek helmet
  const hg = ctx.createLinearGradient(38, 18, 90, 50);
  hg.addColorStop(0, '#444');
  hg.addColorStop(0.5, '#333');
  hg.addColorStop(1, '#444');
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.ellipse(64, 38, 24, 22, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(40, 38);
  ctx.lineTo(40, 52);
  ctx.bezierCurveTo(40, 58, 88, 58, 88, 52);
  ctx.lineTo(88, 38);
  ctx.closePath();
  ctx.fill();

  // glowing cyan visor
  ctx.shadowColor = '#00FFFF';
  ctx.shadowBlur = 12;
  const vg = ctx.createLinearGradient(42, 46, 86, 52);
  vg.addColorStop(0, '#00DDDD');
  vg.addColorStop(0.5, '#00FFFF');
  vg.addColorStop(1, '#00DDDD');
  ctx.fillStyle = vg;
  ctx.beginPath();
  ctx.moveTo(44, 46);
  ctx.lineTo(84, 46);
  ctx.lineTo(82, 52);
  ctx.lineTo(46, 52);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  drawNose(ctx, 64, 58, '#6A4A2A');
  drawMouth(ctx, 64, 66, '#555');
  drawBorderRing(ctx, c.border);
}

function drawWindStalker(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  drawNeck(ctx, '#9B7044');
  drawShoulders(ctx, '#444433', '#665544');

  drawHead(ctx, 64, 50, 21, 25, '#9B7044', '#C49B60');

  // feathered hood
  ctx.fillStyle = '#556644';
  ctx.beginPath();
  ctx.ellipse(64, 36, 27, 20, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  // feathers
  for (const [fx, fy, rot] of [[44, 24, -0.4], [54, 18, -0.2], [64, 16, 0], [74, 18, 0.2], [84, 24, 0.4]]) {
    ctx.fillStyle = '#778866';
    ctx.beginPath();
    ctx.ellipse(fx, fy, 3, 10, rot, 0, Math.PI * 2);
    ctx.fill();
    // feather spine
    ctx.strokeStyle = '#445533';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(fx, fy - 8);
    ctx.lineTo(fx, fy + 8);
    ctx.stroke();
  }

  // face paint - tribal stripes
  ctx.strokeStyle = '#33AA55';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(48, 44); ctx.lineTo(44, 56); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(80, 44); ctx.lineTo(84, 56); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(52, 50); ctx.lineTo(48, 58); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(76, 50); ctx.lineTo(80, 58); ctx.stroke();

  // piercing eyes
  drawEyes(ctx, 64, 50, 9, '#33CC33', '#33FF33');
  drawNose(ctx, 64, 56, '#7A5838');
  drawMouth(ctx, 64, 64, '#5A3A2A');
  drawBorderRing(ctx, c.border);
}

function drawIronSight(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  drawNeck(ctx, '#A07848');
  drawShoulders(ctx, '#3A4A3A', '#556655');

  drawHead(ctx, 64, 50, 21, 25, '#A07848', '#C8A070');

  // military beret
  ctx.fillStyle = '#4A5A4A';
  ctx.beginPath();
  ctx.ellipse(64, 36, 24, 14, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  // beret top flop
  ctx.beginPath();
  ctx.moveTo(64, 22);
  ctx.bezierCurveTo(78, 20, 90, 26, 88, 36);
  ctx.lineTo(76, 34);
  ctx.bezierCurveTo(78, 28, 72, 24, 64, 26);
  ctx.closePath();
  ctx.fill();

  // mechanical targeting eyepiece on left eye
  ctx.fillStyle = '#555';
  ctx.beginPath();
  ctx.arc(55, 50, 9, 0, Math.PI * 2);
  ctx.fill();
  const lg = ctx.createRadialGradient(55, 50, 1, 55, 50, 7);
  lg.addColorStop(0, '#FF3333');
  lg.addColorStop(0.5, '#AA1111');
  lg.addColorStop(1, '#331111');
  ctx.fillStyle = lg;
  ctx.beginPath();
  ctx.arc(55, 50, 7, 0, Math.PI * 2);
  ctx.fill();
  // targeting lines
  ctx.strokeStyle = '#FF4444';
  ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(55, 44); ctx.lineTo(55, 56); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(49, 50); ctx.lineTo(61, 50); ctx.stroke();
  // arm extending to ear
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(46, 50);
  ctx.lineTo(38, 44);
  ctx.stroke();

  // normal right eye
  ctx.fillStyle = '#E8E8E0';
  ctx.beginPath(); ctx.ellipse(73, 50, 5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#556644';
  ctx.beginPath(); ctx.arc(73, 50, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(73, 50, 1.2, 0, Math.PI * 2); ctx.fill();

  drawNose(ctx, 64, 56, '#7A5838');
  drawMouth(ctx, 64, 64, '#5A3A2A');
  drawBorderRing(ctx, c.border);
}

function drawFlashBang(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  drawNeck(ctx, '#9B7044');
  drawShoulders(ctx, '#444', '#666');

  drawHead(ctx, 64, 50, 21, 25, '#9B7044', '#C49B60');

  // short spiky hair
  ctx.fillStyle = '#554433';
  ctx.beginPath();
  ctx.ellipse(64, 36, 22, 14, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  // dark goggles
  drawGoggles(ctx, 64, 44, '#FFFF88', '#333');

  // bright flash reflection on lenses
  ctx.shadowColor = '#FFFFAA';
  ctx.shadowBlur = 8;
  for (const ex of [55, 73]) {
    ctx.fillStyle = '#FFFFCC';
    ctx.beginPath();
    ctx.arc(ex, 43, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  drawNose(ctx, 64, 54, '#7A5838');
  // grin
  ctx.strokeStyle = '#5A3A2A';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(54, 62);
  ctx.bezierCurveTo(58, 67, 70, 67, 74, 62);
  ctx.stroke();
  // teeth
  ctx.fillStyle = '#EEE';
  ctx.beginPath();
  ctx.moveTo(56, 62);
  ctx.bezierCurveTo(60, 66, 68, 66, 72, 62);
  ctx.closePath();
  ctx.fill();

  drawBorderRing(ctx, c.border);
}

function drawLongbowJack(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  drawNeck(ctx, '#9B7044');
  drawShoulders(ctx, '#554433', '#776655');

  // bow string visible behind
  ctx.strokeStyle = '#AA9977';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(92, 14);
  ctx.bezierCurveTo(88, 50, 88, 80, 92, 120);
  ctx.stroke();
  // bow limb
  ctx.strokeStyle = '#664422';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(94, 10);
  ctx.bezierCurveTo(98, 40, 98, 90, 94, 124);
  ctx.stroke();

  drawHead(ctx, 64, 50, 21, 25, '#9B7044', '#C49B60');

  // wide-brim hat
  ctx.fillStyle = '#554433';
  ctx.beginPath();
  ctx.ellipse(64, 38, 32, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#665544';
  ctx.beginPath();
  ctx.ellipse(64, 34, 20, 14, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  // beard
  drawBeard(ctx, 64, 60, '#776655', 14, 16);

  drawEyes(ctx, 64, 48, 9, '#887744');
  drawNose(ctx, 64, 54, '#7A5838');
  drawBorderRing(ctx, c.border);
}

function drawRuinScout(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  drawNeck(ctx, '#8A6838');
  drawShoulders(ctx, '#556644', '#778866');

  // binoculars around neck
  ctx.fillStyle = '#444';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(64 + side * 10, 82, 5, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(54, 78);
  ctx.bezierCurveTo(54, 72, 74, 72, 74, 78);
  ctx.stroke();
  // strap
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(54, 76);
  ctx.bezierCurveTo(50, 70, 50, 60, 56, 50);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(74, 76);
  ctx.bezierCurveTo(78, 70, 78, 60, 72, 50);
  ctx.stroke();

  drawHead(ctx, 64, 48, 21, 25, '#8A6838', '#B89060');

  // beanie
  ctx.fillStyle = '#445544';
  ctx.beginPath();
  ctx.ellipse(64, 34, 23, 16, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(41, 34);
  ctx.lineTo(87, 34);
  ctx.lineTo(87, 40);
  ctx.lineTo(41, 40);
  ctx.closePath();
  ctx.fill();
  // beanie ribbing
  ctx.strokeStyle = '#334433';
  ctx.lineWidth = 1;
  for (let x = 44; x < 86; x += 4) {
    ctx.beginPath();
    ctx.moveTo(x, 20);
    ctx.lineTo(x, 40);
    ctx.stroke();
  }

  // camo face paint
  ctx.fillStyle = '#55664433';
  ctx.beginPath(); ctx.ellipse(52, 48, 8, 4, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#44553322';
  ctx.beginPath(); ctx.ellipse(76, 52, 6, 5, -0.3, 0, Math.PI * 2); ctx.fill();

  drawEyes(ctx, 64, 48, 9, '#668844');
  drawNose(ctx, 64, 54, '#6A4A2A');
  drawMouth(ctx, 64, 62, '#5A3A2A');
  drawBorderRing(ctx, c.border);
}

// ════════════════════════════════════════════════
// DEMOLITION HEROES (BLUE)
// ════════════════════════════════════════════════

function drawBlastCore(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  drawNeck(ctx, '#9B7044');
  drawShoulders(ctx, '#3A3A4A', '#5A5A6A');

  drawHead(ctx, 64, 50, 21, 25, '#9B7044', '#C49B60');

  // soot on face
  ctx.fillStyle = '#33333344';
  ctx.beginPath();
  ctx.ellipse(64, 52, 20, 24, 0, 0, Math.PI * 2);
  ctx.fill();

  // blast visor with cracks
  const vg = ctx.createLinearGradient(40, 36, 88, 50);
  vg.addColorStop(0, '#555');
  vg.addColorStop(0.5, '#444');
  vg.addColorStop(1, '#555');
  ctx.fillStyle = vg;
  ctx.beginPath();
  ctx.moveTo(40, 36);
  ctx.lineTo(88, 36);
  ctx.lineTo(86, 50);
  ctx.bezierCurveTo(86, 56, 42, 56, 42, 50);
  ctx.closePath();
  ctx.fill();
  // visor glass
  const gg = ctx.createLinearGradient(44, 40, 84, 50);
  gg.addColorStop(0, '#33557788');
  gg.addColorStop(0.5, '#4466AA66');
  gg.addColorStop(1, '#33557788');
  ctx.fillStyle = gg;
  ctx.beginPath();
  ctx.moveTo(44, 40);
  ctx.lineTo(84, 40);
  ctx.lineTo(82, 50);
  ctx.bezierCurveTo(82, 54, 46, 54, 46, 50);
  ctx.closePath();
  ctx.fill();
  // cracks
  ctx.strokeStyle = '#FFFFFF55';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(60, 42); ctx.lineTo(55, 50); ctx.lineTo(58, 54); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(72, 44); ctx.lineTo(76, 52); ctx.stroke();

  drawNose(ctx, 64, 58, '#6A4A2A');
  drawMouth(ctx, 64, 66, '#5A3A2A');
  drawBorderRing(ctx, c.border);
}

function drawCinderMaw(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  drawNeck(ctx, '#7A5A34');
  drawShoulders(ctx, '#3A3A3A', '#555');

  drawHead(ctx, 64, 48, 22, 26, '#7A5A34', '#A08050');

  // respirator mask
  ctx.fillStyle = '#555';
  ctx.beginPath();
  ctx.ellipse(64, 58, 18, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  // mask details
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 1;
  for (let y = 52; y < 66; y += 3) {
    ctx.beginPath();
    ctx.moveTo(50, y);
    ctx.lineTo(78, y);
    ctx.stroke();
  }
  // orange glow from within
  ctx.shadowColor = '#FF6600';
  ctx.shadowBlur = 12;
  const og = ctx.createRadialGradient(64, 60, 2, 64, 60, 12);
  og.addColorStop(0, '#FF660066');
  og.addColorStop(1, '#FF660000');
  ctx.fillStyle = og;
  ctx.beginPath();
  ctx.ellipse(64, 60, 14, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // dark eyes above mask
  drawEyes(ctx, 64, 46, 9, '#AA6633', '#FF8844');

  // forehead/hair
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.ellipse(64, 34, 22, 14, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  drawBorderRing(ctx, c.border);
}

function drawFuseWire(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  drawNeck(ctx, '#9B7044');
  drawShoulders(ctx, '#444', '#555');

  drawHead(ctx, 64, 50, 21, 25, '#9B7044', '#C49B60');

  // messy hair with wires tangled in
  ctx.fillStyle = '#554433';
  ctx.beginPath();
  ctx.moveTo(38, 48);
  ctx.bezierCurveTo(36, 24, 50, 12, 64, 14);
  ctx.bezierCurveTo(78, 12, 92, 24, 90, 48);
  ctx.bezierCurveTo(86, 34, 42, 34, 38, 48);
  ctx.fill();
  // wires
  ctx.strokeStyle = '#3388FF';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(48, 20); ctx.bezierCurveTo(44, 28, 50, 32, 46, 40); ctx.stroke();
  ctx.strokeStyle = '#FF3333';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(72, 18); ctx.bezierCurveTo(78, 24, 74, 30, 80, 38); ctx.stroke();
  ctx.strokeStyle = '#FFCC00';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(58, 16); ctx.bezierCurveTo(54, 22, 60, 28, 56, 36); ctx.stroke();

  // goggles on forehead
  drawGoggles(ctx, 64, 34, '#AABBCC', '#666');

  drawEyes(ctx, 64, 50, 9, '#5588CC');

  drawNose(ctx, 64, 56, '#7A5838');

  // manic grin
  ctx.strokeStyle = '#5A3A2A';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(52, 62);
  ctx.bezierCurveTo(56, 70, 72, 70, 76, 62);
  ctx.stroke();
  ctx.fillStyle = '#EEE';
  ctx.beginPath();
  ctx.moveTo(54, 63);
  ctx.bezierCurveTo(58, 68, 70, 68, 74, 63);
  ctx.closePath();
  ctx.fill();

  drawBorderRing(ctx, c.border);
}

function drawAcidRain(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  drawNeck(ctx, '#7A5A34');
  drawShoulders(ctx, '#3A4A3A', '#556655');

  drawHead(ctx, 64, 48, 22, 26, '#7A5A34', '#A08050');

  // full face chemical mask
  const mg = ctx.createLinearGradient(40, 30, 88, 72);
  mg.addColorStop(0, '#555');
  mg.addColorStop(0.5, '#444');
  mg.addColorStop(1, '#555');
  ctx.fillStyle = mg;
  ctx.beginPath();
  ctx.ellipse(64, 54, 22, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  // large round eye ports
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(64 + side * 10, 48, 8, 0, Math.PI * 2);
    ctx.fill();
    // green tinted glass
    const eg = ctx.createRadialGradient(64 + side * 10, 48, 1, 64 + side * 10, 48, 7);
    eg.addColorStop(0, '#44FF44');
    eg.addColorStop(1, '#114411');
    ctx.fillStyle = eg;
    ctx.beginPath();
    ctx.arc(64 + side * 10, 48, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // dripping green from mask
  ctx.fillStyle = '#33CC33';
  for (const dx of [-8, -2, 6, 12]) {
    const dh = 6 + Math.abs(dx) * 0.5;
    ctx.beginPath();
    ctx.moveTo(56 + dx, 72);
    ctx.bezierCurveTo(56 + dx, 72 + dh, 58 + dx, 72 + dh + 4, 57 + dx, 72 + dh + 6);
    ctx.bezierCurveTo(56 + dx, 72 + dh + 4, 54 + dx, 72 + dh, 54 + dx, 72);
    ctx.fill();
  }

  drawBorderRing(ctx, c.border);
}

function drawSmokeStack(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  drawNeck(ctx, '#7A5A34');
  drawShoulders(ctx, '#333', '#444');

  // dark hood
  drawHood(ctx, '#222');

  drawHead(ctx, 64, 50, 20, 24, '#7A5A34', '#A08050');

  // gas mask with dual canisters
  drawGasMask(ctx, '#555', '#666');

  // dual side canisters
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#666';
    ctx.beginPath();
    ctx.ellipse(64 + side * 24, 58, 6, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    // canister lines
    ctx.strokeStyle = '#777';
    ctx.lineWidth = 1;
    for (let y = 52; y < 64; y += 3) {
      ctx.beginPath();
      ctx.moveTo(64 + side * 24 - 4, y);
      ctx.lineTo(64 + side * 24 + 4, y);
      ctx.stroke();
    }
    // tube connecting to mask
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(64 + side * 18, 56);
    ctx.lineTo(64 + side * 24, 56);
    ctx.stroke();
  }

  drawBorderRing(ctx, c.border);
}

function drawVoltCrash(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  drawNeck(ctx, '#9B7044');
  drawShoulders(ctx, '#3A3A4A', '#5A5A6A');

  drawHead(ctx, 64, 50, 21, 25, '#9B7044', '#C49B60');

  // spiky hair standing up (electrified)
  ctx.fillStyle = '#556677';
  for (const [sx, sy, h] of [[-14, 30, -18], [-8, 24, -22], [-2, 20, -24], [4, 18, -26], [10, 20, -24], [16, 24, -20]]) {
    ctx.beginPath();
    ctx.moveTo(64 + sx - 3, sy + 20);
    ctx.lineTo(64 + sx, sy + h + 20);
    ctx.lineTo(64 + sx + 3, sy + 20);
    ctx.closePath();
    ctx.fill();
  }

  // electric arcs around head
  ctx.strokeStyle = '#88CCFF';
  ctx.lineWidth = 1.5;
  ctx.shadowColor = '#88CCFF';
  ctx.shadowBlur = 8;
  // arc left
  ctx.beginPath();
  ctx.moveTo(34, 40);
  ctx.lineTo(38, 36);
  ctx.lineTo(42, 42);
  ctx.lineTo(46, 34);
  ctx.stroke();
  // arc right
  ctx.beginPath();
  ctx.moveTo(94, 40);
  ctx.lineTo(90, 36);
  ctx.lineTo(86, 42);
  ctx.lineTo(82, 34);
  ctx.stroke();
  // arc top
  ctx.beginPath();
  ctx.moveTo(54, 14);
  ctx.lineTo(58, 10);
  ctx.lineTo(62, 16);
  ctx.lineTo(66, 8);
  ctx.lineTo(70, 14);
  ctx.lineTo(74, 10);
  ctx.stroke();
  ctx.shadowBlur = 0;

  drawEyes(ctx, 64, 50, 9, '#88CCFF', '#88DDFF');
  drawNose(ctx, 64, 56, '#7A5838');
  drawMouth(ctx, 64, 64, '#5A3A2A');
  drawBorderRing(ctx, c.border);
}

function drawShardBomb(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  drawNeck(ctx, '#8B6B3A');
  drawShoulders(ctx, '#3A3A4A', '#555');

  drawHead(ctx, 64, 50, 21, 25, '#8B6B3A', '#B89060');

  // bandaged head
  ctx.strokeStyle = '#CCBBAA';
  ctx.lineWidth = 3;
  for (const [y, xo] of [[32, 0], [36, 2], [40, 3]]) {
    ctx.beginPath();
    ctx.moveTo(42 + xo, y);
    ctx.lineTo(86 - xo, y);
    ctx.stroke();
  }
  // diagonal wrap
  ctx.beginPath();
  ctx.moveTo(48, 30);
  ctx.lineTo(76, 44);
  ctx.stroke();

  // shrapnel scars
  drawScar(ctx, 52, 42, 48, 54, '#AA6666');
  drawScar(ctx, 70, 40, 74, 52, '#AA6666');
  drawScar(ctx, 58, 56, 56, 64, '#AA6666');

  // one eye (right eye covered by bandage)
  ctx.fillStyle = '#CCBBAA';
  ctx.beginPath();
  ctx.ellipse(73, 48, 7, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // visible left eye
  ctx.fillStyle = '#E8E8E0';
  ctx.beginPath(); ctx.ellipse(55, 48, 5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#5577AA';
  ctx.beginPath(); ctx.arc(55, 48, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(55, 48, 1.2, 0, Math.PI * 2); ctx.fill();

  drawNose(ctx, 64, 55, '#6A4A2A');
  drawMouth(ctx, 64, 63, '#5A3A2A');
  drawBorderRing(ctx, c.border);
}

function drawRadFlask(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  drawNeck(ctx, '#8A6838');
  drawShoulders(ctx, '#444', '#666');

  // hazmat collar
  ctx.fillStyle = '#999922';
  ctx.beginPath();
  ctx.moveTo(34, 78);
  ctx.lineTo(94, 78);
  ctx.lineTo(98, 94);
  ctx.lineTo(30, 94);
  ctx.closePath();
  ctx.fill();

  drawHead(ctx, 64, 50, 21, 25, '#8A6838', '#B89060');

  // radiation goggles
  drawGoggles(ctx, 64, 46, '#44FF44', '#555');

  // green glow around head
  ctx.shadowColor = '#44FF44';
  ctx.shadowBlur = 15;
  ctx.strokeStyle = '#44FF4433';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(64, 50, 28, 30, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // short hair
  ctx.fillStyle = '#444';
  ctx.beginPath();
  ctx.ellipse(64, 36, 22, 14, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  drawNose(ctx, 64, 56, '#6A4A2A');
  drawMouth(ctx, 64, 64, '#5A3A2A');
  drawBorderRing(ctx, c.border);
}

function drawScorchMark(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  drawNeck(ctx, '#8B6B3A');
  drawShoulders(ctx, '#3A3A4A', '#555');

  drawHead(ctx, 64, 50, 21, 25, '#8B6B3A', '#B89060');

  // burn scars on right half of face
  ctx.fillStyle = '#884444';
  ctx.beginPath();
  ctx.moveTo(64, 30);
  ctx.bezierCurveTo(78, 32, 86, 44, 86, 56);
  ctx.bezierCurveTo(86, 68, 78, 76, 64, 74);
  ctx.bezierCurveTo(68, 70, 72, 60, 72, 50);
  ctx.bezierCurveTo(72, 40, 68, 34, 64, 30);
  ctx.closePath();
  ctx.fill();
  // scar tissue texture
  ctx.strokeStyle = '#993333';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 6; i++) {
    const y = 38 + i * 6;
    ctx.beginPath();
    ctx.moveTo(68, y);
    ctx.bezierCurveTo(72, y + 2, 78, y + 1, 82, y + 3);
    ctx.stroke();
  }

  // normal left eye
  ctx.fillStyle = '#E8E8E0';
  ctx.beginPath(); ctx.ellipse(55, 50, 5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#5577AA';
  ctx.beginPath(); ctx.arc(55, 50, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(55, 50, 1.2, 0, Math.PI * 2); ctx.fill();

  // cybernetic eye replacement (right)
  const cg = ctx.createRadialGradient(73, 50, 1, 73, 50, 6);
  cg.addColorStop(0, '#FFFFFF');
  cg.addColorStop(0.3, '#3388FF');
  cg.addColorStop(1, '#113355');
  ctx.fillStyle = cg;
  ctx.shadowColor = '#3388FF';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(73, 50, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(73, 50, 7, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // short hair
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.ellipse(64, 36, 22, 14, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  drawNose(ctx, 64, 56, '#6A4A2A');
  drawMouth(ctx, 64, 64, '#5A3A2A');
  drawBorderRing(ctx, c.border);
}

// ════════════════════════════════════════════════
// SUPPORT HEROES (GOLD)
// ════════════════════════════════════════════════

function drawPatchWork(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  drawNeck(ctx, '#9B7044');
  drawShoulders(ctx, '#554433', '#776655');

  drawHead(ctx, 64, 50, 21, 25, '#9B7044', '#C49B60');

  // medical cross on headband
  ctx.fillStyle = '#EEE';
  ctx.beginPath();
  ctx.moveTo(40, 38);
  ctx.lineTo(88, 38);
  ctx.lineTo(88, 44);
  ctx.lineTo(40, 44);
  ctx.closePath();
  ctx.fill();
  drawCross(ctx, 64, 41, 10, '#CC2222');

  // stubble
  ctx.fillStyle = '#7A5A3444';
  ctx.beginPath();
  ctx.ellipse(64, 64, 14, 8, 0, 0, Math.PI);
  ctx.fill();

  // kind eyes
  drawEyes(ctx, 64, 50, 9, '#668844');
  // slight smile lines
  ctx.strokeStyle = '#8A6838';
  ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(48, 48); ctx.bezierCurveTo(46, 52, 46, 54, 48, 56); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(80, 48); ctx.bezierCurveTo(82, 52, 82, 54, 80, 56); ctx.stroke();

  drawNose(ctx, 64, 56, '#7A5838');
  // warm smile
  ctx.strokeStyle = '#5A3A2A';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(56, 64);
  ctx.bezierCurveTo(60, 68, 68, 68, 72, 64);
  ctx.stroke();

  drawBorderRing(ctx, c.border);
}

function drawIronWill(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  drawNeck(ctx, '#8A6838');
  drawShoulders(ctx, '#555', '#777');

  drawHead(ctx, 64, 50, 21, 25, '#8A6838', '#B89060');

  // heavy helmet
  drawHelmet(ctx, '#666', '#888');

  // communication antenna
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(84, 34);
  ctx.lineTo(90, 12);
  ctx.stroke();
  // antenna tip
  ctx.fillStyle = '#FF4444';
  ctx.beginPath();
  ctx.arc(90, 11, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowColor = '#FF4444';
  ctx.shadowBlur = 6;
  ctx.fill();
  ctx.shadowBlur = 0;

  // stern expression
  drawEyes(ctx, 64, 48, 9, '#8899AA');
  // furrowed brows
  ctx.strokeStyle = '#6A4A2A';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(48, 44); ctx.lineTo(60, 45); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(68, 45); ctx.lineTo(80, 44); ctx.stroke();

  drawNose(ctx, 64, 54, '#6A4A2A');
  // stern flat mouth
  ctx.strokeStyle = '#5A3A2A';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(56, 64);
  ctx.lineTo(72, 64);
  ctx.stroke();

  drawBorderRing(ctx, c.border);
}

function drawSignalFlare(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  drawNeck(ctx, '#A07848');
  drawShoulders(ctx, '#4A4A33', '#6A6A55');

  drawHead(ctx, 64, 50, 21, 25, '#A07848', '#C8A070');

  // short hair
  ctx.fillStyle = '#443322';
  ctx.beginPath();
  ctx.ellipse(64, 36, 22, 14, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  // headset with mic
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(64, 44, 24, Math.PI * 0.8, Math.PI * 0.2, true);
  ctx.stroke();
  // ear cups
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#666';
    ctx.beginPath();
    ctx.ellipse(64 + side * 24, 50, 5, 7, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // mic boom
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(40, 52);
  ctx.bezierCurveTo(36, 58, 38, 64, 44, 66);
  ctx.stroke();
  // mic
  ctx.fillStyle = '#444';
  ctx.beginPath();
  ctx.ellipse(44, 67, 4, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // tactical visor
  const vg = ctx.createLinearGradient(46, 48, 82, 52);
  vg.addColorStop(0, '#CCAA3366');
  vg.addColorStop(0.5, '#DDBB4466');
  vg.addColorStop(1, '#CCAA3366');
  ctx.fillStyle = vg;
  ctx.beginPath();
  ctx.moveTo(46, 48);
  ctx.lineTo(82, 48);
  ctx.lineTo(80, 52);
  ctx.lineTo(48, 52);
  ctx.closePath();
  ctx.fill();

  drawEyes(ctx, 64, 50, 9, '#887744');
  drawNose(ctx, 64, 56, '#7A5838');
  drawMouth(ctx, 64, 64, '#5A3A2A');
  drawBorderRing(ctx, c.border);
}

function drawHavenKeeper(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  drawNeck(ctx, '#A07848');
  drawShoulders(ctx, '#554422', '#776644');

  drawHead(ctx, 64, 50, 21, 25, '#A07848', '#C8A070');

  // wide hood
  drawHood(ctx, '#776644', 64, 34, 28, 22);

  // gentle expression - soft eyes
  drawEyes(ctx, 64, 50, 9, '#99AA77');
  // soft eye lines
  ctx.strokeStyle = '#9A7848';
  ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(47, 52); ctx.bezierCurveTo(46, 54, 47, 56, 49, 56); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(81, 52); ctx.bezierCurveTo(82, 54, 81, 56, 79, 56); ctx.stroke();

  drawNose(ctx, 64, 56, '#7A5838');
  // gentle smile
  ctx.strokeStyle = '#5A3A2A';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(56, 64);
  ctx.bezierCurveTo(60, 67, 68, 67, 72, 64);
  ctx.stroke();

  // healing glow from hands at bottom
  ctx.shadowColor = '#CCAA33';
  ctx.shadowBlur = 15;
  const hg = ctx.createRadialGradient(64, 118, 4, 64, 118, 24);
  hg.addColorStop(0, '#FFDD4466');
  hg.addColorStop(1, '#FFDD4400');
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.arc(64, 118, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  drawBorderRing(ctx, c.border);
}

function drawWarDrum(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  drawNeck(ctx, '#9B7044');
  drawShoulders(ctx, '#554422', '#776644');

  // drums visible on back
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#885533';
    ctx.beginPath();
    ctx.ellipse(64 + side * 34, 86, 10, 14, side * 0.2, 0, Math.PI * 2);
    ctx.fill();
    // drum skin
    ctx.fillStyle = '#CCAA88';
    ctx.beginPath();
    ctx.ellipse(64 + side * 34, 78, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // drum strap
    ctx.strokeStyle = '#664422';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(64 + side * 26, 78);
    ctx.bezierCurveTo(64 + side * 20, 70, 64 + side * 10, 68, 64, 74);
    ctx.stroke();
  }

  drawHead(ctx, 64, 48, 22, 26, '#9B7044', '#C49B60');

  // tribal face paint
  ctx.strokeStyle = '#CCAA33';
  ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(46, 42); ctx.lineTo(42, 56); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(82, 42); ctx.lineTo(86, 56); ctx.stroke();
  // dots
  ctx.fillStyle = '#CCAA33';
  for (const [x, y] of [[50, 58], [64, 38], [78, 58]]) {
    ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
  }

  // braids
  ctx.fillStyle = '#333';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(64 + side * 18, 34);
    ctx.bezierCurveTo(64 + side * 24, 40, 64 + side * 22, 60, 64 + side * 20, 76);
    ctx.lineTo(64 + side * 16, 74);
    ctx.bezierCurveTo(64 + side * 18, 58, 64 + side * 20, 40, 64 + side * 14, 36);
    ctx.closePath();
    ctx.fill();
    // braid ties
    ctx.fillStyle = '#CCAA33';
    ctx.beginPath(); ctx.arc(64 + side * 20, 72, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#333';
  }

  drawEyes(ctx, 64, 48, 9, '#AA8833');
  drawNose(ctx, 64, 54, '#7A5838');
  drawMouth(ctx, 64, 62, '#5A3A2A');
  drawBorderRing(ctx, c.border);
}

function drawSparkPlug(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  drawNeck(ctx, '#9B7044');
  drawShoulders(ctx, '#555', '#777');

  // tool belt strap visible
  ctx.strokeStyle = '#664422';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(30, 96);
  ctx.bezierCurveTo(50, 86, 78, 86, 98, 96);
  ctx.stroke();

  drawHead(ctx, 64, 50, 21, 25, '#9B7044', '#C49B60');

  // mechanic goggles on head
  drawGoggles(ctx, 64, 36, '#CCAA44', '#555');

  // grease smudges on face
  ctx.fillStyle = '#33333355';
  ctx.beginPath(); ctx.ellipse(52, 56, 6, 4, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(74, 48, 4, 3, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(60, 64, 5, 3, 0, 0, Math.PI * 2); ctx.fill();

  // short messy hair
  ctx.fillStyle = '#554433';
  ctx.beginPath();
  ctx.ellipse(64, 34, 22, 12, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  drawEyes(ctx, 64, 48, 9, '#887744');
  drawNose(ctx, 64, 54, '#7A5838');
  // friendly grin
  ctx.strokeStyle = '#5A3A2A';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(56, 62);
  ctx.bezierCurveTo(60, 66, 68, 66, 72, 62);
  ctx.stroke();

  drawBorderRing(ctx, c.border);
}

function drawLifeLine(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  drawNeck(ctx, '#A07848');
  drawShoulders(ctx, '#EEE', '#DDD');

  // red cross armband
  ctx.fillStyle = '#EEE';
  ctx.beginPath();
  ctx.moveTo(22, 98);
  ctx.lineTo(34, 92);
  ctx.lineTo(38, 102);
  ctx.lineTo(26, 108);
  ctx.closePath();
  ctx.fill();
  drawCross(ctx, 30, 100, 8, '#CC2222');

  drawHead(ctx, 64, 50, 21, 25, '#A07848', '#C8A070');

  // nurse cap
  ctx.fillStyle = '#EEE';
  ctx.beginPath();
  ctx.moveTo(46, 36);
  ctx.lineTo(82, 36);
  ctx.lineTo(80, 28);
  ctx.bezierCurveTo(76, 22, 52, 22, 48, 28);
  ctx.closePath();
  ctx.fill();
  drawCross(ctx, 64, 30, 8, '#CC2222');

  // caring expression
  drawEyes(ctx, 64, 50, 9, '#778855');
  drawNose(ctx, 64, 56, '#7A5838');
  ctx.strokeStyle = '#5A3A2A';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(56, 64);
  ctx.bezierCurveTo(60, 67, 68, 67, 72, 64);
  ctx.stroke();

  drawBorderRing(ctx, c.border);
}

function drawGridLock(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  drawNeck(ctx, '#8A6838');
  drawShoulders(ctx, '#444', '#555');

  drawHead(ctx, 64, 50, 21, 25, '#8A6838', '#B89060');

  // short military cut
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.ellipse(64, 38, 22, 12, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  // tactical HUD glasses
  const fg = ctx.createLinearGradient(42, 48, 86, 52);
  fg.addColorStop(0, '#444');
  fg.addColorStop(0.5, '#333');
  fg.addColorStop(1, '#444');
  ctx.fillStyle = fg;
  ctx.beginPath();
  ctx.moveTo(42, 46);
  ctx.lineTo(86, 46);
  ctx.lineTo(84, 54);
  ctx.lineTo(44, 54);
  ctx.closePath();
  ctx.fill();
  // HUD elements
  ctx.shadowColor = '#CCAA33';
  ctx.shadowBlur = 4;
  ctx.strokeStyle = '#CCAA33';
  ctx.lineWidth = 0.5;
  // reticle left
  ctx.beginPath(); ctx.arc(55, 50, 4, 0, Math.PI * 2); ctx.stroke();
  // reticle right
  ctx.beginPath(); ctx.arc(73, 50, 4, 0, Math.PI * 2); ctx.stroke();
  // data lines
  ctx.beginPath(); ctx.moveTo(46, 48); ctx.lineTo(50, 48); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(78, 48); ctx.lineTo(82, 48); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(46, 52); ctx.lineTo(50, 52); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(78, 52); ctx.lineTo(82, 52); ctx.stroke();
  ctx.shadowBlur = 0;

  // stoic expression
  drawNose(ctx, 64, 56, '#6A4A2A');
  ctx.strokeStyle = '#5A3A2A';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(56, 64);
  ctx.lineTo(72, 64);
  ctx.stroke();

  drawBorderRing(ctx, c.border);
}

function drawSupplyRun(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  drawNeck(ctx, '#9B7044');
  drawShoulders(ctx, '#556644', '#778866');

  // backpack straps visible
  ctx.strokeStyle = '#665533';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(44, 82);
  ctx.bezierCurveTo(46, 72, 50, 66, 54, 78);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(84, 82);
  ctx.bezierCurveTo(82, 72, 78, 66, 74, 78);
  ctx.stroke();
  // buckles
  ctx.fillStyle = '#888';
  ctx.beginPath(); ctx.arc(54, 78, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(74, 78, 3, 0, Math.PI * 2); ctx.fill();

  drawHead(ctx, 64, 48, 21, 25, '#9B7044', '#C49B60');

  // bandana
  drawBandana(ctx, '#887744');

  // determined expression
  drawEyes(ctx, 64, 48, 9, '#887744');
  // furrowed brows
  ctx.strokeStyle = '#7A5838';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(48, 43); ctx.lineTo(60, 44); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(68, 44); ctx.lineTo(80, 43); ctx.stroke();

  drawNose(ctx, 64, 54, '#7A5838');
  // determined set mouth
  ctx.strokeStyle = '#5A3A2A';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(56, 62);
  ctx.bezierCurveTo(60, 64, 68, 64, 72, 62);
  ctx.stroke();

  drawBorderRing(ctx, c.border);
}

// ════════════════════════════════════════════════
// JOB2 CLASS HEROES (PURPLE)
// ════════════════════════════════════════════════

function drawSentinel(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  drawNeck(ctx, '#555');
  drawShoulders(ctx, '#555', '#777');

  // thick armor collar
  const ag = ctx.createLinearGradient(34, 74, 94, 90);
  ag.addColorStop(0, '#888');
  ag.addColorStop(0.5, '#666');
  ag.addColorStop(1, '#888');
  ctx.fillStyle = ag;
  ctx.beginPath();
  ctx.moveTo(34, 74);
  ctx.lineTo(94, 74);
  ctx.lineTo(98, 92);
  ctx.lineTo(30, 92);
  ctx.closePath();
  ctx.fill();
  // collar ridge
  ctx.strokeStyle = '#999';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(36, 80);
  ctx.lineTo(92, 80);
  ctx.stroke();

  drawHead(ctx, 64, 48, 22, 26, '#666', '#888');

  // heavy full-face helmet with T-visor
  const hg = ctx.createLinearGradient(38, 16, 90, 72);
  hg.addColorStop(0, '#888');
  hg.addColorStop(0.3, '#666');
  hg.addColorStop(0.6, '#777');
  hg.addColorStop(1, '#555');
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.ellipse(64, 42, 26, 28, 0, 0, Math.PI * 2);
  ctx.fill();

  // T-visor
  ctx.fillStyle = '#222';
  // horizontal bar
  ctx.beginPath();
  ctx.moveTo(42, 44);
  ctx.lineTo(86, 44);
  ctx.lineTo(86, 50);
  ctx.lineTo(42, 50);
  ctx.closePath();
  ctx.fill();
  // vertical bar
  ctx.beginPath();
  ctx.moveTo(60, 50);
  ctx.lineTo(68, 50);
  ctx.lineTo(68, 64);
  ctx.lineTo(60, 64);
  ctx.closePath();
  ctx.fill();
  // visor glow
  ctx.shadowColor = '#8844AA';
  ctx.shadowBlur = 6;
  ctx.fillStyle = '#8844AA44';
  ctx.beginPath();
  ctx.moveTo(44, 45);
  ctx.lineTo(84, 45);
  ctx.lineTo(84, 49);
  ctx.lineTo(44, 49);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  drawBorderRing(ctx, c.border);
}

function drawBruiser(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  // bare chest / thick neck
  ctx.fillStyle = '#9B7044';
  ctx.beginPath();
  ctx.moveTo(46, 68);
  ctx.lineTo(82, 68);
  ctx.lineTo(90, 128);
  ctx.lineTo(38, 128);
  ctx.closePath();
  ctx.fill();

  // massive fists with taped knuckles at bottom
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#8B6B3A';
    ctx.beginPath();
    ctx.ellipse(64 + side * 30, 110, 14, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    // tape wrapping
    ctx.strokeStyle = '#CCBBAA';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(64 + side * 24, 106); ctx.lineTo(64 + side * 36, 108); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(64 + side * 24, 112); ctx.lineTo(64 + side * 36, 114); ctx.stroke();
  }

  drawHead(ctx, 64, 46, 24, 28, '#9B7044', '#C49B60');

  // short buzzcut
  ctx.fillStyle = '#33333366';
  ctx.beginPath();
  ctx.ellipse(64, 32, 22, 12, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  // scowl
  drawEyes(ctx, 64, 46, 10, '#664422');
  // heavy brow
  ctx.strokeStyle = '#7A5A34';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(46, 40); ctx.lineTo(60, 42); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(68, 42); ctx.lineTo(82, 40); ctx.stroke();

  drawNose(ctx, 64, 52, '#7A5838');
  drawMouth(ctx, 64, 62, '#5A2020', 2.5);

  drawBorderRing(ctx, c.border);
}

function drawCrusher(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  drawNeck(ctx, '#8B6B3A');
  drawShoulders(ctx, '#555', '#777');

  drawHead(ctx, 64, 48, 24, 28, '#8B6B3A', '#B89060');

  // horned helmet
  const hg = ctx.createLinearGradient(38, 16, 90, 50);
  hg.addColorStop(0, '#777');
  hg.addColorStop(0.5, '#555');
  hg.addColorStop(1, '#777');
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.ellipse(64, 36, 26, 20, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  // horns
  for (const side of [-1, 1]) {
    const hng = ctx.createLinearGradient(64 + side * 26, 34, 64 + side * 38, 10);
    hng.addColorStop(0, '#666');
    hng.addColorStop(1, '#AA9977');
    ctx.fillStyle = hng;
    ctx.beginPath();
    ctx.moveTo(64 + side * 22, 30);
    ctx.bezierCurveTo(64 + side * 28, 24, 64 + side * 36, 14, 64 + side * 38, 8);
    ctx.bezierCurveTo(64 + side * 34, 16, 64 + side * 26, 26, 64 + side * 20, 34);
    ctx.closePath();
    ctx.fill();
  }

  // war paint
  ctx.fillStyle = '#8844AA';
  ctx.beginPath();
  ctx.moveTo(44, 46);
  ctx.lineTo(84, 46);
  ctx.lineTo(82, 52);
  ctx.lineTo(46, 52);
  ctx.closePath();
  ctx.fill();

  drawEyes(ctx, 64, 48, 10, '#AA6644', '#CC7755');
  drawNose(ctx, 64, 56, '#6A4A2A');
  drawMouth(ctx, 64, 64, '#5A2020', 2);
  drawBorderRing(ctx, c.border);
}

function drawSniper(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  drawNeck(ctx, '#8A6838');
  drawShoulders(ctx, '#556644', '#778866');

  drawHead(ctx, 64, 52, 20, 24, '#8A6838', '#B89060');

  // ghillie hood - ragged edges
  ctx.fillStyle = '#556644';
  ctx.beginPath();
  ctx.ellipse(64, 38, 28, 22, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  // ghillie strands
  ctx.strokeStyle = '#667755';
  ctx.lineWidth = 2;
  for (let i = 0; i < 12; i++) {
    const angle = Math.PI + (i / 12) * Math.PI;
    const x1 = 64 + Math.cos(angle) * 26;
    const y1 = 38 + Math.sin(angle) * 20;
    const x2 = x1 + Math.cos(angle) * 8;
    const y2 = y1 + Math.sin(angle) * 6;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  // extra strands hanging
  ctx.strokeStyle = '#778866';
  ctx.lineWidth = 1.5;
  for (const [x, l] of [[38, 14], [42, 10], [86, 12], [90, 8]]) {
    ctx.beginPath();
    ctx.moveTo(x, 38);
    ctx.lineTo(x + 2, 38 + l);
    ctx.stroke();
  }

  // one eye visible through scope
  ctx.fillStyle = '#E8E8E0';
  ctx.beginPath(); ctx.ellipse(55, 52, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#556644';
  ctx.beginPath(); ctx.arc(55, 52, 2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(55, 52, 1, 0, Math.PI * 2); ctx.fill();

  // scope lens over right eye
  const sg = ctx.createRadialGradient(73, 52, 1, 73, 52, 7);
  sg.addColorStop(0, '#BB66DD');
  sg.addColorStop(0.5, '#662288');
  sg.addColorStop(1, '#221133');
  ctx.fillStyle = sg;
  ctx.beginPath(); ctx.arc(73, 52, 7, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(73, 52, 8, 0, Math.PI * 2); ctx.stroke();

  drawNose(ctx, 62, 58, '#6A4A2A');
  drawMouth(ctx, 62, 66, '#555');
  drawBorderRing(ctx, c.border);
}

function drawGunslinger(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  drawNeck(ctx, '#9B7044');
  drawShoulders(ctx, '#554433', '#776655');

  // dual holsters visible on shoulders
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#664422';
    ctx.beginPath();
    ctx.moveTo(64 + side * 28, 86);
    ctx.lineTo(64 + side * 32, 88);
    ctx.lineTo(64 + side * 30, 110);
    ctx.lineTo(64 + side * 26, 108);
    ctx.closePath();
    ctx.fill();
    // gun grip
    ctx.fillStyle = '#444';
    ctx.beginPath();
    ctx.moveTo(64 + side * 27, 88);
    ctx.lineTo(64 + side * 31, 86);
    ctx.lineTo(64 + side * 30, 82);
    ctx.lineTo(64 + side * 27, 84);
    ctx.closePath();
    ctx.fill();
  }

  drawHead(ctx, 64, 50, 21, 25, '#9B7044', '#C49B60');

  // wide-brim cowboy hat
  ctx.fillStyle = '#554433';
  ctx.beginPath();
  ctx.ellipse(64, 38, 34, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  const htg = ctx.createLinearGradient(48, 20, 80, 38);
  htg.addColorStop(0, '#665544');
  htg.addColorStop(1, '#554433');
  ctx.fillStyle = htg;
  ctx.beginPath();
  ctx.ellipse(64, 32, 18, 16, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  // hat band
  ctx.strokeStyle = '#8844AA';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(64, 36, 18, 4, 0, 0, Math.PI * 2);
  ctx.stroke();

  drawEyes(ctx, 64, 50, 9, '#887744');
  drawNose(ctx, 64, 56, '#7A5838');
  // smirk
  ctx.strokeStyle = '#5A3A2A';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(56, 64);
  ctx.bezierCurveTo(60, 66, 68, 66, 74, 62);
  ctx.stroke();

  drawBorderRing(ctx, c.border);
}

function drawHunter(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  drawNeck(ctx, '#8B6B3A');
  drawShoulders(ctx, '#554422', '#776644');

  // bow on back
  ctx.strokeStyle = '#664422';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(88, 18);
  ctx.bezierCurveTo(96, 50, 96, 80, 88, 112);
  ctx.stroke();
  ctx.strokeStyle = '#AA9977';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(88, 18);
  ctx.lineTo(88, 112);
  ctx.stroke();

  drawHead(ctx, 64, 50, 21, 25, '#8B6B3A', '#B89060');

  // fur-lined hood
  ctx.fillStyle = '#556644';
  ctx.beginPath();
  ctx.ellipse(64, 36, 27, 20, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  // fur trim
  ctx.fillStyle = '#998877';
  ctx.beginPath();
  ctx.moveTo(37, 36);
  for (let x = 37; x <= 91; x += 4) {
    ctx.lineTo(x, 40 + Math.sin(x * 0.5) * 3);
    ctx.lineTo(x + 2, 36 + Math.cos(x * 0.7) * 2);
  }
  ctx.lineTo(91, 36);
  ctx.closePath();
  ctx.fill();

  // tribal markings
  ctx.strokeStyle = '#8844AA';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(48, 46); ctx.lineTo(44, 54); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(80, 46); ctx.lineTo(84, 54); ctx.stroke();
  ctx.fillStyle = '#8844AA';
  ctx.beginPath(); ctx.arc(64, 60, 2, 0, Math.PI * 2); ctx.fill();

  drawEyes(ctx, 64, 50, 9, '#668844', '#77AA55');
  drawNose(ctx, 64, 56, '#6A4A2A');
  drawMouth(ctx, 64, 64, '#5A3A2A');
  drawBorderRing(ctx, c.border);
}

function drawArsonist(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  drawNeck(ctx, '#7A5A34');
  drawShoulders(ctx, '#444', '#555');

  // fuel tank straps
  ctx.strokeStyle = '#665544';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(44, 84);
  ctx.bezierCurveTo(46, 74, 50, 68, 54, 78);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(84, 84);
  ctx.bezierCurveTo(82, 74, 78, 68, 74, 78);
  ctx.stroke();

  drawHead(ctx, 64, 50, 21, 25, '#7A5A34', '#A08050');

  // fire-resistant mask
  ctx.fillStyle = '#555';
  ctx.beginPath();
  ctx.ellipse(64, 56, 18, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  // mask lines
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 1;
  for (let y = 48; y < 66; y += 3) {
    ctx.beginPath();
    ctx.moveTo(50, y);
    ctx.lineTo(78, y);
    ctx.stroke();
  }

  // orange visor glow
  ctx.shadowColor = '#FF6600';
  ctx.shadowBlur = 10;
  const vg = ctx.createLinearGradient(44, 44, 84, 50);
  vg.addColorStop(0, '#FF880066');
  vg.addColorStop(0.5, '#FFAA0088');
  vg.addColorStop(1, '#FF880066');
  ctx.fillStyle = vg;
  ctx.beginPath();
  ctx.moveTo(44, 44);
  ctx.lineTo(84, 44);
  ctx.lineTo(82, 50);
  ctx.lineTo(46, 50);
  ctx.closePath();
  ctx.fill();
  // visor solid
  const vg2 = ctx.createLinearGradient(46, 45, 82, 49);
  vg2.addColorStop(0, '#FF6600');
  vg2.addColorStop(0.5, '#FF8800');
  vg2.addColorStop(1, '#FF6600');
  ctx.fillStyle = vg2;
  ctx.beginPath();
  ctx.moveTo(46, 45);
  ctx.lineTo(82, 45);
  ctx.lineTo(80, 49);
  ctx.lineTo(48, 49);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // short hair above mask
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.ellipse(64, 34, 22, 14, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  drawBorderRing(ctx, c.border);
}

function drawMedic(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  drawNeck(ctx, '#A07848');
  drawShoulders(ctx, '#EEE', '#DDD');

  drawHead(ctx, 64, 50, 21, 25, '#A07848', '#C8A070');

  // white helmet with red cross
  const hg = ctx.createLinearGradient(40, 18, 88, 48);
  hg.addColorStop(0, '#EEE');
  hg.addColorStop(0.5, '#DDD');
  hg.addColorStop(1, '#EEE');
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.ellipse(64, 36, 24, 20, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  drawCross(ctx, 64, 28, 12, '#CC2222');

  // stethoscope
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(54, 68);
  ctx.bezierCurveTo(50, 78, 52, 90, 58, 96);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(74, 68);
  ctx.bezierCurveTo(78, 78, 76, 90, 70, 96);
  ctx.stroke();
  // stethoscope chest piece
  ctx.fillStyle = '#777';
  ctx.beginPath();
  ctx.arc(64, 100, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#555';
  ctx.beginPath();
  ctx.arc(64, 100, 3, 0, Math.PI * 2);
  ctx.fill();

  // kind eyes
  drawEyes(ctx, 64, 50, 9, '#778855');
  drawNose(ctx, 64, 56, '#7A5838');
  ctx.strokeStyle = '#5A3A2A';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(56, 64);
  ctx.bezierCurveTo(60, 67, 68, 67, 72, 64);
  ctx.stroke();

  drawBorderRing(ctx, c.border);
}

function drawTactician(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  drawNeck(ctx, '#A07848');
  drawShoulders(ctx, '#444', '#555');

  // medals on collar
  for (const [mx, my] of [[42, 86], [50, 84], [78, 84], [86, 86]]) {
    ctx.fillStyle = '#CCAA33';
    ctx.beginPath();
    ctx.arc(mx, my, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#DDBB44';
    ctx.beginPath();
    ctx.arc(mx, my, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  drawHead(ctx, 64, 50, 21, 25, '#A07848', '#C8A070');

  // officer cap
  ctx.fillStyle = '#444';
  ctx.beginPath();
  ctx.ellipse(64, 38, 26, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#555';
  ctx.beginPath();
  ctx.moveTo(42, 38);
  ctx.bezierCurveTo(42, 24, 86, 24, 86, 38);
  ctx.lineTo(84, 36);
  ctx.bezierCurveTo(84, 28, 44, 28, 44, 36);
  ctx.closePath();
  ctx.fill();
  // cap badge
  ctx.fillStyle = '#CCAA33';
  ctx.beginPath();
  ctx.arc(64, 36, 4, 0, Math.PI * 2);
  ctx.fill();
  // brim
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.moveTo(38, 38);
  ctx.lineTo(90, 38);
  ctx.lineTo(88, 42);
  ctx.lineTo(40, 42);
  ctx.closePath();
  ctx.fill();

  // monocle on right eye
  ctx.strokeStyle = '#CCAA33';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(73, 50, 8, 0, Math.PI * 2);
  ctx.stroke();
  // monocle chain
  ctx.strokeStyle = '#CCAA3388';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(73, 58);
  ctx.bezierCurveTo(76, 64, 78, 72, 76, 80);
  ctx.stroke();
  // monocle lens
  const mg = ctx.createRadialGradient(73, 50, 1, 73, 50, 6);
  mg.addColorStop(0, '#FFFFFF22');
  mg.addColorStop(1, '#AABBCC22');
  ctx.fillStyle = mg;
  ctx.beginPath();
  ctx.arc(73, 50, 7, 0, Math.PI * 2);
  ctx.fill();

  // normal left eye
  ctx.fillStyle = '#E8E8E0';
  ctx.beginPath(); ctx.ellipse(55, 50, 5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#556688';
  ctx.beginPath(); ctx.arc(55, 50, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(55, 50, 1.2, 0, Math.PI * 2); ctx.fill();

  // right eye behind monocle
  ctx.fillStyle = '#E8E8E0';
  ctx.beginPath(); ctx.ellipse(73, 50, 5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#556688';
  ctx.beginPath(); ctx.arc(73, 50, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(73, 50, 1.2, 0, Math.PI * 2); ctx.fill();

  drawNose(ctx, 64, 56, '#7A5838');
  // sharp thin mouth
  ctx.strokeStyle = '#5A3A2A';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(56, 64);
  ctx.lineTo(72, 64);
  ctx.stroke();

  drawBorderRing(ctx, c.border);
}

function drawEngineer(ctx, cat) {
  const c = CAT[cat];
  drawBackground(ctx, c.bgDark, c.bgMid);
  drawPortraitFrame(ctx);

  drawNeck(ctx, '#9B7044');
  drawShoulders(ctx, '#555', '#777');

  // tool harness straps
  ctx.strokeStyle = '#665544';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(44, 86);
  ctx.lineTo(54, 74);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(84, 86);
  ctx.lineTo(74, 74);
  ctx.stroke();
  // cross strap
  ctx.beginPath();
  ctx.moveTo(44, 86);
  ctx.lineTo(84, 86);
  ctx.stroke();

  drawHead(ctx, 64, 50, 21, 25, '#9B7044', '#C49B60');

  // welding mask flipped up on top of head
  const wg = ctx.createLinearGradient(42, 14, 86, 38);
  wg.addColorStop(0, '#555');
  wg.addColorStop(0.5, '#444');
  wg.addColorStop(1, '#555');
  ctx.fillStyle = wg;
  ctx.beginPath();
  ctx.moveTo(44, 40);
  ctx.lineTo(42, 24);
  ctx.bezierCurveTo(42, 14, 86, 14, 86, 24);
  ctx.lineTo(84, 40);
  ctx.closePath();
  ctx.fill();
  // mask visor (dark rectangle, flipped up)
  ctx.fillStyle = '#22333355';
  ctx.beginPath();
  ctx.moveTo(48, 38);
  ctx.lineTo(46, 26);
  ctx.lineTo(82, 26);
  ctx.lineTo(80, 38);
  ctx.closePath();
  ctx.fill();

  // goggles on forehead (below flipped mask)
  drawGoggles(ctx, 64, 42, '#88AACC', '#555');

  drawEyes(ctx, 64, 52, 9, '#887744');

  // grease smudge
  ctx.fillStyle = '#33333344';
  ctx.beginPath(); ctx.ellipse(56, 58, 5, 3, 0.3, 0, Math.PI * 2); ctx.fill();

  drawNose(ctx, 64, 58, '#7A5838');
  drawMouth(ctx, 64, 66, '#5A3A2A');
  drawBorderRing(ctx, c.border);
}

// ════════════════════════════════════════════════
// MAIN GENERATION
// ════════════════════════════════════════════════

let count = 0;

for (const hero of HEROES) {
  const { c, ctx } = makeCanvas();
  hero.draw(ctx, hero.cat);
  const buf = c.toBuffer('image/png');
  const outPath = path.join(OUT, `${hero.name}.png`);
  fs.writeFileSync(outPath, buf);
  count++;
}

console.log(`Generated ${count} hero portraits in ${OUT}`);
