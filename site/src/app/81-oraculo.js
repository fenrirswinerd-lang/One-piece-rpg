/* ═══════════ PERGUNTE AO LIVRO (assistente de regras, sem IA) ═══════════
   Você escreve a dúvida em português normal. O site procura nos dados que já tem (escudo de regras, condições,
   Manual dos Inimigos, técnicas do catálogo, tabelas de armas, glossário do LJ e as regras da casa) e responde
   curto, com a página. Quando sabe fazer a conta, faz. Quando não acha, diz que não achou: nunca inventa.
   Jogador: só regras públicas, a própria ficha e o que o mestre revelou no Catálogo. */
const Ora = { q: '', idx: null, idxChave: '', res: null };
const ORA_STOP = new Set(('a o as os um uma uns umas de da do das dos e ou que qual quais quanto quanta quantos quantas como com em no na nos nas por para pra pro se eu ele ela me ser ter tem ta esta estao sao foi vai pode posso tenho quando onde isso esse essa este aquele aquela ao aos mais muito so tambem ja nao sim sobre ate mas porque pq oq ne la aqui ai dele dela faz fazer fica ficar quer queria gostaria saber sei existe ha tira tirar da dao der precisa preciso tipo assim entao acontece funciona serve usar uso usa algum alguma alguem coisa vez vezes ainda mesmo cada').split(' '));
/* palavras do dia a dia → palavras do livro */
const ORA_SIN = {
  correr: ['disparada'], corre: ['disparada'], correndo: ['disparada'], corrida: ['disparada'], dash: ['disparada'], sprint: ['disparada'],
  bala: ['municao', 'esferica'], balas: ['municao'], tiro: ['municao', 'distancia'], projetil: ['municao'],
  esperar: ['preparar'], espera: ['preparar'], preparada: ['preparar'], preparado: ['preparar'], segurar: ['preparar'], gatilho: ['preparar'],
  vida: ['pv'], hp: ['pv'], cura: ['curar', 'pv'], curar: ['cura'], mana: ['pp'], energia: ['pp'], poder: ['pp'],
  desmaiar: ['inconsciente'], desmaia: ['inconsciente'], desmaiou: ['inconsciente'], apagar: ['inconsciente'], morrer: ['morte'], morre: ['morte'], morreu: ['morte'], morto: ['morte'],
  cegar: ['cego'], cegueira: ['cego'], agarrar: ['agarrao', 'agarrado'], prender: ['agarrao', 'impedido'], derrubar: ['caido', 'investida'], empurrar: ['investida', 'empurrado'],
  levantar: ['caido'], deitado: ['caido'], chao: ['caido'], pular: ['salto', 'saltar'], pulo: ['salto'], cair: ['queda'], esconder: ['furtividade'], escondido: ['oculto', 'furtividade'],
  critico: ['critico', 'natural'], crita: ['critico'], critar: ['critico'], critou: ['critico'], acertar: ['ataque', 'acerto'], acerta: ['ataque', 'acerto'], errar: ['ataque'],
  defesa: ['cr'], armadura: ['cr'], ca: ['cr'], dormir: ['descanso'], descansar: ['descanso'], descansa: ['descanso'],
  preco: ['฿'], custa: ['฿', 'custo'], comprar: ['loja'], cansaco: ['exaustao'], cansado: ['exaustao'], exausto: ['exaustao'],
  veneno: ['envenenado'], fogo: ['queimado'], queimar: ['queimado'], sangrar: ['sangramento'], sangrando: ['sangramento'], medo: ['amedrontado'], sono: ['sonolento'], bebida: ['bebado'],
  level: ['nivel'], upar: ['nivel', 'xp'], experiencia: ['xp'], dinheiro: ['belly', '฿'], grana: ['belly', '฿'], fruta: ['akuma'], frutas: ['akuma'],
  teste: ['teste'], dificuldade: ['cd'], resistir: ['salvaguarda'], resistencia: ['salvaguarda', 'resistencia'], salv: ['salvaguarda'], save: ['salvaguarda'],
  mover: ['deslocamento', 'movimento'], move: ['deslocamento', 'movimento'], andar: ['deslocamento', 'movimento'], anda: ['deslocamento', 'movimento'], velocidade: ['deslocamento'],
  movimentacao: ['deslocamento', 'movimento'], distancia: ['alcance'], longe: ['alcance', 'distancia'], perto: ['alcance'], atirar: ['distancia', 'ataque'], nadar: ['nado', 'nadar'],
  oportunidade: ['oportunidade'], concentrar: ['concentracao'], foco: ['concentracao'], combo: ['combinado'], juntos: ['combinado'], navio: ['navio'], canhao: ['canhao'],
  recompensa: ['recompensa', 'cartaz'], procurado: ['cartaz', 'recompensa'], kairoseki: ['kairoseki'], haki: ['haki'], turno: ['turno'], rodada: ['rodada', 'turno'],
  surpresa: ['surpresa', 'surpreso'], emboscada: ['surpresa'], cobertura: ['cobertura'], abrigo: ['cobertura'], escuro: ['escuridao', 'cego'], invisivel: ['invisivel'],
  subir: ['sobe', 'marco', 'avanco'], sobe: ['marco'], evoluir: ['nivel', 'marco'], oculto: ['oculto', 'escondido'], reacao: ['reacao'], surpreso: ['surpresa'],
  duas: ['duas'], armas: ['arma'], bonus: ['bonus'], vantagem: ['vantagem'], desvantagem: ['desvantagem'], sobrecarga: ['sobrecarga'], peso: ['carga'], carregar: ['carga']
};
const ORA_ATTR = [['FOR', 'forca', 'Força'], ['DES', 'destreza', 'Destreza'], ['CON', 'constituicao', 'Constituição'], ['SAB', 'sabedoria', 'Sabedoria'], ['PRE', 'presenca', 'Presença'], ['VON', 'vontade', 'Vontade']];
const oraNorm = s => sem(s).replace(/[“”"'’`]/g, '').replace(/[^a-z0-9฿+/]+/g, ' ').trim();
const oraStem = w => w.length > 4 ? w.replace(/oes$/, 'ao').replace(/aes$/, 'ao').replace(/ais$/, 'al').replace(/eis$/, 'el').replace(/ns$/, 'm').replace(/([rz])es$/, '$1').replace(/([aeiou])s$/, '$1') : w;
const oraTok = s => oraNorm(s).split(' ').filter(w => w && !ORA_STOP.has(w) && (w.length > 1 || /\d|฿/.test(w))).map(oraStem);
const oraInl = t => esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
/* distância de edição ≤ 1 (para erro de digitação) */
function oraQuase(a, b) {
  if (a === b) return true; const la = a.length, lb = b.length; if (Math.abs(la - lb) > 1 || Math.min(la, lb) < 5) return false;
  let i = 0, j = 0, dif = 0;
  while (i < la && j < lb) { if (a[i] === b[j]) { i++; j++; continue; } if (++dif > 1) return false; if (la > lb) i++; else if (lb > la) j++; else { i++; j++; } }
  return dif + (la - i) + (lb - j) <= 1;
}
/* quanto uma palavra da pergunta bate com uma palavra do texto: 3 igual, 2 mesmo começo, 1.5 quase igual */
function oraBate(q, t) {
  if (q === t) return 3;
  const n = Math.min(q.length, t.length); if (n >= 4) { let k = 0; while (k < n && q[k] === t[k]) k++; if (k >= 5 || (k >= 4 && k >= n * 0.8)) return 2; }
  return oraQuase(q, t) ? 1.5 : 0;
}

/* ───── o índice: tudo que o site sabe, em pedaços pequenos ───── */
function oraIndice() {
  const mestre = souMestre(), C = window.CATALOGO, chave = [mestre ? 'm' : 'j', C ? 1 : 0, mestre ? (S().config.casa || []).join('|').length : 0, mestre ? S().custom.length : 0, JSON.stringify(mestre ? '' : catEst())].join('/');
  if (Ora.idx && Ora.idxChave === chave) return Ora.idx;
  const docs = [], add = d => { d.tok = new Set(oraTok(d.t + ' ' + (d.x || ''))); d.tt = new Set(oraTok(d.t)); if (d.nome) d.nt = new Set(oraTok(d.nome)); docs.push(d); };
  /* 1) regras da casa (só o mestre guarda): valem antes do livro */
  if (mestre) (S().config.casa || []).forEach((r, i) => { if (String(r || '').trim() && r !== 'Nova regra') add({ k: 'casa', t: 'Regra da nossa mesa', x: r, h: oraInl(r), f: 'decisão da mesa', peso: 1.5, i }); });
  /* 2) escudo: cada linha de cada cartão vira um pedaço; tabela vira uma linha por item */
  (window.ESCUDO || []).forEach(sec => {
    if (!mestre && (sec.id === 'inimigos' || sec.id === 'mesa')) return;
    sec.cartoes.forEach(c => c.blocos.forEach(b => {
      const base = { k: 'regra', t: c.titulo, sec: sec.id, secT: sec.titulo, f: c.fonte || '', mesa: !!c.mesa };
      (b.t || []).forEach(l => { const limpo = l.replace(/^(## |- |! )/, ''); if (limpo.length > 3) add({ ...base, x: limpo, h: oraInl(limpo) }); });
      (b.twocol || []).forEach(col => col.forEach(l => add({ ...base, x: l, h: oraInl(l) })));
      if (b.table) { const cab = b.table[0].map(v => typeof v === 'string' ? v : '');
        b.table.slice(1).forEach(r => { if (r.length === 1 && typeof r[0] === 'object') return;
          const cel = r.map(v => typeof v === 'string' ? v : (v && v.text) || '');
          add({ ...base, k: 'item', nome: cel[0], x: cel.join(' ') + ' ' + cab.join(' '), cel, cab,
            h: `<b>${oraInl(cel[0])}</b>: ` + cel.slice(1).map((v, i) => v && v !== '—' ? `${esc(cab[i + 1] || '')} ${oraInl(v)}` : '').filter(Boolean).join(' · ') }); }); }
    }));
  });
  /* 3) condições (LJ p. 269–273) */
  COND.forEach(({ n, pp, t: txt }) => add({ k: 'cond', t: n, nome: n, x: 'condicao ' + txt, h: `${oraInl(txt)}${pp ? ` <small>(custa ${pp} PP numa técnica de Akuma no Mi)</small>` : ''}`, f: 'LJ p. 269–273', peso: 1.15 }));
  /* 4) glossário do LJ: palavra → página */
  (window.GLOSS || []).forEach(([n, pg]) => add({ k: 'gloss', t: n, nome: n, x: 'glossario pagina', h: `No Livro do Jogador, <b>${esc(n)}</b> está na página <b>${esc(pg)}</b>.`, f: 'LJ p. ' + pg, peso: 0.55 }));
  /* 5) inimigos (só o mestre) */
  if (mestre) MON().concat(S().custom || []).forEach(m => add({ k: 'mon', t: m.nome, nome: m.nome, m, x: `${m.cat || ''} inimigo ND ${m.nd} ` + (m.ataques || []).map(a => a.nome).join(' ') + ' ' + (m.texto || []).map(e => e.nome).join(' '),
    f: m.pag ? 'MI p. ' + m.pag : 'criatura sua', peso: 1.1 }));
  /* 6) técnicas do catálogo (o jogador só vê as que o mestre revelou por inteiro) */
  if (C) {
    (C.frutas || []).forEach(fr => { if (!mestre && (catEscondida('frutas') || catNivelFruta(fr.id) !== 'tudo')) return;
      fr.blocos.forEach(b => { if (b.k === 'regra') (b.p || []).forEach(p => { if (typeof p === 'string' && p.length > 20) add({ k: 'poder', t: `${b.t} · ${fr.nome}`, x: p, h: esc(p.length > 340 ? p.slice(0, 340).replace(/\s\S*$/, '') + '…' : p), dono: fr.nome, donoId: fr.id, donoTipo: 'fruta', f: fr.nome, peso: 0.9 }); });
        if (b.k === 'tec') add({ k: 'tec', t: b.nome, nome: b.nome, tec: b, dono: fr.nome, donoId: fr.id, donoTipo: 'fruta', x: `tecnica ${fr.nome} ${b.dano || ''} ${b.alcance || ''}`, f: fr.nome, peso: 1.1 }); }); });
    catTodosEstilos().forEach(e => { if (!mestre && (catEscondida('estilos') || catNivelEstilo(e.id) !== 'tudo')) return;
      (e.blocos || []).forEach(b => { if (b.k === 'tec') add({ k: 'tec', t: b.nome, nome: b.nome, tec: b, dono: e.nome, donoId: e.id, donoTipo: 'estilo', x: `tecnica ${e.nome} ${b.dano || ''} ${b.alcance || ''}`, f: e.nome + (e.pg ? ' · ' + e.pg : ''), peso: 1.1 }); }); });
  }
  /* 7) fichas: o mestre consulta todas; o jogador, só a dele */
  const fichas = mestre ? S().party.filter(p => p.sheet).map(p => ({ nome: nomePC(p), f: p.sheet, pc: p })) : (fichaDe(eu()) ? [{ nome: nomeJ(eu()), f: fichaDe(eu()), meu: true }] : []);
  fichas.forEach(o => add({ k: 'pj', t: o.nome, nome: o.nome, ficha: o.f, pc: o.pc, meu: o.meu, x: `ficha personagem ${o.f.jogador || ''} ${o.f.estilo || ''} ${o.f.akuma || ''}`, f: 'ficha', peso: 1.1 }));
  Ora.idx = docs; Ora.idxChave = chave; return docs;
}

/* ───── quem a pergunta cita (inimigo, técnica, personagem, condição, item) ───── */
function oraCitados(qt, docs) {
  /* nome citado: palavra igual, ou erro de 1 letra em palavra comprida (espadacim = espadachim). Começo parecido não vale (banana ≠ Bananawani). */
  const tem = w => qt.some(q => q === w || (w.length >= 7 && q.length >= 7 && oraQuase(q, w)));
  const achados = [];
  docs.forEach(d => { if (!d.nt || d.k === 'gloss') return; const nt = [...d.nt]; if (!nt.length) return;
    const bate = nt.filter(tem).length; if (bate === nt.length) achados.push({ d, n: nt.length, exato: nt.every(w => qt.includes(w)) }); });
  /* nome mais comprido ganha ("Pirata Novato Atirador" antes de "Pirata Novato"); um nome contido no outro sai */
  achados.sort((a, b) => b.n - a.n || (b.exato - a.exato));
  const fica = [];
  achados.forEach(a => { if (!fica.some(f => f.d.k === a.d.k && [...a.d.nt].every(w => f.d.nt.has(w)) && f.d !== a.d && f.n > a.n)) fica.push(a); });
  const de = k => fica.filter(a => a.d.k === k).map(a => a.d);
  return { mon: de('mon'), tec: de('tec'), pj: de('pj'), cond: de('cond'), item: de('item').filter(d => d.cab && /dano/i.test(d.cab.join(' ')) && /[a-z]{3}/i.test(d.nome)) };
}

/* ───── contas ───── */
const oraDobra = dados => String(dados || '').replace(/(\d+)d(\d+)/g, (m, q, f) => (2 * q) + 'd' + f);
const oraMetros = s => { const m = String(s || '').match(/(\d+(?:[.,]\d+)?)/); return m ? parseFloat(m[1].replace(',', '.')) : null; };
const oraM = n => String(Math.round(n * 10) / 10).replace('.', ',') + ' m';
const oraSelo = (f, tipo) => tipo === 'mesa' ? '<span class="ora-selo mesa">decisão da mesa</span>' : f ? `<span class="ora-selo ok">conferido · ${esc(f)}</span>` : '<span class="ora-selo ver">a conferir</span>';
const oraRolarBt = (expr, titulo) => souMestre() ? ` <button class="link" data-act="rolar" data-expr="${esc(expr)}" data-titulo="${esc(titulo)}">rolar</button>` : '';
function oraSalvMon(m) { const e = (m.texto || []).find(x => /^Salvaguarda/i.test(x.nome)), o = {}; if (e) e.texto.replace(/(Força|Destreza|Constituição|Sabedoria|Presença|Vontade)\s*([+−-]\s*\d+)/g, (x, a, v) => { o[sem(a)] = parseInt(v.replace('−', '-').replace(/\s/g, ''), 10); }); return o; }
/* chega em quantos turnos? LJ p. 286 (deslocamento) e 288 (Disparada) */
function oraChegada(dist, desl, alcance = 1.5) {
  const falta = Math.max(0, dist - alcance);
  if (!(desl > 0)) return null;
  const andando = Math.max(1, Math.ceil(falta / desl - 1e-9));
  const comDisp = falta <= desl ? 1 : Math.ceil((falta - desl) / (2 * desl) - 1e-9) + 1;
  const soCorre = Math.max(1, Math.ceil(falta / (2 * desl) - 1e-9));
  return { falta, andando, comDisp, soCorre };
}
function oraRespChegada(dist, desl, quem, fonteDesl) {
  const r = oraChegada(dist, desl); if (!r) return null;
  const turno = n => n === 1 ? 'no <b>1º turno</b> dele' : `no <b>${n}º turno</b> dele`;
  const linhas = [`${quem} anda <b>${oraM(desl)}</b> por turno${fonteDesl ? ` <small>(${esc(fonteDesl)})</small>` : ''}. Para lutar corpo a corpo precisa ficar a 1,5 m: faltam <b>${oraM(r.falta)}</b>.`];
  if (r.falta <= 0) linhas.push('Já está no alcance: ataca agora.');
  else {
    linhas.push(`<b>Só andando:</b> chega e ataca ${turno(r.andando)}.`);
    linhas.push(r.comDisp < r.andando ? `<b>Com Disparada</b> (gasta a ação; dobra o deslocamento do turno): ataca ${turno(r.comDisp)}.`
      : r.soCorre < r.andando ? `<b>Com Disparada</b> ele encosta ${turno(r.soCorre)}, mas sem a ação para atacar. O ataque comum sai ${turno(r.andando)} do mesmo jeito (a ação poderosa continua livre para uma técnica).`
        : '<b>Disparada</b> não muda nada aqui.');
    linhas.push('Ninguém anda no turno dos outros: ele só se move na vez dele.');
    linhas.push(`<b>Ação preparada</b> ("quando ele chegar, eu ataco"): vale até o começo do seu próximo turno. ${r.soCorre <= 1 ? (r.andando <= 1 ? 'Aqui ele chega já no 1º turno: o gatilho dispara.' : 'Aqui só dispara se ele usar Disparada; se só andar, não chega e a ação preparada se perde.') : 'Aqui ele não chega em 1 turno nem correndo: a ação preparada se perde.'}`);
  }
  return { t: `Chegar a ${oraM(dist)} de distância`, h: `<ul><li>${linhas.join('</li><li>')}</li></ul>`, f: 'LJ p. 286, 288 e 289' };
}
/* como uma técnica se resolve: jogada de ataque ou salvaguarda */
function oraResolveTec(b) {
  const partes = (b.desc || []).join(' ').split(/Alternativamente[:,]?/i);
  return partes.map((p, i) => {
    const atk = /jogada de ataque/i.test(p), salvs = [...new Set((p.match(/Salvaguarda de (Força|Destreza|Constituição|Sabedoria|Presença|Vontade)/g) || []).map(s => s.replace('Salvaguarda de ', '')))];
    const desv = /Salvaguarda de [A-ZÀ-ú][a-zà-ú]+,? com desvantagem/i.test(p);
    const dano = (p.match(/(\d+d\d+(?:\s*\+\s*\d+)?) de dano ([A-ZÀ-ú][a-zà-ú]+)/) || [])[0];
    let txt;
    if (atk) txt = `<b>Você rola o ataque</b> (jogada de ataque de Técnicas: d20 + Proficiência + atributo do estilo ou da fruta) contra a CR do alvo.${salvs.length ? ` Se acertar, o alvo ainda faz <b>Salvaguarda de ${salvs.join(' ou ')}</b> contra a sua CD para evitar o efeito extra.` : ''}`;
    else if (salvs.length) txt = `<b>Você não rola ataque.</b> Quem rola é o alvo: <b>Salvaguarda de ${salvs.join(' ou ')}</b>${desv ? ' <b>com desvantagem</b>' : ''} contra a sua CD (8 + Proficiência + atributo).`;
    else txt = 'O texto não pede jogada de ataque nem salvaguarda: o efeito acontece.';
    return `<li>${partes.length > 1 ? `<b>${i ? 'Uso alternativo' : 'Uso normal'}:</b> ` : ''}${txt}${i && dano ? ` Dano deste uso: <b>${esc(dano)}</b>.` : ''}</li>`;
  }).join('');
}
function oraCartaoTec(d) {
  const b = d.tec, grau = b.tipo === 'auxiliar' || /aux/i.test(b.tipo || '') ? 'Auxiliar' : `${b.grau}º grau`;
  const li = [['Custo', b.pp != null ? b.pp + ' PP' : ''], ['Alcance', b.alcance], ['Requisito', b.req], ['Dano', b.dano], ['Duração', b.duracao], ['Ataque Combinado', b.comb]].filter(x => x[1]).map(([a, v]) => `<li>${a}: <b>${esc(v)}</b></li>`).join('');
  return { t: `${b.nome} (${grau} · ${d.dono})`, h: `<ul class="ora-nums">${li}</ul><ul>${oraResolveTec(b)}</ul>
    <p><button class="link" data-act="ora-abrir-cat" data-tipo="${d.donoTipo}" data-id="${esc(d.donoId)}">Abrir ${esc(d.dono)} no Catálogo</button></p>`, f: d.f };
}
function oraCartaoMon(d, qt, qn) {
  const m = d.m, sv = oraSalvMon(m), out = [];
  const pedeCrit = /critic|crita|critou|20 natural/.test(qn), pedeSalv = /salvaguard|\bsalv\b|resist/.test(qn);
  const atq = (m.ataques || []).filter(a => oraTok(a.nome).every(w => qt.some(q => oraBate(q, w) >= 2)));
  const ataques = atq.length ? atq : (m.ataques || []);
  if (pedeSalv) {
    const pedidos = ORA_ATTR.filter(([, n]) => qn.includes(n.slice(0, 5)));
    const lista = (pedidos.length ? pedidos : ORA_ATTR).map(([sig, n, N]) => { const i = ['FOR', 'DES', 'CON', 'SAB', 'PRE', 'VON'].indexOf(sig), mod = m.attrs ? m.attrs[i][1] : 0, v = sv[n] != null ? sv[n] : mod;
      return `<li>Salvaguarda de <b>${N}</b>: 1d20 <b>${sg(v)}</b> <small>(${sv[n] != null ? 'proficiente: a ficha dele já dá esse número' : `só o modificador de ${N} ${m.attrs ? m.attrs[i][0] : ''}; a ficha não lista proficiência`})</small>${oraRolarBt('1d20' + sg(v), `${m.nome}: Salv. ${N}`)}</li>`; }).join('');
    out.push({ t: `Salvaguardas de ${m.nome}`, h: `<ul>${lista}</ul><p class="nota">Salvaguarda = d20 + modificador do atributo (+ Proficiência se for proficiente), contra a CD do efeito. Com desvantagem: rola 2d20 e fica com o menor.</p>`, f: d.f + ' · LJ p. 261' });
  }
  if (pedeCrit && ataques.length) {
    const extras = (m.texto || []).filter(e => /dano extra|dado extra|dados extras/i.test(e.texto) && !/^Ataque|^Sabre|^Pistola/i.test(e.nome));
    out.push({ t: `Crítico de ${m.nome}`, h: `<ul>${ataques.filter(a => a.dados).map(a => `<li><b>${esc(a.nome)}</b>: normal ${esc(a.dados)} → crítico <b>${esc(oraDobra(a.dados))}</b> de dano ${esc((a.dano || '').toLowerCase())}${oraRolarBt(oraDobra(a.dados), `${m.nome}: crítico de ${a.nome}`)}</li>`).join('')}</ul>
      <p class="nota">Crítico dobra os <b>dados</b>; o número fixo soma uma vez só.</p>${extras.length ? `<p><b>Dano extra que ele tem:</b></p><ul>${extras.map(e => `<li><b>${esc(e.nome)}:</b> ${esc(e.texto)}</li>`).join('')}</ul><p class="nota">Se o dano extra for de dados e entrar no golpe crítico, o livro manda rolar todos os dados do ataque duas vezes. O que diz "incluso no ataque" já está na conta de cima.</p>` : ''}`, f: d.f + ' · LJ p. 290 e 292' });
  }
  if (!out.length) {
    out.push({ t: `${m.nome} (${m.cat || 'inimigo'} · ND ${m.nd})`, h: `<ul class="ora-nums"><li>CR <b>${m.cr ?? '—'}</b></li><li>PV <b>${fmt(m.pv)}</b></li><li>Deslocamento <b>${esc(m.desl || '—')}</b></li>${m.cd ? `<li>CD <b>${m.cd}</b></li>` : ''}<li>XP <b>${fmt(m.xp)}</b></li>${m.pp ? `<li>PP <b>${m.pp}</b></li>` : ''}</ul>
      <ul>${(m.ataques || []).map(a => `<li><b>${esc(a.nome)}</b> (${esc(a.tipo || '')}): ${sg(a.bonus)} para acertar, alcance ${esc(a.alcance || '')}, dano <b>${esc(a.dados || '')}</b> ${esc((a.dano || '').toLowerCase())}${oraRolarBt('1d20' + sg(a.bonus), `${m.nome}: ${a.nome}`)}</li>`).join('')}</ul>
      ${Object.keys(sv).length ? `<p>Salvaguardas com proficiência: ${Object.entries(sv).map(([k, v]) => `${(ORA_ATTR.find(a => a[1] === k) || [])[2]} ${sg(v)}`).join(', ')}.</p>` : ''}
      <p><button class="link" data-act="mon-ver" data-id="${esc(m.id)}">Ficha completa</button></p>`, f: d.f });
  }
  return out;
}
function oraCartaoPJ(d, qn) {
  const f = d.ficha, out = [], quem = d.meu ? 'Você' : d.nome;
  const pedidos = ORA_ATTR.filter(([, n]) => qn.includes(n.slice(0, 5)));
  if (/salvaguard|\bsalv\b|resist/.test(qn)) {
    const li = (pedidos.length ? pedidos : ORA_ATTR).map(([sig, , N]) => { const a = (f.attrs || []).find(x => x.n === sig) || {}; return `<li>Salvaguarda de <b>${N}</b>: 1d20 <b>${sg(num(a.salv) ?? num(a.m) ?? 0)}</b>${a.prof ? ' <small>(proficiente)</small>' : ''}</li>`; }).join('');
    out.push({ t: `Salvaguardas de ${d.nome}`, h: `<ul>${li}</ul>`, f: 'ficha · LJ p. 261' });
  }
  const per = (f.pericias || []).filter(p => qn.includes(oraNorm(p.n).slice(0, 6)));
  if (per.length) out.push({ t: `Perícias de ${d.nome}`, h: `<ul>${per.map(p => `<li><b>${esc(p.n)}</b>: 1d20 <b>${sg(num(p.v) || 0)}</b>${p.prof ? ' <small>(proficiente)</small>' : ''}</li>`).join('')}</ul>`, f: 'ficha' });
  if (!out.length) {
    const k = d.pc ? calc(d.pc) : null;
    out.push({ t: `${d.nome} (nível ${f.nivel || '?'} · ${[f.especie, f.estilo].filter(Boolean).join(' · ')})`, h: `<ul class="ora-nums"><li>CR <b>${k ? k.cr : f.cr ?? '—'}</b></li><li>PV máx. <b>${(f.pv || {}).max ?? '—'}</b></li><li>PP máx. <b>${(f.pp || {}).max ?? '—'}</b></li><li>Deslocamento <b>${(f.desl || {}).terra ?? '—'} m</b></li>
      <li>CD do estilo <b>${f.estiloCD ?? '—'}</b></li><li>Ataque de técnica <b>${sg(num(f.estiloAtk) || 0)}</b></li>${f.temFruta ? `<li>CD da fruta <b>${f.akumaCD ?? '—'}</b></li>` : ''}</ul>
      <p>${quem === 'Você' ? 'Seus' : 'Os'} atributos: ${(f.attrs || []).map(a => `${a.n} ${a.v ?? '—'} (${sg(num(a.m) || 0)})`).join(' · ')}</p>`, f: 'ficha' });
  }
  return out;
}


/* ───── respostas certas para as dúvidas que mais aparecem (cada uma conferida no livro) ───── */
const ORA_FAQ = [
  { re: q => /oportunidade/.test(q), t: 'Ataque de oportunidade', f: 'LJ p. 39',
    h: () => `<ul><li><b>Não existe como regra geral.</b> Sair de perto de um inimigo não dá ataque de graça para ele.</li>
      <li>Só tem quem ganha por <b>característica</b>: a Habilidade Básica <b>Prodígio do Combate</b> (LJ p. 39), versões de alguns estilos (Superior, Brutal, Estratégico, Traiçoeiro) e alguns inimigos.</li>
      <li><b>Como funciona para quem tem:</b> gasta a <b>reação</b> e faz um ataque comum corpo a corpo contra uma criatura que ele vê, quando ela sai <b>por vontade própria</b> do alcance dele.</li>
      ${souMestre() ? (() => { const l = MON().filter(m => (m.texto || []).some(e => /Ataque de Oportunidade/i.test(e.nome))).map(m => m.nome); return l.length ? `<li>No Manual dos Inimigos, têm essa reação: ${esc(l.join(', '))}.</li>` : ''; })() : ''}</ul>` },
  { re: q => /poderosa/.test(q) && /ataque|atacar|atac|comum|acao\b|junto|mesmo turno/.test(q), t: 'Ação poderosa não gasta o ataque comum', f: 'LJ p. 284 e 37',
    h: () => `<ul><li>No seu turno você tem: <b>deslocamento + 1 ação + 1 ação poderosa</b>.</li><li>A <b>ação poderosa</b> serve para as Técnicas. A <b>ação</b> serve para Atacar, Disparada, Esquivar, Preparar e as outras.</li>
      <li>Uma não gasta a outra: dá para <b>atacar com a ação e usar uma técnica com a ação poderosa</b> no mesmo turno, na ordem que quiser.</li><li>Limite: <b>1 técnica por turno</b>, mesmo que sejam diferentes (a exceção é a técnica de ação bônus).</li></ul>` },
  { re: (q, c) => !c.mon.length && /20 natural|natural 20|critic|crita|tirar 20|tirou 20/.test(q) && /\bcr\b|acert|acima|maior|sempre|erra|alta/.test(q), t: '20 natural acerta sempre', f: 'LJ p. 290 e 292',
    h: () => `<ul><li><b>Tirou 20 no d20:</b> o ataque acerta, não importa a CR do alvo nem os modificadores. Vale para ataque comum e para Técnicas.</li><li>E é <b>acerto crítico</b>: role todos os dados de dano duas vezes e some os modificadores uma vez só.</li>
      <li><b>Tirou 1:</b> erra sempre (falha crítica).</li><li>Então, contra uma CR que o bônus não alcança, a única forma de acertar é o 20 natural (5% de chance).</li></ul>` },
  { re: (q, c) => /salvaguard|\bsalv\b/.test(q) && /define|como|calcul|funciona|rola|o que e|oq|qual a conta/.test(q), t: 'Como se rola uma Salvaguarda', f: 'LJ p. 261',
    h: () => `<ul><li>Quem sofre o efeito rola <b>1d20 + modificador do atributo</b> pedido (+ <b>Proficiência</b>, se for proficiente naquela salvaguarda).</li><li>Tem que igualar ou passar a <b>CD</b> do efeito. A CD de uma técnica é 8 + Proficiência + atributo de quem usou.</li>
      <li>Com <b>desvantagem</b>: rola 2d20 e fica com o menor. Com vantagem: fica com o maior.</li><li>Jogador: o número de cada salvaguarda já está na ficha. Inimigo: escreva o nome dele aqui junto (ex.: "salvaguarda de destreza do pirata novato").</li></ul>` },
  { re: q => /turno d[eo]s? outr|fora d[eo] (seu |proprio )?turno|vez d[eo]s? outr|entre (os )?turnos|turno alheio/.test(q), t: 'Ninguém anda no turno dos outros', f: 'LJ p. 284 a 286 e 289',
    h: () => `<ul><li>Cada criatura só se move <b>no próprio turno</b>, até o seu deslocamento (pode quebrar em pedaços).</li><li>Quem está correndo na sua direção <b>não fica "no meio do caminho"</b> entre os turnos: ele anda tudo na vez dele e para onde parou.</li>
      <li>Exceções: uma <b>reação</b> que dê movimento, a <b>ação preparada</b> (pode ser "andar até o meu deslocamento" quando o gatilho acontecer) ou ser <b>empurrado</b>.</li></ul>` },
  { re: (q, c) => /prepar|gatilho/.test(q) && !/\d\s*(m|metros?)\b/.test(q), t: 'Ação Preparar', f: 'LJ p. 289',
    h: () => `<ul><li>Gasta a sua <b>ação</b>. Você diz um <b>gatilho</b> que dê para perceber e o que vai fazer (uma ação, ou andar até o seu deslocamento).</li><li>Quando o gatilho acontece, você age com a <b>reação</b>, ou escolhe ignorar. Só 1 reação por rodada.</li>
      <li>Vale <b>até o início do seu próximo turno</b>. Se o gatilho não acontecer até lá, perdeu.</li><li><b>Preparar uma Técnica:</b> usa junto a ação poderosa, <b>gasta o PP na hora</b> e segura com <b>concentração</b>. Levou dano antes: pode perder a técnica.</li>
      <li>Dica: para saber se o inimigo chega a tempo, pergunte aqui com a distância (ex.: "pirata novato a 15 m chega quando?").</li></ul>` },
  { re: q => /disparad|\bcorr(er|e|ida|endo)\b|\bdash\b/.test(q) && !/\d\s*(m|metros?)\b/.test(q), t: 'Disparada (correr)', f: 'LJ p. 288',
    h: () => `<ul><li>É uma <b>ação</b>. Neste turno você ganha deslocamento extra igual ao seu deslocamento (9 m vira 18 m).</li><li>Como gasta a ação, quem dispara <b>não usa a ação Atacar</b> no mesmo turno. A ação poderosa continua livre.</li>
      <li>Se o deslocamento estiver reduzido, a Disparada cai junto (4,5 m vira 9 m).</li></ul>` },
  { re: q => /\bcd\b/.test(q) && /tecnic|calcul|como|qual|conta|fruta|akuma/.test(q) && !/salvaguard/.test(q), t: 'CD e ataque das Técnicas', f: 'LJ p. 192 e 267',
    h: () => `<ul><li><b>CD da técnica = 8 + Proficiência + modificador do atributo</b> do estilo (ex.: Samurai usa Força ou Destreza).</li><li><b>Ataque de técnica = d20 + Proficiência + o mesmo modificador</b>, contra a CR do alvo.</li>
      <li>Na Akuma no Mi o livro diz "atributo apropriado": é uma das pendências da mesa (defina por fruta).</li><li>Bônus de ataque comum não vale em técnica, a não ser que o texto diga.</li></ul>` },
  { re: q => /quantas? tecnica|tecnicas? por turno|duas tecnica|2 tecnica|mais de uma tecnica/.test(q), t: 'Quantas técnicas por turno', f: 'LJ p. 37 e 192',
    h: () => `<ul><li><b>Uma técnica por turno</b>, mesmo que sejam técnicas diferentes.</li><li>Exceção: as que usam <b>ação bônus</b>. Dá uma de ação poderosa mais uma de ação bônus.</li><li>O Ataque Combinado não gasta a ação poderosa, mas gasta PP.</li></ul>` }
];
/* ───── respostas diretas: quando dá para fazer a conta ou a regra é certa ───── */
function oraDiretas(q, qt, docs) {
  const qn = oraNorm(q), out = [], cit = oraCitados(qt, docs);
  ORA_FAQ.forEach(x => { if (x.re(qn, cit)) out.push({ t: x.t, h: x.h(), f: x.f }); });
  /* rolar dado */
  const dd = qn.match(/\b(\d{0,2}d\d{1,3}(?:\s*[+-]\s*\d+)?)\b/);
  if (dd && (/^(role|rola|rolar|joga|jogar)?\s*\d{0,2}d\d/.test(qn) || /\brol|\bjog/.test(qn)) && !cit.mon.length) { const r = rolar(dd[1]);
    out.push({ t: `Rolagem de ${dd[1].replace(/\s/g, '')}`, h: `<p class="ora-grande">${r.total}</p><p class="nota">${r.partes.map(p => `${p.q}d${p.f}: ${p.r.join(', ')}`).join(' · ')}${r.mod ? ` · ${sg(r.mod)}` : ''}. Só você viu esta rolagem.</p>`, f: 'dado do site', semSelo: true }); }
  /* chance de acertar: "+7 contra CR 17" */
  const ac = qn.match(/\+\s*(\d+)\D{1,24}?\bcr\s*(\d+)/) || qn.match(/bonus\s*(?:de\s*)?(\d+)\D{1,24}?\bcr\s*(\d+)/);
  const crSolta = qn.match(/\bcr\s*(?:de\s*)?(\d+)/);
  const atacante = cit.mon[0] && crSolta && (cit.mon[0].m.ataques || [])[0];
  if (ac || atacante) {
    const bonus = ac ? +ac[1] : atacante.bonus, cr = ac ? +ac[2] : +crSolta[1], precisa = cr - bonus, faces = clamp(21 - Math.max(2, precisa), 1, 19);
    out.push({ t: `Acertar CR ${cr} com ${sg(bonus)}`, h: `<p>Precisa tirar <b>${precisa > 20 ? '20 natural' : Math.max(2, precisa) + ' ou mais'}</b> no d20: <b>${faces * 5}%</b> de chance.</p>
      <p class="nota">Conta: d20 ${sg(bonus)} ≥ ${cr}. 20 natural acerta sempre (e é crítico); 1 natural erra sempre. Com vantagem: ${Math.round((1 - Math.pow(1 - faces / 20, 2)) * 100)}%. Com desvantagem: ${Math.round(Math.pow(faces / 20, 2) * 100)}%.</p>`, f: 'LJ p. 290' });
  }
  /* distância: "ele está a 15 m, chega quando?" */
  const ms = [...qn.matchAll(/(\d+(?:[.,]\d+)?)\s*(?:m|metros?)\b/g)].map(m => parseFloat(m[1].replace(',', '.')));
  if (ms.length && /cheg|alcanc|distanc|longe|corre|anda|turno|aproxim|percorr|desloc|encost|perto/.test(qn)) {
    const quemDoc = cit.mon[0] || cit.pj[0];
    let desl = null, fonte = '', quem = 'Ele';
    if (cit.mon[0]) { desl = oraMetros(cit.mon[0].m.desl); fonte = `deslocamento do ${cit.mon[0].m.nome}, ${cit.mon[0].f}`; quem = `O ${cit.mon[0].m.nome}`; }
    else if (cit.pj[0]) { desl = num((cit.pj[0].ficha.desl || {}).terra); fonte = 'ficha'; quem = cit.pj[0].nome; }
    let dist = ms[0];
    if (desl == null && ms.length > 1) { const md = qn.match(/(?:desloc\w*|anda|move|velocidade)\D{0,14}(\d+(?:[.,]\d+)?)\s*(?:m|metros?)/); desl = md ? parseFloat(md[1].replace(',', '.')) : Math.min(...ms); dist = ms.find(x => x !== desl) ?? ms[0]; fonte = 'o deslocamento que você escreveu'; }
    if (desl == null) { desl = 9; fonte = 'usei 9 m, o deslocamento mais comum; escreva "deslocamento 12 m" ou o nome do inimigo para mudar'; }
    const r = oraRespChegada(dist, desl, quem, fonte); if (r) out.push(r);
    if (quemDoc) cit.usouChegada = true;
  }
  /* XP por ND (GN p. 126) */
  const nd = qn.match(/\bnd\s*(\d+(?:\/\d+)?)/);
  if (nd && souMestre() && ND_XP[nd[1]] != null && !cit.mon.length) out.push({ t: `ND ${nd[1]}`, h: `<p>Um inimigo de ND ${nd[1]} vale <b>${fmt(ND_XP[nd[1]])} XP</b>.</p>`, f: 'GN p. 126' });
  /* quem foi citado */
  if (!cit.usouChegada || /salvaguard|critic|dano|ataque/.test(qn)) cit.mon.slice(0, 2).forEach(d => out.push(...oraCartaoMon(d, qt, qn)));
  cit.tec.slice(0, 2).forEach(d => out.push(oraCartaoTec(d)));
  if (!cit.usouChegada) cit.pj.slice(0, 1).forEach(d => out.push(...oraCartaoPJ(d, qn)));
  if (/\b(minha|meu|meus|minhas)\b/.test(sem(q)) && !souMestre() && !cit.pj.length) { const meu = docs.find(d => d.k === 'pj' && d.meu); if (meu) out.push(...oraCartaoPJ(meu, qn)); }
  cit.cond.slice(0, 2).forEach(d => out.push({ t: `Condição: ${d.nome}`, h: `<p>${d.h}</p>`, f: d.f }));
  /* dano de arma ou munição da tabela */
  if (/dano|quanto|critic/.test(qn) && !cit.mon.length) {
    let itens = cit.item;
    if (!itens.length && /\bbala|municao|projet/.test(qn)) itens = docs.filter(d => d.k === 'item' && /pistola|mosquete/i.test((d.cel || [])[2] || '') && /^\d+d\d+/.test((d.cel || [])[1] || ''));
    if (itens.length) out.push({ t: itens.length > 1 ? 'Dano da munição de pistola e mosquete' : `Dano: ${itens[0].nome}`, h: `<ul>${itens.slice(0, 6).map(d => { const dano = d.cel[d.cab.findIndex(c => /dano/i.test(c))] || '';
      return `<li><b>${esc(d.nome)}</b>: <b>${esc(dano)}</b>${/^\d+d\d+/.test(dano) ? ` <small>(crítico: ${esc(oraDobra(dano))})</small>` : ''}${d.cel[2] && d.cel[2] !== '—' ? ` · ${esc(d.cel[2])}` : ''}</li>`; }).join('')}</ul>
      ${/\bbala|municao|projet/.test(qn) ? '<p class="nota">Pistola e mosquete não têm dano próprio na tabela: quem define o dano é a munição.</p>' : ''}`, f: itens[0].f });
  }
  return out.filter(Boolean);
}

/* ───── busca geral ───── */
function oraBuscar(qt, docs) {
  if (!qt.length) return [];
  const exp = qt.map(q => [q].concat((ORA_SIN[q] || []).map(oraStem)));
  const res = [];
  docs.forEach(d => {
    let pontos = 0, bateu = 0;
    exp.forEach(alts => {
      let melhor = 0;
      alts.forEach((a, ai) => { const fator = ai ? 0.85 : 1;
        if (d.tt.has(a)) melhor = Math.max(melhor, 3 * 1.8 * fator); else if (d.tok.has(a)) melhor = Math.max(melhor, 3 * fator);
        else if (melhor < 2) for (const w of d.tok) { const b = oraBate(a, w); if (b) melhor = Math.max(melhor, b * fator * (d.tt.has(w) ? 1.6 : 1)); } });
      if (melhor) bateu++; pontos += melhor;
    });
    const cobre = bateu / exp.length;
    if (cobre < (exp.length <= 2 ? 1 : 0.6)) return;
    /* textos curtos e certeiros primeiro */
    const s = pontos * cobre * (d.peso || 1) / Math.pow(Math.max(6, d.tok.size), 0.18);
    res.push({ d, s });
  });
  res.sort((a, b) => b.s - a.s);
  return res.slice(0, 40);
}
function oraResponder(q) {
  const docs = oraIndice(), qt = oraTok(q);
  const diretas = oraDiretas(q, qt, docs), achados = oraBuscar(qt, docs);
  /* junta as linhas do mesmo cartão */
  const grupos = [];
  achados.forEach(({ d, s }) => {
    if (d.k === 'mon' || d.k === 'tec' || d.k === 'pj') { if (!diretas.length || s > 6) grupos.push({ d, s, linhas: [] }); return; }
    const g = grupos.find(x => x.d.k !== 'mon' && x.d.t === d.t && x.d.k === d.k && x.d.sec === d.sec);
    if (g) { if (g.linhas.length < 4) g.linhas.push(d.h); } else grupos.push({ d, s, linhas: [d.h] });
  });
  return { q, qt, diretas, grupos: grupos.slice(0, 8), forte: !!diretas.length || !!(grupos[0] && grupos[0].s / Math.max(1, qt.length) >= 1.6) };
}

/* ───── tela ───── */
const ORA_EX = ['quanto de dano uma bala dá?', 'ação poderosa tira o ataque comum?', 'inimigo a 15 m com deslocamento 9 m chega quando?', 'o que é ataque de oportunidade?', '20 natural acerta mesmo com CR alta?', 'como funciona a ação preparar?', '+7 contra CR 17', 'caído', 'quanto custa um kit médico?'];
const ORA_EX_M = ['salvaguarda de destreza do pirata novato', 'crítico do pirata espadachim com sabre', 'trueno bastardo precisa rolar ataque?', 'pirata lutador a 20 m chega quando?'];
const oraHist = () => { try { return JSON.parse(lembrar('ora-hist') || '[]'); } catch (e) { return []; } };
const oraPend = () => { try { return JSON.parse(lembrar('ora-pend') || '[]'); } catch (e) { return []; } };
function oraGrupoHTML(g) {
  const d = g.d;
  if (d.k === 'mon') return `<article class="ora-c"><h3>${ic(retratoInimigo(d.m), 32)} ${esc(d.m.nome)} <small>inimigo · ND ${esc(d.m.nd)}</small></h3><p>CR ${d.m.cr ?? '—'} · PV ${fmt(d.m.pv)} · ${esc(d.m.desl || '')}</p><p><button class="link" data-act="mon-ver" data-id="${esc(d.m.id)}">Ficha completa</button> · <button class="link" data-act="ora-ex" data-q="${esc(d.m.nome)}">resumo aqui</button></p>${oraSelo(d.f)}</article>`;
  if (d.k === 'tec') return `<article class="ora-c"><h3>${esc(d.nome)} <small>técnica · ${esc(d.dono)}</small></h3><p>${d.tec.pp != null ? d.tec.pp + ' PP · ' : ''}${esc(d.tec.alcance || '')}${d.tec.dano ? ' · ' + esc(d.tec.dano) : ''}</p><p><button class="link" data-act="ora-ex" data-q="${esc(d.nome)}">ver como resolve</button></p>${oraSelo(d.f)}</article>`;
  if (d.k === 'pj') return `<article class="ora-c"><h3>${esc(d.nome)} <small>ficha</small></h3><p><button class="link" data-act="ora-ex" data-q="${esc(d.nome)}">ver números</button></p></article>`;
  if (d.k === 'poder') return `<article class="ora-c"><h3>${esc(d.t)} <small>poder</small></h3>${g.linhas.map(l => `<p>${l}</p>`).join('')}<p>${oraSelo(d.f)} <button class="link" data-act="ora-abrir-cat" data-tipo="${d.donoTipo}" data-id="${esc(d.donoId)}">abrir no Catálogo</button></p></article>`;
  const rot = { regra: d.secT || 'Regra', item: d.t, cond: 'Condição', gloss: 'Glossário do LJ', casa: 'Nossa mesa' }[d.k];
  return `<article class="ora-c ${d.k === 'casa' || d.mesa ? 'mesa' : ''}"><h3>${esc(d.k === 'item' || d.k === 'regra' ? d.t : d.nome || d.t)} <small>${esc(d.k === 'item' ? 'tabela' : rot)}</small></h3>
    ${g.linhas.length > 1 ? `<ul>${g.linhas.map(l => `<li>${l}</li>`).join('')}</ul>` : `<p>${g.linhas[0]}</p>`}
    <p>${oraSelo(d.f, d.k === 'casa' || d.mesa ? 'mesa' : '')}${d.sec && souMestre() ? ` <button class="link" data-act="ora-abrir-esc" data-t="${esc(d.t)}">abrir o cartão inteiro</button>` : ''}</p></article>`;
}
VIEWS.oraculo = {
  titulo: 'Pergunte ao livro', icone: 'status:busca',
  render() {
    const mestre = souMestre();
    if (!window.CATALOGO && !Cat.falhou) catCarregar();   // as técnicas entram na busca assim que o catálogo carregar
    const r = Ora.q ? (Ora.res = oraResponder(Ora.q)) : null, hist = oraHist(), pend = mestre ? oraPend() : [];
    const exemplos = ORA_EX.concat(mestre ? ORA_EX_M : []);
    const liv = r ? livSecaoHTML(Ora.q) : null;   // trechos do texto do livro (81b)
    let corpo;
    if (!r) corpo = `<section class="pap ora-ini"><h2>Pode perguntar do seu jeito</h2><p class="nota">Eu procuro nas regras do site (com a página do livro), nas condições, nas armas${mestre ? ', nos inimigos do Manual, nas técnicas, nas fichas e nas regras da casa' : ', na sua ficha e no que o mestre revelou'}. Faço a conta quando dá. Depois mostro os trechos do próprio livro que falam disso, com a página. Não invento regra: se não achar, eu digo.</p>
        <div class="ora-ex">${exemplos.map(e => `<button class="chip" data-act="ora-ex" data-q="${esc(e)}">${esc(e)}</button>`).join('')}</div>
        ${hist.length ? `<h3>Suas últimas perguntas</h3><div class="ora-ex">${hist.map(e => `<button class="chip" data-act="ora-ex" data-q="${esc(e)}">${esc(e)}</button>`).join('')}</div>` : ''}</section>`;
    else corpo = `${r.diretas.length ? `<section class="ora-dir">${r.diretas.map(d => `<article class="pap ora-resp"><h2>${esc(d.t)}</h2>${d.h}<p>${d.semSelo ? '' : oraSelo(d.f)}</p></article>`).join('')}</section>` : ''}
      ${!r.forte ? `<p class="pap ora-nao"><b>${!r.grupos.length && liv.n ? 'Não tenho uma resposta pronta para isso.' : 'Não achei uma regra que responda isso com certeza.'}</b> ${r.grupos.length ? 'O mais perto que tenho está aqui embaixo.' : liv.n ? 'Mas achei estes trechos no texto do livro: veja abaixo.' : 'Tente outras palavras (ex.: o nome da condição, da arma ou do inimigo).'}
          ${mestre ? `<button class="bt fino" data-act="ora-pend">Guardar como pendência</button>` : ''}</p>` : ''}
      ${r.grupos.length ? `<h2 class="ora-h">${r.diretas.length ? 'Regras ligadas a isso' : 'O que o livro diz'}</h2><div class="ora-grade">${r.grupos.map(oraGrupoHTML).join('')}</div>` : ''}
      ${liv.h}
      ${mestre ? `<section class="pap ora-dec"><h3>Decidiu algo na mesa sobre isso?</h3><p class="nota">Escreva a decisão. Ela vira regra da casa e passa a aparecer primeiro nas próximas buscas.</p>
        <div class="linha-bts"><input id="ora-dec" class="cresce" placeholder="Ex.: a ROOM some se a usuária desmaiar" data-enter="ora-dec-add"><button class="bt bom" data-act="ora-dec-add">Guardar decisão</button></div></section>` : ''}`;
    return `<div class="ora"><header class="esc-topo"><h1>${ic('status:busca', 64)}Pergunte ao livro</h1>
        <div class="ora-form cresce"><input id="ora-q" type="search" autocomplete="off" placeholder="Escreva a dúvida (ex.: ele está a 15 m, chega neste turno?)" value="${esc(Ora.q)}" data-enter="ora-ir">
          <button class="bt bom" type="button" data-act="ora-ir">Perguntar</button>${Ora.q ? '<button class="bt fino" type="button" data-act="ora-limpar">Limpar</button>' : ''}</div></header>
      ${corpo}
      ${mestre && pend.length ? `<details class="pap ora-pend"><summary>Pendências que o livro não respondeu (${pend.length})</summary><ul>${pend.map((p, i) => `<li>${esc(p)} <button class="link" data-act="ora-ex" data-q="${esc(p)}">perguntar de novo</button> <button class="link" data-act="ora-pend-tirar" data-i="${i}">resolvida</button></li>`).join('')}</ul></details>` : ''}
      <p class="nota ora-pe">Atalho: tecla <kbd>P</kbd> abre esta aba de qualquer lugar. As respostas saem dos dados do site, sem IA${window.CATALOGO ? '' : ' (carregando as técnicas…)'}.</p></div>`;
  },
  depois(r) { const i = $('#ora-q', r); if (i && !Ora.q) i.focus({ preventScroll: true }); }
};
function oraPerguntar(q) {
  q = String(q || '').trim(); Ora.q = q;
  if (q) { const h = oraHist().filter(x => x !== q); h.unshift(q); lembrar('ora-hist', JSON.stringify(h.slice(0, 8))); }
  if (App.rota !== 'oraculo') App.ir('oraculo'); else { App.render(); window.scrollTo(0, 0); }
}
ACT['ora-ir'] = () => oraPerguntar(($('#ora-q') || {}).value);
ACT['ora-ex'] = el => oraPerguntar(el.dataset.q);
ACT['ora-limpar'] = () => { Ora.q = ''; App.render(); const i = $('#ora-q'); if (i) i.focus(); };
ACT['ora-abrir-esc'] = el => { VIEWS.escudo.busca = el.dataset.t; VIEWS.escudo.sec = 'selos'; App.ir('escudo'); };
ACT['ora-abrir-cat'] = el => { Cat.aba = el.dataset.tipo === 'fruta' ? 'frutas' : 'estilos'; Cat.aberto = el.dataset.id; Cat.busca = ''; App.ir('catalogo'); };
ACT['ora-pend'] = () => { if (!Ora.q) return; const p = oraPend().filter(x => x !== Ora.q); p.unshift(Ora.q); lembrar('ora-pend', JSON.stringify(p.slice(0, 40))); toast('Guardei nas pendências, no fim desta aba.', { tipo: 'bom' }); App.render(); };
ACT['ora-pend-tirar'] = el => { const p = oraPend(); p.splice(+el.dataset.i, 1); lembrar('ora-pend', JSON.stringify(p)); App.render(); };
ACT['ora-dec-add'] = () => {
  const v = (($('#ora-dec') || {}).value || '').trim(); if (!v) return toast('Escreva a decisão primeiro.');
  Store.set(s => { s.config.casa.push(v); }, `Decisão da mesa: ${v}`);
  Ora.idx = null; toast('Decisão guardada nas regras da casa (Ajustes).', { tipo: 'bom' }); App.render();
};
/* tecla P: perguntar, de qualquer aba */
document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey || /INPUT|TEXTAREA|SELECT/.test((e.target || {}).tagName || '') || Modal.aberto()) return;
  if ((e.key === 'p' || e.key === 'P') && typeof Mesa !== 'undefined' && Mesa.aberta && ROTAS.includes('oraculo')) { e.preventDefault(); App.ir('oraculo'); setTimeout(() => { const i = $('#ora-q'); if (i) { i.focus(); i.select(); } }, 30); }
});
NAV.mestre.forEach(g => { if (g[0] === 'Regras') g[1].unshift('oraculo'); });
NAV.jogador[0][1].push('oraculo');
