/* ═══════════ ONDE ACHO O QUÊ (só o mestre) ═══════════
   Um mapa do próprio site: para cada aba, quando usar e o que tem; e as dúvidas mais comuns com a aba certa.
   Existe porque o site cresceu: assim ninguém precisa decorar onde cada coisa mora.
   Para uma aba nova entrar aqui, é só acrescentar uma linha em MAPA_ABAS. */
const MAPA_ABAS = [
  ['Ao vivo', [
    ['mesa', 'Durante a sessão, a tela que todo mundo vê.', 'Imagem do lugar, música, relógio e clima, dados, liberar abas.'],
    ['grupo', 'Ver como está cada jogador de relance.', 'Vida, PP, condições e ficha de cada um, ao vivo.'],
    ['combate', 'Quando começa a luta.', 'Iniciativa, turnos, rodadas, vida dos inimigos.'],
    ['tatico', 'Saber quem alcança quem: distância, deslocamento e área de técnica.', 'Mapa com grade de 1,5 m, fichas de quem está na luta, régua, cone/linha/esfera. Os jogadores veem e movem a própria ficha. Funciona sem imagem: escolha o chão (convés, areia, grama…) e o tamanho.'],
    ['mesa', 'Jogar dados de verdade na frente de todos e reagir.', 'Dados 3D com física numa mesa de madeira (d4 a d100), iguais para todo mundo. Botões de reação no canto do quadro. O mestre troca o tampo na janela Música.']]],
  ['Preparar', [
    ['pdm', 'Criar e guardar fichas de NPCs e aliados.', 'Fichas do mestre (quem não é jogador).'],
    ['inimigos', 'Escolher um inimigo para o encontro.', 'Manual dos Inimigos por Nível de Desafio.'],
    ['encontro', 'Montar uma luta e ver se ela é fácil ou mortal. (Fica junto de Inimigos: botões no topo.)', 'Cálculo de dificuldade e XP. Aqui você registra a vitória.'],
    ['mundo', 'Montar a ilha antes da sessão.', 'Ilhas, NPCs, o que os jogadores já sabem e o que fica trancado.'],
    ['arquivos', 'Subir músicas, efeitos e imagens.', 'Arquivos da mesa, jogadores liberados, Discord.'],
    ['atelie', 'Pedir uma arte nova ao ChatGPT no estilo do site.', 'Prompts prontos: retrato, cartaz, ilha, paisagem de ilha, cena, mapa, navio, ícone, bandeira, jornal, tampo da mesa de dados, sprite e folha de sprites. Puxa os detalhes da ficha e faz lote da luta inteira.'],
    ['lojas', 'A ilha tem comércio. (Fica junto de Mundo: botões no topo.)', 'Lojas e preços da ilha.']]],
  ['Para a mesa', [
    ['personagem', 'Abrir a aba de um jogador.', 'Inventário, diário e ficha de cada jogador, do ponto de vista dele.'],
    ['jornal', 'Abrir a sessão com uma notícia.', 'Escrever manchetes que os jogadores leem.'],
    ['tripulacao', 'Mostrar o bando ao grupo. Recrutar marujos sem ficha e dar rosto a um deles na hora.', 'Capitão, como o mundo vê o bando, aliados e inimigos. No fim: funções e efetivo, marujos (gente do convés) e a frota do bando.'],
    ['navio', 'Mexer no navio do bando e dar upgrade. (Fica junto de Tripulação: botões no topo.)', 'Estaleiro: comprar ou construir peças do livro (casco, mastros, motor, canhões, cômodos). O site calcula CR, PV e velocidade. Obras, despesas da semana e conserto.'],
    ['banco', 'Guardar o dinheiro do bando e pagar os upgrades. (Fica junto de Tripulação: botões no topo.)', 'Cofre do bando: depósitos dos jogadores, pedidos de compra para aprovar, entrada e saída, meta.'],
    ['frota', 'Ter navios de figurantes (do bando, aliados, inimigos) sem montar ficha. (Fica junto de Batalha naval: botões no topo.)', 'Uma linha por navio, com os números do modelo do livro. Um clique põe o navio na Batalha naval. Navio do bando pode sair em missão e trazer Berries para o Banco.'],
    ['recompensas', 'Mudar o valor de um cartaz e ver o renome.', 'Recompensa de cada um e a calculadora de renome.'],
    ['mural', 'Mostrar os cartazes de procurado. (Fica junto de Recompensas: botões no topo.)', 'O mural bonito (o valor muda em Recompensas).'],
    ['bordo', 'Registrar o que os jogadores precisam lembrar.', 'Diário de bordo (público), diário do capitão e quadro da mesa.']]],
  ['Lore e sessão', [
    ['escudolore', 'Sentar para narrar e lembrar a lore.', '4 abas: Agora (cena da vez, regras de bolso, pendências), Arcos (cenas e gente de cada arco), Rápido (faíscas: nome, conflito, gancho) e Notas (suas; copia para o chat de lore).'],
    ['guia', 'Os jogadores consultam o mundo e as espécies.', 'Guia de lore (o que eles podem ler).'],
    ['diario', 'Anotar rapidinho durante a sessão.', 'Tudo que o site registra sozinho, mais suas notas. Copia o resumo.'],
    ['mapa', 'Está perdido.', 'Esta página.']]],
  ['Regras', [
    ['oraculo', 'Tirar uma dúvida de regra no meio da sessão (tecla P).', 'Você pergunta do seu jeito; ele responde com a página do livro e faz a conta. Guarda as decisões da mesa.'],
    ['colinha', 'Deu branco sobre nível e recompensa.', 'Roteiro da sessão (músicas, o que preparar) e como o grupo sobe de nível.'],
    ['escudo', 'Qualquer dúvida de regra.', 'Todas as regras com página do livro, busca e selos “não esquece disso”.'],
    ['regras', 'Quer tudo numa página só.', 'Regras rápidas: condições, exaustão, morte, descansos, turba, mares. (Fora do menu; aberta por um botão no Regras com página.)'],
    ['tabelas', 'Precisa inventar na hora com dado.', 'Tabelas do Guia do Narrador: eventos, personalidade, encontros.'],
    ['catalogo', 'Procurar uma fruta, item ou técnica.', 'Catálogo com busca.']]],
  ['Mar e progresso', [
    ['viagem', 'Navegando.', 'Clima do dia, encontro no mar, teste de navegação.'],
    ['tesouro', 'Acharam um tesouro. (Fica junto de Viagem: botões no topo.)', 'Tabela d100, mostrar e entregar.'],
    ['barra', 'Fechar arco ou conferir XP de improviso.', 'Barra de Bônus, fechar o arco, quem subiu de nível.']]],
  ['Ajustes', [['ajustes', 'Mudar regra da casa ou guardar cópia.', 'Fichas dos jogadores, regras da casa, o que eles enxergam, cópia de segurança.']]]
];
const MAPA_PARECIDAS = [
  ['Três diários', 'Diário da sessão é só seu (e o site escreve nele). Diário de bordo é o que os jogadores veem. Diário do capitão é o personagem do capitão escrevendo.'],
  ['Recompensas × Procurados', 'Estão juntos: um menu, dois botões no topo. Recompensas muda o valor; Procurados só mostra o cartaz.'],
  ['Abas que dividem o menu', 'Inimigos + Encontro, Mundo + Lojas, Tripulação + Navio, Recompensas + Procurados, Viagem + Tesouro. Um item no menu, o outro é botão no topo.'],
  ['Guia de lore × Escudo de lore', 'Guia de lore é para os jogadores lerem. Escudo de lore é só seu: cenas, ideias, pendências.'],
  ['Regras com página × Regras rápidas', 'Mesmas regras. Rápidas cabe numa página; com página tem busca, selos e a página do livro.'],
  ['Colinha × Barra de Bônus', 'Colinha explica como o XP anda. Barra de Bônus é onde você vê e fecha.'],
  ['Sorteios', 'Nome, conflito, gancho, encontro no mar, tesouro e ideias do Guia: tudo em Escudo de lore › Rápido. São só faíscas; você decide o resto. Tabelas do Narrador tem as tabelas inteiras.']
];
const MAPA_DUVIDAS = [
  ['Que cena eu jogo agora?', 'escudolore', 'aba Agora'],
  ['Preciso de um nome, um conflito ou um gancho agora', 'escudolore', 'aba Rápido'],
  ['Um jogador inventou uma pessoa ou um lugar', 'escudolore', 'aba Notas (escolha o arco)'],
  ['O que ainda está em aberto na lore?', 'escudolore', 'aba Agora'],
  ['Levar minhas anotações para o chat de lore', 'escudolore', 'aba Notas'],
  ['Quanto XP eu dou? A luta é difícil?', 'encontro', ''],
  ['Como o grupo sobe de nível?', 'colinha', ''],
  ['Exaustão, condições, morte, descanso', 'escudo', 'selos “não esquece disso”'],
  ['Qual a CD de navegação?', 'escudo', 'seção Mar e navegação'],
  ['Preciso de um evento ou uma complicação com dado', 'tabelas', ''],
  ['Mostrar uma imagem ou música aos jogadores', 'mesa', ''],
  ['Ver a ficha de um jogador', 'personagem', ''],
  ['Achei uma fruta ou item para dar', 'catalogo', '']
];
VIEWS.mapa = {
  titulo: 'Onde acho o quê', icone: 'mar:luneta',
  render() {
    if (!souMestre()) return '<section class="mapa"><p class="nota">Só o mestre vê esta página.</p></section>';
    const nome = r => (VIEWS[r] && VIEWS[r].titulo) || r;
    return `<section class="mapa"><header class="col-cab"><h1>${ic('mar:luneta', 64)}Onde acho o quê</h1><p class="nota">Quando bater dúvida sobre onde fica alguma coisa. Clique em Ir para abrir a aba.</p>
      <input id="mapa-busca" type="search" placeholder="Buscar (ex.: nome, XP, exaustão, navio)" aria-label="Buscar"></header>
      <h2>Minha dúvida é…</h2><div class="mapa-duv">${MAPA_DUVIDAS.map(([q, r, x]) => `<div class="mapa-it" data-busca="${esc(q + ' ' + nome(r) + ' ' + x)}"><span>${esc(q)}</span><b>${esc(nome(r))}${x ? ` <small>${esc(x)}</small>` : ''}</b><button class="bt fino" data-rota="${r}" ${r === 'escudolore' ? `data-aba="${x.includes('Rápido') ? 'rapido' : x.includes('Notas') ? 'notas' : 'agora'}"` : ''}>Ir</button></div>`).join('')}</div>
      <h2>Todas as abas</h2>${MAPA_ABAS.map(([g, l]) => `<h3 class="el-sub">${esc(g)}</h3><div class="mapa-ab">${l.map(([r, q, t]) => `<div class="mapa-it" data-busca="${esc(nome(r) + ' ' + q + ' ' + t)}"><b>${esc(nome(r))}</b><span><i>Use quando:</i> ${esc(q)}</span><span class="nota">${esc(t)}</span><button class="bt fino" data-rota="${r}">Ir</button></div>`).join('')}</div>`).join('')}
      <h2>Parecidas, qual usar</h2><div class="mapa-ab">${MAPA_PARECIDAS.map(([t, x]) => `<div class="mapa-it" data-busca="${esc(t + ' ' + x)}"><b>${esc(t)}</b><span>${esc(x)}</span></div>`).join('')}</div></section>`;
  }
};
document.addEventListener('input', e => {
  if (!e.target || e.target.id !== 'mapa-busca') return;
  const q = sem(e.target.value); $$('.mapa-it').forEach(c => { c.hidden = !!q && !sem(c.dataset.busca || '').includes(q); });
});
/* o botão "Ir" da dúvida sobre o Escudo de lore já abre na aba certa */
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-aba]'); if (b && typeof EL !== 'undefined') EL.aba = b.dataset.aba; }, true);
