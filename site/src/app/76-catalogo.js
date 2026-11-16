/* ═══════════ CATÁLOGO (Blocos 6 e 7) ═══════════
   Akuma no Mi (11: as 10 dos PDFs + a Kumo-Kumo, criada na mesa), os 12 Estilos de Combate do Livro do Jogador,
   os 5 Estilos Exclusivos 2.1 e a espécie Oni. Os dados ficam em catalogo.js, baixado só quando alguém abre o Catálogo.
   O mestre revela item por item, em dois níveis (M.estado.catalogo):
     descobertas: { 'ope-ope': 'ideia' | 'tudo' }   → fruta: só a ideia, ou também o resumo e as técnicas
     estilos:     { samurai:   'ideia' | 'tudo' }   → estilo: só a ideia, ou também os números, as características e as técnicas
     esconder:    { frutas, estilos, especies, guia_especies, guia_mundo } → categoria inteira some para os jogadores
   Tudo começa escondido. (Compatível com o Bloco 6: descobertas = true vale como 'tudo'; liberados.heroi também.) */
const Cat = { aba: 'frutas', aberto: null, promessa: null, falhou: false, busca: '', ctl: false };
function catCarregar() {
  if (window.CATALOGO) return Promise.resolve();
  if (Cat.promessa) return Cat.promessa;
  Cat.promessa = new Promise((ok, no) => {
    const s = document.createElement('script'); s.src = window.CATALOGO_URL || 'catalogo.js';
    s.onload = () => { ok(); App.render(); };
    s.onerror = () => { Cat.falhou = true; Cat.promessa = null; no(new Error('catalogo.js')); App.render(); };
    document.head.appendChild(s);
  });
  Cat.promessa.catch(() => {});
  return Cat.promessa;
}
const catEst = () => (M.estado && M.estado.catalogo) || {};
const catEscondida = k => !!(catEst().esconder || {})[k];
const catNv = v => v === true ? 'tudo' : (v === 'ideia' || v === 'tudo' ? v : '');
const catNivelFruta = id => catNv((catEst().descobertas || {})[id]);
const catNivelEstilo = id => { const e = catEst(), v = catNv((e.estilos || {})[id]); return v || ((e.liberados || {})[id] ? 'tudo' : ''); };
const catFrutaVisivel = f => souMestre() || (!catEscondida('frutas') && !!catNivelFruta(f.id));
const catEstiloVisivel = e => souMestre() || (!catEscondida('estilos') && !!catNivelEstilo(e.id));
const catEspecieVisivel = () => souMestre() || !catEscondida('especies');
const guiaEscondido = k => !souMestre() && catEscondida('guia_' + k);
const CAT_ABAS = [['frutas', 'Akuma no Mi', 'itensop:akuma_no_mi'], ['estilos', 'Estilos de combate', 'tesouro:espada'], ['especies', 'Espécie nova: Oni', 'especies:gigante']];
/* a aba do Oni usa o ícone próprio quando a folha 'especies2' chegar */
CAT_ABAS[2][2] = icOu('especies2:oni_guerreiro', 'especies:gigante');
/* ícone de cada estilo (provisório, das folhas que já existem; os ícones próprios estão nos prompts do Bloco 7) */
const CAT_EST_IC = { atirador: 'retratos:atiradora', aventureiro: 'itensop:mapa_tesouro', brutamontes: 'retratos:brutamontes', 'carateca-homem-peixe': 'retratos:homem_peixe',
  ciborgue: 'retratos:ciborgue', espadachim: 'itensop:meito', guerrilheiro: 'retratos:veterano', lutador: 'poderes:punho_negro', ninja: 'poderes:pressentimento',
  'okama-kenpo': 'retratos:nobre', rokushiki: 'trip:cipher_pol', samurai: 'poderes:corte_voador', 'black-leg': 'poderes:cozinheiro', esgrimista: 'tesouro:espada',
  heroi: 'trip:nakama', solfista: 'prof:musico', 'usuario-insito': 'itensop:akuma_no_mi' };
const catEstIc = id => icOu('estilos:' + String(id).replace(/-/g, '_'), CAT_EST_IC[id] || 'tesouro:espada');   // folha 'estilos' (estilos.png) quando chegar
/* o jogador só vê a aba do Catálogo se existir algo para ele ver */
function catTemAlgo() {
  if (souMestre()) return true;
  const e = catEst();
  const frutas = !catEscondida('frutas') && Object.values(e.descobertas || {}).some(v => catNv(v));
  const estilos = !catEscondida('estilos') && (Object.values(e.estilos || {}).some(v => catNv(v)) || Object.values(e.liberados || {}).some(Boolean));
  return frutas || estilos || !catEscondida('especies');
}
/* todos os estilos: os 12 do livro e os 5 exclusivos, com a origem marcada */
function catTodosEstilos() {
  const X = (window.CATALOGO || {}).extra || {};
  return (X.livro || []).map(e => ({ ...e, fonte: 'livro' })).concat((X.estilos || []).map(e => ({ ...e, fonte: 'exclusivo' })));
}

/* ───── blocos de texto (parágrafos e tabelas lidos dos PDFs) ───── */
function catPar(p) {
  if (p && p.tab) {
    const [cab, ...linhas] = p.tab;
    return `<div class="cat-tabw"><table class="tab"><tr>${cab.map(c => `<th>${esc(c)}</th>`).join('')}</tr>${linhas.map(l => `<tr>${l.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</table></div>`;
  }
  const t = String(p || ''); const m = t.match(/^([A-ZÀ-Ú][\wÀ-ú'’ ()\-]{2,50}):\s([\s\S]+)$/);
  return m ? `<p><b>${esc(m[1])}:</b> ${esc(m[2])}</p>` : `<p>${esc(t)}</p>`;
}
const catPars = l => (l || []).filter(x => x && (x.tab || String(x).trim())).map(catPar).join('');
const catCalc = c => souMestre() && (c || []).length ? `<p class="nota cat-calc"><span class="tag">só você vê</span> ${c.map(esc).join(' ')}</p>` : '';
function catRegra(b, aberta) {
  return `<details class="cat-regra" ${aberta ? 'open' : ''}><summary>${esc(b.t)}</summary><div class="cat-corpo">${catPars(b.p)}${catCalc(b.calc)}</div></details>`;
}
function catTec(b, f) {
  const nv = b.grau && f && f.nivel ? f.nivel[b.grau] : null;
  const dl = [['Duração', b.duracao], ['Alcance', b.alcance], ['Requisito', b.req], ['Dano', b.dano]].filter(([, v]) => v);
  return `<article class="cat-tec ${b.tipo === 'auxiliar' ? 'aux' : ''}">
    <header><h4>${esc(b.nome)}</h4>
      <span class="tag">${b.grau ? `${b.grau}º Grau` : (b.tipo === 'auxiliar' ? 'Auxiliar' : 'Técnica')}${nv ? ` · nv ${nv}` : ''}</span>${b.pp != null ? `<span class="tag ouro">${b.pp} PP</span>` : ''}
      ${b.comb ? `<span class="tag ${b.comb === 'Possível' ? 'bom' : 'ruim'}" title="Ataque combinado">Combinado ${b.comb === 'Possível' ? 'possível' : 'impossível'}</span>` : ''}${b.tag ? `<span class="tag">${esc(b.tag)}</span>` : ''}</header>
    ${b.nota ? `<p class="nota">${esc(b.nota)}</p>` : ''}
    <div class="cat-corpo">${catPars(b.desc)}</div>
    ${dl.length ? `<dl class="cat-meta">${dl.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}
    ${(b.extra || []).length ? `<div class="cat-corpo cat-extra">${catPars(b.extra)}</div>` : ''}${catCalc(b.calc)}
  </article>`;
}
/* regras ficam recolhidas; as técnicas ficam abertas, na ordem em que o PDF traz */
function catBlocos(blocos, f) {
  let i = 0;
  return blocos.map(b => b.k === 'tec' ? catTec(b, f) : catRegra(b, i++ < 1)).join('');
}
/* o mestre escolhe, item por item, o que os jogadores veem */
function catNivelCtl(tipo, id, atual, curto) {
  const ops = [['', 'Escondido'], ['ideia', 'Só a ideia'], ['tudo', tipo === 'fruta' ? 'Com técnicas' : 'Completo']];
  return `<div class="cat-niv ${curto ? 'curto' : ''}" role="group" aria-label="O que os jogadores veem">${curto ? '' : '<small>Os jogadores veem:</small>'}${ops.map(([v, n]) => `<button class="${atual === v ? 'on' : ''}" data-act="cat-nivel" data-t="${tipo}" data-id="${esc(id)}" data-v="${v}" aria-pressed="${atual === v}">${n}</button>`).join('')}</div>`;
}
const catSelo = nv => nv === 'ideia' ? '<span class="tag">só a ideia</span>' : nv === 'tudo' ? '<span class="tag bom">completo</span>' : '<span class="tag ruim">escondido</span>';
const catCadeado = () => (window.MANIFEST && MANIFEST.ui && MANIFEST.ui.cadeado) ? '<i class="cat-cad" aria-hidden="true"></i>' : ic('mesa:cadeado', 32);
const catTrancado = txt => `<div class="cat-tranca">${catCadeado()}<p>${txt}</p></div>`;

/* ───── Akuma no Mi ───── */
const catTipoIc = t => /Logia/.test(t) ? 'poderes:fruta_chamas' : /Zoan/.test(t) ? 'poderes:fruta_escamas' : 'poderes:fruta_espinhos';
const catFrutaIc = f => icOu('frutas:' + String(f.id).replace(/-/g, '_'), 'frutas:generica', catTipoIc(f.tipo));   // folha 'frutas' (frutas.png); fruta sem desenho próprio usa a genérica
/* a cena do poder (frutas_cenas1 a 3), na faixa do topo da página da fruta */
const catCenaFruta = f => { const k = 'f_' + String(f.id).replace(/-/g, '_'), c = (window.MANIFEST && MANIFEST.images && MANIFEST.images[k]) ? k : ((window.MANIFEST && MANIFEST.images && MANIFEST.images.f_generica) ? 'f_generica' : ''); return c ? `<div class="cat-faixa c-${c}" role="img" aria-label="Cena: ${esc(f.nome)}"></div>` : ''; };
const catTipoCurto = t => (t.match(/(Paramecia|Zoan [A-Za-zÍ]+|Logia)/) || [t])[0];
const CAT_ORIGEM = { livro: 'Livro do Jogador', novo: 'PDF 2.0', mesa: 'Criada na nossa mesa' };
function catResumoTab(f) {
  const r = f.resumo, n = r.cab.length;
  return `<div class="cat-tabw"><table class="tab"><tr>${r.cab.map(c => `<th>${esc(c)}</th>`).join('')}</tr>${r.linhas.map(l => `<tr>${Array.from({ length: n }, (_, i) => `<td>${esc(l[i] || '')}</td>`).join('')}</tr>`).join('')}</table></div>
    ${r.props.length ? `<p class="nota">Propriedades: ${r.props.map(p => `<span class="tag">${esc(p)}</span>`).join(' ')}</p>` : ''}`;
}
function catFrutaDetalhe(f) {
  const m = souMestre(), nv = catNivelFruta(f.id), nTec = f.blocos.filter(b => b.k === 'tec').length, ver = m || nv === 'tudo';
  return `<div class="cat-det"><button class="bt fino" data-act="cat-voltar">← Todas as frutas</button>
    <header class="cat-dcab">${ic(catFrutaIc(f), 64)}<div><h2>${esc(f.nome)}</h2><p class="nota">${esc(f.fruto)}</p>
      <p><span class="tag ouro">${esc(catTipoCurto(f.tipo))}</span> <span class="tag">${esc(CAT_ORIGEM[f.origem] || 'PDF')}</span>${m ? ' ' + catSelo(nv) : ''}</p></div>
      ${m ? catNivelCtl('fruta', f.id, nv) : ''}</header>
    ${catCenaFruta(f)}
    <section class="cat-ideia"><h3>A ideia da fruta</h3>${(f.ideia || []).map(p => `<p>${esc(p)}</p>`).join('')}
      ${f.naObra ? `<p class="nota"><b>Na obra:</b> ${esc(f.naObra)}</p>` : ''}
      ${m && f.mestre ? `<p class="nota cat-calc"><span class="tag">só você vê</span> ${esc(f.mestre)}</p>` : ''}</section>
    ${ver ? `${m && nv !== 'tudo' ? '<p class="nota cat-so-mestre">Daqui para baixo, os jogadores ainda não veem.</p>' : ''}
      <h3>Resumo por nível <small class="nota">${esc(f.tipo.replace(/^Usuário /, ''))} · ${nTec} técnicas</small></h3>${catResumoTab(f)}
      ${catBlocos(f.blocos, f)}
      <p class="nota">Fonte: ${f.origem === 'mesa' ? 'ficha criada para esta mesa.' : 'PDF da fruta (OP RPG 2.0). Texto lido do PDF por programa; se algo parecer cortado, confira no PDF original.'}</p>`
    : catTrancado('O resumo e as técnicas aparecem quando o mestre liberar. Por enquanto, imagine o que dá para fazer com essa ideia.')}</div>`;
}
function catFrutas() {
  const C = window.CATALOGO, m = souMestre(), q = sem(Cat.busca || '');
  if (Cat.aberto) { const f = C.frutas.find(x => x.id === Cat.aberto); if (f && catFrutaVisivel(f)) return catFrutaDetalhe(f); Cat.aberto = null; }
  const ok = f => catFrutaVisivel(f) && (!q || sem(f.nome + ' ' + f.fruto + ' ' + (m || catNivelFruta(f.id) === 'tudo' ? f.blocos.filter(b => b.k === 'tec').map(b => b.nome).join(' ') : '')).includes(q));
  const lista = C.frutas.filter(ok), rev = C.frutas.filter(f => catNivelFruta(f.id)).length;
  return `<input id="cat-busca" type="search" placeholder="Procurar fruta${m ? ' ou técnica' : ''}" value="${esc(Cat.busca || '')}" data-chg="cat-busca" aria-label="Procurar no catálogo">
    ${m ? `<p class="nota">Tudo começa escondido. Revele cada fruta quando o grupo descobrir: <b>só a ideia</b> (o que ela faz) ou <b>com técnicas</b> (resumo e técnicas). ${rev} de ${C.frutas.length} reveladas.</p>` : ''}
    <div class="cat-grade">${lista.map(f => { const nv = catNivelFruta(f.id); return `<article class="cat-c ${nv ? 'achada' : ''}"><button class="cat-abre" data-act="cat-abre" data-id="${f.id}">${ic(catFrutaIc(f), 64)}<span><b>${esc(f.nome)}</b><small>${esc(f.fruto)}</small>
        <small class="cat-ti">${esc(catTipoCurto(f.tipo))}${f.origem === 'mesa' ? ' · criada na mesa' : ''}</small></span></button>
      ${m ? catNivelCtl('fruta', f.id, nv, true) : (nv === 'ideia' ? '<span class="tag cat-tg">só a ideia</span>' : '')}</article>`; }).join('')
      || `<p class="vazio-li">${m ? 'Nada encontrado.' : 'Nenhuma fruta foi revelada ainda. O mestre revela conforme vocês descobrem.'}</p>`}</div>`;
}

/* ───── Estilos de combate ───── */
/* a ideia de um estilo exclusivo: os textos entre "Informações Gerais" e "Técnicas" do PDF */
function catIdeiaExclusivo(e) {
  const i = e.blocos.findIndex(b => b.k === 'regra' && b.t === 'Informações Gerais');
  let j = e.blocos.findIndex((b, k) => k > i && b.k === 'regra' && /^Técnicas/.test(b.t));
  if (j < 0) j = Math.min(e.blocos.length, i + 4);
  return e.blocos.slice(i + 1, j).filter(b => b.k === 'regra').map(b => ({ t: b.t, p: b.p }));
}
function catCaracNivel(e) {
  const g = []; let cur = null;
  (e.carac || []).forEach(c => { if (c.nv) { cur = { nv: c.nv, l: [c.n] }; g.push(cur); } else if (cur) cur.l.push('· ' + c.n); });
  return `<div class="cat-tabw"><table class="tab cat-carac"><tr><th>Nível</th><th>Característica (o texto completo está no livro)</th></tr>${g.map(x => `<tr><td>${x.nv}º</td><td>${esc(x.l[0])}${x.l.length > 1 ? `<br><small class="nota">opções: ${esc(x.l.slice(1).map(s => s.slice(2)).join(', '))}</small>` : ''}</td></tr>`).join('')}</table></div>`;
}
function catTecTab(e) {
  const cam = e.tecs.some(t => t[5]);
  return `<div class="cat-tabw"><table class="tab"><tr>${cam ? '<th>Caminho</th>' : ''}<th>Nível</th><th>Grau</th><th>Técnica de combate</th><th>Técnica auxiliar</th></tr>
    ${e.tecs.map(t => `<tr>${cam ? `<td>${esc(t[5] || '')}</td>` : ''}<td>${t[0]}º</td><td>${t[1]}º</td><td>${esc(t[2])}</td><td>${t[4] ? `${esc(t[4])} <small class="nota">(nv ${t[3]})</small>` : '—'}</td></tr>`).join('')}</table></div>`;
}
function catEstiloDetalhe(e) {
  const m = souMestre(), nv = catNivelEstilo(e.id), ver = m || nv === 'tudo', livro = e.fonte === 'livro';
  const ideia = livro ? e.ideia : catIdeiaExclusivo(e);
  const quem = catQuemUsa(e);
  const nums = livro
    ? [['Dado de Vida', e.dv.toUpperCase()], ['PV no 1º nível', e.pv1], ['PV nos níveis seguintes', e.pvN], ['Atributo primário', e.info.attr], ['Salvaguardas', e.prof.salv],
       ['Proficiência em equipamento', e.prof.equip], ['Perícias', e.prof.peric], ['Arma favorita', e.info.arma], ['Habilidade básica inata', e.info.hb], ['Equipamento inicial', e.info.equip],
       ['CD das técnicas', e.cd.replace(/^CD das Técnicas = /, '')], ['Ataque das técnicas', e.atq.replace(/^Modificador de ataque da Técnica = /, '')]]
    : [['Dado de Vida', e.dv.toUpperCase()], ['Atributo primário', e.attr], ['Salvaguardas', e.salv], ['Armas', e.armas], ['Perícias', e.pericias], ['Para multiestilo', e.multi]];
  return `<div class="cat-det"><button class="bt fino" data-act="cat-voltar">← Todos os estilos</button>
    <header class="cat-dcab">${ic(catEstIc(e.id), 64)}<div><h2>${esc(e.nome)}</h2><p class="nota">${livro ? `Livro do Jogador 2.1 · ${esc(e.pg)}` : 'Estilos de Combate Exclusivos 2.1 (PDF)'}</p>
      <p>${e.banido ? '<span class="tag ruim">Banido na mesa</span> ' : ''}${m ? catSelo(nv) : ''}${m && quem.length ? ` <span class="tag ouro">no grupo: ${esc(quem.join(', '))}</span>` : ''}</p></div>
      ${m ? catNivelCtl('estilo', e.id, nv) : ''}</header>
    ${m && e.banido ? '<p class="nota">O Herói está banido na sua mesa (cria um companheiro que dá trabalho de narrar). Só revele se mudar de ideia.</p>' : ''}
    <section class="cat-ideia"><h3>A ideia do estilo</h3>${ideia.map(x => `<h4>${esc(x.t)}</h4>${catPars(x.p)}`).join('')}
      ${livro ? `<p class="nota">Regras completas: Livro do Jogador 2.1, ${esc(e.pg)}.</p>` : ''}</section>
    ${ver ? `${m && nv !== 'tudo' ? '<p class="nota cat-so-mestre">Daqui para baixo, os jogadores ainda não veem.</p>' : ''}
      <h3>Em números</h3><dl class="cat-resumo">${nums.filter(([, v]) => v).map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
      ${livro ? `<h3>Características por nível</h3>${catCaracNivel(e)}<h3>Técnicas por nível</h3>${catTecTab(e)}<h3>As técnicas</h3>${catBlocos(e.blocos.filter(b => b.k === 'tec'), null)}`
        : catBlocos(e.blocos.filter(b => !(b.k === 'regra' && /^(Pontos de Vida|Proficiências|Informações Gerais)$/.test(b.t))), null)}
      <p class="nota">${livro ? `Técnicas lidas do Livro do Jogador 2.1 por programa. O texto das características está no livro (${esc(e.pg)}).` : 'Fonte: PDF “Estilos de Combate Exclusivos 2.1”. Texto lido do PDF por programa; se algo parecer cortado, confira no PDF original.'}</p>`
    : catTrancado('Os números, as características e as técnicas aparecem quando o mestre liberar. A regra completa está no livro.')}</div>`;
}
/* quem do grupo usa o estilo (pela ficha lida) */
function catQuemUsa(e) {
  const alvo = sem(e.nome);
  return (S().party || []).filter(p => p.sheet && !p.pdm && sem(p.sheet.estilo || '').includes(alvo)).map(p => nomePC(p));
}
function catEstilos() {
  const m = souMestre(), q = sem(Cat.busca || ''), T = catTodosEstilos();
  if (Cat.aberto) { const e = T.find(x => x.id === Cat.aberto); if (e && catEstiloVisivel(e)) return catEstiloDetalhe(e); Cat.aberto = null; }
  const ok = e => catEstiloVisivel(e) && (!q || sem(e.nome + ' ' + (m || catNivelEstilo(e.id) === 'tudo' ? (e.blocos || []).filter(b => b.k === 'tec').map(b => b.nome).join(' ') : '')).includes(q));
  const cartao = e => { const nv = catNivelEstilo(e.id), quem = m ? catQuemUsa(e) : []; return `<article class="cat-c ${nv ? 'achada' : ''} ${e.banido ? 'banido' : ''}"><button class="cat-abre" data-act="cat-abre" data-id="${e.id}">${ic(catEstIc(e.id), 64)}<span><b>${esc(e.nome)}</b>
      <small>${esc(e.dv.toUpperCase())} · ${esc(e.fonte === 'livro' ? e.info.attr.replace(/\.$/, '') : e.attr)}</small><small class="cat-ti">${e.banido ? 'Banido na mesa' : e.fonte === 'livro' ? esc(e.pg) : 'Exclusivo 2.1'}${quem.length ? ' · no grupo' : ''}</small></span></button>
    ${m ? catNivelCtl('estilo', e.id, nv, true) : (nv === 'ideia' ? '<span class="tag cat-tg">só a ideia</span>' : '')}</article>`; };
  const livro = T.filter(e => e.fonte === 'livro' && ok(e)), excl = T.filter(e => e.fonte === 'exclusivo' && ok(e));
  const grupo = m ? T.filter(e => catQuemUsa(e).length && catNivelEstilo(e.id) !== 'tudo') : [];
  return `<input id="cat-busca" type="search" placeholder="Procurar estilo${m ? ' ou técnica' : ''}" value="${esc(Cat.busca || '')}" data-chg="cat-busca" aria-label="Procurar estilo">
    ${m ? `<p class="nota">Tudo começa escondido, inclusive os estilos que ninguém conhece ainda. Revele cada estilo quando o grupo descobrir.${grupo.length ? '' : ' Os estilos que o grupo já usa estão revelados.'}</p>
      ${grupo.length ? `<p><button class="bt bom" data-act="cat-revela-grupo">Revelar os estilos do grupo (${esc(grupo.map(e => e.nome).join(', '))})</button></p>` : ''}` : ''}
    ${livro.length ? `<h3 class="cat-sub">Do Livro do Jogador</h3><div class="cat-grade">${livro.map(cartao).join('')}</div>` : ''}
    ${excl.length ? `<h3 class="cat-sub">Exclusivos 2.1</h3><div class="cat-grade">${excl.map(cartao).join('')}</div>` : ''}
    ${!livro.length && !excl.length ? `<p class="vazio-li">${m ? 'Nada encontrado.' : 'Nenhum estilo foi revelado ainda. O mestre revela conforme vocês descobrem.'}</p>` : ''}`;
}

/* ───── Espécie nova ───── */
function catEspecie() {
  const o = window.CATALOGO.extra.oni;
  return `<div class="cat-det"><header class="cat-dcab">${ic(icOu('especies2:oni_guerreiro', 'especies:gigante'), 64)}<div><h2>Oni</h2><p class="nota">${esc(o.pg)} · o texto do arquivo chama a espécie de “Ogros” (é a mesma palavra: na tradução, “oni” vira “ogro”)</p></div></header>
    <p><button class="bt fino" data-act="lore-ir" data-id="oni">${ic('modos:wiki', 32)} Ler o que se sabe dos Oni no mundo de One Piece</button></p>
    <h3>Regras em resumo</h3><div class="cat-corpo">${catPars(o.resumo)}</div>${catBlocos(o.blocos, null)}
    <p class="nota">Treinamentos de Espécie só valem para essa espécie ou mestiços dela. Dado de vida do “Corpo do Ogro”: sempre d12, qualquer que seja o estilo.</p></div>`;
}

/* ───── a tela ───── */
VIEWS.catalogo = {
  titulo: 'Catálogo', icone: 'itensop:akuma_no_mi', chaves: ['estado'],
  visivel: () => catTemAlgo(),
  render() {
    if (!window.CATALOGO) { catCarregar(); return `<section class="catalogo-v"><h1>${ic('itensop:akuma_no_mi', 64)}Catálogo</h1>${Cat.falhou ? '<p class="aviso-via">Não deu para carregar o catálogo. Confira a internet e tente de novo.</p><button class="bt" data-act="cat-tentar">Tentar de novo</button>' : '<p class="nota">Carregando o catálogo…</p>'}</section>`; }
    const m = souMestre(), abas = CAT_ABAS.filter(([k]) => m || !catEscondida(k));
    if (!abas.find(([k]) => k === Cat.aba)) Cat.aba = (abas[0] || [])[0];
    const corpo = !Cat.aba ? '<p class="vazio-li">O mestre ainda não abriu nada aqui.</p>' : Cat.aba === 'frutas' ? catFrutas() : Cat.aba === 'estilos' ? catEstilos() : (catEspecieVisivel() ? catEspecie() : '');
    return `<section class="catalogo-v"><header class="col-cab"><h1>${ic('itensop:akuma_no_mi', 64)}Catálogo</h1>
      <p class="nota">${m ? 'Akuma no Mi, estilos de combate e a espécie Oni. Você vê tudo; os jogadores só veem o que você revelar, item por item.' : 'O que o grupo já descobriu: Akuma no Mi, estilos de combate e a espécie Oni. O resto aparece conforme a história anda.'}</p></header>
      <div class="chips cat-abas">${abas.map(([k, n, i]) => `<button class="chip ${k === Cat.aba ? 'on' : ''}" data-act="cat-aba" data-k="${k}">${ic(i, 32)} ${n}</button>`).join('')}</div>
      ${m ? catControleMestre() : ''}
      ${corpo}</section>`;
  }
};
/* o mestre escolhe quais categorias inteiras os jogadores enxergam */
function catControleMestre() {
  const itens = [['frutas', 'Akuma no Mi'], ['estilos', 'Estilos de combate'], ['especies', 'Espécie Oni'], ['guia_especies', 'Guia de lore: espécies'], ['guia_mundo', 'Guia de lore: o mundo']];
  const n = itens.filter(([k]) => catEscondida(k)).length;
  return `<div class="caixa cat-ctl"><button class="bt fino" data-act="cat-ctl" aria-expanded="${!!Cat.ctl}">${ic('mesa:olho', 32)} Categorias que os jogadores enxergam${n ? ` · ${n} escondida${n > 1 ? 's' : ''}` : ''} ${Cat.ctl ? '▾' : '▸'}</button>
    ${Cat.ctl ? `<p class="nota">Desmarque para esconder a categoria inteira, sem apagar nada. Vale na hora, para todo mundo. (Dentro de cada categoria, você ainda escolhe item por item.)</p>
    <div class="chips">${itens.map(([k, nm]) => `<button class="chip ${catEscondida(k) ? '' : 'on'}" data-act="cat-esconder" data-k="${k}" aria-pressed="${!catEscondida(k)}">${ic(catEscondida(k) ? 'mesa:olho_fechado' : 'mesa:olho', 32)} ${nm}</button>`).join('')}</div>` : ''}</div>`;
}

ACT['cat-ctl'] = () => { Cat.ctl = !Cat.ctl; App.render(); };
ACT['cat-aba'] = el => { Cat.aba = el.dataset.k; Cat.aberto = null; Cat.busca = ''; App.render(); };
ACT['cat-abre'] = el => { Cat.aberto = el.dataset.id; App.render(); window.scrollTo(0, 0); };
ACT['cat-voltar'] = () => { Cat.aberto = null; App.render(); };
ACT['cat-tentar'] = () => { Cat.falhou = false; Cat.promessa = null; App.render(); };
ACT['cat-busca'] = el => { Cat.busca = el.value; App.render(); const b = $('#cat-busca'); if (b) { b.focus(); b.setSelectionRange(b.value.length, b.value.length); } };
ACT['cat-nivel'] = el => {
  const { t, id, v } = el.dataset, campo = t === 'fruta' ? 'descobertas' : 'estilos';
  const ant = t === 'fruta' ? catNivelFruta(id) : catNivelEstilo(id);
  const mud = { catalogo: { [campo]: { [id]: v || false } } };
  if (t === 'estilo' && !v && (catEst().liberados || {})[id]) mud.catalogo.liberados = { [id]: false };
  gravarEstado(mud);
  /* primeira vez que o item aparece para os jogadores: aviso na tela deles (a fruta flutua e pulsa) */
  const item = t === 'fruta' ? ((window.CATALOGO || {}).frutas || []).find(f => f.id === id) : catTodosEstilos().find(e => e.id === id);
  if (v && !ant && item) avisar(t, `${item.nome}: ${t === 'fruta' ? (v === 'ideia' ? 'o grupo descobriu a ideia dessa fruta.' : 'o grupo descobriu tudo sobre essa fruta.') : 'o grupo descobriu esse estilo de combate.'}`, { icone: t === 'fruta' ? catFrutaIc(item) : catEstIc(id) });
  toast(!v ? 'Escondido dos jogadores.' : v === 'ideia' ? 'Os jogadores veem só a ideia.' : 'Os jogadores veem tudo.', { tipo: v ? 'bom' : undefined });
};
ACT['cat-revela-grupo'] = () => {
  const l = catTodosEstilos().filter(e => catQuemUsa(e).length); if (!l.length) return;
  gravarEstado({ catalogo: { estilos: Object.fromEntries(l.map(e => [e.id, 'tudo'])) } });
  toast(`Revelados: ${esc(l.map(e => e.nome).join(', '))}.`, { tipo: 'bom' });
};
ACT['cat-esconder'] = el => { const k = el.dataset.k, ja = catEscondida(k); gravarEstado({ catalogo: { esconder: { [k]: !ja } } }); };
ACT['lore-ir'] = el => { const id = el.dataset.id; loreAberto = id; location.hash = '#guia'; setTimeout(() => { const a = $('#lore-' + id); if (a) a.scrollIntoView({ block: 'start', behavior: 'smooth' }); }, 250); };
