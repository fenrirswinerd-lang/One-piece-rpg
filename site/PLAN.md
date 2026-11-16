# Controle do Mestre — site (obra-prima)

Pedido (Fenrir, 31/10): "me surpreenda em tudo", site do controle do mestre em pixel art pirata.

## Decisões
- Arquivo único `dist/Controle_do_Mestre.html` (abre no PC por duplo clique ou no Netlify Drop) + prévia como Artifact.
- Leitura das fichas 2.0: (a) link do Google via gviz JSONP por blocos de linha/coluna homogêneos (evita o "tipo da maioria vira null");
  (b) arquivo .xlsx via leitor próprio (unzip com DecompressionStream). No Artifact o link não funciona (CSP) → só .xlsx.
- Estado da sessão é do site (PV atual, PP, condições, exaustão). A ficha dá os números base; diferença de PV da ficha aparece como aviso.
- Sem framework: JS puro em módulos `src/app/*.js` concatenados pelo `build.py`; artes viram data URI.
- Arte: nada de personagens/símbolos de One Piece. Nomes do mundo só no texto.

## Estrutura
- art/process.py → assets/*.png + assets/manifest.json
- data/mi_parse.py → data/inimigos.json ; data/amy.py → data/demo_amy.json ; data/fields.json (mapa da ficha)
- src/style.css, src/template.html, src/app/*.js
- build.py → dist/

## Regras verificadas (páginas)
- Condições LJ 269–273; Doente 273; morte/PV negativos 293; exaustão e Sobrecarga 36–37; concentração 267;
  percepção passiva 263; iniciativa 284; caído 286; navegação GN 65–66 + LJ 156/317; clima GN 60/66;
  dano improvisado / alvos em área / turba GN 114–115; tesouro GN 82; XP GN 45–46, 126; XP por nível LJ 13.

## Status (31/10)
- Pronto: dist/Controle_do_Mestre.html (arquivo único, fontes embutidas, funciona sem internet exceto a leitura por link).
- Testes (Playwright, scratchpad t1–t10): todas as abas sem erro; desktop, celular 390 px, tema claro/escuro;
  leitura por link simulando o gviz (tipo da maioria + ids de coluna reais e relativos) = idêntica à leitura do .xlsx;
  regras de dano/morte/descanso/sobrecarga/condições por rodada conferidas.
- Falta: teste real com uma ficha pública no Google (só dá fora do sandbox).
