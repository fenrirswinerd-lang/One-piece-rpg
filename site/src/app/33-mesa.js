/* ═══════════ a mesa online: estado compartilhado (M), ouvintes do banco, casca do site por papel ═══════════ */
const M = { estado: {}, naval: {}, tatico: {}, mundo: {}, combate: null, trip: {}, navio: {}, navioLog: [], lojas: {}, recompensas: {}, membrosDoc: {}, presenca: {}, jogadores: [], rolagens: [], arquivos: [], bordo: [], jornal: [], capDiario: [],
  privado: null, segMundo: null, segConfig: {} };
const souMestre = () => Eu.papel === 'mestre' && Eu.mestre;
const ONLINE_MS = 150000;
const online = ts => ts && Date.now() - ts < ONLINE_MS;
const NAV = {
  mestre: [['Ao vivo', ['mesa', 'grupo', 'combate']], ['Preparar', ['pdm', 'inimigos', 'encontro', 'mundo', 'arquivos']], ['Para a mesa', ['personagem', 'jornal', 'tripulacao', 'recompensas', 'mural', 'bordo']],
    ['Lore e sessão', ['escudolore', 'guia', 'diario', 'mapa']], ['Regras', ['colinha', 'escudo', 'tabelas', 'catalogo']], ['Mar e progresso', ['viagem', 'tesouro', 'barra']], ['', ['ajustes']]],
  jogador: [['', ['mesa', 'personagem', 'combate', 'bordo', 'jornal', 'tripulacao', 'mural', 'guia', 'catalogo']]]
};
/* abas do mestre que não ocupam lugar no menu: abrem por um botão dentro da aba "irmã" (ver 98-irmas.js) */
const OCULTAS = ['regras', 'encontro', 'lojas', 'navio', 'mural', 'tesouro'];
const TRANCAVEIS = { jornal: 'Jornal', tripulacao: 'Tripulação' };
const liberado = k => souMestre() || !TRANCAVEIS[k] || !!((M.estado.liberado || {})[k]);
const eu = () => (M.jogadores || []).find(j => j.uid === alvoUid()) || {};
/* o mestre pode abrir a aba de um jogador (Abas dos jogadores): aí "eu" vira esse jogador */
const Espiar = { uid: null, parar: null };
const alvoUid = () => (souMestre() && Espiar.uid) || Eu.uid;
/* QUEM ESTÁ NA MESA. O mestre tira um jogador (Ajustes, Grupo ou Abas dos jogadores) e ele some de TODAS as abas:
   M.jogadoresTodos = tudo que está no banco; M.jogadores = só quem está na mesa (é o que todas as abas usam).
   Sai quem não tem mais o e-mail liberado, ou quem está na lista "fora" (config/membros.fora = [uid]). */
const jogAtivo = j => {
  const d = M.membrosDoc || {}, em = d.emails, mail = String(j.email || '').toLowerCase();
  if ((d.fora || []).includes(j.uid)) return false;
  return !Array.isArray(em) || !mail || mail === MESTRE_EMAIL || em.map(x => String(x).toLowerCase()).includes(mail);
};
function filtrarJogadores() { M.jogadores = (M.jogadoresTodos || []).filter(j => jogAtivo(j) || j.uid === Eu.uid); }
const fichaDe = j => { if (!j || !j.fichaJson) return null; try { return JSON.parse(j.fichaJson); } catch (e) { return null; } };
const nomeJ = j => { if (!j) return 'Jogador'; const f = fichaDe(j); return (f && (f.personagem || f.jogador)) || j.personagem || j.nome || 'Jogador'; };

const Mesa = {
  subs: [], aberta: false, ouv: new Set(), timerVisto: null,
  on(f) { this.ouv.add(f); },
  mudou(ch) { this.ouv.forEach(f => { try { f(ch); } catch (e) { console.error(e); } }); },
  parar() {
    this.subs.forEach(u => { try { u(); } catch (e) { /* já parado */ } }); this.subs = []; this.aberta = false;
    clearInterval(this.timerVisto); if (window.Som2) Som2.parar();
  },
  falha(p, e) { console.warn('ouvinte', p, e); if (/permission/.test((e && e.code) || '')) toast(`Sem permissão para ler <b>${esc(p)}</b>. Confira se as regras novas do banco foram publicadas.`, { tipo: 'ruim', tempo: 9000 }); },
  ouvir(p, ch, fn) { this.subs.push(DB.ouvir(p, d => { M[ch] = fn ? fn(d) : (d || {}); this.mudou(ch); }, e => this.falha(p, e))); },
  ouvirLista(p, o, ch) { this.subs.push(DB.ouvirLista(p, o, l => { M[ch] = l; this.mudou(ch); }, e => this.falha(p, e))); },
  abrir() {
    this.parar(); this.aberta = true;
    document.body.className = souMestre() ? 'papel-mestre' : 'papel-jogador';
    ROTAS.length = 0; NAV[souMestre() ? 'mestre' : 'jogador'].forEach(([, rs]) => ROTAS.push(...rs)); if (souMestre()) ROTAS.push(...OCULTAS);
    montarCasca();
    this.ouvir('mesa/estado', 'estado');
    this.ouvir('mesa/mundo', 'mundo');
    this.ouvir('mesa/combate', 'combate', d => d);
    this.ouvir('mesa/tripulacao', 'trip');
    this.ouvir('mesa/navio', 'navio');
    this.ouvirLista('mesa/navio/mudancas', { ordem: 'em', desc: true, max: 30 }, 'navioLog');
    this.ouvir('mesa/lojas', 'lojas');
    this.ouvir('mesa/recompensas', 'recompensas');
    this.ouvir('mesa/presenca', 'presenca');
    this.ouvir('mesa/naval', 'naval');   // batalha naval publicada pelo mestre: os jogadores só olham
    this.ouvir('mesa/tatico', 'tatico');   // mapa de combate publicado pelo mestre: os jogadores só olham
    this.subs.push(DB.ouvir('config/membros', d => { M.membrosDoc = d || {}; filtrarJogadores(); this.mudou('membrosDoc'); this.mudou('jogadores'); }, e => this.falha('config/membros', e)));
    this.subs.push(DB.ouvirLista('jogadores', null, l => { M.jogadoresTodos = l; filtrarJogadores(); this.mudou('jogadores'); }, e => this.falha('jogadores', e)));
    this.ouvirLista('rolagens', { ordem: 'em', desc: true, max: 30 }, 'rolagens');
    this.ouvirLista('arquivos', null, 'arquivos');
    this.ouvirLista('mesa/bordo/entradas', { ordem: 'em', desc: true, max: 80 }, 'bordo');
    this.ouvirLista('mesa/jornal/noticias', { ordem: 'em', desc: true, max: 40 }, 'jornal');
    this.ouvirLista('mesa/capitao/entradas', { ordem: 'em', desc: true, max: 60 }, 'capDiario');
    if (souMestre()) { this.ouvir('segredos/mundo', 'segMundo', d => d); this.ouvir('segredos/config', 'segConfig'); this.ouvir('segredos/lojas', 'segLojas', d => d || {}); Sincronia.iniciar(); }
    else this.ouvir(`jogadores/${Eu.uid}/privado/notas`, 'privado', d => d || {});
    const visto = () => { if (document.visibilityState !== 'visible') return; (souMestre() ? DB.gravar('mesa/presenca', { mestre: Date.now() }) : DB.gravar('jogadores/' + Eu.uid, { visto: Date.now() })).catch(() => {}); };
    visto(); this.timerVisto = setInterval(visto, 60000);
    const h = location.hash.slice(1);
    App.ir(VIEWS[h] && ROTAS.includes(h) ? h : 'mesa');
  }
};

/* cada mudança do banco: avisos, som, e redesenho só das telas que se importam com aquela parte */
Mesa.on(ch => {
  if (!Mesa.aberta) return;
  if (ch === 'estado' || ch === 'jogadores' || ch === 'presenca') App.topo();
  if (ch === 'estado') { Avisos.ver(); montarNav(); }
  if (ch === 'naval' || ch === 'tatico') montarNav();   // a aba aparece ou some para o jogador quando o mestre liga a chave
  const v = VIEWS[App.rota]; if (!v) return;
  if (v.ao && v.ao(ch) === false) return;
  if ((v.chaves || []).includes(ch)) App.render();
});

/* ───── casca: cabeçalho, navegação, palco das animações ───── */
const raiz = () => document.getElementById('raiz') || document.body;
function montarCasca() {
  raiz().innerHTML = `
  <a class="pular" href="#vista">Pular para o conteúdo</a>
  <header class="topo" id="topo">
    <div class="topo-in">
      <div class="marca" id="topo-marca"></div>
      <div class="topo-bts">
        <div class="quem-on" id="quem-on" aria-label="Quem está na mesa"></div>
        ${souMestre() ? `<button class="bt-ic" data-act="desfazer" title="Desfazer (Ctrl+Z)" aria-label="Desfazer">↶</button>` : ''}
        <button class="bt-ic ora-bt" data-rota="oraculo" title="Pergunte ao livro: tire uma dúvida de regra (tecla P)" aria-label="Pergunte ao livro">?</button>
        <button class="bt-ic" id="bt-som" data-act="som" aria-label="Som" aria-pressed="true">♪</button>
        <button class="bt-ic" data-act="tema" title="Trocar tema (noite, dia, sistema)" aria-label="Tema">☾</button>
        ${souMestre() ? `<button class="bt-ic dados" id="bt-dados" data-act="abrir-dados" title="Dados secretos do mestre (tecla D)" aria-expanded="false">${ic('mesa:d20', 32)}<span>Dados</span></button>` : ''}
        <button class="bt-ic eu-bt" data-act="eu-menu" title="Sua conta">${Eu.foto ? `<img src="${esc(Eu.foto)}" alt="" width="32" height="32" referrerpolicy="no-referrer">` : ic(souMestre() ? 'modos:capitao' : 'mesa:npc', 32)}</button>
      </div></div>
    <nav id="nav" aria-label="Partes da mesa"></nav>
  </header>
  <div id="cena-fundo" class="cena-fundo" aria-hidden="true"></div>
  <main id="vista" tabindex="-1"></main>
  <aside id="bandeja" class="bandeja" hidden></aside>
  <div id="palco" class="palco" aria-live="polite"></div>
  <div id="toasts" class="toasts" aria-live="polite"></div>`;
  montarNav(); App.topo(); medirTopo();
}
/* altura do cabeçalho: o menu lateral do mestre começa logo abaixo dele */
function medirTopo() { const t = document.body.classList.contains('nav-lado') ? $('.topo-in') : $('.topo'); if (t) document.documentElement.style.setProperty('--topo-h', (t.offsetHeight + 4) + 'px'); }
window.addEventListener('resize', () => { if (Mesa.aberta) medirTopo(); });
/* preferências de cada pessoa: menu em cima ou do lado, grupos do menu recolhidos */
const PrefNav = {
  k: n => 'nav-' + n + '-' + (Eu.uid || 'anon'),
  lado() { const v = lembrar(this.k('lado')); return v == null ? souMestre() : v === '1'; },
  fechados() { try { return new Set(JSON.parse(lembrar(this.k('fechados')) || '[]')); } catch (e) { return new Set(); } },
  aplicar() { document.body.classList.toggle('nav-lado', this.lado()); document.body.classList.toggle('nav-cima', !this.lado()); }
};
function montarNav() {
  const nav = $('#nav'); if (!nav) return;
  PrefNav.aplicar();
  const fech = PrefNav.fechados(), lado = PrefNav.lado();
  nav.innerHTML = NAV[souMestre() ? 'mestre' : 'jogador'].map(([g, rs]) => {
    const fechado = g && lado && fech.has(g);
    const links = rs.filter(r => VIEWS[r] && (!VIEWS[r].visivel || VIEWS[r].visivel())).map(r => {
      const v = VIEWS[r], tranc = !liberado(r);
      return `<a href="#${r}" data-rota="${r}" class="${tranc ? 'trancado' : ''}" title="${esc(v.titulo)}${tranc ? ' (trancado pelo mestre)' : ''}">${ic(v.icone, 32, tranc ? 'silhueta' : '')}<span>${esc(v.titulo)}</span>${tranc ? ic('mesa:cadeado', 20, 'nav-cad') : ''}</a>`;
    }).join('');
    return `<div class="nav-g ${fechado ? 'fechado' : ''}">${g ? `<button class="nav-t" data-act="nav-grupo" data-g="${esc(g)}" aria-expanded="${!fechado}" title="${lado ? 'Recolher ou abrir este grupo' : ''}">${g}${lado ? `<i class="nav-seta">${fechado ? '▸' : '▾'}</i>` : ''}</button>` : ''}${links}</div>`;
  }).join('');
  $$('#nav [data-rota]').forEach(a => a.setAttribute('aria-current', a.dataset.rota === App.rota ? 'page' : 'false'));
  if (typeof medirTopo === 'function') requestAnimationFrame(medirTopo);
}
ACT['nav-grupo'] = el => {
  if (!PrefNav.lado()) return;
  const f = PrefNav.fechados(), g = el.dataset.g;
  if (f.has(g)) f.delete(g); else f.add(g);
  lembrar(PrefNav.k('fechados'), JSON.stringify([...f]));
  montarNav();
};
ACT['nav-lado'] = el => {
  lembrar(PrefNav.k('lado'), el.dataset.v);
  montarNav(); App.render();
  $$('.pref-nav .bt').forEach(b => b.classList.toggle('on', b.dataset.v === el.dataset.v));
};

/* cabeçalho: sessão, relógio, capitão, quem está online */
function sessaoInfo() { const e = M.estado || {}; return { n: (e.sessao && e.sessao.n) || 1, nome: (e.sessao && e.sessao.nome) || 'Mary Geoise', icone: (e.sessao && e.sessao.icone) || '' }; }
function iconeHTML(ref, tam = 32, extra = '') {   // ref: 'folha:nome' ou { arq: id }
  if (!ref) return '';
  if (typeof ref === 'object' && ref.arq) return `<img class="ico-arq ${extra}" data-arq="${esc(ref.arq)}" alt="" width="${tam}" height="${tam}">`;
  return ic(ref, tam, extra);
}
/* imagens guardadas no banco: troca data-arq pelo endereço local depois de baixar (com cache) */
function carregarArquivos(raizEl = document) {
  $$('img[data-arq]:not([src])', raizEl).forEach(async im => { const u = await Arquivos.url(im.dataset.arq); if (u) im.src = u; else im.classList.add('sem-arq'); });
}
const _topo = App.topo;
App.topo = function () {
  if (!Mesa.aberta) return _topo.call(App);
  const m = $('#topo-marca'); if (!m) return;
  const si = sessaoInfo(), r = Relogio.agora();
  m.innerHTML = `${si.icone ? iconeHTML(si.icone, 48, 'sessao-ic') : anim('bandeira', 1)}<div>${souMestre() ? `<button class="titulo ses-bt" data-act="ses-editar" title="Mudar número, nome e ícone da sessão">Sessão ${si.n} · ${esc(si.nome)} <span class="ses-lapis">✎</span></button>` : `<p class="titulo">Sessão ${si.n} · ${esc(si.nome)}</p>`}
    <p class="sub" id="topo-info">${souMestre() && S().combate.ativo ? `<span class="em-combate">${ic('tesouro:espada', 32)} Rodada <b>${S().combate.rodada}</b></span>` : (M.combate && M.combate.ativo ? `<span class="em-combate">${ic('tesouro:espada', 32)} Combate · rodada <b>${M.combate.rodada}</b></span>` : '')}</p></div>
    <div class="relogio ${r.periodo === 'noite' ? 'noite' : ''}" id="topo-relogio" title="Dia ${r.dia}, ${r.hh}, ${esc(r.periodo)}${r.clima ? ', ' + esc(r.clima) : ''}">
      <span class="rl-ic">${ic(Relogio.icone(), 44)}</span>
      <span class="rl-txt"><b class="rl-h">${r.hh}</b><small>Dia ${r.dia} · ${esc(r.periodo)}</small></span></div>`;
  carregarArquivos(m);
  const on = $('#quem-on');
  if (on) {
    const js = (M.jogadores || []).filter(j => online(j.visto)), mestre = online((M.presenca || {}).mestre);
    on.innerHTML = (mestre ? `<span class="on-p mestre" title="Mestre online">${ic('modos:capitao', 32)}</span>` : '') + js.map(j => `<span class="on-p" title="${esc(nomeJ(j))} online">${fotoJ(j, 32)}</span>`).join('');
    carregarArquivos(on);
  }
  const bs = $('#bt-som'); if (bs) { bs.setAttribute('aria-pressed', String(!!S().config.som)); bs.title = S().config.som ? 'Som ligado' : 'Som desligado'; }
};
/* foto do jogador: enviada no site (arquivo) > link colado > retrato de ícone > iniciais */
function fotoJ(j, tam = 64) {
  if (!j) return retratoHTML(null, '?', tam);
  if (j.foto && j.foto.arq) return `<img class="foto-j" data-arq="${esc(j.foto.arq)}" alt="" width="${tam}" height="${tam}">`;
  if (j.foto && j.foto.url) return `<img class="foto-j" src="${esc(j.foto.url)}" alt="" width="${tam}" height="${tam}" referrerpolicy="no-referrer">`;
  if (j.foto && j.foto.ic) return ic(j.foto.ic, tam, 'retrato');
  return retratoHTML(null, nomeJ(j), tam);
}

ACT['eu-menu'] = () => {
  const j = eu();
  Modal.abrir(`<h2>${esc(Eu.nome)}</h2><p class="nota">${esc(Eu.email)} · entrou como <b>${souMestre() ? 'mestre' : 'jogador'}</b>${TESTE ? ' · modo de teste' : ''}</p>
    ${!souMestre() ? `<h3>Seu estilo de jogo</h3><div class="estilos mini">${Object.entries(ESTILOS).map(([k, e]) => `<button class="estilo-c ${(j.estilo || Eu.estilo) === k ? 'on' : ''}" data-act="eu-estilo" data-e="${k}">${ic(e.icone, 64)}<b>${e.nome}</b><small>${e.sub}</small></button>`).join('')}</div>
      <p class="nota" id="estilo-expl">${ESTILOS[j.estilo || Eu.estilo].muda.join(' ')}</p>` : ''}
    <h3>Menu das categorias</h3><div class="pref-nav linha-bts">
      <button class="bt fino ${PrefNav.lado() ? '' : 'on'}" data-act="nav-lado" data-v="0">Em cima</button>
      <button class="bt fino ${PrefNav.lado() ? 'on' : ''}" data-act="nav-lado" data-v="1">Do lado</button></div>
    <p class="nota">Do lado, cada grupo do menu fecha com um clique no nome dele. Vale só para você.</p>
    ${!souMestre() ? `<h3>Abas do menu</h3><div class="pref-todas linha-bts"><button class="bt fino ${PrefNav.todas && PrefNav.todas() ? '' : 'on'}" data-act="nav-todas" data-v="0">Enxutas</button><button class="bt fino ${PrefNav.todas && PrefNav.todas() ? 'on' : ''}" data-act="nav-todas" data-v="1">Todas</button></div>
    <p class="nota">Enxutas: Navio e Banco abrem por dentro da Tripulação, Procurados pelo Jornal, Catálogo pelo Pergunte ao livro.</p>` : ''}
    <div class="modal-bts"><button class="bt fino" data-act="novidades">Novidades</button><button class="bt fino" data-act="atalhos">Atalhos do teclado (?)</button>${Eu.mestre ? `<button class="bt" data-act="eu-trocar">${souMestre() ? 'Entrar como jogador' : 'Entrar como mestre'}</button>` : ''}<button class="bt fino" data-act="s-sair">Sair da conta</button></div>`);
};
ACT['eu-estilo'] = async el => {
  const k = el.dataset.e; Eu.estilo = k;
  await DB.gravar('jogadores/' + Eu.uid, { estilo: k });
  $$('.estilos.mini .estilo-c').forEach(b => b.classList.toggle('on', b.dataset.e === k));
  const ex = $('#estilo-expl'); if (ex) ex.textContent = ESTILOS[k].muda.join(' ');
  toast(`Estilo: ${ESTILOS[k].nome} (${ESTILOS[k].sub}).`); App.render();
};
ACT['eu-trocar'] = () => {
  Modal.fechar();
  const novo = souMestre() ? 'jogador' : 'mestre';
  if (novo === 'jogador' && !Eu.membro) return toast('Libere seu próprio e-mail em Ajustes › Jogadores para entrar como jogador.', { tipo: 'ruim', tempo: 7000 });
  Sessao.escolher(novo);
};
/* categoria ainda trancada pelo mestre: silhueta preta, estilo peça de Lego */
function telaTrancada(r) {
  const v = VIEWS[r] || {};
  return `<div class="tela-trancada">${ic(v.icone || 'mesa:cadeado', 128)}<h1>${esc(v.titulo || 'Trancado')}</h1>
    <p>${ic('mesa:cadeado', 32)} O mestre ainda não liberou esta parte. Quando ele liberar, o Den Den Mushi toca para todo mundo.</p></div>`;
}
