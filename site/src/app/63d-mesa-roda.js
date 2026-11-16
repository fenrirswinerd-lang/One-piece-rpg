/* ═══════════ A RODA DA MESA ═══════════
   1) Lugares: o retrato de cada jogador (e do mestre) fica na borda de baixo do quadro, com a barra de PV e a última rolagem.
      O dado sai do lugar de quem rolou.
   2) Faixa de vez: quando o turno do combate muda, aparece "Vez de Fulano" no quadro de todos.
   3) Dado que fica: o retrato do fim da jogada fica num cantinho do quadro até a próxima rolagem.
   4) Palco: o quadro ocupa a tela inteira (dados, lugares, reações e faixa continuam funcionando). Esc sai.
   Só mostra o que já era público (PV dos jogadores e a vez do combate). Não muda regra nenhuma. */
const Roda = { ultVez: null, foto: null, palco: false,
  ligada() { return lembrar('roda') !== '0'; },
  /* última rolagem pública de cada um (das que estão carregadas). As muito novas esperam o dado parar, para não contar o fim antes */
  ultimas() { const u = {}, t = Date.now(); (M.rolagens || []).forEach(r => { if (t - (r.em || 0) < 3200) return; const k = r.mestre ? 'mestre' : r.uid; if (!u[k] || (r.em || 0) > u[k].em) u[k] = r; }); return u; },
  /* molduras de pixel art em volta dos retratos (ouro, mestre, vez, caído) e a faixa de vez */
  css() {
    if (this._css || !MANIFEST.images.moldura_l_ouro) return; this._css = true;
    const M_ = { ouro: 'rd-l', sol: 'rd-mestre', capitao: 'vez', ferida: 'caido' }; let t = ':root{';
    Object.keys(M_).forEach(n => { const i = MANIFEST.images['moldura_l_' + n], j = i && i.janela; if (!j) return; t += `--m-${n}:url(${img('moldura_l_' + n)});--m-${n}-x:${j.x};--m-${n}-y:${j.y};--m-${n}-w:${j.w};--m-${n}-h:${j.h};--m-${n}-r:${(i.h / i.w).toFixed(4)};`; });
    const fv = MANIFEST.images.faixa_vez; if (fv) t += `--faixa-vez:url(${img('faixa_vez')});--faixa-vez-ar:${(fv.w / fv.h).toFixed(4)};`;
    t += '}'; const st = document.createElement('style'); st.id = 'rd-mol-css'; st.textContent = t; document.head.appendChild(st); document.body.classList.add('com-moldura');
  },
  html() {
    this.css();
    const js = (M.jogadores || []).filter(j => !j.mestre && fichaOuNome(j)), ult = this.ultimas(), c = M.combate && M.combate.ativo ? M.combate : null, daVez = c ? (c.lista || [])[c.vez] : null;
    const lugar = (k, foto, nome, extra = '', cls = '') => { const r = ult[k], t = r ? `<b class="rd-ult ${r.nat === 20 ? 'crit' : r.nat === 1 ? 'falha' : ''}" title="Última rolagem: ${esc(r.expr || '')}${r.rot ? ' · ' + esc(r.rot) : ''}">${r.total}</b>` : '';
      return `<div class="rd-l ${cls}" data-rd="${esc(k)}">${t}<span class="rd-fw"><span class="rd-f">${foto}</span><i class="rd-mol" aria-hidden="true"></i></span><span class="rd-n">${esc(nome)}</span>${extra}</div>`; };
    /* retrato de ícone em % (icFit): acompanha o tamanho do lugar. Com tamanho fixo em px, na tela cheia o rosto ficava pequeno e torto dentro da moldura */
    const fotoR = j => j.foto && j.foto.ic && !j.foto.arq && !j.foto.url ? (icFit(j.foto.ic, 'retrato') || fotoJ(j, 48)) : fotoJ(j, 48);
    const mestre = lugar('mestre', icFit('modos:capitao') || ic('modos:capitao', 48), 'Mestre', '', 'rd-mestre' + (online((M.presenca || {}).mestre) ? '' : ' fora'));
    return mestre + js.map(j => {
      const f = fichaDe(j), L = j.vivo || {}, max = f && f.pv ? num(f.pv.max) : 0, pv = L.pv == null ? max : Math.min(num(L.pv), max || num(L.pv)), pct = max ? clamp(pv / max, 0, 1) : 1;
      const barra = max ? `<i class="rd-pv ${pct <= .25 ? 'ruim' : pct <= .5 ? 'meio' : ''}" title="${souMestre() || j.uid === Eu.uid ? `PV ${pv}/${max}` : 'Pontos de vida'}"><i style="width:${Math.round(pct * 100)}%"></i></i>` : '<i class="rd-pv vazio"></i>';
      const cls = [j.uid === Eu.uid ? 'eu' : '', online(j.visto) || j.uid === Eu.uid ? '' : 'fora', max && pv <= 0 ? 'caido' : '', daVez && daVez.uid && daVez.uid === j.uid ? 'vez' : ''].join(' ');
      return lugar(j.uid, fotoR(j), String(nomeJ(j)).split(' ')[0], barra, cls);
    }).join('');
  },
  desenhar() {
    const el = $('#mt-roda'); if (!el) return; el.hidden = !this.ligada(); if (el.hidden) return;
    const h = this.html(); if (h === this._h) return; this._h = h; el.innerHTML = h; carregarArquivos(el);
  },
  /* de onde sai o dado: −1 (esquerda) a 1 (direita), pela posição do lugar de quem rolou */
  origem(r) {
    const q = $('#mt-quadro'), l = q && q.querySelector(`#mt-roda:not([hidden]) [data-rd="${CSS.escape(r.mestre ? 'mestre' : String(r.uid || ''))}"]`); if (!l) return null;
    const a = q.getBoundingClientRect(), b = l.getBoundingClientRect(); return clamp(((b.left + b.width / 2) - a.left) / a.width * 2 - 1, -0.9, 0.9);
  },
  marcar(r, on) { const l = $(`#mt-roda [data-rd="${CSS.escape(r.mestre ? 'mestre' : String(r.uid || ''))}"]`); if (l) l.classList.toggle('rolando', !!on); },
  /* faixa "Vez de Fulano" */
  vez() {
    const c = M.combate, on = !!(c && c.ativo), x = on ? (c.lista || [])[c.vez] : null, chave = on && x ? `${c.rodada}:${c.vez}:${x.nome}` : (on ? 'sem' : '');
    if (this.ultVez === null) { this.ultVez = chave; return; }
    if (chave === this.ultVez) return;
    const comecou = !this.ultVez && on, acabou = this.ultVez && !on; this.ultVez = chave; this._h = ''; this.desenhar();
    const minha = x && x.uid && x.uid === Eu.uid && !souMestre();
    if (App.rota !== 'mesa') { if (minha) { toast(`${ic('status:turno', 32)} <b>Sua vez!</b> Rodada ${c.rodada}.`, { tipo: 'bom', tempo: 5000 }); Som.tocar('sino'); } return; }
    const q = $('#mt-quadro'); if (!q) return;
    $$('.mt-vez', q).forEach(e => e.remove());
    const b = document.createElement('div'); b.className = 'mt-vez' + (minha ? ' minha' : '') + (acabou ? ' fim' : '');
    b.innerHTML = acabou ? `<div><small>Combate</small><b>Fim da luta</b></div>`
      : `${x ? `<span class="mt-vez-f">${x.tipo === 'pc' ? retratoHTML(x.retrato, x.nome, 64) : iconeHTML(x.retrato || 'retratos:pirata_novato', 64)}</span>` : ''}<div><small>${comecou ? 'Às armas! · ' : ''}Rodada ${c.rodada}</small><b>${minha ? 'Sua vez!' : x ? 'Vez de ' + esc(x.nome) : 'Combate'}</b></div>`;
    q.appendChild(b); carregarArquivos(b);
    if (Som.ok() && !Som2.mudo) { if (minha) Som.tocar('sino'); else Som.tom(392, 523, 0.16, 'triangle', 0.09 * (Som2.vol.e ?? 0.8)); }
    setTimeout(() => b.classList.add('some'), 2300); setTimeout(() => b.remove(), 2800);
  },
  /* o retrato da última jogada, num canto */
  guardarFoto(r, url) { if (!url) return; this.foto = { url, total: r.total, nome: r.nome, rot: r.rot || '', crit: r.nat === 20, falha: r.nat === 1 }; this.mostrarFoto(); },
  mostrarFoto() {
    const q = $('#mt-quadro'); if (!q) return; $$('.mt-resto', q).forEach(e => e.remove());
    const f = this.foto; if (!f || !this.ligada()) return;
    const b = document.createElement('button'); b.className = 'mt-resto' + (f.crit ? ' crit' : f.falha ? ' falha' : ''); b.dataset.act = 'rd-resto'; b.title = 'Última jogada. Clique para tirar da mesa.';
    b.innerHTML = `<img src="${f.url}" alt=""><b>${f.total}</b><small>${esc(f.nome)}${f.rot ? ' · ' + esc(f.rot) : ''}</small>`; q.appendChild(b);
  },
  alternarPalco(v) {
    const q = $('#mt-quadro'); if (!q) return; this.palco = v == null ? !this.palco : v;
    q.classList.toggle('qd-palco', this.palco); document.body.classList.toggle('mt-em-palco', this.palco);
    const b = $('#mt-palco-bt'); if (b) b.textContent = this.palco ? '✕' : '⛶'; this.modoBt();
  }
};
const fichaOuNome = j => j && (fichaDe(j) || j.personagem || j.nome);
ACT['rd-resto'] = () => { Roda.foto = null; $$('.mt-resto').forEach(e => e.remove()); };
/* no palco: troca normal → vantagem → desvantagem (é o mesmo ajuste da janela Rolar dados) */
ACT['pd-modo'] = () => { TelaMesa.modo = TelaMesa.modo === 'vant' ? 'desv' : TelaMesa.modo === 'desv' ? '' : 'vant'; TelaMesa.rolar(); Roda.modoBt(); };
/* no palco: o modificador da rolagem (o mesmo número da janela Rolar dados) */
Roda.modSet = function (v) { TelaMesa.mod = clamp(Math.round(num(v) || 0), -99, 99); const a = $('#pd-mod'), b = $('#rl-mod'); if (a && document.activeElement !== a) a.value = TelaMesa.mod; if (b && document.activeElement !== b) b.value = TelaMesa.mod; };
ACT['pd-mod'] = el => Roda.modSet((TelaMesa.mod || 0) + +el.dataset.d);
ACT['pd-mod-set'] = el => Roda.modSet(el.value);
ACT['rl-mod'] = el => Roda.modSet(el.value);
Roda.modoBt = function () { const b = $('#pd-modo'); if (b) { b.textContent = TelaMesa.modo === 'vant' ? 'vantagem' : TelaMesa.modo === 'desv' ? 'desvantagem' : 'normal'; b.className = 'pd-modo ' + (TelaMesa.modo || ''); } };
ACT['mt-palco'] = () => { Roda.alternarPalco(); if (Roda.palco) toast('Palco: o quadro em tela cheia. Os dados ficam à esquerda. Esc sai.', { tempo: 3500 }); };
ACT['roda-lig'] = el => { lembrar('roda', el.checked ? '1' : '0'); Roda._h = ''; Roda.desenhar(); Roda.mostrarFoto(); };
document.addEventListener('keydown', e => { if (e.key === 'Escape' && Roda.palco && !$('.modal.on')) Roda.alternarPalco(false); });
Mesa.on(ch => { if (!Mesa.aberta) return; if (ch === 'combate') Roda.vez(); if (['jogadores', 'rolagens', 'combate', 'presenca', 'arquivos'].includes(ch) && App.rota === 'mesa') Roda.desenhar();
  if (ch === 'rolagens') setTimeout(() => { if (App.rota === 'mesa') Roda.desenhar(); }, 3400); });
const _renderMesaRoda = VIEWS.mesa.render;
VIEWS.mesa.render = function () {
  Roda._h = ''; Roda.palco = false; document.body.classList.remove('mt-em-palco');
  return _renderMesaRoda.call(this).replace('<div class="mt-ferr">', `<div class="mt-roda" id="mt-roda" ${Roda.ligada() ? '' : 'hidden'}></div><div class="mt-pdados" id="mt-pdados" role="group" aria-label="Rolar dados no palco">${[4, 6, 8, 10, 12, 20, 100].map(f => `<button data-act="rl-dado" data-f="${f}" title="Rolar d${f}">d${f}</button>`).join('')}<button class="pd-modo" data-act="pd-modo" id="pd-modo" title="Normal, vantagem ou desvantagem (vale para o d20)">normal</button><div class="pd-mod" title="Modificador somado à rolagem"><small>mod</small><div><button data-act="pd-mod" data-d="-1" aria-label="Menos 1 no modificador">−</button><input id="pd-mod" type="number" step="1" inputmode="numeric" value="${TelaMesa.mod || 0}" data-chg="pd-mod-set" aria-label="Modificador"><button data-act="pd-mod" data-d="1" aria-label="Mais 1 no modificador">+</button></div></div></div><div class="mt-ferr"><button class="bt-ic mini" data-act="mt-palco" id="mt-palco-bt" title="Palco: o quadro em tela cheia">⛶</button>`);
};
const _depoisMesaRoda = VIEWS.mesa.depois;
VIEWS.mesa.depois = function (...a) { const r = _depoisMesaRoda && _depoisMesaRoda.apply(this, a); Roda.desenhar(); Roda.mostrarFoto(); if (Roda.ultVez === null) Roda.vez(); return r; };
