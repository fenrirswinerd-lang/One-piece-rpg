/* ═══════════ mestre: o Controle salvo no banco, os jogadores online viram PCs, e o combate é publicado para a mesa ═══════════ */
const Sincronia = {
  ligado: false, timer: null, vivos: {}, ultCombate: '', ultIni: 0,
  async iniciar() {
    if (this.ligado) return this.puxar();
    this.ligado = true;
    try {
      const rem = await DB.ler('segredos/controle');
      if (rem && rem.s && (rem.em || 0) > (Store.s.salvoEm || 0)) { Store.s = Object.assign(estadoInicial(), JSON.parse(rem.s)); Store.save(true); Store.emit(); }
      else this.agendar();
    } catch (e) { this.erro(e, 'ler o controle salvo'); }
    Store.aoSalvar = () => this.agendar();
    Mesa.on(ch => { if (!souMestre()) return; if (ch === 'jogadores') this.puxar(); if (ch === 'rolagens') this.iniciativas(); });
    this.puxar();
  },
  erro(e, oque) { console.warn(e); if (!this.avisou) { this.avisou = true; toast(`Não consegui ${oque || 'salvar no banco'}: ${esc(e.code || e.message)}`, { tipo: 'ruim', tempo: 8000 }); setTimeout(() => { this.avisou = false; }, 30000); } },
  agendar() { clearTimeout(this.timer); this.timer = setTimeout(() => this.enviar(), 1200); },
  /* jogadores do banco → grupo do Controle (ficha, vida, foto) */
  puxar() {
    const s = Store.s; let mudou = false;
    (M.jogadores || []).forEach(j => {
      if (!j.uid || !j.estilo) return;
      let pc = s.party.find(p => p.uid === j.uid);
      if (!pc) { pc = { id: j.uid, uid: j.uid, link: j.link || '', apelido: j.personagem || j.nome }; s.party.push(pc); mudou = true; }
      const ficha = fichaDe(j);
      if (ficha && (!pc.sheet || (j.fichaEm || 0) > (pc.lidoEm || 0))) { pc.sheet = ficha; pc.lidoEm = j.fichaEm || Date.now(); pc.origem = 'jogador'; if (!pc.live) pc.live = vivoNovo(ficha); mudou = true; }
      if ((j.link || '') !== (pc.link || '')) { pc.link = j.link || ''; mudou = true; }
      const ap = j.personagem || j.nome; if (ap && pc.apelido !== ap) { pc.apelido = ap; mudou = true; }
      if (j.vivo && (j.vivoEm || 0) > (pc.liveEm || 0)) { pc.live = Object.assign(pc.live || {}, j.vivo); pc.liveEm = j.vivoEm; this.vivos[j.uid] = JSON.stringify(pc.live); mudou = true; }
      const foto = j.foto || null;
      if (pc.live && JSON.stringify(pc.live.retrato || null) !== JSON.stringify(foto)) { pc.live.retrato = foto; mudou = true; }
    });
    /* quem o mestre tirou da mesa sai do Grupo, do encontro e da luta (só quem o banco diz que saiu: nunca por lista vazia) */
    const fora = new Set((M.jogadoresTodos || []).filter(j => !jogAtivo(j)).map(j => j.uid));
    if (fora.size && s.party.some(p => p.uid && fora.has(p.uid))) {
      const ids = new Set(s.party.filter(p => p.uid && fora.has(p.uid)).map(p => p.id));
      s.party = s.party.filter(p => !ids.has(p.id)); s.combate.lista = s.combate.lista.filter(c => !ids.has(c.pcId)); mudou = true;
    }
    if (mudou) { Store.save(true); Store.emit(); this.agendar(); }
  },
  /* jogador rolou iniciativa pelo site: entra sozinho na ordem do combate */
  iniciativas() {
    const s = Store.s; if (!s.combate.lista.length) return;
    const novas = (M.rolagens || []).filter(r => r.tipo === 'iniciativa' && r.em > this.ultIni && Date.now() - r.em < 600000);
    if (!novas.length) return;
    this.ultIni = Math.max(...novas.map(r => r.em));
    Store.set(x => novas.forEach(r => {
      const pc = x.party.find(p => p.uid === r.uid); if (!pc) return;
      let item = x.combate.lista.find(c => c.pcId === pc.id);
      if (!item) { item = { id: uid(), pcId: pc.id, ini: null }; x.combate.lista.push(item); }
      item.ini = r.total;
    }), null, { semDesfazer: true });
    toast(novas.map(r => `${esc(r.nome)}: iniciativa <b>${r.total}</b>`).join(' · '));
  },
  async enviar() {
    if (!souMestre()) return;
    const s = Store.s;
    const copia = { ...s, party: s.party.map(p => ({ ...p, sheet: p.uid ? undefined : p.sheet, sync: undefined })), dados: (s.dados || []).slice(-30), diario: (s.diario || []).slice(-400),
      combate: { ...s.combate, log: (s.combate.log || []).slice(-150) } };
    let txt = JSON.stringify(copia);
    if (txt.length > 900000) { copia.diario = copia.diario.slice(-100); txt = JSON.stringify(copia); }
    try { await DB.gravar('segredos/controle', { s: txt, em: s.salvoEm || Date.now() }, false); } catch (e) { this.erro(e); }
    for (const p of s.party.filter(x => x.uid && x.live)) {
      const j = JSON.stringify(p.live);
      if (this.vivos[p.uid] === j) continue;
      this.vivos[p.uid] = j; p.liveEm = Date.now();
      DB.gravar('jogadores/' + p.uid, { vivo: limpo(p.live), vivoEm: p.liveEm }).catch(e => this.erro(e));
    }
    this.combate();
  },
  /* o que os jogadores veem do combate: ordem, de quem é a vez, PV dos jogadores e só o "estado" dos inimigos */
  combate() {
    const s = Store.s, c = s.combate;
    const pub = !c.ativo ? { ativo: false } : { ativo: true, rodada: c.rodada, vez: c.vez, lista: ordem(s).map(x => {
      if (x.pcId && x.inimigo) { const p = s.party.find(pp => pp.id === x.pcId) || {}, k = p.sheet ? calc(p) : { pv: 1, pvMax: 1 };
        return { tipo: 'npc', nome: p.sheet ? nomePC(p) : (p.apelido || 'Inimigo'), ini: x.ini ?? null, estado: estadoNPC(k.pv, k.pvMax), retrato: (p.live || {}).retrato || null, fora: k.pv <= 0, conds: [...nomesCond((p.live || {}).conds)] }; }
      if (x.pcId) {
        const p = s.party.find(pp => pp.id === x.pcId) || {}, L = p.live || {};
        return { tipo: 'pc', uid: p.uid || null, nome: p.sheet ? nomePC(p) : (p.apelido || 'Jogador'), ini: x.ini ?? null, pv: L.pv ?? null, pvMax: (p.sheet && p.sheet.pv && p.sheet.pv.max) || null,
          temp: L.temp || 0, conds: [...nomesCond(L.conds)], morto: !!L.morto, retrato: L.retrato || null };
      }
      return { tipo: 'npc', nome: x.nome, ini: x.ini ?? null, estado: estadoNPC(x.pv, x.pvMax), retrato: x.retrato || null, fora: !!x.derrotado || x.pv <= 0, conds: [...nomesCond(x.conds)] };
    }) };
    const j = JSON.stringify(pub); if (j === this.ultCombate) return;
    this.ultCombate = j;
    DB.gravar('mesa/combate', pub, false).catch(e => this.erro(e));
  }
};
