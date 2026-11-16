/* ═══════════ BATALHA NAVAL VIVA (imersão) ═══════════
   Nada aqui muda regra nem número: só o que se vê e se ouve.
   - O mar se mexe e acompanha a hora e o clima da Mesa (noite, pôr do sol, tempestade, neblina, neve).
   - Navio ferido solta fumaça; muito ferido pega fogo; afundado borbulha. Os navios balançam e navegam de um ponto ao outro.
   - Cada tiro tem clarão, fumaça, bala, impacto ou respingo, número de dano e som (sintetizado, sem arquivo).
   - Tudo isso aparece para o mestre E para os jogadores, pelos "eventos de efeito" (b.fx) que viajam na cópia publicada.
   - Modo cinema: o mapa ocupa a tela, com a última ação como legenda. */
const bnCena = () => { try { return Relogio.cena(); } catch (e) { return 'h_tarde'; } };
const bnFase = (id, dur) => { let h = 0; for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) % 997; return (((Date.now() / 1000) + h / 7) % dur).toFixed(2); };
const bnSomLigado = () => lembrar('bn-som') !== '0';

/* ───── sons (tudo feito com tom e ruído do próprio site; respeita o botão de som do topo) ───── */
function bnSom(nome, d = 0) {
  if (!bnSomLigado() || !Som.ok()) return;
  const S2 = typeof Som2 !== 'undefined' ? Som2 : null; if (S2 && S2.mudo) return;   // "Silenciar efeitos" da Mesa também vale aqui
  const k = S2 && S2.vol && isFinite(S2.vol.e) ? clamp(S2.vol.e * 1.15, 0, 1) : 0.8;   // segue o volume de efeitos da Mesa
  const T = (f0, f1, dur, tipo, vol, at = 0) => Som.tom(f0, f1, dur, tipo, vol * k, d + at), R = (dur, f, vol, at = 0, q = 1) => Som.ruido(dur, f, vol * k, d + at, q);
  const S = {
    canhao() { R(0.07, 2600, 0.5, 0, 1.4); R(0.55, 110, 1, 0, 0.5); T(120, 30, 0.6, 'sine', 0.55); R(0.9, 320, 0.22, 0.12, 0.4); },
    impacto() { R(0.2, 650, 0.8, 0, 1.3); T(190, 60, 0.22, 'triangle', 0.35); for (let i = 0; i < 4; i++) R(0.04, 2200 + Math.random() * 2400, 0.3, 0.03 + i * 0.045, 3); },
    critico() { R(0.5, 140, 1, 0, 0.5); T(150, 28, 0.8, 'sine', 0.6); R(0.35, 900, 0.7, 0.02, 0.8); for (let i = 0; i < 7; i++) R(0.05, 1800 + Math.random() * 3000, 0.3, 0.05 + i * 0.05, 3); },
    respingo() { R(0.45, 1700, 0.34, 0, 0.7); R(0.5, 520, 0.3, 0.06, 0.6); R(0.7, 3200, 0.1, 0.15, 0.5); },
    arpao() { T(760, 170, 0.28, 'sawtooth', 0.12); for (let i = 0; i < 6; i++) R(0.03, 3600 + Math.random() * 2000, 0.25, 0.1 + i * 0.05, 5); },
    corrente() { for (let i = 0; i < 9; i++) R(0.035, 3000 + Math.random() * 2600, 0.3, i * 0.045, 5); T(210, 90, 0.3, 'triangle', 0.25, 0.1); },
    mastro() { R(0.1, 1900, 0.8, 0, 1.2); T(420, 80, 0.55, 'sawtooth', 0.16); R(0.4, 260, 0.7, 0.5, 0.7); T(110, 45, 0.4, 'sine', 0.4, 0.5); },
    colisao() { R(0.9, 260, 1, 0, 0.5); T(95, 28, 0.9, 'sine', 0.6); for (let i = 0; i < 9; i++) R(0.06, 900 + Math.random() * 2800, 0.4, i * 0.07, 2.5); },
    afundou() { T(95, 40, 1.8, 'sawtooth', 0.1); R(1.6, 420, 0.3, 0, 0.4); for (let i = 0; i < 12; i++) T(220 + Math.random() * 260, 520 + Math.random() * 300, 0.09, 'sine', 0.12, 0.3 + i * 0.14 + Math.random() * 0.05); },
    sino() { [0, 0.34].forEach(at => { T(1180, 0, 1.1, 'sine', 0.17, at); T(2360, 0, 0.6, 'sine', 0.06, at); T(3540, 0, 0.3, 'sine', 0.03, at); }); },
    vez() { T(330, 210, 0.07, 'triangle', 0.16); T(260, 170, 0.09, 'triangle', 0.12, 0.09); },
    evento() { R(1.6, 480, 0.3, 0, 0.4); R(1.2, 160, 0.5, 0.3, 0.5); T(70, 38, 1.2, 'sine', 0.3, 0.3); }
  };
  try { (S[nome] || S.vez)(); } catch (e) { /* sem áudio */ }
}
function bnTreme(d, forte) { setTimeout(() => { const m = $('#bn-mapa'); if (!m) return; m.classList.remove('treme', 'treme2'); void m.getBoundingClientRect(); m.classList.add(forte ? 'treme2' : 'treme'); }, d * 1000); }
const bnFaixa = (txt, cls, d = 0) => { const svg = $('#bn-mapa'), W = svg ? +svg.dataset.w : 600; bnEfeito('txt', W / 2, W * 0.14, { txt, cls: 'faixa ' + (cls || ''), z: 3.4, d, vida: 2300 }); };

/* ───── um evento de efeito vira imagem + som ───── */
function bnTocarFx(ev) {
  const jit = k => (Math.random() - 0.5) * k;
  if (ev.k === 'tiro') {
    const A = { x: ev.ax, y: ev.ay }, T = { x: ev.tx, y: ev.ty }, brg = bnRumo(A, T), r = brg * Math.PI / 180, dd = bnDist(A, T), at = (ev.i || 0) * 0.2, boca = Math.min(10, dd / 3);
    const x0 = A.x + Math.sin(r) * boca, y0 = A.y - Math.cos(r) * boca, fim = at + 0.55, z = Math.max(1, dd / 220);
    bnEfeito('flash', x0, y0, { rot: brg, z: 14, d: at });
    bnEfeito('fumo', x0 + jit(3), y0 + jit(3), { z: 5, d: at + 0.05, vida: 1500 }); bnEfeito('fumo', x0 + jit(6), y0 + jit(6), { z: 3.5, d: at + 0.18, vida: 1500 });
    bnEfeito(ev.proj, x0, y0, { rot: brg, z: ev.proj === 'arpao' ? 20 : 9, d: at, tx: 0, ty: -Math.max(0, dd - boca) });
    bnSom(ev.proj === 'arpao' ? 'arpao' : 'canhao', at);
    if (ev.ok) {
      const hx = T.x + jit(6), hy = T.y + jit(6);
      bnEfeito(ev.hit, hx, hy, { z: ev.crit ? 30 : 20, d: fim, vida: 1100 });
      if (ev.crit) { bnEfeito('explosao', hx + jit(10), hy + jit(10), { z: 18, d: fim + 0.12, vida: 1100 }); bnEfeito('fogo', hx, hy, { z: 16, d: fim + 0.2, vida: 1200 }); }
      bnEfeito('txt', T.x + jit(10), T.y - 10 - (ev.i || 0) * 3, { txt: ev.hit === 'corrente' ? 'CORRENTE!' : ev.dano != null ? (ev.crit ? 'CRÍTICO −' : '−') + ev.dano : 'PRESO!', cls: ev.crit ? 'crit' : 'dano', d: fim + 0.05, vida: 1500, z: ev.crit ? 2.3 : 1.7 });
      bnSom(ev.crit ? 'critico' : ev.hit === 'corrente' ? 'corrente' : 'impacto', fim); bnTreme(fim, ev.crit);
    } else {
      const ang = Math.random() * Math.PI * 2, longe = 18 + Math.random() * 14, sx = T.x + Math.cos(ang) * longe, sy = T.y + Math.sin(ang) * longe;
      bnEfeito('respingo', sx, sy, { z: 18, d: fim, vida: 1100 }); bnEfeito('txt', sx, sy - 9, { txt: 'água!', cls: 'erro', d: fim + 0.05, vida: 1300, z: 1.3 }); bnSom('respingo', fim);
    }
  } else if (ev.k === 'colisao') {
    bnEfeito('explosao', ev.x, ev.y, { z: 34, vida: 1200 }); bnEfeito('respingo', ev.x + jit(16), ev.y + jit(16), { z: 24, d: 0.15, vida: 1200 }); bnEfeito('txt', ev.x, ev.y - 14, { txt: 'COLISÃO!', cls: 'crit', vida: 1600, z: 2.3 });
    bnSom('colisao'); bnTreme(0, true);
  } else if (ev.k === 'afundou') {
    const d = ev.d || 0; for (let i = 0; i < 4; i++) bnEfeito('respingo', ev.x + jit(22), ev.y + jit(22), { z: 16 + i * 2, d: d + i * 0.22, vida: 1200 });
    bnFaixa(`${ev.nome} foi a pique!`, 'ruim', d); bnSom('afundou', d); bnTreme(d, true);
  } else if (ev.k === 'mastro') {
    bnEfeito('txt', ev.x, ev.y - 14, { txt: 'MASTRO!', cls: 'crit', d: ev.d || 0, vida: 1600, z: 2 }); bnSom('mastro', ev.d || 0); bnTreme(ev.d || 0);
  } else if (ev.k === 'golpe') {
    bnEfeito('explosao', ev.x + jit(5), ev.y + jit(5), { z: 20, vida: 1100 }); bnEfeito('txt', ev.x, ev.y - 10, { txt: '−' + ev.dano, cls: 'dano', vida: 1500, z: 1.7 }); bnSom('impacto'); bnTreme(0);
  } else if (ev.k === 'rodada') { bnFaixa('Rodada ' + ev.n); bnSom('sino'); }
  else if (ev.k === 'inicio') { bnFaixa('Às armas!'); bnSom('sino'); }
  else if (ev.k === 'evento') { bnFaixa(ev.nome, 'evento'); bnSom('evento'); }
  else if (ev.k === 'vez') bnSom('vez');
}
/* confere se chegou evento novo. Quem está em outra aba só marca como visto (não toca tudo de uma vez depois). */
function bnFxChegou() {
  const b = souMestre() ? (Store.s || {}).naval : bnDoBanco(); if (!b) return;
  const fx = b.fx || [];
  if (!BN.visto) { BN.visto = new Set(fx.map(e => e.id)); return; }
  const novos = fx.filter(e => !BN.visto.has(e.id)); if (!novos.length) return;
  novos.forEach(e => BN.visto.add(e.id));
  if (App.rota !== 'naval' || (typeof Mesa !== 'undefined' && !Mesa.aberta)) return;
  novos.forEach(bnTocarFx); bnEfxRedesenha();
}
Store.on(() => { if (typeof souMestre === 'function' && Eu.uid && souMestre()) bnFxChegou(); });
Mesa.on(ch => { if (ch === 'naval' && !souMestre()) bnFxChegou(); });

/* ───── o mar, o clima e o estado dos navios ───── */
function bnDefsVivo(g) {
  return `<pattern id="bn-onda2" width="${g}" height="${g / 2}" patternUnits="userSpaceOnUse" patternTransform="scale(1.7) rotate(8)"><path d="M0,${g / 4} q${g / 8},${g / 12} ${g / 4},0 t${g / 4},0 t${g / 4},0 t${g / 4},0" class="bn-onda b"/></pattern>
    <pattern id="bn-chuva" width="${g / 2}" height="${g / 2}" patternUnits="userSpaceOnUse" patternTransform="rotate(18)"><line x1="${g / 8}" y1="0" x2="${g / 8}" y2="${g / 3.6}" class="bn-gota"/><line x1="${g / 2.6}" y1="${g / 4}" x2="${g / 2.6}" y2="${g / 2}" class="bn-gota"/></pattern>
    <pattern id="bn-neve" width="${g}" height="${g}" patternUnits="userSpaceOnUse"><circle cx="${g * 0.2}" cy="${g * 0.3}" r="${g / 40}" class="bn-floco"/><circle cx="${g * 0.7}" cy="${g * 0.75}" r="${g / 55}" class="bn-floco"/><circle cx="${g * 0.55}" cy="${g * 0.15}" r="${g / 70}" class="bn-floco"/></pattern>
    <radialGradient id="bn-nevoa"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <radialGradient id="bn-lanterna"><stop offset="0" stop-color="#ffd27a" stop-opacity=".75"/><stop offset=".45" stop-color="#ffb347" stop-opacity=".28"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/></radialGradient>`;
}
function bnMarSVG(W, H, g) {
  const t = Date.now() / 1000, cam = (cls, id, dur) => `<g class="bn-ondas ${cls}" style="animation-delay:-${(t % dur).toFixed(2)}s"><rect x="${-2 * g}" y="${-2 * g}" width="${W + 4 * g}" height="${H + 4 * g}" fill="url(#${id})"/></g>`;
  const tx = MANIFEST.tex && MANIFEST.tex.oceano ? ASSETS[MANIFEST.tex.oceano.file] : '', T = Math.round(g * 5);   // mar em pixel art: textura que repete e desliza devagar
  const px = tx ? `<defs><pattern id="bn-pxmar" width="${T}" height="${T}" patternUnits="userSpaceOnUse"><image href="${tx}" width="${T}" height="${T}" style="image-rendering:pixelated"/></pattern></defs><g class="bn-pxmar" style="--T:${T}px;animation-delay:-${(t % 60).toFixed(1)}s"><rect x="${-T}" y="${-T}" width="${W + 2 * T}" height="${H + 2 * T}" fill="url(#bn-pxmar)" opacity=".62"/></g>` : '';
  return `<rect class="bn-mar" width="${W}" height="${H}"/>${px}${cam('a', 'bn-onda', 9)}${cam('b', 'bn-onda2', 17)}`;
}
function bnClimaSVG(W, H, g, cena) {
  const t = Date.now() / 1000, full = `x="${-2 * g}" y="${-2 * g}" width="${W + 4 * g}" height="${H + 4 * g}"`, c = cena.replace('h_', '');
  let s = '';
  if (c === 'noite' || c === 'tempestade' || c === 'por_do_sol' || c === 'amanhecer' || c === 'neblina' || c === 'neve') s += `<rect class="bn-luzdia ${c}" width="${W}" height="${H}"/>`;
  if (c === 'tempestade') s += `<g class="bn-chuva" style="animation-delay:-${(t % 0.5).toFixed(2)}s"><rect ${full} fill="url(#bn-chuva)"/></g><rect class="bn-raio" width="${W}" height="${H}" style="animation-delay:-${(t % 11).toFixed(2)}s"/>`;
  if (c === 'neve') s += `<g class="bn-nevando" style="animation-delay:-${(t % 6).toFixed(2)}s"><rect ${full} fill="url(#bn-neve)"/></g>`;
  if (c === 'neblina') s += [0.2, 0.55, 0.85].map((p, i) => `<ellipse class="bn-nevoa" cx="${W * p}" cy="${H * (0.3 + 0.22 * i)}" rx="${W * 0.34}" ry="${H * 0.26}" fill="url(#bn-nevoa)" style="animation-delay:-${((t + i * 9) % 26).toFixed(2)}s"/>`).join('');
  return `<g class="bn-clima" pointer-events="none">${s}</g>`;
}
/* fumaça, fogo, bolhas e lanterna: ficam fora do giro do navio, para a fumaça subir sempre para o mesmo lado */
function bnNavioVivo(n, L) {
  const frac = n.pvMax ? n.pv / n.pvMax : 1, cena = bnCena().replace('h_', ''), r = L * 0.11;
  let s = '';
  if ((cena === 'noite' || cena === 'tempestade') && n.pv > 0) s += `<circle class="bn-luz" r="${(L * 0.95).toFixed(1)}" fill="url(#bn-lanterna)"/>`;
  if (n.pv <= 0) { for (let i = 0; i < 5; i++) s += `<circle class="bn-bolha" cx="${((i - 2) * L * 0.13).toFixed(1)}" cy="${((i % 2) * L * 0.12).toFixed(1)}" r="${(r * (0.35 + (i % 3) * 0.15)).toFixed(1)}" style="animation-delay:-${bnFase(n.id + i, 2.6)}s"/>`; return s; }
  if (frac <= 0.5) { const q = frac <= 0.25 ? 5 : 3;
    for (let i = 0; i < q; i++) s += `<circle class="bn-fumaca ${frac <= 0.25 ? 'preta' : ''}" cx="${((i % 2 ? 1 : -1) * L * 0.06).toFixed(1)}" cy="${(-L * 0.05).toFixed(1)}" r="${r.toFixed(1)}" style="animation-delay:-${((+bnFase(n.id, 2.6) + i * (2.6 / q)) % 2.6).toFixed(2)}s"/>`; }
  if (frac <= 0.25) { const fogo = bnImg('efx_naval_4'); if (fogo) s += `<image class="bn-fogo" href="${fogo}" x="${(-L * 0.24).toFixed(1)}" y="${(-L * 0.36).toFixed(1)}" width="${(L * 0.48).toFixed(1)}" height="${(L * 0.48).toFixed(1)}" style="animation-delay:-${bnFase(n.id, 0.7)}s"/>`; }
  return s;
}
/* depois de desenhar: os navios navegam da posição antiga até a nova (em vez de pular) */
function bnDepois(raiz) {
  const b = bnVendo(), novo = {}, mapa = b.mapa || 600; if (!BN.visto) BN.visto = new Set((b.fx || []).map(e => e.id));
  const calmo = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  (b.navios || []).forEach(n => {
    novo[n.id] = { x: n.x, y: n.y, dir: n.dir };
    const a = BN.pos && BN.pos[n.id]; if (!a || BN.arrasto || calmo || BN.posMapa !== mapa) return;
    const g = raiz.querySelector(`.bn-navio[data-bn="${n.id}"]`); if (!g || !g.animate) return;
    const dist = Math.hypot(a.x - n.x, a.y - n.y), dd = ((a.dir - n.dir + 540) % 360) - 180;
    if (dist < 0.6 && Math.abs(dd) < 1) return;
    const dur = clamp(550 + dist * 14, 650, 1700);
    try { g.animate([{ transform: `translate(${a.x}px, ${a.y}px)` }, { transform: `translate(${n.x}px, ${n.y}px)` }], { duration: dur, easing: 'ease-in-out' });
      if (Math.abs(dd) >= 1 && g.firstElementChild) g.firstElementChild.animate([{ transform: `rotate(${n.dir + dd}deg)` }, { transform: `rotate(${n.dir}deg)` }], { duration: Math.min(dur, 950), easing: 'ease-in-out' }); } catch (e) { /* navegador sem animação: fica como era */ }
  });
  BN.pos = novo; BN.posMapa = mapa;
}
ACT['bn-som'] = el => { lembrar('bn-som', el.checked ? '1' : '0'); if (el.checked) { Som.gesto = true; bnSom('sino'); } };
ACT['bn-cinema'] = () => {
  BN.cinema = !BN.cinema;
  try { if (BN.cinema && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {}); else if (!BN.cinema && document.fullscreenElement) document.exitFullscreen().catch(() => {}); } catch (e) { /* sem tela cheia: o modo cinema funciona na janela */ }
  App.render();
};
document.addEventListener('keydown', e => { if (e.key === 'Escape' && BN.cinema && App.rota === 'naval' && !Modal.aberto()) { BN.cinema = false; App.render(); } });
document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && BN.cinema) { BN.cinema = false; if (App.rota === 'naval') App.render(); } });
if (window.__expor) Object.assign(window, { BN, bnEfeito, bnEfxRedesenha });
