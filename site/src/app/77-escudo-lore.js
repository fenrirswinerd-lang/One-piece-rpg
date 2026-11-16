/* ═══════════ ESCUDO DE LORE (só o mestre) ═══════════
   Cópia do Notion "Escudo do Mestre" dentro do site. Os textos vêm de data/lore_notion.json (window.LORE),
   então funcionam mesmo sem Notion e sem Claude. Tudo que o mestre mexe fica salvo na mesa (estado.lore)
   e aparece igual em todas as janelas abertas (dá para deixar uma janela só com o escudo no 2º monitor).

   Abas: Agora (cena da vez + bolso + pendências) · Arcos (visão geral, cenas, gente) · Rápido (faíscas: nome, conflito, gancho…)
         · Notas (cartões seus, com botão para copiar e levar ao chat de lore).
   Arcos, cenas e pessoas novas: o mestre cria sem precisar de ninguém (botões "+"). Ao atualizar o Notion, é só
   regravar data/lore_notion.json: arcos novos aparecem sozinhos (as cenas trazem o nome do arco). */
const EL = { aba: 'agora', arco: '', res: {}, tema: 'porto', abertos: new Set(), papel: '', hist: [] };
const elEstado = () => (M.estado || {}).lore || {};
const EL_ST = ['Não jogada', 'Em jogo', 'Jogada'];
const EL_CAT = ['Cena', 'Pessoa', 'Lugar', 'Gancho', 'Segredo', 'Regra', 'Nota'];
const EL_ABAS = [['agora', 'Agora', 'tesouro:livro'], ['arcos', 'Arcos', 'modos:wiki'], ['rapido', 'Rápido', 'mesa:d20'], ['notas', 'Notas', 'status:notas']];
const elLi = l => (l || []).map(t => `<li>${esc(t)}</li>`).join('');
const elPick = a => a[Math.floor(Math.random() * a.length)];
const elSlug = t => sem(t).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/* ───── dados: arcos, cenas e gente (os do Notion + os que o mestre cria) ───── */
function elArcos() {
  const L = window.LORE || {}, s = elEstado(), base = (L.arcos || []).map(a => Object.assign({}, a));
  // arco que aparece nas cenas do Notion mas ainda não tem página de resumo: nasce sozinho
  const cobertos = new Set(base.flatMap(a => a.notion || []));
  [...new Set((L.cenas || []).map(c => c.arco))].filter(a => !cobertos.has(a)).forEach(a => {
    const nome = String(a).replace(/^\d+\s*/, '') || a;
    base.push({ id: 'n-' + elSlug(a), nome, emoji: '🧭', notion: [a], lugar: nome, resumo: '', destaques: [] });
  });
  const meus = Object.entries(s.arcos || {}).filter(([, a]) => a && a.nome).sort((a, b) => (a[1].em || 0) - (b[1].em || 0))
    .map(([id, a]) => ({ id, nome: a.nome, emoji: a.emoji || '🧭', resumo: a.resumo || '', destaques: [], notion: [], lugar: '', propria: true }));
  return base.concat(meus);
}
const elCenaDe = (id, x) => ({ id, cena: x.t, tam: '', entrega: x.tx, fixo: '', regra: '', arco: x.arco || '', propria: true });
const elPessoaDe = (id, x) => ({ id, nome: x.t, papel: 'Minha', lugar: '', traco: x.tx, frase: '', propria: true });
function elCenasDe(a) {
  const L = window.LORE || {}, ex = elEstado().extras || {};
  const feitas = (L.cenas || []).filter(c => (a.notion || []).includes(c.arco)).sort((x, y) => x.ordem - y.ordem);
  const minhas = Object.entries(ex).filter(([, x]) => x && x.cat === 'Cena' && x.arco === a.id).sort((x, y) => (x[1].em || 0) - (y[1].em || 0)).map(([id, x]) => elCenaDe(id, x));
  return feitas.concat(minhas);
}
function elGenteDe(a) {
  const L = window.LORE || {}, ex = elEstado().extras || {};
  const feitos = a.lugar ? (L.elenco || []).filter(e => e.lugar === a.lugar) : [];
  const meus = Object.entries(ex).filter(([, x]) => x && x.cat === 'Pessoa' && x.arco === a.id).map(([id, x]) => elPessoaDe(id, x));
  return feitos.concat(meus);
}
const elStDe = id => ((elEstado().cenas || {})[id] || {}).st || EL_ST[0];
function elProxima() {
  const L = window.LORE || {}, todas = (L.cenas || []).slice().sort((a, b) => a.ordem - b.ordem);
  const i = todas.findIndex(c => elStDe(c.id) === 'Em jogo'), j = i >= 0 ? i : todas.findIndex(c => elStDe(c.id) !== 'Jogada');
  return { atual: j >= 0 ? todas[j] : null, depois: j >= 0 ? todas.slice(j + 1).find(c => elStDe(c.id) !== 'Jogada') || null : null };
}
const elArcoDaCena = c => { const a = elArcos().find(x => (x.notion || []).includes(c.arco)); return a ? a.id : ''; };
const elNomeArco = id => { const a = elArcos().find(x => x.id === id); return a ? a.nome : ''; };

/* ───── peças de tela ───── */
function elPin(id) { return `<button class="el-pin ${elEstado().fix && elEstado().fix[id] ? 'on' : ''}" data-act="el-fixar" data-id="${esc(id)}" title="Fixar na aba Agora" aria-label="Fixar">📌</button>`; }
function elCena(c, forca) {
  const est = (elEstado().cenas || {})[c.id] || {}, st = est.st || EL_ST[0], i = EL_ST.indexOf(st), nota = est.nota || '', aberto = !!forca || EL.abertos.has(c.id);
  return `<article class="el-row el-item el-cena st-${i} ${aberto ? 'aberta' : ''}" data-busca="${esc([c.cena, c.entrega, c.regra, c.fixo].join(' '))}">
    <header><button class="chip el-st" data-act="el-status" data-id="${esc(c.id)}" title="Clique para mudar: não jogada → em jogo → jogada">${esc(st)}</button>
      <button class="el-tit" data-act="el-abrir" data-id="${esc(c.id)}" aria-expanded="${aberto}"><b>${esc(c.cena)}</b>${aberto ? '' : `<span class="el-ent">${esc(c.entrega)}</span>`}</button>
      ${nota && !aberto ? '<span class="el-tem-nota" title="Tem nota">📝</span>' : ''}${elPin(c.id)}</header>
    ${aberto ? `<div class="el-corpo"><p><span class="el-rot">Lembrar</span> ${esc(c.entrega)}</p>
      ${c.regra ? `<p class="el-regra"><span class="el-rot">Regra</span> ${esc(c.regra)}</p>` : ''}
      <textarea class="el-nota" rows="${nota ? 2 : 1}" placeholder="Nota desta cena (o que aconteceu, o que prometeram)" data-chg="el-cnota" data-id="${esc(c.id)}" aria-label="Nota da cena">${esc(nota)}</textarea>
      ${c.propria ? `<button class="link" data-act="el-nota-del" data-id="${esc(c.id)}">apagar esta cena</button>` : ''}</div>` : ''}</article>`;
}
function elPessoa(e) {
  return `<article class="el-card el-item el-pessoa papel-${esc(e.papel)}" data-busca="${esc([e.nome, e.traco, e.lugar, e.papel, e.frase].join(' '))}">
    <header><b>${esc(e.nome)}</b><small class="el-tam">${esc(e.papel)}${e.lugar ? ' · ' + esc(e.lugar) : ''}</small>${elPin(e.id)}</header>
    <p>${esc(e.traco)}</p>${e.frase ? `<p class="el-frase">${esc(e.frase)}</p>` : ''}${e.propria ? `<button class="link" data-act="el-nota-del" data-id="${esc(e.id)}">apagar</button>` : ''}</article>`;
}
function elDecisao(d) {
  const st = ((elEstado().dec || {})[d.id] || {}).st || d.status;
  return `<article class="el-card el-item el-dec ${st === 'Decidido' ? 'ok' : ''}" data-busca="${esc([d.cod, d.decisao, d.opcoes, d.rec].join(' '))}">
    <header><b>${esc(d.cod)}</b> <span>${esc(d.decisao)}</span>${elPin(d.id)}</header>
    <button class="chip el-st" data-act="el-dec" data-id="${esc(d.id)}" title="Clique para mudar">${esc(st)}</button>
    <p><span class="el-rot">Opções</span> ${esc(d.opcoes)}</p><p><span class="el-rot">Recomendação</span> ${esc(d.rec)}</p></article>`;
}
function elNota(id, x) {
  const arco = x.arco ? elNomeArco(x.arco) : '';
  return `<article class="el-card el-item el-propria" data-busca="${esc([x.t, x.tx, x.cat, arco].join(' '))}"><header><b>${esc(x.t)}</b><small class="el-tam">${esc(x.cat || 'Nota')}${arco ? ' · ' + esc(arco) : ''}</small>${elPin(id)}</header>
    ${x.tx ? `<p>${esc(x.tx).replace(/\n/g, '<br>')}</p>` : ''}<button class="link" data-act="el-nota-del" data-id="${esc(id)}">apagar</button></article>`;
}
function elCartao(id) {
  const L = window.LORE || {}, ex = (elEstado().extras || {})[id];
  const c = (L.cenas || []).find(x => x.id === id); if (c) return elCena(c);
  const e = (L.elenco || []).find(x => x.id === id); if (e) return elPessoa(e);
  const d = (L.decisoes || []).find(x => x.id === id); if (d) return elDecisao(d);
  if (ex) return ex.cat === 'Cena' ? elCena(elCenaDe(id, ex)) : ex.cat === 'Pessoa' ? elPessoa(elPessoaDe(id, ex)) : elNota(id, ex);
  return '';
}
const elAbertas = () => (window.LORE.decisoes || []).filter(d => (((elEstado().dec || {})[d.id] || {}).st || d.status) !== 'Decidido');

/* ───── sorteios (aba Rápido) ───── */
const elGer = () => (window.LORE || {}).gerador || { nomes: {}, listas: {} };
const elMeus = k => Object.values(((elEstado().ger || {})[k]) || {});
const elItens = k => ((elGer().listas[k] || {}).itens || []).concat(elMeus(k));
const EL_TEMAS = [['porto', 'Porto'], ['louca', 'Louça'], ['nobre', 'Nobre'], ['marinha', 'Marinha'], ['pirata', 'Pirata'], ['clandestino', 'Revolução']];
function elNome(tema) {
  const N = elGer().nomes || {}, t = N[tema];
  if (tema === 'meus') { const m = elMeus('nome'); return m.length ? elPick(m) : ''; }
  if (!t) return '';
  if (tema === 'marinha') return `${elPick(t.postos)} ${elPick(t.sobrenomes)}`;
  if (tema === 'pirata') return `${elPick(t.primeiros)} “${elPick(t.apelidos)}”`;
  if (tema === 'clandestino') return elPick(t.codinomes);
  const p = elPick(t.primeiros);
  return tema === 'nobre' && Math.random() < 0.25 ? `Saint ${p}` : `${p} ${elPick(t.sobrenomes)}`;
}
const EL_TIPO_DE = { nome: 'Pessoa', pessoa: 'Pessoa', oficio: 'Pessoa', traco: 'Pessoa', segredo: 'Segredo', conflito: 'Gancho', gancho: 'Gancho', sentido: 'Lugar', pergunta: 'Nota' };
function elColRes() {
  const r = Colinha.res; if (!r) return '';
  return `<div class="col-res">${r.i ? ic(r.i, 64) : ''}<div><small>${esc(r.rot)}</small><b>${esc(r.t)}</b>${r.x ? `<p>${esc(r.x)}</p>` : ''}</div></div>`;
}
function elRapido() {
  const G = elGer(), temas = EL_TEMAS.concat(elMeus('nome').length ? [['meus', 'Meus']] : []), R = EL.res;
  const bt = (k, rot) => `<button class="bt" data-act="el-rolar" data-k="${k}">${ic('mesa:d20', 32)} ${rot}</button>`;
  const gdr = k => `<button class="bt fino" data-act="el-guardar" data-k="${k}" title="Guardar como cartão na aba Notas">Guardar</button>`;
  const nome = R.nome ? `<div class="el-res"><b class="el-res-nome">${esc(R.nome)}</b>${gdr('nome')}${EL.hist.length ? `<small class="nota">antes: ${EL.hist.map(esc).join(' · ')}</small>` : ''}</div>` : '';
  const listas = Object.entries(G.listas || {}).map(([k, l]) => `<article class="el-card el-ger"><header><b>${esc(l.rot)}</b><small class="el-tam">${elItens(k).length} opções</small></header>
    ${bt(k, 'Rolar')}${R[k] ? `<div class="el-res"><p>${esc(R[k])}</p>${gdr(k)}</div>` : ''}</article>`).join('');
  const gn = EL.abertos.has('gn');
  return `<div class="el-rapido">
    <section class="el-ger destaque"><h2>Nome</h2><p class="nota">Só uma faísca para você continuar. Escolha o tipo de nome:</p>
      <div class="chips">${temas.map(([k, n]) => `<button class="chip ${EL.tema === k ? 'on' : ''}" data-act="el-tema" data-k="${k}">${n}</button>`).join('')}</div>
      <div class="linha-bts">${bt('nome', 'Rolar nome')}</div>${nome}</section>
    <h2>Faíscas, uma de cada vez</h2><div class="el-grade">${listas}</div>
    <section class="el-ger"><h2>Do Guia do Narrador <button class="bt fino" data-act="el-abrir" data-id="gn">${gn ? 'esconder' : 'mostrar'}</button></h2>
      ${gn ? `<p class="nota">Nomes de livro, encontro no mar, tesouro e os pacotes de ideias (aventura, complicação, PdN). Só você vê.</p>
      <div class="col-geradores"><button class="bt" data-act="col-rolar" data-t="nome" data-g="1">Pirata</button><button class="bt" data-act="col-rolar" data-t="nome" data-g="2">Marinheiro</button><button class="bt" data-act="col-rolar" data-t="nome" data-g="3">Civil</button>
        <button class="bt" data-act="col-rolar" data-t="mar">Encontro no mar (d10)</button><button class="bt" data-act="col-rolar" data-t="tesouro">Tesouro (d100)</button></div>${elColRes()}${ideiasHTML()}` : ''}</section>
    <section class="el-ger"><h2>Minhas listas</h2><p class="nota">Acrescente nomes, traços e conflitos seus. Eles entram no sorteio.</p>
      <div class="linha-bts"><select id="el-gk" aria-label="Lista"><option value="nome">Nome completo</option>${Object.entries(G.listas || {}).map(([k, l]) => `<option value="${k}">${esc(l.rot)}</option>`).join('')}</select>
        <input id="el-gt" type="text" placeholder="Escreva um item" aria-label="Item"><button class="bt bom" data-act="el-ger-add">Adicionar</button><button class="bt fino" data-act="el-ger-ver">Ver e apagar os meus</button></div></section></div>`;
}

/* ───── a tela ───── */
VIEWS.escudolore = {
  titulo: 'Escudo de lore', icone: 'tesouro:livro', chaves: ['estado'],
  render() {
    if (!souMestre()) return '<section class="el"><p class="nota">Só o mestre vê o escudo de lore.</p></section>';
    document.body.classList.toggle('el-solo', window.name === 'escudolore');
    const L = window.LORE || { cenas: [], elenco: [], decisoes: [], bolso: {} }, s = elEstado(), B = L.bolso || {}, arcos = elArcos();
    const abertas = elAbertas().length;
    let corpo = '';
    if (EL.aba === 'agora') {
      const { atual, depois } = elProxima(), fix = Object.keys(s.fix || {}).filter(id => s.fix[id] && elCartao(id));
      const emp = EL.res.empurrao;
      corpo = `<div class="el-agora"><section><h2>Cena da vez</h2>${atual ? elCena(atual, true) : '<p class="nota">Todas as cenas estão jogadas.</p>'}
          ${depois ? `<p class="el-prox"><span class="el-rot">Depois</span> ${esc(depois.cena)}</p>` : ''}
          <h2>Fixados <small class="nota">(botão 📌 em qualquer cartão)</small></h2><div class="el-grade">${fix.length ? fix.map(elCartao).join('') : '<p class="nota">Nada fixado ainda.</p>'}</div></section>
        <aside class="el-bolso">
          <div class="el-bl"><h3>Regras de bolso</h3><ul>${elLi(B.regras)}</ul></div>
          <div class="el-bl"><h3>Não esquecer</h3><ul>${elLi(B.lembrar)}</ul></div>
          <div class="el-bl"><h3>Se travar <button class="bt fino" data-act="el-empurrao">Sortear um</button></h3>${emp ? `<p class="el-res-nome">${esc(emp)}</p>` : ''}<ul>${elLi(B.empurroes)}</ul></div>
          <div class="el-bl falta"><h3>Antes de sentar, falta</h3><ul>${elLi(B.antes)}</ul></div>
          <div class="el-bl"><h3>Em aberto na lore (${abertas}) <button class="bt fino" data-act="el-abrir" data-id="pend">${EL.abertos.has('pend') ? 'esconder' : 'ver'}</button></h3>${EL.abertos.has('pend') ? elAbertas().map(elDecisao).join('') : ''}</div></aside></div>`;
    } else if (EL.aba === 'arcos') {
      const prox = elProxima().atual, daVez = prox ? elArcoDaCena(prox) : '';
      const a = arcos.find(x => x.id === EL.arco) || arcos.find(x => x.id === daVez) || arcos[0];
      const info = x => { const cs = elCenasDe(x), ok = cs.filter(c => elStDe(c.id) === 'Jogada').length; return { cs, ok, tot: cs.length }; };
      if (!a) corpo = '<p class="nota">Nenhum arco ainda. Crie o primeiro.</p>';
      else {
        const { cs, ok, tot } = info(a), gente = elGenteDe(a);
        const outras = Object.entries(s.extras || {}).filter(([, x]) => x && x.arco === a.id && x.cat !== 'Cena' && x.cat !== 'Pessoa').sort((x, y) => (y[1].em || 0) - (x[1].em || 0));
        corpo = `<div class="chips el-arcos">${arcos.map(x => { const i = info(x); return `<button class="chip ${x.id === a.id ? 'on' : ''}" data-act="el-arco" data-a="${esc(x.id)}">${esc(x.emoji)} ${esc(x.nome)} <small>${i.ok}/${i.tot}</small></button>`; }).join('')}
          <button class="chip novo" data-act="el-arco-novo">＋ Novo arco</button></div>
          <section class="el-arco"><header class="el-arco-cab"><h2>${esc(a.emoji)} ${esc(a.nome)}</h2><div class="el-prog" title="${ok} de ${tot} cenas jogadas"><i style="width:${tot ? Math.round(100 * ok / tot) : 0}%"></i></div><small>${ok}/${tot} jogadas</small>
            ${a.propria ? `<button class="link" data-act="el-arco-editar" data-id="${esc(a.id)}">editar</button><button class="link" data-act="el-arco-apagar" data-id="${esc(a.id)}">apagar arco</button>` : ''}</header>
          ${a.resumo ? `<p class="el-resumo">${esc(a.resumo)}</p>` : '<p class="nota">Sem resumo ainda. Use “editar” para escrever em uma ou duas frases do que o arco trata.</p>'}
          ${(a.destaques || []).length ? `<div class="el-dest">${a.destaques.map(d => `<div class="el-bl"><h3>${esc(d.t)}</h3><p>${esc(d.tx)}</p></div>`).join('')}</div>` : ''}
          <h3 class="el-sub">Cenas <button class="bt fino" data-act="el-add" data-a="${esc(a.id)}" data-t="Cena">＋ cena</button></h3>
          <div class="el-lista">${cs.map(c => elCena(c)).join('') || '<p class="nota">Nenhuma cena.</p>'}</div>
          <h3 class="el-sub">Gente deste arco <button class="bt fino" data-act="el-add" data-a="${esc(a.id)}" data-t="Pessoa">＋ pessoa</button></h3>
          <div class="el-grade">${gente.map(elPessoa).join('') || '<p class="nota">Ninguém ainda.</p>'}</div>
          <h3 class="el-sub">Notas, ganchos e segredos <button class="bt fino" data-act="el-add" data-a="${esc(a.id)}" data-t="Nota">＋ nota</button></h3>
          <div class="el-grade">${outras.map(([id, x]) => elNota(id, x)).join('') || '<p class="nota">Nada ainda.</p>'}</div></section>`;
      }
    } else if (EL.aba === 'rapido') corpo = elRapido();
    else {
      const ex = Object.entries(s.extras || {}).sort((a, b) => (b[1].em || 0) - (a[1].em || 0));
      corpo = `<section class="el-novo"><h2>Novo cartão</h2><div class="linha-bts"><input id="el-nt" type="text" placeholder="Título (ex.: Quem é o dono do cais?)" aria-label="Título"><select id="el-nc" aria-label="Tipo">${EL_CAT.map(c => `<option>${c}</option>`).join('')}</select>
        <select id="el-na" aria-label="Arco"><option value="">Sem arco</option>${arcos.map(a => `<option value="${esc(a.id)}" ${a.id === EL.arco ? 'selected' : ''}>${esc(a.nome)}</option>`).join('')}</select></div>
        <textarea id="el-nx" rows="3" placeholder="O que você quer lembrar" aria-label="Texto"></textarea><div class="linha-bts"><button class="bt bom" data-act="el-nota-add">Guardar cartão</button><button class="bt ouro" data-act="el-copiar-notas">Copiar tudo para mandar ao chat de lore</button></div></section>
        <div class="el-grade">${ex.map(([id, x]) => elNota(id, x)).join('') || '<p class="nota">Nenhum cartão seu ainda. Use para ideias novas, pessoas que os jogadores inventaram e ganchos soltos. Cenas e pessoas guardadas aqui também aparecem no arco escolhido.</p>'}</div>`;
    }
    return `<section class="el"><header class="col-cab"><h1>${ic('tesouro:livro', 64)}Escudo de lore</h1>
      <p class="nota">Cópia do Notion de ${esc(L.atualizado || '')}. O que você marca aqui fica salvo na mesa e aparece igual em todas as janelas abertas.</p>
      <div class="linha-bts"><button class="bt ouro" data-act="el-janela">Abrir em outra janela (2º monitor)</button>${EL.aba !== 'rapido' ? '<input id="el-busca" type="search" placeholder="Buscar nesta aba" aria-label="Buscar">' : ''}${window.name === 'escudolore' ? '<button class="bt fino" data-act="el-solo-sair">Mostrar o menu do site</button>' : ''}</div></header>
      <nav class="chips el-abas">${EL_ABAS.map(([k, n, i]) => `<button class="chip ${EL.aba === k ? 'on' : ''}" data-act="el-aba" data-k="${k}">${ic(i, 32)} ${n}</button>`).join('')}</nav>${corpo}</section>`;
  }
};

/* ───── ações ───── */
ACT['el-aba'] = el => { EL.aba = el.dataset.k; App.render(); };
ACT['el-arco'] = el => { EL.arco = el.dataset.a; App.render(); };
ACT['el-papel'] = el => { EL.papel = el.dataset.p; App.render(); };
ACT['el-tema'] = el => { EL.tema = el.dataset.k; App.render(); };
ACT['el-abrir'] = el => { const id = el.dataset.id; EL.abertos.has(id) ? EL.abertos.delete(id) : EL.abertos.add(id); App.render(); };
ACT['el-fixar'] = el => { const id = el.dataset.id, on = !(elEstado().fix || {})[id]; gravarEstado({ lore: { fix: { [id]: on ? 1 : APAGAR } } }); };
ACT['el-status'] = el => { const id = el.dataset.id; gravarEstado({ lore: { cenas: { [id]: { st: EL_ST[(EL_ST.indexOf(elStDe(id)) + 1) % 3] } } } }); };
ACT['el-dec'] = el => { const id = el.dataset.id, d = (window.LORE.decisoes || []).find(x => x.id === id), atual = ((elEstado().dec || {})[id] || {}).st || d.status; gravarEstado({ lore: { dec: { [id]: { st: atual === 'Decidido' ? 'Em aberto' : 'Decidido' } } } }); };
ACT['el-cnota'] = el => gravarEstado({ lore: { cenas: { [el.dataset.id]: { nota: el.value } } } });
ACT['el-empurrao'] = () => { const l = (window.LORE.bolso || {}).empurroes || []; if (!l.length) return; EL.res.empurrao = elPick(l); Som.tocar('dado'); App.render(); };

function elSalvar(cat, arco, t, tx) { gravarEstado({ lore: { extras: { [novoId()]: { t: t || 'Sem título', tx: tx || '', cat, arco: arco || '', em: Date.now() } } } }); }
ACT['el-nota-add'] = () => {
  const t = ($('#el-nt').value || '').trim(), tx = ($('#el-nx').value || '').trim(); if (!t && !tx) return toast('Escreva um título ou um texto.');
  elSalvar($('#el-nc').value, $('#el-na').value, t, tx); toast('Cartão guardado.', { tipo: 'bom' });
};
ACT['el-nota-del'] = el => confirmar('Apagar este cartão?', () => gravarEstado({ lore: { extras: { [el.dataset.id]: APAGAR }, cenas: { [el.dataset.id]: APAGAR }, fix: { [el.dataset.id]: APAGAR } } }));

/* arcos novos */
const elFormArco = (a, id) => `<h2>${id ? 'Editar arco' : 'Novo arco'}</h2><div class="el-form">
  <label>Nome<input id="ea-n" type="text" value="${esc((a || {}).nome || '')}" placeholder="Ex.: Ilha dos Relógios"></label>
  <label>Símbolo (um emoji)<input id="ea-e" type="text" maxlength="4" value="${esc((a || {}).emoji || '🧭')}"></label>
  <label>Resumo em uma ou duas frases<textarea id="ea-r" rows="4" placeholder="Do que o arco trata e como termina">${esc((a || {}).resumo || '')}</textarea></label>
  <button class="bt bom" data-act="el-arco-salvar" data-id="${esc(id || '')}">${id ? 'Salvar' : 'Criar arco'}</button></div>`;
ACT['el-arco-novo'] = () => Modal.abrir(elFormArco(null, ''));
ACT['el-arco-editar'] = el => Modal.abrir(elFormArco((elEstado().arcos || {})[el.dataset.id], el.dataset.id));
ACT['el-arco-salvar'] = el => {
  const n = ($('#ea-n').value || '').trim(); if (!n) return toast('Dê um nome ao arco.');
  const id = el.dataset.id || novoId(), atual = (elEstado().arcos || {})[id] || {};
  gravarEstado({ lore: { arcos: { [id]: { nome: n, emoji: ($('#ea-e').value || '🧭').trim(), resumo: ($('#ea-r').value || '').trim(), em: atual.em || Date.now() } } } });
  EL.arco = id; EL.aba = 'arcos'; Modal.fechar();
};
ACT['el-arco-apagar'] = el => confirmar('Apagar este arco? Os cartões dele continuam na aba Notas.', () => { EL.arco = ''; gravarEstado({ lore: { arcos: { [el.dataset.id]: APAGAR } } }); });
ACT['el-add'] = el => Modal.abrir(`<h2>Adicionar ao arco ${esc(elNomeArco(el.dataset.a))}</h2><div class="el-form">
  <label>Tipo<select id="ex-c">${EL_CAT.map(c => `<option ${c === el.dataset.t ? 'selected' : ''}>${c}</option>`).join('')}</select></label>
  <label>Título<input id="ex-t" type="text" placeholder="Nome da cena, da pessoa ou da ideia"></label>
  <label>Texto<textarea id="ex-x" rows="4" placeholder="O que entregar, o que lembrar"></textarea></label>
  <button class="bt bom" data-act="el-add-salvar" data-a="${esc(el.dataset.a)}">Guardar</button></div>`);
ACT['el-add-salvar'] = el => {
  const t = ($('#ex-t').value || '').trim(), tx = ($('#ex-x').value || '').trim(); if (!t && !tx) return toast('Escreva um título ou um texto.');
  elSalvar($('#ex-c').value, el.dataset.a, t, tx); Modal.fechar(); toast('Guardado no arco.', { tipo: 'bom' });
};

/* sorteios */
ACT['el-rolar'] = el => {
  const k = el.dataset.k, R = EL.res;
  if (k === 'pessoa') { R.pessoa = { nome: elNome(EL.tema), oficio: elPick(elItens('oficio')), traco: elPick(elItens('traco')), segredo: elPick(elItens('segredo')) }; R.nome = ''; }
  else if (k === 'nome') { const n = elNome(EL.tema); if (!n) return toast('Ainda não há nomes seus. Adicione em “Minhas listas”.'); if (R.nome) EL.hist = [R.nome, ...EL.hist].slice(0, 4); R.nome = n; R.pessoa = null; }
  else { const l = elItens(k); if (!l.length) return; R[k] = elPick(l); }
  Som.tocar('dado'); App.render();
};
ACT['el-guardar'] = el => {
  const k = el.dataset.k, R = EL.res; let t, tx = '';
  if (k === 'pessoa') { const p = R.pessoa; if (!p) return; t = p.nome; tx = `${p.oficio}. ${p.traco}. Segredo: ${p.segredo}.`; }
  else { t = R[k]; if (!t) return; }
  elSalvar(EL_TIPO_DE[k] || 'Nota', EL.arco, t, tx); toast('Guardado na aba Notas.', { tipo: 'bom' });
};
ACT['el-ger-add'] = () => {
  const k = $('#el-gk').value, t = ($('#el-gt').value || '').trim(); if (!t) return toast('Escreva o item.');
  gravarEstado({ lore: { ger: { [k]: { [novoId()]: t } } } }); $('#el-gt').value = ''; toast('Adicionado à lista.', { tipo: 'bom' });
};
ACT['el-ger-ver'] = () => {
  const G = elGer().listas || {}, ger = elEstado().ger || {}, nome = k => k === 'nome' ? 'Nome completo' : (G[k] || {}).rot || k;
  const linhas = Object.entries(ger).flatMap(([k, m]) => Object.entries(m || {}).map(([id, t]) => `<li><b>${esc(nome(k))}:</b> ${esc(t)} <button class="link" data-act="el-ger-del" data-k="${esc(k)}" data-id="${esc(id)}">apagar</button></li>`));
  Modal.abrir(`<h2>Meus itens</h2>${linhas.length ? `<ul class="el-meus">${linhas.join('')}</ul>` : '<p class="nota">Você ainda não adicionou nada.</p>'}`);
};
ACT['el-ger-del'] = el => { gravarEstado({ lore: { ger: { [el.dataset.k]: { [el.dataset.id]: APAGAR } } } }); const li = el.closest('li'); if (li) li.remove(); };

/* segundo monitor */
ACT['el-janela'] = () => { const w = window.open(location.href.split('#')[0] + '#escudolore', 'escudolore', 'width=1000,height=1000'); if (!w) toast('O navegador bloqueou a janela nova. Permita pop-ups para este site, ou abra o endereço do site em outra aba e vá em Consultar › Escudo de lore.', { tipo: 'ruim', tempo: 8000 }); };
ACT['el-solo-sair'] = () => { window.name = ''; document.body.classList.remove('el-solo'); App.render(); };
ACT['el-export'] = () => Modal.abrir(`<h2>Minhas marcações</h2><p>Estado das cenas, decisões, fixados, arcos e cartões seus. Guarde se quiser levar para outro lugar.</p><textarea id="el-exp" rows="12" class="cheio" readonly>${esc(JSON.stringify(elEstado(), null, 1))}</textarea><button class="bt" data-act="copiar" data-alvo="el-exp">Copiar</button>`, { classe: 'larga' });
/* busca: só esconde cartões, sem redesenhar a página (não perde o cursor) */
document.addEventListener('input', e => {
  if (!e.target || e.target.id !== 'el-busca') return;
  const q = sem(e.target.value);
  $$('.el-item').forEach(c => { c.hidden = !!q && !sem(c.dataset.busca || c.textContent).includes(q); });
});
/* atalho vindo da Colinha */
ACT['el-ir-rapido'] = () => { EL.aba = 'rapido'; App.ir('escudolore'); };

/* leva só as anotações do mestre para outro chat (lore, GPT…), em texto simples */
ACT['el-copiar-notas'] = () => {
  const L = window.LORE || {}, s = elEstado(), grupos = {};
  const add = (arco, l) => { const k = arco || 'Sem arco'; (grupos[k] = grupos[k] || []).push(l); };
  const um = t => String(t || '').replace(/\s*\n+\s*/g, ' ').trim();
  Object.entries(s.extras || {}).filter(([, x]) => x).sort((a, b) => (a[1].em || 0) - (b[1].em || 0))
    .forEach(([, x]) => add(elNomeArco(x.arco), `- [${x.cat || 'Nota'}] ${um(x.t)}${x.tx ? ': ' + um(x.tx) : ''}`));
  Object.entries(s.cenas || {}).forEach(([id, x]) => {
    if (!x || !x.nota) return;
    const c = (L.cenas || []).find(y => y.id === id); if (!c) return;
    add(elNomeArco(elArcoDaCena(c)), `- [Nota da cena “${c.cena}”] ${um(x.nota)}`);
  });
  const corpo = Object.entries(grupos).map(([a, l]) => `## ${a}\n${l.join('\n')}`).join('\n\n');
  const txt = corpo ? 'Minhas anotações da mesa (ideias soltas, nada decidido):\n\n' + corpo : 'Ainda não há anotações.';
  Modal.abrir(`<h2>Para mandar ao chat de lore</h2><p class="nota">Só o que você anotou. Copie e cole no chat.</p><textarea id="el-exp2" rows="12" class="cheio" readonly>${esc(txt)}</textarea><button class="bt" data-act="copiar" data-alvo="el-exp2">Copiar</button>`, { classe: 'larga' });
};
