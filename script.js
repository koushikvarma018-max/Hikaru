/* ————————————————————————————————————————————————
   Hikaru's Space — world engine
   Painted scenes on a canvas + ambient music generated
   live with the Web Audio API (no files, no noise,
   only peace).
   ———————————————————————————————————————————————— */

(() => {
'use strict';

/* ————— tiny helpers ————— */

const TAU = Math.PI * 2;
const rand = (a, b) => a + Math.random() * (b - a);
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const mix = (c1, c2, t) => [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];
const css = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ————— the three corners of this world ————— */

const SCENES = [
  {
    id: 'lake', label: 'Moonlit Lake', orb: [150, 180, 235],
    sky: [[6, 10, 26], [14, 26, 56], [38, 62, 98], [128, 100, 138]],
    hills: [[9, 15, 33], [14, 22, 44]],
    water: [[14, 26, 54], [5, 9, 20]], waterW: 1,
    stars: 1, starTint: [222, 232, 255],
    moon: 1, sun: 0,
    moonCol: [246, 240, 214], sunCol: [255, 214, 160],
    moonPos: [.74, .24], sunPos: [.28, .62],
    clouds: 7, cloudA: .13, warmA: 0,
    fireflies: reduced ? 10 : 24,
    petals: 0,
    aurora: 0,
    motes: reduced ? 10 : 22, moteCol: [168, 214, 255],
    shootRate: .004,
    fog: 0, fogCol: [210, 222, 240],
    rain: 0, rippleRate: 1,
    hillStyle: 'rolling', hillAmp: 1,
    whisper: [
      'Let the water carry your thoughts away.',
      'Nothing is asked of you here.',
      'Breathe in\u2026 and slowly out.',
      'The moon keeps watch, so you may rest.',
      'Touch the water \u2014 it will answer gently.'
    ],
    music: {
      chords: [[48, 55, 64, 71, 74], [41, 48, 57, 64, 72], [45, 52, 60, 67, 71], [43, 50, 60, 65, 67], [38, 45, 53, 62, 69], [41, 48, 57, 64, 71], [48, 55, 62, 67, 74]],
      bells: [72, 74, 76, 79, 81, 84],
      cutoff: 850
    }
  },
  {
    id: 'dawn', label: 'Petal Dawn', orb: [250, 190, 150],
    sky: [[36, 20, 52], [96, 52, 86], [198, 112, 108], [250, 196, 148]],
    hills: [[70, 38, 66], [104, 58, 80]],
    water: [[120, 70, 90], [40, 24, 48]], waterW: 0,
    stars: .18, starTint: [255, 235, 220],
    moon: 0, sun: 1,
    moonCol: [246, 240, 214], sunCol: [255, 220, 170],
    moonPos: [.74, .24], sunPos: [.3, .56],
    clouds: 8, cloudA: .05, warmA: .16,
    fireflies: reduced ? 6 : 12,
    petals: reduced ? 18 : 42,
    aurora: 0,
    motes: reduced ? 8 : 18, moteCol: [255, 224, 180],
    shootRate: 0,
    fog: 0, fogCol: [255, 205, 165],
    rain: 0, rippleRate: 1,
    hillStyle: 'rolling', hillAmp: 1,
    whisper: [
      'The light arrives without hurry.',
      'Every petal knows how to let go.',
      'You are exactly where you need to be.',
      'Softness is a kind of strength.'
    ],
    music: {
      chords: [[41, 48, 57, 64, 69], [36, 43, 52, 60, 67], [43, 50, 59, 64, 71], [41, 48, 55, 60, 64], [46, 53, 60, 65, 69], [38, 45, 53, 60, 65]],
      bells: [65, 67, 69, 72, 74, 77, 79, 84],
      cutoff: 950
    }
  },
  {
    id: 'aurora', label: 'Aurora Bay', orb: [120, 235, 200],
    sky: [[3, 7, 18], [7, 15, 38], [10, 30, 58], [16, 48, 80]],
    hills: [[6, 12, 26], [10, 18, 36]],
    water: [[8, 20, 44], [3, 7, 18]], waterW: 1,
    stars: 1.7, starTint: [212, 255, 240],
    moon: .4, sun: 0,
    moonCol: [230, 245, 255], sunCol: [255, 214, 160],
    moonPos: [.2, .18], sunPos: [.3, .6],
    clouds: 4, cloudA: .05, warmA: 0,
    fireflies: 0,
    petals: 0,
    aurora: 1,
    motes: reduced ? 8 : 16, moteCol: [140, 255, 220],
    shootRate: .012,
    fog: 0, fogCol: [190, 230, 220],
    rain: 0, rippleRate: 1,
    hillStyle: 'rolling', hillAmp: 1,
    whisper: [
      'The sky is dreaming in colour.',
      'Distance is only light, taking its time.',
      'Wish quietly \u2014 the stars are listening.',
      'Rest now, traveller. You are far from the noise.'
    ],
    music: {
      chords: [[45, 52, 60, 64, 71], [41, 48, 57, 64, 69], [48, 55, 64, 67, 74], [40, 47, 55, 62, 67], [38, 45, 53, 62, 69], [43, 50, 55, 62, 69]],
      bells: [69, 72, 74, 76, 79, 81, 84],
      cutoff: 800
    }
  },
  {
    id: 'dunes', label: 'Dusk Dunes', orb: [255, 170, 120],
    sky: [[38, 16, 44], [120, 44, 72], [214, 96, 84], [252, 168, 110]],
    hills: [[86, 40, 62], [132, 66, 76]],
    water: [[120, 70, 90], [40, 24, 48]], waterW: 0,
    stars: .3, starTint: [255, 235, 215],
    moon: 0, sun: 1,
    moonCol: [246, 240, 214], sunCol: [255, 216, 150],
    moonPos: [.74, .24], sunPos: [.5, .5],
    clouds: 6, cloudA: .04, warmA: .18,
    fireflies: 0,
    petals: 0,
    aurora: 0,
    motes: reduced ? 8 : 14, moteCol: [255, 210, 160],
    shootRate: 0,
    fog: .4, fogCol: [255, 205, 165],
    rain: 0, rippleRate: 1,
    hillStyle: 'rolling', hillAmp: 2.2,
    whisper: [
      'The sand remembers every gentle wind.',
      'Vastness is not emptiness \u2014 it is room to breathe.',
      'The sun sinks slowly; nothing here is urgent.',
      'Warmth lingers in every grain.'
    ],
    music: {
      chords: [[41, 48, 57, 64, 71], [36, 43, 52, 59, 67], [46, 53, 60, 65, 72], [41, 48, 55, 60, 64], [38, 45, 53, 62, 69], [48, 55, 58, 64, 67]],
      bells: [65, 67, 69, 72, 74, 77, 79],
      cutoff: 900
    }
  },
  {
    id: 'forest', label: 'Forest Rain', orb: [140, 190, 175],
    sky: [[8, 12, 18], [16, 24, 32], [26, 40, 48], [42, 64, 68]],
    hills: [[10, 18, 24], [6, 12, 16]],
    water: [[10, 20, 26], [4, 8, 12]], waterW: 1,
    stars: 0, starTint: [210, 230, 225],
    moon: 0, sun: 0,
    moonCol: [246, 240, 214], sunCol: [255, 214, 160],
    moonPos: [.74, .24], sunPos: [.3, .6],
    clouds: 9, cloudA: .12, warmA: 0,
    fireflies: 0,
    petals: 0,
    aurora: 0,
    motes: 8, moteCol: [160, 205, 190],
    shootRate: 0,
    fog: .6, fogCol: [185, 205, 205],
    rain: reduced ? 30 : 56, rippleRate: 5,
    hillStyle: 'rolling', hillAmp: 1.15,
    whisper: [
      'Rain is the sky letting go.',
      'Every drop finds the sea, in no hurry at all.',
      'Listen \u2014 the forest is washing the day away.',
      'Grey skies soften everything they touch.'
    ],
    music: {
      chords: [[45, 52, 60, 64, 71], [41, 48, 57, 60, 69], [43, 50, 59, 64, 67], [38, 45, 55, 62, 67], [40, 47, 55, 62, 67], [48, 55, 62, 64, 71]],
      bells: [69, 72, 74, 76, 79, 81],
      cutoff: 700,
      rain: true
    }
  },
  {
    id: 'peaks', label: 'Misty Peaks', orb: [170, 190, 225],
    sky: [[10, 14, 26], [22, 32, 54], [46, 64, 96], [100, 120, 152]],
    hills: [[54, 68, 100], [18, 26, 46]],
    water: [[18, 30, 56], [6, 10, 20]], waterW: 1,
    stars: .8, starTint: [225, 232, 250],
    moon: .5, sun: 0,
    moonCol: [235, 240, 250], sunCol: [255, 214, 160],
    moonPos: [.24, .2], sunPos: [.3, .6],
    clouds: 5, cloudA: .1, warmA: 0,
    fireflies: 0,
    petals: 0,
    aurora: 0,
    motes: reduced ? 6 : 10, moteCol: [195, 215, 245],
    shootRate: .003,
    fog: 1, fogCol: [205, 218, 238],
    rain: 0, rippleRate: 1,
    hillStyle: 'peaks', hillAmp: 1,
    whisper: [
      'The mountains have all the time in the world.',
      'Mist is the mountain\u2019s slow breath.',
      'Let your thoughts settle, like snow on high peaks.',
      'Silence here is full, not empty.'
    ],
    music: {
      chords: [[45, 52, 60, 64, 71], [41, 48, 57, 64, 69], [48, 55, 62, 67, 74], [43, 50, 59, 64, 67], [40, 47, 55, 62, 67], [38, 45, 53, 62, 69]],
      bells: [69, 72, 76, 79, 81, 84],
      cutoff: 750
    }
  }
];

/* ————— blending between scenes ————— */

let targetIdx = 0;          // scene we are in / moving toward
let base = SCENES[0];       // fully-blended snapshot from when a transition began
let blendT = 1;             // 1 = settled
let view = null;            // blended values used by the renderer this frame

const SKIP = ['music', 'whisper', 'label', 'id'];

function blendVal(a, b, t) {
  if (typeof a === 'number' && typeof b === 'number') return lerp(a, b, t);
  if (Array.isArray(a) && Array.isArray(b)) {
    if (typeof a[0] === 'number' && typeof b[0] === 'number' && !Array.isArray(a[0])) {
      return a.map((v, i) => lerp(v, b[i], t));
    }
    return a.map((v, i) => blendVal(v, b[i], t));
  }
  return b;
}

function computeView(t) {
  const out = {};
  for (const k in SCENES[targetIdx]) {
    if (SKIP.includes(k)) continue;
    out[k] = blendVal(base[k], SCENES[targetIdx][k], t);
  }
  return out;
}

/* ————— canvas setup ————— */

const canvas = document.getElementById('scene');
const ctx = canvas.getContext('2d');
let W = 0, H = 0;
const WL = () => H * 0.66;   // waterline

function resize() {
  const DPR = Math.min(2, window.devicePixelRatio || 1);
  W = window.innerWidth; H = window.innerHeight;
  canvas.width = W * DPR; canvas.height = H * DPR;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
window.addEventListener('resize', resize);
resize();

/* ————— parallax ————— */

let mx = 0, my = 0, sx = 0, sy = 0;
window.addEventListener('pointermove', e => {
  mx = (e.clientX / W - .5) * 2;
  my = (e.clientY / H - .5) * 2;
});

/* ————— static elements ————— */

const stars = [];
for (let i = 0; i < 340; i++) {
  stars.push({
    x: Math.random(), y: Math.random() * 0.64,
    r: i < 24 ? rand(.9, 1.7) : rand(.4, 1.2),
    ph: rand(0, TAU), sp: rand(.3, 1.2)
  });
}

const clouds = [];
for (let i = 0; i < 10; i++) {
  clouds.push({ x: Math.random(), y: rand(.06, .42), s: rand(.7, 1.9), sp: rand(.004, .011), d: rand(.4, 1) });
}

function makeCloudSprite(warm) {
  const c = document.createElement('canvas');
  c.width = 360; c.height = 140;
  const g = c.getContext('2d');
  const col = warm ? [255, 214, 206] : [255, 255, 255];
  for (let i = 0; i < 11; i++) {
    const bx = rand(64, 296), by = rand(58, 88), br = rand(22, 46);
    const grd = g.createRadialGradient(bx, by, 0, bx, by, br);
    grd.addColorStop(0, css(col, .5));
    grd.addColorStop(1, css(col, 0));
    g.fillStyle = grd;
    g.beginPath(); g.arc(bx, by, br, 0, TAU); g.fill();
  }
  return c;
}
const cloudSprites = [makeCloudSprite(false), makeCloudSprite(true)];

/* jagged mountain ridges (stable across frames via a seeded generator) */
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const ridgeRng = mulberry32(20260202);
function makeRidge(n, jag) {
  const pts = [];
  let y = .55;
  for (let i = 0; i <= n; i++) {
    pts.push({ fx: i / n, fy: y });
    y = clamp(y + (ridgeRng() - .5) * jag, .12, .95);
  }
  return pts;
}
const ridges = [makeRidge(12, .78), makeRidge(9, .6)];

/* ————— particle pools ————— */

const flies = Array.from({ length: 40 }, () => ({
  on: false, fi: 0, bx: 0, by: 0,
  ax: rand(20, 70), ay: rand(10, 40), sp: rand(.1, .35),
  ph: rand(0, TAU), pu: rand(.5, 1.4), r: rand(1, 2.2)
}));

const PETAL_COLS = [[255, 196, 208], [247, 160, 182], [255, 222, 228]];
const petals = Array.from({ length: 60 }, () => ({
  on: false, fi: 0, x: 0, y: 0, vy: 0, sw: 0, sp: 0,
  ph2: 0, rot: 0, vr: 0, size: 0, col: null
}));

const motes = Array.from({ length: 36 }, () => ({
  on: false, fi: 0, x: 0, y: 0, vy: 0, sp: 0, ph: 0, r: 0, ax: 0
}));

const fogs = Array.from({ length: 6 }, () => ({
  on: false, fi: 0, x: Math.random(), y: 0, sp: 0, w: 0, h: 0, a: 0, ph: 0
}));

const rain = Array.from({ length: 90 }, () => ({
  on: false, fi: 0, x: 0, y: 0, sp: 0, drift: 0, len: 0, a: 0
}));

const ripples = [];
const shoots = [];
const bursts = [];
let rippleTimer = 2;

function poolActivate(pool, count, resetFn) {
  for (let i = 0; i < pool.length; i++) {
    const p = pool[i];
    if (i < count) {
      if (!p.on) { p.on = true; resetFn(p); p.fi = 0.001; }
      p.fi = Math.min(1, p.fi + dtG / 1.5);
    } else if (p.fi > 0) {
      p.fi = Math.max(0, p.fi - dtG / 1.2);
      p.on = p.fi > 0;
    } else {
      p.on = false;
    }
  }
}

/* ————— drawing ————— */

let t = 0, dtG = 0;

function drawSky(v) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  const st = [0, .36, .6, .78];
  v.sky.forEach((c, i) => g.addColorStop(st[i], css(c)));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function drawStars(v) {
  const w = clamp(v.stars, 0, 1.7);
  if (w <= .01) return;
  const base = Math.floor(210 * Math.min(w, 1));
  const extra = Math.round(130 * clamp(w - 1, 0, .7) / .7);
  const limit = Math.min(stars.length, base + extra);
  for (let i = 0; i < limit; i++) {
    const s = stars[i];
    const a = (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph))) * Math.min(w, 1);
    const x = s.x * W + sx * 6, y = s.y * H + sy * 4;
    if (x < 0 || x > W) continue;
    ctx.fillStyle = css(v.starTint, a * .9);
    ctx.beginPath(); ctx.arc(x, y, s.r, 0, TAU); ctx.fill();
  }
}

function drawAurora(w) {
  if (w <= .01) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 3; i++) {
    const hue = 150 + Math.sin(t * .05 + i * 2.1) * 35 + i * 18;
    const grad = ctx.createLinearGradient(0, H * .1, 0, H * .52);
    grad.addColorStop(0, `hsla(${hue},80%,70%,0)`);
    grad.addColorStop(.45, `hsla(${hue},80%,68%,${(.16 - i * .03) * w})`);
    grad.addColorStop(1, `hsla(${hue},80%,60%,0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    const baseY = H * (.16 + i * .075);
    ctx.moveTo(-20, baseY + Math.sin(-.08 + t * .14 + i * 3) * H * .045);
    for (let x = 0; x <= W + 20; x += 14) {
      const y = baseY
        + Math.sin(x * .0042 + t * .14 + i * 2.6) * H * .045
        + Math.sin(x * .0011 - t * .07 + i) * H * .06;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W + 20, -60); ctx.lineTo(-20, -60);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

function drawMoon(v) {
  const w = v.moon;
  if (w <= .01) return;
  const x = v.moonPos[0] * W + sx * 4, y = v.moonPos[1] * H + sy * 3;
  const r = Math.min(W, H) * .055;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const halo = ctx.createRadialGradient(x, y, r * .6, x, y, r * 7);
  halo.addColorStop(0, css(v.moonCol, .3 * w));
  halo.addColorStop(1, css(v.moonCol, 0));
  ctx.fillStyle = halo;
  ctx.beginPath(); ctx.arc(x, y, r * 7, 0, TAU); ctx.fill();
  ctx.restore();

  const body = ctx.createRadialGradient(x - r * .3, y - r * .3, r * .2, x, y, r);
  body.addColorStop(0, '#fffdf4');
  body.addColorStop(.7, css(v.moonCol));
  body.addColorStop(1, css(mix(v.moonCol, [120, 120, 110], .35)));
  ctx.save();
  ctx.globalAlpha = Math.min(1, w * 2);
  ctx.fillStyle = body;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
  ctx.fillStyle = 'rgba(125,128,120,.16)';
  [[.32, -.12, .2], [-.28, .28, .16], [.05, .38, .12], [-.15, -.32, .13]].forEach(([ox, oy, cr]) => {
    ctx.beginPath(); ctx.arc(x + ox * r, y + oy * r, cr * r, 0, TAU); ctx.fill();
  });
  ctx.restore();
}

function drawSun(v) {
  const w = v.sun;
  if (w <= .01) return;
  const x = v.sunPos[0] * W + sx * 4, y = v.sunPos[1] * H + sy * 3;
  const r = Math.min(W, H) * .075;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const halo = ctx.createRadialGradient(x, y, 0, x, y, r * 9);
  halo.addColorStop(0, css(v.sunCol, .5 * w));
  halo.addColorStop(.4, css(v.sunCol, .18 * w));
  halo.addColorStop(1, css(v.sunCol, 0));
  ctx.fillStyle = halo;
  ctx.beginPath(); ctx.arc(x, y, r * 9, 0, TAU); ctx.fill();
  ctx.restore();

  const body = ctx.createRadialGradient(x, y, 0, x, y, r);
  body.addColorStop(0, '#fff8ea');
  body.addColorStop(1, css(v.sunCol, .9));
  ctx.save();
  ctx.globalAlpha = w;
  ctx.fillStyle = body;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.restore();
}

function drawClouds(v) {
  const aC = v.cloudA, aW = v.warmA;
  if (aC <= .005 && aW <= .005) return;
  for (const c of clouds) {
    const p = (c.x + t * c.sp) % 1.3;
    const x = p * (W + 420) - 420 + sx * 12 * c.d;
    const y = c.y * H + sy * 6;
    const sw = 360 * c.s, sh = 140 * c.s;
    if (aC > .005) { ctx.globalAlpha = aC; ctx.drawImage(cloudSprites[0], x, y, sw, sh); }
    if (aW > .005) { ctx.globalAlpha = aW; ctx.drawImage(cloudSprites[1], x, y, sw, sh); }
  }
  ctx.globalAlpha = 1;
}

function drawHillLayer(v, style, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  for (let L = 0; L < 2; L++) {
    ctx.save();
    ctx.translate(sx * (8 + L * 8), 0);
    const baseY = L === 0 ? H * .605 : H * .65;
    ctx.beginPath();
    ctx.moveTo(-80, H + 2);
    if (style === 'peaks') {
      const amp = L === 0 ? H * .15 : H * .19;
      for (const p of ridges[L]) ctx.lineTo(-80 + p.fx * (W + 160), baseY - p.fy * amp);
    } else {
      const amp = v.hillAmp;
      for (let x = -80; x <= W + 80; x += 10) {
        const y = baseY
          + Math.sin(x / W * TAU * (1.6 + L * 1.2) + L * 4.2) * H * .03 * amp
          + Math.sin(x / W * TAU * (4.1 + L * 2.2) + L * 9.1) * H * .013 * amp
          + Math.sin(x / W * TAU * (9.7 + L * 3.3) + L) * H * .005 * amp;
        ctx.lineTo(x, y);
      }
    }
    ctx.lineTo(W + 80, H + 2);
    ctx.closePath();
    ctx.fillStyle = css(v.hills[L]);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function drawHills(v) {
  const tStyle = v.hillStyle, bStyle = base.hillStyle;
  if (blendT < 1 && bStyle !== tStyle) {
    const k = blendT * blendT * (3 - 2 * blendT);
    drawHillLayer(v, bStyle, 1 - k);
    drawHillLayer(v, tStyle, k);
  } else {
    drawHillLayer(v, tStyle, 1);
  }
}

function reflect(col, fx, lumW, w) {
  if (lumW <= .02) return;
  const wl = WL();
  const x = fx * W + sx * 4;
  const len = (H - wl) * .55;
  for (let y = wl + 4; y < wl + len; y += 5) {
    const k = (y - wl) / len;
    const wob = Math.sin(y * .33 + t * 1.6) * (6 + k * 26);
    const ww = Math.min(W, H) * .05 * (1 - k * .75) *
      (0.55 + 0.45 * Math.sin(y * .21 + t * 1.1 + Math.sin(y * .043) * 6.28));
    const a = .1 * (1 - k) * lumW * w;
    if (a <= .004 || ww <= 1) continue;
    ctx.fillStyle = css(col, a);
    ctx.fillRect(x + wob - ww / 2, y, ww, 2);
  }
}

function drawRipples(w) {
  for (let i = ripples.length - 1; i >= 0; i--) {
    const r = ripples[i];
    r.r += r.vr * dtG;
    r.a -= dtG * (r.click ? .25 : .12);
    if (r.a <= 0 || r.r > W * .5) { ripples.splice(i, 1); continue; }
    ctx.strokeStyle = css([220, 235, 255], r.a * w);
    ctx.lineWidth = r.click ? 1.5 : 1;
    ctx.beginPath();
    ctx.ellipse(r.x, r.y, r.r, r.r * .3, 0, 0, TAU);
    ctx.stroke();
  }
}

function drawWater(v) {
  const w = v.waterW;
  if (w <= .01) return;
  const wl = WL();
  const g = ctx.createLinearGradient(0, wl, 0, H);
  g.addColorStop(0, css(v.water[0]));
  g.addColorStop(1, css(v.water[1]));
  ctx.fillStyle = g;
  ctx.fillRect(0, wl, W, H - wl);

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = css(mix(v.sky[3], [255, 255, 255], .25), .12 * w);
  ctx.fillRect(0, wl, W, 1.5);
  reflect(v.moonCol, v.moonPos[0], v.moon, w);
  reflect(v.sunCol, v.sunPos[0], v.sun, w);
  drawRipples(w);
  ctx.restore();
}

function drawFlies(v) {
  const count = Math.round(v.fireflies);
  poolActivate(flies, count, p => { p.bx = Math.random(); p.by = rand(.42, .92); p.ph = rand(0, TAU); });
  for (const f of flies) {
    if (!f.on) continue;
    const x = f.bx * W + Math.sin(t * f.sp + f.ph) * f.ax + sx * 14;
    const y = f.by * H + Math.sin(t * f.sp * .83 + f.ph * 1.7) * f.ay;
    const a = (.2 + .8 * Math.pow(.5 + .5 * Math.sin(t * f.pu + f.ph), 2)) * f.fi;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = css([255, 236, 170], a * .16);
    ctx.beginPath(); ctx.arc(x, y, f.r * 4.5, 0, TAU); ctx.fill();
    ctx.fillStyle = css([255, 246, 200], a);
    ctx.beginPath(); ctx.arc(x, y, f.r, 0, TAU); ctx.fill();
    ctx.restore();
  }
}

function drawPetals(v) {
  const count = Math.round(v.petals);
  poolActivate(petals, count, p => {
    p.x = Math.random(); p.y = rand(-.1, 1);
    p.vy = rand(.018, .042); p.sw = rand(18, 55); p.sp = rand(.4, 1.2);
    p.ph2 = rand(0, TAU); p.rot = rand(0, TAU); p.vr = rand(-.8, .8);
    p.size = rand(3.2, 6.5);
    p.col = PETAL_COLS[(Math.random() * PETAL_COLS.length) | 0];
  });
  for (const p of petals) {
    if (!p.on) continue;
    p.y += p.vy * dtG;
    p.ph2 += dtG * p.sp;
    p.rot += p.vr * dtG;
    if (p.y > 1.06) { p.y = -.06; p.x = Math.random(); }
    const x = p.x * W + Math.sin(p.ph2) * p.sw + sx * 10;
    const y = p.y * H;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(p.rot + Math.sin(p.ph2) * .4);
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size, p.size * .5, 0, 0, TAU);
    ctx.fillStyle = css(p.col, .75 * p.fi);
    ctx.fill();
    ctx.strokeStyle = css([255, 255, 255], .25 * p.fi);
    ctx.lineWidth = .6;
    ctx.beginPath();
    ctx.moveTo(-p.size, 0);
    ctx.quadraticCurveTo(0, -p.size * .2, p.size, 0);
    ctx.stroke();
    ctx.restore();
  }
}

function drawMotes(v) {
  const count = Math.round(v.motes);
  poolActivate(motes, count, p => {
    p.x = Math.random(); p.y = Math.random();
    p.vy = rand(.006, .018); p.sp = rand(.2, .7);
    p.ph = rand(0, TAU); p.r = rand(.7, 1.7); p.ax = rand(8, 26);
  });
  for (const p of motes) {
    if (!p.on) continue;
    p.y -= p.vy * dtG;
    if (p.y < -.05) { p.y = 1.05; p.x = Math.random(); }
    const x = p.x * W + Math.sin(t * p.sp + p.ph) * p.ax + sx * 8;
    const y = p.y * H;
    const a = (.08 + .12 * (.5 + .5 * Math.sin(t * p.sp * 2 + p.ph))) * p.fi;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = css(v.moteCol, a * .5);
    ctx.beginPath(); ctx.arc(x, y, p.r * 3, 0, TAU); ctx.fill();
    ctx.fillStyle = css(v.moteCol, a);
    ctx.beginPath(); ctx.arc(x, y, p.r, 0, TAU); ctx.fill();
    ctx.restore();
  }
}

function drawFogs(v) {
  const count = Math.round(v.fog);
  poolActivate(fogs, count, f => {
    f.y = rand(.5, .78);
    f.sp = rand(.006, .016) * (Math.random() < .5 ? -1 : 1);
    f.w = rand(.45, .85);
    f.h = rand(.07, .13);
    f.a = rand(.06, .11);
    f.ph = rand(0, TAU);
  });
  for (const f of fogs) {
    if (!f.on) continue;
    const px = ((((f.x + t * f.sp) % 1.4) + 1.4) % 1.4 - .2) * W;
    const R = f.w * W * .5;
    if (px < -R || px > W + R) continue;
    ctx.save();
    ctx.translate(px + sx * 6, f.y * H);
    ctx.scale(1, (f.h * H) / R);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
    const a = f.a * f.fi * (.75 + .25 * Math.sin(t * .13 + f.ph));
    g.addColorStop(0, css(v.fogCol, a));
    g.addColorStop(1, css(v.fogCol, 0));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill();
    ctx.restore();
  }
}

function drawRain(v) {
  const count = Math.round(v.rain);
  poolActivate(rain, count, p => {
    p.x = Math.random(); p.y = Math.random() * 1.1 - .05;
    p.sp = rand(.5, .8); p.drift = rand(.03, .07);
    p.len = rand(.018, .04); p.a = rand(.12, .28);
  });
  for (const p of rain) {
    if (!p.on) continue;
    p.y += p.sp * dtG; p.x += p.drift * dtG;
    if (p.y > 1.06) { p.y = -.06; p.x = Math.random() * .95; }
    const x1 = p.x * W + sx * 4, y1 = p.y * H;
    const x2 = x1 - p.len * H * .18, y2 = y1 + p.len * H;
    ctx.strokeStyle = css([195, 218, 232], p.a * p.fi);
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  }
}

function drawShoots() {
  for (let i = shoots.length - 1; i >= 0; i--) {
    const s = shoots[i];
    s.x += s.vx * dtG; s.y += s.vy * dtG; s.life += dtG;
    const k = 1 - s.life / s.max;
    if (k <= 0 || s.x < -60 || s.y > H) { shoots.splice(i, 1); continue; }
    const x2 = s.x - s.vx * .13, y2 = s.y - s.vy * .13;
    const lg = ctx.createLinearGradient(s.x, s.y, x2, y2);
    lg.addColorStop(0, css([255, 255, 255], .85 * k));
    lg.addColorStop(1, css([255, 255, 255], 0));
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = lg;
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.fillStyle = css([255, 255, 255], .9 * k);
    ctx.beginPath(); ctx.arc(s.x, s.y, 1.4, 0, TAU); ctx.fill();
    ctx.restore();
  }
}

function drawBursts(v) {
  for (let i = bursts.length - 1; i >= 0; i--) {
    const b = bursts[i];
    b.age += dtG;
    if (b.age > 1.4) { bursts.splice(i, 1); continue; }
    const rr = b.age * 55 + 6;
    const a = (1 - b.age / 1.4) * .3;
    const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, rr);
    g.addColorStop(0, css(v.moteCol, a));
    g.addColorStop(1, css(v.moteCol, 0));
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(b.x, b.y, rr, 0, TAU); ctx.fill();
    ctx.restore();
  }
}

/* ————— the music: generated, never played from a file ————— */

const music = {
  ctx: null, started: false, muted: false,
  master: null, comp: null, padBus: null, conv: null,
  lastChordIdx: -1, pendingFirst: true, chordsPlayed: 0,
  chordTimer: null, bellTimer: null, phraseTimer: null,

  f(n) { return 440 * Math.pow(2, (n - 69) / 12); },

  ensure() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    const c = this.ctx = new AC();

    this.master = c.createGain();
    this.master.gain.value = 0;
    this.comp = c.createDynamicsCompressor();
    this.comp.threshold.value = -24;
    this.comp.knee.value = 18;
    this.comp.ratio.value = 4;
    this.comp.attack.value = .02;
    this.comp.release.value = .5;
    this.comp.connect(this.master);
    this.master.connect(c.destination);

    const conv = c.createConvolver();
    conv.buffer = this.makeIR(2.8, 2.6);
    const wet = c.createGain();
    wet.gain.value = .55;
    conv.connect(wet);
    wet.connect(this.comp);
    this.conv = conv;

    this.padBus = c.createGain();
    const padSend = c.createGain();
    padSend.gain.value = .3;
    this.padBus.connect(this.comp);
    this.padBus.connect(padSend);
    padSend.connect(conv);

    this.breeze();

    // soft rain layer (silent until a scene asks for it)
    const rlen = c.sampleRate * 2;
    const rbuf = c.createBuffer(1, rlen, c.sampleRate);
    const rd = rbuf.getChannelData(0);
    for (let i = 0; i < rlen; i++) rd[i] = Math.random() * 2 - 1;
    const rsrc = c.createBufferSource();
    rsrc.buffer = rbuf; rsrc.loop = true;
    const rhp = c.createBiquadFilter(); rhp.type = 'highpass'; rhp.frequency.value = 500;
    const rlp = c.createBiquadFilter(); rlp.type = 'lowpass'; rlp.frequency.value = 2800;
    this.rainGain = c.createGain();
    this.rainGain.gain.value = 0;
    rsrc.connect(rhp); rhp.connect(rlp); rlp.connect(this.rainGain);
    this.rainGain.connect(this.comp);
    const rsend = c.createGain(); rsend.gain.value = .25;
    this.rainGain.connect(rsend); rsend.connect(this.conv);
    rsrc.start();

    // distant water layer (quiet until a watery scene asks for it)
    const wlen = c.sampleRate * 3;
    const wbuf = c.createBuffer(1, wlen, c.sampleRate);
    const wd = wbuf.getChannelData(0);
    let wv = 0;
    for (let i = 0; i < wlen; i++) {
      wv += (Math.random() * 2 - 1) * .12;
      wv *= .97;
      wd[i] = wv * 2.4;
    }
    const wsrc = c.createBufferSource();
    wsrc.buffer = wbuf; wsrc.loop = true;
    const wbp = c.createBiquadFilter();
    wbp.type = 'bandpass'; wbp.frequency.value = 650; wbp.Q.value = .8;
    this.waterGain = c.createGain();
    this.waterGain.gain.value = 0;
    wsrc.connect(wbp); wbp.connect(this.waterGain);
    this.waterGain.connect(this.comp);
    const wsend = c.createGain(); wsend.gain.value = .3;
    this.waterGain.connect(wsend); wsend.connect(this.conv);
    const wlfo = c.createOscillator(); wlfo.frequency.value = .07;
    const wlg = c.createGain(); wlg.gain.value = 220;
    wlfo.connect(wlg); wlg.connect(wbp.frequency);
    wsrc.start(); wlfo.start();
  },

  makeIR(sec, decay) {
    const rate = this.ctx.sampleRate;
    const len = rate * sec;
    const buf = this.ctx.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
    }
    return buf;
  },

  breeze() {
    const c = this.ctx;
    const len = c.sampleRate * 3;
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    let v = 0;
    for (let i = 0; i < len; i++) {
      v += (Math.random() * 2 - 1) * .04;
      v *= .98;
      d[i] = v * 3;
    }
    const src = c.createBufferSource();
    src.buffer = buf; src.loop = true;
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 240;
    const g = c.createGain();
    g.gain.value = .02;
    const lfo = c.createOscillator();
    lfo.frequency.value = .05;
    const lg = c.createGain();
    lg.gain.value = .011;
    lfo.connect(lg); lg.connect(g.gain);
    src.connect(lp); lp.connect(g); g.connect(this.comp);
    const send = c.createGain();
    send.gain.value = .4;
    g.connect(send); send.connect(this.conv);
    src.start(); lfo.start();
  },

  chord(notes, cutoff) {
    const c = this.ctx;
    const t0 = c.currentTime + .1;
    const D = 15;

    const flt = c.createBiquadFilter();
    flt.type = 'lowpass'; flt.frequency.value = cutoff; flt.Q.value = .4;
    const env = c.createGain();
    env.gain.value = 1;
    flt.connect(env); env.connect(this.padBus);

    const flfo = c.createOscillator();
    flfo.frequency.value = .045;
    const flg = c.createGain();
    flg.gain.value = cutoff * .35;
    flfo.connect(flg); flg.connect(flt.frequency);
    flfo.start(t0); flfo.stop(t0 + D + 7);

    notes.forEach((n, i) => {
      const g = c.createGain();
      const peak = i === 0 ? .034 : .026;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(peak, t0 + 7);
      g.gain.setValueAtTime(peak, t0 + 11);
      g.gain.linearRampToValueAtTime(.0001, t0 + D + 6);
      g.connect(flt);
      [-2, 2].forEach(det => {
        const o = c.createOscillator();
        o.type = 'sine';
        o.frequency.value = this.f(n);
        o.detune.value = det;
        o.connect(g);
        o.start(t0); o.stop(t0 + D + 6.5);
      });
      if (i >= 2) {
        const o2 = c.createOscillator();
        o2.type = 'sine';
        o2.frequency.value = this.f(n) * 2;
        const g2 = c.createGain();
        g2.gain.setValueAtTime(0, t0);
        g2.gain.linearRampToValueAtTime(.012, t0 + 8);
        g2.gain.linearRampToValueAtTime(.0001, t0 + D + 5);
        o2.connect(g2); g2.connect(flt);
        o2.start(t0); o2.stop(t0 + D + 5.5);
      }
    });

    const sub = c.createOscillator();
    sub.type = 'sine';
    sub.frequency.value = this.f(notes[0] - 12);
    const sg = c.createGain();
    sg.gain.setValueAtTime(0, t0);
    sg.gain.linearRampToValueAtTime(.05, t0 + 8);
    sg.gain.linearRampToValueAtTime(.0001, t0 + D + 5);
    sub.connect(sg); sg.connect(this.padBus);
    sub.start(t0); sub.stop(t0 + D + 5.5);
  },

  bell(n, vol = .35, when = 0) {
    if (!this.ctx) return;
    const c = this.ctx;
    const t0 = c.currentTime + when;

    const g = c.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + .02);
    g.gain.exponentialRampToValueAtTime(.0001, t0 + 5);
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.value = this.f(n);
    o.connect(g);
    o.start(t0); o.stop(t0 + 5.2);

    const g2 = c.createGain();
    g2.gain.setValueAtTime(0, t0);
    g2.gain.linearRampToValueAtTime(vol * .28, t0 + .015);
    g2.gain.exponentialRampToValueAtTime(.0001, t0 + 1.6);
    const o2 = c.createOscillator();
    o2.type = 'sine';
    o2.frequency.value = this.f(n) * 2.756;
    o2.connect(g2);
    o2.start(t0); o2.stop(t0 + 1.8);

    const dry = c.createGain();
    dry.gain.value = .4;
    g.connect(dry); g2.connect(dry);
    dry.connect(this.comp);
    const send = c.createGain();
    send.gain.value = .9;
    g.connect(send); g2.connect(send);
    send.connect(this.conv);
  },

  start() {
    if (this.started) return;
    this.started = true;
    this.ensure();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    this.master.gain.setValueAtTime(0, this.ctx.currentTime);
    this.master.gain.linearRampToValueAtTime(this.muted ? 0 : .8, this.ctx.currentTime + 5);
    this.setScene(targetIdx);

    // endless chord wanderer: starts at the scene's home chord, then
    // drifts through its pool, never repeating itself
    this.pendingFirst = true;
    const playNext = () => {
      const m = SCENES[targetIdx].music;
      let notes;
      if (this.pendingFirst) {
        notes = m.chords[0];
        this.lastChordIdx = 0;
        this.pendingFirst = false;
      } else {
        let i;
        do { i = (Math.random() * m.chords.length) | 0; } while (m.chords.length > 1 && i === this.lastChordIdx);
        this.lastChordIdx = i;
        notes = m.chords[i];
      }
      this.chordsPlayed++;
      this.chord(notes, m.cutoff);
    };
    playNext();
    this.chordTimer = setInterval(playNext, 15000);

    const bellLoop = () => {
      this.bellTimer = setTimeout(() => {
        if (!this.muted && !document.hidden) {
          const bl = SCENES[targetIdx].music.bells;
          this.bell(bl[(Math.random() * bl.length) | 0], rand(.15, .32));
          if (Math.random() < .35) {
            this.bell(bl[(Math.random() * bl.length) | 0], rand(.1, .22), rand(.25, .6));
          }
        }
        bellLoop();
      }, rand(8000, 15000));
    };
    bellLoop();

    // occasional gentle bell phrases, like a far-off music box
    const phraseLoop = () => {
      this.phraseTimer = setTimeout(() => {
        if (!this.muted && !document.hidden) this.playPhrase();
        phraseLoop();
      }, rand(26000, 46000));
    };
    phraseLoop();
  },

  setMuted(m) {
    this.muted = m;
    if (!this.ctx) return;
    const g = this.master.gain;
    const now = this.ctx.currentTime;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    if (m) {
      g.linearRampToValueAtTime(0, now + 1.2);
      setTimeout(() => {
        if (this.muted && this.ctx.state === 'running') this.ctx.suspend();
      }, 1400);
    } else {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      g.linearRampToValueAtTime(.8, now + 2.5);
    }
  },

  playPhrase() {
    const bl = SCENES[targetIdx].music.bells;
    const n = 3 + ((Math.random() * 3) | 0);
    let i = (Math.random() * bl.length) | 0;
    let dir = Math.random() < .5 ? 1 : -1;
    let when = rand(.2, .8);
    for (let k = 0; k < n; k++) {
      this.bell(bl[i], rand(.09, .18), when);
      when += rand(.7, 1.4);
      i = clamp(i + dir * (1 + ((Math.random() * 1.7) | 0)), 0, bl.length - 1);
      if (i === 0 || i === bl.length - 1) dir = -dir;
    }
  },

  setScene(i) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.rainGain) {
      const g = this.rainGain.gain;
      g.cancelScheduledValues(now);
      g.setValueAtTime(g.value, now);
      g.linearRampToValueAtTime(SCENES[i].music.rain ? .016 : 0, now + 2.5);
    }
    if (this.waterGain) {
      const g = this.waterGain.gain;
      g.cancelScheduledValues(now);
      g.setValueAtTime(g.value, now);
      g.linearRampToValueAtTime(SCENES[i].waterW > .5 ? .012 : 0, now + 3);
    }
    this.pendingFirst = true;
  },

  chime() {
    if (!this.ctx || this.muted) return;
    const bl = SCENES[targetIdx].music.bells;
    const i = (bl.length / 2) | 0;
    this.bell(bl[i], .3);
    this.bell(bl[i + 1] || bl[0], .24, .4);
  }
};

document.addEventListener('visibilitychange', () => {
  if (!music.ctx || !music.started) return;
  if (document.hidden) {
    if (!music.muted && music.ctx.state === 'running') music.ctx.suspend();
  } else if (!music.muted && music.ctx.state === 'suspended') {
    music.ctx.resume();
  }
});

/* ————— interface ————— */

const intro = document.getElementById('intro');
const hint = document.getElementById('sound-hint');
const whisperEl = document.getElementById('whisper');
const sceneLabel = document.getElementById('scene-label');
const picker = document.getElementById('scene-picker');
const muteBtn = document.getElementById('mute');

SCENES.forEach((s, i) => {
  const b = document.createElement('button');
  b.className = 'orb-btn' + (i === 0 ? ' active' : '');
  b.setAttribute('aria-label', s.label);
  b.title = s.label;
  const dot = document.createElement('span');
  dot.className = 'dot';
  dot.style.background = css(s.orb);
  dot.style.boxShadow = `0 0 12px 2px ${css(s.orb, .55)}`;
  const tip = document.createElement('span');
  tip.className = 'tip';
  tip.textContent = s.label;
  b.append(dot, tip);
  b.addEventListener('click', () => switchScene(i));
  picker.append(b);
});

let experienceStarted = false;
function startExperience() {
  if (experienceStarted) return;
  experienceStarted = true;
  music.start();
  hint.classList.remove('shown');
}

let revealed = false;
function reveal() {
  if (revealed) return;
  revealed = true;
  if (intro) intro.remove();
  document.querySelectorAll('.ui-fade').forEach(el => el.classList.add('shown'));
  whisperTimer = setTimeout(whisperLoop, 3500);
}
if (intro) {
  intro.addEventListener('animationend', e => {
    if (e.animationName === 'introFade') reveal();
  });
  setTimeout(reveal, 10000); // safety net
}

/* whispers */
let whisperTimer = null;
let whisperIdx = -1;
function whisperLoop() {
  clearTimeout(whisperTimer);
  const lines = SCENES[targetIdx].whisper;
  whisperIdx = (whisperIdx + 1) % lines.length;
  whisperEl.textContent = lines[whisperIdx];
  whisperEl.classList.add('show');
  whisperTimer = setTimeout(() => {
    whisperEl.classList.remove('show');
    whisperTimer = setTimeout(whisperLoop, 11000);
  }, 7000);
}
function restartWhisper() {
  clearTimeout(whisperTimer);
  whisperEl.classList.remove('show');
  whisperTimer = setTimeout(whisperLoop, 3000);
}

/* scene switching */
function switchScene(i) {
  if (i === targetIdx) return;
  if (!experienceStarted) startExperience();
  base = view || base;
  targetIdx = i;
  blendT = 0;

  [...picker.children].forEach((el, j) => el.classList.toggle('active', j === i));

  sceneLabel.classList.add('swap');
  setTimeout(() => {
    sceneLabel.textContent = SCENES[i].label;
    sceneLabel.classList.remove('swap');
  }, 1100);

  restartWhisper();
  music.setScene(i);
  music.chime();
}

/* sound toggle */
muteBtn.addEventListener('click', () => {
  if (!music.started) startExperience();
  music.setMuted(!music.muted);
  muteBtn.classList.toggle('muted', music.muted);
});

/* ————— guided breathing ————— */

const breatheEl = document.getElementById('breathe');
const breathOrb = document.getElementById('breath-orb');
const breathPhaseEl = document.getElementById('breath-phase');
const breathMetaEl = document.getElementById('breath-meta');
const breathBtn = document.getElementById('breath-btn');

const BREATH_PHASES = [
  { label: 'breathe in',  dur: 4, scale: 1 },
  { label: 'hold',        dur: 4, scale: 1 },
  { label: 'breathe out', dur: 6, scale: .55 }
];

let breathing = false;
let breathTimer = null;
let breathsTaken = 0;
let breathIdx = BREATH_PHASES.length - 1;

function breathStep() {
  if (!breathing) return;
  breathIdx = (breathIdx + 1) % BREATH_PHASES.length;
  const ph = BREATH_PHASES[breathIdx];
  if (breathIdx === 0) {
    breathsTaken++;
    breathMetaEl.textContent = breathsTaken === 1 ? 'one breath' : `${breathsTaken} breaths`;
  }
  breathPhaseEl.style.opacity = 0;
  setTimeout(() => { breathPhaseEl.textContent = ph.label; breathPhaseEl.style.opacity = 1; }, 500);
  breathOrb.style.transition = `transform ${ph.dur}s cubic-bezier(.45,.05,.35,.95)`;
  breathOrb.style.transform = `scale(${ph.scale})`;
  if (music.ctx && !music.muted) {
    if (breathIdx === 0) music.bell(76, .12);
    if (breathIdx === 2) music.bell(69, .1);
  }
  breathTimer = setTimeout(breathStep, ph.dur * 1000);
}

function startBreathing() {
  if (breathing) return;
  breathing = true;
  if (!experienceStarted) startExperience();
  breatheEl.classList.add('active');
  breatheEl.setAttribute('aria-hidden', 'false');
  whisperEl.classList.remove('show');
  clearTimeout(whisperTimer);
  breathsTaken = 0;
  breathIdx = BREATH_PHASES.length - 1;
  breathMetaEl.textContent = 'follow the light';
  breathTimer = setTimeout(breathStep, 700);
}

function stopBreathing() {
  if (!breathing) return;
  breathing = false;
  clearTimeout(breathTimer);
  breatheEl.classList.remove('active');
  breatheEl.setAttribute('aria-hidden', 'true');
  breathOrb.style.transition = 'transform 2.5s ease';
  breathOrb.style.transform = 'scale(.55)';
  restartWhisper();
}

breathBtn.addEventListener('click', startBreathing);
document.getElementById('breath-exit').addEventListener('click', stopBreathing);

/* first touch anywhere begins the music; touches also stir the world */
window.addEventListener('pointerdown', e => {
  if (e.target.closest('button') || e.target.closest('#breathe')) return;
  if (!experienceStarted) startExperience();
  const x = e.clientX, y = e.clientY;
  if (view && view.waterW > .5 && y > WL()) {
    ripples.push({ x, y, r: 4, vr: 60, a: .5, click: true });
    if (music.ctx && !music.muted) {
      const bl = SCENES[targetIdx].music.bells;
      music.bell(bl[(Math.random() * bl.length) | 0], .22);
    }
  } else {
    bursts.push({ x, y, age: 0 });
  }
});

window.addEventListener('keydown', e => {
  const key = (e.key || '').toLowerCase();
  if (!experienceStarted && (key === ' ' || key === 'enter')) startExperience();
  if (key === 'm') {
    if (!music.started) startExperience();
    music.setMuted(!music.muted);
    muteBtn.classList.toggle('muted', music.muted);
  }
  if (key === 'b') breathing ? stopBreathing() : startBreathing();
  if (key === 'escape') stopBreathing();
});

/* ————— the loop ————— */

let last = performance.now();

function loop(now) {
  dtG = Math.min(.05, (now - last) / 1000);
  last = now;
  t += dtG;

  if (blendT < 1) blendT = Math.min(1, blendT + dtG / 3.2);
  const k = blendT * blendT * (3 - 2 * blendT);
  view = computeView(k);

  const ease = Math.min(1, dtG * 2);
  sx = lerp(sx, reduced ? 0 : mx, ease);
  sy = lerp(sy, reduced ? 0 : my, ease);

  rippleTimer -= dtG * (view.rippleRate || 1);
  if (rippleTimer <= 0) {
    rippleTimer = rand(3.5, 8);
    if (view.waterW > .5 && ripples.length < 8) {
      ripples.push({
        x: rand(.05, .95) * W,
        y: WL() + rand(8, (H - WL()) * .4),
        r: rand(3, 10), vr: rand(18, 30), a: .2, click: false
      });
    }
  }

  if (!reduced && view.shootRate > 0 && shoots.length < 3 && Math.random() < view.shootRate * dtG * 60) {
    shoots.push({
      x: rand(.15, .95) * W, y: rand(.04, .3) * H,
      vx: -rand(240, 380), vy: rand(70, 130),
      life: 0, max: rand(.7, 1.1)
    });
  }

  drawSky(view);
  drawStars(view);
  drawAurora(view.aurora);
  drawMoon(view);
  drawSun(view);
  drawClouds(view);
  drawHills(view);
  drawWater(view);
  drawFogs(view);
  drawFlies(view);
  drawPetals(view);
  drawMotes(view);
  drawRain(view);
  drawShoots();
  drawBursts(view);

  requestAnimationFrame(loop);
}

view = computeView(1);
requestAnimationFrame(loop);

/* small read-only hook for diagnostics */
window.HikaruSpace = Object.freeze({
  musicStarted: () => music.started,
  muted: () => music.muted,
  audioState: () => (music.ctx ? music.ctx.state : null),
  chordsPlayed: () => music.chordsPlayed,
  scene: () => SCENES[targetIdx].id
});

})();
