/* ═══════════ FICHAS DO MESTRE (PDM): personagens que o mestre narra, com ficha 2.0 própria ═══════════
   Cada ficha fica em s.party com pdm:true (assim dano, PP, condições, descanso e técnicas são os mesmos dos jogadores).
   O mestre escolhe: no Grupo (p.noGrupo), vilão (p.vilao), ou só guardada. Nada é fixo: tudo vem da ficha lida. */
const NPC_RET = ['npcs:recruta', 'npcs:oficial', 'npcs:agente_governo', 'npcs:revolucionario', 'npcs:tenryuubito', 'npcs:mercadora', 'npcs:medico', 'npcs:carpinteiro',
  'npcs:cozinheiro', 'npcs:fotografa', 'npcs:cientista', 'npcs:bandido', 'npcs:pescador', 'npcs:taverneira', 'npcs:crianca', 'npcs:cacador',
  'especies2:oni_guerreiro', 'especies2:oni_guerreira', 'especies2:oni_anciao', 'especies2:oni_samurai', 'especies2:mink_felino', 'especies2:mink_urso', 'especies2:mink_lebre',
  'especies2:tritao', 'especies2:homem_peixe_polvo', 'especies2:lunariano_encapuzado', 'especies2:experimento'].filter(temIc);
const pdms = s => s.party.filter(p => p.pdm);
const xpDeND = nd => (nd == null || nd === '') ? 0 : (ND_XP[String(nd).trim()] || 0);
/* a ficha do mestre como "criatura" do encontro: o XP vem do ND que o mestre escolher */
function monDePdm(id) {
  const p = S().party.find(x => x.id === id && x.pdm); if (!p) return null;
  const k = p.sheet ? calc(p) : { cr: null };
  return { id: 'pdm:' + p.id, pdm: p.id, nome: nomePC(p), nd: p.nd || '?', xp: xpDeND(p.nd), cr: k.cr, retrato: (p.live && p.live.retrato) || 'mesa:npc', cat: 'Ficha do mestre' };
}
/* põe a ficha na luta. inimigo = do lado dos vilões (os jogadores só veem o estado, não os PV) */
function pdmNaLuta(s, id, inimigo) {
  const p = s.party.find(x => x.id === id); if (!p || !p.sheet) return false;
  const ja = s.combate.lista.find(c => c.pcId === id);
  if (ja) { ja.inimigo = !!inimigo; return false; }
  s.combate.lista.push({ id: uid(), pcId: id, ini: null, inimigo: !!inimigo }); return true;
}
let pdmFiltro = 'todos';
VIEWS.pdm = {
  titulo: 'Fichas do mestre', icone: 'mesa:npc',
  render() {
    const s = S(), todos = pdms(s);
    const F = { todos: ['Todas', () => true], grupo: ['No Grupo', p => p.noGrupo], vilao: ['Vilões', p => p.vilao], guardado: ['Guardadas', p => !p.noGrupo && !p.vilao] };
    const lista = todos.filter(F[pdmFiltro] ? F[pdmFiltro][1] : () => true);
    return `<section class="pdm">
      <div class="enc-cab"><div><h1>Fichas do mestre</h1>
        <p class="nota">Personagens que você narra (aliados, rivais, vilões), com a mesma ficha 2.0 dos jogadores. Tudo sai da ficha: PV, PP, CR, técnicas, dado de vida, inventário. Os jogadores não veem esta aba.</p></div>
        <div class="linha-bts"><button class="bt bom" data-act="pdm-novo">${ic('mesa:npc', 32)}Nova ficha</button>
        <a class="bt fino" href="modelos/Ficha_PdN_modelo.xlsx" download title="Ficha 2.0 enxuta para PdN. Suba no Google Planilhas, preencha e conecte aqui.">${ic('modos:mochila', 32)}Ficha de PdN em branco</a></div></div>
      <div class="chips" role="group" aria-label="Filtrar">${Object.entries(F).map(([k, [n, f]]) => `<button class="chip ${pdmFiltro === k ? 'on' : ''}" data-act="pdm-filtro" data-k="${k}">${n} <small>${todos.filter(f).length}</small></button>`).join('')}</div>
      ${lista.length ? `<div class="pdm-lista">${lista.map(cartaPdm).join('')}</div>` : `<p class="vazio-li">${todos.length ? 'Nenhuma ficha neste filtro.' : 'Nenhuma ficha ainda. Use “Nova ficha” e conecte o link ou o .xlsx da ficha 2.0 do personagem.'}</p>`}
      <details class="caixa"><summary>Como funciona</summary><ul class="lista">
        <li><b>No Grupo</b>: aparece em Grupo junto com os jogadores, como aliado. Não conta na média de nível, no XP nem na Barra de Bônus. No Encontro, só entra na conta se você marcar a caixa dele.</li>
        <li><b>Vilão</b>: aparece no Encontro em “Vilões das suas fichas”. O XP dele vem do ND que você escolher aqui (GN p. 45–46). Na luta, os jogadores só veem o estado dele (Inteiro, Ferido…), não os PV.</li>
        <li>Pode ser os dois, ou nenhum (guardada para depois). Dá para mudar a qualquer hora.</li>
        <li>Ficha pelo link: relê junto com as dos jogadores (Ler fichas, e sozinho a cada 5 minutos).</li>
        <li><b>Ficha de PdN em branco</b>: é a ficha 2.0 sem a aba velha de Haki e com as abas internas escondidas. Abra no Google Planilhas (Arquivo › Importar), preencha e cole o link aqui. O nome do PdN vai em <b>Personalização › Nome</b>.</li></ul></details>
    </section>`;
  }
};
function cartaPdm(p) {
  const sh = p.sheet, k = sh ? calc(p) : null, L = p.live || {}, id = p.id;
  const linha = sh ? `Nv ${sh.nivel || '?'} · ${esc([sh.especie, sh.estilo, sh.profissao].filter(Boolean).join(' · ') || 'ficha sem espécie/estilo')}${sh.temFruta ? ' · ' + esc(sh.akuma) : ''}` : 'Sem ficha conectada';
  const nums = k ? `<ul class="pdm-nums"><li>PV <b>${k.pv}/${k.pvMax}</b></li><li>PP <b>${k.pp}/${k.ppMax}</b></li><li>CR <b>${k.cr}</b></li><li>CD <b>${k.cd ?? '—'}</b></li><li>Atq. ${sg(k.atk)}</li>${sh.recompensa ? `<li>฿ ${fmt(num(sh.recompensa))}</li>` : ''}</ul>` : '';
  const nds = Object.keys(ND_XP);
  return `<article class="pdm-c ${p.vilao ? 'vilao' : ''} ${p.noGrupo ? 'grupo' : ''}">
    <div class="pdm-cab"><span class="pdm-ret" data-act="pc-editar" data-id="${id}" title="Trocar retrato" role="button" tabindex="0">${retratoHTML(L.retrato || 'mesa:npc', nomePC(p), 64)}</span><div class="cresce"><h3>${esc(nomePC(p))}</h3><p>${linha}</p>
      ${p.lidoEm ? `<small class="nota">${p.origem === 'link' ? 'link' : 'arquivo'} · lida às ${hora(p.lidoEm)}</small>` : ''}</div></div>
    ${nums}
    <div class="pdm-papel">
      <label class="check"><input type="checkbox" data-chg="pdm-grupo" data-id="${id}" ${p.noGrupo ? 'checked' : ''}> No Grupo (aliado)</label>
      <label class="check"><input type="checkbox" data-chg="pdm-vilao" data-id="${id}" ${p.vilao ? 'checked' : ''}> Vilão</label>
      ${p.vilao ? `<label>ND <select data-chg="pdm-nd" data-id="${id}" aria-label="ND de ${esc(nomePC(p))}"><option value="">—</option>${nds.map(n => `<option ${String(p.nd) === n ? 'selected' : ''}>${n}</option>`).join('')}</select> <small>${p.nd ? fmt(xpDeND(p.nd)) + ' XP' : 'escolha para contar XP'}</small></label>` : ''}
    </div>
    <label class="campo">Quem é, o que quer, segredos (só você vê)<textarea rows="2" data-chg="pdm-nota" data-id="${id}">${esc(p.nota || '')}</textarea></label>
    <div class="linha-bts">
      ${sh ? `<button class="bt fino" data-act="pc-ficha" data-id="${id}">${ic('tesouro:livro', 32)}Ficha</button>` : ''}
      <button class="bt fino bom" data-act="pc-editar" data-id="${id}">${ic('mesa:imagem', 32)} Trocar retrato</button>
      <button class="bt fino" data-act="pc-editar" data-id="${id}">${sh ? 'Trocar ficha' : 'Conectar ficha'}</button>
      ${p.link ? `<button class="bt fino" data-act="pdm-ler" data-id="${id}">${ic('status:busca', 32)}Reler</button>` : ''}
      ${sh && p.vilao ? `<button class="bt fino" data-act="pdm-enc" data-id="${id}">+ Encontro</button>` : ''}
      ${sh ? `<button class="bt fino ${p.vilao ? 'ruim' : ''}" data-act="pdm-luta" data-id="${id}" data-ini="1">+ Luta (inimigo)</button><button class="bt fino" data-act="pdm-luta" data-id="${id}" data-ini="">+ Luta (aliado)</button>` : ''}
      ${sh ? `<button class="bt fino" data-act="pc-longo" data-id="${id}">${ic('cond2:descanso_longo', 32)}Desc. longo</button>` : ''}
    </div></article>`;
}
const mudarPdm = (id, fn, txt) => Store.set(s => { const p = s.party.find(x => x.id === id && x.pdm); if (p) fn(p, s); }, txt || null);
ACT['pdm-novo'] = () => { const id = uid(); Store.set(s => { s.party.push({ id, link: '', apelido: '', pdm: true, noGrupo: false, vilao: false }); }, null); ACT['pc-editar']({ dataset: { id } }); };
ACT['pdm-filtro'] = el => { pdmFiltro = el.dataset.k; App.render(); };
ACT['pdm-grupo'] = el => mudarPdm(el.dataset.id, p => { p.noGrupo = el.checked; }, `${nomePC(pcPorId(el.dataset.id))} ${el.checked ? 'entrou no' : 'saiu do'} Grupo`);
ACT['pdm-vilao'] = el => mudarPdm(el.dataset.id, (p, s) => { p.vilao = el.checked; if (!el.checked) s.encontro.itens = s.encontro.itens.filter(i => i.id !== 'pdm:' + p.id); }, null);
ACT['pdm-nd'] = el => mudarPdm(el.dataset.id, p => { p.nd = el.value || null; }, null);
ACT['pdm-nota'] = el => { const p = pcPorId(el.dataset.id); if (p) { p.nota = el.value; Store.save(); } };
ACT['pdm-ler'] = async el => { const p = pcPorId(el.dataset.id); if (!p) return; toast('Lendo a ficha…'); await Sync.um(p); const q = pcPorId(el.dataset.id); toast(q && q.sync && q.sync.estado !== 'erro' ? `Ficha de <b>${esc(nomePC(q))}</b> lida.` : 'Não deu: ' + esc((q && q.sync && q.sync.msg) || 'erro'), { tipo: q && q.sync && q.sync.estado !== 'erro' ? 'bom' : 'ruim' }); };
ACT['pdm-enc'] = el => { const id = 'pdm:' + el.dataset.id, p = pcPorId(el.dataset.id);
  Store.set(s => { if (!s.encontro.itens.some(i => i.id === id)) s.encontro.itens.push({ id, qtd: 1 }); }, null);
  toast(`<b>${esc(nomePC(p))}</b> no encontro${p.nd ? '' : ' (sem ND: não conta XP)'}.`); Som.tocar('clique'); };
ACT['pdm-luta'] = el => { const p = pcPorId(el.dataset.id), ini = !!el.dataset.ini; let novo = false;
  Store.set(s => { novo = pdmNaLuta(s, el.dataset.id, ini); }, `${nomePC(p)} na luta (${ini ? 'inimigo' : 'aliado'})`);
  toast(`<b>${esc(nomePC(p))}</b> ${novo ? 'entrou na luta' : 'já estava na luta: agora'} como ${ini ? 'inimigo' : 'aliado'}.`); Som.tocar('clique'); };
