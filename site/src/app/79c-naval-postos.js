/* ═══════════ BATALHA NAVAL: a tripulação a postos ═══════════
   Os jogadores deixam de só olhar. Cada um escolhe um posto no navio do bando e ganha os botões daquele posto.
   Regras usadas (Livro do Jogador):
   · Proteger o Navio: personagem de 8º nível ou mais pula o turno e dá +1 na CR, até +3 (LJ p. 314).
   · Homem das Armas: +3 nas jogadas de ataque com os canhões (LJ p. 299).
   · Ataque do navio: Presença do capitão ou a maior Destreza entre os atiradores (LJ p. 315).
   · Manobra: capitão, Navegador ou Timoneiro pede (LJ p. 314).
   · Reparo Emergencial do Carpinteiro: Sabedoria CD 15, 30d10 + 50 PV paralelos; com Ajudantes de Emergência suficientes o resultado é o máximo (LJ p. 140 e 314).
   Sem mexer nas regras do Firebase: o posto, o pedido de manobra e a rolagem do tiro ficam no documento do próprio jogador.
   O mestre continua mandando: nada acontece no navio sem o clique dele. */
const BN_POSTOS = [
  ['leme', 'Leme', 'navios:timao', 'Você conduz o navio. Capitão, Navegador ou Timoneiro pede a manobra do turno; o mestre executa.'],
  ['canhao', 'Canhões', 'navios:canhao', 'Artilheiro. Quando o mestre mandar fogo, é você quem rola os tiros. A melhor Destreza dos artilheiros entra no ataque.'],
  ['armas', 'Homem das Armas', 'navios:barril', 'Atirador principal: +3 em todos os tiros de canhão do navio. Também rola os tiros.'],
  ['reparo', 'Reparos', 'navios:reparo', 'O Carpinteiro faz o Reparo Emergencial (Sabedoria CD 15). Quem mais estiver aqui é Ajudante de Emergência.'],
  ['proteger', 'Proteger o navio', 'status:defesa', 'Nível 8 ou mais: você pula o seu turno e o navio ganha +1 na CR (até +3, somando todos).'],
  ['vigia', 'Vigia', 'mar:luneta', 'No alto do mastro, de olho no mar. O mestre conta primeiro para você o que aparece.'],
  ['conves', 'Convés', 'mesa:tripulacao', 'Livre para lutar e agir no seu turno, na aba Combate.']
];
const BN_MANOBRAS = { bb: 'virar 45° a bombordo', eb: 'virar 45° a estibordo', mais: 'mais vela (+6 nós)', menos: 'menos vela (−6 nós)', ancora: 'mexer na âncora' };
const bnBando = b => ((b && b.navios) || []).find(n => n.bando) || null;
const bnNoPosto = k => (M.jogadores || []).filter(j => j.posto === k && j.estilo);
const bnNivel = j => num((fichaDe(j) || {}).nivel) || 0;
const bnPrimeiro = j => String(nomeJ(j)).split(' ')[0];
/* +CR de quem protege: no navio do bando conta quem está no posto (8º nível ou mais), até +3 */
function bnProt(n) { const m = n.protege || 0; return n && n.bando ? Math.min(3, Math.max(m, bnNoPosto('proteger').filter(j => bnNivel(j) >= 8).length)) : m; }
function bnHda(A) { return A && A.bando && bnNoPosto('armas').length ? 3 : 0; }
const bnPedido = () => { const p = (M.naval || {}).pedido; return p && p.id && Date.now() - (p.em || 0) < 180000 ? p : null; };
const bnJogRola = () => lembrar('bn-jog-rola') !== '0';

/* ───── jogador: escolher posto e agir ───── */
ACT['bn-posto'] = el => { const k = el.dataset.k, j = eu(); if (!j.uid) return;
  if (k === 'armas' && j.posto !== 'armas' && bnNoPosto('armas').some(x => x.uid !== j.uid)) return toast('Já tem um Homem das Armas. O navio só tem um.', { tipo: 'ruim' });
  gravarEu({ posto: j.posto === k ? APAGAR : k }); };
ACT['bn-j-manobra'] = el => { const k = el.dataset.k; if (!BN_MANOBRAS[k] || eu().posto !== 'leme') return; gravarEu({ manobra: { id: novoId(), k, em: Date.now() } }).then(() => toast(`Pedido ao mestre: ${BN_MANOBRAS[k]}.`, { tipo: 'bom' })); };
ACT['bn-fogo'] = () => { const p = bnPedido(), j = eu(); if (!p || !['canhao', 'armas'].includes(j.posto) || (j.tiro || {}).id === p.id) return;
  const nats = []; for (let i = 0; i < clamp(p.n || 1, 1, 3); i++) { const a = rnd(20), c = rnd(20); nats.push(p.modo === 'vant' ? { nat: Math.max(a, c), txt: `${a} e ${c}, vale o maior` } : p.modo === 'desv' ? { nat: Math.min(a, c), txt: `${a} e ${c}, vale o menor` } : { nat: a, txt: String(a) }); }
  gravarEu({ tiro: { id: p.id, nats, em: Date.now() } }).then(() => { Som.tocar('dado'); toast(`${ic('navios:canhao', 32)} Você rolou: <b>${nats.map(x => x.nat).join(' · ')}</b>. O mestre mostra o resultado.`, { tipo: 'bom', tempo: 5000 }); }); };
ACT['bn-j-reparo'] = () => { const f = fichaDe(eu()), b = f ? attrMod(f, 'SAB') + (num(f.prof) || 0) : 0; rolarPublico(`d20${sg(b)}`, 'Reparo Emergencial (CD 15)', { forcarD20: true }); toast('Rolagem do Reparo Emergencial enviada para a Mesa. Passou de 15, o mestre aplica.', { tempo: 5000 }); };
function bnPostoHTML(b) {
  const j = eu(), nav = bnBando(b); if (!j.uid) return '';
  if (!nav) return `<section class="pap bn-posto"><h2>${ic('mesa:tripulacao', 32)} Seu posto</h2><p class="nota">O navio do bando ainda não está no mapa.</p></section>`;
  const P = BN_POSTOS.find(x => x[0] === j.posto), ped = bnPedido(), jaRolei = ped && (j.tiro || {}).id === ped.id, niv = bnNivel(j);
  let acao = '';
  if (j.posto === 'leme') acao = `<div class="linha-bts">${Object.entries(BN_MANOBRAS).map(([k, t]) => `<button class="bt fino" data-act="bn-j-manobra" data-k="${k}">${k === 'bb' ? '↶ ' : ''}${t.replace(/^./, c => c.toUpperCase())}${k === 'eb' ? ' ↷' : ''}</button>`).join('')}</div>
    ${j.manobra && Date.now() - j.manobra.em < 600000 ? `<p class="nota">Pedido esperando o mestre: <b>${BN_MANOBRAS[j.manobra.k]}</b>.</p>` : ''}`;
  else if (j.posto === 'canhao' || j.posto === 'armas') acao = ped && !jaRolei ? `<button class="bt ruim bn-fogo-bt" data-act="bn-fogo">${ic('navios:canhao', 32)} FOGO! Rolar ${esc(ped.txt || 'o tiro')}</button>`
    : `<p class="nota">${jaRolei ? 'Você já rolou este tiro. Olhe o registro.' : 'Quando o mestre mandar fogo, aparece aqui o botão para você rolar.'}</p>`;
  else if (j.posto === 'reparo') acao = `<div class="linha-bts"><button class="bt fino" data-act="bn-j-reparo">Rolar o Reparo Emergencial (Sabedoria, CD 15)</button></div><p class="nota">Só o Carpinteiro rola. Leva 1 minuto e gasta 1d4 kits de construção.</p>`;
  else if (j.posto === 'proteger') acao = niv >= 8 ? '<p class="nota">Valendo: você pula o seu turno no Combate e o navio fica mais difícil de acertar.</p>' : `<p class="nota"><b class="ruim">Ainda não vale:</b> o livro pede 8º nível${niv ? ` (você está no ${niv}º)` : ''}.</p>`;
  return `<section class="pap bn-posto"><h2>${ic('mesa:tripulacao', 32)} Seu posto no ${esc(nav.nome)}</h2>
    <div class="bn-postos">${BN_POSTOS.map(([k, t, i]) => `<button class="${j.posto === k ? 'on' : ''}" data-act="bn-posto" data-k="${k}">${ic(i, 32)}<span>${t}</span></button>`).join('')}</div>
    ${P ? `<p class="bn-posto-d">${esc(P[3])}</p>${acao}` : '<p class="nota">Escolha onde você está no navio. Dá para trocar a qualquer hora.</p>'}
    ${bnPostosLista()}</section>`;
}
function bnPostosLista() {
  const L = BN_POSTOS.map(([k, t]) => [t, bnNoPosto(k)]).filter(([, js]) => js.length);
  return L.length ? `<ul class="bn-quem">${L.map(([t, js]) => `<li><b>${t}:</b> ${js.map(x => `<span class="${online(x.visto) || x.uid === Eu.uid ? '' : 'fora'}">${fotoJ(x, 24)} ${esc(bnPrimeiro(x))}</span>`).join(' ')}</li>`).join('')}</ul>` : '';
}

/* ───── mestre: quem está onde, pedidos e atalhos ───── */
function bnTripHTML(b) {
  const nav = bnBando(b); if (!nav) return '';
  const man = (M.jogadores || []).filter(j => j.manobra && j.posto === 'leme' && Date.now() - j.manobra.em < 600000), lista = bnPostosLista(), prot = bnProt(nav), hda = bnHda(nav);
  return `<section class="pap bn-trip"><h2>${ic('mesa:tripulacao', 32)} Tripulação a postos</h2>
    ${lista || `<p class="nota">Ninguém escolheu posto ainda. ${b.publico ? 'Os jogadores escolhem na aba Batalha naval deles.' : 'Ligue “Mostrar esta aba para os jogadores”: aí eles escolhem o posto e agem.'}</p>`}
    ${prot || hda ? `<p class="bn-trip-b">${prot ? `Protegendo: <b>+${prot} na CR</b>. ` : ''}${hda ? 'Homem das Armas: <b>+3 nos tiros</b>.' : ''}</p>` : ''}
    ${BN.pend ? `<p class="bn-trip-p">${ic('navios:canhao', 32)} <b>Fogo!</b> Esperando os artilheiros rolarem. <button class="bt fino" data-act="bn-pend-site">Rolar pelo site</button></p>` : ''}
    ${man.map(j => `<p class="bn-trip-p">${fotoJ(j, 24)} <b>${esc(bnPrimeiro(j))}</b> (leme) pede: <b>${BN_MANOBRAS[j.manobra.k] || ''}</b> <button class="bt bom fino" data-act="bn-ped-fazer" data-uid="${esc(j.uid)}">Fazer</button><button class="bt-ic mini" data-act="bn-ped-nao" data-uid="${esc(j.uid)}" title="Recusar">✕</button></p>`).join('')}
    <div class="linha-bts"><button class="bt fino" data-act="bn-puxar" title="Presença e Vontade do capitão, melhor Destreza dos artilheiros">Puxar números das fichas</button><button class="bt fino" data-act="bn-reparo" title="Carpinteiro passou em Sabedoria CD 15">Reparo Emergencial deu certo</button></div>
    <label class="ck"><input type="checkbox" data-chg="bn-jog-rola" ${bnJogRola() ? 'checked' : ''}> Os artilheiros a postos rolam os tiros do navio do bando</label></section>`;
}
ACT['bn-jog-rola'] = el => { lembrar('bn-jog-rola', el.checked ? '1' : '0'); };
/* o mestre clicou Atirar com o navio do bando: se tem artilheiro a postos e online, o pedido vai para eles */
function bnPedirTiro(o) {
  if (!bnJogRola() || BN.pend) return false; const b = bn(), A = bnNav(b, o.de); if (!A || !A.bando || !b.publico) return false;
  const art = [...bnNoPosto('canhao'), ...bnNoPosto('armas')].filter(j => online(j.visto)); if (!art.length) return false;
  const T = bnNav(b, o.alvo), W = BN_ARMAS[o.arma]; if (!T || !W || o.mun === 'estilhacos') return false;
  const m = bnMira(b, A, T, o.arma), tem = (A.armas.find(a => a.n === o.arma) || {}).q || 0;
  if (!m.ok || !tem || A.pv <= 0 || (b.vez >= 0 && (A.feito || {}).cmb)) return false;   // o caminho normal dá o aviso certo
  const n = Math.min(o.qtd, tem, 3), longe = m.d > W.alc[0], modo = longe ? (o.modo === 'vant' ? '' : 'desv') : o.modo, id = novoId();
  BN.pend = { id, o }; DB.gravar('mesa/naval', { pedido: { id, n, modo, em: Date.now(), txt: `${n} tiro${n > 1 ? 's' : ''} em ${T.nome}` } }).catch(() => {});
  toast(`${ic('navios:canhao', 32)} <b>Fogo!</b> ${art.map(j => esc(bnPrimeiro(j))).join(', ')} rola${art.length > 1 ? 'm' : ''} o tiro.`, { tempo: 5000 }); App.render(); return true;
}
function bnPedidoFim() { BN.pend = null; DB.gravar('mesa/naval', { pedido: APAGAR }).catch(() => {}); }
ACT['bn-pend-site'] = () => { if (!BN.pend) return; const o = BN.pend.o; bnPedidoFim(); bnAtirar(o); };
ACT['bn-ped-nao'] = el => DB.gravar('jogadores/' + el.dataset.uid, { manobra: APAGAR });
ACT['bn-ped-fazer'] = el => { const j = (M.jogadores || []).find(x => x.uid === el.dataset.uid), nav = bnBando(bn()); if (!j || !j.manobra || !nav) return; const k = j.manobra.k;
  bnMuda(b => { b.sel = nav.id; }, true);
  if (k === 'bb' || k === 'eb') ACT['bn-virar']({ dataset: { g: k === 'bb' ? '-45' : '45' } }); else if (k === 'mais' || k === 'menos') ACT['bn-vel']({ dataset: { v: String(nav.vel + (k === 'mais' ? 6 : -6)) } }); else ACT['bn-ancora']();
  DB.gravar('jogadores/' + j.uid, { manobra: APAGAR }); };
ACT['bn-puxar'] = () => { const nav = bnBando(bn()); if (!nav) return; const cap = capitaoOficial(), art = [...bnNoPosto('canhao'), ...bnNoPosto('armas')];
  const des = art.length ? Math.max(...art.map(j => attrMod(fichaDe(j), 'DES'))) : null, fc = cap && cap.tipo === 'jogador' ? fichaDe(cap.j) : null;
  const pre = fc ? attrMod(fc, 'PRE') : null, von = fc ? attrMod(fc, 'VON') : cap ? cap.von : null;
  if (des == null && pre == null && von == null) return toast('Não achei capitão com ficha nem artilheiro a postos. Defina o capitão em Tripulação ou peça aos jogadores que escolham o posto.', { tempo: 7000 });
  bnMuda(b => { const n = bnBando(b); if (des != null) n.des = des; if (pre != null) n.pre = pre; if (von != null) n.von = von;
    bnLog(b, `${bnNome(n)}: números da tripulação. ${pre != null ? `Presença do capitão ${sg(pre)}. ` : ''}${des != null ? `Melhor Destreza dos artilheiros ${sg(des)}. ` : ''}${von != null ? `Vontade ${sg(von)}.` : ''}`, 'passa'); }); };
ACT['bn-reparo'] = () => { const nav = bnBando(bn()); if (!nav) return; const aj = Math.max(0, bnNoPosto('reparo').length - 1), precisa = 1 + Math.max(0, NV_ORD.indexOf(nav.tamanho)), max = aj >= precisa, v = max ? 350 : rolar('30d10').total + 50;
  confirmar(`Reparo Emergencial no <b>${esc(nav.nome)}</b>: <b>${v} PV paralelos</b>${max ? ` (o máximo: ${aj} ajudante${aj > 1 ? 's' : ''} de emergência)` : ` (30d10 + 50; para o máximo faltam ajudantes: ${aj} de ${precisa})`}.<br>Eles apanham antes do PV normal. Um reparo novo troca o antigo.`,
    () => bnMuda(b => { const n = bnBando(b); n.par = v; bnLog(b, `${bnNome(n)} recebe um <b>Reparo Emergencial</b>: +${v} PV paralelos${max ? ' (máximo, com ajudantes)' : ''}.`, 'passa'); }), { ok: 'Aplicar' }); };
/* chegou rolagem de artilheiro ou pedido de manobra */
const BnVisto = { man: null };
Mesa.on(ch => { if (ch !== 'jogadores' || !Mesa.aberta || !souMestre()) return;
  if (BN.pend) { const j = (M.jogadores || []).find(x => x.tiro && x.tiro.id === BN.pend.id && Array.isArray(x.tiro.nats));
    if (j) { const o = BN.pend.o; bnPedidoFim(); BN.nats = j.tiro.nats.slice(0, 3).map(x => ({ nat: clamp(Math.round(+x.nat || 1), 1, 20), txt: `${String(x.txt || x.nat).slice(0, 30)} (${bnPrimeiro(j)} rolou)` })); try { bnAtirar(o); } finally { BN.nats = null; } } }
  const man = (M.jogadores || []).filter(j => j.manobra && j.posto === 'leme');
  if (BnVisto.man) man.filter(j => !BnVisto.man.has(j.manobra.id)).forEach(j => toast(`${ic('navios:timao', 32)} <b>${esc(bnPrimeiro(j))}</b> (leme) pede: ${BN_MANOBRAS[j.manobra.k] || ''}. Veja em Batalha naval.`, { tempo: 6000 }));
  BnVisto.man = new Set(man.map(j => j.manobra.id)); });

/* ───── Canhão de Energia (LJ p. 315–316) ───── */
ACT['bn-energia'] = () => { const alvoId = ($('#bn-alvo') || {}).value || BN.alvo;
  confirmar('Disparar o <b>Canhão de Energia</b>? O livro pede 10 minutos de preparo e gasta 5 baterias grandes. Linha de 500 m, 50d12 de dano.', () => bnMuda(b => {
    const A = bnSel(b), T = bnNav(b, alvoId) || (A && bnAlvoDe(b, A)); if (!A || !T) return;
    if (!bnPode(b, A, 'cmb', 'O livro dá um tiro por turno do navio (LJ p. 314).')) return;
    const d = bnDist(A, T); if (d > 500) return toast(`O raio chega a 500 m (o alvo está a ${Math.round(d)} m).`, { tipo: 'ruim' });
    const sv = rnd(20), st = sv + (T.von || 0), passou = st >= 18, bruto = bnDanoR('50d12'), v = passou ? Math.floor(bruto / 2) : bruto, f = Math.max(0, v - T.br), noPar = Math.min(T.par || 0, f), vivo = T.pv > 0;
    if (noPar) T.par -= noPar; T.pv = Math.max(0, T.pv - (f - noPar)); T.vel = clamp(T.vel, 0, bnVelMax(T));
    bnFx(b, { k: 'tiro', ax: A.x, ay: A.y, tx: T.x, ty: T.y, ok: true, crit: true, i: 0, dano: f, proj: 'bala', hit: 'explosao' }); if (vivo && T.pv <= 0) bnFx(b, { k: 'afundou', x: T.x, y: T.y, nome: T.nome, d: 1.1 });
    bnMarca(b, A, 'cmb'); Som.tocar('dado');
    bnLog(b, `${bnNome(A)} dispara o <b>Canhão de Energia</b> em ${bnNome(T)}, a ${Math.round(d)} m. Salvaguarda de ${esc(T.nome)} (Vontade do comandante): ${sv}${sg(T.von || 0)} = ${st} contra CD 18 → ${passou ? 'passou, metade do dano' : '<b class="ruim">falhou</b>'}.
      <br>Dano 50d12 = ${bruto}${passou ? ` → ${v}` : ''} − ${T.br} = <b>${f}</b>. PV de ${esc(T.nome)}: <b>${T.pv}/${T.pvMax}</b>. Tudo que estiver na linha de 500 m também faz a salvaguarda (Destreza CD 18).`, 'tiro'); }), { ok: 'Disparar' }); };

/* ───── piloto automático para navio de figurante: usa as mesmas regras, só escolhe sozinho ───── */
ACT['bn-auto'] = () => {
  let b = bn(), A = bnSel(b); if (!A || A.pv <= 0) return; if (A.lado === 'neutro') return toast('Navio neutro não escolhe inimigo. Mude o lado na ficha do navio.');
  const ini = b.navios.filter(x => x !== A && x.pv > 0 && x.lado !== A.lado && x.lado !== 'neutro').sort((x, y) => bnDist(A, x) - bnDist(A, y)), T = ini[0];
  if (!T) return toast('Não tem inimigo no mapa para este navio.');
  const armas = A.armas.filter(a => a.q > 0 && BN_ARMAS[a.n]).sort((x, y) => BN_ARMAS[y.n].alc[1] - BN_ARMAS[x.n].alc[1]), mira = () => armas.find(a => bnMira(bn(), bnSel(bn()), bnNav(bn(), T.id), a.n).ok);
  const livre = b.vez < 0, feito = A.feito || {};
  if (!mira() && (livre || !feito.man)) {
    const rel = bnAng(bnRumo(A, T) - A.dir), d = bnDist(A, T), alc = armas.length ? BN_ARMAS[armas[0].n].alc[1] : 0;
    if (armas.length && d <= alc) ACT['bn-virar']({ dataset: { g: (rel <= 45 || (rel >= 135 && rel < 180)) ? (rel <= 45 ? '-45' : '45') : (rel >= 315 ? '45' : '-45') } });   // está perto, mas pela proa ou popa: vira para pôr o alvo de lado
    else if (rel > 22.5 && rel < 337.5) ACT['bn-virar']({ dataset: { g: rel < 180 ? '45' : '-45' } });   // longe: aponta para o alvo
    else if (A.vel < bnVelMax(A)) ACT['bn-vel']({ dataset: { v: String(bnVelMax(A)) } });
  }
  b = bn(); A = bnSel(b); const w = mira();
  if (w && (livre || !(A.feito || {}).cmb)) bnAtirar({ arma: w.n, mun: 'chumbo', qtd: w.q, estr: 'bomb', modo: '', alvo: T.id, de: A.id });
  b = bn(); if (b.vez >= 0 && b.navios[b.vez] && b.navios[b.vez].id === A.id) ACT['bn-prox']();
  else if (b.vez < 0) ACT['bn-mover']();   // antes da iniciativa não há "passar a vez": o clique já vale a rodada do navio
};

/* ───── entra na aba ───── */
(() => { const v = VIEWS.naval, orig = v.render, aoAntes = v.ao; if (!v.chaves.includes('jogadores')) v.chaves.push('jogadores');
  v.render = function () { const h = orig.apply(this, arguments); if (typeof h !== 'string' || !h.includes('<aside class="bn-dir">')) return h; const m = souMestre();
    return h.replace('<aside class="bn-dir">', '<aside class="bn-dir">' + (m ? bnTripHTML(bn()) : bnPostoHTML(bnVendo()))); };
  /* a lista de jogadores muda toda hora (presença): só redesenha a batalha quando muda posto, pedido ou rolagem, e nunca no meio de um arrasto */
  v.ao = function (ch) { if (ch === 'jogadores') { if (BN.arrasto) return false; const sig = JSON.stringify((M.jogadores || []).map(j => [j.uid, j.posto || '', (j.manobra || {}).id || '', (j.tiro || {}).id || '', online(j.visto) ? 1 : 0])); if (sig === this._sigJ) return false; this._sigJ = sig; }
    return aoAntes ? aoAntes.call(this, ch) : undefined; }; })();
if (window.__expor) Object.assign(window, { bnNoPosto, bnProt, bnAtirar, bn });
