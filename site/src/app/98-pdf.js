/* ═══════════ PDF (Bloco 5): diário de bordo, diário pessoal e diário do capitão ═══════════
   Sem biblioteca: monta uma página de impressão bonita e chama window.print(). No navegador, escolha "Salvar como PDF".
   O resto do site some na impressão (classe body.imprimindo + @media print). */
function imprimirDoc({ titulo, sub, secoes, rodape }) {
  const velho = $('#impressao'); if (velho) velho.remove();
  const d = document.createElement('div'); d.id = 'impressao';
  d.innerHTML = `<header class="imp-capa"><p class="imp-marca">Mesa One Piece</p><h1>${esc(titulo)}</h1>${sub ? `<p class="imp-sub">${esc(sub)}</p>` : ''}
      <p class="imp-data">Gerado em ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p></header>
    ${secoes.filter(s => s.itens.length).map(s => `<section class="imp-sec"><h2>${esc(s.titulo)}</h2>${s.itens.map(e => `<article class="imp-e">
      <header><h3>${esc(e.titulo || 'Registro')}</h3><p>${esc([e.dia, e.data, e.autor].filter(Boolean).join(' · '))}</p></header><div class="imp-txt">${esc(e.txt || '')}</div></article>`).join('')}</section>`).join('')}
    ${rodape ? `<footer class="imp-rod">${esc(rodape)}</footer>` : ''}`;
  document.body.appendChild(d); document.body.classList.add('imprimindo');
  const fim = () => { document.body.classList.remove('imprimindo'); d.remove(); window.removeEventListener('afterprint', fim); };
  window.addEventListener('afterprint', fim);
  setTimeout(() => { try { window.print(); } catch (e) { fim(); toast('Este navegador não deixou abrir a impressão.', { tipo: 'ruim' }); } }, 80);
}
const dataBR = em => em ? new Date(em).toLocaleDateString('pt-BR') : '';
const cronol = l => l.slice().sort((a, b) => (a.em || 0) - (b.em || 0));
/* diário de bordo da tripulação (+ o que o capitão publicou) */
ACT['bd-pdf'] = () => {
  const n = (M.bordo || []).length, c = (M.capDiario || []).length;
  if (!n && !c) return toast('O diário de bordo ainda está vazio.');
  Modal.abrir(`<h2>${ic('mesa:diario', 32)} Diário de bordo em PDF</h2>
    <label class="check"><input type="checkbox" id="pdf-cap" ${c ? 'checked' : 'disabled'}> Incluir o diário do capitão (só o que foi publicado: ${c})</label>
    <label class="check"><input type="checkbox" id="pdf-res" checked> Incluir os resumos automáticos de sessão</label>
    <label class="campo-inline">Ordem <select id="pdf-ord"><option value="antigo">Do começo da viagem para hoje</option><option value="novo">Do mais novo para o mais antigo</option></select></label>
    <p class="nota">Abre a janela de impressão. Em “Destino”, escolha <b>Salvar como PDF</b>. No celular: Compartilhar › Imprimir › Salvar PDF.</p>
    <div class="modal-bts"><button class="bt bom" data-act="bd-pdf-ok">Gerar PDF</button></div>`);
};
ACT['bd-pdf-ok'] = () => {
  const cap = $('#pdf-cap').checked, res = $('#pdf-res').checked, novo = $('#pdf-ord').value === 'novo';
  const ord = l => (novo ? cronol(l).reverse() : cronol(l));
  const bordo = ord((M.bordo || []).filter(e => res || e.tipo !== 'resumo')).map(e => ({ titulo: e.titulo || (e.tipo === 'resumo' ? 'Resumo da sessão' : 'Registro'), dia: e.dia, data: dataBR(e.em), txt: e.txt }));
  const capL = cap ? ord(M.capDiario || []).map(e => ({ titulo: e.titulo || 'Diário do capitão', dia: e.dia, data: dataBR(e.em), autor: e.autor, txt: e.txt })) : [];
  const t = M.trip || {}, si = sessaoInfo();
  Modal.fechar();
  imprimirDoc({ titulo: `Diário de bordo${t.nome ? ' · ' + t.nome : ''}`, sub: `Até a sessão ${si.n}${si.nome ? ': ' + si.nome : ''}`,
    secoes: [{ titulo: 'O que a tripulação viveu', itens: bordo }, { titulo: 'Diário do capitão', itens: capL }], rodape: 'One Piece RPG · Livro do Jogador 2.1' });
};
/* diário pessoal do jogador (privado: só ele e o mestre) */
ACT['jd-pdf'] = () => {
  const d = cronol(notas().diario || []); if (!d.length) return toast('Seu diário ainda está vazio.');
  imprimirDoc({ titulo: `Diário de ${nomeJ(eu())}`, sub: 'Diário pessoal', secoes: [{ titulo: 'Páginas', itens: d.map(e => ({ titulo: e.titulo || 'Sem título', dia: e.dia, data: dataBR(e.em), txt: e.txt })) }] });
};
/* diário do capitão (privado inteiro, para o próprio capitão ou o mestre) */
ACT['cap-pdf'] = () => {
  const d = cronol(M.capPriv || []); if (!d.length) return toast('O diário do capitão ainda está vazio.');
  const quem = (capitaoOficial() || {}).nome || nomeJ(eu());
  imprimirDoc({ titulo: `Diário do capitão · ${quem}`, sub: 'Inclui as páginas privadas', secoes: [{ titulo: 'Páginas', itens: d.map(e => ({ titulo: (e.titulo || 'Sem título') + (e.pub ? ' (publicada)' : ''), dia: e.dia, data: dataBR(e.em), txt: e.txt })) }] });
};
