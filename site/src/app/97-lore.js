/* ═══════════ GUIA DE LORE (Blocos 5 e 7): espécies e o mundo ═══════════
   Bloco 7: textos reescritos com o mundo de One Piece (o que se sabe pela obra, com a página da One Piece Wiki) e o Livro do Jogador 2.1 (LJ, com a página).
   A campanha começa ANTES da Guerra dos Maiorais (Marineford): onde a wiki fala do "agora" do mangá, o texto avisa.
   Cada texto: [rótulo, frase] em linhas curtas, para ler rápido. */
const LORE_ESP = {
  humanos: { t: 'Humanos', pg: 'LJ p. 22–24 · Wiki', ic: 'especies:humano', f: 'Humans', l: [
    ['No mundo', 'A maior parte das pessoas do mundo. Vivem em quase todas as ilhas, dos quatro Blues ao Novo Mundo, e cada ilha tem seu jeito: reinos, vilas de pescadores, cidades de comércio, tribos isoladas.'],
    ['Como pensam', 'De tudo um pouco: heróis, tiranos, sonhadores e covardes. Muitos crescem ouvindo que pirata é bandido e que a Marinha é a justiça, mas cada ilha conta essa história de um jeito.'],
    ['Preconceito', 'São a espécie “padrão” do mundo, e é deles que vem quase todo o preconceito contra homens-peixe, minks e outras espécies (LJ p. 160).'],
    ['Tribos', 'Braços Longos e Pernas Longas (tribos rivais), Pescoço de Cobra, Três Olhos e humanos enormes, os humanozarrões (passam de 8 m).'],
    ['Kujas', 'Guerreiras de Amazon Lily, uma ilha só de mulheres no Calm Belt, onde homem não entra. A imperatriz é Boa Hancock, uma dos Sete Corsários.', 'Kuja'],
    ['Nomes conhecidos', 'Monkey D. Luffy, Roronoa Zoro, o Almirante de Frota Sengoku, o Vice-Almirante Garp e o espadachim Dracule Mihawk.'],
    ['Ideias', 'Ilha pobre que não paga o Tributo Celestial; filho de uma tribo em guerra com outra; alguém que cresceu longe do Governo; nobre de um reino pequeno.'],
    ['No sistema', 'Preconceito: inexistente. Kujas só nascem mulheres e pedem a dificuldade “Aspectos Humanos”.']] },
  anoes: { t: 'Anões (Tontattas)', pg: 'LJ p. 16 · Wiki', ic: 'especies:anao', f: 'Dwarves', l: [
    ['O que é', 'Gente muito pequena (10 a 15 cm), de cabeça grande e cauda peluda, mas fortíssima e rápida para o tamanho: um anão carrega coisas muitas vezes maiores que ele.'],
    ['De onde vem', 'O Reino Tontatta fica em Green Bit, uma ilha ao lado de Dressrosa, no Novo Mundo. É pequeno (pouco mais de mil pessoas), com rei, princesa e um exército próprio, o Tonta Corps, que monta insetos.'],
    ['História', 'Há uns 900 anos, a família Donquixote, que governava Dressrosa, escravizou os anões. A família Riku os libertou e deixou que eles “peguem emprestado” o que precisam da cidade. Por isso o povo de Dressrosa acredita em fadas que somem com as coisas.'],
    ['Como pensa', 'Ingênuos e honestos: acreditam em quase tudo o que ouvem. Chamam os humanos de “grandes humanos” e logo perguntam se a pessoa é boa ou má.'],
    ['Nomes conhecidos', 'Leo, do Tonta Corps; a princesa Mansherry, que cura com o poder de uma Akuma no Mi; o rei Gancho.'],
    ['Ideias', 'Quem saiu do reino para ver o mundo; um anão que “pega emprestado” sem entender que é errado; alguém que fugiu de um trabalho escondido e forçado.'],
    ['No sistema', 'Preconceito: débil. Armas de fogo ou à distância deles causam metade do dano.']] },
  celestiais: { t: 'Celestiais', pg: 'LJ p. 18–19 · Wiki', ic: 'especies:skypean', f: 'Skypieans', l: [
    ['O que é', 'Os povos das ilhas do céu: humanos com asinhas nas costas, que não servem para voar. São três: Skypeans, Shandians e Birkans.'],
    ['De onde vem', 'Do Mar Branco (7.000 m) e do Mar Branco-Branco (10.000 m), mares de nuvens acima do mar azul. A ilha mais famosa é Skypiea. Ao lado fica Upper Yard, um pedaço da ilha de Jaya que foi jogado para o céu por um Knock Up Stream há uns 400 anos.'],
    ['Skypeans', 'Povo pacato e cheio de leis. Usam dials (conchas que guardam vento, luz, som ou impacto) no dia a dia e cumprimentam dizendo “Heso!”.'],
    ['Shandians', 'Guerreiros com pinturas no corpo, descendentes de Shandora, a cidade de ouro que subiu junto com o pedaço de Jaya. Brigaram 400 anos com os Skypeans por Upper Yard.', 'Shandia'],
    ['Birkans', 'Vinham de Birka, outra ilha do céu, muito religiosa. Enel, que se dizia “Deus” e dominou Skypiea por seis anos, era de lá, e destruiu a própria terra.', 'Birkans'],
    ['Como pensa', 'Chamam os humanos de “povo do mar azul” e os tratam como turistas. Para eles, terra de verdade é raríssima e valiosa: chamam de “Vearth”.'],
    ['Ideias', 'Shandian que desceu para conhecer o mar de verdade; skypean que sonha ver o mar azul; birkan sem casa desde que Birka foi destruída.'],
    ['No sistema', 'Preconceito: débil. Começam com alguns dials.']] },
  gigantes: { t: 'Gigantes', pg: 'LJ p. 20 · Wiki', ic: 'especies:gigante', f: 'Giants', l: [
    ['O que é', 'Humanos enormes, de 13 a 20 m (alguns passam disso). Vivem pelo menos três vezes mais que um humano: com 150 anos, um gigante ainda está em forma.'],
    ['De onde vem', 'A maioria vem de Elbaf, a “terra dos guerreiros”, no Novo Mundo: uma ilha de árvores do tamanho de montanhas e cultura parecida com a dos vikings.', 'Elbaph'],
    ['Como pensa', 'Honra acima de tudo. Briga se resolve de frente, sem truque. Morrer em batalha com glória é o melhor destino; morrer com vergonha é o pior. Dizem que os deuses de Elbaf julgam quem foi corajoso.'],
    ['Gigantes Antigos', 'Já existiram gigantes muito maiores, os Gigantes Antigos. O mais famoso é Oars, de séculos atrás. Hoje se acredita que estão extintos.'],
    ['Na Marinha', 'São a única espécie não humana aceita na Marinha. Há vice-almirantes gigantes, como John Giant, e os portões de Enies Lobby eram guardados pelos gigantes Oimo e Kashi.'],
    ['Nomes conhecidos', 'Dorry e Brogy, de Elbaf, que duelam há 100 anos na ilha pré-histórica de Little Garden; Little Oars Jr., aliado do Barba Branca.'],
    ['Ideias', 'Gigante que nasceu longe de Elbaf; guerreiro que fugiu de um duelo e quer limpar o nome; gigante que serviu na Marinha e desertou.'],
    ['No sistema', 'Preconceito: inexistente. Só usam armas do seu tamanho: um ferreiro cobra 10 vezes o valor.']] },
  lunarianos: { t: 'Lunarianos', pg: 'LJ p. 25–26 · Wiki', ic: 'especies:lunariano', f: 'Lunarians', l: [
    ['O que é', 'Pele morena, cabelo branco, grandes asas negras e uma chama acesa nas costas.'],
    ['Poder', 'Com a chama acesa, aguentam golpes que matariam qualquer um. Quando a chama apaga, ficam mais rápidos, mas vulneráveis. Também sobrevivem a calor e a lugares quase sem ar.'],
    ['De onde vem', 'Moravam no alto da Red Line, numa terra chamada “Reino dos Deuses”, muito antes do Governo Mundial. Quase todos sumiram, e ninguém sabe ao certo por quê.'],
    ['O que se sabe', 'Quase nada, e é de propósito: o Governo Mundial apaga os rastros deles e caça os sobreviventes. O Governo paga ฿ 100.000.000 só por pistas de um lunariano e usa os que pega como cobaia.'],
    ['Nome conhecido', 'King, braço direito de Kaido, é um lunariano, mas esconde isso atrás de uma máscara.'],
    ['Ideias', 'Cresceu escondido sem saber o que é; usa capuz e identidade falsa; já foi cobaia do Governo.'],
    ['No sistema', 'Preconceito: medíocre. A cultura deles é um mistério: a sua versão é livre, mas passa pelo Narrador.']] },
  minks: { t: 'Minks', pg: 'LJ p. 28–29 · Wiki', ic: 'especies:mink', f: 'Minks', l: [
    ['O que é', 'Povo de corpo de animal (qualquer mamífero), com pelo e muita força. Já nascem guerreiros. As fêmeas costumam parecer mais humanas.'],
    ['De onde vem', 'De Zou, uma ilha nas costas de Zunesha, um elefante gigante que anda pelo mar do Novo Mundo há mais de mil anos. Pouca gente sabe chegar lá, porque Zou nunca para no mesmo lugar.', 'Zou'],
    ['Governo', 'O Ducado de Mokomo tem dois líderes: o Duque Inuarashi (um cão) governa de dia e o Mestre Nekomamushi (um gato) governa de noite.'],
    ['Como pensa', 'Orgulhosos, leais e muito carinhosos: cumprimentam encostando o rosto e dizendo “Garchu!”. Chamam os humanos de “minks sem pelo” e não perdoam quem trai um amigo.'],
    ['Poderes', 'Electro: todo mink solta eletricidade pelo corpo, sem precisar de Akuma no Mi. Alguns, ao olhar a lua cheia, viram Sulong: ficam enormes, de pelo branco, e perdem o controle se não treinarem.'],
    ['Laços', 'Os Minks são irmãos de sangue da família Kozuki, de Wano, e guardam segredos ligados a ela.'],
    ['Nomes conhecidos', 'Pekoms, do bando da Big Mom; Inuarashi e Nekomamushi; os guerreiros Pedro e Carrot.'],
    ['Ideias', 'Mink que saiu de Zou atrás de alguém; mink criado longe do seu povo; família caçada por quem vende “animais raros”.'],
    ['No sistema', 'Preconceito: medíocre. Variantes Ágil, Meão e Robusto. O Sulong pede o treinamento “Leão da Lua” para manter a consciência.']] },
  mar: { t: 'Povo do Mar', pg: 'LJ p. 30–31 · Wiki', ic: 'especies:homem_peixe', f: 'Fish-Men', l: [
    ['O que é', 'Homens-peixe (gente com traços de peixe: barbatanas, guelras, dentes afiados) e sireianos (sereias e tritões, com cauda). Respiram no ar e na água e são, em média, 10 vezes mais fortes que um humano, ainda mais debaixo d’água.'],
    ['De onde vem', 'Da Ilha dos Homens-Peixe, a 10.000 m de profundidade, embaixo da Red Line, dentro de uma bolha gigante. É o Reino Ryugu, do rei Netuno. Quem vai ao Novo Mundo por baixo passa por lá.', 'Fish-Man_Island'],
    ['Sereias', 'Têm cauda até os 30 anos, quando ela se divide e passa a funcionar como pernas. São o alvo preferido dos traficantes de escravos de Sabaody.', 'Merfolk'],
    ['História', 'Por séculos foram tratados como peixe e vendidos como escravos. Há uns 200 anos o reino entrou para o Governo Mundial, mas o preconceito continua. O homem-peixe Fisher Tiger escalou a Red Line, libertou escravos de Mary Geoise e fundou os Piratas do Sol.'],
    ['Como pensa', 'Muitos guardam medo ou raiva dos humanos por causa da opressão. Outros, como a rainha Otohime (já falecida), lutaram pela convivência.'],
    ['Nomes conhecidos', 'Jinbe, dos Sete Corsários, mestre do Caratê Homem-Peixe; Arlong, que dominou ilhas do East Blue; Hachi, que vende takoyaki em Sabaody.'],
    ['Ideias', 'Ex-escravo com a marca dos Tenryuubitos; homem-peixe de um animal específico (tubarão, polvo, baiacu); sereia com medo da superfície; filho de um pirata do Sol.'],
    ['No sistema', 'Preconceito: severo. O Caratê Homem-Peixe é um Estilo de Combate (LJ p. 61).']] },
  oni: { t: 'Oni', pg: 'PDF Espécie Oni 2.0 · Wiki', ic: icOu('especies2:oni_guerreiro', 'especies:gigante'), f: 'Oni', l: [
    ['O que é', 'Na língua de Wano, “oni” quer dizer demônio ou ogro: um ser enorme, com chifres, força absurda e fama de beber e brigar. Em algumas traduções do mangá, “oni” vira “ogro”, e por isso o arquivo do sistema fala em Ogros.'],
    ['O que o mangá mostra', 'Não existe um “povo Oni” confirmado. Existem pistas: Kaido, um dos Quatro Imperadores, tem chifres de verdade, e Yamato, que se apresenta como filho de Kaido, também. Kaido diz que os dois têm “sangue de oni”. A ficha oficial deles não diz a espécie: é um mistério de propósito.', 'Kaidou'],
    ['As lendas', 'Em Wano, os oni são do folclore. Perto de Wano fica Onigashima, a “Ilha dos Ogros”, com uma rocha em forma de caveira; hoje é a base dos Piratas das Feras, de Kaido. O kanabo, bastão de ferro com cravos, é a arma clássica de um oni e é também a arma de Kaido.', 'Onigashima'],
    ['Pistas em Elbaf', 'Depois da guerra, o mangá mostrou em Elbaf crânios com chifres de mestiços de gigante com Gigante Antigo, e contou que o rei Harald tinha chifres e mandou arrancá-los. Muitos leitores acham que os oni descendem dos Gigantes Antigos, mas isso não está confirmado.', 'Elbaph'],
    ['Como o mundo vê', 'Como algo saído de lenda. Fora de Wano, um oni chama atenção em qualquer porto: é confundido com gigante pequeno, com mestiço ou com “monstro”, e vira boato.'],
    ['No sistema', 'Tamanho Grande (3 a 6 m), 120 a 800 kg, PV base 18, deslocamento 9 m. Preconceito: débil. Ganha o treinamento Guerreiro Nato, Sangue de Guerreiro e a dificuldade Fúria Sanguinária. Regras completas no Catálogo.'],
    ['Ideias', 'Nasceu com chifres numa ilha onde ninguém viu outro igual; fugiu de Wano ou de Onigashima; foi caçado ou estudado pelo Governo por ser “diferente”; procura a origem do próprio sangue (Wano? Elbaf?).'],
    ['Cuidado', 'Como o mangá não define um povo oni, o resto (terra natal, cultura, quantos existem) é decisão do Narrador.']] },
  mesticos: { t: 'Mestiços', pg: 'LJ p. 27 · Wiki', ic: icOu('especies2:mestico_mink', 'especies:bucaneiro'), f: 'Charlotte_Family', l: [
    ['No mundo', 'Mestiços existem em todo canto e costumam sofrer preconceito dos dois lados. A família Charlotte, da Big Mom, tem filhos de muitas espécies diferentes.'],
    ['Regra', 'Um personagem com duas espécies. PV base é a média das duas. Tamanho é a média dos menores valores. Escolhe 1 benefício de cada espécie e 1 dificuldade. Só aprende 1 treinamento de cada lista de espécie. Preconceito: o maior das duas.'],
    ['Ideias', 'Filho de duas culturas que não se sente em casa em nenhuma; herdeiro de um poder raro (Electro, a chama lunariana, o tamanho de gigante).']] },
  raras: { t: 'Variações raras', pg: 'LJ p. 32 · Wiki', ic: icOu('especies2:lunariano_encapuzado', 'especies:filho_noite'), f: 'Buccaneers', l: [
    ['Regra', 'Troca um benefício da espécie. Você só pode ter uma.'],
    ['Bucaneiro', 'Um povo antigo, de corpo enorme e resistente, que o Governo caçou até quase sumir. No sistema: mente impossível de controlar. (No mangá, Bartholomew Kuma é um bucaneiro, o que só foi revelado bem depois da guerra.)'],
    ['Experimento Científico', 'Corpos mudados pela ciência, como os Pacifistas do Dr. Vegapunk. No sistema: corpo modificado, mas desvantagem em Atuação, Intuição e Persuasão.'],
    ['Filho da Noite', 'Pode comer mais de uma Akuma no Mi sem morrer. No mangá, só o Barba Negra fez isso, e ninguém sabe explicar como. Fale com o Narrador antes: pode mudar muito a campanha.']] }
};
/* espécie do sistema (ícone do site) → texto */
const ESP_TXT = { humano: 'humanos', bracos_longos: 'humanos', pernas_longas: 'humanos', pescoco_cobra: 'humanos', kuja: 'humanos', anao: 'anoes', skypean: 'celestiais', birkan: 'celestiais', shandian: 'celestiais',
  gigante: 'gigantes', lunariano: 'lunarianos', mink: 'minks', homem_peixe: 'mar', sereia: 'mar', bucaneiro: 'raras', filho_noite: 'raras' };
/* o mundo. f = página da wiki usada (quando o texto vem dela) */
const LORE_MUNDO = [
  { t: 'Linha do tempo até a guerra', pg: 'Wiki', ic: 'modos:ampulheta', f: 'Timeline', l: [
    ['Há uns 900 anos', 'O Século Perdido: cem anos que foram apagados da história. Estudar esse período é crime.'],
    ['Há 800 anos', 'Vinte reinos se unem e fundam o Governo Mundial.'],
    ['Há pouco mais de 20 anos', 'Gol D. Roger, o Rei dos Piratas, é executado. Antes de morrer, diz que deixou seu tesouro, o One Piece, em algum lugar. Começa a Grande Era dos Piratas.'],
    ['Na mesma época', 'Ohara, a ilha dos arqueólogos, é apagada do mapa por um Buster Call.'],
    ['Anos depois', 'Fisher Tiger escala a Red Line e liberta escravos de Mary Geoise.'],
    ['Nos últimos anos', 'Uma geração de novatos abala os mares. Monkey D. Luffy sai do East Blue e, em pouco tempo, derrota um dos Sete Corsários e invade Enies Lobby.'],
    ['Agora', 'O mundo está à beira da Guerra dos Maiorais, o maior confronto da era entre a Marinha e os piratas. A campanha começa pouco antes dela; o que vocês vão ver dessa guerra, a mesa conta.'],
    ['Na nossa mesa', 'Algumas pessoas da obra não existem na nossa campanha e alguns fatos mudam. O Narrador confirma o que vale.']] },
  { t: 'Governo Mundial e Tenryuubitos', pg: 'LJ p. 24 · Wiki', ic: 'trip:governo', f: 'World_Government', l: [
    ['O que é', 'Criado há 800 anos por 20 reinos aliados, logo depois do Século Perdido. Hoje mais de 170 países fazem parte: pagam o Tributo Celestial e recebem a proteção da Marinha.'],
    ['Quem fica de fora', 'Ilhas pobres que não pagam o tributo ficam sem proteção, à mercê de piratas. Países fechados, como Wano, também ficam de fora.'],
    ['Os Cinco Anciões', 'Os Gorosei: cinco velhos que são a maior autoridade conhecida do Governo. Trabalham no Castelo Pangaea, em Mary Geoise.'],
    ['Tenryuubitos', 'Os Nobres Mundiais, ou Dragões Celestiais: descendentes de 19 das 20 famílias fundadoras. Estão acima da lei e podem escravizar ou matar quem quiserem. Usam capacete de bolha para não respirar o mesmo ar do povo. Atacar um deles faz um Almirante aparecer.', 'World_Nobles'],
    ['A família que ficou', 'Das 20 famílias fundadoras, só os Nefertari, de Alabasta, não foram morar em Mary Geoise.'],
    ['Reverie', 'A cada 4 anos, os reis dos países membros se reúnem em Mary Geoise para decidir o rumo do mundo.'],
    ['O que esconde', 'O Século Perdido. Ler Poneglyph pode dar pena de morte, e foi por isso que Ohara foi destruída.']] },
  { t: 'Mary Geoise', pg: 'Wiki', ic: 'ilhas2:fortaleza', f: 'Mary_Geoise', l: [
    ['O que é', 'A “Terra Sagrada”, no alto da Red Line, a uns 10.000 m de altura. É a capital do Governo Mundial e a casa dos Tenryuubitos.'],
    ['Como é', 'Palácios, jardins e o Castelo Pangaea, onde trabalham os Cinco Anciões. Lá em cima só ficam nobres, guardas, servos e escravos.'],
    ['Escravos', 'Os Tenryuubitos compram escravos de qualquer espécie (muitos no leilão de Sabaody) e marcam a pele deles com o símbolo dos Dragões Celestiais. Quem foge carrega a marca para sempre.'],
    ['Atravessar a Red Line', 'Por cima, só passando por Mary Geoise com licença e deixando o navio para trás. Por baixo, descendo até a Ilha dos Homens-Peixe.']] },
  { t: 'Marinha', pg: 'LJ p. 24 · Wiki', ic: 'trip:marinha', f: 'Marines', l: [
    ['O que é', 'A força militar do Governo Mundial: caça piratas e criminosos e protege os países membros. Tem bases em todos os mares; o Quartel-General fica em Marineford, na Grand Line, perto de Sabaody.'],
    ['Quem manda', 'O Almirante de Frota Sengoku, “o Buda”; os três Almirantes: Akainu, Aokiji e Kizaru; e vice-almirantes como Garp, “o Herói da Marinha”.'],
    ['Postos', 'Do mais alto ao mais baixo: Almirante de Frota, Almirante, Vice-Almirante, Contra-Almirante, Comodoro, Capitão, Comandante, Tenente e os praças, até o recruta.'],
    ['Justiça', 'Cada marinheiro tem a sua. A “Justiça Absoluta” de Akainu acha certo destruir tudo para pegar um criminoso; outros, como Garp e Smoker, fazem do próprio jeito.'],
    ['Buster Call', 'Ataque de 10 navios de guerra com 5 vice-almirantes que apaga uma ilha do mapa. Só um Almirante (ou alguém com a autorização dele) pode chamar.'],
    ['Na mesa', 'Quartéis e frotas têm força e ND no LJ p. 301–302 (Combates de Tripulação).']] },
  { t: 'Três Grandes Poderes', pg: 'LJ p. 301 · Wiki', ic: 'trip:imperadores', f: 'Three_Great_Powers', l: [
    ['O que é', 'As três forças que seguram o equilíbrio do mundo: o QG da Marinha, os Quatro Imperadores e os Sete Corsários.'],
    ['Os Quatro Imperadores', 'Os piratas mais fortes do mundo, que mandam no Novo Mundo como reis. Antes da guerra: Barba Branca (Edward Newgate), Kaido das Cem Feras, Big Mom (Charlotte Linlin) e Shanks, o Ruivo.', 'Four_Emperors'],
    ['Os Sete Corsários', 'Piratas com licença do Governo: ajudam quando chamados e, em troca, têm a recompensa cancelada. Antes da guerra: Dracule Mihawk, Boa Hancock, Bartholomew Kuma, Gecko Moria, Donquixote Doflamingo, Jinbe e o Barba Negra, que ficou com o lugar de Crocodile.', 'Seven_Warlords_of_the_Sea'],
    ['No sistema', 'Recompensa de ฿ 500.000.000 pode trazer convite para Corsário; ฿ 2.000.000.000, fama de Imperador.'],
    ['Depois', 'O que muda depois da guerra (quem cai, quem entra) depende da sua mesa.']] },
  { t: 'Exército Revolucionário', pg: 'Wiki', ic: 'trip:revolucionarios', f: 'Revolutionary_Army', l: [
    ['O que é', 'Uma organização que quer derrubar o Governo Mundial e os Nobres Mundiais. Age em segredo, ajudando revoltas em países governados por tiranos.'],
    ['Quem lidera', 'Monkey D. Dragon, “o pior criminoso do mundo”, filho de Garp e pai de Luffy. Quase nada se sabe sobre ele.'],
    ['Nomes conhecidos', 'Emporio Ivankov, o rei dos okamas, e Bartholomew Kuma, que também é um dos Sete Corsários.'],
    ['Base', 'Baltigo, uma ilha escondida na Grand Line.'],
    ['Ideias', 'Personagem salvo por revolucionários; espião infiltrado num reino; alguém que fugiu de um rei cruel.']] },
  { t: 'Cipher Pol', pg: 'LJ p. 24 · Wiki', ic: 'trip:cipher_pol', f: 'Cipher_Pol', l: [
    ['O que é', 'Agências secretas do Governo: investigação, espionagem e assassinato. O alvo são ameaças políticas, não bandidos comuns.'],
    ['Unidades', 'CP1 a CP8 são oficiais. A CP9 (assassinos com licença para matar, que trabalhavam em Enies Lobby) e a CP0 (a mais forte, a serviço direto dos Nobres Mundiais) não existem oficialmente.'],
    ['Rokushiki', 'As seis técnicas sobre-humanas dos agentes (Soru, Tekkai, Shigan, Geppo, Rankyaku, Kami-e), treinadas desde a infância. No sistema é um Estilo de Combate (LJ p. 101).'],
    ['Ohara', 'Há pouco mais de 20 anos, a CP9 investigou Ohara, e o Governo apagou a ilha com um Buster Call. Nico Robin, ainda criança, foi a única sobrevivente conhecida.']] },
  { t: 'Recompensas e caçadores', pg: 'LJ p. 139 e 301', ic: 'trip:cacadores', l: [
    ['Cartaz', 'A recompensa diz quanto o Governo paga pela captura. Quanto maior, mais longe a fama chega: ฿ 10 milhões, a Marinha toda conhece; ฿ 30 milhões, a sua terra natal; ฿ 50 milhões, o seu Blue; ฿ 100 milhões, todos os Blues; ฿ 300 milhões, Paradise; ฿ 700 milhões, o Novo Mundo.'],
    ['O lado bom', 'Acesso a salas melhores do Mercado Negro (do Salão Principal à Ala S), uma tripulação mais forte, respeito de outros piratas e uma Marinha mais cautelosa.'],
    ['O lado ruim', 'Piratas rivais e caçadores de recompensa viram ameaça constante, e a Marinha manda gente mais forte.'],
    ['Caçadores', 'Caçar piratas é profissão (LJ p. 139). Roronoa Zoro ficou famoso como “caçador de piratas” no East Blue antes de virar pirata.']] },
  { t: 'O mapa do mundo', pg: 'LJ p. 280–281', ic: 'mar:ilha', l: [
    ['Red Line', 'Um continente em anel que dá a volta no mundo. No alto fica Mary Geoise. Para passar: pedir licença em Mary Geoise (deixando o navio) ou descer por baixo, pela Ilha dos Homens-Peixe.'],
    ['Os quatro Blues', 'East, West, North e South Blue: os mares mais calmos, onde quase todo mundo começa.'],
    ['Reverse Mountain', 'Duas montanhas com uma corrente que sobe. É por ali que os piratas entram na Grand Line.'],
    ['Calm Belt', 'Dois mares sem vento e sem corrente dos lados da Grand Line, cheios de Reis dos Mares. Sem equipamento especial, nenhum navio passa.'],
    ['Grand Line', 'O “cemitério de piratas”: clima maluco e ilhas perigosas. Só dá para navegar com Log Pose. A primeira metade (Paradise) tem 7 rotas que terminam no Arquipélago Sabaody.'],
    ['Novo Mundo', 'A segunda metade, depois da Red Line. Clima que muda o tempo todo; precisa do Log Pose de 3 agulhas. Só Gol D. Roger chegou ao fim.'],
    ['Ilhas do céu', 'Mar Branco (7.000 m) e Mar Branco-Branco (10.000 m), feitos de nuvens. Chega-se por um Knock Up Stream ou por rotas perigosas; Heaven’s Gate cobra 1 milhão de extol.']] },
  { t: 'Arquipélago Sabaody', pg: 'Wiki', ic: 'ilhas2:arvore', f: 'Sabaody_Archipelago', l: [
    ['O que é', 'Um arquipélago de 79 árvores gigantes (mangues) no fim da primeira metade da Grand Line, logo antes da Red Line. Das raízes saem bolhas de resina que flutuam pelo ar.'],
    ['Para que serve', 'É a parada obrigatória antes do Novo Mundo: lá os navios são revestidos com resina para descer até a Ilha dos Homens-Peixe. O serviço leva uns 3 dias.'],
    ['Perigos', 'As árvores de número baixo não têm lei. Lá ficam o Leilão de Humanos e muitos traficantes. Os Tenryuubitos fazem compras ali, e o QG da Marinha fica bem perto.'],
    ['Nome conhecido', 'Silvers Rayleigh, o “Rei das Trevas”, braço direito de Gol D. Roger, vive ali discretamente, revestindo navios.'],
    ['Ideias', 'Personagem que já foi vendido no leilão; revestidor de navios; quem trabalhou nos bares do arquipélago.']] },
  { t: 'Impel Down', pg: 'Wiki', ic: 'ilhas:prisao', f: 'Impel_Down', l: [
    ['O que é', 'A grande prisão do Governo Mundial, embaixo do mar, no Calm Belt. É feita para ninguém sair.'],
    ['Andares', 'Cinco andares para baixo, cada um pior: o inferno carmesim (floresta de lâminas), o das feras, o da fome, o das chamas e o do gelo. Existe um sexto, secreto, para os criminosos que o mundo deve esquecer.'],
    ['Quem manda', 'O diretor Magellan, que comeu a fruta do veneno.'],
    ['Na mesa', 'Ser preso ali é quase o fim de um personagem. Ser solto ou fugir vira história para a vida inteira.']] },
  { t: 'Wano', pg: 'LJ p. 107 · Wiki', ic: 'ilhas:samurai', f: 'Wano_Country', l: [
    ['O que é', 'Um país fechado no Novo Mundo, cercado de penhascos e cachoeiras. Não faz parte do Governo Mundial, e a Marinha não entra lá por causa dos samurais.'],
    ['Samurais', 'Guerreiros de honra que lutam com katana, famosos no mundo inteiro. Alguns saíram de Wano e ensinaram seus costumes pelos mares (LJ p. 107).'],
    ['Quem manda', 'Um shogun. De fora, quase nada se sabe do que acontece lá dentro. Kaido mantém sua base em Onigashima, ao lado do país.'],
    ['Cultura', 'Lembra o Japão antigo: castelos, kimonos, samurais e ninjas. Muitas das espadas mais famosas do mundo (as meito) foram forjadas lá.'],
    ['Ideias', 'Samurai errante que deixou Wano; alguém treinado por um; ronin sem senhor.']] },
  { t: 'Os Supernovas', pg: 'Wiki', ic: 'trip:notoriedade', f: 'Worst_Generation', l: [
    ['O que é', 'Novatos com recompensa acima de ฿ 100.000.000 que chegaram a Sabaody ao mesmo tempo, pouco antes da guerra. A imprensa os chamou de Supernovas.'],
    ['Na nossa mesa', 'Alguns nomes da obra não existem na campanha. Quem está no jogo, o Narrador conta. Uma nova geração pode surgir, e vocês podem fazer parte dela.']] },
  { t: 'Reis dos Mares', pg: 'Wiki', ic: 'bestiario:rei_mares', f: 'Sea_King', l: [
    ['O que é', 'Monstros marinhos enormes e carnívoros. Uns engolem um homem inteiro; outros são maiores que ilhas. Quando escolhem a presa, não largam.'],
    ['Onde', 'Em todos os mares, mas principalmente no Calm Belt.'],
    ['Como escapar', 'Casco revestido de Kairoseki: o navio “parece mar” para eles. A proteção não é para sempre.'],
    ['Na mesa', 'O Engenheiro pode revestir o casco com Kairoseki, se tiver o material (LJ p. 145).']] },
  { t: 'Akuma no Mi', pg: 'LJ p. 190–191 · Wiki', ic: 'itensop:akuma_no_mi', f: 'Devil_Fruit', l: [
    ['O que é', 'Frutos misteriosos, com desenhos de espiral na casca, que dão um poder a quem morde. Ninguém sabe de onde vêm; dizem que são “frutos do diabo do mar”.'],
    ['Tipos', 'Paramecia (poderes variados no corpo ou em volta dele), Zoan (vira um animal; as Ancestrais e as Míticas são as mais raras) e Logia (vira um elemento, como fogo, areia ou luz).'],
    ['Como funciona', 'Uma mordida basta, e o gosto é horrível. Só existe uma de cada ao mesmo tempo: quando o usuário morre, ela renasce em outra fruta. Comer duas mata (salvo raríssimas exceções).'],
    ['Valor', 'São raras: a maioria das pessoas passa a vida sem ver uma. No mercado, uma fruta vale pelo menos ฿ 100.000.000.'],
    ['Fraquezas', 'Água do mar (o usuário afunda e fica Enfraquecido), Kairoseki e, para Logias, Haki do Armamento e inimigos naturais (água contra areia, por exemplo).'],
    ['No sistema', 'Você cria os poderes com o Narrador usando o capítulo 6. Comer a fruta depois do 1º nível pede 1 hora de adaptação por nível para somar a Proficiência.']] },
  { t: 'Haki', pg: 'LJ p. 230 · Wiki', ic: 'poderes:aura', f: 'Haki', l: [
    ['O que é', 'A força de vontade de cada ser vivo. Todos têm, mas quase ninguém desperta. No Novo Mundo, quem não usa Haki não sobrevive muito.'],
    ['Os três tipos', 'Observação (sentir presenças e prever golpes), Armamento (endurecer o corpo e acertar até quem é Logia) e o Haki do Rei (dobrar a vontade dos outros; só um em milhões nasce com ele).'],
    ['No sistema', 'Desperta no 8º nível (5 Pontos de Ambição, depois +12 por nível) ou antes, se o Narrador decidir (despertar prematuro: 2 PA na hora e +2 por nível).']] },
  { t: 'Poneglyphs', pg: 'LJ p. 137 · Wiki', ic: 'ilhas:ruinas', f: 'Poneglyph', l: [
    ['O que é', 'Cubos de pedra indestrutível com a escrita antiga, espalhados pelo mundo. Só o povo de Ohara sabia ler; hoje, até onde se sabe, só Nico Robin.'],
    ['Tipos', 'Históricos (CD 20): a história e o Século Perdido. Instrutivos (CD 25): onde há outros Poneglyphs e armas antigas. Caminho (CD 30): são 4 e mostram o caminho para Laugh Tale.'],
    ['Falhou?', 'Estude 3 dias e tente de novo com CD 5 menor.'],
    ['Cuidado', 'Ler Poneglyph é pesquisar o Século Perdido: crime punido com a morte.']] },
  { t: 'Navegar e falar', pg: 'LJ p. 249', ic: 'itensop:log_pose', l: [
    ['Log Pose', 'Bússola da Grand Line. Grava o campo magnético da ilha (de 1 dia a 1 semana) e aponta para a próxima. ฿ 50.000.'],
    ['Eternal Pose', 'Aponta sempre para uma ilha só. ฿ 300.000.'],
    ['Log Pose de 3 agulhas', 'Para o Novo Mundo; a agulha mais firme mostra a ilha mais segura. ฿ 500.000.'],
    ['Den Den Mushi', 'Caracol-telefone. Padrão (longe), Bebê (mesma ilha), Câmera, Branco (grampo, Mercado Negro), Preto (de espião).'],
    ['Vivre Card', 'Papel feito com um pedaço da pessoa (unha, cabelo). Aponta para o dono e queima quando ele está mal; some se ele morre.'],
    ['Dials', 'Conchas das ilhas do céu que guardam vento, luz, som, calor ou impacto. Celestiais começam com alguns.']] }
];
let loreAberto = null;
const loreBloco = (o, id) => `<article class="lore-c ${loreAberto === id ? 'on' : ''}" id="lore-${id}">
  <button class="lore-cab" data-act="lore-abre" data-id="${id}" aria-expanded="${loreAberto === id}">${ic(o.ic, 48)}<span><b>${esc(o.t)}</b><small>${esc(o.pg)}</small></span><i aria-hidden="true">${loreAberto === id ? '▾' : '▸'}</i></button>
  ${loreAberto === id ? `<dl class="lore-dl">${o.l.map(([r, t, w]) => `<dt>${esc(r)}</dt><dd>${esc(t)}${w ? ` <a href="${WIKI(w)}" target="_blank" rel="noopener">(Wiki)</a>` : ''}</dd>`).join('')}</dl>
    ${o.f ? `<p class="nota">Fonte: <a href="${WIKI(o.f)}" target="_blank" rel="noopener">One Piece Wiki: ${esc(o.f.replace(/_/g, ' '))}</a>${/LJ/.test(o.pg) ? ' e Livro do Jogador 2.1' : /PDF/.test(o.pg) ? ' e o PDF da espécie (OP RPG)' : ''}.</p>` : '<p class="nota">Fonte: Livro do Jogador 2.1.</p>'}` : ''}</article>`;
VIEWS.guia.render = function () {
  const especies = Object.entries(LORE_ESP), busca = sem(VIEWS.guia.busca || '');
  const casa = o => !busca || sem(o.t + ' ' + o.l.map(x => x.join(' ')).join(' ')).includes(busca);
  return `<div class="guia-v"><h1>${ic('modos:wiki', 64)}Guia de lore</h1>
    <p class="nota">Para escrever a lore do seu personagem. Cada texto mistura o mundo de One Piece (o que se sabe pela obra, com link da One Piece Wiki) e o que o Livro do Jogador diz (com a página). A campanha começa antes da Guerra dos Maiorais (Marineford): o que a obra mostra depois disso, o Narrador decide se vale.</p>
    <input id="lore-busca" type="search" placeholder="Procurar (ex.: Kairoseki, Zou, Buster Call)" value="${esc(VIEWS.guia.busca || '')}" data-chg="lore-busca" aria-label="Procurar no guia">
    ${guiaEscondido('especies') ? '' : `<h2>Espécies</h2><div class="lore-l">${especies.filter(([, o]) => casa(o)).map(([k, o]) => loreBloco(o, k)).join('') || '<p class="nota">Nada encontrado.</p>'}</div>`}
    ${guiaEscondido('mundo') ? '' : `<h2>O mundo</h2><div class="lore-l">${LORE_MUNDO.map((o, i) => [o, 'm' + i]).filter(([o]) => casa(o)).map(([o, id]) => loreBloco(o, id)).join('') || '<p class="nota">Nada encontrado.</p>'}</div>`}
    ${souMestre() && (catEscondida('guia_especies') || catEscondida('guia_mundo')) ? `<p class="nota">Você escondeu ${[catEscondida('guia_especies') ? 'as espécies' : '', catEscondida('guia_mundo') ? 'o mundo' : ''].filter(Boolean).join(' e ')} dos jogadores (Catálogo › O que os jogadores enxergam). Aqui você continua vendo tudo.</p>` : ''}
    ${guiaEscondido('especies') && guiaEscondido('mundo') ? '' : `<details class="caixa"><summary>Todas as espécies do sistema e links da wiki</summary>${guiaEscondido('especies') ? '' : `<div class="guia-grade">${ESPECIES.map(([icn, n, pg, w, d, txt]) => `<article class="guia-c">${ic(icn === 'oni' ? icOu('especies2:oni_guerreiro', 'especies:gigante') : 'especies:' + icn, 64) || ic('especies:gigante', 64)}<div><h3>${esc(n)}</h3><p class="nota">${pg}</p><p>${esc(d)}</p>
      <p class="linha-bts">${txt || ESP_TXT[icn] ? `<button class="bt fino" data-act="lore-abre" data-id="${txt || ESP_TXT[icn]}" data-ir="1">Ler o texto</button>` : ''}${w ? `<a class="bt fino" href="${WIKI(w)}" target="_blank" rel="noopener">Wiki (inglês)</a>` : ''}</p></div></article>`).join('')}</div>
      `}${guiaEscondido('mundo') ? '' : `<h3>Mais do mundo na wiki</h3><div class="guia-links">${MUNDO_LINKS.map(([n, w, i]) => `<a class="guia-l" href="${WIKI(w)}" target="_blank" rel="noopener">${ic(i, 48)}<span>${esc(n)}</span></a>`).join('')}</div>`}</details>`}
    ${(M.estado.discord || {}).convite || (M.estado.discord || {}).servidor ? `<h2>${ic('modos:voz', 32)} Discord da mesa</h2><div class="pap discord">${M.estado.discord.convite ? `<a class="bt bom" href="${esc(M.estado.discord.convite)}" target="_blank" rel="noopener">Entrar no servidor</a>` : ''}
      ${M.estado.discord.servidor ? `<iframe src="https://discord.com/widget?id=${esc(M.estado.discord.servidor)}&theme=dark" title="Quem está no Discord" width="350" height="420" sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"></iframe>` : ''}</div>` : ''}</div>`;
};
ACT['lore-abre'] = el => { const id = el.dataset.id; loreAberto = loreAberto === id && !el.dataset.ir ? null : id; App.render(); setTimeout(() => { const a = $('#lore-' + id); if (a) a.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, 30); };
ACT['lore-busca'] = el => { VIEWS.guia.busca = el.value; loreAberto = null; App.render(); const b = $('#lore-busca'); if (b) { b.focus(); b.setSelectionRange(b.value.length, b.value.length); } };
