/* ═══════════ mestre: arquivos com medidor de espaço, jogadores liberados, recompensas e caçadores ═══════════ */
VIEWS.arquivos = {
  titulo: 'Arquivos', icone: 'mesa:lixeira', chaves: ['arquivos'],
  cat: 'todos',
  render() {
    const usado = espacoUsado(), pct = Math.round(100 * usado / LIMITE_BANCO), L = (M.arquivos || []).filter(a => this.cat === 'todos' || a.cat === this.cat).sort((a, b) => (b.tam || 0) - (a.tam || 0));
    const porCat = Object.keys(CATS).map(c => [c, (M.arquivos || []).filter(a => a.cat === c)]).filter(([, l]) => l.length);
    const dono = a => { if (!a.dono || a.dono === Eu.uid) return 'mestre'; const j = (M.jogadores || []).find(x => x.uid === a.dono); return j ? nomeJ(j) : 'jogador'; };
    return `<div class="arq-v"><h1>${ic('mesa:lixeira', 64)}Arquivos</h1>
      <section class="pap arq-medidor"><p><b>Usado ${tamanho(usado)} de 1 GB</b> (${pct}%)</p><span class="barra grande ${pct >= 80 ? 'ruim' : ''}"><i style="width:${Math.min(100, pct)}%"></i></span>
        <p class="nota">${pct >= 80 ? '<b>Passou de 80%.</b> Apague trilhas e imagens que não usa mais.' : 'Plano grátis do Firebase: 1 GB. Músicas pesam mais: prefira MP3 de 128 kbps.'} Cada aparelho guarda uma cópia do que já baixou, então tocar de novo não gasta internet.</p>
        <p class="chips">${porCat.map(([c, l]) => `<span class="tag">${CATS[c]}: ${l.length} · ${tamanho(l.reduce((s, a) => s + (a.tam || 0), 0))}</span>`).join('')}</p></section>
      <div class="chips">${[['todos', 'Todos'], ...Object.entries(CATS)].map(([k, t]) => `<button class="chip ${this.cat === k ? 'on' : ''}" data-act="arq-cat" data-c="${k}">${t}</button>`).join('')}</div>
      ${L.length ? `<table class="tab arq-tab"><tr><th>Arquivo</th><th>Tipo</th><th>De</th><th>Tamanho</th><th></th></tr>${L.map(a => `<tr><td>${a.cat === 'imagem' || a.cat === 'foto' || a.cat === 'icone' ? `<img class="arq-mini foto-j" data-arq="${a.id}" alt="" width="40" height="40">` : ''} ${esc(a.nome)}</td><td>${CATS[a.cat] || a.cat}</td><td>${esc(dono(a))}</td><td>${tamanho(a.tam || 0)}</td>
        <td>${a.cat === 'trilha' || a.cat === 'sfx' ? `<button class="bt fino" data-act="arq-ouvir" data-id="${a.id}">▶</button>` : ''}<button class="bt fino ruim" data-act="arq-apagar" data-id="${a.id}">Apagar</button></td></tr>`).join('')}</table>` : '<p class="nota">Nada aqui.</p>'}
    </div>`;
  }
};
ACT['arq-cat'] = el => { VIEWS.arquivos.cat = el.dataset.c; App.render(); };
ACT['arq-ouvir'] = async el => { const u = await Arquivos.url(el.dataset.id); if (u) { const a = Som2.registrar(new Audio(u)); a.volume = Som2.vol.e; a.play().catch(() => {}); setTimeout(() => a.pause(), 15000); } };
ACT['arq-apagar'] = el => {
  const a = (M.arquivos || []).find(x => x.id === el.dataset.id); if (!a) return;
  const usado = [(M.estado.trilha || {}).id, (M.estado.imagem || {}).arq].includes(a.id);
  confirmar(`Apagar <b>${esc(a.nome)}</b> (${tamanho(a.tam || 0)}) do banco?${usado ? ' Ele está em uso na mesa agora.' : ''}`, async () => {
    if ((M.estado.trilha || {}).id === a.id) gravarEstado({ trilha: { tocando: false } });
    if ((M.estado.imagem || {}).arq === a.id) gravarEstado({ imagem: APAGAR });
    try { await Arquivos.apagar(a.id); toast('Apagado.'); } catch (e) { toast('Não deu para apagar: ' + esc(e.code || e.message), { tipo: 'ruim' }); }
  }, { perigo: true, ok: 'Apagar' });
};

/* ───── jogadores liberados (dentro de Ajustes) ───── */
function membrosHTML() {
  const emails = ((M.membrosDoc || {}).emails || []), js = M.jogadoresTodos || [], saiu = js.filter(j => !jogAtivo(j));
  return `<section class="pap membros"><h2>${ic('mesa:chave', 32)} Jogadores liberados</h2>
    <p class="nota">Só estes e-mails entram como jogador. Máximo de 6 pessoas na mesa contando com você. “Tirar” some com a pessoa de todas as abas.</p>
    <ul class="membros-l">${emails.map(e => { const j = js.find(x => x.email === e); return `<li>${j ? fotoJ(j, 32) : ic('mesa:npc', 32)}<span><b>${esc(e)}</b>${j ? `<small>${esc(nomeJ(j))}${online(j.visto) ? ' · online agora' : j.visto ? ' · visto ' + new Date(j.visto).toLocaleDateString('pt-BR') : ''}</small>` : '<small>ainda não entrou</small>'}</span>
      <button class="bt fino ruim" data-act="mb-tirar" data-e="${esc(e)}">Tirar</button></li>`; }).join('') || '<li class="nota">Ninguém liberado ainda.</li>'}</ul>
    <div class="linha-bts"><input id="mb-email" type="email" class="cresce" placeholder="email.do.jogador@gmail.com" data-enter="mb-add"><button class="bt bom" data-act="mb-add">Liberar</button></div>
    ${saiu.length ? `<p class="nota">Quem saiu da mesa (não aparece em nenhuma aba; os dados continuam guardados):</p><ul class="membros-l">${saiu.map(j => `<li>${fotoJ(j, 32)}<span><b>${esc(nomeJ(j))}</b><small>${esc(j.email || '')}</small></span>
      <button class="bt fino" data-act="jog-voltar" data-uid="${j.uid}">Trazer de volta</button><button class="bt fino ruim" data-act="mb-apagar" data-uid="${j.uid}">Apagar dados</button></li>`).join('')}</ul>` : ''}
  </section>`;
}
ACT['mb-add'] = async () => {
  const e = ($('#mb-email').value || '').trim().toLowerCase(); if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) return toast('Escreva um e-mail válido.', { tipo: 'ruim' });
  const emails = ((M.membrosDoc || {}).emails || []); if (emails.includes(e)) return toast('Esse e-mail já está liberado.');
  if (emails.length >= 5) return toast('A mesa já tem 5 jogadores (6 pessoas com você).', { tipo: 'ruim' });
  const volta = new Set((M.jogadoresTodos || []).filter(j => String(j.email || '').toLowerCase() === e).map(j => j.uid));   // liberou de novo: sai da lista de quem saiu
  await DB.gravar('config/membros', { emails: [...emails, e], fora: ((M.membrosDoc || {}).fora || []).filter(x => !volta.has(x)) }).catch(x => toast(esc(x.code || x.message), { tipo: 'ruim' }));
  toast(`${esc(e)} liberado. Mande o link do site para a pessoa.`, { tipo: 'bom' });
};
ACT['mb-tirar'] = el => {
  const j = (M.jogadoresTodos || []).find(x => String(x.email || '').toLowerCase() === el.dataset.e);
  if (j) return ACT['jog-tirar']({ dataset: { uid: j.uid } });
  confirmar(`Tirar <b>${esc(el.dataset.e)}</b> da lista? (Essa pessoa ainda não entrou no site.)`, () =>
    DB.gravar('config/membros', { emails: ((M.membrosDoc || {}).emails || []).filter(x => x !== el.dataset.e) }), { perigo: true, ok: 'Tirar' });
};
ACT['mb-apagar'] = el => confirmar('Apagar a ficha, o inventário e o diário dessa pessoa do banco? Não dá para desfazer.', async () => {
  await DB.apagar(`jogadores/${el.dataset.uid}/privado/notas`).catch(() => {}); await DB.apagar('jogadores/' + el.dataset.uid).catch(() => {});
  gravarMural(muralDe().filter(x => x.uid !== el.dataset.uid));
  await DB.gravar('mesa/recompensas', { [el.dataset.uid]: APAGAR }).catch(() => {});
  await DB.gravar('config/membros', { fora: ((M.membrosDoc || {}).fora || []).filter(x => x !== el.dataset.uid) }).catch(() => {});
  Store.set(s => { s.party = s.party.filter(p => p.uid !== el.dataset.uid); }, null); toast('Apagado (ficha, diário, cartaz e recompensa).');
}, { perigo: true, ok: 'Apagar' });
const _ajustes = VIEWS.ajustes.render;
VIEWS.ajustes.render = function () { return (souMestre() ? membrosHTML() + discordHTML() : '') + _ajustes.call(this); };
VIEWS.ajustes.chaves = ['membrosDoc', 'jogadores', 'segConfig'];

/* Discord: convite e quem está na call (widget), e rolagens no canal por webhook (enviadas pelo navegador do mestre) */
function discordHTML() {
  const c = M.segConfig || {};
  return `<section class="pap"><h2>${ic('modos:voz', 32)} Discord</h2>
    <div class="form-grade"><label class="campo"><span>Link de convite do servidor</span><input id="dc-convite" value="${esc((M.estado.discord || {}).convite || '')}" placeholder="https://discord.gg/…"></label>
      <label class="campo"><span>ID do servidor (para mostrar quem está na call)</span><input id="dc-id" value="${esc((M.estado.discord || {}).servidor || '')}" placeholder="123456789012345678"></label>
      <label class="campo"><span>Webhook do canal de rolagens (opcional, fica só com você)</span><input id="dc-hook" value="${esc(c.webhook || '')}" placeholder="https://discord.com/api/webhooks/…"></label></div>
    <button class="bt fino" data-act="dc-salvar">Salvar</button>
    <p class="nota">No Discord: Configurações do servidor › Widget › ligar "Ativar widget do servidor" e copiar o ID. Webhook: Editar canal › Integrações › Webhooks. Com o webhook, cada rolagem pública aparece no canal enquanto seu site estiver aberto.</p></section>`;
}
ACT['dc-salvar'] = () => {
  gravarEstado({ discord: { convite: $('#dc-convite').value.trim(), servidor: $('#dc-id').value.trim().replace(/\D/g, '') } });
  DB.gravar('segredos/config', { webhook: $('#dc-hook').value.trim() }).then(() => toast('Discord salvo.', { tipo: 'bom' }));
};
let _ultHook = Date.now();
Mesa.on(ch => {
  if (ch !== 'rolagens' || !souMestre()) return;
  const hook = (M.segConfig || {}).webhook; if (!hook || !/^https:\/\/(discord|discordapp)\.com\/api\/webhooks\//.test(hook)) return;
  const novas = (M.rolagens || []).filter(r => r.em > _ultHook).sort((a, b) => a.em - b.em); if (!novas.length) return;
  _ultHook = Math.max(...novas.map(r => r.em));
  novas.forEach(r => fetch(hook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'Mesa One Piece', content: `🎲 **${r.nome}**${r.rot ? ' · ' + r.rot : ''}: **${r.total}** (${r.expr}${r.dados ? ' → ' + r.dados.join(r.modo ? '/' : '+') : ''}${r.modo ? r.modo === 'vant' ? ', vantagem' : ', desvantagem' : ''})` }) }).catch(() => {}));
});

/* ───── recompensas e caçadores ───── */
/* Caçadores: o livro só diz que a recompensa vira ameaça constante (LJ p. 300–301). A chance abaixo é REGRA DA CASA, ajustável. */
const CACA_PADRAO = [[0, 0], [1, 2], [10000000, 4], [50000000, 6], [100000000, 8], [300000000, 11], [1000000000, 14]];
VIEWS.recompensas = {
  titulo: 'Recompensas', icone: 'modos:cartaz', chaves: ['jogadores', 'recompensas', 'trip', 'estado', 'membrosDoc'],
  render() {
    const js = (M.jogadores || []).filter(j => j.estilo && jogAtivo(j)), rec = M.recompensas || {}, tot = recompensaTotal();
    const velhos = muralDe().filter(x => x.uid && !(M.jogadores || []).some(j => j.uid === x.uid && j.estilo && jogAtivo(j)));
    const faixas = faixasCaca(), chance = chanceCacador(tot, faixas);
    const vals = js.map(j => { const f = fichaDe(j); return rec[j.uid] ?? (f ? num(f.recompensa) : 0) ?? 0; }), topo = js.map((j, i) => [j, vals[i]]).filter(x => x[1]).sort((a, b) => b[1] - a[1]);
    return `<div class="rec-v">
      <header class="quadro-cab rec-cab"><span class="tabua"><span>${ic('modos:cartaz', 32)} Recompensas</span></span>
        <ul class="rec-num"><li><small>Bando inteiro</small><b>฿ ${fmt(tot)}</b></li><li><small>Procurados</small><b>${topo.length} de ${js.length}</b></li>
          <li><small>Maior cartaz</small><b>${topo.length ? esc(nomeJ(topo[0][0])) + ' · ฿ ' + fmt(topo[0][1]) : '—'}</b></li><li><small>Caçadores (d20)</small><b>${chance ? '1 a ' + chance : 'nenhum'}</b></li></ul>
        <a class="bt fino" href="#mural">${ic('modos:cartaz', 32)} Ver o mural</a></header>
      <section class="pap"><h2>${ic('trip:recompensa_total', 32)} Cartazes</h2>
        <p class="nota">Quando a recompensa sobe, o cartaz cai na tela de todo mundo e é pregado no Mural de procurados. A alcunha vem da ficha; mude aqui se quiser (vale na hora).</p>
        <ul class="rec-l">${js.map(j => { const f = fichaDe(j), v = rec[j.uid] ?? (f ? num(f.recompensa) : 0) ?? 0; return `<li>${fotoJ(j, 48)}<span><b>${esc(nomeJ(j))}</b><small>atual: ฿ ${fmt(v)}</small>
          <input class="rec-alc" value="${esc(alcunhaJ(j))}" placeholder="Alcunha" maxlength="40" data-chg="rec-alc" data-uid="${j.uid}" aria-label="Alcunha de ${esc(nomeJ(j))}"></span>
          <input type="number" min="0" step="1000000" id="rec-${j.uid}" value="${v}" aria-label="Nova recompensa de ${esc(nomeJ(j))}"><button class="bt bom fino" data-act="rec-subir" data-uid="${j.uid}">${ic('modos:cartaz', 32)} Publicar cartaz</button></li>`; }).join('') || '<li class="nota">Nenhum jogador com ficha ainda.</li>'}</ul>
        <div class="linha-bts">${js.length ? '<button class="bt fino" data-act="rec-mural-todos">Pregar todos no mural (sem cair na tela)</button>' : ''}
          ${velhos.length ? `<button class="bt fino ruim" data-act="mu-limpar-saiu">Tirar do mural quem saiu da mesa (${velhos.length})</button>` : ''}
          ${muralDe().length ? '<button class="bt fino ruim" data-act="mu-limpar-tudo">Limpar o mural todo</button>' : ''}</div></section>
      <section class="pap"><h2>${ic('trip:cacadores', 32)} Caçadores de recompensa</h2>
        <p>Recompensa total do grupo: <b>฿ ${fmt(tot)}</b> · chance agora: <b>1 a ${chance} no d20</b> (${chance * 5}%)</p>
        <div class="linha-bts"><button class="bt" data-act="caca-rolar">${ic('mesa:d20', 32)} Rolar chegada de caçadores (secreto)</button><button class="bt fino" data-act="caca-rolar" data-pub="1">Rolar na mesa</button></div>
        <p class="destaque"><b>Regra da casa (proposta, ajuste os números):</b> ao chegar numa ilha ou a cada viagem, role 1d20. Se cair na faixa da recompensa total, aparecem caçadores. O livro só diz que, com recompensa, piratas rivais e caçadores viram ameaça constante e a Marinha endurece (LJ p. 300–301).</p>
        <details><summary>Ajustar a tabela</summary><table class="tab"><tr><th>Recompensa total a partir de</th><th>Caçadores se o d20 for até</th></tr>${faixas.map(([r, c], i) => `<tr><td>฿ <input type="number" id="cf-r${i}" value="${r}" step="1000000" style="width:11em"></td><td><input type="number" id="cf-c${i}" value="${c}" min="0" max="20" style="width:4em"></td></tr>`).join('')}</table>
          <button class="bt fino" data-act="caca-salvar" data-n="${faixas.length}">Salvar tabela</button> <button class="bt fino" data-act="caca-padrao">Voltar ao padrão</button></details>
        <p class="nota">O ND do caçador: use a tabela de encontros (Inimigos e Encontro) pelo nível do grupo. Caçadores de recompensa como forças auxiliares: GN p. 21. Caminhos da Crueldade e da Extravagância (aumento de recompensa): GN p. 77, no Escudo.</p></section></div>`;
  }
};
/* o Firestore não guarda lista dentro de lista: a tabela vai como [{ r, c }] */
const faixasCaca = () => { const f = (M.estado.cacadores || {}).faixas; return Array.isArray(f) && f.length ? f.map(x => [num(x.r) || 0, num(x.c) || 0]) : CACA_PADRAO; };
function recompensaTotal() { return (M.jogadores || []).filter(j => j.estilo && jogAtivo(j)).reduce((a, j) => { const f = fichaDe(j), v = (M.recompensas || {})[j.uid] ?? (f ? num(f.recompensa) : 0) ?? 0; return a + (v || 0); }, 0) + (num((M.trip || {}).extra) || 0); }
function chanceCacador(tot, faixas) { let c = 0; faixas.forEach(([r, n]) => { if (tot >= r) c = n; }); return c; }
ACT['rec-subir'] = el => {
  const uid = el.dataset.uid, v = Math.max(0, num($('#rec-' + uid).value) || 0), j = (M.jogadores || []).find(x => x.uid === uid);
  confirmar(`Publicar a recompensa de <b>${esc(nomeJ(j))}</b>: <b>฿ ${fmt(v)}</b>? O cartaz aparece para todo mundo.`, async () => {
    await DB.gravar('mesa/recompensas', { [uid]: v });
    avisar('cartaz', `Nova recompensa: ${nomeJ(j)}`, { uid, valor: v, nome: nomeJ(j), alcunha: alcunhaJ(j) });
    pregarJogador(uid, v);
    Store.set(s => Diario.add(`Recompensa de ${nomeJ(j)}: ฿ ${fmt(v)}`, 'recompensa'), null, { semDesfazer: true });
  }, { ok: 'Publicar' });
};
ACT['caca-rolar'] = el => {
  const n = chanceCacador(recompensaTotal(), faixasCaca());
  if (el.dataset.pub) return rolarPublico('1d20', `Caçadores? (aparecem com 1 a ${n})`);
  const r = rnd(20); Som.tocar('dado');
  toast(r <= n ? `<b>${r}</b> no d20: <b>caçadores aparecem!</b> (faixa 1 a ${n})` : `<b>${r}</b> no d20: nenhum caçador desta vez (faixa 1 a ${n}).`, { tipo: r <= n ? 'ruim' : 'bom', tempo: 8000 });
};
ACT['caca-salvar'] = el => { const n = +el.dataset.n, f = []; for (let i = 0; i < n; i++) f.push([Math.max(0, num($('#cf-r' + i).value) || 0), clamp(num($('#cf-c' + i).value) || 0, 0, 20)]); gravarEstado({ cacadores: { faixas: f.sort((a, b) => a[0] - b[0]).map(([r, c]) => ({ r, c })) } }); toast('Tabela salva.'); };
ACT['caca-padrao'] = () => gravarEstado({ cacadores: APAGAR });

/* limpar cartazes: de quem saiu da mesa, ou o mural inteiro */
ACT['mu-limpar-saiu'] = () => {
  const fica = x => !x.uid || (M.jogadores || []).some(j => j.uid === x.uid && j.estilo && jogAtivo(j)), sai = muralDe().filter(x => !fica(x));
  if (!sai.length) return toast('Não tem cartaz de quem saiu.');
  confirmar(`Tirar do mural: <b>${sai.map(x => esc(x.nome)).join(', ')}</b>?`, () => { gravarMural(muralDe().filter(fica)); toast('Cartazes tirados.'); }, { ok: 'Tirar' });
};
ACT['mu-limpar-tudo'] = () => confirmar(`Tirar <b>todos os ${muralDe().length} cartazes</b> do mural (jogadores e NPCs)? As recompensas continuam salvas; dá para pregar de novo.`,
  () => { gravarMural([]); toast('Mural limpo.'); }, { perigo: true, ok: 'Limpar' });

/* ───── TIRAR UM JOGADOR DA MESA (vale para todas as abas) ─────
   Tira o e-mail da lista de liberados e põe o uid em "fora": some das Abas dos jogadores, Grupo, luta, Tripulação,
   Recompensas, Mural, Viagem… Os dados ficam guardados (dá para trazer de volta) ou são apagados de vez. */
async function tirarJogador(uid, apagar) {
  const j = (M.jogadoresTodos || []).find(x => x.uid === uid), d = M.membrosDoc || {}, mail = String((j || {}).email || '').toLowerCase();
  try {
    await DB.gravar('config/membros', { emails: (d.emails || []).filter(x => String(x).toLowerCase() !== mail || mail === MESTRE_EMAIL), fora: apagar ? (d.fora || []).filter(x => x !== uid) : [...new Set([...(d.fora || []), uid])] });
    gravarMural(muralDe().filter(x => x.uid !== uid));
    await DB.gravar('mesa/recompensas', { [uid]: APAGAR }).catch(() => {});
    const c = (M.trip || {}).capitao; if (c && c.tipo === 'jogador' && c.uid === uid) await DB.gravar('mesa/tripulacao', { capitao: APAGAR }).catch(() => {});
    if (apagar) { await DB.apagar(`jogadores/${uid}/privado/notas`).catch(() => {}); await DB.apagar('jogadores/' + uid).catch(() => {}); }
  } catch (e) { return toast('Não deu: ' + esc(e.code || e.message), { tipo: 'ruim' }); }
  if (Espiar.uid === uid) { if (Espiar.parar) Espiar.parar(); Espiar.uid = null; Espiar.parar = null; }
  Store.set(s => { const ids = new Set(s.party.filter(p => p.uid === uid).map(p => p.id)); s.party = s.party.filter(p => !ids.has(p.id)); s.combate.lista = s.combate.lista.filter(c => !ids.has(c.pcId)); },
    `Saiu da mesa: ${j ? nomeJ(j) : 'jogador'}`, { semDesfazer: true });
  toast(`<b>${esc(j ? nomeJ(j) : 'Jogador')}</b> saiu da mesa${apagar ? ' e os dados foram apagados' : ''}. Não aparece mais em nenhuma aba.`, { tipo: 'bom', tempo: 6000 });
  App.render();
}
ACT['jog-tirar'] = el => {
  const uid = el.dataset.uid, j = (M.jogadoresTodos || []).find(x => x.uid === uid); if (!j) return toast('Não achei esse jogador no banco.');
  Modal.abrir(`<h2>Tirar ${esc(nomeJ(j))} da mesa?</h2>
    <p>Some de <b>todas as abas</b>: Abas dos jogadores, Grupo, luta, Tripulação, Recompensas, Mural e Viagem. A pessoa não entra mais como jogador${String(j.email || '').toLowerCase() === MESTRE_EMAIL ? ' (é a sua própria conta: você continua entrando como mestre)' : ''}.</p>
    <div class="linha-bts"><button class="bt" data-act="jog-tirar-ok" data-uid="${uid}">Só tirar (guarda a ficha e o diário)</button>
      <button class="bt ruim" data-act="jog-tirar-ok" data-uid="${uid}" data-apagar="1">Tirar e apagar tudo dele</button><button class="bt fino" data-act="modal-fechar">Cancelar</button></div>
    <p class="nota">“Só tirar”: dá para trazer de volta em Ajustes › Jogadores liberados. “Apagar tudo”: não dá para desfazer.</p>`);
};
ACT['jog-tirar-ok'] = el => { Modal.fechar(); tirarJogador(el.dataset.uid, !!el.dataset.apagar); };
ACT['jog-voltar'] = async el => {
  const uid = el.dataset.uid, j = (M.jogadoresTodos || []).find(x => x.uid === uid), d = M.membrosDoc || {}, mail = String((j || {}).email || '').toLowerCase(); if (!j) return;
  const emails = (d.emails || []).slice(); if (mail && mail !== MESTRE_EMAIL && !emails.map(x => String(x).toLowerCase()).includes(mail)) emails.push(mail);
  if (emails.length > 5) return toast('A mesa já tem 5 jogadores. Tire alguém antes.', { tipo: 'ruim' });
  await DB.gravar('config/membros', { emails, fora: (d.fora || []).filter(x => x !== uid) }).catch(x => toast(esc(x.code || x.message), { tipo: 'ruim' }));
  toast(`<b>${esc(nomeJ(j))}</b> voltou para a mesa.`, { tipo: 'bom' });
};
