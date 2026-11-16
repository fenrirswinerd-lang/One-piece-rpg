/* ═══════════ SOM AMBIENTE POR CENA ═══════════
   Sintetizado (sem arquivos): ondas, vento, chuva, grilos, gaivotas e trovão. A cena vem do relógio e do clima da mesa
   (Relogio.cena()). DESLIGADO POR PADRÃO; cada pessoa liga no seu aparelho. Respeita o interruptor geral de som do topo. */
const Ambiente = {
  ctx: null, no: null, cena: null, timers: [], mestre: null,
  /* quanto de cada camada em cada cena */
  MIX: {
    h_tarde: { mar: .5, gaivota: 1 }, h_amanhecer: { mar: .4, gaivota: 1 }, h_por_do_sol: { mar: .45, gaivota: .4 },
    h_noite: { mar: .35, grilo: .5 }, h_tempestade: { chuva: .8, vento: .6, mar: .5, trovao: 1 },
    h_neblina: { mar: .3, vento: .2 }, h_neve: { vento: .5 }, h_calmaria: { mar: .2 }
  },
  ligado() { return lembrar('amb-' + (Eu.uid || 'anon')) === '1'; },
  vol() { const v = parseFloat(lembrar('amb-vol-' + (Eu.uid || 'anon')) ?? '0.4'); return isFinite(v) ? v : 0.4; },
  quer() { return this.ligado() && Som.gesto && Store.s && Store.s.config.som; },
  alternar(v) { lembrar('amb-' + (Eu.uid || 'anon'), v ? '1' : '0'); this.atualizar(); },
  volume(v) { lembrar('amb-vol-' + (Eu.uid || 'anon'), String(v)); this.atualizar(); },
  ruido(c, tipo) {   // 4 s de ruído em laço: branco ou marrom (grave, de onda)
    const n = c.sampleRate * 4, b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0); let u = 0;
    for (let i = 0; i < n; i++) { const w = Math.random() * 2 - 1; if (tipo === 'marrom') { u = (u + 0.02 * w) / 1.02; d[i] = u * 3.5; } else d[i] = w; }
    const s = c.createBufferSource(); s.buffer = b; s.loop = true; return s;
  },
  criar() {
    const c = Som.c(); if (!c) return false;
    this.ctx = c; const mestre = c.createGain(); mestre.gain.value = 0; mestre.connect(c.destination); this.mestre = mestre; this.no = {};
    const camada = (nome, fonte, filtros, lfo) => {
      const g = c.createGain(); g.gain.value = 0; let ult = fonte;
      filtros.forEach(([tipo, f, q]) => { const fl = c.createBiquadFilter(); fl.type = tipo; fl.frequency.value = f; fl.Q.value = q || 0.7; ult.connect(fl); ult = fl; });
      ult.connect(g); g.connect(mestre); fonte.start();
      if (lfo) { const o = c.createOscillator(), og = c.createGain(); o.frequency.value = lfo[0]; og.gain.value = lfo[1]; o.connect(og); og.connect(g.gain); o.start(); }
      this.no[nome] = g;
    };
    camada('mar', this.ruido(c, 'marrom'), [['lowpass', 420, 0.5]], [0.11, 0.12]);
    camada('vento', this.ruido(c, 'marrom'), [['bandpass', 650, 0.8]], [0.07, 0.1]);
    camada('chuva', this.ruido(c, 'branco'), [['highpass', 1800, 0.5], ['lowpass', 9000, 0.5]], null);
    /* grilos: som agudo ligando e desligando rápido */
    const gr = c.createOscillator(); gr.type = 'sine'; gr.frequency.value = 4300;
    const grg = c.createGain(); grg.gain.value = 0; const gl = c.createOscillator(), glg = c.createGain(); gl.type = 'square'; gl.frequency.value = 13; glg.gain.value = 0.02;
    const gl2 = c.createOscillator(), gl2g = c.createGain(); gl2.frequency.value = 0.4; gl2g.gain.value = 0.015; gl.connect(glg).connect(grg.gain); gl2.connect(gl2g).connect(grg.gain);
    const ggv = c.createGain(); ggv.gain.value = 0; gr.connect(grg).connect(ggv).connect(mestre); gr.start(); gl.start(); gl2.start(); this.no.grilo = ggv;
    this.no.gaivota = { gain: { value: 0 } }; this.no.trovao = { gain: { value: 0 } };   // só marcam "ligado": o som sai dos timers
    return true;
  },
  tom(f0, f1, dur, vol, t0 = 0) {
    const c = this.ctx, t = c.currentTime + t0, o = c.createOscillator(), g = c.createGain();
    o.type = 'triangle'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.2); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.mestre); o.start(t); o.stop(t + dur + 0.05);
  },
  agendar(nome, fn, min, max) {   // chama fn de tempos em tempos enquanto a camada estiver na cena
    const t = setTimeout(() => { if (!this.cena || !(this.MIX[this.cena] || {})[nome] || !this.quer()) return; fn(); this.agendar(nome, fn, min, max); }, (min + Math.random() * (max - min)) * 1000);
    this.timers.push(t);
  },
  gaivota() { const f = 1500 + Math.random() * 500; this.tom(f, f * 0.62, 0.35, 0.05); this.tom(f * 1.05, f * 0.6, 0.4, 0.04, 0.4); },
  trovao() { const c = this.ctx, n = c.sampleRate * 2.5, b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0); let u = 0;
    for (let i = 0; i < n; i++) { u = (u + 0.03 * (Math.random() * 2 - 1)) / 1.03; d[i] = u * 5 * Math.pow(1 - i / n, 2); }
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = b; f.type = 'lowpass'; f.frequency.value = 220; g.gain.value = 0.9;
    s.connect(f).connect(g).connect(this.mestre); s.start(); },
  atualizar() {
    const quer = this.quer(), cena = quer ? Relogio.cena() : null;
    if (quer && !this.ctx && !this.criar()) return;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.mestre.gain.setTargetAtTime(quer ? this.vol() * 0.5 : 0, t, 0.4);
    const mix = this.MIX[cena] || {};
    Object.entries(this.no).forEach(([n, g]) => { if (g.gain.setTargetAtTime) g.gain.setTargetAtTime((mix[n] || 0) * (n === 'grilo' ? 1 : 1), t, 1.5); });
    if (cena !== this.cena) {
      this.cena = cena; this.timers.forEach(clearTimeout); this.timers = [];
      if (mix.gaivota) this.agendar('gaivota', () => this.gaivota(), 9, 22);
      if (mix.trovao) this.agendar('trovao', () => this.trovao(), 14, 35);
    }
  },
  /* para os testes: o que está tocando agora */
  estadoAtual() { return { ligado: this.ligado(), cena: this.cena, camadas: Object.fromEntries(Object.entries(this.no || {}).filter(([, g]) => g.gain.value > 0.001).map(([n, g]) => [n, +g.gain.value.toFixed(2)])), mestre: this.mestre ? +this.mestre.gain.value.toFixed(2) : 0, pronto: this.quer() }; }
};
Mesa.on(ch => { if (Mesa.aberta && ch === 'estado') Ambiente.atualizar(); });
['pointerdown', 'keydown'].forEach(t => document.addEventListener(t, () => setTimeout(() => Ambiente.atualizar(), 50), { capture: true }));
ACT['amb-lig'] = el => { Ambiente.alternar(el.checked); toast(el.checked ? 'Som ambiente ligado neste aparelho.' : 'Som ambiente desligado.', { tipo: 'bom' }); if (App.rota === 'mesa') TelaMesa.som(); };
const _actSom = ACT['som']; ACT['som'] = function (...a) { const r = _actSom.apply(this, a); setTimeout(() => Ambiente.atualizar(), 30); return r; };   // interruptor geral do topo
ACT['amb-vol'] = el => Ambiente.volume(parseFloat(el.value));
document.addEventListener('input', e => { const el = e.target; if (el && el.dataset && el.dataset.chg === 'amb-vol') Ambiente.volume(parseFloat(el.value)); });

/* só para os testes automáticos: com window.__expor ligado antes de carregar, deixa os objetos à mão */
if (window.__expor) Object.assign(window, { Mesa, App, Dado3D, Ambiente, DadoCentral, rolarPublico, gravarEstado, Store, lembrar, TelaMesa, Relogio, Som, M });
