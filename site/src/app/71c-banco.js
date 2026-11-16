/* ═══════════ BANCO DO BANDO ═══════════
   Os jogadores depositam parte dos Berries da Carteira (Inventário) no cofre do bando. Do cofre saem as compras do navio e os gastos da tripulação.
   Sem mexer nas regras do Firebase:
   · o depósito e os pedidos de cada jogador ficam no documento dele (jogadores/{uid}.banco = { dep: [...], ped: [...] });
   · as saídas e entradas do mestre ficam em mesa/banco (só o mestre escreve): { base, mov: [{ id, v, txt, em, quem }], meta: { n, v } }.
   Saldo = base + movimentos do mestre + todos os depósitos. O jogador pede; o mestre aprova. */
const banco = () => Object.assign({ base: 0, mov: [], meta: null }, M.banco || {});
const bancoDeps = () => (M.jogadoresTodos || []).flatMap(j => (((j.banco || {}).dep) || []).map(d => ({ ...d, uid: j.uid, quem: nomeJ(j) })));
const bancoPeds = () => (M.jogadoresTodos || []).flatMap(j => (((j.banco || {}).ped) || []).map(p => ({ ...p, uid: j.uid, quem: nomeJ(j) }))).sort((a, b) => (a.em || 0) - (b.em || 0));
function bancoSaldo() { const b = banco(); return nvN(b.base) + (b.mov || []).reduce((a, x) => a + nvN(x.v), 0) + bancoDeps().reduce((a, d) => a + nvN(d.v), 0); }
/* movimento do mestre (entrada +, saída −). Guarda os 120 últimos; os mais velhos entram na base */
async function bancoMov(v, txt, quem) {
  if (!souMestre() || !v) return; const b = banco(); const mov = [{ id: novoId(), v: Math.round(v), txt: String(txt || '').slice(0, 90), em: Date.now(), quem: quem || 'Mestre' }, ...(b.mov || [])]; let base = nvN(b.base);
  while (mov.length > 120) base += nvN(mov.pop().v);
  M.banco = Object.assign({}, M.banco, { mov, base });   // já vale aqui, para duas compras seguidas não usarem o saldo velho
  try { await DB.gravar('mesa/banco', { mov, base, em: Date.now() }); } catch (e) { toast('Não deu para salvar no banco: ' + esc(e.code || e.message), { tipo: 'ruim' }); }
}
const bancoData = t => new Date(t).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' ' + hora(t);
const minhaCarteira = () => { const i = inv(), f = fichaDe(eu()); return i.beli ?? (f ? num(f.dinheiro) : 0) ?? 0; };
const temCarteira = () => !!eu().uid && (!souMestre() || !!Espiar.uid);

/* pedidos em aberto (aparece no Banco e no Navio) */
function bancoPedidosHTML(onde) {
  const P = bancoPeds(), m = souMestre(); if (!P.length) return '';
  return `<section class="painel-cat bc-peds"><h2>${ic('status:notas', 32)} Pedidos do bando <small>${P.length} esperando o mestre</small></h2><ul class="nv-l">${P.map(p => `<li><b>${esc(p.nome)}</b>
    <small>${p.tipo === 'navio' ? (p.m === 'c' ? 'construir' : 'comprar') : 'gasto do bando'} · ${nvB(p.v)} · pedido de ${esc(p.quem)}</small>
    <span class="nv-bts">${m ? `<button class="bt bom fino" data-act="bc-aprovar" data-uid="${esc(p.uid)}" data-id="${esc(p.id)}">Aprovar</button><button class="bt fino" data-act="bc-recusar" data-uid="${esc(p.uid)}" data-id="${esc(p.id)}">Recusar</button>`
      : p.uid === alvoUid() ? `<button class="bt fino" data-act="bc-cancelar" data-id="${esc(p.id)}">Cancelar</button>` : ''}</span></li>`).join('')}</ul>
    ${m && onde === 'navio' ? '' : m ? '<p class="nota">Aprovar tira o valor do banco. Se for peça do navio, ela já entra no navio (ou na fila de obras).</p>' : ''}</section>`;
}
const bancoTiraPed = (uid, id) => { const j = (M.jogadoresTodos || []).find(x => x.uid === uid); if (!j) return Promise.resolve(); return DB.gravar('jogadores/' + uid, { banco: { ped: (((j.banco || {}).ped) || []).filter(p => p.id !== id) } }); };
ACT['bc-aprovar'] = async el => { if (!souMestre()) return; const p = bancoPeds().find(x => x.uid === el.dataset.uid && x.id === el.dataset.id); if (!p) return;
  if (p.tipo === 'navio') { const o = nvOfertas(navio()).find(x => x.k === p.k); if (!o) return toast('Essa peça não existe mais no estaleiro. Recuse o pedido.', { tipo: 'ruim' });
    if (o.blq) return toast(`Não dá para aprovar agora: ${esc(o.blq)}`, { tipo: 'ruim', tempo: 6000 });
    if (!(await nvFechar(o, p.m === 'c' ? 'c' : 'p', p.quem))) return;
  } else { if (bancoSaldo() < p.v) return toast(`O banco tem ${nvB(bancoSaldo())}. Faltam ${nvB(p.v - bancoSaldo())}.`, { tipo: 'ruim' }); await bancoMov(-p.v, p.nome, p.quem); toast(`Gasto aprovado: ${esc(p.nome)}.`, { tipo: 'bom' }); Som.tocar('moeda'); }
  bancoTiraPed(p.uid, p.id); };
ACT['bc-recusar'] = el => { if (!souMestre()) return; bancoTiraPed(el.dataset.uid, el.dataset.id).then(() => toast('Pedido recusado.')); };
ACT['bc-cancelar'] = el => gravarEu({ banco: { ped: (((eu().banco || {}).ped) || []).filter(p => p.id !== el.dataset.id) } }).then(() => toast('Pedido cancelado.'));
/* jogador: depositar da carteira */
ACT['bc-pct'] = el => { const c = $('#bc-valor'); if (c) c.value = Math.floor(minhaCarteira() * (+el.dataset.p) / 100); };
ACT['bc-depositar'] = () => { if (!temCarteira()) return; const v = Math.round(nvN(($('#bc-valor') || {}).value)), atual = minhaCarteira();
  if (v <= 0) return toast('Escreva quanto quer depositar.');
  if (v > atual) return toast(`Sua carteira tem ${nvB(atual)}. Não dá para depositar ${nvB(v)}.`, { tipo: 'ruim' });
  confirmar(`Depositar <b>${nvB(v)}</b> no banco do bando?<br>Sai da sua carteira e passa a ser do bando.`, () => { const i = inv(); i.beli = atual - v; i.log = [{ em: Date.now(), v: -v, txt: 'Depósito no banco do bando' }, ...(i.log || [])].slice(0, 80);
    let dep = [...(((eu().banco || {}).dep) || []), { id: novoId(), v, em: Date.now() }];
    if (dep.length > 60) { const velhos = dep.slice(0, dep.length - 40); dep = [{ id: 'antigos', v: velhos.reduce((a, d) => a + nvN(d.v), 0), em: velhos[velhos.length - 1].em, txt: 'depósitos antigos' }, ...dep.slice(dep.length - 40)]; }
    gravarEu({ inv: limpo(i), banco: { dep } }).then(() => { toast(`${nvB(v)} no banco do bando.`, { tipo: 'bom' }); Som.tocar('moeda'); }); }, { ok: 'Depositar' }); };
/* jogador: pedir um gasto do bando (contratar gente, comida, conserto…) */
ACT['bc-pedir'] = () => { if (!temCarteira()) return; const v = Math.round(nvN(($('#bc-p-valor') || {}).value)), txt = (($('#bc-p-motivo') || {}).value || '').trim(), meus = (((eu().banco || {}).ped) || []);
  if (v <= 0 || !txt) return toast('Escreva o valor e para que é.');
  if (meus.length >= 8) return toast('Você já tem 8 pedidos esperando o mestre.', { tipo: 'ruim' });
  gravarEu({ banco: { ped: [...meus, { id: novoId(), tipo: 'gasto', nome: txt.slice(0, 80), v, em: Date.now() }] } }).then(() => toast('Pedido enviado. O mestre aprova ou recusa.', { tipo: 'bom' })); };
/* mestre: entrada e saída à mão, meta */
ACT['bc-mov'] = el => { if (!souMestre()) return; const v = Math.round(nvN(($('#bc-m-valor') || {}).value)), txt = (($('#bc-m-motivo') || {}).value || '').trim(), s = +el.dataset.s;
  if (v <= 0) return toast('Escreva o valor.'); if (s < 0 && bancoSaldo() < v) return toast(`O banco só tem ${nvB(bancoSaldo())}.`, { tipo: 'ruim' });
  bancoMov(s * v, txt || (s > 0 ? 'Entrada' : 'Saída')).then(() => { toast(`${s > 0 ? 'Entrou' : 'Saiu'} ${nvB(v)}.`, { tipo: s > 0 ? 'bom' : '' }); Som.tocar('moeda'); }); };
ACT['bc-meta'] = el => { if (!souMestre()) return; const m = Object.assign({ n: '', v: 0 }, banco().meta || {}); m[el.dataset.k] = el.dataset.k === 'v' ? Math.max(0, Math.round(nvN(el.value))) : el.value.trim().slice(0, 60); DB.gravar('mesa/banco', { meta: m }); };

VIEWS.banco = {
  titulo: 'Banco do bando', icone: 'itensop:beli_moedas', chaves: ['banco', 'jogadores', 'navio', 'estado'], cena: 'cat_tesouro',
  ao(ch) { const a = document.activeElement; if (a && /INPUT|TEXTAREA|SELECT/.test(a.tagName) && $('#vista').contains(a)) return false; },
  render() {
    const b = banco(), m = souMestre(), saldo = bancoSaldo(), deps = bancoDeps(), meta = b.meta && b.meta.v > 0 ? b.meta : null, n = navio(), desp = nvDespesa(n), atras = nvDespAtrasada(n);
    const porJog = {}; deps.forEach(d => { porJog[d.uid] = porJog[d.uid] || { quem: d.quem, v: 0 }; porJog[d.uid].v += nvN(d.v); });
    const hist = [...deps.map(d => ({ em: d.em, v: d.v, txt: d.txt ? `${d.quem}: ${d.txt}` : `Depósito de ${d.quem}` })), ...(b.mov || []).map(x => ({ em: x.em, v: x.v, txt: x.txt + (x.quem && x.quem !== 'Mestre' ? ` (pedido de ${x.quem})` : '') }))].sort((x, y) => (y.em || 0) - (x.em || 0)).slice(0, 40);
    const cart = temCarteira() ? minhaCarteira() : 0;
    return `<div class="banco-v"><h1>${ic('itensop:beli_moedas', 64)}Banco do bando</h1>
      <section class="painel-cat bc-cofre">${ic('tesouro:bau', 128) || ic('itensop:beli_moedas', 128)}<div class="cresce"><p class="rot">No cofre</p><p class="bc-saldo">฿ ${fmt(saldo)}</p>
        ${meta ? `<div class="bc-meta"><p><b>Meta:</b> ${esc(meta.n || 'próximo upgrade')} · ${nvB(meta.v)} ${saldo >= meta.v ? '<b class="bom">dá para comprar!</b>' : `· faltam <b>${nvB(meta.v - saldo)}</b>`}</p>${barrinha(Math.min(saldo, meta.v), meta.v, saldo >= meta.v ? 'bom' : '')}</div>` : ''}
        <p class="nota">Do cofre saem os upgrades do navio (aba Navio › Estaleiro) e os gastos da tripulação. ${m ? '' : 'Você deposita e pede; o mestre aprova a saída.'}</p></div></section>
      ${temCarteira() ? `<div class="nv-grade"><section class="painel-cat"><h2>${ic('itensop:beli_notas', 32)} Depositar</h2><p>Sua carteira: <b>${nvB(cart)}</b></p>
          <div class="linha-bts"><input id="bc-valor" type="number" min="0" step="1000" placeholder="Valor ฿" style="width:9em" data-enter="bc-depositar">${[10, 25, 50].map(p => `<button class="bt fino" data-act="bc-pct" data-p="${p}">${p}%</button>`).join('')}<button class="bt ouro" data-act="bc-depositar">Depositar</button></div>
          <p class="nota">Sai da Carteira do seu Inventário e fica anotado nos seus gastos.</p></section>
        <section class="painel-cat"><h2>${ic('status:notas', 32)} Pedir um gasto</h2>
          <div class="linha-bts"><input id="bc-p-valor" type="number" min="0" step="1000" placeholder="Valor ฿" style="width:9em"><input id="bc-p-motivo" class="cresce" placeholder="Para quê? (contratar um cozinheiro, comida, pólvora…)" maxlength="80"><button class="bt" data-act="bc-pedir">Pedir</button></div>
          <p class="nota">Peça do navio se pede na aba Navio, no Estaleiro.</p></section></div>` : ''}
      ${bancoPedidosHTML('banco')}
      ${m ? `<section class="painel-cat"><h2>${ic('modos:capitao', 32)} Mestre: entrada e saída</h2>
        <div class="linha-bts"><input id="bc-m-valor" type="number" min="0" step="1000" placeholder="Valor ฿" style="width:9em"><input id="bc-m-motivo" class="cresce" placeholder="Motivo (saque do navio mercante, contratação, suborno…)" maxlength="80">
          <button class="bt bom fino" data-act="bc-mov" data-s="1">Entrou</button><button class="bt ruim fino" data-act="bc-mov" data-s="-1">Saiu</button></div>
        <div class="linha-bts"><label class="campo-inline">Meta do bando <input value="${esc((b.meta || {}).n || '')}" data-chg="bc-meta" data-k="n" placeholder="Ex.: casco de Carvalho" maxlength="60"></label>
          <label class="campo-inline">฿ <input type="number" min="0" value="${nvN((b.meta || {}).v) || ''}" data-chg="bc-meta" data-k="v" style="width:10em" placeholder="0"></label></div>
        <p class="nota">Os jogadores só veem esta aba depois que você liberar “Banco do bando” (Painel do mestre › Comando). A meta aparece como barra para todos; valor 0 tira a meta.</p></section>` : ''}
      ${desp ? `<p class="est-efe ${atras ? '' : 'calmo'}"><b>Despesas dos cômodos:</b> ${nvB(desp)} por semana. ${atras ? `Atrasado desde o dia ${n.desp.ate}.` : n.desp && n.desp.ate ? `Pago até o dia ${n.desp.ate}.` : ''} <button class="link" data-rota="navio">Ver no Navio</button></p>` : ''}
      <div class="nv-grade"><section class="painel-cat"><h2>${ic('mesa:tripulacao', 32)} Quem já depositou</h2>
          ${Object.keys(porJog).length ? `<ul class="nv-l">${Object.values(porJog).sort((x, y) => y.v - x.v).map(x => `<li><b>${esc(x.quem)}</b><span class="nv-bts">${nvB(x.v)}</span></li>`).join('')}</ul>` : '<p class="nota">Ninguém depositou ainda.</p>'}</section>
        <section class="painel-cat"><h2>${ic('modos:anotar', 32)} Entradas e saídas</h2>
          ${hist.length ? `<ol class="inv-log bc-hist">${hist.map(l => `<li><span class="${l.v < 0 ? 'ruim' : 'bom'}">${l.v < 0 ? '−' : '+'}฿ ${fmt(Math.abs(l.v))}</span> ${esc(l.txt)} <small>${bancoData(l.em)}</small></li>`).join('')}</ol>` : '<p class="nota">O cofre está vazio e sem história.</p>'}</section></div>
    </div>`;
  }
};
/* a aba entra no menu: trancada para os jogadores até o mestre liberar; para o mestre fica junto de Tripulação e Navio */
TRANCAVEIS.banco = 'Banco do bando';
OCULTAS.push('banco');
(() => { const jog = NAV.jogador[0][1]; if (!jog.includes('banco')) jog.splice(jog.indexOf('navio') + 1, 0, 'banco'); })();
(() => { const abrir = Mesa.abrir; Mesa.abrir = function () { const r = abrir.apply(this, arguments); this.ouvir('mesa/banco', 'banco'); return r; }; })();
/* o mestre é avisado quando chega pedido novo */
const BancoVisto = { ids: null };
Mesa.on(ch => { if (ch !== 'jogadores' || !Mesa.aberta || !souMestre()) return; const P = bancoPeds();
  if (BancoVisto.ids) P.filter(p => !BancoVisto.ids.has(p.id)).forEach(p => toast(`${ic('itensop:beli_moedas', 32)} <b>${esc(p.quem)}</b> pediu: ${esc(p.nome)} (${nvB(p.v)}). Veja em Banco do bando.`, { tempo: 7000 }));
  BancoVisto.ids = new Set(P.map(p => p.id)); });
if (window.__expor) Object.assign(window, { bancoSaldo, bancoMov, banco });
