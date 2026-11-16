/* ═══════════ VIAGEM: navegação, encontros marítimos, clima, navio (GN p. 60, 65–66 · LJ p. 156, 317) ═══════════ */
const mar = nome => MARES.find(m => m[0] === nome) || MARES[0];
VIEWS.viagem = {
  titulo: 'Viagem', icone: 'mar:luneta',
  render() {
    const s = S(), v = s.viagem, m = mar(v.mar), u = v.ultimo, nav = v.navio;
    const cl = v.clima ? clima(v.clima.t, v.clima.v, v.clima.c) : null;
    return `<section class="viagem c-carta">
      <div class="via-col">
        <div class="cartao-mar"><h1>${ic('mar:luneta', 64)}Viagem</h1>
          <div class="form-grade"><label>Mar<select data-chg="via-mar">${MARES.map(x => `<option ${x[0] === v.mar ? 'selected' : ''}>${x[0]}</option>`).join('')}</select></label>
          <label class="check"><input type="checkbox" data-chg="via-nav" ${v.navegador ? 'checked' : ''}> Tem Navegador ou Timoneiro</label>
          <label>${v.navegador ? 'Bônus do navegador (Sab + prof.)' : 'Vontade do capitão (mod.)'}<input type="number" value="${v.bonus}" data-chg="via-bonus" inputmode="numeric"></label></div>
          <ul class="via-nums"><li>CD <b>${m[1]}</b></li><li>Testes por viagem <b>até ${m[3]}</b></li><li>Rei dos Mares <b>${m[2]}</b></li><li>Dias no mar <b>${v.dias}</b></li></ul>
          ${v.navegador ? '' : '<p class="aviso-via">Sem navegador: o capitão rola só a Vontade, <b>com desvantagem</b> (GN p. 65). Desastres naturais: o navio leva o dano todo.</p>'}
          <div class="linha-bts"><button class="bt grande ouro" data-act="via-rolar">${ic('mar:luneta', 32)}Rolar navegação</button>
            ${v.navegador ? '' : `<button class="bt" data-act="via-atraso">Atraso sem navegador (1d4 meses)</button>`}
            <button class="bt fino" data-act="via-dia">+1 dia</button></div>
          <div id="via-res" class="via-res" aria-live="polite">${u ? resultadoViagem(u) : '<p class="nota">Peça o teste sempre que forem de uma ilha para outra ou ficarem em mar aberto. Falhou: role o encontro (d10).</p>'}</div>
        </div></div>
      <div class="via-col">
        <div class="cartao-mar clima-box"><h2>Clima do dia</h2>
          ${cl ? `<div class="clima-res">${ic(cl.icone, 128)}<div><p><b>Vento ${cl.vento.toLowerCase()} · chuva ${cl.chuva.toLowerCase()}</b>${cl.temp !== 'normal' ? ` · ${cl.temp === 'frio' ? 'mais frio' : 'mais quente'}` : ''}</p>
            <p class="nota">d20: temperatura ${cl.t} · vento ${cl.v} · chuva ${cl.c}</p>${cl.efeitos.map(([t, d]) => `<p><b>${t}:</b> ${d}</p>`).join('') || '<p>Tempo bom para navegar.</p>'}</div></div>` : '<p class="nota">Três d20: temperatura, vento e chuva (GN p. 60). Vento e chuva fortes juntos viram tormenta.</p>'}
          <button class="bt" data-act="via-clima">${ic('clima:sol_nuvens', 32)}Rolar clima</button></div>
        <div class="cartao-mar navio"><h2>${ic('mar:navio_pirata', 64)}<input class="titulo-in" value="${esc(nav.nome)}" data-chg="via-navnome" aria-label="Nome do navio"></h2>
          <div class="vital">${ic('status:defesa', 32)}<div class="vital-in"><div class="vital-num"><b>${nav.pv}</b>/${nav.pvMax} PV do navio</div>${barra(Math.max(0, nav.pv), nav.pvMax, 'pv')}</div></div>
          <div class="form-grade"><label>PV máx.<input type="number" value="${nav.pvMax}" data-chg="via-pvmax"></label><label>Bônus de Resistência<input type="number" value="${nav.br}" data-chg="via-br"></label></div>
          <div class="acoes"><input id="val-navio" class="valor" type="number" inputmode="numeric" placeholder="0" aria-label="Valor" data-enter="via-dano">
            <button class="bt ruim" data-act="via-dano">Dano</button><button class="bt bom" data-act="via-conserto">Conserto</button></div>
          <p class="nota">O Bônus de Resistência do navio tira esse valor de cada dano (LJ p. 317).</p></div>
      </div></section>`;
  }
};
function resultadoViagem(u) {
  let h = '';
  if (u.teste) {
    const t = u.teste;
    h += `<div class="via-teste ${t.passou ? 'ok' : 'falha'}">${t.anim ? anim('bussola', 1, { umaVez: true, dur: 1.2 }) : ic('mar:luneta', 64)}
      <div><p class="dds">${t.rolagens.map(x => `<span class="dd${x === t.nat ? ' usado' : ' fora'}">${x}</span>`).join('')}<i>${sg(t.bonus)}</i><b class="tot">= ${t.total}</b><span>contra CD ${t.cd}</span></p>
      <p class="veredito">${t.passou ? 'Rota segura. Sem incidentes.' : 'Falhou! Role o encontro marítimo.'}</p></div></div>`;
    if (!t.passou && !u.enc) h += `<div class="linha-bts"><button class="bt ruim grande" data-act="via-enc">Rolar encontro (d10)</button>${S().viagem.navegador ? '<button class="bt" data-act="via-enc" data-dois="1">Dos Males, o Menor: rolar 2 e escolher</button>' : ''}</div>`;
  }
  if (u.opcoes) h += `<p>Navegador rolou dois resultados (LJ p. 156). Escolha um:</p><div class="alvos">${u.opcoes.map(n => `<button class="alvo" data-act="via-escolhe" data-n="${n}">${ic(ENCONTRO_MAR[n].i, 64)}<b>${n}. ${ENCONTRO_MAR[n].n}</b></button>`).join('')}</div>`;
  if (u.enc) {
    const e = ENCONTRO_MAR[u.enc], calm = u.calm;
    h += `<article class="enc-mar">${u.enc === 8 ? anim('rei', 2, { umaVez: true, dur: 1.6 }) : ic(e.i, 128)}<div><h3>${u.enc}. ${calm ? 'Rei dos Mares' : e.n}</h3>
      ${calm ? `<p>No Calm Belt, “${e.n}” vira encontro com Reis dos Mares (GN p. 65).</p>` : `<p>${e.t}</p>`}
      ${!calm && e.cd ? (S().viagem.navegador ? `<div class="linha-bts"><button class="bt" data-act="via-desastre" data-ok="1">Passou no Desastre (CD ${e.cd}): metade</button><button class="bt ruim" data-act="via-desastre">Falhou: dano todo</button></div>`
        : `<p class="aviso-via">Sem Navegador ou Timoneiro não há Teste de Desastre: o navio leva tudo.</p><button class="bt ruim" data-act="via-desastre">Rolar ${e.dano} no navio</button>`) : ''}
      ${!calm && e.dias ? `<button class="bt" data-act="via-dias">Rolar 2d6 dias perdidos</button>` : ''}
      ${!calm && e.tempestade ? `<button class="bt" data-act="via-rolar" data-cd="25">Novo Teste de Navegação CD 25</button>` : ''}
      ${u.dano ? `<p class="tot-linha">Dano no navio: <b>${u.dano.total}</b>${u.dano.br ? ` − ${u.dano.br} (BR)` : ''} → <b>${u.dano.final}</b></p>` : ''}
      ${u.diasPerdidos ? `<p class="tot-linha">Perderam <b>${u.diasPerdidos} dias</b> até achar a rota.</p>` : ''}</div></article>`;
  }
  if (u.atraso) h += `<p class="tot-linha">Sem quem guie o navio: a viagem atrasa <b>${u.atraso} ${u.atraso > 1 ? 'meses' : 'mês'}</b>. Nesse tempo o mestre pode impor Desastres que falham sozinhos (LJ p. 317).</p>`;
  return h;
}
const setV = (fn, msg) => Store.set(s => fn(s.viagem, s), msg);
ACT['via-mar'] = el => { setV(v => { v.mar = el.value; }); if (typeof Mesa !== 'undefined' && Mesa.aberta && souMestre()) gravarEstado({ mar: el.value }); };
ACT['via-nav'] = el => setV(v => { v.navegador = el.checked; });
ACT['via-bonus'] = el => setV(v => { v.bonus = parseInt(el.value, 10) || 0; });
ACT['via-navnome'] = el => setV(v => { v.navio.nome = el.value.trim() || 'Nosso navio'; });
ACT['via-pvmax'] = el => setV(v => { v.navio.pvMax = Math.max(1, +el.value || 1); v.navio.pv = Math.min(v.navio.pv, v.navio.pvMax); });
ACT['via-br'] = el => setV(v => { v.navio.br = Math.max(0, +el.value || 0); });
ACT['via-dia'] = () => setV(v => { v.dias++; });
ACT['via-rolar'] = el => {
  const v = S().viagem, m = mar(v.mar), cd = el.dataset.cd ? +el.dataset.cd : m[1], modo = v.navegador ? '' : 'desv';
  let r = d20(v.bonus, modo); const passou = r.total >= cd;
  setV((x, s) => { x.ultimo = { teste: { ...r, cd, passou, anim: true }, enc: null }; s.tela.cena = 'carta'; s.tela.mostrar = { tipo: 'nav', passou, t: Date.now() }; }, `Teste de navegação (${v.mar}): ${r.total} contra CD ${cd}, ${passou ? 'passou' : 'falhou'}`);
  Som.tocar('onda'); setTimeout(() => Som.tocar(passou ? 'moeda' : 'falha'), 1100);
};
ACT['via-enc'] = el => {
  const dois = !!el.dataset.dois;
  if (dois) return setV(v => { v.ultimo.opcoes = [rnd(10), rnd(10)]; });
  aplicarEncontro(rnd(10));
};
ACT['via-escolhe'] = el => aplicarEncontro(+el.dataset.n);
function aplicarEncontro(n) {
  const v = S().viagem, calm = v.mar === 'Calm Belt' && [4, 7, 9, 10].includes(n);
  setV((x, s) => { x.ultimo.opcoes = null; x.ultimo.enc = n; x.ultimo.calm = calm; s.tela.mostrar = { tipo: 'mar', n: calm ? 8 : n, t: Date.now() }; }, `Encontro marítimo: ${n}. ${calm ? 'Rei dos Mares (Calm Belt)' : ENCONTRO_MAR[n].n}`);
  Som.tocar(n === 8 || calm ? 'canhao' : 'onda');
}
ACT['via-desastre'] = el => {
  const v = S().viagem, e = ENCONTRO_MAR[v.ultimo.enc], r = rolar(e.dano), tot = el.dataset.ok ? Math.floor(r.total / 2) : r.total, fin = Math.max(0, tot - (v.navio.br || 0));
  setV(x => { x.ultimo.dano = { total: tot, br: x.navio.br, final: fin }; x.navio.pv = x.navio.pv - fin; }, `${e.n}: navio levou ${fin}`);
  Som.tocar('canhao');
};
ACT['via-dias'] = () => { const r = rolar('2d6'); setV(x => { x.ultimo.diasPerdidos = r.total; x.dias += r.total; }, `Perderam o trajeto: ${r.total} dias`); };
ACT['via-atraso'] = () => { const r = rnd(4); setV(x => { x.ultimo = { ...(x.ultimo || {}), atraso: r }; }, `Sem navegador: atraso de ${r} mes(es)`); };
ACT['via-clima'] = () => { const t = rnd(20), v = rnd(20), c = rnd(20); setV((x, s) => { x.clima = { t, v, c }; s.tela.mostrar = { tipo: 'clima', t: Date.now() }; }, `Clima: d20 ${t}/${v}/${c}`); Som.tocar('onda'); };
const valNavio = () => Math.abs(parseInt(($('#val-navio') || {}).value, 10) || 0);
ACT['via-dano'] = () => { const d = valNavio(); if (!d) return; const f = Math.max(0, d - (S().viagem.navio.br || 0)); setV(x => { x.navio.pv -= f; }, `Navio levou ${f} (${d} − BR)`); Som.tocar('canhao'); };
ACT['via-conserto'] = () => { const d = valNavio(); if (!d) return; setV(x => { x.navio.pv = Math.min(x.navio.pvMax, x.navio.pv + d); }, `Navio consertado: +${d}`); };

/* ═══════════ TESOURO (GN p. 82) ═══════════ */
VIEWS.tesouro = {
  titulo: 'Tesouro', icone: 'tesouro:bau',
  render() {
    const s = S(), u = s.tesouros[s.tesouros.length - 1], nv = niveisGrupo(s), med = nv.length ? nv.reduce((a, b) => a + b, 0) / nv.length : 1;
    return `<section class="tesouro"><div class="bau-palco">${u && u.novo ? anim('bau', 3, { umaVez: true, dur: 1.1 }) : quadro('bau', 3, u ? 7 : 0)}
      <div class="bau-bts"><button class="bt grande ouro" data-act="tes-rolar">${ic('tesouro:bau', 32)}Abrir baú (d100)</button>
        <label class="campo-inline" for="tes-n">ou digite o d100 <input id="tes-n" type="number" min="1" max="100" inputmode="numeric" data-enter="tes-manual"></label></div></div>
      ${u ? `<article class="tes-res ${u.novo ? 'surge' : ''}">${u.i ? ic(u.i, 128) : ''}<div><p class="nota">d100: ${u.n}</p><h2>${esc(u.item)}</h2>
        ${u.metade && med < 11 ? `<p class="aviso-via">O grupo está abaixo do 11º nível: recebe <b>metade</b> desse valor (GN p. 82).</p>` : ''}
        ${/3d10/.test(u.item) ? `<button class="bt" data-act="rolar" data-expr="3d10" data-titulo="Munições de Kairoseki">Rolar 3d10</button>` : ''}
        ${typeof Mesa !== 'undefined' && Mesa.aberta ? `<button class="bt bom" data-act="tes-mostrar">${ic('mesa:imagem', 32)} Mostrar na mesa e entregar</button>` : ''}</div></article>` : '<p class="nota centro">Achou um tesouro enterrado ou num navio afundado? Abra o baú. Ou escolha o item da tabela que quiser.</p>'}
      <details class="tes-tab"><summary>Tabela inteira</summary><ol>${TESOURO.map((t, i) => `<li><span>${t[0]}${TESOURO[i + 1] && TESOURO[i + 1][0] - 1 > t[0] ? '–' + (TESOURO[i + 1][0] - 1) : ''}</span>${t[2] ? ic(t[2], 32) : '<i class="ico"></i>'}${esc(t[1])}${t[3] ? ' *' : ''}</li>`).join('')}</ol><p class="nota">* abaixo do 11º nível: metade do valor.</p></details>
      ${s.tesouros.length ? `<h3>Já encontrados</h3><ul class="tes-hist">${s.tesouros.slice().reverse().map(t => `<li>${t.i ? ic(t.i, 32) : ''}<span>${esc(t.item)}</span><small>${hora(t.t)}</small></li>`).join('')}</ul>` : ''}</section>`;
  },
  depois() { const u = S().tesouros[S().tesouros.length - 1]; if (u && u.novo) { u.novo = false; Store.save(); } }
};
function abrirBau(n) {
  const t = tesouroDe(n);
  Store.set(s => { s.tesouros.push({ n, item: t[1], i: t[2], metade: !!t[3], t: Date.now(), novo: true }); s.tela.mostrar = { tipo: 'tesouro', n, t: Date.now() }; }, `Tesouro (d100 ${n}): ${t[1]}`);
  Som.tocar('moeda'); setTimeout(() => Som.tocar(n >= 84 ? 'critico' : 'moeda'), 700);
}
ACT['tes-rolar'] = () => abrirBau(rnd(100));
ACT['tes-manual'] = () => { const n = clamp(parseInt($('#tes-n').value, 10) || 0, 1, 100); abrirBau(n); };


/* valor do tesouro em Beli: moeda e nota se resgatam direto; joia/arte é vendida.
   Abaixo do 11º nível, os itens marcados na tabela valem metade (GN p. 82). */
function valorTesouro(u) {
  const m = /฿\s*([\d.]+)/.exec(u.item || ''); if (!m) return { valor: 0, modo: '' };
  let valor = +m[1].replace(/\./g, '');
  const nv = niveisGrupo(S()), med = nv.length ? nv.reduce((a, b) => a + b, 0) / nv.length : 1;
  if (u.metade && med < 11) valor = Math.round(valor / 2);
  return { valor, modo: /moeda|nota/i.test(u.item) ? 'resgate' : /joias|ouro|arte/i.test(u.item) ? 'venda' : '' };
}
/* ───── mostrar o tesouro na mesa: o mestre escolhe quem vê e de quem é ───── */
ACT['tes-mostrar'] = () => {
  const u = S().tesouros[S().tesouros.length - 1]; if (!u) return;
  const js = (M.jogadores || []).filter(j => j.estilo);
  if (!js.length) return toast('Nenhum jogador na mesa ainda.', { tipo: 'ruim' });
  Modal.abrir(`<h2>${ic('tesouro:bau', 32)} ${esc(u.item)}</h2>
    <p class="nota">Escolha quem vê a tela do tesouro e quem fica com ele. O tesouro é sempre de uma pessoa: ela guarda na mochila com um toque. Moeda e nota viram Beli com o botão Resgatar; joia e arte têm que ser vendidas.</p>
    <h3>Quem vê</h3><div class="tes-quem">${js.map(j => `<label class="ck"><input type="checkbox" class="tes-ve" value="${j.uid}" checked> ${esc(nomeJ(j))}</label>`).join('')}</div>
    <h3>De quem é</h3><select id="tes-para">${js.map(j => `<option value="${j.uid}">${esc(nomeJ(j))}</option>`).join('')}</select>
    <div class="linha-bts"><button class="bt bom" data-act="tes-enviar">Mostrar agora</button></div>`);
};
ACT['tes-enviar'] = () => {
  const u = S().tesouros[S().tesouros.length - 1]; if (!u) return;
  const verem = [...document.querySelectorAll('.tes-ve:checked')].map(e => e.value);
  if (!verem.length) return toast('Marque pelo menos uma pessoa.', { tipo: 'ruim' });
  const para = ($('#tes-para') || {}).value || '';
  const j = (M.jogadores || []).find(x => x.uid === para);
  Modal.fechar();
  const v = valorTesouro(u);
  avisar('tesouro', u.item, { item: u.item, i: u.i || '', n: u.n, verem, para, paraNome: j ? nomeJ(j) : '', valor: v.valor, modo: v.modo });
  toast('Tesouro mostrado para ' + verem.length + (verem.length === 1 ? ' pessoa.' : ' pessoas.'), { tipo: 'bom' });
};
