"""Bloco 7: completa o catálogo de frutas.

1) Para cada fruta: "ideia" (o que a fruta faz, em linguagem simples, para quem acabou de descobrir), "naObra" (quem usa no
   mangá, como referência) e "mestre" (nota que só o mestre vê). Esses textos foram escritos à mão.
2) Acrescenta a Kumo-Kumo no Mi (Fruto da Nuvem), a fruta criada para esta mesa, lida do .docx que fizemos.
   As linhas "Cálculo: ..." do .docx (como o PP foi calculado) viram o campo "calc", que só o mestre vê.
Rodar depois de tools/parse_frutas.py:  python3 tools/catalogo_b7.py
"""
import json, pathlib, re
import docx

FR = pathlib.Path('/home/claude/mesa/app/data/frutas.json')
KUMO = pathlib.Path('/home/claude/t/tpl/Kumo-Kumo no Mi - Fruto da Nuvem.docx')

IDEIAS = {
    'ope-ope': dict(
        ideia=['Uma Paramecia que cria uma área azulada em volta do usuário, a ROOM. Dentro dela, ele age como um cirurgião com poder total: corta pessoas e coisas sem matar e sem sangue, troca pessoas e objetos de lugar, separa e junta partes do corpo.',
               'Fora da ROOM a fruta não faz nada, e quanto maior a ROOM, mais ela cansa. Quem entende de medicina tira muito mais proveito dela.'],
        naObra='É chamada de “a fruta definitiva”: uma operação secreta pode dar vida eterna a alguém, mas custa a vida de quem a usa. Por isso já foi negociada por ฿ 5.000.000.000. No mangá, o usuário é Trafalgar Law.',
        mestre='Na sua campanha, Law não existe: a fruta é da personagem da Amy (Tsukyo).'),
    'uo-uo-seiryu': dict(
        ideia=['Uma Zoan Mítica que transforma o usuário num dragão azul do Oriente: comprido como uma serpente e grande como um navio de guerra.',
               'Voa juntando nuvens embaixo do corpo, cria tornados e lâminas de vento e sopra fogo. Também tem a forma híbrida (meio gente, meio dragão) e a resistência absurda das Zoan.'],
        naObra='É a fruta de Kaido das Cem Feras, um dos Quatro Imperadores.'),
    'wara-wara': dict(
        ideia=['Uma Paramecia de palha. O usuário solta e molda palha do próprio corpo, chegando a virar um gigante de palha, e cria bonecos vodu ligados a uma pessoa com um fio de cabelo, uma unha ou um pedaço de roupa dela.',
               'Com o boneco, machuca quem está ligado a ele, mesmo de longe. E o ferimento que ele recebe pode passar para as pessoas ligadas, como um escudo vivo.'],
        naObra='Basil Hawkins, “o Mago”, um dos Supernovas, que decide tudo pelas cartas de tarô.'),
    'yami-yami': dict(
        ideia=['Uma Logia da escuridão, diferente de todas as outras: a escuridão funciona como uma gravidade sem fim, que puxa e engole tudo (gente, prédios e até ataques) e pode soltar de novo.',
               'Segurando alguém que comeu Akuma no Mi, o usuário anula o poder dessa pessoa. O preço: o corpo não fica intangível como o de outras Logias e sente mais dor do que o normal.'],
        naObra='Marshall D. Teach, o Barba Negra, que matou um companheiro do próprio bando para ficar com ela.'),
    'pika-pika': dict(
        ideia=['Uma Logia da luz. O usuário vira luz e se move na velocidade dela, dispara raios laser dos dedos, chuta com a força de um feixe de luz e cria uma espada de luz.',
               'É uma das frutas mais rápidas e destrutivas que existem. Golpes comuns atravessam o corpo dele sem ferir.'],
        naObra='Borsalino, o Almirante Kizaru, da Marinha.'),
    'zou-zou-mammoth': dict(
        ideia=['Uma Zoan Ancestral que transforma o usuário num mamute, o elefante peludo da era antiga.',
               'Dá força bruta e resistência enormes, presas e tromba poderosas, e uma recuperação muito rápida, típica das Zoan Ancestrais.'],
        naObra='Jack, “a Seca”, um dos comandantes mais fortes do bando de Kaido.'),
    'suke-suke': dict(
        ideia=['Uma Paramecia que deixa o usuário invisível, junto com tudo o que ele estiver tocando: roupas, armas e até outras pessoas.',
               'Ótima para espionar, fugir e atacar sem ser visto. Sangue, água, poeira ou o som dos passos podem denunciar onde ele está.'],
        naObra='Absalom, “o Túmulo”, um dos Três Monstros Misteriosos de Thriller Bark.'),
    'suna-suna': dict(
        ideia=['Uma Logia da areia. O usuário vira areia, controla tempestades e lâminas de areia e, com a mão, seca tudo o que toca, tirando a água de pessoas, plantas e do chão.',
               'A fraqueza é a água: molhado, o corpo deixa de virar areia e pode ser atingido normalmente.'],
        naObra='Sir Crocodile, que foi um dos Sete Corsários e quase tomou o reino de Alabasta.'),
    'tama-tama': dict(
        ideia=['Uma Zoan estranha: o usuário vira um ovo. Quando a forma de ovo é derrotada, ele renasce como pinto e, depois, como galinha, cada forma com golpes próprios.',
               'Na prática, é uma fruta de “vidas extras”, que dá ao usuário a chance de voltar para a luta.'],
        naObra='Barão Tamago, do bando da Big Mom.'),
    'saru-saru-sun-wukong': dict(
        ideia=['Uma Zoan Mítica que transforma o usuário no Rei Macaco da lenda chinesa (Sun Wukong): força e agilidade divinas e um bastão mágico que cresce e encolhe à vontade (Ruyi Jingu Bang).',
               'Também chama a nuvem voadora (Jindouyun) e domina as 72 transformações da lenda.'],
        naObra='Não aparece no mangá: é uma fruta do material do OP RPG, inspirada na lenda “Jornada ao Oeste”.',
        mestre='Na sua campanha, é a fruta do Jones (o pirata preso em Mary Geoise).'),
}

def calc_fora(txt):
    """separa as linhas 'Cálculo: ...' (como o PP foi feito) do texto que o jogador lê"""
    linhas = [l.strip() for l in txt.split('\n') if l.strip()]
    calc = [l for l in linhas if l.startswith('Cálculo')]
    resto = [l for l in linhas if not l.startswith('Cálculo')]
    return resto, calc

def tec_da_tabela(t, tipo):
    vistos = []
    for r in t.rows:
        for c in r.cells:
            x = c.text.strip()
            if x and x not in vistos: vistos.append(x)
    # vistos: [grau, NOME (TRADUÇÃO), desc(+cálculo), 'N\nPontos de Poder', 'Duração', v, 'Alcance', v, 'Requisito', v, ('Dano', v), (comb)]
    nome_full = vistos[1]
    m = re.match(r'(.+?)\s*\((.+)\)$', nome_full)
    nome = m.group(1).title().replace('Hō', 'Hō') if m else nome_full.title()
    nota = m.group(2).capitalize() if m else ''
    desc, calc = calc_fora(vistos[2])
    pp = int(re.match(r'(\d+)', vistos[3]).group(1))
    kv = {}
    i = 4
    while i + 1 < len(vistos):
        if vistos[i] in ('Duração', 'Alcance', 'Requisito', 'Dano'):
            kv[vistos[i]] = vistos[i + 1]; i += 2
        else:
            i += 1
    comb = next((('Possível' if 'Possível' in x else 'Impossível') for x in vistos if x.startswith('Ataque Combinado')), '')
    grau = int(vistos[0][0]) if tipo == 'combate' else None
    return {'k': 'tec', 'nome': nome, 'nota': nota, 'tipo': tipo, 'grau': grau, 'pp': pp, 'duracao': kv.get('Duração', ''), 'alcance': kv.get('Alcance', ''),
            'req': kv.get('Requisito', ''), 'dano': kv.get('Dano', '') if tipo == 'combate' else '', 'comb': comb if tipo == 'combate' else '', 'desc': desc, 'extra': [], 'calc': calc}

def kumo():
    d = docx.Document(str(KUMO))
    P = [p.text.strip() for p in d.paragraphs]
    def depois(titulo, ate):
        i = P.index(titulo)
        out = []
        for x in P[i + 1:]:
            if x in ate: break
            if x: out.append(x)
        return out
    TIT = ('SOBRE A FRUTA', 'ASPECTO INATO', 'USUÁRIO SIMPLES', 'MANIFESTAÇÕES DE PODER', 'TÉCNICAS DE AKUMA NO MI', 'TÉCNICAS DE COMBATE', 'TÉCNICAS AUXILIARES')
    sobre = depois('SOBRE A FRUTA', TIT)
    blocos = []
    for t, rot in (('ASPECTO INATO', 'Aspecto Inato'), ('USUÁRIO SIMPLES', 'Usuário Simples'), ('MANIFESTAÇÕES DE PODER', 'Manifestações de Poder'), ('TÉCNICAS DE AKUMA NO MI', 'Técnicas de Akuma no Mi')):
        ps = depois(t, TIT)
        calc = [x for x in ps if x.startswith('Cálculo')]
        blocos.append({'k': 'regra', 't': rot, 'p': [x for x in ps if not x.startswith('Cálculo')], **({'calc': calc} if calc else {})})
    T = d.tables
    for t in T[1:4]: blocos.append(tec_da_tabela(t, 'combate'))
    blocos.append(tec_da_tabela(T[4], 'auxiliar'))
    # resumo (tabela 0): Nível | Grau | Técnicas | PP | Dano | Auxiliares | PP | Propriedades
    linhas, props = [], []
    for r in T[0].rows[2:]:
        c = [x.text.strip() for x in r.cells]
        if c[0].startswith('Usuário'): continue
        linhas.append([c[0], c[1], c[2], c[3], c[4], c[5], c[6]])
        for p in re.split(r'\s*[/\n]\s*', c[7]):
            if p and p not in props: props.append(p)
    return {
        'id': 'kumo-kumo', 'nome': 'Kumo-Kumo no Mi', 'fruto': 'Fruto da Nuvem', 'tipo': 'Usuário Paramecia Simples', 'origem': 'mesa',
        'nivel': {'1': 1, '2': 3, '3': 6},
        'resumo': {'cab': ['Nível', 'Grau', 'Técnicas de Combate', 'PP', 'Dano', 'Técnicas Auxiliares', 'PP'], 'linhas': linhas, 'props': props},
        'ideia': [sobre[0]],
        'naObra': 'Não existe no mangá: foi criada para esta mesa, seguindo as regras de criação de técnicas do OP RPG.',
        'mestre': ' '.join(sobre[1:]),
        'blocos': blocos}

if __name__ == '__main__':
    F = json.loads(FR.read_text())
    F = [f for f in F if f['id'] != 'kumo-kumo']
    for f in F:
        x = IDEIAS.get(f['id'])
        assert x, 'sem ideia para ' + f['id']
        f['ideia'] = x['ideia']; f['naObra'] = x['naObra']
        if x.get('mestre'): f['mestre'] = x['mestre']
        else: f.pop('mestre', None)
    F.append(kumo())
    FR.write_text(json.dumps(F, ensure_ascii=False, indent=1))
    k = F[-1]
    print('frutas:', len(F))
    print('kumo resumo:', k['resumo'])
    for b in k['blocos']:
        print(' ', b['k'], b.get('t') or b.get('nome'), '|', b.get('nota', ''), b.get('grau'), b.get('pp'), b.get('alcance', ''), b.get('dano', ''), b.get('comb', ''), '| calc:', len(b.get('calc', [])))
    print('mestre:', k['mestre'])
