/* ═══════════ ABAS IRMÃS (só o mestre) ═══════════
   Abas que faziam quase o mesmo trabalho agora dividem um lugar no menu: ficam lado a lado, com botões no topo.
   Nada foi apagado; só saiu do menu o que era repetido. Para juntar outro par, é só acrescentar aqui e em OCULTAS (33-mesa.js). */
const IRMAS = [['inimigos', 'encontro'], ['mundo', 'lojas'], ['tripulacao', 'navio', 'banco'], ['recompensas', 'mural'], ['viagem', 'tesouro'], ['naval', 'frota']];
NAV.mestre.forEach(g => { g[1] = g[1].filter(r => !OCULTAS.includes(r)); });
IRMAS.forEach(par => par.forEach(r => {
  const v = VIEWS[r]; if (!v || v._irma) return; const orig = v.render; v._irma = true;
  v.render = function () {
    const h = orig.apply(this, arguments);
    if (!souMestre() || typeof h !== 'string') return h;
    return `<nav class="chips irmas" aria-label="Abas do mesmo assunto">${par.map(x => `<button class="chip ${x === r ? 'on' : ''}" data-rota="${x}">${ic((VIEWS[x] || {}).icone || 'mesa:d20', 32)} ${esc((VIEWS[x] || {}).titulo || x)}</button>`).join('')}</nav>` + h;
  };
}));

/* ───── v30 · jogador: menu enxuto com abas irmãs ─────
   O menu do jogador tinha 12 abas. As que repetem assunto saem do menu e abrem pelos botões no topo da aba "mãe":
   Tripulação → Navio, Banco do bando · Jornal → Procurados · Pergunte ao livro → Catálogo.
   Só saem quando dá para chegar nelas: se o mestre ainda trancou a aba mãe, a irmã continua no menu.
   No menu da conta, "Abas do menu: Todas" volta o menu completo (vale só para quem escolheu). Nada foi apagado. */
const IRMAS_JOG = [['tripulacao', 'navio', 'banco'], ['jornal', 'mural'], ['oraculo', 'catalogo']];
PrefNav.todas = function () { return lembrar(this.k('todas')) === '1'; };
const irmaJog = r => IRMAS_JOG.find(g => g.includes(r));
const vistaJog = r => { const v = VIEWS[r]; return !!v && liberado(r) && (!v.visivelBase || v.visivelBase()); };
const escondeJog = r => { if (souMestre() || PrefNav.todas()) return false; const g = irmaJog(r); return !!g && g[0] !== r && vistaJog(g[0]); };
IRMAS_JOG.forEach(g => g.forEach(r => { const v = VIEWS[r]; if (!v || v._irmaJ) return; v._irmaJ = true;
  v.visivelBase = v.visivel || null; v.visivel = () => (!v.visivelBase || v.visivelBase()) && !escondeJog(r);
  const orig = v.render;
  v.render = function () { const h = orig.apply(this, arguments); if (souMestre() || typeof h !== 'string' || PrefNav.todas()) return h;
    /* a irmã trancada aparece com cadeado: o jogador sabe que existe, e abre quando o mestre liberar */
    const L = g.filter(x => VIEWS[x] && (!VIEWS[x].visivelBase || VIEWS[x].visivelBase())); if (L.length < 2 || !L.includes(r)) return h;
    return `<nav class="chips irmas" aria-label="Abas do mesmo assunto">${L.map(x => { const t = !liberado(x); return `<button class="chip ${x === r ? 'on' : ''} ${t ? 'trancado' : ''}" data-rota="${x}" ${x === r ? 'aria-current="page"' : ''} ${t ? 'title="Trancado pelo mestre"' : ''}>${ic(VIEWS[x].icone || 'mesa:d20', 32, t ? 'silhueta' : '')} ${esc(VIEWS[x].titulo || x)}${t ? ' ' + ic('mesa:cadeado', 20) : ''}</button>`; }).join('')}</nav>` + h; };
}));
ACT['nav-todas'] = el => { lembrar(PrefNav.k('todas'), el.dataset.v); montarNav(); App.render(); $$('.pref-todas .bt').forEach(b => b.classList.toggle('on', b.dataset.v === el.dataset.v)); };
if (window.__expor) Object.assign(window, { vistaJog, escondeJog, IRMAS_JOG, VIEWS });
