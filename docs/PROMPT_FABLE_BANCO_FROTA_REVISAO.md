# Pedido para o Fable: banco do bando, upgrades, frota e revisão das abas

Cole este arquivo inteiro no Fable. Anexe também: `PLANO_NAVAL_REVIEW.md`, `HOMEBREW_FROTA_FAISCAS.md`, `REVISAO_ABAS_PLANO.md`, o zip do site e o Livro do Jogador 2.1 (capítulos 13 e 14, páginas 297–322).

## Quem sou e como trabalho
Sou o Fenrir (brasileiro). Narro One Piece RPG (OP RPG: Livro do Jogador 2.1 = LJ, Guia do Narrador 2.0 = GN, Manual dos Inimigos = MI). O site "Mesa One Piece" é a nossa tela compartilhada (o Discord não tem vídeo no Brasil). Netlify + Firebase, JavaScript puro em `src/app/*.js`, build com `python3 build.py`.
Fale comigo em **português simples e curto**.

## Regras fixas (não quebre)
- **Custo zero.** Nada de API paga e nenhuma IA rodando dentro do site.
- **Pergunte antes de criar estrutura nova** (tabela, lista, categoria, controle). Eu aprovo ou corto.
- **Eu decido o que é lore e o que é regra da casa.** O que for ideia sua, marque como **[NOSSO]** e espere meu sim.
- Não crie conteúdo de personagem de jogador. Só navio, peças, PdNs, figurantes, lugares.
- Não invente cenas, falas prontas nem sequência de eventos. Dê só faíscas curtas e abertas quando eu pedir ideia.
- Arte: pode ter clima de One Piece, mas sem copiar personagem, bandeira ou cena oficial. Não quero ficar fazendo sprite toda hora: use os ícones e peças que já existem.
- **Pixel art** e a estética atual ficam. A estética está ótima.
- Cada entrega vem com **log**: o que testar, qual o resultado certo e o que ainda não está pronto.
- Entre um bloco e outro, **diga se recomenda baixar ou manter o nível de esforço do modelo**.
- Teste com os scripts que já existem (fumaça das rotas, macaco de cliques, jogador e mestre, tema claro e escuro). Zero erros.

## Fatos do site que você precisa saber (já conferi)
- **Cada jogador já tem Carteira** em Inventário (Berries com histórico "Gastos e ganhos"). O banco do bando deve **tirar da Carteira** de quem deposita.
- **Navio** (`71-navio.js`): tamanho + madeira preenchem PV/CR/BR/velocidade. Armas e cômodos são só texto. `Mesa/navio` e histórico de mudanças existem.
- **Batalha naval** (`79*`): já faz iniciativa, manobras, âncora, mastro, tiro, colisão, arpão, eventos do mar, efeitos e sons. Os jogadores só olham.
- **Lojas** (`72-lojas.js`): mestre monta e abre a loja da ilha, com preços do livro.
- **Tripulação** (`92-publico.js`): capitão, recompensa e textos. Sem funções nem efetivo.
- Diário da sessão (`88`), Escudo de lore (`77`), Guia de lore (`97`), Onde acho o quê (`78`) já existem.
- A mesa online tem lugares dos jogadores, dados com física e palco (v25–v27).

## O que eu quero (em blocos, nesta ordem)

### Bloco 1: Banco do bando
Os jogadores **depositam parte dos Berries** no banco do bando, sempre que quiserem. Do banco saem **os upgrades do navio e da tripulação**.
- Proponha o desenho e **me pergunte** antes de construir: depósito manual livre, ou uma regra de porcentagem (ex.: parte de cada ganho)? Quem pode sacar? O mestre aprova toda saída?
- Mostrar: saldo, quem depositou quanto, histórico, meta ("falta ฿ X para...").
- Despesas semanais dos cômodos saem do banco (regra do LJ: cômodo sem pagamento perde o benefício).
- O mestre libera a aba quando o bando estiver pronto (como Jornal e Tripulação).

### Bloco 2: Upgrades do navio e da tripulação
Use o plano de `PLANO_NAVAL_REVIEW.md` (blocos A, C e D). Resumo:
- Navio montado por **peças** (LJ cap. 14, páginas 308–322): madeira, fortificação, mastros, leme, âncora, motor, canhões, cômodos. Comprar pronto ou construir (carpinteiro/engenheiro).
- O site **calcula** CR, BR, PV, velocidade, máximo de canhões e cômodos.
- **Tripulação**: funções (LJ 13.2), efetivo mínimo e necessário (13.3), contratar PdNs, cozinha, treino. **Upgrade de tripulação** = contratar gente, abrir cômodos de treino, pagar despesas.
- Todo pagamento sai do banco.
- Confira as tabelas **página por página** antes de gravar (algumas se repetem com valores diferentes).

### Bloco 3: Frotas sem dor de cabeça
Veja `HOMEBREW_FROTA_FAISCAS.md`. A ideia: eu quero **frotas e navios de figurantes** que existam sem eu desenvolver nada, e que **virem cena de destaque só quando eu der ênfase na narrativa**.
- O nome do livro para quem comanda um navio do bando é **Comandante de Divisão** (LJ 13.2).
- Um navio de frota deve caber em **uma linha**: nome, tamanho, comandante (figurante), estado, missão.
- Combate de frota em **dois modos**: resolução rápida (uma rolagem) e "zoom" (vira a Batalha naval completa).
- Clima de **Black Flag**: caçar navios, abordar, saquear, fortes, melhorar o navio com recursos, mandar a frota em missão.
- **Pergunte-me antes** de montar o sistema. Eu quero escolher entre os caminhos.
- Se quiser sugerir homebrew para dar clima cinematográfico (lore e narrativa, não só conta), marque **[NOSSO]**.

### Bloco 4: Figurantes rápidos
Uma forma de ter **figurantes e PdNs para improvisar** com pouquíssimo trabalho (nome, cara, um traço, pode virar importante depois se eu der ênfase). Pergunte antes de criar a estrutura. Reaproveite o que já existe (Mundo > NPCs, Inimigos, rostos de pixel art novos).

### Bloco 5: Revisão e compactação das abas
Veja `REVISAO_ABAS_PLANO.md`. Faça a **auditoria primeiro e me mostre** antes de mexer. Objetivo: menos abas repetidas, mais prático, **mesma estética**, fácil de adicionar coisa nova.
- Incluo a **aba de lore dos jogadores** ("o resumo de lore está fraco"): melhore.
- Inclua o **resumo da sessão 1**: preciso de um jeito de escrever e guardar o resumo de cada sessão (o Diário da sessão tem "Copiar resumo"; avalie se basta ou o que falta). Eu te passo as anotações.

### Bloco 6: Faíscas para "a visão de One Piece" (só se eu pedir)
Estou procurando o que falta para dar o clima de aventura e caricatura do One Piece (ilhas exageradas, bandos rivais, comida, cartazes, manchetes). **Só 2 ou 3 faíscas curtas e abertas**, sem roteiro.

## Como entregar
1. Primeiro me devolva **perguntas e 2 ou 3 caminhos curtos** para os blocos 1, 3 e 4 (nada construído).
2. Eu respondo. Aí você constrói o bloco 1, depois o 2, e assim por diante, cada um com log.
3. Gere o zip do site e os logs ao final de cada bloco.
