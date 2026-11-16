/* ═══════════ fichas 2.0: leitura por link do Google (gviz) ou por arquivo .xlsx ═══════════ */
const BLOCOS = window.BLOCKS || {};
const ABA = { VA: 'Valores', ES: 'Estilo de Combate', AK: 'Akuma no Mi', PE: 'Personalização e Inventário', PR: 'Profissão', HK: 'Haki' };
const colNum = s => s.split('').reduce((a, c) => a * 26 + c.charCodeAt(0) - 64, 0);
const colLetra = n => { let s = ''; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; };

/* anotação em forma de lista → itens. Uma linha por item; peso opcional ("kit de cozinha- 4kg", "2x corda 3 kg", "roupa de gala 1kg").
   Linha comprida (texto corrido) não é lista: aí devolve vazio e a anotação vira só nota. */
const recipNome = nm => /mochila|bolsa|saco(?! de dormir)|ba[uú]\b|algibeira|cesto|caixa|maleta/i.test(nm || '');
function conteudoNota(txt) {
  const linhas = String(txt || '').split(/\r?\n|;/).map(l => l.trim()).filter(Boolean);
  if (!linhas.length || linhas.some(l => l.length > 70)) return [];
  const o = [];
  for (let l of linhas) {
    l = l.replace(/^[-•*·–—\s]+/, '');
    const mk = l.match(/(\d+(?:[.,]\d+)?)\s*(kg|quilos?)\b/i); let peso = null;
    if (mk) { peso = parseFloat(mk[1].replace(',', '.')); l = l.replace(mk[0], ' '); }
    let qtd = 1; const mq = l.match(/^(\d+)\s*x?\s+/i) || l.match(/\s[x×]\s*(\d+)\s*$/i) || l.match(/\((\d+)\)\s*$/);
    if (mq) { qtd = +mq[1]; l = l.replace(mq[0], ' '); }
    const nome = l.replace(/[\s,;:.\-–—]+$/g, '').replace(/^[\s,;:.\-–—]+/g, '').replace(/\s+/g, ' ').trim();
    if (nome) o.push({ nome, qtd, peso });
  }
  return o;
}
function parseFicha(raw) {
  const g = (a, c) => { const v = (raw[ABA[a]] || {})[c]; return v === undefined ? null : v; };
  const t = (a, c) => { const v = g(a, c); if (v == null) return ''; const s = String(v).trim(); return s === '-' ? '' : s; };
  const n = (a, c) => num(g(a, c));
  const b = (a, c) => { const v = g(a, c); return v === true || v === 1 || /^(true|verdadeiro)$/i.test(String(v)); };
  const lista = (a, col, r0, r1) => { const o = []; for (let r = r0; r <= r1; r++) { const v = t(a, col + r); if (v) o.push(v); } return o; };
  const attrs = [['FOR', 'G15', 'K15', 'AI21', 'AH21'], ['DES', 'G17', 'K17', 'AI22', 'AH22'], ['CON', 'G19', 'K19', 'AI23', 'AH23'],
    ['SAB', 'T15', 'X15', 'AI24', 'AH24'], ['PRE', 'T17', 'X17', 'AI25', 'AH25'], ['VON', 'T19', 'X19', 'AI26', 'AH26']]
    .map(([nm, v, m, s, p]) => ({ n: nm, v: n('VA', v), m: n('VA', m), salv: n('VA', s), prof: b('VA', p) }));
  const PER = [['Atletismo', 'L25', 'K25'], ['Acrobacia', 'L26', 'K26'], ['Furtividade', 'L27', 'K27'], ['Prestidigitação', 'L28', 'K28'], ['História', 'L29', 'K29'],
    ['Investigação', 'L30', 'K30'], ['Medicina', 'L31', 'K31'], ['Natureza', 'L32', 'K32'], ['Sobrevivência', 'L33', 'K33'], ['Atuação', 'L34', 'K34'],
    ['Enganação', 'Y25', 'X25'], ['Intimidação', 'Y26', 'X26'], ['Persuasão', 'Y27', 'X27'], ['Provocação', 'Y28', 'X28'], ['Haki', 'Y29', 'X29'],
    ['Intuição', 'Y30', 'X30'], ['Percepção', 'Y31', 'X31'], ['Sobrenatural', 'Y32', 'X32'], ['Sorte', 'Y33', 'X33']];
  let exaustao = 0; ['AP', 'AQ', 'AR', 'AS', 'AT', 'AU'].forEach((c, i) => { if (b('VA', c + '30')) exaustao = Math.max(exaustao, n('VA', c + '31') || i + 1); });
  const dadosVida = [34, 35, 36].map(r => ({ tipo: (t('VA', 'AM' + r) || '').toLowerCase(), max: n('VA', 'AO' + r), atual: n('VA', 'AQ' + r) }))
    .filter(d => /^d\d+$/.test(d.tipo) && d.max > 0);
  const cartoes = a => {
    const out = [];
    [14, 25, 36, 47].forEach(r => [15, 30, 45].forEach(c => {
      const C = k => colLetra(c + k);
      const nome = t(a, C(0) + r).replace(/^Nome:\s*/i, '').trim(); if (!nome || /^Ataque Combinado/i.test(nome)) return;   // a 2ª parte barra o "cartão fantasma"
      const ppTxt = t(a, C(0) + (r + 6));
      out.push({ nome, grau: t(a, C(0) + (r + 2)).replace(/\s*\n\s*/g, ' ').replace(/Grau/i, 'grau'), desc: t(a, C(3) + (r + 2)),
        pp: num(ppTxt), dur: t(a, C(5) + (r + 7)), alc: t(a, C(11) + (r + 7)), req: t(a, C(5) + (r + 8)), dano: t(a, C(11) + (r + 8)), extra: t(a, C(0) + (r + 9)) });
    }));
    return out;
  };
  const tecs = a => { const o = []; for (let r = 5; r <= 11; r++) { const c = t(a, 'Q' + r), x = t(a, 'X' + r); if (c || x) o.push({ grau: r - 4, combate: c, auxiliar: x }); } return o; };
  const armas = []; for (let r = 20; r <= 24; r++) { const nm = t('PE', 'B' + r); if (nm) armas.push({ nome: nm, bonus: g('PE', 'G' + r), dano: t('PE', 'I' + r), alcance: t('PE', 'K' + r), tipo: t('PE', 'N' + r), expertise: t('PE', 'P' + r), ...(((raw.__notas || {})[ABA.PE] || {})['B' + r] ? { nota: raw.__notas[ABA.PE]['B' + r].replace(/\s+/g, ' ').slice(0, 200) } : {}) }); }
  const akuma = t('VA', 'U10') || t('AK', 'F4');
  /* inventário da ficha: 14 linhas (AC5:AN18). AC nome, AM quantidade, AN peso de cada um (kg) */
  /* a anotação do item (passe o mouse na planilha) vira nota; se for uma lista, vira o que está DENTRO dele (ex.: a mochila) */
  const nota = (a, c) => ((raw.__notas || {})[ABA[a]] || {})[c] || '';
  const invFicha = () => { const o = []; for (let r = 5; r <= 18; r++) { const nm = t('PE', 'AC' + r).trim(); if (!nm) continue;
    const nt = nota('PE', 'AC' + r), it = { nome: nm, qtd: n('PE', 'AM' + r) ?? 1, peso: n('PE', 'AN' + r) || 0 };
    if (nt) { const d = conteudoNota(nt); if (d.length >= 2 || (d.length && recipNome(nm))) it.dentro = d; else it.nota = nt.replace(/\s+/g, ' ').slice(0, 200); }
    o.push(it); } return o; };
  return {
    jogador: t('VA', 'B2'), personagem: t('PE', 'E2'), alcunha: t('PE', 'N6'), sonho: t('PE', 'N7'), caminho: t('PE', 'N8'), tripulacao: t('PE', 'N9'),
    nivel: n('VA', 'G7'), prof: n('VA', 'G9'), especie: t('VA', 'U7'), estilo: t('VA', 'U8'), profissao: t('VA', 'U9'), graduacao: t('PR', 'F5'),
    antecedente: t('VA', 'G10'), recompensa: n('VA', 'AC4'),
    desl: { terra: n('VA', 'AM5'), voo: n('VA', 'AP5'), nado: n('VA', 'AS5') },
    pv: { atual: n('VA', 'AC8'), max: n('VA', 'AF8'), temp: n('VA', 'AI8'), escudo: n('VA', 'AI14'), dano: n('VA', 'AI15') },
    pp: { atual: n('VA', 'AM8'), max: n('VA', 'AP8'), temp: n('VA', 'AS8'), gasto: n('VA', 'AS15') },
    cr: n('VA', 'AM20'), attrs, desMod: n('VA', 'K17'), conMod: n('VA', 'K19'),
    pericias: PER.map(([nm, v, p]) => ({ n: nm, v: n('VA', v), prof: b('VA', p) })), percepcao: n('VA', 'Y31'),
    oficio: { nome: t('VA', 'S34'), bonus: t('VA', 'Y34') }, exaustao, dadosVida, ataquesTexto: t('VA', 'AC29'),
    estiloAtk: n('ES', 'AO3'), estiloCD: n('ES', 'AO9'), tecEstilo: tecs('ES'), cartoesEstilo: cartoes('ES'),
    hb: lista('ES', 'B', 13, 17), caracteristicas: lista('ES', 'B', 21, 34),
    akuma, temFruta: !!akuma && !/^(nenhuma|não|nao|-)$/i.test(akuma), akumaCat: t('AK', 'F5'), akumaTipo: t('AK', 'F6'),
    akumaAtk: n('AK', 'AO3'), akumaCD: n('AK', 'AO9'), tecAkuma: tecs('AK'), cartoesAkuma: cartoes('AK'),
    poderes: [].concat(lista('AK', 'B', 11, 13), lista('AK', 'B', 17, 19), lista('AK', 'B', 23, 27), lista('AK', 'B', 31, 36)),
    armas, itens: invFicha(), dinheiro: n('PE', 'AC24'), carga: n('PE', 'AO19'), cargaMax: n('PE', 'AO20'), pt: n('PE', 'AC29'), ptGastos: n('PE', 'AJ29'),
    tracos: lista('PE', 'T', 19, 22), ancestral: lista('PE', 'T', 26, 28), variacao: t('PE', 'T32'), singularidades: lista('PE', 'T', 5, 9), defeitos: lista('PE', 'T', 11, 15),
    codigo: t('PE', 'AT4'), antecedenteNome: t('PE', 'AT11'), antecedenteCarac: t('PE', 'AQ13'),
    haki: { pa: n('HK', 'B28'), gastos: n('HK', 'G28'), cd: n('HK', 'S28'), estagio: t('HK', 'Y28') }
  };
}

/* ───── leitor de .xlsx próprio (zip + XML), sem biblioteca ───── */
async function lerXlsx(buf) {
  if (typeof DecompressionStream === 'undefined') throw new Error('Este navegador é antigo demais para abrir .xlsx. Use o Chrome atualizado.');
  const u8 = new Uint8Array(buf), dv = new DataView(buf), dec = new TextDecoder();
  let fimDir = -1;
  for (let i = u8.length - 22; i >= Math.max(0, u8.length - 70000); i--) if (dv.getUint32(i, true) === 0x06054b50) { fimDir = i; break; }
  if (fimDir < 0) throw new Error('Esse arquivo não é um .xlsx.');
  const qtd = dv.getUint16(fimDir + 10, true); let p = dv.getUint32(fimDir + 16, true);
  const arq = {};
  for (let k = 0; k < qtd; k++) {
    const metodo = dv.getUint16(p + 10, true), tam = dv.getUint32(p + 20, true), nl = dv.getUint16(p + 28, true), xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), loc = dv.getUint32(p + 42, true);
    arq[dec.decode(u8.subarray(p + 46, p + 46 + nl))] = { metodo, tam, loc };
    p += 46 + nl + xl + cl;
  }
  const ler = async nome => {
    const f = arq[nome]; if (!f) return null;
    const ini = f.loc + 30 + dv.getUint16(f.loc + 26, true) + dv.getUint16(f.loc + 28, true), dados = u8.subarray(ini, ini + f.tam);
    if (f.metodo === 0) return dec.decode(dados);
    const out = await new Response(new Blob([dados]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer();
    return dec.decode(out);
  };
  const xml = s => new DOMParser().parseFromString(s, 'application/xml');
  const wb = xml(await ler('xl/workbook.xml')), rels = xml(await ler('xl/_rels/workbook.xml.rels') || '<r/>');
  const alvo = {}; [...rels.getElementsByTagName('Relationship')].forEach(r => { alvo[r.getAttribute('Id')] = r.getAttribute('Target'); });
  const ss = []; const sst = await ler('xl/sharedStrings.xml');
  if (sst) [...xml(sst).getElementsByTagName('si')].forEach(si => ss.push([...si.getElementsByTagName('t')].map(x => x.textContent).join('')));
  const raw = {}, quero = new Set(Object.values(ABA));
  for (const sh of [...wb.getElementsByTagName('sheet')]) {
    const nome = sh.getAttribute('name'); if (!quero.has(nome)) continue;
    const rid = sh.getAttribute('r:id') || sh.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');
    let caminho = (alvo[rid] || '').replace(/^\/?xl\//, ''); caminho = 'xl/' + caminho.replace(/^\//, '');
    const txt = await ler(caminho); if (!txt) continue;
    const out = raw[nome] = {};
    for (const c of xml(txt).getElementsByTagName('c')) {
      const r = c.getAttribute('r'), tp = c.getAttribute('t'), v = c.getElementsByTagName('v')[0];
      let val = null;
      if (tp === 's') val = v ? ss[+v.textContent] : null;
      else if (tp === 'inlineStr') val = [...c.getElementsByTagName('t')].map(x => x.textContent).join('');
      else if (tp === 'b') val = v ? v.textContent === '1' : null;
      else if (tp === 'str' || tp === 'e') val = v ? v.textContent : null;
      else if (v) { const x = parseFloat(v.textContent); val = isNaN(x) ? v.textContent : x; }
      if (val !== null && val !== '') out[r] = val;
    }
    /* anotações das células (o "passe o mouse" da planilha): ficam em raw.__notas[aba][célula].
       Pelo link do Google elas não vêm: o gviz não manda anotação. Só pelo arquivo .xlsx. */
    try {
      const pasta = caminho.replace(/[^/]+$/, ''), base = caminho.split('/').pop();
      const rs = await ler(pasta + '_rels/' + base + '.rels'); if (!rs) continue;
      const rel = [...xml(rs).getElementsByTagName('Relationship')].find(r => /\/comments$/.test(r.getAttribute('Type') || ''));
      if (!rel) continue;
      const partes = (pasta + rel.getAttribute('Target')).split('/'), alvoC = [];
      partes.forEach(p => { if (p === '..') alvoC.pop(); else if (p && p !== '.') alvoC.push(p); });
      const ct = await ler(rel.getAttribute('Target').startsWith('/') ? rel.getAttribute('Target').slice(1) : alvoC.join('/')); if (!ct) continue;
      const nt = (raw.__notas = raw.__notas || {})[nome] = {};
      for (const cm of xml(ct).getElementsByTagName('comment')) {
        const txt = [...cm.getElementsByTagName('t')].map(x => x.textContent).join('').trim();
        if (txt) nt[cm.getAttribute('ref')] = txt;
      }
    } catch (e) { /* sem anotação: segue a ficha normal */ }
  }
  if (!raw['Valores']) throw new Error('Esse .xlsx não parece ser a ficha 2.0 (não tem a aba "Valores").');
  return raw;
}

/* ───── leitor por link (Google gviz via JSONP: funciona fora do Claude, com a ficha aberta para "qualquer pessoa com o link") ─────
   ATENÇÃO (bug achado em 7/nov): o Google PULA as linhas que estão totalmente vazias dentro da faixa pedida.
   Então a 3ª linha que chega pode ser, na verdade, a 7ª da planilha. Por isso o gviz() devolve as linhas "cruas"
   e o lerFaixa() só confia na posição quando tem certeza; quando não tem, confere a cauda ou divide a faixa. */
function idDoLink(link) { const m = String(link || '').match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]{20,})/); return m ? m[1] : null; }
function faixaInfo(faixa) {
  const [a, b = a] = faixa.split(':'), c0 = colNum(a.match(/[A-Z]+/)[0]), r0 = +a.match(/\d+/)[0], c1 = colNum(b.match(/[A-Z]+/)[0]), r1 = +b.match(/\d+/)[0];
  return { c0, r0, c1, r1, R: r1 - r0 + 1 };
}
const faixaDe = (c0, r0, c1, r1) => `${colLetra(c0)}${r0}:${colLetra(c1)}${r1}`;
/* cartões de técnica (O14:BF57): cada um dos 4 blocos tem sempre as linhas com rótulo do modelo
   (Nome: · grau · PP · Duração · Requisito) e às vezes a linha do Ataque Combinado. As outras linhas são
   células mescladas, sempre vazias. Com isso dá para saber a linha real de cada uma, sem pedir mais nada. */
function decodificarCartoes(linhas, fx) {
  if (!(fx.r0 === 14 && fx.r1 === 57 && fx.c0 === colNum('O'))) return null;
  const tem = (l, cols, re) => !!l && cols.some(c => re.test(String(l[colNum(c)] == null ? '' : l[colNum(c)]).trim()));
  const NOME = ['O', 'AD', 'AS'], ROT = ['R', 'AG', 'AV'], res = []; let i = 0;
  for (const base of [14, 25, 36, 47]) {
    const L = linhas;
    if (!tem(L[i], NOME, /^Nome:/i) || !tem(L[i + 1], NOME, /grau|auxiliar/i) || !tem(L[i + 2], NOME, /PP$/i)
      || !tem(L[i + 3], ROT, /^Dura/i) || !tem(L[i + 4], ROT, /^Requisito/i)) return null;
    [0, 2, 6, 7, 8].forEach((d, k) => res.push([L[i + k], base + d])); i += 5;
    if (L[i] && !tem(L[i], NOME, /^Nome:/i)) { res.push([L[i], base + 9]); i++; }
  }
  return i === linhas.length ? res : null;
}
/* lê uma faixa e grava em out com a linha certa. cont.n conta os pedidos (para o diagnóstico). */
async function lerFaixa(id, aba, faixa, out, cont) {
  const fx = faixaInfo(faixa), linhas = await gviz(id, aba, faixa); cont.n++;
  const por = (l, r) => Object.entries(l).forEach(([c, v]) => { out[colLetra(+c) + r] = v; });
  if (linhas.length === fx.R || linhas.length === 0) return linhas.forEach((l, i) => por(l, fx.r0 + i));   // veio tudo, ou nada: sem dúvida
  const cart = decodificarCartoes(linhas, fx);
  if (cart) return cart.forEach(([l, r]) => por(l, r));
  /* faltou linha. Caso comum: lista preenchida de cima para baixo e o resto vazio. Um pedido só confirma isso. */
  const cauda = await gviz(id, aba, faixaDe(fx.c0, fx.r0 + linhas.length, fx.c1, fx.r1)); cont.n++;
  if (cauda.length === 0) return linhas.forEach((l, i) => por(l, fx.r0 + i));
  /* vazio no meio: divide a faixa até cada pedaço vir sem dúvida */
  if (fx.R <= 3) { await Promise.all(Array.from({ length: fx.R }, (_, k) => lerFaixa(id, aba, faixaDe(fx.c0, fx.r0 + k, fx.c1, fx.r0 + k), out, cont))); return; }
  const meio = Math.floor((fx.r0 + fx.r1) / 2);
  await Promise.all([lerFaixa(id, aba, faixaDe(fx.c0, fx.r0, fx.c1, meio), out, cont), lerFaixa(id, aba, faixaDe(fx.c0, meio + 1, fx.c1, fx.r1), out, cont)]);
}
/* devolve as linhas que o Google mandou, cada uma { númeroDaColuna: valor }, na ordem em que vieram */
function gviz(id, aba, faixa) {
  return new Promise((res, rej) => {
    const cb = '__gv' + uid(), s = document.createElement('script'); let feito = false;
    const fim = (err, dados) => { if (feito) return; feito = true; clearTimeout(tmo); try { delete window[cb]; } catch (e) { window[cb] = undefined; } s.remove(); err ? rej(err) : res(dados); };
    const tmo = setTimeout(() => fim(new Error('o Google não respondeu')), 15000);
    window[cb] = resp => {
      if (!resp || resp.status === 'error') { const e = resp && resp.errors && resp.errors[0]; return fim(new Error(e ? (e.detailed_message || e.message || e.reason) : 'erro do Google')); }
      const c0 = faixaInfo(faixa).c0, cols = (resp.table && resp.table.cols) || [];
      /* o Google pode devolver as colunas com a letra real da planilha (G, H…) ou contando do começo da faixa (A, B…).
         Decide uma vez por resposta: se a primeira letra já está dentro da faixa, são letras reais. */
      const letras = cols.length && cols.every(c => /^[A-Z]{1,3}$/.test(c.id || ''));
      const reais = letras && colNum(cols[0].id) >= c0;
      const linhas = ((resp.table && resp.table.rows) || []).map(row => {
        const l = {};
        (row.c || []).forEach((cel, j) => { if (!cel || cel.v == null || cel.v === '') return; l[reais && cols[j] ? colNum(cols[j].id) : c0 + j] = cel.v; });
        return l;
      });
      fim(null, linhas);
    };
    s.onerror = () => fim(new Error(IN_CLAUDE ? 'aqui dentro do Claude o Google é bloqueado' : 'o Google recusou (link errado ou ficha fechada)'));
    const csp = e => { if (/docs\.google\.com/.test(e.blockedURI || '')) { document.removeEventListener('securitypolicyviolation', csp); fim(new Error('esta página bloqueia o Google: use o arquivo baixado ou o .xlsx')); } };
    document.addEventListener('securitypolicyviolation', csp);
    s.src = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=${encodeURIComponent('out:json;responseHandler:' + cb)}&headers=0&sheet=${encodeURIComponent(aba)}&range=${faixa}`;
    document.head.appendChild(s);
  });
}
async function emLotes(itens, n, fn) { let i = 0; const trab = async () => { while (i < itens.length) { const k = i++; await fn(itens[k], k); } }; await Promise.all(Array.from({ length: n }, trab)); }
async function lerLink(link, aoAndar) {
  const id = idDoLink(link); if (!id) throw new Error('Link inválido. Cole o link da planilha (docs.google.com/spreadsheets/d/...).');
  const tarefas = []; Object.entries(BLOCOS).forEach(([aba, fx]) => fx.forEach(f => tarefas.push([aba, f])));
  const raw = {}, falhas = [], cont = { n: 0 }; let feitos = 0;
  const um = async ([aba, f]) => {
    /* cada faixa grava num rascunho próprio: se ela falhar no meio, não deixa meia faixa na ficha */
    const rasc = {};
    try { await lerFaixa(id, aba, f, rasc, cont); Object.assign(raw[aba] = raw[aba] || {}, rasc); } catch (e) { falhas.push(`${aba} ${f}: ${e.message}`); }
    feitos++; if (aoAndar) aoAndar(feitos, tarefas.length);
  };
  /* o primeiro pedido vai sozinho: se ele falhar (ficha fechada, link errado, Google bloqueado), nem tenta os outros */
  await um(tarefas[0]);
  if (falhas.length) throw new Error(falhas[0].split(': ').slice(1).join(': '));
  await emLotes(tarefas.slice(1), 6, um);
  if (falhas.length === tarefas.length) throw new Error(falhas[0].split(': ').slice(1).join(': '));
  return { raw, falhas, total: tarefas.length, pedidos: cont.n };
}

/* ───── aplicar ficha lida ao grupo ───── */
function aplicarFicha(pc, raw, origem) {
  const nova = parseFicha(raw), velha = pc.sheet;
  if (velha && num(nova.nivel) > num(velha.nivel)) { pc.subiu = { de: velha.nivel, para: nova.nivel, em: Date.now() }; try { Som.tocar('nivel'); toast(`<b>${esc(nova.personagem || nova.jogador || 'Jogador')}</b> subiu para o nível ${nova.nivel}! Veja o que ganha no Grupo.`, { tipo: 'bom', tempo: 7000 }); } catch (e) {} }   // a ficha subiu de nível: o mestre vê o aviso
  pc.sheet = nova; pc.origem = origem; pc.lidoEm = Date.now();
  if (!pc.live) pc.live = vivoNovo(nova);
  else {
    if (velha && num(nova.pv.atual) != null && nova.pv.atual !== (velha.pv && velha.pv.atual) && nova.pv.atual !== pc.live.pv) pc.aviso = { pv: nova.pv.atual };
    if (velha && nova.exaustao !== velha.exaustao) pc.live.exa = nova.exaustao;
    if (nova.pp.max !== (velha && velha.pp.max) && pc.live.pp > nova.pp.max) pc.live.pp = nova.pp.max;
    if (num(nova.pv.max) != null && pc.live.pv > nova.pv.max) pc.live.pv = nova.pv.max;   // a ficha mudou e o máximo caiu: a vida atual não passa dele
    (nova.dadosVida || []).forEach(d => { if (pc.live.hd[d.tipo] == null) pc.live.hd[d.tipo] = d.atual != null ? d.atual : d.max; });
  }
  return nova;
}
const Sync = {
  rodando: false,
  async um(pc, silencioso) {
    if (!pc.link) return;
    pc.sync = { estado: 'lendo', p: 0 }; if (!silencioso) Store.emit();
    try {
      const r = await lerLink(pc.link, (a, b) => { pc.sync = { estado: 'lendo', p: Math.round(100 * a / b) }; if (!silencioso) atualizarSync(pc); });
      Store.set(s => { const alvo = s.party.find(x => x.id === pc.id); if (alvo) { aplicarFicha(alvo, r.raw, 'link'); alvo.sync = { estado: r.falhas.length ? 'parcial' : 'ok', falhas: r.falhas, pedidos: r.pedidos, em: Date.now() }; } },
        silencioso ? null : `Ficha atualizada: ${nomePC(pc)}`, { semDesfazer: true });
    } catch (e) {
      pc.sync = { estado: 'erro', msg: e.message, em: Date.now() }; Store.emit();
      if (!silencioso) toast(`${esc(nomePC(pc))}: ${esc(e.message)}`, { tipo: 'ruim', tempo: 6000 });
    }
  },
  async todos(silencioso) {
    if (this.rodando) return; this.rodando = true;
    try { for (const pc of S().party.filter(p => p.link)) await this.um(pc, silencioso); } finally { this.rodando = false; }
  }
};
function atualizarSync(pc) { const el = document.querySelector(`[data-sync="${pc.id}"]`); if (el) el.textContent = `lendo ${pc.sync.p}%`; }
const nomePC = pc => (pc.sheet && (pc.sheet.personagem || pc.sheet.jogador)) || pc.apelido || 'Jogador';
const jogadorPC = pc => (pc.sheet && pc.sheet.jogador) || pc.apelido || '';
/* ───── diagnóstico: o que a leitura trouxe de cada parte da ficha (Ajustes › Fichas dos jogadores) ───── */
function resumoFicha(sh) {
  if (!sh) return [];
  const n = a => (a || []).length, cart = a => (a || []).length, completos = a => (a || []).filter(c => c.desc && c.grau).length;
  return [
    ['Nome, nível, espécie e estilo', [sh.personagem || sh.jogador, sh.nivel, sh.especie, sh.estilo].filter(Boolean).length + ' de 4'],
    ['PV · PP · CR', `${sh.pv.max ?? '—'} · ${sh.pp.max ?? '—'} · ${sh.cr ?? '—'}`],
    ['Técnicas do estilo (cartões)', cart(sh.cartoesEstilo) ? `${cart(sh.cartoesEstilo)}, ${completos(sh.cartoesEstilo)} com grau e descrição` : 'nenhuma'],
    ['Técnicas da fruta (cartões)', sh.temFruta ? (cart(sh.cartoesAkuma) ? `${cart(sh.cartoesAkuma)}, ${completos(sh.cartoesAkuma)} com grau e descrição` : 'nenhuma') : 'sem fruta'],
    ['Habilidades básicas', n(sh.hb) || 'nenhuma'], ['Características do estilo', n(sh.caracteristicas) || 'nenhuma'],
    ['Poderes da fruta', sh.temFruta ? (n(sh.poderes) || 'nenhum') : 'sem fruta'],
    ['Traços', n(sh.tracos) || 'nenhum'], ['Singularidades · defeitos', `${n(sh.singularidades)} · ${n(sh.defeitos)}`],
    ['Antecedente', sh.antecedenteNome || sh.antecedente || 'vazio'], ['Armas', n(sh.armas) || 'nenhuma'], ['Inventário (14 linhas)', (n(sh.itens) || 'nenhum item') + ((sh.itens || []).some(x => x.dentro) ? ` · ${(sh.itens || []).reduce((t, x) => t + (x.dentro || []).length, 0)} dentro de recipientes (anotação)` : '')], ['Beli', sh.dinheiro ?? '—']
  ];
}

/* ───── NPC aliado e quem participa do encontro (Bloco 2) ─────
   pc.aliado = alguém com ficha que não é jogador. Fica no Grupo, mas não entra na média de nível, no XP nem na Barra de Bônus.
   No Encontro, cada pessoa tem uma caixa "participa": se o mestre marca, ela entra naquela conta. */
function pcsMesa(s) { return s.party.filter(p => p.sheet && !p.aliado && !p.pdm); }
function participaEnc(s, p) { if (!naMesa(p)) return false; const v = ((s.encontro || {}).participa || {})[p.id]; return v !== undefined ? !!v : !p.aliado && !p.pdm; }
/* Fichas do mestre (PDM): ficam em s.party com pdm:true. Só aparecem no Grupo quando p.noGrupo; vilão é p.vilao.
   Tudo (PV, PP, CR, técnicas, dado de vida) vem da ficha de cada um: nada é fixo por raça ou personagem. */
const naMesa = p => !p.pdm || !!p.noGrupo;
const grupoDe = s => s.party.filter(naMesa);
