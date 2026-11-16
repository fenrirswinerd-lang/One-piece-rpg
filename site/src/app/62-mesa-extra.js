/* ═══════════ mesa, segunda versão: tabuleiro de ilhas (com NPCs de cada ilha), painéis que cada um liga e desliga,
   imagem em tela cheia, dado mais caprichado e ondas sem emenda ═══════════ */
const PAINEIS = [['rolar', 'Rolar dados'], ['hist', 'Histórico de rolagens'], ['ilhas', 'Ilhas e NPCs'], ['cap', 'Quem está no comando'], ['som', 'Música e volume'], ['mestre', 'Painel do mestre']];
/* painéis escondidos também são por pessoa, e não por navegador */
TelaMesa.ocultos = new Set();
TelaMesa.chaveOcultos = () => 'mt-ocultos-' + (Eu.uid || 'anon');
TelaMesa.carregarOcultos = function () {
  if (this._ocDe === Eu.uid) return;
  this._ocDe = Eu.uid;
  try { this.ocultos = new Set(JSON.parse(lembrar(this.chaveOcultos()) || '[]')); } catch (e) { this.ocultos = new Set(); }
};
function faixaRola(nome, k, dur, cls) {
  const t = (MANIFEST.tiras || {})[nome]; if (!t) return '';
  const w = Math.round(t.w * k), h = Math.round(t.h * k);
  return `<i class="tira-rola ${cls}" style="height:${h}px;background-image:var(--tira-${nome});background-size:${w}px ${h}px;--fim:-${w}px;animation-duration:${dur}s"></i>`;
}
/* enfeites do mar: um cardume passa entre as duas ondas e bolhas sobem de vez em quando.
   Ficam entre a onda de trás e a da frente, então parecem estar dentro da água. Escala inteira (1:1). */
function decoMar() {
  const A = MANIFEST.anims, p = [];
  if (A.cardume) p.push(`<span class="deco deco-cardume">${anim('cardume', 1, { dur: 1.2 })}</span>`);
  if (A.bolhas) p.push(`<span class="deco deco-bolhas" style="left:22%">${anim('bolhas', 1, { dur: 1.4 })}</span>`, `<span class="deco deco-bolhas b2" style="left:71%">${anim('bolhas', 1, { dur: 1.4 })}</span>`);
  return p.join('');
}
function ondasFaixa() {   // duas camadas em velocidades diferentes: dá profundidade e não tem emenda
  const a = faixaRola('ondas_fundo', 1.2, 46, 'on-fundo'), b = faixaRola('ondas_frente', 1.35, 27, 'on-frente');
  if (a || b) return a + decoMar() + b;
  const o = MANIFEST.anims.ondas; if (!o) return '';
  const n = Math.ceil((window.innerWidth || 1600) / (o.fw * 2)) + 2;
  return `<div class="ondas-fila">${Array.from({ length: n }, () => anim('ondas', 2, { dur: 2.4 })).join('')}</div>`;
}
VIEWS.mesa.render = function () {
  TelaMesa.carregarOcultos();
  const oc = TelaMesa.ocultos, sec = (k, cls, extra = '') => `${extra}<section class="caixa ${cls}" id="mt-${k}" data-painel="${k}" ${oc.has(k) ? 'hidden' : ''}></section>`;
  return `<div class="mt ${souMestre() ? 'com-mestre' : ''}">
    <div class="mt-ceu" id="mt-ceu" aria-hidden="true"></div><div class="mt-chuva" id="mt-chuva" hidden aria-hidden="true"></div>
    <section class="mt-centro">
      <div class="mt-quadro" id="mt-quadro"><div class="mt-img" id="mt-img"></div><div class="mt-dado" id="mt-dado" hidden></div>
        <div class="mt-ferr"><button class="bt-ic mini" data-act="jan-trava" id="mt-trava" title="Travar ou soltar as janelas">⇱</button><button class="bt-ic mini" data-act="mt-organizar" title="Escolher o que aparece na tela">☰</button></div></div>
      <div class="mt-rolar caixa" id="mt-rolar" data-painel="rolar" ${oc.has('rolar') ? 'hidden' : ''}></div>
      <div class="mt-hist caixa" id="mt-hist" data-painel="hist" ${oc.has('hist') ? 'hidden' : ''}></div>
    </section>
    <aside class="mt-lado">${sec('ilhas', 'mt-tab')}${sec('cap', '')}${sec('som', 'mt-som')}</aside>
    ${souMestre() ? `<aside class="mt-mestre caixa" id="mt-mestre" data-painel="mestre" ${oc.has('mestre') ? 'hidden' : ''}></aside>` : ''}
    <div class="mt-nuvens" aria-hidden="true">${faixaRola('nuvens', 1.4, 150, 'nv')}${MANIFEST.anims.gaivota ? `<span class="deco deco-gaivota">${anim('gaivota', 1, { dur: 1 })}</span>` : ''}</div>
    <div class="mt-ondas" aria-hidden="true">${ondasFaixa()}</div>
  </div>`;
};
TelaMesa.npcs = () => {};
/* tabuleiro: ilhas descobertas com ícone; as outras escuras, no mesmo formato, com cadeado */
TelaMesa.ilhas = function () {
  const el = $('#mt-ilhas'); if (!el) return;
  const m = M.mundo || {}, atual = souMestre() ? mundoS().atual : m.atual;
  const lista = souMestre() ? mundoS().ilhas.map(i => ({ id: i.id, nome: i.nome || 'Ilha', icone: i.icone, oculta: !i.descoberta })) : (m.ilhas || []);
  const desc = lista.filter(i => !i.oculta).length, semIlha = ((m.npcs || []).filter(n => !n.ilha)).length;
  el.innerHTML = `<h3>${ic('mesa:navio', 32)} Ilhas <small class="ti-cont">${desc} de ${lista.length} descobertas</small></h3>
    ${lista.length ? `<ul class="tab-ilhas">${lista.map(i => { const escondida = i.oculta && !souMestre();
      return `<li class="${i.oculta ? 'oculta' : ''} ${i.id === atual ? 'atual' : ''}"><button data-act="ilha-abrir" data-id="${esc(i.id)}" ${escondida ? 'disabled title="Ainda não descoberta"' : `title="${esc(i.nome)}"`}>
        <span class="ti-ic">${escondida ? ic('mar:ilha', 64, 'silhueta') : iconeHTML(i.icone || 'ilhas:vila', 64, i.oculta ? 'escurecido' : '')}${i.oculta ? `<i class="ti-cad">${ic('mesa:cadeado', 32)}</i>` : ''}</span>
        <span class="ti-nome">${escondida ? '???' : esc(i.nome)}</span>${i.id === atual ? '<small class="ti-aqui">estamos aqui</small>' : ''}</button></li>`; }).join('')}
      ${semIlha ? `<li><button data-act="ilha-abrir" data-id="">${'<span class="ti-ic">' + ic('mesa:navio', 64) + '</span>'}<span class="ti-nome">No mar</span></button></li>` : ''}</ul>`
      : `<p class="nota">${souMestre() ? 'Crie a primeira ilha aqui embaixo. Ela aparece escura, com cadeado, até você descobrir.' : 'Nenhuma ilha no mapa ainda.'}</p>`}
    ${souMestre() ? `<div class="pm-linha"><input id="ilha-nova-nome" class="cresce" placeholder="Nome da nova ilha" maxlength="40" data-enter="ilha-nova"><button class="bt fino" data-act="ilha-nova">+ Ilha</button></div>` : ''}`;
  carregarArquivos(el);
};
ACT['ilha-nova'] = () => {
  const nome = (($('#ilha-nova-nome') || {}).value || '').trim() || 'Ilha nova';
  salvarMundo(s => { s.ilhas.push({ id: novoId(), nome, icone: 'ilhas:vila', mar: S().viagem.mar || 'East Blue', descoberta: false }); });
  toast(`<b>${esc(nome)}</b> criada, escondida. Toque nela para descobrir ou pôr NPCs.`);
};
/* abrir uma ilha: quem vive lá (jogador vê só o que foi liberado; o mestre vê tudo e mexe) */
ACT['ilha-abrir'] = el => abrirIlha(el.dataset.id);
function abrirIlha(id) {
  const m = M.mundo || {}, s = mundoS();
  if (souMestre()) {
    const i = s.ilhas.find(x => x.id === id), npcs = s.npcs.filter(n => (n.ilha || '') === (id || ''));
    Modal.abrir(`<div class="ilha-m"><header>${iconeHTML(i ? i.icone || 'ilhas:vila' : 'mesa:navio', 96, i && !i.descoberta ? 'escurecido' : '')}<div><h2>${esc(i ? i.nome : 'No mar')}</h2>
      ${i ? `<p class="nota">${esc(i.mar || '')} · ${i.descoberta ? 'descoberta' : 'escondida dos jogadores'}${s.atual === id ? ' · vocês estão aqui' : ''}</p>
      <div class="linha-bts"><button class="bt fino ${i.descoberta ? 'bom' : ''}" data-act="im-descobrir" data-id="${id}">${ic(i.descoberta ? 'mesa:cadeado_aberto' : 'mesa:cadeado', 32)} ${i.descoberta ? 'Esconder de novo' : 'Descobrir (avisa todos)'}</button>
        <button class="bt fino" data-act="im-atual" data-id="${id}">${s.atual === id ? 'Sair daqui' : 'Estamos aqui'}</button><button class="bt fino" data-act="im-ic" data-id="${id}">Trocar ícone</button></div>` : ''}</div></header>
      <h3>${ic('mesa:npc', 32)} NPCs e criaturas</h3>
      ${npcs.length ? `<ul class="ilha-npcs">${npcs.map(n => `<li>${iconeHTML(n.retrato || 'mesa:npc', 48)}<span><b>${esc(n.nome)}</b><small>${esc(n.papel || (n.tipo === 'criatura' ? 'criatura' : ''))}</small></span>
        <button class="bt fino ${n.liberado ? 'bom' : ''}" data-act="im-liberar" data-id="${n.id}" data-ilha="${id}">${n.liberado ? 'Conhecido' : 'Escondido'}</button></li>`).join('')}</ul>` : '<p class="nota">Ninguém aqui ainda.</p>'}
      <div class="pm-linha"><input id="im-nome" class="cresce" placeholder="Nome do NPC" maxlength="40"><input id="im-papel" placeholder="Papel (ex.: dono do bar)" maxlength="40">
        <label class="ck-mini"><input type="checkbox" id="im-cri"> criatura</label><label class="ck-mini"><input type="checkbox" id="im-lib" checked> já conhecido</label>
        <button class="bt bom fino" data-act="im-npc" data-ilha="${id}">+ Adicionar</button></div>
      <p class="nota">Retrato, descrição e segredo de cada NPC: em <button class="link" data-act="im-mundo">Mundo</button>.</p></div>`, { classe: 'larga' });
  } else {
    const i = (m.ilhas || []).find(x => x.id === id), npcs = (m.npcs || []).filter(n => (n.ilha || '') === (id || ''));
    const p = npcs.filter(n => n.tipo !== 'criatura'), c = npcs.filter(n => n.tipo === 'criatura');
    const card = n => `<li><button data-act="npc-ver" data-id="${esc(n.id)}">${iconeHTML(n.retrato || 'mesa:npc', 64)}<span><b>${esc(n.nome)}</b><small>${esc(n.papel || '')}</small></span></button></li>`;
    Modal.abrir(`<div class="ilha-m"><header>${iconeHTML(i ? i.icone || 'ilhas:vila' : 'mesa:navio', 96)}<div><h2>${esc(i ? i.nome : 'No mar')}</h2>${i ? `<p class="nota">${esc(i.mar || '')}${m.atual === id ? ' · vocês estão aqui' : ''}</p>` : ''}
      ${i && i.resumo ? `<p>${esc(i.resumo)}</p>` : ''}</div></header>
      <h3>${ic('mesa:npc', 32)} Pessoas conhecidas</h3>${p.length ? `<ul class="npcs-g">${p.map(card).join('')}</ul>` : '<p class="nota">Ninguém conhecido aqui ainda.</p>'}
      ${c.length ? `<h3>${ic('bestiario:rei_mares', 32)} Criaturas</h3><ul class="npcs-g">${c.map(card).join('')}</ul>` : ''}</div>`, { classe: 'larga' });
  }
  carregarArquivos($('#modal'));
}
const reabrir = id => setTimeout(() => abrirIlha(id), 60);
ACT['im-descobrir'] = el => { ACT['mu-descobrir'](el); reabrir(el.dataset.id); };
ACT['im-atual'] = el => { ACT['mu-atual'](el); reabrir(el.dataset.id); };
ACT['im-ic'] = el => { const id = el.dataset.id; escolherIcone(['ilhas', 'mar', 'navios'], ref => { salvarMundo(s => { const i = s.ilhas.find(x => x.id === id); if (i) i.icone = ref; }); reabrir(id); }); };
ACT['im-liberar'] = el => { ACT['mu-liberar'](el); reabrir(el.dataset.ilha); };
ACT['im-npc'] = el => {
  const nome = ($('#im-nome').value || '').trim(); if (!nome) return toast('Escreva o nome.');
  const cri = $('#im-cri').checked, id = el.dataset.ilha || null;
  salvarMundo(s => { s.npcs.unshift({ id: novoId(), nome, papel: $('#im-papel').value.trim(), tipo: cri ? 'criatura' : 'npc', ilha: id, retrato: cri ? 'bestiario:rei_mares' : 'npcs:pescador', liberado: $('#im-lib').checked }); });
  reabrir(el.dataset.ilha);
};
ACT['im-mundo'] = () => { Modal.fechar(); App.ir('mundo'); };

/* organizar a tela: cada um escolhe o que aparece (fica guardado neste aparelho) */
ACT['mt-organizar'] = () => {
  Modal.abrir(`<h2>O que aparece na sua mesa</h2><p class="nota">Fica guardado neste aparelho. O quadro do meio sempre aparece.</p>
    <div class="org-l">${PAINEIS.filter(([k]) => k !== 'mestre' || souMestre()).map(([k, t]) => `<label class="org-i"><input type="checkbox" data-chg="mt-painel" data-k="${k}" ${TelaMesa.ocultos.has(k) ? '' : 'checked'}> ${t}</label>`).join('')}</div>`);
};
ACT['mt-painel'] = el => {
  const k = el.dataset.k; if (el.checked) TelaMesa.ocultos.delete(k); else TelaMesa.ocultos.add(k);
  lembrar(TelaMesa.chaveOcultos(), JSON.stringify([...TelaMesa.ocultos]));
  $$(`[data-painel="${k}"]`).forEach(s => { s.hidden = TelaMesa.ocultos.has(k); });
};

/* imagem: botão de tela cheia para quem estiver vendo; o mestre pode abrir em tela cheia para todos */
const _quadro = TelaMesa.quadro;
TelaMesa.quadro = function () {
  _quadro.call(this);
  const el = $('#mt-img'), im = (M.estado || {}).imagem;
  if (el && im && !el.querySelector('.mt-cheia')) el.insertAdjacentHTML('beforeend', `<button class="mt-cheia bt fino" data-act="img-cheia">⛶ Tela cheia</button>`);
  const cheia = !!(im && im.cheia), chave = im ? im.arq + (cheia ? ':c' : '') : '';
  if (cheia && this.ultCheia !== chave) mostrarImagemCheia();
  if (!cheia && this.ultCheia && $('#palco .img-cheia')) $('#palco').classList.remove('on');
  this.ultCheia = cheia ? chave : '';
};
async function mostrarImagemCheia() {
  const im = (M.estado || {}).imagem; if (!im) return;
  const p = $('#palco'); if (!p) return;
  p.innerHTML = `<div class="img-cheia"><button class="palco-x" data-act="palco-fechar" aria-label="Fechar">×</button><img data-arq="${esc(im.arq)}" alt="${esc(im.legenda || 'Imagem do mestre')}">${im.legenda ? `<p>${esc(im.legenda)}</p>` : ''}</div>`;
  p.classList.add('on'); clearTimeout(Avisos.t); carregarArquivos(p);
}
ACT['img-cheia'] = () => mostrarImagemCheia();
ACT['pm-cheia'] = () => { const im = (M.estado || {}).imagem; if (!im) return toast('Mostre uma imagem primeiro.'); gravarEstado({ imagem: { cheia: !im.cheia } }); };
const _pmQuadro = PainelMestre.quadro;
PainelMestre.quadro = function (e) {
  const h = _pmQuadro.call(this, e), im = e.imagem;
  return im ? h.replace('<div class="pm-bts">', `<div class="pm-bts"><button class="bt fino ${im.cheia ? 'bom' : ''}" data-act="pm-cheia">⛶ ${im.cheia ? 'Tirar da tela cheia' : 'Tela cheia para todos'}</button>`) : h;
};

/* dado: fundo mais escuro, dado maior, número no meio da face e uma plaquinha com quem rolou */
DadoCentral.proximo = function () {
  if (this.ocupado || !this.fila.length) return;
  const r = this.fila.shift(), box = $('#mt-dado');
  if (!box || App.rota !== 'mesa') { toast(`${ic('mesa:d20', 32)} <b>${esc(r.nome)}</b>${r.rot ? ' · ' + esc(r.rot) : ''}: <b>${r.total}</b> <small>(${esc(r.expr)})</small>`); return this.proximo(); }
  this.ocupado = true; Som.tocar('dado');
  const crit = r.nat === 20, falha = r.nat === 1, rapido = this.fila.length > 0, t1 = rapido ? 650 : 1150, t2 = rapido ? 2300 : 4200;
  const q = $('#mt-quadro'), tam = Math.min(3.2, Math.max(1.8, ((q && q.clientHeight) || 400) / 170));
  if (q) q.classList.add('rolando');
  box.hidden = false; box.className = 'mt-dado' + (crit ? ' crit' : '') + (falha ? ' falha' : '');
  const novo = MANIFEST.anims.dado2 && MANIFEST.images.dado_parado, da = MANIFEST.anims.dado2;
  const alt = novo ? Math.round(da.fh * tam) : 0;
  box.innerHTML = `<div class="dd-anim" ${novo ? `style="--dh:${alt}px"` : ''}>${novo
      ? `<span class="dd-rola">${anim('dado2', tam, { umaVez: true, dur: t1 / 1000 })}</span>
         <span class="dd-fim"><img src="${ASSETS[MANIFEST.images.dado_parado.file]}" alt="" draggable="false"></span>`
      : (MANIFEST.anims.dado ? anim('dado', tam, { umaVez: true, dur: t1 / 1000 }) : ic('mesa:d20', 128))}<b class="dd-num">${r.total}</b></div>
    <div class="dd-placa"><p class="dd-quem">${esc(r.nome)}${r.rot ? ` · <span>${esc(r.rot)}</span>` : ''}</p>
    <p class="dd-conta">${esc(r.expr)}${r.dados && r.dados.length ? ` → ${r.dados.join(r.modo ? ' / ' : ' + ')}` : ''}${r.bonus ? ` ${sg(r.bonus)}` : ''}${r.modo ? ` · ${r.modo === 'vant' ? 'vantagem' : 'desvantagem'}` : ''}${r.motivo ? ` · ${esc(r.motivo)}` : ''}</p>
    ${crit ? '<p class="dd-sel">20 natural!</p>' : falha ? '<p class="dd-sel">1 natural…</p>' : ''}</div>`;
  setTimeout(() => {
    box.classList.add('revela'); Som.tocar(crit ? 'critico' : falha ? 'falha' : 'acerto');
    if (crit && MANIFEST.anims.critico) { const e = document.createElement('div'); e.className = 'dd-estrela'; e.innerHTML = anim('critico', tam * 1.6, { umaVez: true, dur: 1.1 }); box.appendChild(e); }
  }, t1);
  setTimeout(() => box.classList.add('some'), t2);
  setTimeout(() => { box.hidden = true; box.className = 'mt-dado'; if (q) q.classList.remove('rolando'); this.ocupado = false; this.proximo(); }, t2 + 450);
};
const _aoMesa = VIEWS.mesa.ao;
VIEWS.mesa.ao = function (ch) { if (ch === 'segMundo' && souMestre()) TelaMesa.ilhas(); return _aoMesa.call(this, ch); };
