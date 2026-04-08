/**
 * Generate missing small batches: 5 resources, 5 skills, 1 consumable = 11 icons
 */
import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

const SIZE = 128;

function save(canvas, dir, name) {
  const outDir = path.join(process.cwd(), 'public', 'assets', dir);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, `${name}.png`), canvas.toBuffer('image/png'));
}

function lighten(hex, amt) {
  const r = Math.min(255, parseInt(hex.slice(1,3),16)+amt);
  const g = Math.min(255, parseInt(hex.slice(3,5),16)+amt);
  const b = Math.min(255, parseInt(hex.slice(5,7),16)+amt);
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

function makeBg(ctx, color) {
  const g = ctx.createRadialGradient(64,64,10,64,64,80);
  g.addColorStop(0, lighten(color,15));
  g.addColorStop(1, color);
  ctx.fillStyle = g;
  ctx.fillRect(0,0,SIZE,SIZE);
}

// ── RESOURCES (5) ───────────────────────────────────
function drawOreResource(ctx, bgColor, oreColor, oreName, badge) {
  makeBg(ctx, bgColor);
  // Ore chunk
  ctx.fillStyle = oreColor;
  ctx.beginPath();
  ctx.moveTo(40,38); ctx.lineTo(54,28); ctx.lineTo(74,30);
  ctx.lineTo(90,42); ctx.lineTo(88,68); ctx.lineTo(72,82);
  ctx.lineTo(48,80); ctx.lineTo(36,64);
  ctx.closePath();
  ctx.fill();
  // Facets
  ctx.fillStyle = lighten(oreColor, 30);
  ctx.beginPath();
  ctx.moveTo(54,28); ctx.lineTo(64,50); ctx.lineTo(74,30);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = lighten(oreColor, 15);
  ctx.beginPath();
  ctx.moveTo(40,38); ctx.lineTo(64,50); ctx.lineTo(48,80); ctx.lineTo(36,64);
  ctx.closePath();
  ctx.fill();
  // Sparkle
  ctx.fillStyle = '#FFFFFF66';
  ctx.beginPath(); ctx.arc(58,40,3,0,Math.PI*2); ctx.fill();
  // Tier badge
  if (badge) {
    ctx.fillStyle = '#8844CC';
    ctx.beginPath(); ctx.arc(104,104,14,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(badge, 104, 105);
  }
}

const RESOURCES = [
  ['highgrade_alloy',   '#1A1A2A', '#8899BB', 'IV'],
  ['masterwork_ore',    '#2A1A14', '#CCAA66', 'V'],
  ['refinement_metal',  '#141A1A', '#77AABB', 'III'],
  ['reinforcement_ore', '#1A1414', '#AA7755', 'III'],
  ['smelting_ore',      '#1A1818', '#BB8866', 'II'],
];

console.log('Generating 5 missing resources...');
for (const [name, bg, color, badge] of RESOURCES) {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  drawOreResource(ctx, bg, color, name, badge);
  save(canvas, 'resources-128', name);
  console.log(`  [OK] ${name}`);
}

// ── SKILLS (5) ──────────────────────────────────────
function drawSkillIcon(ctx, bgColor, ringColor, drawSymbol) {
  makeBg(ctx, bgColor);
  // Circular ring frame
  ctx.strokeStyle = ringColor;
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(64,64,48,0,Math.PI*2); ctx.stroke();
  // Inner circle
  ctx.strokeStyle = lighten(ringColor, 20);
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(64,64,42,0,Math.PI*2); ctx.stroke();
  // Dot accents
  ctx.fillStyle = ringColor;
  for (let i = 0; i < 6; i++) {
    const a = (i/6)*Math.PI*2 - Math.PI/2;
    ctx.beginPath();
    ctx.arc(64+Math.cos(a)*48, 64+Math.sin(a)*48, 3, 0, Math.PI*2);
    ctx.fill();
  }
  drawSymbol(ctx);
}

const SKILLS = [
  ['demolitions', '#1A1014', '#CC6633', (ctx) => {
    // Bomb with fuse
    ctx.fillStyle = '#555';
    ctx.beginPath(); ctx.arc(64,68,18,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#666';
    ctx.beginPath(); ctx.arc(64,68,14,0,Math.PI*2); ctx.fill();
    // Fuse
    ctx.strokeStyle = '#AA8855';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(64,50); ctx.bezierCurveTo(68,42,74,40,76,36); ctx.stroke();
    // Spark
    ctx.fillStyle = '#FFAA33';
    ctx.beginPath(); ctx.arc(76,36,4,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#FFDD66';
    ctx.beginPath(); ctx.arc(76,36,2,0,Math.PI*2); ctx.fill();
    // Explosion lines
    ctx.strokeStyle = '#FF884466';
    ctx.lineWidth = 2;
    [[50,54,-10,-10],[78,54,10,-10],[50,82,-10,10],[78,82,10,10]].forEach(([x,y,dx,dy]) => {
      ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+dx,y+dy); ctx.stroke();
    });
  }],
  ['engineering', '#141820', '#4499CC', (ctx) => {
    // Gear/cog
    ctx.strokeStyle = '#4499CC';
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(64,64,20,0,Math.PI*2); ctx.stroke();
    // Gear teeth
    for (let i = 0; i < 8; i++) {
      const a = (i/8)*Math.PI*2;
      const x1 = 64+Math.cos(a)*22, y1 = 64+Math.sin(a)*22;
      const x2 = 64+Math.cos(a)*30, y2 = 64+Math.sin(a)*30;
      ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    }
    // Center hole
    ctx.fillStyle = '#141820';
    ctx.beginPath(); ctx.arc(64,64,8,0,Math.PI*2); ctx.fill();
    // Wrench across
    ctx.strokeStyle = '#88BBDD';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(44,44); ctx.lineTo(84,84); ctx.stroke();
    ctx.beginPath(); ctx.arc(84,84,5,0,Math.PI*2); ctx.stroke();
  }],
  ['fortification', '#181814', '#AAAA44', (ctx) => {
    // Shield shape
    ctx.fillStyle = '#666';
    ctx.beginPath();
    ctx.moveTo(64,30); ctx.lineTo(88,38); ctx.lineTo(86,70);
    ctx.lineTo(64,90); ctx.lineTo(42,70); ctx.lineTo(40,38);
    ctx.closePath();
    ctx.fill();
    // Inner shield
    ctx.fillStyle = '#777';
    ctx.beginPath();
    ctx.moveTo(64,36); ctx.lineTo(82,42); ctx.lineTo(80,66);
    ctx.lineTo(64,82); ctx.lineTo(48,66); ctx.lineTo(46,42);
    ctx.closePath();
    ctx.fill();
    // Cross emblem
    ctx.fillStyle = '#CCAA44';
    ctx.fillRect(60,44,8,32);
    ctx.fillRect(50,54,28,8);
    // Wall battlements on top
    ctx.fillStyle = '#888';
    for (let x = 42; x < 86; x += 8) {
      ctx.fillRect(x, 26, 5, 6);
    }
  }],
  ['marksmanship', '#0A1A0A', '#33AA55', (ctx) => {
    // Crosshair
    ctx.strokeStyle = '#33CC55';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(64,64,22,0,Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.arc(64,64,12,0,Math.PI*2); ctx.stroke();
    // Cross lines
    ctx.beginPath(); ctx.moveTo(64,36); ctx.lineTo(64,52); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(64,76); ctx.lineTo(64,92); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(36,64); ctx.lineTo(52,64); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(76,64); ctx.lineTo(92,64); ctx.stroke();
    // Center dot
    ctx.fillStyle = '#FF3333';
    ctx.beginPath(); ctx.arc(64,64,3,0,Math.PI*2); ctx.fill();
    // Bullet trajectory
    ctx.strokeStyle = '#33CC5544';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(20,64); ctx.lineTo(108,64); ctx.stroke();
  }],
  ['tactics', '#1A0A1A', '#AA55CC', (ctx) => {
    // Map/strategy board
    ctx.fillStyle = '#3A2A3A';
    ctx.fillRect(38,42,52,40);
    ctx.strokeStyle = '#AA55CC';
    ctx.lineWidth = 2;
    ctx.strokeRect(38,42,52,40);
    // Grid lines
    ctx.strokeStyle = '#6633AA44';
    ctx.lineWidth = 1;
    for (let x = 50; x < 90; x += 12) {
      ctx.beginPath(); ctx.moveTo(x,42); ctx.lineTo(x,82); ctx.stroke();
    }
    for (let y = 52; y < 82; y += 10) {
      ctx.beginPath(); ctx.moveTo(38,y); ctx.lineTo(90,y); ctx.stroke();
    }
    // Arrow movement indicators
    ctx.strokeStyle = '#CC77FF';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(48,72); ctx.lineTo(62,55); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(62,55); ctx.lineTo(58,58); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(62,55); ctx.lineTo(60,52); ctx.stroke(); // arrowhead ish
    ctx.beginPath(); ctx.moveTo(72,70); ctx.lineTo(82,52); ctx.stroke();
    // Unit dots
    ctx.fillStyle = '#FF5555';
    ctx.beginPath(); ctx.arc(48,72,3,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#5555FF';
    ctx.beginPath(); ctx.arc(72,70,3,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#FFAA33';
    ctx.beginPath(); ctx.arc(82,52,3,0,Math.PI*2); ctx.fill();
    // Crown on top
    ctx.fillStyle = '#CC77FF';
    ctx.beginPath();
    ctx.moveTo(52,36); ctx.lineTo(56,30); ctx.lineTo(60,36);
    ctx.lineTo(64,28); ctx.lineTo(68,36); ctx.lineTo(72,30);
    ctx.lineTo(76,36); ctx.lineTo(76,42); ctx.lineTo(52,42);
    ctx.closePath();
    ctx.fill();
  }],
];

console.log('Generating 5 missing skill icons...');
for (const [name, bg, ring, drawFn] of SKILLS) {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  drawSkillIcon(ctx, bg, ring, drawFn);
  save(canvas, 'skills-128', name);
  console.log(`  [OK] ${name}`);
}

// ── CONSUMABLE (1) ──────────────────────────────────
console.log('Generating aspect_stone consumable...');
{
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  makeBg(ctx, '#141428');
  // Gem
  const cx=64,cy=58;
  const pts=[];
  for(let i=0;i<5;i++){const a=(i/5)*Math.PI*2-Math.PI/2;pts.push([cx+Math.cos(a)*28,cy+Math.sin(a)*28]);}
  const gg=ctx.createLinearGradient(36,30,92,86);
  gg.addColorStop(0,'#CC88FF');gg.addColorStop(0.3,'#9955DD');
  gg.addColorStop(0.6,'#7733BB');gg.addColorStop(1,'#553399');
  ctx.fillStyle=gg;
  ctx.beginPath();pts.forEach(([x,y],i)=>i===0?ctx.moveTo(x,y):ctx.lineTo(x,y));ctx.closePath();ctx.fill();
  ctx.strokeStyle='#AA77DD66';ctx.lineWidth=1;
  for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(pts[i][0],pts[i][1]);ctx.stroke();}
  ctx.fillStyle='#DDAAFF44';
  ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(pts[0][0],pts[0][1]);ctx.lineTo(pts[1][0],pts[1][1]);ctx.closePath();ctx.fill();
  const sp=ctx.createRadialGradient(58,50,0,58,50,8);
  sp.addColorStop(0,'#FFFFFF88');sp.addColorStop(1,'transparent');
  ctx.fillStyle=sp;ctx.beginPath();ctx.arc(58,50,8,0,Math.PI*2);ctx.fill();
  save(canvas, 'consumables-128', 'aspect_stone');
  console.log('  [OK] aspect_stone');
}

console.log(`\nDone! Generated 11 small icons.`);
