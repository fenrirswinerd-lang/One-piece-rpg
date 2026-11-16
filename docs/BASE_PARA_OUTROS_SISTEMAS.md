# Base para sites de outros sistemas (a partir da Mesa One Piece)

Anotações para reaproveitar esta estrutura em outras campanhas (ex.: RPG de League of Legends) ou num hub com vários sistemas. É ideia futura: nada aqui foi construído ainda.

## 1. O que o site é hoje

- **Hospedagem:** Netlify (arquivos parados) + Firebase (login Google, Firestore). Custo zero.
- **Código:** JavaScript puro, sem framework. Arquivos em `src/app/*.js`, juntados em ordem alfabética por `build.py` num `app.js` só.
- **Saída:** pasta `dist/site/` (vai para o Netlify) e `dist/previa.html` (modo de teste, tudo embutido, sem Firebase).
- **Dados do sistema:** arquivos JSON em `data/` (inimigos, frutas, profissões, tabelas do narrador, escudo, glossário).
- **Arte:** sprites em `assets/` + `manifest.json` (ícones, animações, imagens, texturas, peças de interface).
- **Sem IA dentro do site.** O assistente de regras é busca em dados; os prompts de arte são texto montado por código.

## 2. O que serve para qualquer sistema (o "motor")

Dá para levar quase sem mexer:

| Parte | Arquivos | O que faz |
|---|---|---|
| Núcleo | 00-core, 30-ui, 31-dados, 32-sessao, 98-zz-render, 99-main | Estado, telas, botões, modal, aviso, desfazer, login, arquivos |
| Mesa ao vivo | 33-mesa, 34-sincronia, 60-mesa-tela, 61-painel-mestre, 62-mesa-extra, 63-janelas, 64-ambiente | Quadro, música e efeitos para todos, janelas, presença, relógio e clima |
| Dados 3D | 63-dado3d, 63b-dado-fisica, `dadofis.js` | Dados com física, iguais para todos |
| Roda e reações | 63c-reacoes, 63d-mesa-roda | Lugares, faixa de vez, palco, balões |
| Mapa de combate | 83-tatico | Grade, fichas, régua, áreas (precisa só do tamanho do quadrado e da regra de diagonal) |
| Mundo | 68-mundo, 94-mural, 74-ideias, 88-diario-ajustes, 92-publico (parte) | Lugares, NPCs, diário, resumo de sessão, jornal |
| Ateliê | 82-atelie, 82b-atelie-mais | Prompts de arte (troca só o bloco de estilo e as listas) |
| Assistente | 81-oraculo | Busca em regras (troca os dados e as perguntas prontas) |
| Teste | 96-teste | Modo de teste com várias abas |

## 3. O que é só de One Piece (troca a cada sistema)

- **Regras e contas:** 10-rules (atributos, perícias, CD, crítico, descanso), 20-sheet (ficha), 50-combate, 55-inimigos, 66-jogador.
- **Conteúdo:** tudo em `data/` e 76-catalogo (frutas, estilos), 73-colinha, 75-tabelas-gn, 77-escudo-lore, 93-escudo.
- **Tema do mar:** 70-viagem, 71-navio, 79-batalha-naval, 79b-naval-vivo, 69-capitao, 72-lojas (parte), recompensas e cartazes.
- **Visual:** `style.css`, `mesa.css`, fontes, todos os sprites e o bloco de estilo do Ateliê.
- **Palavras:** Berries, bando, navio, Marinha, Akuma no Mi, Haki.

## 4. Como deixar adaptável (plano em 3 passos)

1. **Separar "motor" de "pacote do sistema".** Um pacote teria:
   - `sistema.json`: nome, dados usados, atributos, perícias, recursos (PV, PP, mana…), condições, moeda, tamanho do quadrado.
   - `regras.js`: as contas (bônus, CD, crítico, descanso, iniciativa).
   - `ficha.js`: desenho da ficha.
   - `dados/`: inimigos, itens, poderes, tabelas.
   - `tema/`: cores, fontes, sprites, `manifest.json`, bloco de estilo do Ateliê.
   - `modulos`: quais abas ligam (ex.: One Piece liga Navio e Batalha naval; LoL não).
2. **Campanha separada da mesa.** Hoje existe uma mesa só no banco (`mesa/…`). Para hub: `campanhas/{id}/…`, e cada campanha aponta para um pacote.
3. **Hub.** Tela inicial: escolher sistema → criar ou entrar numa campanha por convite. Cada mestre tem as suas.

## 5. O que eu preciso para montar um sistema novo (ex.: League of Legends)

- O livro ou as regras em PDF/texto (como são os testes, atributos, combate, recursos).
- Um exemplo de ficha preenchida.
- Lista de inimigos/criaturas, se houver.
- O que é o "mapa" da campanha (regiões de Runeterra no lugar de ilhas e mares).
- Que partes especiais o sistema tem (no One Piece: navio, recompensa, frutas. No LoL talvez: campeões, runas, regiões).
- Direção de arte em uma frase (ex.: "arcano e dourado, estilo splash art pintado" ou "pixel art").

## 6. Cuidados que valem para todos

- Custo zero: nada de API paga, nada de IA rodando no site.
- Arte: pode usar o clima e as referências do universo, sem copiar personagem, logo ou cena oficial. Em universo de empresa (LoL é da Riot), manter uso privado e não comercial.
- Cada entrega com log: o que testar, resultado certo, o que não está pronto.
- O mestre decide; o site não inventa conteúdo de jogador.
- O Discord está sem vídeo/tela no Brasil: o site é a "tela compartilhada" (quadro, palco, dados, mapa).

## 7. Ordem sugerida quando chegar a hora

1. Tirar as palavras e regras de One Piece de dentro do motor (pacote "one-piece").
2. Trocar `mesa/…` por `campanhas/{id}/…` no banco.
3. Montar o segundo pacote (o sistema novo) só com dados + ficha + tema.
4. Só então fazer a tela de hub.

Estimativa honesta: o passo 1 é o mais pesado (mexe em quase todo arquivo de regra). Os passos 3 e 4 ficam baratos depois dele.
