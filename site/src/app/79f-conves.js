/* ═══════════ RECURSOS DO CONVÉS (regras da casa que o mestre desbloqueia) ═══════════
   Nada aqui é do livro. São quatro recursos pequenos, na ideia do Black Flag, para a tripulação de figurantes
   ter vida sem ganhar ficha. Cada um começa bloqueado; o mestre desbloqueia em Tripulação quando a história pedir.
     moral      · marcador 0 a 10 do ânimo dos marujos (todos veem). Dá +1/−1 só nas rolagens que o site faz pela tripulação.
     marcante   · um marujo com rosto ganha feitos (estrelas), escritos pelo mestre.
     abordagem  · na Batalha naval, a luta dos marujos no convés inimigo: um d20 por lado, por rodada.
     rota       · um navio do bando repete a missão sozinho; o que ele traz espera em Frota até o mestre guardar.
   Guardado em mesa/tripulacao (rec, moral, moralPq): só o mestre escreve, todos leem. Os números são um ponto de partida. */
const CV_REC = [
  ['moral', 'Moral do convés', 'Marcador de 0 a 10 do ânimo dos marujos. Todos veem. Dá +1 ou −1 só nas rolagens que o site faz pela tripulação (rota fixa e luta no convés).'],
  ['marcante', 'Marujo que vira gente', 'Um marujo com rosto pode ganhar feitos (estrelas), escritos por você. Depois de uma abordagem ou missão, o site oferece sortear quem se destacou.'],
  ['abordagem', 'Abordagem', 'Na Batalha naval: a luta dos marujos no convés inimigo, um d20 por lado a cada rodada. Os protagonistas lutam no Combate, como sempre.'],
  ['rota', 'Rota fixa da frota', 'Um navio do bando repete a missão sozinho. O que ele traz fica esperando em Frota até você guardar no Banco do bando.']
];
const cvRec = k => !!(((M.trip || {}).rec || {})[k]);
const cvMoral = () => { const v = (M.trip || {}).moral; return v == null ? 5 : clamp(Math.round(+v || 0), 0, 10); };
const cvMoralMod = () => { if (!cvRec('moral')) return 0; const v = cvMoral(); return v >= 10 ? 2 : v >= 8 ? 1 : v <= 0 ? -2 : v <= 2 ? -1 : 0; };
const cvMoralT = v => v <= 1 ? 'Motim no ar' : v <= 3 ? 'Resmungando' : v <= 6 ? 'Firme' : v <= 8 ? 'Animada' : 'Cantando no convés';
const CV_MOTIVOS = [['festa', 1], ['vitória', 1], ['tesouro dividido', 1], ['porto bom', 1], ['baixas', -1], ['fome', -1], ['derrota', -1], ['castigo', -1]];
const cvGrava = d => DB.gravar('mesa/tripulacao', d).catch(e => toast('Não deu para salvar: ' + esc(e.code || e.message), { tipo: 'ruim' }));
function cvMoralMuda(d, pq) { if (!cvRec('moral')) return Promise.resolve(); const v = clamp(cvMoral() + d, 0, 10); return cvGrava({ moral: v, moralPq: `${d > 0 ? '+' : '−'}${Math.abs(d)} · ${String(pq || '').slice(0, 60) || (d > 0 ? 'subiu' : 'caiu')} · dia ${Relogio.agora().dia}` }); }
ACT['cv-rec'] = el => { if (!souMestre()) return; const k = el.dataset.k, r = CV_REC.find(x => x[0] === k), novo = !cvRec(k); if (!r) return;
  cvGrava({ rec: { [k]: novo }, ...(k === 'moral' && novo && (M.trip || {}).moral == null ? { moral: 5 } : {}) }).then(() => { if (novo) { avisar('liberado', `O bando desbloqueou: ${r[1]}`); toast(`<b>${esc(r[1])}</b> desbloqueado.`, { tipo: 'bom' }); } else toast(`${esc(r[1])} voltou a ficar bloqueado. Nada foi apagado.`); }); };
ACT['cv-moral'] = el => { if (!souMestre()) return; const d = +el.dataset.d || 0, pq = el.dataset.pq || (($('#cv-pq') || {}).value || '').trim(); if (d) cvMoralMuda(d, pq); };
function cvMoralHTML() {
  if (!cvRec('moral')) return ''; const v = cvMoral(), m = souMestre(), mod = cvMoralMod();
  return `<div class="cv-moral"><div class="cv-moral-cab"><b>Moral do convés</b><span class="cv-moral-t cv-m${v <= 3 ? 'b' : v >= 7 ? 'a' : 'm'}">${cvMoralT(v)}</span><small>${v} de 10${mod ? ` · ${mod > 0 ? '+' : '−'}${Math.abs(mod)} nas rolagens da tripulação` : ''}</small></div>
    <div class="cv-moral-b" role="img" aria-label="Moral ${v} de 10">${Array.from({ length: 10 }, (_, i) => `<i class="${i < v ? 'on' : ''} ${v <= 3 ? 'b' : v >= 7 ? 'a' : ''}"></i>`).join('')}</div>
    ${(M.trip || {}).moralPq ? `<p class="nota">Última mudança: ${esc(M.trip.moralPq)}</p>` : ''}
    ${m ? `<div class="linha-bts cv-moral-bts">${CV_MOTIVOS.map(([t, d]) => `<button class="chip ${d > 0 ? 'cv-mais' : 'cv-menos'}" data-act="cv-moral" data-d="${d}" data-pq="${t}">${d > 0 ? '+1' : '−1'} ${t}</button>`).join('')}</div>
      <div class="linha-bts"><input id="cv-pq" class="cresce" maxlength="60" placeholder="Outro motivo (uma frase sua)"><button class="bt fino" data-act="cv-moral" data-d="1">+1</button><button class="bt fino" data-act="cv-moral" data-d="-1">−1</button></div>` : ''}</div>`;
}
/* seção em Tripulação: o mestre vê as quatro chaves; os jogadores veem só o que está desbloqueado */
function cvHTML() {
  const m = souMestre(), on = CV_REC.filter(([k]) => cvRec(k)); if (!m && !on.length) return '';
  return `<section class="pap trip-cv"><h2>${ic('mesa:tripulacao', 32)} Recursos do convés <small>regras da casa</small></h2>
    ${m ? `<p class="nota">Não são regras do livro. Cada recurso começa bloqueado: desbloqueie quando a história pedir. Bloquear de novo não apaga nada.</p>
      <ul class="cv-recs">${CV_REC.map(([k, n, d]) => `<li class="${cvRec(k) ? 'on' : ''}"><div><b>${n}</b><small>${d}</small></div><button class="bt fino ${cvRec(k) ? '' : 'ouro'}" data-act="cv-rec" data-k="${k}" aria-pressed="${cvRec(k)}">${cvRec(k) ? 'Bloquear' : 'Desbloquear'}</button></li>`).join('')}</ul>`
      : `<p class="chips">${on.map(([, n]) => `<span class="tag">${n}</span>`).join('')}</p>`}
    ${cvMoralHTML()}</section>`;
}

/* ───── marujo que vira gente: feitos nos rostos do convés ───── */
ACT['mj-feito'] = el => { const t = String(el.value || '').trim().slice(0, 90); if (!t || !souMestre()) return; el.value = ''; el.blur();   /* sem foco, a lista de feitos redesenha quando o banco responder */
  mjGravaRostos(mjRostos().map(r => r.id === el.dataset.id ? Object.assign({}, r, { feitos: [...(r.feitos || []), t].slice(-6) }) : r)); };
ACT['mj-feito-tirar'] = el => { if (!souMestre()) return; mjGravaRostos(mjRostos().map(r => r.id === el.dataset.id ? Object.assign({}, r, { feitos: (r.feitos || []).filter((_, i) => i !== +el.dataset.i) }) : r)); };
function mjFeitosHTML(r, m) {
  if (!cvRec('marcante')) return ''; const F = r.feitos || [];
  return `${F.length ? `<ul class="mj-feitos">${F.map((t, i) => `<li><span aria-hidden="true">★</span> ${esc(t)}${m ? ` <button class="link" data-act="mj-feito-tirar" data-id="${r.id}" data-i="${i}" aria-label="Tirar este feito">tirar</button>` : ''}</li>`).join('')}</ul>` : ''}
    ${m ? `<input id="mjf-${r.id}" data-chg="mj-feito" data-id="${r.id}" maxlength="90" placeholder="★ Novo feito (uma frase sua) e Enter" aria-label="Novo feito de ${esc(r.nome)}">` : ''}`;
}
/* alguém se destacou: sorteia um marujo, dá rosto e já anota o feito. O mestre troca o nome ou tira depois, se quiser. */
ACT['mj-destaque'] = el => { if (!souMestre()) return; const n = mjSorteia(); n.feitos = [String(el.dataset.feito || 'Se destacou').slice(0, 90)]; el.disabled = true;
  mjGravaRostos([n, ...mjRostos()]).then(() => toast(`<b>${esc(n.nome)}</b> (${esc(mjFun(n.of)[2])}) se destacou e ganhou rosto no convés. Troque o nome ou tire em Tripulação.`, { tipo: 'bom', tempo: 8000 })); };

/* ───── abordagem: a luta dos marujos no convés (dentro da Batalha naval) ─────
   Fica no estado da batalha (b.abord), então vai junto na cópia que os jogadores veem.
   Rodada: cada lado rola d20 + bônus. Bônus: +2 se tem o dobro de gente (+4 o triplo); nosso lado soma a moral e +1 por protagonista
   no convés (até +5); o lado deles soma a ameaça (0 fracos, 2 comuns, 4 veteranos, 6 elite).
   Quem perde a rodada perde 10% da gente, +3% por ponto de diferença (até 45%). Quem ganha perde 6% −1% por ponto (pode ser zero).
   Empate: 5% cada. Acaba quando um lado fica com um quarto ou menos do que começou (rende-se ou recua), ou quando o mestre encerrar. */
const AB_AMEACA = [[0, 'Fracos (pescadores, novatos)'], [2, 'Comuns (piratas, marinheiros)'], [4, 'Veteranos'], [6, 'Elite']];
const abDe = b => (b || {}).abord || null;
const abPerto = (b, a, d) => a && d && (bnDist(a, d) <= 12 || a.preso === d.id || d.preso === a.id);
function abBotaoHTML(b, n, alvo) {
  if (!souMestre() || !cvRec('abordagem') || !alvo || abDe(b)) return ''; const perto = abPerto(b, n, alvo);
  return `<button class="bt fino ${perto ? 'ouro' : ''}" data-act="ab-abrir" title="${perto ? 'Os marujos invadem o convés do alvo' : 'Estão longe: chegue a 12 m ou prenda o alvo com o arpão. Dá para abordar mesmo assim, se a cena pedir.'}">${ic('mesa:tripulacao', 32)} Abordar${perto ? '' : ` <small>(${Math.round(bnDist(n, alvo))} m)</small>`}</button>`;
}
ACT['ab-abrir'] = () => { if (!souMestre()) return; const b = bn(), n = bnSel(b), alvo = n && bnAlvoDe(b, n); if (!n || !alvo) return;
  const e = mjEfe(), nJog = (M.jogadores || []).length, meu = n.lado === 'bando' ? n : alvo, outro = meu === n ? alvo : n;
  const nossos = meu.frotaId || !e ? Math.round(((NV.tam[meu.tamanho] || NV.tam.Pequeno).trip) * 0.4) : Math.max(0, nvN(e.tot) - nJog), deles = Math.round(((NV.tam[outro.tamanho] || NV.tam.Pequeno).trip) * 0.6);
  Modal.abrir(`<h2>${ic('mesa:tripulacao', 32)} Abordar: ${esc(meu.nome)} × ${esc(outro.nome)}</h2>
    <p class="nota">Regra da casa. Aqui lutam só os <b>marujos</b>, em grupo, com um d20 por lado a cada rodada. Os protagonistas e os inimigos com nome lutam no Combate.</p>
    <label class="campo-inline">Nossos marujos na luta <input id="ab-na" type="number" min="1" max="999" value="${Math.max(1, nossos)}" style="width:6em"></label>
    <label class="campo-inline">Marujos deles <input id="ab-nb" type="number" min="1" max="999" value="${Math.max(1, deles)}" style="width:6em"></label>
    <label class="campo-inline">Como eles são <select id="ab-am">${AB_AMEACA.map(([v, t]) => `<option value="${v}" ${v === 2 ? 'selected' : ''}>${t} (+${v})</option>`).join('')}</select></label>
    <label class="campo-inline">Protagonistas lutando no convés <input id="ab-her" type="number" min="0" max="12" value="${Math.min(5, nJog)}" style="width:5em"></label>
    <p class="nota">${meu.frotaId || !e ? 'Número sugerido pelo tamanho do navio.' : 'Nossos: os marujos do efetivo (sem contar os jogadores).'} Deles: 60% do que cabe no navio (LJ p. 320). Troque à vontade.${cvRec('moral') && cvMoralMod() ? ` Moral ${cvMoral()}: ${cvMoralMod() > 0 ? '+' : '−'}${Math.abs(cvMoralMod())} para os nossos.` : ''}</p>
    <div class="linha-bts"><button class="bt ruim" data-act="ab-ir" data-a="${meu.id}" data-d="${outro.id}">Abordar!</button><button class="bt" data-act="modal-fechar">Cancelar</button></div>`); };
ACT['ab-ir'] = el => { const na = clamp(Math.round(num(($('#ab-na') || {}).value) || 1), 1, 999), nb = clamp(Math.round(num(($('#ab-nb') || {}).value) || 1), 1, 999), am = +(($('#ab-am') || {}).value || 2), her = clamp(Math.round(num(($('#ab-her') || {}).value) || 0), 0, 12);
  Modal.fechar(); bnMuda(b => { const a = bnNav(b, el.dataset.a), d = bnNav(b, el.dataset.d); if (!a || !d) return;
    b.abord = { a: a.id, d: d.id, na, nb, na0: na, nb0: nb, am, her, rod: 0, ult: null, fim: null, principal: !a.frotaId };
    bnLog(b, `${bnNome(a)} aborda ${bnNome(d)}: <b>${na}</b> dos nossos contra <b>${nb}</b> no convés.`, 'abord'); }); Som.tocar('dado'); };
function abRodada(b) {
  const A = b.abord; if (!A || A.fim) return;
  const vant = (x, y) => x >= y * 3 ? 4 : x >= y * 2 ? 2 : 0, mor = cvMoralMod(), her = Math.min(5, A.her || 0);
  const da = rnd(20), db = rnd(20), ba = vant(A.na, A.nb) + mor + her, bb = vant(A.nb, A.na) + (A.am || 0), ta = da + ba, tb = db + bb, dif = ta - tb;
  const perde = (n, k) => Math.min(n, Math.max(1, Math.ceil(n * Math.min(0.45, 0.10 + 0.03 * k)))), ganha = (n, k) => Math.min(n, Math.floor(n * Math.max(0, 0.06 - 0.01 * k)));
  let pa, pb; if (dif > 0) { pb = perde(A.nb, dif); pa = ganha(A.na, dif); } else if (dif < 0) { pa = perde(A.na, -dif); pb = ganha(A.nb, -dif); } else { pa = Math.min(A.na, Math.ceil(A.na * 0.05)); pb = Math.min(A.nb, Math.ceil(A.nb * 0.05)); }
  A.na -= pa; A.nb -= pb; A.rod++;
  A.ult = { da, db, ba, bb, ta, tb, pa, pb };
  const a = bnNav(b, A.a), d = bnNav(b, A.d);
  bnLog(b, `Convés, rodada ${A.rod}: nossos <b>${ta}</b> (d20 ${da}${ba ? (ba > 0 ? '+' : '−') + Math.abs(ba) : ''}) × deles <b>${tb}</b> (d20 ${db}${bb ? '+' + bb : ''}). ${dif > 0 ? 'Os nossos levam a melhor' : dif < 0 ? 'Eles levam a melhor' : 'Ninguém cede'}: caem ${pa} dos nossos e ${pb} deles. Ficam <b>${A.na}</b> × <b>${A.nb}</b>.`, 'abord');
  if (A.nb <= Math.floor(A.nb0 / 4) || A.nb <= 0) { A.fim = 'vitoria'; bnLog(b, `<b>O convés ${d ? 'de ' + bnNome(d) : ''} é nosso.</b> Os que sobraram se rendem.`, 'abord'); }
  else if (A.na <= Math.floor(A.na0 / 4) || A.na <= 0) { A.fim = 'derrota'; bnLog(b, `<b>Os nossos recuam</b> para ${a ? bnNome(a) : 'o navio'}.`, 'abord'); }
}
ACT['ab-rodada'] = () => { if (!souMestre()) return; bnMuda(b => abRodada(b)); Som.tocar('dado'); };
ACT['ab-encerrar'] = el => { if (!souMestre()) return; const A = abDe(bn()); if (!A) return;
  const fecha = () => { const baixas = A.na0 - A.na, fim = A.fim; bnMuda(b => { if (b.abord && !b.abord.fim) bnLog(b, 'A luta no convés foi interrompida.', 'abord'); b.abord = null; });
    if (baixas > 0 && A.principal && mjEfe()) { const e = Object.assign({}, mjEfe()); let falta = Math.min(baixas, Math.max(0, nvN(e.tot) - (M.jogadores || []).length));
      const tirou = falta; for (let i = 0; i < falta; i++) { const saco = []; MJ_FUN.forEach(([x]) => { for (let n = 0; n < nvN(e[x]); n++) saco.push(x); }); const k = saco.length ? frSorteia(saco) : ''; if (k) e[k] = nvN(e[k]) - 1; }
      e.tot = nvN(e.tot) - tirou; if (tirou) cvGrava({ efe: e }).then(() => toast(`<b>−${tirou} marujo${tirou > 1 ? 's' : ''}</b> no efetivo, pelas baixas da abordagem. Confira em Tripulação.`, { tempo: 7000 })); }
    if (fim === 'vitoria') cvMoralMuda(1, 'abordagem vencida'); else if (fim === 'derrota') cvMoralMuda(-1, 'abordagem perdida'); };
  if (A.fim || el.dataset.ja) fecha(); else confirmar('Encerrar a luta no convés agora, sem vencedor?', fecha, { ok: 'Encerrar' }); };
/* depois da vitória: o navio tomado entra na frota do bando (com o PV que sobrou) */
ACT['ab-tomar'] = () => { if (!souMestre()) return; const b = bn(), A = abDe(b), d = A && bnNav(b, A.d); if (!d || A.fim !== 'vitoria' || A.tomado) return;
  const modelo = NV.modelo[d.tamanho] ? d.tamanho : 'Pequeno', velho = d.frotaId && frota().find(f => f.id === d.frotaId), id = velho ? velho.id : uid();
  /* se o navio já estava na Frota (do lado inimigo), ele só troca de lado; se não, entra novo */
  Store.set(s => { const f = frota(s).find(x => x.id === id); if (f) Object.assign(f, { lado: 'bando', pv: d.pv, traco: f.traco || 'tomado em abordagem', missao: '' });
    else frota(s).push({ id, nome: d.nome, modelo, lado: 'bando', cmd: '', rosto: 'retratos:capitao', traco: 'tomado em abordagem', missao: '', pv: d.pv }); }, null, { semDesfazer: true });
  bnMuda(x => { const n = bnNav(x, d.id); if (n) { n.lado = 'bando'; n.frotaId = id; } if (x.abord) x.abord.tomado = true; bnLog(x, `${bnNome(d)} agora navega com o bando.`, 'abord'); });
  frPublicar(); toast(`<b>${esc(d.nome)}</b> entrou na frota do bando. Escolha um comandante em Frota.`, { tipo: 'bom', tempo: 7000 }); };
ACT['ab-saque'] = () => { if (!souMestre()) return; const A = abDe(bn()), v = Math.max(0, Math.round(num(($('#ab-saque-v') || {}).value) || 0)); if (!A || A.fim !== 'vitoria' || A.saque || !v) return;
  bnMuda(x => { if (x.abord) x.abord.saque = v; bnLog(x, `Saque do convés: ${nvB(v)} para o Banco do bando.`, 'abord'); });
  bancoMov(v, 'Saque de abordagem', 'Abordagem'); toastBeli(v, 'Saque para o Banco do bando'); };
function abPainelHTML(b, mestre) {
  const A = abDe(b); if (!A) return ''; const a = bnNav(b, A.a), d = bnNav(b, A.d), u = A.ult;
  const barra = (n, n0, cls) => `<div class="ab-barra ${cls}"><i style="width:${n0 ? Math.round(100 * n / n0) : 0}%"></i></div>`;
  const tam = d ? d.tamanho : 'Pequeno';
  return `<section class="pap ab-painel ${A.fim || ''}"><h2>${ic('mesa:tripulacao', 32)} Luta no convés <small>${A.fim === 'vitoria' ? 'o convés é nosso' : A.fim === 'derrota' ? 'os nossos recuaram' : A.rod ? 'rodada ' + A.rod : 'vai começar'}</small></h2>
    <div class="ab-lados"><div><b>${esc(a ? a.nome : 'Nossos')}</b><span>${A.na} de ${A.na0} marujos</span>${barra(A.na, A.na0, 'nos')}</div><span class="ab-x">×</span><div><b>${esc(d ? d.nome : 'Eles')}</b><span>${A.nb} de ${A.nb0} marujos</span>${barra(A.nb, A.nb0, 'eles')}</div></div>
    ${u ? `<p class="ab-ult">Última rodada: nossos <b>${u.ta}</b> <small>(d20 ${u.da}${u.ba ? (u.ba > 0 ? ' +' : ' −') + Math.abs(u.ba) : ''})</small> × deles <b>${u.tb}</b> <small>(d20 ${u.db}${u.bb ? ' +' + u.bb : ''})</small> · caíram ${u.pa} dos nossos e ${u.pb} deles.</p>` : ''}
    ${mestre ? (A.fim ? `${A.fim === 'vitoria' ? `<div class="linha-bts">${A.tomado ? '<span class="tag">navio na frota do bando</span>' : `<button class="bt ouro" data-act="ab-tomar" title="O navio entra na Frota, do lado do bando, com o PV que sobrou">Tomar o navio para a frota</button>`}
          ${A.saque ? `<span class="tag">saque guardado: ${nvB(A.saque)}</span>` : `<label class="campo-inline">Saque ฿ <input id="ab-saque-v" type="number" min="0" value="${(FR_TAXA[tam] || FR_TAXA.Pequeno) * 5}" style="width:9em"></label><button class="bt fino" data-act="ab-saque">Guardar no Banco</button>`}
          ${cvRec('marcante') ? `<button class="bt fino" data-act="mj-destaque" data-feito="Abordagem ao ${esc(d ? d.nome : 'navio inimigo')}">Alguém se destacou?</button>` : ''}</div>
          <p class="nota">O valor do saque é só uma sugestão (5 dias de rota calma desse tamanho de navio). Você decide o que tinha a bordo.</p>` : ''}
        <div class="linha-bts"><button class="bt bom" data-act="ab-encerrar">Fechar a luta${A.principal && A.na0 > A.na ? ` (−${A.na0 - A.na} no efetivo)` : ''}</button></div>`
      : `<div class="linha-bts"><button class="bt ruim" data-act="ab-rodada">${ic('mesa:d20', 32)} Rodada do convés</button><button class="bt fino" data-act="ab-encerrar">Encerrar sem vencedor</button></div>
        <p class="nota">Um d20 por lado. Nossos: ${[A.her ? `+${Math.min(5, A.her)} protagonistas` : '', cvMoralMod() ? `${cvMoralMod() > 0 ? '+' : '−'}${Math.abs(cvMoralMod())} moral` : ''].filter(Boolean).join(', ') || 'sem bônus fixo'}. Deles: +${A.am || 0} (${(AB_AMEACA.find(x => x[0] === A.am) || AB_AMEACA[1])[1].split(' (')[0].toLowerCase()}). Quem tem o dobro de gente ganha +2; o triplo, +4.</p>`) : ''}</section>`;
}
(() => { const v = VIEWS.naval; if (!v) return; const orig = v.render; v.render = function () { const h = orig.apply(this, arguments); if (typeof h !== 'string') return h;
  const p = abPainelHTML(bnVendo(), souMestre()); return p ? h.replace('</header>', '</header>' + p) : h; }; })();

/* ───── rota fixa: o navio repete a missão sozinho; o que traz espera na caixa da frota ───── */
const frCaixa = s => { s = s || S(); if (!Array.isArray(s.frotaCaixa)) s.frotaCaixa = []; return s.frotaCaixa; };
function frRotaAnda() {
  if (!souMestre()) return; const R = Relogio.agora();
  if (!frota().some(f => f.viagem && f.viagem.rep && R.min >= f.viagem.ate)) return;
  let novas = 0, parou = [];
  Store.set(s => { frota(s).forEach(f => { const c = frNums(f); let n = 0;
    while (f.viagem && f.viagem.rep && R.min >= f.viagem.ate && c && n++ < 12) {
      const v = f.viagem, r = FR_RISCO[v.risco] || FR_RISCO.calma, d = rnd(20), dm = clamp(d + cvMoralMod(), 1, 20), tipo = d === 20 ? 'otimo' : dm <= r.ruim ? 'ruim' : 'bom', base = frGanho(c, v.risco, v.dias);
      const ganho = tipo === 'otimo' ? base * 2 : tipo === 'ruim' ? Math.round(base / 2) : base, dano = tipo === 'ruim' ? Math.round(c.pvMax * r.dano) : 0;
      if (dano) f.pv = Math.max(0, (f.pv ?? c.pvMax) - dano);
      frCaixa(s).unshift({ id: uid(), nome: f.nome, d, tipo, v: ganho, dano, dia: frDiaDe(v.ate), rota: r.n }); novas++;
      if ((f.pv ?? c.pvMax) <= c.pvMax * 0.25) { f.viagem = null; f.missao = 'avariado: esperando conserto'; parou.push(f.nome); }
      else f.viagem = { risco: v.risco, dias: v.dias, ini: v.ate, ate: v.ate + v.dias * 1440, rep: true };
    } }); s.frotaCaixa = frCaixa(s).slice(0, 60); }, null, { semDesfazer: true });
  if (novas) { frPublicar(); toast(`${ic('navios:galeao', 32)} A frota voltou de ${novas} viagem${novas > 1 ? 'ns' : ''} de rota fixa. Veja em <b>Frota</b> o que trouxe.${parou.length ? ` <b>${esc(parou.join(', '))}</b> parou: está avariado.` : ''}`, { tipo: 'bom', tempo: 9000 }); if (App.rota === 'frota') App.render(); }
}
Mesa.on(ch => { if (ch === 'estado') frRotaAnda(); });
ACT['fr-caixa-ok'] = () => { if (!souMestre()) return; const L = frCaixa(), tot = L.reduce((a, x) => a + nvN(x.v), 0), n = L.length; if (!n) return;
  Store.set(s => { s.frotaCaixa = []; }, null, { semDesfazer: true }); if (tot) { bancoMov(tot, `Frota: ${n} viagem${n > 1 ? 'ns' : ''} de rota fixa`, 'Frota'); toastBeli(tot, 'A frota trouxe para o Banco do bando'); } App.render(); };
ACT['fr-caixa-fora'] = () => { if (!souMestre()) return; confirmar('Descartar o que a frota trouxe, sem guardar no Banco?', () => { Store.set(s => { s.frotaCaixa = []; }, null, { semDesfazer: true }); App.render(); }, { ok: 'Descartar' }); };
function frCaixaHTML() {
  const L = frCaixa(); if (!L.length) return ''; const tot = L.reduce((a, x) => a + nvN(x.v), 0);
  return `<section class="pap fr-caixa"><h2>${ic('itensop:beli_moedas', 32)} A frota trouxe <small>esperando você guardar</small></h2>
    <ul>${L.slice(0, 12).map(x => `<li class="fr-res-${x.tipo}"><b>${esc(x.nome)}</b> · dia ${x.dia} · ${esc(x.rota || '')} · d20 ${x.d}: ${x.tipo === 'otimo' ? 'deu muito certo' : x.tipo === 'ruim' ? `deu problema${x.dano ? ` (−${x.dano} PV)` : ''}` : 'deu certo'} · <b>${nvB(x.v)}</b></li>`).join('')}${L.length > 12 ? `<li class="nota">e mais ${L.length - 12} viagem(ns)</li>` : ''}</ul>
    <div class="linha-bts"><button class="bt bom" data-act="fr-caixa-ok">Guardar ${nvB(tot)} no Banco do bando</button><button class="bt fino" data-act="fr-caixa-fora">Descartar</button>${cvRec('marcante') ? `<button class="bt fino" data-act="mj-destaque" data-feito="Viagem da frota, dia ${L[0].dia}">Alguém se destacou?</button>` : ''}</div></section>`;
}
(() => { const v = VIEWS.frota; if (!v) return; const orig = v.render; v.render = function () { const h = orig.apply(this, arguments); if (typeof h !== 'string' || !souMestre()) return h;
  setTimeout(frRotaAnda, 0); const c = frCaixaHTML(); return c ? h.replace('</h1>', '</h1>' + c) : h; }; })();
if (window.__expor) Object.assign(window, { cvRec, cvMoral, abRodada, frRotaAnda, frCaixa });
