/* ═══════════ FROTA: navios de figurantes em uma linha ═══════════
   Para o mestre ter navios do bando (Comandante de Divisão, LJ p. 298), aliados e inimigos sem montar ficha.
   Cada navio: nome · modelo do livro (LJ p. 320–321) · lado · comandante · um traço · missão. Os números saem do modelo.
   "Pôr na batalha" leva o navio para a Batalha naval com esses números (o "zoom"); lá, "Agir sozinho" faz o turno dele.
   Fica no Controle do mestre (Store.s.frota). Só os navios do lado do bando aparecem para os jogadores, em Tripulação (mesa/tripulacao.frota).
   MISSÃO (regra da casa, não é do livro): um navio do bando sai por alguns dias e volta com Berries para o Banco do bando.
   O mestre escolhe a rota (calma, arriscada, perigosa) e os dias. Na volta, um d20 diz se deu certo. O mestre pode trocar o valor antes de guardar. */
const FR_RISCO = { calma: { n: 'Rota calma', mult: 1, ruim: 1, dano: 0.1 }, arriscada: { n: 'Rota arriscada', mult: 2, ruim: 5, dano: 0.25 }, perigosa: { n: 'Rota perigosa', mult: 4, ruim: 9, dano: 0.5 } };
const FR_TAXA = { Pequeno: 30000, 'Médio': 60000, Grande: 120000, Enorme: 200000, Colossal: 300000 };   // Berries por dia de missão, na rota calma
const FR_VOLTA = {
  bom: ['Viagem sem novidade.', 'Voltou com o porão cheio.', 'Fez o serviço e voltou no prazo.', 'Mar tranquilo na ida e na volta.'],
  otimo: ['Achou um comprador generoso.', 'Voltou com mais do que foi buscar.', 'Deu tudo certo, e ainda sobrou.', 'O nome do bando abriu portas.'],
  ruim: ['Voltou com o casco chamuscado.', 'Perdeu parte da carga numa tempestade.', 'Teve que fugir de um navio maior.', 'Voltou faltando gente e carga.']
};
const FR = { res: null };
const frFora = f => f.viagem && f.viagem.ate ? f.viagem : null;
const frGanho = (c, risco, dias) => Math.round(dias * (FR_TAXA[c.m.tamanho] || FR_TAXA.Pequeno) * (FR_RISCO[risco] || FR_RISCO.calma).mult);
const frDiaDe = min => Math.floor(min / 1440) + 1;
const FR_NAVIOS = ['Gaivota Rubra', 'Dente de Tubarão', 'Maré Brava', 'Rosa dos Ventos', 'Bigorna', 'Lua Cheia', 'Vento Norte', 'Caveira Risonha', 'Tormenta', 'Barracuda', 'Estrela do Sul', 'Coral Negro', 'Trovão', 'Andorinha', 'Baleia Azul', 'Farol Velho'];
const FR_GENTE = ['Barros', 'Quitéria', 'Tonho Maré', 'Jurema', 'Anzol', 'Salina', 'Bento', 'Mirtes', 'Zeca Arpão', 'Olívia', 'Raimundo', 'Perpétua', 'Caolho', 'Gil', 'Iara', 'Tibúrcio'];
const FR_LADOS = [['bando', 'Do bando'], ['aliado', 'Aliado'], ['inimigo', 'Inimigo'], ['neutro', 'Neutro']];
const frota = s => { s = s || S(); if (!Array.isArray(s.frota)) s.frota = []; return s.frota; };
const frMarinha = f => String(f.modelo || '').startsWith('Marinha');
const frNums = f => { const m = nvDeModelo(f.modelo); return m ? Object.assign(nvCalc(m), { m }) : null; };
function frMuda(fn) { Store.set(s => fn(frota(s), s), null, { semDesfazer: true }); frPublicar(); App.render(); }
/* os jogadores só veem os navios do bando */
function frPublicar() { if (!souMestre() || !Mesa.aberta) return; clearTimeout(frPublicar.t); frPublicar.t = setTimeout(() => {
  const L = frota().filter(f => f.lado === 'bando').map(f => { const c = frNums(f); return { nome: f.nome, modelo: f.modelo, cmd: f.cmd || '', rosto: f.rosto || '', missao: f.missao || '', pv: f.pv ?? (c ? c.pvMax : 0), pvMax: c ? c.pvMax : 0, volta: frFora(f) ? frDiaDe(f.viagem.ate) : 0 }; });
  DB.gravar('mesa/tripulacao', { frota: L }).catch(() => {}); }, 600); }
const frSorteia = l => l[rnd(l.length) - 1];
const frRosto = marinha => { const f = marinha ? 'rostos_mar' : frSorteia(['rostos_pir', 'rostos_pir2']); return temIc(f + ':' + ROSTO_NOMES[f][0]) ? f + ':' + frSorteia(ROSTO_NOMES[f]) : 'retratos:capitao'; };
ACT['fr-add'] = () => { const modelo = ($('#fr-modelo') || {}).value || 'Pequeno', lado = ($('#fr-lado') || {}).value || 'inimigo', mar = modelo.startsWith('Marinha');
  frMuda(L => { const livres = FR_NAVIOS.filter(n => !L.some(x => x.nome === n)); L.push({ id: uid(), nome: frSorteia(livres.length ? livres : FR_NAVIOS), modelo, lado, cmd: (mar ? frSorteia(['Capitão ', 'Tenente ', 'Comandante ']) : lado === 'bando' ? 'Comandante ' : 'Capitão ') + frSorteia(FR_GENTE), rosto: frRosto(mar), traco: '', missao: '', pv: null }); }); };
ACT['fr-campo'] = el => { const k = el.dataset.k, v = el.value; Store.set(s => { const f = frota(s).find(x => x.id === el.dataset.id); if (f) { f[k] = k === 'pv' ? (v === '' ? null : Math.max(0, Math.round(+v || 0))) : String(v).slice(0, 120); if (k === 'modelo') f.pv = null; } }, null, { semDesfazer: true }); frPublicar(); if (k === 'modelo' || k === 'lado' || k === 'pv') App.render(); };
ACT['fr-sortear'] = el => frMuda(L => { const f = L.find(x => x.id === el.dataset.id); if (!f) return; const mar = frMarinha(f); f.nome = frSorteia(FR_NAVIOS); f.cmd = (mar ? frSorteia(['Capitão ', 'Tenente ', 'Comandante ']) : f.lado === 'bando' ? 'Comandante ' : 'Capitão ') + frSorteia(FR_GENTE); f.rosto = frRosto(mar); });
ACT['fr-rosto'] = el => escolherIcone([...FOLHAS_ROSTOS, 'retratos', 'npcs'], ref => frMuda(L => { const f = L.find(x => x.id === el.dataset.id); if (f) f.rosto = ref; }));
ACT['fr-tirar'] = el => { const f = frota().find(x => x.id === el.dataset.id); if (f) confirmar(`Tirar <b>${esc(f.nome)}</b> da frota?`, () => frMuda(L => { const i = L.findIndex(x => x.id === f.id); if (i >= 0) L.splice(i, 1); }), { ok: 'Tirar' }); };
const frNaBatalha = f => bn().navios.find(n => n.frotaId === f.id) || null;
ACT['fr-batalha'] = el => { const f = frota().find(x => x.id === el.dataset.id), c = f && frNums(f); if (!f || !c) return;
  if (frFora(f)) return toast(`${esc(f.nome)} está em missão. Chame de volta antes.`, { tipo: 'ruim' });
  if (frNaBatalha(f)) return App.ir('naval');
  const armas = c.m.armas.filter(a => BN_ARMAS[a.n]).map(a => ({ n: a.n, q: a.q })), lado = f.lado === 'aliado' ? 'bando' : f.lado;
  bnMuda(b => { const k = b.navios.length, W = b.mapa || 600, esq = lado === 'bando', n = bnCriar({ nome: f.nome, lado, sprite: frMarinha(f) ? 'marinha' : esq ? 'mercante' : 'pirata', tamanho: c.m.tamanho, madeira: c.m.madeira, cr: c.cr, br: c.br, pvMax: c.pvMax, pv: f.pv ?? c.pvMax,
    velMax: c.vel, vel: Math.min(c.vel, 6), armas: armas.length ? armas : [{ n: 'Canhão Comum', q: 0 }], frotaId: f.id, x: W * (esq ? 0.25 : 0.75), y: W * 2 / 3 * (0.2 + 0.2 * (k % 4)), dir: esq ? 90 : 270 }); b.navios.push(n); b.sel = n.id; });
  toast(`<b>${esc(f.nome)}</b> entrou na Batalha naval. No turno dele, use “Agir sozinho” se não quiser pilotar.`, { tipo: 'bom', tempo: 6000 }); App.ir('naval'); };
ACT['fr-guardar'] = el => { const f = frota().find(x => x.id === el.dataset.id), n = f && frNaBatalha(f); if (!n) return; frMuda(L => { const x = L.find(y => y.id === f.id); if (x) x.pv = n.pv; }); toast(`PV de ${esc(f.nome)} guardado na frota: ${n.pv}/${n.pvMax}.`, { tipo: 'bom' }); };
/* ───── missão: o navio sai, o relógio da Mesa anda, ele volta com Berries ───── */
ACT['fr-missao'] = el => { const f = frota().find(x => x.id === el.dataset.id), c = f && frNums(f); if (!f || !c) return;
  if (frNaBatalha(f)) return toast('Este navio está na Batalha naval. Tire de lá antes de mandar em missão.', { tipo: 'ruim' });
  Modal.abrir(`<h2>${ic('navios:galeao', 32)} Mandar ${esc(f.nome)} em missão</h2>
    <p class="nota">Regra da casa. O navio some por alguns dias do relógio da Mesa e volta com Berries para o Banco do bando. Na volta, um d20 diz se deu certo.</p>
    <label class="campo-inline">O que vai fazer <input id="frm-oque" maxlength="60" placeholder="uma frase sua: comércio, escolta, recado..." style="width:min(100%,22em)"></label>
    <label class="campo-inline">Dias fora <input id="frm-dias" type="number" min="1" max="60" value="7" style="width:5em"></label>
    <table class="tab fr-rotas"><thead><tr><th></th><th>Rota</th><th>Rende por dia</th><th>Dá problema com</th><th>Se der problema</th></tr></thead><tbody>${Object.entries(FR_RISCO).map(([k, r], i) => `<tr><td><input type="radio" name="frm-risco" value="${k}" id="frm-${k}" ${i === 0 ? 'checked' : ''}></td><td><label for="frm-${k}"><b>${r.n}</b></label></td><td>${nvB(frGanho(c, k, 1))}</td><td>${r.ruim === 1 ? '1 no d20' : `1 a ${r.ruim} no d20`}</td><td>metade dos Berries e −${Math.round(r.dano * 100)}% do PV</td></tr>`).join('')}</tbody></table>
    <p class="nota">20 no d20: volta com o dobro. Os números são um ponto de partida: na volta você pode trocar o valor.</p>
    ${cvRec('rota') ? `<label class="campo-inline"><input type="checkbox" id="frm-rep"> Rota fixa: repete sozinho até você chamar de volta. O que trouxer espera aqui em Frota.</label>` : ''}
    <div class="linha-bts"><button class="bt bom" data-act="fr-missao-ir" data-id="${f.id}">Mandar</button><button class="bt" data-act="modal-fechar">Cancelar</button></div>`); };
ACT['fr-missao-ir'] = el => { const dias = clamp(Math.round(num(($('#frm-dias') || {}).value) || 7), 1, 60), risco = (document.querySelector('input[name="frm-risco"]:checked') || {}).value || 'calma', oque = (($('#frm-oque') || {}).value || '').trim().slice(0, 60), R = Relogio.agora(), rep = !!(($('#frm-rep') || {}).checked && cvRec('rota'));
  Modal.fechar(); frMuda(L => { const f = L.find(x => x.id === el.dataset.id); if (!f) return; f.viagem = { risco, dias, ini: R.min, ate: R.min + dias * 1440, ...(rep ? { rep: true } : {}) }; f.missao = oque || (rep ? 'rota fixa' : 'em missão'); });
  toast(`${rep ? 'Rota fixa anotada' : 'Missão anotada'}: ${rep ? 'a primeira volta é' : 'volta'} no dia ${frDiaDe(R.min + dias * 1440)} (hoje é dia ${R.dia}). O prazo anda com o relógio da Mesa.`, { tipo: 'bom', tempo: 6000 }); };
ACT['fr-missao-volta'] = el => { const f = frota().find(x => x.id === el.dataset.id); if (f) confirmar(`Chamar <b>${esc(f.nome)}</b> de volta agora? A missão acaba sem render nada.`, () => frMuda(L => { const x = L.find(y => y.id === f.id); if (x) { x.viagem = null; x.missao = ''; } }), { ok: 'Chamar de volta' }); };
ACT['fr-missao-fim'] = el => { const f = frota().find(x => x.id === el.dataset.id), c = f && frNums(f), v = f && frFora(f); if (!v || !c) return;
  const r = FR_RISCO[v.risco] || FR_RISCO.calma, d = rnd(20), tipo = d === 20 ? 'otimo' : d <= r.ruim ? 'ruim' : 'bom', base = frGanho(c, v.risco, v.dias), ganho = tipo === 'otimo' ? base * 2 : tipo === 'ruim' ? Math.round(base / 2) : base;
  const pv = f.pv ?? c.pvMax, dano = tipo === 'ruim' ? Math.round(c.pvMax * r.dano) : 0, fica = Math.max(0, pv - dano);
  FR.res = { id: f.id, dano }; Som.tocar('dado');
  Modal.abrir(`<h2>${ic('navios:galeao', 32)} ${esc(f.nome)} voltou</h2>
    <p class="fr-res fr-res-${tipo}"><b>d20 = ${d}</b> · ${r.n}, ${v.dias} dia${v.dias > 1 ? 's' : ''}: <b>${tipo === 'otimo' ? 'deu muito certo' : tipo === 'ruim' ? 'deu problema' : 'deu certo'}</b>.</p>
    <p><i>${frSorteia(FR_VOLTA[tipo])}</i> <small class="nota">(só uma faísca: conte do seu jeito)</small></p>
    ${dano ? `<p>O navio perde <b>${dano} PV</b>: fica com ${fica}/${c.pvMax}.${fica <= 0 ? ' <b class="ruim">Com PV 0 ele não navega mais: você decide o que foi feito dele.</b>' : ''}</p>` : ''}
    <label class="campo-inline">Berries que trouxe ฿ <input id="frm-v" type="number" min="0" value="${ganho}" style="width:10em"></label>
    <div class="linha-bts"><button class="bt bom" data-act="fr-missao-ok">Guardar no Banco do bando</button><button class="bt fino" data-act="fr-missao-ok" data-sem="1">Encerrar sem guardar</button></div>`); };
ACT['fr-missao-ok'] = el => { const R = FR.res; if (!R) return Modal.fechar(); const f = frota().find(x => x.id === R.id), c = f && frNums(f), v = el.dataset.sem ? 0 : Math.max(0, Math.round(num(($('#frm-v') || {}).value) || 0)); FR.res = null; Modal.fechar(); if (!f || !c) return;
  if (v) { bancoMov(v, `Frota: ${f.nome} voltou da missão`, 'Frota'); toastBeli(v, `${f.nome} trouxe para o Banco do bando`); }
  frMuda(L => { const x = L.find(y => y.id === f.id); if (!x) return; if (R.dano) x.pv = Math.max(0, (x.pv ?? c.pvMax) - R.dano); x.viagem = null; x.missao = ''; }); };
VIEWS.frota = {
  titulo: 'Frota', icone: 'navios:galeao', cena: 'cat_viagem', chaves: ['estado'],
  ao(ch) { const a = document.activeElement; if (a && /INPUT|TEXTAREA|SELECT/.test(a.tagName) && $('#vista').contains(a)) return false; },
  render() {
    if (!souMestre()) return `<div class="tela-trancada">${ic('mesa:cadeado', 128)}<h1>Frota</h1><p class="nota">Só o mestre vê a frota inteira. Os navios do bando aparecem em Tripulação.</p></div>`;
    const L = frota(), R = Relogio.agora(), inp = (f, k, ph, w) => `<input value="${esc(f[k] || '')}" data-chg="fr-campo" data-id="${f.id}" data-k="${k}" placeholder="${ph}" maxlength="120" style="${w}" aria-label="${ph}">`;
    return `<div class="frota-v"><h1>${ic('navios:galeao', 64)}Frota</h1>
      <section class="painel-cat"><p>Navios de figurantes, uma linha cada. Os números vêm do modelo do livro (LJ p. 320–321). Nada aqui precisa de ficha: você só desenvolve o navio que ganhar importância na história.</p>
        <div class="linha-bts"><label class="campo-inline">Modelo <select id="fr-modelo">${Object.keys(NV.modelo).map(m => `<option>${m}</option>`).join('')}</select></label>
          <label class="campo-inline">Lado <select id="fr-lado">${FR_LADOS.map(([k, t]) => `<option value="${k}" ${k === 'inimigo' ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
          <button class="bt ouro" data-act="fr-add">+ Navio de figurante</button></div>
        <p class="nota">O nome do navio e do comandante vêm sorteados só para você não parar a sessão. Troque à vontade. Navio <b>do bando</b> pode sair em missão e trazer Berries para o Banco do bando.</p></section>
      ${L.length ? `<ul class="fr-l">${L.map(f => { const c = frNums(f), nb = frNaBatalha(f), pv = f.pv ?? (c ? c.pvMax : 0), fora = frFora(f), voltou = fora && R.min >= fora.ate, falta = fora ? Math.max(0, Math.ceil((fora.ate - R.min) / 1440)) : 0;
        return `<li class="fr-it fr-${f.lado}"><button class="fr-rosto" data-act="fr-rosto" data-id="${f.id}" title="Trocar o rosto do comandante">${iconeHTML(f.rosto || 'retratos:capitao', 64)}</button>
          <div class="fr-c"><div class="fr-linha">${inp(f, 'nome', 'Nome do navio', 'flex:2 1 150px;font-weight:700')}
              <select data-chg="fr-campo" data-id="${f.id}" data-k="modelo" aria-label="Modelo">${Object.keys(NV.modelo).map(m => `<option ${m === f.modelo ? 'selected' : ''}>${m}</option>`).join('')}</select>
              <select data-chg="fr-campo" data-id="${f.id}" data-k="lado" aria-label="Lado">${FR_LADOS.map(([k, t]) => `<option value="${k}" ${k === f.lado ? 'selected' : ''}>${t}</option>`).join('')}</select>${inp(f, 'cmd', 'Comandante', 'flex:1 1 130px')}</div>
            <div class="fr-linha">${inp(f, 'traco', 'Um traço para lembrar (uma frase sua)', 'flex:2 1 200px')}${inp(f, 'missao', 'O que está fazendo agora', 'flex:2 1 200px')}</div>
            <p class="fr-nums">${c ? `CR <b>${c.cr}</b> · BR <b>${c.br}</b> · PV <input type="number" min="0" value="${pv}" data-chg="fr-campo" data-id="${f.id}" data-k="pv" style="width:5em" aria-label="PV">/${c.pvMax} · <b>${c.vel}</b> nós · ${c.m.armas.map(a => `${a.q}× ${esc(a.n)}`).join(', ')}` : ''}${nb ? ` · <b class="bom">na batalha: PV ${nb.pv}/${nb.pvMax}</b>` : ''}</p>
            ${fora ? `<p class="fr-fora ${voltou ? 'voltou' : ''}">${ic('mar:luneta', 32)} ${voltou ? `<b>Voltou da missão.</b> Veja como foi.` : `<b>${fora.rep ? 'Rota fixa' : 'Em missão'}</b> (${FR_RISCO[fora.risco].n.toLowerCase()}): ${fora.rep ? 'próxima volta' : 'volta'} no dia ${frDiaDe(fora.ate)}, ${falta > 1 ? `faltam ${falta} dias` : 'falta menos de 1 dia'}. Hoje é dia ${R.dia}.`}</p>` : ''}</div>
          <div class="fr-bts">${fora ? (voltou ? `<button class="bt bom fino" data-act="fr-missao-fim" data-id="${f.id}">Ver como foi</button>` : `<button class="bt fino" data-act="fr-missao-volta" data-id="${f.id}">Chamar de volta</button>`)
              : `<button class="bt fino ${nb ? '' : 'ouro'}" data-act="fr-batalha" data-id="${f.id}">${nb ? 'Ver na batalha' : 'Pôr na batalha'}</button>${nb ? `<button class="bt fino" data-act="fr-guardar" data-id="${f.id}">Guardar o PV</button>` : f.lado === 'bando' ? `<button class="bt fino" data-act="fr-missao" data-id="${f.id}" title="O navio sai por uns dias e volta com Berries para o Banco do bando">Mandar em missão</button>` : ''}`}
            <button class="bt fino" data-act="fr-sortear" data-id="${f.id}" title="Sortear outro nome e comandante">Sortear</button><button class="bt-ic mini" data-act="fr-tirar" data-id="${f.id}" title="Tirar da frota">✕</button></div></li>`; }).join('')}</ul>` : '<p class="nota">Nenhum navio na frota ainda.</p>'}
    </div>`;
  }
};
OCULTAS.push('frota');
/* a frota do bando, para todos, dentro de Tripulação */
function frTripHTML() { const L = (M.trip || {}).frota || []; if (!L.length) return '';
  return `<section class="pap trip-frota"><h2>${ic('navios:galeao', 32)} Frota do bando</h2><ul class="trip-frota-l">${L.map(f => `<li>${iconeHTML(f.rosto || 'retratos:capitao', 48)}<div><b>${esc(f.nome)}</b> <small>${esc(f.modelo)}${f.pvMax ? ` · PV ${f.pv}/${f.pvMax}` : ''}</small><br>${esc(f.cmd || '')}${f.missao ? ` · <i>${esc(f.missao)}</i>` : ''}${f.volta ? ` · <span class="fr-volta">volta no dia ${f.volta}</span>` : ''}</div></li>`).join('')}</ul></section>`; }
/* o relógio andou e um navio em missão chegou: avisa o mestre uma vez */
const FrAviso = { ja: new Set() };
Mesa.on(ch => { if (ch !== 'estado' || !Mesa.aberta || !souMestre()) return; const R = Relogio.agora();
  frota().forEach(f => { const v = frFora(f); if (!v || R.min < v.ate || FrAviso.ja.has(f.id + ':' + v.ate)) return; FrAviso.ja.add(f.id + ':' + v.ate);
    toast(`${ic('navios:galeao', 32)} <b>${esc(f.nome)}</b> voltou da missão. Veja como foi em Frota.`, { tipo: 'bom', tempo: 8000 }); }); });
if (window.__expor) Object.assign(window, { frota, frNums, frGanho, FR_RISCO });
