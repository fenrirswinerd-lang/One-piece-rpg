/* ═══════════ REAÇÕES NA MESA ═══════════
   Seis botõezinhos no canto do quadro. Quem clica solta um balão que sobe na tela de todo mundo, com o nome de quem reagiu.
   Jogador grava no próprio registro (jogadores/uid); o mestre grava no estado da mesa. Não mexe em regra nenhuma. */
const REAC = [['boa', '👏', 'Boa!'], ['riso', '😂', 'Hahaha'], ['susto', '😱', 'Eita!'], ['bora', '🔥', 'Bora!'], ['morri', '💀', 'Morri'], ['brinde', '🍖', 'Kanpai!']];
const Reac = { visto: Date.now(), ult: 0, n: 0,
  ligado() { return lembrar('reac') !== '0'; },
  mostrar(k, nome, cor) {
    const q = $('#mt-quadro'), r = REAC.find(x => x[0] === k); if (!q || !r || App.rota !== 'mesa' || !this.ligado()) return;
    const b = document.createElement('div'); b.className = 'reac-b'; b.style.left = (12 + (this.n++ * 37) % 70) + '%'; if (cor) b.style.setProperty('--rc', cor);
    b.innerHTML = `<b>${r[1]}</b><span>${esc(r[2])}</span><small>${esc(nome || '')}</small>`; q.appendChild(b);
    if (Som.ok() && !Som2.mudo) Som.tom(520 + (this.n % 4) * 90, 880, 0.12, 'triangle', 0.07 * (Som2.vol.e ?? 0.8));
    setTimeout(() => b.remove(), 2900);
  },
  ver() {
    const agora = Date.now(); let max = this.visto;
    const olha = (rc, nome, cor) => { if (rc && rc.em > this.visto && agora - rc.em < 9000) { this.mostrar(rc.k, nome, cor); max = Math.max(max, rc.em); } };
    (M.jogadoresTodos || M.jogadores || []).forEach(j => olha(j.reac, nomeJ(j), Dado3D.CORES[Dado3D.corDe(j.uid)]));
    olha((M.estado || {}).reac, 'Mestre', '#ffb4a8');
    this.visto = max;
  }
};
ACT['reac'] = el => {
  const t = Date.now(); if (t - Reac.ult < 1100) return; Reac.ult = t;
  const reac = { k: el.dataset.k, em: t };
  (souMestre() ? gravarEstado({ reac }) : DB.gravar('jogadores/' + Eu.uid, { reac })).catch(() => {});
};
ACT['reac-lig'] = el => { lembrar('reac', el.checked ? '1' : '0'); const b = $('#mt-reac'); if (b) b.hidden = !el.checked; };
Mesa.on(ch => { if (Mesa.aberta && (ch === 'jogadores' || ch === 'estado')) Reac.ver(); });
const _renderMesaReac = VIEWS.mesa.render;
VIEWS.mesa.render = function () {
  return _renderMesaReac.call(this).replace('<div class="mt-ferr">', `<div class="mt-reac" id="mt-reac" ${Reac.ligado() ? '' : 'hidden'} role="group" aria-label="Reações">${REAC.map(r => `<button data-act="reac" data-k="${r[0]}" title="${r[2]}" aria-label="${r[2]}">${r[1]}</button>`).join('')}</div><div class="mt-ferr">`);
};
