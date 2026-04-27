'use strict';

// ── CONFIG ──────────────────────────────────────
const WORLD_CUP_START = new Date('2026-06-11T02:00:00Z');

// ── DOM ─────────────────────────────────────────
const elDays    = document.getElementById('days');
const elHours   = document.getElementById('hours');
const elMinutes = document.getElementById('minutes');
const elSeconds = document.getElementById('seconds');
const elUrgency = document.getElementById('urgency-msg');
const cWrapper  = document.getElementById('countdown-wrapper');
let prev = { d:-1, h:-1, m:-1, s:-1 };

// ── CONTADOR ────────────────────────────────────
function tick() {
  const diff = WORLD_CUP_START - new Date();
  if (diff <= 0) { finished(); return; }

  const tot = Math.floor(diff / 1000);
  const d = Math.floor(tot / 86400);
  const h = Math.floor((tot % 86400) / 3600);
  const m = Math.floor((tot % 3600) / 60);
  const s = tot % 60;

  flip(elDays,    d, prev.d);
  flip(elHours,   h, prev.h);
  flip(elMinutes, m, prev.m);
  flip(elSeconds, s, prev.s);
  prev = { d, h, m, s };

  urgency(d, h);
  cWrapper.classList.toggle('urgent', d === 0);

  // Countdowns en tarjetas de partidos
  updateMatchCountdowns();
}

function flip(el, val, old) {
  el.textContent = String(val).padStart(2, '0');
  if (val !== old) {
    el.classList.remove('flip');
    void el.offsetWidth;
    el.classList.add('flip');
  }
}

function urgency(d, h) {
  if (d === 0 && h < 1)  { elUrgency.textContent = '🔴 ¡HOY EMPIEZA EL MUNDIAL!'; elUrgency.style.color = 'var(--red)'; }
  else if (d === 0)       { elUrgency.textContent = '⚡ ¡ÚLTIMA HORA!'; elUrgency.style.color = 'var(--gold)'; }
  else if (d <= 7)        { elUrgency.textContent = '🔥 ¡ESTA SEMANA!'; elUrgency.style.color = 'var(--gold)'; }
  else if (d <= 30)       { elUrgency.textContent = '⚽ ¡MUY PRONTO!';  elUrgency.style.color = 'var(--gold)'; }
  else                    { elUrgency.textContent = ''; }
}

function finished() {
  [elDays,elHours,elMinutes,elSeconds].forEach(e => e.textContent = '00');
  const l3 = document.querySelector('.line-3');
  if (l3) l3.textContent = '¡HA EMPEZADO!';
  elUrgency.textContent = '🏆 ¡EL MUNDIAL ESTÁ EN MARCHA!';
  launchConfetti();
}

// ── COUNTDOWNS MINI (tarjetas de partidos) ──────
function updateMatchCountdowns() {
  document.querySelectorAll('.match-card-countdown[data-match-date]').forEach(el => {
    const d = new Date(el.dataset.matchDate) - new Date();
    if (d <= 0) { el.textContent = '¡Ya jugado!'; return; }
    const days = Math.floor(d / 86400000);
    const hrs  = Math.floor((d % 86400000) / 3600000);
    if (days > 0) el.textContent = `En ${days}d ${hrs}h`;
    else {
      const mins = Math.floor((d % 3600000) / 60000);
      el.textContent = `En ${hrs}h ${mins}m`;
    }
  });
}

// ── DARK / LIGHT MODE ───────────────────────────
const html      = document.documentElement;
const toggleBtn = document.getElementById('theme-toggle');

function savedTheme() {
  return localStorage.getItem('m26-theme') ||
    (window.matchMedia('(prefers-color-scheme:light)').matches ? 'light' : 'dark');
}

function setTheme(t) {
  html.setAttribute('data-theme', t);
  localStorage.setItem('m26-theme', t);
}

setTheme(savedTheme());

toggleBtn.addEventListener('click', () => {
  setTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  // Actualizar colores de partículas
  particles.forEach(p => p.recolor());
});

// ── NAVBAR ──────────────────────────────────────
const hamburger = document.getElementById('nav-hamburger');
const navLinks  = document.getElementById('nav-links');

hamburger?.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  hamburger.classList.toggle('open');
});

// Scroll activo en links
const navHome  = document.getElementById('nav-home');
const navSpain = document.getElementById('nav-spain');
const spainSec = document.getElementById('spain-matches');

function updateActiveNav() {
  const spainTop = spainSec?.getBoundingClientRect().top ?? Infinity;
  if (spainTop <= 80) {
    navHome?.classList.remove('active');
    navSpain?.classList.add('active');
  } else {
    navHome?.classList.add('active');
    navSpain?.classList.remove('active');
  }
}
window.addEventListener('scroll', updateActiveNav, { passive: true });

// Cerrar menú móvil al hacer clic en link
navLinks?.querySelectorAll('.nav-link').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger?.classList.remove('open');
  });
});

// ── PARTÍCULAS ──────────────────────────────────
const canvas = document.getElementById('particles-canvas');
const ctx    = canvas.getContext('2d');
let particles = [], W, H, raf;

function resizeCanvas() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

const DARK_COLORS  = ['#f5c542','#ffe87a','#1a73e8','#ffffff','#e63946'];
const LIGHT_COLORS = ['#b8820a','#1557c0','#0d0d24','#c0303b'];

class Particle {
  constructor() { this.reset(true); }
  recolor() { this.color = this.pickColor(); }
  pickColor() {
    const arr = html.getAttribute('data-theme') === 'light' ? LIGHT_COLORS : DARK_COLORS;
    return arr[Math.floor(Math.random() * arr.length)];
  }
  reset(init) {
    this.x = Math.random() * W;
    this.y = init ? Math.random() * H : H + 5;
    this.r = Math.random() * 1.4 + .3;
    this.vx = (Math.random() - .5) * .25;
    this.vy = -(Math.random() * .35 + .12);
    this.op = Math.random() * .4 + .1;
    this.life = Math.random() * 200 + 100;
    this.age = 0;
    this.color = this.pickColor();
  }
  update() {
    this.x += this.vx; this.y += this.vy; this.age++;
    if (this.age / this.life > .7) this.op *= .99;
    if (this.y < -8 || this.age >= this.life) this.reset(false);
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.op);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 4; ctx.shadowColor = this.color;
    ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }
}

function initParticles() {
  const n = Math.min(90, Math.floor(W * H / 9500));
  particles = Array.from({length:n}, () => new Particle());
}

function animate() {
  ctx.clearRect(0, 0, W, H);
  for (let i = 0; i < particles.length; i++) {
    for (let j = i+1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.hypot(dx, dy);
      if (dist < 85) {
        ctx.save();
        ctx.globalAlpha = (1 - dist/85) * .04;
        ctx.strokeStyle = '#888'; ctx.lineWidth = .5;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke(); ctx.restore();
      }
    }
    particles[i].update(); particles[i].draw();
  }
  raf = requestAnimationFrame(animate);
}

function launchConfetti() {
  let pieces = Array.from({length:100}, () => ({
    x: Math.random()*W, y:-10-Math.random()*80,
    vy:Math.random()*3+2, vx:(Math.random()-.5)*4,
    size:Math.random()*9+4,
    color:['#f5c542','#e63946','#1a73e8','#22c55e','#fff'][Math.floor(Math.random()*5)],
    rot:Math.random()*360, rs:(Math.random()-.5)*8
  }));
  cancelAnimationFrame(raf);
  function draw() {
    ctx.clearRect(0,0,W,H);
    particles.forEach(p=>{p.update();p.draw();});
    pieces = pieces.filter(c=>c.y<H+20);
    pieces.forEach(c=>{
      c.y+=c.vy; c.x+=c.vx; c.rot+=c.rs;
      ctx.save(); ctx.translate(c.x,c.y); ctx.rotate(c.rot*Math.PI/180);
      ctx.fillStyle=c.color; ctx.fillRect(-c.size/2,-c.size/4,c.size,c.size/2);
      ctx.restore();
    });
    if (pieces.length>0) requestAnimationFrame(draw); else animate();
  }
  draw();
}

// ── PARALLAX ────────────────────────────────────
let ticking = false;
document.addEventListener('mousemove', e => {
  if (ticking) return; ticking = true;
  requestAnimationFrame(() => {
    const cx = (e.clientX/W - .5) * 14;
    const cy = (e.clientY/H - .5) * 7;
    const al = document.querySelector('.ambient-light');
    if (al) al.style.transform = `translate(${cx}px,${cy}px)`;
    ticking = false;
  });
});

// ── INIT ────────────────────────────────────────
window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });

// Ocultar preloader cuando todo esté listo
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.classList.add('hidden');
    setTimeout(() => {
      document.body.classList.remove('is-loading');
    }, 600);
  }
});

function init() {
  resizeCanvas();
  initParticles();
  animate();
  tick();
  setInterval(tick, 1000);
}

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', init)
  : init();
