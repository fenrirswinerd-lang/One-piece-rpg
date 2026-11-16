/* ═══════════ NAVIO: ficha do navio do bando ═══════════
   O mestre monta e entrega. Os jogadores veem quando a categoria é liberada, e só mexem se o mestre ligar a chave.
   Tabelas: Navios à venda (LJ p. 320), Madeira e estado do casco (LJ p. 316–317), Tripulação mínima (LJ p. 300), Armas (LJ p. 315–316). */
const TAM_NAVIO = {
  Pequeno: { cr: 10, pv: 150, vel: 10, can: 1, trip: '1 para navegar · 2 necessários' },
  Médio: { cr: 12, pv: 300, vel: 12, can: 3, trip: '2 para navegar · 3 necessários' },
  Grande: { cr: 15, pv: 500, vel: 12, can: 5, trip: '3 para navegar · 5 necessários' },
  Enorme: { cr: 15, pv: 750, vel: 24, can: 8, trip: '7 para navegar · 10 necessários' },
  Colossal: { cr: 16, pv: 1000, vel: 16, can: 12, trip: '12 para navegar · 15 necessários' }
};
const MADEIRA = { Cedro: { cr: 10, br: 5 }, Carvalho: { cr: 12, br: 10 }, Cerejeira: { cr: 15, br: 15 }, Adam: { cr: 18, br: 30 } };
const ARMAS_NAVIO = ['Canhão Comum', 'Canhão Aprimorado', 'Canhão Superior', 'Longo Alcance', 'Canhão de Energia', 'Lançador de Arpão', 'Bola Acorrentada', 'Estilhaços'];
/* estado do casco pelo PV (LJ p. 316–317): a velocidade cai, mas nunca abaixo de 8 nós */
function estadoNavio(pv, max) {
  const p = max ? pv / max : 1;
  if (pv <= 0) return { t: 'Afundando', vel: null, cls: 'ruim', nota: 'PV 0: o navio não navega.' };
  if (p <= 0.05) return { t: 'Irreparável', vel: -20, cls: 'ruim', nota: 'Não tem mais conserto.' };
  if (p <= 0.5) return { t: 'Muito danificado', vel: -8, cls: 'ruim', nota: 'Conserto: 50 dias, até 100% do valor.' };
  if (p <= 0.8) return { t: 'Avariado', vel: -4, cls: 'medio', nota: 'Conserto: 12 dias, até 45% do valor.' };
  if (p < 1) return { t: 'Arranhado', vel: 0, cls: '', nota: 'Conserto: 5 dias, até 20% do valor.' };
  return { t: 'Inteiro', vel: 0, cls: 'bom', nota: '' };
}
const navio = () => Object.assign({ nome: 'Navio sem nome', tamanho: 'Pequeno', madeira: 'Cedro', cr: 10, br: 5, pv: 150, pvMax: 150, vel: 10, armas: [], comodos: [], notas: '', editavel: false }, M.navio || {});
const podeMexerNavio = () => souMestre() || !!(M.navio || {}).editavel;

/* grava no banco, marca no histórico quem mudou o quê e, para o mestre, espelha no Controle (aba Viagem) */
async function gravarNavio(patch, txt) {
  if (!podeMexerNavio()) return toast('Só o mestre mexe no navio agora.', { tipo: 'ruim' });
  try {
    await DB.gravar('mesa/navio', Object.assign({}, patch, { em: Date.now() }));
    if (txt) await DB.novo('mesa/navio/mudancas', { txt, quem: souMestre() ? 'Mestre' : nomeJ(eu()), uid: Eu.uid, em: Date.now() });
    if (souMestre()) {
      const n = Object.assign(navio(), patch);
      Store.set(s => { s.viagem.navio = Object.assign({}, s.viagem.navio, { nome: n.nome, pv: n.pv, pvMax: n.pvMax, br: n.br }); }, null, { semDesfazer: true });
    }
  } catch (e) { toast('Não deu para salvar o navio: ' + esc(e.code || e.message), { tipo: 'ruim' }); }
}

VIEWS.navio = {
  titulo: 'Navio', icone: 'mar:navio_pirata', chaves: ['navio', 'navioLog', 'trip'], cena: 'cat_viagem',
  ao(ch) { const a = document.activeElement; if (a && /INPUT|TEXTAREA|SELECT/.test(a.tagName) && $('#vista').contains(a)) return false; },
  render() {
    const n = navio(), m = souMestre(), pode = podeMexerNavio(), st = estadoNavio(n.pv, n.pvMax), tam = TAM_NAVIO[n.tamanho] || TAM_NAVIO.Pequeno;
    const velReal = st.vel == null ? 0 : Math.max(8, n.vel + st.vel);
    const L = M.navioLog || [], jolly = (M.trip || {}).jolly;
    const campo = (k, v, tipo = 'number', extra = '') => pode ? `<input type="${tipo}" value="${esc(v)}" data-chg="nv-campo" data-k="${k}" ${extra}>` : `<b>${esc(v)}</b>`;
    return `<div class="navio-v"><h1>${ic('mar:navio_pirata', 64)}Navio</h1>
      ${m ? `<section class="painel-cat nv-chave"><label class="ck"><input type="checkbox" data-chg="nv-editavel" ${n.editavel ? 'checked' : ''}> <b>Os jogadores podem mexer no navio</b></label>
        <p class="nota">Desligado, eles só olham (se a categoria Navio estiver liberada no Painel do mestre › Comando). Ligado, eles editam tudo, e cada mudança fica no histórico com o nome de quem fez.</p></section>`
        : `<p class="nota nv-aviso">${pode ? 'O mestre liberou: vocês podem atualizar o navio. Tudo fica registrado no histórico.' : 'Só o mestre mexe no navio por enquanto.'}</p>`}
      <section class="painel-cat nv-cab">
        <div class="nv-img">${n.img ? iconeHTML(n.img, 160) : ic('mar:navio_pirata', 128)}${pode ? `<div class="linha-bts"><button class="bt fino" data-act="nv-img">Ícone</button><button class="bt fino" data-act="nv-img-up">Enviar arte</button></div>` : ''}</div>
        <div class="nv-id">${pode ? `<input class="nv-nome" value="${esc(n.nome)}" data-chg="nv-campo" data-k="nome" data-t="texto" aria-label="Nome do navio">` : `<h2>${esc(n.nome)}</h2>`}
          <p class="nv-tags"><span class="tag">${esc(n.tamanho)}</span><span class="tag">${esc(n.madeira)}</span><span class="tag ${st.cls}">${st.t}</span>${jolly ? `<span class="nv-jolly">${iconeHTML(jolly, 32)}</span>` : ''}</p>
          ${pode ? `<div class="linha-bts"><label class="campo-inline">Tamanho <select data-chg="nv-tam">${Object.keys(TAM_NAVIO).map(t => `<option ${t === n.tamanho ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
            <label class="campo-inline">Madeira <select data-chg="nv-mad">${Object.keys(MADEIRA).map(t => `<option ${t === n.madeira ? 'selected' : ''}>${t}</option>`).join('')}</select></label></div>
            <p class="nota">Trocar o tamanho preenche PV, velocidade e canhões pela tabela do livro (LJ p. 320). Trocar a madeira preenche CR e BR (LJ p. 316). Depois dá para ajustar à mão.</p>` : ''}
        </div></section>
      <section class="painel-cat nv-vida"><div class="vt"><b><i class="at-ic pv"></i>PV</b>${blocos(n.pv, n.pvMax, 'pv', pode ? { act: 'nv-pv-set', variante: 'navio' } : { variante: 'navio' })}<span>${n.pv}/${n.pvMax}</span>
        ${pode ? `<input id="nv-val" type="number" inputmode="numeric" placeholder="0" aria-label="Valor" style="width:5em"><button class="bt ruim fino" data-act="nv-dano">Dano</button><button class="bt bom fino" data-act="nv-conserto">Conserto</button>` : ''}</div>
        <p class="nota">${st.nota}${st.vel ? ` Velocidade ${st.vel} nós.` : ''} ${pode ? `O dano já desconta o BR (${n.br}).` : ''}</p></section>
      <ul class="nums nv-nums">
        <li>${ic('status:defesa', 32)}<span>CR</span>${campo('cr', n.cr, 'number', 'style="width:4em"')}</li>
        <li><i class="at-ic defesa" style="width:32px;height:32px"></i><span>BR (madeira)</span>${campo('br', n.br, 'number', 'style="width:4em"')}</li>
        <li>${ic('mar:luneta', 32)}<span>Velocidade</span>${pode ? campo('vel', n.vel, 'number', 'style="width:4em"') : `<b>${velReal} nós</b>`}${pode && st.vel ? `<small>agora ${velReal} nós</small>` : ''}</li>
        <li>${ic('mesa:tripulacao', 32)}<span>Tripulação mínima</span><small>${tam.trip}</small></li>
      </ul>
      <div class="nv-grade">
        <section class="painel-cat"><h2>${ic('navios:canhao', 32)} Armas</h2>
          ${n.armas.length ? `<ul class="nv-l">${n.armas.map((a, i) => `<li><b>${esc(a.n)}</b>${a.q > 1 ? ` <small>×${a.q}</small>` : ''}${pode ? `<span class="nv-bts"><button class="bt-ic mini" data-act="nv-arma-q" data-i="${i}" data-d="-1">−</button><button class="bt-ic mini" data-act="nv-arma-q" data-i="${i}" data-d="1">+</button></span>` : ''}</li>`).join('')}</ul>` : '<p class="nota">Nenhuma arma no navio.</p>'}
          ${pode ? `<div class="linha-bts"><select id="nv-arma">${ARMAS_NAVIO.map(a => `<option>${a}</option>`).join('')}</select><button class="bt fino" data-act="nv-arma-add">+ Arma</button></div>` : ''}
          <p class="nota"><small>Tabela das armas no Escudo › Batalha naval (LJ p. 315–316). Pelo tamanho, cabem até ${tam.can} canhões.</small></p></section>
        <section class="painel-cat"><h2>${ic('itens:mochila', 32)} Cômodos e melhorias</h2>
          ${n.comodos.length ? `<ul class="nv-l">${n.comodos.map((c, i) => `<li><b>${esc(c.n)}</b>${c.nota ? `<small>${esc(c.nota)}</small>` : ''}${pode ? `<button class="bt-ic mini" data-act="nv-comodo-tirar" data-i="${i}" title="Tirar">✕</button>` : ''}</li>`).join('')}</ul>` : '<p class="nota">O navio vem com âncora e cômodos vazios (LJ p. 320).</p>'}
          ${pode ? `<div class="linha-bts"><input id="nv-comodo" placeholder="Ex.: cozinha equipada, enfermaria, figura de proa" maxlength="60"><input id="nv-comodo-nota" placeholder="Detalhe (opcional)" maxlength="80"><button class="bt fino" data-act="nv-comodo-add">+ Pôr</button></div>` : ''}</section>
      </div>
      <section class="painel-cat"><h2>${ic('tesouro:livro', 32)} Anotações do navio</h2>
        ${pode ? `<textarea rows="3" data-chg="nv-campo" data-k="notas" data-t="texto" placeholder="História do navio, quem construiu, segredos do porão…">${esc(n.notas)}</textarea>` : `<p class="pre">${esc(n.notas || '—')}</p>`}</section>
      <section class="painel-cat"><h2>${ic('modos:anotar', 32)} Histórico</h2>
        ${L.length ? `<ol class="nv-hist">${L.slice(0, 20).map(x => `<li><b>${esc(x.quem || '')}</b> ${esc(x.txt)} <small>${hora(x.em)}</small></li>`).join('')}</ol>` : '<p class="nota">Nada mudou ainda.</p>'}</section>
    </div>`;
  }
};

ACT['nv-editavel'] = el => DB.gravar('mesa/navio', { editavel: !!el.checked }).then(() => toast(el.checked ? 'Os jogadores agora podem mexer no navio.' : 'Só você mexe no navio agora.'));
ACT['nv-campo'] = el => {
  const k = el.dataset.k, v = el.dataset.t === 'texto' ? el.value.trim() : (num(el.value) || 0);
  const nomes = { nome: 'o nome', cr: 'a CR', br: 'o BR', vel: 'a velocidade', notas: 'as anotações' };
  gravarNavio({ [k]: v }, `mudou ${nomes[k] || k}${el.dataset.t === 'texto' && k !== 'notas' ? ` para "${v}"` : el.dataset.t !== 'texto' ? ` para ${v}` : ''}`);
};
ACT['nv-tam'] = el => { const t = TAM_NAVIO[el.value], n = navio(); if (!t) return; const prop = n.pvMax ? n.pv / n.pvMax : 1; gravarNavio({ tamanho: el.value, pvMax: t.pv, pv: Math.round(t.pv * prop), vel: t.vel }, `mudou o tamanho para ${el.value}`); };
ACT['nv-mad'] = el => { const m = MADEIRA[el.value]; if (!m) return; gravarNavio({ madeira: el.value, cr: m.cr, br: m.br }, `trocou a madeira para ${el.value}`); };
ACT['nv-pv-set'] = el => { const n = navio(), alvo = +el.dataset.v; gravarNavio({ pv: n.pv === alvo ? Math.max(0, alvo - 1) : alvo }, `pôs o PV em ${alvo}`); };
ACT['nv-dano'] = () => { const n = navio(), d = num($('#nv-val').value) || 0; if (!d) return; const f = Math.max(0, d - (n.br || 0)); gravarNavio({ pv: n.pv - f }, `navio levou ${f} de dano (${d} − BR ${n.br})`); Som.tocar('canhao'); };
ACT['nv-conserto'] = () => { const n = navio(), d = num($('#nv-val').value) || 0; if (!d) return; gravarNavio({ pv: Math.min(n.pvMax, n.pv + d) }, `consertou ${d} de PV`); };
ACT['nv-arma-add'] = () => { const n = navio(), a = $('#nv-arma').value, ar = n.armas.slice(), x = ar.find(y => y.n === a); if (x) x.q = (x.q || 1) + 1; else ar.push({ n: a, q: 1 }); gravarNavio({ armas: ar }, `pôs ${a}`); };
ACT['nv-arma-q'] = el => { const n = navio(), ar = n.armas.map(a => ({ ...a })), x = ar[+el.dataset.i]; if (!x) return; x.q = (x.q || 1) + +el.dataset.d; gravarNavio({ armas: ar.filter(a => a.q > 0) }, `${+el.dataset.d > 0 ? 'pôs mais um' : 'tirou um'} ${x.n}`); };
ACT['nv-comodo-add'] = () => { const nome = $('#nv-comodo').value.trim(); if (!nome) return toast('Escreva o nome do cômodo ou melhoria.'); const n = navio(); gravarNavio({ comodos: [...n.comodos, { id: novoId(), n: nome, nota: $('#nv-comodo-nota').value.trim() }] }, `pôs ${nome}`); };
ACT['nv-comodo-tirar'] = el => { const n = navio(), c = n.comodos[+el.dataset.i]; if (!c) return; confirmar(`Tirar <b>${esc(c.n)}</b> do navio?`, () => gravarNavio({ comodos: n.comodos.filter((_, i) => i !== +el.dataset.i) }, `tirou ${c.n}`)); };
ACT['nv-img'] = () => escolherIcone(['navios', 'mar', 'trip'], ref => gravarNavio({ img: ref }, 'trocou a imagem do navio'));
ACT['nv-img-up'] = () => escolherArquivos('image/*', false, async fs => { const [a] = await enviarArquivos(fs, 'imagem'); if (a) gravarNavio({ img: { arq: a.id } }, 'pôs uma arte nova no navio'); });

/* o que o mestre muda na Viagem do Controle também vai para a ficha do navio */
['via-dano', 'via-conserto', 'via-navnome', 'via-pvmax', 'via-br'].forEach(k => {
  const orig = ACT[k]; if (!orig) return;
  ACT[k] = function (...a) {
    const r = orig.apply(this, a);
    if (souMestre() && typeof Mesa !== 'undefined' && Mesa.aberta) {
      const v = S().viagem.navio;
      DB.gravar('mesa/navio', { nome: v.nome, pv: v.pv, pvMax: v.pvMax, br: v.br, em: Date.now() }).catch(() => {});
    }
    return r;
  };
});

/* Navio entra no menu: trancado para os jogadores até o mestre liberar */
TRANCAVEIS.navio = 'Navio';
(() => {
  const jog = NAV.jogador[0][1]; if (!jog.includes('navio')) jog.splice(jog.indexOf('tripulacao') + 1, 0, 'navio');
  const g = NAV.mestre.find(([t]) => t === 'Para a mesa'); if (g && !g[1].includes('navio')) g[1].splice(g[1].indexOf('tripulacao') + 1, 0, 'navio');
})();
