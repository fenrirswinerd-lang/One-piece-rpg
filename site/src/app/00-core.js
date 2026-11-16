/* ═══════════ núcleo: utilidades, estado, desfazer, diário, som, dados, sprites ═══════════ */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 9);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const sg = n => (n < 0 ? '−' + Math.abs(n) : '+' + n);
const fmt = n => (n == null || n === '' || isNaN(n)) ? '—' : Number(n).toLocaleString('pt-BR');
const hora = (t = Date.now()) => new Date(t).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
const num = v => { const n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(',', '.').replace(/[^\d.\-]/g, '')); return isNaN(n) ? null : n; };
/* dentro do Claude (prévia): roda num quadro (iframe) e o Google fica bloqueado */
const IN_CLAUDE = (() => { try { return !!(window.claude && window.claude.use) || /claudeusercontent|claude\.ai/.test(location.host) || window.top !== window; } catch (e) { return true; } })();

/* ───── estado ───── */
const KEY = 'controle-mestre-op-v1';
function estadoInicial() {
  return {
    v: 1, sessao: 1, criado: Date.now(),
    party: [],
    combate: { ativo: false, rodada: 1, vez: 0, lista: [], log: [] },
    encontro: { itens: [], improvisado: true, nivelManual: {} },
    xp: { arco: 'Mary Geoise', metade: false, registros: [], ajustes: {}, arcos: [] },
    viagem: { mar: 'East Blue', navegador: false, bonus: 2, navio: { nome: 'Nosso navio', pv: 100, pvMax: 100, br: 0 }, ultimo: null, clima: null, dias: 0 },
    tesouros: [],
    diario: [],
    dados: [],
    custom: [],
    tela: { cena: 'conves', mostrar: null },
    config: { som: true, tema: 'auto', autoSync: true, casa: [
      'Nível por marco: +1 nível por arco, mini-arco ou grande feito.',
      'XP só de encontro improvisado: enche a Barra de Bônus. Barra cheia = +1 nível extra no próximo marco (no máximo 1 por arco).',
      'Kits de profissão: com 1 kit já dá para usar.',
      'Haki do Rei: só desperta por atitude.'] }
  };
}
const Store = {
  s: null, undo: [], subs: new Set(),
  load() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { s = null; }
    this.s = Object.assign(estadoInicial(), s || {});
    return this.s;
  },
  save(semBanco) {
    if (!semBanco) this.s.salvoEm = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(this.s)); } catch (e) { /* sem armazenamento: segue só na memória */ }
    if (!semBanco && this.aoSalvar) this.aoSalvar();
  },
  /** muda o estado: guarda uma cópia para desfazer, salva, avisa as telas */
  set(fn, diario, opts = {}) {
    if (!opts.semDesfazer) { this.undo.push(JSON.stringify(this.s)); if (this.undo.length > 40) this.undo.shift(); }
    fn(this.s);
    if (diario) Diario.add(diario, opts.tipo);
    this.save(); this.emit();
  },
  desfazer() {
    const prev = this.undo.pop();
    if (!prev) return toast('Nada para desfazer.');
    this.s = JSON.parse(prev); this.save(); this.emit(); toast('Desfeito.');
  },
  emit() { this.subs.forEach(f => f(this.s)); },
  on(f) { this.subs.add(f); }
};
const S = () => Store.s;

/* ───── diário da sessão ───── */
const Diario = {
  add(txt, tipo = 'info') {
    const d = Store.s.diario;
    d.push({ t: Date.now(), txt, tipo, sessao: Store.s.sessao });
    if (d.length > 600) d.splice(0, d.length - 600);
  }
};

/* ───── avisos e janelas ───── */
function toast(msg, opts = {}) {
  const box = $('#toasts'); if (!box) return;
  const el = document.createElement('div');
  el.className = 'toast ' + (opts.tipo || '');
  el.innerHTML = (opts.icone || '') + '<span>' + msg + '</span>';
  box.appendChild(el);
  while (box.children.length > 3) box.firstElementChild.remove();
  setTimeout(() => el.classList.add('sai'), opts.tempo || 3200);
  setTimeout(() => el.remove(), (opts.tempo || 3200) + 400);
  return el;
}
const Modal = {
  abrir(html, opts = {}) {
    this.fechar();
    const w = document.createElement('div');
    w.className = 'modal-fundo'; w.id = 'modal';
    w.innerHTML = `<div class="modal ${opts.classe || ''}" role="dialog" aria-modal="true" aria-label="${esc(opts.titulo || 'Janela')}">
      <button class="x" data-act="modal-fechar" aria-label="Fechar">✕</button>${html}</div>`;
    document.body.appendChild(w);
    w.addEventListener('click', e => { if (e.target === w || e.target.closest('[data-act="modal-fechar"]')) this.fechar(); });
    if (opts.onBind) opts.onBind(w.querySelector('.modal'));
    const f = w.querySelector('[autofocus], input, button:not(.x)'); if (f) f.focus();
    return w.querySelector('.modal');
  },
  fechar() { const m = $('#modal'); if (m) m.remove(); },
  aberto() { return !!$('#modal'); }
};

/* ───── som (sintetizado, sem arquivos) ───── */
const Som = {
  ctx: null,
  gesto: false,   /* o navegador só deixa tocar depois do primeiro clique ou tecla */
  ok() { return this.gesto && Store.s && Store.s.config.som; },
  c() { if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } } if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {}); return this.ctx; },
  tom(f0, f1, dur, tipo = 'sine', vol = 0.18, atraso = 0) {
    const c = this.c(); if (!c) return;
    const t = c.currentTime + atraso, o = c.createOscillator(), g = c.createGain();
    o.type = tipo; o.frequency.setValueAtTime(f0, t); if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.02);
  },
  ruido(dur, freq, vol = 0.25, atraso = 0, q = 1) {
    const c = this.c(); if (!c) return;
    const t = c.currentTime + atraso, n = Math.floor(c.sampleRate * dur), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q; g.gain.value = vol;
    s.buffer = b; s.connect(f).connect(g).connect(c.destination); s.start(t);
  },
  tocar(nome) {
    if (!this.ok()) return;
    const T = {
      dado: () => { for (let i = 0; i < 5; i++) this.ruido(0.05, 2200 + Math.random() * 1800, 0.35, i * 0.07 + Math.random() * 0.03, 3); },
      acerto: () => { this.tom(160, 60, 0.18, 'sine', 0.35); this.ruido(0.08, 900, 0.2); },
      critico: () => { [660, 880, 1320, 1760].forEach((f, i) => this.tom(f, 0, 0.35, 'triangle', 0.14, i * 0.07)); },
      falha: () => { this.tom(320, 110, 0.5, 'sawtooth', 0.08); },
      moeda: () => { this.tom(1320, 0, 0.09, 'square', 0.06); this.tom(1760, 0, 0.25, 'square', 0.06, 0.08); },
      sino: () => { this.tom(880, 0, 1.1, 'sine', 0.16); this.tom(1760, 0, 0.7, 'sine', 0.06); this.tom(2640, 0, 0.4, 'sine', 0.03); },
      canhao: () => { this.ruido(0.6, 120, 0.9, 0, 0.6); this.tom(90, 35, 0.5, 'sine', 0.5); },
      onda: () => { this.ruido(1.4, 500, 0.18, 0, 0.4); },
      cura: () => { [523, 659, 784].forEach((f, i) => this.tom(f, 0, 0.3, 'sine', 0.1, i * 0.06)); },
      nivel: () => { [392, 523, 659, 784, 1046].forEach((f, i) => this.tom(f, 0, 0.3, 'square', 0.05, i * 0.08)); },
      morte: () => { [392, 330, 262, 196].forEach((f, i) => this.tom(f, 0, 0.45, 'triangle', 0.12, i * 0.18)); },
      clique: () => { this.tom(1200, 0, 0.03, 'square', 0.03); }
    };
    try { (T[nome] || T.clique)(); } catch (e) { /* sem áudio */ }
  }
};

/* ───── dados ───── */
const rnd = n => { try { const a = new Uint32Array(1); crypto.getRandomValues(a); return 1 + (a[0] % n); } catch (e) { return 1 + Math.floor(Math.random() * n); } };
/** "2d6+3", "d20", "1d8+2d6+1", "4d12 + 6" → {total, partes:[{q,f,r:[..]}], mod, expr} */
function rolar(expr, opts = {}) {
  const e = String(expr || '').toLowerCase().replace(/\s+/g, '').replace(/−/g, '-');
  const re = /([+-]?)(\d*)d(\d+)|([+-]?)(\d+)/g;
  let m, partes = [], mod = 0;
  while ((m = re.exec(e))) {
    if (m[3]) {
      let q = parseInt(m[2] || '1', 10); const f = parseInt(m[3], 10), s = m[1] === '-' ? -1 : 1;
      if (opts.critico) q *= 2;
      q = clamp(q, 1, 200);
      const r = Array.from({ length: q }, () => rnd(f));
      partes.push({ q, f, r, s });
    } else if (m[5]) mod += (m[4] === '-' ? -1 : 1) * parseInt(m[5], 10);
  }
  const total = partes.reduce((a, p) => a + p.s * p.r.reduce((x, y) => x + y, 0), 0) + mod;
  return { total, partes, mod, expr: e };
}
/** d20 com vantagem/desvantagem: modo 'vant' | 'desv' | '' */
function d20(bonus = 0, modo = '') {
  const a = rnd(20), b = modo ? rnd(20) : null;
  const usado = modo === 'vant' ? Math.max(a, b) : modo === 'desv' ? Math.min(a, b) : a;
  return { rolagens: b == null ? [a] : [a, b], nat: usado, total: usado + bonus, bonus, modo, critico: usado === 20, falha: usado === 1 };
}
const media = expr => { const r = String(expr || '').replace(/\s/g, ''); let t = 0; r.replace(/([+-]?)(\d*)d(\d+)|([+-]?)(\d+)/g, (_, s1, q, f, s2, k) => { if (f) t += (s1 === '-' ? -1 : 1) * (parseInt(q || '1') * (parseInt(f) + 1) / 2); else if (k) t += (s2 === '-' ? -1 : 1) * parseInt(k); }); return Math.floor(t); };

/* ───── sprites (artes em pixel) ─────
   Cada folha de arte entra UMA vez numa folha de estilo (classe), e os ícones só dizem a posição.
   Assim a página não repete a imagem inteira em cada ícone. */
(function folhasCSS() {
  const M = window.MANIFEST || {}, A = window.ASSETS || {}; let css = '';
  Object.entries(M.icons || {}).forEach(([folha, f]) => Object.entries(f.files || {}).forEach(([n, arq]) => { css += `.s-${folha}-${n}{background-image:url(${A[arq]})}\n`; }));
  Object.entries(M.anims || {}).forEach(([nome, a]) => { css += `.a-${nome}{background-image:url(${A[a.file]})}\n`; });
  Object.entries(M.images || {}).forEach(([nome, i]) => { if (/^cena_/.test(i.file)) css += `.c-${nome}{--cena:url(${A[i.file]})}\n`; });
  // texturas, peças de interface e faixas viram variáveis, para o CSS usar sem saber o endereço
  let vars = '';
  Object.entries(M.tex || {}).forEach(([n, i]) => { vars += `--t2-${n}:url(${A[i.file]});`; });
  Object.entries(M.ui || {}).forEach(([n, i]) => {
    vars += `--ui-${n}:url(${A[i.file]});`;
    if (i.fatia) { vars += `--ui-${n}-f:${i.fatia.join(' ')};--ui-${n}-w:${i.fatia.map(v => v + 'px').join(' ')};--ui-${n}-w55:${i.fatia.map(v => Math.max(2, Math.round(v * 0.55)) + 'px').join(' ')};--ui-${n}-f3:0 ${i.fatia[1]} 0 ${i.fatia[3]};--ui-${n}-w3:0 ${i.fatia[1]}px 0 ${i.fatia[3]}px;--ui-${n}-w3h:0 ${Math.max(2, Math.round(i.fatia[1] * 0.55))}px 0 ${Math.max(2, Math.round(i.fatia[3] * 0.55))}px;`; }
  });
  Object.entries(M.tiras || {}).forEach(([n, i]) => { vars += `--tira-${n}:url(${A[i.file]});`; });
  const jp = (M.images || {}).jornal_pagina;
  if (jp && jp.manchete) {
    const m = jp.manchete, f = jp.foto;
    vars += `--jp-ar:${(jp.w / jp.h).toFixed(4)};--jp-mx:${m.x}%;--jp-my:${m.y}%;--jp-mw:${m.w}%;--jp-mh:${m.h}%;`
      + `--jp-fx:${f.x}%;--jp-fy:${f.y}%;--jp-fw:${f.w}%;--jp-fh:${f.h}%;`;
    const co = jp.colunas;
    if (co) {
      vars += `--jp-cy:${co.y}%;--jp-ch:${co.h}%;`;
      co.c.forEach((c, k) => { vars += `--jp-c${k + 1}x:${c.x}%;--jp-c${k + 1}w:${c.w}%;`; });
      vars += `--jp-ctx:${co.c[0].x}%;--jp-ctw:${(co.c[2].x + co.c[2].w - co.c[0].x).toFixed(2)}%;`;
    }
    const pap = (M.images || {}).jornal_papel;
    if (pap) vars += `--jp-papel:url(${A[pap.file]});`;
  }
  const rl = ((M.anims || {}).pergaminho || {}).papel;
  if (rl) vars += `--rl-x:${rl.x}%;--rl-y:${rl.y}%;--rl-w:${rl.w}%;--rl-h:${rl.h}%;`;
  const cz = (M.images || {}).cartaz_base;
  if (cz && cz.janela) {
    const j = cz.janela, n = cz.faixa_nome || { y: 57, h: 6 }, v = cz.faixa_valor || { y: 72, h: 8 };
    vars += `--cz:url(${A[cz.file]});--cz-ar:${(cz.w / cz.h).toFixed(4)};--cz-jx:${j.x}%;--cz-jy:${j.y}%;--cz-jw:${j.w}%;--cz-jh:${j.h}%;`
      + `--cz-ny:${n.y}%;--cz-nh:${n.h}%;--cz-vy:${v.y}%;--cz-vh:${v.h}%;`;
  }
  if (vars) css += `:root{${vars}}\n`;
  const st = document.createElement('style'); st.id = 'folhas'; st.textContent = css; (document.head || document.documentElement).appendChild(st);
})();
function ic(ref, tam = 32, extra = '') {
  // ref = 'folha:nome' (ex.: 'status:vida'); tam = 32 | 64 | 96 | 128
  const [folha, nome] = String(ref).split(':');
  const f = (window.MANIFEST || {}).icons ? MANIFEST.icons[folha] : null;
  if (!f) return '';
  const idx = f.names.indexOf(nome); if (idx < 0) return '';
  const nativo = tam % 64 === 0 && f.files['64'] ? 64 : (f.files['32'] ? 32 : 64);
  const k = tam / nativo, col = idx % f.cols, row = Math.floor(idx / f.cols);
  return `<i class="ico s-${folha}-${nativo} ${extra}" aria-hidden="true" style="width:${tam}px;height:${tam}px;background-size:${f.cols * nativo * k}px ${f.rows * nativo * k}px;background-position:-${col * nativo * k}px -${row * nativo * k}px"></i>`;
}
/* o ícone existe? (para trocar o ícone provisório pelo próprio assim que a folha nova chegar) */
const temIc = ref => { const [folha, nome] = String(ref || '').split(':'); const f = (window.MANIFEST || {}).icons ? MANIFEST.icons[folha] : null; return !!(f && f.names.includes(nome)); };
const icOu = (...refs) => refs.find(temIc) || refs[refs.length - 1];
/* ícone que acompanha o tamanho da caixa (a janela da foto do cartaz muda com a tela): posição e tamanho em %, da folha maior */
function icFit(ref, extra = '') {
  const [folha, nome] = String(ref).split(':');
  const f = (window.MANIFEST || {}).icons ? MANIFEST.icons[folha] : null; if (!f) return '';
  const idx = f.names.indexOf(nome); if (idx < 0) return '';
  const nat = f.files['128'] ? 128 : f.files['64'] ? 64 : 32, col = idx % f.cols, row = Math.floor(idx / f.cols);
  const px = f.cols > 1 ? col / (f.cols - 1) * 100 : 0, py = f.rows > 1 ? row / (f.rows - 1) * 100 : 0;
  return `<i class="ico icf s-${folha}-${nat} ${extra}" aria-hidden="true" style="background-size:${f.cols * 100}% ${f.rows * 100}%;background-position:${+px.toFixed(3)}% ${+py.toFixed(3)}%"></i>`;
}
function anim(nome, esc_ = 2, opts = {}) {
  const a = (window.MANIFEST || {}).anims ? MANIFEST.anims[nome] : null; if (!a) return '';
  const w = a.fw * esc_, h = a.fh * esc_, fim = opts.umaVez ? -(a.frames - 1) * w : -a.frames * w;
  const dur = opts.dur || 0.9;
  const animacao = opts.umaVez ? `sprite ${dur}s steps(${a.frames}, jump-none) ${opts.atraso || 0}s 1 forwards` : `sprite ${dur}s steps(${a.frames}) infinite`;
  return `<i class="anim a-${nome} ${opts.classe || ''}" aria-hidden="true" style="width:${w}px;height:${h}px;background-size:${a.fw * a.frames * esc_}px ${h}px;--fim:${fim}px;animation:${animacao}"></i>`;
}
const img = nome => { const i = (window.MANIFEST || {}).images ? MANIFEST.images[nome] : null; return i ? ASSETS[i.file] : ''; };

['pointerdown', 'keydown'].forEach(t => document.addEventListener(t, () => { Som.gesto = true; }, { capture: true, once: true }));
