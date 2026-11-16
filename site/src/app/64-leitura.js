/* ═══════════ leitura das regras: sumário fixo do lado, coluna estreita e separador entre blocos ═══════════
   A Colinha era um muro de texto em três colunas. Aqui ela vira um livro: índice à esquerda, regra à direita. */
const Leitura = {
  montar() {
    if (App.rota !== 'regras') return;
    const raiz = $('.regras'); if (!raiz || raiz.querySelector('.leit-idx')) return;
    const secs = [...raiz.querySelectorAll('.regra')];
    if (secs.length < 3) return;
    const itens = secs.map((s, i) => {
      const h = s.querySelector('h2'); if (!h) return null;
      const id = 'reg-' + i; s.id = id;
      const nome = (h.childNodes[0] && h.childNodes[0].textContent || h.textContent).trim();
      const pag = h.querySelector('small');
      return { id, nome, pag: pag ? pag.textContent.trim() : '' };
    }).filter(Boolean);
    const nav = document.createElement('nav');
    nav.className = 'leit-idx';
    nav.innerHTML = `<p class="leit-t">Nesta página</p><ul>${itens.map(i =>
      `<li><a href="#${i.id}" data-leit="${i.id}">${esc(i.nome)}${i.pag ? `<small>${esc(i.pag)}</small>` : ''}</a></li>`).join('')}</ul>`;
    raiz.insertBefore(nav, raiz.firstChild);
    this.espiar(raiz, itens);
  },

  /* marca no índice em que regra a pessoa está */
  espiar(raiz, itens) {
    if (!window.IntersectionObserver) return;
    const links = new Map(itens.map(i => [i.id, raiz.querySelector(`[data-leit="${i.id}"]`)]));
    const obs = new IntersectionObserver(ent => {
      ent.forEach(e => {
        const a = links.get(e.target.id); if (!a) return;
        if (e.isIntersecting) { links.forEach(l => l.classList.remove('on')); a.classList.add('on'); }
      });
    }, { rootMargin: '-80px 0px -70% 0px' });
    itens.forEach(i => { const el = raiz.querySelector('#' + i.id); if (el) obs.observe(el); });
    this.obs = obs;
  }
};
const _rendLeit = App.render;
App.render = function () { _rendLeit.call(this); try { Leitura.montar(); } catch (e) { /* o conteúdo continua lá, só sem índice */ } };
