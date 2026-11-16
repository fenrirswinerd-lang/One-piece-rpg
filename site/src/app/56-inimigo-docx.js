/* ═══════════ INIMIGO por arquivo .docx (Modelo Ficha de Inimigos, mesmo formato do Manual dos Inimigos) ═══════════
   Lê a tabela do Word: nome, ND, XP, PP, CR, PV (dados), Proficiência, CD, Deslocamento/Nado/Voo, os 6 atributos
   e as seções (Características, Aspectos, Ações, Ações Bônus, Reações, Ações Poderosas, Ações Lendárias).
   Cada tabela com "Nível de Desafio" vira um inimigo. Ataques com "+X para atingir" e "Acerto: N (dados)" viram botões de rolar. */

/* zip mínimo (o .docx é um zip): devolve ler(nome) → texto */
async function zipLeitor(buf) {
  if (typeof DecompressionStream === 'undefined') throw new Error('Este navegador é antigo demais para abrir .docx. Use o Chrome atualizado.');
  const u8 = new Uint8Array(buf), dv = new DataView(buf), dec = new TextDecoder();
  let fim = -1;
  for (let i = u8.length - 22; i >= Math.max(0, u8.length - 70000); i--) if (dv.getUint32(i, true) === 0x06054b50) { fim = i; break; }
  if (fim < 0) throw new Error('Esse arquivo não é um .docx.');
  const qtd = dv.getUint16(fim + 10, true); let p = dv.getUint32(fim + 16, true); const arq = {};
  for (let k = 0; k < qtd; k++) {
    const metodo = dv.getUint16(p + 10, true), tam = dv.getUint32(p + 20, true), nl = dv.getUint16(p + 28, true), xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), loc = dv.getUint32(p + 42, true);
    arq[dec.decode(u8.subarray(p + 46, p + 46 + nl))] = { metodo, tam, loc }; p += 46 + nl + xl + cl;
  }
  return async nome => {
    const f = arq[nome]; if (!f) return null;
    const ini = f.loc + 30 + dv.getUint16(f.loc + 26, true) + dv.getUint16(f.loc + 28, true), dados = u8.subarray(ini, ini + f.tam);
    if (f.metodo === 0) return dec.decode(dados);
    return dec.decode(await new Response(new Blob([dados]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
  };
}

const SECOES_INI = ['Características', 'Aspectos', 'Ações Bônus', 'Ações Poderosas', 'Ações Lendárias', 'Ações', 'Reações'];
const semAc = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const secaoDe = txt => SECOES_INI.find(x => semAc(x) === semAc(txt).replace(/:$/, '')) || null;
/* linhas que continuam a anterior (não são uma habilidade nova) */
const CONTINUA = /^(acerto|efeito|falha|sucesso|alternativamente|especial|obs|observa[cç][aã]o)$/i;

/* texto do Word → linhas: [{ cel: [parágrafos], ...}] por linha de tabela, e parágrafos soltos */
function docxBlocos(xmlTxt) {
  const d = new DOMParser().parseFromString(xmlTxt, 'application/xml'), W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  const filhos = (el, nome) => [...el.childNodes].filter(n => n.localName === nome);
  const txtP = p => [...p.getElementsByTagNameNS(W, '*')].filter(n => n.localName === 't' || n.localName === 'tab' || n.localName === 'br')
    .map(n => n.localName === 't' ? n.textContent : n.localName === 'tab' ? ' ' : '\n').join('').replace(/[  ]+/g, ' ').trim();
  const body = d.getElementsByTagNameNS(W, 'body')[0]; if (!body) return [];
  const out = [];
  [...body.childNodes].forEach(n => {
    if (n.localName === 'tbl') {
      const tab = [];
      filhos(n, 'tr').forEach(tr => tab.push(filhos(tr, 'tc').map(tc => [...tc.getElementsByTagNameNS(W, 'p')].map(txtP).filter(Boolean))));
      out.push({ tabela: tab });
    } else if (n.localName === 'p') { const t = txtP(n); if (t) out.push({ p: t }); }
  });
  return out;
}

/* um inimigo a partir de linhas: [[célula, célula...], ...] (cada célula = lista de parágrafos) */
function inimigoDeLinhas(linhas) {
  const tudo = linhas.flat(2).join('\n');
  const pega = (re, f = x => x) => { const m = tudo.match(re); return m ? f(m[1], m) : null; };
  const inteiro = s => s == null ? null : parseInt(String(s).replace(/\./g, ''), 10);
  const nome = (linhas.flat(2).find(t => t && !/desafio|experi[êe]ncia|pontos de/i.test(t)) || 'Inimigo').replace(/\s+/g, ' ').trim();
  const nd = pega(/n[íi]vel de desafio:?\s*([\d]+\s*\/\s*\d+|[\d.,]+)/i, x => x.replace(/\s/g, '').replace(',', '.')) || '0';
  const xpTxt = pega(/experi[êe]ncia:?\s*([\d.]+)/i, inteiro);
  const pp = pega(/pontos de poder:?\s*(\d+)/i, inteiro);
  const cr = pega(/classe de resist[êe]ncia:?\s*(\d+)/i, inteiro);
  const pv = pega(/pontos de vida:?\s*([\d.]+)/i, inteiro), pvDados = pega(/pontos de vida:?\s*[\d.]+\s*\(([^)]+)\)/i, x => x.replace(/\s/g, ''));
  const prof = pega(/b[ôo]nus de profici[êe]ncia:?\s*([+-]?\d+)/i, x => parseInt(x, 10));
  const cd = pega(/classe de dificuldade:?\s*(\d+)/i, inteiro);
  const desl = pega(/deslocamento:?\s*([\d.,]+\s*m(?:etros?)?)/i);
  const outros = []; [['Nado', /nado:?\s*([\d.,]+\s*m(?:etros?)?)/i], ['Voo', /voo:?\s*([\d.,]+\s*m(?:etros?)?)/i], ['Escalada', /escalada:?\s*([\d.,]+\s*m(?:etros?)?)/i]]
    .forEach(([r, re]) => { const v = pega(re); if (v) outros.push(`${r}: ${v}`); });
  const perc = pega(/percep[çc][ãa]o passiva:?\s*(\d+)/i, inteiro);
  /* atributos: célula "FOR" seguida de "26 (+8)" (ou "FOR 26 (+8)" num parágrafo só) */
  const attrs = ['FOR', 'DES', 'CON', 'SAB', 'PRE', 'VON'].map(a => {
    const m = tudo.match(new RegExp('\\b' + a + '\\b[\\s:]*\\n?\\s*(\\d+)\\s*\\(\\s*([+\\-−–]?\\s*\\d+)\\s*\\)'));
    if (!m) return null; const v = +m[1]; return [v, parseInt(m[2].replace(/[−–]/, '-').replace(/\s/g, ''), 10)];
  });
  /* seções: linha cuja 1ª célula é o nome da seção; ou parágrafo solto com o nome da seção */
  const texto = []; let sec = null;
  const entrada = t => {
    const m = t.match(/^([^:(]{1,90}?(?:\s*\([^)]*\))?)\s*:\s*([\s\S]*)$/);   // o nome pode ter (Técnica | Custo: 9 PP) antes dos dois-pontos
    if (m && !CONTINUA.test(m[1].trim())) texto.push({ sec, nome: m[1].trim(), texto: m[2].trim() });
    else if (texto.length && texto[texto.length - 1].sec === sec) texto[texto.length - 1].texto += '\n' + t;
    else texto.push({ sec, nome: '', texto: t });
  };
  linhas.forEach(cels => {
    const s0 = cels[0] && cels[0].length === 1 ? secaoDe(cels[0][0]) : null;
    if (s0) { sec = s0; cels.slice(1).forEach(c => c.forEach(entrada)); }
    else if (sec && cels.length === 1 && cels[0].length === 1 && secaoDe(cels[0][0])) sec = secaoDe(cels[0][0]);
    else if (sec) cels.forEach(c => c.forEach(entrada));
  });
  /* ataques: "+14 para atingir, alcance 1,5 metro ... Acerto: 26 (4d8+8) de dano Contundente" */
  const ataques = [];
  texto.forEach(e => {
    const b = e.texto.match(/([+-]\s*\d+)\s*para atingir/i), a = e.texto.match(/acerto:?\s*(\d+)\s*\(\s*([\dd+\-\s]+)\s*\)\s*(?:de\s+)?dano\s+([A-Za-zÀ-ú]+)?/i);
    if (!b) return;
    const alc = e.texto.match(/(?:alcance|dist[âa]ncia)\s+([\d.,/]+\s*metros?)/i), custo = e.nome.match(/custo:?\s*(\d+)\s*pp/i);
    ataques.push({ nome: e.nome.replace(/\s*\(.*$/, '').trim(), tipo: /dist[âa]ncia/i.test(e.texto.slice(0, 60)) ? 'Distância' : 'Corpo a Corpo', bonus: parseInt(b[1].replace(/\s/g, ''), 10),
      alcance: alc ? alc[1] : '', media: a ? +a[1] : null, dados: a ? a[2].replace(/\s/g, '') : '', dano: a && a[3] ? a[3] : '', pp: custo ? +custo[1] : null, tecnica: /t[ée]cnica/i.test(e.nome) ? e.nome.match(/\(([^)]*)\)/)?.[1] || null : null });
  });
  const ndN = String(nd);
  /* nome todo em maiúsculas (como no modelo) → "Almirante de Frota" */
  const bonito = /[a-zà-ú]/.test(nome) ? nome : nome.toLowerCase().replace(/(^|\s)([a-zà-ú])/g, (x, e, l) => e + l.toUpperCase()).replace(/\s(De|Da|Do|Das|Dos|E)\s/g, x => x.toLowerCase());
  return { id: 'custom-' + uid(), nome: bonito.length > 60 ? bonito.slice(0, 60) : bonito, cat: 'Minhas criaturas', nd: ndN, xp: xpTxt ?? ND_XP[ndN] ?? 0, pp, cr: cr ?? 10, prof, desl: desl || '',
    pv: pv ?? 1, pvDados: pvDados || null, cd, outros, lore: '', attrs: attrs.every(Boolean) ? attrs : null, perc, ataques, texto: texto.map(({ sec, nome, texto }) => ({ sec, nome, texto })), doDocx: true };
}

async function lerDocxInimigos(buf) {
  const ler = await zipLeitor(buf), doc = await ler('word/document.xml');
  if (!doc) throw new Error('Esse .docx não tem texto (word/document.xml).');
  const blocos = docxBlocos(doc), lista = [];
  /* uma tabela com "Nível de Desafio" = um inimigo. Sem tabela: o documento inteiro, parágrafo por parágrafo */
  blocos.filter(b => b.tabela && /n[íi]vel de desafio/i.test(b.tabela.flat(2).join(' '))).forEach(b => lista.push(inimigoDeLinhas(b.tabela)));
  if (!lista.length) {
    const ps = blocos.flatMap(b => b.p ? [[[b.p]]] : (b.tabela || []));
    if (/n[íi]vel de desafio/i.test(ps.flat(2).join(' '))) lista.push(inimigoDeLinhas(ps));
  }
  if (!lista.length) throw new Error('Não achei a ficha: o documento precisa ter "Nível de Desafio" (modelo da Ficha de Inimigos).');
  return lista;
}

/* conferência antes de guardar: mostra o que foi lido e o que faltou */
let IMP_INI = [];
function previaInimigos(lista) {
  const falta = m => [['ND', m.nd !== '0'], ['CR', m.cr != null], ['PV', m.pv > 1], ['atributos', !!m.attrs], ['CD', m.cd != null]].filter(x => !x[1]).map(x => x[0]);
  return `<h2>${ic('status:notas', 32)} Ficha de inimigo lida</h2>
    <p class="nota">Confira os números. Nada foi guardado ainda.</p>
    ${lista.map((m, k) => `<article class="card-esc imp-ini">
      <h3>${esc(m.nome)} <small>ND ${esc(m.nd)} · ${fmt(m.xp)} XP${m.pp ? ` · ${m.pp} PP` : ''}</small></h3>
      <p>CR <b>${m.cr ?? '—'}</b> · PV <b>${fmt(m.pv)}</b>${m.pvDados ? ` (${esc(m.pvDados)})` : ''} · CD <b>${m.cd ?? '—'}</b> · Prof. ${m.prof != null ? sg(m.prof) : '—'} · ${esc(m.desl || 'sem deslocamento')}${m.outros.length ? ' · ' + esc(m.outros.join(' · ')) : ''}</p>
      ${m.attrs ? `<p>${['FOR', 'DES', 'CON', 'SAB', 'PRE', 'VON'].map((a, i) => `${a} ${m.attrs[i][0]} (${sg(m.attrs[i][1])})`).join(' · ')}</p>` : ''}
      <p>${m.ataques.length} ataque(s) com botão de rolar: ${esc(m.ataques.map(a => `${a.nome} ${sg(a.bonus)}${a.dados ? ' ' + a.dados : ''}`).join(', ') || 'nenhum')}</p>
      <p class="nota">${[...new Set(m.texto.map(e => e.sec).filter(Boolean))].map(s => `${esc(s)}: ${m.texto.filter(e => e.sec === s).length}`).join(' · ') || 'nenhuma seção achada'}</p>
      ${falta(m).length ? `<p class="ruim">Não achei: ${falta(m).join(', ')}. Dá para guardar e corrigir depois.</p>` : ''}
      <label class="campo-inline check"><input type="checkbox" data-imp-ini="${k}" checked> Guardar este</label></article>`).join('')}
    <div class="linha-bts"><button class="bt bom" data-act="ini-docx-ok">Guardar na biblioteca (Minhas criaturas)</button><button class="bt fino" data-act="modal-fechar">Cancelar</button></div>`;
}
ACT['ini-docx'] = () => escolherArquivos('.docx', true, async fs => {
  const lista = [], erros = [];
  for (const f of fs) { try { lista.push(...await lerDocxInimigos(await f.arrayBuffer())); } catch (e) { erros.push(`${f.name}: ${e.message}`); } }
  if (erros.length) toast(esc(erros.join(' · ')), { tipo: 'ruim', tempo: 8000 });
  if (!lista.length) return;
  IMP_INI = lista; Modal.abrir(previaInimigos(lista), { classe: 'larga' });
});
ACT['ini-docx-ok'] = () => {
  const marcados = IMP_INI.filter((m, k) => { const c = document.querySelector(`[data-imp-ini="${k}"]`); return !c || c.checked; });
  if (!marcados.length) return toast('Nenhum marcado.');
  Store.set(s => { s.custom = (s.custom || []).concat(marcados); }, `Inimigo(s) do .docx: ${marcados.map(m => m.nome).join(', ')}`);
  IMP_INI = []; Modal.fechar(); toast(`${marcados.length} inimigo(s) na biblioteca, em <b>Minhas criaturas</b>.`, { tipo: 'bom' });
};
if (!ACT['modal-fechar']) ACT['modal-fechar'] = () => Modal.fechar();
