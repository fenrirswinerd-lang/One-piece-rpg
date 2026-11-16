/* ═══════════ EFETIVO: ligações com Tripulação e Batalha naval ═══════════
   (as funções ficam em 71b-estaleiro.js; aqui só entram nas abas que nascem depois dele) */
(() => { const v = VIEWS.tripulacao, orig = v.render; v.render = function () { const h = orig.apply(this, arguments); return typeof h === 'string' ? h.replace(/<\/div>\s*$/, nvEfetivoHTML() + mjHTML() + frTripHTML() + '</div>') : h; };
  if (v.chaves && !v.chaves.includes('navio')) v.chaves.push('navio'); })();

/* aviso na Batalha naval quando o efetivo não fecha */
(() => { const v = VIEWS.naval; if (!v) return; const orig = v.render; v.render = function () { const h = orig.apply(this, arguments); if (typeof h !== 'string' || !souMestre()) return h;
  const E = nvEfetivo(), r = E ? E.L.filter(x => x.est !== 'ok' && (x.k === 'nav' || x.k === 'art' || x.k === 'polv')) : []; if (!r.length) return h;
  const av = `<p class="est-efe bn-efe"><b>Efetivo do navio do bando:</b> ${r.map(x => `${x.n}: ${x.est === 'sem' ? x.sem : x.mn}`).join(' ')}</p>`;
  return h.replace('</header>', '</header>' + av); }; })();
