/* ═══════════ DIÁRIO DA SESSÃO ═══════════ */
VIEWS.diario = {
  titulo: 'Diário da sessão', icone: 'status:notas',
  render() {
    const s = S(), d = s.diario.filter(x => x.sessao === s.sessao);
    return `<section class="diario"><div class="bx-cab"><div><h1>${ic('status:notas', 64)}Diário · sessão ${s.sessao}</h1><p class="nota">Tudo que acontece no site entra aqui sozinho. Escreva as suas notas também.</p></div><span class="lampiao" aria-hidden="true">${anim('lampiao', 1, { dur: 1.1 })}</span>
      <div class="linha-bts"><button class="bt" data-act="di-resumo">${ic('tesouro:livro', 32)}Copiar resumo</button><button class="bt ouro" data-act="di-nova">Nova sessão</button></div></div>
      <div class="di-nota"><label class="sr" for="di-txt">Nota</label><textarea id="di-txt" rows="2" placeholder="Anote algo (Enter salva, Shift+Enter quebra a linha)"></textarea><button class="bt bom" data-act="di-add">Anotar</button></div>
      <ol class="di-lista">${d.length ? d.slice().reverse().map(x => `<li class="${x.tipo}"><small>${hora(x.t)}</small><span>${esc(x.txt)}</span></li>`).join('') : '<li class="vazio-li">Nada ainda nesta sessão.</li>'}</ol></section>`;
  },
  depois(r) { const t = r.querySelector('#di-txt'); if (t) t.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ACT['di-add'](); } }); }
};
ACT['di-add'] = () => { const t = $('#di-txt'), v = t.value.trim(); if (!v) return; Store.set(() => {}, v, { tipo: 'nota' }); };
ACT['di-nova'] = () => confirmar(`Começar a sessão ${S().sessao + 1}? (O diário desta fica guardado.)`, () => Store.set(s => { s.sessao++; s.combate.log = []; }, 'Começou a sessão'));
ACT['di-resumo'] = () => {
  const s = S(), d = s.diario.filter(x => x.sessao === s.sessao);
  const txt = `Sessão ${s.sessao} · arco ${s.xp.arco}\n` + d.map(x => `${hora(x.t)} ${x.tipo === 'nota' ? '★ ' : ''}${x.txt}`).join('\n');
  Modal.abrir(`<h2>Resumo da sessão ${s.sessao}</h2><textarea id="res-txt" rows="14" class="cheio">${esc(txt)}</textarea><button class="bt" data-act="copiar" data-alvo="res-txt">Copiar</button>`, { classe: 'larga' });
};

/* ═══════════ AJUSTES: fichas, diagnóstico, regras da casa, cópia de segurança ═══════════ */
VIEWS.ajustes = {
  titulo: 'Ajustes', icone: 'status:ajustes',
  render() {
    const s = S();
    return `<section class="ajustes"><h1>${ic('status:ajustes', 64)}Ajustes</h1>
      <div class="aj-grade">
      <section class="cartao-aj"><h2>Fichas dos jogadores</h2>
        ${IN_CLAUDE ? '<p class="aviso-via">Esta é a prévia dentro do Claude: aqui o Google é bloqueado, então use os arquivos .xlsx. No arquivo .html baixado, o link funciona.</p>' : ''}
        <ul class="aj-pcs">${s.party.filter(p => !p.pdm).map(p => `<li>${retratoHTML(p.live && p.live.retrato, nomePC(p), 64)}<div><b>${esc(nomePC(p))}</b>
          <small>${p.origem ? `${p.origem === 'link' ? 'link do Google' : p.origem === 'demo' ? 'exemplo' : 'arquivo .xlsx'} · ${p.lidoEm ? 'lida às ' + hora(p.lidoEm) : ''}` : 'sem ficha'}</small>
          ${p.sync && p.sync.falhas && p.sync.falhas.length ? `<details><summary>${p.sync.falhas.length} pedaço(s) não vieram</summary><ul class="nota">${p.sync.falhas.map(f => `<li>${esc(f)}</li>`).join('')}</ul></details>` : ''}
          ${p.sync && p.sync.estado === 'erro' ? `<small class="ruim">${esc(p.sync.msg)}</small>` : ''}
          ${p.sheet ? `<details class="aj-lido"><summary>O que veio da ficha${p.sync && p.sync.pedidos ? ` (${p.sync.pedidos} pedidos ao Google)` : ''}</summary>
            <table class="tab">${resumoFicha(p.sheet).map(([k, v]) => `<tr><td>${esc(k)}</td><td>${/^(nenhum|nenhuma|vazio)$/.test(String(v)) ? `<b class="ruim">${esc(v)}</b>` : esc(v)}</td></tr>`).join('')}</table>
            <p class="nota">Se algo que está preenchido no Docs aparecer como “nenhum”, leia de novo; se continuar, use o arquivo .xlsx e me mande print.</p></details>` : ''}</div>
          <button class="bt fino" data-act="pc-editar" data-id="${p.id}">Editar</button></li>`).join('') || '<li class="nota">Ninguém ainda.</li>'}</ul>
        <div class="linha-bts"><button class="bt" data-act="pc-novo">+ Jogador</button>${s.party.some(p => p.link) ? '<button class="bt" data-act="sync-todos">Ler todas pelo link</button>' : ''}</div>
        <label class="check"><input type="checkbox" data-chg="aj-auto" ${s.config.autoSync ? 'checked' : ''}> Reler as fichas sozinho a cada 5 minutos (só com link)</label>
        <details class="nota"><summary>Como deixar a ficha pronta para o link</summary><ol><li>Na ficha: Compartilhar › Acesso geral › “Qualquer pessoa com o link” › Leitor.</li><li>Copie o link e cole aqui, em Editar.</li><li>Se der erro, use o arquivo: Arquivo › Fazer download › Microsoft Excel (.xlsx).</li></ol></details></section>
      <section class="cartao-aj"><h2>Regras da casa</h2><ul class="casa">${s.config.casa.map((r, i) => `<li><textarea rows="2" data-chg="aj-casa" data-i="${i}" aria-label="Regra ${i + 1}">${esc(r)}</textarea><button class="link" data-act="aj-casa-tirar" data-i="${i}">tirar</button></li>`).join('')}</ul>
        <button class="bt fino" data-act="aj-casa-add">+ Regra</button></section>
      <section class="cartao-aj"><h2>O que os jogadores enxergam</h2>${(Cat.ctl = true, catControleMestre())}</section>
      <section class="cartao-aj"><h2>Cópia de segurança</h2><p>Tudo fica salvo neste navegador. Para levar para outro aparelho, copie o código e cole lá.</p>
        <div class="linha-bts"><button class="bt bom" data-act="aj-baixar">Baixar arquivo de backup</button><label class="bt" for="aj-arq">Abrir arquivo de backup</label><input id="aj-arq" type="file" accept=".json,application/json" class="sr" data-chg="aj-arq"></div>
        <p class="nota">Faça um backup antes de cada atualização do site. O arquivo guarda o controle do mestre (jogadores, combate, XP, diário, tesouros). Ilhas, lojas e jornal ficam no banco online.</p>
        <div class="linha-bts"><button class="bt" data-act="aj-exportar">Copiar tudo</button><button class="bt" data-act="aj-importar">Colar de outro aparelho</button></div>
        <div class="linha-bts"><button class="bt ruim fino" data-act="aj-zerar">Apagar tudo</button></div></section>
      <section class="cartao-aj"><h2>Atalhos</h2><ul class="atalhos"><li><kbd>D</kbd> bandeja de dados</li><li><kbd>N</kbd> próximo turno</li><li><kbd>1</kbd>–<kbd>9</kbd> trocar de aba</li><li><kbd>Ctrl</kbd>+<kbd>Z</kbd> desfazer</li><li><kbd>Esc</kbd> fechar janela</li></ul>
        <p class="nota">Regras: Livro do Jogador 2.1, Guia do Narrador 2.0 e Manual dos Inimigos (prévia 2.0) do OP RPG. Ficha 2.0 do Lucco.</p></section>
      </div></section>`;
  }
};
ACT['aj-auto'] = el => Store.set(s => { s.config.autoSync = el.checked; }, null, { semDesfazer: true });
ACT['aj-casa'] = el => Store.set(s => { s.config.casa[+el.dataset.i] = el.value; }, null, { semDesfazer: true });
ACT['aj-casa-add'] = () => Store.set(s => { s.config.casa.push('Nova regra'); }, null);
ACT['aj-casa-tirar'] = el => Store.set(s => { s.config.casa.splice(+el.dataset.i, 1); }, null);
ACT['aj-exportar'] = () => Modal.abrir(`<h2>Copiar tudo</h2><p>Copie o código abaixo e guarde (ou cole no outro aparelho em “Colar de outro aparelho”).</p><textarea id="exp-txt" rows="10" class="cheio" readonly>${esc(JSON.stringify(S()))}</textarea><button class="bt" data-act="copiar" data-alvo="exp-txt">Copiar</button>`, { classe: 'larga' });
ACT['aj-importar'] = () => Modal.abrir(`<h2>Colar de outro aparelho</h2><p>Cole o código. <b>Isso substitui tudo o que está aqui.</b></p><textarea id="imp-txt" rows="10" class="cheio"></textarea><button class="bt bom" data-act="aj-importar-ok">Usar este código</button>`, { classe: 'larga' });
ACT['aj-baixar'] = () => {
  const d = new Date(), dt = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}_${String(d.getHours()).padStart(2, '0')}h${String(d.getMinutes()).padStart(2, '0')}`;
  const url = URL.createObjectURL(new Blob([JSON.stringify(S(), null, 1)], { type: 'application/json' })), a = document.createElement('a');
  a.href = url; a.download = `mesa-one-piece-backup_${dt}.json`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
  toast('Backup baixado. Guarde o arquivo numa pasta sua.', { tipo: 'bom' });
};
ACT['aj-arq'] = async el => {
  const f = el.files && el.files[0]; if (!f) return; el.value = '';
  let d; try { d = JSON.parse(await f.text()); if (!d || !Array.isArray(d.party)) throw new Error(); } catch (e) { return toast('Esse arquivo não é um backup da Mesa.', { tipo: 'ruim' }); }
  const quando = d.salvoEm ? new Date(d.salvoEm).toLocaleString('pt-BR') : 'data desconhecida';
  confirmar(`Voltar para o backup de <b>${esc(quando)}</b>, com ${d.party.length} jogador(es)? <b>Isso substitui o controle atual.</b> Dá para desfazer com Ctrl+Z logo em seguida.`,
    () => Store.set(s => { Object.keys(s).forEach(k => delete s[k]); Object.assign(s, estadoInicial(), d); }, 'Backup restaurado'), { perigo: true, ok: 'Restaurar' });
};
ACT['aj-importar-ok'] = () => {
  try { const d = JSON.parse($('#imp-txt').value); if (!d || !d.party) throw new Error(); Store.set(s => { Object.keys(s).forEach(k => delete s[k]); Object.assign(s, estadoInicial(), d); }, 'Dados importados'); Modal.fechar(); toast('Pronto: dados importados.', { tipo: 'bom' }); }
  catch (e) { toast('Esse código não é um backup válido.', { tipo: 'ruim' }); }
};
ACT['aj-zerar'] = () => confirmar('Apagar tudo (jogadores, combate, diário, tesouros)? Dá para desfazer com Ctrl+Z logo em seguida.', () => Store.set(s => { const n = estadoInicial(); Object.keys(s).forEach(k => delete s[k]); Object.assign(s, n); }, null), { perigo: true, ok: 'Apagar tudo' });

/* ═══════════ TELA DOS JOGADORES (#jogadores) ═══════════ */
const Tela = {
  base: '', ultimo: null, timer: null,
  render() {
    const s = S(), cb = s.combate, raiz = $('#tela'); if (!raiz) return;
    if (!raiz.dataset.pronta) {
      raiz.dataset.pronta = '1';
      raiz.innerHTML = `<div class="tl-amb" aria-hidden="true">${gaivota(1)}${gaivota(1, 'tarde')}</div><div class="tl-base"></div><div class="tl-dest-box" aria-live="polite"></div>`;
    }
    const cena = cb.ativo ? 'conves' : (s.tela.cena || 'abertura');
    raiz.className = 'tela-jog c-' + cena;
    const pcs = s.party.filter(p => p.sheet && naMesa(p));
    let corpo = '';
    if (cb.ativo) {
      const ord = ordem(s), atual = ord[cb.vez];
      corpo = `<div class="tl-rodada">Rodada <b>${cb.rodada}</b> · vez de <b>${atual ? esc(cbInfo(s, atual).nome) : '—'}</b></div>
        <ol class="tl-ordem">${ord.map(c => { const inf = cbInfo(s, c), vez = atual && c.id === atual.id;
          const vePV = inf.pc && !inf.inimigo, estado = vePV ? `${inf.pv}/${inf.pvMax} PV` : estadoNPC(inf.pv, inf.pvMax);
          return `<li class="${vez ? 'vez' : ''} ${inf.fora ? 'fora' : ''} ${vePV ? 'pc' : 'npc'}"><span class="token">${retratoHTML(inf.retrato, inf.nome, 64)}</span>
            <b>${esc(inf.nome)}</b>${vePV ? barra(Math.max(0, inf.pv), inf.pvMax, 'pv') : ''}<small>${estado}</small><span class="mini-conds">${(inf.conds || []).map(x => `<span class="cond-cl" role="button" tabindex="0" data-act="cond-info" data-n="${esc(x.n)}" title="${esc(x.n + ': ' + ((CONDI[x.n] || {}).r || ''))}">${ic((CONDI[x.n] || {}).i, 32)}</span>`).join('')}</span></li>`; }).join('')}</ol>`;
    } else {
      corpo = `<div class="tl-grupo">${pcs.map(p => { const k = calc(p); return `<article>${retratoHTML(p.live.retrato, nomePC(p), 128)}<h2>${esc(nomePC(p))}</h2>
        ${barra(Math.max(0, k.pv), k.pvMax, 'pv')}<p>${k.pv}/${k.pvMax} PV · ${k.pp}/${k.ppMax} PP</p><div class="mini-conds">${(p.live.conds || []).map(x => `<span class="cond-cl" role="button" tabindex="0" data-act="cond-info" data-n="${esc(x.n)}" title="${esc(x.n + ': ' + ((CONDI[x.n] || {}).r || ''))}">${ic((CONDI[x.n] || {}).i, 32)}</span>`).join('')}</div></article>`; }).join('')}</div>`;
    }
    /* só redesenha o que mudou: assim a bandeira e as animações não recomeçam a cada 4 segundos */
    const base = `<header class="tl-topo">${anim('bandeira', 1)}<h1>${esc(s.xp.arco)}</h1><span>Sessão ${s.sessao}</span></header>${corpo}`;
    if (base !== this.base) { this.base = base; raiz.querySelector('.tl-base').innerHTML = base; }
    const m = s.tela.mostrar, chave = m ? m.tipo + m.t : '';
    if (chave === this.ultimo) return;
    const primeira = this.ultimo === null; this.ultimo = chave;
    const recente = m && Date.now() - m.t < (primeira ? 20000 : 120000);
    let destaque = '';
    if (recente && m.tipo === 'tesouro') { const t = tesouroDe(m.n); destaque = `${anim('bau', 3, { umaVez: true, dur: 1.1 })}<h2>${esc(t[1])}</h2>`; }
    if (recente && m.tipo === 'mar') { const e = ENCONTRO_MAR[m.n]; destaque = `${m.n === 8 ? anim('rei', 3, { umaVez: true, dur: 1.6 }) : ic(e.i, 128)}<h2>${esc(e.n)}</h2>`; }
    if (recente && m.tipo === 'nav') destaque = `${anim('bussola', 2, { umaVez: true, dur: 1.2 })}<h2>${m.passou ? 'Rota segura' : 'Problemas à vista…'}</h2>`;
    if (recente && m.tipo === 'clima' && s.viagem.clima) { const c = clima(s.viagem.clima.t, s.viagem.clima.v, s.viagem.clima.c); destaque = `${ic(c.icone, 128)}<h2>Vento ${c.vento.toLowerCase()} · chuva ${c.chuva.toLowerCase()}</h2>`; }
    if (recente && m.tipo === 'dado') destaque = `<p class="tl-dado">${esc(m.txt)}</p><h2 class="tl-total">${m.total}</h2>`;
    if (recente && m.tipo === 'combate') destaque = `${anim('canhao', 3, { umaVez: true, dur: 0.9 })}<h2>Combate!</h2>`;
    const box = raiz.querySelector('.tl-dest-box'); clearTimeout(this.timer);
    box.innerHTML = destaque ? `<div class="tl-destaque">${destaque}</div>` : '';
    if (destaque) this.timer = setTimeout(() => { const d = box.querySelector('.tl-destaque'); if (d) { d.classList.add('sai'); setTimeout(() => d.remove(), 1000); } }, 9000);
  }
};
