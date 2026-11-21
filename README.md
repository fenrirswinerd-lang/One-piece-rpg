# One Piece RPG — Mesa One Piece

Site de mesa online (JS puro + Firebase) para o RPG de One Piece do Fenrir, usando o
sistema OP RPG (Livro do Jogador 2.1, Guia do Narrador 2.0, Manual dos Inimigos).
Este README é o ponto de entrada para qualquer chat ou ferramenta que leia este
repositório (inclusive a memória de código do Graphify, que no plano Free só indexa
este arquivo, não os de `docs/`).

## Estrutura
- `site/src/` — código-fonte. `site/src/app/*.js` é concatenado em ordem alfabética
  por `site/build.py`, gerando um único arquivo para o site (Netlify) e uma prévia
  autocontida.
- `site/firestore.rules` — regras do Firebase.
- `site/src/novidades.md` — patch notes que os jogadores leem dentro do site (janela "Novidades").
  É o mesmo texto de `docs/UPDATE_LOG_JOGADORES.md`. Versão nova: escreva "## Versão N" no topo e rode o build.
- `site/tools/` — scripts que geram os dados do site a partir dos PDFs. `livro_texto.py` gera
  `data/livro_texto.json` (texto do LJ, GN e MI, página por página), que o build transforma em `livro.js`
  (baixado só na primeira pergunta do "Pergunte ao livro"). Os PDFs e a pasta `data/` não estão no repositório.
- `docs/` — planos, logs de cada versão e anotações soltas, na íntegra (ver índice
  abaixo). Nem tudo é lore oficial: vira oficial só quando o Fenrir confirmar.
- `fontes/` — texto extraído dos PDFs/.docx oficiais do sistema (livros, frutas,
  regras do narrador, lore de personagem), em `.md` para caber no GitHub e ser
  lido por qualquer ferramenta de texto/código. Os PDFs originais continuam só
  no chat; isto aqui é o conteúdo deles, não um resumo.

## Regras permanentes do projeto (não mudam sem o Fenrir pedir)
- **Zero custo**: nada de API paga, nada de IA rodando dentro do site.
- **Não criar conteúdo de personagem de jogador** — só NPCs, lugares, navio/frota.
- **Perguntar antes de criar estrutura nova** (tabela, aba, categoria, controle),
  a não ser que ele mande seguir direto.
- **Só faíscas**: 2 ou 3 ideias curtas e abertas, nunca caminho pronto — a não ser
  que ele diga "desenvolva".
- **Não inventar** tempo de sessão, falas prontas, cenas roteirizadas ou sequência
  de eventos.
- **Toda entrega vem com log**: o que testar, resultado certo, o que não está pronto.
- **Arte** pode ter clima de One Piece, mas não copia personagem, bandeira ou cena
  oficial.
- O papel da IA aqui: conectar as ideias soltas do Fenrir, checar o cânone de One
  Piece sem ele precisar pesquisar, e dar faíscas para vilões/sessões. As decisões
  e o processo criativo são dele.

## Estado atual (v33)
- **v33 · Vontade pesa**: moral do convés vale mais (10 = +4); abordagem não evita a luta (avisos); PDF da homebrew em docs/. Ideias futuras em docs/PARA_DEPOIS.md.

### v31
- **v31 · Marujos de verdade**: painel "Funções e efetivo" com protagonistas donos da função (pela profissão da ficha, até 3 funções),
  marujos completam o mínimo do navio (LJ p. 300), botão "Completar com marujos". Contagem por função = só marujos; `tot` = todos a bordo.
  Loja aberta no cabeçalho; etiquetas do Navio legíveis no escuro; update log novo (`site/src/novidades.md`, etiquetas `[novo]`). Log: `docs/LOG_V31.md`.

### Antes (v30)
- **Inventário**: "Trazer da ficha" lê a nota (comentário) da mochila na planilha (baixa o .xlsx pelo link)
  e põe os itens dentro do recipiente, com peso. Plano B: "＋ Colar lista" em cada recipiente.
- **Pergunte ao livro**: além das regras prontas, busca no texto inteiro dos livros (sem IA, custo zero).
  Mestre: LJ + GN + MI. Jogador: só LJ. Código em `site/src/app/81b-livro-texto.js`.
- **Lore do jogador**: o site não resume mais (o resumo automático inventava fato). Mostra "Pontos do texto"
  e os nomes que mais aparecem. Resumo de verdade: a IA faz no chat, a partir do PDF.
- **Diário de bordo**: o mestre edita o que publicou e marca "Resumo da sessão" (selo).
- **Recursos do convés** (regras da casa, desbloqueáveis em Tripulação; `79f-conves.js`): moral do convés,
  marujo que vira gente (feitos), abordagem na Batalha naval, rota fixa da frota.
- **Título na tela** (arco/episódio) e **chegada na ilha** com a arte escolhida ou o ícone (`61b-cinema.js`).
- **Menu do jogador enxuto**: Navio/Banco dentro de Tripulação, Procurados dentro de Jornal, Catálogo dentro
  de Pergunte ao livro (abas irmãs, `98-irmas.js`). "Abas do menu: Todas" volta o menu completo.
- **Novidades**: faixa uma vez por versão; depois pelo menu da conta (`98-zy-novidades.js`).
- Já existia (v28–v29): Batalha naval com postos, frota com missões, marujos sem ficha, Banco do bando,
  navio por peças. Decisão confirmada: o bando pode ter frotas que rendem de forma passiva (Kid, Barba Branca),
  mas continua protagonista.

## Pendências conhecidas
- Nunca testado com Firebase de verdade (só modo de teste). A leitura da nota da mochila pelo link do Google
  não pôde ser testada de dentro do chat.
- Números da abordagem e da rota fixa: ponto de partida, não regra do livro.
- Separar motor (abas, Mesa, dados, Banco, janelas) do conteúdo (regras OP RPG), pensando em outros sistemas.
- Homebrew em PDF para o Discord (só quando o Fenrir pedir).
- Submarino (LJ p. 318): não existe ainda.
- Lore dos jogadores: só a do Roman está em `fontes/lore/`. Resumos são feitos pela IA, no chat, um por vez.
- Mais frutas: o Fenrir ainda vai anexar.

## Índice de `fontes/`
- `fontes/livros/livro-do-jogador-2.1.md` — Livro do Jogador (LJ 2.1), regra base.
- `fontes/livros/guia-do-narrador-2.0.md` — Guia do Narrador (GN 2.0).
- `fontes/livros/manual-dos-inimigos-playtest.md` — Manual dos Inimigos (MI, playtest).
- `fontes/livros/resumo-criacao-tecnicas-1.5.md` — resumo de criação de técnicas.
- `fontes/livros/modelo-ficha-de-inimigos.md` — modelo de ficha de inimigo.
- `fontes/narrador/` — regras extras por categoria, regras opcionais (By Lucco),
  estilos de combate exclusivos 2.1, mudanças no multiestilo, espécie Oni 2.0.
- `fontes/frutas/` — Akuma no Mi já detalhadas: Ope Ope, Yami Yami, Pika Pika,
  Suna Suna, Wara Wara, Tama Tama, Ato Ato, Uo Uo (Seiryu), Zou Zou (Mammoth),
  Saru Saru (Sun Wukong), Suke Suke, e o modelo para frutos Logia/Paramecia
  avançado. **Faltam mais frutas** — o Fenrir ainda vai anexar.
- `fontes/lore/morita-roman-o-tontatta.md` — lore do personagem Roman (Tontatta).
  **Falta a lore dos outros jogadores.**
- `fontes/lore/primeiro-arco-lore-reunida.md` — versão completa do resumo abaixo,
  mantida pelo chat de lore. Como o plano Free do Graphify só indexa este README,
  o conteúdo também fica copiado direto aqui embaixo, na seção "Lore do Primeiro
  Arco".

O PDF de Jujutsu/Feiticeiros & Maldições (F&M) é de outro projeto do Fenrir e
fica fora deste repositório de propósito.

## Índice de `docs/`
Planos e prompts:
- `PLANO.md`, `PLANO_FINAL_FABLE.md` — plano geral e o plano organizado mais recente.
- `PLANO_NAVAL_REVIEW.md`, `PROMPT_FABLE_BANCO_FROTA_REVISAO.md` — naval e banco/frota.
- `PROMPT_COMPLETO_SITE.md`, `PROMPT_FABLE_MELHORAR_SITE.md` — prompts de melhoria do site.
- `PROMPT_chat_de_lore.md` — ideia do chat separado de lore.
- `REVISAO_ABAS_PLANO.md`, `REVISAO_GERAL_V29.md` — revisões de abas e revisão geral.
- `BASE_PARA_OUTROS_SISTEMAS.md` — ideia de separar motor/conteúdo.
- `HOMEBREW_FROTA_FAISCAS.md` — faíscas da homebrew de frota.
- `GUIA_LORE_textos.md` — textos de lore já escritos.
- `AUDITORIA_REGRAS_B7.md` — auditoria de regras do livro.
- `SPRITES_PARA_O_SITE.md`, `PROMPTS_DE_ARTE_V26.md` — prompts de arte/sprites.
- `UPDATE_LOG_JOGADORES.md` — changelog para os jogadores lerem.

Logs de versão (o que mudou, como testar, o que ficou pendente):
`LOG_V25_DADOS_E_MESA.md`, `LOG_V26_RODA_DA_MESA.md`, `LOG_V27_PIXEL_ART.md`,
`LOG_V28_BANCO_E_ESTALEIRO.md`, `LOG_V29_POSTOS_FROTA_MARUJOS.md`, `LOG_V30_FINAL.md` (o mais novo).

Logs de teste específicos: `LOG_FABLE_BLOCO1.md`, `LOG_FABLE_COMPLETO.md`,
`LOG_NAVAL_VIVA.md`, `LOG_RETRATO_PDN_V22.md`, `LOG_SOM_E_LEGIBILIDADE.md`,
`LOG_TESTE_*.md` (ficha, Gen, escudo de lore, sprites navais, naval simples, etc.).

## Lore do Primeiro Arco (resumo, mantido pelo chat de lore)

Fonte da verdade: a Bíblia da Campanha (Claude Doc) e o Notion "Escudo do Mestre:
Primeiro Arco". Isto aqui é o resumo, atualizado pelo chat de lore sempre que algo
relevante for decidido, pra quem só lê este README (inclui o Graphify no plano
Free). Etiquetas: DECIDIDO/ESTABELECIDO, PROPOSTA, EM ABERTO.

O Primeiro Arco é um arco só, grande: começa na Ilha de Lastro e termina no fim de
Casca Branca. Lastro, Mary Geoise e a viagem até Casca Branca são partes dele (não
chamar cada ilha de "arco").

**O mundo (ESTABELECIDO):** antes da Guerra dos Maiorais. A fuga de Mary Geoise
acontece durante ela, vista num telão. Shanks, Barba Branca, Luffy, Law e Kid
existem. Luffy é dado como sumido em partes do mundo e como morto em outras. Dois
jogadores na mesa: nível 3 no começo, 4 no fim de Mary Geoise, 5 no fim de Casca
Branca. Encontros planejados não dão XP.

**Ilha de Lastro (East Blue):** cidade-porto que cresce, guildas boas (Mesa de
Trás, ex-calafate Madame Keel) contra nobres abusivos (Casa Gilt, Visconde Gilt).
Conselho eleito. O jornal mente ("disputa entre guildas"). Seis cenas curtas, sem
combate. Termina destruída por uma arma do Governo (tipo Lulusia, menor), vista
como luzes caindo do céu.

**Mary Geoise (topo da Red Line):** sobreviventes de Lastro acordam encapuzados
numa cela, antes de um Coliseu durante um festival dos Dragões Celestiais. O Saint
Orvald os inspeciona. O telão mostra Marineford e a fala do Barba Branca. Dois
caminhos de fuga: o Gen (plataforma de Dial, invenção) ou o Elias (revolucionário
infiltrado, paciência).

**Casca Branca (South Blue — DECIDIDO):** ilha de louça e madeira sobre uma
cavidade oca com riquezas preservadas e um gás mortal (o Bafo), gerado pela praga
(a Doença da Trinca) fermentando no oco — ninguém sabe que a doença gera gás. O
povo acha que o minério (Hakuji) acabou; não sabe da cavidade. Marinha e piratas
sempre souberam e tiram "o que sobrou" pelas galerias antigas.

*Aparência (DECIDIDO 21/11):* de longe parece um bolo gigante, ou uma ilha muito
alta coberta de neve — ninguém sabe bem o que é aquele branco. De perto: base de
terra escura com florestas e raízes saindo pelas bordas; em cima, a casca branca
escorrendo como glacê. Na frente, uma grande escadaria sobe até o topo. Ilha mais
pobre e de pouco comércio, mas não acabada.

*O Hakuji (CORRIGIDO 21/11):* a ilha extraía o minério e fazia suas obras com ele.
Pra formar a casca, os construtores derreteram parte das obras principais. O povo
acha que perdeu o acesso ao minério (terra contaminada) e que todas as obras de
riqueza foram derretidas. Na verdade estão preservadas na cavidade, junto com
esculturas e resíduo de minério.

*Ficha de território (GN p.80, PROPOSTA):* Nível D, vila pequena (~2.000–3.000
hab.). Governo civil: um prefeito (nome EM ABERTO) que não sabe da cavidade. Base da
Marinha pequena (~12, Grisk e Ruck), menor que o padrão do livro. Atividades:
louça comum, carpintaria, pesca, pouco comércio de passagem. Por baixo: contrabando
de minério cru (Marinha + Karvel). Tributo e riqueza da ilha: EM ABERTO (o mestre
vai trabalhar o minério depois).

*A cura (fluxo do mestre, DECIDIDO):* o grupo precisa de dois irmãos (cientista e
médico). O furo do gás já existe — foi aberto pelos garimpeiros (Toupeiras), que se
contaminaram e o vedaram depois; o gás não se espalha. O grupo entra por esse furo
com respiradores de seiva adaptada ao minério (pista do Cozinheiro) e pega a
amostra sem se contaminar. Leva a amostra e as informações do Gen + do
revolucionário até os irmãos, volta com os dois. A ilha está pior, garimpeiros em
macas. Agora é derrotar o vilão.

*O Grisk (AJUSTADO):* fica parado ao lado de uma grande pedra de minério cru, com o
braço ligado a ela, mandando minério a distância. Difícil de alcançar, mas não é
fraco no corpo a corpo. Sem luvas, sem "Trinca nas mãos" (removido). A luta final
ainda precisa ser repensada com esse desenho.

*Final (EM REESCRITA):* não há mais um "sino" literal. Candidatas: a cidade de
cabeça para baixo; a ilha vira lanterna; a casca se solta; o coro dos construtores.

**NPCs principais:**
- *Gen Sarutōryō* (antigo Jones) — carpinteiro carismático, inteligente mas não
  parece, faz muita merda, sem lema. Fruta Saru-Saru no Mi, Model Sun Wukong. Quer
  Casca Branca livre, sob bandeira pirata própria, por carinho e cultura — não por
  posse. Sonho maior que o One Piece, ainda em aberto (algo tipo Franky). Nível 5
  em Casca Branca; o grupo alcança ele lá. Vida: 1d20, só morre com 1 a 6.
- *Billy* — garoto do barquinho, fruta de nuvem, amortece queda na fuga. Escreve
  cartas com o Gen, guarda recorte de jornal do Luffy. Herda a risada do Gen se ele
  morrer.
- *Elias Vellum* — revolucionário idoso infiltrado na Cipher Pol. Quer Casca Branca
  sob a Revolução, carinho enorme, já planejava isso por ideia própria. Não conhece
  o Gen; é o contraponto dele.
- *Orsino "Louça-Fina" Grisk* — chefe da base da Marinha em Casca Branca, vilão
  principal. Não se vê como vilão ("mantém a paz"). Tem a Fruta Seto Seto no Mi.
- *Brann Karvel* — pirata de fora, serviço sujo do Grisk em segredo (leva minério
  por mar). Não cobra do povo. Pode virar casaca se descobrir que é bode
  expiatório.
- *Odessa Kray e os Toupeiras* — garimpeiros de fora que viraram piratas, cortados
  do negócio pelo Grisk. Não sabem do salão oco. Aliados momentâneos se tratados.
- *Tessaly Ruck* — sargento da Marinha, cara do Grisk na rua. Não sabe da cavidade.
- *Kaolin* — porta-voz idosa de Casca Branca, ex-polidora. É quem o Gen procura se
  vive.

**Decisões fechadas:** o Marco solto das algemas em Marineford; o Luffy aparece em
cartaz em Lastro só se os jogadores pararem para ver (telão + jornal, sem forçar);
nome e risada do Gen fechados; Law e Kid existem.

**Decidido (17/11):** a Tsukyo (Amy) é da mesma espécie do Kaido (Oni/Ogro no
sistema) e usa a Ato Ato no Mi, não a Ope Ope — já bate com a ficha em
`fontes/lore/` (espécie Ogros, fruta "ato ato"). O navio sem bandeira visto em
Lastro era do pirata desconhecido que estava na mesma cela em Mary Geoise (morto
na fuga do Coliseu); ele tinha se desvinculado do navio antes de chegar a Lastro.
**Quebrado por essa decisão:** a cena "F. A cela à parte" de Mary Geoise supunha a
Amy cortando as grades com a Room; isso não existe mais e falta um novo jeito de
abrir a cela (ver Notion).

**Em aberto (só registrado, não decidir por conta própria):** combates de Casca
Branca calibrados para 2 jogadores (o Grisk e o Karvel sozinhos passam do Mortal
com o multiplicador); imagem final do arco (C6).

### Sessão 1 — o que já foi jogado (10/11, registrado 17/11)

Personagens dos jogadores: Tsukyo (Amy) e Morita Roman (Tontatta). Resumo: Tsukyo
chega em Lastro de navio mercante com uma carta pra buscar relações pro reino dela;
conhece o Velho Creel, vê o cartaz do Luffy, ajuda a resolver um mal-entendido entre
um nobre e a guilda dos Estivadores (a Mesa de Trás), entrega a carta ao Mestre
Bollard. Lastro é destruída por uma arma do Governo. Em Mary Geoise, presos numa
cela, o Saint Orvald atira no Velho Creel por falar demais — **ele sobrevive** (não
morre como estava planejado antes) e é resgatado pelo revolucionário disfarçado de
CP9. Lutam no Coliseu; durante um tremor (Gura Gura), o Gen salva o Tontata de cair
da Red Line e pede ajuda com Casca Branca em troca de tirá-los de lá. **Caminho
escolhido: o do Gen, não o do Elias**, nesta fuga. A sessão termina com o telão
mostrando a morte do Barba Branca. Registro completo no Notion, dentro de "Sessão
1".

## Como usar isto num chat novo
1. Ler este README primeiro.
2. Antes de propor algo nas regras do sistema, checar `docs/` para não repetir ou
   contradizer o que já foi decidido.
3. O Graphify (memória de código) já está conectado a este repositório; use-o para
   achar onde uma função/regra está implementada antes de reescrever algo.
