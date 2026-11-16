/* ═══════════ partida ═══════════ */
function quadro(nome, escala = 2, n = 0) {
  const a = (window.MANIFEST || {}).anims ? MANIFEST.anims[nome] : null; if (!a) return '';
  return `<i class="anim a-${nome}" aria-hidden="true" style="width:${a.fw * escala}px;height:${a.fh * escala}px;background-size:${a.fw * a.frames * escala}px ${a.fh * escala}px;background-position:-${n * a.fw * escala}px 0"></i>`;
}
function iniciar() {
  Store.load();
  aplicarTema();
  /* tela dos jogadores num segundo monitor (do Controle): continua funcionando para o mestre */
  if (location.hash === '#jogadores') {
    raiz().innerHTML = '<main id="tela" class="tela-jog"></main>';
    document.body.classList.add('modo-tela');
    Tela.render();
    window.addEventListener('storage', e => { if (e.key === KEY) { Store.load(); Tela.render(); } });
    setInterval(() => { Store.load(); Tela.render(); }, 4000);
    return;
  }
  Store.on(() => { if (!Mesa.aberta) return; App.render(); if (Bandeja.aberta) Bandeja.desenhar(); if ($('#tela-sobre')) Tela.render(); });
  Sessao.iniciar();
  /* o mestre lê as fichas pelo link de tempos em tempos (os jogadores também atualizam pela aba deles) */
  setInterval(() => { if (souMestre() && document.visibilityState === 'visible' && S().config.autoSync && !TESTE) Sync.todos(true); }, 300000);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
