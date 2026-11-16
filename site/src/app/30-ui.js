/* ═══════════ casca do site: rotas, cabeçalho, navegação, ações, bandeja de dados ═══════════ */
const VIEWS = {};      // nome → { titulo, icone, render(): html, depois?(raiz) }
const ACT = {};        // data-act → função(el, evento)
const ROTAS = ['mesa', 'combate', 'pdm', 'mural', 'inimigos', 'encontro', 'viagem', 'tesouro', 'barra', 'regras', 'diario', 'ajustes'];
const App = {
  rota: 'mesa',
  ir(r) {
    if (!VIEWS[r] || (typeof Mesa !== 'undefined' && Mesa.aberta && !ROTAS.includes(r))) r = 'mesa';
    const antes = this.rota; this.rota = r;
    if (VIEWS[antes] && VIEWS[antes].sair && antes !== r) VIEWS[antes].sair();
    try { if (location.hash !== '#' + r) history.replaceState(null, '', '#' + r); } catch (e) { location.hash = r; }
    this.render(); window.scrollTo(0, 0);
  },
  render() {
    const main = $('#vista'); if (!main) return;
    const ativo = document.activeElement, id = ativo && ativo.id, sel = ativo && 'selectionStart' in ativo ? [ativo.selectionStart, ativo.selectionEnd] : null;
    const v = VIEWS[this.rota];
    const tranc = typeof liberado === 'function' && Mesa.aberta && !liberado(this.rota);
    main.innerHTML = tranc ? telaTrancada(this.rota) : v.render();
    main.dataset.vista = this.rota;
    if (!tranc && v.depois) v.depois(main);
    if (typeof carregarArquivos === 'function') carregarArquivos(main);
    $$('#nav [data-rota]').forEach(a => a.setAttribute('aria-current', a.dataset.rota === this.rota ? 'page' : 'false'));
    this.topo();
    if (id) { const el = document.getElementById(id); if (el) { el.focus({ preventScroll: true }); if (sel && el.setSelectionRange) try { el.setSelectionRange(sel[0], sel[1]); } catch (e) { /* campo numérico */ } } }
  },
  topo() {
    const s = S(), el = $('#topo-info'); if (!el) return;
    const c = s.combate;
    el.innerHTML = `<span>Sessão <b>${s.sessao}</b></span><span>Arco <b>${esc(s.xp.arco)}</b></span>${c.ativo ? `<span class="em-combate">${ic('tesouro:espada', 32)} Rodada <b>${c.rodada}</b></span>` : ''}`;
    $('#bt-som').setAttribute('aria-pressed', String(!!s.config.som));
    $('#bt-som').title = s.config.som ? 'Som ligado' : 'Som desligado';
  }
};

/* ações globais */
document.addEventListener('click', e => {
  const r = e.target.closest('[data-rota]'); if (r) { e.preventDefault(); Som.tocar('clique'); App.ir(r.dataset.rota); return; }
  const a = e.target.closest('[data-act]'); if (!a || a.disabled) return;
  const f = ACT[a.dataset.act]; if (f) { e.preventDefault(); f(a, e); }
});
document.addEventListener('change', e => { const a = e.target.closest('[data-chg]'); if (a && ACT[a.dataset.chg]) ACT[a.dataset.chg](a, e); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && $('#tela-sobre')) return ACT['tela-sair']();
  if (e.key === 'Escape' && Modal.aberto()) return Modal.fechar();
  const campo = /INPUT|TEXTAREA|SELECT/.test((e.target || {}).tagName || '');
  if (campo) { if (e.key === 'Enter' && e.target.dataset.enter) { e.preventDefault(); const f = ACT[e.target.dataset.enter]; if (f) f(e.target, e); } return; }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); Store.desfazer(); return; }
  if (e.ctrlKey || e.metaKey || e.altKey || Modal.aberto()) return;
  if (e.key === 'd' || e.key === 'D') { e.preventDefault(); Bandeja.alternar(); }
  if (e.key === 'n' && S().combate.ativo) { e.preventDefault(); ACT['cb-prox'](); }
  if (/^[1-9]$/.test(e.key)) {
    // conta só as categorias que estão aparecendo no menu (grupos fechados e abas trancadas ficam de fora)
    const vis = [...document.querySelectorAll('#nav a[href^="#"]')].filter(a => a.offsetParent && !a.classList.contains('trancado'));
    const a = vis[+e.key - 1]; if (a) { e.preventDefault(); App.ir(a.getAttribute('href').slice(1)); }
    return;
  }
  if (e.key === 'm' || e.key === 'M') { if (VIEWS.mesa) { e.preventDefault(); App.ir('mesa'); } return; }
  if (e.key === '?' || e.key === 'h' || e.key === 'H') { e.preventDefault(); ACT['atalhos'](); }
});
window.addEventListener('hashchange', () => { const r = location.hash.slice(1); if (r && r !== App.rota && VIEWS[r]) App.ir(r); });

ACT['desfazer'] = () => Store.desfazer();
ACT['modal-fechar'] = () => Modal.fechar();
ACT['atalhos'] = () => {
  const L = [['1 a 9', 'Abre a categoria daquela posição no menu (conta só as que estão aparecendo)'], ['M', 'Volta para a Mesa'], ['D', 'Abre e fecha a bandeja de dados'], ['N', 'Passa o turno no combate (quando há combate)'], ['Ctrl + Z', 'Desfaz a última mudança'], ['Esc', 'Fecha a janela que estiver aberta'], ['? ou H', 'Mostra esta lista']];
  Modal.abrir(`<h2>Atalhos do teclado</h2><p class="nota">Funcionam quando você não está digitando num campo.</p>
    <table class="tab atalhos">${L.map(([k, t]) => `<tr><td><kbd>${k}</kbd></td><td>${t}</td></tr>`).join('')}</table>
    <div class="lin"><button class="bt" data-act="modal-fechar">Fechar</button></div>`);
};
ACT['som'] = () => { Store.set(s => { s.config.som = !s.config.som; }, null, { semDesfazer: true }); if (S().config.som) Som.tocar('moeda'); };
ACT['tema'] = () => {
  const ordem = ['auto', 'noite', 'dia'], s = S(), i = ordem.indexOf(s.config.tema);
  Store.set(x => { x.config.tema = ordem[(i + 1) % 3]; }, null, { semDesfazer: true });
  aplicarTema(); toast('Tema: ' + { auto: 'igual ao sistema', noite: 'noite no convés', dia: 'dia no mar' }[S().config.tema]);
};
const TEMA_HOST = document.documentElement.getAttribute('data-theme');
function aplicarTema() {
  const t = S().config.tema, r = document.documentElement;
  if (t === 'auto') { if (TEMA_HOST) r.setAttribute('data-theme', TEMA_HOST); else r.removeAttribute('data-theme'); }
  else r.setAttribute('data-theme', t === 'noite' ? 'dark' : 'light');
}
ACT['tela-jogadores'] = () => {
  const url = location.href.split('#')[0] + '#jogadores';
  let w = null; if (!IN_CLAUDE) try { w = window.open(url, 'tela-jogadores', 'width=1280,height=760'); } catch (e) { w = null; }
  if (w) return toast('Tela dos jogadores aberta em outra janela. Leve para a TV ou compartilhe no Discord.');
  Modal.abrir(`<h2>Tela dos jogadores</h2>
    ${IN_CLAUDE ? '<p>Aqui na prévia do Claude a tela não abre em outra janela. No arquivo baixado ela abre: leve a janela para a TV ou compartilhe no Discord.</p>'
      : `<p>Abra este endereço em outra aba ou janela e compartilhe essa aba no Discord (ou leve para a TV):</p>
    <p class="copiavel"><code id="url-tela">${esc(url)}</code></p><p><button class="bt" data-act="copiar" data-alvo="url-tela">Copiar endereço</button></p>
    <p class="nota">A tela atualiza sozinha enquanto você mexe aqui, no mesmo navegador.</p>`}
    <p><button class="bt ouro" data-act="tela-aqui">${ic('mar:luneta', 32)}Ver aqui mesmo (Esc volta)</button></p>`);
};
ACT['tela-aqui'] = () => {
  Modal.fechar(); if ($('#tela-sobre')) return;
  const w = document.createElement('div'); w.id = 'tela-sobre'; w.className = 'tela-sobre';
  w.innerHTML = '<main id="tela" class="tela-jog"></main><button class="bt tela-sair" data-act="tela-sair">Voltar (Esc)</button>';
  document.body.appendChild(w); Tela.base = ''; Tela.ultimo = null; Tela.render();
};
ACT['tela-sair'] = () => { const w = $('#tela-sobre'); if (w) w.remove(); };
ACT['copiar'] = el => {
  const alvo = document.getElementById(el.dataset.alvo); if (!alvo) return;
  const txt = alvo.value != null && alvo.tagName !== 'CODE' ? alvo.value : alvo.textContent;
  const sel = () => { if (alvo.select) { alvo.focus(); alvo.select(); } else { const r = document.createRange(); r.selectNodeContents(alvo); const s = getSelection(); s.removeAllRanges(); s.addRange(r); } toast('Texto selecionado: use Ctrl+C.'); };
  try { navigator.clipboard.writeText(txt).then(() => toast('Copiado.'), sel); } catch (e) { sel(); }
};

/* ───── momentos: aviso grande que some sozinho ───── */
function celebrar(html, ms = 1700) {
  const w = document.createElement('div'); w.className = 'celebra'; w.setAttribute('aria-hidden', 'true');
  w.innerHTML = `<div class="celebra-in">${html}</div>`; document.body.appendChild(w);
  setTimeout(() => w.classList.add('sai'), ms); setTimeout(() => w.remove(), ms + 500);
}
const gaivota = (escala = 1, classe = '') => `<span class="voo ${classe}" aria-hidden="true">${anim('gaivota', escala, { dur: 0.8 })}</span>`;

/* ───── bandeja de dados (tecla D) ───── */
const Bandeja = {
  aberta: false,
  alternar() { this.aberta = !this.aberta; this.desenhar(); },
  desenhar() {
    const b = $('#bandeja'); if (!b) return;
    b.hidden = !this.aberta;
    $('#bt-dados').setAttribute('aria-expanded', String(this.aberta));
    if (!this.aberta) return;
    const hist = S().dados.slice(-12).reverse();
    b.innerHTML = `<div class="band-topo"><h2>Dados</h2><button class="x" data-act="band-fechar" aria-label="Fechar">✕</button></div>
      <div class="band-dados">${[4, 6, 8, 10, 12, 20, 100].map(f => `<button class="dado-bt" data-act="rolar" data-expr="1d${f}"><span>d${f}</span></button>`).join('')}</div>
      <div class="band-d20">
        <button class="bt" data-act="rolar-d20" data-modo="">d20</button>
        <button class="bt bom" data-act="rolar-d20" data-modo="vant">Vantagem</button>
        <button class="bt ruim" data-act="rolar-d20" data-modo="desv">Desvantagem</button>
      </div>
      <form class="band-expr" data-act-form="expr"><label for="expr">Expressão</label>
        <input id="expr" placeholder="2d6+3, 4d12+6, 1d20+5" autocomplete="off" data-enter="rolar-expr">
        <button class="bt" data-act="rolar-expr" type="button">Rolar</button></form>
      <div id="band-res" class="band-res" aria-live="polite">${this.res || '<p class="nota">Clique num dado ou escreva uma expressão.</p>'}</div>
      <ol class="band-hist">${hist.map(h => `<li><span>${esc(h.expr)}</span><b>${h.total}</b><small>${hora(h.t)}</small></li>`).join('')}</ol>
      <p class="nota">Tecla <kbd>D</kbd> abre e fecha. Resultado vai para o diário e, se quiser, para a tela dos jogadores.</p>`;
  },
  mostrar(r, titulo, opts = {}) {
    Som.tocar('dado');
    const ds = r.partes.map(p => p.r.map(v => `<span class="dd${v === p.f ? ' max' : v === 1 ? ' min' : ''}">${v}</span>`).join('')).join('<i>+</i>');
    this.res = `<div class="rolando">${titulo ? `<p class="band-tit">${esc(titulo)}</p>` : ''}<div class="dds">${ds}${r.mod ? `<i>${sg(r.mod)}</i>` : ''}</div><p class="tot">${r.total}</p></div>`;
    S().dados.push({ expr: titulo || r.expr, total: r.total, t: Date.now() }); if (S().dados.length > 80) S().dados.shift();
    Store.save();
    if (opts.publico) Store.set(s => { s.tela.mostrar = { tipo: 'dado', txt: titulo || r.expr, total: r.total, t: Date.now() }; }, null, { semDesfazer: true });
    if (!this.aberta) { this.aberta = true; } this.desenhar();
  }
};
ACT['band-fechar'] = () => { Bandeja.aberta = false; Bandeja.desenhar(); };
ACT['abrir-dados'] = () => Bandeja.alternar();
ACT['rolar'] = el => Bandeja.mostrar(rolar(el.dataset.expr), el.dataset.titulo || el.dataset.expr, { publico: !!el.dataset.publico });
ACT['rolar-expr'] = () => { const v = $('#expr').value.trim(); if (!v) return; const r = rolar(v); if (!r.partes.length && !r.mod) return toast('Não entendi a expressão. Ex.: 2d6+3'); Bandeja.mostrar(r, v); Diario.add(`Rolou ${v}: ${r.total}`, 'dado'); Store.save(); };
ACT['rolar-d20'] = el => {
  const m = el.dataset.modo, r = d20(0, m);
  Som.tocar(r.critico ? 'critico' : r.falha ? 'falha' : 'dado');
  Bandeja.res = `<div class="rolando"><p class="band-tit">d20 ${m === 'vant' ? 'com vantagem' : m === 'desv' ? 'com desvantagem' : ''}</p>
    <div class="dds">${r.rolagens.map(v => `<span class="dd${v === r.nat ? ' usado' : ' fora'}${v === 20 ? ' max' : v === 1 ? ' min' : ''}">${v}</span>`).join('')}</div>
    <p class="tot">${r.nat}</p>${r.critico ? `<p class="selo-crit">${ic('cond2:critico', 64)} 20 natural!</p>` : r.falha ? `<p class="selo-crit ruim">${ic('cond2:falha', 64)} 1 natural</p>` : ''}</div>`;
  S().dados.push({ expr: 'd20' + (m ? ' ' + m : ''), total: r.nat, t: Date.now() }); Store.save(); Bandeja.desenhar();
};

/* peças visuais reaproveitadas */
/* PV e PP em bloquinhos: cada bloco é 1 ponto; com máximo grande, cada bloco vale 2, 5, 10… (no máximo 30 blocos).
   Com opts.act, cada bloco é clicável e põe o valor ali. */
function blocos(v, max, tipo, opts = {}) {
  max = Math.max(0, num(max) || 0); v = num(v) || 0;
  if (!max) return `<div class="barra blocos ${tipo}"><span class="bl-vazio">—</span></div>`;
  const per = [1, 2, 5, 10, 20, 25, 50, 100].find(p => max / p <= 30) || Math.ceil(max / 30);
  const n = Math.ceil(max / per), cheio = Math.max(0, Math.floor(v / per)), meio = v > 0 && v % per ? 1 : 0;
  let h = '';
  for (let i = 0; i < n; i++) {
    const st = i < cheio ? 'on' : (i === cheio && meio ? 'meio' : '');
    const alvo = Math.min(max, (i + 1) * per);
    h += opts.act ? `<button type="button" class="bl ${st}" data-act="${opts.act}" data-k="${tipo}" data-v="${alvo}" title="${tipo.toUpperCase()} ${alvo}" aria-label="${tipo.toUpperCase()} ${alvo}"></button>` : `<i class="bl ${st}"></i>`;
  }
  return `<div class="barra blocos ${tipo} ${opts.variante || ''}" role="meter" aria-valuenow="${v}" aria-valuemin="0" aria-valuemax="${max}" aria-label="${tipo === 'pv' ? 'Vida' : 'Poder'}"${per > 1 ? ` title="cada bloco = ${per}"` : ''}>${h}</div>`;
}
function barra(v, max, tipo) { return blocos(v, max, tipo); }
function chipCond(c, alvo, idx) {
  const d = CONDI[c.n] || { i: '', r: '' };
  return `<button class="cond ${BOAS.includes(c.n) ? 'boa' : ''}" data-act="cond-menu" data-alvo="${alvo}" data-i="${idx}" title="${esc(c.n + ': ' + d.r)}">
    ${ic(d.i, 32)}<span>${esc(c.n)}${c.rod ? ` <small>${c.rod}r</small>` : ''}</span></button>`;
}
function retratoHTML(ref, nome, tam = 64) {
  if (ref && typeof ref === 'object') {   // foto do jogador na mesa online: { arq } enviada, { url } colada, { ic } ícone
    if (ref.arq) return `<img class="foto-j retrato" data-arq="${esc(ref.arq)}" alt="" width="${tam}" height="${tam}">`;
    if (ref.url) return `<img class="foto-j retrato" src="${esc(ref.url)}" alt="" width="${tam}" height="${tam}" referrerpolicy="no-referrer">`;
    if (ref.ic) return ic(ref.ic, tam, 'retrato');
    ref = null;
  }
  if (ref) return ic(ref, tam, 'retrato');
  const ini = String(nome || '?').trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase();
  return `<span class="iniciais" style="width:${tam}px;height:${tam}px">${esc(ini)}</span>`;
}
/* foto dentro da janela do cartaz de procurado (mural, aviso na tela, carta do Grupo).
   Foto enviada ou colada: cobre a janela, com o rosto no terço de cima. Retrato em pixel: inteiro, na altura da janela, no meio.
   Sem nada: as iniciais grandes. ref = foto do jogador ({arq} | {url} | {ic}) ou nome de ícone ('npcs:oficial'). */
function fotoCartaz(ref, nome) {
  if (ref && typeof ref === 'object') {
    if (ref.arq) return `<img class="foto-j cz-img" data-arq="${esc(ref.arq)}" alt="">`;
    if (ref.url) return `<img class="foto-j cz-img" src="${esc(ref.url)}" alt="" referrerpolicy="no-referrer">`;
    ref = ref.ic || null;
  }
  if (ref) { const h = icFit(ref, 'cz-ic'); if (h) return h; }
  const ini = String(nome || '?').trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase();
  return `<span class="cz-ini">${esc(ini)}</span>`;
}
/* tamanho do nome no cartaz: nomes longos encolhem para caber na faixa */
const czLen = t => Math.max(8, String(t || '').length);
function confirmar(msg, sim, opts = {}) {
  Modal.abrir(`<h2>${esc(opts.titulo || 'Tem certeza?')}</h2><p>${msg}</p>
    <div class="linha-bts"><button class="bt ${opts.perigo ? 'ruim' : 'bom'}" id="conf-sim">${esc(opts.ok || 'Sim')}</button><button class="bt" data-act="modal-fechar">Cancelar</button></div>`,
  { onBind: m => { m.querySelector('#conf-sim').addEventListener('click', () => { Modal.fechar(); sim(); }); } });
}
/* janela de condição: escolher e duração */
function escolherCondicao(alvo) {
  Modal.abrir(`<h2>Adicionar condição</h2>
    <label class="campo-inline" for="cond-rod">Dura quantas rodadas? <input id="cond-rod" type="number" min="1" max="99" inputmode="numeric" placeholder="sem limite"></label>
    <div class="grade-cond">${COND.map(c => `<button class="cond-op" data-act="cond-add" data-alvo="${alvo}" data-n="${esc(c.n)}">${ic(c.i, 64)}<b>${esc(c.n)}</b><small>${esc(c.r)}</small></button>`).join('')}</div>`, { classe: 'larga' });
}
