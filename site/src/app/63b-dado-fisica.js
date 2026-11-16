/* ═══════════ DADO COM FÍSICA ═══════════
   Os dados são jogados numa mesa de madeira, quicam, batem uns nos outros e param. Vale para d4, d6, d8, d10, d12, d20, d100
   (e d2/d3, num d6). REGRA DE OURO: o número já vem pronto na rolagem gravada no banco; a física só mostra.
   A jogada usa um sorteio "semeado" pela hora da rolagem, então todo mundo vê os dados caindo do mesmo jeito.
   O motor (dadofis.js) é baixado à parte, só quando a Mesa abre. Sem ele, sem WebGL ou com "Dado 3D" desligado: vale o dado de antes. */
const DadoF = {
  carregando: false, mesaUrl: {},
  pronto() { return !!window.DadoFis && window.DadoFis.serve(); },
  carregar() {
    if (window.DadoFis || this.carregando || !window.DADOFIS_URL) return; this.carregando = true;
    const s = document.createElement('script'); s.src = window.DADOFIS_URL; s.async = true; s.onerror = () => { this.carregando = false; }; document.head.appendChild(s);
  },
  /* destrincha a rolagem em dados de verdade. null = não dá para mostrar com física */
  dados(r) {
    const e = String(r.expr || '').replace(/\s/g, '').replace(/−/g, '-'), faces = []; let m; const re = /(\d*)d(\d+)/gi;
    while ((m = re.exec(e))) for (let i = 0; i < (parseInt(m[1], 10) || 1); i++) faces.push(+m[2]);
    const vals = (r.dados || []).map(v => Math.abs(num(v)));
    if (!faces.length || !vals.length) return null;
    const cor = r.mestre ? '#9a2c22' : Dado3D.CORES[Dado3D.corDe(r.uid)], tinta = r.mestre ? '#ffe9b0' : '#2a180d', borda = r.mestre ? '#3a0d0a' : '#2a180d';
    if (r.modo && faces.length === 1 && faces[0] === 20 && vals.length === 2) {   // vantagem ou desvantagem: dois d20, um vale
      const fica = vals.indexOf(r.nat);
      return vals.map((v, i) => ({ f: 20, v, cor, tinta, borda, apagado: i !== fica, brilho: i === fica ? (v === 20 ? 'crit' : v === 1 ? 'falha' : '') : '' }));
    }
    if (faces.length !== vals.length) return null;
    const out = [];
    for (let i = 0; i < faces.length; i++) {
      const f = faces[i], v = vals[i]; if (v < 1 || v > f) return null;
      if ([4, 6, 8, 10, 12, 20].includes(f)) out.push({ f, v, cor, tinta, borda, brilho: f === 20 && faces.length === 1 ? (v === 20 ? 'crit' : v === 1 ? 'falha' : '') : '' });
      else if (f === 100) { const dz = v === 100 ? 0 : Math.floor(v / 10), un = v % 10; out.push({ f: 10, v: dz + 1, cor, tinta, borda, rot: x => (x - 1) + '0' }, { f: 10, v: un + 1, cor: '#f6ead0', tinta: '#2a180d', rot: x => String(x - 1) }); }
      else if (f === 2 || f === 3) out.push({ f: 6, v, cor, tinta, borda, rot: x => String((x - 1) % f + 1) });
      else return null;
    }
    return out.length <= 12 ? out : null;
  },
  /* tampo da mesa: a madeira do site, ou a imagem que o mestre escolheu (vale para todos) */
  tampoAtual() { const m = (M.estado || {}).mesaDado || {}; return m.arq ? 'enviado' : (m.pre || 'navio'); },
  async tampo() {
    const m = (M.estado || {}).mesaDado;
    if (m && m.arq) { try { const u = await Arquivos.url(m.arq); if (u) return { url: u, modo: 'cobre' }; } catch (e) { /* cai na madeira */ } }
    const pre = (m && m.pre) || 'navio', u = pre === 'feltro' ? img('tampo_feltro') : pre === 'simples' ? '' : img('tampo_madeira');
    return u ? { url: u, modo: 'cobre' } : { url: ASSETS['tex_madeira.webp'], modo: 'repete' };
  },
  ultToc: 0,
  toc(v, ehDado) {
    if (!Som.ok() || Som2.mudo) return; const t = performance.now(); if (t - this.ultToc < 38) return; this.ultToc = t;
    const vol = clamp(v / 34, 0.05, 0.42) * (Som2.vol.e ?? 0.8) * 1.2;
    if (ehDado) Som.ruido(0.03, 3400 + Math.random() * 1400, vol * 0.8, 0, 5);
    else { Som.ruido(0.045, 950 + Math.random() * 500, vol, 0, 2.2); Som.tom(190, 90, 0.05, 'sine', vol * 0.5); }
  }
};

const _proximoAntes = DadoCentral.proximo;
DadoCentral.proximo = function () {
  if (this.ocupado || !this.fila.length) return;
  const r = this.fila[0], box = $('#mt-dado'), lista = box && App.rota === 'mesa' && !window.__sem3d && Dado3D.ligado() && DadoF.pronto() ? DadoF.dados(r) : null;
  if (!lista) return _proximoAntes.call(this);
  this.fila.shift(); this.ocupado = true;
  const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches, rapido = this.fila.length > 0;
  const crit = r.nat === 20, falha = r.nat === 1, q = $('#mt-quadro');
  if (q) q.classList.add('rolando');
  box.hidden = false; box.style.setProperty('--qw', ((q && q.clientWidth) || 600) + 'px'); box.className = 'mt-dado dd-fis' + (crit ? ' crit' : '') + (falha ? ' falha' : '');
  box.innerHTML = `<div class="ddf-mesa"></div><i class="ddf-borda" aria-hidden="true"></i>
    <div class="dd-placa"><b class="ddf-tot">${r.total}</b><div><p class="dd-quem">${esc(r.nome)}${r.rot ? ` · <span>${esc(r.rot)}</span>` : ''}</p>
    <p class="dd-conta">${esc(r.expr)}${r.dados && r.dados.length ? ` → ${r.dados.join(r.modo ? ' / ' : ' + ')}` : ''}${r.bonus ? ` ${sg(r.bonus)}` : ''}${r.modo ? ` · ${r.modo === 'vant' ? 'vantagem' : 'desvantagem'}` : ''}${r.motivo ? ` · ${esc(r.motivo)}` : ''}</p>
    ${crit ? '<p class="dd-sel">20 natural!</p>' : falha ? '<p class="dd-sel">1 natural…</p>' : ''}</div></div>`;
  const acabar = () => { if (q) q.classList.remove('rolando'); box.hidden = true; box.className = 'mt-dado'; box.innerHTML = ''; this.ocupado = false; this.proximo(); };
  let h = 0; String(r.uid || '').split('').forEach(c => { h = (h * 31 + c.charCodeAt(0)) >>> 0; });
  DadoF.tampo().then(tp => {
    let ctl;
    try {
      ctl = window.DadoFis.rolar($('.ddf-mesa', box), { dados: lista, seed: ((r.em || 1) ^ (num(r.total) * 7919)) >>> 0, ...(typeof Roda !== 'undefined' && Roda.origem(r) != null ? { lado: 0, origem: Roda.origem(r) } : { lado: r.mestre ? 3 : h % 3 }), mesa: tp.url, modoMesa: tp.modo,
        vel: rapido ? 1.5 : 1, parado: reduz, baixo: -0.22, aoTocar: (v, d) => DadoF.toc(v, d) });
    } catch (e) { console.warn('Dado com física falhou, vale o de antes:', e.message || e); this.fila.unshift(r); this.ocupado = false; box.hidden = true; window.__sem3d = window.__sem3d || false; DadoF.pronto = () => false; return this.proximo(); }
    if (typeof Roda !== 'undefined') { Roda.marcar(r, true); $$('.mt-resto').forEach(e => e.remove()); }
    const t1 = ctl.ms + 180, t2 = t1 + (rapido ? 1400 : 2900);
    setTimeout(() => {
      box.classList.add('revela'); Som.tocar(crit ? 'critico' : falha ? 'falha' : 'acerto');
      if (q && (crit || falha) && !reduz) { q.classList.add(crit ? 'q-crit' : 'q-falha'); setTimeout(() => q.classList.remove('q-crit', 'q-falha'), 900); }
      if (crit && MANIFEST.anims.critico) { const e = document.createElement('div'); e.className = 'dd-estrela'; e.innerHTML = anim('critico', 3.2, { umaVez: true, dur: 1.1 }); box.appendChild(e); }
    }, t1);
    setTimeout(() => { if (typeof Roda !== 'undefined') { Roda.marcar(r, false); Roda.foto = null; const u = ctl.foto && ctl.foto(); if (u) Roda.guardarFoto(r, u); } box.classList.add('some'); }, t2);
    setTimeout(() => { ctl.parar(); acabar(); }, t2 + 450);
  });
};

/* baixa o motor quando a Mesa abre, para a primeira rolagem já sair com física */
const _depoisMesaF = VIEWS.mesa.depois;
VIEWS.mesa.depois = function (...a) { DadoF.carregar(); return _depoisMesaF && _depoisMesaF.apply(this, a); };

/* o mestre escolhe o tampo da mesa dos dados (imagem vista de cima); vale para todos */
ACT['ddf-tampo'] = () => escolherArquivos('image/*', false, async fs => { const r = await enviarArquivos(fs, 'imagem'); if (r && r[0]) { await gravarEstado({ mesaDado: { arq: r[0].id, pre: 'navio' } }); toast('Tampo novo na mesa dos dados. Role um dado para ver.', { tipo: 'bom' }); } });
ACT['ddf-tampo-fim'] = async () => { await gravarEstado({ mesaDado: { arq: '', pre: 'navio' } }); toast('Voltou a madeira do navio.', { tipo: 'bom' }); };
ACT['ddf-pre'] = async el => { await gravarEstado({ mesaDado: { arq: '', pre: el.dataset.k } }); toast('Mesa dos dados trocada. Role um dado para ver.', { tipo: 'bom' }); };
ACT['ddf-teste'] = () => rolarPublico('2d6+1d20+1d8', 'Teste da mesa');
