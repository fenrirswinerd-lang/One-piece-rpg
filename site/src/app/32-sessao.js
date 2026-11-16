/* ═══════════ quem está usando: login, papel (mestre ou jogador), lista de liberados, estilo do jogador ═══════════ */
const Eu = { uid: null, email: '', nome: '', foto: '', mestre: false, papel: null, membro: false, estilo: 'logpose' };
const ESTILOS = {
  timao: { nome: 'Timão', sub: 'manual', icone: 'modos:timao',
    muda: ['Você rola e soma os modificadores. A ficha fica só de consulta.', 'Sem avisos automáticos, a não ser o que é muito complicado (0 PV, morte, Sobrecarga).', 'Inventário e diário livres, do seu jeito.'] },
  logpose: { nome: 'Log Pose', sub: 'padrão', icone: 'modos:logpose',
    muda: ['Botões de teste já com o modificador da ficha. Você vê a conta e decide.', 'Avisos só do importante: PV baixo, sem PP, peso demais.', 'Usar técnica e gastar Beli pedem sua confirmação.'] },
  engrenagem: { nome: 'Engrenagem', sub: 'automático', icone: 'modos:engrenagem',
    muda: ['Tudo do Log Pose, mais vantagem e desvantagem das condições aplicadas sozinhas.', 'Usar técnica desconta PP e comprar desconta Beli na hora.', 'Lembretes de condição, peso e descanso aparecem sem você pedir.'] }
};
const TESTE_PESSOAS = [
  { uid: 'mestre-teste', email: MESTRE_EMAIL, nome: 'Mestre (Fenrir)' },
  { uid: 'ana-teste', email: 'ana@teste.com', nome: 'Ana', sub: 'navegadora · Log Pose' },
  { uid: 'bia-teste', email: 'bia@teste.com', nome: 'Bia', sub: 'cozinheira · Engrenagem' },
  { uid: 'caio-teste', email: 'caio@teste.com', nome: 'Caio', sub: 'ferreiro · Timão' },
  { uid: 'duda-teste', email: 'duda@teste.com', nome: 'Duda', sub: 'carpinteira · Engrenagem' },
  { uid: 'visitante-teste', email: 'visitante@teste.com', nome: 'Visitante (não liberado)' }
];
const lembrar = (k, v) => { try { if (v === undefined) return localStorage.getItem('mesa-' + k); localStorage.setItem('mesa-' + k, v); } catch (e) { return null; } return v; };

const Sessao = {
  iniciar() {
    try { if (!TESTE) Fire.iniciar(); else Local.iniciar(); }
    catch (e) { console.error(e); Local.iniciar(); window.__falhaFirebase = e.message; }
    this.tela('carregando');
    DB.aoMudarLogin(u => this.aoLogin(u));
  },
  async aoLogin(u) {
    Mesa.parar();
    if (!u) { Object.assign(Eu, { uid: null, email: '', mestre: false, papel: null, membro: false }); return this.tela('login'); }
    Object.assign(Eu, { uid: u.uid, email: u.email, nome: u.nome, foto: u.foto, mestre: u.email === MESTRE_EMAIL });
    this.tela('carregando');
    let membros = null;
    try { membros = await DB.ler('config/membros'); }
    catch (e) { return this.tela('erro', 'Não consegui ler a lista de jogadores. Confira se as regras do banco foram publicadas. (' + esc(e.code || e.message) + ')'); }
    if (TESTE && !membros) { membros = { emails: ['ana@teste.com', 'bia@teste.com', 'caio@teste.com', 'duda@teste.com'] }; await DB.gravar('config/membros', membros); }
    if (Eu.mestre && !membros) { membros = { emails: [] }; try { await DB.gravar('config/membros', membros); } catch (e) { /* mostra depois */ } }
    Eu.membro = Eu.mestre || ((membros && membros.emails) || []).map(x => String(x).toLowerCase()).includes(Eu.email);
    const ultimo = lembrar('papel-' + Eu.uid);
    if (ultimo === 'mestre' && Eu.mestre) return this.escolher('mestre');
    if (ultimo === 'jogador' && Eu.membro) return this.escolher('jogador');
    this.tela('papel');
  },
  async escolher(papel) {
    if (papel === 'mestre' && !Eu.mestre) return toast('Só o e-mail do mestre abre essa área.', { tipo: 'ruim' });
    if (papel === 'jogador' && !Eu.membro) return this.tela('papel');
    Eu.papel = papel; lembrar('papel-' + Eu.uid, papel);
    if (papel === 'jogador') {
      let j = null; try { j = await DB.ler('jogadores/' + Eu.uid); } catch (e) { return this.tela('erro', 'Não consegui abrir sua ficha no banco (' + esc(e.code || e.message) + ').'); }
      if (TESTE && (!j || !j.estilo)) j = (await prepararTeste(Eu.uid)) || j;
      if (!j || !j.estilo) return this.tela('estilo');
      Eu.estilo = j.estilo;
    }
    Mesa.abrir();
  },
  tela(qual, msg) {
    document.body.className = 'fora';
    const r = raiz(), fundo = `<div class="fora-fundo c-t_login" aria-hidden="true"></div>`;
    const caixa = h => `${fundo}<main class="fora-caixa" id="vista">${h}</main><div id="toasts" class="toasts" aria-live="polite"></div>`;
    const marca = `<div class="fora-marca">${anim('bandeira', 1.2)}<div><h1>Mesa One Piece</h1><p>Grand Line · RPG da nossa tripulação</p></div></div>`;
    if (qual === 'carregando') r.innerHTML = caixa(`${marca}<p class="fora-txt">${anim('navio', 1.4)} Içando as velas…</p>`);
    if (qual === 'erro') r.innerHTML = caixa(`${marca}<p class="fora-txt ruim">${msg}</p><div class="fora-bts"><button class="bt" data-act="s-recarregar">Tentar de novo</button><button class="bt fino" data-act="s-sair">Sair</button></div>`);
    if (qual === 'login') r.innerHTML = caixa(`${marca}
      <p class="fora-txt">Entre com sua conta Google para ir para a mesa.</p>
      <button class="bt grande google" data-act="s-entrar">${ic('mesa:chave', 32)} Entrar com Google</button>
      ${TESTE ? `<p class="fora-aviso">${ic('modos:selo', 32)}<span><b>Modo de teste.</b> Nada vai para a internet: fica só neste navegador. Cada aba pode ser uma pessoa diferente, então abra uma aba como mestre e outra como jogador.${window.__falhaFirebase ? ' (Firebase: ' + esc(window.__falhaFirebase) + ')' : ''}</span></p>` : ''}`);
    if (qual === 'papel') r.innerHTML = caixa(`${marca}
      <p class="fora-txt">Olá, <b>${esc(Eu.nome)}</b>. Como você entra hoje?</p>
      <div class="papeis">
        <button class="papel ${Eu.membro ? '' : 'trancado'}" data-act="s-papel" data-p="jogador">${anim('navio', 1.6)}<b>Jogador</b><span>${Eu.membro ? 'Sua ficha, seu inventário, seu diário e a mesa ao vivo.' : 'Seu e-mail ainda não foi liberado pelo mestre.'}</span></button>
        <button class="papel ${Eu.mestre ? '' : 'trancado'}" data-act="s-papel" data-p="mestre">${ic('modos:capitao', 96)}<b>Mestre</b><span>${Eu.mestre ? 'Controle, escudo, mundo, músicas e tudo que é segredo.' : 'Só o e-mail do mestre entra aqui.'}</span></button>
      </div>
      ${!Eu.membro ? `<p class="fora-aviso">${ic('mesa:cadeado', 32)}<span>Peça ao mestre para liberar este e-mail: <b class="copiar" data-act="s-copiar" data-t="${esc(Eu.email)}">${esc(Eu.email)}</b>. Depois toque em <button class="link" data-act="s-recarregar">tentar de novo</button>.</span></p>` : ''}
      <p class="fora-rodape">Entrou como ${esc(Eu.email)} · <button class="link" data-act="s-sair">trocar de conta</button></p>`);
    if (qual === 'estilo') r.innerHTML = caixa(`${marca}
      <h2 class="fora-tit">Escolha seu estilo de jogo</h2><p class="fora-txt">Dá para trocar depois, na sua aba.</p>
      <div class="estilos">${Object.entries(ESTILOS).map(([k, e]) => `<button class="estilo-c ${k === 'logpose' ? 'on' : ''}" data-act="s-estilo" data-e="${k}">
        ${ic(e.icone, 96)}<b>${e.nome}</b><small>${e.sub}</small><ul>${e.muda.map(m => `<li>${m}</li>`).join('')}</ul></button>`).join('')}</div>`);
  }
};

ACT['s-entrar'] = async () => {
  if (!TESTE) { try { await DB.entrar(); } catch (e) { toast('Não deu para entrar: ' + esc(e.code || e.message), { tipo: 'ruim', tempo: 8000 }); } return; }
  Modal.abrir(`<h2>Modo de teste: quem é você?</h2><p class="nota">Cada aba guarda uma pessoa. Use uma aba para o mestre e outras para os jogadores.</p>
    <div class="teste-pessoas">${TESTE_PESSOAS.map((p, i) => `<button class="bt" data-act="s-teste" data-i="${i}">${p.uid === 'mestre-teste' ? ic('modos:capitao', 32) : ic('mesa:npc', 32)}${esc(p.nome)}${p.sub ? `<small>${p.sub}</small>` : ''}</button>`).join('')}</div>
    <p class="nota">Os jogadores de teste já entram com ficha, profissão e estilo, para você ver as abas de profissão.</p>`);
};
ACT['s-teste'] = el => { Modal.fechar(); DB.entrar(TESTE_PESSOAS[+el.dataset.i]); };
ACT['s-sair'] = () => { Mesa.parar(); try { localStorage.removeItem('mesa-papel-' + Eu.uid); } catch (e) { /* nada */ } DB.sair(); };
ACT['s-recarregar'] = () => location.reload();
ACT['s-papel'] = el => Sessao.escolher(el.dataset.p);
ACT['s-copiar'] = el => { try { navigator.clipboard.writeText(el.dataset.t).then(() => toast('E-mail copiado.')); } catch (e) { /* sem área de transferência */ } };
ACT['s-estilo'] = async el => {
  const k = el.dataset.e;
  try {
    await DB.gravar('jogadores/' + Eu.uid, { uid: Eu.uid, email: Eu.email, nome: Eu.nome, fotoGoogle: Eu.foto || '', estilo: k, criado: Date.now(), visto: Date.now() });
  } catch (e) { return toast('Não deu para salvar: ' + esc(e.code || e.message), { tipo: 'ruim' }); }
  if (Eu.mestre) { try { const m = await DB.ler('config/membros'); if (m && (m.fora || []).includes(Eu.uid)) await DB.gravar('config/membros', { fora: m.fora.filter(x => x !== Eu.uid) }); } catch (e) { /* segue */ } }   // o mestre voltou a entrar como jogador
  Eu.estilo = k; Som.tocar('moeda'); Mesa.abrir();
  setTimeout(() => toast(`Estilo ${ESTILOS[k].nome}. Agora cole o link da sua ficha na aba Personagem.`, { tempo: 7000 }), 600);
};
