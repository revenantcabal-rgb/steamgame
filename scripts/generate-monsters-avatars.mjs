/**
 * Generate 64x64 pixel-art icons for:
 *  - 35 monsters (28 regular + 7 bosses across 7 combat zones)
 *  - 20 player avatars (selectable profile pictures)
 */
import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

const SIZE = 64;

function rand(min, max) { return Math.random() * (max - min) + min; }
function randInt(min, max) { return Math.floor(rand(min, max)); }

function createIcon() {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  return { canvas, ctx };
}

function saveIcon(canvas, dir, name) {
  const outDir = path.join(process.cwd(), 'public', 'assets', dir);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${name}.png`);
  fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
  return outPath;
}

// ── Drawing helpers ─────────────────────────────────

function fillBg(ctx, color) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, SIZE, SIZE);
}

function drawPixelRect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawEye(ctx, x, y, size, eyeColor, pupilColor = '#111') {
  ctx.fillStyle = '#fff';
  ctx.fillRect(x, y, size, size);
  ctx.fillStyle = eyeColor;
  ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
  if (size >= 4) {
    ctx.fillStyle = pupilColor;
    ctx.fillRect(x + Math.floor(size / 2) - 1, y + Math.floor(size / 2) - 1, 2, 2);
  }
}

function drawGlowEye(ctx, x, y, size, color) {
  // Glowing eye with no white
  ctx.fillStyle = color;
  ctx.fillRect(x, y, size, size);
  ctx.fillStyle = '#fff';
  ctx.fillRect(x + 1, y + 1, 1, 1);
}

function drawBossFrame(ctx, color) {
  // Gold/colored frame border for bosses
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, SIZE - 2, SIZE - 2);
  // Corner accents
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 4, 4);
  ctx.fillRect(SIZE - 4, 0, 4, 4);
  ctx.fillRect(0, SIZE - 4, 4, 4);
  ctx.fillRect(SIZE - 4, SIZE - 4, 4, 4);
}

function drawBossBadge(ctx) {
  // Small "BOSS" skull badge top-right
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(SIZE - 14, 2, 12, 10);
  ctx.fillStyle = '#8B0000';
  ctx.font = '7px monospace';
  ctx.fillText('B', SIZE - 11, 10);
}

// Zone background colors (darker variants for atmosphere)
const ZONE_BG = {
  outskirts: '#1A2618',    // swampy dark green
  suburbs: '#1E1A22',      // dark urban purple
  industrial: '#1A1E14',   // toxic dark olive
  deadlands: '#221A14',    // desert dark brown
  military: '#14181E',     // cold steel dark blue
  core: '#201418',         // radiation dark red
  ground_zero: '#0E0A18',  // void dark purple
};

// ══════════════════════════════════════════════════════
//  MONSTER DRAWING FUNCTIONS
// ══════════════════════════════════════════════════════

function drawMutatedMosquito(ctx) {
  fillBg(ctx, ZONE_BG.outskirts);
  // Body - thin elongated
  drawPixelRect(ctx, 28, 20, 8, 18, '#5A6B4A');
  // Head
  drawPixelRect(ctx, 27, 14, 10, 8, '#6B7B5A');
  // Proboscis (stinger)
  drawPixelRect(ctx, 31, 8, 2, 7, '#8B4513');
  // Wings (translucent-ish)
  drawPixelRect(ctx, 18, 16, 10, 3, '#7BA86B88');
  drawPixelRect(ctx, 36, 16, 10, 3, '#7BA86B88');
  drawPixelRect(ctx, 20, 19, 8, 2, '#6B985A66');
  drawPixelRect(ctx, 36, 19, 8, 2, '#6B985A66');
  // Legs
  drawPixelRect(ctx, 24, 34, 2, 8, '#4A5B3A');
  drawPixelRect(ctx, 28, 36, 2, 10, '#4A5B3A');
  drawPixelRect(ctx, 34, 34, 2, 8, '#4A5B3A');
  drawPixelRect(ctx, 38, 36, 2, 10, '#4A5B3A');
  // Eyes - red compound
  drawGlowEye(ctx, 28, 15, 3, '#FF3030');
  drawGlowEye(ctx, 34, 15, 3, '#FF3030');
  // Mutation spots
  drawPixelRect(ctx, 30, 25, 2, 2, '#AAFF55');
  drawPixelRect(ctx, 26, 30, 2, 2, '#AAFF55');
}

function drawMutatedFrog(ctx) {
  fillBg(ctx, ZONE_BG.outskirts);
  // Body - wide squat
  drawPixelRect(ctx, 14, 28, 36, 20, '#3A6B3A');
  drawPixelRect(ctx, 18, 24, 28, 6, '#4A7B4A');
  // Head
  drawPixelRect(ctx, 20, 18, 24, 10, '#4A8B4A');
  // Big eyes on top
  drawPixelRect(ctx, 20, 12, 8, 8, '#5AAB5A');
  drawPixelRect(ctx, 36, 12, 8, 8, '#5AAB5A');
  drawEye(ctx, 22, 13, 5, '#FFD700');
  drawEye(ctx, 37, 13, 5, '#FFD700');
  // Mouth line
  drawPixelRect(ctx, 24, 26, 16, 1, '#2A4B2A');
  // Front legs
  drawPixelRect(ctx, 12, 42, 8, 4, '#3A6B3A');
  drawPixelRect(ctx, 44, 42, 8, 4, '#3A6B3A');
  // Mutation bubbles
  drawPixelRect(ctx, 40, 30, 4, 4, '#AAFF55');
  drawPixelRect(ctx, 16, 34, 3, 3, '#88DD44');
  // Toxic drool
  drawPixelRect(ctx, 28, 27, 2, 4, '#66FF33');
}

function drawMutatedCentipede(ctx) {
  fillBg(ctx, ZONE_BG.outskirts);
  // Segmented body curving
  const segs = [[16,16],[20,20],[24,23],[28,25],[32,26],[36,28],[40,31],[44,35],[46,40]];
  for (const [sx, sy] of segs) {
    drawPixelRect(ctx, sx, sy, 8, 6, '#8B4513');
    drawPixelRect(ctx, sx + 1, sy + 1, 6, 4, '#A0522D');
    // Legs
    drawPixelRect(ctx, sx - 2, sy + 5, 3, 2, '#6B3410');
    drawPixelRect(ctx, sx + 7, sy + 5, 3, 2, '#6B3410');
  }
  // Head
  drawPixelRect(ctx, 10, 12, 10, 8, '#A0622D');
  // Mandibles
  drawPixelRect(ctx, 8, 16, 3, 4, '#CC6633');
  drawPixelRect(ctx, 17, 16, 3, 4, '#CC6633');
  // Eyes
  drawGlowEye(ctx, 12, 13, 3, '#FF4444');
  drawGlowEye(ctx, 16, 13, 3, '#FF4444');
  // Antenna
  drawPixelRect(ctx, 11, 8, 1, 5, '#8B5513');
  drawPixelRect(ctx, 18, 8, 1, 5, '#8B5513');
  // Toxic segments
  drawPixelRect(ctx, 30, 26, 4, 2, '#66FF33');
}

function drawWastelandVermin(ctx) {
  fillBg(ctx, ZONE_BG.outskirts);
  // Rat-like body
  drawPixelRect(ctx, 18, 28, 24, 14, '#6B6155');
  drawPixelRect(ctx, 22, 24, 18, 6, '#7B7165');
  // Head
  drawPixelRect(ctx, 14, 26, 10, 10, '#7B7165');
  // Pointy nose
  drawPixelRect(ctx, 10, 30, 5, 4, '#8B8175');
  // Ears
  drawPixelRect(ctx, 16, 22, 4, 5, '#8B7165');
  drawPixelRect(ctx, 22, 22, 4, 5, '#8B7165');
  // Eyes
  drawEye(ctx, 15, 28, 4, '#FF6666');
  // Tail
  drawPixelRect(ctx, 42, 30, 10, 2, '#5A5145');
  drawPixelRect(ctx, 50, 28, 6, 2, '#5A5145');
  // Legs
  drawPixelRect(ctx, 20, 40, 4, 6, '#5A5145');
  drawPixelRect(ctx, 34, 40, 4, 6, '#5A5145');
  // Mutation glow
  drawPixelRect(ctx, 30, 28, 3, 3, '#88FF44');
}

function drawGiantRoach(ctx) {
  fillBg(ctx, ZONE_BG.outskirts);
  // Large body
  drawPixelRect(ctx, 14, 18, 36, 28, '#3A2810');
  drawPixelRect(ctx, 18, 14, 28, 6, '#4A3818');
  // Shell plates
  drawPixelRect(ctx, 16, 20, 32, 2, '#5A4828');
  drawPixelRect(ctx, 16, 28, 32, 2, '#5A4828');
  drawPixelRect(ctx, 16, 36, 32, 2, '#5A4828');
  // Head
  drawPixelRect(ctx, 22, 8, 20, 10, '#4A3820');
  // Antenna
  drawPixelRect(ctx, 24, 2, 2, 8, '#6B5830');
  drawPixelRect(ctx, 38, 2, 2, 8, '#6B5830');
  drawPixelRect(ctx, 22, 2, 3, 2, '#6B5830');
  drawPixelRect(ctx, 39, 2, 3, 2, '#6B5830');
  // Eyes - glowing
  drawGlowEye(ctx, 25, 10, 4, '#FF4444');
  drawGlowEye(ctx, 35, 10, 4, '#FF4444');
  // Legs
  for (let i = 0; i < 3; i++) {
    drawPixelRect(ctx, 10 - i * 2, 22 + i * 8, 6, 3, '#2A1808');
    drawPixelRect(ctx, 48 + i * 2, 22 + i * 8, 6, 3, '#2A1808');
  }
  // Mandibles
  drawPixelRect(ctx, 26, 17, 4, 4, '#CC4422');
  drawPixelRect(ctx, 34, 17, 4, 4, '#CC4422');
  drawBossFrame(ctx, '#FFD700');
  drawBossBadge(ctx);
}

// ── Zone 2: Ruined Suburbs ──────────────────────────

function drawFeralDogPack(ctx) {
  fillBg(ctx, ZONE_BG.suburbs);
  // Main dog body
  drawPixelRect(ctx, 16, 26, 24, 14, '#8B7355');
  // Head
  drawPixelRect(ctx, 10, 20, 12, 12, '#9B8365');
  // Snout
  drawPixelRect(ctx, 6, 26, 6, 6, '#AB9375');
  drawPixelRect(ctx, 6, 30, 4, 2, '#333');
  // Ears (pointed, aggressive)
  drawPixelRect(ctx, 12, 14, 4, 7, '#7B6345');
  drawPixelRect(ctx, 18, 16, 4, 5, '#7B6345');
  // Eye - angry
  drawGlowEye(ctx, 13, 23, 3, '#FF3333');
  // Teeth
  drawPixelRect(ctx, 8, 31, 2, 2, '#fff');
  drawPixelRect(ctx, 11, 31, 2, 2, '#fff');
  // Legs
  drawPixelRect(ctx, 18, 38, 4, 10, '#7B6345');
  drawPixelRect(ctx, 32, 38, 4, 10, '#7B6345');
  // Tail
  drawPixelRect(ctx, 40, 24, 8, 3, '#7B6345');
  drawPixelRect(ctx, 46, 22, 4, 3, '#7B6345');
  // Scars/wounds
  drawPixelRect(ctx, 24, 28, 6, 1, '#CC4444');
  drawPixelRect(ctx, 22, 30, 4, 1, '#CC4444');
  // Second dog silhouette behind
  drawPixelRect(ctx, 36, 30, 16, 10, '#5A4A35');
  drawPixelRect(ctx, 48, 26, 8, 8, '#5A4A35');
}

function drawMutantHawk(ctx) {
  fillBg(ctx, ZONE_BG.suburbs);
  // Body
  drawPixelRect(ctx, 24, 22, 16, 20, '#5A4A3A');
  // Head
  drawPixelRect(ctx, 26, 14, 12, 10, '#6B5A4A');
  // Beak
  drawPixelRect(ctx, 24, 18, 4, 4, '#FFD700');
  drawPixelRect(ctx, 22, 20, 3, 2, '#CC8800');
  // Eye
  drawGlowEye(ctx, 30, 16, 4, '#FF8800');
  // Wings spread
  drawPixelRect(ctx, 6, 18, 18, 4, '#4A3A2A');
  drawPixelRect(ctx, 2, 16, 8, 3, '#3A2A1A');
  drawPixelRect(ctx, 40, 18, 18, 4, '#4A3A2A');
  drawPixelRect(ctx, 54, 16, 8, 3, '#3A2A1A');
  // Wing feather details
  drawPixelRect(ctx, 8, 22, 12, 2, '#5A4A3A');
  drawPixelRect(ctx, 44, 22, 12, 2, '#5A4A3A');
  // Talons
  drawPixelRect(ctx, 26, 40, 3, 6, '#6B5A4A');
  drawPixelRect(ctx, 35, 40, 3, 6, '#6B5A4A');
  drawPixelRect(ctx, 24, 44, 2, 3, '#CC8800');
  drawPixelRect(ctx, 37, 44, 2, 3, '#CC8800');
  // Mutation - extra eye
  drawGlowEye(ctx, 34, 18, 3, '#FF2222');
}

function drawRadRatSwarm(ctx) {
  fillBg(ctx, ZONE_BG.suburbs);
  // Multiple small rats
  const rats = [[8,20],[20,28],[34,22],[46,32],[14,40],[38,42]];
  for (const [rx, ry] of rats) {
    drawPixelRect(ctx, rx, ry, 12, 8, '#6B5B4B');
    drawPixelRect(ctx, rx - 2, ry + 2, 4, 4, '#7B6B5B');
    drawGlowEye(ctx, rx - 1, ry + 2, 2, '#44FF44');
    // Tail
    drawPixelRect(ctx, rx + 10, ry + 3, 6, 1, '#5B4B3B');
  }
  // Radiation glow underneath
  drawPixelRect(ctx, 10, 50, 44, 4, '#44FF2222');
  drawPixelRect(ctx, 16, 48, 32, 3, '#44FF2218');
}

function drawSuburbDweller(ctx) {
  fillBg(ctx, ZONE_BG.suburbs);
  // Humanoid mutant
  drawPixelRect(ctx, 24, 22, 16, 22, '#5A6B5A'); // torso
  drawPixelRect(ctx, 26, 12, 12, 12, '#6A7B6A'); // head
  // Ragged hood
  drawPixelRect(ctx, 24, 8, 16, 8, '#3A3A2A');
  drawPixelRect(ctx, 22, 14, 20, 4, '#3A3A2A');
  // Eyes - glowing from under hood
  drawGlowEye(ctx, 28, 16, 3, '#AAFF44');
  drawGlowEye(ctx, 35, 16, 3, '#AAFF44');
  // Arms
  drawPixelRect(ctx, 18, 24, 6, 14, '#5A6B5A');
  drawPixelRect(ctx, 40, 24, 6, 14, '#5A6B5A');
  // Legs
  drawPixelRect(ctx, 26, 42, 5, 12, '#4A5B4A');
  drawPixelRect(ctx, 33, 42, 5, 12, '#4A5B4A');
  // Makeshift weapon
  drawPixelRect(ctx, 42, 18, 2, 22, '#8B7355');
  drawPixelRect(ctx, 40, 16, 6, 4, '#999');
}

function drawAlphaWolf(ctx) {
  fillBg(ctx, ZONE_BG.suburbs);
  // Large wolf body
  drawPixelRect(ctx, 12, 22, 36, 18, '#5A5A6A');
  drawPixelRect(ctx, 14, 18, 30, 6, '#6A6A7A');
  // Head - large
  drawPixelRect(ctx, 6, 14, 16, 14, '#6A6A7A');
  // Snout
  drawPixelRect(ctx, 2, 20, 6, 6, '#7A7A8A');
  // Fangs
  drawPixelRect(ctx, 3, 25, 2, 3, '#FFF');
  drawPixelRect(ctx, 6, 25, 2, 3, '#FFF');
  // Ears
  drawPixelRect(ctx, 8, 8, 5, 7, '#5A5A6A');
  drawPixelRect(ctx, 16, 10, 5, 5, '#5A5A6A');
  // Eyes - fierce
  drawGlowEye(ctx, 9, 17, 4, '#FF6600');
  drawGlowEye(ctx, 16, 17, 4, '#FF6600');
  // Scar across face
  drawPixelRect(ctx, 7, 15, 12, 1, '#CC3333');
  // Legs
  drawPixelRect(ctx, 16, 38, 5, 12, '#5A5A6A');
  drawPixelRect(ctx, 24, 38, 5, 12, '#5A5A6A');
  drawPixelRect(ctx, 36, 38, 5, 12, '#5A5A6A');
  // Tail
  drawPixelRect(ctx, 46, 20, 8, 4, '#5A5A6A');
  drawPixelRect(ctx, 52, 18, 6, 3, '#5A5A6A');
  // Glowing aura
  drawPixelRect(ctx, 4, 12, 2, 2, '#FF880044');
  drawBossFrame(ctx, '#C0C0C0');
  drawBossBadge(ctx);
}

// ── Zone 3: Toxic Industrial ────────────────────────

function drawSlimeCrawler(ctx) {
  fillBg(ctx, ZONE_BG.industrial);
  // Amorphous blob body
  drawPixelRect(ctx, 12, 24, 40, 24, '#4A8B2A');
  drawPixelRect(ctx, 16, 20, 32, 6, '#5A9B3A');
  drawPixelRect(ctx, 20, 16, 24, 6, '#6AAB4A');
  // Eyes floating in slime
  drawEye(ctx, 22, 22, 5, '#FFD700');
  drawEye(ctx, 36, 20, 6, '#FFD700');
  drawEye(ctx, 30, 28, 4, '#FFD700');
  // Dripping edges
  drawPixelRect(ctx, 14, 46, 4, 6, '#3A7B1A');
  drawPixelRect(ctx, 28, 48, 3, 8, '#3A7B1A');
  drawPixelRect(ctx, 42, 46, 4, 6, '#3A7B1A');
  // Toxic bubbles
  drawPixelRect(ctx, 18, 18, 3, 3, '#AAFF44');
  drawPixelRect(ctx, 40, 26, 2, 2, '#CCFF66');
  drawPixelRect(ctx, 26, 38, 4, 4, '#88DD22');
  // Glow
  drawPixelRect(ctx, 10, 42, 44, 2, '#44FF2233');
}

function drawRogueDrone(ctx) {
  fillBg(ctx, ZONE_BG.industrial);
  // Drone body (hexagonal-ish)
  drawPixelRect(ctx, 18, 20, 28, 20, '#556677');
  drawPixelRect(ctx, 22, 16, 20, 6, '#667788');
  drawPixelRect(ctx, 22, 38, 20, 4, '#445566');
  // Eye/sensor - red
  drawPixelRect(ctx, 28, 24, 8, 6, '#111');
  drawGlowEye(ctx, 30, 25, 4, '#FF0000');
  // Propellers
  drawPixelRect(ctx, 6, 22, 12, 2, '#889999');
  drawPixelRect(ctx, 46, 22, 12, 2, '#889999');
  drawPixelRect(ctx, 8, 36, 10, 2, '#889999');
  drawPixelRect(ctx, 46, 36, 10, 2, '#889999');
  // Gun barrel underneath
  drawPixelRect(ctx, 30, 40, 4, 8, '#334455');
  drawPixelRect(ctx, 29, 46, 6, 3, '#222');
  // Damage/rust
  drawPixelRect(ctx, 20, 26, 3, 3, '#8B4513');
  drawPixelRect(ctx, 40, 30, 4, 2, '#8B4513');
  // Status lights
  drawPixelRect(ctx, 24, 20, 2, 2, '#FF0000');
  drawPixelRect(ctx, 38, 20, 2, 2, '#00FF00');
}

function drawSewerBeast(ctx) {
  fillBg(ctx, ZONE_BG.industrial);
  // Large crocodilian body
  drawPixelRect(ctx, 8, 26, 40, 16, '#3A4A3A');
  drawPixelRect(ctx, 4, 22, 16, 8, '#4A5A4A');
  // Snout
  drawPixelRect(ctx, 0, 24, 6, 6, '#4A5A4A');
  // Jaw with teeth
  drawPixelRect(ctx, 0, 29, 14, 3, '#3A4A3A');
  for (let i = 0; i < 5; i++) drawPixelRect(ctx, 2 + i * 3, 28, 1, 2, '#FFF');
  // Eyes
  drawGlowEye(ctx, 8, 22, 3, '#FFFF00');
  drawGlowEye(ctx, 14, 22, 3, '#FFFF00');
  // Spines on back
  for (let i = 0; i < 6; i++) {
    drawPixelRect(ctx, 14 + i * 6, 22, 3, 5, '#2A3A2A');
  }
  // Tail
  drawPixelRect(ctx, 46, 28, 10, 6, '#3A4A3A');
  drawPixelRect(ctx, 54, 30, 6, 4, '#3A4A3A');
  // Legs
  drawPixelRect(ctx, 14, 40, 5, 6, '#2A3A2A');
  drawPixelRect(ctx, 36, 40, 5, 6, '#2A3A2A');
  // Toxic slime drips
  drawPixelRect(ctx, 20, 40, 2, 4, '#66FF33');
  drawPixelRect(ctx, 30, 42, 2, 3, '#66FF33');
}

function drawFactoryMutant(ctx) {
  fillBg(ctx, ZONE_BG.industrial);
  // Bulky humanoid
  drawPixelRect(ctx, 20, 18, 24, 26, '#5A5A4A');
  // Head
  drawPixelRect(ctx, 24, 8, 16, 12, '#6A6A5A');
  // Gas mask
  drawPixelRect(ctx, 26, 12, 12, 8, '#333');
  drawPixelRect(ctx, 28, 14, 3, 3, '#556655');
  drawPixelRect(ctx, 33, 14, 3, 3, '#556655');
  drawPixelRect(ctx, 30, 18, 4, 3, '#444');
  // Arms - one mutated/larger
  drawPixelRect(ctx, 12, 20, 8, 18, '#5A5A4A');
  drawPixelRect(ctx, 44, 18, 10, 20, '#6A7A5A');
  drawPixelRect(ctx, 46, 14, 8, 6, '#6A7A5A');
  // Legs
  drawPixelRect(ctx, 22, 42, 6, 12, '#4A4A3A');
  drawPixelRect(ctx, 36, 42, 6, 12, '#4A4A3A');
  // Weapon (pipe)
  drawPixelRect(ctx, 10, 18, 3, 24, '#888');
  // Toxic stains
  drawPixelRect(ctx, 28, 28, 4, 4, '#66FF3344');
  drawPixelRect(ctx, 36, 34, 3, 3, '#66FF3344');
}

function drawFactoryOverseer(ctx) {
  fillBg(ctx, ZONE_BG.industrial);
  // Massive armored figure
  drawPixelRect(ctx, 16, 14, 32, 32, '#444455');
  drawPixelRect(ctx, 14, 18, 36, 24, '#555566');
  // Helmet
  drawPixelRect(ctx, 22, 4, 20, 14, '#666677');
  drawPixelRect(ctx, 20, 8, 24, 8, '#555566');
  // Visor - glowing
  drawPixelRect(ctx, 24, 10, 16, 4, '#FF440088');
  drawGlowEye(ctx, 26, 10, 4, '#FF4400');
  drawGlowEye(ctx, 34, 10, 4, '#FF4400');
  // Shoulder pads
  drawPixelRect(ctx, 8, 16, 10, 8, '#666677');
  drawPixelRect(ctx, 46, 16, 10, 8, '#666677');
  // Arms
  drawPixelRect(ctx, 10, 24, 6, 16, '#555566');
  drawPixelRect(ctx, 48, 24, 6, 16, '#555566');
  // Mechanical arm weapon
  drawPixelRect(ctx, 48, 38, 8, 4, '#888899');
  drawPixelRect(ctx, 54, 36, 4, 8, '#999');
  // Legs
  drawPixelRect(ctx, 20, 44, 8, 12, '#444455');
  drawPixelRect(ctx, 36, 44, 8, 12, '#444455');
  // Reactor glow on chest
  drawPixelRect(ctx, 28, 24, 8, 8, '#FF660044');
  drawPixelRect(ctx, 30, 26, 4, 4, '#FF8800');
  drawBossFrame(ctx, '#FF8800');
  drawBossBadge(ctx);
}

// ── Zone 4: The Deadlands ───────────────────────────

function drawSandworm(ctx) {
  fillBg(ctx, ZONE_BG.deadlands);
  // Worm segments emerging from ground
  drawPixelRect(ctx, 8, 40, 48, 12, '#AA8855'); // ground
  // Body arching out
  drawPixelRect(ctx, 16, 30, 10, 14, '#8B6B3A');
  drawPixelRect(ctx, 22, 22, 12, 12, '#9B7B4A');
  drawPixelRect(ctx, 30, 18, 10, 10, '#8B6B3A');
  drawPixelRect(ctx, 36, 24, 10, 12, '#8B6B3A');
  drawPixelRect(ctx, 42, 32, 10, 12, '#7B5B2A');
  // Head with maw
  drawPixelRect(ctx, 10, 16, 12, 16, '#9B7B4A');
  // Open maw
  drawPixelRect(ctx, 8, 18, 8, 10, '#4A1A0A');
  // Teeth ring
  drawPixelRect(ctx, 8, 18, 2, 2, '#FFF');
  drawPixelRect(ctx, 12, 17, 2, 2, '#FFF');
  drawPixelRect(ctx, 8, 26, 2, 2, '#FFF');
  drawPixelRect(ctx, 12, 27, 2, 2, '#FFF');
  drawPixelRect(ctx, 14, 22, 2, 2, '#FFF');
  // Segment ridges
  drawPixelRect(ctx, 24, 22, 8, 2, '#7B5B2A');
  drawPixelRect(ctx, 32, 20, 6, 2, '#7B5B2A');
  // Sand particles
  drawPixelRect(ctx, 20, 38, 2, 2, '#CCAA66');
  drawPixelRect(ctx, 38, 36, 2, 2, '#CCAA66');
}

function drawRaiderGang(ctx) {
  fillBg(ctx, ZONE_BG.deadlands);
  // Main raider
  drawPixelRect(ctx, 22, 16, 14, 24, '#6B4A3A');
  drawPixelRect(ctx, 24, 8, 10, 10, '#8B6A5A');
  // Mohawk
  drawPixelRect(ctx, 27, 2, 4, 8, '#CC3333');
  // Eye paint
  drawPixelRect(ctx, 25, 12, 8, 2, '#111');
  drawGlowEye(ctx, 26, 11, 3, '#FF4444');
  drawGlowEye(ctx, 32, 11, 3, '#FF4444');
  // Arms with weapons
  drawPixelRect(ctx, 16, 18, 6, 14, '#6B4A3A');
  drawPixelRect(ctx, 36, 18, 6, 14, '#6B4A3A');
  drawPixelRect(ctx, 38, 14, 2, 18, '#888'); // gun
  drawPixelRect(ctx, 14, 16, 4, 2, '#888'); // blade
  drawPixelRect(ctx, 10, 14, 6, 3, '#AAA');
  // Legs
  drawPixelRect(ctx, 24, 38, 5, 12, '#5A3A2A');
  drawPixelRect(ctx, 31, 38, 5, 12, '#5A3A2A');
  // Second raider behind
  drawPixelRect(ctx, 44, 20, 10, 18, '#5A3A2A');
  drawPixelRect(ctx, 45, 14, 8, 8, '#7A5A4A');
  // Spiked shoulder pad
  drawPixelRect(ctx, 18, 16, 5, 4, '#555');
  drawPixelRect(ctx, 19, 13, 2, 4, '#666');
}

function drawGlowingGhoul(ctx) {
  fillBg(ctx, ZONE_BG.deadlands);
  // Emaciated humanoid
  drawPixelRect(ctx, 24, 18, 16, 24, '#3A5A3A');
  // Ribs showing
  for (let i = 0; i < 4; i++) drawPixelRect(ctx, 26, 22 + i * 4, 12, 1, '#2A4A2A');
  // Head - skull-like
  drawPixelRect(ctx, 26, 6, 12, 14, '#4A6A4A');
  // Sunken eyes - GLOWING
  drawGlowEye(ctx, 28, 10, 4, '#44FF44');
  drawGlowEye(ctx, 34, 10, 4, '#44FF44');
  // Mouth - jagged
  drawPixelRect(ctx, 29, 16, 6, 2, '#222');
  drawPixelRect(ctx, 30, 17, 1, 2, '#FFF');
  drawPixelRect(ctx, 33, 17, 1, 2, '#FFF');
  // Arms - long and thin
  drawPixelRect(ctx, 18, 20, 6, 3, '#3A5A3A');
  drawPixelRect(ctx, 14, 22, 6, 3, '#3A5A3A');
  drawPixelRect(ctx, 40, 20, 6, 3, '#3A5A3A');
  drawPixelRect(ctx, 44, 22, 6, 3, '#3A5A3A');
  // Claws
  drawPixelRect(ctx, 12, 24, 3, 3, '#2A4A2A');
  drawPixelRect(ctx, 49, 24, 3, 3, '#2A4A2A');
  // Legs
  drawPixelRect(ctx, 26, 40, 4, 12, '#2A4A2A');
  drawPixelRect(ctx, 34, 40, 4, 12, '#2A4A2A');
  // Radiation glow aura
  drawPixelRect(ctx, 22, 4, 2, 2, '#44FF4444');
  drawPixelRect(ctx, 40, 8, 2, 2, '#44FF4444');
  drawPixelRect(ctx, 16, 16, 2, 2, '#44FF4444');
}

function drawDeadlandsDweller(ctx) {
  fillBg(ctx, ZONE_BG.deadlands);
  // Hunched scavenger figure
  drawPixelRect(ctx, 22, 22, 18, 20, '#7A6A5A');
  // Head with wrappings
  drawPixelRect(ctx, 26, 12, 12, 12, '#8A7A6A');
  drawPixelRect(ctx, 24, 14, 16, 4, '#AA9A8A'); // face wrap
  // Goggles
  drawPixelRect(ctx, 27, 15, 4, 3, '#333');
  drawPixelRect(ctx, 33, 15, 4, 3, '#333');
  drawPixelRect(ctx, 28, 16, 2, 1, '#FF880066');
  drawPixelRect(ctx, 34, 16, 2, 1, '#FF880066');
  // Cloak
  drawPixelRect(ctx, 18, 20, 28, 4, '#6A5A4A');
  // Arms
  drawPixelRect(ctx, 16, 24, 6, 12, '#7A6A5A');
  drawPixelRect(ctx, 42, 24, 6, 12, '#7A6A5A');
  // Staff/spear
  drawPixelRect(ctx, 44, 10, 2, 40, '#8B7355');
  drawPixelRect(ctx, 42, 8, 6, 4, '#999');
  // Legs
  drawPixelRect(ctx, 24, 40, 5, 12, '#6A5A4A');
  drawPixelRect(ctx, 33, 40, 5, 12, '#6A5A4A');
  // Bag/pack
  drawPixelRect(ctx, 38, 26, 6, 8, '#5A4A3A');
}

function drawRaiderWarlord(ctx) {
  fillBg(ctx, ZONE_BG.deadlands);
  // Large armored raider
  drawPixelRect(ctx, 16, 14, 32, 32, '#5A3A2A');
  drawPixelRect(ctx, 18, 18, 28, 24, '#6B4B3B');
  // Heavy shoulder armor
  drawPixelRect(ctx, 8, 14, 12, 10, '#777');
  drawPixelRect(ctx, 44, 14, 12, 10, '#777');
  // Spikes on shoulders
  drawPixelRect(ctx, 10, 10, 2, 5, '#888');
  drawPixelRect(ctx, 16, 12, 2, 4, '#888');
  drawPixelRect(ctx, 46, 10, 2, 5, '#888');
  drawPixelRect(ctx, 52, 12, 2, 4, '#888');
  // Head with skull mask
  drawPixelRect(ctx, 22, 4, 20, 14, '#DDCCBB');
  drawPixelRect(ctx, 26, 6, 4, 4, '#111'); // eye sockets
  drawPixelRect(ctx, 34, 6, 4, 4, '#111');
  drawGlowEye(ctx, 27, 7, 2, '#FF0000');
  drawGlowEye(ctx, 35, 7, 2, '#FF0000');
  drawPixelRect(ctx, 28, 12, 8, 2, '#111'); // teeth line
  for (let i = 0; i < 4; i++) drawPixelRect(ctx, 29 + i * 2, 13, 1, 2, '#DDD');
  // Crown of bones
  drawPixelRect(ctx, 24, 0, 3, 5, '#CCBB99');
  drawPixelRect(ctx, 30, 0, 3, 4, '#CCBB99');
  drawPixelRect(ctx, 37, 0, 3, 5, '#CCBB99');
  // Large weapon
  drawPixelRect(ctx, 6, 12, 4, 30, '#888');
  drawPixelRect(ctx, 2, 8, 12, 6, '#999');
  // Legs
  drawPixelRect(ctx, 20, 44, 8, 12, '#5A3A2A');
  drawPixelRect(ctx, 36, 44, 8, 12, '#5A3A2A');
  drawBossFrame(ctx, '#CC3333');
  drawBossBadge(ctx);
}

// ── Zone 5: Military Zone ───────────────────────────

function drawTurretArray(ctx) {
  fillBg(ctx, ZONE_BG.military);
  // Base platform
  drawPixelRect(ctx, 12, 42, 40, 10, '#555566');
  drawPixelRect(ctx, 16, 38, 32, 6, '#666677');
  // Turret body
  drawPixelRect(ctx, 20, 22, 24, 18, '#778899');
  // Barrels
  drawPixelRect(ctx, 8, 24, 14, 4, '#667788');
  drawPixelRect(ctx, 42, 24, 14, 4, '#667788');
  drawPixelRect(ctx, 4, 30, 18, 4, '#667788');
  drawPixelRect(ctx, 42, 30, 18, 4, '#667788');
  // Sensor dome
  drawPixelRect(ctx, 26, 14, 12, 10, '#889AAA');
  drawPixelRect(ctx, 28, 12, 8, 4, '#99AABB');
  // Red sensor eye
  drawGlowEye(ctx, 30, 16, 4, '#FF0000');
  // Ammo belt
  drawPixelRect(ctx, 20, 36, 24, 3, '#FFD700');
  // Status lights
  drawPixelRect(ctx, 22, 24, 2, 2, '#FF0000');
  drawPixelRect(ctx, 22, 28, 2, 2, '#00FF00');
  drawPixelRect(ctx, 40, 24, 2, 2, '#FF0000');
  // Muzzle flash
  drawPixelRect(ctx, 2, 22, 4, 2, '#FF880044');
  drawPixelRect(ctx, 0, 24, 5, 2, '#FFFF0044');
}

function drawBioSoldier(ctx) {
  fillBg(ctx, ZONE_BG.military);
  // Armored humanoid
  drawPixelRect(ctx, 20, 16, 24, 28, '#446655');
  // Helmet
  drawPixelRect(ctx, 22, 4, 20, 14, '#557766');
  drawPixelRect(ctx, 24, 8, 16, 6, '#334444');
  // Visor
  drawPixelRect(ctx, 26, 9, 12, 4, '#33FF3344');
  drawGlowEye(ctx, 28, 10, 3, '#33FF33');
  drawGlowEye(ctx, 35, 10, 3, '#33FF33');
  // Body armor details
  drawPixelRect(ctx, 22, 20, 20, 2, '#557766');
  drawPixelRect(ctx, 22, 28, 20, 2, '#557766');
  // Arms
  drawPixelRect(ctx, 14, 18, 6, 16, '#446655');
  drawPixelRect(ctx, 44, 18, 6, 16, '#446655');
  // Rifle
  drawPixelRect(ctx, 44, 22, 14, 3, '#555');
  drawPixelRect(ctx, 56, 20, 4, 2, '#666');
  // Legs
  drawPixelRect(ctx, 22, 42, 6, 12, '#335544');
  drawPixelRect(ctx, 36, 42, 6, 12, '#335544');
  // Mutation patches
  drawPixelRect(ctx, 18, 30, 3, 4, '#33FF3344');
  drawPixelRect(ctx, 42, 26, 4, 3, '#33FF3344');
}

function drawEscapedExperiment(ctx) {
  fillBg(ctx, ZONE_BG.military);
  // Grotesque mutant body
  drawPixelRect(ctx, 14, 16, 36, 30, '#6A4A5A');
  drawPixelRect(ctx, 18, 12, 28, 8, '#7A5A6A');
  // Multiple misshapen heads
  drawPixelRect(ctx, 20, 4, 10, 10, '#8A6A7A');
  drawPixelRect(ctx, 34, 6, 8, 8, '#7A5A6A');
  // Many eyes
  drawGlowEye(ctx, 22, 6, 3, '#FF00FF');
  drawGlowEye(ctx, 27, 8, 3, '#FF44FF');
  drawGlowEye(ctx, 36, 8, 3, '#FF00FF');
  // Mouth with teeth
  drawPixelRect(ctx, 23, 11, 6, 2, '#333');
  drawPixelRect(ctx, 24, 12, 1, 2, '#FFF');
  drawPixelRect(ctx, 27, 12, 1, 2, '#FFF');
  // Tentacle arms
  drawPixelRect(ctx, 6, 18, 10, 4, '#6A4A5A');
  drawPixelRect(ctx, 2, 22, 6, 4, '#6A4A5A');
  drawPixelRect(ctx, 48, 16, 10, 4, '#6A4A5A');
  drawPixelRect(ctx, 54, 20, 6, 4, '#6A4A5A');
  // Exposed tubes/wires
  drawPixelRect(ctx, 30, 20, 2, 10, '#33FF33');
  drawPixelRect(ctx, 36, 22, 2, 8, '#FF3333');
  // Legs (stumpy)
  drawPixelRect(ctx, 18, 44, 8, 8, '#5A3A4A');
  drawPixelRect(ctx, 38, 44, 8, 8, '#5A3A4A');
  // Dripping fluid
  drawPixelRect(ctx, 24, 44, 2, 6, '#FF00FF44');
  drawPixelRect(ctx, 42, 42, 2, 4, '#33FF3344');
}

function drawMilitaryHazard(ctx) {
  fillBg(ctx, ZONE_BG.military);
  // Robot/drone mix
  drawPixelRect(ctx, 18, 18, 28, 24, '#556677');
  drawPixelRect(ctx, 22, 14, 20, 6, '#667788');
  // Head/sensor array
  drawPixelRect(ctx, 24, 6, 16, 10, '#778899');
  drawPixelRect(ctx, 28, 8, 8, 4, '#111');
  drawGlowEye(ctx, 30, 9, 4, '#FF4444');
  // Hazard stripes on body
  for (let i = 0; i < 5; i++) {
    drawPixelRect(ctx, 20, 20 + i * 4, 24, 2, i % 2 === 0 ? '#FFD700' : '#111');
  }
  // Arms/weapons
  drawPixelRect(ctx, 10, 20, 8, 4, '#556677');
  drawPixelRect(ctx, 6, 18, 6, 3, '#888');
  drawPixelRect(ctx, 46, 20, 8, 4, '#556677');
  drawPixelRect(ctx, 52, 18, 6, 3, '#888');
  // Treads
  drawPixelRect(ctx, 16, 40, 12, 8, '#444455');
  drawPixelRect(ctx, 36, 40, 12, 8, '#444455');
  drawPixelRect(ctx, 18, 42, 8, 4, '#333344');
  drawPixelRect(ctx, 38, 42, 8, 4, '#333344');
}

function drawCommanderMech(ctx) {
  fillBg(ctx, ZONE_BG.military);
  // Massive mech body
  drawPixelRect(ctx, 14, 12, 36, 36, '#556677');
  drawPixelRect(ctx, 18, 16, 28, 28, '#667788');
  // Cockpit/head
  drawPixelRect(ctx, 22, 4, 20, 12, '#778899');
  drawPixelRect(ctx, 26, 6, 12, 6, '#2233FF33');
  drawGlowEye(ctx, 28, 7, 4, '#3388FF');
  drawGlowEye(ctx, 34, 7, 4, '#3388FF');
  // Shoulder weapons
  drawPixelRect(ctx, 4, 10, 12, 8, '#778899');
  drawPixelRect(ctx, 2, 8, 6, 4, '#888');
  drawPixelRect(ctx, 48, 10, 12, 8, '#778899');
  drawPixelRect(ctx, 56, 8, 6, 4, '#888');
  // Chest reactor
  drawPixelRect(ctx, 26, 20, 12, 12, '#113355');
  drawPixelRect(ctx, 28, 22, 8, 8, '#3388FF');
  drawPixelRect(ctx, 30, 24, 4, 4, '#66BBFF');
  // Arms - heavy
  drawPixelRect(ctx, 6, 18, 8, 20, '#556677');
  drawPixelRect(ctx, 50, 18, 8, 20, '#556677');
  // Gatling arm
  drawPixelRect(ctx, 52, 36, 10, 3, '#888');
  drawPixelRect(ctx, 60, 34, 4, 7, '#999');
  // Legs
  drawPixelRect(ctx, 18, 46, 10, 12, '#556677');
  drawPixelRect(ctx, 36, 46, 10, 12, '#556677');
  drawBossFrame(ctx, '#3388FF');
  drawBossBadge(ctx);
}

// ── Zone 6: The Core ────────────────────────────────

function drawRadiationElemental(ctx) {
  fillBg(ctx, ZONE_BG.core);
  // Ethereal glowing form
  drawPixelRect(ctx, 18, 14, 28, 34, '#44882244');
  drawPixelRect(ctx, 22, 10, 20, 6, '#55993344');
  // Core body (brighter)
  drawPixelRect(ctx, 22, 18, 20, 24, '#44AA22');
  drawPixelRect(ctx, 26, 14, 12, 6, '#55BB33');
  // Face
  drawGlowEye(ctx, 26, 18, 5, '#FFFFFF');
  drawGlowEye(ctx, 35, 18, 5, '#FFFFFF');
  drawPixelRect(ctx, 30, 26, 4, 2, '#CCFF88');
  // Floating particles around
  drawPixelRect(ctx, 12, 8, 3, 3, '#66FF33');
  drawPixelRect(ctx, 50, 12, 2, 2, '#88FF44');
  drawPixelRect(ctx, 8, 30, 3, 3, '#44DD22');
  drawPixelRect(ctx, 54, 34, 2, 2, '#66FF33');
  drawPixelRect(ctx, 14, 48, 2, 2, '#88FF44');
  drawPixelRect(ctx, 48, 50, 3, 3, '#44DD22');
  // Energy tendrils
  drawPixelRect(ctx, 14, 22, 8, 2, '#66FF3388');
  drawPixelRect(ctx, 42, 24, 10, 2, '#66FF3388');
  drawPixelRect(ctx, 10, 28, 12, 2, '#44DD2266');
  drawPixelRect(ctx, 42, 30, 14, 2, '#44DD2266');
  // Ground glow
  drawPixelRect(ctx, 16, 48, 32, 4, '#44FF2244');
}

function drawMutantAbomination(ctx) {
  fillBg(ctx, ZONE_BG.core);
  // Massive misshapen body
  drawPixelRect(ctx, 10, 16, 44, 32, '#5A2A3A');
  drawPixelRect(ctx, 14, 12, 36, 8, '#6A3A4A');
  // Multiple limbs
  drawPixelRect(ctx, 2, 20, 10, 5, '#5A2A3A');
  drawPixelRect(ctx, 0, 28, 12, 5, '#5A2A3A');
  drawPixelRect(ctx, 52, 18, 10, 5, '#5A2A3A');
  drawPixelRect(ctx, 54, 26, 8, 5, '#5A2A3A');
  drawPixelRect(ctx, 50, 34, 10, 5, '#5A2A3A');
  // Cluster of eyes
  drawGlowEye(ctx, 18, 14, 4, '#FF3333');
  drawGlowEye(ctx, 26, 12, 5, '#FF4444');
  drawGlowEye(ctx, 34, 14, 3, '#FF2222');
  drawGlowEye(ctx, 40, 16, 4, '#FF5555');
  drawGlowEye(ctx, 22, 20, 3, '#FF3333');
  // Maw
  drawPixelRect(ctx, 26, 24, 12, 8, '#220000');
  drawPixelRect(ctx, 28, 24, 2, 3, '#FFF');
  drawPixelRect(ctx, 34, 24, 2, 3, '#FFF');
  drawPixelRect(ctx, 31, 30, 2, 3, '#FFF');
  // Pulsing wounds
  drawPixelRect(ctx, 16, 30, 4, 4, '#FF336644');
  drawPixelRect(ctx, 40, 28, 5, 5, '#FF336644');
  // Legs
  drawPixelRect(ctx, 16, 46, 8, 10, '#4A1A2A');
  drawPixelRect(ctx, 30, 46, 6, 10, '#4A1A2A');
  drawPixelRect(ctx, 42, 46, 8, 10, '#4A1A2A');
}

function drawFusionGolem(ctx) {
  fillBg(ctx, ZONE_BG.core);
  // Rocky/crystal body
  drawPixelRect(ctx, 18, 14, 28, 34, '#554466');
  drawPixelRect(ctx, 22, 10, 20, 8, '#665577');
  // Glowing core in chest
  drawPixelRect(ctx, 26, 22, 12, 12, '#220044');
  drawPixelRect(ctx, 28, 24, 8, 8, '#8844FF');
  drawPixelRect(ctx, 30, 26, 4, 4, '#CC88FF');
  // Head
  drawPixelRect(ctx, 24, 4, 16, 10, '#665577');
  drawGlowEye(ctx, 27, 7, 4, '#8844FF');
  drawGlowEye(ctx, 35, 7, 4, '#8844FF');
  // Crystal protrusions
  drawPixelRect(ctx, 20, 6, 4, 8, '#9966FF44');
  drawPixelRect(ctx, 40, 8, 4, 6, '#9966FF44');
  drawPixelRect(ctx, 14, 18, 4, 6, '#7744DD44');
  drawPixelRect(ctx, 46, 20, 4, 8, '#7744DD44');
  // Arms
  drawPixelRect(ctx, 10, 16, 8, 20, '#554466');
  drawPixelRect(ctx, 46, 16, 8, 20, '#554466');
  // Fists
  drawPixelRect(ctx, 8, 34, 10, 8, '#665577');
  drawPixelRect(ctx, 46, 34, 10, 8, '#665577');
  // Legs
  drawPixelRect(ctx, 20, 46, 10, 12, '#443355');
  drawPixelRect(ctx, 34, 46, 10, 12, '#443355');
  // Energy cracks
  drawPixelRect(ctx, 24, 16, 1, 6, '#8844FF88');
  drawPixelRect(ctx, 39, 18, 1, 8, '#8844FF88');
}

function drawCoreAbomination(ctx) {
  fillBg(ctx, ZONE_BG.core);
  // Blend of organic and energy
  drawPixelRect(ctx, 16, 14, 32, 32, '#4A2244');
  drawPixelRect(ctx, 20, 10, 24, 8, '#5A3254');
  // Radiation-cracked body
  drawPixelRect(ctx, 24, 16, 2, 28, '#FF445544');
  drawPixelRect(ctx, 38, 18, 2, 24, '#FF445544');
  drawPixelRect(ctx, 28, 20, 8, 2, '#FF445544');
  // Head
  drawPixelRect(ctx, 22, 4, 20, 10, '#5A3254');
  drawGlowEye(ctx, 26, 6, 5, '#FF4444');
  drawGlowEye(ctx, 35, 6, 5, '#FF4444');
  // Mouth / void
  drawPixelRect(ctx, 28, 12, 8, 4, '#110011');
  // Arms
  drawPixelRect(ctx, 8, 18, 8, 4, '#4A2244');
  drawPixelRect(ctx, 4, 22, 6, 4, '#4A2244');
  drawPixelRect(ctx, 48, 16, 8, 4, '#4A2244');
  drawPixelRect(ctx, 52, 20, 8, 4, '#4A2244');
  // Floating debris
  drawPixelRect(ctx, 10, 8, 3, 3, '#FF445544');
  drawPixelRect(ctx, 52, 10, 4, 3, '#FF445544');
  // Legs
  drawPixelRect(ctx, 20, 44, 6, 10, '#3A1234');
  drawPixelRect(ctx, 38, 44, 6, 10, '#3A1234');
}

function drawTheSource(ctx) {
  fillBg(ctx, ZONE_BG.core);
  // Central mass of pure radiation
  drawPixelRect(ctx, 16, 12, 32, 36, '#224400');
  drawPixelRect(ctx, 20, 8, 24, 8, '#336611');
  // Pulsing core
  drawPixelRect(ctx, 24, 20, 16, 16, '#44AA00');
  drawPixelRect(ctx, 26, 22, 12, 12, '#66CC22');
  drawPixelRect(ctx, 28, 24, 8, 8, '#88EE44');
  drawPixelRect(ctx, 30, 26, 4, 4, '#CCFF88');
  // Face in the energy
  drawGlowEye(ctx, 24, 14, 5, '#FFFFFF');
  drawGlowEye(ctx, 37, 14, 5, '#FFFFFF');
  drawPixelRect(ctx, 30, 36, 4, 2, '#FFFFFF');
  // Energy tendrils reaching out
  drawPixelRect(ctx, 4, 16, 12, 3, '#44AA0066');
  drawPixelRect(ctx, 0, 24, 16, 3, '#66CC2266');
  drawPixelRect(ctx, 48, 14, 12, 3, '#44AA0066');
  drawPixelRect(ctx, 48, 28, 14, 3, '#66CC2266');
  drawPixelRect(ctx, 8, 36, 10, 3, '#44AA0066');
  drawPixelRect(ctx, 46, 38, 12, 3, '#44AA0066');
  // Floating energy orbs
  drawPixelRect(ctx, 6, 6, 4, 4, '#88EE44');
  drawPixelRect(ctx, 54, 8, 3, 3, '#66CC22');
  drawPixelRect(ctx, 4, 44, 3, 3, '#88EE44');
  drawPixelRect(ctx, 56, 48, 4, 4, '#66CC22');
  drawBossFrame(ctx, '#88EE44');
  drawBossBadge(ctx);
}

// ── Zone 7: Ground Zero ─────────────────────────────

function drawPhaseWalker(ctx) {
  fillBg(ctx, ZONE_BG.ground_zero);
  // Semi-transparent ghostly figure
  drawPixelRect(ctx, 22, 14, 20, 32, '#6644AA44');
  drawPixelRect(ctx, 24, 16, 16, 28, '#7755BB66');
  // Head
  drawPixelRect(ctx, 24, 4, 16, 12, '#8866CC66');
  // Void eyes
  drawGlowEye(ctx, 27, 7, 4, '#CC88FF');
  drawGlowEye(ctx, 35, 7, 4, '#CC88FF');
  // Phasing effect (offset copies)
  drawPixelRect(ctx, 18, 16, 16, 28, '#6644AA22');
  drawPixelRect(ctx, 30, 14, 16, 28, '#6644AA22');
  // Arms
  drawPixelRect(ctx, 16, 20, 6, 3, '#7755BB44');
  drawPixelRect(ctx, 12, 24, 6, 3, '#7755BB44');
  drawPixelRect(ctx, 42, 18, 6, 3, '#7755BB44');
  drawPixelRect(ctx, 46, 22, 6, 3, '#7755BB44');
  // Phase particles
  for (let i = 0; i < 8; i++) {
    const px = randInt(4, 56);
    const py = randInt(4, 56);
    drawPixelRect(ctx, px, py, 2, 2, '#CC88FF66');
  }
  // Ground distortion
  drawPixelRect(ctx, 18, 48, 28, 3, '#7755BB44');
}

function drawRealityBreaker(ctx) {
  fillBg(ctx, ZONE_BG.ground_zero);
  // Geometric impossible form
  drawPixelRect(ctx, 20, 12, 24, 36, '#332255');
  // Inverted space sections
  drawPixelRect(ctx, 24, 16, 8, 8, '#110022');
  drawPixelRect(ctx, 36, 20, 6, 10, '#110022');
  drawPixelRect(ctx, 22, 32, 10, 8, '#110022');
  // Glitch lines
  drawPixelRect(ctx, 8, 14, 48, 1, '#FF00FF44');
  drawPixelRect(ctx, 4, 24, 56, 1, '#00FFFF44');
  drawPixelRect(ctx, 12, 36, 40, 1, '#FF00FF44');
  drawPixelRect(ctx, 6, 46, 52, 1, '#00FFFF44');
  // Core eye
  drawPixelRect(ctx, 26, 22, 12, 8, '#110033');
  drawGlowEye(ctx, 29, 24, 6, '#FF00FF');
  // Fragmented edges
  drawPixelRect(ctx, 14, 10, 4, 4, '#442266');
  drawPixelRect(ctx, 46, 14, 6, 4, '#442266');
  drawPixelRect(ctx, 10, 36, 6, 6, '#442266');
  drawPixelRect(ctx, 48, 40, 4, 6, '#442266');
  // Reality tears
  drawPixelRect(ctx, 16, 18, 3, 12, '#FF00FF88');
  drawPixelRect(ctx, 45, 22, 3, 10, '#00FFFF88');
}

function drawApocalypseHerald(ctx) {
  fillBg(ctx, ZONE_BG.ground_zero);
  // Towering robed figure
  drawPixelRect(ctx, 18, 8, 28, 44, '#2A0A2A');
  drawPixelRect(ctx, 22, 12, 20, 36, '#3A1A3A');
  // Hood
  drawPixelRect(ctx, 20, 4, 24, 12, '#1A0A1A');
  drawPixelRect(ctx, 22, 6, 20, 8, '#0A000A');
  // Eyes from void
  drawGlowEye(ctx, 27, 8, 4, '#FF4444');
  drawGlowEye(ctx, 35, 8, 4, '#FF4444');
  // Staff of power
  drawPixelRect(ctx, 46, 2, 2, 52, '#886644');
  drawPixelRect(ctx, 42, 0, 10, 6, '#FF4444');
  drawPixelRect(ctx, 44, 2, 6, 2, '#FFAA44');
  // Energy from hands
  drawPixelRect(ctx, 12, 24, 8, 3, '#FF444488');
  drawPixelRect(ctx, 8, 22, 6, 2, '#FF222244');
  // Floating runes
  drawPixelRect(ctx, 6, 12, 4, 4, '#FF444444');
  drawPixelRect(ctx, 10, 34, 3, 3, '#FF444444');
  drawPixelRect(ctx, 54, 16, 3, 3, '#FF444444');
  // Tattered cloak bottom
  drawPixelRect(ctx, 16, 48, 4, 6, '#2A0A2A');
  drawPixelRect(ctx, 24, 50, 3, 6, '#2A0A2A');
  drawPixelRect(ctx, 37, 48, 5, 6, '#2A0A2A');
  drawPixelRect(ctx, 44, 50, 3, 4, '#2A0A2A');
}

function drawVoidEntity(ctx) {
  fillBg(ctx, ZONE_BG.ground_zero);
  // Amorphous void shape
  drawPixelRect(ctx, 14, 10, 36, 40, '#0A0018');
  drawPixelRect(ctx, 18, 6, 28, 8, '#0A0018');
  drawPixelRect(ctx, 18, 46, 28, 8, '#0A0018');
  // Inner void (pure black)
  drawPixelRect(ctx, 20, 14, 24, 28, '#000008');
  // Void eyes
  drawGlowEye(ctx, 24, 20, 6, '#9933FF');
  drawGlowEye(ctx, 36, 20, 6, '#9933FF');
  // Void mouth
  drawPixelRect(ctx, 28, 30, 8, 4, '#220044');
  drawPixelRect(ctx, 30, 33, 4, 2, '#6622CC');
  // Anti-particles (white specks in void)
  drawPixelRect(ctx, 26, 16, 1, 1, '#FFF');
  drawPixelRect(ctx, 38, 18, 1, 1, '#FFF');
  drawPixelRect(ctx, 30, 38, 1, 1, '#FFF');
  drawPixelRect(ctx, 22, 34, 1, 1, '#FFF');
  drawPixelRect(ctx, 40, 28, 1, 1, '#FFF');
  // Edge distortion
  drawPixelRect(ctx, 10, 14, 4, 3, '#1A0028');
  drawPixelRect(ctx, 50, 18, 4, 4, '#1A0028');
  drawPixelRect(ctx, 8, 38, 6, 3, '#1A0028');
  drawPixelRect(ctx, 52, 42, 4, 3, '#1A0028');
}

function drawTheCataclysm(ctx) {
  fillBg(ctx, ZONE_BG.ground_zero);
  // Reality-warping entity
  drawPixelRect(ctx, 8, 4, 48, 52, '#0A0018');
  drawPixelRect(ctx, 12, 8, 40, 44, '#140028');
  // Central void eye
  drawPixelRect(ctx, 22, 18, 20, 16, '#000010');
  drawPixelRect(ctx, 26, 22, 12, 8, '#220044');
  drawPixelRect(ctx, 28, 24, 8, 4, '#6622CC');
  drawPixelRect(ctx, 30, 25, 4, 2, '#CC88FF');
  // Orbital rings
  drawPixelRect(ctx, 6, 26, 52, 2, '#6622CC44');
  drawPixelRect(ctx, 30, 2, 2, 56, '#6622CC44');
  // Corner void fractures
  drawPixelRect(ctx, 4, 4, 8, 2, '#FF00FF66');
  drawPixelRect(ctx, 52, 4, 8, 2, '#FF00FF66');
  drawPixelRect(ctx, 4, 54, 8, 2, '#FF00FF66');
  drawPixelRect(ctx, 52, 54, 8, 2, '#FF00FF66');
  // Energy constellation
  drawPixelRect(ctx, 16, 10, 3, 3, '#FF4444');
  drawPixelRect(ctx, 44, 12, 3, 3, '#4444FF');
  drawPixelRect(ctx, 14, 42, 3, 3, '#44FF44');
  drawPixelRect(ctx, 46, 44, 3, 3, '#FFFF44');
  drawPixelRect(ctx, 30, 6, 4, 4, '#FF44FF');
  drawPixelRect(ctx, 30, 44, 4, 4, '#44FFFF');
  // Floating debris from reality
  drawPixelRect(ctx, 18, 36, 4, 3, '#88668866');
  drawPixelRect(ctx, 42, 32, 3, 4, '#88668866');
  drawBossFrame(ctx, '#9933FF');
  drawBossBadge(ctx);
}

// ══════════════════════════════════════════════════════
//  PLAYER AVATAR DRAWING FUNCTIONS
// ══════════════════════════════════════════════════════

const SKIN_TONES = ['#F4C99A', '#D4A06A', '#8B6340', '#5C3A1E', '#E8B89A', '#C49060'];
const HAIR_COLORS = ['#2A1A0A', '#6B4423', '#CC8844', '#AA3333', '#555555', '#EEEEEE', '#334466'];

function drawAvatarBase(ctx, skinIdx, hairIdx, hairStyle) {
  const skin = SKIN_TONES[skinIdx % SKIN_TONES.length];
  const hair = HAIR_COLORS[hairIdx % HAIR_COLORS.length];
  const skinDark = darken(skin, 30);

  // Neck
  drawPixelRect(ctx, 26, 38, 12, 6, skin);

  // Head shape
  drawPixelRect(ctx, 18, 12, 28, 28, skin);
  drawPixelRect(ctx, 20, 10, 24, 4, skin);

  // Eyes
  drawPixelRect(ctx, 22, 24, 6, 4, '#FFF');
  drawPixelRect(ctx, 36, 24, 6, 4, '#FFF');
  drawPixelRect(ctx, 24, 25, 3, 3, '#334');
  drawPixelRect(ctx, 38, 25, 3, 3, '#334');
  drawPixelRect(ctx, 25, 25, 1, 1, '#FFF'); // highlight
  drawPixelRect(ctx, 39, 25, 1, 1, '#FFF');

  // Nose
  drawPixelRect(ctx, 30, 28, 4, 3, skinDark);

  // Mouth
  drawPixelRect(ctx, 28, 34, 8, 2, skinDark);

  // Ears
  drawPixelRect(ctx, 16, 22, 4, 8, skin);
  drawPixelRect(ctx, 44, 22, 4, 8, skin);

  // Hair
  drawHairStyle(ctx, hair, hairStyle);
}

function darken(hex, amount) {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount);
  return `rgb(${r},${g},${b})`;
}

function drawHairStyle(ctx, color, style) {
  const dark = darken(color, 20);
  switch (style) {
    case 'short':
      drawPixelRect(ctx, 18, 8, 28, 10, color);
      drawPixelRect(ctx, 16, 10, 4, 8, color);
      drawPixelRect(ctx, 44, 10, 4, 8, color);
      break;
    case 'mohawk':
      drawPixelRect(ctx, 28, 0, 8, 14, color);
      drawPixelRect(ctx, 30, 0, 4, 4, dark);
      drawPixelRect(ctx, 18, 10, 28, 4, color);
      break;
    case 'long':
      drawPixelRect(ctx, 18, 6, 28, 10, color);
      drawPixelRect(ctx, 14, 14, 6, 24, color);
      drawPixelRect(ctx, 44, 14, 6, 24, color);
      drawPixelRect(ctx, 16, 10, 4, 6, color);
      drawPixelRect(ctx, 44, 10, 4, 6, color);
      break;
    case 'buzzcut':
      drawPixelRect(ctx, 20, 10, 24, 6, color);
      drawPixelRect(ctx, 18, 12, 4, 4, color);
      drawPixelRect(ctx, 42, 12, 4, 4, color);
      break;
    case 'ponytail':
      drawPixelRect(ctx, 18, 6, 28, 10, color);
      drawPixelRect(ctx, 42, 14, 8, 4, color);
      drawPixelRect(ctx, 48, 16, 6, 16, color);
      drawPixelRect(ctx, 50, 30, 4, 8, color);
      break;
    case 'bald':
      // No hair, just the scalp color
      drawPixelRect(ctx, 20, 10, 24, 4, darken(color, 40));
      break;
    case 'spiky':
      drawPixelRect(ctx, 18, 10, 28, 6, color);
      drawPixelRect(ctx, 20, 4, 4, 8, color);
      drawPixelRect(ctx, 28, 2, 4, 10, color);
      drawPixelRect(ctx, 36, 4, 4, 8, color);
      drawPixelRect(ctx, 42, 6, 4, 6, color);
      break;
    case 'braids':
      drawPixelRect(ctx, 18, 6, 28, 10, color);
      drawPixelRect(ctx, 14, 14, 6, 18, color);
      drawPixelRect(ctx, 44, 14, 6, 18, color);
      drawPixelRect(ctx, 16, 30, 4, 10, dark);
      drawPixelRect(ctx, 44, 30, 4, 10, dark);
      break;
  }
}

function drawAvatarOutfit(ctx, outfitColor, outfitStyle) {
  const dark = darken(outfitColor, 30);
  // Shoulders and torso (lower portion of icon)
  drawPixelRect(ctx, 10, 44, 44, 20, outfitColor);
  drawPixelRect(ctx, 14, 42, 36, 4, outfitColor);

  switch (outfitStyle) {
    case 'armor':
      drawPixelRect(ctx, 12, 44, 40, 2, '#888');
      drawPixelRect(ctx, 8, 46, 8, 8, '#777');
      drawPixelRect(ctx, 48, 46, 8, 8, '#777');
      drawPixelRect(ctx, 26, 48, 12, 8, '#666');
      break;
    case 'jacket':
      drawPixelRect(ctx, 30, 44, 4, 16, dark);
      drawPixelRect(ctx, 10, 44, 4, 16, dark);
      drawPixelRect(ctx, 50, 44, 4, 16, dark);
      break;
    case 'robe':
      drawPixelRect(ctx, 12, 44, 40, 4, dark);
      drawPixelRect(ctx, 28, 48, 8, 8, dark);
      break;
    case 'vest':
      drawPixelRect(ctx, 20, 44, 24, 16, dark);
      drawPixelRect(ctx, 10, 44, 10, 16, outfitColor);
      drawPixelRect(ctx, 44, 44, 10, 16, outfitColor);
      break;
    case 'tactical':
      drawPixelRect(ctx, 14, 44, 36, 2, '#555');
      drawPixelRect(ctx, 22, 48, 4, 8, '#555');
      drawPixelRect(ctx, 38, 48, 4, 8, '#555');
      drawPixelRect(ctx, 28, 46, 8, 4, '#666');
      break;
  }
}

function drawAvatarAccessory(ctx, type) {
  switch (type) {
    case 'eyepatch':
      drawPixelRect(ctx, 34, 23, 10, 6, '#222');
      drawPixelRect(ctx, 44, 18, 2, 8, '#222');
      break;
    case 'scar':
      drawPixelRect(ctx, 24, 20, 1, 12, '#CC665544');
      drawPixelRect(ctx, 25, 22, 1, 8, '#CC665522');
      break;
    case 'goggles':
      drawPixelRect(ctx, 20, 22, 10, 6, '#555');
      drawPixelRect(ctx, 34, 22, 10, 6, '#555');
      drawPixelRect(ctx, 22, 23, 6, 4, '#88AACC');
      drawPixelRect(ctx, 36, 23, 6, 4, '#88AACC');
      drawPixelRect(ctx, 30, 24, 4, 2, '#555');
      break;
    case 'bandana':
      drawPixelRect(ctx, 16, 18, 32, 4, '#CC3333');
      drawPixelRect(ctx, 44, 20, 8, 3, '#CC3333');
      drawPixelRect(ctx, 50, 22, 6, 2, '#CC3333');
      break;
    case 'gasmask':
      drawPixelRect(ctx, 22, 28, 20, 10, '#444');
      drawPixelRect(ctx, 24, 30, 6, 4, '#556655');
      drawPixelRect(ctx, 34, 30, 6, 4, '#556655');
      drawPixelRect(ctx, 30, 36, 4, 6, '#333');
      break;
    case 'tattoo':
      drawPixelRect(ctx, 38, 22, 6, 1, '#334466');
      drawPixelRect(ctx, 40, 23, 4, 1, '#334466');
      drawPixelRect(ctx, 42, 24, 3, 2, '#334466');
      break;
    case 'visor':
      drawPixelRect(ctx, 18, 22, 28, 5, '#33448866');
      drawPixelRect(ctx, 20, 23, 24, 3, '#4488CC88');
      break;
    case 'none':
    default:
      break;
  }
}

// Avatar definitions: [name, skinIdx, hairIdx, hairStyle, outfitColor, outfitStyle, accessory, bgColor]
const AVATARS = [
  ['wastelander_01', 0, 0, 'short', '#5A6B5A', 'jacket', 'scar', '#1A2218'],
  ['wastelander_02', 1, 1, 'mohawk', '#8B4513', 'vest', 'none', '#221A14'],
  ['wastelander_03', 2, 2, 'buzzcut', '#4A5A4A', 'tactical', 'eyepatch', '#141A18'],
  ['wastelander_04', 3, 0, 'long', '#6B5A4A', 'robe', 'none', '#1A1818'],
  ['wastelander_05', 4, 3, 'spiky', '#CC3333', 'jacket', 'bandana', '#201414'],
  ['wastelander_06', 5, 4, 'ponytail', '#556677', 'armor', 'goggles', '#141820'],
  ['wastelander_07', 0, 5, 'braids', '#3A4A3A', 'robe', 'tattoo', '#181A14'],
  ['wastelander_08', 1, 6, 'short', '#777788', 'armor', 'visor', '#14141A'],
  ['wastelander_09', 2, 3, 'bald', '#5A4A3A', 'vest', 'scar', '#1A1814'],
  ['wastelander_10', 3, 1, 'mohawk', '#4A6B4A', 'tactical', 'gasmask', '#141A14'],
  ['wastelander_11', 4, 0, 'long', '#8B6B5A', 'jacket', 'none', '#1E1814'],
  ['wastelander_12', 5, 2, 'spiky', '#4A4A6B', 'armor', 'eyepatch', '#14141E'],
  ['wastelander_13', 0, 4, 'ponytail', '#6B4A4A', 'robe', 'bandana', '#1E1414'],
  ['wastelander_14', 1, 5, 'braids', '#5A6B6B', 'tactical', 'goggles', '#141E1E'],
  ['wastelander_15', 2, 6, 'buzzcut', '#6B6B4A', 'vest', 'tattoo', '#1E1E14'],
  ['wastelander_16', 3, 3, 'short', '#445566', 'armor', 'visor', '#141820'],
  ['wastelander_17', 4, 1, 'bald', '#5A5A3A', 'jacket', 'gasmask', '#1A1A14'],
  ['wastelander_18', 5, 0, 'long', '#885544', 'robe', 'scar', '#201814'],
  ['wastelander_19', 0, 2, 'mohawk', '#336655', 'tactical', 'bandana', '#141E18'],
  ['wastelander_20', 1, 4, 'spiky', '#554433', 'vest', 'eyepatch', '#1A1614'],
];

// ══════════════════════════════════════════════════════
//  GENERATION
// ══════════════════════════════════════════════════════

const MONSTERS = [
  // Zone 1: The Outskirts
  ['mutated_mosquito', drawMutatedMosquito],
  ['mutated_frog', drawMutatedFrog],
  ['mutated_centipede', drawMutatedCentipede],
  ['wasteland_vermin', drawWastelandVermin],
  ['giant_roach', drawGiantRoach],
  // Zone 2: Ruined Suburbs
  ['feral_dog_pack', drawFeralDogPack],
  ['mutant_hawk', drawMutantHawk],
  ['rad_rat_swarm', drawRadRatSwarm],
  ['suburb_dweller', drawSuburbDweller],
  ['alpha_wolf', drawAlphaWolf],
  // Zone 3: Toxic Industrial
  ['slime_crawler', drawSlimeCrawler],
  ['rogue_drone', drawRogueDrone],
  ['sewer_beast', drawSewerBeast],
  ['factory_mutant', drawFactoryMutant],
  ['factory_overseer', drawFactoryOverseer],
  // Zone 4: The Deadlands
  ['sandworm', drawSandworm],
  ['raider_gang', drawRaiderGang],
  ['glowing_ghoul', drawGlowingGhoul],
  ['deadlands_dweller', drawDeadlandsDweller],
  ['raider_warlord', drawRaiderWarlord],
  // Zone 5: Military Zone
  ['turret_array', drawTurretArray],
  ['bio_soldier', drawBioSoldier],
  ['escaped_experiment', drawEscapedExperiment],
  ['military_hazard', drawMilitaryHazard],
  ['commander_mech', drawCommanderMech],
  // Zone 6: The Core
  ['radiation_elemental', drawRadiationElemental],
  ['mutant_abomination', drawMutantAbomination],
  ['fusion_golem', drawFusionGolem],
  ['core_abomination', drawCoreAbomination],
  ['the_source', drawTheSource],
  // Zone 7: Ground Zero
  ['phase_walker', drawPhaseWalker],
  ['reality_breaker', drawRealityBreaker],
  ['apocalypse_herald', drawApocalypseHerald],
  ['void_entity', drawVoidEntity],
  ['the_cataclysm', drawTheCataclysm],
];

console.log('Generating monster icons...');
let monsterCount = 0;
for (const [name, drawFn] of MONSTERS) {
  const { canvas, ctx } = createIcon();
  drawFn(ctx);
  saveIcon(canvas, 'monsters', name);
  monsterCount++;
}
console.log(`  ${monsterCount} monster icons saved.`);

console.log('Generating player avatars...');
let avatarCount = 0;
for (const [name, skinIdx, hairIdx, hairStyle, outfitColor, outfitStyle, accessory, bgColor] of AVATARS) {
  const { canvas, ctx } = createIcon();
  fillBg(ctx, bgColor);
  drawAvatarBase(ctx, skinIdx, hairIdx, hairStyle);
  drawAvatarOutfit(ctx, outfitColor, outfitStyle);
  drawAvatarAccessory(ctx, accessory);
  saveIcon(canvas, 'avatars', name);
  avatarCount++;
}
console.log(`  ${avatarCount} player avatars saved.`);

console.log(`Done! Total: ${monsterCount + avatarCount} icons generated.`);
