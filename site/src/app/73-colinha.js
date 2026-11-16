/* ═══════════ COLINHA DO MESTRE ═══════════
   Uma página para quando bate a dúvida no meio da sessão: como o XP anda, como a recompensa sobe
   e umas rolagens rápidas. Tudo que é do livro tem página; o que é da nossa mesa vem marcado. */
const Colinha = { res: null };

function colinhaTabela(titulo) {   // pega uma tabela de um cartão do Escudo (mesma fonte que já está na mesa)
  for (const s of (window.ESCUDO || [])) for (const c of s.cartoes) if (c.titulo === titulo) { const b = c.blocos.find(x => x.table); if (b) return b.table; }
  return null;
}

VIEWS.colinha = {
  titulo: 'Colinha do mestre', icone: 'modos:anotar',
  render() {
    const s = S(), pcs = pcsMesa(s);
    const barras = pcs.map(p => { const xp = xpNoArco(s, p.id), tam = tamBarra(s, p.sheet.nivel); return { nome: nomePC(p), xp, tam, cheia: xp >= tam }; });
        return `<section class="colinha">
      <header class="col-cab"><h1>${ic('modos:anotar', 64)}Colinha do mestre</h1>
        <p class="nota">Para quando der branco no meio da sessão. O que é do livro tem a página. O que é combinado da nossa mesa vem com a etiqueta <span class="col-tag">da mesa</span>.</p></header>

      ${roteiroHTML()}

      <article class="pap col-bloco">
        <h2>${ic('poderes:subir_nivel', 32)} Como o grupo sobe de nível</h2>
        <div class="col-fluxo">
          <div class="col-passo"><b>Fecharam um arco</b><small>ou mini-arco, ou fizeram um grande feito</small><span class="col-seta">→</span><p class="col-fim">+1 nível para todo mundo</p><small class="col-pg">GN p. 120–121</small></div>
          <div class="col-passo"><b>Venceram um encontro que não estava planejado</b><small>Rei dos Mares, pirata ou Marinha que caiu no dado, briga que nasceu de uma escolha deles</small><span class="col-seta">→</span>
            <p class="col-fim">o XP vai para a Barra de Bônus de cada um. Barra cheia: <b>+1 nível extra</b> no próximo arco fechado (no máximo 1 por arco)</p><small class="col-pg">LJ p. 13 · GN p. 120 · <span class="col-tag">da mesa</span></small></div>
          <div class="col-passo"><b>Cumpriram uma etapa</b><small>um objetivo, um lugar, um segredo, um destino</small><span class="col-seta">→</span><p class="col-fim">um prêmio, não nível: descanso curto na hora, 1 Dado de Vida ou alguns PP, ou recuperar usos</p><small class="col-pg">GN p. 120–121</small></div>
        </div>
        <h3>Na prática, depois de uma luta improvisada</h3>
        <ol class="col-ol"><li>Na aba <b>Encontro</b>, toque em <b>Registrar vitória</b>. O site soma o XP das criaturas e divide entre os jogadores.</li>
          <li>Na <b>Barra de Bônus</b>, veja quem encheu.</li><li>No fim do arco, toque em <b>Fechar o arco</b>: todos sobem 1, e quem encheu a barra sobe mais 1.</li></ol>
        <p class="nota">Quanto rende uma luta, por jogador (grupo de 4, nível 3): fácil ~75 · média ~150 · difícil ~225 · mortal ~400 XP. No nível 3 a barra enche com uns 8 encontros difíceis. <small>GN p. 45</small></p>
        <div class="col-status"><b>Arco atual:</b> ${esc(s.xp.arco)}${barras.length ? ` · ${barras.map(x => `<span class="${x.cheia ? 'cheia' : ''}">${esc(x.nome)} ${Math.min(100, Math.round(100 * x.xp / Math.max(1, x.tam)))}%</span>`).join(' · ')}` : ' · conecte as fichas na Mesa para ver as barras'}</div>
        <div class="linha-bts"><button class="bt" data-rota="barra">${ic('poderes:subir_nivel', 32)} Barra de Bônus</button><button class="bt" data-rota="encontro">${ic('mesa:d20', 32)} Montar encontro</button><button class="bt" data-rota="recompensas">${ic('trip:manchetes', 32)} Recompensa e renome</button></div>
      </article>

      ${ndTabelaHTML()}

      <article class="pap col-bloco">
        <h2>${ic('mesa:d20', 32)} Sorteios e ideias</h2>
        <p class="nota">Nomes, pessoas prontas, conflitos, encontro no mar, tesouro e as ideias do Guia do Narrador ficam num lugar só: <b>Escudo de lore › Rápido</b>.</p>
        <div class="linha-bts"><button class="bt ouro" data-act="el-ir-rapido">${ic('mesa:d20', 32)} Abrir os sorteios</button></div>
      </article>
    </section>`;
  }
};

ACT['col-rolar'] = el => {
  const d = n => 1 + Math.floor(Math.random() * n), t = el.dataset.t;
  if (t === 'nome') {
    const tab = colinhaTabela('Nomes rápidos'), g = +el.dataset.g, n = d(6);
    Colinha.res = tab ? { rot: `${tab[0][g]} · d6 = ${n} · dica de mesa`, t: tab[n][g] } : null;
  } else if (t === 'mar') {
    const n = d(10), e = ENCONTRO_MAR[n];
    Colinha.res = { rot: `Encontro marítimo · d10 = ${n} · GN p. 66`, t: e.n, x: e.t, i: e.i };
  } else if (t === 'tesouro') {
    const n = d(100), e = tesouroDe(n);
    Colinha.res = { rot: `Tesouro · d100 = ${n} · GN p. 82`, t: e[1], i: e[2] };
  }
  Som.tocar('dado'); App.render();
};

/* ───── roteiro da sessão: Antes / Durante / Depois ─────
   Cada item leva direto para o lugar certo. O mestre marca o que já fez; as marcas são por sessão
   (mudou o número da sessão no topo, o roteiro começa limpo) e ficam só neste aparelho. */
const ROTEIRO = {
  antes: ['Antes da sessão', [
    ['arquivos', 'Subir as músicas, efeitos e imagens da sessão'], ['mundo', 'Montar a ilha: NPCs, o que os jogadores já sabem, o que fica trancado'],
    ['encontro', 'Preparar os inimigos e os encontros que você já sabe que vêm'], ['lojas', 'Montar a loja da ilha (se tiver)'],
    ['jornal', 'Escrever o jornal que abre a sessão'], ['colinha', 'Rolar umas ideias de PdN e complicação para o improviso']]],
  durante: ['Durante', [
    ['mesa', 'Abrir a Mesa, escolher a música e mostrar a imagem do lugar'], ['mesa', 'Liberar as abas que eles já podem ver (Comando › Liberar)'],
    ['viagem', 'No mar: um Teste de Navegação por dia de viagem'], ['combate', 'Luta: Combate › rolar iniciativa'],
    ['encontro', 'Venceram algo improvisado: Encontro › Registrar vitória'], ['tesouro', 'Achou tesouro: Tesouro › mostrar e entregar para alguém']]],
  depois: ['Depois', [
    ['barra', 'Conferir a Barra de Bônus de cada um'], ['barra', 'Acabou o arco? Fechar o arco (todos sobem de nível)'],
    ['bordo', 'Resumir a sessão no Diário de bordo'], ['recompensas', 'Atualizar os cartazes de procurado'],
    ['mesa', 'Clicar no título lá em cima e começar a próxima sessão']]]
};
function roteiroHTML() {
  const fase = lembrar('roteiro-fase') || 'antes', n = sessaoInfo().n;
  let feitos = {}; try { feitos = JSON.parse(lembrar('roteiro-' + n) || '{}'); } catch (e) {}
  const [titulo, itens] = ROTEIRO[fase], feitosFase = itens.filter((_, i) => feitos[fase + i]).length;
  return `<article class="pap col-bloco rot">
    <h2>${ic('modos:capitao', 32)} Roteiro da sessão ${n}</h2>
    <div class="rot-abas">${Object.entries(ROTEIRO).map(([k, [t, L]]) => { const f = L.filter((_, i) => feitos[k + i]).length;
      return `<button class="chip ${k === fase ? 'on' : ''}" data-act="rot-fase" data-f="${k}">${t} <small>${f}/${L.length}</small></button>`; }).join('')}</div>
    <ol class="rot-l">${itens.map(([rota, txt], i) => `<li class="${feitos[fase + i] ? 'feito' : ''}">
      <button class="rot-ck" data-act="rot-marcar" data-k="${fase + i}" aria-pressed="${!!feitos[fase + i]}" title="Marcar como feito">${feitos[fase + i] ? '✔' : ''}</button>
      <span>${esc(txt)}</span>${VIEWS[rota] && rota !== 'colinha' ? `<button class="bt fino" data-rota="${rota}">Ir</button>` : ''}</li>`).join('')}</ol>
    <p class="nota">${feitosFase === itens.length ? 'Tudo feito nesta parte.' : 'Marque o que já fez. As marcas valem para esta sessão e ficam só neste aparelho.'}</p>
  </article>`;
}
ACT['rot-fase'] = el => { lembrar('roteiro-fase', el.dataset.f); App.render(); };
ACT['rot-marcar'] = el => {
  const n = sessaoInfo().n; let f = {}; try { f = JSON.parse(lembrar('roteiro-' + n) || '{}'); } catch (e) {}
  f[el.dataset.k] = !f[el.dataset.k]; lembrar('roteiro-' + n, JSON.stringify(f)); App.render();
};

/* ───── Quanto de ND posso pôr? (GN p. 45–46 e p. 49) ─────
   Usa a mesma conta do Encontro (dificuldade()): limites de XP do grupo × multiplicador.
   Linha = nível do grupo; colunas = em que ND um chefe fica Fácil, Médio, Difícil ou Mortal. */
const NDT = { n: null, cap: 0, capNd: '1' };
function ndTabelaHTML() {
  const s = S(), pcs = pcsMesa(s);
  const n = NDT.n || clamp(pcs.length || 2, 1, 5);
  const nivMed = pcs.length ? Math.round(pcs.reduce((a, p) => a + (+p.sheet.nivel || 1), 0) / pcs.length) : null;
  const nds = Object.keys(ND_XP).filter(k => k !== '0').sort((a, b) => ND_XP[a] - ND_XP[b]);
  const cats = ['Fácil', 'Médio', 'Difícil', 'Mortal'];
  const faixa = L => !L.length ? '—' : L.length === 1 ? L[0] : `${L[0]} a ${L[L.length - 1]}`;
  const linhas = [];
  for (let nv = 1; nv <= 20; nv++) {
    const por = { 'Fácil': [], 'Médio': [], 'Difícil': [], 'Mortal': [] };
    nds.forEach(nd => {
      const itens = [{ xp: ND_XP[nd], qtd: 1 }]; if (NDT.cap) itens.push({ xp: ND_XP[NDT.capNd] || 0, qtd: NDT.cap });
      const d = dificuldade(Array(n).fill(nv), itens); if (por[d.nivel]) por[d.nivel].push(nd);
    });
    const mortal = por['Mortal'].length ? por['Mortal'][0] + '+' : '—';
    linhas.push(`<tr class="${nv === nivMed ? 'on' : ''}"><th>${nv}</th><td>${faixa(por['Fácil'])}</td><td>${faixa(por['Médio'])}</td><td><b>${faixa(por['Difícil'])}</b></td><td>${mortal}</td></tr>`);
  }
  return `<article class="pap col-bloco ndt">
    <h2>${ic('tesouro:espada', 32)} Quanto de ND posso pôr?</h2>
    <p class="nota">ND do <b>chefe</b> contra o grupo, por nível. ND não é "igual a um jogador": ND igual ao nível é um desafio razoável para o grupo <b>todo</b> (GN, Criando criaturas). Mesma conta do Encontro (GN p. 45–46).</p>
    <div class="ndt-ctl">
      <span>Pessoas no grupo:</span><div class="chips" role="group" aria-label="Pessoas no grupo">${[1, 2, 3, 4, 5].map(k => `<button class="chip ${k === n ? 'on' : ''}" data-act="ndt-n" data-n="${k}">${k}</button>`).join('')}</div>
      <label>Capangas junto <select data-chg="ndt-cap" aria-label="Capangas junto">${[0, 1, 2, 3, 4, 6].map(k => `<option value="${k}" ${k === NDT.cap ? 'selected' : ''}>${k ? k : 'nenhum'}</option>`).join('')}</select></label>
      ${NDT.cap ? `<label>ND de cada capanga <select data-chg="ndt-capnd" aria-label="ND de cada capanga">${nds.slice(0, 10).map(k => `<option ${k === NDT.capNd ? 'selected' : ''}>${k}</option>`).join('')}</select></label>` : ''}
    </div>
    <div class="ndt-tab"><table class="tab"><thead><tr><th>Nível</th><th>Fácil</th><th>Médio</th><th>Difícil</th><th>Mortal</th></tr></thead><tbody>${linhas.join('')}</tbody></table></div>
    <ul class="col-ol">
      <li>Conte o aliado do mestre (ex.: Gen) como pessoa do grupo <b>se ele lutar</b>.</li>
      <li>Menos de 3 pessoas: o chefe pesa mais (multiplicador ×1,5 em vez de ×1). 5 pessoas: pesa menos (×0,5).</li>
      <li>Com capangas, o multiplicador sobe (2 inimigos ×1,5; 3 a 6 ×2) e o chefe tem que <b>descer</b> de ND. Escolha acima para ver.</li>
      <li>O livro deixa ignorar capanga muito mais fraco que o chefe, se ele quase não muda a luta (GN p. 45).</li>
      <li>ND acima do nível pode derrubar alguém com uma ação só; Haki do Rei no chefe deixa tudo mais difícil do que a tabela mostra (GN p. 46).</li>
    </ul>
    <div class="linha-bts"><button class="bt" data-rota="encontro">${ic('mesa:d20', 32)} Conta exata no Encontro</button></div>
  </article>`;
}
ACT['ndt-n'] = el => { NDT.n = +el.dataset.n; App.render(); };
ACT['ndt-cap'] = el => { NDT.cap = +el.value; App.render(); };
ACT['ndt-capnd'] = el => { NDT.capNd = el.value; App.render(); };
