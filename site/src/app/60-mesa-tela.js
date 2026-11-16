/* ═══════════ tela da mesa ao vivo: céu pelo relógio, quadro central (imagem e dados), ilhas, NPCs, capitão, música ═══════════ */
const Relogio = {
  agora() {
    const e = (M.estado && M.estado.relogio) || {}, min = e.min ?? 480, dia = Math.floor(min / 1440) + 1, m = ((min % 1440) + 1440) % 1440, h = Math.floor(m / 60), mm = m % 60;
    return { min, dia, h, mm, hh: `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`, periodo: this.periodo(h), clima: e.clima || 'sol' };
  },
  periodo: h => h < 5 ? 'madrugada' : h < 7 ? 'amanhecer' : h < 12 ? 'manhã' : h < 18 ? 'tarde' : h < 19 ? 'pôr do sol' : 'noite',
  cena() {
    const r = this.agora(), c = r.clima;
    if (c === 'chuva' || c === 'tempestade') return 'h_tempestade';
    if (c === 'neblina' || c === 'neve' || c === 'calmaria') return 'h_' + c;
    return r.h < 5 || r.h >= 19 ? 'h_noite' : r.h < 7 ? 'h_amanhecer' : r.h < 18 ? 'h_tarde' : 'h_por_do_sol';
  },
  icone() {
    const r = this.agora(), c = r.clima;
    return { chuva: 'clima:chuva_forte', tempestade: 'clima:tormenta', neblina: 'clima:neblina', neve: 'clima:nevasca', calmaria: 'clima:calmaria', nublado: 'clima:nublado' }[c]
      || (r.h < 5 || r.h >= 19 ? 'clima:lua' : r.h < 7 ? 'clima:amanhecer' : 'clima:sol');
  }
};
const CLIMAS = [['sol', 'Sol', 'clima:sol'], ['nublado', 'Nublado', 'clima:nublado'], ['chuva', 'Chuva', 'clima:chuva_forte'], ['tempestade', 'Tempestade', 'clima:tormenta'],
  ['neblina', 'Neblina', 'clima:neblina'], ['neve', 'Neve', 'clima:nevasca'], ['calmaria', 'Calmaria', 'clima:calmaria']];
/* CD do Teste de Navegação por mar (GN p. 65 · LJ p. 156) */
/* a Viagem usa "Paradise (Grand Line)"; a CD é a mesma de "Paradise". Isto acha a chave certa. */
const marChave = m => Object.keys(CD_MAR).find(k => (m || '').startsWith(k)) || 'East Blue';
const CD_MAR = { 'East Blue': 15, 'North Blue': 16, 'South Blue': 16, 'West Blue': 16, 'Mares do Céu': 18, 'Paradise': 20, 'Calm Belt': 22, 'Novo Mundo': 24 };
function resolverCap(c) {
  if (!c) return null;
  if (c.tipo === 'jogador') { const j = (M.jogadores || []).find(x => x.uid === c.uid); return j ? { tipo: 'jogador', uid: c.uid, nome: nomeJ(j), j } : null; }
  return { tipo: 'npc', nome: c.nome || 'NPC', von: +c.von || 0, retrato: c.retrato || 'npcs:crianca' };
}
/* provisório: quem está no leme agora, só para o teste do mar. Pode ser uma criança NPC. */
function capitaoAtual() { return resolverCap((M.estado || {}).capitao); }
/* oficial: o capitão do bando, definido na Tripulação. É dele o diário do capitão. */
function capitaoOficial() { return resolverCap((M.trip || {}).capitao); }
/* quem faz o teste de Vontade no mar: o provisório manda, porque ele só existe quando o oficial não está */
function noComando() { return capitaoAtual() || capitaoOficial(); }
const attrMod = (ficha, n) => { const a = ((ficha && ficha.attrs) || []).find(x => x.n === n); return a ? (num(a.m) || 0) : 0; };
const gravarEstado = patch => DB.gravar('mesa/estado', patch).catch(e => toast('Não deu para salvar: ' + esc(e.code || e.message), { tipo: 'ruim' }));
function avisar(tipo, txt, dados = {}) { return gravarEstado({ aviso: { n: novoId(), em: Date.now(), tipo, txt, dados } }); }

/* ───── rolagens públicas ───── */
async function publicarRolagem(r) {
  const reg = limpo({ uid: Eu.uid, nome: souMestre() ? 'Mestre' : nomeJ(eu()), mestre: souMestre(), em: Date.now(), ...r });
  try { await DB.novo('rolagens', reg); } catch (e) { toast('Não deu para mostrar a rolagem: ' + esc(e.code || e.message), { tipo: 'ruim' }); }
}
function rolarPublico(expr, rot = '', opts = {}) {
  const ehD20 = /^1?d20([+-]\d+)?$/i.test(String(expr).replace(/\s/g, ''));
  if (ehD20 && (opts.modo || opts.forcarD20)) {
    const bonus = num(String(expr).replace(/^1?d20/i, '')) || 0, r = d20(bonus, opts.modo || '');
    return publicarRolagem({ expr: `d20${bonus ? sg(bonus) : ''}`, rot, total: r.total, dados: r.rolagens, nat: r.nat, modo: r.modo, bonus, tipo: opts.tipo || '', motivo: opts.motivo || '' });
  }
  const r = rolar(expr);
  const dados = r.partes.flatMap(p => p.r.map(v => p.s * v)), nat = r.partes.length === 1 && r.partes[0].f === 20 && r.partes[0].q === 1 ? r.partes[0].r[0] : null;
  return publicarRolagem({ expr: r.expr, rot, total: r.total, dados, nat, bonus: r.mod, tipo: opts.tipo || '', motivo: opts.motivo || '' });
}

/* dado no centro: só anima rolagens novas (dos últimos segundos) */
const DadoCentral = {
  visto: Date.now() - 6000, fila: [], ocupado: false,
  ver() {
    const novas = (M.rolagens || []).filter(r => (r.em || 0) > this.visto).sort((a, b) => a.em - b.em);
    if (!novas.length) return;
    this.visto = Math.max(...novas.map(r => r.em));
    novas.filter(r => Date.now() - r.em < 20000).forEach(r => this.fila.push(r));
    this.fila = this.fila.slice(-4);
    this.proximo();
  },
  proximo() {
    if (this.ocupado || !this.fila.length) return;
    const r = this.fila.shift(), box = $('#mt-dado');
    if (!box || App.rota !== 'mesa') { toast(`${ic('mesa:d20', 32)} <b>${esc(r.nome)}</b>${r.rot ? ' · ' + esc(r.rot) : ''}: <b>${r.total}</b> <small>(${esc(r.expr)})</small>`); return this.proximo(); }
    this.ocupado = true; Som.tocar('dado');
    const crit = r.nat === 20, falha = r.nat === 1, rapido = this.fila.length > 0;
    box.hidden = false; box.className = 'mt-dado' + (crit ? ' crit' : '') + (falha ? ' falha' : '');
    box.innerHTML = `<div class="dd-anim">${MANIFEST.anims.dado ? anim('dado', 2.4, { umaVez: true, dur: rapido ? 0.7 : 1.1 }) : ic('mesa:d20', 128)}<b class="dd-num">${r.total}</b></div>
      <p class="dd-quem">${esc(r.nome)}${r.rot ? ` · <span>${esc(r.rot)}</span>` : ''}</p>
      <p class="dd-conta">${esc(r.expr)}${r.dados && r.dados.length ? ` · ${r.dados.join(r.modo ? ' / ' : ' + ')}` : ''}${r.modo ? ` (${r.modo === 'vant' ? 'vantagem' : 'desvantagem'})` : ''}${r.motivo ? ` · ${esc(r.motivo)}` : ''}</p>`;
    setTimeout(() => { box.classList.add('revela'); Som.tocar(crit ? 'critico' : falha ? 'falha' : 'acerto'); }, rapido ? 700 : 1100);
    setTimeout(() => { box.classList.add('some'); }, rapido ? 2200 : 3800);
    setTimeout(() => { box.hidden = true; box.className = 'mt-dado'; this.ocupado = false; this.proximo(); }, rapido ? 2600 : 4300);
  }
};

/* ───── música e efeitos para todos ───── */
const Som2 = {
  trilha: null, atual: null, ultSfx: undefined, travado: false, pausado: false, tocando: new Set(),
  vol: { m: 0.5, e: 0.8 }, volDe: null,
  /* volume é de cada pessoa: no teste são várias abas no mesmo navegador */
  carregarVol() {
    if (this.volDe === Eu.uid) return;
    this.volDe = Eu.uid;
    const u = Eu.uid || 'anon';
    this.vol = { m: parseFloat(lembrar('vol-m-' + u) ?? '0.5'), e: parseFloat(lembrar('vol-e-' + u) ?? '0.8') };
    if (this.trilha) this.trilha.volume = this.vol.m;
  },
  ver() {
    this.carregarVol();
    const t = (M.estado || {}).trilha;
    if (!t || !t.id || !t.tocando) { if (this.trilha) this.trilha.pause(); this.atual = null; }
    else if (this.pausado) { this.atual = t.id; this.inicio = t.inicio; }   // pausada só aqui: o resto da mesa continua ouvindo
    else if (t.id !== this.atual || t.inicio !== this.inicio) this.tocar(t);
    const s = (M.estado || {}).sfx;
    if (s && s.n !== this.ultSfx) { const primeira = this.ultSfx === undefined; this.ultSfx = s.n; if (!primeira && !this.mudo && Date.now() - (s.em || 0) < 10000) this.efeito(s.id); }
    else if (!s && this.ultSfx === undefined) this.ultSfx = null;
  },
  async tocar(t) {
    this.atual = t.id; this.inicio = t.inicio;
    const u = await Arquivos.url(t.id); if (!u || this.atual !== t.id) return;
    if (!this.trilha) { this.trilha = new Audio(); this.trilha.loop = true; this.trilha.preload = 'auto'; }
    const a = this.trilha; a.src = u; a.volume = this.vol.m;
    a.onloadedmetadata = () => { if (a.duration && isFinite(a.duration)) a.currentTime = (((Date.now() - (t.inicio || Date.now())) / 1000) % a.duration + a.duration) % a.duration; };
    a.play().then(() => { this.travado = false; this.faixaSom(); }).catch(() => { this.travado = true; this.faixaSom(); });
  },
  async efeito(id) { const u = await Arquivos.url(id); if (!u) return; const a = this.registrar(new Audio(u)); a.volume = this.vol.e; a.play().catch(() => { this.travado = true; this.faixaSom(); }); },
  registrar(a) { this.tocando.add(a); a.addEventListener('ended', () => this.tocando.delete(a)); a.addEventListener('pause', () => this.tocando.delete(a)); return a; },
  pararEfeitos() { [...this.tocando].forEach(a => { try { a.pause(); a.currentTime = 0; } catch (e) { /* já parou */ } }); this.tocando.clear(); },
  /* pausar a música só neste aparelho; ao voltar, entra no ponto em que a mesa está */
  alternarPausa() {
    this.pausado = !this.pausado;
    if (this.pausado) { if (this.trilha) this.trilha.pause(); }
    else { this.atual = null; this.ver(); }
    this.faixaSom();
  },
  destravar() { this.travado = false; if (this.trilha && this.atual && !this.pausado) this.trilha.play().catch(() => {}); Som.gesto = true; Som.c(); this.faixaSom(); },
  volume(k, v) { this.carregarVol(); this.vol[k] = v; lembrar('vol-' + k + '-' + (Eu.uid || 'anon'), String(v)); if (k === 'm' && this.trilha) this.trilha.volume = v; },
  parar() { if (this.trilha) this.trilha.pause(); this.atual = null; },
  faixaSom() { if (App.rota === 'mesa') TelaMesa.som(); },
  /* cada aviso pode ter um som próprio escolhido pelo mestre; sem escolha, o som de sempre */
  evento(nome, padrao) {
    const id = ((M.estado || {}).sons || {})[nome];
    if (id && (M.arquivos || []).some(a => a.id === id)) { this.efeito(id); return; }
    if (padrao) Som.tocar(padrao);
  },
  /* efeitos são pequenos: baixa todos antes para tocarem na hora */
  preparar() { (M.arquivos || []).filter(a => a.cat === 'sfx').forEach(a => Arquivos.url(a.id)); }
};
window.Som2 = Som2;
Mesa.on(ch => { if (!Mesa.aberta) return; if (ch === 'estado') { Som2.ver(); tempoPassou(); } if (ch === 'arquivos') Som2.preparar(); if (ch === 'rolagens') DadoCentral.ver(); });
/* o mestre avançou o relógio: a ampulheta vira para todo mundo */
let _ultMin;
function tempoPassou() {
  const r = Relogio.agora(); if (_ultMin === undefined) { _ultMin = r.min; return; }
  if (r.min === _ultMin) return;
  const d = r.min - _ultMin; _ultMin = r.min;
  const txt = Math.abs(d) >= 1440 ? `${Math.round(d / 1440)} dia(s)` : Math.abs(d) >= 60 ? `${Math.round(d / 60)} h` : `${d} min`;
  const anT = d >= 480 && MANIFEST.anims.fogueira ? anim('fogueira', 0.5) : MANIFEST.anims.ampulheta ? anim('ampulheta', 0.5, { umaVez: true, dur: 1.2 }) : ic('modos:ampulheta', 32);
  toast(`${anT} <span>${d > 0 ? 'Passaram' : 'Voltou'} ${txt.replace('-', '')}: <b>Dia ${r.dia} · ${r.hh}</b> (${r.periodo})</span>`, { tempo: 4500 });
}

/* ───── avisos para todos: Den Den Mushi, ilha descoberta, categoria liberada, jornal, cartaz de recompensa ───── */
const Avisos = {
  ult: undefined,
  ver() {
    const a = (M.estado || {}).aviso;
    if (!a) { if (this.ult === undefined) this.ult = null; return; }
    if (a.n === this.ult) return;
    const primeira = this.ult === undefined; this.ult = a.n;
    if (primeira || Date.now() - (a.em || 0) > 30000) return;
    this.mostrar(a);
  },
  mostrar(a) {
    const p = $('#palco'); if (!p) return;
    const fechar = `<button class="palco-x" data-act="palco-fechar" aria-label="Fechar">×</button>`;
    const d = a.dados || {};
    if (Array.isArray(d.verem) && d.verem.length && !d.verem.includes(Eu.uid) && !souMestre()) return;   // aviso só para quem o mestre escolheu
    let h = '', tempo = 7000;
    if (a.tipo === 'cartaz') {
      const j = (M.jogadores || []).find(x => x.uid === d.uid);
      const arte = (MANIFEST.images.cartaz_base || {}).janela;
      h = arte
        ? `<div class="aviso-cartaz"><div class="cz-grande">
            <div class="cz-foto">${j ? fotoCartaz(j.foto, nomeJ(j)) : fotoCartaz(d.ret || null, d.nome)}</div>
            <img class="cz-arte" src="${img('cartaz_base')}" alt="Cartaz de procurado">
            ${d.alcunha ? `<span class="cz-alc" style="--n:${czLen(comAspas(d.alcunha))}">${esc(comAspas(d.alcunha))}</span>` : ''}
            <p class="cz-nome" style="--n:${czLen(d.nome || (j ? nomeJ(j) : ''))}">${esc(d.nome || (j ? nomeJ(j) : ''))}</p>
            <p class="cz-valor cz-valor-arte">${fmt(d.valor)}</p>
            ${MANIFEST.anims.poeira ? `<span class="cz-poeira">${anim('poeira', 2.6, { umaVez: true, dur: 1, atraso: 0.75 })}</span>` : ''}</div></div>`
        : `<div class="aviso-cartaz">${MANIFEST.anims.cartaz ? anim('cartaz', 3, { umaVez: true, dur: 1.4 }) : ''}<div class="cartaz-in">
            <p class="cz-w">WANTED</p><div class="cz-foto">${j ? fotoJ(j, 160) : retratoHTML(null, d.nome, 160)}</div><p class="cz-doa">DEAD OR ALIVE</p>
            <p class="cz-nome">${esc(d.nome || (j ? nomeJ(j) : ''))}</p><p class="cz-valor">฿ ${fmt(d.valor)}</p><p class="cz-m">MARINE</p></div></div>`;
      tempo = 9000; Som2.evento('recompensa', 'nivel');
    } else if (a.tipo === 'tesouro') {
      const quem = (M.jogadores || []).find(x => x.tesPego === a.n), meu = d.para === Eu.uid, pego = d.pegoPor || (quem ? nomeJ(quem) : '');
      h = `<div class="aviso-tes">${MANIFEST.anims.bau ? anim('bau', 3, { umaVez: true, dur: 1.1 }) : ic('tesouro:bau', 128)}
        <div class="tes-cx"><p class="nota">Tesouro${d.n ? ` · d100: ${d.n}` : ''}</p><h2>${d.i ? ic(d.i, 64) : ''}${esc(d.item || '')}</h2>
        ${d.valor ? `<p class="tes-valor">Vale <b>฿ ${fmt(d.valor)}</b>${d.modo === 'venda' ? ' · precisa ser vendido' : ''}</p>` : ''}
        ${d.para ? `<p class="tes-dono">${meu ? 'É seu.' : `De <b>${esc(d.paraNome || '')}</b>.`}</p>` : ''}
        ${meu && !pego ? `<button class="bt grande ouro" data-act="tes-pegar" data-n="${esc(d.item || '')}" data-i="${esc(d.i || '')}" data-av="${esc(a.n || '')}" data-v="${d.valor || 0}" data-m="${esc(d.modo || '')}">${ic('itens:mochila', 32)} Pegar e guardar na mochila</button>` : ''}
        ${pego ? `<p class="tes-ok">${ic('modos:selo', 32)} Guardado por ${esc(d.pegoPor)}.</p>` : ''}</div></div>`;
      tempo = 16000; Som2.evento('tesouro', 'nivel');
    } else {
      const ico = { texto: MANIFEST.anims.denden ? anim('denden', 1.6) : ic('mesa:denden', 96), liberado: MANIFEST.anims.cadeado ? anim('cadeado', 1.6, { umaVez: true, dur: 1.2 }) : ic('mesa:cadeado_aberto', 96),
        mar: d.anim && MANIFEST.anims[d.anim] ? anim(d.anim, 2.2, { umaVez: ['baleia'].includes(d.anim), dur: 1.6 }) : ic('mar:navio_pirata', 96),
        ilha: iconeHTML(d.icone || 'ilhas:vila', 96), loja: iconeHTML(d.icone || 'itensop:beli_moedas', 96), jornal: MANIFEST.anims.newscoo ? anim('newscoo', 1.4) : ic('modos:newscoo', 96), npc: iconeHTML(d.retrato || 'mesa:npc', 96),
        fruta: MANIFEST.anims.fruta ? anim('fruta', 1.6) : iconeHTML(d.icone || 'itensop:akuma_no_mi', 96), estilo: iconeHTML(d.icone || 'tesouro:espada', 96) }[a.tipo] || ic('mesa:denden', 96);
      const tit = { mar: 'No mar', texto: 'Den Den Mushi', liberado: 'Liberado', ilha: 'Nova ilha descoberta', jornal: 'Chegou o jornal', npc: 'Novo encontro', loja: 'Loja aberta', fruta: 'Akuma no Mi descoberta', estilo: 'Estilo descoberto' }[a.tipo] || 'Aviso';
      const comRolo = (a.tipo === 'texto' || a.tipo === 'liberado') && MANIFEST.anims.pergaminho && MANIFEST.anims.pergaminho.papel;
      const icoP = { texto: MANIFEST.anims.denden ? anim('denden', 0.9) : ic('mesa:denden', 64), liberado: MANIFEST.anims.cadeado ? anim('cadeado', 0.9, { umaVez: true, dur: 1.2, atraso: 0.9 }) : ic('mesa:cadeado_aberto', 64) }[a.tipo];
      /* o pergaminho abre grande no centro e o recado é escrito DENTRO do papel, no lugar medido da arte */
      h = comRolo
        ? `<div class="aviso-rolo"><span class="av-rolo">${anim('pergaminho', 6, { umaVez: true, dur: 0.9 })}</span>
            <div class="av-dentro"><div class="av-ic">${icoP}</div><p class="av-t">${tit}</p><p class="av-txt">${esc(a.txt || '')}</p></div></div>`
        : `<div class="aviso-den"><div class="av-ic">${ico}</div><div><p class="av-t">${tit}</p><p class="av-txt">${esc(a.txt || '')}</p></div></div>`;
      Som2.evento(a.tipo, a.tipo === 'liberado' ? 'nivel' : 'sino');
    }
    p.innerHTML = `<div class="palco-in ${/aviso-rolo|aviso-cartaz|aviso-tes/.test(h) ? 'sem-caixa' : ''}">${fechar}${h}</div>`; p.classList.add('on');
    carregarArquivos(p);
    clearTimeout(this.t); this.t = setTimeout(() => p.classList.remove('on'), tempo);
  }
};
ACT['palco-fechar'] = () => $('#palco').classList.remove('on');

/* ───── a tela ───── */
const TelaMesa = {
  ilhaSel: null, abaM: lembrar('aba-m') || 'quadro',
  ceu() {
    const c = $('#mt-ceu'); if (!c) return;
    const cena = Relogio.cena(); if (c.dataset.cena !== cena) { c.className = 'mt-ceu c-' + cena; c.dataset.cena = cena; }
    const clima = Relogio.agora().clima, ch = $('#mt-chuva'); if (ch) { ch.hidden = !(clima === 'chuva' || clima === 'tempestade' || clima === 'neve'); ch.className = 'mt-chuva ' + clima; }
  },
  quadro() {
    const el = $('#mt-img'); if (!el) return;
    const im = (M.estado || {}).imagem, chave = im ? im.arq : 'nada';
    if (el.dataset.k === chave) return; el.dataset.k = chave;
    const si = sessaoInfo();
    el.innerHTML = im ? `<img data-arq="${esc(im.arq)}" alt="${esc(im.legenda || 'Imagem do mestre')}">${im.legenda ? `<p class="mt-leg">${esc(im.legenda)}</p>` : ''}`
      : `<div class="mt-vazio c-t_mesa"><div>${si.icone ? iconeHTML(si.icone, 96) : ic('ilhas:vila', 96)}<p class="mt-ses">Sessão ${si.n} · ${esc(si.nome)}</p><p>Aguardando o mestre mostrar alguma coisa…</p></div></div>`;
    carregarArquivos(el);
  },
  ilhas() {
    const el = $('#mt-ilhas'); if (!el) return;
    const L = (M.mundo && M.mundo.ilhas) || [], atual = M.mundo && M.mundo.atual;
    if (this.ilhaSel == null || !L.some(i => i.id === this.ilhaSel && !i.oculta)) this.ilhaSel = atual;
    el.innerHTML = `<h3>${ic('mesa:navio', 32)} Ilhas descobertas</h3>${L.length ? `<ul class="ilhas-l">${L.map(i => i.oculta
      ? `<li class="oculta" title="Ainda não descoberta">${iconeHTML(i.icone || 'ilhas:banco_areia', 48, 'silhueta')}<span>???</span></li>`
      : `<li class="${i.id === atual ? 'atual' : ''} ${i.id === this.ilhaSel ? 'sel' : ''}"><button data-act="mt-ilha" data-id="${esc(i.id)}">${iconeHTML(i.icone || 'ilhas:vila', 48)}<span>${esc(i.nome)}${i.id === atual ? '<small>estamos aqui</small>' : ''}</span></button></li>`).join('')}</ul>`
      : '<p class="nota">Nenhuma ilha ainda. A primeira aparece quando o mestre liberar.</p>'}`;
    carregarArquivos(el); this.npcs();
  },
  npcs() {
    const el = $('#mt-npcs'); if (!el) return;
    const ilha = ((M.mundo && M.mundo.ilhas) || []).find(i => i.id === this.ilhaSel);
    const L = ((M.mundo && M.mundo.npcs) || []).filter(n => n.ilha === this.ilhaSel);
    el.innerHTML = `<h3>${ic('mesa:npc', 32)} ${ilha ? 'Em ' + esc(ilha.nome) : 'Pessoas e criaturas'}</h3>${L.length ? `<ul class="npcs-l">${L.map(n => `<li><button data-act="npc-ver" data-id="${esc(n.id)}">${iconeHTML(n.retrato || 'mesa:npc', 48)}<span><b>${esc(n.nome)}</b>${n.papel ? `<small>${esc(n.papel)}</small>` : ''}</span></button></li>`).join('')}</ul>`
      : `<p class="nota">${ilha ? 'Ninguém conhecido aqui ainda.' : 'Escolha uma ilha.'}</p>`}`;
    carregarArquivos(el);
  },
  cap() {
    const el = $('#mt-cap'); if (!el) return;
    const c = noComando(), of = capitaoOficial(), prov = capitaoAtual() && of && (capitaoAtual().nome !== of.nome);
    el.innerHTML = `<h3>${ic('modos:capitao', 32)} No comando do navio</h3>${c ? `<div class="cap-c">${c.tipo === 'jogador' ? fotoJ(c.j, 48) : iconeHTML(c.retrato, 48)}<div><b>${esc(c.nome)}</b><small>${prov || !of ? 'no leme agora' : 'capitão do bando'} · ${c.tipo === 'jogador' ? 'jogador' : 'NPC'} · faz o teste de Vontade no mar quando não há navegador</small>${prov ? `<small class="cap-of">Capitão do bando: ${esc(of.nome)} (fora do leme)</small>` : ''}</div></div>`
      : '<p class="nota">Ninguém escolhido. O mestre escolhe quem representa o comando.</p>'}${souMestre() ? `<button class="bt fino" data-act="mt-aba" data-a="mesa">Trocar</button>` : ''}`;
    carregarArquivos(el);
  },
  hist() {
    const el = $('#mt-hist'); if (!el) return;
    const L = (M.rolagens || []).slice(0, 12);
    el.innerHTML = L.length ? `<ol class="hist-l">${L.map(r => `<li class="${r.nat === 20 ? 'crit' : r.nat === 1 ? 'falha' : ''}"><b class="h-tot">${r.total}</b><span><b>${esc(r.nome)}</b>${r.rot ? ' · ' + esc(r.rot) : ''}<small>${esc(r.expr)}${r.dados ? ' · ' + r.dados.join(r.modo ? '/' : '+') : ''}${r.modo ? (r.modo === 'vant' ? ' · vant.' : ' · desv.') : ''}</small></span><time>${hora(r.em)}</time></li>`).join('')}</ol>`
      : '<p class="nota">Nenhuma rolagem ainda. Toque num dado para rolar na frente de todo mundo.</p>';
  },
  som() {
    const el = $('#mt-som'); if (!el) return;
    const t = (M.estado || {}).trilha, info = t && t.tocando ? (M.arquivos || []).find(a => a.id === t.id) : null;
    el.innerHTML = `<div class="som-faixa">${info && MANIFEST.anims.gramofone ? anim('gramofone', 0.55) : ic('mesa:gramofone', 32)}<span class="som-nome">${info ? esc(info.nome) : 'Sem música agora'}</span>
      ${Som2.travado ? `<button class="bt pisca" data-act="som-destravar">${ic('mesa:volume', 32)} Tocar o som da mesa</button>` : ''}</div>
      <div class="som-eu"><button class="bt fino ${Som2.pausado ? 'on' : ''}" data-act="som-pausar" ${t && t.tocando ? '' : 'disabled'}>${Som2.pausado ? '▶ Voltar a música' : '⏸ Pausar música'}</button><button class="bt fino" data-act="som-parar-sfx">⏹ Parar efeitos</button><button class="bt fino ${Som2.mudo ? 'on' : ''}" data-act="som-mudo">${Som2.mudo ? '🔔 Ouvir efeitos' : '🔕 Silenciar efeitos'}</button></div><small class="nota">Esses botões valem só para este aparelho; ninguém mais é afetado.</small>
      <label class="vol">${ic('mesa:gramofone', 32)}<span>Música</span><input type="range" min="0" max="1" step="0.05" value="${Som2.vol.m}" data-chg="vol" data-k="m" aria-label="Volume da música"></label>
      <label class="vol">${ic('mesa:volume', 32)}<span>Efeitos</span><input type="range" min="0" max="1" step="0.05" value="${Som2.vol.e}" data-chg="vol" data-k="e" aria-label="Volume dos efeitos"></label>
      <details class="som-aj" ${Som2.ajAberto ? 'open' : ''}><summary>⚙ Ajustes deste aparelho${souMestre() ? ' e da mesa dos dados' : ''}</summary><div class="som-aparelho">
      <label class="check"><input type="checkbox" data-chg="amb-lig" ${Ambiente.ligado() ? 'checked' : ''}> Som ambiente da cena <small class="nota">(ondas, vento, chuva, grilos; começa desligado)</small></label>
      <label class="vol" ${Ambiente.ligado() ? '' : 'hidden'}>${ic('mesa:volume', 32)}<span>Ambiente</span><input type="range" min="0" max="1" step="0.05" value="${Ambiente.vol()}" data-chg="amb-vol" aria-label="Volume do som ambiente"></label>
      <label class="check"><input type="checkbox" data-chg="dado3d" ${Dado3D.ligado() ? 'checked' : ''}> Dados 3D com física <small class="nota">(desligado: volta o dado 2D)</small></label>
      <label class="check"><input type="checkbox" data-chg="reac-lig" ${typeof Reac === 'undefined' || Reac.ligado() ? 'checked' : ''}> Reações no quadro <small class="nota">(os balões 👏 😱 💀)</small></label>
      <label class="check"><input type="checkbox" data-chg="roda-lig" ${typeof Roda === 'undefined' || Roda.ligada() ? 'checked' : ''}> Lugares dos jogadores no quadro <small class="nota">(retratos, PV e última rolagem)</small></label>
      ${souMestre() ? `<p class="pm-sub">Mesa dos dados (para todos)</p><div class="som-eu">${[['navio', 'Madeira do navio'], ['feltro', 'Feltro verde'], ['simples', 'Madeira simples']].map(([k, n]) => `<button class="bt fino ${DadoF.tampoAtual() === k ? 'on' : ''}" data-act="ddf-pre" data-k="${k}">${n}</button>`).join('')}<button class="bt fino" data-act="ddf-tampo">Enviar outro tampo</button><button class="bt fino" data-act="ddf-teste">Jogar dados de teste</button></div><small class="nota">O tampo é uma imagem vista de cima (peça no Ateliê: “Tampo da mesa de dados”).</small>` : ''}</div></details>`;
  },
  rolar() {
    const el = $('#mt-rolar'); if (!el) return;
    const q = this.q || 1, mod = this.mod || 0, modo = this.modo || '';
    const ficha = !souMestre() ? fichaDe(eu()) : null, estilo = (eu().estilo || Eu.estilo);
    el.innerHTML = `<div class="rl-linha"><div class="rl-q"><button class="bt-ic" data-act="rl-q" data-d="-1" aria-label="Menos dados">−</button><b>${q}</b><button class="bt-ic" data-act="rl-q" data-d="1" aria-label="Mais dados">+</button></div>
        ${[4, 6, 8, 10, 12, 20, 100].map(f => `<button class="rl-d ${f === 20 ? 'd20' : ''}" data-act="rl-dado" data-f="${f}">d${f}</button>`).join('')}
        <label class="rl-mod">mod <input id="rl-mod" type="number" value="${mod}" step="1" inputmode="numeric" data-chg="rl-mod"></label></div>
      <div class="rl-linha"><input id="rl-rot" class="rl-rot" placeholder="Para quê? (ex.: ataque, Percepção)" maxlength="40" value="${esc(this.rot || '')}" data-chg="rl-rot">
        <div class="chips">${[['', 'normal'], ['vant', 'vantagem'], ['desv', 'desvantagem']].map(([k, t]) => `<button class="chip ${modo === k ? 'on' : ''}" data-act="rl-modo" data-m="${k}">${t}</button>`).join('')}</div>
        ${souMestre() ? `<label class="ck-mini"><input type="checkbox" id="rl-secreta" ${this.secreta ? 'checked' : ''} data-chg="rl-secreta"> secreta</label>` : ''}</div>
      ${ficha && estilo !== 'timao' ? fichaRapida(ficha) : ''}`;
  },
  todo() { this.ceu(); this.quadro(); this.ilhas(); this.cap(); this.hist(); this.som(); this.rolar(); if (souMestre()) PainelMestre.desenhar(); }
};

/* rolagens rápidas da ficha (Log Pose e Engrenagem): perícias, salvaguardas, iniciativa */
const PER_ATTR = { Atletismo: 'FOR', Acrobacia: 'DES', Furtividade: 'DES', 'Prestidigitação': 'DES', 'História': 'SAB', 'Investigação': 'SAB', Medicina: 'SAB', Natureza: 'SAB', 'Sobrevivência': 'SAB',
  'Atuação': 'PRE', 'Enganação': 'PRE', 'Intimidação': 'PRE', 'Persuasão': 'PRE', 'Provocação': 'PRE', Haki: 'VON', 'Intuição': 'VON', 'Percepção': 'VON', Sobrenatural: 'VON', Sorte: 'VON' };
/* Engrenagem: desvantagem e penalidade que vêm das condições e da exaustão (LJ p. 37 e 269–273) */
function ajusteAuto(tipo, attr, pericia) {
  const L = eu().vivo || {}, cs = nomesCond(L.conds), mot = []; let desv = false;
  const tem = n => cs.has(n);
  ['Amedrontado', 'Envenenado', 'Enfraquecido'].forEach(n => { if (tem(n) && tipo !== 'salv') { desv = true; mot.push(n); } });
  if (tem('Bêbado') && (tipo === 'salv' || attr === 'DES')) { desv = true; mot.push('Bêbado'); }
  if (tem('Sonolento') && tipo !== 'salv' && (attr === 'DES' || attr === 'SAB')) { desv = true; mot.push('Sonolento'); }
  if ((tem('Impedido') || tem('Despedaçado')) && tipo === 'salv' && attr === 'DES') { desv = true; mot.push(tem('Impedido') ? 'Impedido' : 'Despedaçado'); }
  if (tem('Doente') && (pericia === 'Furtividade' || pericia === 'Percepção')) { desv = true; mot.push('Doente'); }
  const exa = (EXA[L.exa || 0] || [0, 0])[1] || 0; if (exa) mot.push(`exaustão ${L.exa} (${exa})`);
  return { modo: desv ? 'desv' : '', pen: exa, motivo: mot.join(', ') };
}
function fichaRapida(f) {
  const salv = (f.attrs || []).map(a => `<button class="chip" data-act="rl-ficha" data-t="salv" data-a="${a.n}" data-b="${a.salv ?? a.m ?? 0}">Salv. ${a.n} ${sg(a.salv ?? a.m ?? 0)}</button>`).join('');
  const per = (f.pericias || []).map(p => `<button class="chip" data-act="rl-ficha" data-t="per" data-p="${esc(p.n)}" data-a="${PER_ATTR[p.n] || ''}" data-b="${p.v ?? 0}">${esc(p.n)} ${sg(p.v ?? 0)}</button>`).join('');
  return `<details class="rl-ficha"><summary>${ic('modos:regras', 32)} Rolar pela ficha</summary>
    <div class="chips"><button class="chip on" data-act="rl-ficha" data-t="ini" data-a="DES" data-b="${f.desMod ?? attrMod(f, 'DES')}">Iniciativa ${sg(f.desMod ?? attrMod(f, 'DES'))}</button>${salv}</div><div class="chips">${per}</div></details>`;
}
ACT['rl-ficha'] = el => {
  const t = el.dataset.t, a = el.dataset.a, b = num(el.dataset.b) || 0, estilo = eu().estilo || Eu.estilo;
  let modo = TelaMesa.modo || '', motivo = '', bonus = b;
  if (estilo === 'engrenagem') { const aj = ajusteAuto(t === 'ini' ? 'teste' : t, a, el.dataset.p); if (aj.modo && !modo) modo = aj.modo; bonus += aj.pen; motivo = aj.motivo; }
  const rot = t === 'ini' ? 'Iniciativa' : t === 'salv' ? `Salvaguarda de ${a}` : el.dataset.p;
  rolarPublico(`d20${bonus ? sg(bonus).replace('−', '-') : ''}`, rot, { modo, forcarD20: true, tipo: t === 'ini' ? 'iniciativa' : t, motivo });
};
ACT['rl-q'] = el => { TelaMesa.q = clamp((TelaMesa.q || 1) + +el.dataset.d, 1, 20); TelaMesa.rolar(); };
ACT['rl-modo'] = el => { TelaMesa.modo = el.dataset.m; TelaMesa.rolar(); };
ACT['rl-mod'] = el => { TelaMesa.mod = num(el.value) || 0; };
ACT['rl-rot'] = el => { TelaMesa.rot = el.value.trim(); };
ACT['rl-secreta'] = el => { TelaMesa.secreta = el.checked; };
ACT['rl-dado'] = el => {
  const f = +el.dataset.f, q = TelaMesa.q || 1, mod = num(($('#rl-mod') || { value: TelaMesa.mod }).value) || 0, rot = (($('#rl-rot') || {}).value || '').trim();
  const expr = `${q}d${f}${mod ? (mod > 0 ? '+' : '') + mod : ''}`;
  if (souMestre() && TelaMesa.secreta) { const r = f === 20 && q === 1 ? d20(mod, TelaMesa.modo || '') : null, t = r ? r.total : rolar(expr).total; Som.tocar('dado'); return toast(`Rolagem secreta${rot ? ' · ' + esc(rot) : ''}: <b>${t}</b>${r ? ` (d20: ${r.rolagens.join('/')})` : ''}`, { tempo: 8000 }); }
  rolarPublico(expr, rot, { modo: f === 20 && q === 1 ? TelaMesa.modo || '' : '' });
};
ACT['mt-ilha'] = el => { TelaMesa.ilhaSel = el.dataset.id; TelaMesa.ilhas(); };
ACT['som-destravar'] = () => Som2.destravar();
document.addEventListener('toggle', e => { if (e.target && e.target.classList && e.target.classList.contains('som-aj')) Som2.ajAberto = e.target.open; }, true);
ACT['som-pausar'] = () => Som2.alternarPausa();
ACT['som-parar-sfx'] = () => { Som2.pararEfeitos(); toast('Efeitos parados neste aparelho.', { tipo: 'bom' }); };
ACT['som-mudo'] = () => { Som2.mudo = !Som2.mudo; if (Som2.mudo) Som2.pararEfeitos(); Som2.faixaSom(); };
ACT['vol'] = el => Som2.volume(el.dataset.k, parseFloat(el.value));
/* o volume muda enquanto arrasta, não só quando solta */
document.addEventListener('input', e => { const el = e.target; if (el && el.dataset && el.dataset.chg === 'vol') Som2.volume(el.dataset.k, parseFloat(el.value)); });
/* no modo de teste, só a aba que está na frente toca: senão as abas dos jogadores continuam tocando por cima */
if (TESTE) document.addEventListener('visibilitychange', () => {
  const t = Som2.trilha; if (!t || !Som2.atual) return;
  if (document.hidden) t.pause(); else t.play().catch(() => {});
});
ACT['npc-ver'] = el => {
  const n = ((M.mundo && M.mundo.npcs) || []).find(x => x.id === el.dataset.id); if (!n) return;
  const ilha = ((M.mundo && M.mundo.ilhas) || []).find(i => i.id === n.ilha);
  Modal.abrir(`<div class="npc-ficha">${iconeHTML(n.retrato || 'mesa:npc', 128)}<div><h2>${esc(n.nome)}</h2><p class="nota">${[n.papel, n.tipo === 'criatura' ? 'criatura' : '', ilha ? ilha.nome : ''].filter(Boolean).map(esc).join(' · ')}</p>
    <p>${esc(n.descricao || 'Sem descrição ainda.')}</p></div></div>`);
  carregarArquivos($('#modal'));
};

function ondasHTML(k = 2) {
  const o = MANIFEST.anims.ondas; if (!o) return '';
  return `<i class="ondas-faixa a-ondas" style="height:${o.fh * k}px;background-size:${o.fw * o.frames * k}px ${o.fh * k}px;--fim:-${o.fw * o.frames * k}px;animation:sprite 2.6s steps(${o.frames}) infinite"></i>`;
}
VIEWS.mesa = {
  titulo: 'Mesa', icone: 'mesa:d20',
  render() {
    return `<div class="mt ${souMestre() ? 'com-mestre' : ''}">
      <div class="mt-ceu" id="mt-ceu" aria-hidden="true"></div><div class="mt-chuva" id="mt-chuva" hidden aria-hidden="true"></div>
      <section class="mt-centro">
        <div class="mt-quadro" id="mt-quadro"><div class="mt-img" id="mt-img"></div><div class="mt-dado" id="mt-dado" hidden></div></div>
        <div class="mt-rolar caixa" id="mt-rolar"></div>
        <div class="mt-hist caixa" id="mt-hist"></div>
      </section>
      <aside class="mt-lado">
        <section class="caixa" id="mt-ilhas"></section>
        <section class="caixa" id="mt-npcs"></section>
        <section class="caixa" id="mt-cap"></section>
        <section class="caixa mt-som" id="mt-som"></section>
      </aside>
      ${souMestre() ? '<aside class="mt-mestre caixa" id="mt-mestre"></aside>' : ''}
      <div class="mt-ondas" aria-hidden="true">${ondasHTML()}</div>
    </div>`;
  },
  depois() { TelaMesa.todo(); DadoCentral.ver(); },
  ao(ch) {
    if (ch === 'estado') { TelaMesa.ceu(); TelaMesa.quadro(); TelaMesa.cap(); TelaMesa.som(); if (souMestre()) PainelMestre.desenhar(); }
    if (ch === 'mundo') TelaMesa.ilhas();
    if (ch === 'rolagens') TelaMesa.hist();
    if (ch === 'jogadores') { TelaMesa.cap(); if (!souMestre() && !document.activeElement.closest('#mt-rolar')) TelaMesa.rolar(); if (souMestre()) PainelMestre.desenhar(); }
    if (ch === 'arquivos' && souMestre()) PainelMestre.desenhar();
    if (ch === 'segMundo' && souMestre()) PainelMestre.desenhar();
    return false;
  }
};
/* o relógio só muda quando o mestre avança, mas a cena acompanha se a aba ficar aberta virando o dia */
setInterval(() => { if (Mesa.aberta && App.rota === 'mesa') TelaMesa.ceu(); }, 60000);
