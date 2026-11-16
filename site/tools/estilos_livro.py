"""Bloco 7: os 12 Estilos de Combate do Livro do Jogador 2.1 para o Catálogo.

Lê /home/claude/t/lj.txt (pdftotext -layout do LJ 2.1) e grava em data/catalogo_extra.json, na chave "livro":
  { id, nome, pg, dv, pv1, pvN, prof:{equip, salv, peric}, info:{attr, arma, hb, equip}, cd, atq,
    ideia:[{t, p:[...]}],              -> os textos de abertura do estilo (o que ele é)
    carac:[{n, nv}],                   -> nomes das características com o nível (sem o texto: o texto fica no livro)
    tecs:[[nivel, grau, combate, nivelAux, auxiliar, caminho]],
    blocos:[...] }                     -> as técnicas (cartões), no mesmo formato das frutas
Rodar:  python3 tools/estilos_livro.py
"""
import json, pathlib, re, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from parse_frutas import reflow, eh_cab, blocos_de, indent

LJ = pathlib.Path('/home/claude/t/lj.txt')
OUT = pathlib.Path('/home/claude/mesa/app/data/catalogo_extra.json')
PAGS = {'atirador': 41, 'aventureiro': 49, 'brutamontes': 55, 'carateca-homem-peixe': 61, 'ciborgue': 66, 'espadachim': 72,
        'guerrilheiro': 79, 'lutador': 85, 'ninja': 90, 'okama-kenpo': 96, 'rokushiki': 101, 'samurai': 107}
NOMES = {'atirador': 'Atirador', 'aventureiro': 'Aventureiro', 'brutamontes': 'Brutamontes', 'carateca-homem-peixe': 'Carateca Homem-Peixe',
         'ciborgue': 'Ciborgue', 'espadachim': 'Espadachim', 'guerrilheiro': 'Guerrilheiro', 'lutador': 'Lutador', 'ninja': 'Ninja',
         'okama-kenpo': 'Okama Kenpo', 'rokushiki': 'Rokushiki', 'samurai': 'Samurai'}
NIVEL = re.compile(r'(?:A partir do|No|Ao chegar no|Ao atingir o|Quando você atinge o)\s+(\d+)º nível')

def slug(t):
    t = t.lower()
    for a, b in (('á', 'a'), ('â', 'a'), ('ã', 'a'), ('é', 'e'), ('ê', 'e'), ('í', 'i'), ('ó', 'o'), ('ô', 'o'), ('õ', 'o'), ('ú', 'u'), ('ç', 'c')):
        t = t.replace(a, b)
    return re.sub(r'[^a-z0-9]+', '-', t).strip('-')

def titulo(t):
    pequenas = {'de', 'da', 'do', 'das', 'dos', 'e', 'a', 'o', 'em', 'no', 'na', 'com', 'um', 'uma', 'para'}
    ws = t.strip().lower().split()
    out = ' '.join(w if (i and w in pequenas) else w[:1].upper() + w[1:] for i, w in enumerate(ws))
    return out.replace('(ava)', '(AVA)').replace('Homem-peixe', 'Homem-Peixe').replace('Homens-peixe', 'Homens-Peixe')

def sem_pag(t):
    return re.sub(r'\s+\d{1,3}$', '', t.strip())

def cab(l):
    t = l.strip()
    return bool(t) and eh_cab(l) and t.upper() == t and not re.fullmatch(r'[\d\s]+', t)

def ler():
    L = [l.rstrip() for l in LJ.read_text().replace('\f', '\n').split('\n')]
    # número de página na mesma linha do texto, bem à direita: tira
    L = [re.sub(r'(\S)\s{8,}\d{1,3}$', r'\1', l) if len(l) > 100 else l for l in L]
    return [l if not (re.fullmatch(r'\s*\d{1,3}\s*', l) and indent(l) >= 80) else '' for l in L]

def secoes(L):
    ini = [i for i, l in enumerate(L) if re.match(r'Dado de Vida: 1d\d+ por nível de ', l)]
    out = []
    for n, s in enumerate(ini):
        nome_l = next(k for k in range(s - 1, s - 6, -1) if L[k].strip() and L[k].strip() != 'PONTOS DE VIDA')
        if n + 1 < len(ini):
            fim = next(k for k in range(ini[n + 1] - 1, ini[n + 1] - 6, -1) if L[k].strip() and L[k].strip() != 'PONTOS DE VIDA')
        else:
            fim = next(k for k in range(s, len(L)) if re.match(r'\s*MULTIESTILO\b', L[k]) or '3.3 – OP' in L[k])
        out.append((L[nome_l].strip(), s, fim))
    return out

def campo(bloco, rot):
    for l in bloco:
        m = re.match(r'\s*' + rot + r':\s*(.+)$', l)
        if m: return m.group(1).strip()
    return ''

def ler_tabela(B, k):
    linhas = []
    while k < len(B):
        l = B[k]
        m = re.match(r'\s*(\d+)º NÍVEL\s+(\d+)º GRAU\s+(.+?)\s{2,}(?:(\d+)º NÍVEL\s+(.+?)|-\s+-)\s*$', l)
        if m:
            linhas.append([int(m.group(1)), int(m.group(2)), m.group(3).strip(), int(m.group(4)) if m.group(4) else None, (m.group(5) or '').strip() or None]); k += 1; continue
        m2 = re.match(r'\s*(\d+)º NÍVEL\s+(\d+)º GRAU\s+(.+?)\s*$', l)
        if m2:
            linhas.append([int(m2.group(1)), int(m2.group(2)), m2.group(3).strip(), None, None]); k += 1; continue
        if linhas and (not l.strip() or 'CD das' in l or 'TÉCNICAS DE COMBATE' in l): break
        k += 1
    return linhas

def estilo(L, nome, s, fim):
    sid = slug(nome)
    B = L[s:fim]
    dv = int(re.search(r'1d(\d+)', B[0]).group(1))
    i_ig = next(k for k, l in enumerate(B) if l.strip() == 'INFORMAÇÕES GERAIS')
    i_info = next(k for k in range(i_ig, len(B)) if B[k].strip().startswith('Equipamentos:'))
    i_cc = next(k for k, l in enumerate(B) if l.strip() == 'CARACTERÍSTICAS DE COMBATE')
    # 1) a ideia do estilo: títulos e parágrafos entre as informações gerais e as características de combate
    ideia, cur, buf = [], None, []
    def fecha():
        if cur is not None:
            ps = [p for p in reflow(buf) if isinstance(p, str) and p.strip()]
            if ps: ideia.append({'t': titulo(sem_pag(cur)), 'p': ps})
    for l in B[i_info + 1:i_cc]:
        if cab(l):
            fecha(); cur, buf = l.strip(), []
        else:
            buf.append(l if l.strip() else '')
    fecha()
    # 2) as tabelas de técnicas (o Atirador tem duas: Duelista e Sniper)
    tabs = [k for k, l in enumerate(B) if re.match(r'\s*NÍVEL\s+GRAU\s+TÉCNICA DE COMBATE', l)]
    i_tab = tabs[0]
    tecs = []
    for it in tabs:
        rot = None
        if len(tabs) > 1:
            for q in range(it - 1, it - 8, -1):
                t = B[q].strip()
                if cab(B[q]) and t != 'TÉCNICAS':
                    rot = titulo(re.sub(r'^TÉCNICAS\s*[–-]\s*', '', t)); break
        for x in ler_tabela(B, it + 1):
            tecs.append(x + [rot])
    # 3) as características de combate (só o nome e o nível), até o título que abre as técnicas
    corte = max([q for q in range(i_cc + 2, i_tab) if B[q].strip() == 'TÉCNICAS' or B[q].strip().startswith('TÉCNICAS –')] or [i_tab])
    carac = []
    for j in range(i_cc + 1, corte):
        if not cab(B[j]): continue
        n = sem_pag(B[j])
        if n == 'TÉCNICAS': continue
        prox = ' '.join(x.strip() for x in B[j + 1:j + 4])
        mm = NIVEL.search(prox)
        carac.append({'n': titulo(n), 'nv': int(mm.group(1)) if mm and prox.find(mm.group(0)) < 60 else None})
    cd = next((l.strip() for l in B if 'CD das Técnicas' in l), '')
    atq = next((l.strip() for l in B if 'Modificador de ataque da Técnica' in l), '')
    # 4) os cartões das técnicas: depois da tabela até o fim da seção
    mapa = {}
    for t in tecs:
        mapa[t[2].upper()] = t[2]
        if t[4]: mapa[t[4].upper()] = t[4]
    i_cart = next((k for k in range(i_tab, len(B)) if B[k].strip() == 'TÉCNICAS DE COMBATE'), None)
    blocos = blocos_de(B[i_cart:], mapa) if i_cart else []
    prof_eq = next((re.sub(r'^Equipamentos?:\s*', '', B[k].strip()) for k in range(0, i_ig) if re.match(r'\s*Equipamentos?:', B[k])), '')
    return {
        'id': sid, 'nome': NOMES.get(sid, titulo(nome)), 'pg': f'LJ p. {PAGS.get(sid, "?")}', 'dv': f'd{dv}',
        'pv1': campo(B, 'PV no 1º Nível'), 'pvN': campo(B, 'PV nos Níveis Seguintes'),
        'prof': {'equip': prof_eq, 'salv': campo(B, 'Salvaguardas'), 'peric': campo(B, 'Perícias')},
        'info': {'attr': campo(B, 'Atributo Primário'), 'arma': campo(B, 'Arma Favorita'), 'hb': campo(B, 'Habilidade Básica Inata'),
                 'equip': re.sub(r'^Equipamentos:\s*', '', B[i_info].strip())},
        'cd': cd, 'atq': atq, 'ideia': ideia, 'carac': carac, 'tecs': tecs, 'blocos': blocos}

if __name__ == '__main__':
    L = ler()
    lista = [estilo(L, *s) for s in secoes(L)]
    extra = json.loads(OUT.read_text())
    extra['livro'] = lista
    OUT.write_text(json.dumps(extra, ensure_ascii=False, indent=1))
    for e in lista:
        nt = sum(1 for b in e['blocos'] if b['k'] == 'tec')
        print(f"\n## {e['nome']} ({e['pg']}) {e['dv']} | ideia: {[x['t'] for x in e['ideia']]} | tabela {len(e['tecs'])} linhas | cartões {nt}")
        print('   carac:', ', '.join(f"{c['n']}{'·' + str(c['nv']) if c['nv'] else ''}" for c in e['carac']))
        print('   tecs:', [(t[2], t[5]) if t[5] else t[2] for t in e['tecs']])
        print('   regras:', [b['t'] for b in e['blocos'] if b['k'] == 'regra'])
        print('   prof:', e['prof']['equip'][:50], '| info.equip:', e['info']['equip'][:50])
