/* ═══════════ MESA: cartões dos jogadores ═══════════ */
const pcPorId = id => S().party.find(p => p.id === id);
function alvoConds(s, alvo) {
  const [k, id] = alvo.split(':');
  if (k === 'pc') { const p = s.party.find(x => x.id === id); return p ? { dono: p.live, nome: nomePC(p) } : null; }
  const c = s.combate.lista.find(x => x.id === id); if (!c) return null;
  if (c.pcId) { const p = s.party.find(x => x.id === c.pcId); return p ? { dono: p.live, nome: nomePC(p) } : null; }
  return { dono: c, nome: c.nome };
}

function cartaPC(pc) {
  const id = pc.id;
  if (!pc.sheet) return `<article class="carta pc vazia" data-pc="${id}"><div class="vazia-in">${retratoHTML(null, pc.apelido)}
    <div><h3>${esc(pc.apelido || 'Novo jogador')}</h3><p>Sem ficha conectada.</p><button class="bt" data-act="pc-editar" data-id="${id}">Conectar ficha</button></div></div></article>`;
  const s = pc.sheet, c = calc(pc), L = pc.live;
  const cls = { Morto: 'morto', 'Caído': 'caido', 'Abaixo da metade': 'mal' }[c.estado] || '';
  const alertas = [];
  if (L.morto) alertas.push(`<div class="alerta preto">${anim('caveira', 1, { classe: 'mini' })}<span><b>Morto.</b> Se foi engano: <button class="link" data-act="pc-reviver" data-id="${id}">desfazer a morte</button></span></div>`);
  else if (c.pv <= 0) alertas.push(`<div class="alerta ruim">${ic('cond1:inconsciente', 32)}<span><b>Caído e inconsciente.</b> PV negativos ${c.neg} de ${c.pvMax}. Qualquer cura acorda.</span></div>`);
  if (c.exa >= 6) alertas.push(`<div class="alerta ruim">${ic('cond2:sobrecarga', 32)}<span><b>Desmaiado</b> pela exaustão (nível 6).</span></div>`);
  if (!L.morto && c.sobrecarga) alertas.push(`<div class="alerta azul">${ic('cond2:sobrecarga', 32)}<span><b>Sem PP.</b> Técnica só por Sobrecarga: ganha exaustão igual ao grau (até o 5º nível; 6º e 7º grau não).</span></div>`);
  if (nomesCond(L.conds).has('Concentrando') && !L.morto) alertas.push(`<div class="alerta">${ic('cond2:concentrando', 32)}<span><b>Concentrando.</b> Levou dano: Salv. Con CD 10 ou metade do dano.</span></div>`);
  if (nomesCond(L.conds).has('Doente')) alertas.push(`<div class="alerta">${ic('cond2:doente', 32)}<span><b>Doente:</b> PV máx. ${c.pvMax}${L.perdido ? ` (−${L.perdido} pela doença)` : ''}.</span></div>`);
  if (pc.aviso && pc.aviso.pv != null) alertas.push(`<div class="alerta azul">${ic('status:notas', 32)}<span>A ficha agora diz <b>PV ${pc.aviso.pv}</b>. <button class="link" data-act="pc-aviso" data-id="${id}" data-usar="1">Usar</button> · <button class="link" data-act="pc-aviso" data-id="${id}">Ignorar</button></span></div>`);
  if (pc.subiu) alertas.push(`<div class="alerta bom">${ic('poderes:subir_nivel', 32)}<span><b>Subiu de nível:</b> ${pc.subiu.de} → ${pc.subiu.para}. <button class="link" data-act="pc-subiu" data-id="${id}">Ver o que ganha</button> · <button class="link" data-act="pc-subiu-ok" data-id="${id}">Já vi</button></span></div>`);
  if (pc.sync && pc.sync.estado === 'erro') alertas.push(`<div class="alerta">${ic('status:busca', 32)}<span>Não li a ficha: ${esc(pc.sync.msg)}</span></div>`);
  const exaTxt = c.exa ? (c.exa >= 6 ? 'desmaio' : `d20 ${EXA[c.exa][1]} · desloc. −${String(EXA[c.exa][2]).replace('.', ',')} m · descanso longo só devolve metade dos PP`) : 'sem exaustão';
  const arma = c.arma ? `${esc(c.arma.nome)} ${c.arma.bonusAgora != null ? sg(c.arma.bonusAgora) : esc(c.arma.bonus || '')} · ${esc(c.arma.dano || '')}` : '—';
  const modo = m => m ? `<em class="${m}">${m === 'vant' ? 'vant.' : 'desv.'}</em>` : '';
  const sync = pc.sync && pc.sync.estado === 'lendo' ? `<span class="selo" data-sync="${id}">lendo ${pc.sync.p || 0}%</span>`
    : pc.origem === 'demo' ? '<span class="selo">exemplo</span>' : pc.lidoEm ? `<span class="selo" title="Ficha lida às ${hora(pc.lidoEm)}">${pc.origem === 'link' ? 'link' : 'arquivo'} · ${hora(pc.lidoEm)}</span>` : '';
  return `<article class="carta pc ${cls}" data-pc="${id}" style="--pv:${c.pvMax ? c.pv / c.pvMax : 0}">
    <div class="poster" data-act="pc-editar" data-id="${id}" title="Trocar retrato ou ficha">
      <div class="foto">${fotoCartaz(L.retrato, nomePC(pc))}</div><img class="cz-arte" src="${img('cartaz_base') || img('cartaz')}" alt="">
      ${s.alcunha ? `<span class="poster-alc" style="--n:${czLen(comAspas(s.alcunha))}">${esc(comAspas(s.alcunha))}</span>` : ''}<span class="poster-nome" style="--n:${czLen(nomePC(pc))}">${esc(nomePC(pc))}</span><span class="poster-bounty">฿ ${num(s.recompensa) ? fmt(num(s.recompensa)) : '—'}</span></div>
    <header class="carta-topo"><h3>${esc(nomePC(pc))}</h3>
      <p>${pc.pdm ? '<span class="selo pdm">do mestre</span> ' : pc.aliado ? '<span class="selo pdm">aliado</span> ' : esc(jogadorPC(pc)) + ' · '}Nv ${s.nivel || '?'} · ${esc([s.estilo, s.profissao, s.especie].filter(Boolean).join(' · '))}</p>${sync}</header>
    <div class="vitais">
      <div class="vital">${ic('status:vida', 32)}<div class="vital-in"><div class="vital-num"><b>${c.pv}</b>/${c.pvMax}${c.temp ? ` <span class="temp">${ic('status:vida_temp', 32)}+${c.temp}</span>` : ''}<small>${esc(c.estado)}</small></div>${barra(Math.max(0, c.pv), c.pvMax, 'pv')}</div></div>
      <div class="vital">${ic('status:poder', 32)}<div class="vital-in"><div class="vital-num"><b>${c.pp}</b>/${c.ppMax}${c.sobrecarga ? '<small class="ruim">sem PP</small>' : ''}</div>${barra(Math.max(0, c.pp), c.ppMax, 'pp')}</div></div>
    </div>
    <ul class="nums">
      <li title="Classe de Resistência">${ic('status:defesa', 32)}<span>CR</span><b>${c.cr}</b>${(L.crMod || crNomTotal(L)) ? `<small title="${esc(((L.crNom || []).filter(b => b.on !== false).map(b => b.n + ' ' + sg(b.v))).concat(L.crMod ? ['Ajuste ' + sg(L.crMod)] : []).join(' · '))}">${sg((L.crMod || 0) + crNomTotal(L))}</small>` : ''}</li>
      <li title="CD das técnicas do estilo${c.cdFruta != null ? ' e da fruta' : ''}">${ic('status:dificuldade', 32)}<span>CD téc.</span><b>${c.cd ?? '—'}</b>${c.cdFruta != null ? `<small>fruta ${c.cdFruta}</small>` : ''}</li>
      <li title="Ataque de técnica do estilo${c.atkFruta != null ? ' e da fruta' : ''}, já com exaustão">${ic('poderes:corte_voador', 32)}<span>Atq. téc.</span><b>${sg(c.atk)}</b>${c.atkFruta != null ? `<small>fruta ${sg(c.atkFruta)}</small>` : ''}${modo(c.modoAtk)}</li>
      <li title="Percepção passiva">${ic('status:percepcao', 32)}<span>Perc.</span><b>${c.perc}</b></li>
      <li title="Iniciativa (mod. de Destreza, já com exaustão)">${ic('status:iniciativa', 32)}<span>Inic.</span><b>${sg(c.ini)}</b>${modo(c.modoIni)}</li>
      <li title="Deslocamento por terra agora">${ic('status:deslocamento', 32)}<span>Desl.</span><b>${String(c.desl).replace('.', ',')} m</b></li>
      <li class="larga" title="Primeira arma da ficha">${ic('tesouro:espada', 32)}<span>Arma</span><b>${arma}</b>${modo(c.modoComum)}</li>
    </ul>
    <div class="exa" role="group" aria-label="Exaustão"><span class="rot">Exaustão</span>
      ${[1, 2, 3, 4, 5, 6].map(k => `<button class="pip ${k <= c.exa ? 'on' : ''}" data-act="pc-exa" data-id="${id}" data-n="${k}" aria-label="Exaustão ${k}" aria-pressed="${k <= c.exa}">${k}</button>`).join('')}
      <small>${exaTxt}</small></div>
    <div class="conds">${(L.conds || []).map((x, i) => chipCond(x, 'pc:' + id, i)).join('')}<button class="cond add" data-act="cond-novo" data-alvo="pc:${id}">+ Condição</button></div>
    ${alertas.join('')}
    <div class="acoes">
      <label class="sr" for="val-${id}">Valor</label>
      <input id="val-${id}" class="valor" type="number" inputmode="numeric" min="0" placeholder="0" data-enter="pc-dano" data-id="${id}">
      <button class="bt ruim" data-act="pc-dano" data-id="${id}">${ic('status:dano', 32)}Dano</button>
      <button class="bt bom" data-act="pc-cura" data-id="${id}">${ic('status:cura', 32)}Cura</button>
      <button class="bt" data-act="pc-temp" data-id="${id}">PV temp.</button>
      <button class="bt azul" data-act="pc-pp" data-id="${id}" data-d="-1">Gastar PP</button>
      <button class="bt" data-act="pc-pp" data-id="${id}" data-d="1">+PP</button>
    </div>
    <footer class="carta-pe">
      <button class="bt fino" data-act="pc-ficha" data-id="${id}">${ic('tesouro:livro', 32)}Ficha</button>
      <button class="bt fino" data-act="pc-curto" data-id="${id}">${ic('cond2:descanso_curto', 32)}Desc. curto</button>
      <button class="bt fino" data-act="pc-longo" data-id="${id}">${ic('cond2:descanso_longo', 32)}Desc. longo</button>
      <button class="bt fino" data-act="pc-cr" data-id="${id}" title="Ajuste de CR (cobertura etc.)">CR ±</button>
    </footer></article>`;
}

VIEWS.grupo = {
  titulo: 'Grupo', icone: 'status:vida',
  render() {
    const s = S();
    const gr = grupoDe(s);
    if (!gr.length) return `<section class="boas-vindas c-abertura">${gaivota(1)}${gaivota(1, 'tarde')}
      <div class="bv-in"><h1>Controle do Mestre</h1><p>Cole o link da ficha de cada jogador (ou abra o arquivo .xlsx) e tenha a mesa inteira na mão: vida, poder, exaustão, condições, combate, viagem e tesouro.</p>
      <div class="linha-bts"><button class="bt grande" data-act="pc-novo">${ic('poderes:recompensa', 32)}Adicionar jogador</button>
      <button class="bt grande ouro" data-act="demo">${ic('status:nivel', 32)}Ver com a ficha da Amy</button></div></div></section>`;
    const cs = pcsMesa(s).map(calc);
    const tot = cs.reduce((a, c) => a + Math.max(0, c.pv), 0), max = cs.reduce((a, c) => a + c.pvMax, 0);
    const caidos = cs.filter(c => c.pv <= 0).length, niveis = pcsMesa(s).map(p => p.sheet.nivel || 1);
    const medio = niveis.length ? (niveis.reduce((a, b) => a + b, 0) / niveis.length).toFixed(1).replace('.0', '') : '—';
    return `<section class="painel-topo">
      <div class="resumo"><span>${ic('status:vida', 32)} Grupo <b>${tot}/${max}</b> PV</span><span>${ic('status:nivel', 32)} Nível médio <b>${medio}</b></span>
        <span class="${caidos ? 'ruim' : ''}">${ic('cond1:inconsciente', 32)} ${caidos ? `<b>${caidos}</b> caído${caidos > 1 ? 's' : ''}` : 'Ninguém caído'}</span></div>
      <div class="linha-bts">
        ${s.party.some(p => p.link) ? `<button class="bt" data-act="sync-todos">${ic('status:busca', 32)}Ler fichas</button>` : ''}
        <button class="bt" data-act="grupo-longo">${ic('cond2:descanso_longo', 32)}Descanso longo do grupo</button>
        <button class="bt" data-act="pc-novo">${ic('poderes:recompensa', 32)}Jogador</button></div></section>
      <section class="cartas">${gr.map(cartaPC).join('')}</section>`;
  }
};

/* ───── ações da mesa ───── */
const valorDe = id => { const el = document.getElementById('val-' + id); const v = el ? parseInt(el.value, 10) : NaN; return isNaN(v) ? null : Math.abs(v); };
ACT['pc-dano'] = el => {
  const id = el.dataset.id, v = valorDe(id); if (!v) return toast('Digite o valor do dano.');
  let msgs = [];
  Store.set(s => { const p = s.party.find(x => x.id === id); msgs = danoPC(p, v); }, `${nomePC(pcPorId(id))} levou ${v} de dano`);
  const p = pcPorId(id); Som.tocar(p.live.morto ? 'morte' : 'acerto');
  toast(`<b>${esc(nomePC(p))}</b> −${v} PV${msgs.length ? '<br>' + msgs.map(esc).join('<br>') : ''}`, { tipo: msgs.some(m => /MORT|caiu/.test(m)) ? 'ruim' : '', tempo: msgs.length ? 6000 : 2600 });
};
ACT['pc-cura'] = el => {
  const id = el.dataset.id, v = valorDe(id); if (!v) return toast('Digite quanto curou.');
  let msgs = []; Store.set(s => { msgs = curaPC(s.party.find(x => x.id === id), v); }, `${nomePC(pcPorId(id))} curou ${v}`);
  Som.tocar('cura'); toast(`<b>${esc(nomePC(pcPorId(id)))}</b> +${v} PV${msgs.length ? ' · ' + msgs.join(' · ') : ''}`, { tipo: 'bom' });
};
ACT['pc-temp'] = el => {
  const id = el.dataset.id, v = valorDe(id); if (v == null) return toast('Digite os PV temporários.');
  Store.set(s => { const p = s.party.find(x => x.id === id); p.live.temp = v; }, `${nomePC(pcPorId(id))}: PV temporário ${v}`);
  toast(`PV temporário: ${v} (não soma com outro temporário; fica o novo)`);
};
ACT['pc-pp'] = el => {
  const id = el.dataset.id, d = +el.dataset.d, v = valorDe(id) || 1;
  Store.set(s => { const p = s.party.find(x => x.id === id), c = calc(p); p.live.pp = clamp(p.live.pp + d * v, 0, c.ppMax + c.ppTemp); }, `${nomePC(pcPorId(id))} ${d < 0 ? 'gastou' : 'recuperou'} ${v} PP`);
  Som.tocar(d < 0 ? 'clique' : 'cura');
};
ACT['pc-exa'] = el => {
  const id = el.dataset.id, n = +el.dataset.n, p = pcPorId(id), novo = p.live.exa === n ? n - 1 : n;
  /* 6º nível de exaustão: desmaio, cai a 0 PV (LJ p. 272) */
  Store.set(s => { const L = s.party.find(x => x.id === id).live; L.exa = novo; if (novo >= 6) { L.pv = 0; addCond(L, 'Inconsciente', null, true); } }, `${nomePC(p)}: exaustão ${novo}`);
  if (novo >= 6) { Som.tocar('morte'); toast(`<b>${esc(nomePC(p))}</b> desmaiou (exaustão 6): caiu a 0 PV (LJ p. 272).`, { tipo: 'ruim' }); }
};
ACT['pc-reviver'] = el => Store.set(s => { const p = s.party.find(x => x.id === el.dataset.id); p.live.morto = false; p.live.neg = 0; }, 'Morte desfeita pelo mestre');
/* o que o personagem ganha ao subir de nível (LJ 1.3, p. 12–13; Pontos de Treinamento: LJ cap. 5). As características do Estilo de Combate ficam na descrição do estilo, no livro. */
function ganhosDoNivel(de, para, sh) {
  const out = [], niv = [];
  for (let n = de + 1; n <= para; n++) niv.push(n);
  /* o dado vem da ficha (Dados de Vida); se a ficha não disser, usa o dado do Estilo no livro */
  const daFicha = [...new Set((sh.dadosVida || []).map(d => d.tipo))], doEstilo = estilosDe(sh.estilo).filter(e => e.dv);
  const dvTxt = daFicha.length ? `${daFicha.join(' ou ')} (o da ficha${daFicha.length > 1 ? ': use o do Estilo em que subiu' : ''})`
    : doEstilo.length ? doEstilo.map(e => `${e.dv} (${esc(e.estilo)})`).join(' ou ') : 'o dado do seu Estilo (a ficha não diz qual)';
  out.push(`<li><b>+${niv.length} Dado${niv.length > 1 ? 's' : ''} de Vida</b>: ${dvTxt}. Para cada nível, role e some o modificador de Constituição (${sg(num(sh.conMod) || 0)}) ao PV máximo. Quem tem mais de um Estilo usa o dado do Estilo em que subiu (LJ p. 37 e “Múltiplos Estilos”). Se a ficha automática já calculou, confira o PV novo.</li>`);
  const atr = niv.filter(n => n % 4 === 0); if (atr.length) out.push(`<li><b>Aprimoramento de Atributos</b> (nível${atr.length > 1 ? 's' : ''} ${atr.join(', ')}): +1 em dois atributos ou +2 em um. Constituição que fica par: +1 PV por nível.</li>`);
  out.push(`<li><b>Bônus de Proficiência</b> agora na ficha: ${sg(num(sh.prof) || 0)} (sobe em níveis específicos: confira na tabela Avanço de Personagem).</li>`);
  const pt = niv.filter(n => n % 2 === 0 && n <= 10); if (pt.length) out.push(`<li><b>3 Pontos de Treinamento</b> por nível par até o 10º (aqui: nível${pt.length > 1 ? 's' : ''} ${pt.join(', ')}), para aprender treinamentos (LJ cap. 5).</li>`);
  out.push(`<li><b>Características do Estilo de Combate${sh.estilo ? ' (' + esc(sh.estilo) + ')' : ''}</b>, novos graus de Técnica e Pontos de Poder: veja a tabela do seu Estilo no Livro do Jogador (cap. 3). Fruta: veja a tabela de graus da Akuma no Mi, se tiver.</li>`);
  return out.join('');
}
ACT['pc-subiu'] = el => { const p = pcPorId(el.dataset.id); if (!p || !p.subiu) return;
  Modal.abrir(`<h2>${esc(nomePC(p))} subiu do nível ${p.subiu.de} para o ${p.subiu.para}</h2><ul class="lista">${ganhosDoNivel(+p.subiu.de, +p.subiu.para, p.sheet)}</ul>
    <p class="nota">Lembrete: quem sobe o nível é o jogador, na ficha do Docs; o site só avisa e relê. Fonte: LJ 1.3 “Além do 1º nível” (p. 12–13) e cap. 5.</p>
    <div class="linha-bts"><button class="bt bom" data-act="pc-subiu-ok" data-id="${p.id}">Já vi</button></div>`); };
ACT['pc-subiu-ok'] = el => { Store.set(s => { const p = s.party.find(x => x.id === el.dataset.id); if (p) p.subiu = null; }, null); Modal.fechar(); };
ACT['pc-aviso'] = el => Store.set(s => { const p = s.party.find(x => x.id === el.dataset.id); if (el.dataset.usar && p.aviso) p.live.pv = p.aviso.pv; p.aviso = null; }, null);
ACT['pc-cr'] = el => {
  const p = pcPorId(el.dataset.id), L = p.live, nom = L.crNom || [];
  Modal.abrir(`<h2>Ajuste de CR · ${esc(nomePC(p))}</h2><p>CR da ficha: <b>${p.sheet.cr}</b>. CR agora: <b>${calc(p).cr}</b>.</p>
    <h3>Bônus com nome</h3>
    <ul class="lista">${nom.map((b, i) => `<li><label class="check"><input type="checkbox" ${b.on !== false ? 'checked' : ''} data-chg="pc-cr-nom-on" data-id="${p.id}" data-i="${i}"> <b>${esc(b.n)}</b> ${sg(+b.v || 0)}</label> <button class="link" data-act="pc-cr-nom-tirar" data-id="${p.id}" data-i="${i}">tirar</button></li>`).join('') || '<li class="nota">Nenhum. Exemplo: “Pequeno Gigante +2” (só vale com mais da metade dos PV: marque e desmarque na hora).</li>'}</ul>
    <div class="linha-bts"><input id="cr-nom-n" placeholder="Nome (ex.: Pequeno Gigante)" class="cresce"><input id="cr-nom-v" type="number" inputmode="numeric" value="2" style="width:5em" aria-label="Valor"><button class="bt bom" data-act="pc-cr-nom-add" data-id="${p.id}">Adicionar</button></div>
    <h3>Cobertura e outros</h3>
    <div class="linha-bts">${[0, 2, 5].map(v => `<button class="bt" data-act="pc-cr-set" data-id="${p.id}" data-v="${v}">${v === 0 ? 'Sem cobertura' : v === 2 ? 'Meia cobertura +2' : 'Três quartos +5'}</button>`).join('')}</div>
    <label class="campo-inline" for="cr-livre">Outro ajuste <input id="cr-livre" type="number" inputmode="numeric" value="${L.crMod || 0}" data-enter="pc-cr-set" data-id="${p.id}"></label>
    <p class="nota">Ajuste atual: <b>${sg(L.crMod || 0)}</b>. Cobertura também dá o mesmo bônus em Salvaguardas de Destreza. Cobertura total: não pode ser alvo direto (LJ p. 291–292). Bônus com nome é regra da mesa: a ficha continua mostrando o CR dela.</p>`);
};
ACT['pc-cr-nom-add'] = el => {
  const n = ($('#cr-nom-n').value || '').trim(), v = parseInt($('#cr-nom-v').value, 10) || 0; if (!n || !v) return toast('Escreva o nome e o valor.');
  Store.set(s => { const L = s.party.find(x => x.id === el.dataset.id).live; (L.crNom = L.crNom || []).push({ n, v, on: true }); }, `CR: bônus ${n} ${sg(v)} em ${nomePC(pcPorId(el.dataset.id))}`); ACT['pc-cr'](el);
};
ACT['pc-cr-nom-on'] = el => { Store.set(s => { s.party.find(x => x.id === el.dataset.id).live.crNom[+el.dataset.i].on = el.checked; }, null); ACT['pc-cr'](el); };
ACT['pc-cr-nom-tirar'] = el => { Store.set(s => { s.party.find(x => x.id === el.dataset.id).live.crNom.splice(+el.dataset.i, 1); }, null); ACT['pc-cr'](el); };
ACT['pc-cr-set'] = el => { const v = el.dataset.v != null ? +el.dataset.v : parseInt($('#cr-livre').value, 10) || 0; Store.set(s => { s.party.find(x => x.id === el.dataset.id).live.crMod = v; }, null); Modal.fechar(); };
ACT['pc-longo'] = el => { const p = pcPorId(el.dataset.id); confirmar(`Descanso longo para <b>${esc(nomePC(p))}</b>? (8 horas: PV cheios, PP, metade dos Dados de Vida, −1 de exaustão.)`, () => {
  let m = []; Store.set(s => { m = descansoLongo(s.party.find(x => x.id === p.id)); }, `${nomePC(p)} fez descanso longo`); Som.tocar('cura'); toast(`<b>${esc(nomePC(p))}</b>: ${m.map(esc).join(' · ')}`, { tempo: 5000 }); }); };
ACT['grupo-longo'] = () => confirmar('Descanso longo para o grupo todo? (8 horas: PV cheios, PP, metade dos Dados de Vida, −1 de exaustão.) Quem está com 0 PV não descansa.', () => {
  const res = []; Store.set(s => { s.party.filter(p => p.sheet && naMesa(p)).forEach(p => res.push(`${esc(nomePC(p))}: ${descansoLongo(p).map(esc).join(', ')}`)); }, 'Descanso longo do grupo');
  Som.tocar('cura'); toast(res.join('<br>'), { tempo: 7000 }); });
ACT['pc-curto'] = el => {
  const p = pcPorId(el.dataset.id), dv = p.sheet.dadosVida || [];
  Modal.abrir(`<h2>Descanso curto · ${esc(nomePC(p))}</h2><p>30 minutos. Gaste Dados de Vida: cada um rola o dado + mod. de Constituição (se positivo) e cura isso (LJ p. 278).</p>
    <div class="linha-bts">${dv.length ? dv.map(d => { const tem = p.live.hd[d.tipo] ?? d.max; return `<button class="bt bom" data-act="pc-dv" data-id="${p.id}" data-t="${d.tipo}" ${tem <= 0 ? 'disabled' : ''}>Gastar 1 ${d.tipo} <small>(${tem}/${d.max})</small></button>`; }).join('') : '<span class="nota">A ficha não tem Dados de Vida preenchidos.</span>'}</div>
    <div id="dv-res" class="nota" aria-live="polite"></div>`);
};
ACT['pc-dv'] = el => {
  let r = null; Store.set(s => { r = gastarDadoVida(s.party.find(x => x.id === el.dataset.id), el.dataset.t); }, null);
  if (!r) return; Som.tocar('cura');
  Diario.add(`${nomePC(pcPorId(el.dataset.id))} gastou 1 ${el.dataset.t}: curou ${r.cura}`); Store.save();
  ACT['pc-curto'](el); $('#dv-res').innerHTML = `Rolou <b>${r.r}</b> ${r.con ? `+ ${r.con} (Con)` : ''} = <b>${r.cura} PV</b>.`;
};

/* condições (servem para jogadores e inimigos) */
ACT['cond-novo'] = el => escolherCondicao(el.dataset.alvo);
ACT['cond-add'] = el => {
  const rod = parseInt(($('#cond-rod') || {}).value, 10) || null, n = el.dataset.n, alvo = el.dataset.alvo;
  Store.set(s => { const a = alvoConds(s, alvo); if (a) addCond(a.dono, n, rod); }, `${(alvoConds(S(), alvo) || {}).nome}: ${n}${rod ? ` (${rod} rodadas)` : ''}`);
  Modal.fechar(); Som.tocar('clique');
};
/* toque numa condição (ficha do jogador, combate, mesa): mostra o texto inteiro, só para ler */
ACT['cond-info'] = el => {
  const n = el.dataset.n, d = CONDI[n]; if (!d) return;
  Modal.abrir(`<div class="cond-det">${ic(d.i, 128)}<div><h2>${esc(n)}</h2><p>${esc(d.t || d.r || '')}</p>${d.pp != null ? `<p class="nota">Custo em técnica de Akuma no Mi: ${d.pp} PP.</p>` : ''}<p class="nota"><small>LJ p. 269–273</small></p></div></div>
    <div class="linha-bts"><button class="bt" data-act="modal-fechar">Fechar</button></div>`);
};
ACT['cond-menu'] = el => {
  const alvo = el.dataset.alvo, i = +el.dataset.i, a = alvoConds(S(), alvo), c = a && a.dono.conds[i]; if (!c) return;
  const d = CONDI[c.n] || {};
  Modal.abrir(`<div class="cond-det">${ic(d.i, 128)}<div><h2>${esc(c.n)}</h2><p>${esc(d.t || '')}</p>${d.pp != null ? `<p class="nota">Custo em técnica de Akuma no Mi: ${d.pp} PP.</p>` : ''}</div></div>
    <div class="linha-bts"><button class="bt ruim" data-act="cond-tirar" data-alvo="${alvo}" data-i="${i}">Tirar condição</button>
    <button class="bt" data-act="cond-rod" data-alvo="${alvo}" data-i="${i}" data-d="-1">−1 rodada</button><button class="bt" data-act="cond-rod" data-alvo="${alvo}" data-i="${i}" data-d="1">+1 rodada</button>
    <span class="nota">${c.rod ? `Faltam ${c.rod} rodadas.` : 'Sem duração marcada.'}</span></div>`);
};
ACT['cond-tirar'] = el => { const a = alvoConds(S(), el.dataset.alvo); const n = a.dono.conds[+el.dataset.i].n; Store.set(s => { alvoConds(s, el.dataset.alvo).dono.conds.splice(+el.dataset.i, 1); }, `${a.nome}: saiu ${n}`); Modal.fechar(); };
ACT['cond-rod'] = el => { Store.set(s => { const c = alvoConds(s, el.dataset.alvo).dono.conds[+el.dataset.i]; c.rod = Math.max(1, (c.rod || 0) + +el.dataset.d); }, null); ACT['cond-menu'](el); };

/* ───── jogador: adicionar, conectar, retrato, remover ───── */
ACT['demo'] = () => {
  Store.set(s => { const pc = { id: uid(), link: '', apelido: 'Amy' }; aplicarFicha(pc, window.DEMO, 'demo'); pc.live.retrato = 'retratos:cacador'; s.party.push(pc); }, 'Exemplo: ficha da Amy');
  Som.tocar('moeda'); toast('Ficha da Amy carregada como exemplo. Para tirar: clique no cartaz dela › Remover jogador.');
};
ACT['pc-novo'] = () => { const id = uid(); Store.set(s => { s.party.push({ id, link: '', apelido: '' }); }, null); ACT['pc-editar']({ dataset: { id } }); };
ACT['pc-editar'] = el => {
  const p = pcPorId(el.dataset.id); if (!p) return;
  const pdm = !!p.pdm;
  Modal.abrir(`<h2>${esc(p.sheet ? nomePC(p) : pdm ? 'Nova ficha do mestre' : 'Novo jogador')}</h2>
    <label class="campo" for="pe-apelido">${pdm ? 'Nome do personagem (se a ficha estiver sem nome)' : 'Nome do jogador (se a ficha estiver sem nome)'}<input id="pe-apelido" value="${esc(p.apelido || '')}" placeholder="${pdm ? 'ex.: nome do vilão' : 'ex.: nome do jogador'}"></label>
    <fieldset class="caixa"><legend>Ficha 2.0</legend>
      <label class="campo" for="pe-link">Link da ficha no Google<input id="pe-link" value="${esc(p.link || '')}" placeholder="https://docs.google.com/spreadsheets/d/..." ${IN_CLAUDE ? 'aria-describedby="pe-aviso"' : ''}></label>
      <div class="linha-bts"><button class="bt" data-act="pe-ler" data-id="${p.id}">${ic('status:busca', 32)}Ler pelo link</button>
      <label class="bt arquivo" for="pe-arq">${ic('tesouro:livro', 32)}Abrir arquivo .xlsx</label><input id="pe-arq" type="file" accept=".xlsx" class="sr" data-chg="pe-arq" data-id="${p.id}"></div>
      ${IN_CLAUDE ? '<p class="nota" id="pe-aviso">Aqui dentro do Claude o Google é bloqueado: use o arquivo .xlsx. No arquivo baixado (fora do Claude), o link funciona.</p>' : '<p class="nota">O link só funciona se a ficha estiver como “Qualquer pessoa com o link: leitor”.</p>'}
      <p class="nota">Arquivo: na ficha, Arquivo › Fazer download › Microsoft Excel (.xlsx).</p>
      <p id="pe-status" class="nota" aria-live="polite">${p.lidoEm ? `Última leitura: ${hora(p.lidoEm)} (${p.origem}).` : ''}</p></fieldset>
    ${pdm ? '<p class="nota">Ficha do mestre: no Grupo ou como vilão você escolhe na aba <b>Fichas do mestre</b>. A ficha pode ser a mesma do jogador (2.0), pelo link ou .xlsx.</p>' : `<label class="check" for="pe-aliado"><input id="pe-aliado" type="checkbox" ${p.aliado ? 'checked' : ''}> <b>NPC aliado</b> <small>(fica no Grupo, mas não conta na média de nível, no XP nem na Barra de Bônus. Para personagens seus, use a aba Fichas do mestre.)</small></label>`}
    <fieldset class="caixa"><legend>Retrato</legend>
      <div class="ret-up">${retratoPropioHTML(p)}<div><div class="linha-bts"><button class="bt bom fino" data-act="pe-ret-up" data-id="${p.id}">${ic('mesa:imagem', 32)} ${retratoProprio(p) ? 'Trocar a imagem' : 'Enviar minha imagem'}</button>${retratoProprio(p) ? `<button class="bt fino" data-act="pe-ret-tirar" data-id="${p.id}">Tirar a imagem</button>` : ''}</div>
        <p class="nota">PNG, JPG ou WEBP. Fica guardada na mesa e aparece no Grupo, no combate e no cartaz. Ou escolha um dos retratos prontos abaixo.</p></div></div>
      <div class="grade-ret">
      <button class="ret-op ${!p.live || !p.live.retrato ? 'on' : ''}" data-act="pe-ret" data-id="${p.id}" data-r="">${retratoHTML(null, nomePC(p), 64)}</button>
      ${(pdm ? RETRATOS.concat(NPC_RET) : RETRATOS).map(r => `<button class="ret-op ${p.live && p.live.retrato === r ? 'on' : ''}" data-act="pe-ret" data-id="${p.id}" data-r="${r}">${ic(r, 64)}</button>`).join('')}</div></fieldset>
    <div class="linha-bts"><button class="bt bom" data-act="pe-salvar" data-id="${p.id}">Salvar</button><button class="bt ruim" data-act="pe-remover" data-id="${p.id}">${pdm ? 'Apagar esta ficha' : 'Remover jogador'}</button></div>`, { classe: 'larga', onBind: m => carregarArquivos(m) });
};
ACT['pe-salvar'] = el => {
  const ap = $('#pe-apelido').value.trim(), link = $('#pe-link').value.trim();
  Store.set(s => { const p = s.party.find(x => x.id === el.dataset.id); p.apelido = ap; p.link = link; if ($('#pe-aliado')) p.aliado = $('#pe-aliado').checked; }, null);
  Modal.fechar();
};
ACT['pe-ler'] = async el => {
  const link = $('#pe-link').value.trim(); if (!link) return toast('Cole o link da ficha.');
  Store.set(s => { const p = s.party.find(x => x.id === el.dataset.id); p.link = link; p.apelido = $('#pe-apelido').value.trim(); }, null, { semDesfazer: true });
  $('#pe-status').textContent = 'Lendo a ficha…';
  const p = pcPorId(el.dataset.id);
  await Sync.um(p);
  const q = pcPorId(el.dataset.id);
  if (q && q.sync && q.sync.estado !== 'erro') { Modal.fechar(); toast(`Ficha de <b>${esc(nomePC(q))}</b> lida${q.sync.estado === 'parcial' ? ' (com falhas: veja Ajustes › Diagnóstico)' : ''}.`, { tipo: 'bom' }); Som.tocar('moeda'); }
  else if ($('#pe-status')) $('#pe-status').textContent = 'Não deu: ' + (q.sync && q.sync.msg);
};
ACT['pe-arq'] = async el => {
  const f = el.files && el.files[0]; if (!f) return;
  try {
    const raw = await lerXlsx(await f.arrayBuffer());
    Store.set(s => { const p = s.party.find(x => x.id === el.dataset.id); p.apelido = ($('#pe-apelido') || {}).value || p.apelido; aplicarFicha(p, raw, 'arquivo'); p.sync = { estado: 'ok', em: Date.now() }; }, `Ficha lida do arquivo ${f.name}`);
    Modal.fechar(); Som.tocar('moeda'); toast(`Ficha de <b>${esc(nomePC(pcPorId(el.dataset.id)))}</b> lida do arquivo.`, { tipo: 'bom' });
  } catch (e) { toast(esc(e.message), { tipo: 'ruim', tempo: 6000 }); }
};
/* retrato enviado pelo mestre (imagem guardada na mesa) ou colado por link: { arq } ou { url } */
const retratoProprio = p => { const r = p && p.live && p.live.retrato; return r && typeof r === 'object' && (r.arq || r.url) ? r : null; };
const retratoPropioHTML = p => { const r = retratoProprio(p); return `<span class="ret-prev ${r ? 'on' : ''}">${r ? retratoHTML(r, nomePC(p), 96) : '<small>sem imagem sua</small>'}</span>`; };
const retratoApagarArq = r => { if (r && typeof r === 'object' && r.arq) Arquivos.apagar(r.arq).catch(() => {}); };
/* a janela reabre depois de trocar o retrato: guarda antes o que já foi escrito (nome, link, aliado) */
const pcGuardaCampos = id => { const ap = $('#pe-apelido'), lk = $('#pe-link'); if (!ap) return; Store.set(s => { const p = s.party.find(x => x.id === id); if (!p) return; p.apelido = ap.value.trim(); if (lk) p.link = lk.value.trim(); if ($('#pe-aliado')) p.aliado = $('#pe-aliado').checked; }, null, { semDesfazer: true }); };
ACT['pe-ret-up'] = el => { pcGuardaCampos(el.dataset.id); escolherArquivos('image/*', false, async fs => {
  const id = el.dataset.id, [i] = await enviarArquivos(fs, 'foto'); if (!i) return;
  let antiga = null;
  Store.set(s => { const p = s.party.find(x => x.id === id); if (!p) return; if (!p.live) p.live = vivoNovo({}); antiga = p.live.retrato; p.live.retrato = { arq: i.id }; }, null);
  retratoApagarArq(antiga); Som.tocar('moeda'); toast('Imagem guardada. Já aparece no Grupo, no combate e no cartaz.', { tipo: 'bom' });
  if ($('#modal')) ACT['pc-editar']({ dataset: { id } });
}); };
ACT['pe-ret-tirar'] = el => { pcGuardaCampos(el.dataset.id); let antiga = null; Store.set(s => { const p = s.party.find(x => x.id === el.dataset.id); if (!p || !p.live) return; antiga = p.live.retrato; p.live.retrato = null; }, null); retratoApagarArq(antiga); ACT['pc-editar'](el); };
ACT['pe-ret'] = el => { pcGuardaCampos(el.dataset.id); let antiga = null; Store.set(s => { const p = s.party.find(x => x.id === el.dataset.id); if (!p.live) p.live = vivoNovo({}); antiga = p.live.retrato; p.live.retrato = el.dataset.r || null; }, null); retratoApagarArq(antiga); ACT['pc-editar'](el); };
ACT['pe-remover'] = el => { const p = pcPorId(el.dataset.id); if (p && p.uid && (M.jogadoresTodos || []).some(j => j.uid === p.uid)) { Modal.fechar(); return ACT['jog-tirar']({ dataset: { uid: p.uid } }); } confirmar(p.pdm ? `Apagar a ficha do mestre <b>${esc(nomePC(p))}</b>? (Some do Grupo, do encontro e da luta.)` : `Remover <b>${esc(nomePC(p))}</b> da mesa?`, () => Store.set(s => { s.party = s.party.filter(x => x.id !== p.id); s.combate.lista = s.combate.lista.filter(c => c.pcId !== p.id); s.encontro.itens = s.encontro.itens.filter(i => i.id !== 'pdm:' + p.id); }, `Saiu da mesa: ${nomePC(p)}`), { perigo: true, ok: 'Remover' }); };
ACT['sync-todos'] = async () => { toast('Lendo as fichas…'); await Sync.todos(); toast('Fichas lidas.', { tipo: 'bom' }); };

/* ───── ficha completa ───── */
let abaFicha = 'resumo';
ACT['pc-ficha'] = el => { abaFicha = el.dataset.aba || abaFicha; const p = pcPorId(el.dataset.id); Modal.abrir(fichaHTML(p), { classe: 'larga ficha' }); };
function fichaHTML(p) {
  const s = p.sheet, c = calc(p);
  const abas = [['resumo', 'Resumo'], ['tecnicas', 'Técnicas'], ['itens', 'Armas e inventário'], ['tracos', 'Traços e poderes']];
  const lst = a => a && a.length ? `<ul class="lista">${a.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '<p class="nota">Nada preenchido.</p>';
  let corpo = '';
  if (abaFicha === 'resumo') corpo = `<div class="ficha-grade">
      <div><h3>Atributos</h3><table class="tab"><tr><th>Atributo</th><th>Valor</th><th>Salv.</th></tr>${s.attrs.map(a => `<tr><td>${a.n}</td><td>${a.v ?? '—'} (${a.m != null ? sg(a.m) : '—'})</td><td>${a.salv != null ? sg(a.salv) : '—'}${a.prof ? ' ●' : ''}</td></tr>`).join('')}</table>
      <p class="nota">● proficiente. Exaustão: −${2 * c.exa} em todo d20.</p></div>
      <div><h3>Perícias</h3><table class="tab duas">${s.pericias.map(x => `<tr><td>${esc(x.n)}</td><td>${x.v != null ? sg(x.v) : '—'}${x.prof ? ' ●' : ''}</td></tr>`).join('')}
        ${s.oficio.nome ? `<tr><td>Ofício: ${esc(s.oficio.nome)}</td><td>${esc(s.oficio.bonus)}</td></tr>` : ''}</table></div>
      <div><h3>Quem é</h3><dl class="dl">${[['Alcunha', s.alcunha], ['Sonho', s.sonho], ['Caminho', s.caminho], ['Tripulação', s.tripulacao], ['Antecedente', s.antecedente],
        ['Profissão', [s.profissao, s.graduacao].filter(Boolean).join(' · ')], ['Akuma no Mi', s.temFruta ? [s.akuma, s.akumaCat, s.akumaTipo].filter(Boolean).join(' · ') : ''],
        ['Haki', s.haki.estagio ? `${s.haki.estagio} · CD ${s.haki.cd ?? '—'} · PA ${s.haki.pa ?? 0}` : ''], ['Treino', s.pt != null ? `${s.pt} PT · ${s.ptGastos || 0} gastos` : ''],
        ['Dinheiro', s.dinheiro != null ? '฿ ' + fmt(s.dinheiro) : ''], ['Carga', s.carga != null ? `${s.carga} / ${s.cargaMax} kg` : ''],
        ['Desloc.', `${s.desl.terra || 0} m terra · ${s.desl.voo || 0} voo · ${s.desl.nado || 0} nado`],
        ['Dados de vida', (s.dadosVida || []).map(d => `${p.live.hd[d.tipo] ?? d.max}/${d.max} ${d.tipo}`).join(' · ')]].filter(x => x[1]).map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
        ${s.ataquesTexto ? `<h3>Anotação de ataques</h3><p class="pre">${esc(s.ataquesTexto)}</p>` : ''}</div></div>`;
  if (abaFicha === 'tecnicas') {
    const card = (t, origem) => `<article class="tec"><header><b>${esc(t.nome)}</b><span>${esc(t.grau || '')}</span>${t.pp != null ? `<span class="pp">${t.pp} PP</span>` : ''}</header>
      ${t.desc ? `<p>${esc(t.desc)}</p>` : ''}<dl class="dl mini">${[['Duração', t.dur], ['Alcance', t.alc], ['Requisito', t.req], ['Dano', t.dano]].filter(x => x[1]).map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
      ${t.extra ? `<p class="nota">${esc(t.extra)}</p>` : ''}${t.pp != null ? `<button class="bt azul fino" data-act="pc-tec" data-id="${p.id}" data-pp="${t.pp}" data-grau="${esc(t.grau)}" data-nome="${esc(t.nome)}">Usar (−${t.pp} PP)</button>` : ''}</article>`;
    corpo = `<p class="nota">PP agora: <b>${c.pp}/${c.ppMax}</b>. Ataque de técnica ${sg(c.atk)} · CD ${c.cd ?? '—'}${s.temFruta ? ` · fruta ${sg(c.atkFruta)} · CD ${c.cdFruta ?? '—'}` : ''}.</p>
      <h3>${esc(s.estilo || 'Estilo de combate')}</h3><div class="tecs">${s.cartoesEstilo.length ? s.cartoesEstilo.map(t => card(t)).join('') : '<p class="nota">Sem técnicas detalhadas na ficha.</p>'}</div>
      ${s.hb.length ? `<h3>Habilidades básicas</h3>${lst(s.hb)}` : ''}
      ${s.temFruta ? `<h3>${esc(s.akuma)}</h3><div class="tecs">${s.cartoesAkuma.length ? s.cartoesAkuma.map(t => card(t)).join('') : '<p class="nota">Sem técnicas detalhadas.</p>'}</div>` : ''}`;
  }
  if (abaFicha === 'itens') corpo = `<h3>Armas</h3>${s.armas.length ? `<table class="tab"><tr><th>Arma</th><th>Bônus</th><th>Dano</th><th>Alcance</th><th>Tipo</th><th>Expertise</th></tr>
      ${s.armas.map(a => `<tr><td>${esc(a.nome)}</td><td>${num(a.bonus) != null ? sg(num(a.bonus)) : esc(a.bonus || '')}</td><td>${esc(a.dano)}</td><td>${esc(a.alcance)}</td><td>${esc(a.tipo)}</td><td>${esc(a.expertise)}</td></tr>`).join('')}</table>` : '<p class="nota">Nenhuma arma.</p>'}
      <p class="nota">Dinheiro: ฿ ${fmt(s.dinheiro || 0)}.</p>${invMestreHTML(p)}`;
  if (abaFicha === 'tracos') corpo = `<div class="ficha-grade">
      <div><h3>Características do estilo</h3>${lst(s.caracteristicas)}</div>
      <div><h3>Espécie e ancestralidade</h3>${lst(s.tracos.concat(s.ancestral, s.variacao ? [s.variacao] : []))}
        <h3>Antecedente</h3>${lst([s.antecedenteNome, s.antecedenteCarac].filter(Boolean))}${s.codigo ? `<h3>Código de honra</h3>${lst([s.codigo])}` : ''}</div>
      <div>${s.temFruta ? `<h3>Poderes da fruta</h3>${lst(s.poderes)}` : ''}${s.singularidades.length ? `<h3>Singularidades</h3>${lst(s.singularidades)}` : ''}${s.defeitos.length ? `<h3>Defeitos</h3>${lst(s.defeitos)}` : ''}</div></div>`;
  return `<div class="ficha-topo"><div class="poster pequeno"><div class="foto">${fotoCartaz(p.live.retrato, nomePC(p))}</div><img class="cz-arte" src="${img('cartaz_base') || img('cartaz')}" alt=""></div>
    <div><h2>${esc(nomePC(p))}</h2><p>${esc(jogadorPC(p))} · Nv ${s.nivel} · ${esc([s.especie, s.estilo, s.profissao].filter(Boolean).join(' · '))}</p>
    <p class="nota">PV ${c.pv}/${c.pvMax} · PP ${c.pp}/${c.ppMax} · CR ${c.cr} · Perc. ${c.perc} · Inic. ${sg(c.ini)}</p></div></div>
    <nav class="abas" aria-label="Partes da ficha">${abas.map(([k, n]) => `<button class="aba ${k === abaFicha ? 'on' : ''}" data-act="pc-ficha" data-id="${p.id}" data-aba="${k}" aria-pressed="${k === abaFicha}">${n}</button>`).join('')}</nav>
    <div class="ficha-corpo">${corpo}</div>`;
}
ACT['pc-tec'] = el => {
  const p = pcPorId(el.dataset.id), custo = +el.dataset.pp, grau = parseInt(el.dataset.grau, 10), nome = el.dataset.nome;
  const usar = () => { Store.set(s => { s.party.find(x => x.id === p.id).live.pp -= custo; }, `${nomePC(p)} usou ${nome} (−${custo} PP)`); Som.tocar('clique'); toast(`${esc(nome)}: −${custo} PP`); ACT['pc-ficha']({ dataset: { id: p.id } }); };
  if (p.live.pp >= custo) return usar();
  if (isNaN(grau)) return toast('PP insuficiente.', { tipo: 'ruim' });
  if (grau >= 6 || p.live.exa + grau > 5) return toast(`Sem PP e a Sobrecarga levaria a exaustão além do 5º nível: ${esc(nomePC(p))} desmaiaria antes de usar.`, { tipo: 'ruim', tempo: 6000 });
  confirmar(`${esc(nomePC(p))} tem ${p.live.pp} PP e a técnica custa ${custo}. Usar por <b>Sobrecarga</b>? Não gasta PP e ganha <b>${grau} de exaustão</b> (LJ p. 37).`, () => {
    Store.set(s => { s.party.find(x => x.id === p.id).live.exa += grau; }, `${nomePC(p)} usou ${nome} por Sobrecarga (+${grau} exaustão)`); Som.tocar('falha');
  }, { ok: 'Usar por Sobrecarga' });
};
