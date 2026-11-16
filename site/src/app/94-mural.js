/* ═══════════ BLOCO 4: alcunha no cartaz, cabeçalho de Recompensas, mural de procurados ═══════════
   Alcunha: vem da ficha (Personalização, "Alcunha"); o mestre pode trocar em Recompensas (M.estado.alcunhas[uid]).
   Mural: M.estado.mural = [{ id, uid?, nome, alcunha, valor, ret?, em, oculto? }]. Entra aos poucos: cada cartaz
   publicado é pregado (ou atualizado) no mural; o mestre também prega cartazes de NPC (rivais, vilões, fichas do mestre). */
const alcunhaJ = j => { if (!j) return ''; const a = ((M.estado || {}).alcunhas || {})[j.uid]; if (a != null) return a; const f = fichaDe(j); return (f && f.alcunha) || ''; };
const comAspas = a => a ? `“${String(a).replace(/^["“”']+|["“”']+$/g, '')}”` : '';
/* um cartaz completo com a arte (foto, alcunha, nome, valor). foto = HTML já pronto */
function cartazHTML({ foto, nome, alcunha, valor, novo }, cls = '') {
  return `<figure class="cz-mural ${cls}">
    <div class="cz-foto">${foto}</div><img class="cz-arte" src="${img('cartaz_base')}" alt="">
    ${alcunha ? `<span class="cz-alc" style="--n:${czLen(comAspas(alcunha))}">${esc(comAspas(alcunha))}</span>` : ''}
    <figcaption class="cz-nome" style="--n:${czLen(nome)}">${esc(nome || '?')}</figcaption><p class="cz-valor">${valor ? fmt(valor) : '—'}</p>
    ${novo ? '<span class="cz-novo">novo</span>' : ''}</figure>`;
}
const muralDe = () => (Array.isArray((M.estado || {}).mural) ? M.estado.mural : []);
const gravarMural = l => gravarEstado({ mural: l.map(x => { const o = {}; Object.entries(x).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') o[k] = v; }); return o; }) });
/* prega ou atualiza o cartaz do jogador (chamado ao publicar a recompensa) */
function pregarJogador(uid, valor) {
  const j = (M.jogadores || []).find(x => x.uid === uid); if (!j) return;
  const l = muralDe().slice(), i = l.findIndex(x => x.uid === uid), e = { id: i >= 0 ? l[i].id : uid, uid, nome: nomeJ(j), alcunha: alcunhaJ(j), valor, em: Date.now() };
  if (i >= 0) l[i] = { ...l[i], ...e, oculto: false }; else l.push(e);
  gravarMural(l);
}
const fotoMural = x => { const j = x.uid && (M.jogadores || []).find(y => y.uid === x.uid); return j ? fotoCartaz(j.foto, nomeJ(j)) : fotoCartaz(x.ret || 'npcs:recruta', x.nome); };
const MuralUI = { form: false };   // o formulário de NPC fica aberto depois de pregar, para pregar outro em seguida
const ehNovo = x => x.em && Date.now() - x.em < 3 * 864e5;   // pregado nos últimos 3 dias

VIEWS.mural = {
  titulo: 'Procurados', icone: 'modos:cartaz', chaves: ['jogadores', 'estado'],
  render() {
    const m = souMestre(), l = muralDe().filter(x => m || !x.oculto).sort((a, b) => (num(b.valor) || 0) - (num(a.valor) || 0));
    const bando = l.filter(x => x.uid), outros = l.filter(x => !x.uid);
    const quadro = (lista) => `<div class="mural-quadro">${lista.map((x, i) => `<div class="mural-item ${x.oculto ? 'oculto' : ''}" style="--rot:${[-2.5, 1.8, -1, 2.6, -1.8, 1][i % 6]}deg;--atraso:${Math.min(i, 10) * 0.08}s">
        <span class="prego ${x.uid ? 'tachinha' : ''}" aria-hidden="true"></span>${cartazHTML({ foto: fotoMural(x), nome: x.nome, alcunha: x.alcunha, valor: num(x.valor), novo: ehNovo(x) })}
        ${m ? `<div class="mural-ctl"><button class="bt fino" data-act="mu-editar" data-id="${esc(x.id)}">Editar</button><button class="bt fino" data-act="mu-ver" data-id="${esc(x.id)}">${x.oculto ? 'Mostrar' : 'Esconder'}</button><button class="bt-ic mini" data-act="mu-tirar" data-id="${esc(x.id)}" aria-label="Tirar ${esc(x.nome)} do mural">×</button></div>` : ''}</div>`).join('')}</div>`;
    return `<div class="mural-v">
      <header class="quadro-cab"><span class="tabua"><span>${ic('modos:cartaz', 32)} Mural de procurados</span></span>
        <p>${l.length ? `${l.length} cartaz${l.length > 1 ? 'es' : ''} pregado${l.length > 1 ? 's' : ''}` : 'Nenhum cartaz ainda'}${bando.length ? ` · bando: <b>฿ ${fmt(bando.reduce((a, x) => a + (num(x.valor) || 0), 0))}</b>` : ''}</p></header>
      ${bando.length ? `<section><h2 class="mural-t">Nosso bando</h2>${quadro(bando)}</section>` : ''}
      ${outros.length ? `<section><h2 class="mural-t">Outros procurados</h2>${quadro(outros)}</section>` : ''}
      ${!l.length ? `<div class="mural-vazio">${anim('cartaz_vento', 1.5, { dur: 1.8 })}</div><p class="vazio-li">${m ? 'Os cartazes entram aqui quando você publica uma recompensa (aba Recompensas) ou prega um cartaz de NPC abaixo.' : 'Ainda não tem ninguém procurado. Quando o mestre publicar um cartaz, ele aparece aqui.'}</p>` : ''}
      ${m && l.length ? `<div class="linha-bts"><button class="bt fino ruim" data-act="mu-limpar-saiu">Tirar quem saiu da mesa</button><button class="bt fino ruim" data-act="mu-limpar-tudo">Limpar o mural todo</button></div>` : ''}
      ${m ? `<details class="caixa" ${outros.length && !MuralUI.form ? '' : 'open'}><summary>Pregar cartaz de NPC (rival, vilão, Marinha…)</summary>
        <div class="mu-form"><label>Nome <input id="mu-nome" maxlength="40" placeholder="ex.: nome do rival"></label><label>Alcunha <input id="mu-alc" maxlength="40" placeholder="ex.: Mão de Ferro"></label>
          <label>฿ <input id="mu-valor" type="number" min="0" step="1000000" style="width:11em"></label>
          <label>Retrato <select id="mu-ret">${NPC_RET.map(r => `<option value="${r}">${esc(r.split(':')[1].replace(/_/g, ' '))}</option>`).join('')}</select></label>
          <button class="bt bom" data-act="mu-npc">Pregar no mural</button></div>
        ${S().party.some(p => p.pdm && p.sheet) ? `<p class="nota">Das suas fichas do mestre: ${S().party.filter(p => p.pdm && p.sheet).map(p => `<button class="bt fino" data-act="mu-pdm" data-id="${p.id}">${esc(nomePC(p))}${num(p.sheet.recompensa) ? ' · ฿ ' + fmt(num(p.sheet.recompensa)) : ''}</button>`).join(' ')}</p>` : ''}
        <p class="nota">Cartaz escondido só você vê. “Novo” some sozinho depois de 3 dias.</p></details>` : ''}
    </div>`;
  }
};
const acharMu = id => muralDe().find(x => String(x.id) === String(id));
ACT['mu-npc'] = () => {
  const nome = $('#mu-nome').value.trim(); if (!nome) return toast('Escreva o nome.');
  gravarMural([...muralDe(), { id: novoId(), nome, alcunha: $('#mu-alc').value.trim(), valor: Math.max(0, num($('#mu-valor').value) || 0), ret: $('#mu-ret').value, em: Date.now() }]);
  MuralUI.form = true; Som.tocar('moeda'); toast(`Cartaz de <b>${esc(nome)}</b> pregado no mural.`);
};
ACT['mu-pdm'] = el => {
  const p = pcPorId(el.dataset.id); if (!p || !p.sheet) return;
  const l = muralDe().slice(), i = l.findIndex(x => x.pdm === p.id), e = { id: i >= 0 ? l[i].id : novoId(), pdm: p.id, nome: nomePC(p), alcunha: p.sheet.alcunha || '', valor: num(p.sheet.recompensa) || 0, ret: (p.live && p.live.retrato) || 'mesa:npc', em: Date.now() };
  if (i >= 0) l[i] = { ...l[i], ...e }; else l.push(e);
  MuralUI.form = true; gravarMural(l); toast(`Cartaz de <b>${esc(nomePC(p))}</b> no mural (valores da ficha).`);
};
ACT['mu-ver'] = el => gravarMural(muralDe().map(x => String(x.id) === el.dataset.id ? { ...x, oculto: !x.oculto } : x));
ACT['mu-tirar'] = el => { const x = acharMu(el.dataset.id); confirmar(`Tirar o cartaz de <b>${esc(x ? x.nome : '')}</b> do mural?`, () => gravarMural(muralDe().filter(y => String(y.id) !== el.dataset.id)), { ok: 'Tirar' }); };
ACT['mu-editar'] = el => {
  const x = acharMu(el.dataset.id); if (!x) return;
  Modal.abrir(`<h2>Cartaz: ${esc(x.nome)}</h2>
    <label class="campo">Nome<input id="mue-nome" value="${esc(x.nome || '')}" maxlength="40"></label>
    <label class="campo">Alcunha<input id="mue-alc" value="${esc(x.alcunha || '')}" maxlength="40"></label>
    <label class="campo">Recompensa ฿<input id="mue-valor" type="number" min="0" step="1000000" value="${num(x.valor) || 0}"></label>
    ${x.uid ? '<p class="nota">Cartaz de jogador: para subir a recompensa de verdade (e o cartaz cair na tela de todos), use a aba Recompensas.</p>' : ''}
    <div class="linha-bts"><button class="bt bom" data-act="mue-ok" data-id="${esc(x.id)}">Salvar</button><button class="bt" data-act="modal-fechar">Cancelar</button></div>`);
};
ACT['mue-ok'] = el => { const id = el.dataset.id;
  gravarMural(muralDe().map(x => String(x.id) === id ? { ...x, nome: $('#mue-nome').value.trim() || x.nome, alcunha: $('#mue-alc').value.trim(), valor: Math.max(0, num($('#mue-valor').value) || 0) } : x)); Modal.fechar(); };
ACT['rec-alc'] = el => { const uid = el.dataset.uid, v = el.value.trim(); gravarEstado({ alcunhas: { [uid]: v } });
  const l = muralDe(), i = l.findIndex(x => x.uid === uid); if (i >= 0) gravarMural(l.map((x, k) => k === i ? { ...x, alcunha: v } : x)); };
ACT['rec-mural-todos'] = () => {
  const js = (M.jogadores || []).filter(j => j.estilo && jogAtivo(j)), rec = M.recompensas || {};
  const l = muralDe().slice(); let n = 0;
  js.forEach(j => { const f = fichaDe(j), v = rec[j.uid] ?? (f ? num(f.recompensa) : 0) ?? 0; if (!v) return; const i = l.findIndex(x => x.uid === j.uid), e = { id: i >= 0 ? l[i].id : j.uid, uid: j.uid, nome: nomeJ(j), alcunha: alcunhaJ(j), valor: v, em: i >= 0 ? l[i].em : Date.now() };
    if (i >= 0) l[i] = { ...l[i], ...e }; else { l.push(e); n++; } });
  gravarMural(l); toast(n ? `${n} cartaz(es) novo(s) no mural.` : 'Mural atualizado com as recompensas atuais.');
};
