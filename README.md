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

## Estado atual (v29)
- Batalha naval com postos para jogadores (leme, canhões, homem das armas, reparos,
  proteger o navio, vigia/convés).
- Frota do bando: navios sem ficha, missões (regra da casa, não é do livro — ver
  `docs/LOG_V29_POSTOS_FROTA_MARUJOS.md`), retorno pelo relógio da Mesa.
  Decisão confirmada: o bando pode ter frotas que rendem recursos de forma passiva
  (como Kid e Barba Branca), mas continua protagonista da história.
- Marujos: tripulação figurante sem ficha, pode ganhar nome/rosto quando fixado.
- Banco do bando e navio por peças (v28).
- Corrigido na v29: janelas que só cresciam, modificador de dado em tela cheia,
  menu do jogador com abas inacessíveis, overflow em telas pequenas.

## Pendências conhecidas
- Nunca testado com Firebase de verdade (só modo de teste).
- Resumo da sessão 1: o Fenrir escreve, a IA não inventa.
- Revisão/enxugamento de abas repetidas (esconder, não apagar).
- Desbloqueáveis dentro da Batalha naval/Tripulação: abordagem, moral do convés,
  marujo que vira gente marcante.
- Separar motor (abas, Mesa, dados, Banco, janelas) do conteúdo (regras OP RPG),
  pensando em reaproveitar a base para outros sistemas no futuro.
- Submarino (LJ p. 318): não existe ainda.
- Lore dos jogadores: resumos de PDF anexado são feitos pela IA, à mão, um por vez
  — o resumo automático do site (`resumir()` em `site/src/app/66-jogador.js`) é só
  um apanhado das frases mais repetidas, não lê sentido, e pode citar mentira de um
  personagem como se fosse fato. Não confiar nele para lore.

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
`LOG_V28_BANCO_E_ESTALEIRO.md`, `LOG_V29_POSTOS_FROTA_MARUJOS.md`.

Logs de teste específicos: `LOG_FABLE_BLOCO1.md`, `LOG_FABLE_COMPLETO.md`,
`LOG_NAVAL_VIVA.md`, `LOG_RETRATO_PDN_V22.md`, `LOG_SOM_E_LEGIBILIDADE.md`,
`LOG_TESTE_*.md` (ficha, Gen, escudo de lore, sprites navais, naval simples, etc.).

## Como usar isto num chat novo
1. Ler este README primeiro.
2. Antes de propor algo nas regras do sistema, checar `docs/` para não repetir ou
   contradizer o que já foi decidido.
3. O Graphify (memória de código) já está conectado a este repositório; use-o para
   achar onde uma função/regra está implementada antes de reescrever algo.
