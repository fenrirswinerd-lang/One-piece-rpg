/* ═══════════ IDEIAS DO GUIA DO NARRADOR ═══════════
   Tabelas aleatórias do GN 2.0, transcritas do PDF (páginas conferidas no rodapé do livro).
   Faixas: [de, até, texto]. Usadas na Colinha do mestre: o mestre rola só para ele. */
const IDEIAS = {
  urbano: { nome: 'Objetivo em local urbano', dado: 12, pg: 'GN p. 36', L: [
    'Frustrar os planos de um vilão maligno.', 'Adquirir tesouros ou um item para um propósito específico.', 'Perseguir oponentes em fuga que se abrigaram no local.',
    'Encontrar informações para um propósito especial.', 'Resgatar um cativo ou descobrir o destino de um desaparecido.', 'Descobrir a natureza e origem de um local ou fenômeno estranho.',
    'Encontrar um PdN desaparecido.', 'Recuperar um item roubado.', 'Escapar de um aprisionamento no local.', 'Descobrir porque um vilão está interessado no local.',
    'Negociar com um vilão no local.', 'Se esconder de uma ameaça de fora desse local.'] },
  selvagem: { nome: 'Objetivo no ambiente selvagem', dado: 12, pg: 'GN p. 36', L: [
    'Localizar um local urbano de interesse (role em “Objetivo em local urbano” para descobrir o porquê).', 'Avaliar o local de um desastre natural ou misterioso.',
    'Escoltar um PdN ou cargas até um destino.', 'Estabelecer diplomacia com uma cidade distante.', 'Mapear um novo território.', 'Encontrar um local para estabelecer uma colônia.',
    'Caçar um animal específico.', 'Obter informações sobre um eremita recluso.', 'Encontrar um tesouro ou um objeto que se perdeu na natureza.',
    'Descobrir o destino de um grupo de exploração desaparecido.', 'Perseguir inimigos em fuga.', 'Proteger um local selvagem de atacantes.'] },
  outros: { nome: 'Outro objetivo', dado: 12, pg: 'GN p. 36', L: [
    'Tomar o controle de um local fortificado, como uma fortaleza, cidade ou navio.', 'Defender um local de atacantes.', 'Recuperar um objeto.',
    'Resgatar um objeto ou bens de uma embarcação ou caravana perdida.', 'Libertar prisioneiros de uma cadeia ou prisão.', 'Escapar de uma cadeia ou prisão.',
    'Viajar com sucesso através de um percurso com obstáculos para ganhar renome.', 'Infiltrar-se em um local fortificado.', 'Fugir de uma ameaça.',
    'Encontrar a fonte de ocorrências estranhas em um local misterioso.', 'Interferir na operação de um negócio.', 'Resgatar um personagem, animal ou objeto de um desastre.'] },
  vilao: { nome: 'Vilão da aventura', dado: 20, pg: 'GN p. 37', F: [
    [1, 2, 'Uma besta'], [3, 4, 'Um pirata ou marinheiro sem motivações aparentes'], [5, 5, 'Bandidos em busca de bens e riquezas'], [6, 6, 'Um pirata homem-peixe dominador'],
    [7, 7, 'Um gigante com fúria descontrolada'], [8, 9, 'Um oficial da Marinha'], [10, 10, 'Um humanoide usuário com criaturas em seu controle'], [11, 11, 'Um Nobre Mundial'],
    [12, 13, 'Um famoso pirata'], [14, 16, 'Um pirata com poderes de Akuma no Mi'], [17, 17, 'Pirata ou marinheiro conquistador'], [18, 18, 'Pirata ou marinheiro buscando vingança'],
    [19, 19, 'Pirata ou marinheiro conspirador buscando poder'], [20, 20, 'Pirata ou marinheiro mestre do submundo']] },
  aliado: { nome: 'Aliado da aventura', dado: 12, pg: 'GN p. 37', L: [
    'Pirata habilidoso', 'Buscador de vingança', 'Pirata novato', 'Lunático delirante', 'Pessoa comum entusiasmada', 'Nobre', 'Soldado', 'Homem-peixe', 'Criança',
    'Animal esperto', 'Sábio ou acadêmico', 'Vilão se passando por aliado'] },
  intro: { nome: 'Introdução da aventura', dado: 8, pg: 'GN p. 37', L: [
    'Viajando pela natureza, os personagens caem num buraco que se abre sob seus pés e vão parar no local da aventura.', 'Viajando, os personagens percebem a entrada de um local de aventura.',
    'Viajando, os personagens são atacados por criaturas ou navios que fogem para o local de aventura mais próximo.',
    'Os aventureiros acham um mapa num cadáver. O mapa leva à aventura, e o vilão da aventura quer esse mapa.', 'Um estranho se aproxima numa taverna e instiga o grupo a ir ao local de aventura.',
    'Um PdN de quem os personagens gostam precisa que eles vão ao local de aventura.', 'Um PdN a quem os personagens devem obedecer manda eles irem ao local de aventura.',
    'Um PdN que os personagens respeitam pede que eles vão ao local de aventura.'] },
  climax: { nome: 'Clímax da aventura', dado: 12, pg: 'GN p. 38', L: [
    'O grupo enfrenta o vilão principal e um bando de lacaios numa batalha sangrenta até o fim.', 'O grupo persegue o vilão desviando de obstáculos, até o confronto final dentro ou fora do refúgio dele.',
    'As ações do grupo ou do vilão causam um evento cataclísmico do qual o grupo precisa escapar.', 'O grupo corre até onde o vilão conclui o plano mestre e chega no exato momento em que ele está para se concluir.',
    'O vilão e dois ou três tenentes fazem preparações separadas num salão imenso. O grupo tem que impedir todas ao mesmo tempo.',
    'Um aliado trai o grupo quando ele está prestes a concluir o objetivo. (Use com cuidado e não abuse.)', 'Armadilhas, perigos ou objetos afetados por uma Akuma no Mi se voltam contra o grupo enquanto o vilão ataca.',
    'O ambiente começa a desmoronar durante a luta com o vilão, que tenta escapar no meio do caos.', 'Uma ameaça mais poderosa que o grupo aparece, destrói o vilão e depois se volta para os personagens.',
    'O grupo tem que escolher: perseguir o vilão em fuga ou salvar um PdN querido ou um grupo de inocentes.', 'O grupo precisa descobrir a fraqueza secreta do vilão antes de ter qualquer chance de vencê-lo.',
    'O vilão é muito mais forte do que se esperava: revela uma Técnica secreta ou poderes de Akuma no Mi.'] },
  dilema: { nome: 'Dilema moral', dado: 20, pg: 'GN p. 43', F: [
    [1, 3, 'Dilema de aliado: dois PdNs essenciais para o objetivo se odeiam e não trabalham juntos. O grupo tem que escolher um.'],
    [4, 6, 'Dilema de amigo: um PdN querido faz um pedido impossível (largar a missão, poupar o vilão, deixar um fraco fazer uma tarefa perigosa).'],
    [7, 12, 'Dilema de honra: um personagem tem que escolher entre vencer e um juramento ou código pessoal. Dê a ele uma chance de se redimir.'],
    [13, 16, 'Dilema de resgate: capturar ou ferir o vilão, ou salvar inocentes (por exemplo, uma vila prestes a ser queimada).'],
    [17, 20, 'Dilema de respeito: dois aliados importantes dão conselhos opostos. O que for ignorado perde o respeito pelo grupo.']] },
  reviravolta: { nome: 'Reviravolta', dado: 8, pg: 'GN p. 43', L: [
    'O grupo está correndo contra outras criaturas com o mesmo objetivo, ou com o objetivo oposto.', 'O grupo fica responsável pela segurança de um PdN que não luta.',
    'O grupo é proibido de matar o vilão, mas o vilão não terá remorso de matá-los.', 'O grupo tem um tempo limite.', 'O grupo recebeu informações falsas ou estranhas.',
    'O grupo tem dois objetivos diferentes, mas só pode completar um.', 'Completar o objetivo secretamente ajuda o vilão.', 'O grupo precisa cooperar com um inimigo conhecido para alcançar o objetivo.'] },
  secundaria: { nome: 'Missão secundária', dado: 8, pg: 'GN p. 44', L: [
    'Encontrar um item específico que dizem estar na área.', 'Recuperar um item roubado que está com o vilão.', 'Receber uma informação de um PdN na área.', 'Resgatar um cativo.',
    'Descobrir o destino de um PdN desaparecido.', 'Matar um animal específico.', 'Descobrir a natureza e a origem de um fenômeno estranho na área.', 'Garantir a ajuda de um personagem ou criatura na área.'] },
  aparencia: { nome: 'Aparência', dado: 20, pg: 'GN p. 50', L: [
    'Joia chamativa: brincos, colar, pulseira, braceletes', 'Piercings', 'Roupas extravagantes ou estrangeiras', 'Roupas formais e limpas', 'Roupas rasgadas e sujas', 'Cicatriz notória',
    'Dente faltando', 'Dedos faltando', 'Cor de olho incomum (ou duas cores diferentes)', 'Tatuagens', 'Marca de nascença', 'Cor de pele incomum', 'Careca', 'Barba ou cabelo trançado',
    'Cor de cabelo incomum', 'Movimento de olhos nervoso', 'Nariz distinto', 'Postura distinta (torta ou rígida)', 'Excepcionalmente belo', 'Excepcionalmente feio'] },
  altoAtr: { nome: 'Atributo alto', dado: 6, pg: 'GN p. 50', L: [
    'Força: poderoso, musculoso, forte como um touro', 'Destreza: esbelto, ágil, gracioso', 'Constituição: resistente, robusto, sadio', 'Sabedoria: estudioso, curioso, escolarizado',
    'Vontade: obstinado, confiante, líder natural', 'Presença: carismático, persuasivo, convincente'] },
  baixoAtr: { nome: 'Atributo baixo', dado: 6, pg: 'GN p. 50', L: [
    'Força: fraco, magrelo', 'Destreza: desajeitado, desastrado', 'Constituição: saúde frágil, pálido', 'Sabedoria: estúpido, distraído', 'Vontade: medroso, lento', 'Presença: condescendente, chato'] },
  dom: { nome: 'Dom', dado: 12, pg: 'GN p. 51', L: [
    'Toca um instrumento musical', 'Inacreditavelmente sortudo', 'Memória perfeita', 'Bom com animais', 'Bom com crianças', 'Bom em resolver enigmas', 'Desenha e pinta lindamente',
    'Canta lindamente', 'Bebe tudo o que tem na mesa', 'Malabarista especialista', 'Ator e mestre dos disfarces', 'Dançarino experiente'] },
  maneirismo: { nome: 'Maneirismo', dado: 20, pg: 'GN p. 51', L: [
    'Vive cantando, assobiando ou resmungando', 'Fala em rimas ou de outro jeito peculiar', 'Voz particularmente baixa ou alta', 'Fala embolado, balbucia ou gagueja',
    'Fala excessivamente claro', 'Fala gritando', 'Fala sussurrando', 'Fala de forma rebuscada, com palavras longas', 'Usa palavras erradas com frequência', 'Solta xingamentos e exclamações',
    'Faz piadas e trocadilhos o tempo todo', 'Gosta de previsões dramáticas', 'Impaciente', 'Vesgo', 'Olhar distante', 'Masca alguma coisa', 'Paciente', 'Estala os dedos',
    'Rói as unhas', 'Enrola o cabelo ou puxa a barba'] },
  interacao: { nome: 'Jeito com os outros', dado: 12, pg: 'GN p. 51', L: [
    'Argumentativo', 'Honesto', 'Arrogante', 'Esquentado', 'Barulhento', 'Irritadiço', 'Rude', 'Ponderado', 'Curioso', 'Quieto', 'Amigável', 'Desconfiado'] },
  vinculo: { nome: 'Vínculo', dado: 10, pg: 'GN p. 51', L: [
    'Dedicado a completar um objetivo de vida pessoal', 'Protege membros próximos da família', 'Protege colegas ou compatriotas', 'Leal a um benfeitor, patrono ou empregador',
    'Cativado por um interesse romântico', 'Atraído por um local especial', 'Protege uma lembrança especial', 'Protege um bem valioso', 'Em busca de vingança',
    'Role duas vezes, ignorando 10'] },
  defeito: { nome: 'Defeito ou segredo', dado: 12, pg: 'GN p. 52', L: [
    'Amor perdido, ou se apaixona fácil', 'Gosta de prazeres escusos', 'Arrogante', 'Filho ou parente de uma figura odiada', 'Ganância desenfreada', 'Esquenta fácil',
    'Tem um inimigo poderoso', 'Tem uma fobia específica', 'Tem uma história vergonhosa ou escandalosa', 'Cometeu um crime ou delito em segredo', 'Tem um conhecimento proibido',
    'Bravura imprudente'] }
};
const IDEIAS_PACOTES = {
  pdn: { nome: 'PdN completo', pg: 'GN p. 50–52', t: ['aparencia', 'altoAtr', 'baixoAtr', 'dom', 'maneirismo', 'interacao', 'vinculo', 'defeito'] },
  aventura: { nome: 'Aventura completa', pg: 'GN p. 36–44', t: ['objetivo', 'vilao', 'aliado', 'intro', 'reviravolta', 'climax'] },
  complicacao: { nome: 'Complicação', pg: 'GN p. 43–44', t: ['dilema', 'reviravolta', 'secundaria'] }
};

/* rola uma tabela e devolve { nome, n, txt, pg } */
function rolarIdeia(k) {
  if (k === 'objetivo') k = ['urbano', 'selvagem', 'outros'][Math.floor(Math.random() * 3)];
  const T = IDEIAS[k]; if (!T) return null;
  const n = 1 + Math.floor(Math.random() * T.dado);
  let txt = T.L ? T.L[n - 1] : (T.F.find(([a, b]) => n >= a && n <= b) || [])[2];
  if (k === 'vinculo' && n === 10) {   // "role duas vezes, ignorando 10"
    const a = 1 + Math.floor(Math.random() * 9); let b = a; while (b === a) b = 1 + Math.floor(Math.random() * 9);
    txt = `${T.L[a - 1]} · e também: ${T.L[b - 1]}`;
  }
  return { k, nome: T.nome, n, dado: T.dado, txt, pg: T.pg };
}

ACT['idea-rolar'] = el => {
  const p = IDEIAS_PACOTES[el.dataset.p];
  const linhas = p ? p.t.map(rolarIdeia).filter(Boolean) : [rolarIdeia(el.dataset.t)].filter(Boolean);
  if (!linhas.length) return;
  // o mesmo atributo não pode ser alto e baixo ao mesmo tempo
  const alto = linhas.find(l => l.k === 'altoAtr'), bi = linhas.findIndex(l => l.k === 'baixoAtr');
  while (alto && bi >= 0 && linhas[bi].n === alto.n) linhas[bi] = rolarIdeia('baixoAtr');
  Colinha.ideia = { titulo: p ? p.nome : linhas[0].nome, pg: p ? p.pg : linhas[0].pg, linhas };
  Som.tocar('dado'); App.render();
};
ACT['idea-copiar'] = async () => {
  const i = Colinha.ideia; if (!i) return;
  const txt = `${i.titulo} (${i.pg})\n` + i.linhas.map(l => `- ${l.nome}: ${l.txt}`).join('\n');
  try { await navigator.clipboard.writeText(txt); toast('Copiado. Cole no Diário ou nas notas da ilha.', { tipo: 'bom' }); }
  catch (e) { toast('Não deu para copiar aqui. Selecione o texto e copie.', { tipo: 'ruim' }); }
};
function ideiasHTML() {
  const i = Colinha.ideia;
  const grupos = [['Aventura', ['objetivo', 'vilao', 'aliado', 'intro', 'climax']], ['Complicar', ['dilema', 'reviravolta', 'secundaria']],
    ['PdN', ['aparencia', 'altoAtr', 'baixoAtr', 'dom', 'maneirismo', 'interacao', 'vinculo', 'defeito']]];
  const nomeDe = k => k === 'objetivo' ? 'Objetivo' : IDEIAS[k].nome;
  return `<div class="idea-pac">${Object.entries(IDEIAS_PACOTES).map(([k, p]) => `<button class="bt ouro" data-act="idea-rolar" data-p="${k}">${ic('mesa:d20', 32)} ${p.nome}</button>`).join('')}</div>
    ${i ? `<div class="idea-res"><header><b>${esc(i.titulo)}</b><small>${esc(i.pg)}</small><button class="bt fino" data-act="idea-copiar">Copiar</button></header>
      <dl>${i.linhas.map(l => `<dt>${esc(l.nome)} <small>d${l.dado} = ${l.n}</small></dt><dd>${esc(l.txt)}</dd>`).join('')}</dl></div>` : ''}
    <details class="idea-uma"><summary>Rolar uma tabela só</summary>
      ${grupos.map(([g, ks]) => `<div class="idea-g"><b>${g}</b>${ks.map(k => `<button class="chip" data-act="idea-rolar" data-t="${k}">${esc(nomeDe(k))}</button>`).join('')}</div>`).join('')}</details>`;
}
