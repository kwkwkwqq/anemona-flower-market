
function rng(seed) {
  let s = (Math.imul(seed | 0, 2654435761) >>> 0) || 1;
  return function () {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17; s >>>= 0;
    s ^= s << 5;  s >>>= 0;
    return s / 4294967296;
  };
}

function shade(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  const f = v => Math.max(0, Math.min(255, Math.round(a < 0 ? v + v * a : v + (255 - v) * a)));
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
}

const f1 = n => n.toFixed(1);

function flower(x, y, r, c, type, rd) {
  const d = shade(c, -0.16);
  const m = shade(c, -0.07);
  const rot = (rd() * 360) | 0;
  const delay = (rd() * -5).toFixed(2);
  let s = `<g class="fl" style="--fd:${delay}s"><g transform="translate(${f1(x)} ${f1(y)}) rotate(${rot})">`;

  if (type === 'daisy') {
    for (let i = 0; i < 13; i++) {
      s += `<ellipse cx="0" cy="${f1(-r * 0.6)}" rx="${f1(r * 0.16)}" ry="${f1(r * 0.42)}" fill="${c}" stroke="${d}" stroke-width=".5" transform="rotate(${i * (360 / 13)})"/>`;
    }
    s += `<circle r="${f1(r * 0.24)}" fill="#e9b83f"/><circle r="${f1(r * 0.12)}" fill="#c98f1f" opacity=".6"/>`;
  } else if (type === 'rose') {
    for (let i = 0; i < 6; i++) {
      const a = (i * 60 * Math.PI) / 180;
      s += `<circle cx="${f1(Math.cos(a) * r * 0.5)}" cy="${f1(Math.sin(a) * r * 0.5)}" r="${f1(r * 0.5)}" fill="${c}" stroke="${d}" stroke-width=".6"/>`;
    }
    for (let i = 0; i < 5; i++) {
      const a = ((i * 72 + 20) * Math.PI) / 180;
      s += `<circle cx="${f1(Math.cos(a) * r * 0.26)}" cy="${f1(Math.sin(a) * r * 0.26)}" r="${f1(r * 0.34)}" fill="${m}" stroke="${d}" stroke-width=".5"/>`;
    }
    s += `<circle r="${f1(r * 0.2)}" fill="${d}"/><path d="M${f1(-r * 0.12)} 0a${f1(r * 0.12)} ${f1(r * 0.12)} 0 1 1 ${f1(r * 0.2)} ${f1(r * 0.08)}" fill="none" stroke="${shade(c, -0.3)}" stroke-width=".7"/>`;
  } else if (type === 'peony') {
    for (let l = 0; l < 3; l++) {
      const n = 9 - l * 2;
      const rad = r * (1 - l * 0.26);
      for (let i = 0; i < n; i++) {
        s += `<ellipse cx="0" cy="${f1(-rad * 0.52)}" rx="${f1(rad * 0.34)}" ry="${f1(rad * 0.52)}" fill="${shade(c, l * -0.07)}" stroke="${d}" stroke-width=".5" transform="rotate(${f1(i * (360 / n) + l * 18)})"/>`;
      }
    }
    s += `<circle r="${f1(r * 0.12)}" fill="${shade(c, -0.3)}"/>`;
  } else { // small
    for (let i = 0; i < 6; i++) {
      const a = (i * 60 * Math.PI) / 180;
      s += `<circle cx="${f1(Math.cos(a) * r * 0.5)}" cy="${f1(Math.sin(a) * r * 0.5)}" r="${f1(r * 0.32)}" fill="${c}" stroke="${d}" stroke-width=".4"/>`;
    }
    s += `<circle r="${f1(r * 0.28)}" fill="${shade(c, 0.4)}"/>`;
  }
  return s + '</g></g>';
}

const GREENS = ['#7f9a6c', '#6a8658', '#93ab80', '#88a077'];

function bouquetSVG({ palette = 'blush', seed = 1, count = 9, wrap = true } = {}) {
  const P = PALETTES[palette] || PALETTES.blush;
  const rd = rng(seed);
  const cx = 150, cy = 138, baseY = 288;
  const pts = [];

  for (let i = 0; i < count; i++) {
    const ang = i * 2.399963;
    const rad = Math.sqrt((i + 0.5) / count) * 92;
    pts.push({
      x: cx + Math.cos(ang) * rad * 1.1,
      y: cy + Math.sin(ang) * rad * 0.82,
      r: 24 + rd() * 9 - (rad / 92) * 4,
      c: P.colors[Math.floor(rd() * P.colors.length)],
      t: P.types[Math.floor(rd() * P.types.length)]
    });
  }
  pts.sort((a, b) => a.y - b.y);

  let back = '', stems = '', leaves = '', fillers = '', front = '';

  for (let i = 0; i < 9; i++) {
    const a = -Math.PI / 2 + (i / 8 - 0.5) * 2.5;
    const len = 105 + rd() * 35;
    const x = cx + Math.cos(a) * len * 0.95;
    const y = baseY - 20 + Math.sin(a) * len * 1.05;
    const col = GREENS[i % GREENS.length];
    back += `<path d="M150 ${baseY} Q${f1((150 + x) / 2 + (rd() - .5) * 20)} ${f1((baseY + y) / 2)} ${f1(x)} ${f1(y)}" stroke="${col}" stroke-width="2" fill="none"/>`;
    back += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="9" ry="22" fill="${col}" transform="rotate(${f1((a * 180) / Math.PI + 90)} ${f1(x)} ${f1(y)})"/>`;
  }

  pts.forEach((p, i) => {
    const mx = (150 + p.x) / 2 + (rd() - 0.5) * 16;
    const my = (baseY + p.y) / 2;
    stems += `<path d="M150 ${baseY} Q${f1(mx)} ${f1(my)} ${f1(p.x)} ${f1(p.y)}" stroke="#6f8860" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    if (i % 2 === 0) {
      const t = 0.62;
      const lx = (1 - t) * (1 - t) * 150 + 2 * t * (1 - t) * mx + t * t * p.x;
      const ly = (1 - t) * (1 - t) * baseY + 2 * t * (1 - t) * my + t * t * p.y;
      const side = p.x > 150 ? 1 : -1;
      leaves += `<ellipse cx="${f1(lx + side * 11)}" cy="${f1(ly)}" rx="8" ry="18" fill="${GREENS[i % 4]}" transform="rotate(${side * 55} ${f1(lx)} ${f1(ly)})"/>`;
    }
  });

  const fillN = Math.round(count * 0.9);
  for (let i = 0; i < fillN; i++) {
    const ang = rd() * Math.PI * 2;
    const rad = 86 + rd() * 28;
    const x = cx + Math.cos(ang) * rad * 1.08;
    const y = cy + 8 + Math.sin(ang) * rad * 0.72;
    if (y > 236) continue;
    const c = P.colors[Math.floor(rd() * P.colors.length)];
    fillers += `<path d="M150 ${baseY} Q${f1((150 + x) / 2)} ${f1((baseY + y) / 2)} ${f1(x)} ${f1(y)}" stroke="#7f9a6c" stroke-width="1.2" fill="none"/>`;
    fillers += flower(x, y, 8 + rd() * 5, c, 'small', rd);
  }

  pts.forEach(p => { front += flower(p.x, p.y, p.r, p.c, p.t, rd); });

  const paper = wrap
    ? `<path d="M96 246 L204 246 L172 346 L128 346 Z" fill="#eadfca" stroke="#cdbb9c" stroke-width="1"/>
       <path d="M96 246 L150 262 L204 246 L190 292 L150 284 L110 292 Z" fill="#f3eadb" stroke="#cdbb9c" stroke-width=".8"/>
       <path d="M142 280 L158 280 L156 292 L144 292 Z" fill="#c9958f"/>
       <path d="M150 284 q-22 -14 -26 2 q8 10 26 -2 q18 12 26 -2 q-4 -16 -26 2z" fill="#d6a8a2" stroke="#b98079" stroke-width=".7"/>`
    : '';

  return `<svg class="bq" viewBox="0 0 300 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Букет"><g class="sway">${back}${stems}${leaves}${fillers}${front}${paper}</g></svg>`;
}

function lineFlowerSVG(petals = 8, seed = 1) {
  const rd = rng(seed);
  let p = '';
  const flowerAt = (x, y, s, n) => {
    let out = '';
    for (let i = 0; i < n; i++) {
      const a = (i * 360) / n;
      const w = s * 0.34, h = s;
      out += `<path pathLength="1" transform="translate(${x} ${y}) rotate(${a})" d="M0 0 C${-w} ${-h * 0.35} ${-w * 0.7} ${-h} 0 ${-h} C${w * 0.7} ${-h} ${w} ${-h * 0.35} 0 0Z"/>`;
      out += `<path pathLength="1" transform="translate(${x} ${y}) rotate(${a})" d="M0 ${-s * 0.2} L0 ${-s * 0.8}" opacity=".5"/>`;
    }
    out += `<circle pathLength="1" cx="${x}" cy="${y}" r="${s * 0.13}" fill="none"/>`;
    return out;
  };
  p += `<path pathLength="1" d="M120 360 C122 280 110 220 100 160"/>`;
  p += `<path pathLength="1" d="M118 300 C90 290 70 270 62 246 C92 250 112 270 118 300"/>`;
  p += `<path pathLength="1" d="M112 232 C140 224 160 206 168 184 C138 186 118 206 112 232"/>`;
  p += flowerAt(100, 140, 62, petals);
  p += flowerAt(176, 250, 34, 7);
  p += `<path pathLength="1" d="M176 330 C176 300 176 280 176 262"/>`;
  void rd;
  return `<svg class="line-svg" viewBox="0 0 260 380" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${p}</svg>`;
}

function stripSVG(seed = 3) {
  const rd = rng(seed);
  const bg = ['#f2d6d2', '#fff', '#f4c35a', '#e9a8b0', '#c9a7e6', '#fbf1e6'];
  let s = `<svg viewBox="0 0 1400 260" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"><rect width="1400" height="260" fill="#3e4636"/>`;
  for (let i = 0; i < 34; i++) {
    const x = rd() * 1400, y = 20 + rd() * 220;
    s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(14 + rd() * 20)}" ry="${f1(8 + rd() * 14)}" fill="#59664a" opacity=".6" transform="rotate(${(rd() * 180) | 0} ${f1(x)} ${f1(y)})"/>`;
  }
  const types = ['peony', 'daisy', 'rose', 'small'];
  for (let i = 0; i < 22; i++) {
    s += flower(30 + i * 64 + rd() * 20, 30 + rd() * 200, 28 + rd() * 26, bg[Math.floor(rd() * bg.length)], types[Math.floor(rd() * 4)], rd);
  }
  return s + '</svg>';
}
