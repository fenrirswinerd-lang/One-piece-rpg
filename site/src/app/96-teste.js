/* ═══════════ modo de teste e ferramentas de conferência: jogadores prontos com profissão, exemplos para a mesa,
   abas dos jogadores para o mestre, Beli animado, eventos do mar e "onde aparece cada animação" ═══════════ */
const PRESETS = {
  'ana-teste': { estilo: 'logpose', nome: 'Marisol', prof: 'Navegador', especie: 'Humanos', recompensa: 12000000, foto: 'especies:humano' },
  'bia-teste': { estilo: 'engrenagem', nome: 'Tico Pimenta', prof: 'Cozinheiro', especie: 'Minks', recompensa: 8000000, foto: 'especies:mink' },
  'caio-teste': { estilo: 'timao', nome: 'Brasa', prof: 'Ferreiro', especie: 'Homens-Peixe', recompensa: 15000000, foto: 'especies:homem_peixe' },
  'duda-teste': { estilo: 'engrenagem', nome: 'Tábua', prof: 'Carpinteiro', especie: 'Anões', recompensa: 5000000, foto: 'especies:anao' }
};
function fichaTeste(p) {
  const raw = JSON.parse(JSON.stringify(window.DEMO || {}));
  const V = raw['Valores'] = raw['Valores'] || {}, P = raw['Personalização e Inventário'] = raw['Personalização e Inventário'] || {}, R = raw['Profissão'] = raw['Profissão'] || {};
  V.U9 = p.prof; V.U7 = p.especie; V.B2 = p.nome; V.AC4 = p.recompensa; P.E2 = p.nome; R.F5 = 'Profissional';
  return parseFicha(raw);
}
async function prepararTeste(uid) {
  const p = PRESETS[uid]; if (!p) return null;
  const f = fichaTeste(p), kit = { cozinheiro: ['Kit de temperos', 6], ferreiro: ['Lingote', 3], navegador: ['Carta náutica', 2], carpinteiro: ['Tábuas', 10] }[sem(p.prof)];
  const doc = { uid, email: Eu.email, nome: Eu.nome, estilo: p.estilo, criado: Date.now(), visto: Date.now(), fichaJson: JSON.stringify(f), fichaEm: Date.now(), personagem: p.nome,
    vivo: limpo(vivoNovo(f)), vivoEm: Date.now(), foto: { ic: p.foto },
    inv: { beli: 50000, itens: [{ id: novoId(), nome: 'Kit médico', qtd: 2, peso: 1, ic: 'itens:kit_medico' }, { id: novoId(), nome: 'Ração', qtd: 5, peso: 0.5, ic: 'itens:racao' }]
      .concat(kit ? [{ id: novoId(), nome: kit[0], qtd: kit[1], peso: 1, ic: 'itens:ferramentas' }] : []), log: [] } };
  await DB.gravar('jogadores/' + uid, doc, false);
  Eu.estilo = p.estilo;
  return doc;
}

/* Beli: a animação de moedas acompanha ganhos e gastos */
function toastBeli(v, txt) {
  toast(`${MANIFEST.anims.moedas ? anim('moedas', 0.55, { umaVez: true, dur: 1.1 }) : ic('itensop:beli_moedas', 32)}<span><b class="${v < 0 ? 'ruim' : 'bom'}">${v < 0 ? '−' : '+'}฿ ${fmt(Math.abs(v))}</b> · ${esc(txt || '')}</span>`, { tempo: 4000 });
}

/* ───── abas dos jogadores para o mestre: escolhe um jogador e vê (e pode corrigir) a aba dele ───── */
Object.defineProperty(VIEWS.personagem, 'titulo', { get: () => souMestre() ? 'Abas dos jogadores' : 'Personagem', configurable: true });
const _renderPers = VIEWS.personagem.render;
VIEWS.personagem.render = function () {
  if (!souMestre()) return _renderPers.call(this);
  const js = (M.jogadores || []).filter(j => j.estilo);
  if (!js.length) return `<div class="tela-trancada">${ic('mesa:npc', 128)}<h1>Abas dos jogadores</h1><p class="nota">Quando um jogador entrar e escolher o estilo, a aba dele aparece aqui.${TESTE ? ' No teste, abra outra aba e entre como Ana, Bia, Caio ou Duda.' : ''}</p></div>`;
  if (!js.some(j => j.uid === Espiar.uid)) espiar(js[0].uid);
  return `<div class="espiar"><span class="esp-t">${ic('mesa:olho', 32)} Vendo a aba de:</span>${js.map(j => `<button class="chip ${j.uid === Espiar.uid ? 'on' : ''}" data-act="espiar" data-uid="${j.uid}">${fotoJ(j, 32)} ${esc(nomeJ(j))}</button>`).join('')}
    <span class="nota">Você vê o que o jogador vê, no estilo dele (${ESTILOS[eu().estilo || 'logpose'].nome}). O que mudar aqui muda para ele.</span>
    <button class="bt fino ruim esp-tirar" data-act="jog-tirar" data-uid="${esc(Espiar.uid)}">Tirar ${esc(nomeJ(eu()))} da mesa</button></div>` + _renderPers.call(this);
};
function espiar(uid) {
  if (Espiar.uid === uid && Espiar.parar) return;
  if (Espiar.parar) Espiar.parar();
  Espiar.uid = uid; M.privado = {};
  Espiar.parar = DB.ouvir(`jogadores/${uid}/privado/notas`, d => { M.privado = d || {}; if (App.rota === 'personagem') App.render(); }, () => {});
}
ACT['espiar'] = el => { espiar(el.dataset.uid); App.render(); };

/* ───── eventos do mar: o mestre mostra uma animação grande para todo mundo ───── */
const EVENTOS_MAR = [['baleia', 'Uma baleia gigante salta ao lado do navio!'], ['tentaculos', 'Tentáculos enormes saem da água!'], ['redemoinho', 'Um redemoinho se forma à frente!'],
  ['reimares', 'Um Rei dos Mares surge das profundezas!'], ['marinha', 'Um navio da Marinha aparece no horizonte!'], ['raio', 'Raios caem no mar ao redor!'], ['onda', 'Uma onda gigante vem na direção do navio!'],
  ['farol', 'A luz de um farol aparece na escuridão.'], ['garrafa', 'Uma garrafa com uma mensagem boia perto do casco.'],
  ['bandeira', 'Um navio pirata ergue a bandeira no horizonte!'], ['canhao', 'Tiros de canhão! Uma bala cai perto do casco!'], ['navio', 'Um navio desconhecido se aproxima.'],
  ['bussola', 'A bússola enlouquece: este trecho do mar é estranho.'], ['gaivota', 'Gaivotas no céu: terra à vista!']];
/* cardume e bolhas não são aviso: viram enfeite que passa sozinho pelo mar da mesa (decoMar) */
/* aba própria no painel: soltar um evento do mar na tela de todo mundo */
PainelMestre.mar = function () {
  return `<p class="nota">Toque numa para ela aparecer grande na tela de todo mundo, com o aviso escrito.</p>
    <div class="pm-mar">${EVENTOS_MAR.filter(([a]) => MANIFEST.anims[a]).map(([a, t]) => `<button class="pm-ev" data-act="pm-mar" data-a="${a}" title="${esc(t)}">${quadro(a, 0.75, 3)}<small>${esc(t.split(/[!.…]/)[0].slice(0, 22))}</small></button>`).join('')}</div>`;
};
const _pmMesa = PainelMestre.mesa;
PainelMestre.mesa = function (e) {
  return _pmMesa.call(this, e) + `${TESTE ? `<p class="pm-sub">Modo de teste</p><div class="pm-bts"><button class="bt bom" data-act="teste-exemplos">${ic('modos:selo', 32)} Preencher com exemplos</button><button class="bt fino ruim" data-act="teste-limpar">Apagar tudo do teste</button></div>
      <p class="nota">Exemplos: imagens de vários tamanhos, uma trilha e dois efeitos gerados, ilhas (descobertas e trancadas), NPCs, notícia, tripulação e recompensas.</p>` : ''}`;
};
ACT['pm-mar'] = el => { const ev = EVENTOS_MAR.find(([a]) => a === el.dataset.a); if (ev) avisar('mar', ev[1], { anim: ev[0] }); };

/* ───── exemplos para conferir a mesa sem publicar ───── */
function wavBlob(buf) {
  const d = buf.getChannelData(0), n = d.length, ab = new ArrayBuffer(44 + n * 2), v = new DataView(ab), w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, buf.sampleRate, true); v.setUint32(28, buf.sampleRate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, d[i])) * 0x7fff, true);
  return new Blob([ab], { type: 'audio/wav' });
}
async function somTeste(tipo) {
  const sr = 22050, dur = tipo === 'trilha' ? 8 : 1.4, ctx = new OfflineAudioContext(1, Math.floor(sr * dur), sr);
  const nota = (m, t, d, tipoO = 'triangle', vol = 0.22) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = tipoO; o.frequency.value = 440 * Math.pow(2, (m - 69) / 12);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + d + 0.05); };
  if (tipo === 'trilha') {   // uma cantiga de marinheiro em ré menor, em loop
    [62, 65, 69, 74, 72, 69, 65, 67, 69, 65, 62, 65, 64, 61, 62, 62].forEach((m, i) => nota(m, i * 0.5, 0.42));
    [38, 38, 41, 41, 45, 45, 43, 45].forEach((m, i) => nota(m, i, 0.9, 'sine', 0.18));
  } else if (tipo === 'canhao') {
    const b = ctx.createBuffer(1, sr, sr), dd = b.getChannelData(0); for (let i = 0; i < dd.length; i++) dd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / dd.length, 3);
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 400; s.buffer = b; s.connect(f).connect(ctx.destination); s.start(0);
    nota(40, 0, 0.6, 'sine', 0.5);
  } else { nota(81, 0, 1.3, 'sine', 0.25); nota(93, 0, 0.8, 'sine', 0.08); nota(88, 0.02, 1.0, 'sine', 0.06); }
  return wavBlob(await ctx.startRendering());
}
async function imagemTeste(w, h, titulo) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#79c7e8'); gr.addColorStop(0.55, '#f2d38b'); gr.addColorStop(1, '#1c6b8c'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#2a180d'; g.lineWidth = Math.max(6, w / 120); g.strokeRect(g.lineWidth / 2, g.lineWidth / 2, w - g.lineWidth, h - g.lineWidth);
  g.fillStyle = '#2a180d'; g.textAlign = 'center'; g.font = `bold ${Math.round(Math.min(w, h) / 9)}px sans-serif`; g.fillText(titulo, w / 2, h / 2);
  g.font = `${Math.round(Math.min(w, h) / 16)}px sans-serif`; g.fillText(`${w} × ${h} px`, w / 2, h / 2 + Math.min(w, h) / 8);
  return await new Promise(ok => cv.toBlob(b => ok(b), 'image/webp', 0.9));
}
ACT['teste-exemplos'] = async () => {
  if (!TESTE) return;
  const t = toast('Preenchendo os exemplos…', { tempo: 60000 });
  try {
    for (const [n, nome] of [['t_login', 'Porto ao entardecer (cena do site)'], ['p_cozinheiro', 'Cozinha do navio (cena do site)'], ['h_tempestade', 'Tempestade (cena do site)']]) {
      const im = MANIFEST.images[n]; if (!im) continue;
      await Arquivos.enviar(await (await fetch(ASSETS[im.file])).blob(), { nome, cat: 'imagem' });
    }
    await Arquivos.enviar(await imagemTeste(1600, 1000, 'Imagem larga de teste'), { nome: 'Teste larga 16:10', cat: 'imagem' });
    await Arquivos.enviar(await imagemTeste(800, 1200, 'Retrato de teste'), { nome: 'Teste retrato (em pé)', cat: 'imagem' });
    await Arquivos.enviar(await somTeste('trilha'), { nome: 'Cantiga de teste (gerada)', cat: 'trilha' });
    await Arquivos.enviar(await somTeste('canhao'), { nome: 'Canhão (teste)', cat: 'sfx' });
    await Arquivos.enviar(await somTeste('sino'), { nome: 'Sino do navio (teste)', cat: 'sfx' });
    const I = n => 'ilha-' + n;
    const mundo = { atual: I(1), ilhas: [
      { id: I(1), nome: 'Vila Moinho', icone: 'ilhas:vila', mar: 'East Blue', descoberta: true, resumo: 'Vila de pescadores com um moinho no morro. Calma, até a Marinha passar.' },
      { id: I(2), nome: 'Reino de Areia', icone: 'ilhas:deserto', mar: 'Paradise', descoberta: true, resumo: 'Dunas, palácio dourado e uma rainha preocupada com a seca.' },
      { id: I(3), nome: 'Ilha do Céu', icone: 'ilhas:celeste', mar: 'Mares do Céu', descoberta: false, nota: 'Só se chega pela corrente que sobe.' },
      { id: I(4), nome: 'Base G-3', icone: 'ilhas:marinha', mar: 'Paradise', descoberta: false, nota: 'Base da Marinha. Comandante cruel.' },
      { id: I(5), nome: 'Ilha Doce', icone: 'ilhas:doces', mar: 'Novo Mundo', descoberta: false }],
      npcs: [
        { id: 'n1', nome: 'Velho Bento', papel: 'pescador', ilha: I(1), retrato: 'npcs:pescador', tipo: 'npc', liberado: true, descricao: 'Conhece todas as correntes do East Blue.' },
        { id: 'n2', nome: 'Dona Marta', papel: 'dona da taverna', ilha: I(1), retrato: 'npcs:taverneira', tipo: 'npc', liberado: true, descricao: 'Serve o melhor ensopado da vila.' },
        { id: 'n3', nome: 'Tenente Morita', papel: 'Marinha', ilha: I(1), retrato: 'npcs:recruta', tipo: 'npc', liberado: false, segredo: 'Está procurando o grupo.' },
        { id: 'n4', nome: 'Zaira', papel: 'mercadora', ilha: I(2), retrato: 'npcs:mercadora', tipo: 'npc', liberado: true, descricao: 'Vende de tudo, até mapas que talvez sejam verdadeiros.' },
        { id: 'n5', nome: 'Vaca do Mar', papel: 'criatura', ilha: null, retrato: 'bestiario:vaca_mar', tipo: 'criatura', liberado: true, descricao: 'Grande, faminta e covarde.' },
        { id: 'n6', nome: 'Banana-Crocodilo', papel: 'criatura do deserto', ilha: I(2), retrato: 'bestiario:banana_wani', tipo: 'criatura', liberado: true }] };
    await DB.gravar('segredos/mundo', mundo, false); M.segMundo = mundo; publicarMundo();
    await DB.novo('mesa/jornal/noticias', { titulo: 'Marinha aumenta patrulhas no East Blue', txt: 'Após a fuga de piratas novatos, a base local reforçou a vigilância nos portos. Recompensas novas devem sair esta semana.', em: Date.now(), dia: 'Dia ' + Relogio.agora().dia });
    await DB.novo('mesa/bordo/entradas', { titulo: 'Sessão 1 · Exemplo', txt: 'Chegamos à Vila Moinho. Dona Marta falou de um mapa escondido no moinho.', em: Date.now(), dia: 'Dia 1', sessao: 1, tipo: 'nota' });
    await DB.gravar('mesa/tripulacao', { nome: 'Bando do Teste', resumo: 'Quatro desconhecidos que fugiram juntos e decidiram ficar.', mundo: 'Os jornais chamam de "os náufragos de Mary Geoise".', sabem: 'Existe um mapa no moinho.\nA Marinha está atrás de alguém do grupo.' });
    const rec = {}; Object.entries(PRESETS).forEach(([uid, p]) => { rec[uid] = p.recompensa; }); await DB.gravar('mesa/recompensas', rec);
    await gravarEstado({ liberado: { jornal: true }, sessao: { n: 1, nome: 'Mary Geoise' } });
    if (t) t.remove(); toast('Exemplos prontos. Veja o painel do mestre (Quadro, Som) e o tabuleiro de ilhas.', { tipo: 'bom', tempo: 7000 });
  } catch (e) { if (t) t.remove(); toast('Falhou: ' + esc(e.message), { tipo: 'ruim', tempo: 8000 }); console.error(e); }
};
ACT['teste-limpar'] = () => confirmar('Apagar tudo o que está guardado no modo de teste (neste navegador)?', () => {
  Object.keys(localStorage).filter(k => k.startsWith('mesa-teste:') || k === KEY).forEach(k => localStorage.removeItem(k));
  try { indexedDB.deleteDatabase('mesa-op'); } catch (e) { /* sem banco local */ }
  location.reload();
}, { perigo: true, ok: 'Apagar' });

/* ───── onde aparece cada animação (Ajustes) ───── */
const ONDE_ANIM = [
  ['dado', 'Quadro do meio da mesa, em cada rolagem pública'], ['cartaz', 'Cartaz de recompensa que cai para todos (Recompensas)'], ['moedas', 'Ganhos e gastos de Beli (inventário, profissões), loja e cartaz'],
  ['cadeado', 'Aviso quando você libera Jornal ou Tripulação'], ['denden', 'Aviso do Den Den Mushi (Comando › aviso para todos)'], ['newscoo', 'Jornal e aviso de notícia nova'],
  ['ampulheta', 'Quando você avança o relógio'], ['fogueira', 'Quando passam 8 horas ou mais (descanso longo)'], ['gramofone', 'Player de música, enquanto a trilha toca'],
  ['pena', 'Botão de escrever no diário pessoal'], ['diario', 'Título do diário pessoal'], ['panela', 'Aba de profissão do cozinheiro'], ['bigorna', 'Aba de profissão do ferreiro'],
  ['medico', 'Aba de profissão do médico'], ['mapa', 'Aba de profissão do navegador'], ['ondas', 'Faixa de ondas na base da mesa'], ['navio', 'Telas de entrada (carregando e escolher papel)'],
  ['bandeira', 'Topo do site, quando a sessão não tem ícone, e tela de entrada'], ['baleia', 'Evento do mar (Comando)'], ['tentaculos', 'Evento do mar (Comando)'], ['redemoinho', 'Evento do mar (Comando)'],
  ['reimares', 'Evento do mar (Comando)'], ['marinha', 'Evento do mar (Comando)'], ['raio', 'Evento do mar (Comando)'], ['onda', 'Evento do mar (Comando)'], ['farol', 'Evento do mar (Comando)'],
  ['garrafa', 'Evento do mar (Comando)'], ['cardume', 'Evento do mar (Comando)'], ['bolhas', 'Evento do mar (Comando)'],
  ['canhao', 'Começo do combate (Combate)'], ['soco', 'Ataques no combate (Combate)'], ['caveira', 'Aviso de personagem morto (Grupo)'], ['nivel', 'Subir de nível (Barra de Bônus)'],
  ['bau', 'Tesouro e viagem'], ['bussola', 'Teste de navegação (Viagem)'], ['rei', 'Rei dos Mares na viagem'], ['lampiao', 'Tela dos jogadores do Controle (segundo monitor)'], ['gaivota', 'Gaivota que cruza a tela de vez em quando']];
function animsHTML() {
  return `<section class="pap animacoes"><h2>${ic('modos:selo', 32)} Onde aparece cada animação</h2>
    <div class="anim-l">${ONDE_ANIM.filter(([a]) => MANIFEST.anims[a]).map(([a, t]) => `<div class="anim-i">${anim(a, 0.9, { dur: ['dado'].includes(a) ? 1.4 : 1 })}<div><b>${a}</b><small>${esc(t)}</small></div></div>`).join('')}</div></section>`;
}
const _ajustes2 = VIEWS.ajustes.render;
VIEWS.ajustes.render = function () { return _ajustes2.call(this) + (souMestre() ? animsHTML() : ''); };

/* clicar fora do aviso (no fundo escuro) fecha o aviso */
document.addEventListener('click', e => { const p = $('#palco'); if (p && e.target === p && p.classList.contains('on')) p.classList.remove('on'); });
