/* ═══════════ regras: tabelas conferidas no LJ 2.1 e GN 2.0 + contas da mesa ═══════════ */
const COND = [ // nome, ícone, custo PP (técnica de Akuma no Mi), resumo, texto completo — LJ p. 269–273
  ['Agarrado', 'cond1:agarrado', 1, 'Desloc. 0. Acaba se quem agarrou soltar ou ficar incapacitado.', 'Deslocamento 0 e sem bônus de deslocamento. Termina se quem agarrou ficar incapacitado ou soltar.'],
  ['Amedrontado', 'cond1:amedrontado', 1, 'Desv. em testes e ataques comuns vendo a fonte. Não se aproxima dela.', 'Desvantagem em Testes de Atributo e ataques (comum) enquanto a fonte do medo estiver à vista. Não pode se mover para mais perto da fonte do medo.'],
  ['Atordoado', 'cond1:atordoado', 6, 'Incapacitado e parado. Falha Salv. For/Des. Contra: vant. Crítico +2 dados.', 'Incapacitado; não se move e fala com dificuldade. Falha automática em Salvaguardas de Força e Destreza. Ataques contra: vantagem. Crítico contra: +2 dados de dano.'],
  ['Bêbado', 'cond1:bebado', 1, 'Desv. em Salvaguardas e testes de Des. Passa com descanso.', 'Desvantagem em Salvaguardas, testes de Destreza e outros que o Narrador julgar. Termina após descanso curto ou longo (ou café forte, água fria, cena impactante).'],
  ['Caído', 'cond1:caido', 1, 'Só rasteja. Ataques dele: desv. Contra: vant. a 1,5 m, desv. de longe.', 'Só rasteja (cada 1,5 m custa +1,5 m). Seus ataques: desvantagem. Ataques contra: vantagem a até 1,5 m, desvantagem de mais longe. Levantar custa metade do deslocamento (LJ p. 286).'],
  ['Cego', 'cond1:cego', 1, 'Falha no que usa visão. Ataques dele: desv. Contra: vant.', 'Falha automática em testes que usam a visão. Seus ataques: desvantagem. Ataques contra: vantagem.'],
  ['Empoderado', 'cond1:empoderado', 3, 'Ataque comum corpo a corpo vira 1d12. Técnica que erra não gasta PP.', 'Dano de ataque (comum) corpo a corpo vira 1d12 + mod. (fica o maior). PP de técnica que erra o alvo não são gastos. Terreno difícil não reduz o deslocamento.'],
  ['Enfeitiçado', 'cond1:enfeiticado', 2, 'Não ataca quem enfeitiçou. Essa pessoa tem vant. social com ele.', 'Não pode atacar nem prejudicar quem enfeitiçou. Quem enfeitiçou tem vantagem em testes sociais com ele.'],
  ['Enfraquecido', 'cond1:enfraquecido', null, 'Incapacitado, ½ desloc., não nada, sem fruta. Falha todas as Salv. Contra: vant.', 'Água do mar ou Kairoseki. Incapacitado; metade do deslocamento; não nada; não usa nada da Akuma no Mi; desvantagem em testes; ataques contra: vantagem; falha automática em todas as Salvaguardas.'],
  ['Enfurecido', 'cond1:enfurecido', 1, 'Vai pra cima da fonte. Desv. nos ataques. +1d4 corpo a corpo. Sem concentração.', 'Usa todo o deslocamento para alcançar e atacar a fonte da fúria (ataca quem atrapalhar). Desvantagem nos ataques. +1d4 de dano corpo a corpo. Sem concentração. Dura 1 min. Acalmar: ação + Persuasão CD 13.'],
  ['Envenenado', 'cond1:envenenado', 1, 'Desv. em ataques e testes.', 'Desvantagem em ataques (comum ou técnica) e Testes de Atributo. Veneno comum: some após 1 dia de descanso.'],
  ['Estremecido', 'cond1:estremecido', 2, 'Desv. nos ataques. Sem técnicas nem concentração. Andar custa o dobro.', 'Desvantagem nos ataques. Não usa técnicas nem concentração (falha para manter). Cada 1,5 m de deslocamento custa +1,5 m.'],
  ['Impedido', 'cond1:impedido', 2, 'Desloc. 0. Ataques dele e Salv. Des: desv. Contra: vant.', 'Deslocamento 0 e sem bônus. Seus ataques e Salvaguardas de Destreza: desvantagem. Ataques contra: vantagem.'],
  ['Incapacitado', 'cond1:incapacitado', 4, 'Sem ação, ação poderosa, ação bônus ou reação.', 'Não pode fazer ações, ações poderosas, ações bônus nem reações.'],
  ['Inconsciente', 'cond1:inconsciente', 8, 'Caído e incapacitado. Falha Salv. For/Des. Contra: vant.; a 1,5 m é crítico.', 'Incapacitado, não se move nem fala, larga tudo e fica caído. Falha automática em Salv. de Força e Destreza. Ataques contra: vantagem; acerto a até 1,5 m é crítico.'],
  ['Invisível', 'cond1:invisivel', 5, 'Ataques dele: vant. Contra ele: desv.', 'Só é visto com técnica ou sentido especial; conta como escuridão densa para se esconder. Seus ataques: vantagem. Ataques contra: desvantagem.'],
  ['Letárgico', 'cond2:letargico', 2, 'Sem técnicas. Só 1 ação por turno. Dano pela metade (menos arma de fogo).', 'Não usa técnicas. Por turno, escolhe só uma: ação, ação poderosa ou ação bônus. Dano dos ataques pela metade, menos armas de fogo.'],
  ['Paralisado', 'cond2:paralisado', 8, 'Incapacitado e parado. Falha Salv. For/Des. Contra: vant.; a 1,5 m é crítico.', 'Incapacitado; não se move nem fala. Falha automática em Salv. de Força e Destreza. Ataques contra: vantagem; acerto a até 1,5 m é crítico; crítico contra: +2 dados.'],
  ['Queimado', 'cond2:queimado', 1, '1d6 de fogo após o 1º ataque do turno. Sem concentração. Trata: Medicina CD 10.', '1d6 de fogo (não reduz, não vai no PV temporário) logo após o 1º ataque de cada turno. Sem técnicas/características de concentração. Tratar: ação + Medicina CD 10 ou Sobrevivência CD 16.'],
  ['Sangramento', 'cond2:sangramento', 1, '1d6 cortante ao se mover no turno. Trata: Medicina CD 10.', '1d6 cortante (não reduz, não vai no PV temporário) na 1ª vez que se mover por vontade própria em cada turno, antes de mover. Tratar: ação + Medicina CD 10 ou Sobrevivência CD 16.'],
  ['Sonolento', 'cond2:sonolento', 1, 'Sem reações. 1 ataque corpo a corpo por turno. Desv. em testes de Des e Sab.', 'Não usa reações. No máximo 1 ataque (comum) corpo a corpo por turno. Desvantagem em testes de Destreza e Sabedoria.'],
  ['Sufocado', 'cond2:sufocado', 1, 'Não fala. Depois de 1 + mod. Con rodadas: Salv. Con CD 10 (+2 por turno).', 'Não fala. Após 1 + mod. Con rodadas (mín. 1): Salv. Con CD 10 no início de cada turno (+2 por turno) ou fica Inconsciente. Inconsciente e sufocado por mais de 1 min: morre.'],
  ['Surdo', 'cond2:surdo', 1, 'Falha no que usa audição.', 'Falha automática em testes que usam a audição.'],
  ['Doente', 'cond2:doente', null, '½ desloc. e ½ PV máx. Dano também baixa o PV máx. Desv. Furtividade e Percepção.', 'Metade do deslocamento e dos PV máximos. Todo dano também reduz o PV máximo (PV máx. 0 = morte). Desvantagem em Furtividade e Percepção. Falha nas Salvaguardas para manter concentração (LJ p. 273).'],
  ['Despedaçado', 'cond2:despedacado', 5, 'Ope-Ope: desv. ataques comuns, ½ desloc., sem reações, desv. Salv. Des.', '(Ope-Ope no Mi) Desvantagem em ataques (comum). Metade do movimento. Ataques (comum) corpo a corpo contra: vantagem. Sem reações. Desvantagem em Salv. de Destreza.'],
  ['Concentrando', 'cond2:concentrando', null, 'Levou dano: Salv. Con CD 10 ou metade do dano (o maior).', 'Ao sofrer dano, Salvaguarda de Constituição com CD 10 ou metade do dano, o que for maior (LJ p. 267).']
].map(([n, i, pp, r, t]) => ({ n, i, pp, r, t }));
const CONDI = Object.fromEntries(COND.map(c => [c.n, c]));
const BOAS = ['Empoderado', 'Invisível', 'Concentrando'];
const ZERO = ['Agarrado', 'Impedido', 'Paralisado', 'Atordoado', 'Inconsciente'];
const METADE = ['Enfraquecido', 'Doente', 'Despedaçado', 'Estremecido'];
const DESV_ATK = ['Caído', 'Cego', 'Enfurecido', 'Envenenado', 'Estremecido', 'Impedido'];
const DESV_COMUM = DESV_ATK.concat(['Amedrontado', 'Despedaçado']);
const VANT_CONTRA = ['Atordoado', 'Cego', 'Enfraquecido', 'Impedido', 'Inconsciente', 'Paralisado'];
/* desvantagem em Percepção (que é teste de Vontade neste sistema, LJ p. 263). Sonolento não entra: ele pesa em Destreza e Sabedoria (LJ p. 272). */
const DESV_PERC = ['Doente', 'Envenenado', 'Enfraquecido', 'Amedrontado'];
/* desvantagem em teste de Destreza (a iniciativa é um teste de Destreza, LJ p. 284) */
const DESV_TESTE = ['Amedrontado', 'Bêbado', 'Enfraquecido', 'Envenenado', 'Sonolento'];

const EXA = [ // LJ p. 37 e 272 (6º nível: desmaio, cai a 0 PV)
  [0, 0, 0], [1, -2, 1.5], [2, -4, 3], [3, -6, 4.5], [4, -8, 6], [5, -10, 7.5], [6, null, null]];

const ND_XP = { '0': 10, '1/8': 25, '1/4': 50, '1/2': 100, '1': 200, '2': 450, '3': 700, '4': 1100, '5': 1800, '6': 2300, '7': 2900, '8': 3900, '9': 5000, '10': 5900,
  '11': 7200, '12': 8400, '13': 10000, '14': 11500, '15': 13000, '16': 15000, '17': 18000, '18': 20000, '19': 22000, '20': 25000, '21': 33000, '22': 41000,
  '23': 50000, '24': 62000, '25': 75000, '26': 90000, '27': 105000, '28': 120000, '29': 135000, '30': 155000 }; // GN p. 126
const ND_NUM = nd => { const s = String(nd); if (s.includes('/')) { const [a, b] = s.split('/'); return a / b; } return parseFloat(s) || 0; };
// nível: [fácil, médio, difícil, mortal, XP até o próximo nível (LJ p. 13), XP por dia (GN p. 46)] — GN p. 45
const LIM = { 1: [25, 50, 75, 100, 300, 300], 2: [50, 100, 150, 200, 600, 600], 3: [75, 150, 225, 400, 1800, 1200], 4: [125, 250, 375, 500, 3800, 1700],
  5: [250, 500, 750, 1100, 7500, 3500], 6: [300, 600, 900, 1400, 9000, 4000], 7: [350, 750, 1100, 1700, 11000, 5000], 8: [450, 900, 1400, 2100, 14000, 6000],
  9: [550, 1100, 1600, 2400, 16000, 7500], 10: [600, 1200, 1900, 2800, 21000, 9000], 11: [800, 1500, 2400, 3600, 15000, 10500], 12: [1000, 2000, 3000, 4500, 20000, 11500],
  13: [1100, 2200, 3400, 5100, 20000, 13500], 14: [1250, 2500, 3800, 5700, 25000, 15000], 15: [1400, 2800, 4300, 6500, 30000, 18000], 16: [1600, 3200, 4800, 7200, 30000, 20000],
  17: [2000, 3900, 5900, 8800, 40000, 25000], 18: [2100, 4200, 6300, 9500, 40000, 27000], 19: [2400, 4900, 7300, 10900, 50000, 30000], 20: [2800, 5700, 8500, 12700, 0, 40000] };
const MULT = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5];
const TURBA = [[1, 1], [6, 2], [13, 3], [15, 4], [17, 5], [19, 10], [20, 20]]; // GN p. 115
const AREA = { 'Cone': 3, 'Cilindro (raio)': 1.5, 'Linha': 9, 'Esfera ou círculo (raio)': 1.5 }; // GN p. 114
const DANO_IMP = { '1º–4º': ['1d10', '2d10', '4d10'], '5º–10º': ['2d10', '6d10', '14d10'], '11º–16º': ['4d10', '12d10', '25d10'], '17º–20º': ['10d10', '24d10', '36d10'] }; // GN p. 114
const MARES = [ // GN p. 65: nome, CD, rei dos mares até, testes por viagem (até)
  ['East Blue', 15, 'ND 8', 1], ['North Blue', 16, 'ND 10', 2], ['South Blue', 16, 'ND 10', 2], ['West Blue', 16, 'ND 10', 2], ['Mares do Céu', 18, 'nenhum', 3],
  ['Paradise (Grand Line)', 20, 'ND 16', 5], ['Calm Belt', 22, 'ND 28', 5], ['Novo Mundo', 24, 'ND 28', 7]];
const ENCONTRO_MAR = { // GN p. 66
  1: { n: 'Animal Alado', i: 'mar:animal_alado', t: 'Um ninho de criaturas aladas no caminho. Aparecem até 3 criaturas aladas.' },
  2: { n: 'Ataque Pirata', i: 'mar:navio_pirata', t: 'Território inimigo ou armadilha. Aparecem até 3 navios piratas.' },
  3: { n: 'Frota da Marinha', i: 'mar:frota', t: 'Rota de patrulha. Aparecem até 3 navios da Marinha.' },
  4: { n: 'Maremoto', i: 'mar:maremoto', t: 'Teste de Desastre Natural CD 20. Falhou: o navio leva 20d10 de dano contundente. Passou: metade.', cd: 20, dano: '20d10' },
  5: { n: 'Chuva', i: 'mar:chuva', t: 'Só uma chuva irritante. Nada além de desconforto.' },
  6: { n: 'Perder o Trajeto', i: 'mar:perder_trajeto', t: 'O navio sai da rota. Role 2d6: dias até achar o caminho e recomeçar de onde parou.', dias: '2d6' },
  7: { n: 'Redemoinho', i: 'mar:redemoinho', t: 'Teste de Desastre Natural CD 16. Falhou: 10d10 de dano contundente no navio. Passou: metade.', cd: 16, dano: '10d10' },
  8: { n: 'Rei dos Mares', i: 'mar:rei_dos_mares', t: 'Ninho de monstros marinhos. Aparecem até 2 Reis dos Mares, com o ND máximo do mar.' },
  9: { n: 'Tempestade', i: 'mar:tempestade', t: 'Novo Teste de Navegação CD 25. Se falhar e o d10 der Maremoto, Redemoinho ou Tufão, o navio falha sozinho no Teste de Desastre.', tempestade: true },
  10: { n: 'Tufão', i: 'mar:tufao', t: 'Teste de Desastre Natural CD 18. Falhou: 15d10 de dano contundente no navio. Passou: metade.', cd: 18, dano: '15d10' }
};
const TESOURO = [ // GN p. 82: a partir de, item, ícone, metade abaixo do 11º nível
  [1, 'Nada. O baú estava vazio.', null], [6, 'Uma moeda de ฿ 10', 'tesouro:moeda'], [11, 'Uma moeda de ฿ 100', 'tesouro:moeda'], [16, 'Uma nota de ฿ 1.000', 'tesouro:cedulas'],
  [21, 'Uma garrafa de bebida', 'tesouro:bebida'], [26, 'Um livro velho com informações úteis', 'tesouro:livro'], [31, 'Uma nota de ฿ 10.000', 'tesouro:cedulas'],
  [36, 'Uma semente Pop Green', 'tesouro:semente'], [41, 'Um Kit de Ferramentas', 'tesouro:ferramentas'], [46, 'Um Dial Cotidiano', 'tesouro:concha'], [51, 'Um Veneno Básico', 'tesouro:veneno'],
  [56, 'Uma Semente de Planta Mãe', 'tesouro:semente'], [61, 'Joias, ouro ou arte valendo ฿ 100.000', 'tesouro:joias'], [66, 'Uma arma Meito: Wazamono', 'tesouro:espada'],
  [71, 'Um Dial Bélico', 'tesouro:concha'], [76, 'Um Eternal Pose', 'tesouro:bussola_redoma'], [77, 'Um Dial Restrito', 'tesouro:concha'], [78, 'Joias, ouro ou arte valendo ฿ 500.000', 'tesouro:joias'],
  [79, 'Um Livro de Profissão', 'tesouro:livro'], [80, 'Den-Den Mushi Branco', 'tesouro:concha'], [81, 'Joias, ouro ou arte valendo ฿ 1.000.000', 'tesouro:joias'],
  [82, 'Um par de Algemas de Kairoseki', 'tesouro:algemas'], [83, 'Uma Rede de Kairoseki', 'tesouro:rede'], [84, 'Um baú com uma Akuma no Mi, categoria C', 'poderes:fruta_espinhos'],
  [85, 'Joias, ouro ou arte valendo ฿ 30.000.000', 'tesouro:joias'], [86, 'Joias, ouro ou arte valendo ฿ 50.000.000', 'tesouro:joias'], [87, 'Uma arma Meito: Ryo Wazamono', 'tesouro:espada'],
  [88, 'Um Equipamento Engenhado', 'tesouro:armadura'], [89, 'Joias, ouro ou arte valendo ฿ 150.000.000', 'tesouro:joias', true], [90, 'Um baú com uma Akuma no Mi, categoria B', 'poderes:fruta_escamas'],
  [91, 'Um Objeto Usuário de Akuma no Mi', 'poderes:aura'], [92, 'Joias, ouro ou arte valendo ฿ 250.000.000', 'tesouro:joias', true], [93, 'Uma arma Meito: Ô Wazamono', 'tesouro:espada'],
  [94, 'Joias, ouro ou arte valendo ฿ 500.000.000', 'tesouro:joias', true], [95, 'Um baú com uma Akuma no Mi, categoria A', 'poderes:fruta_chamas'], [96, '3d10 munições de Kairoseki', 'tesouro:algemas'],
  [97, 'Joias, ouro ou arte valendo ฿ 1.000.000.000', 'tesouro:joias', true], [98, 'Uma arma Meito: Saijo Ô Wazamono', 'tesouro:espada'],
  [99, 'Um baú com uma Akuma no Mi, categoria S', 'poderes:fruta_espinhos'], [100, 'Raid Suit', 'tesouro:armadura']];
const tesouroDe = n => { let r = TESOURO[0]; for (const t of TESOURO) if (n >= t[0]) r = t; return r; };

/* ───── clima (GN p. 60 e 66) ───── */
function clima(t, v, c) {
  const temp = t >= 18 ? 'calor' : t >= 15 ? 'frio' : 'normal';
  const vento = v >= 18 ? 'Forte' : v >= 13 ? 'Fraco' : 'Nenhum';
  const chuva = c >= 18 ? 'Forte' : c >= 13 ? 'Fraca' : 'Nenhuma';
  const efeitos = [];
  if (vento === 'Forte' && chuva === 'Forte') efeitos.push(['Tormenta', 'Some todo ponto de referência (menos farol). Teste de Navegação com desvantagem.']);
  if (vento === 'Nenhum') efeitos.push(['Calmaria', 'Barco não anda na vela: só no remo.']);
  if (vento === 'Forte') efeitos.push(['Vento forte', 'Desvantagem em ataque comum à distância e em Percepção pela audição. Apaga chamas, dispersa névoa. Quem voa pousa no fim do turno ou cai. Veleiro contra o vento anda na metade.']);
  if (chuva === 'Forte') efeitos.push(['Chuva forte', 'Escuridão leve: desvantagem em Percepção pela visão e pela audição. Apaga chamas.']);
  if (temp !== 'normal') efeitos.push([temp === 'frio' ? 'Mais frio' : 'Mais quente', `1d4 × 5 °C ${temp === 'frio' ? 'abaixo' : 'acima'} do normal. Abaixo de −12 °C ou acima de 40 °C: Salv. Con a cada hora ou exaustão.`]);
  const icone = vento === 'Forte' && chuva === 'Forte' ? 'clima:tormenta' : chuva === 'Forte' ? 'clima:chuva_forte' : chuva === 'Fraca' ? 'clima:chuva_fraca'
    : vento === 'Forte' ? 'clima:vento_forte' : vento === 'Nenhum' ? 'clima:calmaria' : temp === 'frio' ? 'clima:frio' : temp === 'calor' ? 'clima:calor' : vento === 'Fraco' ? 'clima:sol_nuvens' : 'clima:sol';
  return { t, v, c, temp, vento, chuva, efeitos, icone };
}

/* ───── encontro (GN p. 45–46) ───── */
function dificuldade(niveis, itens) {
  const lim = [0, 0, 0, 0], porDia = niveis.reduce((a, n) => a + (LIM[clamp(n, 1, 20)] || LIM[1])[5], 0);
  niveis.forEach(n => { const l = LIM[clamp(n, 1, 20)] || LIM[1]; for (let i = 0; i < 4; i++) lim[i] += l[i]; });
  const qtd = itens.reduce((a, i) => a + (i.qtd || 0), 0), total = itens.reduce((a, i) => a + (i.xp || 0) * (i.qtd || 0), 0);
  let idx = qtd <= 0 ? 1 : qtd === 1 ? 1 : qtd === 2 ? 2 : qtd <= 6 ? 3 : qtd <= 10 ? 4 : qtd <= 14 ? 5 : 6;
  if (niveis.length && niveis.length < 3) idx++;
  if (niveis.length >= 5) idx--;
  const mult = qtd ? MULT[clamp(idx, 0, 7)] : 0, ajustado = Math.round(total * mult);
  const nomes = ['Fácil', 'Médio', 'Difícil', 'Mortal'];
  let nivel = 'Muito fácil', i = -1;
  for (let k = 0; k < 4; k++) if (ajustado >= lim[k] && lim[k] > 0) { nivel = nomes[k]; i = k; }
  return { lim, qtd, total, mult, ajustado, nivel, idx: i, xpCada: niveis.length ? Math.round(total / niveis.length) : 0, porDia };
}
function turba(cr, bonus, qtd) {
  const precisa = clamp(cr - bonus, 1, 20);
  let por = 1; for (const [a, b] of TURBA) if (precisa >= a) por = b;
  return { precisa, por, acertos: Math.floor(qtd / por) };
}

/* ───── ficha → números da mesa ───── */
const nomesCond = lst => new Set((lst || []).map(c => c.n));
function calc(pc) {
  const s = pc.sheet || {}, L = pc.live, cs = nomesCond(L.conds), tem = n => cs.has(n), algum = a => a.some(tem);
  const exa = clamp(L.exa || 0, 0, 6);
  const base = Math.max(1, num(s.pv && s.pv.max) || 1);
  const pvMax = Math.max(0, (tem('Doente') ? Math.floor(base / 2) : base) - (L.perdido || 0));
  const pv = Math.min(L.pv, pvMax);
  const ppMax = num(s.pp && s.pp.max) || 0;
  const desv = algum(DESV_ATK), desvC = algum(DESV_COMUM), vant = tem('Invisível');
  const modo = (d) => d && !vant ? 'desv' : vant && !d ? 'vant' : '';
  const atk = (num(s.estiloAtk) || 0) - 2 * exa;
  const atkFruta = s.temFruta ? (num(s.akumaAtk) || 0) - 2 * exa : null;
  const arma = (s.armas || [])[0];
  const terra = num(s.desl && s.desl.terra) || 0;
  const desl = exa >= 6 || algum(ZERO) ? 0 : Math.max(0, terra * (algum(METADE) ? 0.5 : 1) - 1.5 * exa);
  const percBase = 10 + (num(s.percepcao) || 0);
  const ini = (num(s.desMod) || 0) - 2 * exa;
  let estado = 'Inteiro';
  if (L.morto) estado = 'Morto'; else if (pv <= 0) estado = 'Caído'; else if (pv < pvMax / 2) estado = 'Abaixo da metade'; else if (pv < pvMax) estado = 'Ferido';
  return {
    pv, pvMax, temp: L.temp || 0, neg: L.neg || 0, pp: L.pp, ppMax, ppTemp: num(s.pp && s.pp.temp) || 0, cr: (num(s.cr) || 0) + (L.crMod || 0) + crNomTotal(L),
    cd: num(s.estiloCD), cdFruta: s.temFruta ? num(s.akumaCD) : null, atk, atkFruta, modoAtk: modo(desv), modoComum: modo(desvC),
    arma: arma ? { ...arma, bonusAgora: num(arma.bonus) != null ? num(arma.bonus) - 2 * exa : null } : null,
    perc: percBase - (algum(DESV_PERC) ? 5 : 0), ini, modoIni: algum(DESV_TESTE) ? 'desv' : '', desl, exa, estado, sobrecarga: L.pp <= 0,
    contraVant: algum(VANT_CONTRA), conMod: num(s.conMod) || 0
  };
}
/* dano em personagem de jogador — LJ p. 293 (morte instantânea e PV negativos) e p. 273 (Doente) */
function danoPC(pc, valor, fonte = '') {
  const L = pc.live, c = calc(pc), msgs = [];
  if (L.morto || valor <= 0) return msgs;
  let d = valor;
  const usaTemp = Math.min(L.temp || 0, d); L.temp = (L.temp || 0) - usaTemp; d -= usaTemp;
  if (usaTemp) msgs.push(`${usaTemp} no PV temporário`);
  if (d > 0 && nomesCond(L.conds).has('Doente')) { L.perdido = (L.perdido || 0) + d; msgs.push(`Doente: PV máx. −${d}`); }
  if (d > 0) {
    if (c.pv > 0) {
      if (d >= c.pv) {
        const sobra = d - c.pv; L.pv = 0;
        if (sobra >= c.pvMax) { L.morto = true; msgs.push(`MORTE INSTANTÂNEA: sobrou ${sobra} de dano (PV máx. ${c.pvMax})`); }
        else { msgs.push(`caiu inconsciente (sobrou ${sobra}, não conta nos negativos)`); addCond(L, 'Inconsciente', null, true); }
      } else L.pv = c.pv - d;
    } else {
      L.neg = (L.neg || 0) + d; msgs.push(`PV negativos: ${L.neg} de ${c.pvMax}`);
      if (L.neg >= c.pvMax) { L.morto = true; msgs.push('MORREU: os PV negativos chegaram ao PV máximo'); }
    }
  }
  const nc = calc(pc);
  if (nc.pvMax <= 0 && !L.morto) { L.morto = true; msgs.push('MORREU: a doença zerou o PV máximo'); }
  if (nomesCond(L.conds).has('Concentrando') && !L.morto) msgs.push(`Concentração: Salv. Con CD ${Math.max(10, Math.floor(valor / 2))}`);
  return msgs;
}
function curaPC(pc, valor) {
  const L = pc.live; if (L.morto || valor <= 0) return [];
  const c = calc(pc), msgs = [];
  if (c.pv <= 0) { L.neg = 0; L.conds = L.conds.filter(x => !(x.n === 'Inconsciente' && x.auto)); msgs.push('acordou (PV negativos zerados)'); }
  L.pv = Math.min(c.pvMax, Math.max(0, c.pv) + valor);
  return msgs;
}
function addCond(L, n, rod = null, auto = false) {
  L.conds = L.conds || [];
  const ja = L.conds.find(c => c.n === n);
  if (ja) { if (rod) ja.rod = rod; return; }
  L.conds.push({ n, rod: rod || null, auto });
}
/* descansos — LJ p. 278 e p. 36–37 */
function descansoLongo(pc) {
  const L = pc.live, c = calc(pc), msgs = [];
  if (L.morto) return ['morto: sem descanso'];
  if (c.pv < 1) return ['precisa de pelo menos 1 PV no início do descanso longo'];
  L.pv = c.pvMax; L.neg = 0; L.temp = 0;
  const ppMax = c.ppMax;
  if (L.exa > 0) { L.pp = Math.min(ppMax, Math.max(0, L.pp) + Math.floor(ppMax / 2)); msgs.push('com exaustão: só metade dos PP'); }
  else L.pp = ppMax;
  if (L.exa > 0) { L.exa--; msgs.push(`exaustão agora ${L.exa}`); }
  const dv = pc.sheet.dadosVida || [];
  dv.forEach(d => { const k = d.tipo, rec = Math.max(1, Math.floor(d.max / 2)); L.hd[k] = Math.min(d.max, (L.hd[k] ?? d.max) + rec); });
  L.conds = L.conds.filter(x => x.n !== 'Bêbado');
  msgs.unshift('PV cheios'); return msgs;
}
function gastarDadoVida(pc, tipo) {
  const L = pc.live, dv = (pc.sheet.dadosVida || []).find(d => d.tipo === tipo); if (!dv) return null;
  const tem = L.hd[tipo] ?? dv.max; if (tem <= 0) return null;
  const f = parseInt(tipo.slice(1), 10), r = rnd(f), con = Math.max(0, calc(pc).conMod), cura = r + con;
  L.hd[tipo] = tem - 1; curaPC(pc, cura);
  return { r, con, cura };
}
function vivoNovo(sheet) {
  const pv = num(sheet.pv && sheet.pv.atual), max = num(sheet.pv && sheet.pv.max);
  const hd = {}; (sheet.dadosVida || []).forEach(d => { hd[d.tipo] = d.atual != null ? d.atual : d.max; });
  return { pv: pv != null ? pv : (max || 1), temp: (num(sheet.pv && sheet.pv.temp) || 0) + (num(sheet.pv && sheet.pv.escudo) || 0), neg: 0, morto: false, perdido: 0,
    pp: num(sheet.pp && sheet.pp.atual) ?? (num(sheet.pp && sheet.pp.max) || 0), exa: sheet.exaustao || 0, conds: [], hd, crMod: 0, notas: '', retrato: null };
}
/* retrato de inimigo pelo tipo: cada inimigo tem um rosto fixo (pelo id), escolhido entre os rostos pixel da categoria */
const hashId = t => { let h = 0; String(t || '').split('').forEach(c => { h = (h * 31 + c.charCodeAt(0)) >>> 0; }); return h; };
const pegaRosto = (id, lista) => lista[hashId(id) % lista.length];
const ROSTO_NOMES = {
  rostos_pir: ['ancora', 'machado', 'velho_cachimbo', 'capuz', 'crista_verde', 'ronin', 'dama', 'capitao', 'rei_chifres'],
  rostos_mar: ['tapa_olho', 'prata', 'cachimbo', 'cicatriz', 'barba_trancada', 'ruiva', 'bigodao', 'oculos_sol', 'almirante'],
  rostos_rec: ['assustado', 'sorriso', 'serio', 'bigode_fino', 'bigode_grosso', 'charuto', 'oculos', 'faixa_azul', 'loiro'],
  rostos_pir2: ['esfregao', 'luneta', 'dente_faltando', 'pistola', 'listrado', 'tapa_mosquete', 'careca', 'espadachim', 'moeda'],
  rostos_gov: ['bravo', 'oculos_escuros', 'luvas', 'cartola', 'mascara', 'manopla', 'robo', 'anjo_ciborgue', 'livro_lacrado'],
  rostos_gov2: ['bravo', 'oculos_escuros', 'luvas', 'cartola', 'mascara', 'robo_pesado', 'robo', 'anjo_ciborgue', 'livro_lacrado'],
  bichos1: ['bufalo_carga', 'touro_bravo', 'vaca_sela', 'camelo', 'cobra', 'coruja', 'lesma_pequena', 'lesma_grande', 'lagarto_leque'],
  bichos2: ['lagostim', 'jacare_aviador', 'lesma_azul', 'gaivota_correio', 'galo_piloto', 'peixe_voador', 'lagosta_navio', 'tartaruga_ilha', 'hipopotamo_lanoso']
};
const ROSTOS = (f, ...n) => n.map(i => f + ':' + ROSTO_NOMES[f][i]);
function retratoInimigo(m) {
  if (!m) return 'retratos:pirata_novato';
  const id = m.id || '', c = m.cat || '', novo = (lista, fallback) => temIc(lista[0]) ? pegaRosto(id, lista) : fallback;
  if (c === 'Marinha') {
    if (/recruta|aprendiz|classe|cabo/.test(id)) return novo(ROSTOS('rostos_rec', 0, 1, 2, 3, 4, 5, 6, 7, 8), 'retratos:recruta');
    if (/sargento|subtenente|estandarte|tenente/.test(id) && !/comandante/.test(id)) return novo([...ROSTOS('rostos_rec', 2, 3, 4, 5, 6, 7), ...ROSTOS('rostos_mar', 0, 3, 5)], 'retratos:oficial');
    return novo(ROSTOS('rostos_mar', 0, 1, 2, 3, 4, 5, 6, 7, 8), 'retratos:veterano');
  }
  if (c === 'Pacifistas') return novo(ROSTOS('rostos_gov', 6, 7), 'retratos:ciborgue');
  if (c === 'Cipher Pol') return novo([...ROSTOS('rostos_gov', 0, 1, 2, 3, 4), ...ROSTOS('rostos_gov2', 0, 1, 2, 3, 4)], 'retratos:revolucionario');
  if (c === 'Piratas') return /atirador/.test(id) ? novo(ROSTOS('rostos_pir2', 3, 5), 'retratos:atiradora')
    : /lutador|robusto|combatente|arruaceiro/.test(id) ? novo([...ROSTOS('rostos_pir', 0, 1, 4), ...ROSTOS('rostos_pir2', 6)], 'retratos:brutamontes')
    : /espadachim/.test(id) ? novo([...ROSTOS('rostos_pir', 5), ...ROSTOS('rostos_pir2', 7)], 'retratos:cacador')
    : /capitao|imediato|imperador|infame|veterano/.test(id) ? novo([...ROSTOS('rostos_pir', 2, 3, 6, 7, 8), ...ROSTOS('rostos_pir2', 8)], 'retratos:capitao')
    : novo(ROSTOS('rostos_pir2', 0, 1, 2, 3, 4, 5, 6, 7, 8), 'retratos:pirata_novato');
  if (!temIc('bichos1:camelo')) {
    if (/coruja|coo|pato|agehaguera/.test(id)) return 'mar:animal_alado';
    if (/bull|wani|bagre|zame|baleia|caranguejo|centopeia|lesma|tartaruga|camarao|peixe/.test(id)) return 'mar:rei_dos_mares';
    return 'retratos:fera';
  }
  if (/news-coo|gaivota|pelic/.test(id)) return 'bichos2:gaivota_correio';
  if (/den-den|denden/.test(id)) return /grande/.test(id) ? 'bichos1:lesma_grande' : 'bichos1:lesma_pequena';
  if (/erimaki|lagarto|iguana|dinossauro/.test(id)) return 'bichos1:lagarto_leque';
  if (/white-walkie|hipopot|urso|mamute|yeti/.test(id)) return 'bichos2:hipopotamo_lanoso';
  if (/expresso-camarao/.test(id)) return 'bichos2:lagosta_navio';
  if (/coruja|owl/.test(id)) return 'bichos1:coruja';
  if (/coo|pato|agehaguera|galo/.test(id)) return 'bichos2:galo_piloto';
  if (/gaivota|pelic|passaro|ave/.test(id)) return 'bichos2:gaivota_correio';
  if (/bull|vaca|boi|bufalo|touro/.test(id)) return pegaRosto(id, ROSTOS('bichos1', 0, 1, 2));
  if (/wani|crocodil|jacare/.test(id)) return 'bichos2:jacare_aviador';
  if (/lesma|caracol/.test(id)) return pegaRosto(id, [...ROSTOS('bichos1', 6, 7), ...ROSTOS('bichos2', 2)]);
  if (/tartaruga/.test(id)) return 'bichos2:tartaruga_ilha';
  if (/camarao|lagosta|caranguejo|lagostim/.test(id)) return pegaRosto(id, ROSTOS('bichos2', 0, 6));
  if (/peixe|bagre|zame|enguia/.test(id)) return 'bichos2:peixe_voador';
  if (/cobra|serpente/.test(id)) return 'bichos1:cobra';
  if (/camelo/.test(id)) return 'bichos1:camelo';
  if (/baleia|centopeia|rei/.test(id)) return 'mar:rei_dos_mares';
  if (/lagarto|iguana|dinossauro/.test(id)) return 'bichos1:lagarto_leque';
  if (/hipopot|urso|mamute|yeti/.test(id)) return 'bichos2:hipopotamo_lanoso';
  return pegaRosto(id, [...ROSTOS('bichos1', 0, 3, 4, 8), ...ROSTOS('bichos2', 1, 7, 8), 'retratos:fera']);
}
const RETRATOS = ['retratos:recruta', 'retratos:oficial', 'retratos:veterano', 'retratos:pirata_novato', 'retratos:brutamontes', 'retratos:capitao', 'retratos:atiradora', 'retratos:cacador',
  'retratos:revolucionario', 'retratos:nobre', 'retratos:homem_peixe', 'retratos:gigante', 'retratos:guerreiro_animal', 'retratos:anao', 'retratos:ciborgue', 'retratos:fera',
  'mar:rei_dos_mares', 'mar:animal_alado', 'poderes:recompensa',
  ...Object.keys(ROSTO_NOMES).flatMap(f => ROSTO_NOMES[f].map(n => f + ':' + n))];

/* bônus de CR com nome (ex.: "+2 Pequeno Gigante, só com mais da metade dos PV"): o mestre liga e desliga na janela de CR */
const crNomTotal = L => ((L && L.crNom) || []).filter(b => b.on !== false).reduce((a, b) => a + (+b.v || 0), 0);

/* Dado de Vida de cada Estilo de Combate (LJ cap. 3, "Dado de Vida: 1dX por nível de …").
   Vale o que está na ficha; esta tabela só ajuda quando a ficha não diz. Samurai pode virar d12 por característica; Vitalidade Exuberante sobe um passo. */
const DV_ESTILO = { atirador: 'd8', aventureiro: 'd10', brutamontes: 'd12', 'carateca homem-peixe': 'd12', ciborgue: 'd12', espadachim: 'd10',
  guerrilheiro: 'd10', lutador: 'd12', ninja: 'd8', 'okama kenpo': 'd10', rokushiki: 'd10', samurai: 'd10',
  'black leg': 'd12', esgrimista: 'd10', heroi: 'd8', solfista: 'd8', 'usuario insito': 'd10' };   // os 5 últimos: Estilos Exclusivos 2.1
/** "Lutador 4/Ninja 1" → [{estilo:'Lutador', nv:4, dv:'d12'}, …] */
function estilosDe(txt) {
  return String(txt || '').split(/[\/,;+]/).map(p => p.trim()).filter(Boolean).map(p => {
    const m = p.match(/^(.*?)\s*(\d+)?$/), nome = (m[1] || p).trim(), k = sem(nome).replace(/-/g, ' ');
    const chave = Object.keys(DV_ESTILO).find(e => k.includes(e.replace(/-/g, ' ')));
    return { estilo: nome, nv: m[2] ? +m[2] : null, dv: chave ? DV_ESTILO[chave] : null };
  });
}
