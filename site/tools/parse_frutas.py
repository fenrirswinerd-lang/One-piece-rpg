#!/usr/bin/env python3
"""Lê os PDFs/TXT de frutas (Akuma no Mi) e gera data/frutas.json (catálogo).
Uso: python3 tools/parse_frutas.py   (lê os .txt já extraídos com pdftotext -layout)"""
import re, json, pathlib, subprocess, sys

FONTES = [  # (arquivo, id, origem)
    ('/mnt/user-data/attachments/35783f46-0602-5d39-946d-c7dce5f8b407/670f806e-Ope-Ope_no_Mi_Fruto_da_Opera__o_-_2.0.pdf', 'ope-ope', 'livro'),
    ('/mnt/user-data/attachments/35783f46-0602-5d39-946d-c7dce5f8b407/38bc1f79-Uo-Uo_no_Mi_-_Model_Seiryu_Fruto_da_Carpa_-_Modelo_Drag_o_Azul_-_2.0.pdf', 'uo-uo-seiryu', 'novo'),
    ('/mnt/user-data/attachments/35783f46-0602-5d39-946d-c7dce5f8b407/efb54778-Wara-Wara_no_Mi_Fruto_da_Palha_-_2.0.pdf', 'wara-wara', 'novo'),
    ('/mnt/user-data/attachments/35783f46-0602-5d39-946d-c7dce5f8b407/e594c342-Yami-Yami_no_Mi_Fruto_da_Escurid_o_-_2.0.pdf', 'yami-yami', 'novo'),
    ('/mnt/user-data/attachments/35783f46-0602-5d39-946d-c7dce5f8b407/ec47a4fc-Pika-Pika_no_Mi_Fruto_da_Luz_-_2.0.pdf', 'pika-pika', 'novo'),
    ('/mnt/user-data/attachments/35783f46-0602-5d39-946d-c7dce5f8b407/5ba7c89f-Zou-Zou_no_Mi_-_Model_Mammoth_Fruto_do_Elefante_-_Modelo_Mamute_-_2.0.pdf', 'zou-zou-mammoth', 'novo'),
    ('/mnt/user-data/attachments/35783f46-0602-5d39-946d-c7dce5f8b407/05df94c1-Suke-Suke_no_Mi_Fruto_da_Invisibilidade_-_2.0.pdf', 'suke-suke', 'novo'),
    ('/mnt/user-data/attachments/35783f46-0602-5d39-946d-c7dce5f8b407/7d8a4541-Suna-Suna_no_Mi_Fruto_da_Areia_-_2.0.pdf', 'suna-suna', 'novo'),
    ('/mnt/user-data/attachments/35783f46-0602-5d39-946d-c7dce5f8b407/4762cc2d-Tama-Tama_no_Mi_Fruto_do_Ovo_-_2.0.pdf', 'tama-tama', 'novo'),
    ('/mnt/user-data/attachments/35783f46-0602-5d39-946d-c7dce5f8b407/19d53725-Saru-Saru_no_Mi_-_Model_Sun_Wukong_Fruto_do_Macaco_-_Modelo_Sun_Wukong_-_2.0.pdf', 'saru-saru-sun-wukong', 'novo'),
]
META = ('Duração', 'Alcance', 'Requisito', 'Dano')
LABEL_ESQ = re.compile(r'^\s{0,7}(?:(\d+º)|Grau|Técnica|Auxiliar|Pontos de Poder)(?=\s|$)\s*')

def txt(p):
    t = subprocess.run(['pdftotext', '-layout', p, '-'], capture_output=True, text=True).stdout
    # número de página na mesma linha do texto, bem à direita (Bloco 7): tira
    return '\n'.join(re.sub(r'([a-zà-ú.;:)])\s{8,}\d{1,3}$', r'\1', l.rstrip()) if len(l) > 100 else l for l in t.split('\n'))

def indent(l):
    return len(l) - len(l.lstrip())

def reflow(linhas):
    """junta linhas em parágrafos; linhas de tabela (várias colunas) viram {tab:[...]}"""
    out, atual, ult_ind, ult_fim = [], [], 0, ''
    def fecha():
        nonlocal atual
        if atual:
            out.append(' '.join(atual).strip()); atual = []
    tab = []
    def fecha_tab():
        nonlocal tab
        if tab:
            w = max(len(r) for r in tab[1:]) if len(tab) > 1 else len(tab[0])
            if len(tab) > 1 and len(tab[0]) != w and w % 2 == 0 and tab[0][0] == 'Nível':
                tab[0] = tab[0][:2] * (w // 2)
            out.append({'tab': tab}); tab = []
    for l in linhas:
        if not l.strip():
            fecha(); fecha_tab(); continue
        s = l.strip()
        if re.search(r'\S {3,}\S', s) and len(re.split(r' {3,}', s)) >= 3:
            fecha(); tab.append(re.split(r' {2,}', s)); continue
        fecha_tab()
        ind = indent(l)
        rot = re.match(r"^[A-ZÀ-Ú][\wÀ-ú'’ ()\-]{2,50}:\s", s) is not None
        if atual and ((ind > ult_ind + 2 and ult_fim in '.;:!?”)') or ult_fim == ';' or (rot and ult_fim in '.;!?”)')):
            fecha()
        atual.append(s); ult_ind = ind; ult_fim = s[-1]
    fecha(); fecha_tab()
    return out

CAPS = r"[A-ZÁÉÍÓÚÂÊÔÃÕÇÜ0-9 ()'’“”\"\-–:,./º+]"
def eh_cab(l):
    t = l.strip()
    if len(re.split(r' {3,}', t)) >= 3: return False
    t = re.sub(r'\s{3,}\d+$', '', t)
    return len(t) >= 3 and re.fullmatch(CAPS + '+', t) is not None and re.search(r'[A-ZÁÉÍÓÚÂÊÔÃÕÇ]{3}', t) is not None

def bonito(t, mapa):
    t = re.sub(r'\s{3,}\d+$', '', t.strip()); t = re.sub(r'\s+', ' ', t)
    k = t.lower()
    if k in mapa: return mapa[k]
    peq = {'de', 'do', 'da', 'no', 'o', 'a', 'e', 'dos', 'das', 'em', 'para', 'com', 'ou'}
    ws = t.lower().split(' ')
    out = []
    for i, w in enumerate(ws):
        if i and w in peq: out.append(w)
        else: out.append(re.sub(r'(^|[(\-:/])([a-zà-ú])', lambda m: m.group(1) + m.group(2).upper(), w))
    return ' '.join(out).replace('(Ava)', '(AVA)')

def blocos_de(body, mapa):
    # segmentação por títulos
    seg, secao = [], 'combate'
    for l in body:
        if eh_cab(l):
            t = l.strip()
            if re.match(r'TÉCNICAS DE COMBATE', t): secao = 'combate'; continue
            if re.match(r'TÉCNICAS? AUXILIAR(ES)?\b', t): secao = 'auxiliar'; continue
            seg.append({'t': t, 'sec': secao, 'l': []}); continue
        if seg: seg[-1]['l'].append(l)
    blocos = []
    for s in seg:
        tem = any(re.search(r'(?:^|\s{2,})Requisito\s+\S', x) for x in s['l'])
        if tem: blocos.append(s | {'tec': True})
        else: blocos.append(s | {'tec': False})
    saida = []
    for s in blocos:
        if not s['tec']:
            saida.append({'k': 'regra', 't': bonito(s['t'], mapa), 'p': reflow(s['l'])}); continue
        desc, extra, meta, grau, pp = [], [], {}, None, None
        fase, ult, col_val = 'desc', None, None
        for x in s['l']:
            if not x.strip():
                (desc if fase == 'desc' else extra).append(''); continue
            mm = re.search(r'(?:^|\s{2,})(Duração|Alcance|Requisito|Dano)\s+(\S.*)$', x)
            mp = re.match(r'^\s*(?:(?:\d+º|Grau|Point|Técnica|Auxiliar)\s+)*(\d+)\s{3,}(Duração|Alcance|Requisito|Dano)\b', x)
            if mp and pp is None: pp = int(mp.group(1))
            if mm and (mm.start(1) > 14 or mp):
                fase = 'meta'; ult = mm.group(1); meta[ult] = mm.group(2).strip(); col_val = mm.start(2)
                g = re.match(r'^\s*(\d+)º\b', x)
                if g and grau is None: grau = int(g.group(1))
                continue
            mg = re.match(r'^\s{0,6}(\d+)º\b', x)
            if mg and grau is None: grau = int(mg.group(1))
            ac = re.search(r'Ataque Combinado (Possível|Impossível)', x)
            if ac:
                meta['Combinado'] = ac.group(1); fase = 'pos'; ult = None; continue
            if re.fullmatch(r'\s*(Grau|Point|Técnica|Auxiliar|Pontos de Poder|\d+)\s*', x):
                if re.fullmatch(r'\s*\d+\s*', x) and pp is None: pp = int(x.strip())
                continue
            if fase == 'meta' and ult and indent(x) >= (col_val or 30) - 3 and not re.match(r'\s*(Duração|Alcance|Requisito|Dano)', x):
                meta[ult] += ' ' + x.strip(); continue
            y = LABEL_ESQ.sub('', x, count=1) if indent(x) < 8 else x
            if fase == 'desc': desc.append(y)
            else: extra.append(y); fase = 'pos'
        nm = bonito(s['t'], mapa); nota = ''
        mn = re.match(r'(.+?)\s*\((.+)\)$', nm)
        if mn and re.search(r'(?i)pode ser|a partir', mn.group(2)):
            nm = mn.group(1); n0 = mn.group(2).lower(); nota = n0[:1].upper() + n0[1:]
        saida.append({'k': 'tec', 'nome': nm, 'nota': nota, 'tipo': s['sec'], 'grau': grau, 'pp': pp, 'duracao': meta.get('Duração', ''), 'alcance': meta.get('Alcance', ''),
                      'req': meta.get('Requisito', ''), 'dano': meta.get('Dano', ''), 'comb': meta.get('Combinado', ''), 'desc': reflow(desc), 'extra': reflow(extra)})
    final, tag = [], None
    for b in saida:
        if b['k'] == 'regra' and not any(b['p']):
            tag = b['t']; continue
        if b['k'] == 'tec' and tag: b['tag'] = tag
        tag = None; final.append(b)
    return final

def parse(path, fid, origem):
    L = [l.rstrip() for l in txt(path).replace('\f', '\n').split('\n')]
    L = [l for l in L if not (re.fullmatch(r'\s*\d{1,3}\s*', l) and indent(l) >= 80)]            # número de página sozinho
    titulo = next(l.strip() for l in L if l.strip())
    m = re.match(r'(.+?)\s*\((.+)\)\s*$', titulo)
    nome, fruto = (m.group(1).strip(), m.group(2).strip()) if m else (titulo, '')
    iu = next(i for i, l in enumerate(L[:40]) if re.search(r'Usuário (Paramecia|Zoan|Logia)', l))
    tipo = L[iu].strip()
    # tabela-resumo (linhas entre o título e "Usuário ...")
    tab = [l for l in L[1:iu] if l.strip()]
    cab = re.split(r' {2,}', tab[0].strip()) if tab else []
    nivel, mapa, linhas, props = {}, {}, [], []
    for l in tab[1:]:
        cel = re.split(r' {2,}', l.strip())
        if re.match(r'\d+º$', cel[0]) and len(cel) > 1:
            linhas.append(cel)
            if re.match(r'(\d+)º', cel[1]): nivel[int(re.match(r'(\d+)', cel[1]).group(1))] = int(cel[0][:-1])
            for c in cel[1:]:
                if re.search(r'[A-Za-zÀ-ú]', c) and not re.fullmatch(r'\d+º( Grau| Point)', c): mapa[c.lower()] = c
            # propriedade na mesma linha (última célula só letras depois de uma sequência de dados)
            if len(cel) >= 6 and re.fullmatch(r'[A-Za-zÀ-ú\- ]+', cel[-1]) and not re.search(r'd\d', cel[-1]): props.append(cel[-1]); linhas[-1] = cel[:-1]
        else:
            props += [c for c in cel if re.fullmatch(r'[A-Za-zÀ-úé\-]+', c)]
    saida = blocos_de(L[iu + 1:], mapa)
    def divide(cel):
        o = []
        for c in cel:
            m2 = re.fullmatch(r'(\d+|-)\s+(\d+d\d+(?:\+\d+)?|-)', c)
            o += [m2.group(1), m2.group(2)] if m2 else [c]
        return o
    linhas = [divide(r) for r in linhas]
    cab2 = []
    for c in cab:
        if c.endswith(' PP Dano'): cab2 += [c[:-8], 'PP', 'Dano']
        elif c in ('PP Dano', 'PP  Dano'): cab2 += ['PP', 'Dano']
        else: cab2 += [c]
    cab = [c for c in cab2 if c != 'Propriedades']
    if len(cab) < 5: cab = ['Nível', 'Grau', 'Técnicas de Combate', 'PP', 'Dano', 'Técnicas Auxiliares', 'PP']
    P_OK = ['Corporal', 'Criação', 'Manipulação', 'Espaço-Temporal', 'Extracorporal', 'Transformação']
    pl = []
    for p in props:
        for w in p.split():
            if w in P_OK and w not in pl: pl.append(w)
    props = pl
    return {'id': fid, 'nome': nome.title().replace(' No ', ' no '), 'fruto': fruto.title().replace(' Do ', ' do ').replace(' Da ', ' da ').replace(' De ', ' de ').replace(' Dos ', ' dos '),
            'tipo': tipo, 'origem': origem, 'nivel': nivel, 'resumo': {'cab': cab, 'linhas': linhas, 'props': props}, 'blocos': saida}

if __name__ == '__main__':
    todas = [parse(p, i, o) for p, i, o in FONTES]
    pathlib.Path('/home/claude/mesa/app/data/frutas.json').write_text(json.dumps(todas, ensure_ascii=False, indent=1))
    for f in todas:
        print('\n##', f['nome'], '|', f['fruto'], '|', f['tipo'], '| níveis', f['nivel'], '| props', f['resumo']['props'])
        for t in f['blocos']:
            if t['k'] == 'regra': print(f"  (regra) {t['t']}  [{len(t['p'])} blocos]")
            else: print(f"  [{t['tipo'][:3]}] {t['nome']:36} g={t['grau']} pp={t['pp']} dur={t['duracao'][:20]!r} alc={t['alcance'][:22]!r} dano={t['dano'][:28]!r} comb={t['comb']} desc={len(t['desc'])}p extra={len(t['extra'])}p")

# ───────── estilos de combate exclusivos 2.1 e espécie Oni ─────────
ESTILOS_RES = {  # da tabela da página 2 do PDF (conferida à mão)
    'black-leg': dict(nome='Black Leg', dv='d12', attr='Força ou Destreza', salv='Força e Destreza', armas='Nenhum', pericias='Escolha 2 entre Atletismo, Acrobacia, Intuição, Percepção e Prestidigitação.', multi='Força ou Destreza 16'),
    'esgrimista': dict(nome='Esgrimista', dv='d10', attr='Presença', salv='Destreza e Presença', armas='Armas Cortantes', pericias='Escolha 2 entre Atletismo, Atuação, Persuasão, Intuição e Percepção.', multi='Destreza ou Presença 16'),
    'heroi': dict(nome='Herói', dv='d8', attr='Força ou Vontade', salv='Constituição e Vontade', armas='Nenhum', pericias='Escolha 2 entre Atletismo, Acrobacia, Haki, Sorte e Persuasão.', multi='Presença ou Vontade 16', banido=True),
    'solfista': dict(nome='Solfista', dv='d8', attr='Destreza ou Presença', salv='Destreza e Presença', armas='Armas Cortantes', pericias='Escolha 3 quaisquer.', multi='Presença 15'),
    'usuario-insito': dict(nome='Usuário Ínsito', dv='d10', attr='Força ou Vontade', salv='Constituição e Vontade', armas='Nenhum', pericias='Escolha 2 entre Atletismo, Acrobacia, Furtividade, Sobrenatural e Sobrevivência.', multi='Constituição ou Vontade 16'),
}
def estilos():
    p = '/mnt/user-data/attachments/35783f46-0602-5d39-946d-c7dce5f8b407/52bbba8f-Estilos_de_Combate_Exclusivos_-_2.1.pdf'
    L = [l.rstrip() for l in txt(p).replace('\f', '\n').split('\n')]
    L = [l for l in L if not (re.fullmatch(r'\s*\d{1,3}\s*', l) and indent(l) >= 80)]
    marcas = {}
    for i, l in enumerate(L):
        t = l.strip()
        for k, nm in (('black-leg', 'BLACK LEG'), ('esgrimista', 'ESGRIMISTA'), ('heroi', 'HERÓI'), ('solfista', 'SOLFISTA'), ('usuario-insito', 'USUÁRIO ÍNSITO')):
            if t == nm and i > 45: marcas[k] = i
    ordem = sorted(marcas.items(), key=lambda kv: kv[1])
    out = []
    for n, (k, i) in enumerate(ordem):
        fim = ordem[n + 1][1] if n + 1 < len(ordem) else len(L)
        bl = blocos_de(L[i + 1:fim], {})
        out.append(dict(id=k, **ESTILOS_RES[k], blocos=bl))
    return out
def oni():
    p = '/mnt/user-data/attachments/35783f46-0602-5d39-946d-c7dce5f8b407/f29902fb-Esp_cie_-_Oni_2.0.pdf'
    L = [l.rstrip() for l in txt(p).replace('\f', '\n').split('\n')]
    L = [l for l in L if not (re.fullmatch(r'\s*\d{1,3}\s*', l) and indent(l) >= 80)]
    # a primeira parte (atributos da espécie) vem antes do 1º título: vira bloco "Em resumo"
    i = next(k for k, l in enumerate(L) if l.strip().startswith('TRAÇOS DA ESPÉCIE'))
    resumo = reflow(L[1:i])
    return dict(id='oni', nome='Ogro (arquivo “Oni”)', pg='PDF Espécie Oni 2.0', resumo=resumo, blocos=blocos_de(L[i:], {}))
if __name__ == '__main__':
    extra = {'estilos': estilos(), 'oni': oni()}
    pathlib.Path('/home/claude/mesa/app/data/catalogo_extra.json').write_text(json.dumps(extra, ensure_ascii=False, indent=1))
    for e in extra['estilos']:
        print('\n##', e['nome'], e['dv'], 'banido' if e.get('banido') else '')
        for b in e['blocos']:
            if b['k'] == 'regra': print('  (regra)', b['t'], len(b['p']))
            else: print(f"  [{b['tipo'][:3]}] {b['nome']} g={b['grau']} pp={b['pp']} {b['duracao'][:14]!r} {b['alcance'][:20]!r} {b['dano'][:24]!r} {b['comb']}")
    print('\n## ONI', [b['t'] for b in extra['oni']['blocos'] if b['k']=='regra'])
