/* ═══════════ MARUJOS: gente do convés, sem ficha ═══════════
   Regra da casa, na ideia do Black Flag: a tripulação tem gente que trabalha sem aparecer. Marujo é número, não personagem.
   · Recrutar e Baixas mexem nos números do efetivo (LJ p. 300), que continuam valendo como já valiam.
   · "Quem é esse marujo?" sorteia nome, função e um jeito, só para o mestre improvisar uma conversa. Nada é guardado.
   · "Fixar" guarda o marujo numa linha (Rostos do convés). Ele continua sem ficha: só passa a ter nome e rosto.
   Tudo em mesa/tripulacao (efe e rostos): só o mestre escreve, todos leem. */
const MJ_FUN = [['nav', 'Navegação', 'marujo de vela'], ['limp', 'Limpeza', 'marujo do esfregão'], ['vig', 'Vigilância', 'vigia'], ['art', 'Artilheiros', 'artilheiro'], ['polv', 'Rapazes da pólvora', 'rapaz da pólvora'], ['coz', 'Cozinha', 'ajudante de cozinha']];
const MJ_NOMES = ['Zé Corda', 'Dona Tainha', 'Bigode', 'Sardinha', 'Catraca', 'Lourenço', 'Maroca', 'Pé-de-Cabra', 'Juca Farol', 'Nhá Benta', 'Tatu', 'Caramujo', 'Rosalvo', 'Filó', 'Cotoco', 'Mané Proa', 'Belmira', 'Sabiá',
  'Chico Remo', 'Tonha', 'Barbatana', 'Quincas', 'Dadá', 'Pirulito', 'Vó Rede', 'Ostra', 'Januário', 'Garoupa', 'Tião Nó', 'Luzia', 'Baiacu', 'Zulmira', 'Cascudo', 'Nonato', 'Marimbondo', 'Xepa'];
const MJ_JEITOS = ['ri alto de tudo', 'desconfiado', 'canta desafinado', 'sempre com fome', 'supersticioso', 'calado', 'fala pelos cotovelos', 'conta vantagem', 'tem medo de tempestade', 'sabe um pouco de tudo', 'novato, quer mostrar serviço',
  'veterano de outro navio', 'resmungão', 'vive apostando', 'coleciona conchas', 'dorme em qualquer canto', 'fã do capitão', 'escreve cartas para casa', 'não sabe nadar', 'conhece todo porto', 'enjoa em mar agitado', 'assobia o dia inteiro'];
const MJ_ROSTO = { limp: ['rostos_pir2:esfregao'], vig: ['rostos_pir2:luneta'], art: ['rostos_pir2:tapa_mosquete', 'rostos_pir2:pistola'], polv: ['rostos_pir2:listrado', 'rostos_pir2:dente_faltando'], coz: ['rostos_pir2:careca', 'rostos_pir:velho_cachimbo'] };
const MJ_GERAL = ['rostos_pir2:listrado', 'rostos_pir2:dente_faltando', 'rostos_pir2:careca', 'rostos_pir2:moeda', 'rostos_pir:ancora', 'rostos_pir:machado', 'rostos_pir:capuz', 'rostos_pir:crista_verde'];
const MJ = { novo: null };
const mjEfe = () => (M.trip || {}).efe || null;
const mjRostos = () => Array.isArray((M.trip || {}).rostos) ? M.trip.rostos : [];
const mjFun = k => (MJ_FUN.find(x => x[0] === k) || ['', 'Sem função fixa', 'marujo']);
const mjZero = () => ({ nav: 0, limp: 0, vig: 0, art: 0, polv: 0, coz: 0, tot: (M.jogadores || []).filter(j => j.estilo).length });
function mjSorteia() {
  const e = mjEfe() || {}, saco = []; MJ_FUN.forEach(([k]) => { for (let i = 0; i < Math.min(20, nvN(e[k])); i++) saco.push(k); });
  const of = saco.length ? frSorteia(saco) : '', usados = new Set(mjRostos().map(r => r.nome)), livres = MJ_NOMES.filter(n => !usados.has(n));
  const op = (MJ_ROSTO[of] || MJ_GERAL).filter(r => temIc(r)), rosto = op.length ? frSorteia(op) : 'retratos:pirata_novato';
  return { id: novoId(), nome: frSorteia(livres.length ? livres : MJ_NOMES), of, frase: frSorteia(MJ_JEITOS), rosto };
}
const mjGravaRostos = L => DB.gravar('mesa/tripulacao', { rostos: L.slice(0, 30) }).catch(e => toast('Não deu para salvar: ' + esc(e.code || e.message), { tipo: 'ruim' }));

/* ───── recrutar e baixas ───── */
ACT['mj-recrutar'] = () => { if (!souMestre()) return; const E = nvEfetivo();
  Modal.abrir(`<h2>${ic('mesa:tripulacao', 32)} Recrutar marujos</h2>
    <p class="nota">Marujo não tem ficha: é gente que faz o navio andar. Entra direto na conta do efetivo${E ? ` (a bordo: ${E.tot} de ${E.lot} que cabem)` : ''}.</p>
    <label class="campo-inline">Quantos <input id="mj-q" type="number" min="1" max="200" value="5" style="width:5em"></label>
    <label class="campo-inline">Para <select id="mj-f">${MJ_FUN.map(([k, n]) => `<option value="${k}">${n}</option>`).join('')}<option value="">Sem função fixa</option></select></label>
    <label class="campo-inline">Custo total ฿ <input id="mj-c" type="number" min="0" value="0" style="width:9em"></label>
    <p class="nota">O livro não dá preço para contratar tripulante. Se você cobrar, o valor sai do Banco do bando (saldo: ${nvB(bancoSaldo())}).</p>
    <div class="linha-bts"><button class="bt bom" data-act="mj-recrutar-ok">Recrutar</button><button class="bt" data-act="modal-fechar">Cancelar</button></div>`); };
ACT['mj-recrutar-ok'] = () => { const q = clamp(Math.round(num(($('#mj-q') || {}).value) || 0), 0, 200), k = ($('#mj-f') || {}).value || '', c = Math.max(0, Math.round(num(($('#mj-c') || {}).value) || 0)); if (!q) return;
  if (c > bancoSaldo()) return toast(`O Banco do bando só tem ${nvB(bancoSaldo())}. Faltam ${nvB(c - bancoSaldo())}.`, { tipo: 'ruim', tempo: 6000 });
  const e = Object.assign(mjZero(), mjEfe() || {}), patch = { tot: nvN(e.tot) + q }; if (k) patch[k] = nvN(e[k]) + q; Modal.fechar();
  DB.gravar('mesa/tripulacao', { efe: Object.assign(mjEfe() ? {} : mjZero(), patch) }).then(() => { if (c) bancoMov(-c, `Recrutou ${q} marujo${q > 1 ? 's' : ''}${k ? ' (' + mjFun(k)[1] + ')' : ''}`);
    const E = nvEfetivo(); toast(`<b>+${q} marujo${q > 1 ? 's' : ''}</b>${k ? ' em ' + mjFun(k)[1] : ''}.${E && E.cheio ? ` <b>Passou da lotação</b> (${E.tot} de ${E.lot}).` : ''}`, { tipo: E && E.cheio ? '' : 'bom', tempo: 5000 }); }); };
ACT['mj-baixas'] = () => { if (!souMestre() || !mjEfe()) return; const e = mjEfe();
  Modal.abrir(`<h2>${ic('mesa:tripulacao', 32)} Baixas</h2><p class="nota">Marujos que saíram do navio: feridos, desertores, deixados num porto. A bordo agora: <b>${nvN(e.tot)}</b>.</p>
    <label class="campo-inline">Quantos <input id="mj-q" type="number" min="1" max="${Math.max(1, nvN(e.tot))}" value="1" style="width:5em"></label>
    <label class="campo-inline">De onde <select id="mj-f"><option value="*">Sortear entre as funções</option>${MJ_FUN.filter(([k]) => nvN(e[k]) > 0).map(([k, n]) => `<option value="${k}">${n} (${nvN(e[k])})</option>`).join('')}<option value="">Sem função fixa</option></select></label>
    <div class="linha-bts"><button class="bt ruim" data-act="mj-baixas-ok">Tirar</button><button class="bt" data-act="modal-fechar">Cancelar</button></div>`); };
ACT['mj-baixas-ok'] = () => { const e = Object.assign({}, mjEfe()), de = ($('#mj-f') || {}).value, q = clamp(Math.round(num(($('#mj-q') || {}).value) || 0), 0, nvN(e.tot)); if (!q) return Modal.fechar();
  const perdeu = {}; for (let i = 0; i < q; i++) { let k = de; if (de === '*') { const saco = []; MJ_FUN.forEach(([x]) => { for (let n = 0; n < nvN(e[x]); n++) saco.push(x); }); k = saco.length ? frSorteia(saco) : ''; }
    if (k && nvN(e[k]) > 0) { e[k] = nvN(e[k]) - 1; perdeu[k] = (perdeu[k] || 0) + 1; } }
  e.tot = nvN(e.tot) - q; Modal.fechar();
  DB.gravar('mesa/tripulacao', { efe: e }).then(() => { const t = Object.entries(perdeu).map(([k, n]) => `${n} de ${mjFun(k)[1]}`).join(', ');
    toast(`<b>−${q} marujo${q > 1 ? 's' : ''}.</b>${t ? ' Saíram: ' + t + '.' : ''} Confira o efetivo.`, { tempo: 7000 }); }); };

/* ───── um rosto para o improviso ───── */
ACT['mj-quem'] = () => { if (!souMestre()) return; MJ.novo = mjSorteia(); App.render(); };
ACT['mj-dispensar'] = () => { MJ.novo = null; App.render(); };
ACT['mj-fixar'] = () => { const n = MJ.novo; if (!n) return; MJ.novo = null; mjGravaRostos([n, ...mjRostos()]).then(() => toast(`<b>${esc(n.nome)}</b> agora tem rosto no convés. Continua sem ficha.`, { tipo: 'bom' })); };
ACT['mj-campo'] = el => { const L = mjRostos().map(r => r.id === el.dataset.id ? Object.assign({}, r, { [el.dataset.k]: String(el.value).slice(0, 80) }) : r); mjGravaRostos(L); };
ACT['mj-rosto'] = el => escolherIcone([...FOLHAS_ROSTOS, 'retratos', 'npcs'], ref => mjGravaRostos(mjRostos().map(r => r.id === el.dataset.id ? Object.assign({}, r, { rosto: ref }) : r)));
ACT['mj-tirar'] = el => { const r = mjRostos().find(x => x.id === el.dataset.id); if (r) confirmar(`Tirar <b>${esc(r.nome)}</b> dos rostos do convés? O número de marujos não muda.`, () => mjGravaRostos(mjRostos().filter(x => x.id !== r.id)), { ok: 'Tirar' }); };

function mjHTML() {
  const m = souMestre(), e = mjEfe(), L = mjRostos(), n = MJ.novo; if (!m && !L.length) return '';
  const linha = r => `<li class="mj-it">${m ? `<button class="fr-rosto" data-act="mj-rosto" data-id="${r.id}" title="Trocar o rosto">${iconeHTML(r.rosto || 'retratos:pirata_novato', 48)}</button>` : iconeHTML(r.rosto || 'retratos:pirata_novato', 48)}
    <div class="mj-c">${m ? `<input value="${esc(r.nome)}" data-chg="mj-campo" data-id="${r.id}" data-k="nome" maxlength="40" aria-label="Nome" style="font-weight:700"><input value="${esc(r.frase || '')}" data-chg="mj-campo" data-id="${r.id}" data-k="frase" maxlength="80" placeholder="Uma frase sua para lembrar dele" aria-label="Frase">`
      : `<b>${esc(r.nome)}</b><span>${esc(r.frase || '')}</span>`}<small>${esc(mjFun(r.of)[2])}</small>${mjFeitosHTML(r, m)}</div>${m ? `<button class="bt-ic mini" data-act="mj-tirar" data-id="${r.id}" title="Tirar dos rostos">✕</button>` : ''}</li>`;
  return `<section class="pap trip-mj"><h2>${ic('mesa:tripulacao', 32)} Marujos <small>gente do convés, sem ficha</small></h2>
    ${m ? `<p class="nota">Marujo é número: trabalha sem aparecer e conta no efetivo aqui em cima. Só ganha nome e rosto quando a história esbarrar nele.</p>
      <div class="linha-bts"><button class="bt fino ouro" data-act="mj-recrutar">+ Recrutar</button>${e ? '<button class="bt fino" data-act="mj-baixas">Baixas</button>' : ''}<button class="bt fino" data-act="mj-quem" title="Sorteia nome, função e um jeito, para improvisar uma conversa">Quem é esse marujo?</button></div>` : ''}
    ${m && n ? `<div class="mj-novo">${iconeHTML(n.rosto, 64)}<div><b>${esc(n.nome)}</b>, ${esc(mjFun(n.of)[2])}. <i>${esc(n.frase)}.</i><br><small class="nota">Só você vê. Use e esqueça, ou fixe para ele voltar a aparecer.</small></div>
        <div class="linha-bts"><button class="bt bom fino" data-act="mj-fixar">Fixar</button><button class="bt fino" data-act="mj-quem">Outro</button><button class="bt-ic mini" data-act="mj-dispensar" title="Dispensar">✕</button></div></div>` : ''}
    ${L.length ? `<h3 class="mj-t">Rostos do convés</h3><ul class="mj-l">${L.map(linha).join('')}</ul>` : ''}</section>`;
}
if (window.__expor) Object.assign(window, { mjSorteia, mjRostos });
