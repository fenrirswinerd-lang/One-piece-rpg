/* ═══════════ TÍTULO NA TELA e CHEGADA NA ILHA ═══════════
   Os dois usam o palco dos avisos (aparece para todos, alguns segundos) e nenhuma arte nova:
   · título: só letras, com faixas pretas em cima e embaixo, para o nome do arco ou do episódio. Opcional: só aparece se o mestre mandar.
   · chegada: o mestre clica "Chegar" na ilha. Mostra a arte de chegada que ele escolheu (uma imagem já enviada, ou uma nova),
     ou o ícone da ilha. Cada ilha tem a chave "mostrar a arte na chegada": desligada, aparece só o nome. */
const CINE_TEMPO = 7500;
function cineHTML(a) {
  const d = a.dados || {}, barra = '<div class="cine-barra" aria-hidden="true"></div>';
  const textos = (sup, t, sub) => `<div class="cine-c">${sup ? `<p class="cine-sup">${esc(sup)}</p>` : ''}<h2 class="cine-t">${esc(t || '')}</h2>${sub ? `<p class="cine-sub">${esc(sub)}</p>` : ''}</div>`;
  if (a.tipo === 'titulo') return `<div class="cine cine-tit">${barra}<div class="cine-meio">${textos(d.sup, a.txt, d.sub)}</div>${barra}</div>`;
  const arte = d.arte && d.arq, ico = !arte && d.arte !== false && d.icone;
  return `<div class="cine cine-ilha ${arte ? 'com-arte' : ''}">${barra}<div class="cine-meio">
      ${arte ? `<img class="cine-img" data-arq="${esc(d.arq)}" alt="${esc(a.txt || 'Ilha')}">` : ''}
      ${ico ? `<div class="cine-ic">${iconeHTML(d.icone, 160)}</div>` : ''}
      ${textos('Chegando em', a.txt, d.mar)}</div>${barra}</div>`;
}
(() => { const orig = Avisos.mostrar; Avisos.mostrar = function (a) {
  if (!a || (a.tipo !== 'titulo' && a.tipo !== 'chegada')) return orig.apply(this, arguments);
  const p = $('#palco'); if (!p) return; const d = a.dados || {};
  if (Array.isArray(d.verem) && d.verem.length && !d.verem.includes(Eu.uid) && !souMestre()) return;
  p.innerHTML = `<div class="palco-in sem-caixa palco-cine"><button class="palco-x" data-act="palco-fechar" aria-label="Fechar">×</button>${cineHTML(a)}</div>`; p.classList.add('on');
  carregarArquivos(p); Som2.evento(a.tipo, a.tipo === 'chegada' ? 'sino' : 'nivel');
  clearTimeout(this.t); this.t = setTimeout(() => p.classList.remove('on'), d.tempo || CINE_TEMPO);
}; })();

/* ───── título na tela (Painel do mestre) ───── */
function titPainelHTML() {
  const arco = ((S().xp || {}).arco || '').trim(), si = sessaoInfo();
  return `<p class="pm-sub">Título na tela (opcional)</p>
    <div class="pm-linha"><input id="pm-tit" class="cresce" maxlength="60" placeholder="Nome do arco ou do episódio" data-enter="tit-mostrar"><input id="pm-tit-sub" class="cresce" maxlength="80" placeholder="Linha de baixo (opcional)" data-enter="tit-mostrar"><button class="bt" data-act="tit-mostrar">Mostrar a todos</button></div>
    <div class="chips">${arco ? `<button class="chip" data-act="tit-mostrar" data-t="${esc(arco)}" data-sup="Arco">Arco: ${esc(arco)}</button>` : ''}<button class="chip" data-act="tit-mostrar" data-t="${esc(si.nome)}" data-sup="Sessão ${si.n}">Sessão ${si.n} · ${esc(si.nome)}</button></div>`;
}
ACT['tit-mostrar'] = el => { if (!souMestre()) return;
  const campo = $('#pm-tit'), sub = $('#pm-tit-sub'), t = (el.dataset.t || (campo || {}).value || '').trim().slice(0, 60); if (!t) return toast('Escreva o título primeiro.');
  avisar('titulo', t, { sup: el.dataset.sup || '', sub: el.dataset.t ? '' : ((sub || {}).value || '').trim().slice(0, 80) });
  if (!el.dataset.t) { if (campo) campo.value = ''; if (sub) sub.value = ''; } toast('Título na tela de todos.', { tipo: 'bom' }); };

/* ───── chegada na ilha ───── */
const chArteOn = i => i.chegadaArte !== false;
const chDados = i => ({ icone: i.icone || 'ilhas:vila', mar: i.mar || '', arq: i.chegada || '', arte: chArteOn(i) });
ACT['ch-chegar'] = el => { if (!souMestre()) return; const s0 = mundoS(), i0 = ilhaPor(s0, el.dataset.id); if (!i0) return;
  salvarMundo(s => { const i = ilhaPor(s, i0.id); if (!i) return; s.atual = i.id; i.descoberta = true; }, ['chegada', i0.nome || 'Ilha', chDados(i0)]);
  Modal.fechar(); toast(`Chegada em <b>${esc(i0.nome || 'Ilha')}</b> na tela de todos. A ilha virou "estamos aqui".`, { tipo: 'bom' }); };
ACT['ch-previa'] = el => { const i = ilhaPor(mundoS(), el.dataset.id); if (i) { Modal.fechar(); Avisos.mostrar({ tipo: 'chegada', txt: i.nome || 'Ilha', dados: chDados(i) }); } };
ACT['ch-mostra'] = el => salvarMundo(s => { const i = ilhaPor(s, el.dataset.id); if (i) i.chegadaArte = !!el.checked; });
ACT['ch-arte'] = el => { if (!souMestre()) return; const id = el.dataset.id, i = ilhaPor(mundoS(), id); if (!i) return; const L = arqs('imagem');
  Modal.abrir(`<h2>${ic('ilhas:vila', 32)} Arte da chegada: ${esc(i.nome || 'Ilha')}</h2>
    <p class="nota">Aparece grande na tela de todos quando você clicar <b>Chegar</b>. Uma paisagem deitada (16:9) fica melhor. Sem arte, aparece o ícone da ilha.</p>
    ${L.length ? `<ul class="ch-galeria">${L.slice(0, 40).map(a => `<li><button class="${i.chegada === a.id ? 'on' : ''}" data-act="ch-arte-ok" data-id="${id}" data-arq="${a.id}" title="${esc(a.nome || '')}"><img data-arq="${a.id}" alt="${esc(a.nome || '')}"></button></li>`).join('')}</ul>`
      : '<p class="nota">Ainda não tem imagem enviada. Envie uma aqui, ou pelo Quadro da Mesa.</p>'}
    <div class="modal-bts"><button class="bt bom" data-act="ch-arte-up" data-id="${id}">Enviar imagem nova</button>${i.chegada ? `<button class="bt fino" data-act="ch-arte-ok" data-id="${id}" data-arq="">Tirar a arte (fica o ícone)</button><button class="bt fino" data-act="ch-previa" data-id="${id}">Ver só para mim</button>` : ''}<button class="bt fino" data-act="modal-fechar">Fechar</button></div>`, { classe: 'larga', titulo: 'Arte da chegada' });
  carregarArquivos($('#modal')); };
ACT['ch-arte-ok'] = el => { const id = el.dataset.id, arq = el.dataset.arq || ''; salvarMundo(s => { const i = ilhaPor(s, id); if (i) { if (arq) i.chegada = arq; else delete i.chegada; } }); Modal.fechar(); toast(arq ? 'Arte da chegada escolhida.' : 'Arte tirada. Na chegada aparece o ícone da ilha.', { tipo: 'bom' }); };
ACT['ch-arte-up'] = el => { const id = el.dataset.id; Modal.fechar(); escolherArquivos('image/*', false, async fs => { const [a] = await enviarArquivos(fs, 'imagem'); if (a) salvarMundo(s => { const i = ilhaPor(s, id); if (i) i.chegada = a.id; }); }); };
/* a linha da ilha em Mundo: miniatura da arte, chave de mostrar, botão de chegar */
function chLinhaHTML(i) {
  return `<div class="mu-chegada"><button class="ch-mini" data-act="ch-arte" data-id="${i.id}" title="Escolher a arte da chegada">${i.chegada ? `<img data-arq="${esc(i.chegada)}" alt="">` : `<span>${ic('ilhas:vila', 32)}</span>`}</button>
    <label class="ck-mini"><input type="checkbox" data-chg="ch-mostra" data-id="${i.id}" ${chArteOn(i) ? 'checked' : ''}> mostrar a arte na chegada</label>
    <button class="bt fino ouro" data-act="ch-chegar" data-id="${i.id}" title="Mostra a chegada na tela de todos e marca 'estamos aqui'">Chegar ▸ todos</button></div>`;
}
if (window.__expor) Object.assign(window, { cineHTML, chDados });
