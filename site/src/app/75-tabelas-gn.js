/* ═══════════ TABELAS DO GUIA DO NARRADOR (Bloco 6) ═══════════
   Eventos que abalam o mundo, eventos fechados (d100), formas de governo (d100) e encontros aleatórios.
   Os dados vêm de data/tabelas_gn.json (window.TABGN), lidos do texto do GN 2.0 e conferidos contra ele.
   Só o mestre vê: ele rola e conta aos jogadores o que quiser. Cada item: [de, até, título, detalhe?, perguntas?]. */
const TabGN = { grupo: 'mundo', res: {}, aberta: new Set() };
const TABGN_GRUPOS = [['mundo', 'Mundo e campanha', 'trip:rumores'], ['governo', 'Governo', 'trip:governo'], ['encontro', 'Encontros aleatórios', 'mar:ilha']];
/* o resultado do evento que abala o mundo pede uma segunda rolagem em outra tabela */
const TABGN_SUB = { 1: 'personalidade', 2: 'personalidade', 3: 'perdido', 5: 'invasor', 6: 'descoberta', 7: 'calamidade', 8: 'organizacao' };
/* Bloco 7: para que serve cada grupo e cada tabela (resumo do que o GN 2.0 explica) */
const TABGN_GRUPO_TXT = {
  mundo: 'Para criar os grandes acontecimentos da campanha (GN p. 24). O livro sugere até três eventos grandes (um no começo, um no meio e um no fim) e quantos eventos pequenos você quiser, que abalam só uma ilha, uma vila ou uma tripulação.',
  governo: 'Para decidir quem manda numa ilha, num reino ou numa cidade que você não preparou (GN p. 16–17). Bom para quando o grupo chega num lugar novo e alguém pergunta “quem governa aqui?”.',
  encontro: 'Para o inesperado em viagens, descansos e explorações (GN p. 48). Use quando o grupo descansa, viaja por muito tempo, chama atenção quando devia se esconder ou quando a mesa perde o ritmo. Regra do livro: role um d20 em segredo; com 18 ou mais acontece um encontro, e aí você rola na tabela do lugar. Se não fizer sentido, role de novo.'
};
const TABGN_USO = {
  evento: { serve: 'Inventar um acontecimento grande que mexe com o mundo ou com uma ilha: alguém sobe ou cai, uma guerra, um desastre, uma descoberta.', quando: 'No começo de um arco (cria ganchos), no meio (vira o jogo) ou no fim (clímax). Não use toda sessão: perde a graça.', ex: 'd8 = 2 (queda de uma grande personalidade) + “Almirante e Grandes Marinheiros” → um almirante famoso cai em desgraça; as bases que ele protegia ficam sem comando, e isso é oportunidade e perigo para o grupo.' },
  personalidade: { serve: 'Complemento do evento 1 ou 2: diz que tipo de pessoa sobe ou cai.', quando: 'Rola sozinho junto com o evento. Também dá para rolar à parte para criar um PdM importante.' },
  perdido: { serve: 'Complemento do evento 3: o que está acabando (um recurso, um povo, um saber).', quando: 'Rola sozinho junto com o evento.' },
  invasor: { serve: 'Complemento do evento 5: quem ataca ou invade.', quando: 'Rola sozinho junto com o evento.' },
  descoberta: { serve: 'Complemento do evento 6: o que foi descoberto, inventado ou encontrado.', quando: 'Rola sozinho junto com o evento. Ótimo para um boato que leva o grupo a uma ilha.' },
  calamidade: { serve: 'Complemento do evento 7: o desastre.', quando: 'Rola sozinho junto com o evento. Se não combinar com o lugar, tente justificar antes de rolar de novo.' },
  organizacao: { serve: 'Complemento do evento 8: que grupo novo surge (uma ordem, um bando, uma seita).', quando: 'Rola sozinho junto com o evento.' },
  fechados: { serve: 'Um evento com data marcada (festival, coroação, eclipse, torneio, leilão) que vira o centro da aventura ou a isca para atrair o grupo.', quando: 'Ao preparar uma ilha nova, ou quando o grupo chega e você quer que algo já esteja acontecendo.', ex: '“Evento de arena” → um torneio na ilha cujo prêmio é uma Akuma no Mi; quem organiza tem segundas intenções.' },
  governo: { serve: 'Decidir a forma de governo de uma ilha, reino ou cidade.', quando: 'Na hora de criar um lugar novo, ou no improviso quando o grupo pergunta quem manda.', ex: '“Plutocracia” → os comerciantes mais ricos mandam, e a base da Marinha local está comprada.' },
  selvagem: { serve: 'Quem o grupo encontra explorando mata, montanha ou ilha deserta. As criaturas têm ficha no Manual dos Inimigos.', quando: 'Em explorações e acampamentos. Encontro justo: uma criatura com ND igual ou menor que o nível do grupo.' },
  urbano: { serve: 'O que acontece nas ruas de uma cidade: briga, ladrão, desfile, gente pedindo ajuda.', quando: 'Verifique uma vez de dia e uma vez à noite, se o grupo estiver na rua.' },
  mar: { serve: 'O que aparece no mar quando o navegador falha no Teste de Navegação: Rei dos Mares, tempestade, navio pirata…', quando: 'Na viagem entre ilhas. É a mesma tabela da aba Viagem e da Colinha.' },
  submerso: { serve: 'Encontros debaixo d’água: mergulho, naufrágio, a caminho da Ilha dos Homens-Peixe.', quando: 'Com a mesma frequência dos encontros em terra.' },
  batalha: { serve: 'Algo que muda uma batalha naval no meio: neblina, ventania, ondas, destroços.', quando: 'Durante uma batalha entre navios. Role um d6 para a duração: 10 minutos para cada ponto.' }
};
const tabUso = t => { const u = TABGN_USO[t.id]; if (!u) return '';
  return `<div class="tgn-uso"><p><b>Para que serve:</b> ${esc(u.serve)}</p>${u.quando || u.ex ? `<details><summary>Quando usar${u.ex ? ' e um exemplo' : ''}</summary>${u.quando ? `<p>${esc(u.quando)}</p>` : ''}${u.ex ? `<p class="tgn-ex"><b>Exemplo:</b> ${esc(u.ex)}</p>` : ''}</details>` : ''}</div>`; };
const tabPorId = id => (window.TABGN || []).find(t => t.id === id);
function tabItens(t) {
  if (t.ref === 'mar' && typeof ENCONTRO_MAR !== 'undefined') return Object.entries(ENCONTRO_MAR).map(([n, e]) => [+n, +n, e.n, e.t]);
  return t.itens;
}
const faixaTxt = (a, b, dado) => { const z = dado >= 100 ? 2 : 0, f = n => String(n).padStart(z, '0'); return a === b ? f(a) : `${f(a)}–${f(b === 100 && dado === 100 ? 100 : b)}`; };
function tabAcha(t, n) { return tabItens(t).find(([a, b]) => n >= a && n <= b); }
function tabRolar(id) {
  const t = tabPorId(id); if (!t) return null;
  const n = 1 + Math.floor(Math.random() * t.dado), it = tabAcha(t, n); if (!it) return null;
  const r = { id, n, dado: t.dado, titulo: it[2], detalhe: it[3] || '', perguntas: it[4] || [], em: Date.now() };
  if (id === 'evento' && TABGN_SUB[n]) {
    const s = tabPorId(TABGN_SUB[n]), m = 1 + Math.floor(Math.random() * s.dado), si = tabAcha(s, m);
    if (si) r.sub = { nome: s.nome, n: m, dado: s.dado, titulo: si[2] };
  }
  return r;
}
function tabResHTML(t) {
  const r = TabGN.res[t.id]; if (!r) return '';
  /* o jornal entra girando uma vez só, quando o resultado é novo; nas outras desenhadas da página ele já fica parado de frente */
  const jornal = t.id === 'evento' && (window.MANIFEST || {}).anims && MANIFEST.anims.evento ? `<span class="tgn-jornal">${anim('evento', 1.2, { umaVez: true, dur: r.tocou ? 0.01 : 1.5 })}</span>` : '';
  r.tocou = true;
  return `<div class="tgn-res" role="status">${jornal}<header><span class="tgn-d">d${r.dado} = <b>${r.n}</b></span><b class="tgn-tit">${esc(r.titulo)}</b></header>
    ${r.detalhe ? `<p>${esc(r.detalhe)}</p>` : ''}
    ${r.sub ? `<p class="tgn-sub"><small>${esc(r.sub.nome)} · d${r.sub.dado} = ${r.sub.n}</small><br><b>${esc(r.sub.titulo)}</b></p>` : ''}
    ${r.perguntas.length ? `<details open><summary>Perguntas para desenvolver</summary><ul>${r.perguntas.map(q => `<li>${esc(q)}</li>`).join('')}</ul></details>` : ''}
    <div class="linha-bts"><button class="bt fino" data-act="tgn-rolar" data-id="${t.id}">Rolar de novo</button><button class="bt fino" data-act="tgn-copiar" data-id="${t.id}">Copiar</button></div></div>`;
}
function tabCartao(t) {
  const aberta = TabGN.aberta.has(t.id), r = TabGN.res[t.id], itens = tabItens(t);
  return `<article class="pap tgn" id="tgn-${t.id}">
    <header class="tgn-cab"><h3>${esc(t.nome)}</h3><span class="tag">d${t.dado}</span><small class="nota">${esc(t.pg)}</small></header>
    ${tabUso(t)}${t.intro ? `<p class="nota">${esc(t.intro)}</p>` : ''}
    <div class="linha-bts"><button class="bt ouro" data-act="tgn-rolar" data-id="${t.id}">${ic('mesa:d20', 32)} Rolar d${t.dado}</button>
      <button class="bt fino" data-act="tgn-ver" data-id="${t.id}" aria-expanded="${aberta}">${aberta ? 'Esconder a tabela' : 'Ver a tabela inteira'}</button></div>
    ${tabResHTML(t)}
    ${aberta ? `<div class="tgn-tab"><table class="tab"><tr><th>d${t.dado}</th><th>Resultado</th></tr>${itens.map(([a, b, tit, det]) => `<tr class="${r && r.n >= a && r.n <= b ? 'sorteado' : ''}"><td class="tgn-f">${faixaTxt(a, b, t.dado)}</td>
      <td><b>${esc(tit)}</b>${det ? `<br><span class="nota">${esc(det)}</span>` : ''}</td></tr>`).join('')}</table></div>` : ''}
  </article>`;
}
VIEWS.tabelas = {
  titulo: 'Tabelas do Narrador', icone: 'modos:regras',
  render() {
    const T = window.TABGN || [], g = TabGN.grupo;
    return `<section class="tabelas-v"><header class="col-cab"><h1>${ic('modos:regras', 64)}Tabelas do Narrador</h1>
      <p class="nota">Ferramentas de improviso do Guia do Narrador 2.0. Servem para quando falta ideia, quando o grupo vai para onde você não preparou, ou para deixar o mundo vivo. Você rola em segredo, lê o resultado e adapta: nada é obrigatório. Cada tabela tem a página do livro.</p></header>
      <div class="chips tgn-abas">${TABGN_GRUPOS.map(([k, n, i]) => `<button class="chip ${k === g ? 'on' : ''}" data-act="tgn-grupo" data-g="${k}">${ic(i, 32)} ${n} <small>${T.filter(t => t.grupo === k).length}</small></button>`).join('')}</div>
      ${TABGN_GRUPO_TXT[g] ? `<p class="tgn-grupo-txt">${esc(TABGN_GRUPO_TXT[g])}</p>` : ''}
      <div class="tgn-l">${T.filter(t => t.grupo === g).map(tabCartao).join('') || '<p class="nota">Sem tabelas.</p>'}</div>
    </section>`;
  }
};
ACT['tgn-grupo'] = el => { TabGN.grupo = el.dataset.g; App.render(); };
ACT['tgn-rolar'] = el => { const r = tabRolar(el.dataset.id); if (!r) return; TabGN.res[el.dataset.id] = r; Som.tocar('dado'); App.render(); };
ACT['tgn-ver'] = el => { const id = el.dataset.id; if (TabGN.aberta.has(id)) TabGN.aberta.delete(id); else TabGN.aberta.add(id); App.render(); };
ACT['tgn-copiar'] = async el => {
  const r = TabGN.res[el.dataset.id], t = tabPorId(el.dataset.id); if (!r || !t) return;
  const txt = `${t.nome} (${t.pg}), d${r.dado} = ${r.n}: ${r.titulo}${r.detalhe ? '. ' + r.detalhe : ''}${r.sub ? `\n${r.sub.nome}, d${r.sub.dado} = ${r.sub.n}: ${r.sub.titulo}` : ''}${r.perguntas.length ? '\n' + r.perguntas.map(q => '- ' + q).join('\n') : ''}`;
  try { await navigator.clipboard.writeText(txt); toast('Copiado. Cole no Diário ou nas notas da ilha.', { tipo: 'bom' }); }
  catch (e) { toast('Não deu para copiar aqui. Selecione o texto e copie.', { tipo: 'ruim' }); }
};
