/* ═══════════ painel do mestre na tela da mesa: quadro, música, efeitos, tempo, comando e liberar ═══════════ */
const AVISOS_SOM = [['recompensa', 'Cartaz de recompensa'], ['jornal', 'Chegou o jornal (gaivota)'], ['tesouro', 'Tesouro encontrado'], ['liberado', 'Categoria liberada'], ['ilha', 'Ilha descoberta'], ['mar', 'Evento do mar'], ['texto', 'Den Den Mushi (recado)'], ['npc', 'Novo encontro'], ['loja', 'Loja aberta']];
const CATS = { imagem: 'Imagens', trilha: 'Trilhas', sfx: 'Efeitos', foto: 'Fotos dos jogadores', pdf: 'Lore em PDF', icone: 'Ícones' };
const LIM_CAT = { imagem: 12e6, trilha: 15e6, sfx: 3e6, foto: 8e6, pdf: 8e6, icone: 4e6 };
const espacoUsado = () => (M.arquivos || []).reduce((a, x) => a + (x.tam || 0), 0) + 3 * 1048576;   // + ~3 MB das fichas, diários e estado
/** envia arquivos escolhidos: reduz imagens, confere tamanho e espaço; devolve as fichas dos arquivos enviados */
async function enviarArquivos(files, cat, extra = {}) {
  const out = [];
  for (const f of [...files]) {
    let b = f;
    if (/^image\//.test(f.type) && cat !== 'sfx' && cat !== 'trilha') { try { b = await reduzirImagem(f, cat === 'foto' ? 640 : cat === 'icone' ? 256 : 1600); } catch (e) { /* manda como veio */ } }
    if (b.size > (LIM_CAT[cat] || 8e6)) { toast(`<b>${esc(f.name)}</b> passa de ${tamanho(LIM_CAT[cat])}. ${cat === 'trilha' ? 'Converta para MP3 de 128 kbps.' : 'Diminua o arquivo.'}`, { tipo: 'ruim', tempo: 8000 }); continue; }
    if (espacoUsado() + b.size > LIMITE_BANCO * 0.97) { toast('O banco está quase cheio. Apague arquivos antigos em Arquivos.', { tipo: 'ruim', tempo: 8000 }); break; }
    const t = toast(`Enviando <b>${esc(f.name)}</b>…`, { tempo: 60000 });
    try {
      const info = await Arquivos.enviar(b, { nome: f.name.replace(/\.[a-z0-9]+$/i, ''), cat, ...extra }, (i, n) => { if (t && n > 1) t.innerHTML = `Enviando <b>${esc(f.name)}</b> ${Math.round(100 * i / n)}%`; });
      out.push(info); if (t) t.remove();
      toast(`<b>${esc(info.nome)}</b> enviado (${tamanho(info.tam)}).`, { tipo: 'bom' });
    } catch (e) { if (t) t.remove(); toast(`Falhou ao enviar ${esc(f.name)}: ${esc(e.code || e.message)}`, { tipo: 'ruim', tempo: 8000 }); }
  }
  const usado = espacoUsado();
  if (usado > LIMITE_BANCO * 0.8) toast(`Atenção: banco com ${Math.round(100 * usado / LIMITE_BANCO)}% usado.`, { tipo: 'ruim', tempo: 8000 });
  return out;
}
function escolherArquivos(accept, multiplo, cb) {
  const i = document.createElement('input'); i.type = 'file'; i.accept = accept; i.multiple = !!multiplo;
  i.onchange = () => { if (i.files && i.files.length) cb(i.files); }; i.click();
}
const arqs = cat => (M.arquivos || []).filter(a => a.cat === cat).sort((a, b) => (b.em || 0) - (a.em || 0));

const PainelMestre = {
  desenhar() {
    const el = $('#mt-mestre'); if (!el) return;
    if (el.contains(document.activeElement) && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;   // não atrapalha quem está digitando
    if (TelaMesa.abaM === 'musica' || TelaMesa.abaM === 'efeitos') { TelaMesa.subSom = TelaMesa.abaM; TelaMesa.abaM = 'som'; }
    const aba = TelaMesa.abaM, e = M.estado || {};
    const abas = [['quadro', 'Quadro', 'mesa:imagem'], ['som', 'Som', 'mesa:gramofone'], ['tempo', 'Tempo', 'modos:dia_noite'], ['mar', 'No mar', 'mar:navio_pirata'], ['mesa', 'Comando', 'modos:capitao']];
    el.innerHTML = `<h3>${ic('modos:capitao', 32)} Painel do mestre</h3>
      <div class="abas" role="tablist">${abas.map(([k, t, i]) => `<button role="tab" aria-selected="${aba === k}" class="aba ${aba === k ? 'on' : ''}" data-act="mt-aba" data-a="${k}">${ic(i, 32)}<span>${t}</span></button>`).join('')}</div>
      <div class="pm-corpo">${this[aba] ? this[aba](e) : ''}</div>`;
    carregarArquivos(el);
  },
  quadro(e) {
    const L = arqs('imagem'), im = e.imagem;
    return `<div class="pm-bts"><button class="bt" data-act="pm-enviar" data-c="imagem">${ic('mesa:imagem', 32)} Enviar imagens</button>${im ? `<button class="bt fino" data-act="pm-esconder">${ic('mesa:olho_fechado', 32)} Esconder</button>` : ''}</div>
      ${L.length ? `<ul class="pm-galeria">${L.map(a => `<li class="${im && im.arq === a.id ? 'on' : ''}"><button data-act="pm-mostrar" data-id="${a.id}" title="Mostrar para todos: ${esc(a.nome)}"><img data-arq="${a.id}" alt=""><span>${esc(a.nome)}</span></button></li>`).join('')}</ul>`
        : '<p class="nota">Envie imagens de ilhas, lugares e personagens. Toque numa para ela aparecer no quadro de todo mundo. Arte comissionada aparece como é, sem pixelar.</p>'}`;
  },
  /* Música, efeitos e o som de cada aviso numa aba só, com três partes por dentro */
  som(e) {
    const sub = TelaMesa.subSom || lembrar('aba-som') || 'musica';
    const partes = [['musica', 'Música', 'mesa:gramofone'], ['efeitos', 'Efeitos', 'mesa:volume'], ['avisos', 'Som dos avisos', 'mesa:denden']];
    return `<div class="pm-subabas">${partes.map(([k, t, i]) => `<button class="chip ${sub === k ? 'on' : ''}" data-act="pm-subsom" data-s="${k}">${ic(i, 20)} ${t}</button>`).join('')}</div>
      ${sub === 'avisos' ? this.sonsAvisos(e) : sub === 'efeitos' ? this.efeitos(e) : this.musica(e)}`;
  },
  musica(e) {
    const L = arqs('trilha'), t = e.trilha;
    return `<div class="pm-bts"><button class="bt" data-act="pm-enviar" data-c="trilha">${ic('mesa:gramofone', 32)} Enviar MP3</button>${t && t.tocando ? `<button class="bt fino" data-act="pm-parar">⏹ Parar</button>` : ''}</div>
      ${L.length ? `<ul class="pm-lista">${L.map(a => `<li class="${t && t.tocando && t.id === a.id ? 'on' : ''}"><button data-act="pm-tocar" data-id="${a.id}">${t && t.tocando && t.id === a.id ? ic('mesa:gramofone', 32, 'gira') : '▶'}<span>${esc(a.nome)}</span><small>${tamanho(a.tam)}</small></button></li>`).join('')}</ul>`
        : '<p class="nota">A trilha toca em repetição para todos. MP3 de 128 kbps: uma música de 4 min tem uns 4 MB.</p>'}`;
  },
  efeitos(e) {
    const L = arqs('sfx');
    return `<div class="pm-bts"><button class="bt" data-act="pm-enviar" data-c="sfx">${ic('mesa:volume', 32)} Enviar efeitos</button></div>
      ${L.length ? `<div class="pm-sfx">${L.map(a => `<button class="bt sfx" data-act="pm-sfx" data-id="${a.id}">${esc(a.nome)}</button>`).join('')}</div>`
        : '<p class="nota">Efeitos curtos (porta, canhão, risada, gaivota). Só você vê os botões; ao tocar, todos ouvem.</p>'}
`;
  },
  sonsAvisos(e) {
    const L = arqs('sfx');
    return `<p class="nota">Escolha um efeito seu para cada coisa que acontece na mesa. Sem escolha, toca o som padrão do site.</p>
      <ul class="pm-sons">${AVISOS_SOM.map(([k, t]) => `<li><span>${esc(t)}</span><select data-chg="pm-som" data-k="${k}">
        <option value="">Som padrão</option>${L.map(a => `<option value="${a.id}" ${((e.sons || {})[k] === a.id) ? 'selected' : ''}>${esc(a.nome)}</option>`).join('')}</select></li>`).join('')}</ul>`;
  },
  tempo(e) {
    const r = Relogio.agora();
    return `<p class="pm-relogio">${ic(Relogio.icone(), 32)} <b>Dia ${r.dia} · ${r.hh}</b> · ${r.periodo}</p>
      <div class="pm-bts">${[[10, '+10 min'], [60, '+1 h'], [480, '+8 h (descanso longo)'], [1440, '+1 dia'], [-10, '−10 min']].map(([m, t]) => `<button class="bt ${m < 0 ? 'fino' : ''}" data-act="pm-tempo" data-m="${m}">${t}</button>`).join('')}</div>
      <div class="pm-linha"><label>Dia <input id="pm-dia" type="number" min="1" value="${r.dia}"></label><label>Hora <input id="pm-hora" type="time" value="${r.hh}"></label><button class="bt fino" data-act="pm-tempo-set">Acertar</button></div>
      <p class="pm-sub">Clima</p><div class="chips">${CLIMAS.map(([k, t, i]) => `<button class="chip ${r.clima === k ? 'on' : ''}" data-act="pm-clima" data-c="${k}">${ic(i, 32)} ${t}</button>`).join('')}</div>
      <p class="nota">Só você mexe no relógio. O fundo da mesa muda sozinho: madrugada, amanhecer, tarde, pôr do sol, noite, chuva, neblina, neve e calmaria.</p>`;
  },
  mesa(e) {
    const c = e.capitao || {}, js = (M.jogadores || []).filter(j => j.estilo), si = sessaoInfo(), lib = e.liberado || {};
    const mar = marChave(S().viagem.mar), cd = CD_MAR[mar] || 15, nav = js.find(j => /navegador/i.test((fichaDe(j) || {}).profissao || ''));
    return `<p class="nota pm-dica">${ic('modos:capitao', 20)} Número, nome e ícone da sessão: clique no título <b>Sessão ${si.n} · ${esc(si.nome)}</b> lá em cima.</p>
      <p class="pm-sub">No comando do navio</p>
      <p class="nota">Isto é <b>quem está no leme agora</b>, só para o teste do mar. Pode ser uma criança NPC. O capitão do bando, dono do diário do capitão, você define na Tripulação.</p>
      <div class="pm-linha"><select id="pm-cap"><option value="">Ninguém</option>${js.map(j => `<option value="j:${j.uid}" ${c.tipo === 'jogador' && c.uid === j.uid ? 'selected' : ''}>${esc(nomeJ(j))}</option>`).join('')}<option value="npc" ${c.tipo === 'npc' ? 'selected' : ''}>Um NPC…</option></select>
        <input id="pm-cap-nome" placeholder="Nome do NPC" value="${c.tipo === 'npc' ? esc(c.nome || '') : ''}" maxlength="30"><label>Vontade <input id="pm-cap-von" type="number" value="${c.tipo === 'npc' ? (+c.von || 0) : 0}" style="width:4em"></label>
        <button class="bt fino" data-act="pm-cap">Salvar</button></div>
      <div class="pm-linha"><button class="bt" data-act="pm-nav">${ic('modos:logpose', 32)} Teste de Navegação (${esc(mar)}, CD ${cd})</button></div>
      <p class="nota">${nav ? `${esc(nomeJ(nav))} é navegador: rola Sabedoria + Proficiência.` : 'Sem navegador nem timoneiro: Vontade do capitão, com desvantagem e sem proficiência.'} Falhou: 1d10 em Encontros Marítimos (Viagem). <small>GN p. 65 · LJ p. 156</small></p>
      <p class="pm-sub">Liberar para os jogadores</p>
      <div class="chips">${Object.entries(TRANCAVEIS).map(([k, t]) => `<button class="chip ${lib[k] ? 'on' : ''}" data-act="pm-liberar" data-k="${k}">${ic(lib[k] ? 'mesa:cadeado_aberto' : 'mesa:cadeado', 32)} ${t}</button>`).join('')}</div>
      <p class="pm-sub">Den Den Mushi: aviso para todos</p>
      <div class="pm-linha"><input id="pm-aviso" class="cresce" placeholder="Ex.: Um navio da Marinha surge no horizonte!" maxlength="140" data-enter="pm-aviso"><button class="bt" data-act="pm-aviso">${ic('mesa:denden', 32)} Avisar</button></div>`;
  }
};

ACT['pm-subsom'] = el => { TelaMesa.subSom = el.dataset.s; lembrar('aba-som', el.dataset.s); PainelMestre.desenhar(); };
ACT['mt-aba'] = el => { TelaMesa.abaM = el.dataset.a; lembrar('aba-m', el.dataset.a); PainelMestre.desenhar(); };
ACT['pm-enviar'] = el => {
  const c = el.dataset.c, acc = c === 'imagem' ? 'image/*' : 'audio/*,.mp3,.ogg,.m4a,.wav';
  escolherArquivos(acc, true, fs => enviarArquivos(fs, c));
};
ACT['pm-mostrar'] = el => { const a = (M.arquivos || []).find(x => x.id === el.dataset.id); gravarEstado({ imagem: { arq: el.dataset.id, legenda: a ? a.legenda || '' : '' } }); Som.tocar('clique'); };
ACT['pm-esconder'] = () => gravarEstado({ imagem: APAGAR });
ACT['pm-tocar'] = el => { const t = (M.estado || {}).trilha; if (t && t.tocando && t.id === el.dataset.id) return gravarEstado({ trilha: { tocando: false } }); gravarEstado({ trilha: { id: el.dataset.id, inicio: Date.now(), tocando: true } }); };
ACT['pm-parar'] = () => gravarEstado({ trilha: { tocando: false } });
ACT['pm-sfx'] = el => gravarEstado({ sfx: { id: el.dataset.id, n: novoId(), em: Date.now() } });
ACT['pm-tempo'] = el => {
  const r = Relogio.agora(), m = +el.dataset.m;
  gravarEstado({ relogio: { min: Math.max(0, r.min + m) } });
  if (m === 480 && ACT['grupo-longo']) ACT['grupo-longo']();
};
ACT['pm-tempo-set'] = () => {
  const d = Math.max(1, +$('#pm-dia').value || 1), [h, mm] = ($('#pm-hora').value || '08:00').split(':').map(Number);
  gravarEstado({ relogio: { min: (d - 1) * 1440 + (h || 0) * 60 + (mm || 0) } }); toast('Relógio acertado.');
};
ACT['pm-clima'] = el => gravarEstado({ relogio: { clima: el.dataset.c } });
/* o mestre clica no título "Sessão 1 · Mary Geoise" do topo e edita ali mesmo */
ACT['ses-editar'] = () => {
  if (!souMestre()) return;
  const si = sessaoInfo();
  Modal.abrir(`<h2>Sessão</h2><p class="nota">É o que aparece no topo para todo mundo.</p>
    <div class="pm-linha"><label>Nº <input id="pm-ses-n" type="number" min="1" value="${si.n}" style="width:4.5em"></label><label class="cresce">Nome <input id="pm-ses-nome" value="${esc(si.nome)}" maxlength="40" data-enter="pm-sessao"></label></div>
    <div class="pm-linha"><span>Ícone: ${si.icone ? iconeHTML(si.icone, 32) : 'bandeira animada'}</span><button class="bt fino" data-act="pm-ses-ic">Escolher ícone</button><button class="bt fino" data-act="pm-ses-up">Enviar ícone</button>${si.icone ? '<button class="bt fino" data-act="pm-ses-tirar">Tirar</button>' : ''}</div>
    <div class="modal-bts"><button class="bt fino" data-act="ses-prox">Começar a sessão ${si.n + 1}</button><button class="bt bom" data-act="pm-sessao">Salvar</button></div>`);
};
ACT['ses-prox'] = () => { const n = $('#pm-ses-n'); if (n) n.value = sessaoInfo().n + 1; ACT['pm-sessao'](); };
ACT['pm-sessao'] = () => { gravarEstado({ sessao: { n: Math.max(1, +$('#pm-ses-n').value || 1), nome: $('#pm-ses-nome').value.trim() || 'Sessão' } }); Store.set(s => { s.sessao = Math.max(1, +$('#pm-ses-n').value || 1); }, null, { semDesfazer: true }); if (Modal.aberto()) Modal.fechar(); toast('Sessão salva.', { tipo: 'bom' }); };
ACT['pm-ses-ic'] = () => escolherIcone(['ilhas', 'itensop', 'mesa', 'modos', 'trip', 'navios', 'bestiario', 'tesouro', 'mar', 'clima'], ref => gravarEstado({ sessao: { icone: ref } }));
ACT['pm-ses-up'] = () => escolherArquivos('image/*', false, async fs => { const [i] = await enviarArquivos(fs, 'icone'); if (i) gravarEstado({ sessao: { icone: { arq: i.id } } }); });
ACT['pm-ses-tirar'] = () => gravarEstado({ sessao: { icone: APAGAR } });
ACT['pm-cap'] = () => {
  const v = $('#pm-cap').value;
  if (!v) return gravarEstado({ capitao: APAGAR });
  if (v === 'npc') { const nome = $('#pm-cap-nome').value.trim(); if (!nome) return toast('Escreva o nome do NPC.'); return gravarEstado({ capitao: { tipo: 'npc', nome, von: +$('#pm-cap-von').value || 0, uid: APAGAR } }); }
  const j = (M.jogadores || []).find(x => x.uid === v.slice(2));
  gravarEstado({ capitao: { tipo: 'jogador', uid: v.slice(2), nome: APAGAR, von: APAGAR } }); toast(`${esc(nomeJ(j))} está no comando.`);
};
ACT['pm-nav'] = () => {
  const mar = marChave(S().viagem.mar), cd = CD_MAR[mar] || 15, js = (M.jogadores || []).filter(j => j.estilo);
  const nav = js.find(j => /navegador/i.test((fichaDe(j) || {}).profissao || ''));
  if (nav) { const f = fichaDe(nav), b = attrMod(f, 'SAB') + (num(f.prof) || 0); return rolarPublico(`d20${b >= 0 ? '+' : ''}${b}`, `Navegação (${mar}, CD ${cd}) · ${nomeJ(nav)}`, { forcarD20: true, tipo: 'navegacao' }); }
  const c = noComando(); if (!c) return toast('Escolha quem está no leme, ou defina o capitão do bando na Tripulação.', { tipo: 'ruim' });
  const b = c.tipo === 'jogador' ? attrMod(fichaDe(c.j), 'VON') : c.von;
  rolarPublico(`d20${b >= 0 ? '+' : ''}${b}`, `Navegação (${mar}, CD ${cd}) · Vontade de ${c.nome}`, { modo: 'desv', forcarD20: true, tipo: 'navegacao', motivo: 'sem navegador: desvantagem, sem proficiência' });
};
ACT['pm-liberar'] = el => {
  const k = el.dataset.k, lib = (M.estado || {}).liberado || {}, novo = !lib[k];
  gravarEstado({ liberado: { [k]: novo } });
  if (novo) avisar('liberado', `O mestre liberou: ${TRANCAVEIS[k]}`);
};
ACT['pm-aviso'] = () => { const t = $('#pm-aviso').value.trim(); if (!t) return; avisar('texto', t); $('#pm-aviso').value = ''; toast('Aviso enviado.', { tipo: 'bom' }); };

/* escolher um ícone das folhas de pixel art */
const FOLHA_NOME = { rostos_pir: 'Piratas 1', rostos_pir2: 'Piratas 2', rostos_mar: 'Marinha', rostos_rec: 'Recrutas', rostos_gov: 'Governo', rostos_gov2: 'Governo (sem capa)', bichos1: 'Bichos 1', bichos2: 'Bichos 2', mar2: 'Mar', objetos: 'Objetos',
  retratos: 'Retratos', npcs: 'NPCs', especies: 'Espécies', especies2: 'Espécies 2', bestiario: 'Bestiário' };
const FOLHAS_ROSTOS = ['rostos_pir', 'rostos_pir2', 'rostos_mar', 'rostos_rec', 'rostos_gov', 'rostos_gov2', 'bichos1', 'bichos2'];
function escolherIcone(folhas, cb) {
  const f0 = folhas[0];
  const grade = f => { const F = MANIFEST.icons[f]; return F ? `<div class="ic-grade">${F.names.map(n => `<button data-act="ic-esc" data-r="${f}:${n}" title="${n.replace(/_/g, ' ')}">${ic(f + ':' + n, 64)}</button>`).join('')}</div>` : ''; };
  Modal.abrir(`<h2>Escolha um ícone</h2><div class="chips">${folhas.filter(f => MANIFEST.icons[f]).map(f => `<button class="chip ${f === f0 ? 'on' : ''}" data-act="ic-folha" data-f="${f}">${FOLHA_NOME[f] || f}</button>`).join('')}</div><div id="ic-area">${grade(f0)}</div>`);
  escolherIcone.cb = cb; escolherIcone.grade = grade;
}
ACT['ic-folha'] = el => { $$('#modal .chip').forEach(c => c.classList.toggle('on', c === el)); $('#ic-area').innerHTML = escolherIcone.grade(el.dataset.f); };
ACT['ic-esc'] = el => { Modal.fechar(); if (escolherIcone.cb) escolherIcone.cb(el.dataset.r); };

ACT['pm-som'] = el => gravarEstado({ sons: { [el.dataset.k]: el.value || APAGAR } });
