/* ═══════════ BATALHA NAVAL (protótipo) ═══════════
   Vale SÓ quando dois navios estão se enfrentando. Viajar de uma ilha para outra continua na aba Viagem.
   Regras: Livro do Jogador 2.1, cap. 14.3 Batalha Marítima (p. 314–317) e Guia do Narrador p. 70.
   · Iniciativa: o capitão de cada navio faz um Teste de Presença (LJ p. 314).
   · O navio não para: a cada rodada (6 segundos) ele anda, e cada 2 nós viram 1,5 m (LJ p. 314).
     Corrente a favor soma, contra tira (LJ p. 318). A única forma de parar de vez é a âncora.
   · No turno do navio: 1 Ação de Manobra (virar até 45°, mudar até 6 nós, âncora) e 1 Ação de Combate.
   · Tiro: d20 + Presença do capitão ou Destreza do atirador (o maior) + bônus da arma, contra a CR (LJ p. 315).
   · Um tiro por canhão. Acima de 3: Bombardeio (+metade do dano num acerto) ou Tiro de Teste (+3 no seguinte) (LJ p. 316).
   · Todo dano perde o BR da madeira (LJ p. 317). Casco danificado tira velocidade. Colisão acima de 14 nós (LJ p. 317).
   REGRAS DA CASA, marcadas na tela: tiro só pela lateral (o livro deixa para o Narrador decidir se o canhão está
   apontado) e mastro destruído corta a velocidade máxima pela metade (o livro não diz o que acontece).
   Fica no Controle do mestre (Store.s.naval). Com a chave ligada, uma cópia só de ver vai para mesa/naval. */
const BN_ARMAS = {
  'Canhão Comum': { alc: [90, 120], bonus: 2, mult: 1 },
  'Canhão Aprimorado': { alc: [120, 240], bonus: 4, mult: 1 },
  'Canhão Superior': { alc: [45, 90], bonus: 6, mult: 2 },
  'Longo Alcance': { alc: [500, 750], bonus: 5, mult: 0.5 },
  'Lançador de Arpão': { alc: [45, 90], bonus: 5, arpao: true }
};
const BN_MUN = { chumbo: 'Bola de Chumbo (3d10)', explosiva: 'Bola Explosiva (3d10 + explosão)', acorrentada: 'Bola Acorrentada (derruba o mastro)', estilhacos: 'Estilhaços (cone, só o convés)' };
const BN_COLISAO = { Pequeno: '5d10', Médio: '10d10', Grande: '15d10', Enorme: '20d10', Colossal: '30d10' };
const BN_CORRENTE = [0, 6, 20, 40];   // nós por nível (LJ p. 318)
const BN_DIRS = [['Norte', 0], ['Nordeste', 45], ['Leste', 90], ['Sudeste', 135], ['Sul', 180], ['Sudoeste', 225], ['Oeste', 270], ['Noroeste', 315]];
const BN_COMP = { Pequeno: 26, Médio: 44, Grande: 64, Enorme: 90, Colossal: 130 };   // metros no mapa: só visual
const BN_ZOOM = [[300, 'Abordagem', 'navios colados'], [600, 'Canhão', 'alcance normal'], [1200, 'Longo alcance', 'canhão de 750 m']];
const BN_EVENTOS = [['Evento Inesperado', 'Um dos Encontros Marítimos (maremoto, ciclone, tufão) surge no meio da batalha e atrapalha todos, ajuda o bando ou os inimigos.'],
  ['Tormenta', 'Uma maré turbulenta afasta ou aproxima os navios, ou leva todos para um lugar que complica ainda mais.'],
  ['Evento de Grandes Proporções', 'Algo grande muda o rumo da aventura: uma Knock Up Stream joga o navio para o céu, uma criatura imensa devora o barco, um maremoto separa o bando do navio.'],
  ['Ataque Inesperado', 'Uma criatura marinha ou alada imensa ataca os navios inimigos. Se o bando continuar atacando, pode chamar a atenção dela.'],
  ['Visão Obstruída', 'Neblina densa ou chuva forte tapa a visão: do ambiente todo ou só de um lado.'],
  ['Perigo Constante', 'O campo de batalha fica ainda mais perigoso: uma nuvem carregada bombardeia todos com raios, ou um navio submerso espalha bombas ou ácido pelo mar.']];
/* aparência (sprite) de cada navio: 0 inteiro, 1 danificado, 2 mastro destruído, 3 afundando; 'mercante' é o provisório do bando */
const BN_SPR = { marinha: 'Marinha', pirata: 'Pirata', mercante: 'Mercante / genérico' };
const bnSprDe = n => BN_SPR[n.sprite] ? n.sprite : n.lado === 'inimigo' ? 'pirata' : 'mercante';
const bnSprEstado = n => n.pv <= 0 ? 3 : !n.mastro ? 2 : n.pv <= n.pvMax * 0.5 ? 1 : 0;
const bnImg = nome => { try { return img(nome) || ''; } catch (e) { return ''; } };
const BN_EFX = { flash: 0, bala: 1, respingo: 2, explosao: 3, fogo: 4, arpao: 5, corrente: 6, esteira: 7 };   // quadros de efx_naval_N
const BN = { arrasto: null, efx: [], alvo: null, form: {}, det: {}, pubTimer: null, visto: null, pos: null, bandeira: null };
const bnNovo = () => ({ navios: [], rodada: 0, vez: -1, corrente: { nivel: 1, dir: 90 }, log: [], sel: null, mapa: 600, lateral: true, publico: false });
const bn = s => { s = s || S(); if (!s.naval) s.naval = bnNovo(); if (s.naval.lateral === undefined) s.naval.lateral = true; return s.naval; };
const bnNav = (b, id) => b.navios.find(n => n.id === id);
const bnDist = (a, c) => Math.hypot(a.x - c.x, a.y - c.y);
const bnAng = g => ((g % 360) + 360) % 360;
const bnDifAng = (a, c) => { const d = Math.abs(bnAng(a) - bnAng(c)); return d > 180 ? 360 - d : d; };
const bnRumo = (a, c) => bnAng(Math.atan2(c.x - a.x, -(c.y - a.y)) * 180 / Math.PI);   // 0 = norte, cresce no sentido do relógio
const bnBussola = g => (BN_DIRS.slice().sort((a, c) => bnDifAng(g, a[1]) - bnDifAng(g, c[1]))[0] || ['Norte'])[0];
function bnLado(a, c) { const r = bnAng(bnRumo(a, c) - a.dir); return r <= 45 || r >= 315 ? 'proa' : r < 135 ? 'estibordo' : r <= 225 ? 'popa' : 'bombordo'; }
/* velocidade máxima agora: casco danificado tira nós (LJ p. 317) e, pela regra da casa, sem mastro vale metade */
function bnVelMax(n) {
  const st = estadoNavio(n.pv, n.pvMax); if (st.vel == null) return 0;
  let v = st.vel ? Math.max(Math.min(8, n.velMax), n.velMax + st.vel) : n.velMax;
  if (!n.mastro) v = Math.max(2, Math.floor(v / 2));
  return v;
}
function bnCorrente(b, n) { const c = BN_CORRENTE[b.corrente.nivel] || 0, d = bnDifAng(n.dir, b.corrente.dir); return d <= 45 ? c : d >= 135 ? -c : 0; }
const bnNos = (b, n) => (n.pv <= 0 || (n.ancora && !n.vel)) ? 0 : Math.max(0, n.vel + bnCorrente(b, n));
const bnPasso = (b, n) => bnNos(b, n) * 0.75;   // cada 2 nós = 1,5 m por rodada (LJ p. 314)
const bnM = v => (Math.round(v * 10) / 10).toString().replace('.', ',');
const bnFim = (b, n) => { const a = n.dir * Math.PI / 180, p = bnPasso(b, n); return { x: n.x + Math.sin(a) * p, y: n.y - Math.cos(a) * p }; };
const bnLog = (b, html, tipo) => { b.log.unshift({ r: b.rodada, html, tipo: tipo || '', em: Date.now() }); b.log = b.log.slice(0, 120); };
const bnNome = n => `<b class="bn-n-${n.lado}">${esc(n.nome)}</b>`;
const bnD20 = modo => { if (BN.nats && BN.nats.length) return BN.nats.shift(); const a = rnd(20), c = rnd(20); return modo === 'vant' ? { nat: Math.max(a, c), txt: `${a} e ${c}, vale o maior` } : modo === 'desv' ? { nat: Math.min(a, c), txt: `${a} e ${c}, vale o menor` } : { nat: a, txt: String(a) }; };
const bnDanoR = (expr, crit) => rolar(expr, { critico: crit }).total;
const bnMuda = (fn, leve) => { BN.fxNovo = false; Store.set(s => fn(bn(s), s), null, { semDesfazer: !!leve }); bnPublicar(BN.fxNovo); };
/* evento de efeito: fica no estado (os 16 últimos) e viaja junto na cópia dos jogadores */
function bnFx(b, ev) { b.fx = (b.fx || []).concat(Object.assign({ id: uid(), t: Date.now() }, ev)).slice(-16); BN.fxNovo = true; }
function bnAlvoDe(b, n) { const outros = b.navios.filter(x => x !== n && x.pv > 0), m = bnNav(b, BN.alvo); return m && m !== n && m.pv > 0 ? m : outros.find(x => x.lado !== n.lado) || outros[0] || null; }
const bnSel = b => bnNav(b, b.sel);

/* ───── os jogadores veem (chave do mestre): uma cópia só de ver vai para mesa/naval ───── */
const bnPublicado = () => !!((M.naval || {}).on);
function bnDoBanco() { try { return JSON.parse((M.naval || {}).s || 'null'); } catch (e) { return null; } }
/* o mestre vê o dele; o jogador vê a cópia publicada */
const bnVendo = () => souMestre() ? bn() : (bnDoBanco() || bnNovo());
function bnPublicar(agora) {
  if (!souMestre()) return;
  clearTimeout(BN.pubTimer);
  const envia = () => { const b = bn(); if (!b.publico) return; DB.gravar('mesa/naval', { on: true, s: JSON.stringify(b), em: Date.now() }).catch(() => {}); };
  if (agora) envia(); else BN.pubTimer = setTimeout(envia, 700);
}
ACT['bn-publico'] = el => {
  const on = !!el.checked;
  bnMuda(b => { b.publico = on; }, true);
  if (on) { bnPublicar(true); toast('Os jogadores agora veem a batalha (só de olhar, sem mexer).', { tipo: 'bom', tempo: 6000 }); }
  else DB.gravar('mesa/naval', { on: false, s: '', em: Date.now() }).then(() => toast('A aba voltou a ser só sua.')).catch(() => {});
};

/* navio novo pelas tabelas do livro (tamanho: LJ p. 320; madeira: LJ p. 316) */
function bnCriar(d) {
  const t = TAM_NAVIO[d.tamanho] || TAM_NAVIO.Pequeno, m = MADEIRA[d.madeira] || MADEIRA.Cedro;
  return Object.assign({ id: uid(), nome: 'Navio', lado: 'inimigo', tamanho: 'Pequeno', madeira: 'Cedro', cr: m.cr, br: m.br, pv: t.pv, pvMax: t.pv, velMax: t.vel, vel: Math.min(t.vel, 6), dir: 0, x: 300, y: 200,
    ancora: false, mastro: true, preso: null, armas: [{ n: 'Canhão Comum', q: t.can }], pre: 2, des: 2, von: 2, ini: null, protege: 0, feito: {} }, d);
}

/* ───── mapa ───── */
function bnNavioSVG(b, n, sel, vez, fs) {
  const L = (BN_COMP[n.tamanho] || 26) * Math.max(1, Math.pow((b.mapa || 600) / 600, 0.6)), W = L * 0.36, h = L / 2, w = W / 2, morto = n.pv <= 0;
  const casco = `M0,${-h} C${w},${-h * 0.45} ${w},${h * 0.5} ${w * 0.7},${h} L${-w * 0.7},${h} C${-w},${h * 0.5} ${-w},${-h * 0.45} 0,${-h} Z`;
  const mastros = n.tamanho === 'Pequeno' ? [0] : n.tamanho === 'Médio' ? [-0.18, 0.2] : [-0.25, 0.05, 0.32];
  const f = bnFim(b, n), anda = bnPasso(b, n);
  const spr = bnImg(`navio_${bnSprDe(n)}_${bnSprEstado(n)}`), S = L / 0.94, esteira = bnImg('efx_naval_7');
  const corpo = spr
    ? `<ellipse class="bn-anel" rx="${(w * 1.55).toFixed(1)}" ry="${(h * 1.04).toFixed(1)}"/><image class="bn-spr" style="animation-delay:-${bnFase(n.id, 3.4)}s" href="${spr}" x="${(-S / 2).toFixed(1)}" y="${(-S / 2).toFixed(1)}" width="${S.toFixed(1)}" height="${S.toFixed(1)}"/>`
    : `<path class="bn-casco" d="${casco}"/><path class="bn-deque" d="${casco}" transform="scale(.72)"/>
      ${n.mastro ? mastros.map(p => `<line class="bn-vela" x1="${-w * 1.15}" x2="${w * 1.15}" y1="${p * L}" y2="${p * L}"/><circle class="bn-mastro" cx="0" cy="${p * L}" r="${Math.max(0.9, W * 0.09)}"/>`).join('') : `<path class="bn-quebrado" d="M${-w * 0.5},${-2} L${w * 0.5},${2} M${-w * 0.5},${2} L${w * 0.5},${-2}"/>`}
      <path class="bn-proa" d="M0,${-h - 4} L${-2.2},${-h} L${2.2},${-h} Z"/>`;
  const rastro = anda > 0 && !morto ? (esteira ? `<image class="bn-esteira" href="${esteira}" x="${(-L * 0.3).toFixed(1)}" y="${(h * 0.62).toFixed(1)}" width="${(L * 0.6).toFixed(1)}" height="${(L * 0.6).toFixed(1)}"/>` : `<path class="bn-rastro" d="M${-w * 0.6},${h} L0,${h + Math.min(L, 6 + anda)} L${w * 0.6},${h} Z"/>`) : '';
  return `${anda > 1 && !morto ? `<g class="bn-fantasma" transform="translate(${f.x.toFixed(1)},${f.y.toFixed(1)}) rotate(${n.dir})"><path d="${casco}"/></g>
    <line class="bn-prox" x1="${n.x}" y1="${n.y}" x2="${f.x.toFixed(1)}" y2="${f.y.toFixed(1)}"/>` : ''}
  <g class="bn-navio bn-${n.lado} ${sel ? 'sel' : ''} ${vez ? 'vez' : ''} ${morto ? 'morto' : ''}" data-bn="${n.id}" transform="translate(${n.x.toFixed(1)},${n.y.toFixed(1)})">
    <g transform="rotate(${n.dir})">
      ${rastro}${corpo}
      ${n.ancora ? `<circle class="bn-ancora" cx="0" cy="${h * 0.7}" r="${Math.max(1.6, W * 0.16)}"/>` : ''}
    </g>
    ${bnNavioVivo(n, L)}
    <text class="bn-rot" y="${(h + fs * 1.1).toFixed(1)}" text-anchor="middle">${esc(n.nome)}${n.ini != null ? ` · ${n.ini}` : ''}</text>
  </g>`;
}
/* efeitos rápidos (tiro, respingo, explosão, números de dano, faixas): ficam na tela por pouco tempo e não entram no registro */
const bnEfxVivo = (e, agora) => agora - e.t0 < (e.d || 0) * 1000 + (e.vida || 1300);
function bnEfeitosSVG() {
  const agora = Date.now(); BN.efx = BN.efx.filter(e => bnEfxVivo(e, agora));
  return `<g id="bn-efx" class="bn-efx">${BN.efx.map(e => { const atraso = ((e.d || 0) - (agora - e.t0) / 1000).toFixed(2);
    if (e.tipo === 'txt') return `<text class="bn-efx-t ${e.cls || ''}" x="${e.x.toFixed(1)}" y="${e.y.toFixed(1)}" text-anchor="middle" style="animation-delay:${atraso}s;font-size:${e.z || 1.6}em">${esc(e.txt)}</text>`;
    if (e.tipo === 'fumo') return `<circle class="bn-efx-f" cx="${e.x.toFixed(1)}" cy="${e.y.toFixed(1)}" r="${e.z || 6}" style="animation-delay:${atraso}s"/>`;
    const A_ = (e.tipo === 'respingo' || e.tipo === 'explosao') && MANIFEST.anims && MANIFEST.anims[e.tipo];
    if (A_) { const z = (e.z || 16) * 1.7, u = ASSETS[A_.file], dur = e.tipo === 'explosao' ? 0.75 : 0.95;   // faixa de 6 quadros em pixel art
      return `<g class="bn-efx-i spr" style="animation-delay:${atraso}s;animation-duration:${(dur + 0.25).toFixed(2)}s" transform="translate(${e.x.toFixed(1)},${e.y.toFixed(1)})"><svg x="${(-z / 2).toFixed(1)}" y="${(-z * 0.68).toFixed(1)}" width="${z.toFixed(1)}" height="${z.toFixed(1)}" viewBox="0 0 ${A_.fw} ${A_.fh}" overflow="hidden"><image class="bn-spr" href="${u}" width="${A_.fw * A_.frames}" height="${A_.fh}" style="--fim:${-(A_.frames - 1) * A_.fw}px;animation:bn-spr ${dur}s steps(${A_.frames}, jump-none) ${atraso}s both"/></svg></g>`; }
    const im = bnImg('efx_naval_' + BN_EFX[e.tipo]); if (!im) return ''; const z = e.z || 16;
    return `<g transform="translate(${e.x.toFixed(1)},${e.y.toFixed(1)}) rotate(${e.rot || 0})"><image class="bn-efx-i ${e.tipo}" href="${im}" x="${-z / 2}" y="${-z / 2}" width="${z}" height="${z}" style="animation-delay:${atraso}s;${e.tx != null ? `--dx:${e.tx.toFixed(1)}px;--dy:${e.ty.toFixed(1)}px` : ''}"/></g>`; }).join('')}</g>`;
}
function bnEfeito(tipo, x, y, extra) {
  BN.efx.push(Object.assign({ tipo, x, y, t0: Date.now() }, extra || {}));
  clearTimeout(BN.efxTimer); BN.efxTimer = setTimeout(bnEfxRedesenha, 3200);
}
function bnEfxRedesenha() { const g = $('#bn-efx'); if (g) g.outerHTML = bnEfeitosSVG(); }
function bnMapaSVG(b, mestre) {
  const W = b.mapa || 600, H = Math.round(W * 2 / 3), g = W <= 300 ? 15 : W <= 600 ? 30 : 60, fs = W / 62, k = W / 600;
  const sel = mestre && bnNav(b, b.sel), alvo = sel && bnAlvoDe(b, sel), daVez = b.vez >= 0 ? b.navios[b.vez] : null;
  let linhas = '';
  for (let x = g; x < W; x += g) linhas += `<line x1="${x}" y1="0" x2="${x}" y2="${H}"/>`;
  for (let y = g; y < H; y += g) linhas += `<line x1="0" y1="${y}" x2="${W}" y2="${y}"/>`;
  let ajuda = '';
  if (sel && sel.pv > 0) {
    const arma = BN_ARMAS[(sel.armas.find(a => a.q > 0 && BN_ARMAS[a.n] && !BN_ARMAS[a.n].arpao) || sel.armas.find(a => a.q > 0 && BN_ARMAS[a.n]) || {}).n];
    if (arma) {
      const [r1, r2] = arma.alc, pt = (ang, r) => { const a = (sel.dir + ang) * Math.PI / 180; return `${(sel.x + Math.sin(a) * r).toFixed(1)},${(sel.y - Math.cos(a) * r).toFixed(1)}`; };
      const leque = (a0, a1, r) => `<path class="bn-leque" d="M${sel.x},${sel.y} L${pt(a0, r)} A${r},${r} 0 0 1 ${pt(a1, r)} Z"/>`;
      if (!arma.arpao && b.lateral) ajuda += leque(45, 135, r2) + leque(225, 315, r2);   // onde o canhão alcança de verdade
      ajuda += `<circle class="bn-alc" cx="${sel.x}" cy="${sel.y}" r="${r1}"/><circle class="bn-alc max" cx="${sel.x}" cy="${sel.y}" r="${r2}"/>`;
    }
    if (alvo) { const ok = bnMira(b, sel, alvo).ok;
      ajuda += `<line class="bn-mira ${ok ? '' : 'nao'}" x1="${sel.x}" y1="${sel.y}" x2="${alvo.x}" y2="${alvo.y}"/><text class="bn-mira-t" x="${(sel.x + alvo.x) / 2}" y="${((sel.y + alvo.y) / 2 - fs * 0.4).toFixed(1)}" text-anchor="middle">${Math.round(bnDist(sel, alvo))} m</text>`; }
  }
  const presos = b.navios.filter(n => n.preso && bnNav(b, n.preso)).map(n => { const q = bnNav(b, n.preso); return `<line class="bn-corrente" x1="${n.x}" y1="${n.y}" x2="${q.x}" y2="${q.y}"/>`; }).join('');
  const cena = bnCena();
  return `<svg class="bn-mapa cena-${cena}" id="bn-mapa" viewBox="0 0 ${W} ${H}" data-w="${W}" style="font-size:${fs.toFixed(2)}px;--g:${g}px" role="img" aria-label="Mapa da batalha naval, visto de cima">
    <defs><pattern id="bn-onda" width="${g}" height="${g / 2}" patternUnits="userSpaceOnUse"><path d="M0,${g / 4} q${g / 8},-${g / 10} ${g / 4},0 t${g / 4},0 t${g / 4},0 t${g / 4},0" class="bn-onda"/></pattern>${bnDefsVivo(g)}</defs>
    ${bnMarSVG(W, H, g)}<g class="bn-grade">${linhas}</g>
    <g class="bn-bussola" transform="translate(${W - 58 * k},${30 * k}) scale(${k})"><circle r="20"/><text y="-23" text-anchor="middle">N</text>
      ${b.corrente.nivel ? `<path d="M0,12 L0,-10 M-5,-4 L0,-12 L5,-4" transform="rotate(${b.corrente.dir})"/>` : '<text y="4" text-anchor="middle">calmo</text>'}
      <text y="33" text-anchor="middle">${b.corrente.nivel ? `corrente ${bnBussola(b.corrente.dir).toLowerCase()}` : 'sem corrente'}</text></g>
    <g class="bn-regua" transform="translate(${10 * k},${H - 10 * k})"><line x1="0" y1="0" x2="${g}" y2="0"/><text x="${g / 2}" y="${-3 * k}" text-anchor="middle">${g} m</text></g>
    ${ajuda}${presos}${b.navios.map(n => bnNavioSVG(b, n, n === sel, n === daVez, fs)).join('')}${bnClimaSVG(W, H, g, cena)}${bnEfeitosSVG()}
  </svg>`;
}

/* dá para atirar? (regra da casa: canhão só pela lateral; o livro deixa a decisão com o Narrador) */
function bnMira(b, A, T, arma) {
  const W = BN_ARMAS[arma] || null, d = bnDist(A, T), lado = bnLado(A, T);
  if (W && d > W.alc[1]) return { ok: false, lado, d, por: `fora do alcance (${Math.round(d)} m, a arma chega a ${W.alc[1]} m)` };
  if (b.lateral && (!W || !W.arpao) && (lado === 'proa' || lado === 'popa')) return { ok: false, lado, d, por: `o alvo está pela ${lado}, e os canhões ficam nas laterais` };
  return { ok: true, lado, d, por: '' };
}

/* ───── painel do navio ───── */
function bnPainelNavio(b, n) {
  const st = estadoNavio(n.pv, n.pvMax), vmax = bnVelMax(n), daVez = b.vez >= 0 && b.navios[b.vez] === n, livre = b.vez < 0, f = n.feito || {};
  const outros = b.navios.filter(x => x !== n && x.pv > 0), alvo = bnAlvoDe(b, n), F = BN.form;
  const armas = n.armas.filter(a => a.q > 0 && BN_ARMAS[a.n]), corr = bnCorrente(b, n), passo = bnPasso(b, n), nos = bnNos(b, n);
  const feito = k => f[k] ? '<span class="bn-ok">feito</span>' : '';
  /* velocidade em botões: o livro deixa mudar no máximo 6 nós por manobra */
  const presets = [['Parar', 0], ['Devagar', Math.max(2, Math.round(vmax / 3))], ['Meio', Math.max(2, Math.round(vmax * 2 / 3))], ['Cheia', vmax]];
  const mira = alvo ? bnMira(b, n, alvo, (armas[0] || {}).n) : null;
  return `<section class="pap bn-card">
    <h2>${ic('mar:navio_pirata', 32)} <input class="bn-nome" value="${esc(n.nome)}" data-chg="bn-campo" data-k="nome" data-t="texto" aria-label="Nome do navio">
      <span class="tag ${st.cls}">${st.t}</span>${daVez ? '<span class="tag ouro">é a vez dele</span>' : ''}${n.ancora ? '<span class="tag">âncora no fundo</span>' : ''}${!n.mastro ? '<span class="tag ruim">sem mastro</span>' : ''}${n.preso && bnNav(b, n.preso) ? '<span class="tag ruim">preso por arpão</span>' : ''}</h2>
    <div class="bn-pv"><b>PV</b>${barrinha(n.pv, n.pvMax, n.pv <= n.pvMax / 2 ? 'ruim' : '')}<span>${n.pv}/${n.pvMax}</span>${n.par > 0 ? `<span class="tag" title="PV paralelos do Reparo Emergencial: apanham primeiro">+${n.par} do reparo</span>` : ''}
      <input id="bn-val" type="number" placeholder="0" aria-label="Valor" style="width:5em"><button class="bt ruim fino" data-act="bn-dano" title="O site tira o BR do navio antes">Dano</button><button class="bt bom fino" data-act="bn-conserto">Conserto</button></div>
    <p class="bn-anda">${n.pv <= 0 ? '<b class="ruim">Não navega mais (PV 0).</b>' : `Anda <b>${bnM(passo)} m</b> por rodada, rumo ao <b>${bnBussola(n.dir).toLowerCase()}</b>
      <small>${nos} nós${corr ? ` (${n.vel} do navio ${corr > 0 ? '+' : '−'} ${Math.abs(corr)} da corrente)` : ''}${vmax < n.velMax ? ` · máximo agora ${vmax}, o casco${!n.mastro ? ' e o mastro' : ''} tira${!n.mastro ? 'm' : ''} o resto` : ''}</small>`}</p>
    <p class="bn-nums">CR <b>${n.cr}${bnProt(n) ? '+' + bnProt(n) : ''}</b> · BR <b>${n.br}</b> (cada tiro perde ${n.br} de dano) · ${esc(n.tamanho)} · ${esc(n.madeira)}</p>

    <div class="bn-passo ${livre || daVez ? '' : 'fora'}">
      <h3><i>1</i> Manobra ${feito('man')}</h3>
      <div class="linha-bts bn-vel">${presets.map(([t, v]) => { const novo = clamp(v, n.vel - 6, n.vel + 6); return `<button class="bt fino ${n.vel === v ? 'on' : ''}" data-act="bn-vel" data-v="${v}" title="${v === novo ? '' : 'O livro deixa mudar no máximo 6 nós por manobra'}">${t}<small>${v === novo ? `${v} nós` : `→ ${novo} nós`}</small></button>`; }).join('')}</div>
      <div class="linha-bts"><button class="bt fino" data-act="bn-virar" data-g="-45" title="Virar para a esquerda">↶ 45° bombordo</button><button class="bt fino" data-act="bn-virar" data-g="45" title="Virar para a direita">45° estibordo ↷</button>
        <button class="bt fino" data-act="bn-ancora">${n.ancora ? 'Subir âncora' : 'Descer âncora (parar de vez)'}</button></div>

      <h3><i>2</i> Tiro ${feito('cmb')}</h3>
      ${armas.length && outros.length ? `<div class="bn-tiro">
        <label>Alvo <select id="bn-alvo" data-chg="bn-alvo">${outros.map(x => `<option value="${x.id}" ${alvo && x.id === alvo.id ? 'selected' : ''}>${esc(x.nome)}</option>`).join('')}</select></label>
        <label>Arma <select id="bn-arma" data-chg="bn-form" data-k="arma">${armas.map(a => `<option value="${esc(a.n)}" ${F.arma === a.n ? 'selected' : ''}>${esc(a.n)} ×${a.q} · até ${BN_ARMAS[a.n].alc[1]} m</option>`).join('')}</select></label>
        <label>Munição <select id="bn-mun" data-chg="bn-form" data-k="mun">${Object.entries(BN_MUN).map(([k, v]) => `<option value="${k}" ${F.mun === k ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select></label>
        <label>Quantos canhões <input id="bn-qtd" type="number" min="1" max="30" value="${(armas.find(a => a.n === F.arma) || armas[0]).q}" style="width:4em"></label>
        <label>Acima de 3 <select id="bn-estr" data-chg="bn-form" data-k="estr"><option value="bomb">Bombardeio (+dano)</option><option value="teste" ${F.estr === 'teste' ? 'selected' : ''}>Tiro de Teste (+3)</option></select></label>
        <label>Jogada <select id="bn-modo"><option value="">Normal</option><option value="vant">Vantagem</option><option value="desv">Desvantagem</option></select></label>
        <button class="bt ruim" data-act="bn-atirar">${ic('navios:canhao', 32)} Atirar</button></div>
        ${mira ? `<p class="bn-mira-info ${mira.ok ? '' : 'ruim'}">${esc(alvo.nome)} está a <b>${Math.round(mira.d)} m</b>, pela <b>${mira.lado}</b> · CR ${alvo.cr + bnProt(alvo)} · BR ${alvo.br}${mira.ok ? '' : ` · <b>não dá para atirar:</b> ${mira.por}. Vire o navio.`}</p>` : ''}`
        : `<p class="nota">${armas.length ? 'Não tem outro navio para mirar.' : 'Este navio não tem arma. Ponha uma em “Ficha do navio”.'}</p>`}
      ${outros.length && n.armas.some(a => a.n === 'Canhão de Energia' && a.q > 0) ? `<div class="linha-bts"><button class="bt ruim fino" data-act="bn-energia">Disparar o Canhão de Energia</button></div>` : ''}
      ${outros.length ? `<div class="linha-bts"><button class="bt fino" data-act="bn-colisao">Jogar o navio em cima do alvo</button>
        ${n.preso && bnNav(b, n.preso) ? '<button class="bt fino" data-act="bn-soltar">Soltar o arpão (CD 17)</button>' : ''}</div>` : ''}

      <h3><i>3</i> Fim do turno ${feito('mov')}</h3>
      <p class="nota">O navio anda sozinho ao encerrar. Use “andar antes” só se quiser chegar perto e aí atirar.</p>
      <div class="linha-bts"><button class="bt fino" data-act="bn-mover">Andar ${bnM(passo)} m antes</button>
        ${outros.length && !n.bando ? `<button class="bt fino" data-act="bn-auto" title="Para navio de figurante: o site vira ou acelera na direção do inimigo mais perto, atira com tudo que puder e passa a vez">Agir sozinho ▸</button>` : ''}
        ${!livre ? `<button class="bt bom" data-act="bn-prox">Encerrar o turno e passar a vez ▸</button>` : ''}</div>
    </div>

    <details class="caixa" data-bn-det="ficha" ${BN.det.ficha ? 'open' : ''}><summary>Ficha do navio, armas e posição</summary>
      <div class="bn-ficha"><label>Lado <select data-chg="bn-campo" data-k="lado" data-t="texto">${[['bando', 'Bando'], ['inimigo', 'Inimigo'], ['neutro', 'Neutro']].map(([k, v]) => `<option value="${k}" ${n.lado === k ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
        <label>Aparência <select data-chg="bn-campo" data-k="sprite" data-t="texto">${Object.entries(BN_SPR).map(([k, v]) => `<option value="${k}" ${bnSprDe(n) === k ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
        ${[['cr', 'CR'], ['br', 'BR'], ['pvMax', 'PV máx.'], ['velMax', 'Vel. máx. (nós)'], ['vel', 'Vel. agora (nós)'], ['pre', 'Presença do capitão'], ['des', 'Destreza do atirador'], ['von', 'Vontade (salvaguarda)']]
          .map(([k, r]) => `<label>${r} <input type="number" value="${n[k]}" data-chg="bn-campo" data-k="${k}" style="width:5em"></label>`).join('')}
        <label>Protegendo <select data-chg="bn-campo" data-k="protege">${[0, 1, 2, 3].map(v => `<option ${v === (n.protege || 0) ? 'selected' : ''}>+${v}</option>`).join('')}</select></label></div>
      <p class="nota">Protegendo: um personagem de 8º nível ou mais pula o turno dele e dá +1 na CR do navio, até +3 (LJ p. 314).</p>
      <ul class="bn-armas">${n.armas.map((a, i) => `<li>${esc(a.n)} <small>${BN_ARMAS[a.n] ? `+${BN_ARMAS[a.n].bonus} · ${BN_ARMAS[a.n].alc.join('/')} m` : ''}</small><span class="inv-q"><button class="bt-ic mini" data-act="bn-arma-q" data-i="${i}" data-d="-1" aria-label="Menos">−</button><b>${a.q}</b><button class="bt-ic mini" data-act="bn-arma-q" data-i="${i}" data-d="1" aria-label="Mais">+</button></span></li>`).join('')}</ul>
      <div class="linha-bts"><select id="bn-arma-nova">${Object.keys(BN_ARMAS).map(a => `<option>${esc(a)}</option>`).join('')}</select><button class="bt fino" data-act="bn-arma-add">Pôr arma</button></div>
      <p class="nota">Arrumar sem gastar ação (antes da batalha): arraste o navio no mapa ou gire aqui.</p>
      <div class="linha-bts"><button class="bt fino" data-act="bn-girar" data-g="-15">↶ 15°</button><button class="bt fino" data-act="bn-girar" data-g="15">15° ↷</button>
        <button class="bt fino" data-act="bn-mastro">${n.mastro ? 'Marcar mastro destruído' : 'Consertar o mastro'}</button>
        ${n.bando ? '<button class="bt fino" data-act="bn-gravar-navio">Gravar este PV na aba Navio</button>' : ''}<button class="bt fino ruim" data-act="bn-tirar">Tirar do mapa</button></div></details>
  </section>`;
}

/* ───── registro, com as rodadas separadas ───── */
function bnLogHTML(b, mestre) {
  if (!b.log.length) return '<p class="nota">Nada ainda.</p>';
  let r = null;
  const itens = b.log.map(l => { const cab = l.r !== r ? `<li class="bn-r">${l.r ? 'Rodada ' + l.r : 'Antes da batalha'}</li>` : ''; r = l.r; return cab + `<li class="bn-l ${l.tipo}">${l.html}</li>`; }).join('');
  return `<ol class="bn-logl">${itens}</ol>${mestre ? '<div class="linha-bts"><button class="bt fino ruim" data-act="bn-log-limpar">Limpar o registro</button></div>' : ''}`;
}

VIEWS.naval = {
  titulo: 'Batalha naval', icone: 'navios:canhao', cena: 'cat_viagem', chaves: ['navio', 'naval', 'estado'], visivel: () => souMestre() || bnPublicado(),
  ao(ch) { const a = document.activeElement; if (a && /INPUT|TEXTAREA|SELECT/.test(a.tagName) && $('#vista').contains(a)) return false; },
  depois(raiz) { bnDepois(raiz); },
  render() {
    const mestre = souMestre();
    if (!mestre && !bnPublicado()) return `<div class="tela-trancada">${ic('mesa:cadeado', 128)}<h1>Batalha naval</h1><p class="nota">Esta parte ainda está em obra. O mestre mostra quando houver uma batalha.</p></div>`;
    const b = bnVendo(), sel = mestre && bnNav(b, b.sel), daVez = b.vez >= 0 ? b.navios[b.vez] : null;
    const lista = `<ul>${b.navios.map((n, i) => `<li class="${n.id === b.sel ? 'on' : ''} ${i === b.vez ? 'vez' : ''} ${n.pv <= 0 ? 'morto' : ''}">${mestre ? `<button data-act="bn-sel" data-id="${n.id}">` : '<div>'}<i class="bn-pt bn-${n.lado}"></i><b>${esc(n.nome)}</b>
      <small>${n.ini != null ? `iniciativa ${n.ini} · ` : ''}PV ${n.pv}/${n.pvMax} · ${bnM(bnPasso(b, n))} m por rodada</small>${barrinha(n.pv, n.pvMax, n.pv <= n.pvMax / 2 ? 'ruim' : '')}${mestre ? '</button>' : '</div>'}</li>`).join('') || '<li class="nota">Nenhum navio ainda.</li>'}</ul>`;
    const ult = b.log[0];
    return `<div class="bn-v ${BN.cinema ? 'cinema' : ''}">
      ${BN.cinema ? `<button class="bt bn-sai-cinema" data-act="bn-cinema">Sair do modo cinema (Esc)</button>${ult ? `<p class="bn-legenda">${ult.html.split('<br>')[0]}</p>` : ''}` : ''}
      <header class="quadro-cab"><span class="tabua"><span>${ic('navios:canhao', 32)} Batalha naval</span></span>
        <p>${b.rodada ? `Rodada <b>${b.rodada}</b>${daVez ? ` · é a vez de <b>${esc(daVez.nome)}</b>` : ''}` : mestre ? 'Ponha os navios, arraste para a posição e role a iniciativa.' : 'A batalha ainda não começou.'}</p>
        ${mestre ? `<div class="linha-bts"><button class="bt" data-act="bn-ini">${ic('mesa:d20', 32)} ${b.rodada ? 'Rolar iniciativa de novo' : 'Rolar iniciativa'}</button>
          <button class="bt fino" data-act="bn-evento">Evento do mar (d6)</button><button class="bt fino ruim" data-act="bn-limpar">Limpar tudo</button></div>` : ''}
        <div class="linha-bts bn-imersao"><button class="bt fino" data-act="bn-cinema" title="O mapa ocupa a tela inteira, com a última ação como legenda">Modo cinema</button>
          <label class="ck" title="Canhão, impacto, respingo e sino. Vale só neste aparelho."><input type="checkbox" data-chg="bn-som" ${bnSomLigado() ? 'checked' : ''}> Sons da batalha</label></div></header>

      ${mestre ? `<div class="bn-chaves">
        <label class="ck"><input type="checkbox" data-chg="bn-publico" ${b.publico ? 'checked' : ''}> <b>Mostrar esta aba para os jogadores</b> <small>(eles veem o mapa e o registro, escolhem um posto no navio e agem: leme, canhões, reparos)</small></label>
        <label class="ck"><input type="checkbox" data-chg="bn-lateral" ${b.lateral ? 'checked' : ''}> <b>Canhão só atira pela lateral</b> <small>(regra da casa; o arpão atira para qualquer lado)</small></label></div>` : ''}

      <details class="caixa bn-ajuda" data-bn-det="ajuda" ${BN.det.ajuda ? 'open' : ''}><summary>Como funciona (leia uma vez)</summary><ul class="lista">
        <li>Isto vale <b>só quando dois navios se enfrentam</b>. Viajar de uma ilha para outra continua na aba Viagem.</li>
        <li><b>O navio nunca para.</b> No fim do turno dele, ele anda sozinho no rumo em que está apontado. Para parar de vez, só descendo a âncora.</li>
        <li>Cada rodada dura <b>6 segundos</b>. A velocidade vira distância: cada 2 nós andam 1,5 m por rodada. O site já mostra os metros prontos.</li>
        <li>No turno de cada navio: <b>uma manobra</b> (virar, mudar a velocidade ou a âncora) e <b>um tiro</b>. Depois ele anda.</li>
        <li>Os personagens agem na ordem normal, na aba Combate. Quem está no leme ou nos canhões é que faz o navio agir.</li>
      </ul></details>

      <div class="bn-grade-v">
        <div class="bn-esq">
          ${mestre ? `<div class="bn-ctl">
            <label>Mostrar <select data-chg="bn-mapa">${BN_ZOOM.map(([v, t, d]) => `<option value="${v}" ${b.mapa === v ? 'selected' : ''}>${t} · ${v >= 1000 ? '1,2 km' : v + ' m'} (${d})</option>`).join('')}</select></label>
            <label>Corrente <select data-chg="bn-corr-n">${[0, 1, 2, 3].map(v => `<option value="${v}" ${b.corrente.nivel === v ? 'selected' : ''}>${v ? `${BN_CORRENTE[v]} nós (nível ${v})` : 'parada (Calm Belt)'}</option>`).join('')}</select></label>
            <label>indo para <select data-chg="bn-corr-d">${BN_DIRS.map(([t, g]) => `<option value="${g}" ${b.corrente.dir === g ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
            <span class="bn-so">Ainda longe: <button class="bt fino" data-act="bn-navegar" data-n="1">avançar 1 rodada</button><button class="bt fino" data-act="bn-navegar" data-n="10">avançar 1 minuto</button></span></div>` : ''}
          ${bnMapaSVG(b, mestre)}
          <p class="nota bn-leg">${mestre ? '<b>Arraste</b> os navios para posicionar. <b>Clique</b> para escolher. O contorno claro à frente mostra onde cada navio estará no fim da rodada. Os círculos são o alcance da arma do navio escolhido; a área clara é onde os canhões dele apontam.' : 'O contorno claro à frente mostra onde cada navio estará no fim da rodada. A seta no alto é a corrente do mar.'}</p>
        </div>
        <aside class="bn-dir">
          <section class="pap bn-ordem"><h2>${b.rodada ? 'Ordem dos navios' : 'Navios'}</h2>${lista}
            ${mestre ? `<details class="caixa" data-bn-det="novo" ${!b.navios.length || BN.det.novo ? 'open' : ''}><summary>Pôr navio no mapa</summary>
              <div class="bn-ficha"><label>Nome <input id="bn-n-nome" maxlength="30" placeholder="ex.: Navio da Marinha"></label>
                <label>Lado <select id="bn-n-lado"><option value="inimigo">Inimigo</option><option value="bando">Bando</option><option value="neutro">Neutro</option></select></label>
                <label>Aparência <select id="bn-n-spr"><option value="">Automática (inimigo: pirata)</option>${Object.entries(BN_SPR).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></label>
                <label>Tamanho <select id="bn-n-tam">${Object.keys(TAM_NAVIO).map(t => `<option>${t}</option>`).join('')}</select></label>
                <label>Madeira <select id="bn-n-mad">${Object.keys(MADEIRA).map(t => `<option>${t}</option>`).join('')}</select></label></div>
              <div class="linha-bts"><button class="bt bom fino" data-act="bn-add">Pôr no mapa</button>${b.navios.some(n => n.bando) ? '' : `<button class="bt fino" data-act="bn-add-bando">${ic('mar:navio_pirata', 32)} Pôr o navio do bando</button>`}</div>
              <p class="nota">O tamanho preenche PV, velocidade e canhões; a madeira preenche CR e BR (LJ p. 316 e 320).</p></details>` : ''}</section>
          ${mestre ? (sel ? bnPainelNavio(b, sel) : '<section class="pap"><p class="nota">Escolha um navio no mapa ou na lista.</p></section>') : ''}
        </aside>
      </div>
      <section class="pap bn-log"><h2>Registro da batalha</h2>${bnLogHTML(b, mestre)}</section>
      ${mestre ? `<details class="caixa" data-bn-det="regras" ${BN.det.regras ? 'open' : ''}><summary>De onde vem cada regra</summary><ul class="lista">
        <li><b>Do livro</b> (LJ p. 314–317): iniciativa pela Presença do capitão; movimento contínuo (2 nós = 1,5 m por rodada); manobra de virar até 45°, mudar até 6 nós e âncora; tiro com d20 + Presença ou Destreza + bônus da arma contra a CR; desvantagem além do alcance normal; um tiro por canhão e, acima de 3, Bombardeio ou Tiro de Teste; BR da madeira tirando dano; casco danificado tirando velocidade; colisão acima de 14 nós; proteger o navio até +3 de CR.</li>
        <li><b>Regra da casa, você decide</b>: o canhão só atira pela lateral (o livro só diz que ele precisa estar “apontado”, e deixa com o Narrador) e o mastro destruído corta a velocidade máxima pela metade (o livro não diz o que acontece). A chave da lateral está no topo; se quiser mudar o mastro, me avise.</li>
        <li><b>Também do livro</b>: Canhão de Energia (linha de 500 m, 50d12, Salvaguarda CD 18; LJ p. 315–316), Reparo Emergencial do Carpinteiro com PV paralelos (LJ p. 140 e 314), Homem das Armas com +3 nos tiros (LJ p. 299) e o aviso de efetivo mínimo (LJ p. 300).</li>
        <li><b>Regra da casa</b>: os postos dos jogadores (quem está em Canhões rola o tiro, quem está no Leme pede a manobra) e o botão “Agir sozinho” para navio de figurante. O livro só diz quem pode fazer o quê; os botões são nossos.</li></ul></details>` : ''}
    </div>`;
  }
};
NAV.mestre.forEach(g => { if (g[0] === 'Mar e progresso') g[1].push('naval'); });
NAV.jogador[0][1].push('naval');

/* ───── arrastar e escolher no mapa ───── */
function bnPonto(ev) { const svg = $('#bn-mapa'); if (!svg) return null; const p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; const m = svg.getScreenCTM(); return m ? p.matrixTransform(m.inverse()) : null; }
document.addEventListener('pointerdown', ev => {
  const g = ev.target.closest && ev.target.closest('.bn-navio'); if (!g || !souMestre()) return;
  const p = bnPonto(ev), n = bnNav(bn(), g.dataset.bn); if (!p || !n) return;
  BN.arrasto = { id: n.id, g, dx: n.x - p.x, dy: n.y - p.y, x0: ev.clientX, y0: ev.clientY, mexeu: false, x: n.x, y: n.y }; ev.preventDefault();
});
document.addEventListener('pointermove', ev => {
  const a = BN.arrasto; if (!a) return;
  if (!a.mexeu && Math.hypot(ev.clientX - a.x0, ev.clientY - a.y0) < 4) return;
  const p = bnPonto(ev), svg = $('#bn-mapa'); if (!p || !svg) return;
  const W = +svg.dataset.w, H = Math.round(W * 2 / 3); a.mexeu = true; a.x = clamp(p.x + a.dx, 0, W); a.y = clamp(p.y + a.dy, 0, H);
  a.g.setAttribute('transform', `translate(${a.x.toFixed(1)},${a.y.toFixed(1)})`);
});
document.addEventListener('pointerup', () => {
  const a = BN.arrasto; if (!a) return; BN.arrasto = null;
  if (a.mexeu && BN.pos && BN.pos[a.id]) { BN.pos[a.id].x = Math.round(a.x * 10) / 10; BN.pos[a.id].y = Math.round(a.y * 10) / 10; }
  bnMuda(b => { const n = bnNav(b, a.id); if (!n) return; if (a.mexeu) { n.x = Math.round(a.x * 10) / 10; n.y = Math.round(a.y * 10) / 10; } b.sel = a.id; }, !a.mexeu);
});
document.addEventListener('toggle', e => { const d = e.target; if (d && d.dataset && d.dataset.bnDet) BN.det[d.dataset.bnDet] = d.open; }, true);

/* ───── ações ───── */
ACT['bn-sel'] = el => bnMuda(b => { b.sel = el.dataset.id; }, true);
ACT['bn-form'] = el => { BN.form[el.dataset.k] = el.value; if (el.dataset.k === 'arma') { const n = bnSel(bn()), a = n && n.armas.find(x => x.n === el.value), q = $('#bn-qtd'); if (a && q) q.value = a.q; } };
ACT['bn-alvo'] = el => { BN.alvo = el.value; App.render(); };
ACT['bn-lateral'] = el => bnMuda(b => { b.lateral = !!el.checked; });
ACT['bn-mapa'] = el => bnMuda(b => { const v = +el.value, o = b.mapa || 600; b.mapa = v; b.navios.forEach(n => { n.x = clamp(v / 2 + (n.x - o / 2), 0, v); n.y = clamp(v / 3 + (n.y - o / 3), 0, v * 2 / 3); }); });
ACT['bn-corr-n'] = el => bnMuda(b => { b.corrente.nivel = +el.value; });
ACT['bn-corr-d'] = el => bnMuda(b => { b.corrente.dir = +el.value; });
ACT['bn-log-limpar'] = () => confirmar('Limpar o registro da batalha? Os navios e as posições continuam.', () => bnMuda(b => { b.log = []; }), { ok: 'Limpar' });
ACT['bn-add'] = () => {
  const nome = $('#bn-n-nome').value.trim() || 'Navio', lado = $('#bn-n-lado').value, tamanho = $('#bn-n-tam').value, madeira = $('#bn-n-mad').value, sprite = $('#bn-n-spr').value;
  bnMuda(b => { const k = b.navios.length, W = b.mapa || 600, n = bnCriar({ nome, lado, sprite, tamanho, madeira, x: W * (lado === 'bando' ? 0.3 : 0.7), y: W * 2 / 3 * (0.3 + 0.18 * (k % 3)), dir: lado === 'bando' ? 90 : 270 }); b.navios.push(n); b.sel = n.id; });
};
ACT['bn-add-bando'] = () => {
  const v = navio(), t = TAM_NAVIO[v.tamanho] || TAM_NAVIO.Pequeno;
  const armas = (v.armas || []).filter(a => BN_ARMAS[a.n]).map(a => ({ n: a.n, q: a.q || 1 }));
  bnMuda(b => { const W = b.mapa || 600, n = bnCriar({ nome: v.nome || 'Navio do bando', lado: 'bando', sprite: 'mercante', bando: true, tamanho: v.tamanho, madeira: v.madeira, cr: num(v.cr) || 10, br: num(v.br) || 0, pv: num(v.pv) || 0, pvMax: num(v.pvMax) || t.pv,
    velMax: num(v.vel) || t.vel, vel: Math.min(num(v.vel) || t.vel, 6), armas: armas.length ? armas : [{ n: 'Canhão Comum', q: 0 }], x: W * 0.3, y: W / 3, dir: 90 }); b.navios.push(n); b.sel = n.id; });
  toast('Navio do bando no mapa, com os números da aba Navio. Confira a Presença do capitão e a Destreza do atirador na ficha do navio.', { tempo: 7000 });
};
ACT['bn-tirar'] = () => { const n = bnSel(bn()); if (!n) return; confirmar(`Tirar <b>${esc(n.nome)}</b> do mapa?`, () => bnMuda(b => { const i = b.navios.findIndex(x => x.id === n.id); b.navios.splice(i, 1); if (b.vez >= b.navios.length) b.vez = b.navios.length ? 0 : -1; else if (i < b.vez) b.vez--; b.navios.forEach(x => { if (x.preso === n.id) x.preso = null; }); b.sel = null; }), { ok: 'Tirar' }); };
ACT['bn-limpar'] = () => confirmar('Apagar a batalha inteira (navios, posições e registro)?', () => bnMuda((b, s) => { const pub = b.publico; s.naval = bnNovo(); s.naval.publico = pub; }), { perigo: true, ok: 'Apagar' });
ACT['bn-campo'] = el => bnMuda(b => { const n = bnSel(b); if (!n) return; const k = el.dataset.k; n[k] = el.dataset.t === 'texto' ? (el.value.trim() || n[k]) : (num(el.value) ?? n[k]);
  if (k === 'pvMax') n.pv = Math.min(n.pv, n.pvMax); if (k === 'protege') n.protege = clamp(n.protege, 0, 3); n.vel = clamp(n.vel, 0, bnVelMax(n)); });
ACT['bn-arma-q'] = el => bnMuda(b => { const n = bnSel(b), a = n && n.armas[+el.dataset.i]; if (!a) return; a.q = Math.max(0, (a.q || 0) + +el.dataset.d); if (!a.q && n.armas.length > 1) n.armas.splice(+el.dataset.i, 1); });
ACT['bn-arma-add'] = () => { const nome = $('#bn-arma-nova').value; bnMuda(b => { const n = bnSel(b); if (!n) return; const a = n.armas.find(x => x.n === nome); if (a) a.q++; else n.armas.push({ n: nome, q: 1 }); }); };
ACT['bn-girar'] = el => bnMuda(b => { const n = bnSel(b); if (n) n.dir = bnAng(n.dir + +el.dataset.g); });
ACT['bn-mastro'] = () => bnMuda(b => { const n = bnSel(b); if (!n) return; n.mastro = !n.mastro; n.vel = clamp(n.vel, 0, bnVelMax(n));
  bnLog(b, n.mastro ? `${bnNome(n)} conserta o mastro.` : `${bnNome(n)} fica <b>sem mastro</b>: a velocidade máxima cai pela metade, para ${bnVelMax(n)} nós (regra da casa).`); });
ACT['bn-dano'] = () => { const d = num($('#bn-val').value) || 0; if (!d) return; bnMuda(b => { const n = bnSel(b); if (!n) return; const f = Math.max(0, d - n.br), vivo = n.pv > 0, noPar = Math.min(n.par || 0, f); if (noPar) n.par -= noPar; n.pv = Math.max(0, n.pv - (f - noPar)); n.vel = clamp(n.vel, 0, bnVelMax(n));
  if (f) bnFx(b, { k: 'golpe', x: n.x, y: n.y, dano: f }); if (vivo && n.pv <= 0) bnFx(b, { k: 'afundou', x: n.x, y: n.y, nome: n.nome, d: 0.5 });
  bnLog(b, `${bnNome(n)} leva ${d} de dano − BR ${n.br} = <b>${f}</b>. PV ${n.pv}/${n.pvMax}${n.pv <= 0 ? ' · <b class="ruim">não navega mais</b>' : ''}.`); }); };
ACT['bn-conserto'] = () => { const d = num($('#bn-val').value) || 0; if (!d) return; bnMuda(b => { const n = bnSel(b); if (!n) return; n.pv = Math.min(n.pvMax, n.pv + d); bnLog(b, `${bnNome(n)} recupera <b>${d}</b> PV. PV ${n.pv}/${n.pvMax}.`); }); };
ACT['bn-gravar-navio'] = () => { const n = bnSel(bn()); if (!n) return; gravarNavio({ pv: n.pv }, `PV depois da batalha naval: ${n.pv}/${n.pvMax}`); toast('PV gravado na aba Navio.', { tipo: 'bom' }); };

function bnPode(b, n, k, nomeAcao) {
  if (n.pv <= 0) { toast('Este navio não navega mais (PV 0).', { tipo: 'ruim' }); return false; }
  if (b.vez >= 0 && (n.feito || {})[k]) { toast(`${esc(n.nome)} já fez isso neste turno. ${nomeAcao}`, { tempo: 6000 }); return false; }
  return true;
}
const bnMarca = (b, n, k) => { if (b.vez >= 0) (n.feito = n.feito || {})[k] = true; };
ACT['bn-virar'] = el => { const g = +el.dataset.g; bnMuda(b => { const n = bnSel(b); if (!n || !bnPode(b, n, 'man', 'O livro dá uma manobra por turno (LJ p. 314). Para arrumar a posição sem gastar ação, use a ficha do navio.')) return;
  n.dir = bnAng(n.dir + g); bnMarca(b, n, 'man'); bnLog(b, `${bnNome(n)} vira 45° para ${g < 0 ? 'bombordo' : 'estibordo'}: agora vai para o <b>${bnBussola(n.dir).toLowerCase()}</b>.`); }); };
ACT['bn-vel'] = el => { const alvo = +el.dataset.v; bnMuda(b => {
  const n = bnSel(b); if (!n || !bnPode(b, n, 'man', 'O livro dá uma manobra por turno (LJ p. 314).')) return;
  const vmax = bnVelMax(n), novo = clamp(clamp(alvo, 0, vmax), n.vel - 6, n.vel + 6);
  if (novo === n.vel) return toast('A velocidade já é essa.');
  let extra = '';
  if (n.ancora && novo > 0) { const q = Math.max(1, Math.ceil(novo / 6)), d = bnDanoR(`${8 * q}d10`), f = Math.max(0, d - n.br); n.pv = Math.max(0, n.pv - f);
    extra = ` <b class="ruim">Com a âncora no fundo:</b> ${8 * q}d10 = ${d} − BR ${n.br} = <b>${f}</b> de dano (PV ${n.pv}/${n.pvMax}). A cada 80 de dano da âncora, role Vontade (Sorte): 5 ou menos e ela se solta.`; }
  bnLog(b, `${bnNome(n)} ${novo > n.vel ? 'acelera' : 'desacelera'}: ${n.vel} → <b>${novo} nós</b> (${bnM(novo * 0.75)} m por rodada)${novo !== alvo ? ' — o livro deixa mudar só 6 nós por manobra' : ''}.${extra}`);
  n.vel = novo; bnMarca(b, n, 'man'); }); };
ACT['bn-ancora'] = () => bnMuda(b => { const n = bnSel(b); if (!n || !bnPode(b, n, 'man', 'O livro dá uma manobra por turno (LJ p. 314).')) return;
  n.ancora = !n.ancora; bnMarca(b, n, 'man'); if (n.ancora && b.vez < 0) n.vel = 0;
  bnLog(b, n.ancora ? `${bnNome(n)} desce a âncora: para de vez no fim do turno.` : `${bnNome(n)} sobe a âncora. Agora precisa de manobras para ganhar velocidade.`); });

/* anda uma rodada. Preso por arpão: não passa dos 90 m da corrente (LJ p. 316) */
function bnAndar(b, n) {
  if (n.pv <= 0) return 0;
  const v = bnNos(b, n), q = n.preso && bnNav(b, n.preso), a = n.dir * Math.PI / 180, W = b.mapa || 600, H = W * 2 / 3;
  let passo = v * 0.75, nx = n.x + Math.sin(a) * passo, ny = n.y - Math.cos(a) * passo, obs = '';
  if (q && Math.hypot(nx - q.x, ny - q.y) > 90 && Math.hypot(nx - q.x, ny - q.y) > bnDist(n, q)) {
    if (q.ancora || !q.vel) { nx = n.x; ny = n.y; passo = 0; obs = ' (preso pela corrente do arpão: não sai dos 90 m)'; }
    else { const perde = 2 * (Object.keys(TAM_NAVIO).indexOf(q.tamanho) + 1); passo = Math.max(0, v - perde) * 0.75; nx = n.x + Math.sin(a) * passo; ny = n.y - Math.cos(a) * passo; obs = ` (corrente do arpão: −${perde} nós)`; }
  }
  n.x = clamp(nx, 0, W); n.y = clamp(ny, 0, H);
  const perto = b.navios.find(o => o !== n && o.pv > 0 && bnDist(n, o) < ((BN_COMP[n.tamanho] || 16) + (BN_COMP[o.tamanho] || 16)) * 0.3);
  if (perto) obs += ` <b>encostou em ${esc(perto.nome)}</b>${n.vel > 14 ? ': acima de 14 nós, use “jogar o navio em cima”' : ' (14 nós ou menos: sem dano)'}.`;
  n._obs = obs; return passo;
}
ACT['bn-mover'] = () => bnMuda(b => { const n = bnSel(b); if (!n || !bnPode(b, n, 'mov', 'Ele já andou nesta rodada.')) return; const p = bnAndar(b, n); bnMarca(b, n, 'mov');
  bnLog(b, `${bnNome(n)} anda <b>${bnM(p)} m</b>${n._obs || ''}.`); delete n._obs; });
ACT['bn-navegar'] = el => { const q = +el.dataset.n; bnMuda(b => { if (!b.navios.length) return; const obs = [];
  for (let i = 0; i < q; i++) b.navios.forEach(n => { bnAndar(b, n); if (n.ancora) n.vel = 0; if (n._obs && i === q - 1) obs.push(esc(n.nome) + n._obs); delete n._obs; });
  if (b.rodada) b.rodada += q;
  bnLog(b, `Os navios se aproximam: ${q} rodada${q > 1 ? 's' : ''} (${q * 6} segundos), sem turno de ninguém.${obs.length ? ' ' + obs.join(' ') : ''}`, 'passa'); }); };

ACT['bn-ini'] = () => bnMuda(b => {
  if (!b.navios.length) return toast('Ponha os navios primeiro.');
  const selId = b.sel; b.navios.forEach(n => { n._d = rnd(20); n.ini = n._d + (n.pre || 0); n.feito = {}; n.protege = 0; });
  b.navios.sort((x, y) => y.ini - x.ini || (y.pre || 0) - (x.pre || 0));
  b.rodada = 1; b.vez = b.navios.findIndex(n => n.pv > 0); b.sel = b.vez >= 0 ? b.navios[b.vez].id : selId;
  bnLog(b, `Iniciativa (Teste de Presença do capitão): ${b.navios.map(n => `${bnNome(n)} ${n._d}${sg(n.pre || 0)} = <b>${n.ini}</b>`).join(' · ')}. Empate: você decide.`, 'passa');
  if (b.vez >= 0) bnLog(b, `▸ Começa o turno de ${bnNome(b.navios[b.vez])}.`, 'passa');
  b.navios.forEach(n => delete n._d); Som.tocar('dado'); bnFx(b, { k: 'inicio' });
});
ACT['bn-prox'] = () => bnMuda(b => {
  if (b.vez < 0) return; const n = b.navios[b.vez];
  if (n && n.pv > 0 && !(n.feito || {}).mov) { const p = bnAndar(b, n); if (p > 0 || n._obs) bnLog(b, `${bnNome(n)} segue em frente: <b>${bnM(p)} m</b> para o ${bnBussola(n.dir).toLowerCase()}${n._obs || ''}.`); delete n._obs; }
  if (n && n.ancora && n.vel) { n.vel = 0; bnLog(b, `${bnNome(n)} para de vez: âncora no fundo.`); }
  let i = b.vez, voltas = 0;
  const rodAntes = b.rodada;
  do { i++; if (i >= b.navios.length) { i = 0; b.rodada++; } voltas++; } while (b.navios[i].pv <= 0 && voltas <= b.navios.length);
  bnFx(b, b.rodada !== rodAntes ? { k: 'rodada', n: b.rodada } : { k: 'vez' });
  b.vez = i; const p = b.navios[i]; p.feito = {}; p.protege = 0; b.sel = p.id; BN.alvo = null;
  bnLog(b, `▸ Agora é a vez de ${bnNome(p)}.`, 'passa');
});
ACT['bn-evento'] = () => bnMuda(b => { const d = rnd(6), e = BN_EVENTOS[d - 1], dur = rnd(6); Som.tocar('dado'); bnFx(b, { k: 'evento', nome: e[0] });
  bnLog(b, `<b>Evento do mar</b> (d6 = ${d}): <b>${e[0]}</b>. ${e[1]} Dura ${dur * 10} minutos ou ${dur} hora${dur > 1 ? 's' : ''} (d6 = ${dur}, GN p. 70).`, 'evento'); });

/* ───── o tiro ───── */
/* cada tiro vira um "evento de efeito" guardado no estado da batalha: assim o mestre e os jogadores veem e ouvem a mesma coisa */
function bnTiroEfx(b, A, T, ok, W, mun, i, crit, dano) {
  bnFx(b, { k: 'tiro', ax: A.x, ay: A.y, tx: T.x, ty: T.y, ok: !!ok, crit: !!crit, i, dano: dano == null ? null : dano, proj: W.arpao ? 'arpao' : 'bala', hit: mun === 'acorrentada' && !W.arpao ? 'corrente' : 'explosao' });
}
ACT['bn-atirar'] = () => {
  const o = { arma: $('#bn-arma').value, mun: $('#bn-mun').value, qtd: clamp(num($('#bn-qtd').value) || 1, 1, 30), estr: $('#bn-estr').value, modo: $('#bn-modo').value, alvo: $('#bn-alvo').value, de: bn().sel };
  if (typeof bnPedirTiro === 'function' && bnPedirTiro(o)) return;   // os artilheiros a postos rolam (79c-naval-postos.js)
  bnAtirar(o);
};
function bnAtirar(o) {
  const { arma, mun, qtd, estr, modo: modoPedido, alvo: alvoId } = o;
  bnMuda(b => {
    const A = o.de ? bnNav(b, o.de) : bnSel(b), T = bnNav(b, alvoId), W = BN_ARMAS[arma]; if (!A || !T || !W) return;
    if (!bnPode(b, A, 'cmb', 'O livro dá um tiro por turno do navio (LJ p. 314).')) return;
    const m = bnMira(b, A, T, arma);
    if (!m.ok) return toast(`Não dá para atirar: ${esc(m.por)}.`, { tipo: 'ruim', tempo: 6000 });
    const tem = (A.armas.find(a => a.n === arma) || {}).q || 0, q = Math.min(qtd, tem), d = m.d, crT = T.cr + bnProt(T), hda = bnHda(A);
    if (!q) return toast('Esse navio não tem essa arma.');
    if (mun === 'estilhacos' && !W.arpao) {
      if (d > 30) return toast(`Estilhaços só chegam a 30 m (o alvo está a ${Math.round(d)} m).`, { tipo: 'ruim' });
      bnMarca(b, A, 'cmb');
      return bnLog(b, `${bnNome(A)} dispara <b>estilhaços</b> em ${bnNome(T)} (cone de ${d <= 15 ? 15 : 30} m). Cada criatura no convés faz Salvaguarda de Destreza CD 19: falhou, leva <b>${bnDanoR('6d6')}</b> Perfurante; passou, nada. O navio não leva dano.`);
    }
    const longe = d > W.alc[0], modo = longe ? (modoPedido === 'vant' ? '' : 'desv') : modoPedido;
    const base = Math.max(A.pre || 0, A.des || 0) + W.bonus + hda, n3 = Math.min(q, 3), extras = Math.max(0, q - 3);
    const bonusTeste = Array(n3).fill(0); if (estr === 'teste') for (let i = 0; i < extras; i++) bonusTeste[i % n3] += 3;
    const dadoBase = W.arpao ? '4d10' : '3d10', danoDe = crit => { const t = bnDanoR(dadoBase, crit); return W.arpao ? t : Math.floor(t * W.mult); };
    const linhas = [], acertos = []; let prendeu = false, mastro = null;
    for (let i = 0; i < n3; i++) {
      const r = bnD20(modo), tot = r.nat + base + bonusTeste[i], crit = r.nat === 20, ok = crit || (r.nat !== 1 && tot >= crT);
      let vDano = null;
      let t = `tiro ${i + 1}: ${r.txt}${sg(base)}${bonusTeste[i] ? '+' + bonusTeste[i] : ''} = <b>${tot}</b> ${ok ? (crit ? '<b class="bom">crítico!</b>' : '<b class="bom">acerta</b>') : '<span class="ruim">erra</span>'}`;
      if (ok) {
        if (mun === 'acorrentada' && !W.arpao) { if (mastro === null) { const sv = rnd(20), st = sv + (T.von || 0); mastro = st < 17; t += ` · Salvaguarda de Estrutura de ${esc(T.nome)}: ${sv}${sg(T.von || 0)} = ${st} contra CD 17 → ${mastro ? '<b class="ruim">mastro destruído</b>' : 'aguentou'}`; } }
        else { const v = danoDe(crit); acertos.push(v); vDano = Math.max(0, v - T.br); t += ` · dano ${v}${W.mult !== 1 && !W.arpao ? (W.mult === 2 ? ' (dobro)' : ' (metade)') : ''}`; if (W.arpao) prendeu = true; }
      }
      bnTiroEfx(b, A, T, ok, W, mun, i, crit, vDano);
      linhas.push(t);
    }
    if (estr === 'bomb' && extras && !W.arpao && mun !== 'acorrentada') {
      if (acertos.length) { let soma = 0; for (let i = 0; i < extras; i++) soma += Math.floor(danoDe(false) / 2); acertos[0] += soma; linhas.push(`bombardeio: ${extras} ${extras > 1 ? 'canhões' : 'canhão'} a mais soma${extras > 1 ? 'm' : ''} <b>+${soma}</b> no primeiro acerto`); }
      else linhas.push(`bombardeio: os ${extras} canhões a mais se perderam (nenhum tiro acertou)`);
    } else if (estr === 'teste' && extras) linhas.push(`tiros de teste: ${extras} ${extras > 1 ? 'canhões' : 'canhão'} a mais deu +3 cada`);
    let total = 0; acertos.forEach(v => { total += Math.max(0, v - T.br); });
    const vivoAntes = T.pv > 0, fimTiros = (n3 - 1) * 0.2 + 0.9;
    let noPar = 0; if (acertos.length) { noPar = Math.min(T.par || 0, total); if (noPar) T.par -= noPar; T.pv = Math.max(0, T.pv - (total - noPar)); T.vel = clamp(T.vel, 0, bnVelMax(T)); }
    if (mastro) { T.mastro = false; T.vel = clamp(T.vel, 0, bnVelMax(T)); bnFx(b, { k: 'mastro', x: T.x, y: T.y, d: fimTiros }); }
    if (vivoAntes && T.pv <= 0) bnFx(b, { k: 'afundou', x: T.x, y: T.y, nome: T.nome, d: fimTiros + 0.2 });
    if (prendeu) T.preso = A.id;
    bnMarca(b, A, 'cmb'); Som.tocar('dado');
    const expl = mun === 'explosiva' && acertos.length && !W.arpao ? ` Explosão: quem está a 1,5 m faz Destreza CD 16; falhou, <b>${bnDanoR('3d6')}</b> de Fogo; passou, metade.` : '';
    bnLog(b, `${bnNome(A)} atira em ${bnNome(T)} com ${q}× ${esc(arma)}${W.arpao ? '' : ' · ' + esc(BN_MUN[mun].split(' (')[0])}, pela ${m.lado} a ${Math.round(d)} m${longe ? ' (além do alcance normal: desvantagem)' : ''}, contra CR ${crT}${hda ? ' · Homem das Armas +3' : ''}.<br>${linhas.join('<br>')}
      ${acertos.length ? `<br>Dano no casco: ${acertos.map(v => `${v}−${T.br}`).join(' + ')} = <b>${total}</b>${noPar ? ` (${noPar} nos PV paralelos do reparo)` : ''}. PV de ${esc(T.nome)}: <b>${T.pv}/${T.pvMax}</b> (${estadoNavio(T.pv, T.pvMax).t.toLowerCase()}).` : ''}${mastro ? ` <b>${esc(T.nome)} perdeu o mastro</b>: velocidade máxima pela metade (regra da casa).` : ''}${prendeu ? ` <b>${esc(T.nome)} ficou preso</b> pela corrente, a até 90 m. Para soltar: Força CD 20 ou Salvaguarda de Estrutura CD 17.` : ''}${expl}`, 'tiro');
  });
}
ACT['bn-colisao'] = () => { const alvoId = ($('#bn-alvo') || {}).value || BN.alvo; bnMuda(b => {
  const A = bnSel(b), T = bnNav(b, alvoId); if (!A || !T) return toast('Escolha o alvo no campo “Alvo”.');
  const v = Math.max(A.vel, T.vel); if (v <= 14) return bnLog(b, `${bnNome(A)} e ${bnNome(T)} se chocam a ${v} nós: 14 nós ou menos, <b>sem dano</b> (LJ p. 317).`);
  const ord = Object.keys(TAM_NAVIO), maior = ord[Math.max(ord.indexOf(A.tamanho), ord.indexOf(T.tamanho))], d = bnDanoR(BN_COLISAO[maior] || '5d10');
  const parte = n => (A.cr === T.cr ? d : n.cr > (n === A ? T : A).cr ? Math.floor(d / 2) : d);
  const aplica = n => { const bruto = parte(n), f = Math.max(0, bruto - n.br); n.pv = Math.max(0, n.pv - f); n.vel = clamp(n.vel, 0, bnVelMax(n)); return `${bnNome(n)} ${bruto}${bruto < d ? ' (metade: CR maior)' : ''} − BR ${n.br} = <b>${f}</b> → PV ${n.pv}/${n.pvMax}`; };
  const vivos = [A, T].map(n => n.pv > 0), txtCol = [aplica(A), aplica(T)];
  bnFx(b, { k: 'colisao', x: (A.x + T.x) / 2, y: (A.y + T.y) / 2 });
  [A, T].forEach((n, i) => { if (vivos[i] && n.pv <= 0) bnFx(b, { k: 'afundou', x: n.x, y: n.y, nome: n.nome, d: 0.9 }); });
  bnLog(b, `<b>Colisão</b> a ${v} nós. Dano pelo maior tamanho (${maior}): ${BN_COLISAO[maior]} = <b>${d}</b>. ${txtCol[0]} · ${txtCol[1]}.`, 'tiro');
}); };
ACT['bn-soltar'] = () => bnMuda(b => { const n = bnSel(b); if (!n || !n.preso) return; const d = rnd(20), t = d + (n.von || 0), ok = t >= 17; if (ok) n.preso = null;
  bnLog(b, `${bnNome(n)} tenta soltar o arpão: Salvaguarda de Estrutura ${d}${sg(n.von || 0)} = <b>${t}</b> contra CD 17 → ${ok ? '<b class="bom">soltou</b>' : '<span class="ruim">continua preso</span>'}. Outra saída: um personagem com Teste de Força CD 20.`); Som.tocar('dado'); });
