/* ═══════════ ATELIÊ, parte 2: mais precisão e menos digitação ═══════════
   1) "Puxar do site": escolhe um inimigo, PdN, NPC ou ilha e o Ateliê já preenche os detalhes com o que a ficha diz.
   2) Lote: os prompts de todos os inimigos da luta (ou de todos os NPCs do Mundo) de uma vez.
   3) Tipos novos: tampo da mesa de dados, paisagem de ilha, sprite solto e folha de sprites para enfeitar o site. */
const ART_TAMPO = [['Mesa de navio (madeira)', 'THE TOP OF A HEAVY WOODEN SHIP TABLE MADE OF WIDE DARK PLANKS WITH BRASS NAILS'], ['Mesa de taverna', 'THE TOP OF A WORN TAVERN TABLE WITH RING STAINS AND KNIFE MARKS'], ['Bandeja de feltro', 'A WOODEN DICE TRAY LINED WITH DEEP GREEN FELT, WOODEN RIM ALL AROUND THE EDGE'],
  ['Mapa náutico aberto', 'AN OLD NAUTICAL CHART SPREAD FLAT OVER A WOODEN TABLE, HELD BY THE TABLE ITSELF, WITH COMPASS ROSE DRAWINGS BUT NO READABLE WORDS'], ['Convés molhado', 'A WET SHIP DECK FLOOR WITH ROPES COILED ONLY AT THE VERY EDGES'], ['Areia da praia', 'SMOOTH BEACH SAND WITH A FEW SHELLS ONLY NEAR THE EDGES'], ['Pedra de fortaleza', 'A STONE SLAB TABLE OF A MARINE FORTRESS']];
ART_ESPECIE.push(['Animal ou criatura', 'NON-HUMAN ANIMAL OR SEA BEAST (NOT A PERSON)']);
const ART_PALETA = 'KEY COLORS TO REUSE SO IT MATCHES THE REST OF THE SITE: DARK WOOD #3A2414, WOOD #8A6239, PARCHMENT #F6EAD0 AND #E9CF9A, INK BROWN OUTLINE #2A180D, BRASS GOLD #FFD76A, PIRATE RED #C9302C, SEA BLUE #2F6D8C, SKY BLUE #A9D1E8.';
/* separa as linhas do que o mestre escreveu: cada linha vira uma casa da folha */
function artFolha(txt) {
  const itens = String(txt || '').split(/\n|;/).map(x => x.trim()).filter(Boolean).slice(0, 16), n = itens.length || 4;
  const cols = n <= 4 ? 2 : n <= 9 ? 3 : 4, lin = Math.ceil(n / cols);
  return { n, cols, lin, lista: itens.map((t, i) => `CELL ${i + 1} (ROW ${Math.floor(i / cols) + 1}, COLUMN ${i % cols + 1}): «${t}».`).join(' ') };
}
ART_TIPOS.push(
  { id: 'paisagem', nome: 'Paisagem de ilha (chegada)', ic: 'ilhas:vila', campos: ['ilha', 'hora', 'livre'], tam: 'paisagem 16:9 (ex.: 1536 × 864)',
    onde: 'Mesa → Painel do mestre → Enviar imagens → mostrar no Quadro. Também serve de imagem da ilha no Mundo.', dica: 'É a ilha vista do navio chegando. Diga o que se vê primeiro de longe (uma torre, uma fumaça, uma árvore enorme).',
    monta: o => `${ART_BASE} A WIDE LANDSCAPE OF AN ISLAND SEEN FROM THE SEA, AS IF FROM THE DECK OF AN ARRIVING SHIP, ${o.var}: ${o.ilha}, ${o.hora}. THE WHOLE ISLAND SILHOUETTE IS VISIBLE WITH ONE HUGE UNIQUE LANDMARK, SEA IN THE FOREGROUND, BIG ANIME CLOUDS IN THE SKY. NO CHARACTERS IN THE FOREGROUND, NO SHIP RAIL COVERING THE VIEW.${ART_PT(o.livre)} ${ART_ESTILO} STRONG SENSE OF DEPTH, LANDSCAPE 16:9, FULL-BLEED (NO BORDER, NO MAGENTA). ${ART_TEXTO}` },
  { id: 'tampo', nome: 'Tampo da mesa de dados', ic: 'mesa:d20', campos: ['tampo', 'livre'], tam: 'paisagem 16:10 (ex.: 1536 × 960)',
    onde: 'Mesa → janela Música → “Mesa dos dados” → Trocar o tampo. Os dados 3D passam a rolar em cima dessa imagem, para todos.', dica: 'O meio tem de ficar limpo: é ali que os dados caem. Enfeite só as bordas.',
    monta: o => `${ART_BASE} A FLAT SURFACE TEXTURE FOR ROLLING DICE, STRICT ORTHOGRAPHIC TOP-DOWN VIEW (STRAIGHT FROM ABOVE, 90 DEGREES, NO PERSPECTIVE, NO HORIZON): ${o.tampo}. THE CENTRAL 70% OF THE IMAGE MUST BE EMPTY AND EVENLY LIT (NO OBJECTS, NO DICE, NO HANDS), BECAUSE 3D DICE WILL BE DRAWN ON TOP OF IT. ONLY SMALL DECORATIONS NEAR THE CORNERS. MEDIUM-DARK OVERALL TONE SO THAT LIGHT-COLORED DICE STAND OUT.${ART_PT(o.livre)} ${ART_ESTILO} LANDSCAPE 16:10, FULL-BLEED (NO BORDER, NO MAGENTA). ${ART_TEXTO}` },
  { id: 'sprite', nome: 'Sprite para enfeitar o site', ic: 'mesa:imagem', campos: ['livre'], tam: 'quadrado 1024 × 1024', obrig: true,
    onde: 'Mande a imagem para o Claude neste chat dizendo onde quer usar: ele recorta, reduz e põe no site.', dica: 'Um objeto só, de frente. Diga para que serve (botão, enfeite de canto, ícone de menu) e a cor principal.',
    monta: o => `${ART_BASE} ONE SINGLE USER-INTERFACE SPRITE FOR A PIRATE-THEMED GAME WEBSITE, CENTERED, FILLING ABOUT 80% OF A SQUARE CANVAS, FRONT VIEW.${ART_PT(o.livre)} ${ART_ESTILO} SAME MATERIALS AS THE REST OF THE SITE: WARM WOOD PLANKS, BRASS RIVETS AND TRIMS, PARCHMENT PAPER, ROPE, DEEP SEA BLUE. ${ART_PALETA} BOLD SILHOUETTE THAT STILL READS AT 48×48 PIXELS. ${ART_FUNDO} ${ART_TEXTO}` },
  { id: 'folha', nome: 'Folha de sprites (vários de uma vez)', ic: 'itens:mochila', campos: ['livre'], tam: 'quadrado 1024 × 1024', obrig: true, linhas: true,
    onde: 'Mande a folha para o Claude neste chat: ele recorta cada casa e põe no site.', dica: 'Escreva um sprite por linha (até 16). Todos saem com o mesmo traço, porque nascem na mesma imagem.',
    monta: o => `${ART_BASE} A SPRITE SHEET OF EXACTLY ${o.folha.n} CELLS IN A ${o.folha.cols}×${o.folha.lin} GRID (${o.folha.cols} COLUMNS, ${o.folha.lin} ROWS), ALL CELLS THE SAME SIZE, ONE OBJECT PER CELL, EACH OBJECT CENTERED IN ITS CELL WITH EMPTY MARGIN AROUND IT AND NOT TOUCHING ANY OTHER CELL. NO GRID LINES, NO FRAMES. THE CELLS, DESCRIBED IN PORTUGUESE BY THE GAME MASTER, FOLLOW THEM EXACTLY AND IN THIS ORDER: ${o.folha.lista || '«…»'} ALL OBJECTS SHARE THE SAME LIGHT DIRECTION (TOP-LEFT), THE SAME OUTLINE THICKNESS AND THE SAME PIXEL SIZE. ${ART_ESTILO} ${ART_PALETA} EVERY OBJECT MUST BE COMPLETE INSIDE ITS OWN CELL (NOTHING CUT BY THE CELL EDGE) AND ALL OBJECTS DRAWN AT A SIMILAR SCALE. ${ART_FUNDO} ${ART_TEXTO}` },
  { id: 'anim', nome: 'Tira de animação (quadros)', ic: 'mesa:d20', campos: ['livre'], tam: 'quadrado 1024 × 1024', obrig: true, linhas: true,
    onde: 'Mande a folha para o Claude neste chat: ele recorta os quadros e monta a animação no site.', dica: 'Uma linha só = o que se mexe (o site pede 6 quadros em sequência). Várias linhas = você descreve cada quadro.',
    monta: o => { const f = o.folha, um = f.n <= 1 || !o.livre.includes('\n'), n = um ? 6 : f.n, cols = um ? 3 : f.cols, lin = um ? 2 : f.lin;
      return `${ART_BASE} AN ANIMATION SPRITE SHEET OF EXACTLY ${n} FRAMES IN A ${cols}×${lin} GRID (${cols} COLUMNS, ${lin} ROWS), READ LEFT TO RIGHT THEN TOP TO BOTTOM, ALL CELLS THE SAME SIZE. IT IS THE SAME SUBJECT IN EVERY FRAME, DRAWN AT THE SAME SIZE AND IN THE SAME POSITION INSIDE ITS CELL (SAME CENTER POINT, SAME GROUND LINE); ONLY THE MOTION CHANGES FROM ONE FRAME TO THE NEXT, IN SMALL EVEN STEPS. ${um ? `THE SUBJECT AND ITS MOTION, DESCRIBED IN PORTUGUESE BY THE GAME MASTER: «${o.livre.replace(/\s+/g, ' ').trim()}». FRAME 1 IS THE START OF THE MOTION, THE MIDDLE FRAMES ARE THE PEAK, AND THE LAST FRAME FLOWS BACK TOWARD FRAME 1 SO IT CAN LOOP (FOR A ONE-SHOT EFFECT LIKE AN EXPLOSION OR A SPLASH, THE LAST FRAME IS ALMOST EMPTY).` : `THE FRAMES, DESCRIBED IN PORTUGUESE BY THE GAME MASTER, IN THIS ORDER: ${f.lista.replace(/CELL/g, 'FRAME')}`} NO GRID LINES, NO FRAMES AROUND THE CELLS, NO MOTION BLUR, NO NUMBERS. ${ART_ESTILO} ${ART_PALETA} ${ART_FUNDO} ${ART_TEXTO}`; } },
  { id: 'textura', nome: 'Textura que repete (chão, mar)', ic: 'mar:ilha', campos: ['livre'], tam: 'quadrado 1024 × 1024', obrig: true,
    onde: 'Mande para o Claude neste chat dizendo onde usar (chão do Mapa de combate, mar da Batalha naval, fundo de janela).', dica: 'Diga só o material (pedra, grama, tábua, mar raso). Nada de objetos: a textura se repete lado a lado.',
    monta: o => `${ART_BASE} ONE SEAMLESS TILEABLE TEXTURE, STRICT TOP-DOWN VIEW (STRAIGHT FROM ABOVE, NO PERSPECTIVE): «${o.livre.replace(/\s+/g, ' ').trim()}». THE LEFT EDGE MUST MATCH THE RIGHT EDGE AND THE TOP EDGE MUST MATCH THE BOTTOM EDGE, SO THE IMAGE CAN BE REPEATED SIDE BY SIDE WITH NO VISIBLE SEAM. EVEN FLAT LIGHTING, NO VIGNETTE, NO BORDER, NO FRAME, NO SINGLE EYE-CATCHING OBJECT, NO SHADOWS OF THINGS OUTSIDE THE IMAGE. SMALL DETAILS SPREAD EVENLY OVER THE WHOLE SURFACE. LOW CONTRAST SO GAME PIECES AND GRID LINES STAY READABLE ON TOP OF IT. ${ART_ESTILO} ${ART_PALETA} FULL-BLEED (NO MAGENTA). ${ART_TEXTO}` }
);

/* ── 1) puxar do site ── */
const ART_PUXA = { npc: 'gente', cartaz: 'gente', token: 'gente', ilha: 'ilha', paisagem: 'ilha' };
const artCorta = (t, n) => { t = String(t || '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n).replace(/\s\S*$/, '') + '…' : t; };
function artFontes(tipo) {
  const s = S(), mundo = M.mundo || {}, g = [];
  if (tipo === 'ilha') { g.push(['Ilhas do Mundo', (mundo.ilhas || []).map(i => ({ k: 'ilha:' + i.id, n: i.nome }))]); return g.filter(x => x[1].length); }
  const naLuta = [...new Set((s.combate.lista || []).filter(c => c.monId).map(c => c.monId))].map(id => monPorId(id)).filter(Boolean);
  if (naLuta.length) g.push(['Inimigos da luta atual', naLuta.map(m => ({ k: 'mon:' + m.id, n: m.nome }))]);
  g.push(['Fichas do mestre', pdms(s).map(p => ({ k: 'pdm:' + p.id, n: nomePC(p) }))]);
  g.push(['NPCs do Mundo', (mundo.npcs || []).map(n => ({ k: 'npc:' + n.id, n: n.nome }))]);
  const cats = {}; MON().forEach(m => { (cats[m.cat] = cats[m.cat] || []).push({ k: 'mon:' + m.id, n: m.nome }); });
  Object.entries(cats).forEach(([c, l]) => g.push(['Manual dos Inimigos: ' + c, l]));
  return g.filter(x => x[1].length);
}
function artPuxarHTML(T) {
  const g = artFontes(ART_PUXA[T.id]); if (!g.length) return '';
  return `<label class="campo art-puxar"><span>${ic('modos:regras', 32)} Puxar do site <small>(preenche os detalhes sozinho)</small></span><select data-chg="art-puxar"><option value="">— escolher —</option>${g.map(([n, l]) => `<optgroup label="${esc(n)}">${l.map(x => `<option value="${esc(x.k)}" ${Art.puxado === x.k ? 'selected' : ''}>${esc(x.n)}</option>`).join('')}</optgroup>`).join('')}</select></label>`;
}
/* o que a ficha diz, em português curto. Devolve { livre, papel?, especie?, ilha? } */
function artDados(k) {
  const [tipo, id] = String(k).split(':'), s = S(), mundo = M.mundo || {};
  if (tipo === 'mon') {
    const m = monPorId(id); if (!m) return null;
    const tr = n => ((m.texto || []).find(t => t.nome === n) || {}).texto || '', armas = [...new Set((m.ataques || []).map(a => a.nome))].slice(0, 4).join(', ');
    const papel = { Marinha: /almirante|capit|comodoro|tenente|major|oficial/i.test(m.nome) ? 'Oficial da Marinha' : 'Marinheiro da Marinha', Piratas: /capit|imperador|infame/i.test(m.nome) ? 'Capitão pirata' : 'Pirata', 'Cipher Pol': 'Agente do Governo', Pacifistas: 'Criatura' }[m.cat] || 'Criatura';
    return { papel, especie: m.cat === 'Pacifistas' ? 'Ciborgue' : /Animais/.test(m.cat) ? 'Animal ou criatura' : 'Humano', livre: [`${m.nome}${/Animais/.test(m.cat) ? ' (animal do mundo de One Piece, não é gente)' : ''}`, tr('Tamanho') && 'tamanho ' + tr('Tamanho').replace(/\.$/, ''), armas && 'usa ' + armas, artCorta(m.lore, 260)].filter(Boolean).join('; ') };
  }
  if (tipo === 'pdm') {
    const p = s.party.find(x => x.id === id); if (!p) return null; const sh = p.sheet || {};
    const armas = (sh.armas || []).map(a => a.nome).filter(Boolean).slice(0, 3).join(', ');
    return { livre: [nomePC(p), sh.especie, sh.estilo || sh.classe, sh.profissao, armas && 'usa ' + armas, artCorta(sh.aparencia || sh.descricao || p.nota || '', 260)].filter(Boolean).join('; ') };
  }
  if (tipo === 'npc') {
    const n = (mundo.npcs || []).find(x => x.id === id); if (!n) return null; const ilha = (mundo.ilhas || []).find(i => i.id === n.ilha);
    return { papel: n.tipo === 'criatura' ? 'Criatura' : undefined, livre: [n.nome, n.papel, ilha && 'vive em ' + ilha.nome, artCorta(n.descricao, 260)].filter(Boolean).join('; ') };
  }
  if (tipo === 'ilha') {
    const i = (mundo.ilhas || []).find(x => x.id === id); if (!i) return null;
    return { livre: [i.nome, i.mar, i.clima, artCorta(i.descricao || i.nota || '', 300)].filter(Boolean).join('; ') };
  }
  return null;
}
ACT['art-puxar'] = el => {
  Art.puxado = el.value; const d = el.value && artDados(el.value); if (!d) return App.render();
  Art.o.livre = d.livre; if (d.papel) Art.o.papel = d.papel; if (d.especie) Art.o.especie = d.especie;
  App.render(); toast('Preenchi com o que a ficha diz. Mude o que quiser.', { tipo: 'bom' });
};

/* ── 2) lote ── */
function artLote(qual) {
  const guarda = { tipo: Art.tipo, o: Art.o, v: Art.v }, s = S(), out = [];
  const um = (k, tipo) => { const d = artDados(k); if (!d) return; Art.tipo = tipo; Art.o = { ...d }; Art.v = out.length; out.push({ n: d.livre.split(';')[0], p: artPrompt() }); };
  if (qual === 'luta') [...new Set((s.combate.lista || []).filter(c => c.monId).map(c => c.monId))].forEach(id => um('mon:' + id, 'token'));
  if (qual === 'npcs') ((M.mundo || {}).npcs || []).forEach(n => um('npc:' + n.id, 'npc'));
  if (qual === 'ilhas') ((M.mundo || {}).ilhas || []).forEach(i => um('ilha:' + i.id, 'paisagem'));
  Object.assign(Art, guarda); return out;
}
function artLoteHTML() {
  const s = S(), nL = new Set((s.combate.lista || []).filter(c => c.monId).map(c => c.monId)).size, nN = ((M.mundo || {}).npcs || []).length, nI = ((M.mundo || {}).ilhas || []).length, L = Art.lote;
  return `<section class="pap art-lote"><h2>Lote: vários prompts de uma vez</h2>
    <div class="linha-bts"><button class="bt" data-act="art-lote" data-q="luta" ${nL ? '' : 'disabled'}>Fichas dos inimigos da luta (${nL})</button><button class="bt" data-act="art-lote" data-q="npcs" ${nN ? '' : 'disabled'}>Retratos dos NPCs do Mundo (${nN})</button><button class="bt" data-act="art-lote" data-q="ilhas" ${nI ? '' : 'disabled'}>Paisagens das ilhas (${nI})</button></div>
    ${L && L.length ? `<p class="nota">Cole <b>um por vez</b> no mesmo chat do ChatGPT. Assim o traço fica igual em todos.</p><ol class="art-lote-l">${L.map((x, i) => `<li><div class="art-lote-c"><b>${esc(x.n)}</b><button class="bt fino" data-act="copiar" data-alvo="art-l-${i}">Copiar</button></div><textarea id="art-l-${i}" rows="3" readonly>${esc(x.p)}</textarea></li>`).join('')}</ol><button class="link" data-act="art-lote-fim">fechar o lote</button>`
      : '<p class="nota">O site lê as fichas e escreve um prompt para cada um. Você só cola.</p>'}</section>`;
}
ACT['art-lote'] = el => { Art.lote = artLote(el.dataset.q); if (!Art.lote.length) toast('Não achei nada para esse lote.'); App.render(); };
ACT['art-lote-fim'] = () => { Art.lote = null; App.render(); };
