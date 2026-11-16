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
