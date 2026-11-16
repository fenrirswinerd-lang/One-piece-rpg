# PROMPT PARA O FABLE: levar a Mesa One Piece ao próximo nível

> Anexe junto: `PROMPT_COMPLETO_SITE.md` (descrição do site), `prints_site.zip` (telas) e o código (`Mesa_One_Piece_site.zip` ou a pasta `app/`).
> Fenrir escreve em português simples e curto. Responda no mesmo estilo, sem enrolar.

---

## 1. Quem sou eu e o que quero

Sou o Fenrir, mestre de um RPG de One Piece (sistema **OP RPG**, LJ 2.1 e GN 2.0), com 4 jogadores. Tenho um site (JS puro, Netlify + Firebase plano grátis) que já tem 31 abas: mesa ao vivo, combate, fichas, inimigos, mundo, lojas, navio, batalha naval, diário, jornal, recompensas, escudo de regras, etc. (veja o `PROMPT_COMPLETO_SITE.md`).

**Quero usar o máximo de você (Fable) para transformar esse site na melhor mesa de RPG online que existe**, sem gastar dinheiro. Não se prenda às minhas ideias nem às abas atuais: analise o projeto inteiro e me surpreenda.

## 2. Limites (não negociáveis)

- **Custo zero.** Não posso pagar nada para o site. Só tenho **você/Claude** e o **ChatGPT Go** (sem API). Netlify e Firebase no plano grátis.
- **Nenhuma IA rodando dentro do site.** Nem API, nem modelo no navegador. O site pode ter uma "quase-IA": um **assistente de regras** que responde dúvidas do sistema com código e dados (ver seção C), sem IA de verdade.
- **ChatGPT Go só para gerar ARTE.** O site pode ter uma biblioteca de **prompts de arte** (botão copiar). Texto, resumo, regra e código ficam com você/Claude.
- **Discord sem vídeo no Brasil:** a ANPD mandou suspender chamadas de vídeo, lives e **compartilhamento de tela** do Discord aqui (agosto de 2026). Usamos o Discord só para **voz e texto**. Então **o site é a "tela" da mesa**: tudo que eu mostraria compartilhando tela (mapa, imagem de cena, cartas, iniciativa) precisa aparecer no site de cada jogador.
- **Site estático** (HTML/JS/CSS) + Firestore. Sem servidor próprio.
- **Mestre = eu.** Jogadores só veem o que eu liberar. Nada secreto vaza para o jogador.
- **Arte: sem copiar arte oficial de One Piece** (nada de personagem, logo ou cena do mangá/anime), **mas pode e deve usar o estilo e as referências do universo** (mar, piratas, Marinha, cartazes, Grand Line) para dar identidade. Arte original, pixel art pirata.
- **Regras do livro com página.** Nunca invente regra do OP RPG. Se não achar no LJ/GN/Manual (estão no `data/*.json` e no código), marque **[A CONFERIR]**.
- Mantenha o **estilo**: pixel art pirata, madeira e pergaminho, tema claro/escuro legível (já tivemos texto invisível; teste os dois).
- Meu estilo de trabalho: **respostas curtas**, nada de roteiro pronto de sessão, nada de conteúdo de personagem de jogador, **minhas anotações são ideias soltas e não lore oficial**, e você me ajuda a **conectar ideias e checar cânone**, não a decidir por mim.

## 3. O que quero que você faça (3 fases)

**Fase 1: análise completa (faça sozinho, sem perguntar).**
Leia tudo e me entregue um relatório curto com:
1. **Bugs e riscos** (dados que se perdem, abas que não se falam, texto ilegível, coisas que quebram no celular, desempenho com 760 KB de JS).
2. **Regras que o site calcula errado ou que se contradizem** (compare com o LJ/GN dos `data/*.json`). Liste cada uma com página.
3. **Buracos entre abas** (coisa que uma aba sabe e a outra não; botões duplicados; telas que o mestre nunca acha).
4. **As 10 melhores melhorias** do banco de ideias abaixo (e outras suas), cada uma com: ganho para a mesa, esforço (P/M/G), e risco.

**Fase 2: construa o "Bloco de abertura" (já autorizo, sem perguntar).**
Escolha as **3 melhorias de maior impacto e menor risco** da sua lista e implemente. Para cada uma: teste (Playwright, tema claro e escuro, mestre e jogador), entregue o **zip do site**, o **log** do que testar / resultado certo / o que ainda não está pronto, e a **prévia**.

**Fase 3: pergunte antes de qualquer estrutura nova grande.**
Depois do bloco de abertura, proponha os próximos blocos e espere eu escolher.

## 4. Banco de ideias (minhas faíscas; supere, troque, junte)

### A. Combate que respira (o que mais pesa na mesa)
1. **Mapa tático em grade com tokens** (retratos dos jogadores, inimigos, PdN), **régua em metros**, deslocamento de cada um por turno, círculo de alcance de arma e técnica, **cone/linha/área desenhados** (as técnicas têm "Cone 15 m", "Linha 9 m", "toque"). Reaproveite o motor do mapa da batalha naval.
2. **"Quanto falta para chegar?"**: o exemplo que me travou: um inimigo corre para o jogador que está a 15 m. Quantos metros ele anda por turno (o Manual dá o deslocamento: ex. Pirata Novato 9 m, Pirata Espadachim 12 m)? Ele chega neste turno ou no próximo? O site mostra "chega em N turno(s)", marca no mapa **onde ele para em cada turno** e deixa o mestre confirmar. Confira no LJ como funcionam **deslocamento, ação de correr e ação preparada**, e escreva a regra com página; o que o livro não diz vira pergunta marcada **[A CONFERIR]** para eu decidir.
3. **Ação preparada / reação**: o jogador declara "se o inimigo entrar a 3 m, eu ataco", o site guarda o gatilho e avisa o mestre quando acontecer.
4. **Painel de turno**: no turno de cada um mostra deslocamento restante, ação, ação poderosa, ação bônus, reação (usados/livres), condições ativas com contagem de rodadas, e PP.
5. **Calculadora de ataque inteligente**: escolho atacante, alvo e arma/técnica; o site rola o d20, soma bônus, compara com a **CR**, rola o dano, trata crítico (20 natural), resistências e condições, e mostra a conta passo a passo para eu corrigir se quiser.
6. **Chefes com fases e ações lendárias**: barra de PV com marcas (fase 2 em 50%), lembretes automáticos.
7. **Aviso de "perto de cair"** e de condições perigosas (PV baixo, Sobrecarga, Exaustão).

### B. Jogador com ficha viva
8. **"Minhas técnicas" em cartões**: cada técnica com custo de PP, CD, dano, alcance; botão **Usar** que gasta o PP, rola ataque ou mostra a CD e rola o dano. Hoje a ficha é lida, mas pouco "jogada".
9. **Rolagens de perícia com um toque**, vantagem/desvantagem automáticas por condição, histórico público.
10. **Inventário e carga** com aviso de Sobrecarga e atalhos para usar item (cura, kit de profissão).
11. **Página do personagem como "cartaz de procurado" que evolui**: recompensa, alcunha, retrato, feitos, tudo mudando conforme a campanha.

### C. "Quase-IA" sem IA: assistente de regras do sistema
12. **Assistente de regras (o carro-chefe).** Uma caixa de pergunta, em português do dia a dia, que responde **dúvidas do OP RPG** usando só código e os dados do site (`data/*.json`): ela entende a intenção, acha a regra, e responde **curto, com a página** e a conta pronta. Exemplos reais que já me fizeram perder tempo:
    - "quanto de dano uma bala dá?" → munição esférica 1d8 contundente / perfurante 1d8 / Kairoseki 1d8 + Enfraquecido (LJ p. 252–254)
    - "Trueno Bastardo precisa de dado para acertar?" → o corte normal rola ataque de Técnicas; o corte voador não (Salvaguarda de Destreza com desvantagem)
    - "o que define a salvaguarda de Destreza do pirata novato?" → 1d20 + mod (+Prof. se proficiente), e puxa o valor da ficha dele no Manual
    - "ação poderosa tira o ataque comum?" → não, são partes separadas do turno (LJ p. 288)
    - "o que faz um ataque de oportunidade?" → não existe como regra geral (LJ p. 192 e 290)
    - "20 natural acerta mesmo se a CR é maior?" → sim, acerta sempre e é crítico
    - "quando o pirata espadachim critica, quantos dados?" → dobra os dados de dano; mostra o bloco do Manual e a conta
    Como construir: índice local (busca com tolerância a erro de digitação e sinônimos), **intenções comuns** (dano de X, CD de Y, custo de PP, alcance, condição, "chega em quantos turnos", "como funciona a fruta Z"), e **respostas montadas a partir dos dados**, com selo **[CONFERIDO: LJ p. X]** ou **[A CONFERIR]** quando o livro não diz. Nunca inventar. Se não achar, dizer "não achei" e mostrar as 3 regras mais próximas. Guardar as perguntas que ele não soube responder numa lista para eu revisar.
13. **Calculadora que explica a conta**: quando o assistente responde um número (CD, dano, acerto), mostra a fórmula e os valores da ficha, para eu conferir de cabeça.
14. **Decisões da mesa**: quando eu e o grupo decidirmos algo que o livro não cobre (as pendências "ainda a decidir"), o site guarda como **regra da casa** e o assistente passa a citá-la antes do livro, com marca "decisão da mesa".
15. **Biblioteca de prompts de ARTE para o ChatGPT Go**, prontos e bons, cada um com botão "copiar" e "variar": ilha, NPC, cartaz de procurado, retrato, sprite de navio (com fundo magenta #FF00FF, que eu uso para recortar), mapa top-down, ícones, efeitos. Cada prompt já leva o **estilo do site** (pixel art pirata, paleta de madeira e pergaminho) e **referências do universo** de One Piece em palavras (sem copiar personagem). Explique também como pedir e como recortar o resultado.
16. **Resumo de sessão melhor, sem IA:** o botão atual só agrupa linhas do diário por palavra-chave. Faça uma **linha do tempo** (rolagens, quedas, descobertas, recompensas, ilha, clima) e um **texto corrido com modelos de frase** (tom de diário de bordo ou de manchete do Jornal da Economia Mundial), que eu edito e publico. Se eu quiser polir de verdade, copio o resumo para o Claude fora do site.
17. **Checador de cânone**: cartas de consulta rápida (como funciona uma fruta, Haki, fraquezas, Kairoseki, mar, Poneglyph) **separadas de "o que é lore da nossa mesa"**, para eu não misturar.

### D. Mestre sem esquecer nada
18. **"Antes de sentar"**: uma tela só que junta pendências da lore, "ainda a decidir", recompensas não pagas, arcos abertos, NPCs sem ficha, ilhas sem loja, itens em aberto no Notion.
19. **Relógios de progresso** (como no *Blades in the Dark*): "A Marinha fecha o cerco 3/6", "Fome na ilha 2/4". Ligados à recompensa e ao renome do bando: sobe a recompensa, o relógio da Marinha avança e o site sugere encontros e caçadores.
20. **Linha do tempo do mundo**: o que cada facção (Marinha, Revolucionários, Governo, bandos rivais) está fazendo entre sessões, avançando com rolagem (usar as Tabelas do Narrador, GN p. 24+).
21. **Geradores locais com tabelas** (sem IA): NPC, boato, nome de ilha, encontro no mar, vilão com motivação, loja com estoque, evento de ilha; tudo salvando direto no Mundo.
22. **Modo "mestre rápido"** no celular: botões grandes para rolar, aplicar dano, passar turno e anotar.

### E. Imersão (barata e muito sentida)
23. **Cenas em um clique**: "Tempestade", "Taverna à noite", "Combate no convés", "Banquete". Cada uma muda céu, som ambiente, trilha, luz e moldura juntos (já temos clima, ambiente e música; falta o conjunto salvo). Mestre cria e salva as próprias.
24. **Momentos de tela cheia**: crítico, queda, Haki do Rei, subir de nível, nova recompensa, morte. Efeitos de uns 2 s, silenciáveis.
25. **Cartaz que chega**: o cartaz de Procurado cai, balança e gruda no mural quando o bando sobe de renome.
26. **Entrada de NPC e de ilha** com moldura e frase de efeito; **chegada à ilha** com transição de mar.
27. **Sons de interface** (rolagem, página, moeda) em CC0, sempre com volume e mudo fáceis.
28. **O site como a tela da mesa** (já que o Discord não tem vídeo no Brasil): botão do mestre **"mostrar a todos"** para imagem de cena, mapa tático, carta de NPC, handout e iniciativa, aparecendo na hora para todos, com uma mini-fila para eu deixar as próximas cenas preparadas.
29. **Diário do bando como livro** com páginas viradas e exportação em PDF no fim da campanha ("a crônica do bando").

### F. Mar, mundo e navio
30. **Terminar a naval:** efeitos de tiro visíveis para jogadores, imagem do navio do bando, Canhão de Energia, tripulação mínima, Reparo Emergencial, vento e corrente que mudam, **abordagem** (mini-mapa do convés), ilhas e rochas como obstáculo, névoa.
31. **Mapa-múndi interativo**: rota desenhada, dias de viagem, Log Pose/Eternal Pose, ilhas descobertas acendendo (liga com Viagem e Mundo).
32. **Puzzle de Poneglyph** e **mapas do tesouro** que o mestre libera por pedaços.

### G. Qualidade e longo prazo
33. **Auditoria automática de dados**: um script que confere técnicas, CDs, custos de PP, fichas de inimigo e tabelas contra o padrão e aponta incoerência antes do build.
34. **App instalável (PWA) e modo offline**, **desfazer em tudo**, **backup automático versionado**, **checagem de espaço do Firebase** (1 GiB) com aviso e compactação de imagens.
35. **Desempenho e celular**: dividir o JS por aba (carregar só o que usa), testes em 390 px, acessibilidade de teclado e contraste.
36. **Painel de testes** (Playwright) que roda os fluxos principais e gera o log para eu.

## 5. O que quero sentir no fim

- A mesa **parece viva**: cada ação tem som, luz e resposta.
- Eu **não esqueço nada** e **não abro 10 abas** para achar uma regra.
- Os jogadores **jogam pela ficha** e não só olham a ficha.
- Eu tiro dúvidas de regra **na hora, com página**, sem abrir o livro e sem IA paga.
- O site é a **tela compartilhada** que o Discord não me dá mais.

## 6. Formato da sua resposta

1. **Relatório da Fase 1** (curto, com tabela de melhorias: ideia · ganho · esforço · risco).
2. **Bloco de abertura** (3 melhorias prontas): zip, prévia, **log de teste** (o que testar, resultado certo, o que ainda não está pronto).
3. **Sua recomendação** de o que fazer a seguir **e de qual modelo usar** em cada próximo bloco (Fable, Opus ou Sonnet), para eu gastar o plano com sabedoria.
4. Português simples. Sem enrolação. Se algo for incerto, diga "não sei" e como descobrir.
