/* ═══════════ desenho seguro ═══════════
   Um campo que perde o foco dispara "change" enquanto a tela está sendo trocada, e isso pedia outro desenho no meio do primeiro
   (o navegador reclamava no console). Agora o segundo pedido espera o primeiro acabar e desenha de novo. */
const _renderSeguro = App.render;
App.render = function (...a) {
  if (App._desenhando) { App._deNovo = true; return; }
  App._desenhando = true;
  try { return _renderSeguro.apply(this, a); }
  finally { App._desenhando = false; if (App._deNovo) { App._deNovo = false; App.render(); } }
};
