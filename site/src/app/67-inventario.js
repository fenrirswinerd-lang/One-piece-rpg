/* ═══════════ INVENTÁRIO com recipientes e carga (Bloco 3) ═══════════
   Regras do Livro do Jogador:
   · Capacidade de Carga = 10 × Força em kg, dobra por categoria de tamanho acima de Médio, metade se Miúdo (LJ p. 12 e p. 256–257).
     O site usa o "Max" da ficha (aba Personalização e Inventário), que já faz essa conta. Sem ficha: 10 × Força.
   · Acima da Capacidade: dá para arrastar até 20 × Força, com deslocamento 1,5 m (LJ p. 256).
   · Variação Sobrecarga (opcional da mesa): acima de 3 × Força −3 m; acima de 6 × Força −6 m e desvantagem em Força, Destreza e Constituição.
   · Recipientes (LJ p. 245): o que está dentro conta na carga de quem carrega. A mochila só organiza e limita o quanto cabe nela.
   · Pesos dos itens: LJ p. 246–251 (PESO_LJ abaixo). Armas: tabela de armas do livro (já vem da loja).
   · "No navio" não pesa: fica guardado a bordo.
   Cada item: { id, nome, qtd, peso (kg de cada), nota, ic, em: idDoRecipiente | 'navio' | null, cap: kg que cabe (só recipiente) } */
const RECIP = [
  { k: 'mochila pequena', n: 'Mochila Pequena', cap: 30, kg: 1 }, { k: 'mochila media', n: 'Mochila Média', cap: 60, kg: 1.5 }, { k: 'mochila grande', n: 'Mochila Grande', cap: 100, kg: 2.5 },
  { k: 'algibeira', n: 'Algibeira', cap: 3, kg: 0.5, sug: true }, { k: 'saco', n: 'Saco', cap: 10, kg: 0.5, sug: true }, { k: 'cesto', n: 'Cesto', cap: 20, kg: 1, sug: true },
  { k: 'bau', n: 'Baú', cap: 150, kg: 15 }];
const PESO_LJ = { 'Ferramenta de Profissão': [4, 246], 'Livro de Profissão': [3, 246], 'Kit de Chaves': [3, 246], 'Kit de Construção': [2.5, 246], 'Kit de Cozinha': [6, 246], 'Kit de Disfarce': [3, 246],
  'Kit de Escalada': [4.5, 246], 'Kit de Falsificação': [1, 246], 'Kit Médico': [2, 246], 'Kit de Pesquisa': [3.5, 246], 'Kit de Primeiros Socorros': [1, 246], 'Kit de Temperos': [1.5, 246],
  'Kit para Abrir Cadeado': [0.5, 246], 'Kit de Herbalismo': [1.5, 246], 'Kit de Venenos': [1.5, 247], 'Algemas de Kairoseki': [3, 247], 'Algemas': [1, 247], 'Grilhões de Transporte': [7, 247],
  'Rede de Pesca': [2, 247], 'Rede de Captura': [2, 247], 'Rede de Kairoseki': [6, 247], 'Cantil': [0.5, 247], 'Mochila Pequena': [1, 247], 'Mochila Média': [1.5, 247], 'Mochila Grande': [2.5, 247],
  'Chapa Metálica de Aço': [12, 247], 'Corda': [3, 247], 'Corrente de Elos': [2.5, 247], 'Lingote de Metal': [1, 247], 'Lingote': [1, 247], 'Tábua de Madeira': [5, 247], 'Asa Delta': [10, 248],
  'Equipamento de Mergulho': [36, 248], 'Ganchos de Escalada': [1.5, 248], 'Lanterna': [0.5, 248], 'Óculos de Visão Noturna': [0.5, 248], 'Baú': [15, 248], 'Caixa de Maquiagem': [1, 248],
  'Cofre': [35, 248], 'Instrumento Musical': [1, 248], 'Isca de Peixe': [0.2, 248], 'Pólvora': [1, 248], 'Tabaco': [0.1, 248], 'Vara de Pescar': [1, 248], 'Roupa de Gala': [1, 248],
  'Roupa Especial': [1, 249], 'Den-Den Mushi Alto-Falante': [5, 249], 'Den-Den Mushi Bebê': [0.2, 249], 'Den-Den Mushi Branco': [0.8, 249], 'Den-Den Mushi Câmera': [2, 249],
  'Den-Den Mushi Fone': [0.3, 249], 'Den-Den Mushi Preto': [0.1, 249], 'Den-Den Mushi Padrão': [0.5, 249], 'Den-Den Mushi': [0.5, 249], 'Eternal Pose': [1, 249], 'Log Pose de 3 Agulhas': [0.2, 249],
  'Log Pose': [0.2, 249], 'Bateria Grande': [15, 249], 'Carvão': [10, 249], 'Núcleo de Energia': [3, 251], 'Pilha': [0.1, 251], 'Bateria': [0.1, 251], 'Ampola de Anestesia': [0.1, 251],
  'Antídoto': [0.2, 251], 'Frasco de Ácido': [0.3, 251], 'Tubo de Ensaio': [0.1, 251], 'Veneno Básico': [0.1, 251], 'Bastão de Fumaça': [0.4, 251], 'Gás do Sono': [1.5, 251],
  'Gás Inflamável': [1.5, 251], 'Ração de Viagem': [0.5, 251], 'Ração Militar': [0.7, 251], 'Ração para Animais': [0.5, 251], 'Refeição': [0.8, 251] };
/* o nome mais comprido que aparece dentro do nome do item ganha (Kit de Primeiros Socorros antes de Kit) */
const PESO_CHAVES = Object.keys(PESO_LJ).map(n => [sem(n), n]).sort((a, b) => b[0].length - a[0].length);
function pesoLJ(nome) {
  const s = sem(nome); const h = PESO_CHAVES.find(([k]) => s.includes(k)); if (h) return { kg: PESO_LJ[h[1]][0], pag: PESO_LJ[h[1]][1], nome: h[1] };
  /* nome parecido ("kits de temperos", "primero socorro"): só vale se bater com um item só do livro */
  const ps = Object.keys(PESO_LJ).filter(k => mesmoItem(k, nome)), kg = new Set(ps.map(k => PESO_LJ[k][0]));
  if (!ps.length || kg.size > 1) return null;
  const k = ps.sort((a, b) => b.length - a.length)[0]; return { kg: PESO_LJ[k][0], pag: PESO_LJ[k][1], nome: k, parecido: true };
}
function recipDe(nome) {
  let s = sem(nome).replace(/-/g, ' '); if (/dormir|de pancada|baunilha/.test(s)) return null;   // saco de dormir não é recipiente
  s = s.replace(/\bmochila\s+(p|peq[a-z.]*)(?![a-z])/, 'mochila pequena').replace(/\bmochila\s+(m|med[a-z.]*)(?![a-z])/, 'mochila media').replace(/\bmochila\s+(g|gde|gra[a-z.]*)(?![a-z])/, 'mochila grande');
  let r = RECIP.find(x => new RegExp('(^|[^a-z])' + x.k + '([^a-z]|$)').test(s));
  if (!r && /(^|[^a-z])mochila([^a-z]|$)/.test(s)) r = RECIP[0];   // "mochila" sem tamanho: vale a Pequena (30 kg)
  if (!r) return null;
  const m = s.match(/(\d+[.,]?\d*)\s*kg/);   // "mochila pequena cabe (30kg)": vale o número escrito
  return { ...r, cap: m ? num(m[1]) : r.cap };
}
const capDe = x => x.cap != null ? num(x.cap) : (recipDe(x.nome) || {}).cap ?? null;
const ehRecip = x => capDe(x) != null;
const pesoDe = x => (num(x.peso) || 0) * (num(x.qtd) || 0);
/* onde o item está de verdade (sobe pelos recipientes): 'corpo' ou 'navio' */
function lugar(itens, x, n = 0) {
  if (x.em === 'navio') return 'navio'; if (!x.em || n > 8) return 'corpo';
  const pai = itens.find(y => y.id === x.em); return pai ? lugar(itens, pai, n + 1) : 'corpo';
}
const dentro = (itens, id) => itens.filter(y => y.em === id);
/* peso de tudo que está dentro do recipiente (inclui recipientes dentro dele e o que tem neles) */
function pesoDentro(itens, id, n = 0) { if (n > 8) return 0; return dentro(itens, id).reduce((a, y) => a + pesoDe(y) + (ehRecip(y) ? pesoDentro(itens, y.id, n + 1) : 0), 0); }
const pesoCarregado = i => (i.itens || []).filter(x => lugar(i.itens, x) === 'corpo').reduce((a, x) => a + pesoDe(x), 0);
const pesoNavio = i => (i.itens || []).filter(x => lugar(i.itens, x) === 'navio').reduce((a, x) => a + pesoDe(x), 0);
/* recipientes onde o item pode ir (nunca nele mesmo nem dentro do que está dentro dele) */
function destinos(itens, x) {
  const proibidos = new Set([x.id]); let mudou = true;
  while (mudou) { mudou = false; itens.forEach(y => { if (y.em && proibidos.has(y.em) && !proibidos.has(y.id)) { proibidos.add(y.id); mudou = true; } }); }
  const tam = ehRecip(x) ? capDe(x) : pesoDe(x);   // não oferece o que não cabe (baú dentro da mochila, por exemplo)
  return itens.filter(y => ehRecip(y) && !proibidos.has(y.id) && (capDe(y) >= tam || y.id === x.em));
}
/* carga da ficha: Max já tem tamanho e Força. Os limites da Variação usam o mesmo multiplicador de tamanho. */
function cargaDe(f) {
  const forca = f && f.attrs && f.attrs[0] ? num(f.attrs[0].v) : null;
  const max = f ? (num(f.cargaMax) || (forca ? forca * 10 : null)) : null;
  const mult = max && forca ? max / (10 * forca) : 1;
  return { max, forca, mult, arrasta: forca ? forca * 20 * mult : null, sc1: forca ? forca * 3 * mult : null, sc2: forca ? forca * 6 * mult : null, daFicha: !!(f && num(f.cargaMax)) };
}
/* quais recipientes estão abertos (fica guardado neste navegador; começa tudo fechado) */
const invAberto = new Set((() => { try { return JSON.parse(lembrar('inv-aberto') || '[]'); } catch (e) { return []; } })());
ACT['inv-abre'] = el => { const id = el.dataset.id; invAberto.has(id) ? invAberto.delete(id) : invAberto.add(id); lembrar('inv-aberto', JSON.stringify([...invAberto])); App.render(); };
ACT['inv-tudo'] = el => { const i = inv(); if (el.dataset.v === '1') i.itens.filter(ehRecip).forEach(x => invAberto.add(x.id)); else invAberto.clear(); lembrar('inv-aberto', JSON.stringify([...invAberto])); App.render(); };
const kgTxt = v => String(Math.round((v || 0) * 10) / 10).replace('.', ',');

JOG.inventario = function (j, f) {
  const i = inv(), it = i.itens, peso = pesoCarregado(i), navio = pesoNavio(i), C = cargaDe(f), beli = i.beli ?? (f ? num(f.dinheiro) : 0) ?? 0, est = meuEstilo();
  const acima = C.max && peso > C.max;
  let aviso = '';
  if (C.max && peso > (C.arrasta || Infinity)) aviso = `<small class="ruim">Passou de 20× Força (${kgTxt(C.arrasta)} kg): não consegue mover isso tudo. Deixe algo no navio.</small>`;
  else if (acima) aviso = `<small class="ruim">Acima da Capacidade de Carga: só dá para arrastar, com deslocamento 1,5 m (LJ p. 256).</small>`;
  else if (C.sc2 && peso > C.sc2) aviso = `<small>Se a mesa usa a Variação Sobrecarga: −6 m de deslocamento e desvantagem em testes de Força, Destreza e Constituição.</small>`;
  else if (C.sc1 && peso > C.sc1) aviso = `<small>Se a mesa usa a Variação Sobrecarga: −3 m de deslocamento.</small>`;
  const linha = x => {
    const ds = destinos(it, x), cap = capDe(x), pd = cap != null ? pesoDentro(it, x.id) : 0, sug = !x.peso && pesoLJ(x.nome);
    return `<li class="${cap != null ? 'recip' : ''}"><span class="inv-ic">${x.ic ? ic(x.ic, 48) : ic(cap != null ? 'itens:mochila' : 'itens:mochila', 48)}</span><div><b>${esc(x.nome)}</b>${x.nota ? `<small>${esc(x.nota)}</small>` : ''}
        ${cap != null ? `<small class="${pd > cap ? 'ruim' : ''}">Recipiente: ${kgTxt(pd)} / ${kgTxt(cap)} kg dentro${pd > cap ? ' · não cabe tudo' : ''}</small>${dentro(it, x.id).length ? `<button class="bt fino inv-abre" data-act="inv-abre" data-id="${x.id}" aria-expanded="${invAberto.has(x.id)}">${invAberto.has(x.id) ? '▾ Fechar' : '▸ Abrir'} (${dentro(it, x.id).length} ${dentro(it, x.id).length === 1 ? 'item' : 'itens'})</button>` : ''}<button class="bt fino inv-abre" data-act="inv-colar" data-id="${x.id}" title="Cole a lista do que tem dentro (por exemplo, a anotação da mochila na ficha)">＋ Colar lista</button>` : ''}
        ${sug ? `<small>Sem peso. Livro: ${kgTxt(sug.kg)} kg (${esc(sug.nome)}, LJ p. ${sug.pag}) <button class="link" data-act="inv-peso-lj" data-id="${x.id}">usar</button></small>` : ''}
        <label class="inv-onde">Onde <select data-chg="inv-onde" data-id="${x.id}" aria-label="Onde está ${esc(x.nome)}"><option value="">No corpo</option>${ds.map(d => `<option value="${d.id}" ${x.em === d.id ? 'selected' : ''}>Dentro: ${esc(d.nome)}</option>`).join('')}<option value="navio" ${x.em === 'navio' ? 'selected' : ''}>No navio (não pesa)</option></select></label>
        ${x.resgate ? `<button class="bt ouro fino inv-resg" data-act="inv-resgatar" data-id="${x.id}">${ic('itensop:beli_moedas', 20)} Resgatar ฿ ${fmt(x.resgate * (x.qtd || 1))}</button>` : ''}${x.valor && lojaAberta() ? `<button class="bt bom fino inv-resg" data-act="inv-vender" data-id="${x.id}">${ic('itensop:beli_notas', 20)} Vender na loja por ฿ ${fmt(x.valor)}</button>` : ''}</div>
      <span class="inv-peso">${x.peso ? kgTxt(x.peso) + ' kg' + ((num(x.qtd) || 0) > 1 ? `<small>${kgTxt(pesoDe(x))} no total</small>` : '') : ''}</span>
      <div class="inv-q"><button class="bt-ic mini" data-act="inv-q" data-id="${x.id}" data-d="-1" aria-label="Menos">−</button><b>${x.qtd}</b><button class="bt-ic mini" data-act="inv-q" data-id="${x.id}" data-d="1" aria-label="Mais">+</button></div>
      <button class="bt-ic mini" data-act="inv-tirar" data-id="${x.id}" aria-label="Tirar ${esc(x.nome)}">×</button></li>`;
  };
  /* em árvore: no corpo, depois cada recipiente com o que tem dentro */
  const arvore = (pai, n = 0) => {
    const filhos = it.filter(x => pai === null ? (!x.em || (x.em !== 'navio' && !it.some(y => y.id === x.em))) : x.em === pai);
    return filhos.map(x => linha(x) + (ehRecip(x) && n < 6 && invAberto.has(x.id) && dentro(it, x.id).length ? `<li class="inv-dentro"><ul class="inv-l">${arvore(x.id, n + 1)}</ul></li>` : '')).join('');
  };
  const noNavio = arvore('navio');
  return `<section class="jg-sec inv">
      <div class="inv-topo">
        <div class="carteira">${ic('itensop:beli_moedas', 64)}<div><p class="rot">Carteira</p>${est === 'timao' ? `<input id="inv-beli" type="number" value="${beli}" data-chg="inv-beli" style="width:9em">` : `<p class="beli">฿ ${fmt(beli)}</p>`}</div></div>
        <div class="inv-mov"><input id="inv-valor" type="number" min="0" step="100" placeholder="Valor ฿" style="width:8em"><input id="inv-motivo" placeholder="Motivo (ex.: kit médico)" class="cresce" maxlength="60">
          <button class="bt bom fino" data-act="inv-mov" data-s="1">Ganhar</button><button class="bt ruim fino" data-act="inv-mov" data-s="-1">Gastar</button></div>
        <div class="carga">${ic('status:carga', 32)}<span>Carga</span>${barrinha(peso, C.max, acima ? 'ruim' : C.sc1 && peso > C.sc1 ? 'meio' : '')}<b>${kgTxt(peso)}${C.max ? ' / ' + kgTxt(C.max) : ''} kg</b>
          <small>${C.max ? (C.daFicha ? 'Capacidade da ficha (Força e tamanho)' : '10 × Força (a ficha não tem o Max)') : 'Sem ficha: sem limite calculado'}${navio ? ` · ${kgTxt(navio)} kg guardados no navio` : ''}</small>${aviso}</div>
      </div>
      ${it.some(x => ehRecip(x) && dentro(it, x.id).length) ? `<div class="inv-tudo"><button class="bt fino" data-act="inv-tudo" data-v="1">▾ Abrir todos</button><button class="bt fino" data-act="inv-tudo" data-v="0">▸ Fechar todos</button></div>` : ''}
      <h3>Itens <small class="nota">${it.length} ${it.length === 1 ? 'linha' : 'linhas'} · a ficha do Docs tem 14${it.length > 14 ? ' · <span class="ruim">passou de 14: o que sobrar não cabe na ficha</span>' : ''}</small></h3>
      ${it.length ? `<ul class="inv-l">${arvore(null)}</ul>${noNavio ? `<h3>${ic('mesa:navio', 32)} Guardado no navio <small class="nota">não conta na carga</small></h3><ul class="inv-l">${noNavio}</ul>` : ''}`
        : '<p class="nota">Inventário vazio. Adicione itens ou traga da ficha.</p>'}
      <div class="inv-add"><button class="bt-ic" data-act="inv-ic" id="inv-ic-bt" title="Ícone do item">${ic(JOG.icNovo || 'itens:mochila', 32)}</button><input id="inv-nome" placeholder="Nome do item" class="cresce" maxlength="50" data-enter="inv-add">
        <label>Qtd <input id="inv-qtd" type="number" min="1" value="1" style="width:4em"></label><label>kg cada <input id="inv-peso" type="number" min="0" step="0.1" placeholder="livro" style="width:5em"></label>
        <input id="inv-nota" placeholder="Nota (opcional)" maxlength="80"><button class="bt" data-act="inv-add">Adicionar</button></div>
      <p class="nota">Peso vazio: o site procura o peso no Livro do Jogador (p. 246–251). Mochila, saco, baú e afins viram recipiente sozinhos. Na ficha, a anotação da mochila (uma lista do que tem dentro) vem junto quando você traz os itens.</p>
      <div class="inv-recip"><span>Recipiente:</span>${RECIP.map((r, k) => `<button class="bt fino" data-act="inv-recip" data-k="${k}" title="Cabe ${r.cap} kg · pesa ${kgTxt(r.kg)} kg${r.sug ? ' (peso sugerido: o livro não diz)' : ''}">${esc(r.n)} <small>${r.cap} kg</small></button>`).join('')}</div>
      <div class="linha-bts">${f ? `<button class="bt fino" data-act="inv-importar">Trazer itens, armas e dinheiro da ficha</button>` : ''}${lojaAberta() ? `<button class="bt bom" data-act="loja-entrar">${iconeHTML(lojaAberta().icone, 32)} Entrar na loja: ${esc(lojaAberta().nome)}</button>` : ''}${souMestre() || verCatalogo() ? `<button class="bt fino" data-act="inv-precos">${ic('itensop:beli_notas', 32)} Preços do livro</button>` : ''}</div>
      <details class="caixa"><summary>Regras de carga (LJ)</summary><ul class="lista">
        <li><b>Capacidade de Carga</b>: 10 × Força em kg; dobra para cada tamanho acima de Médio, metade para Miúdo. A ficha já calcula (LJ p. 12 e 256).</li>
        <li>Acima dela: só arrastar (até 20 × Força), com deslocamento 1,5 m.</li>
        <li><b>Recipientes</b> (LJ p. 245): Algibeira 3 kg · Saco 10 kg · Cesto 20 kg · Mochila Pequena 30 kg · Média 60 kg · Grande 100 kg · Baú 150 kg. O que está dentro continua pesando em você: a mochila só diz quanto cabe nela. O livro dá quanto cabe em cada um; o peso da própria algibeira, do saco e do cesto é sugestão (o livro não diz).</li>
        <li><b>Variação Sobrecarga</b>, se a mesa usar: mais de 3 × Força, −3 m; mais de 6 × Força, −6 m e desvantagem em Força, Destreza e Constituição.</li></ul></details>
      ${i.log.length ? `<h3>Gastos e ganhos</h3><ol class="inv-log">${i.log.slice(0, 25).map(l => `<li><span class="${l.v < 0 ? 'ruim' : 'bom'}">${l.v < 0 ? '−' : '+'}฿ ${fmt(Math.abs(l.v))}</span> ${esc(l.txt)} <time>${new Date(l.em).toLocaleDateString('pt-BR')}</time></li>`).join('')}</ol>` : ''}
    </section>`;
};
/* novo item: peso vazio → peso do livro; nome de recipiente → recipiente */
function itemNovo(nome, qtd, peso, extra = {}) {
  const r = recipDe(nome), lj = pesoLJ(nome), p = peso != null && peso !== '' && !isNaN(peso) ? +peso : (r ? r.kg : lj ? lj.kg : 0);
  return { id: novoId(), nome, qtd: Math.max(1, qtd || 1), peso: p, ic: r ? 'itens:mochila' : 'itens:mochila', ...(r ? { cap: r.cap } : {}), ...extra };
}
ACT['inv-add'] = () => {
  const nome = $('#inv-nome').value.trim(); if (!nome) return toast('Escreva o nome do item.');
  const pv = $('#inv-peso').value.trim(), x = itemNovo(nome, +$('#inv-qtd').value || 1, pv === '' ? null : num(pv), { nota: $('#inv-nota').value.trim() });
  if (JOG.icNovo) x.ic = JOG.icNovo;
  const i = inv(); i.itens = [...i.itens, x]; JOG.icNovo = null; gravarInv(i);
  if (pv === '' && x.peso) toast(`Peso do livro: ${kgTxt(x.peso)} kg${x.cap ? ` · recipiente de ${x.cap} kg` : ''}.`);
};
ACT['inv-recip'] = el => { const r = RECIP[+el.dataset.k]; if (!r) return; const i = inv(); i.itens = [...i.itens, { id: novoId(), nome: r.n, qtd: 1, peso: r.kg, cap: r.cap, ic: r.k === 'bau' ? 'tesouro:bau' : 'itens:mochila', ...(r.k === 'bau' ? { em: 'navio' } : {}) }]; gravarInv(i); toast(`Pronto: ${esc(r.n)} no inventário${r.k === 'bau' ? ', guardado no navio' : ''}. Para pôr coisas dentro, use “Onde” em cada item.`); };
ACT['inv-onde'] = el => { const i = inv(), x = i.itens.find(y => y.id === el.dataset.id); if (!x) return; x.em = el.value || null; if (x.em && x.em !== 'navio') { invAberto.add(x.em); lembrar('inv-aberto', JSON.stringify([...invAberto])); } gravarInv(i); };   // abre o recipiente para o item não sumir da vista
ACT['inv-peso-lj'] = el => { const i = inv(), x = i.itens.find(y => y.id === el.dataset.id), lj = x && pesoLJ(x.nome); if (!lj) return; x.peso = lj.kg; gravarInv(i); };
ACT['inv-tirar'] = el => {
  const i = inv(), x = i.itens.find(y => y.id === el.dataset.id), n = x ? dentro(i.itens, x.id).length : 0;
  confirmar(`Tirar <b>${esc(x ? x.nome : 'item')}</b> do inventário?${n ? ` Os ${n} item(ns) de dentro ficam no lugar onde ela estava.` : ''}`, () => {
    i.itens = i.itens.filter(y => y.id !== el.dataset.id).map(y => y.em === el.dataset.id ? { ...y, em: x.em || null } : y); gravarInv(i); });
};
/* trazer da ficha: as 14 linhas do inventário, as armas e o dinheiro. Não repete o que já tem (pelo nome).
   Anotação com lista (ex.: na mochila) vira o que está DENTRO do item:
   · se o item da anotação também é uma linha da ficha (Kit Médico na linha 7 e "kit médico" na anotação), a linha vai para dentro, sem duplicar;
   · se não é, nasce um item novo dentro. Peso: o da anotação; sem peso, o do livro se couber no peso que a ficha dá ao recipiente. */
function invDaFicha(f, i) {
  const ja = new Set(i.itens.map(x => sem(x.nome))), linhas = (f.itens || []).filter(a => a.nome && String(a.nome).trim());
  const deItens = [], daLinha = new Map(); let dentroN = 0;
  linhas.forEach(a => { const nm = String(a.nome).trim(); if (ja.has(sem(nm))) return; ja.add(sem(nm));
    const x = itemNovo(nm, num(a.qtd) || 1, num(a.peso) || null, { nota: a.nota || 'Da ficha' }); daLinha.set(a, x); deItens.push(x); });
  linhas.forEach(a => {
    if (!(a.dentro || []).length) return;
    const c = daLinha.get(a) || i.itens.find(x => sem(x.nome) === sem(String(a.nome).trim())); if (!c) return;
    const W = num(a.peso) || 0, novos = [];
    a.dentro.forEach(d => {
      const outros = [...deItens, ...i.itens].filter(x => x !== c && !ehRecip(x));
      const igual = outros.filter(x => sem(x.nome) === sem(d.nome)), par = igual.length ? igual : outros.filter(x => mesmoItem(x.nome, d.nome));
      if (par.length === 1 || igual.length) { const x = par[0]; if (!x.em) { x.em = c.id; dentroN++; if (!x.nota || x.nota === 'Da ficha') x.nota = `Dentro de ${c.nome} (anotação da ficha)`; } return; }
      if (par.length > 1) return;   // dois parecidos: não adivinha
      const lj = pesoLJ(d.nome), nome = lj && lj.parecido ? lj.nome : d.nome;
      if (ja.has(sem(nome))) return; ja.add(sem(nome));
      novos.push({ nome, qtd: num(d.qtd) || 1, peso: d.peso != null ? num(d.peso) : null, lj });
    });
    /* o peso da linha na ficha já soma o que tem dentro: o recipiente fica com o que sobra (o total bate com a ficha) */
    const sabido = novos.reduce((t, d) => t + (d.peso != null ? d.peso * d.qtd : 0), 0), doLivro = novos.reduce((t, d) => t + (d.peso == null && d.lj ? d.lj.kg * d.qtd : 0), 0);
    const usaLivro = doLivro > 0 && (!W || sabido + doLivro <= W + 0.01), S = sabido + (usaLivro ? doLivro : 0);
    if (daLinha.get(a) && W) c.peso = W >= S ? Math.round((W - S) * 100) / 100 : W;
    if (c.cap == null) c.cap = Math.max(W, S);
    c.nota = `Da ficha · anotação com ${a.dentro.length} ${a.dentro.length === 1 ? 'item' : 'itens'}`;
    novos.forEach(d => { const temPeso = d.peso != null || (usaLivro && d.lj); dentroN++;
      deItens.push(itemNovo(d.nome, d.qtd, d.peso != null ? d.peso : usaLivro && d.lj ? d.lj.kg : 0, { em: c.id, nota: d.peso != null ? `Dentro de ${c.nome} (anotação da ficha)` : temPeso ? `Dentro de ${c.nome} · peso do livro (LJ p. ${d.lj.pag})` : 'Sem peso na anotação da ficha' })); });
  });
  const jaItem = a => [...deItens, ...i.itens].some(x => { const tx = chaveItem(x.nome), ta = chaveItem(a.nome); return tx.length && ta.length && quaseIgual(tx[0], ta[0]) && mesmoItem(x.nome, a.nome); });   // "Katana" (arma) e "Katanas Shio e Kuro" (item): é a mesma coisa
  const deArmas = (f.armas || []).filter(a => a.nome && !ja.has(sem(a.nome)) && !jaItem(a)).map(a => { ja.add(sem(a.nome)); const lj = (catalogo().find(c => sem(c.nome) === sem(a.nome)) || {}).kg;
    return { id: novoId(), nome: a.nome, qtd: 1, peso: lj || 0, nota: [a.dano, a.tipo].filter(Boolean).join(' · '), ic: /espada|katana|l[aâ]mina/i.test(a.nome + a.tipo) ? 'tesouro:espada' : 'itensop:meito' }; });
  /* o que está na ficha e não é recipiente vai para dentro da primeira mochila que veio da ficha, se couber */
  const novos = [...deItens, ...deArmas], mochila = [...i.itens, ...novos].find(ehRecip);
  const temNota = dentroN > 0;   // a ficha já disse o que vai em cada recipiente: não mexe no resto
  if (mochila && !temNota) { let livre = capDe(mochila) - pesoDentro([...i.itens, ...novos], mochila.id); deItens.forEach(x => { if (x === mochila || ehRecip(x) || x.em) return; if (pesoDe(x) <= livre) { x.em = mochila.id; livre -= pesoDe(x); } }); }
  return { novos, deItens, deArmas, mochila, dentroN, temNota };
}
ACT['inv-importar'] = () => {
  const f = minhaFicha(), i = inv(); if (!f) return;
  const r = invDaFicha(f, i);
  i.itens = [...i.itens, ...r.novos]; if (i.beli == null && f.dinheiro != null) i.beli = num(f.dinheiro);
  i.itens.filter(x => ehRecip(x) && dentro(i.itens, x.id).length && r.novos.some(y => y.em === x.id)).forEach(x => invAberto.add(x.id)); lembrar('inv-aberto', JSON.stringify([...invAberto]));
  gravarInv(i);
  const semNota = !!(eu().link) && !r.dentroN && (f.itens || []).some(a => recipDe(a.nome)) && !(f.itens || []).some(a => (a.dentro || []).length || a.nota);
  if (!r.novos.length && !r.dentroN) return toast('Nada novo na ficha: tudo já está no inventário.');
  toast(`${r.deItens.length} item(ns) e ${r.deArmas.length} arma(s) da ficha${i.beli != null ? ', e a carteira' : ''}.${r.dentroN ? ` ${r.dentroN} dentro de recipiente, pela anotação.` : r.mochila && r.deItens.length ? ` Itens guardados em: ${esc(r.mochila.nome)}.` : ''}${semNota ? ' Se a mochila tem anotação na ficha e ela não veio pelo link, use <b>Colar lista</b> na mochila.' : ''}`, { tipo: 'bom', tempo: semNota ? 9000 : 5000 });
};
/* colar lista: o jogador cola o texto da anotação (ou escreve uma lista) e os itens entram no recipiente */
ACT['inv-colar'] = el => {
  const i = inv(), c = i.itens.find(y => y.id === el.dataset.id); if (!c) return;
  Modal.abrir(`<h2>Colar lista em: ${esc(c.nome)}</h2>
    <p class="nota">Um item por linha, ou separados por vírgula. Quantidade e peso são opcionais. Exemplos: <b>2 tochas</b> · <b>corda 3kg</b> · <b>ração x5 0,5kg</b>.</p>
    <textarea id="inv-colar-t" rows="8" style="width:100%" placeholder="kit médico 2kg&#10;3 kits de primeiros socorros&#10;corda 3kg" autofocus></textarea>
    <div id="inv-colar-v" class="nota"></div>
    <div class="linha-bts"><button class="bt bom" id="inv-colar-ok">Pôr dentro</button><button class="bt" data-act="modal-fechar">Cancelar</button></div>`,
  { titulo: 'Colar lista', onBind: m => {
    const t = m.querySelector('#inv-colar-t'), v = m.querySelector('#inv-colar-v');
    const ler = () => { const d = conteudoNota('Dentro: ' + t.value.replace(/\n+/g, '; ')); return d; };
    t.addEventListener('input', () => { const d = ler(); v.innerHTML = d.length ? 'Vou pôr: ' + d.map(x => `<b>${x.qtd}× ${esc(x.nome)}</b>${x.peso != null ? ` (${kgTxt(x.peso)} kg)` : ''}`).join(' · ') : ''; });
    m.querySelector('#inv-colar-ok').addEventListener('click', () => {
      const d = ler(); if (!d.length) return toast('Escreva pelo menos um item.');
      const i2 = inv(); d.forEach(x => { const lj = x.peso == null ? pesoLJ(x.nome) : null; i2.itens.push(itemNovo(lj && lj.parecido ? lj.nome : x.nome, x.qtd, x.peso, { em: c.id })); });
      invAberto.add(c.id); lembrar('inv-aberto', JSON.stringify([...invAberto])); Modal.fechar(); gravarInv(i2); toast(`${d.length} item(ns) dentro de ${esc(c.nome)}.`, { tipo: 'bom' });
    });
  } });
};

/* ficha completa (mestre): o inventário da ficha (14 linhas) e o do site, se for jogador online */
function invMestreHTML(p) {
  const s = p.sheet, C = cargaDe(s), it = s.itens || [], tot = it.reduce((a, x) => a + (num(x.peso) || 0) * (num(x.qtd) || 0), 0);
  const j = p.uid && (M.jogadores || []).find(x => x.uid === p.uid), siteInv = j && j.inv && (j.inv.itens || []).length ? j.inv : null;
  return `<h3>Inventário da ficha <small class="nota">${it.length} de 14 linhas</small></h3>${it.length ? `<table class="tab"><tr><th>Item</th><th>Qtd</th><th>kg cada</th><th>kg</th></tr>
    ${it.map(x => `<tr><td>${esc(x.nome)}${recipDe(x.nome) ? ` <small>(cabe ${recipDe(x.nome).cap} kg)</small>` : ''}${x.nota ? `<br><small class="nota">${esc(x.nota)}</small>` : ''}</td><td>${fmt(x.qtd)}</td><td>${x.peso ? kgTxt(x.peso) : '—'}</td><td>${kgTxt((num(x.peso) || 0) * (num(x.qtd) || 0))}</td></tr>`
      + (x.dentro || []).map(d => `<tr class="inv-sub"><td>↳ ${esc(d.nome)} <small class="nota">dentro (anotação)</small></td><td>${fmt(d.qtd)}</td><td>${d.peso != null ? kgTxt(d.peso) : '—'}</td><td><small class="nota">${d.peso != null ? kgTxt(d.peso * d.qtd) + ' (já no peso de cima)' : 'sem peso'}</small></td></tr>`).join('')).join('')}</table>` : '<p class="nota">Nada no inventário da ficha.</p>'}
    <p class="nota">Carga da ficha: ${s.carga ?? kgTxt(tot)} / ${C.max != null ? kgTxt(C.max) : '—'} kg${C.max && tot > C.max ? ' · <b class="ruim">acima da capacidade</b>' : ''}.</p>
    ${siteInv ? `<h3>Inventário no site (do jogador)</h3><p class="nota">${siteInv.itens.length} itens · carga ${kgTxt(pesoCarregado(siteInv))} kg${pesoNavio(siteInv) ? ` · ${kgTxt(pesoNavio(siteInv))} kg no navio` : ''} · ฿ ${fmt(siteInv.beli ?? 0)}</p>
      <ul class="lista">${siteInv.itens.map(x => `<li>${esc(x.nome)} ×${fmt(x.qtd)}${x.peso ? ` · ${kgTxt(pesoDe(x))} kg` : ''}${x.em === 'navio' ? ' · no navio' : x.em ? ' · em ' + esc((siteInv.itens.find(y => y.id === x.em) || {}).nome || '?') : ''}</li>`).join('')}</ul>` : ''}`;
}
