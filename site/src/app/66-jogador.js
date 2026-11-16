/* ═══════════ aba do jogador: ficha pelo link, foto, vida, inventário, diário pessoal, lore, profissão e diário do capitão ═══════════ */
const sem = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
/* profissão → ícone, capa do diário, fundo e nome do diário */
const PROF_INFO = {
  adestrador: ['prof:adestrador', 'capas1:adestrador', 'p_adestrador', 'Caderno do Adestrador'], arqueologo: ['prof:arqueologo', 'capas1:arqueologo', 'p_arqueologo', 'Diário de Escavação'],
  botanico: ['prof:botanico', 'capas1:botanico', 'p_botanico', 'Herbário'], 'cacador de recompensas': ['prof:cacador', 'capas1:cacador', 'p_cacador', 'Caderno de Caça'],
  carpinteiro: ['prof:carpinteiro', 'capas1:carpinteiro', 'p_generico', 'Caderno do Carpinteiro'], cientista: ['prof:cientista', 'capas1:cientista', 'p_generico', 'Caderno de Laboratório'],
  contrabandista: ['prof:contrabandista', 'capas1:contrabandista', 'p_contrabandista', 'Livro-Caixa Secreto'], cozinheiro: ['poderes:cozinheiro', 'capas1:cozinheiro', 'p_cozinheiro', 'Livro de Receitas'],
  engenheiro: ['prof:engenheiro', 'capas1:engenheiro', 'p_generico', 'Caderno de Projetos'], espiao: ['prof:espiao', 'capas1:espiao', 'p_espiao', 'Dossiê'],
  farmaceutico: ['prof:farmaceutico', 'capas1:farmaceutico', 'p_farmaceutico', 'Livro de Fórmulas'], ferreiro: ['poderes:ferreiro', 'capas1:ferreiro', 'p_ferreiro', 'Caderno de Forja'],
  informante: ['prof:informante', 'capas1:informante', 'p_informante', 'Caderninho de Contatos'], inventor: ['prof:inventor', 'capas1:inventor', 'p_generico', 'Caderno de Invenções'],
  jornalista: ['prof:jornalista', 'capas1:jornalista', 'p_jornalista', 'Bloco de Reportagens'], medico: ['poderes:medico', 'capas1:medico', 'p_medico', 'Prontuário do Médico'],
  musico: ['prof:musico', 'capas2:musico', 'p_musico', 'Livro de Partituras'], navegador: ['poderes:navegador', 'capas2:navegador', 'p_navegador', 'Diário de Navegação'],
  psiquiatra: ['prof:psiquiatra', 'capas2:psiquiatra', 'p_psiquiatra', 'Caderno de Sessões'], timoneiro: ['prof:timoneiro', 'capas2:timoneiro', 'p_timoneiro', 'Diário do Timoneiro']
};
function profDe(ficha) {
  const txt = sem(ficha && ficha.profissao); if (!txt) return [];
  return Object.keys(PROF_INFO).filter(k => txt.includes(k.split(' ')[0])).map(k => ({ k, nome: Object.keys(window.PROFS || {}).find(n => sem(n) === k) || k, info: PROF_INFO[k] }));
}
/* gastos das profissões que o livro define (LJ p. 143–154 e 247; resumo no Escudo) */
const GASTOS = {
  medico: [{ t: 'Tratar Ferimentos', kit: /kit(s)? m[eé]dico/i, kitNome: 'Kit médico', dado: '1d4', fonte: 'LJ p. 153' },
    { t: 'Paramedicina', kit: /primeiros socorros/i, kitNome: 'Kit de primeiros socorros', dado: '1d4', fonte: 'LJ p. 153' },
    { t: 'Tratar doença comum', kit: /kit(s)? m[eé]dico/i, kitNome: 'Kit médico', dado: '1d4', beli: 30000, fonte: 'LJ p. 154', nota: '1d4 + 1 dias de tratamento' }],
  cozinheiro: [{ t: 'Refeição do Chef (1 prato)', kit: /tempero/i, kitNome: 'Kit de temperos', dado: '1d4', beli: 3000, fonte: 'LJ p. 144' }],
  ferreiro: [{ t: 'Forjar ou aprimorar (uso)', kit: /lingote/i, kitNome: 'Lingote', fixo: 1, beli: 20000, fonte: 'LJ p. 149 e 247', nota: 'ou 20% do preço do item, o que for maior' }]
};
const DESCONTO = g => /gr[aã]o/i.test(g || '') ? 0.5 : /mestre/i.test(g || '') ? 0.2 : /especialista/i.test(g || '') ? 0.1 : 0;   // LJ p. 131–132
const minhaFicha = () => fichaDe(eu());
function meuVivo() { const f = minhaFicha(); return Object.assign(f ? vivoNovo(f) : { pv: 0, pp: 0, conds: [], hd: {}, exa: 0 }, eu().vivo || {}); }
const gravarEu = patch => DB.gravar('jogadores/' + alvoUid(), patch).catch(e => { toast('Não deu para salvar: ' + esc(e.code || e.message), { tipo: 'ruim' }); throw e; });
const notas = () => M.privado || {};
const gravarNotas = patch => DB.gravar(`jogadores/${alvoUid()}/privado/notas`, patch).catch(e => toast('Não deu para salvar: ' + esc(e.code || e.message), { tipo: 'ruim' }));
const meuEstilo = () => eu().estilo || Eu.estilo || 'logpose';
const inv = () => Object.assign({ beli: null, itens: [], log: [] }, eu().inv || {});
const pesoTotal = i => (i.itens || []).reduce((a, x) => a + (num(x.peso) || 0) * (num(x.qtd) || 0), 0);
const barrinha = (v, max, cls = '') => `<span class="barra ${cls}"><i style="width:${max ? clamp(100 * v / max, 0, 100) : 0}%"></i></span>`;

/* rolar e confirmar conforme o estilo: Engrenagem faz na hora, Log Pose pergunta, Timão só mostra */
function conformeEstilo(msg, fazer) { const e = meuEstilo(); if (e === 'engrenagem') return fazer(); confirmar(msg, fazer, { titulo: 'Confirmar', ok: 'Fazer' }); }

VIEWS.personagem = {
  titulo: 'Personagem', icone: 'modos:mochila', chaves: ['jogadores', 'privado', 'estado', 'capDiario', 'capPriv', 'trip', 'lojas'],
  aba: lembrar('aba-j') || 'ficha',
  ao(ch) { const a = document.activeElement; if (a && /TEXTAREA|INPUT|SELECT/.test(a.tagName) && $('#vista').contains(a)) { this.pendente = true; return false; } },
  render() {
    const j = eu(), f = minhaFicha(), L = meuVivo(), cap = noComando(), of = capitaoOficial(), souCap = of && of.tipo === 'jogador' && of.uid === alvoUid(), noLeme = cap && cap.tipo === 'jogador' && cap.uid === alvoUid();
    const abas = [['ficha', 'Ficha', 'modos:regras'], ['inventario', 'Inventário', 'modos:mochila'], ['diario', 'Diário', 'mesa:diario'], ['lore', 'Lore', 'modos:lore_pdf'], ['profissao', 'Profissão', profDe(f)[0] ? profDe(f)[0].info[0] : 'mesa:cadeado'], ['navegacao', 'Navegação', 'modos:logpose']]
      .concat(souCap || (alvoUid() === Eu.uid && (M.capPriv || []).length) ? [['capitao', 'Diário do capitão', 'modos:capitao']] : []);
    if (!abas.some(a => a[0] === this.aba)) this.aba = 'ficha';
    const pvMax = f && f.pv ? f.pv.max : null, ppMax = f && f.pp ? f.pp.max : null;
    return `<div class="jg">
      <header class="jg-cab">
        <button class="jg-foto" data-act="jg-foto" title="Trocar foto">${fotoJ(j, 96)}<small>trocar foto</small></button>
        <div class="jg-quem"><h1>${esc(nomeJ(j))}</h1>
          <p>${esc([j.nome, f && f.nivel ? 'Nível ' + f.nivel : '', f && f.especie, f && f.estilo, f && f.profissao].filter(Boolean).join(' · '))}</p>
          <p class="jg-tags"><span class="tag" title="Seu estilo de jogo">${ic(ESTILOS[meuEstilo()].icone, 32)} ${ESTILOS[meuEstilo()].nome}</span>${f && f.recompensa ? `<span class="tag">${ic('trip:recompensa_total', 32)} ฿ ${fmt((M.recompensas || {})[Eu.uid] ?? f.recompensa)}</span>` : ''}${souCap ? `<span class="tag ouro">${ic('modos:capitao', 32)} capitão do bando</span>` : ''}${noLeme && !souCap ? `<span class="tag">${ic('modos:capitao', 32)} no leme agora</span>` : ''}</p></div>
        <div class="jg-vitais">
          <div class="vt"><b><i class="at-ic pv"></i>PV</b>${blocos(L.pv, pvMax, 'pv', { act: 'jg-vida-set' })}<span>${L.pv == null ? '—' : (pvMax ? Math.min(L.pv, pvMax) : L.pv)}${pvMax ? '/' + pvMax : ''}${L.temp ? ` (+${L.temp})` : ''}</span><button class="bt-ic mini" data-act="jg-vida" data-k="pv" data-d="-1" aria-label="Menos PV">−</button><button class="bt-ic mini" data-act="jg-vida" data-k="pv" data-d="1" aria-label="Mais PV">+</button></div>
          <div class="vt"><b><i class="at-ic pp"></i>PP</b>${blocos(L.pp, ppMax, 'pp', { act: 'jg-vida-set' })}<span>${L.pp ?? '—'}${ppMax ? '/' + ppMax : ''}</span><button class="bt-ic mini" data-act="jg-vida" data-k="pp" data-d="-1" aria-label="Menos PP">−</button><button class="bt-ic mini" data-act="jg-vida" data-k="pp" data-d="1" aria-label="Mais PP">+</button></div>
          ${(L.conds || []).length || L.exa ? `<p class="jg-conds">${(L.conds || []).map(c => `<span class="tag cond-cl" role="button" tabindex="0" data-act="cond-info" data-n="${esc(c.n)}" title="${esc((CONDI[c.n] || {}).r || '')} (toque para ler tudo)">${ic((CONDI[c.n] || {}).i || 'cond2:critico', 32)} ${esc(c.n)}</span>`).join('')}${L.exa ? `<span class="tag ruim">Exaustão ${L.exa}</span>` : ''}</p>` : ''}
          ${L.morto ? '<p class="tag ruim">Morto</p>' : ''}
        </div>
      </header>
      <nav class="abas jg-abas" role="tablist">${abas.map(([k, t, i]) => `<button role="tab" aria-selected="${this.aba === k}" class="aba ${this.aba === k ? 'on' : ''}" data-act="jg-aba" data-a="${k}">${ic(i, 32, k === 'profissao' && !profDe(f).length ? 'silhueta' : '')}<span>${t}</span></button>`).join('')}</nav>
      <div class="jg-corpo">${JOG[this.aba](j, f, L)}</div></div>`;
  }
};
document.addEventListener('focusout', () => { const v = VIEWS[App.rota]; if (v && v.pendente) { v.pendente = false; setTimeout(() => { if (!/TEXTAREA|INPUT|SELECT/.test((document.activeElement || {}).tagName || '')) App.render(); }, 400); } });

const JOG = {
  ficha(j, f) {
    const st = j.fichaEm ? `Lida em ${new Date(j.fichaEm).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}${j.fichaFalhas ? ` · ${j.fichaFalhas} pedaço(s) não leram` : ''}` : 'Ainda não lida.';
    let corpo = '';
    if (f) {
      const pseudo = { id: Eu.uid, uid: Eu.uid, apelido: nomeJ(j), sheet: f, live: meuVivo() };
      corpo = fichaHTML(pseudo).replace(/data-act="pc-ficha"/g, 'data-act="jg-ficha-aba"').replace(/data-act="pc-tec"/g, 'data-act="jg-tec"');
      if (meuEstilo() === 'timao') corpo = corpo.replace(/<button class="bt azul fino" data-act="jg-tec"[^>]*>[^<]*<\/button>/g, '');
    }
    return `<section class="jg-sec"><h2>${ic('modos:regras', 32)} Ficha</h2>
      <div class="linha-bts"><input id="jg-link" class="cresce" placeholder="Link da planilha (docs.google.com/spreadsheets/d/…)" value="${esc(j.link || '')}" data-enter="jg-atualizar">
        <button class="bt bom" data-act="jg-atualizar">${ic('modos:ampulheta', 32)} Atualizar ficha</button><button class="bt fino" data-act="jg-xlsx">Enviar .xlsx</button>${TESTE ? '<button class="bt fino" data-act="jg-demo">Usar ficha de exemplo</button>' : ''}</div>
      <p class="nota" id="jg-status">${st}</p>
      ${!f ? `<div class="jg-ajuda">${ic('modos:selo', 64)}<ol><li>Na planilha da ficha 2.0, toque em <b>Compartilhar</b>.</li><li>Em "Acesso geral", escolha <b>Qualquer pessoa com o link</b> como <b>Leitor</b>.</li><li>Copie o link, cole aqui e toque em <b>Atualizar ficha</b>.</li></ol><p class="nota">A ficha continua sendo editada no Google. Depois de mudar algo lá, volte e toque em Atualizar ficha.</p></div>` : `<div class="jg-ficha">${corpo}</div>`}
    </section>`;
  },
  inventario(j, f) {
    const i = inv(), peso = pesoTotal(i), max = f ? num(f.cargaMax) : null, beli = i.beli ?? (f ? num(f.dinheiro) : 0) ?? 0, est = meuEstilo();
    return `<section class="jg-sec inv">
      <div class="inv-topo">
        <div class="carteira">${ic('itensop:beli_moedas', 64)}<div><p class="rot">Carteira</p>${est === 'timao' ? `<input id="inv-beli" type="number" value="${beli}" data-chg="inv-beli" style="width:9em">` : `<p class="beli">฿ ${fmt(beli)}</p>`}</div></div>
        <div class="inv-mov"><input id="inv-valor" type="number" min="0" step="100" placeholder="Valor ฿" style="width:8em"><input id="inv-motivo" placeholder="Motivo (ex.: kit médico)" class="cresce" maxlength="60">
          <button class="bt bom fino" data-act="inv-mov" data-s="1">Ganhar</button><button class="bt ruim fino" data-act="inv-mov" data-s="-1">Gastar</button></div>
        <div class="carga">${ic('status:carga', 32)}<span>Carga</span>${barrinha(peso, max, max && peso > max ? 'ruim' : '')}<b>${String(Math.round(peso * 10) / 10).replace('.', ',')}${max ? ' / ' + max : ''} kg</b>${max && peso > max && est !== 'timao' ? '<small class="ruim">acima da carga: veja Sobrecarga de peso com o mestre</small>' : ''}</div>
      </div>
      <h3>Itens</h3>
      ${i.itens.length ? `<ul class="inv-l">${i.itens.map(x => `<li><span class="inv-ic">${x.ic ? ic(x.ic, 48) : ic('itens:mochila', 48)}</span><div><b>${esc(x.nome)}</b>${x.nota ? `<small>${esc(x.nota)}</small>` : ''}${x.resgate ? `<button class="bt ouro fino inv-resg" data-act="inv-resgatar" data-id="${x.id}">${ic('itensop:beli_moedas', 20)} Resgatar ฿ ${fmt(x.resgate * (x.qtd || 1))}</button>` : ''}${x.valor && lojaAberta() ? `<button class="bt bom fino inv-resg" data-act="inv-vender" data-id="${x.id}">${ic('itensop:beli_notas', 20)} Vender na loja por ฿ ${fmt(x.valor)}</button>` : ''}</div>
          <span class="inv-peso">${x.peso ? String(x.peso).replace('.', ',') + ' kg' : ''}</span>
          <div class="inv-q"><button class="bt-ic mini" data-act="inv-q" data-id="${x.id}" data-d="-1" aria-label="Menos">−</button><b>${x.qtd}</b><button class="bt-ic mini" data-act="inv-q" data-id="${x.id}" data-d="1" aria-label="Mais">+</button></div>
          <button class="bt-ic mini" data-act="inv-tirar" data-id="${x.id}" aria-label="Tirar ${esc(x.nome)}">×</button></li>`).join('')}</ul>` : '<p class="nota">Mochila vazia. Adicione itens ou importe da ficha.</p>'}
      <div class="inv-add"><button class="bt-ic" data-act="inv-ic" id="inv-ic-bt" title="Ícone do item">${ic(this.icNovo || 'itens:mochila', 32)}</button><input id="inv-nome" placeholder="Nome do item" class="cresce" maxlength="50" data-enter="inv-add">
        <label>Qtd <input id="inv-qtd" type="number" min="1" value="1" style="width:4em"></label><label>kg <input id="inv-peso" type="number" min="0" step="0.1" value="0" style="width:5em"></label>
        <input id="inv-nota" placeholder="Nota (opcional)" maxlength="80"><button class="bt" data-act="inv-add">Adicionar</button></div>
      <div class="linha-bts">${f ? '<button class="bt fino" data-act="inv-importar">Importar armas e dinheiro da ficha</button>' : ''}${lojaAberta() ? `<button class="bt bom" data-act="loja-entrar">${iconeHTML(lojaAberta().icone, 32)} Entrar na loja: ${esc(lojaAberta().nome)}</button>` : ''}${souMestre() || verCatalogo() ? `<button class="bt fino" data-act="inv-precos">${ic('itensop:beli_notas', 32)} Preços do livro</button>` : ''}</div>
      ${i.log.length ? `<h3>Gastos e ganhos</h3><ol class="inv-log">${i.log.slice(0, 25).map(l => `<li><span class="${l.v < 0 ? 'ruim' : 'bom'}">${l.v < 0 ? '−' : '+'}฿ ${fmt(Math.abs(l.v))}</span> ${esc(l.txt)} <time>${new Date(l.em).toLocaleDateString('pt-BR')}</time></li>`).join('')}</ol>` : ''}
    </section>`;
  },
  diario(j, f) {
    const p = profDe(f)[0], capa = p ? p.info[1] : 'capas2:caderno', tit = p ? p.info[3] : 'Diário de Bordo Pessoal', d = notas().diario || [];
    return `<section class="jg-sec diario">
      <header class="di-cab">${ic(capa, 128)}<div><h2>${MANIFEST.anims.diario ? anim('diario', 0.6, { umaVez: true, dur: 1.2 }) : ''} ${esc(tit)}</h2><p class="nota">Só você e o mestre leem este diário. O diário de bordo da tripulação fica na aba Diário de bordo.</p>${d.length ? `<button class="bt fino" data-act="jd-pdf">${ic('modos:lore_pdf', 32)} Baixar em PDF</button>` : ''}</div></header>
      <div class="di-nova"><input id="di-tit" placeholder="Título (opcional)" maxlength="80"><textarea id="di-txt" rows="4" placeholder="O que aconteceu, o que você pensou, o que quer lembrar…"></textarea>
        <button class="bt bom" data-act="jd-add">${MANIFEST.anims.pena ? anim('pena', 0.5) : ''} Escrever no diário</button></div>
      ${d.length ? `<ol class="di-l">${d.map(e => `<li><header><b>${esc(e.titulo || 'Sem título')}</b><time>${esc(e.dia || '')} · ${new Date(e.em).toLocaleDateString('pt-BR')}</time>
          <span><button class="link" data-act="jd-editar" data-id="${e.id}">editar</button> · <button class="link" data-act="jd-tirar" data-id="${e.id}">apagar</button></span></header><p class="pre">${esc(e.txt)}</p></li>`).join('')}</ol>` : '<p class="nota">Nenhuma página escrita ainda.</p>'}
    </section>`;
  },
  lore() {
    const n = notas(), L = n.lore || {}, pdf = n.pdf, miro = miroEmbed(n.miro || '');
    const campos = [['origem', 'Origem', 'Onde nasceu, como cresceu, o que marcou.'], ['lacos', 'Família e laços', 'Quem importa, quem deve, quem odeia.'], ['sonho', 'Sonho e objetivo', 'Por que entrou no mar.'],
      ['segredos', 'Segredos (só o mestre vê)', 'O que o grupo ainda não sabe.'], ['livre', 'Anotações livres', 'Ideias, cenas, frases.']];
    return `<section class="jg-sec lore">
      <h2>${ic('modos:lore_pdf', 32)} Lore</h2><p class="nota">Monte a história aqui mesmo, anexe um PDF ou ligue um quadro do Miro. Tudo fica salvo e só você e o mestre veem.</p>
      <div class="lore-campos">${campos.map(([k, t, ph]) => `<label class="campo"><span>${t}</span><textarea id="lore-${k}" rows="4" placeholder="${ph}" data-chg="lore" data-k="${k}">${esc(L[k] || '')}</textarea></label>`).join('')}</div>
      ${(n.loreMud || []).length ? `<details class="lore-mud"><summary>Mudanças na lore (${n.loreMud.length})</summary><ol>${n.loreMud.slice(0, 30).map(m => `<li><time>${new Date(m.em).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</time> <b>${esc(m.campo)}</b>: ${esc(m.txt)}</li>`).join('')}</ol></details>` : ''}
      <h3>${ic('modos:lore_pdf', 32)} Lore em PDF</h3>
      ${pdf ? `<div class="pdf-c"><p><b>${esc(pdf.nome)}</b> · ${pdf.paginas} página(s) · enviado em ${new Date(pdf.em).toLocaleDateString('pt-BR')} <button class="link" data-act="pdf-abrir">abrir</button></p>
        ${pdf.resumo && pdf.resumo.length ? `<h4>Resumo leve</h4><ul>${pdf.resumo.map(r => `<li>${esc(r)}</li>`).join('')}</ul>` : ''}
        ${pdf.titulos && pdf.titulos.length ? `<h4>Partes</h4><p class="chips">${pdf.titulos.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</p>` : ''}
        ${pdf.mud ? `<h4>O que mudou desde o PDF anterior</h4><p class="nota">${pdf.mud.novos.length} trecho(s) novo(s) · ${pdf.mud.saiu} trecho(s) que saíram.</p>${pdf.mud.novos.length ? `<ul>${pdf.mud.novos.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}` : ''}</div>` : '<p class="nota">Nenhum PDF ainda. O site lê o texto, faz um resumo leve e, quando você trocar o PDF, mostra o que mudou.</p>'}
      <div class="linha-bts"><button class="bt" data-act="pdf-enviar">${pdf ? 'Trocar PDF' : 'Enviar PDF'}</button>${pdf ? '<button class="bt fino" data-act="pdf-tirar">Tirar PDF</button>' : ''}</div>
      <h3>${ic('modos:quadro', 32)} Quadro do Miro</h3>
      <div class="linha-bts"><input id="miro-link" class="cresce" placeholder="Link do quadro (miro.com/app/board/…)" value="${esc(n.miro || '')}"><button class="bt fino" data-act="miro-salvar">Salvar</button>${n.miro ? `<a class="bt fino" href="${esc(n.miro)}" target="_blank" rel="noopener">Abrir no Miro</a>` : ''}</div>
      ${miro ? `<div class="miro"><iframe src="${esc(miro)}" title="Quadro do Miro" allow="fullscreen; clipboard-read; clipboard-write" allowfullscreen loading="lazy"></iframe></div><p class="nota">Se aparecer em branco, no Miro abra Compartilhar e deixe "qualquer pessoa com o link pode ver".</p>` : ''}
    </section>`;
  },
  profissao(j, f) {
    const ps = profDe(f);
    if (!ps.length) return `<section class="jg-sec tela-trancada">${ic('mesa:cadeado', 128)}<h2>Profissão trancada</h2><p>Quando sua ficha tiver uma profissão, esta aba abre com os testes, as ferramentas e os gastos dela.</p></section>`;
    return ps.map(p => {
      const d = (window.PROFS || {})[p.nome] || {}, g = f.graduacao || 'Profissional', desc = DESCONTO(g);
      const cartao = ((window.ESCUDO || []).find(s => s.id === 'profissoes') || { cartoes: [] }).cartoes.find(c => sem(c.titulo) === sem(p.nome));
      const grad = ((window.ESCUDO || []).find(s => s.id === 'profissoes') || { cartoes: [] }).cartoes.find(c => /gradua/i.test(c.titulo));
      const gastos = GASTOS[p.k] || [];
      const an = { cozinheiro: 'panela', ferreiro: 'bigorna', medico: 'medico', navegador: 'mapa' }[p.k];
      return `<section class="jg-sec prof">
        <header class="prof-cab c-${p.info[2]}"><div>${an && MANIFEST.anims[an] ? anim(an, 1) : ic(p.info[0], 64)}<div><h2>${esc(p.nome)}</h2><p>${esc(g)}${desc ? ` · desconto de ${desc * 100}% nos preços da profissão` : ''}</p></div></div></header>
        ${d.testes ? `<div class="prof-b"><h3>Testes da profissão</h3><p>${esc(d.testes)}</p><p class="nota">Teste da profissão soma a Proficiência mesmo com outro atributo. <small>LJ p. 132–133</small></p></div>` : ''}
        ${d.ferramentas ? `<div class="prof-b"><h3>Benefícios do primeiro nível</h3><p><b>Perícias:</b> ${esc(d.pericias)}</p><p><b>Ferramentas:</b> ${esc(d.ferramentas)}</p><p class="nota"><small>LJ p. 133–134</small></p></div>` : ''}
        ${p.k === 'navegador' ? navegadorHTML(f) : ''}
        ${gastos.length ? `<div class="prof-b"><h3>Gastos</h3><ul class="gastos">${gastos.map((x, i) => `<li><span><b>${esc(x.t)}</b>: ${[x.dado ? `${x.dado} ${x.kitNome}` : x.fixo ? `${x.fixo} ${x.kitNome}` : '', x.beli ? `฿ ${fmt(Math.round(x.beli * (1 - desc)))}` : ''].filter(Boolean).join(' + ')}${x.nota ? ` (${esc(x.nota)})` : ''} <small>${x.fonte}</small></span>
          ${meuEstilo() !== 'timao' ? `<button class="bt fino" data-act="prof-gasto" data-p="${p.k}" data-i="${i}">Usar</button>` : ''}</li>`).join('')}</ul>
          <p class="nota">${meuEstilo() === 'engrenagem' ? 'Engrenagem: rola os kits e desconta do inventário e da carteira na hora.' : meuEstilo() === 'logpose' ? 'Log Pose: mostra a conta e pede confirmação antes de descontar.' : 'Timão: desconte você mesmo no inventário.'}</p></div>` : ''}
        ${cartao ? `<div class="prof-b">${cartaoEscudoHTML(cartao)}</div>` : ''}
        ${grad ? `<details class="prof-b"><summary>Graduação: Profissional → Especialista → Mestre → Grão-Mestre</summary>${cartaoEscudoHTML(grad)}</details>` : ''}
      </section>`;
    }).join('');
  },
  capitao() {
    const L = M.capDiario || [];
    return `<section class="jg-sec diario">
      <header class="di-cab">${ic('capas2:capitao', 128)}<div><h2>Diário do capitão</h2><p class="nota">O capitão do bando escreve aqui. Todo mundo lê na aba Diário de bordo. Quem só está no leme de passagem não escreve neste diário.</p></div></header>
      <div class="di-nova"><textarea id="cap-txt" rows="4" placeholder="Rumo, decisões, o que a tripulação precisa saber…"></textarea><button class="bt bom" data-act="cap-add">Registrar</button></div>
      ${L.length ? `<ol class="di-l">${L.map(e => `<li><header><b>${esc(e.autor || '')}</b><time>${esc(e.dia || '')}</time></header><p class="pre">${esc(e.txt)}</p></li>`).join('')}</ol>` : '<p class="nota">Nenhum registro ainda.</p>'}
    </section>`;
  }
};
/* aba Navegação da ficha: qualquer um pode ter que rolar (o navegador, ou quem estiver no leme sem navegador).
   O mar vem do mestre (mesa/estado.mar); o jogador só troca se quiser ver outra CD. GN p. 65 · LJ p. 156 */
JOG.navegacao = function (j, f) {
  const mar = JOG.mar || marChave((M.estado || {}).mar), cd = CD_MAR[mar] || 15;
  const ehNav = f && /navegador|timoneiro/i.test(f.profissao || '');
  const bSab = f ? attrMod(f, 'SAB') + (num(f.prof) || 0) : 0, bVon = f ? attrMod(f, 'VON') : 0;
  return `<section class="jg-sec nav-sec">
    <header class="nav-cab">${MANIFEST.anims.bussola ? anim('bussola', 2, { dur: 1.6 }) : ic('modos:logpose', 128)}
      <div><h2>Teste de Navegação</h2><p class="nota">O Log Pose aponta para a próxima ilha. A cada dia de viagem, quem guia o navio rola contra a CD do mar. Se ninguém do bando for navegador, quem está no leme rola com Vontade e com desvantagem.</p></div></header>
    <div class="nav-mar-l"><label>Mar <select id="nav-mar" data-chg="nav-mar">${Object.keys(CD_MAR).map(m => `<option ${m === mar ? 'selected' : ''}>${m}</option>`).join('')}</select></label><span class="nav-cd">CD <b>${cd}</b></span>
      ${(M.estado || {}).mar && !JOG.mar ? '<small class="nota">o mar que o mestre marcou</small>' : ''}</div>
    ${f ? `<div class="nav-ops">
      <button class="nav-op ${ehNav ? 'sug' : ''}" data-act="nav-rolar">${ic('modos:logpose', 32)}<b>Sou navegador ou timoneiro</b><small>Sabedoria + Proficiência (${sg(bSab)})</small></button>
      <button class="nav-op ${ehNav ? '' : 'sug'}" data-act="nav-rolar-von">${ic('modos:timao', 32)}<b>Estou no leme sem navegador</b><small>Vontade (${sg(bVon)}), com desvantagem, sem proficiência</small></button></div>`
      : '<p class="nota">Conecte sua ficha para rolar daqui.</p>'}
    <ul class="nav-regras"><li><b>Passou:</b> o navio segue o rumo certo.</li><li><b>Falhou:</b> o mestre rola 1d10 em Encontros Marítimos.</li><li>Com terra à vista, ninguém se perde.</li></ul>
    <p class="nota"><small>GN p. 65 · LJ p. 156</small></p></section>`;
};
function navegadorHTML(f) {
  const b = attrMod(f, 'SAB') + (num(f.prof) || 0), mar = JOG.mar || marChave((M.estado || {}).mar);
  return `<div class="prof-b"><h3>${ic('modos:logpose', 32)} Teste de Navegação</h3>
    <div class="linha-bts"><select id="nav-mar" data-chg="nav-mar">${Object.keys(CD_MAR).map(m => `<option ${m === mar ? 'selected' : ''}>${m}</option>`).join('')}</select>
      <b>CD ${CD_MAR[mar]}</b><button class="bt bom" data-act="nav-rolar">Rolar Sabedoria + Proficiência (${sg(b)})</button></div>
    <p class="nota">Falhou: o mestre rola 1d10 em Encontros Marítimos. Com terra à vista ninguém se perde. <small>GN p. 65 · LJ p. 156</small></p></div>`;
}
/* cartão do Escudo (mesmo formato do escudo: linhas com ##, -, ! e tabelas) */
function cartaoEscudoHTML(c) {
  const inl = t => esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  const bloco = b => {
    if (b.t) { let h = '', ul = false; const fecha = () => { if (ul) { h += '</ul>'; ul = false; } };
      b.t.forEach(l => { if (l.startsWith('## ')) { fecha(); h += `<h4>${inl(l.slice(3))}</h4>`; } else if (l.startsWith('- ')) { if (!ul) { h += '<ul>'; ul = true; } h += `<li>${inl(l.slice(2))}</li>`; } else if (l.startsWith('! ')) { fecha(); h += `<p class="destaque">${inl(l.slice(2))}</p>`; } else { fecha(); h += `<p>${inl(l)}</p>`; } });
      fecha(); return h; }
    if (b.table) return `<div class="tab-rola"><table class="tab"><tr>${b.table[0].map(v => `<th>${inl(v)}</th>`).join('')}</tr>${b.table.slice(1).map(r => r.length === 1 && typeof r[0] === 'object' ? `<tr><td colspan="${b.table[0].length}"><b>${esc(r[0].text)}</b></td></tr>` : `<tr>${r.map(v => `<td>${inl(v)}</td>`).join('')}</tr>`).join('')}</table></div>`;
    if (b.chips) return `<p class="chips">${b.chips.map(x => `<span class="tag">${esc(x)}</span>`).join('')}</p>`;
    if (b.twocol) return `<div class="duas-col">${b.twocol.map(col => `<ul>${col.map(l => `<li>${inl(l)}</li>`).join('')}</ul>`).join('')}</div>`;
    return '';
  };
  return `<h3>${esc(c.titulo)}</h3>${c.blocos.map(bloco).join('')}${c.fonte ? `<p class="nota"><small>Fonte: ${esc(c.fonte)}</small></p>` : ''}`;
}
const miroEmbed = url => { const m = String(url || '').match(/miro\.com\/app\/(?:board|live-embed)\/([^/?#]+)/); return m ? `https://miro.com/app/live-embed/${m[1]}/?autoplay=yep` : null; };

/* ───── ações: ficha e vida ───── */
ACT['jg-aba'] = el => { VIEWS.personagem.aba = el.dataset.a; lembrar('aba-j', el.dataset.a); App.render(); };
ACT['jg-ficha-aba'] = el => { abaFicha = el.dataset.aba || 'resumo'; App.render(); };
ACT['jg-atualizar'] = async () => {
  const link = (($('#jg-link') || {}).value || eu().link || '').trim(), st = $('#jg-status');
  if (!link) return toast('Cole o link da planilha primeiro.', { tipo: 'ruim' });
  if (st) st.textContent = 'Lendo a ficha…';
  try {
    const r = await lerLink(link, (a, b) => { if (st) st.textContent = `Lendo a ficha… ${Math.round(100 * a / b)}%`; });
    await salvarFicha(parseFicha(r.raw), link, r.falhas.length);
  } catch (e) { if (st) st.textContent = e.message; toast(esc(e.message), { tipo: 'ruim', tempo: 8000 }); }
};
async function salvarFicha(f, link, falhas = 0) {
  const j = eu(), patch = { fichaJson: JSON.stringify(f), fichaEm: Date.now(), fichaFalhas: falhas, personagem: f.personagem || j.personagem || '' };
  if (link !== undefined) patch.link = link;
  if (!j.vivo) { patch.vivo = limpo(vivoNovo(f)); patch.vivoEm = Date.now(); }
  await gravarEu(patch); Som.tocar('moeda'); toast(`Ficha de <b>${esc(f.personagem || 'personagem')}</b> atualizada.`, { tipo: 'bom' });
}
ACT['jg-xlsx'] = () => escolherArquivos('.xlsx', false, async fs => { try { await salvarFicha(parseFicha(await lerXlsx(await fs[0].arrayBuffer())), undefined); } catch (e) { toast(esc(e.message), { tipo: 'ruim', tempo: 8000 }); } });
ACT['jg-demo'] = () => salvarFicha(parseFicha(window.DEMO), '');
/* clicar num bloco põe o valor ali; clicar de novo no último bloco cheio tira um bloco */
ACT['jg-vida-set'] = el => {
  const L = meuVivo(), k = el.dataset.k, alvo = +el.dataset.v, atual = num(L[k]) || 0;
  const per = el.parentElement ? (el.parentElement.children.length ? Math.ceil(alvo / ([...el.parentElement.children].indexOf(el) + 1)) : 1) : 1;
  const v = atual === alvo ? Math.max(0, alvo - per) : alvo;
  gravarEu({ vivo: { [k]: v }, vivoEm: Date.now() });
};
ACT['jg-vida'] = el => {
  const L = meuVivo(), k = el.dataset.k, f = minhaFicha(), max = k === 'pv' ? f && f.pv.max : f && f.pp.max;
  const v = clamp((num(L[k]) || 0) + +el.dataset.d, k === 'pv' ? -999 : 0, max || 999);
  gravarEu({ vivo: { [k]: v }, vivoEm: Date.now() });
};
ACT['jg-tec'] = el => {
  const L = meuVivo(), custo = +el.dataset.pp || 0, grau = parseInt(String(el.dataset.grau).replace(/\D/g, ''), 10) || 0, nome = el.dataset.nome;
  const usar = () => {
    if (L.pp >= custo) { gravarEu({ vivo: { pp: L.pp - custo }, vivoEm: Date.now() }); toast(`${esc(nome)}: −${custo} PP.`); return; }
    if (!grau) return toast('PP insuficiente. Técnica auxiliar não pode usar Sobrecarga: só as Técnicas de Combate têm grau (LJ p. 36–37).', { tipo: 'ruim', tempo: 7000 });
    if (grau >= 6 || (L.exa || 0) + grau > 5) return toast('Sem PP, e a Sobrecarga passaria do 5º nível de exaustão. Não dá para usar. (LJ p. 36–37)', { tipo: 'ruim', tempo: 7000 });
    confirmar(`Sem PP suficiente. Usar por <b>Sobrecarga</b> e ganhar ${grau} de exaustão? (LJ p. 36–37)`, () => gravarEu({ vivo: { exa: (L.exa || 0) + grau }, vivoEm: Date.now() }), { titulo: 'Sobrecarga', ok: 'Usar', perigo: true });
  };
  if (L.pp >= custo) conformeEstilo(`Usar <b>${esc(nome)}</b> por ${custo} PP?`, usar); else usar();
};
ACT['jg-foto'] = () => {
  Modal.abrir(`<h2>Foto do personagem</h2><p class="nota">Arte comissionada e fotos aparecem como são, sem pixelar.</p>
    <div class="linha-bts"><button class="bt bom" data-act="foto-enviar">${ic('mesa:imagem', 32)} Enviar imagem</button><button class="bt" data-act="foto-ic">Escolher um retrato</button>${eu().foto ? '<button class="bt fino" data-act="foto-tirar">Tirar foto</button>' : ''}</div>
    <label class="campo"><span>Ou cole o link de uma imagem</span><input id="foto-url" placeholder="https://…" data-enter="foto-url"></label><button class="bt fino" data-act="foto-url">Usar link</button>`);
};
ACT['foto-enviar'] = () => escolherArquivos('image/*', false, async fs => { Modal.fechar(); const antiga = (eu().foto || {}).arq; const [i] = await enviarArquivos(fs, 'foto'); if (i) { await gravarEu({ foto: { arq: i.id } }); if (antiga) Arquivos.apagar(antiga).catch(() => {}); } });
ACT['foto-ic'] = () => escolherIcone(['retratos', ...FOLHAS_ROSTOS, 'npcs', 'especies', 'especies2'], ref => gravarEu({ foto: { ic: ref } }));
ACT['foto-url'] = () => { const u = ($('#foto-url').value || '').trim(); if (!/^https?:\/\//.test(u)) return toast('Cole um link que comece com https://'); Modal.fechar(); gravarEu({ foto: { url: u } }); };
ACT['foto-tirar'] = () => { Modal.fechar(); const a = (eu().foto || {}).arq; gravarEu({ foto: APAGAR }); if (a) Arquivos.apagar(a).catch(() => {}); };

/* ───── inventário ───── */
const gravarInv = (i, log) => { if (log) i.log = [{ em: Date.now(), ...log }, ...(i.log || [])].slice(0, 80); return gravarEu({ inv: limpo(i) }); };
ACT['inv-beli'] = el => { const i = inv(); i.beli = num(el.value) || 0; gravarInv(i); };
ACT['inv-mov'] = el => {
  const v = Math.abs(num($('#inv-valor').value) || 0), s = +el.dataset.s, motivo = $('#inv-motivo').value.trim() || (s > 0 ? 'Ganho' : 'Gasto'); if (!v) return toast('Escreva o valor.');
  const i = inv(), f = minhaFicha(), atual = i.beli ?? (f ? num(f.dinheiro) : 0) ?? 0;
  if (s < 0 && v > atual && meuEstilo() !== 'timao') return toast(`Não tem ฿ ${fmt(v)} na carteira (tem ฿ ${fmt(atual)}).`, { tipo: 'ruim' });
  const fazer = () => { i.beli = atual + s * v; gravarInv(i, { v: s * v, txt: motivo }); Som.tocar('moeda'); toastBeli(s * v, motivo); };
  if (s < 0) conformeEstilo(`Gastar <b>฿ ${fmt(v)}</b> com ${esc(motivo)}?`, fazer); else fazer();
};
ACT['inv-ic'] = () => escolherIcone(['itens', 'itensop', 'tesouro', 'navios'], ref => { JOG.icNovo = ref; const b = $('#inv-ic-bt'); if (b) b.innerHTML = ic(ref, 32); });
ACT['inv-add'] = () => {
  const nome = $('#inv-nome').value.trim(); if (!nome) return toast('Escreva o nome do item.');
  const i = inv(); i.itens = [...i.itens, { id: novoId(), nome, qtd: Math.max(1, +$('#inv-qtd').value || 1), peso: num($('#inv-peso').value) || 0, nota: $('#inv-nota').value.trim(), ic: JOG.icNovo || 'itens:mochila' }];
  JOG.icNovo = null; gravarInv(i);
};
ACT['inv-q'] = el => { const i = inv(); const x = i.itens.find(y => y.id === el.dataset.id); if (!x) return; x.qtd = Math.max(0, (num(x.qtd) || 0) + +el.dataset.d); gravarInv(i); };
ACT['inv-tirar'] = el => { const i = inv(), x = i.itens.find(y => y.id === el.dataset.id); confirmar(`Tirar <b>${esc(x ? x.nome : 'item')}</b> do inventário?`, () => { i.itens = i.itens.filter(y => y.id !== el.dataset.id); gravarInv(i); }); };
ACT['inv-importar'] = () => {
  const f = minhaFicha(), i = inv(); if (!f) return;
  const ja = new Set(i.itens.map(x => sem(x.nome)));
  const novos = (f.armas || []).filter(a => a.nome && !ja.has(sem(a.nome))).map(a => ({ id: novoId(), nome: a.nome, qtd: 1, peso: 0, nota: [a.dano, a.tipo].filter(Boolean).join(' · '), ic: /espada|katana|l[aâ]mina/i.test(a.nome + a.tipo) ? 'tesouro:espada' : 'itensop:meito' }));
  i.itens = [...i.itens, ...novos]; if (i.beli == null && f.dinheiro != null) i.beli = num(f.dinheiro);
  gravarInv(i); toast(`${novos.length} arma(s) importada(s)${i.beli != null ? ' e a carteira da ficha' : ''}.`, { tipo: 'bom' });
};
ACT['inv-precos'] = () => { const s = (window.ESCUDO || []).find(x => x.id === 'loja'); Modal.abrir(`<h2>${ic('itensop:beli_notas', 32)} Loja e preços</h2>${s ? s.cartoes.map(c => `<div class="card-esc">${cartaoEscudoHTML(c)}</div>`).join('') : '<p>Sem tabela.</p>'}`, { classe: 'larga' }); };

/* ───── diário pessoal e do capitão ───── */
ACT['jd-add'] = () => {
  const txt = $('#di-txt').value.trim(); if (!txt) return toast('Escreva alguma coisa primeiro.');
  const r = Relogio.agora(), e = { id: novoId(), em: Date.now(), dia: `Dia ${r.dia} · ${r.hh}`, titulo: $('#di-tit').value.trim(), txt };
  $('#di-txt').value = ''; $('#di-tit').value = '';
  gravarNotas({ diario: [e, ...(notas().diario || [])].slice(0, 600) }); Som.tocar('clique');
};
ACT['jd-editar'] = el => {
  const e = (notas().diario || []).find(x => x.id === el.dataset.id); if (!e) return;
  Modal.abrir(`<h2>Editar página</h2><label class="campo"><span>Título</span><input id="die-tit" value="${esc(e.titulo || '')}"></label><label class="campo"><span>Texto</span><textarea id="die-txt" rows="10">${esc(e.txt)}</textarea></label>
    <div class="modal-bts"><button class="bt bom" data-act="jd-salvar" data-id="${e.id}">Salvar</button></div>`);
};
ACT['jd-salvar'] = el => { const d = (notas().diario || []).map(x => x.id === el.dataset.id ? { ...x, titulo: $('#die-tit').value.trim(), txt: $('#die-txt').value } : x); Modal.fechar(); gravarNotas({ diario: d }); };
ACT['jd-tirar'] = el => confirmar('Apagar esta página do diário?', () => gravarNotas({ diario: (notas().diario || []).filter(x => x.id !== el.dataset.id) }), { perigo: true });
ACT['cap-add'] = async () => {
  const txt = $('#cap-txt').value.trim(); if (!txt) return;
  const r = Relogio.agora();
  try { await DB.novo('mesa/capitao/entradas', { txt, autor: nomeJ(eu()), uid: Eu.uid, dia: `Dia ${r.dia} · ${r.hh}`, em: Date.now() }); $('#cap-txt').value = ''; }
  catch (e) { toast('Só o capitão do bando escreve aqui. (' + esc(e.code || e.message) + ')', { tipo: 'ruim' }); }
};

/* ───── lore: campos, PDF e Miro ───── */
ACT['lore'] = el => {
  const k = el.dataset.k, v = el.value, L = notas().lore || {}; if ((L[k] || '') === v) return;
  const nomes = { origem: 'Origem', lacos: 'Família e laços', sonho: 'Sonho', segredos: 'Segredos', livre: 'Anotações' };
  const antes = (L[k] || '').length, txt = !antes ? 'escreveu pela primeira vez' : v.length > antes ? `+${v.length - antes} letras` : `−${antes - v.length} letras`;
  gravarNotas({ lore: { [k]: v }, loreMud: [{ em: Date.now(), campo: nomes[k] || k, txt }, ...(notas().loreMud || [])].slice(0, 60) });
  toast('Lore salva.');
};
ACT['miro-salvar'] = () => { const u = $('#miro-link').value.trim(); if (u && !miroEmbed(u)) return toast('Esse link não parece de um quadro do Miro (miro.com/app/board/…).', { tipo: 'ruim' }); gravarNotas({ miro: u || APAGAR }); };
function carregarPdfJs() {
  if (window.pdfjsLib) return Promise.resolve();
  return new Promise((ok, erro) => {
    const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    s.onload = () => { try { window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'; } catch (e) { /* usa sem worker */ } ok(); };
    s.onerror = () => erro(new Error('Não consegui carregar o leitor de PDF. Confira a internet.')); document.head.appendChild(s);
  });
}
async function lerPdf(blob) {
  await carregarPdfJs();
  const pdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(await blob.arrayBuffer()) }).promise, linhas = [];
  for (let i = 1; i <= Math.min(pdf.numPages, 120); i++) {
    const c = await (await pdf.getPage(i)).getTextContent(); let y0 = null, l = '';
    c.items.forEach(it => { const y = Math.round(it.transform[5]); if (y0 !== null && Math.abs(y - y0) > 2) { linhas.push(l.trim()); l = ''; } l += it.str; y0 = y; });
    linhas.push(l.trim());
  }
  const ls = linhas.filter(Boolean);
  const titulos = ls.filter(l => l.length > 2 && l.length < 60 && (/^(cap[ií]tulo|parte|ato)\b/i.test(l) || /^[0-9IVX]+[.)\-–]\s+\S/.test(l) || (l === l.toUpperCase() && /[A-ZÁÉÍÓÚ]{3}/.test(l)))).slice(0, 30);
  const paras = []; let p = '';
  ls.forEach(l => { p += (p ? ' ' : '') + l; if (/[.!?…"”]$/.test(l) || l.length < 40) { if (p.length > 30) paras.push(p); p = ''; } }); if (p.length > 30) paras.push(p);
  return { paginas: pdf.numPages, titulos, paras, texto: ls.join(' ') };
}
/* resumo leve sem IA: as frases com as palavras que mais se repetem no texto */
function resumir(texto, n = 5) {
  const PARE = new Set('a o as os e de do da dos das em no na nos nas um uma uns umas que se por para com como mas ou ao aos à às é era foi ser ter tinha seu sua seus suas ele ela eles elas isso esse essa este esta mais muito já não sim me te lhe nos vos quando onde porque pois sobre entre até depois antes também só ainda'.split(' '));
  const frases = texto.replace(/\s+/g, ' ').match(/[^.!?…]{25,280}[.!?…]/g) || [];
  if (frases.length <= n) return frases.map(f => f.trim());
  const freq = {}; texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').match(/[a-z]{4,}/g)?.forEach(w => { if (!PARE.has(w)) freq[w] = (freq[w] || 0) + 1; });
  const nota = f => { const ws = f.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').match(/[a-z]{4,}/g) || []; return ws.reduce((a, w) => a + (freq[w] || 0), 0) / Math.max(5, ws.length); };
  return frases.map((f, i) => ({ f: f.trim(), i, s: nota(f) })).sort((a, b) => b.s - a.s).slice(0, n).sort((a, b) => a.i - b.i).map(x => x.f);
}
ACT['pdf-enviar'] = () => escolherArquivos('application/pdf,.pdf', false, async fs => {
  const t = toast('Lendo o PDF…', { tempo: 60000 });
  try {
    const leitura = await lerPdf(fs[0]), velho = notas().pdf;
    const [info] = await enviarArquivos(fs, 'pdf'); if (!info) { if (t) t.remove(); return; }
    const chave = s => sem(s).replace(/[^a-z0-9]/g, '').slice(0, 80), novosP = leitura.paras.map(chave);
    let mud = null;
    if (velho && velho.chaves) { const v = new Set(velho.chaves), nset = new Set(novosP); mud = { novos: leitura.paras.filter((_, i) => !v.has(novosP[i])).slice(0, 8).map(s => s.slice(0, 220)), saiu: velho.chaves.filter(k => !nset.has(k)).length }; }
    await gravarNotas({ pdf: { arq: info.id, nome: info.nome, em: Date.now(), paginas: leitura.paginas, titulos: leitura.titulos, resumo: resumir(leitura.texto, 5), chaves: novosP.slice(0, 400), mud } });
    if (velho && velho.arq && velho.arq !== info.id) Arquivos.apagar(velho.arq).catch(() => {});
    if (t) t.remove(); toast('PDF lido e salvo.', { tipo: 'bom' });
  } catch (e) { if (t) t.remove(); toast(esc(e.message || 'Falhou ao ler o PDF.'), { tipo: 'ruim', tempo: 8000 }); }
});
ACT['pdf-abrir'] = async () => { const p = notas().pdf; if (!p) return; const u = await Arquivos.url(p.arq); if (u) window.open(u, '_blank'); else toast('Não achei o PDF no banco.', { tipo: 'ruim' }); };
ACT['pdf-tirar'] = () => confirmar('Tirar o PDF da lore?', async () => { const p = notas().pdf; await gravarNotas({ pdf: APAGAR }); if (p && p.arq) Arquivos.apagar(p.arq).catch(() => {}); });

/* ───── profissão ───── */
ACT['nav-mar'] = el => { JOG.mar = el.value; App.render(); };
ACT['nav-rolar-von'] = () => { const f = minhaFicha(); if (!f) return; const mar = JOG.mar || marChave((M.estado || {}).mar), b = attrMod(f, 'VON'); rolarPublico(`d20${b >= 0 ? '+' : ''}${b}`, `Navegação (${mar}, CD ${CD_MAR[mar]}) · Vontade, no leme`, { modo: 'desv', forcarD20: true, tipo: 'navegacao', motivo: 'sem navegador: desvantagem, sem proficiência' }); App.ir('mesa'); };
ACT['nav-rolar'] = () => { const f = minhaFicha(), mar = JOG.mar || marChave((M.estado || {}).mar), b = attrMod(f, 'SAB') + (num(f.prof) || 0); rolarPublico(`d20${b >= 0 ? '+' : ''}${b}`, `Navegação (${mar}, CD ${CD_MAR[mar]})`, { forcarD20: true, tipo: 'navegacao' }); App.ir('mesa'); };
ACT['prof-gasto'] = el => {
  const g = (GASTOS[el.dataset.p] || [])[+el.dataset.i]; if (!g) return;
  const f = minhaFicha(), desc = DESCONTO(f && f.graduacao), beli = g.beli ? Math.round(g.beli * (1 - desc)) : 0;
  const qtd = g.dado ? rolar(g.dado).total : (g.fixo || 0), i = inv(), item = g.kit ? i.itens.find(x => g.kit.test(x.nome)) : null;
  const falta = []; if (g.kit && (!item || item.qtd < qtd)) falta.push(`${qtd} × ${g.kitNome} (tem ${item ? item.qtd : 0})`);
  const atual = i.beli ?? num(f && f.dinheiro) ?? 0; if (beli && atual < beli) falta.push(`฿ ${fmt(beli)} (tem ฿ ${fmt(atual)})`);
  const fazer = () => {
    if (item) item.qtd = Math.max(0, item.qtd - qtd);
    if (beli) i.beli = atual - beli;
    gravarInv(i, beli ? { v: -beli, txt: g.t } : null); Som.tocar('moeda'); if (beli) toastBeli(-beli, g.t);
    toast(`${esc(g.t)}: ${g.dado ? `rolou ${qtd} no ${g.dado} → ` : ''}${qtd ? `−${qtd} ${esc(g.kitNome)}` : ''}${beli ? ` · −฿ ${fmt(beli)}` : ''}${falta.length ? ` · faltou: ${esc(falta.join(', '))}` : ''}`, { tempo: 7000, tipo: falta.length ? 'ruim' : 'bom' });
  };
  conformeEstilo(`${esc(g.t)}: ${g.dado ? `rolou <b>${qtd}</b> no ${g.dado} → ` : ''}${qtd ? `${qtd} × ${esc(g.kitNome)}` : ''}${beli ? ` + ฿ ${fmt(beli)}` : ''}.${falta.length ? `<br><b>Falta:</b> ${esc(falta.join(', '))}` : ''} Descontar?`, fazer);
};

/* o tesouro cai na mochila de quem recebeu. O jogador não escreve em mesa/estado (só o mestre pode),
   então a marca de "já guardei" fica na ficha dele (tesPego = id do aviso) e a mesa lê de lá. */
ACT['tes-pegar'] = async el => {
  const nome = el.dataset.n || 'Tesouro', icone = el.dataset.i || 'tesouro:bau', v = +el.dataset.v || 0, modo = el.dataset.m || '';
  const i = inv();
  const item = { id: novoId(), nome, qtd: 1, peso: 0, ic: icone, nota: modo === 'resgate' ? `Tesouro · vale ฿ ${fmt(v)}` : modo === 'venda' ? `Tesouro · vale ฿ ${fmt(v)} se vender` : 'Tesouro' };
  if (modo === 'resgate' && v) item.resgate = v;
  if (modo === 'venda' && v) item.valor = v;
  i.itens = [...i.itens, item];
  i.log = [{ em: Date.now(), txt: `Guardou ${nome} (tesouro)`, tipo: 'bom' }, ...(i.log || [])].slice(0, 80);
  el.disabled = true;
  try { await gravarEu({ inv: limpo(i), tesPego: el.dataset.av || '' }); }
  catch (e) { el.disabled = false; return; }
  el.outerHTML = `<p class="tes-ok">${ic('modos:selo', 32)} Guardado na sua mochila.${item.resgate ? ' Use <b>Resgatar</b> no inventário para virar Beli.' : ''}</p>`;
  toast(`${nome} guardado na sua mochila.`, { tipo: 'bom' });
};
/* joia ou arte de tesouro: só vende com uma loja aberta na mesa, pelo valor da tabela (GN p. 82) */
ACT['inv-vender'] = el => {
  const i = inv(), x = i.itens.find(y => y.id === el.dataset.id), L = lojaAberta(); if (!x || !x.valor || !L) return;
  const f = minhaFicha(), atual = i.beli ?? (f ? num(f.dinheiro) : 0) ?? 0, v = x.valor;
  confirmar(`Vender <b>${esc(x.nome)}</b> em ${esc(L.nome)} por <b>฿ ${fmt(v)}</b>?`, () => {
    if ((x.qtd || 1) > 1) x.qtd -= 1; else i.itens = i.itens.filter(y => y.id !== x.id);
    i.beli = atual + v; gravarInv(i, { v, txt: `Vendeu ${x.nome} em ${L.nome}` }); Som.tocar('moeda'); toastBeli(v, 'Vendeu ' + x.nome);
  }, { titulo: 'Vender', ok: 'Vender' });
};
/* moeda ou nota de tesouro: vira Beli na carteira, em qualquer estilo de jogo */
ACT['inv-resgatar'] = el => {
  const i = inv(), x = i.itens.find(y => y.id === el.dataset.id); if (!x || !x.resgate) return;
  const f = minhaFicha(), atual = i.beli ?? (f ? num(f.dinheiro) : 0) ?? 0, v = x.resgate * (x.qtd || 1);
  i.itens = i.itens.filter(y => y.id !== x.id); i.beli = atual + v;
  gravarInv(i, { v, txt: `Resgatou ${x.nome}` }); Som.tocar('moeda'); toastBeli(v, 'Resgatou ' + x.nome);
};
