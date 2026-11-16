/* ═══════════ mundo: ilhas e NPCs. O mestre guarda tudo em segredos/mundo; a mesa só recebe o que foi descoberto ou liberado ═══════════ */
const MARES_ILHA = ['East Blue', 'North Blue', 'South Blue', 'West Blue', 'Paradise', 'Calm Belt', 'Mares do Céu', 'Novo Mundo'];
const mundoS = () => Object.assign({ ilhas: [], npcs: [], atual: null }, M.segMundo || {});
let _mundoPub = '';
function publicarMundo() {
  if (!souMestre() || !M.segMundo) return;
  const s = mundoS(), desc = new Set(s.ilhas.filter(i => i.descoberta).map(i => i.id));
  const pub = { atual: desc.has(s.atual) ? s.atual : null,
    ilhas: s.ilhas.map(i => i.descoberta ? { id: i.id, nome: i.nome || 'Ilha', icone: i.icone || 'ilhas:vila', mar: i.mar || '', resumo: i.resumo || '' } : { id: i.id, oculta: true, icone: i.icone || 'ilhas:banco_areia' }),
    npcs: s.npcs.filter(n => n.liberado).map(n => ({ id: n.id, nome: n.nome || '?', ilha: desc.has(n.ilha) ? n.ilha : null, retrato: n.retrato || 'mesa:npc', tipo: n.tipo || 'npc', papel: n.papel || '', descricao: n.descricao || '' })) };
  const j = JSON.stringify(pub); if (j === _mundoPub) return; _mundoPub = j;
  DB.gravar('mesa/mundo', pub, false).catch(e => toast('Não deu para publicar o mundo: ' + esc(e.code || e.message), { tipo: 'ruim' }));
}
Mesa.on(ch => { if (ch === 'segMundo' && souMestre()) publicarMundo(); });
function salvarMundo(fn, aviso) {
  const s = JSON.parse(JSON.stringify(mundoS())); fn(s);
  M.segMundo = s; publicarMundo(); App.render();
  return DB.gravar('segredos/mundo', s, false).then(() => { if (aviso) avisar(...aviso); }).catch(e => toast('Não deu para salvar o mundo: ' + esc(e.code || e.message), { tipo: 'ruim' }));
}

VIEWS.mundo = {
  titulo: 'Mundo', icone: 'ilhas:vila', chaves: ['segMundo'],
  filtro: '',
  ao(ch) { const a = document.activeElement; if (ch === 'segMundo' && a && /INPUT|TEXTAREA|SELECT/.test(a.tagName) && $('#vista').contains(a)) { this.pendente = true; return false; } },
  render() {
    const s = mundoS(), f = this.filtro;
    const npcs = s.npcs.filter(n => !f || n.ilha === f || (f === 'sem' && !n.ilha));
    return `<div class="mundo">
      <header class="mundo-topo"><h1>${ic('ilhas:vila', 64)}Mundo</h1><p class="nota">Ilhas e NPCs ficam escondidos dos jogadores até você descobrir a ilha ou liberar a pessoa. Ilha não descoberta aparece para eles como silhueta preta.</p></header>
      <section class="mundo-sec"><div class="sec-cab"><h2>${ic('mesa:navio', 32)} Ilhas</h2><button class="bt bom" data-act="mu-ilha-nova">+ Nova ilha</button></div>
        ${s.ilhas.length ? `<ol class="mundo-l">${s.ilhas.map((i, k) => `<li class="mundo-c ilha ${i.descoberta ? '' : 'escondida'} ${s.atual === i.id ? 'atual' : ''}">
          <button class="mu-ic" data-act="mu-ilha-ic" data-id="${i.id}" title="Trocar ícone">${iconeHTML(i.icone || 'ilhas:vila', 64, i.descoberta ? '' : 'silhueta')}</button>
          <div class="mu-campos"><input value="${esc(i.nome || '')}" placeholder="Nome da ilha" data-chg="mu-ilha" data-id="${i.id}" data-k="nome" aria-label="Nome da ilha">
            <select data-chg="mu-ilha" data-id="${i.id}" data-k="mar" aria-label="Mar">${MARES_ILHA.map(m => `<option ${i.mar === m ? 'selected' : ''}>${m}</option>`).join('')}</select>
            <textarea rows="2" placeholder="O que os jogadores sabem (aparece quando descobrir)" data-chg="mu-ilha" data-id="${i.id}" data-k="resumo">${esc(i.resumo || '')}</textarea>
            <textarea rows="2" placeholder="Notas do mestre (segredo)" data-chg="mu-ilha" data-id="${i.id}" data-k="nota">${esc(i.nota || '')}</textarea></div>
          <div class="mu-bts"><button class="bt ${i.descoberta ? 'bom' : ''} fino" data-act="mu-descobrir" data-id="${i.id}">${ic(i.descoberta ? 'mesa:cadeado_aberto' : 'mesa:cadeado', 32)} ${i.descoberta ? 'Descoberta' : 'Escondida'}</button>
            <button class="bt fino ${s.atual === i.id ? 'azul' : ''}" data-act="mu-atual" data-id="${i.id}">${s.atual === i.id ? 'Estamos aqui' : 'Ir para cá'}</button>
            <span class="mu-ord"><button class="bt-ic mini" data-act="mu-ordem" data-id="${i.id}" data-d="-1" ${k === 0 ? 'disabled' : ''} aria-label="Subir">↑</button><button class="bt-ic mini" data-act="mu-ordem" data-id="${i.id}" data-d="1" ${k === s.ilhas.length - 1 ? 'disabled' : ''} aria-label="Descer">↓</button></span>
            <button class="bt-ic mini" data-act="mu-ilha-tirar" data-id="${i.id}" aria-label="Apagar ilha">×</button></div></li>`).join('')}</ol>`
          : '<p class="nota">Nenhuma ilha. Crie as ilhas da campanha: elas aparecem como silhueta até você marcar "Descoberta".</p>'}
      </section>
      <section class="mundo-sec"><div class="sec-cab"><h2>${ic('mesa:npc', 32)} NPCs e criaturas</h2>
        <select data-chg="mu-filtro" aria-label="Filtrar por ilha"><option value="">Todas as ilhas</option>${s.ilhas.map(i => `<option value="${i.id}" ${f === i.id ? 'selected' : ''}>${esc(i.nome || 'Ilha')}</option>`).join('')}<option value="sem" ${f === 'sem' ? 'selected' : ''}>Sem ilha</option></select>
        <button class="bt bom" data-act="mu-npc-novo">+ NPC</button><button class="bt" data-act="mu-npc-novo" data-t="criatura">+ Criatura</button></div>
        ${npcs.length ? `<ol class="mundo-l">${npcs.map(n => `<li class="mundo-c npc ${n.liberado ? '' : 'escondida'}">
          <button class="mu-ic" data-act="mu-npc-ic" data-id="${n.id}" title="Trocar retrato">${iconeHTML(n.retrato || 'mesa:npc', 64)}</button>
          <div class="mu-campos"><div class="pm-linha"><input value="${esc(n.nome || '')}" placeholder="Nome" data-chg="mu-npc" data-id="${n.id}" data-k="nome" aria-label="Nome"><input value="${esc(n.papel || '')}" placeholder="Papel (ex.: dono da taverna)" data-chg="mu-npc" data-id="${n.id}" data-k="papel" aria-label="Papel">
            <select data-chg="mu-npc" data-id="${n.id}" data-k="ilha" aria-label="Ilha"><option value="">Sem ilha</option>${s.ilhas.map(i => `<option value="${i.id}" ${n.ilha === i.id ? 'selected' : ''}>${esc(i.nome || 'Ilha')}</option>`).join('')}</select>
            <select data-chg="mu-npc" data-id="${n.id}" data-k="tipo" aria-label="Tipo"><option value="npc" ${n.tipo !== 'criatura' ? 'selected' : ''}>Pessoa</option><option value="criatura" ${n.tipo === 'criatura' ? 'selected' : ''}>Criatura</option></select></div>
            <textarea rows="2" placeholder="O que os jogadores sabem" data-chg="mu-npc" data-id="${n.id}" data-k="descricao">${esc(n.descricao || '')}</textarea>
            <textarea rows="2" placeholder="Segredo (só você vê)" data-chg="mu-npc" data-id="${n.id}" data-k="segredo">${esc(n.segredo || '')}</textarea></div>
          <div class="mu-bts"><button class="bt ${n.liberado ? 'bom' : ''} fino" data-act="mu-liberar" data-id="${n.id}">${ic(n.liberado ? 'mesa:olho' : 'mesa:olho_fechado', 32)} ${n.liberado ? 'Liberado' : 'Escondido'}</button>
            <button class="bt-ic mini" data-act="mu-npc-tirar" data-id="${n.id}" aria-label="Apagar">×</button></div></li>`).join('')}</ol>`
          : '<p class="nota">Nenhum NPC aqui. Crie na hora, até uma criança que vai segurar o timão.</p>'}
      </section></div>`;
  }
};
const ilhaPor = (s, id) => s.ilhas.find(i => i.id === id), npcPor = (s, id) => s.npcs.find(n => n.id === id);
ACT['mu-ilha-nova'] = () => salvarMundo(s => { s.ilhas.push({ id: novoId(), nome: 'Ilha nova', icone: 'ilhas:vila', mar: S().viagem.mar || 'East Blue', descoberta: false }); });
ACT['mu-ilha'] = el => salvarMundo(s => { const i = ilhaPor(s, el.dataset.id); if (i) i[el.dataset.k] = el.value; });
ACT['mu-ilha-ic'] = el => {
  Modal.abrir(`<h2>Ícone da ilha</h2><div class="linha-bts"><button class="bt" data-act="mu-ilha-ic-folha" data-id="${el.dataset.id}">Escolher dos ícones</button><button class="bt" data-act="mu-ilha-ic-up" data-id="${el.dataset.id}">Enviar imagem</button></div><p class="nota">Para uma ilha nova, use o prompt "Ilha nova" da página de prompts e envie a imagem aqui.</p>`);
};
ACT['mu-ilha-ic-folha'] = el => { const id = el.dataset.id; escolherIcone(['ilhas', 'mar', 'navios'], ref => salvarMundo(s => { const i = ilhaPor(s, id); if (i) i.icone = ref; })); };
ACT['mu-ilha-ic-up'] = el => { const id = el.dataset.id; Modal.fechar(); escolherArquivos('image/*', false, async fs => { const [a] = await enviarArquivos(fs, 'icone'); if (a) salvarMundo(s => { const i = ilhaPor(s, id); if (i) i.icone = { arq: a.id }; }); }); };
ACT['mu-descobrir'] = el => {
  const s0 = mundoS(), i0 = ilhaPor(s0, el.dataset.id); if (!i0) return;
  const vira = !i0.descoberta;
  salvarMundo(s => { const i = ilhaPor(s, el.dataset.id); i.descoberta = vira; }, vira ? ['ilha', `Nova ilha descoberta: ${i0.nome || 'Ilha'}`, { icone: i0.icone || 'ilhas:vila' }] : null);
};
ACT['mu-atual'] = el => salvarMundo(s => { s.atual = s.atual === el.dataset.id ? null : el.dataset.id; const i = ilhaPor(s, el.dataset.id); if (i && s.atual) i.descoberta = true; });
ACT['mu-ordem'] = el => salvarMundo(s => { const k = s.ilhas.findIndex(i => i.id === el.dataset.id), d = +el.dataset.d; if (k < 0 || !s.ilhas[k + d]) return; [s.ilhas[k], s.ilhas[k + d]] = [s.ilhas[k + d], s.ilhas[k]]; });
ACT['mu-ilha-tirar'] = el => { const i = ilhaPor(mundoS(), el.dataset.id); confirmar(`Apagar a ilha <b>${esc(i ? i.nome : '')}</b>? Os NPCs dela ficam sem ilha.`, () => salvarMundo(s => { s.ilhas = s.ilhas.filter(x => x.id !== el.dataset.id); s.npcs.forEach(n => { if (n.ilha === el.dataset.id) n.ilha = null; }); if (s.atual === el.dataset.id) s.atual = null; }), { perigo: true }); };
ACT['mu-filtro'] = el => { VIEWS.mundo.filtro = el.value; App.render(); };
ACT['mu-npc-novo'] = el => salvarMundo(s => { const f = VIEWS.mundo.filtro; s.npcs.unshift({ id: novoId(), nome: el.dataset.t === 'criatura' ? 'Criatura' : 'NPC', tipo: el.dataset.t || 'npc', ilha: f && f !== 'sem' ? f : (s.atual || null), retrato: el.dataset.t === 'criatura' ? 'bestiario:rei_mares' : 'npcs:pescador', liberado: false }); });
ACT['mu-npc'] = el => salvarMundo(s => { const n = npcPor(s, el.dataset.id); if (n) n[el.dataset.k] = el.value || (el.dataset.k === 'ilha' ? null : ''); });
ACT['mu-npc-ic'] = el => {
  Modal.abrir(`<h2>Retrato</h2><div class="linha-bts"><button class="bt" data-act="mu-npc-ic-folha" data-id="${el.dataset.id}">Escolher dos retratos</button><button class="bt" data-act="mu-npc-ic-up" data-id="${el.dataset.id}">Enviar imagem</button></div>`);
};
ACT['mu-npc-ic-folha'] = el => { const id = el.dataset.id; escolherIcone(['npcs', ...FOLHAS_ROSTOS, 'especies', 'especies2', 'retratos', 'bestiario'], ref => salvarMundo(s => { const n = npcPor(s, id); if (n) n.retrato = ref; })); };
ACT['mu-npc-ic-up'] = el => { const id = el.dataset.id; Modal.fechar(); escolherArquivos('image/*', false, async fs => { const [a] = await enviarArquivos(fs, 'icone'); if (a) salvarMundo(s => { const n = npcPor(s, id); if (n) n.retrato = { arq: a.id }; }); }); };
ACT['mu-liberar'] = el => {
  const n0 = npcPor(mundoS(), el.dataset.id); if (!n0) return; const vira = !n0.liberado;
  salvarMundo(s => { npcPor(s, el.dataset.id).liberado = vira; });
  if (vira) toast(`${esc(n0.nome)} agora aparece para os jogadores.`, { tipo: 'bom' });
};
ACT['mu-npc-tirar'] = el => { const n = npcPor(mundoS(), el.dataset.id); confirmar(`Apagar <b>${esc(n ? n.nome : '')}</b>?`, () => salvarMundo(s => { s.npcs = s.npcs.filter(x => x.id !== el.dataset.id); }), { perigo: true }); };

/* ───── para todos: NPCs e bestiário ───── */
VIEWS.npcs = {
  titulo: 'NPCs', icone: 'mesa:npc', chaves: ['mundo'],
  render() {
    const m = M.mundo || {}, ilhas = (m.ilhas || []).filter(i => !i.oculta), npcs = m.npcs || [];
    const pessoas = npcs.filter(n => n.tipo !== 'criatura'), bichos = npcs.filter(n => n.tipo === 'criatura');
    const card = n => `<li><button data-act="npc-ver" data-id="${esc(n.id)}">${iconeHTML(n.retrato || 'mesa:npc', 64)}<span><b>${esc(n.nome)}</b>${n.papel ? `<small>${esc(n.papel)}</small>` : ''}</span></button></li>`;
    const grupos = ilhas.map(i => ({ i, l: pessoas.filter(n => n.ilha === i.id) })).filter(g => g.l.length);
    const soltos = pessoas.filter(n => !n.ilha || !ilhas.some(i => i.id === n.ilha));
    return `<div class="npcs-v"><h1>${ic('mesa:npc', 64)}Pessoas e criaturas</h1>
      ${grupos.length || soltos.length ? grupos.map(g => `<section class="mundo-sec"><h2>${iconeHTML(g.i.icone, 48)} ${esc(g.i.nome)}</h2><ul class="npcs-g">${g.l.map(card).join('')}</ul></section>`).join('')
        + (soltos.length ? `<section class="mundo-sec"><h2>${ic('mesa:navio', 32)} Pelo caminho</h2><ul class="npcs-g">${soltos.map(card).join('')}</ul></section>` : '')
        : '<p class="nota">Ninguém conhecido ainda. Quem vocês conhecerem aparece aqui, separado por ilha.</p>'}
      <section class="mundo-sec"><h2>${ic('bestiario:rei_mares', 48)} Bestiário</h2>${bichos.length ? `<ul class="npcs-g">${bichos.map(card).join('')}</ul>` : '<p class="nota">Nenhuma criatura encontrada ainda.</p>'}</section></div>`;
  }
};
