/* ═══════════ MAPA DE COMBATE (tático) ═══════════
   Grade de quadrados de 1,5 m (variação "matriz de combate", LJ p. 287). Quem está na luta (aba Combate) vira ficha no mapa.
   O mestre arrasta; o site mede a distância, diz se cabe no deslocamento ou só com Disparada (LJ p. 286 e 288),
   mostra o alcance das armas, a régua e as áreas de técnica (cone, linha, esfera: LJ p. 268).
   Fica no Controle do mestre (Store.s.tatico). Com a chave ligada, uma cópia só de ver vai para mesa/tatico. */
const TT_M = 1.5;                                   // metros por quadrado
const TT = { modo: 'mover', arrasto: null, regua: null, alc: null, selJ: null, pubTimer: null, fundo: {}, ult: '' };
const ttNovo = () => ({ on: false, larg: 18, alt: 12, chao: 'papel', fundo: null, tk: {}, marc: [], molde: null, sel: null, ref: '', mov: {}, livre: true, soVez: true, passoEm: {} });
const tt = s => { const x = s || Store.s; if (!x.tatico) x.tatico = ttNovo(); if (!x.tatico.passoEm) Object.assign(x.tatico, { livre: true, soVez: true, passoEm: {} }); return x.tatico; };
const ttM = q => String(Math.round(q * TT_M * 10) / 10).replace('.', ',') + ' m';
const ttNumAlc = txt => (String(txt || '').match(/\d+(?:[.,]\d+)?/g) || []).map(v => parseFloat(v.replace(',', '.')));
/* tamanho da ficha tirado do Manual dos Inimigos (traço "Tamanho"): Grande 2×2, Enorme 3×3, Imenso/Colossal 4×4 */
function ttTamAuto(c) {
  const m = c && c.monId ? monPorId(c.monId) : null; if (!m) return 1;
  const r = /"Tamanho"\s*,\s*"[a-z]+"\s*:\s*"\s*([A-Za-zÀ-ú]+)/.exec(JSON.stringify(m)), n = r ? r[1].toLowerCase() : '';
  return n.startsWith('grande') ? 2 : n.startsWith('enorme') ? 3 : /^(imenso|colossal)/.test(n) ? 4 : 1;
}
const TT_CHAO = [['papel', 'Pergaminho'], ['conves', 'Convés'], ['areia', 'Areia'], ['grama', 'Grama'], ['pedra', 'Muralha de pedra'], ['neve', 'Neve'], ['noite', 'Noite'], ['mar', 'Mar'], ['mar2', 'Alto-mar']];
/* figuras de pixel art para os marcadores do mapa (barril, caixote, fogueira, rochedo…) */
const TT_FIGS = [...['barril', 'caixote', 'fogueira', 'porta', 'bau', 'canhao', 'mesa_taverna', 'pedra', 'palmeira'].map(n => 'objetos:' + n), ...['rochedo', 'coral', 'ilhota', 'naufragio', 'redemoinho', 'iceberg', 'baixio', 'barris', 'sombra_monstro'].map(n => 'mar2:' + n)];
const ttFigNome = r => ({ mesa_taverna: 'Mesa', baixio: 'Banco de areia', sombra_monstro: 'Sombra', naufragio: 'Naufrágio', canhao: 'Canhão', bau: 'Baú' }[r.split(':')[1]] || r.split(':')[1].replace(/_/g, ' ').replace(/^./, c => c.toUpperCase()));
const TT_TAMS = [[12, 8, 'Pequeno'], [18, 12, 'Médio'], [24, 16, 'Grande'], [36, 24, 'Enorme']];
/* quem pode estar no mapa: todo mundo da ordem de iniciativa */
function ttFichas(s) {
  return ordem(s).map(c => {
    const inf = cbInfo(s, c), pc = cbPC(s, c), k = pc && pc.sheet ? calc(pc) : null;
    const alc = pc && pc.sheet ? (pc.sheet.armas || []).map(a => ({ n: a.nome, m: ttNumAlc(a.alcance) })) : (c.ataques || []).map(a => ({ n: a.nome, m: ttNumAlc(a.alcance) }));
    return { id: c.id, nome: inf.nome || c.nome || 'Sem nome', ret: inf.retrato || (pc ? null : c.retrato) || null, lado: inf.pc && !inf.inimigo ? (inf.pdm ? 'aliado' : 'pc') : 'inimigo', fora: !!inf.fora,
      desl: k ? k.desl : (ttNumAlc(c.desl)[0] ?? 9), alc: alc.filter(a => a.m.length), uid: pc && pc.uid ? pc.uid : null, ini: c.ini, tamAuto: pc ? 1 : ttTamAuto(c) };
  });
}
/* distância na grade (LJ p. 287): conta do quadrado vizinho de um até o espaço do outro; diagonal vale 1 quadrado */
function ttDist(a, b) {
  const ta = a.tam || 1, tb = b.tam || 1;
  const dx = Math.max(0, a.x - (b.x + tb - 1), b.x - (a.x + ta - 1)), dy = Math.max(0, a.y - (b.y + tb - 1), b.y - (a.y + ta - 1));
  return Math.max(dx, dy);
}
function ttLivre(t, x, y, tam, menos) {
  return !Object.entries(t.tk).some(([id, p]) => id !== menos && x < p.x + (p.tam || 1) && p.x < x + tam && y < p.y + (p.tam || 1) && p.y < y + tam);
}
function ttPorTodos(t, fichas) {
  const col = { pc: 2, aliado: 4, inimigo: t.larg - 3 }, n = { pc: 0, aliado: 0, inimigo: 0 };
  fichas.forEach(f => {
    if (t.tk[f.id]) return;
    let x = col[f.lado], y; const tam = clamp(f.tamAuto || 1, 1, Math.min(4, t.alt, t.larg));
    for (let tent = 0; tent < 400; tent++) { y = Math.round(t.alt / 2) + (n[f.lado] % 2 ? 1 : -1) * Math.ceil(n[f.lado] / 2) * 2; n[f.lado]++;
      if (y < 0 || y >= t.alt) { x += f.lado === 'inimigo' ? -2 : 2; n[f.lado] = 0; continue; }
      if (ttLivre(t, clamp(x, 0, t.larg - tam), clamp(y, 0, t.alt - tam), tam)) break; }
    t.tk[f.id] = { x: clamp(x, 0, t.larg - tam), y: clamp(y, 0, t.alt - tam), ...(tam > 1 ? { tam } : {}) };
  });
}
const ttMuda = (fn, leve) => { Store.set(s => fn(tt(s), s), null, { semDesfazer: !!leve }); ttPublicar(); };

/* ───── os jogadores veem: cópia só de olhar em mesa/tatico ───── */
function ttPacote(s) {
  const t = tt(s), fs = ttFichas(s), cb = s.combate, daVez = cb.ativo ? (ordem(s)[cb.vez] || {}).id : null;
  return { larg: t.larg, alt: t.alt, chao: t.chao || 'papel', fundo: t.fundo, molde: t.molde, vez: daVez, marc: t.marc, livre: !!t.livre, soVez: !!t.soVez,
    tks: fs.filter(f => t.tk[f.id]).map(f => ({ id: f.id, nome: f.nome, ret: f.ret, lado: f.lado, fora: f.fora, uid: f.uid, x: t.tk[f.id].x, y: t.tk[f.id].y, tam: t.tk[f.id].tam || 1, ...(f.uid ? { andou: t.mov[f.id] || 0 } : {}) })) };
}
function ttPublicar(agora) {
  if (!souMestre()) return;
  clearTimeout(TT.pubTimer);
  const envia = () => { const t = tt(); if (!t.on) return; const j = JSON.stringify(ttPacote(Store.s)); if (j === TT.ult) return; TT.ult = j; DB.gravar('mesa/tatico', { on: true, s: j, em: Date.now() }).catch(() => {}); };
  if (agora) envia(); else TT.pubTimer = setTimeout(envia, 500);
}
const ttPublicado = () => !!((M.tatico || {}).on);
function ttDoBanco() { try { return JSON.parse((M.tatico || {}).s || 'null'); } catch (e) { return null; } }
/* começo do turno de alguém: zera o quanto ele já andou */
function ttTurno(s) {
  if (!souMestre() || !s.tatico) return;
  const cb = s.combate, c = cb.ativo ? ordem(s)[cb.vez] : null, ref = c ? cb.rodada + ':' + c.id : '';
  if (s.tatico.ref !== ref) { s.tatico.ref = ref; if (c) s.tatico.mov[c.id] = 0; if (!cb.ativo) s.tatico.mov = {}; }
}

/* ───── desenho ───── */
function ttRetrato(ref, nome) {
  if (ref && typeof ref === 'object') {
    if (ref.arq) return `<img class="tt-img" data-arq="${esc(ref.arq)}" alt="" draggable="false">`;
    if (ref.url) return `<img class="tt-img" src="${esc(ref.url)}" alt="" draggable="false" referrerpolicy="no-referrer">`;
    ref = ref.ic || null;
  }
  const i = ref ? icFit(ref, 'tt-img') : '';
  return i || `<span class="tt-ini">${esc(String(nome || '?').trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase())}</span>`;
}
function ttMoldeGeo(m) {
  const L = m.m / TT_M, a = (m.ang || 0) * Math.PI / 180, ux = Math.cos(a), uy = Math.sin(a), px = -uy, py = ux;
  if (m.tipo === 'circ') return { svg: `<circle class="tt-molde" cx="${m.x}" cy="${m.y}" r="${L}"/>`, dentro: (x, y) => Math.hypot(x - m.x, y - m.y) <= L + 0.01 };
  if (m.tipo === 'linha') { const w = (m.larg || TT_M) / TT_M / 2;
    const pts = [[m.x + px * w, m.y + py * w], [m.x + ux * L + px * w, m.y + uy * L + py * w], [m.x + ux * L - px * w, m.y + uy * L - py * w], [m.x - px * w, m.y - py * w]];
    return { svg: `<polygon class="tt-molde" points="${pts.map(p => p.map(v => v.toFixed(2)).join(',')).join(' ')}"/>`, dentro: (x, y) => { const d = (x - m.x) * ux + (y - m.y) * uy, l = Math.abs((x - m.x) * px + (y - m.y) * py); return d >= -0.01 && d <= L + 0.01 && l <= w + 0.01; } }; }
  /* cone (LJ p. 268): a largura em cada ponto é igual à distância desse ponto até a origem */
  const pts = [[m.x, m.y], [m.x + ux * L + px * L / 2, m.y + uy * L + py * L / 2], [m.x + ux * L - px * L / 2, m.y + uy * L - py * L / 2]];
  return { svg: `<polygon class="tt-molde" points="${pts.map(p => p.map(v => v.toFixed(2)).join(',')).join(' ')}"/>`, dentro: (x, y) => { const d = (x - m.x) * ux + (y - m.y) * uy, l = Math.abs((x - m.x) * px + (y - m.y) * py); return d > 0.01 && d <= L + 0.01 && l <= d / 2 + 0.01; } };
}
const ttCentro = p => ({ x: p.x + (p.tam || 1) / 2, y: p.y + (p.tam || 1) / 2 });
function ttFundoSrc(f) {
  if (!f) return '';
  if (f.url) return f.url;
  if (TT.fundo.id === f.arq && TT.fundo.url) return TT.fundo.url;
  Arquivos.url(f.arq).then(u => { if (u) { TT.fundo = { id: f.arq, url: u }; const im = $('#tt-fundo'); if (im && !im.getAttribute('src')) im.src = u; } });
  return '';
}
/* o mapa serve para o mestre (dados do Controle) e para o jogador (cópia publicada) */
function ttMapaHTML(V, mestre) {
  const sel = V.tks.find(k => k.id === V.sel), W = V.larg, H = V.alt;
  let linhas = ''; for (let x = 1; x < W; x++) linhas += `<line x1="${x}" y1="0" x2="${x}" y2="${H}"/>`; for (let y = 1; y < H; y++) linhas += `<line x1="0" y1="${y}" x2="${W}" y2="${y}"/>`;
  const caixa = (p, n, cls) => `<rect class="${cls}" x="${p.x - n}" y="${p.y - n}" width="${(p.tam || 1) + 2 * n}" height="${(p.tam || 1) + 2 * n}"/>`;
  let ajuda = '';
  if (sel && sel.desl != null && !sel.fora) {
    const resta = Math.max(0, Math.floor((sel.desl - (sel.andou || 0)) / TT_M + 1e-6)), disp = resta + Math.floor(sel.desl / TT_M + 1e-6);
    ajuda += caixa(sel, disp, 'tt-al disp') + caixa(sel, resta, 'tt-al anda');
  }
  if (sel && TT.alc) ajuda += TT.alc.map((m, i) => caixa(sel, Math.round(m / TT_M), 'tt-al arma' + (i ? ' longe' : ''))).join('');
  const geo = V.molde ? ttMoldeGeo(V.molde) : null;
  const tks = V.tks.map(k => {
    const d = sel && sel !== k ? ttDist(sel, k) : null, pega = geo && geo.dentro(ttCentro(k).x, ttCentro(k).y);
    return `<div class="tt-tk tt-${k.lado} ${k.id === V.sel ? 'sel' : ''} ${k.id === V.vez ? 'vez' : ''} ${k.fora ? 'fora' : ''} ${pega ? 'pega' : ''} ${k.meu ? 'meu' : ''}" data-tt="${esc(k.id)}" title="${esc(k.nome)}"
      style="left:${(k.x / W * 100).toFixed(3)}%;top:${(k.y / H * 100).toFixed(3)}%;width:${((k.tam || 1) / W * 100).toFixed(3)}%;height:${((k.tam || 1) / H * 100).toFixed(3)}%">${ttRetrato(k.ret, k.nome)}<span class="tt-nome">${esc(k.nome.split(' ')[0])}</span>${d != null ? `<span class="tt-d">${ttM(d)}</span>` : ''}</div>`;
  }).join('');
  const marcs = (V.marc || []).map(m => `<div class="tt-marc" data-ttm="${esc(m.id)}" style="left:${(m.x / W * 100).toFixed(3)}%;top:${(m.y / H * 100).toFixed(3)}%;width:${(1 / W * 100).toFixed(3)}%;height:${(1 / H * 100).toFixed(3)}%;--cor:${esc(m.cor || '#f0b429')}" title="${esc(m.nome)}">${m.ic && temIc(m.ic) ? `<span class="tt-marc-i">${icFit(m.ic)}</span>` : `<span>${esc(m.nome.slice(0, 3))}</span>`}</div>`).join('');
  const src = ttFundoSrc(V.fundo);
  return `<div class="tt-mapa-w"><div id="tt-mapa" class="tt-mapa ${V.fundo ? 'com-fundo' : 'chao-' + esc(V.chao || 'papel')} modo-${mestre ? TT.modo : 'ver'}" data-w="${W}" data-h="${H}" style="aspect-ratio:${W}/${H};--tt-c:${W}">
    ${V.fundo ? `<img id="tt-fundo" class="tt-fundo" alt="" draggable="false" ${src ? `src="${esc(src)}"` : ''}>` : ''}
    <svg class="tt-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><g class="tt-grade">${linhas}</g>${ajuda}${geo ? geo.svg : ''}<g id="tt-med"></g></svg>
    ${marcs}${tks}</div></div>`;
}
/* visão do mestre: junta o Controle com as fichas */
function ttVisaoMestre(s) {
  const t = tt(s), fs = ttFichas(s), cb = s.combate, daVez = cb.ativo ? (ordem(s)[cb.vez] || {}).id : null;
  return { larg: t.larg, alt: t.alt, chao: t.chao || 'papel', fundo: t.fundo, molde: t.molde, marc: t.marc, sel: t.sel, vez: daVez, fs,
    tks: fs.filter(f => t.tk[f.id]).map(f => ({ ...f, x: t.tk[f.id].x, y: t.tk[f.id].y, tam: t.tk[f.id].tam || 1, andou: t.mov[f.id] || 0 })) };
}
/* em quantos turnos chega, contando o que ainda resta de deslocamento neste turno */
function ttChega(d, desl, resta) {
  const falta = Math.max(0, (d - 1) * TT_M); if (!(desl > 0)) return null;
  const andando = falta <= resta + 1e-6 ? 1 : 1 + Math.ceil((falta - resta) / desl - 1e-9);
  const comDisp = falta <= resta + 1e-6 ? 1 : 2 + Math.max(0, Math.ceil((falta - resta - 2 * desl) / (2 * desl) - 1e-9));
  const encosta = falta <= resta + desl + 1e-6 ? 1 : 1 + Math.ceil((falta - resta - desl) / (2 * desl) - 1e-9);
  return { andando, comDisp, encosta };
}
function ttPainelSel(V, k) {
  const outros = V.tks.filter(o => o !== k && !o.fora).map(o => ({ o, d: ttDist(k, o) })).sort((a, b) => a.d - b.d);
  const resta = Math.max(0, k.desl - k.andou);
  const ord = n => n === 1 ? 'neste turno' : n === 2 ? 'no próximo turno' : `daqui a ${n - 1} turnos`;
  const linha = ({ o, d }) => { const r = ttChega(d, k.desl, resta) || {}, noAlc = d <= 1;
    return `<tr><td><b class="tt-n-${o.lado}">${esc(o.nome)}</b></td><td>${ttM(d)}</td><td>${noAlc ? '<b>encostado</b>' : `andando: ataca <b>${ord(r.andando)}</b>${r.comDisp < r.andando ? `<br>com Disparada: ataca <b>${ord(r.comDisp)}</b>` : r.encosta < r.andando ? `<br>com Disparada encosta ${ord(r.encosta)}, sem a ação` : ''}`}</td></tr>`; };
  return `<section class="pap tt-sel"><h2>${esc(k.nome)} <small>${{ pc: 'jogador', aliado: 'aliado', inimigo: 'inimigo' }[k.lado]}</small></h2>
    <p>Deslocamento <b>${String(k.desl).replace('.', ',')} m</b> (${Math.floor(k.desl / TT_M + 1e-6)} quadrados). Neste turno andou <b>${String(k.andou).replace('.', ',')} m</b>, restam <b>${String(resta).replace('.', ',')} m</b>.
      <button class="link" data-act="tt-zerar" data-id="${esc(k.id)}">zerar</button></p>
    <p class="tt-leg"><i class="q anda"></i> até onde anda <i class="q disp"></i> só com Disparada (gasta a ação)${TT.alc ? ' <i class="q arma"></i> alcance da arma' : ''}</p>
    ${k.alc.length ? `<div class="linha-bts">${k.alc.map((a, i) => `<button class="chip ${TT.alcDe === k.id + ':' + i ? 'on' : ''}" data-act="tt-alc" data-id="${esc(k.id)}" data-i="${i}">${esc(a.n)} ${a.m.map(v => String(v).replace('.', ',')).join('/')} m</button>`).join('')}</div>` : ''}
    <div class="linha-bts"><label>Tamanho <select data-chg="tt-tam" data-id="${esc(k.id)}">${[[1, 'Médio (1 quadrado)'], [2, 'Grande (2 × 2)'], [3, 'Enorme (3 × 3)'], [4, 'Imenso (4 × 4)']].map(([v, n]) => `<option value="${v}" ${k.tam === v ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
      <button class="bt fino" data-act="tt-tirar" data-id="${esc(k.id)}">Tirar do mapa</button></div>
    ${outros.length ? `<div class="tab-rola"><table class="tab tt-tab"><tr><th>Até</th><th>Distância</th><th>Para atacar corpo a corpo</th></tr>${outros.map(linha).join('')}</table></div>
      <p class="nota">Cada um só anda no próprio turno. "Preparar" só dispara se o outro chegar antes do seu próximo turno.</p>` : ''}</section>`;
}
VIEWS.tatico = {
  titulo: 'Mapa de combate', icone: 'itensop:mapa_tesouro', chaves: ['tatico', 'combate', 'jogadores'],
  visivel: () => souMestre() || ttPublicado(),
  render() {
    if (!souMestre()) return ttJogadorHTML();
    const s = S(); ttTurno(s);
    const t = tt(s), V = ttVisaoMestre(s), cb = s.combate, fora = V.fs.filter(f => !t.tk[f.id]), sel = V.tks.find(k => k.id === t.sel);
    const geo = t.molde ? ttMoldeGeo(t.molde) : null, pegos = geo ? V.tks.filter(k => geo.dentro(ttCentro(k).x, ttCentro(k).y)) : [];
    const imgs = arqs('imagem');
    const tira = V.fs.map(f => `<button class="tt-ini-c tt-${f.lado} ${f.id === V.vez ? 'vez' : ''} ${f.id === t.sel ? 'sel' : ''} ${f.fora ? 'fora' : ''} ${t.tk[f.id] ? '' : 'sem'}" data-act="tt-sel" data-id="${esc(f.id)}" title="${esc(f.nome)}${t.tk[f.id] ? '' : ' (fora do mapa)'}">
      <span class="tt-ini-r">${ttRetrato(f.ret, f.nome)}</span><b>${f.ini ?? '–'}</b><small>${esc(f.nome.split(' ')[0])}</small></button>`).join('');
    return `<div class="tt"><header class="tt-topo"><h1>${ic('itensop:mapa_tesouro', 64)}Mapa de combate</h1>
        <div class="linha-bts">${cb.ativo ? `<span class="rodada-n">Rodada <b>${cb.rodada}</b></span><button class="bt" data-act="cb-ant" title="Voltar um turno">◀</button><button class="bt bom grande" data-act="cb-prox">Próximo turno ▶</button>` : `<a class="bt" href="#combate" data-rota="combate">${ic('tesouro:espada', 32)}Montar a luta em Combate</a>`}
          <label class="check tt-pub"><input type="checkbox" data-chg="tt-publico" ${t.on ? 'checked' : ''}> Mostrar aos jogadores</label>
          ${t.on ? `<label class="check tt-pub" title="Cada jogador arrasta a própria ficha. Você continua podendo mover todas."><input type="checkbox" data-chg="tt-livre" data-k="livre" ${t.livre ? 'checked' : ''}> Jogador move a própria ficha</label>
            ${t.livre ? `<label class="check tt-pub"><input type="checkbox" data-chg="tt-livre" data-k="soVez" ${t.soVez ? 'checked' : ''}> só na vez dele</label>` : ''}` : ''}</div></header>
      ${V.fs.length ? `<div class="tt-tira" aria-label="Ordem de iniciativa">${tira}</div>` : `<p class="pap tt-vazio">Ninguém na luta ainda. Vá em <b>Combate</b>, adicione os jogadores e os inimigos e role a iniciativa. Eles aparecem aqui como fichas.</p>`}
      <div class="tt-corpo">${ttMapaHTML(V, true)}
        <aside class="tt-lado">
          <section class="pap tt-ferr"><div class="linha-bts tt-modos">${[['mover', 'Mover'], ['regua', 'Régua'], ['molde', 'Área de técnica']].map(([m, n]) => `<button class="chip ${TT.modo === m ? 'on' : ''}" data-act="tt-modo" data-m="${m}">${n}</button>`).join('')}</div>
            ${TT.modo === 'mover' ? `<p class="nota">Arraste uma ficha. A linha fica <b class="tt-ok">verde</b> se cabe no deslocamento, <b class="tt-av">amarela</b> se só com Disparada e <b class="tt-no">vermelha</b> se não chega neste turno. Clique para ver as distâncias.</p>` : ''}
            ${TT.modo === 'regua' ? `<p class="nota">Clique e arraste no mapa para medir. Diagonal conta 1 quadrado (LJ p. 287).</p>` : ''}
            ${TT.modo === 'molde' ? `<div class="linha-bts"><select data-chg="tt-molde" data-k="tipo">${[['cone', 'Cone'], ['linha', 'Linha'], ['circ', 'Esfera (raio)']].map(([v, n]) => `<option value="${v}" ${(t.molde || {}).tipo === v ? 'selected' : ''}>${n}</option>`).join('')}</select>
                <label><input type="number" step="1.5" min="1.5" max="90" value="${(t.molde || {}).m || 9}" data-chg="tt-molde" data-k="m" aria-label="Tamanho em metros"> m</label>
                ${t.molde ? '<button class="bt fino" data-act="tt-molde-fim">Tirar área</button>' : ''}</div>
              <p class="nota">${sel ? `Sai de <b>${esc(sel.nome)}</b>.` : 'Escolha uma ficha para ser a origem, ou clique num ponto do mapa.'} Clique ou arraste no mapa para apontar. ${t.molde ? (pegos.length ? `Pega: <b>${pegos.map(k => esc(k.nome)).join(', ')}</b>.` : 'Ninguém na área.') : ''}</p>` : ''}</section>
          ${sel ? ttPainelSel(V, sel) : ''}
          ${fora.length ? `<section class="pap"><h3>Fora do mapa (${fora.length})</h3><p class="nota">${fora.map(f => esc(f.nome)).join(', ')}</p><button class="bt bom" data-act="tt-todos">Pôr todos no mapa</button></section>` : ''}
          <details class="pap" data-tt-det="mapa" ${TT.det && TT.det.mapa ? 'open' : ''}><summary>Chão e tamanho do mapa</summary>
            <p class="pm-sub">Chão simples (não precisa de imagem)</p>
            <div class="chips">${TT_CHAO.map(([k, n]) => `<button class="chip ${!t.fundo && (t.chao || 'papel') === k ? 'on' : ''}" data-act="tt-chao" data-k="${k}">${n}</button>`).join('')}</div>
            <p class="pm-sub">Tamanho</p>
            <div class="chips">${TT_TAMS.map(([w, h, n]) => `<button class="chip ${t.larg === w && t.alt === h ? 'on' : ''}" data-act="tt-tamanho" data-w="${w}" data-h="${h}">${n} <small>${ttM(w)} × ${ttM(h)}</small></button>`).join('')}</div>
            <div class="linha-bts"><label>Largura <input type="number" min="8" max="60" value="${t.larg}" data-chg="tt-grade" data-k="larg"></label><label>Altura <input type="number" min="6" max="60" value="${t.alt}" data-chg="tt-grade" data-k="alt"></label><small>quadrados de 1,5 m</small></div>
            <p class="pm-sub">Imagem de fundo (opcional)</p>
            <div class="linha-bts"><button class="bt" data-act="tt-fundo-up">${ic('mesa:imagem', 32)} Enviar imagem</button>${t.fundo ? '<button class="bt fino" data-act="tt-fundo-fim">Tirar fundo</button>' : ''}</div>
            ${imgs.length ? `<label class="campo"><span>Ou use uma imagem já enviada</span><select data-chg="tt-fundo-sel"><option value="">—</option>${imgs.map(a => `<option value="${esc(a.id)}" ${t.fundo && t.fundo.arq === a.id ? 'selected' : ''}>${esc(a.nome)}</option>`).join('')}</select></label>` : ''}
            <p class="nota">O mapa funciona sem imagem nenhuma. Se quiser uma, peça no <a href="#atelie" data-rota="atelie">Ateliê de arte</a> (tipo "Mapa de combate") com o mesmo número de quadrados.</p></details>
          <details class="pap" data-tt-det="marc" ${TT.det && TT.det.marc ? 'open' : ''}><summary>Marcadores (porta, barril, fogo…)</summary>
            <div class="tt-figs">${TT_FIGS.filter(temIc).map(r => `<button class="${TT.mIc === r ? 'on' : ''}" data-act="tt-m-ic" data-r="${r}" title="${esc(ttFigNome(r))}">${ic(r, 32)}</button>`).join('')}</div>
            <div class="linha-bts"><input id="tt-m-nome" placeholder="${TT.mIc ? esc(ttFigNome(TT.mIc)) : 'Nome curto'}" maxlength="14"><input id="tt-m-cor" type="color" value="#f0b429" aria-label="Cor"><button class="bt" data-act="tt-marc-add">Pôr</button></div>
            ${t.marc.length ? `<ul class="tt-marcs">${t.marc.map(m => `<li>${m.ic && temIc(m.ic) ? ic(m.ic, 32) : `<i style="background:${esc(m.cor)}"></i>`}${esc(m.nome)} <button class="link" data-act="tt-marc-tirar" data-id="${esc(m.id)}">tirar</button></li>`).join('')}</ul><p class="nota">Arraste o marcador no mapa.</p>` : ''}</details>
          <details class="pap" data-tt-det="regras" ${TT.det && TT.det.regras ? 'open' : ''}><summary>Regras que o mapa usa</summary><ul>
            <li>1 quadrado = <b>1,5 m</b>. Diagonal custa 1 quadrado. Distância: conta do vizinho de um até o espaço do outro <small>(LJ p. 287)</small>.</li>
            <li>No turno, cada um anda até o <b>deslocamento</b>, e pode quebrar em pedaços <small>(LJ p. 286)</small>.</li>
            <li><b>Disparada</b> é ação: dobra o deslocamento do turno <small>(LJ p. 288)</small>.</li>
            <li><b>Terreno difícil</b> e espaço de outra criatura: cada 1,5 m custa +1,5 m. O mapa não desconta sozinho: use "zerar" e ajuste <small>(LJ p. 286)</small>.</li>
            <li><b>Cone:</b> a largura em cada ponto é igual à distância até a origem. <b>Esfera:</b> raio a partir do ponto <small>(LJ p. 268)</small>.</li></ul>
            <button class="bt fino ruim" data-act="tt-limpar">Tirar todas as fichas do mapa</button></details>
        </aside></div></div>`;
  }
};
/* jogador: só olha, mede e vê onde chega */
function ttJogadorHTML() {
  const P = ttDoBanco();
  if (!ttPublicado() || !P) return `<div class="tela-trancada">${ic('itensop:mapa_tesouro', 128)}<h1>Sem mapa agora</h1><p>Quando o mestre abrir o mapa de combate, ele aparece aqui.</p></div>`;
  const meuUid = alvoUid(), f = fichaDe(eu()) || {}, meuDesl = num((f.desl || {}).terra);
  const ot = TT.otim && Date.now() - TT.otim.em < 5000 ? TT.otim : null;
  const tks = P.tks.map(k => { const meu = !!k.uid && k.uid === meuUid; return { ...k, ...(meu && ot && ot.id === k.id ? { x: ot.x, y: ot.y } : {}), meu, desl: meu ? meuDesl : null, andou: meu ? (k.andou || 0) : 0, alc: [] }; });
  const V = { ...P, tks, sel: TT.selJ && tks.some(k => k.id === TT.selJ) ? TT.selJ : (tks.find(k => k.meu) || {}).id || null };
  const meuTk = tks.find(k => k.meu), posso = !!meuTk && !Espiar.uid && P.livre && (!P.soVez || !P.vez || P.vez === meuTk.id);
  TT.jog = { posso, meuTk, P };
  const sel = tks.find(k => k.id === V.sel), daVez = tks.find(k => k.id === P.vez);
  const outros = sel ? tks.filter(o => o !== sel && !o.fora).map(o => ({ o, d: ttDist(sel, o) })).sort((a, b) => a.d - b.d) : [];
  return `<div class="tt"><header class="tt-topo"><h1>${ic('itensop:mapa_tesouro', 64)}Mapa de combate</h1>${daVez ? `<p class="tt-vezj">Vez de <b>${esc(daVez.nome)}</b></p>` : ''}</header>
    <div class="tt-corpo">${ttMapaHTML(V, false)}
      <aside class="tt-lado"><section class="pap">${meuTk ? `<p class="destaque">${posso ? '<b>Pode mover:</b> arraste a sua ficha (borda dourada). Verde cabe no deslocamento; amarelo, só com Disparada.' : P.livre ? 'Você move a sua ficha <b>na sua vez</b>.' : 'Quem move as fichas é o mestre.'}</p>` : ''}
        <p class="nota">Toque numa ficha para ver as distâncias dela. Arraste no vazio para medir. 1 quadrado = 1,5 m.</p>
        ${sel ? `<h2>${esc(sel.nome)}${sel.meu ? ' <small>você</small>' : ''}</h2>${sel.meu && meuDesl ? `<p>Seu deslocamento: <b>${meuDesl} m</b> (${Math.floor(meuDesl / TT_M)} quadrados)${sel.andou ? `; já andou <b>${String(sel.andou).replace('.', ',')} m</b> neste turno` : ''}. <span class="tt-leg"><i class="q anda"></i> andando <i class="q disp"></i> com Disparada</span></p>` : ''}
          ${outros.length ? `<div class="tab-rola"><table class="tab tt-tab"><tr><th>Até</th><th>Distância</th>${sel.meu && meuDesl ? '<th>Você chega</th>' : ''}</tr>${outros.map(({ o, d }) => { const r = sel.meu && meuDesl ? ttChega(d, meuDesl, Math.max(0, meuDesl - (sel.andou || 0))) : null;
            return `<tr><td><b class="tt-n-${o.lado}">${esc(o.nome)}</b></td><td>${ttM(d)}</td>${r ? `<td>${d <= 1 ? 'já está encostado' : `andando: no seu ${r.andando}º turno${r.comDisp < r.andando ? ` · Disparada: ${r.comDisp}º` : r.encosta < r.andando ? ` · Disparada encosta no ${r.encosta}º` : ''}`}</td>` : ''}</tr>`; }).join('')}</table></div>` : ''}` : ''}</section></aside></div></div>`;
}

/* ───── ponteiro: arrastar ficha, régua, apontar área ───── */
function ttPonto(ev) { const el = $('#tt-mapa'); if (!el) return null; const r = el.getBoundingClientRect(); if (!r.width) return null; const W = +el.dataset.w, H = +el.dataset.h; return { x: (ev.clientX - r.left) / r.width * W, y: (ev.clientY - r.top) / r.height * H, W, H }; }
function ttMedida(x1, y1, x2, y2, cls, rot) {
  const g = $('#tt-med'); if (!g) return;
  g.innerHTML = x1 == null ? '' : `<line class="tt-reg ${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/><circle class="tt-reg-p ${cls}" cx="${x1}" cy="${y1}" r=".18"/><circle class="tt-reg-p ${cls}" cx="${x2}" cy="${y2}" r=".18"/>
    <g transform="translate(${(x1 + x2) / 2},${(y1 + y2) / 2 - 0.35})"><rect class="tt-reg-f" x="-1.7" y="-.42" width="3.4" height=".84" rx=".1"/><text class="tt-reg-t" text-anchor="middle" y=".2">${rot}</text></g>`;
}
function ttApontar(p) {
  const t = tt(), V = ttVisaoMestre(S()), sel = V.tks.find(k => k.id === t.sel), tipo = (t.molde || {}).tipo || ($('[data-chg="tt-molde"][data-k="tipo"]') || {}).value || 'cone', m = (t.molde || {}).m || num(($('[data-chg="tt-molde"][data-k="m"]') || {}).value) || 9;
  const o = tipo === 'circ' || !sel ? (t.molde && tipo !== 'circ' && !sel ? { x: t.molde.x, y: t.molde.y } : { x: Math.round(p.x * 2) / 2, y: Math.round(p.y * 2) / 2 }) : ttCentro(sel);
  const ang = Math.round(Math.atan2(p.y - o.y, p.x - o.x) * 180 / Math.PI / 5) * 5;
  return { tipo, m, x: o.x, y: o.y, ang: tipo === 'circ' ? 0 : ang };
}
document.addEventListener('pointerdown', ev => {
  const mapa = ev.target.closest && ev.target.closest('#tt-mapa'); if (!mapa) return;
  const p = ttPonto(ev); if (!p) return;
  const mestre = souMestre(), tk = ev.target.closest('.tt-tk'), mc = ev.target.closest('.tt-marc');
  if (mestre && TT.modo === 'molde') { TT.arrasto = { tipo: 'molde' }; ttMuda(t => { t.molde = ttApontar(p); }, true); ev.preventDefault(); return; }
  if (mestre && TT.modo === 'mover' && (tk || mc)) {
    const t = tt(), id = tk ? tk.dataset.tt : mc.dataset.ttm, pos = tk ? t.tk[id] : t.marc.find(m => m.id === id); if (!pos) return;
    TT.arrasto = { tipo: tk ? 'tk' : 'marc', id, el: tk || mc, x0: pos.x, y0: pos.y, x: pos.x, y: pos.y, tam: pos.tam || 1, dx: p.x - pos.x, dy: p.y - pos.y, cx: ev.clientX, cy: ev.clientY, mexeu: false };
    ev.preventDefault(); return;
  }
  /* régua (mestre no modo régua; jogador sempre que arrastar no vazio) */
  if ((mestre && TT.modo === 'regua') || (!mestre && !tk)) { TT.arrasto = { tipo: 'regua', x0: Math.floor(p.x) + 0.5, y0: Math.floor(p.y) + 0.5 }; ev.preventDefault(); return; }
  if (!mestre && tk) {
    const J = TT.jog || {}, meu = J.meuTk && J.meuTk.id === tk.dataset.tt;
    if (meu && J.posso) { const k = J.meuTk; TT.arrasto = { tipo: 'meu', id: k.id, el: tk, x0: k.x, y0: k.y, x: k.x, y: k.y, tam: k.tam || 1, dx: p.x - k.x, dy: p.y - k.y, cx: ev.clientX, cy: ev.clientY, mexeu: false, desl: k.desl || 9, andou: k.andou || 0 }; ev.preventDefault(); return; }
    TT.selJ = tk.dataset.tt; App.render();
  }
});
document.addEventListener('pointermove', ev => {
  const a = TT.arrasto; if (!a) return; const p = ttPonto(ev); if (!p) return;
  if (a.tipo === 'molde') { const m = ttApontar(p); const t = tt(); if (!t.molde || m.ang !== t.molde.ang || m.x !== t.molde.x || m.y !== t.molde.y) ttMuda(x => { x.molde = m; }, true); return; }
  if (a.tipo === 'regua') { const x = clamp(Math.floor(p.x), 0, p.W - 1) + 0.5, y = clamp(Math.floor(p.y), 0, p.H - 1) + 0.5, q = Math.max(Math.abs(x - a.x0), Math.abs(y - a.y0)); ttMedida(a.x0, a.y0, x, y, 'livre', `${ttM(q)} · ${q} q`); return; }
  if (!a.mexeu && Math.hypot(ev.clientX - a.cx, ev.clientY - a.cy) < 5) return;
  a.mexeu = true; a.x = clamp(Math.round(p.x - a.dx), 0, p.W - a.tam); a.y = clamp(Math.round(p.y - a.dy), 0, p.H - a.tam);
  a.el.style.left = (a.x / p.W * 100) + '%'; a.el.style.top = (a.y / p.H * 100) + '%'; a.el.classList.add('indo');
  if (a.tipo === 'tk' || a.tipo === 'meu') {
    const f = a.tipo === 'meu' ? a : ttVisaoMestre(S()).tks.find(k => k.id === a.id) || { desl: 9, andou: 0 }, q = Math.max(Math.abs(a.x - a.x0), Math.abs(a.y - a.y0)), m = q * TT_M, resta = Math.max(0, f.desl - f.andou);
    const cls = m <= resta + 1e-6 ? 'ok' : m <= resta + f.desl + 1e-6 ? 'av' : 'no', h = a.tam / 2;
    ttMedida(a.x0 + h, a.y0 + h, a.x + h, a.y + h, cls, `${ttM(q)}${cls === 'av' ? ' · Disparada' : cls === 'no' ? ' · não chega' : ''}`);
  }
});
document.addEventListener('pointerup', () => {
  const a = TT.arrasto; if (!a) return; TT.arrasto = null;
  if (a.tipo === 'molde') return;
  if (a.tipo === 'regua') { setTimeout(() => ttMedida(null), 2500); return; }
  if (a.tipo === 'meu') {
    ttMedida(null);
    if (!a.mexeu) { TT.selJ = a.id; App.render(); return; }
    const P = (TT.jog || {}).P || { tks: [] };
    if (P.tks.some(k => k.id !== a.id && a.x < k.x + (k.tam || 1) && k.x < a.x + a.tam && a.y < k.y + (k.tam || 1) && k.y < a.y + a.tam)) { toast('Já tem alguém nesse quadrado.', { tipo: 'ruim' }); App.render(); return; }
    TT.otim = { id: a.id, x: a.x, y: a.y, em: Date.now() };
    DB.gravar('jogadores/' + Eu.uid, { passo: { x: a.x, y: a.y, em: Date.now() } }).catch(() => toast('Não consegui mandar o movimento.', { tipo: 'ruim' }));
    App.render(); setTimeout(() => { if (App.rota === 'tatico') App.render(); }, 5200); return;
  }
  if (a.tipo === 'marc') { if (a.mexeu) ttMuda(t => { const m = t.marc.find(x => x.id === a.id); if (m) { m.x = a.x; m.y = a.y; } }); return; }
  if (!a.mexeu) { ttMuda(t => { t.sel = t.sel === a.id ? null : a.id; }, true); TT.alc = null; TT.alcDe = null; return; }
  const q = Math.max(Math.abs(a.x - a.x0), Math.abs(a.y - a.y0));
  ttMuda((t, s) => {
    if (!ttLivre(t, a.x, a.y, a.tam, a.id)) { toast('Já tem alguém nesse quadrado.', { tipo: 'ruim' }); return; }
    t.tk[a.id] = { ...t.tk[a.id], x: a.x, y: a.y }; t.sel = a.id;
    if (s.combate.ativo && q) { t.mov[a.id] = Math.round(((t.mov[a.id] || 0) + q * TT_M) * 10) / 10; const c = s.combate.lista.find(x => x.id === a.id); if (c) logCB(s, `${esc(cbInfo(s, c).nome)} andou ${ttM(q)} no mapa`); }
  });
});
document.addEventListener('toggle', e => { const d = e.target; if (d && d.dataset && d.dataset.ttDet) { TT.det = TT.det || {}; TT.det[d.dataset.ttDet] = d.open; } }, true);

/* ───── ações ───── */
ACT['tt-sel'] = el => { const id = el.dataset.id; TT.alc = null; TT.alcDe = null; ttMuda(t => { t.sel = id; if (!t.tk[id]) ttPorTodos(t, ttFichas(Store.s).filter(f => f.id === id)); }, true); };
ACT['tt-modo'] = el => { TT.modo = el.dataset.m; ttMedida(null); App.render(); };
ACT['tt-todos'] = () => ttMuda((t, s) => ttPorTodos(t, ttFichas(s)));
ACT['tt-limpar'] = () => confirmar('Tirar todas as fichas do mapa? (A luta em Combate continua igual.)', () => ttMuda(t => { t.tk = {}; t.mov = {}; t.sel = null; t.molde = null; }));
ACT['tt-tirar'] = el => ttMuda(t => { delete t.tk[el.dataset.id]; if (t.sel === el.dataset.id) t.sel = null; });
ACT['tt-zerar'] = el => ttMuda(t => { t.mov[el.dataset.id] = 0; }, true);
ACT['tt-tam'] = el => ttMuda(t => { const p = t.tk[el.dataset.id]; if (!p) return; p.tam = clamp(num(el.value) || 1, 1, 4); p.x = clamp(p.x, 0, t.larg - p.tam); p.y = clamp(p.y, 0, t.alt - p.tam); });
ACT['tt-alc'] = el => { const k = ttVisaoMestre(S()).tks.find(x => x.id === el.dataset.id), a = k && k.alc[+el.dataset.i], ch = el.dataset.id + ':' + el.dataset.i; if (!a) return; if (TT.alcDe === ch) { TT.alc = null; TT.alcDe = null; } else { TT.alc = a.m; TT.alcDe = ch; } App.render(); };
ACT['tt-molde'] = el => ttMuda(t => { const sel = t.sel && t.tk[t.sel], o = sel ? ttCentro(sel) : { x: t.larg / 2, y: t.alt / 2 }; t.molde = Object.assign({ tipo: 'cone', m: 9, x: o.x, y: o.y, ang: 0 }, t.molde || {}); t.molde[el.dataset.k] = el.dataset.k === 'm' ? clamp(num(el.value) || 9, 1.5, 90) : el.value; }, true);
ACT['tt-molde-fim'] = () => ttMuda(t => { t.molde = null; }, true);
ACT['tt-grade'] = el => ttMuda(t => { t[el.dataset.k] = clamp(Math.round(num(el.value) || 12), el.dataset.k === 'larg' ? 8 : 6, 60); Object.values(t.tk).forEach(p => { p.x = clamp(p.x, 0, t.larg - (p.tam || 1)); p.y = clamp(p.y, 0, t.alt - (p.tam || 1)); }); t.marc.forEach(m => { m.x = clamp(m.x, 0, t.larg - 1); m.y = clamp(m.y, 0, t.alt - 1); }); });
ACT['tt-fundo-up'] = () => escolherArquivos('image/*', false, async fs => { const r = await enviarArquivos(fs, 'imagem'); if (r && r[0]) { TT.det = Object.assign(TT.det || {}, { mapa: true }); ttMuda(t => { t.fundo = { arq: r[0].id }; }); } });
ACT['tt-fundo-sel'] = el => ttMuda(t => { t.fundo = el.value ? { arq: el.value } : null; });
ACT['tt-fundo-fim'] = () => ttMuda(t => { t.fundo = null; });
ACT['tt-chao'] = el => { TT.det = Object.assign(TT.det || {}, { mapa: true }); ttMuda(t => { t.chao = el.dataset.k; t.fundo = null; }); };
ACT['tt-tamanho'] = el => { TT.det = Object.assign(TT.det || {}, { mapa: true }); ttMuda(t => { t.larg = +el.dataset.w; t.alt = +el.dataset.h; Object.values(t.tk).forEach(p => { p.x = clamp(p.x, 0, t.larg - (p.tam || 1)); p.y = clamp(p.y, 0, t.alt - (p.tam || 1)); }); t.marc.forEach(m => { m.x = clamp(m.x, 0, t.larg - 1); m.y = clamp(m.y, 0, t.alt - 1); }); }); };
ACT['tt-m-ic'] = el => { TT.det = Object.assign(TT.det || {}, { marc: true }); TT.mIc = TT.mIc === el.dataset.r ? null : el.dataset.r; App.render(); };
ACT['tt-marc-add'] = () => { const fig = TT.mIc, n = (($('#tt-m-nome') || {}).value || '').trim() || (fig ? ttFigNome(fig) : ''), cor = ($('#tt-m-cor') || {}).value || '#f0b429'; if (!n) return toast('Escolha uma figura ou dê um nome curto ao marcador.'); TT.det = Object.assign(TT.det || {}, { marc: true });
  ttMuda(t => { let x = Math.floor(t.larg / 2), y = Math.floor(t.alt / 2); while (t.marc.some(m => m.x === x && m.y === y) && x < t.larg - 1) x++; t.marc.push({ id: uid(), nome: n, cor, x, y, ic: fig || undefined }); }); };
ACT['tt-marc-tirar'] = el => ttMuda(t => { t.marc = t.marc.filter(m => m.id !== el.dataset.id); });
ACT['tt-publico'] = el => {
  const on = !!el.checked; ttMuda(t => { t.on = on; }, true);
  if (on) { TT.ult = ''; ttPublicar(true); toast('Os jogadores agora veem o mapa (aba Mapa de combate). Só você move as fichas.', { tipo: 'bom', tempo: 6000 }); }
  else DB.gravar('mesa/tatico', { on: false, s: '', em: Date.now() }).then(() => toast('O mapa voltou a ser só seu.')).catch(() => {});
};
ACT['tt-livre'] = el => ttMuda(t => { t[el.dataset.k] = !!el.checked; }, true);
/* o jogador arrastou a própria ficha: ele grava o passo no documento dele e o mestre aplica aqui (se a chave estiver ligada) */
function ttPassos() {
  if (!souMestre() || !Store.s || !Store.s.tatico || !Store.s.tatico.on) return;
  const s = Store.s, t = tt(s), fs = ttFichas(s), cb = s.combate, daVez = cb.ativo ? (ordem(s)[cb.vez] || {}).id : null, fazer = [];
  (M.jogadores || []).forEach(j => { const p = j.passo; if (!p || !p.em || p.em <= (t.passoEm[j.uid] || 0)) return;
    const f = fs.find(x => x.uid === j.uid), velho = Date.now() - p.em > 90000;
    fazer.push({ j, p, f, vale: !!f && !velho && t.livre && !!t.tk[f.id] && (!t.soVez || !daVez || daVez === f.id) }); });
  if (!fazer.length) return;
  ttMuda((tt2, st) => fazer.forEach(({ j, p, f, vale }) => {
    tt2.passoEm[j.uid] = p.em; if (!vale) return;
    const pos = tt2.tk[f.id], tam = pos.tam || 1, x = clamp(Math.round(num(p.x) || 0), 0, tt2.larg - tam), y = clamp(Math.round(num(p.y) || 0), 0, tt2.alt - tam);
    if (!ttLivre(tt2, x, y, tam, f.id)) return;
    const q = Math.max(Math.abs(x - pos.x), Math.abs(y - pos.y)); if (!q) return;
    tt2.tk[f.id] = { ...pos, x, y };
    if (st.combate.ativo) { const antes = tt2.mov[f.id] || 0, m = Math.round((antes + q * TT_M) * 10) / 10; tt2.mov[f.id] = m;
      logCB(st, `${esc(f.nome)} moveu a própria ficha ${ttM(q)}${m > f.desl + 1e-6 ? ` <b>(total ${String(m).replace('.', ',')} m: passou do deslocamento de ${String(f.desl).replace('.', ',')} m, só com Disparada)</b>` : ''}`); }
  }));
}
Mesa.on(ch => { if (ch === 'jogadores') ttPassos(); });
/* qualquer mudança no Controle (vida, turno, quem caiu) atualiza a cópia dos jogadores */
Store.on(s => { if (typeof Mesa !== 'undefined' && Mesa.aberta && souMestre() && s.tatico && s.tatico.on) ttPublicar(); });
NAV.mestre.forEach(g => { if (g[0] === 'Ao vivo') g[1].push('tatico'); });
NAV.jogador[0][1].splice(3, 0, 'tatico');
