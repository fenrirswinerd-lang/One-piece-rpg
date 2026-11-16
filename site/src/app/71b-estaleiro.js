/* ═══════════ ESTALEIRO: o navio montado por peças (Livro do Jogador, cap. 14) ═══════════
   Cada peça tem preço de compra, custo de construção e tempo. O site soma tudo e calcula CR, BR, PV e velocidade.
   Tabelas: Características Gerais (LJ p. 308), Quantidades Mínimas, Madeiras e Fortificações (p. 309), Kairoseki, Âncoras, Mastros e Lemes (p. 310),
   Motores (p. 311), Cômodos (p. 312–313), Canhões (p. 315–316), Navio Danificado (p. 317 e Carpinteiro p. 140), Modelos (p. 320–321), Resumo (p. 322).
   Quem paga é o Banco do bando (71c-banco.js). O jogador pede; o mestre aprova.
   Nada disso mexe nas regras do Firebase: o navio continua em mesa/navio; os pedidos ficam no documento de cada jogador. */
const NV_ORD = ['Pequeno', 'Médio', 'Grande', 'Enorme', 'Colossal'];
const NV = {
  /* com = cômodos · trip = tripulantes · can = canhões (máximos) · peso = desaceleração em nós · mad/fort = peças · mast = [mínimo, máximo] · dias = construção · kairo = [peças, dias, valor, adicional] */
  tam: {
    Pequeno: { deq: 1, com: 4, trip: 20, can: 3, pv: 150, peso: 2, mad: 200, mast: [1, 1], fort: 40, dias: 12, kairo: [100, 12, 1e9, 1.5e6] },
    Médio: { deq: 2, com: 10, trip: 50, can: 10, pv: 300, peso: 10, mad: 300, mast: [1, 2], fort: 60, dias: 18, kairo: [150, 18, 1.5e9, 2e6] },
    Grande: { deq: 3, com: 26, trip: 130, can: 15, pv: 500, peso: 20, mad: 500, mast: [2, 2], fort: 80, dias: 25, kairo: [200, 25, 2e9, 3e6] },
    Enorme: { deq: 4, com: 48, trip: 240, can: 25, pv: 750, peso: 30, mad: 600, mast: [2, 3], fort: 120, dias: 30, kairo: [300, 30, 3e9, 3.5e6] },
    Colossal: { deq: 5, com: 90, trip: 450, can: 45, pv: 1000, peso: 40, mad: 800, mast: [3, 3], fort: 160, dias: 40, kairo: [400, 40, 4e9, 4.5e6] }
  },
  /* p = ฿ por peça · rep = ฿ por PV consertado pelo carpinteiro (LJ p. 140) */
  madeira: { Cedro: { p: 30000, cr: 10, br: 5, rep: 40000 }, Carvalho: { p: 80000, cr: 12, br: 10, rep: 100000 }, Cerejeira: { p: 150000, cr: 15, br: 15, rep: 190000 }, Adam: { p: 400000, cr: 18, br: 30, rep: 500000 } },
  fort: { aco: { n: 'Aço', p: 450000, cr: 1 }, temperado: { n: 'Aço Temperado', p: 600000, cr: 2 } }, fortExtra: 900000,
  mastro: { simples: { n: 'Mastro Simples', p: 200000, c: 160000, d: 1, v: 8 }, composto: { n: 'Mastro Composto', p: 400000, c: 320000, d: 1, v: 12 }, multiplo: { n: 'Mastro Múltiplo', p: 600000, c: 480000, d: 2, v: 16 } },
  leme: { tora: { n: 'Leme Tora', p: 40000, c: 25000, h: 2 }, circular: { n: 'Leme Circular', p: 70000, c: 55000, h: 5 } },
  ancora: { normal: { n: 'Âncora Normal', p: 800000, c: 600000, d: 3 }, robusta: { n: 'Âncora Robusta', p: 1200000, c: 900000, d: 6 } },
  motor: {
    manual: { n: 'Motor Manual', p: 2e6, c: 1.6e6, d: 3, v: 4, det: '+4 nós. Precisa de 10 tripulantes só nele.' },
    vapor: { n: 'Motor a Vapor', p: 25e6, c: 20e6, d: 5, v: 6, grande: true, sala: true, det: '+6 nós. Queima carvão (300 kg por hora) e ocupa 3 tripulantes.' },
    combustao: { n: 'Motor de Combustão', p: 60e6, c: 48e6, d: 15, v: 8, grande: true, sala: true, det: '+8 nós. Automático. Gasta 10 L de combustível por hora.' }
  },
  turbina: { n: 'Turbina Submersa', p: 300e6, c: 100e6, d: 20, det: '+8 nós por 2 horas quando ligada. Gasta 1 bateria grande.' },
  jato: { n: 'Propulsão a Jato', p: null, c: 1.2e9, d: 45, det: 'O navio voa até 2 km. 10 minutos de preparo e 2 baterias grandes.' },
  /* nomes iguais aos da Batalha naval · mun = munição (não ocupa lugar de canhão) */
  arma: {
    'Canhão Comum': { p: 1.5e6, c: 9e5, d: 10, cd: 10, det: '90/120 m · +2 no acerto' }, 'Canhão Aprimorado': { p: 2e6, c: 1.2e6, d: 12, cd: 14, det: '120/240 m · +4 no acerto' },
    'Canhão Superior': { p: 5e6, c: 3e6, d: 18, cd: 18, det: '45/90 m · +6 · dobro do dano' }, 'Longo Alcance': { p: 10e6, c: 6e6, d: 30, cd: 21, det: '500/750 m · +5 · metade do dano' },
    'Canhão de Energia': { p: null, c: 3e9, d: 40, cd: 26, grande: true, det: 'Linha de 500 m · 50d12 · gasta 5 baterias grandes' }, 'Lançador de Arpão': { p: 2.5e6, c: 1.5e6, d: 25, det: '45/90 m · +5 · prende o alvo' },
    'Bola Acorrentada': { p: 40000, c: 24000, d: 2, mun: true, det: 'Munição: derruba o mastro (Salvaguarda de Estrutura CD 17)' }
  },
  /* esp = quantos cômodos ocupa · sem = despesa por semana · eng = só engenheiro constrói */
  comodo: [
    { k: 'capitao', n: 'Aposento do Capitão', p: 150000, d: 1, sem: 10000, ben: 'Capitão tem vantagem em Presença aqui. Descanso longo aqui dá 1 sucesso automático.' },
    { k: 'biblioteca', n: 'Biblioteca', p: 200000, d: 3, sem: 25000, ben: 'Mapas na metade do tempo. +5 em Sabedoria de arqueólogo, caçador e navegador após pesquisa.' },
    { k: 'cela', n: 'Cela', p: 220000, d: 1, sem: 5000, ben: 'Prende até 5 criaturas Médias. Fugir sem alertar: Furtividade CD 25.' },
    { k: 'cozinha', n: 'Cozinha', p: 300000, d: 3, sem: 25000, ben: 'Obrigatória para preparar comida. +5 na lotação do navio.' },
    { k: 'despensa', n: 'Despensa', p: 150000, d: 1, sem: 10000, ben: 'Comida dura o dobro. Alimenta mais 20 tripulantes.' },
    { k: 'dormitorio', n: 'Dormitório', p: 100000, d: 2, sem: 10000, ben: 'Até 5 pessoas. Descanso longo 1 hora mais curto.' },
    { k: 'enfermaria', n: 'Enfermaria', p: 350000, d: 3, sem: 40000, ben: '+5 no tratamento do médico e nas Salvaguardas de Constituição do paciente.' },
    { k: 'gerador', n: 'Gerador de Energia', p: 700e6, d: 15, sem: 200000, esp: 2, eng: true, ben: 'Guarda e recarrega 3 baterias grandes por dia de viagem. Um por navio.' },
    { k: 'laboratorio', n: 'Laboratório', p: 400000, d: 4, sem: 35000, ben: '+5 em Sabedoria de botânico, cientista, engenheiro, farmacêutico, inventor e médico.' },
    { k: 'vigia', n: 'Quarto de Vigilância', p: 250000, d: 9, sem: 5000, esp: 0, multiplo: true, ben: 'Vigilância precisa de só 2 tripulantes. Só em mastro múltiplo. Não ocupa cômodo.' },
    { k: 'refeitorio', n: 'Refeitório', p: 200000, d: 2, sem: 10000, ben: 'Alimenta mais 20 tripulantes.' },
    { k: 'maquinas', n: 'Sala das Máquinas', p: 500000, d: 6, sem: 20000, esp: 3, eng: true, ben: 'Permite motor a vapor ou de combustão.' },
    { k: 'ferramentas', n: 'Sala de Ferramentas', p: 200000, d: 2, sem: 15000, ben: '+5 em Sabedoria e Destreza de carpinteiro e engenheiro.' },
    { k: 'treino', n: 'Sala de Treinamento', p: 450000, d: 3, sem: 30000, esp: 3, ben: '+1 no Nível de Desafio dos tripulantes. 1 dia de treino vale 2 (um por vez).' },
    { k: 'tesouro', n: 'Sala do Tesouro', p: 600000, d: 4, sem: 10000, ben: 'O cômodo mais seguro. Abre com duas chaves.' }
  ],
  /* navios prontos (LJ p. 320–321). aj = diferença entre a conta das peças e o número que o livro imprime para o modelo */
  modelo: {
    Pequeno: { p: 10e6, mad: 'Cedro', mastros: ['composto'], leme: 'tora', ancora: 'normal', armas: [['Canhão Comum', 1]] },
    Médio: { p: 30e6, mad: 'Carvalho', mastros: ['composto', 'composto'], leme: 'tora', ancora: 'normal', armas: [['Canhão Comum', 3]], aj: { vel: -2 } },
    Grande: { p: 100e6, mad: 'Cerejeira', mastros: ['multiplo', 'multiplo'], leme: 'circular', ancora: 'normal', armas: [['Canhão Aprimorado', 5]] },
    Enorme: { p: 150e6, mad: 'Cerejeira', mastros: ['multiplo', 'multiplo', 'multiplo'], leme: 'circular', ancora: 'robusta', motor: 'vapor', armas: [['Canhão Aprimorado', 8]] },
    Colossal: { p: 200e6, mad: 'Cerejeira', fort: 'aco', mastros: ['multiplo', 'multiplo', 'multiplo'], leme: 'circular', ancora: 'robusta', motor: 'combustao', armas: [['Canhão Aprimorado', 12]] },
    'Marinha: Padrão': { tam: 'Grande', mad: 'Cerejeira', fort: 'temperado', mastros: ['multiplo', 'multiplo'], leme: 'circular', ancora: 'normal', motor: 'combustao', armas: [['Canhão Aprimorado', 15]] },
    'Marinha: Batedor': { tam: 'Médio', mad: 'Cerejeira', mastros: ['multiplo', 'multiplo'], leme: 'circular', ancora: 'normal', motor: 'combustao', armas: [['Canhão Aprimorado', 10]] },
    'Marinha: Prisão': { tam: 'Enorme', mad: 'Cerejeira', fort: 'temperado', mastros: ['multiplo', 'multiplo', 'multiplo'], leme: 'circular', ancora: 'robusta', motor: 'combustao', armas: [['Canhão Aprimorado', 10], ['Canhão Superior', 15]] },
    'Marinha: Batalha': { tam: 'Colossal', mad: 'Cerejeira', fort: 'temperado', mastros: ['multiplo', 'multiplo', 'multiplo'], leme: 'circular', ancora: 'robusta', motor: 'combustao', armas: [['Canhão Aprimorado', 40], ['Canhão Superior', 10], ['Longo Alcance', 10]], aj: { vel: 8 } }
  },
  /* efetivo por tamanho (LJ p. 300): [mínimo, necessário] */
  efe: { Pequeno: { nav: [1, 2], limp: [1, 2], vig: [2, 4] }, Médio: { nav: [2, 3], limp: [2, 3], vig: [2, 4] }, Grande: { nav: [3, 5], limp: [4, 6], vig: [5, 7] },
    Enorme: { nav: [7, 10], limp: [15, 20], vig: [5, 7] }, Colossal: { nav: [12, 15], limp: [30, 50], vig: [7, 10] } }
};
const nvB = v => v == null ? '—' : v >= 1e9 ? `฿ ${(v / 1e9).toLocaleString('pt-BR')} bi` : v >= 1e6 ? `฿ ${(v / 1e6).toLocaleString('pt-BR')} mi` : `฿ ${fmt(v)}`;
const nvTempo = min => !min ? 'na hora' : min < 1440 ? `${Math.max(1, Math.round(min / 60))} h` : `${Math.ceil(min / 1440)} dia${Math.ceil(min / 1440) > 1 ? 's' : ''}`;
const nvN = v => +v || 0;
const nvComodo = k => NV.comodo.find(c => c.k === k);
const nvGrande = n => NV_ORD.indexOf(n.tamanho) >= 2;
const nvCanhoes = n => (n.armas || []).reduce((a, x) => a + ((NV.arma[x.n] || {}).mun || x.n === 'Estilhaços' ? 0 : (x.q || 1)), 0);
const nvComodosUsados = n => (n.comodos || []).reduce((a, c) => a + (c.tipo && nvComodo(c.tipo) ? (nvComodo(c.tipo).esp ?? 1) : 1), 0);
const nvTem = (n, k) => (n.comodos || []).some(c => c.tipo === k);
const nvDespesa = n => (n.comodos || []).reduce((a, c) => a + ((nvComodo(c.tipo) || {}).sem || 0), 0);

/* a conta: tudo que sai das peças */
function nvCalc(n) {
  const P = n.pecas; if (!P) return null;
  const T = NV.tam[n.tamanho] || NV.tam.Pequeno, Md = NV.madeira[n.madeira] || NV.madeira.Cedro, aj = n.aj || {}, mastros = P.mastros || [];
  const velM = mastros.reduce((a, m) => a + ((NV.mastro[m] || {}).v || 0), 0), velMo = P.motor && NV.motor[P.motor] ? NV.motor[P.motor].v : 0;
  const cr = Md.cr + (P.fort && NV.fort[P.fort] ? NV.fort[P.fort].cr : 0) + (P.kairo ? 1 : 0) + (P.carp ? 3 : 0) + nvN(aj.cr);
  const vel = Math.max(0, velM + velMo - T.peso + (P.carp ? 12 : 0) + nvN(aj.vel));
  const can = nvCanhoes(n), com = nvComodosUsados(n), trip = T.trip + (nvTem(n, 'cozinha') ? 5 : 0);
  const valor = T.mad * Md.p + (P.fort && NV.fort[P.fort] ? T.fort * NV.fort[P.fort].p + NV.fortExtra : 0) + (P.kairo ? T.kairo[2] + T.kairo[3] : 0)
    + mastros.reduce((a, m) => a + ((NV.mastro[m] || {}).p || 0), 0) + ((NV.leme[P.leme] || {}).p || 0) + ((NV.ancora[P.ancora] || {}).p || 0)
    + (P.motor && NV.motor[P.motor] ? NV.motor[P.motor].p : 0) + (P.turbina ? NV.turbina.p : 0) + (P.jato ? NV.jato.c : 0)
    + (n.armas || []).reduce((a, x) => { const A = NV.arma[x.n]; return a + (A ? (A.p ?? A.c) * (x.q || 1) : 0); }, 0)
    + (n.comodos || []).reduce((a, c) => a + ((nvComodo(c.tipo) || {}).p || 0), 0);
  const av = [];   // avisos: o que foge do livro
  if (mastros.length > T.mast[1]) av.push(`Navio ${n.tamanho} leva no máximo ${T.mast[1]} mastro(s) (LJ p. 310).`);
  if (mastros.length < T.mast[0]) av.push(`Faltam mastros: o livro pede pelo menos ${T.mast[0]} para navio ${n.tamanho} (LJ p. 309).`);
  if (nvGrande(n) && P.leme === 'tora') av.push('Navio Grande ou maior precisa de Leme Circular (LJ p. 309).');
  if (!P.leme) av.push('O navio está sem leme.');
  if (NV_ORD.indexOf(n.tamanho) >= 3 && P.ancora !== 'robusta') av.push('Navio Enorme ou Colossal precisa de Âncora Robusta (LJ p. 309).');
  if (P.motor && NV.motor[P.motor] && NV.motor[P.motor].sala && !nvTem(n, 'maquinas')) av.push(`${NV.motor[P.motor].n} só funciona com a Sala das Máquinas (LJ p. 311).`);
  if (P.motor && NV.motor[P.motor] && NV.motor[P.motor].grande && !nvGrande(n)) av.push(`${NV.motor[P.motor].n} é para navio Grande ou maior (LJ p. 311).`);
  if (can > T.can) av.push(`Canhões demais: ${can} de ${T.can} (LJ p. 308).`);
  if (com > T.com) av.push(`Cômodos demais: ${com} de ${T.com} (LJ p. 308).`);
  if (nvTem(n, 'vigia') && !mastros.includes('multiplo')) av.push('Quarto de Vigilância só existe em mastro múltiplo (LJ p. 313).');
  return { cr, br: Md.br + nvN(aj.br), pvMax: Math.max(1, T.pv + nvN(aj.pvMax)), vel, can, canMax: T.can, com, comMax: T.com, trip, valor, av, T, Md, velM, velMo };
}
/* monta as peças de um modelo do livro */
function nvDeModelo(nome) {
  const m = NV.modelo[nome]; if (!m) return null; const tamanho = m.tam || nome;
  return { tamanho, madeira: m.mad, pecas: { fort: m.fort || '', kairo: false, mastros: m.mastros.slice(), leme: m.leme, ancora: m.ancora, motor: m.motor || '', turbina: false, jato: false, carp: false, klab: false },
    armas: m.armas.map(([n, q]) => ({ n, q })), comodos: m.motor ? [{ id: novoId(), n: 'Sala das Máquinas', tipo: 'maquinas', nota: '' }] : [], aj: Object.assign({ cr: 0, br: 0, pvMax: 0, vel: 0 }, m.aj || {}) };
}
/* aplica uma compra no navio (n é uma cópia) */
function nvAplica(n, ac) {
  const P = n.pecas || (n.pecas = {});
  if (ac.t === 'modelo') { const m = nvDeModelo(ac.v); if (m) { Object.assign(n, m); n.pv = null; } }
  else if (ac.t === 'madeira') n.madeira = ac.v;
  else if (ac.t === 'fort') P.fort = ac.v;
  else if (ac.t === 'kairo') P.kairo = true;
  else if (ac.t === 'mastro') P.mastros = [...(P.mastros || []), ac.v];
  else if (ac.t === 'leme') P.leme = ac.v;
  else if (ac.t === 'ancora') P.ancora = ac.v;
  else if (ac.t === 'motor') P.motor = ac.v;
  else if (ac.t === 'turbina') P.turbina = true;
  else if (ac.t === 'jato') P.jato = true;
  else if (ac.t === 'arma') { const ar = (n.armas || []).map(a => ({ ...a })), x = ar.find(y => y.n === ac.v); if (x) x.q = (x.q || 1) + 1; else ar.push({ n: ac.v, q: 1 }); n.armas = ar; }
  else if (ac.t === 'comodo') { const c = nvComodo(ac.v); if (c) { n.comodos = [...(n.comodos || []), { id: novoId(), n: c.n, tipo: c.k, nota: '' }]; if (c.sem && !(n.desp && n.desp.ate)) n.desp = { ate: Relogio.agora().dia + 7 }; } }
  else if (ac.t === 'conserto') n.pv = Math.min(nvN(n.pvMax), nvN(n.pv) + nvN(ac.v));
}
/* grava o navio já com os números calculados (só o mestre mexe nas peças) */
function nvGravar(mut, txt) {
  const n = JSON.parse(JSON.stringify(navio())), pvMaxAntes = nvN(n.pvMax), cheio = nvN(n.pv) >= pvMaxAntes;
  mut(n); const c = nvCalc(n);
  const patch = { tamanho: n.tamanho, madeira: n.madeira, armas: n.armas || [], comodos: n.comodos || [], obras: n.obras || [], aj: n.aj || {} };
  if (n.pecas) patch.pecas = n.pecas;
  if (n.desp) patch.desp = n.desp;
  if (c) { Object.assign(patch, { cr: c.cr, br: c.br, pvMax: c.pvMax, vel: c.vel }); patch.pv = n.pv == null || cheio ? c.pvMax : Math.min(nvN(n.pv), c.pvMax); }
  else if (n.pv != null) patch.pv = n.pv;
  return gravarNavio(patch, txt);
}

/* ───── o que dá para comprar agora ───── */
function nvOfertas(n) {
  const P = n.pecas || {}, c = nvCalc(n), T = c ? c.T : NV.tam[n.tamanho] || NV.tam.Pequeno, grande = nvGrande(n), idx = NV_ORD.indexOf(n.tamanho), L = [];
  const add = (g, k, nome, det, o) => L.push(Object.assign({ g, k, n: nome, det, p: null, c: null, t: 0, cd: 0, eng: false, blq: '', tem: false }, o));
  const D = 1440;
  Object.entries(NV.modelo).forEach(([nome, m]) => { const t = NV.tam[m.tam || nome], x = nvCalc(nvDeModelo(nome));
    add('Navio pronto', 'modelo:' + nome, nome.startsWith('Marinha') ? 'Navio da ' + nome : 'Navio ' + nome, `CR ${x.cr} · BR ${x.br} · ${x.pvMax} PV · ${x.vel} nós · ${m.armas.map(([a, q]) => `${q}× ${a}`).join(', ')}`,
      { p: m.p ?? null, soMestre: !m.p, ac: { t: 'modelo', v: nome }, pag: 'LJ p. 320–321', troca: true }); void t; });
  Object.entries(NV.madeira).forEach(([nome, m]) => add('Casco', 'madeira:' + nome, 'Casco de ' + nome, `CR ${m.cr} · BR ${m.br}${nome === 'Adam' ? ' · imune a dano extra contra construções · só no Mercado Negro' : ''}`,
    { c: T.mad * m.p, t: T.dias * D, tem: n.madeira === nome, ac: { t: 'madeira', v: nome }, pag: 'LJ p. 309', obs: `${T.mad} peças` }));
  Object.entries(NV.fort).forEach(([k, f]) => add('Casco', 'fort:' + k, 'Fortificação de ' + f.n, `+${f.cr} na CR${k === 'temperado' ? ' · resistência a dano Contundente, Cortante e Perfurante' : ''}`,
    { c: T.fort * f.p + NV.fortExtra, t: (idx >= 3 ? 30 : 15) * D, eng: true, tem: P.fort === k, ac: { t: 'fort', v: k }, pag: 'LJ p. 309', obs: `${T.fort} peças` }));
  add('Casco', 'kairo', 'Casco revestido de Kairoseki', '+1 na CR · Rei dos Mares não aparece na navegação · sempre dá para consertar', { c: T.kairo[2] + T.kairo[3], t: T.kairo[1] * D, eng: true, tem: !!P.kairo, ac: { t: 'kairo' }, pag: 'LJ p. 310', obs: `${T.kairo[0]} peças · Ala S do Mercado Negro` });
  const cheioM = (P.mastros || []).length >= T.mast[1];
  Object.entries(NV.mastro).forEach(([k, m]) => add('Velas e manejo', 'mastro:' + k, m.n, `+${m.v} nós`, { p: m.p, c: m.c, t: m.d * D, blq: cheioM ? `Já tem ${T.mast[1]} mastro(s), o máximo. Tire um antes.` : '', ac: { t: 'mastro', v: k }, pag: 'LJ p. 310' }));
  Object.entries(NV.leme).forEach(([k, m]) => add('Velas e manejo', 'leme:' + k, m.n, k === 'tora' ? 'Pode quebrar em correnteza forte (d20, 5 ou menos).' : 'Mecânico: não quebra na correnteza.',
    { p: m.p, c: m.c, t: m.h * 60, tem: P.leme === k, blq: k === 'tora' && grande ? 'Só para navio Pequeno ou Médio.' : '', ac: { t: 'leme', v: k }, pag: 'LJ p. 310' }));
  Object.entries(NV.ancora).forEach(([k, m]) => add('Velas e manejo', 'ancora:' + k, m.n, k === 'robusta' ? 'Para navio Enorme ou Colossal.' : 'Para navio até Grande.',
    { p: m.p, c: m.c, t: m.d * D, tem: P.ancora === k, blq: k === 'robusta' && idx < 3 ? 'Só para navio Enorme ou Colossal.' : k === 'normal' && idx >= 3 ? 'Navio Enorme ou Colossal usa a Robusta.' : '', ac: { t: 'ancora', v: k }, pag: 'LJ p. 310' }));
  Object.entries(NV.motor).forEach(([k, m]) => add('Motor', 'motor:' + k, m.n, m.det, { p: m.p, c: m.c, t: m.d * D, eng: true, tem: P.motor === k,
    blq: m.grande && !grande ? 'Só para navio Grande ou maior.' : m.sala && !nvTem(n, 'maquinas') ? 'Precisa da Sala das Máquinas (em Cômodos).' : '', ac: { t: 'motor', v: k }, pag: 'LJ p. 311' }));
  add('Motor', 'turbina', NV.turbina.n, NV.turbina.det, { p: NV.turbina.p, c: NV.turbina.c, t: NV.turbina.d * D, eng: true, tem: !!P.turbina, blq: grande ? '' : 'Só para navio Grande ou maior.', ac: { t: 'turbina' }, pag: 'LJ p. 311' });
  add('Motor', 'jato', NV.jato.n, NV.jato.det, { c: NV.jato.c, t: NV.jato.d * D, eng: true, tem: !!P.jato, blq: grande ? '' : 'Só para navio Grande ou maior.', ac: { t: 'jato' }, pag: 'LJ p. 311' });
  const can = nvCanhoes(n);
  Object.entries(NV.arma).forEach(([nome, a]) => add('Canhões', 'arma:' + nome, nome === 'Longo Alcance' ? 'Canhão de Longo Alcance' : nome, a.det, { p: a.p, c: a.c, t: a.d * D, cd: a.cd || 0, eng: true,
    blq: a.grande && !grande ? 'Só para navio Grande ou maior.' : !a.mun && can >= T.can ? `Já tem ${T.can} canhões, o máximo.` : '', ac: { t: 'arma', v: nome }, pag: 'LJ p. 315–316', varios: true }));
  const livre = T.com - nvComodosUsados(n);
  NV.comodo.forEach(cm => add('Cômodos', 'comodo:' + cm.k, cm.n, cm.ben, { c: cm.p, t: cm.d * D, eng: !!cm.eng, sem: cm.sem, esp: cm.esp ?? 1, varios: true,
    blq: (cm.esp ?? 1) > livre ? `Não cabe: ocupa ${cm.esp ?? 1} e ${livre > 0 ? `só sobra${livre > 1 ? 'm' : ''} ${livre}` : 'não sobra nenhum'}.` : cm.multiplo && !(P.mastros || []).includes('multiplo') ? 'Só em mastro múltiplo.' : cm.k === 'gerador' && nvTem(n, 'gerador') ? 'Um gerador por navio.' : '',
    ac: { t: 'comodo', v: cm.k }, pag: 'LJ p. 312–313' }));
  return L;
}
const NV_GRUPOS = ['Navio pronto', 'Casco', 'Velas e manejo', 'Motor', 'Canhões', 'Cômodos'];
const NVUI = { det: {} };
document.addEventListener('toggle', e => { const d = e.target; if (d && d.dataset && d.dataset.estDet) NVUI.det[d.dataset.estDet] = d.open; }, true);

/* ───── comprar, construir, pedir ───── */
const nvCobrar = () => lembrar('est-cobrar') !== '0';
const nvAjud = () => clamp(nvN(lembrar('est-ajud')), 0, 5);
/* faz a compra de verdade (mestre): desconta do banco e instala, ou põe na fila de obras */
async function nvFechar(o, modo, quem, semCobrar) {
  const valor = modo === 'c' ? o.c : o.p, tempo = modo === 'c' ? Math.round(o.t * (1 - nvAjud() * 0.1)) : 0, cobra = !semCobrar && nvCobrar() && valor > 0;
  if (cobra && bancoSaldo() < valor) { toast(`O banco do bando tem ${nvB(bancoSaldo())}. Faltam <b>${nvB(valor - bancoSaldo())}</b> para ${esc(o.n)}.`, { tipo: 'ruim', tempo: 6000 }); return false; }
  if (cobra) await bancoMov(-valor, `Navio: ${o.n}${modo === 'c' ? ' (construção)' : ''}`, quem);
  const por = quem ? ` (pedido de ${quem})` : '';
  if (modo === 'c' && tempo > 0) { const fim = Relogio.agora().min + tempo;
    await nvGravar(n => { n.obras = [...(n.obras || []), { id: novoId(), nome: o.n, ac: o.ac, fim, custo: cobra ? valor : 0, eng: !!o.eng, cd: o.cd || 0 }]; }, `começou a obra: ${o.n}, pronta em ${nvTempo(tempo)}${por}`);
    toast(`Obra começada: <b>${esc(o.n)}</b>. Fica pronta em ${nvTempo(tempo)}.`, { tipo: 'bom', tempo: 5000 });
  } else { await nvGravar(n => nvAplica(n, o.ac), `${o.troca ? 'trocou de navio' : 'instalou'}: ${o.n}${cobra ? ` por ${nvB(valor)}` : ''}${por}`); toast(`<b>${esc(o.n)}</b> ${o.troca ? 'é o navio do bando agora' : 'instalado'}.`, { tipo: 'bom' }); Som.tocar('moeda'); }
  return true;
}
ACT['est-comprar'] = el => {
  const n = navio(), o = nvOfertas(n).find(x => x.k === el.dataset.k), modo = el.dataset.m === 'c' ? 'c' : 'p'; if (!o) return;
  if (o.blq) return toast(esc(o.blq), { tipo: 'ruim' });
  const valor = modo === 'c' ? o.c : o.p, gratis = o.soMestre && souMestre(); if (valor == null && !gratis) return;
  if (gratis) return confirmar(`Pôr o <b>${esc(o.n)}</b> como navio do bando, sem cobrar? O navio atual é trocado por este (nome, arte e anotações ficam).`, () => nvFechar(o, 'p', null, true), { ok: 'Pôr' });
  const tempo = modo === 'c' ? Math.round(o.t * (1 - nvAjud() * 0.1)) : 0;
  const extra = o.troca ? '<br><b>O navio atual é trocado por este</b> (nome, arte e anotações ficam).' : modo === 'c' ? `<br>Fica pronto em <b>${nvTempo(tempo)}</b>. Quem faz: ${o.eng ? 'Engenheiro' : 'Carpinteiro'}${o.cd ? ` (teste CD ${o.cd})` : ''}.` : '';
  if (souMestre()) return confirmar(`${modo === 'c' ? 'Construir' : 'Comprar'} <b>${esc(o.n)}</b> por <b>${nvB(valor)}</b>?${nvCobrar() ? ' Sai do banco do bando.' : ' Sem cobrar do banco.'}${extra}`, () => nvFechar(o, modo), { ok: modo === 'c' ? 'Construir' : 'Comprar' });
  if (o.soMestre) return toast('Só o mestre põe esse navio.', { tipo: 'ruim' });
  const meus = ((eu().banco || {}).ped || []);
  if (meus.length >= 8) return toast('Você já tem 8 pedidos esperando o mestre.', { tipo: 'ruim' });
  confirmar(`Pedir ao mestre: ${modo === 'c' ? 'construir' : 'comprar'} <b>${esc(o.n)}</b> por <b>${nvB(valor)}</b> do banco do bando?${extra}`, () =>
    gravarEu({ banco: { ped: [...meus, { id: novoId(), tipo: 'navio', k: o.k, m: modo, nome: o.n, v: valor, em: Date.now() }] } }).then(() => toast('Pedido enviado. O mestre aprova ou recusa.', { tipo: 'bom' })), { ok: 'Pedir' });
};
ACT['est-cobrar'] = el => { lembrar('est-cobrar', el.checked ? '1' : '0'); App.render(); };
ACT['est-ajud'] = el => { lembrar('est-ajud', String(clamp(nvN(el.value), 0, 5))); App.render(); };
/* liga o modo por peças: parte do modelo do livro para o tamanho atual */
ACT['est-ligar'] = () => { if (!souMestre()) return; const n = navio(), m = nvDeModelo(NV.modelo[n.tamanho] ? n.tamanho : 'Pequeno'), x = nvCalc(Object.assign({}, n, { pecas: m.pecas, aj: m.aj, comodos: [...(n.comodos || []), ...m.comodos] }));
  confirmar(`Montar o <b>${esc(n.nome)}</b> por peças?<br>O site passa a calcular sozinho. Com as peças do modelo ${esc(n.tamanho)} do livro e a madeira ${esc(n.madeira)}: CR ${x.cr}, BR ${x.br}, ${x.pvMax} PV, ${x.vel} nós.<br>Armas, cômodos e anotações ficam como estão.`,
    () => nvGravar(v => { v.pecas = m.pecas; v.aj = m.aj; if (m.comodos.length && !nvTem(v, 'maquinas')) v.comodos = [...(v.comodos || []), ...m.comodos]; if (!(v.armas || []).length) v.armas = m.armas; }, 'passou a montar o navio por peças'), { ok: 'Montar por peças' }); };
ACT['est-desligar'] = () => souMestre() && confirmar('Voltar ao navio digitado à mão? As peças somem, os números de agora ficam.', () => gravarNavio({ pecas: APAGAR, obras: [], aj: APAGAR }, 'voltou ao navio digitado à mão'));
/* mestre tira uma peça (sem devolver dinheiro) */
ACT['est-tirar'] = el => { if (!souMestre()) return; const t = el.dataset.t, i = +el.dataset.i, P = navio().pecas || {};
  const nome = t === 'mastro' ? (NV.mastro[(P.mastros || [])[i]] || {}).n : t === 'motor' ? (NV.motor[P.motor] || {}).n : t === 'fort' ? 'a fortificação' : t === 'kairo' ? 'o kairoseki' : t === 'turbina' ? NV.turbina.n : t === 'leme' ? 'o leme' : NV.jato.n;
  confirmar(`Tirar <b>${esc(nome || 'a peça')}</b> do navio? O dinheiro não volta.`, () => nvGravar(n => { const Q = n.pecas;
    if (t === 'mastro') Q.mastros = (Q.mastros || []).filter((_, k) => k !== i); else if (t === 'motor') Q.motor = ''; else if (t === 'fort') Q.fort = ''; else if (t === 'leme') Q.leme = ''; else Q[t] = false; }, `tirou ${nome}`), { ok: 'Tirar' }); };
/* ajustes livres do mestre */
ACT['est-aj'] = el => { if (!souMestre()) return; const k = el.dataset.k, v = nvN(el.value); nvGravar(n => { n.aj = Object.assign({}, n.aj, { [k]: v }); }, `ajustou ${({ cr: 'a CR', br: 'o BR', pvMax: 'o PV máximo', vel: 'a velocidade' })[k]} em ${sg(v)}`); };
ACT['est-tam'] = el => souMestre() && nvGravar(n => { n.tamanho = el.value; }, `mudou o tamanho para ${el.value}`);
ACT['est-mad'] = el => souMestre() && nvGravar(n => { n.madeira = el.value; }, `trocou a madeira para ${el.value}`);
ACT['est-flag'] = el => souMestre() && nvGravar(n => { n.pecas[el.dataset.k] = !!el.checked; }, el.dataset.k === 'carp' ? (el.checked ? 'marcou: construído por Carpinteiro do bando (+12 nós, +3 CR)' : 'desmarcou a Eficácia do Carpinteiro') : (el.checked ? 'o navio ganhou um Klabautermann' : 'o Klabautermann se foi'));
/* obras */
ACT['est-obra-fim'] = el => { if (!souMestre()) return; const n = navio(), o = (n.obras || []).find(x => x.id === el.dataset.id); if (!o) return;
  const falta = o.fim - Relogio.agora().min, fazer = () => nvGravar(v => { v.obras = (v.obras || []).filter(x => x.id !== o.id); nvAplica(v, o.ac); }, `terminou a obra: ${o.nome}`).then(() => { toast(`Obra pronta: <b>${esc(o.nome)}</b>.`, { tipo: 'bom' }); Som.tocar('moeda'); });
  falta > 0 ? confirmar(`<b>${esc(o.nome)}</b> ainda leva ${nvTempo(falta)}. Terminar agora mesmo assim?`, fazer, { ok: 'Terminar agora' }) : fazer(); };
ACT['est-obra-cancelar'] = el => { if (!souMestre()) return; const n = navio(), o = (n.obras || []).find(x => x.id === el.dataset.id); if (!o) return;
  confirmar(`Cancelar a obra <b>${esc(o.nome)}</b>?${o.custo ? ` Os ${nvB(o.custo)} voltam para o banco.` : ''}`, async () => { if (o.custo) await bancoMov(o.custo, `Obra cancelada: ${o.nome}`); nvGravar(v => { v.obras = (v.obras || []).filter(x => x.id !== o.id); }, `cancelou a obra: ${o.nome}`); }, { ok: 'Cancelar a obra' }); };
/* despesas da semana (LJ p. 312): sem pagar, o cômodo não dá benefício */
const nvDespAtrasada = n => nvDespesa(n) > 0 && !!(n.desp && n.desp.ate) && Relogio.agora().dia > n.desp.ate;
ACT['est-semana'] = () => { if (!souMestre()) return; const n = navio(), v = nvDespesa(n), hoje = Relogio.agora().dia; if (!v) return;
  if (nvCobrar() && bancoSaldo() < v) return toast(`O banco tem ${nvB(bancoSaldo())}. Faltam ${nvB(v - bancoSaldo())} para a semana.`, { tipo: 'ruim' });
  confirmar(`Pagar a semana dos cômodos: <b>${nvB(v)}</b>?${nvCobrar() ? ' Sai do banco do bando.' : ''}`, async () => { if (nvCobrar()) await bancoMov(-v, 'Despesas da semana dos cômodos');
    gravarNavio({ desp: { ate: Math.max(hoje, nvN((n.desp || {}).ate)) + 7 } }, `pagou a semana dos cômodos (${nvB(v)})`); }, { ok: 'Pagar' }); };
/* conserto (LJ p. 140 e 317) */
function nvConserto(n) {
  const c = nvCalc(n), falta = Math.max(0, nvN(n.pvMax) - nvN(n.pv)), p = n.pvMax ? n.pv / n.pvMax : 1; if (!c || !falta) return null;
  const P = n.pecas || {}, irrep = p <= 0.05 && !P.kairo, faixa = p <= 0.5 ? 2 : p <= 0.8 ? 1 : 0;
  return { falta, irrep, carp: { dado: ['1d6', '2d6', '4d6'][faixa], custo: falta * c.Md.rep + [15000, 100000, 300000][faixa] }, fora: { dias: [5, 12, 50][faixa], custo: Math.round(c.valor * [0.2, 0.45, 1][faixa]), pct: [20, 45, 100][faixa] } };
}
ACT['est-conserto'] = el => { if (!souMestre()) return; const n = navio(), k = nvConserto(n); if (!k || k.irrep) return; const carp = el.dataset.q === 'carp';
  const dias = carp ? rolar(k.carp.dado).total : k.fora.dias, custo = carp ? k.carp.custo : k.fora.custo;
  if (nvCobrar() && bancoSaldo() < custo) return toast(`O banco tem ${nvB(bancoSaldo())}. Faltam ${nvB(custo - bancoSaldo())} para o conserto.`, { tipo: 'ruim', tempo: 6000 });
  confirmar(`Consertar ${k.falta} PV ${carp ? 'com o Carpinteiro do bando' : 'num estaleiro contratado'}: <b>${nvB(custo)}</b>, pronto em <b>${dias} dia${dias > 1 ? 's' : ''}</b>${carp ? ` (rolei ${k.carp.dado})` : ''}.${nvCobrar() ? ' Sai do banco.' : ''}`, async () => {
    if (nvCobrar()) await bancoMov(-custo, `Conserto do navio (${k.falta} PV)`);
    nvGravar(v => { v.obras = [...(v.obras || []), { id: novoId(), nome: `Conserto de ${k.falta} PV`, ac: { t: 'conserto', v: k.falta }, fim: Relogio.agora().min + dias * 1440, custo: nvCobrar() ? custo : 0 }]; }, `mandou consertar ${k.falta} PV (${dias} dias)`); }, { ok: 'Consertar' }); };
/* Reparo Emergencial do Carpinteiro (LJ p. 140): PV paralelos que apanham primeiro e somem em 2d6 dias */
const nvPar = n => n.par && n.par.v > 0 && Relogio.agora().dia <= n.par.ate ? n.par.v : 0;
ACT['est-emergencia'] = () => { if (!souMestre()) return; const r = rolar('30d10'), dias = rolar('2d6').total, v = r.total + 50;
  confirmar(`Reparo Emergencial: o Carpinteiro passa no teste de <b>Sabedoria CD 15</b> e gasta 1d4 kits de construção.<br>O navio ganha <b>${v} PV paralelos</b> (30d10 + 50), que apanham antes do PV normal e somem em ${dias} dias. Um reparo novo troca o antigo.`,
    () => gravarNavio({ par: { v, ate: Relogio.agora().dia + dias } }, `Reparo Emergencial: +${v} PV paralelos por ${dias} dias`), { ok: 'Aplicar' }); };
ACT['est-par-fim'] = () => souMestre() && gravarNavio({ par: APAGAR }, 'tirou os PV paralelos');
/* Klabautermann (LJ p. 313): auto reparo no fim do dia */
ACT['est-klab-dia'] = () => { if (!souMestre()) return; const n = navio(), v = 50 * (NV_ORD.indexOf(n.tamanho) + 1); gravarNavio({ pv: Math.min(n.pvMax, n.pv + v) }, `Klabautermann consertou ${v} PV no fim do dia`); };
/* o dano bate primeiro nos PV paralelos */
ACT['nv-dano'] = () => { const n = navio(), d = num($('#nv-val').value) || 0; if (!d) return; const f = Math.max(0, d - (n.br || 0)), par = nvPar(n), noPar = Math.min(par, f), resto = f - noPar;
  const patch = { pv: n.pv - resto }; if (noPar) patch.par = { v: par - noPar, ate: n.par.ate };
  gravarNavio(patch, `navio levou ${f} de dano (${d} − BR ${n.br})${noPar ? `, ${noPar} nos PV paralelos` : ''}`); Som.tocar('canhao'); };

/* ───── efetivo da tripulação (LJ p. 300) ───── */
function nvEfetivo() {
  const n = navio(), e = (M.trip || {}).efe; if (!e) return null;
  const T = NV.efe[n.tamanho] || NV.efe.Pequeno, can = nvCanhoes(n), vigia = nvTem(n, 'vigia'), tot = nvN(e.tot), lot = (NV.tam[n.tamanho] || NV.tam.Pequeno).trip + (nvTem(n, 'cozinha') ? 5 : 0);
  const est = (tem, min, nec) => tem < min ? 'sem' : tem < nec ? 'min' : 'ok';
  const L = [
    { k: 'nav', n: 'Navegação', tem: nvN(e.nav), min: T.nav[0], nec: T.nav[1], sem: 'O navio não navega.', mn: 'Testes de navegação com desvantagem e o navio não faz manobras.' },
    { k: 'limp', n: 'Limpeza', tem: nvN(e.limp), min: T.limp[0], nec: T.limp[1], sem: 'A cada 4 dias, Salvaguarda de Constituição CD 18 ou fica Doente. Andar no navio custa o dobro.', mn: 'Andar no navio custa o dobro.' },
    { k: 'vig', n: 'Vigilância', tem: nvN(e.vig), min: T.vig[0], nec: vigia ? 2 : T.vig[1], sem: 'Infiltração pode roubar tudo e ataques-surpresa são frequentes.', mn: 'Ataque-surpresa se falhar Percepção CD 18 a cada duas noites.' },
    { k: 'art', n: 'Artilheiros', tem: nvN(e.art), min: can, nec: can, sem: `Só ${nvN(e.art)} de ${can} canhões atiram (1 artilheiro por canhão).`, mn: '' },
    { k: 'polv', n: 'Rapazes da pólvora', tem: nvN(e.polv), min: 0, nec: can, sem: '', mn: 'Canhão sem rapaz da pólvora não atira 2 turnos seguidos.' },
    { k: 'coz', n: 'Cozinheiros (e ajudantes)', tem: nvN(e.coz), min: tot > 0 ? 1 + Math.max(0, Math.ceil((tot - 50) / 25)) : 0, nec: tot > 0 ? 1 + Math.max(0, Math.ceil((tot - 50) / 25)) : 0, sem: 'Parte da tripulação fica sem comer (1 cozinheiro alimenta 50; cada ajudante, mais 25).', mn: '' }
  ];
  L.forEach(x => { x.est = est(x.tem, x.min, x.nec); });
  return { L, tot, lot, cheio: tot > lot, semCozinha: tot > 0 && !nvTem(n, 'cozinha') && !!n.pecas };
}
ACT['tp-efe'] = el => { if (!souMestre()) return; DB.gravar('mesa/tripulacao', { efe: { [el.dataset.k]: Math.max(0, Math.round(nvN(el.value))) } }); };
ACT['tp-efe-ligar'] = () => souMestre() && DB.gravar('mesa/tripulacao', { efe: { nav: 0, limp: 0, vig: 0, art: 0, polv: 0, coz: 0, tot: (M.jogadores || []).filter(j => j.estilo).length } }).then(() => toast('Efetivo ligado. Preencha quantos tripulantes cuidam de cada função.', { tipo: 'bom' }));
ACT['tp-efe-fim'] = () => souMestre() && confirmar('Desligar o controle de efetivo?', () => DB.gravar('mesa/tripulacao', { efe: APAGAR }));
function nvEfetivoHTML() {
  const m = souMestre(), E = nvEfetivo(), n = navio();
  if (!E) return m ? `<section class="pap trip-efe"><h2>${ic('mesa:tripulacao', 32)} Funções e efetivo</h2><p class="nota">O livro pede um número mínimo de tripulantes por função, pelo tamanho do navio (LJ p. 300). Ligue para o site conferir e avisar.</p><button class="bt" data-act="tp-efe-ligar">Controlar o efetivo</button></section>` : '';
  return `<section class="pap trip-efe"><h2>${ic('mesa:tripulacao', 32)} Funções e efetivo <small>navio ${esc(n.tamanho)} · LJ p. 300</small></h2>
    <p class="efe-tot">Tripulantes a bordo: ${m ? `<input type="number" min="0" value="${E.tot}" data-chg="tp-efe" data-k="tot" style="width:5em">` : `<b>${E.tot}</b>`} de ${E.lot} que cabem${E.cheio ? ' <b class="ruim">(lotação estourada)</b>' : ''}${E.semCozinha ? ' · <b class="ruim">sem Cozinha: não dá para preparar comida</b>' : ''}</p>
    <table class="tab efe-tab"><thead><tr><th>Função</th><th>Tem</th><th>Mínimo</th><th>Necessário</th><th>Como está</th></tr></thead><tbody>${E.L.map(x => `<tr class="efe-${x.est}"><td>${x.n}</td>
      <td>${m ? `<input type="number" min="0" value="${x.tem}" data-chg="tp-efe" data-k="${x.k}" style="width:4.5em" aria-label="${x.n}">` : `<b>${x.tem}</b>`}</td><td>${x.min}</td><td>${x.nec}</td>
      <td>${x.est === 'ok' ? 'Completo' : `<b>${x.est === 'sem' ? 'Abaixo do mínimo' : 'Só o mínimo'}.</b> ${x.est === 'sem' ? x.sem : x.mn}`}</td></tr>`).join('')}</tbody></table>
    <p class="nota">Cada pessoa faz até 3 funções e só 1 de comando. Com 2 funções não treina na viagem; com 3, não exerce a profissão (LJ p. 299). Homem das Armas dá +3 nos tiros de canhão.${m ? ' <button class="link" data-act="tp-efe-fim">Desligar</button>' : ''}</p></section>`;
}
/* ───── a aba Navio ───── */
function nvEstaleiroHTML(n, c, m) {
  const O = nvOfertas(n), saldo = bancoSaldo(), ajud = nvAjud();
  const linha = o => { const dias = Math.round(o.t * (1 - ajud * 0.1));
    const bt = (modo, v, txt) => v == null ? '' : `<button class="bt fino ${modo === 'p' ? 'ouro' : ''}" data-act="est-comprar" data-k="${esc(o.k)}" data-m="${modo}" ${o.blq ? 'disabled' : ''} title="${modo === 'c' ? `Leva ${nvTempo(dias)}. Quem faz: ${o.eng ? 'Engenheiro' : 'Carpinteiro'}.` : 'Pronto na hora.'}">${m ? txt : 'Pedir: ' + txt.toLowerCase()} ${nvB(v)}${modo === 'c' ? ` · ${nvTempo(dias)}` : ''}</button>`;
    if (o.soMestre && !m) return '';
    return `<li class="est-it ${o.tem ? 'tem' : ''} ${o.blq ? 'blq' : ''}"><div class="est-nome"><b>${esc(o.n)}</b>${o.tem ? '<span class="tag bom">instalado</span>' : ''}${o.obs ? `<small>${esc(o.obs)}</small>` : ''}<small class="est-pag">${o.pag}</small></div>
      <p class="est-det">${esc(o.det)}${o.sem ? ` <b>Despesa: ${nvB(o.sem)} por semana.</b>` : ''}${o.esp > 1 ? ` Ocupa ${o.esp} cômodos.` : ''}${o.cd ? ` Construir: teste CD ${o.cd}.` : ''}</p>
      ${o.blq ? `<p class="est-blq">${esc(o.blq)}</p>` : o.tem && !o.varios ? '' : `<div class="est-bts">${o.soMestre ? `<button class="bt fino" data-act="est-comprar" data-k="${esc(o.k)}" data-m="p" data-free="1">Pôr este navio</button>` : bt('p', o.p, 'Comprar')}${bt('c', o.c, 'Construir')}</div>`}</li>`; };
  return `<section class="painel-cat est"><h2>${ic('prof:carpinteiro', 32) || ic('navios:canhao', 32)} Estaleiro <small>peças do Livro do Jogador, cap. 14</small></h2>
    <div class="est-topo"><span class="est-saldo">${ic('itensop:beli_moedas', 32)} Banco do bando: <b>${nvB(saldo)}</b></span>
      ${m ? `<label class="check"><input type="checkbox" data-chg="est-cobrar" ${nvCobrar() ? 'checked' : ''}> Cobrar do banco</label><label class="campo-inline">Ajudantes na obra <select data-chg="est-ajud">${[0, 1, 2, 3, 4, 5].map(k => `<option ${k === ajud ? 'selected' : ''}>${k}</option>`).join('')}</select></label>` : `<button class="bt fino" data-rota="banco">Abrir o banco</button>`}</div>
    <p class="nota"><b>Comprar</b> fica pronto na hora. <b>Construir</b> custa menos, leva dias e precisa de um Carpinteiro ou Engenheiro no bando. ${m ? 'Cada ajudante tira 10% do tempo (até 50%).' : 'Você pede; o mestre aprova e o dinheiro sai do banco.'}</p>
    ${NV_GRUPOS.map(g => { const its = O.filter(o => o.g === g).map(linha).join(''); return its ? `<details class="est-g" data-est-det="${g}" ${NVUI.det[g] ? 'open' : ''}><summary>${g}${g === 'Canhões' ? ` <small>${c.can} de ${c.canMax}</small>` : g === 'Cômodos' ? ` <small>${c.com} de ${c.comMax}</small>` : ''}</summary><ul class="est-l">${its}</ul></details>` : ''; }).join('')}</section>`;
}
function nvPecasHTML(n, c, m) {
  const P = n.pecas, x = (t, i) => m ? `<button class="bt-ic mini" data-act="est-tirar" data-t="${t}" ${i != null ? `data-i="${i}"` : ''} title="Tirar">✕</button>` : '';
  const li = (nome, det, bt) => `<li><b>${esc(nome)}</b>${det ? `<small>${esc(det)}</small>` : ''}${bt || ''}</li>`;
  return `<section class="painel-cat"><h2>${ic('mar:navio_pirata', 32)} Peças do navio</h2><ul class="nv-l">
    ${li(`Casco ${n.tamanho} de ${n.madeira}`, `${c.T.deq} deque(s) · ${c.T.pv} PV · pesa −${c.T.peso} nós`)}
    ${P.fort ? li('Fortificação de ' + NV.fort[P.fort].n, `+${NV.fort[P.fort].cr} CR`, x('fort')) : ''}${P.kairo ? li('Casco de Kairoseki', '+1 CR', x('kairo')) : ''}
    ${(P.mastros || []).map((k, i) => li((NV.mastro[k] || {}).n || 'Mastro', `+${(NV.mastro[k] || {}).v || 0} nós`, x('mastro', i))).join('') || li('Sem mastro', 'o navio não pega vento')}
    ${P.leme ? li(NV.leme[P.leme].n, '', x('leme')) : li('Sem leme', '')}${P.ancora ? li((NV.ancora[P.ancora] || {}).n || 'Âncora', '') : ''}
    ${P.motor ? li(NV.motor[P.motor].n, `+${NV.motor[P.motor].v} nós`, x('motor')) : ''}${P.turbina ? li(NV.turbina.n, '+8 nós por 2 h', x('turbina')) : ''}${P.jato ? li(NV.jato.n, 'voa até 2 km', x('jato')) : ''}
    ${P.carp ? li('Feito por Carpinteiro do bando', 'Eficácia: +12 nós e +3 CR (LJ p. 140)') : ''}${P.klab ? li('Klabautermann', `espírito do navio: +${50 * (NV_ORD.indexOf(n.tamanho) + 1)} PV no fim de cada dia`, m ? `<button class="bt fino" data-act="est-klab-dia">Fim do dia</button>` : '') : ''}</ul>
    <p class="nota">Velocidade: ${c.velM} dos mastros${c.velMo ? ` + ${c.velMo} do motor` : ''} − ${c.T.peso} do peso${P.carp ? ' + 12 da Eficácia' : ''}${nvN((n.aj || {}).vel) ? ` ${sg(nvN(n.aj.vel))} de ajuste` : ''} = <b>${c.vel} nós</b>. Valor do navio: ${nvB(c.valor)}.</p>
    ${m ? `<details class="est-mestre" data-est-det="mestre" ${NVUI.det.mestre ? 'open' : ''}><summary>Ajustes do mestre (sem cobrar)</summary>
      <div class="linha-bts"><label class="campo-inline">Tamanho <select data-chg="est-tam">${NV_ORD.map(t => `<option ${t === n.tamanho ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
        <label class="campo-inline">Madeira <select data-chg="est-mad">${Object.keys(NV.madeira).map(t => `<option ${t === n.madeira ? 'selected' : ''}>${t}</option>`).join('')}</select></label></div>
      <div class="linha-bts">${[['cr', 'CR'], ['br', 'BR'], ['pvMax', 'PV máx.'], ['vel', 'Nós']].map(([k, t]) => `<label class="campo-inline">${t} ± <input type="number" value="${nvN((n.aj || {})[k])}" data-chg="est-aj" data-k="${k}" style="width:4.5em"></label>`).join('')}</div>
      <label class="check"><input type="checkbox" data-chg="est-flag" data-k="carp" ${P.carp ? 'checked' : ''}> Construído por um Carpinteiro do bando (Eficácia: +12 nós, +3 CR)</label>
      <label class="check"><input type="checkbox" data-chg="est-flag" data-k="klab" ${P.klab ? 'checked' : ''}> O navio tem um Klabautermann (LJ p. 313)</label>
      <p class="nota">O "±" soma ou tira do número calculado (um presente, uma avaria, uma regra da casa). <button class="link" data-act="est-desligar">Voltar ao navio digitado à mão</button></p></details>` : ''}</section>`;
}
VIEWS.navio.chaves = ['navio', 'navioLog', 'trip', 'banco', 'jogadores', 'estado'];
VIEWS.navio.render = function () {
  const n = navio(), m = souMestre(), pode = podeMexerNavio(), st = estadoNavio(n.pv, n.pvMax), tam = TAM_NAVIO[n.tamanho] || TAM_NAVIO.Pequeno, c = nvCalc(n);
  const velReal = st.vel == null ? 0 : Math.max(8, n.vel + st.vel), L = M.navioLog || [], jolly = (M.trip || {}).jolly, par = nvPar(n), R = Relogio.agora(), K = nvConserto(n), E = nvEfetivo();
  const campo = (k, v, tipo = 'number', extra = '') => pode && !c ? `<input type="${tipo}" value="${esc(v)}" data-chg="nv-campo" data-k="${k}" ${extra}>` : `<b>${esc(v)}</b>`;
  const desp = nvDespesa(n), atras = nvDespAtrasada(n), obras = n.obras || [];
  const efeRuim = E ? E.L.filter(x => x.est !== 'ok') : [];
  return `<div class="navio-v"><h1>${ic('mar:navio_pirata', 64)}Navio</h1>
    ${m ? `<section class="painel-cat nv-chave"><label class="ck"><input type="checkbox" data-chg="nv-editavel" ${n.editavel ? 'checked' : ''}> <b>Os jogadores podem mexer no navio</b></label>
      <p class="nota">Desligado, eles só olham e pedem compras. Ligado, eles também mudam PV, nome e anotações, e tudo fica no histórico.</p></section>`
      : `<p class="nota nv-aviso">${pode ? 'O mestre liberou: vocês podem atualizar o navio. Tudo fica registrado no histórico.' : 'Vocês podem pedir compras no Estaleiro. O resto só o mestre mexe.'}</p>`}
    <section class="painel-cat nv-cab">
      <div class="nv-img">${n.img ? iconeHTML(n.img, 160) : ic('mar:navio_pirata', 128)}${pode ? `<div class="linha-bts"><button class="bt fino" data-act="nv-img">Ícone</button><button class="bt fino" data-act="nv-img-up">Enviar arte</button></div>` : ''}</div>
      <div class="nv-id">${pode ? `<input class="nv-nome" value="${esc(n.nome)}" data-chg="nv-campo" data-k="nome" data-t="texto" aria-label="Nome do navio">` : `<h2>${esc(n.nome)}</h2>`}
        <p class="nv-tags"><span class="tag">${esc(n.tamanho)}</span><span class="tag">${esc(n.madeira)}</span><span class="tag ${st.cls}">${st.t}</span>${c && n.pecas.klab ? '<span class="tag bom">Klabautermann</span>' : ''}${jolly ? `<span class="nv-jolly">${iconeHTML(jolly, 32)}</span>` : ''}</p>
        ${pode && !c ? `<div class="linha-bts"><label class="campo-inline">Tamanho <select data-chg="nv-tam">${Object.keys(TAM_NAVIO).map(t => `<option ${t === n.tamanho ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
          <label class="campo-inline">Madeira <select data-chg="nv-mad">${Object.keys(MADEIRA).map(t => `<option ${t === n.madeira ? 'selected' : ''}>${t}</option>`).join('')}</select></label></div>
          <p class="nota">Trocar o tamanho preenche PV, velocidade e canhões pela tabela do livro (LJ p. 320). Trocar a madeira preenche CR e BR (LJ p. 316). Depois dá para ajustar à mão.</p>` : ''}
        ${!c && m ? `<div class="est-convite"><b>Estaleiro:</b> monte o navio por peças (mastros, leme, motor, canhões, cômodos) e o site calcula CR, PV e velocidade sozinho. <button class="bt ouro" data-act="est-ligar">Montar por peças</button></div>` : ''}
      </div></section>
    <section class="painel-cat nv-vida"><div class="vt"><b><i class="at-ic pv"></i>PV</b>${blocos(n.pv, n.pvMax, 'pv', pode ? { act: 'nv-pv-set', variante: 'navio' } : { variante: 'navio' })}<span>${n.pv}/${n.pvMax}</span>
      ${pode ? `<input id="nv-val" type="number" inputmode="numeric" placeholder="0" aria-label="Valor" style="width:5em"><button class="bt ruim fino" data-act="nv-dano">Dano</button><button class="bt bom fino" data-act="nv-conserto">Conserto</button>` : ''}</div>
      ${par ? `<p class="nv-par">${ic('status:defesa', 32)} <b>${par} PV paralelos</b> do Reparo Emergencial: apanham primeiro e somem no dia ${n.par.ate} (hoje é dia ${R.dia}).${m ? ' <button class="link" data-act="est-par-fim">tirar</button>' : ''}</p>` : ''}
      <p class="nota">${st.nota}${st.vel ? ` Velocidade ${st.vel} nós.` : ''} ${pode ? `O dano já desconta o BR (${n.br}).` : ''}</p>
      ${K ? `<div class="nv-cons"><b>Consertar ${K.falta} PV:</b> ${K.irrep ? 'o casco está <b>irreparável</b> (5% ou menos de PV).' : `com o Carpinteiro do bando <b>${nvB(K.carp.custo)}</b> e ${K.carp.dado} dias (LJ p. 140) · em estaleiro contratado até <b>${nvB(K.fora.custo)}</b> (${K.fora.pct}% do valor) e ${K.fora.dias} dias (LJ p. 317).`}
        ${m && !K.irrep ? `<span class="linha-bts"><button class="bt fino" data-act="est-conserto" data-q="carp">Carpinteiro conserta</button><button class="bt fino" data-act="est-conserto" data-q="fora">Contratar estaleiro</button></span>` : ''}</div>` : ''}
      ${m ? `<p class="linha-bts"><button class="bt fino" data-act="est-emergencia" title="Carpinteiro, no meio da batalha: 30d10 + 50 PV paralelos">Reparo Emergencial</button></p>` : ''}</section>
    <ul class="nums nv-nums">
      <li>${ic('status:defesa', 32)}<span>CR</span>${campo('cr', n.cr, 'number', 'style="width:4em"')}</li>
      <li><i class="at-ic defesa" style="width:32px;height:32px"></i><span>BR (madeira)</span>${campo('br', n.br, 'number', 'style="width:4em"')}</li>
      <li>${ic('mar:luneta', 32)}<span>Velocidade</span>${pode && !c ? campo('vel', n.vel, 'number', 'style="width:4em"') : `<b>${velReal} nós</b>`}${st.vel && (c || pode) ? `<small>${c ? `inteiro: ${n.vel} nós` : `agora ${velReal} nós`}</small>` : ''}</li>
      ${c ? `<li>${ic('navios:canhao', 32)}<span>Canhões</span><b>${c.can} de ${c.canMax}</b></li><li>${ic('itens:mochila', 32)}<span>Cômodos</span><b>${c.com} de ${c.comMax}</b></li>
        <li>${ic('mesa:tripulacao', 32)}<span>Cabem a bordo</span><b>${c.trip}</b></li>` : `<li>${ic('mesa:tripulacao', 32)}<span>Tripulação mínima</span><small>${tam.trip}</small></li>`}
    </ul>
    ${c && c.av.length ? `<ul class="est-avisos">${c.av.map(a => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}
    ${efeRuim.length ? `<p class="est-efe"><b>Tripulação:</b> ${efeRuim.map(x => `${x.n} ${x.est === 'sem' ? 'abaixo do mínimo' : 'só no mínimo'} (${x.tem} de ${x.nec})`).join(' · ')}. <button class="link" data-rota="tripulacao">Ver em Tripulação</button></p>` : ''}
    ${c && desp ? `<section class="painel-cat est-desp ${atras ? 'atras' : ''}"><h2>${ic('itensop:beli_moedas', 32)} Despesas dos cômodos</h2>
      <p><b>${nvB(desp)} por semana.</b> ${atras ? `<b class="ruim">Atrasado desde o dia ${n.desp.ate}: os cômodos não dão benefício até pagar (LJ p. 312).</b>` : n.desp && n.desp.ate ? `Pago até o dia ${n.desp.ate} (hoje é dia ${R.dia}).` : ''}
      ${m ? `<button class="bt fino ${atras ? 'ouro' : ''}" data-act="est-semana">Pagar a semana</button>` : ''}</p></section>` : ''}
    ${obras.length ? `<section class="painel-cat"><h2>${ic('status:turno', 32)} Obras em andamento</h2><ul class="nv-l est-obras">${obras.map(o => { const falta = o.fim - R.min;
      return `<li class="${falta <= 0 ? 'pronta' : ''}"><b>${esc(o.nome)}</b><small>${falta <= 0 ? 'pronta para instalar' : `faltam ${nvTempo(falta)} (dia ${Math.floor(o.fim / 1440) + 1})`}${o.cd ? ` · teste CD ${o.cd}` : ''}${o.ac && o.ac.t !== 'conserto' ? ` · ${o.eng ? 'Engenheiro' : 'Carpinteiro'}` : ''}</small>
        ${m ? `<span class="nv-bts"><button class="bt fino ${falta <= 0 ? 'ouro' : ''}" data-act="est-obra-fim" data-id="${o.id}">${falta <= 0 ? 'Instalar' : 'Terminar agora'}</button><button class="bt-ic mini" data-act="est-obra-cancelar" data-id="${o.id}" title="Cancelar a obra">✕</button></span>` : ''}</li>`; }).join('')}</ul>
      <p class="nota">O tempo anda com o relógio da Mesa (hoje é dia ${R.dia}).</p></section>` : ''}
    ${typeof bancoPedidosHTML === 'function' ? bancoPedidosHTML('navio') : ''}
    ${c ? nvEstaleiroHTML(n, c, m) : ''}
    <div class="nv-grade">
      ${c ? nvPecasHTML(n, c, m) : ''}
      <section class="painel-cat"><h2>${ic('navios:canhao', 32)} Armas</h2>
        ${n.armas.length ? `<ul class="nv-l">${n.armas.map((a, i) => `<li><b>${esc(a.n)}</b>${a.q > 1 ? ` <small>×${a.q}</small>` : ''}${(c ? m : pode) ? `<span class="nv-bts"><button class="bt-ic mini" data-act="nv-arma-q" data-i="${i}" data-d="-1">−</button>${c ? '' : `<button class="bt-ic mini" data-act="nv-arma-q" data-i="${i}" data-d="1">+</button>`}</span>` : ''}</li>`).join('')}</ul>` : '<p class="nota">Nenhuma arma ainda.</p>'}
        ${pode && !c ? `<div class="linha-bts"><select id="nv-arma">${ARMAS_NAVIO.map(a => `<option>${a}</option>`).join('')}</select><button class="bt fino" data-act="nv-arma-add">+ Arma</button></div>` : ''}
        <p class="nota"><small>${c ? 'Canhão novo: no Estaleiro, em Canhões. Estilhaços são improviso e não custam nada.' : `Tabela das armas no Escudo › Batalha naval (LJ p. 315–316). Pelo tamanho, cabem até ${(NV.tam[n.tamanho] || NV.tam.Pequeno).can} canhões.`}</small></p></section>
      <section class="painel-cat"><h2>${ic('itens:mochila', 32)} Cômodos e melhorias</h2>
        ${n.comodos.length ? `<ul class="nv-l">${n.comodos.map((cm, i) => { const K2 = nvComodo(cm.tipo); return `<li class="${K2 && atras ? 'sem-ben' : ''}"><b>${esc(cm.n)}</b><small>${K2 ? esc(atras ? 'sem benefício: despesa atrasada' : K2.ben) : esc(cm.nota || '')}</small>${(c ? m : pode) ? `<button class="bt-ic mini" data-act="nv-comodo-tirar" data-i="${i}" title="Tirar">✕</button>` : ''}</li>`; }).join('')}</ul>` : '<p class="nota">O navio vem com âncora e cômodos vazios (LJ p. 320).</p>'}
        ${pode ? `<div class="linha-bts"><input id="nv-comodo" placeholder="${c ? 'Outra melhoria (figura de proa, aquário…)' : 'Ex.: cozinha equipada, enfermaria, figura de proa'}" maxlength="60"><input id="nv-comodo-nota" placeholder="Detalhe (opcional)" maxlength="80"><button class="bt fino" data-act="nv-comodo-add">+ Pôr</button></div>` : ''}</section>
    </div>
    <section class="painel-cat"><h2>${ic('tesouro:livro', 32)} Anotações do navio</h2>
      ${pode ? `<textarea rows="3" data-chg="nv-campo" data-k="notas" data-t="texto" placeholder="História do navio, quem construiu, segredos do porão…">${esc(n.notas)}</textarea>` : `<p class="pre">${esc(n.notas || '—')}</p>`}</section>
    <section class="painel-cat"><h2>${ic('modos:anotar', 32)} Histórico</h2>
      ${L.length ? `<ol class="nv-hist">${L.slice(0, 20).map(x => `<li><b>${esc(x.quem || '')}</b> ${esc(x.txt)} <small>${hora(x.em)}</small></li>`).join('')}</ol>` : '<p class="nota">Nada mudou ainda.</p>'}</section>
  </div>`;
};
if (window.__expor) Object.assign(window, { NV, nvCalc, nvDeModelo, nvOfertas, navio, nvEfetivo });
