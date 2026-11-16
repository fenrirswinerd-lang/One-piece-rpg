"""Monta a Mesa One Piece.

1) dist/site/  -> pasta para a Netlify (index.html + estilo.css + app.js + dados.js + fb.js + config.js + assets/)
2) dist/previa.html -> corpo para o Artifact (tudo embutido, só modo de teste)
"""
import base64, hashlib, json, pathlib, re, shutil

R = pathlib.Path(__file__).parent
A, D, SRC, OUT = R / 'assets', R / 'data', R / 'src', R / 'dist'
SITE = OUT / 'site'
FB = pathlib.Path('/home/claude/mesa/fb/fb.js')
CONFIG = pathlib.Path('/home/claude/mesa/firebase-config.js')
DADOFIS = pathlib.Path('/home/claude/mesa/dadofis/dadofis.js')  # motor do dado com física (three + cannon-es, MIT), gerado por esbuild
if SITE.exists():
    shutil.rmtree(SITE)
(SITE / 'assets').mkdir(parents=True)
(SITE / 'fonts').mkdir()

def h(b):
    return hashlib.sha1(b).hexdigest()[:8]

def uri(p):
    return f'data:image/webp;base64,' + base64.b64encode(p.read_bytes()).decode()

def js(o):  # JSON seguro dentro de <script>
    return json.dumps(o, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')

manifest = json.loads((A / 'manifest.json').read_text())
webps = sorted(A.glob('*.webp'))
usados = set()
for grupo in ('icons', 'anims', 'images', 'tex', 'ui', 'tiras'):
    for v in manifest[grupo].values():
        if 'files' in v:
            usados.update(v['files'].values())
        else:
            usados.add(v['file'])
webps = [p for p in webps if p.name in usados or p.name.startswith('tex_')]

# endereços: arquivo separado na Netlify (com versão) ou embutido na prévia
url_site = {}
for p in webps:
    b = p.read_bytes()
    shutil.copy(p, SITE / 'assets' / p.name)
    url_site[p.name] = f'assets/{p.name}?v={h(b)}'
url_prev = {p.name: uri(p) for p in webps}

# modelos para baixar (ficha de PdN em branco) — só no site publicado
(SITE / 'modelos').mkdir(exist_ok=True)
for p in (pathlib.Path(__file__).parent / 'modelos').glob('*.xlsx'):
    shutil.copy(p, SITE / 'modelos' / p.name)

FONTES = [  # (família, arquivo, peso, estilo) — todas SIL OFL
    ('Jersey 20', 'jersey-20-latin-400-normal.woff2', '400', 'normal'),
    ('Silkscreen', 'silkscreen-latin-400-normal.woff2', '400', 'normal'),
    ('Silkscreen', 'silkscreen-latin-700-normal.woff2', '700', 'normal'),
    ('Beli Pixel', 'beli-pixel.woff2', '400', 'normal'),
    ('Jersey 10', 'jersey-10-latin-400-normal.woff2', '400', 'normal'),
    ('Pixelify Sans', 'pixelify-sans-latin-wght-normal.woff2', '400 700', 'normal'),
    ('Atkinson Hyperlegible', 'atkinson-hyperlegible-latin-400-normal.woff2', '400', 'normal'),
    ('Atkinson Hyperlegible', 'atkinson-hyperlegible-latin-400-italic.woff2', '400', 'italic'),
    ('Atkinson Hyperlegible', 'atkinson-hyperlegible-latin-700-normal.woff2', '700', 'normal'),
    ('Atkinson Hyperlegible', 'atkinson-hyperlegible-latin-700-italic.woff2', '700', 'italic'),
]
def fontes(embutir):
    out = ''
    for fam, arq, peso, estilo in FONTES:
        b = (A / 'fonts' / arq).read_bytes()
        if embutir:
            src = 'data:font/woff2;base64,' + base64.b64encode(b).decode()
        else:
            shutil.copy(A / 'fonts' / arq, SITE / 'fonts' / arq)
            src = f'fonts/{arq}?v={h(b)}'
        out += f"@font-face{{font-family:'{fam}';src:url({src}) format('woff2');font-weight:{peso};font-style:{estilo};font-display:swap}}\n"
    return out

def css(embutir):
    c = fontes(embutir) + (SRC / 'style.css').read_text() + '\n' + (SRC / 'mesa.css').read_text()
    for nome in ('madeira', 'pergaminho', 'mar'):
        f = f'tex_{nome}.webp'
        c = c.replace(f'__TEX_{nome.upper()}__', '"' + (url_prev[f] if embutir else url_site[f].replace('assets/', '')) + '"')
    assert '__TEX_' not in c
    return c

def dados(assets):
    return '\n'.join([
        'window.ASSETS=' + js(assets) + ';',
        'window.MANIFEST=' + js(manifest) + ';',
        'window.MONS=' + js(json.loads((D / 'inimigos.json').read_text())) + ';',
        'window.DEMO=' + js(json.loads((D / 'demo_amy.json').read_text())) + ';',
        'window.BLOCKS=' + js(json.loads((D / 'blocks.json').read_text())) + ';',
        'window.ESCUDO=' + js(json.loads((D / 'escudo.json').read_text())) + ';',
        'window.PROFS=' + js(json.loads((D / 'profissoes.json').read_text())) + ';',
        'window.TABGN=' + js(json.loads((D / 'tabelas_gn.json').read_text())) + ';',
        'window.LORE=' + js(json.loads((D / 'lore_notion.json').read_text())) + ';',
        'window.GLOSS=' + js(json.loads((D / 'glossario.json').read_text())) + ';',
        'window.NOVIDADES=' + js((SRC / 'novidades.md').read_text()) + ';',   # o mesmo texto do UPDATE_LOG_JOGADORES.md
    ])

def catalogo():  # frutas, estilos exclusivos e espécie nova: arquivo à parte, carregado só quando alguém abre o Catálogo
    return 'window.CATALOGO=' + js({'frutas': json.loads((D / 'frutas.json').read_text()), 'extra': json.loads((D / 'catalogo_extra.json').read_text())}) + ';'

def livro():  # texto dos livros para a busca do Pergunte ao livro: arquivo à parte, baixado só na primeira pergunta
    return 'window.LIVRO=' + js(json.loads((D / 'livro_texto.json').read_text())) + ';'

partes = []
for p in sorted((SRC / 'app').glob('*.js')):
    partes.append(f'/* ── {p.name} ── */\n' + p.read_text())
app = '(() => {\n' + '\n'.join(partes) + '\n})();'

# ───── 1) pasta da Netlify ─────
css_site = css(False)
# no site, as texturas ficam em assets/ e o CSS fica na raiz: corrige o caminho
css_site = re.sub(r'url\("(tex_[a-z]+\.webp\?v=[0-9a-f]+)"\)', r'url("assets/\1")', css_site)
arquivos = {
    'estilo.css': css_site.encode(),
    'dados.js': dados(url_site).encode(),
    'app.js': app.encode(),
    'fb.js': FB.read_bytes(),
    'config.js': CONFIG.read_bytes(),
    'catalogo.js': catalogo().encode(),
    'livro.js': livro().encode(),
    'dadofis.js': DADOFIS.read_bytes(),
}
for nome, b in arquivos.items():
    (SITE / nome).write_bytes(b)
v = {n: h(b) for n, b in arquivos.items()}
tpl = (SRC / 'template.html').read_text()
index = f'''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#3a2414">
<title>Mesa One Piece</title>
<meta name="description" content="Mesa online da nossa campanha de One Piece RPG: fichas, dados, música, ilhas, diário e o controle do mestre.">
<link rel="icon" href="{url_site['peca_leme.webp']}">
<link rel="stylesheet" href="estilo.css?v={v['estilo.css']}">
</head>
<body>
{tpl}
<script src="config.js?v={v['config.js']}"></script>
<script src="fb.js?v={v['fb.js']}"></script>
<script>window.CATALOGO_URL="catalogo.js?v={v['catalogo.js']}";window.LIVRO_URL="livro.js?v={v['livro.js']}";window.DADOFIS_URL="dadofis.js?v={v['dadofis.js']}";</script>
<script src="dados.js?v={v['dados.js']}"></script>
<script src="app.js?v={v['app.js']}"></script>
</body>
</html>
'''
(SITE / 'index.html').write_text(index)
(SITE / '_headers').write_text('/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n/fonts/*\n  Cache-Control: public, max-age=31536000, immutable\n/*.js\n  Cache-Control: public, max-age=0, must-revalidate\n')

# ───── 2) prévia (Artifact): corpo com tudo embutido; sem Firebase = modo de teste ─────
previa = ('<title>Mesa One Piece</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n'
          f'<style>\n{css(True)}\n</style>\n{tpl}\n<script>\n{dados(url_prev)}\n{catalogo().replace("</", "<\\/")}\n</script>\n<script>\n{DADOFIS.read_text().replace("</script", "<\\/script")}\n</script>\n<script>\n{app.replace("</script", "<\\/script")}\n</script>\n')
(OUT / 'previa.html').write_text(previa)
# prévia só para teste local (não vai para o Artifact: passa do limite de tamanho): igual, com o texto do livro embutido
(OUT / 'previa_livro.html').write_text(previa.replace('<script>\nwindow.ASSETS=', '<script>\n' + livro().replace('</', '<\\/') + '\nwindow.ASSETS=', 1))

tot = sum(f.stat().st_size for f in SITE.rglob('*') if f.is_file())
print('site:', len(list(SITE.rglob('*'))), 'arquivos,', round(tot / 1024), 'KB · prévia:', round((OUT / 'previa.html').stat().st_size / 1024), 'KB')
