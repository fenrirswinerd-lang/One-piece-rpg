/* ═══════════ DIÁRIO DO CAPITÃO PRIVADO (Bloco 5) ═══════════
   capitaes/{uid}/entradas/{id}: só o dono e o mestre leem (regras novas do Firestore).
   Escreve quem é o capitão oficial do bando (Tripulação). Depois que deixa de ser capitão, ainda lê, edita e apaga o que é dele.
   "Publicar" copia a página para mesa/capitao/entradas (o diário público, que todos leem no Diário de bordo) e guarda o id em pub.
   "Despublicar" apaga a cópia pública. Editar uma página publicada atualiza as duas. */
const CapPriv = {
  sub: null, uid: null,
  alvo() { if (souMestre()) { const of = capitaoOficial(); return of && of.tipo === 'jogador' ? of.uid : null; } return Eu.uid; },
  ligar() {
    const uid = this.alvo(); if (uid === this.uid && this.sub) return;
    this.desligar(); this.uid = uid; M.capPriv = []; if (!uid) { Mesa.mudou('capPriv'); return; }
    this.sub = DB.ouvirLista(`capitaes/${uid}/entradas`, { ordem: 'em', desc: true, max: 120 }, l => { M.capPriv = l; Mesa.mudou('capPriv'); }, e => Mesa.falha('o diário privado do capitão', e));
  },
  desligar() { if (this.sub) { try { this.sub(); } catch (e) { /* já parado */ } } this.sub = null; this.uid = null; }
};
M.capPriv = [];
/* liga junto com a mesa e religa quando o capitão muda */
(() => {
  const abrir = Mesa.abrir, parar = Mesa.parar;
  Mesa.abrir = function (...a) { const r = abrir.apply(this, a); try { CapPriv.ligar(); } catch (e) { console.warn(e); } return r; };
  Mesa.parar = function (...a) { CapPriv.desligar(); return parar.apply(this, a); };
  Mesa.on(ch => { if (ch === 'trip' || ch === 'jogadores') CapPriv.ligar(); });
})();
const capPath = id => `capitaes/${CapPriv.uid}/entradas${id ? '/' + id : ''}`;
const capEntrada = id => (M.capPriv || []).find(e => e.id === id);

JOG.capitao = function () {
  const L = M.capPriv || [], of = capitaoOficial(), souCap = of && of.tipo === 'jogador' && of.uid === Eu.uid, pubs = L.filter(e => e.pub).length;
  return `<section class="jg-sec diario">
    <header class="di-cab">${ic('capas2:capitao', 128)}<div><h2>Diário do capitão</h2>
      <p class="nota">${souCap ? 'Privado: só você e o mestre leem.' : 'Você não é mais o capitão do bando: dá para ler, editar e apagar as suas páginas, mas não escrever novas.'} Use <b>Publicar</b> no que a tripulação deve ver: a página aparece no Diário de bordo.</p>${L.length ? `<button class="bt fino" data-act="cap-pdf">${ic('modos:lore_pdf', 32)} Baixar em PDF</button>` : ''}</div></header>
    ${souCap ? `<div class="di-nova"><input id="cap-tit" placeholder="Título (opcional)" maxlength="80"><textarea id="cap-txt" rows="4" placeholder="Rumo, decisões, segredos, o que você pensa da tripulação…"></textarea>
      <div class="linha-bts"><button class="bt bom" data-act="cap-add">Guardar (privado)</button><button class="bt" data-act="cap-add" data-pub="1">Guardar e publicar</button></div></div>` : ''}
    ${L.length ? `<p class="nota">${L.length} página${L.length > 1 ? 's' : ''} · ${pubs} publicada${pubs === 1 ? '' : 's'}</p><ol class="di-l cap-l">${L.map(e => `<li class="${e.pub ? 'pub' : ''}"><header><b>${esc(e.titulo || 'Sem título')}</b><time>${esc(e.dia || '')}</time>
        <span class="tag ${e.pub ? 'ouro' : ''}">${e.pub ? 'publicada' : 'privada'}</span></header><p class="pre">${esc(e.txt)}</p>
        <div class="linha-bts">${e.pub ? `<button class="bt fino" data-act="cap-despub" data-id="${e.id}">Despublicar</button>` : `<button class="bt fino bom" data-act="cap-pub" data-id="${e.id}">Publicar para a tripulação</button>`}
          <button class="bt fino" data-act="cap-editar" data-id="${e.id}">Editar</button><button class="bt fino ruim" data-act="cap-tirar" data-id="${e.id}">Apagar</button></div></li>`).join('')}</ol>` : '<p class="nota">Nenhuma página ainda.</p>'}
  </section>`;
};
async function capPublicar(e) {
  const pubId = await DB.novo('mesa/capitao/entradas', { txt: e.txt, titulo: e.titulo || '', autor: e.autor || '', uid: e.uid, dia: e.dia || '', em: Date.now(), de: e.id });
  await DB.gravar(capPath(e.id), { pub: pubId, pubEm: Date.now() });
}
ACT['cap-add'] = async el => {
  const txt = $('#cap-txt').value.trim(); if (!txt) return toast('Escreva a página.');
  if (!CapPriv.uid) CapPriv.ligar();
  const r = Relogio.agora(), e = { txt, titulo: ($('#cap-tit') || {}).value ? $('#cap-tit').value.trim() : '', autor: nomeJ(eu()), uid: Eu.uid, dia: `Dia ${r.dia} · ${r.hh}`, em: Date.now() };
  try {
    const id = await DB.novo(capPath(), e); $('#cap-txt').value = ''; if ($('#cap-tit')) $('#cap-tit').value = '';
    if (el.dataset.pub) { await capPublicar({ ...e, id }); toast('Página guardada e publicada no Diário de bordo.', { tipo: 'bom' }); }
    else toast('Página guardada. Só você e o mestre leem.', { tipo: 'bom' });
  } catch (err) { toast('Não deu para guardar: só o capitão do bando escreve aqui. (' + esc(err.code || err.message) + ')', { tipo: 'ruim', tempo: 8000 }); }
};
ACT['cap-pub'] = el => { const e = capEntrada(el.dataset.id); if (!e) return;
  confirmar('Publicar esta página? Toda a tripulação vai ler no Diário de bordo.', async () => {
    try { await capPublicar(e); toast('Publicada.', { tipo: 'bom' }); } catch (err) { toast('Não deu para publicar: ' + esc(err.code || err.message), { tipo: 'ruim' }); } }, { ok: 'Publicar' }); };
ACT['cap-despub'] = el => { const e = capEntrada(el.dataset.id); if (!e || !e.pub) return;
  confirmar('Tirar esta página do Diário de bordo? Ela continua aqui, privada.', async () => {
    try { await DB.apagar('mesa/capitao/entradas/' + e.pub); await DB.gravar(capPath(e.id), { pub: APAGAR, pubEm: APAGAR }); toast('Voltou a ser privada.'); }
    catch (err) { toast('Não deu: ' + esc(err.code || err.message), { tipo: 'ruim' }); } }, { ok: 'Despublicar' }); };
ACT['cap-editar'] = el => { const e = capEntrada(el.dataset.id); if (!e) return;
  Modal.abrir(`<h2>Editar página</h2><label class="campo"><span>Título</span><input id="cpe-tit" value="${esc(e.titulo || '')}" maxlength="80"></label><label class="campo"><span>Texto</span><textarea id="cpe-txt" rows="10">${esc(e.txt)}</textarea></label>
    ${e.pub ? '<p class="nota">Esta página está publicada: a mudança vale também no Diário de bordo.</p>' : ''}
    <div class="modal-bts"><button class="bt bom" data-act="cap-salvar" data-id="${e.id}">Salvar</button></div>`); };
ACT['cap-salvar'] = async el => { const e = capEntrada(el.dataset.id); if (!e) return; const d = { titulo: $('#cpe-tit').value.trim(), txt: $('#cpe-txt').value };
  Modal.fechar();
  try { await DB.gravar(capPath(e.id), d); if (e.pub) await DB.gravar('mesa/capitao/entradas/' + e.pub, d); toast('Salvo.'); } catch (err) { toast('Não deu: ' + esc(err.code || err.message), { tipo: 'ruim' }); } };
ACT['cap-tirar'] = el => { const e = capEntrada(el.dataset.id); if (!e) return;
  confirmar(`Apagar esta página${e.pub ? ' (sai também do Diário de bordo)' : ''}?`, async () => {
    try { if (e.pub) await DB.apagar('mesa/capitao/entradas/' + e.pub).catch(() => {}); await DB.apagar(capPath(e.id)); } catch (err) { toast('Não deu: ' + esc(err.code || err.message), { tipo: 'ruim' }); } }, { perigo: true }); };
/* mestre: no Diário de bordo, o diário privado do capitão atual (só ele vê) */
function capPrivMestreHTML() {
  if (!souMestre()) return '';
  const of = capitaoOficial(), L = M.capPriv || [];
  if (!of || of.tipo !== 'jogador') return `<div class="pap"><h2>${ic('mesa:cadeado', 32)} Diário privado do capitão</h2><p class="nota">Defina o capitão do bando (um jogador) na Tripulação para ver o diário privado dele aqui.</p></div>`;
  return `<div class="pap cap-priv"><h2>${ic('mesa:cadeado', 32)} Diário privado de ${esc(of.nome)} <small>(só você vê)</small></h2>
    ${L.length ? `<ol class="di-l">${L.slice(0, 30).map(e => `<li class="${e.pub ? 'pub' : ''}"><header><b>${esc(e.titulo || 'Sem título')}</b><time>${esc(e.dia || '')}</time><span class="tag ${e.pub ? 'ouro' : ''}">${e.pub ? 'publicada' : 'privada'}</span></header><p class="pre">${esc(e.txt)}</p></li>`).join('')}</ol>` : '<p class="nota">Nada escrito ainda.</p>'}</div>`;
}
