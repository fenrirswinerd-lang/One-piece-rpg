/* ═══════════ NOVIDADES (patch notes para os jogadores) ═══════════
   O texto vem de src/novidades.md (o mesmo do UPDATE_LOG_JOGADORES.md), embutido pelo build em window.NOVIDADES.
   Cada navegador vê a faixa "Tem novidade" uma vez por versão; depois, só pelo menu da conta (botão Novidades).
   Guardado no próprio navegador (localStorage): não vai para o banco e não incomoda ninguém. */
const NOV_KEY = 'op-novidades-visto';
const novVisto = () => { try { return +(localStorage.getItem(NOV_KEY) || 0); } catch (e) { return 0; } };
const novMarca = v => { try { localStorage.setItem(NOV_KEY, String(v)); } catch (e) { /* janela privada: tudo bem, só aparece de novo */ } };
const NOV_TAGS = { novo: 'Novo', ajuste: 'Ajuste', corrigido: 'Corrigido', mestre: 'Mestre' };
function novInline(t) { return esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>'); }
/* "[novo] texto" vira etiqueta colorida + texto */
function novItem(t) { const m = t.match(/^\[(novo|ajuste|corrigido|mestre)\]\s*(.*)$/i); if (!m) return novInline(t); const k = m[1].toLowerCase(); return `<span class="nov-tag nov-${k}">${NOV_TAGS[k]}</span> ${novInline(m[2])}`; }
/* markdown simples: ## versão, **título**, - item, parágrafo */
function novVersoes() {
  const md = String(window.NOVIDADES || ''), V = []; let cur = null, lista = false;
  const fecha = () => { if (lista && cur) { cur.h += '</ul>'; lista = false; } };
  md.split(/\r?\n/).forEach(l => {
    const t = l.trim(), mv = t.match(/^##\s+(.+)$/);
    if (mv) { fecha(); const n = (mv[1].match(/\d+/) || [0])[0]; const [nm, ...sb] = mv[1].split(/\s*·\s*/); cur = { v: +n, nome: nm, sub: sb.join(' · '), h: '' }; V.push(cur); return; }
    if (!cur || /^#\s/.test(t) || t === '---') { fecha(); return; }
    if (!t) { fecha(); return; }
    if (/^- /.test(t)) { if (!lista) { cur.h += '<ul>'; lista = true; } cur.h += `<li>${novItem(t.slice(2))}</li>`; return; }
    if (/^>\s?/.test(t)) { fecha(); cur.h += `<p class="nov-dest">${novInline(t.replace(/^>\s?/, ''))}</p>`; return; }
    fecha(); const tit = t.match(/^\*\*(.+?)\*\*\s*(.*)$/);
    cur.h += tit ? `<h4>${esc(tit[1])}${tit[2] ? ` <small>${novInline(tit[2])}</small>` : ''}</h4>` : `<p>${novInline(t)}</p>`;
  });
  fecha(); return V.filter(x => x.v);
}
const novUltima = () => novVersoes().reduce((a, x) => Math.max(a, x.v), 0);
ACT['novidades'] = () => {
  const V = novVersoes(); if (!V.length) return toast('Ainda não tem novidade escrita.');
  const [u, ...velhas] = V; novMarca(Math.max(novVisto(), u.v)); novFaixaTira();
  Modal.abrir(`<h2>${ic('mar:luneta', 32)} Novidades da Mesa</h2>
    <div class="nov-cab"><span class="nov-v">v${u.v}</span><b>${esc(u.sub || u.nome)}</b></div>
    <div class="nov-txt">${u.h}</div>
    ${velhas.length ? `<details class="nov-velhas"><summary>Versões anteriores</summary>${velhas.map(x => `<div class="nov-cab vel"><span class="nov-v">v${x.v}</span><b>${esc(x.sub || x.nome)}</b></div><div class="nov-txt">${x.h}</div>`).join('')}</details>` : ''}
    <div class="modal-bts"><button class="bt bom" data-act="modal-fechar">Entendi</button></div>`, { classe: 'nov-modal', titulo: 'Novidades' });
};
function novFaixaTira() { const f = $('#nov-faixa'); if (f) f.remove(); }
ACT['nov-fechar'] = () => { novMarca(Math.max(novVisto(), novUltima())); novFaixaTira(); };
function novFaixa() {
  const u = novUltima(); if (!u || novVisto() >= u || $('#nov-faixa') || $('#tela-sessao')) return;
  const d = document.createElement('div'); d.id = 'nov-faixa'; d.className = 'nov-faixa'; d.setAttribute('role', 'status');
  d.innerHTML = `${ic('mar:luneta', 32)}<span>Tem novidade na Mesa <small>versão ${u}</small></span><button class="bt fino ouro" data-act="novidades">Ver</button><button class="bt-ic mini" data-act="nov-fechar" title="Fechar (dá para ver depois no menu da sua conta)" aria-label="Fechar">✕</button>`;
  document.body.appendChild(d);
}
Mesa.on(ch => { if (ch === 'estado' && Mesa.aberta) setTimeout(novFaixa, 1200); });
if (window.__expor) Object.assign(window, { novVersoes, novUltima, novVisto });
