/* ═══════════ ATELIÊ: prompts de arte prontos para o ChatGPT (só o mestre) ═══════════
   O site monta o prompt no estilo da mesa (pixel art pirata, mesma paleta das outras folhas). Você escolhe o tipo,
   marca as opções, escreve o que quiser em português e copia. O ChatGPT só desenha: texto, regra e código não saem dele.
   Não pede cópia de personagem da obra: o prompt sempre pede desenho original no clima do mundo de One Piece. */
const ART_BASE = 'FAN ART ASSET FOR A PRIVATE, NON-COMMERCIAL ONE PIECE TABLETOP RPG WEBSITE, SET IN THE WORLD OF ONE PIECE (GRAND LINE, NEW WORLD, PIRATES, THE MARINES, AKUMA NO MI).';
const ART_ESTILO = 'PIXEL ART WITH THE COLORFUL, CHEERFUL LOOK OF 2D ONE PIECE VIDEO GAMES (GBA/DS ERA AND KAIROSOFT-LIKE SIMULATION GAMES): BRIGHT SATURATED ANIME COLORS, BOLD ROUNDED CARTOON SHAPES, PLAYFUL EXAGGERATED PROPORTIONS, CHUNKY CLEARLY VISIBLE PIXELS, CLEAN DARK BROWN OUTLINE, NO ANTI-ALIASING, NO SMOOTH GRADIENTS, NO BLUR. LIGHT FROM THE TOP-LEFT. PALETTE: SUNNY OCEAN BLUES AND TEALS, STRAW YELLOW, BRASS GOLD, WARM WOOD BROWNS, PARCHMENT CREAM, PIRATE RED.';
const ART_FUNDO = 'FLAT SOLID PURE MAGENTA BACKGROUND (#FF00FF) BEHIND EVERYTHING, NO SHADOW OR TEXTURE ON THE BACKGROUND, AND NEVER USE MAGENTA, PINK OR PURPLE INSIDE THE DRAWING.';
const ART_TEXTO = 'NO TEXT, LETTERS OR NUMBERS ANYWHERE. NO WATERMARK, NO SIGNATURE.';
const ART_ORIG = 'ORIGINAL DESIGN THAT FEELS LIKE IT BELONGS IN THE WORLD OF ONE PIECE (BIG EXPRESSIVE FACE, STRONG UNIQUE SILHOUETTE, ONE MEMORABLE VISUAL GIMMICK). DO NOT COPY OR RESEMBLE ANY EXISTING CHARACTER, CREW, FLAG OR LOGO FROM THE MANGA OR ANIME.';
const ART_PT = t => t ? ` EXTRA DETAILS WRITTEN IN PORTUGUESE BY THE GAME MASTER, FOLLOW THEM EXACTLY: «${t.replace(/\s+/g, ' ').trim()}».` : '';
/* opções: [rótulo em português, trecho em inglês] */
const ART_PAPEL = [['Pirata', 'A PIRATE'], ['Capitão pirata', 'A PIRATE CAPTAIN WITH A LONG COAT'], ['Marinheiro da Marinha', 'A MARINE SOLDIER IN WHITE AND BLUE UNIFORM WITH A CAP'], ['Oficial da Marinha', 'A MARINE OFFICER WITH A WHITE JUSTICE COAT OVER THE SHOULDERS'],
  ['Agente do Governo', 'A WORLD GOVERNMENT AGENT IN A BLACK SUIT'], ['Revolucionário', 'A REVOLUTIONARY ARMY FIGHTER WITH A TRAVEL CLOAK AND GOGGLES'], ['Caçador de recompensas', 'A BOUNTY HUNTER'], ['Nobre', 'A RICH NOBLE'], ['Comerciante', 'A MERCHANT'],
  ['Taverneiro(a)', 'A TAVERN KEEPER'], ['Pescador', 'A FISHERMAN'], ['Médico(a)', 'A SHIP DOCTOR'], ['Carpinteiro', 'A SHIPWRIGHT'], ['Samurai', 'A SAMURAI'], ['Lutador de Rokushiki', 'A MARTIAL ARTIST TRAINED IN GOVERNMENT COMBAT ARTS'], ['Criança', 'A CHILD'], ['Criatura', 'A CREATURE']];
const ART_ESPECIE = [['Humano', 'HUMAN'], ['Homem-peixe', 'FISH-MAN (SHARK, RAY OR OCTOPUS FEATURES)'], ['Sereia/Tritão', 'MERFOLK'], ['Mink', 'MINK (FURRY ANIMAL PERSON)'], ['Gigante', 'GIANT'], ['Anão (Tontatta)', 'TINY DWARF WITH A FLUFFY TAIL'],
  ['Braços longos', 'LONG-ARM TRIBE (TWO ELBOWS)'], ['Pernas longas', 'LONG-LEG TRIBE'], ['Pescoço de cobra', 'SNAKENECK TRIBE'], ['Lunariano', 'LUNARIAN (DARK SKIN, WHITE HAIR, BLACK WINGS, A FLAME ON THE BACK)'], ['Oni', 'ONI WITH HORNS'], ['Ciborgue', 'CYBORG']];
const ART_IDADE = [['Jovem', 'YOUNG'], ['Adulto', 'ADULT'], ['Meia-idade', 'MIDDLE-AGED'], ['Velho', 'VERY OLD, WRINKLED, WHITE HAIR']];
const ART_HUMOR = [['Sorriso largo', 'HUGE CONFIDENT GRIN'], ['Sério', 'SERIOUS STERN LOOK'], ['Ameaçador', 'MENACING SHADOWED EYES'], ['Cansado', 'TIRED, CALM, HALF-CLOSED EYES'], ['Gentil', 'KIND WARM SMILE'], ['Arrogante', 'ARROGANT SMIRK, CHIN UP'], ['Assustado', 'NERVOUS, SWEATING']];
const ART_ILHA = [['Vila de pescadores', 'A FISHING VILLAGE WITH A WOODEN PIER'], ['Cidade portuária', 'A BUSY PORT TOWN'], ['Inverno', 'A SNOWY WINTER ISLAND WITH DRUM-SHAPED MOUNTAINS'], ['Deserto', 'A DESERT ISLAND WITH SANDSTONE TOWERS'], ['Vulcão', 'A VOLCANIC ISLAND WITH LAVA RIVERS'],
  ['Selva', 'A JUNGLE ISLAND WITH GIANT TREES'], ['Ilha do céu', 'A SKY ISLAND MADE OF WHITE CLOUDS'], ['Base da Marinha', 'A MARINE FORTRESS ISLAND WITH WHITE WALLS'], ['Ruínas antigas', 'ANCIENT STONE RUINS COVERED IN VINES'], ['Ilha de doces', 'A CANDY AND CAKE ISLAND'],
  ['Assombrada', 'A FOGGY HAUNTED ISLAND WITH A CROOKED CASTLE'], ['Mina', 'A MINING ISLAND WITH CRANES AND RAILS'], ['Reino (castelo)', 'A KINGDOM ISLAND WITH A BIG CASTLE'], ['Feudal (estilo Wano)', 'A FEUDAL JAPAN STYLE ISLAND WITH PAGODAS AND CHERRY TREES']];
const ART_HORA = [['Dia de sol', 'BRIGHT SUNNY DAY'], ['Pôr do sol', 'ORANGE SUNSET'], ['Noite de lua', 'MOONLIT NIGHT WITH LANTERNS'], ['Tempestade', 'DARK STORM WITH RAIN AND LIGHTNING'], ['Neblina', 'THICK MORNING FOG'], ['Neve', 'SNOWFALL']];
const ART_LUGAR = [['Convés de navio', 'THE DECK OF A WOODEN PIRATE SHIP'], ['Cais e docas', 'A HARBOR DOCK WITH CRATES AND BARRELS'], ['Taverna', 'THE INSIDE OF A LIVELY PIRATE TAVERN'], ['Rua de cidade', 'A TOWN STREET WITH SHOPS'], ['Praça', 'A TOWN SQUARE WITH A FOUNTAIN'],
  ['Praia', 'A BEACH WITH PALM TREES'], ['Selva', 'A JUNGLE CLEARING'], ['Caverna', 'A CAVE WITH TREASURE AND TORCHES'], ['Fortaleza da Marinha', 'A MARINE BASE COURTYARD'], ['Palácio', 'A PALACE HALL WITH RED CARPET'], ['Mina', 'A MINE TUNNEL WITH RAILS'], ['Prisão', 'A STONE PRISON CORRIDOR'], ['Mar aberto', 'THE OPEN SEA']];
const ART_NAVIO = [['Pirata', 'A PIRATE SHIP WITH DARK SAILS (NO SKULL COPIED FROM ANY EXISTING CREW)'], ['Marinha', 'A MARINE WARSHIP WITH WHITE AND BLUE SAILS'], ['Mercante', 'A MERCHANT CARGO SHIP WITH PLAIN CREAM SAILS'], ['Do bando', 'THE PLAYERS\' OWN PIRATE SHIP WITH A UNIQUE FIGUREHEAD'], ['Barco pequeno', 'A SMALL ONE-MAST BOAT'], ['Navio-fantasma', 'A ROTTEN GHOST SHIP WITH TORN SAILS']];
const ART_VAR = { npc: ['THREE-QUARTER VIEW FACING RIGHT', 'FACING THE VIEWER, HEAD SLIGHTLY TILTED', 'THREE-QUARTER VIEW FACING LEFT, LOOKING OVER THE SHOULDER', 'SLIGHT LOW ANGLE, CHIN UP'],
  cena: ['WIDE ESTABLISHING SHOT', 'LOW ANGLE SHOT LOOKING UP', 'HIGH ANGLE SHOT LOOKING DOWN', 'CLOSE SHOT WITH STRONG FOREGROUND OBJECTS FRAMING THE SCENE'],
  ilha: ['SEEN FROM THE SOUTH-WEST', 'SEEN FROM THE SOUTH-EAST', 'SEEN FROM STRAIGHT SOUTH, VERY SYMMETRIC', 'SEEN FROM THE SOUTH WITH A SMALL EXTRA ISLET NEXT TO IT'],
  mapa: ['MAIN ENTRANCE ON THE SOUTH EDGE', 'MAIN ENTRANCE ON THE WEST EDGE', 'TWO ENTRANCES ON OPPOSITE EDGES', 'ONE CHOKE POINT IN THE MIDDLE'] };
/* cada tipo: campos que aparecem, como monta, e o que fazer depois */
const ART_TIPOS = [
  { id: 'npc', nome: 'Retrato de NPC ou PdN', ic: 'mesa:npc', campos: ['papel', 'especie', 'idade', 'humor', 'livre'], tam: 'quadrado 1024 × 1024',
    onde: 'Fichas do mestre → Trocar retrato → Enviar sua imagem. Ou Mundo → NPC.', dica: 'Escreva 2 ou 3 marcas visuais (cicatriz, chapéu, cachimbo). É o que faz o personagem ser lembrado.',
    monta: o => `${ART_BASE} ONE CHARACTER PORTRAIT ICON, HEAD AND SHOULDERS BUST, CENTERED, FILLING ABOUT 80% OF A SQUARE CANVAS. THE CHARACTER IS: ${o.idade} ${o.especie} ${o.papel.replace(/^AN? /, '')}, ${o.humor}, ${o.var}.${ART_PT(o.livre)} ${ART_ORIG} ${ART_ESTILO} BOLD SILHOUETTE THAT STILL READS AT 64×64 PIXELS. ${ART_FUNDO} ${ART_TEXTO}` },
  { id: 'cartaz', nome: 'Foto do cartaz de procurado', ic: 'modos:cartaz', campos: ['papel', 'especie', 'idade', 'humor', 'livre'], tam: 'retrato 3:4 (ex.: 768 × 1024)',
    onde: 'Recompensas → cartaz do personagem (a foto). O nome e o valor o site escreve por cima.', dica: 'Peça uma pose "pega de surpresa": cartaz de procurado é foto tirada sem a pessoa querer.',
    monta: o => `${ART_BASE} A CANDID PHOTO FOR A WANTED POSTER (ONLY THE PHOTO AREA, NOT THE POSTER FRAME): ${o.idade} ${o.especie} ${o.papel.replace(/^AN? /, '')}, ${o.humor}, CAUGHT MID-ACTION AS IF PHOTOGRAPHED BY SURPRISE, ${o.var}, WAIST-UP, SIMPLE BACKGROUND OF A PLACE (SKY, DECK OR STREET).${ART_PT(o.livre)} ${ART_ORIG} ${ART_ESTILO} SLIGHTLY FADED SEPIA-TINTED COLORS LIKE A PRINTED PHOTO. PORTRAIT 3:4. ${ART_TEXTO}` },
  { id: 'ilha', nome: 'Ilha (ícone do mapa)', ic: 'mar:ilha', campos: ['ilha', 'hora', 'livre'], tam: 'quadrado 1024 × 1024',
    onde: 'Mundo → ilha → imagem. Ou Mesa → Painel do mestre → Enviar imagens.', dica: 'Uma ilha boa tem UM elemento gigante que dá para reconhecer de longe (uma árvore, uma torre, um osso).',
    monta: o => `${ART_BASE} ONE ISLAND ICON SEEN FROM A HIGH 3/4 TOP-DOWN ANGLE, ${o.var}: ${o.ilha}, ${o.hora}, WITH ONE HUGE UNIQUE LANDMARK THAT MAKES IT RECOGNIZABLE, SITTING ON ITS OWN SMALL ROUND PATCH OF BLUE SEA WITH A THIN WHITE FOAM RING.${ART_PT(o.livre)} ${ART_ESTILO} CENTERED, FILLING ABOUT 85% OF A SQUARE CANVAS. ${ART_FUNDO} ${ART_TEXTO}` },
  { id: 'cena', nome: 'Cena para o Quadro da mesa', ic: 'modos:quadro', campos: ['lugar', 'hora', 'livre'], tam: 'paisagem 16:9 (ex.: 1536 × 864)',
    onde: 'Mesa → Painel do mestre → Enviar imagens → mostrar no Quadro.', dica: 'É a "tela compartilhada" da mesa. Sem personagens dos jogadores: só o lugar e o clima.',
    monta: o => `${ART_BASE} A SCENE ILLUSTRATION, ${o.var}: ${o.lugar}, ${o.hora}. NO MAIN CHARACTERS IN THE FOREGROUND (ONLY TINY BACKGROUND FIGURES IF ANY), SO THE GAME MASTER CAN DESCRIBE THE ACTION.${ART_PT(o.livre)} ${ART_ESTILO} RICH BACKGROUND DETAIL, STRONG SENSE OF DEPTH, LANDSCAPE 16:9, FULL-BLEED (NO BORDER, NO MAGENTA). ${ART_TEXTO}` },
  { id: 'mapa', nome: 'Mapa de combate (visto de cima)', ic: 'itensop:mapa_tesouro', campos: ['lugar', 'hora', 'grade', 'livre'], tam: 'do tamanho da grade (ex.: 24 × 16 quadrados = 1536 × 1024)',
    onde: 'Mapa de combate → Fundo do mapa → Enviar imagem. Depois ajuste "quadrados de largura" para bater com o desenho.', dica: 'Sem grade desenhada: o site põe a grade por cima. Cada quadrado vale 1,5 m (LJ p. 287).',
    monta: o => `${ART_BASE} A TACTICAL BATTLE MAP FOR TABLETOP RPG, STRICT ORTHOGRAPHIC TOP-DOWN VIEW (STRAIGHT FROM ABOVE, 90 DEGREES, NO PERSPECTIVE, NO HORIZON): ${o.lugar}, ${o.hora}, ${o.var}. THE MAP REPRESENTS AN AREA OF ${o.gw} BY ${o.gh} SQUARES WHERE EACH SQUARE IS 1.5 METERS, SO KEEP FURNITURE, DOORS (ONE SQUARE WIDE) AND PATHS TO THAT SCALE. INCLUDE COVER OBJECTS (CRATES, BARRELS, PILLARS, LOW WALLS) AND SOME DIFFICULT TERRAIN, BUT KEEP WIDE OPEN LANES FOR MOVEMENT. DO NOT DRAW ANY GRID LINES. NO CHARACTERS, NO TOKENS.${ART_PT(o.livre)} ${ART_ESTILO} ASPECT RATIO ${o.gw}:${o.gh}, FULL-BLEED (NO BORDER, NO MAGENTA). ${ART_TEXTO}` },
  { id: 'token', nome: 'Ficha redonda para o mapa (token)', ic: 'status:turno', campos: ['papel', 'especie', 'livre'], tam: 'quadrado 1024 × 1024',
    onde: 'Use como retrato do inimigo ou do PdN: ele aparece redondo no Mapa de combate.', dica: 'Visto de cima fica melhor no mapa; mas o retrato de busto também funciona.',
    monta: o => `${ART_BASE} ONE ROUND GAME TOKEN, STRICT TOP-DOWN VIEW FROM DIRECTLY ABOVE: ${o.especie} ${o.papel.replace(/^AN? /, '')} SEEN FROM ABOVE (HEAD, SHOULDERS, HAT AND WEAPON VISIBLE), FACING UP (NORTH), INSIDE A THICK BRASS RING BORDER.${ART_PT(o.livre)} ${ART_ORIG} ${ART_ESTILO} CENTERED, FILLING ABOUT 90% OF A SQUARE CANVAS. ${ART_FUNDO} ${ART_TEXTO}` },
  { id: 'navio', nome: 'Navio visto de cima (batalha naval)', ic: 'mar:navio_pirata', campos: ['navio', 'livre'], tam: 'quadrado 1024 × 1024 (folha 2 × 2)',
    onde: 'Mande a imagem para o Claude neste chat: ele recorta as 4 partes e põe na Batalha naval.', dica: 'São 4 estados do mesmo navio. A proa sempre para cima.',
    monta: o => `${ART_BASE} A SPRITE SHEET OF EXACTLY 4 CELLS IN A 2×2 GRID, EACH CELL THE SAME SHIP SEEN FROM STRICT TOP-DOWN VIEW (DIRECTLY ABOVE), BOW POINTING UP: ${o.navio}. CELL 1 (TOP-LEFT): INTACT. CELL 2 (TOP-RIGHT): DAMAGED, HOLES IN THE DECK AND TORN SAILS, A LITTLE SMOKE. CELL 3 (BOTTOM-LEFT): MAIN MAST BROKEN AND FALLEN ACROSS THE DECK. CELL 4 (BOTTOM-RIGHT): SINKING, HALF UNDER WATER, WITH FOAM AND DEBRIS. SAME SIZE AND POSITION IN EVERY CELL, EACH SHIP FULLY INSIDE ITS CELL WITH A CLEAR MARGIN.${ART_PT(o.livre)} ${ART_ESTILO} ${ART_FUNDO} ${ART_TEXTO}` },
  { id: 'item', nome: 'Ícone de item ou Akuma no Mi', ic: 'itensop:akuma_no_mi', campos: ['livre'], tam: 'quadrado 1024 × 1024', obrig: true,
    onde: 'Arquivos → Ícones. Ou mande para o Claude se for uma folha com vários.', dica: 'Akuma no Mi: fruta com espirais na casca. Diga a forma e a cor (ex.: "abacaxi roxo-escuro com espirais").',
    monta: o => `${ART_BASE} ONE SINGLE ITEM ICON, CENTERED, FILLING ABOUT 80% OF A SQUARE CANVAS.${ART_PT(o.livre)} IF IT IS A DEVIL FRUIT, COVER ITS SKIN WITH SWIRL PATTERNS AND GIVE IT A CURLY STEM. ${ART_ESTILO} BOLD SILHOUETTE THAT STILL READS AT 32×32 PIXELS. ${ART_FUNDO.replace('MAGENTA, PINK OR PURPLE', 'PURE MAGENTA')} ${ART_TEXTO}` },
  { id: 'bandeira', nome: 'Jolly Roger (bandeira do bando)', ic: 'trip:nakama', campos: ['livre'], tam: 'quadrado 1024 × 1024', obrig: true,
    onde: 'Tripulação → Enviar Jolly Roger.', dica: 'Diga o que troca os ossos cruzados (espadas, remos, garfos) e o que a caveira usa (chapéu, bandana, tapa-olho).',
    monta: o => `${ART_BASE} ONE ORIGINAL PIRATE FLAG EMBLEM (JOLLY ROGER): A CARTOON SKULL WITH A UNIQUE GIMMICK AND TWO CROSSED OBJECTS BEHIND IT, WHITE ON A BLACK FLAG FIELD, FLAT AND FRONT-FACING LIKE A LOGO.${ART_PT(o.livre)} IT MUST NOT COPY OR RESEMBLE THE FLAG OF ANY EXISTING CREW FROM THE MANGA OR ANIME. ${ART_ESTILO} CENTERED IN A SQUARE CANVAS. ${ART_TEXTO}` },
  { id: 'jornal', nome: 'Foto de manchete do jornal', ic: 'modos:newscoo', campos: ['lugar', 'livre'], tam: 'paisagem 3:2 (ex.: 1536 × 1024)', obrig: true,
    onde: 'Jornal → Enviar imagem nova.', dica: 'Escreva o acontecimento em uma frase. A manchete em si você escreve no site.',
    monta: o => `${ART_BASE} A NEWSPAPER FRONT-PAGE PHOTO (ONLY THE PHOTO, NO NEWSPAPER LAYOUT), SHOT LIKE A PRESS PHOTOGRAPH TAKEN FROM A DISTANCE: THE PLACE IS ${o.lugar}.${ART_PT(o.livre)} ${ART_ORIG} ${ART_ESTILO} SLIGHTLY DESATURATED SEPIA NEWSPRINT TONE, LANDSCAPE 3:2, FULL-BLEED. ${ART_TEXTO}` }
];
const Art = { tipo: 'npc', v: 0, o: {}, gw: 24, gh: 16 };
const artSalvos = () => { try { return JSON.parse(lembrar('art-salvos') || '[]'); } catch (e) { return []; } };
function artPrompt() {
  const T = ART_TIPOS.find(t => t.id === Art.tipo) || ART_TIPOS[0], o = Art.o, pega = (lista, k) => (lista.find(x => x[0] === o[k]) || lista[0])[1];
  const vars = ART_VAR[{ npc: 'npc', cartaz: 'npc', token: 'npc', cena: 'cena', jornal: 'cena', paisagem: 'cena', ilha: 'ilha', mapa: 'mapa' }[T.id]] || [''];
  return T.monta({ papel: pega(ART_PAPEL, 'papel'), especie: pega(ART_ESPECIE, 'especie'), idade: pega(ART_IDADE, 'idade'), humor: pega(ART_HUMOR, 'humor'), ilha: pega(ART_ILHA, 'ilha'), hora: pega(ART_HORA, 'hora'),
    lugar: pega(ART_LUGAR, 'lugar'), navio: pega(ART_NAVIO, 'navio'), tampo: pega(ART_TAMPO, 'tampo'), folha: artFolha(o.livre), livre: (o.livre || '').trim(), var: vars[Art.v % vars.length], gw: Art.gw, gh: Art.gh }).replace(/\s{2,}/g, ' ').replace(/ ,/g, ',');
}
VIEWS.atelie = {
  titulo: 'Ateliê de arte', icone: 'mesa:imagem',
  render() {
    const T = ART_TIPOS.find(t => t.id === Art.tipo) || ART_TIPOS[0], o = Art.o, salvos = artSalvos();
    const sel = (k, rot, lista) => `<label class="campo"><span>${rot}</span><select data-chg="art-op" data-k="${k}">${lista.map(([n]) => `<option ${o[k] === n ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></label>`;
    const campo = { papel: () => sel('papel', 'Quem é', ART_PAPEL), especie: () => sel('especie', 'Espécie', ART_ESPECIE), idade: () => sel('idade', 'Idade', ART_IDADE), humor: () => sel('humor', 'Jeito', ART_HUMOR),
      ilha: () => sel('ilha', 'Tipo de ilha', ART_ILHA), hora: () => sel('hora', 'Hora e clima', ART_HORA), lugar: () => sel('lugar', 'Lugar', ART_LUGAR), navio: () => sel('navio', 'Navio', ART_NAVIO), tampo: () => sel('tampo', 'Que mesa é', ART_TAMPO), puxar: () => artPuxarHTML(T),
      grade: () => `<label class="campo"><span>Tamanho em quadrados (1 quadrado = 1,5 m)</span><span class="linha-bts"><input type="number" min="8" max="60" value="${Art.gw}" data-chg="art-g" data-k="gw" aria-label="Largura"> × <input type="number" min="6" max="60" value="${Art.gh}" data-chg="art-g" data-k="gh" aria-label="Altura"> <small>= ${String(Art.gw * 1.5).replace('.', ',')} m × ${String(Art.gh * 1.5).replace('.', ',')} m</small></span></label>`,
      livre: () => `<label class="campo art-livre"><span>${T.obrig ? 'Descreva o que é (em português mesmo)' : 'Detalhes seus, em português (opcional)'}</span><textarea rows="${T.linhas ? 7 : 3}" data-chg="art-op" data-k="livre" placeholder="${T.linhas ? 'Um sprite por linha. Ex.:&#10;baú de tesouro fechado&#10;baú de tesouro aberto, moedas brilhando&#10;garrafa de rum' : T.id === 'npc' ? 'Ex.: velho magro, bigode branco comprido, cachimbo, casaco gasto' : T.id === 'mapa' ? 'Ex.: dois navios lado a lado com pranchas entre eles' : 'Ex.: o que não pode faltar no desenho'}">${esc(o.livre || '')}</textarea></label>` };
    const p = artPrompt();
    return `<div class="art"><header class="esc-topo"><h1>${ic('mesa:imagem', 64)}Ateliê de arte</h1><p class="nota art-sub">Monte o pedido, copie e cole no ChatGPT. O estilo do site já vai junto.</p></header>
      <div class="art-tipos" role="tablist" aria-label="Tipo de arte">${ART_TIPOS.map(t => `<button class="chip ${t.id === T.id ? 'on' : ''}" data-act="art-tipo" data-id="${t.id}">${ic(t.ic, 32)} ${esc(t.nome)}</button>`).join('')}</div>
      <div class="art-corpo">
        <section class="pap art-form"><h2>${esc(T.nome)}</h2>${ART_PUXA[T.id] ? campo.puxar() : ''}<div class="form-grade">${T.campos.map(c => campo[c]()).join('')}</div>
          <p class="destaque">${ic('modos:anotar', 32)} ${esc(T.dica)}</p>
          <ul class="art-como"><li><b>Tamanho para pedir:</b> ${esc(T.tam)}.</li><li><b>Onde pôr no site:</b> ${esc(T.onde)}</li>
            <li><b>Se vier errado</b>, peça de novo no mesmo chat citando só o defeito: "tem letra desenhada", "tem rosa dentro do desenho", "ficou parecido com um personagem que existe, mude o rosto e a roupa".</li></ul></section>
        <section class="pap art-saida"><h2>Prompt pronto</h2>
          <textarea id="art-txt" rows="14" readonly>${esc(p)}</textarea>
          <div class="linha-bts"><button class="bt bom grande" data-act="copiar" data-alvo="art-txt">Copiar</button><button class="bt" data-act="art-variar" title="Troca o ângulo ou a composição">Variar</button>
            <button class="bt fino" data-act="art-salvar">Guardar este</button></div>
          <p class="nota">O prompt vai em inglês e em maiúsculas porque o gerador obedece melhor assim. O que você escreveu em português vai junto, do jeito que escreveu.</p></section>
      </div>
      ${artLoteHTML()}
      ${salvos.length ? `<section class="pap"><h2>Guardados neste aparelho</h2><ul class="art-salvos">${salvos.map((s, i) => `<li><b>${esc(s.n)}</b> <small>${esc(s.t)}</small> <button class="link" data-act="art-abrir" data-i="${i}">abrir</button> <button class="link" data-act="art-tirar" data-i="${i}">tirar</button></li>`).join('')}</ul></section>` : ''}
      <details class="pap"><summary>Regras de arte desta mesa (leia uma vez)</summary><ul>
        <li><b>Pode:</b> o clima e as referências do mundo (mar, piratas, Marinha, cartazes, Akuma no Mi com espirais, Log Pose, Den Den Mushi).</li>
        <li><b>Não pode:</b> copiar personagem, bandeira ou cena da obra. O prompt já pede desenho original; se sair parecido com alguém, peça para mudar.</li>
        <li><b>Fundo rosa (#FF00FF)</b> nos ícones, retratos e navios: é o que permite recortar o fundo. Cena e mapa não têm fundo rosa.</li>
        <li><b>Sem texto na imagem:</b> nome, valor da recompensa e manchete o site escreve por cima.</li>
        <li><b>Mesmo chat:</b> use sempre a mesma conversa do ChatGPT para as artes. Ele mantém o traço entre uma imagem e outra.</li></ul></details></div>`;
  }
};
ACT['art-tipo'] = el => { Art.tipo = el.dataset.id; Art.v = 0; Art.puxado = ''; App.render(); };
ACT['art-op'] = el => { Art.o[el.dataset.k] = el.value; if (el.tagName === 'SELECT') App.render(); else { const t = $('#art-txt'); if (t) t.value = artPrompt(); } };
ACT['art-g'] = el => { Art[el.dataset.k] = clamp(num(el.value) || 12, 6, 60); App.render(); };
ACT['art-variar'] = () => { Art.v++; App.render(); toast('Mudei o ângulo ou a composição.'); };
ACT['art-salvar'] = () => { const T = ART_TIPOS.find(t => t.id === Art.tipo), n = (Art.o.livre || '').trim().slice(0, 40) || T.nome; const l = artSalvos(); l.unshift({ n, t: T.nome, tipo: Art.tipo, o: { ...Art.o }, v: Art.v, gw: Art.gw, gh: Art.gh }); lembrar('art-salvos', JSON.stringify(l.slice(0, 30))); toast('Guardado.', { tipo: 'bom' }); App.render(); };
ACT['art-abrir'] = el => { const s = artSalvos()[+el.dataset.i]; if (!s) return; Art.tipo = s.tipo; Art.o = { ...s.o }; Art.v = s.v || 0; Art.gw = s.gw || 24; Art.gh = s.gh || 16; App.render(); window.scrollTo(0, 0); };
ACT['art-tirar'] = el => { const l = artSalvos(); l.splice(+el.dataset.i, 1); lembrar('art-salvos', JSON.stringify(l)); App.render(); };
document.addEventListener('input', e => { if (e.target && e.target.dataset && e.target.dataset.chg === 'art-op' && e.target.tagName === 'TEXTAREA') { Art.o.livre = e.target.value; const t = $('#art-txt'); if (t) t.value = artPrompt(); } });
NAV.mestre.forEach(g => { if (g[0] === 'Preparar') g[1].push('atelie'); });
