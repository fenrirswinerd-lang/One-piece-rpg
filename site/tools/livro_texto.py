"""Texto dos livros para a busca do "Pergunte ao livro" (sem IA): pedaços curtos, cada um com página e título da seção.
Uso: python3 tools/livro_texto.py  →  data/livro_texto.json
Os PDFs não ficam no projeto: aponte os caminhos em FONTES."""
import json, pathlib, re, subprocess, sys
R = pathlib.Path(__file__).parent.parent
FONTES = [
    ('LJ', 'Livro do Jogador 2.1', '/mnt/user-data/uploads/OP_RPG_-_Livro_do_Jogador_2_1_-_Padrão.pdf', False),
    ('GN', 'Guia do Narrador 2.0', '/mnt/user-data/uploads/OP_RPG_-_Guia_do_Narrador_2_0_-_Padrão.pdf', True),
    ('MI', 'Manual dos Inimigos (playtest)', '/mnt/user-data/attachments/35783f46-0602-5d39-946d-c7dce5f8b407/59fa02be-OP_RPG_-_Manual_dos_Inimigos_-_Playtest.pdf', True),
]
RE_NUM = re.compile(r'^\d{1,2}(\.\d{1,2}){1,3}\s*[–—-]\s*\S')
def titulo(l):
    if RE_NUM.match(l): return True
    if len(l) < 4 or len(l) > 70 or l.endswith(('.', ',', ';', ':')): return False
    letras = [c for c in l if c.isalpha()]
    return len(letras) >= 4 and l == l.upper() and not re.search(r'\d{2,}', l) and len(l.split()) <= 9
def pedacos(txt):
    out = {'nome': None, 'tit': [], 'p': []}; tits = {}; atual = ''
    def tid(t):
        if t not in tits: tits[t] = len(out['tit']); out['tit'].append(t)
        return tits[t]
    for pag, pg in enumerate(txt.split('\f'), 1):
        linhas = [l.rstrip() for l in pg.split('\n')]
        # tira o número da página (linha só com número no começo ou no fim)
        vivos = [i for i, l in enumerate(linhas) if l.strip()]
        for i in vivos[:2] + vivos[-2:]:
            if re.fullmatch(r'\s*\d{1,3}\s*', linhas[i]): linhas[i] = ''
        paras, cur = [], ''
        def fecha():
            nonlocal cur
            if cur.strip(): paras.append((atual, re.sub(r'\s+', ' ', cur).strip()))
            cur = ''
        for l in linhas:
            s = l.strip()
            if not s: fecha(); continue
            if titulo(s):
                fecha(); atual = re.sub(r'\s+', ' ', s)[:80]; continue
            if cur.endswith('-') and s[:1].islower(): cur = cur[:-1] + s
            else: cur += (' ' if cur else '') + s
            if len(cur) > 380 and re.search(r'[.!?]$', s): fecha()
        fecha()
        # junta parágrafos curtos do mesmo título; corta os muito longos em frases
        buf, bt = '', None
        def solta():
            nonlocal buf
            if len(buf) >= 25: out['p'].append([pag, tid(bt or ''), buf])
            buf = ''
        for t, p in paras:
            if bt is not None and (t != bt or len(buf) + len(p) > 620): solta()
            bt = t
            while len(p) > 900:
                c = max(p.rfind('. ', 0, 700), p.rfind('; ', 0, 700))
                c = c + 1 if c > 200 else 700
                if buf: solta()
                out['p'].append([pag, tid(t or ''), p[:c].strip()]); p = p[c:].strip()
            buf += (' ¶ ' if buf else '') + p
        solta()
    return out
res = {}
for sig, nome, caminho, so_mestre in FONTES:
    if not pathlib.Path(caminho).exists(): print('faltou', caminho); sys.exit(1)
    txt = subprocess.run(['pdftotext', caminho, '-'], capture_output=True, check=True).stdout.decode('utf-8', 'replace')
    d = pedacos(txt); d['nome'] = nome; d['mestre'] = so_mestre; res[sig] = d
    print(sig, len(d['p']), 'pedaços,', len(d['tit']), 'títulos,', sum(len(x[2]) for x in d['p']) // 1024, 'KB')
(R / 'data' / 'livro_texto.json').write_text(json.dumps(res, ensure_ascii=False, separators=(',', ':')))
print('data/livro_texto.json', (R / 'data' / 'livro_texto.json').stat().st_size // 1024, 'KB')
