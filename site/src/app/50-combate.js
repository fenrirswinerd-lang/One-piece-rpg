/* ═══════════ COMBATE: iniciativa, turnos, ataques automáticos, turba ═══════════ */
const MON = () => window.MONS || [];
const monPorId = id => String(id).startsWith('pdm:') ? monDePdm(String(id).slice(4)) : MON().find(m => m.id === id) || S().custom.find(m => m.id === id);
const desMod = m => (m && m.attrs ? m.attrs[1][1] : 0);
function cbPC(s, c) { return c.pcId ? s.party.find(p => p.id === c.pcId) : null; }
function cbInfo(s, c) { // números atuais de um combatente (jogador ou não)
  const pc = cbPC(s, c);
  if (pc && pc.sheet) { const k = calc(pc); return { pv: k.pv, pvMax: k.pvMax, cr: k.cr, conds: pc.live.conds, nome: nomePC(pc), retrato: pc.live.retrato, morto: pc.live.morto, fora: pc.live.morto || k.pv <= 0, pc: true, mod: k.ini, temp: k.temp, pdm: !!pc.pdm, inimigo: !!c.inimigo }; }
  return { pv: c.pv, pvMax: c.pvMax, cr: (c.cr ?? 0) + (c.crMod || 0), conds: c.conds, nome: c.nome, retrato: c.retrato, fora: c.derrotado, pc: false, mod: c.mod, temp: c.temp || 0 };
}
function ordem(s) {
  return s.combate.lista.map((c, i) => ({ c, i })).sort((a, b) => ((b.c.ini ?? -99) - (a.c.ini ?? -99)) || (cbInfo(s, b.c).mod - cbInfo(s, a.c).mod) || (a.i - b.i)).map(x => x.c);
}
function estadoNPC(pv, max) { if (pv <= 0) return 'Fora de combate'; const p = pv / max; return p >= 1 ? 'Inteiro' : p > 0.5 ? 'Ferido' : p > 0.25 ? 'Muito ferido' : 'Quase caindo'; }

VIEWS.combate = {
  titulo: 'Combate', icone: 'tesouro:espada',
  render() {
    const s = S(), cb = s.combate, ord = ordem(s), atual = ord[cb.vez] || null;
    const selId = cb.sel || (atual && atual.id), sel = cb.lista.find(c => c.id === selId) || atual;
    const linha = (c, k) => {
      const inf = cbInfo(s, c), vez = cb.ativo && atual && c.id === atual.id;
      return `<li class="ini-linha ${vez ? 'vez' : ''} ${inf.fora ? 'fora' : ''} ${sel && sel.id === c.id ? 'sel' : ''} ${inf.pc && !inf.inimigo ? 'pc' : 'npc'}" data-act="cb-sel" data-id="${c.id}">
        <span class="ini-n">${c.ini ?? '–'}</span>
        <span class="token">${retratoHTML(inf.retrato, inf.nome, 64)}</span>
        <span class="ini-nome"><b>${esc(inf.nome)}</b><small>${inf.pc ? (inf.inimigo ? 'Inimigo · ficha do mestre' : inf.pdm ? 'Aliado · ficha do mestre' : 'Jogador') : esc(c.tipoTxt || 'Inimigo')} · CR ${inf.cr ?? '—'}</small>
          <span class="mini-conds">${(inf.conds || []).map(x => `<span class="cond-cl" role="button" tabindex="0" data-act="cond-info" data-n="${esc(x.n)}" title="${esc(x.n + ': ' + ((CONDI[x.n] || {}).r || ''))}">${ic((CONDI[x.n] || {}).i, 32)}</span>`).join('')}</span></span>
        <span class="ini-pv">${barra(Math.max(0, inf.pv), inf.pvMax, 'pv')}<small>${inf.pv}/${inf.pvMax}${inf.temp ? ` +${inf.temp}` : ''}</small></span>
        ${c.pcId ? `<input class="ini-in" id="ini-${c.id}" type="number" inputmode="numeric" value="${c.ini ?? ''}" aria-label="Iniciativa de ${esc(inf.nome)}" data-chg="cb-ini" data-id="${c.id}">` : ''}
      </li>`;
    };
    return `<section class="combate c-conves">
      <div class="cb-topo">
        <div class="cb-rodada">${cb.ativo ? `<span class="rodada-n">Rodada <b>${cb.rodada}</b></span><span>Vez de <b>${atual ? esc(cbInfo(s, atual).nome) : '—'}</b></span>` : '<span>Combate parado</span>'}</div>
        <div class="linha-bts">
          <button class="bt" data-act="cb-add-pcs">${ic('poderes:recompensa', 32)}Jogadores</button>
          <button class="bt" data-act="cb-add-mon">${ic('mar:navio_pirata', 32)}Inimigo do Manual</button>
          <button class="bt" data-act="cb-rapida">${ic('status:notas', 32)}Criatura rápida</button>
          <button class="bt ouro" data-act="cb-rolar-ini">${ic('status:iniciativa', 32)}Rolar iniciativa</button>
          ${cb.ativo ? `<button class="bt" data-act="cb-ant">◀</button><button class="bt bom grande" data-act="cb-prox">Próximo turno ▶</button><button class="bt ruim" data-act="cb-fim">Encerrar</button>`
            : `<button class="bt bom grande" data-act="cb-iniciar" ${cb.lista.length ? '' : 'disabled'}>${ic('status:turno', 32)}Começar combate</button>`}
          <a class="bt" href="#tatico" data-rota="tatico" title="Mapa com grade, distâncias e alcance">${ic('itensop:mapa_tesouro', 32)}Mapa</a>
          ${cb.lista.length ? '<button class="bt fino" data-act="cb-limpar">Limpar</button>' : ''}
        </div></div>
      <div class="cb-corpo">
        <ol class="ini-lista" aria-label="Ordem de iniciativa">${ord.length ? ord.map(linha).join('') : '<li class="vazio-li">Adicione os jogadores e os inimigos. Os jogadores rolam a própria iniciativa (teste de Destreza); grupos iguais de inimigos rolam uma vez só.</li>'}</ol>
        <div class="cb-painel">${sel ? painelCombatente(s, sel) : '<p class="nota">Escolha alguém na lista.</p>'}
          ${ferramentasCombate(s)}</div>
      </div>
      <details class="cb-log"><summary>Registro do combate (${cb.log.length})</summary><ol>${cb.log.slice(-60).reverse().map(l => `<li><small>R${l.r}</small> ${l.txt}</li>`).join('')}</ol></details>
    </section>`;
  }
};
function painelCombatente(s, c) {
  const inf = cbInfo(s, c), alvo = 'cb:' + c.id;
  const conds = `<div class="conds">${(inf.conds || []).map((x, i) => chipCond(x, alvo, i)).join('')}<button class="cond add" data-act="cond-novo" data-alvo="${alvo}">+ Condição</button></div>`;
  if (inf.pc) {
    const pc = cbPC(s, c), k = calc(pc);
    return `<div class="cb-ficha"><div class="cb-cab">${retratoHTML(inf.retrato, inf.nome, 128)}<div><h2>${esc(inf.nome)}</h2>
      <p>PV <b>${k.pv}/${k.pvMax}</b> · PP <b>${k.pp}/${k.ppMax}</b> · CR <b>${k.cr}</b> · CD ${k.cd ?? '—'} · Técnica ${sg(k.atk)} · Perc. ${k.perc} · Desl. ${String(k.desl).replace('.', ',')} m</p>
      ${k.exa ? `<p class="ruim">Exaustão ${k.exa}: d20 ${EXA[Math.min(k.exa, 5)][1]}</p>` : ''}</div></div>${conds}
      <div class="acoes"><input id="val-${pc.id}" class="valor" type="number" inputmode="numeric" min="0" placeholder="0" data-enter="pc-dano" data-id="${pc.id}" aria-label="Valor">
      <button class="bt ruim" data-act="pc-dano" data-id="${pc.id}">Dano</button><button class="bt bom" data-act="pc-cura" data-id="${pc.id}">Cura</button>
      <button class="bt azul" data-act="pc-pp" data-id="${pc.id}" data-d="-1">Gastar PP</button><button class="bt fino" data-act="pc-ficha" data-id="${pc.id}" data-aba="tecnicas">Técnicas</button><button class="bt fino" data-act="pc-cr" data-id="${pc.id}" title="Cobertura e outros ajustes de CR">CR ±</button></div></div>`;
  }
  const m = monPorId(c.monId);
  const ataques = (c.ataques || []).map((a, i) => `<button class="atk" data-act="cb-atacar" data-id="${c.id}" data-i="${i}">${ic(a.tipo === 'à Distância' ? 'mar:luneta' : 'tesouro:espada', 32)}
      <span><b>${esc(a.nome)}</b><small>${sg(a.bonus)} · ${esc(a.dados || '')}${a.dano ? ' ' + esc(a.dano.toLowerCase()) : ''}${a.pp ? ` · ${a.pp} PP` : ''}</small></span></button>`).join('');
  const grupo = s.combate.lista.filter(x => x.grupo && x.grupo === c.grupo && !x.derrotado);
  return `<div class="cb-ficha"><div class="cb-cab">${retratoHTML(c.retrato, c.nome, 128)}<div><h2>${esc(c.nome)}</h2>
    <p>PV <b>${c.pv}/${c.pvMax}</b> (${estadoNPC(c.pv, c.pvMax)}) · CR <b>${(c.cr ?? 0) + (c.crMod || 0)}</b>${c.crMod ? ` <small>(${c.cr} ${sg(c.crMod)})</small>` : ''} <button class="bt fino" data-act="cb-cr" data-id="${c.id}" title="Cobertura e outros ajustes de CR">CR ±</button>${c.cd ? ` · CD ${c.cd}` : ''}${c.perc ? ` · Perc. ${c.perc}` : ''}${c.desl ? ` · ${esc(c.desl)}` : ''}</p>
    ${m ? `<button class="link" data-act="mon-ver" data-id="${m.id}">Ficha completa${m.pag ? ` (MI p. ${m.pag})` : ''}</button>` : ''}</div></div>${conds}
    <div class="acoes"><input id="nval-${c.id}" class="valor" type="number" inputmode="numeric" min="0" placeholder="0" data-enter="cb-dano" data-id="${c.id}" aria-label="Valor">
      <button class="bt ruim" data-act="cb-dano" data-id="${c.id}">Dano</button><button class="bt bom" data-act="cb-cura" data-id="${c.id}">Cura</button>
      <button class="bt fino" data-act="cb-tirar" data-id="${c.id}">Tirar da luta</button></div>
    ${ataques ? `<h3>Ataques</h3><div class="atks">${ataques}</div>` : ''}
    ${grupo.length > 2 && (c.ataques || []).length ? `<button class="bt ouro" data-act="cb-turba" data-id="${c.id}">${ic('status:dificuldade', 32)}Turba: ${grupo.length} atacam juntos</button>` : ''}</div>`;
}
function ferramentasCombate(s) {
  return `<details class="ferr"><summary>${ic('status:ajustes', 32)}Calculadoras</summary>
    <div class="ferr-grade">
      <form class="calc" data-calc="chance"><h4>Chance de acertar</h4><label>Bônus <input id="ch-b" type="number" value="5" inputmode="numeric"></label><label>CR do alvo <input id="ch-cr" type="number" value="13" inputmode="numeric"></label><output id="ch-out"></output></form>
      <form class="calc" data-calc="area"><h4>Alvos numa área (GN p. 114)</h4><label>Forma <select id="ar-f">${Object.keys(AREA).map(k => `<option>${k}</option>`).join('')}</select></label><label>Tamanho (m) <input id="ar-m" type="number" value="9" inputmode="decimal"></label><output id="ar-out"></output></form>
      <form class="calc" data-calc="turba"><h4>Turba (GN p. 115)</h4><label>CR do alvo <input id="tb-cr" type="number" value="16"></label><label>Bônus <input id="tb-b" type="number" value="5"></label><label>Atacantes <input id="tb-q" type="number" value="15"></label><output id="tb-out"></output></form>
    </div></details>`;
}
VIEWS.combate.depois = raiz => {
  const at = () => {
    const b = +($('#ch-b') || {}).value || 0, cr = +($('#ch-cr') || {}).value || 10, need = clamp(cr - b, 2, 20), p = (21 - need) / 20;
    if ($('#ch-out')) $('#ch-out').innerHTML = `Precisa de <b>${need}</b> no d20 · normal <b>${Math.round(p * 100)}%</b> · vant. ${Math.round((1 - (1 - p) ** 2) * 100)}% · desv. ${Math.round(p * p * 100)}%`;
    const f = ($('#ar-f') || {}).value, m = +($('#ar-m') || {}).value || 0;
    if ($('#ar-out') && f) $('#ar-out').innerHTML = `Pega <b>${Math.ceil(m / AREA[f])}</b> alvos (ajuste ±1d4 se estão espalhados ou juntos)`;
    const t = turba(+($('#tb-cr') || {}).value || 10, +($('#tb-b') || {}).value || 0, +($('#tb-q') || {}).value || 0);
    if ($('#tb-out')) $('#tb-out').innerHTML = `Precisa de ${t.precisa} · a cada <b>${t.por}</b> atacantes, 1 acerta → <b>${t.acertos} acertos</b>`;
  };
  raiz.querySelectorAll('.calc input, .calc select').forEach(i => i.addEventListener('input', at)); at();
  const v = raiz.querySelector('.ini-linha.vez'); if (v) v.scrollIntoView({ block: 'nearest' });
};

/* ───── ações ───── */
const logCB = (s, txt) => { s.combate.log.push({ r: s.combate.rodada, txt, t: Date.now() }); if (s.combate.log.length > 300) s.combate.log.shift(); };
ACT['cb-sel'] = el => { if (el.closest && document.activeElement && document.activeElement.classList.contains('ini-in')) return; S().combate.sel = el.dataset.id; Store.save(); App.render(); };
ACT['cb-ini'] = el => { const v = parseInt(el.value, 10); Store.set(s => { s.combate.lista.find(c => c.id === el.dataset.id).ini = isNaN(v) ? null : v; }, null); };
ACT['cb-add-pcs'] = () => {
  let n = 0;
  Store.set(s => s.party.filter(p => p.sheet && participaEnc(s, p)).forEach(p => { if (!s.combate.lista.some(c => c.pcId === p.id)) { s.combate.lista.push({ id: uid(), pcId: p.id, ini: null }); n++; } }), null);
  toast(n ? `${n} jogador(es) na luta. Peça a iniciativa: d20 + Destreza.` : 'Os jogadores já estão na luta.');
};
function npcDeMonstro(m, nome, grupo) {
  const pvD = m.pvDados && /d/.test(m.pvDados) ? m.pvDados : null;
  return { id: uid(), monId: m.id, nome, grupo, ini: null, mod: desMod(m), pv: m.pv, pvMax: m.pv, temp: 0, cr: m.cr, cd: m.cd, perc: m.perc, desl: m.desl, conds: [],
    ataques: (m.ataques || []).map(a => ({ ...a })), retrato: m.retrato || retratoInimigo(m), tipoTxt: `ND ${m.nd}`, derrotado: false, pvDados: pvD };
}
function addMonstros(s, m, qtd, rolarPV) {
  const grupo = uid(), ja = s.combate.lista.filter(c => c.monId === m.id).length;
  for (let i = 0; i < qtd; i++) {
    const c = npcDeMonstro(m, qtd > 1 || ja ? `${m.nome} ${ja + i + 1}` : m.nome, grupo);
    if (rolarPV && c.pvDados) { c.pv = c.pvMax = Math.max(1, rolar(c.pvDados).total); }
    s.combate.lista.push(c);
  }
}
ACT['cb-add-mon'] = () => abrirBiblioteca('combate');
ACT['cb-rapida'] = () => Modal.abrir(`<h2>Criatura rápida</h2><form class="form-grade" id="fr-rapida">
    <label>Nome<input id="cr-nome" value="Capanga" required></label><label>Quantidade<input id="cr-q" type="number" value="1" min="1" max="30"></label>
    <label>PV<input id="cr-pv" type="number" value="10"></label><label>CR<input id="cr-cr" type="number" value="12"></label>
    <label>Mod. de iniciativa<input id="cr-mod" type="number" value="1"></label><label>ND (para o XP)<input id="cr-nd" value="1/4"></label>
    <label>Ataque: nome<input id="cr-an" value="Ataque"></label><label>Bônus de ataque<input id="cr-ab" type="number" value="4"></label>
    <label>Dano (ex.: 1d6+2)<input id="cr-ad" value="1d6+2"></label>
    <label class="cheia">Retrato<select id="cr-ret">${RETRATOS.map(r => `<option value="${r}">${r.split(':')[1].replace(/_/g, ' ')}</option>`).join('')}</select></label>
    <label class="cheia check"><input id="cr-salvar" type="checkbox" checked> Guardar na biblioteca para usar de novo</label>
    <div class="linha-bts cheia"><button class="bt bom" type="button" data-act="cb-rapida-ok">Pôr na luta</button></div></form>`);
ACT['cb-rapida-ok'] = () => {
  const v = id => $('#' + id).value, nd = v('cr-nd').trim() || '0';
  const m = { id: 'custom-' + uid(), nome: v('cr-nome').trim() || 'Criatura', cat: 'Minhas criaturas', nd, xp: ND_XP[nd] || 0, cr: +v('cr-cr') || 10, pv: +v('cr-pv') || 1, pvDados: null, cd: null,
    attrs: [[10, 0], [10, +v('cr-mod') || 0], [10, 0], [10, 0], [10, 0], [10, 0]], perc: null, desl: '', outros: [], texto: [], retrato: v('cr-ret'),
    ataques: [{ nome: v('cr-an') || 'Ataque', tipo: 'Corpo a Corpo', bonus: +v('cr-ab') || 0, dados: v('cr-ad'), media: media(v('cr-ad')), dano: '' }] };
  const q = clamp(+v('cr-q') || 1, 1, 30), salvar = $('#cr-salvar').checked;
  Store.set(s => { if (salvar) s.custom.push(m); addMonstros(s, m, q); }, `Entrou na luta: ${q}× ${m.nome}`);
  Modal.fechar();
};
ACT['cb-rolar-ini'] = () => {
  const linhas = [];
  Store.set(s => {
    const grupos = {};
    s.combate.lista.forEach(c => {
      if (c.pcId) { if (c.ini == null) { const p = cbPC(s, c), k = calc(p), r = d20(k.ini, k.modoIni); c.ini = r.total; linhas.push(`${esc(nomePC(p))}: ${r.rolagens.length > 1 ? `${r.rolagens.join(' e ')} com desvantagem → ` : ''}${r.nat}${sg(k.ini)} = <b>${r.total}</b> (rolado pelo mestre)`); } return; }
      const k = c.grupo || c.id;
      if (!grupos[k]) { const r = d20(c.mod || 0); grupos[k] = r; linhas.push(`${esc(c.nome.replace(/ \d+$/, ''))}: ${r.nat}${sg(c.mod || 0)} = <b>${r.total}</b>`); }
      c.ini = grupos[k].total;
    });
    logCB(s, 'Iniciativa rolada');
  }, 'Iniciativa rolada');
  Som.tocar('dado'); toast(linhas.join('<br>') || 'Todos já têm iniciativa.', { tempo: 7000 });
};
ACT['cb-iniciar'] = () => {
  const s = S(); if (s.combate.lista.some(c => c.ini == null)) return confirmar('Tem gente sem iniciativa. Rolo para os inimigos e para quem está vazio?', () => { ACT['cb-rolar-ini'](); ACT['cb-iniciar']() });
  Store.set(x => { x.combate.ativo = true; x.combate.rodada = 1; x.combate.vez = 0; x.combate.sel = null; x.tela.cena = 'conves'; x.tela.mostrar = { tipo: 'combate', t: Date.now() }; logCB(x, 'Começou o combate'); }, 'Começou um combate');
  Som.tocar('canhao'); celebrar(`${anim('canhao', 3, { umaVez: true, dur: 0.9 })}<b>Combate!</b>`, 1900); inicioDeTurno();
};
ACT['cb-fim'] = () => confirmar('Encerrar o combate? (Os inimigos derrotados saem da lista.)', () => {
  Store.set(s => { s.combate.ativo = false; s.combate.lista = s.combate.lista.filter(c => c.pcId || !c.derrotado); logCB(s, 'Fim do combate'); }, 'Fim do combate');
});
ACT['cb-limpar'] = () => confirmar('Tirar todo mundo da luta?', () => Store.set(s => { s.combate = { ativo: false, rodada: 1, vez: 0, lista: [], log: [] }; }, null), { perigo: true });
function passarVez(s, d) {
  const ord = ordem(s), n = ord.length; if (!n) return;
  for (let k = 0; k < n; k++) {
    s.combate.vez += d;
    if (s.combate.vez >= n) { s.combate.vez = 0; s.combate.rodada++; logCB(s, `— Rodada ${s.combate.rodada} —`); }
    if (s.combate.vez < 0) { s.combate.vez = n - 1; s.combate.rodada = Math.max(1, s.combate.rodada - 1); }
    const c = ordem(s)[s.combate.vez]; if (!cbInfo(s, c).fora || cbInfo(s, c).pc) break;
  }
  s.combate.sel = null;
}
ACT['cb-prox'] = () => { if (!S().combate.ativo) return; const r0 = S().combate.rodada; Store.set(s => passarVez(s, 1), null); Som.tocar(S().combate.rodada !== r0 ? 'sino' : 'clique'); inicioDeTurno(); };
ACT['cb-ant'] = () => Store.set(s => passarVez(s, -1), null);
function inicioDeTurno() {
  const s = S(), c = ordem(s)[s.combate.vez]; if (!c) return;
  const inf = cbInfo(s, c), avisos = [];
  Store.set(x => {
    const dono = c.pcId ? cbPC(x, c).live : x.combate.lista.find(y => y.id === c.id);
    (dono.conds || []).forEach(k => { if (k.rod) k.rod--; });
    const acabou = (dono.conds || []).filter(k => k.rod === 0).map(k => k.n);
    dono.conds = (dono.conds || []).filter(k => k.rod !== 0);
    acabou.forEach(n => avisos.push(`acabou <b>${esc(n)}</b>`));
    logCB(x, `Vez de ${inf.nome}`);
  }, null, { semDesfazer: true });
  const cs = nomesCond(inf.conds);
  if (cs.has('Queimado')) avisos.push('Queimado: 1d6 de fogo logo após o 1º ataque');
  if (cs.has('Sangramento')) avisos.push('Sangramento: 1d6 cortante ao se mover');
  if (cs.has('Sufocado')) avisos.push('Sufocado: Salv. Con no início do turno (CD 10, +2 por turno)');
  if (cs.has('Enfurecido')) avisos.push('Enfurecido: tem que ir para cima da fonte da fúria');
  if (inf.pc && inf.pv <= 0 && !inf.morto) avisos.push('Está caído e inconsciente');
  toast(`<b>Vez de ${esc(inf.nome)}</b>${avisos.length ? '<br>' + avisos.join('<br>') : ''}`, { tempo: avisos.length ? 6000 : 2200 });
}
const npcVal = id => { const el = document.getElementById('nval-' + id); const v = el ? parseInt(el.value, 10) : NaN; return isNaN(v) ? null : Math.abs(v); };
function danoNPC(c, v) {
  const t = Math.min(c.temp || 0, v); c.temp = (c.temp || 0) - t; c.pv = Math.max(0, c.pv - (v - t));
  const msgs = []; if (c.pv <= 0 && !c.derrotado) { c.derrotado = true; msgs.push(`${c.nome} fora de combate`); }
  if (nomesCond(c.conds).has('Concentrando') && !c.derrotado) msgs.push(`Concentração: Salv. Con CD ${Math.max(10, Math.floor(v / 2))}`);
  return msgs;
}
ACT['cb-dano'] = el => {
  const v = npcVal(el.dataset.id); if (!v) return toast('Digite o dano.');
  let m = []; Store.set(s => { const c = s.combate.lista.find(x => x.id === el.dataset.id); m = danoNPC(c, v); logCB(s, `${c.nome} levou ${v}`); }, null);
  const caiu = m.some(x => /fora de combate/.test(x));
  Som.tocar(caiu ? 'morte' : 'acerto'); if (m.length) toast(m.map(esc).join(' · '), { tipo: caiu ? 'bom' : '', icone: caiu ? ic('cond1:inconsciente', 32) : '' });
};
ACT['cb-cura'] = el => { const v = npcVal(el.dataset.id); if (!v) return; Store.set(s => { const c = s.combate.lista.find(x => x.id === el.dataset.id); c.pv = Math.min(c.pvMax, Math.max(0, c.pv) + v); c.derrotado = c.pv <= 0; }, null); };
ACT['cb-tirar'] = el => Store.set(s => { s.combate.lista = s.combate.lista.filter(x => x.id !== el.dataset.id); s.combate.vez = Math.min(s.combate.vez, Math.max(0, s.combate.lista.length - 1)); }, null);

/* ataque automático de inimigo */
function sugestaoModo(s, atac, alvo) {
  const a = nomesCond((cbInfo(s, atac).conds) || []), t = nomesCond(cbInfo(s, alvo).conds || []);
  let v = a.has('Invisível') || VANT_CONTRA.some(x => t.has(x)), d = DESV_ATK.some(x => a.has(x)) || t.has('Invisível');
  return v && !d ? 'vant' : d && !v ? 'desv' : '';
}
let atkCtx = null;
ACT['cb-atacar'] = el => {
  const s = S(), c = s.combate.lista.find(x => x.id === el.dataset.id), a = c.ataques[+el.dataset.i];
  const alvos = s.combate.lista.filter(x => x.id !== c.id && !cbInfo(s, x).fora || (x.pcId && x.id !== c.id));
  atkCtx = { id: c.id, i: +el.dataset.i };
  Modal.abrir(`<h2>${esc(c.nome)}: ${esc(a.nome)}</h2><p>${sg(a.bonus)} para acertar · ${esc(a.dados || '?')} ${esc((a.dano || '').toLowerCase())} · ${esc(a.alcance || '')}</p>
    <fieldset class="caixa"><legend>Em quem?</legend><div class="alvos">${alvos.map(x => { const inf = cbInfo(s, x); return `<button class="alvo" data-act="atk-alvo" data-alvo="${x.id}">${retratoHTML(inf.retrato, inf.nome, 64)}<b>${esc(inf.nome)}</b><small>CR ${inf.cr}</small></button>`; }).join('')}</div></fieldset>
    <div id="atk-res" aria-live="polite"></div>`, { classe: 'larga' });
};
ACT['atk-alvo'] = el => {
  const s = S(), c = s.combate.lista.find(x => x.id === atkCtx.id), a = c.ataques[atkCtx.i], alvo = s.combate.lista.find(x => x.id === el.dataset.alvo), inf = cbInfo(s, alvo);
  $$('.alvo').forEach(b => b.classList.toggle('on', b === el));
  const modo = sugestaoModo(s, c, alvo);
  $('#atk-res').innerHTML = `<div class="linha-bts">${[['', 'Normal'], ['vant', 'Vantagem'], ['desv', 'Desvantagem']].map(([m, n]) => `<button class="bt ${m === modo ? 'ouro' : ''}" data-act="atk-rolar" data-alvo="${alvo.id}" data-modo="${m}">${n}${m === modo && m ? ' (pelas condições)' : ''}</button>`).join('')}</div>
    <p class="nota">Alvo: ${esc(inf.nome)}, CR ${inf.cr}. 20 natural: acerta e é crítico (dados de dano em dobro); 1 natural: erra (LJ p. 290 e 292).</p>`;
};
ACT['atk-rolar'] = el => {
  const s = S(), c = s.combate.lista.find(x => x.id === atkCtx.id), a = c.ataques[atkCtx.i], alvo = s.combate.lista.find(x => x.id === el.dataset.alvo), inf = cbInfo(s, alvo);
  const r = d20(a.bonus, el.dataset.modo), acertou = !r.falha && (r.critico || r.total >= inf.cr);
  const dano = acertou && a.dados ? rolar(a.dados, { critico: r.critico }) : null;
  Som.tocar(r.critico ? 'critico' : r.falha ? 'falha' : acertou ? 'acerto' : 'dado');
  const ds = r.rolagens.map(v => `<span class="dd${v === r.nat ? ' usado' : ' fora'}${v === 20 ? ' max' : v === 1 ? ' min' : ''}">${v}</span>`).join('');
  $('#atk-res').innerHTML = `<div class="atk-out ${acertou ? 'hit' : 'miss'}">
      <div class="dds">${ds}<i>${sg(a.bonus)}</i><b class="tot">= ${r.total}</b><span>contra CR ${inf.cr}</span></div>
      <p class="veredito">${r.critico ? `${anim('soco', 1, { umaVez: true, dur: 0.6 })}${ic('cond2:critico', 64)} CRÍTICO!` : r.falha ? `${ic('cond2:falha', 64)} 1 natural: errou` : acertou ? `${anim('soco', 1, { umaVez: true, dur: 0.6 })} ACERTOU` : 'Errou'}</p>
      ${dano ? `<p>Dano: ${dano.partes.map(p => p.r.join('+')).join(' + ')}${dano.mod ? ' ' + sg(dano.mod) : ''} = <b class="tot">${dano.total}</b> ${esc((a.dano || '').toLowerCase())}</p>
        <div class="linha-bts"><button class="bt ruim" data-act="atk-aplicar" data-alvo="${alvo.id}" data-v="${dano.total}">Aplicar ${dano.total} em ${esc(inf.nome)}</button>
        <button class="bt" data-act="atk-aplicar" data-alvo="${alvo.id}" data-v="${Math.floor(dano.total / 2)}">Só metade (${Math.floor(dano.total / 2)})</button></div>` : ''}</div>`;
  Store.set(x => logCB(x, `${c.nome} → ${inf.nome}: ${a.nome} ${r.total}${r.critico ? ' (crítico)' : ''} ${acertou ? 'acertou' + (dano ? `, ${dano.total} de dano` : '') : 'errou'}`), null, { semDesfazer: true });
};
ACT['atk-aplicar'] = el => {
  const s = S(), alvo = s.combate.lista.find(x => x.id === el.dataset.alvo), v = +el.dataset.v; let m = [];
  Store.set(x => { const t = x.combate.lista.find(y => y.id === alvo.id); if (t.pcId) m = danoPC(cbPC(x, t), v); else m = danoNPC(t, v); logCB(x, `${cbInfo(x, t).nome} levou ${v}`); }, `${cbInfo(s, alvo).nome} levou ${v} de dano`);
  Modal.fechar(); toast(`<b>${esc(cbInfo(S(), alvo).nome)}</b> −${v}${m.length ? '<br>' + m.map(esc).join('<br>') : ''}`, { tipo: m.some(x => /MORT|caiu/.test(x)) ? 'ruim' : '', tempo: 5000 });
};
ACT['cb-turba'] = el => {
  const s = S(), c = s.combate.lista.find(x => x.id === el.dataset.id), a = c.ataques[0], grupo = s.combate.lista.filter(x => x.grupo === c.grupo && !x.derrotado);
  const alvos = s.combate.lista.filter(x => x.grupo !== c.grupo && !cbInfo(s, x).fora);
  Modal.abrir(`<h2>Turba: ${grupo.length}× ${esc(c.nome.replace(/ \d+$/, ''))}</h2><p>Sem rolar dado nem crítico: pela tabela da turba (GN p. 115), com ${esc(a.nome)} ${sg(a.bonus)}, dano médio ${a.media ?? media(a.dados)}.</p>
    <label class="campo-inline" for="tb-q2">Quantos atacam o mesmo alvo <input id="tb-q2" type="number" value="${grupo.length}" min="1" max="${grupo.length}"></label>
    <div class="alvos">${alvos.map(x => { const inf = cbInfo(s, x); const t = turba(inf.cr, a.bonus, grupo.length); return `<button class="alvo" data-act="turba-ok" data-alvo="${x.id}" data-mon="${c.id}">${retratoHTML(inf.retrato, inf.nome, 64)}<b>${esc(inf.nome)}</b><small>CR ${inf.cr} · ${t.acertos} acertos</small></button>`; }).join('')}</div>`, { classe: 'larga' });
};
ACT['turba-ok'] = el => {
  const s = S(), c = s.combate.lista.find(x => x.id === el.dataset.mon), a = c.ataques[0], alvo = s.combate.lista.find(x => x.id === el.dataset.alvo), inf = cbInfo(s, alvo);
  const q = +$('#tb-q2').value || 1, t = turba(inf.cr, a.bonus, q), dm = (a.media ?? media(a.dados)) * t.acertos;
  if (!t.acertos) { Modal.fechar(); return toast(`Precisavam de ${t.precisa}+: com ${q} atacantes, ninguém acertou ${esc(inf.nome)}.`); }
  confirmar(`${q} atacam ${esc(inf.nome)} (CR ${inf.cr}): precisam de ${t.precisa}, a cada ${t.por} um acerta → <b>${t.acertos} acertos</b> × ${a.media ?? media(a.dados)} = <b>${dm} de dano</b>. Aplicar?`,
    () => { ACT['atk-aplicar']({ dataset: { alvo: alvo.id, v: dm } }); Som.tocar('acerto'); }, { ok: `Aplicar ${dm}` });
};

/* cobertura e ajustes de CR também para inimigos e criaturas (LJ p. 291–292) */
ACT['cb-cr'] = el => {
  const c = S().combate.lista.find(x => x.id === el.dataset.id); if (!c) return;
  Modal.abrir(`<h2>CR de ${esc(c.nome)}</h2><p>CR da ficha: <b>${c.cr}</b> · ajuste atual: <b>${sg(c.crMod || 0)}</b></p>
    <div class="linha-bts">${[0, 2, 5].map(v => `<button class="bt" data-act="cb-cr-set" data-id="${c.id}" data-v="${v}">${v === 0 ? 'Sem cobertura' : v === 2 ? 'Meia cobertura +2' : 'Três quartos +5'}</button>`).join('')}</div>
    <label class="campo-inline" for="cbcr-livre">Outro ajuste <input id="cbcr-livre" type="number" inputmode="numeric" value="${c.crMod || 0}" data-enter="cb-cr-set" data-id="${c.id}"></label> <button class="bt fino" data-act="cb-cr-set" data-id="${c.id}">Usar</button>
    <p class="nota">Cobertura também dá o mesmo bônus em Salvaguardas de Destreza. Cobertura total: não pode ser alvo direto (LJ p. 291–292). O ajuste some quando a criatura sai da luta.</p>`);
};
ACT['cb-cr-set'] = el => { const v = el.dataset.v != null ? +el.dataset.v : parseInt(($('#cbcr-livre') || {}).value, 10) || 0; Store.set(s => { const c = s.combate.lista.find(x => x.id === el.dataset.id); if (c) c.crMod = v; }, null); Modal.fechar(); };
