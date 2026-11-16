/* ═══════════ LOJAS: cada ilha tem a sua ═══════════
   O mestre monta a loja (o que vende, preço próprio), salva como modelo e abre na mesa quando o grupo chega.
   Os modelos ficam em segredos/lojas (só o mestre). A loja aberta vai para mesa/lojas, já com os preços prontos.
   Catálogo: as tabelas de preço do Livro do Jogador que estão no Escudo (LJ p. 244–255) e as de navio (LJ p. 315–320). */

/* "20.000" → 20000 · "1,5 mi" → 1500000 · "10 mil" → 10000 · "1.200 / 2.000" ou "só construindo" → null (o mestre põe o preço) */
function precoLivro(t) {
  const s = String(t || '').toLowerCase().replace(/\s+/g, ' ').trim();
  if (!s || s.includes('/') || /[a-z]{4,}/.test(s.replace(/\b(mi|mil)\b/g, ''))) return null;
  const m = s.match(/^([\d.,]+)\s*(mi|mil)?$/); if (!m) return null;
  let v = parseFloat(m[1].replace(/\./g, '').replace(',', '.'));
  if (isNaN(v)) return null;
  if (m[2] === 'mi') v *= 1e6; else if (m[2] === 'mil') v *= 1e3;
  return Math.round(v);
}
const slug = t => sem(t).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
const celula = c => typeof c === 'object' && c ? String(c.text || '') : String(c ?? '');

let _catalogo = null;
function catalogo() {
  if (_catalogo) return _catalogo;
  const L = [], E = window.ESCUDO || [];
  const loja = E.find(x => x.id === 'loja');
  (loja ? loja.cartoes : []).forEach(c => {
    c.blocos.filter(b => b.table).forEach(b => {
      const cab = b.table[0].map(celula), iP = cab.findIndex(h => h.includes('฿')), iKg = cab.findIndex(h => /kg/i.test(h));
      let sub = '';
      b.table.slice(1).forEach(r => {
        if (r.length === 1 && typeof r[0] === 'object') { sub = celula(r[0]); return; }   // linha de título (ARMAS CORTANTES…)
        const nome = celula(r[0]); if (!nome) return;
        if (c.titulo.startsWith('Hospedagem')) {   // duas colunas de preço: vira dois itens
          [[1, 'Estalagem (diária)'], [2, 'Estilo de vida (dia)']].forEach(([i, t]) => {
            const livro = celula(r[i]); if (!livro || livro === '—') return;
            L.push({ id: slug(t + ' ' + nome), cat: c.titulo, sub: t, nome: `${t.split(' (')[0]} · ${nome}`, livro, preco: precoLivro(livro), kg: 0, extra: '', fonte: c.fonte });
          });
          return;
        }
        const livro = celula(r[iP >= 0 ? iP : r.length - 1]);
        const extra = cab.length > 3 ? r.slice(1, iP >= 0 ? iP : undefined).map(celula).filter(Boolean).join(' · ') : '';
        L.push({ id: slug(c.titulo + ' ' + nome), cat: c.titulo, sub, nome, livro, preco: precoLivro(livro), kg: iKg >= 0 ? (num(celula(r[iKg]).replace(',', '.')) || 0) : 0, extra, fonte: c.fonte });
      });
    });
  });
  /* navio: compra de navio e armas de navio */
  E.forEach(s => s.cartoes.forEach(c => {
    if (c.titulo !== 'Navios à venda' && c.titulo !== 'Armas de navio') return;
    const t = (c.blocos.find(b => b.table) || {}).table; if (!t) return;
    const cab = t[0].map(celula), iP = cab.findIndex(h => /preço/i.test(h));
    t.slice(1).forEach(r => {
      const nome = (c.titulo === 'Navios à venda' ? 'Navio ' : '') + celula(r[0]), livro = celula(r[iP]);
      L.push({ id: slug('navio ' + nome), cat: 'Navio e armas de navio', sub: c.titulo, nome, livro: /mi$/.test(livro) || /\d/.test(livro) ? livro : livro, preco: precoLivro(livro), kg: 0,
        extra: r.slice(1, iP).map(celula).join(' · '), fonte: c.fonte });
    });
  }));
  /* sem repetir id */
  const vistos = new Set(); _catalogo = L.filter(x => !vistos.has(x.id) && vistos.add(x.id));
  return _catalogo;
}
const catsCatalogo = () => [...new Set(catalogo().map(i => i.cat))];
const icLoja = cat => (typeof ICONES_LOJA !== 'undefined' && ICONES_LOJA[cat]) || (cat.startsWith('Navio') ? 'navios:canhao' : 'itensop:beli_moedas');

/* ───── dados ───── */
const lojasS = () => Object.assign({ lista: {} }, M.segLojas || {});
const lojaAberta = () => (M.lojas || {}).aberta || null;
const verCatalogo = () => (M.lojas || {}).catalogo !== false;
function lojaPronta(id) {   // o que vai para a mesa: só os itens da loja, com o preço final
  const l = lojasS().lista[id]; if (!l) return null;
  const vende = new Set(l.itens || []), precos = l.precos || {};
  const itens = catalogo().filter(i => vende.has(i.id)).map(i => ({ id: i.id, nome: i.nome, cat: i.cat, sub: i.sub || '', livro: i.livro,
    preco: precos[i.id] != null ? precos[i.id] : i.preco, kg: i.kg || 0, extra: i.extra || '' }));
  const ilha = (mundoS().ilhas || []).find(x => x.id === l.ilha);
  return { id, nome: l.nome || 'Loja', icone: l.icone || 'itensop:beli_moedas', ilha: ilha ? ilha.nome : '', notas: l.notas || '', itens, em: Date.now() };
}
const gravarLojas = patch => DB.gravar('segredos/lojas', patch).catch(e => toast('Não deu para salvar a loja: ' + esc(e.code || e.message), { tipo: 'ruim' }));
async function abrirLoja(id) {
  const p = lojaPronta(id); if (!p) return;
  await DB.gravar('mesa/lojas', { aberta: p });
  avisar('loja', `${p.nome}${p.ilha ? ' · ' + p.ilha : ''} abriu`, { icone: p.icone });
  toast(`Loja aberta na mesa: ${esc(p.nome)}`, { tipo: 'bom' });
}
const fecharLoja = () => DB.gravar('mesa/lojas', { aberta: APAGAR }).then(() => toast('Loja fechada.'));

/* ───── tela do mestre ───── */
VIEWS.lojas = {
  titulo: 'Lojas', icone: 'itensop:beli_moedas', chaves: ['segLojas', 'lojas', 'segMundo'], cena: 'cat_loja', editando: null, busca: '',
  ao(ch) { const a = document.activeElement; if (a && /INPUT|TEXTAREA|SELECT/.test(a.tagName) && $('#vista').contains(a)) return false; },
  render() {
    if (!souMestre()) return telaTrancada('Lojas');
    const S2 = lojasS(), ids = Object.keys(S2.lista).sort((a, b) => (S2.lista[b].em || 0) - (S2.lista[a].em || 0)), ab = lojaAberta();
    if (this.editando && S2.lista[this.editando]) return this.editor(this.editando);
    return `<div class="lojas-v"><h1>${ic('itensop:beli_moedas', 64)}Lojas</h1>
      <p class="nota lj-intro">Monte uma loja para cada lugar: o que ela vende e por quanto. Quando o grupo chegar, abra na mesa; ela aparece para todos e na aba de cada jogador, onde ele gasta o Beli. Lojas salvas voltam iguais se o grupo voltar à ilha.</p>
      ${ab ? `<section class="painel-cat lj-aberta">${iconeHTML(ab.icone, 48)}<div class="cresce"><b>Aberta agora: ${esc(ab.nome)}</b><small>${ab.ilha ? esc(ab.ilha) + ' · ' : ''}${ab.itens.length} itens</small></div>
        <button class="bt ruim" data-act="lj-fechar">Fechar loja</button></section>` : ''}
      <section class="painel-cat"><div class="sec-cab"><h2>${ic('itensop:beli_moedas', 32)} Suas lojas</h2><button class="bt bom" data-act="lj-nova">+ Nova loja</button></div>
        ${ids.length ? `<ul class="lj-l">${ids.map(id => { const l = S2.lista[id], il = (mundoS().ilhas || []).find(x => x.id === l.ilha);
          return `<li class="${ab && ab.id === id ? 'on' : ''}">${iconeHTML(l.icone || 'itensop:beli_moedas', 48)}<div class="cresce"><b>${esc(l.nome || 'Loja')}</b><small>${il ? esc(il.nome) + ' · ' : ''}${(l.itens || []).length} itens${Object.keys(l.precos || {}).length ? ` · ${Object.keys(l.precos).length} com preço próprio` : ''}</small></div>
            ${ab && ab.id === id ? '<span class="tag ouro">aberta</span>' : `<button class="bt bom fino" data-act="lj-abrir" data-id="${id}">Abrir na mesa</button>`}
            <button class="bt fino" data-act="lj-editar" data-id="${id}">Editar</button><button class="bt fino" data-act="lj-dup" data-id="${id}">Duplicar</button>
            <button class="bt-ic mini" data-act="lj-apagar" data-id="${id}" title="Apagar">✕</button></li>`; }).join('')}</ul>`
          : '<p class="nota">Nenhuma loja ainda. Crie a primeira: dá para começar de uma loja que vende tudo e ir tirando.</p>'}</section>
      <section class="painel-cat"><label class="ck"><input type="checkbox" data-chg="lj-catalogo" ${verCatalogo() ? 'checked' : ''}> Os jogadores veem a tabela de preços completa do livro</label>
        <p class="nota">Desligue para que eles só saibam o preço do que a loja da ilha vende.</p></section></div>`;
  },
  editor(id) {
    const l = lojasS().lista[id], vende = new Set(l.itens || []), precos = l.precos || {}, q = sem(this.busca || '');
    const ilhas = mundoS().ilhas || [];
    return `<div class="lojas-v lj-ed"><h1>${ic('itensop:beli_moedas', 64)}Editar loja</h1>
      <section class="painel-cat lj-ed-cab">
        <button class="lj-ic" data-act="lj-icone" title="Trocar ícone">${iconeHTML(l.icone || 'itensop:beli_moedas', 64)}</button>
        <div class="cresce form-grade"><label>Nome<input value="${esc(l.nome || '')}" data-chg="lj-campo" data-k="nome" placeholder="Ex.: Ferragens do Tonço" maxlength="40"></label>
          <label>Ilha<select data-chg="lj-campo" data-k="ilha"><option value="">Nenhuma</option>${ilhas.map(i => `<option value="${i.id}" ${l.ilha === i.id ? 'selected' : ''}>${esc(i.nome || 'Ilha')}</option>`).join('')}</select></label>
          <label class="larga">Como é a loja (para você narrar)<textarea rows="2" data-chg="lj-campo" data-k="notas" placeholder="Ex.: balcão grudento, dono anão desconfiado, aceita escambo">${esc(l.notas || '')}</textarea></label></div>
        <div class="lj-ed-bts"><button class="bt bom" data-act="lj-sair">Pronto</button>${lojaAberta() && lojaAberta().id === id ? '' : `<button class="bt fino" data-act="lj-abrir" data-id="${id}">Abrir na mesa</button>`}</div></section>
      <section class="painel-cat"><div class="sec-cab"><h2>O que vende <small>${vende.size} de ${catalogo().length}</small></h2>
        <input type="search" id="lj-busca" placeholder="Buscar item" value="${esc(this.busca || '')}">
        <button class="bt fino" data-act="lj-tudo" data-v="1">Vender tudo</button><button class="bt fino" data-act="lj-tudo" data-v="0">Nada</button></div>
        <p class="nota">Marque o que a loja vende. Para cobrar diferente do livro, escreva o preço ao lado: ilha isolada cobra mais, porto grande faz desconto. Preço vazio = o do livro. Item com preço "a combinar" só vende se você puser um número.</p>
        ${catsCatalogo().map(cat => { const its = catalogo().filter(i => i.cat === cat && (!q || sem(i.nome + ' ' + i.extra).includes(q))); if (!its.length) return '';
          const todos = its.every(i => vende.has(i.id));
          return `<details class="lj-cat" ${q || its.some(i => vende.has(i.id)) ? 'open' : ''}><summary>${ic(icLoja(cat), 32)}<b>${esc(cat)}</b><small>${its.filter(i => vende.has(i.id)).length}/${its.length}</small>
            <label class="ck-mini" onclick="event.stopPropagation()"><input type="checkbox" data-chg="lj-cat" data-cat="${esc(cat)}" ${todos ? 'checked' : ''}> tudo</label></summary>
            <table class="tab lj-tab"><tr><th></th><th>Item</th><th>Livro</th><th>Nesta loja ฿</th></tr>${its.map(i => `<tr class="${vende.has(i.id) ? 'on' : ''}">
              <td><input type="checkbox" data-chg="lj-item" data-id="${i.id}" ${vende.has(i.id) ? 'checked' : ''} aria-label="Vende ${esc(i.nome)}"></td>
              <td>${esc(i.nome)}${i.extra ? `<small>${esc(i.extra)}</small>` : ''}</td><td class="num">${i.preco != null ? fmt(i.preco) : esc(i.livro || '—')}</td>
              <td><input type="number" min="0" step="100" value="${precos[i.id] ?? ''}" placeholder="${i.preco != null ? fmt(i.preco) : 'a combinar'}" data-chg="lj-preco" data-id="${i.id}" style="width:9em"></td></tr>`).join('')}</table></details>`; }).join('')}
        <p class="nota"><small>Fontes: LJ p. 244–255 (itens e serviços) e p. 315–320 (navios e armas de navio).</small></p></section></div>`;
  }
};
const editLoja = () => VIEWS.lojas.editando;
async function mudarLoja(fn, reabrir = true) {
  const id = editLoja(), l = JSON.parse(JSON.stringify(lojasS().lista[id] || {}));
  fn(l); l.em = Date.now();
  await gravarLojas({ lista: { [id]: l } });
  if (reabrir && lojaAberta() && lojaAberta().id === id) { M.segLojas = Object.assign({}, M.segLojas, { lista: Object.assign({}, (M.segLojas || {}).lista, { [id]: l }) }); const p = lojaPronta(id); if (p) DB.gravar('mesa/lojas', { aberta: p }); }
}
ACT['lj-nova'] = async () => {
  const id = novoId();
  await gravarLojas({ lista: { [id]: { nome: 'Loja nova', icone: 'itensop:beli_moedas', ilha: (mundoS().atual || ''), itens: [], precos: {}, notas: '', em: Date.now() } } });
  VIEWS.lojas.editando = id; VIEWS.lojas.busca = ''; App.render();
};
ACT['lj-editar'] = el => { VIEWS.lojas.editando = el.dataset.id; VIEWS.lojas.busca = ''; App.render(); };
ACT['lj-sair'] = () => { VIEWS.lojas.editando = null; App.render(); };
ACT['lj-dup'] = async el => { const l = lojasS().lista[el.dataset.id]; if (!l) return; const id = novoId(); await gravarLojas({ lista: { [id]: Object.assign(JSON.parse(JSON.stringify(l)), { nome: (l.nome || 'Loja') + ' (cópia)', em: Date.now() }) } }); toast('Loja duplicada.'); };
ACT['lj-apagar'] = el => { const l = lojasS().lista[el.dataset.id]; confirmar(`Apagar a loja <b>${esc((l || {}).nome || '')}</b>?`, async () => {
  await gravarLojas({ lista: { [el.dataset.id]: APAGAR } }); if (lojaAberta() && lojaAberta().id === el.dataset.id) fecharLoja(); }, { perigo: true }); };
ACT['lj-abrir'] = el => abrirLoja(el.dataset.id);
ACT['lj-fechar'] = () => fecharLoja();
ACT['lj-catalogo'] = el => DB.gravar('mesa/lojas', { catalogo: !!el.checked });
ACT['lj-campo'] = el => mudarLoja(l => { l[el.dataset.k] = el.value.trim(); });
ACT['lj-icone'] = () => escolherIcone(['itensop', 'tesouro', 'itens', 'mesa', 'navios'], ref => mudarLoja(l => { l.icone = ref; }).then(() => App.render()));
ACT['lj-item'] = el => mudarLoja(l => { const s = new Set(l.itens || []); if (el.checked) s.add(el.dataset.id); else s.delete(el.dataset.id); l.itens = [...s]; });
ACT['lj-cat'] = el => mudarLoja(l => { const s = new Set(l.itens || []); catalogo().filter(i => i.cat === el.dataset.cat).forEach(i => { if (el.checked) s.add(i.id); else s.delete(i.id); }); l.itens = [...s]; }).then(() => App.render());
ACT['lj-tudo'] = el => mudarLoja(l => { l.itens = +el.dataset.v ? catalogo().map(i => i.id) : []; }).then(() => App.render());
ACT['lj-preco'] = el => mudarLoja(l => { l.precos = l.precos || {}; const v = el.value.trim(); if (v === '') delete l.precos[el.dataset.id]; else l.precos[el.dataset.id] = Math.max(0, Math.round(+v || 0)); });
document.addEventListener('input', e => { if (e.target && e.target.id === 'lj-busca') { clearTimeout(VIEWS.lojas.t); VIEWS.lojas.t = setTimeout(() => { VIEWS.lojas.busca = e.target.value; App.render(); const b = $('#lj-busca'); if (b) { b.focus(); b.setSelectionRange(b.value.length, b.value.length); } }, 300); } });

/* ───── a loja aberta, do lado dos jogadores (e do mestre, para conferir) ───── */
function lojaHTML() {
  const ab = lojaAberta(); if (!ab) return '<p class="nota">Nenhuma loja aberta agora.</p>';
  const meu = !souMestre() || (typeof Espiar !== 'undefined' && Espiar.uid), beli = meu ? inv().beli : null;
  const cats = [...new Set(ab.itens.map(i => i.cat))];
  return `<div class="loja lj-aberta-m"><header class="loja-cab">${iconeHTML(ab.icone, 64)}<div><h2>${esc(ab.nome)}</h2>
      <p class="nota">${ab.ilha ? esc(ab.ilha) + ' · ' : ''}${ab.itens.length} itens${ab.notas ? ' · ' + esc(ab.notas) : ''}</p></div>
      ${meu ? `<p class="lj-beli">${ic('itensop:beli_moedas', 32)}<b>${beli == null ? 'Beli não anotado' : '฿ ' + fmt(beli)}</b></p>` : ''}
      <input id="loja-busca" type="search" placeholder="Buscar nesta loja" aria-label="Buscar nesta loja"></header>
    ${ab.itens.length ? `<div class="loja-grade">${cats.map(cat => `<section class="loja-c"><h3>${ic(icLoja(cat), 48)} ${esc(cat)}</h3>
      <ul class="lj-itens">${ab.itens.filter(i => i.cat === cat).map(i => { const kg = i.kg || (pesoLJ(i.nome) || {}).kg; return `<li><div><b>${esc(i.nome)}</b>${i.extra || kg ? `<small>${[i.extra, kg ? kgTxt(kg) + ' kg' : ''].filter(Boolean).map(esc).join(' · ')}</small>` : ''}</div>
        <span class="lj-p">${i.preco != null ? '฿ ' + fmt(i.preco) : 'a combinar'}</span>
        ${meu ? (i.preco != null ? `<button class="bt fino bom" data-act="loja-comprar" data-id="${i.id}">Comprar</button>` : '<small>fale com o mestre</small>') : ''}</li>`; }).join('')}</ul></section>`).join('')}</div>`
      : '<p class="nota">Esta loja ainda não vende nada.</p>'}</div>`;
}
ACT['loja-entrar'] = () => Modal.abrir(lojaHTML(), { classe: 'larga loja-modal' });
ACT['loja-comprar'] = async el => {
  const ab = lojaAberta(), it = ab && ab.itens.find(i => i.id === el.dataset.id); if (!it || it.preco == null) return;
  const i = inv(), p = it.preco;
  if (i.beli != null && i.beli < p) return toast(`Falta Beli: você tem ฿ ${fmt(i.beli)} e isto custa ฿ ${fmt(p)}.`, { tipo: 'ruim' });
  if (i.beli != null) i.beli -= p;
  const ja = i.itens.find(x => x.nome === it.nome);
  if (ja) ja.qtd = (num(ja.qtd) || 0) + 1;
  else i.itens = [...i.itens, itemNovo(it.nome, 1, it.kg || null, { nota: `Comprado em ${ab.nome}`, ic: icLoja(it.cat) })];
  await gravarInv(i, { txt: `Comprou ${it.nome} em ${ab.nome}${ab.ilha ? ' (' + ab.ilha + ')' : ''}`, valor: -p, tipo: 'ruim' });
  toastBeli(-p, it.nome + (i.beli == null ? ' · anote o gasto, seu Beli não está no site' : ''));
  const b = $('.lj-beli b'); if (b && i.beli != null) b.textContent = '฿ ' + fmt(i.beli);
};

/* a mesa mostra a loja aberta: uma plaquinha no canto, para todo mundo */
const _lojaMesaAo = VIEWS.mesa.ao;
VIEWS.mesa.ao = function (ch) { if (ch === 'lojas') { placaLoja(); return false; } return _lojaMesaAo ? _lojaMesaAo.call(this, ch) : undefined; };
function placaLoja() {
  let el = $('#mt-loja'); const ab = lojaAberta();
  if (!ab || App.rota !== 'mesa') { if (el) el.remove(); return; }
  if (!el) { el = document.createElement('button'); el.id = 'mt-loja'; el.className = 'mt-loja'; el.dataset.act = 'loja-entrar'; document.body.appendChild(el); }
  el.innerHTML = `${iconeHTML(ab.icone, 32)}<span><small>Loja aberta</small><b>${esc(ab.nome)}</b></span>`;
  carregarArquivos(el);
}
const _mesaDepoisLoja = VIEWS.mesa.depois;
VIEWS.mesa.depois = function () { if (_mesaDepoisLoja) _mesaDepoisLoja.call(this); placaLoja(); };
const _irLoja = App.ir;
App.ir = function (...a) { const r = _irLoja.apply(this, a); setTimeout(placaLoja, 0); return r; };

/* Lojas entram no menu do mestre, em Preparar */
(() => { const g = NAV.mestre.find(([t]) => t === 'Preparar'); if (g && !g[1].includes('lojas')) g[1].push('lojas'); })();
