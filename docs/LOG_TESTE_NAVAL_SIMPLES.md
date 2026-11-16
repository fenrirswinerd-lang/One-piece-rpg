# Batalha naval simplificada + barra de vida (10/11, 13h)

## 1. A barra de vida de todo o site
**O que era:** o enchimento colorido estava sem posição no CSS, então ele ignorava a margem e ficava mais grosso que a moldura de latão, passando por cima dela.

**Agora:** o enchimento fica 4 px dentro da moldura, em cima e embaixo. Vale para PV, PP e XP em todas as abas.

**Onde conferir:** Barra de Bônus, Grupo, Combate e a ficha do jogador.

## 2. Batalha naval: o que mudou
Simplifiquei para você não precisar fazer conta nenhuma.

- **Acabou a conta dos nós.** Em todo lugar o site já diz **quantos metros o navio anda por rodada**. Os nós ficam numa letrinha embaixo, só para conferência: "16 nós (10 do navio + 6 da corrente)".
- **Velocidade em 4 botões:** Parar, Devagar, Meio e Cheia. Cada botão mostra onde o navio vai chegar. Se o livro não deixar chegar lá de uma vez (máximo 6 nós por manobra), o botão mostra "→ 4 nós" em vez do valor cheio.
- **O turno virou 3 passos numerados:** 1 Manobra, 2 Tiro, 3 Fim do turno. Cada passo ganha a marca "feito" quando você usa.
- **Direção em palavras:** "rumo ao leste" em vez de graus. A bússola do mapa diz para onde a corrente está indo.
- **O contorno claro à frente** de cada navio mostra onde ele vai estar no fim da rodada. É o jeito de ver o movimento contínuo sem ter que imaginar.
- **Caixa "Como funciona"**, cinco linhas, em cima da tela. A primeira explica o que te incomodava: isto vale só quando dois navios se enfrentam, viajar continua na aba Viagem.
- **O zoom do mapa agora diz para que serve:** Abordagem (300 m, navios colados), Canhão (600 m, alcance normal) e Longo alcance (1,2 km).
- **"+10 (1 min)" virou "avançar 1 minuto"**, com o rótulo "Ainda longe:" do lado. Serve para aproximar os navios sem gastar turno de ninguém.

## 3. Tiro só pela lateral (sua ideia)
Chave no topo da aba, **ligada** por padrão. Com ela:
- O canhão só atira se o alvo estiver pela **bombordo ou estibordo**. Se estiver pela proa ou pela popa, o site avisa e não deixa atirar.
- O **arpão** atira para qualquer lado (o livro diz que ele é móvel).
- A área clara no mapa mostra onde os canhões do navio escolhido apontam.
- O texto embaixo do alvo diz por qual lado ele está e se dá para atirar.

Isso dá sentido a virar o navio, que antes era quase enfeite. É regra da casa: o livro só diz que o canhão precisa estar "apontado para o alvo" e deixa a decisão com o narrador. Para desligar, é só desmarcar a chave.

## 4. Registro da batalha
- **Separado por rodada**, com o título "Rodada 2" grudado no topo enquanto você rola.
- **Avisa quando passa a vez:** "▸ Agora é a vez de X", em destaque amarelo.
- **Cores:** tiro e colisão em vermelho, evento do mar em azul, troca de turno em amarelo.
- **Botão "Limpar o registro"** no fim da lista. Limpa só o texto; os navios e as posições continuam.

## 5. Mostrar aos jogadores
Chave no topo: **"Mostrar esta aba para os jogadores"**.
- Ligada: a aba aparece no menu deles com o mapa, a lista de navios e o registro. **Só de olhar**, sem nenhum botão.
- Desligada: a aba some do menu deles na hora.
- Não precisa mexer nas regras do Firebase: a batalha vai para `mesa/naval`, que as regras que você já publicou cobrem.

## 6. Mastro destruído
A bola acorrentada derruba o mastro, mas **o livro não diz o que isso faz**. Pus uma regra da casa: **sem mastro, a velocidade máxima cai pela metade**. Está marcado na tela e no registro. Se preferir outra coisa (o navio só andar com a corrente, por exemplo), me avise.

## Testes feitos
- Barra de vida medida em Grupo, Barra de Bônus e Batalha naval: enchimento 4 px dentro da moldura, em cima e embaixo.
- Naval: pôr navios, arrastar, iniciativa, tiro barrado pela proa, virar, tiro liberado pela lateral, bloqueio da segunda manobra, passar a vez, velocidade Cheia, limpar registro.
- Publicar para o jogador: ele vê mapa e registro, com **zero** botões de ação. Desligando, a aba some do menu dele.
- Regressão geral do site (l12): TUDO OK.

## O que ainda não está pronto
- Sprites: os navios continuam desenhos simples, esperando os sprite sets.
- Canhão de Energia, tripulação mínima para manobrar e atirar, Reparo Emergencial do carpinteiro.
- Os prompts de pixel art ainda não foram escritos (ficaram para o próximo bloco).
