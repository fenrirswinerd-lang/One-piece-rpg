/* ═══════════ INIMIGOS: biblioteca do Manual dos Inimigos + criaturas próprias ═══════════ */
let filtroMon = { q: '', cat: '', ndMax: 30 };
const todosMon = () => MON().concat(S().custom || []);
function listaFiltrada() {
  const q = filtroMon.q.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  return todosMon().filter(m => (!filtroMon.cat || m.cat === filtroMon.cat) && ND_NUM(m.nd) <= filtroMon.ndMax &&
    (!q || (m.nome + ' ' + m.cat).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q)));
}
function cartaMon(m, modo) {
  const a = (m.ataques || [])[0];
  return `<article class="mon">
    <button class="mon-abre" data-act="mon-ver" data-id="${m.id}" data-modo="${modo}">${ic(m.retrato || retratoInimigo(m), 64)}
      <span><b>${esc(m.nome)}</b><small>${esc(m.cat)} · ND ${esc(m.nd)} · ${fmt(m.xp)} XP</small>
      <small>CR ${m.cr} · PV ${fmt(m.pv)}${a ? ` · ${esc(a.nome)} ${sg(a.bonus)}` : ''}</small></span></button>
    <div class="mon-bts"><button class="bt fino" data-act="mon-enc" data-id="${m.id}" title="Pôr no encontro">+ Encontro</button>
      <button class="bt fino" data-act="mon-cb" data-id="${m.id}" title="Pôr na luta">+ Luta</button></div></article>`;
}
function filtrosHTML(alvo) {
  const cats = [...new Set(todosMon().map(m => m.cat))];
  return `<div class="filtros-mon">
    <label class="busca" for="mon-q">${ic('status:busca', 32)}<input id="mon-q" placeholder="Buscar inimigo" value="${esc(filtroMon.q)}" data-chg="mon-filtro" data-alvo="${alvo}" autocomplete="off"></label>
    <label for="mon-nd">ND até <select id="mon-nd" data-chg="mon-filtro" data-alvo="${alvo}">${[0.5, 1, 2, 3, 5, 8, 10, 15, 20, 30].map(n => `<option value="${n}" ${filtroMon.ndMax === n ? 'selected' : ''}>${n === 0.5 ? '½' : n}</option>`).join('')}</select></label>
    <div class="chips">${['', ...cats].map(c => `<button class="chip ${filtroMon.cat === c ? 'on' : ''}" data-act="mon-cat" data-cat="${esc(c)}" data-alvo="${alvo}">${esc(c || 'Todos')}</button>`).join('')}</div></div>`;
}
VIEWS.inimigos = {
  titulo: 'Inimigos', icone: 'poderes:recompensa',
  render() {
    const l = listaFiltrada();
    return `<section class="biblio"><div class="biblio-topo"><div><h1>Inimigos</h1><p class="nota">${MON().length} fichas do Manual dos Inimigos (prévia 2.0) + as suas. Clique para ver a ficha inteira.</p></div>
      <div class="linha-bts"><button class="bt" data-act="cb-rapida">${ic('status:notas', 32)}Criar criatura</button><button class="bt fino" data-act="ini-docx" title="Modelo Ficha de Inimigos (.docx), no formato do Manual dos Inimigos">Importar ficha (.docx)</button></div></div>
      ${filtrosHTML('pagina')}<div class="mons">${l.map(m => cartaMon(m, 'pagina')).join('') || '<p class="nota">Nada com esse filtro.</p>'}</div></section>`;
  }
};
ACT['mon-filtro'] = el => { filtroMon.q = ($('#mon-q') || {}).value || ''; filtroMon.ndMax = +(($('#mon-nd') || {}).value || 30); redesenharBiblio(el.dataset.alvo); };
ACT['mon-cat'] = el => { filtroMon.cat = el.dataset.cat; redesenharBiblio(el.dataset.alvo); };
function redesenharBiblio(alvo) {
  if (alvo === 'pagina') return App.render();
  const box = $('#biblio-modal'); if (box) { box.innerHTML = biblioModalHTML(box.dataset.destino); const i = $('#mon-q'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }
}
document.addEventListener('input', e => { if (e.target.id === 'mon-q') { clearTimeout(window.__mq); window.__mq = setTimeout(() => ACT['mon-filtro'](e.target), 180); } });
function biblioModalHTML(destino) {
  return `${filtrosHTML('modal')}<div class="mons">${listaFiltrada().slice(0, 120).map(m => cartaMon(m, destino)).join('')}</div>`;
}
function abrirBiblioteca(destino) {
  Modal.abrir(`<h2>${destino === 'encontro' ? 'Pôr no encontro' : 'Pôr na luta'}</h2><label class="campo-inline" for="mon-qtd">Quantidade <input id="mon-qtd" type="number" min="1" max="30" value="1"></label>
    <label class="campo-inline check" for="mon-rolapv"><input id="mon-rolapv" type="checkbox"> Rolar os PV de cada um (em vez da média)</label>
    <div id="biblio-modal" data-destino="${destino}">${biblioModalHTML(destino)}</div>`, { classe: 'larga' });
}
const qtdModal = () => clamp(parseInt(($('#mon-qtd') || {}).value, 10) || 1, 1, 30);
ACT['mon-cb'] = el => {
  const m = monPorId(el.dataset.id), q = qtdModal(), rpv = ($('#mon-rolapv') || {}).checked;
  Store.set(s => addMonstros(s, m, q, rpv), `Entrou na luta: ${q}× ${m.nome}`);
  toast(`${q}× <b>${esc(m.nome)}</b> na luta.`); Som.tocar('clique');
};
ACT['mon-enc'] = el => {
  const m = monPorId(el.dataset.id), q = qtdModal();
  Store.set(s => { const it = s.encontro.itens.find(i => i.id === m.id); if (it) it.qtd += q; else s.encontro.itens.push({ id: m.id, qtd: q }); }, null);
  toast(`${q}× <b>${esc(m.nome)}</b> no encontro.`); Som.tocar('clique');
};
ACT['mon-ver'] = el => { const m = monPorId(el.dataset.id); if (m) Modal.abrir(blocoMon(m), { classe: 'larga bloco' }); };
function blocoMon(m) {
  const at = ['FOR', 'DES', 'CON', 'SAB', 'PRE', 'VON'];
  let secAnt = null;
  const texto = (m.texto || []).map(e => {
    const cab = e.sec && e.sec !== secAnt ? `<h4 class="bloco-sec">${esc(e.sec)}</h4>` : ''; if (e.sec) secAnt = e.sec;
    const atkI = (m.ataques || []).findIndex(a => e.nome.startsWith(a.nome) && e.texto.includes('para atingir'));
    return `${cab}<p class="ent ${atkI >= 0 ? 'atk-ent' : ''}">${e.nome ? `<b>${esc(e.nome)}:</b> ` : ''}${esc(e.texto).replace(/\n/g, '<br>')}${atkI >= 0 ? ` <button class="link" data-act="rolar" data-expr="1d20+${m.ataques[atkI].bonus}" data-titulo="${esc(m.nome + ': ' + m.ataques[atkI].nome)}">rolar ataque</button> · <button class="link" data-act="rolar" data-expr="${esc(m.ataques[atkI].dados || '')}" data-titulo="${esc('Dano: ' + m.ataques[atkI].nome)}">rolar dano</button>` : ''}</p>`;
  }).join('');
  return `<div class="bloco-cab">${ic(m.retrato || retratoInimigo(m), 128)}<div><h2>${esc(m.nome)}</h2><p>${esc(m.cat)} · ND ${esc(m.nd)} · ${fmt(m.xp)} XP${m.pp ? ` · ${m.pp} PP` : ''}${m.pag ? ` · MI p. ${m.pag}` : ''}</p>
    <ul class="bloco-nums"><li>CR <b>${m.cr ?? '—'}</b></li><li>PV <b>${fmt(m.pv)}</b>${m.pvDados ? ` <small>(${esc(m.pvDados)})</small>` : ''}</li><li>CD <b>${m.cd ?? '—'}</b></li>
    <li>Desl. <b>${esc(m.desl || '—')}</b></li>${(m.outros || []).map(o => `<li>${esc(o)}</li>`).join('')}${m.perc ? `<li>Perc. passiva <b>${m.perc}</b></li>` : ''}</ul></div></div>
    ${m.attrs ? `<table class="tab attrs"><tr>${at.map(a => `<th>${a}</th>`).join('')}</tr><tr>${m.attrs.map(([v, md]) => `<td>${v} (${sg(md)})</td>`).join('')}</tr></table>` : ''}
    ${m.lore ? `<p class="lore">${esc(m.lore)}</p>` : ''}<div class="bloco-txt">${texto || '<p class="nota">Sem texto.</p>'}</div>
    <div class="linha-bts"><label class="campo-inline" for="mon-qtd">Quantidade <input id="mon-qtd" type="number" min="1" max="30" value="1"></label>
    <button class="bt" data-act="mon-enc" data-id="${m.id}">+ Encontro</button><button class="bt bom" data-act="mon-cb" data-id="${m.id}">+ Luta</button>
    ${String(m.id).startsWith('custom-') ? `<button class="bt ruim fino" data-act="mon-apagar" data-id="${m.id}">Apagar da biblioteca</button>` : ''}</div>`;
}
ACT['mon-apagar'] = el => Store.set(s => { s.custom = s.custom.filter(m => m.id !== el.dataset.id); Modal.fechar(); }, null);

/* ═══════════ ENCONTRO: dificuldade e XP (GN p. 45–46) ═══════════ */
function niveisGrupo(s) { return s.party.filter(p => p.sheet && participaEnc(s, p)).map(p => s.encontro.nivelManual[p.id] || p.sheet.nivel || 1); }
VIEWS.encontro = {
  titulo: 'Encontro', icone: 'status:dificuldade',
  render() {
    const s = S(), e = s.encontro, nv = niveisGrupo(s);
    const itens = e.itens.map(i => ({ ...i, m: monPorId(i.id) })).filter(i => i.m);
    const d = dificuldade(nv, itens.map(i => ({ xp: i.m.xp, qtd: i.qtd })));
    const topo = Math.max(d.lim[3] * 1.25, d.ajustado, 1), pct = v => clamp(100 * v / topo, 0, 100);
    const cor = ['facil', 'medio', 'dificil', 'mortal'][d.idx] || 'trivial';
    return `<section class="encontro"><div class="enc-col">
      <div class="enc-cab"><h1>Montar encontro</h1><button class="bt" data-act="enc-add">${ic('mar:navio_pirata', 32)}Pôr inimigo</button></div>
      ${s.party.some(p => p.pdm && p.vilao && p.sheet) ? `<div class="enc-vil"><b>Vilões das suas fichas:</b> ${s.party.filter(p => p.pdm && p.vilao && p.sheet).map(p => `<button class="bt fino ${e.itens.some(i => i.id === 'pdm:' + p.id) ? 'on' : ''}" data-act="pdm-enc" data-id="${p.id}">${esc(nomePC(p))}${p.nd ? ` <small>ND ${esc(p.nd)}</small>` : ''}</button>`).join('')}</div>` : ''}
      <ul class="enc-itens">${itens.length ? itens.map(i => `<li>${ic(i.m.retrato || retratoInimigo(i.m), 64)}<span><b>${esc(i.m.nome)}</b><small>ND ${esc(i.m.nd)} · ${fmt(i.m.xp)} XP cada · CR ${i.m.cr}</small></span>
        <span class="qtd"><button class="bt fino" data-act="enc-q" data-id="${i.id}" data-d="-1" aria-label="Menos">−</button><b>${i.qtd}</b><button class="bt fino" data-act="enc-q" data-id="${i.id}" data-d="1" aria-label="Mais">+</button></span>
        <b class="xp">${fmt(i.m.xp * i.qtd)}</b></li>`).join('') : '<li class="vazio-li">Nenhum inimigo ainda. Use “Pôr inimigo” ou a aba Inimigos.</li>'}</ul>
      <label class="check grande-check" for="enc-imp"><input id="enc-imp" type="checkbox" ${e.improvisado ? 'checked' : ''} data-chg="enc-imp"> Encontro improvisado (dá XP para a Barra de Bônus)</label>
      <div class="linha-bts"><button class="bt bom grande" data-act="enc-luta" ${itens.length ? '' : 'disabled'}>${ic('tesouro:espada', 32)}Levar para a luta</button>
        <button class="bt ouro" data-act="enc-vitoria" ${itens.length ? '' : 'disabled'}>${ic('poderes:subir_nivel', 32)}Registrar vitória</button>
        <button class="bt fino" data-act="enc-limpar" ${itens.length ? '' : 'disabled'}>Limpar</button></div></div>
      <div class="enc-col resultado ${cor}">
        <h2>${d.qtd ? esc(d.nivel) : 'Sem inimigos'}</h2>
        ${d.lim.some(l => l > 0) ? `<div class="medidor" aria-hidden="true"><i style="width:${pct(d.ajustado)}%"></i>${d.lim.map((l, k) => {
          const x = Math.max(0, Math.min(100, pct(l)));
          return l > 0 ? `<span class="tique ${k % 2 ? 'baixo' : ''} ${x < 12 ? 'esq' : x > 88 ? 'dir' : ''}" style="left:${x}%"><small>${['Fácil', 'Médio', 'Difícil', 'Mortal'][k]}<br>${fmt(l)}</small></span>` : ''; }).join('')}</div>`
        : '<p class="nota">Escolha os jogadores no Grupo para medir a dificuldade.</p>'}
        <dl class="dl grande-dl"><dt>XP das criaturas</dt><dd>${fmt(d.total)}</dd><dt>Multiplicador</dt><dd>×${String(d.mult).replace('.', ',')} <small>(${d.qtd} criatura${d.qtd === 1 ? '' : 's'}, ${nv.length} jogador${nv.length === 1 ? '' : 'es'})</small></dd>
          <dt>XP ajustado</dt><dd>${fmt(d.ajustado)} <small>só para medir a dificuldade</small></dd><dt>XP para cada jogador</dt><dd class="dest">${fmt(d.xpCada)}</dd>
          <dt>O grupo aguenta por dia</dt><dd>${fmt(d.porDia)} <small>de XP ajustado (6 a 8 encontros médios ou difíceis)</small></dd></dl>
        <h3>Quem está neste encontro</h3><ul class="niveis">${s.party.filter(p => p.sheet && naMesa(p)).map(p => `<li class="${participaEnc(s, p) ? '' : 'fora'}"><label class="check"><input type="checkbox" ${participaEnc(s, p) ? 'checked' : ''} data-chg="enc-part" data-id="${p.id}" aria-label="${esc(nomePC(p))} participa deste encontro"> ${esc(nomePC(p))}${p.pdm ? ' <small>(ficha do mestre)</small>' : p.aliado ? ' <small>(NPC aliado)</small>' : ''}</label><label>Nv <input type="number" min="1" max="20" value="${e.nivelManual[p.id] || p.sheet.nivel || 1}" data-chg="enc-nv" data-id="${p.id}" aria-label="Nível de ${esc(nomePC(p))}"></label></li>`).join('') || '<li class="nota">Conecte as fichas na Mesa.</li>'}</ul>
        <p class="nota">NPC aliado e ficha do mestre só entram na conta se você marcar a caixa dele. Marcado, ele conta na dificuldade e também na divisão do XP (o livro manda incluir quem ajudou de verdade, GN p. 120): cada jogador recebe um pouco menos, e a parte do NPC não vai para ninguém. O XP é o total sem multiplicador. Menos de 3 jogadores: o multiplicador sobe um degrau; 5 ou mais: desce um. Situação contra o grupo: suba um degrau de dificuldade; a favor: desça um.</p>
      </div></section>`;
  }
};
ACT['enc-add'] = () => abrirBiblioteca('encontro');
ACT['enc-q'] = el => Store.set(s => { const i = s.encontro.itens.find(x => x.id === el.dataset.id); i.qtd += +el.dataset.d; if (String(i.id).startsWith('pdm:')) i.qtd = Math.min(1, i.qtd); if (i.qtd <= 0) s.encontro.itens = s.encontro.itens.filter(x => x !== i); }, null);
ACT['enc-imp'] = el => Store.set(s => { s.encontro.improvisado = el.checked; }, null);
ACT['enc-part'] = el => Store.set(s => { (s.encontro.participa = s.encontro.participa || {})[el.dataset.id] = el.checked; }, null);
ACT['enc-nv'] = el => Store.set(s => { s.encontro.nivelManual[el.dataset.id] = clamp(+el.value || 1, 1, 20); }, null);
ACT['enc-limpar'] = () => Store.set(s => { s.encontro.itens = []; }, null);
ACT['enc-luta'] = () => {
  Store.set(s => { s.encontro.itens.forEach(i => { const m = monPorId(i.id); if (m && m.pdm) pdmNaLuta(s, m.pdm, true); else if (m) addMonstros(s, m, i.qtd); }); }, 'Encontro levado para a luta');
  ACT['cb-add-pcs'](); App.ir('combate');
};
ACT['enc-vitoria'] = () => {
  const s = S(), itens = s.encontro.itens.map(i => ({ m: monPorId(i.id), qtd: i.qtd })).filter(i => i.m);
  const d = dificuldade(niveisGrupo(s), itens.map(i => ({ xp: i.m.xp, qtd: i.qtd })));
  const desc = itens.map(i => `${i.qtd}× ${i.m.nome}`).join(', ');
  if (!s.encontro.improvisado) return confirmar(`Encontro planejado não dá XP pela regra da mesa. Só limpar o encontro?`, () => Store.set(x => { x.encontro.itens = []; }, `Vitória: ${desc}`));
  confirmar(`Registrar <b>${fmt(d.total)} XP</b> (${fmt(d.xpCada)} para cada um) na Barra de Bônus do arco <b>${esc(s.xp.arco)}</b>?`, () => {
    Store.set(x => { x.xp.registros.push({ id: uid(), arco: x.xp.arco, desc, xp: d.total, partes: Math.max(1, niveisGrupo(x).length), jogadores: x.party.filter(p => p.sheet && participaEnc(x, p) && !p.aliado && !p.pdm).map(p => p.id), t: Date.now() }); x.encontro.itens = []; }, `Vitória em encontro improvisado: ${desc} (${d.total} XP)`);
    Som.tocar('nivel'); App.ir('barra');
  }, { ok: 'Registrar' });
};
