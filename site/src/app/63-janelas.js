/* ═══════════ janelas da mesa: arrastar, redimensionar e guardar o jeito de cada um ═══════════
   No PC a mesa vira uma bancada livre: cada painel é uma janela com alça em cima e canto para esticar.
   Em tela estreita nada disso liga, porque empilhado é melhor no celular. */
const JANELAS = ['quadro', 'rolar', 'hist', 'ilhas', 'cap', 'som', 'mestre'];
const JAN_NOME = { quadro: 'Quadro', rolar: 'Rolar dados', hist: 'Histórico', ilhas: 'Ilhas', cap: 'Comando do navio', som: 'Música', mestre: 'Painel do mestre' };
const Janelas = {
  min: { w: 230, h: 130 },
  largura: 1100,          // abaixo disso a mesa continua empilhada
  ligado: false,
  lay: {}, de: null,
  /* cada pessoa tem o seu layout: no modo de teste são várias abas no mesmo navegador */
  chave() { return 'mt-janelas-' + (Eu.uid || 'anon'); },
  carregar() {
    if (this.de === Eu.uid) return;
    this.de = Eu.uid;
    try { this.lay = JSON.parse(lembrar(this.chave()) || '{}') || {}; } catch (e) { this.lay = {}; }
  },
  guardar() { try { lembrar(this.chave(), JSON.stringify(this.lay)); } catch (e) { /* sem espaço: só não guarda */ } },
  chaveTrava() { return 'mt-travado-' + (Eu.uid || 'anon'); },
  travado() { return lembrar(this.chaveTrava()) === '1'; },
  aplicarTrava() { document.body.classList.toggle('jan-travado', this.travado()); },
  trocarTrava() {
    const novo = !this.travado();
    lembrar(this.chaveTrava(), novo ? '1' : '0');
    this.aplicarTrava();
    toast(novo ? 'Janelas travadas. As alças sumiram.' : 'Janelas soltas. Arraste pela alça de cima.');
    if ($('#mt-trava')) TelaMesa.quadro();
  },

  elementos() {
    return JANELAS.map(k => ({ k, el: $('#mt-' + k) })).filter(x => x.el);
  },

  ativar() {
    const mt = $('.mt'); if (!mt) return;
    /* duas montagens seguidas no mesmo quadro chamavam isto duas vezes: a segunda criava janelas vazias por cima */
    if (mt.querySelector('#mt-livre')) return;
    this.carregar();
    if (window.innerWidth < this.largura) { this.desligar(mt); return; }
    const livre = document.createElement('div');
    livre.className = 'mt-livre'; livre.id = 'mt-livre';
    const caixa = mt.getBoundingClientRect();
    const medidas = this.elementos().map(({ k, el }) => {
      const r = el.getBoundingClientRect();
      // altura padrão: o que a grade dava, ou o tamanho do conteúdo, o que for maior — senão a janela já nasce cortada
      const h = k === 'quadro' ? Math.round(r.height) : Math.max(Math.round(r.height), el.scrollHeight + 18);
      return { k, el, x: Math.round(r.left - caixa.left), y: Math.round(r.top - caixa.top), w: Math.round(r.width), h };
    });
    if (!medidas.length) return;
    /* para desmontar depois (quando a janela do navegador muda de largura): quem era filho de quem, na ordem */
    this.casa = new Map(); medidas.forEach(m => { const pai = m.el.parentNode; if (!this.casa.has(pai)) this.casa.set(pai, [...pai.children]); });
    this.larg = window.innerWidth;
    mt.appendChild(livre);
    mt.classList.add('livre');
    let fundo = 0;
    medidas.forEach(m => {
      const s = this.lay[m.k] || {};
      /* o que a pessoa arrumou vale para a largura em que arrumou: em outra largura, encolhe ou estica junto e nunca sai da tela */
      const f = s.cw && caixa.width ? caixa.width / s.cw : 1;
      const w = Math.min(Math.max(this.min.w, Math.round((s.w || m.w) * (s.w ? f : 1))), Math.max(this.min.w, Math.round(caixa.width))), h = Math.max(this.min.h, s.h || m.h);
      const x = Math.max(0, Math.min(s.x != null ? Math.round(s.x * f) : m.x, Math.max(0, Math.round(caixa.width) - w)));
      const y = Math.max(0, s.y ?? m.y);
      /* a janela é uma moldura POR FORA do painel: o painel se redesenha sozinho sem perder as alças */
      const jan = document.createElement('div');
      jan.className = 'jan'; jan.dataset.jan = m.k; jan.id = 'jan-' + m.k; jan.dataset.by = m.y;
      jan.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px`;
      if (s.min) jan.classList.add('minimizada');
      jan.innerHTML = `<span class="jan-alca" data-jan-arrasta="${m.k}" title="Arraste para mover"><b>${JAN_NOME[m.k] || ''}</b>`
        + `<button class="jan-min" data-act="jan-min" data-k="${m.k}" title="${s.min ? 'Abrir' : 'Minimizar'}">${s.min ? '▢' : '–'}</button></span>`
        + `<span class="jan-canto" data-jan-estica="${m.k}" title="Arraste para mudar o tamanho"></span>`;
      livre.appendChild(jan);
      m.el.classList.add('jan-dentro');
      jan.appendChild(m.el);
      fundo = Math.max(fundo, y + h);
    });
    livre.style.height = (fundo + 28) + 'px';
    this.aplicarTrava();
    this.ligado = true;
    /* o conteúdo dos painéis muda depois (abas do mestre, rolagens, música): a janela acompanha */
    if (this.obs) this.obs.disconnect();
    let pend = 0;
    this.obs = new MutationObserver(() => { if (pend) return; pend = requestAnimationFrame(() => { pend = 0; Janelas.acompanhar(); }); });
    this.obs.observe(livre, { childList: true, subtree: true });
    requestAnimationFrame(() => Janelas.acompanhar());
    if (!this._ouvindo) { this._ouvindo = true; this.ouvir(); }
  },

  desligar(mt) {
    this.ligado = false;
    if (mt) mt.classList.remove('livre');
  },

  /* tira as molduras e devolve cada painel ao lugar de origem na grade */
  desmontar() {
    const mt = $('.mt'), livre = $('#mt-livre'); if (!mt || !livre) return;
    if (this.obs) this.obs.disconnect();
    (this.casa || new Map()).forEach((filhos, pai) => filhos.forEach(el => { el.classList.remove('jan-dentro'); pai.appendChild(el); }));
    livre.remove(); this.desligar(mt);
  },
  /* a janela do navegador mudou de largura: mede a grade de novo e monta tudo outra vez, cabendo na tela */
  refazer() {
    if (App.rota !== 'mesa' || !$('.mt')) return;
    if (typeof Roda !== 'undefined' && Roda.palco) { clearTimeout(this._tr); this._tr = setTimeout(() => Janelas.refazer(), 600); return; }   // no palco o quadro está em tela cheia: espera sair
    this.desmontar(); this.ativar();
  },

  /* arrastar e esticar com o ponteiro: funciona no mouse e no toque */
  ouvir() {
    let modo = null, alvo = null, chave = '', ix = 0, iy = 0, base = null, limite = null;
    const comeca = e => {
      if (Janelas.travado() || e.target.closest('button')) return;
      const a = e.target.closest('[data-jan-arrasta]'), r = e.target.closest('[data-jan-estica]');
      if (!a && !r) return;
      modo = a ? 'mover' : 'esticar';
      chave = (a || r).dataset.janArrasta || (a || r).dataset.janEstica;
      alvo = $('#jan-' + chave); if (!alvo) { modo = null; return; }
      const livre = $('#mt-livre'); limite = livre ? livre.getBoundingClientRect() : null;
      base = { x: alvo.offsetLeft, y: alvo.offsetTop, w: alvo.offsetWidth, h: alvo.offsetHeight };
      ix = e.clientX; iy = e.clientY;
      alvo.classList.add('mexendo');
      document.body.classList.add('jan-mexendo');
      e.preventDefault();
    };
    const move = e => {
      if (!modo || !alvo) return;
      const dx = e.clientX - ix, dy = e.clientY - iy;
      if (modo === 'mover') {
        const maxX = limite ? Math.max(0, limite.width - base.w) : 1e4;
        alvo.style.left = Math.max(0, Math.min(base.x + dx, maxX)) + 'px';
        alvo.style.top = Math.max(0, base.y + dy) + 'px';
      } else {
        const maxW = limite ? Math.max(Janelas.min.w, limite.width - base.x) : 1e4;
        alvo.style.width = Math.max(Janelas.min.w, Math.min(base.w + dx, maxW)) + 'px';
        alvo.style.height = Math.max(Janelas.min.h, base.h + dy) + 'px';
      }
    };
    const solta = () => {
      if (!modo || !alvo) return;
      const ant = Janelas.lay[chave] || {};
      Janelas.lay[chave] = { x: alvo.offsetLeft, y: alvo.offsetTop, w: alvo.offsetWidth, h: alvo.classList.contains('minimizada') ? (ant.h || alvo.offsetHeight) : alvo.offsetHeight, min: !!ant.min, manual: modo === 'esticar' || !!ant.manual, cw: limite ? Math.round(limite.width) : 0 };
      Janelas.guardar();
      alvo.classList.remove('mexendo'); document.body.classList.remove('jan-mexendo');
      Janelas.acompanhar();
      modo = null; alvo = null;
    };
    document.addEventListener('pointerdown', comeca);
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', solta);
    document.addEventListener('pointercancel', solta);
    /* abrir e fechar um <details> não muda os filhos: avisa a janela para acompanhar */
    document.addEventListener('toggle', e => { if (e.target && e.target.closest && e.target.closest('#mt-livre')) requestAnimationFrame(() => Janelas.acompanhar()); }, true);
    let tr = 0; window.addEventListener('resize', () => { if (window.innerWidth === Janelas.larg) return; clearTimeout(tr); tr = setTimeout(() => { if (window.innerWidth !== Janelas.larg) { Janelas.larg = window.innerWidth; Janelas.refazer(); } }, 180); });
  },

  /* Janela que a pessoa não esticou com a mão fica do tamanho do conteúdo: cresce e encolhe junto, até um teto (daí em diante rola por dentro).
     Antes só crescia: abrir uma aba alta do Painel do mestre ou rolar vários dados deixava a janela enorme para sempre.
     As janelas que a pessoa não arrastou se arrumam em volta, para ninguém ficar por baixo de ninguém. */
  teto(k) { const t = Math.max(260, window.innerHeight - 150); return k === 'hist' ? Math.min(t, 300) : t; },
  acompanhar() {
    const livre = $('#mt-livre'); if (!livre || window.innerWidth < this.largura) return;
    const jans = [...livre.querySelectorAll(':scope > .jan')];
    const pt = parseFloat(getComputedStyle(jans[0] || livre).paddingTop), topo = isNaN(pt) ? 20 : pt;
    jans.forEach(jan => {
      const k = jan.dataset.jan, L = this.lay[k] || {};
      if (k === 'quadro' || L.manual || jan.classList.contains('minimizada') || jan.classList.contains('mexendo')) return;
      const dentro = jan.querySelector('.jan-dentro'); if (!dentro || dentro.hidden) return;
      // a altura que o conteúdo pede: solta a altura por um instante e mede (scrollHeight não serve para encolher, porque nunca é menor que a caixa)
      const rolado = dentro.scrollTop; dentro.style.height = 'auto'; const nat = dentro.offsetHeight; dentro.style.height = ''; if (rolado) dentro.scrollTop = rolado;
      const precisa = Math.round(Math.min(this.teto(k), Math.max(this.min.h, topo + nat))), tem = jan.offsetHeight;
      if (Math.abs(precisa - tem) > 1) jan.style.height = precisa + 'px';
    });
    /* de cima para baixo: quem a pessoa não arrastou volta ao lugar de origem e desce só o que precisar */
    const caixa = j => ({ x1: j.offsetLeft, x2: j.offsetLeft + j.offsetWidth, y1: j.offsetTop, y2: j.offsetTop + j.offsetHeight });
    const solta = j => (this.lay[j.dataset.jan] || {}).y == null && !j.classList.contains('mexendo');
    const ordem = j => solta(j) ? (+j.dataset.by || 0) : j.offsetTop;
    const feitas = [];
    jans.sort((a, b) => ordem(a) - ordem(b) || a.offsetLeft - b.offsetLeft).forEach(j => {
      if (solta(j)) {
        j.style.top = (+j.dataset.by || 0) + 'px';
        for (let volta = 0; volta < 12; volta++) {
          const c = caixa(j), bate = feitas.map(caixa).filter(o => o.x1 < c.x2 && o.x2 > c.x1 && o.y1 < c.y2 && o.y2 > c.y1);
          if (!bate.length) break;
          j.style.top = (Math.max(...bate.map(o => o.y2)) + 8) + 'px';
        }
      }
      feitas.push(j);
    });
    this.crescer();
  },

  crescer() {
    const livre = $('#mt-livre'); if (!livre) return;
    let fundo = 0;
    [...livre.children].forEach(el => { fundo = Math.max(fundo, el.offsetTop + el.offsetHeight); });
    livre.style.height = (fundo + 28) + 'px';
  },

  padrao() {
    this.lay = {}; this.guardar();
    toast('Janelas de volta ao lugar de origem.');
    App.render();
  }
};
window.Janelas = Janelas;

/* liga depois que a tela da mesa termina de montar */
const _mesaDepois = VIEWS.mesa.depois;
VIEWS.mesa.depois = function () {
  if (_mesaDepois) _mesaDepois.call(this);
  requestAnimationFrame(() => { try { Janelas.ativar(); } catch (e) { /* se der errado, a mesa continua empilhada */ } });
};

/* o menu ☰ ganha a opção de desfazer a bagunça */
const _org = ACT['mt-organizar'];
ACT['mt-organizar'] = function (el, ev) {
  const r = _org ? _org.call(this, el, ev) : undefined;
  setTimeout(() => {
    const m = document.querySelector('.modal .org-l, .modal'); if (!m || m.querySelector('[data-act="jan-padrao"]')) return;
    m.insertAdjacentHTML('beforeend',
      `<p class="nota">No computador dá para arrastar cada janela pela alça de cima e mudar o tamanho pelo canto de baixo. O jeito que você deixar fica salvo só para você.</p>
       <div class="linha-bts"><button class="bt fino" data-act="jan-trava">${Janelas.travado() ? 'Soltar as janelas' : 'Travar as janelas (esconde as alças)'}</button>
       <button class="bt fino" data-act="jan-padrao">Voltar as janelas ao lugar de origem</button></div>`);
  }, 30);
  return r;
};
ACT['jan-padrao'] = () => { Modal.fechar(); Janelas.padrao(); };
ACT['jan-trava'] = () => Janelas.trocarTrava();
/* minimizar: a janela vira só a barra com o nome, e o resto da mesa continua no lugar */
ACT['jan-min'] = el => {
  const k = el.dataset.k, jan = $('#jan-' + k); if (!jan) return;
  const L = Janelas.lay[k] || { x: jan.offsetLeft, y: jan.offsetTop, w: jan.offsetWidth, h: jan.offsetHeight };
  L.min = !L.min;
  if (L.min) { L.h = jan.offsetHeight; jan.classList.add('minimizada'); jan.style.height = ''; }
  else { jan.classList.remove('minimizada'); jan.style.height = (L.h || 200) + 'px'; }
  Janelas.lay[k] = L; Janelas.guardar(); Janelas.acompanhar();
  el.textContent = L.min ? '▢' : '–'; el.title = L.min ? 'Abrir' : 'Minimizar';
};
