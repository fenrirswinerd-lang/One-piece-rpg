/* ═══════════ polimento: o fundo de cada página, a loja com busca ═══════════ */
const CENAS = { grupo: 't_conves', combate: 'cat_combate', inimigos: 'cat_inimigos', encontro: 'cat_inimigos', mundo: 'cat_mundo', arquivos: 'cat_arquivos', jornal: 'cat_jornal',
  tripulacao: 'cat_tripulacao', recompensas: 'cat_recompensas', bordo: 'cat_bordo', escudo: 't_estudo', regras: 't_estudo', viagem: 'cat_viagem', tesouro: 'cat_tesouro', barra: 't_estudo',
  diario: 'cat_bordo', guia: 'cat_guia', ajustes: 't_cabine', npcs: 'cat_mundo',
  mural: 'cat_mural', catalogo: 'cat_catalogo', tabelas: 'cat_tabelas', escudolore: 'cat_guia', mapa: 'cat_guia' };
/* a placa do título muda conforme a área, para dar para saber onde se está pelo canto do olho */
const PLACAS = { mesa: 'madeira', grupo: 'madeira', combate: 'madeira', inimigos: 'metal', encontro: 'metal', mundo: 'metal', arquivos: 'metal',
  personagem: 'papel', jornal: 'papel', tripulacao: 'papel', recompensas: 'papel', bordo: 'papel' };
Object.entries(CENAS).forEach(([r, c]) => { if (VIEWS[r]) VIEWS[r].cena = c; });
VIEWS.personagem.cena = () => { const p = profDe(minhaFicha())[0]; return p ? p.info[2] : 't_quarto'; };
const _renderBase = App.render;
App.render = function () { _renderBase.call(this); aplicarCena(); };
function aplicarCena() {
  const el = $('#cena-fundo'); if (!el) return;
  const v = VIEWS[App.rota] || {}, c = typeof v.cena === 'function' ? v.cena() : v.cena;
  const cls = 'cena-fundo' + (c ? ' c-' + c : '');
  if (el.className !== cls) el.className = cls;
  document.body.dataset.placa = PLACAS[App.rota] || 'corda';
}

/* loja: tabelas do livro em cartões, com busca por item */
const ICONES_LOJA = { 'Armas corpo a corpo e munição': 'tesouro:espada', 'Armas de fogo e especiais': 'navios:canhao', 'Propriedades': 'modos:regras', 'Hospedagem e estilo de vida': 'ilhas:canais',
  'Comida e bebida': 'itensop:carne', 'Raridade e serviços': 'itensop:beli_notas', 'Kits e ferramentas': 'itens:kit_medico', 'Prender e capturar': 'itensop:kairoseki',
  'Navegação e Den-Den Mushi': 'itensop:log_pose', 'Exploração e química': 'itens:lanterna' };
ACT['inv-precos'] = () => {
  const s = (window.ESCUDO || []).find(x => x.id === 'loja'); if (!s) return toast('Tabela da loja não encontrada.');
  Modal.abrir(`<div class="loja"><header class="loja-cab">${MANIFEST.anims.moedas ? anim('moedas', 1, { umaVez: true, dur: 1.2 }) : ic('itensop:beli_moedas', 64)}
      <div><h2>Loja e preços</h2><p class="nota">Preços do Livro do Jogador, em Beli. Profissionais com graduação pagam menos nos itens da profissão.</p></div>
      <input id="loja-busca" type="search" placeholder="Buscar (ex.: kit médico, pistola, rum)" aria-label="Buscar na loja"></header>
    <nav class="chips loja-nav">${s.cartoes.map((c, i) => `<button class="chip" data-act="loja-ir" data-i="${i}">${ic(ICONES_LOJA[c.titulo] || 'itensop:beli_moedas', 32)} ${esc(c.titulo)}</button>`).join('')}</nav>
    <div class="loja-grade">${s.cartoes.map((c, i) => `<section class="loja-c" id="loja-${i}"><h3>${ic(ICONES_LOJA[c.titulo] || 'itensop:beli_moedas', 48)} ${esc(c.titulo)}</h3>
      ${cartaoEscudoHTML(c).replace(/^<h3>.*?<\/h3>/, '')}</section>`).join('')}</div></div>`, { classe: 'larga loja-modal' });
};
ACT['loja-ir'] = el => { const s = $('#loja-' + el.dataset.i); if (s) s.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
document.addEventListener('input', e => {
  if (!e.target || e.target.id !== 'loja-busca') return;
  const q = sem(e.target.value);
  $$('.loja-c').forEach(sec => {
    let algum = !q || sem(sec.querySelector('h3').textContent).includes(q);
    $$('tr', sec).forEach((tr, i) => { if (!tr.querySelector('td')) return; const ok = !q || sem(tr.textContent).includes(q); tr.hidden = !ok && !algum; if (ok) algum = true; });
    $$('li', sec).forEach(li => { const ok = !q || sem(li.textContent).includes(q); li.hidden = !ok; if (ok) algum = true; });
    sec.hidden = !algum;
  });
});

/* ───── texto solto em cima do fundo pintado ─────
   Em vez de adivinhar quais textos ficam sem cartão atrás, a página mede: sobe pelos pais de cada
   texto até #vista e vê se algum tem fundo (cor com opacidade, imagem ou border-image). Se nenhum
   tiver, o texto está direto em cima da cena e ganha a faixa escura (.solto). */
const Solto = {
  temFundo(el) {
    const c = getComputedStyle(el);
    if (c.backgroundImage !== 'none' || (c.borderImageSource && c.borderImageSource !== 'none')) return true;
    const m = /rgba?\(([^)]+)\)/.exec(c.backgroundColor); if (!m) return false;
    const p = m[1].split(',').map(Number); return p.length < 4 || p[3] > 0.45;
  },
  marcar() {
    const v = $('#vista'); if (!v) return;
    const cache = new Map();
    const coberto = el => {
      for (let e = el.parentElement; e && e !== v; e = e.parentElement) {
        if (cache.has(e)) return cache.get(e);
        if (Solto.temFundo(e)) { cache.set(e, true); return true; }
      }
      return false;
    };
    v.querySelectorAll('p, h2, h3, label, summary, li, small').forEach(el => {
      if (el.classList.contains('solto') || el.closest('.solto, h1, .bt, button, .modal')) return;
      if (!el.textContent.trim() || !el.offsetParent || Solto.temFundo(el)) return;
      if (el.parentElement.closest('p, h2, h3, label, summary, li')) return;   // marca só o bloco de fora
      if (!coberto(el)) el.classList.add('solto');
    });
  },
  ligar() {
    const v = $('#vista'); if (!v || Solto.v === v) return;
    if (Solto.obs) Solto.obs.disconnect();
    Solto.v = v; let pend = 0;
    Solto.obs = new MutationObserver(() => { if (pend) return; pend = requestAnimationFrame(() => { pend = 0; Solto.marcar(); }); });
    Solto.obs.observe(v, { childList: true, subtree: true });
    Solto.marcar();
  }
};
/* liga na primeira vez que uma página é desenhada (e de novo se o #vista for trocado) */
const _renderSolto = App.render;
App.render = function (...a) { const r = _renderSolto.apply(this, a); Solto.ligar(); return r; };

/* ───── menu de cima: a aba aberta fica sempre à vista, e a rodinha do mouse rola as abas de lado ───── */
function navMostrarAtiva() { const n = $('#nav'); if (!n || n.scrollWidth <= n.clientWidth + 4) return; const a = n.querySelector('a[aria-current="page"]'); if (!a) return;
  const r = a.getBoundingClientRect(), c = n.getBoundingClientRect(); if (r.left < c.left + 8) n.scrollLeft += r.left - c.left - 24; else if (r.right > c.right - 8) n.scrollLeft += r.right - c.right + 24; }
window.addEventListener('hashchange', () => setTimeout(navMostrarAtiva, 80));
window.addEventListener('load', () => setTimeout(navMostrarAtiva, 1200));
document.addEventListener('wheel', e => { const n = e.target.closest && e.target.closest('#nav'); if (!n || !document.body.classList.contains('nav-cima') || n.scrollWidth <= n.clientWidth + 4 || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; n.scrollLeft += e.deltaY; e.preventDefault(); }, { passive: false });
