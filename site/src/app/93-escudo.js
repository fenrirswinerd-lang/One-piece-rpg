/* ═══════════ escudo do narrador dentro da mesa: todas as regras com página, busca e selos de "não esquece disso" ═══════════ */
/* cartão novo pedido pelo mestre: Caminhos da Crueldade e da Extravagância (GN p. 77) */
(function cartaoRenome() {
  const tes = (window.ESCUDO || []).find(s => s.id === 'tesouro'); if (!tes || tes.cartoes.some(c => /Caminhos/.test(c.titulo))) return;
  tes.cartoes.push({ titulo: 'Ganhando renome: Caminhos da Crueldade e da Extravagância', fonte: 'GN p. 77', blocos: [
    { t: ['- **O que é:** atividade **entre aventuras**. O personagem passa o tempo livre fazendo fama, e a recompensa dele sobe.',
      '- **Caminho da Extravagância:** feitos que chocam a sociedade, mexem com grandes figuras ou instituições e balançam o status quo.',
      '- **Caminho da Crueldade:** violência excessiva contra inocentes, destruição de propriedades, massacres, arrasar áreas públicas. A fama corre bem mais rápido, mas fica muito mais provável a Marinha e o Governo Mundial virem pessoalmente acabar com ele.',
      '- **Como narrar:** só um resumo das ações e do impacto (nada que mude a história principal). Ex.: invadiu o QG na ausência do oficial, libertou os presos, queimou o quartel; no dia seguinte a foto dele queimando a bandeira está em todos os jornais.',
      '- **Enquanto faz fama, não pode:** espalhar boatos, treinar nível, treinar ou exercer profissão, farrear, cuidar das funções do navio ou contar dias de treino.'] },
    { table: [['Nível', 'Crueldade (milhões de ฿)', 'Extravagância (milhões de ฿)'], ['1º ao 4º', '1d12 + mod. de Presença', '1d6 + mod. de Presença'], ['5º ao 10º', '10d12 + Presença + nível', '10d6 + Presença + nível'],
      ['11º ao 16º', '20d12 + Presença + nível', '20d6 + Presença + nível'], ['17º ao 20º', '40d12 + Presença + nível', '40d6 + Presença + nível']] },
    { t: ['! Fora da Grand Line, o resultado dos dados cai pela metade (menos do 1º ao 4º nível).', '- A calculadora fica em Recompensas: rola, soma e publica o cartaz novo.'] }] });
})();
const SELOS_PADRAO = ['Regras da nossa mesa', 'Ainda a decidir', 'Zero PV e morte', 'PP e Sobrecarga', 'Exaustão', 'Concentração', 'Regras das Técnicas', 'Teste de Navegação',
  'Nosso grupo não tem navegador', 'Bônus × Vantagem', 'Ordem do combate', 'Recompensa (cartaz de procurado)', 'Ganhando renome: Caminhos da Crueldade e da Extravagância'];
const selado = t => { const c = S().config.selos; return c && c[t] !== undefined ? !!c[t] : SELOS_PADRAO.includes(t); };
VIEWS.escudo = {
  titulo: 'Regras com página', icone: 'modos:regras', busca: '', sec: lembrar('esc-sec') || 'selos',
  render() {
    const E = window.ESCUDO || [], q = sem(this.busca);
    const todos = E.flatMap(s => s.cartoes.map(c => ({ s, c })));
    let lista, titulo;
    if (q) { lista = todos.filter(({ c }) => sem(c.titulo + ' ' + JSON.stringify(c.blocos)).includes(q)); titulo = `Busca: ${esc(this.busca)} (${lista.length})`; }
    else if (this.sec === 'selos') { lista = todos.filter(({ c }) => selado(c.titulo)); titulo = 'Não esquece disso'; }
    else { const s = E.find(x => x.id === this.sec) || E[0]; lista = s ? s.cartoes.map(c => ({ s, c })) : []; titulo = s ? esc(s.titulo) : ''; }
    return `<div class="esc"><header class="esc-topo"><h1>${ic('modos:regras', 64)}Escudo do narrador</h1>
        <input id="esc-busca" class="cresce" type="search" placeholder="Buscar regra (ex.: exaustão, colisão, kit médico)" value="${esc(this.busca)}" data-chg="esc-busca" data-enter="esc-busca"></header>
      <nav class="esc-secs"><button class="chip ${this.sec === 'selos' && !q ? 'on' : ''}" data-act="esc-sec" data-s="selos">${ic('modos:selo', 32)} Não esquece disso</button>${E.map(s => `<button class="chip ${this.sec === s.id && !q ? 'on' : ''}" data-act="esc-sec" data-s="${s.id}">${esc(s.titulo)}</button>`).join('')}</nav>
      <h2>${titulo}</h2>${!q && this.sec !== 'selos' ? `<p class="nota">${esc((E.find(x => x.id === this.sec) || {}).resumo || '')}</p>` : ''}
      <div class="esc-grade">${lista.map(({ s, c }) => `<article class="card-esc ${selado(c.titulo) ? 'selado' : ''} ${c.mesa ? 'mesa' : ''}">
        <button class="selo-bt" data-act="esc-selo" data-t="${esc(c.titulo)}" title="${selado(c.titulo) ? 'Tirar o selo' : 'Marcar: não esquece disso'}">${ic('modos:selo', 32, selado(c.titulo) ? '' : 'apagado')}</button>
        ${cartaoEscudoHTML(c)}${q || this.sec === 'selos' ? `<p class="nota"><small>${esc(s.titulo)}</small></p>` : ''}${c.mesa ? '<p class="tag">Regra da nossa mesa</p>' : ''}</article>`).join('') || '<p class="nota">Nada encontrado.</p>'}</div></div>`;
  }
};
ACT['esc-sec'] = el => { VIEWS.escudo.sec = el.dataset.s; VIEWS.escudo.busca = ''; lembrar('esc-sec', el.dataset.s); App.render(); };
ACT['esc-busca'] = el => { VIEWS.escudo.busca = el.value.trim(); App.render(); };
ACT['esc-selo'] = el => { const t = el.dataset.t, v = !selado(t); Store.set(s => { s.config.selos = Object.assign({}, s.config.selos, { [t]: v }); }, null, { semDesfazer: true }); };
/* a busca filtra enquanto digita (sem perder o cursor) */
document.addEventListener('input', e => { if (e.target && e.target.id === 'esc-busca') { clearTimeout(VIEWS.escudo.t); VIEWS.escudo.t = setTimeout(() => { VIEWS.escudo.busca = e.target.value.trim(); App.render(); }, 250); } });

/* calculadora de renome (GN p. 77) dentro de Recompensas */
const _rec = VIEWS.recompensas.render;
VIEWS.recompensas.render = function () {
  const js = (M.jogadores || []).filter(j => j.estilo);
  const h = _rec.call(this);
  return h.replace(/<\/div>$/, `<section class="pap"><h2>${ic('trip:manchetes', 32)} Ganhando renome (GN p. 77)</h2>
    <p class="nota">Entre aventuras: escolha o caminho e role. O resultado é em milhões de Beli. Fora da Grand Line, os dados valem metade (menos do 1º ao 4º nível).</p>
    <div class="linha-bts"><select id="rn-j">${js.map(j => `<option value="${j.uid}">${esc(nomeJ(j))}</option>`).join('')}</select>
      <select id="rn-c"><option value="ext">Extravagância (d6)</option><option value="cru">Crueldade (d12)</option></select>
      <label class="ck-mini"><input type="checkbox" id="rn-gl" checked> na Grand Line</label><button class="bt" data-act="rn-rolar">${ic('mesa:d20', 32)} Rolar renome</button></div>
    <p id="rn-res" class="destaque" hidden></p></section></div>`);
};
ACT['rn-rolar'] = () => {
  const j = (M.jogadores || []).find(x => x.uid === $('#rn-j').value); if (!j) return toast('Escolha um jogador.');
  const f = fichaDe(j) || {}, nv = num(f.nivel) || 1, pre = attrMod(f, 'PRE'), cru = $('#rn-c').value === 'cru', gl = $('#rn-gl').checked;
  const qtd = nv <= 4 ? 1 : nv <= 10 ? 10 : nv <= 16 ? 20 : 40, face = cru ? 12 : 6, r = rolar(`${qtd}d${face}`);
  let dados = r.total; if (!gl && nv > 4) dados = Math.floor(dados / 2);
  const mi = Math.max(0, dados + pre + (nv > 4 ? nv : 0)), atual = (M.recompensas || {})[j.uid] ?? num(f.recompensa) ?? 0, novo = atual + mi * 1000000;
  const el = $('#rn-res'); el.hidden = false;
  el.innerHTML = `${qtd}d${face} = ${r.total}${!gl && nv > 4 ? ` → metade: ${dados}` : ''} ${sg(pre)} (Presença)${nv > 4 ? ` + ${nv} (nível)` : ''} = <b>${mi} milhões</b>. Recompensa de ${esc(nomeJ(j))}: ฿ ${fmt(atual)} → <b>฿ ${fmt(novo)}</b>
    <button class="bt bom fino" data-act="rn-pub" data-uid="${j.uid}" data-v="${novo}">Publicar cartaz</button>`;
  Som.tocar('dado');
};
ACT['rn-pub'] = el => { const inp = $('#rec-' + el.dataset.uid); if (inp) inp.value = el.dataset.v; ACT['rec-subir']({ dataset: { uid: el.dataset.uid } }); };
