/* ═══════════ BUSCA NO TEXTO DO LIVRO (complemento do Pergunte ao livro, sem IA) ═══════════
   O texto do Livro do Jogador, do Guia do Narrador e do Manual dos Inimigos fica em livro.js, em pedaços curtos,
   cada um com a página e o título da seção. Só é baixado quando alguém faz a primeira pergunta.
   A busca é por palavras (com sinônimos e erro de digitação), não entende a pergunta: mostra o trecho e a página.
   Jogador: só o Livro do Jogador. Guia do Narrador e Manual dos Inimigos: só o mestre. */
const Liv = { promessa: null, falhou: false, idx: null };
function livCarregar() {
  if (window.LIVRO) return Promise.resolve();
  if (Liv.promessa) return Liv.promessa;
  if (!window.LIVRO_URL) { Liv.falhou = true; return Promise.reject(new Error('livro.js')); }
  Liv.promessa = new Promise((ok, no) => {
    const s = document.createElement('script'); s.src = window.LIVRO_URL;
    s.onload = () => { ok(); if (App.rota === 'oraculo') App.render(); };
    s.onerror = () => { Liv.falhou = true; Liv.promessa = null; no(new Error('livro.js')); if (App.rota === 'oraculo') App.render(); };
    document.head.appendChild(s);
  });
  Liv.promessa.catch(() => {});
  return Liv.promessa;
}
function livIndice() {
  if (Liv.idx) return Liv.idx; const L = window.LIVRO; if (!L) return null;
  const docs = [], df = new Map();
  Object.keys(L).forEach(sig => { const b = L[sig]; b.p.forEach((x, i) => {
    const tit = b.tit[x[1]] || '', tok = new Set(oraTok(x[2])), tt = new Set(oraTok(tit));
    tt.forEach(w => tok.add(w)); tok.forEach(w => df.set(w, (df.get(w) || 0) + 1));
    docs.push({ sig, i, pag: x[0], tit, tok, tt, mestre: !!b.mestre });
  }); });
  return (Liv.idx = { docs, df, n: docs.length });
}
/* palavra que não existe no livro → a mais parecida que existe (erro de digitação, plural diferente) */
function livParecida(w, I) {
  if (I.df.has(w)) return w; let melhor = null, nota = 0;
  I.df.forEach((n, v) => { const b = oraBate(w, v); if (b > nota || (b === nota && b && n > (I.df.get(melhor) || 0))) { nota = b; melhor = v; } });
  return nota >= 1.5 ? melhor : w;
}
function livBuscar(q, max = 6, frouxo = false) {
  const I = livIndice(); if (!I) return null;
  const qt = [...new Set(oraTok(q))].filter(w => !/^\d$/.test(w)); if (!qt.length) return [];
  const mestre = souMestre(), idf = w => Math.log(1 + I.n / (1 + (I.df.get(w) || 0)));
  const exp = qt.map(w => { const p = livParecida(w, I); return [p].concat((ORA_SIN[w] || []).map(oraStem).filter(x => x !== '฿' && x !== p)); });
  const res = [];
  for (const d of I.docs) {
    if (d.mestre && !mestre) continue;
    let s = 0, bateu = 0;
    for (const alts of exp) { let m = 0;
      for (let k = 0; k < alts.length; k++) { const a = alts[k], f = k ? 0.7 : 1; if (d.tt.has(a)) m = Math.max(m, idf(a) * 2.4 * f); else if (d.tok.has(a)) m = Math.max(m, idf(a) * f); }
      if (m) bateu++; s += m; }
    if (!bateu) continue; const cobre = bateu / exp.length; if (cobre < (frouxo ? 0.5 : exp.length <= 2 ? 1 : 0.6)) continue;
    const noTitulo = exp.every(a => d.tt.has(a[0])) && d.tt.size <= exp.length + 1 ? 1.6 : 1;   // a pergunta é o próprio título da seção
    res.push({ d, s: s * cobre * cobre * noTitulo / Math.pow(Math.max(20, d.tok.size), 0.15) });
  }
  if (!res.length && !frouxo && exp.length === 2) return livBuscar(q, max, true);   // duas palavras que não aparecem juntas: mostra onde cada uma aparece
  res.sort((a, b) => b.s - a.s);
  /* as palavras da pergunta juntas, na mesma ordem, valem mais */
  const pares = []; for (let k = 0; k + 1 < qt.length; k++) pares.push(qt[k] + ' ' + qt[k + 1]);
  const topo = res.slice(0, 50);
  if (pares.length) topo.forEach(r => { const t = oraTok(livTexto(r.d)).join(' '); r.s *= 1 + 0.35 * pares.filter(p => t.includes(p)).length; });
  topo.sort((a, b) => b.s - a.s);
  const vistos = {}, out = [];
  for (const r of topo) { const k = r.d.sig + r.d.pag; vistos[k] = (vistos[k] || 0) + 1; if (vistos[k] > 2) continue; out.push(r); if (out.length >= max) break; }
  const marca = new Set(); exp.forEach(a => a.forEach(w => marca.add(w)));
  return out.map(r => ({ ...r.d, texto: livTexto(r.d), marca }));
}
const livTexto = d => window.LIVRO[d.sig].p[d.i][2];
const livMarca = (t, marca) => esc(t).replace(/[A-Za-zÀ-ÖØ-öø-ÿ0-9]+/g, w => marca && marca.has(oraStem(oraNorm(w))) ? `<mark>${w}</mark>` : w).replace(/ ¶ /g, '<br>');
/* trecho curto em volta de onde as palavras aparecem */
function livTrecho(t, marca) {
  if (t.length <= 460) return livMarca(t, marca);
  const fr = (t.match(/[^.!?¶]+[.!?¶]*\s*/g) || [t]).map(x => x.trim()).filter(Boolean);   // frases (sem lookbehind: Safari antigo não aceita)
  let best = 0, nota = -1; fr.forEach((f, k) => { const n = oraTok(f).filter(w => marca.has(w)).length; if (n > nota) { nota = n; best = k; } });
  let a = best, b = best, tam = fr[best].length;
  while (tam < 380 && (a > 0 || b < fr.length - 1)) { if (b < fr.length - 1) { b++; tam += fr[b].length; } if (tam < 380 && a > 0) { a--; tam += fr[a].length; } }
  return (a > 0 ? '… ' : '') + livMarca(fr.slice(a, b + 1).join(' ').slice(0, 620), marca) + (b < fr.length - 1 ? ' …' : '');
}
const LIV_NOME = { LJ: 'Livro do Jogador', GN: 'Guia do Narrador', MI: 'Manual dos Inimigos' };
function livSecaoHTML(q) {
  if (!window.LIVRO) {
    if (window.LIVRO_URL && !Liv.falhou) { livCarregar(); return { n: 0, h: '<p class="nota ora-liv-esp">Procurando também no texto do livro…</p>' }; }
    return { n: 0, h: `<p class="nota ora-liv-esp">${Liv.falhou && window.LIVRO_URL ? 'Não consegui baixar o texto do livro agora. Tente de novo daqui a pouco.' : 'A busca no texto inteiro do livro funciona no site publicado (aqui na prévia ela fica desligada para o arquivo não pesar).'}</p>` };
  }
  let r; try { r = livBuscar(q) || []; } catch (e) { r = []; }
  if (!r.length) return { n: 0, h: '' };
  return { n: r.length, h: `<h2 class="ora-h">No texto do livro <small>${souMestre() ? 'Jogador, Narrador e Inimigos' : 'Livro do Jogador'}</small></h2><div class="ora-grade ora-liv">${r.map(x =>
    `<article class="ora-c"><h3>${esc(x.tit || LIV_NOME[x.sig])} <small>${x.sig} p. ${x.pag}</small></h3><p>${livTrecho(x.texto, x.marca)}</p>
      <p><span class="ora-selo ok">texto do livro · ${x.sig} p. ${x.pag}</span> <button class="link" data-act="liv-pag" data-s="${x.sig}" data-p="${x.pag}">ler a página inteira</button></p></article>`).join('')}</div>` };
}
/* a página inteira, para ler no contexto; setas passam a página */
function livPaginaHTML(sig, pag) {
  const b = window.LIVRO[sig], ps = b.p.filter(x => x[0] === pag), ult = b.p[b.p.length - 1][0];
  const marca = Ora.q ? new Set(oraTok(Ora.q).map(w => livParecida(w, livIndice()))) : null;
  let tit = null, h = '';
  ps.forEach(x => { const t = b.tit[x[1]] || ''; if (t !== tit) { tit = t; if (t) h += `<h3>${esc(t)}</h3>`; } h += `<p>${livMarca(x[2], marca)}</p>`; });
  return `<h2>${esc(b.nome)} <small>página ${pag}</small></h2>
    <div class="linha-bts"><button class="bt fino" data-act="liv-pag" data-s="${sig}" data-p="${pag - 1}" ${pag <= 1 ? 'disabled' : ''}>◂ Página ${pag - 1}</button><button class="bt fino" data-act="liv-pag" data-s="${sig}" data-p="${pag + 1}" ${pag >= ult ? 'disabled' : ''}>Página ${pag + 1} ▸</button></div>
    <div class="liv-pag">${h || '<p class="nota">Esta página não tem texto (só imagem ou tabela em imagem).</p>'}</div>
    <p class="nota">Texto tirado do PDF: tabelas podem aparecer desalinhadas. Na dúvida, vale o livro.</p>`;
}
ACT['liv-pag'] = el => {
  const sig = el.dataset.s, pag = +el.dataset.p; if (!window.LIVRO || !window.LIVRO[sig] || pag < 1) return;
  if (window.LIVRO[sig].mestre && !souMestre()) return;
  Modal.abrir(livPaginaHTML(sig, pag), { classe: 'larga liv-modal', titulo: 'Página do livro' });
};
