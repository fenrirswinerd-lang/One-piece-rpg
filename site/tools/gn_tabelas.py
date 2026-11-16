#!/usr/bin/env python3
"""Gera data/tabelas_gn.json com as tabelas aleatórias do Guia do Narrador 2.0 (as de d100 são lidas do texto do PDF;
as pequenas são digitadas e conferidas contra o texto). Uso: python3 tools/gn_tabelas.py"""
import re, json, pathlib
GN = open('/home/claude/t/gn.txt', encoding='utf-8').read()
GL = GN.split('\n')
def norm(s): return re.sub(r'\s+', ' ', s).strip().lower()
NG = norm(GN)

def pares(i0, i1, d100=True):
    """linhas 'faixa  texto   faixa  texto' -> [(de, ate, texto)]"""
    out = []
    pat = re.compile(r'^\s*(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?\s{2,}(.+?)\s{2,}(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?\s{2,}(.+?)\s*$')
    for l in GL[i0:i1]:
        m = pat.match(l)
        if not m: continue
        for a, b, t in ((m.group(1), m.group(2), m.group(3)), (m.group(4), m.group(5), m.group(6))):
            a = int(a); b = int(b) if b else a
            if b == 0 or (d100 and b == 0): b = 100
            if a == 0: a = 100
            out.append([a, b, t.strip()])
    out.sort(key=lambda x: x[0])
    return out

def lista(*itens):
    return [[i + 1, i + 1, t] for i, t in enumerate(itens)]

def idx(s, ini=0):
    for i in range(ini, len(GL)):
        if s in GL[i]: return i
    raise KeyError(s)

# ───── eventos fechados (d100) e formas de governo (d100) ─────
i = idx('OBJETIVOS BASEADOS EM EVENTOS', idx('EVENTOS FECHADOS')); fechados = pares(i + 1, i + 30)
fechados[-1][1] = 100            # "99-00"
j = idx('FORMAS DE GOVERNO', idx('Formas de governo típicas')); gov = pares(j + 1, j + 12)
GOV_DESC = {}
txt = '\n'.join(GL[j + 12:j + 105])
for m in re.finditer(r'(?ms)^\s*([A-ZÁÉÍÓÚ][a-záéíóúçãõ]+(?: ou [A-Z][a-z]+)?):\s(.+?)(?=^\s*[A-ZÁÉÍÓÚ][a-záéíóúçãõ]+(?: ou [A-Z][a-z]+)?:\s|^\s{10,}EXEMPLO DE|\Z)', txt):
    GOV_DESC[m.group(1)] = re.sub(r'\s+', ' ', re.sub(r'\s{5,}\d+\s*$', '', m.group(2).strip(), flags=re.M)).strip()
    GOV_DESC[m.group(1)] = re.sub(r'\s+\d{2}$', '', GOV_DESC[m.group(1)])
for g in gov:
    nome = g[2]
    d = GOV_DESC.get(nome) or (GOV_DESC.get('Matriarcado ou Patriarcado') if nome in ('Matriarcado', 'Patriarcado') else '')
    g.append(d)
# a faixa de d100 deve cobrir 1..100 sem buraco
for nome, T in (('fechados', fechados), ('governo', gov)):
    cobre = sorted(n for a, b, *_ in T for n in range(a, b + 1))
    assert cobre == list(range(1, 101)), (nome, [n for n in range(1, 101) if n not in cobre], len(cobre))

T = []   # tabelas
def tab(grupo, id, nome, dado, pg, itens, intro='', perguntas=None, ref=None):
    T.append(dict(grupo=grupo, id=id, nome=nome, dado=dado, pg=pg, itens=itens, intro=intro, perguntas=perguntas or [], ref=ref))

# ───── eventos que abalam o mundo (d8) ─────
EV_Q = {
  1: ['Nomeie uma coisa que era verdade o tempo todo no mundo e que não é mais por causa dessa pessoa ou era.', 'Quem morreu, perdeu ou foi derrotado para abrir caminho? Por que não cedeu voluntariamente? O novo líder ajudou nisso?',
      'Que defeito do líder revolta uma parte da população? Quem fará de tudo para frustrá-lo? E qual a maior virtude dele, e quem o defende por isso?', 'Quem acredita no líder, mas tem dúvidas? Alguém próximo que conhece os medos dele?'],
  2: ['Nomeie uma mudança positiva que o líder trouxe. Ela sobreviveu à morte dele?', 'Qual era o humor do povo sob essa pessoa? Que fato importante ninguém percebeu, e vai aparecer depois?',
      'Quem tenta ocupar o lugar do líder no vazio de poder? Quem conspira contra ele?', 'Nomeie três coisas pelas quais esse líder será lembrado.'],
  3: ['Nomeie um território, espécie ou criatura que dependia da coisa perdida. Como se adaptaram? Tentaram substituir o quê?', 'Quem ou o que é culpado pela perda?', 'Qual a consequência imediata e como isso muda o mundo a longo prazo? Quem sofreu mais? Quem lucrou?'],
  4: ['Nomeie três coisas que os rebeldes querem.', 'Eles tiveram uma vitória, mesmo simbólica. Qual dos três objetivos conquistaram? Quanto tempo isso dura?', 'Qual o custo para a ordem antiga? Alguém dela continua no poder? Se ela continua, como puniu os rebeldes?',
      'Um líder da rebelião, a “cara” da revolução, tem um interesse pessoal escondido. Qual?', 'Que problema existia antes da revolução e continua depois dela?'],
  5: ['Que elemento da invasão os defensores não esperavam ou não conseguem repelir?', 'Algo aconteceu com os primeiros defensores e ninguém quer falar. O quê?', 'Os atacantes têm um motivo que não é óbvio no começo. Qual?', 'Quem virou traidor e quando se voltou contra os seus? Por quê?'],
  6: ['Quem se beneficia mais com a descoberta? Nomeie três benefícios.', 'Quem é diretamente prejudicado?', 'Nomeie três repercussões ou efeitos colaterais. Quem ignora as repercussões?', 'Dois ou três indivíduos ou facções brigam para controlar a descoberta. Quem provavelmente ganha, e o que está disposto a fazer?'],
  7: ['O que causou o cataclismo e onde começou?', 'Um augúrio ou uma série de sinais avisou antes. Descreva o augúrio.', 'Que criatura alertou a população e quem a ouviu?', 'Quem foram os sortudos (ou azarados) que sobreviveram?', 'Como a área ficou depois, em contraste com antes?'],
  8: ['A nova ordem suplantou algum grupo de poder? Quem ou o quê?', 'Para qual público ela apareceu (espécie, classe social)?', 'O líder é conhecido por uma qualidade valorizada pelos seguidores. Qual, e o que ele faz para manter o apoio?', 'Um grupo rival se opõe a ela. Quem, por quê e qual o plano para impedi-la?']}
EV_T = [('Ascensão de uma Grande Personalidade ou de uma Era', 'Eras são definidas por líderes, inovadores e tiranos. Quando sobem ao poder moldam o tempo e o espaço onde vivem.'),
        ('Queda de uma Grande Personalidade ou de uma Era', 'Com a queda de líderes os mapas são redesenhados: leis mudam, costumes novos entram na moda e a atitude do povo muda.'),
        ('Extinção ou Depleção', 'Algo que já existiu no mundo se foi (recurso, espécie, cultura) e a perda causa uma reação em cadeia.'),
        ('Rebelião, Revolução, Destituição', 'Uma pessoa ou grupo derrubou (ou tentou derrubar) o regime dominante. Pode ser pequeno, como uma guilda contra a liderança.'),
        ('Assalto ou Invasão', 'Um grupo se impõe sobre o outro, pela força militar, infiltração ou ocupação. Um assalto pode ser o primeiro passo de uma invasão.'),
        ('Descoberta, Expansão, Invenção', 'Terras, tecnologias, recursos ou ruínas novos mudam as regras do jogo e põem grupos de poder em disputa.'),
        ('Calamidade', 'Terremoto, fome, incêndio, praga, enchente: desastres em grande escala que redesenham mapas e destroem economias.'),
        ('Nova Organização', 'Uma nova ordem, reino, religião, sociedade ou culto surge e abala o mundo com suas ações e doutrinas.')]
tab('mundo', 'evento', 'Eventos que abalam o mundo', 8, 'GN p. 24–28', [[i + 1, i + 1, t, d] for i, (t, d) in enumerate(EV_T)],
    intro='Uma campanha aguenta até três eventos de larga escala: um perto do começo, um do meio e um do fim. Role e tente justificar o resultado: é aí que aparecem as ideias.', perguntas=None)
for i, q in EV_Q.items(): T[-1]['itens'][i - 1].append(q)
tab('mundo', 'personalidade', 'Tipo de personalidade (eventos 1 e 2)', 6, 'GN p. 24', lista('Almirante de Frota', 'Líder do Exército Revolucionário', 'Yonko e Grandes Piratas', 'Almirante e Grandes Marinheiros', 'Membro do Gorosei', 'Oka Shichibukai'))
tab('mundo', 'perdido', 'Extinção ou depleção: recurso perdido (evento 3)', 6, 'GN p. 25', lista('Ilhas Habitáveis', 'Akumas no Mi e Usuários', 'Um Recurso Mineral (gemas, metais, minérios)', 'Um Tipo de Animal (reis dos mares, insetos, peixes)', 'Um Povo (linhagem familiar, clã, cultura, espécie)', 'Um Tipo de Planta (colheita, árvore, erva, floresta)'))
tab('mundo', 'invasor', 'Assalto ou invasão: força invasora (evento 5)', 6, 'GN p. 26', lista('Um empreendimento criminoso', 'Um adversário que já foi derrotado', 'Uma facção dividida', 'Uma tribo selvagem', 'Uma sociedade secreta', 'Um aliado traiçoeiro'))
tab('mundo', 'descoberta', 'Descobertas (evento 6)', 8, 'GN p. 26', lista('Ruína ancestral/Cidade Perdida de uma Espécie Lendária', 'Animal/Monstro/Mutação', 'Invenção/Tecnologia/Arma', 'Novo (ou redescoberto) Artefato', 'Nova Terra (ilha, região, subterrâneo)', 'Povo (espécie, tribo, civilização perdida, colônia)', 'Planta (erva milagrosa, fungo parasita, planta racional)', 'Recurso ou riqueza (ouro, gemas, mitral)'))
tab('mundo', 'calamidade', 'Calamidade (evento 7)', 6, 'GN p. 27', lista('Fome/Seca', 'Incêndio', 'Praga/Doença', 'Impacto Meteórico', 'Desastre Natural Catastrófico (furacão, terremoto, tsunami, erupção vulcânica)', 'Experimento Científico Que Deu Errado'),
    intro='Se o resultado não combinar com o cenário (uma enchente no deserto?), pode rolar de novo, mas justificar o desastre costuma dar ideias melhores.')
tab('mundo', 'organizacao', 'Nova organização (evento 8)', 8, 'GN p. 27', lista('Sindicato do Crime/Confederação de Bandidos', 'Guilda (pedreiros, boticários, ourives)', 'Ordem Militar', 'Nova Dinastia/Tribo/Clã Familiar', 'Filosofia', 'Reino (vila, cidade, ducado, reinado)', 'Escola/Universidade', 'Sociedade/Culto/Cabala Secreta'))
tab('mundo', 'fechados', 'Eventos fechados (objetivos baseados em eventos)', 100, 'GN p. 42', fechados,
    intro='Uma aventura pode ser baseada inteiramente num evento com data marcada, ou o evento pode servir de isca para os jogadores.')

# ───── governo ─────
tab('governo', 'governo', 'Formas de governo', 100, 'GN p. 16–17', gov, intro='Para uma nação ou cidade. Cada forma traz um exemplo do mundo de One Piece.')

# ───── encontros ─────
tab('encontro', 'selvagem', 'Encontros em um ambiente selvagem', 20, 'GN p. 48', lista(
    '1 Pássaro Gigante', '1 Giragon', 'Resquícios de antiga civilização coberta por musgo', '1d4 Cowball', '1d4 Humandrill Jovem liderados por 1 Humandrill Soldado', 'Um doce aroma carregado por uma brisa suave',
    'Uma estátua antiga coberta por vegetação', '1 Wany', '1 Fat Lion', '1 Red Fang', 'Um enxame de insetos surge e assusta os personagens', '1d4 Planta Carnívora Diabólica', '1 Gorila Selvagem', '1 Super Pardal',
    'O chão inteiro desaba e abre um novo ambiente aos personagens', '1 Louva-a-Deus Gigante', '1 Morcego Gigante', '1d4 Golden Bat', '1 Guntai Ari', '1 Leão Gigante'),
    intro='Criaturas com os blocos de estatística no Manual dos Inimigos. Um encontro justo: uma criatura com ND igual ou menor que o nível do grupo, ou um grupo de XP fácil, médio ou difícil. Nem todo encontro precisa virar luta.')
URB = [('Acompanhante', 'Alguém do lugar se interessa amigavelmente pelo grupo. Reviravolta: pode ser um espião mandado para coletar informações.'),
       ('Animais à solta', 'Um ou mais animais inesperados soltos na rua: de babuínos a um urso, tigre ou elefante que fugiu do circo.'),
       ('Anúncio', 'Um arauto, pregador ou louco faz um anúncio na rua. Pode pressagiar um evento (execução pública), dar um decreto real ou trazer um augúrio.'),
       ('Batedor de carteira', 'Um ladrão (use o pirata ardiloso do Manual dos Inimigos) tenta roubar um personagem. Quem tiver Vontade (Percepção) passiva igual ou maior que a Destreza (Prestidigitação) dele pega o gatuno.'),
       ('Bêbado', 'Um bêbado alegre cambaleia até um membro aleatório do grupo, confundindo-o com outra pessoa.'),
       ('Briga', 'Uma briga perto dos aventureiros: de bar, entre gangues rivais ou guardas contra criminosos. Podem ser testemunhas, atingidos ou confundidos com um dos lados.'),
       ('Cadáver', 'Os aventureiros encontram um cadáver humanoide.'),
       ('Espetáculo', 'Entretenimento público: cantor talentoso, circo de rua, marionetes, mágica, visita real ou execução pública.'),
       ('Garoto de rua', 'Um garoto de rua se aproxima e persegue o grupo por todo lado até ser afugentado.'),
       ('Incêndio', 'Um incêndio começa e os personagens podem ajudar a apagar as chamas antes que se espalhem.'),
       ('Transação suspeita', 'Os personagens veem uma transação suspeita entre duas figuras encapuzadas.'),
       ('Valentões', '1d4 + 2 valentões intimidam um forasteiro. Um valentão foge assim que sofrer qualquer dano.')]
tab('encontro', 'urbano', 'Encontros aleatórios urbanos', 12, 'GN p. 63–64', [[i + 1, i + 1, t, d] for i, (t, d) in enumerate(URB)],
    intro='Verifique pelo menos uma vez por dia e uma vez por noite, se os personagens estiverem fora. Role de novo se o resultado não fizer sentido na hora do dia.')
tab('encontro', 'mar', 'Encontros marítimos', 10, 'GN p. 66', [], intro='Ao falhar no Teste de Navegação. Esta é a mesma tabela dos botões da Colinha e da Viagem.', ref='mar')
tab('encontro', 'submerso', 'Encontros aleatórios submersos', 10, 'GN p. 68', lista(
    'Navio afundado coberto por cracas', 'Navio afundado com um baku zame rondando em volta dele (50% de chance de conter tesouro: role a tabela de tesouros)', 'Rei do mar filhote', 'Tubarão de chifres',
    'Campo de ostras gigantes (cada ostra tem 1% de chance de ter uma pérola gigante de ฿ 100.000.000 dentro)', 'Ruína inundada', 'Estátua ou monolito afundado', 'Uma criatura marinha amigável e curiosa', 'Campo de algas enorme', 'Caverna submersa vazia'),
    intro='Pode checar com a mesma frequência dos encontros em terra.')
BAT = [('Evento inesperado', 'Algum dos “Encontros Marítimos” (maremoto, ciclone, tufão) surge no meio da batalha e atrapalha todos, ou ajuda os jogadores ou os inimigos.'),
       ('Tormenta', 'Uma maré turbulenta começa a afastar ou aproximar os inimigos, ou move todos para locais que complicam o combate.'),
       ('Evento de grandes proporções', 'Algo grande muda o rumo da aventura: uma Knock Up Stream manda os jogadores para o céu, uma criatura imensa devora o barco, um maremoto separa o grupo do navio e leva a uma ilha desconhecida.'),
       ('Ataque inesperado', 'Uma imensa criatura marinha ou alada ataca as embarcações inimigas. O grupo decide entre esperar o resultado ou fugir. Se continuar atacando, pode chamar a atenção da criatura.'),
       ('Visão obstruída', 'Neblina densa ou chuva forte cobre tudo. Pode atingir o ambiente todo ou só um lado, deixando quem está fora sem saber o que ocorre e quem está dentro cego.'),
       ('Perigo constante', 'O campo de batalha fica mais perigoso: uma nuvem carregada bombardeia com raios, ou um navio submerso emerge e espalha bombas ou ácido. Testes para a embarcação não sofrer grandes danos.')]
tab('encontro', 'batalha', 'Eventos que modificam a batalha naval', 6, 'GN p. 70', [[i + 1, i + 1, t, d] for i, (t, d) in enumerate(BAT)],
    intro='Role um d6 para ver quanto o evento dura: 10 minutos para cada número do dado.')

# ───── conferência: tudo que foi digitado precisa existir no texto do livro ─────
falhas = []
for t in T:
    for it in t['itens']:
        txt = it[2]
        chave = norm(re.sub(r'\([^)]*\)', '', txt))[:40]
        if chave and chave not in NG and norm(txt) not in NG:
            falhas.append((t['id'], it[0], txt))
print('conferência com o texto do livro: itens não achados =', falhas)
pathlib.Path('/home/claude/mesa/app/data/tabelas_gn.json').write_text(json.dumps(T, ensure_ascii=False, indent=1))
for t in T: print(t['grupo'], t['id'], t['dado'], len(t['itens']))
print(gov[0], '|', gov[-1], '|', len([g for g in gov if g[3]]), 'com descrição')
print(fechados[0], fechados[-1], len(fechados))
