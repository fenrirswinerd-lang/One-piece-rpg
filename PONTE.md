# Ponte (One Piece RPG)

Este arquivo existe para dois chats (Mesa One Piece e RPG One Piece World Building)
lerem o mesmo estado, mesmo sendo conversas separadas.

## O que é este repositório
- `site/` — código-fonte do site Mesa One Piece (vanilla JS + Firebase). `site/src/app/*.js`
  é concatenado em ordem alfabética por `site/build.py` para gerar o site publicado.
- `docs/` — planos, logs de cada versão, revisões e anotações de lore/sistema que o
  Fenrir já escreveu em outras conversas. Nem tudo aqui é lore oficial: muita coisa é
  ideia solta ou plano técnico. Só vira lore ou regra confirmada quando o Fenrir disser.

## Regras permanentes do projeto (não mudam sem o Fenrir pedir)
- Zero custo: nada de API paga, nada de IA rodando dentro do site.
- Não criar conteúdo de personagem de jogador (só NPCs, lugares, navio/frota).
- Perguntar antes de criar estrutura nova, a não ser que ele mande seguir.
- Entregar só 2 ou 3 faíscas curtas e abertas, nunca caminhos prontos, a não ser que
  ele diga "desenvolva".
- Não inventar tempo de sessão, falas prontas nem cenas roteirizadas.
- Toda entrega vem com log: o que testar, resultado certo, o que não está pronto.
- Arte pode ter clima de One Piece, mas não copia personagem, bandeira ou cena oficial.

## Estado atual (ver docs/REVISAO_GERAL_V29.md para o detalhe)
- Versão do site: v29 (postos navais, frota com missões, marujos figurantes sem ficha).
- Pendente: revisão de abas, resumo da sessão 1 (o Fenrir escreve, não a IA), teste
  com Firebase de verdade, separar motor de conteúdo para outros sistemas.
- Decisão tomada: o bando pode crescer e ter frotas que rendem recursos de forma
  passiva (estilo Kid/Barba Branca), mas continua sendo o protagonista da história.

## Como usar isto num chat novo
1. Conectar este repositório ao Graphify (segunda cabeça / memória de código).
2. Ler este arquivo primeiro.
3. Antes de propor algo nas regras do sistema, checar `docs/` para não repetir ou
   contradizer o que já foi decidido.
