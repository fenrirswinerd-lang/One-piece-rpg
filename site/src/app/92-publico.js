/* ═══════════ para todos: diário de bordo (com o do capitão e o resumo da sessão), jornal, tripulação, guia de lore, combate ═══════════ */
VIEWS.bordo = {
  titulo: 'Diário de bordo', icone: 'mesa:diario', chaves: ['bordo', 'capDiario', 'capPriv', 'trip', 'estado'],
  render() {
    const L = M.bordo || [], C = M.capDiario || [], miro = miroEmbed((M.estado.bordoMiro || ''));
    return `<div class="bordo-v"><header class="di-cab">${ic('capas2:bordo', 128)}<div><h1>Diário de bordo</h1><p class="nota">O que a tripulação viveu, sessão por sessão. ${souMestre() ? 'Você escreve aqui e gera o resumo da sessão sozinho.' : 'O mestre escreve aqui; o capitão publica o diário dele ao lado.'}</p>
      <button class="bt fino" data-act="bd-pdf">${ic('modos:lore_pdf', 32)} Baixar em PDF</button></div></header>
      ${souMestre() ? `<section class="pap bordo-novo"><input id="bd-tit" placeholder="Título (ex.: Sessão 3 · Fuga de Mary Geoise)" maxlength="90"><textarea id="bd-txt" rows="4" placeholder="O que aconteceu…"></textarea>
        <div class="linha-bts"><button class="bt bom" data-act="bd-add">Publicar no diário</button><button class="bt" data-act="bd-resumo">${ic('modos:anotar', 32)} Gerar resumo da sessão</button>
        <input id="bd-miro" class="cresce" placeholder="Quadro do Miro da mesa (opcional)" value="${esc(M.estado.bordoMiro || '')}"><button class="bt fino" data-act="bd-miro">Salvar Miro</button></div></section>` : ''}
      <div class="bordo-grade"><section class="bordo-l">${L.length ? L.map(e => `<article class="bordo-e ${e.tipo === 'resumo' ? 'resumo' : ''}"><header><h2>${esc(e.titulo || 'Registro')}</h2><time>${esc(e.dia || '')} · ${new Date(e.em).toLocaleDateString('pt-BR')}</time>
          ${souMestre() ? `<button class="link" data-act="bd-tirar" data-id="${e.id}">apagar</button>` : ''}</header><div class="pre">${esc(e.txt)}</div></article>`).join('') : '<p class="nota">Nenhum registro ainda.</p>'}</section>
        <aside class="bordo-cap"><div class="pap"><h2>${ic('modos:capitao', 32)} Diário do capitão</h2>${C.length ? `<ol class="di-l">${C.slice(0, 20).map(e => `<li><header><b>${esc(e.titulo || e.autor || '')}</b><time>${esc(e.dia || '')}${e.titulo && e.autor ? ' · ' + esc(e.autor) : ''}</time></header><p class="pre">${esc(e.txt)}</p></li>`).join('')}</ol>` : '<p class="nota">O capitão do bando (definido na Tripulação) escreve pela aba Personagem e publica aqui o que quiser.</p>'}</div>${capPrivMestreHTML()}</aside></div>
      ${miro ? `<section class="pap"><h2>${ic('modos:quadro', 32)} Quadro da mesa</h2><div class="miro"><iframe src="${esc(miro)}" title="Quadro do Miro da mesa" allowfullscreen loading="lazy"></iframe></div></section>` : ''}</div>`;
  }
};
ACT['bd-add'] = async () => {
  const txt = $('#bd-txt').value.trim(); if (!txt) return toast('Escreva o registro.');
  const r = Relogio.agora(); await DB.novo('mesa/bordo/entradas', { titulo: $('#bd-tit').value.trim(), txt, em: Date.now(), dia: `Dia ${r.dia}`, sessao: sessaoInfo().n, tipo: 'nota' });
  $('#bd-txt').value = ''; $('#bd-tit').value = ''; toast('Publicado.', { tipo: 'bom' });
};
ACT['bd-tirar'] = el => confirmar('Apagar este registro do diário de bordo?', () => DB.apagar('mesa/bordo/entradas/' + el.dataset.id), { perigo: true });
ACT['bd-miro'] = () => { const u = $('#bd-miro').value.trim(); if (u && !miroEmbed(u)) return toast('Esse link não parece de um quadro do Miro.', { tipo: 'ruim' }); gravarEstado({ bordoMiro: u }); };
/* resumo automático: pega o diário do Controle desta sessão e separa por assunto; o mestre revisa antes de publicar */
/* resumo da sessão: números + linha do tempo, tirados só do que o Controle registrou (nada inventado) */
function resumoSessao() {
  const s = S(), si = sessaoInfo(), limpa = x => String(x || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const ent = (s.diario || []).filter(d => d.sessao === s.sessao).map(d => ({ t: d.t, txt: limpa(d.txt), tipo: d.tipo }));
  const conta = re => ent.filter(e => re.test(e.txt)).length;
  const nums = [['combate(s) começaram', conta(/começou um combate/i)], ['queda(s) a 0 PV', conta(/caiu inconsciente|caiu a 0|desmai/i)], ['morte(s)', conta(/morte instantânea|morreu/i)], ['descanso(s)', conta(/descanso (curto|longo)/i)],
    ['tesouro(s) ou achado(s)', conta(/tesouro|baú|achou/i)], ['mudança(s) de recompensa', conta(/recompensa de/i)], ['registro(s) de XP ou marco', conta(/\bxp\b|marco|subiu de nível/i)], ['decisão(ões) da mesa', conta(/^decisão da mesa/i)]].filter(x => x[1]);
  const rol = (M.rolagens || []), crit = rol.filter(r => r && (r.critico || r.nat === 20)).length, falha = rol.filter(r => r && (r.falha || r.nat === 1)).length;
  /* linha do tempo: sai o que é miúdo (rolagem solta, gasto de PP, ajuste de vida) para sobrar o que conta a história */
  const miudo = /^rolou |gastou \d+ pp|usou .*\(−\d+ pp\)|−\d+ pp|\+\d+ pp|^dano de|^cura de/i;
  const marcos = ent.filter(e => e.tipo !== 'dado' && !miudo.test(e.txt));
  const hh = t => { const d = new Date(t); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
  const linha = marcos.slice(-45).map(e => `${hh(e.t)}  ${e.txt}`);
  const ilha = ((M.mundo.ilhas || []).find(i => i.id === M.mundo.atual) || {}).nome, r = Relogio.agora(), cap = capitaoAtual();
  const cab = [`Onde: ${ilha || 'no mar'} · Dia ${r.dia}`, cap ? `No comando: ${cap.nome}` : ''].filter(Boolean).join('\n');
  const txt = [cab,
    nums.length || rol.length ? 'NÚMEROS DA SESSÃO\n' + nums.map(([n, v]) => `• ${v} ${n}`).concat(rol.length ? [`• ${rol.length} rolagem(ns) na mesa${crit ? `, ${crit} com 20 natural` : ''}${falha ? `, ${falha} com 1 natural` : ''}`] : []).join('\n') : '',
    linha.length ? 'LINHA DO TEMPO\n' + linha.join('\n') : 'O diário do Controle não registrou eventos nesta sessão.'].filter(Boolean).join('\n\n');
  return { si, txt, fatos: marcos.length };
}
ACT['bd-resumo'] = () => {
  const { si, txt, fatos } = resumoSessao();
  Modal.abrir(`<h2>Resumo da sessão ${si.n}</h2><p class="nota">Montado só com o que o Controle registrou (${fatos} fato(s)). Corte o que não importa e escreva do seu jeito antes de publicar.</p>
    <label class="campo"><span>Título</span><input id="rs-tit" value="Sessão ${si.n} · ${esc(si.nome)}"></label><label class="campo"><span>Texto</span><textarea id="rs-txt" rows="16">${esc(txt)}</textarea></label>
    <div class="modal-bts"><button class="bt bom" data-act="rs-pub">Publicar no diário de bordo</button><button class="bt" data-act="copiar" data-alvo="rs-txt">Copiar</button>
      <button class="bt fino" data-act="rs-pedido" title="Copia um pedido pronto para colar no Claude, fora do site">Copiar pedido para polir no Claude</button></div>
    <p class="nota">O site não usa IA. O botão de pedido só copia um texto: cole numa conversa com o Claude se quiser a versão em tom de diário de bordo.</p>`, { classe: 'larga' });
};
ACT['rs-pedido'] = () => {
  const t = (($('#rs-txt') || {}).value || '').trim(), si = sessaoInfo();
  const pedido = `Abaixo estão os fatos registrados da sessão ${si.n} ("${si.nome}") da minha mesa de RPG de One Piece.\nEscreva um resumo curto (no máximo 12 linhas), em português simples, em tom de diário de bordo de um navio pirata.\nRegras: use SÓ os fatos abaixo; não invente cenas, falas, motivos nem nomes; se faltar informação, deixe de fora; não mude a ordem dos acontecimentos.\n\nFATOS:\n${t}`;
  try { navigator.clipboard.writeText(pedido).then(() => toast('Pedido copiado. Cole numa conversa com o Claude.', { tipo: 'bom' }), () => toast('Não consegui copiar. Selecione o texto e use Ctrl+C.')); } catch (e) { toast('Não consegui copiar. Selecione o texto e use Ctrl+C.'); }
};
ACT['rs-pub'] = async () => { await DB.novo('mesa/bordo/entradas', { titulo: $('#rs-tit').value.trim(), txt: $('#rs-txt').value, em: Date.now(), dia: `Dia ${Relogio.agora().dia}`, sessao: sessaoInfo().n, tipo: 'resumo' }); Modal.fechar(); toast('Resumo publicado.', { tipo: 'bom' }); };

/* ───── jornal (chega pela News Coo) ───── */
VIEWS.jornal = {
  titulo: 'Jornal', icone: 'modos:newscoo', chaves: ['jornal'],
  render() {
    const L = M.jornal || [];
    setTimeout(() => pixelarJornal($('#vista')), 60);
    return `<div class="jornal-v"><h1>${MANIFEST.anims.newscoo ? anim('newscoo', 1) : ic('modos:newscoo', 64)}Jornal da Economia Mundial</h1>
      ${souMestre() ? `<section class="pap jornal-novo"><input id="jn-tit" placeholder="Manchete" maxlength="90"><textarea id="jn-txt" rows="4" placeholder="Notícia"></textarea>
        <div class="linha-bts"><label class="campo-inline">Imagem <select id="jn-img"><option value="">Sem imagem</option>${arqs('imagem').map(a => `<option value="${a.id}">${esc(a.nome)}</option>`).join('')}</select></label>
        <label class="campo-inline">Pixelar <select id="jn-pix"><option value="0">Já é pixel art</option><option value="1" selected>Um pouco</option><option value="2">Bastante</option></select></label>
        <label class="campo-inline">Onde <select id="jn-lay"><option value="meio" selected>Imagem no meio, texto embaixo</option><option value="c1">Imagem na coluna da esquerda</option><option value="c2">Imagem na coluna do meio</option><option value="c3">Imagem na coluna da direita</option></select></label>
        <button class="bt fino" data-act="jn-enviar">Enviar imagem nova</button>
        <button class="bt bom" data-act="jn-pub">${ic('modos:newscoo', 32)} Mandar pela News Coo</button></div>
        <p class="nota">A imagem entra na moldura do jornal. "Já é pixel art" não mexe no desenho; as outras duas reduzem e ampliam de novo, para casar com o resto do site.</p></section>` : ''}
      ${L.length ? `<div class="jornal-l">${L.map(n => `<article class="jornal-p" data-lay="${esc(n.img ? (n.lay || 'meio') : 'semfoto')}" style="--pagina:url(${ASSETS[(MANIFEST.images.jornal_pagina || {}).file] || ''})">
          <h2 class="jn-manchete">${esc(n.titulo)}</h2>
          ${n.img ? `<div class="jn-foto-cx"><img class="jn-foto" data-arq="${esc(n.img)}" data-pix="${+n.pix || 0}" alt="">
            ${souMestre() ? `<button class="bt-ic mini jn-tirar-img" data-act="jn-img-tirar" data-id="${n.id}" title="Tirar a imagem desta notícia">✕</button>` : ''}</div>` : ''}
          <div class="jn-corpo"><p class="jn-dia">${esc(n.dia || '')}</p><p class="pre">${esc(n.txt || '')}</p></div>
          ${souMestre() ? `<button class="link jn-apagar" data-act="jn-tirar" data-id="${n.id}">apagar notícia</button>` : ''}</article>`).join('')}</div>`
        : '<p class="nota">Nenhuma notícia chegou ainda.</p>'}</div>`;
  }
};
ACT['jn-pub'] = async () => {
  const titulo = $('#jn-tit').value.trim(); if (!titulo) return toast('Escreva a manchete.');
  await DB.novo('mesa/jornal/noticias', { titulo, txt: $('#jn-txt').value.trim(), img: $('#jn-img').value || null, pix: +(($('#jn-pix') || {}).value || 0), lay: (($('#jn-lay') || {}).value || 'meio'), em: Date.now(), dia: `Dia ${Relogio.agora().dia}` });
  avisar('jornal', titulo); $('#jn-tit').value = ''; $('#jn-txt').value = ''; toast('Notícia enviada.', { tipo: 'bom' });
};
ACT['jn-tirar'] = el => confirmar('Apagar esta notícia?', () => DB.apagar('mesa/jornal/noticias/' + el.dataset.id), { perigo: true });

/* ───── tripulação (o mestre libera quando o bando se formar) ───── */
VIEWS.tripulacao = {
  titulo: 'Tripulação', icone: 'mesa:tripulacao', chaves: ['trip', 'jogadores', 'recompensas'],
  ao(ch) { const a = document.activeElement; if (a && /INPUT|TEXTAREA/.test(a.tagName) && $('#vista').contains(a)) { this.pendente = true; return false; } },
  render() {
    const t = M.trip || {}, js = (M.jogadores || []).filter(j => j.estilo), tot = recompensaTotal(), m = souMestre();
    const campo = (k, ph, linhas = 2) => m ? `<textarea rows="${linhas}" data-chg="tp-campo" data-k="${k}" placeholder="${ph}">${esc(t[k] || '')}</textarea>` : `<p class="pre">${esc(t[k] || '—')}</p>`;
    return `<div class="trip-v"><header class="trip-cab">
        <div class="jolly">${t.jolly ? iconeHTML(t.jolly, 128) : ic('mesa:tripulacao', 128, 'silhueta')}${m ? `<div class="linha-bts"><button class="bt fino" data-act="tp-jolly">${t.jolly ? 'Trocar' : 'Enviar'} Jolly Roger</button>${t.jolly ? '<button class="bt fino" data-act="tp-jolly-tirar">Tirar</button>' : ''}</div>` : ''}</div>
        <div class="cresce">${m ? `<input class="tp-nome" value="${esc(t.nome || '')}" placeholder="Nome do bando" data-chg="tp-campo" data-k="nome">` : `<h1>${esc(t.nome || 'Tripulação sem nome')}</h1>`}
          <p class="rec-tot">${ic('trip:recompensa_total', 32)} Recompensa total: <b>฿ ${fmt(tot)}</b></p>${m ? `<label class="campo-inline">Extra (navio, aliados) ฿ <input type="number" value="${num(t.extra) || 0}" data-chg="tp-campo" data-k="extra" style="width:10em"></label>` : ''}
          ${campo('resumo', 'Resumo: quem são, de onde vieram, o que querem.', 3)}</div></header>
      <section class="pap trip-cap">${ic('modos:capitao', 48)}<div class="cresce"><h2>Capitão do bando</h2>
        ${m ? `<div class="pm-linha"><select id="tp-cap"><option value="">Ainda não tem capitão</option>${js.map(j => `<option value="j:${j.uid}" ${(t.capitao || {}).tipo === 'jogador' && t.capitao.uid === j.uid ? 'selected' : ''}>${esc(nomeJ(j))}</option>`).join('')}<option value="npc" ${(t.capitao || {}).tipo === 'npc' ? 'selected' : ''}>Um NPC…</option></select>
          <input id="tp-cap-nome" placeholder="Nome do NPC" value="${(t.capitao || {}).tipo === 'npc' ? esc(t.capitao.nome || '') : ''}" maxlength="30">
          <button class="bt fino" data-act="tp-cap">Salvar</button></div>
          <p class="nota">Este é o capitão de verdade: é dele o diário do capitão. Quem só pega o leme de passagem para um teste do mar você escolhe no Painel do mestre, em Comando.</p>`
        : `<p class="cap-nome">${(() => { const o = capitaoOficial(); return o ? esc(o.nome) : 'O bando ainda não tem capitão.'; })()}</p>`}</div></section>
      <section class="trip-membros">${js.map(j => { const f = fichaDe(j), v = (M.recompensas || {})[j.uid] ?? (f ? num(f.recompensa) : 0) ?? 0; const cap = (t.capitao || {}).tipo === 'jogador' && t.capitao.uid === j.uid; return `<article class="pap ${cap ? 'e-cap' : ''}">${fotoJ(j, 64)}<div><b>${esc(nomeJ(j))}</b>${cap ? `<span class="tag ouro">${ic('modos:capitao', 32)} capitão</span>` : ''}<small>${esc((f && [f.profissao, f.estilo].filter(Boolean).join(' · ')) || '')}</small><p>฿ ${fmt(v)}</p></div></article>`; }).join('')}</section>
      <div class="trip-grade">
        <section class="pap">${ic('trip:notoriedade', 32)}<h2>Como o mundo vê o bando</h2>${campo('mundo', 'O que os jornais e a Marinha dizem.')}</section>
        <section class="pap">${ic('trip:rumores', 32)}<h2>O que vocês sabem</h2>${campo('sabem', 'Pistas, rumores, informações.', 4)}</section>
        <section class="pap">${ic('trip:aliados', 32)}<h2>Aliados</h2>${campo('aliados', 'Quem ajuda.')}</section>
        <section class="pap">${ic('trip:inimigos', 32)}<h2>Inimigos</h2>${campo('inimigos', 'Quem caça vocês.')}</section>
        <section class="pap">${ic('trip:marinha', 32)}<h2>Marinha e Governo</h2>${campo('marinha', 'O que a Marinha e o Governo Mundial fazem sobre vocês.')}</section>
        <section class="pap">${ic('trip:territorio', 32)}<h2>Território e navio</h2>${campo('territorio', 'Navio, base, ilhas protegidas.')}</section>
      </div></div>`;
  }
};
ACT['tp-campo'] = el => DB.gravar('mesa/tripulacao', { [el.dataset.k]: el.dataset.k === 'extra' ? (num(el.value) || 0) : el.value }).then(() => toast('Salvo.'));
ACT['tp-jolly'] = () => Modal.abrir(`<h2>Jolly Roger</h2><p class="nota">Use o prompt "Jolly Roger da tripulação" (sob demanda) e envie a imagem aqui.</p><div class="linha-bts"><button class="bt bom" data-act="tp-jolly-up">Enviar imagem</button><button class="bt" data-act="tp-jolly-ic">Usar um ícone por enquanto</button></div>`);
ACT['tp-jolly-up'] = () => { Modal.fechar(); escolherArquivos('image/*', false, async fs => { const [a] = await enviarArquivos(fs, 'icone'); if (a) DB.gravar('mesa/tripulacao', { jolly: { arq: a.id } }); }); };
ACT['tp-jolly-ic'] = () => escolherIcone(['trip', 'mesa', 'tesouro'], ref => DB.gravar('mesa/tripulacao', { jolly: ref }));
ACT['tp-jolly-tirar'] = () => DB.gravar('mesa/tripulacao', { jolly: APAGAR });

/* ───── guia de lore: espécies do sistema e o mundo, com links da wiki ───── */
const WIKI = t => `https://onepiece.fandom.com/wiki/${encodeURIComponent(t.replace(/ /g, '_'))}`;
const WIKI_PT = t => `https://onepiece.fandom.com/pt/wiki/Especial:Pesquisar?query=${encodeURIComponent(t)}`;
const ESPECIES = [
  ['humano', 'Humanos', 'LJ p. 22', 'Humans', 'A espécie mais comum dos mares. Variantes: comuns, Braços Longos, Pernas Longas, Pescoço de Cobra e Kujas.'],
  ['bracos_longos', 'Tribo Braços Longos', 'LJ p. 22', 'Longarm Tribe', 'Braços com duas articulações; vêm do Novo Mundo.'],
  ['pernas_longas', 'Tribo Pernas Longas', 'LJ p. 23', 'Longleg Tribe', 'Pernas enormes e chutes poderosos.'],
  ['pescoco_cobra', 'Tribo Pescoço de Cobra', 'LJ p. 24', 'Snakeneck Tribe', 'Pescoço longo e flexível.'],
  ['kuja', 'Tribo Kuja', 'LJ p. 23', 'Kuja', 'Guerreiras de Amazon Lily, com arcos de serpente (Cobra Bélica).'],
  ['anao', 'Anões (Tontatta)', 'LJ p. 16', 'Dwarves', 'Pequenos, rápidos e muito ingênuos.'],
  ['skypean', 'Celestiais: Skypeans', 'LJ p. 18–19', 'Skypieans', 'Povo das ilhas do céu, com asinhas nas costas.'],
  ['birkan', 'Celestiais: Birkans', 'LJ p. 18–19', 'Birkans', 'Celestiais de Birka, ilha do céu muito religiosa (Enel era de lá).'],
  ['shandian', 'Celestiais: Shandians', 'LJ p. 18–19', 'Shandia', 'Guerreiros com pinturas tribais, defensores da terra dos ancestrais.'],
  ['gigante', 'Gigantes', 'LJ p. 20', 'Giants', 'Enormes, orgulhosos e guerreiros; Elbaf é a terra deles.'],
  ['lunariano', 'Lunarianos', 'LJ p. 25–26', 'Lunarians', 'Raça quase extinta, asas negras e chama nas costas.'],
  ['mink', 'Minks', 'LJ p. 28', 'Minks', 'Povo animal de Zou; usam Electro e viram Sulong na lua cheia.'],
  ['homem_peixe', 'Homens-Peixe', 'LJ p. 30', 'Fish-Men', 'Força dez vezes maior que a humana; Ilha dos Homens-Peixe.'],
  ['sereia', 'Sirenos e Sereias', 'LJ p. 30', 'Merfolk', 'Metade peixe, nadam como ninguém; sofrem com o tráfico de escravos.'],
  ['bucaneiro', 'Bucaneiros (variação rara)', 'LJ p. 32', 'Buccaneers', 'Povo antigo, de corpo enorme, caçado pelo Governo; mente impossível de controlar.'],
  ['filho_noite', 'Filho da Noite (variação rara)', 'LJ p. 32', '', 'Pode comer mais de uma Akuma no Mi (no mangá, só o Barba Negra).'],
  ['oni', 'Oni (Ogros)', 'PDF Espécie Oni 2.0', 'Oni', 'Gente enorme e com chifres, das lendas de Wano. Espécie nova, em arquivo à parte.', 'oni']
];
const MUNDO_LINKS = [['Marinha', 'Marines', 'trip:marinha'], ['Governo Mundial', 'World Government', 'trip:governo'], ['Exército Revolucionário', 'Revolutionary Army', 'trip:revolucionarios'], ['Tenryuubito (Nobres Mundiais)', 'World Nobles', 'npcs:tenryuubito'],
  ['Imperadores do Mar', 'Four Emperors', 'trip:imperadores'], ['Cipher Pol', 'Cipher Pol', 'trip:cipher_pol'], ['Caçadores de recompensa', 'Bounty Hunter', 'trip:cacadores'], ['Recompensas', 'Bounties', 'modos:cartaz'],
  ['Akuma no Mi', 'Devil Fruit', 'itensop:akuma_no_mi'], ['Haki', 'Haki', 'poderes:aura'], ['Grand Line', 'Grand Line', 'mesa:navio'], ['Os quatro Blues', 'Blues', 'mar:ilha'], ['Calm Belt', 'Calm Belt', 'bestiario:rei_mares'],
  ['Novo Mundo', 'New World', 'ilhas:vulcao'], ['Reis dos Mares', 'Sea Kings', 'bestiario:rei_mares'], ['Poneglyphs', 'Poneglyphs', 'ilhas:ruinas'], ['Log Pose', 'Log Pose', 'itensop:log_pose'], ['Den Den Mushi', 'Den Den Mushi', 'mesa:denden'],
  ['Vivre Card', 'Vivre Card', 'itensop:vivre_card'], ['Dials', 'Dials', 'itensop:dial'], ['Ilhas do céu', 'Sky Island', 'ilhas:celeste'], ['Kairoseki', 'Seastone', 'itensop:kairoseki']];
VIEWS.guia = {
  titulo: 'Guia de lore', icone: 'modos:wiki',
  render() {
    return `<div class="guia-v"><h1>${ic('modos:wiki', 64)}Guia de lore</h1><p class="nota">Para montar a lore do personagem: as espécies do sistema (com a página do Livro do Jogador) e o mundo de One Piece, com links da One Piece Wiki. Os links abrem em outra aba.</p>
      <h2>Espécies do sistema</h2><div class="guia-grade">${ESPECIES.map(([icn, n, pg, w, d]) => `<article class="guia-c">${ic('especies:' + icn, 96)}<div><h3>${esc(n)}</h3><p class="nota">${pg}</p><p>${esc(d)}</p>
        <p class="linha-bts">${w ? `<a class="bt fino" href="${WIKI(w)}" target="_blank" rel="noopener">Wiki (inglês)</a>` : ''}<a class="bt fino" href="${WIKI_PT(n.replace(/\s*\(.*\)/, '').replace('Celestiais: ', ''))}" target="_blank" rel="noopener">Pesquisar em português</a></p></div></article>`).join('')}</div>
      <h2>O mundo</h2><div class="guia-links">${MUNDO_LINKS.map(([n, w, i]) => `<a class="guia-l" href="${WIKI(w)}" target="_blank" rel="noopener">${ic(i, 48)}<span>${esc(n)}</span></a>`).join('')}</div>
      ${(M.estado.discord || {}).convite || (M.estado.discord || {}).servidor ? `<h2>${ic('modos:voz', 32)} Discord da mesa</h2><div class="pap discord">${M.estado.discord.convite ? `<a class="bt bom" href="${esc(M.estado.discord.convite)}" target="_blank" rel="noopener">Entrar no servidor</a>` : ''}
        ${M.estado.discord.servidor ? `<iframe src="https://discord.com/widget?id=${esc(M.estado.discord.servidor)}&theme=dark" title="Quem está no Discord" width="350" height="420" sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"></iframe>` : ''}</div>` : ''}</div>`;
  }
};

/* ───── combate: o mestre vê o Controle; o jogador vê a ordem, de quem é a vez e o estado de cada um ───── */
const _combMestre = { render: VIEWS.combate.render, depois: VIEWS.combate.depois };
VIEWS.combate.chaves = ['combate', 'jogadores'];
VIEWS.combate.ao = () => (souMestre() ? false : undefined);
VIEWS.combate.render = function () {
  if (souMestre()) return _combMestre.render.call(this);
  const c = M.combate;
  if (!c || !c.ativo) return `<div class="tela-trancada">${ic('tesouro:espada', 128)}<h1>Sem combate agora</h1><p>Quando o mestre começar uma luta, a ordem de iniciativa aparece aqui.</p>
    <button class="bt" data-act="cb-ini-jog">${ic('status:iniciativa', 32)} Rolar minha iniciativa</button></div>`;
  return `<div class="cbj"><h1>${ic('tesouro:espada', 64)}Combate · rodada ${c.rodada}</h1>
    <div class="linha-bts"><button class="bt bom" data-act="cb-ini-jog">${ic('status:iniciativa', 32)} Rolar minha iniciativa</button></div>
    <ol class="cbj-l">${(c.lista || []).map((x, i) => `<li class="pap ${i === c.vez ? 'vez' : ''} ${x.fora || x.morto ? 'fora' : ''} ${x.uid === Eu.uid ? 'eu' : ''}">
      <b class="cbj-ini">${x.ini ?? '—'}</b>${x.tipo === 'pc' ? retratoHTML(x.retrato, x.nome, 48) : iconeHTML(x.retrato || 'retratos:pirata_novato', 48)}
      <div><b>${esc(x.nome)}</b>${i === c.vez ? ' <span class="tag ouro">vez</span>' : ''}<small>${x.tipo === 'pc' ? `PV ${x.pv ?? '—'}${x.pvMax ? '/' + x.pvMax : ''}${x.temp ? ` (+${x.temp})` : ''}` : esc(x.estado || '')}${x.conds && x.conds.length ? ' · ' + x.conds.map(esc).join(', ') : ''}</small>
      ${x.tipo === 'pc' && x.pvMax ? blocos(x.pv, x.pvMax, 'pv') : ''}</div></li>`).join('')}</ol>
    <p class="nota">Inimigos aparecem só como "inteiro", "ferido", "muito ferido" ou "quase caindo".</p></div>`;
};
VIEWS.combate.depois = function (r) { if (souMestre() && _combMestre.depois) return _combMestre.depois.call(this, r); };
ACT['cb-ini-jog'] = () => {
  const f = minhaFicha(), est = meuEstilo();
  if (!f || est === 'timao') { const m = num(TelaMesa.mod) || 0; return rolarPublico(`1d20${m ? (m > 0 ? '+' : '') + m : ''}`, m ? 'Iniciativa' : 'Iniciativa (sem modificador: ajuste o mod. na mesa)', { tipo: 'iniciativa' }); }
  let b = f.desMod ?? attrMod(f, 'DES'), modo = '', motivo = '';
  if (est === 'engrenagem') { const aj = ajusteAuto('teste', 'DES'); modo = aj.modo; b += aj.pen; motivo = aj.motivo; }
  rolarPublico(`d20${b >= 0 ? '+' : ''}${b}`, 'Iniciativa', { forcarD20: true, modo, tipo: 'iniciativa', motivo });
};

ACT['tp-cap'] = () => {
  const v = $('#tp-cap').value;
  if (!v) return DB.gravar('mesa/tripulacao', { capitao: APAGAR });
  if (v === 'npc') { const nome = $('#tp-cap-nome').value.trim(); if (!nome) return toast('Escreva o nome do NPC.'); return DB.gravar('mesa/tripulacao', { capitao: { tipo: 'npc', nome, uid: APAGAR } }); }
  DB.gravar('mesa/tripulacao', { capitao: { tipo: 'jogador', uid: v.slice(2), nome: APAGAR } });
  toast('Capitão do bando definido. O diário do capitão agora é dele.');
};

/* a imagem da notícia entra pixelada de verdade: reduz num canvas e deixa o navegador ampliar sem suavizar */
function pixelarJornal(raiz) {
  if (!raiz) return;
  raiz.querySelectorAll('img.jn-foto').forEach(im => {
    const n = +im.dataset.pix; if (!n) return;
    const faz = () => {
      if (!im.naturalWidth) return;
      try {
        const lado = n === 1 ? 150 : 84, r = im.naturalWidth / im.naturalHeight || 1;
        const w = Math.max(8, Math.round(r >= 1 ? lado : lado * r)), h = Math.max(8, Math.round(r >= 1 ? lado / r : lado));
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(im, 0, 0, w, h);
        im.dataset.pix = '0'; im.src = c.toDataURL('image/png');
      } catch (e) { im.dataset.pix = '0'; }
    };
    if (im.complete && im.naturalWidth) faz(); else im.addEventListener('load', faz, { once: true });
  });
}
ACT['jn-img-tirar'] = el => confirmar('Tirar a imagem desta notícia? O texto fica.', () => DB.gravar('mesa/jornal/noticias/' + el.dataset.id, { img: APAGAR, pix: 0 }), { perigo: true });
ACT['jn-enviar'] = () => escolherArquivos('image/*', false, async fs => {
  const [a] = await enviarArquivos(fs, 'imagem');
  if (a) { App.render(); setTimeout(() => { const s2 = $('#jn-img'); if (s2) s2.value = a.id; }, 80); toast('Imagem enviada. Já está escolhida.', { tipo: 'bom' }); }
});
