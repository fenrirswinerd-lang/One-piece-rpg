# Log de teste: sprites dos navios e efeitos (batalha naval)

## O que mudou
- Os navios no mapa agora usam as imagens que você gerou: Marinha, Pirata e Mercante (o genérico).
- Cada navio troca de imagem sozinho: **inteiro** (mais de 50% de PV), **danificado** (50% ou menos), **mastro quebrado** (quando você marca o mastro destruído) e **afundando** (PV 0).
- O navio ganha um anel pontilhado na cor do lado: dourado = bando, vermelho = inimigo, cinza = neutro. Dourado cheio = navio escolhido.
- Esteira de espuma (imagem do efeito) atrás do navio que está andando.
- Efeitos no tiro (só na sua tela, somem em ~2 s): clarão no canhão, bala viajando até o alvo, explosão se acertou, respingo se errou, corrente se foi bala acorrentada, arpão voando se foi arpão. Colisão faz uma explosão no meio.
- Novo campo **Aparência** ao pôr o navio no mapa e na ficha do navio (Marinha, Pirata, Mercante). Se deixar "Automática": inimigo = pirata; bando e neutro = mercante.
- O "Pôr o navio do bando" usa o Mercante, como provisório até existir o PNG do navio de vocês.
- Os navios ficaram maiores no mapa (só visual; a distância em metros não mudou). No zoom "Longo alcance" eles crescem um pouco para não sumir.

## O que testar
1. Aba **Mar e progresso**: ponha 3 navios, um de cada aparência. Os três devem aparecer como figuras pixel art, sem fundo magenta nem borda rosa.
2. Dê dano até ficar com 50% ou menos: o navio mostra buracos e fogo. Marque "mastro destruído" (em Ficha do navio): aparece o mastro caído. Leve a 0 PV: o navio inclina e afunda, e fica apagado.
3. Atire de um navio em outro (pela lateral): você deve ver clarão, bala indo, e explosão ou respingo. Tudo some sozinho.
4. Mude a Aparência na ficha de um navio: a imagem troca na hora.
5. Ligue "Mostrar esta aba para os jogadores": eles devem ver os mesmos sprites (sem os efeitos de tiro, que só você vê).

## Resultado certo
- Mapa sem erro no console; os navios giram para onde apontam; a proa (figura de proa) fica sempre na frente.
- Nada de fundo roxo/rosa em volta dos navios.

## O que ainda não está pronto
- Sem o PNG do navio do bando: ele usa o Mercante (aparência "Mercante / genérico").
- O efeito de fogo (quadro 5 dos efeitos) não está ligado a nada ainda; os navios danificados já têm fogo no desenho.
- Os efeitos não aparecem para os jogadores (só quem atira vê). Se quiser, dá para publicar junto.
- Canhão de Energia, tripulação mínima e Reparo Emergencial continuam fora.
