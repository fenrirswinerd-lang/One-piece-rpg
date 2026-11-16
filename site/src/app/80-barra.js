/* ═══════════ BARRA DE BÔNUS (regra da casa) + marcos ═══════════ */
function xpNoArco(s, pid) {
  return s.xp.registros.filter(r => r.arco === s.xp.arco && r.jogadores.includes(pid)).reduce((a, r) => a + Math.round(r.xp / Math.max(1, r.partes || r.jogadores.length)), 0)   /* partes: quem dividiu o XP, aliados inclusos (GN p. 120) */ + (s.xp.ajustes[s.xp.arco + '|' + pid] || 0);
}
function tamBarra(s, nivel) { const t = (LIM[clamp(nivel || 1, 1, 20)] || LIM[1])[4]; return s.xp.metade ? Math.round(t / 2) : t; }
VIEWS.barra = {
  titulo: 'Barra de Bônus', icone: 'poderes:subir_nivel',
  render() {
    const s = S(), pcs = pcsMesa(s), regs = s.xp.registros.filter(r => r.arco === s.xp.arco);
    return `<section class="barra-xp"><div class="bx-cab"><div><h1>${ic('poderes:subir_nivel', 64)}Barra de Bônus</h1>
        <p class="nota">Regra da mesa: só encontro <b>não planejado</b> dá XP. Barra cheia = +1 nível extra no próximo marco (no máximo 1 por arco). O tamanho da barra é o XP que falta para o próximo nível na tabela do LJ (p. 13).</p></div>
      <div class="form-grade"><label>Arco atual<input value="${esc(s.xp.arco)}" data-chg="bx-arco"></label>
        <label class="check"><input type="checkbox" data-chg="bx-metade" ${s.xp.metade ? 'checked' : ''}> Barra pela metade (se estiver lenta)</label></div></div>
      <div class="bx-pcs">${pcs.map(p => { const xp = xpNoArco(s, p.id), tam = tamBarra(s, p.sheet.nivel), cheia = xp >= tam;
        return `<article class="bx-pc ${cheia ? 'cheia' : ''}">${retratoHTML(p.live.retrato, nomePC(p), 64)}<div class="bx-in"><h3>${esc(nomePC(p))} <small>Nv ${p.sheet.nivel}</small></h3>
          <div class="barra xp"><i style="width:${Math.min(100, 100 * xp / Math.max(1, tam))}%"></i></div>
          <p>${fmt(xp)} / ${fmt(tam)} XP ${cheia ? `<b class="selo-cheia">${ic('status:nivel', 32)}CHEIA: +1 nível no próximo marco</b>` : `· faltam ${fmt(tam - xp)}`}</p>
          <label class="campo-inline">Ajuste <input type="number" value="${s.xp.ajustes[s.xp.arco + '|' + p.id] || 0}" data-chg="bx-aj" data-id="${p.id}" aria-label="Ajuste de XP de ${esc(nomePC(p))}"></label></div></article>`; }).join('') || '<p class="nota">Conecte as fichas na Mesa.</p>'}</div>
      <div class="linha-bts"><button class="bt" data-act="bx-manual">${ic('status:notas', 32)}Registrar XP à mão</button>
        <button class="bt ouro grande" data-act="bx-marco">${ic('poderes:subir_nivel', 32)}Fechar o arco (marco)</button></div>
      <h2>Encontros improvisados deste arco</h2>
      <ul class="bx-regs">${regs.length ? regs.slice().reverse().map(r => `<li><span>${esc(r.desc)}</span><b>${fmt(r.xp)} XP</b><small>${fmt(Math.round(r.xp / Math.max(1, r.jogadores.length)))} cada · ${hora(r.t)}</small>
        <button class="link" data-act="bx-apagar" data-id="${r.id}">apagar</button></li>`).join('') : '<li class="vazio-li">Nenhum ainda. Vença um encontro improvisado e use “Registrar vitória” na aba Encontro.</li>'}</ul>
      ${s.xp.arcos.length ? `<h2>Arcos fechados</h2><ul class="bx-regs">${s.xp.arcos.slice().reverse().map(a => `<li><span><b>${esc(a.nome)}</b> · ${esc(a.resumo)}</span><small>${new Date(a.t).toLocaleDateString('pt-BR')}</small></li>`).join('')}</ul>` : ''}
    </section>`;
  }
};
ACT['bx-arco'] = el => Store.set(s => { s.xp.arco = el.value.trim() || 'Arco sem nome'; }, null);
ACT['bx-metade'] = el => Store.set(s => { s.xp.metade = el.checked; }, null);
ACT['bx-aj'] = el => Store.set(s => { s.xp.ajustes[s.xp.arco + '|' + el.dataset.id] = parseInt(el.value, 10) || 0; }, null);
ACT['bx-apagar'] = el => Store.set(s => { s.xp.registros = s.xp.registros.filter(r => r.id !== el.dataset.id); }, null);
ACT['bx-manual'] = () => Modal.abrir(`<h2>Registrar XP</h2><label class="campo">O que foi<input id="bxm-d" placeholder="ex.: briga no porto"></label>
  <label class="campo">XP total do encontro (sem multiplicador)<input id="bxm-x" type="number" inputmode="numeric"></label><p class="nota">É dividido entre todos os jogadores conectados.</p>
  <button class="bt bom" data-act="bx-manual-ok">Registrar</button>`);
ACT['bx-manual-ok'] = () => {
  const x = parseInt($('#bxm-x').value, 10); if (!x) return toast('Digite o XP.');
  Store.set(s => { s.xp.registros.push({ id: uid(), arco: s.xp.arco, desc: $('#bxm-d').value.trim() || 'Encontro', xp: x, jogadores: pcsMesa(s).map(p => p.id), t: Date.now() }); }, `XP registrado: ${x}`);
  Modal.fechar(); Som.tocar('moeda');
};
ACT['bx-marco'] = () => {
  const s = S(), pcs = pcsMesa(s);
  const linhas = pcs.map(p => { const cheia = xpNoArco(s, p.id) >= tamBarra(s, p.sheet.nivel); return { p, sobe: cheia ? 2 : 1 }; });
  Modal.abrir(`<h2>Fechar o arco “${esc(s.xp.arco)}”</h2><p>No marco, todo mundo sobe <b>+1 nível</b>. Quem está com a barra cheia sobe <b>+1 extra</b>.</p>
    <ul class="marco">${linhas.map(l => `<li>${retratoHTML(l.p.live.retrato, nomePC(l.p), 64)}<b>${esc(nomePC(l.p))}</b><span>Nv ${l.p.sheet.nivel} → <b>${l.p.sheet.nivel + l.sobe}</b>${l.sobe > 1 ? ' (barra cheia)' : ''}</span></li>`).join('')}</ul>
    <label class="campo">Nome do próximo arco<input id="mc-nome" placeholder="ex.: Casca Branca"></label>
    <p class="nota">Os jogadores sobem de nível na própria ficha; depois é só “Ler fichas” na Mesa.</p>
    <button class="bt ouro" data-act="bx-marco-ok">${ic('poderes:subir_nivel', 32)}Fechar arco</button>`);
};
ACT['bx-marco-ok'] = () => {
  const s = S(), pcs = pcsMesa(s), novo = $('#mc-nome').value.trim() || 'Novo arco';
  const resumo = pcs.map(p => `${nomePC(p)} +${xpNoArco(s, p.id) >= tamBarra(s, p.sheet.nivel) ? 2 : 1}`).join(', ');
  Store.set(x => { x.xp.arcos.push({ nome: x.xp.arco, resumo, t: Date.now() }); x.xp.arco = novo; }, `Marco: fim do arco (${resumo})`);
  Modal.fechar(); Som.tocar('nivel');
  Modal.abrir(`<div class="festa">${anim('nivel', 3, { umaVez: true, dur: 1.2 })}<h2>Subiram de nível!</h2><p>${esc(resumo)}</p><p class="nota">Arco novo: ${esc(novo)}.</p></div>`);
};

/* ═══════════ REGRAS: colinha rápida ═══════════ */
VIEWS.regras = {
  titulo: 'Regras rápidas', icone: 'tesouro:livro',
  render() {
    const sec = (t, h) => `<section class="regra"><h2>${t}</h2>${h}</section>`;
    return `<div class="regras"><h1>${ic('tesouro:livro', 64)}Regras rápidas</h1><p class="nota">O essencial numa página só. Com busca, selos e todas as páginas do livro: <button class="link" data-rota="escudo">Regras com página</button>.</p>
      ${sec('Condições <small>LJ p. 269–273</small>', `<div class="conds-lista">${COND.map(c => `<article>${ic(c.i, 64)}<div><b>${c.n}</b>${c.pp != null ? `<small>${c.pp} PP</small>` : ''}<p>${esc(c.t)}</p></div></article>`).join('')}</div>`)}
      <div class="regras-grade">
      ${sec('Exaustão <small>LJ p. 37 e 272</small>', `<table class="tab"><tr><th>Nível</th><th>d20</th><th>Desloc.</th></tr>${EXA.slice(1).map(e => `<tr><td>${e[0]}</td><td>${e[1] == null ? 'Desmaio' : e[1]}</td><td>${e[2] == null ? 'Desmaio' : '−' + String(e[2]).replace('.', ',') + ' m'}</td></tr>`).join('')}</table>
        <p>No 6º nível: desmaio (cai a 0 PV). Descanso longo tira 1 nível. Com exaustão, o descanso longo só devolve metade dos PP.</p><p><b>Sobrecarga:</b> sem PP, dá para usar técnica e ganhar exaustão igual ao grau dela. Não passa do 5º nível; 6º e 7º grau não podem.</p>`)}
      ${sec('Morte e PV negativos <small>LJ p. 293</small>', `<p>A 0 PV: cai inconsciente. Se o golpe que derrubou ainda sobrar dano <b>igual ou maior que o PV máximo</b>: morte instantânea.</p>
        <p>Caído, todo dano novo vira <b>PV negativo</b>. Somou o PV máximo: morre. O dano do golpe que derrubou não conta.</p><p>Qualquer cura acorda e zera os negativos.</p>`)}
      ${sec('Descansos <small>LJ p. 278</small>', `<p><b>Curto (30 min):</b> gasta Dados de Vida; cada um cura o dado + mod. de Con (se positivo).</p>
        <p><b>Longo (8 h):</b> PV cheios, PP de volta, recupera metade dos Dados de Vida (mín. 1). Precisa de 1 PV no início. Uma vez a cada 24 h.</p>`)}
      ${sec('Crítico, cobertura e concentração', `<p><b>Crítico:</b> rola todos os dados de dano duas vezes, depois soma os modificadores. 20 natural sempre acerta; 1 natural sempre erra (LJ p. 290 e 292).</p>
        <p><b>Cobertura:</b> meia +2 na CR e Salv. Des; três quartos +5; total não pode ser alvo direto (LJ p. 291–292).</p>
        <p><b>Concentração:</b> levou dano, Salv. Con CD 10 ou metade do dano, o maior (LJ p. 267).</p>`)}
      ${sec('Turba <small>GN p. 115</small>', `<table class="tab"><tr><th>Precisa no d20</th><th>Atacantes para 1 acerto</th></tr>${[['1–5', 1], ['6–12', 2], ['13–14', 3], ['15–16', 4], ['17–18', 5], ['19', 10], ['20', 20]].map(([a, b]) => `<tr><td>${a}</td><td>${b}</td></tr>`).join('')}</table><p>Sem críticos. Danos diferentes: o que dá mais dano acerta.</p>`)}
      ${sec('Dano improvisado <small>GN p. 114</small>', `<table class="tab"><tr><th>Nível</th><th>Inconveniente</th><th>Perigosa</th><th>Mortal</th></tr>${Object.entries(DANO_IMP).map(([k, v]) => `<tr><td>${k}</td>${v.map(x => `<td><button class="link" data-act="rolar" data-expr="${x}">${x}</button></td>`).join('')}</tr>`).join('')}</table>
        <p>Exemplos: 1d10 brasa, estante caindo · 2d10 relâmpago, fogueira · 4d10 túnel desabando · 10d10 paredes se fechando, rio de lava · 18d10 imerso em lava · 24d10 redemoinho de fogo.</p>`)}
      ${sec('Mares <small>GN p. 65</small>', `<table class="tab"><tr><th>Mar</th><th>CD</th><th>Rei dos Mares</th><th>Testes</th></tr>${MARES.map(m => `<tr><td>${m[0]}</td><td>${m[1]}</td><td>${m[2]}</td><td>até ${m[3]}</td></tr>`).join('')}</table>`)}
      ${sec('Iniciativa e percepção', `<p><b>Iniciativa:</b> teste de Destreza. Grupo de criaturas iguais rola uma vez. Surpreso: desvantagem (LJ p. 284).</p><p><b>Percepção passiva:</b> 10 + Percepção; vantagem +5, desvantagem −5 (LJ p. 263).</p>`)}
      </div></div>`;
  }
};
