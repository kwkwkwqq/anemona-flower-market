(() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fmt = n => n.toLocaleString('ru-RU') + ' ₽';
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } }
  };

  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('is-show'), 2400);
  }

  $$('[data-art="bouquet"]').forEach(el => {
    el.innerHTML = bouquetSVG({
      palette: el.dataset.palette,
      seed: +el.dataset.seed || 1,
      count: +el.dataset.count || 9
    });
  });

  $$('[data-line]').forEach((el, i) => {
    el.innerHTML = lineFlowerSVG(+el.dataset.line, i + 4);
  });

  const stripRow = $('#stripRow');
  if (stripRow) stripRow.innerHTML = stripSVG(3) + stripSVG(3);

  const header = $('#header');
  const onScroll = () => header.classList.toggle('is-scrolled', scrollY > 30);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const burger = $('#burger');
  const mobileMenu = $('#mobileMenu');
  function toggleMenu(force) {
    const open = force ?? !mobileMenu.classList.contains('is-open');
    mobileMenu.classList.toggle('is-open', open);
    burger.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', () => toggleMenu());
  $$('a', mobileMenu).forEach(a => a.addEventListener('click', () => toggleMenu(false)));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
      if (e.target.matches('.stats')) runCounters(e.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
  $$('[data-reveal], .line-svg, .stats').forEach(el => io.observe(el));

  function runCounters(root) {
    $$('[data-count]', root).forEach(el => {
      const target = +el.dataset.count;
      if (reduceMotion) { el.textContent = target.toLocaleString('ru-RU'); return; }
      const t0 = performance.now(), dur = 1800;
      const tick = now => {
        const p = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString('ru-RU');
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  (function petals() {
    const cv = $('#petals');
    if (!cv || reduceMotion) return;
    const ctx = cv.getContext('2d');
    const cols = ['#f3c9c9', '#ffffff', '#f0d9c8', '#e7b8bd', '#fbeee6', '#d9c3e6'];
    let W = 0, H = 0, list = [], run = true;

    function resize() {
      const r = cv.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    const make = init => ({
      x: Math.random() * W,
      y: init ? Math.random() * H : -20,
      s: 5 + Math.random() * 9,
      vy: 0.35 + Math.random() * 0.75,
      vx: (Math.random() - 0.3) * 0.35,
      rot: Math.random() * 6.28,
      vr: (Math.random() - 0.5) * 0.025,
      ph: Math.random() * 6.28,
      c: cols[Math.floor(Math.random() * cols.length)],
      a: 0.55 + Math.random() * 0.4
    });
    function init() {
      resize();
      const n = Math.round(Math.min(46, Math.max(18, W / 32)));
      list = Array.from({ length: n }, () => make(true));
    }
    function frame() {
      if (run) {
        ctx.clearRect(0, 0, W, H);
        for (const p of list) {
          p.y += p.vy;
          p.ph += 0.018;
          p.x += Math.sin(p.ph) * 0.7 + p.vx;
          p.rot += p.vr;
          if (p.y > H + 20 || p.x > W + 30 || p.x < -30) Object.assign(p, make(false));
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.scale(1, 0.55 + Math.abs(Math.sin(p.ph)) * 0.45);
          ctx.globalAlpha = p.a;
          ctx.fillStyle = p.c;
          const s = p.s;
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.bezierCurveTo(s * 0.9, -s * 0.6, s * 0.7, s * 0.7, 0, s);
          ctx.bezierCurveTo(-s * 0.7, s * 0.7, -s * 0.9, -s * 0.6, 0, -s);
          ctx.fill();
          ctx.restore();
        }
      }
      requestAnimationFrame(frame);
    }
    init();
    addEventListener('resize', init);
    new IntersectionObserver(([e]) => { run = e.isIntersecting; }).observe(cv);
    requestAnimationFrame(frame);
  })();

  (function parallax() {
    if (reduceMotion) return;
    const hero = $('.hero');
    const l = $('.hero__bq--l'), r = $('.hero__bq--r');
    if (!hero) return;
    hero.addEventListener('mousemove', e => {
      const x = (e.clientX / innerWidth - 0.5) * 2;
      const y = (e.clientY / innerHeight - 0.5) * 2;
      l.style.translate = `${x * -14}px ${y * -8}px`;
      r.style.translate = `${x * -14}px ${y * -8}px`;
    });
    addEventListener('scroll', () => {
      const y = Math.min(scrollY, innerHeight);
      l.style.marginBottom = `${-y * 0.12}px`;
      r.style.marginBottom = `${-y * 0.12}px`;
    }, { passive: true });
  })();

  let cart = store.get('anemona-cart', []);
  const drawer = $('#drawer'), overlay = $('#overlay');
  const cartBody = $('#cartBody'), cartFoot = $('#cartFoot');

  function saveCart() { store.set('anemona-cart', cart); }
  const cartTotal = () => cart.reduce((s, i) => s + i.price * i.qty, 0);

  function openCart() {
    renderCart();
    drawer.classList.add('is-open');
    overlay.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    drawer.classList.remove('is-open');
    overlay.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  $('#cartOpen').addEventListener('click', openCart);
  $$('[data-open-cart]').forEach(b => b.addEventListener('click', () => { toggleMenu(false); openCart(); }));
  $('#cartClose').addEventListener('click', closeCart);
  overlay.addEventListener('click', closeCart);
  addEventListener('keydown', e => { if (e.key === 'Escape') { closeCart(); toggleMenu(false); } });

  function addToCart(item) {
    const ex = cart.find(i => i.id === item.id);
    if (ex) ex.qty++; else cart.push({ ...item, qty: 1 });
    saveCart();
    updateBadge(true);
    toast('Добавлено в корзину ✿');
  }

  function updateBadge(bump) {
    const n = cart.reduce((s, i) => s + i.qty, 0);
    const el = $('#cartCount');
    el.textContent = n;
    if (bump && !reduceMotion) {
      el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.6)' }, { transform: 'scale(1)' }], { duration: 400 });
    }
  }

  function renderCart() {
    if (!cart.length) {
      cartBody.innerHTML = '<div class="empty">Здесь пока тихо.<br>Выберите что-нибудь нежное ✿</div>';
      cartFoot.classList.add('is-hidden');
      return;
    }
    cartFoot.classList.remove('is-hidden');
    cartBody.innerHTML = cart.map(i => `
      <div class="ci" data-id="${i.id}">
        <div class="ci__art">${bouquetSVG({ palette: i.palette, seed: i.seed, count: Math.min(i.count, 9), wrap: true })}</div>
        <div>
          <div class="ci__name">${i.name}</div>
          <div class="ci__price">${fmt(i.price)}${i.note ? ' · ' + i.note : ''}</div>
          <div class="qty">
            <button data-act="dec" aria-label="Меньше">−</button>
            <span>${i.qty}</span>
            <button data-act="inc" aria-label="Больше">+</button>
          </div>
        </div>
        <button class="ci__rm" data-act="rm" aria-label="Удалить">×</button>
      </div>`).join('');
    const delivery = cartTotal() >= SHOP.freeFrom ? 0 : SHOP.delivery;
    $('#cartTotal').textContent = fmt(cartTotal() + delivery);
    $('.drawer__total span').textContent = delivery ? `Итого (с доставкой ${fmt(delivery)})` : 'Итого (доставка бесплатно)';
  }

  cartBody.addEventListener('click', e => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const row = btn.closest('.ci');
    const id = row.dataset.id;
    const item = cart.find(i => String(i.id) === id);
    if (!item) return;
    const act = btn.dataset.act;
    if (act === 'inc') item.qty++;
    if (act === 'dec') item.qty = Math.max(0, item.qty - 1);
    if (act === 'rm') item.qty = 0;
    cart = cart.filter(i => i.qty > 0);
    saveCart(); updateBadge(); renderCart();
  });

  $('#orderForm').addEventListener('submit', e => {
    e.preventDefault();
    const form = e.target;
    let ok = true;
    $$('.field', form).forEach(f => {
      const bad = !f.value.trim() || (f.name === 'phone' && f.value.replace(/\D/g, '').length < 10);
      f.classList.toggle('is-error', bad);
      if (bad) ok = false;
    });
    if (!ok) { toast('Заполните все поля'); return; }
    cart = []; saveCart(); updateBadge();
    cartFoot.classList.add('is-hidden');
    cartBody.innerHTML = `<div class="success"><span class="script">спасибо!</span><b>Заказ принят</b><p>Это демо-версия — реальный заказ не отправлен, но мы очень старались ✿</p></div>`;
    form.reset();
  });
  $$('.field', $('#orderForm')).forEach(f => f.addEventListener('input', () => f.classList.remove('is-error')));

  const grid = $('#grid'), filters = $('#filters');
  let activeCat = 'all';

  filters.innerHTML = CATEGORIES.map(c =>
    `<button class="filter${c.id === 'all' ? ' is-active' : ''}" role="tab" data-cat="${c.id}">${c.name}</button>`).join('');

  function renderGrid() {
    const list = PRODUCTS.filter(p => activeCat === 'all' || p.cat === activeCat);
    grid.innerHTML = list.map((p, i) => `
      <article class="card" style="--i:${i}">
        <div class="card__arch">
          ${p.tag ? `<span class="card__tag">${p.tag}</span>` : ''}
          <div class="card__art">${bouquetSVG({ palette: p.palette, seed: p.seed, count: p.count })}</div>
        </div>
        <h3 class="card__title">${p.name}</h3>
        <p class="card__desc">${p.desc}</p>
        <div class="card__row"><span class="card__price">${fmt(p.price)}</span></div>
        <button class="pill pill--rose" data-add="${p.id}">[купить букет]</button>
      </article>`).join('');
  }
  filters.addEventListener('click', e => {
    const b = e.target.closest('.filter');
    if (!b) return;
    activeCat = b.dataset.cat;
    $$('.filter', filters).forEach(x => x.classList.toggle('is-active', x === b));
    renderGrid();
  });
  grid.addEventListener('click', e => {
    const b = e.target.closest('[data-add]');
    if (!b) return;
    const p = PRODUCTS.find(x => x.id === +b.dataset.add);
    addToCart({ id: p.id, name: p.name, price: p.price, palette: p.palette, seed: p.seed, count: p.count });
  });
  renderGrid();

  const state = { occasion: 'love', palette: 'blush', size: 'm', wish: '' };

  $('#occasions').innerHTML = OCCASIONS.map(o =>
    `<button class="chip" data-v="${o.id}">${o.name}</button>`).join('');
  $('#palettes').innerHTML = Object.entries(PALETTES).map(([id, p]) =>
    `<button class="swatch" data-v="${id}" style="--c:${p.sw}"><i></i>${p.name}</button>`).join('');
  $('#sizes').innerHTML = SIZES.map(s =>
    `<button class="chip" data-v="${s.id}">${s.name}<small>${fmt(s.price)}</small></button>`).join('');

  function syncActive() {
    $$('#occasions .chip').forEach(c => c.classList.toggle('is-active', c.dataset.v === state.occasion));
    $$('#palettes .swatch').forEach(c => c.classList.toggle('is-active', c.dataset.v === state.palette));
    $$('#sizes .chip').forEach(c => c.classList.toggle('is-active', c.dataset.v === state.size));
  }

  let seedCounter = 7;
  function customItem() {
    const size = SIZES.find(s => s.id === state.size);
    const occ = OCCASIONS.find(o => o.id === state.occasion);
    const pal = PALETTES[state.palette];
    return {
      id: `custom-${state.palette}-${state.size}-${seedCounter}`,
      name: `Авторский букет «${occ.name}»`,
      price: size.price,
      palette: state.palette,
      seed: seedCounter,
      count: size.count,
      note: state.wish ? `«${state.wish}»` : pal.name.toLowerCase() + ', ' + size.name.toLowerCase(),
      size, occ, pal
    };
  }
  function renderPreview() {
    const it = customItem();
    const art = $('#previewArt');
    art.innerHTML = bouquetSVG({ palette: it.palette, seed: it.seed, count: it.count });
    $('#previewName').textContent = it.name;
    $('#previewDesc').textContent =
      `Палитра: ${it.pal.name.toLowerCase()}. Размер: ${it.size.name.toLowerCase()} (${it.size.hint}). ` +
      `Открытка: «${state.wish || it.occ.note}».`;
    $('#previewPrice').textContent = fmt(it.price);
  }
  function setState(key, val) {
    state[key] = val;
    seedCounter = 7 + Math.abs([...(state.palette + state.size + state.occasion)].reduce((a, c) => a + c.charCodeAt(0), 0)) % 90;
    syncActive();
    renderPreview();
  }
  $('#occasions').addEventListener('click', e => { const b = e.target.closest('.chip'); if (b) setState('occasion', b.dataset.v); });
  $('#palettes').addEventListener('click', e => { const b = e.target.closest('.swatch'); if (b) setState('palette', b.dataset.v); });
  $('#sizes').addEventListener('click', e => { const b = e.target.closest('.chip'); if (b) setState('size', b.dataset.v); });
  $('#wish').addEventListener('input', e => { state.wish = e.target.value.trim(); renderPreview(); });
  $('#previewAdd').addEventListener('click', () => {
    const it = customItem();
    addToCart({ id: it.id, name: it.name, price: it.price, palette: it.palette, seed: it.seed, count: it.count, note: it.note });
  });
  syncActive();
  renderPreview();

  const track = $('#sliderTrack'), dots = $('#sliderDots');
  track.innerHTML = REVIEWS.map(r => `
    <div class="review">
      <div class="review__mark">“</div>
      <p>${r.text}</p>
      <b>${r.name}</b><small>${r.meta}</small>
    </div>`).join('');
  dots.innerHTML = REVIEWS.map((_, i) => `<button aria-label="Отзыв ${i + 1}" data-i="${i}"></button>`).join('');
  let idx = 0, timer;
  function go(i) {
    idx = (i + REVIEWS.length) % REVIEWS.length;
    track.style.transform = `translateX(${-idx * 100}%)`;
    $$('button', dots).forEach((d, k) => d.classList.toggle('is-active', k === idx));
  }
  function auto() { clearInterval(timer); timer = setInterval(() => go(idx + 1), 6500); }
  dots.addEventListener('click', e => { const b = e.target.closest('button'); if (b) { go(+b.dataset.i); auto(); } });
  let sx = 0;
  track.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 40) { go(idx + (dx < 0 ? 1 : -1)); auto(); }
  });
  go(0); auto();

  updateBadge();
})();
