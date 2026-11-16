# O que mudou e como testar (10/11, tarde)

## 1. Tirar jogador de todas as abas
**O problema:** quando você removia alguém no Grupo, o site punha a pessoa de volta sozinho, porque os dados dela continuavam no banco. E nas outras abas ela nunca saía.

**Agora:** um botão só tira a pessoa de tudo: Abas dos jogadores, Grupo, luta, Tripulação, Recompensas, Mural e Viagem.
- Onde clicar (qualquer um dos três):
  - **Abas dos jogadores** › botão "Tirar (nome) da mesa", à direita dos nomes.
  - **Grupo** › editar o jogador › "Remover jogador".
  - **Ajustes** › Jogadores liberados › "Tirar".
- Aparecem duas opções: **Só tirar** (guarda ficha e diário) ou **Tirar e apagar tudo dele**.
- Quem foi "só tirado" fica em Ajustes › "Quem saiu da mesa", com **Trazer de volta** e **Apagar dados**.
- Funciona até com a sua própria conta (se você entrou como jogador para testar): ela some das abas e você continua entrando como mestre.

**Resultado certo:** depois de tirar, o nome não aparece em nenhuma aba. "Trazer de volta" devolve a pessoa com a ficha.

**Atenção:** não precisa mexer nas regras do Firebase para isso.

## 2. Batalha naval (PROTÓTIPO, só o mestre vê)
Menu › Mar e progresso › **Batalha naval**. Jogador não vê no menu nem abrindo pelo endereço.

Como usar:
1. "Pôr o navio do bando" (puxa os números da aba Navio) e "Pôr navio" para os inimigos (tamanho e madeira preenchem PV, CR, BR, velocidade e canhões pelo livro).
2. Arraste os navios no mapa. Na "Ficha do navio" dá para girar e mudar qualquer número.
3. "Rolar iniciativa" (Presença do capitão). Em cada turno: uma Ação de Manobra, uma Ação de Combate e o movimento. "Encerrar o turno" anda o navio sozinho se você não andou.
4. "Atirar": o site rola os ataques, tira o BR e baixa o PV do alvo. Tudo fica no Registro da batalha.

O que já segue o livro (LJ p. 314–317, GN p. 70):
- Movimento contínuo (cada 2 nós = 1,5 m por rodada) e corrente do mar (níveis 0 a 3).
- Manobras: virar até 45°, mudar até 6 nós, âncora (andar com ela baixa dá 8d10 por 6 nós).
- Ataque: d20 + Presença do capitão ou Destreza do atirador + bônus da arma, contra a CR. Além do alcance normal, desvantagem.
- Mais de 3 canhões: Bombardeio ou Tiros de Teste.
- Canhões Comum, Aprimorado, Superior (dobro), Longo Alcance (metade), Lançador de Arpão (prende a 90 m).
- Munição: Bola de Chumbo, Explosiva, Acorrentada (mastro, Estrutura CD 17), Estilhaços.
- Casco danificado tira velocidade; colisão acima de 14 nós; Proteger o navio (+1 a +3 na CR); Evento do mar (d6).
- "Só navegar +1 / +10 rodadas": para a aproximação, sem gastar turno.
- Desfazer do site (seta no topo) volta a última ação da batalha.

**Não é do livro (só ajuda visual, não trava nada):** o tamanho dos navios no mapa e o leque claro dos lados. O livro só diz que o canhão precisa estar "apontado para o alvo": você decide.

**Ainda não está pronto:**
- Os jogadores verem o mapa.
- Sprites: os navios são desenhos simples, esperando os sprite sets.
- Canhão de Energia, tripulação mínima para manobrar e atirar, Reparo Emergencial do carpinteiro.
- Crítico (20 natural) dobra os dados de dano: usei a regra geral de ataque; o capítulo de navio não fala disso. Se não quiser, me avise.

## Testes feitos
- Tirar jogador: some das 5 abas, volta com "Trazer de volta", apaga pelo Grupo. Sem erros.
- Batalha naval: pôr navios, arrastar, iniciativa, virar, bloquear 2ª manobra, atirar, bola acorrentada, âncora, colisão, evento, navegar 10 rodadas, dano, trocar o mapa, recarregar a página (a batalha continua lá), jogador sem acesso. Sem erros.
- Regressão geral (l12): TUDO OK.
